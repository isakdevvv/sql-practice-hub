import { useState } from "react";

/**
 * DescriptiveStatsQuiz — 8 anvendt-scenarier. For hver: "hva rapporterer du?".
 * Flervalg, med forklaring som åpnes etter svar.
 */

type Q = {
  scenario: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

const QUESTIONS: Q[] = [
  {
    scenario:
      "Du måler ventetid på et legekontor for 120 pasienter. Histogrammet viser tung høyre-hale: noen få pasienter venter veldig lenge.",
    question: "Hvilket sentralmål rapporterer du som 'typisk ventetid'?",
    options: ["Gjennomsnitt", "Median", "Modus", "Standardavvik"],
    correct: 1,
    explanation:
      "Skjev fordeling med en hale ⇒ mean dras mot halen og overdriver 'typisk'. Median er robust og beskriver midten av faktiske observasjoner.",
  },
  {
    scenario:
      "En produksjonslinje måler diameter på 500 aksler. Fordelingen er tilnærmet symmetrisk og normal-aktig, ingen outliers.",
    question: "Hvilken par rapporterer du i en kvalitetskontroll-rapport?",
    options: ["Median + IQR", "Mean + standardavvik", "Modus + range", "Min og max alene"],
    correct: 1,
    explanation:
      "Symmetrisk fordeling uten outliers ⇒ mean + std er meningsfullt OG brukes som input til kontroll-grenser (μ ± 3σ).",
  },
  {
    scenario:
      "Du sammenligner lønn i 5 ulike avdelinger og vil vise spredningen og medianen i hver gruppe samtidig.",
    question: "Hvilken visualisering velger du?",
    options: [
      "5 separate histogrammer",
      "Linjediagram med tid på x-aksen",
      "Gruppert boksplott (boxplot per avdeling)",
      "Scatter plot",
    ],
    correct: 2,
    explanation:
      "Boksplott side-om-side er den klassiske valget for å sammenligne fordelinger på tvers av kategorier — viser median, IQR og outliers per gruppe.",
  },
  {
    scenario:
      "En enkelt sensor på en stålplate ga 14.2 mm, mens de andre 19 sensorene ga verdier mellom 12.0 og 12.5 mm.",
    question: "Hvordan påvirker denne outlieren mean vs. median?",
    options: [
      "Begge påvirkes likt",
      "Mean påvirkes kraftig, median knapt",
      "Median påvirkes kraftig, mean knapt",
      "Ingen påvirkes — målfeil tas automatisk bort",
    ],
    correct: 1,
    explanation:
      "Mean summerer alle verdier ⇒ én ekstrem verdi trekker den. Median ser bare på rekkefølgen ⇒ den rikker seg knapt med én outlier.",
  },
  {
    scenario:
      "Du har et datasett med kunder kategorisert som 'aktiv', 'passiv', 'churned'. Hvilken statistikk gir mening?",
    question: "Hva rapporterer du?",
    options: [
      "Gjennomsnitt og standardavvik",
      "Median og IQR",
      "Modus og frekvenstabell (med prosenter)",
      "Skewness og kurtosis",
    ],
    correct: 2,
    explanation:
      "Kategoriske (nominale) data har ingen numerisk orden. Mean/median er udefinerte. Modus + frekvenstabell er det riktige.",
  },
  {
    scenario:
      "Du beregner stikkprøve-varians for 25 målinger i Python. Du vet ikke om np.var() default deler på n eller n−1.",
    question: "Hvilken parameter må du sette for å få stikkprøve-varians?",
    options: [
      "np.var(x)  — default er stikkprøve",
      "np.var(x, ddof=1)",
      "np.var(x, ddof=0)",
      "np.var(x, axis=1)",
    ],
    correct: 1,
    explanation:
      "Numpy default er ddof=0 (deler på n, populasjons-varians). Stikkprøve-varians (deler på n−1) krever ddof=1. Klassisk eksamen-felle.",
  },
  {
    scenario:
      "Du skal vise hvordan inntekt henger sammen med utdanningsnivå (år utdanning). Begge er numeriske.",
    question: "Hvilken visualisering er førstevalget?",
    options: ["Søylediagram", "Histogram", "Scatter plot", "Kakediagram"],
    correct: 2,
    explanation:
      "To kontinuerlige variabler ⇒ scatter plot. Det viser sammenhengen direkte og er grunnlaget for korrelasjon/regresjon.",
  },
  {
    scenario:
      "Du rapporterer for ledelsen at 'gjennomsnittsalderen i kundebasen er 38 år'. Histogrammet viser to topper: en rundt 25 og en rundt 55.",
    question: "Hva er problemet?",
    options: [
      "Gjennomsnittet er feil beregnet",
      "Fordelingen er bimodal — gjennomsnittet (38) representerer ingen faktisk gruppe",
      "Du burde brukt populasjons-varians",
      "Det er ingen problem — gjennomsnittet er alltid riktig",
    ],
    correct: 1,
    explanation:
      "Bimodal fordeling ⇒ gjennomsnittet faller i 'dalen' mellom toppene og misrepresenterer dataene. Riktig: del datasettet i to grupper og rapporter separat.",
  },
];

export function DescriptiveStatsQuiz() {
  const [picks, setPicks] = useState<Record<number, number>>({});
  const score = Object.entries(picks).filter(([i, p]) => QUESTIONS[+i].correct === p).length;
  const total = Object.keys(picks).length;
  const reset = () => setPicks({});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm">
          <span className="font-semibold">{total}</span> av 8 svart ·{" "}
          <span className="font-semibold text-emerald-500">{score}</span> riktige
        </div>
        <button
          type="button"
          onClick={reset}
          className="px-2.5 py-1 rounded text-xs font-medium border border-border bg-card hover:bg-muted"
        >
          Nullstill
        </button>
      </div>
      <div className="space-y-4">
        {QUESTIONS.map((q, i) => (
          <QuestionCard
            key={i}
            q={q}
            n={i + 1}
            pick={picks[i]}
            onPick={(p) => setPicks({ ...picks, [i]: p })}
          />
        ))}
      </div>
    </div>
  );
}

function QuestionCard({
  q,
  n,
  pick,
  onPick,
}: {
  q: Q;
  n: number;
  pick: number | undefined;
  onPick: (p: number) => void;
}) {
  const answered = pick !== undefined;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-[11px] uppercase tracking-wider text-brand font-semibold mb-1">
        Scenario {n}
      </div>
      <p className="text-sm text-foreground mb-2">{q.scenario}</p>
      <p className="text-sm font-medium mb-3">{q.question}</p>
      <div className="space-y-1.5">
        {q.options.map((opt, j) => {
          const isPick = pick === j;
          const isCorrect = q.correct === j;
          const showState = answered && (isPick || isCorrect);
          const cls = showState
            ? isCorrect
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-rose-500 bg-rose-500/10"
            : isPick
              ? "border-brand bg-brand/10"
              : "border-border bg-background hover:bg-muted";
          return (
            <button
              key={j}
              type="button"
              onClick={() => !answered && onPick(j)}
              disabled={answered}
              className={`w-full text-left px-3 py-2 rounded-md border text-sm transition ${cls} ${
                answered ? "cursor-default" : "cursor-pointer"
              }`}
            >
              {String.fromCharCode(65 + j)}. {opt}
              {answered && isCorrect && (
                <span className="ml-2 text-[11px] text-emerald-500">[fasit]</span>
              )}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-3 rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
          <strong className="text-foreground">Forklaring:</strong> {q.explanation}
        </div>
      )}
    </div>
  );
}
