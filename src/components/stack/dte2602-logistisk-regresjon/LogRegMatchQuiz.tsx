import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";

type Choice = {
  id: string;
  label: string;
  right: boolean;
  explain: string;
};

type Question = {
  id: string;
  scenario: string;
  details: string;
  choices: Choice[];
};

const QUESTIONS: Question[] = [
  {
    id: "q1",
    scenario: "Kredittvurdering: 100 000 søknader, 3 % positive (mislighold), tabular features",
    details:
      "Mål: estimer sannsynlighet for mislighold for hver søknad. Bankens system bruker dette til både scoring og terskel-basert avgjørelse.",
    choices: [
      {
        id: "a",
        label: "class_weight='balanced' + behold sannsynligheter, ikke argmax",
        right: true,
        explain:
          "97/3-ubalanse — uten vekting lærer modellen «alltid 0» og scorer 97 % accuracy uten verdi. Sannsynlighetene må bevares fordi banken setter terskelen forretningsmessig.",
      },
      {
        id: "b",
        label: "SMOTE-oversample minoriteten på hele datasettet før split",
        right: false,
        explain:
          "SMOTE på hele datasettet lekker informasjon fra test til train. SMOTE skal ALDRI røre test-settet — og selv på train introduserer det syntetiske punkter som forvrenger sannsynlighetene.",
      },
      {
        id: "c",
        label: "Senk terskel til 0.2 for å fange flere positive",
        right: true,
        explain:
          "Terskel-justering er det riktige forretningsverktøyet — modellen output samme sannsynligheter, du bare endrer hvilke som kalles «positive» basert på cost-of-false-negative.",
      },
    ],
  },
  {
    id: "q2",
    scenario: "Medisinsk screening: brystkreft-deteksjon på mammogram-features",
    details:
      "Falske negative (missed cancer) er mye verre enn falske positive (gjentatte tester). Sykehuset trenger en modell med høy recall, tolkbarhet er bonus.",
    choices: [
      {
        id: "a",
        label: "Optimaliser for høy recall ved å senke terskel under 0.5",
        right: true,
        explain:
          "Når kostnaden for FN er mye høyere enn FP, skal terskelen ned. Bytt ut accuracy med recall@precision≥X eller bruk Youden-J på ROC.",
      },
      {
        id: "b",
        label: "Maksimér accuracy — det er mest standard",
        right: false,
        explain:
          "Accuracy ignorerer ubalanserte kostnader. En modell som alltid sier «negativ» kan ha 99 % accuracy hvis bare 1 % har kreft — og bommer på alle som faktisk har den.",
      },
      {
        id: "c",
        label: "Tolk odds-ratio per feature (e^β) for hver av de viktigste prediktorene",
        right: true,
        explain:
          "Logistisk regresjon gir tolkbare odds-ratio som klinikere kan diskutere. e^β = 1.8 for «mikrokalk-tetthet» betyr «80 % økning i odds per enhet økning».",
      },
    ],
  },
  {
    id: "q3",
    scenario: "Tekstklassifikasjon: artikler i 5 kategorier (sport/økonomi/politikk/kultur/teknologi)",
    details:
      "TF-IDF-features, ~30 000 dimensjoner, 50 000 artikler. Multi-class output, ikke binær.",
    choices: [
      {
        id: "a",
        label: "Multinomial logistisk regresjon (softmax) med L2-regularisering",
        right: true,
        explain:
          "Softmax er den naturlige multinomiale generaliseringen av sigmoid. L2 er nødvendig fordi p ≈ n; ureg log-reg vil overfitte og gi divergente vekter.",
      },
      {
        id: "b",
        label: "5 separate binære log-reg-modeller (one-vs-rest)",
        right: false,
        explain:
          "OvR fungerer, men sannsynlighetene summerer ikke til 1 og er ikke direkte sammenlignbare. For ren multi-class-klassifikasjon er softmax bedre — den optimerer kategorisk cross-entropy direkte.",
      },
      {
        id: "c",
        label: "Bruk L1 (lasso) i tillegg for å plukke ut viktige ord",
        right: true,
        explain:
          "L1 gir sparse vekter — nyttig her fordi mest av vokabularet er irrelevant for hver klasse. Får automatisk feature-utvalg.",
      },
    ],
  },
  {
    id: "q4",
    scenario: "Ranking: vis 10 beste produkt-anbefalinger til hver bruker (n=5M brukere)",
    details:
      "Vi trenger ikke en hard «kjøper eller ei»-avgjørelse — vi trenger god sortering av produktene.",
    choices: [
      {
        id: "a",
        label: "Tren log-reg på (kjøp/ikke kjøp), sorter ved predikert sannsynlighet",
        right: true,
        explain:
          "For ranking trenger du bare en monotont stigende score — predikert sannsynlighet duger. Terskel og kalibrering er mindre viktig.",
      },
      {
        id: "b",
        label: "Evaluer med AUC, ikke accuracy",
        right: true,
        explain:
          "AUC måler ranking-kvalitet (sannsynlighet for at en positiv rankes over en negativ). Det er nøyaktig metrikken du bryr deg om i ranking-problemer.",
      },
      {
        id: "c",
        label: "Bruk sklearn med default-terskel 0.5 og rapporter F1",
        right: false,
        explain:
          "Terskel og F1 er irrelevante for ranking — du eksponerer aldri en binær avgjørelse. Du leverer en rangert liste.",
      },
    ],
  },
  {
    id: "q5",
    scenario: "Klinikk-prediksjon: forutsi 30-dagers re-innleggelse med 12 features (alder, ko-morbiditet, …)",
    details:
      "Ønsker tolkbare koeffisienter til en publikasjon. Features har svært ulike skalaer (alder 0–100, BMI 15–45, antall ko-morbiditeter 0–10).",
    choices: [
      {
        id: "a",
        label: "StandardScaler før LogisticRegression",
        right: true,
        explain:
          "Uten skalering favoriserer L2-reg features med liten skala (deres koeffisienter blir naturlig store). Skalering gjør reg «rettferdig» og GD/lbfgs konvergerer raskere.",
      },
      {
        id: "b",
        label: "Rapporter rå koeffisienter β som «effekt-størrelser»",
        right: false,
        explain:
          "Med skalerte features er β-verdiene i standard-deviasjons-enheter, ikke originale enheter. Rapporter e^β som odds-ratio per enhet, transformert tilbake til opprinnelig skala for klinisk tolkning.",
      },
      {
        id: "c",
        label: "Bruk C = 1 (default sklearn) og evaluer med cross-validation",
        right: true,
        explain:
          "Default L2-reg gir robust modell. CV velger optimal C og estimerer ekte ut-av-prøve-ytelse.",
      },
    ],
  },
  {
    id: "q6",
    scenario: "Bedrageri-deteksjon: 0.1 % positive, sanntids-scoring av transaksjoner",
    details:
      "Hver transaksjon må scores under 100 ms. Modellen oppdateres ukentlig på dagens data. Falske positive irriterer kunder; falske negative koster penger.",
    choices: [
      {
        id: "a",
        label: "Logistisk regresjon med L1 og class_weight='balanced'",
        right: true,
        explain:
          "Log-reg er bestemt favoritt for sanntids-bruk fordi inferens er bare et indreprodukt. L1 gir sparse vekter (raskt) og class_weight håndterer 0.1 %-positiv-rate.",
      },
      {
        id: "b",
        label: "Optimaliser terskel basert på cost-matrix (€ per FN vs FP)",
        right: true,
        explain:
          "Med kjente kostnader er optimal terskel direkte beregnbar: T* = c(FP) / (c(FP) + c(FN)). Mye bedre enn default 0.5 eller F1-maks.",
      },
      {
        id: "c",
        label: "Bruk accuracy som hovedmetrikk i CV",
        right: false,
        explain:
          "På 0.1 %-ubalanse er accuracy nesten meningsløst — en modell som alltid sier «ikke bedrageri» får 99.9 %. Bruk PR-AUC, recall@precision≥X, eller direkte cost-funksjon.",
      },
    ],
  },
];

export function LogRegMatchQuiz() {
  const [picked, setPicked] = useState<Record<string, Set<string>>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const togglePick = (qid: string, cid: string) => {
    if (revealed.has(qid)) return;
    setPicked((prev) => {
      const set = new Set(prev[qid] ?? []);
      if (set.has(cid)) set.delete(cid);
      else set.add(cid);
      return { ...prev, [qid]: set };
    });
  };

  const reveal = (qid: string) =>
    setRevealed((prev) => new Set([...prev, qid]));

  const reset = (qid: string) => {
    setPicked((prev) => {
      const next = { ...prev };
      delete next[qid];
      return next;
    });
    setRevealed((prev) => {
      const next = new Set(prev);
      next.delete(qid);
      return next;
    });
  };

  const score = useMemo(() => {
    let correct = 0;
    let total = 0;
    for (const q of QUESTIONS) {
      if (!revealed.has(q.id)) continue;
      const sel = picked[q.id] ?? new Set();
      const rightIds = new Set(q.choices.filter((c) => c.right).map((c) => c.id));
      const wrongIds = new Set(q.choices.filter((c) => !c.right).map((c) => c.id));
      let allRight = true;
      for (const c of q.choices) {
        const isPicked = sel.has(c.id);
        if (c.right && !isPicked) allRight = false;
        if (!c.right && isPicked) allRight = false;
      }
      void rightIds;
      void wrongIds;
      if (allRight) correct++;
      total++;
    }
    return { correct, total };
  }, [picked, revealed]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="text-sm font-semibold">Match: hvilke innstillinger passer?</h3>
          <p className="text-xs text-muted-foreground mt-1">
            6 scenarier. Velg <em>alle</em> riktige valg per scenario. Det kan
            være 1, 2 eller flere riktige svar.
          </p>
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">
          Score: {score.correct}/{score.total}
        </div>
      </div>

      <div className="space-y-4">
        {QUESTIONS.map((q) => {
          const sel = picked[q.id] ?? new Set();
          const isRevealed = revealed.has(q.id);
          return (
            <div key={q.id} className="rounded-lg border border-border bg-background p-4">
              <div className="font-medium text-sm">{q.scenario}</div>
              <div className="text-xs text-muted-foreground mt-1 mb-3">{q.details}</div>
              <div className="space-y-2">
                {q.choices.map((c) => {
                  const isPicked = sel.has(c.id);
                  const showResult = isRevealed;
                  let cls = "border-border bg-background hover:border-foreground/40";
                  if (showResult) {
                    if (c.right) cls = "border-emerald-500/60 bg-emerald-500/10";
                    else if (isPicked) cls = "border-red-500/60 bg-red-500/10";
                    else cls = "border-border bg-background opacity-70";
                  } else if (isPicked) {
                    cls = "border-brand bg-brand/10";
                  }
                  return (
                    <button
                      key={c.id}
                      onClick={() => togglePick(q.id, c.id)}
                      disabled={isRevealed}
                      className={`block w-full text-left rounded-md border px-3 py-2 text-xs transition-colors ${cls} ${
                        isRevealed ? "cursor-default" : "cursor-pointer"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0">
                          {showResult ? (
                            c.right ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : isPicked ? (
                              <X className="h-3.5 w-3.5 text-red-500" />
                            ) : (
                              <span className="inline-block h-3.5 w-3.5" />
                            )
                          ) : (
                            <span
                              className={`inline-block h-3.5 w-3.5 rounded border ${
                                isPicked ? "bg-brand border-brand" : "border-border"
                              }`}
                            />
                          )}
                        </span>
                        <div className="flex-1">
                          <div>{c.label}</div>
                          {showResult && (
                            <div className="text-[11px] text-muted-foreground mt-1 leading-snug">
                              {c.explain}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-3">
                {!isRevealed ? (
                  <button
                    onClick={() => reveal(q.id)}
                    className="text-xs px-3 py-1 rounded-md border border-brand/40 bg-brand/10 hover:bg-brand/20"
                  >
                    Sjekk svar
                  </button>
                ) : (
                  <button
                    onClick={() => reset(q.id)}
                    className="text-xs px-3 py-1 rounded-md border border-border bg-background hover:bg-muted/50"
                  >
                    Prøv igjen
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
