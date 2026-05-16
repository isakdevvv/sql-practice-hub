import { useState } from "react";
import {
  BookOpen,
  Dumbbell,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  MousePointerClick,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Database,
  Gauge,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// IndeksDrill — interaktiv 4-stegs drill der brukeren velger riktig
// indeks-strategi for trege spørringer mot Ordre-tabellen (1 mill rader).
//
//   1) Identifiser sekvensiell skanning (Seq Scan vs Index Scan / Lock / Sort)
//   2) Velg riktig single-kolonne-indeks (kundeId vs status vs sum)
//   3) Composite-indeks-prioritering (kundeId, opprettet) vs (opprettet, kundeId)
//   4) Når IKKE bruke indeks — full / delvis / ingen ved lav selektivitet
//
// To globale moduser (per user-memory `feedback_drill_learn_then_practice`):
//   - «Lær først»: viser fasit + forklaring uten å kreve riktig svar
//   - «Test deg selv»: skjuler fasit, krever riktig svar for å gå videre
//
// Eksempel-tabell brukes gjennom alle stegene:
//   Ordre(id PK, kundeId, opprettet, status, sum) — 1 000 000 rader
// ---------------------------------------------------------------------------

type Mode = "learn" | "drill";
type StepStatus = "idle" | "wrong" | "correct";

// ---------- Steg 1: identifiser problemet ----------
type ProblemOption = {
  id: string;
  label: string;
  explain: string;
  correct?: boolean;
};

const STEP1_OPTIONS: ProblemOption[] = [
  {
    id: "index-scan",
    label: "Index Scan",
    explain:
      "Nei — plannen sier «Seq Scan», ikke Index Scan. En Index Scan ville vært løsningen, ikke problemet.",
  },
  {
    id: "seq-scan",
    label: "Sekvensiell skanning",
    correct: true,
    explain:
      "Riktig! «Seq Scan» betyr at DB-en leser hver eneste av de 1 000 000 radene for å finne kundeId = 42. Uten indeks har den ingen annen vei.",
  },
  {
    id: "lock",
    label: "Lock contention",
    explain:
      "Nei — plannen viser leseplanen, ikke låsing. Lock contention vises på en helt annen måte (pg_locks/waits).",
  },
  {
    id: "sort",
    label: "Sorting",
    explain:
      "Nei — det er ingen ORDER BY eller GROUP BY i spørringen. Plannen viser ingen Sort-node.",
  },
];

// ---------- Steg 2: velg riktig indeks-kolonne ----------
type IndexOption = {
  id: string;
  ddl: string;
  col: string;
  explain: string;
  correct?: boolean;
};

const STEP2_OPTIONS: IndexOption[] = [
  {
    id: "kundeId",
    ddl: "CREATE INDEX idx_ordre_kunde ON Ordre(kundeId);",
    col: "kundeId",
    correct: true,
    explain:
      "Riktig! Spørringen filtrerer på kundeId — så indeksen må være på den kolonnen. DB-en kan da hoppe rett til alle ordre for kunde 42 i stedet for å lese 1 million rader.",
  },
  {
    id: "status",
    ddl: "CREATE INDEX idx_ordre_status ON Ordre(status);",
    col: "status",
    explain:
      "status ville hjulpet en query som filtrerer på status, ikke kundeId. Indeksen må stå på samme kolonne som WHERE-klausulen.",
  },
  {
    id: "sum",
    ddl: "CREATE INDEX idx_ordre_sum ON Ordre(sum);",
    col: "sum",
    explain:
      "sum ville hjulpet f.eks. WHERE sum > 1000 eller ORDER BY sum. Den hjelper ikke for WHERE kundeId = 42 — feil kolonne.",
  },
];

// ---------- Steg 3: composite-rekkefølge ----------
type CompositeOption = {
  id: string;
  cols: [string, string];
  explain: string;
  correct?: boolean;
};

const STEP3_OPTIONS: CompositeOption[] = [
  {
    id: "kunde-first",
    cols: ["kundeId", "opprettet"],
    correct: true,
    explain:
      "Riktig! Equality-filter (kundeId = 42) først, så range (opprettet > '2024-01-01'). DB-en navigerer rett til kunde 42 i B-treet, og leser så et sammenhengende interval av datoer for den kunden — én rask navigasjon + ett range-scan.",
  },
  {
    id: "dato-first",
    cols: ["opprettet", "kundeId"],
    explain:
      "Nei. Med opprettet først må DB-en skanne ALLE rader med opprettet > '2024-01-01' (kanskje 500 000), og filtrere kundeId etterpå. Range-kolonnen først ødelegger nytten av equality-kolonnen.",
  },
];

// ---------- Steg 4: når IKKE bruke indeks ----------
type StrategyOption = {
  id: string;
  label: string;
  ddl?: string;
  explain: string;
  correct?: boolean;
};

const STEP4_OPTIONS: StrategyOption[] = [
  {
    id: "full-index",
    label: "Lag full indeks på status",
    ddl: "CREATE INDEX idx_ordre_status ON Ordre(status);",
    explain:
      "Nei. Spørringen treffer 80% av radene — DB-en velger Seq Scan uansett fordi det er raskere enn å hoppe gjennom indekstreet for 800 000 rader. Du betaler write-cost på hver INSERT/UPDATE uten lese-gevinst.",
  },
  {
    id: "no-index",
    label: "Ikke lag indeks — la den seq-skanne",
    correct: true,
    explain:
      "Riktig (eller delvis indeks). Når du leser stor andel av rader er full table scan raskere enn å hoppe gjennom et indekstre. Optimisten vil ofte velge Seq Scan selv om indeksen finnes — så hvorfor betale skrivekost?",
  },
  {
    id: "partial",
    label: "Delvis indeks: WHERE status = 'aktiv'",
    ddl: "CREATE INDEX idx_ordre_aktiv ON Ordre(id) WHERE status = 'aktiv';",
    correct: true,
    explain:
      "Også riktig! En delvis indeks indekserer bare de 20% arkiverte radene — kompakt og rask for WHERE status = 'arkivert'. For 'aktiv'-radene (80%) bruker DB-en seq scan uansett, så det skader ikke at de ikke er med.",
  },
];

const STEPS_META = [
  { idx: 0, label: "Seq Scan", title: "Hva er problemet i plannen?" },
  { idx: 1, label: "Indeks", title: "Hvilken indeks løser problemet?" },
  { idx: 2, label: "Composite", title: "Hvilken kolonnerekkefølge i compositen?" },
  { idx: 3, label: "Selektivitet", title: "Hva gjør du når 80% av radene matcher?" },
];

export function IndeksDrill() {
  const [mode, setMode] = useState<Mode>("learn");
  const [stepIdx, setStepIdx] = useState(0);

  const [s1Pick, setS1Pick] = useState<string | null>(null);
  const [s1Status, setS1Status] = useState<StepStatus>("idle");

  const [s2Pick, setS2Pick] = useState<string | null>(null);
  const [s2Status, setS2Status] = useState<StepStatus>("idle");

  const [s3Pick, setS3Pick] = useState<string | null>(null);
  const [s3Status, setS3Status] = useState<StepStatus>("idle");

  const [s4Pick, setS4Pick] = useState<string | null>(null);
  const [s4Status, setS4Status] = useState<StepStatus>("idle");

  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const learnMode = mode === "learn";

  function onModeChange(m: Mode) {
    setMode(m);
    if (m === "learn") {
      // Pre-utfyll fasitene
      setS1Pick(STEP1_OPTIONS.find((o) => o.correct)?.id ?? null);
      setS1Status("correct");
      setS2Pick(STEP2_OPTIONS.find((o) => o.correct)?.id ?? null);
      setS2Status("correct");
      setS3Pick(STEP3_OPTIONS.find((o) => o.correct)?.id ?? null);
      setS3Status("correct");
      // Steg 4 har to riktige svar — vis det «mest pedagogiske» (delvis indeks)
      setS4Pick("partial");
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
    setS3Pick(null);
    setS3Status("idle");
    setS4Pick(null);
    setS4Status("idle");
    setCompletedSteps(new Set());
  }

  // -------- Steg 1 --------
  function onPickStep1(id: string) {
    if (learnMode) return;
    setS1Pick(id);
    const opt = STEP1_OPTIONS.find((o) => o.id === id);
    setS1Status(opt?.correct ? "correct" : "wrong");
  }
  const step1Done = s1Status === "correct";

  // -------- Steg 2 --------
  function onPickStep2(id: string) {
    if (learnMode) return;
    setS2Pick(id);
    const opt = STEP2_OPTIONS.find((o) => o.id === id);
    setS2Status(opt?.correct ? "correct" : "wrong");
  }
  const step2Done = s2Status === "correct";

  // -------- Steg 3 --------
  function onPickStep3(id: string) {
    if (learnMode) return;
    setS3Pick(id);
    const opt = STEP3_OPTIONS.find((o) => o.id === id);
    setS3Status(opt?.correct ? "correct" : "wrong");
  }
  const step3Done = s3Status === "correct";

  // -------- Steg 4 --------
  function onPickStep4(id: string) {
    if (learnMode) return;
    setS4Pick(id);
    const opt = STEP4_OPTIONS.find((o) => o.id === id);
    setS4Status(opt?.correct ? "correct" : "wrong");
  }
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
      <h2 className="text-xl font-semibold mb-2">Prøv selv — velg riktig indeks</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Du har en Ordre-tabell med 1 000 000 rader og noen trege spørringer. Bestem hva som er
        problemet, velg riktig indeks-strategi, og oppdag når en indeks IKKE lønner seg. Bytt mellom{" "}
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

      {/* Tabell-kontekst som vises hele tiden */}
      <TableContext />

      {/* Progress-dots + meta */}
      <div className="mb-4 mt-4 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
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
          <Step3View learnMode={learnMode} pick={s3Pick} status={s3Status} onPick={onPickStep3} />
        )}
        {stepIdx === 3 && (
          <Step4View learnMode={learnMode} pick={s4Pick} status={s4Status} onPick={onPickStep4} />
        )}
      </div>

      {/* Ferdig-panel */}
      {allDone && stepIdx === STEPS_META.length - 1 && <DonePanel onReset={resetAll} />}
    </section>
  );
}

// ===========================================================================
// Vedvarende tabell-kontekst (vises over alle steg)
// ===========================================================================

function TableContext() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Database className="h-4 w-4 text-brand" />
        <h3 className="font-semibold text-sm">Eksempel-tabell</h3>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">1 000 000 rader</span>
      </div>
      <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`Ordre (
  id          BIGINT PRIMARY KEY,
  kundeId     BIGINT,        -- mange ordrer per kunde (~20 i snitt)
  opprettet   TIMESTAMP,     -- spredd over flere år
  status      TEXT,          -- 'aktiv' (80%) eller 'arkivert' (20%)
  sum         NUMERIC
)`}</pre>
      <p className="mt-2 text-xs text-muted-foreground">
        Kun PK-en (<code className="font-mono">id</code>) er indeksert i utgangspunktet. Ingen andre
        indekser finnes. Alle steg jobber mot denne ene tabellen.
      </p>
    </div>
  );
}

// ===========================================================================
// Steg 1 — identifiser Seq Scan
// ===========================================================================

function Step1View({
  learnMode,
  pick,
  status,
  onPick,
}: {
  learnMode: boolean;
  pick: string | null;
  status: StepStatus;
  onPick: (id: string) => void;
}) {
  const correct = STEP1_OPTIONS.find((o) => o.correct);
  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <Prompt
        icon={<MousePointerClick className="h-4 w-4" />}
        text="Brukeren klager: «kunde-historikken loader sykt tregt». Du kjører EXPLAIN. Hva er problemet?"
      />

      {/* Query + plan */}
      <div className="rounded-lg border border-border bg-background p-3 mb-3">
        <div className="text-xs text-muted-foreground mb-1.5">Spørring</div>
        <pre className="font-mono text-xs whitespace-pre overflow-x-auto">{`SELECT * FROM Ordre WHERE kundeId = 42;`}</pre>
        <div className="mt-3 text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
          <Gauge className="h-3.5 w-3.5" /> EXPLAIN ANALYZE
        </div>
        <pre className="font-mono text-xs whitespace-pre overflow-x-auto text-amber-700 dark:text-amber-400">{`Seq Scan on ordre
  (cost=0.00..18334.00 rows=20 width=64)
  (actual time=0.012..980.413 rows=20 loops=1)
  Filter: (kundeId = 42)
  Rows Removed by Filter: 999980
Execution Time: 980.5 ms`}</pre>
      </div>

      <div className="space-y-2">
        {STEP1_OPTIONS.map((opt) => {
          const isPicked = pick === opt.id;
          const showCorrect = learnMode && opt.correct;
          const showWrong = !learnMode && isPicked && status === "wrong";
          const showRight = !learnMode && isPicked && status === "correct";
          return (
            <button
              key={opt.id}
              onClick={() => onPick(opt.id)}
              disabled={learnMode}
              className={cn(
                "w-full text-left rounded-lg border px-3 py-2 transition-colors flex items-center gap-3",
                showCorrect && "border-success bg-success/10",
                showWrong && "border-destructive bg-destructive/10",
                showRight && "border-success bg-success/10",
                !showCorrect &&
                  !showWrong &&
                  !showRight &&
                  "border-border bg-background hover:bg-accent",
                learnMode && !opt.correct && "opacity-50",
              )}
            >
              <span className="text-sm text-foreground">{opt.label}</span>
              {(showCorrect || showRight) && (
                <CheckCircle2 className="h-4 w-4 text-success ml-auto" />
              )}
              {showWrong && <AlertTriangle className="h-4 w-4 text-destructive ml-auto" />}
            </button>
          );
        })}
      </div>

      {learnMode && correct && (
        <Hint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="Hvorfor «Sekvensiell skanning»?"
          body={correct.explain}
        />
      )}
      {!learnMode && status === "wrong" && pick && (
        <Hint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body={STEP1_OPTIONS.find((o) => o.id === pick)?.explain ?? ""}
        />
      )}
      {!learnMode && status === "correct" && correct && (
        <Hint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig!"
          body={correct.explain}
        />
      )}
    </div>
  );
}

// ===========================================================================
// Steg 2 — velg riktig single-kolonne-indeks
// ===========================================================================

function Step2View({
  learnMode,
  pick,
  status,
  onPick,
}: {
  learnMode: boolean;
  pick: string | null;
  status: StepStatus;
  onPick: (id: string) => void;
}) {
  const correct = STEP2_OPTIONS.find((o) => o.correct);
  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <Prompt
        icon={<MousePointerClick className="h-4 w-4" />}
        text="Samme spørring som over. Hvilken CREATE INDEX gjør Seq Scan om til Index Scan?"
      />

      <div className="rounded-lg border border-border bg-background p-3 mb-3">
        <pre className="font-mono text-xs whitespace-pre overflow-x-auto">{`SELECT * FROM Ordre WHERE kundeId = 42;`}</pre>
      </div>

      <div className="space-y-2">
        {STEP2_OPTIONS.map((opt) => {
          const isPicked = pick === opt.id;
          const showCorrect = learnMode && opt.correct;
          const showWrong = !learnMode && isPicked && status === "wrong";
          const showRight = !learnMode && isPicked && status === "correct";
          return (
            <button
              key={opt.id}
              onClick={() => onPick(opt.id)}
              disabled={learnMode}
              className={cn(
                "w-full text-left rounded-lg border px-3 py-2 transition-colors",
                showCorrect && "border-success bg-success/10",
                showWrong && "border-destructive bg-destructive/10",
                showRight && "border-success bg-success/10",
                !showCorrect &&
                  !showWrong &&
                  !showRight &&
                  "border-border bg-background hover:bg-accent",
                learnMode && !opt.correct && "opacity-50",
              )}
            >
              <div className="flex items-center gap-3">
                <pre className="font-mono text-xs whitespace-pre overflow-x-auto flex-1">
                  {opt.ddl}
                </pre>
                {(showCorrect || showRight) && (
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                )}
                {showWrong && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
              </div>
            </button>
          );
        })}
      </div>

      {learnMode && correct && (
        <Hint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="Regel: indekser kolonnen i WHERE-klausulen"
          body={correct.explain}
        />
      )}
      {!learnMode && status === "wrong" && pick && (
        <Hint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body={STEP2_OPTIONS.find((o) => o.id === pick)?.explain ?? ""}
        />
      )}
      {!learnMode && status === "correct" && correct && (
        <Hint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig!"
          body={correct.explain}
        />
      )}
    </div>
  );
}

// ===========================================================================
// Steg 3 — composite-rekkefølge
// ===========================================================================

function Step3View({
  learnMode,
  pick,
  status,
  onPick,
}: {
  learnMode: boolean;
  pick: string | null;
  status: StepStatus;
  onPick: (id: string) => void;
}) {
  const correct = STEP3_OPTIONS.find((o) => o.correct);
  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <Prompt
        icon={<MousePointerClick className="h-4 w-4" />}
        text="Spørringen utvides — nå med to filtre. Hvilken composite-rekkefølge gir best plan?"
      />

      <div className="rounded-lg border border-border bg-background p-3 mb-3">
        <pre className="font-mono text-xs whitespace-pre overflow-x-auto">{`SELECT * FROM Ordre
WHERE kundeId = 42
  AND opprettet > '2024-01-01';`}</pre>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {STEP3_OPTIONS.map((opt) => {
          const isPicked = pick === opt.id;
          const showCorrect = learnMode && opt.correct;
          const showWrong = !learnMode && isPicked && status === "wrong";
          const showRight = !learnMode && isPicked && status === "correct";
          return (
            <button
              key={opt.id}
              onClick={() => onPick(opt.id)}
              disabled={learnMode}
              className={cn(
                "text-left rounded-lg border px-3 py-3 transition-colors",
                showCorrect && "border-success bg-success/10",
                showWrong && "border-destructive bg-destructive/10",
                showRight && "border-success bg-success/10",
                !showCorrect &&
                  !showWrong &&
                  !showRight &&
                  "border-border bg-background hover:bg-accent",
                learnMode && !opt.correct && "opacity-50",
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <KeyRound className="h-3.5 w-3.5 text-brand" />
                {(showCorrect || showRight) && (
                  <CheckCircle2 className="h-4 w-4 text-success ml-auto" />
                )}
                {showWrong && <AlertTriangle className="h-4 w-4 text-destructive ml-auto" />}
              </div>
              <pre className="font-mono text-xs whitespace-pre overflow-x-auto">
                {`CREATE INDEX idx ON Ordre\n  (${opt.cols[0]}, ${opt.cols[1]});`}
              </pre>
              <div className="mt-2 text-[11px] text-muted-foreground">
                Først {opt.cols[0] === "kundeId" ? "equality" : "range"}, så{" "}
                {opt.cols[1] === "kundeId" ? "equality" : "range"}.
              </div>
            </button>
          );
        })}
      </div>

      {learnMode && correct && (
        <Hint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="Regel: equality før range. Mest selektiv først."
          body={correct.explain}
        />
      )}
      {!learnMode && status === "wrong" && pick && (
        <Hint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body={STEP3_OPTIONS.find((o) => o.id === pick)?.explain ?? ""}
        />
      )}
      {!learnMode && status === "correct" && correct && (
        <Hint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig!"
          body={correct.explain}
        />
      )}
    </div>
  );
}

// ===========================================================================
// Steg 4 — når IKKE bruke indeks
// ===========================================================================

function Step4View({
  learnMode,
  pick,
  status,
  onPick,
}: {
  learnMode: boolean;
  pick: string | null;
  status: StepStatus;
  onPick: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <Prompt
        icon={<MousePointerClick className="h-4 w-4" />}
        text="Ny spørring som leser STORE deler av tabellen. Hva er riktig strategi?"
      />

      <div className="rounded-lg border border-border bg-background p-3 mb-3">
        <pre className="font-mono text-xs whitespace-pre overflow-x-auto">{`SELECT * FROM Ordre WHERE status != 'arkivert';
-- 80% av radene er 'aktiv' → 800 000 rader returneres`}</pre>
      </div>

      <div className="space-y-2">
        {STEP4_OPTIONS.map((opt) => {
          const isPicked = pick === opt.id;
          const showCorrect = learnMode && opt.id === "partial"; // pedagogisk: vis delvis i lær-modus
          const showWrong = !learnMode && isPicked && status === "wrong";
          const showRight = !learnMode && isPicked && status === "correct";
          const alsoCorrect = learnMode && opt.correct && opt.id !== "partial";
          return (
            <button
              key={opt.id}
              onClick={() => onPick(opt.id)}
              disabled={learnMode}
              className={cn(
                "w-full text-left rounded-lg border px-3 py-2 transition-colors",
                showCorrect && "border-success bg-success/10",
                alsoCorrect && "border-success/50 bg-success/5",
                showWrong && "border-destructive bg-destructive/10",
                showRight && "border-success bg-success/10",
                !showCorrect &&
                  !alsoCorrect &&
                  !showWrong &&
                  !showRight &&
                  "border-border bg-background hover:bg-accent",
                learnMode && !opt.correct && "opacity-50",
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground">{opt.label}</div>
                  {opt.ddl && (
                    <pre className="font-mono text-[11px] whitespace-pre overflow-x-auto mt-1.5 text-muted-foreground">
                      {opt.ddl}
                    </pre>
                  )}
                </div>
                {(showCorrect || alsoCorrect || showRight) && (
                  <CheckCircle2
                    className={cn(
                      "h-4 w-4 shrink-0",
                      alsoCorrect ? "text-success/60" : "text-success",
                    )}
                  />
                )}
                {showWrong && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
              </div>
            </button>
          );
        })}
      </div>

      {learnMode && (
        <Hint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="To riktige svar her — begge er gyldige."
          body="Enten dropper du indeksen (full table scan er raskt nok når 80% av radene returneres), eller du lager en delvis indeks som kun dekker de 20% arkiverte. Begge unngår å betale write-cost på 1 million rader for en query som leser nesten alt. Indekser har skrive-kostnad og lønner seg ikke ved lav selektivitet."
        />
      )}
      {!learnMode && status === "wrong" && pick && (
        <Hint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body={STEP4_OPTIONS.find((o) => o.id === pick)?.explain ?? ""}
        />
      )}
      {!learnMode && status === "correct" && pick && (
        <Hint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig!"
          body={STEP4_OPTIONS.find((o) => o.id === pick)?.explain ?? ""}
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
        <h3 className="font-semibold text-lg text-success">Bra!</h3>
      </div>
      <p className="text-sm text-foreground mb-3">Du vet nå:</p>
      <ol className="text-sm text-foreground space-y-1.5 list-decimal pl-5 mb-3">
        <li>
          Gjenkjenne <strong>Seq Scan</strong> i en EXPLAIN-plan som ytelses-problem.
        </li>
        <li>
          Velge riktig kolonne for en <strong>B-tree</strong>-indeks (samme som WHERE).
        </li>
        <li>
          Ordne <strong>composite-kolonner</strong> riktig — equality før range, mest selektiv
          først.
        </li>
        <li>
          Når en indeks <strong>IKKE lønner seg</strong> — lav selektivitet, eller delvis indeks som
          alternativ.
        </li>
      </ol>
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

// Kompakt sammendrag av tidligere fullførte steg.
function PreviousStepsSummary({ completed }: { completed: Set<number> }) {
  const cards: { title: string; text: string }[] = [];
  if (completed.has(0)) {
    cards.push({
      title: "Steg 1 ✓ Diagnose",
      text: "Seq Scan = DB-en leser alle 1M rader. Trenger indeks på kundeId.",
    });
  }
  if (completed.has(1)) {
    cards.push({
      title: "Steg 2 ✓ Indeks",
      text: "CREATE INDEX ON Ordre(kundeId) — hopper rett til de ~20 ordre for kunde 42.",
    });
  }
  if (completed.has(2)) {
    cards.push({
      title: "Steg 3 ✓ Composite",
      text: "(kundeId, opprettet) — equality først, så range-scan innen den verdien.",
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
