import { useMemo, useState } from "react";
import { Tex } from "@/components/Tex";

/**
 * Producer-Consumer-simulator med bounded buffer + tre semaforer.
 *
 *   sem_t empty = N         // initielt: N ledige slots
 *   sem_t full  = 0         // initielt: 0 elementer
 *   sem_t mutex = 1         // gjensidig utelukkelse på buffer-aksess
 *
 *   producer():            consumer():
 *     wait(empty)            wait(full)
 *     wait(mutex)            wait(mutex)
 *     buffer.put(item)       item = buffer.get()
 *     post(mutex)            post(mutex)
 *     post(full)             post(empty)
 *
 * Simulatoren modellerer fire prosesser (2 P + 2 C) med en
 * scheduler-knapp («Steg»). I hvert steg velger vi en ikke-blokkert
 * tråd, kjører dens neste pseudo-instruksjon, og oppdaterer
 * buffer + semafor-verdier. Brukeren kan skru AV semaforene for
 * å se data-korrupsjon (overflow/underflow).
 */

const BUFFER_SIZE = 10;
const NUM_PRODUCERS = 2;
const NUM_CONSUMERS = 2;
const TOTAL_THREADS = NUM_PRODUCERS + NUM_CONSUMERS;

type Phase =
  | "idle" // not currently doing a transaction
  | "wait_full_or_empty" // about to call wait(empty)/wait(full)
  | "wait_mutex" // got the slot-semafor, now needs mutex
  | "act" // in critical section, about to put/get
  | "post_mutex" // released mutex, about to signal full/empty
  | "done"; // posted complementary semafor, ready to loop

type Thread = {
  id: number;
  kind: "P" | "C";
  /** Pseudo-instruction pointer. */
  phase: Phase;
  /** Items produced/consumed by this thread (stat). */
  count: number;
  /** Last produced value (producers) or consumed value (consumers). */
  lastValue: number | null;
};

type LogEntry = {
  t: number;
  thread: number;
  text: string;
  level: "info" | "good" | "bad";
};

type State = {
  buffer: (number | null)[];
  /** Indices used as a FIFO queue. */
  head: number; // consumer reads here
  tail: number; // producer writes here
  fillCount: number;
  /** Semafor values (can go negative for blocked count). */
  empty: number;
  full: number;
  mutex: number;
  /** Wait queues per semafor (thread ids). */
  qEmpty: number[];
  qFull: number[];
  qMutex: number[];
  threads: Thread[];
  /** Strictly-increasing producer counter (item id we'll write). */
  nextItem: number;
  log: LogEntry[];
  errors: string[];
  step: number;
};

function initialState(): State {
  const threads: Thread[] = [];
  for (let i = 0; i < NUM_PRODUCERS; i++) {
    threads.push({
      id: i,
      kind: "P",
      phase: "wait_full_or_empty",
      count: 0,
      lastValue: null,
    });
  }
  for (let i = 0; i < NUM_CONSUMERS; i++) {
    threads.push({
      id: NUM_PRODUCERS + i,
      kind: "C",
      phase: "wait_full_or_empty",
      count: 0,
      lastValue: null,
    });
  }
  return {
    buffer: Array.from({ length: BUFFER_SIZE }, () => null),
    head: 0,
    tail: 0,
    fillCount: 0,
    empty: BUFFER_SIZE,
    full: 0,
    mutex: 1,
    qEmpty: [],
    qFull: [],
    qMutex: [],
    threads,
    nextItem: 1,
    log: [],
    errors: [],
    step: 0,
  };
}

function pushLog(s: State, thread: number, text: string, level: LogEntry["level"] = "info") {
  s.log.push({ t: s.step, thread, text, level });
  // Trim log to last 30
  if (s.log.length > 30) s.log = s.log.slice(s.log.length - 30);
}

/** Pick a runnable thread (round-robin starting after lastRunnable). */
function pickRunnable(s: State, useSemaphores: boolean): Thread | null {
  // Build candidate list: not blocked.
  const blocked = new Set<number>([...s.qEmpty, ...s.qFull, ...s.qMutex]);
  for (const t of s.threads) {
    if (blocked.has(t.id)) continue;
    // Skip threads in 'done' until they're reset to 'wait_full_or_empty'
    // (we reset at the end of advance()).
    if (t.phase === "idle" || t.phase === "done") continue;
    // Special case for no-semaphore mode: threads in wait_* phases still
    // run, they just skip the wait.
    return t;
  }
  // No one runnable. Maybe everyone is in 'done' — reset them.
  for (const t of s.threads) {
    if (t.phase === "done") {
      t.phase = "wait_full_or_empty";
      return t;
    }
  }
  // Truly stuck (deadlock).
  void useSemaphores;
  return null;
}

/**
 * Advance the simulation by one pseudo-instruction.
 * Returns true if anything happened, false if deadlocked.
 */
function advance(s: State, useSemaphores: boolean): boolean {
  s.step++;
  const t = pickRunnable(s, useSemaphores);
  if (!t) {
    pushLog(s, -1, "Ingen runnable — deadlock eller alle ferdige.", "bad");
    return false;
  }

  if (t.kind === "P") {
    // Producer state machine
    if (t.phase === "wait_full_or_empty") {
      if (useSemaphores) {
        s.empty--;
        if (s.empty < 0) {
          s.qEmpty.push(t.id);
          pushLog(s, t.id, `wait(empty) — blokkert (empty=${s.empty})`, "info");
          return true;
        }
        pushLog(s, t.id, `wait(empty) → empty=${s.empty}`, "info");
      } else {
        pushLog(s, t.id, "(uten empty) hopp over wait", "bad");
      }
      t.phase = "wait_mutex";
      return true;
    }
    if (t.phase === "wait_mutex") {
      if (useSemaphores) {
        s.mutex--;
        if (s.mutex < 0) {
          s.qMutex.push(t.id);
          pushLog(s, t.id, "wait(mutex) — blokkert", "info");
          return true;
        }
        pushLog(s, t.id, "wait(mutex) — fikk lås", "info");
      }
      t.phase = "act";
      return true;
    }
    if (t.phase === "act") {
      const item = s.nextItem++;
      t.lastValue = item;
      if (s.fillCount >= BUFFER_SIZE) {
        // Overflow with semaforer disabled.
        const err = `buffer overflow! P${t.id} forsøkte å skrive item ${item} men bufferet er fullt.`;
        s.errors.push(err);
        pushLog(s, t.id, err, "bad");
      } else {
        s.buffer[s.tail] = item;
        s.tail = (s.tail + 1) % BUFFER_SIZE;
        s.fillCount++;
        pushLog(s, t.id, `put(${item}) — buffer ${s.fillCount}/${BUFFER_SIZE}`, "good");
      }
      t.count++;
      t.phase = "post_mutex";
      return true;
    }
    if (t.phase === "post_mutex") {
      if (useSemaphores) {
        // Release mutex; if anyone waiting, wake oldest.
        s.mutex++;
        if (s.qMutex.length > 0) {
          const woken = s.qMutex.shift()!;
          pushLog(s, t.id, `post(mutex) → vekker thread #${woken}`, "info");
        } else {
          pushLog(s, t.id, "post(mutex)", "info");
        }
      }
      // Now post(full).
      if (useSemaphores) {
        s.full++;
        if (s.qFull.length > 0) {
          const woken = s.qFull.shift()!;
          pushLog(s, t.id, `post(full) → vekker thread #${woken}`, "info");
        } else {
          pushLog(s, t.id, `post(full) → full=${s.full}`, "info");
        }
      }
      t.phase = "done";
      return true;
    }
  } else {
    // Consumer state machine
    if (t.phase === "wait_full_or_empty") {
      if (useSemaphores) {
        s.full--;
        if (s.full < 0) {
          s.qFull.push(t.id);
          pushLog(s, t.id, `wait(full) — blokkert (full=${s.full})`, "info");
          return true;
        }
        pushLog(s, t.id, `wait(full) → full=${s.full}`, "info");
      } else {
        pushLog(s, t.id, "(uten full) hopp over wait", "bad");
      }
      t.phase = "wait_mutex";
      return true;
    }
    if (t.phase === "wait_mutex") {
      if (useSemaphores) {
        s.mutex--;
        if (s.mutex < 0) {
          s.qMutex.push(t.id);
          pushLog(s, t.id, "wait(mutex) — blokkert", "info");
          return true;
        }
        pushLog(s, t.id, "wait(mutex) — fikk lås", "info");
      }
      t.phase = "act";
      return true;
    }
    if (t.phase === "act") {
      if (s.fillCount === 0) {
        const err = `buffer underflow! C${t.id} forsøkte å lese fra tomt buffer.`;
        s.errors.push(err);
        pushLog(s, t.id, err, "bad");
        t.lastValue = null;
      } else {
        const item = s.buffer[s.head];
        s.buffer[s.head] = null;
        s.head = (s.head + 1) % BUFFER_SIZE;
        s.fillCount--;
        t.lastValue = item;
        pushLog(
          s,
          t.id,
          `get(${item}) — buffer ${s.fillCount}/${BUFFER_SIZE}`,
          "good",
        );
      }
      t.count++;
      t.phase = "post_mutex";
      return true;
    }
    if (t.phase === "post_mutex") {
      if (useSemaphores) {
        s.mutex++;
        if (s.qMutex.length > 0) {
          const woken = s.qMutex.shift()!;
          pushLog(s, t.id, `post(mutex) → vekker thread #${woken}`, "info");
        } else {
          pushLog(s, t.id, "post(mutex)", "info");
        }
      }
      if (useSemaphores) {
        s.empty++;
        if (s.qEmpty.length > 0) {
          const woken = s.qEmpty.shift()!;
          pushLog(s, t.id, `post(empty) → vekker thread #${woken}`, "info");
        } else {
          pushLog(s, t.id, `post(empty) → empty=${s.empty}`, "info");
        }
      }
      t.phase = "done";
      return true;
    }
  }
  return false;
}

/** Deep clone for state immutability before mutating. */
function cloneState(s: State): State {
  return {
    buffer: s.buffer.slice(),
    head: s.head,
    tail: s.tail,
    fillCount: s.fillCount,
    empty: s.empty,
    full: s.full,
    mutex: s.mutex,
    qEmpty: s.qEmpty.slice(),
    qFull: s.qFull.slice(),
    qMutex: s.qMutex.slice(),
    threads: s.threads.map((t) => ({ ...t })),
    nextItem: s.nextItem,
    log: s.log.slice(),
    errors: s.errors.slice(),
    step: s.step,
  };
}

function colorForThread(t: Thread): string {
  if (t.kind === "P") {
    return t.id === 0 ? "text-emerald-500" : "text-teal-500";
  }
  return t.id === NUM_PRODUCERS ? "text-sky-500" : "text-indigo-500";
}

function bgForThread(t: Thread): string {
  if (t.kind === "P") {
    return t.id === 0
      ? "bg-emerald-500/10 border-emerald-500/40"
      : "bg-teal-500/10 border-teal-500/40";
  }
  return t.id === NUM_PRODUCERS
    ? "bg-sky-500/10 border-sky-500/40"
    : "bg-indigo-500/10 border-indigo-500/40";
}

function phaseLabel(t: Thread): string {
  switch (t.phase) {
    case "idle":
    case "wait_full_or_empty":
      return t.kind === "P" ? "vil wait(empty)" : "vil wait(full)";
    case "wait_mutex":
      return "vil wait(mutex)";
    case "act":
      return t.kind === "P" ? "put(item)" : "get(item)";
    case "post_mutex":
      return "post(mutex) + post(...)";
    case "done":
      return "klar for ny runde";
  }
}

export function ProducerConsumerSim() {
  const [state, setState] = useState<State>(() => initialState());
  const [useSemaphores, setUseSemaphores] = useState(true);

  function doStep() {
    setState((prev) => {
      const next = cloneState(prev);
      advance(next, useSemaphores);
      return next;
    });
  }

  function doMany(n: number) {
    setState((prev) => {
      let s = cloneState(prev);
      for (let i = 0; i < n; i++) {
        const ok = advance(s, useSemaphores);
        if (!ok) break;
      }
      return s;
    });
  }

  function reset() {
    setState(initialState());
  }

  const blockedSet = useMemo(() => {
    return new Set<number>([
      ...state.qEmpty,
      ...state.qFull,
      ...state.qMutex,
    ]);
  }, [state.qEmpty, state.qFull, state.qMutex]);

  // Compute buffer slot positions for SVG.
  const slotW = 36;
  const slotH = 36;
  const gap = 4;
  const totalW = BUFFER_SIZE * slotW + (BUFFER_SIZE - 1) * gap;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <label className="text-xs flex items-center gap-2">
          <input
            type="checkbox"
            checked={useSemaphores}
            onChange={(e) => setUseSemaphores(e.target.checked)}
            className="accent-brand"
          />
          <span className="text-foreground">Bruk semaforer (riktig kode)</span>
        </label>
        <div className="ml-auto flex gap-1.5">
          <button
            type="button"
            onClick={doStep}
            className="text-xs rounded-md border border-brand bg-brand/10 px-3 py-1.5 hover:bg-brand/20"
          >
            Steg
          </button>
          <button
            type="button"
            onClick={() => doMany(5)}
            className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted"
          >
            +5 steg
          </button>
          <button
            type="button"
            onClick={() => doMany(20)}
            className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted"
          >
            +20 steg
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

      {/* Buffer */}
      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-2">
          Buffer ({state.fillCount} / {BUFFER_SIZE} fylt). head → consumer,
          tail ← producer.
        </div>
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${totalW + 20} 80`}
            className="max-w-full"
            style={{ minWidth: 400, maxWidth: totalW + 20 }}
            role="img"
            aria-label="Bounded buffer med head- og tail-pekere"
          >
            {state.buffer.map((v, i) => {
              const x = 10 + i * (slotW + gap);
              // Determine fill state.
              // A slot has a value iff v !== null.
              const filled = v !== null;
              const isHead = state.fillCount > 0 && i === state.head;
              const isTail = i === state.tail;
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={28}
                    width={slotW}
                    height={slotH}
                    rx={4}
                    className={
                      filled
                        ? "fill-emerald-500/25 stroke-emerald-500"
                        : "fill-muted stroke-border"
                    }
                    strokeWidth={1.5}
                  />
                  <text
                    x={x + slotW / 2}
                    y={28 + slotH / 2 + 4}
                    textAnchor="middle"
                    className={
                      filled
                        ? "fill-emerald-700 dark:fill-emerald-300 text-[11px] font-mono font-semibold"
                        : "fill-muted-foreground text-[11px] font-mono"
                    }
                  >
                    {filled ? v : "∅"}
                  </text>
                  <text
                    x={x + slotW / 2}
                    y={22}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[8px] font-mono"
                  >
                    {i}
                  </text>
                  {isHead && (
                    <text
                      x={x + slotW / 2}
                      y={76}
                      textAnchor="middle"
                      className="fill-sky-500 text-[9px] font-semibold"
                    >
                      ▲ head
                    </text>
                  )}
                  {isTail && (
                    <text
                      x={x + slotW / 2}
                      y={isHead ? 76 - 10 : 76}
                      textAnchor="middle"
                      className="fill-emerald-500 text-[9px] font-semibold"
                    >
                      ▲ tail
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Semaphore values + queues */}
      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <SemCard
          name="empty"
          value={state.empty}
          init={BUFFER_SIZE}
          color="emerald"
          queue={state.qEmpty}
          desc="ledige slots — producer venter når 0"
          active={useSemaphores}
        />
        <SemCard
          name="full"
          value={state.full}
          init={0}
          color="sky"
          queue={state.qFull}
          desc="elementer i buffer — consumer venter når 0"
          active={useSemaphores}
        />
        <SemCard
          name="mutex"
          value={state.mutex}
          init={1}
          color="violet"
          queue={state.qMutex}
          desc="ekslusiv buffer-aksess (binær)"
          active={useSemaphores}
        />
      </div>

      {/* Threads */}
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        {state.threads.map((t) => {
          const blocked = blockedSet.has(t.id);
          return (
            <div
              key={t.id}
              className={`rounded-lg border p-3 ${bgForThread(t)} ${
                blocked ? "opacity-60" : ""
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <div className={`text-sm font-semibold ${colorForThread(t)}`}>
                  {t.kind === "P" ? "Producer " : "Consumer "}#{t.id}
                </div>
                <div className="text-[10px] font-mono opacity-70">
                  {t.count} {t.kind === "P" ? "produsert" : "konsumert"}
                </div>
              </div>
              <div className="text-xs text-foreground font-mono">
                {phaseLabel(t)}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {blocked ? "blokkert i kø" : "klar til å kjøre"}
                {t.lastValue !== null &&
                  ` · sist ${t.kind === "P" ? "skrev" : "leste"} ${t.lastValue}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Errors */}
      {state.errors.length > 0 && (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 mb-4">
          <div className="text-xs font-semibold text-rose-600 dark:text-rose-300 mb-1">
            {state.errors.length} datastruktur-feil oppdaget
          </div>
          <ul className="text-[11px] text-rose-700 dark:text-rose-200 space-y-0.5 font-mono">
            {state.errors.slice(-4).map((err, i) => (
              <li key={i}>· {err}</li>
            ))}
          </ul>
          <div className="text-[10px] text-muted-foreground mt-2">
            Disse oppstår KUN når semaforer er av. Skru på «Bruk semaforer» og
            reset for å se hvordan empty/full beskytter buffer.
          </div>
        </div>
      )}

      {/* Log */}
      <details className="rounded-md border border-border bg-background p-3" open>
        <summary className="text-xs text-muted-foreground cursor-pointer font-semibold">
          Hendelseslogg ({state.log.length}) — steg {state.step}
        </summary>
        <div className="mt-2 font-mono text-[11px] space-y-0.5 max-h-48 overflow-y-auto">
          {state.log.length === 0 ? (
            <div className="text-muted-foreground italic">
              Klikk «Steg» for å starte.
            </div>
          ) : (
            state.log.map((l, i) => (
              <div
                key={i}
                className={
                  l.level === "bad"
                    ? "text-rose-500"
                    : l.level === "good"
                      ? "text-emerald-500"
                      : "text-muted-foreground"
                }
              >
                <span className="opacity-50">t={l.t}</span>{" "}
                {l.thread >= 0 && (
                  <span className="text-foreground">
                    [
                    {state.threads[l.thread]?.kind}
                    {l.thread}]
                  </span>
                )}{" "}
                {l.text}
              </div>
            ))
          )}
        </div>
      </details>

      <div className="mt-4 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs">
        <div className="font-semibold mb-1">Pseudokode</div>
        <pre className="font-mono text-[11px] whitespace-pre overflow-x-auto">{`sem_t empty = ${BUFFER_SIZE};   // ledige slots
sem_t full  = 0;    // produserte elementer
sem_t mutex = 1;    // bufferlås

producer():            consumer():
  wait(empty)            wait(full)
  wait(mutex)            wait(mutex)
  buffer.put(item)       item = buffer.get()
  post(mutex)            post(mutex)
  post(full)             post(empty)`}</pre>
        <div className="mt-2 text-muted-foreground">
          Merk: <Tex>{"\\texttt{empty} + \\texttt{full} = N"}</Tex> til enhver
          tid (når ingen er i kritisk seksjon). Det er invariant nummer én du
          kan bruke til å verifisere koden din.
        </div>
      </div>
    </div>
  );
}

function SemCard({
  name,
  value,
  init,
  color,
  queue,
  desc,
  active,
}: {
  name: string;
  value: number;
  init: number;
  color: "emerald" | "sky" | "violet";
  queue: number[];
  desc: string;
  active: boolean;
}) {
  const colorMap = {
    emerald:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    sky: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    violet:
      "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  };
  return (
    <div
      className={`rounded-lg border p-3 ${active ? colorMap[color] : "border-border bg-muted/20 text-muted-foreground"}`}
    >
      <div className="flex justify-between items-baseline">
        <div className="font-mono font-semibold text-sm">{name}</div>
        <div className="text-[10px] opacity-70">init={init}</div>
      </div>
      <div className="font-mono text-2xl mt-1">
        {active ? value : "—"}
      </div>
      <div className="text-[10px] opacity-70 mt-1">{desc}</div>
      <div className="text-[10px] mt-2">
        <span className="opacity-70">ventekø:</span>{" "}
        <span className="font-mono">
          {queue.length === 0 ? "[]" : `[${queue.join(", ")}]`}
        </span>
      </div>
    </div>
  );
}
