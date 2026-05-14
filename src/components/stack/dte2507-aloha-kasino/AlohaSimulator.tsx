import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Dices, RotateCcw } from "lucide-react";

type SlotKind = "empty" | "success" | "collision";

function classifySlot(N: number, p: number, rng: () => number): SlotKind {
  let transmitting = 0;
  for (let i = 0; i < N; i++) {
    if (rng() < p) transmitting++;
  }
  if (transmitting === 0) return "empty";
  if (transmitting === 1) return "success";
  return "collision";
}

/** Deterministic LCG so the simulation is reproducible per seed. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    // mulberry32
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function efficiency(N: number, p: number): number {
  // P[exactly one of N transmits] = N · p · (1-p)^(N-1)
  return N * p * Math.pow(1 - p, N - 1);
}

function optimalP(N: number): number {
  // d/dp of N·p·(1-p)^(N-1) = 0 → p* = 1/N
  return 1 / N;
}

export function AlohaSimulator() {
  const [N, setN] = useState(5);
  const [p, setP] = useState(0.2);
  const [seed, setSeed] = useState(42);
  const [numSlots, setNumSlots] = useState(60);

  const slots = useMemo(() => {
    const rng = makeRng(seed);
    const out: SlotKind[] = [];
    for (let i = 0; i < numSlots; i++) out.push(classifySlot(N, p, rng));
    return out;
  }, [N, p, seed, numSlots]);

  const counts = useMemo(() => {
    let s = 0, e = 0, c = 0;
    for (const k of slots) {
      if (k === "success") s++;
      else if (k === "empty") e++;
      else c++;
    }
    return { s, e, c };
  }, [slots]);

  const theoreticalEff = efficiency(N, p);
  const observedEff = counts.s / Math.max(1, numSlots);

  // Curve: efficiency vs p for current N
  const curve = useMemo(() => {
    const pts: Array<{ p: number; eff: number }> = [];
    for (let i = 0; i <= 50; i++) {
      const pp = i / 50;
      pts.push({ p: pp, eff: efficiency(N, pp) });
    }
    return pts;
  }, [N]);

  const pStar = optimalP(N);
  const effAtPStar = efficiency(N, pStar);
  // Limit as N→∞ is 1/e ≈ 0.368
  const oneOverE = 1 / Math.E;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
          <Dices className="h-3.5 w-3.5" /> Slotted ALOHA-simulator
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="px-2 py-1 text-[11px] font-medium rounded-md border border-border bg-card hover:border-brand/40"
          >
            Ny seed
          </button>
          <button
            type="button"
            onClick={() => { setN(5); setP(0.2); setSeed(42); setNumSlots(60); }}
            className="px-2 py-1 text-[11px] font-medium rounded-md border border-border bg-card hover:border-brand/40 inline-flex items-center gap-1.5"
          >
            <RotateCcw className="h-3 w-3" /> Nullstill
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_280px]">
        <div className="p-4 border-b md:border-b-0 md:border-r border-border space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold">N — antall noder</span>
              <span className="font-mono text-brand">{N}</span>
            </div>
            <input
              type="range"
              min={2}
              max={30}
              step={1}
              value={N}
              onChange={(e) => setN(Number(e.target.value))}
              className="w-full accent-brand"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold">p — transmisjonssannsynlighet per slot</span>
              <span className="font-mono text-brand">{p.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min={0.01}
              max={1}
              step={0.01}
              value={p}
              onChange={(e) => setP(Number(e.target.value))}
              className="w-full accent-brand"
            />
            <button
              type="button"
              onClick={() => setP(pStar)}
              className="mt-1 text-[11px] text-brand hover:underline"
            >
              Sett p = 1/N = {pStar.toFixed(3)} (optimalt for N={N})
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold">Antall slots å simulere</span>
              <span className="font-mono text-brand">{numSlots}</span>
            </div>
            <input
              type="range"
              min={20}
              max={200}
              step={10}
              value={numSlots}
              onChange={(e) => setNumSlots(Number(e.target.value))}
              className="w-full accent-brand"
            />
          </div>
        </div>

        <aside className="p-4 text-sm flex flex-col gap-3 bg-background">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Effektivitet
            </div>
            <div className="text-[11px] text-muted-foreground mb-1">
              Teoretisk: <span className="font-mono">Np(1−p)^(N−1)</span>
            </div>
            <div className="font-mono text-base">
              <span className="text-foreground">teori: </span>
              <span className="font-semibold text-brand">{theoreticalEff.toFixed(3)}</span>
              <span className="text-muted-foreground"> · </span>
              <span className="text-foreground">målt: </span>
              <span className="font-semibold">{observedEff.toFixed(3)}</span>
            </div>
          </div>
          <div className="text-[11px] leading-relaxed text-muted-foreground">
            <div>
              Optimalt p = 1/N = <span className="font-mono">{pStar.toFixed(3)}</span> →
              effektivitet <span className="font-mono">{effAtPStar.toFixed(3)}</span>.
            </div>
            <div className="mt-1">
              For N → ∞ konvergerer maks-effektivitet mot{" "}
              <span className="font-mono">1/e ≈ {oneOverE.toFixed(3)}</span>. Slotted
              ALOHA klarer altså i beste fall ~37% kanalutnyttelse.
            </div>
          </div>
        </aside>
      </div>

      <div className="border-t border-border p-4 bg-muted/10">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          Slot-by-slot (S = suksess, E = tom, C = kollisjon)
        </div>
        <div className="flex flex-wrap gap-[3px]">
          {slots.map((k, i) => (
            <SlotBox key={i} kind={k} index={i + 1} />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-2 py-1">
            <span className="font-mono font-semibold">S</span> suksess: {counts.s}
          </div>
          <div className="rounded-md bg-muted border border-border px-2 py-1 text-muted-foreground">
            <span className="font-mono font-semibold">E</span> tom: {counts.e}
          </div>
          <div className="rounded-md bg-red-500/10 border border-red-500/30 text-red-600 px-2 py-1">
            <span className="font-mono font-semibold">C</span> kollisjon: {counts.c}
          </div>
        </div>
      </div>

      <div className="border-t border-border p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          Effektivitet som funksjon av p (for N = {N})
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curve} margin={{ top: 10, right: 10, bottom: 16, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="p"
                type="number"
                domain={[0, 1]}
                tick={{ fontSize: 10 }}
                tickFormatter={(v: number) => v.toFixed(1)}
                label={{ value: "p", position: "insideBottom", offset: -8, fontSize: 11 }}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                domain={[0, 0.5]}
                label={{ value: "effektivitet", angle: -90, position: "insideLeft", offset: 12, fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{ fontSize: 11 }}
                formatter={(v: number) => v.toFixed(3)}
                labelFormatter={(v: number) => `p = ${v.toFixed(2)}`}
              />
              <ReferenceLine
                y={oneOverE}
                stroke="#10b981"
                strokeDasharray="3 3"
                label={{ value: "1/e", position: "right", fontSize: 10, fill: "#10b981" }}
              />
              <ReferenceLine
                x={pStar}
                stroke="#f97316"
                strokeDasharray="3 3"
                label={{ value: "p* = 1/N", fontSize: 10, fill: "#f97316" }}
              />
              <ReferenceLine
                x={p}
                stroke="#3b82f6"
                strokeDasharray="2 2"
                label={{ value: "ditt p", fontSize: 10, fill: "#3b82f6" }}
              />
              <Line
                type="monotone"
                dataKey="eff"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SlotBox({ kind, index }: { kind: SlotKind; index: number }) {
  const cls =
    kind === "success"
      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/50"
      : kind === "empty"
      ? "bg-muted text-muted-foreground border-border"
      : "bg-red-500/20 text-red-600 border-red-500/50";
  const ch = kind === "success" ? "S" : kind === "empty" ? "E" : "C";
  return (
    <div
      title={`Slot ${index}: ${kind}`}
      className={`w-6 h-6 rounded-sm border text-[10px] font-mono font-semibold flex items-center justify-center ${cls}`}
    >
      {ch}
    </div>
  );
}
