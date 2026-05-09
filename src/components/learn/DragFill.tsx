import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X, RotateCcw } from "lucide-react";
import type { FillExercise } from "@/lib/learn/types";

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface Token {
  /** unique id (allows duplicate values like multiple "FROM"s) */
  uid: string;
  value: string;
}

function makeTokens(values: string[]): Token[] {
  return values.map((v, i) => ({ uid: `${v}-${i}`, value: v }));
}

export function DragFill({ exercise }: { exercise: FillExercise }) {
  // Pool of available tokens.
  const [pool, setPool] = useState<Token[]>(() => shuffle(makeTokens(exercise.options)));
  // For each blank index, the token uid placed there (or null).
  const [placed, setPlaced] = useState<Record<number, Token | null>>({});
  const [dragging, setDragging] = useState<{ token: Token; from: "pool" | number } | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setPool(shuffle(makeTokens(exercise.options)));
    setPlaced({});
    setChecked(false);
  }, [exercise.id]);

  // Parse template into segments — text + blank placeholders
  const segments = useMemo(() => parseTemplate(exercise.template), [exercise.template]);

  function onDropOnBlank(blankIdx: number) {
    if (!dragging) return;
    const { token, from } = dragging;

    // What is currently in the target?
    const existing = placed[blankIdx] ?? null;

    setPlaced((prev) => {
      const next = { ...prev };
      next[blankIdx] = token;
      // If swapping between two blanks, push existing back to source blank
      if (typeof from === "number") {
        next[from] = existing;
      }
      return next;
    });

    if (from === "pool") {
      setPool((p) => p.filter((t) => t.uid !== token.uid));
      // If there was an existing token in target, return it to pool
      if (existing) {
        setPool((p) => [...p, existing]);
      }
    }
    setDragging(null);
  }

  function onDropOnPool() {
    if (!dragging || dragging.from === "pool") {
      setDragging(null);
      return;
    }
    const blankIdx = dragging.from as number;
    setPool((p) => [...p, dragging.token]);
    setPlaced((prev) => ({ ...prev, [blankIdx]: null }));
    setDragging(null);
  }

  function reset() {
    setPool(shuffle(makeTokens(exercise.options)));
    setPlaced({});
    setChecked(false);
  }

  const correctCount = useMemo(() => {
    let n = 0;
    for (let i = 0; i < exercise.blanks.length; i++) {
      if (placed[i]?.value === exercise.blanks[i]) n++;
    }
    return n;
  }, [placed, exercise.blanks]);

  const allFilled = exercise.blanks.every((_, i) => placed[i]);
  const allCorrect = correctCount === exercise.blanks.length;

  return (
    <div className="space-y-4">
      {exercise.example ? (
        <div className="rounded-lg border border-success/30 bg-success/5 p-3">
          <div className="text-[10px] uppercase tracking-wider text-success font-semibold mb-1.5">
            Eksempel — slik ser ferdig kode ut
          </div>
          <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-foreground/90 overflow-x-auto">
            {exercise.example}
          </pre>
        </div>
      ) : null}

      <div className="rounded-lg border border-border bg-card p-4 font-mono text-sm leading-7 whitespace-pre-wrap">
        {segments.map((seg, i) => {
          if (seg.kind === "text") return <span key={i}>{seg.text}</span>;
          const blankIdx = seg.blankIdx;
          const token = placed[blankIdx];
          const expected = exercise.blanks[blankIdx];
          const correct = checked && token?.value === expected;
          const wrong = checked && token && token.value !== expected;
          return (
            <span
              key={i}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDropOnBlank(blankIdx)}
              className={cn(
                "inline-flex items-center justify-center align-middle rounded border-2 border-dashed mx-0.5 px-2 min-w-[80px] h-7 text-xs",
                token ? "border-transparent bg-muted/60" : "border-border/60",
                correct && "!border-success/60 !bg-success/15 text-success",
                wrong && "!border-destructive/60 !bg-destructive/15 text-destructive",
              )}
            >
              {token ? (
                <span
                  draggable
                  onDragStart={() => setDragging({ token, from: blankIdx })}
                  className="cursor-grab active:cursor-grabbing inline-flex items-center gap-1"
                >
                  {checked && (correct ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />)}
                  {token.value}
                </span>
              ) : (
                <span className="text-muted-foreground italic">__{blankIdx + 1}__</span>
              )}
            </span>
          );
        })}
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDropOnPool}
        className="rounded-lg border border-dashed border-border bg-muted/20 p-3"
      >
        <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
          Tilgjengelige nøkkelord
        </div>
        <div className="flex flex-wrap gap-2">
          {pool.length === 0 ? (
            <span className="text-xs text-muted-foreground italic">Tomt</span>
          ) : (
            pool.map((t) => (
              <div
                key={t.uid}
                draggable
                onDragStart={() => setDragging({ token: t, from: "pool" })}
                className="rounded-md border border-border bg-background px-3 py-1 font-mono text-xs cursor-grab active:cursor-grabbing hover:border-brand/60"
              >
                {t.value}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 justify-between">
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Nullstill
        </Button>
        {checked ? (
          <div
            className={cn(
              "text-sm font-medium",
              allCorrect ? "text-success" : "text-warning",
            )}
          >
            {correctCount} av {exercise.blanks.length} riktig
          </div>
        ) : (
          <Button onClick={() => setChecked(true)} disabled={!allFilled} size="sm">
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

interface TextSeg {
  kind: "text";
  text: string;
}
interface BlankSeg {
  kind: "blank";
  blankIdx: number;
}
type Seg = TextSeg | BlankSeg;

function parseTemplate(template: string): Seg[] {
  const out: Seg[] = [];
  const re = /__(\d+)__/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(template)) !== null) {
    if (m.index > last) {
      out.push({ kind: "text", text: template.slice(last, m.index) });
    }
    out.push({ kind: "blank", blankIdx: parseInt(m[1], 10) - 1 });
    last = m.index + m[0].length;
  }
  if (last < template.length) {
    out.push({ kind: "text", text: template.slice(last) });
  }
  return out;
}
