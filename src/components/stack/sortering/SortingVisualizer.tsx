import { useEffect, useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import {
  VisualizerShell,
  StepControls,
  useStepRunner,
  KeyboardScope,
  STATE_GLYPHS,
  type ModeDef,
} from "@/components/visualizer-shell";

// --------------------------------------------------------------------------
// Interaktiv sortering: animert bar-chart for seks klassiske algoritmer.
// Bruker shared shell-primitiver. Strategien er fortsatt: pre-compute alle
// frames, og useStepRunner-hooken styrer play/pause/step.
// --------------------------------------------------------------------------

type Algo = "bubble" | "selection" | "insertion" | "merge" | "quick" | "heap";

type StepKind = "compare" | "swap" | "overwrite" | "mark-sorted" | "done";

type Step = {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  line: number;
  kind: StepKind;
  comparisons: number;
  swaps: number;
};

const ALGOS: ModeDef<Algo>[] = [
  { id: "bubble", label: "Bubble", badge: "O(n²)", sub: "O(n²)" },
  { id: "selection", label: "Selection", badge: "O(n²)", sub: "O(n²)" },
  { id: "insertion", label: "Insertion", badge: "O(n²)", sub: "O(n²)" },
  { id: "merge", label: "Merge", badge: "O(n log n)", sub: "O(n log n)" },
  { id: "quick", label: "Quick", badge: "O(n log n)", sub: "O(n log n) snitt" },
  { id: "heap", label: "Heap", badge: "O(n log n)", sub: "O(n log n)" },
];

const PSEUDO: Record<Algo, string[]> = {
  bubble: [
    "for i = 0 .. n-1:",
    "  for j = 0 .. n-i-2:",
    "    if a[j] > a[j+1]:",
    "      swap a[j], a[j+1]",
  ],
  selection: [
    "for i = 0 .. n-1:",
    "  min_idx = i",
    "  for j = i+1 .. n-1:",
    "    if a[j] < a[min_idx]:",
    "      min_idx = j",
    "  swap a[i], a[min_idx]",
  ],
  insertion: [
    "for i = 1 .. n-1:",
    "  key = a[i]",
    "  j = i - 1",
    "  while j >= 0 and a[j] > key:",
    "    a[j+1] = a[j]; j -= 1",
    "  a[j+1] = key",
  ],
  merge: [
    "mergesort(lo, hi):",
    "  if hi - lo <= 1: return",
    "  mid = (lo + hi) / 2",
    "  mergesort(lo, mid)",
    "  mergesort(mid, hi)",
    "  merge(lo, mid, hi)   # flett to sorterte halvdeler",
  ],
  quick: [
    "quicksort(lo, hi):",
    "  if lo >= hi: return",
    "  pivot = a[hi]",
    "  p = partition(lo, hi)   # < pivot | pivot | > pivot",
    "  quicksort(lo, p-1)",
    "  quicksort(p+1, hi)",
  ],
  heap: [
    "build_max_heap(a)         # heapify alle ikke-bladnoder",
    "for end = n-1 .. 1:",
    "  swap a[0], a[end]       # største til slutten",
    "  sift_down(0, end)       # gjenopprett heap-egenskap",
  ],
};

// ---------- STEP-GENERATORER ----------

function genBubble(input: number[]): Step[] {
  const a = [...input];
  const steps: Step[] = [];
  const n = a.length;
  const sortedIdx: number[] = [];
  let comparisons = 0;
  let swaps = 0;
  const snap = (comparing: number[], swapping: number[], line: number, kind: StepKind) => {
    steps.push({ array: [...a], comparing, swapping, sorted: [...sortedIdx], line, kind, comparisons, swaps });
  };
  for (let i = 0; i < n - 1; i++) {
    let didSwap = false;
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      snap([j, j + 1], [], 3, "compare");
      if (a[j] > a[j + 1]) {
        swaps++;
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        didSwap = true;
        snap([], [j, j + 1], 4, "swap");
      }
    }
    sortedIdx.push(n - 1 - i);
    snap([], [], 1, "mark-sorted");
    if (!didSwap) break;
  }
  for (let i = 0; i < n; i++) if (!sortedIdx.includes(i)) sortedIdx.push(i);
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: Array.from({ length: n }, (_, i) => i), line: 0, kind: "done", comparisons, swaps });
  return steps;
}

function genSelection(input: number[]): Step[] {
  const a = [...input];
  const steps: Step[] = [];
  const n = a.length;
  const sortedIdx: number[] = [];
  let comparisons = 0;
  let swaps = 0;
  const snap = (comparing: number[], swapping: number[], line: number, kind: StepKind) =>
    steps.push({ array: [...a], comparing, swapping, sorted: [...sortedIdx], line, kind, comparisons, swaps });
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    snap([minIdx], [], 2, "compare");
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      snap([j, minIdx], [], 4, "compare");
      if (a[j] < a[minIdx]) {
        minIdx = j;
        snap([minIdx], [], 5, "compare");
      }
    }
    if (minIdx !== i) {
      swaps++;
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      snap([], [i, minIdx], 6, "swap");
    }
    sortedIdx.push(i);
    snap([], [], 1, "mark-sorted");
  }
  sortedIdx.push(n - 1);
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: Array.from({ length: n }, (_, i) => i), line: 0, kind: "done", comparisons, swaps });
  return steps;
}

function genInsertion(input: number[]): Step[] {
  const a = [...input];
  const steps: Step[] = [];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  const snap = (comparing: number[], swapping: number[], sorted: number[], line: number, kind: StepKind) =>
    steps.push({ array: [...a], comparing, swapping, sorted, line, kind, comparisons, swaps });
  snap([], [], [0], 1, "compare");
  for (let i = 1; i < n; i++) {
    const key = a[i];
    snap([i], [], Array.from({ length: i }, (_, k) => k), 2, "compare");
    let j = i - 1;
    while (j >= 0) {
      comparisons++;
      snap([j, j + 1], [], Array.from({ length: i }, (_, k) => k), 4, "compare");
      if (a[j] > key) {
        a[j + 1] = a[j];
        swaps++;
        snap([], [j + 1], Array.from({ length: i }, (_, k) => k), 5, "overwrite");
        j--;
      } else break;
    }
    a[j + 1] = key;
    snap([], [j + 1], Array.from({ length: i + 1 }, (_, k) => k), 6, "overwrite");
  }
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: Array.from({ length: n }, (_, i) => i), line: 0, kind: "done", comparisons, swaps });
  return steps;
}

function genMerge(input: number[]): Step[] {
  const a = [...input];
  const steps: Step[] = [];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  const snap = (comparing: number[], swapping: number[], line: number, kind: StepKind) =>
    steps.push({ array: [...a], comparing, swapping, sorted: [], line, kind, comparisons, swaps });
  const mergesort = (lo: number, hi: number) => {
    if (hi - lo <= 1) return;
    const mid = Math.floor((lo + hi) / 2);
    snap([], [], 3, "compare");
    mergesort(lo, mid);
    mergesort(mid, hi);
    const left = a.slice(lo, mid);
    const right = a.slice(mid, hi);
    let i = 0, j = 0, k = lo;
    snap([lo, hi - 1], [], 6, "compare");
    while (i < left.length && j < right.length) {
      comparisons++;
      snap([lo + i, mid + j], [], 6, "compare");
      if (left[i] <= right[j]) { a[k] = left[i]; swaps++; snap([], [k], 6, "overwrite"); i++; }
      else { a[k] = right[j]; swaps++; snap([], [k], 6, "overwrite"); j++; }
      k++;
    }
    while (i < left.length) { a[k] = left[i]; swaps++; snap([], [k], 6, "overwrite"); i++; k++; }
    while (j < right.length) { a[k] = right[j]; swaps++; snap([], [k], 6, "overwrite"); j++; k++; }
  };
  mergesort(0, n);
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: Array.from({ length: n }, (_, i) => i), line: 0, kind: "done", comparisons, swaps });
  return steps;
}

function genQuick(input: number[]): Step[] {
  const a = [...input];
  const steps: Step[] = [];
  const n = a.length;
  const sortedIdx = new Set<number>();
  let comparisons = 0;
  let swaps = 0;
  const snap = (comparing: number[], swapping: number[], line: number, kind: StepKind) =>
    steps.push({ array: [...a], comparing, swapping, sorted: [...sortedIdx], line, kind, comparisons, swaps });
  const partition = (lo: number, hi: number): number => {
    const pivot = a[hi];
    snap([hi], [], 3, "compare");
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      comparisons++;
      snap([j, hi], [], 4, "compare");
      if (a[j] <= pivot) {
        i++;
        if (i !== j) { [a[i], a[j]] = [a[j], a[i]]; swaps++; snap([], [i, j], 4, "swap"); }
      }
    }
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    swaps++;
    snap([], [i + 1, hi], 4, "swap");
    return i + 1;
  };
  const quicksort = (lo: number, hi: number) => {
    if (lo >= hi) { if (lo === hi) { sortedIdx.add(lo); snap([], [], 2, "mark-sorted"); } return; }
    const p = partition(lo, hi);
    sortedIdx.add(p);
    snap([], [], 4, "mark-sorted");
    quicksort(lo, p - 1);
    quicksort(p + 1, hi);
  };
  quicksort(0, n - 1);
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: Array.from({ length: n }, (_, i) => i), line: 0, kind: "done", comparisons, swaps });
  return steps;
}

function genHeap(input: number[]): Step[] {
  const a = [...input];
  const steps: Step[] = [];
  const n = a.length;
  const sortedIdx: number[] = [];
  let comparisons = 0;
  let swaps = 0;
  const snap = (comparing: number[], swapping: number[], line: number, kind: StepKind) =>
    steps.push({ array: [...a], comparing, swapping, sorted: [...sortedIdx], line, kind, comparisons, swaps });
  const siftDown = (start: number, end: number) => {
    let i = start;
    while (true) {
      const l = 2 * i + 1, r = 2 * i + 2;
      let largest = i;
      if (l < end) { comparisons++; snap([l, largest], [], 4, "compare"); if (a[l] > a[largest]) largest = l; }
      if (r < end) { comparisons++; snap([r, largest], [], 4, "compare"); if (a[r] > a[largest]) largest = r; }
      if (largest === i) break;
      [a[i], a[largest]] = [a[largest], a[i]];
      swaps++;
      snap([], [i, largest], 4, "swap");
      i = largest;
    }
  };
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) { snap([i], [], 1, "compare"); siftDown(i, n); }
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    swaps++;
    snap([], [0, end], 3, "swap");
    sortedIdx.push(end);
    snap([], [], 2, "mark-sorted");
    siftDown(0, end);
  }
  sortedIdx.push(0);
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: Array.from({ length: n }, (_, i) => i), line: 0, kind: "done", comparisons, swaps });
  return steps;
}

const GENERATORS: Record<Algo, (input: number[]) => Step[]> = {
  bubble: genBubble,
  selection: genSelection,
  insertion: genInsertion,
  merge: genMerge,
  quick: genQuick,
  heap: genHeap,
};

function makeArray(size: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < size; i++) out.push(5 + Math.floor(Math.random() * 95));
  return out;
}

// ============================ KOMPONENT ============================

export function SortingVisualizer() {
  const [algo, setAlgo] = useState<Algo>("bubble");
  const [size, setSize] = useState(16);
  const [baseArray, setBaseArray] = useState<number[]>(() => makeArray(16));

  const steps = useMemo<Step[]>(() => GENERATORS[algo](baseArray), [algo, baseArray]);

  const runner = useStepRunner<Step>(steps, { initialSpeed: 60 });
  const current = runner.frame ?? steps[0];

  const maxVal = useMemo(() => Math.max(...baseArray, 1), [baseArray]);

  // Reset når algo/array endrer seg ivaretas av useStepRunner via frames-referansen.
  useEffect(() => {
    // Ingen ekstra logikk: useStepRunner resetter selv.
  }, [algo, baseArray]);

  const shuffle = () => setBaseArray(makeArray(size));
  const handleSizeChange = (n: number) => { setSize(n); setBaseArray(makeArray(n)); };

  const pseudo = PSEUDO[algo];
  const meta = ALGOS.find((m) => m.id === algo)!;

  // ARIA-label som beskriver gjeldende tilstand av sorteringen for skjermlesere.
  const ariaSummary = `Sortering ${meta.label}, steg ${runner.index + 1} av ${runner.total}. ${current.comparisons} sammenligninger, ${current.swaps} bytter${runner.atEnd ? ", ferdig" : ""}.`;

  return (
   <KeyboardScope
     label={`Sortering: ${meta.label}`}
     onStep={runner.step}
     onStepBack={runner.stepBack}
     onPlayPause={runner.playPause}
     onReset={runner.reset}
     onFirst={() => runner.setIndex(0)}
     onLast={() => runner.setIndex(runner.total - 1)}
   >
    <VisualizerShell<Algo>
      title="Sortering — se algoritmen kjøre steg for steg"
      modes={ALGOS}
      activeMode={algo}
      onModeChange={setAlgo}
      onReset={runner.reset}
    >
      <span className="sr-only" aria-live="polite">{ariaSummary}</span>
      {/* Bar-chart + pseudokode side om side */}
      <div className="grid md:grid-cols-[1fr_280px] gap-0">
        <div className="p-6 min-h-[280px] flex items-end justify-center bg-background border-b md:border-b-0 md:border-r border-border">
          <BarChart
            values={current.array}
            comparing={current.comparing}
            swapping={current.swapping}
            sorted={current.sorted}
            maxVal={maxVal}
          />
        </div>

        <div className="p-4 bg-muted/20">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Pseudokode — {meta.label}
          </div>
          <ol className="font-mono text-xs space-y-0.5">
            {pseudo.map((line, i) => {
              const lineNo = i + 1;
              const active = current.line === lineNo;
              return (
                <li
                  key={i}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    active
                      ? "bg-brand/15 text-brand border-l-2 border-brand"
                      : "text-foreground/80 border-l-2 border-transparent"
                  }`}
                >
                  <span className="text-muted-foreground tabular-nums mr-2">
                    {lineNo}
                  </span>
                  {line}
                </li>
              );
            })}
          </ol>
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
        speed={runner.speed}
        onSpeedChange={runner.setSpeed}
        speedMin={10}
        speedMax={400}
        rightSlot={
          <>
            <span>
              <span className="text-muted-foreground">sammenligninger</span>{" "}
              <span className="tabular-nums text-foreground">{current.comparisons}</span>
            </span>
            <span>
              <span className="text-muted-foreground">bytter</span>{" "}
              <span className="tabular-nums text-foreground">{current.swaps}</span>
            </span>
          </>
        }
      />

      {/* Ekstra kontroller: størrelse + stokk + legend */}
      <div className="px-4 py-3 border-t border-border bg-muted/20">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={shuffle}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted"
          >
            <Shuffle className="h-3.5 w-3.5" /> Stokk
          </button>
          <div className="flex items-center gap-2">
            <label htmlFor="size-slider" className="text-xs text-muted-foreground">
              n = {size}
            </label>
            <input
              id="size-slider"
              type="range"
              min={8}
              max={32}
              value={size}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="w-28 accent-brand"
            />
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-3 text-[11px]">
            <Legend color="bg-border" glyph="" label="ikke besøkt (grå)" />
            <Legend
              color="bg-yellow-400 dark:bg-yellow-500"
              glyph={STATE_GLYPHS.comparing}
              label="gul ⇄ sammenligner"
            />
            <Legend
              color="bg-red-500"
              glyph={STATE_GLYPHS.error}
              label="rød × bytter / overskriver"
            />
            <Legend
              color="bg-emerald-500"
              glyph={STATE_GLYPHS.done}
              label="grønn ✓ ferdig sortert"
            />
            {runner.atEnd && (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Ferdig — {current.comparisons} sammenligninger, {current.swaps} bytter
              </span>
            )}
          </div>
        </div>
      </div>
    </VisualizerShell>
   </KeyboardScope>
  );
}

function Legend({
  color,
  label,
  glyph,
}: {
  color: string;
  label: string;
  glyph?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span
        aria-hidden="true"
        className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-sm text-[10px] font-bold text-background ${color}`}
      >
        {glyph}
      </span>
      {label}
    </span>
  );
}

function BarChart({
  values,
  comparing,
  swapping,
  sorted,
  maxVal,
}: {
  values: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  maxVal: number;
}) {
  const n = values.length;
  const cmpSet = new Set(comparing);
  const swpSet = new Set(swapping);
  const sortedSet = new Set(sorted);
  const gap = n > 24 ? 1 : n > 16 ? 2 : 3;

  // Bygg en kort tekstoppsummering for skjermlesere.
  const desc = `Bar-chart med ${n} elementer. Sammenligner indekser ${comparing.join(", ") || "—"}, bytter ${swapping.join(", ") || "—"}, ferdig sortert: ${sorted.length} av ${n}.`;

  return (
    <div
      role="img"
      aria-label={desc}
      className="w-full h-full max-h-[260px] flex items-end justify-center gap-px"
      style={{ gap: `${gap}px` }}
    >
      {values.map((v, i) => {
        const heightPct = Math.max(4, (v / maxVal) * 100);
        let color = "bg-border";
        let glyph = "";
        if (swpSet.has(i)) { color = "bg-red-500"; glyph = STATE_GLYPHS.error; }
        else if (cmpSet.has(i)) { color = "bg-yellow-400 dark:bg-yellow-500"; glyph = STATE_GLYPHS.comparing; }
        else if (sortedSet.has(i)) { color = "bg-emerald-500"; glyph = STATE_GLYPHS.done; }
        else color = "bg-foreground/60";
        return (
          <div
            key={i}
            className={`relative flex-1 rounded-t-sm motion-safe:transition-[height,background-color] motion-safe:duration-150 ease-out ${color}`}
            style={{ height: `${heightPct}%`, minWidth: "6px", maxWidth: "32px" }}
            title={`a[${i}] = ${v}`}
          >
            {glyph && (
              <span
                aria-hidden="true"
                className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold leading-none text-foreground"
              >
                {glyph}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
