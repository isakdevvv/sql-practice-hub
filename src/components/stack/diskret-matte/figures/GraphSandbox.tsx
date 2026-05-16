import { useMemo, useState } from "react";

type Node = { id: string; x: number; y: number };
type Edge = [string, string];

const PRESETS: { id: string; label: string; nodes: Node[]; edges: Edge[]; note: string }[] = [
  {
    id: "tree",
    label: "Tre (5 noder)",
    nodes: [
      { id: "1", x: 130, y: 30 },
      { id: "2", x: 80, y: 90 },
      { id: "3", x: 180, y: 90 },
      { id: "4", x: 50, y: 150 },
      { id: "5", x: 110, y: 150 },
    ],
    edges: [
      ["1", "2"],
      ["1", "3"],
      ["2", "4"],
      ["2", "5"],
    ],
    note: "Sammenhengende, ingen sykler, |E| = |V|−1.",
  },
  {
    id: "cycle",
    label: "Syklisk graf",
    nodes: [
      { id: "A", x: 130, y: 30 },
      { id: "B", x: 200, y: 90 },
      { id: "C", x: 170, y: 160 },
      { id: "D", x: 90, y: 160 },
      { id: "E", x: 60, y: 90 },
    ],
    edges: [
      ["A", "B"],
      ["B", "C"],
      ["C", "D"],
      ["D", "E"],
      ["E", "A"],
    ],
    note: "5-syklus — kantene danner en sløyfe.",
  },
  {
    id: "complete",
    label: "K₄ (komplett, 4 noder)",
    nodes: [
      { id: "1", x: 70, y: 50 },
      { id: "2", x: 190, y: 50 },
      { id: "3", x: 190, y: 150 },
      { id: "4", x: 70, y: 150 },
    ],
    edges: [
      ["1", "2"],
      ["1", "3"],
      ["1", "4"],
      ["2", "3"],
      ["2", "4"],
      ["3", "4"],
    ],
    note: "Alle nodepar har en kant. |E| = C(n,2) = 6.",
  },
  {
    id: "disconnected",
    label: "Frakoblet",
    nodes: [
      { id: "A", x: 60, y: 70 },
      { id: "B", x: 110, y: 130 },
      { id: "C", x: 170, y: 60 },
      { id: "D", x: 220, y: 130 },
    ],
    edges: [
      ["A", "B"],
      ["C", "D"],
    ],
    note: "To komponenter, ingen sti mellom (A,B) og (C,D).",
  },
  {
    id: "bipartite",
    label: "Bipartitt (K₂,₃)",
    nodes: [
      { id: "u1", x: 70, y: 50 },
      { id: "u2", x: 70, y: 150 },
      { id: "v1", x: 200, y: 35 },
      { id: "v2", x: 200, y: 100 },
      { id: "v3", x: 200, y: 165 },
    ],
    edges: [
      ["u1", "v1"],
      ["u1", "v2"],
      ["u1", "v3"],
      ["u2", "v1"],
      ["u2", "v2"],
      ["u2", "v3"],
    ],
    note: "Noder deles i to grupper; kanter går kun mellom gruppene.",
  },
];

export function GraphSandbox() {
  const [presetIdx, setPresetIdx] = useState(0);
  const preset = PRESETS[presetIdx];

  const stats = useMemo(() => {
    const V = preset.nodes.length;
    const E = preset.edges.length;
    const adj: Record<string, Set<string>> = {};
    preset.nodes.forEach((n) => (adj[n.id] = new Set()));
    preset.edges.forEach(([u, v]) => {
      adj[u].add(v);
      adj[v].add(u);
    });
    const degrees = preset.nodes.map((n) => adj[n.id].size);
    const sumDeg = degrees.reduce((a, b) => a + b, 0);

    // BFS for components
    const seen = new Set<string>();
    let comp = 0;
    for (const n of preset.nodes) {
      if (seen.has(n.id)) continue;
      comp++;
      const queue = [n.id];
      while (queue.length) {
        const cur = queue.shift()!;
        if (seen.has(cur)) continue;
        seen.add(cur);
        adj[cur].forEach((nb) => !seen.has(nb) && queue.push(nb));
      }
    }
    const isTree = comp === 1 && E === V - 1;
    return { V, E, degrees, sumDeg, comp, isTree };
  }, [preset]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        Graf-galleri — klikk for å bytte
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {PRESETS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPresetIdx(i)}
            className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${
              i === presetIdx
                ? "border-brand bg-brand/15 text-foreground"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <svg viewBox="0 0 260 200" className="w-full rounded-md border border-border bg-background">
          {preset.edges.map(([u, v], i) => {
            const nu = preset.nodes.find((n) => n.id === u)!;
            const nv = preset.nodes.find((n) => n.id === v)!;
            return (
              <line
                key={i}
                x1={nu.x}
                y1={nu.y}
                x2={nv.x}
                y2={nv.y}
                className="stroke-foreground/60"
                strokeWidth={1.8}
              />
            );
          })}
          {preset.nodes.map((n) => (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={14} className="fill-brand/30 stroke-brand" strokeWidth={1.5} />
              <text
                x={n.x}
                y={n.y + 4}
                textAnchor="middle"
                className="fill-foreground text-[11px] font-semibold font-mono"
              >
                {n.id}
              </text>
            </g>
          ))}
        </svg>

        <div className="space-y-2 text-xs">
          <div className="rounded-md border border-border bg-background p-3 font-mono space-y-1">
            <div>
              |V| = <span className="text-brand">{stats.V}</span> &nbsp; |E| ={" "}
              <span className="text-brand">{stats.E}</span>
            </div>
            <div>
              Σ deg(v) = <span className="text-brand">{stats.sumDeg}</span> = 2|E| (handshake-lemma)
            </div>
            <div>
              Komponenter: <span className="text-brand">{stats.comp}</span>
            </div>
            <div>
              Tre? <span className="text-brand">{stats.isTree ? "ja" : "nei"}</span>
            </div>
          </div>

          <div className="rounded-md border border-border bg-background p-3 font-mono text-[11px]">
            <div className="text-muted-foreground mb-1">Naboliste:</div>
            {preset.nodes.map((n) => {
              const neighbors = preset.edges
                .filter(([a, b]) => a === n.id || b === n.id)
                .map(([a, b]) => (a === n.id ? b : a));
              return (
                <div key={n.id}>
                  {n.id}: [{neighbors.join(", ")}]
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-muted-foreground italic">{preset.note}</div>
        </div>
      </div>
    </div>
  );
}
