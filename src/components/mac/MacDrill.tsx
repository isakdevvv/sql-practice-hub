import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Lightbulb,
  RotateCcw,
  Check,
  Apple,
  BookOpen,
  Dumbbell,
  CheckCircle2,
  XCircle,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MAC_TOPICS, validate, type MacTopic } from "@/lib/mac/types";
import { MAC_TUTORIALS } from "@/lib/mac/tutorials";
import { MAC_EXERCISES } from "@/lib/mac/exercises";

type Mode = "lar" | "test";

const PROGRESS_KEY = "mac-drill-progress-v1";
const MODE_KEY = "mac-drill-mode-v1";

function loadProgress(): Record<string, true> {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveProgress(p: Record<string, true>) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

function loadMode(): Mode {
  if (typeof localStorage === "undefined") return "lar";
  const v = localStorage.getItem(MODE_KEY);
  return v === "test" ? "test" : "lar";
}

function saveMode(m: Mode) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(MODE_KEY, m);
}

export function MacDrill() {
  const [activeTopic, setActiveTopic] = useState<MacTopic>("applescript-basis");
  const [mode, setMode] = useState<Mode>(() => loadMode());
  const [progress, setProgress] = useState<Record<string, true>>(() => loadProgress());

  useEffect(() => saveMode(mode), [mode]);

  const topicMeta = MAC_TOPICS.find((t) => t.id === activeTopic)!;

  const tutorials = useMemo(
    () => MAC_TUTORIALS.filter((t) => t.topic === activeTopic),
    [activeTopic],
  );
  const exercises = useMemo(
    () => MAC_EXERCISES.filter((e) => e.topic === activeTopic),
    [activeTopic],
  );

  const totalEx = MAC_EXERCISES.length;
  const solvedCount = Object.keys(progress).length;

  function markSolved(id: string) {
    const next = { ...progress, [id]: true as const };
    setProgress(next);
    saveProgress(next);
  }

  function clearAllProgress() {
    if (!confirm("Nullstille alle løste øvelser?")) return;
    setProgress({});
    saveProgress({});
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Apple className="h-6 w-6 text-brand" />
            Mac-automatisering
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Lær AppleScript, Shortcuts, Automator og terminal-automatisering på Mac. Velg et
            tema og bytt mellom <strong>Lær</strong> (gjennomgang) og <strong>Test deg selv</strong>{" "}
            (øvelser med mønster-sjekk).
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="rounded-md border border-border bg-card px-3 py-1.5 text-xs">
            <CheckCircle2 className="inline h-3.5 w-3.5 mr-1 text-success" />
            <span className="font-semibold tabular-nums">{solvedCount}</span>
            <span className="text-muted-foreground"> / {totalEx} øvelser løst</span>
          </div>
          <Button onClick={clearAllProgress} size="sm" variant="ghost" className="text-xs">
            Nullstill
          </Button>
        </div>
      </div>

      {/* Topic-bar */}
      <div className="mb-5 flex flex-wrap gap-2">
        {MAC_TOPICS.map((t) => {
          const tutCount = MAC_TUTORIALS.filter((x) => x.topic === t.id).length;
          const exCount = MAC_EXERCISES.filter((x) => x.topic === t.id).length;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTopic(t.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs transition-colors flex items-center gap-1.5",
                activeTopic === t.id
                  ? "bg-brand text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
              <span className="text-[10px] opacity-70">
                ({tutCount}+{exCount})
              </span>
            </button>
          );
        })}
      </div>

      {/* Topic-meta + mode-velger */}
      <div className="mb-5 rounded-xl border border-border bg-card/50 p-4">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
          <div className="flex-1 min-w-[280px]">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <span>{topicMeta.emoji}</span>
              <span>{topicMeta.label}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1">{topicMeta.beskrivelse}</p>
          </div>
          <div className="flex rounded-md border border-border overflow-hidden">
            <button
              onClick={() => setMode("lar")}
              className={cn(
                "px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors",
                mode === "lar"
                  ? "bg-brand text-white"
                  : "bg-background hover:bg-muted",
              )}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Lær ({tutorials.length})
            </button>
            <button
              onClick={() => setMode("test")}
              className={cn(
                "px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors border-l border-border",
                mode === "test"
                  ? "bg-brand text-white"
                  : "bg-background hover:bg-muted",
              )}
            >
              <Dumbbell className="h-3.5 w-3.5" />
              Test deg selv ({exercises.length})
            </button>
          </div>
        </div>
      </div>

      {mode === "lar" ? (
        <TutorialList tutorials={tutorials} />
      ) : (
        <ExerciseDeck
          exercises={exercises}
          progress={progress}
          onSolved={markSolved}
          topicKey={activeTopic}
        />
      )}
    </main>
  );
}

/* ============================================================ */
/* Tutorial-list                                                */
/* ============================================================ */

function TutorialList({ tutorials }: { tutorials: typeof MAC_TUTORIALS }) {
  if (!tutorials.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Ingen leksjoner her enda.
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {tutorials.map((tut) => (
        <article
          key={tut.id}
          className="rounded-xl border border-border bg-card overflow-hidden"
        >
          <header className="px-5 py-4 border-b border-border bg-card/50">
            <h3 className="text-lg font-semibold">{tut.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{tut.tagline}</p>
            {tut.takeaways.length > 0 && (
              <ul className="mt-3 space-y-1">
                {tut.takeaways.map((tk, i) => (
                  <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                    <Check className="h-3 w-3 text-success mt-0.5 shrink-0" />
                    <span>{tk}</span>
                  </li>
                ))}
              </ul>
            )}
          </header>
          <div className="px-5 py-4 space-y-5">
            {tut.sections.map((sec, idx) => (
              <section key={idx}>
                <h4 className="text-sm font-semibold text-foreground mb-1.5">
                  {sec.heading}
                </h4>
                {sec.body && <ParagraphBlock body={sec.body} />}
                {sec.example && (
                  <CodeExample
                    language={sec.example.language}
                    code={sec.example.code}
                    runHint={sec.example.runHint}
                  />
                )}
              </section>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function ParagraphBlock({ body }: { body: string }) {
  // Split på dobbel newline = paragraph. Inline `kode` → <code>.
  const paragraphs = body.split(/\n\n+/);
  return (
    <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-wrap">
          {renderInline(p)}
        </p>
      ))}
    </div>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  // Match både `code` og **bold**.
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      out.push(
        <code
          key={key++}
          className="font-mono text-[12px] rounded bg-muted px-1 py-0.5 text-foreground"
        >
          {m[1].slice(1, -1)}
        </code>,
      );
    } else if (m[2]) {
      out.push(
        <strong key={key++} className="text-foreground">
          {m[2].slice(2, -2)}
        </strong>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function CodeExample({
  language,
  code,
  runHint,
}: {
  language: string;
  code: string;
  runHint?: string;
}) {
  const labelMap: Record<string, string> = {
    applescript: "AppleScript",
    shell: "Shell (zsh/bash)",
    shortcuts: "Shortcuts",
  };
  return (
    <div className="mt-3 rounded-md border border-border bg-background/80 overflow-hidden">
      <div className="px-3 py-1.5 border-b border-border bg-muted/40 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Terminal className="h-3 w-3" />
          {labelMap[language] ?? language}
        </span>
      </div>
      <pre className="px-3 py-3 text-[12px] font-mono whitespace-pre-wrap overflow-x-auto text-foreground/90">
        {code}
      </pre>
      {runHint && (
        <div className="px-3 py-2 border-t border-border bg-amber-500/5 text-[11px] text-muted-foreground flex items-start gap-1.5">
          <Lightbulb className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
          <span>{runHint}</span>
        </div>
      )}
    </div>
  );
}

/* ============================================================ */
/* Exercise-deck                                                */
/* ============================================================ */

function ExerciseDeck({
  exercises,
  progress,
  onSolved,
  topicKey,
}: {
  exercises: typeof MAC_EXERCISES;
  progress: Record<string, true>;
  onSolved: (id: string) => void;
  topicKey: MacTopic;
}) {
  const [idx, setIdx] = useState(0);
  const [code, setCode] = useState("");
  const [hintShown, setHintShown] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [checked, setChecked] = useState(false);

  const exercise = exercises[idx % Math.max(exercises.length, 1)];

  // Reset state når topic eller exercise endres
  useEffect(() => {
    setIdx(0);
  }, [topicKey]);

  useEffect(() => {
    if (!exercise) return;
    setCode(exercise.starter);
    setHintShown(false);
    setRevealed(false);
    setChecked(false);
  }, [exercise?.id]);

  if (!exercise) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Ingen øvelser her enda.
      </div>
    );
  }

  const result = validate(code, exercise.checks);
  const solved = progress[exercise.id];

  function check() {
    setChecked(true);
    if (result.ok) onSolved(exercise.id);
  }

  function reset() {
    setCode(exercise.starter);
    setHintShown(false);
    setRevealed(false);
    setChecked(false);
  }

  function goto(delta: number) {
    setIdx((i) => (i + delta + exercises.length) % exercises.length);
  }

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-4">
      <div className="space-y-4">
        {/* Oppgave */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                Nivå {exercise.level}
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                {exercise.language}
              </Badge>
              {solved && (
                <Badge className="text-[10px] bg-success/15 text-success border-success/40">
                  <Check className="h-3 w-3 mr-1" /> Løst
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {idx + 1} av {exercises.length}
            </span>
          </div>
          <h2 className="text-lg font-semibold leading-tight">{exercise.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{exercise.prompt}</p>

          {exercise.context && (
            <div className="mt-3 text-xs text-muted-foreground rounded-md border border-border bg-background/60 p-2.5">
              {renderInline(exercise.context)}
            </div>
          )}

          {hintShown && (
            <div className="mt-3 flex items-start gap-2 text-xs rounded-md border border-amber-500/40 bg-amber-500/5 p-2.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">Hint:</span> {exercise.hint}
              </span>
            </div>
          )}

          {revealed && (
            <div className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/5 p-3">
              <div className="flex items-center gap-2 text-amber-500 text-xs font-medium">
                <Eye className="h-3.5 w-3.5" /> Foreslått løsning
              </div>
              <pre className="mt-2 font-mono text-[12px] whitespace-pre-wrap text-foreground">
                {exercise.solution}
              </pre>
              <p className="mt-2 text-xs text-muted-foreground">{exercise.explanation}</p>
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-3 py-1.5 border-b border-border bg-muted/40 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3 w-3" />
              Ditt svar — {exercise.language}
            </span>
            <span className="text-[10px] normal-case">
              Pattern-sjekk (ikke ekte kjøring)
            </span>
          </div>
          <Textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (checked) setChecked(false);
            }}
            placeholder={
              exercise.starter ? undefined : "Skriv svaret ditt her…"
            }
            spellCheck={false}
            className="font-mono text-[13px] min-h-[180px] rounded-none border-0 focus-visible:ring-0 resize-y"
          />
        </div>

        {/* Sjekk-resultat */}
        {checked && (
          <div
            className={cn(
              "rounded-xl border p-4",
              result.ok
                ? "border-success/40 bg-success/5"
                : "border-destructive/40 bg-destructive/5",
            )}
          >
            <div
              className={cn(
                "text-sm font-semibold flex items-center gap-2",
                result.ok ? "text-success" : "text-destructive",
              )}
            >
              {result.ok ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Alle krav oppfylt — bra jobbet!
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Noen krav mangler
                </>
              )}
            </div>
            <ul className="mt-3 space-y-1.5 text-xs">
              {result.passed.map((p, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex items-start gap-2",
                    p.ok ? "text-muted-foreground" : "text-destructive/90",
                  )}
                >
                  {p.ok ? (
                    <Check className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                  )}
                  <span>{p.check.explain}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action-bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={check} size="sm" className="gap-1.5">
            <Check className="h-3.5 w-3.5" /> Sjekk
          </Button>
          <Button
            onClick={() => setHintShown(true)}
            size="sm"
            variant="outline"
            disabled={hintShown}
            className="gap-1.5"
          >
            <Lightbulb className="h-3.5 w-3.5" /> Hint
          </Button>
          <Button
            onClick={() => setRevealed(true)}
            size="sm"
            variant="outline"
            disabled={revealed}
            className="gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" /> Vis løsning
          </Button>
          <Button onClick={reset} size="sm" variant="ghost" className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Tilbakestill
          </Button>
          <div className="ml-auto flex items-center gap-1">
            <Button
              onClick={() => goto(-1)}
              size="sm"
              variant="outline"
              className="px-2"
              aria-label="Forrige øvelse"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => goto(1)}
              size="sm"
              variant="outline"
              className="px-2"
              aria-label="Neste øvelse"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar: krav-liste */}
      <aside className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Krav til løsning
          </h3>
          <ul className="space-y-1.5">
            {result.passed.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                {p.ok ? (
                  <Check className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                ) : (
                  <span className="h-3.5 w-3.5 rounded border border-border mt-0.5 shrink-0" />
                )}
                <span
                  className={cn(
                    p.ok ? "text-foreground/70 line-through decoration-success/40" : "text-foreground/90",
                  )}
                >
                  {p.check.explain}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Hvordan teste på din Mac
          </h3>
          {exercise.language === "applescript" && (
            <p>
              Åpne <strong>Script Editor</strong> (i Utilities), lim inn koden og trykk{" "}
              <kbd className="border rounded px-1">⌘R</kbd>.
            </p>
          )}
          {exercise.language === "shell" && (
            <p>
              Åpne <strong>Terminal</strong> og lim inn linjene direkte. For multi-line script,
              lagre i en `.sh`-fil og kjør med <code className="font-mono">bash fil.sh</code>.
            </p>
          )}
          {exercise.language === "shortcuts" && (
            <p>
              Bygg snarveien i <strong>Shortcuts.app</strong>, gi den navnet du brukte i koden, så
              kjør terminal-kommandoen.
            </p>
          )}
          <p className="pt-1 border-t border-border/60">
            Vi sjekker bare <em>mønster</em> i koden — selve kjøringen skjer på din maskin.
          </p>
        </div>
      </aside>
    </div>
  );
}
