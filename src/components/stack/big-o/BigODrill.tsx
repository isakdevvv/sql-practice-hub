import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Lightbulb, Code2, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DrillShell,
  DrillPrompt,
  DrillHint,
  DrillStepCard,
  type DrillStep,
  type DrillStepCtx,
} from "@/components/learn/DrillShell";

// ---------------------------------------------------------------------------
// BigODrill — interaktiv «du analyserer kompleksiteten selv» med fire steg:
//   1) Tell løkkene  — én for-løkke over n → O(n)
//   2) Nestede løkker — for i in range(n): for j in range(n): … → O(n²)
//   3) Dominerende term — O(n) + O(n²) + O(1) → O(n²)
//   4) Sammenlign algoritmer — lineær- vs binærsøk på sortert liste → O(log n) vinner
//
// Migrert til DrillShell — shellet eier modus-toggle, progress, akkumulert
// kontekst og ferdig-panel. Denne fila eier innholdet (snippets, alternativer,
// forklaringer) og per-steg correctness-state.
// ---------------------------------------------------------------------------

type Option = {
  id: string;
  label: string;
  /** vises som hjelpetekst når brukeren har valgt feil */
  why?: string;
};

// ---------- Steg 1 ----------
const STEP1_SNIPPET = `for i in range(n):
    print(i)`;
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

// ---------- Steg 2 ----------
const STEP2_SNIPPET = `for i in range(n):
    for j in range(n):
        print(i, j)`;
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

// ---------- Steg 3 ----------
const STEP3_SNIPPET = `for i in range(n):       # A
    print(i)

for j in range(n * n):   # B
    print(j)

print("done")            # C`;
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

const STEP4_TABLE: { n: number; linear: number; binary: number }[] = [
  { n: 10, linear: 5, binary: 4 },
  { n: 100, linear: 50, binary: 7 },
  { n: 1_000, linear: 500, binary: 10 },
  { n: 1_000_000, linear: 500_000, binary: 20 },
];

// ===========================================================================
// Hoved-komponent — bygger en steg-liste og delegerer resten til DrillShell.
// ===========================================================================

export function BigODrill() {
  const steps: DrillStep[] = [
    {
      id: "lokker",
      title: "Steg 1 — tell løkkene",
      pillLabel: "Løkker",
      render: (ctx) => (
        <CodeStep
          ctx={ctx}
          snippet={STEP1_SNIPPET}
          prompt="Hvor mange ganger kjører innholdet i løkka?"
          icon={<Code2 className="h-4 w-4" />}
          options={STEP1_OPTIONS}
          correct={STEP1_CORRECT}
          learnHint="range(n) gir 0, 1, 2, …, n−1 — totalt n verdier. Hver iterasjon kjører print én gang. Konklusjon: O(n)."
          correctHint="Løkka kjører n ganger og hver iterasjon gjør konstant arbeid → O(n)."
        />
      ),
      summary: "Én løkke over n → O(n).",
    },
    {
      id: "nesting",
      title: "Steg 2 — nestede løkker",
      pillLabel: "Nesting",
      render: (ctx) => (
        <CodeStep
          ctx={ctx}
          snippet={STEP2_SNIPPET}
          prompt="Hvor mange iterasjoner totalt?"
          icon={<Code2 className="h-4 w-4" />}
          options={STEP2_OPTIONS}
          correct={STEP2_CORRECT}
          learnHint="Hver av de n iterasjonene av den ytre løkka kjører hele den indre løkka på n iterasjoner. Totalt: n × n = n² → O(n²)."
          correctHint="Den ytre løkka kjører n ganger, og for hver av dem kjører den indre n ganger. n × n = n² → O(n²)."
        />
      ),
      summary: "Nestet løkke → n × n = O(n²).",
    },
    {
      id: "dominanse",
      title: "Steg 3 — identifiser dominerende term",
      pillLabel: "Dominanse",
      render: (ctx) => (
        <CodeStep
          ctx={ctx}
          snippet={STEP3_SNIPPET}
          prompt="Hva er total kompleksitet?"
          icon={<Code2 className="h-4 w-4" />}
          options={STEP3_OPTIONS}
          correct={STEP3_CORRECT}
          learnHint="Tre steg etter hverandre: A er O(n), B er O(n²), C er O(1). Sekvens summeres: O(n) + O(n²) + O(1) = O(n + n² + 1). Big-O dropper konstanter og lavere termer — bare den raskest-voksende blir igjen → O(n²)."
          correctHint="Vi dropper konstanter og lavere termer. n² vokser raskest, så den dominerer → O(n²)."
        />
      ),
      summary: "Dropp lavere termer — n² vant.",
    },
    {
      id: "sammenlign",
      title: "Steg 4 — sammenlign to algoritmer",
      pillLabel: "Sammenlign",
      render: (ctx) => <CompareStep ctx={ctx} />,
      summary: "Binærsøk (log n) banker lineær (n) for stor n.",
    },
  ];

  return (
    <DrillShell
      id="drill"
      storageId="big-o"
      title="Prøv selv — analyser kompleksiteten"
      intro={
        <>
          Nå er det din tur. Les hvert kode-snippet og avgjør Big-O. Du går fra én enkel løkke til
          nestet løkke, deretter til dominerende term, og til slutt en algoritme-sammenligning. Bytt
          mellom <span className="text-foreground">Lær først</span> (ser fasit + forklaring) og{" "}
          <span className="text-foreground">Test deg selv</span> (må svare riktig for å gå videre).
        </>
      }
      steps={steps}
      finalSummary={
        <>
          Du kan nå <strong>telle løkker</strong>, <strong>identifisere dominante termer</strong> og{" "}
          <strong>sammenligne kompleksiteter</strong>. Neste steg er å gå tilbake til
          vekstrate-grafen og sjekke følelsen din mot kurvene — der ser du visuelt hvorfor O(log n)
          banker O(n) når n blir stor.
        </>
      }
      finalTitle="Bra!"
    />
  );
}

// ===========================================================================
// Steg 1-3 — kode-snippet + flervalg (gjenbrukt)
// ===========================================================================

function CodeStep({
  ctx,
  snippet,
  prompt,
  icon,
  options,
  correct,
  learnHint,
  correctHint,
}: {
  ctx: DrillStepCtx;
  snippet: string;
  prompt: string;
  icon: React.ReactNode;
  options: Option[];
  correct: string;
  learnHint: string;
  correctHint: string;
}) {
  const [pick, setPick] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "wrong" | "correct">("idle");
  const learnMode = ctx.mode === "learn";

  // Reset per-step state når shellet nullstilles
  useEffect(() => {
    setPick(null);
    setStatus("idle");
  }, [ctx.resetToken]);

  function onPick(id: string) {
    if (learnMode) return;
    setPick(id);
    const ok = id === correct;
    setStatus(ok ? "correct" : "wrong");
    ctx.setDone(ok);
  }

  const correctOption = options.find((o) => o.id === correct);
  const effectivePick = learnMode ? correct : pick;

  return (
    <DrillStepCard>
      <DrillPrompt icon={icon} text={prompt} />

      <pre className="font-mono text-xs sm:text-sm rounded-lg bg-background border border-border p-3 overflow-x-auto whitespace-pre">
        {snippet}
      </pre>

      <div className="mt-4 grid sm:grid-cols-2 gap-2">
        {options.map((opt) => {
          const isPicked = effectivePick === opt.id;
          const isCorrectOpt = opt.id === correct;
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
        <DrillHint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title={`Fasit: ${correctOption?.label ?? ""}`}
          body={learnHint}
        />
      )}
      {!learnMode && status === "wrong" && pick && (
        <DrillHint
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Ikke helt."
          body={
            options.find((o) => o.id === pick)?.why ??
            "Prøv igjen — tenk på hvor mange ganger den innerste linja kjører."
          }
        />
      )}
      {!learnMode && status === "correct" && (
        <DrillHint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig!"
          body={correctHint}
        />
      )}
    </DrillStepCard>
  );
}

// ===========================================================================
// Steg 4 — sammenlign to algoritmer
// ===========================================================================

function CompareStep({ ctx }: { ctx: DrillStepCtx }) {
  const [pick, setPick] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "wrong" | "correct">("idle");
  const learnMode = ctx.mode === "learn";

  useEffect(() => {
    setPick(null);
    setStatus("idle");
  }, [ctx.resetToken]);

  function onPick(id: string) {
    if (learnMode) return;
    setPick(id);
    const ok = id === STEP4_CORRECT;
    setStatus(ok ? "correct" : "wrong");
    ctx.setDone(ok);
  }

  const correctOption = STEP4_OPTIONS.find((o) => o.id === STEP4_CORRECT);
  const effectivePick = learnMode ? STEP4_CORRECT : pick;

  return (
    <DrillStepCard>
      <DrillPrompt
        icon={<Scale className="h-4 w-4" />}
        text="Hvilken er asymptotisk bedre for stor n?"
      />

      <div className="grid md:grid-cols-2 gap-3">
        <CodeCard title="A: Lineærsøk" complexity="O(n)" snippet={STEP4_LINEAR} />
        <CodeCard title="B: Binærsøk (sortert)" complexity="O(log n)" snippet={STEP4_BINARY} />
      </div>

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
        <DrillHint
          tone="info"
          icon={<Lightbulb className="h-4 w-4" />}
          title={`Fasit: ${correctOption?.label ?? ""}`}
          body="Binærsøk halverer søkeområdet hvert steg → O(log n). Lineærsøk må skanne hele listen i verste tilfelle → O(n). For sortert input er binærsøk overlegent for stor n. Krav: listen MÅ være sortert."
        />
      )}
      {!learnMode && status === "wrong" && pick && (
        <DrillHint
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
        <DrillHint
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="Riktig!"
          body="Binærsøk halverer søkeområdet hvert steg (O(log n)) mens lineærsøk skanner ett-og-ett (O(n)). For n=1000 er det ~10 vs ~500 sammenligninger. Forutsetter sortert input."
        />
      )}
    </DrillStepCard>
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
