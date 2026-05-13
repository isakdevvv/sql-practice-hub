import { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/**
 * AcoTsp — Ant Colony Optimization på en liten TSP-instans
 *
 * Pedagogikk:
 *  - Basis: send én maur, se hvordan ruten velges probabilistisk
 *  - Dypere: kjør 20 iterasjoner, se feromonsporene forsterkes og fordampe
 *  - Eksamen: gjenkjenne ρ (fordamping), α (feromon-vekt), β (heuristikk-vekt)
 */

const NUM_CITIES = 8;
const W = 360;
const H = 280;
const PAD = 30;

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function makeCities(seed: number): { x: number; y: number }[] {
  const r = lcg(seed);
  return Array.from({ length: NUM_CITIES }, () => ({
    x: r() * 0.8 + 0.1,
    y: r() * 0.8 + 0.1,
  }));
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function tourLength(tour: number[], distMat: number[][]): number {
  let s = 0;
  for (let i = 0; i < tour.length; i++) {
    s += distMat[tour[i]][tour[(i + 1) % tour.length]];
  }
  return s;
}

function buildTour(
  start: number,
  pheromone: number[][],
  distMat: number[][],
  alpha: number,
  beta: number,
  rand: () => number,
): number[] {
  const n = pheromone.length;
  const tour = [start];
  const visited = new Set<number>([start]);
  while (tour.length < n) {
    const cur = tour[tour.length - 1];
    const weights: { city: number; w: number }[] = [];
    let total = 0;
    for (let j = 0; j < n; j++) {
      if (visited.has(j)) continue;
      const tau = Math.pow(pheromone[cur][j], alpha);
      const eta = Math.pow(1 / Math.max(0.001, distMat[cur][j]), beta);
      const w = tau * eta;
      weights.push({ city: j, w });
      total += w;
    }
    if (total === 0) {
      // fallback uniform
      const candidates = weights;
      const pick = candidates[Math.floor(rand() * candidates.length)].city;
      tour.push(pick);
      visited.add(pick);
      continue;
    }
    let r = rand() * total;
    let chosen = weights[0].city;
    for (const cand of weights) {
      r -= cand.w;
      if (r <= 0) {
        chosen = cand.city;
        break;
      }
    }
    tour.push(chosen);
    visited.add(chosen);
  }
  return tour;
}

function iterateColony(
  pheromone: number[][],
  distMat: number[][],
  cities: { x: number; y: number }[],
  alpha: number,
  beta: number,
  rho: number,
  numAnts: number,
  rand: () => number,
): { next: number[][]; bestTour: number[]; bestLen: number } {
  const n = cities.length;
  const tours: { tour: number[]; len: number }[] = [];
  for (let k = 0; k < numAnts; k++) {
    const start = Math.floor(rand() * n);
    const tour = buildTour(start, pheromone, distMat, alpha, beta, rand);
    tours.push({ tour, len: tourLength(tour, distMat) });
  }
  // Evaporation
  const next: number[][] = pheromone.map((row) => row.map((p) => (1 - rho) * p));
  // Deposit
  for (const { tour, len } of tours) {
    const dep = 1 / len;
    for (let i = 0; i < tour.length; i++) {
      const a = tour[i];
      const b = tour[(i + 1) % tour.length];
      next[a][b] += dep;
      next[b][a] += dep;
    }
  }
  // Floor at small value
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (next[i][j] < 0.01) next[i][j] = 0.01;
    }
  }
  let best = tours[0];
  for (const t of tours) if (t.len < best.len) best = t;
  return { next, bestTour: best.tour, bestLen: best.len };
}

export function AcoTsp() {
  const [seed, setSeed] = useState(11);
  const [rho, setRho] = useState(0.2);
  const [alpha, setAlpha] = useState(1);
  const [beta, setBeta] = useState(3);
  const [numAnts, setNumAnts] = useState(8);
  const [iter, setIter] = useState(0);
  const [running, setRunning] = useState(false);
  const [demoTour, setDemoTour] = useState<number[] | null>(null);
  const [history, setHistory] = useState<{ iter: number; best: number }[]>([]);
  const [bestTour, setBestTour] = useState<number[] | null>(null);
  const [bestLen, setBestLen] = useState<number>(Infinity);

  const cities = useMemo(() => makeCities(seed), [seed]);
  const distMat = useMemo(() => {
    const n = cities.length;
    const m = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) m[i][j] = dist(cities[i], cities[j]);
    }
    return m;
  }, [cities]);

  const [pheromone, setPheromone] = useState<number[][]>(() => {
    const n = NUM_CITIES;
    return Array.from({ length: n }, () => new Array(n).fill(1));
  });

  const randRef = useRef<() => number>(lcg(99));
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset state when seed changes
    const n = cities.length;
    setPheromone(
      Array.from({ length: n }, () => new Array(n).fill(1)),
    );
    setIter(0);
    setHistory([]);
    setBestTour(null);
    setBestLen(Infinity);
    setDemoTour(null);
    randRef.current = lcg(seed + 99);
  }, [seed, cities.length]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const sendOneAnt = () => {
    const start = Math.floor(randRef.current() * cities.length);
    const tour = buildTour(start, pheromone, distMat, alpha, beta, randRef.current);
    setDemoTour(tour);
  };

  const doIteration = () => {
    setPheromone((cur) => {
      const r = iterateColony(
        cur,
        distMat,
        cities,
        alpha,
        beta,
        rho,
        numAnts,
        randRef.current,
      );
      setIter((i) => i + 1);
      setHistory((h) => [...h, { iter: h.length + 1, best: r.bestLen }]);
      setBestTour((curBest) => {
        if (!curBest || r.bestLen < bestLen) {
          setBestLen(r.bestLen);
          return r.bestTour;
        }
        return curBest;
      });
      setDemoTour(null);
      return r.next;
    });
  };

  const runMany = () => {
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
      doIteration();
      count++;
      if (count < 20) {
        timerRef.current = window.setTimeout(tick, 200);
      } else {
        setRunning(false);
        timerRef.current = null;
      }
    };
    timerRef.current = window.setTimeout(tick, 200);
  };

  const reset = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    setSeed((s) => s + 1);
  };

  // Find max pheromone for width scaling
  let maxPher = 0.01;
  for (let i = 0; i < cities.length; i++) {
    for (let j = i + 1; j < cities.length; j++) {
      if (pheromone[i][j] > maxPher) maxPher = pheromone[i][j];
    }
  }

  const sx = (x: number) => PAD + x * (W - 2 * PAD);
  const sy = (y: number) => PAD + y * (H - 2 * PAD);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Slider
            label={`α (feromon-vekt): ${alpha.toFixed(1)}`}
            min={0}
            max={3}
            step={0.1}
            value={alpha}
            onChange={setAlpha}
          />
          <Slider
            label={`β (distanse-vekt): ${beta.toFixed(1)}`}
            min={0}
            max={6}
            step={0.1}
            value={beta}
            onChange={setBeta}
          />
          <Slider
            label={`ρ (fordampingsrate): ${rho.toFixed(2)}`}
            min={0}
            max={0.8}
            step={0.05}
            value={rho}
            onChange={setRho}
          />
          <Slider
            label={`Maur per iterasjon: ${numAnts}`}
            min={1}
            max={20}
            step={1}
            value={numAnts}
            onChange={setNumAnts}
            disabled={running}
          />
        </div>
        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={sendOneAnt}
              disabled={running}
              className="px-3 py-1.5 text-xs rounded bg-brand text-brand-foreground disabled:opacity-40"
            >
              Send 1 maur (uten oppdatering)
            </button>
            <button
              type="button"
              onClick={doIteration}
              disabled={running}
              className="px-3 py-1.5 text-xs rounded bg-muted hover:bg-muted/80 disabled:opacity-40"
            >
              Én iterasjon
            </button>
            <button
              type="button"
              onClick={runMany}
              className="px-3 py-1.5 text-xs rounded bg-muted hover:bg-muted/80"
            >
              {running ? "Stopp" : "Kjør 20 iter."}
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
            Iterasjon: <span className="font-mono">{iter}</span>
            <br />
            Beste tour-lengde:{" "}
            <span className="font-mono">
              {bestLen === Infinity ? "—" : bestLen.toFixed(3)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <svg width={W} height={H} className="block bg-background rounded">
          {/* Pheromone trails — drawn first, beneath everything */}
          {cities.map((_, i) =>
            cities.map((_, j) => {
              if (j <= i) return null;
              const p = pheromone[i][j];
              const t = p / maxPher;
              const width = Math.max(0.3, t * 4);
              const opacity = 0.15 + t * 0.65;
              return (
                <line
                  key={`ph${i}-${j}`}
                  x1={sx(cities[i].x)}
                  y1={sy(cities[i].y)}
                  x2={sx(cities[j].x)}
                  y2={sy(cities[j].y)}
                  stroke="#3b82f6"
                  strokeWidth={width}
                  opacity={opacity}
                />
              );
            }),
          )}
          {/* Best tour overlay */}
          {bestTour && (
            <path
              d={bestTour
                .map(
                  (c, i) =>
                    `${i === 0 ? "M" : "L"} ${sx(cities[c].x)} ${sy(cities[c].y)}`,
                )
                .concat(
                  `L ${sx(cities[bestTour[0]].x)} ${sy(cities[bestTour[0]].y)}`,
                )
                .join(" ")}
              fill="none"
              stroke="#22c55e"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              opacity={0.75}
            />
          )}
          {/* Demo single-ant tour */}
          {demoTour && (
            <path
              d={demoTour
                .map(
                  (c, i) =>
                    `${i === 0 ? "M" : "L"} ${sx(cities[c].x)} ${sy(cities[c].y)}`,
                )
                .concat(
                  `L ${sx(cities[demoTour[0]].x)} ${sy(cities[demoTour[0]].y)}`,
                )
                .join(" ")}
              fill="none"
              stroke="#facc15"
              strokeWidth={2}
              opacity={0.9}
            />
          )}
          {/* Cities */}
          {cities.map((c, i) => (
            <g key={`c${i}`}>
              <circle
                cx={sx(c.x)}
                cy={sy(c.y)}
                r={7}
                fill="#1f2937"
                stroke="#e5e7eb"
                strokeWidth={1.5}
              />
              <text
                x={sx(c.x)}
                y={sy(c.y) + 3}
                textAnchor="middle"
                fontSize={10}
                fill="#e5e7eb"
              >
                {i}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="text-xs text-muted-foreground flex gap-4 flex-wrap">
        <span>
          <span className="inline-block w-3 h-1 align-middle mr-1 bg-blue-500" />
          feromon (tykkere = mer)
        </span>
        <span>
          <span className="inline-block w-3 h-1 align-middle mr-1 bg-yellow-400" />
          aktiv maur-rute
        </span>
        <span>
          <span className="inline-block w-3 h-1 align-middle mr-1 bg-emerald-500" />
          beste rute så langt
        </span>
      </div>

      {history.length > 0 && (
        <div>
          <div className="text-xs font-semibold mb-1">
            Beste tour-lengde per iterasjon
          </div>
          <div style={{ width: "100%", height: 140 }}>
            <ResponsiveContainer>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="iter" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{ fontSize: 11 }}
                  labelFormatter={(g) => `Iter ${g}`}
                />
                <Line
                  type="monotone"
                  dataKey="best"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Sett β = 0 → maurene ignorerer distanse, bare feromonen styrer.
        Sett ρ = 0 → ingen fordamping, gamle ruter sitter for alltid og blokkerer ny eksplorasjon.
      </p>
    </div>
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
