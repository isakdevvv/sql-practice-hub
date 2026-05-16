import { useCallback, useMemo, useRef, useState } from "react";

/**
 * RegressionPlayground — drag-og-slipp datapunkter, se OLS oppdateres.
 * Viser regresjonslinje, RSS, R² og residualplot live.
 */

type Pt = { x: number; y: number };

const INIT: Pt[] = [
  { x: 1, y: 2.1 },
  { x: 2, y: 3.4 },
  { x: 3, y: 3.8 },
  { x: 4, y: 5.2 },
  { x: 5, y: 5.6 },
  { x: 6, y: 7.1 },
  { x: 7, y: 7.4 },
  { x: 8, y: 8.9 },
];

function fitOLS(pts: Pt[]) {
  const n = pts.length;
  const xbar = pts.reduce((s, p) => s + p.x, 0) / n;
  const ybar = pts.reduce((s, p) => s + p.y, 0) / n;
  let sxx = 0;
  let sxy = 0;
  for (const p of pts) {
    sxx += (p.x - xbar) ** 2;
    sxy += (p.x - xbar) * (p.y - ybar);
  }
  const b1 = sxx > 0 ? sxy / sxx : 0;
  const b0 = ybar - b1 * xbar;
  // SS
  let rss = 0;
  let tss = 0;
  for (const p of pts) {
    const yhat = b0 + b1 * p.x;
    rss += (p.y - yhat) ** 2;
    tss += (p.y - ybar) ** 2;
  }
  const r2 = tss > 0 ? 1 - rss / tss : 0;
  return { b0, b1, rss, tss, r2, xbar, ybar };
}

const X_MIN = 0,
  X_MAX = 10,
  Y_MIN = 0,
  Y_MAX = 12;

export function RegressionPlayground() {
  const [pts, setPts] = useState<Pt[]>(INIT);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const W = 420;
  const H = 300;
  const PAD = 35;
  const sx = useCallback(
    (x: number) => PAD + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - 2 * PAD),
    [],
  );
  const sy = useCallback(
    (y: number) => H - PAD - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (H - 2 * PAD),
    [],
  );
  const invX = useCallback(
    (px: number) => X_MIN + ((px - PAD) / (W - 2 * PAD)) * (X_MAX - X_MIN),
    [],
  );
  const invY = useCallback(
    (py: number) => Y_MIN + ((H - PAD - py) / (H - 2 * PAD)) * (Y_MAX - Y_MIN),
    [],
  );

  const fit = useMemo(() => fitOLS(pts), [pts]);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragIdx === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    const x = Math.max(X_MIN, Math.min(X_MAX, invX(px)));
    const y = Math.max(Y_MIN, Math.min(Y_MAX, invY(py)));
    setPts((prev) => prev.map((p, i) => (i === dragIdx ? { x, y } : p)));
  };

  const addPoint = () => {
    setPts((prev) => [...prev, { x: 5, y: 6 }]);
  };

  const removeLast = () => {
    setPts((prev) => (prev.length > 2 ? prev.slice(0, -1) : prev));
  };

  const reset = () => setPts(INIT);

  // Residual plot dims
  const RW = 420;
  const RH = 140;
  const RPAD = 30;
  const residuals = pts.map((p) => ({ x: p.x, r: p.y - (fit.b0 + fit.b1 * p.x) }));
  const rMax = Math.max(1, ...residuals.map((d) => Math.abs(d.r))) * 1.2;
  const rx = (x: number) => RPAD + ((x - X_MIN) / (X_MAX - X_MIN)) * (RW - 2 * RPAD);
  const ry = (r: number) => RH / 2 - (r / rMax) * (RH / 2 - 15);

  // Line endpoints
  const xL = X_MIN;
  const xR = X_MAX;
  const yL = fit.b0 + fit.b1 * xL;
  const yR = fit.b0 + fit.b1 * xR;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={addPoint}
          className="px-2 py-1 rounded border border-border hover:bg-accent"
        >
          + Legg til punkt
        </button>
        <button
          type="button"
          onClick={removeLast}
          className="px-2 py-1 rounded border border-border hover:bg-accent"
        >
          – Fjern siste
        </button>
        <button
          type="button"
          onClick={reset}
          className="px-2 py-1 rounded border border-border hover:bg-accent"
        >
          Reset
        </button>
        <span className="ml-auto text-muted-foreground text-[11px] self-center">
          Dra punktene for å se linjen flytte seg
        </span>
      </div>

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
        {[2, 4, 6, 8].map((g) => (
          <g key={`gx${g}`}>
            <line x1={sx(g)} y1={sy(Y_MIN)} x2={sx(g)} y2={sy(Y_MAX)} stroke="#333" strokeWidth={0.5} />
            <text x={sx(g)} y={H - PAD + 12} fontSize={9} fill="#666" textAnchor="middle">
              {g}
            </text>
          </g>
        ))}
        {[2, 4, 6, 8, 10].map((g) => (
          <g key={`gy${g}`}>
            <line x1={sx(X_MIN)} y1={sy(g)} x2={sx(X_MAX)} y2={sy(g)} stroke="#333" strokeWidth={0.5} />
            <text x={PAD - 6} y={sy(g) + 3} fontSize={9} fill="#666" textAnchor="end">
              {g}
            </text>
          </g>
        ))}
        {/* axes */}
        <line x1={sx(X_MIN)} y1={sy(Y_MIN)} x2={sx(X_MAX)} y2={sy(Y_MIN)} stroke="#888" />
        <line x1={sx(X_MIN)} y1={sy(Y_MIN)} x2={sx(X_MIN)} y2={sy(Y_MAX)} stroke="#888" />

        {/* residual segments (gray vertical) */}
        {pts.map((p, i) => {
          const yhat = fit.b0 + fit.b1 * p.x;
          return (
            <line
              key={`res${i}`}
              x1={sx(p.x)}
              y1={sy(p.y)}
              x2={sx(p.x)}
              y2={sy(yhat)}
              stroke="rgba(244,63,94,0.6)"
              strokeWidth={1.5}
              strokeDasharray="2 2"
            />
          );
        })}

        {/* regression line */}
        <line x1={sx(xL)} y1={sy(yL)} x2={sx(xR)} y2={sy(yR)} stroke="#22c55e" strokeWidth={2.5} />

        {/* mean point */}
        <circle cx={sx(fit.xbar)} cy={sy(fit.ybar)} r={4} fill="none" stroke="#facc15" strokeWidth={1.5} />
        <text x={sx(fit.xbar) + 7} y={sy(fit.ybar) - 5} fontSize={9} fill="#facc15">
          (x̄, ȳ)
        </text>

        {/* points */}
        {pts.map((p, i) => (
          <circle
            key={`pt${i}`}
            cx={sx(p.x)}
            cy={sy(p.y)}
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

        {/* labels */}
        <text x={W / 2} y={H - 5} fontSize={10} fill="#888" textAnchor="middle">
          x
        </text>
        <text x={12} y={H / 2} fontSize={10} fill="#888" transform={`rotate(-90, 12, ${H / 2})`}>
          y
        </text>
      </svg>

      <div className="grid sm:grid-cols-4 gap-2 text-xs">
        <Stat label="β₀ (intercept)" value={fit.b0.toFixed(3)} />
        <Stat label="β₁ (slope)" value={fit.b1.toFixed(3)} />
        <Stat label="RSS" value={fit.rss.toFixed(3)} />
        <Stat label="R²" value={fit.r2.toFixed(3)} highlight />
      </div>
      <div className="text-[11px] text-muted-foreground font-mono">
        ŷ = {fit.b0.toFixed(3)} + {fit.b1.toFixed(3)} · x · TSS = {fit.tss.toFixed(3)} · n = {pts.length}
      </div>

      {/* Residual plot */}
      <div>
        <div className="text-xs font-semibold mb-1">Residualplot (e_i = y_i − ŷ_i)</div>
        <svg width="100%" viewBox={`0 0 ${RW} ${RH}`} className="block bg-background rounded">
          <line x1={RPAD} y1={RH / 2} x2={RW - RPAD} y2={RH / 2} stroke="#666" />
          {residuals.map((d, i) => (
            <g key={`r${i}`}>
              <line
                x1={rx(d.x)}
                y1={RH / 2}
                x2={rx(d.x)}
                y2={ry(d.r)}
                stroke="rgba(244,63,94,0.5)"
                strokeWidth={1.5}
              />
              <circle cx={rx(d.x)} cy={ry(d.r)} r={4} fill="#f43f5e" />
            </g>
          ))}
          <text x={RW - RPAD} y={RH / 2 - 4} fontSize={9} fill="#888" textAnchor="end">
            0
          </text>
        </svg>
        <div className="text-[11px] text-muted-foreground mt-1">
          Mønster i residualene = modellbom: kurvet ⇒ ikke-lineær, vifteform ⇒ heteroskedastisitet.
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg border border-border p-2 ${
        highlight ? "bg-brand/10" : "bg-background"
      }`}
    >
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="font-mono text-sm">{value}</div>
    </div>
  );
}
