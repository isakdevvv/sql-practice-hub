import { useState } from "react";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// AnovaScenarioQuiz
//
// 8 forhåndsdefinerte use-cases. For hver: velg riktig test (én av flere
// alternativer) og evt. post-hoc-strategi. Quizen sjekker svaret og gir
// kort forklaring som tar opp design-vurderingen.
// --------------------------------------------------------------------------

type TestType =
  | "one-way"
  | "two-way"
  | "welch"
  | "kruskal"
  | "repeated"
  | "mixed";

type PostHoc = "tukey" | "bonferroni" | "dunn" | "none";

const TEST_LABELS: Record<TestType, string> = {
  "one-way": "Én-faktors ANOVA",
  "two-way": "To-faktors ANOVA",
  welch: "Welch's ANOVA",
  kruskal: "Kruskal–Wallis",
  repeated: "Repeated-measures ANOVA",
  mixed: "Mixed-effects modell",
};
const POSTHOC_LABELS: Record<PostHoc, string> = {
  tukey: "Tukey HSD",
  bonferroni: "Bonferroni",
  dunn: "Dunn's test (post-Kruskal)",
  none: "Ingen post-hoc",
};

type Scenario = {
  id: string;
  title: string;
  desc: string;
  test: TestType;
  postHoc: PostHoc;
  why: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "drug-doses",
    title: "Medisinsk test: 3 doser",
    desc:
      "Du har 30 pasienter delt likt mellom 3 doser av et nytt blodtrykksmedikament. Du måler blodtrykk etter 4 uker. Variansen ser lik ut, residualene er omtrent normale.",
    test: "one-way",
    postHoc: "tukey",
    why:
      "Én faktor med 3 nivåer, balansert design, antagelser oppfylt. Tukey HSD er optimal for alle parvise sammenligninger.",
  },
  {
    id: "abc-ads",
    title: "A/B/C-test av reklame, ulik varians",
    desc:
      "Tre reklamevarianter testet på 200 brukere per variant. Konverteringstid har veldig ulik spredning per variant (Levene's test forkaster).",
    test: "welch",
    postHoc: "bonferroni",
    why:
      "Lik-varians-antagelsen er brutt. Welch's ANOVA gjelder. Med få sammenligninger og brutt antagelse er Bonferroni en trygg post-hoc.",
  },
  {
    id: "warehouse-temp",
    title: "Lager-temperatur × emballasje",
    desc:
      "Du tester holdbarheten på frukten med 3 lager-temperaturer og 2 typer emballasje, 10 frukter per kombinasjon. Du vil teste main effects OG om temperaturen påvirker emballasje-typene ulikt.",
    test: "two-way",
    postHoc: "tukey",
    why:
      "To faktorer + ønske om interaksjon ⇒ to-faktors ANOVA. Tukey HSD brukes til å bryte ned signifikante main effects på temperatur-nivåene.",
  },
  {
    id: "income-skewed",
    title: "Inntekt i 3 yrkesgrupper",
    desc:
      "Du sammenligner månedsinntekt i 3 yrkesgrupper. Inntektsfordelingen er sterkt høyreskjev (få tjener veldig mye). n = 40 per gruppe.",
    test: "kruskal",
    postHoc: "dunn",
    why:
      "Sterk skjevhet bryter normalitetsantagelsen. Kruskal–Wallis er en rank-basert ikke-parametrisk versjon av ettveis ANOVA. Dunn's test er standard parvis post-hoc.",
  },
  {
    id: "before-after",
    title: "Samme pasienter — før, etter 1 mnd, etter 3 mnd",
    desc:
      "Du måler smerte-skåre på samme 20 pasienter på 3 tidspunkter. Observasjonene er IKKE uavhengige på tvers av tidspunktene.",
    test: "repeated",
    postHoc: "bonferroni",
    why:
      "Gjentatte målinger på samme individ ⇒ uavhengighetsantagelsen brutt for ettveis ANOVA. Repeated-measures ANOVA (eller mixed-model) tar høyde for innen-subjekt-korrelasjon.",
  },
  {
    id: "schools",
    title: "Test-skåre i 10 skoler, 3 lærer-metoder",
    desc:
      "10 skoler, 3 undervisningsmetoder, ~30 elever per kombinasjon. Du vil teste metode-effekt, men forstå at elever innen samme skole er likere enn elever på tvers av skoler.",
    test: "mixed",
    postHoc: "tukey",
    why:
      "Klyngedesign med skole som tilfeldig effekt ⇒ mixed-effects modell. Random intercept per skole, fast effekt for metode. Tukey kan brukes på de faste effektene.",
  },
  {
    id: "exam-comp",
    title: "Eksamen-vurdering med 4 sensorer",
    desc:
      "4 sensorer vurderer 50 eksamener hver, ulike eksamener. Du vil bare se om gjennomsnitts-skår skiller seg på tvers av sensorene. Normalitet og lik varians ok.",
    test: "one-way",
    postHoc: "tukey",
    why:
      "Én faktor (sensor) med 4 nivåer, uavhengige eksamener, antagelser oppfylt. Standard ettveis ANOVA + Tukey HSD.",
  },
  {
    id: "soil-batches",
    title: "Jordprøver fra 5 felt, kun 2 prøver per felt",
    desc:
      "Du tar 2 jordprøver fra hvert av 5 felter (n = 2 per felt). Du vil sammenligne pH-nivå mellom feltene, men n er veldig lite og normalfordeling kan ikke verifiseres.",
    test: "kruskal",
    postHoc: "dunn",
    why:
      "Med n = 2 per gruppe kan du ikke teste normalitet — og ANOVA er sårbar for brudd ved så små utvalg. Kruskal–Wallis (rank-basert) er sikrere. Dunn's parvis.",
  },
];

export function AnovaScenarioQuiz() {
  const [idx, setIdx] = useState<number>(0);
  const [pickedTest, setPickedTest] = useState<TestType | null>(null);
  const [pickedPostHoc, setPickedPostHoc] = useState<PostHoc | null>(null);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [score, setScore] = useState<{ test: number; postHoc: number; total: number }>({
    test: 0,
    postHoc: 0,
    total: 0,
  });

  const scenario = SCENARIOS[idx];

  const testOptions: TestType[] = [
    "one-way",
    "two-way",
    "welch",
    "kruskal",
    "repeated",
    "mixed",
  ];
  const postHocOptions: PostHoc[] = ["tukey", "bonferroni", "dunn", "none"];

  function reveal() {
    if (!pickedTest || !pickedPostHoc) return;
    setRevealed(true);
    setScore((s) => ({
      test: s.test + (pickedTest === scenario.test ? 1 : 0),
      postHoc: s.postHoc + (pickedPostHoc === scenario.postHoc ? 1 : 0),
      total: s.total + 1,
    }));
  }

  function next() {
    setIdx((idx + 1) % SCENARIOS.length);
    setPickedTest(null);
    setPickedPostHoc(null);
    setRevealed(false);
  }

  function reset() {
    setIdx(0);
    setPickedTest(null);
    setPickedPostHoc(null);
    setRevealed(false);
    setScore({ test: 0, postHoc: 0, total: 0 });
  }

  const testCorrect = revealed && pickedTest === scenario.test;
  const postHocCorrect = revealed && pickedPostHoc === scenario.postHoc;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Scenario-quiz
          </div>
          <div className="text-sm font-semibold">
            Velg riktig test for 8 ulike use-cases
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {idx + 1}/{SCENARIOS.length}
          {score.total > 0 && (
            <>
              {" · "}
              Test {score.test}/{score.total}
              {" · "}
              Post-hoc {score.postHoc}/{score.total}
            </>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="rounded-lg border border-border bg-background p-4 space-y-2">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold">
            Scenario {idx + 1}
          </div>
          <div className="text-sm font-semibold">{scenario.title}</div>
          <p className="text-sm text-muted-foreground">{scenario.desc}</p>
        </div>

        {/* Test-valg */}
        <div className="space-y-1.5">
          <div className="text-xs font-semibold">Hvilken test passer?</div>
          <div className="grid sm:grid-cols-2 gap-1.5">
            {testOptions.map((t) => {
              const correct = revealed && t === scenario.test;
              const picked = pickedTest === t;
              const wrong = revealed && picked && t !== scenario.test;
              return (
                <button
                  key={t}
                  onClick={() => !revealed && setPickedTest(t)}
                  disabled={revealed}
                  className={`text-left px-3 py-2 rounded border text-xs transition-colors ${
                    correct
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                      : wrong
                      ? "border-red-500 bg-red-500/10 text-red-700"
                      : picked
                      ? "border-brand bg-brand/10"
                      : "border-border bg-background hover:border-brand/40"
                  }`}
                >
                  {correct && <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />}
                  {wrong && <XCircle className="h-3.5 w-3.5 inline mr-1" />}
                  {TEST_LABELS[t]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Post-hoc-valg */}
        <div className="space-y-1.5">
          <div className="text-xs font-semibold">Post-hoc / korreksjon?</div>
          <div className="grid sm:grid-cols-2 gap-1.5">
            {postHocOptions.map((p) => {
              const correct = revealed && p === scenario.postHoc;
              const picked = pickedPostHoc === p;
              const wrong = revealed && picked && p !== scenario.postHoc;
              return (
                <button
                  key={p}
                  onClick={() => !revealed && setPickedPostHoc(p)}
                  disabled={revealed}
                  className={`text-left px-3 py-2 rounded border text-xs transition-colors ${
                    correct
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                      : wrong
                      ? "border-red-500 bg-red-500/10 text-red-700"
                      : picked
                      ? "border-brand bg-brand/10"
                      : "border-border bg-background hover:border-brand/40"
                  }`}
                >
                  {correct && <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />}
                  {wrong && <XCircle className="h-3.5 w-3.5 inline mr-1" />}
                  {POSTHOC_LABELS[p]}
                </button>
              );
            })}
          </div>
        </div>

        {revealed && (
          <div className="rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs space-y-1">
            <div className="font-semibold flex items-center gap-2">
              Forklaring
              {testCorrect && postHocCorrect && (
                <span className="text-emerald-600">— Korrekt på begge!</span>
              )}
            </div>
            <p>{scenario.why}</p>
            <p>
              Riktig svar:{" "}
              <strong>{TEST_LABELS[scenario.test]}</strong> +{" "}
              <strong>{POSTHOC_LABELS[scenario.postHoc]}</strong>
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Start på nytt
          </button>
          {!revealed ? (
            <button
              onClick={reveal}
              disabled={!pickedTest || !pickedPostHoc}
              className="inline-flex items-center gap-1 rounded-md border border-brand bg-brand text-brand-foreground px-3 py-1.5 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Sjekk svar
            </button>
          ) : (
            <button
              onClick={next}
              className="inline-flex items-center gap-1 rounded-md border border-brand bg-brand text-brand-foreground px-3 py-1.5 text-xs font-medium"
            >
              Neste <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
