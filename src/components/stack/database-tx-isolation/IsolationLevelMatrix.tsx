import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  matrixCell,
  prettyIso,
  type AnomalyKind,
  type IsolationLevel,
} from "./txEngine";

// ---------------------------------------------------------------------------
// IsolationLevelMatrix
//
// 4×4-tabell over isolasjonsnivåer × anomalier. ✓ = forhindret, ✗ = mulig.
// Klikkbart — viser eksempelscenarie for valgt celle.
// ---------------------------------------------------------------------------

const LEVELS: IsolationLevel[] = [
  "READ_UNCOMMITTED",
  "READ_COMMITTED",
  "REPEATABLE_READ",
  "SERIALIZABLE",
];

const ANOMALIES: { key: AnomalyKind; label: string }[] = [
  { key: "dirty_read", label: "Dirty read" },
  { key: "non_repeatable_read", label: "Non-rep read" },
  { key: "phantom_read", label: "Phantom read" },
  { key: "lost_update", label: "Lost update" },
];

type CellKey = `${IsolationLevel}__${AnomalyKind}`;

const SCENARIOS: Record<
  CellKey,
  { title: string; story: string; advice: string } | undefined
> = {
  "READ_UNCOMMITTED__dirty_read": {
    title: "Tillatt — dirty read kan oppstå",
    story:
      "A: BEGIN; UPDATE saldo=0 WHERE id=1; ... (ikke commit ennå)\nB: SELECT saldo WHERE id=1 → 0\nA: ROLLBACK\nB sitter med en verdi som aldri eksisterte i committed-state.",
    advice:
      "Bruk minst READ COMMITTED. Den eneste reelle bruken av READ UNCOMMITTED er logg-skanning der presisjon ikke er kritisk.",
  },
  "READ_COMMITTED__dirty_read": {
    title: "Forhindret — B må vente",
    story:
      "A: BEGIN; UPDATE id=1 → 0 (tar X-lås)\nB: SELECT id=1 → må vente til A commit-er eller rolling back, så ser den valgte committed-verdien.",
    advice: "Default i Postgres og Oracle. Sweet spot for de fleste apper.",
  },
  "REPEATABLE_READ__dirty_read": {
    title: "Forhindret",
    story: "RR garanterer alt READ COMMITTED gjør, pluss mer.",
    advice: "Default i MySQL/InnoDB.",
  },
  "SERIALIZABLE__dirty_read": {
    title: "Forhindret",
    story: "Strengeste nivå — som om alle tx kjørte etter hverandre.",
    advice: "Kostbart, bruk når korrekthet er kritisk (regnskap, bank).",
  },

  "READ_UNCOMMITTED__non_repeatable_read": {
    title: "Tillatt",
    story:
      "B: SELECT id=1 → 1000\nA: UPDATE id=1 → 1200; COMMIT\nB: SELECT id=1 → 1200 (samme rad, nytt svar)",
    advice: "RR eller SERIALIZABLE for å fryse leste rader.",
  },
  "READ_COMMITTED__non_repeatable_read": {
    title: "Tillatt — typisk fallgruve i Postgres-default",
    story:
      "B: SELECT id=1 → 1000\nA: UPDATE + COMMIT → 1200\nB: SELECT id=1 → 1200 (committed nå, andre svar)",
    advice:
      "Hvis du regner ut basert på lest verdi og skriver tilbake — bruk SELECT FOR UPDATE eller hev til REPEATABLE READ.",
  },
  "REPEATABLE_READ__non_repeatable_read": {
    title: "Forhindret",
    story:
      "B tar snapshot ved første SELECT. Selv om A commit-er en endring etterpå, ser B fortsatt 1000.",
    advice:
      "InnoDB bruker MVCC og er svært effektivt — ingen ekstra låser, bare versjons-lookup.",
  },
  "SERIALIZABLE__non_repeatable_read": {
    title: "Forhindret",
    story: "Som RR.",
    advice: "Bonus: serialiserings-detektering ved COMMIT.",
  },

  "READ_UNCOMMITTED__phantom_read": {
    title: "Tillatt",
    story:
      "B: SELECT COUNT(*) WHERE saldo > 500 → 2\nA: INSERT (saldo=900); COMMIT\nB: SELECT COUNT(*) WHERE saldo > 500 → 3 (en ny rad dukket opp)",
    advice: "Trenger SERIALIZABLE for å forhindre.",
  },
  "READ_COMMITTED__phantom_read": {
    title: "Tillatt",
    story: "Som over.",
    advice: "RC ser bare committet data, men nye committede rader gjelder.",
  },
  "REPEATABLE_READ__phantom_read": {
    title:
      "Tillatt i SQL-standard (InnoDB lar deg ofte unngå det med next-key locks)",
    story:
      "RR fryser leste rader, men nye rader fra andre tx er ikke i ditt snapshot. SQL-standard sier dette er tillatt — InnoDB legger på next-key locks som ofte forhindrer det i praksis.",
    advice:
      "For garantert ingen phantoms: bruk SERIALIZABLE eller eksplisitte FOR UPDATE/range-låser.",
  },
  "SERIALIZABLE__phantom_read": {
    title: "Forhindret",
    story:
      "Predikat-/range-låser. INSERT som matcher en annens predicate blokkeres eller fører til serialization failure.",
    advice: "Eneste nivå som garanterer phantom-fri lesing.",
  },

  "READ_UNCOMMITTED__lost_update": {
    title: "Tillatt",
    story:
      "A: read saldo=100, beregner 100+50\nB: read saldo=100, beregner 100−30\nB: write 70; COMMIT\nA: write 150; COMMIT — B's −30 er borte.",
    advice: "Som under RC / RR.",
  },
  "READ_COMMITTED__lost_update": {
    title: "Tillatt",
    story: "Klassisk RMW-konflikt — verken RC eller RR varsler om dette automatisk.",
    advice:
      "Bruk SELECT ... FOR UPDATE for å låse raden mens du regner, eller versjonskolonne (optimistisk).",
  },
  "REPEATABLE_READ__lost_update": {
    title: "Tillatt i SQL-standard",
    story:
      "RR fryser snapshot, men kan ikke detektere at en annen tx også oppdaterer samme rad — siste skriver vinner. (Postgres' RR avbryter med 'could not serialize' i noen tilfeller.)",
    advice: "Versjonskolonne eller SERIALIZABLE.",
  },
  "SERIALIZABLE__lost_update": {
    title: "Forhindret",
    story:
      "Ved COMMIT detekteres write-skew/lost update og en av tx får 'serialization failure' — klienten må prøve på nytt.",
    advice: "Forutsetter retry-logikk i klienten.",
  },
};

export function IsolationLevelMatrix() {
  const [selected, setSelected] = useState<CellKey | null>(
    "READ_COMMITTED__non_repeatable_read",
  );
  const cell = selected ? SCENARIOS[selected] : undefined;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left font-semibold p-2 text-xs uppercase tracking-wider text-muted-foreground">
                Isolation level ↓ / Anomali →
              </th>
              {ANOMALIES.map((a) => (
                <th
                  key={a.key}
                  className="text-center font-semibold p-2 text-xs"
                >
                  {a.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LEVELS.map((iso) => (
              <tr key={iso} className="border-t border-border">
                <td className="p-2 font-mono text-xs whitespace-nowrap">
                  {prettyIso(iso)}
                </td>
                {ANOMALIES.map((a) => {
                  const can = matrixCell(iso, a.key);
                  const key: CellKey = `${iso}__${a.key}`;
                  const isSel = selected === key;
                  return (
                    <td
                      key={key}
                      className={`p-1 text-center cursor-pointer ${
                        isSel ? "bg-brand/10" : ""
                      }`}
                      onClick={() => setSelected(key)}
                    >
                      <button
                        type="button"
                        className={`inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-md border transition-colors ${
                          can
                            ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20"
                            : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
                        } ${isSel ? "ring-2 ring-brand" : ""}`}
                        aria-label={`${prettyIso(iso)} × ${a.label}: ${can ? "kan oppstå" : "forhindret"}`}
                      >
                        {can ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> forhindret
        </span>
        <span className="flex items-center gap-1">
          <XCircle className="h-3.5 w-3.5 text-rose-600" /> kan oppstå
        </span>
        <span className="ml-auto text-[10px]">
          Klikk en celle for å se eksempel.
        </span>
      </div>

      {cell && (
        <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4">
          <div className="text-xs uppercase tracking-wider font-semibold text-brand mb-1">
            {cell.title}
          </div>
          <pre className="font-mono text-[11px] sm:text-xs whitespace-pre-wrap text-foreground/85 mt-2">
            {cell.story}
          </pre>
          <p className="text-xs text-muted-foreground mt-3">
            <span className="font-semibold text-foreground">Råd:</span> {cell.advice}
          </p>
        </div>
      )}
    </div>
  );
}
