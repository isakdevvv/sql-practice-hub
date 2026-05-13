import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";

/**
 * Interaktiv k-Means-animasjon (Lloyd's algorithm).
 *
 * Tre lag:
 *  - Basis:   k=3, "Steg"-knapp viser ASSIGN og UPDATE separat.
 *  - Dypere:  slider for k og antall punkter, run-to-convergence, re-init,
 *             ulike init-strategier.
 *  - Eksamen: albuemetoden — kjør k=1..10 og se inertia-knekken.
 */

type Mode = "basis" | "deep" | "elbow";
type Phase = "idle" | "assign" | "update" | "done";

type Pt = { x: number; y: number };
type Centroid = { x: number; y: number };

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

const COLORS = [
  "hsl(215 80% 55%)",
  "hsl(28 90% 55%)",
  "hsl(150 60% 45%)",
  "hsl(285 60% 60%)",
  "hsl(0 70% 60%)",
  "hsl(195 70% 50%)",
];

// Deterministisk PRNG (mulberry32) — gjør verden reproduserbar
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

function gaussian(rng: () => number, mean = 0, std = 1) {
  // Box-Muller
  const u1 = Math.max(1e-9, rng());
  const u2 = rng();
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function generateBlobs(n: number, seed: number): Pt[] {
  const rng = mulberry32(seed);
  const centers = [
    { x: 2.5, y: 7.5 },
    { x: 7.5, y: 7.5 },
    { x: 2.5, y: 2.5 },
    { x: 7.5, y: 2.5 },
  ];
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const c = centers[i % centers.length];
    pts.push({
      x: clamp(gaussian(rng, c.x, 0.9), 0.1, 9.9),
      y: clamp(gaussian(rng, c.y, 0.9), 0.1, 9.9),
    });
  }
  return pts;
}

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

function dist2(a: Pt, b: Pt) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function initRandom(pts: Pt[], k: number, seed: number): Centroid[] {
  const rng = mulberry32(seed);
  const used = new Set<number>();
  const cents: Centroid[] = [];
  while (cents.length < k) {
    const i = Math.floor(rng() * pts.length);
    if (used.has(i)) continue;
    used.add(i);
    cents.push({ ...pts[i] });
  }
  return cents;
}

function initKMeansPP(pts: Pt[], k: number, seed: number): Centroid[] {
  const rng = mulberry32(seed);
  const cents: Centroid[] = [{ ...pts[Math.floor(rng() * pts.length)] }];
  while (cents.length < k) {
    const dists = pts.map((p) =>
      Math.min(...cents.map((c) => dist2(p, c))),
    );
    const sum = dists.reduce((a, b) => a + b, 0);
    if (sum === 0) break;
    let r = rng() * sum;
    let pick = 0;
    for (let i = 0; i < dists.length; i++) {
      r -= dists[i];
      if (r <= 0) {
        pick = i;
        break;
      }
    }
    cents.push({ ...pts[pick] });
  }
  return cents;
}

function assign(pts: Pt[], cents: Centroid[]): number[] {
  return pts.map((p) => {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < cents.length; i++) {
      const d = dist2(p, cents[i]);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  });
}

function update(pts: Pt[], labels: number[], k: number, prev: Centroid[]): Centroid[] {
  const sums = Array.from({ length: k }, () => ({ x: 0, y: 0, n: 0 }));
  for (let i = 0; i < pts.length; i++) {
    const l = labels[i];
    sums[l].x += pts[i].x;
    sums[l].y += pts[i].y;
    sums[l].n += 1;
  }
  return sums.map((s, j) =>
    s.n === 0 ? prev[j] : { x: s.x / s.n, y: s.y / s.n },
  );
}

function inertia(pts: Pt[], cents: Centroid[], labels: number[]): number {
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    sum += dist2(pts[i], cents[labels[i]]);
  }
  return sum;
}

function runKMeansToConvergence(
  pts: Pt[],
  k: number,
  init: "random" | "kmeans++",
  seed: number,
  maxIter = 50,
): { labels: number[]; cents: Centroid[]; inertia: number } {
  let cents =
    init === "kmeans++" ? initKMeansPP(pts, k, seed) : initRandom(pts, k, seed);
  let labels = assign(pts, cents);
  for (let i = 0; i < maxIter; i++) {
    const newCents = update(pts, labels, k, cents);
    const moved = newCents.some(
      (c, j) => Math.abs(c.x - cents[j].x) + Math.abs(c.y - cents[j].y) > 1e-5,
    );
    cents = newCents;
    labels = assign(pts, cents);
    if (!moved) break;
  }
  return { labels, cents, inertia: inertia(pts, cents, labels) };
}

export function KMeansAnimator() {
  const [mode, setMode] = useState<Mode>("basis");
  const [k, setK] = useState(3);
  const [nPoints, setNPoints] = useState(60);
  const [initStrategy, setInitStrategy] = useState<"random" | "kmeans++">("random");
  const [seed, setSeed] = useState(7);

  const pts = useMemo(() => generateBlobs(nPoints, seed), [nPoints, seed]);

  const [cents, setCents] = useState<Centroid[]>(() => initRandom(pts, 3, seed));
  const [labels, setLabels] = useState<number[]>(() => assign(pts, cents));
  const [phase, setPhase] = useState<Phase>("idle");
  const [iter, setIter] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<number | null>(null);

  const reinit = useCallback(() => {
    const c =
      initStrategy === "kmeans++"
        ? initKMeansPP(pts, k, seed)
        : initRandom(pts, k, seed);
    setCents(c);
    setLabels(assign(pts, c));
    setPhase("idle");
    setIter(0);
    setRunning(false);
  }, [pts, k, seed, initStrategy]);

  // Re-init når k eller pts endrer seg
  useEffect(() => {
    reinit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k, nPoints, seed, initStrategy]);

  const doAssign = useCallback(() => {
    const l = assign(pts, cents);
    setLabels(l);
    setPhase("update");
  }, [pts, cents]);

  const doUpdate = useCallback(() => {
    const newCents = update(pts, labels, k, cents);
    const moved = newCents.some(
      (c, j) => Math.abs(c.x - cents[j].x) + Math.abs(c.y - cents[j].y) > 1e-5,
    );
    setCents(newCents);
    setIter((it) => it + 1);
    setPhase(moved ? "assign" : "done");
  }, [pts, labels, k, cents]);

  const stepOnce = useCallback(() => {
    if (phase === "idle" || phase === "assign") doAssign();
    else if (phase === "update") doUpdate();
  }, [phase, doAssign, doUpdate]);

  // Run-to-convergence loop
  useEffect(() => {
    if (!running) return;
    timer.current = window.setTimeout(() => {
      if (phase === "done") {
        setRunning(false);
        return;
      }
      stepOnce();
    }, 400);
    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [running, phase, stepOnce]);

  // Cleanup på unmount
  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  // Elbow-data
  const elbowData = useMemo(() => {
    if (mode !== "elbow") return [];
    const xs: { k: number; inertia: number }[] = [];
    for (let kk = 1; kk <= 10; kk++) {
      const res = runKMeansToConvergence(pts, kk, "kmeans++", seed);
      xs.push({ k: kk, inertia: res.inertia });
    }
    return xs;
  }, [mode, pts, seed]);

  const elbowKnee = useMemo(() => {
    if (elbowData.length === 0) return null;
    // enkel "kneed"-heuristikk: max andre-derivat
    let best = 1;
    let bestVal = -Infinity;
    for (let i = 1; i < elbowData.length - 1; i++) {
      const d2 =
        elbowData[i - 1].inertia - 2 * elbowData[i].inertia + elbowData[i + 1].inertia;
      if (d2 > bestVal) {
        bestVal = d2;
        best = elbowData[i].k;
      }
    }
    return best;
  }, [elbowData]);

  const currentInertia = inertia(pts, cents, labels);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          k-Means-animasjon
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["basis", "deep", "elbow"] as Mode[]).map((m) => (
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
              {m === "basis" ? "Basis" : m === "deep" ? "Dypere" : "Albue"}
            </button>
          ))}
        </div>
      </div>

      {mode !== "elbow" && (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-4">
          <div className="rounded-lg border border-border bg-background overflow-hidden">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
              {/* gridlinjer */}
              {Array.from({ length: 11 }).map((_, i) => (
                <g key={i} opacity={0.08}>
                  <line
                    x1={sx(i)}
                    x2={sx(i)}
                    y1={sy(Y_MIN)}
                    y2={sy(Y_MAX)}
                    stroke="currentColor"
                  />
                  <line
                    x1={sx(X_MIN)}
                    x2={sx(X_MAX)}
                    y1={sy(i)}
                    y2={sy(i)}
                    stroke="currentColor"
                  />
                </g>
              ))}

              {/* punkter — fargen er "current" labels, men vis bare farge etter ASSIGN */}
              {pts.map((p, i) => {
                const lbl = labels[i] ?? 0;
                const color =
                  phase === "idle" && iter === 0
                    ? "hsl(220 10% 60%)"
                    : COLORS[lbl % COLORS.length];
                return <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={4} fill={color} opacity={0.85} />;
              })}

              {/* centroids */}
              {cents.map((c, j) => (
                <g key={j}>
                  <circle
                    cx={sx(c.x)}
                    cy={sy(c.y)}
                    r={12}
                    fill="none"
                    stroke="white"
                    strokeWidth={3}
                  />
                  <circle
                    cx={sx(c.x)}
                    cy={sy(c.y)}
                    r={10}
                    fill={COLORS[j % COLORS.length]}
                    stroke="black"
                    strokeWidth={1.5}
                  />
                  <text
                    x={sx(c.x)}
                    y={sy(c.y) + 4}
                    fontSize={10}
                    fontWeight={700}
                    textAnchor="middle"
                    fill="white"
                    style={{ pointerEvents: "none" }}
                  >
                    {j + 1}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="space-y-3">
            <div className="rounded-md border border-border bg-background px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Tilstand
              </div>
              <div className="text-sm font-mono">
                iter = {iter} ·{" "}
                <span
                  className={
                    phase === "done"
                      ? "text-emerald-600 font-semibold"
                      : "text-brand"
                  }
                >
                  {phase === "idle"
                    ? "klar"
                    : phase === "assign"
                      ? "neste: ASSIGN"
                      : phase === "update"
                        ? "neste: UPDATE"
                        : "konvergert"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                J = {currentInertia.toFixed(2)}
              </div>
            </div>

            {mode === "deep" && (
              <>
                <label className="block text-sm">
                  <span className="text-xs text-muted-foreground">k = {k}</span>
                  <input
                    type="range"
                    min={2}
                    max={6}
                    value={k}
                    onChange={(e) => setK(Number(e.target.value))}
                    className="w-full"
                  />
                </label>

                <label className="block text-sm">
                  <span className="text-xs text-muted-foreground">
                    n = {nPoints} punkter
                  </span>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    step={10}
                    value={nPoints}
                    onChange={(e) => setNPoints(Number(e.target.value))}
                    className="w-full"
                  />
                </label>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">Init</div>
                  <div className="flex gap-1">
                    {(["random", "kmeans++"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setInitStrategy(s)}
                        className={
                          "flex-1 px-2 py-1 rounded border text-xs " +
                          (initStrategy === s
                            ? "border-brand bg-brand/10 text-brand"
                            : "border-border bg-background hover:border-brand/40")
                        }
                      >
                        {s === "random" ? "Tilfeldig" : "k-Means++"}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={phase === "done"}
                onClick={stepOnce}
                className="rounded-md bg-brand text-brand-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-40"
              >
                Steg ({phase === "assign" ? "ASSIGN" : phase === "update" ? "UPDATE" : phase === "done" ? "ferdig" : "ASSIGN"})
              </button>
              <button
                type="button"
                disabled={phase === "done" || running}
                onClick={() => {
                  if (phase === "idle") {
                    // Klikker run rett etter init — første steg er assign
                  }
                  setRunning(true);
                }}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40 disabled:opacity-40"
              >
                Kjør til konvergens
              </button>
              {running && (
                <button
                  type="button"
                  onClick={() => setRunning(false)}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
                >
                  Pause
                </button>
              )}
              <button
                type="button"
                onClick={() => setSeed((s) => s + 1)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
              >
                Re-init (ny seed)
              </button>
              <button
                type="button"
                onClick={reinit}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === "elbow" && (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Albuemetoden: kjør k-Means for k = 1, 2, …, 10 og plot inertia. Knekken
            antyder optimal k.
          </div>
          <div className="h-64 rounded-lg border border-border bg-background p-2">
            <ResponsiveContainer>
              <LineChart data={elbowData} margin={{ top: 8, right: 10, bottom: 4, left: 0 }}>
                <XAxis
                  dataKey="k"
                  type="number"
                  domain={[1, 10]}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number) => v.toFixed(2)}
                  labelFormatter={(l) => `k = ${l}`}
                />
                <Line
                  type="monotone"
                  dataKey="inertia"
                  stroke="hsl(28 90% 55%)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                {elbowKnee !== null && (
                  <ReferenceDot
                    x={elbowKnee}
                    y={elbowData.find((d) => d.k === elbowKnee)?.inertia ?? 0}
                    r={9}
                    fill="hsl(45 90% 55%)"
                    stroke="black"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-muted-foreground">
            Albu-knekk identifisert ved <strong>k = {elbowKnee}</strong> (heuristikk:
            maks andre-derivat). Med 4 klynger i dataen gir det normalt k=4.
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground leading-relaxed">
        ASSIGN-fase: hvert punkt får farge etter nærmeste centrum. UPDATE-fase:
        hvert centrum flyttes til snittet av sine punkter. Konvergens når ingen
        flytter seg.
      </p>
    </div>
  );
}
