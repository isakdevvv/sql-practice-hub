import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  AlertTriangle,
  Lock,
  Ghost,
  Check,
  X,
  Eye,
  Pencil,
  ShieldCheck,
} from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv visualisering: isolation-nivåer og samtidighets-anomalier.
// To "lanes" (TX1 og TX2) som leser/skriver mot samme accounts-rad. Brukeren
// velger isolation level + scenario (dirty read / non-repeatable / phantom /
// lost update) og stepper gjennom timelinen. Anomalier blinker rødt; nivåer
// som forhindrer dem viser låse-/venting-ikon i stedet.
// --------------------------------------------------------------------------

type IsolationLevel = "RU" | "RC" | "RR" | "SR";
type ScenarioId = "dirty" | "nonrep" | "phantom" | "lost";

type StepKind = "read" | "write" | "begin" | "commit" | "rollback" | "insert" | "count";

type StepResult = {
  /** Verdi som ble lest, eller annotasjon. */
  value?: string;
  /** Hvis steget ble blokkert av lås på dette isolation-nivået. */
  blocked?: boolean;
  /** Anomali oppstod ved dette steget. */
  anomaly?: string;
  /** Anomali ble forhindret (commit ventet, eller serialization fail). */
  prevented?: string;
};

type Step = {
  tx: 1 | 2;
  kind: StepKind;
  /** SQL eller kort tekst som vises i boksen. */
  label: string;
  /** Norsk forklaring under boksen. */
  hint?: string;
};

const ISOLATION: { id: IsolationLevel; navn: string; kort: string }[] = [
  { id: "RU", navn: "Read Uncommitted", kort: "RU" },
  { id: "RC", navn: "Read Committed", kort: "RC" },
  { id: "RR", navn: "Repeatable Read", kort: "RR" },
  { id: "SR", navn: "Serializable", kort: "SR" },
];

const SCENARIOS: { id: ScenarioId; navn: string; desc: string; icon: typeof Eye }[] = [
  {
    id: "dirty",
    navn: "Dirty read",
    desc: "TX2 leser ucommittet skriving fra TX1, som rulles tilbake.",
    icon: Ghost,
  },
  {
    id: "nonrep",
    navn: "Non-repeatable read",
    desc: "TX1 leser samme rad to ganger og får ulik verdi.",
    icon: Eye,
  },
  {
    id: "phantom",
    navn: "Phantom read",
    desc: "TX1 kjører COUNT to ganger og får ny rad imellom.",
    icon: Ghost,
  },
  {
    id: "lost",
    navn: "Lost update",
    desc: "TX1 og TX2 inkrementerer samme teller — én skriving forsvinner.",
    icon: AlertTriangle,
  },
];

// Tabellrad vi simulerer mot.
type Row = { id: number; balance: number };

// ---- Scenarios som steg-sekvenser ----

const STEPS_DIRTY: Step[] = [
  { tx: 1, kind: "begin", label: "BEGIN" },
  { tx: 2, kind: "begin", label: "BEGIN" },
  { tx: 1, kind: "write", label: "UPDATE accounts SET balance=200 WHERE id=1", hint: "TX1 skriver, men har ikke committed." },
  { tx: 2, kind: "read", label: "SELECT balance FROM accounts WHERE id=1", hint: "TX2 prøver å lese mens TX1 fortsatt jobber." },
  { tx: 1, kind: "rollback", label: "ROLLBACK", hint: "TX1 angrer alt — balansen tilbake til 100." },
  { tx: 2, kind: "commit", label: "COMMIT" },
];

const STEPS_NONREP: Step[] = [
  { tx: 1, kind: "begin", label: "BEGIN" },
  { tx: 1, kind: "read", label: "SELECT balance FROM accounts WHERE id=1", hint: "TX1 leser første gang." },
  { tx: 2, kind: "begin", label: "BEGIN" },
  { tx: 2, kind: "write", label: "UPDATE accounts SET balance=200 WHERE id=1", hint: "TX2 endrer raden." },
  { tx: 2, kind: "commit", label: "COMMIT", hint: "TX2 committer — endringen er nå offisiell." },
  { tx: 1, kind: "read", label: "SELECT balance FROM accounts WHERE id=1", hint: "TX1 leser raden igjen — samme spørring." },
  { tx: 1, kind: "commit", label: "COMMIT" },
];

const STEPS_PHANTOM: Step[] = [
  { tx: 1, kind: "begin", label: "BEGIN" },
  { tx: 1, kind: "count", label: "SELECT COUNT(*) FROM accounts WHERE balance > 50", hint: "TX1 teller første gang." },
  { tx: 2, kind: "begin", label: "BEGIN" },
  { tx: 2, kind: "insert", label: "INSERT INTO accounts VALUES (2, 300)", hint: "TX2 setter inn en ny rad som matcher." },
  { tx: 2, kind: "commit", label: "COMMIT" },
  { tx: 1, kind: "count", label: "SELECT COUNT(*) FROM accounts WHERE balance > 50", hint: "TX1 teller igjen — finnes det fantomer?" },
  { tx: 1, kind: "commit", label: "COMMIT" },
];

const STEPS_LOST: Step[] = [
  { tx: 1, kind: "begin", label: "BEGIN" },
  { tx: 2, kind: "begin", label: "BEGIN" },
  { tx: 1, kind: "read", label: "SELECT balance FROM accounts WHERE id=1", hint: "TX1 leser 100." },
  { tx: 2, kind: "read", label: "SELECT balance FROM accounts WHERE id=1", hint: "TX2 leser også 100 — begge tror de starter på samme verdi." },
  { tx: 1, kind: "write", label: "UPDATE accounts SET balance=100+10 WHERE id=1", hint: "TX1 regner 100+10 = 110." },
  { tx: 1, kind: "commit", label: "COMMIT" },
  { tx: 2, kind: "write", label: "UPDATE accounts SET balance=100+20 WHERE id=1", hint: "TX2 regner også fra 100 og overskriver TX1." },
  { tx: 2, kind: "commit", label: "COMMIT" },
];

const SCENARIO_STEPS: Record<ScenarioId, Step[]> = {
  dirty: STEPS_DIRTY,
  nonrep: STEPS_NONREP,
  phantom: STEPS_PHANTOM,
  lost: STEPS_LOST,
};

// ---- Simulator: gitt scenario + isolasjon, returner result per steg + sluttilstand ----

type Snapshot = {
  committedRows: Row[];
  /** Liste over rader: kun for visning av "current state". */
};

type SimResult = {
  results: StepResult[];
  /** Tilstand etter siste steg som ble kjørt (eller alle steg dersom done). */
  finalCommitted: Row[];
  /** Verdi TX-ene "ser" per steg (snapshot view), for repeatable-read/serializable. */
};

function simulate(scenario: ScenarioId, iso: IsolationLevel): SimResult {
  const steps = SCENARIO_STEPS[scenario];
  const results: StepResult[] = steps.map(() => ({}));

  // committed state — det alle ser når de leser med RC eller når TX-en starter med RR/SR.
  let committed: Row[] = [{ id: 1, balance: 100 }];
  // ucommittede skrivinger per TX (kun TX1 i scenariene som bruker det).
  const txWrites: Record<1 | 2, Row[] | null> = { 1: null, 2: null };
  // snapshot ved BEGIN, for RR og SR.
  const txSnapshot: Record<1 | 2, Row[] | null> = { 1: null, 2: null };
  // har TX skrevet (for lost update detection)?
  const txWrittenKeys: Record<1 | 2, Set<number>> = { 1: new Set(), 2: new Set() };

  // Spesifikk anomali-detektering per scenario.
  let tx1FirstRead: number | undefined;
  let tx1FirstCount: number | undefined;
  let tx2ReadBalance: number | undefined;
  let tx1ReadBalanceForLost: number | undefined;
  let tx2ReadBalanceForLost: number | undefined;

  // Helper for å lese balance for id=1 fra et "view"
  const balanceFromRows = (rows: Row[], id = 1): number | undefined =>
    rows.find((r) => r.id === id)?.balance;

  // Hva TX-en "ser" når den leser (avhengig av iso + ucommittede skrivinger).
  const viewFor = (tx: 1 | 2): Row[] => {
    // Egen ucommittet skriving overstyrer alltid (en TX ser sin egen pending change).
    let base: Row[];
    if (iso === "RR" || iso === "SR") {
      base = txSnapshot[tx] ?? committed;
    } else if (iso === "RU") {
      // Read Uncommitted: ser også andre TX-ers ucommittede skrivinger.
      const other: 1 | 2 = tx === 1 ? 2 : 1;
      base = txWrites[other] ?? committed;
    } else {
      // Read Committed: bare committed
      base = committed;
    }
    // Overlay egen pending write
    if (txWrites[tx]) {
      const own = txWrites[tx]!;
      const ids = new Set(own.map((r) => r.id));
      base = [...base.filter((r) => !ids.has(r.id)), ...own];
    }
    return base.slice().sort((a, b) => a.id - b.id);
  };

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const r: StepResult = {};

    switch (step.kind) {
      case "begin": {
        // RR/SR tar et snapshot av committed nå.
        if (iso === "RR" || iso === "SR") {
          txSnapshot[step.tx] = committed.map((row) => ({ ...row }));
        }
        r.value = "begin";
        break;
      }
      case "read": {
        const rows = viewFor(step.tx);
        const bal = balanceFromRows(rows);
        r.value = bal !== undefined ? `balance = ${bal}` : "ingen rad";

        // Detekter dirty read (TX2 leser TX1 sin pending)
        if (scenario === "dirty" && step.tx === 2) {
          const tx1Pending = txWrites[1];
          if (iso === "RU" && tx1Pending) {
            r.anomaly = "skitten lesing — TX1 har ikke committed";
            tx2ReadBalance = bal;
          } else if (tx1Pending) {
            r.prevented = "venter ikke — leser committed verdi (TX1 sin ucommittet er usynlig)";
          }
        }

        // Non-repeatable: TX1 leser to ganger
        if (scenario === "nonrep" && step.tx === 1) {
          if (tx1FirstRead === undefined) {
            tx1FirstRead = bal;
          } else if (bal !== tx1FirstRead) {
            r.anomaly = `ikke-repeterbar lesing — så ${tx1FirstRead}, nå ${bal}`;
          }
        }

        // Lost update: registrer hva de leste først
        if (scenario === "lost") {
          if (step.tx === 1 && tx1ReadBalanceForLost === undefined) {
            tx1ReadBalanceForLost = bal;
          }
          if (step.tx === 2 && tx2ReadBalanceForLost === undefined) {
            tx2ReadBalanceForLost = bal;
          }
        }
        break;
      }
      case "count": {
        const rows = viewFor(step.tx);
        const c = rows.filter((row) => row.balance > 50).length;
        r.value = `count = ${c}`;
        if (scenario === "phantom" && step.tx === 1) {
          if (tx1FirstCount === undefined) {
            tx1FirstCount = c;
          } else if (c !== tx1FirstCount) {
            r.anomaly = `fantom — fra ${tx1FirstCount} til ${c} rader`;
          } else if (iso === "RR" || iso === "SR") {
            r.prevented = "samme svar — snapshot beskytter mot fantom";
          }
        }
        break;
      }
      case "write": {
        // Lost update: SR vil her abort
        if (scenario === "lost" && iso === "SR") {
          // Andre skriving etter at første har committed → serialization failure
          const otherCommittedAlready = (txWrites[step.tx === 1 ? 2 : 1] === null) &&
            txWrittenKeys[step.tx === 1 ? 2 : 1].size > 0;
          if (otherCommittedAlready) {
            r.prevented = "Serialization failure — TX må prøves på nytt";
            r.blocked = true;
            // Marker resten av TX-ens steg som blokkert
            for (let j = i + 1; j < steps.length; j++) {
              if (steps[j].tx === step.tx) {
                results[j] = { blocked: true, prevented: "transaksjon abortert" };
              }
            }
            results[i] = r;
            // Hopp over resten av denne TX sine steg ved å nullstille pending
            txWrites[step.tx] = null;
            continue;
          }
        }

        // Lost update på RR i Postgres → også serialization failure pga first-updater-wins.
        if (scenario === "lost" && iso === "RR") {
          const otherKey = step.tx === 1 ? 2 : 1;
          const otherCommittedAlready = (txWrites[otherKey] === null) && txWrittenKeys[otherKey].size > 0;
          if (otherCommittedAlready) {
            r.prevented = "first-updater-wins — TX må prøves på nytt";
            r.blocked = true;
            for (let j = i + 1; j < steps.length; j++) {
              if (steps[j].tx === step.tx) {
                results[j] = { blocked: true, prevented: "transaksjon abortert" };
              }
            }
            results[i] = r;
            txWrites[step.tx] = null;
            continue;
          }
        }

        // For lost update på RC/RU: skrivingen overskriver basert på det de leste.
        if (scenario === "lost") {
          const baseRead = step.tx === 1 ? tx1ReadBalanceForLost : tx2ReadBalanceForLost;
          const delta = step.tx === 1 ? 10 : 20;
          const newVal = (baseRead ?? 100) + delta;
          txWrites[step.tx] = [{ id: 1, balance: newVal }];
          txWrittenKeys[step.tx].add(1);
          r.value = `balance = ${newVal} (pending)`;
          break;
        }

        // Dirty scenario: TX1 skriver 200
        if (scenario === "dirty" && step.tx === 1) {
          txWrites[1] = [{ id: 1, balance: 200 }];
          txWrittenKeys[1].add(1);
          r.value = "balance = 200 (pending)";
          break;
        }

        // Non-rep: TX2 skriver 200 og committer.
        if (scenario === "nonrep" && step.tx === 2) {
          txWrites[2] = [{ id: 1, balance: 200 }];
          txWrittenKeys[2].add(1);
          r.value = "balance = 200 (pending)";
          break;
        }

        // Generisk fallback
        txWrites[step.tx] = [{ id: 1, balance: 999 }];
        txWrittenKeys[step.tx].add(1);
        r.value = "skrev (pending)";
        break;
      }
      case "insert": {
        // Phantom: TX2 insert id=2 balance=300
        const newRow: Row = { id: 2, balance: 300 };
        const existing = txWrites[step.tx] ?? [];
        txWrites[step.tx] = [...existing, newRow];
        txWrittenKeys[step.tx].add(2);
        r.value = "id=2, balance=300 (pending)";
        break;
      }
      case "commit": {
        // Skriv pending til committed
        const pending = txWrites[step.tx];
        if (pending) {
          const ids = new Set(pending.map((p) => p.id));
          committed = [...committed.filter((row) => !ids.has(row.id)), ...pending];
          committed.sort((a, b) => a.id - b.id);
        }
        txWrites[step.tx] = null;
        txSnapshot[step.tx] = null;
        r.value = "committed";
        break;
      }
      case "rollback": {
        txWrites[step.tx] = null;
        txSnapshot[step.tx] = null;
        txWrittenKeys[step.tx].clear();
        r.value = "rolled back";
        break;
      }
    }

    results[i] = r;
  }

  return { results, finalCommitted: committed };
}

// Beregn committed-state etter de N første stegene
function simulateUpTo(scenario: ScenarioId, iso: IsolationLevel, stepCount: number): {
  results: StepResult[];
  committed: Row[];
} {
  const steps = SCENARIO_STEPS[scenario].slice(0, stepCount);
  // Kjør full simulering for å få anomali-flagg, men ta committed-state opp til stepCount.
  // Enklere: simuler bare disse stegene.
  const fullSteps = SCENARIO_STEPS[scenario];
  const full = simulate(scenario, iso);
  // Rekkjør for committed-state opp til stepCount:
  let committed: Row[] = [{ id: 1, balance: 100 }];
  const txWrites: Record<1 | 2, Row[] | null> = { 1: null, 2: null };
  for (let i = 0; i < stepCount && i < fullSteps.length; i++) {
    const step = fullSteps[i];
    const res = full.results[i];
    if (res.blocked) continue;
    if (step.kind === "write" && !res.blocked) {
      if (full.results[i].value?.includes("pending")) {
        // Re-derive pending value from result string
        const m = full.results[i].value!.match(/balance = (\d+)/);
        if (m) {
          txWrites[step.tx] = [{ id: 1, balance: Number(m[1]) }];
        }
      }
    } else if (step.kind === "insert") {
      txWrites[step.tx] = [...(txWrites[step.tx] ?? []), { id: 2, balance: 300 }];
    } else if (step.kind === "commit") {
      const pending = txWrites[step.tx];
      if (pending) {
        const ids = new Set(pending.map((p) => p.id));
        committed = [...committed.filter((row) => !ids.has(row.id)), ...pending];
        committed.sort((a, b) => a.id - b.id);
      }
      txWrites[step.tx] = null;
    } else if (step.kind === "rollback") {
      txWrites[step.tx] = null;
    }
    void steps;
  }
  // Også vis pending som skygge — returner committed kun, og la UI hente pending fra results.
  return { results: full.results, committed };
}

// Hent pending-state etter N steg for visning
function pendingAfter(scenario: ScenarioId, stepCount: number): Record<1 | 2, Row[] | null> {
  const fullSteps = SCENARIO_STEPS[scenario];
  const txWrites: Record<1 | 2, Row[] | null> = { 1: null, 2: null };
  for (let i = 0; i < stepCount && i < fullSteps.length; i++) {
    const step = fullSteps[i];
    if (step.kind === "write") {
      // Bruk verdier ifølge scenario (best effort, ikke kritisk)
      if (scenario === "dirty" && step.tx === 1) txWrites[1] = [{ id: 1, balance: 200 }];
      else if (scenario === "nonrep" && step.tx === 2) txWrites[2] = [{ id: 1, balance: 200 }];
      else if (scenario === "lost") {
        const delta = step.tx === 1 ? 10 : 20;
        txWrites[step.tx] = [{ id: 1, balance: 100 + delta }];
      }
    } else if (step.kind === "insert") {
      txWrites[step.tx] = [...(txWrites[step.tx] ?? []), { id: 2, balance: 300 }];
    } else if (step.kind === "commit" || step.kind === "rollback") {
      txWrites[step.tx] = null;
    }
  }
  return txWrites;
}

// ============== Komponent ==============

export function TransactionVisualizer() {
  const [scenario, setScenario] = useState<ScenarioId>("dirty");
  const [iso, setIso] = useState<IsolationLevel>("RU");
  const [cursor, setCursor] = useState(0); // antall utførte steg
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);

  const steps = SCENARIO_STEPS[scenario];
  const sim = useMemo(() => simulate(scenario, iso), [scenario, iso]);
  const upTo = useMemo(() => simulateUpTo(scenario, iso, cursor), [scenario, iso, cursor]);
  const pending = useMemo(() => pendingAfter(scenario, cursor), [scenario, cursor]);

  // Auto-play
  useEffect(() => {
    if (!playing) return;
    if (cursor >= steps.length) {
      setPlaying(false);
      return;
    }
    timer.current = window.setTimeout(() => setCursor((c) => c + 1), 1200);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [playing, cursor, steps.length]);

  const reset = () => {
    setCursor(0);
    setPlaying(false);
  };
  const stepOnce = () => {
    if (cursor < steps.length) setCursor(cursor + 1);
  };
  const togglePlay = () => {
    if (cursor >= steps.length) {
      setCursor(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  };

  // Bytt scenario/iso → reset
  const pickScenario = (s: ScenarioId) => {
    setScenario(s);
    setCursor(0);
    setPlaying(false);
  };
  const pickIso = (l: IsolationLevel) => {
    setIso(l);
    setCursor(0);
    setPlaying(false);
  };

  // ---- Tx-lane render ----
  const stepsForTx = (tx: 1 | 2) =>
    steps
      .map((s, i) => ({ step: s, idx: i, result: sim.results[i] }))
      .filter((x) => x.step.tx === tx);

  const isStepActive = (i: number) => i === cursor - 1;
  const isStepDone = (i: number) => i < cursor;

  const currentScenario = SCENARIOS.find((s) => s.id === scenario)!;
  const ScenarioIcon = currentScenario.icon;

  // Oppsummering: anomali skjedde / ble forhindret etter alle steg
  const anomalyEvents = sim.results.filter((r) => r.anomaly);
  const preventedEvents = sim.results.filter((r) => r.prevented);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Topp-bar */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Isolation-nivåer — se anomalier oppstå (eller forsvinne)
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="text-xs inline-flex items-center gap-1 px-2.5 py-1 rounded border border-border hover:bg-muted"
              title={playing ? "Pause" : "Spill av automatisk"}
            >
              {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {playing ? "Pause" : cursor >= steps.length ? "Spill på nytt" : "Spill"}
            </button>
            <button
              type="button"
              onClick={stepOnce}
              disabled={cursor >= steps.length}
              className="text-xs inline-flex items-center gap-1 px-2.5 py-1 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <SkipForward className="h-3 w-3" />
              Steg
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
        </div>

        {/* Scenario-velger */}
        <div className="mt-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Scenario
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SCENARIOS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => pickScenario(s.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors inline-flex items-center gap-1.5 ${
                    scenario === s.id
                      ? "bg-brand text-brand-foreground border-brand"
                      : "border-border hover:bg-muted"
                  }`}
                  title={s.desc}
                >
                  <Icon className="h-3 w-3" />
                  {s.navn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Isolation-velger */}
        <div className="mt-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Isolation level
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ISOLATION.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => pickIso(l.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium border transition-colors ${
                  iso === l.id
                    ? "bg-foreground text-background border-foreground"
                    : "border-border hover:bg-muted"
                }`}
                title={l.navn}
              >
                {l.navn}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 text-xs text-muted-foreground italic flex items-start gap-2">
          <ScenarioIcon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{currentScenario.desc}</span>
        </div>
      </div>

      {/* Timeline med to lanes */}
      <div className="p-5 bg-background">
        <div className="grid grid-cols-2 gap-4">
          <LaneHeader tx={1} />
          <LaneHeader tx={2} />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 relative">
          {steps.map((step, i) => {
            const result = sim.results[i];
            const visible = i < cursor;
            const active = isStepActive(i);
            const done = isStepDone(i);
            return (
              <StepBox
                key={i}
                step={step}
                result={result}
                visible={visible}
                active={active}
                done={done}
                stepIndex={i}
              />
            );
          })}
        </div>

        {/* Progress */}
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-300"
              style={{ width: `${(cursor / steps.length) * 100}%` }}
            />
          </div>
          <span className="font-mono tabular-nums">
            {cursor}/{steps.length}
          </span>
        </div>
      </div>

      {/* Tabell-tilstand + oppsummering */}
      <div className="grid sm:grid-cols-2 gap-0 border-t border-border">
        <div className="p-4 border-r border-border bg-muted/10">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            accounts — committed (det alle ser etter COMMIT)
          </div>
          <RowsTable rows={upTo.committed} />
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Pending skrivinger (kun synlig for egen TX)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <PendingBox tx={1} rows={pending[1]} />
              <PendingBox tx={2} rows={pending[2]} />
            </div>
          </div>
        </div>
        <div className="p-4 bg-muted/10">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Status så langt
          </div>
          {cursor === 0 && (
            <div className="text-xs text-muted-foreground italic">
              Trykk «Steg» eller «Spill» for å starte timelinen.
            </div>
          )}
          {cursor > 0 && anomalyEvents.length === 0 && preventedEvents.length === 0 && (
            <div className="text-xs text-muted-foreground">
              Ingen anomalier eller låser oppdaget enda.
            </div>
          )}
          {sim.results.slice(0, cursor).map((r, i) => {
            if (!r.anomaly && !r.prevented) return null;
            return (
              <div
                key={i}
                className={`text-xs rounded-md border px-2.5 py-1.5 mb-1.5 flex items-start gap-2 ${
                  r.anomaly
                    ? "border-destructive/50 bg-destructive/10 text-destructive"
                    : "border-success/50 bg-success/10 text-success"
                }`}
              >
                {r.anomaly ? (
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                )}
                <span>
                  <span className="font-mono mr-1">TX{steps[i].tx}:</span>
                  {r.anomaly ?? r.prevented}
                </span>
              </div>
            );
          })}

          {cursor >= steps.length && (
            <Verdict
              scenario={scenario}
              iso={iso}
              anomalyHit={anomalyEvents.length > 0}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============== Helpers ==============

function LaneHeader({ tx }: { tx: 1 | 2 }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-xs font-semibold">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            tx === 1 ? "bg-brand" : "bg-amber-500"
          }`}
        />
          Transaksjon TX{tx}
      </div>
    </div>
  );
}

function StepBox({
  step,
  result,
  visible,
  active,
  done,
  stepIndex,
}: {
  step: Step;
  result: StepResult;
  visible: boolean;
  active: boolean;
  done: boolean;
  stepIndex: number;
}) {
  const isTx1 = step.tx === 1;
  const colCls = isTx1 ? "col-start-1" : "col-start-2";

  if (!visible) {
    // Plassholder for å bevare layout
    return (
      <div className={`${colCls} h-0`} aria-hidden="true" />
    );
  }

  const anomaly = !!result.anomaly;
  const prevented = !!result.prevented;
  const blocked = !!result.blocked;

  const baseBorder = isTx1 ? "border-brand/40" : "border-amber-500/40";
  const baseBg = isTx1 ? "bg-brand/5" : "bg-amber-500/5";
  const accent = isTx1 ? "text-brand" : "text-amber-700 dark:text-amber-400";

  const kindIcon =
    step.kind === "read" || step.kind === "count" ? (
      <Eye className="h-3 w-3" />
    ) : step.kind === "write" || step.kind === "insert" ? (
      <Pencil className="h-3 w-3" />
    ) : step.kind === "commit" ? (
      <Check className="h-3 w-3" />
    ) : step.kind === "rollback" ? (
      <X className="h-3 w-3" />
    ) : null;

  return (
    <div
      className={`${colCls} rounded-lg border p-3 transition-all duration-300 ${
        anomaly
          ? "border-destructive bg-destructive/10 animate-pulse"
          : prevented || blocked
          ? "border-success bg-success/10"
          : `${baseBorder} ${baseBg}`
      } ${active ? "ring-2 ring-offset-1 ring-foreground/30" : ""} ${
        done && !active ? "opacity-90" : ""
      }`}
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold mb-1">
        <span className={accent}>#{stepIndex + 1}</span>
        {kindIcon && <span className="text-muted-foreground">{kindIcon}</span>}
        <span className="text-muted-foreground">{step.kind}</span>
      </div>
      <div className="font-mono text-xs leading-snug break-words">{step.label}</div>
      {result.value !== undefined && (
        <div className="mt-1.5 text-xs font-mono text-foreground/80">
          → {result.value}
        </div>
      )}
      {step.hint && (
        <div className="mt-1 text-[11px] text-muted-foreground italic">{step.hint}</div>
      )}
      {anomaly && (
        <div className="mt-1.5 text-[11px] text-destructive font-semibold inline-flex items-center gap-1">
          <Ghost className="h-3 w-3" />
          {step.kind === "count" ? "fantom!" : "anomali!"} {result.anomaly}
        </div>
      )}
      {(prevented || blocked) && (
        <div className="mt-1.5 text-[11px] text-success font-semibold inline-flex items-center gap-1">
          <Lock className="h-3 w-3" />
          {blocked ? "venter på lås / abortert" : "forhindret"} — {result.prevented}
        </div>
      )}
    </div>
  );
}

function RowsTable({ rows }: { rows: Row[] }) {
  return (
    <div className="rounded-md border border-border overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left font-semibold px-3 py-1.5 font-mono">id</th>
            <th className="text-left font-semibold px-3 py-1.5 font-mono">balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={2} className="px-3 py-2 text-muted-foreground italic">
                (tom)
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-3 py-1.5 font-mono">{r.id}</td>
                <td className="px-3 py-1.5 font-mono">{r.balance}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function PendingBox({ tx, rows }: { tx: 1 | 2; rows: Row[] | null }) {
  const isTx1 = tx === 1;
  return (
    <div
      className={`rounded-md border px-2 py-1.5 ${
        isTx1 ? "border-brand/40 bg-brand/5" : "border-amber-500/40 bg-amber-500/5"
      }`}
    >
      <div
        className={`text-[10px] uppercase tracking-wider font-semibold mb-0.5 ${
          isTx1 ? "text-brand" : "text-amber-700 dark:text-amber-400"
        }`}
      >
        TX{tx}
      </div>
      {!rows || rows.length === 0 ? (
        <div className="text-[11px] text-muted-foreground italic">ingen pending</div>
      ) : (
        <ul className="text-[11px] font-mono space-y-0.5">
          {rows.map((r) => (
            <li key={r.id}>
              id={r.id}, balance={r.balance}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Verdict({
  scenario,
  iso,
  anomalyHit,
}: {
  scenario: ScenarioId;
  iso: IsolationLevel;
  anomalyHit: boolean;
}) {
  const sc = SCENARIOS.find((s) => s.id === scenario)!;
  const ic = ISOLATION.find((l) => l.id === iso)!;

  return (
    <div
      className={`mt-2 rounded-lg border p-3 text-xs ${
        anomalyHit
          ? "border-destructive/50 bg-destructive/10"
          : "border-success/50 bg-success/10"
      }`}
    >
      <div className="font-semibold mb-1 inline-flex items-center gap-1.5">
        {anomalyHit ? (
          <>
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Anomali oppstod</span>
          </>
        ) : (
          <>
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Anomalien ble forhindret</span>
          </>
        )}
      </div>
      <div className="text-muted-foreground">
        Scenario «{sc.navn}» på nivå <span className="font-mono">{ic.navn}</span>:{" "}
        {anomalyHit
          ? "DB-en lot anomalien skje — du må enten heve isolation level eller låse manuelt."
          : "DB-en holdt deg trygg — enten ved snapshot, lås, eller serialization-feil."}
      </div>
    </div>
  );
}
