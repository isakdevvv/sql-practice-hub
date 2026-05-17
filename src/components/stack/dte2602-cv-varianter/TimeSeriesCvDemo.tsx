import { useMemo, useState } from "react";

/**
 * Time-series CV demo:
 * - 100 points with a clear upward trend over time
 * - Plain k-fold (FORBIDDEN for timeseries): train can include "future" relative to test → lookahead bias
 * - TimeSeriesSplit: expanding window
 * - Walking forward: sliding window
 *
 * Show how different the CV-scores get for the same naive model.
 */

const N = 100;

type Mode = "kfold" | "tssplit" | "walking";

function makeSeries(): { t: number[]; y: number[] } {
  const t: number[] = [];
  const y: number[] = [];
  for (let i = 0; i < N; i++) {
    // upward linear trend with some seasonality and noise
    const trend = 0.05 * i;
    const season = Math.sin(i * 0.4) * 0.6;
    const noise = ((i * 9301 + 49297) % 233280) / 233280 - 0.5;
    t.push(i);
    y.push(2 + trend + season + noise * 0.4);
  }
  return { t, y };
}

function plainKFoldSplits(k: number): { train: number[]; test: number[] }[] {
  const splits: { train: number[]; test: number[] }[] = [];
  const idxs = Array.from({ length: N }, (_, i) => i);
  // Interleaved fold assignment (i % k) — this is what plain KFold(shuffle=False) gives in chunks,
  // but here we use round-robin for max contrast
  for (let f = 0; f < k; f++) {
    const test = idxs.filter((i) => i % k === f);
    const train = idxs.filter((i) => i % k !== f);
    splits.push({ train, test });
  }
  return splits;
}

function tsSplitExpanding(k: number): { train: number[]; test: number[] }[] {
  const splits: { train: number[]; test: number[] }[] = [];
  const fold = Math.floor(N / (k + 1));
  for (let f = 0; f < k; f++) {
    const trainEnd = fold * (f + 1);
    const testStart = trainEnd;
    const testEnd = Math.min(N, trainEnd + fold);
    const train = Array.from({ length: trainEnd }, (_, i) => i);
    const test = Array.from({ length: testEnd - testStart }, (_, i) => testStart + i);
    splits.push({ train, test });
  }
  return splits;
}

function walkingForward(k: number): { train: number[]; test: number[] }[] {
  // Sliding window: train window stays fixed size
  const splits: { train: number[]; test: number[] }[] = [];
  const windowSize = Math.floor(N / (k + 1)) * 2;
  const testSize = Math.floor(N / (k + 1));
  for (let f = 0; f < k; f++) {
    const trainStart = f * testSize;
    const trainEnd = trainStart + windowSize;
    const testStart = trainEnd;
    const testEnd = Math.min(N, testStart + testSize);
    if (testEnd <= testStart || trainEnd > N) break;
    const train = Array.from({ length: trainEnd - trainStart }, (_, i) => trainStart + i);
    const test = Array.from({ length: testEnd - testStart }, (_, i) => testStart + i);
    splits.push({ train, test });
  }
  return splits;
}

// Fit y = a + b*t, then mean squared error on test
function fitAndScore(
  series: { t: number[]; y: number[] },
  split: { train: number[]; test: number[] },
): number {
  const xs = split.train.map((i) => series.t[i]);
  const ys = split.train.map((i) => series.y[i]);
  const n = xs.length;
  if (n === 0) return 0;
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
  let mse = 0;
  for (const ti of split.test) {
    const pred = a + b * series.t[ti];
    mse += (series.y[ti] - pred) ** 2;
  }
  return mse / Math.max(1, split.test.length);
}

export function TimeSeriesCvDemo() {
  const [mode, setMode] = useState<Mode>("kfold");
  const [fold, setFold] = useState(0);
  const series = useMemo(() => makeSeries(), []);
  const k = 5;
  const splits = useMemo(() => {
    if (mode === "kfold") return plainKFoldSplits(k);
    if (mode === "tssplit") return tsSplitExpanding(k);
    return walkingForward(k);
  }, [mode]);

  const f = Math.min(fold, splits.length - 1);
  const cur = splits[f];

  // MSE per fold (for all 3 modes — to show difference)
  const allModes: { mode: Mode; label: string; mses: number[] }[] = useMemo(() => {
    const opts: { mode: Mode; label: string; fn: () => ReturnType<typeof plainKFoldSplits> }[] = [
      { mode: "kfold", label: "Plain k-fold (forbudt)", fn: () => plainKFoldSplits(k) },
      { mode: "tssplit", label: "TimeSeriesSplit (expanding)", fn: () => tsSplitExpanding(k) },
      { mode: "walking", label: "Walking forward (sliding)", fn: () => walkingForward(k) },
    ];
    return opts.map((o) => ({
      mode: o.mode,
      label: o.label,
      mses: o.fn().map((s) => fitAndScore(series, s)),
    }));
  }, [series]);

  // SVG plot
  const W = 600;
  const H = 160;
  const padL = 30;
  const padR = 10;
  const padT = 10;
  const padB = 20;
  const yMin = Math.min(...series.y) - 0.5;
  const yMax = Math.max(...series.y) + 0.5;
  const scaleX = (i: number) => padL + ((W - padL - padR) * i) / (N - 1);
  const scaleY = (yv: number) => padT + (H - padT - padB) * (1 - (yv - yMin) / (yMax - yMin));

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="text-xs text-muted-foreground mr-2">Strategi:</div>
        {(["kfold", "tssplit", "walking"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setFold(0);
            }}
            className={`px-3 py-1 rounded-md text-xs font-mono border transition-colors ${
              mode === m
                ? "border-brand bg-brand/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:border-brand/40"
            }`}
          >
            {m === "kfold"
              ? "Plain k-fold (forbudt)"
              : m === "tssplit"
                ? "TimeSeriesSplit"
                : "Walking forward"}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <label className="text-xs text-muted-foreground">
          Fold: {f + 1} / {splits.length}
        </label>
        <input
          type="range"
          min={0}
          max={splits.length - 1}
          value={f}
          onChange={(e) => setFold(parseInt(e.target.value))}
          className="flex-1"
        />
      </div>

      {/* SVG plot */}
      <div className="rounded-lg border border-border bg-background overflow-x-auto">
        <svg width={W} height={H} className="block min-w-fit">
          {/* zero-line */}
          <line
            x1={padL}
            x2={W - padR}
            y1={scaleY(0)}
            y2={scaleY(0)}
            className="stroke-border"
            strokeWidth="0.5"
          />
          {/* points */}
          {series.t.map((ti) => {
            const inTrain = cur.train.includes(ti);
            const inTest = cur.test.includes(ti);
            const cls = inTrain
              ? "fill-emerald-500"
              : inTest
                ? "fill-rose-500"
                : "fill-muted-foreground/30";
            return (
              <circle
                key={ti}
                cx={scaleX(ti)}
                cy={scaleY(series.y[ti])}
                r="2.5"
                className={cls}
              >
                <title>
                  t={ti} y={series.y[ti].toFixed(2)} ·{" "}
                  {inTrain ? "train" : inTest ? "test" : "ubrukt"}
                </title>
              </circle>
            );
          })}
          {/* x-axis labels */}
          <text x={padL} y={H - 4} className="fill-muted-foreground text-[9px]">
            t=0
          </text>
          <text x={W - padR - 20} y={H - 4} className="fill-muted-foreground text-[9px]">
            t=99
          </text>
        </svg>
      </div>

      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
          train
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />
          test
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          ubrukt i denne folden
        </span>
      </div>

      {/* MSE comparison */}
      <div className="mt-4 rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left font-semibold px-3 py-2">Strategi</th>
              <th className="text-left font-semibold px-3 py-2">MSE per fold</th>
              <th className="text-left font-semibold px-3 py-2 w-32">CV-snitt</th>
            </tr>
          </thead>
          <tbody>
            {allModes.map((m) => {
              const mean = m.mses.reduce((s, v) => s + v, 0) / m.mses.length;
              return (
                <tr key={m.mode} className="border-t border-border">
                  <td className="px-3 py-2 font-mono">{m.label}</td>
                  <td className="px-3 py-2 font-mono text-[10px]">
                    {m.mses.map((v) => v.toFixed(2)).join(", ")}
                  </td>
                  <td
                    className={`px-3 py-2 font-mono font-semibold ${
                      m.mode === "kfold" ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {mean.toFixed(3)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        <strong>Lookahead-bias:</strong> plain k-fold rapporterer typisk{" "}
        <em>lavere</em> MSE fordi modellen har sett t=50, 90 (framtid) når den
        skal predikere t=30 (fortid). Det er IKKE realistisk i produksjon.
        TimeSeriesSplit og walking forward holder rekkefølgen og gir et
        ærlig estimat — ofte høyere, men det er det du faktisk vil oppnå med
        en deployet modell.
      </p>
    </div>
  );
}
