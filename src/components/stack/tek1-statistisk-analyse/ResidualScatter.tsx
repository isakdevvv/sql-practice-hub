import { useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// ResidualScatter — drag-bare datapunkter, live OLS-regresjonslinje +
// residual-plot under. Viser hvordan ett uteligger-punkt drar både β̂₁
// og R² rundt, og hvordan residualene avslører mønstre (heteroskedastisitet,
// krumning) som scatter alene kan skjule.
// --------------------------------------------------------------------------

type Mode = "scatter" | "residuals" | "both";

const W = 540;
const TOP_H = 220; // scatter
const BOT_H = 110; // residuals
const PAD_L = 38;
const PAD_R = 14;
const PAD_T = 14;
const PAD_B = 24;
const X_MIN = 0;
const X_MAX = 12;
const Y_MIN = 0;
const Y_MAX = 25;

const INITIAL_POINTS: { x: number; y: number }[] = [
  { x: 1.5, y: 3 },
  { x: 2.8, y: 5.5 },
  { x: 4.2, y: 7.8 },
  { x: 5.5, y: 10.5 },
  { x: 7.0, y: 13 },
  { x: 8.5, y: 17 },
  { x: 9.8, y: 19 },
  { x: 11, y: 22 },
];

function ols(points: { x: number; y: number }[]) {
  const n = points.length;
  const xBar = points.reduce((s, p) => s + p.x, 0) / n;
  const yBar = points.reduce((s, p) => s + p.y, 0) / n;
  let sxx = 0,
    sxy = 0,
    syy = 0;
  for (const p of points) {
    const dx = p.x - xBar;
    const dy = p.y - yBar;
    sxx += dx * dx;
    sxy += dx * dy;
    syy += dy * dy;
  }
  const beta1 = sxx === 0 ? 0 : sxy / sxx;
  const beta0 = yBar - beta1 * xBar;
  const ssRes = points.reduce((s, p) => {
    const yhat = beta0 + beta1 * p.x;
    return s + (p.y - yhat) ** 2;
  }, 0);
  const r2 = syy === 0 ? 0 : 1 - ssRes / syy;
  const r = sxx === 0 || syy === 0 ? 0 : sxy / Math.sqrt(sxx * syy);
  return { beta0, beta1, r2, r };
}

export function ResidualScatter() {
  const [points, setPoints] = useState(INITIAL_POINTS);
  const [mode, setMode] = useState<Mode>("both");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const fit = useMemo(() => ols(points), [points]);

  const H = mode === "scatter" ? TOP_H : mode === "residuals" ? TOP_H : TOP_H + BOT_H + 6;

  const xPx = (v: number) =>
    PAD_L + ((v - X_MIN) / (X_MAX - X_MIN)) * (W - PAD_L - PAD_R);
  const yPx = (v: number) =>
    PAD_T + (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * (TOP_H - PAD_T - PAD_B);

  const lineX0 = X_MIN;
  const lineX1 = X_MAX;
  const lineY0 = fit.beta0 + fit.beta1 * lineX0;
  const lineY1 = fit.beta0 + fit.beta1 * lineX1;

  const residuals = points.map((p) => ({
    x: p.x,
    e: p.y - (fit.beta0 + fit.beta1 * p.x),
  }));
  const maxAbsE = Math.max(0.5, ...residuals.map((r) => Math.abs(r.e)));
  const resYRange = maxAbsE * 1.15;
  const resTop = TOP_H + 6;
  const resYPx = (e: number) =>
    resTop + PAD_T + (1 - (e + resYRange) / (2 * resYRange)) * (BOT_H - PAD_T - PAD_B);

  function handlePointerDown(idx: number) {
    setDragIdx(idx);
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (dragIdx === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = (e.clientX - rect.left) / rect.width * W;
    const sy = (e.clientY - rect.top) / rect.height * H;
    if (sy > TOP_H) return; // bare drag i scatter
    const newX = Math.max(
      X_MIN + 0.2,
      Math.min(X_MAX - 0.2, X_MIN + ((sx - PAD_L) / (W - PAD_L - PAD_R)) * (X_MAX - X_MIN)),
    );
    const newY = Math.max(
      Y_MIN,
      Math.min(Y_MAX, Y_MIN + (1 - (sy - PAD_T) / (TOP_H - PAD_T - PAD_B)) * (Y_MAX - Y_MIN)),
    );
    setPoints((pts) => pts.map((p, i) => (i === dragIdx ? { x: newX, y: newY } : p)));
  }
  function handlePointerUp() {
    setDragIdx(null);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
        <div className="inline-flex rounded-md border border-border overflow-hidden">
          {(
            [
              { k: "scatter" as Mode, label: "Scatter + linje" },
              { k: "residuals" as Mode, label: "Bare residualer" },
              { k: "both" as Mode, label: "Begge" },
            ]
          ).map(({ k, label }) => (
            <button
              key={k}
              onClick={() => setMode(k)}
              className={
                "px-2 py-1 text-xs " +
                (mode === k ? "bg-brand text-white" : "bg-card hover:bg-muted/40")
              }
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPoints(INITIAL_POINTS)}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Tilbakestill
        </button>
        <span className="text-muted-foreground">
          Tips: dra et punkt vekk fra trenden og se R² stupe.
        </span>
      </div>

      <div className="rounded-lg border border-border bg-background/40 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block touch-none"
          style={{ cursor: dragIdx !== null ? "grabbing" : "default" }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* SCATTER PANEL */}
          {(mode === "scatter" || mode === "both") && (
            <g>
              {/* gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <line
                  key={t}
                  x1={PAD_L}
                  x2={W - PAD_R}
                  y1={PAD_T + t * (TOP_H - PAD_T - PAD_B)}
                  y2={PAD_T + t * (TOP_H - PAD_T - PAD_B)}
                  stroke="currentColor"
                  strokeOpacity={0.07}
                />
              ))}
              {/* x-akse */}
              <line
                x1={PAD_L}
                x2={W - PAD_R}
                y1={TOP_H - PAD_B}
                y2={TOP_H - PAD_B}
                stroke="currentColor"
                strokeOpacity={0.35}
              />
              <text
                x={(W + PAD_L - PAD_R) / 2}
                y={TOP_H - 6}
                textAnchor="middle"
                fontSize={10}
                className="fill-muted-foreground"
              >
                X
              </text>
              <text
                x={PAD_L - 6}
                y={PAD_T + 8}
                textAnchor="end"
                fontSize={10}
                className="fill-muted-foreground"
              >
                Y
              </text>
              {/* regresjonslinje */}
              <line
                x1={xPx(lineX0)}
                y1={yPx(Math.max(Y_MIN, Math.min(Y_MAX, lineY0)))}
                x2={xPx(lineX1)}
                y2={yPx(Math.max(Y_MIN, Math.min(Y_MAX, lineY1)))}
                stroke="rgb(56,189,248)"
                strokeWidth={2}
              />
              {/* residual-streker */}
              {points.map((p, i) => (
                <line
                  key={"res" + i}
                  x1={xPx(p.x)}
                  x2={xPx(p.x)}
                  y1={yPx(p.y)}
                  y2={yPx(fit.beta0 + fit.beta1 * p.x)}
                  stroke="rgb(244,114,182)"
                  strokeOpacity={0.55}
                  strokeWidth={1}
                />
              ))}
              {/* datapunkter */}
              {points.map((p, i) => (
                <circle
                  key={"pt" + i}
                  cx={xPx(p.x)}
                  cy={yPx(p.y)}
                  r={6}
                  fill="rgb(56,189,248)"
                  stroke="white"
                  strokeWidth={1.5}
                  style={{ cursor: "grab" }}
                  onPointerDown={() => handlePointerDown(i)}
                />
              ))}
            </g>
          )}

          {/* RESIDUAL PANEL */}
          {(mode === "residuals" || mode === "both") && (
            <g>
              <line
                x1={PAD_L}
                x2={W - PAD_R}
                y1={resYPx(0)}
                y2={resYPx(0)}
                stroke="currentColor"
                strokeOpacity={0.5}
                strokeDasharray="3 3"
              />
              <text
                x={PAD_L - 6}
                y={resYPx(0) + 3}
                textAnchor="end"
                fontSize={9}
                className="fill-muted-foreground"
              >
                e=0
              </text>
              <text
                x={(W + PAD_L - PAD_R) / 2}
                y={resTop + BOT_H - 4}
                textAnchor="middle"
                fontSize={10}
                className="fill-muted-foreground"
              >
                X — residualer (e = y − ŷ)
              </text>
              {residuals.map((r, i) => (
                <g key={"r" + i}>
                  <line
                    x1={xPx(r.x)}
                    x2={xPx(r.x)}
                    y1={resYPx(0)}
                    y2={resYPx(r.e)}
                    stroke="rgb(244,114,182)"
                    strokeOpacity={0.75}
                    strokeWidth={1.5}
                  />
                  <circle cx={xPx(r.x)} cy={resYPx(r.e)} r={3} fill="rgb(244,114,182)" />
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>

      <div className="mt-3 grid sm:grid-cols-4 gap-2 text-xs">
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="text-muted-foreground">β̂₀ (skjæring)</div>
          <div className="font-mono">{fit.beta0.toFixed(3)}</div>
        </div>
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="text-muted-foreground">β̂₁ (helning)</div>
          <div className="font-mono">{fit.beta1.toFixed(3)}</div>
        </div>
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="text-muted-foreground">Pearson r</div>
          <div className="font-mono">{fit.r.toFixed(3)}</div>
        </div>
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="text-muted-foreground">R²</div>
          <div className={"font-mono " + (fit.r2 < 0.5 ? "text-amber-500" : "")}>
            {fit.r2.toFixed(3)}
          </div>
        </div>
      </div>

      <p className="mt-3 text-[12px] text-muted-foreground leading-snug">
        <span className="font-semibold text-foreground">Hva å se etter:</span>{" "}
        Hver rosa strek er en residual: avstanden fra punktet til linja
        vertikalt. OLS finner linja som minimerer summen av kvadratet av disse.
        Dra ett enkelt punkt langt over linja — R² stuper og helningen vrir
        seg. Arranger punktene i en U eller en kjegle, og se at scatteren ser
        "OK" ut mens residual-plottet umiddelbart avslører krumning eller
        heteroskedastisitet. Det er hele poenget med residual-diagnostikk.
      </p>
    </div>
  );
}
