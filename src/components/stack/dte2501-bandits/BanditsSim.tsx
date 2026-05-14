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

// Multi-armed bandits sim — sammenligner ε-greedy, UCB1, Thompson sampling og
// optimistic initial values. 5 armer med skjulte gaussiske belønninger.

type Algorithm = "epsilon" | "ucb" | "thompson" | "optimistic";

const TRUE_MEANS = [0.2, -0.3, 0.7, 0.1, 0.5]; // valgt så arm 2 (k=2) er best
const NUM_ARMS = TRUE_MEANS.length;
const SIGMA = 1.0;
const STEPS = 1000;
const SAMPLE_EVERY = 20; // chart samples

// Box-Muller for normalfordelt støy.
function gauss(rng: () => number): number {
  let u1 = rng();
  const u2 = rng();
  if (u1 < 1e-9) u1 = 1e-9;
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// LCG for reproduserbare seeds.
function lcg(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    // Float i [0, 1)
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
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

type SimResult = {
  Q: number[];
  N: number[];
  cumulative: number;
  history: { step: number; cumReward: number; regret: number }[];
  bestArm: number;
};

function runSim(
  algo: Algorithm,
  eps: number,
  cUcb: number,
  optimisticInit: number,
  seed: number,
): SimResult {
  const rng = lcg(seed);
  const Q = new Array<number>(NUM_ARMS).fill(0);
  const N = new Array<number>(NUM_ARMS).fill(0);

  if (algo === "optimistic") {
    Q.fill(optimisticInit);
  }

  // For Thompson sampling vi tracker sum og kvadrat-sum per arm for posterior.
  const sums = new Array<number>(NUM_ARMS).fill(0);
  const sumSq = new Array<number>(NUM_ARMS).fill(0);

  let cumulative = 0;
  const bestMean = Math.max(...TRUE_MEANS);
  const history: { step: number; cumReward: number; regret: number }[] = [];

  for (let t = 1; t <= STEPS; t++) {
    let a: number;
    if (algo === "epsilon") {
      a = rng() < eps ? Math.floor(rng() * NUM_ARMS) : argmax(Q);
    } else if (algo === "optimistic") {
      a = argmax(Q);
    } else if (algo === "ucb") {
      // Sørg for at hver arm prøves minst én gang først.
      const untried = N.findIndex((n) => n === 0);
      if (untried >= 0) {
        a = untried;
      } else {
        const ucb = Q.map((q, i) => q + cUcb * Math.sqrt(Math.log(t) / N[i]));
        a = argmax(ucb);
      }
    } else {
      // Thompson: anta normal-likelihood med fast σ=1. Posterior over μ_a:
      // μ_a | data ~ N( Q̂, 1 / sqrt(N+1) ). Trekk en sample per arm, velg argmax.
      const samples = Q.map((q, i) => q + gauss(rng) / Math.sqrt(N[i] + 1));
      a = argmax(samples);
    }

    const r = TRUE_MEANS[a] + SIGMA * gauss(rng);
    N[a] += 1;
    Q[a] += (r - Q[a]) / N[a];
    sums[a] += r;
    sumSq[a] += r * r;
    cumulative += r;

    if (t % SAMPLE_EVERY === 0 || t === STEPS) {
      history.push({
        step: t,
        cumReward: cumulative,
        regret: bestMean * t - cumulative,
      });
    }
  }

  return { Q, N, cumulative, history, bestArm: argmax(TRUE_MEANS) };
}

export function BanditsSim() {
  const [algo, setAlgo] = useState<Algorithm>("epsilon");
  const [eps, setEps] = useState(0.1);
  const [cUcb, setCUcb] = useState(2);
  const [optimisticInit, setOptimisticInit] = useState(2);
  const [seed, setSeed] = useState(7);

  const result = useMemo(
    () => runSim(algo, eps, cUcb, optimisticInit, seed),
    [algo, eps, cUcb, optimisticInit, seed],
  );

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-xs font-medium block mb-1">Algoritme</label>
          <select
            value={algo}
            onChange={(e) => setAlgo(e.target.value as Algorithm)}
            className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
          >
            <option value="epsilon">ε-greedy</option>
            <option value="optimistic">Optimistic initial values</option>
            <option value="ucb">UCB1</option>
            <option value="thompson">Thompson sampling</option>
          </select>
        </div>

        {algo === "epsilon" && (
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
        )}

        {algo === "ucb" && (
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
        )}

        {algo === "optimistic" && (
          <div>
            <label className="text-xs font-medium block mb-1">
              Initial Q₀ ={" "}
              <span className="font-mono">{optimisticInit.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={optimisticInit}
              onChange={(e) => setOptimisticInit(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        <div>
          <label className="text-xs font-medium block mb-1">
            Seed = <span className="font-mono">{seed}</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              className="w-24 rounded border border-border bg-background px-2 py-1.5 text-sm font-mono"
            />
            <button
              type="button"
              onClick={() => setSeed((s) => s + 1)}
              className="rounded border border-border px-2 py-1 text-xs hover:bg-muted"
            >
              Ny seed
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-xs font-medium mb-1">Kumulativ belønning</div>
          <div className="h-48 rounded border border-border bg-background/50">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={result.history}
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
                <Line
                  type="monotone"
                  dataKey="cumReward"
                  stroke="hsl(160 70% 45%)"
                  dot={false}
                  strokeWidth={2}
                  name="Σ belønning"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="text-xs font-medium mb-1">
            Regret (kumulativ tap mot oracle)
          </div>
          <div className="h-48 rounded border border-border bg-background/50">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={result.history}
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
                <Line
                  type="monotone"
                  dataKey="regret"
                  stroke="hsl(0 70% 55%)"
                  dot={false}
                  strokeWidth={2}
                  name="Regret"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <div className="text-xs font-medium mb-1">
          Per-arm — sann μ vs estimert Q (etter {STEPS} trekk)
        </div>
        <div className="overflow-hidden rounded border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-2 py-1.5">Arm</th>
                <th className="text-left px-2 py-1.5">Sann μ</th>
                <th className="text-left px-2 py-1.5">Estimert Q</th>
                <th className="text-left px-2 py-1.5">Plukket N</th>
                <th className="text-left px-2 py-1.5">Andel</th>
              </tr>
            </thead>
            <tbody>
              {TRUE_MEANS.map((m, i) => (
                <tr
                  key={i}
                  className={`border-t border-border ${
                    i === result.bestArm ? "bg-emerald-500/10" : ""
                  }`}
                >
                  <td className="px-2 py-1.5 font-mono">
                    {i}
                    {i === result.bestArm && (
                      <span className="ml-1 text-emerald-600">★</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 font-mono">{m.toFixed(2)}</td>
                  <td className="px-2 py-1.5 font-mono">
                    {result.Q[i].toFixed(2)}
                  </td>
                  <td className="px-2 py-1.5 font-mono">{result.N[i]}</td>
                  <td className="px-2 py-1.5 font-mono">
                    {((result.N[i] / STEPS) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Sann beste-arm er <span className="text-emerald-600">★</span>. En bra
        algoritme bør plukke den et flertall av trekkene (høy andel) og ha lav
        slutt-regret. ε-greedy med ε=0 sitter ofte fast på en suboptimal arm
        — utforsk litt og se forskjellen.
      </div>
    </div>
  );
}
