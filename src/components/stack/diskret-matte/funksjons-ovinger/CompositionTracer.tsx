import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X, RotateCcw, Eye, EyeOff, ArrowRight } from "lucide-react";
import { markDragSolved } from "@/lib/learn/dragProgress";

type Mode = "lær" | "prøv";

interface FnSpec {
  label: string; // e.g. "f(x) = x + 1"
  fn: (x: number) => number;
}

export interface CompositionVariant {
  /** Stable id of this variant. */
  id: string;
  /** Display title, e.g. "f(x)=x+1, g(x)=x²". */
  title: string;
  f: FnSpec;
  g: FnSpec;
  /** Inputs to trace, e.g. [0, 1, 2, 3]. */
  xs: number[];
  /** Optional short note shown after a correct solve. */
  explanation?: string;
}

export interface CompositionTracerProps {
  id: string;
  variants: CompositionVariant[];
}

export function CompositionTracer({ id, variants }: CompositionTracerProps) {
  const [vIdx, setVIdx] = useState(0);
  const v = variants[vIdx];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Spor komposisjonen — x → f → g
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs text-muted-foreground">Velg funksjons-par:</span>
        {variants.map((vr, i) => (
          <button
            key={vr.id}
            type="button"
            onClick={() => setVIdx(i)}
            className={cn(
              "px-2.5 py-1 rounded text-[11px] font-mono border transition-colors",
              i === vIdx
                ? "border-brand bg-brand/15 text-foreground"
                : "border-border bg-background hover:bg-muted text-muted-foreground",
            )}
          >
            {vr.title}
          </button>
        ))}
      </div>

      <Tracer key={vIdx} parentId={id} variant={v} />
    </div>
  );
}

function Tracer({ parentId, variant }: { parentId: string; variant: CompositionVariant }) {
  const { f, g, xs, explanation } = variant;
  const expected = useMemo(() => xs.map((x) => ({ mid: f.fn(x), end: g.fn(f.fn(x)) })), [xs, f, g]);

  const [mode, setMode] = useState<Mode>("lær");
  const [inputs, setInputs] = useState<{ mid: string; end: string }[]>(
    xs.map(() => ({ mid: "", end: "" })),
  );
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setInputs(xs.map(() => ({ mid: "", end: "" })));
    setChecked(false);
  }, [xs, mode]);

  function setVal(rowIdx: number, key: "mid" | "end", val: string) {
    setInputs((rows) => rows.map((r, i) => (i === rowIdx ? { ...r, [key]: val } : r)));
    setChecked(false);
  }

  const results = inputs.map((r, i) => {
    const midNum = r.mid.trim() === "" ? null : Number(r.mid);
    const endNum = r.end.trim() === "" ? null : Number(r.end);
    const midOk = midNum !== null && !Number.isNaN(midNum) && midNum === expected[i].mid;
    const endOk = endNum !== null && !Number.isNaN(endNum) && endNum === expected[i].end;
    return { midOk, endOk, midFilled: midNum !== null, endFilled: endNum !== null };
  });

  const allFilled = results.every((r) => r.midFilled && r.endFilled);
  const allCorrect = results.every((r) => r.midOk && r.endOk);

  useEffect(() => {
    if (checked && allCorrect && mode === "prøv") {
      markDragSolved(`disk-funk-comp-${parentId}-${variant.id}`);
    }
  }, [checked, allCorrect, mode, parentId, variant.id]);

  const isLearn = mode === "lær";

  function reset() {
    setInputs(xs.map(() => ({ mid: "", end: "" })));
    setChecked(false);
  }

  return (
    <>
      <div className="flex justify-end mb-2">
        <ModeToggle
          mode={mode}
          setMode={(m) => {
            setMode(m);
            reset();
          }}
        />
      </div>

      <div className="rounded-md border border-border bg-background p-3 font-mono text-xs mb-3 space-y-0.5">
        <div>
          <span className="text-brand">{f.label}</span>
        </div>
        <div>
          <span className="text-brand">{g.label}</span>
        </div>
        <div className="text-muted-foreground pt-1">(g∘f)(x) = g(f(x)) — først f, så g</div>
      </div>

      {isLearn && (
        <div className="text-[11px] text-muted-foreground italic mb-2">
          Lære-modus: hele kjeden er fylt ut. Bytt til «prøv» for å fylle inn selv.
        </div>
      )}

      <div className="space-y-2">
        {xs.map((x, i) => {
          const exp = expected[i];
          const res = results[i];
          const showMid = isLearn ? String(exp.mid) : inputs[i].mid;
          const showEnd = isLearn ? String(exp.end) : inputs[i].end;
          return (
            <div
              key={i}
              className="grid grid-cols-[40px_18px_1fr_18px_1fr] items-center gap-1.5 rounded-lg border border-border bg-background p-2"
            >
              <Cell label="x" value={String(x)} tone="input" />
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              <NumCell
                label={`f(${x})`}
                value={showMid}
                onChange={(v) => setVal(i, "mid", v)}
                disabled={isLearn}
                state={checked && !isLearn ? (res.midOk ? "ok" : "wrong") : undefined}
              />
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              <NumCell
                label={`g(f(${x}))`}
                value={showEnd}
                onChange={(v) => setVal(i, "end", v)}
                disabled={isLearn}
                state={checked && !isLearn ? (res.endOk ? "ok" : "wrong") : undefined}
              />
            </div>
          );
        })}
      </div>

      {!isLearn && (
        <div className="flex items-center gap-2 justify-between mt-3">
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Nullstill
          </Button>
          {checked ? (
            <div
              className={cn("text-sm font-medium", allCorrect ? "text-success" : "text-warning")}
            >
              {allCorrect
                ? "Alle riktige!"
                : `${results.filter((r) => r.midOk && r.endOk).length} av ${xs.length} rader riktige`}
            </div>
          ) : (
            <Button onClick={() => setChecked(true)} size="sm" disabled={!allFilled}>
              {allFilled ? "Sjekk svar" : "Fyll inn alle"}
            </Button>
          )}
        </div>
      )}

      {checked && allCorrect && explanation && !isLearn && (
        <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          <strong className="text-foreground">Forklaring:</strong> {explanation}
        </div>
      )}
    </>
  );
}

function Cell({ label, value }: { label: string; value: string; tone: "input" }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-muted-foreground font-mono">{label}</span>
      <span className="font-mono text-sm font-semibold bg-muted/40 rounded px-2 py-0.5">
        {value}
      </span>
    </div>
  );
}

function NumCell({
  label,
  value,
  onChange,
  disabled,
  state,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  state?: "ok" | "wrong";
}) {
  return (
    <div className="flex flex-col items-stretch">
      <span className="text-[10px] text-muted-foreground font-mono text-center">{label}</span>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "w-full text-center font-mono text-sm rounded px-2 py-1 border bg-background outline-none transition-colors",
            "focus:border-brand focus:ring-1 focus:ring-brand/40",
            disabled && "bg-muted/40 cursor-default",
            state === "ok" && "border-success/60 bg-success/10 text-success",
            state === "wrong" && "border-destructive/60 bg-destructive/10 text-destructive",
            !state && "border-border",
          )}
          aria-label={label}
        />
        {state === "ok" && (
          <Check className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 text-success" />
        )}
        {state === "wrong" && (
          <X className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 text-destructive" />
        )}
      </div>
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
