import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X, RotateCcw, Eye, EyeOff } from "lucide-react";
import { markDragSolved } from "@/lib/learn/dragProgress";

type Mode = "lær" | "prøv";

export interface FiberPickerProps {
  id: string;
  rule: string;
  A: number[];
  /** Codomain values shown so the user can click between targets. */
  B: number[];
  fn: (x: number) => number;
  /** Which y-values the user is quizzed on. Defaults to all of B. */
  targets?: number[];
  explanation?: string;
}

export function FiberPicker({ id, rule, A, B, fn, targets, explanation }: FiberPickerProps) {
  const qs = useMemo(() => targets ?? B, [targets, B]);
  const [yIdx, setYIdx] = useState(0);
  const y = qs[yIdx];
  const correct = useMemo(() => new Set(A.filter((a) => fn(a) === y)), [A, fn, y]);

  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const [mode, setMode] = useState<Mode>("lær");

  useEffect(() => {
    setPicked(new Set());
    setChecked(false);
  }, [yIdx, mode]);

  function toggle(a: number) {
    if (mode === "lær" || checked) return;
    setPicked((p) => {
      const next = new Set(p);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      return next;
    });
  }

  const correctCount = [...picked].filter((a) => correct.has(a)).length;
  const wrongCount = [...picked].filter((a) => !correct.has(a)).length;
  const missingCount = [...correct].filter((a) => !picked.has(a)).length;
  const allCorrect = wrongCount === 0 && missingCount === 0;

  useEffect(() => {
    if (checked && allCorrect && mode === "prøv") {
      markDragSolved(`disk-funk-fiber-${id}-${y}`);
    }
  }, [checked, allCorrect, mode, id, y]);

  const isLearn = mode === "lær";
  const shown = isLearn ? correct : picked;

  const colA = { cx: 60, cyTop: 50, gap: 32 };
  const colB = { cx: 220, cyTop: 50, gap: 28 };
  const Ay = (i: number) => colA.cyTop + i * colA.gap;
  const By = (i: number) => colB.cyTop + i * colB.gap;
  const svgH = Math.max(Ay(A.length - 1), By(B.length - 1)) + 40;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Fiber f⁻¹({"{y}"}) — hvilke x mapper til y?
        </div>
        <ModeToggle mode={mode} setMode={setMode} />
      </div>

      <div className="rounded-md border border-border bg-background p-3 font-mono text-sm mb-3">
        <span className="text-brand">{rule}</span>
        <span className="text-muted-foreground ml-2 text-xs">A = {"{" + A.join(", ") + "}"}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs text-muted-foreground">Velg y:</span>
        {qs.map((q, i) => (
          <button
            key={q}
            type="button"
            onClick={() => setYIdx(i)}
            className={cn(
              "px-2.5 py-1 rounded text-[11px] font-mono border transition-colors",
              i === yIdx
                ? "border-brand bg-brand/15 text-foreground"
                : "border-border bg-background hover:bg-muted text-muted-foreground",
            )}
          >
            y = {q}
          </button>
        ))}
      </div>

      <div className="text-sm mb-2">
        Klikk alle <code className="font-mono">x ∈ A</code> der{" "}
        <code className="font-mono">f(x) = {y}</code>.
        {isLearn && (
          <span className="ml-2 text-[11px] text-muted-foreground italic">
            (Lære-modus: riktig fiber er markert grønn.)
          </span>
        )}
      </div>

      <div className="grid sm:grid-cols-[280px_1fr] gap-4">
        <svg viewBox={`0 0 280 ${svgH}`} className="w-full max-h-[300px]">
          <text
            x={colA.cx}
            y={20}
            className="fill-muted-foreground text-[11px]"
            textAnchor="middle"
          >
            A
          </text>
          <text
            x={colB.cx}
            y={20}
            className="fill-muted-foreground text-[11px]"
            textAnchor="middle"
          >
            B
          </text>
          {A.map((a, i) => {
            const sel = shown.has(a);
            const isCorrect = correct.has(a);
            const wrong = checked && sel && !isCorrect;
            const missed = checked && !sel && isCorrect;
            return (
              <g
                key={`a-${a}`}
                onClick={() => toggle(a)}
                className={cn(!isLearn && !checked && "cursor-pointer")}
              >
                <circle
                  cx={colA.cx}
                  cy={Ay(i)}
                  r={14}
                  className={cn(
                    "stroke-[1.5] transition-colors",
                    !checked && sel && "fill-brand/40 stroke-brand",
                    !checked && !sel && "fill-muted/40 stroke-border",
                    checked && isCorrect && sel && "fill-emerald-500/40 stroke-emerald-500",
                    wrong && "fill-rose-500/30 stroke-rose-500",
                    missed && "fill-amber-400/30 stroke-amber-500",
                  )}
                />
                <text
                  x={colA.cx}
                  y={Ay(i) + 4}
                  textAnchor="middle"
                  className="fill-foreground text-[11px] font-mono"
                >
                  {a}
                </text>
              </g>
            );
          })}
          {B.map((b, i) => (
            <g key={`b-${b}`}>
              <circle
                cx={colB.cx}
                cy={By(i)}
                r={14}
                className={cn(
                  b === y ? "fill-brand/30 stroke-brand" : "fill-muted/40 stroke-border",
                )}
                strokeWidth={1.5}
              />
              <text
                x={colB.cx}
                y={By(i) + 4}
                textAnchor="middle"
                className="fill-foreground text-[11px] font-mono"
              >
                {b}
              </text>
            </g>
          ))}
          {A.map((a, i) => {
            const target = fn(a);
            const bi = B.indexOf(target);
            if (bi < 0) return null;
            const hit = target === y;
            return (
              <line
                key={`l-${a}`}
                x1={colA.cx + 14}
                y1={Ay(i)}
                x2={colB.cx - 14}
                y2={By(bi)}
                className={hit ? "stroke-brand/70" : "stroke-foreground/25"}
                strokeWidth={hit ? 1.6 : 1.1}
              />
            );
          })}
        </svg>

        <div className="space-y-2">
          <div className="rounded-md border border-border bg-background p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
              Din fiber f⁻¹({"{" + y + "}"})
            </div>
            <div className="font-mono text-sm">
              {shown.size === 0 ? (
                <span className="text-muted-foreground">∅ (tom)</span>
              ) : (
                "{" + [...shown].sort((x, z) => x - z).join(", ") + "}"
              )}
            </div>
          </div>

          {checked && (
            <div className="rounded-md border border-border bg-muted/30 p-3 text-xs space-y-0.5">
              <div className={cn(wrongCount === 0 ? "text-success" : "text-destructive")}>
                {wrongCount === 0 ? "✓ Ingen feilplukk" : `✗ ${wrongCount} feilplukk`}
              </div>
              <div className={cn(missingCount === 0 ? "text-success" : "text-warning")}>
                {missingCount === 0
                  ? "✓ Ingen glemt"
                  : `! ${missingCount} glemt (gule i diagrammet)`}
              </div>
              <div className="text-muted-foreground pt-1">
                Riktig fiber:{" "}
                {correct.size === 0
                  ? "∅"
                  : "{" + [...correct].sort((x, z) => x - z).join(", ") + "}"}
              </div>
            </div>
          )}
        </div>
      </div>

      {!isLearn && (
        <div className="flex items-center gap-2 justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPicked(new Set());
              setChecked(false);
            }}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Nullstill
          </Button>
          {checked ? (
            <div
              className={cn("text-sm font-medium", allCorrect ? "text-success" : "text-warning")}
            >
              {allCorrect ? "Perfekt!" : `${correctCount}/${correct.size} riktige plukk`}
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
