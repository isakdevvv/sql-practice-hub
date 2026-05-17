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
  Area,
  ComposedChart,
} from "recharts";

// Plot empirisk regret over tid for UCB, ε-greedy (fast ε), Thompson, og
// sammenlign med teoretiske bounds: UCB ~ c1·√(KT log T) eller O(K log T / Δ),
// ε-greedy fast ~ ε·Δ·T (lineær), Thompson ~ O(log T).

type Algo = "ucb" | "epsilon" | "thompson";

const TRUE_MEANS = [0.2, -0.3, 0.7, 0.1, 0.5];
const NUM_ARMS = TRUE_MEANS.length;
const SIGMA = 1.0;
const STEPS = 800;
const RUNS = 5;

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

function simulate(algo: Algo, eps: number, cUcb: number, seed: number): number[] {
  const rng = lcg(seed);
  const Q = new Array<number>(NUM_ARMS).fill(0);
  const N = new Array<number>(NUM_ARMS).fill(0);
  const bestMean = Math.max(...TRUE_MEANS);
  let cumReward = 0;
  const regret: number[] = [];

  for (let t = 1; t <= STEPS; t++) {
    let a: number;
    if (algo === "epsilon") {
      a = rng() < eps ? Math.floor(rng() * NUM_ARMS) : argmax(Q);
    } else if (algo === "ucb") {
      const untried = N.findIndex((n) => n === 0);
      if (untried >= 0) a = untried;
      else {
        const ucb = Q.map((q, i) => q + cUcb * Math.sqrt(Math.log(t) / N[i]));
        a = argmax(ucb);
      }
    } else {
      const samples = Q.map((q, i) => q + gauss(rng) / Math.sqrt(N[i] + 1));
      a = argmax(samples);
    }
    const r = TRUE_MEANS[a] + SIGMA * gauss(rng);
    N[a] += 1;
    Q[a] += (r - Q[a]) / N[a];
    cumReward += r;
    regret.push(bestMean * t - cumReward);
  }
  return regret;
}

export function RegretBoundsViz() {
  const [algo, setAlgo] = useState<Algo>("ucb");
  const [eps, setEps] = useState(0.1);
  const [cUcb, setCUcb] = useState(2);

  // Kjør 5 runs, beregn mean + min/max-band
  const data = useMemo(() => {
    const runs: number[][] = [];
    for (let r = 0; r < RUNS; r++) {
      runs.push(simulate(algo, eps, cUcb, 100 + r * 31));
    }
    // Sample hver 10. steg for chart
    const out: Array<Record<string, number>> = [];
    for (let t = 9; t < STEPS; t += 10) {
      const vals = runs.map((r) => r[t]);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const lo = Math.min(...vals);
      const hi = Math.max(...vals);
      // Teoretiske bounds:
      const ucbBound = 4 * Math.sqrt(NUM_ARMS * (t + 1) * Math.log(t + 1));
      const logBound = 3 * NUM_ARMS * Math.log(t + 1); // O(K log T)
      const linBound = 0.5 * eps * (t + 1); // ε·Δ̄·T (Δ̄ ~ 0.5)
      out.push({
        step: t + 1,
        mean: +mean.toFixed(2),
        lo: +lo.toFixed(2),
        hi: +hi.toFixed(2),
        band: +(hi - lo).toFixed(2),
        ucbBound: +ucbBound.toFixed(2),
        logBound: +logBound.toFixed(2),
        linBound: +linBound.toFixed(2),
      });
    }
    return out;
  }, [algo, eps, cUcb]);

  const showLinBound = algo === "epsilon";
  const showUcbBound = algo === "ucb" || algo === "thompson";

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div>
        <div className="text-sm font-semibold mb-1">
          Empirisk vs teoretisk regret-bound
        </div>
        <div className="text-xs text-muted-foreground">
          Mean regret over {RUNS} runs (variansband = min/max). Stiplet linje
          er teoretisk øvre bound for algoritmen.
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium block mb-1">Algoritme</label>
          <select
            value={algo}
            onChange={(e) => setAlgo(e.target.value as Algo)}
            className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
          >
            <option value="ucb">UCB1 — O(√(KT log T)) bound</option>
            <option value="thompson">Thompson — O(K log T)</option>
            <option value="epsilon">ε-greedy (fast ε) — Θ(T) lineær</option>
          </select>
        </div>
        {algo === "epsilon" && (
          <div>
            <label className="text-xs font-medium block mb-1">
              ε = <span className="font-mono">{eps.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min={0.01}
              max={0.5}
              step={0.01}
              value={eps}
              onChange={(e) => setEps(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}
        {algo === "ucb" && (
          <div>
            <label className="text-xs font-medium block mb-1">
              c = <span className="font-mono">{cUcb.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min={0.5}
              max={4}
              step={0.1}
              value={cUcb}
              onChange={(e) => setCUcb(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}
      </div>

      <div className="h-72 rounded border border-border bg-background/50">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
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
            {/* min/max bånd vha. to areas stacka oppå hverandre */}
            <Area
              type="monotone"
              dataKey="lo"
              stroke="none"
              fill="hsl(200 70% 50%)"
              fillOpacity={0}
              name="lo"
              legendType="none"
            />
            <Area
              type="monotone"
              dataKey="band"
              stroke="none"
              fill="hsl(200 70% 50%)"
              fillOpacity={0.18}
              stackId="band"
              name="min–max"
            />
            <Line
              type="monotone"
              dataKey="mean"
              stroke="hsl(200 70% 40%)"
              dot={false}
              strokeWidth={2.5}
              name="Empirisk mean"
            />
            {showUcbBound && (
              <Line
                type="monotone"
                dataKey="logBound"
                stroke="hsl(160 60% 40%)"
                strokeDasharray="6 3"
                dot={false}
                strokeWidth={2}
                name="O(K log T) bound"
              />
            )}
            {showLinBound && (
              <Line
                type="monotone"
                dataKey="linBound"
                stroke="hsl(0 70% 55%)"
                strokeDasharray="6 3"
                dot={false}
                strokeWidth={2}
                name="ε·Δ̄·T lineær bound"
              />
            )}
            {algo === "ucb" && (
              <Line
                type="monotone"
                dataKey="ucbBound"
                stroke="hsl(280 60% 55%)"
                strokeDasharray="3 3"
                dot={false}
                strokeWidth={1.5}
                name="√(KT log T) løs bound"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded border border-border p-3">
          <div className="font-semibold mb-1">UCB1</div>
          <div className="text-muted-foreground">
            Auer (2002): regret ≤ 8·∑(log T / Δᵢ) + (1+π²/3)·∑Δᵢ. Vekst:
            <strong className="text-foreground"> O(K log T)</strong> — sublineær.
            Empirisk kurve bør flate ut (logaritmisk).
          </div>
        </div>
        <div className="rounded border border-border p-3">
          <div className="font-semibold mb-1">Thompson sampling</div>
          <div className="text-muted-foreground">
            Agrawal & Goyal: matcher UCB asymptotisk. Praktisk ofte
            <strong className="text-foreground"> lavere konstant</strong> enn
            UCB, særlig i tidlige steg.
          </div>
        </div>
        <div className="rounded border border-border p-3">
          <div className="font-semibold mb-1">ε-greedy (fast ε)</div>
          <div className="text-muted-foreground">
            Utforsker ε·T ganger uavhengig av t. Regret ≈
            <strong className="text-foreground"> ε·Δ̄·T</strong> — vokser
            lineært. Asymptotisk suboptimal.
          </div>
        </div>
      </div>
    </div>
  );
}
