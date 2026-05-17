import { useState } from "react";
import { DIST_LABELS, type DistKind } from "./distUtils";

/**
 * DistributionMatchQuiz — 8 use-cases, brukeren velger riktig fordeling.
 */

interface QuizItem {
  scenario: string;
  options: DistKind[];
  correct: DistKind;
  explanation: string;
}

const QUIZ: QuizItem[] = [
  {
    scenario: "Antall produksjonsfeil per måned i en fabrikk som har 4 feil i snitt per måned. Feilene er sjeldne og uavhengige.",
    options: ["binomial", "poisson", "normal", "exponential"],
    correct: "poisson",
    explanation: "Antall sjeldne uavhengige hendelser i et fast intervall (måned). λ = 4. Klassisk Poisson-mønster: 'antall ... per ...'.",
  },
  {
    scenario: "Høyde til voksne menn i Norge. Resultatet av tusenvis av små genetiske og miljømessige bidrag.",
    options: ["normal", "uniform", "gamma", "exponential"],
    correct: "normal",
    explanation: "Sum av mange små uavhengige bidrag → CLT → Normal. Høyde, IQ, mange biologiske mål er omtrent normalfordelt.",
  },
  {
    scenario: "Tid mellom busser som ankommer en holdeplass når bussene kommer i snitt hvert 10. minutt (Poisson-prosess).",
    options: ["exponential", "uniform", "normal", "gamma"],
    correct: "exponential",
    explanation: "Tid mellom hendelser i en Poisson-prosess er eksponentialfordelt med rate λ = 1/10 per minutt. Memoryless-egenskapen.",
  },
  {
    scenario: "Antall ess man trekker når man trekker 5 kort fra en kortstokk (uten tilbakelegging).",
    options: ["binomial", "poisson", "normal", "uniform"],
    correct: "binomial", // Egentlig hypergeometrisk! Men i en quiz uten det alternativet er binomial nærmeste tilnærming
    explanation: "Egentlig hypergeometrisk (uten tilbakelegging fra endelig populasjon). I våre 8-fordelings-katalog er binomial nærmeste tilnærming, men husk: hypergeometrisk er teknisk riktig fordi trekkene IKKE er uavhengige.",
  },
  {
    scenario: "Et terningkast gir verdien 1, 2, 3, 4, 5 eller 6, hver med lik sannsynlighet.",
    options: ["uniform", "normal", "binomial", "poisson"],
    correct: "uniform",
    explanation: "Diskret uniform (eller kontinuerlig analog U(0.5, 6.5)). Alle utfall like sannsynlige → uniform.",
  },
  {
    scenario: "Antall hoder i 100 myntkast med en rettferdig mynt.",
    options: ["binomial", "poisson", "normal", "exponential"],
    correct: "binomial",
    explanation: "n=100 uavhengige forsøk med samme p=0.5 → Binomial(100, 0.5). E[X] = 50, σ² = 25. Kan tilnærmes med N(50, 25) (de Moivre–Laplace).",
  },
  {
    scenario: "Levetid på en LED-lyspære, hvis aldring ignoreres (konstant feilrate over tid).",
    options: ["exponential", "normal", "uniform", "gamma"],
    correct: "exponential",
    explanation: "Konstant feilrate ⇒ memoryless ⇒ eksponentiell. (Med aldring ville Weibull eller Gamma vært mer presist.)",
  },
  {
    scenario: "Tid å fullføre en samlebånd-oppgave som krever 5 sekvensielle steg, hvor hvert steg er eksponentialfordelt.",
    options: ["gamma", "exponential", "normal", "uniform"],
    correct: "gamma",
    explanation: "Sum av k uavhengige Exp(β) er Gamma(k, β). Her k=5 → Gamma(5, β). Mer realistisk modell for totale ventetider enn én enkelt eksponentiell.",
  },
];

export function DistributionMatchQuiz() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, DistKind>>({});
  const [showAll, setShowAll] = useState(false);

  const current = QUIZ[idx];
  const userAnswer = answers[idx];
  const isAnswered = userAnswer !== undefined;
  const isCorrect = isAnswered && userAnswer === current.correct;

  function pick(k: DistKind) {
    if (isAnswered) return;
    setAnswers((a) => ({ ...a, [idx]: k }));
  }

  function next() {
    if (idx < QUIZ.length - 1) setIdx(idx + 1);
    else setShowAll(true);
  }

  function reset() {
    setIdx(0);
    setAnswers({});
    setShowAll(false);
  }

  const totalCorrect = Object.entries(answers).filter(
    ([i, ans]) => ans === QUIZ[+i].correct,
  ).length;

  if (showAll) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          DistributionMatchQuiz — resultat
        </div>
        <div className="rounded-lg border-2 border-brand/40 bg-brand/5 p-4">
          <div className="text-lg font-bold">
            Du fikk {totalCorrect} av {QUIZ.length} riktig ({Math.round(100 * totalCorrect / QUIZ.length)}%)
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {totalCorrect === QUIZ.length ? "Perfekt — du eier fordelings-tabellen!"
              : totalCorrect >= 6 ? "Solid jobb. Repeter forklaringene på de du bommet på."
              : "Anbefal: gå tilbake til fordelings-tabellen i lesjonen og les igjennom én gang til."}
          </div>
        </div>
        <div className="space-y-2">
          {QUIZ.map((q, i) => {
            const ans = answers[i];
            const ok = ans === q.correct;
            return (
              <div key={i} className={`rounded-lg p-3 text-xs border ${
                ok ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-amber-500/40 bg-amber-500/5"
              }`}>
                <div className="font-medium mb-1">{i + 1}. {q.scenario}</div>
                <div>
                  <span className="text-muted-foreground">Du svarte: </span>
                  <strong>{ans ? DIST_LABELS[ans] : "—"}</strong>
                  {!ok && <>{" → riktig: "}<strong className="text-emerald-700 dark:text-emerald-400">{DIST_LABELS[q.correct]}</strong></>}
                </div>
                <div className="mt-1 text-muted-foreground">{q.explanation}</div>
              </div>
            );
          })}
        </div>
        <button type="button" onClick={reset}
          className="px-3 py-1.5 rounded text-xs font-medium bg-brand text-white hover:bg-brand/90">
          Start på nytt
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          DistributionMatchQuiz — velg riktig fordeling
        </div>
        <div className="text-[11px] text-muted-foreground">
          {idx + 1} / {QUIZ.length} · {totalCorrect} riktig så langt
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        For hvert scenario: hvilken fordeling passer best? Tenk på hva
        spørsmålet egentlig spør om — antall, tid, sum, ratio, måling.
      </p>

      <div className="rounded-lg border border-border bg-background p-4">
        <div className="text-sm font-medium mb-3">
          {idx + 1}. {current.scenario}
        </div>
        <div className="grid sm:grid-cols-2 gap-1.5">
          {current.options.map((opt) => {
            const isUser = userAnswer === opt;
            const isCorrectOpt = current.correct === opt;
            let cls = "border-border bg-card hover:bg-muted";
            if (isAnswered) {
              if (isCorrectOpt) cls = "border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200";
              else if (isUser) cls = "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200";
              else cls = "border-border bg-card opacity-60";
            }
            return (
              <button key={opt} type="button" onClick={() => pick(opt)}
                disabled={isAnswered}
                className={`px-3 py-2 rounded text-sm font-medium border text-left transition ${cls}`}>
                {DIST_LABELS[opt]}
              </button>
            );
          })}
        </div>
      </div>

      {isAnswered && (
        <div className={`rounded-lg p-3 text-xs border ${
          isCorrect ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-amber-500/40 bg-amber-500/5"
        }`}>
          <strong>{isCorrect ? "Riktig!" : `Nesten — riktig er ${DIST_LABELS[current.correct]}.`}</strong>{" "}
          {current.explanation}
        </div>
      )}

      <div className="flex justify-between">
        <button type="button" onClick={reset}
          className="px-3 py-1.5 rounded text-xs font-medium border border-border hover:bg-muted">
          Reset
        </button>
        <button type="button" onClick={next} disabled={!isAnswered}
          className="px-3 py-1.5 rounded text-xs font-medium bg-brand text-white hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed">
          {idx < QUIZ.length - 1 ? "Neste →" : "Vis resultat"}
        </button>
      </div>

      <div className="text-[10px] text-muted-foreground italic">
        Tips: noen scenarioer er bevisst grenseland (hypergeometrisk vs. binomial, Gamma vs. Eksponentiell) — tenk på hvilken fordeling som er nærmest under de gitte alternativene, og les forklaringen for nyansene.
      </div>
    </div>
  );
}
