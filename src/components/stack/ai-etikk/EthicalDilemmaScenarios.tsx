import { useState } from "react";

// =======================================================================
// EthicalDilemmaScenarios.tsx
// -----------------------------------------------------------------------
// 6 forhåndsdefinerte case-studies fra virkeligheten. For hver:
//   - kort case
//   - hvilken type bias / problem
//   - hva som gikk galt
//   - hva som kunne forhindret det
//   - "Hva ville du gjort?"-prompt med 3-4 valgmuligheter
//     (markert "best", "delvis", "feil") + diskusjon
// =======================================================================

type Choice = {
  id: string;
  text: string;
  verdict: "best" | "delvis" | "feil";
  comment: string;
};
type Case = {
  id: string;
  title: string;
  context: string;
  year: string;
  biasType: string;
  whatWentWrong: string;
  whatCouldPrevent: string;
  prompt: string;
  choices: Choice[];
};

const CASES: Case[] = [
  {
    id: "compas",
    title: "COMPAS recidivism",
    year: "USA, 2016",
    context:
      "Northpointes COMPAS-modell gir dommere en risikoscore for tilbakefall hos tiltalte. Brukes i over 30 amerikanske delstater.",
    biasType: "Proxy-bias / historisk bias",
    whatWentWrong:
      "ProPublica viste at svarte tiltalte fikk 'høyrisiko' dobbelt så ofte som hvite ved falske positive. Modellen brukte ikke rase direkte, men proxy-variabler (postnummer, antall venner med kriminell historikk, antall arrestasjoner) korrelerte sterkt med rase pga. historisk over-policing.",
    whatCouldPrevent:
      "Audit av prediksjons-disparitet per demografisk gruppe FØR utrulling. Eksplisitt valg av fairness-definisjon. Transparent dokumentasjon av features. Mulighet for tiltalte å klage på score.",
    prompt:
      "Du er ML-ingeniør i firmaet. Audit viser at FPR for svarte er 45%, for hvite 23%. Hvordan responderer du?",
    choices: [
      {
        id: "a",
        text: "Ignorerer det — modellen er kalibrert, og kalibrering er den 'riktige' fairness-definisjonen.",
        verdict: "feil",
        comment:
          "Kalibrering er ÉN av flere fairness-definisjoner, og når base-rater er ulike kan du ikke ha alle samtidig (impossibility theorem). Å bare velge én og ignorere konsekvensene for utsatte grupper er etisk uforsvarlig.",
      },
      {
        id: "b",
        text: "Fjerner rase-proxy-features (postnummer osv.) — så er modellen 'race-blind'.",
        verdict: "delvis",
        comment:
          "Hjelper litt, men 'fairness through unawareness' fjerner ikke skjevhet hvis andre variabler korrelerer med rase. Du må også audite output, ikke bare input.",
      },
      {
        id: "c",
        text: "Eskalerer til ledelse + foreslår å enten justere terskel per gruppe eller pause utrulling til equalized odds er nådd. Krever transparent kommunikasjon til dommerne om begrensningene.",
        verdict: "best",
        comment:
          "Tar problemet på alvor, peker på det reelle tradeoff (kan ikke ha alt), inkluderer ledelsen i et verdivalg, og krever transparens overfor de som bruker scoren.",
      },
      {
        id: "d",
        text: "Slutter i jobben i protest.",
        verdict: "delvis",
        comment:
          "Etisk legitimt, men løser ikke problemet. Bedre å prøve å fikse internt først, og varsle eksternt hvis ledelsen ikke responderer (whistleblower-prinsipp).",
      },
    ],
  },
  {
    id: "amazon",
    title: "Amazon hiring algorithm",
    year: "Internt, 2014–2018",
    context:
      "Amazon trente en CV-screening-modell på 10 år med ansettelsesdata for å hjelpe med å sortere søknader til tekniske stillinger.",
    biasType: "Historisk bias / label bias",
    whatWentWrong:
      "Modellen lærte at mannlige søkere ble foretrukket — fordi treningsdataene var historisk skjev. Den begynte å straffe CV-er som inneholdt ordet 'kvinne' (f.eks. 'women's chess club captain') og nedgraderte søkere fra kvinnedominerte colleges.",
    whatCouldPrevent:
      "Forstå at 'kvalifisert' i historiske data faktisk betyr 'ble valgt av historiske ansettere'. Audit utfall per kjønn. Bruke ekspert-konstruerte features i stedet for fri-tekst-CV. Aldri rulle ut uten reverse-engineering av hvilke features som vektes.",
    prompt:
      "Du oppdager bias mot ord knyttet til kvinner. Hva er det MEST effektive første steget?",
    choices: [
      {
        id: "a",
        text: "Fjerner kjønnsindikerende ord fra input-CV-en.",
        verdict: "delvis",
        comment:
          "Naivt — modellen finner nye proxyer (skole, sport, hobbyer). Symptom-behandling, ikke rot-årsak.",
      },
      {
        id: "b",
        text: "Stopper utrulling og audit-er treningsdataene: er 'positive' eksempler skjevt fordelt? Erkjenner at 'ground truth' her er historisk diskriminering.",
        verdict: "best",
        comment:
          "Eneste forsvarlige svar. Hvis labelen i seg selv reflekterer bias, kan ingen modell være rettferdig. Amazon skrotet til slutt prosjektet.",
      },
      {
        id: "c",
        text: "Tilfører kunstige kvinnelige 'positive' eksempler (data augmentation).",
        verdict: "delvis",
        comment:
          "Reweighting kan hjelpe, men du må fortsatt validere at output blir bedre — og det løser ikke at definisjonen av 'god kandidat' er historisk skjev.",
      },
    ],
  },
  {
    id: "healthcare",
    title: "Healthcare cost-prediksjon (Obermeyer et al. 2019)",
    year: "USA, 2019",
    context:
      "En kommersiell modell brukt på over 200 millioner pasienter i USA prioriterte pasienter for ekstra omsorg basert på predikert helsekostnad.",
    biasType: "Label-proxy-bias",
    whatWentWrong:
      "Svarte pasienter med samme sykdomsbyrde som hvite fikk LAVERE risikoscore. Årsak: modellen brukte 'fremtidige helsekostnader' som proxy for 'helsebehov'. Men svarte pasienter har historisk hatt mindre tilgang til helsetjenester og dermed lavere kostnader, gitt samme sykdomsbyrde. Modellen lærte ulikheten i tilgang som en 'sannhet' om mindre behov.",
    whatCouldPrevent:
      "Velge en label som faktisk speiler behovet (antall kroniske sykdommer, biomarkører) i stedet for kostnad. Audit utfall per rase. Forstå at PROXY for label kan være bias-bærer like mye som proxy for features.",
    prompt:
      "Ditt sykehus skal bygge en lignende risikoscore. Hvordan velger du LABEL?",
    choices: [
      {
        id: "a",
        text: "Bruker 'fremtidige helsekostnader' — det er enkelt å måle og finnes i dataene.",
        verdict: "feil",
        comment:
          "Akkurat den samme feilen som Obermeyer-studien dokumenterte. Kostnad ≠ behov når tilgang er skjev.",
      },
      {
        id: "b",
        text: "Bruker kliniske mål (HbA1c, blodtrykk, antall kroniske diagnoser) — direkte mål på helse, ikke på kostnader.",
        verdict: "best",
        comment:
          "Korrekt: label må samsvare med det du faktisk vil predikere ('helsebehov'), ikke en proxy som kan kode strukturell ulikhet.",
      },
      {
        id: "c",
        text: "Bruker kostnader, men 'normaliserer' per rase.",
        verdict: "delvis",
        comment:
          "Reduserer symptom, men du betinger fortsatt på en feil label. Bedre å fikse labelen.",
      },
    ],
  },
  {
    id: "facerec",
    title: "Face recognition accuracy gap",
    year: "Buolamwini & Gebru (Gender Shades), 2018",
    context:
      "MIT-forskerne testet kommersielle face-recognition-systemer fra IBM, Microsoft og Face++ på fordeling av kjønn × hudfarge.",
    biasType: "Sampling bias / underrepresentasjon",
    whatWentWrong:
      "Feilraten for mørkhudede kvinner var opptil 34%, for lyshudede menn under 1%. Treningsdataene var dominert av lyshudede menn (>75%). Systemene ble likevel solgt til lovverket og rekruttering uten audit.",
    whatCouldPrevent:
      "Diversifisert treningsdata. Disaggregert evaluering på tvers av demografi. Eksterne audits FØR utrulling i høyrisiko-domener (politi, grensekontroll).",
    prompt:
      "Du leverer face-recognition til et politidistrikt. Hva er ditt absolutte minimumskrav før utrulling?",
    choices: [
      {
        id: "a",
        text: "Disaggregert evaluering per (kjønn × hudfarge × alder) + publisert i model card + politikere informeres om begrensninger.",
        verdict: "best",
        comment:
          "Dette er nå EU AI Acts krav for high-risk systems. Model cards (Mitchell et al. 2019) er industristandard.",
      },
      {
        id: "b",
        text: "Total nøyaktighet > 95%.",
        verdict: "feil",
        comment:
          "Klassisk feil — aggregert nøyaktighet kan skjule katastrofale feilrater på minoritetsgrupper.",
      },
      {
        id: "c",
        text: "Mer treningsdata, samme arkitektur.",
        verdict: "delvis",
        comment:
          "Hjelper litt, men uten disaggregert evaluering vet du ikke om mer data faktisk lukker gapet.",
      },
    ],
  },
  {
    id: "credit",
    title: "Credit scoring & income proxy",
    year: "USA / EU, løpende",
    context:
      "En kredittmodell tar inntekt, betalingshistorikk, postnummer og 'shopping-mønster' som features. Den bruker ikke rase eller etnisitet direkte.",
    biasType: "Proxy-bias / redlining",
    whatWentWrong:
      "Postnummer korrelerer sterkt med rase i USA pga. historisk segregering. Modellen lærer en 'rase-effekt' via postnummer uten å være eksplisitt rasistisk. Dette er moderne 'redlining'.",
    whatCouldPrevent:
      "Fairness-audit på utfall per beskyttet attributt (selv om attributten ikke er en feature). Forklarbarhet på enkelt-vedtak. Etterprøving av disparate impact (4/5 rule).",
    prompt:
      "Modellen din avslår 18% av søknader fra én etnisk minoritet, mot 9% i majoriteten. Hvordan handler du?",
    choices: [
      {
        id: "a",
        text: "Ignorerer — modellen 'ser' ikke etnisitet, så det er ikke diskriminering.",
        verdict: "feil",
        comment:
          "Disparate impact er ulovlig i USA selv uten intensjon (Title VII, 4/5-regel). Også uetisk uavhengig av lov.",
      },
      {
        id: "b",
        text: "Audit-er hvilke features som driver avslagene, fjerner åpenbare proxy-er (postnummer på under-bydel), retesterer.",
        verdict: "delvis",
        comment:
          "Riktig retning. Husk: nye proxyer kan dukke opp. Audit må være kontinuerlig.",
      },
      {
        id: "c",
        text: "Kombinerer feature-audit + adversarial debiasing + manuell second-look for borderline-saker i minoritetsgrupper.",
        verdict: "best",
        comment:
          "Defense-in-depth: teknisk fix + organisatorisk safety net. Også enklere å dokumentere overfor regulator.",
      },
    ],
  },
  {
    id: "policing",
    title: "Predictive policing — feedback loops",
    year: "PredPol, USA, 2010-tallet",
    context:
      "Politiet bruker en modell som predikerer hvor neste forbrytelse mest sannsynlig skjer. Patruljer sendes til disse områdene.",
    biasType: "Feedback loop / runaway feedback",
    whatWentWrong:
      "Områder med flere patruljer rapporterer flere lovbrudd (selv om kriminalitet er lik). Disse rapportene blir nytt treningsdata, som igjen sender flere patruljer til samme område. Ensign et al. (2018) viste matematisk at slike feedback loops divergerer mot at modellen 'mener' all kriminalitet skjer i ett område.",
    whatCouldPrevent:
      "Bruke kriminalitets-data fra anonyme rapporter / sykehus i stedet for politirapporter (siste er konfundert med politiets egen plassering). Eksplisitt diskontering av feedback-effekter i modellen. Periodisk reset av treningsdata.",
    prompt:
      "Hva er det MEST utbedrende grepet?",
    choices: [
      {
        id: "a",
        text: "Bruke en label som ikke avhenger av politiets egen plassering (anonyme rapporter, sykehus-data for vold).",
        verdict: "best",
        comment:
          "Bryter feedback-loopen ved å fjerne den direkte koblingen mellom modellutfall og treningsdata.",
      },
      {
        id: "b",
        text: "Legge til mer features (sosioøkonomi, vær).",
        verdict: "feil",
        comment:
          "Endrer ikke at labelen er konfundert. Mer features kan tvert imot skjule biasen bedre.",
      },
      {
        id: "c",
        text: "Stoppe utrulling helt — predictive policing er etisk uholdbart.",
        verdict: "delvis",
        comment:
          "Et legitimt verdivalg som flere byer har tatt (Santa Cruz, Oakland). Bedre enn å fortsette uten å fikse rot-årsaken.",
      },
    ],
  },
];

export function EthicalDilemmaScenarios() {
  const [activeId, setActiveId] = useState(CASES[0].id);
  const [picked, setPicked] = useState<Record<string, string>>({});

  const active = CASES.find((c) => c.id === activeId)!;
  const pickedHere = picked[active.id];
  const choice = active.choices.find((c) => c.id === pickedHere);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap gap-1.5 mb-4">
        {CASES.map((c) => (
          <button
            type="button"
            key={c.id}
            onClick={() => setActiveId(c.id)}
            className={`text-xs rounded-md px-3 py-1.5 border ${
              activeId === c.id
                ? "border-brand bg-brand/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-background p-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
          {active.year} · {active.biasType}
        </div>
        <h3 className="text-lg font-semibold mb-2">{active.title}</h3>
        <p className="text-sm text-foreground/90 mb-3">{active.context}</p>

        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div className="rounded border border-destructive/30 bg-destructive/5 p-3">
            <div className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-1">
              Hva gikk galt
            </div>
            <p className="text-xs text-foreground/90">{active.whatWentWrong}</p>
          </div>
          <div className="rounded border border-success/30 bg-success/5 p-3">
            <div className="text-[10px] uppercase tracking-wider text-success font-semibold mb-1">
              Hva kunne forhindret det
            </div>
            <p className="text-xs text-foreground/90">{active.whatCouldPrevent}</p>
          </div>
        </div>

        <div className="rounded border border-brand/30 bg-brand/5 p-3">
          <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-1">
            Hva ville du gjort?
          </div>
          <p className="text-sm font-medium mb-3">{active.prompt}</p>
          <div className="space-y-2">
            {active.choices.map((ch) => {
              const isPicked = pickedHere === ch.id;
              const verdictBg =
                isPicked && ch.verdict === "best"
                  ? "border-success bg-success/10"
                  : isPicked && ch.verdict === "delvis"
                    ? "border-amber-500 bg-amber-500/10"
                    : isPicked
                      ? "border-destructive bg-destructive/10"
                      : "border-border bg-card hover:border-brand/40";
              return (
                <button
                  type="button"
                  key={ch.id}
                  onClick={() =>
                    setPicked((p) => ({ ...p, [active.id]: ch.id }))
                  }
                  className={`w-full text-left text-xs rounded-md border px-3 py-2 ${verdictBg}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-muted-foreground shrink-0">
                      {ch.id.toUpperCase()}.
                    </span>
                    <span className="text-foreground">{ch.text}</span>
                  </div>
                  {isPicked && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <div
                        className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${
                          ch.verdict === "best"
                            ? "text-success"
                            : ch.verdict === "delvis"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-destructive"
                        }`}
                      >
                        {ch.verdict === "best"
                          ? "Beste valg"
                          : ch.verdict === "delvis"
                            ? "Delvis riktig"
                            : "Feil tilnærming"}
                      </div>
                      <p className="text-foreground/90 leading-snug">
                        {ch.comment}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {choice && choice.verdict !== "best" && (
            <p className="mt-2 text-[10px] text-muted-foreground italic">
              Prøv et annet alternativ for å se forskjellen.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
