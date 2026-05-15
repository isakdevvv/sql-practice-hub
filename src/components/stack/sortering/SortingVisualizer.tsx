import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, SkipForward, Shuffle, RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv sortering: animert bar-chart for seks klassiske algoritmer.
// Strategi: vi kjører hele sorteringen FØRST og bygger en liste med
// "steps" (snapshot av arrayet + hvilke indekser som sammenliknes/byttes
// + hvilke som er ferdig sortert + hvilken pseudokode-linje som er aktiv).
// Play/Pause/Step bare flytter en indeks i den lista — gjør scrub trivielt.
// --------------------------------------------------------------------------

type Algo = "bubble" | "selection" | "insertion" | "merge" | "quick" | "heap";

type StepKind = "compare" | "swap" | "overwrite" | "mark-sorted" | "done";

type Step = {
  array: number[];
  comparing: number[]; // indekser som blir sammenliknet (gul)
  swapping: number[]; // indekser som blir byttet/overskrevet (rød)
  sorted: number[]; // indekser som er ferdig sortert (grønn)
  line: number; // 1-indeksert linje i pseudokode (0 = ingen)
  kind: StepKind;
  comparisons: number;
  swaps: number;
};

const ALGOS: { id: Algo; label: string; complexity: string }[] = [
  { id: "bubble", label: "Bubble", complexity: "O(n²)" },
  { id: "selection", label: "Selection", complexity: "O(n²)" },
  { id: "insertion", label: "Insertion", complexity: "O(n²)" },
  { id: "merge", label: "Merge", complexity: "O(n log n)" },
  { id: "quick", label: "Quick", complexity: "O(n log n) snitt" },
  { id: "heap", label: "Heap", complexity: "O(n log n)" },
];

// Pseudokode for hver algoritme. Linje-numrene matcher det vi sender i steps.
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

// ---------- STEP-GENERATORER (samle hele kjøringen før animasjon) ----------
//
// Hver funksjon returnerer en liste med Step. Vi maintainer komparator- og
// swap-tellere globalt så studenten ser kostnaden vokse.

function genBubble(input: number[]): Step[] {
  const a = [...input];
  const steps: Step[] = [];
  const n = a.length;
  const sortedIdx: number[] = [];
  let comparisons = 0;
  let swaps = 0;

  const snap = (
    comparing: number[],
    swapping: number[],
    line: number,
    kind: StepKind,
  ) => {
    steps.push({
      array: [...a],
      comparing,
      swapping,
      sorted: [...sortedIdx],
      line,
      kind,
      comparisons,
      swaps,
    });
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
  // Resterende indekser er sortert
  for (let i = 0; i < n; i++) if (!sortedIdx.includes(i)) sortedIdx.push(i);
  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    line: 0,
    kind: "done",
    comparisons,
    swaps,
  });
  return steps;
}

function genSelection(input: number[]): Step[] {
  const a = [...input];
  const steps: Step[] = [];
  const n = a.length;
  const sortedIdx: number[] = [];
  let comparisons = 0;
  let swaps = 0;

  const snap = (
    comparing: number[],
    swapping: number[],
    line: number,
    kind: StepKind,
  ) =>
    steps.push({
      array: [...a],
      comparing,
      swapping,
      sorted: [...sortedIdx],
      line,
      kind,
      comparisons,
      swaps,
    });

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
  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    line: 0,
    kind: "done",
    comparisons,
    swaps,
  });
  return steps;
}

function genInsertion(input: number[]): Step[] {
  const a = [...input];
  const steps: Step[] = [];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;

  // Hva som er "sortert" ved insertion er prefiks [0..i-1], men vi viser
  // sorted-status først helt på slutten — markeringen blir for støyete ellers.
  const snap = (
    comparing: number[],
    swapping: number[],
    sorted: number[],
    line: number,
    kind: StepKind,
  ) =>
    steps.push({
      array: [...a],
      comparing,
      swapping,
      sorted,
      line,
      kind,
      comparisons,
      swaps,
    });

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
      } else {
        break;
      }
    }
    a[j + 1] = key;
    snap([], [j + 1], Array.from({ length: i + 1 }, (_, k) => k), 6, "overwrite");
  }
  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    line: 0,
    kind: "done",
    comparisons,
    swaps,
  });
  return steps;
}

function genMerge(input: number[]): Step[] {
  const a = [...input];
  const steps: Step[] = [];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;

  const snap = (
    comparing: number[],
    swapping: number[],
    line: number,
    kind: StepKind,
  ) =>
    steps.push({
      array: [...a],
      comparing,
      swapping,
      sorted: [],
      line,
      kind,
      comparisons,
      swaps,
    });

  const mergesort = (lo: number, hi: number) => {
    if (hi - lo <= 1) return;
    const mid = Math.floor((lo + hi) / 2);
    snap([], [], 3, "compare");
    mergesort(lo, mid);
    mergesort(mid, hi);
    // Flett a[lo..mid) og a[mid..hi)
    const left = a.slice(lo, mid);
    const right = a.slice(mid, hi);
    let i = 0;
    let j = 0;
    let k = lo;
    snap([lo, hi - 1], [], 6, "compare");
    while (i < left.length && j < right.length) {
      comparisons++;
      snap([lo + i, mid + j], [], 6, "compare");
      if (left[i] <= right[j]) {
        a[k] = left[i];
        swaps++;
        snap([], [k], 6, "overwrite");
        i++;
      } else {
        a[k] = right[j];
        swaps++;
        snap([], [k], 6, "overwrite");
        j++;
      }
      k++;
    }
    while (i < left.length) {
      a[k] = left[i];
      swaps++;
      snap([], [k], 6, "overwrite");
      i++;
      k++;
    }
    while (j < right.length) {
      a[k] = right[j];
      swaps++;
      snap([], [k], 6, "overwrite");
      j++;
      k++;
    }
  };

  mergesort(0, n);
  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    line: 0,
    kind: "done",
    comparisons,
    swaps,
  });
  return steps;
}

function genQuick(input: number[]): Step[] {
  const a = [...input];
  const steps: Step[] = [];
  const n = a.length;
  const sortedIdx = new Set<number>();
  let comparisons = 0;
  let swaps = 0;

  const snap = (
    comparing: number[],
    swapping: number[],
    line: number,
    kind: StepKind,
  ) =>
    steps.push({
      array: [...a],
      comparing,
      swapping,
      sorted: [...sortedIdx],
      line,
      kind,
      comparisons,
      swaps,
    });

  // Lomuto-partisjon med pivot = a[hi]. Enkel å visualisere.
  const partition = (lo: number, hi: number): number => {
    const pivot = a[hi];
    snap([hi], [], 3, "compare");
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      comparisons++;
      snap([j, hi], [], 4, "compare");
      if (a[j] <= pivot) {
        i++;
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          swaps++;
          snap([], [i, j], 4, "swap");
        }
      }
    }
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    swaps++;
    snap([], [i + 1, hi], 4, "swap");
    return i + 1;
  };

  const quicksort = (lo: number, hi: number) => {
    if (lo >= hi) {
      if (lo === hi) {
        sortedIdx.add(lo);
        snap([], [], 2, "mark-sorted");
      }
      return;
    }
    const p = partition(lo, hi);
    sortedIdx.add(p);
    snap([], [], 4, "mark-sorted");
    quicksort(lo, p - 1);
    quicksort(p + 1, hi);
  };

  quicksort(0, n - 1);
  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    line: 0,
    kind: "done",
    comparisons,
    swaps,
  });
  return steps;
}

function genHeap(input: number[]): Step[] {
  const a = [...input];
  const steps: Step[] = [];
  const n = a.length;
  const sortedIdx: number[] = [];
  let comparisons = 0;
  let swaps = 0;

  const snap = (
    comparing: number[],
    swapping: number[],
    line: number,
    kind: StepKind,
  ) =>
    steps.push({
      array: [...a],
      comparing,
      swapping,
      sorted: [...sortedIdx],
      line,
      kind,
      comparisons,
      swaps,
    });

  const siftDown = (start: number, end: number) => {
    let i = start;
    while (true) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      let largest = i;
      if (l < end) {
        comparisons++;
        snap([l, largest], [], 4, "compare");
        if (a[l] > a[largest]) largest = l;
      }
      if (r < end) {
        comparisons++;
        snap([r, largest], [], 4, "compare");
        if (a[r] > a[largest]) largest = r;
      }
      if (largest === i) break;
      [a[i], a[largest]] = [a[largest], a[i]];
      swaps++;
      snap([], [i, largest], 4, "swap");
      i = largest;
    }
  };

  // Build max-heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    snap([i], [], 1, "compare");
    siftDown(i, n);
  }

  // Pop-fase: bytt rot med slutt, redusér heap-størrelse, sift ned.
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    swaps++;
    snap([], [0, end], 3, "swap");
    sortedIdx.push(end);
    snap([], [], 2, "mark-sorted");
    siftDown(0, end);
  }
  sortedIdx.push(0);
  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    line: 0,
    kind: "done",
    comparisons,
    swaps,
  });
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

// --------- Hjelp: lag tilfeldig array av gitt størrelse ----------
function makeArray(size: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < size; i++) {
    out.push(5 + Math.floor(Math.random() * 95));
  }
  return out;
}

// ============================ KOMPONENT ============================

export function SortingVisualizer() {
  const [algo, setAlgo] = useState<Algo>("bubble");
  const [size, setSize] = useState(16);
  const [baseArray, setBaseArray] = useState<number[]>(() => makeArray(16));
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(60); // ms per step
  const timerRef = useRef<number | null>(null);

  // Beregn alle steg når algoritme eller baseArray endrer seg.
  const steps = useMemo<Step[]>(
    () => GENERATORS[algo](baseArray),
    [algo, baseArray],
  );

  const current = steps[Math.min(stepIdx, steps.length - 1)];
  const atEnd = stepIdx >= steps.length - 1;
  const maxVal = useMemo(() => Math.max(...baseArray, 1), [baseArray]);

  // Auto-play tick
  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    timerRef.current = window.setTimeout(() => {
      setStepIdx((s) => Math.min(s + 1, steps.length - 1));
    }, speed);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [playing, stepIdx, speed, steps.length, atEnd]);

  // Når algoritme/array endrer seg: reset til steg 0 og stopp avspilling
  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
  }, [algo, baseArray]);

  const shuffle = () => {
    setBaseArray(makeArray(size));
  };

  const reset = () => {
    setPlaying(false);
    setStepIdx(0);
  };

  const handleSizeChange = (n: number) => {
    setSize(n);
    setBaseArray(makeArray(n));
  };

  const stepOnce = () => {
    setPlaying(false);
    setStepIdx((s) => Math.min(s + 1, steps.length - 1));
  };

  const stepBack = () => {
    setPlaying(false);
    setStepIdx((s) => Math.max(s - 1, 0));
  };

  const pseudo = PSEUDO[algo];
  const meta = ALGOS.find((m) => m.id === algo)!;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Topp-bar med algoritme-velger */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Sortering — se algoritmen kjøre steg for steg
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ALGOS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setAlgo(m.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                algo === m.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
              title={m.complexity}
            >
              {m.label}{" "}
              <span
                className={`ml-1 font-mono text-[10px] ${
                  algo === m.id ? "text-brand-foreground/80" : "text-muted-foreground"
                }`}
              >
                {m.complexity}
              </span>
            </button>
          ))}
        </div>
      </div>

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

      {/* Kontroller */}
      <div className="px-4 py-3 border-t border-border bg-muted/20">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              disabled={atEnd}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-brand/40 text-brand hover:bg-brand/10 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              {playing ? (
                <>
                  <Pause className="h-3.5 w-3.5" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" /> Play
                </>
              )}
            </button>
            <button
              type="button"
              onClick={stepBack}
              disabled={stepIdx === 0}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted disabled:opacity-40"
              title="Ett steg tilbake"
            >
              <SkipForward className="h-3.5 w-3.5 -scale-x-100" />
            </button>
            <button
              type="button"
              onClick={stepOnce}
              disabled={atEnd}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted disabled:opacity-40"
              title="Ett steg fram"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={shuffle}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted"
            >
              <Shuffle className="h-3.5 w-3.5" /> Stokk
            </button>
          </div>

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

          <div className="flex items-center gap-2">
            <label htmlFor="speed-slider" className="text-xs text-muted-foreground">
              Tempo
            </label>
            <input
              id="speed-slider"
              type="range"
              min={10}
              max={400}
              step={10}
              value={400 - speed + 10}
              onChange={(e) => setSpeed(400 - Number(e.target.value) + 10)}
              className="w-28 accent-brand"
              title="Venstre = sakte, høyre = raskt"
            />
          </div>

          <div className="ml-auto flex items-center gap-4 text-xs font-mono">
            <span>
              <span className="text-muted-foreground">steg</span>{" "}
              <span className="tabular-nums">
                {stepIdx + 1}/{steps.length}
              </span>
            </span>
            <span>
              <span className="text-muted-foreground">sammenligninger</span>{" "}
              <span className="tabular-nums text-foreground">
                {current.comparisons}
              </span>
            </span>
            <span>
              <span className="text-muted-foreground">bytter</span>{" "}
              <span className="tabular-nums text-foreground">{current.swaps}</span>
            </span>
          </div>
        </div>

        {/* Forklarings-stripe under kontrollene */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px]">
          <Legend color="bg-border" label="ikke besøkt" />
          <Legend color="bg-yellow-400 dark:bg-yellow-500" label="sammenligner" />
          <Legend color="bg-red-500" label="bytter / overskriver" />
          <Legend color="bg-emerald-500" label="ferdig sortert" />
          {atEnd && (
            <span className="ml-auto text-emerald-600 dark:text-emerald-400 font-medium">
              Ferdig — {current.comparisons} sammenligninger, {current.swaps} bytter
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className={`inline-block w-3 h-3 rounded-sm ${color}`} />
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
  // Gap skaleres ned for store n så de ikke krymper bort
  const gap = n > 24 ? 1 : n > 16 ? 2 : 3;

  return (
    <div className="w-full h-full max-h-[260px] flex items-end justify-center gap-px" style={{ gap: `${gap}px` }}>
      {values.map((v, i) => {
        const heightPct = Math.max(4, (v / maxVal) * 100);
        let color = "bg-border";
        if (swpSet.has(i)) color = "bg-red-500";
        else if (cmpSet.has(i)) color = "bg-yellow-400 dark:bg-yellow-500";
        else if (sortedSet.has(i)) color = "bg-emerald-500";
        else color = "bg-foreground/60";
        return (
          <div
            key={i}
            className={`flex-1 rounded-t-sm transition-[height,background-color] duration-150 ease-out ${color}`}
            style={{ height: `${heightPct}%`, minWidth: "6px", maxWidth: "32px" }}
            title={`a[${i}] = ${v}`}
          />
        );
      })}
    </div>
  );
}
