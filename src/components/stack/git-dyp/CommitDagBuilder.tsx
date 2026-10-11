import { useMemo, useState } from "react";
import { GitBranch, GitCommit, RotateCcw, Plus } from "lucide-react";

// --------------------------------------------------------------------------
// Commit-DAG-builder.
// Studenten bygger en liten Git-historie ved å klikke:
//   - "Commit on <branch>"  → ny SHA-node festet til branchen sin HEAD
//   - "Checkout <branch>"   → flytter HEAD til den branchen
//   - "Branch fra HEAD"     → lag ny branch som peker på samme commit
// Hele poenget: en branch ER bare et navn som peker på en sha.
// Lag merker det ved at flere branches kan dele samme commit, og at
// "commit on main" bare flytter main-pekeren — ikke filer.
// --------------------------------------------------------------------------

type Commit = {
  sha: string;
  parents: string[];
  message: string;
  branchLane: number; // visuell lane (rad)
  x: number; // visuell kolonne (steg)
};

type BranchRef = {
  name: string;
  commitSha: string;
  color: string;
};

const BRANCH_COLORS = [
  "rgb(56,189,248)", // blå — main
  "rgb(34,197,94)", // grønn — feature
  "rgb(251,191,36)", // gul — hotfix
  "rgb(244,114,182)", // rosa
];

function makeSha(seed: number): string {
  // Deterministisk «sha» — 7 hex-tegn. Bare en visualisering.
  const hex = "0123456789abcdef";
  let s = "";
  let n = seed * 2654435761;
  for (let i = 0; i < 7; i++) {
    n = (n ^ (n << 13)) >>> 0;
    n = (n ^ (n >>> 17)) >>> 0;
    s += hex[n & 0xf];
    n = n >>> 4;
  }
  return s;
}

const MESSAGES = [
  "init",
  "feat: parser",
  "fix: edge case",
  "refactor: pull out helper",
  "feat: new endpoint",
  "test: add cases",
  "chore: bump deps",
  "fix: typo",
  "feat: cache layer",
  "docs: README",
];

function initialState(): { commits: Commit[]; branches: BranchRef[]; head: string; counter: number } {
  // Start med én commit på main.
  const first: Commit = {
    sha: makeSha(1),
    parents: [],
    message: MESSAGES[0],
    branchLane: 0,
    x: 0,
  };
  return {
    commits: [first],
    branches: [{ name: "main", commitSha: first.sha, color: BRANCH_COLORS[0] }],
    head: "main",
    counter: 1,
  };
}

export function CommitDagBuilder() {
  const [state, setState] = useState(initialState);
  const { commits, branches, head, counter } = state;

  const headCommitSha = useMemo(() => {
    const b = branches.find((br) => br.name === head);
    return b ? b.commitSha : head; // detached HEAD = sha direkte
  }, [branches, head]);

  const commitOnHead = () => {
    const headBranch = branches.find((b) => b.name === head);
    if (!headBranch) return; // detached — ikke støttet for forenklingens skyld
    const parent = commits.find((c) => c.sha === headBranch.commitSha)!;
    const newSha = makeSha(counter + 1);
    const newCommit: Commit = {
      sha: newSha,
      parents: [parent.sha],
      message: MESSAGES[(counter + 1) % MESSAGES.length],
      branchLane: parent.branchLane,
      x: parent.x + 1,
    };
    setState({
      commits: [...commits, newCommit],
      branches: branches.map((b) => (b.name === head ? { ...b, commitSha: newSha } : b)),
      head,
      counter: counter + 1,
    });
  };

  const checkoutBranch = (name: string) => {
    setState({ ...state, head: name });
  };

  const newBranch = () => {
    // Finn første ledige navn og lane.
    const existing = new Set(branches.map((b) => b.name));
    const names = ["feature", "hotfix", "topic", "experiment", "wip"];
    const name = names.find((n) => !existing.has(n)) || `branch-${branches.length}`;
    const usedLanes = new Set(branches.map((_b, i) => i));
    let lane = 1;
    while (usedLanes.has(lane)) lane++;
    const color = BRANCH_COLORS[branches.length % BRANCH_COLORS.length];
    // Lag-en til den NYE branchen brukes når neste commit kommer.
    const newBranchRef: BranchRef = { name, commitSha: headCommitSha, color };
    setState({
      ...state,
      branches: [...branches, newBranchRef],
      head: name,
    });
    // Vi merker lanen ved at den første commiten ETTER branch-bytte plasseres
    // på en ny lane — implementeres ved å justere `branchLane` i commitOnHead
    // basert på antall branches per parent. Forenklet: vi setter lane manuelt
    // i en wrap-funksjon under.
    pendingLaneRef[name] = lane;
  };

  const reset = () => {
    Object.keys(pendingLaneRef).forEach((k) => delete pendingLaneRef[k]);
    setState(initialState());
  };

  // Wrap commitOnHead slik at vi kan plassere første commit på ny branch i ny lane.
  const wrappedCommitOnHead = () => {
    const headBranch = branches.find((b) => b.name === head);
    if (!headBranch) return;
    const parent = commits.find((c) => c.sha === headBranch.commitSha)!;
    const newSha = makeSha(counter + 1);
    const overrideLane = pendingLaneRef[head];
    const lane = overrideLane !== undefined ? overrideLane : parent.branchLane;
    if (overrideLane !== undefined) delete pendingLaneRef[head];
    const newCommit: Commit = {
      sha: newSha,
      parents: [parent.sha],
      message: MESSAGES[(counter + 1) % MESSAGES.length],
      branchLane: lane,
      x: parent.x + 1,
    };
    setState({
      commits: [...commits, newCommit],
      branches: branches.map((b) => (b.name === head ? { ...b, commitSha: newSha } : b)),
      head,
      counter: counter + 1,
    });
  };

  // Layout-konstanter.
  const stepX = 70;
  const laneY = 60;
  const padL = 60;
  const padT = 30;
  const maxX = Math.max(...commits.map((c) => c.x), 0);
  const maxLane = Math.max(...commits.map((c) => c.branchLane), 0);
  const svgW = padL + (maxX + 2) * stepX + 100; // ekstra for branch-labels
  const svgH = padT + (maxLane + 1) * laneY + 30;

  const commitByLane: Record<string, Commit> = {};
  commits.forEach((c) => (commitByLane[c.sha] = c));

  // Branch-labels: hvis flere branches peker på samme commit, stable dem.
  const labelsByCommit: Record<string, BranchRef[]> = {};
  branches.forEach((b) => {
    if (!labelsByCommit[b.commitSha]) labelsByCommit[b.commitSha] = [];
    labelsByCommit[b.commitSha].push(b);
  });

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
        Commit-DAG-builder
      </div>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
        Klikk for å bygge historikk. Branches er <strong>bare navn</strong> som peker på en sha —
        legg merke til at <code className="font-mono">main</code> bare flytter seg, ingen filer
        kopieres.
      </p>

      {/* Kontroller */}
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
        <button
          onClick={wrappedCommitOnHead}
          className="inline-flex items-center gap-1 rounded-md border border-brand/40 bg-brand/10 hover:bg-brand/20 text-brand px-2.5 py-1 font-medium"
        >
          <GitCommit className="h-3.5 w-3.5" />
          Commit on <span className="font-mono">{head}</span>
        </button>
        <button
          onClick={newBranch}
          disabled={branches.length >= BRANCH_COLORS.length}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2.5 py-1 disabled:opacity-40"
        >
          <GitBranch className="h-3.5 w-3.5" />
          Ny branch fra HEAD
        </button>
        <div className="flex items-center gap-1 ml-2">
          <span className="text-muted-foreground">Checkout:</span>
          {branches.map((b) => (
            <button
              key={b.name}
              onClick={() => checkoutBranch(b.name)}
              className={
                "rounded px-2 py-0.5 font-mono text-[11px] border transition " +
                (b.name === head
                  ? "border-brand bg-brand/15 text-brand font-semibold"
                  : "border-border hover:bg-muted/40")
              }
              style={b.name === head ? undefined : { color: b.color }}
            >
              {b.name}
            </button>
          ))}
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1 ml-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      {/* SVG */}
      <div className="rounded-lg border border-border bg-background/40 overflow-x-auto">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto block" style={{ minWidth: svgW }}>
          {/* Edges (parent-pekere) */}
          {commits.map((c) =>
            c.parents.map((pSha) => {
              const p = commitByLane[pSha];
              if (!p) return null;
              const x1 = padL + p.x * stepX;
              const y1 = padT + p.branchLane * laneY;
              const x2 = padL + c.x * stepX;
              const y2 = padT + c.branchLane * laneY;
              const cx = (x1 + x2) / 2;
              const path = `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
              return (
                <path
                  key={`e-${pSha}-${c.sha}`}
                  d={path}
                  stroke="currentColor"
                  strokeOpacity={0.45}
                  strokeWidth={2}
                  fill="none"
                />
              );
            }),
          )}

          {/* Commit-noder */}
          {commits.map((c) => {
            const cx = padL + c.x * stepX;
            const cy = padT + c.branchLane * laneY;
            const isHead = c.sha === headCommitSha;
            const fill = isHead ? "rgb(251,191,36)" : "rgb(56,189,248)";
            return (
              <g key={c.sha}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHead ? 13 : 11}
                  fill={fill}
                  fillOpacity={0.85}
                  stroke="currentColor"
                  strokeWidth={isHead ? 2 : 1}
                />
                <text
                  x={cx}
                  y={cy + 25}
                  textAnchor="middle"
                  fontSize={10}
                  className="fill-muted-foreground font-mono"
                >
                  {c.sha}
                </text>
                <text
                  x={cx}
                  y={cy + 38}
                  textAnchor="middle"
                  fontSize={9}
                  className="fill-muted-foreground"
                  fontStyle="italic"
                >
                  {c.message}
                </text>
              </g>
            );
          })}

          {/* Branch-labels og HEAD */}
          {Object.entries(labelsByCommit).map(([sha, refs]) => {
            const c = commitByLane[sha];
            if (!c) return null;
            const cx = padL + c.x * stepX;
            const cy = padT + c.branchLane * laneY;
            return (
              <g key={`lab-${sha}`}>
                {refs.map((r, i) => {
                  const ly = cy - 20 - i * 16;
                  const lx = cx + 20;
                  const isHead = r.name === head;
                  return (
                    <g key={r.name}>
                      <rect
                        x={lx}
                        y={ly - 10}
                        width={Math.max(40, r.name.length * 7 + (isHead ? 38 : 8))}
                        height={16}
                        rx={3}
                        fill={r.color}
                        fillOpacity={0.18}
                        stroke={r.color}
                        strokeWidth={1}
                      />
                      <text
                        x={lx + 4}
                        y={ly + 2}
                        fontSize={10}
                        className="font-mono"
                        fill={r.color}
                      >
                        {r.name}
                        {isHead ? "  ← HEAD" : ""}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Status / forklaring */}
      <div className="mt-3 grid sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-md border border-border bg-background/40 p-3">
          <div className="font-semibold mb-1">Hva skjedde nettopp</div>
          <pre className="font-mono text-[11px] leading-snug whitespace-pre-wrap">
{`HEAD          → ${head}
${head}        → ${headCommitSha}
antall commits = ${commits.length}
antall refs    = ${branches.length}

cat .git/HEAD
# ref: refs/heads/${head}

cat .git/refs/heads/${head}
# ${headCommitSha}`}
          </pre>
        </div>
        <div className="rounded-md border border-border bg-background/40 p-3">
          <div className="font-semibold mb-1">Hvorfor er branches «billige»?</div>
          <p className="leading-relaxed text-muted-foreground">
            En branch er bare en <strong>fil</strong> i <code className="font-mono">.git/refs/heads/</code>{" "}
            som inneholder én sha. Når du commit-er flyttes sha-en — ingen filer blir kopiert.
            Det er derfor du kan ha 50 branches uten å bruke noe særlig disk.
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Prøv:</strong> commit et par ganger på{" "}
        <code className="font-mono">main</code>, lag ny branch, commit der, switch tilbake til
        main, commit igjen — nå har du en gaffel. DAG-en viser to spor som deler felles fortid.
      </p>
    </div>
  );
}

// Lane-overstyring for første commit etter branch-opprettelse.
// Modul-scope fordi useState ville skapt en re-render-løkke;
// dette er ren UI-state, ingen race conditions i React.
const pendingLaneRef: Record<string, number> = {};
