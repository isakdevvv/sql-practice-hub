import { useEffect, useMemo, useState } from "react";

// Two threads each run: read counter -> add 1 -> write counter.
// The user controls the global execution order (a permutation of the 6 ops,
// stable within each thread) and we simulate the visible counter value.
// Locks change the *visibility* — operations between lock() and unlock() of
// the other thread are *blocked* and forced to wait.

type OpKind = "read" | "add" | "write" | "lock" | "unlock";
type Thread = "A" | "B";

type Op = {
  id: string;
  thread: Thread;
  kind: OpKind;
  label: string;
};

const OPS_NO_LOCK: Op[] = [
  { id: "A1", thread: "A", kind: "read", label: "tmp_A = counter" },
  { id: "A2", thread: "A", kind: "add", label: "tmp_A = tmp_A + 1" },
  { id: "A3", thread: "A", kind: "write", label: "counter = tmp_A" },
  { id: "B1", thread: "B", kind: "read", label: "tmp_B = counter" },
  { id: "B2", thread: "B", kind: "add", label: "tmp_B = tmp_B + 1" },
  { id: "B3", thread: "B", kind: "write", label: "counter = tmp_B" },
];

const OPS_LOCKED: Op[] = [
  { id: "AL", thread: "A", kind: "lock", label: "lock(m)" },
  { id: "A1", thread: "A", kind: "read", label: "tmp_A = counter" },
  { id: "A2", thread: "A", kind: "add", label: "tmp_A = tmp_A + 1" },
  { id: "A3", thread: "A", kind: "write", label: "counter = tmp_A" },
  { id: "AU", thread: "A", kind: "unlock", label: "unlock(m)" },
  { id: "BL", thread: "B", kind: "lock", label: "lock(m)" },
  { id: "B1", thread: "B", kind: "read", label: "tmp_B = counter" },
  { id: "B2", thread: "B", kind: "add", label: "tmp_B = tmp_B + 1" },
  { id: "B3", thread: "B", kind: "write", label: "counter = tmp_B" },
  { id: "BU", thread: "B", kind: "unlock", label: "unlock(m)" },
];

// A scenario is a list of op-ids representing the global order chosen by the user.
// We always include every op exactly once but in some order. We default to a
// known-race order when locks are off, and the lock-honoring order when on.

const DEFAULT_RACE_ORDER = ["A1", "B1", "A2", "B2", "A3", "B3"];
const DEFAULT_SAFE_ORDER = ["A1", "A2", "A3", "B1", "B2", "B3"];
const DEFAULT_LOCKED_ORDER = ["AL", "A1", "A2", "A3", "AU", "BL", "B1", "B2", "B3", "BU"];

type StepResult = {
  op: Op;
  ok: boolean; // false if attempted while locked by other
  tmpA: number | null;
  tmpB: number | null;
  counter: number;
  locked: Thread | null;
  note?: string;
};

function simulate(order: string[], opsTable: Op[]): { steps: StepResult[]; final: number; valid: boolean; reasonInvalid?: string } {
  const byId: Record<string, Op> = Object.fromEntries(opsTable.map((o) => [o.id, o]));
  let counter = 0;
  let tmpA: number | null = null;
  let tmpB: number | null = null;
  let locked: Thread | null = null;
  const steps: StepResult[] = [];

  // Within-thread order constraint: we require that ops of thread X stay in their
  // listed order. Validate that here.
  const positionsByThread: Record<Thread, number[]> = { A: [], B: [] };
  for (let i = 0; i < order.length; i++) {
    const op = byId[order[i]];
    if (!op) return { steps: [], final: 0, valid: false, reasonInvalid: "Ukjent op-id" };
    positionsByThread[op.thread].push(i);
  }
  for (const t of ["A", "B"] as Thread[]) {
    const expected = opsTable.filter((o) => o.thread === t).map((o) => o.id);
    let cursor = 0;
    for (const opId of order) {
      if (byId[opId].thread !== t) continue;
      if (opId !== expected[cursor]) {
        return {
          steps: [],
          final: 0,
          valid: false,
          reasonInvalid: `Tråd ${t} må kjøre operasjonene i sin egen rekkefølge.`,
        };
      }
      cursor++;
    }
  }

  for (const id of order) {
    const op = byId[id];
    if (op.kind === "lock") {
      if (locked && locked !== op.thread) {
        // Cannot proceed; mark blocked.
        steps.push({
          op,
          ok: false,
          tmpA,
          tmpB,
          counter,
          locked,
          note: `Tråd ${op.thread} blokkeres — tråd ${locked} holder låsen.`,
        });
        continue;
      }
      locked = op.thread;
      steps.push({ op, ok: true, tmpA, tmpB, counter, locked, note: `Tråd ${op.thread} tar låsen.` });
      continue;
    }
    if (op.kind === "unlock") {
      locked = null;
      steps.push({ op, ok: true, tmpA, tmpB, counter, locked, note: `Tråd ${op.thread} slipper låsen.` });
      continue;
    }
    // For data ops: if the lock is held by the OTHER thread, the op is blocked.
    if (locked && locked !== op.thread) {
      steps.push({
        op,
        ok: false,
        tmpA,
        tmpB,
        counter,
        locked,
        note: `Tråd ${op.thread} prøver å kjøre, men tråd ${locked} har låsen.`,
      });
      continue;
    }
    if (op.kind === "read") {
      if (op.thread === "A") tmpA = counter;
      else tmpB = counter;
      steps.push({ op, ok: true, tmpA, tmpB, counter, locked });
    } else if (op.kind === "add") {
      if (op.thread === "A") tmpA = (tmpA ?? 0) + 1;
      else tmpB = (tmpB ?? 0) + 1;
      steps.push({ op, ok: true, tmpA, tmpB, counter, locked });
    } else if (op.kind === "write") {
      if (op.thread === "A" && tmpA !== null) counter = tmpA;
      else if (op.thread === "B" && tmpB !== null) counter = tmpB;
      steps.push({ op, ok: true, tmpA, tmpB, counter, locked });
    }
  }
  return { steps, final: counter, valid: true };
}

export function ConcurrencyTimeline() {
  const [useLock, setUseLock] = useState(false);
  const [order, setOrder] = useState<string[]>(DEFAULT_RACE_ORDER);
  const [activeStep, setActiveStep] = useState(0);

  const opsTable = useLock ? OPS_LOCKED : OPS_NO_LOCK;

  // Reset to a sensible default order when toggle changes.
  useEffect(() => {
    setOrder(useLock ? DEFAULT_LOCKED_ORDER : DEFAULT_RACE_ORDER);
    setActiveStep(0);
  }, [useLock]);

  const sim = useMemo(() => simulate(order, opsTable), [order, opsTable]);

  function moveStep(idx: number, delta: number) {
    const newIdx = idx + delta;
    if (newIdx < 0 || newIdx >= order.length) return;
    const next = order.slice();
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    const test = simulate(next, opsTable);
    if (!test.valid) return; // disallow reorder that violates per-thread order
    setOrder(next);
  }

  function resetRace() {
    setOrder(DEFAULT_RACE_ORDER);
    setUseLock(false);
    setActiveStep(0);
  }
  function resetSafe() {
    setOrder(DEFAULT_SAFE_ORDER);
    setUseLock(false);
    setActiveStep(0);
  }

  // Track which ops in the order belong to thread A vs B for the timeline visual.
  const visibleStep = sim.steps[Math.min(activeStep, sim.steps.length - 1)];

  const expectedFinal = 2;
  const race = !useLock && sim.final !== expectedFinal;
  const safe = useLock && sim.final === expectedFinal;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Race condition + lock — flytt på rekkefølgen
        </div>
        <div className="flex gap-1.5 items-center">
          <label className="text-xs flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={useLock}
              onChange={(e) => setUseLock(e.target.checked)}
              className="accent-brand"
            />
            Lås på (mutex m)
          </label>
          <button
            type="button"
            onClick={resetRace}
            className="text-xs rounded-md border border-border bg-background px-2.5 py-1 text-muted-foreground hover:border-brand/40"
          >
            Race-default
          </button>
          <button
            type="button"
            onClick={resetSafe}
            className="text-xs rounded-md border border-border bg-background px-2.5 py-1 text-muted-foreground hover:border-brand/40"
          >
            Trygg sekvens
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_240px]">
        <div className="p-3 bg-background">
          {/* Timeline ladder: each row is a step (time) */}
          <div className="space-y-1">
            <div className="grid grid-cols-[40px_1fr_1fr_80px] text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              <div>#</div>
              <div className="text-center">Tråd A</div>
              <div className="text-center">Tråd B</div>
              <div className="text-right">counter</div>
            </div>
            {sim.steps.map((step, i) => {
              const isActive = i === activeStep;
              const isA = step.op.thread === "A";
              const cell = (
                <button
                  type="button"
                  onClick={() => setActiveStep(i)}
                  className={`block w-full text-left font-mono text-[11px] rounded-sm border px-1.5 py-0.5 transition-colors ${
                    isActive
                      ? "border-brand bg-brand/10 text-brand"
                      : step.ok
                        ? step.op.kind === "lock" || step.op.kind === "unlock"
                          ? "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-300"
                          : "border-border bg-card text-foreground"
                        : "border-rose-500/40 bg-rose-500/5 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  {step.op.label}
                  {!step.ok ? " · ⏸ blokkert" : ""}
                </button>
              );
              return (
                <div key={i} className="grid grid-cols-[40px_1fr_1fr_80px] items-center gap-1.5">
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {i + 1}
                    <span className="ml-1 inline-flex flex-col">
                      <button
                        type="button"
                        onClick={() => moveStep(i, -1)}
                        className="text-[8px] leading-none hover:text-brand"
                        aria-label="Flytt opp"
                        disabled={i === 0}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStep(i, 1)}
                        className="text-[8px] leading-none hover:text-brand"
                        aria-label="Flytt ned"
                        disabled={i === sim.steps.length - 1}
                      >
                        ▼
                      </button>
                    </span>
                  </div>
                  <div>{isA ? cell : <div className="text-[10px] text-center text-muted-foreground/30">·</div>}</div>
                  <div>{!isA ? cell : <div className="text-[10px] text-center text-muted-foreground/30">·</div>}</div>
                  <div className="text-right font-mono text-[11px]">
                    {step.ok ? step.counter : <span className="text-muted-foreground">—</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="border-t md:border-t-0 md:border-l border-border bg-background p-4 text-xs space-y-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Trinn {activeStep + 1}
            </div>
            {visibleStep ? (
              <div className="rounded-md border border-border bg-muted/20 p-2 text-[11px] font-mono space-y-0.5">
                <div>tmp_A = {visibleStep.tmpA === null ? "—" : visibleStep.tmpA}</div>
                <div>tmp_B = {visibleStep.tmpB === null ? "—" : visibleStep.tmpB}</div>
                <div>counter = {visibleStep.counter}</div>
                {visibleStep.locked ? (
                  <div className="text-amber-600 dark:text-amber-400">lås: tråd {visibleStep.locked}</div>
                ) : null}
              </div>
            ) : null}
            {visibleStep?.note ? (
              <div className="mt-1 text-[11px] text-muted-foreground">{visibleStep.note}</div>
            ) : null}
          </div>

          <div className="rounded-md border border-border bg-muted/20 p-2 text-[11px]">
            <div className="font-semibold mb-1">Resultat</div>
            <div className="font-mono">Forventet: {expectedFinal}</div>
            <div className="font-mono">
              Faktisk:{" "}
              <span
                className={
                  sim.final === expectedFinal
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }
              >
                {sim.final}
              </span>
            </div>
            {race ? (
              <div className="mt-1 text-rose-600 dark:text-rose-400">
                ← race! Begge trådene leste counter=0, addet hver for seg, og
                skrev tilbake 1. Den siste write «vant».
              </div>
            ) : null}
            {safe ? (
              <div className="mt-1 text-emerald-600 dark:text-emerald-400">
                ✓ lock virker — atomisk hele veien fra read til write.
              </div>
            ) : null}
            {!useLock && !race ? (
              <div className="mt-1 text-emerald-600 dark:text-emerald-400">
                ✓ heldigvis ingen overlapp denne gangen — men avhenger av flaks.
              </div>
            ) : null}
          </div>

          <div className="rounded-md border border-brand/30 bg-brand/5 p-2 text-[11px] leading-relaxed">
            <span className="font-semibold">Eksperiment:</span> Slå{" "}
            <em>Lås på</em>, og prøv å flette en B-operasjon mellom A1 og A3.
            Du vil se B blokkeres — pilene står stille til A låser opp.
          </div>
        </aside>
      </div>
    </div>
  );
}
