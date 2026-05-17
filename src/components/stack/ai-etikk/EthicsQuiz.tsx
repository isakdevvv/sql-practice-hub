import { useMemo, useState } from "react";

// =======================================================================
// EthicsQuiz.tsx
// -----------------------------------------------------------------------
// 10 etiske dilemmaer som dekker dual use, malicious use, transparency,
// accountability, fairness, privacy, safety. Hver oppgave har et "beste"
// svar med begrunnelse + svake alternativer med forklaring på hvorfor
// de er svake.
// =======================================================================

type Q = {
  id: string;
  category:
    | "dual use"
    | "malicious use"
    | "transparency"
    | "accountability"
    | "fairness"
    | "privacy"
    | "safety";
  question: string;
  options: { id: string; text: string; correct?: boolean; comment: string }[];
};

const QUESTIONS: Q[] = [
  {
    id: "q1",
    category: "dual use",
    question:
      "Du har bygget en deep-fake-detektor for journalist-verifikasjon. Et myndighet ber om kildekoden.",
    options: [
      {
        id: "a",
        text: "Gir bort koden — åpen vitenskap er alltid riktig.",
        comment:
          "Åpen vitenskap er en god verdi, men dual-use-vurdering er nødvendig. Detektoren kan brukes til å forbedre deep-fakes ved adversarial trening.",
      },
      {
        id: "b",
        text: "Nekter — koden er kommersiell.",
        comment:
          "Kommersielt argument er separat fra etisk vurdering. Spørsmålet er ikke om du EIER, men om utlevering er forsvarlig.",
      },
      {
        id: "c",
        text: "Vurderer hvem som spør, hva de vil bruke det til, om det allerede er offentlig kjent, og krever forpliktelser om bruksområde.",
        correct: true,
        comment:
          "Dual-use-vurdering må alltid inkludere mottaker + bruksområde + alternativer. Dette er industri-standard for sensitive verktøy.",
      },
    ],
  },
  {
    id: "q2",
    category: "malicious use",
    question:
      "En kunde vil bruke ditt face-recognition API til å identifisere demonstranter fra droneopptak.",
    options: [
      {
        id: "a",
        text: "Aksepterer — kunden betaler, og verktøyet er nøytralt.",
        comment:
          "'Verktøy er nøytrale' er en utbredt myte. Et verktøy med bestemte affordanser har innebygde bruksmønstre. Dual-use-leverandør har medansvar.",
      },
      {
        id: "b",
        text: "Avslår + skriver eksplisitt forbud i bruksvilkårene (TOS) mot demonstrant-overvåking. Inkluderer audit-rett.",
        correct: true,
        comment:
          "Aktiv ansvarsutøvelse: kontraktfeste, audit-rett, og hele tiden mulighet til å trekke tilbake API-tilgang. Mange tech-selskaper har gjort dette etter 2020.",
      },
      {
        id: "c",
        text: "Ber kunden lage et NDA og slutter å spørre om bruksområde.",
        comment:
          "NDA fjerner ditt innsyn, ikke ditt ansvar. Hvis du leverer verktøyet, har du fortsatt medvirkningsansvar.",
      },
    ],
  },
  {
    id: "q3",
    category: "transparency",
    question:
      "Modellen din predikerer hvem som får helse-prioritering. Hvilken transparens skylder du brukerne?",
    options: [
      {
        id: "a",
        text: "Ingen — modellens detaljer er forretningshemmelighet.",
        comment:
          "Brudd på 'right to explanation' (GDPR art. 22) for automatiserte vedtak med 'rettslig eller liknende vesentlig effekt'. Helseprioritering kvalifiserer.",
      },
      {
        id: "b",
        text: "En kort 'modellen tar mange faktorer i betraktning'-setning.",
        comment:
          "Tilfredsstiller bokstaven i loven, ikke ånden. Bruker kan ikke kontestere et vedtak de ikke forstår.",
      },
      {
        id: "c",
        text: "Model card med datakilder, vurderte features, ytelse per demografisk gruppe, kjente begrensninger, og en menneskelig kontaktperson for klager.",
        correct: true,
        comment:
          "Model cards (Mitchell et al. 2019) er nå industri-standard for høy-stakes AI. Inkluderer det brukeren faktisk trenger for å forstå og kontestere.",
      },
    ],
  },
  {
    id: "q4",
    category: "accountability",
    question:
      "Modellen feiler og en pasient skades. Hvem er ansvarlig?",
    options: [
      {
        id: "a",
        text: "Modellen — algoritmen tok beslutningen.",
        comment:
          "Algoritmer har ikke rettslig handleevne. EU AI Act og produktansvar-direktivet plasserer ansvaret hos leverandør + bruker, ikke modellen.",
      },
      {
        id: "b",
        text: "Leverandøren av modellen, sykehuset som rullet den ut, og legen som handlet på den — alle har medansvar i en kjede.",
        correct: true,
        comment:
          "'Distributed responsibility'. EU AI Act og forsker-litteratur (Bryson, Floridi) understreker at AI ikke fjerner ansvar, men distribuerer det. Ingen kan gjemme seg bak 'det var modellen'.",
      },
      {
        id: "c",
        text: "Ingen — det er en kjent risiko ved automatisering.",
        comment:
          "Aksept av strukturell uansvarlighet er etisk uforsvarlig. Hvis ingen er ansvarlig, mister vi rettssikkerhet.",
      },
    ],
  },
  {
    id: "q5",
    category: "fairness",
    question:
      "Du må velge én fairness-definisjon for en lånemodell. Base-ratene er ulike mellom grupper.",
    options: [
      {
        id: "a",
        text: "Velger 'kalibrering' — det er den teknisk reneste definisjonen.",
        comment:
          "Når base-rater er ulike, gir kalibrering ofte FORSKJELLIGE feilrater per gruppe (jfr. impossibility theorem). Du må vite hvilken virkning du aksepterer.",
      },
      {
        id: "b",
        text: "Velger 'equal opportunity' — like sjanser for kvalifiserte i begge grupper.",
        comment:
          "Et legitimt valg, men ikke nødvendigvis 'det rette'. Vil ofte gi ulik PPV — kan ha rettsmessige konsekvenser.",
      },
      {
        id: "c",
        text: "Dokumenterer at impossibility theorem gjelder, presenterer tradeoff til ledelsen + berørte grupper, og lar valget være eksplisitt og dokumentert.",
        correct: true,
        comment:
          "Fairness-valg er et VERDIVALG, ikke et teknisk valg. Det riktige er å gjøre tradeoff-en synlig og involvere de berørte, ikke å skjule den i kodevalg.",
      },
    ],
  },
  {
    id: "q6",
    category: "privacy",
    question:
      "Du vil trene en helse-modell på pasientdata. Pasientene har samtykket til 'forskning'.",
    options: [
      {
        id: "a",
        text: "Bruker dataene — forskning omfatter ML-trening.",
        comment:
          "GDPR krever at samtykke er INFORMERT og SPESIFIKT. Generisk 'forskning'-samtykke dekker ikke nødvendigvis ML-trening, særlig hvis modellen senere kommersialiseres.",
      },
      {
        id: "b",
        text: "Anonymiserer dataene først (fjerner navn, alder, kjønn).",
        comment:
          "Pseudonymisering er ikke anonymisering. Re-identifikasjon fra 'anonyme' helse-datasett er dokumentert mange ganger (Netflix Prize, Latanya Sweeney). Trengs differential privacy + audit.",
      },
      {
        id: "c",
        text: "Innhenter nytt eksplisitt samtykke for ML-bruk, eller bruker en differential-privacy-pipeline med dokumentert ε-budsjett.",
        correct: true,
        comment:
          "Enten ny samtykke (informert om akkurat ML-bruk), eller teknisk garanti (DP) som gjør re-identifikasjon umulig.",
      },
    ],
  },
  {
    id: "q7",
    category: "safety",
    question:
      "Selvkjøretøyets ML-modul har 99.7% nøyaktighet på fotgjenger-deteksjon. Klar for utrulling?",
    options: [
      {
        id: "a",
        text: "Ja — 99.7% er bedre enn menneskelig snitt.",
        comment:
          "Aggregert nøyaktighet kan skjule katastrofale failure modes. En Tesla-ulykke i 2016 skjedde fordi modellen ikke gjenkjente en hvit trailer mot lys himmel.",
      },
      {
        id: "b",
        text: "Tester med scenario-coverage (lyssforhold, vær, klesfarge, kroppspositur, alder, hudfarge) FØR utrulling. Krever 99.7% per kategori, ikke aggregert.",
        correct: true,
        comment:
          "Safety-critical ML krever disaggregert evaluering + worst-case-garantier, ikke gjennomsnitt. Dette er nå krav i ISO 21448 (SOTIF).",
      },
      {
        id: "c",
        text: "Ruller ut i begrenset område og overvåker.",
        comment:
          "Bedre enn 'a', men du må fortsatt teste FØR utrulling i offentlig rom. Inkrementell utrulling er supplement, ikke erstatning for safety case.",
      },
    ],
  },
  {
    id: "q8",
    category: "malicious use",
    question:
      "Du oppdager at modellen din kan bli brukt til å generere overbevisende phishing-tekster. Hva gjør du?",
    options: [
      {
        id: "a",
        text: "Publiserer modellen — informasjon vil ut uansett.",
        comment:
          "Klassisk 'inevitability'-argument. Empirisk falsk — utgivelses-måten påvirker hvem som får tilgang og hvor raskt skade skjer.",
      },
      {
        id: "b",
        text: "Holder den hemmelig — sikkerhet gjennom obskuritet.",
        comment:
          "Obskuritet alene er skjørt. Andre vil bygge tilsvarende. Du bør heller publisere ANSVARLIG med safeguards.",
      },
      {
        id: "c",
        text: "Staged release: red-team-test, dokumenterer misbruks-potensial, slipper med rate-limiting og misbruks-monitoring + samarbeider med phishing-forsvar-tjenester.",
        correct: true,
        comment:
          "Modellen fra OpenAIs GPT-2-release (2019) etablerte denne praksisen. Anerkjenner at åpen-vitenskap og misbruks-forebygging må balanseres aktivt.",
      },
    ],
  },
  {
    id: "q9",
    category: "transparency",
    question:
      "Skal du bruke en black-box-modell (XGBoost) eller en tolkbar modell (logistisk regresjon) for kredittvedtak?",
    options: [
      {
        id: "a",
        text: "XGBoost — bedre prediksjonsnøyaktighet.",
        comment:
          "Ofte feil ved høy-stakes vedtak. Rudin (2019) argumenterer overbevisende for at tolkbare modeller ofte er like gode — og at 'forklarings'-lag på black-box er upålitelige.",
      },
      {
        id: "b",
        text: "Logistisk regresjon — kan forklares til kunden og kontesteres.",
        correct: true,
        comment:
          "For vedtak som rammer enkeltpersoner med juridiske eller liknende konsekvenser (GDPR art. 22), bør tolkbare modeller foretrekkes. Forklaring må være actionable.",
      },
      {
        id: "c",
        text: "XGBoost + SHAP-lag som 'forklaring'.",
        comment:
          "Vanlig løsning, men SHAP-attribusjoner kan være ustabile og er ikke faktiske kausale forklaringer. Bedre å starte med tolkbar modell.",
      },
    ],
  },
  {
    id: "q10",
    category: "accountability",
    question:
      "EU AI Act klassifiserer din ansiktsgjenkjenning som 'high-risk'. Hva er minimumskravene?",
    options: [
      {
        id: "a",
        text: "Bare overholde GDPR.",
        comment:
          "AI Act har egne krav PÅ TOPPEN av GDPR: risk management system, data governance, technical documentation, transparency, human oversight, accuracy/robustness, conformity assessment.",
      },
      {
        id: "b",
        text: "CE-merking + risk management + data governance + technical documentation + human oversight + transparency + accuracy/robustness-tester + post-market monitoring.",
        correct: true,
        comment:
          "Korrekt liste over kravene i AI Act art. 9–15 for high-risk-systemer (fra 2025/2026). Krever også registrering i EU-database.",
      },
      {
        id: "c",
        text: "Konsulent-rapport om etikk.",
        comment:
          "Etikk-vasking ('ethics washing') uten konkret compliance. Vil ikke holde mål for tilsynsmyndigheter.",
      },
    ],
  },
];

export function EthicsQuiz() {
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [revealAll, setRevealAll] = useState(false);

  const score = useMemo(() => {
    let n = 0;
    for (const q of QUESTIONS) {
      const p = picked[q.id];
      const correct = q.options.find((o) => o.correct);
      if (p && correct && p === correct.id) n++;
    }
    return n;
  }, [picked]);

  function reset() {
    setPicked({});
    setRevealAll(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="text-xs text-muted-foreground">
          {Object.keys(picked).length} / {QUESTIONS.length} besvart · Score:{" "}
          <span className="font-mono text-foreground">{score}</span> riktige
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRevealAll((v) => !v)}
            className="text-xs rounded-md px-3 py-1.5 border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            {revealAll ? "Skjul" : "Vis"} alle svar
          </button>
          <button
            type="button"
            onClick={reset}
            className="text-xs rounded-md px-3 py-1.5 border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            Nullstill
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {QUESTIONS.map((q, idx) => {
          const pickedHere = picked[q.id];
          return (
            <div
              key={q.id}
              className="rounded-lg border border-border bg-background p-3"
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Spm {idx + 1}
                </span>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand/10 text-brand border border-brand/30">
                  {q.category}
                </span>
              </div>
              <p className="text-sm font-medium mb-3">{q.question}</p>
              <div className="space-y-1.5">
                {q.options.map((o) => {
                  const isPicked = pickedHere === o.id;
                  const showAnswer = isPicked || revealAll;
                  return (
                    <button
                      type="button"
                      key={o.id}
                      onClick={() =>
                        setPicked((p) => ({ ...p, [q.id]: o.id }))
                      }
                      className={`w-full text-left text-xs rounded-md border px-3 py-2 ${
                        showAnswer && o.correct
                          ? "border-success bg-success/10"
                          : showAnswer && isPicked && !o.correct
                            ? "border-destructive bg-destructive/10"
                            : isPicked
                              ? "border-brand bg-brand/10"
                              : "border-border bg-card hover:border-brand/40"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-muted-foreground shrink-0">
                          {o.id.toUpperCase()}.
                        </span>
                        <span className="text-foreground">{o.text}</span>
                        {showAnswer && o.correct && (
                          <span className="ml-auto text-success font-semibold shrink-0">
                            ✓
                          </span>
                        )}
                      </div>
                      {showAnswer && (
                        <p
                          className={`mt-2 pt-2 border-t border-border/50 leading-snug ${
                            o.correct
                              ? "text-success"
                              : "text-muted-foreground"
                          }`}
                        >
                          {o.comment}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
