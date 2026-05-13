import { useMemo, useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeMouseHandler,
  type EdgeMouseHandler,
  MarkerType,
  type NodeProps,
  Handle,
  Position,
} from "@xyflow/react";
import { Play, RotateCcw, SkipForward } from "lucide-react";

type RouterId = "A" | "B" | "C" | "D" | "E" | "F";

type EdgeDef = { from: RouterId; to: RouterId; weight: number };

const INITIAL_EDGES: EdgeDef[] = [
  { from: "A", to: "B", weight: 2 },
  { from: "A", to: "C", weight: 5 },
  { from: "B", to: "C", weight: 1 },
  { from: "B", to: "D", weight: 4 },
  { from: "C", to: "D", weight: 2 },
  { from: "C", to: "E", weight: 6 },
  { from: "D", to: "E", weight: 1 },
  { from: "D", to: "F", weight: 3 },
  { from: "E", to: "F", weight: 2 },
];

const POSITIONS: Record<RouterId, { x: number; y: number }> = {
  A: { x: 0, y: 100 },
  B: { x: 160, y: 0 },
  C: { x: 160, y: 200 },
  D: { x: 320, y: 100 },
  E: { x: 320, y: 280 },
  F: { x: 480, y: 200 },
};

const ALL_NODES: RouterId[] = ["A", "B", "C", "D", "E", "F"];

type Algo = "dijkstra" | "bellman-ford";

type Step = {
  description: string;
  distances: Record<RouterId, number>;
  predecessors: Record<RouterId, RouterId | null>;
  visited: Set<RouterId>;
  current?: RouterId;
};

const INF = 9999;

// Step-by-step Dijkstra fra A
function dijkstraSteps(edges: EdgeDef[], source: RouterId): Step[] {
  const dist: Record<RouterId, number> = {} as Record<RouterId, number>;
  const pred: Record<RouterId, RouterId | null> = {} as Record<RouterId, RouterId | null>;
  for (const n of ALL_NODES) {
    dist[n] = INF;
    pred[n] = null;
  }
  dist[source] = 0;

  const visited = new Set<RouterId>();
  const steps: Step[] = [];
  steps.push({
    description: `Init: dist[${source}]=0, alle andre = ∞`,
    distances: { ...dist },
    predecessors: { ...pred },
    visited: new Set(visited),
  });

  while (visited.size < ALL_NODES.length) {
    // velg ubesokt node med minst dist
    let u: RouterId | null = null;
    let best = INF;
    for (const n of ALL_NODES) {
      if (!visited.has(n) && dist[n] < best) {
        best = dist[n];
        u = n;
      }
    }
    if (u === null) break;
    visited.add(u);

    // relaxe naboene
    const relaxed: string[] = [];
    for (const e of edges) {
      let neighbor: RouterId | null = null;
      if (e.from === u) neighbor = e.to;
      else if (e.to === u) neighbor = e.from;
      if (!neighbor || visited.has(neighbor)) continue;
      const alt = dist[u] + e.weight;
      if (alt < dist[neighbor]) {
        dist[neighbor] = alt;
        pred[neighbor] = u;
        relaxed.push(`${neighbor}=${alt}`);
      }
    }
    steps.push({
      description: `Velg ${u} (dist=${dist[u]}). Relax naboer: ${relaxed.length ? relaxed.join(", ") : "ingen oppdatering"}`,
      distances: { ...dist },
      predecessors: { ...pred },
      visited: new Set(visited),
      current: u,
    });
  }
  return steps;
}

// Bellman-Ford: |V|-1 iterasjoner, hver iterasjon relaxer alle kanter
function bellmanFordSteps(edges: EdgeDef[], source: RouterId): Step[] {
  const dist: Record<RouterId, number> = {} as Record<RouterId, number>;
  const pred: Record<RouterId, RouterId | null> = {} as Record<RouterId, RouterId | null>;
  for (const n of ALL_NODES) {
    dist[n] = INF;
    pred[n] = null;
  }
  dist[source] = 0;

  const steps: Step[] = [];
  steps.push({
    description: `Init: dist[${source}]=0, alle andre = ∞`,
    distances: { ...dist },
    predecessors: { ...pred },
    visited: new Set(),
  });

  for (let i = 1; i < ALL_NODES.length; i++) {
    const updates: string[] = [];
    for (const e of edges) {
      // ikke-rettet — relaxer begge veier
      const tryRelax = (from: RouterId, to: RouterId) => {
        if (dist[from] === INF) return;
        const alt = dist[from] + e.weight;
        if (alt < dist[to]) {
          dist[to] = alt;
          pred[to] = from;
          updates.push(`${to}=${alt} via ${from}`);
        }
      };
      tryRelax(e.from, e.to);
      tryRelax(e.to, e.from);
    }
    if (updates.length === 0) {
      steps.push({
        description: `Iterasjon ${i}: ingen flere oppdateringer → ferdig.`,
        distances: { ...dist },
        predecessors: { ...pred },
        visited: new Set(ALL_NODES),
      });
      break;
    }
    steps.push({
      description: `Iterasjon ${i}: ${updates.join(", ")}`,
      distances: { ...dist },
      predecessors: { ...pred },
      visited: new Set(),
    });
  }
  return steps;
}

type RouterNodeData = {
  label: string;
  visited: boolean;
  current: boolean;
  distance: number;
};

function RouterNode({ data }: NodeProps<Node<RouterNodeData>>) {
  let bgClass = "border-border bg-card";
  if (data.current) bgClass = "border-brand bg-brand/20";
  else if (data.visited) bgClass = "border-emerald-500 bg-emerald-500/10";
  return (
    <div
      className={`rounded-full border-2 ${bgClass} w-14 h-14 flex flex-col items-center justify-center transition-colors`}
    >
      <Handle type="target" position={Position.Top} className="!bg-brand" />
      <Handle type="target" position={Position.Left} className="!bg-brand" />
      <div className="text-base font-bold leading-none">{data.label}</div>
      <div className="mt-0.5 text-[10px] font-mono text-muted-foreground leading-none">
        {data.distance >= INF ? "∞" : data.distance}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-brand" />
      <Handle type="source" position={Position.Right} className="!bg-brand" />
    </div>
  );
}

const nodeTypes = { router: RouterNode };

export function RoutingGraphSim() {
  const [algo, setAlgo] = useState<Algo>("dijkstra");
  const [edges, setEdges] = useState<EdgeDef[]>(INITIAL_EDGES);
  const [stepIdx, setStepIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const steps = useMemo(() => {
    return algo === "dijkstra" ? dijkstraSteps(edges, "A") : bellmanFordSteps(edges, "A");
  }, [algo, edges]);

  // Reset stepIdx hvis algoritmen eller graf endres
  useEffect(() => {
    setStepIdx(0);
  }, [algo, edges]);

  const current = steps[Math.min(stepIdx, steps.length - 1)];

  const flowNodes = useMemo<Node<RouterNodeData>[]>(() => {
    return ALL_NODES.map((n) => ({
      id: n,
      type: "router",
      position: POSITIONS[n],
      data: {
        label: n,
        visited: current.visited.has(n),
        current: current.current === n,
        distance: current.distances[n],
      },
    }));
  }, [current]);

  const flowEdges = useMemo<Edge[]>(() => {
    return edges.map((e, i) => {
      const onShortestPath =
        current.predecessors[e.to] === e.from || current.predecessors[e.from] === e.to;
      return {
        id: `e-${i}`,
        source: e.from,
        target: e.to,
        label: `${e.weight}`,
        labelStyle: { fontSize: 11, fontWeight: 600, fill: onShortestPath ? "#f97316" : "var(--muted-foreground)" },
        labelBgStyle: { fill: "var(--color-card)" },
        style: {
          stroke: onShortestPath ? "#f97316" : "#94a3b8",
          strokeWidth: onShortestPath ? 2.5 : 1.5,
        },
        markerEnd: undefined,
      };
    });
  }, [edges, current]);

  const onEdgeClick: EdgeMouseHandler = useCallback(
    (_, edge) => {
      const idx = parseInt(edge.id.replace("e-", ""), 10);
      const newWeight = prompt(
        `Endre vekt for ${edges[idx].from}-${edges[idx].to} (skriv 0 for å fjerne):`,
        String(edges[idx].weight)
      );
      if (newWeight === null) return;
      const w = parseInt(newWeight, 10);
      if (isNaN(w)) return;
      if (w === 0) {
        setEdges(edges.filter((_, i) => i !== idx));
      } else {
        setEdges(edges.map((e, i) => (i === idx ? { ...e, weight: w } : e)));
      }
    },
    [edges]
  );

  const onNodeClick: NodeMouseHandler = useCallback(() => {
    // ingen-op
  }, []);

  function next() {
    setStepIdx((p) => Math.min(p + 1, steps.length - 1));
  }
  function run() {
    setStepIdx(steps.length - 1);
  }
  function reset() {
    setStepIdx(0);
  }
  function resetGraph() {
    setEdges(INITIAL_EDGES);
    setStepIdx(0);
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Steg-for-steg rute-algoritme (kilde = A)
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setAlgo("dijkstra")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              algo === "dijkstra"
                ? "bg-brand text-brand-foreground"
                : "border border-border bg-card hover:border-brand/40"
            }`}
          >
            Dijkstra (link-state)
          </button>
          <button
            type="button"
            onClick={() => setAlgo("bellman-ford")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              algo === "bellman-ford"
                ? "bg-brand text-brand-foreground"
                : "border border-border bg-card hover:border-brand/40"
            }`}
          >
            Bellman-Ford (distance-vector)
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_280px]">
        <div className="h-[420px] bg-background" style={{ touchAction: "none" }}>
          {!mounted ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              Laster graf …
            </div>
          ) : (
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              fitView
              fitViewOptions={{ padding: 0.25 }}
              proOptions={{ hideAttribution: true }}
              nodesDraggable={false}
              zoomOnScroll
              panOnDrag
            >
              <Background gap={20} size={1} />
              <Controls showInteractive={false} />
            </ReactFlow>
          )}
        </div>

        <aside className="border-t md:border-t-0 md:border-l border-border bg-background p-4 text-sm flex flex-col gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Steg {stepIdx + 1} av {steps.length}
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed min-h-[3.5rem]">
              {current.description}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={next}
              disabled={stepIdx >= steps.length - 1}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-brand text-brand-foreground text-xs font-medium px-2 py-1.5 disabled:opacity-50"
            >
              <SkipForward className="h-3.5 w-3.5" /> Neste
            </button>
            <button
              type="button"
              onClick={run}
              disabled={stepIdx >= steps.length - 1}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card hover:border-brand/40 text-xs font-medium px-2 py-1.5 disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" /> Kjor
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={reset}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card hover:border-brand/40 text-xs font-medium px-2 py-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Start om
            </button>
            <button
              type="button"
              onClick={resetGraph}
              className="flex-1 inline-flex items-center justify-center rounded-md border border-border bg-card hover:border-brand/40 text-[11px] font-medium px-2 py-1.5"
            >
              Tilbakestill graf
            </button>
          </div>

          <div className="rounded-md border border-border bg-muted/30 p-2 text-[11px] leading-relaxed">
            <div className="font-semibold text-foreground mb-1">Tabell (fra A)</div>
            <table className="w-full font-mono text-[10.5px]">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left">Node</th>
                  <th className="text-right">dist</th>
                  <th className="text-right">via</th>
                </tr>
              </thead>
              <tbody>
                {ALL_NODES.map((n) => (
                  <tr key={n}>
                    <td>{n}</td>
                    <td className="text-right">
                      {current.distances[n] >= INF ? "∞" : current.distances[n]}
                    </td>
                    <td className="text-right text-muted-foreground">
                      {current.predecessors[n] ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-[10px] text-muted-foreground leading-relaxed">
            Klikk på en kant for å endre vekt eller fjerne den (skriv 0).
          </div>
        </aside>
      </div>
    </div>
  );
}
