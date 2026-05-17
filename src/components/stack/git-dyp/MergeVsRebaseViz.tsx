import { useState, type ReactNode } from "react";
import { GitMerge, RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// Merge vs Rebase, side-by-side.
// Samme utgangspunkt vises i to paneler. Hvert panel har sin egen knapp:
//   - Panel 1: "Run merge"  → ny merge-commit M med to foreldre.
//   - Panel 2: "Run rebase" → D og E «replayed» til D' og E' på toppen av C.
// Studenten kjører knappene uavhengig og ser ulike historie-former.
// --------------------------------------------------------------------------

type Node = {
  id: string;
  label: string; // sha-aktig
  x: number;
  y: number;
  fill: string;
  parents: string[];
  ghost?: boolean; // for å markere "gamle" commits ved rebase
};

const COL_MAIN = "rgb(56,189,248)"; // blå
const COL_FEAT = "rgb(34,197,94)"; // grønn
const COL_MERGE = "rgb(168,85,247)"; // lilla
const COL_REPLAY = "rgb(251,191,36)"; // gul

const SVG_W = 420;
const SVG_H = 200;

function baseNodes(): Node[] {
  // main: A B C  (på y=70)
  // feature: forgreining fra B → D E (på y=140)
  return [
    { id: "A", label: "a1b2c3", x: 60, y: 70, fill: COL_MAIN, parents: [] },
    { id: "B", label: "b2c3d4", x: 130, y: 70, fill: COL_MAIN, parents: ["A"] },
    { id: "C", label: "c3d4e5", x: 200, y: 70, fill: COL_MAIN, parents: ["B"] },
    { id: "D", label: "d4e5f6", x: 200, y: 140, fill: COL_FEAT, parents: ["B"] },
    { id: "E", label: "e5f6g7", x: 270, y: 140, fill: COL_FEAT, parents: ["D"] },
  ];
}

type State = "before" | "after";

function Panel({
  title,
  subtitle,
  state,
  nodes,
  branchLabels,
  onRun,
  onReset,
  runLabel,
  runColor,
}: {
  title: string;
  subtitle: string;
  state: State;
  nodes: Node[];
  branchLabels: { name: string; nodeId: string; color: string }[];
  onRun: () => void;
  onReset: () => void;
  runLabel: ReactNode;
  runColor: string;
}) {
  const byId: Record<string, Node> = {};
  nodes.forEach((n) => (byId[n.id] = n));
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-[11px] text-muted-foreground font-mono">{subtitle}</div>
        </div>
        {state === "before" ? (
          <button
            onClick={onRun}
            className="rounded-md px-2.5 py-1 text-xs font-medium border"
            style={{ borderColor: runColor, color: runColor, background: `${runColor}1a` }}
          >
            {runLabel}
          </button>
        ) : (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1 text-xs"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        )}
      </div>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto block">
        {/* Edges */}
        {nodes.map((n) =>
          n.parents.map((pid) => {
            const p = byId[pid];
            if (!p) return null;
            const cx = (n.x + p.x) / 2;
            const path = `M ${p.x} ${p.y} C ${cx} ${p.y}, ${cx} ${n.y}, ${n.x} ${n.y}`;
            return (
              <path
                key={`${pid}-${n.id}`}
                d={path}
                stroke="currentColor"
                strokeOpacity={n.ghost ? 0.18 : 0.45}
                strokeWidth={2}
                strokeDasharray={n.ghost ? "3 3" : undefined}
                fill="none"
              />
            );
          }),
        )}
        {/* Noder */}
        {nodes.map((n) => (
          <g key={n.id} opacity={n.ghost ? 0.35 : 1}>
            <circle
              cx={n.x}
              cy={n.y}
              r={11}
              fill={n.fill}
              fillOpacity={0.85}
              stroke="currentColor"
              strokeWidth={1}
              strokeDasharray={n.ghost ? "2 2" : undefined}
            />
            <text x={n.x} y={n.y + 24} textAnchor="middle" fontSize={9} className="fill-muted-foreground font-mono">
              {n.label}
            </text>
            <text x={n.x} y={n.y - 16} textAnchor="middle" fontSize={11} className="font-mono fill-foreground">
              {n.id}
            </text>
          </g>
        ))}
        {/* Branch-labels */}
        {branchLabels.map((b, i) => {
          const target = byId[b.nodeId];
          if (!target) return null;
          const lx = target.x + 20;
          const ly = target.y + 6 + i * 0;
          return (
            <g key={b.name}>
              <rect
                x={lx}
                y={ly - 9}
                width={b.name.length * 7 + 8}
                height={15}
                rx={3}
                fill={b.color}
                fillOpacity={0.18}
                stroke={b.color}
              />
              <text x={lx + 4} y={ly + 2} fontSize={10} className="font-mono" fill={b.color}>
                {b.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function MergeVsRebaseViz() {
  const [mergeState, setMergeState] = useState<State>("before");
  const [rebaseState, setRebaseState] = useState<State>("before");

  const beforeBranches = [
    { name: "main", nodeId: "C", color: COL_MAIN },
    { name: "feature", nodeId: "E", color: COL_FEAT },
  ];

  // ---- MERGE ----
  const mergeAfterNodes: Node[] = [
    ...baseNodes(),
    {
      id: "M",
      label: "m9n8o7",
      x: 340,
      y: 140,
      fill: COL_MERGE,
      parents: ["E", "C"], // to foreldre — det er DETTE som gjør det til en merge-commit
    },
  ];
  const mergeAfterBranches = [
    { name: "main", nodeId: "C", color: COL_MAIN },
    { name: "feature", nodeId: "M", color: COL_FEAT },
  ];

  // ---- REBASE ----
  // D og E blir til D' og E' over C. Originale forblir som «orphan» (ghost).
  const rebaseAfterNodes: Node[] = [
    // beholder A,B,C som main-stamme
    { id: "A", label: "a1b2c3", x: 60, y: 70, fill: COL_MAIN, parents: [] },
    { id: "B", label: "b2c3d4", x: 130, y: 70, fill: COL_MAIN, parents: ["A"] },
    { id: "C", label: "c3d4e5", x: 200, y: 70, fill: COL_MAIN, parents: ["B"] },
    // gamle D, E som ghost (visuelt skygget)
    { id: "D", label: "d4e5f6", x: 200, y: 150, fill: COL_FEAT, parents: ["B"], ghost: true },
    { id: "E", label: "e5f6g7", x: 270, y: 150, fill: COL_FEAT, parents: ["D"], ghost: true },
    // nye replayed commits på toppen av C
    { id: "D'", label: "9e8f7a6", x: 270, y: 70, fill: COL_REPLAY, parents: ["C"] },
    { id: "E'", label: "1f2e3d4", x: 340, y: 70, fill: COL_REPLAY, parents: ["D'"] },
  ];
  const rebaseAfterBranches = [
    { name: "main", nodeId: "C", color: COL_MAIN },
    { name: "feature", nodeId: "E'", color: COL_FEAT },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
        Merge vs Rebase
      </div>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
        Begge får inn endringer fra <code className="font-mono">main</code> i{" "}
        <code className="font-mono">feature</code>. Forskjellen er hva slags historie du sitter
        igjen med. Klikk knappene i hvert panel for å se det skje.
      </p>

      <div className="grid md:grid-cols-2 gap-3">
        <Panel
          title="git merge main"
          subtitle="( fra feature )"
          state={mergeState}
          nodes={mergeState === "before" ? baseNodes() : mergeAfterNodes}
          branchLabels={mergeState === "before" ? beforeBranches : mergeAfterBranches}
          onRun={() => setMergeState("after")}
          onReset={() => setMergeState("before")}
          runLabel={<><GitMerge className="inline h-3 w-3 -mt-0.5" /> Run merge</>}
          runColor={COL_MERGE}
        />
        <Panel
          title="git rebase main"
          subtitle="( fra feature )"
          state={rebaseState}
          nodes={rebaseState === "before" ? baseNodes() : rebaseAfterNodes}
          branchLabels={rebaseState === "before" ? beforeBranches : rebaseAfterBranches}
          onRun={() => setRebaseState("after")}
          onReset={() => setRebaseState("before")}
          runLabel="Run rebase"
          runColor={COL_REPLAY}
        />
      </div>

      <div className="mt-3 grid sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-md border border-border bg-background/40 p-3">
          <div className="font-semibold mb-1" style={{ color: COL_MERGE }}>Merge</div>
          <pre className="font-mono text-[11px] leading-snug whitespace-pre-wrap">
{`M er en MERGE-COMMIT.
  parents = [E, C]   (to foreldre!)
  ingen sha endres.

Historikken bevarer at to spor
faktisk var parallelle. Greit
for langlivede branches.

git log --graph viser «Y».`}
          </pre>
        </div>
        <div className="rounded-md border border-border bg-background/40 p-3">
          <div className="font-semibold mb-1" style={{ color: COL_REPLAY }}>Rebase</div>
          <pre className="font-mono text-[11px] leading-snug whitespace-pre-wrap">
{`D og E er REPLAYED som D' og E':
  ny sha, samme diff, ny parent.

Original D og E er nå unreferert
(stiplet) — de blir GC-ed med tid,
men reflog finner dem inntil da.

Lineær historie. Pent før PR.
ALDRI rebase delt branch.`}
          </pre>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Legg merke til:</strong> i merge-panelet endrer{" "}
        <code className="font-mono">main</code>-pekeren seg ikke — du står på{" "}
        <code className="font-mono">feature</code>, og feature får én ny commit (M) med to
        foreldre. I rebase-panelet er D og E erstattet med D' og E' (ny sha — samme diff). De
        gamle D/E henger igjen som «orphan» til garbage-collection rydder.
      </p>
    </div>
  );
}
