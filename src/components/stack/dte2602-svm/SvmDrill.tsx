import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type Question = {
  prompt: string;
  options: string[];
  correctIdx: number;
  explanation: string;
};

const QUESTIONS: Question[] = [
  {
    prompt:
      "Når er SVM med lineær kjerne kvalitativt FORSKJELLIG fra logistisk regresjon?",
    options: [
      "SVM bruker sannsynligheter, logreg gjør ikke det.",
      "SVM optimerer for margin og bryr seg bare om punkter nærmest grensa — logreg bryr seg om ALLE punkter via log-loss.",
      "Logreg klarer ikke flerdimensjonale features, det gjør SVM.",
      "SVM trenger ikke feature-skalering, det gjør logreg.",
    ],
    correctIdx: 1,
    explanation:
      "Logreg sin log-loss er en sum over alle samples — selv punkter langt fra grensa drar litt i koeffisientene. SVM sin hinge-loss er 0 for alle punkter UTENFOR margin-sonen, så bare støttevektorene styrer hyperplanet. (Begge bør skaleres, og begge gir hard prediksjon; logreg gir attpåtil kalibrert sannsynlighet.)",
  },
  {
    prompt:
      "Du har to klasser som ligger i en spiral inni hverandre i 2D. Hvilken SVM-variant passer best?",
    options: [
      "Lineær kjerne — alltid enklest og raskest.",
      "Ingen — SVM duger ikke for ikke-lineære grenser.",
      "RBF-kjerne — den projiserer implisitt dataene til et høyere-dimensjonalt rom hvor grensa kan bli lineær.",
      "Polynom-kjerne av grad 1 — det er det samme som lineær uansett.",
    ],
    correctIdx: 2,
    explanation:
      "Spiraler er klassisk ikke-lineær separabel. RBF (Gauss-kjerne) gir lokal innflytelse rundt hvert støttevektor-punkt og kan forme en grense som krummer rundt klassene. Lineær feiler helt, polynom-grad-1 ER lineær.",
  },
  {
    prompt:
      "Hva betyr «støttevektorer» (support vectors) i SVM?",
    options: [
      "Vektorene i input-rommet som peker fra origo til hvert datapunkt.",
      "Egenvektorene til kovariansematrisen — som i PCA.",
      "Datapunktene som ligger PÅ margin-grensa eller innenfor — de eneste som er nødvendige for å definere hyperplanet.",
      "Et alias for vektoren w som beskriver hyperplanet.",
    ],
    correctIdx: 2,
    explanation:
      "Trening kan fjerne alle andre punkter uten å endre modellen. Det er det som gjør SVM elegant og minneeffektiv etter trening, men også grunnen til at SVM er følsom for outliers nær grensa.",
  },
  {
    prompt:
      "Du fitter en SVM på 200 000 samples og det tar evigheter. Hva er det mest sannsynlige problemet?",
    options: [
      "Du må normalisere y-variabelen.",
      "Standard SVC i sklearn skalerer omtrent O(n²)–O(n³) i antall samples — RBF-SVM blir veldig sakte over noen tusen samples.",
      "Du må velge en større gamma.",
      "Du burde ha brukt SVM for regresjon (SVR) istedenfor.",
    ],
    correctIdx: 1,
    explanation:
      "Det er den klassiske SVM-eksamenfella. Over ~10 000 samples med RBF: bruk LinearSVC, SGDClassifier(loss='hinge'), eller bytt til gradient-boosted trær / nevralnett. Random Forest skalerer mye bedre.",
  },
];

export function SvmDrill() {
  return (
    <div className="space-y-4">
      {QUESTIONS.map((q, i) => (
        <DrillQuestion key={i} q={q} idx={i} />
      ))}
    </div>
  );
}

function DrillQuestion({ q, idx }: { q: Question; idx: number }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const isCorrect = selected === q.correctIdx;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        Spørsmål {idx + 1}
      </div>
      <p className="text-sm text-foreground mb-3">{q.prompt}</p>
      <div className="space-y-2 mb-3">
        {q.options.map((opt, i) => {
          const chosen = selected === i;
          const showResult = revealed && chosen;
          const showCorrect = revealed && i === q.correctIdx;
          let cls =
            "w-full text-left px-3 py-2 rounded-md border text-sm transition-colors ";
          if (showCorrect) {
            cls += "border-emerald-500/60 bg-emerald-500/10 text-foreground";
          } else if (showResult && !isCorrect) {
            cls += "border-rose-500/60 bg-rose-500/10 text-foreground";
          } else if (chosen) {
            cls += "border-brand bg-brand/10 text-foreground";
          } else {
            cls += "border-border bg-background/40 text-muted-foreground hover:border-brand/40";
          }
          return (
            <button
              key={i}
              className={cls}
              onClick={() => {
                if (revealed) return;
                setSelected(i);
              }}
              disabled={revealed}
            >
              <span className="font-mono text-xs text-muted-foreground mr-2">
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1.5 text-xs rounded bg-brand text-brand-foreground disabled:opacity-40"
          onClick={() => setRevealed(true)}
          disabled={selected === null || revealed}
        >
          Sjekk svar
        </button>
        {revealed && (
          <button
            className="px-3 py-1.5 text-xs rounded bg-muted text-muted-foreground"
            onClick={() => {
              setSelected(null);
              setRevealed(false);
            }}
          >
            Prøv på nytt
          </button>
        )}
        {revealed && (
          <span
            className={`inline-flex items-center gap-1 text-xs ${
              isCorrect ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {isCorrect ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Riktig
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" /> Ikke helt
              </>
            )}
          </span>
        )}
      </div>
      {revealed && (
        <div className="mt-3 rounded-md border border-border bg-background/40 p-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Forklaring: </span>
          {q.explanation}
        </div>
      )}
    </div>
  );
}
