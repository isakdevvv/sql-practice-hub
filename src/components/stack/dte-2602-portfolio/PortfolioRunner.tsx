import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PythonEditor } from "@/components/python/PythonEditor";
import { runScript } from "@/lib/python/runner";
import {
  getPyodide,
  isPyodideReady,
  onPyodideProgress,
} from "@/lib/python/pyodideLoader";
import { cn } from "@/lib/utils";
import {
  Play,
  RotateCcw,
  Lightbulb,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Eye,
  ArrowLeft,
} from "lucide-react";
import type { PortfolioTrack } from "@/lib/python/portfolio-dte2602";

/** En enkel kjørelogikk for porteføljespor: én oppgave om gangen, fasit-sjekk på stdout. */
export function PortfolioRunner({ track }: { track: PortfolioTrack }) {
  const STORAGE_KEY = `dte2602-portfolio-${track.slug}-v1`;
  const CODE_PREFIX = `dte2602-portfolio-code-${track.slug}-`;

  const loadCompleted = (): Set<string> => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      return new Set();
    }
  };

  const saveCompleted = (set: Set<string>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
    } catch {
      /* ignore */
    }
  };

  const loadCode = (stepId: string, fallback: string) => {
    try {
      return localStorage.getItem(CODE_PREFIX + stepId) ?? fallback;
    } catch {
      return fallback;
    }
  };

  const saveCode = (stepId: string, code: string) => {
    try {
      localStorage.setItem(CODE_PREFIX + stepId, code);
    } catch {
      /* ignore */
    }
  };

  const [stepIdx, setStepIdx] = useState(0);
  const step = track.steps[stepIdx];

  const [code, setCode] = useState(step.starter);
  const [stdout, setStdout] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [matched, setMatched] = useState<boolean | null>(null);

  const [completed, setCompleted] = useState<Set<string>>(loadCompleted);
  const isDone = completed.has(step.id);

  const [pyReady, setPyReady] = useState(isPyodideReady());
  const [loadStage, setLoadStage] = useState<string | null>(null);
  const [loadStarted, setLoadStarted] = useState(false);

  useEffect(() => {
    setCode(loadCode(step.id, step.starter));
    setStdout("");
    setError(null);
    setMatched(null);
    setShowHints(false);
    setShowSolution(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id, step.starter]);

  useEffect(() => {
    saveCode(step.id, code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id, code]);

  // Pyodide loading
  useEffect(() => {
    if (pyReady || loadStarted) return;
    setLoadStarted(true);
    const off = onPyodideProgress((s) => setLoadStage(s));
    getPyodide()
      .then(() => setPyReady(true))
      .catch((err) => setError(String(err)))
      .finally(() => off());
    return off;
  }, [pyReady, loadStarted]);

  const run = async () => {
    setBusy(true);
    setError(null);
    setStdout("");
    setMatched(null);
    try {
      const result = await runScript(code, {
        requires: ["numpy", "pandas", "scikit-learn"],
      });
      setStdout(result.stdout);
      if (!result.ok) {
        setError(result.error ?? "Ukjent feil");
      } else {
        const allMatched = step.expectedOutputs.every((s) =>
          result.stdout.includes(s),
        );
        setMatched(allMatched);
        if (allMatched) {
          const next = new Set(completed);
          next.add(step.id);
          setCompleted(next);
          saveCompleted(next);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setCode(step.starter);
    setStdout("");
    setError(null);
    setMatched(null);
  };

  const goStep = (delta: number) => {
    const next = Math.max(0, Math.min(track.steps.length - 1, stepIdx + delta));
    setStepIdx(next);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link to="/stack/$slug" params={{ slug: "dte-2602" }} className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            Tilbake til DTE-2602
          </Link>
          <span>·</span>
          <span className="text-foreground">{track.title}</span>
          <Badge variant="secondary" className="ml-auto">
            {completed.size}/{track.steps.length} ferdig
          </Badge>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-6">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            DTE-2602 · Porteføljespor
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{track.title}</h1>
          <p className="mt-1 text-muted-foreground">{track.subtitle}</p>
          <p className="mt-3 text-sm text-muted-foreground max-w-3xl">{track.intro}</p>
        </header>

        {/* Step nav */}
        <nav className="mb-6 flex flex-wrap gap-2">
          {track.steps.map((s, i) => {
            const done = completed.has(s.id);
            const active = i === stepIdx;
            return (
              <button
                key={s.id}
                onClick={() => setStepIdx(i)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs flex items-center gap-2 transition-colors",
                  active
                    ? "border-brand bg-brand/10 text-foreground"
                    : "border-border bg-card hover:border-brand/40 text-muted-foreground",
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Circle className="h-3.5 w-3.5" />
                )}
                {s.shortTitle}
              </button>
            );
          })}
        </nav>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Brief column */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-lg font-semibold mb-2">{step.title}</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {step.brief}
              </p>
              {step.expectedOutputs.length > 0 && (
                <div className="mt-4 rounded-lg border border-border bg-background p-3">
                  <div className="text-xs font-semibold mb-1 text-muted-foreground">
                    Forventet i output:
                  </div>
                  <ul className="text-xs font-mono space-y-1">
                    {step.expectedOutputs.map((s) => (
                      <li key={s}>{s}…</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {step.hints && step.hints.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <button
                  onClick={() => setShowHints((v) => !v)}
                  className="flex items-center gap-2 text-sm font-semibold"
                >
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  Hint ({step.hints.length})
                  <span className="text-muted-foreground text-xs ml-auto">
                    {showHints ? "Skjul" : "Vis"}
                  </span>
                </button>
                {showHints && (
                  <ul className="mt-3 text-sm text-muted-foreground space-y-1 list-disc pl-5">
                    {step.hints.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="rounded-xl border border-border bg-card p-4">
              <button
                onClick={() => setShowSolution((v) => !v)}
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <Eye className="h-4 w-4 text-muted-foreground" />
                Fasit
                <span className="text-muted-foreground text-xs ml-auto">
                  {showSolution ? "Skjul" : "Vis"}
                </span>
              </button>
              {showSolution && (
                <pre className="mt-3 font-mono text-xs overflow-x-auto rounded-lg border border-border bg-background p-3 whitespace-pre">
                  {step.solution}
                </pre>
              )}
            </div>
          </div>

          {/* Editor column */}
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border bg-muted/30 px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">python · pyodide</span>
                {!pyReady && (
                  <span className="ml-auto flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {loadStage ?? "laster pyodide…"}
                  </span>
                )}
              </div>
              <div style={{ height: 360 }}>
                <PythonEditor value={code} onChange={setCode} onRun={run} height="360px" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={run} disabled={busy || !pyReady}>
                {busy ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Kjør &amp; sjekk
              </Button>
              <Button variant="ghost" onClick={reset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <span className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => goStep(-1)} disabled={stepIdx === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  Steg {stepIdx + 1}/{track.steps.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goStep(1)}
                  disabled={stepIdx === track.steps.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </span>
            </div>

            {(stdout || error || matched !== null) && (
              <div className="rounded-xl border border-border bg-card p-4">
                {matched === true && (
                  <div className="mb-3 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Riktig! Fasit-strengen er funnet i output.
                    {isDone && <span className="text-xs text-muted-foreground ml-auto">lagret som ferdig</span>}
                  </div>
                )}
                {matched === false && !error && (
                  <div className="mb-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm text-amber-400">
                    Output kjørte, men forventet streng ble ikke funnet. Les hint og prøv igjen.
                  </div>
                )}
                {error && (
                  <div className="mb-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive whitespace-pre-wrap font-mono">
                    {error}
                  </div>
                )}
                {stdout && (
                  <pre className="font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                    {stdout}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
