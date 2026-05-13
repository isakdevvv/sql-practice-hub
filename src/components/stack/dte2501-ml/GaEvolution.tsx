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
 * GaEvolution — interaktiv genetisk algoritme
 *
 * Pedagogisk modell:
 *  - Basis: 8 bit-strenger (lengde 16), OneMax-fitness (antall 1-ere)
 *  - Dypere: justere populasjon, mutasjonsrate, crossover-rate og crossover-type
 *  - Eksamen: kjør 50 generasjoner og se konvergenskurven — fasit til
 *    «hvorfor trenger vi mutasjon?» og «hva er konvergens-kriterier?»
 */

type Individual = {
  bits: number[]; // 16 bits
  fitness: number;
  // markers for animation of the most recent operation
  parentMarker?: "winner-a" | "winner-b" | "child";
  crossoverPoint?: number;
  mutatedBits?: number[];
};

type CrossoverKind = "one-point" | "two-point" | "uniform";

const BIT_LEN = 16;

// --- Deterministic LCG so reset returns to same starting population. ---
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function randomIndividual(rand: () => number): Individual {
  const bits: number[] = Array.from({ length: BIT_LEN }, () =>
    rand() < 0.5 ? 1 : 0,
  );
  return { bits, fitness: fitness(bits) };
}

function fitness(bits: number[]): number {
  // OneMax — maximize number of 1s
  let s = 0;
  for (const b of bits) s += b;
  return s;
}

function tournamentSelect(
  pop: Individual[],
  rand: () => number,
  t = 3,
): { winner: Individual; idx: number } {
  let bestIdx = Math.floor(rand() * pop.length);
  let best = pop[bestIdx];
  for (let i = 1; i < t; i++) {
    const idx = Math.floor(rand() * pop.length);
    if (pop[idx].fitness > best.fitness) {
      best = pop[idx];
      bestIdx = idx;
    }
  }
  return { winner: best, idx: bestIdx };
}

function crossover(
  a: number[],
  b: number[],
  kind: CrossoverKind,
  rand: () => number,
): { childA: number[]; childB: number[]; point?: number } {
  if (kind === "one-point") {
    const point = 1 + Math.floor(rand() * (BIT_LEN - 1));
    const childA = [...a.slice(0, point), ...b.slice(point)];
    const childB = [...b.slice(0, point), ...a.slice(point)];
    return { childA, childB, point };
  }
  if (kind === "two-point") {
    const p1 = 1 + Math.floor(rand() * (BIT_LEN - 2));
    const p2 = p1 + 1 + Math.floor(rand() * (BIT_LEN - p1 - 1));
    const childA = [
      ...a.slice(0, p1),
      ...b.slice(p1, p2),
      ...a.slice(p2),
    ];
    const childB = [
      ...b.slice(0, p1),
      ...a.slice(p1, p2),
      ...b.slice(p2),
    ];
    return { childA, childB, point: p1 };
  }
  // uniform
  const childA: number[] = [];
  const childB: number[] = [];
  for (let i = 0; i < BIT_LEN; i++) {
    if (rand() < 0.5) {
      childA.push(a[i]);
      childB.push(b[i]);
    } else {
      childA.push(b[i]);
      childB.push(a[i]);
    }
  }
  return { childA, childB };
}

function mutate(
  bits: number[],
  rate: number,
  rand: () => number,
): { bits: number[]; mutated: number[] } {
  const out = bits.slice();
  const mutated: number[] = [];
  for (let i = 0; i < out.length; i++) {
    if (rand() < rate) {
      out[i] = 1 - out[i];
      mutated.push(i);
    }
  }
  return { bits: out, mutated };
}

function evolve(
  pop: Individual[],
  rand: () => number,
  pCross: number,
  pMut: number,
  kind: CrossoverKind,
): { next: Individual[]; lastChildren: Individual[] } {
  const N = pop.length;
  // Elitism: keep top-2
  const sorted = [...pop].sort((a, b) => b.fitness - a.fitness);
  const next: Individual[] = [
    { ...sorted[0], parentMarker: undefined, mutatedBits: undefined, crossoverPoint: undefined },
    { ...sorted[1], parentMarker: undefined, mutatedBits: undefined, crossoverPoint: undefined },
  ];
  const lastChildren: Individual[] = [];

  while (next.length < N) {
    const { winner: p1 } = tournamentSelect(pop, rand);
    const { winner: p2 } = tournamentSelect(pop, rand);
    let childABits: number[];
    let childBBits: number[];
    let point: number | undefined;
    if (rand() < pCross) {
      const cx = crossover(p1.bits, p2.bits, kind, rand);
      childABits = cx.childA;
      childBBits = cx.childB;
      point = cx.point;
    } else {
      childABits = p1.bits.slice();
      childBBits = p2.bits.slice();
    }
    const mA = mutate(childABits, pMut, rand);
    const mB = mutate(childBBits, pMut, rand);
    const cA: Individual = {
      bits: mA.bits,
      fitness: fitness(mA.bits),
      mutatedBits: mA.mutated,
      crossoverPoint: point,
      parentMarker: "child",
    };
    const cB: Individual = {
      bits: mB.bits,
      fitness: fitness(mB.bits),
      mutatedBits: mB.mutated,
      crossoverPoint: point,
      parentMarker: "child",
    };
    next.push(cA, cB);
    lastChildren.push(cA, cB);
    if (next.length >= N) break;
  }

  return { next: next.slice(0, N), lastChildren };
}

export function GaEvolution() {
  const [popSize, setPopSize] = useState(10);
  const [mutRate, setMutRate] = useState(0.02);
  const [crossRate, setCrossRate] = useState(0.8);
  const [kind, setKind] = useState<CrossoverKind>("one-point");
  const [seed, setSeed] = useState(42);
  const [gen, setGen] = useState(0);
  const [pop, setPop] = useState<Individual[]>(() => {
    const r = lcg(42);
    return Array.from({ length: 10 }, () => randomIndividual(r));
  });
  const [history, setHistory] = useState<
    { gen: number; best: number; avg: number }[]
  >([{ gen: 0, best: 0, avg: 0 }]);
  const [running, setRunning] = useState(false);
  const randRef = useRef<() => number>(lcg(42));
  const timerRef = useRef<number | null>(null);

  // Reset whenever popSize or seed changes
  useEffect(() => {
    randRef.current = lcg(seed);
    const initial = Array.from({ length: popSize }, () =>
      randomIndividual(randRef.current),
    );
    setPop(initial);
    setGen(0);
    const best = Math.max(...initial.map((i) => i.fitness));
    const avg =
      initial.reduce((a, b) => a + b.fitness, 0) / initial.length;
    setHistory([{ gen: 0, best, avg }]);
  }, [popSize, seed]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const step = () => {
    setPop((current) => {
      const { next } = evolve(
        current,
        randRef.current,
        crossRate,
        mutRate,
        kind,
      );
      const nextGen = gen + 1;
      setGen(nextGen);
      const best = Math.max(...next.map((i) => i.fitness));
      const avg = next.reduce((a, b) => a + b.fitness, 0) / next.length;
      setHistory((h) => [...h.slice(-200), { gen: nextGen, best, avg }]);
      return next;
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
      step();
      count += 1;
      if (count < 50) {
        timerRef.current = window.setTimeout(tick, 70);
      } else {
        setRunning(false);
        timerRef.current = null;
      }
    };
    timerRef.current = window.setTimeout(tick, 70);
  };

  const reset = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    setSeed((s) => s + 1); // triggers regeneration via effect
  };

  // Sort the population descending by fitness for display.
  const display = useMemo(
    () => [...pop].sort((a, b) => b.fitness - a.fitness),
    [pop],
  );

  const best = display[0]?.fitness ?? 0;
  const avg = pop.length
    ? pop.reduce((s, i) => s + i.fitness, 0) / pop.length
    : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      {/* Controls */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Control
            label={`Populasjon: ${popSize}`}
            min={4}
            max={30}
            step={2}
            value={popSize}
            onChange={setPopSize}
            disabled={running}
          />
          <Control
            label={`Mutasjonsrate: ${(mutRate * 100).toFixed(1)}%`}
            min={0}
            max={0.1}
            step={0.005}
            value={mutRate}
            onChange={setMutRate}
          />
          <Control
            label={`Crossover-rate: ${(crossRate * 100).toFixed(0)}%`}
            min={0}
            max={1}
            step={0.05}
            value={crossRate}
            onChange={setCrossRate}
          />
        </div>
        <div className="space-y-2">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Crossover-type</div>
            <div className="flex gap-1">
              {(["one-point", "two-point", "uniform"] as CrossoverKind[]).map(
                (k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    className={`px-2 py-1 text-xs rounded border transition ${
                      kind === k
                        ? "bg-brand text-brand-foreground border-brand"
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {k}
                  </button>
                ),
              )}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={step}
              disabled={running}
              className="px-3 py-1.5 text-xs rounded bg-brand text-brand-foreground disabled:opacity-40"
            >
              Neste generasjon
            </button>
            <button
              type="button"
              onClick={runMany}
              className="px-3 py-1.5 text-xs rounded bg-muted hover:bg-muted/80"
            >
              {running ? "Stopp" : "Kjør 50 generasjoner"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="px-3 py-1.5 text-xs rounded border border-border text-muted-foreground"
            >
              Reset
            </button>
          </div>
          <div className="text-xs text-muted-foreground pt-1">
            Generasjon <span className="font-mono">{gen}</span> · best{" "}
            <span className="font-mono">{best}/16</span> · snitt{" "}
            <span className="font-mono">{avg.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Population display */}
      <div>
        <div className="text-xs font-semibold mb-2">
          Populasjon — bit-strenger sortert etter fitness
        </div>
        <div className="space-y-1 font-mono text-[11px]">
          {display.map((ind, i) => (
            <PopRow key={i} ind={ind} rank={i} />
          ))}
        </div>
      </div>

      {/* Convergence chart */}
      <div>
        <div className="text-xs font-semibold mb-2">
          Konvergens — best og snitt fitness per generasjon
        </div>
        <div style={{ width: "100%", height: 180 }}>
          <ResponsiveContainer>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="gen" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 16]} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: 11 }}
                labelFormatter={(g) => `Gen ${g}`}
              />
              <Line
                type="monotone"
                dataKey="best"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                name="Beste"
              />
              <Line
                type="monotone"
                dataKey="avg"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                name="Snitt"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Eksperimenter: sett mutasjonsrate til 0 — da kjører populasjonen
        kollapser fort på lokalt optimum. Sett crossover-rate til 0 — bare
        mutasjon, mye tregere konvergens. Klassisk eksamenssvar:{" "}
        <em>«crossover bygger fra det vi har, mutasjon utforsker nytt»</em>.
      </p>
    </div>
  );
}

function PopRow({ ind, rank }: { ind: Individual; rank: number }) {
  const mutSet = new Set(ind.mutatedBits ?? []);
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground w-5 shrink-0">#{rank + 1}</span>
      <div className="flex gap-0.5">
        {ind.bits.map((b, i) => (
          <span
            key={i}
            className={`inline-block w-3 text-center rounded-sm ${
              mutSet.has(i)
                ? "bg-amber-400/40 text-amber-300 border border-amber-400"
                : b === 1
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {b}
          </span>
        ))}
      </div>
      <div className="flex-1 ml-2 min-w-0">
        <div className="h-2 bg-muted rounded overflow-hidden">
          <div
            className="h-full bg-emerald-500"
            style={{ width: `${(ind.fitness / BIT_LEN) * 100}%` }}
          />
        </div>
      </div>
      <span className="w-8 text-right text-muted-foreground">
        {ind.fitness}/16
      </span>
    </div>
  );
}

function Control({
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
