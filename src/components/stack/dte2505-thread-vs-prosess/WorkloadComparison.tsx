import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";

// ---------------------------------------------------------------------------
// WorkloadComparison — kjør 4 jobber side-ved-side som:
//   (A) 4 separate prosesser (4× fork+exec)
//   (B) 4 tråder i samme prosess
//
// Viser to søyler: total wall-time og RAM-fotavtrykk.
// Tallene er didaktiske men i riktig størrelsesorden:
//   fork: ~1 ms per kall + 8 KB minimum overhead per prosess
//   pthread_create: ~10–50 µs per kall + ~1 MB stack reservert (committed lazy)
// I praksis blir prosess-svaret dominert av COW av page-tabeller for store binærer.
// ---------------------------------------------------------------------------

type Result = {
  /** Per-jobb start- og slutt-tid (ms). */
  jobs: { startMs: number; endMs: number }[];
  /** Total wall-time (ms). */
  totalMs: number;
  /** Estimert ekstra RAM (KB). */
  ramKb: number;
};

// Konstanter — pedagogisk valgte tall i riktig orden
const JOB_DURATION_MS = 600; // hver jobb tar 600 ms beregning
const FORK_OVERHEAD_MS_PER_PROC = 35; // sett pent for animasjon
const THREAD_OVERHEAD_MS_PER_TID = 4;
const FORK_RAM_KB_PER_PROC = 1800; // COW + ny task_struct + page-tabell-kopier
const THREAD_RAM_KB_PER_TID = 96; // bare stack (committed) + task_struct

const N_JOBS = 4;

export function WorkloadComparison() {
  const [running, setRunning] = useState<"none" | "processes" | "threads">("none");
  const [procResult, setProcResult] = useState<Result | null>(null);
  const [threadResult, setThreadResult] = useState<Result | null>(null);
  const [tick, setTick] = useState(0);
  const startedAt = useRef<number>(0);

  // Animasjons-tick for progresjon
  useEffect(() => {
    if (running === "none") return;
    let raf: number;
    const loop = () => {
      setTick((t) => t + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  function runProcesses() {
    setRunning("processes");
    const target = computeProcessResult();
    setProcResult(target);
    startedAt.current = performance.now();
    setTimeout(() => setRunning("none"), target.totalMs * 1.6); // animation pacing
  }

  function runThreads() {
    setRunning("threads");
    const target = computeThreadResult();
    setThreadResult(target);
    startedAt.current = performance.now();
    setTimeout(() => setRunning("none"), target.totalMs * 1.6);
  }

  function reset() {
    setRunning("none");
    setProcResult(null);
    setThreadResult(null);
    setTick(0);
  }

  const now = performance.now();
  const animElapsed = running !== "none" ? Math.min((now - startedAt.current) / 1.6, JOB_DURATION_MS + 200) : 0;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" role="region" aria-label="Sammenlign 4 prosesser vs 4 tråder">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Side-ved-side</div>
        <div className="text-sm font-semibold">
          4 jobber — som 4 prosesser vs 4 tråder
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <Panel
            title="A. 4 prosesser (fork+exec ×4)"
            sub="Hver jobb i sitt eget adresserom"
            colorClass="text-amber-700 dark:text-amber-400"
            onRun={runProcesses}
            running={running === "processes"}
            result={procResult}
            animElapsed={running === "processes" ? animElapsed : null}
            kind="processes"
          />
          <Panel
            title="B. 4 tråder (pthread_create ×4)"
            sub="Alle i samme adresserom"
            colorClass="text-emerald-700 dark:text-emerald-400"
            onRun={runThreads}
            running={running === "threads"}
            result={threadResult}
            animElapsed={running === "threads" ? animElapsed : null}
            kind="threads"
          />
        </div>

        {(procResult || threadResult) && (
          <ComparisonBars proc={procResult} thread={threadResult} />
        )}

        <div className="flex items-center justify-between gap-2 text-xs">
          <p className="text-muted-foreground">
            Tallene er didaktisk avrundede, men i riktig størrelsesorden. På Linux/x86_64
            er fork ~1 ms + flere MB COW-state, mens pthread_create er ~10–50 µs + 1 stack-frame.
          </p>
          <button
            type="button"
            onClick={reset}
            className="text-xs px-2 py-1 rounded-md border border-border hover:bg-muted inline-flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Nullstill
          </button>
        </div>
      </div>

      {/* Konsumer tick for å unngå unused warning */}
      <span className="sr-only">{tick}</span>
    </div>
  );
}

function Panel({
  title,
  sub,
  colorClass,
  onRun,
  running,
  result,
  animElapsed,
  kind,
}: {
  title: string;
  sub: string;
  colorClass: string;
  onRun: () => void;
  running: boolean;
  result: Result | null;
  animElapsed: number | null;
  kind: "processes" | "threads";
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <div className={`text-sm font-semibold ${colorClass}`}>{title}</div>
          <div className="text-[11px] text-muted-foreground">{sub}</div>
        </div>
        <button
          type="button"
          onClick={onRun}
          disabled={running}
          className="px-2.5 py-1 rounded-md text-xs font-medium bg-brand text-brand-foreground hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1"
        >
          <Play className="h-3 w-3" /> {running ? "kjører..." : "Start"}
        </button>
      </div>

      <JobTimeline
        result={result}
        animElapsed={animElapsed}
        kind={kind}
      />

      {result && !running && (
        <div className="mt-2 text-[11px] text-muted-foreground">
          Total: <strong>{result.totalMs.toFixed(0)} ms</strong> · RAM-overhead:{" "}
          <strong>{result.ramKb.toLocaleString("no-NO")} KB</strong>
        </div>
      )}
    </div>
  );
}

function JobTimeline({
  result,
  animElapsed,
  kind,
}: {
  result: Result | null;
  animElapsed: number | null;
  kind: "processes" | "threads";
}) {
  const W = 260;
  const H = 92;
  const padX = 8;
  const rowH = 16;
  const gap = 4;

  // Skala — vis alltid samme tids-skala for å gjøre sammenligningen rettferdig
  const SCALE_MS = Math.max(
    JOB_DURATION_MS + FORK_OVERHEAD_MS_PER_PROC * N_JOBS,
    JOB_DURATION_MS + THREAD_OVERHEAD_MS_PER_TID * N_JOBS
  ) + 30;

  if (!result) {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <text x={W / 2} y={H / 2} textAnchor="middle" fontSize={11} fill="#94a3b8">
          klikk «Start» for å kjøre
        </text>
      </svg>
    );
  }

  const innerW = W - padX * 2;
  const msToX = (ms: number) => padX + (ms / SCALE_MS) * innerW;
  const baseColor = kind === "processes" ? "#f59e0b" : "#10b981";
  const lightColor = kind === "processes" ? "#fde68a" : "#bbf7d0";

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {result.jobs.map((job, i) => {
        const y = 6 + i * (rowH + gap);
        const x1 = msToX(job.startMs);
        const x2 = msToX(job.endMs);
        const animX = animElapsed !== null ? msToX(Math.min(job.startMs + animElapsed - (animElapsed > job.startMs ? 0 : 0), job.endMs)) : x2;
        const done = animElapsed === null || animElapsed >= job.endMs;
        const started = animElapsed === null || animElapsed >= job.startMs;
        const currentX = started ? Math.min(animX, x2) : x1;
        return (
          <g key={i}>
            {/* Track */}
            <rect x={padX} y={y} width={innerW} height={rowH - 2} rx={3} fill="#f1f5f9" />
            {/* Setup overhead */}
            <rect x={x1} y={y} width={Math.max(1, msToX(0) > x1 ? 1 : 1)} height={rowH - 2} fill="transparent" />
            {/* Bar */}
            {started && (
              <rect
                x={x1}
                y={y}
                width={Math.max(1, currentX - x1)}
                height={rowH - 2}
                rx={3}
                fill={done ? baseColor : lightColor}
                stroke={baseColor}
                strokeWidth={0.5}
              />
            )}
            <text x={padX + 4} y={y + 11} fontSize={9} fontWeight={600} fill="#0f172a">
              {kind === "processes" ? `P${i + 1}` : `T${i + 1}`}
            </text>
          </g>
        );
      })}
      {/* Time axis */}
      <line x1={padX} y1={H - 12} x2={W - padX} y2={H - 12} stroke="#cbd5e1" strokeWidth={1} />
      <text x={padX} y={H - 2} fontSize={8} fill="#64748b">0</text>
      <text x={W - padX} y={H - 2} fontSize={8} textAnchor="end" fill="#64748b">
        {SCALE_MS.toFixed(0)} ms
      </text>
    </svg>
  );
}

function ComparisonBars({ proc, thread }: { proc: Result | null; thread: Result | null }) {
  if (!proc && !thread) return null;
  const maxMs = Math.max(proc?.totalMs ?? 0, thread?.totalMs ?? 0, 1);
  const maxRam = Math.max(proc?.ramKb ?? 0, thread?.ramKb ?? 0, 1);

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-xs font-semibold mb-3">Sammenligning</div>
      <div className="grid sm:grid-cols-2 gap-4">
        <BarPair label="Total wall-time (ms)" max={maxMs} proc={proc?.totalMs ?? null} thread={thread?.totalMs ?? null} unit="ms" />
        <BarPair label="RAM-overhead (KB)" max={maxRam} proc={proc?.ramKb ?? null} thread={thread?.ramKb ?? null} unit="KB" />
      </div>
    </div>
  );
}

function BarPair({ label, max, proc, thread, unit }: { label: string; max: number; proc: number | null; thread: number | null; unit: string }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground mb-1.5">{label}</div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] w-16 text-amber-700 dark:text-amber-400 font-semibold">Prosesser</span>
          <div className="flex-1 h-4 bg-muted/30 rounded overflow-hidden">
            <div
              className="h-full bg-amber-500"
              style={{ width: proc !== null ? `${(proc / max) * 100}%` : "0%", transition: "width 0.6s ease" }}
            />
          </div>
          <span className="text-[10px] w-14 text-right tabular-nums">{proc !== null ? `${proc.toFixed(0)} ${unit}` : "—"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] w-16 text-emerald-700 dark:text-emerald-400 font-semibold">Tråder</span>
          <div className="flex-1 h-4 bg-muted/30 rounded overflow-hidden">
            <div
              className="h-full bg-emerald-500"
              style={{ width: thread !== null ? `${(thread / max) * 100}%` : "0%", transition: "width 0.6s ease" }}
            />
          </div>
          <span className="text-[10px] w-14 text-right tabular-nums">{thread !== null ? `${thread.toFixed(0)} ${unit}` : "—"}</span>
        </div>
      </div>
    </div>
  );
}

function computeProcessResult(): Result {
  const jobs: { startMs: number; endMs: number }[] = [];
  let setupCursor = 0;
  for (let i = 0; i < N_JOBS; i++) {
    setupCursor += FORK_OVERHEAD_MS_PER_PROC; // forks kjøres sekvensielt av parent
    const start = setupCursor;
    jobs.push({ startMs: start, endMs: start + JOB_DURATION_MS });
  }
  const totalMs = Math.max(...jobs.map((j) => j.endMs));
  return {
    jobs,
    totalMs,
    ramKb: FORK_RAM_KB_PER_PROC * N_JOBS,
  };
}

function computeThreadResult(): Result {
  const jobs: { startMs: number; endMs: number }[] = [];
  let setupCursor = 0;
  for (let i = 0; i < N_JOBS; i++) {
    setupCursor += THREAD_OVERHEAD_MS_PER_TID;
    const start = setupCursor;
    jobs.push({ startMs: start, endMs: start + JOB_DURATION_MS });
  }
  const totalMs = Math.max(...jobs.map((j) => j.endMs));
  return {
    jobs,
    totalMs,
    ramKb: THREAD_RAM_KB_PER_TID * N_JOBS,
  };
}
