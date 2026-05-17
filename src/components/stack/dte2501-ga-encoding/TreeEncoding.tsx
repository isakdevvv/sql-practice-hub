import { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

/**
 * TreeEncoding — symbolic regression (genetic programming).
 *
 * Kromosom = uttrykks-tre (parse-tre) som kombinerer:
 *   - operatorer: + - * /
 *   - variabel: x
 *   - konstanter: 1, 2, 3, 5
 *
 * Target: y = x*x + 2*x  (vi later som vi ikke vet det)
 * Vi gir 7 datapunkter og evolverer trær som beste forklarer dem.
 *
 * Crossover = bytt subtrær mellom to foreldre.
 * Mutation = endre én node (operator eller terminal).
 *
 * Pedagogisk poeng: kromosomet har variabel STØRRELSE — ulik fra binary/real/order
 * der hver løsning har samme antall gener. Crossover er rekursivt på trestrukturen.
 */

type NodeT =
  | { kind: "op"; op: "+" | "-" | "*" | "/"; left: NodeT; right: NodeT }
  | { kind: "var" }
  | { kind: "const"; v: number };

const TARGET_POINTS = [-3, -2, -1, 0, 1, 2, 3].map((x) => ({ x, y: x * x + 2 * x }));
const POP = 8;
const MAX_DEPTH = 4;

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function randTerminal(rand: () => number): NodeT {
  if (rand() < 0.5) return { kind: "var" };
  const consts = [1, 2, 3, 5];
  return { kind: "const", v: consts[Math.floor(rand() * consts.length)] };
}

function randTree(depth: number, rand: () => number): NodeT {
  if (depth <= 0 || rand() < 0.3) return randTerminal(rand);
  const ops: ("+" | "-" | "*" | "/")[] = ["+", "-", "*", "/"];
  const op = ops[Math.floor(rand() * ops.length)];
  return { kind: "op", op, left: randTree(depth - 1, rand), right: randTree(depth - 1, rand) };
}

function clone(n: NodeT): NodeT {
  if (n.kind === "op") return { kind: "op", op: n.op, left: clone(n.left), right: clone(n.right) };
  return { ...n };
}

function evalTree(n: NodeT, x: number): number {
  if (n.kind === "var") return x;
  if (n.kind === "const") return n.v;
  const l = evalTree(n.left, x);
  const r = evalTree(n.right, x);
  if (n.op === "+") return l + r;
  if (n.op === "-") return l - r;
  if (n.op === "*") return l * r;
  // protected division
  if (Math.abs(r) < 1e-6) return 1;
  return l / r;
}

function fitness(n: NodeT): number {
  let s = 0;
  for (const { x, y } of TARGET_POINTS) {
    const py = evalTree(n, x);
    if (!isFinite(py)) return Infinity;
    s += (py - y) ** 2;
  }
  return s;
}

function size(n: NodeT): number {
  if (n.kind === "op") return 1 + size(n.left) + size(n.right);
  return 1;
}

function depth(n: NodeT): number {
  if (n.kind === "op") return 1 + Math.max(depth(n.left), depth(n.right));
  return 1;
}

function treeToString(n: NodeT): string {
  if (n.kind === "var") return "x";
  if (n.kind === "const") return String(n.v);
  return `(${treeToString(n.left)} ${n.op} ${treeToString(n.right)})`;
}

// Collect all nodes with path (so we can swap)
function nodePaths(n: NodeT, path: ("left" | "right")[] = [], acc: { node: NodeT; path: ("left" | "right")[] }[] = []) {
  acc.push({ node: n, path });
  if (n.kind === "op") {
    nodePaths(n.left, [...path, "left"], acc);
    nodePaths(n.right, [...path, "right"], acc);
  }
  return acc;
}

function replaceAtPath(root: NodeT, path: ("left" | "right")[], replacement: NodeT): NodeT {
  if (path.length === 0) return clone(replacement);
  const out = clone(root);
  let cur: NodeT = out;
  for (let i = 0; i < path.length - 1; i++) {
    if (cur.kind !== "op") return out;
    cur = path[i] === "left" ? cur.left : cur.right;
  }
  if (cur.kind !== "op") return out;
  const last = path[path.length - 1];
  const rep = clone(replacement);
  if (last === "left") cur.left = rep;
  else cur.right = rep;
  return out;
}

function subtreeCrossover(a: NodeT, b: NodeT, rand: () => number): { child: NodeT; pathA: ("left" | "right")[]; subFromB: NodeT } {
  const pathsA = nodePaths(a);
  const pathsB = nodePaths(b);
  const pa = pathsA[Math.floor(rand() * pathsA.length)];
  const pb = pathsB[Math.floor(rand() * pathsB.length)];
  const child = replaceAtPath(a, pa.path, pb.node);
  return { child, pathA: pa.path, subFromB: pb.node };
}

function nodeMutation(t: NodeT, rand: () => number): { tree: NodeT; mutPath: ("left" | "right")[] } {
  const paths = nodePaths(t);
  const target = paths[Math.floor(rand() * paths.length)];
  let replacement: NodeT;
  if (target.node.kind === "op") {
    // change operator
    const ops: ("+" | "-" | "*" | "/")[] = ["+", "-", "*", "/"];
    let op = ops[Math.floor(rand() * ops.length)];
    while (op === target.node.op) op = ops[Math.floor(rand() * ops.length)];
    replacement = { kind: "op", op, left: target.node.left, right: target.node.right };
  } else {
    replacement = randTerminal(rand);
  }
  const tree = replaceAtPath(t, target.path, replacement);
  return { tree, mutPath: target.path };
}

type Ind = { tree: NodeT; fit: number; mutPath?: ("left" | "right")[] | null };

function randInd(rand: () => number): Ind {
  let tree: NodeT;
  let attempts = 0;
  do {
    tree = randTree(MAX_DEPTH, rand);
    attempts++;
  } while (!isFinite(fitness(tree)) && attempts < 5);
  return { tree, fit: fitness(tree) };
}

export function TreeEncoding() {
  const [seed, setSeed] = useState(5);
  const [pop, setPop] = useState<Ind[]>(() => {
    const r = lcg(5);
    return Array.from({ length: POP }, () => randInd(r));
  });
  const [gen, setGen] = useState(0);
  const [history, setHistory] = useState<{ gen: number; best: number }[]>([]);
  const [parentA, setParentA] = useState(0);
  const [parentB, setParentB] = useState(1);
  const [child, setChild] = useState<Ind | null>(null);
  const [running, setRunning] = useState(false);
  const randRef = useRef(lcg(5));
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    randRef.current = lcg(seed);
    const initial = Array.from({ length: POP }, () => randInd(randRef.current));
    setPop(initial);
    setGen(0);
    setChild(null);
    setHistory([{ gen: 0, best: Math.min(...initial.map((i) => isFinite(i.fit) ? i.fit : 1e9)) }]);
  }, [seed]);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const doCrossover = () => {
    const { child: c } = subtreeCrossover(pop[parentA].tree, pop[parentB].tree, randRef.current);
    if (depth(c) > 7) {
      setChild({ tree: c, fit: fitness(c) });
      return;
    }
    setChild({ tree: c, fit: fitness(c) });
  };
  const doMutate = () => {
    if (!child) return;
    const { tree: t, mutPath } = nodeMutation(child.tree, randRef.current);
    setChild({ tree: t, fit: fitness(t), mutPath });
  };

  const evolveOnce = () => {
    const sorted = [...pop].sort((a, b) => a.fit - b.fit);
    const next: Ind[] = [sorted[0], sorted[1]];
    while (next.length < POP) {
      const tour = () => {
        const a = pop[Math.floor(randRef.current() * POP)];
        const b = pop[Math.floor(randRef.current() * POP)];
        return a.fit < b.fit ? a : b;
      };
      const p1 = tour(), p2 = tour();
      let { child: c } = subtreeCrossover(p1.tree, p2.tree, randRef.current);
      if (depth(c) > 6) c = clone(p1.tree); // bloat control
      if (randRef.current() < 0.4) {
        c = nodeMutation(c, randRef.current).tree;
      }
      next.push({ tree: c, fit: fitness(c) });
    }
    setPop(next);
    setGen((g) => g + 1);
    setHistory((h) => [...h.slice(-100), { gen: gen + 1, best: Math.min(...next.map((i) => isFinite(i.fit) ? i.fit : 1e9)) }]);
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

  const sorted = useMemo(() => [...pop].sort((a, b) => a.fit - b.fit), [pop]);
  const best = sorted[0];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/5 p-3 text-sm">
        <strong>Tree encoding — symbolic regression (genetic programming).</strong>{" "}
        Kromosom = uttrykks-tre med <code className="font-mono">+ − × ÷</code>, variabel{" "}
        <code className="font-mono">x</code> og konstanter <code className="font-mono">1,2,3,5</code>.
        Vi vil finne formelen bak datapunktene (skjult: <code className="font-mono">x² + 2x</code>).
        <strong> Crossover</strong> = bytt subtrær mellom to foreldre. <strong>Mutation</strong> = endre én node.
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-3 space-y-3">
          <div className="text-xs font-semibold">Foreldre og barn (trær)</div>
          <div className="space-y-2">
            <TreeBox title={`A #${parentA}`} ind={pop[parentA]} color="#3b82f6" />
            <TreeBox title={`B #${parentB}`} ind={pop[parentB]} color="#a855f7" />
            {child && <TreeBox title="Barn" ind={child} color="#22c55e" />}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <ParentPick label="A" value={parentA} onChange={setParentA} pop={pop} />
            <ParentPick label="B" value={parentB} onChange={setParentB} pop={pop} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={doCrossover} className="px-3 py-1.5 text-xs rounded bg-brand text-brand-foreground">Crossover (bytt subtre)</button>
            <button type="button" onClick={doMutate} disabled={!child} className="px-3 py-1.5 text-xs rounded bg-amber-500 text-white disabled:opacity-30">Mutation (endre node)</button>
            <button type="button" onClick={() => setChild(null)} className="px-3 py-1.5 text-xs rounded border border-border text-muted-foreground">Reset barn</button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="text-xs font-semibold mb-2">Datapunkter vs beste tre</div>
            <FitPlot best={best.tree} />
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
            <div className="text-xs text-muted-foreground mb-1">
              Gen <span className="font-mono">{gen}</span> · MSE ={" "}
              <span className="font-mono text-emerald-400">{best.fit.toFixed(2)}</span>
            </div>
            <div className="text-xs font-mono break-all mb-2">
              <span className="text-emerald-400">f(x) =</span> {treeToString(best.tree)}
            </div>
            <div style={{ width: "100%", height: 100 }}>
              <ResponsiveContainer>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="gen" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} labelFormatter={(g) => `Gen ${g}`} />
                  <Line type="monotone" dataKey="best" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} name="Beste MSE" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Hvorfor tree encoding?</strong> Når løsningen er en
        struktur med variabel størrelse: en formel, et lite program, en logikk-regel,
        en beslutningstre. Crossover på trær er rekursivt — bytt et hvilket som helst
        subtre mellom foreldre. <em>Bloat</em> (trærne vokser ukontrollert) er et
        kjent problem; bruk depth-grense eller parsimony pressure.
      </div>
    </div>
  );
}

function TreeBox({ title, ind, color }: { title: string; ind: Ind; color: string }) {
  return (
    <div className="border border-border rounded p-2">
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color }} className="font-semibold">{title}</span>
        <span className="text-muted-foreground">size {size(ind.tree)} · MSE {ind.fit.toFixed(2)}</span>
      </div>
      <div className="overflow-x-auto">
        <TreeSvg tree={ind.tree} color={color} mutPath={ind.mutPath ?? null} />
      </div>
      <div className="text-[10px] font-mono text-muted-foreground mt-1 break-all">{treeToString(ind.tree)}</div>
    </div>
  );
}

// Layout tree as SVG
function TreeSvg({ tree, color, mutPath }: { tree: NodeT; color: string; mutPath: ("left" | "right")[] | null }) {
  const layout = useMemo(() => layoutTree(tree, 0, 0, 1), [tree]);
  const w = (layout.maxX - layout.minX + 2) * 30;
  const h = (layout.maxY + 2) * 30;
  return (
    <svg viewBox={`${(layout.minX - 1) * 30} 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 140 }}>
      {layout.edges.map((e, i) => (
        <line key={`e-${i}`} x1={e.x1 * 30} y1={e.y1 * 30 + 15} x2={e.x2 * 30} y2={e.y2 * 30 + 15} stroke="#777" strokeWidth={1} />
      ))}
      {layout.nodes.map((n, i) => {
        const onMutPath = mutPath !== null && pathEquals(n.path, mutPath);
        return (
          <g key={`n-${i}`}>
            <circle cx={n.x * 30} cy={n.y * 30 + 15} r={onMutPath ? 13 : 11} fill={onMutPath ? "#f59e0b" : color} stroke="black" strokeWidth={1} opacity={0.9} />
            <text x={n.x * 30} y={n.y * 30 + 19} textAnchor="middle" fontSize="11" fontWeight="bold" fill="white">{n.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function pathEquals(a: ("left" | "right")[], b: ("left" | "right")[]) {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

function layoutTree(n: NodeT, depthLvl: number, leafX: number, _spread: number): { nodes: { x: number; y: number; label: string; path: ("left" | "right")[] }[]; edges: { x1: number; y1: number; x2: number; y2: number }[]; minX: number; maxX: number; maxY: number; nextLeaf: number } {
  const nodes: { x: number; y: number; label: string; path: ("left" | "right")[] }[] = [];
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  let minX = Infinity, maxX = -Infinity, maxY = 0;
  let nextLeaf = leafX;

  function visit(node: NodeT, depthLvl: number, path: ("left" | "right")[]): { x: number; y: number } {
    if (node.kind !== "op") {
      const x = nextLeaf++;
      const y = depthLvl;
      const label = node.kind === "var" ? "x" : String(node.v);
      nodes.push({ x, y, label, path });
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      return { x, y };
    }
    const l = visit(node.left, depthLvl + 1, [...path, "left"]);
    const r = visit(node.right, depthLvl + 1, [...path, "right"]);
    const x = (l.x + r.x) / 2;
    const y = depthLvl;
    nodes.push({ x, y, label: node.op, path });
    edges.push({ x1: x, y1: y, x2: l.x, y2: l.y });
    edges.push({ x1: x, y1: y, x2: r.x, y2: r.y });
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    return { x, y };
  }
  visit(n, 0, []);
  return { nodes, edges, minX, maxX, maxY, nextLeaf };
}

function FitPlot({ best }: { best: NodeT }) {
  const xs: number[] = [];
  for (let x = -3.5; x <= 3.5; x += 0.25) xs.push(x);
  const data = xs.map((x) => ({
    x,
    pred: evalTree(best, x),
  }));
  const target = TARGET_POINTS;
  // Build combined plot via two series — we use scatter via dot in line.
  return (
    <div style={{ width: "100%", height: 160 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
          <XAxis dataKey="x" tick={{ fontSize: 10 }} type="number" domain={[-3.5, 3.5]} />
          <YAxis tick={{ fontSize: 10 }} domain={[-5, 20]} />
          <Tooltip contentStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="pred" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} name="Predikert" />
          {/* Target points drawn as small circles overlay */}
          <Line
            data={target as unknown as { x: number; y: number }[]}
            type="monotone"
            dataKey="y"
            stroke="#3b82f6"
            strokeDasharray="3 3"
            dot={{ r: 4, fill: "#3b82f6" }}
            name="Target"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ParentPick({ label, value, onChange, pop }: { label: string; value: number; onChange: (i: number) => void; pop: Ind[] }) {
  return (
    <label className="block">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <select value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full px-2 py-1 text-xs rounded border border-border bg-background">
        {pop.map((p, i) => (
          <option key={i} value={i}>#{i} — MSE {p.fit.toFixed(2)}</option>
        ))}
      </select>
    </label>
  );
}
