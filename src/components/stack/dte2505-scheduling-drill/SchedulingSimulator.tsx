import { useMemo, useRef, useState } from "react";
import { Tex } from "@/components/Tex";

type Job = {
  id: string;
  arrival: number;
  burst: number;
};

type Algo = "FIFO" | "SJF" | "STCF" | "RR" | "MLFQ";

type Slice = {
  jobId: string;
  start: number;
  end: number;
};

type JobResult = {
  id: string;
  arrival: number;
  burst: number;
  completion: number;
  turnaround: number;
  waiting: number;
  response: number;
};

type Preset = {
  label: string;
  jobs: Job[];
  algo: Algo;
  quantum?: number;
  note: string;
};

const PRESETS: Preset[] = [
  {
    label: "FIFO — convoy effect",
    jobs: [
      { id: "A", arrival: 0, burst: 10 },
      { id: "B", arrival: 1, burst: 1 },
      { id: "C", arrival: 2, burst: 1 },
    ],
    algo: "FIFO",
    note: "Lang jobb A blokkerer korte B og C. Snitt-turnaround blir høyt — klassisk problem hos FIFO/FCFS.",
  },
  {
    label: "SJF løser convoy",
    jobs: [
      { id: "A", arrival: 0, burst: 10 },
      { id: "B", arrival: 0, burst: 1 },
      { id: "C", arrival: 0, burst: 1 },
    ],
    algo: "SJF",
    note: "Med samme ankomst velger SJF kortest først — B og C får turnaround 1 og 2. Men trenger å vite burst på forhånd.",
  },
  {
    label: "STCF — preemptiv",
    jobs: [
      { id: "A", arrival: 0, burst: 10 },
      { id: "B", arrival: 3, burst: 2 },
      { id: "C", arrival: 5, burst: 1 },
    ],
    algo: "STCF",
    note: "STCF avbryter A når kortere jobb kommer. Respons-tid synker — viktig for interaktive jobber.",
  },
  {
    label: "Round-Robin q=2",
    jobs: [
      { id: "A", arrival: 0, burst: 5 },
      { id: "B", arrival: 0, burst: 3 },
      { id: "C", arrival: 0, burst: 7 },
    ],
    algo: "RR",
    quantum: 2,
    note: "RR gir lav respons-tid: alle får CPU innen kort tid. Pris: høyere snitt-turnaround pga. context-switching.",
  },
  {
    label: "MLFQ — Linux-stil",
    jobs: [
      { id: "I/O", arrival: 0, burst: 1 },
      { id: "I/O2", arrival: 0, burst: 1 },
      { id: "CPU", arrival: 0, burst: 10 },
    ],
    algo: "MLFQ",
    quantum: 2,
    note: "MLFQ favoriserer korte/interaktive jobber. CPU-tunge synker ned i prioriteten — simulert med to køer her.",
  },
];

// ----------- SCHEDULERS ----------

function scheduleFIFO(jobs: Job[]): Slice[] {
  const sorted = [...jobs].sort((a, b) => a.arrival - b.arrival);
  const slices: Slice[] = [];
  let t = 0;
  for (const j of sorted) {
    if (t < j.arrival) t = j.arrival;
    slices.push({ jobId: j.id, start: t, end: t + j.burst });
    t += j.burst;
  }
  return slices;
}

function scheduleSJF(jobs: Job[]): Slice[] {
  // Non-preemptive: when CPU idle, pick the shortest available.
  const remaining = jobs.map((j) => ({ ...j }));
  const slices: Slice[] = [];
  let t = 0;
  while (remaining.length > 0) {
    const ready = remaining.filter((r) => r.arrival <= t);
    if (ready.length === 0) {
      t = Math.min(...remaining.map((r) => r.arrival));
      continue;
    }
    ready.sort((a, b) => a.burst - b.burst);
    const pick = ready[0];
    slices.push({ jobId: pick.id, start: t, end: t + pick.burst });
    t += pick.burst;
    remaining.splice(remaining.indexOf(pick), 1);
  }
  return slices;
}

function scheduleSTCF(jobs: Job[]): Slice[] {
  // Preemptive: every time unit, pick the one with shortest REMAINING.
  const rem: Record<string, number> = {};
  for (const j of jobs) rem[j.id] = j.burst;
  const slices: Slice[] = [];
  let t = 0;
  let lastId: string | null = null;
  let lastStart = 0;
  const totalBurst = jobs.reduce((a, b) => a + b.burst, 0);
  let processed = 0;
  while (processed < totalBurst) {
    const ready = jobs.filter((j) => j.arrival <= t && rem[j.id] > 0);
    if (ready.length === 0) {
      t++;
      continue;
    }
    ready.sort((a, b) => rem[a.id] - rem[b.id]);
    const pick = ready[0];
    if (lastId !== pick.id) {
      if (lastId !== null) slices.push({ jobId: lastId, start: lastStart, end: t });
      lastId = pick.id;
      lastStart = t;
    }
    rem[pick.id]--;
    processed++;
    t++;
  }
  if (lastId !== null) slices.push({ jobId: lastId, start: lastStart, end: t });
  return slices;
}

function scheduleRR(jobs: Job[], quantum: number): Slice[] {
  const rem: Record<string, number> = {};
  for (const j of jobs) rem[j.id] = j.burst;
  const sortedByArrival = [...jobs].sort((a, b) => a.arrival - b.arrival);
  const queue: Job[] = [];
  const slices: Slice[] = [];
  let t = 0;
  let arrivalIdx = 0;
  // Add jobs that arrive at t=0
  while (arrivalIdx < sortedByArrival.length && sortedByArrival[arrivalIdx].arrival <= t) {
    queue.push(sortedByArrival[arrivalIdx]);
    arrivalIdx++;
  }
  while (queue.length > 0 || arrivalIdx < sortedByArrival.length) {
    if (queue.length === 0) {
      t = sortedByArrival[arrivalIdx].arrival;
      while (arrivalIdx < sortedByArrival.length && sortedByArrival[arrivalIdx].arrival <= t) {
        queue.push(sortedByArrival[arrivalIdx]);
        arrivalIdx++;
      }
      continue;
    }
    const j = queue.shift()!;
    const run = Math.min(quantum, rem[j.id]);
    slices.push({ jobId: j.id, start: t, end: t + run });
    rem[j.id] -= run;
    t += run;
    // Add new arrivals during this slice BEFORE re-queueing the running job
    while (arrivalIdx < sortedByArrival.length && sortedByArrival[arrivalIdx].arrival <= t) {
      queue.push(sortedByArrival[arrivalIdx]);
      arrivalIdx++;
    }
    if (rem[j.id] > 0) queue.push(j);
  }
  return slices;
}

function scheduleMLFQ(jobs: Job[], quantum: number): Slice[] {
  // Two priority queues. Quantum on Q0 = quantum; on Q1 = quantum*2.
  // A job that uses its full quantum drops to Q1.
  const rem: Record<string, number> = {};
  for (const j of jobs) rem[j.id] = j.burst;
  const q0: Job[] = [];
  const q1: Job[] = [];
  const sortedByArrival = [...jobs].sort((a, b) => a.arrival - b.arrival);
  let arrivalIdx = 0;
  let t = 0;
  while (arrivalIdx < sortedByArrival.length && sortedByArrival[arrivalIdx].arrival <= t) {
    q0.push(sortedByArrival[arrivalIdx]);
    arrivalIdx++;
  }
  const slices: Slice[] = [];
  while (q0.length > 0 || q1.length > 0 || arrivalIdx < sortedByArrival.length) {
    if (q0.length === 0 && q1.length === 0) {
      t = sortedByArrival[arrivalIdx].arrival;
      while (arrivalIdx < sortedByArrival.length && sortedByArrival[arrivalIdx].arrival <= t) {
        q0.push(sortedByArrival[arrivalIdx]);
        arrivalIdx++;
      }
      continue;
    }
    const fromQ0 = q0.length > 0;
    const j = fromQ0 ? q0.shift()! : q1.shift()!;
    const localQ = fromQ0 ? quantum : quantum * 2;
    const run = Math.min(localQ, rem[j.id]);
    slices.push({ jobId: j.id, start: t, end: t + run });
    rem[j.id] -= run;
    t += run;
    while (arrivalIdx < sortedByArrival.length && sortedByArrival[arrivalIdx].arrival <= t) {
      q0.push(sortedByArrival[arrivalIdx]);
      arrivalIdx++;
    }
    if (rem[j.id] > 0) {
      // Used full quantum → drop priority. Used less (I/O-like) → stay in Q0.
      if (run === localQ) q1.push(j);
      else q0.push(j);
    }
  }
  return slices;
}

function mergeAdjacentSlices(slices: Slice[]): Slice[] {
  if (slices.length === 0) return slices;
  const out: Slice[] = [slices[0]];
  for (let i = 1; i < slices.length; i++) {
    const last = out[out.length - 1];
    if (last.jobId === slices[i].jobId && last.end === slices[i].start) {
      last.end = slices[i].end;
    } else {
      out.push({ ...slices[i] });
    }
  }
  return out;
}

function computeMetrics(jobs: Job[], slices: Slice[]): JobResult[] {
  return jobs.map((j) => {
    const own = slices.filter((s) => s.jobId === j.id);
    const completion = own.length === 0 ? j.arrival : Math.max(...own.map((s) => s.end));
    const firstStart = own.length === 0 ? j.arrival : Math.min(...own.map((s) => s.start));
    const turnaround = completion - j.arrival;
    const waiting = turnaround - j.burst;
    const response = firstStart - j.arrival;
    return {
      id: j.id,
      arrival: j.arrival,
      burst: j.burst,
      completion,
      turnaround,
      waiting,
      response,
    };
  });
}

// ----------- COMPONENT ----------

const COLORS = [
  "fill-orange-500",
  "fill-emerald-500",
  "fill-sky-500",
  "fill-violet-500",
  "fill-rose-500",
  "fill-amber-500",
  "fill-teal-500",
  "fill-fuchsia-500",
];

function colorFor(jobId: string, jobs: Job[]): string {
  const idx = jobs.findIndex((j) => j.id === jobId);
  return COLORS[idx % COLORS.length];
}

export function SchedulingSimulator() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [jobs, setJobs] = useState<Job[]>(PRESETS[0].jobs);
  const [algo, setAlgo] = useState<Algo>(PRESETS[0].algo);
  const [quantum, setQuantum] = useState(PRESETS[0].quantum ?? 2);

  function applyPreset(i: number) {
    setPresetIdx(i);
    const p = PRESETS[i];
    setJobs(p.jobs.map((j) => ({ ...j })));
    setAlgo(p.algo);
    if (p.quantum) setQuantum(p.quantum);
  }

  function updateJob(idx: number, field: keyof Job, value: string) {
    setJobs((js) => {
      const copy = js.map((j) => ({ ...j }));
      if (field === "id") copy[idx].id = value;
      else copy[idx][field] = Math.max(0, parseInt(value || "0", 10));
      return copy;
    });
  }

  function addJob() {
    setJobs((js) => [
      ...js,
      { id: `J${js.length + 1}`, arrival: 0, burst: 3 },
    ]);
  }

  function removeJob(i: number) {
    setJobs((js) => js.filter((_, idx) => idx !== i));
  }

  const slices = useMemo(() => {
    if (jobs.length === 0) return [];
    let raw: Slice[];
    if (algo === "FIFO") raw = scheduleFIFO(jobs);
    else if (algo === "SJF") raw = scheduleSJF(jobs);
    else if (algo === "STCF") raw = scheduleSTCF(jobs);
    else if (algo === "RR") raw = scheduleRR(jobs, quantum);
    else raw = scheduleMLFQ(jobs, quantum);
    return mergeAdjacentSlices(raw);
  }, [jobs, algo, quantum]);

  const results = useMemo(() => computeMetrics(jobs, slices), [jobs, slices]);
  const avgTurn =
    results.length === 0
      ? 0
      : results.reduce((a, r) => a + r.turnaround, 0) / results.length;
  const avgWait =
    results.length === 0
      ? 0
      : results.reduce((a, r) => a + r.waiting, 0) / results.length;
  const avgResp =
    results.length === 0
      ? 0
      : results.reduce((a, r) => a + r.response, 0) / results.length;
  const totalTime = slices.length === 0 ? 0 : Math.max(...slices.map((s) => s.end));
  const throughput = totalTime === 0 ? 0 : jobs.length / totalTime;

  const tickWidth = 28;
  const rowHeight = 46;
  const labelWidth = 56;
  // Aksen må rekke forbi det seneste av «sist kjørte» og «sist etterspurte».
  // Uten det andre leddet forsvinner kravlinja ut av bildet mens man drar en
  // jobb mot høyre, og da er den ikke til å få tak i igjen.
  const senesteKrav = jobs.reduce((m, j) => Math.max(m, j.arrival + j.burst), 0);
  const aksLengde = Math.max(totalTime, senesteKrav);
  const svgWidth = labelWidth + aksLengde * tickWidth + 20;
  const svgHeight = rowHeight * jobs.length + 40;

  // Geometri innad i en rad: kravlinja øverst, faktisk kjøring under.
  const kravY = (row: number) => row * rowHeight + 4;
  const kravH = 11;
  const kjorY = (row: number) => row * rowHeight + 20;
  const kjorH = 20;

  /**
   * Dra-tilstand for kravlinjene.
   *
   * `mode` avgjør hva som endres: venstre kant flytter ankomsttiden og lar
   * kjøretiden stå, høyre kant endrer kjøretiden, og midten flytter hele jobben
   * i tid. `gripTid` er tidspunktet under fingeren da draget startet, slik at
   * baren ikke hopper når man tar tak et stykke inn i den.
   */
  const [drag, setDrag] = useState<{
    jobIdx: number;
    mode: "arrival" | "burst" | "move";
    gripTid: number;
    origArrival: number;
    origBurst: number;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  /** Klient-piksler → tid på aksen. Ikke avrundet; kallerne avrunder selv. */
  function tidFraPeker(clientX: number): number {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return (clientX - rect.left - labelWidth) / tickWidth;
  }

  function startDrag(
    e: React.PointerEvent,
    jobIdx: number,
    mode: "arrival" | "burst" | "move",
  ) {
    e.preventDefault();
    e.stopPropagation();
    // Pekerfangst gjør at draget overlever at musa forlater det lille
    // håndtaket. Den kan kaste (peker allerede sluppet, element byttet ut) —
    // og da skal draget likevel starte, ikke dø her.
    try {
      (e.target as Element).setPointerCapture?.(e.pointerId);
    } catch {
      // uten fangst virker draget fortsatt, så lenge musa er over SVG-en
    }
    setPresetIdx(-1); // fra nå er dette brukerens eget scenario, ikke forvalget
    setDrag({
      jobIdx,
      mode,
      gripTid: tidFraPeker(e.clientX),
      origArrival: jobs[jobIdx].arrival,
      origBurst: jobs[jobIdx].burst,
    });
  }

  function underDrag(e: React.PointerEvent) {
    if (!drag) return;
    // Heltallssteg: scheduling-modellen har ingen mening om halve tidsenheter,
    // og snappingen gjør at man kjenner rutenettet i fingrene.
    const delta = Math.round(tidFraPeker(e.clientX) - drag.gripTid);
    setJobs((js) =>
      js.map((j, i) => {
        if (i !== drag.jobIdx) return j;
        if (drag.mode === "burst") {
          // Høyre kant: kjøretid. Minst 1 — en jobb på 0 finnes ikke.
          return { ...j, burst: Math.max(1, drag.origBurst + delta) };
        }
        // Venstre kant og midten flytter begge ankomsttiden; forskjellen er
        // bare hvor man tar tak.
        return { ...j, arrival: Math.max(0, drag.origArrival + delta) };
      }),
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-muted/30 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          CPU-scheduling simulator
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(i)}
              className={`text-xs rounded-md border px-2 py-1 transition-colors ${
                presetIdx === i
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-background hover:border-brand/40 text-muted-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-0">
        <div className="border-b md:border-b-0 md:border-r border-border p-4 space-y-3">
          <div>
            <label
              htmlFor="algo-pick"
              className="text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              Algoritme
            </label>
            <select
              id="algo-pick"
              value={algo}
              onChange={(e) => setAlgo(e.target.value as Algo)}
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
            >
              <option value="FIFO">FIFO / FCFS (First Come First Served)</option>
              <option value="SJF">SJF (Shortest Job First, ikke-preemptiv)</option>
              <option value="STCF">STCF (Shortest Time-to-Completion First)</option>
              <option value="RR">Round-Robin</option>
              <option value="MLFQ">MLFQ (to-køers feedback)</option>
            </select>
          </div>

          {(algo === "RR" || algo === "MLFQ") && (
            <div>
              <label
                htmlFor="q"
                className="text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                Tidskvantum
              </label>
              <input
                id="q"
                type="number"
                min={1}
                value={quantum}
                onChange={(e) => setQuantum(Math.max(1, parseInt(e.target.value || "1", 10)))}
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-sm font-mono"
              />
            </div>
          )}

          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Jobber
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left font-normal pb-1">ID</th>
                  <th className="text-left font-normal pb-1">ankomst</th>
                  <th className="text-left font-normal pb-1">burst</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j, i) => (
                  <tr key={i}>
                    <td className="pr-1 pb-1">
                      <input
                        value={j.id}
                        onChange={(e) => updateJob(i, "id", e.target.value)}
                        className="w-12 rounded border border-border bg-background px-1 font-mono"
                      />
                    </td>
                    <td className="pr-1 pb-1">
                      <input
                        type="number"
                        min={0}
                        value={j.arrival}
                        onChange={(e) => updateJob(i, "arrival", e.target.value)}
                        className="w-12 rounded border border-border bg-background px-1 font-mono"
                      />
                    </td>
                    <td className="pr-1 pb-1">
                      <input
                        type="number"
                        min={1}
                        value={j.burst}
                        onChange={(e) => updateJob(i, "burst", e.target.value)}
                        className="w-12 rounded border border-border bg-background px-1 font-mono"
                      />
                    </td>
                    <td className="pb-1">
                      <button
                        type="button"
                        onClick={() => removeJob(i)}
                        className="text-rose-500 hover:text-rose-400 px-1"
                        aria-label={`Fjern jobb ${j.id}`}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={addJob}
              className="mt-1 w-full rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground hover:border-brand/40 hover:text-foreground"
            >
              + legg til jobb
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Gantt-chart
          </div>
          <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-5 rounded-sm bg-current opacity-25" />
              krav: ankomst → kjøretid <span className="text-foreground">(dra meg)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-5 rounded-sm bg-current opacity-80" />
              faktisk kjøring
            </span>
            <span>
              Dra midten for å endre <em>når</em> jobben kommer, kantene for å endre{" "}
              <em>hvor lenge</em> den trenger CPU-en.
            </span>
          </div>
          <div className="overflow-x-auto rounded-md border border-border bg-background">
            <svg
              ref={svgRef}
              width={svgWidth}
              height={svgHeight}
              role="img"
              aria-label="Gantt-chart for valgt algoritme"
              onPointerMove={underDrag}
              onPointerUp={() => setDrag(null)}
              onPointerCancel={() => setDrag(null)}
              className={drag ? "cursor-grabbing select-none" : undefined}
            >
              {/* Time axis */}
              <g>
                {Array.from({ length: aksLengde + 1 }).map((_, t) => (
                  <g key={t}>
                    <line
                      x1={labelWidth + t * tickWidth}
                      y1={svgHeight - 24}
                      x2={labelWidth + t * tickWidth}
                      y2={svgHeight - 18}
                      className="stroke-border"
                    />
                    <text
                      x={labelWidth + t * tickWidth}
                      y={svgHeight - 6}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[10px]"
                    >
                      {t}
                    </text>
                  </g>
                ))}
              </g>

              {jobs.map((j, rowIdx) => {
                const kx = labelWidth + j.arrival * tickWidth;
                const kw = j.burst * tickWidth;
                const drasNa = drag?.jobIdx === rowIdx;
                return (
                  <g key={j.id}>
                    <text
                      x={labelWidth - 8}
                      y={kjorY(rowIdx) + kjorH / 2 + 4}
                      textAnchor="end"
                      className="fill-foreground text-[11px] font-mono"
                    >
                      {j.id}
                    </text>
                    <line
                      x1={labelWidth}
                      y1={kjorY(rowIdx) + kjorH / 2}
                      x2={labelWidth + aksLengde * tickWidth}
                      y2={kjorY(rowIdx) + kjorH / 2}
                      className="stroke-border"
                      strokeDasharray="2 2"
                    />

                    {/* Kravlinja: når jobben ankommer, og hvor mye CPU den ber
                        om. Dette er inndata — den ligger her nettopp for å
                        kunne sammenlignes med raden under, som er hva
                        algoritmen faktisk gjorde. */}
                    <rect
                      x={kx}
                      y={kravY(rowIdx)}
                      width={kw}
                      height={kravH}
                      rx={3}
                      onPointerDown={(e) => startDrag(e, rowIdx, "move")}
                      className={`${colorFor(j.id, jobs)} ${
                        drasNa ? "opacity-50" : "opacity-25 hover:opacity-40"
                      } cursor-grab`}
                    />
                    {/* Håndtak: venstre kant = ankomst, høyre kant = kjøretid.
                        Egne, brede treffflater — 6 px rundt kanten er for lite
                        å sikte på med mus. */}
                    <rect
                      x={kx - 5}
                      y={kravY(rowIdx) - 2}
                      width={10}
                      height={kravH + 4}
                      onPointerDown={(e) => startDrag(e, rowIdx, "arrival")}
                      className="fill-transparent cursor-ew-resize"
                    />
                    <rect
                      x={kx + kw - 5}
                      y={kravY(rowIdx) - 2}
                      width={10}
                      height={kravH + 4}
                      onPointerDown={(e) => startDrag(e, rowIdx, "burst")}
                      className="fill-transparent cursor-ew-resize"
                    />
                    {/* Synlige kantstreker, så det er tydelig hvor man tar tak. */}
                    {[kx, kx + kw].map((hx, i) => (
                      <line
                        key={i}
                        x1={hx}
                        y1={kravY(rowIdx) - 1}
                        x2={hx}
                        y2={kravY(rowIdx) + kravH + 1}
                        strokeWidth={2}
                        className={`${
                          drasNa ? "stroke-foreground" : "stroke-muted-foreground/60"
                        } pointer-events-none`}
                      />
                    ))}
                    {drasNa && (
                      <text
                        x={kx + kw / 2}
                        y={kravY(rowIdx) - 3}
                        textAnchor="middle"
                        className="fill-foreground text-[9px] font-mono pointer-events-none"
                      >
                        ank {j.arrival} · kjør {j.burst}
                      </text>
                    )}
                  </g>
                );
              })}

              {slices.map((s, i) => {
                const rowIdx = jobs.findIndex((j) => j.id === s.jobId);
                if (rowIdx < 0) return null;
                const x = labelWidth + s.start * tickWidth;
                const y = kjorY(rowIdx);
                const w = (s.end - s.start) * tickWidth;
                const h = kjorH;
                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      rx={4}
                      className={`${colorFor(s.jobId, jobs)} opacity-80`}
                    />
                    <text
                      x={x + w / 2}
                      y={y + h / 2 + 4}
                      textAnchor="middle"
                      className="fill-white text-[10px] font-mono pointer-events-none"
                    >
                      {s.jobId}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <Stat label="snitt-turnaround" value={avgTurn.toFixed(2)} />
            <Stat label="snitt-venting" value={avgWait.toFixed(2)} />
            <Stat label="snitt-respons" value={avgResp.toFixed(2)} />
            <Stat label="throughput" value={`${throughput.toFixed(3)} j/tid`} />
          </div>

          <div className="mt-3 overflow-x-auto rounded-md border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left font-semibold px-2 py-1">jobb</th>
                  <th className="text-left font-semibold px-2 py-1">ankomst</th>
                  <th className="text-left font-semibold px-2 py-1">burst</th>
                  <th className="text-left font-semibold px-2 py-1">ferdig</th>
                  <th className="text-left font-semibold px-2 py-1">turnaround</th>
                  <th className="text-left font-semibold px-2 py-1">venting</th>
                  <th className="text-left font-semibold px-2 py-1">respons</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-2 py-1 font-mono">{r.id}</td>
                    <td className="px-2 py-1 font-mono">{r.arrival}</td>
                    <td className="px-2 py-1 font-mono">{r.burst}</td>
                    <td className="px-2 py-1 font-mono">{r.completion}</td>
                    <td className="px-2 py-1 font-mono">{r.turnaround}</td>
                    <td className="px-2 py-1 font-mono">{r.waiting}</td>
                    <td className="px-2 py-1 font-mono">{r.response}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Formler:</strong>{" "}
            <Tex>{`\\text{turnaround} = T_{ferdig} - T_{ankomst}`}</Tex>
            ,{" "}
            <Tex>{`\\text{venting} = \\text{turnaround} - T_{burst}`}</Tex>
            ,{" "}
            <Tex>{`\\text{respons} = T_{f\\o rste\\;start} - T_{ankomst}`}</Tex>
            ,{" "}
            <Tex>{`\\text{throughput} = N / T_{total}`}</Tex>
            .
          </p>

          <div className="mt-3 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-foreground">
            {PRESETS[presetIdx] ? (
              <>
                <span className="font-semibold">Preset-notat:</span> {PRESETS[presetIdx].note}
              </>
            ) : (
              <>
                <span className="font-semibold">Ditt eget scenario.</span> Du har flyttet på
                jobbene, så notatet til forvalget gjelder ikke lenger. Velg et forvalg over for å
                gå tilbake til et kjent utgangspunkt.
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-sm text-foreground">{value}</div>
    </div>
  );
}
