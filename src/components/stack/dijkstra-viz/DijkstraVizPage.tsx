import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

type Node = { id: string; x: number; y: number };
type Edge = { from: string; to: string; weight: number };

const INITIAL_NODES: Node[] = [
  { id: "A", x: 100, y: 80 },
  { id: "B", x: 280, y: 50 },
  { id: "C", x: 460, y: 100 },
  { id: "D", x: 120, y: 220 },
  { id: "E", x: 320, y: 240 },
  { id: "F", x: 500, y: 230 },
];
const INITIAL_EDGES: Edge[] = [
  { from: "A", to: "B", weight: 4 },
  { from: "A", to: "D", weight: 2 },
  { from: "B", to: "C", weight: 3 },
  { from: "B", to: "E", weight: 5 },
  { from: "D", to: "E", weight: 1 },
  { from: "E", to: "C", weight: 2 },
  { from: "E", to: "F", weight: 6 },
  { from: "C", to: "F", weight: 4 },
];

type DStep = {
  visited: Set<string>;
  dist: Map<string, number>;
  prev: Map<string, string | null>;
  current: string | null;
  relaxing: { from: string; to: string } | null;
  description: string;
};

function dijkstraSteps(nodes: Node[], edges: Edge[], source: string): DStep[] {
  const steps: DStep[] = [];
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();
  for (const n of nodes) {
    dist.set(n.id, Infinity);
    prev.set(n.id, null);
  }
  dist.set(source, 0);

  // Build adjacency. Treat graph as undirected for simplicity.
  const adj = new Map<string, { to: string; w: number }[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) {
    adj.get(e.from)?.push({ to: e.to, w: e.weight });
    adj.get(e.to)?.push({ to: e.from, w: e.weight });
  }

  steps.push({
    visited: new Set(visited),
    dist: new Map(dist),
    prev: new Map(prev),
    current: null,
    relaxing: null,
    description: `Start: dist[${source}] = 0, alle andre = ∞.`,
  });

  while (visited.size < nodes.length) {
    let u: string | null = null;
    let best = Infinity;
    for (const n of nodes) {
      if (!visited.has(n.id) && dist.get(n.id)! < best) {
        best = dist.get(n.id)!;
        u = n.id;
      }
    }
    if (u === null || best === Infinity) break;
    visited.add(u);
    steps.push({
      visited: new Set(visited),
      dist: new Map(dist),
      prev: new Map(prev),
      current: u,
      relaxing: null,
      description: `Velg ${u} (dist = ${best}) — det er den ubesøkte noden med lavest dist.`,
    });
    for (const { to, w } of adj.get(u) ?? []) {
      if (visited.has(to)) continue;
      const alt = dist.get(u)! + w;
      const before = dist.get(to)!;
      const relaxed = alt < before;
      if (relaxed) {
        dist.set(to, alt);
        prev.set(to, u);
      }
      steps.push({
        visited: new Set(visited),
        dist: new Map(dist),
        prev: new Map(prev),
        current: u,
        relaxing: { from: u, to },
        description: relaxed
          ? `Relax ${u}→${to}: ${before === Infinity ? "∞" : before} → ${alt} (oppdatert).`
          : `Relax ${u}→${to}: ${alt} ≥ ${before}, beholder ${before === Infinity ? "∞" : before}.`,
      });
    }
  }

  steps.push({
    visited: new Set(visited),
    dist: new Map(dist),
    prev: new Map(prev),
    current: null,
    relaxing: null,
    description: "Ferdig. Tabellen viser korteste avstand fra start til hver node.",
  });
  return steps;
}

export function DijkstraVizPage() {
  const [nodes] = useState(INITIAL_NODES);
  const [edges] = useState(INITIAL_EDGES);
  const [source, setSource] = useState("A");
  const [step, setStep] = useState(0);

  const steps = useMemo(() => dijkstraSteps(nodes, edges, source), [nodes, edges, source]);
  const s = steps[Math.min(step, steps.length - 1)];

  function reset() {
    setStep(0);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Dijkstra — korteste vei
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Step gjennom Dijkstra på en uvektet graf. Se hvilke noder som
            besøkes, hvilke kanter som relaxes, og hvordan avstandsestimat
            oppdateres.
          </p>
        </header>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border">
            {s.description}
          </div>
          <GraphSvg nodes={nodes} edges={edges} step={s} source={source} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <DistTable nodes={nodes} step={s} />
          <PrevTable nodes={nodes} step={s} source={source} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Forrige
          </Button>
          <Button
            size="sm"
            onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            disabled={step >= steps.length - 1}
          >
            Neste <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Steg {step + 1} / {steps.length}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Start:</label>
            <select
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setStep(0);
              }}
              className="h-7 rounded border border-border bg-background px-2 text-xs"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.id}
                </option>
              ))}
            </select>
            <Button size="sm" variant="outline" onClick={reset} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Til start
            </Button>
          </div>
        </div>

        <Lessons />
      </main>
    </div>
  );
}

function GraphSvg({
  nodes,
  edges,
  step,
  source,
}: {
  nodes: Node[];
  edges: Edge[];
  step: DStep;
  source: string;
}) {
  const W = 600;
  const H = 300;
  const posOf = new Map(nodes.map((n) => [n.id, n]));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {edges.map((e, i) => {
        const a = posOf.get(e.from)!;
        const b = posOf.get(e.to)!;
        const inShortestPath = isOnShortestPath(step, e);
        const isRelaxing =
          step.relaxing &&
          ((step.relaxing.from === e.from && step.relaxing.to === e.to) ||
            (step.relaxing.from === e.to && step.relaxing.to === e.from));

        const cls = isRelaxing
          ? "stroke-amber-500"
          : inShortestPath
            ? "stroke-brand"
            : "stroke-muted-foreground/40";
        const width = isRelaxing ? 3 : inShortestPath ? 2.5 : 1.5;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        return (
          <g key={i}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={cls} strokeWidth={width} />
            <rect x={mx - 11} y={my - 9} width={22} height={18} rx={4} className="fill-card stroke-border" strokeWidth={1} />
            <text x={mx} y={my + 4} textAnchor="middle" className="fill-foreground text-[11px] tabular-nums">
              {e.weight}
            </text>
          </g>
        );
      })}
      {nodes.map((n) => {
        const isVisited = step.visited.has(n.id);
        const isCurrent = step.current === n.id;
        const isSource = source === n.id;
        const d = step.dist.get(n.id)!;
        return (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={20}
              className={
                isCurrent
                  ? "fill-amber-500/30 stroke-amber-500"
                  : isVisited
                    ? "fill-brand/20 stroke-brand"
                    : isSource
                      ? "fill-success/10 stroke-success"
                      : "fill-card stroke-foreground/40"
              }
              strokeWidth={2}
            />
            <text x={n.x} y={n.y + 4} textAnchor="middle" className="fill-foreground text-sm font-mono font-semibold">
              {n.id}
            </text>
            <text x={n.x} y={n.y - 26} textAnchor="middle" className="fill-muted-foreground text-[10px] tabular-nums">
              {d === Infinity ? "∞" : d}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function isOnShortestPath(step: DStep, e: Edge): boolean {
  const fromPrev = step.prev.get(e.to);
  const toPrev = step.prev.get(e.from);
  return fromPrev === e.from || toPrev === e.to;
}

function DistTable({ nodes, step }: { nodes: Node[]; step: DStep }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        Distance
      </div>
      <div className="grid grid-cols-3 gap-1 text-xs">
        {nodes.map((n) => {
          const d = step.dist.get(n.id)!;
          const visited = step.visited.has(n.id);
          return (
            <div
              key={n.id}
              className={`rounded border px-2 py-1 ${
                visited ? "border-brand/40 bg-brand/5" : "border-border bg-background"
              }`}
            >
              <span className="font-mono font-semibold">{n.id}</span>
              <span className="text-muted-foreground ml-1">→</span>
              <span className="font-mono tabular-nums ml-1">
                {d === Infinity ? "∞" : d}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PrevTable({
  nodes,
  step,
  source,
}: {
  nodes: Node[];
  step: DStep;
  source: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        Forgjenger
      </div>
      <div className="grid grid-cols-3 gap-1 text-xs">
        {nodes.map((n) => {
          const p = step.prev.get(n.id);
          return (
            <div key={n.id} className="rounded border border-border bg-background px-2 py-1">
              <span className="font-mono font-semibold">{n.id}</span>
              <span className="text-muted-foreground ml-1">←</span>
              <span className="font-mono ml-1">
                {n.id === source ? "—" : p ?? "?"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Lessons() {
  return (
    <section className="mt-8 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Hvorfor Dijkstra funker</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li>
          <strong className="text-foreground">Grådig valg:</strong> noden med
          lavest tentativ dist er ferdig — den kan ikke forbedres senere,
          fordi alle andre veier dit må gå via en høyere-dist node og
          vektene er ≥ 0.
        </li>
        <li>
          <strong className="text-foreground">Krever ikke-negative vekter.</strong>{" "}
          Med negative vekter kan en lengre vei plutselig bli kortere senere
          — bruk Bellman-Ford i stedet.
        </li>
        <li>
          Tidskompleksitet med min-heap:{" "}
          <code className="font-mono">O((V + E) log V)</code>. Med Fibonacci-
          heap:{" "}
          <code className="font-mono">O(E + V log V)</code>.
        </li>
        <li>
          <strong className="text-foreground">BFS</strong> er Dijkstra med
          alle vekter = 1. <strong className="text-foreground">A*</strong>{" "}
          er Dijkstra pluss en heuristikk som styrer søket mot målet raskere.
        </li>
      </ul>
    </section>
  );
}
