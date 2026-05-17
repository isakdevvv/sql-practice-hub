import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, StepForward, RotateCcw, Zap, Lock, Users, Boxes } from "lucide-react";

// ---------------------------------------------------------------------------
// KonkurrensVisualizer — fire moduser som lærer concurrency-mekanikken.
//   1. race         → To tråder (T1, T2) gjør counter = counter + 1 hver, fem ganger.
//                     Step-knapp velger neste tråd. Tap av oppdateringer markeres rødt.
//   2. mutex        → Samme oppsett, men nå med lock()/unlock(). Den andre tråden
//                     blokkeres til låsen slippes. Counter ender alltid på 10.
//   3. deadlock     → 4 filosofer i sirkel + 4 gafler. Naiv strategi → deadlock.
//                     Asymmetri-strategi → ingen deadlock.
//   4. prod-cons    → Bounded buffer (5 slots), én producer + én consumer med justerbar
//                     hastighet. Full-/empty-semaforer blokkerer ved behov.
// ---------------------------------------------------------------------------

type Mode = "race" | "mutex" | "deadlock" | "producer-consumer";

const MODES: { id: Mode; label: string; sub: string; Icon: typeof Zap }[] = [
  { id: "race", label: "Race condition", sub: "to trader om en teller", Icon: Zap },
  { id: "mutex", label: "Mutex", sub: "lock og unlock", Icon: Lock },
  { id: "deadlock", label: "Dining philosophers", sub: "deadlock og fiks", Icon: Users },
  { id: "producer-consumer", label: "Producer-consumer", sub: "bounded buffer", Icon: Boxes },
];

export function KonkurrensVisualizer({ defaultMode = "race" as Mode }: { defaultMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(defaultMode);

  return (
    <div
      className="rounded-2xl border border-border bg-card overflow-hidden"
      role="region"
      aria-label="Interaktiv visualisering: concurrency"
    >
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Concurrency — race, mutex, deadlock og bounded buffer
            </div>
          </div>
          <div className="text-xs text-muted-foreground italic">
            Tradene kjorer parallelt — du velger interleaving og ser konsekvensen.
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MODES.map((m) => {
            const Icon = m.Icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors inline-flex items-center gap-1.5 ${
                  active
                    ? "bg-brand text-brand-foreground border-brand"
                    : "border-border hover:bg-muted"
                }`}
                title={m.sub}
              >
                <Icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 sm:p-5 bg-background">
        {mode === "race" && <RaceView />}
        {mode === "mutex" && <MutexView />}
        {mode === "deadlock" && <DeadlockView />}
        {mode === "producer-consumer" && <ProducerConsumerView />}
      </div>
    </div>
  );
}

// ===========================================================================
//                       MODE 1: RACE CONDITION
// ===========================================================================

type ThreadId = "T1" | "T2";
type Phase = "load" | "add" | "store";

type RaceOp = {
  thread: ThreadId;
  phase: Phase;
  iter: number; // 1..N
};

const RACE_ITERS = 5;

function buildThreadOps(thread: ThreadId): RaceOp[] {
  const ops: RaceOp[] = [];
  for (let i = 1; i <= RACE_ITERS; i++) {
    ops.push({ thread, phase: "load", iter: i });
    ops.push({ thread, phase: "add", iter: i });
    ops.push({ thread, phase: "store", iter: i });
  }
  return ops;
}

type RaceState = {
  counter: number;
  reg: Record<ThreadId, number | null>;
  log: { op: RaceOp; counter: number; lost: boolean; note: string }[];
  cursors: Record<ThreadId, number>; // index into each thread's op list
};

function emptyRace(): RaceState {
  return {
    counter: 0,
    reg: { T1: null, T2: null },
    log: [],
    cursors: { T1: 0, T2: 0 },
  };
}

function applyRaceOp(state: RaceState, op: RaceOp, otherJustWrote: boolean): RaceState {
  const next: RaceState = {
    counter: state.counter,
    reg: { ...state.reg },
    log: state.log.slice(),
    cursors: { ...state.cursors },
  };
  next.cursors[op.thread] = state.cursors[op.thread] + 1;
  let note = "";
  let lost = false;
  if (op.phase === "load") {
    next.reg[op.thread] = next.counter;
    note = `${op.thread} leser counter = ${next.counter} inn i sitt register`;
  } else if (op.phase === "add") {
    const cur = next.reg[op.thread] ?? 0;
    next.reg[op.thread] = cur + 1;
    note = `${op.thread} legger til 1 i registeret: ${cur} + 1 = ${cur + 1}`;
  } else {
    const val = next.reg[op.thread] ?? 0;
    // Lost update: if the other thread wrote a higher value since we loaded,
    // we'll overwrite it with our stale value. Detect by: val <= counter
    // (i.e. our stored value isn't bigger than what's already there).
    if (val <= next.counter && next.counter > 0) {
      lost = true;
      note = `${op.thread} skriver ${val} til counter — men counter var allerede ${next.counter}. Tapt oppdatering!`;
    } else {
      note = `${op.thread} skriver ${val} til counter`;
    }
    next.counter = val;
    next.reg[op.thread] = null;
  }
  next.log.push({ op, counter: next.counter, lost, note });
  // Use otherJustWrote to suppress unused-param lint if needed.
  void otherJustWrote;
  return next;
}

function RaceView() {
  const t1Ops = useMemo(() => buildThreadOps("T1"), []);
  const t2Ops = useMemo(() => buildThreadOps("T2"), []);

  const [state, setState] = useState<RaceState>(emptyRace());

  function step(thread: ThreadId) {
    setState((s) => {
      const list = thread === "T1" ? t1Ops : t2Ops;
      const i = s.cursors[thread];
      if (i >= list.length) return s;
      return applyRaceOp(s, list[i], false);
    });
  }

  function reset() {
    setState(emptyRace());
  }

  function runRandom() {
    setState(emptyRace());
    let cur = emptyRace();
    // Random interleaving, but stop after consuming all 30 ops.
    while (cur.cursors.T1 < t1Ops.length || cur.cursors.T2 < t2Ops.length) {
      const choices: ThreadId[] = [];
      if (cur.cursors.T1 < t1Ops.length) choices.push("T1");
      if (cur.cursors.T2 < t2Ops.length) choices.push("T2");
      const pick = choices[Math.floor(Math.random() * choices.length)];
      const ops = pick === "T1" ? t1Ops : t2Ops;
      cur = applyRaceOp(cur, ops[cur.cursors[pick]], false);
    }
    setState(cur);
  }

  function runSerial() {
    setState(emptyRace());
    let cur = emptyRace();
    for (const op of t1Ops) cur = applyRaceOp(cur, op, false);
    for (const op of t2Ops) cur = applyRaceOp(cur, op, false);
    setState(cur);
  }

  const expected = RACE_ITERS * 2;
  const finished = state.cursors.T1 >= t1Ops.length && state.cursors.T2 >= t2Ops.length;
  const lostCount = state.log.filter((l) => l.lost).length;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <ThreadColumn
            id="T1"
            ops={t1Ops}
            cursor={state.cursors.T1}
            log={state.log}
            color="#2563eb"
          />
          <ThreadColumn
            id="T2"
            ops={t2Ops}
            cursor={state.cursors.T2}
            log={state.log}
            color="#db2777"
          />
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs">
              <span className="text-muted-foreground">Delt minne </span>
              <span className="font-mono">counter = </span>
              <span
                className={`font-mono font-bold text-lg ${
                  finished
                    ? state.counter === expected
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                    : "text-foreground"
                }`}
              >
                {state.counter}
              </span>
              <span className="text-muted-foreground"> / forventet {expected}</span>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => step("T1")}
                disabled={state.cursors.T1 >= t1Ops.length}
                className="text-xs px-2.5 py-1 rounded border border-border bg-background hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1"
                style={{ color: "#2563eb" }}
              >
                <StepForward className="h-3 w-3" /> T1
              </button>
              <button
                type="button"
                onClick={() => step("T2")}
                disabled={state.cursors.T2 >= t2Ops.length}
                className="text-xs px-2.5 py-1 rounded border border-border bg-background hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1"
                style={{ color: "#db2777" }}
              >
                <StepForward className="h-3 w-3" /> T2
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={runRandom}
            className="text-xs px-2.5 py-1 rounded border border-border bg-background hover:bg-muted inline-flex items-center gap-1"
          >
            <Play className="h-3 w-3" /> Tilfeldig kjoring
          </button>
          <button
            type="button"
            onClick={runSerial}
            className="text-xs px-2.5 py-1 rounded border border-border bg-background hover:bg-muted inline-flex items-center gap-1"
          >
            T1 forst, sa T2
          </button>
          <button
            type="button"
            onClick={reset}
            className="text-xs px-2.5 py-1 rounded border border-border bg-background hover:bg-muted inline-flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-card p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Register
          </div>
          <div className="font-mono space-y-0.5">
            <div>
              <span style={{ color: "#2563eb" }}>T1.reg</span> ={" "}
              <span>{state.reg.T1 === null ? "—" : state.reg.T1}</span>
            </div>
            <div>
              <span style={{ color: "#db2777" }}>T2.reg</span> ={" "}
              <span>{state.reg.T2 === null ? "—" : state.reg.T2}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Logg ({state.log.length})
          </div>
          <div className="max-h-40 overflow-auto space-y-1 pr-1">
            {state.log.length === 0 ? (
              <div className="text-muted-foreground italic">
                Klikk T1 eller T2 for a kjore neste operasjon i den traden.
              </div>
            ) : (
              state.log
                .slice()
                .reverse()
                .map((entry, idx) => (
                  <div
                    key={state.log.length - idx}
                    className={`px-1.5 py-1 rounded font-mono text-[10px] leading-tight ${
                      entry.lost
                        ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                        : "bg-muted/40 text-foreground"
                    }`}
                  >
                    {entry.note}
                  </div>
                ))
            )}
          </div>
        </div>

        {finished && (
          <div
            className={`rounded-lg border p-3 text-xs ${
              state.counter === expected
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
            }`}
          >
            {state.counter === expected ? (
              <span>Counter = {state.counter}. Heldig denne gangen — ingen tap.</span>
            ) : (
              <span>
                Counter = {state.counter}, men skulle vaert {expected}. {lostCount} tapt
                oppdatering. Race condition.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ThreadColumn({
  id,
  ops,
  cursor,
  log,
  color,
}: {
  id: ThreadId;
  ops: RaceOp[];
  cursor: number;
  log: { op: RaceOp; counter: number; lost: boolean }[];
  color: string;
}) {
  const lostByOp = useMemo(() => {
    const s = new Set<string>();
    log.forEach((l) => {
      if (l.lost && l.op.thread === id) s.add(`${l.op.thread}-${l.op.iter}-${l.op.phase}`);
    });
    return s;
  }, [log, id]);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div
        className="px-2.5 py-1.5 text-xs font-semibold border-b border-border"
        style={{ color, background: `${color}10` }}
      >
        {id}
      </div>
      <ol className="p-2 space-y-1 text-[10px] font-mono">
        {ops.map((op, i) => {
          const done = i < cursor;
          const next = i === cursor;
          const key = `${op.thread}-${op.iter}-${op.phase}`;
          const lost = lostByOp.has(key);
          const text =
            op.phase === "load"
              ? `${i + 1}. reg = counter`
              : op.phase === "add"
                ? `${i + 1}. reg = reg + 1`
                : `${i + 1}. counter = reg`;
          return (
            <li
              key={i}
              className={`px-1.5 py-0.5 rounded border ${
                lost
                  ? "border-rose-500/60 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                  : done
                    ? "border-transparent bg-muted/40 text-muted-foreground line-through decoration-1"
                    : next
                      ? "border-brand bg-brand/10 text-foreground"
                      : "border-transparent text-muted-foreground"
              }`}
              title={`iter ${op.iter}: ${op.phase}`}
            >
              {text}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ===========================================================================
//                       MODE 2: MUTEX
// ===========================================================================

type MutexOp = {
  thread: ThreadId;
  phase: "lock" | "load" | "add" | "store" | "unlock";
  iter: number;
};

function buildMutexOps(thread: ThreadId): MutexOp[] {
  const ops: MutexOp[] = [];
  for (let i = 1; i <= RACE_ITERS; i++) {
    ops.push({ thread, phase: "lock", iter: i });
    ops.push({ thread, phase: "load", iter: i });
    ops.push({ thread, phase: "add", iter: i });
    ops.push({ thread, phase: "store", iter: i });
    ops.push({ thread, phase: "unlock", iter: i });
  }
  return ops;
}

type MutexState = {
  counter: number;
  reg: Record<ThreadId, number | null>;
  owner: ThreadId | null;
  cursors: Record<ThreadId, number>;
  log: { op: MutexOp; blocked: boolean; counter: number; note: string }[];
};

function emptyMutex(): MutexState {
  return {
    counter: 0,
    reg: { T1: null, T2: null },
    owner: null,
    cursors: { T1: 0, T2: 0 },
    log: [],
  };
}

function tryMutexStep(state: MutexState, thread: ThreadId, ops: MutexOp[]): MutexState {
  const i = state.cursors[thread];
  if (i >= ops.length) return state;
  const op = ops[i];
  const next: MutexState = {
    counter: state.counter,
    reg: { ...state.reg },
    owner: state.owner,
    cursors: { ...state.cursors },
    log: state.log.slice(),
  };
  if (op.phase === "lock") {
    if (state.owner && state.owner !== thread) {
      next.log.push({
        op,
        blocked: true,
        counter: state.counter,
        note: `${thread} prover lock, men ${state.owner} eier — blokkert (spinning)`,
      });
      return next;
    }
    next.owner = thread;
    next.cursors[thread] = i + 1;
    next.log.push({
      op,
      blocked: false,
      counter: next.counter,
      note: `${thread} tar lasen`,
    });
    return next;
  }
  // Non-lock ops require we hold the lock.
  if (state.owner !== thread) {
    next.log.push({
      op,
      blocked: true,
      counter: state.counter,
      note: `${thread} kan ikke kjore ${op.phase} — har ikke lasen`,
    });
    return next;
  }
  next.cursors[thread] = i + 1;
  if (op.phase === "load") {
    next.reg[thread] = next.counter;
    next.log.push({
      op,
      blocked: false,
      counter: next.counter,
      note: `${thread} leser counter = ${next.counter}`,
    });
  } else if (op.phase === "add") {
    const cur = next.reg[thread] ?? 0;
    next.reg[thread] = cur + 1;
    next.log.push({
      op,
      blocked: false,
      counter: next.counter,
      note: `${thread} legger til 1: ${cur} + 1 = ${cur + 1}`,
    });
  } else if (op.phase === "store") {
    const val = next.reg[thread] ?? 0;
    next.counter = val;
    next.reg[thread] = null;
    next.log.push({
      op,
      blocked: false,
      counter: next.counter,
      note: `${thread} skriver counter = ${val}`,
    });
  } else if (op.phase === "unlock") {
    next.owner = null;
    next.log.push({
      op,
      blocked: false,
      counter: next.counter,
      note: `${thread} slipper lasen`,
    });
  }
  return next;
}

function MutexView() {
  const t1Ops = useMemo(() => buildMutexOps("T1"), []);
  const t2Ops = useMemo(() => buildMutexOps("T2"), []);
  const [state, setState] = useState<MutexState>(emptyMutex());
  const [autoplay, setAutoplay] = useState(false);
  const timer = useRef<number | null>(null);

  function step(thread: ThreadId) {
    setState((s) => tryMutexStep(s, thread, thread === "T1" ? t1Ops : t2Ops));
  }

  function reset() {
    setAutoplay(false);
    setState(emptyMutex());
  }

  // Autoplay tries to advance — alternates threads when possible.
  useEffect(() => {
    if (!autoplay) {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      return;
    }
    timer.current = window.setTimeout(() => {
      setState((s) => {
        const t1Done = s.cursors.T1 >= t1Ops.length;
        const t2Done = s.cursors.T2 >= t2Ops.length;
        if (t1Done && t2Done) {
          setAutoplay(false);
          return s;
        }
        // Pick the thread that can make progress; randomize a bit so the lock
        // contention is visible.
        const order: ThreadId[] = Math.random() < 0.5 ? ["T1", "T2"] : ["T2", "T1"];
        for (const t of order) {
          const ops = t === "T1" ? t1Ops : t2Ops;
          if (s.cursors[t] >= ops.length) continue;
          const next = tryMutexStep(s, t, ops);
          // If state.log length didn't grow, we made no real progress.
          if (next.log.length > s.log.length) {
            const last = next.log[next.log.length - 1];
            if (!last.blocked) return next;
          }
        }
        // If both blocked (only possible if both want lock at once, which can't
        // happen since one will be owner), bail.
        return s;
      });
    }, 380);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [autoplay, state, t1Ops, t2Ops]);

  const expected = RACE_ITERS * 2;
  const finished = state.cursors.T1 >= t1Ops.length && state.cursors.T2 >= t2Ops.length;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <MutexColumn
            id="T1"
            ops={t1Ops}
            cursor={state.cursors.T1}
            owner={state.owner}
            color="#2563eb"
          />
          <MutexColumn
            id="T2"
            ops={t2Ops}
            cursor={state.cursors.T2}
            owner={state.owner}
            color="#db2777"
          />
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">counter = </span>
                <span
                  className={`font-mono font-bold text-lg ${
                    finished && state.counter === expected
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-foreground"
                  }`}
                >
                  {state.counter}
                </span>
                <span className="text-muted-foreground"> / {expected}</span>
              </div>
              <MutexBadge owner={state.owner} />
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => step("T1")}
                disabled={state.cursors.T1 >= t1Ops.length || autoplay}
                className="text-xs px-2.5 py-1 rounded border border-border bg-background hover:bg-muted disabled:opacity-30 inline-flex items-center gap-1"
                style={{ color: "#2563eb" }}
              >
                <StepForward className="h-3 w-3" /> T1
              </button>
              <button
                type="button"
                onClick={() => step("T2")}
                disabled={state.cursors.T2 >= t2Ops.length || autoplay}
                className="text-xs px-2.5 py-1 rounded border border-border bg-background hover:bg-muted disabled:opacity-30 inline-flex items-center gap-1"
                style={{ color: "#db2777" }}
              >
                <StepForward className="h-3 w-3" /> T2
              </button>
              <button
                type="button"
                onClick={() => setAutoplay((a) => !a)}
                disabled={finished}
                className="text-xs px-2.5 py-1 rounded border border-border bg-background hover:bg-muted disabled:opacity-30 inline-flex items-center gap-1"
              >
                {autoplay ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                {autoplay ? "Pause" : "Auto"}
              </button>
              <button
                type="button"
                onClick={reset}
                className="text-xs px-2.5 py-1 rounded border border-border bg-background hover:bg-muted inline-flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-card p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Register
          </div>
          <div className="font-mono space-y-0.5">
            <div>
              <span style={{ color: "#2563eb" }}>T1.reg</span> ={" "}
              {state.reg.T1 === null ? "—" : state.reg.T1}
            </div>
            <div>
              <span style={{ color: "#db2777" }}>T2.reg</span> ={" "}
              {state.reg.T2 === null ? "—" : state.reg.T2}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Logg
          </div>
          <div className="max-h-40 overflow-auto space-y-1 pr-1">
            {state.log.length === 0 ? (
              <div className="text-muted-foreground italic">
                Klikk Auto eller en av T1/T2-knappene.
              </div>
            ) : (
              state.log
                .slice()
                .reverse()
                .map((entry, idx) => (
                  <div
                    key={state.log.length - idx}
                    className={`px-1.5 py-1 rounded font-mono text-[10px] leading-tight ${
                      entry.blocked
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        : "bg-muted/40 text-foreground"
                    }`}
                  >
                    {entry.note}
                  </div>
                ))
            )}
          </div>
        </div>

        {finished && (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 p-3 text-xs">
            counter = {state.counter}, alltid {expected}. Mutex garanterer gjensidig utelukkelse.
          </div>
        )}
      </div>
    </div>
  );
}

function MutexBadge({ owner }: { owner: ThreadId | null }) {
  if (!owner) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        <span className="w-2 h-2 rounded-full bg-muted" />
        mutex: ledig
      </span>
    );
  }
  const color = owner === "T1" ? "#2563eb" : "#db2777";
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color }}>
      <Lock className="h-3 w-3" />
      mutex eid av {owner}
    </span>
  );
}

function MutexColumn({
  id,
  ops,
  cursor,
  owner,
  color,
}: {
  id: ThreadId;
  ops: MutexOp[];
  cursor: number;
  owner: ThreadId | null;
  color: string;
}) {
  const waiting = owner && owner !== id;
  return (
    <div
      className={`rounded-lg border bg-card overflow-hidden ${waiting ? "border-amber-500/40" : "border-border"}`}
    >
      <div
        className="px-2.5 py-1.5 text-xs font-semibold border-b border-border flex items-center justify-between"
        style={{ color, background: `${color}10` }}
      >
        <span>{id}</span>
        {waiting && cursor < ops.length && (
          <span className="text-[9px] text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
            <span className="spin-dot" />
            spinner pa lock
          </span>
        )}
      </div>
      <ol className="p-2 space-y-1 text-[10px] font-mono">
        {ops.slice(0, Math.min(ops.length, 15)).map((op, i) => {
          const done = i < cursor;
          const next = i === cursor;
          const text =
            op.phase === "lock"
              ? `lock()`
              : op.phase === "unlock"
                ? `unlock()`
                : op.phase === "load"
                  ? `reg = counter`
                  : op.phase === "add"
                    ? `reg = reg + 1`
                    : `counter = reg`;
          const isLock = op.phase === "lock" || op.phase === "unlock";
          return (
            <li
              key={i}
              className={`px-1.5 py-0.5 rounded border ${
                done
                  ? "border-transparent bg-muted/40 text-muted-foreground line-through decoration-1"
                  : next
                    ? isLock
                      ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      : "border-brand bg-brand/10 text-foreground"
                    : isLock
                      ? "border-transparent text-amber-600/70 dark:text-amber-400/70"
                      : "border-transparent text-muted-foreground"
              }`}
            >
              {text}
              {op.phase === "unlock" ? (
                <span className="text-muted-foreground"> // iter {op.iter}</span>
              ) : null}
            </li>
          );
        })}
        {ops.length > 15 && (
          <li className="text-[9px] text-muted-foreground italic px-1.5">
            ... {ops.length - 15} flere ops
          </li>
        )}
      </ol>
      <style>{`
        .spin-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: 1.5px solid currentColor;
          border-top-color: transparent;
          animation: spinrot 0.7s linear infinite;
        }
        @keyframes spinrot { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ===========================================================================
//                       MODE 3: DINING PHILOSOPHERS DEADLOCK
// ===========================================================================

type Strategy = "naive" | "asymmetric";
type PhilState = "thinking" | "wants-left" | "has-left" | "wants-right" | "eating" | "done";

type Philosopher = {
  id: number;
  state: PhilState;
  ateCount: number;
};

type DiningState = {
  phils: Philosopher[];
  // forks[i] = id of philosopher holding it, or null
  forks: (number | null)[];
  tick: number;
  deadlock: boolean;
  totalAte: number;
  log: string[];
};

const PHIL_COUNT = 4;

function freshDining(): DiningState {
  return {
    phils: Array.from({ length: PHIL_COUNT }, (_, i) => ({
      id: i,
      state: "thinking",
      ateCount: 0,
    })),
    forks: Array.from({ length: PHIL_COUNT }, () => null),
    tick: 0,
    deadlock: false,
    totalAte: 0,
    log: [],
  };
}

function leftFork(philId: number) {
  return philId; // fork i sits on left of philosopher i
}
function rightFork(philId: number) {
  return (philId + 1) % PHIL_COUNT;
}

function stepDining(state: DiningState, strat: Strategy): DiningState {
  if (state.deadlock) return state;
  const next: DiningState = {
    phils: state.phils.map((p) => ({ ...p })),
    forks: state.forks.slice(),
    tick: state.tick + 1,
    deadlock: false,
    totalAte: state.totalAte,
    log: state.log.slice(),
  };

  // For each philosopher, attempt one action this tick.
  for (let i = 0; i < PHIL_COUNT; i++) {
    const p = next.phils[i];
    const swap = strat === "asymmetric" && i === PHIL_COUNT - 1;
    const firstFork = swap ? rightFork(i) : leftFork(i);
    const secondFork = swap ? leftFork(i) : rightFork(i);

    if (p.state === "thinking") {
      // After a few ticks of thinking, try to pick first fork
      p.state = "wants-left";
    } else if (p.state === "wants-left") {
      if (next.forks[firstFork] === null) {
        next.forks[firstFork] = i;
        p.state = "has-left";
        next.log.unshift(`P${i} tok ${swap ? "hoyre" : "venstre"} gaffel (#${firstFork})`);
      }
    } else if (p.state === "has-left") {
      p.state = "wants-right";
    } else if (p.state === "wants-right") {
      if (next.forks[secondFork] === null) {
        next.forks[secondFork] = i;
        p.state = "eating";
        next.log.unshift(
          `P${i} tok ${swap ? "venstre" : "hoyre"} gaffel (#${secondFork}) — spiser`,
        );
      }
    } else if (p.state === "eating") {
      // Done eating one round, drop forks.
      next.forks[firstFork] = null;
      next.forks[secondFork] = null;
      p.ateCount = p.ateCount + 1;
      next.totalAte = next.totalAte + 1;
      p.state = "thinking";
      next.log.unshift(`P${i} ferdig spist — slipper begge gafler`);
    }
  }

  next.log = next.log.slice(0, 12);

  // Deadlock = all philosophers wanting same direction with no progress possible.
  // Detect: everyone holds one fork and wants the other.
  const allWaiting = next.phils.every((p) => p.state === "wants-right");
  if (allWaiting) next.deadlock = true;

  return next;
}

function DeadlockView() {
  const [strat, setStrat] = useState<Strategy>("naive");
  const [state, setState] = useState<DiningState>(freshDining());
  const [autoplay, setAutoplay] = useState(false);
  const timer = useRef<number | null>(null);

  function step() {
    setState((s) => stepDining(s, strat));
  }
  function reset() {
    setAutoplay(false);
    setState(freshDining());
  }
  useEffect(() => {
    setAutoplay(false);
    setState(freshDining());
  }, [strat]);

  useEffect(() => {
    if (!autoplay) {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      return;
    }
    if (state.deadlock || state.totalAte >= 8) {
      setAutoplay(false);
      return;
    }
    timer.current = window.setTimeout(() => {
      setState((s) => stepDining(s, strat));
    }, 550);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [autoplay, state, strat]);

  const cx = 200;
  const cy = 200;
  const tableR = 70;
  const philR = 38;
  const forkLen = 50;

  // Positions
  const philPos = (i: number) => {
    const a = (Math.PI * 2 * i) / PHIL_COUNT - Math.PI / 2;
    return { x: cx + Math.cos(a) * (tableR + 80), y: cy + Math.sin(a) * (tableR + 80) };
  };
  const forkPos = (i: number) => {
    // fork sits between philosopher i-1 and i (i.e. left of i)
    const a = (Math.PI * 2 * i) / PHIL_COUNT - Math.PI / 2 - Math.PI / PHIL_COUNT;
    return { x: cx + Math.cos(a) * (tableR + 30), y: cy + Math.sin(a) * (tableR + 30), angle: a };
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <svg viewBox="0 0 400 400" className="w-full h-auto">
            {/* table */}
            <circle cx={cx} cy={cy} r={tableR} fill="#fef3c7" stroke="#92400e" strokeWidth={1.5} />
            <text x={cx} y={cy + 4} textAnchor="middle" className="text-[10px]" fill="#92400e">
              bord
            </text>

            {/* forks */}
            {state.forks.map((holder, i) => {
              const pos = forkPos(i);
              const onTable = holder === null;
              if (onTable) {
                // Draw on table
                const fx = cx + Math.cos(pos.angle) * (tableR - 14);
                const fy = cy + Math.sin(pos.angle) * (tableR - 14);
                return (
                  <g
                    key={`fork-${i}`}
                    transform={`translate(${fx},${fy}) rotate(${(pos.angle * 180) / Math.PI + 90})`}
                  >
                    <line
                      x1={0}
                      y1={-forkLen / 2}
                      x2={0}
                      y2={forkLen / 2}
                      stroke="#475569"
                      strokeWidth={2}
                    />
                    <line
                      x1={-4}
                      y1={-forkLen / 2}
                      x2={-4}
                      y2={-forkLen / 2 + 10}
                      stroke="#475569"
                      strokeWidth={2}
                    />
                    <line
                      x1={0}
                      y1={-forkLen / 2}
                      x2={0}
                      y2={-forkLen / 2 + 10}
                      stroke="#475569"
                      strokeWidth={2}
                    />
                    <line
                      x1={4}
                      y1={-forkLen / 2}
                      x2={4}
                      y2={-forkLen / 2 + 10}
                      stroke="#475569"
                      strokeWidth={2}
                    />
                    <text
                      x={0}
                      y={forkLen / 2 + 12}
                      textAnchor="middle"
                      className="text-[8px]"
                      fill="#475569"
                    >
                      f{i}
                    </text>
                  </g>
                );
              }
              // Draw next to philosopher who holds it
              const pp = philPos(holder);
              return (
                <g key={`fork-${i}`} transform={`translate(${pp.x},${pp.y})`}>
                  <line
                    x1={-philR / 2}
                    y1={philR / 2 + 6}
                    x2={-philR / 2}
                    y2={philR / 2 + 30}
                    stroke="#1e40af"
                    strokeWidth={2}
                  />
                  <text
                    x={-philR / 2 + 10}
                    y={philR / 2 + 22}
                    className="text-[8px]"
                    fill="#1e40af"
                  >
                    f{i}
                  </text>
                </g>
              );
            })}

            {/* philosophers */}
            {state.phils.map((p) => {
              const pos = philPos(p.id);
              const wantsRight = p.state === "wants-right";
              const eating = p.state === "eating";
              const fillColor = eating
                ? "#86efac"
                : wantsRight
                  ? "#fca5a5"
                  : p.state === "has-left"
                    ? "#fed7aa"
                    : p.state === "wants-left"
                      ? "#fde68a"
                      : "#e0e7ff";
              const ringColor = eating
                ? "#16a34a"
                : wantsRight
                  ? "#dc2626"
                  : p.state === "has-left"
                    ? "#ea580c"
                    : p.state === "wants-left"
                      ? "#ca8a04"
                      : "#4338ca";
              return (
                <g key={p.id} transform={`translate(${pos.x},${pos.y})`}>
                  <circle r={philR} fill={fillColor} stroke={ringColor} strokeWidth={2} />
                  <text
                    textAnchor="middle"
                    y={-4}
                    className="text-[12px] font-mono font-bold"
                    fill="#0f172a"
                  >
                    P{p.id}
                  </text>
                  <text textAnchor="middle" y={10} className="text-[8px]" fill="#0f172a">
                    {p.state}
                  </text>
                  <text textAnchor="middle" y={22} className="text-[8px]" fill="#0f172a">
                    spist: {p.ateCount}
                  </text>
                </g>
              );
            })}

            {state.deadlock && (
              <g>
                <circle
                  cx={cx}
                  cy={cy}
                  r={tableR + 8}
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth={3}
                  strokeDasharray="6 4"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="20"
                    dur="0.6s"
                    repeatCount="indefinite"
                  />
                </circle>
                <text
                  x={cx}
                  y={cy + 22}
                  textAnchor="middle"
                  className="text-[10px] font-bold"
                  fill="#dc2626"
                >
                  deadlock
                </text>
              </g>
            )}
          </svg>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={step}
            disabled={state.deadlock || autoplay}
            className="text-xs px-2.5 py-1 rounded border border-border bg-background hover:bg-muted disabled:opacity-30 inline-flex items-center gap-1"
          >
            <StepForward className="h-3 w-3" /> Steg
          </button>
          <button
            type="button"
            onClick={() => setAutoplay((a) => !a)}
            disabled={state.deadlock}
            className="text-xs px-2.5 py-1 rounded border border-border bg-background hover:bg-muted disabled:opacity-30 inline-flex items-center gap-1"
          >
            {autoplay ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {autoplay ? "Pause" : "Auto"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="text-xs px-2.5 py-1 rounded border border-border bg-background hover:bg-muted inline-flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Strategi
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="flex items-start gap-2 text-xs cursor-pointer">
              <input
                type="radio"
                name="strat"
                checked={strat === "naive"}
                onChange={() => setStrat("naive")}
                className="mt-0.5 accent-rose-500"
              />
              <span>
                <span className="font-semibold">Naiv</span> — alle tar venstre forst, sa hoyre.
                <span className="block text-[10px] text-muted-foreground">
                  Alle tar venstre samtidig — ingen far hoyre — sirkulaer venting.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2 text-xs cursor-pointer">
              <input
                type="radio"
                name="strat"
                checked={strat === "asymmetric"}
                onChange={() => setStrat("asymmetric")}
                className="mt-0.5 accent-emerald-500"
              />
              <span>
                <span className="font-semibold">Asymmetri</span> — P{PHIL_COUNT - 1} tar hoyre
                forst.
                <span className="block text-[10px] text-muted-foreground">
                  Bryter Coffmans circular wait — total orden pa gafler.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Status
          </div>
          <div className="font-mono space-y-0.5">
            <div>tick = {state.tick}</div>
            <div>total spist = {state.totalAte}</div>
            <div
              className={
                state.deadlock
                  ? "text-rose-600 dark:text-rose-400 font-semibold"
                  : "text-emerald-600 dark:text-emerald-400"
              }
            >
              {state.deadlock ? "DEADLOCK" : "fremgang"}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Hendelser
          </div>
          <div className="max-h-32 overflow-auto space-y-1 pr-1">
            {state.log.length === 0 ? (
              <div className="text-muted-foreground italic">Trykk Steg eller Auto.</div>
            ) : (
              state.log.map((entry, idx) => (
                <div key={idx} className="px-1.5 py-0.5 rounded bg-muted/40 font-mono text-[10px]">
                  {entry}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
//                       MODE 4: PRODUCER-CONSUMER
// ===========================================================================

const BUFFER_SIZE = 5;

type PCState = {
  buffer: (number | null)[]; // ring contents
  head: number; // consumer reads here
  tail: number; // producer writes here
  count: number;
  produced: number;
  consumed: number;
  prodWaiting: boolean;
  consWaiting: boolean;
  prodCooldown: number; // ms until next produce attempt
  consCooldown: number;
  log: string[];
};

function freshPC(): PCState {
  return {
    buffer: Array.from({ length: BUFFER_SIZE }, () => null),
    head: 0,
    tail: 0,
    count: 0,
    produced: 0,
    consumed: 0,
    prodWaiting: false,
    consWaiting: false,
    prodCooldown: 0,
    consCooldown: 0,
    log: [],
  };
}

function tickPC(state: PCState, dt: number, prodInterval: number, consInterval: number): PCState {
  const next: PCState = {
    buffer: state.buffer.slice(),
    head: state.head,
    tail: state.tail,
    count: state.count,
    produced: state.produced,
    consumed: state.consumed,
    prodWaiting: false,
    consWaiting: false,
    prodCooldown: Math.max(0, state.prodCooldown - dt),
    consCooldown: Math.max(0, state.consCooldown - dt),
    log: state.log.slice(),
  };

  // Producer: when cooldown 0 and buffer not full, produce; else wait.
  if (next.prodCooldown <= 0) {
    if (next.count < BUFFER_SIZE) {
      const item = next.produced + 1;
      next.buffer[next.tail] = item;
      next.tail = (next.tail + 1) % BUFFER_SIZE;
      next.count = next.count + 1;
      next.produced = item;
      next.prodCooldown = prodInterval;
      next.log.unshift(
        `producer la item #${item} i slot ${(next.tail + BUFFER_SIZE - 1) % BUFFER_SIZE}`,
      );
    } else {
      next.prodWaiting = true;
    }
  }

  // Consumer: when cooldown 0 and buffer not empty, consume; else wait.
  if (next.consCooldown <= 0) {
    if (next.count > 0) {
      const item = next.buffer[next.head];
      next.buffer[next.head] = null;
      next.head = (next.head + 1) % BUFFER_SIZE;
      next.count = next.count - 1;
      next.consumed = next.consumed + 1;
      next.consCooldown = consInterval;
      next.log.unshift(`consumer tok item #${item} (totalt ${next.consumed})`);
    } else {
      next.consWaiting = true;
    }
  }

  next.log = next.log.slice(0, 10);
  return next;
}

function ProducerConsumerView() {
  const [prodInterval, setProdInterval] = useState(600);
  const [consInterval, setConsInterval] = useState(900);
  const [state, setState] = useState<PCState>(freshPC());
  const [running, setRunning] = useState(false);
  const last = useRef<number>(0);

  useEffect(() => {
    if (!running) return;
    last.current = performance.now();
    let raf = 0;
    function loop(t: number) {
      const dt = t - last.current;
      last.current = t;
      setState((s) => tickPC(s, dt, prodInterval, consInterval));
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, prodInterval, consInterval]);

  function reset() {
    setRunning(false);
    setState(freshPC());
  }

  // Buffer slots — laid out left to right
  const slotW = 60;
  const slotH = 60;
  const gap = 8;
  const totalW = BUFFER_SIZE * slotW + (BUFFER_SIZE - 1) * gap;
  const svgW = totalW + 200;
  const svgH = 220;
  const slotsX = (svgW - totalW) / 2;
  const slotsY = 80;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full h-auto"
            style={{ color: "currentColor" }}
          >
            {/* Producer */}
            <g transform={`translate(40,${slotsY + slotH / 2})`}>
              <rect
                x={-32}
                y={-22}
                width={64}
                height={44}
                rx={6}
                fill={state.prodWaiting ? "#fde68a" : "#bfdbfe"}
                stroke={state.prodWaiting ? "#a16207" : "#1d4ed8"}
                strokeWidth={1.5}
              />
              <text textAnchor="middle" y={-2} className="text-[10px] font-semibold" fill="#0f172a">
                producer
              </text>
              <text
                textAnchor="middle"
                y={12}
                className="text-[9px]"
                fill={state.prodWaiting ? "#a16207" : "#1d4ed8"}
              >
                {state.prodWaiting ? "blokkert" : "produserer"}
              </text>
            </g>
            {/* Arrow producer → buffer */}
            <line
              x1={72}
              y1={slotsY + slotH / 2}
              x2={slotsX - 4}
              y2={slotsY + slotH / 2}
              stroke="#1d4ed8"
              strokeWidth={1.5}
              markerEnd="url(#pc-arrow-blue)"
            />

            {/* Buffer slots */}
            {Array.from({ length: BUFFER_SIZE }).map((_, i) => {
              const x = slotsX + i * (slotW + gap);
              const occupied = state.buffer[i] !== null;
              const isTail = i === state.tail;
              const isHead = i === state.head;
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={slotsY}
                    width={slotW}
                    height={slotH}
                    rx={4}
                    fill={occupied ? "#bbf7d0" : "#f1f5f9"}
                    stroke={occupied ? "#16a34a" : "#cbd5e1"}
                    strokeWidth={1.5}
                  />
                  <text
                    x={x + slotW / 2}
                    y={slotsY + slotH / 2 + 4}
                    textAnchor="middle"
                    className="text-[14px] font-mono font-bold"
                    fill="#0f172a"
                  >
                    {occupied ? `#${state.buffer[i]}` : ""}
                  </text>
                  <text
                    x={x + slotW / 2}
                    y={slotsY + slotH + 14}
                    textAnchor="middle"
                    className="text-[8px]"
                    fill="#64748b"
                  >
                    slot {i}
                  </text>
                  {isTail && (
                    <text
                      x={x + slotW / 2}
                      y={slotsY - 6}
                      textAnchor="middle"
                      className="text-[9px] font-mono"
                      fill="#1d4ed8"
                    >
                      tail
                    </text>
                  )}
                  {isHead && (
                    <text
                      x={x + slotW / 2}
                      y={slotsY - 18}
                      textAnchor="middle"
                      className="text-[9px] font-mono"
                      fill="#db2777"
                    >
                      head
                    </text>
                  )}
                </g>
              );
            })}

            {/* Arrow buffer → consumer */}
            <line
              x1={slotsX + totalW + 4}
              y1={slotsY + slotH / 2}
              x2={svgW - 72}
              y2={slotsY + slotH / 2}
              stroke="#db2777"
              strokeWidth={1.5}
              markerEnd="url(#pc-arrow-pink)"
            />

            {/* Consumer */}
            <g transform={`translate(${svgW - 40},${slotsY + slotH / 2})`}>
              <rect
                x={-32}
                y={-22}
                width={64}
                height={44}
                rx={6}
                fill={state.consWaiting ? "#fde68a" : "#fbcfe8"}
                stroke={state.consWaiting ? "#a16207" : "#db2777"}
                strokeWidth={1.5}
              />
              <text textAnchor="middle" y={-2} className="text-[10px] font-semibold" fill="#0f172a">
                consumer
              </text>
              <text
                textAnchor="middle"
                y={12}
                className="text-[9px]"
                fill={state.consWaiting ? "#a16207" : "#db2777"}
              >
                {state.consWaiting ? "blokkert" : "konsumerer"}
              </text>
            </g>

            {/* Semaphore display */}
            <g transform={`translate(${svgW / 2},${slotsY + slotH + 50})`}>
              <text x={-80} y={0} textAnchor="end" className="text-[9px] font-mono" fill="#1d4ed8">
                empty = {BUFFER_SIZE - state.count}
              </text>
              <text x={0} y={0} textAnchor="middle" className="text-[9px] font-mono" fill="#475569">
                count = {state.count} / {BUFFER_SIZE}
              </text>
              <text x={80} y={0} textAnchor="start" className="text-[9px] font-mono" fill="#db2777">
                full = {state.count}
              </text>
            </g>

            <defs>
              <marker
                id="pc-arrow-blue"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M0,0 L10,5 L0,10 z" fill="#1d4ed8" />
              </marker>
              <marker
                id="pc-arrow-pink"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M0,0 L10,5 L0,10 z" fill="#db2777" />
              </marker>
            </defs>
          </svg>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="text-xs px-2.5 py-1 rounded border border-border bg-background hover:bg-muted inline-flex items-center gap-1"
          >
            {running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {running ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="text-xs px-2.5 py-1 rounded border border-border bg-background hover:bg-muted inline-flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-card p-3 space-y-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex justify-between">
              <span>Producer-hastighet</span>
              <span className="font-mono text-foreground">{prodInterval} ms</span>
            </div>
            <input
              type="range"
              min={150}
              max={1500}
              step={50}
              value={prodInterval}
              onChange={(e) => setProdInterval(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600"
            />
            <div className="text-[9px] text-muted-foreground flex justify-between">
              <span>rask</span>
              <span>treg</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex justify-between">
              <span>Consumer-hastighet</span>
              <span className="font-mono text-foreground">{consInterval} ms</span>
            </div>
            <input
              type="range"
              min={150}
              max={1500}
              step={50}
              value={consInterval}
              onChange={(e) => setConsInterval(parseInt(e.target.value, 10))}
              className="w-full accent-pink-600"
            />
            <div className="text-[9px] text-muted-foreground flex justify-between">
              <span>rask</span>
              <span>treg</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Statistikk
          </div>
          <div className="font-mono space-y-0.5">
            <div>produsert: {state.produced}</div>
            <div>konsumert: {state.consumed}</div>
            <div>i buffer: {state.count}</div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Hendelser
          </div>
          <div className="max-h-32 overflow-auto space-y-1 pr-1">
            {state.log.length === 0 ? (
              <div className="text-muted-foreground italic">Trykk Start.</div>
            ) : (
              state.log.map((e, i) => (
                <div key={i} className="px-1.5 py-0.5 rounded bg-muted/40 font-mono text-[10px]">
                  {e}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-brand/30 bg-brand/5 p-3 text-[11px] leading-relaxed">
          <span className="font-semibold">Eksperiment:</span> Sett producer mye raskere enn consumer
          — bufferet fylles og producer blokkeres pa <span className="font-mono">empty=0</span>.
          Omvendt blokkeres consumer pa <span className="font-mono">full=0</span>.
        </div>
      </div>
    </div>
  );
}
