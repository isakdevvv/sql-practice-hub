import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X, RotateCcw } from "lucide-react";
import type { QuizExercise } from "@/lib/learn/types";
import { markDragSolved } from "@/lib/learn/dragProgress";

// Single- or multi-select multiple choice. The component shuffles options
// once per exercise so the correct answer isn't always first. After submit
// each option shows its rationale.

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

export function DragQuiz({
  exercise,
  onSolved,
}: {
  exercise: QuizExercise;
  onSolved?: () => void;
}) {
  const isMulti = exercise.multi === true;
  const shuffled = useMemo(() => shuffle(exercise.options), [exercise.id]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setSelected(new Set());
    setChecked(false);
  }, [exercise.id]);

  function toggle(i: number) {
    if (checked) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (isMulti) {
        if (next.has(i)) next.delete(i);
        else next.add(i);
      } else {
        next.clear();
        next.add(i);
      }
      return next;
    });
  }

  const correctCount = shuffled.filter((o) => o.correct).length;
  const allCorrect =
    checked &&
    shuffled.every(
      (o, i) => (o.correct && selected.has(i)) || (!o.correct && !selected.has(i)),
    );

  useEffect(() => {
    if (allCorrect) {
      markDragSolved(exercise.id);
      onSolved?.();
    }
  }, [allCorrect, exercise.id, onSolved]);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-background p-4">
        <div className="text-sm font-medium text-foreground whitespace-pre-wrap">
          {exercise.question}
        </div>
        {exercise.code && (
          <pre className="mt-3 rounded bg-muted/50 border border-border p-3 text-xs overflow-x-auto whitespace-pre font-mono">
            {exercise.code}
          </pre>
        )}
        {isMulti && (
          <div className="mt-2 text-xs text-muted-foreground">
            Flere svar kan være riktige ({correctCount} av {shuffled.length}).
          </div>
        )}
      </div>

      <div className="space-y-2">
        {shuffled.map((opt, i) => {
          const isSelected = selected.has(i);
          const showCorrect = checked && opt.correct;
          const showWrong = checked && !opt.correct && isSelected;
          const showMissed = checked && opt.correct && !isSelected;
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              disabled={checked}
              className={cn(
                "w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors",
                !checked && isSelected && "border-brand bg-brand/5",
                !checked && !isSelected && "border-border hover:bg-accent/40",
                showCorrect && "border-success/60 bg-success/10",
                showWrong && "border-destructive/60 bg-destructive/10",
                showMissed && "border-warning/60 bg-warning/10",
                checked && "cursor-default",
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border",
                    isMulti ? "rounded" : "rounded-full",
                    isSelected
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-border bg-background",
                    showCorrect && "border-success bg-success text-success-foreground",
                    showWrong && "border-destructive bg-destructive text-destructive-foreground",
                  )}
                >
                  {checked ? (
                    opt.correct ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : isSelected ? (
                      <X className="h-3.5 w-3.5" />
                    ) : null
                  ) : isSelected ? (
                    <Check className="h-3 w-3" />
                  ) : null}
                </div>
                <div className="flex-1">
                  <div className="text-foreground">{opt.text}</div>
                  {checked && opt.rationale && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {opt.rationale}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelected(new Set());
            setChecked(false);
          }}
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Nullstill
        </Button>
        {checked ? (
          <div
            className={cn(
              "text-sm font-medium",
              allCorrect ? "text-success" : "text-warning",
            )}
          >
            {allCorrect ? "Riktig!" : "Ikke helt — se forklaringene over"}
          </div>
        ) : (
          <Button onClick={() => setChecked(true)} size="sm" disabled={selected.size === 0}>
            Sjekk svar
          </Button>
        )}
      </div>

      {checked && exercise.explanation && (
        <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          <strong className="text-foreground">Forklaring:</strong> {exercise.explanation}
        </div>
      )}
    </div>
  );
}
