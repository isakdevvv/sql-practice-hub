import { useMemo, useState } from "react";

export function PascalTriangle() {
  const [rows, setRows] = useState(7);
  const [highlight, setHighlight] = useState<{ n: number; k: number } | null>({ n: 4, k: 2 });

  const triangle = useMemo(() => {
    const t: number[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: number[] = [];
      for (let k = 0; k <= i; k++) {
        row.push(choose(i, k));
      }
      t.push(row);
    }
    return t;
  }, [rows]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        Pascals trekant — klikk på et tall
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Hver verdi C(n,k) er sum av de to over: C(n−1, k−1) + C(n−1, k). Rad-summen er 2ⁿ.
      </p>

      <label className="block text-xs mb-3">
        <span className="text-muted-foreground">
          Antall rader: <span className="text-foreground font-mono">{rows}</span>
        </span>
        <input
          type="range"
          min={4}
          max={12}
          value={rows}
          onChange={(e) => setRows(Number.parseInt(e.target.value, 10))}
          className="w-full accent-brand"
        />
      </label>

      <div className="flex flex-col items-center space-y-1 mb-3 overflow-x-auto">
        {triangle.map((row, n) => (
          <div key={n} className="flex gap-1.5 items-center">
            <span className="text-[10px] text-muted-foreground w-10 text-right font-mono">
              Σ = {row.reduce((a, b) => a + b, 0)}
            </span>
            {row.map((val, k) => {
              const isHL = highlight?.n === n && highlight?.k === k;
              const isParent =
                highlight &&
                n === highlight.n - 1 &&
                (k === highlight.k - 1 || k === highlight.k);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setHighlight({ n, k })}
                  className={`min-w-[28px] h-7 px-1.5 rounded text-[11px] font-mono border transition-colors ${
                    isHL
                      ? "border-brand bg-brand text-brand-foreground"
                      : isParent
                        ? "border-brand/60 bg-brand/20 text-foreground"
                        : "border-border bg-background hover:bg-muted text-foreground"
                  }`}
                  title={`C(${n}, ${k})`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {highlight && (
        <div className="rounded-md border border-border bg-background p-3 font-mono text-xs">
          <div className="text-brand">
            C({highlight.n}, {highlight.k}) = {choose(highlight.n, highlight.k)}
          </div>
          <div className="text-muted-foreground mt-1">
            = {highlight.n}! / ({highlight.k}! · {highlight.n - highlight.k}!)
          </div>
          {highlight.n > 0 && highlight.k > 0 && highlight.k < highlight.n && (
            <div className="text-[10px] text-muted-foreground mt-1 pt-1 border-t border-border">
              Rekurrens: C({highlight.n - 1}, {highlight.k - 1}) + C({highlight.n - 1}, {highlight.k})
              {" = "}
              {choose(highlight.n - 1, highlight.k - 1)} + {choose(highlight.n - 1, highlight.k)}
              {" = "}
              {choose(highlight.n, highlight.k)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let num = 1;
  let den = 1;
  for (let i = 0; i < k; i++) {
    num *= n - i;
    den *= i + 1;
  }
  return num / den;
}
