import { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

/**
 * OrderEncoding — TSP med 8 byer.
 *
 * Kromosom = permutasjon av [0..7] (rekkefølge byer besøkes).
 * Fitness = -total reise-distanse (vi minimerer distansen).
 *
 * Crossover = ORDER CROSSOVER (OX):
 *   - velg et segment fra forelder A
 *   - fyll resten i rekkefølge fra forelder B, hoppe over byer som finnes i segmentet
 *   - garanterer gyldig permutasjon
 *
 * Mutation = SWAP: bytt to byer i ruten.
 *
 * Pedagogisk poeng: hvis du bruker one-point crossover på en permutasjon
 * får du gjerne duplikater og mangler — ugyldig rute! Spesialisert OX
 * trengs for å bevare permutasjons-invarianten.
 */

const CITIES = [
  { name: "A", x: 80, y: 60 },
  { name: "B", x: 200, y: 30 },
  { name: "C", x: 320, y: 80 },
  { name: "D", x: 380, y: 200 },
  { name: "E", x: 300, y: 320 },
  { name: "F", x: 170, y: 350 },
  { name: "G", x: 60, y: 290 },
  { name: "H", x: 40, y: 170 },
];
const N = CITIES.length;
const POP = 8;

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function tourLen(perm: number[]): number {
  let s = 0;
  for (let i = 0; i < perm.length; i++) {
    const a = CITIES[perm[i]];
    const b = CITIES[perm[(i + 1) % perm.length]];
    s += dist(a, b);
  }
  return s;
}

type Ind = { perm: number[]; len: number; flash?: "cross-seg" | "mut-swap" | null; segStart?: number; segEnd?: number; swapA?: number; swapB?: number };

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function shuffle(arr: number[], rand: () => number): number[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randInd(rand: () => number): Ind {
  const perm = shuffle(Array.from({ length: N }, (_, i) => i), rand);
  return { perm, len: tourLen(perm) };
}

// ORDER CROSSOVER (OX)
function orderCrossover(a: number[], b: number[], rand: () => number): { child: number[]; segStart: number; segEnd: number } {
  const n = a.length;
  // pick segment [i, j)
  let i = Math.floor(rand() * n);
  let j = Math.floor(rand() * n);
  if (i > j) [i, j] = [j, i];
  if (i === j) j = Math.min(n, j + 2);
  const segment = a.slice(i, j);
  const segSet = new Set(segment);
  const rest: number[] = [];
  // fill from b in order, starting after j (wrap)
  for (let k = 0; k < n; k++) {
    const idx = (j + k) % n;
    if (!segSet.has(b[idx])) rest.push(b[idx]);
  }
  const child = new Array<number>(n);
  for (let k = i; k < j; k++) child[k] = a[k];
  let r = 0;
  for (let k = j; k < n + j; k++) {
    const pos = k % n;
    if (pos >= i && pos < j) continue;
    child[pos] = rest[r++];
  }
  return { child, segStart: i, segEnd: j };
}

function swapMutate(perm: number[], rand: () => number): { perm: number[]; a: number; b: number } {
  const out = perm.slice();
  const a = Math.floor(rand() * perm.length);
  let b = Math.floor(rand() * perm.length);
  while (b === a) b = Math.floor(rand() * perm.length);
  [out[a], out[b]] = [out[b], out[a]];
  return { perm: out, a, b };
}

// A naive "one-point" crossover for the educational demo —
// shows duplicates/missing.
function naiveOnePoint(a: number[], b: number[], rand: () => number): { child: number[]; missing: number[]; duplicates: number[] } {
  const n = a.length;
  const point = 1 + Math.floor(rand() * (n - 1));
  const child = [...a.slice(0, point), ...b.slice(point)];
  const count = new Map<number, number>();
  for (const c of child) count.set(c, (count.get(c) || 0) + 1);
  const duplicates: number[] = [];
  const missing: number[] = [];
  for (let i = 0; i < n; i++) {
    const c = count.get(i) || 0;
    if (c > 1) duplicates.push(i);
    if (c === 0) missing.push(i);
  }
  return { child, duplicates, missing };
}

export function OrderEncoding() {
  const [seed, setSeed] = useState(11);
  const [pop, setPop] = useState<Ind[]>(() => {
    const r = lcg(11);
    return Array.from({ length: POP }, () => randInd(r));
  });
  const [gen, setGen] = useState(0);
  const [history, setHistory] = useState<{ gen: number; best: number }[]>([]);
  const [parentA, setParentA] = useState(0);
  const [parentB, setParentB] = useState(1);
  const [child, setChild] = useState<Ind | null>(null);
  const [showNaive, setShowNaive] = useState(false);
  const [naiveResult, setNaiveResult] = useState<{ child: number[]; duplicates: number[]; missing: number[] } | null>(null);
  const [running, setRunning] = useState(false);
  const randRef = useRef(lcg(11));
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    randRef.current = lcg(seed);
    const initial = Array.from({ length: POP }, () => randInd(randRef.current));
    setPop(initial);
    setGen(0);
    setChild(null);
    setNaiveResult(null);
    setHistory([{ gen: 0, best: Math.min(...initial.map((i) => i.len)) }]);
  }, [seed]);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const doCrossover = () => {
    const { child: c, segStart, segEnd } = orderCrossover(pop[parentA].perm, pop[parentB].perm, randRef.current);
    setChild({ perm: c, len: tourLen(c), flash: "cross-seg", segStart, segEnd });
    setNaiveResult(null);
  };
  const doNaive = () => {
    const r = naiveOnePoint(pop[parentA].perm, pop[parentB].perm, randRef.current);
    setNaiveResult(r);
  };
  const doMutate = () => {
    if (!child) return;
    const { perm: p, a, b } = swapMutate(child.perm, randRef.current);
    setChild({ perm: p, len: tourLen(p), flash: "mut-swap", swapA: a, swapB: b });
  };

  const evolveOnce = () => {
    const sorted = [...pop].sort((a, b) => a.len - b.len);
    const next: Ind[] = [sorted[0], sorted[1]];
    while (next.length < POP) {
      const tour = () => {
        const a = pop[Math.floor(randRef.current() * POP)];
        const b = pop[Math.floor(randRef.current() * POP)];
        return a.len < b.len ? a : b;
      };
      const p1 = tour(), p2 = tour();
      const { child: c } = orderCrossover(p1.perm, p2.perm, randRef.current);
      let final = c;
      if (randRef.current() < 0.3) {
        const { perm } = swapMutate(c, randRef.current);
        final = perm;
      }
      next.push({ perm: final, len: tourLen(final) });
    }
    setPop(next);
    setGen((g) => g + 1);
    setHistory((h) => [...h.slice(-100), { gen: gen + 1, best: Math.min(...next.map((i) => i.len)) }]);
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

  const sorted = useMemo(() => [...pop].sort((a, b) => a.len - b.len), [pop]);
  const best = sorted[0];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/5 p-3 text-sm">
        <strong>Order encoding — TSP (Traveling Salesman).</strong> Kromosom = permutasjon av byer
        <code className="font-mono"> [0..7]</code>. Vi minimerer total rute-distanse.{" "}
        <strong>Crossover</strong> = Order Crossover (OX) — bevarer permutasjons-invarianten.{" "}
        <strong>Mutation</strong> = swap to byer.
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-xs font-semibold mb-2">Foreldre + barn (ruter på kart)</div>
          <div className="grid grid-cols-3 gap-2">
            <RouteMap title={`A #${parentA}`} perm={pop[parentA].perm} stroke="#3b82f6" segStart={undefined} segEnd={undefined} />
            <RouteMap title={`B #${parentB}`} perm={pop[parentB].perm} stroke="#a855f7" />
            <RouteMap title={child ? "Barn" : "—"} perm={child?.perm ?? null} stroke="#22c55e" segStart={child?.flash === "cross-seg" ? child.segStart : undefined} segEnd={child?.flash === "cross-seg" ? child.segEnd : undefined} swapA={child?.flash === "mut-swap" ? child.swapA : undefined} swapB={child?.flash === "mut-swap" ? child.swapB : undefined} />
          </div>
          <div className="mt-3 text-xs space-y-1 font-mono">
            <div><span className="text-blue-400">A:</span> {pop[parentA].perm.map((c) => CITIES[c].name).join(" → ")} (len {pop[parentA].len.toFixed(0)})</div>
            <div><span className="text-purple-400">B:</span> {pop[parentB].perm.map((c) => CITIES[c].name).join(" → ")} (len {pop[parentB].len.toFixed(0)})</div>
            {child && (
              <div><span className="text-emerald-400">Barn:</span> {child.perm.map((c) => CITIES[c].name).join(" → ")} (len {child.len.toFixed(0)})</div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="text-xs font-semibold mb-2">Manuell crossover + mutation</div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <ParentPick label="A" value={parentA} onChange={setParentA} pop={pop} />
              <ParentPick label="B" value={parentB} onChange={setParentB} pop={pop} />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={doCrossover} className="px-3 py-1.5 text-xs rounded bg-brand text-brand-foreground">Crossover (OX)</button>
              <button type="button" onClick={doMutate} disabled={!child} className="px-3 py-1.5 text-xs rounded bg-amber-500 text-white disabled:opacity-30">Mutation (swap)</button>
              <button type="button" onClick={() => { setChild(null); setNaiveResult(null); }} className="px-3 py-1.5 text-xs rounded border border-border text-muted-foreground">Reset barn</button>
            </div>
          </div>

          <div className="rounded-xl border border-rose-400/30 bg-rose-400/5 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-rose-300">Hva hvis du bruker binary crossover?</div>
              <button type="button" onClick={() => setShowNaive((v) => !v)} className="px-2 py-1 text-xs rounded border border-border text-muted-foreground">
                {showNaive ? "Skjul" : "Vis"}
              </button>
            </div>
            {showNaive && (
              <div className="text-xs space-y-2">
                <button type="button" onClick={doNaive} className="px-2 py-1 text-xs rounded bg-rose-500 text-white">Kjør one-point crossover (gal!)</button>
                {naiveResult && (
                  <div className="space-y-1">
                    <div className="font-mono">
                      Barn: {naiveResult.child.map((c) => CITIES[c].name).join(" → ")}
                    </div>
                    {naiveResult.duplicates.length > 0 && (
                      <div className="text-rose-300">Duplikater: {naiveResult.duplicates.map((d) => CITIES[d].name).join(", ")}</div>
                    )}
                    {naiveResult.missing.length > 0 && (
                      <div className="text-rose-300">Mangler byer: {naiveResult.missing.map((m) => CITIES[m].name).join(", ")}</div>
                    )}
                    {naiveResult.duplicates.length === 0 && naiveResult.missing.length === 0 ? (
                      <div className="text-emerald-300">(Tilfeldigvis gyldig denne gangen — sjelden!)</div>
                    ) : (
                      <div className="text-rose-200">→ UGYLDIG rute. Derfor trenger TSP en spesialisert OX.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs font-semibold">Auto-evolusjon</div>
              <div className="flex gap-1">
                <button type="button" onClick={evolveOnce} disabled={running} className="px-2 py-1 text-xs rounded bg-brand text-brand-foreground disabled:opacity-40">Neste</button>
                <button type="button" onClick={runMany} className="px-2 py-1 text-xs rounded bg-muted">{running ? "Stopp" : "Kjør 30"}</button>
                <button type="button" onClick={() => setSeed((s) => s + 1)} className="px-2 py-1 text-xs rounded border border-border text-muted-foreground">Reset</button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              Gen <span className="font-mono">{gen}</span> · korteste rute ={" "}
              <span className="font-mono text-emerald-400">{best.len.toFixed(0)}</span>
            </div>
            <div style={{ width: "100%", height: 100 }}>
              <ResponsiveContainer>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="gen" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} labelFormatter={(g) => `Gen ${g}`} />
                  <Line type="monotone" dataKey="best" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} name="Korteste" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Hvorfor order encoding?</strong> For schedulering, TSP,
        ressurs-allokering der løsningen er en rekkefølge eller permutasjon. Vanlig crossover
        ødelegger invariantene — derfor må vi finne på en operator (OX, PMX, cycle crossover)
        som garanterer gyldig output. Pris: mer komplisert implementasjon.
      </div>
    </div>
  );
}

function RouteMap({ title, perm, stroke, segStart, segEnd, swapA, swapB }: { title: string; perm: number[] | null; stroke: string; segStart?: number; segEnd?: number; swapA?: number; swapB?: number }) {
  return (
    <div className="border border-border bg-background rounded p-1">
      <div className="text-[10px] text-muted-foreground text-center mb-0.5">{title}</div>
      <svg viewBox="0 0 420 400" className="w-full h-auto">
        {perm &&
          perm.map((c, i) => {
            const a = CITIES[c];
            const b = CITIES[perm[(i + 1) % perm.length]];
            const inSeg = segStart !== undefined && segEnd !== undefined && i >= segStart && i < segEnd;
            return (
              <line
                key={i}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={inSeg ? "#f59e0b" : stroke}
                strokeWidth={inSeg ? 3 : 1.5}
                opacity={0.85}
              />
            );
          })}
        {CITIES.map((c, i) => {
          const isSwap = swapA !== undefined && swapB !== undefined && perm && (perm[swapA] === i || perm[swapB] === i);
          return (
            <g key={i}>
              <circle cx={c.x} cy={c.y} r={isSwap ? 14 : 10} fill={isSwap ? "#f59e0b" : "white"} stroke="black" strokeWidth={1.5} />
              <text x={c.x} y={c.y + 4} textAnchor="middle" fontSize="12" fontWeight="bold">{c.name}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ParentPick({ label, value, onChange, pop }: { label: string; value: number; onChange: (i: number) => void; pop: Ind[] }) {
  return (
    <label className="block">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <select value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full px-2 py-1 text-xs rounded border border-border bg-background">
        {pop.map((p, i) => (
          <option key={i} value={i}>#{i} — len {p.len.toFixed(0)}</option>
        ))}
      </select>
    </label>
  );
}
