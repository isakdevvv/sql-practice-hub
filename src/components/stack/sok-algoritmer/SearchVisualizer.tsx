import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, SkipForward, Shuffle, RotateCcw, ArrowDownAZ } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv visualisering av array-søk: lineær, binær, eksponentiell og
// interpolasjon. Strategi: pre-kompute hele kjøringen til en liste med Step,
// så Play/Pause/Step bare flytter indeks i lista (samme mønster som
// SortingVisualizer.tsx).
//
// MERK: dette gjelder klassisk søk i en talliste — IKKE AI-grafsøk (BFS/A*).
// Inkludert her som en oppvarming og for å vise sammenhengen mellom
// invarianten i binærsøk og «utforsk lovende rom»-tankegangen i AI-søk.
// --------------------------------------------------------------------------

type Mode = "linear" | "binary" | "exponential" | "interpolation";

type StepKind = "probe" | "shrink" | "found" | "missing" | "phase";

type Step = {
  array: number[];
  // Indeks som blir testet i dette steget (1 stk for de fleste algoritmer).
  probe: number | null;
  // Aktivt søkeintervall (inklusive begge ender). null = hele arrayet.
  lo: number | null;
  hi: number | null;
  // For eksponentiell: hvilken indeks er "fronten" som dobles.
  expI: number | null;
  // Linje i pseudokode (1-indeksert; 0 = ingen).
  line: number;
  kind: StepKind;
  comparisons: number;
  // Forklaring som vises under bar-charten — én linje, norsk.
  note: string;
  // Når vi har fasit, settes denne ved siste steg.
  foundIdx: number | null;
};

const MODES: { id: Mode; label: string; complexity: string }[] = [
  { id: "linear", label: "Lineær", complexity: "O(n)" },
  { id: "binary", label: "Binær", complexity: "O(log n)" },
  { id: "exponential", label: "Eksponentiell", complexity: "O(log i)" },
  { id: "interpolation", label: "Interpolasjon", complexity: "O(log log n) snitt" },
];

const PSEUDO: Record<Mode, string[]> = {
  linear: [
    "for i = 0 .. n-1:",
    "  if a[i] == target:",
    "    return i",
    "return -1",
  ],
  binary: [
    "lo = 0; hi = n-1",
    "while lo <= hi:",
    "  mid = (lo + hi) / 2",
    "  if a[mid] == target: return mid",
    "  if a[mid] < target: lo = mid + 1",
    "  else:                hi = mid - 1",
    "return -1",
  ],
  exponential: [
    "if a[0] == target: return 0",
    "i = 1",
    "while i < n and a[i] <= target:",
    "  i = i * 2",
    "lo = i / 2; hi = min(i, n-1)",
    "binærsøk i a[lo..hi]",
  ],
  interpolation: [
    "lo = 0; hi = n-1",
    "while lo <= hi and a[lo] <= target <= a[hi]:",
    "  pos = lo + (target - a[lo])",
    "         * (hi - lo)",
    "         / (a[hi] - a[lo])",
    "  if a[pos] == target: return pos",
    "  if a[pos] < target:  lo = pos + 1",
    "  else:                hi = pos - 1",
    "return -1",
  ],
};

// ----------------- STEP-GENERATORER -----------------

function genLinear(arr: number[], target: number): Step[] {
  const steps: Step[] = [];
  let comparisons = 0;
  steps.push({
    array: arr,
    probe: null,
    lo: 0,
    hi: arr.length - 1,
    expI: null,
    line: 1,
    kind: "phase",
    comparisons,
    note: `Start: gå gjennom hele arrayet fra venstre. Leter etter ${target}.`,
    foundIdx: null,
  });
  for (let i = 0; i < arr.length; i++) {
    comparisons++;
    if (arr[i] === target) {
      steps.push({
        array: arr,
        probe: i,
        lo: 0,
        hi: arr.length - 1,
        expI: null,
        line: 3,
        kind: "found",
        comparisons,
        note: `Treff! a[${i}] = ${target}. Ferdig etter ${comparisons} sammenligning${
          comparisons === 1 ? "" : "er"
        }.`,
        foundIdx: i,
      });
      return steps;
    }
    steps.push({
      array: arr,
      probe: i,
      lo: 0,
      hi: arr.length - 1,
      expI: null,
      line: 2,
      kind: "probe",
      comparisons,
      note: `a[${i}] = ${arr[i]} ${arr[i] < target ? "<" : ">"} ${target} — fortsett.`,
      foundIdx: null,
    });
  }
  steps.push({
    array: arr,
    probe: null,
    lo: 0,
    hi: arr.length - 1,
    expI: null,
    line: 4,
    kind: "missing",
    comparisons,
    note: `${target} finnes ikke. Sjekket alle ${arr.length} elementer.`,
    foundIdx: -1,
  });
  return steps;
}

function genBinary(arr: number[], target: number): Step[] {
  const steps: Step[] = [];
  let comparisons = 0;
  let lo = 0;
  let hi = arr.length - 1;
  steps.push({
    array: arr,
    probe: null,
    lo,
    hi,
    expI: null,
    line: 1,
    kind: "phase",
    comparisons,
    note: `Start: lo=0, hi=${hi}. Hele intervallet er aktivt.`,
    foundIdx: null,
  });
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    steps.push({
      array: arr,
      probe: mid,
      lo,
      hi,
      expI: null,
      line: 3,
      kind: "probe",
      comparisons,
      note: `mid = (lo + hi) / 2 = (${lo} + ${hi}) / 2 = ${mid}. Test a[${mid}] = ${arr[mid]}.`,
      foundIdx: null,
    });
    comparisons++;
    if (arr[mid] === target) {
      steps.push({
        array: arr,
        probe: mid,
        lo,
        hi,
        expI: null,
        line: 4,
        kind: "found",
        comparisons,
        note: `Treff! a[${mid}] = ${target}. ${comparisons} sammenligning${
          comparisons === 1 ? "" : "er"
        }.`,
        foundIdx: mid,
      });
      return steps;
    }
    if (arr[mid] < target) {
      const oldLo = lo;
      lo = mid + 1;
      steps.push({
        array: arr,
        probe: mid,
        lo,
        hi,
        expI: null,
        line: 5,
        kind: "shrink",
        comparisons,
        note: `a[${mid}] = ${arr[mid]} < ${target} → kast bort venstre halvdel. lo: ${oldLo} → ${lo}.`,
        foundIdx: null,
      });
    } else {
      const oldHi = hi;
      hi = mid - 1;
      steps.push({
        array: arr,
        probe: mid,
        lo,
        hi,
        expI: null,
        line: 6,
        kind: "shrink",
        comparisons,
        note: `a[${mid}] = ${arr[mid]} > ${target} → kast bort høyre halvdel. hi: ${oldHi} → ${hi}.`,
        foundIdx: null,
      });
    }
  }
  steps.push({
    array: arr,
    probe: null,
    lo,
    hi,
    expI: null,
    line: 7,
    kind: "missing",
    comparisons,
    note: `Intervallet er tomt (lo > hi). ${target} finnes ikke. ${comparisons} sammenligninger.`,
    foundIdx: -1,
  });
  return steps;
}

function genExponential(arr: number[], target: number): Step[] {
  const steps: Step[] = [];
  let comparisons = 0;
  const n = arr.length;
  if (n === 0) return steps;
  // Fase 1: dobling
  steps.push({
    array: arr,
    probe: 0,
    lo: 0,
    hi: n - 1,
    expI: 0,
    line: 1,
    kind: "phase",
    comparisons,
    note: `Fase 1 — dobling. Test først a[0] = ${arr[0]}.`,
    foundIdx: null,
  });
  comparisons++;
  if (arr[0] === target) {
    steps.push({
      array: arr,
      probe: 0,
      lo: 0,
      hi: n - 1,
      expI: 0,
      line: 1,
      kind: "found",
      comparisons,
      note: `Treff allerede på a[0] = ${target}.`,
      foundIdx: 0,
    });
    return steps;
  }
  let i = 1;
  while (i < n && arr[i] <= target) {
    steps.push({
      array: arr,
      probe: i,
      lo: 0,
      hi: n - 1,
      expI: i,
      line: 3,
      kind: "probe",
      comparisons,
      note: `i = ${i}: a[${i}] = ${arr[i]} ≤ ${target} → dobl: i = ${i * 2}.`,
      foundIdx: null,
    });
    comparisons++;
    i *= 2;
  }
  // Etter løkka: enten i >= n, eller arr[i] > target.
  const lo = Math.floor(i / 2);
  const hi = Math.min(i, n - 1);
  steps.push({
    array: arr,
    probe: i < n ? i : null,
    lo,
    hi,
    expI: i < n ? i : null,
    line: 5,
    kind: "phase",
    comparisons,
    note:
      i < n
        ? `Stopp: a[${i}] = ${arr[i]} > ${target}. Vinduet er a[${lo}..${hi}].`
        : `Nådde slutten (i=${i} ≥ n=${n}). Vinduet er a[${lo}..${hi}].`,
    foundIdx: null,
  });
  // Fase 2: binærsøk i [lo, hi]
  let blo = lo;
  let bhi = hi;
  steps.push({
    array: arr,
    probe: null,
    lo: blo,
    hi: bhi,
    expI: null,
    line: 6,
    kind: "phase",
    comparisons,
    note: `Fase 2 — binærsøk i a[${blo}..${bhi}].`,
    foundIdx: null,
  });
  while (blo <= bhi) {
    const mid = Math.floor((blo + bhi) / 2);
    steps.push({
      array: arr,
      probe: mid,
      lo: blo,
      hi: bhi,
      expI: null,
      line: 6,
      kind: "probe",
      comparisons,
      note: `mid = ${mid}. Test a[${mid}] = ${arr[mid]}.`,
      foundIdx: null,
    });
    comparisons++;
    if (arr[mid] === target) {
      steps.push({
        array: arr,
        probe: mid,
        lo: blo,
        hi: bhi,
        expI: null,
        line: 6,
        kind: "found",
        comparisons,
        note: `Treff! a[${mid}] = ${target}. ${comparisons} sammenligninger totalt.`,
        foundIdx: mid,
      });
      return steps;
    }
    if (arr[mid] < target) {
      blo = mid + 1;
      steps.push({
        array: arr,
        probe: mid,
        lo: blo,
        hi: bhi,
        expI: null,
        line: 6,
        kind: "shrink",
        comparisons,
        note: `a[${mid}] = ${arr[mid]} < ${target} → lo = ${blo}.`,
        foundIdx: null,
      });
    } else {
      bhi = mid - 1;
      steps.push({
        array: arr,
        probe: mid,
        lo: blo,
        hi: bhi,
        expI: null,
        line: 6,
        kind: "shrink",
        comparisons,
        note: `a[${mid}] = ${arr[mid]} > ${target} → hi = ${bhi}.`,
        foundIdx: null,
      });
    }
  }
  steps.push({
    array: arr,
    probe: null,
    lo: blo,
    hi: bhi,
    expI: null,
    line: 6,
    kind: "missing",
    comparisons,
    note: `${target} finnes ikke i vinduet. ${comparisons} sammenligninger.`,
    foundIdx: -1,
  });
  return steps;
}

function genInterpolation(arr: number[], target: number): Step[] {
  const steps: Step[] = [];
  let comparisons = 0;
  let lo = 0;
  let hi = arr.length - 1;
  steps.push({
    array: arr,
    probe: null,
    lo,
    hi,
    expI: null,
    line: 1,
    kind: "phase",
    comparisons,
    note: `Start: lo=0, hi=${hi}. Vi gjetter posisjon ut fra hvor stor target er sammenlignet med endene.`,
    foundIdx: null,
  });
  while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
    if (arr[lo] === arr[hi]) {
      // Unngå deling på null — flat region.
      comparisons++;
      if (arr[lo] === target) {
        steps.push({
          array: arr,
          probe: lo,
          lo,
          hi,
          expI: null,
          line: 6,
          kind: "found",
          comparisons,
          note: `a[${lo}..${hi}] er konstant og lik target. Treff på a[${lo}].`,
          foundIdx: lo,
        });
        return steps;
      }
      break;
    }
    const pos = Math.max(
      lo,
      Math.min(
        hi,
        lo +
          Math.floor(((target - arr[lo]) * (hi - lo)) / (arr[hi] - arr[lo])),
      ),
    );
    steps.push({
      array: arr,
      probe: pos,
      lo,
      hi,
      expI: null,
      line: 3,
      kind: "probe",
      comparisons,
      note: `pos = ${lo} + (${target} - ${arr[lo]}) · (${hi} - ${lo}) / (${arr[hi]} - ${arr[lo]}) = ${pos}. Test a[${pos}] = ${arr[pos]}.`,
      foundIdx: null,
    });
    comparisons++;
    if (arr[pos] === target) {
      steps.push({
        array: arr,
        probe: pos,
        lo,
        hi,
        expI: null,
        line: 6,
        kind: "found",
        comparisons,
        note: `Treff! a[${pos}] = ${target}. ${comparisons} sammenligning${
          comparisons === 1 ? "" : "er"
        }.`,
        foundIdx: pos,
      });
      return steps;
    }
    if (arr[pos] < target) {
      const oldLo = lo;
      lo = pos + 1;
      steps.push({
        array: arr,
        probe: pos,
        lo,
        hi,
        expI: null,
        line: 7,
        kind: "shrink",
        comparisons,
        note: `a[${pos}] = ${arr[pos]} < ${target} → lo: ${oldLo} → ${lo}.`,
        foundIdx: null,
      });
    } else {
      const oldHi = hi;
      hi = pos - 1;
      steps.push({
        array: arr,
        probe: pos,
        lo,
        hi,
        expI: null,
        line: 8,
        kind: "shrink",
        comparisons,
        note: `a[${pos}] = ${arr[pos]} > ${target} → hi: ${oldHi} → ${hi}.`,
        foundIdx: null,
      });
    }
  }
  steps.push({
    array: arr,
    probe: null,
    lo,
    hi,
    expI: null,
    line: 9,
    kind: "missing",
    comparisons,
    note: `${target} ligger utenfor a[lo..hi] eller intervallet er tomt. Finnes ikke.`,
    foundIdx: -1,
  });
  return steps;
}

const GENERATORS: Record<Mode, (arr: number[], target: number) => Step[]> = {
  linear: genLinear,
  binary: genBinary,
  exponential: genExponential,
  interpolation: genInterpolation,
};

// ----------------- HJELPERE -----------------

function makeArray(size: number, sorted: boolean): number[] {
  const out: number[] = [];
  // Trekk distinkte verdier i [1, 99] — bruker Set for unike, så sortering blir veldefinert.
  const seen = new Set<number>();
  while (out.length < size) {
    const v = 1 + Math.floor(Math.random() * 99);
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  if (sorted) out.sort((a, b) => a - b);
  return out;
}

// ============================ KOMPONENT ============================

export function SearchVisualizer() {
  const [mode, setMode] = useState<Mode>("binary");
  const [size, setSize] = useState(16);
  // Binær/eksp/interpolasjon krever sortert. Lineær er likegyldig — vi
  // holder samme array sortert by default, men lar bruker stokke for lineær.
  const [baseArray, setBaseArray] = useState<number[]>(() => makeArray(16, true));
  const [target, setTarget] = useState<number>(() => {
    // Velg en eksisterende verdi som default-target ved første render
    const a = baseArray;
    return a[Math.floor(a.length / 2)] ?? 50;
  });
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(280); // ms per step
  const timerRef = useRef<number | null>(null);

  const needsSorted = mode !== "linear";
  const isSorted = useMemo(
    () => baseArray.every((v, i) => i === 0 || baseArray[i - 1] <= v),
    [baseArray],
  );

  const steps = useMemo<Step[]>(
    () => GENERATORS[mode](baseArray, target),
    [mode, baseArray, target],
  );

  const current = steps[Math.min(stepIdx, steps.length - 1)];
  const atEnd = stepIdx >= steps.length - 1;
  const maxVal = useMemo(() => Math.max(...baseArray, 1), [baseArray]);

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

  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
  }, [mode, baseArray, target]);

  const shuffle = () => {
    setBaseArray(makeArray(size, false));
  };
  const sortArr = () => {
    setBaseArray((prev) => [...prev].sort((a, b) => a - b));
  };
  const reset = () => {
    setPlaying(false);
    setStepIdx(0);
  };
  const handleSizeChange = (n: number) => {
    setSize(n);
    setBaseArray(makeArray(n, needsSorted));
  };
  const stepOnce = () => {
    setPlaying(false);
    setStepIdx((s) => Math.min(s + 1, steps.length - 1));
  };
  const stepBack = () => {
    setPlaying(false);
    setStepIdx((s) => Math.max(s - 1, 0));
  };
  const pickRandomTarget = () => {
    if (baseArray.length === 0) return;
    // 70% sjanse for å treffe, 30% for å bomme — gir variasjon i kjøringene.
    if (Math.random() < 0.7) {
      setTarget(baseArray[Math.floor(Math.random() * baseArray.length)]);
    } else {
      let t = 1 + Math.floor(Math.random() * 99);
      let tries = 0;
      while (baseArray.includes(t) && tries < 10) {
        t = 1 + Math.floor(Math.random() * 99);
        tries++;
      }
      setTarget(t);
    }
  };

  const pseudo = PSEUDO[mode];
  const meta = MODES.find((m) => m.id === mode)!;
  const warnUnsorted = needsSorted && !isSorted;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Topp-bar med modus-velger */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Array-søk — fire algoritmer, ett steg av gangen
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
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                mode === m.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
              title={m.complexity}
            >
              {m.label}{" "}
              <span
                className={`ml-1 font-mono text-[10px] ${
                  mode === m.id ? "text-brand-foreground/80" : "text-muted-foreground"
                }`}
              >
                {m.complexity}
              </span>
            </button>
          ))}
        </div>
        {warnUnsorted && (
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            Denne algoritmen krever sortert array. Trykk «Sortér» eller bytt til Lineær.
          </div>
        )}
      </div>

      {/* Bar-row + pseudokode side om side */}
      <div className="grid md:grid-cols-[1fr_320px] gap-0">
        <div className="p-6 min-h-[280px] flex flex-col bg-background border-b md:border-b-0 md:border-r border-border">
          <BarRow
            values={current.array}
            probe={current.probe}
            lo={current.lo}
            hi={current.hi}
            expI={current.expI}
            foundIdx={current.foundIdx}
            kind={current.kind}
            maxVal={maxVal}
          />
          <div className="mt-3 text-xs text-muted-foreground min-h-[2.5em]">
            {current.note}
          </div>
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
              title="Stokk om verdiene (lager usortert)"
            >
              <Shuffle className="h-3.5 w-3.5" /> Stokk
            </button>
            <button
              type="button"
              onClick={sortArr}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted"
              title="Sortér arrayet stigende"
            >
              <ArrowDownAZ className="h-3.5 w-3.5" /> Sortér
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sok-size-slider" className="text-xs text-muted-foreground">
              n = {size}
            </label>
            <input
              id="sok-size-slider"
              type="range"
              min={8}
              max={32}
              value={size}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="w-28 accent-brand"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sok-target" className="text-xs text-muted-foreground">
              target
            </label>
            <input
              id="sok-target"
              type="number"
              min={1}
              max={99}
              value={target}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!Number.isNaN(v)) setTarget(v);
              }}
              className="w-16 px-2 py-1 rounded border border-border bg-background text-xs font-mono tabular-nums"
            />
            <button
              type="button"
              onClick={pickRandomTarget}
              className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
              title="Velg et tilfeldig target"
            >
              tilfeldig
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sok-speed" className="text-xs text-muted-foreground">
              Tempo
            </label>
            <input
              id="sok-speed"
              type="range"
              min={60}
              max={800}
              step={20}
              value={860 - speed}
              onChange={(e) => setSpeed(860 - Number(e.target.value))}
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
            {current.lo !== null && current.hi !== null && (
              <span>
                <span className="text-muted-foreground">[lo..hi]</span>{" "}
                <span className="tabular-nums">
                  [{current.lo}..{current.hi}]
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px]">
          <Legend color="bg-foreground/60" label="aktivt intervall" />
          <Legend color="bg-border" label="utenfor [lo..hi]" />
          <Legend color="bg-brand" label="kandidat (probe)" />
          <Legend color="bg-emerald-500" label="treff" />
          {current.foundIdx !== null && current.foundIdx >= 0 && (
            <span className="ml-auto text-emerald-600 dark:text-emerald-400 font-medium">
              Fant {target} på indeks {current.foundIdx} — {current.comparisons}{" "}
              sammenligninger.
            </span>
          )}
          {current.foundIdx === -1 && (
            <span className="ml-auto text-amber-600 dark:text-amber-400 font-medium">
              {target} finnes ikke — {current.comparisons} sammenligninger.
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

function BarRow({
  values,
  probe,
  lo,
  hi,
  expI,
  foundIdx,
  kind,
  maxVal,
}: {
  values: number[];
  probe: number | null;
  lo: number | null;
  hi: number | null;
  expI: number | null;
  foundIdx: number | null;
  kind: StepKind;
  maxVal: number;
}) {
  const n = values.length;
  const gap = n > 24 ? 1 : n > 16 ? 2 : 3;
  const loEff = lo ?? 0;
  const hiEff = hi ?? n - 1;

  return (
    <div className="w-full">
      <div
        className="flex items-end justify-center"
        style={{ gap: `${gap}px`, minHeight: "180px" }}
      >
        {values.map((v, i) => {
          const inRange = i >= loEff && i <= hiEff;
          const isProbe = i === probe;
          const isFound =
            foundIdx !== null && foundIdx >= 0 && i === foundIdx && kind === "found";
          const isExpFront = expI !== null && i === expI && !isProbe;

          let barColor = "bg-foreground/60";
          if (!inRange) barColor = "bg-border";
          if (isProbe) barColor = "bg-brand";
          if (isFound) barColor = "bg-emerald-500";
          if (isExpFront && !isProbe) barColor = "bg-amber-500";

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center"
              style={{ minWidth: "16px", maxWidth: "36px" }}
            >
              <div
                className={`w-full rounded-t-sm transition-[height,background-color] duration-200 ease-out ${barColor} ${
                  isFound ? "ring-2 ring-emerald-400" : ""
                }`}
                style={{
                  height: `${Math.max(8, (v / maxVal) * 140)}px`,
                }}
                title={`a[${i}] = ${v}`}
              />
              <div className="text-[9px] font-mono tabular-nums text-muted-foreground mt-0.5">
                {v}
              </div>
              <div className="text-[8px] tabular-nums text-muted-foreground/60">
                {i}
              </div>
            </div>
          );
        })}
      </div>

      {/* Markører for lo/hi/mid under bar-rekka */}
      <div className="mt-1 relative h-5">
        <BoundMarker idx={lo} total={n} label="lo" color="text-brand" />
        <BoundMarker idx={hi} total={n} label="hi" color="text-brand" />
        {probe !== null && (
          <BoundMarker idx={probe} total={n} label="mid" color="text-brand font-semibold" />
        )}
        {expI !== null && expI !== probe && (
          <BoundMarker idx={expI} total={n} label="i" color="text-amber-600 dark:text-amber-400" />
        )}
      </div>
    </div>
  );
}

function BoundMarker({
  idx,
  total,
  label,
  color,
}: {
  idx: number | null;
  total: number;
  label: string;
  color: string;
}) {
  if (idx === null || total === 0) return null;
  // Plassér markøren midt over barene. Vi bruker prosent av total bredde.
  const left = ((idx + 0.5) / total) * 100;
  return (
    <div
      className={`absolute -translate-x-1/2 text-[10px] font-mono ${color}`}
      style={{ left: `${left}%` }}
    >
      ↑{label}
    </div>
  );
}
