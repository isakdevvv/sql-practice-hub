import { useMemo, useState } from "react";
import { iqr, mean, median, mulberry32, quantile, randn, stdDev, trimmedMean } from "./descUtils";

/**
 * OutlierImpactDemo — viser hvor mye outliers påvirker hver metrikk.
 * Bruker en deterministisk symmetrisk N(50, 5²)-baseline; brukeren legger
 * til outliers og ser at mean/std reagerer voldsomt mens median/IQR knapt rikker seg.
 */

const N = 20;
const BASE_MU = 50;
const BASE_SD = 5;

function makeBase(): number[] {
  const rng = mulberry32(424242);
  const xs: number[] = [];
  for (let i = 0; i < N; i++) xs.push(BASE_MU + BASE_SD * randn(rng));
  return xs;
}

export function OutlierImpactDemo() {
  const base = useMemo(makeBase, []);
  const [extras, setExtras] = useState<number[]>([]);
  const [trim, setTrim] = useState<boolean>(false);

  const dataNoTrim = useMemo(() => [...base, ...extras], [base, extras]);

  const baseStats = useMemo(
    () => ({
      mean: mean(base),
      median: median(base),
      std: stdDev(base, true),
      iqr: iqr(base),
      tmean: trimmedMean(base, 0.1),
    }),
    [base],
  );
  const liveStats = useMemo(
    () => ({
      mean: mean(dataNoTrim),
      median: median(dataNoTrim),
      std: stdDev(dataNoTrim, true),
      iqr: iqr(dataNoTrim),
      tmean: trimmedMean(dataNoTrim, 0.1),
    }),
    [dataNoTrim],
  );

  const addOutlier = (sign: 1 | -1) => {
    // 5σ outlier relative to original baseline
    setExtras((cur) => [...cur, BASE_MU + sign * 5 * BASE_SD + sign * cur.length * 2]);
  };
  const reset = () => setExtras([]);

  // Plot
  const W = 540;
  const H = 150;
  const PAD_L = 30;
  const PAD_R = 14;
  const Y_AXIS = H - 50;
  const allMin = Math.min(...dataNoTrim, 30);
  const allMax = Math.max(...dataNoTrim, 70);
  const span = Math.max(20, allMax - allMin);
  const lo = allMin - span * 0.05;
  const hi = allMax + span * 0.05;
  const sx = (x: number) => PAD_L + ((x - lo) / (hi - lo)) * (W - PAD_L - PAD_R);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => addOutlier(1)}
          className="px-2.5 py-1 rounded text-xs font-medium border border-rose-500/40 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
        >
          + outlier (høyt)
        </button>
        <button
          type="button"
          onClick={() => addOutlier(-1)}
          className="px-2.5 py-1 rounded text-xs font-medium border border-rose-500/40 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
        >
          + outlier (lavt)
        </button>
        <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground ml-2">
          <input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} />
          Vis 10% trimmed mean
        </label>
        <button
          type="button"
          onClick={reset}
          className="ml-auto px-2.5 py-1 rounded text-xs font-medium border border-border bg-background hover:bg-muted"
        >
          Reset
        </button>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block bg-background rounded">
        {/* x-akse */}
        <line
          x1={PAD_L}
          y1={Y_AXIS}
          x2={W - PAD_R}
          y2={Y_AXIS}
          stroke="currentColor"
          className="text-muted-foreground"
        />
        {[lo, (lo + hi) / 2, hi].map((g) => (
          <text
            key={g}
            x={sx(g)}
            y={Y_AXIS + 14}
            fontSize={9}
            className="fill-muted-foreground"
            textAnchor="middle"
          >
            {g.toFixed(0)}
          </text>
        ))}
        {/* base-punkter */}
        {base.map((v, i) => (
          <circle
            key={`b${i}`}
            cx={sx(v).toFixed(2)}
            cy={Y_AXIS - 8}
            r={4}
            fill="#3b82f6"
            opacity={0.7}
          />
        ))}
        {/* outliers */}
        {extras.map((v, i) => (
          <circle
            key={`o${i}`}
            cx={sx(v).toFixed(2)}
            cy={Y_AXIS - 8}
            r={5}
            fill="#f43f5e"
            stroke="#fff"
            strokeWidth={1}
          />
        ))}

        {/* mean */}
        <g>
          <line
            x1={sx(liveStats.mean)}
            y1={20}
            x2={sx(liveStats.mean)}
            y2={Y_AXIS}
            stroke="#22c55e"
            strokeWidth={2}
          />
          <text x={sx(liveStats.mean) + 4} y={26} fontSize={10} className="fill-emerald-500">
            mean
          </text>
        </g>
        {/* median */}
        <g>
          <line
            x1={sx(liveStats.median)}
            y1={20}
            x2={sx(liveStats.median)}
            y2={Y_AXIS}
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 4"
          />
          <text x={sx(liveStats.median) + 4} y={40} fontSize={10} className="fill-amber-500">
            median
          </text>
        </g>
        {/* trimmed */}
        {trim && (
          <g>
            <line
              x1={sx(liveStats.tmean)}
              y1={20}
              x2={sx(liveStats.tmean)}
              y2={Y_AXIS}
              stroke="#a855f7"
              strokeWidth={2}
              strokeDasharray="2 3"
            />
            <text x={sx(liveStats.tmean) + 4} y={54} fontSize={10} className="fill-purple-500">
              trim 10%
            </text>
          </g>
        )}
        {/* IQR-boks */}
        <rect
          x={sx(quantile(dataNoTrim, 0.25))}
          y={Y_AXIS - 24}
          width={sx(quantile(dataNoTrim, 0.75)) - sx(quantile(dataNoTrim, 0.25))}
          height={32}
          fill="none"
          stroke="#a855f7"
          opacity={0.5}
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      </svg>

      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        <Block
          title="Baseline (ingen outliers)"
          rows={[
            ["mean", baseStats.mean.toFixed(2)],
            ["median", baseStats.median.toFixed(2)],
            ["std", baseStats.std.toFixed(2)],
            ["IQR", baseStats.iqr.toFixed(2)],
          ]}
        />
        <Block
          title={`Live (${extras.length} outlier${extras.length === 1 ? "" : "s"})`}
          rows={[
            ["mean", liveStats.mean.toFixed(2), liveStats.mean - baseStats.mean],
            ["median", liveStats.median.toFixed(2), liveStats.median - baseStats.median],
            ["std", liveStats.std.toFixed(2), liveStats.std - baseStats.std],
            ["IQR", liveStats.iqr.toFixed(2), liveStats.iqr - baseStats.iqr],
            ...(trim
              ? [
                  ["trim 10%", liveStats.tmean.toFixed(2), liveStats.tmean - baseStats.tmean] as [
                    string,
                    string,
                    number,
                  ],
                ]
              : []),
          ]}
        />
      </div>

      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-foreground">
        <strong>Observasjon:</strong> mean og std reagerer dramatisk på hver outlier (skala med
        antall og avstand). Median og IQR knapt rikker seg. Trimmed mean (kutt 10% i hver hale før
        gjennomsnitt) er en mellomting: bruker mer info enn median, men er robust mot få outliers.
      </div>
    </div>
  );
}

function Block({
  title,
  rows,
}: {
  title: string;
  rows: ([string, string] | [string, string, number])[];
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">{title}</div>
      <div className="space-y-1">
        {rows.map(([label, value, delta]) => (
          <div key={label} className="flex justify-between items-baseline gap-2 font-mono">
            <span className="text-muted-foreground text-[11px]">{label}</span>
            <span>
              {value}
              {delta !== undefined && Math.abs(delta) > 0.01 && (
                <span
                  className={`ml-2 text-[10px] ${
                    Math.abs(delta) > 2 ? "text-rose-500" : "text-amber-500"
                  }`}
                >
                  {delta > 0 ? "+" : ""}
                  {delta.toFixed(2)}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
