import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import {
  VisualizerShell,
  StepControls,
  useStepRunner,
  KeyboardScope,
  type ModeDef,
} from "@/components/visualizer-shell";

// --------------------------------------------------------------------------
// Interaktiv visualisering for rekursjon. Fire moduser: factorial / fib /
// hanoi / fibMemo. Bruker shared shell-primitiver. Steg-listen bygges
// opp-front for hver kjøring; useStepRunner styrer play/pause/step/scrub.
// --------------------------------------------------------------------------

type Mode = "factorial" | "fib" | "hanoi" | "fibMemo";

const MODES: ModeDef<Mode>[] = [
  { id: "factorial", label: "factorial(n)", sub: "lineær — én gren" },
  { id: "fib", label: "fib(n)", sub: "eksponentiell — to grener" },
  { id: "hanoi", label: "Tårnene i Hanoi", sub: "del-og-hersk + flytt disk" },
  { id: "fibMemo", label: "fib(n) med cache", sub: "memoisert — O(n) i steder for O(2ⁿ)" },
];

const MODE_NOTE: Record<Mode, string> = {
  factorial:
    "Lineær rekursjon: hver call lager ett nytt kall. Stacken vokser ned til base case, så popper alle av i omvendt rekkefølge.",
  fib: "Hver fib(n) lager to underkall. fib(n-2) regnes ut igjen og igjen — markert i rødt i treet. Det er derfor naiv fib er O(2ⁿ).",
  hanoi:
    "Klassisk del-og-hersk: flytt n-1 fra src→via, flytt største disk src→dst, flytt n-1 fra via→dst. Antall trekk = 2ⁿ − 1.",
  fibMemo:
    "Memoisering: vi cacher fib(k) første gang vi regner det ut. Andre gang trenger vi ikke ekspandere treet — returnerer rett fra cache.",
};

const CODE: Record<Mode, { lines: string[] }> = {
  factorial: {
    lines: ["def fakultet(n):", "    if n <= 1:", "        return 1", "    return n * fakultet(n - 1)"],
  },
  fib: {
    lines: ["def fib(n):", "    if n < 2:", "        return n", "    return fib(n - 1) + fib(n - 2)"],
  },
  hanoi: {
    lines: [
      "def hanoi(n, src, via, dst):",
      "    if n == 1:",
      "        move(src, dst)",
      "        return",
      "    hanoi(n - 1, src, dst, via)",
      "    move(src, dst)",
      "    hanoi(n - 1, via, src, dst)",
    ],
  },
  fibMemo: {
    lines: ["@lru_cache(maxsize=None)", "def fib(n):", "    if n < 2:", "        return n", "    return fib(n - 1) + fib(n - 2)"],
  },
};

type NodeStatus = "pending" | "active" | "returning" | "done" | "cache-hit";

interface TreeNode {
  id: number;
  parent: number | null;
  label: string;
  depth: number;
  status: NodeStatus;
  returnValue?: number;
  duplicate?: boolean;
  cached?: boolean;
}

interface StackFrame {
  id: number;
  label: string;
  detail?: string;
}

interface HanoiState {
  pegs: number[][];
  lastMove?: { disk: number; from: number; to: number };
}

interface FrameSnapshot {
  description: string;
  codeLine: number;
  stack: StackFrame[];
  tree: TreeNode[];
  activeNodeId: number | null;
  hanoi?: HanoiState;
  callCount?: number;
  uncachedCount?: number;
}

// --------------------------------------------------------------------------
// Step-generatorer per modus.
// --------------------------------------------------------------------------

function buildFactorialFrames(n: number): FrameSnapshot[] {
  const frames: FrameSnapshot[] = [];
  let nextId = 1;
  const ids: number[] = [];
  for (let k = n; k >= 1; k--) ids.push(nextId++);
  const tree: TreeNode[] = ids.map((id, i) => ({
    id, parent: i === 0 ? null : ids[i - 1], label: `fakt(${n - i})`, depth: i, status: "pending",
  }));
  const snap = (description: string, codeLine: number, stack: StackFrame[], activeNodeId: number | null) => {
    frames.push({ description, codeLine, stack: stack.map((s) => ({ ...s })), tree: tree.map((t) => ({ ...t })), activeNodeId });
  };
  const stack: StackFrame[] = [];
  for (let i = 0; i < ids.length; i++) {
    const value = n - i;
    const id = ids[i];
    tree[i].status = "active";
    stack.push({ id, label: `fakt(${value})`, detail: value <= 1 ? "n=1 → base case" : `venter på fakt(${value - 1})` });
    const codeLine = value <= 1 ? 2 : 3;
    const desc = value <= 1
      ? `fakt(${value}): base case treffer — returnerer 1.`
      : `fakt(${value}) kalles → push frame. Trenger fakt(${value - 1}) først.`;
    snap(desc, codeLine, stack, id);
  }
  let acc = 1;
  tree[tree.length - 1].status = "done";
  tree[tree.length - 1].returnValue = 1;
  for (let i = ids.length - 1; i >= 0; i--) {
    const value = n - i;
    if (value <= 1) {
      acc = 1;
      stack.pop();
      snap(`fakt(1) returnerer 1. Pop frame.`, 2, stack, i > 0 ? ids[i - 1] : null);
    } else {
      const prev = acc;
      acc = value * acc;
      tree[i].status = "done";
      tree[i].returnValue = acc;
      stack.pop();
      snap(`fakt(${value}) regner ${value} · ${prev} = ${acc}. Pop frame.`, 3, stack, i > 0 ? ids[i - 1] : null);
    }
  }
  return frames;
}

function buildFibFrames(n: number): FrameSnapshot[] {
  const frames: FrameSnapshot[] = [];
  const tree: TreeNode[] = [];
  let nextId = 1;
  const seenCounts: Map<number, number> = new Map();
  const stack: StackFrame[] = [];
  const snap = (description: string, codeLine: number, activeNodeId: number | null) => {
    frames.push({ description, codeLine, stack: stack.map((s) => ({ ...s })), tree: tree.map((t) => ({ ...t })), activeNodeId });
  };
  function run(k: number, parent: number | null, depth: number): number {
    const id = nextId++;
    const node: TreeNode = { id, parent, label: `f(${k})`, depth, status: "active" };
    const count = (seenCounts.get(k) ?? 0) + 1;
    seenCounts.set(k, count);
    if (count > 1 && k >= 2) node.duplicate = true;
    tree.push(node);
    stack.push({ id, label: `f(${k})`, detail: k < 2 ? `n=${k} → base` : `venter på f(${k - 1}) + f(${k - 2})` });
    snap(
      k < 2 ? `f(${k}): base case — returnerer ${k}.` : `f(${k}) kalles → push frame. Trenger f(${k - 1}) + f(${k - 2}).`,
      k < 2 ? 2 : 0, id,
    );
    if (k < 2) {
      node.status = "done";
      node.returnValue = k;
      stack.pop();
      snap(`f(${k}) returnerer ${k}. Pop frame.`, 2, parent);
      return k;
    }
    snap(`f(${k}): kall venstre — f(${k - 1}).`, 3, id);
    const left = run(k - 1, id, depth + 1);
    node.status = "active";
    stack.pop();
    stack.push({ id, label: `f(${k})`, detail: `f(${k - 1})=${left}, kall høyre` });
    snap(`f(${k}): venstre returnerte ${left}. Kall høyre — f(${k - 2}).`, 3, id);
    const right = run(k - 2, id, depth + 1);
    node.status = "done";
    node.returnValue = left + right;
    stack.pop();
    snap(`f(${k}) = ${left} + ${right} = ${left + right}. Pop frame.`, 3, parent);
    return left + right;
  }
  run(n, null, 0);
  tree.forEach((t) => { if (t.status === "active" || t.status === "pending") t.status = "done"; });
  return frames;
}

function buildHanoiFrames(n: number): FrameSnapshot[] {
  const frames: FrameSnapshot[] = [];
  let nextId = 1;
  const tree: TreeNode[] = [];
  const stack: StackFrame[] = [];
  const pegs: number[][] = [[], [], []];
  for (let d = n; d >= 1; d--) pegs[0].push(d);
  const snap = (description: string, codeLine: number, activeNodeId: number | null) => {
    frames.push({
      description, codeLine,
      stack: stack.map((s) => ({ ...s })), tree: tree.map((t) => ({ ...t })),
      activeNodeId, hanoi: { pegs: pegs.map((p) => [...p]) },
    });
  };
  const pegName = (i: number) => ["A", "B", "C"][i];
  function run(k: number, src: number, via: number, dst: number, parent: number | null, depth: number) {
    const id = nextId++;
    const node: TreeNode = {
      id, parent, label: `h(${k}, ${pegName(src)}→${pegName(dst)})`, depth, status: "active",
    };
    tree.push(node);
    stack.push({
      id, label: `hanoi(${k}, ${pegName(src)}, ${pegName(via)}, ${pegName(dst)})`,
      detail: k === 1 ? "base: flytt direkte" : `flytt ${k - 1} via ${pegName(via)}, flytt 1, flytt ${k - 1} tilbake`,
    });
    snap(
      k === 1
        ? `hanoi(1, ${pegName(src)}→${pegName(dst)}) — base, flytt øverste disk.`
        : `hanoi(${k}, ${pegName(src)}→${pegName(dst)}) kalles.`,
      k === 1 ? 2 : 0, id,
    );
    if (k === 1) {
      const disk = pegs[src].pop();
      if (disk !== undefined) {
        pegs[dst].push(disk);
        frames.push({
          description: `Flytter disk ${disk}: ${pegName(src)} → ${pegName(dst)}.`,
          codeLine: 2,
          stack: stack.map((s) => ({ ...s })),
          tree: tree.map((t) => ({ ...t })),
          activeNodeId: id,
          hanoi: { pegs: pegs.map((p) => [...p]), lastMove: { disk, from: src, to: dst } },
        });
      }
      node.status = "done";
      stack.pop();
      snap(`hanoi(1) ferdig. Pop frame.`, 3, parent);
      return;
    }
    snap(`hanoi(${k}): rekursivt — flytt ${k - 1} fra ${pegName(src)} til ${pegName(via)}.`, 4, id);
    run(k - 1, src, dst, via, id, depth + 1);
    node.status = "active";
    const disk = pegs[src].pop();
    if (disk !== undefined) {
      pegs[dst].push(disk);
      frames.push({
        description: `Flytter største disk ${disk}: ${pegName(src)} → ${pegName(dst)}.`,
        codeLine: 5,
        stack: stack.map((s) => ({ ...s })),
        tree: tree.map((t) => ({ ...t })),
        activeNodeId: id,
        hanoi: { pegs: pegs.map((p) => [...p]), lastMove: { disk, from: src, to: dst } },
      });
    }
    snap(`hanoi(${k}): rekursivt — flytt ${k - 1} fra ${pegName(via)} til ${pegName(dst)}.`, 6, id);
    run(k - 1, via, src, dst, id, depth + 1);
    node.status = "done";
    stack.pop();
    snap(`hanoi(${k}, ${pegName(src)}→${pegName(dst)}) ferdig. Pop frame.`, 0, parent);
  }
  run(n, 0, 1, 2, null, 0);
  return frames;
}

function buildFibMemoFrames(n: number): FrameSnapshot[] {
  const frames: FrameSnapshot[] = [];
  const tree: TreeNode[] = [];
  let nextId = 1;
  const cache: Map<number, number> = new Map();
  const stack: StackFrame[] = [];
  let callCount = 0;
  const naiveCounts: number[] = [1, 1];
  for (let i = 2; i <= n; i++) naiveCounts[i] = naiveCounts[i - 1] + naiveCounts[i - 2] + 1;
  const uncachedTotal = naiveCounts[n];
  const snap = (description: string, codeLine: number, activeNodeId: number | null) => {
    frames.push({
      description, codeLine,
      stack: stack.map((s) => ({ ...s })), tree: tree.map((t) => ({ ...t })),
      activeNodeId, callCount, uncachedCount: uncachedTotal,
    });
  };
  function run(k: number, parent: number | null, depth: number): number {
    callCount++;
    const id = nextId++;
    const cached = cache.has(k);
    const node: TreeNode = {
      id, parent, label: `f(${k})`, depth,
      status: cached ? "cache-hit" : "active",
      cached, returnValue: cached ? cache.get(k) : undefined,
    };
    tree.push(node);
    if (cached) {
      stack.push({ id, label: `f(${k})`, detail: `cache-hit → ${cache.get(k)}` });
      snap(`f(${k}): cache-hit! Returnerer ${cache.get(k)} uten å ekspandere.`, 0, id);
      stack.pop();
      snap(`f(${k}): pop — returverdi ${cache.get(k)} bobler opp.`, 0, parent);
      return cache.get(k)!;
    }
    stack.push({ id, label: `f(${k})`, detail: k < 2 ? `n=${k} → base` : `regn fra bunn` });
    snap(k < 2 ? `f(${k}): base — returnerer ${k}.` : `f(${k}) kalles (ikke i cache).`, k < 2 ? 3 : 1, id);
    if (k < 2) {
      node.status = "done";
      node.returnValue = k;
      cache.set(k, k);
      stack.pop();
      snap(`f(${k}) → ${k}. Lagre i cache.`, 3, parent);
      return k;
    }
    const left = run(k - 1, id, depth + 1);
    node.status = "active";
    const right = run(k - 2, id, depth + 1);
    const v = left + right;
    node.status = "done";
    node.returnValue = v;
    cache.set(k, v);
    stack.pop();
    snap(`f(${k}) = ${left} + ${right} = ${v}. Lagre i cache.`, 4, parent);
    return v;
  }
  run(n, null, 0);
  return frames;
}

function buildFrames(mode: Mode, n: number): FrameSnapshot[] {
  if (mode === "factorial") return buildFactorialFrames(n);
  if (mode === "fib") return buildFibFrames(n);
  if (mode === "hanoi") return buildHanoiFrames(n);
  return buildFibMemoFrames(n);
}

const N_RANGE: Record<Mode, { min: number; max: number; default: number }> = {
  factorial: { min: 1, max: 7, default: 4 },
  fib: { min: 1, max: 7, default: 5 },
  hanoi: { min: 1, max: 4, default: 3 },
  fibMemo: { min: 1, max: 7, default: 6 },
};

// --------------------------------------------------------------------------
// Hovedkomponenten
// --------------------------------------------------------------------------

export function RecursionVisualizer() {
  const [mode, setMode] = useState<Mode>("factorial");
  const [n, setN] = useState<number>(N_RANGE.factorial.default);
  const frames = useMemo(() => buildFrames(mode, n), [mode, n]);

  const initialSpeed = mode === "hanoi" ? 700 : 550;
  const runner = useStepRunner<FrameSnapshot>(frames, { initialSpeed });

  const current: FrameSnapshot = runner.frame ?? {
    description: "", codeLine: 0, stack: [], tree: [], activeNodeId: null,
  };

  const code = CODE[mode];

  const switchMode = (m: Mode) => {
    setMode(m);
    setN(N_RANGE[m].default);
  };

  const range = N_RANGE[mode];

  return (
   <KeyboardScope
     label="Rekursjon-visualisering"
     onStep={runner.step}
     onStepBack={runner.stepBack}
     onPlayPause={runner.playPause}
     onReset={runner.reset}
     onFirst={() => runner.setIndex(0)}
     onLast={() => runner.setIndex(runner.total - 1)}
   >
    <VisualizerShell<Mode>
      title="Rekursjon — se kallstacken og treet bygges opp"
      modes={MODES}
      activeMode={mode}
      onModeChange={switchMode}
      onReset={runner.reset}
      note={MODE_NOTE[mode]}
    >
      {/* Kode-panel med aktiv linje markert */}
      <div className="px-4 py-3 border-b border-border bg-background">
        <pre className="font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre">
          {code.lines.map((line, i) => (
            <div
              key={i}
              className={`-mx-2 px-2 rounded ${
                i === current.codeLine
                  ? "bg-brand/15 text-foreground border-l-2 border-brand"
                  : "text-muted-foreground border-l-2 border-transparent"
              }`}
            >
              <span className="inline-block w-6 text-right pr-2 select-none opacity-60">{i + 1}</span>
              {line || " "}
            </div>
          ))}
        </pre>
      </div>

      {/* Visualisering: kallstack venstre, tre/peg-er høyre */}
      <div className="grid md:grid-cols-[200px_1fr] gap-0 border-b border-border">
        <div className="border-r border-border bg-muted/10 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Kallstack {current.stack.length > 0 && `(${current.stack.length})`}
          </div>
          <StackPanel frames={current.stack} activeId={current.activeNodeId} />
        </div>
        <div className="bg-background p-4 min-h-[280px]">
          {mode === "hanoi" ? (
            <HanoiBoard state={current.hanoi} n={n} />
          ) : (
            <RecursionTree tree={current.tree} activeId={current.activeNodeId} mode={mode} />
          )}
        </div>
      </div>

      {/* Beskrivelse + memo-teller */}
      <div className="px-4 py-3 border-b border-border bg-muted/20">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="text-sm text-foreground flex-1">
            {current.description || "Trykk Play eller Neste for å starte."}
          </div>
          {mode === "fibMemo" && current.callCount !== undefined && (
            <div className="text-xs font-mono shrink-0">
              <span className="text-brand font-semibold">kall: {current.callCount}</span>
              <span className="text-muted-foreground"> vs uten cache: {current.uncachedCount}</span>
            </div>
          )}
        </div>
      </div>

      <StepControls
        step={runner.index}
        total={runner.total}
        playing={runner.playing}
        onStep={runner.step}
        onStepBack={runner.stepBack}
        onPlayPause={runner.playPause}
        onReset={runner.reset}
        onScrub={runner.setIndex}
      />

      {/* N-slider */}
      <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center gap-2">
        <label className="text-xs text-muted-foreground" htmlFor="rek-n">n =</label>
        <input
          id="rek-n"
          type="range"
          min={range.min}
          max={range.max}
          value={n}
          onChange={(e) => setN(Number.parseInt(e.target.value, 10))}
          className="w-32 accent-brand"
        />
        <span className="text-xs font-mono w-6 text-right tabular-nums">{n}</span>
      </div>
    </VisualizerShell>
   </KeyboardScope>
  );
}

// --------------------------------------------------------------------------
// Sub-komponenter
// --------------------------------------------------------------------------

function StackPanel({ frames, activeId }: { frames: StackFrame[]; activeId: number | null }) {
  if (frames.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic px-2 py-3 rounded border border-dashed border-border">
        tom kallstack
      </div>
    );
  }
  const reversed = [...frames].reverse();
  return (
    <div className="flex flex-col gap-1.5">
      {reversed.map((f, i) => {
        const isTop = i === 0;
        const isActive = f.id === activeId;
        return (
          <div
            key={`${f.id}-${i}`}
            className={`rounded border px-2 py-1.5 transition-colors ${
              isTop || isActive
                ? "border-brand bg-brand/10 text-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            <div className="font-mono text-xs font-semibold">{f.label}</div>
            {f.detail && <div className="font-mono text-[10px] opacity-80 mt-0.5">{f.detail}</div>}
          </div>
        );
      })}
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground text-center mt-1">bunn</div>
    </div>
  );
}

function nodeStyle(status: NodeStatus, duplicate?: boolean, cached?: boolean) {
  if (cached) return "border-brand bg-brand/15 text-brand";
  if (status === "cache-hit") return "border-brand bg-brand/20 text-brand shadow-[0_0_0_2px_var(--brand-tint,rgba(99,102,241,0.2))]";
  if (status === "done") return duplicate ? "border-destructive/60 bg-destructive/10 text-destructive" : "border-success/60 bg-success/10 text-success";
  if (status === "active") return duplicate ? "border-destructive bg-destructive/15 text-destructive" : "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300";
  if (status === "returning") return "border-success bg-success/20 text-success";
  return duplicate ? "border-destructive/40 bg-destructive/5 text-destructive/80" : "border-border bg-card text-muted-foreground";
}

function RecursionTree({ tree, activeId, mode }: { tree: TreeNode[]; activeId: number | null; mode: Mode }) {
  const byDepth: TreeNode[][] = [];
  tree.forEach((node) => {
    if (!byDepth[node.depth]) byDepth[node.depth] = [];
    byDepth[node.depth].push(node);
  });
  if (tree.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic h-full flex items-center justify-center">
        Treet bygges når du starter.
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3 overflow-x-auto h-full">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Rekursjonstre</div>
      <div className="flex flex-col gap-2 items-center min-w-fit">
        {byDepth.map((level, lvl) => (
          <div key={lvl} className="flex items-start gap-2 flex-wrap justify-center">
            {level.map((node) => <NodeBox key={node.id} node={node} active={node.id === activeId} />)}
          </div>
        ))}
      </div>
      <div className="flex gap-3 text-[10px] text-muted-foreground mt-2 flex-wrap justify-center">
        <Legend color="border-amber-500 bg-amber-500/15" label="pending / aktiv" />
        <Legend color="border-success/60 bg-success/10" label="returnert" />
        {(mode === "fib" || mode === "fibMemo") && (
          <Legend
            color={mode === "fibMemo" ? "border-brand bg-brand/15" : "border-destructive/60 bg-destructive/10"}
            label={mode === "fibMemo" ? "cache-hit" : "duplikat — bortkastet arbeid"}
          />
        )}
      </div>
    </div>
  );
}

function NodeBox({ node, active }: { node: TreeNode; active: boolean }) {
  return (
    <div
      className={`relative rounded-lg border-2 px-2 py-1 font-mono text-xs font-semibold transition-all ${nodeStyle(
        node.status, node.duplicate, node.cached,
      )} ${active ? "ring-2 ring-brand/40" : ""}`}
    >
      <div className="flex items-center gap-1">
        {node.cached && <Check className="h-3 w-3" />}
        <span>{node.label}</span>
      </div>
      {node.returnValue !== undefined && (
        <div className="text-[9px] opacity-80 font-normal mt-0.5">→ {node.returnValue}</div>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-block w-3 h-3 rounded border-2 ${color}`} />
      {label}
    </span>
  );
}

function HanoiBoard({ state, n }: { state?: HanoiState; n: number }) {
  const pegs = state?.pegs ?? [[], [], []];
  const maxWidth = 18 + (n - 1) * 14;
  const pegLabels = ["A", "B", "C"];
  const lastMove = state?.lastMove;
  return (
    <div className="flex flex-col gap-4 items-center h-full">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        Tårnene i Hanoi — flytt alle disker til peg C
      </div>
      <div className="flex items-end justify-around gap-6 flex-1 w-full max-w-md">
        {pegs.map((peg, pegIdx) => {
          const isFromOrTo = lastMove && (lastMove.from === pegIdx || lastMove.to === pegIdx);
          return (
            <div key={pegIdx} className="flex flex-col items-center">
              <div className="flex flex-col-reverse gap-0.5 items-center" style={{ minHeight: 110 }}>
                {peg.map((disk, i) => {
                  const isTop = i === peg.length - 1;
                  const isMoving = isTop && lastMove && lastMove.to === pegIdx && lastMove.disk === disk;
                  const width = 18 + (disk - 1) * 14;
                  return (
                    <div
                      key={`${pegIdx}-${disk}-${i}`}
                      className={`h-3.5 rounded-sm border-2 transition-all duration-300 ${
                        isMoving ? "border-brand bg-brand/40" : "border-brand/60 bg-brand/20"
                      }`}
                      style={{ width: `${width}px` }}
                      title={`disk ${disk}`}
                    />
                  );
                })}
              </div>
              <div
                className={`h-1 rounded ${isFromOrTo ? "bg-brand" : "bg-muted-foreground/50"}`}
                style={{ width: `${maxWidth + 8}px` }}
              />
              <div className="text-xs font-mono font-semibold text-muted-foreground mt-1">
                {pegLabels[pegIdx]}
              </div>
            </div>
          );
        })}
      </div>
      {lastMove && (
        <div className="text-xs font-mono text-brand">
          flytt disk {lastMove.disk}: {pegLabels[lastMove.from]} → {pegLabels[lastMove.to]}
        </div>
      )}
    </div>
  );
}
