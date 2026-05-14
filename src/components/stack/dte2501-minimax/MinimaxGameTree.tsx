import { useMemo, useState } from "react";

// Minimax + alpha-beta pruning visualizer.
// Et lite game tree (depth 3, branching faktor 3) der løv-noder har verdier
// brukeren kan endre. Vi viser hvilke noder som klippes ved alpha-beta.

type LeafId = number;

// 3 nivåer (root MAX → MIN → MAX → leaves). Branching: 2, 2, 2 = 8 leaves.
// Default-verdier som gir en pruning-rik situasjon.
const DEFAULT_LEAVES = [3, 5, 6, 9, 1, 2, 0, -1];
const BRANCHING = 2;
const DEPTH = 3;

type NodeResult = {
  id: string;
  level: number;       // 0 = root, DEPTH = leaf
  isMax: boolean;
  value: number;
  alpha: number;       // entering alpha
  beta: number;        // entering beta
  alphaOut: number;    // exiting alpha
  betaOut: number;     // exiting beta
  pruned: boolean;     // node never visited because of pruning
  bestChild?: string;
  childOrder: string[];
};

function computeTree(
  leaves: number[],
  useAlphaBeta: boolean,
): { nodes: Map<string, NodeResult>; visitOrder: string[]; rootId: string } {
  const nodes = new Map<string, NodeResult>();
  const visitOrder: string[] = [];

  // Build ids: level-l-i  where i is index at that level
  // root: "0-0". Children of "L-i" are "(L+1)-(2i)" and "(L+1)-(2i+1)".
  const childrenOf = (id: string): string[] => {
    const [lStr, iStr] = id.split("-");
    const l = Number(lStr);
    const i = Number(iStr);
    if (l >= DEPTH) return [];
    return Array.from({ length: BRANCHING }, (_, k) => `${l + 1}-${i * BRANCHING + k}`);
  };

  const isMax = (level: number) => level % 2 === 0;

  // Pre-create node records (pruned=true for those not visited).
  const allIds: string[] = [];
  const collect = (id: string) => {
    allIds.push(id);
    for (const c of childrenOf(id)) collect(c);
  };
  collect("0-0");
  for (const id of allIds) {
    const [lStr, iStr] = id.split("-");
    const l = Number(lStr);
    nodes.set(id, {
      id,
      level: l,
      isMax: isMax(l),
      value: l === DEPTH ? leaves[Number(iStr)] : NaN,
      alpha: -Infinity,
      beta: Infinity,
      alphaOut: -Infinity,
      betaOut: Infinity,
      pruned: true,
      childOrder: childrenOf(id),
    });
  }

  function minimax(id: string, alpha: number, beta: number): number {
    const node = nodes.get(id)!;
    node.pruned = false;
    node.alpha = alpha;
    node.beta = beta;
    visitOrder.push(id);

    if (node.level === DEPTH) {
      node.alphaOut = alpha;
      node.betaOut = beta;
      return node.value;
    }

    const kids = node.childOrder;
    if (node.isMax) {
      let value = -Infinity;
      let bestChild: string | undefined;
      for (const c of kids) {
        const v = minimax(c, alpha, beta);
        if (v > value) {
          value = v;
          bestChild = c;
        }
        if (useAlphaBeta) {
          alpha = Math.max(alpha, value);
          if (alpha >= beta) break; // β-cutoff
        }
      }
      node.value = value;
      node.bestChild = bestChild;
      node.alphaOut = alpha;
      node.betaOut = beta;
      return value;
    } else {
      let value = Infinity;
      let bestChild: string | undefined;
      for (const c of kids) {
        const v = minimax(c, alpha, beta);
        if (v < value) {
          value = v;
          bestChild = c;
        }
        if (useAlphaBeta) {
          beta = Math.min(beta, value);
          if (alpha >= beta) break; // α-cutoff
        }
      }
      node.value = value;
      node.bestChild = bestChild;
      node.alphaOut = alpha;
      node.betaOut = beta;
      return value;
    }
  }

  minimax("0-0", -Infinity, Infinity);
  return { nodes, visitOrder, rootId: "0-0" };
}

// Layout: spread leaves horizontally, then parents at midpoint.
function layout(): Map<string, { x: number; y: number }> {
  const pos = new Map<string, { x: number; y: number }>();
  const nLeaves = BRANCHING ** DEPTH;
  const leafSpacing = 80;
  const totalWidth = (nLeaves - 1) * leafSpacing;
  const xStart = -totalWidth / 2;

  for (let i = 0; i < nLeaves; i++) {
    pos.set(`${DEPTH}-${i}`, { x: xStart + i * leafSpacing, y: DEPTH * 110 });
  }
  for (let l = DEPTH - 1; l >= 0; l--) {
    const count = BRANCHING ** l;
    for (let i = 0; i < count; i++) {
      const left = pos.get(`${l + 1}-${i * BRANCHING}`)!;
      const right = pos.get(`${l + 1}-${i * BRANCHING + 1}`)!;
      pos.set(`${l}-${i}`, { x: (left.x + right.x) / 2, y: l * 110 });
    }
  }
  return pos;
}

function fmt(v: number): string {
  if (!isFinite(v)) return v > 0 ? "+∞" : "−∞";
  return String(v);
}

export function MinimaxGameTree() {
  const [leaves, setLeaves] = useState<number[]>(DEFAULT_LEAVES);
  const [useAlphaBeta, setUseAlphaBeta] = useState(true);
  const [stepIdx, setStepIdx] = useState<number | null>(null);

  const { nodes, visitOrder, rootId } = useMemo(
    () => computeTree(leaves, useAlphaBeta),
    [leaves, useAlphaBeta],
  );
  const pos = useMemo(() => layout(), []);

  const visited = useMemo(() => {
    if (stepIdx === null) return new Set(visitOrder);
    return new Set(visitOrder.slice(0, stepIdx + 1));
  }, [visitOrder, stepIdx]);

  const currentId = stepIdx !== null ? visitOrder[stepIdx] : null;

  // SVG bounds
  const margin = 60;
  const allPos = Array.from(pos.values());
  const minX = Math.min(...allPos.map((p) => p.x)) - margin;
  const maxX = Math.max(...allPos.map((p) => p.x)) + margin;
  const minY = -40;
  const maxY = Math.max(...allPos.map((p) => p.y)) + 60;

  const totalSavings =
    visitOrder.length === 0 ? 0 : 15 - visitOrder.filter((id) => Number(id.split("-")[0]) === DEPTH).length;
  // 8 leaves max; saved = 8 − leaves-visited.

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={useAlphaBeta}
            onChange={(e) => setUseAlphaBeta(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="font-medium">Alpha-beta pruning</span>
        </label>
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setStepIdx(null)}
            className="rounded border border-border px-2 py-1 hover:bg-muted"
          >
            Vis alt
          </button>
          <button
            type="button"
            onClick={() => setStepIdx(0)}
            className="rounded border border-border px-2 py-1 hover:bg-muted"
          >
            Steg 1
          </button>
          <button
            type="button"
            onClick={() =>
              setStepIdx((s) => (s === null ? 0 : Math.max(0, s - 1)))
            }
            className="rounded border border-border px-2 py-1 hover:bg-muted"
          >
            ◀ Forrige
          </button>
          <button
            type="button"
            onClick={() =>
              setStepIdx((s) =>
                s === null
                  ? Math.min(1, visitOrder.length - 1)
                  : Math.min(visitOrder.length - 1, s + 1),
              )
            }
            className="rounded border border-border px-2 py-1 hover:bg-muted"
          >
            Neste ▶
          </button>
          <span className="text-muted-foreground ml-1">
            {stepIdx === null ? "alt vist" : `${stepIdx + 1}/${visitOrder.length}`}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
          className="w-full h-auto"
          style={{ maxHeight: 460 }}
        >
          {/* Edges */}
          {Array.from(nodes.values()).map((n) => {
            const p = pos.get(n.id)!;
            return n.childOrder.map((cid) => {
              const cn = nodes.get(cid)!;
              const cp = pos.get(cid)!;
              const childVisible = visited.has(cid);
              const childPruned = cn.pruned;
              const isBestEdge = n.bestChild === cid && !childPruned;
              const stroke = childPruned
                ? "hsl(0 70% 55% / 0.3)"
                : isBestEdge
                ? "hsl(160 70% 45%)"
                : "hsl(0 0% 50% / 0.45)";
              return (
                <line
                  key={`${n.id}->${cid}`}
                  x1={p.x}
                  y1={p.y}
                  x2={cp.x}
                  y2={cp.y}
                  stroke={stroke}
                  strokeWidth={isBestEdge ? 2.5 : 1.5}
                  strokeDasharray={childPruned ? "4 4" : undefined}
                  opacity={childVisible || childPruned ? 1 : 0.3}
                />
              );
            });
          })}

          {/* Nodes */}
          {Array.from(nodes.values()).map((n) => {
            const p = pos.get(n.id)!;
            const isLeaf = n.level === DEPTH;
            const isCurrent = n.id === currentId;
            const isVisited = visited.has(n.id);
            const isPruned = n.pruned;

            const fill = isPruned
              ? "hsl(0 70% 55% / 0.1)"
              : isCurrent
              ? "hsl(45 100% 55% / 0.4)"
              : isVisited
              ? n.isMax
                ? "hsl(220 70% 55% / 0.18)"
                : "hsl(280 70% 60% / 0.18)"
              : "hsl(0 0% 50% / 0.05)";

            const stroke = isPruned
              ? "hsl(0 70% 55%)"
              : isCurrent
              ? "hsl(45 100% 50%)"
              : n.isMax
              ? "hsl(220 70% 50%)"
              : "hsl(280 70% 55%)";

            return (
              <g key={n.id}>
                {isLeaf ? (
                  <rect
                    x={p.x - 22}
                    y={p.y - 16}
                    width={44}
                    height={32}
                    rx={4}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isCurrent ? 2.5 : 1.5}
                    opacity={isPruned ? 0.55 : 1}
                  />
                ) : (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={22}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isCurrent ? 2.5 : 1.5}
                    opacity={isPruned ? 0.55 : 1}
                  />
                )}
                <text
                  x={p.x}
                  y={p.y + 4}
                  textAnchor="middle"
                  className="fill-foreground"
                  style={{ fontSize: 12, fontWeight: 600 }}
                >
                  {isLeaf
                    ? leaves[Number(n.id.split("-")[1])]
                    : isVisited && !isPruned && isFinite(n.value)
                    ? n.value
                    : ""}
                </text>
                {!isLeaf && (
                  <text
                    x={p.x}
                    y={p.y - 28}
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    style={{ fontSize: 10, fontWeight: 500 }}
                  >
                    {n.isMax ? "MAX" : "MIN"}
                  </text>
                )}
                {useAlphaBeta && isVisited && !isPruned && !isLeaf && (
                  <text
                    x={p.x}
                    y={p.y + 38}
                    textAnchor="middle"
                    style={{ fontSize: 9, fill: "hsl(0 0% 50%)" }}
                  >
                    α={fmt(n.alphaOut)} β={fmt(n.betaOut)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Leaf editor */}
      <div className="mt-3">
        <div className="text-xs text-muted-foreground mb-1.5">
          Endre løv-verdier (depth = {DEPTH}, {leaves.length} løv):
        </div>
        <div className="flex flex-wrap gap-1.5">
          {leaves.map((v, i) => (
            <input
              key={i}
              type="number"
              value={v}
              onChange={(e) => {
                const nv = Number(e.target.value);
                if (Number.isFinite(nv)) {
                  setLeaves((arr) => arr.map((x, j) => (j === i ? nv : x)));
                }
              }}
              className="w-14 rounded border border-border bg-background px-1.5 py-1 text-center text-xs font-mono"
            />
          ))}
          <button
            type="button"
            onClick={() => setLeaves(DEFAULT_LEAVES)}
            className="rounded border border-border px-2 py-1 text-xs hover:bg-muted"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-3 grid sm:grid-cols-3 gap-2 text-xs">
        <div className="rounded border border-border bg-muted/30 p-2">
          <div className="text-muted-foreground">Root-verdi (minimax)</div>
          <div className="font-mono text-lg font-semibold">
            {fmt(nodes.get(rootId)!.value)}
          </div>
        </div>
        <div className="rounded border border-border bg-muted/30 p-2">
          <div className="text-muted-foreground">Noder besøkt</div>
          <div className="font-mono text-lg font-semibold">
            {visitOrder.length}
          </div>
        </div>
        <div className="rounded border border-border bg-muted/30 p-2">
          <div className="text-muted-foreground">Løv klippet av α-β</div>
          <div className="font-mono text-lg font-semibold">
            {useAlphaBeta ? `${leaves.length - visitOrder.filter((id) => Number(id.split("-")[0]) === DEPTH).length} av ${leaves.length}` : "0 (av)"}
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Blå sirkel = MAX-spiller, lilla = MIN-spiller. Stipla rød = klippet
        ved alpha-beta (besøkes aldri). Grønn kant = optimal trekk. Det «første
        steget» av en kunstig MAX-strategy kjører root → første barn → første
        barnebarn — derfor besøkes løv i venstre-først rekkefølge.
        {totalSavings}
      </div>
    </div>
  );
}
