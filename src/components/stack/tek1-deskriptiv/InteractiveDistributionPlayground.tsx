import { useCallback, useMemo, useRef, useState } from "react";
import {
  histogram,
  iqr,
  kurtosis,
  mean,
  median,
  mode,
  quantile,
  range as rangeFn,
  skewness,
  stdDev,
  variance,
} from "./descUtils";

/**
 * InteractiveDistributionPlayground — drag punkter på 1D x-aksen
 * og se hvert deskriptivt mål oppdateres live. Toggles for histogram
 * og boksplott. Side-panel viser samtlige tall.
 */

type ViewMode = "scatter" | "histogram" | "boxplot";

const INITIAL: number[] = [
  2.1, 3.0, 3.4, 3.9, 4.2, 4.6, 4.8, 5.1, 5.3, 5.6, 5.9, 6.1, 6.4, 6.8, 7.0, 7.4, 7.9, 8.4, 9.0,
  9.7,
];

const X_MIN = 0;
const X_MAX = 12;

export function InteractiveDistributionPlayground() {
  const [xs, setXs] = useState<number[]>(INITIAL);
  const [view, setView] = useState<ViewMode>("scatter");
  const [bins, setBins] = useState<number>(10);
  const [showOverlay, setShowOverlay] = useState<boolean>(true);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const W = 540;
  const H = 220;
  const PAD_L = 30;
  const PAD_R = 14;
  const PAD_T = 24;
  const PAD_B = 38;

  const sx = useCallback(
    (x: number) => PAD_L + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - PAD_L - PAD_R),
    [],
  );
  const invX = useCallback(
    (px: number) => X_MIN + ((px - PAD_L) / (W - PAD_L - PAD_R)) * (X_MAX - X_MIN),
    [],
  );

  // Stat-beregninger
  const m = useMemo(() => mean(xs), [xs]);
  const med = useMemo(() => median(xs), [xs]);
  const mo = useMemo(() => mode(xs, bins), [xs, bins]);
  const sd = useMemo(() => stdDev(xs, true), [xs]);
  const vr = useMemo(() => variance(xs, true), [xs]);
  const rng = useMemo(() => rangeFn(xs), [xs]);
  const q1 = useMemo(() => quantile(xs, 0.25), [xs]);
  const q3 = useMemo(() => quantile(xs, 0.75), [xs]);
  const iqrV = useMemo(() => iqr(xs), [xs]);
  const sk = useMemo(() => skewness(xs), [xs]);
  const ku = useMemo(() => kurtosis(xs), [xs]);

  const hist = useMemo(() => histogram(xs, bins, X_MIN, X_MAX), [xs, bins]);
  const maxBin = Math.max(1, ...hist.map((b) => b.count));

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragIdx === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const nx = Math.max(X_MIN, Math.min(X_MAX, invX(px)));
    setXs((prev) => prev.map((v, i) => (i === dragIdx ? nx : v)));
  };

  // Plot-layout
  const yScatter = H - PAD_B - 30;
  const meanY = yScatter;
  const medY = yScatter;
  const bandTop = yScatter - 18;
  const bandBot = yScatter + 18;

  return (
    <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand">Visning:</span>
        {(["scatter", "histogram", "boxplot"] as ViewMode[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition ${
              view === v
                ? "bg-brand text-white border-brand"
                : "border-border bg-card hover:bg-muted"
            }`}
          >
            {v === "scatter" ? "Scatter" : v === "histogram" ? "Histogram" : "Boxplot"}
          </button>
        ))}
        {view === "histogram" && (
          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground ml-2">
            Bins
            <input
              type="range"
              min={4}
              max={24}
              value={bins}
              onChange={(e) => setBins(+e.target.value)}
              className="w-24"
            />
            <span className="tabular-nums w-6 text-right">{bins}</span>
          </label>
        )}
        {view === "scatter" && (
          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground ml-2">
            <input
              type="checkbox"
              checked={showOverlay}
              onChange={(e) => setShowOverlay(e.target.checked)}
            />
            Vis mean/median/IQR-overlay
          </label>
        )}
        <button
          type="button"
          onClick={() => setXs(INITIAL)}
          className="ml-auto px-2.5 py-1 rounded text-xs font-medium border border-border bg-card hover:bg-muted"
        >
          Reset
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_220px] gap-4 items-start">
        <div>
          <svg
            ref={svgRef}
            width="100%"
            viewBox={`0 0 ${W} ${H}`}
            className="block bg-background rounded touch-none select-none"
            onPointerMove={onMove}
            onPointerUp={() => setDragIdx(null)}
            onPointerLeave={() => setDragIdx(null)}
          >
            {/* x-akse-gridlines */}
            {[0, 2, 4, 6, 8, 10, 12].map((g) => (
              <g key={`gx${g}`}>
                <line
                  x1={sx(g)}
                  y1={PAD_T}
                  x2={sx(g)}
                  y2={H - PAD_B}
                  stroke="currentColor"
                  className="text-muted-foreground/15"
                  strokeWidth={0.5}
                />
                <text
                  x={sx(g)}
                  y={H - PAD_B + 12}
                  fontSize={9}
                  className="fill-muted-foreground"
                  textAnchor="middle"
                >
                  {g}
                </text>
              </g>
            ))}
            <line
              x1={sx(X_MIN)}
              y1={H - PAD_B}
              x2={sx(X_MAX)}
              y2={H - PAD_B}
              stroke="currentColor"
              className="text-muted-foreground"
            />

            {view === "scatter" && (
              <>
                {/* std dev-band */}
                {showOverlay && (
                  <rect
                    x={sx(Math.max(X_MIN, m - sd))}
                    y={bandTop}
                    width={sx(Math.min(X_MAX, m + sd)) - sx(Math.max(X_MIN, m - sd))}
                    height={bandBot - bandTop}
                    fill="#3b82f6"
                    opacity={0.12}
                  />
                )}
                {/* IQR-boks */}
                {showOverlay && (
                  <rect
                    x={sx(q1)}
                    y={bandTop - 6}
                    width={sx(q3) - sx(q1)}
                    height={bandBot - bandTop + 12}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                  />
                )}
                {/* mean-linje */}
                {showOverlay && (
                  <line
                    x1={sx(m)}
                    y1={PAD_T}
                    x2={sx(m)}
                    y2={H - PAD_B}
                    stroke="#22c55e"
                    strokeWidth={2}
                  />
                )}
                {/* median-linje */}
                {showOverlay && (
                  <line
                    x1={sx(med)}
                    y1={PAD_T}
                    x2={sx(med)}
                    y2={H - PAD_B}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                  />
                )}
                {/* mode-tick */}
                {showOverlay && mo.count > 0 && (
                  <line
                    x1={sx(mo.value)}
                    y1={yScatter - 26}
                    x2={sx(mo.value)}
                    y2={yScatter + 26}
                    stroke="#f43f5e"
                    strokeWidth={1.5}
                    strokeDasharray="2 3"
                  />
                )}
                {/* punkter */}
                {xs.map((x, i) => (
                  <circle
                    key={i}
                    cx={sx(x)}
                    cy={yScatter}
                    r={dragIdx === i ? 8 : 6}
                    fill="#3b82f6"
                    stroke="#fff"
                    strokeWidth={1.5}
                    style={{ cursor: "grab" }}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setDragIdx(i);
                    }}
                  />
                ))}
              </>
            )}

            {view === "histogram" && (
              <>
                {hist.map((b, i) => {
                  const x0 = sx(b.lo);
                  const x1 = sx(b.hi);
                  const h = ((H - PAD_T - PAD_B) * b.count) / maxBin;
                  return (
                    <rect
                      key={i}
                      x={x0 + 0.5}
                      y={H - PAD_B - h}
                      width={Math.max(1, x1 - x0 - 1)}
                      height={h}
                      fill="#3b82f6"
                      opacity={0.7}
                    />
                  );
                })}
                {/* mean-linje */}
                <line
                  x1={sx(m)}
                  y1={PAD_T}
                  x2={sx(m)}
                  y2={H - PAD_B}
                  stroke="#22c55e"
                  strokeWidth={2}
                />
                <line
                  x1={sx(med)}
                  y1={PAD_T}
                  x2={sx(med)}
                  y2={H - PAD_B}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                />
              </>
            )}

            {view === "boxplot" && (
              <>
                {/* whiskers */}
                {(() => {
                  const lo = Math.max(Math.min(...xs), q1 - 1.5 * iqrV);
                  const hi = Math.min(Math.max(...xs), q3 + 1.5 * iqrV);
                  const yMid = H / 2;
                  return (
                    <>
                      <line
                        x1={sx(lo)}
                        y1={yMid}
                        x2={sx(hi)}
                        y2={yMid}
                        stroke="currentColor"
                        className="text-muted-foreground"
                      />
                      <line
                        x1={sx(lo)}
                        y1={yMid - 14}
                        x2={sx(lo)}
                        y2={yMid + 14}
                        stroke="currentColor"
                        className="text-muted-foreground"
                      />
                      <line
                        x1={sx(hi)}
                        y1={yMid - 14}
                        x2={sx(hi)}
                        y2={yMid + 14}
                        stroke="currentColor"
                        className="text-muted-foreground"
                      />
                      <rect
                        x={sx(q1)}
                        y={yMid - 22}
                        width={sx(q3) - sx(q1)}
                        height={44}
                        fill="#3b82f6"
                        opacity={0.25}
                        stroke="#3b82f6"
                        strokeWidth={1.5}
                      />
                      <line
                        x1={sx(med)}
                        y1={yMid - 22}
                        x2={sx(med)}
                        y2={yMid + 22}
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                      />
                      {/* outliers */}
                      {xs
                        .filter((v) => v < lo || v > hi)
                        .map((v, i) => (
                          <circle
                            key={`o${i}`}
                            cx={sx(v)}
                            cy={yMid}
                            r={4}
                            fill="none"
                            stroke="#f43f5e"
                            strokeWidth={1.5}
                          />
                        ))}
                      {/* små dots langs aksen */}
                      {xs.map((v, i) => (
                        <circle
                          key={`p${i}`}
                          cx={sx(v)}
                          cy={H - PAD_B - 6}
                          r={2.5}
                          fill="#3b82f6"
                          opacity={0.6}
                        />
                      ))}
                    </>
                  );
                })()}
              </>
            )}

            {/* legend */}
            <g transform={`translate(${PAD_L}, 8)`}>
              <rect width={10} height={10} fill="#22c55e" />
              <text x={14} y={9} fontSize={10} className="fill-muted-foreground">
                mean
              </text>
              <rect x={62} width={10} height={10} fill="#f59e0b" />
              <text x={76} y={9} fontSize={10} className="fill-muted-foreground">
                median
              </text>
              <rect x={132} width={10} height={10} fill="#f43f5e" />
              <text x={146} y={9} fontSize={10} className="fill-muted-foreground">
                modus
              </text>
              <rect x={196} width={10} height={10} fill="#3b82f6" opacity={0.5} />
              <text x={210} y={9} fontSize={10} className="fill-muted-foreground">
                ±1σ-bånd
              </text>
              <rect x={282} width={10} height={10} fill="none" stroke="#a855f7" />
              <text x={296} y={9} fontSize={10} className="fill-muted-foreground">
                IQR-boks
              </text>
            </g>
          </svg>
          <div className="text-[11px] text-muted-foreground mt-1">
            {view === "scatter" &&
              "Dra punktene langs x-aksen. Se hvordan hver statistikk oppdateres umiddelbart."}
            {view === "histogram" &&
              "Juster bin-antall. For få → struktur skjult. For mange → støy synlig."}
            {view === "boxplot" &&
              "Boksen = Q1–Q3, strek = median, whiskers = 1.5·IQR, ring = outlier."}
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <Stat label="n" value={String(xs.length)} />
          <Stat label="mean" value={m.toFixed(2)} accent="#22c55e" />
          <Stat label="median" value={med.toFixed(2)} accent="#f59e0b" />
          <Stat label="modus" value={mo.value.toFixed(2)} accent="#f43f5e" />
          <Stat label="range" value={rng.toFixed(2)} />
          <Stat label="varians (s²)" value={vr.toFixed(2)} />
          <Stat label="std (s)" value={sd.toFixed(2)} highlight />
          <Stat label="Q1" value={q1.toFixed(2)} />
          <Stat label="Q3" value={q3.toFixed(2)} />
          <Stat label="IQR" value={iqrV.toFixed(2)} accent="#a855f7" />
          <Stat label="skewness" value={sk.toFixed(2)} />
          <Stat label="kurtosis (ex)" value={ku.toFixed(2)} />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
  accent,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  accent?: string;
}) {
  return (
    <div
      className={`rounded-md border px-2 py-1 flex justify-between items-baseline gap-2 ${
        highlight ? "border-brand bg-brand/10" : "border-border bg-background"
      }`}
    >
      <span
        className="text-[10px] uppercase tracking-wider text-muted-foreground"
        style={accent ? { color: accent } : undefined}
      >
        {label}
      </span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
