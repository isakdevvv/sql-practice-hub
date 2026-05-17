import { useCallback, useMemo, useRef, useState } from "react";
import {
  type OlsFit,
  type Pt,
  cooksDistance,
  leverage,
  mse,
  olsFit,
  qqPairs,
  standardizedResiduals,
} from "./regUtils";

/**
 * DraggableScatterFit — kjernen i diagnostikk-lesjonen.
 *
 * Brukeren drar datapunkter; OLS-fit oppdateres live, og 3 diagnose-plot
 * (residual vs fitted, normal Q-Q, leverage vs standardiserte residualer)
 * tegnes ved siden av side-panelet med R², MSE, β₀, β₁.
 *
 * Komponenten aksepterer et `initialPoints`-prop slik at preset-velgeren
 * kan injisere uhellsbilder uten å skrive om scatter-koden.
 */

type Tab = "residual" | "qq" | "leverage";

export type DraggableScatterFitProps = {
  initialPoints?: Pt[];
  // Henter første-render-key fra preset slik at vi kan reset-e state utenfra
  resetKey?: string;
  // Hvor x og y er forventet å ligge — bruk samme bbox uavhengig av preset
  xRange?: [number, number];
  yRange?: [number, number];
  // Vis Cook's-markering i scatter (rødt) hvis D > 4/n
  highlightInfluential?: boolean;
  caption?: string;
};

const DEFAULT_PTS: Pt[] = [
  { x: 1, y: 2.2 },
  { x: 2, y: 3.0 },
  { x: 3, y: 4.1 },
  { x: 4, y: 4.8 },
  { x: 5, y: 6.0 },
  { x: 6, y: 6.7 },
  { x: 7, y: 7.5 },
  { x: 8, y: 8.6 },
  { x: 9, y: 9.4 },
  { x: 10, y: 10.7 },
];

export function DraggableScatterFit({
  initialPoints,
  resetKey,
  xRange = [0, 12],
  yRange = [0, 14],
  highlightInfluential = true,
  caption,
}: DraggableScatterFitProps) {
  const [pts, setPts] = useState<Pt[]>(initialPoints ?? DEFAULT_PTS);
  const [tab, setTab] = useState<Tab>("residual");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const lastKey = useRef<string | undefined>(resetKey);

  // Reset state hvis preset endrer resetKey
  if (resetKey !== lastKey.current) {
    lastKey.current = resetKey;
    // Bare reset hvis preset faktisk leverte punkter
    if (initialPoints) {
      // Defer state-set til etter render via microtask
      queueMicrotask(() => setPts(initialPoints));
    }
  }

  const [X_MIN, X_MAX] = xRange;
  const [Y_MIN, Y_MAX] = yRange;

  const W = 420;
  const H = 300;
  const PAD = 38;

  const sx = useCallback(
    (x: number) => PAD + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - 2 * PAD),
    [X_MIN, X_MAX],
  );
  const sy = useCallback(
    (y: number) => H - PAD - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (H - 2 * PAD),
    [Y_MIN, Y_MAX],
  );
  const invX = useCallback(
    (px: number) => X_MIN + ((px - PAD) / (W - 2 * PAD)) * (X_MAX - X_MIN),
    [X_MIN, X_MAX],
  );
  const invY = useCallback(
    (py: number) => Y_MIN + ((H - PAD - py) / (H - 2 * PAD)) * (Y_MAX - Y_MIN),
    [Y_MIN, Y_MAX],
  );

  const fit: OlsFit = useMemo(() => olsFit(pts), [pts]);
  const h = useMemo(() => leverage(pts, fit), [pts, fit]);
  const cooks = useMemo(() => cooksDistance(pts, fit), [pts, fit]);
  const stdResid = useMemo(() => standardizedResiduals(fit, h), [fit, h]);
  const qq = useMemo(() => qqPairs(stdResid), [stdResid]);
  const mseV = useMemo(() => mse(fit), [fit]);

  const cookThresh = 4 / pts.length;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragIdx === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    const nx = Math.max(X_MIN, Math.min(X_MAX, invX(px)));
    const ny = Math.max(Y_MIN, Math.min(Y_MAX, invY(py)));
    setPts((prev) => prev.map((p, i) => (i === dragIdx ? { x: nx, y: ny } : p)));
  };

  // Linje-endepunkter
  const yL = fit.b0 + fit.b1 * X_MIN;
  const yR = fit.b0 + fit.b1 * X_MAX;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="grid lg:grid-cols-[1fr_220px] gap-4 items-start">
        {/* Scatter med drag */}
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
            {/* gridlines */}
            {[2, 4, 6, 8, 10].filter((g) => g <= X_MAX).map((g) => (
              <g key={`gx${g}`}>
                <line
                  x1={sx(g)}
                  y1={sy(Y_MIN)}
                  x2={sx(g)}
                  y2={sy(Y_MAX)}
                  stroke="currentColor"
                  className="text-muted-foreground/15"
                  strokeWidth={0.5}
                />
                <text
                  x={sx(g)}
                  y={H - PAD + 12}
                  fontSize={9}
                  className="fill-muted-foreground"
                  textAnchor="middle"
                >
                  {g}
                </text>
              </g>
            ))}
            {[2, 4, 6, 8, 10, 12].filter((g) => g <= Y_MAX).map((g) => (
              <g key={`gy${g}`}>
                <line
                  x1={sx(X_MIN)}
                  y1={sy(g)}
                  x2={sx(X_MAX)}
                  y2={sy(g)}
                  stroke="currentColor"
                  className="text-muted-foreground/15"
                  strokeWidth={0.5}
                />
                <text
                  x={PAD - 6}
                  y={sy(g) + 3}
                  fontSize={9}
                  className="fill-muted-foreground"
                  textAnchor="end"
                >
                  {g}
                </text>
              </g>
            ))}
            {/* akser */}
            <line
              x1={sx(X_MIN)}
              y1={sy(Y_MIN)}
              x2={sx(X_MAX)}
              y2={sy(Y_MIN)}
              stroke="currentColor"
              className="text-muted-foreground"
            />
            <line
              x1={sx(X_MIN)}
              y1={sy(Y_MIN)}
              x2={sx(X_MIN)}
              y2={sy(Y_MAX)}
              stroke="currentColor"
              className="text-muted-foreground"
            />

            {/* residual-segmenter */}
            {pts.map((p, i) => (
              <line
                key={`res${i}`}
                x1={sx(p.x)}
                y1={sy(p.y)}
                x2={sx(p.x)}
                y2={sy(fit.yhat[i])}
                stroke="rgba(244,63,94,0.5)"
                strokeWidth={1.5}
                strokeDasharray="2 2"
              />
            ))}

            {/* OLS-linje */}
            <line
              x1={sx(X_MIN)}
              y1={sy(yL)}
              x2={sx(X_MAX)}
              y2={sy(yR)}
              stroke="#22c55e"
              strokeWidth={2.5}
            />

            {/* tyngdepunkt */}
            <circle
              cx={sx(fit.xbar)}
              cy={sy(fit.ybar)}
              r={5}
              fill="none"
              stroke="#facc15"
              strokeWidth={1.5}
            />

            {/* punkter */}
            {pts.map((p, i) => {
              const isInfluential = highlightInfluential && cooks[i] > cookThresh;
              return (
                <circle
                  key={`pt${i}`}
                  cx={sx(p.x)}
                  cy={sy(p.y)}
                  r={dragIdx === i ? 9 : 6}
                  fill={isInfluential ? "#f43f5e" : "#3b82f6"}
                  stroke="#fff"
                  strokeWidth={1.5}
                  style={{ cursor: "grab" }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setDragIdx(i);
                  }}
                />
              );
            })}

            <text
              x={W / 2}
              y={H - 5}
              fontSize={10}
              className="fill-muted-foreground"
              textAnchor="middle"
            >
              x
            </text>
            <text
              x={12}
              y={H / 2}
              fontSize={10}
              className="fill-muted-foreground"
              transform={`rotate(-90, 12, ${H / 2})`}
            >
              y
            </text>
          </svg>
          <div className="text-[11px] text-muted-foreground mt-1">
            Dra punktene. Røde punkter har Cook's D &gt; 4/n (influential).
            {caption ? ` ${caption}` : ""}
          </div>
        </div>

        {/* Side-panel */}
        <div className="space-y-2 text-xs">
          <Stat label="β₀ (intercept)" value={fit.b0.toFixed(3)} />
          <Stat label="β₁ (slope)" value={fit.b1.toFixed(3)} />
          <Stat label="R²" value={fit.r2.toFixed(3)} highlight />
          <Stat label="MSE" value={mseV.toFixed(3)} />
          <Stat label="RSS" value={fit.rss.toFixed(3)} />
          <Stat label="n" value={String(pts.length)} />
          <div className="text-[11px] text-muted-foreground font-mono pt-1 leading-tight">
            ŷ = {fit.b0.toFixed(3)} + {fit.b1.toFixed(3)}·x
          </div>
        </div>
      </div>

      {/* Diagnose-tabs */}
      <div>
        <div className="flex gap-1 mb-2 text-xs">
          <TabBtn active={tab === "residual"} onClick={() => setTab("residual")}>
            Residual vs ŷ
          </TabBtn>
          <TabBtn active={tab === "qq"} onClick={() => setTab("qq")}>
            Normal Q-Q
          </TabBtn>
          <TabBtn active={tab === "leverage"} onClick={() => setTab("leverage")}>
            Leverage vs std.resid
          </TabBtn>
        </div>

        {tab === "residual" && (
          <ResidualPlot yhat={fit.yhat} residuals={fit.residuals} cooks={cooks} thresh={cookThresh} />
        )}
        {tab === "qq" && <QqPlot qq={qq} />}
        {tab === "leverage" && (
          <LeveragePlot h={h} stdResid={stdResid} cooks={cooks} thresh={cookThresh} n={pts.length} />
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-border p-2 ${
        highlight ? "bg-brand/10" : "bg-background"
      }`}
    >
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div className="font-mono text-sm">{value}</div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md border text-xs font-mono transition-colors ${
        active
          ? "border-brand bg-brand/10 text-foreground"
          : "border-border bg-background text-muted-foreground hover:border-brand/40"
      }`}
    >
      {children}
    </button>
  );
}

function ResidualPlot({
  yhat,
  residuals,
  cooks,
  thresh,
}: {
  yhat: number[];
  residuals: number[];
  cooks: number[];
  thresh: number;
}) {
  const W = 420;
  const H = 180;
  const PAD = 30;
  const yhMin = Math.min(...yhat);
  const yhMax = Math.max(...yhat);
  const yhSpan = Math.max(yhMax - yhMin, 1e-3);
  const rExtent = Math.max(...residuals.map(Math.abs), 0.5);
  const sx = (v: number) => PAD + ((v - yhMin) / yhSpan) * (W - 2 * PAD);
  const sy = (v: number) => H / 2 - (v / rExtent) * (H / 2 - 20);

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block">
        <line
          x1={PAD}
          y1={H / 2}
          x2={W - PAD}
          y2={H / 2}
          stroke="#f43f5e"
          strokeDasharray="3 3"
        />
        {yhat.map((p, i) => (
          <circle
            key={i}
            cx={sx(p)}
            cy={sy(residuals[i])}
            r={cooks[i] > thresh ? 5 : 3.5}
            fill={cooks[i] > thresh ? "#f43f5e" : "#3b82f6"}
          />
        ))}
        <text
          x={W / 2}
          y={H - 4}
          fontSize={10}
          className="fill-muted-foreground"
          textAnchor="middle"
        >
          ŷ (predikert verdi)
        </text>
        <text x={6} y={14} fontSize={10} className="fill-muted-foreground">
          residual
        </text>
      </svg>
      <div className="text-[11px] text-muted-foreground mt-1">
        Bra: tilfeldig spredt sky rundt 0. Vifte ⇒ heteroskedastisitet. Kurve ⇒ ikke-linearitet.
      </div>
    </div>
  );
}

function QqPlot({ qq }: { qq: { theoretical: number; sample: number }[] }) {
  const W = 420;
  const H = 180;
  const PAD = 30;
  const ext = 3;
  const sx = (v: number) => PAD + ((v + ext) / (2 * ext)) * (W - 2 * PAD);
  const sy = (v: number) => H - PAD - ((v + ext) / (2 * ext)) * (H - 2 * PAD);

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block">
        <line
          x1={sx(-ext)}
          y1={sy(-ext)}
          x2={sx(ext)}
          y2={sy(ext)}
          stroke="#f59e0b"
          strokeDasharray="3 3"
        />
        {qq.map((p, i) => (
          <circle
            key={i}
            cx={sx(p.theoretical)}
            cy={sy(p.sample)}
            r={3}
            fill="#3b82f6"
          />
        ))}
        <text
          x={W / 2}
          y={H - 4}
          fontSize={10}
          className="fill-muted-foreground"
          textAnchor="middle"
        >
          teoretisk kvantil (N(0,1))
        </text>
        <text x={6} y={14} fontSize={10} className="fill-muted-foreground">
          standardisert residual
        </text>
      </svg>
      <div className="text-[11px] text-muted-foreground mt-1">
        Bra: punktene ligger på den oransje diagonalen. Avvik i halene ⇒ tunge haler /
        skjevhet i residualene (brudd på normalitet).
      </div>
    </div>
  );
}

function LeveragePlot({
  h,
  stdResid,
  cooks,
  thresh,
  n,
}: {
  h: number[];
  stdResid: number[];
  cooks: number[];
  thresh: number;
  n: number;
}) {
  const W = 420;
  const H = 180;
  const PAD = 30;
  const hMax = Math.max(...h, 0.3) * 1.1;
  const rExt = Math.max(...stdResid.map(Math.abs), 2.5);
  const sx = (v: number) => PAD + (v / hMax) * (W - 2 * PAD);
  const sy = (v: number) => H / 2 - (v / rExt) * (H / 2 - 18);
  const highLev = 4 / n; // tommelfingerregel 2p/n med p=2

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block">
        <line
          x1={PAD}
          y1={H / 2}
          x2={W - PAD}
          y2={H / 2}
          stroke="#888"
          strokeDasharray="3 3"
        />
        {/* Høy leverage-terskel */}
        <line
          x1={sx(highLev)}
          y1={20}
          x2={sx(highLev)}
          y2={H - 20}
          stroke="#f59e0b"
          strokeDasharray="3 3"
        />
        <text
          x={sx(highLev) + 3}
          y={20}
          fontSize={9}
          className="fill-amber-500"
        >
          h = 2p/n
        </text>
        {h.map((hi, i) => (
          <circle
            key={i}
            cx={sx(hi)}
            cy={sy(stdResid[i])}
            r={cooks[i] > thresh ? 6 : 3.5}
            fill={cooks[i] > thresh ? "#f43f5e" : "#3b82f6"}
            opacity={0.85}
          />
        ))}
        <text
          x={W / 2}
          y={H - 4}
          fontSize={10}
          className="fill-muted-foreground"
          textAnchor="middle"
        >
          leverage h_ii
        </text>
        <text x={6} y={14} fontSize={10} className="fill-muted-foreground">
          std. residual
        </text>
      </svg>
      <div className="text-[11px] text-muted-foreground mt-1">
        Punkter høyt og til høyre = stor innflytelse. Cook's D &gt; 4/n flagges rødt.
      </div>
    </div>
  );
}
