import { useCallback, useMemo, useRef, useState } from "react";

type Pt = { x: number; y: number; k: 0 | 1 };

const X_MIN = -5;
const X_MAX = 5;
const Y_MIN = -4;
const Y_MAX = 4;
const W = 480;
const H = 360;

function sigmoid(z: number): number {
  if (z > 40) return 1;
  if (z < -40) return 0;
  return 1 / (1 + Math.exp(-z));
}

// 30 points: two roughly-separable Gaussian blobs
const INITIAL: Pt[] = [
  { x: -2.5, y: -1.6, k: 0 },
  { x: -3.0, y: -0.5, k: 0 },
  { x: -2.0, y: -2.1, k: 0 },
  { x: -2.8, y: -1.0, k: 0 },
  { x: -1.6, y: -1.4, k: 0 },
  { x: -3.4, y: -0.2, k: 0 },
  { x: -2.2, y: 0.6, k: 0 },
  { x: -1.2, y: -0.8, k: 0 },
  { x: -3.6, y: -1.8, k: 0 },
  { x: -2.6, y: 0.4, k: 0 },
  { x: -1.8, y: -2.4, k: 0 },
  { x: -0.6, y: -1.2, k: 0 },
  { x: -2.4, y: 1.2, k: 0 },
  { x: -1.0, y: 0.2, k: 0 },
  { x: -3.2, y: 1.5, k: 0 },
  { x: 2.4, y: 0.6, k: 1 },
  { x: 3.0, y: -0.4, k: 1 },
  { x: 2.0, y: 1.0, k: 1 },
  { x: 3.4, y: 1.2, k: 1 },
  { x: 2.6, y: -1.0, k: 1 },
  { x: 1.4, y: 1.6, k: 1 },
  { x: 2.8, y: 2.0, k: 1 },
  { x: 3.6, y: 0.0, k: 1 },
  { x: 1.8, y: -0.2, k: 1 },
  { x: 2.2, y: 2.4, k: 1 },
  { x: 0.8, y: 0.8, k: 1 },
  { x: 3.2, y: -1.6, k: 1 },
  { x: 1.6, y: -1.4, k: 1 },
  { x: 0.4, y: 2.0, k: 1 },
  { x: 2.4, y: -2.2, k: 1 },
];

function meanOf(pts: Pt[], dim: "x" | "y"): number {
  if (pts.length === 0) return 0;
  let s = 0;
  for (const p of pts) s += p[dim];
  return s / pts.length;
}

// Fit logistic regression by simple gradient descent on full data.
// Memoised in caller — input is points list.
function fitLogReg(pts: Pt[]): { b0: number; b1: number; b2: number } {
  if (pts.length < 2) return { b0: 0, b1: 1, b2: 0 };
  // standardise for numerical stability, then unstandardise
  const mx = meanOf(pts, "x");
  const my = meanOf(pts, "y");
  let sxv = 0;
  let syv = 0;
  for (const p of pts) {
    sxv += (p.x - mx) ** 2;
    syv += (p.y - my) ** 2;
  }
  const sigX = Math.sqrt(sxv / pts.length) || 1;
  const sigY = Math.sqrt(syv / pts.length) || 1;

  let w0 = 0;
  let w1 = 0;
  let w2 = 0;
  const lr = 0.4;
  const iters = 250;
  for (let it = 0; it < iters; it++) {
    let g0 = 0;
    let g1 = 0;
    let g2 = 0;
    for (const p of pts) {
      const xs = (p.x - mx) / sigX;
      const ys = (p.y - my) / sigY;
      const z = w0 + w1 * xs + w2 * ys;
      const ph = sigmoid(z);
      const err = ph - p.k;
      g0 += err;
      g1 += err * xs;
      g2 += err * ys;
    }
    const n = pts.length;
    w0 -= (lr / n) * g0;
    w1 -= (lr / n) * g1;
    w2 -= (lr / n) * g2;
  }
  // Unstandardise: z = w0 + w1*(x-mx)/sigX + w2*(y-my)/sigY
  const b1 = w1 / sigX;
  const b2 = w2 / sigY;
  const b0 = w0 - (w1 * mx) / sigX - (w2 * my) / sigY;
  return { b0, b1, b2 };
}

export function DecisionBoundaryWithLogReg() {
  const [points, setPoints] = useState<Pt[]>(INITIAL);
  const [activeClass, setActiveClass] = useState<0 | 1>(0);
  const [threshold, setThreshold] = useState(0.5);
  const [showContours, setShowContours] = useState(true);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const sx = useCallback(
    (v: number) => ((v - X_MIN) / (X_MAX - X_MIN)) * W,
    [],
  );
  const sy = useCallback(
    (v: number) => H - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * H,
    [],
  );
  const invX = (px: number) => X_MIN + (px / W) * (X_MAX - X_MIN);
  const invY = (py: number) => Y_MIN + ((H - py) / H) * (Y_MAX - Y_MIN);

  const fit = useMemo(() => fitLogReg(points), [points]);

  // boundary line at probability = threshold:
  //   σ(b0 + b1*x + b2*y) = T  ⇒  b0 + b1*x + b2*y = logit(T)
  const logitT = useMemo(
    () => Math.log(threshold / (1 - threshold)),
    [threshold],
  );

  const boundaryLine = useMemo(() => {
    const { b0, b1, b2 } = fit;
    // (b0 - logitT) + b1*x + b2*y = 0  ⇒  y = -((b0 - logitT) + b1*x) / b2
    if (Math.abs(b2) < 1e-6) {
      // vertical: b0 + b1*x = logitT ⇒ x = (logitT - b0)/b1
      if (Math.abs(b1) < 1e-6) return null;
      const xv = (logitT - b0) / b1;
      return {
        x1: sx(xv),
        y1: sy(Y_MIN),
        x2: sx(xv),
        y2: sy(Y_MAX),
      };
    }
    const yAt = (xv: number) => -(b0 - logitT + b1 * xv) / b2;
    return {
      x1: sx(X_MIN),
      y1: sy(yAt(X_MIN)),
      x2: sx(X_MAX),
      y2: sy(yAt(X_MAX)),
    };
  }, [fit, logitT, sx, sy]);

  const contours = useMemo(() => {
    if (!showContours) return [];
    const { b0, b1, b2 } = fit;
    const levels = [0.1, 0.5, 0.9];
    return levels.map((lvl) => {
      const lt = Math.log(lvl / (1 - lvl));
      if (Math.abs(b2) < 1e-6) {
        if (Math.abs(b1) < 1e-6) return null;
        const xv = (lt - b0) / b1;
        return {
          lvl,
          x1: sx(xv),
          y1: sy(Y_MIN),
          x2: sx(xv),
          y2: sy(Y_MAX),
        };
      }
      const yAt = (xv: number) => -(b0 - lt + b1 * xv) / b2;
      return {
        lvl,
        x1: sx(X_MIN),
        y1: sy(yAt(X_MIN)),
        x2: sx(X_MAX),
        y2: sy(yAt(X_MAX)),
      };
    });
  }, [fit, showContours, sx, sy]);

  // confusion at current threshold
  const cm = useMemo(() => {
    const { b0, b1, b2 } = fit;
    let tp = 0;
    let fn = 0;
    let fp = 0;
    let tn = 0;
    for (const p of points) {
      const ph = sigmoid(b0 + b1 * p.x + b2 * p.y);
      const pred = ph >= threshold ? 1 : 0;
      if (p.k === 1 && pred === 1) tp++;
      else if (p.k === 1 && pred === 0) fn++;
      else if (p.k === 0 && pred === 1) fp++;
      else tn++;
    }
    const tpr = tp + fn === 0 ? 0 : tp / (tp + fn);
    const fpr = fp + tn === 0 ? 0 : fp / (fp + tn);
    const acc = (tp + tn) / Math.max(1, points.length);
    return { tp, fn, fp, tn, tpr, fpr, acc };
  }, [fit, points, threshold]);

  const onSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (dragIdx !== null) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = invX(e.clientX - rect.left);
    const y = invY(e.clientY - rect.top);
    if (x < X_MIN || x > X_MAX || y < Y_MIN || y > Y_MAX) return;
    setPoints((prev) => [...prev, { x, y, k: activeClass }]);
  };

  const onPointDown = (i: number, e: React.PointerEvent) => {
    e.stopPropagation();
    setDragIdx(i);
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onPointMove = (e: React.PointerEvent) => {
    if (dragIdx === null) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = invX(e.clientX - rect.left);
    const y = invY(e.clientY - rect.top);
    setPoints((prev) =>
      prev.map((p, i) =>
        i === dragIdx
          ? {
              ...p,
              x: Math.min(X_MAX, Math.max(X_MIN, x)),
              y: Math.min(Y_MAX, Math.max(Y_MIN, y)),
            }
          : p,
      ),
    );
  };
  const onPointUp = () => setDragIdx(null);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="grid md:grid-cols-[1fr_auto] gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="text-xs text-muted-foreground mr-1">
              Klikk legger til klasse:
            </div>
            {([0, 1] as const).map((k) => (
              <button
                key={k}
                onClick={() => setActiveClass(k)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors flex items-center gap-1.5 ${
                  activeClass === k
                    ? "border-foreground bg-muted text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/40"
                }`}
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: k === 0 ? "#ef4444" : "#10b981" }}
                />
                K{k}
              </button>
            ))}
            <label className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
              <input
                type="checkbox"
                checked={showContours}
                onChange={(e) => setShowContours(e.target.checked)}
              />
              Sannsynlighet-konturer (10/50/90%)
            </label>
          </div>
          <svg
            ref={svgRef}
            width={W}
            height={H}
            className="block rounded-lg bg-background border border-border cursor-crosshair w-full"
            viewBox={`0 0 ${W} ${H}`}
            onClick={onSvgClick}
            onPointerMove={onPointMove}
            onPointerUp={onPointUp}
          >
            {/* axes */}
            <line x1={sx(0)} y1={0} x2={sx(0)} y2={H} stroke="#999" strokeDasharray="2 3" strokeOpacity={0.4} />
            <line x1={0} y1={sy(0)} x2={W} y2={sy(0)} stroke="#999" strokeDasharray="2 3" strokeOpacity={0.4} />
            {/* contours */}
            {contours.map((c, i) =>
              c ? (
                <g key={i}>
                  <line
                    x1={c.x1}
                    y1={c.y1}
                    x2={c.x2}
                    y2={c.y2}
                    stroke={c.lvl === 0.5 ? "#94a3b8" : "#64748b"}
                    strokeOpacity={c.lvl === 0.5 ? 0.45 : 0.32}
                    strokeWidth={1}
                    strokeDasharray={c.lvl === 0.5 ? "0" : "3 3"}
                  />
                  <text
                    x={c.x2 - 6}
                    y={c.y2 - 4}
                    fontSize={9}
                    textAnchor="end"
                    fill="#64748b"
                  >
                    P={Math.round(c.lvl * 100)}%
                  </text>
                </g>
              ) : null,
            )}
            {/* threshold boundary */}
            {boundaryLine && (
              <line
                x1={boundaryLine.x1}
                y1={boundaryLine.y1}
                x2={boundaryLine.x2}
                y2={boundaryLine.y2}
                stroke="#f59e0b"
                strokeWidth={2.5}
              />
            )}
            {/* points */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={sx(p.x)}
                cy={sy(p.y)}
                r={5}
                fill={p.k === 0 ? "#ef4444" : "#10b981"}
                stroke="#fff"
                strokeWidth={1}
                style={{ cursor: "grab" }}
                onPointerDown={(e) => onPointDown(i, e)}
              />
            ))}
          </svg>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <button
              onClick={() => setPoints(INITIAL)}
              className="text-xs px-3 py-1 rounded-md border border-border bg-background hover:bg-muted/50"
            >
              Reset punkter
            </button>
            <button
              onClick={() => setThreshold(0.5)}
              className="text-xs px-3 py-1 rounded-md border border-border bg-background hover:bg-muted/50"
            >
              Terskel = 0.5
            </button>
            <div className="text-xs text-muted-foreground ml-auto">
              Klikk: legg til punkt · Dra: flytt
            </div>
          </div>
        </div>

        <aside className="md:w-72 space-y-3">
          <label className="block">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Klassifikasjons-terskel</span>
              <span className="font-mono tabular-nums">{threshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.95}
              step={0.01}
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
          </label>

          <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-2">
            <div className="font-semibold">Confusion matrix</div>
            <table className="w-full font-mono text-[11px]">
              <tbody>
                <tr>
                  <td className="text-muted-foreground"></td>
                  <td className="text-center text-muted-foreground">pred 0</td>
                  <td className="text-center text-muted-foreground">pred 1</td>
                </tr>
                <tr>
                  <td className="text-muted-foreground">y=0</td>
                  <td className="text-center tabular-nums">{cm.tn}</td>
                  <td className="text-center tabular-nums text-amber-500">{cm.fp}</td>
                </tr>
                <tr>
                  <td className="text-muted-foreground">y=1</td>
                  <td className="text-center tabular-nums text-amber-500">{cm.fn}</td>
                  <td className="text-center tabular-nums">{cm.tp}</td>
                </tr>
              </tbody>
            </table>
            <div className="border-t border-border pt-2 space-y-1 font-mono text-[11px]">
              <div>
                <span className="text-muted-foreground">accuracy:</span>{" "}
                <span className="tabular-nums">{(cm.acc * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">TPR (recall):</span>{" "}
                <span className="tabular-nums">{(cm.tpr * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">FPR:</span>{" "}
                <span className="tabular-nums">{(cm.fpr * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-3 text-xs font-mono space-y-1">
            <div className="text-muted-foreground font-sans mb-1">Fitted model</div>
            <div>β₀ = {fit.b0.toFixed(2)}</div>
            <div>β₁ = {fit.b1.toFixed(2)}</div>
            <div>β₂ = {fit.b2.toFixed(2)}</div>
            <div className="font-sans text-[10px] text-muted-foreground pt-1 leading-snug">
              Modellen refittes automatisk når du legger til/flytter punkter.
              Den oransje linja er der σ(z) = terskel. Konturene er parallelle
              fordi grensa er lineær.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
