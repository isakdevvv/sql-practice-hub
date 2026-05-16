import { useEffect, useState } from "react";
import { Play, RotateCcw } from "lucide-react";

const N = 10;

export function InductionDominoes() {
  const [fallen, setFallen] = useState<number[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (fallen.length >= N) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => {
      setFallen((arr) => [...arr, arr.length + 1]);
    }, 350);
    return () => clearTimeout(t);
  }, [running, fallen]);

  const start = () => {
    setFallen([]);
    setRunning(true);
  };

  const reset = () => {
    setFallen([]);
    setRunning(false);
  };

  const sum = (fallen[fallen.length - 1] ?? 0) * (fallen[fallen.length - 1] + 1) / 2 || 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        Induksjon — domino-modellen
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Basis = vipp første brikke. Steg = «hvis brikke k faller, faller brikke k+1». Da
        faller alle.
      </p>

      <div className="flex justify-center items-end gap-1 h-24 mb-2">
        {Array.from({ length: N }).map((_, i) => {
          const idx = i + 1;
          const down = fallen.includes(idx);
          return (
            <div
              key={idx}
              className={`w-5 transition-all duration-300 origin-bottom-left ${
                down
                  ? "bg-brand/70 border-brand h-3 rotate-[-75deg] translate-x-2"
                  : "bg-foreground/80 border-border h-16"
              }`}
              style={{
                borderWidth: 1,
              }}
              title={`Brikke ${idx}`}
            >
              <div className="text-[9px] text-background text-center mt-1">{idx}</div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={start}
          disabled={running}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border border-brand bg-brand/15 hover:bg-brand/25 disabled:opacity-40"
        >
          <Play className="h-3.5 w-3.5" /> Velt
        </button>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border border-border bg-background hover:bg-muted"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
        <span className="text-[11px] text-muted-foreground ml-auto font-mono">
          falt: {fallen.length} / {N}
        </span>
      </div>

      <div className="rounded-md border border-border bg-background p-3 font-mono text-xs space-y-1">
        <div className="text-muted-foreground">
          Påstand: P(n): Σᵢ₌₁ⁿ i = n(n+1)/2
        </div>
        <div className="text-foreground">
          Σ₁..{fallen.length} = <span className="text-brand">{sum}</span>
          {fallen.length > 0 && (
            <span className="text-muted-foreground">
              {"   "}vs. formel {fallen.length}·{fallen.length + 1}/2 ={" "}
              {(fallen.length * (fallen.length + 1)) / 2}
            </span>
          )}
        </div>
        <div className="text-[10px] text-muted-foreground pt-1 border-t border-border mt-2">
          Steg-bevis: anta Σ₁..k = k(k+1)/2. Da Σ₁..(k+1) = k(k+1)/2 + (k+1) = (k+1)(k+2)/2 ✓
        </div>
      </div>
    </div>
  );
}
