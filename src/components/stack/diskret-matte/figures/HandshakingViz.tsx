import { useMemo, useState } from "react";

const NODES = [
  { id: 0, x: 60, y: 50, label: "v₀" },
  { id: 1, x: 200, y: 50, label: "v₁" },
  { id: 2, x: 260, y: 140, label: "v₂" },
  { id: 3, x: 200, y: 220, label: "v₃" },
  { id: 4, x: 60, y: 220, label: "v₄" },
  { id: 5, x: 0, y: 140, label: "v₅" },
];

function key(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

const ALL_EDGES: Array<[number, number]> = [];
for (let i = 0; i < NODES.length; i++) {
  for (let j = i + 1; j < NODES.length; j++) {
    ALL_EDGES.push([i, j]);
  }
}

const PRESETS: { label: string; edges: string[] }[] = [
  {
    label: "Sykel C₆",
    edges: ["0-1", "1-2", "2-3", "3-4", "4-5", "0-5"],
  },
  {
    label: "Stjerne (1 sentrum)",
    edges: ["0-1", "0-2", "0-3", "0-4", "0-5"],
  },
  {
    label: "Komplett K₄ + 2 isolerte",
    edges: ["0-1", "0-2", "0-3", "1-2", "1-3", "2-3"],
  },
];

export function HandshakingViz() {
  const [edges, setEdges] = useState<Set<string>>(new Set(PRESETS[0].edges));
  const [hovered, setHovered] = useState<number | null>(null);

  const toggle = (a: number, b: number) => {
    const k = key(a, b);
    setEdges((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const degrees = useMemo(() => {
    const d = new Array(NODES.length).fill(0);
    for (const e of edges) {
      const [a, b] = e.split("-").map(Number);
      d[a]++;
      d[b]++;
    }
    return d;
  }, [edges]);

  const sumDeg = degrees.reduce((a, b) => a + b, 0);
  const numEdges = edges.size;
  const oddCount = degrees.filter((d) => d % 2 === 1).length;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Handshake-lemmaet
        </div>
        <div className="flex flex-wrap gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setEdges(new Set(p.edges))}
              className="text-[10px] px-2 py-1 rounded border border-border hover:bg-muted"
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setEdges(new Set())}
            className="text-[10px] px-2 py-1 rounded border border-border hover:bg-muted"
          >
            Tøm
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        Klikk to noder etter hverandre for å toggle en kant — eller velg preset. Hver
        kant bidrar 1 til grad-summen i hver av sine endepunkter.
      </p>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-background p-2">
          <svg viewBox="-30 -10 320 280" className="w-full h-72">
            {/* Edges */}
            {ALL_EDGES.map(([a, b]) => {
              const k = key(a, b);
              const on = edges.has(k);
              const na = NODES[a];
              const nb = NODES[b];
              const highlight =
                hovered !== null && (hovered === a || hovered === b) && on;
              return (
                <line
                  key={k}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke={
                    on
                      ? highlight
                        ? "rgb(244 114 182)"
                        : "rgb(99 102 241)"
                      : "rgb(148 163 184 / 0.2)"
                  }
                  strokeWidth={on ? (highlight ? 3 : 2) : 1}
                  strokeDasharray={on ? "" : "2 3"}
                  className="cursor-pointer"
                  onClick={() => toggle(a, b)}
                />
              );
            })}
            {/* Nodes */}
            {NODES.map((n, i) => {
              const deg = degrees[i];
              const isOdd = deg % 2 === 1;
              return (
                <g
                  key={n.id}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r="18"
                    fill={
                      hovered === i
                        ? "rgb(244 114 182 / 0.3)"
                        : isOdd && deg > 0
                          ? "rgb(251 191 36 / 0.25)"
                          : "rgb(99 102 241 / 0.15)"
                    }
                    stroke={
                      hovered === i ? "rgb(244 114 182)" : "rgb(99 102 241)"
                    }
                    strokeWidth="1.5"
                  />
                  <text
                    x={n.x}
                    y={n.y - 2}
                    textAnchor="middle"
                    fontSize="10"
                    fill="currentColor"
                    className="font-mono"
                  >
                    {n.label}
                  </text>
                  <text
                    x={n.x}
                    y={n.y + 10}
                    textAnchor="middle"
                    fontSize="9"
                    fill="currentColor"
                    className="opacity-70"
                  >
                    deg={deg}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="text-[10px] text-muted-foreground mt-1 text-center">
            Klikk en kant for å toggle. Gul ring = oddetalls-grad.
          </div>
        </div>

        {/* Stats */}
        <div className="rounded-xl border border-border bg-background p-3 font-mono text-xs">
          <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-2 font-sans">
            Grad-regnskap
          </div>
          <div className="space-y-0.5">
            {degrees.map((d, i) => (
              <div
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className={`flex justify-between px-2 py-0.5 rounded ${
                  hovered === i ? "bg-brand/10" : ""
                }`}
              >
                <span>deg({NODES[i].label})</span>
                <span className={d % 2 === 1 ? "text-amber-600 dark:text-amber-400" : ""}>
                  {d}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-border space-y-1">
            <div className="flex justify-between">
              <span>Σ deg(v)</span>
              <span className="font-bold text-brand">{sumDeg}</span>
            </div>
            <div className="flex justify-between">
              <span>2 · |E|</span>
              <span className="font-bold text-brand">{2 * numEdges}</span>
            </div>
            <div
              className={`mt-1 text-[11px] rounded px-2 py-1 ${
                sumDeg === 2 * numEdges
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
              }`}
            >
              {sumDeg === 2 * numEdges
                ? `Σ deg = 2|E| ✓ — handshake-lemma holder`
                : "Mismatch (skal aldri skje)"}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Antall noder med oddetalls-grad:{" "}
              <span
                className={`font-bold ${
                  oddCount % 2 === 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {oddCount}
              </span>{" "}
              ({oddCount % 2 === 0 ? "partall ✓" : "oddetall ✗"})
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 text-[11px] text-muted-foreground">
        <strong className="text-foreground">Hvorfor:</strong> hver kant <code>{`{u,v}`}</code>{" "}
        legger 1 til deg(u) og 1 til deg(v) — totalt 2 per kant. Derfor er Σ deg = 2|E|,
        som er partall, så antallet noder med oddetalls-grad må også være partall.
      </div>
    </div>
  );
}
