import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Thread state-maskin: NEW → RUN → WAIT → TERMINATED
 *
 * Pedagogisk fokus: state-overganger og kø-flytting, IKKE Gantt-timing.
 * Komplementerer dte2505-scheduling-drill.
 */

type State = "NEW" | "RUN" | "WAIT" | "TERMINATED";
type EventType = "disk" | "net" | "lock";

type Thread = {
  id: number;
  label: string;
  priority: number;          // 1 (lavest) .. maxPriority
  state: State;
  remaining: number;         // CPU-ticks som gjenstår å regne på (kun pedagogisk)
  sliceLeft: number;         // hvor mange ticks igjen av nåværende kvantum
  waitOn: EventType | null;  // hvilken event-type wait-queue man er i
  waitRemaining: number;     // ticks igjen før event auto-completer (auto-modus)
  color: string;
  // statistikk
  ticksRunning: number;
  ticksReady: number;
  ticksWaiting: number;
};

const COLORS = [
  "bg-rose-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-cyan-500",
  "bg-violet-500",
  "bg-pink-500",
  "bg-lime-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-indigo-500",
];

type Tab = "lab" | "auto" | "challenge";

// ---------- CHALLENGES ----------

type ChallengeSpec = {
  id: string;
  title: string;
  description: string;
  ticks: number;
  timeSlice: number;
  threads: {
    label: string;
    priority: number;
    burst: number;
    ioAt?: { tick: number; durationTicks: number };
  }[];
  question: string;
  // forventet endelig state per tråd-label
  answer: Record<string, State>;
  explain: string;
};

const CHALLENGES: ChallengeSpec[] = [
  {
    id: "c1",
    title: "Oppsett 1 — kort burst, ingen I/O",
    description:
      "Tre tråder, alle prioritet 2, burst 3 hver. Time slice = 2. Ingen I/O. Hvor er hver tråd etter 10 ticks?",
    ticks: 10,
    timeSlice: 2,
    threads: [
      { label: "A", priority: 2, burst: 3 },
      { label: "B", priority: 2, burst: 3 },
      { label: "C", priority: 2, burst: 3 },
    ],
    question: "Hvilken state har A, B og C etter 10 ticks?",
    answer: { A: "TERMINATED", B: "TERMINATED", C: "TERMINATED" },
    explain:
      "Totalt CPU-arbeid = 3·3 = 9 ticks, mindre enn 10. Round-robin med q=2 gjør at alle blir ferdig før tick 10 — alle TERMINATED.",
  },
  {
    id: "c2",
    title: "Oppsett 2 — én I/O-tung tråd",
    description:
      "A (prio 3, burst 2). B (prio 2, burst 6, trigger disk-wait på tick 1, varer 8 ticks). Time slice = 4. Hvor er hver etter 6 ticks?",
    ticks: 6,
    timeSlice: 4,
    threads: [
      { label: "A", priority: 3, burst: 2 },
      { label: "B", priority: 2, burst: 6, ioAt: { tick: 1, durationTicks: 8 } },
    ],
    question: "Hvilken state har A og B etter 6 ticks?",
    answer: { A: "TERMINATED", B: "WAIT" },
    explain:
      "B kjører på tick 0 (høyere prio? Nei, A har prio 3 > B 2). A kjører til ferdig på tick 2, TERMINATED. B starter tick 2, trigger I/O umiddelbart (ioAt=1 relativt til B sin start), hopper til wait-queue. Etter 6 ticks er I/O fortsatt ikke ferdig (8 ticks varighet) — B i WAIT.",
  },
  {
    id: "c3",
    title: "Oppsett 3 — preempt på prioritet",
    description:
      "Lav-prio L (prio 1, burst 5) starter alene. Etter 2 ticks ankommer høy-prio H (prio 4, burst 2). Time slice = 10 (lang). Hvor er hver etter 6 ticks?",
    ticks: 6,
    timeSlice: 10,
    threads: [
      { label: "L", priority: 1, burst: 5 },
      { label: "H", priority: 4, burst: 2 },
    ],
    question: "Hvilken state har L og H etter 6 ticks?",
    answer: { L: "TERMINATED", H: "TERMINATED" },
    explain:
      "I dette settet ankommer begge på tick 0 (forenklet modell — ingen sen ankomst). H har høyere prio og kjører først: 2 ticks → TERMINATED på tick 2. L overtar: 5 ticks → TERMINATED på tick 7. Etter 6 ticks er H ferdig, L har 1 tick igjen → L er fremdeles RUN. Riktig svar: H=TERMINATED, L=RUN. (Klikk «Vis fasit» — denne er ment som felle.)",
  },
];

// Korreksjon: oppdater c3 svar til faktisk forventet etter modellen vår
CHALLENGES[2].answer = { L: "RUN", H: "TERMINATED" };

// ---------- HELPER: scheduler step ----------

function pickNext(threads: Thread[]): Thread | null {
  // høyeste prioritet i RUN-state og sliceLeft > 0 (ellers ny slice)
  const ready = threads.filter((t) => t.state === "RUN" && t.remaining > 0);
  if (ready.length === 0) return null;
  ready.sort((a, b) => b.priority - a.priority || a.id - b.id);
  return ready[0];
}

// ---------- COMPONENT ----------

export function ThreadStateSimulator() {
  const [tab, setTab] = useState<Tab>("lab");
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <TabBtn active={tab === "lab"} onClick={() => setTab("lab")}>Lab (manuell)</TabBtn>
        <TabBtn active={tab === "auto"} onClick={() => setTab("auto")}>Auto-modus</TabBtn>
        <TabBtn active={tab === "challenge"} onClick={() => setTab("challenge")}>Utfordring</TabBtn>
      </div>
      {tab === "lab" && <LabMode />}
      {tab === "auto" && <AutoMode />}
      {tab === "challenge" && <ChallengeMode />}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
        active
          ? "bg-brand text-brand-foreground"
          : "bg-muted/50 text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

// ============================================================
// LAB MODE — manuell, knapp-drevet
// ============================================================

function LabMode() {
  const [maxPriority, setMaxPriority] = useState(3);
  const [timeSlice, setTimeSlice] = useState(3);
  const [threads, setThreads] = useState<Thread[]>(() => [
    makeThread(1, "T1", 2, 5, 0, timeSlice0(3)),
    makeThread(2, "T2", 1, 4, 1, timeSlice0(3)),
  ]);
  const [nextId, setNextId] = useState(3);
  const [tick, setTick] = useState(0);
  const [log, setLog] = useState<string[]>([
    "Klikk Create thread, så Tick clock for å se scheduleren plukke høyeste-prioritet.",
  ]);

  function timeSlice0(_v: number) {
    return timeSlice;
  }

  function addLog(line: string) {
    setLog((l) => [`t=${tick}: ${line}`, ...l].slice(0, 12));
  }

  function createThread() {
    const id = nextId;
    setNextId(id + 1);
    const prio = 1 + Math.floor(Math.random() * maxPriority);
    const burst = 3 + Math.floor(Math.random() * 5);
    const t = makeThread(id, `T${id}`, prio, burst, id - 1, timeSlice);
    setThreads((ts) => [...ts, t]);
    addLog(`opprettet ${t.label} (prio ${prio}, burst ${burst}) — NEW`);
  }

  function admit(id: number) {
    setThreads((ts) =>
      ts.map((t) => (t.id === id && t.state === "NEW" ? { ...t, state: "RUN" } : t)),
    );
    addLog(`admit T${id}: NEW → RUN (run-queue)`);
  }

  function tickClock() {
    setTick((tk) => tk + 1);
    setThreads((ts) => {
      // admit alle NEW automatisk (forenkling)
      let work = ts.map((t) => (t.state === "NEW" ? { ...t, state: "RUN" as State } : t));

      // wait-tråder: tikk ned waitRemaining; når 0 → tilbake til RUN
      work = work.map((t) => {
        if (t.state === "WAIT" && t.waitRemaining > 1) {
          return { ...t, waitRemaining: t.waitRemaining - 1, ticksWaiting: t.ticksWaiting + 1 };
        }
        if (t.state === "WAIT" && t.waitRemaining <= 1) {
          return {
            ...t,
            state: "RUN" as State,
            waitOn: null,
            waitRemaining: 0,
            sliceLeft: timeSlice,
            ticksWaiting: t.ticksWaiting + 1,
          };
        }
        return t;
      });

      const running = pickNext(work);
      if (!running) {
        return work; // CPU idle
      }
      const id = running.id;
      work = work.map((t) => {
        if (t.id !== id) {
          if (t.state === "RUN") return { ...t, ticksReady: t.ticksReady + 1 };
          return t;
        }
        const newRemaining = Math.max(0, t.remaining - 1);
        const newSliceLeft = t.sliceLeft - 1;
        if (newRemaining === 0) {
          return { ...t, remaining: 0, sliceLeft: 0, state: "TERMINATED" as State, ticksRunning: t.ticksRunning + 1 };
        }
        if (newSliceLeft <= 0) {
          // preempt — bak i run-queue
          return {
            ...t,
            remaining: newRemaining,
            sliceLeft: timeSlice,
            ticksRunning: t.ticksRunning + 1,
          };
        }
        return { ...t, remaining: newRemaining, sliceLeft: newSliceLeft, ticksRunning: t.ticksRunning + 1 };
      });

      return work;
    });
  }

  function triggerWait(id: number, event: EventType) {
    setThreads((ts) =>
      ts.map((t) =>
        t.id === id && t.state === "RUN"
          ? { ...t, state: "WAIT", waitOn: event, waitRemaining: 4 }
          : t,
      ),
    );
    addLog(`T${id}: RUN → WAIT (event: ${event})`);
  }

  function completeWait(id: number) {
    setThreads((ts) =>
      ts.map((t) =>
        t.id === id && t.state === "WAIT"
          ? { ...t, state: "RUN", waitOn: null, waitRemaining: 0, sliceLeft: timeSlice }
          : t,
      ),
    );
    addLog(`T${id}: WAIT → RUN (event complete)`);
  }

  function preempt(id: number) {
    setThreads((ts) =>
      ts.map((t) =>
        t.id === id && t.state === "RUN" ? { ...t, sliceLeft: 0 } : t,
      ),
    );
    addLog(`T${id}: preempt — slice slutt, bak i run-queue`);
  }

  function exit(id: number) {
    setThreads((ts) =>
      ts.map((t) => (t.id === id ? { ...t, state: "TERMINATED", remaining: 0 } : t)),
    );
    addLog(`T${id}: → TERMINATED`);
  }

  function reset() {
    setTick(0);
    setNextId(3);
    setThreads([
      makeThread(1, "T1", 2, 5, 0, timeSlice),
      makeThread(2, "T2", 1, 4, 1, timeSlice),
    ]);
    setLog(["Reset."]);
  }

  // velg én tråd som regnes som "currently running" (høyeste prio i RUN med sliceLeft > 0)
  const current = useMemo(() => pickNext(threads), [threads]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-mono">tick = {tick}</span>
        <label className="flex items-center gap-2">
          Prioritetsnivåer (1..N):
          <input
            type="number"
            min={1}
            max={4}
            value={maxPriority}
            onChange={(e) => setMaxPriority(Math.max(1, Math.min(4, Number(e.target.value))))}
            className="w-16 rounded border border-border bg-background px-2 py-0.5"
          />
        </label>
        <label className="flex items-center gap-2">
          Time slice:
          <input
            type="number"
            min={1}
            max={10}
            value={timeSlice}
            onChange={(e) => setTimeSlice(Math.max(1, Math.min(10, Number(e.target.value))))}
            className="w-16 rounded border border-border bg-background px-2 py-0.5"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Btn onClick={createThread}>+ Create thread</Btn>
        <Btn onClick={tickClock} variant="primary">▶ Tick clock</Btn>
        <Btn onClick={reset} variant="ghost">Reset</Btn>
      </div>

      {/* State diagram */}
      <StateDiagram />

      {/* Queues */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <QueueBox title="NEW" hint="opprettet, ikke admittert" color="border-cyan-500/40 bg-cyan-500/5">
          {threads.filter((t) => t.state === "NEW").map((t) => (
            <ThreadChip key={t.id} t={t} actions={[{ label: "admit", onClick: () => admit(t.id) }]} />
          ))}
        </QueueBox>
        <QueueBox title="RUN (run-queue)" hint="høyest prio kjører" color="border-emerald-500/40 bg-emerald-500/5">
          {[...threads.filter((t) => t.state === "RUN")]
            .sort((a, b) => b.priority - a.priority || a.id - b.id)
            .map((t) => {
              const isRunning = current?.id === t.id;
              return (
                <ThreadChip
                  key={t.id}
                  t={t}
                  running={isRunning}
                  actions={
                    isRunning
                      ? [
                          { label: "I/O disk", onClick: () => triggerWait(t.id, "disk") },
                          { label: "I/O net", onClick: () => triggerWait(t.id, "net") },
                          { label: "preempt", onClick: () => preempt(t.id) },
                          { label: "exit", onClick: () => exit(t.id) },
                        ]
                      : [{ label: "exit", onClick: () => exit(t.id) }]
                  }
                />
              );
            })}
        </QueueBox>
        <QueueBox title="WAIT (wait-queue)" hint="venter på event" color="border-amber-500/40 bg-amber-500/5">
          {threads.filter((t) => t.state === "WAIT").map((t) => (
            <ThreadChip
              key={t.id}
              t={t}
              actions={[{ label: `${t.waitOn} complete`, onClick: () => completeWait(t.id) }]}
            />
          ))}
        </QueueBox>
        <QueueBox title="TERMINATED" hint="ferdig / drept" color="border-zinc-500/40 bg-zinc-500/5">
          {threads.filter((t) => t.state === "TERMINATED").map((t) => (
            <ThreadChip key={t.id} t={t} dim />
          ))}
        </QueueBox>
      </div>

      {/* Event log */}
      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
          Event-logg
        </div>
        <ul className="text-xs font-mono space-y-0.5 max-h-32 overflow-y-auto">
          {log.map((l, i) => (
            <li key={i} className={i === 0 ? "text-foreground" : "text-muted-foreground"}>
              {l}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ============================================================
// AUTO MODE — 10 tråder, 30 ticks
// ============================================================

function AutoMode() {
  const [maxPriority, setMaxPriority] = useState(3);
  const [timeSlice, setTimeSlice] = useState(3);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const [threads, setThreads] = useState<Thread[]>(() => makeAutoThreads(maxPriority, timeSlice));
  const [idleTicks, setIdleTicks] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalTicks = 30;

  function reset() {
    setRunning(false);
    setTick(0);
    setIdleTicks(0);
    setThreads(makeAutoThreads(maxPriority, timeSlice));
  }

  function stepOnce() {
    setTick((tk) => {
      if (tk >= totalTicks) return tk;
      return tk + 1;
    });
    setThreads((ts) => {
      let work = ts.map((t) => (t.state === "NEW" ? { ...t, state: "RUN" as State } : t));

      work = work.map((t) => {
        if (t.state === "WAIT" && t.waitRemaining > 1) {
          return { ...t, waitRemaining: t.waitRemaining - 1, ticksWaiting: t.ticksWaiting + 1 };
        }
        if (t.state === "WAIT" && t.waitRemaining <= 1) {
          return {
            ...t,
            state: "RUN" as State,
            waitOn: null,
            waitRemaining: 0,
            sliceLeft: timeSlice,
            ticksWaiting: t.ticksWaiting + 1,
          };
        }
        return t;
      });

      const next = pickNext(work);
      if (!next) {
        setIdleTicks((n) => n + 1);
        return work;
      }
      const id = next.id;
      work = work.map((t) => {
        if (t.id !== id) {
          if (t.state === "RUN") return { ...t, ticksReady: t.ticksReady + 1 };
          return t;
        }
        const newRemaining = Math.max(0, t.remaining - 1);
        const newSliceLeft = t.sliceLeft - 1;

        // sannsynlighet for I/O på denne tråden (avhenger av om den er "I/O-tung")
        const ioChance = t.label.startsWith("IO") ? 0.35 : 0.08;
        const goWait = newRemaining > 0 && Math.random() < ioChance;

        if (newRemaining === 0) {
          return { ...t, remaining: 0, sliceLeft: 0, state: "TERMINATED" as State, ticksRunning: t.ticksRunning + 1 };
        }
        if (goWait) {
          return {
            ...t,
            remaining: newRemaining,
            sliceLeft: 0,
            state: "WAIT" as State,
            waitOn: Math.random() < 0.5 ? "disk" : "net",
            waitRemaining: 2 + Math.floor(Math.random() * 4),
            ticksRunning: t.ticksRunning + 1,
          };
        }
        if (newSliceLeft <= 0) {
          return {
            ...t,
            remaining: newRemaining,
            sliceLeft: timeSlice,
            ticksRunning: t.ticksRunning + 1,
          };
        }
        return { ...t, remaining: newRemaining, sliceLeft: newSliceLeft, ticksRunning: t.ticksRunning + 1 };
      });
      return work;
    });
  }

  useEffect(() => {
    if (!running) return;
    if (tick >= totalTicks) {
      setRunning(false);
      return;
    }
    intervalRef.current = setInterval(() => stepOnce(), 220);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, tick]);

  const stats = useMemo(() => {
    const totalThreadTicksReady = threads.reduce((s, t) => s + t.ticksReady, 0);
    const nThreads = threads.length || 1;
    const avgWait = totalThreadTicksReady / nThreads;
    const cpuBusy = tick - idleTicks;
    const cpuPct = tick === 0 ? 0 : Math.round((cpuBusy / tick) * 100);
    const terminated = threads.filter((t) => t.state === "TERMINATED").length;
    return { avgWait, cpuPct, terminated, total: threads.length };
  }, [threads, tick, idleTicks]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="font-mono">
          tick {tick}/{totalTicks}
        </span>
        <label className="flex items-center gap-2">
          Prioritetsnivåer:
          <input
            type="number"
            min={1}
            max={4}
            value={maxPriority}
            onChange={(e) => setMaxPriority(Math.max(1, Math.min(4, Number(e.target.value))))}
            className="w-16 rounded border border-border bg-background px-2 py-0.5"
            disabled={tick > 0}
          />
        </label>
        <label className="flex items-center gap-2">
          Time slice:
          <input
            type="number"
            min={1}
            max={10}
            value={timeSlice}
            onChange={(e) => setTimeSlice(Math.max(1, Math.min(10, Number(e.target.value))))}
            className="w-16 rounded border border-border bg-background px-2 py-0.5"
            disabled={tick > 0}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Btn onClick={() => setRunning((r) => !r)} variant="primary">
          {running ? "⏸ Pause" : tick >= totalTicks ? "Ferdig" : "▶ Kjør auto"}
        </Btn>
        <Btn onClick={stepOnce} disabled={tick >= totalTicks}>Step 1 tick</Btn>
        <Btn onClick={reset} variant="ghost">Reset</Btn>
      </div>

      <StateDiagram />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <QueueBox title="NEW" hint="opprettet" color="border-cyan-500/40 bg-cyan-500/5">
          {threads.filter((t) => t.state === "NEW").map((t) => <ThreadChip key={t.id} t={t} />)}
        </QueueBox>
        <QueueBox title="RUN" hint="prio-ordnet" color="border-emerald-500/40 bg-emerald-500/5">
          {[...threads.filter((t) => t.state === "RUN")]
            .sort((a, b) => b.priority - a.priority || a.id - b.id)
            .map((t, i) => <ThreadChip key={t.id} t={t} running={i === 0} />)}
        </QueueBox>
        <QueueBox title="WAIT" hint="event-basert" color="border-amber-500/40 bg-amber-500/5">
          {threads.filter((t) => t.state === "WAIT").map((t) => <ThreadChip key={t.id} t={t} />)}
        </QueueBox>
        <QueueBox title="TERMINATED" hint="ferdig" color="border-zinc-500/40 bg-zinc-500/5">
          {threads.filter((t) => t.state === "TERMINATED").map((t) => <ThreadChip key={t.id} t={t} dim />)}
        </QueueBox>
      </div>

      {tick >= totalTicks && (
        <div className="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Statistikk etter {totalTicks} ticks
          </div>
          <ul className="space-y-1">
            <li><strong>CPU-bruk:</strong> {stats.cpuPct}% ({tick - idleTicks} av {tick} ticks brukt på en tråd)</li>
            <li><strong>Idle ticks:</strong> {idleTicks} (alle tråder var i wait-queue)</li>
            <li><strong>Gj.snitt ventetid (i run-queue):</strong> {stats.avgWait.toFixed(1)} ticks per tråd</li>
            <li><strong>TERMINATED:</strong> {stats.terminated}/{stats.total} tråder ferdig</li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Skru opp time slice og kjør igjen — du vil se høyere CPU-bruk (færre context-switch) men ofte høyere ventetid for høyprio-tråder.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CHALLENGE MODE
// ============================================================

function ChallengeMode() {
  const [selected, setSelected] = useState(0);
  const [guesses, setGuesses] = useState<Record<string, State>>({});
  const [showAnswer, setShowAnswer] = useState(false);

  const c = CHALLENGES[selected];

  function setGuess(label: string, s: State) {
    setGuesses((g) => ({ ...g, [label]: s }));
  }

  function reset() {
    setGuesses({});
    setShowAnswer(false);
  }

  const allCorrect = c.threads.every((t) => guesses[t.label] === c.answer[t.label]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {CHALLENGES.map((ch, i) => (
          <button
            key={ch.id}
            onClick={() => {
              setSelected(i);
              reset();
            }}
            className={`text-xs px-3 py-1.5 rounded border ${
              i === selected
                ? "bg-brand text-brand-foreground border-brand"
                : "border-border text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {ch.id.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-4">
        <h3 className="font-semibold mb-2">{c.title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
        <div className="text-xs font-mono space-y-0.5">
          {c.threads.map((t) => (
            <div key={t.label}>
              {t.label}: prio={t.priority}, burst={t.burst}
              {t.ioAt && `, I/O på tick ${t.ioAt.tick} (varer ${t.ioAt.durationTicks})`}
            </div>
          ))}
          <div className="mt-1">time slice = {c.timeSlice}, simulert for {c.ticks} ticks</div>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="text-sm font-medium mb-3">{c.question}</p>
        <div className="space-y-2">
          {c.threads.map((t) => (
            <div key={t.label} className="flex items-center gap-2 text-sm">
              <span className="font-mono w-12">{t.label}:</span>
              {(["NEW", "RUN", "WAIT", "TERMINATED"] as State[]).map((s) => {
                const isCorrect = showAnswer && c.answer[t.label] === s;
                const isWrong = showAnswer && guesses[t.label] === s && c.answer[t.label] !== s;
                return (
                  <button
                    key={s}
                    onClick={() => setGuess(t.label, s)}
                    className={`px-2 py-1 rounded border text-xs ${
                      isCorrect
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                        : isWrong
                          ? "bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400"
                          : guesses[t.label] === s
                            ? "bg-brand/20 border-brand text-foreground"
                            : "border-border text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Btn onClick={() => setShowAnswer(true)} variant="primary">Vis fasit</Btn>
          <Btn onClick={reset} variant="ghost">Tøm</Btn>
        </div>

        {showAnswer && (
          <div
            className={`mt-3 rounded p-3 text-sm ${
              allCorrect
                ? "bg-emerald-500/10 border border-emerald-500/30"
                : "bg-amber-500/10 border border-amber-500/30"
            }`}
          >
            <p className="font-medium mb-1">
              {allCorrect ? "Riktig — alle tråder korrekt plassert." : "Noen feil. Se forklaring:"}
            </p>
            <p className="text-muted-foreground">{c.explain}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SHARED UI
// ============================================================

function makeThread(
  id: number,
  label: string,
  priority: number,
  burst: number,
  colorIdx: number,
  timeSlice: number,
): Thread {
  return {
    id,
    label,
    priority,
    state: "NEW",
    remaining: burst,
    sliceLeft: timeSlice,
    waitOn: null,
    waitRemaining: 0,
    color: COLORS[colorIdx % COLORS.length],
    ticksRunning: 0,
    ticksReady: 0,
    ticksWaiting: 0,
  };
}

function makeAutoThreads(maxPriority: number, timeSlice: number): Thread[] {
  const ts: Thread[] = [];
  for (let i = 1; i <= 10; i++) {
    const isIo = i % 3 === 0;
    const label = isIo ? `IO${i}` : `T${i}`;
    const prio = 1 + Math.floor(Math.random() * maxPriority);
    const burst = 3 + Math.floor(Math.random() * 7);
    ts.push(makeThread(i, label, prio, burst, i - 1, timeSlice));
  }
  return ts;
}

function StateDiagram() {
  return (
    <div className="rounded-lg border border-border bg-background/50 p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
        State-overganger
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
        <StateNode label="NEW" colorClass="bg-cyan-500/20 border-cyan-500 text-cyan-700 dark:text-cyan-300" />
        <Arrow label="admit" />
        <StateNode label="RUN" colorClass="bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300" />
        <Arrow label="wait" />
        <StateNode label="WAIT" colorClass="bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300" />
        <Arrow label="event" reverse />
        <StateNode label="RUN" colorClass="bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300" small />
        <Arrow label="exit" />
        <StateNode label="TERMINATED" colorClass="bg-zinc-500/20 border-zinc-500 text-zinc-700 dark:text-zinc-300" />
      </div>
      <div className="text-[10px] text-muted-foreground mt-2 text-center">
        preempt: RUN → run-queue (forblir RUN) · create: ∅ → NEW
      </div>
    </div>
  );
}

function StateNode({
  label,
  colorClass,
  small,
}: {
  label: string;
  colorClass: string;
  small?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border px-2 py-1 ${colorClass} ${
        small ? "text-[10px]" : ""
      }`}
    >
      {label}
    </span>
  );
}

function Arrow({ label, reverse }: { label: string; reverse?: boolean }) {
  return (
    <span className="inline-flex flex-col items-center text-muted-foreground">
      <span className="text-[10px]">{label}</span>
      <span>{reverse ? "←" : "→"}</span>
    </span>
  );
}

function QueueBox({
  title,
  hint,
  color,
  children,
}: {
  title: string;
  hint: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg border p-3 min-h-[140px] ${color}`}>
      <div className="text-xs font-semibold mb-0.5">{title}</div>
      <div className="text-[10px] text-muted-foreground mb-2">{hint}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ThreadChip({
  t,
  running,
  dim,
  actions,
}: {
  t: Thread;
  running?: boolean;
  dim?: boolean;
  actions?: { label: string; onClick: () => void }[];
}) {
  return (
    <div
      className={`rounded border ${
        running ? "border-emerald-500 ring-2 ring-emerald-500/30" : "border-border"
      } ${dim ? "opacity-50" : ""} bg-background/60 p-1.5 text-xs`}
    >
      <div className="flex items-center gap-1.5">
        <span className={`inline-block w-2.5 h-2.5 rounded-sm ${t.color}`} />
        <span className="font-mono font-semibold">{t.label}</span>
        <span className="text-muted-foreground">p{t.priority}</span>
        {t.remaining > 0 && (
          <span className="text-muted-foreground">· {t.remaining}t</span>
        )}
        {t.waitOn && (
          <span className="text-amber-600 dark:text-amber-400">· {t.waitOn}</span>
        )}
        {running && (
          <span className="ml-auto text-[9px] uppercase font-semibold text-emerald-600 dark:text-emerald-400">
            running
          </span>
        )}
      </div>
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              className="text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Btn({
  children,
  onClick,
  variant = "default",
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "primary" | "ghost";
  disabled?: boolean;
}) {
  const cls =
    variant === "primary"
      ? "bg-brand text-brand-foreground hover:bg-brand/90"
      : variant === "ghost"
        ? "bg-transparent text-muted-foreground hover:bg-muted/50 border border-border"
        : "bg-muted hover:bg-muted/80 text-foreground";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${cls}`}
    >
      {children}
    </button>
  );
}
