import { useMemo, useState } from "react";
import { Play, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  applyOp,
  initialEngine,
  type Anomaly,
  type AnomalyKind,
  type EngineState,
  type IsolationLevel,
  type Op,
  type TxId,
  prettyIso,
} from "./txEngine";
import { ConcurrentTransactionSim } from "./ConcurrentTransactionSim";

// ---------------------------------------------------------------------------
// AnomalyDemoPresets
//
// Fire forhåndsdefinerte koreografier. For hver: vi spiller dem av i hodet
// på alle fire isolasjonsnivåer og rapporterer hvilke som tillot anomalien
// (og hvilke som blokkerte / serialiserte). Brukeren kan klikke "kjør i
// simulatoren" og se den eksakte sekvensen i ConcurrentTransactionSim.
// ---------------------------------------------------------------------------

type Preset = {
  id: string;
  title: string;
  anomaly: AnomalyKind;
  blurb: string;
  steps: { who: TxId; op: Op; note?: string }[];
};

const PRESETS: Preset[] = [
  {
    id: "dirty",
    title: "Dirty read — B leser noe A senere ruller tilbake",
    anomaly: "dirty_read",
    blurb:
      "A oppdaterer saldo, B leser den endrede verdien før A har commit-et, deretter ROLLBACKer A. B sitter igjen med en verdi som aldri eksisterte.",
    steps: [
      { who: "A", op: { kind: "BEGIN" } },
      {
        who: "A",
        op: { kind: "UPDATE", rowId: 1, newSaldo: 0 },
        note: "A skriver men commit-er ikke",
      },
      { who: "B", op: { kind: "BEGIN" } },
      {
        who: "B",
        op: { kind: "SELECT_ONE", rowId: 1 },
        note: "B leser — får 0 hvis dirty read er tillatt",
      },
      {
        who: "A",
        op: { kind: "ROLLBACK" },
        note: "A angrer — B sitter igjen med en verdi som aldri eksisterte",
      },
    ],
  },
  {
    id: "nonrep",
    title: "Non-repeatable read — samme rad, to ulike svar",
    anomaly: "non_repeatable_read",
    blurb:
      "B leser saldo, A oppdaterer + commit, B leser samme rad igjen og får annen verdi. Hvis B holdt summen i en variabel og skrev tilbake, ville den vært ut av sync.",
    steps: [
      { who: "B", op: { kind: "BEGIN" } },
      {
        who: "B",
        op: { kind: "SELECT_ONE", rowId: 1 },
        note: "B leser første gang (=1000)",
      },
      { who: "A", op: { kind: "BEGIN" } },
      {
        who: "A",
        op: { kind: "UPDATE", rowId: 1, newSaldo: 1200 },
        note: "A endrer raden",
      },
      { who: "A", op: { kind: "COMMIT" }, note: "A commit-er endringen" },
      {
        who: "B",
        op: { kind: "SELECT_ONE", rowId: 1 },
        note: "B leser samme rad andre gang — får 1200, ikke 1000",
      },
    ],
  },
  {
    id: "phantom",
    title: "Phantom read — ny rad dukker opp i samme WHERE-spørring",
    anomaly: "phantom_read",
    blurb:
      "B kjører en range-spørring, A INSERTer en ny rad som matcher, B kjører samme spørring og får én ekstra rad — en fantom.",
    steps: [
      { who: "B", op: { kind: "BEGIN" } },
      {
        who: "B",
        op: { kind: "SELECT_RANGE", minSaldo: 400, maxSaldo: 1200 },
        note: "B teller rader (får id=1,2,3)",
      },
      { who: "A", op: { kind: "BEGIN" } },
      {
        who: "A",
        op: { kind: "INSERT", rowId: 4, saldo: 600 },
        note: "A legger til en ny rad i range",
      },
      { who: "A", op: { kind: "COMMIT" } },
      {
        who: "B",
        op: { kind: "SELECT_RANGE", minSaldo: 400, maxSaldo: 1200 },
        note: "B kjører samme range — får id=4 i tillegg",
      },
    ],
  },
  {
    id: "lost",
    title: "Lost update — A's endring blir overskrevet",
    anomaly: "lost_update",
    blurb:
      "Klassisk RMW-konflikt: A leser → bestemmer ny verdi → skriver. B gjør det samme i mellomtiden. Den siste vinner, den andres endring forsvinner uten varsel.",
    steps: [
      { who: "A", op: { kind: "BEGIN" } },
      {
        who: "A",
        op: { kind: "SELECT_ONE", rowId: 1 },
        note: "A leser saldo=1000",
      },
      { who: "B", op: { kind: "BEGIN" } },
      {
        who: "B",
        op: { kind: "SELECT_ONE", rowId: 1 },
        note: "B leser saldo=1000 (samme)",
      },
      {
        who: "B",
        op: { kind: "UPDATE", rowId: 1, newSaldo: 800 },
        note: "B trekker 200 → vil skrive 800",
      },
      { who: "B", op: { kind: "COMMIT" } },
      {
        who: "A",
        op: { kind: "UPDATE", rowId: 1, newSaldo: 1200 },
        note: "A legger til 200 → vil skrive 1200. B's −200 er borte.",
      },
      { who: "A", op: { kind: "COMMIT" } },
    ],
  },
];

const ISO_LEVELS: IsolationLevel[] = [
  "READ_UNCOMMITTED",
  "READ_COMMITTED",
  "REPEATABLE_READ",
  "SERIALIZABLE",
];

type Outcome = {
  anomalyOccurred: boolean;
  serializationFailed: boolean;
  blocked: boolean;
  message: string;
};

/**
 * Spill av et preset i ren simulering og rapporter resultatet for hvert
 * isolasjonsnivå. Brukes til oppsummeringstabellen.
 */
function simulatePreset(preset: Preset, iso: IsolationLevel): Outcome {
  let s: EngineState = initialEngine({ isolation: iso });
  let blocked = false;
  for (const step of preset.steps) {
    s = applyOp(s, step.who, step.op);
    if (s.tx[step.who].status === "blocked") blocked = true;
  }
  const anomaliesOfKind = s.anomalies.filter((a: Anomaly) => a.kind === preset.anomaly);
  const serialFails = s.anomalies.filter(
    (a: Anomaly) => a.kind === "serialization_failure",
  );
  return {
    anomalyOccurred: anomaliesOfKind.length > 0,
    serializationFailed: serialFails.length > 0,
    blocked,
    message: anomaliesOfKind.length > 0
      ? "anomali oppstod"
      : serialFails.length > 0
        ? "serialization failure — klient må retry"
        : blocked
          ? "blokkert — venter på lås"
          : "ok, ingen anomali",
  };
}

export function AnomalyDemoPresets() {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [loadedIso, setLoadedIso] = useState<IsolationLevel>("READ_COMMITTED");

  const active = useMemo(
    () => PRESETS.find((p) => p.id === activePreset),
    [activePreset],
  );

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        {PRESETS.map((p) => {
          const isActive = p.id === activePreset;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setActivePreset(p.id);
                setLoadedIso("READ_COMMITTED");
              }}
              className={`text-left rounded-xl border p-4 transition-colors ${
                isActive
                  ? "border-brand bg-brand/5 ring-2 ring-brand/30"
                  : "border-border bg-card hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="font-semibold text-sm">{p.title}</span>
              </div>
              <p className="text-xs text-muted-foreground">{p.blurb}</p>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Play className="h-4 w-4 text-brand" />
            <h3 className="font-semibold text-sm">{active.title}</h3>
          </div>

          {/* Resultattabell på tvers av isolation levels */}
          <div className="rounded-lg border border-border overflow-x-auto mb-4">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Isolation level</th>
                  <th className="text-left px-3 py-2 font-semibold">Utfall</th>
                  <th className="text-left px-3 py-2 font-semibold">Detalj</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {ISO_LEVELS.map((iso) => {
                  const out = simulatePreset(active, iso);
                  const protectedFromAnomaly =
                    !out.anomalyOccurred && !out.blocked;
                  return (
                    <tr key={iso} className="border-t border-border">
                      <td className="px-3 py-2 font-mono">{prettyIso(iso)}</td>
                      <td className="px-3 py-2">
                        {out.anomalyOccurred ? (
                          <span className="text-rose-600 font-semibold flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> anomali
                          </span>
                        ) : out.blocked ? (
                          <span className="text-amber-600 font-semibold">
                            blokkert
                          </span>
                        ) : out.serializationFailed ? (
                          <span className="text-violet-600 font-semibold">
                            abort + retry
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> forhindret
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {out.message}
                      </td>
                      <td className="px-2 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setLoadedIso(iso)}
                          className={`text-[10px] rounded border px-2 py-1 font-mono ${
                            loadedIso === iso
                              ? "border-brand bg-brand text-white"
                              : "border-border bg-background hover:bg-muted"
                          }`}
                          title={
                            protectedFromAnomaly
                              ? "Last inn nivået i simulatoren under"
                              : "Last inn for å se anomalien manifestere"
                          }
                        >
                          spill av
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Steps preview */}
          <details className="mb-4 rounded-md border border-border bg-background p-3">
            <summary className="text-xs text-muted-foreground cursor-pointer font-semibold">
              Sekvens ({active.steps.length} steg)
            </summary>
            <ol className="mt-2 space-y-1 text-[11px] font-mono">
              {active.steps.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-muted-foreground">{i + 1}.</span>
                  <span
                    className={
                      step.who === "A"
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-sky-700 dark:text-sky-300"
                    }
                  >
                    [{step.who}]
                  </span>
                  <span className="text-foreground/80">{describeOp(step.op)}</span>
                  {step.note ? (
                    <span className="text-muted-foreground italic">
                      — {step.note}
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </details>

          {/* Live simulator (re-mountes ved iso-bytte for å laste preset på nytt) */}
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Sekvensen kjørt på {prettyIso(loadedIso)}
          </div>
          <ConcurrentTransactionSim
            key={`${active.id}-${loadedIso}`}
            initialIsolation={loadedIso}
            scriptedOps={active.steps.map((s) => ({ who: s.who, op: s.op }))}
            headerNote={`Preset «${active.title}» er allerede kjørt. Klikk operasjonene under for å fortsette eksperimentere på toppen.`}
          />
        </div>
      )}
    </div>
  );
}

function describeOp(op: Op): string {
  switch (op.kind) {
    case "BEGIN":
      return "BEGIN";
    case "COMMIT":
      return "COMMIT";
    case "ROLLBACK":
      return "ROLLBACK";
    case "SELECT_ONE":
      return `SELECT WHERE id=${op.rowId}`;
    case "SELECT_RANGE":
      return `SELECT WHERE saldo BETWEEN ${op.minSaldo} AND ${op.maxSaldo}`;
    case "UPDATE":
      return `UPDATE id=${op.rowId} → saldo=${op.newSaldo}`;
    case "INSERT":
      return `INSERT (id=${op.rowId}, saldo=${op.saldo})`;
  }
}
