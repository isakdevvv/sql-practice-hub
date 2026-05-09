import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PythonEditor } from "@/components/python/PythonEditor";
import { runAndCheck, type CheckResult } from "./pyodideRunner";
import { Check, ChevronDown, ChevronRight, Lightbulb, Eye, Play, RotateCcw } from "lucide-react";
import type { Exercise } from "./exercises";

type Status = "pending" | "pass" | "fail";

interface Props {
  exercise: Exercise;
  status: Status;
  onStatusChange: (status: Status) => void;
}

export function DrillExercise({ exercise, status, onStatusChange }: Props) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(exercise.starterCode);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [solutionVisible, setSolutionVisible] = useState(false);

  const statusBadge = (() => {
    if (status === "pass") {
      return (
        <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-700/50">
          <Check className="w-3 h-3 mr-1" /> Bestått
        </Badge>
      );
    }
    if (status === "fail") {
      return (
        <Badge className="bg-red-600/20 text-red-300 border-red-700/50">
          Prøv igjen
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Ikke forsøkt
      </Badge>
    );
  })();

  async function handleRun() {
    setRunning(true);
    setResult(null);
    try {
      const r = await runAndCheck(code, exercise.expectedOutput);
      setResult(r);
      onStatusChange(r.passed ? "pass" : "fail");
    } finally {
      setRunning(false);
    }
  }

  function handleReset() {
    setCode(exercise.starterCode);
    setResult(null);
  }

  function showNextHint() {
    if (hintsRevealed < exercise.hints.length) {
      setHintsRevealed((n) => n + 1);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-card/60 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          {open ? (
            <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
          )}
          <span className="font-semibold truncate">{exercise.title}</span>
        </div>
        <div className="shrink-0">{statusBadge}</div>
      </button>

      {open && (
        <div className="border-t border-border px-5 py-5 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {exercise.description}
          </p>

          <div className="rounded-md bg-muted/40 border border-border px-3 py-2 text-xs">
            <span className="text-muted-foreground">Forventet utdata: </span>
            <code className="font-mono text-foreground whitespace-pre-wrap break-all">
              {exercise.expectedOutput}
            </code>
          </div>

          <div className="h-72 rounded-md overflow-hidden border border-border">
            <PythonEditor value={code} onChange={setCode} onRun={handleRun} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleRun} disabled={running} size="sm">
              <Play className="w-3.5 h-3.5 mr-1.5" />
              {running ? "Kjører…" : "Kjør & sjekk"}
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm" disabled={running}>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Tilbakestill
            </Button>
            <Button
              onClick={showNextHint}
              variant="outline"
              size="sm"
              disabled={hintsRevealed >= exercise.hints.length}
            >
              <Lightbulb className="w-3.5 h-3.5 mr-1.5" />
              {hintsRevealed === 0 ? "Vis hint" : `Hint ${hintsRevealed}/${exercise.hints.length}`}
            </Button>
            <Button
              onClick={() => setSolutionVisible((v) => !v)}
              variant="ghost"
              size="sm"
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              {solutionVisible ? "Skjul fasit" : "Vis fasit"}
            </Button>
          </div>

          {hintsRevealed > 0 && (
            <div className="space-y-2">
              {exercise.hints.slice(0, hintsRevealed).map((h, i) => (
                <div
                  key={i}
                  className="rounded-md border border-amber-700/40 bg-amber-950/30 px-3 py-2 text-sm text-amber-100"
                >
                  <span className="font-semibold mr-2">Hint {i + 1}:</span>
                  {h}
                </div>
              ))}
            </div>
          )}

          {solutionVisible && (
            <div className="rounded-md border border-border bg-muted/30 overflow-hidden">
              <div className="px-3 py-1.5 border-b border-border bg-muted/40 text-xs text-muted-foreground">
                Fasit
              </div>
              <pre className="px-3 py-2 text-xs font-mono whitespace-pre overflow-x-auto">
                {exercise.solution}
              </pre>
            </div>
          )}

          {result && (
            <div
              className={
                "rounded-md border px-3 py-3 text-sm space-y-2 " +
                (result.passed
                  ? "border-emerald-700/50 bg-emerald-950/30"
                  : "border-red-700/50 bg-red-950/30")
              }
            >
              <div className={result.passed ? "text-emerald-300 font-semibold" : "text-red-300 font-semibold"}>
                {result.passed ? "Bestått! Utdata stemmer." : "Ikke helt — sjekk diff under."}
              </div>
              {result.error && (
                <div className="rounded bg-red-950/60 border border-red-800/60 p-2 text-xs font-mono text-red-200 whitespace-pre-wrap">
                  {result.error}
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Ditt utdata</div>
                  <pre className="rounded bg-background border border-border px-2 py-1.5 text-xs font-mono whitespace-pre-wrap break-all min-h-[2rem]">
                    {result.actual || <span className="text-muted-foreground italic">(tomt)</span>}
                  </pre>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Forventet</div>
                  <pre className="rounded bg-background border border-border px-2 py-1.5 text-xs font-mono whitespace-pre-wrap break-all min-h-[2rem]">
                    {result.expected}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

