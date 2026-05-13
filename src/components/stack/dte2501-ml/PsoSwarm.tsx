import { useEffect, useMemo, useRef, useState } from "react";

/**
 * PsoSwarm — Particle Swarm Optimization på 2D Rastrigin
 *
 * Pedagogikk:
 *  - Basis: 15 partikler, default-vekter — se flokken finne minimum
 *  - Dypere: skru på w/c1/c2, skift mellom få/mange partikler
 *  - Eksamen: w lav → konvergerer fort men sitter fast lokalt;
 *             c2 høy → flokken klumper seg → tap av eksplorasjon
 */

// Rastrigin in 2D — global min at (0,0) with value 0.
// f(x,y) = 20 + (x² - 10·cos(2πx)) + (y² - 10·cos(2πy))
// Domain: [-5, 5] in each axis.
function rastrigin(x: number, y: number): number {
  return (
    20 +
    (x * x - 10 * Math.cos(2 * Math.PI * x)) +
    (y * y - 10 * Math.cos(2 * Math.PI * y))
  );
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  px: number; // personal best position
  py: number;
  pbest: number; // personal best fitness
};

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function initSwarm(n: number, rand: () => number): Particle[] {
  return Array.from({ length: n }, () => {
    const x = (rand() - 0.5) * 10; // [-5, 5]
    const y = (rand() - 0.5) * 10;
    const f = rastrigin(x, y);
    return {
      x,
      y,
      vx: (rand() - 0.5) * 1.0,
      vy: (rand() - 0.5) * 1.0,
      px: x,
      py: y,
      pbest: f,
    };
  });
}

function step(
  particles: Particle[],
  w: number,
  c1: number,
  c2: number,
  rand: () => number,
): { next: Particle[]; gx: number; gy: number; gbest: number } {
  // find global best
  let gx = particles[0].px;
  let gy = particles[0].py;
  let gbest = particles[0].pbest;
  for (const p of particles) {
    if (p.pbest < gbest) {
      gbest = p.pbest;
      gx = p.px;
      gy = p.py;
    }
  }

  const next: Particle[] = particles.map((p) => {
    const r1 = rand();
    const r2 = rand();
    let vx = w * p.vx + c1 * r1 * (p.px - p.x) + c2 * r2 * (gx - p.x);
    let vy = w * p.vy + c1 * r1 * (p.py - p.y) + c2 * r2 * (gy - p.y);
    // velocity clamp
    vx = Math.max(-2, Math.min(2, vx));
    vy = Math.max(-2, Math.min(2, vy));
    let x = p.x + vx;
    let y = p.y + vy;
    // soft boundary clamp
    x = Math.max(-5.1, Math.min(5.1, x));
    y = Math.max(-5.1, Math.min(5.1, y));
    const f = rastrigin(x, y);
    if (f < p.pbest) {
      return { x, y, vx, vy, px: x, py: y, pbest: f };
    }
    return { x, y, vx, vy, px: p.px, py: p.py, pbest: p.pbest };
  });

  // recompute gbest after update
  let ngx = next[0].px;
  let ngy = next[0].py;
  let ngb = next[0].pbest;
  for (const p of next) {
    if (p.pbest < ngb) {
      ngb = p.pbest;
      ngx = p.px;
      ngy = p.py;
    }
  }
  return { next, gx: ngx, gy: ngy, gbest: ngb };
}

const W = 360;
const H = 280;
const PAD = 20;
// world: [-5, 5] → screen
const sx = (x: number) => PAD + ((x + 5) / 10) * (W - 2 * PAD);
const sy = (y: number) => PAD + ((5 - y) / 10) * (H - 2 * PAD);

// Pre-compute a heatmap as <rect> grid (cached once).
const HEAT_RES = 40;
type Cell = { x: number; y: number; v: number };
const HEAT_CELLS: Cell[] = (() => {
  const cells: Cell[] = [];
  for (let i = 0; i < HEAT_RES; i++) {
    for (let j = 0; j < HEAT_RES; j++) {
      const x = -5 + (i / HEAT_RES) * 10 + 5 / HEAT_RES;
      const y = -5 + (j / HEAT_RES) * 10 + 5 / HEAT_RES;
      cells.push({ x, y, v: rastrigin(x, y) });
    }
  }
  return cells;
})();
const HEAT_MAX = Math.max(...HEAT_CELLS.map((c) => c.v));

function heatColor(v: number): string {
  // Low value (good) → dark, high value (bad) → bright orange-red.
  const t = Math.min(1, v / HEAT_MAX);
  // gradient from dark blue → purple → orange
  const r = Math.round(20 + 200 * t);
  const g = Math.round(20 + 60 * t * (1 - t) * 4);
  const b = Math.round(60 + 100 * (1 - t));
  return `rgb(${r}, ${g}, ${b})`;
}

export function PsoSwarm() {
  const [n, setN] = useState(15);
  const [w, setW] = useState(0.7);
  const [c1, setC1] = useState(1.5);
  const [c2, setC2] = useState(1.5);
  const [seed, setSeed] = useState(7);
  const [iter, setIter] = useState(0);
  const [particles, setParticles] = useState<Particle[]>(() =>
    initSwarm(15, lcg(7)),
  );
  const [running, setRunning] = useState(false);
  const randRef = useRef<() => number>(lcg(7));
  const timerRef = useRef<number | null>(null);

  // Reset whenever n or seed changes
  useEffect(() => {
    randRef.current = lcg(seed);
    setParticles(initSwarm(n, randRef.current));
    setIter(0);
  }, [n, seed]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const gbestInfo = useMemo(() => {
    let gx = particles[0]?.px ?? 0;
    let gy = particles[0]?.py ?? 0;
    let gb = particles[0]?.pbest ?? 0;
    for (const p of particles) {
      if (p.pbest < gb) {
        gb = p.pbest;
        gx = p.px;
        gy = p.py;
      }
    }
    return { gx, gy, gbest: gb };
  }, [particles]);

  const doStep = () => {
    setParticles((cur) => {
      const r = step(cur, w, c1, c2, randRef.current);
      setIter((i) => i + 1);
      return r.next;
    });
  };

  const runAnim = () => {
    if (running) {
      setRunning(false);
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    setRunning(true);
    let count = 0;
    const tick = () => {
      doStep();
      count++;
      if (count < 50) {
        timerRef.current = window.setTimeout(tick, 100);
      } else {
        setRunning(false);
        timerRef.current = null;
      }
    };
    timerRef.current = window.setTimeout(tick, 100);
  };

  const reset = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    setSeed((s) => s + 1);
  };

  const cellW = (W - 2 * PAD) / HEAT_RES;
  const cellH = (H - 2 * PAD) / HEAT_RES;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Slider
            label={`Partikler: ${n}`}
            min={5}
            max={40}
            step={1}
            value={n}
            onChange={setN}
            disabled={running}
          />
          <Slider
            label={`w (treghet): ${w.toFixed(2)}`}
            min={0}
            max={1.2}
            step={0.05}
            value={w}
            onChange={setW}
          />
          <Slider
            label={`c1 (kognitiv): ${c1.toFixed(2)}`}
            min={0}
            max={3}
            step={0.1}
            value={c1}
            onChange={setC1}
          />
          <Slider
            label={`c2 (sosial): ${c2.toFixed(2)}`}
            min={0}
            max={3}
            step={0.1}
            value={c2}
            onChange={setC2}
          />
        </div>
        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={doStep}
              disabled={running}
              className="px-3 py-1.5 text-xs rounded bg-brand text-brand-foreground disabled:opacity-40"
            >
              Steg
            </button>
            <button
              type="button"
              onClick={runAnim}
              className="px-3 py-1.5 text-xs rounded bg-muted hover:bg-muted/80"
            >
              {running ? "Stopp" : "Animer 50 steg"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="px-3 py-1.5 text-xs rounded border border-border text-muted-foreground"
            >
              Reset
            </button>
          </div>
          <div className="text-xs text-muted-foreground">
            Iterasjon <span className="font-mono">{iter}</span>
            <br />
            Beste fitness:{" "}
            <span className="font-mono">{gbestInfo.gbest.toFixed(3)}</span>
            <br />
            Beste posisjon:{" "}
            <span className="font-mono">
              ({gbestInfo.gx.toFixed(2)}, {gbestInfo.gy.toFixed(2)})
            </span>
            <br />
            <span className="text-[10px]">Globalt min = 0 ved (0, 0)</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <svg width={W} height={H} className="block rounded bg-background">
          {/* Heatmap */}
          {HEAT_CELLS.map((c, i) => (
            <rect
              key={i}
              x={sx(c.x) - cellW / 2}
              y={sy(c.y) - cellH / 2}
              width={cellW + 0.5}
              height={cellH + 0.5}
              fill={heatColor(c.v)}
            />
          ))}
          {/* Axes */}
          <line x1={sx(0)} y1={PAD} x2={sx(0)} y2={H - PAD} stroke="#fff" opacity={0.2} />
          <line x1={PAD} y1={sy(0)} x2={W - PAD} y2={sy(0)} stroke="#fff" opacity={0.2} />
          {/* pbest markers (small ring per particle) */}
          {particles.map((p, i) => (
            <circle
              key={`pb${i}`}
              cx={sx(p.px)}
              cy={sy(p.py)}
              r={3}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={1}
              opacity={0.5}
            />
          ))}
          {/* particles */}
          {particles.map((p, i) => (
            <g key={`p${i}`}>
              <circle
                cx={sx(p.x)}
                cy={sy(p.y)}
                r={3.5}
                fill="#60a5fa"
                stroke="#000"
                strokeWidth={0.5}
              />
              {/* tiny velocity arrow */}
              <line
                x1={sx(p.x)}
                y1={sy(p.y)}
                x2={sx(p.x + p.vx * 0.5)}
                y2={sy(p.y + p.vy * 0.5)}
                stroke="#bfdbfe"
                strokeWidth={0.8}
                opacity={0.7}
              />
            </g>
          ))}
          {/* gbest as star */}
          <Star x={sx(gbestInfo.gx)} y={sy(gbestInfo.gy)} />
        </svg>
      </div>

      <div className="text-xs text-muted-foreground flex gap-4 flex-wrap">
        <span>
          <span className="inline-block w-3 h-3 align-middle mr-1 bg-blue-400" />
          partikkel
        </span>
        <span>
          <span className="inline-block w-3 h-3 rounded-full align-middle mr-1 border border-yellow-400" />
          pbest
        </span>
        <span>
          <span className="inline-block w-3 h-3 align-middle mr-1 bg-yellow-300" />
          gbest (flokkens beste)
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Eksperimenter: sett w = 0 → ingen treghet, partiklene stopper opp.
        Sett c2 = 0 → ingen sosial info, hver partikkel søker alene. Sett w ≈ 1.2
        og c2 = 3 → kaotisk svingning rundt gbest.
      </p>
    </div>
  );
}

function Star({ x, y }: { x: number; y: number }) {
  // 5-point star centered at (x, y), radius 8 outer
  const outer = 8;
  const inner = 3.5;
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    pts.push(`${x + r * Math.cos(a)},${y + r * Math.sin(a)}`);
  }
  return (
    <polygon
      points={pts.join(" ")}
      fill="#facc15"
      stroke="#000"
      strokeWidth={0.8}
    />
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  disabled,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </label>
  );
}
