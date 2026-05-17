import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Lock,
  ShieldCheck,
  Database,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import {
  applyOp,
  describeLock,
  initialEngine,
  opLabel,
  prettyIso,
  resolveDeadlock,
  viewForTx,
  type EngineState,
  type IsolationLevel,
  type Op,
  type TxId,
} from "./txEngine";

// ---------------------------------------------------------------------------
// ConcurrentTransactionSim
//
// Hovedkomponenten i lesjonen. To kolonner (A og B), brukeren velger
// isolation level, og kjører steg manuelt for hver tx. Database-state vises i
// midten. Anomalier highlightes når de oppstår.
// ---------------------------------------------------------------------------

const OPS_FOR_TX: { label: string; build: () => Op }[] = [
  { label: "BEGIN", build: () => ({ kind: "BEGIN" }) },
  { label: "SELECT id=1", build: () => ({ kind: "SELECT_ONE", rowId: 1 }) },
  { label: "SELECT id=2", build: () => ({ kind: "SELECT_ONE", rowId: 2 }) },
  { label: "SELECT id=3", build: () => ({ kind: "SELECT_ONE", rowId: 3 }) },
  {
    label: "SELECT range 400-1200",
    build: () => ({ kind: "SELECT_RANGE", minSaldo: 400, maxSaldo: 1200 }),
  },
  {
    label: "UPDATE id=1 saldo=0",
    build: () => ({ kind: "UPDATE", rowId: 1, newSaldo: 0 }),
  },
  {
    label: "UPDATE id=1 saldo+200",
    build: () => ({ kind: "UPDATE", rowId: 1, newSaldo: 1200 }),
  },
  {
    label: "UPDATE id=2 saldo=800",
    build: () => ({ kind: "UPDATE", rowId: 2, newSaldo: 800 }),
  },
  {
    label: "INSERT id=4 saldo=600",
    build: () => ({ kind: "INSERT", rowId: 4, saldo: 600 }),
  },
  { label: "COMMIT", build: () => ({ kind: "COMMIT" }) },
  { label: "ROLLBACK", build: () => ({ kind: "ROLLBACK" }) },
];

export type ConcurrentTransactionSimProps = {
  /** Brukes av AnomalyDemoPresets for å laste inn et scenario. */
  initialIsolation?: IsolationLevel;
  /** Sekvens å spille av automatisk på mount (preset). Tuples: [tx, op]. */
  scriptedOps?: { who: TxId; op: Op }[];
  /** Vist over UI. */
  headerNote?: string;
};

export function ConcurrentTransactionSim({
  initialIsolation = "READ_COMMITTED",
  scriptedOps,
  headerNote,
}: ConcurrentTransactionSimProps) {
  const [isolation, setIsolation] = useState<IsolationLevel>(initialIsolation);
  const [state, setState] = useState<EngineState>(() => {
    let s = initialEngine({ isolation: initialIsolation });
    if (scriptedOps) {
      for (const step of scriptedOps) {
        s = applyOp(s, step.who, step.op);
      }
    }
    return s;
  });

  function runOp(who: TxId, op: Op) {
    setState((prev) => applyOp(prev, who, op));
  }

  function reset(newIso?: IsolationLevel) {
    const iso = newIso ?? isolation;
    setIsolation(iso);
    setState(initialEngine({ isolation: iso }));
  }

  function changeIsolation(iso: IsolationLevel) {
    reset(iso);
  }

  // ---- derived view data
  const committed = state.committed;
  const viewA = useMemo(() => viewForTx(state, "A"), [state]);
  const viewB = useMemo(() => viewForTx(state, "B"), [state]);

  const lastAnomalyTick = state.anomalies.length
    ? state.anomalies[state.anomalies.length - 1].tick
    : -1;
  const recentAnomalies = state.anomalies.filter((a) => a.tick >= lastAnomalyTick - 1);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      {headerNote ? (
        <div className="mb-3 rounded-lg border border-brand/40 bg-brand/5 p-3 text-xs sm:text-sm">
          {headerNote}
        </div>
      ) : null}

      {/* Isolation level picker */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Isolation level
        </span>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              "READ_UNCOMMITTED",
              "READ_COMMITTED",
              "REPEATABLE_READ",
              "SERIALIZABLE",
            ] as IsolationLevel[]
          ).map((iso) => (
            <button
              key={iso}
              type="button"
              onClick={() => changeIsolation(iso)}
              className={`text-[11px] rounded-md border px-2.5 py-1 font-mono transition-colors ${
                iso === isolation
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              {prettyIso(iso)}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => reset()}
          className="ml-auto text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted flex items-center gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      {/* Deadlock banner */}
      {state.deadlock && (
        <div className="mb-4 rounded-lg border border-rose-500/50 bg-rose-500/10 p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <span className="text-sm font-semibold text-rose-700 dark:text-rose-200">
              DEADLOCK detektert
            </span>
          </div>
          <p className="text-xs text-rose-700 dark:text-rose-200 mb-2">
            A og B venter på hverandre. DB må velge én som offer (typisk yngste eller minst dyre).
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setState((p) => resolveDeadlock(p, "A"))}
              className="text-xs rounded-md border border-rose-500 bg-rose-500/20 px-3 py-1.5 hover:bg-rose-500/30"
            >
              Offer: abort A
            </button>
            <button
              type="button"
              onClick={() => setState((p) => resolveDeadlock(p, "B"))}
              className="text-xs rounded-md border border-rose-500 bg-rose-500/20 px-3 py-1.5 hover:bg-rose-500/30"
            >
              Offer: abort B
            </button>
          </div>
        </div>
      )}

      {/* Three columns: A | DB | B */}
      <div className="grid lg:grid-cols-[1fr_minmax(220px,320px)_1fr] gap-4">
        <TxColumn
          who="A"
          state={state}
          view={viewA}
          runOp={runOp}
        />
        <DbColumn state={state} committed={committed} />
        <TxColumn
          who="B"
          state={state}
          view={viewB}
          runOp={runOp}
        />
      </div>

      {/* Anomaly callouts */}
      {recentAnomalies.length > 0 && (
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          {recentAnomalies.slice(-2).map((a, i) => (
            <div
              key={`${a.tick}-${i}`}
              className="rounded-lg border border-rose-500/50 bg-rose-500/10 p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                <span className="text-[11px] uppercase font-semibold text-rose-700 dark:text-rose-200 tracking-wider">
                  {anomalyLabel(a.kind)}
                </span>
                <span className="text-[10px] font-mono ml-auto text-rose-700/70 dark:text-rose-200/70">
                  tx {a.tx} · t={a.tick}
                </span>
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-200">{a.text}</p>
              <p className="text-[10px] mt-1 text-muted-foreground">
                {anomalyExplain(a.kind, isolation)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Log */}
      <details className="mt-4 rounded-md border border-border bg-background p-3">
        <summary className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1">
          <ChevronDown className="h-3.5 w-3.5" />
          Hendelseslogg ({state.log.length} · tick {state.tick})
        </summary>
        <div className="mt-2 font-mono text-[11px] space-y-0.5 max-h-56 overflow-y-auto">
          {state.log.length === 0 ? (
            <div className="text-muted-foreground italic">
              Klikk en operasjon for A eller B for å starte.
            </div>
          ) : (
            state.log.map((l, i) => (
              <div
                key={i}
                className={
                  l.tone === "bad"
                    ? "text-rose-500"
                    : l.tone === "good"
                      ? "text-emerald-500"
                      : l.tone === "warn"
                        ? "text-amber-500"
                        : "text-muted-foreground"
                }
              >
                <span className="opacity-50">t={l.tick}</span>{" "}
                <span className="text-foreground">[{l.tx}]</span> {l.text}
              </div>
            ))
          )}
        </div>
      </details>
    </div>
  );
}

function TxColumn({
  who,
  state,
  view,
  runOp,
}: {
  who: TxId;
  state: EngineState;
  view: { id: number; saldo: number }[];
  runOp: (who: TxId, op: Op) => void;
}) {
  const tx = state.tx[who];
  const color = who === "A" ? "emerald" : "sky";
  const colorBg =
    color === "emerald"
      ? "bg-emerald-500/10 border-emerald-500/40"
      : "bg-sky-500/10 border-sky-500/40";
  const colorText =
    color === "emerald"
      ? "text-emerald-700 dark:text-emerald-300"
      : "text-sky-700 dark:text-sky-300";

  const ownLocks = state.rowLocks.filter((l) => l.holder === who);

  return (
    <div className={`rounded-xl border p-3 ${colorBg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`font-semibold text-sm ${colorText}`}>Transaksjon {who}</div>
        <StatusBadge status={tx.status} />
      </div>

      {tx.lastMessage && (
        <div className="text-[11px] font-mono text-foreground/80 mb-2 truncate">
          {tx.lastMessage}
        </div>
      )}

      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2 mb-1">
        Det tx {who} ser nå
      </div>
      <div className="rounded border border-border bg-background overflow-hidden mb-2">
        <table className="w-full text-[11px] font-mono">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="text-left px-2 py-1">id</th>
              <th className="text-left px-2 py-1">saldo</th>
              <th className="text-left px-2 py-1">flagg</th>
            </tr>
          </thead>
          <tbody>
            {view.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-2 py-1 text-muted-foreground italic">
                  (tom)
                </td>
              </tr>
            ) : (
              view.map((r) => {
                const pending = tx.pending.find((p) => p.rowId === r.id);
                const ownInsert = pending?.isInsert ?? false;
                return (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-2 py-1">{r.id}</td>
                    <td className="px-2 py-1">{r.saldo}</td>
                    <td className="px-2 py-1 text-[10px] text-muted-foreground">
                      {pending && !ownInsert && (
                        <span className="text-amber-600">pending</span>
                      )}
                      {ownInsert && (
                        <span className="text-amber-600">pending INSERT</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {ownLocks.length > 0 && (
        <div className="text-[10px] mb-2">
          <span className="text-muted-foreground">Eier låser: </span>
          <span className="font-mono text-foreground">
            {ownLocks.map(describeLock).join(", ")}
          </span>
        </div>
      )}

      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        Operasjoner
      </div>
      <div className="flex flex-wrap gap-1">
        {OPS_FOR_TX.map((entry) => {
          const op = entry.build();
          const disabled =
            tx.status === "committed" ||
            tx.status === "aborted" ||
            (tx.status === "blocked" && op.kind !== "ROLLBACK");
          return (
            <button
              key={entry.label}
              type="button"
              onClick={() => runOp(who, op)}
              disabled={disabled}
              title={opLabel(op)}
              className={`text-[10px] rounded border px-1.5 py-1 font-mono transition-colors ${
                disabled
                  ? "opacity-40 cursor-not-allowed border-border bg-muted/30"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              {entry.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DbColumn({
  state,
  committed,
}: {
  state: EngineState;
  committed: { id: number; saldo: number }[];
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center gap-2 mb-2">
        <Database className="h-3.5 w-3.5 text-brand" />
        <span className="text-sm font-semibold">Committed state</span>
      </div>
      <div className="rounded border border-border overflow-hidden mb-3">
        <table className="w-full text-[11px] font-mono">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="text-left px-2 py-1">id</th>
              <th className="text-left px-2 py-1">saldo</th>
            </tr>
          </thead>
          <tbody>
            {committed.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-2 py-1 text-muted-foreground italic">
                  (tom)
                </td>
              </tr>
            ) : (
              committed.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-2 py-1">{r.id}</td>
                  <td className="px-2 py-1">{r.saldo}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <Lock className="h-3.5 w-3.5 text-amber-600" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Aktive låser
        </span>
      </div>
      {state.rowLocks.length === 0 && state.rangeLocks.length === 0 ? (
        <div className="text-[11px] text-muted-foreground italic flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3" /> ingen
        </div>
      ) : (
        <ul className="text-[10px] font-mono space-y-0.5">
          {state.rowLocks.map((l, i) => (
            <li
              key={`r-${i}`}
              className={
                l.holder === "A"
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-sky-700 dark:text-sky-300"
              }
            >
              {describeLock(l)}
            </li>
          ))}
          {state.rangeLocks.map((l, i) => (
            <li
              key={`g-${i}`}
              className={
                l.holder === "A"
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-sky-700 dark:text-sky-300"
              }
            >
              range saldo [{l.minSaldo ?? "-∞"},{l.maxSaldo ?? "∞"}] · {l.holder}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    idle: { label: "IDLE", cls: "bg-muted text-muted-foreground" },
    active: {
      label: "ACTIVE",
      cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    },
    blocked: {
      label: "BLOCKED",
      cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    },
    committed: {
      label: "COMMIT",
      cls: "bg-brand/15 text-brand",
    },
    aborted: {
      label: "ABORTED",
      cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    },
  };
  const m = map[status] ?? map.idle;
  return (
    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${m.cls}`}>
      {m.label}
    </span>
  );
}

function anomalyLabel(k: string): string {
  switch (k) {
    case "dirty_read":
      return "Dirty read";
    case "non_repeatable_read":
      return "Non-repeatable read";
    case "phantom_read":
      return "Phantom read";
    case "lost_update":
      return "Lost update";
    case "deadlock":
      return "Deadlock";
    case "serialization_failure":
      return "Serialization failure";
    default:
      return k;
  }
}

function anomalyExplain(k: string, iso: IsolationLevel): string {
  if (k === "dirty_read") {
    return "Hadde du valgt READ COMMITTED eller strengere, ville lese-låsen ventet til motpart commitet.";
  }
  if (k === "non_repeatable_read") {
    return iso === "REPEATABLE_READ" || iso === "SERIALIZABLE"
      ? "Burde ikke skje på dette nivået — bug?"
      : "REPEATABLE READ eller SERIALIZABLE ville frosset snapshot for hele tx.";
  }
  if (k === "phantom_read") {
    return "Kun SERIALIZABLE forhindrer dette (via predikat-/range-låser).";
  }
  if (k === "lost_update") {
    return "Bruk SELECT ... FOR UPDATE, versjonskolonne (optimistisk), eller SERIALIZABLE.";
  }
  if (k === "deadlock") {
    return "Klassisk syklus. Lås rader i samme rekkefølge for å forebygge.";
  }
  if (k === "serialization_failure") {
    return "Forventet på SERIALIZABLE — klienten må fange feilen og prøve igjen.";
  }
  return "";
}
