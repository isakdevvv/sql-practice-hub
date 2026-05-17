import { useMemo, useState } from "react";

/**
 * Compare CV variants on the same synthetic regression dataset.
 * Goal: show that LOO has higher variance (correlated estimates),
 * k=5/10 is the sweet spot, and that effects depend on dataset size.
 */

type Variant = "kfold2" | "kfold5" | "kfold10" | "loo";

const VARIANT_META: Record<Variant, { label: string; k: (n: number) => number }> = {
  kfold2: { label: "2-fold", k: () => 2 },
  kfold5: { label: "5-fold", k: () => 5 },
  kfold10: { label: "10-fold", k: () => 10 },
  loo: { label: "LOO", k: (n) => n },
};

// Deterministic pseudo-random generator
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function makeDataset(n: number, seed: number): { x: number[]; y: number[] } {
  const rnd = lcg(seed);
  const x: number[] = [];
  const y: number[] = [];
  for (let i = 0; i < n; i++) {
    const xi = (i / n) * 10 - 5;
    // y = 0.5 + 1.2 x + 0.1 x^2 + gauss noise
    const u1 = rnd();
    const u2 = rnd();
    const noise = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-9))) * Math.cos(2 * Math.PI * u2);
    x.push(xi);
    y.push(0.5 + 1.2 * xi + 0.1 * xi * xi + noise * 1.5);
  }
  return { x, y };
}

// Fit a simple linear model y = a + b x using least squares on indices
function fitLinear(xs: number[], ys: number[]): { a: number; b: number } {
  const n = xs.length;
  if (n === 0) return { a: 0, b: 0 };
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const b = den === 0 ? 0 : num / den;
  const a = my - b * mx;
  return { a, b };
}

function mse(xs: number[], ys: number[], model: { a: number; b: number }) {
  if (xs.length === 0) return 0;
  let s = 0;
  for (let i = 0; i < xs.length; i++) {
    const pred = model.a + model.b * xs[i];
    s += (ys[i] - pred) ** 2;
  }
  return s / xs.length;
}

function partition(n: number, k: number): number[][] {
  // Equal-ish folds in index order
  const folds: number[][] = Array.from({ length: k }, () => []);
  for (let i = 0; i < n; i++) {
    folds[i % k].push(i);
  }
  return folds;
}

function runCv(variant: Variant, n: number, seed: number): number[] {
  const { x, y } = makeDataset(n, seed);
  const k = VARIANT_META[variant].k(n);
  const folds = partition(n, k);
  const mses: number[] = [];
  for (const testIdx of folds) {
    const trainIdx = Array.from({ length: n }, (_, i) => i).filter((i) => !testIdx.includes(i));
    const xt = trainIdx.map((i) => x[i]);
    const yt = trainIdx.map((i) => y[i]);
    const xv = testIdx.map((i) => x[i]);
    const yv = testIdx.map((i) => y[i]);
    const m = fitLinear(xt, yt);
    mses.push(mse(xv, yv, m));
  }
  return mses;
}

function meanStd(arr: number[]): { mean: number; std: number } {
  if (arr.length === 0) return { mean: 0, std: 0 };
  const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
  const variance = arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length;
  return { mean, std: Math.sqrt(variance) };
}

export function CvVarianceComparison() {
  const [n, setN] = useState<number>(20);
  const [seed, setSeed] = useState<number>(7);

  const results = useMemo(() => {
    const variants: Variant[] = ["kfold2", "kfold5", "kfold10", "loo"];
    return variants.map((v) => {
      const mses = runCv(v, n, seed);
      const { mean, std } = meanStd(mses);
      return { variant: v, mses, mean, std };
    });
  }, [n, seed]);

  // For across-seed-variance: rerun with 5 different seeds and look at how
  // the CV-mean wobbles. This is the "estimator variance".
  const acrossSeed = useMemo(() => {
    const variants: Variant[] = ["kfold2", "kfold5", "kfold10", "loo"];
    return variants.map((v) => {
      const means: number[] = [];
      for (let s = 0; s < 8; s++) {
        const arr = runCv(v, n, seed + s * 137);
        const { mean } = meanStd(arr);
        means.push(mean);
      }
      const stats = meanStd(means);
      return { variant: v, ...stats, samples: means };
    });
  }, [n, seed]);

  const maxFolds = Math.max(...results.map((r) => r.mses.length));
  const allMses = results.flatMap((r) => r.mses);
  const maxMse = Math.max(...allMses, 0.0001);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-xs text-muted-foreground inline-flex items-center gap-2">
          Datasett-størrelse:
          <select
            value={n}
            onChange={(e) => setN(parseInt(e.target.value))}
            className="border border-border bg-background rounded-md px-2 py-1 text-xs font-mono"
          >
            <option value={20}>n=20 (lite)</option>
            <option value={50}>n=50</option>
            <option value={100}>n=100</option>
            <option value={200}>n=200 (stort)</option>
          </select>
        </label>
        <label className="text-xs text-muted-foreground inline-flex items-center gap-2">
          Seed:
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
            className="border border-border bg-background rounded-md px-2 py-1 text-xs font-mono w-20"
          />
        </label>
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="text-xs px-3 py-1 rounded-md border border-border hover:border-brand/40 transition-colors"
        >
          Ny seed
        </button>
      </div>

      {/* Per-fold MSE bars */}
      <div className="rounded-lg border border-border bg-background p-3 mb-4">
        <div className="text-xs font-semibold mb-2">MSE per fold</div>
        <div className="space-y-2">
          {results.map((r) => (
            <div key={r.variant} className="flex items-center gap-2">
              <div className="text-xs font-mono w-16 text-muted-foreground">
                {VARIANT_META[r.variant].label}
              </div>
              <div className="flex-1 flex gap-0.5 h-6 overflow-x-auto">
                {r.mses.slice(0, 30).map((m, i) => (
                  <div
                    key={i}
                    className="bg-brand/60 rounded-sm shrink-0"
                    style={{
                      width: `${Math.max(3, 100 / Math.min(maxFolds, 30))}%`,
                      height: `${(m / maxMse) * 100}%`,
                      alignSelf: "flex-end",
                    }}
                    title={`fold ${i + 1}: MSE ${m.toFixed(3)}`}
                  />
                ))}
                {r.mses.length > 30 && (
                  <div className="text-[10px] text-muted-foreground self-end">
                    +{r.mses.length - 30}
                  </div>
                )}
              </div>
              <div className="text-xs font-mono w-32 text-right text-muted-foreground">
                {r.mean.toFixed(3)} ± {r.std.toFixed(3)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Across-seed table */}
      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left font-semibold px-3 py-2 w-20">Variant</th>
              <th className="text-left font-semibold px-3 py-2">CV-snitt over 8 seeds</th>
              <th className="text-left font-semibold px-3 py-2 w-32">Snitt</th>
              <th className="text-left font-semibold px-3 py-2 w-40">
                Estimator-std (varians mellom seeds)
              </th>
            </tr>
          </thead>
          <tbody>
            {acrossSeed.map((row) => {
              const maxMean = Math.max(...acrossSeed.flatMap((r) => r.samples));
              return (
                <tr key={row.variant} className="border-t border-border">
                  <td className="px-3 py-2 font-mono">
                    {VARIANT_META[row.variant].label}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-end gap-0.5 h-6">
                      {row.samples.map((s, i) => (
                        <div
                          key={i}
                          className="bg-emerald-500/60 rounded-sm"
                          style={{
                            width: "10%",
                            height: `${(s / maxMean) * 100}%`,
                          }}
                          title={`seed ${i}: ${s.toFixed(3)}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono">{row.mean.toFixed(3)}</td>
                  <td className="px-3 py-2 font-mono">
                    <span
                      className={
                        row.variant === "loo"
                          ? "text-rose-400 font-semibold"
                          : row.variant === "kfold5" || row.variant === "kfold10"
                            ? "text-emerald-400"
                            : ""
                      }
                    >
                      {row.std.toFixed(4)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        <strong>Les av:</strong> sammenlign «estimator-std»-kolonnen. På lite
        datasett ser du typisk at LOO ikke er <em>mer</em> stabil enn 5-/10-fold
        på tvers av seeds — fordi modellene LOO trener er nesten identiske og
        feilene korrelerer sterkt. Stort datasett: alle konvergerer mot samme
        snitt, men 5-/10-fold er fortsatt 4-20× raskere.
      </p>
    </div>
  );
}
