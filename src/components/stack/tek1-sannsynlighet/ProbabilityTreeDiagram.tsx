import { useMemo, useState } from "react";

/**
 * ProbabilityTreeDiagram
 *
 * Bygger et tre med 1-3 nivå. Hver node har 2-4 grener; brukeren kan justere
 * P(grein) via sliders. Sannsynligheter normaliseres automatisk innenfor en node
 * (vi viser advarsel hvis summen avviker mer enn 0.01).
 *
 * SVG-treet tegnes live, og P(blad) = ∏ P(grein) langs vei fra rot.
 * Forhåndsdefinerte presets: medisinsk test, kortstokk, Monty Hall, fødsel.
 */

type Branch = {
  label: string;
  p: number;
  children?: Branch[];
};

type Preset = {
  id: string;
  name: string;
  description: string;
  root: Branch;
};

const PRESETS: Preset[] = [
  {
    id: "medisinsk",
    name: "Medisinsk test (sjelden sykdom)",
    description:
      "Sykdom hos 1% av befolkningen. Sensitivitet 99%, spesifisitet 95%. Se hvor få av de positive som faktisk er syke.",
    root: {
      label: "Person",
      p: 1,
      children: [
        {
          label: "Syk (1%)",
          p: 0.01,
          children: [
            { label: "Test +", p: 0.99 },
            { label: "Test −", p: 0.01 },
          ],
        },
        {
          label: "Frisk (99%)",
          p: 0.99,
          children: [
            { label: "Test +", p: 0.05 },
            { label: "Test −", p: 0.95 },
          ],
        },
      ],
    },
  },
  {
    id: "kort",
    name: "Trekk to kort (uten tilbakelegging)",
    description:
      "Først trekkes en farge (rød/sort). Andre trekk er avhengig av første — sannsynlighetene endres.",
    root: {
      label: "Kortstokk",
      p: 1,
      children: [
        {
          label: "1. Rød (26/52)",
          p: 0.5,
          children: [
            { label: "2. Rød (25/51)", p: 25 / 51 },
            { label: "2. Sort (26/51)", p: 26 / 51 },
          ],
        },
        {
          label: "1. Sort (26/52)",
          p: 0.5,
          children: [
            { label: "2. Rød (26/51)", p: 26 / 51 },
            { label: "2. Sort (25/51)", p: 25 / 51 },
          ],
        },
      ],
    },
  },
  {
    id: "monty",
    name: "Monty Hall (2/3-bytte)",
    description:
      "Bilen står bak en av 3 dører. Du velger dør 1. Vert åpner dør 2 eller 3 med geit. Tre-diagrammet viser hvorfor BYTTE vinner 2/3.",
    root: {
      label: "Bilen er bak…",
      p: 1,
      children: [
        {
          label: "Dør 1 (1/3) — du gjettet rett",
          p: 1 / 3,
          children: [
            { label: "Behold ⇒ VINN", p: 1 },
            { label: "Bytt ⇒ TAP", p: 0 },
          ],
        },
        {
          label: "Dør 2 (1/3) — du gjettet feil",
          p: 1 / 3,
          children: [
            { label: "Behold ⇒ TAP", p: 0 },
            { label: "Bytt ⇒ VINN", p: 1 },
          ],
        },
        {
          label: "Dør 3 (1/3) — du gjettet feil",
          p: 1 / 3,
          children: [
            { label: "Behold ⇒ TAP", p: 0 },
            { label: "Bytt ⇒ VINN", p: 1 },
          ],
        },
      ],
    },
  },
  {
    id: "fodsel",
    name: "Fødsel av jente/gutt (2 barn)",
    description:
      "Hver fødsel uavhengig, P(jente)=P(gutt)=0.5. Vis fordelingen for to barn i rekkefølge.",
    root: {
      label: "Familie",
      p: 1,
      children: [
        {
          label: "1. Jente (½)",
          p: 0.5,
          children: [
            { label: "2. Jente (½)", p: 0.5 },
            { label: "2. Gutt (½)", p: 0.5 },
          ],
        },
        {
          label: "1. Gutt (½)",
          p: 0.5,
          children: [
            { label: "2. Jente (½)", p: 0.5 },
            { label: "2. Gutt (½)", p: 0.5 },
          ],
        },
      ],
    },
  },
];

type Leaf = {
  path: string[];
  pathProbs: number[];
  leafProb: number;
};

function collectLeaves(
  node: Branch,
  parentPath: string[] = [],
  parentProbs: number[] = [],
  parentP = 1,
): Leaf[] {
  if (!node.children || node.children.length === 0) {
    return [
      {
        path: [...parentPath, node.label],
        pathProbs: [...parentProbs, node.p],
        leafProb: parentP * node.p,
      },
    ];
  }
  const out: Leaf[] = [];
  for (const child of node.children) {
    out.push(
      ...collectLeaves(
        child,
        [...parentPath, node.label],
        [...parentProbs, node.p],
        parentP * node.p,
      ),
    );
  }
  return out;
}

// Render SVG tree by computing positions in a vertical layout (root at left, leaves at right).
type Pos = {
  x: number;
  y: number;
  node: Branch;
  parentY?: number;
  parentX?: number;
  pathToRoot: number[];
  depth: number;
};

function layoutTree(root: Branch, width: number, height: number) {
  const leaves = collectLeaves(root);
  const leafCount = leaves.length;
  const positions: Pos[] = [];
  const links: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    label: string;
    pBranch: number;
    midX: number;
    midY: number;
  }[] = [];

  // Determine depth
  function maxDepth(n: Branch, d = 0): number {
    if (!n.children || n.children.length === 0) return d;
    return Math.max(...n.children.map((c) => maxDepth(c, d + 1)));
  }
  const depth = maxDepth(root);
  const layerWidth = depth === 0 ? width : (width - 40) / depth;

  // Y-positions: each leaf takes equal vertical share; internal nodes are mean of their leaves.
  let leafIdx = 0;
  const leafSpacing = height / Math.max(leafCount, 1);

  function place(
    node: Branch,
    d: number,
    parentY: number | null,
    parentX: number | null,
  ): { y: number; x: number } {
    const x = 20 + d * layerWidth;
    let y: number;
    if (!node.children || node.children.length === 0) {
      y = leafSpacing * (leafIdx + 0.5);
      leafIdx++;
    } else {
      const childPositions = node.children.map((c) => place(c, d + 1, null, null));
      y = childPositions.reduce((s, p) => s + p.y, 0) / childPositions.length;
      // Now add the link from this node to each child
      childPositions.forEach((cp, i) => {
        const child = node.children![i];
        links.push({
          x1: x,
          y1: y,
          x2: cp.x,
          y2: cp.y,
          label: child.label,
          pBranch: child.p,
          midX: (x + cp.x) / 2,
          midY: (y + cp.y) / 2,
        });
      });
    }
    positions.push({
      x,
      y,
      node,
      depth: d,
      pathToRoot: [],
      parentY: parentY ?? undefined,
      parentX: parentX ?? undefined,
    });
    return { x, y };
  }
  place(root, 0, null, null);
  return { positions, links, leaves };
}

// Mutate path of branch probabilities. We use a JSON-clone strategy keyed by index path.
function updateBranch(root: Branch, indexPath: number[], newP: number): Branch {
  const cloned: Branch = JSON.parse(JSON.stringify(root));
  let cursor: Branch = cloned;
  for (let i = 0; i < indexPath.length - 1; i++) {
    cursor = cursor.children![indexPath[i]];
  }
  if (indexPath.length > 0) {
    cursor.children![indexPath[indexPath.length - 1]].p = newP;
  }
  return cloned;
}

function flattenForControls(
  node: Branch,
  indexPath: number[] = [],
  depth = 0,
): { branch: Branch; indexPath: number[]; depth: number; parentLabel: string }[] {
  const out: { branch: Branch; indexPath: number[]; depth: number; parentLabel: string }[] = [];
  if (node.children) {
    node.children.forEach((c, i) => {
      out.push({
        branch: c,
        indexPath: [...indexPath, i],
        depth: depth + 1,
        parentLabel: node.label,
      });
      out.push(...flattenForControls(c, [...indexPath, i], depth + 1));
    });
  }
  return out;
}

function siblingSums(root: Branch): { parentPath: number[]; sum: number; siblings: number[] }[] {
  const result: { parentPath: number[]; sum: number; siblings: number[] }[] = [];
  function walk(n: Branch, path: number[]) {
    if (n.children && n.children.length > 0) {
      const sum = n.children.reduce((s, c) => s + c.p, 0);
      result.push({ parentPath: path, sum, siblings: n.children.map((c) => c.p) });
      n.children.forEach((c, i) => walk(c, [...path, i]));
    }
  }
  walk(root, []);
  return result;
}

export function ProbabilityTreeDiagram() {
  const [presetId, setPresetId] = useState<string>(PRESETS[0].id);
  const [root, setRoot] = useState<Branch>(() => JSON.parse(JSON.stringify(PRESETS[0].root)));

  const preset = PRESETS.find((p) => p.id === presetId)!;

  const layout = useMemo(() => {
    const leafCount = collectLeaves(root).length;
    return layoutTree(root, 460, Math.max(160, leafCount * 44));
  }, [root]);

  const controls = useMemo(() => flattenForControls(root), [root]);
  const sums = useMemo(() => siblingSums(root), [root]);
  const totalLeafSum = useMemo(() => layout.leaves.reduce((s, l) => s + l.leafProb, 0), [layout]);

  function applyPreset(id: string) {
    const p = PRESETS.find((x) => x.id === id)!;
    setPresetId(id);
    setRoot(JSON.parse(JSON.stringify(p.root)));
  }

  function setBranchP(indexPath: number[], newP: number) {
    setRoot((r) => updateBranch(r, indexPath, newP));
  }

  const svgHeight = Math.max(180, layout.leaves.length * 44);
  const totalOff = Math.abs(totalLeafSum - 1) > 0.01;
  const anyBadSibling = sums.some((s) => Math.abs(s.sum - 1) > 0.01);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Preset:</span>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => applyPreset(p.id)}
            className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
              presetId === p.id
                ? "border-brand bg-brand/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{preset.description}</p>

      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        <div className="overflow-x-auto rounded-lg border border-border bg-background p-2">
          <svg width={500} height={svgHeight} className="text-foreground">
            {layout.links.map((l, i) => (
              <g key={`link-${i}`}>
                <line
                  x1={l.x1}
                  y1={l.y1}
                  x2={l.x2}
                  y2={l.y2}
                  stroke="currentColor"
                  strokeOpacity={0.4}
                  strokeWidth={1.5}
                />
                <text
                  x={l.midX}
                  y={l.midY - 4}
                  fontSize={10}
                  textAnchor="middle"
                  fill="currentColor"
                  className="font-mono"
                >
                  p={l.pBranch.toFixed(3)}
                </text>
              </g>
            ))}
            {layout.positions.map((pos, i) => (
              <g key={`node-${i}`}>
                <circle cx={pos.x} cy={pos.y} r={5} fill="currentColor" />
                <text
                  x={pos.x + (pos.depth === 0 ? -8 : 8)}
                  y={pos.y + 4}
                  fontSize={11}
                  textAnchor={pos.depth === 0 ? "end" : "start"}
                  fill="currentColor"
                  className="font-mono"
                >
                  {pos.node.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold">Justér grenene</div>
          <div className="max-h-[260px] overflow-y-auto pr-1 space-y-1.5">
            {controls.map((c) => (
              <div key={c.indexPath.join("-")} className="text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-mono">
                    <span className="text-muted-foreground">{c.parentLabel} →</span>{" "}
                    {c.branch.label}
                  </span>
                  <span className="tabular-nums">{c.branch.p.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={c.branch.p}
                  onChange={(e) => setBranchP(c.indexPath, parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
          <div className="text-[11px] space-y-1">
            <div className="text-muted-foreground">Søsken-summer:</div>
            {sums.map((s, i) => (
              <div
                key={i}
                className={`flex justify-between font-mono ${Math.abs(s.sum - 1) > 0.01 ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-emerald-600 dark:text-emerald-400"}`}
              >
                <span>Σ-nivå {s.parentPath.length + 1}</span>
                <span className="tabular-nums">{s.sum.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold mb-2">
          Blad-sannsynligheter (P(blad) = ∏ p langs vei)
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-1.5 font-semibold">Vei</th>
                <th className="text-right px-3 py-1.5 font-semibold">Produkt</th>
                <th className="text-right px-3 py-1.5 font-semibold">P(blad)</th>
              </tr>
            </thead>
            <tbody>
              {layout.leaves.map((l, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-3 py-1.5 font-mono">{l.path.slice(1).join(" → ")}</td>
                  <td className="px-3 py-1.5 text-right font-mono text-muted-foreground">
                    {l.pathProbs
                      .slice(1)
                      .map((p) => p.toFixed(2))
                      .join(" × ")}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono font-semibold tabular-nums">
                    {l.leafProb.toFixed(4)}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-border bg-muted/30">
                <td className="px-3 py-1.5 font-semibold">Σ alle blad</td>
                <td className="px-3 py-1.5"></td>
                <td
                  className={`px-3 py-1.5 text-right font-mono font-bold tabular-nums ${totalOff ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}
                >
                  {totalLeafSum.toFixed(4)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {(totalOff || anyBadSibling) && (
          <div className="mt-2 rounded-md border border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300 p-2 text-[11px]">
            Søsken-summer som ikke er 1 betyr at noen utfall mangler — totalen over alle blad
            avviker fra 1.000. Juster slidersene til hver gruppe summerer til 1.
          </div>
        )}
      </div>
    </div>
  );
}
