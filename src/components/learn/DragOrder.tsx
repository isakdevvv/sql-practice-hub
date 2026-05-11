import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, RotateCcw, GripVertical } from "lucide-react";
import type { OrderExercise } from "@/lib/learn/types";
import { markDragSolved } from "@/lib/learn/dragProgress";

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  // Make sure it's actually shuffled
  if (out.length > 1 && out.every((v, i) => v === arr[i])) {
    [out[0], out[1]] = [out[1], out[0]];
  }
  return out;
}

export function DragOrder({ exercise }: { exercise: OrderExercise }) {
  const [items, setItems] = useState<string[]>(() => shuffle(exercise.items));
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setItems(shuffle(exercise.items));
    setChecked(false);
  }, [exercise.id]);

  function onDragStart(i: number) {
    setDragIdx(i);
  }

  function onDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    setOverIdx(i);
  }

  function onDrop(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }
    setItems((curr) => {
      const next = curr.slice();
      const [moved] = next.splice(dragIdx, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
    setDragIdx(null);
    setOverIdx(null);
  }

  function reset() {
    setItems(shuffle(exercise.items));
    setChecked(false);
  }

  const correctIndex = (i: number) => items[i] === exercise.items[i];
  const allCorrect = checked && items.every((_, i) => correctIndex(i));

  useEffect(() => {
    if (allCorrect) markDragSolved(exercise.id);
  }, [allCorrect, exercise.id]);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        {items.map((item, i) => {
          const isCorrect = checked && correctIndex(i);
          const isWrong = checked && !correctIndex(i);
          return (
            <div
              key={item + i}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={(e) => onDragOver(e, i)}
              onDragLeave={() => setOverIdx(null)}
              onDrop={() => onDrop(i)}
              onDragEnd={() => {
                setDragIdx(null);
                setOverIdx(null);
              }}
              className={cn(
                "flex items-center gap-3 rounded-md border bg-card px-3 py-2.5 text-sm cursor-grab active:cursor-grabbing transition-colors",
                dragIdx === i && "opacity-50",
                overIdx === i && dragIdx !== null && dragIdx !== i && "border-brand bg-brand/5",
                isCorrect && "border-success/50 bg-success/5",
                isWrong && "border-destructive/50 bg-destructive/5",
                !checked && overIdx !== i && "border-border",
              )}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-mono text-xs text-muted-foreground w-6">{i + 1}.</span>
              <span className="flex-1 font-mono">{item}</span>
              {isCorrect && <Check className="h-3.5 w-3.5 text-success flex-shrink-0" />}
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
            {items.filter((_, i) => correctIndex(i)).length} av {items.length} på rett plass
          </div>
        ) : (
          <Button onClick={() => setChecked(true)} size="sm">
            Sjekk svar
          </Button>
        )}
      </div>

      {checked && exercise.explanation && (
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Forklaring:</strong> {exercise.explanation}
        </div>
      )}
    </div>
  );
}
