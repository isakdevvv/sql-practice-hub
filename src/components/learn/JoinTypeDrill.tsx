import { useMemo, useState } from "react";
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
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MiniTable } from "./MiniTable";
import { JoinResultTable } from "./JoinResultTable";
import { computeJoin } from "@/lib/learn/joinCompute";
import type { JoinType, VisualTable } from "@/lib/learn/types";

// ---------------------------------------------------------------------------
// JoinTypeDrill — 4-stegs interaktiv drill der brukeren velger riktig JOIN
// (INNER/LEFT/RIGHT/FULL) gitt et ønsket-resultat, bygger ON-klausulen,
// forklarer hvorfor NULL-rader oppstår, og gjør et nytt JOIN-valg i et
// motsatt-rettet scenario.
//
// To globale moduser (per user-memory `feedback_drill_learn_then_practice`):
//   - «Lær først»: viser fasit + forklaring uten å kreve riktig svar.
//   - «Test deg selv»: skjuler fasit, krever riktig svar for å gå videre.
//
// Bruker eget kohesivt eksempel: Kunde (4 rader) + Ordre (5 rader). Per har
// ingen ordre (LEFT-only), og ordre 505 peker på kundenr 9 som ikke finnes
// (RIGHT-only / orphan FK).
// ---------------------------------------------------------------------------

type Mode = "learn" | "drill";
type StepStatus = "idle" | "wrong" | "correct";

// ---------- Data ----------
const KUNDE: VisualTable = {
  name: "Kunde",
  columns: ["kundenr", "navn"],
  rows: [
    [1, "Astrid"],
    [2, "Bjørn"],
    [3, "Per"],
    [4, "Mari"],
  ],
};

const ORDRE: VisualTable = {
  name: "Ordre",
  columns: ["ordrenr", "kundenr", "sum"],
  rows: [
    [501, 1, 250],
    [502, 1, 480],
    [503, 2, 120],
    [504, 4, 990],
    [505, 9, 75], // orphan: kundenr 9 finnes ikke i Kunde
  ],
};

const KEY_LEFT = "kundenr";
const KEY_RIGHT = "kundenr";

// ---------- Steg 1 — velg JOIN-type (mål = LEFT) ----------
const STEP1_TARGET: JoinType = "LEFT";

// ---------- Steg 2 — bygg ON-klausulen ----------
type OnOption = { id: string; text: string; correct?: boolean; why: string };
const STEP2_OPTIONS: OnOption[] = [
  {
    id: "id-id",
    text: "K.kundenr = O.kundenr",
    correct: true,
    why: "PK-kolonnen i Kunde matcher FK-kolonnen i Ordre — det er denne semantiske koblingen som binder en ordre til en kunde.",
  },
  {
    id: "navn-kundenr",
    text: "K.navn = O.kundenr",
    why: "Du sammenligner navn (tekst) med et kundenummer (tall). Datatyper passer ikke, og navnet er ikke en nøkkel.",
  },
  {
    id: "id-id-wrong",
    text: "K.kundenr = O.ordrenr",
    why: "Det er to ulike nummer-rom: kundenr og ordrenr er ikke samme verdi. Du ville ved et tilfelle matche kunder mot ordrer med samme nummer.",
  },
  {
    id: "id-sum",
    text: "K.kundenr = O.sum",
    why: "Sum er et pengebeløp, ikke en nøkkel. Det er ingen semantisk kobling mellom kundenr og sum.",
  },
];

// ---------- Steg 3 — hvorfor NULL? (FULL viser begge typer NULL-rader) ----------
type NullExplanation = { id: string; text: string; correct?: boolean; why: string };

// Vi viser FULL-resultatet og spør spesifikt om raden der Kunde-kolonnene er NULL
// (orphan-ordren 505, kundenr=9 finnes ikke i Kunde).
const STEP3_OPTIONS: NullExplanation[] = [
  {
    id: "kunde-deleted",
    text: "Ordren refererer til et kundenr som ikke finnes i Kunde-tabellen.",
    correct: true,
    why: "Akkurat: ordre 505 har kundenr=9, men det finnes ingen rad med kundenr=9 i Kunde. RIGHT/FULL JOIN beholder ordren likevel, og fyller Kunde-kolonnene med NULL.",
  },
  {
    id: "no-orders",
    text: "Kunden har ingen ordrer.",
    why: "Den raden ville hatt NULL på Ordre-siden (ikke Kunde-siden). Her er det Kunde-kolonnene (kundenr, navn) som er NULL — så det er Kunde-raden som mangler, ikke Ordre-raden.",
  },
  {
    id: "db-error",
    text: "Det er en databasefeil — alle rader skal ha verdier.",
    why: "Nei. NULL er en normal del av OUTER JOIN-resultatet. SQL-motoren fyller manglende side med NULL — det er per design, ikke en feil.",
  },
  {
    id: "fk-broken",
    text: "FOREIGN KEY-begrensningen er brutt i skjemaet.",
    why: "Det er sant at FK ville hindret kundenr=9 om den var håndhevet, men spørsmålet er hvorfor NULL-en oppstår *i resultatet* — det er fordi OUTER JOIN beholder ordren selv om kunden mangler.",
  },
];

// ---------- Steg 4 — nytt mål: RIGHT (alle ordrer, også orphan; men ikke kunder uten ordrer) ----------
const STEP4_TARGET: JoinType = "RIGHT";

const STEPS_META = [
  { idx: 0, label: "JOIN-type", title: "Steg 1: Velg JOIN-typen som gir det ønskede resultatet" },
  { idx: 1, label: "ON-klausul", title: "Steg 2: Bygg riktig ON-klausul" },
  { idx: 2, label: "NULL-rader", title: "Steg 3: Forstå hvorfor NULL-radene oppstår" },
  { idx: 3, label: "Nytt mål", title: "Steg 4: Velg JOIN-type på nytt — annet ønsket resultat" },
];

const JOIN_TYPES_4: JoinType[] = ["INNER", "LEFT", "RIGHT", "FULL"];

const JOIN_LABEL: Record<JoinType, string> = {
  INNER: "INNER JOIN",
  LEFT: "LEFT JOIN",
  RIGHT: "RIGHT JOIN",
  FULL: "FULL OUTER JOIN",
  CROSS: "CROSS JOIN",
};

const JOIN_BLURB: Record<JoinType, string> = {
  INNER: "Bare rader som matcher på begge sider. Umatchede rader på begge sider faller bort.",
  LEFT: "Alle rader fra venstre tabell. Umatchede høyre-felter blir NULL.",
  RIGHT: "Alle rader fra høyre tabell. Umatchede venstre-felter blir NULL.",
  FULL: "Alle rader fra begge tabeller. Manglende side fylles med NULL.",
  CROSS: "Alle kombinasjoner (kartesisk produkt).",
};

const WRONG_PICK_EXPLAIN_S1: Record<JoinType, string> = {
  INNER:
    "INNER ville droppet Per (ingen ordre) — målet inkluderer Per med NULL på Ordre-siden. Du trenger LEFT.",
  LEFT: "", // riktig svar
  RIGHT:
    "RIGHT ville droppet Per (ingen ordre) og i stedet beholdt orphan-ordren 505 — målet har Per men *ikke* orphan-ordren. Du trenger LEFT.",
  FULL: "FULL ville inkludert *både* Per og orphan-ordren 505 — målet har bare Per. Du trenger LEFT.",
  CROSS:
    "CROSS gir alle kombinasjoner (4 × 5 = 20 rader). Målet har én rad per kunde-ordre-treff pluss Per. Du trenger LEFT.",
};

const WRONG_PICK_EXPLAIN_S4: Record<JoinType, string> = {
  INNER:
    "INNER ville droppet orphan-ordren 505 — målet inkluderer den med NULL på Kunde-siden. Du trenger RIGHT.",
  LEFT: "LEFT ville droppet orphan-ordren 505 og i stedet beholdt Per (uten ordre) — målet har orphan-ordren men *ikke* Per. Du trenger RIGHT.",
  RIGHT: "", // riktig svar
  FULL: "FULL ville inkludert *både* Per og orphan-ordren — målet har bare orphan-ordren. Du trenger RIGHT.",
  CROSS:
    "CROSS gir alle kombinasjoner (4 × 5 = 20 rader). Målet har én rad per ordre. Du trenger RIGHT.",
};

export function JoinTypeDrill() {
  const [mode, setMode] = useState<Mode>("learn");
  const [stepIdx, setStepIdx] = useState(0);

  // Per-step state — initialiseres med fasit fordi default-modus er «Lær først»
  // (pre-utfylte svar + forklaringer). Drill-modus nullstiller dem via onModeChange.
  const [s1Pick, setS1Pick] = useState<JoinType | null>(STEP1_TARGET);
  const [s1Status, setS1Status] = useState<StepStatus>("correct");

  const [s2Pick, setS2Pick] = useState<string | null>(
    () => STEP2_OPTIONS.find((o) => o.correct)?.id ?? null,
  );
  const [s2Status, setS2Status] = useState<StepStatus>("correct");

  const [s3Pick, setS3Pick] = useState<string | null>(
    () => STEP3_OPTIONS.find((o) => o.correct)?.id ?? null,
  );
  const [s3Status, setS3Status] = useState<StepStatus>("correct");

  const [s4Pick, setS4Pick] = useState<JoinType | null>(STEP4_TARGET);
  const [s4Status, setS4Status] = useState<StepStatus>("correct");

  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    () => new Set([0, 1, 2, 3]),
  );

  const learnMode = mode === "learn";

  function onModeChange(m: Mode) {
    setMode(m);
    if (m === "learn") {
      setS1Pick(STEP1_TARGET);
      setS1Status("correct");
      const onCorrect = STEP2_OPTIONS.find((o) => o.correct);
      setS2Pick(onCorrect ? onCorrect.id : null);
      setS2Status("correct");
      const nullCorrect = STEP3_OPTIONS.find((o) => o.correct);
      setS3Pick(nullCorrect ? nullCorrect.id : null);
      setS3Status("correct");
      setS4Pick(STEP4_TARGET);
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

  // -------- Step handlers --------
  function onPickStep1(t: JoinType) {
    if (learnMode) return;
    setS1Pick(t);
    setS1Status(t === STEP1_TARGET ? "correct" : "wrong");
  }
  function onPickStep2(id: string) {
    if (learnMode) return;
    setS2Pick(id);
    const opt = STEP2_OPTIONS.find((o) => o.id === id);
    setS2Status(opt?.correct ? "correct" : "wrong");
  }
  function onPickStep3(id: string) {
    if (learnMode) return;
    setS3Pick(id);
    const opt = STEP3_OPTIONS.find((o) => o.id === id);
    setS3Status(opt?.correct ? "correct" : "wrong");
  }
  function onPickStep4(t: JoinType) {
    if (learnMode) return;
    setS4Pick(t);
    setS4Status(t === STEP4_TARGET ? "correct" : "wrong");
  }

  const stepDone = [
    s1Status === "correct",
    s2Status === "correct",
    s3Status === "correct",
    s4Status === "correct",
  ];
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
    <section id="join-drill" className="mt-12">
      <h2 className="text-xl font-semibold mb-2">Prøv selv — velg riktig JOIN</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Nå er det din tur. Du tar to små tabeller — <span className="font-mono">Kunde</span> og{" "}
        <span className="font-mono">Ordre</span> — gjennom fire steg: velge JOIN-type for et ønsket
        resultat, bygge ON-klausulen, forklare NULL-rader, og velge på nytt for et annet scenario.
        Bytt mellom <span className="text-foreground">Lær først</span> (ser fasit + forklaring) og{" "}
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

      {/* Progress-strip */}
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
// Steg 1 — velg JOIN-type (mål = LEFT)
// ===========================================================================

function Step1View({
  learnMode,
  pick,
  status,
  onPick,
}: {
  learnMode: boolean;
  pick: JoinType | null;
  status: StepStatus;
  onPick: (t: JoinType) => void;
}) {
  const targetResult = useMemo(
    () =>
      computeJoin(KUNDE, ORDRE, KEY_LEFT, KEY_RIGHT, STEP1_TARGET, {
        leftAlias: "K",
        rightAlias: "O",
      }),
    [],
  );
  const previewResult = useMemo(() => {
    if (!pick) return null;
    return computeJoin(KUNDE, ORDRE, KEY_LEFT, KEY_RIGHT, pick, {
      leftAlias: "K",
      rightAlias: "O",
    });
  }, [pick]);

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <Prompt
        icon={<MousePointerClick className="h-4 w-4" />}
        text="Se på de to tabellene og det ønskede resultatet. Hvilken JOIN-type produserer akkurat dette resultatet?"
      />

      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <MiniTable
          table={KUNDE}
          highlightKey={KEY_LEFT}
          caption={`${KUNDE.name} (4 rader)`}
          accent="left"
        />
        <MiniTable
          table={ORDRE}
          highlightKey={KEY_RIGHT}
          caption={`${ORDRE.name} (5 rader)`}
          accent="right"
        />
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-semibold font-mono text-warning">
            Ønsket resultat ({targetResult.rows.length} rader)
          </span>
          <span className="text-[10px] text-muted-foreground">— dette skal JOIN-en din matche</span>
        </div>
        <JoinResultTable result={targetResult} />
      </div>

      <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Velg JOIN-type
      </div>
      <div className="flex flex-wrap gap-2">
        {JOIN_TYPES_4.map((t) => {
          const isPicked = pick === t;
          const showCorrect = learnMode && t === STEP1_TARGET;
          const showWrong = !learnMode && isPicked && status === "wrong";
          const showRight = !learnMode && isPicked && status === "correct";
          return (
            <button
              key={t}
              onClick={() => onPick(t)}
              disabled={learnMode}
              className={cn(
                "rounded-md border px-3 py-2 text-sm font-mono font-semibold transition-colors flex-1 min-w-[110px]",
                showCorrect && "border-success bg-success/15 text-success",
                showWrong && "border-destructive bg-destructive/15 text-destructive",
                showRight && "border-success bg-success/15 text-success",
                !showCorrect &&
                  !showWrong &&
                  !showRight &&
                  "border-border bg-background text-foreground hover:bg-accent",
                learnMode && t !== STEP1_TARGET && "opacity-50",
              )}
            >
              {t} JOIN
            </button>
          );
        })}
      </div>

      {/* Forhåndsvisning ved feil — vis hva valgt type faktisk gir */}
      {!learnMode && status === "wrong" && previewResult && (
        <div className="mt-4">
          <div className="mb-2 text-xs text-muted-foreground">
            Forhåndsvisning av <span className="font-mono text-foreground">{pick} JOIN</span> (
            {previewResult.rows.length} rader) — sammenlign med målet over:
          </div>
          <JoinResultTable result={previewResult} />
        </div>
      )}

      {learnMode && (
        <Hint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="Hvorfor LEFT JOIN?"
          body="Målet har alle 4 kundene fra Kunde-tabellen — også Per, som ikke har noen ordre (NULL på ordrenr/sum). Det er signaturen til LEFT JOIN: behold alt fra venstre, fyll høyre med NULL ved manglende match. Ordre 505 (kundenr=9) er ikke med — som beviser at vi ikke tok RIGHT eller FULL."
        />
      )}
      {!learnMode && status === "wrong" && pick && (
        <Hint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body={WRONG_PICK_EXPLAIN_S1[pick]}
        />
      )}
      {!learnMode && status === "correct" && (
        <Hint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig — LEFT JOIN!"
          body="Alle 4 kunder beholdes, Per fyller på med NULL på ordresiden. Orphan-ordren 505 faller bort fordi LEFT bare ser etter match fra Kunde-siden. Trykk «Neste» for å bygge ON-klausulen."
        />
      )}
    </div>
  );
}

// ===========================================================================
// Steg 2 — bygg ON-klausulen
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
  const correctOpt = STEP2_OPTIONS.find((o) => o.correct);
  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <Prompt
        icon={<MousePointerClick className="h-4 w-4" />}
        text="Du har valgt LEFT JOIN. Nå må du fortelle SQL hvilke kolonner som skal matches. Velg riktig ON-uttrykk."
      />

      <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3 font-mono text-sm leading-relaxed">
        <div>
          <span className="text-muted-foreground">SELECT</span> *
        </div>
        <div>
          <span className="text-muted-foreground">FROM</span>{" "}
          <span className="text-brand">Kunde K</span>
        </div>
        <div>
          <span className="text-muted-foreground">LEFT JOIN</span>{" "}
          <span className="text-success">Ordre O</span>
        </div>
        <div>
          <span className="text-muted-foreground"> ON</span>{" "}
          <span
            className={cn(
              "inline-block min-w-[180px] rounded border px-2 py-0.5",
              pick && status === "correct"
                ? "border-success bg-success/10 text-success"
                : pick && status === "wrong"
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-dashed border-brand/50 bg-brand/5 text-brand",
            )}
          >
            {pick
              ? STEP2_OPTIONS.find((o) => o.id === pick)?.text
              : learnMode && correctOpt
                ? correctOpt.text
                : "____  ?  ____"}
          </span>
          ;
        </div>
      </div>

      <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Velg ON-uttrykk
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
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
                "rounded-lg border px-3 py-2 text-left transition-colors flex items-center justify-between gap-2",
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
              <span className="font-mono text-sm">{opt.text}</span>
              {(showCorrect || showRight) && (
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              )}
              {showWrong && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
            </button>
          );
        })}
      </div>

      {learnMode && correctOpt && (
        <Hint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="Hvorfor K.kundenr = O.kundenr?"
          body={correctOpt.why}
        />
      )}
      {!learnMode && status === "wrong" && pick && (
        <Hint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body={STEP2_OPTIONS.find((o) => o.id === pick)?.why ?? ""}
        />
      )}
      {!learnMode && status === "correct" && correctOpt && (
        <Hint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig!"
          body={correctOpt.why}
        />
      )}
    </div>
  );
}

// ===========================================================================
// Steg 3 — forstå NULL-radene (vis FULL-resultat, fokuser på orphan-raden)
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
  // FULL JOIN viser begge typer NULL — vi peker eksplisitt på orphan-ordren.
  const fullResult = useMemo(
    () =>
      computeJoin(KUNDE, ORDRE, KEY_LEFT, KEY_RIGHT, "FULL", { leftAlias: "K", rightAlias: "O" }),
    [],
  );

  // Indeks(er) for raden(e) der venstre-siden er NULL (kun orphan-ordrer).
  const orphanRowIndices = useMemo(() => {
    const set = new Set<number>();
    fullResult.rows.forEach((r, i) => {
      if (r.leftIdx === null) set.add(i);
    });
    return set;
  }, [fullResult]);

  const correctOpt = STEP3_OPTIONS.find((o) => o.correct);

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <Prompt
        icon={<HelpCircle className="h-4 w-4" />}
        text="Vi tar nå FULL OUTER JOIN for å se ALT — både kunder uten ordre og ordrer uten kunde. Se på den markerte raden under: hvorfor er K.kundenr og K.navn NULL der?"
      />

      <div className="mb-4">
        <div className="mb-2 text-xs font-semibold font-mono text-warning">
          FULL OUTER JOIN av Kunde + Ordre
        </div>
        <HighlightedJoinTable result={fullResult} highlightRows={orphanRowIndices} />
        <div className="mt-2 text-[11px] text-muted-foreground">
          Den uthevede raden er ordre <span className="font-mono">505</span> med{" "}
          <span className="font-mono">O.kundenr = 9</span> — som ikke finnes i Kunde-tabellen.
        </div>
      </div>

      <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Hvorfor er K-kolonnene NULL?
      </div>
      <div className="space-y-2">
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
                "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors flex items-center justify-between gap-2",
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
              <span>{opt.text}</span>
              {(showCorrect || showRight) && (
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              )}
              {showWrong && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
            </button>
          );
        })}
      </div>

      {learnMode && correctOpt && (
        <Hint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="Forklaring"
          body={correctOpt.why}
        />
      )}
      {!learnMode && status === "wrong" && pick && (
        <Hint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body={STEP3_OPTIONS.find((o) => o.id === pick)?.why ?? ""}
        />
      )}
      {!learnMode && status === "correct" && correctOpt && (
        <Hint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig!"
          body={correctOpt.why}
        />
      )}
    </div>
  );
}

// ===========================================================================
// Steg 4 — nytt mål: RIGHT JOIN (alle ordrer, inkludert orphan; ingen Per)
// ===========================================================================

function Step4View({
  learnMode,
  pick,
  status,
  onPick,
}: {
  learnMode: boolean;
  pick: JoinType | null;
  status: StepStatus;
  onPick: (t: JoinType) => void;
}) {
  const targetResult = useMemo(
    () =>
      computeJoin(KUNDE, ORDRE, KEY_LEFT, KEY_RIGHT, STEP4_TARGET, {
        leftAlias: "K",
        rightAlias: "O",
      }),
    [],
  );
  const previewResult = useMemo(() => {
    if (!pick) return null;
    return computeJoin(KUNDE, ORDRE, KEY_LEFT, KEY_RIGHT, pick, {
      leftAlias: "K",
      rightAlias: "O",
    });
  }, [pick]);

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <Prompt
        icon={<MousePointerClick className="h-4 w-4" />}
        text="Nytt scenario, samme tabeller. Nå vil vi ha ALLE ordrer — også de som peker på en ukjent kunde — men IKKE kunder uten ordrer. Hvilken JOIN-type gir akkurat dette?"
      />

      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <MiniTable
          table={KUNDE}
          highlightKey={KEY_LEFT}
          caption={`${KUNDE.name} (4 rader)`}
          accent="left"
        />
        <MiniTable
          table={ORDRE}
          highlightKey={KEY_RIGHT}
          caption={`${ORDRE.name} (5 rader)`}
          accent="right"
        />
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-semibold font-mono text-warning">
            Nytt ønsket resultat ({targetResult.rows.length} rader)
          </span>
          <span className="text-[10px] text-muted-foreground">
            — merk: Per er borte, men ordre 505 (orphan) er med
          </span>
        </div>
        <JoinResultTable result={targetResult} />
      </div>

      <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Velg JOIN-type
      </div>
      <div className="flex flex-wrap gap-2">
        {JOIN_TYPES_4.map((t) => {
          const isPicked = pick === t;
          const showCorrect = learnMode && t === STEP4_TARGET;
          const showWrong = !learnMode && isPicked && status === "wrong";
          const showRight = !learnMode && isPicked && status === "correct";
          return (
            <button
              key={t}
              onClick={() => onPick(t)}
              disabled={learnMode}
              className={cn(
                "rounded-md border px-3 py-2 text-sm font-mono font-semibold transition-colors flex-1 min-w-[110px]",
                showCorrect && "border-success bg-success/15 text-success",
                showWrong && "border-destructive bg-destructive/15 text-destructive",
                showRight && "border-success bg-success/15 text-success",
                !showCorrect &&
                  !showWrong &&
                  !showRight &&
                  "border-border bg-background text-foreground hover:bg-accent",
                learnMode && t !== STEP4_TARGET && "opacity-50",
              )}
            >
              {t} JOIN
            </button>
          );
        })}
      </div>

      {!learnMode && status === "wrong" && previewResult && (
        <div className="mt-4">
          <div className="mb-2 text-xs text-muted-foreground">
            Forhåndsvisning av <span className="font-mono text-foreground">{pick} JOIN</span> (
            {previewResult.rows.length} rader) — sammenlign med målet over:
          </div>
          <JoinResultTable result={previewResult} />
        </div>
      )}

      {learnMode && (
        <Hint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title="Hvorfor RIGHT JOIN?"
          body="Målet har alle 5 ordrer fra Ordre-tabellen (også orphan-ordre 505 med NULL på Kunde-siden), men Per er ikke med. Det er signaturen til RIGHT JOIN: behold alt fra høyre side, fyll venstre med NULL ved manglende match. Speilbilde av LEFT — bytt hvilken tabell som er «hovedlisten»."
        />
      )}
      {!learnMode && status === "wrong" && pick && (
        <Hint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body={WRONG_PICK_EXPLAIN_S4[pick]}
        />
      )}
      {!learnMode && status === "correct" && (
        <Hint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig — RIGHT JOIN!"
          body="Alle 5 ordrer beholdes, inkludert orphan 505 som får NULL i Kunde-kolonnene. Per faller bort fordi RIGHT bare ser etter match fra Ordre-siden. Du har fanget asymmetrien mellom LEFT og RIGHT."
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
      <p className="text-sm text-foreground mb-3">
        Du valgte riktig JOIN-type to ganger — først <strong>LEFT</strong> (alle kunder, også Per
        uten ordre), så <strong>RIGHT</strong> (alle ordrer, også orphan 505 uten kunde). Underveis
        bygget du ON-klausulen riktig, og forklarte hvorfor NULL-rader oppstår på en side når den
        andre ikke har match. Du forstår nå hvordan LEFT, RIGHT og FULL skiller seg fra INNER på
        rader uten match.
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

// JoinResultTable med utheving av spesifikke rader (for å peke på orphan-raden).
function HighlightedJoinTable({
  result,
  highlightRows,
}: {
  result: ReturnType<typeof computeJoin>;
  highlightRows: Set<number>;
}) {
  const { columns, rows } = result;
  return (
    <div className="rounded-lg border border-warning/40 bg-card overflow-x-auto">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col, i) => (
              <th
                key={i}
                className={cn(
                  "px-2.5 py-1.5 text-left font-semibold whitespace-nowrap",
                  col.from === "left" ? "bg-brand/15 text-brand" : "bg-success/15 text-success",
                )}
              >
                {col.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const isHi = highlightRows.has(i);
            return (
              <tr
                key={i}
                className={cn(
                  "border-b border-border/40 last:border-0",
                  isHi && "bg-warning/15 ring-2 ring-warning/40 ring-inset",
                )}
              >
                {r.cells.map((cell, j) => (
                  <td
                    key={j}
                    className={cn(
                      "px-2.5 py-1.5 whitespace-nowrap",
                      !isHi && columns[j].from === "left" && "bg-brand/[0.04]",
                      !isHi && columns[j].from === "right" && "bg-success/[0.04]",
                    )}
                  >
                    {cell === null ? (
                      <span className="rounded bg-destructive/15 text-destructive px-1.5 py-0.5 text-[10px] font-semibold">
                        NULL
                      </span>
                    ) : (
                      <span>{String(cell)}</span>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Akkumulert kontekst — kompakte kort for hva som er fullført.
function PreviousStepsSummary({ completed }: { completed: Set<number> }) {
  const cards: { title: string; text: string }[] = [];
  if (completed.has(0)) {
    cards.push({
      title: "Steg 1 ✓ JOIN-type",
      text: "Valgte LEFT JOIN — beholdt alle kunder (også Per uten ordre).",
    });
  }
  if (completed.has(1)) {
    cards.push({
      title: "Steg 2 ✓ ON-klausul",
      text: "K.kundenr = O.kundenr — PK matches mot FK.",
    });
  }
  if (completed.has(2)) {
    cards.push({
      title: "Steg 3 ✓ NULL-rader",
      text: "Orphan-ordren peker på et kundenr som ikke finnes i Kunde.",
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

// Eksport for testbarhet/gjenbruk
export { KUNDE, ORDRE, STEP1_TARGET, STEP4_TARGET, JOIN_LABEL, JOIN_BLURB };
