import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PythonEditor } from "@/components/python/PythonEditor";
import { VariableInspector } from "@/components/python/VariableInspector";
import { PY_EXERCISES } from "@/lib/python/exercises";
import { runScript, runScriptStepwise } from "@/lib/python/runner";
import { loadPyProgress, markPySolved, resetPyProgress, type PyProgress } from "@/lib/python/pyProgress";
import { levelOf, PY_LEVEL_NAMES, type PyLevel } from "@/lib/python/types";
import { DocsPanel } from "@/components/DocsPanel";
import { getPyodide, isPyodideReady, onPyodideProgress } from "@/lib/python/pyodideLoader";
import type { PyRunResult, PyStep } from "@/lib/python/types";
import { cn } from "@/lib/utils";
import {
  Play,
  StepForward,
  RotateCcw,
  Lightbulb,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Check,
  Trophy,
} from "lucide-react";

export const Route = createFileRoute("/python")({
  head: () => ({
    meta: [
      { title: "Python — SQL Sandbox" },
      {
        name: "description",
        content:
          "Kjør Python rett i nettleseren med Pyodide. Steg gjennom koden linje for linje og se variablene endre seg.",
      },
    ],
  }),
  component: PythonPage,
});

function PythonPage() {
  const [activeId, setActiveId] = useState(PY_EXERCISES[0]?.id ?? "");
  // Level filter: "all" means show everything; a number filters by PY_TOPIC_LEVEL.
  const [levelFilter, setLevelFilter] = useState<"all" | PyLevel>("all");

  const filteredExercises = useMemo(
    () =>
      levelFilter === "all"
        ? PY_EXERCISES
        : PY_EXERCISES.filter((e) => levelOf(e) === levelFilter),
    [levelFilter],
  );

  const exercise = useMemo(
    () =>
      filteredExercises.find((e) => e.id === activeId) ??
      filteredExercises[0] ??
      PY_EXERCISES[0],
    [activeId, filteredExercises],
  );
  const exerciseIdx = filteredExercises.findIndex((e) => e.id === exercise.id);

  function goExercise(delta: number) {
    if (!filteredExercises.length) return;
    const next =
      (exerciseIdx + delta + filteredExercises.length) % filteredExercises.length;
    setActiveId(filteredExercises[next].id);
  }

  const [code, setCode] = useState(exercise.starter);
  const [stdout, setStdout] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Pyodide loading state
  const [pyReady, setPyReady] = useState(isPyodideReady());
  const [loadStage, setLoadStage] = useState<string | null>(null);
  const [loadStarted, setLoadStarted] = useState(false);

  // Stepping state
  const [steps, setSteps] = useState<PyStep[] | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [solutionCopied, setSolutionCopied] = useState(false);

  // Progress (XP + solved-set), persistert i localStorage.
  const [progress, setProgress] = useState<PyProgress>(() => loadPyProgress());
  const [xpToast, setXpToast] = useState<{ xp: number; total: number } | null>(null);

  // Reset state when switching exercise
  useEffect(() => {
    setCode(exercise.starter);
    setStdout("");
    setError(null);
    setSteps(null);
    setStepIdx(0);
    setShowHints(false);
    setShowSolution(false);
  }, [exercise.id]);

  function markCurrentSolved() {
    const { progress: next, xpEarned } = markPySolved(exercise.id);
    setProgress(next);
    if (xpEarned > 0) {
      setXpToast({ xp: xpEarned, total: next.xp });
      setTimeout(() => setXpToast(null), 3500);
    }
  }
  function resetAllProgress() {
    if (typeof window !== "undefined" && !window.confirm("Nullstille all Python-progresjon?"))
      return;
    setProgress(resetPyProgress());
  }

  function copySolution() {
    if (!exercise.solution) return;
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(exercise.solution).then(() => {
      setSolutionCopied(true);
      setTimeout(() => setSolutionCopied(false), 1500);
    });
  }
  function loadSolutionIntoEditor() {
    if (!exercise.solution) return;
    setCode(exercise.solution);
  }

  // Subscribe to Pyodide progress messages
  useEffect(() => {
    return onPyodideProgress((stage) => {
      setLoadStage(stage);
      if (stage === "Klar.") setPyReady(true);
    });
  }, []);

  async function ensureLoaded() {
    if (isPyodideReady()) {
      setPyReady(true);
      return;
    }
    setLoadStarted(true);
    await getPyodide();
    setPyReady(true);
  }

  async function handleRun() {
    setBusy(true);
    setError(null);
    setSteps(null);
    setStepIdx(0);
    try {
      await ensureLoaded();
      const result: PyRunResult = await runScript(code, {
        requires: exercise.requires,
        setup: exercise.setup,
      });
      setStdout(result.stdout);
      if (!result.ok) {
        setError(result.error ?? "Ukjent feil");
      } else {
        // Kjørte uten feil → marker som "godkjent" og gi XP. Vi bruker
        // suksessfull execution som proxy for "studenten har løst oppgaven";
        // det er ikke perfekt validering, men match-mot-fasit krever per-oppgave
        // expected output som ikke er definert. "Godkjent" = "kjørte rent".
        markCurrentSolved();
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleStep() {
    setBusy(true);
    setError(null);
    try {
      await ensureLoaded();
      const result = await runScriptStepwise(code, {
        requires: exercise.requires,
        setup: exercise.setup,
      });
      setStdout(result.stdout);
      if (!result.ok) {
        setError(result.error ?? "Ukjent feil");
        setSteps(null);
      } else {
        setSteps(result.steps ?? []);
        setStepIdx(0);
      }
    } finally {
      setBusy(false);
    }
  }

  function nextStep() {
    if (!steps) return;
    setStepIdx((i) => Math.min(i + 1, steps.length - 1));
  }
  function prevStep() {
    setStepIdx((i) => Math.max(0, i - 1));
  }
  function resetSteps() {
    setSteps(null);
    setStepIdx(0);
  }

  function resetCode() {
    setCode(exercise.starter);
    setStdout("");
    setError(null);
    setSteps(null);
  }

  const currentStep = steps && steps[stepIdx];
  const previousStep = steps && stepIdx > 0 ? steps[stepIdx - 1] : null;
  const highlightLine =
    steps && currentStep && currentStep.line > 0 ? currentStep.line : null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      {xpToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-lg border border-success bg-card shadow-lg px-4 py-3 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <Trophy className="h-4 w-4 text-warning" />
          <div>
            <div className="font-semibold text-success text-sm">+{xpToast.xp} XP — Godkjent!</div>
            <div className="text-[10px] text-muted-foreground">Total: {xpToast.total} XP</div>
          </div>
        </div>
      )}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight">Python — Flask, MySQL & sikkerhet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ekte Python kjører i nettleseren via Pyodide. Oppgavene dekker pensum:
            mysql.connector, Flask-routes + Jinja, sessions, login, CSRF-token, JSON-API
            og Bearer-tokens — alt mot en innebygd test-database.
          </p>
        </div>

        {/* Loading banner */}
        {!pyReady && loadStarted && (
          <div className="mb-4 rounded-lg border border-warning/40 bg-warning/5 p-3 text-sm flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-warning" />
            <span className="text-foreground">{loadStage ?? "Laster Pyodide…"}</span>
          </div>
        )}

        {/* Level filter pills — like /kurs but for Python */}
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <span className="text-xs uppercase tracking-wider text-muted-foreground mr-1">
            Nivå:
          </span>
          <button
            onClick={() => setLevelFilter("all")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              levelFilter === "all"
                ? "border-brand bg-brand/10 text-brand"
                : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            Alle ({PY_EXERCISES.length})
          </button>
          {([0, 1, 2, 3, 4, 5] as const).map((lvl) => {
            const count = PY_EXERCISES.filter((e) => levelOf(e) === lvl).length;
            const solved = PY_EXERCISES.filter(
              (e) => levelOf(e) === lvl && progress.solved[e.id],
            ).length;
            return (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                title={PY_LEVEL_NAMES[lvl]}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  levelFilter === lvl
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border text-muted-foreground hover:bg-accent",
                )}
              >
                {lvl}: {PY_LEVEL_NAMES[lvl].split(" — ")[0]} ({solved}/{count})
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-4">
          {/* Sidebar: exercise list */}
          <aside className="space-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Oppgaver ({Object.keys(progress.solved).length}/{PY_EXERCISES.length})
              </div>
              {progress.xp > 0 && (
                <button
                  onClick={resetAllProgress}
                  title="Nullstill all progresjon"
                  className="text-muted-foreground hover:text-foreground text-[10px]"
                >
                  Nullstill
                </button>
              )}
            </div>
            {progress.xp > 0 && (
              <div className="mb-3 flex items-center gap-1.5 text-[11px] text-warning">
                <Trophy className="h-3 w-3" />
                <span className="font-mono tabular-nums">{progress.xp} XP</span>
              </div>
            )}
            <div
              className="h-1 w-full rounded-full bg-muted overflow-hidden mb-3"
              aria-label="Progresjon"
            >
              <div
                className="h-full bg-success transition-all"
                style={{
                  width: `${(Object.keys(progress.solved).length / PY_EXERCISES.length) * 100}%`,
                }}
              />
            </div>
            {filteredExercises.map((e) => {
              const isSolved = !!progress.solved[e.id];
              const isActive = e.id === exercise.id;
              return (
                <button
                  key={e.id}
                  onClick={() => setActiveId(e.id)}
                  className={cn(
                    "w-full text-left rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="font-medium truncate flex-1">{e.title}</div>
                    {isSolved && (
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-success bg-success text-success-foreground"
                        title="Godkjent"
                      >
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground truncate">
                    Nivå {levelOf(e)} · {e.topic}
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Main panel */}
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                      {exercise.topic}
                    </Badge>
                    {exercise.requires?.map((pkg) => (
                      <Badge key={pkg} variant="outline" className="text-[10px] border-warning/50 text-warning">
                        krever {pkg}
                      </Badge>
                    ))}
                    {exercise.setup && (
                      <Badge variant="outline" className="text-[10px] border-success/50 text-success">
                        seedet DB
                      </Badge>
                    )}
                  </div>
                  <h2 className="font-semibold tracking-tight">{exercise.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {exercise.description}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  {exercise.hints && exercise.hints.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHints((s) => !s)}
                    >
                      <Lightbulb className="h-3.5 w-3.5 mr-1.5" />
                      {showHints ? "Skjul hint" : "Vis hint"}
                    </Button>
                  )}
                  {exercise.solution && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSolution((s) => !s)}
                    >
                      <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                      {showSolution ? "Skjul løsning" : "Vis løsning"}
                    </Button>
                  )}
                </div>
              </div>

              {showHints && exercise.hints && (
                <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-xs space-y-1 mb-3">
                  {exercise.hints.map((h, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-warning">•</span>
                      <span className="font-mono">{h}</span>
                    </div>
                  ))}
                </div>
              )}

              {showSolution && exercise.solution && (
                <div className="rounded-md border border-brand/30 bg-brand/5 p-3 mb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-brand">
                      Fasit
                    </span>
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[11px]"
                        onClick={copySolution}
                      >
                        {solutionCopied ? "Kopiert!" : "Kopiér"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-[11px]"
                        onClick={loadSolutionIntoEditor}
                      >
                        Last inn i editor
                      </Button>
                    </div>
                  </div>
                  <pre className="text-xs font-mono leading-relaxed text-foreground/90 overflow-auto max-h-[260px]">
                    {exercise.solution}
                  </pre>
                </div>
              )}

              {exercise.docs && exercise.docs.length > 0 && (
                <div className="mb-3">
                  <DocsPanel docs={exercise.docs} />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-3">
                {/* Editor */}
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Editor (Ctrl/Cmd+Enter for å kjøre)
                  </div>
                  <div className="rounded-md border border-border overflow-hidden h-[360px]">
                    <PythonEditor
                      value={code}
                      onChange={setCode}
                      onRun={handleRun}
                      highlightLine={highlightLine}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={handleRun} disabled={busy}>
                      {busy ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Play className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Kjør
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleStep} disabled={busy}>
                      <StepForward className="h-3.5 w-3.5 mr-1.5" />
                      Steg gjennom
                    </Button>
                    <Button size="sm" variant="ghost" onClick={resetCode}>
                      <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                      Tilbakestill
                    </Button>
                  </div>
                </div>

                {/* Output + variables */}
                <div className="space-y-2">
                  {/* Stepping controls */}
                  {steps && steps.length > 0 ? (
                    <div className="rounded-md border border-brand/40 bg-brand/5 p-2 flex items-center justify-between gap-2 text-xs">
                      <div className="text-foreground">
                        <strong>Steg {stepIdx + 1} av {steps.length}</strong>
                        {currentStep && currentStep.line > 0 && (
                          <span className="text-muted-foreground ml-2">
                            (linje {currentStep.line})
                          </span>
                        )}
                        {currentStep && currentStep.line === -1 && (
                          <span className="text-muted-foreground ml-2">(ferdig)</span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={prevStep} disabled={stepIdx === 0}>
                          ←
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={nextStep}
                          disabled={stepIdx >= steps.length - 1}
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={resetSteps}>
                          ✕
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {/* Variables */}
                  <div className="rounded-md border border-border bg-card">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-1.5 border-b border-border">
                      Variabler
                    </div>
                    <div className="max-h-[140px] overflow-auto">
                      <VariableInspector
                        current={currentStep?.locals ?? null}
                        previous={previousStep?.locals ?? null}
                      />
                    </div>
                  </div>

                  {/* stdout */}
                  <div className="rounded-md border border-border bg-card">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-1.5 border-b border-border">
                      Output
                    </div>
                    <pre className="p-3 text-xs font-mono whitespace-pre-wrap min-h-[80px] max-h-[180px] overflow-auto">
                      {error ? (
                        <span className="text-destructive">{error}</span>
                      ) : stdout ? (
                        stdout
                      ) : (
                        <span className="text-muted-foreground italic">
                          (ingen output ennå)
                        </span>
                      )}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {!pyReady && !loadStarted && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
                <div>
                  Første gang du trykker «Kjør»: Pyodide (~10 MB) + Flask (~3 MB) lastes ned
                  fra CDN. Cachet etter det.
                </div>
                <div>
                  Databaseoppgavene seeder en in-memory SQLite med samme API som
                  mysql.connector — du skriver helt vanlig MySQL-kode.
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <Button size="sm" variant="ghost" onClick={() => goExercise(-1)}>
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Forrige
              </Button>
              <span>
                {exerciseIdx + 1} av {filteredExercises.length}
              </span>
              <Button size="sm" variant="ghost" onClick={() => goExercise(1)}>
                Neste <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Style for stepped line highlight */}
      <style>{`
        .py-step-line { background: rgba(56, 189, 248, 0.10); }
        .py-step-gutter { background: rgb(56, 189, 248); width: 3px !important; margin-left: 2px; }
      `}</style>
    </div>
  );
}
