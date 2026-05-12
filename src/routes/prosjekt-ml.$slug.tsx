import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PythonEditor } from "@/components/python/PythonEditor";
import { ML_PROJECTS, getMlProject } from "@/lib/python/mlProjects";
import { runScript } from "@/lib/python/runner";
import { getPyodide, isPyodideReady, onPyodideProgress } from "@/lib/python/pyodideLoader";
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
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/prosjekt-ml/$slug")({
  head: ({ params }) => {
    const project = getMlProject(params.slug);
    return {
      meta: [
        {
          title: project
            ? `Prosjekt — ${project.title}`
            : "Prosjekt — DTE-2602",
        },
        {
          name: "description",
          content:
            project?.longDescription ??
            "DTE-2602 mini-prosjekt: kjør ML-kode i nettleseren.",
        },
      ],
    };
  },
  component: MlProjectPage,
});

function MlProjectPage() {
  const { slug } = Route.useParams();
  const project = getMlProject(slug);

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm">
            <h1 className="text-xl font-semibold mb-2">Fant ikke prosjekt</h1>
            <p className="text-muted-foreground">
              Slug «{slug}» finnes ikke. Tilgjengelige:
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              {ML_PROJECTS.map((p) => (
                <li key={p.slug}>
                  <Link
                    to="/prosjekt-ml/$slug"
                    params={{ slug: p.slug }}
                    className="text-brand hover:underline"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    );
  }

  return <MlProjectInner key={project.slug} slug={project.slug} />;
}

function MlProjectInner({ slug }: { slug: string }) {
  const project = getMlProject(slug)!;
  const STORAGE_KEY = `py-ml-progress-${slug}-v1`;
  const CODE_PREFIX = `py-ml-code-${slug}-`;

  function loadCompleted(): Set<string> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      return new Set();
    }
  }

  function saveCompleted(set: Set<string>) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
    } catch {
      /* ignore */
    }
  }

  function loadCode(stepId: string, fallback: string): string {
    try {
      return localStorage.getItem(CODE_PREFIX + stepId) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function saveCode(stepId: string, code: string) {
    try {
      localStorage.setItem(CODE_PREFIX + stepId, code);
    } catch {
      /* ignore */
    }
  }

  const [stepIdx, setStepIdx] = useState(0);
  const step = project.steps[stepIdx];

  const [code, setCode] = useState(step.starter);
  const [stdout, setStdout] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const [completed, setCompleted] = useState<Set<string>>(() => loadCompleted());

  const [pyReady, setPyReady] = useState(isPyodideReady());
  const [loadStage, setLoadStage] = useState<string | null>(null);
  const [loadStarted, setLoadStarted] = useState(false);

  useEffect(() => {
    setCode(loadCode(step.id, step.starter));
    setStdout("");
    setError(null);
    setShowHints(false);
    setShowSolution(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id, step.starter]);

  useEffect(() => {
    saveCode(step.id, code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id, code]);

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
    try {
      await ensureLoaded();
      const result = await runScript(code, { requires: step.requires });
      setStdout(result.stdout);
      if (!result.ok) {
        setError(result.error ?? "Ukjent feil");
      } else {
        const lines = result.stdout.split("\n");
        const hasPass = lines.some((l) => l.trim().startsWith("PASS:"));
        const hasFail = lines.some((l) => l.trim().startsWith("FAIL:"));
        if (hasPass && !hasFail) {
          setCompleted((prev) => {
            if (prev.has(step.id)) return prev;
            const next = new Set(prev);
            next.add(step.id);
            saveCompleted(next);
            return next;
          });
        }
      }
    } finally {
      setBusy(false);
    }
  }

  function resetCode() {
    setCode(step.starter);
    setStdout("");
    setError(null);
  }

  function loadSolution() {
    setCode(step.solution);
    setStdout("");
    setError(null);
    setShowSolution(false);
  }

  const stepCompleted = completed.has(step.id);
  const totalDone = completed.size;
  const progressPct = (totalDone / project.steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-5">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            DTE-2602 · Mini-prosjekt
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {project.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {project.longDescription}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            <Link to="/stack/$slug" params={{ slug: "dte-2602" }} className="text-brand hover:underline">
              ← Tilbake til DTE-2602
            </Link>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">
              {totalDone} av {project.steps.length} trinn fullført
            </span>
            <span className="text-muted-foreground">{Math.round(progressPct)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-success transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {!pyReady && loadStarted && (
          <div className="mb-4 rounded-lg border border-warning/40 bg-warning/5 p-3 text-sm flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-warning" />
            <span className="text-foreground">{loadStage ?? "Laster Pyodide…"}</span>
          </div>
        )}

        {!pyReady && !loadStarted && (
          <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-foreground">
              Førstegangslast: Pyodide + scikit-learn + numpy + matplotlib lastes
              i nettleseren (~30 MB). Etter første kjøring caches det og blir
              raskere.
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-[280px_1fr] gap-4">
          {/* Step navigator */}
          <aside className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Trinnene ({project.steps.length})
            </div>
            {project.steps.map((s, i) => {
              const done = completed.has(s.id);
              const active = i === stepIdx;
              return (
                <button
                  key={s.id}
                  onClick={() => setStepIdx(i)}
                  className={cn(
                    "w-full text-left rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success flex-shrink-0" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                    )}
                    <span className="font-medium truncate">{s.title}</span>
                  </div>
                  <div className="mt-0.5 ml-5 text-[10px] text-muted-foreground truncate">
                    {s.concept}
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Main */}
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                      {step.concept}
                    </Badge>
                    {stepCompleted && (
                      <Badge
                        variant="outline"
                        className="text-[10px] border-success/50 text-success"
                      >
                        ✓ fullført
                      </Badge>
                    )}
                  </div>
                  <h2 className="font-semibold tracking-tight text-lg">{step.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{step.task}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  {step.hints && step.hints.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHints((s) => !s)}
                    >
                      <Lightbulb className="h-3.5 w-3.5 mr-1.5" />
                      {showHints ? "Skjul" : "Hint"}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSolution((s) => !s)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    {showSolution ? "Skjul" : "Fasit"}
                  </Button>
                </div>
              </div>

              {step.context && (
                <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-xs leading-relaxed mb-3">
                  {step.context}
                </div>
              )}

              {showHints && step.hints && (
                <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-xs space-y-1 mb-3">
                  {step.hints.map((h, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-warning">•</span>
                      <span className="font-mono">{h}</span>
                    </div>
                  ))}
                </div>
              )}

              {showSolution && (
                <div className="rounded-md border border-success/40 bg-success/5 p-3 text-xs mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-foreground">Vil du laste fasit-koden?</div>
                    <div className="text-muted-foreground mt-0.5">
                      Erstatter all kode i editoren med løsningen for dette trinnet.
                    </div>
                  </div>
                  <Button size="sm" onClick={loadSolution}>
                    Last fasit
                  </Button>
                </div>
              )}

              {/* Editor */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  notebook.py — (Ctrl/Cmd+Enter for å kjøre)
                </div>
                <div className="rounded-md border border-border overflow-hidden h-[520px]">
                  <PythonEditor value={code} onChange={setCode} onRun={handleRun} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={handleRun} disabled={busy}>
                    {busy ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Kjør &amp; test
                  </Button>
                  <Button size="sm" variant="ghost" onClick={resetCode}>
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Tilbakestill
                  </Button>
                </div>
              </div>

              {/* Output */}
              <div className="mt-3 rounded-md border border-border bg-card">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-1.5 border-b border-border">
                  Output
                </div>
                <pre className="p-3 text-xs font-mono whitespace-pre-wrap min-h-[80px] max-h-[300px] overflow-auto">
                  {error ? (
                    <span className="text-destructive">{error}</span>
                  ) : stdout ? (
                    stdout.split("\n").map((line, i) => {
                      const t = line.trim();
                      if (t.startsWith("PASS:"))
                        return (
                          <div key={i} className="text-success">
                            {line}
                          </div>
                        );
                      if (t.startsWith("FAIL:"))
                        return (
                          <div key={i} className="text-destructive">
                            {line}
                          </div>
                        );
                      return <div key={i}>{line}</div>;
                    })
                  ) : (
                    <span className="text-muted-foreground italic">
                      Klikk «Kjør &amp; test» — testene printer PASS/FAIL.
                    </span>
                  )}
                </pre>
              </div>
            </div>

            {/* Step nav */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={stepIdx === 0}
                onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Forrige trinn
              </Button>
              <span className="text-xs text-muted-foreground">
                Trinn {stepIdx + 1} av {project.steps.length}
              </span>
              <Button
                size="sm"
                disabled={stepIdx >= project.steps.length - 1}
                onClick={() => setStepIdx((i) => Math.min(project.steps.length - 1, i + 1))}
              >
                Neste trinn
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
