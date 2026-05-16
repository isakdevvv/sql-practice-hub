import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Interaktiv Gaussian Mixture Model-visualisering.
 *
 * Tre lag:
 *  - Basis: 3 komponenter, vis ellipser (1σ, 2σ), hard assignment.
 *  - Dypere: drag μ_j, slider for σ_j, toggle hard/soft assignment,
 *            E-step / M-step / kjør EM.
 *  - Eksamen: gitt initialparametre, kjør EM én iterasjon — sjekk
 *            at log-likelihood øker.
 */

type Mode = "basis" | "deep" | "exam";

type Pt = { x: number; y: number };
type Comp = { pi: number; mux: number; muy: number; sx: number; sy: number };

const W = 480;
const H = 360;
const PAD = 22;
const X_MIN = 0;
const X_MAX = 10;
const Y_MIN = 0;
const Y_MAX = 10;

function sx(x: number) {
  return PAD + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - 2 * PAD);
}
function sy(y: number) {
  return H - PAD - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (H - 2 * PAD);
}
function unscaleX(px: number) {
  return X_MIN + ((px - PAD) / (W - 2 * PAD)) * (X_MAX - X_MIN);
}
function unscaleY(py: number) {
  return Y_MIN + ((H - PAD - py) / (H - 2 * PAD)) * (Y_MAX - Y_MIN);
}

const COLORS = [
  { fg: "hsl(215 80% 55%)", bg: "rgba(64, 132, 220, 0.18)" },
  { fg: "hsl(28 90% 55%)", bg: "rgba(240, 145, 48, 0.18)" },
  { fg: "hsl(150 60% 45%)", bg: "rgba(64, 180, 110, 0.18)" },
];

function mulberry32(seed: number) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(rng: () => number, m = 0, s = 1) {
  return m + s * Math.sqrt(-2 * Math.log(Math.max(1e-9, rng()))) * Math.cos(2 * Math.PI * rng());
}

function generateData(seed: number): Pt[] {
  const rng = mulberry32(seed);
  const truths = [
    { mux: 2.5, muy: 7.5, sx: 0.7, sy: 0.7 },
    { mux: 7.0, muy: 6.5, sx: 0.9, sy: 1.1 },
    { mux: 4.5, muy: 2.5, sx: 0.6, sy: 0.6 },
  ];
  const pts: Pt[] = [];
  for (let i = 0; i < 60; i++) {
    const t = truths[i % 3];
    pts.push({
      x: Math.max(0.2, Math.min(9.8, gauss(rng, t.mux, t.sx))),
      y: Math.max(0.2, Math.min(9.8, gauss(rng, t.muy, t.sy))),
    });
  }
  return pts;
}

// Diagonal kovariansmatrise (forenkler — Σ = diag(sx², sy²))
function pdf(p: Pt, c: Comp): number {
  const dx = p.x - c.mux;
  const dy = p.y - c.muy;
  const num = Math.exp(-0.5 * ((dx * dx) / (c.sx * c.sx) + (dy * dy) / (c.sy * c.sy)));
  const denom = 2 * Math.PI * c.sx * c.sy;
  return num / denom;
}

function eStep(pts: Pt[], comps: Comp[]): number[][] {
  const r: number[][] = [];
  for (const p of pts) {
    const w = comps.map((c) => c.pi * pdf(p, c));
    const sum = w.reduce((a, b) => a + b, 0);
    r.push(sum === 0 ? w.map(() => 1 / comps.length) : w.map((x) => x / sum));
  }
  return r;
}

function mStep(pts: Pt[], r: number[][], k: number): Comp[] {
  const n = pts.length;
  const comps: Comp[] = [];
  for (let j = 0; j < k; j++) {
    let nj = 0;
    let mx = 0;
    let my = 0;
    for (let i = 0; i < n; i++) {
      nj += r[i][j];
      mx += r[i][j] * pts[i].x;
      my += r[i][j] * pts[i].y;
    }
    if (nj < 1e-6) nj = 1e-6;
    const muxN = mx / nj;
    const muyN = my / nj;
    let vx = 0;
    let vy = 0;
    for (let i = 0; i < n; i++) {
      vx += r[i][j] * (pts[i].x - muxN) * (pts[i].x - muxN);
      vy += r[i][j] * (pts[i].y - muyN) * (pts[i].y - muyN);
    }
    comps.push({
      pi: nj / n,
      mux: muxN,
      muy: muyN,
      sx: Math.max(0.2, Math.sqrt(vx / nj)),
      sy: Math.max(0.2, Math.sqrt(vy / nj)),
    });
  }
  return comps;
}

function logLikelihood(pts: Pt[], comps: Comp[]): number {
  let ll = 0;
  for (const p of pts) {
    const sum = comps.reduce((a, c) => a + c.pi * pdf(p, c), 0);
    ll += Math.log(Math.max(1e-300, sum));
  }
  return ll;
}

function initialComps(): Comp[] {
  // Med vilje "feil" plassert sånn at EM kan flytte dem
  return [
    { pi: 1 / 3, mux: 3.5, muy: 5.5, sx: 1.2, sy: 1.2 },
    { pi: 1 / 3, mux: 6.5, muy: 5.5, sx: 1.2, sy: 1.2 },
    { pi: 1 / 3, mux: 5.0, muy: 3.0, sx: 1.2, sy: 1.2 },
  ];
}

export function GmmVisualizer() {
  const [mode, setMode] = useState<Mode>("basis");
  const [seed] = useState(11);
  const [comps, setComps] = useState<Comp[]>(initialComps);
  const [hard, setHard] = useState(false);
  const [iter, setIter] = useState(0);
  const [examLLBefore, setExamLLBefore] = useState<number | null>(null);

  const pts = useMemo(() => generateData(seed), [seed]);
  const r = useMemo(() => eStep(pts, comps), [pts, comps]);
  const ll = useMemo(() => logLikelihood(pts, comps), [pts, comps]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ idx: number } | null>(null);

  // Modus-bytte: nullstill state
  useEffect(() => {
    setComps(initialComps());
    setIter(0);
    setExamLLBefore(null);
    setHard(mode === "basis");
  }, [mode]);

  const doE = useCallback(() => {
    // E-step "fixerer" responsibilities (vist via farger). Vi trenger ingen
    // state-endring siden r er memoized — men vi øker iter for tellingen.
    setIter((i) => i + 1);
  }, []);

  const doM = useCallback(() => {
    setComps((cs) => mStep(pts, r, cs.length));
  }, [pts, r]);

  const doFullStep = useCallback(() => {
    setComps((cs) => mStep(pts, eStep(pts, cs), cs.length));
    setIter((i) => i + 1);
  }, [pts]);

  function onPointerDown(e: React.PointerEvent<SVGElement>, idx: number) {
    if (mode === "basis" || mode === "exam") return;
    dragRef.current = { idx };
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    const nx = Math.max(0.2, Math.min(9.8, unscaleX(px)));
    const ny = Math.max(0.2, Math.min(9.8, unscaleY(py)));
    const idx = dragRef.current.idx;
    setComps((cs) => cs.map((c, i) => (i === idx ? { ...c, mux: nx, muy: ny } : c)));
  }
  function onPointerUp(e: React.PointerEvent<SVGSVGElement>) {
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  // Eksamen: én EM-iterasjon på faste startparametre, sammenlign LL
  function examRunStep() {
    if (examLLBefore === null) setExamLLBefore(ll);
    doFullStep();
  }
  function examReset() {
    setComps(initialComps());
    setExamLLBefore(null);
    setIter(0);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4" role="region" aria-label="Interaktiv visualisering: GMM clustering">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          GMM &amp; EM-visualiserer
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["basis", "deep", "exam"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={
                "px-2.5 py-1 rounded border text-xs " +
                (mode === m
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-background hover:border-brand/40")
              }
            >
              {m === "basis" ? "Basis" : m === "deep" ? "Dypere" : "Eksamen"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-4">
        <div className="rounded-lg border border-border bg-background overflow-hidden">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto select-none touch-none"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {/* grid */}
            {Array.from({ length: 11 }).map((_, i) => (
              <g key={i} opacity={0.07}>
                <line x1={sx(i)} x2={sx(i)} y1={sy(0)} y2={sy(10)} stroke="currentColor" />
                <line x1={sx(0)} x2={sx(10)} y1={sy(i)} y2={sy(i)} stroke="currentColor" />
              </g>
            ))}

            {/* ellipser per komponent (1σ og 2σ) */}
            {comps.map((c, j) => {
              const color = COLORS[j % COLORS.length];
              const cx = sx(c.mux);
              const cy = sy(c.muy);
              const rxPx = sx(c.mux + c.sx) - cx;
              const ryPx = cy - sy(c.muy + c.sy);
              return (
                <g key={`e${j}`}>
                  <ellipse cx={cx} cy={cy} rx={rxPx * 2} ry={ryPx * 2} fill={color.bg} stroke={color.fg} strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
                  <ellipse cx={cx} cy={cy} rx={rxPx} ry={ryPx} fill={color.bg} stroke={color.fg} strokeWidth={1.5} />
                </g>
              );
            })}

            {/* punkter — hard eller soft farging */}
            {pts.map((p, i) => {
              if (hard || mode === "basis") {
                let best = 0;
                let bestR = -1;
                for (let j = 0; j < r[i].length; j++) {
                  if (r[i][j] > bestR) {
                    bestR = r[i][j];
                    best = j;
                  }
                }
                return <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={4} fill={COLORS[best].fg} />;
              }
              // soft: mix RGB i forhold til r[i]
              const rgb = [0, 0, 0];
              const srcs = [
                [64, 132, 220],
                [240, 145, 48],
                [64, 180, 110],
              ];
              for (let j = 0; j < r[i].length; j++) {
                rgb[0] += srcs[j % 3][0] * r[i][j];
                rgb[1] += srcs[j % 3][1] * r[i][j];
                rgb[2] += srcs[j % 3][2] * r[i][j];
              }
              const fill = `rgb(${rgb[0].toFixed(0)}, ${rgb[1].toFixed(0)}, ${rgb[2].toFixed(0)})`;
              return <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={4} fill={fill} />;
            })}

            {/* centroid-markører — drag-bare */}
            {comps.map((c, j) => (
              <g
                key={`m${j}`}
                onPointerDown={(e) => onPointerDown(e, j)}
                style={{ cursor: mode === "deep" ? "grab" : "default" }}
              >
                <circle
                  cx={sx(c.mux)}
                  cy={sy(c.muy)}
                  r={9}
                  fill={COLORS[j].fg}
                  stroke="white"
                  strokeWidth={2.5}
                />
                <text
                  x={sx(c.mux)}
                  y={sy(c.muy) + 3}
                  fontSize={9}
                  fontWeight={700}
                  textAnchor="middle"
                  fill="white"
                  style={{ pointerEvents: "none" }}
                >
                  μ{j + 1}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="space-y-3">
          <div className="rounded-md border border-border bg-background px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Log-likelihood
            </div>
            <div className="text-lg font-mono font-bold">{ll.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              iter = {iter}
            </div>
          </div>

          {mode === "deep" && (
            <>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Assignment</div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setHard(true)}
                    className={
                      "flex-1 px-2 py-1 rounded border text-xs " +
                      (hard
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-border bg-background hover:border-brand/40")
                    }
                  >
                    Hard
                  </button>
                  <button
                    type="button"
                    onClick={() => setHard(false)}
                    className={
                      "flex-1 px-2 py-1 rounded border text-xs " +
                      (!hard
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-border bg-background hover:border-brand/40")
                    }
                  >
                    Soft (gradient)
                  </button>
                </div>
              </div>

              {comps.map((c, j) => (
                <label key={j} className="block text-xs">
                  <span className="text-muted-foreground">
                    σ_{j + 1} = {c.sx.toFixed(2)}
                  </span>
                  <input
                    type="range"
                    min={0.3}
                    max={2.5}
                    step={0.1}
                    value={c.sx}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setComps((cs) =>
                        cs.map((cc, i) => (i === j ? { ...cc, sx: v, sy: v } : cc)),
                      );
                    }}
                    className="w-full"
                  />
                </label>
              ))}

              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={doE}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
                >
                  E-step (oppdatér r)
                </button>
                <button
                  type="button"
                  onClick={doM}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
                >
                  M-step (oppdatér μ, σ, π)
                </button>
                <button
                  type="button"
                  onClick={doFullStep}
                  className="rounded-md bg-brand text-brand-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90"
                >
                  Full EM-iterasjon
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setComps(initialComps());
                    setIter(0);
                  }}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
                >
                  Reset
                </button>
              </div>
            </>
          )}

          {mode === "exam" && (
            <div className="space-y-2 text-xs text-muted-foreground">
              <div>
                Init: 3 komponenter satt med vilje feil (overlappende, π=1/3 hver).
                Klikk «Steg EM» én eller flere ganger og observer LL.
              </div>
              <button
                type="button"
                onClick={examRunStep}
                className="w-full rounded-md bg-brand text-brand-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90"
              >
                Steg EM (LL skal øke)
              </button>
              <button
                type="button"
                onClick={examReset}
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
              >
                Reset eksamen
              </button>
              {examLLBefore !== null && (
                <div className="rounded border border-emerald-500/40 bg-emerald-500/10 p-2 text-emerald-700 dark:text-emerald-400 font-mono">
                  LL før: {examLLBefore.toFixed(2)} → nå: {ll.toFixed(2)}
                  <br />
                  Δ = {(ll - examLLBefore).toFixed(2)} {ll - examLLBefore >= -0.01 ? "✓" : "✗"}
                </div>
              )}
              <div className="text-[11px]">
                <strong>Lærdom:</strong> log-likelihood er garantert å øke (eller stå stille) i hver EM-iterasjon — det er hele
                pointet med E/M-vekslingen.
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Lyse ellipser = 2σ, mørke = 1σ. I «soft»-modus farges hvert punkt etter
        responsibility-vektoren r(i, ·) — overlappssone gir blanding av komponentenes farger.
      </p>
    </div>
  );
}
