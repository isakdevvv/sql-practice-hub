import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Particle Swarm Optimization (PSO) — interaktiv visualisering.
 *
 * Brukeren ser:
 *  - et 2D-heatmap av en valgt funksjon (Rastrigin / Ackley / "fjell og daler")
 *  - 20–80 partikler som prikker, med en hale som viser velocity-vektor
 *  - per-partikkel pBest (blek prikk) og global gBest (stjerne)
 *  - konvergens-graf (beste fitness over tid) under heatmap
 *
 * Brukeren kan justere:
 *  - inertia weight w  (0 .. 1.5)
 *  - cognitive c1      (0 .. 4)  — trekker mot egen beste posisjon
 *  - social c2         (0 .. 4)  — trekker mot global beste
 *  - antall partikler  (10 .. 80)
 *  - start-spread (start-temperatur) — hvor langt fra sentrum partiklene initieres
 *
 * + play/pause/step/reset/hastighet, og tre presets brukeren skal identifisere.
 */

type FunctionKey = "rastrigin" | "ackley" | "valleys";

// Plot-koordinater (verdens-rom): funksjonene defineres på [-5.12, 5.12]^2.
const W = 520;
const H = 380;
const PAD = 24;
const X_MIN = -5.12;
const X_MAX = 5.12;
const Y_MIN = -5.12;
const Y_MAX = 5.12;
const V_MAX = 4.0; // hard clip på velocity

function sx(x: number) {
  return PAD + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - 2 * PAD);
}
function sy(y: number) {
  return H - PAD - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (H - 2 * PAD);
}

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

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

// --- Funksjoner (alle har globalt minimum ved (0,0) = 0, men ulik landskaps-struktur) ---

function rastrigin(x: number, y: number): number {
  const A = 10;
  return (
    2 * A +
    (x * x - A * Math.cos(2 * Math.PI * x)) +
    (y * y - A * Math.cos(2 * Math.PI * y))
  );
}

function ackley(x: number, y: number): number {
  const a = 20,
    b = 0.2,
    c = 2 * Math.PI;
  const sumSq = x * x + y * y;
  const sumCos = Math.cos(c * x) + Math.cos(c * y);
  return (
    -a * Math.exp(-b * Math.sqrt(0.5 * sumSq)) -
    Math.exp(0.5 * sumCos) +
    a +
    Math.E
  );
}

// Konstruert "fjell og daler" — flere lokale minima, ujevn topografi, smal global dal.
function valleys(x: number, y: number): number {
  const term1 = 0.5 * (x * x + y * y); // svak global skål
  const term2 = -3 * Math.exp(-((x - 1.8) ** 2 + (y - 1.5) ** 2) / 0.7); // dal #1
  const term3 = -2.5 * Math.exp(-((x + 2.2) ** 2 + (y - 1.0) ** 2) / 0.9); // dal #2
  const term4 = -2 * Math.exp(-((x - 0.5) ** 2 + (y + 2.4) ** 2) / 0.6); // dal #3
  const term5 = -4 * Math.exp(-((x - 0.1) ** 2 + (y - 0.1) ** 2) / 0.4); // global (smal)
  return term1 + term2 + term3 + term4 + term5 + 4;
}

function fitnessOf(fn: FunctionKey, x: number, y: number): number {
  if (fn === "rastrigin") return rastrigin(x, y);
  if (fn === "ackley") return ackley(x, y);
  return valleys(x, y);
}

// Cellverdier på et grovt grid, brukt både til heatmap og til min/max-skalering.
function computeGrid(fn: FunctionKey, cells = 60) {
  const grid: number[][] = [];
  let mn = Infinity;
  let mx = -Infinity;
  for (let j = 0; j < cells; j++) {
    const row: number[] = [];
    const fy = Y_MIN + ((j + 0.5) / cells) * (Y_MAX - Y_MIN);
    for (let i = 0; i < cells; i++) {
      const fx = X_MIN + ((i + 0.5) / cells) * (X_MAX - X_MIN);
      const v = fitnessOf(fn, fx, fy);
      row.push(v);
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    grid.push(row);
  }
  return { grid, min: mn, max: mx, cells };
}

// Varm/kald-gradient (kun for heatmap): lav fitness → mørk blå, høy → varm rød.
function heatmapColor(t: number): string {
  const u = clamp(t, 0, 1);
  // Interpoler gjennom blå → cyan → grønn → gul → rød
  const stops = [
    [30, 32, 80], // mørk blå-lilla
    [40, 90, 150], // blå
    [60, 160, 170], // turkis
    [120, 190, 110], // grønn
    [230, 200, 80], // gul
    [220, 90, 60], // rød
  ];
  const seg = u * (stops.length - 1);
  const i = Math.floor(seg);
  const f = seg - i;
  const a = stops[Math.min(i, stops.length - 1)];
  const b = stops[Math.min(i + 1, stops.length - 1)];
  const r = Math.round(a[0] + (b[0] - a[0]) * f);
  const g = Math.round(a[1] + (b[1] - a[1]) * f);
  const bl = Math.round(a[2] + (b[2] - a[2]) * f);
  return `rgb(${r},${g},${bl})`;
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bestX: number;
  bestY: number;
  bestF: number;
};

type Preset = "high-inertia" | "low-c2" | "balanced" | "custom";

const PRESETS: Record<Exclude<Preset, "custom">, { w: number; c1: number; c2: number; label: string; revealText: string }> = {
  "high-inertia": {
    w: 1.4,
    c1: 1.0,
    c2: 1.0,
    label: "Preset A",
    revealText: "Høy inertia (w = 1.4): partiklene har for mye fart og overstyrer trekket mot pBest/gBest. Sverm sprer seg evig og lander aldri.",
  },
  "low-c2": {
    w: 0.7,
    c1: 2.5,
    c2: 0.1,
    label: "Preset B",
    revealText: "Lav social (c2 ≈ 0): hver partikkel følger nesten kun sin egen pBest. Ingen deler info → de setter seg i hvert sitt lokale minimum.",
  },
  balanced: {
    w: 0.7,
    c1: 1.5,
    c2: 1.5,
    label: "Preset C",
    revealText: "Balansert (w ≈ 0.7, c1 ≈ c2 ≈ 1.5): klassisk Shi-Eberhart-anbefaling. Sverm konvergerer raskt mot global beste.",
  },
};

function initSwarm(n: number, spread: number, seed: number): Particle[] {
  const rng = mulberry32(seed);
  const parts: Particle[] = [];
  for (let i = 0; i < n; i++) {
    // Spred ut over [-spread, +spread]^2 (kuttes mot grensa)
    const x = clamp((rng() * 2 - 1) * spread, X_MIN, X_MAX);
    const y = clamp((rng() * 2 - 1) * spread, Y_MIN, Y_MAX);
    const vx = (rng() * 2 - 1) * 0.5;
    const vy = (rng() * 2 - 1) * 0.5;
    parts.push({ x, y, vx, vy, bestX: x, bestY: y, bestF: Infinity });
  }
  return parts;
}

export function PsoSwarmPlot() {
  const [fn, setFn] = useState<FunctionKey>("rastrigin");
  const [w, setW] = useState(0.7);
  const [c1, setC1] = useState(1.5);
  const [c2, setC2] = useState(1.5);
  const [n, setN] = useState(40);
  const [spread, setSpread] = useState(4.5);
  const [speed, setSpeed] = useState(80); // ms per tick (lavere = raskere)
  const [seed, setSeed] = useState(11);
  const [running, setRunning] = useState(false);
  const [iter, setIter] = useState(0);
  const [bestHistory, setBestHistory] = useState<number[]>([]);
  const [preset, setPreset] = useState<Preset>("custom");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  // Beregn heatmap-grid én gang per funksjons-bytte
  const { grid, min: gridMin, max: gridMax, cells } = useMemo(
    () => computeGrid(fn, 60),
    [fn],
  );

  const [swarm, setSwarm] = useState<Particle[]>(() =>
    initSwarm(40, 4.5, 11),
  );
  const [gBest, setGBest] = useState<{ x: number; y: number; f: number }>({
    x: 0,
    y: 0,
    f: Infinity,
  });
  const timer = useRef<number | null>(null);

  // Reset hver gang n/spread/seed/fn endrer seg
  const reinit = useCallback(() => {
    const s = initSwarm(n, spread, seed);
    // Initial evaluering
    let best = { x: 0, y: 0, f: Infinity };
    for (const p of s) {
      const f = fitnessOf(fn, p.x, p.y);
      p.bestF = f;
      p.bestX = p.x;
      p.bestY = p.y;
      if (f < best.f) best = { x: p.x, y: p.y, f };
    }
    setSwarm(s);
    setGBest(best);
    setIter(0);
    setBestHistory([best.f]);
    setRunning(false);
  }, [n, spread, seed, fn]);

  useEffect(() => {
    reinit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, spread, seed, fn]);

  // En tick: oppdater hver partikkel etter standard PSO-ligning
  const step = useCallback(() => {
    setSwarm((prev) => {
      const next: Particle[] = new Array(prev.length);
      let newGBest = { ...gBest };
      for (let i = 0; i < prev.length; i++) {
        const p = prev[i];
        const r1 = Math.random();
        const r2 = Math.random();
        let vx =
          w * p.vx +
          c1 * r1 * (p.bestX - p.x) +
          c2 * r2 * (newGBest.x - p.x);
        let vy =
          w * p.vy +
          c1 * r1 * (p.bestY - p.y) +
          c2 * r2 * (newGBest.y - p.y);
        // Hard clip på velocity for å unngå at de skyter ut av plottet
        vx = clamp(vx, -V_MAX, V_MAX);
        vy = clamp(vy, -V_MAX, V_MAX);
        let x = p.x + vx;
        let y = p.y + vy;
        // Reflekterende grenser
        if (x < X_MIN) {
          x = X_MIN;
          vx = -vx * 0.5;
        }
        if (x > X_MAX) {
          x = X_MAX;
          vx = -vx * 0.5;
        }
        if (y < Y_MIN) {
          y = Y_MIN;
          vy = -vy * 0.5;
        }
        if (y > Y_MAX) {
          y = Y_MAX;
          vy = -vy * 0.5;
        }
        const f = fitnessOf(fn, x, y);
        let bestX = p.bestX;
        let bestY = p.bestY;
        let bestF = p.bestF;
        if (f < bestF) {
          bestX = x;
          bestY = y;
          bestF = f;
        }
        if (f < newGBest.f) {
          newGBest = { x, y, f };
        }
        next[i] = { x, y, vx, vy, bestX, bestY, bestF };
      }
      setGBest(newGBest);
      setBestHistory((h) => {
        const nh = [...h, newGBest.f];
        // Holder historikken til 200 punkter for ytelse
        if (nh.length > 200) nh.shift();
        return nh;
      });
      return next;
    });
    setIter((i) => i + 1);
  }, [w, c1, c2, fn, gBest]);

  // Animasjons-loop
  useEffect(() => {
    if (!running) return;
    timer.current = window.setTimeout(() => {
      step();
    }, speed);
    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [running, step, speed]);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  function applyPreset(key: Exclude<Preset, "custom">) {
    const cfg = PRESETS[key];
    setW(cfg.w);
    setC1(cfg.c1);
    setC2(cfg.c2);
    setPreset(key);
    setSeed((s) => s + 1); // tving reset
    setRevealed(new Set()); // skjul fasit på nytt
  }

  function revealPreset(key: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }

  // Heatmap-celler i SVG (ett rect per cell)
  const cellW = (W - 2 * PAD) / cells;
  const cellH = (H - 2 * PAD) / cells;
  const heatmap = useMemo(() => {
    const out: { x: number; y: number; w: number; h: number; color: string }[] = [];
    const range = Math.max(1e-9, gridMax - gridMin);
    for (let j = 0; j < cells; j++) {
      for (let i = 0; i < cells; i++) {
        const v = grid[j][i];
        const t = (v - gridMin) / range;
        out.push({
          x: PAD + i * cellW,
          y: PAD + (cells - 1 - j) * cellH,
          w: cellW + 0.5,
          h: cellH + 0.5,
          color: heatmapColor(t),
        });
      }
    }
    return out;
  }, [grid, gridMin, gridMax, cells, cellW, cellH]);

  // Contour-linjer: 5 jevnt fordelte iso-verdier (kun visuelt hint)
  const contourValues = useMemo(() => {
    const out: number[] = [];
    for (let k = 1; k <= 5; k++) {
      out.push(gridMin + (k / 6) * (gridMax - gridMin));
    }
    return out;
  }, [gridMin, gridMax]);

  const maxBest = Math.max(...bestHistory, 1);
  const minBest = Math.min(...bestHistory, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          PSO — partikkel-sverm
        </div>
        <div className="text-[11px] text-muted-foreground">
          n = {n} partikler · iter = {iter} · gBest f = {gBest.f === Infinity ? "—" : gBest.f.toFixed(3)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
        {/* PLOT */}
        <div className="rounded-lg border border-border bg-background overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
            {/* heatmap */}
            <g>
              {heatmap.map((c, i) => (
                <rect
                  key={i}
                  x={c.x}
                  y={c.y}
                  width={c.w}
                  height={c.h}
                  fill={c.color}
                />
              ))}
            </g>

            {/* contour-iso-merker (rektangler på cell-grensene som passerer en iso-verdi).
                Forenklet: vi tegner tynne mørke linjer langs celler som er nær iso. */}
            <g opacity={0.45}>
              {contourValues.map((iv, idx) => {
                const lines: JSX.Element[] = [];
                for (let j = 0; j < cells; j++) {
                  for (let i = 0; i < cells - 1; i++) {
                    const a = grid[j][i];
                    const b = grid[j][i + 1];
                    if ((a < iv && b >= iv) || (a >= iv && b < iv)) {
                      lines.push(
                        <rect
                          key={`h-${idx}-${j}-${i}`}
                          x={PAD + (i + 1) * cellW - 0.4}
                          y={PAD + (cells - 1 - j) * cellH}
                          width={0.8}
                          height={cellH}
                          fill="rgba(0,0,0,0.4)"
                        />,
                      );
                    }
                  }
                }
                for (let i = 0; i < cells; i++) {
                  for (let j = 0; j < cells - 1; j++) {
                    const a = grid[j][i];
                    const b = grid[j + 1][i];
                    if ((a < iv && b >= iv) || (a >= iv && b < iv)) {
                      lines.push(
                        <rect
                          key={`v-${idx}-${i}-${j}`}
                          x={PAD + i * cellW}
                          y={PAD + (cells - 1 - j) * cellH - 0.4}
                          width={cellW}
                          height={0.8}
                          fill="rgba(0,0,0,0.4)"
                        />,
                      );
                    }
                  }
                }
                return <g key={idx}>{lines}</g>;
              })}
            </g>

            {/* pBest-markører (blek liten prikk) */}
            {swarm.map((p, i) => (
              <circle
                key={`pb-${i}`}
                cx={sx(p.bestX)}
                cy={sy(p.bestY)}
                r={2}
                fill="white"
                opacity={0.55}
              />
            ))}

            {/* velocity-haler */}
            {swarm.map((p, i) => {
              const tailScale = 6; // visuell skala fra verdens-rom til pikslere
              const x1 = sx(p.x);
              const y1 = sy(p.y);
              const x2 = sx(p.x - p.vx * 0.4);
              const y2 = sy(p.y - p.vy * 0.4);
              return (
                <line
                  key={`v-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="white"
                  strokeWidth={1}
                  opacity={0.6}
                />
              );
            })}

            {/* partikler */}
            {swarm.map((p, i) => (
              <circle
                key={`p-${i}`}
                cx={sx(p.x)}
                cy={sy(p.y)}
                r={3.2}
                fill="white"
                stroke="black"
                strokeWidth={0.6}
              />
            ))}

            {/* gBest = stjerne */}
            {gBest.f !== Infinity && (
              <g>
                <Star
                  cx={sx(gBest.x)}
                  cy={sy(gBest.y)}
                  r={9}
                  fill="hsl(50 100% 60%)"
                  stroke="black"
                  strokeWidth={1}
                />
              </g>
            )}

            {/* akselabels */}
            <text x={W / 2} y={H - 4} fontSize={10} textAnchor="middle" fill="currentColor" opacity={0.7}>
              x
            </text>
            <text
              x={8}
              y={H / 2}
              fontSize={10}
              textAnchor="middle"
              fill="currentColor"
              opacity={0.7}
              transform={`rotate(-90, 8, ${H / 2})`}
            >
              y
            </text>
            {/* Sentrum-markør (0,0) — visuelt anker */}
            <line
              x1={sx(0)}
              y1={sy(0) - 4}
              x2={sx(0)}
              y2={sy(0) + 4}
              stroke="white"
              strokeWidth={0.6}
              opacity={0.4}
            />
            <line
              x1={sx(0) - 4}
              y1={sy(0)}
              x2={sx(0) + 4}
              y2={sy(0)}
              stroke="white"
              strokeWidth={0.6}
              opacity={0.4}
            />
          </svg>
        </div>

        {/* KONTROLLER */}
        <div className="space-y-3 text-sm">
          <div>
            <div className="text-[11px] text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
              Funksjon
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  ["rastrigin", "Rastrigin"],
                  ["ackley", "Ackley"],
                  ["valleys", "Daler"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFn(key)}
                  className={
                    "px-2 py-1 rounded border text-xs " +
                    (fn === key
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-background hover:border-brand/40")
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <SliderRow
            label={`w (inertia) = ${w.toFixed(2)}`}
            value={w}
            min={0}
            max={1.5}
            step={0.05}
            onChange={(v) => {
              setW(v);
              setPreset("custom");
            }}
          />
          <SliderRow
            label={`c1 (cognitive) = ${c1.toFixed(2)}`}
            value={c1}
            min={0}
            max={4}
            step={0.05}
            onChange={(v) => {
              setC1(v);
              setPreset("custom");
            }}
          />
          <SliderRow
            label={`c2 (social) = ${c2.toFixed(2)}`}
            value={c2}
            min={0}
            max={4}
            step={0.05}
            onChange={(v) => {
              setC2(v);
              setPreset("custom");
            }}
          />
          <SliderRow
            label={`partikler = ${n}`}
            value={n}
            min={10}
            max={80}
            step={1}
            onChange={(v) => setN(Math.round(v))}
          />
          <SliderRow
            label={`start-spread = ${spread.toFixed(1)}`}
            value={spread}
            min={0.5}
            max={5}
            step={0.1}
            onChange={(v) => setSpread(v)}
          />
          <SliderRow
            label={`tick-tid = ${speed} ms`}
            value={speed}
            min={20}
            max={500}
            step={10}
            onChange={(v) => setSpeed(Math.round(v))}
          />

          <div className="grid grid-cols-2 gap-1">
            {!running ? (
              <button
                type="button"
                onClick={() => setRunning(true)}
                className="rounded-md bg-brand text-brand-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90"
              >
                Play
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setRunning(false)}
                className="rounded-md bg-brand text-brand-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90"
              >
                Pause
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setRunning(false);
                step();
              }}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
            >
              Step
            </button>
            <button
              type="button"
              onClick={() => setSeed((s) => s + 1)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
            >
              Ny seed
            </button>
            <button
              type="button"
              onClick={reinit}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
            >
              Reset
            </button>
          </div>

          <div className="rounded-md border border-border bg-background px-3 py-2 text-xs">
            <div className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
              gBest
            </div>
            <div className="font-mono">
              x* = ({gBest.x.toFixed(3)}, {gBest.y.toFixed(3)})
            </div>
            <div className="font-mono">
              f(x*) = {gBest.f === Infinity ? "—" : gBest.f.toFixed(4)}
            </div>
            <div className="text-muted-foreground mt-1">
              Globalt min for alle tre funksjoner: f(0, 0) = 0.
            </div>
          </div>
        </div>
      </div>

      {/* KONVERGENS-GRAF */}
      {bestHistory.length > 1 && (
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-[11px] text-muted-foreground mb-2 font-semibold uppercase tracking-wider">
            Beste fitness over tid (lavere = bedre)
          </div>
          <svg viewBox={`0 0 ${W} 90`} className="w-full h-24">
            {bestHistory.map((v, i) => {
              const x = (i / Math.max(1, bestHistory.length - 1)) * (W - 30) + 15;
              const denom = Math.max(1e-9, maxBest - minBest);
              const y = 80 - ((v - minBest) / denom) * 65;
              const next = bestHistory[i + 1];
              if (next === undefined) {
                return <circle key={i} cx={x} cy={y} r={2} fill="hsl(28 90% 55%)" />;
              }
              const nx = ((i + 1) / Math.max(1, bestHistory.length - 1)) * (W - 30) + 15;
              const ny = 80 - ((next - minBest) / denom) * 65;
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
                </g>
              );
            })}
            <text x={15} y={12} fontSize={9} fill="currentColor" opacity={0.65}>
              max f = {maxBest.toFixed(2)}
            </text>
            <text x={15} y={87} fontSize={9} fill="currentColor" opacity={0.65}>
              tick →
            </text>
            <text x={W - 15} y={12} fontSize={9} fill="currentColor" opacity={0.65} textAnchor="end">
              nå: {bestHistory[bestHistory.length - 1].toFixed(3)}
            </text>
          </svg>
        </div>
      )}

      {/* PRESETS — bruker skal gjette hvilken er hvilken */}
      <div className="rounded-md border border-border bg-background p-4">
        <div className="text-[11px] text-muted-foreground mb-2 font-semibold uppercase tracking-wider">
          Gjenkjenn preset — kjør hver og se hvordan svermen oppfører seg
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Tre presets nedenfor er kalt A, B og C. Kjør hver, observer
          konvergens-grafen og bevegelsen, og prøv å koble dem til
          beskrivelsene: <em>«for høy inertia»</em>, <em>«for lav c2»</em>,
          <em> «balansert»</em>. Trykk «Vis fasit» når du har gjettet.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(["high-inertia", "low-c2", "balanced"] as const).map((key) => {
            const cfg = PRESETS[key];
            const isActive = preset === key;
            const isRevealed = revealed.has(key);
            return (
              <div
                key={key}
                className={
                  "rounded-md border p-2 text-xs space-y-1 " +
                  (isActive ? "border-brand bg-brand/5" : "border-border bg-card")
                }
              >
                <div className="font-semibold">{cfg.label}</div>
                <div className="font-mono text-[11px] text-muted-foreground">
                  w={cfg.w} · c1={cfg.c1} · c2={cfg.c2}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => applyPreset(key)}
                    className="flex-1 rounded border border-border bg-background px-2 py-1 text-[11px] hover:border-brand/40"
                  >
                    {isActive ? "Re-kjør" : "Kjør"}
                  </button>
                  <button
                    type="button"
                    onClick={() => revealPreset(key)}
                    className="flex-1 rounded border border-border bg-background px-2 py-1 text-[11px] hover:border-brand/40"
                  >
                    {isRevealed ? "Skjul" : "Fasit"}
                  </button>
                </div>
                {isRevealed && (
                  <div className="rounded bg-muted/40 p-1.5 text-[11px] leading-snug">
                    {cfg.revealText}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        <strong>Hva du ser:</strong> hvert tick beregner{" "}
        <code className="font-mono">v ← w·v + c1·r1·(pBest − x) + c2·r2·(gBest − x)</code>
        {" "}og deretter <code className="font-mono">x ← x + v</code>. Den hvite
        halen er <em>velocity</em>-vektoren (forrige bevegelse). Den blekhvite
        prikken bak hver partikkel er <em>pBest</em> — partikkelens egen
        beste posisjon noensinne. Den gule stjernen er <em>gBest</em>, sværens
        kollektive beste.
      </p>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="text-[11px] text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
        {label}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </label>
  );
}

function Star({
  cx,
  cy,
  r,
  fill,
  stroke,
  strokeWidth,
}: {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const ang = (-Math.PI / 2) + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    pts.push(`${cx + Math.cos(ang) * rr},${cy + Math.sin(ang) * rr}`);
  }
  return (
    <polygon
      points={pts.join(" ")}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
}
