// Predict & Trace — Bloom-nivå Analyze/Evaluate.
//
// UX-flyt:
//   1) Studenten ser kode + (evt) datasett.
//   2) De MÅ skrive hva de tror output blir, før systemet kjører noe.
//   3) Når de trykker "Sjekk", kjører vi koden via runScript (Python) eller
//      runQuery (SQL) og sammenligner med prediksjonen.
//   4) Resultat-panelet viser "Du forutsa: X" vs "Faktisk: Y" + forklaring.
//
// Sammenligning er fuzzy: vi normaliserer whitespace, trimmer, og
// lowercaser før strenge-likhet. Vi viser brukerens svar uendret slik at
// de ser nøyaktig hva de skrev.

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PREDICT_EXERCISES,
  type PredictExercise,
  type PredictLanguage,
} from "@/lib/learn/predictExercises";
import { runScript } from "@/lib/python/runner";
import { runQuery } from "@/lib/engine/sqlEngine";
import {
  Check,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  RotateCcw,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DatasetId } from "@/lib/db/datasets";

export const Route = createFileRoute("/predict")({
  head: () => ({
    meta: [
      { title: "Predict & Trace — SQL Sandbox" },
      {
        name: "description",
        content:
          "Forutsi hva koden vil produsere FØR du kjører den. Trener analyse- og evaluering-nivå (Bloom).",
      },
    ],
  }),
  component: PredictPage,
});

const STORAGE_PROGRESS = "predict-progress-v1";

interface PredictProgress {
  solved: Record<string, true>;
  attempts: Record<string, number>;
}

function loadProgress(): PredictProgress {
  if (typeof window === "undefined") return { solved: {}, attempts: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_PROGRESS);
    if (!raw) return { solved: {}, attempts: {} };
    const parsed = JSON.parse(raw) as Partial<PredictProgress>;
    return {
      solved: parsed.solved ?? {},
      attempts: parsed.attempts ?? {},
    };
  } catch {
    return { solved: {}, attempts: {} };
  }
}

function saveProgress(p: PredictProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_PROGRESS, JSON.stringify(p));
}

// Normalisering for sammenligning: trim hver linje, fjern tomme linjer,
// kollaps mellomrom, og lowercase. Beholder strukturen så studenten kan
// skrive "1 4 9" eller "[1, 4, 9]" — vi sammenligner ord-for-ord.
function normalize(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim().replace(/\s+/g, " "))
    .filter((l) => l.length > 0)
    .join("\n")
    .toLowerCase();
}

function compare(user: string, actual: string): boolean {
  return normalize(user) === normalize(actual);
}

// Konverter et SQL-resultat til en tab-separert tabell slik at det matcher
// det vi har i `expected` i exercise-fila.
function sqlResultToText(cols: string[], rows: unknown[][]): string {
  const header = cols.join("\t");
  const body = rows
    .map((r) =>
      r
        .map((v) => (v === null || v === undefined ? "" : String(v)))
        .join("\t"),
    )
    .join("\n");
  return body ? `${header}\n${body}` : header;
}

function PredictPage() {
  const [language, setLanguage] = useState<PredictLanguage | "all">("all");
  const [activeId, setActiveId] = useState<string>(PREDICT_EXERCISES[0].id);
  const [progress, setProgress] = useState<PredictProgress>({
    solved: {},
    attempts: {},
  });

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const filtered = useMemo(() => {
    if (language === "all") return PREDICT_EXERCISES;
    return PREDICT_EXERCISES.filter((e) => e.language === language);
  }, [language]);

  const activeIdx = filtered.findIndex((e) => e.id === activeId);
  const active = filtered[activeIdx >= 0 ? activeIdx : 0] ?? PREDICT_EXERCISES[0];

  // Hvis filteret endres slik at active ikke er i lista, hopp til første i lista
  useEffect(() => {
    if (filtered.length === 0) return;
    if (!filtered.find((e) => e.id === activeId)) {
      setActiveId(filtered[0].id);
    }
  }, [filtered, activeId]);

  function goNext() {
    if (filtered.length === 0) return;
    const i = (activeIdx + 1) % filtered.length;
    setActiveId(filtered[i].id);
  }

  function goPrev() {
    if (filtered.length === 0) return;
    const i = (activeIdx - 1 + filtered.length) % filtered.length;
    setActiveId(filtered[i].id);
  }

  function onSolved(id: string) {
    setProgress((p) => {
      const next: PredictProgress = {
        solved: { ...p.solved, [id]: true as const },
        attempts: { ...p.attempts, [id]: (p.attempts[id] ?? 0) + 1 },
      };
      saveProgress(next);
      return next;
    });
  }

  function onAttempt(id: string) {
    setProgress((p) => {
      const next: PredictProgress = {
        solved: p.solved,
        attempts: { ...p.attempts, [id]: (p.attempts[id] ?? 0) + 1 },
      };
      saveProgress(next);
      return next;
    });
  }

  const solvedCount = filtered.filter((e) => progress.solved[e.id]).length;

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <SiteHeader />

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Sidebar: oppgaveliste */}
        <aside className="w-full lg:w-[300px] lg:shrink-0 lg:border-r border-b lg:border-b-0 border-border bg-card/40 flex flex-col max-h-[260px] lg:max-h-none lg:h-full overflow-hidden">
          <div className="p-3 border-b border-border bg-card/60 backdrop-blur-sm shrink-0 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5" /> Predict & Trace
              </h2>
              <span className="text-[11px] text-muted-foreground">
                {solvedCount}/{filtered.length} løst
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Forutsi hva koden vil produsere — FØR du kjører den. Bygger
              Analyse- og Evaluering-nivå (Bloom).
            </p>
            <select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value as PredictLanguage | "all")
              }
              className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">Alle språk</option>
              <option value="python">Python</option>
              <option value="sql">SQL</option>
            </select>
          </div>

          <div className="overflow-y-auto flex-1 min-h-0">
            <ol className="divide-y divide-border">
              {filtered.map((e, i) => {
                const isActive = e.id === active.id;
                const solved = progress.solved[e.id];
                return (
                  <li key={e.id}>
                    <button
                      onClick={() => setActiveId(e.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                        isActive
                          ? "bg-brand/10 border-l-2 border-l-brand"
                          : "border-l-2 border-l-transparent hover:bg-accent/40",
                      )}
                    >
                      <span className="text-[11px] tabular-nums text-muted-foreground w-6 text-right">
                        {i + 1}.
                      </span>
                      <span
                        className={cn(
                          "flex-1 truncate",
                          isActive
                            ? "text-foreground font-medium"
                            : "text-foreground/90",
                        )}
                      >
                        {e.title}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase",
                          e.language === "python"
                            ? "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                        )}
                      >
                        {e.language === "python" ? "PY" : "SQL"}
                      </span>
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                          solved
                            ? "border-success bg-success text-success-foreground"
                            : "border-border bg-background",
                        )}
                      >
                        {solved && <Check className="h-3 w-3" />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>

        {/* Workspace */}
        <PredictWorkspace
          key={active.id}
          exercise={active}
          position={{ current: activeIdx + 1, total: filtered.length }}
          alreadySolved={!!progress.solved[active.id]}
          onPrev={goPrev}
          onNext={goNext}
          onSolved={() => onSolved(active.id)}
          onAttempt={() => onAttempt(active.id)}
        />
      </div>
    </div>
  );
}

function PredictWorkspace({
  exercise,
  position,
  alreadySolved,
  onPrev,
  onNext,
  onSolved,
  onAttempt,
}: {
  exercise: PredictExercise;
  position: { current: number; total: number };
  alreadySolved: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSolved: () => void;
  onAttempt: () => void;
}) {
  const [prediction, setPrediction] = useState("");
  const [running, setRunning] = useState(false);
  const [actual, setActual] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<"match" | "miss" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  function reset() {
    setPrediction("");
    setActual(null);
    setVerdict(null);
    setError(null);
    setShowExplanation(false);
  }

  async function handleCheck() {
    if (!prediction.trim()) {
      setError("Du må skrive en prediksjon før du kan sjekke.");
      return;
    }
    setRunning(true);
    setError(null);
    onAttempt();

    try {
      let actualText = "";
      if (exercise.language === "python") {
        const out = await runScript(exercise.code);
        if (!out.ok) {
          setError(out.error ?? "Python-kjøring feilet");
          setActual(exercise.expected);
          setVerdict(null);
          setRunning(false);
          return;
        }
        actualText = (out.stdout ?? "").trimEnd();
      } else {
        // SQL
        const dataset = (exercise.dataset ?? "ecommerce") as DatasetId;
        const out = await runQuery(exercise.code, dataset, { mode: "select" });
        if (!out.success || !out.result) {
          setError(out.error ?? "SQL-kjøring feilet");
          setActual(exercise.expected);
          setVerdict(null);
          setRunning(false);
          return;
        }
        actualText = sqlResultToText(out.result.columns, out.result.rows);
      }

      setActual(actualText);
      const ok = compare(prediction, actualText);
      setVerdict(ok ? "match" : "miss");
      setShowExplanation(true);
      if (ok) onSolved();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-hidden">
      {/* Topbar */}
      <div className="flex items-center justify-between border-b border-border bg-card/40 px-4 py-1.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">{exercise.title}</h2>
          {alreadySolved && (
            <Badge variant="secondary" className="text-[10px]">
              <Check className="h-3 w-3 mr-0.5" /> Løst
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Button
            size="sm"
            variant="ghost"
            onClick={onPrev}
            className="h-7 w-7 p-0"
            title="Forrige"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="tabular-nums text-[11px]">
            {position.current} / {position.total}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={onNext}
            className="h-7 w-7 p-0"
            title="Neste"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Badge variant="outline" className="text-[10px] ml-2 uppercase">
            {exercise.language}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            Vanskelighet {exercise.difficulty}/5
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-5 space-y-5">
          {/* Prompt */}
          <div>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {exercise.prompt}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {exercise.topics.map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px]">
                  {t}
                </Badge>
              ))}
              {exercise.dataset && (
                <Badge variant="outline" className="text-[10px]">
                  dataset: {exercise.dataset}
                </Badge>
              )}
            </div>
          </div>

          {/* Kode */}
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
              Kode
            </div>
            <pre className="rounded-md bg-[#1e1e1e] p-4 text-xs font-mono text-foreground/90 overflow-auto border border-border whitespace-pre">
              {exercise.code}
            </pre>
          </div>

          {/* Prediksjonsfelt */}
          <div>
            <label
              htmlFor="prediction"
              className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold"
            >
              Din prediksjon — hva blir output?
            </label>
            <textarea
              id="prediction"
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              disabled={running || verdict !== null}
              rows={5}
              placeholder={
                exercise.language === "python"
                  ? "Skriv hva print() vil skrive ut, linje for linje…"
                  : "Skriv resultat-tabellen, kolonner på første linje, deretter rader…"
              }
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Vi normaliserer whitespace og ignorerer case når vi sammenligner —
              fokuser på innholdet, ikke nøyaktig formattering.
            </p>
          </div>

          {/* Kontroll-knapper */}
          <div className="flex items-center gap-2">
            {verdict === null ? (
              <Button onClick={handleCheck} disabled={running}>
                {running ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Kjører…
                  </>
                ) : (
                  "Sjekk"
                )}
              </Button>
            ) : (
              <>
                <Button onClick={reset} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Prøv på nytt
                </Button>
                <Button
                  onClick={() => {
                    reset();
                    onNext();
                  }}
                >
                  Neste
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </>
            )}
            {error && (
              <span className="text-xs text-destructive font-mono ml-2">
                {error}
              </span>
            )}
          </div>

          {/* Resultat-panel */}
          {actual !== null && (
            <div
              className={cn(
                "rounded-md border p-4 space-y-3",
                verdict === "match"
                  ? "border-success/50 bg-success/10"
                  : verdict === "miss"
                    ? "border-destructive/50 bg-destructive/10"
                    : "border-border bg-card/40",
              )}
            >
              <div className="flex items-center gap-2">
                {verdict === "match" ? (
                  <>
                    <Check className="h-5 w-5 text-success" />
                    <span className="font-semibold text-success">
                      Riktig! Du forutsa rett.
                    </span>
                  </>
                ) : verdict === "miss" ? (
                  <>
                    <X className="h-5 w-5 text-destructive" />
                    <span className="font-semibold text-destructive">
                      Ikke helt — se forskjellen under.
                    </span>
                  </>
                ) : (
                  <span className="font-semibold">Kunne ikke sammenligne</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                    Du forutsa
                  </div>
                  <pre className="rounded-md bg-background border border-border p-3 text-xs font-mono whitespace-pre-wrap min-h-[80px]">
                    {prediction || "(tomt)"}
                  </pre>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                    Faktisk
                  </div>
                  <pre className="rounded-md bg-background border border-border p-3 text-xs font-mono whitespace-pre-wrap min-h-[80px]">
                    {actual || "(tomt output)"}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Forklaring */}
          {showExplanation && (
            <div className="rounded-md border border-brand/40 bg-brand/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-brand" />
                <span className="font-semibold text-sm">Forklaring</span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {exercise.explanation}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
