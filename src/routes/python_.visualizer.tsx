import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { PythonEditor } from "@/components/python/PythonEditor";
import { StepVisualizer } from "@/components/python/StepVisualizer";
import { runScriptVisual } from "@/lib/python/runner";
import {
  getPyodide,
  isPyodideReady,
  onPyodideProgress,
} from "@/lib/python/pyodideLoader";
import type { VisualStep } from "@/lib/python/types";
import {
  Play,
  RotateCcw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Network,
} from "lucide-react";

export const Route = createFileRoute("/python_/visualizer")({
  head: () => ({
    meta: [
      { title: "Python-visualizer — SQL Sandbox" },
      {
        name: "description",
        content:
          "Frittstående sandkasse: skriv Python, kjør den i nettleseren og se rammer + heap-objekter med referansepiler.",
      },
    ],
  }),
  component: VisualizerPage,
});

const DEFAULT_CODE = `# Lim inn eller skriv kode her, trykk «Kjør»
# og se rammer + heap-objekter til høyre.

def hilsen(navn):
    melding = f"Hei {navn}!"
    return melding

navn = "Ada"
boker = ["Python", "Algoritmer"]
medforfattere = boker          # aliasing — begge peker på samme liste
medforfattere.append("ML")
svar = hilsen(navn)
print(svar)
`;

function decodeFragment(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash || !hash.startsWith("#")) return null;
  const params = new URLSearchParams(hash.slice(1));
  const b64 = params.get("code");
  if (!b64) return null;
  try {
    return decodeURIComponent(escape(window.atob(b64)));
  } catch {
    return null;
  }
}

function VisualizerPage() {
  const [code, setCode] = useState<string>(() => decodeFragment() ?? DEFAULT_CODE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<VisualStep[] | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [stdout, setStdout] = useState("");

  const [pyReady, setPyReady] = useState(isPyodideReady());
  const [loadStage, setLoadStage] = useState<string | null>(null);
  const [loadStarted, setLoadStarted] = useState(false);

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
      const result = await runScriptVisual(code);
      setStdout(result.stdoutFull);
      if (!result.ok) {
        setError(result.error ?? "Ukjent feil");
      } else {
        setSteps(result.steps);
      }
    } finally {
      setBusy(false);
    }
  }

  function resetCode() {
    setCode(DEFAULT_CODE);
    setSteps(null);
    setStepIdx(0);
    setStdout("");
    setError(null);
  }

  const current = steps && steps[stepIdx];
  const topUserLine = (() => {
    if (!current) return null;
    const userFrames = current.frames.filter((f) => f.isUser);
    if (!userFrames.length) return null;
    return userFrames[userFrames.length - 1].line;
  })();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Network className="h-3.5 w-3.5" />
            Sandkasse
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Python-visualizer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Skriv kode, trykk «Kjør», og bruk pilene for å steppe gjennom.
            Rammer (stack) til venstre, heap-objekter til høyre — piler viser
            referanser.
          </p>
        </div>

        {!pyReady && loadStarted && (
          <div className="mb-4 rounded-lg border border-warning/40 bg-warning/5 p-3 text-sm flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-warning" />
            <span className="text-foreground">{loadStage ?? "Laster Pyodide…"}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4">
          {/* Editor + controls */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Editor (Ctrl/Cmd+Enter for å kjøre)
            </div>
            <div className="rounded-md border border-border overflow-hidden h-[420px]">
              <PythonEditor
                value={code}
                onChange={setCode}
                onRun={handleRun}
                highlightLine={topUserLine}
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
              <Button size="sm" variant="ghost" onClick={resetCode}>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Tilbakestill
              </Button>
            </div>

            <div className="rounded-md border border-border bg-card mt-3">
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

          {/* Diagram */}
          <div className="space-y-2">
            {steps && steps.length > 0 ? (
              <div className="rounded-md border border-brand/40 bg-brand/5 p-2 flex items-center justify-between gap-2 text-xs">
                <div className="text-foreground">
                  <strong>
                    Steg {stepIdx + 1} av {steps.length}
                  </strong>
                  {current && (
                    <span className="text-muted-foreground ml-2">
                      ({current.event}
                      {topUserLine ? ` · linje ${topUserLine}` : ""})
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
                    disabled={stepIdx === 0}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setStepIdx((i) => Math.min(i + 1, steps.length - 1))
                    }
                    disabled={stepIdx >= steps.length - 1}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSteps(null);
                      setStepIdx(0);
                    }}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ) : null}
            <div className="rounded-md border border-border bg-card min-h-[420px]">
              <StepVisualizer steps={steps} stepIdx={stepIdx} />
            </div>
          </div>
        </div>

        {!pyReady && !loadStarted && (
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            Første gang du trykker «Kjør» lastes Pyodide ned (~10 MB). Cachet etter det.
          </div>
        )}
      </main>

      <style>{`
        .py-step-line { background: rgba(56, 189, 248, 0.10); }
        .py-step-gutter { background: rgb(56, 189, 248); width: 3px !important; margin-left: 2px; }
      `}</style>
    </div>
  );
}
