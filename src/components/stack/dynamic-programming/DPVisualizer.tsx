import { useMemo, useState } from "react";
import {
  VisualizerShell,
  StepControls,
  OpLog,
  useStepRunner,
  KeyboardScope,
  type ModeDef,
  type OpLogEntry,
} from "@/components/visualizer-shell";

// --------------------------------------------------------------------------
// Interaktiv DP-tabell-visualisering. Fire moduser: fib, mynt, knapsack, LCS.
// Bruker shared shell-primitiver. Hele steg-listen genereres opp-front;
// useStepRunner animerer gjennom dem.
// --------------------------------------------------------------------------

type Mode = "fib" | "mynt" | "knapsack" | "lcs";

const MODES: ModeDef<Mode>[] = [
  { id: "fib", label: "Fibonacci", sub: "1D — dp[i]=dp[i-1]+dp[i-2]" },
  { id: "mynt", label: "Coin change", sub: "1D — min mynter for beløp" },
  { id: "knapsack", label: "0/1 Knapsack", sub: "2D — varer × kapasitet" },
  { id: "lcs", label: "LCS", sub: "2D — lengste felles subsekvens" },
];

type Step = {
  row: number;
  col: number;
  value: number;
  deps: { row: number; col: number; label?: string }[];
  recurrence: string;
  log: string;
};

type Plan = {
  rows: number;
  cols: number;
  rowHeaders: string[];
  colHeaders: string[];
  base: (number | null)[][];
  steps: Step[];
  answer: { row: number; col: number };
  recurrenceHeader: string;
  cellSize: number;
};

// --------------------------- Plan-byggere ---------------------------

function planFib(n: number): Plan {
  const rows = 1;
  const cols = n + 1;
  const base: (number | null)[][] = [Array.from({ length: cols }, () => null)];
  base[0][0] = 0;
  if (cols > 1) base[0][1] = 1;
  const steps: Step[] = [];
  const dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    const v = dp[i - 1] + dp[i - 2];
    dp.push(v);
    steps.push({
      row: 0, col: i, value: v,
      deps: [{ row: 0, col: i - 1, label: "dp[i-1]" }, { row: 0, col: i - 2, label: "dp[i-2]" }],
      recurrence: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${v}`,
      log: `dp[${i}] = ${dp[i - 1]} + ${dp[i - 2]} = ${v}`,
    });
  }
  return {
    rows, cols, rowHeaders: ["dp"],
    colHeaders: Array.from({ length: cols }, (_, i) => String(i)),
    base, steps, answer: { row: 0, col: n },
    recurrenceHeader: "dp[i] = dp[i-1] + dp[i-2],   base: dp[0]=0, dp[1]=1",
    cellSize: 48,
  };
}

function planCoin(coins: number[], target: number): Plan {
  const rows = 1;
  const cols = target + 1;
  const INF = Number.POSITIVE_INFINITY;
  const base: (number | null)[][] = [Array.from({ length: cols }, () => null)];
  base[0][0] = 0;
  const dp: number[] = Array(cols).fill(INF);
  dp[0] = 0;
  const steps: Step[] = [];
  for (let a = 1; a <= target; a++) {
    let best = INF;
    const considered: { c: number; from: number; sum: number }[] = [];
    for (const c of coins) {
      if (c <= a) {
        const prev = dp[a - c];
        const sum = prev === INF ? INF : prev + 1;
        considered.push({ c, from: a - c, sum });
        if (sum < best) best = sum;
      }
    }
    dp[a] = best;
    const deps = considered.filter((x) => x.sum !== INF).map((x) => ({ row: 0, col: x.from, label: `+${x.c}` }));
    const breakdown = considered.map((x) => `dp[${x.from}](${x.sum === INF ? "∞" : x.sum - 1})+1=${x.sum === INF ? "∞" : x.sum}`).join(", ");
    steps.push({
      row: 0, col: a, value: best === INF ? -1 : best, deps,
      recurrence: `dp[${a}] = 1 + min(${considered.map((x) => `dp[${a}-${x.c}]`).join(", ")}) = ${best === INF ? "∞" : best}`,
      log: `dp[${a}]: min(${breakdown || "—"}) = ${best === INF ? "∞" : best}`,
    });
  }
  return {
    rows, cols, rowHeaders: ["dp"],
    colHeaders: Array.from({ length: cols }, (_, i) => String(i)),
    base, steps, answer: { row: 0, col: target },
    recurrenceHeader: `dp[a] = 1 + min(dp[a-c] for c in [${coins.join(", ")}]),   base: dp[0]=0`,
    cellSize: 48,
  };
}

type Item = { w: number; v: number; name: string };

function planKnapsack(items: Item[], W: number): Plan {
  const n = items.length;
  const rows = n + 1;
  const cols = W + 1;
  const base: (number | null)[][] = Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
  for (let w = 0; w <= W; w++) base[0][w] = 0;
  const dp: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  const steps: Step[] = [];
  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    for (let w = 0; w <= W; w++) {
      const skip = dp[i - 1][w];
      const deps: Step["deps"] = [{ row: i - 1, col: w, label: "hopp" }];
      let best = skip;
      let detail = `hopp: dp[${i - 1}][${w}]=${skip}`;
      if (item.w <= w) {
        const take = dp[i - 1][w - item.w] + item.v;
        deps.push({ row: i - 1, col: w - item.w, label: `ta+${item.v}` });
        detail += `, ta: dp[${i - 1}][${w - item.w}]+${item.v}=${take}`;
        if (take > best) best = take;
      } else {
        detail += ` (vekt ${item.w} > kap ${w}, kan ikke ta)`;
      }
      dp[i][w] = best;
      steps.push({
        row: i, col: w, value: best, deps,
        recurrence: item.w <= w
          ? `dp[${i}][${w}] = max(dp[${i - 1}][${w}], dp[${i - 1}][${w - item.w}] + ${item.v}) = ${best}`
          : `dp[${i}][${w}] = dp[${i - 1}][${w}] = ${best}   (vare for tung)`,
        log: `i=${i} (${item.name} w=${item.w} v=${item.v}), kap=${w}: ${detail} → ${best}`,
      });
    }
  }
  return {
    rows, cols,
    rowHeaders: ["∅", ...items.map((x) => `${x.name} (w${x.w},v${x.v})`)],
    colHeaders: Array.from({ length: cols }, (_, i) => String(i)),
    base, steps, answer: { row: n, col: W },
    recurrenceHeader: "dp[i][w] = max(dp[i-1][w],  dp[i-1][w-wᵢ] + vᵢ),   rad 0 = 0",
    cellSize: 44,
  };
}

function planLCS(a: string, b: string): Plan {
  const m = a.length;
  const n = b.length;
  const rows = m + 1;
  const cols = n + 1;
  const base: (number | null)[][] = Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
  for (let j = 0; j <= n; j++) base[0][j] = 0;
  for (let i = 0; i <= m; i++) base[i][0] = 0;
  const dp: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  const steps: Step[] = [];
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const ca = a[i - 1];
      const cb = b[j - 1];
      let best: number;
      let deps: Step["deps"];
      let recurrence: string;
      let log: string;
      if (ca === cb) {
        best = dp[i - 1][j - 1] + 1;
        deps = [{ row: i - 1, col: j - 1, label: "diag+1" }];
        recurrence = `'${ca}'='${cb}' → dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${best}`;
        log = `[${i},${j}] '${ca}'='${cb}': diag ${dp[i - 1][j - 1]}+1 = ${best}`;
      } else {
        const up = dp[i - 1][j];
        const left = dp[i][j - 1];
        best = Math.max(up, left);
        deps = [{ row: i - 1, col: j, label: "opp" }, { row: i, col: j - 1, label: "venstre" }];
        recurrence = `'${ca}'≠'${cb}' → dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = max(${up}, ${left}) = ${best}`;
        log = `[${i},${j}] '${ca}'≠'${cb}': max(opp=${up}, venstre=${left}) = ${best}`;
      }
      dp[i][j] = best;
      steps.push({ row: i, col: j, value: best, deps, recurrence, log });
    }
  }
  return {
    rows, cols,
    rowHeaders: ["∅", ...a.split("").map((c) => c.toUpperCase())],
    colHeaders: ["∅", ...b.split("").map((c) => c.toUpperCase())],
    base, steps, answer: { row: m, col: n },
    recurrenceHeader: "X[i]=Y[j]:  dp[i][j] = dp[i-1][j-1] + 1   ellers:  dp[i][j] = max(dp[i-1][j], dp[i][j-1])",
    cellSize: 44,
  };
}

// --------------------------- UI ---------------------------

const KNAPSACK_ITEMS: Item[] = [
  { name: "A", w: 1, v: 1 },
  { name: "B", w: 3, v: 4 },
  { name: "C", w: 4, v: 5 },
  { name: "D", w: 5, v: 7 },
];

export function DPVisualizer() {
  const [mode, setMode] = useState<Mode>("fib");

  const [fibN, setFibN] = useState(8);
  const [coinsText, setCoinsText] = useState("1,3,4");
  const [coinTarget, setCoinTarget] = useState(6);
  const [knapsackW, setKnapsackW] = useState(7);
  const [lcsA, setLcsA] = useState("ABCBDAB");
  const [lcsB, setLcsB] = useState("BDCAB");

  const plan: Plan = useMemo(() => {
    if (mode === "fib") return planFib(Math.max(1, Math.min(15, fibN)));
    if (mode === "mynt") {
      const coins = coinsText
        .split(/[,\s]+/)
        .map((s) => Number.parseInt(s, 10))
        .filter((x) => Number.isFinite(x) && x > 0);
      const safeCoins = coins.length > 0 ? coins : [1];
      return planCoin(safeCoins, Math.max(1, Math.min(15, coinTarget)));
    }
    if (mode === "knapsack") return planKnapsack(KNAPSACK_ITEMS, Math.max(1, Math.min(10, knapsackW)));
    const cleanA = lcsA.slice(0, 8).toUpperCase();
    const cleanB = lcsB.slice(0, 8).toUpperCase();
    return planLCS(cleanA || "A", cleanB || "B");
  }, [mode, fibN, coinsText, coinTarget, knapsackW, lcsA, lcsB]);

  // useStepRunner med plan.steps. Vi tolker index slik at "etter steg k" = stepIdx=k+1.
  const runner = useStepRunner<Step>(plan.steps, { initialSpeed: 700 });
  // Vi bruker en separat "antall fullførte steg" — runner.index er 0..total-1.
  // Vi tegner runner.index+1 celler hvis runner har frame, eller 0 hvis ikke startet.
  // Trick: bruk runner.index som "currentStep-idx" (selve cellen som lyser).
  const currentStep: Step | null = runner.frame ?? null;
  const filledCount = currentStep ? runner.index + 1 : 0;
  const isDone = filledCount >= plan.steps.length;

  // Bygg tabellen ved å påføre alle frames fram til og med runner.index.
  const grid: (number | null)[][] = useMemo(() => {
    const g = plan.base.map((row) => row.slice());
    for (let k = 0; k < filledCount; k++) {
      const s = plan.steps[k];
      g[s.row][s.col] = s.value;
    }
    return g;
  }, [plan, filledCount]);

  // Op-logg
  const log: OpLogEntry[] = useMemo(() => {
    return plan.steps.slice(Math.max(0, filledCount - 6), filledCount).reverse().map((s) => ({
      op: `dp[${s.row},${s.col}]`,
      code: s.log,
    }));
  }, [plan.steps, filledCount]);

  return (
   <KeyboardScope
     label="Dynamic programming-tabell"
     onStep={runner.step}
     onStepBack={runner.stepBack}
     onPlayPause={runner.playPause}
     onReset={runner.reset}
     onFirst={() => runner.setIndex(0)}
     onLast={() => runner.setIndex(runner.total - 1)}
   >
    <VisualizerShell<Mode>
      title="Dynamic programming — se DP-tabellen fylles"
      modes={MODES}
      activeMode={mode}
      onModeChange={setMode}
      onReset={runner.reset}
    >
      {/* Inputs per modus */}
      <div className="px-4 py-3 border-b border-border bg-muted/20">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {mode === "fib" && (
            <label className="flex items-center gap-2">
              <span className="text-muted-foreground">n</span>
              <input type="range" min={1} max={15} value={fibN} onChange={(e) => setFibN(Number(e.target.value))} className="w-40" />
              <span className="font-mono w-6 text-right">{fibN}</span>
            </label>
          )}
          {mode === "mynt" && (
            <>
              <label className="flex items-center gap-2">
                <span className="text-muted-foreground">mynter</span>
                <input type="text" value={coinsText} onChange={(e) => setCoinsText(e.target.value)} className="w-32 px-2 py-1 rounded border border-border bg-background font-mono" />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-muted-foreground">beløp</span>
                <input type="range" min={1} max={15} value={coinTarget} onChange={(e) => setCoinTarget(Number(e.target.value))} className="w-32" />
                <span className="font-mono w-6 text-right">{coinTarget}</span>
              </label>
            </>
          )}
          {mode === "knapsack" && (
            <>
              <label className="flex items-center gap-2">
                <span className="text-muted-foreground">kapasitet W</span>
                <input type="range" min={1} max={10} value={knapsackW} onChange={(e) => setKnapsackW(Number(e.target.value))} className="w-32" />
                <span className="font-mono w-6 text-right">{knapsackW}</span>
              </label>
              <span className="text-muted-foreground italic">varer: A(w1,v1), B(w3,v4), C(w4,v5), D(w5,v7)</span>
            </>
          )}
          {mode === "lcs" && (
            <>
              <label className="flex items-center gap-2">
                <span className="text-muted-foreground">X</span>
                <input type="text" value={lcsA} maxLength={8} onChange={(e) => setLcsA(e.target.value.replace(/[^A-Za-z]/g, "").slice(0, 8))} className="w-28 px-2 py-1 rounded border border-border bg-background font-mono uppercase" />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-muted-foreground">Y</span>
                <input type="text" value={lcsB} maxLength={8} onChange={(e) => setLcsB(e.target.value.replace(/[^A-Za-z]/g, "").slice(0, 8))} className="w-28 px-2 py-1 rounded border border-border bg-background font-mono uppercase" />
              </label>
            </>
          )}
        </div>
      </div>

      {/* Recurrence-banner */}
      <div className="px-4 py-2 border-b border-border bg-background">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Rekurrens</div>
        <div className="font-mono text-xs text-foreground/90">
          {currentStep ? currentStep.recurrence : plan.recurrenceHeader}
        </div>
      </div>

      {/* Tabellen */}
      <div className="p-6 overflow-x-auto bg-background">
        <DPGrid plan={plan} grid={grid} currentStep={currentStep} isDone={isDone} />
      </div>

      <StepControls
        step={runner.index}
        total={runner.total}
        playing={runner.playing}
        onStep={runner.step}
        onStepBack={runner.stepBack}
        onPlayPause={runner.playPause}
        onReset={runner.reset}
        rightSlot={
          isDone ? (
            <span className="text-success font-semibold">
              ✓ ferdig — svar = {grid[plan.answer.row][plan.answer.col]}
            </span>
          ) : undefined
        }
      />

      <OpLog entries={log} totalCount={filledCount} />
    </VisualizerShell>
   </KeyboardScope>
  );
}

// --------------------------- Grid ---------------------------

function DPGrid({
  plan,
  grid,
  currentStep,
  isDone,
}: {
  plan: Plan;
  grid: (number | null)[][];
  currentStep: Step | null;
  isDone: boolean;
}) {
  const { rows, cols, cellSize, rowHeaders, colHeaders, answer } = plan;
  const gridTemplateColumns = `minmax(60px, auto) repeat(${cols}, ${cellSize}px)`;
  const depSet = new Set((currentStep?.deps ?? []).map((d) => `${d.row}:${d.col}`));

  return (
    <div className="relative inline-block mx-auto">
      <div className="grid gap-1" style={{ gridTemplateColumns }}>
        <div />
        {colHeaders.map((h, j) => (
          <div
            key={`ch-${j}`}
            className="text-[10px] uppercase tracking-wider text-muted-foreground text-center font-mono"
            style={{ width: cellSize }}
          >
            {h}
          </div>
        ))}
        {Array.from({ length: rows }).map((_, i) => (
          <RowFragment
            key={`row-${i}`}
            i={i}
            cols={cols}
            cellSize={cellSize}
            rowHeader={rowHeaders[i]}
            grid={grid}
            currentStep={currentStep}
            depSet={depSet}
            answer={answer}
            isDone={isDone}
          />
        ))}
      </div>
    </div>
  );
}

function RowFragment({
  i, cols, cellSize, rowHeader, grid, currentStep, depSet, answer, isDone,
}: {
  i: number;
  cols: number;
  cellSize: number;
  rowHeader: string;
  grid: (number | null)[][];
  currentStep: Step | null;
  depSet: Set<string>;
  answer: { row: number; col: number };
  isDone: boolean;
}) {
  return (
    <>
      <div
        className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono flex items-center justify-end pr-2"
        style={{ height: cellSize }}
      >
        {rowHeader}
      </div>
      {Array.from({ length: cols }).map((_, j) => {
        const value = grid[i][j];
        const isCurrent = currentStep !== null && currentStep.row === i && currentStep.col === j;
        const isDep = depSet.has(`${i}:${j}`);
        const isAnswer = isDone && answer.row === i && answer.col === j;
        const isFilled = value !== null;
        return (
          <div
            key={`c-${i}-${j}`}
            className={[
              "relative flex items-center justify-center font-mono text-sm rounded-md border transition-all duration-300",
              isCurrent
                ? "bg-brand text-brand-foreground border-brand shadow-[0_0_0_3px_var(--brand-tint,rgba(99,102,241,0.25))] animate-pulse"
                : isAnswer
                ? "bg-success/15 text-success-foreground border-success ring-2 ring-success"
                : isDep
                ? "border-yellow-500 ring-2 ring-yellow-500/50 bg-yellow-500/10 text-foreground"
                : isFilled
                ? "border-border bg-muted/50 text-muted-foreground"
                : "border-dashed border-border/50 bg-background text-muted-foreground/40",
            ].join(" ")}
            style={{ width: cellSize, height: cellSize }}
            title={`[${i},${j}]${value !== null ? ` = ${value}` : ""}`}
          >
            {value === null ? "" : value === -1 ? "∞" : value}
            {isAnswer && (
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-success whitespace-nowrap">
                svar = {value}
              </div>
            )}
            {isDep && currentStep && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-yellow-600 whitespace-nowrap">
                {currentStep.deps.find((d) => d.row === i && d.col === j)?.label}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
