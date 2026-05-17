import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";

type Model = "lda" | "qda" | "nb";

type Question = {
  id: string;
  scenario: string;
  details: string;
  answer: Model;
  explain: string;
};

const QUESTIONS: Question[] = [
  {
    id: "q1",
    scenario: "Medisinsk diagnose: 5 korrelerte symptomer, 800 pasienter, 2 klasser",
    details:
      "Symptomene (puls, blodtrykk, oksygenmetning, temp, respirasjonsrate) korrelerer sterkt. n=800 er rommelig for p=5.",
    answer: "qda",
    explain:
      "Naive Bayes' uavhengighetsantakelse er åpenbart feil her — symptomene henger sammen. Med n=800 og p=5 har du nok data til at QDA kan estimere full covariance per klasse uten å overfitte.",
  },
  {
    id: "q2",
    scenario: "Spam-deteksjon: 30 000 mailer, vokabular på 25 000 ord (bag-of-words)",
    details:
      "p ≈ 25 000, n ≈ 30 000. Hver mail er en sparse binær vektor. Klassifiserer i sanntid på serveren.",
    answer: "nb",
    explain:
      "Når p og n er av samme størrelsesorden er covariance-matrisen i LDA/QDA ikke estimerbar. NB antar uavhengighet og estimerer kun 2·p·K parametre — derfor er Multinomial/Bernoulli NB de-facto-baseline for tekstklassifisering.",
  },
  {
    id: "q3",
    scenario: "Ansikts-gjenkjenning: 20 PCA-komponenter, klassene er normalfordelt med lik spredning",
    details:
      "Etter PCA er features omtrent dekorrelerte. Klassene har omtrent samme covariance i lavdim-rommet. n=400, K=10 klasser.",
    answer: "lda",
    explain:
      "Klassene oppfyller LDAs antakelse (lik Σ, ≈ normal) og du har lite data per klasse (40). LDAs lave varians slår QDAs større fleksibilitet — bias er liten siden antakelsen er nær sann.",
  },
  {
    id: "q4",
    scenario: "Iris-data: 4 features, 3 klasser, 150 samples, ulik spredning per klasse",
    details:
      "setosa er kompakt, versicolor og virginica er mer overlappende ellipsoider med ulik orientering.",
    answer: "qda",
    explain:
      "Ulik spredning per klasse → LDA biaser pooled-Σ til et kompromiss. n=150 og p=4 gir nok data per klasse (~50) til at QDA kan estimere Σₖ stabilt.",
  },
  {
    id: "q5",
    scenario: "Sentiment-analyse av tweets: 5 000 features (n-grams), 2 000 treningstweets",
    details:
      "p > n. Sparse binær input. Kjapp baseline ønskes før dyp-læring.",
    answer: "nb",
    explain:
      "Bernoulli/Multinomial NB er den klassiske go-to-baselinen. LDA/QDA krasjer (singulær covariance når p > n), og selv om uavhengighetsantakelsen brytes, presterer NB svært godt i praksis på tekst.",
  },
  {
    id: "q6",
    scenario: "Kredittrisiko: 6 numeriske features (inntekt, gjeld, alder...), 5 000 søknader, sterkt korrelert",
    details:
      "Inntekt og gjeld korrelerer (~0.6), alder og kreditthistorikk (~0.5). Klassene god/dårlig betaler har lignende, men ikke identisk, spredning.",
    answer: "lda",
    explain:
      "p=6, n=5 000 — masser av data. Korrelasjonen er moderat og likt mønstret mellom klassene, så LDA fanger den via pooled Σ. QDA ville fungert også men gir ekstra varians for liten gevinst. NB ignorerer den viktige korrelasjonen mellom inntekt og gjeld — typisk underyter her.",
  },
];

export function MatchQuiz() {
  const [answers, setAnswers] = useState<Record<string, Model | undefined>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const score = useMemo(() => {
    let s = 0;
    for (const q of QUESTIONS) {
      if (revealed[q.id] && answers[q.id] === q.answer) s++;
    }
    return s;
  }, [answers, revealed]);

  const answeredAll = QUESTIONS.every((q) => revealed[q.id]);

  const reset = () => {
    setAnswers({});
    setRevealed({});
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm">
          <span className="text-muted-foreground">Riktige:</span>{" "}
          <span className="font-bold tabular-nums">
            {score} / {QUESTIONS.length}
          </span>
        </div>
        <button
          onClick={reset}
          className="text-xs px-3 py-1 rounded-md border border-border bg-background hover:bg-muted/50"
        >
          Start på nytt
        </button>
      </div>
      <ol className="space-y-3">
        {QUESTIONS.map((q, idx) => {
          const picked = answers[q.id];
          const isRevealed = revealed[q.id];
          const correct = picked === q.answer;
          return (
            <li
              key={q.id}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="text-xs font-mono text-brand mb-1">
                Case {idx + 1}
              </div>
              <div className="text-sm font-medium">{q.scenario}</div>
              <div className="text-xs text-muted-foreground mt-1 mb-3">
                {q.details}
              </div>
              <div className="flex flex-wrap gap-2">
                {(["lda", "qda", "nb"] as Model[]).map((m) => {
                  const isPick = picked === m;
                  const isAnswer = q.answer === m;
                  let cls =
                    "border-border bg-background text-muted-foreground hover:border-brand/40";
                  if (isRevealed) {
                    if (isAnswer) {
                      cls =
                        "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
                    } else if (isPick) {
                      cls =
                        "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300";
                    } else {
                      cls = "border-border bg-background text-muted-foreground";
                    }
                  } else if (isPick) {
                    cls = "border-brand bg-brand/10 text-foreground";
                  }
                  return (
                    <button
                      key={m}
                      disabled={isRevealed}
                      onClick={() => setAnswers({ ...answers, [q.id]: m })}
                      className={`px-3 py-1.5 rounded-md text-xs font-mono border transition-colors ${cls} disabled:cursor-default`}
                    >
                      {m.toUpperCase()}
                      {isRevealed && isAnswer && (
                        <Check className="inline h-3 w-3 ml-1" />
                      )}
                      {isRevealed && isPick && !isAnswer && (
                        <X className="inline h-3 w-3 ml-1" />
                      )}
                    </button>
                  );
                })}
                {!isRevealed && (
                  <button
                    disabled={!picked}
                    onClick={() => setRevealed({ ...revealed, [q.id]: true })}
                    className="ml-auto text-xs px-3 py-1 rounded-md border border-border bg-background hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Sjekk svar
                  </button>
                )}
              </div>
              {isRevealed && (
                <div
                  className={`mt-3 text-xs rounded-md border p-3 ${
                    correct
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-rose-500/40 bg-rose-500/5"
                  }`}
                >
                  <div className="font-semibold mb-1">
                    {correct ? "Riktig" : "Feil"} — fasit:{" "}
                    <span className="font-mono">{q.answer.toUpperCase()}</span>
                  </div>
                  <div className="text-muted-foreground">{q.explain}</div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {answeredAll && (
        <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-3 text-sm">
          Du fikk {score} av {QUESTIONS.length}. Tommelfingerregler:{" "}
          <strong>LDA</strong> når klassene har lignende spredning og n er
          moderat. <strong>QDA</strong> når spredningen åpenbart skiller seg og du
          har nok data per klasse. <strong>NB</strong> når p ≫ n eller features er
          tilnærmet uavhengige (NLP).
        </div>
      )}
    </div>
  );
}
