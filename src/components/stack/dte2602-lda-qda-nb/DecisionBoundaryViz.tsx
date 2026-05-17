import { useCallback, useMemo, useRef, useState } from "react";

type Method = "lda" | "qda" | "nb";
type Pt = { x: number; y: number; k: number };

const COLORS = ["#3b82f6", "#f59e0b", "#10b981"];
const FILLS = ["#3b82f622", "#f59e0b22", "#10b98122"];
const STROKES = ["#2563eb", "#d97706", "#059669"];

const X_MIN = -5;
const X_MAX = 5;
const Y_MIN = -4;
const Y_MAX = 4;
const W = 460;
const H = 360;
const CELL = 5;

function meanOf(pts: Pt[]): [number, number] {
  if (pts.length === 0) return [0, 0];
  let sx = 0;
  let sy = 0;
  for (const p of pts) {
    sx += p.x;
    sy += p.y;
  }
  return [sx / pts.length, sy / pts.length];
}

function sampleCov(
  pts: Pt[],
  mu: [number, number],
): [number, number, number] {
  if (pts.length < 2) return [1, 0, 1];
  let a = 0;
  let b = 0;
  let c = 0;
  for (const p of pts) {
    const dx = p.x - mu[0];
    const dy = p.y - mu[1];
    a += dx * dx;
    b += dx * dy;
    c += dy * dy;
  }
  const n = pts.length - 1;
  return [a / n + 1e-3, b / n, c / n + 1e-3];
}

function logPdf(
  x: number,
  y: number,
  mu: [number, number],
  cov: [number, number, number],
): number {
  const [a, b, c] = cov;
  const det = a * c - b * b;
  if (det <= 1e-9) return -Infinity;
  const dx = x - mu[0];
  const dy = y - mu[1];
  const inv0 = c / det;
  const inv1 = -b / det;
  const inv3 = a / det;
  const m = dx * (inv0 * dx + inv1 * dy) + dy * (inv1 * dx + inv3 * dy);
  return -0.5 * (2 * Math.log(2 * Math.PI) + Math.log(det) + m);
}

const INITIAL_3CLASS: Pt[] = [
  { x: -2.6, y: -1.5, k: 0 },
  { x: -3.0, y: -0.8, k: 0 },
  { x: -2.2, y: -2.0, k: 0 },
  { x: -2.8, y: -1.0, k: 0 },
  { x: -1.9, y: -1.7, k: 0 },
  { x: -3.3, y: -1.4, k: 0 },
  { x: 2.4, y: -0.6, k: 1 },
  { x: 2.9, y: 0.4, k: 1 },
  { x: 3.4, y: -1.0, k: 1 },
  { x: 2.0, y: 0.0, k: 1 },
  { x: 3.0, y: -0.3, k: 1 },
  { x: 2.6, y: 0.8, k: 1 },
  { x: 0.0, y: 2.5, k: 2 },
  { x: -0.6, y: 2.1, k: 2 },
  { x: 0.7, y: 2.9, k: 2 },
  { x: 0.2, y: 1.9, k: 2 },
  { x: -0.3, y: 2.7, k: 2 },
  { x: 0.5, y: 2.3, k: 2 },
];

const INITIAL_2CLASS: Pt[] = INITIAL_3CLASS.filter((p) => p.k < 2);

function classify(
  px: number,
  py: number,
  method: Method,
  perClass: Pt[][],
): number {
  const k = perClass.length;
  const mus = perClass.map(meanOf);
  const covs = perClass.map((c, i) => sampleCov(c, mus[i]));
  let pooled: [number, number, number] = [0, 0, 0];
  for (const cv of covs) {
    pooled[0] += cv[0];
    pooled[1] += cv[1];
    pooled[2] += cv[2];
  }
  pooled = [pooled[0] / k, pooled[1] / k, pooled[2] / k];
  let best = 0;
  let bestL = -Infinity;
  const totalN = perClass.reduce((s, c) => s + c.length, 0);
  for (let i = 0; i < k; i++) {
    const prior = Math.log(Math.max(perClass[i].length, 1) / Math.max(totalN, 1));
    let cov: [number, number, number];
    if (method === "lda") cov = pooled;
    else if (method === "qda") cov = covs[i];
    else cov = [covs[i][0], 0, covs[i][2]];
    const l = logPdf(px, py, mus[i], cov) + prior;
    if (l > bestL) {
      bestL = l;
      best = i;
    }
  }
  return best;
}

function ellipsePath(
  mu: [number, number],
  cov: [number, number, number],
  sx: (x: number) => number,
  sy: (y: number) => number,
  nStd = 2,
): string {
  // Find principal axes by 2x2 eigendecomp
  const [a, b, c] = cov;
  const tr = a + c;
  const det = a * c - b * b;
  const disc = Math.max(0, (tr * tr) / 4 - det);
  const l1 = tr / 2 + Math.sqrt(disc);
  const l2 = tr / 2 - Math.sqrt(disc);
  const ax1 = nStd * Math.sqrt(Math.max(l1, 1e-6));
  const ax2 = nStd * Math.sqrt(Math.max(l2, 1e-6));
  let theta = 0;
  if (Math.abs(b) > 1e-9 || Math.abs(a - c) > 1e-9) {
    theta = 0.5 * Math.atan2(2 * b, a - c);
  }
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const pts: string[] = [];
  const N = 60;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * 2 * Math.PI;
    const ex = ax1 * Math.cos(t);
    const ey = ax2 * Math.sin(t);
    const x = mu[0] + ex * cosT - ey * sinT;
    const y = mu[1] + ex * sinT + ey * cosT;
    pts.push(`${sx(x).toFixed(1)},${sy(y).toFixed(1)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

export function DecisionBoundaryViz() {
  const [method, setMethod] = useState<Method>("lda");
  const [numClasses, setNumClasses] = useState<2 | 3>(3);
  const [points, setPoints] = useState<Pt[]>(INITIAL_3CLASS);
  const [activeClass, setActiveClass] = useState(0);
  const [showEllipses, setShowEllipses] = useState(true);
  const [showRegions, setShowRegions] = useState(true);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const sx = useCallback((v: number) => ((v - X_MIN) / (X_MAX - X_MIN)) * W, []);
  const sy = useCallback(
    (v: number) => H - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * H,
    [],
  );
  const invX = (px: number) => X_MIN + (px / W) * (X_MAX - X_MIN);
  const invY = (py: number) => Y_MIN + ((H - py) / H) * (Y_MAX - Y_MIN);

  const setN = (n: 2 | 3) => {
    setNumClasses(n);
    setPoints(n === 2 ? INITIAL_2CLASS : INITIAL_3CLASS);
    if (activeClass >= n) setActiveClass(0);
  };

  const perClass = useMemo(() => {
    const out: Pt[][] = [];
    for (let i = 0; i < numClasses; i++) {
      out.push(points.filter((p) => p.k === i));
    }
    return out;
  }, [points, numClasses]);

  const stats = useMemo(() => {
    const mus = perClass.map(meanOf);
    const covs = perClass.map((c, i) => sampleCov(c, mus[i]));
    let pooled: [number, number, number] = [0, 0, 0];
    for (const cv of covs) {
      pooled[0] += cv[0];
      pooled[1] += cv[1];
      pooled[2] += cv[2];
    }
    pooled = [
      pooled[0] / numClasses,
      pooled[1] / numClasses,
      pooled[2] / numClasses,
    ];
    return { mus, covs, pooled };
  }, [perClass, numClasses]);

  const grid = useMemo(() => {
    if (!showRegions) return null;
    const cols = Math.floor(W / CELL);
    const rows = Math.floor(H / CELL);
    const g: number[][] = [];
    for (let j = 0; j < rows; j++) {
      const row: number[] = [];
      const py = Y_MIN + ((rows - 1 - j) / (rows - 1)) * (Y_MAX - Y_MIN);
      for (let i = 0; i < cols; i++) {
        const px = X_MIN + (i / (cols - 1)) * (X_MAX - X_MIN);
        row.push(classify(px, py, method, perClass));
      }
      g.push(row);
    }
    return { g, cols, rows };
  }, [perClass, method, showRegions]);

  const onSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (dragIdx !== null) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const x = invX(px);
    const y = invY(py);
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

  const resetPoints = () =>
    setPoints(numClasses === 2 ? INITIAL_2CLASS : INITIAL_3CLASS);
  const clearPoints = () =>
    setPoints(() => {
      // keep one anchor per class so models don't crash
      const out: Pt[] = [];
      for (let k = 0; k < numClasses; k++) {
        out.push({ x: -3 + k * 3, y: 0, k });
      }
      return out;
    });

  const trainAcc = useMemo(() => {
    let ok = 0;
    for (const p of points) {
      if (classify(p.x, p.y, method, perClass) === p.k) ok++;
    }
    return points.length === 0 ? 0 : ok / points.length;
  }, [points, perClass, method]);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="grid md:grid-cols-[1fr_auto] gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="text-xs text-muted-foreground mr-1">Modell:</div>
            {(["lda", "qda", "nb"] as Method[]).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`px-3 py-1 rounded-md text-xs font-mono border transition-colors ${
                  method === m
                    ? "border-brand bg-brand/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-brand/40"
                }`}
              >
                {m.toUpperCase()}
              </button>
            ))}
            <div className="ml-3 text-xs text-muted-foreground">Klasser:</div>
            {([2, 3] as const).map((n) => (
              <button
                key={n}
                onClick={() => setN(n)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
                  numClasses === n
                    ? "border-brand bg-brand/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-brand/40"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="text-xs text-muted-foreground mr-1">
              Klikk legger til klasse:
            </div>
            {Array.from({ length: numClasses }).map((_, k) => (
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
                  style={{ backgroundColor: COLORS[k] }}
                />
                K{k}
              </button>
            ))}
            <label className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
              <input
                type="checkbox"
                checked={showRegions}
                onChange={(e) => setShowRegions(e.target.checked)}
              />
              Regioner
            </label>
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <input
                type="checkbox"
                checked={showEllipses}
                onChange={(e) => setShowEllipses(e.target.checked)}
              />
              Ellipser
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
            {grid &&
              grid.g.flatMap((row, j) =>
                row.map((k, i) => (
                  <rect
                    key={`g-${i}-${j}`}
                    x={i * CELL}
                    y={j * CELL}
                    width={CELL}
                    height={CELL}
                    fill={FILLS[k]}
                  />
                )),
              )}
            {/* Axis lines */}
            <line
              x1={sx(0)}
              y1={0}
              x2={sx(0)}
              y2={H}
              stroke="#999"
              strokeDasharray="2 3"
              strokeOpacity={0.5}
            />
            <line
              x1={0}
              y1={sy(0)}
              x2={W}
              y2={sy(0)}
              stroke="#999"
              strokeDasharray="2 3"
              strokeOpacity={0.5}
            />
            {/* Ellipses for assumed distributions */}
            {showEllipses &&
              Array.from({ length: numClasses }).map((_, k) => {
                if (perClass[k].length < 2) return null;
                const mu = stats.mus[k];
                let cov: [number, number, number];
                if (method === "lda") cov = stats.pooled;
                else if (method === "qda") cov = stats.covs[k];
                else cov = [stats.covs[k][0], 0, stats.covs[k][2]];
                return (
                  <path
                    key={`e-${k}`}
                    d={ellipsePath(mu, cov, sx, sy, 1.5)}
                    fill="none"
                    stroke={STROKES[k]}
                    strokeWidth={1.5}
                    strokeOpacity={0.85}
                    strokeDasharray="4 3"
                  />
                );
              })}
            {/* Points */}
            {points.map((p, i) => (
              <circle
                key={`p-${i}`}
                cx={sx(p.x)}
                cy={sy(p.y)}
                r={5}
                fill={COLORS[p.k]}
                stroke="#fff"
                strokeWidth={1}
                style={{ cursor: "grab" }}
                onPointerDown={(e) => onPointDown(i, e)}
              />
            ))}
            {/* Means */}
            {showEllipses &&
              stats.mus.map((mu, k) =>
                perClass[k].length === 0 ? null : (
                  <g key={`mu-${k}`}>
                    <circle
                      cx={sx(mu[0])}
                      cy={sy(mu[1])}
                      r={6}
                      fill="none"
                      stroke={STROKES[k]}
                      strokeWidth={2}
                    />
                    <line
                      x1={sx(mu[0]) - 4}
                      y1={sy(mu[1])}
                      x2={sx(mu[0]) + 4}
                      y2={sy(mu[1])}
                      stroke={STROKES[k]}
                      strokeWidth={2}
                    />
                    <line
                      x1={sx(mu[0])}
                      y1={sy(mu[1]) - 4}
                      x2={sx(mu[0])}
                      y2={sy(mu[1]) + 4}
                      stroke={STROKES[k]}
                      strokeWidth={2}
                    />
                  </g>
                ),
              )}
          </svg>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <button
              onClick={resetPoints}
              className="text-xs px-3 py-1 rounded-md border border-border bg-background hover:bg-muted/50"
            >
              Reset
            </button>
            <button
              onClick={clearPoints}
              className="text-xs px-3 py-1 rounded-md border border-border bg-background hover:bg-muted/50"
            >
              Slett alle
            </button>
            <div className="text-xs text-muted-foreground ml-auto">
              Klikk: legg til punkt · Dra punkt: flytt
            </div>
          </div>
        </div>
        <aside className="md:w-72">
          <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-3">
            <div>
              <div className="text-muted-foreground">Trenings-accuracy</div>
              <div className="text-2xl font-bold tabular-nums">
                {(trainAcc * 100).toFixed(1)}%
              </div>
              <div className="text-muted-foreground mt-0.5">
                {points.length} punkter totalt
              </div>
            </div>
            <div className="border-t border-border pt-2">
              <div className="text-muted-foreground mb-1">Antakelse</div>
              <div className="font-mono text-[11px]">
                {method === "lda" && (
                  <>
                    Gauss per klasse, <em>delt</em> Σ ⇒ lineær grense
                  </>
                )}
                {method === "qda" && (
                  <>
                    Gauss per klasse, <em>egen</em> Σₖ ⇒ kvadratisk
                  </>
                )}
                {method === "nb" && (
                  <>
                    Gauss, <em>diagonal</em> Σₖ (uavhengige features) ⇒ aksejustert
                    kvadratisk
                  </>
                )}
              </div>
            </div>
            <div className="border-t border-border pt-2">
              <div className="text-muted-foreground mb-1">
                Estimerte parametere
              </div>
              <div className="font-mono text-[10px] space-y-2 leading-snug">
                {Array.from({ length: numClasses }).map((_, k) => {
                  if (perClass[k].length === 0) return null;
                  const mu = stats.mus[k];
                  let cov: [number, number, number];
                  if (method === "lda") cov = stats.pooled;
                  else if (method === "qda") cov = stats.covs[k];
                  else cov = [stats.covs[k][0], 0, stats.covs[k][2]];
                  return (
                    <div key={k}>
                      <span
                        className="inline-block h-2 w-2 rounded-full mr-1 align-middle"
                        style={{ backgroundColor: COLORS[k] }}
                      />
                      <span className="font-semibold">K{k}</span> (n={perClass[k].length})
                      <div className="ml-3">
                        μ = [{mu[0].toFixed(2)}, {mu[1].toFixed(2)}]
                      </div>
                      <div className="ml-3">
                        Σ = [[{cov[0].toFixed(2)}, {cov[1].toFixed(2)}],
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;[{cov[1].toFixed(2)},{" "}
                        {cov[2].toFixed(2)}]]
                      </div>
                    </div>
                  );
                })}
                {method === "lda" && (
                  <div className="text-muted-foreground italic">
                    LDA: Σ er pooled — samme for alle klasser.
                  </div>
                )}
                {method === "nb" && (
                  <div className="text-muted-foreground italic">
                    NB tvinger Σ[0,1] = 0 (ingen kovarians).
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
