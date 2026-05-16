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
  KeyRound,
  Sparkles,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ORDRE_RAW,
  RAW_COLS,
  STEP_1_COLS,
  STEP_1_ROWS,
  TELEFON_ROWS,
  STEP_2_COLS,
  STEP_2_ROWS,
  PRODUKT_ROWS,
  STEP_3_ORDRELINJE_COLS,
  STEP_3_ORDRELINJE_ROWS,
  STEP_3_ORDRE_ROWS,
  STEP_3_KUNDE_ROWS,
  STEP_3_POSTSTED_ROWS,
} from "./NormaliseringSteps";

// ---------------------------------------------------------------------------
// NormaliseringDrill — interaktiv «du normaliserer selv» med fire steg:
//   1) 1NF: pek på kolonnen som bryter atomisitet
//   2) 2NF: marker kolonnene med partiell avhengighet
//   3) 3NF: velg den transitive FD-en
//   4) FK-er: knytt hver FK-kolonne til riktig PK-tabell (klikk kilde, klikk mål)
//
// To globale moduser (per user-memory `feedback_drill_learn_then_practice`):
//   - «Lær først»: viser fasit + forklaring uten å kreve riktig svar for å gå videre
//   - «Test deg selv»: skjuler fasit, krever riktig svar
//
// Bruker samme eksempel-data som NormaliseringSteps (re-eksport).
// ---------------------------------------------------------------------------

type Mode = "learn" | "drill";

type StepStatus = "idle" | "wrong" | "correct";

// ---------- Steg 1: 1NF ----------
const STEP1_CORRECT = "telefonNumre";
const STEP1_HINT = "Se etter celler som inneholder flere verdier separert med komma.";

// ---------- Steg 2: 2NF (multi-select) ----------
const STEP2_CORRECT = new Set(["prodNavn", "prodPris"]);
// PK-kolonner i steg 2 vurderes ikke (de er nøkkel, ikke ikke-nøkkel-attributter)
const STEP2_PK = new Set(["ordreNr", "prodNr"]);

// ---------- Steg 3: 3NF (velg én transitiv FD) ----------
type FdOption = { id: string; left: string; right: string; explain: string; correct?: boolean };
const STEP3_FDS: FdOption[] = [
  {
    id: "ordreNr-kundeNr",
    left: "ordreNr",
    right: "kundeNr",
    explain: "ordreNr er PK i den nye Ordre-tabellen — en direkte (ikke transitiv) FD.",
  },
  {
    id: "kundeNr-kundeNavn",
    left: "kundeNr",
    right: "kundeNavn, postNr",
    explain: "kundeNr blir PK i Kunde-tabellen — også en direkte FD, ikke transitiv.",
  },
  {
    id: "postNr-poststed",
    left: "postNr",
    right: "poststed",
    correct: true,
    explain:
      "Bingo! ordreNr (PK) → kundeNr → postNr → poststed. postNr er ikke kandidatnøkkel i Kunde-tabellen — postNr → poststed er den transitive avhengigheten. Flytt ut til Poststed(postNr, poststed).",
  },
  {
    id: "ordreNr-antall",
    left: "(ordreNr, prodNr)",
    right: "antall",
    explain: "Hele PK bestemmer antall — det er en direkte FD, ikke transitiv.",
  },
];

// ---------- Steg 4: FK-kobling ----------
// Hver FK-kolonne i den endelige modellen peker til en PK i en mottakertabell.
// Brukeren klikker kilde (tabell.kolonne) og deretter mål-tabell.
type FkSource = { id: string; table: string; col: string };
type FkTarget = { id: string; table: string }; // PK = id

const FK_SOURCES: FkSource[] = [
  { id: "OrdreLinje.ordreNr", table: "OrdreLinje", col: "ordreNr" },
  { id: "OrdreLinje.prodNr", table: "OrdreLinje", col: "prodNr" },
  { id: "Ordre.kundeNr", table: "Ordre", col: "kundeNr" },
  { id: "Kunde.postNr", table: "Kunde", col: "postNr" },
  { id: "Telefon.kundeNr", table: "Telefon", col: "kundeNr" },
];

const FK_TARGETS: FkTarget[] = [
  { id: "Ordre", table: "Ordre" },
  { id: "Produkt", table: "Produkt" },
  { id: "Kunde", table: "Kunde" },
  { id: "Poststed", table: "Poststed" },
];

// Korrekt mapping kilde → mål-tabell
const FK_ANSWER: Record<string, string> = {
  "OrdreLinje.ordreNr": "Ordre",
  "OrdreLinje.prodNr": "Produkt",
  "Ordre.kundeNr": "Kunde",
  "Kunde.postNr": "Poststed",
  "Telefon.kundeNr": "Kunde",
};

const STEPS_META = [
  { idx: 0, label: "1NF", title: "Finn 1NF-bruddet" },
  { idx: 1, label: "2NF", title: "Finn partielle avhengigheter" },
  { idx: 2, label: "3NF", title: "Finn den transitive avhengigheten" },
  { idx: 3, label: "FK", title: "Knytt FK-ene riktig" },
];

export function NormaliseringDrill() {
  const [mode, setMode] = useState<Mode>("learn");
  const [stepIdx, setStepIdx] = useState(0);

  // Per-step state — nullstilles ved restart
  const [s1Pick, setS1Pick] = useState<string | null>(null);
  const [s1Status, setS1Status] = useState<StepStatus>("idle");

  const [s2Picks, setS2Picks] = useState<Set<string>>(new Set());
  const [s2Status, setS2Status] = useState<StepStatus>("idle");
  const [s2Submitted, setS2Submitted] = useState(false);

  const [s3Pick, setS3Pick] = useState<string | null>(null);
  const [s3Status, setS3Status] = useState<StepStatus>("idle");

  const [s4Links, setS4Links] = useState<Record<string, string>>({}); // source.id -> target.id
  const [s4Source, setS4Source] = useState<string | null>(null);
  const [s4Status, setS4Status] = useState<StepStatus>("idle");
  const [s4LastError, setS4LastError] = useState<string | null>(null);

  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // I «Lær først»-modus pre-utfylles svarene
  const learnMode = mode === "learn";

  // Pre-utfylling ved bytte til «Lær først»
  function onModeChange(m: Mode) {
    setMode(m);
    if (m === "learn") {
      setS1Pick(STEP1_CORRECT);
      setS1Status("correct");
      setS2Picks(new Set(STEP2_CORRECT));
      setS2Status("correct");
      setS2Submitted(true);
      const correct = STEP3_FDS.find((f) => f.correct);
      setS3Pick(correct ? correct.id : null);
      setS3Status("correct");
      setS4Links({ ...FK_ANSWER });
      setS4Source(null);
      setS4Status("correct");
      setS4LastError(null);
      setCompletedSteps(new Set([0, 1, 2, 3]));
    } else {
      // Drill — nullstill alt
      resetAll();
    }
  }

  function resetAll() {
    setStepIdx(0);
    setS1Pick(null);
    setS1Status("idle");
    setS2Picks(new Set());
    setS2Status("idle");
    setS2Submitted(false);
    setS3Pick(null);
    setS3Status("idle");
    setS4Links({});
    setS4Source(null);
    setS4Status("idle");
    setS4LastError(null);
    setCompletedSteps(new Set());
  }

  // -------- Steg 1 handlers --------
  function onPickStep1(col: string) {
    if (learnMode) return; // i lær-modus er kolonnen allerede markert
    setS1Pick(col);
    if (col === STEP1_CORRECT) {
      setS1Status("correct");
    } else {
      setS1Status("wrong");
    }
  }
  const step1Done = s1Status === "correct";

  // -------- Steg 2 handlers --------
  function onToggleStep2(col: string) {
    if (learnMode) return;
    if (STEP2_PK.has(col)) return; // PK-kolonner kan ikke velges
    setS2Submitted(false);
    setS2Status("idle");
    setS2Picks((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  }
  function onSubmitStep2() {
    if (learnMode) return;
    setS2Submitted(true);
    const correct = STEP2_CORRECT;
    const same = s2Picks.size === correct.size && [...s2Picks].every((c) => correct.has(c));
    setS2Status(same ? "correct" : "wrong");
  }
  const step2Done = s2Status === "correct";

  // -------- Steg 3 handlers --------
  function onPickStep3(id: string) {
    if (learnMode) return;
    setS3Pick(id);
    const fd = STEP3_FDS.find((f) => f.id === id);
    if (fd?.correct) setS3Status("correct");
    else setS3Status("wrong");
  }
  const step3Done = s3Status === "correct";

  // -------- Steg 4 handlers --------
  function onPickSource(id: string) {
    if (learnMode) return;
    setS4LastError(null);
    setS4Source((prev) => (prev === id ? null : id));
  }
  function onPickTarget(id: string) {
    if (learnMode) return;
    if (!s4Source) return;
    const correctTarget = FK_ANSWER[s4Source];
    if (correctTarget !== id) {
      setS4LastError(`${s4Source} → ${id} er feil. Prøv igjen.`);
      setS4Source(null);
      return;
    }
    setS4LastError(null);
    setS4Links((prev) => {
      const next = { ...prev, [s4Source!]: id };
      // sjekk om alle er satt
      const allDone = FK_SOURCES.every((s) => next[s.id]);
      if (allDone) setS4Status("correct");
      return next;
    });
    setS4Source(null);
  }
  const step4Done =
    s4Status === "correct" || FK_SOURCES.every((s) => s4Links[s.id] === FK_ANSWER[s.id]);

  // -------- Navigation --------
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
    else setCompletedSteps((prev) => new Set(prev).add(stepIdx));
  }
  function onPrev() {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  }

  return (
    <section id="drill" className="mb-12">
      <h2 className="text-xl font-semibold mb-2">Prøv selv — normaliser steg for steg</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Nå er det din tur. Du tar samme rotete OrdreLinje-tabell gjennom 1NF → 2NF → 3NF og setter
        til slutt FK-ene riktig. Bytt mellom <span className="text-foreground">Lær først</span> (ser
        fasit + forklaring) og <span className="text-foreground">Test deg selv</span> (må svare
        riktig for å gå videre).
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

      {/* Progress-dots + meta */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
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

      {/* Akkumulert kontekst: tidligere steg som kompakt sammendrag */}
      {stepIdx > 0 && completedSteps.size > 0 && (
        <PreviousStepsSummary completed={completedSteps} />
      )}

      {/* Aktivt steg */}
      <div className="mt-4">
        {stepIdx === 0 && (
          <Step1View learnMode={learnMode} pick={s1Pick} status={s1Status} onPick={onPickStep1} />
        )}
        {stepIdx === 1 && (
          <Step2View
            learnMode={learnMode}
            picks={s2Picks}
            status={s2Status}
            submitted={s2Submitted}
            onToggle={onToggleStep2}
            onSubmit={onSubmitStep2}
          />
        )}
        {stepIdx === 2 && (
          <Step3View learnMode={learnMode} pick={s3Pick} status={s3Status} onPick={onPickStep3} />
        )}
        {stepIdx === 3 && (
          <Step4View
            learnMode={learnMode}
            links={s4Links}
            source={s4Source}
            lastError={s4LastError}
            onPickSource={onPickSource}
            onPickTarget={onPickTarget}
            done={step4Done}
          />
        )}
      </div>

      {/* Ferdig-panel */}
      {allDone && stepIdx === STEPS_META.length - 1 && <DonePanel onReset={resetAll} />}
    </section>
  );
}

// ===========================================================================
// Steg 1 — 1NF: klikk kolonnen som bryter atomisitet
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
  onPick: (c: string) => void;
}) {
  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <Prompt
        icon={<MousePointerClick className="h-4 w-4" />}
        text="Pek på kolonnen som bryter 1NF (atomiske verdier)."
      />

      <ClickableTable
        navn="OrdreLinje (unormalisert)"
        pk={["ordreNr", "prodNr"]}
        kolonner={RAW_COLS}
        rader={ORDRE_RAW}
        selectedCols={pick ? new Set([pick]) : new Set()}
        correctCols={learnMode ? new Set([STEP1_CORRECT]) : new Set()}
        wrongCols={status === "wrong" && pick ? new Set([pick]) : new Set()}
        onColClick={onPick}
        highlightOnHover={!learnMode}
      />

      {learnMode && (
        <Hint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="Hvorfor telefonNumre?"
          body="Cellen inneholder en kommaseparert liste («22 11 33, 99 88 77»). 1NF krever ÉN verdi per celle — lister må flyttes ut til egen tabell."
        />
      )}
      {!learnMode && status === "wrong" && (
        <Hint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body={STEP1_HINT}
        />
      )}
      {!learnMode && status === "correct" && (
        <Hint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig!"
          body="telefonNumre er en kommaseparert liste — bryter 1NF. Flyttes ut til Telefon(kundeNr, nummer). Trykk «Neste» for å se hva som skjer."
        />
      )}
    </div>
  );
}

// ===========================================================================
// Steg 2 — 2NF: multi-select av partielle avhengigheter
// ===========================================================================

function Step2View({
  learnMode,
  picks,
  status,
  submitted,
  onToggle,
  onSubmit,
}: {
  learnMode: boolean;
  picks: Set<string>;
  status: StepStatus;
  submitted: boolean;
  onToggle: (c: string) => void;
  onSubmit: () => void;
}) {
  // Slik teksten viser når vi har avansert: STEP_1_COLS, men telefonNumre er allerede ute.
  // Vis tilsvarende tabell med fokus på (ordreNr, prodNr).
  const colsToConsider = STEP_1_COLS.filter((c) => !["ordreNr", "prodNr"].includes(c));
  const correct = STEP2_CORRECT;

  // I lær-modus: vis de korrekte som forhåndsvalgt, ikke krev klikk
  const effectivePicks = learnMode ? correct : picks;

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <Prompt
        icon={<MousePointerClick className="h-4 w-4" />}
        text="Marker kolonnene som kun avhenger av del av primærnøkkelen (ordreNr, prodNr). Velg én eller flere."
      />

      <ClickableTable
        navn="OrdreLinje (etter 1NF — PK = (ordreNr, prodNr))"
        pk={["ordreNr", "prodNr"]}
        kolonner={STEP_1_COLS}
        rader={STEP_1_ROWS}
        selectedCols={effectivePicks}
        correctCols={learnMode || (submitted && status === "correct") ? correct : new Set()}
        wrongCols={
          submitted && status === "wrong"
            ? new Set([...picks].filter((c) => !correct.has(c)))
            : new Set()
        }
        missingCols={
          submitted && status === "wrong"
            ? new Set([...correct].filter((c) => !picks.has(c)))
            : new Set()
        }
        onColClick={(c) => {
          if (colsToConsider.includes(c)) onToggle(c);
        }}
        nonClickableCols={new Set(["ordreNr", "prodNr"])}
        highlightOnHover={!learnMode}
      />

      {!learnMode && (
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={onSubmit}
            disabled={picks.size === 0}
            className="rounded-md border border-brand bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Sjekk svaret
          </button>
          <span className="text-xs text-muted-foreground">{picks.size} valgt</span>
        </div>
      )}

      {learnMode && (
        <Hint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="FD: prodNr → prodNavn, prodPris"
          body="prodNavn og prodPris er fullstendig bestemt av prodNr alene — halve PK-en. Det er en partiell avhengighet og bryter 2NF. Flytt ut til Produkt(prodNr, prodNavn, prodPris)."
        />
      )}
      {!learnMode && submitted && status === "correct" && (
        <Hint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig!"
          body="prodNavn og prodPris avhenger kun av prodNr — partiell avhengighet. Flytt ut til Produkt(prodNr, prodNavn, prodPris)."
        />
      )}
      {!learnMode && submitted && status === "wrong" && (
        <Hint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body="Røde = du valgte feil. Gule = du glemte. Tips: hvilke kolonner bestemmes helt og fullt av prodNr alene? kundeNavn/postNr/poststed avhenger av kundeNr, ikke prodNr — så de gjelder transitiv avhengighet (3NF), ikke partiell."
        />
      )}
    </div>
  );
}

// ===========================================================================
// Steg 3 — 3NF: velg den transitive FD-en
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
  const correctFd = STEP3_FDS.find((f) => f.correct);

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <Prompt
        icon={<MousePointerClick className="h-4 w-4" />}
        text="Velg den transitive avhengigheten (X → Y → Z der Y ikke er kandidatnøkkel)."
      />

      {/* Vis tilstanden etter 2NF som referanse */}
      <div className="grid md:grid-cols-2 gap-3">
        <MiniTable
          navn="OrdreLinje (etter 2NF)"
          pk={["ordreNr", "prodNr"]}
          kolonner={STEP_2_COLS}
          rader={STEP_2_ROWS.slice(0, 3)}
        />
        <div className="space-y-3">
          <MiniTable
            navn="Produkt"
            pk={["prodNr"]}
            kolonner={["prodNr", "prodNavn", "prodPris"]}
            rader={PRODUKT_ROWS}
          />
          <MiniTable
            navn="Telefon"
            pk={["kundeNr", "nummer"]}
            kolonner={["kundeNr", "nummer"]}
            rader={TELEFON_ROWS}
          />
        </div>
      </div>

      <div className="mt-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Velg FD-en som er transitiv
      </div>
      <div className="space-y-2">
        {STEP3_FDS.map((fd) => {
          const isPicked = pick === fd.id;
          const showCorrect = learnMode && fd.correct;
          const showWrong = !learnMode && isPicked && status === "wrong";
          const showRight = !learnMode && isPicked && status === "correct";
          return (
            <button
              key={fd.id}
              onClick={() => onPick(fd.id)}
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
                learnMode && !fd.correct && "opacity-50",
              )}
            >
              <span className="font-mono text-sm">
                <span className="text-brand">{fd.left}</span>{" "}
                <span className="text-muted-foreground">→</span>{" "}
                <span className="text-foreground">{fd.right}</span>
              </span>
              {(showCorrect || showRight) && (
                <CheckCircle2 className="h-4 w-4 text-success ml-auto" />
              )}
              {showWrong && <AlertTriangle className="h-4 w-4 text-destructive ml-auto" />}
            </button>
          );
        })}
      </div>

      {learnMode && correctFd && (
        <Hint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="Hvorfor er postNr → poststed transitiv?"
          body={correctFd.explain}
        />
      )}
      {!learnMode && status === "wrong" && pick && (
        <Hint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body={
            STEP3_FDS.find((f) => f.id === pick)?.explain ??
            "Tenk: hvilken FD går via en ikke-nøkkel?"
          }
        />
      )}
      {!learnMode && status === "correct" && correctFd && (
        <Hint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig!"
          body={correctFd.explain}
        />
      )}
    </div>
  );
}

// ===========================================================================
// Steg 4 — FK-er: klikk kilde, klikk mål
// ===========================================================================

function Step4View({
  learnMode,
  links,
  source,
  lastError,
  onPickSource,
  onPickTarget,
  done,
}: {
  learnMode: boolean;
  links: Record<string, string>;
  source: string | null;
  lastError: string | null;
  onPickSource: (id: string) => void;
  onPickTarget: (id: string) => void;
  done: boolean;
}) {
  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <Prompt
        icon={<Link2 className="h-4 w-4" />}
        text="Knytt hver FK-kolonne (venstre) til mottakertabellens PK (høyre). Klikk en FK-kolonne, så mål-tabellen den peker til."
      />

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Kilder — FK-kolonner */}
        <div>
          <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            FK-kolonner
          </div>
          <ul className="space-y-1.5">
            {FK_SOURCES.map((s) => {
              const linked = links[s.id];
              const selected = source === s.id;
              const correctTarget = FK_ANSWER[s.id];
              const isCorrectLink = linked === correctTarget;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => onPickSource(s.id)}
                    disabled={learnMode || isCorrectLink}
                    className={cn(
                      "w-full text-left rounded-md border px-3 py-2 text-sm font-mono flex items-center justify-between gap-2",
                      selected && "border-brand bg-brand/10",
                      isCorrectLink && "border-success/60 bg-success/5",
                      !selected && !isCorrectLink && "border-border bg-background hover:bg-accent",
                    )}
                  >
                    <span>
                      <span className="text-muted-foreground">{s.table}</span>
                      <span className="text-muted-foreground">.</span>
                      <span className="text-foreground">{s.col}</span>
                    </span>
                    {isCorrectLink && (
                      <span className="text-xs text-success flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> → {linked}
                      </span>
                    )}
                    {selected && !isCorrectLink && (
                      <span className="text-xs text-brand">velg mål →</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Mål — PK-tabeller */}
        <div>
          <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Mål-tabeller (PK)
          </div>
          <ul className="space-y-1.5">
            {FK_TARGETS.map((t) => {
              const isTarget = source !== null;
              return (
                <li key={t.id}>
                  <button
                    onClick={() => onPickTarget(t.id)}
                    disabled={learnMode || !isTarget}
                    className={cn(
                      "w-full text-left rounded-md border px-3 py-2 text-sm font-mono flex items-center gap-2",
                      isTarget
                        ? "border-brand/40 bg-background hover:bg-brand/10 cursor-pointer"
                        : "border-border bg-background text-muted-foreground cursor-default",
                    )}
                  >
                    <KeyRound className="h-3.5 w-3.5 text-success" />
                    <span className="text-foreground">{t.table}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {learnMode && (
        <Hint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="Fasit: hver FK peker på PK i mottakertabellen"
          body="OrdreLinje.ordreNr → Ordre, OrdreLinje.prodNr → Produkt, Ordre.kundeNr → Kunde, Kunde.postNr → Poststed, Telefon.kundeNr → Kunde. FK-er gjør JOIN mulig og opprettholder referanseintegritet."
        />
      )}
      {!learnMode && lastError && (
        <Hint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Feil kobling."
          body={`${lastError} Hint: en FK skal peke til tabellen der den verdien ER primærnøkkel.`}
        />
      )}
      {!learnMode && done && !lastError && (
        <Hint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Alle FK-er er riktig satt!"
          body="Du har et fullstendig 3NF-skjema med referanseintegritet. Trykk «Neste» for å se sluttoppsummering."
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
        <h3 className="font-semibold text-lg text-success">Ferdig!</h3>
      </div>
      <p className="text-sm text-foreground mb-3">
        Du gikk fra <strong>én rotete tabell</strong> til{" "}
        <strong>seks normaliserte tabeller</strong> (OrdreLinje, Ordre, Kunde, Poststed, Produkt,
        Telefon) — og knyttet FK-ene riktig. Det er hele 1NF → 2NF → 3NF-pipelinen på samme eksempel
        som teksten over.
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

function ClickableTable({
  navn,
  pk,
  kolonner,
  rader,
  selectedCols,
  correctCols,
  wrongCols,
  missingCols,
  onColClick,
  nonClickableCols,
  highlightOnHover,
}: {
  navn: string;
  pk: string[];
  kolonner: string[];
  rader: (string | number)[][];
  selectedCols: Set<string>;
  correctCols?: Set<string>;
  wrongCols?: Set<string>;
  missingCols?: Set<string>;
  onColClick: (c: string) => void;
  nonClickableCols?: Set<string>;
  highlightOnHover?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between flex-wrap gap-2">
        <h4 className="font-semibold text-sm">{navn}</h4>
        <div className="text-xs text-muted-foreground">
          PK = (<span className="text-success font-mono">{pk.join(", ")}</span>)
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="text-xs font-mono w-full">
          <thead className="bg-muted/40">
            <tr>
              {kolonner.map((c) => {
                const isPk = pk.includes(c);
                const selected = selectedCols.has(c);
                const correct = correctCols?.has(c);
                const wrong = wrongCols?.has(c);
                const missing = missingCols?.has(c);
                const clickable = !nonClickableCols?.has(c);
                return (
                  <th
                    key={c}
                    onClick={() => clickable && onColClick(c)}
                    className={cn(
                      "px-2 py-1.5 text-left border-b border-border whitespace-nowrap select-none",
                      isPk && "text-success",
                      clickable && highlightOnHover && "cursor-pointer hover:bg-brand/10",
                      !clickable && "cursor-not-allowed opacity-80",
                      correct && "bg-success/20 text-success",
                      wrong && "bg-destructive/20 text-destructive",
                      missing && "bg-amber-500/20 text-amber-600 dark:text-amber-400",
                      selected && !correct && !wrong && "bg-brand/15 text-brand",
                    )}
                    title={
                      !clickable
                        ? "PK-kolonne — del av nøkkelen, ikke en attributt-avhengighet"
                        : "Klikk for å velge"
                    }
                  >
                    {c}
                    {correct && <CheckCircle2 className="inline h-3 w-3 ml-1 text-success" />}
                    {wrong && <AlertTriangle className="inline h-3 w-3 ml-1 text-destructive" />}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rader.map((rad, ri) => (
              <tr key={ri} className="border-b border-border/60 last:border-b-0">
                {rad.map((celle, ci) => {
                  const col = kolonner[ci];
                  const correct = correctCols?.has(col);
                  const wrong = wrongCols?.has(col);
                  const missing = missingCols?.has(col);
                  const selected = selectedCols.has(col);
                  return (
                    <td
                      key={ci}
                      className={cn(
                        "px-2 py-1 whitespace-nowrap",
                        correct && "bg-success/10",
                        wrong && "bg-destructive/10",
                        missing && "bg-amber-500/10",
                        selected && !correct && !wrong && "bg-brand/5",
                      )}
                    >
                      {celle === null || celle === undefined ? (
                        <span className="text-muted-foreground/50">NULL</span>
                      ) : (
                        String(celle)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MiniTable({
  navn,
  pk,
  kolonner,
  rader,
}: {
  navn: string;
  pk: string[];
  kolonner: string[];
  rader: (string | number)[][];
}) {
  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className="px-2.5 py-1.5 border-b border-border flex items-center justify-between gap-2">
        <h5 className="font-semibold text-xs">{navn}</h5>
        <div className="text-[10px] text-muted-foreground">
          PK = <span className="text-success font-mono">{pk.join(", ")}</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="text-[11px] font-mono w-full">
          <thead className="bg-muted/30">
            <tr>
              {kolonner.map((c) => (
                <th
                  key={c}
                  className={cn(
                    "px-1.5 py-1 text-left border-b border-border whitespace-nowrap",
                    pk.includes(c) && "text-success",
                  )}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rader.map((rad, ri) => (
              <tr key={ri} className="border-b border-border/60 last:border-b-0">
                {rad.map((celle, ci) => (
                  <td key={ci} className="px-1.5 py-0.5 whitespace-nowrap">
                    {celle === null || celle === undefined ? (
                      <span className="text-muted-foreground/50">NULL</span>
                    ) : (
                      String(celle)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Kompakt sammendrag av tidligere fullførte steg, så brukeren ser
// transformasjonen som en sekvens (ikke isolerte snapshots).
function PreviousStepsSummary({ completed }: { completed: Set<number> }) {
  const cards: { title: string; text: string }[] = [];
  if (completed.has(0)) {
    cards.push({
      title: "Steg 1 ✓ 1NF",
      text: "telefonNumre ut til Telefon(kundeNr, nummer).",
    });
  }
  if (completed.has(1)) {
    cards.push({
      title: "Steg 2 ✓ 2NF",
      text: "prodNavn, prodPris ut til Produkt(prodNr, prodNavn, prodPris).",
    });
  }
  if (completed.has(2)) {
    cards.push({
      title: "Steg 3 ✓ 3NF",
      text: "kundeNavn/postNr ut til Kunde, poststed ut til Poststed; Ordre splittet ut.",
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

// Eksporter også slutt-skjemaet som referanse (brukes om vi senere vil vise
// pre-tegnet FK-arrow-summary).
export const FINAL_SCHEMA_TABLES = [
  {
    navn: "OrdreLinje",
    pk: ["ordreNr", "prodNr"],
    kolonner: STEP_3_ORDRELINJE_COLS,
    rader: STEP_3_ORDRELINJE_ROWS,
  },
  { navn: "Ordre", pk: ["ordreNr"], kolonner: ["ordreNr", "kundeNr"], rader: STEP_3_ORDRE_ROWS },
  {
    navn: "Kunde",
    pk: ["kundeNr"],
    kolonner: ["kundeNr", "kundeNavn", "postNr"],
    rader: STEP_3_KUNDE_ROWS,
  },
  {
    navn: "Poststed",
    pk: ["postNr"],
    kolonner: ["postNr", "poststed"],
    rader: STEP_3_POSTSTED_ROWS,
  },
  {
    navn: "Produkt",
    pk: ["prodNr"],
    kolonner: ["prodNr", "prodNavn", "prodPris"],
    rader: PRODUKT_ROWS,
  },
  {
    navn: "Telefon",
    pk: ["kundeNr", "nummer"],
    kolonner: ["kundeNr", "nummer"],
    rader: TELEFON_ROWS,
  },
];
