import { useMemo, useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  MarkerType,
  type NodeProps,
  Handle,
  Position,
} from "@xyflow/react";

// Resource-allocation graph (RAG).
// Nodes:
//   - Process (P1, P2, ...) — circle
//   - Resource (R1, R2, ...) — square
// Edges:
//   - Request edge: P → R  (process is waiting for resource)
//   - Assignment edge: R → P (resource is held by process)
// Deadlock = there is a cycle in this graph (assuming one instance per resource).

type EdgeKind = "request" | "assignment";

type RAGEdge = {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
};

type Scenario = {
  id: string;
  label: string;
  processes: string[];
  resources: string[];
  edges: RAGEdge[];
  note: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "deadlock-2",
    label: "Klassisk to-prosess deadlock",
    processes: ["P1", "P2"],
    resources: ["R1", "R2"],
    edges: [
      { id: "e1", source: "R1", target: "P1", kind: "assignment" },
      { id: "e2", source: "P1", target: "R2", kind: "request" },
      { id: "e3", source: "R2", target: "P2", kind: "assignment" },
      { id: "e4", source: "P2", target: "R1", kind: "request" },
    ],
    note: "P1 holder R1 og venter på R2. P2 holder R2 og venter på R1. Sirkel = deadlock. Bryter Coffmans «circular wait».",
  },
  {
    id: "deadlock-3",
    label: "Tre-prosess deadlock",
    processes: ["P1", "P2", "P3"],
    resources: ["R1", "R2", "R3"],
    edges: [
      { id: "e1", source: "R1", target: "P1", kind: "assignment" },
      { id: "e2", source: "P1", target: "R2", kind: "request" },
      { id: "e3", source: "R2", target: "P2", kind: "assignment" },
      { id: "e4", source: "P2", target: "R3", kind: "request" },
      { id: "e5", source: "R3", target: "P3", kind: "assignment" },
      { id: "e6", source: "P3", target: "R1", kind: "request" },
    ],
    note: "P1 → R2 → P2 → R3 → P3 → R1 → P1. Lengre sirkel, samme problem. Filosof-problemet er en generalisering av dette.",
  },
  {
    id: "no-deadlock",
    label: "Ingen sirkel — ingen deadlock",
    processes: ["P1", "P2"],
    resources: ["R1", "R2"],
    edges: [
      { id: "e1", source: "R1", target: "P1", kind: "assignment" },
      { id: "e2", source: "P2", target: "R1", kind: "request" },
      { id: "e3", source: "R2", target: "P2", kind: "assignment" },
    ],
    note: "P2 venter på R1, men P1 venter ikke på R2. P1 vil snart slippe R1, så P2 kommer videre. Ingen sirkel.",
  },
];

// ----- Node types -----

function ProcessNode({ data }: NodeProps<Node<{ label: string; inCycle: boolean }>>) {
  return (
    <div
      className={`rounded-full border-2 px-4 py-3 shadow-sm min-w-[56px] text-center transition-colors ${
        data.inCycle
          ? "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300"
          : "border-border bg-card text-foreground"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-brand" />
      <Handle type="target" position={Position.Left} className="!bg-brand" />
      <div className="text-sm font-semibold leading-tight">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-brand" />
      <Handle type="source" position={Position.Right} className="!bg-brand" />
    </div>
  );
}

function ResourceNode({ data }: NodeProps<Node<{ label: string; inCycle: boolean }>>) {
  return (
    <div
      className={`rounded-md border-2 px-4 py-3 shadow-sm min-w-[56px] text-center transition-colors ${
        data.inCycle
          ? "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300"
          : "border-border bg-card text-foreground"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-brand" />
      <Handle type="target" position={Position.Left} className="!bg-brand" />
      <div className="text-sm font-mono font-semibold leading-tight">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-brand" />
      <Handle type="source" position={Position.Right} className="!bg-brand" />
    </div>
  );
}

const nodeTypes = { process: ProcessNode, resource: ResourceNode };

// ----- Cycle detection -----

function findCycle(
  processes: string[],
  resources: string[],
  edges: RAGEdge[],
): Set<string> {
  // Build adjacency from edges (treating directed).
  const adj: Record<string, string[]> = {};
  for (const p of processes) adj[p] = [];
  for (const r of resources) adj[r] = [];
  for (const e of edges) adj[e.source].push(e.target);

  const allNodes = [...processes, ...resources];
  const cycle: Set<string> = new Set();

  function dfs(start: string): string[] | null {
    const stack: { node: string; path: string[]; visited: Set<string> }[] = [
      { node: start, path: [start], visited: new Set([start]) },
    ];
    while (stack.length) {
      const { node, path, visited } = stack.pop()!;
      for (const nxt of adj[node] || []) {
        if (nxt === start) return [...path, nxt];
        if (!visited.has(nxt)) {
          const v2 = new Set(visited);
          v2.add(nxt);
          stack.push({ node: nxt, path: [...path, nxt], visited: v2 });
        }
      }
    }
    return null;
  }

  for (const n of allNodes) {
    const c = dfs(n);
    if (c) {
      for (const x of c) cycle.add(x);
      break;
    }
  }
  return cycle;
}

// ----- Component -----

export function DeadlockGraph() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
  const [edges, setEdges] = useState<RAGEdge[]>(scenario.edges);
  const [checked, setChecked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset when scenario changes
  const applyScenario = useCallback((id: string) => {
    const s = SCENARIOS.find((x) => x.id === id) ?? SCENARIOS[0];
    setScenarioId(id);
    setEdges(s.edges.map((e) => ({ ...e })));
    setChecked(false);
  }, []);

  const cycle = useMemo(
    () => findCycle(scenario.processes, scenario.resources, edges),
    [scenario, edges],
  );
  const hasCycle = cycle.size > 0;

  const positions = useMemo(() => {
    const out: Record<string, { x: number; y: number }> = {};
    const px = 80;
    const rx = 320;
    scenario.processes.forEach((p, i) => {
      out[p] = { x: px, y: 60 + i * 110 };
    });
    scenario.resources.forEach((r, i) => {
      out[r] = { x: rx, y: 60 + i * 110 };
    });
    return out;
  }, [scenario]);

  const nodes = useMemo<Node[]>(() => {
    return [
      ...scenario.processes.map((p) => ({
        id: p,
        type: "process",
        position: positions[p],
        data: { label: p, inCycle: checked && cycle.has(p) },
      })),
      ...scenario.resources.map((r) => ({
        id: r,
        type: "resource",
        position: positions[r],
        data: { label: r, inCycle: checked && cycle.has(r) },
      })),
    ];
  }, [scenario, positions, cycle, checked]);

  const rfEdges = useMemo<Edge[]>(() => {
    return edges.map((e) => {
      const inCyc = checked && cycle.has(e.source) && cycle.has(e.target);
      const color =
        e.kind === "request" ? "#f97316" /* orange */ : "#10b981" /* emerald */;
      const highlight = inCyc ? "#e11d48" : color;
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: "default",
        label: e.kind === "request" ? "request" : "holds",
        labelStyle: { fontSize: 10, fill: highlight, fontWeight: 500 },
        labelBgStyle: { fill: "var(--color-background)" },
        style: { stroke: highlight, strokeWidth: inCyc ? 3 : 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: highlight },
      } satisfies Edge;
    });
  }, [edges, cycle, checked]);

  function removeEdge(id: string) {
    setEdges((es) => es.filter((e) => e.id !== id));
    setChecked(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Ressurs-allokeringsgraf — deadlock-detektor
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => applyScenario(s.id)}
              className={`text-xs rounded-md border px-2 py-1 transition-colors ${
                scenarioId === s.id
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-background hover:border-brand/40 text-muted-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_280px]">
        <div className="h-[380px] bg-background" style={{ touchAction: "none" }}>
          {!mounted ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              Laster graf …
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={rfEdges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.25 }}
              proOptions={{ hideAttribution: true }}
              nodesDraggable
              zoomOnScroll
              panOnDrag
            >
              <Background gap={20} size={1} />
              <Controls showInteractive={false} />
            </ReactFlow>
          )}
        </div>

        <aside className="border-t md:border-t-0 md:border-l border-border bg-background p-4 text-sm space-y-3">
          <button
            type="button"
            onClick={() => setChecked(true)}
            className="w-full rounded-md border border-brand bg-brand/10 px-3 py-2 text-sm text-brand hover:bg-brand/20"
          >
            Sjekk for deadlock
          </button>

          {checked && (
            <div
              className={`rounded-md border p-3 text-xs ${
                hasCycle
                  ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                  : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {hasCycle ? (
                <>
                  <strong>Sirkel oppdaget:</strong>{" "}
                  <span className="font-mono">{Array.from(cycle).join(" → ")}</span>
                  . En sirkel i RAG-en med én instans per ressurs = deadlock. Coffmans
                  «circular wait» er brutt — én av de fire betingelsene må brytes for å
                  fjerne deadlocken.
                </>
              ) : (
                <>
                  <strong>Ingen sirkel.</strong> Ingen deadlock i denne grafen.
                </>
              )}
            </div>
          )}

          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Kanter (klikk × for å fjerne)
            </div>
            <ul className="space-y-1 text-xs font-mono">
              {edges.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-2">
                  <span>
                    {e.source}
                    {" "}
                    <span
                      className={
                        e.kind === "request" ? "text-orange-500" : "text-emerald-500"
                      }
                    >
                      {e.kind === "request" ? "──req──▶" : "──holds──▶"}
                    </span>
                    {" "}
                    {e.target}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEdge(e.id)}
                    className="text-rose-500 hover:text-rose-400 px-1"
                    aria-label="Fjern kant"
                  >
                    ×
                  </button>
                </li>
              ))}
              {edges.length === 0 ? (
                <li className="text-muted-foreground">(ingen kanter)</li>
              ) : null}
            </ul>
          </div>

          <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-[11px] text-foreground">
            <span className="font-semibold">Notat:</span> {scenario.note}
          </div>
        </aside>
      </div>
    </div>
  );
}
