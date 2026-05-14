import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Page-replacement-simulator: FIFO / LRU / Clock / Optimal
 *
 * Brukeren skriver en reference string + setter antall frames.
 * Per algoritme regner vi ut frame-innhold ved hvert steg + om
 * tilgangen var hit eller miss (page fault).
 *
 * Recharts: total fault-count per algoritme. Demonstrerer hvorfor
 * LRU/OPTIMAL ofte ligger nær hverandre og FIFO kan oppvise Beladys
 * anomali (flere frames → flere faults).
 */

type Algo = "FIFO" | "LRU" | "Clock" | "Optimal";

type StepFrame = {
  /** Page id in this frame slot, or null if empty. */
  page: number | null;
  /** Clock-algoritmens reference bit. Andre algoritmer ignorerer feltet. */
  refBit?: boolean;
};

type Step = {
  /** Hvilken page ble forespurt. */
  ref: number;
  /** Frames etter at steget er evaluert. */
  frames: StepFrame[];
  /** True hvis page fault, false hvis hit. */
  fault: boolean;
  /** Hvilken slot ble berørt (oppdatert/erstattet). */
  touchedSlot: number;
  /** Hvilken page ble kastet ut (kun ved replacement). */
  evicted: number | null;
};

const DEFAULT_STRING = "7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1";

function parseRefString(s: string): number[] {
  return s
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .map((t) => parseInt(t, 10))
    .filter((n) => Number.isFinite(n) && n >= 0 && n <= 99);
}

function emptyFrames(n: number): StepFrame[] {
  return Array.from({ length: n }, () => ({ page: null, refBit: false }));
}

/** Felles helper: finn slot der page == p, eller -1. */
function findSlot(frames: StepFrame[], p: number): number {
  return frames.findIndex((f) => f.page === p);
}

/** Finn en tom slot, eller -1. */
function emptySlot(frames: StepFrame[]): number {
  return frames.findIndex((f) => f.page === null);
}

function simulateFIFO(refs: number[], n: number): Step[] {
  const frames = emptyFrames(n);
  /** Order of insertion. */
  const order: number[] = [];
  const steps: Step[] = [];
  for (const ref of refs) {
    const hitSlot = findSlot(frames, ref);
    if (hitSlot !== -1) {
      steps.push({
        ref,
        frames: frames.map((f) => ({ ...f })),
        fault: false,
        touchedSlot: hitSlot,
        evicted: null,
      });
      continue;
    }
    // Miss
    let slot = emptySlot(frames);
    let evicted: number | null = null;
    if (slot === -1) {
      // Evict the oldest
      const oldest = order.shift()!;
      slot = findSlot(frames, oldest);
      evicted = oldest;
    }
    frames[slot] = { page: ref, refBit: false };
    order.push(ref);
    steps.push({
      ref,
      frames: frames.map((f) => ({ ...f })),
      fault: true,
      touchedSlot: slot,
      evicted,
    });
  }
  return steps;
}

function simulateLRU(refs: number[], n: number): Step[] {
  const frames = emptyFrames(n);
  /** Last-used timestamp per slot. */
  const lastUsed = new Array(n).fill(-1);
  const steps: Step[] = [];
  for (let t = 0; t < refs.length; t++) {
    const ref = refs[t];
    const hitSlot = findSlot(frames, ref);
    if (hitSlot !== -1) {
      lastUsed[hitSlot] = t;
      steps.push({
        ref,
        frames: frames.map((f) => ({ ...f })),
        fault: false,
        touchedSlot: hitSlot,
        evicted: null,
      });
      continue;
    }
    // Miss
    let slot = emptySlot(frames);
    let evicted: number | null = null;
    if (slot === -1) {
      // LRU: smallest lastUsed
      let lru = 0;
      for (let i = 1; i < n; i++) {
        if (lastUsed[i] < lastUsed[lru]) lru = i;
      }
      evicted = frames[lru].page;
      slot = lru;
    }
    frames[slot] = { page: ref, refBit: false };
    lastUsed[slot] = t;
    steps.push({
      ref,
      frames: frames.map((f) => ({ ...f })),
      fault: true,
      touchedSlot: slot,
      evicted,
    });
  }
  return steps;
}

function simulateClock(refs: number[], n: number): Step[] {
  const frames = emptyFrames(n);
  let hand = 0;
  const steps: Step[] = [];
  for (const ref of refs) {
    const hitSlot = findSlot(frames, ref);
    if (hitSlot !== -1) {
      frames[hitSlot].refBit = true;
      steps.push({
        ref,
        frames: frames.map((f) => ({ ...f })),
        fault: false,
        touchedSlot: hitSlot,
        evicted: null,
      });
      continue;
    }
    // Miss — first try empty
    let slot = emptySlot(frames);
    let evicted: number | null = null;
    if (slot === -1) {
      // Clock-sweep
      // Safe upper bound: 2n iterations guarantees finding a victim.
      for (let k = 0; k < 2 * n; k++) {
        if (!frames[hand].refBit) {
          slot = hand;
          break;
        }
        frames[hand].refBit = false;
        hand = (hand + 1) % n;
      }
      if (slot === -1) {
        // Should not happen, but pick hand defensively.
        slot = hand;
      }
      evicted = frames[slot].page;
      // Advance hand past the victim.
      hand = (slot + 1) % n;
    }
    frames[slot] = { page: ref, refBit: true };
    steps.push({
      ref,
      frames: frames.map((f) => ({ ...f })),
      fault: true,
      touchedSlot: slot,
      evicted,
    });
  }
  return steps;
}

function simulateOptimal(refs: number[], n: number): Step[] {
  const frames = emptyFrames(n);
  const steps: Step[] = [];
  for (let t = 0; t < refs.length; t++) {
    const ref = refs[t];
    const hitSlot = findSlot(frames, ref);
    if (hitSlot !== -1) {
      steps.push({
        ref,
        frames: frames.map((f) => ({ ...f })),
        fault: false,
        touchedSlot: hitSlot,
        evicted: null,
      });
      continue;
    }
    let slot = emptySlot(frames);
    let evicted: number | null = null;
    if (slot === -1) {
      // Optimal: evict the one used furthest in the future (or not at all).
      let bestSlot = 0;
      let bestDist = -1;
      for (let i = 0; i < n; i++) {
        const p = frames[i].page!;
        let next = Infinity;
        for (let k = t + 1; k < refs.length; k++) {
          if (refs[k] === p) {
            next = k;
            break;
          }
        }
        if (next > bestDist) {
          bestDist = next;
          bestSlot = i;
          if (next === Infinity) break;
        }
      }
      slot = bestSlot;
      evicted = frames[slot].page;
    }
    frames[slot] = { page: ref, refBit: false };
    steps.push({
      ref,
      frames: frames.map((f) => ({ ...f })),
      fault: true,
      touchedSlot: slot,
      evicted,
    });
  }
  return steps;
}

function simulate(algo: Algo, refs: number[], n: number): Step[] {
  switch (algo) {
    case "FIFO":
      return simulateFIFO(refs, n);
    case "LRU":
      return simulateLRU(refs, n);
    case "Clock":
      return simulateClock(refs, n);
    case "Optimal":
      return simulateOptimal(refs, n);
  }
}

const ALGOS: Algo[] = ["FIFO", "LRU", "Clock", "Optimal"];
const ALGO_COLOR: Record<Algo, string> = {
  FIFO: "#f43f5e", // rose
  LRU: "#10b981", // emerald
  Clock: "#0ea5e9", // sky
  Optimal: "#8b5cf6", // violet
};

export function PageReplacementSim() {
  const [refText, setRefText] = useState(DEFAULT_STRING);
  const [frameCount, setFrameCount] = useState(3);
  const [algo, setAlgo] = useState<Algo>("FIFO");
  const [stepIdx, setStepIdx] = useState(0);
  const playRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);

  const refs = useMemo(() => parseRefString(refText), [refText]);

  const steps = useMemo(
    () => simulate(algo, refs, frameCount),
    [algo, refs, frameCount],
  );

  // Reset stepIdx when inputs change.
  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
    if (playRef.current !== null) {
      window.clearTimeout(playRef.current);
      playRef.current = null;
    }
  }, [refText, frameCount, algo]);

  // Auto-play
  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= steps.length) {
      setPlaying(false);
      return;
    }
    playRef.current = window.setTimeout(() => {
      setStepIdx((i) => i + 1);
    }, 600);
    return () => {
      if (playRef.current !== null) {
        window.clearTimeout(playRef.current);
        playRef.current = null;
      }
    };
  }, [playing, stepIdx, steps.length]);

  const faultsAt = useMemo(() => {
    return steps.slice(0, stepIdx).filter((s) => s.fault).length;
  }, [steps, stepIdx]);

  // Total faults per algorithm (for the bar chart).
  const algoStats = useMemo(() => {
    return ALGOS.map((a) => {
      const sim = simulate(a, refs, frameCount);
      const faults = sim.filter((s) => s.fault).length;
      const hits = sim.length - faults;
      return { algo: a, faults, hits };
    });
  }, [refs, frameCount]);

  // Belady comparison: faults across frame counts 3..5 for FIFO and LRU.
  const beladyData = useMemo(() => {
    const counts = [3, 4, 5];
    return counts.map((n) => ({
      frames: n,
      FIFO: simulateFIFO(refs, n).filter((s) => s.fault).length,
      LRU: simulateLRU(refs, n).filter((s) => s.fault).length,
      Optimal: simulateOptimal(refs, n).filter((s) => s.fault).length,
    }));
  }, [refs]);

  function stepOne() {
    if (stepIdx < steps.length) setStepIdx((i) => i + 1);
  }
  function reset() {
    setStepIdx(0);
    setPlaying(false);
  }
  function runAll() {
    setStepIdx(steps.length);
    setPlaying(false);
  }
  function play() {
    if (stepIdx >= steps.length) setStepIdx(0);
    setPlaying(true);
  }
  function pause() {
    setPlaying(false);
  }

  // Snapshot of frames at stepIdx-1 (current visible state).
  const currentStep = stepIdx > 0 ? steps[stepIdx - 1] : null;
  const currentFrames: StepFrame[] = currentStep
    ? currentStep.frames
    : emptyFrames(frameCount);

  // Build full timeline table data — one column per reference access.
  const timeline = steps.slice(0, Math.max(stepIdx, 0));

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Controls */}
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <label className="block text-xs text-muted-foreground">
          <div className="mb-1">Reference string (mellomrom-separert)</div>
          <input
            type="text"
            value={refText}
            onChange={(e) => setRefText(e.target.value)}
            className="w-full font-mono text-xs rounded-md border border-border bg-background px-2 py-1.5"
            placeholder="7 0 1 2 0 3 ..."
          />
          <div className="text-[10px] mt-1">
            Parser fant {refs.length} tilganger
            {refs.length === 0 ? " — sjekk input." : "."}
          </div>
        </label>
        <label className="block text-xs text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>Antall frames: {frameCount}</span>
            <span className="opacity-60">3 – 5</span>
          </div>
          <input
            type="range"
            min={3}
            max={5}
            step={1}
            value={frameCount}
            onChange={(e) => setFrameCount(parseInt(e.target.value, 10))}
            className="w-full"
          />
        </label>
      </div>

      {/* Algo toggle */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {ALGOS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAlgo(a)}
            className={`text-xs rounded-md border px-3 py-1.5 transition-colors ${
              algo === a
                ? "border-brand bg-brand/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:border-brand/40"
            }`}
          >
            {a}
          </button>
        ))}
        <div className="ml-auto flex gap-1.5">
          <button
            type="button"
            onClick={stepOne}
            disabled={stepIdx >= steps.length}
            className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted disabled:opacity-40"
          >
            Steg
          </button>
          {playing ? (
            <button
              type="button"
              onClick={pause}
              className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted"
            >
              Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={play}
              disabled={steps.length === 0}
              className="text-xs rounded-md border border-brand bg-brand/10 px-3 py-1.5 hover:bg-brand/20 disabled:opacity-40"
            >
              Spill
            </button>
          )}
          <button
            type="button"
            onClick={runAll}
            disabled={steps.length === 0}
            className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted disabled:opacity-40"
          >
            Kjør hele
          </button>
          <button
            type="button"
            onClick={reset}
            className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Live frames at current step */}
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-muted-foreground mb-2">
            Frames akkurat nå ({algo})
            {currentStep && (
              <>
                {" "}— forespørsel <span className="font-mono text-foreground">{currentStep.ref}</span> ={" "}
                {currentStep.fault ? (
                  <span className="text-rose-500 font-semibold">PAGE FAULT</span>
                ) : (
                  <span className="text-emerald-500 font-semibold">HIT</span>
                )}
                {currentStep.evicted !== null && (
                  <span className="text-muted-foreground"> · kastet ut {currentStep.evicted}</span>
                )}
              </>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            {currentFrames.map((f, i) => {
              const isTouched = currentStep && currentStep.touchedSlot === i;
              const hitGreen = isTouched && currentStep && !currentStep.fault;
              const faultRed = isTouched && currentStep && currentStep.fault;
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 font-mono text-sm ${
                    hitGreen
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                      : faultRed
                        ? "border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-300"
                        : f.page === null
                          ? "border-border bg-muted/30 text-muted-foreground"
                          : "border-border bg-background text-foreground"
                  }`}
                >
                  <span className="text-[10px] opacity-60">Frame {i}</span>
                  <span className="text-lg font-semibold">
                    {f.page === null ? "∅" : f.page}
                  </span>
                  {algo === "Clock" && (
                    <span className="text-[10px] opacity-60">
                      ref={f.refBit ? 1 : 0}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-md border border-border p-2">
              <div className="text-muted-foreground">Steg</div>
              <div className="font-mono">
                {stepIdx} / {steps.length}
              </div>
            </div>
            <div className="rounded-md border border-border p-2">
              <div className="text-muted-foreground">Faults</div>
              <div className="font-mono text-rose-500">{faultsAt}</div>
            </div>
            <div className="rounded-md border border-border p-2">
              <div className="text-muted-foreground">Hit-rate</div>
              <div className="font-mono">
                {stepIdx === 0
                  ? "—"
                  : `${(((stepIdx - faultsAt) / stepIdx) * 100).toFixed(0)} %`}
              </div>
            </div>
          </div>
        </div>

        {/* Bar chart: faults per algorithm */}
        <div>
          <div className="text-xs text-muted-foreground mb-2">
            Total page faults per algoritme (samme reference string,{" "}
            {frameCount} frames)
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={algoStats}>
                <CartesianGrid
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="algo"
                  tick={{ fontSize: 11 }}
                  stroke="currentColor"
                  strokeOpacity={0.5}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke="currentColor"
                  strokeOpacity={0.5}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    background: "var(--card, #fff)",
                    border: "1px solid var(--border, #ccc)",
                    borderRadius: 6,
                  }}
                />
                <Bar dataKey="faults" isAnimationActive={false}>
                  {algoStats.map((d) => (
                    <Cell key={d.algo} fill={ALGO_COLOR[d.algo]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            Forventet: <span className="text-violet-500">Optimal</span> ≤{" "}
            <span className="text-emerald-500">LRU</span> ≈{" "}
            <span className="text-sky-500">Clock</span> ≤{" "}
            <span className="text-rose-500">FIFO</span>. På uregelmessige
            strenger kan FIFO faktisk slå LRU på samme frame-tall.
          </div>
        </div>
      </div>

      {/* Timeline table */}
      {timeline.length > 0 && (
        <div className="overflow-x-auto">
          <div className="text-xs text-muted-foreground mb-2">
            Tids-tabell — én kolonne per tilgang. F = fault, H = hit.
          </div>
          <table className="text-xs font-mono">
            <thead>
              <tr>
                <th className="text-left px-2 py-1 text-muted-foreground w-20">
                  Ref
                </th>
                {timeline.map((s, i) => (
                  <th
                    key={i}
                    className={`px-2 py-1 text-center border-l border-border ${
                      s.fault ? "text-rose-500" : "text-emerald-500"
                    }`}
                  >
                    {s.ref}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: frameCount }, (_, slot) => (
                <tr key={slot} className="border-t border-border">
                  <td className="px-2 py-1 text-muted-foreground">
                    Frame {slot}
                  </td>
                  {timeline.map((s, i) => {
                    const v = s.frames[slot].page;
                    const isTouched = s.touchedSlot === slot;
                    const hit = isTouched && !s.fault;
                    const fault = isTouched && s.fault;
                    return (
                      <td
                        key={i}
                        className={`px-2 py-1 text-center border-l border-border ${
                          hit
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                            : fault
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-300"
                              : ""
                        }`}
                      >
                        {v === null ? "·" : v}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-t border-border bg-muted/20">
                <td className="px-2 py-1 text-muted-foreground">F/H</td>
                {timeline.map((s, i) => (
                  <td
                    key={i}
                    className={`px-2 py-1 text-center border-l border-border ${
                      s.fault ? "text-rose-500" : "text-emerald-500"
                    }`}
                  >
                    {s.fault ? "F" : "H"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Belady inset */}
      <div className="mt-4 rounded-md border border-border bg-background p-3">
        <div className="text-xs font-semibold text-foreground mb-1">
          Beladys anomali — flere frames gir ikke alltid færre faults
        </div>
        <div className="text-[11px] text-muted-foreground mb-2">
          Antall faults med 3 / 4 / 5 frames for denne reference-strengen.
          FIFO kan oppvise anomali (kurven går opp). LRU og Optimal er
          monotont fallende.
        </div>
        <div className="h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={beladyData}>
              <CartesianGrid
                stroke="currentColor"
                strokeOpacity={0.1}
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="frames"
                tick={{ fontSize: 10 }}
                stroke="currentColor"
                strokeOpacity={0.5}
                label={{
                  value: "Antall frames",
                  position: "insideBottom",
                  offset: -5,
                  fontSize: 10,
                }}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                stroke="currentColor"
                strokeOpacity={0.5}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  background: "var(--card, #fff)",
                  border: "1px solid var(--border, #ccc)",
                  borderRadius: 6,
                }}
              />
              <Bar
                dataKey="FIFO"
                fill={ALGO_COLOR.FIFO}
                isAnimationActive={false}
              />
              <Bar
                dataKey="LRU"
                fill={ALGO_COLOR.LRU}
                isAnimationActive={false}
              />
              <Bar
                dataKey="Optimal"
                fill={ALGO_COLOR.Optimal}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-3 text-[10px] mt-1">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 bg-rose-500" /> FIFO
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 bg-emerald-500" /> LRU
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 bg-violet-500" /> Optimal
          </span>
        </div>
      </div>
    </div>
  );
}
