import { useState } from "react";
import {
  BookOpen,
  Dumbbell,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  MousePointerClick,
  Lock,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// TransaksjonsIsolasjonsDrill — interaktiv 4-stegs drill der brukeren
// diagnostiserer concurrency-anomalier i T1/T2-timelines og velger riktig
// isolation level.
//
//   1) Identifiser Dirty Read — T1 leser ucommittet UPDATE fra T2, T2 ROLLBACK
//   2) Velg isolation level for å forhindre Dirty Read — READ COMMITTED
//   3) Non-repeatable Read — to substeg: gjenkjenn anomalien, velg nivået
//   4) Trade-off — bank-app: minste nivå som tåler use-casen
//
// To globale moduser (per user-memory feedback_drill_learn_then_practice):
//   - «Lær først» (default): viser fasit + forklaring uten å kreve riktig svar
//   - «Test deg selv»: skjuler fasit, krever riktig svar for å gå videre
// ---------------------------------------------------------------------------

type Mode = "learn" | "drill";
type StepStatus = "idle" | "wrong" | "correct";

// ---------- Steg 1 ----------
type AnomalyId = "dirty" | "nonrep" | "phantom" | "lost";
const ANOMALY_OPTIONS: { id: AnomalyId; label: string; blurb: string }[] = [
  { id: "dirty", label: "Dirty Read", blurb: "Leser en verdi som aldri ble committet." },
  { id: "nonrep", label: "Non-repeatable Read", blurb: "Samme rad gir to ulike verdier." },
  { id: "phantom", label: "Phantom Read", blurb: "Ny rad dukker opp ved samme WHERE." },
  { id: "lost", label: "Lost Update", blurb: "To skrivinger overlapper; én forsvinner." },
];
const STEP1_CORRECT: AnomalyId = "dirty";

// ---------- Steg 2 ----------
type LevelId = "RU" | "RC" | "RR" | "SR";
const LEVEL_OPTIONS: { id: LevelId; label: string; blurb: string }[] = [
  { id: "RU", label: "READ UNCOMMITTED", blurb: "Svakeste. Tillater alt — også dirty read." },
  { id: "RC", label: "READ COMMITTED", blurb: "Default i Postgres/Oracle. Bare committet data." },
  { id: "RR", label: "REPEATABLE READ", blurb: "Default i MySQL/InnoDB. Rader fryser i T1." },
  { id: "SR", label: "SERIALIZABLE", blurb: "Strikteste. Som om transaksjonene var sekvensielle." },
];
const STEP2_CORRECT: LevelId = "RC";

// ---------- Steg 3 (combined 2-substep) ----------
const STEP3_ANOMALY_CORRECT: AnomalyId = "nonrep";
const STEP3_LEVEL_CORRECT: LevelId = "RR";

// ---------- Steg 4 ----------
const STEP4_CORRECT: LevelId = "RC";

const STEPS_META = [
  { idx: 0, label: "Anomali 1", title: "Hva slags anomali skjedde her?" },
  { idx: 1, label: "Nivå 1", title: "Hvilket nivå forhindrer Dirty Read?" },
  { idx: 2, label: "Anomali 2", title: "Diagnostiser og velg nivå" },
  { idx: 3, label: "Trade-off", title: "Velg nivå for bank-app" },
];

// ---------- Timeline data ----------
type RowKind = "begin" | "read" | "write" | "commit" | "rollback";
type TimelineRow = {
  t: number;
  tx: 1 | 2;
  kind: RowKind;
  label: string;
  note?: string;
  problem?: boolean;
};

// Steg 1 / 2 timeline: Dirty Read
const TIMELINE_DIRTY: TimelineRow[] = [
  { t: 1, tx: 1, kind: "begin", label: "BEGIN" },
  { t: 2, tx: 2, kind: "begin", label: "BEGIN" },
  {
    t: 3,
    tx: 2,
    kind: "write",
    label: "UPDATE Konto SET saldo = 0 WHERE id=1",
    note: "ennå ikke committed",
  },
  {
    t: 4,
    tx: 1,
    kind: "read",
    label: "SELECT saldo FROM Konto WHERE id=1",
    note: "leser 0 — verdien er ucommittet!",
    problem: true,
  },
  { t: 5, tx: 2, kind: "rollback", label: "ROLLBACK", note: "T2 angrer — saldoen er fortsatt 100" },
  {
    t: 6,
    tx: 1,
    kind: "commit",
    label: "COMMIT",
    note: "T1 sitter med en verdi som aldri eksisterte",
  },
];

// Steg 3 timeline: Non-repeatable Read
const TIMELINE_NONREP: TimelineRow[] = [
  { t: 1, tx: 1, kind: "begin", label: "BEGIN" },
  { t: 2, tx: 1, kind: "read", label: "SELECT saldo FROM Konto WHERE id=1", note: "leser 100" },
  { t: 3, tx: 2, kind: "begin", label: "BEGIN" },
  { t: 4, tx: 2, kind: "write", label: "UPDATE Konto SET saldo = 200 WHERE id=1" },
  { t: 5, tx: 2, kind: "commit", label: "COMMIT" },
  {
    t: 6,
    tx: 1,
    kind: "read",
    label: "SELECT saldo FROM Konto WHERE id=1",
    note: "leser 200 — samme rad, ny verdi!",
    problem: true,
  },
  { t: 7, tx: 1, kind: "commit", label: "COMMIT" },
];

export function TransaksjonsIsolasjonsDrill() {
  const [mode, setMode] = useState<Mode>("learn");
  const [stepIdx, setStepIdx] = useState(0);

  // Steg 1: pick anomaly
  const [s1Pick, setS1Pick] = useState<AnomalyId | null>(null);
  const [s1Status, setS1Status] = useState<StepStatus>("idle");

  // Steg 2: pick level
  const [s2Pick, setS2Pick] = useState<LevelId | null>(null);
  const [s2Status, setS2Status] = useState<StepStatus>("idle");

  // Steg 3: combined — pick anomaly + level
  const [s3PickAnomaly, setS3PickAnomaly] = useState<AnomalyId | null>(null);
  const [s3StatusAnomaly, setS3StatusAnomaly] = useState<StepStatus>("idle");
  const [s3PickLevel, setS3PickLevel] = useState<LevelId | null>(null);
  const [s3StatusLevel, setS3StatusLevel] = useState<StepStatus>("idle");

  // Steg 4: trade-off
  const [s4Pick, setS4Pick] = useState<LevelId | null>(null);
  const [s4Status, setS4Status] = useState<StepStatus>("idle");

  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const learnMode = mode === "learn";

  function onModeChange(m: Mode) {
    setMode(m);
    if (m === "learn") {
      setS1Pick(STEP1_CORRECT);
      setS1Status("correct");
      setS2Pick(STEP2_CORRECT);
      setS2Status("correct");
      setS3PickAnomaly(STEP3_ANOMALY_CORRECT);
      setS3StatusAnomaly("correct");
      setS3PickLevel(STEP3_LEVEL_CORRECT);
      setS3StatusLevel("correct");
      setS4Pick(STEP4_CORRECT);
      setS4Status("correct");
      setCompletedSteps(new Set([0, 1, 2, 3]));
    } else {
      resetAll();
    }
  }

  function resetAll() {
    setStepIdx(0);
    setS1Pick(null);
    setS1Status("idle");
    setS2Pick(null);
    setS2Status("idle");
    setS3PickAnomaly(null);
    setS3StatusAnomaly("idle");
    setS3PickLevel(null);
    setS3StatusLevel("idle");
    setS4Pick(null);
    setS4Status("idle");
    setCompletedSteps(new Set());
  }

  // -------- Handlers --------
  function onPickStep1(id: AnomalyId) {
    if (learnMode) return;
    setS1Pick(id);
    setS1Status(id === STEP1_CORRECT ? "correct" : "wrong");
  }
  function onPickStep2(id: LevelId) {
    if (learnMode) return;
    setS2Pick(id);
    setS2Status(id === STEP2_CORRECT ? "correct" : "wrong");
  }
  function onPickStep3Anomaly(id: AnomalyId) {
    if (learnMode) return;
    setS3PickAnomaly(id);
    setS3StatusAnomaly(id === STEP3_ANOMALY_CORRECT ? "correct" : "wrong");
  }
  function onPickStep3Level(id: LevelId) {
    if (learnMode) return;
    setS3PickLevel(id);
    setS3StatusLevel(id === STEP3_LEVEL_CORRECT ? "correct" : "wrong");
  }
  function onPickStep4(id: LevelId) {
    if (learnMode) return;
    setS4Pick(id);
    setS4Status(id === STEP4_CORRECT ? "correct" : "wrong");
  }

  const step1Done = s1Status === "correct";
  const step2Done = s2Status === "correct";
  const step3Done = s3StatusAnomaly === "correct" && s3StatusLevel === "correct";
  const step4Done = s4Status === "correct";

  const stepDone = [step1Done, step2Done, step3Done, step4Done];
  const allDone = stepDone.every(Boolean);

  function canAdvance() {
    if (learnMode) return true;
    return stepDone[stepIdx];
  }
  function onNext() {
    if (!canAdvance()) return;
    setCompletedSteps((prev) => new Set(prev).add(stepIdx));
    if (stepIdx < STEPS_META.length - 1) setStepIdx(stepIdx + 1);
  }
  function onPrev() {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  }

  return (
    <section id="drill" className="mb-12">
      <h2 className="text-xl font-semibold mb-2">Prøv selv — diagnostiser anomalien</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Du får se to samtidige transaksjoner T1 og T2 mot tabellen{" "}
        <code className="font-mono text-foreground">Konto(id, saldo)</code>. Din oppgave: gjenkjenn
        anomalien som skjer, og velg minste isolation level som hadde forhindret den. Bytt mellom{" "}
        <span className="text-foreground">Lær først</span> (ser fasit + forklaring) og{" "}
        <span className="text-foreground">Test deg selv</span> (må svare riktig for å gå videre).
      </p>

      {/* Modus-toggle */}
      <div
        role="tablist"
        aria-label="Modus"
        className="mb-4 inline-flex rounded-lg border border-border bg-muted/30 p-1"
      >
        <button
          role="tab"
          aria-selected={mode === "learn"}
          onClick={() => onModeChange("learn")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            mode === "learn"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <BookOpen className="h-3.5 w-3.5" /> Lær først
        </button>
        <button
          role="tab"
          aria-selected={mode === "drill"}
          onClick={() => onModeChange("drill")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            mode === "drill"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Dumbbell className="h-3.5 w-3.5" /> Test deg selv
        </button>
      </div>

      {/* Progress-strip + meta */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {STEPS_META.map((m, i) => {
              const done = completedSteps.has(i) || stepDone[i];
              const active = i === stepIdx;
              return (
                <button
                  key={m.idx}
                  onClick={() => setStepIdx(i)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors flex items-center gap-1.5",
                    active
                      ? "border-brand bg-brand/10 text-brand"
                      : done
                        ? "border-success/50 text-success hover:bg-success/5"
                        : "border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  {done && !active ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <span className="font-bold">{i + 1}</span>
                  )}
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs tabular-nums text-muted-foreground">
              Steg {stepIdx + 1} / {STEPS_META.length}
            </span>
            <button
              onClick={onPrev}
              disabled={stepIdx === 0}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Forrige steg"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={onNext}
              disabled={!canAdvance() || stepIdx === STEPS_META.length - 1}
              className="flex h-7 items-center justify-center rounded-md border border-brand bg-brand/10 px-2 text-xs text-brand hover:bg-brand/20 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Neste steg"
            >
              Neste <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </button>
            <button
              onClick={resetAll}
              className="flex h-7 items-center justify-center rounded-md border border-border px-2 text-xs text-muted-foreground hover:bg-accent"
              title="Start på nytt"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="mt-3 text-sm font-semibold text-foreground">
          {STEPS_META[stepIdx].title}
        </div>
      </div>

      {/* Akkumulert kontekst */}
      {stepIdx > 0 && completedSteps.size > 0 && (
        <PreviousStepsSummary completed={completedSteps} />
      )}

      {/* Aktivt steg */}
      <div className="mt-4">
        {stepIdx === 0 && (
          <Step1View learnMode={learnMode} pick={s1Pick} status={s1Status} onPick={onPickStep1} />
        )}
        {stepIdx === 1 && (
          <Step2View learnMode={learnMode} pick={s2Pick} status={s2Status} onPick={onPickStep2} />
        )}
        {stepIdx === 2 && (
          <Step3View
            learnMode={learnMode}
            pickAnomaly={s3PickAnomaly}
            statusAnomaly={s3StatusAnomaly}
            pickLevel={s3PickLevel}
            statusLevel={s3StatusLevel}
            onPickAnomaly={onPickStep3Anomaly}
            onPickLevel={onPickStep3Level}
          />
        )}
        {stepIdx === 3 && (
          <Step4View learnMode={learnMode} pick={s4Pick} status={s4Status} onPick={onPickStep4} />
        )}
      </div>

      {allDone && stepIdx === STEPS_META.length - 1 && <DonePanel onReset={resetAll} />}
    </section>
  );
}

// ===========================================================================
// Steg 1 — Identifiser Dirty Read
// ===========================================================================

function Step1View({
  learnMode,
  pick,
  status,
  onPick,
}: {
  learnMode: boolean;
  pick: AnomalyId | null;
  status: StepStatus;
  onPick: (id: AnomalyId) => void;
}) {
  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <Prompt
        icon={<MousePointerClick className="h-4 w-4" />}
        text="Studer timelinen. T1 leste saldoen 0, men T2 rullet alt tilbake. Hva slags anomali er dette?"
      />

      <Timeline rows={TIMELINE_DIRTY} />

      <div className="mt-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Hvilken anomali skjedde?
      </div>
      <OptionList
        options={ANOMALY_OPTIONS.map((o) => ({ id: o.id, label: o.label, blurb: o.blurb }))}
        pick={pick}
        correctId={STEP1_CORRECT}
        status={status}
        learnMode={learnMode}
        onPick={(id) => onPick(id as AnomalyId)}
      />

      {learnMode && (
        <Hint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="Hvorfor Dirty Read?"
          body="T1 leste en verdi (0) som T2 hadde skrevet, men IKKE committet. Da T2 rullet tilbake, satt T1 igjen med en verdi som offisielt aldri eksisterte i databasen. Akkurat dét er definisjonen på Dirty Read."
        />
      )}
      {!learnMode && status === "wrong" && (
        <Hint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body="Tips: spørsmålet er hva som er spesielt med å lese en verdi før den blir committet, og når den senere blir rullet tilbake."
        />
      )}
      {!learnMode && status === "correct" && (
        <Hint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig!"
          body="T1 leste ucommittet data fra T2, og T2 rullet tilbake. Det er Dirty Read. Trykk «Neste» for å velge nivå som forhindrer det."
        />
      )}
    </div>
  );
}

// ===========================================================================
// Steg 2 — Velg isolation level mot Dirty Read
// ===========================================================================

function Step2View({
  learnMode,
  pick,
  status,
  onPick,
}: {
  learnMode: boolean;
  pick: LevelId | null;
  status: StepStatus;
  onPick: (id: LevelId) => void;
}) {
  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <Prompt
        icon={<Lock className="h-4 w-4" />}
        text="Samme scenario. Hvilket nivå er MINIMUM for å forhindre Dirty Read?"
      />

      {/* Mindre timeline som påminnelse */}
      <Timeline rows={TIMELINE_DIRTY} compact />

      <div className="mt-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Velg isolation level
      </div>
      <OptionList
        options={LEVEL_OPTIONS.map((o) => ({ id: o.id, label: o.label, blurb: o.blurb }))}
        pick={pick}
        correctId={STEP2_CORRECT}
        status={status}
        learnMode={learnMode}
        onPick={(id) => onPick(id as LevelId)}
      />

      {learnMode && (
        <Hint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="Hvorfor READ COMMITTED?"
          body="READ UNCOMMITTED tillater nettopp dirty read (definisjonen). READ COMMITTED garanterer at du kun ser committet data — T1s SELECT vil enten vente til T2 commits/rollback, eller se den gamle versjonen via MVCC. Det er det minste nivået som tetter Dirty Read. Strengere nivåer (RR/SR) forhindrer det også, men gir mindre samtidighet enn nødvendig."
        />
      )}
      {!learnMode && status === "wrong" && (
        <Hint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body="READ UNCOMMITTED er for svakt — det er nettopp dét nivået som TILLATER dirty read. Du vil ha det neste opp, det som krever committet data, men ikke nødvendigvis fryser raden."
        />
      )}
      {!learnMode && status === "correct" && (
        <Hint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig!"
          body="READ COMMITTED er minste nivå som tetter Dirty Read. Strengere nivåer hadde også fungert, men koster mer i samtidighet."
        />
      )}
    </div>
  );
}

// ===========================================================================
// Steg 3 — Non-repeatable Read (anomali + nivå)
// ===========================================================================

function Step3View({
  learnMode,
  pickAnomaly,
  statusAnomaly,
  pickLevel,
  statusLevel,
  onPickAnomaly,
  onPickLevel,
}: {
  learnMode: boolean;
  pickAnomaly: AnomalyId | null;
  statusAnomaly: StepStatus;
  pickLevel: LevelId | null;
  statusLevel: StepStatus;
  onPickAnomaly: (id: AnomalyId) => void;
  onPickLevel: (id: LevelId) => void;
}) {
  const anomalyDone = statusAnomaly === "correct";

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <Prompt
        icon={<MousePointerClick className="h-4 w-4" />}
        text="Nytt scenario. T1 leser saldo, T2 endrer og commits, T1 leser igjen — får forskjellig verdi. Diagnostiser og velg nivå."
      />

      <Timeline rows={TIMELINE_NONREP} />

      {/* Substep 1: anomali */}
      <div className="mt-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <span className="rounded-full bg-brand/15 text-brand h-5 w-5 inline-flex items-center justify-center text-[10px] font-bold">
          a
        </span>
        Hvilken anomali?
      </div>
      <OptionList
        options={ANOMALY_OPTIONS.map((o) => ({ id: o.id, label: o.label, blurb: o.blurb }))}
        pick={pickAnomaly}
        correctId={STEP3_ANOMALY_CORRECT}
        status={statusAnomaly}
        learnMode={learnMode}
        onPick={(id) => onPickAnomaly(id as AnomalyId)}
      />

      {learnMode && (
        <Hint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="Hvorfor Non-repeatable Read?"
          body="T1 leser samme rad to ganger og får ulik verdi (100 → 200), fordi T2 commiterte en endring i mellomtiden. Dette er IKKE Dirty Read — T1 leste committet data begge ganger. Det er IKKE Phantom — det er samme rad, ikke en ny rad. Det er IKKE Lost Update — T1 oppdaterer ikke. Non-repeatable Read."
        />
      )}
      {!learnMode && statusAnomaly === "wrong" && (
        <Hint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body="Tips: T1 leser SAMME rad to ganger og får ulik verdi. Begge lesninger er av committet data. Ingen nye rader dukker opp. Hvilken anomali matcher det?"
        />
      )}
      {!learnMode && statusAnomaly === "correct" && (
        <Hint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig — Non-repeatable Read."
          body="T1 ser to ulike verdier av samme rad fordi T2 endret og committet imellom. Nå må du velge minste nivå som forhindrer det."
        />
      )}

      {/* Substep 2: nivå — vises kun når anomali er valgt (eller i learn-modus) */}
      {(learnMode || anomalyDone) && (
        <>
          <div className="mt-5 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="rounded-full bg-brand/15 text-brand h-5 w-5 inline-flex items-center justify-center text-[10px] font-bold">
              b
            </span>
            Minste nivå som forhindrer det
          </div>
          <OptionList
            options={LEVEL_OPTIONS.map((o) => ({ id: o.id, label: o.label, blurb: o.blurb }))}
            pick={pickLevel}
            correctId={STEP3_LEVEL_CORRECT}
            status={statusLevel}
            learnMode={learnMode}
            onPick={(id) => onPickLevel(id as LevelId)}
          />

          {learnMode && (
            <Hint
              tone="info"
              icon={<Lightbulb className="h-4 w-4" />}
              title="Hvorfor REPEATABLE READ?"
              body="READ COMMITTED tillater fortsatt non-repeatable read — du leser bare committet data, men ikke samme committet data hver gang. REPEATABLE READ låser (eller versjonerer) hver rad T1 har lest, slik at T1 ser samme verdi gjennom hele transaksjonen. Minste nivå som tetter dette."
            />
          )}
          {!learnMode && statusLevel === "wrong" && (
            <Hint
              tone="warn"
              icon={<AlertTriangle className="h-4 w-4" />}
              title="Ikke helt."
              body="READ COMMITTED tetter Dirty Read, men IKKE Non-repeatable Read — du leser fortsatt forskjellig committet versjon hver gang. Du må ett hakk strengere."
            />
          )}
          {!learnMode && statusLevel === "correct" && (
            <Hint
              tone="success"
              icon={<CheckCircle2 className="h-4 w-4" />}
              title="Riktig — REPEATABLE READ."
              body="Hver rad T1 leser er låst inn for hele T1s levetid. T2s commit blir usynlig for T1."
            />
          )}
        </>
      )}
    </div>
  );
}

// ===========================================================================
// Steg 4 — Trade-off (bank-app)
// ===========================================================================

const TRADEOFF_TABLE: {
  id: LevelId;
  level: string;
  dirty: string;
  nonrep: string;
  phantom: string;
  throughput: string;
}[] = [
  {
    id: "RU",
    level: "READ UNCOMMITTED",
    dirty: "Mulig",
    nonrep: "Mulig",
    phantom: "Mulig",
    throughput: "Høyest — minimalt med låser",
  },
  {
    id: "RC",
    level: "READ COMMITTED",
    dirty: "Nei",
    nonrep: "Mulig",
    phantom: "Mulig",
    throughput: "Høy — låser kun ved skriving",
  },
  {
    id: "RR",
    level: "REPEATABLE READ",
    dirty: "Nei",
    nonrep: "Nei",
    phantom: "Mulig (SQL-std)",
    throughput: "Middels — holder leselåser",
  },
  {
    id: "SR",
    level: "SERIALIZABLE",
    dirty: "Nei",
    nonrep: "Nei",
    phantom: "Nei",
    throughput: "Lavest — kan kaste serialization-feil",
  },
];

function Step4View({
  learnMode,
  pick,
  status,
  onPick,
}: {
  learnMode: boolean;
  pick: LevelId | null;
  status: StepStatus;
  onPick: (id: LevelId) => void;
}) {
  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <Prompt
        icon={<Lock className="h-4 w-4" />}
        text="Du designer en bank-app som leser mye, IKKE kan tåle Dirty Read, men KAN leve med Non-repeatable Read. Hvilket nivå velger du?"
      />

      <div className="overflow-x-auto rounded-lg border border-border mb-4">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left font-semibold px-3 py-2">Nivå</th>
              <th className="text-left font-semibold px-2 py-2">Dirty</th>
              <th className="text-left font-semibold px-2 py-2">Non-rep</th>
              <th className="text-left font-semibold px-2 py-2">Phantom</th>
              <th className="text-left font-semibold px-3 py-2">Throughput</th>
            </tr>
          </thead>
          <tbody>
            {TRADEOFF_TABLE.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-3 py-2 font-mono text-brand">{r.level}</td>
                <td
                  className={cn(
                    "px-2 py-2",
                    r.dirty === "Mulig" ? "text-destructive" : "text-success",
                  )}
                >
                  {r.dirty}
                </td>
                <td
                  className={cn(
                    "px-2 py-2",
                    r.nonrep === "Mulig" ? "text-amber-600 dark:text-amber-400" : "text-success",
                  )}
                >
                  {r.nonrep}
                </td>
                <td
                  className={cn(
                    "px-2 py-2",
                    r.phantom.startsWith("Mulig")
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-success",
                  )}
                >
                  {r.phantom}
                </td>
                <td className="px-3 py-2 text-muted-foreground">{r.throughput}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Velg nivå
      </div>
      <OptionList
        options={LEVEL_OPTIONS.map((o) => ({ id: o.id, label: o.label, blurb: o.blurb }))}
        pick={pick}
        correctId={STEP4_CORRECT}
        status={status}
        learnMode={learnMode}
        onPick={(id) => onPick(id as LevelId)}
      />

      {learnMode && (
        <Hint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="Regel: minste nivå som tåler use-casen"
          body="Kravet er «ingen Dirty Read, men non-repeatable read er OK». Minste nivå som oppfyller det er READ COMMITTED. REPEATABLE READ eller SERIALIZABLE ville også fungert, men koster unødvendig mye throughput. Tommel-fingerregel: strengere nivå = mindre samtidighet. Velg det svakeste nivået som dekker reglene dine."
        />
      )}
      {!learnMode && status === "wrong" && pick && (
        <Hint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body={
            pick === "RU"
              ? "READ UNCOMMITTED tillater Dirty Read — det bryter kravet."
              : pick === "RR" || pick === "SR"
                ? "Strengere enn nødvendig. Use-casen tåler Non-repeatable Read, så du betaler unødvendig mye i throughput."
                : "Tenk: hva er det MINSTE nivået som tetter Dirty Read men slipper unna med litt Non-repeatable Read?"
          }
        />
      )}
      {!learnMode && status === "correct" && (
        <Hint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig — READ COMMITTED."
          body="Strengere nivå = mindre samtidighet. Velg det svakeste nivået som tåler kravene dine."
        />
      )}
    </div>
  );
}

// ===========================================================================
// Ferdig-panel
// ===========================================================================

function DonePanel({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-6 rounded-xl border-2 border-success/50 bg-success/5 p-5">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-5 w-5 text-success" />
        <h3 className="font-semibold text-lg text-success">Bra jobba!</h3>
      </div>
      <p className="text-sm text-foreground mb-3">
        Du gjenkjenner nå <strong>Dirty Read</strong> og <strong>Non-repeatable Read</strong> i en
        T1/T2-timeline, og kan velge isolation level som funksjon av krav vs. throughput-trade-off.
        Regelen å huske:{" "}
        <em>strengere nivå = mindre samtidighet — velg minste nivå som tåler use-casen</em>.
      </p>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-1.5 rounded-md border border-brand bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/20"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Start på nytt
      </button>
    </div>
  );
}

// ===========================================================================
// Akkumulert kontekst — kort sammendrag av tidligere steg
// ===========================================================================

function PreviousStepsSummary({ completed }: { completed: Set<number> }) {
  const cards: { title: string; text: string }[] = [];
  if (completed.has(0)) {
    cards.push({
      title: "Steg 1 ✓ Dirty Read",
      text: "T1 leste ucommittet verdi fra T2; T2 rullet tilbake.",
    });
  }
  if (completed.has(1)) {
    cards.push({
      title: "Steg 2 ✓ READ COMMITTED",
      text: "Minste nivå som tetter Dirty Read.",
    });
  }
  if (completed.has(2)) {
    cards.push({
      title: "Steg 3 ✓ Non-rep + RR",
      text: "T1 så to ulike verdier; REPEATABLE READ låser raden.",
    });
  }
  if (cards.length === 0) return null;
  return (
    <div className="mt-2 grid sm:grid-cols-3 gap-2">
      {cards.map((c) => (
        <div key={c.title} className="rounded-md border border-success/30 bg-success/5 px-3 py-2">
          <div className="text-xs font-semibold text-success">{c.title}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{c.text}</div>
        </div>
      ))}
    </div>
  );
}

// ===========================================================================
// Hjelpe-komponenter
// ===========================================================================

function Prompt({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="mb-3 flex items-start gap-2 text-sm">
      <span className="text-brand mt-0.5 shrink-0">{icon}</span>
      <span className="text-foreground">{text}</span>
    </div>
  );
}

function Hint({
  tone,
  icon,
  title,
  body,
}: {
  tone: "info" | "warn" | "success";
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const styles =
    tone === "info"
      ? "border-brand/30 bg-brand/5 text-foreground"
      : tone === "warn"
        ? "border-destructive/30 bg-destructive/5 text-foreground"
        : "border-success/30 bg-success/5 text-foreground";
  const iconColor =
    tone === "info" ? "text-brand" : tone === "warn" ? "text-destructive" : "text-success";
  const titleColor =
    tone === "info" ? "text-brand" : tone === "warn" ? "text-destructive" : "text-success";

  return (
    <div className={cn("mt-3 rounded-lg border p-3 flex items-start gap-2", styles)}>
      <span className={cn("mt-0.5 shrink-0", iconColor)}>{icon}</span>
      <div className="text-sm">
        <strong className={titleColor}>{title}</strong> <span>{body}</span>
      </div>
    </div>
  );
}

function OptionList<T extends string>({
  options,
  pick,
  correctId,
  status,
  learnMode,
  onPick,
}: {
  options: { id: T; label: string; blurb: string }[];
  pick: T | null;
  correctId: T;
  status: StepStatus;
  learnMode: boolean;
  onPick: (id: T) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((o) => {
        const isPicked = pick === o.id;
        const isCorrectAnswer = o.id === correctId;
        const showCorrectInLearn = learnMode && isCorrectAnswer;
        const showWrong = !learnMode && isPicked && status === "wrong";
        const showRight = !learnMode && isPicked && status === "correct";
        const dimmed = learnMode && !isCorrectAnswer;
        return (
          <button
            key={o.id}
            onClick={() => onPick(o.id)}
            disabled={learnMode}
            className={cn(
              "w-full text-left rounded-lg border px-3 py-2.5 transition-colors flex items-start gap-3",
              showCorrectInLearn && "border-success bg-success/10",
              showWrong && "border-destructive bg-destructive/10",
              showRight && "border-success bg-success/10",
              !showCorrectInLearn &&
                !showWrong &&
                !showRight &&
                "border-border bg-background hover:bg-accent",
              dimmed && "opacity-50",
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="font-mono text-sm font-semibold text-foreground">{o.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{o.blurb}</div>
            </div>
            {(showCorrectInLearn || showRight) && (
              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
            )}
            {showWrong && <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />}
          </button>
        );
      })}
    </div>
  );
}

// ===========================================================================
// Timeline — to kolonner T1 / T2 med kronologiske rader
// ===========================================================================

function Timeline({ rows, compact }: { rows: TimelineRow[]; compact?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className="grid grid-cols-[2rem_1fr_1fr] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40 border-b border-border">
        <div className="px-2 py-1.5 text-center border-r border-border">t</div>
        <div className="px-2 py-1.5 border-r border-border flex items-center gap-1.5">
          <Database className="h-3 w-3 text-brand" /> T1
        </div>
        <div className="px-2 py-1.5 flex items-center gap-1.5">
          <Database className="h-3 w-3 text-brand" /> T2
        </div>
      </div>
      <div>
        {rows.map((r) => (
          <TimelineRowView key={r.t} row={r} compact={compact} />
        ))}
      </div>
    </div>
  );
}

function TimelineRowView({ row, compact }: { row: TimelineRow; compact?: boolean }) {
  const cellPad = compact ? "px-2 py-1" : "px-2 py-1.5";

  return (
    <div className="grid grid-cols-[2rem_1fr_1fr] border-t border-border/60 first:border-t-0">
      <div
        className={cn(
          "text-center font-mono text-[10px] text-muted-foreground border-r border-border bg-muted/20 flex items-center justify-center",
          cellPad,
        )}
      >
        {row.t}
      </div>
      <div className={cn("border-r border-border", cellPad)}>
        {row.tx === 1 ? (
          <OpBox row={row} compact={compact} />
        ) : (
          <span className="text-muted-foreground/40 text-[10px]">—</span>
        )}
      </div>
      <div className={cellPad}>
        {row.tx === 2 ? (
          <OpBox row={row} compact={compact} />
        ) : (
          <span className="text-muted-foreground/40 text-[10px]">—</span>
        )}
      </div>
    </div>
  );
}

function OpBox({ row, compact }: { row: TimelineRow; compact?: boolean }) {
  const tone = kindTone(row.kind);
  const labelSize = compact ? "text-[10px]" : "text-[11px]";
  const noteSize = compact ? "text-[10px]" : "text-[11px]";
  return (
    <div className="space-y-0.5">
      <div
        className={cn(
          "rounded border px-1.5 py-0.5 font-mono break-words",
          labelSize,
          row.problem ? "border-destructive bg-destructive/10 text-destructive" : tone,
        )}
      >
        {row.label}
      </div>
      {row.note && (
        <div
          className={cn(
            noteSize,
            row.problem ? "text-destructive font-semibold" : "text-muted-foreground italic",
          )}
        >
          {row.problem ? "⚠ " : ""}
          {row.note}
        </div>
      )}
    </div>
  );
}

function kindTone(k: RowKind) {
  switch (k) {
    case "begin":
      return "border-brand/40 bg-brand/5 text-brand";
    case "read":
      return "border-border bg-card text-foreground";
    case "write":
      return "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "commit":
      return "border-success/40 bg-success/10 text-success";
    case "rollback":
      return "border-destructive/40 bg-destructive/10 text-destructive";
  }
}
