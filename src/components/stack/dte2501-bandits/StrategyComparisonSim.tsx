import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Sammenlign 5 strategier (greedy, ε-greedy, optimistic, UCB, Thompson) på det
// samme bandit-problemet. Vis kumulativ regret + arm-pull-heatmap.

type Strategy =
  | "greedy"
  | "epsilon"
  | "optimistic"
  | "ucb"
  | "thompson";

const STRATS: { id: Strategy; label: string; color: string }[] = [
  { id: "greedy", label: "Greedy (ε=0)", color: "hsl(0 70% 55%)" },
  { id: "epsilon", label: "ε-greedy", color: "hsl(30 80% 55%)" },
  { id: "optimistic", label: "Optimistic init", color: "hsl(200 70% 50%)" },
  { id: "ucb", label: "UCB1", color: "hsl(160 65% 42%)" },
  { id: "thompson", label: "Thompson", color: "hsl(280 60% 55%)" },
];

const TRUE_MEANS = [0.2, -0.3, 0.7, 0.1, 0.5]; // beste = arm 2
const SIGMA = 1.0;
const NUM_ARMS = TRUE_MEANS.length;

function lcg(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

function gauss(rng: () => number): number {
  let u1 = rng();
  const u2 = rng();
  if (u1 < 1e-9) u1 = 1e-9;
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function argmax(arr: number[]): number {
  let best = 0;
  let bv = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > bv) {
      bv = arr[i];
      best = i;
    }
  }
  return best;
}

type Run = {
  regret: number[]; // length = steps
  pulls: number[]; // length = steps, value = chosen arm idx
  finalN: number[];
};

function runStrategy(
  strat: Strategy,
  steps: number,
  eps: number,
  cUcb: number,
  optInit: number,
  seed: number,
): Run {
  const rng = lcg(seed);
  const Q = new Array<number>(NUM_ARMS).fill(strat === "optimistic" ? optInit : 0);
  const N = new Array<number>(NUM_ARMS).fill(0);
  const bestMean = Math.max(...TRUE_MEANS);
  const regret: number[] = [];
  const pulls: number[] = [];
  let cumReward = 0;

  for (let t = 1; t <= steps; t++) {
    let a: number;
    if (strat === "greedy") {
      a = argmax(Q);
    } else if (strat === "epsilon") {
      a = rng() < eps ? Math.floor(rng() * NUM_ARMS) : argmax(Q);
    } else if (strat === "optimistic") {
      a = argmax(Q);
    } else if (strat === "ucb") {
      const untried = N.findIndex((n) => n === 0);
      if (untried >= 0) {
        a = untried;
      } else {
        const ucb = Q.map((q, i) => q + cUcb * Math.sqrt(Math.log(t) / N[i]));
        a = argmax(ucb);
      }
    } else {
      // thompson: gaussian posterior med kjent støy σ=1
      const samples = Q.map((q, i) => q + gauss(rng) / Math.sqrt(N[i] + 1));
      a = argmax(samples);
    }

    const r = TRUE_MEANS[a] + SIGMA * gauss(rng);
    N[a] += 1;
    Q[a] += (r - Q[a]) / N[a];
    cumReward += r;
    regret.push(bestMean * t - cumReward);
    pulls.push(a);
  }
  return { regret, pulls, finalN: N };
}

const ARM_COLORS = [
  "hsl(0 70% 55%)",
  "hsl(40 80% 55%)",
  "hsl(140 60% 45%)",
  "hsl(220 65% 55%)",
  "hsl(290 55% 55%)",
];

export function StrategyComparisonSim() {
  const [steps, setSteps] = useState(500);
  const [eps, setEps] = useState(0.1);
  const [cUcb, setCUcb] = useState(2);
  const [optInit, setOptInit] = useState(2);
  const [seed, setSeed] = useState(42);

  const runs = useMemo(() => {
    const map: Record<Strategy, Run> = {} as Record<Strategy, Run>;
    for (const s of STRATS) {
      // Hver strategi får samme seed-startpunkt slik at støy er identisk
      // mellom strategier (paired-comparison reduserer varians).
      map[s.id] = runStrategy(s.id, steps, eps, cUcb, optInit, seed);
    }
    return map;
  }, [steps, eps, cUcb, optInit, seed]);

  // Aggreger regret til chart-data (sample hver N steg for ytelse).
  const sampleEvery = Math.max(1, Math.floor(steps / 100));
  const chartData = useMemo(() => {
    const data: Array<Record<string, number>> = [];
    for (let t = sampleEvery - 1; t < steps; t += sampleEvery) {
      const row: Record<string, number> = { step: t + 1 };
      for (const s of STRATS) {
        row[s.id] = +runs[s.id].regret[t].toFixed(3);
      }
      data.push(row);
    }
    return data;
  }, [runs, steps, sampleEvery]);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div>
        <div className="text-sm font-semibold mb-1">
          Strategi-sammenligning — samme problem, 5 algoritmer
        </div>
        <div className="text-xs text-muted-foreground">
          Sann beste arm: <strong>arm 2</strong> (μ = 0.7). Algoritmer ser
          kun belønninger. Identisk støy-sekvens (samme seed) gjør
          forskjellene rene.
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-3">
        <div>
          <label className="text-xs font-medium block mb-1">
            Antall trekk T = <span className="font-mono">{steps}</span>
          </label>
          <input
            type="range"
            min={100}
            max={2000}
            step={100}
            value={steps}
            onChange={(e) => setSteps(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">
            ε = <span className="font-mono">{eps.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min={0}
            max={0.5}
            step={0.01}
            value={eps}
            onChange={(e) => setEps(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">
            c (UCB) = <span className="font-mono">{cUcb.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min={0.1}
            max={4}
            step={0.1}
            value={cUcb}
            onChange={(e) => setCUcb(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">
            Q₀ (optimistic) ={" "}
            <span className="font-mono">{optInit.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min={0}
            max={5}
            step={0.5}
            value={optInit}
            onChange={(e) => setOptInit(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium">
          Seed: <span className="font-mono">{seed}</span>
        </label>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="rounded border border-border px-2 py-1 text-xs hover:bg-muted"
        >
          Ny seed
        </button>
      </div>

      <div>
        <div className="text-xs font-medium mb-1">
          Kumulativ regret over tid (lavere = bedre)
        </div>
        <div className="h-64 rounded border border-border bg-background/50">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 12, left: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="step" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {STRATS.map((s) => (
                <Line
                  key={s.id}
                  type="monotone"
                  dataKey={s.id}
                  stroke={s.color}
                  dot={false}
                  strokeWidth={2}
                  name={s.label}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <div className="text-xs font-medium mb-1">
          Arm-pull-historikk (heatmap: rad = strategi, kolonne = tidssteg,
          farge = valgt arm)
        </div>
        <div className="space-y-1.5">
          {STRATS.map((s) => {
            const run = runs[s.id];
            // Bin pulls til 100 søyler for visuell fart
            const bins = 100;
            const binSize = Math.max(1, Math.floor(steps / bins));
            const binned: number[][] = Array.from({ length: bins }, () => []);
            for (let i = 0; i < run.pulls.length; i++) {
              const b = Math.min(bins - 1, Math.floor(i / binSize));
              binned[b].push(run.pulls[i]);
            }
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div className="w-28 text-xs text-muted-foreground truncate">
                  {s.label}
                </div>
                <div className="flex-1 flex gap-px h-5 rounded overflow-hidden border border-border bg-background">
                  {binned.map((b, i) => {
                    // Velg dominerende arm i denne binnen
                    const counts = new Array<number>(NUM_ARMS).fill(0);
                    for (const a of b) counts[a]++;
                    const dom = argmax(counts);
                    const intensity = b.length === 0 ? 0 : counts[dom] / b.length;
                    return (
                      <div
                        key={i}
                        className="flex-1"
                        style={{
                          backgroundColor: ARM_COLORS[dom],
                          opacity: 0.25 + 0.75 * intensity,
                        }}
                        title={`bin ${i}: dom arm ${dom} (${(intensity * 100).toFixed(0)}%)`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span>Armer:</span>
          {ARM_COLORS.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ backgroundColor: c }}
              />
              arm {i} (μ={TRUE_MEANS[i]})
            </span>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground border-t border-border pt-3">
        <strong className="text-foreground">Observer:</strong> Pur greedy
        låser seg ofte på første arm med tilfeldig høy belønning og samler
        lineær regret. ε-greedy fortsetter å utforske selv etter at den vet
        — også lineær på sikt. UCB og Thompson konvergerer mot arm 2 og får
        flatere kurve. Optimistic-init gir tidlig utforskning, så grådighet.
      </div>
    </div>
  );
}
