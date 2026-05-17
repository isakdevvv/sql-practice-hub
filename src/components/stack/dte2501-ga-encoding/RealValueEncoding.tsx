import { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

/**
 * RealValueEncoding — minimere f(x, y) = (x-2)^2 + (y+1)^2 + sin(3x) + cos(3y)
 *
 * Kromosom = [x, y] som flyttall i [-5, 5].
 * Crossover = aritmetisk blanding: child = alpha*A + (1-alpha)*B (alpha tilfeldig)
 * Mutation = legg til gaussisk støy ~ N(0, sigma)
 *
 * Visualisering: heatmap av f(x,y), populasjon som prikker, parent + barn highlighted.
 *
 * Pedagogisk poeng: real-value crossover GIR alltid gyldige løsninger fordi
 * konvex kombinasjon av to punkter i et boks-domene er fortsatt i boksen.
 * Det er en HELT annen crossover-mekanikk enn bit-flip på binær.
 */

const POP = 8;
const X_MIN = -5, X_MAX = 5;
const Y_MIN = -5, Y_MAX = 5;
const SIGMA = 0.4;

function f(x: number, y: number): number {
  return (x - 2) ** 2 + (y + 1) ** 2 + Math.sin(3 * x) + Math.cos(3 * y);
}

type Ind = { x: number; y: number; fitness: number; flash?: "parentA" | "parentB" | "child-cross" | "child-mut" | null };

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// Box-Muller for normal-distribution
function gauss(rand: () => number): number {
  const u1 = Math.max(rand(), 1e-9);
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function randInd(rand: () => number): Ind {
  const x = X_MIN + rand() * (X_MAX - X_MIN);
  const y = Y_MIN + rand() * (Y_MAX - Y_MIN);
  return { x, y, fitness: f(x, y) };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// Precompute heatmap data once.
const GRID = 60;
function buildHeatmap(): { z: number[][]; min: number; max: number } {
  const z: number[][] = [];
  let mn = Infinity, mx = -Infinity;
  for (let j = 0; j < GRID; j++) {
    const row: number[] = [];
    for (let i = 0; i < GRID; i++) {
      const x = X_MIN + (i / (GRID - 1)) * (X_MAX - X_MIN);
      const y = Y_MIN + (j / (GRID - 1)) * (Y_MAX - Y_MIN);
      const v = f(x, y);
      row.push(v);
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    z.push(row);
  }
  return { z, min: mn, max: mx };
}

export function RealValueEncoding() {
  const [seed, setSeed] = useState(3);
  const [pop, setPop] = useState<Ind[]>(() => {
    const r = lcg(3);
    return Array.from({ length: POP }, () => randInd(r));
  });
  const [gen, setGen] = useState(0);
  const [history, setHistory] = useState<{ gen: number; best: number }[]>([]);
  const [parentA, setParentA] = useState(0);
  const [parentB, setParentB] = useState(1);
  const [child, setChild] = useState<Ind | null>(null);
  const [running, setRunning] = useState(false);
  const randRef = useRef(lcg(3));
  const timerRef = useRef<number | null>(null);
  const heatmap = useMemo(() => buildHeatmap(), []);

  useEffect(() => {
    randRef.current = lcg(seed);
    const initial = Array.from({ length: POP }, () => randInd(randRef.current));
    setPop(initial);
    setGen(0);
    setChild(null);
    setHistory([{ gen: 0, best: Math.min(...initial.map((i) => i.fitness)) }]);
  }, [seed]);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const doCrossover = () => {
    const a = pop[parentA];
    const b = pop[parentB];
    const alpha = randRef.current();
    const cx = alpha * a.x + (1 - alpha) * b.x;
    const cy = alpha * a.y + (1 - alpha) * b.y;
    setChild({ x: cx, y: cy, fitness: f(cx, cy), flash: "child-cross" });
  };

  const doMutate = () => {
    if (!child) return;
    const dx = gauss(randRef.current) * SIGMA;
    const dy = gauss(randRef.current) * SIGMA;
    const nx = clamp(child.x + dx, X_MIN, X_MAX);
    const ny = clamp(child.y + dy, Y_MIN, Y_MAX);
    setChild({ x: nx, y: ny, fitness: f(nx, ny), flash: "child-mut" });
  };

  const evolveOnce = () => {
    // sort: lowest fitness = best (we minimize)
    const sorted = [...pop].sort((a, b) => a.fitness - b.fitness);
    const next: Ind[] = [sorted[0], sorted[1]]; // elitism
    while (next.length < POP) {
      // tournament
      const t = () => {
        const a = pop[Math.floor(randRef.current() * POP)];
        const b = pop[Math.floor(randRef.current() * POP)];
        return a.fitness < b.fitness ? a : b;
      };
      const a = t(), b = t();
      const alpha = randRef.current();
      let cx = alpha * a.x + (1 - alpha) * b.x;
      let cy = alpha * a.y + (1 - alpha) * b.y;
      // mutation
      if (randRef.current() < 0.4) cx += gauss(randRef.current) * SIGMA;
      if (randRef.current() < 0.4) cy += gauss(randRef.current) * SIGMA;
      cx = clamp(cx, X_MIN, X_MAX);
      cy = clamp(cy, Y_MIN, Y_MAX);
      next.push({ x: cx, y: cy, fitness: f(cx, cy) });
    }
    setPop(next);
    setGen((g) => g + 1);
    const best = Math.min(...next.map((i) => i.fitness));
    setHistory((h) => [...h.slice(-100), { gen: gen + 1, best }]);
  };

  const runMany = () => {
    if (running) {
      setRunning(false);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
      return;
    }
    setRunning(true);
    let count = 0;
    const tick = () => {
      evolveOnce();
      count += 1;
      if (count < 30) timerRef.current = window.setTimeout(tick, 90);
      else {
        setRunning(false);
        timerRef.current = null;
      }
    };
    timerRef.current = window.setTimeout(tick, 90);
  };

  const sorted = useMemo(() => [...pop].sort((a, b) => a.fitness - b.fitness), [pop]);
  const best = sorted[0];

  // Render SVG heatmap
  const cell = 8;
  const W = GRID * cell;
  const H = GRID * cell;
  const toPx = (x: number, y: number) => {
    const px = ((x - X_MIN) / (X_MAX - X_MIN)) * W;
    const py = H - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * H;
    return { px, py };
  };

  const color = (v: number) => {
    const t = (v - heatmap.min) / (heatmap.max - heatmap.min);
    // Blue (low/good) → red (high/bad)
    const h = (1 - t) * 240; // 240=blue, 0=red
    return `hsl(${h}, 70%, 35%)`;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/5 p-3 text-sm">
        <strong>Real-value encoding — kontinuerlig optimering.</strong> Kromosom ={" "}
        <code className="font-mono">[x, y]</code> som flyttall.{" "}
        <strong>Crossover</strong> = aritmetisk blanding{" "}
        <code className="font-mono">α·A + (1−α)·B</code>.{" "}
        <strong>Mutation</strong> = gaussisk støy{" "}
        <code className="font-mono">~ N(0, {SIGMA})</code>.
        Vi minimerer <code className="font-mono">f(x,y) = (x−2)² + (y+1)² + sin(3x) + cos(3y)</code>.
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-xs font-semibold mb-2">Heatmap (blå = lavt/godt, rød = høyt/dårlig)</div>
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto border border-border rounded">
              {heatmap.z.map((row, j) =>
                row.map((v, i) => (
                  <rect key={`${i}-${j}`} x={i * cell} y={H - (j + 1) * cell} width={cell} height={cell} fill={color(v)} />
                )),
              )}
              {/* Population */}
              {pop.map((ind, i) => {
                const { px, py } = toPx(ind.x, ind.y);
                return <circle key={`p-${i}`} cx={px} cy={py} r={5} fill="white" stroke="black" strokeWidth={1.5} />;
              })}
              {/* Parents highlighted */}
              {[parentA, parentB].map((idx, k) => {
                const { px, py } = toPx(pop[idx].x, pop[idx].y);
                return <circle key={`pa-${k}`} cx={px} cy={py} r={9} fill="none" stroke={k === 0 ? "#3b82f6" : "#a855f7"} strokeWidth={2.5} />;
              })}
              {/* Child */}
              {child && (() => {
                const { px, py } = toPx(child.x, child.y);
                return (
                  <>
                    <circle cx={px} cy={py} r={7} fill="#22c55e" stroke="black" strokeWidth={1.5}>
                      <animate attributeName="r" values="7;11;7" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                    {/* Line from each parent to child to show crossover blending */}
                    {child.flash === "child-cross" && (
                      <>
                        <line x1={toPx(pop[parentA].x, pop[parentA].y).px} y1={toPx(pop[parentA].x, pop[parentA].y).py} x2={px} y2={py} stroke="#3b82f6" strokeDasharray="3 3" strokeWidth={1.5} />
                        <line x1={toPx(pop[parentB].x, pop[parentB].y).px} y1={toPx(pop[parentB].x, pop[parentB].y).py} x2={px} y2={py} stroke="#a855f7" strokeDasharray="3 3" strokeWidth={1.5} />
                      </>
                    )}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="text-xs font-semibold mb-2">Manuell crossover + mutation</div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <ParentPick label="A (blå)" value={parentA} onChange={setParentA} pop={pop} />
              <ParentPick label="B (lilla)" value={parentB} onChange={setParentB} pop={pop} />
            </div>
            <div className="text-xs font-mono space-y-1">
              <div>A = ({pop[parentA].x.toFixed(2)}, {pop[parentA].y.toFixed(2)}) → f = {pop[parentA].fitness.toFixed(2)}</div>
              <div>B = ({pop[parentB].x.toFixed(2)}, {pop[parentB].y.toFixed(2)}) → f = {pop[parentB].fitness.toFixed(2)}</div>
              {child && (
                <div className="text-emerald-400">
                  Barn = ({child.x.toFixed(2)}, {child.y.toFixed(2)}) → f = {child.fitness.toFixed(2)}
                  {child.flash === "child-cross" && <span className="text-muted-foreground"> · etter aritmetisk blanding</span>}
                  {child.flash === "child-mut" && <span className="text-muted-foreground"> · etter gaussisk mutasjon</span>}
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              <button type="button" onClick={doCrossover} className="px-3 py-1.5 text-xs rounded bg-brand text-brand-foreground">Crossover</button>
              <button type="button" onClick={doMutate} disabled={!child} className="px-3 py-1.5 text-xs rounded bg-amber-500 text-white disabled:opacity-30">Mutation</button>
              <button type="button" onClick={() => setChild(null)} className="px-3 py-1.5 text-xs rounded border border-border text-muted-foreground">Reset barn</button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs font-semibold">Auto-evolusjon (minimer f)</div>
              <div className="flex gap-1">
                <button type="button" onClick={evolveOnce} disabled={running} className="px-2 py-1 text-xs rounded bg-brand text-brand-foreground disabled:opacity-40">Neste</button>
                <button type="button" onClick={runMany} className="px-2 py-1 text-xs rounded bg-muted">{running ? "Stopp" : "Kjør 30"}</button>
                <button type="button" onClick={() => setSeed((s) => s + 1)} className="px-2 py-1 text-xs rounded border border-border text-muted-foreground">Reset</button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              Gen <span className="font-mono">{gen}</span> · best f ={" "}
              <span className="font-mono text-emerald-400">{best.fitness.toFixed(3)}</span> ved ({best.x.toFixed(2)}, {best.y.toFixed(2)})
            </div>
            <div style={{ width: "100%", height: 110 }}>
              <ResponsiveContainer>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="gen" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} labelFormatter={(g) => `Gen ${g}`} />
                  <Line type="monotone" dataKey="best" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} name="Best (lavest)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Hvorfor real-value?</strong> For kontinuerlig
        optimering (PID-tuning, hyperparametre, vekter) er flyttall naturlige.
        Aritmetisk crossover holder barnet inni konveks kombinasjon av foreldrene
        — alltid gyldig. Gaussisk mutasjon gir gradvis utforskning rundt eksisterende punkt.
        Du kunne IKKE brukt one-point bit-flip her: hva ville "bit 12 av et flyttall" engang bety?
      </div>
    </div>
  );
}

function ParentPick({ label, value, onChange, pop }: { label: string; value: number; onChange: (i: number) => void; pop: Ind[] }) {
  return (
    <label className="block">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <select value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full px-2 py-1 text-xs rounded border border-border bg-background">
        {pop.map((p, i) => (
          <option key={i} value={i}>#{i} — f={p.fitness.toFixed(2)}</option>
        ))}
      </select>
    </label>
  );
}
