import { useState } from "react";

/**
 * 8 scenarier → match riktig test + tolking av p-verdi.
 * To spørsmål per scenario: (1) hvilken test, (2) hva betyr p-verdien.
 *
 * Læring: minst én scenario for hver av t-test (en-utvalg + to-utvalg),
 * z-test for andel, chi-square (uavhengighet), og Mann-Whitney U (ikke-parametrisk).
 */

type TestKind =
  | "t1"
  | "t2"
  | "paired-t"
  | "z-prop"
  | "chi-sq"
  | "mann-whitney"
  | "anova";

const TEST_LABELS: Record<TestKind, string> = {
  t1: "One-sample t-test",
  t2: "Two-sample t-test (Welch)",
  "paired-t": "Paret t-test",
  "z-prop": "z-test for andel",
  "chi-sq": "χ²-test (uavhengighet)",
  "mann-whitney": "Mann–Whitney U",
  anova: "Ettveis ANOVA",
};

const TEST_HINTS: Record<TestKind, string> = {
  t1: "Sammenligne ett kontinuerlig snitt mot en kjent verdi.",
  t2: "Sammenligne to uavhengige grupper på kontinuerlig utfall.",
  "paired-t": "Samme individ målt før/etter — differanser per par.",
  "z-prop": "Andel suksesser i én/to grupper, n stor nok for CLT.",
  "chi-sq": "Kategoriske variabler: er fordeling A uavhengig av fordeling B?",
  "mann-whitney": "Skjev/ordinal data, ingen normalitetsantakelse.",
  anova: "≥ 3 grupper på kontinuerlig utfall.",
};

interface Scenario {
  id: string;
  title: string;
  scenario: string;
  correctTest: TestKind;
  testRationale: string;
  // p-tolking-spørsmål
  pValue: number;
  alpha: number;
  options: string[];
  correctOptionIdx: number;
  interpExplanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "s1",
    title: "Tester ny medisin",
    scenario:
      "Et legemiddelfirma vil sjekke om en ny blodtrykksmedisin senker systolisk trykk i forhold til ingen behandling. 80 pasienter randomiseres til medisin vs. placebo. Utfallet er kontinuerlig (mmHg).",
    correctTest: "t2",
    testRationale:
      "To uavhengige grupper, kontinuerlig utfall, n moderat → Welch t-test (eller Student t hvis lik varians).",
    pValue: 0.03,
    alpha: 0.05,
    options: [
      "P(H₀ er sann) = 3 % — vi kan være 97 % sikre på at medisinen virker.",
      "Under H₀ (ingen effekt) ville vi sett en så stor effekt eller større i 3 % av forsøkene.",
      "Effekten av medisinen er 3 % større enn placebo.",
      "Vi har 3 % sjanse for å gjøre Type II-feil hvis vi forkaster H₀.",
    ],
    correctOptionIdx: 1,
    interpExplanation:
      "p-verdi er en hale-sannsynlighet under H₀ — ikke P(H₀|data) og ikke effektstørrelse.",
  },
  {
    id: "s2",
    title: "A/B-test på checkout-knappen",
    scenario:
      "Et nettsted viser to versjoner av en knapp til 5 000 besøkende hver og teller hvor mange som kjøper. Variant A: 412/5000, variant B: 478/5000. Er forskjellen i andel signifikant?",
    correctTest: "z-prop",
    testRationale:
      "Suksesser/feil per gruppe — to andeler, n stort ⇒ z-test for proporsjons-forskjell.",
    pValue: 0.018,
    alpha: 0.05,
    options: [
      "p = 0.018 betyr at variant B er 1.8 % bedre enn variant A.",
      "Under antagelsen om ingen reell forskjell ville vi sett like ekstrem forskjell eller større i 1.8 % av A/B-testene.",
      "Det er 98.2 % sjanse for at variant B er bedre enn variant A.",
      "Vi kan med 95 % sikkerhet si at B konverterer høyere enn 9.56 %.",
    ],
    correctOptionIdx: 1,
    interpExplanation:
      "p er definert under H₀. «98.2 % sjanse for B bedre» er en bayesiansk påstand — ikke det p sier.",
  },
  {
    id: "s3",
    title: "Valgforutsigelse",
    scenario:
      "En spørreundersøkelse spør 1 000 velgere om de støtter parti X, og finner 31 %. Avisen vil si: 'er andelen ulik 30 %?'",
    correctTest: "z-prop",
    testRationale:
      "Én andel testet mot en kjent verdi p₀ = 0.30. n stor ⇒ z-test for én andel.",
    pValue: 0.49,
    alpha: 0.05,
    options: [
      "p = 0.49 betyr at vi kan beholde H₀ — vi har ikke nok bevis til å si at andelen er forskjellig fra 30 %.",
      "p = 0.49 betyr at andelen er 49 % — vi har feiltolket dataene.",
      "p = 0.49 bekrefter at H₀ er sann med 49 % sikkerhet.",
      "p = 0.49 betyr at vi gjorde Type I-feil.",
    ],
    correctOptionIdx: 0,
    interpExplanation:
      "Stor p ⇒ beholde H₀. Men det betyr ikke H₀ er sann — bare at vi mangler bevis mot.",
  },
  {
    id: "s4",
    title: "Røyking og lungekreft (case-control)",
    scenario:
      "En studie krysser røyke-status (ja/nei) mot lungekreft-diagnose (ja/nei) i en 2×2-tabell over 600 personer.",
    correctTest: "chi-sq",
    testRationale:
      "To kategoriske variabler i en kontingenstabell ⇒ χ²-test for uavhengighet.",
    pValue: 0.0001,
    alpha: 0.01,
    options: [
      "Røyking forårsaker lungekreft hos 99.99 % av tilfellene.",
      "Vi forkaster H₀ om uavhengighet — kategoriene er statistisk assosiert.",
      "p &lt; α betyr at korrelasjon = 1.",
      "p = 0.0001 betyr at studien er feil.",
    ],
    correctOptionIdx: 1,
    interpExplanation:
      "χ² tester uavhengighet; vi forkaster H₀ men sier ingenting om kausalitet eller effektstørrelse.",
  },
  {
    id: "s5",
    title: "Trening-program før/etter",
    scenario:
      "20 personer måler 1RM på markløft før et 12-ukers program og igjen etter. Vi vil teste om snittet endrer seg.",
    correctTest: "paired-t",
    testRationale:
      "Samme individ målt to ganger ⇒ paret t-test på differansene d_i = etter_i − før_i.",
    pValue: 0.008,
    alpha: 0.05,
    options: [
      "Vi forkaster H₀: gjennomsnittsdifferansen er ikke 0.",
      "Programmet gjør deg 80 % sterkere.",
      "p = 0.008 sier hvor stor effekten er.",
      "p &lt; α betyr at H₁ er bevist.",
    ],
    correctOptionIdx: 0,
    interpExplanation:
      "Paret t-test fokuserer på differansene — forkast H₀: µ_d = 0. Effektstørrelsen er en annen statistikk (Cohen's d).",
  },
  {
    id: "s6",
    title: "Reaksjonstid i 4 grupper",
    scenario:
      "Vi måler reaksjonstid på 4 grupper (kontroll, koffein, energidrikk, søvnmangel), n = 25 hver. Er gjennomsnittene like?",
    correctTest: "anova",
    testRationale:
      "≥ 3 grupper, kontinuerlig utfall, samme variabel ⇒ ettveis ANOVA.",
    pValue: 0.03,
    alpha: 0.05,
    options: [
      "Vi forkaster H₀ — minst ett gruppesnitt skiller seg fra et annet (men vi vet ennå ikke hvilke uten post-hoc).",
      "Alle 4 grupper har ulike snitt.",
      "Koffein har signifikant effekt vs. kontroll.",
      "p &lt; α betyr at F-verdien er liten.",
    ],
    correctOptionIdx: 0,
    interpExplanation:
      "ANOVA gir global H₀: alle µ like. Forkasting krever post-hoc (Tukey, Bonferroni) for å peke ut hvilke par som skiller.",
  },
  {
    id: "s7",
    title: "Skjeve smerteskårer",
    scenario:
      "30 pasienter rapporterer smerte på en 0-10-skala før og etter to ulike behandlinger. Distribusjonen er svært skjev og ordinal, ikke normalfordelt.",
    correctTest: "mann-whitney",
    testRationale:
      "Ordinal/skjev data + to uavhengige grupper ⇒ ikke-parametrisk Mann–Whitney U test.",
    pValue: 0.12,
    alpha: 0.05,
    options: [
      "p &gt; α — vi har ikke nok bevis til å si at fordelingene er ulike.",
      "Mann–Whitney bevistee at behandlingene er like.",
      "Vi må bruke t-test fordi p &gt; 0.05.",
      "p = 0.12 betyr 12 % effektstørrelse.",
    ],
    correctOptionIdx: 0,
    interpExplanation:
      "Stor p ⇒ behold H₀. Mann-Whitney tester om en gruppe stochastisk dominerer — ikke om snittet er likt.",
  },
  {
    id: "s8",
    title: "Glødepære-levetid",
    scenario:
      "En produsent påstår at en pære holder i snitt 1 200 timer. Vi tester 50 pærer og får x̄ = 1 175, s = 90. Holder påstanden?",
    correctTest: "t1",
    testRationale:
      "Én gruppe, ukjent σ, n = 50 ⇒ one-sample t-test mot µ₀ = 1200.",
    pValue: 0.054,
    alpha: 0.05,
    options: [
      "p = 0.054 &gt; 0.05 — behold H₀; ikke nok bevis for at gjennomsnittet er &lt; 1200 timer.",
      "p ≈ 0.05 betyr at vi er omtrent 50/50.",
      "Vi forkaster H₀ — pærene er kortere enn 1200 timer.",
      "n = 50 er for stort — vi må bruke z-test.",
    ],
    correctOptionIdx: 0,
    interpExplanation:
      "p like over α ⇒ behold H₀ formelt, men dette er en typisk «grenseverdi» — diskuter effektstørrelse og strømstyrke heller enn binær beslutning.",
  },
];

const ALL_TESTS: TestKind[] = ["t1", "t2", "paired-t", "z-prop", "chi-sq", "mann-whitney", "anova"];

export function InferenceMatchQuiz() {
  const [idx, setIdx] = useState(0);
  const [testPick, setTestPick] = useState<TestKind | null>(null);
  const [optionPick, setOptionPick] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [revealed, setRevealed] = useState(false);

  const sc = SCENARIOS[idx];

  function reveal() {
    if (testPick === null || optionPick === null) return;
    const testOK = testPick === sc.correctTest;
    const optOK = optionPick === sc.correctOptionIdx;
    setScore((s) => ({
      correct: s.correct + (testOK ? 1 : 0) + (optOK ? 1 : 0),
      total: s.total + 2,
    }));
    setRevealed(true);
  }

  function next() {
    setRevealed(false);
    setTestPick(null);
    setOptionPick(null);
    setIdx((i) => (i + 1) % SCENARIOS.length);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Inferens-quiz — velg riktig test, tolk p-verdien
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">
          Scenario {idx + 1} / {SCENARIOS.length} · Score:{" "}
          <span className="font-semibold text-foreground">{score.correct}</span> /{" "}
          {score.total}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-3">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
          {sc.title}
        </div>
        <p className="text-sm">{sc.scenario}</p>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold">
          1. Hvilken statistisk test passer best?
        </div>
        <div className="grid sm:grid-cols-2 gap-1.5">
          {ALL_TESTS.map((k) => {
            const isPicked = testPick === k;
            const isCorrect = revealed && k === sc.correctTest;
            const isWrong = revealed && isPicked && k !== sc.correctTest;
            return (
              <button
                key={k}
                type="button"
                disabled={revealed}
                onClick={() => setTestPick(k)}
                className={`text-left px-2.5 py-1.5 rounded border text-xs transition ${
                  isCorrect
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                    : isWrong
                      ? "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300"
                      : isPicked
                        ? "bg-brand/15 border-brand"
                        : "border-border bg-card hover:bg-muted"
                }`}
              >
                <div className="font-medium">{TEST_LABELS[k]}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {TEST_HINTS[k]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold">
          2. Hva betyr p-verdien?{" "}
          <span className="font-mono text-muted-foreground">
            (p = {sc.pValue.toFixed(3)}, α = {sc.alpha.toFixed(2)})
          </span>
        </div>
        <div className="space-y-1.5">
          {sc.options.map((opt, i) => {
            const isPicked = optionPick === i;
            const isCorrect = revealed && i === sc.correctOptionIdx;
            const isWrong = revealed && isPicked && i !== sc.correctOptionIdx;
            return (
              <button
                key={i}
                type="button"
                disabled={revealed}
                onClick={() => setOptionPick(i)}
                className={`block w-full text-left px-2.5 py-1.5 rounded border text-xs transition ${
                  isCorrect
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                    : isWrong
                      ? "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300"
                      : isPicked
                        ? "bg-brand/15 border-brand"
                        : "border-border bg-card hover:bg-muted"
                }`}
                dangerouslySetInnerHTML={{ __html: opt }}
              />
            );
          })}
        </div>
      </div>

      {revealed ? (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs space-y-1.5">
          <div>
            <strong>Test:</strong> {TEST_LABELS[sc.correctTest]} — {sc.testRationale}
          </div>
          <div>
            <strong>Tolking:</strong> {sc.interpExplanation}
          </div>
          <button
            type="button"
            onClick={next}
            className="mt-2 px-3 py-1.5 rounded text-xs font-medium bg-brand text-white hover:bg-brand/90"
          >
            Neste scenario →
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={reveal}
          disabled={testPick === null || optionPick === null}
          className="px-3 py-1.5 rounded text-xs font-medium bg-brand text-white hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sjekk svar
        </button>
      )}
    </div>
  );
}
