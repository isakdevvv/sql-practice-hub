import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

type AnswerKey = "one-prop-z" | "two-prop-z" | "chi-square" | "ci-wilson" | "sample-size" | "binomial-exact";

interface Scenario {
  id: string;
  scenario: string;
  correct: AnswerKey;
  why: string;
}

const ANSWERS: { key: AnswerKey; label: string; short: string }[] = [
  { key: "one-prop-z", label: "1-prop z-test", short: "Test én p mot p₀" },
  { key: "two-prop-z", label: "2-prop z-test (pooled SE)", short: "Sammenlign p_A vs p_B" },
  { key: "chi-square", label: "χ² goodness-of-fit", short: "≥3 kategorier mot forventet fordeling" },
  { key: "ci-wilson", label: "Wilson-CI", short: "Anslå én p med konfidensintervall" },
  { key: "sample-size", label: "Sample-size beregning", short: "Hvor stor n trengs for ønsket E?" },
  { key: "binomial-exact", label: "Exakt binomial test", short: "Liten n, CLT brutt" },
];

const SCENARIOS: Scenario[] = [
  {
    id: "s1",
    scenario:
      "En gallup spør 1000 nordmenn om de støtter forslag X. 540 sier ja. Du vil teste H₀: p = 0.5 mot H₁: p ≠ 0.5.",
    correct: "one-prop-z",
    why: "Én proporsjon, kjent p₀ = 0.5, stort n. Standard 1-prop z-test.",
  },
  {
    id: "s2",
    scenario:
      "Variant A på nettsiden får 280 konverteringer av 5000 besøk. Variant B får 312 av 5000. Er forskjellen signifikant?",
    correct: "two-prop-z",
    why: "Sammenligning av to uavhengige proporsjoner. 2-prop z-test med pooled SE.",
  },
  {
    id: "s3",
    scenario:
      "Du kaster en terning 120 ganger og teller hvor mange ganger hver side kommer opp. Tester om terningen er rettferdig.",
    correct: "chi-square",
    why: "6 kategorier mot uniform forventet fordeling — χ² goodness-of-fit med df = 5.",
  },
  {
    id: "s4",
    scenario:
      "Et fabrikkparti på 30 enheter er testet og 2 er defekte. Du vil rapportere et 95 % konfidensintervall for sann feilrate.",
    correct: "ci-wilson",
    why: "Lavt antall suksesser (x = 2) → Wald upålitelig. Wilson-CI gir korrekt asymmetrisk intervall.",
  },
  {
    id: "s5",
    scenario:
      "Du planlegger en meningsmåling og vil ha 95 % KI med margin ±2 %. Hvor mange respondenter trenger du?",
    correct: "sample-size",
    why: "Klassisk sample-size: n = z²·p(1-p)/E² ≈ 2401 med p = 0.5.",
  },
  {
    id: "s6",
    scenario:
      "12 pasienter fikk eksperimentell medisin; 2 fikk bivirkninger. Tester H₀: p = 0.5 mot H₁: p < 0.5. n er for lite for CLT.",
    correct: "binomial-exact",
    why: "n p₀ = 6 men n(1-p₀) = 6 — grenseverdi. Bedre: exakt binomial test (scipy.stats.binomtest).",
  },
  {
    id: "s7",
    scenario:
      "I et utvalg på 850 kunder fordeler segmentene seg på 40/110/200/500. Forventet markedsfordeling er 5/15/30/50 %. Stemmer det?",
    correct: "chi-square",
    why: "4 kategorier vs ikke-uniform forventet fordeling — χ² goodness-of-fit med df = 3.",
  },
  {
    id: "s8",
    scenario:
      "Vaksinegruppe: 8 smittede av 15 000. Placebo: 162 smittede av 15 000. Er effekten signifikant?",
    correct: "two-prop-z",
    why: "Sammenligning av to proporsjoner — 2-prop z-test. (KI for forskjell gir også effektstørrelse.)",
  },
];

export function ProportionMatchQuiz() {
  const [selected, setSelected] = useState<Record<string, AnswerKey | null>>(
    () => Object.fromEntries(SCENARIOS.map((s) => [s.id, null])),
  );
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const score = useMemo(() => {
    let correct = 0;
    let attempted = 0;
    for (const s of SCENARIOS) {
      if (selected[s.id] != null) {
        attempted++;
        if (selected[s.id] === s.correct) correct++;
      }
    }
    return { correct, attempted, total: SCENARIOS.length };
  }, [selected]);

  function pick(id: string, key: AnswerKey) {
    setSelected((p) => ({ ...p, [id]: key }));
    setRevealed((p) => ({ ...p, [id]: true }));
  }

  function reset() {
    setSelected(Object.fromEntries(SCENARIOS.map((s) => [s.id, null])));
    setRevealed({});
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Hvilken test passer? — 8 scenarier
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {score.correct}/{score.attempted} riktige (av {score.total})
          </span>
          <button
            onClick={reset}
            className="px-2 py-1 rounded border border-border bg-background hover:border-brand/40 text-xs flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {SCENARIOS.map((s, i) => {
          const sel = selected[s.id];
          const isRevealed = revealed[s.id];
          const isCorrect = sel === s.correct;
          return (
            <div
              key={s.id}
              className={
                "rounded-lg border p-3 space-y-2 " +
                (isRevealed
                  ? isCorrect
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-red-500/40 bg-red-500/5"
                  : "border-border bg-background")
              }
            >
              <div className="flex items-start gap-2 text-sm">
                <span className="text-xs text-muted-foreground font-mono mt-0.5">
                  {i + 1}.
                </span>
                <span>{s.scenario}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ANSWERS.map((a) => {
                  const isPicked = sel === a.key;
                  const isThisCorrect = a.key === s.correct;
                  let cls =
                    "px-2 py-1 rounded border text-xs transition-colors ";
                  if (isRevealed) {
                    if (isThisCorrect)
                      cls +=
                        "border-emerald-500 bg-emerald-500/15 text-emerald-200";
                    else if (isPicked)
                      cls += "border-red-500 bg-red-500/15 text-red-200";
                    else cls += "border-border bg-background opacity-60";
                  } else {
                    cls += "border-border bg-background hover:border-brand/40";
                  }
                  return (
                    <button
                      key={a.key}
                      onClick={() => !isRevealed && pick(s.id, a.key)}
                      disabled={isRevealed}
                      className={cls}
                      title={a.short}
                    >
                      {a.label}
                    </button>
                  );
                })}
              </div>
              {isRevealed ? (
                <div className="flex items-start gap-2 text-xs">
                  {isCorrect ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                  )}
                  <span className="text-muted-foreground">{s.why}</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
