// Fase-inndelingen for DTE-2602 Introduksjon maskinlæring og AI.
//
// Én kilde til sannhet for modul-visningen: hvilke faser faget består av,
// hvilke atomer (A01–A53 fra plan-dte-2602.md) hver fase dekker, og hvilke
// eksisterende leksjoner/labber i denne appen som faktisk dekker dem.
//
// Regelen for `trinn`: kun slugs som finnes i `src/lib/stack/content/index.ts`.
// Modul-visningen bruker dem til framdriftsberegning via `useModulProgress`,
// så en slug som ikke finnes gir en lenke som ikke virker.

export type FaseStatus =
  /** Alt stoffet finnes, og oppgave-arkitekturen (de fem typene) er bygget. */
  | "komplett"
  /** Stoffet finnes, men oppgavene mangler ennå. */
  | "stoff-finnes"
  /** Bygges av en annen sesjon akkurat nå. */
  | "under-arbeid";

export type FaseTrinn = {
  slug: string;
  tittel: string;
  /** Én linje: hva dette trinnet gir deg som de andre ikke gir. */
  hva: string;
  /** "leksjon" = les/forstå, "lab" = interaktiv visualisering, "modul" = fase-modul med oppgaver. */
  art: "modul" | "leksjon" | "lab";
};

export type FaseAtom = {
  /** A01 … A53, samme nummerering som plan-dte-2602.md. */
  id: string;
  navn: string;
  /** Hvilket trinn (slug) som dekker atomet. `null` = ikke dekket ennå. */
  dekkesAv: string | null;
  /** J = egnet som mappe-materiale (mappeinnlevering 11.12.2026). */
  mappe: boolean;
};

export type Fase = {
  nummer: number;
  id: string;
  tittel: string;
  /** Hva fasen handler om — 2–3 setninger, skrevet til studenten. */
  handlerOm: string;
  /** Spørsmålet fasen svarer på. Neste fase forutsetter dette svaret. */
  sporsmal: string;
  status: FaseStatus;
  /** Fasen studenten bør ha gjort først. */
  byggerPa: number[];
  atomer: FaseAtom[];
  trinn: FaseTrinn[];
  /** Antall oppgaver bygget per type (§3 i PLAN-HOST26-MODULER.md). */
  oppgaver?: {
    anslag: number;
    simulering: number;
    maal: number;
    feilsoking: number;
    recall: number;
  };
  /** Vises når en annen sesjon eier innholdet. */
  merknad?: string;
};

export const FASER: readonly Fase[] = [
  {
    nummer: 1,
    id: "fase-1",
    tittel: "Hva er maskinlæring?",
    handlerOm:
      "Skillet mellom å skrive reglene selv og å la en algoritme finne dem i eksempler. Her låser du de tre grunnvalgene ethvert prosjekt starter med: har du fasit eller ikke, er svaret et tall eller en kategori, og hva er det egentlig du prøver å forutsi.",
    sporsmal: "Er dette i det hele tatt et maskinlærings-problem — og hva slags?",
    status: "komplett",
    byggerPa: [],
    atomer: [
      { id: "A01", navn: "Hva maskinlæring er", dekkesAv: "ml-grunnlag", mappe: false },
      {
        id: "A02",
        navn: "Supervised, unsupervised og reinforcement learning",
        dekkesAv: "ml-grunnlag",
        mappe: false,
      },
      {
        id: "A03",
        navn: "Regresjon mot klassifikasjon",
        dekkesAv: "supervised-learning",
        mappe: false,
      },
    ],
    trinn: [
      {
        slug: "dte2602-modul1",
        tittel: "Modul 1 — oppgaver til Fase 1",
        hva: "Anslå-så-sjekk, problemoppsett med tilstandssjekk, fire feilsøkings-caser og de få kortene som må sitte.",
        art: "modul",
      },
      {
        slug: "ml-grunnlag",
        tittel: "ML-grunnlag",
        hva: "Regelbasert mot lært, de tre læringstypene, ordforrådet resten av faget bruker.",
        art: "leksjon",
      },
      {
        slug: "supervised-learning",
        tittel: "Supervised learning — oversikt",
        hva: "Når output er et tall og når det er en kategori, og hvorfor valget styrer alt etterpå.",
        art: "leksjon",
      },
    ],
    oppgaver: { anslag: 6, simulering: 2, maal: 4, feilsoking: 4, recall: 4 },
  },
  {
    nummer: 2,
    id: "fase-2",
    tittel: "Data og features",
    handlerOm:
      "Rådata er nesten aldri klart til bruk. Her lærer du hva en feature (egenskap) og en target (det du vil forutsi) er, hvordan tall- og kategorikolonner må behandles forskjellig, hva du gjør med manglende verdier, og hvorfor rekkefølgen på forbehandlingen avgjør om resultatet ditt er ekte.",
    sporsmal: "Hvordan gjør jeg rådata om til noe en algoritme kan lære av — uten å jukse?",
    status: "komplett",
    byggerPa: [1],
    atomer: [
      { id: "A04", navn: "Features og target", dekkesAv: "dte2602-modul2", mappe: false },
      {
        id: "A05",
        navn: "Numeriske mot kategoriske features",
        dekkesAv: "dte2602-preprocessing-pipeline",
        mappe: false,
      },
      {
        id: "A06",
        navn: "Manglende verdier",
        dekkesAv: "dte2602-preprocessing-pipeline",
        mappe: true,
      },
      {
        id: "A07",
        navn: "Feature scaling (skalering)",
        dekkesAv: "dte2602-preprocessing-pipeline",
        mappe: true,
      },
      {
        id: "A08",
        navn: "One-hot encoding",
        dekkesAv: "dte2602-preprocessing-pipeline",
        mappe: true,
      },
      { id: "A09", navn: "Utforskende dataanalyse", dekkesAv: "dte2602-eda-pandas", mappe: true },
    ],
    trinn: [
      {
        slug: "dte2602-modul2",
        tittel: "Modul 2 — oppgaver til Fase 2",
        hva: "Velg X og y selv, se skalering flytte naboene, ta forbehandlingsvalg med reelle avveininger og finn lekkasjen i fem pipelines.",
        art: "modul",
      },
      {
        slug: "dte2602-eda-pandas",
        tittel: "Utforskende dataanalyse i pandas",
        hva: "Slipp inn en CSV-fil og få beskrivelser, histogrammer, korrelasjoner og klassebalanse.",
        art: "lab",
      },
      {
        slug: "dte2602-preprocessing-pipeline",
        tittel: "Forbehandling og pipeline",
        hva: "Skalering, one-hot encoding og ColumnTransformer — med en knapp som demonstrerer datalekkasje visuelt.",
        art: "lab",
      },
    ],
    oppgaver: { anslag: 6, simulering: 2, maal: 4, feilsoking: 5, recall: 5 },
  },
  {
    nummer: 3,
    id: "fase-3",
    tittel: "Evaluering og oppdeling",
    handlerOm:
      "Et tall som sier «94 % riktig» betyr ingenting før du vet hva det ble målt på. Denne fasen handler om å holde tilbake data, om hvorfor accuracy (andel riktige) lyver når klassene er ubalanserte, og om hvordan modellen kan se god ut på papiret og likevel være ubrukelig.",
    sporsmal: "Er modellen min faktisk god, eller har jeg lurt meg selv?",
    status: "stoff-finnes",
    byggerPa: [1, 2],
    atomer: [
      { id: "A10", navn: "Train/test-oppdeling", dekkesAv: "dte2602-evaluering-metoder", mappe: true },
      { id: "A11", navn: "Stratifisert oppdeling", dekkesAv: "dte2602-cv-varianter", mappe: true },
      { id: "A12", navn: "Train, validering og test", dekkesAv: "dte2602-evaluering-metoder", mappe: false },
      { id: "A13", navn: "k-fold kryssvalidering", dekkesAv: "dte2602-cv-varianter", mappe: true },
      { id: "A14", navn: "Datalekkasje", dekkesAv: "dte2602-preprocessing-pipeline", mappe: true },
      { id: "A15", navn: "Overtilpasning og undertilpasning", dekkesAv: "dte2602-bias-varians", mappe: true },
      { id: "A16", navn: "Bias-varians-avveiningen", dekkesAv: "dte2602-bias-varians", mappe: false },
      { id: "A17", navn: "Accuracy, presisjon, recall og F1", dekkesAv: "dte2602-evaluation-roc", mappe: true },
      { id: "A18", navn: "Forvirringsmatrise", dekkesAv: "dte2602-evaluation-roc", mappe: true },
      { id: "A19", navn: "ROC-kurve og AUC", dekkesAv: "dte2602-roc-curve-plotter", mappe: true },
      { id: "A20", navn: "MAE, RMSE og R²", dekkesAv: "dte2602-regresjon-diagnostikk", mappe: true },
    ],
    trinn: [
      {
        slug: "dte2602-evaluering-metoder",
        tittel: "Evaluering og eksperimentdesign",
        hva: "Oppdeling, kryssvalidering og hvilken metrikk som passer til hvilket problem.",
        art: "leksjon",
      },
      {
        slug: "dte2602-cv-varianter",
        tittel: "Varianter av kryssvalidering",
        hva: "k-fold, stratifisert, gruppert og tidsserie — se hvilke punkter som havner hvor.",
        art: "lab",
      },
      {
        slug: "dte2602-evaluation-roc",
        tittel: "Forvirringsmatrise, F1 og ROC-AUC",
        hva: "Flytt terskelen og se alle fire tallene i matrisen endre seg samtidig.",
        art: "lab",
      },
      {
        slug: "dte2602-roc-curve-plotter",
        tittel: "ROC-kurve interaktivt",
        hva: "Hvordan separasjon mellom klassene henger sammen med arealet under kurven.",
        art: "lab",
      },
      {
        slug: "dte2602-bias-varians",
        tittel: "Bias-varians og regularisering",
        hva: "Skyv polynomgraden og se treningsfeil og testfeil skille lag.",
        art: "lab",
      },
      {
        slug: "dte2602-regresjon-diagnostikk",
        tittel: "Regresjonsdiagnostikk",
        hva: "Residualplott, MAE mot RMSE, og hva R² faktisk måler.",
        art: "lab",
      },
    ],
  },
  {
    nummer: 4,
    id: "fase-4",
    tittel: "Algoritmer med fasit",
    handlerOm:
      "Først nå er det trygt å velge algoritme. Hver av dem gjør en annen antakelse om hvordan verden ser ut — lineær regresjon antar en rett linje, kNN antar at naboer ligner, et beslutningstre antar at rette snitt langs aksene holder. Å velge riktig er å velge antakelsen som passer dataene.",
    sporsmal: "Hvilken algoritme passer til disse dataene — og hvorfor akkurat den?",
    status: "stoff-finnes",
    byggerPa: [2, 3],
    atomer: [
      { id: "A21", navn: "Lineær regresjon", dekkesAv: "dte2602-lineaer-regresjon", mappe: true },
      { id: "A22", navn: "Logistisk regresjon", dekkesAv: "dte2602-logistisk-regresjon", mappe: true },
      { id: "A23", navn: "k nærmeste naboer (kNN)", dekkesAv: "supervised-learning", mappe: true },
      { id: "A24", navn: "Beslutningstre", dekkesAv: "dte2602-trees-rf", mappe: true },
      { id: "A25", navn: "Random forest", dekkesAv: "dte2602-trees-rf", mappe: true },
      { id: "A26", navn: "Støttevektormaskin (SVM)", dekkesAv: "dte2602-svm", mappe: false },
      { id: "A27", navn: "Naiv Bayes", dekkesAv: "dte2602-lda-qda-nb", mappe: true },
      { id: "A28", navn: "LDA og QDA", dekkesAv: "dte2602-lda-qda-nb", mappe: false },
      { id: "A29", navn: "Regularisering: ridge og lasso", dekkesAv: "dte2602-bias-varians", mappe: true },
      { id: "A30", navn: "Hyperparameter mot parameter", dekkesAv: "dte2602-evaluering-metoder", mappe: false },
      { id: "A31", navn: "Rutenettsøk med kryssvalidering", dekkesAv: "dte2602-evaluering-metoder", mappe: true },
      { id: "A32", navn: "Pipeline i scikit-learn", dekkesAv: "dte2602-preprocessing-pipeline", mappe: true },
    ],
    trinn: [
      {
        slug: "supervised-learning",
        tittel: "Supervised learning — oversikt",
        hva: "Kartet over algoritmene og hvilken antakelse hver av dem hviler på.",
        art: "leksjon",
      },
      {
        slug: "dte2602-lineaer-regresjon",
        tittel: "Lineær regresjon fra bunnen",
        hva: "Dra datapunktene og se linja, residualene og R² følge etter.",
        art: "lab",
      },
      {
        slug: "dte2602-logistisk-regresjon",
        tittel: "Logistisk regresjon i dybden",
        hva: "Sigmoid, log-odds og en beslutningsgrense som trenes live.",
        art: "lab",
      },
      {
        slug: "dte2602-trees-rf",
        tittel: "Beslutningstrær og random forest",
        hva: "Bygg treet split for split, og se hva 50 trær i snitt gjør med grensa.",
        art: "lab",
      },
      {
        slug: "dte2602-svm",
        tittel: "SVM — maksimal margin",
        hva: "Hvorfor grensa bare avhenger av punktene nærmest — lineær mot RBF-kjerne.",
        art: "lab",
      },
      {
        slug: "dte2602-lda-qda-nb",
        tittel: "LDA, QDA og naiv Bayes",
        hva: "Tre generative klassifikatorer med grensene tegnet side om side.",
        art: "lab",
      },
    ],
  },
  {
    nummer: 5,
    id: "fase-5",
    tittel: "Uten fasit",
    handlerOm:
      "Når ingen har merket dataene må strukturen komme fra dataene selv. Klustering finner grupper, dimensjonsreduksjon finner retningene som bærer mest variasjon. Det vanskelige er ikke å kjøre algoritmen — det er å avgjøre om gruppene den fant betyr noe.",
    sporsmal: "Hva finnes i dataene når ingen har fortalt meg hva jeg leter etter?",
    status: "stoff-finnes",
    byggerPa: [2],
    atomer: [
      { id: "A33", navn: "k-means-klustering", dekkesAv: "unsupervised-learning", mappe: true },
      { id: "A34", navn: "Albuemetoden for å velge k", dekkesAv: "unsupervised-learning", mappe: true },
      { id: "A35", navn: "Hierarkisk klustering", dekkesAv: "unsupervised-learning", mappe: false },
      { id: "A36", navn: "DBSCAN (tetthetsbasert)", dekkesAv: "unsupervised-learning", mappe: false },
      { id: "A37", navn: "PCA — dimensjonsreduksjon", dekkesAv: "dte2501-pca-visualizer", mappe: true },
    ],
    trinn: [
      {
        slug: "unsupervised-learning",
        tittel: "Unsupervised learning",
        hva: "k-means, hierarkisk klustering, DBSCAN og hvordan du velger antall grupper.",
        art: "leksjon",
      },
      {
        slug: "dte2501-kmeans-visualizer",
        tittel: "k-means steg for steg",
        hva: "Klikk deg gjennom hver iterasjon: tilordne punkter, flytt sentroider, gjenta.",
        art: "lab",
      },
      {
        slug: "dte2501-pca-visualizer",
        tittel: "PCA interaktivt",
        hva: "Se aksene rotere til der variasjonen faktisk ligger.",
        art: "lab",
      },
    ],
  },
  {
    nummer: 6,
    id: "fase-6",
    tittel: "Nevrale nett — introduksjon",
    handlerOm:
      "Ett kunstig nevron er bare en vektet sum med en terskel. Legger du dem i lag og lar en ikke-lineær funksjon stå imellom, kan nettet representere langt mer innfløkte sammenhenger. Her holder det med intuisjonen — matematikken tas i DTE-2502.",
    sporsmal: "Hva gjør et nevralt nett som en lineær modell ikke klarer?",
    status: "stoff-finnes",
    byggerPa: [4],
    atomer: [
      { id: "A38", navn: "Perceptron", dekkesAv: "nn-intro", mappe: false },
      { id: "A39", navn: "Aktiveringsfunksjoner", dekkesAv: "nn-intro", mappe: false },
      { id: "A40", navn: "Gradient descent (intuisjon)", dekkesAv: "gradient-descent", mappe: false },
      { id: "A41", navn: "Backpropagation (overflate)", dekkesAv: "backprop-dyp", mappe: false },
      { id: "A42", navn: "Flerlagsperceptron (MLP)", dekkesAv: "nn-intro", mappe: true },
    ],
    trinn: [
      {
        slug: "nn-intro",
        tittel: "Innføring i nevrale nett",
        hva: "Perceptron, aktiveringsfunksjoner og hva som skjer når du stabler lag.",
        art: "leksjon",
      },
      {
        slug: "gradient-descent",
        tittel: "Gradient descent",
        hva: "Kula som triller nedover tapsflata — læringsrate for høy og for lav.",
        art: "lab",
      },
      {
        slug: "backprop-dyp",
        tittel: "Backpropagation",
        hva: "Kjerneregelen brukt baklengs, med tallene synlige på hver pil.",
        art: "lab",
      },
      {
        slug: "sigmoid-viz",
        tittel: "Sigmoid og aktiveringsfunksjoner",
        hva: "Formene side om side, og hvorfor valget påvirker læringen.",
        art: "lab",
      },
    ],
  },
  {
    nummer: 7,
    id: "fase-7",
    tittel: "Prosjektflyt og etikk",
    handlerOm:
      "Fasen mappeinnleveringen faktisk vurderes på. Hele kjeden fra problemformulering til modellkort, pluss det du må kunne drøfte: baseline, klasseubalanse, reproduserbarhet, skjevhet i data, personvern og EU-regelverket.",
    sporsmal: "Hvordan leverer jeg et prosjekt en sensor kan stole på?",
    status: "under-arbeid",
    byggerPa: [3, 4],
    merknad:
      "Innholdet i denne fasen bygges i en parallell sesjon (branch feat/dte2602-prosjektflyt-viz). Denne modul-visningen lenker til det, men bygger det ikke.",
    atomer: [
      { id: "A43", navn: "Sjustegsflyten (CRISP-DM-aktig)", dekkesAv: "dte2602-prosjektflyt", mappe: true },
      { id: "A44", navn: "Baseline-modell", dekkesAv: "dte2602-prosjektflyt", mappe: true },
      { id: "A45", navn: "Klasseubalanse", dekkesAv: "dte2602-prosjektflyt", mappe: true },
      { id: "A46", navn: "Reproduserbarhet (random_state)", dekkesAv: "dte2602-mappe-mal", mappe: true },
      { id: "A47", navn: "AI-historie i korte trekk", dekkesAv: "ai-historie", mappe: false },
      { id: "A48", navn: "Skjevhets-taksonomi i ML", dekkesAv: "dte2602-etikk-filosofi", mappe: true },
      { id: "A49", navn: "GDPR i maskinlæring", dekkesAv: "dte2602-etikk-filosofi", mappe: true },
      { id: "A50", navn: "Forklarbar AI", dekkesAv: "dte2602-etikk-filosofi", mappe: true },
      { id: "A51", navn: "Kinarommet, svak mot sterk AI", dekkesAv: "ai-etikk", mappe: false },
      { id: "A52", navn: "EU AI Act — risikopyramiden", dekkesAv: "dte2602-etikk-filosofi", mappe: true },
      { id: "A53", navn: "Struktur på mapperapporten", dekkesAv: "dte2602-mappe-mal", mappe: true },
    ],
    trinn: [
      {
        slug: "dte2602-prosjektflyt",
        tittel: "ML-prosjekt fra A til Å",
        hva: "De sju stegene fra problem til drift, med baseline og klasseubalanse underveis.",
        art: "leksjon",
      },
      {
        slug: "dte2602-mappe-mal",
        tittel: "Mal for mappeoppgaven",
        hva: "Rapportstruktur, hva sensor ser etter, og fellene som koster mest.",
        art: "leksjon",
      },
      {
        slug: "dte2602-etikk-filosofi",
        tittel: "Etikk og filosofi",
        hva: "Skjevhet i data, personvern, forklarbarhet og EU AI Act.",
        art: "leksjon",
      },
      {
        slug: "ai-historie",
        tittel: "AI-historie",
        hva: "Fra Dartmouth 1956 via AI-vintrene til gjennombruddet i 2012.",
        art: "leksjon",
      },
    ],
  },
];

/** Alle trinn-slugs i en fase — grunnlaget for framdriftsberegning. */
export function faseSlugs(fase: Fase): string[] {
  return fase.trinn.map((t) => t.slug);
}

/** Alle trinn-slugs på tvers av faser, uten duplikater. */
export function alleFaseSlugs(): string[] {
  const set = new Set<string>();
  for (const fase of FASER) for (const t of fase.trinn) set.add(t.slug);
  return [...set];
}

export const EKSAMEN_DTE2602 = {
  hjemmeeksamen: "09.12.2026",
  mappe: "11.12.2026",
  /** Hvorfor oppgavemiksen ser ut som den gjør. */
  konsekvens:
    "Vurderingen er hjemmeeksamen og mappe, ikke skriftlig skoleeksamen. Da er det ikke gjenkalling som skiller — du har tilgang til notatene dine. Det som skiller er om du kan sette opp et problem riktig, forsvare valgene dine og oppdage feil i en pipeline. Derfor ligger tyngden her på måloppgaver og feilsøking, og recall-kortene er få med vilje.",
} as const;
