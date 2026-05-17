import { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

/**
 * BinaryEncoding — knapsack 0/1 problem
 *
 * 10 items, hver med vekt og verdi. Et kromosom = bit-streng [b0..b9],
 * der bi = 1 betyr item i er pakket. Sekken har vekt-grense W.
 *
 * Fitness = sum(verdi) hvis sum(vekt) <= W, ellers 0 (ugyldig).
 *
 * Crossover = one-point (splitt indeks k, bytt halene).
 * Mutation = flip ett enkelt bit.
 *
 * Pedagogisk poeng: binary er rett-frem, men ugyldige løsninger (overvekt)
 * kan oppstå — fitness-funksjonen håndterer det med straff.
 */

const ITEMS = [
  { name: "Telt", weight: 12, value: 25 },
  { name: "Sovepose", weight: 6, value: 18 },
  { name: "Mat", weight: 8, value: 30 },
  { name: "Vannflaske", weight: 3, value: 14 },
  { name: "Lommekniv", weight: 1, value: 6 },
  { name: "Kart", weight: 1, value: 9 },
  { name: "Hodelykt", weight: 1, value: 8 },
  { name: "Førstehjelp", weight: 2, value: 12 },
  { name: "Kamera", weight: 4, value: 20 },
  { name: "Bok", weight: 5, value: 4 },
];
const W_MAX = 20;
const POP = 8;
const N = ITEMS.length;

type Ind = { bits: number[]; fitness: number; weight: number; flash?: "cross" | "mut" | "parentA" | "parentB" | null; mutIdx?: number; crossPoint?: number };

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function evalInd(bits: number[]): { fitness: number; weight: number } {
  let v = 0, w = 0;
  for (let i = 0; i < bits.length; i++) {
    if (bits[i]) {
      v += ITEMS[i].value;
      w += ITEMS[i].weight;
    }
  }
  if (w > W_MAX) return { fitness: 0, weight: w };
  return { fitness: v, weight: w };
}

function randInd(rand: () => number): Ind {
  const bits = Array.from({ length: N }, () => (rand() < 0.3 ? 1 : 0));
  return { bits, ...evalInd(bits) };
}

export function BinaryEncoding() {
  const [seed, setSeed] = useState(7);
  const [pop, setPop] = useState<Ind[]>(() => {
    const r = lcg(7);
    return Array.from({ length: POP }, () => randInd(r));
  });
  const [gen, setGen] = useState(0);
  const [history, setHistory] = useState<{ gen: number; best: number }[]>([{ gen: 0, best: 0 }]);
  const [parentA, setParentA] = useState(0);
  const [parentB, setParentB] = useState(1);
  const [child, setChild] = useState<Ind | null>(null);
  const [running, setRunning] = useState(false);
  const randRef = useRef(lcg(7));
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    randRef.current = lcg(seed);
    const initial = Array.from({ length: POP }, () => randInd(randRef.current));
    setPop(initial);
    setGen(0);
    setChild(null);
    setHistory([{ gen: 0, best: Math.max(...initial.map((i) => i.fitness)) }]);
  }, [seed]);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const doCrossover = () => {
    const a = pop[parentA].bits;
    const b = pop[parentB].bits;
    const point = 1 + Math.floor(randRef.current() * (N - 1));
    const cbits = [...a.slice(0, point), ...b.slice(point)];
    const ev = evalInd(cbits);
    setChild({ bits: cbits, ...ev, flash: "cross", crossPoint: point });
  };

  const doMutate = () => {
    if (!child) return;
    const idx = Math.floor(randRef.current() * N);
    const cbits = child.bits.slice();
    cbits[idx] = 1 - cbits[idx];
    const ev = evalInd(cbits);
    setChild({ bits: cbits, ...ev, flash: "mut", mutIdx: idx });
  };

  const evolveOnce = () => {
    // tournament select 2, crossover, mutate, replace worst with child if better
    const sorted = [...pop].sort((a, b) => b.fitness - a.fitness);
    const next: Ind[] = [sorted[0], sorted[1]]; // elitism
    while (next.length < POP) {
      const a = pop[Math.floor(randRef.current() * POP)];
      const b = pop[Math.floor(randRef.current() * POP)];
      const winA = a.fitness > b.fitness ? a : b;
      const c = pop[Math.floor(randRef.current() * POP)];
      const d = pop[Math.floor(randRef.current() * POP)];
      const winB = c.fitness > d.fitness ? c : d;
      const point = 1 + Math.floor(randRef.current() * (N - 1));
      const cbits = [...winA.bits.slice(0, point), ...winB.bits.slice(point)];
      for (let i = 0; i < N; i++) if (randRef.current() < 0.05) cbits[i] = 1 - cbits[i];
      const ev = evalInd(cbits);
      next.push({ bits: cbits, ...ev });
    }
    setPop(next);
    setGen((g) => g + 1);
    setHistory((h) => [...h.slice(-100), { gen: gen + 1, best: Math.max(...next.map((i) => i.fitness)) }]);
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
      if (count < 30) timerRef.current = window.setTimeout(tick, 80);
      else {
        setRunning(false);
        timerRef.current = null;
      }
    };
    timerRef.current = window.setTimeout(tick, 80);
  };

  const sorted = useMemo(() => [...pop].sort((a, b) => b.fitness - a.fitness), [pop]);
  const best = sorted[0];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/5 p-3 text-sm">
        <strong>Binary encoding — knapsack 0/1.</strong> Hvert kromosom er en 10-bits streng.
        Bit <code className="font-mono">i = 1</code> betyr item <em>i</em> er i sekken. Vekt-grense{" "}
        <code className="font-mono">{W_MAX} kg</code>. Fitness = total verdi (0 hvis overvekt).
      </div>

      {/* Items table */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-xs font-semibold mb-2">Items (vekt → verdi)</div>
        <div className="grid grid-cols-5 gap-2 text-xs">
          {ITEMS.map((it, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5 p-2 rounded border border-border bg-background">
              <span className="text-[10px] text-muted-foreground">#{i}</span>
              <span className="font-medium">{it.name}</span>
              <span className="text-muted-foreground">{it.weight}kg → {it.value}p</span>
            </div>
          ))}
        </div>
      </div>

      {/* Parent selection + manual crossover */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="text-xs font-semibold">Manuell crossover + mutation (én generasjon)</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <ParentPicker label="Forelder A" value={parentA} onChange={setParentA} pop={pop} />
          <ParentPicker label="Forelder B" value={parentB} onChange={setParentB} pop={pop} />
        </div>

        <div className="space-y-1.5">
          <BitRow label={`A #${parentA}`} ind={pop[parentA]} color="blue" />
          <BitRow label={`B #${parentB}`} ind={pop[parentB]} color="purple" />
          {child && (
            <BitRow label="Barn" ind={child} color="emerald" />
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={doCrossover} className="px-3 py-1.5 text-xs rounded bg-brand text-brand-foreground">
            Crossover (one-point)
          </button>
          <button type="button" onClick={doMutate} disabled={!child} className="px-3 py-1.5 text-xs rounded bg-amber-500 text-white disabled:opacity-30">
            Mutation (flip 1 bit)
          </button>
          <button type="button" onClick={() => setChild(null)} className="px-3 py-1.5 text-xs rounded border border-border text-muted-foreground">
            Nullstill barn
          </button>
        </div>
        {child && child.flash === "cross" && (
          <div className="text-xs text-muted-foreground">
            Splittpunkt = <code className="font-mono">{child.crossPoint}</code>. Barn = A[0..{child.crossPoint}) ++ B[{child.crossPoint}..{N}).
          </div>
        )}
        {child && child.flash === "mut" && (
          <div className="text-xs text-muted-foreground">
            Mutert bit <code className="font-mono">#{child.mutIdx}</code> ({ITEMS[child.mutIdx!].name}).
          </div>
        )}
      </div>

      {/* Auto-evolution */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="text-xs font-semibold">Hele populasjonen (auto-evolusjon)</div>
          <div className="flex gap-2">
            <button type="button" onClick={evolveOnce} disabled={running} className="px-3 py-1.5 text-xs rounded bg-brand text-brand-foreground disabled:opacity-40">Neste gen</button>
            <button type="button" onClick={runMany} className="px-3 py-1.5 text-xs rounded bg-muted">{running ? "Stopp" : "Kjør 30 gen"}</button>
            <button type="button" onClick={() => setSeed((s) => s + 1)} className="px-3 py-1.5 text-xs rounded border border-border text-muted-foreground">Reset</button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Generasjon <span className="font-mono">{gen}</span> · best verdi{" "}
          <span className="font-mono text-emerald-400">{best?.fitness}</span> · vekt{" "}
          <span className="font-mono">{best?.weight}/{W_MAX} kg</span>
        </div>
        <div className="space-y-1">
          {sorted.map((ind, i) => (
            <BitRow key={i} label={`#${i + 1}`} ind={ind} color={ind.fitness === 0 ? "red" : "emerald"} compact />
          ))}
        </div>
        <div style={{ width: "100%", height: 140 }}>
          <ResponsiveContainer>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="gen" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} labelFormatter={(g) => `Gen ${g}`} />
              <Line type="monotone" dataKey="best" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} name="Beste fitness" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Hvorfor binary?</strong> Når hvert valg er ja/nei (item i sekken eller ikke,
        feature på/av, switch åpen/lukket) er bit-streng den naturlige representasjonen.
        One-point crossover blander to "innpakning-strategier". Klassisk eksamenseksempel.
      </div>
    </div>
  );
}

function ParentPicker({ label, value, onChange, pop }: { label: string; value: number; onChange: (i: number) => void; pop: Ind[] }) {
  return (
    <label className="block">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full px-2 py-1 text-xs rounded border border-border bg-background"
      >
        {pop.map((p, i) => (
          <option key={i} value={i}>#{i} — verdi {p.fitness}, vekt {p.weight}kg</option>
        ))}
      </select>
    </label>
  );
}

function BitRow({ label, ind, color, compact }: { label: string; ind: Ind; color: "blue" | "purple" | "emerald" | "red"; compact?: boolean }) {
  const colorMap = {
    blue: "bg-blue-500/30 text-blue-200 border-blue-400",
    purple: "bg-purple-500/30 text-purple-200 border-purple-400",
    emerald: "bg-emerald-500/30 text-emerald-200 border-emerald-400",
    red: "bg-red-500/30 text-red-200 border-red-400",
  } as const;
  const off = "bg-muted text-muted-foreground border-transparent";
  return (
    <div className="flex items-center gap-2 font-mono text-[11px]">
      <span className="text-muted-foreground w-12 shrink-0 text-right">{label}</span>
      <div className="flex gap-0.5">
        {ind.bits.map((b, i) => {
          const isMut = ind.flash === "mut" && ind.mutIdx === i;
          const isCross = ind.flash === "cross" && ind.crossPoint === i;
          return (
            <span
              key={i}
              className={`inline-block w-5 text-center rounded-sm border ${b ? colorMap[color] : off} ${
                isMut ? "ring-2 ring-amber-400 animate-pulse" : ""
              } ${isCross ? "border-l-2 border-l-amber-400" : ""}`}
              title={ITEMS[i].name}
            >
              {b}
            </span>
          );
        })}
      </div>
      {!compact && (
        <span className="ml-2 text-muted-foreground">
          verdi <span className={`font-semibold ${ind.fitness === 0 ? "text-red-400" : "text-emerald-400"}`}>{ind.fitness}</span>
          {" · "}vekt <span className={ind.weight > W_MAX ? "text-red-400" : ""}>{ind.weight}/{W_MAX}</span>
        </span>
      )}
      {compact && (
        <span className="ml-auto text-[10px] text-muted-foreground">
          {ind.fitness}p {ind.weight}kg
        </span>
      )}
    </div>
  );
}
