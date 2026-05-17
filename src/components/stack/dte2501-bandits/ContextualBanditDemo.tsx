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

// Contextual bandit: hver request har en context (segment), og beste arm avhenger
// av context. Vi viser en LinUCB-light + en context-agnostic ε-greedy baseline.
//
// Kontekst: brukerprofil med to features { ung_voksen, by_land } enkodet som
// segment ∈ {0,1,2,3}. 4 armer (artikler / tilbud). Sann reward-matrise styrer
// hvilken arm som er best per segment.

type Segment = 0 | 1 | 2 | 3;
type Arm = 0 | 1 | 2 | 3;

const SEGMENT_LABELS: Record<Segment, string> = {
  0: "Ung, by",
  1: "Ung, land",
  2: "Voksen, by",
  3: "Voksen, land",
};

const ARM_LABELS: Record<Arm, string> = {
  0: "Sport-nyhet",
  1: "Lokalstoff",
  2: "Tech-artikkel",
  3: "Hagestoff",
};

// reward-matrise [segment][arm] — sann CTR
const TRUE_REWARD: number[][] = [
  // 0 = ung,by
  [0.4, 0.1, 0.7, 0.05],
  // 1 = ung,land
  [0.5, 0.6, 0.55, 0.15],
  // 2 = voksen,by
  [0.2, 0.3, 0.45, 0.25],
  // 3 = voksen,land
  [0.1, 0.5, 0.15, 0.65],
];
const NUM_ARMS = 4;
const NUM_SEGMENTS = 4;

function lcg(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
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

// Bernoulli draw
function bern(p: number, rng: () => number): number {
  return rng() < p ? 1 : 0;
}

type Run = {
  ctr: number[]; // running CTR per step
  finalRewards: number;
};

function simulate(
  mode: "contextual" | "agnostic",
  steps: number,
  seed: number,
): Run {
  const rng = lcg(seed);
  // Contextual: separate Q-tabell per segment.
  const Q = Array.from({ length: NUM_SEGMENTS }, () =>
    new Array<number>(NUM_ARMS).fill(0),
  );
  const N = Array.from({ length: NUM_SEGMENTS }, () =>
    new Array<number>(NUM_ARMS).fill(0),
  );
  // Agnostic: én Q-tabell, ignorerer context
  const Qag = new Array<number>(NUM_ARMS).fill(0);
  const Nag = new Array<number>(NUM_ARMS).fill(0);

  const eps = 0.1;
  let totalReward = 0;
  const ctr: number[] = [];

  for (let t = 1; t <= steps; t++) {
    const seg = Math.floor(rng() * NUM_SEGMENTS) as Segment;
    let a: number;
    if (mode === "contextual") {
      // ε-greedy per segment
      if (rng() < eps || N[seg].some((n) => n === 0)) {
        a = Math.floor(rng() * NUM_ARMS);
      } else {
        a = argmax(Q[seg]);
      }
    } else {
      if (rng() < eps || Nag.some((n) => n === 0)) {
        a = Math.floor(rng() * NUM_ARMS);
      } else {
        a = argmax(Qag);
      }
    }
    const reward = bern(TRUE_REWARD[seg][a], rng);
    totalReward += reward;
    if (mode === "contextual") {
      N[seg][a] += 1;
      Q[seg][a] += (reward - Q[seg][a]) / N[seg][a];
    } else {
      Nag[a] += 1;
      Qag[a] += (reward - Qag[a]) / Nag[a];
    }
    ctr.push(totalReward / t);
  }
  return { ctr, finalRewards: totalReward };
}

export function ContextualBanditDemo() {
  const [steps, setSteps] = useState(800);
  const [playSeg, setPlaySeg] = useState<Segment>(0);
  const [seed, setSeed] = useState(7);

  const ctx = useMemo(() => simulate("contextual", steps, seed), [steps, seed]);
  const ag = useMemo(() => simulate("agnostic", steps, seed), [steps, seed]);

  // Oracle: alltid best arm per segment, gjennomsnitt over segmenter
  const oracleCtr =
    TRUE_REWARD.reduce((a, row) => a + Math.max(...row), 0) / NUM_SEGMENTS;

  const chartData = useMemo(() => {
    const sample = Math.max(1, Math.floor(steps / 100));
    const data: Array<Record<string, number>> = [];
    for (let i = sample - 1; i < steps; i += sample) {
      data.push({
        step: i + 1,
        contextual: +ctx.ctr[i].toFixed(3),
        agnostic: +ag.ctr[i].toFixed(3),
        oracle: +oracleCtr.toFixed(3),
      });
    }
    return data;
  }, [ctx, ag, oracleCtr, steps]);

  // For "spille bruker": kjør contextual sim, hent Q[playSeg], finn recommended arm
  const recommendation = useMemo(() => {
    // Vi gjenkjører simuleringen og avslutter med Q-tabellen for å vise
    // hva bandit "har lært" om playSeg.
    const rng = lcg(seed);
    const Q = Array.from({ length: NUM_SEGMENTS }, () =>
      new Array<number>(NUM_ARMS).fill(0),
    );
    const N = Array.from({ length: NUM_SEGMENTS }, () =>
      new Array<number>(NUM_ARMS).fill(0),
    );
    const eps = 0.1;
    for (let t = 1; t <= steps; t++) {
      const seg = Math.floor(rng() * NUM_SEGMENTS) as Segment;
      let a: number;
      if (rng() < eps || N[seg].some((n) => n === 0)) {
        a = Math.floor(rng() * NUM_ARMS);
      } else {
        a = argmax(Q[seg]);
      }
      const reward = bern(TRUE_REWARD[seg][a], rng);
      N[seg][a] += 1;
      Q[seg][a] += (reward - Q[seg][a]) / N[seg][a];
    }
    return { Q: Q[playSeg], N: N[playSeg], best: argmax(Q[playSeg]) };
  }, [seed, steps, playSeg]);

  const trueBest = argmax(TRUE_REWARD[playSeg]);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div>
        <div className="text-sm font-semibold mb-1">
          Contextual bandit — personalisering vs context-agnostic
        </div>
        <div className="text-xs text-muted-foreground">
          4 brukersegmenter, 4 artikler. Sann CTR varierer med segment. En
          contextual bandit lærer{" "}
          <em>per segment</em>; en agnostic bandit må velge én vinner totalt.
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium block mb-1">
            Antall requests = <span className="font-mono">{steps}</span>
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
        <div className="flex items-end gap-2">
          <div>
            <label className="text-xs font-medium block mb-1">Seed</label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              className="w-24 rounded border border-border bg-background px-2 py-1.5 text-sm font-mono"
            />
          </div>
          <button
            onClick={() => setSeed((s) => s + 1)}
            className="rounded border border-border px-2 py-1.5 text-xs hover:bg-muted"
          >
            Ny seed
          </button>
        </div>
      </div>

      <div className="h-56 rounded border border-border bg-background/50">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 12, left: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="step" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} />
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
              dataKey="oracle"
              stroke="hsl(160 60% 40%)"
              strokeDasharray="6 3"
              dot={false}
              strokeWidth={1.5}
              name="Oracle (CTR-tak)"
            />
            <Line
              type="monotone"
              dataKey="contextual"
              stroke="hsl(200 70% 50%)"
              dot={false}
              strokeWidth={2.5}
              name="Contextual"
            />
            <Line
              type="monotone"
              dataKey="agnostic"
              stroke="hsl(0 70% 55%)"
              dot={false}
              strokeWidth={2.5}
              name="Agnostic"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="border-t border-border pt-3 space-y-3">
        <div className="text-xs font-semibold">
          Spill bruker — velg context og se hva bandit anbefaler
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(Object.keys(SEGMENT_LABELS) as unknown as Segment[]).map((s) => {
            const sn = Number(s) as Segment;
            return (
              <button
                key={sn}
                onClick={() => setPlaySeg(sn)}
                className={`rounded border px-2 py-1 text-xs ${
                  playSeg === sn
                    ? "border-brand bg-brand/10 text-brand font-medium"
                    : "border-border hover:bg-muted"
                }`}
              >
                {SEGMENT_LABELS[sn]}
              </button>
            );
          })}
        </div>

        <div className="overflow-x-auto rounded border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-2 py-1.5">Arm</th>
                <th className="text-left px-2 py-1.5">Sann CTR</th>
                <th className="text-left px-2 py-1.5">Lært Q̂</th>
                <th className="text-left px-2 py-1.5">N (visninger)</th>
              </tr>
            </thead>
            <tbody>
              {ARM_LABELS &&
                Object.keys(ARM_LABELS).map((aStr) => {
                  const a = Number(aStr) as Arm;
                  const isTrueBest = a === trueBest;
                  const isPicked = a === recommendation.best;
                  return (
                    <tr
                      key={a}
                      className={`border-t border-border ${
                        isPicked ? "bg-brand/5" : ""
                      }`}
                    >
                      <td className="px-2 py-1.5">
                        {ARM_LABELS[a]}
                        {isTrueBest && (
                          <span className="ml-1 text-emerald-600">★</span>
                        )}
                        {isPicked && (
                          <span className="ml-1 text-brand">← bandit-valg</span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 font-mono">
                        {(TRUE_REWARD[playSeg][a] * 100).toFixed(0)}%
                      </td>
                      <td className="px-2 py-1.5 font-mono">
                        {recommendation.N[a] > 0
                          ? (recommendation.Q[a] * 100).toFixed(0) + "%"
                          : "—"}
                      </td>
                      <td className="px-2 py-1.5 font-mono">
                        {recommendation.N[a]}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-muted-foreground">
          For <strong>{SEGMENT_LABELS[playSeg]}</strong> er sann beste arm{" "}
          <strong>{ARM_LABELS[trueBest as Arm]}</strong>. Bandit anbefaler{" "}
          <strong>{ARM_LABELS[recommendation.best as Arm]}</strong>{" "}
          {recommendation.best === trueBest ? "✓" : "✗"}.
        </div>
      </div>

      <div className="text-xs text-muted-foreground border-t border-border pt-3">
        <strong className="text-foreground">Hvorfor contextual vinner:</strong>{" "}
        Agnostic bandit gjennomsnitter CTR over segmenter — den velger arm med
        høyest <em>marginal</em> CTR (her ofte Tech-artikkel) og blir suboptimal
        for "voksen, land". Contextual lærer en separat policy per segment og
        nærmer seg oracle. Dette er prinsippet bak personalisering i
        anbefalingssystemer (LinUCB, Vowpal Wabbit, contextual TS).
      </div>
    </div>
  );
}
