import { useMemo, useState } from "react";

type Mode = "perm" | "comb";

export function ChooseKExplorer() {
  const [n, setN] = useState(5);
  const [k, setK] = useState(3);
  const [mode, setMode] = useState<Mode>("comb");

  const items = useMemo(() => ["A", "B", "C", "D", "E", "F", "G", "H"].slice(0, n), [n]);

  const arrangements = useMemo(() => {
    if (k > n) return [];
    return mode === "comb" ? combinations(items, k) : permutations(items, k);
  }, [items, k, mode, n]);

  const total = arrangements.length;
  const formula =
    mode === "comb"
      ? `C(${n}, ${k}) = ${n}! / (${k}! · ${n - k}!) = ${total}`
      : `P(${n}, ${k}) = ${n}! / ${n - k}! = ${total}`;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          n-velg-k — perm vs. komb
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode("perm")}
            className={`px-2.5 py-1 rounded text-[11px] font-medium border ${
              mode === "perm" ? "border-brand bg-brand/15" : "border-border bg-background hover:bg-muted"
            }`}
          >
            Permutasjon (rekkefølge)
          </button>
          <button
            type="button"
            onClick={() => setMode("comb")}
            className={`px-2.5 py-1 rounded text-[11px] font-medium border ${
              mode === "comb" ? "border-brand bg-brand/15" : "border-border bg-background hover:bg-muted"
            }`}
          >
            Kombinasjon (ikke rekkefølge)
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <label className="text-xs space-y-1">
          <span className="text-muted-foreground">
            n (mengde-størrelse): <span className="text-foreground font-mono">{n}</span>
          </span>
          <input
            type="range"
            min={1}
            max={8}
            value={n}
            onChange={(e) => {
              const nv = Number.parseInt(e.target.value, 10);
              setN(nv);
              if (k > nv) setK(nv);
            }}
            className="w-full accent-brand"
          />
        </label>
        <label className="text-xs space-y-1">
          <span className="text-muted-foreground">
            k (uttrekk): <span className="text-foreground font-mono">{k}</span>
          </span>
          <input
            type="range"
            min={0}
            max={n}
            value={k}
            onChange={(e) => setK(Number.parseInt(e.target.value, 10))}
            className="w-full accent-brand"
          />
        </label>
      </div>

      <div className="rounded-md border border-border bg-background p-3 mb-3 font-mono text-xs">
        <div className="text-brand">{formula}</div>
        <div className="text-muted-foreground mt-1">
          {mode === "comb"
            ? `«Hvor mange måter å velge ${k} av ${n}?»  ${total} ulike utvalg.`
            : `«Hvor mange måter å arrangere ${k} av ${n}?» ${total} ulike rekkefølger.`}
        </div>
      </div>

      <div className="text-[11px] text-muted-foreground mb-1.5">
        {arrangements.length === 0
          ? "k > n — ingen lovlige uttrekk."
          : `Alle ${arrangements.length} ${mode === "comb" ? "utvalg" : "rekkefølger"}:`}
      </div>
      <div className="flex flex-wrap gap-1 max-h-40 overflow-auto">
        {arrangements.slice(0, 200).map((arr, i) => (
          <span
            key={i}
            className="px-1.5 py-0.5 rounded border border-border bg-muted/30 font-mono text-[11px]"
          >
            {arr.join(mode === "comb" ? "" : "")}
          </span>
        ))}
        {arrangements.length > 200 && (
          <span className="text-[11px] text-muted-foreground italic">
            …{arrangements.length - 200} til
          </span>
        )}
      </div>

      {mode === "perm" && k > 0 && k <= n && arrangements.length > 0 && (
        <div className="mt-3 text-[11px] text-muted-foreground italic">
          Tips: hver kombinasjon gir {factorial(k)} permutasjoner ({k}! omarrangeringer).
          P(n, k) = C(n, k) · k!
        </div>
      )}
    </div>
  );
}

function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (k > arr.length) return [];
  const [head, ...tail] = arr;
  const withHead = combinations(tail, k - 1).map((c) => [head, ...c]);
  const without = combinations(tail, k);
  return [...withHead, ...without];
}

function permutations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest, k - 1)) {
      out.push([arr[i], ...p]);
    }
  }
  return out;
}

function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
