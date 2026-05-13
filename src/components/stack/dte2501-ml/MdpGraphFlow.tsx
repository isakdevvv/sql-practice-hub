import { useMemo, useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeMouseHandler,
  MarkerType,
  type NodeProps,
  Handle,
  Position,
} from "@xyflow/react";

// En liten MDP med 4 stater (s0, s1, s2, terminal) og 2 actions (a0, a1).
// Hensikten er å vise transition probabilities og rewards eksplisitt — komplementerer MdpGridworld.

type Transition = {
  from: string;
  to: string;
  action: "a0" | "a1";
  prob: number;
  reward: number;
};

const TRANSITIONS: Transition[] = [
  // s0
  { from: "s0", to: "s1", action: "a0", prob: 0.8, reward: 0 },
  { from: "s0", to: "s0", action: "a0", prob: 0.2, reward: 0 },
  { from: "s0", to: "s2", action: "a1", prob: 0.5, reward: -1 },
  { from: "s0", to: "s1", action: "a1", prob: 0.5, reward: 0 },
  // s1
  { from: "s1", to: "term", action: "a0", prob: 0.9, reward: 10 },
  { from: "s1", to: "s2", action: "a0", prob: 0.1, reward: -1 },
  { from: "s1", to: "s0", action: "a1", prob: 1.0, reward: 0 },
  // s2
  { from: "s2", to: "s1", action: "a0", prob: 0.6, reward: 0 },
  { from: "s2", to: "s2", action: "a0", prob: 0.4, reward: -1 },
  { from: "s2", to: "s0", action: "a1", prob: 1.0, reward: 0 },
];

type StateInfo = {
  id: string;
  label: string;
  terminal?: boolean;
  description: string;
};

const STATES: StateInfo[] = [
  { id: "s0", label: "s₀ (start)", description: "Startstate. Velg a₀ for å gå mot s₁ med høy sannsynlighet, eller a₁ som risikabel snarvei via s₂." },
  { id: "s1", label: "s₁", description: "God state. a₀ herfra → terminal med belønning +10 (90% sjanse), men 10% å havne i s₂ med −1." },
  { id: "s2", label: "s₂ (felle)", description: "Dårlig state. Selv-loop sannsynlig under a₀. Bruk a₁ for å returnere til s₀." },
  { id: "term", label: "Terminal", terminal: true, description: "Sluttstate. Belønning fast = 0, ingen flere actions." },
];

const POSITIONS: Record<string, { x: number; y: number }> = {
  s0: { x: 0, y: 100 },
  s1: { x: 280, y: 0 },
  s2: { x: 280, y: 220 },
  term: { x: 560, y: 100 },
};

type StateNodeData = {
  label: string;
  selected: boolean;
  terminal?: boolean;
};

function StateNode({ data }: NodeProps<Node<StateNodeData>>) {
  return (
    <div
      className={`rounded-full border-2 px-4 py-3 shadow-sm transition-colors min-w-[80px] text-center ${
        data.selected
          ? "border-brand bg-brand/15"
          : data.terminal
          ? "border-emerald-500/50 bg-emerald-500/10 hover:border-emerald-500"
          : "border-border bg-card hover:border-brand/40"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-brand" />
      <Handle type="target" position={Position.Left} className="!bg-brand" />
      <div className="text-sm font-semibold text-foreground leading-tight">
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-brand" />
      <Handle type="source" position={Position.Right} className="!bg-brand" />
    </div>
  );
}

const nodeTypes = { state: StateNode };

type ActionFilter = "all" | "a0" | "a1";

export function MdpGraphFlow() {
  const [selectedId, setSelectedId] = useState<string>("s0");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const nodes = useMemo<Node<StateNodeData>[]>(() => {
    return STATES.map((s) => ({
      id: s.id,
      type: "state",
      position: POSITIONS[s.id],
      data: {
        label: s.label,
        selected: s.id === selectedId,
        terminal: s.terminal,
      },
    }));
  }, [selectedId]);

  const edges = useMemo<Edge[]>(() => {
    return TRANSITIONS.filter(
      (t) => actionFilter === "all" || t.action === actionFilter
    ).map((t, i) => {
      const color = t.action === "a0" ? "#f97316" : "#3b82f6";
      const isSelf = t.from === t.to;
      return {
        id: `${t.from}-${t.action}-${t.to}-${i}`,
        source: t.from,
        target: t.to,
        type: isSelf ? "default" : "default",
        label: `${t.action} · p=${t.prob.toFixed(1)}${t.reward !== 0 ? ` · r=${t.reward > 0 ? "+" : ""}${t.reward}` : ""}`,
        labelStyle: { fontSize: 10, fill: color, fontWeight: 500 },
        labelBgStyle: { fill: "var(--color-background)" },
        style: {
          stroke: color,
          strokeWidth: 1 + t.prob * 1.5,
          opacity: 0.85,
        },
        markerEnd: { type: MarkerType.ArrowClosed, color },
      } satisfies Edge;
    });
  }, [actionFilter]);

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedId(node.id);
  }, []);

  const selected = STATES.find((s) => s.id === selectedId) ?? STATES[0];
  const outgoing = TRANSITIONS.filter((t) => t.from === selectedId);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          MDP som node-graf
        </div>
        <div
          role="tablist"
          aria-label="Filter på action"
          className="inline-flex rounded-md border border-border bg-background p-0.5 text-xs"
        >
          {(["all", "a0", "a1"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              role="tab"
              aria-selected={actionFilter === opt}
              onClick={() => setActionFilter(opt)}
              className={`px-2.5 py-1 rounded-sm transition-colors ${
                actionFilter === opt
                  ? "bg-brand text-brand-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt === "all" ? "alle" : opt}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_280px]">
        <div className="h-[420px] bg-background" style={{ touchAction: "none" }}>
          {!mounted ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              Laster MDP-graf …
            </div>
          ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            proOptions={{ hideAttribution: true }}
            nodesDraggable
            zoomOnScroll
            panOnDrag
          >
            <Background gap={20} size={1} />
            <Controls showInteractive={false} />
            <MiniMap
              pannable
              zoomable
              maskColor="rgba(0,0,0,0.1)"
              style={{ background: "var(--color-card)" }}
            />
          </ReactFlow>
          )}
        </div>

        <aside className="border-t md:border-t-0 md:border-l border-border bg-background p-4 text-sm">
          <h3 className="text-base font-semibold leading-tight">
            {selected.label}
          </h3>
          <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
            {selected.description}
          </p>

          {outgoing.length > 0 ? (
            <>
              <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                Transitions ut
              </div>
              <ul className="mt-1 space-y-1">
                {outgoing.map((t, i) => (
                  <li
                    key={i}
                    className="font-mono text-[11px] text-foreground flex items-baseline gap-1"
                  >
                    <span
                      className={
                        t.action === "a0"
                          ? "text-orange-500"
                          : "text-blue-500"
                      }
                    >
                      {t.action}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span>{t.to}</span>
                    <span className="text-muted-foreground">
                      · p={t.prob.toFixed(1)} r={t.reward > 0 ? "+" : ""}
                      {t.reward}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-3 text-[11px] italic text-muted-foreground">
              Terminal — ingen utgående transitions.
            </p>
          )}

          <p className="mt-4 text-[11px] text-muted-foreground">
            Color-code: <span className="text-orange-500 font-mono">a₀</span> /
            <span className="text-blue-500 font-mono"> a₁</span>. Tykkelse på
            kant ≈ sannsynlighet.
          </p>
        </aside>
      </div>
    </div>
  );
}
