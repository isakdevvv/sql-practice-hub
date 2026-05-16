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
  Code2,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// BigODrill — interaktiv «du analyserer kompleksiteten selv» med fire steg:
//   1) Tell løkkene  — én for-løkke over n → O(n)
//   2) Nestede løkker — for i in range(n): for j in range(n): … → O(n²)
//   3) Dominerende term — O(n) + O(n²) + O(1) → O(n²)
//   4) Sammenlign algoritmer — lineær- vs binærsøk på sortert liste → O(log n) vinner
//
// To globale moduser (per user-memory `feedback_drill_learn_then_practice`):
//   - «Lær først»: forhåndsvelger riktig svar + viser pedagogisk forklaring
//   - «Test deg selv»: skjuler fasit, krever riktig svar for å gå videre
// ---------------------------------------------------------------------------

type Mode = "learn" | "drill";
type StepStatus = "idle" | "wrong" | "correct";

type Option = {
  id: string;
  label: string;
  /** vises som hjelpetekst når brukeren har valgt feil */
  why?: string;
};

// ---------- Steg 1 ----------
const STEP1_SNIPPET = `for i in range(n):
    print(i)`;
const STEP1_PROMPT = "Hvor mange ganger kjører innholdet i løkka?";
const STEP1_OPTIONS: Option[] = [
  {
    id: "1",
    label: "1 gang",
    why: "Det ville stemt hvis det ikke var noen løkke i det hele tatt.",
  },
  {
    id: "logn",
    label: "log n ganger",
    why: "Logaritmer dukker opp når noe halveres — her teller vi bare opp én og én.",
  },
  { id: "n", label: "n ganger" },
  { id: "n2", label: "n² ganger", why: "Det ville krevd en løkke inni løkka." },
];
const STEP1_CORRECT = "n";
const STEP1_LEARN_HINT =
  "range(n) gir 0, 1, 2, …, n−1 — totalt n verdier. Hver iterasjon kjører print én gang. Konklusjon: O(n).";
const STEP1_CORRECT_HINT =
  "Løkka kjører n ganger og hver iterasjon gjør konstant arbeid → O(n).";

// ---------- Steg 2 ----------
const STEP2_SNIPPET = `for i in range(n):
    for j in range(n):
        print(i, j)`;
const STEP2_PROMPT = "Hvor mange iterasjoner totalt?";
const STEP2_OPTIONS: Option[] = [
  { id: "n", label: "n", why: "Det ville stemt for én løkke, men her er det to nestede." },
  {
    id: "2n",
    label: "2n",
    why: "2n hadde stemt hvis løkkene var etter hverandre, ikke nestet — og selv da er 2n = O(n).",
  },
  {
    id: "nlogn",
    label: "n log n",
    why: "n log n krever halvering inni en lineær løkke — ikke det vi har her.",
  },
  { id: "n2", label: "n²" },
];
const STEP2_CORRECT = "n2";
const STEP2_LEARN_HINT =
  "Hver av de n iterasjonene av den ytre løkka kjører hele den indre løkka på n iterasjoner. Totalt: n × n = n² → O(n²).";
const STEP2_CORRECT_HINT =
  "Den ytre løkka kjører n ganger, og for hver av dem kjører den indre n ganger. n × n = n² → O(n²).";

// ---------- Steg 3 ----------
const STEP3_SNIPPET = `for i in range(n):       # A
    print(i)

for j in range(n * n):   # B
    print(j)

print("done")            # C`;
const STEP3_PROMPT = "Hva er total kompleksitet?";
const STEP3_OPTIONS: Option[] = [
  { id: "O1", label: "O(1)", why: "Bare den siste print-en er O(1) — løkkene over avhenger av n." },
  { id: "On", label: "O(n)", why: "Du har glemt løkke B, som kjører n² ganger." },
  {
    id: "OnPlusN2",
    label: "O(n + n²)",
    why: "Teknisk korrekt før forenkling, men Big-O dropper lavere ledd — bare den raskest-voksende termen teller.",
  },
  { id: "On2", label: "O(n²)" },
];
const STEP3_CORRECT = "On2";
const STEP3_LEARN_HINT =
  "Tre steg etter hverandre: A er O(n), B er O(n²), C er O(1). Sekvens summeres: O(n) + O(n²) + O(1) = O(n + n² + 1). Big-O dropper konstanter og lavere termer — bare den raskest-voksende blir igjen → O(n²).";
const STEP3_CORRECT_HINT =
  "Vi dropper konstanter og lavere termer. n² vokser raskest, så den dominerer → O(n²).";

// ---------- Steg 4 ----------
const STEP4_LINEAR = `def linear_search(lst, mål):
    for i, x in enumerate(lst):
        if x == mål:
            return i
    return -1`;
const STEP4_BINARY = `def binary_search(lst, mål):  # lst er sortert
    lo, hi = 0, len(lst) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if lst[mid] == mål: return mid
        elif lst[mid] < mål: lo = mid + 1
        else: hi = mid - 1
    return -1`;
const STEP4_PROMPT = "Hvilken er asymptotisk bedre for stor n?";
const STEP4_OPTIONS: Option[] = [
  {
    id: "linear",
    label: "Lineærsøk er bedre",
    why: "Lineærsøk er O(n) i verste tilfelle — binærsøk er O(log n). Log n vokser mye saktere.",
  },
  { id: "binary", label: "Binærsøk er bedre" },
  {
    id: "same",
    label: "De er like raske",
    why: "Big-O-klassene er forskjellige: O(log n) vs O(n). Det er en stor forskjell når n vokser.",
  },
  {
    id: "depends",
    label: "Det avhenger av input",
    why: "I beste tilfelle er begge O(1), men Big-O ser på verste/forventet tilfelle — der vinner binærsøk klart.",
  },
];
const STEP4_CORRECT = "binary";
const STEP4_LEARN_HINT =
  "Binærsøk halverer søkeområdet hvert steg → O(log n). Lineærsøk må skanne hele listen i verste tilfelle → O(n). For sortert input er binærsøk overlegent for stor n. Krav: listen MÅ være sortert.";
const STEP4_CORRECT_HINT =
  "Binærsøk halverer søkeområdet hvert steg (O(log n)) mens lineærsøk skanner ett-og-ett (O(n)). For n=1000 er det ~10 vs ~500 sammenligninger. Forutsetter sortert input.";

// Tabell-data for steg 4
const STEP4_TABLE: { n: number; linear: number; binary: number }[] = [
  { n: 10, linear: 5, binary: 4 },
  { n: 100, linear: 50, binary: 7 },
  { n: 1_000, linear: 500, binary: 10 },
  { n: 1_000_000, linear: 500_000, binary: 20 },
];

// ---------- Steg-meta ----------
const STEPS_META = [
  { idx: 0, label: "Løkker", title: "Steg 1 — tell løkkene" },
  { idx: 1, label: "Nesting", title: "Steg 2 — nestede løkker" },
  { idx: 2, label: "Dominanse", title: "Steg 3 — identifiser dominerende term" },
  { idx: 3, label: "Sammenlign", title: "Steg 4 — sammenlign to algoritmer" },
];

const STEP_DATA = [
  {
    snippet: STEP1_SNIPPET,
    prompt: STEP1_PROMPT,
    options: STEP1_OPTIONS,
    correct: STEP1_CORRECT,
    learnHint: STEP1_LEARN_HINT,
    correctHint: STEP1_CORRECT_HINT,
    icon: <Code2 className="h-4 w-4" />,
  },
  {
    snippet: STEP2_SNIPPET,
    prompt: STEP2_PROMPT,
    options: STEP2_OPTIONS,
    correct: STEP2_CORRECT,
    learnHint: STEP2_LEARN_HINT,
    correctHint: STEP2_CORRECT_HINT,
    icon: <Code2 className="h-4 w-4" />,
  },
  {
    snippet: STEP3_SNIPPET,
    prompt: STEP3_PROMPT,
    options: STEP3_OPTIONS,
    correct: STEP3_CORRECT,
    learnHint: STEP3_LEARN_HINT,
    correctHint: STEP3_CORRECT_HINT,
    icon: <Code2 className="h-4 w-4" />,
  },
] as const;

// ===========================================================================
// Hoved-komponent
// ===========================================================================

export function BigODrill() {
  const [mode, setMode] = useState<Mode>("learn");
  const [stepIdx, setStepIdx] = useState(0);

  // Per-step state — én pick per steg + status
  const [picks, setPicks] = useState<(string | null)[]>([null, null, null, null]);
  const [statuses, setStatuses] = useState<StepStatus[]>(["idle", "idle", "idle", "idle"]);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const learnMode = mode === "learn";

  function onModeChange(m: Mode) {
    setMode(m);
    if (m === "learn") {
      setPicks([STEP1_CORRECT, STEP2_CORRECT, STEP3_CORRECT, STEP4_CORRECT]);
      setStatuses(["correct", "correct", "correct", "correct"]);
      setCompletedSteps(new Set([0, 1, 2, 3]));
    } else {
      resetAll();
    }
  }

  function resetAll() {
    setStepIdx(0);
    setPicks([null, null, null, null]);
    setStatuses(["idle", "idle", "idle", "idle"]);
    setCompletedSteps(new Set());
  }

  function pickOption(idx: number, optId: string) {
    if (learnMode) return; // i lær-modus er svaret allerede valgt
    const correctId =
      idx === 0
        ? STEP1_CORRECT
        : idx === 1
          ? STEP2_CORRECT
          : idx === 2
            ? STEP3_CORRECT
            : STEP4_CORRECT;
    const newPicks = [...picks];
    newPicks[idx] = optId;
    setPicks(newPicks);
    const newStatuses = [...statuses];
    newStatuses[idx] = optId === correctId ? "correct" : "wrong";
    setStatuses(newStatuses);
  }

  const stepDone = statuses.map((s) => s === "correct");
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
      <h2 className="text-xl font-semibold mb-2">Prøv selv — analyser kompleksiteten</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Nå er det din tur. Les hvert kode-snippet og avgjør Big-O. Du går fra én enkel løkke til
        nestet løkke, deretter til dominerende term, og til slutt en algoritme-sammenligning. Bytt
        mellom <span className="text-foreground">Lær først</span> (ser fasit + forklaring) og{" "}
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

      {/* Progress-strip + nav */}
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
        {stepIdx < 3 ? (
          <CodeStepView
            learnMode={learnMode}
            data={STEP_DATA[stepIdx]}
            pick={picks[stepIdx]}
            status={statuses[stepIdx]}
            onPick={(opt) => pickOption(stepIdx, opt)}
          />
        ) : (
          <Step4View
            learnMode={learnMode}
            pick={picks[3]}
            status={statuses[3]}
            onPick={(opt) => pickOption(3, opt)}
          />
        )}
      </div>

      {allDone && stepIdx === STEPS_META.length - 1 && <DonePanel onReset={resetAll} />}
    </section>
  );
}

// ===========================================================================
// Steg 1-3 — vanlig kode-snippet med flervalg
// ===========================================================================

type CodeStepData = {
  snippet: string;
  prompt: string;
  options: Option[];
  correct: string;
  learnHint: string;
  correctHint: string;
  icon: React.ReactNode;
};

function CodeStepView({
  learnMode,
  data,
  pick,
  status,
  onPick,
}: {
  learnMode: boolean;
  data: CodeStepData;
  pick: string | null;
  status: StepStatus;
  onPick: (id: string) => void;
}) {
  const correctOption = data.options.find((o) => o.id === data.correct);
  const effectivePick = learnMode ? data.correct : pick;
  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <Prompt icon={data.icon} text={data.prompt} />

      <pre className="font-mono text-xs sm:text-sm rounded-lg bg-background border border-border p-3 overflow-x-auto whitespace-pre">
        {data.snippet}
      </pre>

      <div className="mt-4 grid sm:grid-cols-2 gap-2">
        {data.options.map((opt) => {
          const isPicked = effectivePick === opt.id;
          const isCorrectOpt = opt.id === data.correct;
          const showCorrect = learnMode && isCorrectOpt;
          const showWrong = !learnMode && isPicked && status === "wrong";
          const showRight = !learnMode && isPicked && status === "correct";
          return (
            <button
              key={opt.id}
              onClick={() => onPick(opt.id)}
              disabled={learnMode}
              className={cn(
                "text-left rounded-lg border px-3 py-2 transition-colors flex items-center justify-between gap-2",
                showCorrect && "border-success bg-success/10",
                showWrong && "border-destructive bg-destructive/10",
                showRight && "border-success bg-success/10",
                !showCorrect &&
                  !showWrong &&
                  !showRight &&
                  "border-border bg-background hover:bg-accent",
                learnMode && !isCorrectOpt && "opacity-50",
              )}
            >
              <span className="font-mono text-sm">{opt.label}</span>
              {(showCorrect || showRight) && <CheckCircle2 className="h-4 w-4 text-success" />}
              {showWrong && <AlertTriangle className="h-4 w-4 text-destructive" />}
            </button>
          );
        })}
      </div>

      {learnMode && (
        <Hint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title={`Fasit: ${correctOption?.label ?? ""}`}
          body={data.learnHint}
        />
      )}
      {!learnMode && status === "wrong" && pick && (
        <Hint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body={
            data.options.find((o) => o.id === pick)?.why ??
            "Prøv igjen — tenk på hvor mange ganger den innerste linja kjører."
          }
        />
      )}
      {!learnMode && status === "correct" && (
        <Hint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig!"
          body={data.correctHint}
        />
      )}
    </div>
  );
}

// ===========================================================================
// Steg 4 — sammenlign to algoritmer
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
  const correctOption = STEP4_OPTIONS.find((o) => o.id === STEP4_CORRECT);
  const effectivePick = learnMode ? STEP4_CORRECT : pick;
  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <Prompt icon={<Scale className="h-4 w-4" />} text={STEP4_PROMPT} />

      <div className="grid md:grid-cols-2 gap-3">
        <CodeCard title="A: Lineærsøk" complexity="O(n)" snippet={STEP4_LINEAR} />
        <CodeCard title="B: Binærsøk (sortert)" complexity="O(log n)" snippet={STEP4_BINARY} />
      </div>

      {/* Sammenligningstabell */}
      <div className="mt-4">
        <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Sammenligninger i verste tilfelle
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left font-semibold px-3 py-2">n</th>
                <th className="text-left font-semibold px-3 py-2">Lineær (~n/2 snitt, n verste)</th>
                <th className="text-left font-semibold px-3 py-2">Binær (~log₂ n)</th>
              </tr>
            </thead>
            <tbody>
              {STEP4_TABLE.map((row) => (
                <tr key={row.n} className="border-t border-border">
                  <td className="px-3 py-2 font-mono tabular-nums">
                    {row.n.toLocaleString("nb-NO")}
                  </td>
                  <td className="px-3 py-2 font-mono tabular-nums text-amber-600 dark:text-amber-400">
                    ~{row.linear.toLocaleString("nb-NO")}
                  </td>
                  <td className="px-3 py-2 font-mono tabular-nums text-success">~{row.binary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-2">
        {STEP4_OPTIONS.map((opt) => {
          const isPicked = effectivePick === opt.id;
          const isCorrectOpt = opt.id === STEP4_CORRECT;
          const showCorrect = learnMode && isCorrectOpt;
          const showWrong = !learnMode && isPicked && status === "wrong";
          const showRight = !learnMode && isPicked && status === "correct";
          return (
            <button
              key={opt.id}
              onClick={() => onPick(opt.id)}
              disabled={learnMode}
              className={cn(
                "text-left rounded-lg border px-3 py-2 transition-colors flex items-center justify-between gap-2",
                showCorrect && "border-success bg-success/10",
                showWrong && "border-destructive bg-destructive/10",
                showRight && "border-success bg-success/10",
                !showCorrect &&
                  !showWrong &&
                  !showRight &&
                  "border-border bg-background hover:bg-accent",
                learnMode && !isCorrectOpt && "opacity-50",
              )}
            >
              <span className="text-sm">{opt.label}</span>
              {(showCorrect || showRight) && <CheckCircle2 className="h-4 w-4 text-success" />}
              {showWrong && <AlertTriangle className="h-4 w-4 text-destructive" />}
            </button>
          );
        })}
      </div>

      {learnMode && (
        <Hint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title={`Fasit: ${correctOption?.label ?? ""}`}
          body={STEP4_LEARN_HINT}
        />
      )}
      {!learnMode && status === "wrong" && pick && (
        <Hint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body={
            STEP4_OPTIONS.find((o) => o.id === pick)?.why ??
            "Tenk på hvordan tallene i tabellen vokser med n."
          }
        />
      )}
      {!learnMode && status === "correct" && (
        <Hint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig!"
          body={STEP4_CORRECT_HINT}
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
        Du kan nå <strong>telle løkker</strong>, <strong>identifisere dominante termer</strong> og{" "}
        <strong>sammenligne kompleksiteter</strong>. Neste steg er å gå tilbake til vekstrate-grafen
        og sjekke følelsen din mot kurvene — der ser du visuelt hvorfor O(log n) banker O(n) når n
        blir stor.
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

function CodeCard({
  title,
  complexity,
  snippet,
}: {
  title: string;
  complexity: string;
  snippet: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between gap-2">
        <h4 className="font-semibold text-sm">{title}</h4>
        <span className="font-mono text-xs text-brand">{complexity}</span>
      </div>
      <pre className="font-mono text-[11px] sm:text-xs p-3 overflow-x-auto whitespace-pre">
        {snippet}
      </pre>
    </div>
  );
}

// Kompakt sammendrag av tidligere fullførte steg, så brukeren ser
// transformasjonen som en sekvens (ikke isolerte snapshots).
function PreviousStepsSummary({ completed }: { completed: Set<number> }) {
  const cards: { title: string; text: string }[] = [];
  if (completed.has(0)) {
    cards.push({
      title: "Steg 1 ✓",
      text: "Én løkke over n → O(n).",
    });
  }
  if (completed.has(1)) {
    cards.push({
      title: "Steg 2 ✓",
      text: "Nestet løkke → n × n = O(n²).",
    });
  }
  if (completed.has(2)) {
    cards.push({
      title: "Steg 3 ✓",
      text: "Dropp lavere termer — n² vant.",
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

// Re-eksport av drill-data så vi kan importere snippets/svar i tester eller andre
// komponenter senere uten å duplisere innholdet.
export const BIGO_DRILL_DATA = {
  step1: { snippet: STEP1_SNIPPET, correct: STEP1_CORRECT, options: STEP1_OPTIONS },
  step2: { snippet: STEP2_SNIPPET, correct: STEP2_CORRECT, options: STEP2_OPTIONS },
  step3: { snippet: STEP3_SNIPPET, correct: STEP3_CORRECT, options: STEP3_OPTIONS },
  step4: {
    linear: STEP4_LINEAR,
    binary: STEP4_BINARY,
    correct: STEP4_CORRECT,
    options: STEP4_OPTIONS,
    table: STEP4_TABLE,
  },
};
