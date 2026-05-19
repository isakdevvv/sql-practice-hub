import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X, RotateCcw, GripVertical, Eye, EyeOff } from "lucide-react";
import { markDragSolved } from "@/lib/learn/dragProgress";

type Mode = "lær" | "prøv";

export interface FunctionOutputMatchProps {
  /** Stable id for progress tracking. */
  id: string;
  /** Pretty-printed rule, e.g. "f(x) = 2x + 1". */
  rule: string;
  /** Pure function the user is asked to evaluate. */
  fn: (x: number) => number;
  /** Inputs (domain). Order is shown left-to-right. */
  domain: number[];
  /** Optional short explanation shown after a correct solve. */
  explanation?: string;
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  if (out.length > 1 && out.every((v, i) => v === arr[i])) {
    [out[0], out[1]] = [out[1], out[0]];
  }
  return out;
}

export function FunctionOutputMatch({
  id,
  rule,
  fn,
  domain,
  explanation,
}: FunctionOutputMatchProps) {
  const correctOutputs = useMemo(() => domain.map(fn), [domain, fn]);
  const [position, setPosition] = useState<number[]>(() => shuffle(correctOutputs));
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [mode, setMode] = useState<Mode>("lær");

  useEffect(() => {
    setPosition(shuffle(correctOutputs));
    setChecked(false);
  }, [correctOutputs]);

  const correctCount = useMemo(
    () => position.filter((v, i) => v === correctOutputs[i]).length,
    [position, correctOutputs],
  );
  const allCorrect = correctCount === domain.length;

  useEffect(() => {
    if (checked && allCorrect && mode === "prøv") {
      markDragSolved(`disk-funk-out-${id}`);
    }
  }, [checked, allCorrect, mode, id]);

  function onDrop(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }
    setPosition((curr) => {
      const next = curr.slice();
      [next[dragIdx], next[targetIdx]] = [next[targetIdx], next[dragIdx]];
      return next;
    });
    setDragIdx(null);
    setOverIdx(null);
  }

  function reset() {
    setPosition(shuffle(correctOutputs));
    setChecked(false);
  }

  const isLearn = mode === "lær";
  const display = isLearn ? correctOutputs : position;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Tolke output — drag riktig f(x) til hver x
        </div>
        <ModeToggle
          mode={mode}
          setMode={(m) => {
            setMode(m);
            reset();
          }}
        />
      </div>

      <div className="rounded-md border border-border bg-background p-3 font-mono text-sm mb-3">
        Regel: <span className="text-brand">{rule}</span>
        <span className="text-muted-foreground ml-2 text-xs">
          (domene = {"{" + domain.join(", ") + "}"})
        </span>
      </div>

      {isLearn && (
        <div className="text-[11px] text-muted-foreground italic mb-2">
          Lære-modus: hver rad viser direkte riktig svar. Bytt til «prøv» når du er klar.
        </div>
      )}

      <div className="space-y-1.5">
        {domain.map((x, i) => {
          const value = display[i];
          const correct = checked && value === correctOutputs[i];
          const wrong = checked && value !== correctOutputs[i];
          return (
            <div
              key={i}
              onDragOver={(e) => {
                if (isLearn) return;
                e.preventDefault();
                if (dragIdx !== null && dragIdx !== i) setOverIdx(i);
              }}
              onDragLeave={() => {
                if (overIdx === i) setOverIdx(null);
              }}
              onDrop={() => !isLearn && onDrop(i)}
              className={cn(
                "grid grid-cols-[140px_1fr] gap-3 items-stretch rounded-lg border p-2 transition-colors",
                correct && "border-success/50 bg-success/5",
                wrong && "border-destructive/50 bg-destructive/5",
                !checked && overIdx === i && dragIdx !== null && "border-brand bg-brand/5",
                !(correct || wrong || (overIdx === i && dragIdx !== null)) && "border-border",
              )}
            >
              <div className="flex items-center justify-center font-mono text-sm font-semibold bg-muted/40 rounded-md px-3 py-2">
                f({x}) =
              </div>
              <div
                draggable={!isLearn}
                onDragStart={() => {
                  if (isLearn) return;
                  setDragIdx(i);
                  setChecked(false);
                }}
                onDragEnd={() => {
                  setDragIdx(null);
                  setOverIdx(null);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-md bg-card px-3 py-2 font-mono text-sm select-none",
                  isLearn ? "cursor-default" : "cursor-grab active:cursor-grabbing",
                  dragIdx === i && "opacity-40",
                )}
              >
                {!isLearn && (
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                )}
                {checked && (
                  <span
                    className={cn("flex-shrink-0", correct ? "text-success" : "text-destructive")}
                  >
                    {correct ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  </span>
                )}
                <span className="flex-1">{value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {!isLearn && (
        <div className="flex items-center gap-2 justify-between mt-3">
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Stokk om
          </Button>
          {checked ? (
            <div
              className={cn("text-sm font-medium", allCorrect ? "text-success" : "text-warning")}
            >
              {correctCount} av {domain.length} riktig
            </div>
          ) : (
            <Button onClick={() => setChecked(true)} size="sm">
              Sjekk svar
            </Button>
          )}
        </div>
      )}

      {checked && allCorrect && explanation && !isLearn && (
        <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          <strong className="text-foreground">Forklaring:</strong> {explanation}
        </div>
      )}
    </div>
  );
}

function ModeToggle({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <div className="inline-flex rounded-md border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setMode("lær")}
        className={cn(
          "px-2.5 py-1 text-[11px] flex items-center gap-1",
          mode === "lær"
            ? "bg-brand/15 text-foreground"
            : "bg-background text-muted-foreground hover:bg-muted",
        )}
      >
        <Eye className="h-3 w-3" /> Lær
      </button>
      <button
        type="button"
        onClick={() => setMode("prøv")}
        className={cn(
          "px-2.5 py-1 text-[11px] flex items-center gap-1 border-l border-border",
          mode === "prøv"
            ? "bg-brand/15 text-foreground"
            : "bg-background text-muted-foreground hover:bg-muted",
        )}
      >
        <EyeOff className="h-3 w-3" /> Prøv
      </button>
    </div>
  );
}
