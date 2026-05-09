import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X, RotateCcw, GripVertical } from "lucide-react";
import type { MatchExercise } from "@/lib/learn/types";

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  // Force at least one swap if we ended up with the original order
  if (out.length > 1 && out.every((v, i) => v === arr[i])) {
    [out[0], out[1]] = [out[1], out[0]];
  }
  return out;
}

export function DragMatch({ exercise }: { exercise: MatchExercise }) {
  // Position[i] holds the right-string currently shown in slot i (next to pairs[i].left).
  // Initialised with a shuffled order so every slot is filled from the start.
  const [position, setPosition] = useState<string[]>(() =>
    shuffle(exercise.pairs.map((p) => p.right)),
  );
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setPosition(shuffle(exercise.pairs.map((p) => p.right)));
    setChecked(false);
    setDragIdx(null);
    setOverIdx(null);
  }, [exercise.id]);

  const correctCount = useMemo(() => {
    let n = 0;
    for (let i = 0; i < exercise.pairs.length; i++) {
      if (position[i] === exercise.pairs[i].right) n++;
    }
    return n;
  }, [position, exercise]);

  const allCorrect = correctCount === exercise.pairs.length;

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
    setPosition(shuffle(exercise.pairs.map((p) => p.right)));
    setChecked(false);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Bytt om på radene til hvert nøkkelord står ved siden av riktig beskrivelse.
        Dra én rad og slipp den oppå en annen for å bytte.
      </p>

      <div className="space-y-1.5">
        {exercise.pairs.map((pair, i) => {
          const value = position[i];
          const correct = checked && value === pair.right;
          const wrong = checked && value !== pair.right;
          return (
            <div
              key={i}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragIdx !== null && dragIdx !== i) setOverIdx(i);
              }}
              onDragLeave={() => {
                if (overIdx === i) setOverIdx(null);
              }}
              onDrop={() => onDrop(i)}
              className={cn(
                "grid grid-cols-[160px_1fr] gap-3 items-stretch rounded-lg border p-2 transition-colors",
                correct && "border-success/50 bg-success/5",
                wrong && "border-destructive/50 bg-destructive/5",
                !checked && overIdx === i && dragIdx !== null && "border-brand bg-brand/5",
                !checked && overIdx !== i && "border-border",
              )}
            >
              <div className="flex items-center justify-center font-mono text-sm font-semibold text-foreground/90 bg-muted/40 rounded-md px-3 py-2">
                {pair.left}
              </div>
              <div
                draggable
                onDragStart={() => {
                  setDragIdx(i);
                  setChecked(false);
                }}
                onDragEnd={() => {
                  setDragIdx(null);
                  setOverIdx(null);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-md bg-card px-3 py-2 text-sm cursor-grab active:cursor-grabbing select-none",
                  dragIdx === i && "opacity-40",
                )}
              >
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                {checked && (
                  <span
                    className={cn(
                      "flex-shrink-0",
                      correct ? "text-success" : "text-destructive",
                    )}
                  >
                    {correct ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                  </span>
                )}
                <span className="flex-1">{value}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 justify-between">
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Stokk om
        </Button>
        {checked ? (
          <div
            className={cn(
              "text-sm font-medium",
              allCorrect ? "text-success" : "text-warning",
            )}
          >
            {correctCount} av {exercise.pairs.length} riktig
          </div>
        ) : (
          <Button onClick={() => setChecked(true)} size="sm">
            Sjekk svar
          </Button>
        )}
      </div>
    </div>
  );
}
