/**
 * 10 bøker som dekker hele DTE-bachelor-pensumet med vekt på beste
 * konsepter og metaforer. Hver bok er valgt fordi DEN ER BEST på sitt
 * område — ikke fordi den dekker mest. En perfekt forklaring av ETT
 * tema slår en grunn dekning av ti.
 *
 * Sortert etter pedagogisk progresjon, ikke etter studiepoeng.
 */
export interface Book {
  /** Kort id brukt som anchor. */
  id: string;
  title: string;
  authors: string;
  year: string;
  /** Fri PDF eller kjøp? */
  free: boolean;
  /** URL for fri-utgave eller offisiell forfatter-side. */
  url: string;
  /** Én setning som plasserer boken. */
  blurb: string;
  /** 2-4 punkter som er bokens definitive bidrag — det andre bøker ikke gjør like godt. */
  metaforer: string[];
  /** Hvilke UiT-fag den treffer. */
  fag: string[];
  /** 1 = må ha, 2 = sterk anbefaling, 3 = bonus. */
  tier: 1 | 2 | 3;
  /** Hva alternativet ville vært (og hvorfor denne vinner). */
  motArgument?: string;
}

export const BOOKS: readonly Book[] = [
  {
    id: "petzold-code",
    title: "Code: The Hidden Language of Computer Hardware and Software",
    authors: "Charles Petzold",
    year: "2nd ed. 2022",
    free: false,
    url: "https://www.charlespetzold.com/code/",
    blurb:
      "Bygger opp en datamaskin fra lyspærer og brytere til en fungerende CPU. Den eneste boken som faktisk får deg til å forstå hvor 'koden' kommer fra.",
    metaforer: [
      "Telegraf-relé som bygger NAND, NAND som bygger alt",
      "ASCII-tabellen som 'avtale mellom alle tastaturer i verden'",
      "Bygger en 8-bit ALU steg for steg — den blir DEMYSTIFISERT, ikke magisk",
      "Forklarer hvorfor 'instruksjon' er bare en tall-konvensjon mellom CPU og programmerer",
    ],
    fag: ["trinn-1 → trinn-9 (hardware-lab)", "DTE-2505 OS-fundament"],
    tier: 1,
    motArgument:
      "Patterson & Hennessy er den akademiske standarden, men er overkill for en bachelor. Petzold er førstegangs-leseren som bringer deg til å skjønne CPU.",
  },

  {
    id: "ostep",
    title: "Operating Systems: Three Easy Pieces (OSTEP)",
    authors: "Remzi & Andrea Arpaci-Dusseau",
    year: "v1.10, 2024 — gratis online",
    free: true,
    url: "https://pages.cs.wisc.edu/~remzi/OSTEP/",
    blurb:
      "Hele OS-pensumet rammet inn av tre konsepter: virtualisering, konkurrens, persistens. Pedagogisk overlegen Tanenbaum/Silberschatz.",
    metaforer: [
      "Virtualisering = 'illusjon for hver prosess at den eier hele maskinen'",
      "Konkurrens = 'flere kokker på samme kjøkken — ressurser må synkroniseres'",
      "Persistens = 'data skal overleve strømbrudd' (filsystemer, journaling)",
      "Hver del er et mini-bok i seg selv — perfekt for deleksamen",
    ],
    fag: ["DTE-2505 Operativsystemer"],
    tier: 1,
    motArgument:
      "Tanenbaum er klassisk, men OSTEP slår den på didaktikk. Den er gratis, og forfatterne er aktive forelesere som tester innhold på studenter hvert år.",
  },

  {
    id: "kurose-ross",
    title: "Computer Networking: A Top-Down Approach",
    authors: "James Kurose & Keith Ross",
    year: "8th ed. 2021",
    free: false,
    url: "https://gaia.cs.umass.edu/kurose_ross/",
    blurb:
      "Bibelen for DTE-2507. Top-down (start med apper, ned til kabler) er didaktisk overlegen Tanenbaums bottom-up. Vi har allerede full integrasjon — se /spor.",
    metaforer: [
      "Trucks on highways = pakker i nettverket (lett å huske)",
      "Karavananalogi = forklarer d_trans vs d_prop (de fire forsinkelsene)",
      "rdt 1.0 → 3.0 = bygger pålitelighet ETT problem av gangen",
      "ap 1.0 → 4.0 = parallelt eksempel for autentisering — viser hvorfor nonce trengs",
      "'A Day in the Life of a Web Page Request' = 24 steg som integrerer alt",
    ],
    fag: ["DTE-2507 Datakommunikasjon og sikkerhet"],
    tier: 1,
    motArgument:
      "Tanenbaum sin 'Computer Networks' bygger bottom-up (link-laget først). Studenten taper motivasjon før han kommer til HTTP. Top-down løser dette.",
  },

  {
    id: "ddia",
    title: "Designing Data-Intensive Applications (DDIA)",
    authors: "Martin Kleppmann",
    year: "1st ed. 2017 (2nd ed. på vei 2026)",
    free: false,
    url: "https://dataintensive.net/",
    blurb:
      "Hvordan systemer faktisk bygges i industrien. Kleppmann er metafor-mesteren — han endrer hvordan du tenker om data, latency og distribusjon.",
    metaforer: [
      "'Database er bare en logg' — alt annet er optimaliseringer over loggen",
      "B-tree vs LSM-tree forklart med 'å sortere bok i bibliotek vs å skrive på en stigende stabel'",
      "CAP-teoremet sett fra ingeniørperspektiv (ikke matematikk)",
      "Eventual consistency forklart med 'kollegaer som leser e-post på ulik tid'",
    ],
    fag: ["DTE-2509 Databaser og webapplikasjoner", "DTE-2604 Systemutvikling", "videregående utvikling"],
    tier: 2,
    motArgument:
      "Silberschatz/Korth er pensumboka for kjerne-DB-teori. DDIA er det du leser ETTER for å skjønne hvordan teorien spiller ut i ekte systemer.",
  },

  {
    id: "aima",
    title: "Artificial Intelligence: A Modern Approach (AIMA)",
    authors: "Stuart Russell & Peter Norvig",
    year: "4th ed. 2020",
    free: false,
    url: "https://aima.cs.berkeley.edu/",
    blurb:
      "Bibelen for klassisk AI. 'Rational agent'-rammeverket gir den beste konseptuelle limen for hele AI-feltet. Pre-LLM, men prinsippene står.",
    metaforer: [
      "'Rational agent' = funksjon fra persepsjons-historie til handling",
      "Søk = 'state-space som graf, finn vei til mål' (alle algoritmer er varianter)",
      "Adversarial = 'minimax fordi motstanderen prøver det motsatte'",
      "Bayes = 'oppdater tro proporsjonalt med evidens × prior'",
    ],
    fag: ["DTE-2501 AI Methods"],
    tier: 1,
    motArgument:
      "AIMA er litt tørr og lang, men ingen bok dekker så mye AI så grundig. Komplement med 3Blue1Brown-videoer for visuell intuisjon.",
  },

  {
    id: "geron",
    title: "Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow",
    authors: "Aurélien Géron",
    year: "3rd ed. 2022",
    free: false,
    url: "https://github.com/ageron/handson-ml3",
    blurb:
      "Praktisk ML — kode-først, samtidig konseptuelt ryddig. Bedre startpunkt enn Bishop. Notebooks gratis på GitHub.",
    metaforer: [
      "'End-to-end ML project'-kapittel = den røde tråden alle andre bøker mangler",
      "Bias/varians forklart med 'å bomme jevnt' vs 'å spre rundt'",
      "Gradient descent visualisert som 'å rulle ball nedover terreng' — men også med matte",
      "Boken viser scikit-learn og TF/Keras side-om-side — du ser hvordan abstraksjonene maps",
    ],
    fag: ["DTE-2602 ML intro", "DTE-2502 Deep Learning (intro)"],
    tier: 1,
    motArgument:
      "Bishop er teoritungt og bedre for master/PhD. Géron er for bachelor — du skriver kode som virker FØR du skjønner hvert bevis.",
  },

  {
    id: "nielsen-nndl",
    title: "Neural Networks and Deep Learning",
    authors: "Michael Nielsen",
    year: "2019 — gratis online",
    free: true,
    url: "http://neuralnetworksanddeeplearning.com/",
    blurb:
      "Den klareste backprop-forklaringen som finnes. Visuelt, intuitivt, med bygd-fra-bunn-Python-kode for hvert kapittel.",
    metaforer: [
      "'Hva nettverket faktisk gjør' = transformerer input gjennom ikke-lineære lag",
      "Backprop = 'bare kjerneregelen med god bokføring'",
      "Cost-funksjon visualisert som landskap, gradient som retning ned",
      "Kapittel 4 ('Universal approximation theorem') = visuelt bevis på at nett kan tilnærme alt",
    ],
    fag: ["DTE-2502 Deep Learning"],
    tier: 1,
    motArgument:
      "Goodfellow's 'Deep Learning' er standardreferansen, men er stein-tung. Nielsen er hva du leser FØR Goodfellow så du har intuisjon å henge teori på.",
  },

  {
    id: "islr",
    title: "An Introduction to Statistical Learning (ISLR/ISLP)",
    authors: "James, Witten, Hastie & Tibshirani",
    year: "2nd ed. 2021 (Python-versjon: 2023, gratis)",
    free: true,
    url: "https://www.statlearning.com/",
    blurb:
      "Brobok mellom statistikk og maskinlæring. Forfatterne er Stanford-statistikere — de kobler ML-algoritmer tilbake til statistisk teori du kjenner fra TEK-1501.",
    metaforer: [
      "'Bias-variance trade-off' med konkrete formler (ikke bare ord)",
      "Resampling (bootstrap, CV) som 'data-trolldom' — pseudo-replikering uten å samle nye data",
      "LASSO/ridge forklart som 'skrumpe koeffisientene mot 0 — sparsomhet vs glatthet'",
      "Tre-baserte metoder med tegnede tre-strukturer som er KLAREST i hele litteraturen",
    ],
    fag: ["TEK-1501 Statistikk", "DTE-2602 ML intro", "bro mellom de to"],
    tier: 2,
    motArgument:
      "Géron lærer deg å BRUKE ML; ISLR lærer deg å TENKE som statistiker om ML. De komplementerer hverandre.",
  },

  {
    id: "mml",
    title: "Mathematics for Machine Learning (MML)",
    authors: "Deisenroth, Faisal & Ong",
    year: "2020 — gratis online",
    free: true,
    url: "https://mml-book.github.io/",
    blurb:
      "Lineær algebra, vektoranalyse, optimering, sannsynlighet — KUN det du faktisk bruker i ML. Sparer deg for 1000 sider klassisk matte.",
    metaforer: [
      "'Vektor som data, matrise som transformasjon' — geometrisk intuisjon for ALT",
      "Egenverdier som 'aksene som ikke roterer under transformasjonen'",
      "Gradient som 'retning av brattest stigning' — kobler matte til gradient descent",
      "Kapittel 9 (lineær regresjon) bygger HELE matten frem til closed-form-løsningen",
    ],
    fag: ["TEK-1501 grunnlag", "DTE-2501/2602/2502 ML-spesialiseringen"],
    tier: 1,
    motArgument:
      "Stranger sin 'Linear Algebra and Its Applications' er klassisk, men du trenger ikke 80% av den til ML. MML er nøyaktig det du trenger.",
  },

  {
    id: "pragmatic",
    title: "The Pragmatic Programmer",
    authors: "Andy Hunt & Dave Thomas",
    year: "20th anniversary ed. 2019",
    free: false,
    url: "https://pragprog.com/titles/tpp20/",
    blurb:
      "Mentale verktøy for å være ingeniør, ikke bare koder. Hver tip er kort, har et navn, og blir et begrep du bruker i 20 år.",
    metaforer: [
      "'Broken Windows' = teknisk gjeld smitter — fiks små ting før de råtner",
      "'Stone Soup' = bring noe enkelt, andre legger til — psykologi for å starte prosjekter",
      "'Tracer Bullets' = bygg ende-til-ende-skjelett først, optimaliser senere",
      "'DRY' (Don't Repeat Yourself) — formaliserer noe alle vet, men sjelden gjør",
    ],
    fag: ["DTE-2511 Videregående programmering", "DTE-2604 Systemutvikling", "alle prosjekt-fag"],
    tier: 2,
    motArgument:
      "Clean Code er kontroversiell og dogmatisk. Pragmatic er pragmatisk — gir deg verktøy uten å forsøke å konvertere deg til en religion.",
  },
];

/**
 * Topp-5 anbefalt lese-rekkefølge for en data-ingeniør på UiT,
 * tatt fra forløpet ditt.
 */
export const LESEORDEN_FOR_BACHELOR = [
  {
    semester: "Sommer FØR datateknikk-bacheloren",
    bok: "petzold-code",
    why: "Bygger CPU-mental-modellen før du noensinne ser en linje med C eller assembly.",
  },
  {
    semester: "Vår 1. år (parallell med trinn-fagene)",
    bok: "pragmatic",
    why: "Ingeniør-mentalitet før du har ueffektive kode-vaner satt seg.",
  },
  {
    semester: "Sommer før 2. år (forberede DTE-2505 + DTE-2507)",
    bok: "ostep",
    why: "Les del 1 (virtualisering) før OS-emnet. Halverer tiden eksamenslæring tar.",
  },
  {
    semester: "Sommer før 2. år (forberede DTE-2507)",
    bok: "kurose-ross",
    why: "Kapittel 1-3 i ro før semesteret begynner. Gir deg luft til å fordype i sikkerhet senere.",
  },
  {
    semester: "Vår 2. år (parallell med TEK-1501)",
    bok: "mml",
    why: "Statistikk-grunnlaget i TEK-1501 + lineær algebra fra MML er fundamentet for hele AI-spesialiseringen.",
  },
  {
    semester: "Sommer før 3. år (forberede DTE-2501 + DTE-2602)",
    bok: "geron",
    why: "Bygg en konkret ML-pipeline i sommer. Da kan du fokusere på TEORI når emnene starter.",
  },
  {
    semester: "Parallell med DTE-2602",
    bok: "islr",
    why: "Når Géron har gitt deg muskelminne, gir ISLR den statistiske dybden.",
  },
  {
    semester: "Vår 3. år (parallell med DTE-2502)",
    bok: "nielsen-nndl",
    why: "Backprop-intuisjon før Goodfellow blir tilgjengelig.",
  },
  {
    semester: "Bachelor-prosjekt (industri-perspektiv)",
    bok: "ddia",
    why: "Hvis bacheloroppgaven din involverer database eller distribuert system — denne gir deg språk for design-valg.",
  },
  {
    semester: "Når som helst, fortsett å bruke",
    bok: "aima",
    why: "Oppslagsverk for AI-konsepter resten av karrieren. Russell oppdaterer det med 8 års mellomrom.",
  },
] as const;
