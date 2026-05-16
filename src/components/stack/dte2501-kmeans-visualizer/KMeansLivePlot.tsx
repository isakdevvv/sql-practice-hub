import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * k-Means live-plot.
 *
 * Interaktivt 2D-plot der bruker kan:
 *  - velge k (antall klustre, 2..6)
 *  - velge dataset (Iris-2-features, blobs, moons, custom-klikk)
 *  - animere iterasjoner (centroid-bevegelser + endring i cluster-tilhørighet)
 *  - steppe gjennom én iterasjon ad gangen (ASSIGN / UPDATE)
 *  - se inertia (WCSS) per iterasjon
 */

type Dataset = "iris" | "blobs" | "moons" | "custom";
type Phase = "idle" | "assign" | "update" | "done";

type Pt = { x: number; y: number };
type Centroid = { x: number; y: number };

const W = 520;
const H = 380;
const PAD = 24;
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
function invSx(px: number) {
  return X_MIN + ((px - PAD) / (W - 2 * PAD)) * (X_MAX - X_MIN);
}
function invSy(py: number) {
  return Y_MIN + ((H - PAD - py) / (H - 2 * PAD)) * (Y_MAX - Y_MIN);
}

const COLORS = [
  "hsl(215 80% 55%)",
  "hsl(28 90% 55%)",
  "hsl(150 60% 45%)",
  "hsl(285 60% 60%)",
  "hsl(0 70% 60%)",
  "hsl(195 70% 50%)",
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

function gaussian(rng: () => number, mean = 0, std = 1) {
  const u1 = Math.max(1e-9, rng());
  const u2 = rng();
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
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
      x: clamp(gaussian(rng, c.x, 0.85), 0.1, 9.9),
      y: clamp(gaussian(rng, c.y, 0.85), 0.1, 9.9),
    });
  }
  return pts;
}

function generateMoons(n: number, seed: number): Pt[] {
  const rng = mulberry32(seed);
  const pts: Pt[] = [];
  const half = Math.floor(n / 2);
  // Øvre halvmåne
  for (let i = 0; i < half; i++) {
    const t = (i / Math.max(1, half - 1)) * Math.PI;
    const r = 3.2;
    const cx = 5 - 1.2;
    const cy = 4.2;
    pts.push({
      x: clamp(cx + r * Math.cos(t) + gaussian(rng, 0, 0.22), 0.1, 9.9),
      y: clamp(cy + r * Math.sin(t) + gaussian(rng, 0, 0.22), 0.1, 9.9),
    });
  }
  // Nedre halvmåne (speilet, forskjøvet)
  for (let i = 0; i < n - half; i++) {
    const t = (i / Math.max(1, n - half - 1)) * Math.PI;
    const r = 3.2;
    const cx = 5 + 1.2;
    const cy = 5.8;
    pts.push({
      x: clamp(cx + r * Math.cos(t) + gaussian(rng, 0, 0.22), 0.1, 9.9),
      y: clamp(cy - r * Math.sin(t) + gaussian(rng, 0, 0.22), 0.1, 9.9),
    });
  }
  return pts;
}

/**
 * Forenklet Iris-datasett — 60 punkter, 3 arter, kun to features (petal length og
 * petal width). Hardkodet for å unngå network-fetch. Verdiene er skalert til
 * 0..10 (originale i cm: petal length 1.0..6.9, petal width 0.1..2.5).
 */
function generateIris(): Pt[] {
  // Approksimasjon: 20 setosa (petal length ~1.5, width ~0.2),
  // 20 versicolor (~4.3, ~1.3), 20 virginica (~5.6, ~2.0)
  const raw: Array<[number, number]> = [
    // setosa (petal length, petal width) i cm
    [1.4, 0.2], [1.4, 0.2], [1.3, 0.2], [1.5, 0.2], [1.4, 0.2],
    [1.7, 0.4], [1.4, 0.3], [1.5, 0.2], [1.4, 0.2], [1.5, 0.1],
    [1.5, 0.2], [1.6, 0.2], [1.4, 0.1], [1.1, 0.1], [1.2, 0.2],
    [1.5, 0.4], [1.3, 0.4], [1.4, 0.3], [1.7, 0.3], [1.5, 0.3],
    // versicolor
    [4.7, 1.4], [4.5, 1.5], [4.9, 1.5], [4.0, 1.3], [4.6, 1.5],
    [4.5, 1.3], [4.7, 1.6], [3.3, 1.0], [4.6, 1.3], [3.9, 1.4],
    [3.5, 1.0], [4.2, 1.5], [4.0, 1.0], [4.7, 1.4], [3.6, 1.3],
    [4.4, 1.4], [4.5, 1.5], [4.1, 1.0], [4.5, 1.5], [3.9, 1.1],
    // virginica
    [6.0, 2.5], [5.1, 1.9], [5.9, 2.1], [5.6, 1.8], [5.8, 2.2],
    [6.6, 2.1], [4.5, 1.7], [6.3, 1.8], [5.8, 1.8], [6.1, 2.5],
    [5.1, 2.0], [5.3, 1.9], [5.5, 2.1], [5.0, 2.0], [5.1, 2.4],
    [5.3, 2.3], [5.5, 1.8], [6.7, 2.2], [6.9, 2.3], [5.7, 2.5],
  ];
  // Skalér: petal length 1..7 → 0..10 ; petal width 0..2.5 → 0..10
  return raw.map(([pl, pw]) => ({
    x: clamp(((pl - 1) / 6) * 10, 0.1, 9.9),
    y: clamp((pw / 2.5) * 10, 0.1, 9.9),
  }));
}

function dist2(a: Pt, b: Pt) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function initKMeansPP(pts: Pt[], k: number, seed: number): Centroid[] {
  if (pts.length === 0) return [];
  const rng = mulberry32(seed);
  const cents: Centroid[] = [{ ...pts[Math.floor(rng() * pts.length)] }];
  while (cents.length < k && cents.length < pts.length) {
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
  // Pad hvis k > pts.length
  while (cents.length < k) {
    cents.push({ x: 5 + Math.random() * 0.5, y: 5 + Math.random() * 0.5 });
  }
  return cents;
}

function assignLabels(pts: Pt[], cents: Centroid[]): number[] {
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

function updateCentroids(
  pts: Pt[],
  labels: number[],
  k: number,
  prev: Centroid[],
): Centroid[] {
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
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    s += dist2(pts[i], cents[labels[i]]);
  }
  return s;
}

export function KMeansLivePlot() {
  const [dataset, setDataset] = useState<Dataset>("blobs");
  const [k, setK] = useState(3);
  const [seed, setSeed] = useState(7);
  const [customPts, setCustomPts] = useState<Pt[]>([]);

  // Generer datasett
  const pts = useMemo(() => {
    if (dataset === "iris") return generateIris();
    if (dataset === "blobs") return generateBlobs(80, seed);
    if (dataset === "moons") return generateMoons(80, seed);
    return customPts;
  }, [dataset, seed, customPts]);

  const [cents, setCents] = useState<Centroid[]>([]);
  const [labels, setLabels] = useState<number[]>([]);
  const [prevCents, setPrevCents] = useState<Centroid[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [iter, setIter] = useState(0);
  const [running, setRunning] = useState(false);
  const [inertiaHistory, setInertiaHistory] = useState<number[]>([]);
  const [changedCount, setChangedCount] = useState(0);
  const timer = useRef<number | null>(null);

  const reinit = useCallback(() => {
    if (pts.length === 0) {
      setCents([]);
      setLabels([]);
      setPrevCents([]);
      setPhase("idle");
      setIter(0);
      setRunning(false);
      setInertiaHistory([]);
      setChangedCount(0);
      return;
    }
    const c = initKMeansPP(pts, Math.min(k, Math.max(1, pts.length)), seed);
    setCents(c);
    setPrevCents(c);
    const l = assignLabels(pts, c);
    setLabels(l);
    setPhase("update");
    setIter(0);
    setRunning(false);
    setInertiaHistory([inertia(pts, c, l)]);
    setChangedCount(0);
  }, [pts, k, seed]);

  useEffect(() => {
    reinit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset, k, seed, customPts]);

  const doAssign = useCallback(() => {
    const newLabels = assignLabels(pts, cents);
    let changed = 0;
    for (let i = 0; i < newLabels.length; i++) {
      if (newLabels[i] !== labels[i]) changed++;
    }
    setChangedCount(changed);
    setLabels(newLabels);
    setInertiaHistory((h) => [...h, inertia(pts, cents, newLabels)]);
    setPhase("update");
  }, [pts, cents, labels]);

  const doUpdate = useCallback(() => {
    setPrevCents(cents);
    const newCents = updateCentroids(pts, labels, cents.length, cents);
    const moved = newCents.some(
      (c, j) => Math.abs(c.x - cents[j].x) + Math.abs(c.y - cents[j].y) > 1e-4,
    );
    setCents(newCents);
    setIter((i) => i + 1);
    setInertiaHistory((h) => [...h, inertia(pts, newCents, labels)]);
    setPhase(moved ? "assign" : "done");
  }, [pts, labels, cents]);

  const stepOnce = useCallback(() => {
    if (phase === "done") return;
    if (phase === "assign" || phase === "idle") doAssign();
    else if (phase === "update") doUpdate();
  }, [phase, doAssign, doUpdate]);

  // Animasjons-loop
  useEffect(() => {
    if (!running) return;
    if (phase === "done") {
      setRunning(false);
      return;
    }
    timer.current = window.setTimeout(() => {
      stepOnce();
    }, 600);
    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [running, phase, stepOnce]);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  function onPlotClick(e: React.MouseEvent<SVGSVGElement>) {
    if (dataset !== "custom") return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    const x = clamp(invSx(px), 0.1, 9.9);
    const y = clamp(invSy(py), 0.1, 9.9);
    setCustomPts((arr) => [...arr, { x, y }]);
  }

  const currentInertia =
    inertiaHistory.length > 0 ? inertiaHistory[inertiaHistory.length - 1] : 0;
  const maxInertia = Math.max(1, ...inertiaHistory);

  const phaseLabel =
    phase === "done"
      ? "konvergert"
      : phase === "assign"
        ? "neste: ASSIGN (farge punkter)"
        : phase === "update"
          ? "neste: UPDATE (flytt sentre)"
          : "klar";

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          k-Means live-plot
        </div>
        <div className="text-[11px] text-muted-foreground">
          n = {pts.length} punkter · k = {k} · iter = {iter}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
        {/* PLOT */}
        <div className="rounded-lg border border-border bg-background overflow-hidden">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto select-none"
            onClick={onPlotClick}
            style={{ cursor: dataset === "custom" ? "crosshair" : "default" }}
          >
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

            {/* akselabels */}
            <text x={W / 2} y={H - 4} fontSize={10} textAnchor="middle" fill="currentColor" opacity={0.55}>
              {dataset === "iris" ? "petal length (skalert 0..10)" : "x"}
            </text>
            <text
              x={8}
              y={H / 2}
              fontSize={10}
              textAnchor="middle"
              fill="currentColor"
              opacity={0.55}
              transform={`rotate(-90, 8, ${H / 2})`}
            >
              {dataset === "iris" ? "petal width (skalert 0..10)" : "y"}
            </text>

            {/* linjer fra punkt til centroid (assigment-visualisering) */}
            {phase !== "idle" &&
              pts.map((p, i) => {
                const c = cents[labels[i]];
                if (!c) return null;
                return (
                  <line
                    key={`l-${i}`}
                    x1={sx(p.x)}
                    y1={sy(p.y)}
                    x2={sx(c.x)}
                    y2={sy(c.y)}
                    stroke={COLORS[labels[i] % COLORS.length]}
                    strokeWidth={0.6}
                    opacity={0.18}
                  />
                );
              })}

            {/* punkter */}
            {pts.map((p, i) => {
              const lbl = labels[i] ?? 0;
              const color =
                phase === "idle" || labels.length === 0
                  ? "hsl(220 10% 60%)"
                  : COLORS[lbl % COLORS.length];
              return (
                <circle
                  key={i}
                  cx={sx(p.x)}
                  cy={sy(p.y)}
                  r={4}
                  fill={color}
                  opacity={0.88}
                />
              );
            })}

            {/* tidligere centroid-posisjoner (spor) */}
            {prevCents.map((c, j) => (
              <circle
                key={`prev-${j}`}
                cx={sx(c.x)}
                cy={sy(c.y)}
                r={6}
                fill="none"
                stroke={COLORS[j % COLORS.length]}
                strokeWidth={1}
                strokeDasharray="2 2"
                opacity={0.55}
              />
            ))}

            {/* bevegelses-piler */}
            {prevCents.map((c, j) => {
              const n = cents[j];
              if (!n) return null;
              const dx = n.x - c.x;
              const dy = n.y - c.y;
              if (dx * dx + dy * dy < 1e-3) return null;
              return (
                <line
                  key={`arr-${j}`}
                  x1={sx(c.x)}
                  y1={sy(c.y)}
                  x2={sx(n.x)}
                  y2={sy(n.y)}
                  stroke={COLORS[j % COLORS.length]}
                  strokeWidth={1.5}
                  opacity={0.7}
                />
              );
            })}

            {/* centroider */}
            {cents.map((c, j) => (
              <g key={`c-${j}`}>
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

            {dataset === "custom" && pts.length === 0 && (
              <text
                x={W / 2}
                y={H / 2}
                fontSize={14}
                textAnchor="middle"
                fill="currentColor"
                opacity={0.4}
              >
                Klikk i plottet for å lage egne punkter
              </text>
            )}
          </svg>
        </div>

        {/* KONTROLLER */}
        <div className="space-y-3">
          <div>
            <div className="text-[11px] text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
              Dataset
            </div>
            <div className="grid grid-cols-2 gap-1">
              {(
                [
                  ["iris", "Iris (2 f.)"],
                  ["blobs", "Blobs"],
                  ["moons", "Moons"],
                  ["custom", "Klikk selv"],
                ] as const
              ).map(([d, label]) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDataset(d);
                    if (d === "custom") setCustomPts([]);
                  }}
                  className={
                    "px-2 py-1 rounded border text-xs " +
                    (dataset === d
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-background hover:border-brand/40")
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <label className="block text-sm">
            <div className="text-[11px] text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
              k = {k}
            </div>
            <input
              type="range"
              min={2}
              max={6}
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              className="w-full"
            />
          </label>

          <div className="rounded-md border border-border bg-background px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Tilstand
            </div>
            <div className="text-xs font-mono">
              <span
                className={
                  phase === "done"
                    ? "text-emerald-600 font-semibold"
                    : "text-brand"
                }
              >
                {phaseLabel}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Inertia J = {currentInertia.toFixed(2)}
            </div>
            {phase === "update" && iter > 0 && (
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {changedCount} punkter byttet klustre
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={phase === "done" || pts.length === 0}
              onClick={stepOnce}
              className="rounded-md bg-brand text-brand-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-40"
            >
              Steg ({phase === "assign" ? "ASSIGN" : phase === "update" ? "UPDATE" : phase === "done" ? "ferdig" : "ASSIGN"})
            </button>
            <button
              type="button"
              disabled={phase === "done" || running || pts.length === 0}
              onClick={() => setRunning(true)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40 disabled:opacity-40"
            >
              Animer til konvergens
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
            {dataset === "custom" && customPts.length > 0 && (
              <button
                type="button"
                onClick={() => setCustomPts([])}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:border-brand/40"
              >
                Tøm punkter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* INERTIA HISTORIKK */}
      {inertiaHistory.length > 1 && (
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-[11px] text-muted-foreground mb-2 font-semibold uppercase tracking-wider">
            Inertia (WCSS) per steg — synker monotont
          </div>
          <svg viewBox={`0 0 ${W} 80`} className="w-full h-20">
            {inertiaHistory.map((v, i) => {
              const x = (i / Math.max(1, inertiaHistory.length - 1)) * (W - 30) + 15;
              const y = 70 - (v / maxInertia) * 55;
              const next = inertiaHistory[i + 1];
              if (next === undefined) {
                return (
                  <circle key={i} cx={x} cy={y} r={3} fill="hsl(28 90% 55%)" />
                );
              }
              const nx = ((i + 1) / Math.max(1, inertiaHistory.length - 1)) * (W - 30) + 15;
              const ny = 70 - (next / maxInertia) * 55;
              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1={y}
                    x2={nx}
                    y2={ny}
                    stroke="hsl(28 90% 55%)"
                    strokeWidth={1.5}
                  />
                  <circle cx={x} cy={y} r={3} fill="hsl(28 90% 55%)" />
                </g>
              );
            })}
            <text x={15} y={12} fontSize={9} fill="currentColor" opacity={0.55}>
              J_max = {maxInertia.toFixed(1)}
            </text>
            <text x={15} y={78} fontSize={9} fill="currentColor" opacity={0.55}>
              steg →
            </text>
          </svg>
        </div>
      )}

      <p className="text-xs text-muted-foreground leading-relaxed">
        <strong>Sentralt:</strong> hvert ASSIGN-steg minker inertia (eller står
        stille) — punktene rykker til nærmeste sentrum. Hvert UPDATE-steg minker
        også inertia — sentrene flyttes til snittet, som per definisjon
        minimerer kvadrert avstand. Konvergens når ingen sentre flytter seg.
      </p>
    </div>
  );
}
