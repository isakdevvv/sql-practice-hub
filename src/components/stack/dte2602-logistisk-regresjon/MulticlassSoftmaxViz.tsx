import { useCallback, useMemo, useRef, useState } from "react";

type Pt = { x: number; y: number; k: 0 | 1 | 2 };
type Mode = "softmax" | "ovr";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981"];
const FILLS = ["#3b82f622", "#f59e0b22", "#10b98122"];

const X_MIN = -5;
const X_MAX = 5;
const Y_MIN = -4;
const Y_MAX = 4;
const W = 480;
const H = 360;
const CELL = 6;

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

function sigmoid(z: number): number {
  if (z > 40) return 1;
  if (z < -40) return 0;
  return 1 / (1 + Math.exp(-z));
}

// Fit a 3-class softmax via gradient descent. Returns weight matrices Wk and biases bk per class.
function fitSoftmax(pts: Pt[]): { w: [number, number][]; b: number[] } {
  const K = 3;
  // standardise
  const mx = meanOf(pts)[0];
  const my = meanOf(pts)[1];
  let sxv = 0;
  let syv = 0;
  for (const p of pts) {
    sxv += (p.x - mx) ** 2;
    syv += (p.y - my) ** 2;
  }
  const sigX = Math.sqrt(sxv / Math.max(1, pts.length)) || 1;
  const sigY = Math.sqrt(syv / Math.max(1, pts.length)) || 1;

  const w: [number, number][] = [
    [0, 0],
    [0, 0],
    [0, 0],
  ];
  const b: number[] = [0, 0, 0];
  const lr = 0.4;
  const iters = 200;
  for (let it = 0; it < iters; it++) {
    const gw: [number, number][] = [
      [0, 0],
      [0, 0],
      [0, 0],
    ];
    const gb: number[] = [0, 0, 0];
    for (const p of pts) {
      const xs = (p.x - mx) / sigX;
      const ys = (p.y - my) / sigY;
      // logits
      const zs = [
        b[0] + w[0][0] * xs + w[0][1] * ys,
        b[1] + w[1][0] * xs + w[1][1] * ys,
        b[2] + w[2][0] * xs + w[2][1] * ys,
      ];
      const m = Math.max(...zs);
      const exps = zs.map((z) => Math.exp(z - m));
      const sum = exps.reduce((a, c) => a + c, 0);
      const probs = exps.map((e) => e / sum);
      for (let k = 0; k < K; k++) {
        const err = probs[k] - (p.k === k ? 1 : 0);
        gw[k][0] += err * xs;
        gw[k][1] += err * ys;
        gb[k] += err;
      }
    }
    const n = pts.length || 1;
    for (let k = 0; k < K; k++) {
      w[k][0] -= (lr / n) * gw[k][0];
      w[k][1] -= (lr / n) * gw[k][1];
      b[k] -= (lr / n) * gb[k];
    }
  }
  // unstandardise to original feature space:
  // z_k = b_k + w_k1*(x-mx)/sigX + w_k2*(y-my)/sigY
  //     = (b_k - w_k1*mx/sigX - w_k2*my/sigY) + (w_k1/sigX)*x + (w_k2/sigY)*y
  const wOut: [number, number][] = w.map((wi) => [wi[0] / sigX, wi[1] / sigY]);
  const bOut: number[] = b.map((bi, k) => bi - (w[k][0] * mx) / sigX - (w[k][1] * my) / sigY);
  return { w: wOut, b: bOut };
}

// One-vs-rest: fit 3 binary log-reg
function fitOvr(pts: Pt[]): { w: [number, number][]; b: number[] } {
  const w: [number, number][] = [[0, 0], [0, 0], [0, 0]];
  const b: number[] = [0, 0, 0];
  for (let k = 0; k < 3; k++) {
    const mx = meanOf(pts)[0];
    const my = meanOf(pts)[1];
    let sxv = 0;
    let syv = 0;
    for (const p of pts) {
      sxv += (p.x - mx) ** 2;
      syv += (p.y - my) ** 2;
    }
    const sigX = Math.sqrt(sxv / Math.max(1, pts.length)) || 1;
    const sigY = Math.sqrt(syv / Math.max(1, pts.length)) || 1;
    let w0 = 0;
    let w1 = 0;
    let w2 = 0;
    const lr = 0.4;
    const iters = 200;
    for (let it = 0; it < iters; it++) {
      let g0 = 0;
      let g1 = 0;
      let g2 = 0;
      for (const p of pts) {
        const xs = (p.x - mx) / sigX;
        const ys = (p.y - my) / sigY;
        const ph = sigmoid(w0 + w1 * xs + w2 * ys);
        const y = p.k === k ? 1 : 0;
        const err = ph - y;
        g0 += err;
        g1 += err * xs;
        g2 += err * ys;
      }
      const n = pts.length || 1;
      w0 -= (lr / n) * g0;
      w1 -= (lr / n) * g1;
      w2 -= (lr / n) * g2;
    }
    const b1 = w1 / sigX;
    const b2 = w2 / sigY;
    const b0 = w0 - (w1 * mx) / sigX - (w2 * my) / sigY;
    w[k] = [b1, b2];
    b[k] = b0;
  }
  return { w, b };
}

function predict(
  px: number,
  py: number,
  fit: { w: [number, number][]; b: number[] },
  mode: Mode,
): { k: number; probs: number[] } {
  const zs = [0, 1, 2].map((k) => fit.b[k] + fit.w[k][0] * px + fit.w[k][1] * py);
  if (mode === "softmax") {
    const m = Math.max(...zs);
    const exps = zs.map((z) => Math.exp(z - m));
    const sum = exps.reduce((a, c) => a + c, 0);
    const probs = exps.map((e) => e / sum);
    let best = 0;
    for (let k = 1; k < 3; k++) if (probs[k] > probs[best]) best = k;
    return { k: best, probs };
  } else {
    // ovr: pick class with highest binary probability
    const probs = zs.map((z) => sigmoid(z));
    let best = 0;
    for (let k = 1; k < 3; k++) if (probs[k] > probs[best]) best = k;
    return { k: best, probs };
  }
}

const INITIAL: Pt[] = [
  { x: -2.6, y: -1.5, k: 0 },
  { x: -3.0, y: -0.8, k: 0 },
  { x: -2.2, y: -2.0, k: 0 },
  { x: -2.8, y: -1.0, k: 0 },
  { x: -1.9, y: -1.7, k: 0 },
  { x: -3.3, y: -1.4, k: 0 },
  { x: -2.5, y: 0.2, k: 0 },
  { x: 2.4, y: -0.6, k: 1 },
  { x: 2.9, y: 0.4, k: 1 },
  { x: 3.4, y: -1.0, k: 1 },
  { x: 2.0, y: 0.0, k: 1 },
  { x: 3.0, y: -0.3, k: 1 },
  { x: 2.6, y: 0.8, k: 1 },
  { x: 3.6, y: -1.6, k: 1 },
  { x: 0.0, y: 2.5, k: 2 },
  { x: -0.6, y: 2.1, k: 2 },
  { x: 0.7, y: 2.9, k: 2 },
  { x: 0.2, y: 1.9, k: 2 },
  { x: -0.3, y: 2.7, k: 2 },
  { x: 0.5, y: 2.3, k: 2 },
  { x: 1.1, y: 3.1, k: 2 },
];

export function MulticlassSoftmaxViz() {
  const [mode, setMode] = useState<Mode>("softmax");
  const [points, setPoints] = useState<Pt[]>(INITIAL);
  const [activeClass, setActiveClass] = useState<0 | 1 | 2>(0);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const sx = useCallback((v: number) => ((v - X_MIN) / (X_MAX - X_MIN)) * W, []);
  const sy = useCallback((v: number) => H - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * H, []);
  const invX = (px: number) => X_MIN + (px / W) * (X_MAX - X_MIN);
  const invY = (py: number) => Y_MIN + ((H - py) / H) * (Y_MAX - Y_MIN);

  const fit = useMemo(() => (mode === "softmax" ? fitSoftmax(points) : fitOvr(points)), [points, mode]);

  const grid = useMemo(() => {
    const cols = Math.floor(W / CELL);
    const rows = Math.floor(H / CELL);
    const g: number[][] = [];
    for (let j = 0; j < rows; j++) {
      const row: number[] = [];
      const py = Y_MIN + ((rows - 1 - j) / (rows - 1)) * (Y_MAX - Y_MIN);
      for (let i = 0; i < cols; i++) {
        const px = X_MIN + (i / (cols - 1)) * (X_MAX - X_MIN);
        row.push(predict(px, py, fit, mode).k);
      }
      g.push(row);
    }
    return { g, cols, rows };
  }, [fit, mode]);

  const hoverProbs = useMemo(() => {
    if (!hover) return null;
    return predict(hover.x, hover.y, fit, mode);
  }, [hover, fit, mode]);

  const onSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (dragIdx !== null) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = invX(e.clientX - rect.left);
    const y = invY(e.clientY - rect.top);
    if (x < X_MIN || x > X_MAX || y < Y_MIN || y > Y_MAX) return;
    setPoints((prev) => [...prev, { x, y, k: activeClass }]);
  };
  const onSvgMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = invX(e.clientX - rect.left);
    const y = invY(e.clientY - rect.top);
    setHover({ x, y });
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
            <div className="text-xs text-muted-foreground mr-1">Strategi:</div>
            {(["softmax", "ovr"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 rounded-md text-xs font-mono border transition-colors ${
                  mode === m
                    ? "border-brand bg-brand/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-brand/40"
                }`}
              >
                {m === "softmax" ? "Softmax (multinomial)" : "One-vs-rest"}
              </button>
            ))}
            <div className="ml-3 text-xs text-muted-foreground">Klikk legger til:</div>
            {([0, 1, 2] as const).map((k) => (
              <button
                key={k}
                onClick={() => setActiveClass(k)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors flex items-center gap-1.5 ${
                  activeClass === k
                    ? "border-foreground bg-muted text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/40"
                }`}
              >
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[k] }} />
                K{k}
              </button>
            ))}
          </div>
          <svg
            ref={svgRef}
            width={W}
            height={H}
            className="block rounded-lg bg-background border border-border cursor-crosshair w-full"
            viewBox={`0 0 ${W} ${H}`}
            onClick={onSvgClick}
            onMouseMove={onSvgMove}
            onPointerMove={onPointMove}
            onPointerUp={onPointUp}
            onMouseLeave={() => setHover(null)}
          >
            {grid.g.flatMap((row, j) =>
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
            <line x1={sx(0)} y1={0} x2={sx(0)} y2={H} stroke="#888" strokeDasharray="2 3" strokeOpacity={0.3} />
            <line x1={0} y1={sy(0)} x2={W} y2={sy(0)} stroke="#888" strokeDasharray="2 3" strokeOpacity={0.3} />
            {points.map((p, i) => (
              <circle
                key={i}
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
            {hover && (
              <circle
                cx={sx(hover.x)}
                cy={sy(hover.y)}
                r={4}
                fill="none"
                stroke="#fff"
                strokeWidth={1.5}
                strokeDasharray="2 2"
              />
            )}
          </svg>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <button
              onClick={() => setPoints(INITIAL)}
              className="text-xs px-3 py-1 rounded-md border border-border bg-background hover:bg-muted/50"
            >
              Reset punkter
            </button>
            <div className="text-xs text-muted-foreground ml-auto">
              Klikk: legg til · Dra: flytt · Hover: se softmax-sannsynligheter
            </div>
          </div>
        </div>

        <aside className="md:w-72 space-y-3">
          <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-2">
            <div className="font-semibold mb-1">Softmax-formelen</div>
            <div className="font-mono text-[11px] leading-relaxed">
              z_k = β_k0 + β_k1·x + β_k2·y
              <br />
              P(y=k|x) = e^z_k / Σⱼ e^z_j
            </div>
            <div className="text-[10px] text-muted-foreground font-sans leading-snug pt-1 border-t border-border">
              Softmax sikrer at sannsynlighetene summerer til 1 og er
              <em> sammenkoblet</em> — øker én sannsynlighet, må de andre falle.
              One-vs-rest trener 3 uavhengige modeller; sannsynlighetene
              summerer ikke til 1 og «ingen klasse» kan vinne hvis alle er ≤ 0.5.
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-1.5">
            <div className="font-semibold mb-1">Hover-prediksjon</div>
            {hoverProbs ? (
              <>
                {hoverProbs.probs.map((p, k) => (
                  <div key={k} className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[k] }}
                    />
                    <span className="font-mono text-[11px] tabular-nums w-12">
                      K{k}: {(p * 100).toFixed(1)}%
                    </span>
                    <div className="flex-1 h-1.5 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full"
                        style={{ width: `${Math.min(100, p * 100)}%`, backgroundColor: COLORS[k] }}
                      />
                    </div>
                  </div>
                ))}
                <div className="text-[10px] text-muted-foreground pt-1 font-mono">
                  Σ = {hoverProbs.probs.reduce((a, c) => a + c, 0).toFixed(3)}
                  {mode === "ovr" && " (ikke 1!)"}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">Beveg musa over plottet</div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
