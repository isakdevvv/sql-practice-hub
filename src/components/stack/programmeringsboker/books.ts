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

  // ============ BØLGE 2 ============================================
  {
    id: "crafting-interpreters",
    title: "Crafting Interpreters",
    authors: "Robert Nystrom",
    year: "2021 — gratis online",
    free: true,
    url: "https://craftinginterpreters.com/",
    blurb:
      "Bygg en hel programmeringsspråk-tolker fra null — først i Java (tre-walking), så i C (bytecode VM). Eneste boka som virkelig demystifiserer hva et språk ER.",
    metaforer: [
      "Tre-walker først, bytecode-VM etterpå — du ser SAMME språk implementert to ganger",
      "Forklarer parsing som 'å lese ferdig før du forstår' — recursive descent uten teoretisk tåke",
      "Bytecode-kapittelet viser HVORFOR Python er treg og hvorfor JIT eksisterer",
      "Garbage collection-kapittelet bygger en mark-and-sweep GC i ren C — magi forsvinner",
    ],
    fag: ["trinn-8 (python er C)", "trinn-10 (Flask dyp)", "DTE-2511 Vid. programmering"],
    tier: 2,
    motArgument:
      "Dragon Book er den akademiske kompilatorboka, men er teoritung og pedagogisk dårlig. Nystrom bygger noe FAKTISK kjørbart og vil at du skal skjønne — ikke bare bestå eksamen.",
  },

  {
    id: "petrov-database-internals",
    title: "Database Internals: A Deep Dive into How Distributed Data Systems Work",
    authors: "Alex Petrov",
    year: "2019",
    free: false,
    url: "https://www.databass.dev/",
    blurb:
      "Hva som faktisk skjer inne i en database — B-trees, LSM-trees, write-ahead-log, replikasjon, konsensus. Komplement til Kleppmann (DDIA): Petrov viser HVORDAN, Kleppmann HVORFOR.",
    metaforer: [
      "B-tree vs LSM-tree visualisert med konkret read/write-karakteristikk",
      "WAL (write-ahead-log) forklart som 'commit-bok du skriver i før du gjør jobben'",
      "Raft-konsensus illustrert som 'møtekall der alle enige om hvem som leder'",
      "Tar opp eksakt samme tema som Kleppmann men med 10x mer KODE og diagrammer",
    ],
    fag: ["DTE-2509 Databaser (avansert lesning)", "DTE-2604 Systemutvikling", "bachelor-oppgave hvis DB"],
    tier: 3,
    motArgument:
      "DDIA er bredere men mindre dyp på selve DB-internalene. Petrov supplerer med tekniske detaljer DDIA hopper over.",
  },

  {
    id: "huyen-mlops",
    title: "Designing Machine Learning Systems",
    authors: "Chip Huyen",
    year: "2022",
    free: false,
    url: "https://huyenchip.com/ml-interviews-book/",
    blurb:
      "Hvordan ML faktisk leveres i produksjon. Géron lærer deg å bygge en modell; Huyen lærer deg hvordan modellen møter virkelig data, drift, monitorering og A/B-testing.",
    metaforer: [
      "'Data flywheel' = mer brukere → mer data → bedre modell → flere brukere",
      "Concept drift forklart med konkrete eksempler (Covid-19 endret ALLE ML-modeller på én dag)",
      "Feature store som 'database for ML-features' — løser duplisering mellom team",
      "Online vs batch learning trade-offs presentert som beslutningsmatrise, ikke ideologi",
    ],
    fag: ["DTE-2602 ML intro (ekstra)", "DTE-2502 Deep Learning", "bachelor-oppgave hvis ML i prod"],
    tier: 2,
    motArgument:
      "Géron + ISLR lærer deg modellteori. Huyen er HVA SKJER ETTER MODELL FERDIG — som ingen lærebok dekker. Direkte relevant for jobb-intervjuer i ML-roller.",
  },

  {
    id: "grokking-algorithms",
    title: "Grokking Algorithms",
    authors: "Aditya Bhargava",
    year: "2nd ed. 2024",
    free: false,
    url: "https://www.manning.com/books/grokking-algorithms-second-edition",
    blurb:
      "Tegneserie-aktig algoritmebok. Visuell, vennlig, og dekker datastrukturer/algoritmer du trenger overalt. Komplement til CLRS hvis du vil ha dybde — men start her.",
    metaforer: [
      "Quicksort visualisert som 'velg pivot, alle mindre venstre, alle større høyre' — TEGNET",
      "Hash-tabeller forklart med 'navn-til-skuffenummer-funksjon' — du SER hvorfor hash er rask",
      "Dijkstra steg-for-steg med kart, ikke matriser",
      "Dynamic programming forklart via knapsack med visuelle griller — endelig forståelig",
    ],
    fag: ["algoritmer-stack-sider", "intervju-prep", "DTE-2511"],
    tier: 2,
    motArgument:
      "CLRS er KING for teori men er en murstein på 1300 sider. Bhargava er 250 sider og lærer deg det 80% bruker uten gråt. Komplement, ikke konkurrent.",
  },

  {
    id: "fowler-refactoring",
    title: "Refactoring: Improving the Design of Existing Code",
    authors: "Martin Fowler",
    year: "2nd ed. 2018",
    free: false,
    url: "https://martinfowler.com/books/refactoring.html",
    blurb:
      "Hvordan endre kode SAFE — uten å bryte den. Hver refactoring har et navn ('Extract Method', 'Inline Variable') som blir et begrep du bruker resten av karrieren.",
    metaforer: [
      "'Code smell' = symptomer som indikerer designproblem (Long Method, Feature Envy, ...)",
      "Refactoring-katalog: 60+ navngitte transformasjoner med før/etter-kode",
      "'Refactor first, THEN add the feature' — mantra som forhindrer rot",
      "Tester som 'sikkerhetsnett som lar deg endre uten frykt' — kobler refactoring til TDD",
    ],
    fag: ["DTE-2511 Vid. programmering", "DTE-2604 Systemutvikling", "alle prosjekt-fag"],
    tier: 3,
    motArgument:
      "Pragmatic Programmer gir prinsipper. Fowler gir KATALOG av konkrete grep. Begge to = komplett — Pragmatic alene = teori uten verktøy.",
  },

  // ============ BØLGE 3 — gratis-tunge spesialister ===================
  {
    id: "grigorik-hpbn",
    title: "High Performance Browser Networking",
    authors: "Ilya Grigorik (Google)",
    year: "2013 (fortsatt mest oppdaterte ressurs på HTTP/2-3, QUIC)",
    free: true,
    url: "https://hpbn.co/",
    blurb:
      "Hva nettet faktisk gjør i nettleseren — TCP, TLS, HTTP/1.1/2/3, QUIC, WebSocket, WebRTC. Skrevet av Googles tidligere web-perf-leder. Komplement til Kurose: Kurose lærer protokollene, Grigorik lærer hvordan de møter ekte nettsider.",
    metaforer: [
      "TCP-handshake-pris målt i konkrete RTT — viser hvorfor HTTP/3 over QUIC vant",
      "TLS 1.2 vs 1.3 sammenlignet RTT-for-RTT (1.3 sparer én round trip)",
      "HTTP/2 server-push og prioritering forklart med konkrete eksempler",
      "Mobile/celle-radio-tilstander (RRC) — hvorfor mobil-perf er annerledes",
    ],
    fag: ["DTE-2507 (web-perf-perspektiv)", "DTE-2509 (HTTP/2/3-detaljer)", "web-prosjekter"],
    tier: 2,
    motArgument:
      "Kurose dekker protokollene generelt, men er klassisk akademisk. Grigorik er Google-ingeniøren som faktisk har målt og optimalisert dette i prod.",
  },

  {
    id: "google-sre",
    title: "Site Reliability Engineering: How Google Runs Production Systems",
    authors: "Beyer, Jones, Petoff & Murphy (Google SRE-team)",
    year: "2016 — gratis online",
    free: true,
    url: "https://sre.google/sre-book/table-of-contents/",
    blurb:
      "Hvordan moderne firma faktisk drifter systemer i 2026. SLI/SLO/SLA, error budgets, blameless postmortems, toil-automatisering — terminologien som brukes overalt i industrien.",
    metaforer: [
      "SLO som 'kontrakt mellom team' — bytter ut subjektivitet med tall",
      "Error budget = 'hvor mye nedetid har du råd til denne måneden' — løser konflikten dev vs ops",
      "Blameless postmortem = 'vi spør hvorfor systemet svikter, ikke hvem'",
      "Toil-budsjett ≤ 50% av tiden — kvantifiserer 'vi må automatisere mer'",
    ],
    fag: ["DTE-2511 Vid. programmering", "DTE-2604 Systemutvikling", "bachelor-prosjekt med devops-aspekt"],
    tier: 2,
    motArgument:
      "Pragmatic Programmer er individuelt-perspektiv. Phoenix Project er roman. SRE-boka er det eneste tekniske som beskriver moderne drift fra topp til bunn — gratis fordi Google ville heve standarden i industrien.",
  },

  {
    id: "goodfellow-deep-learning",
    title: "Deep Learning",
    authors: "Ian Goodfellow, Yoshua Bengio, Aaron Courville",
    year: "2016 — gratis online",
    free: true,
    url: "https://www.deeplearningbook.org/",
    blurb:
      "Den matematiske bibelen for deep learning. Tre forskere som fant opp store deler av feltet. Tung lesning, men ingen annen bok bygger fundamentet med samme rigor.",
    metaforer: [
      "Del 1: matematisk fundament (lin.alg., sannsynlighet, info-teori) — alt du trenger samlet",
      "Del 2: feedforward, regularisering, optimering, CNN, RNN — kjernen",
      "Del 3: research-frontier per 2016 (litt utdatert, men prinsippene står)",
      "Begrepet 'representation learning' formaliseres her — hvorfor deep > shallow",
    ],
    fag: ["DTE-2502 Deep Learning (etter Nielsen)"],
    tier: 2,
    motArgument:
      "Nielsen NNDL gir intuisjon, og det er der du starter. Goodfellow er hva du leser når du må forstå BEVIS, ikke bare hvordan kalle .fit() på Keras. Stein-tung men gratis.",
  },

  {
    id: "sutton-barto-rl",
    title: "Reinforcement Learning: An Introduction",
    authors: "Richard S. Sutton & Andrew G. Barto",
    year: "2nd ed. 2018 — gratis online",
    free: true,
    url: "http://incompleteideas.net/book/the-book-2nd.html",
    blurb:
      "RL-bibelen. Sutton & Barto fant opp temporal-difference learning, Q-learning og mye annet. Boka deres er der alle (inkludert DeepMind-folk) startet.",
    metaforer: [
      "Multi-armed bandits som introduksjon til exploration vs exploitation",
      "Bellman-ligningen bygd opp fra null — endelig forståelig",
      "Policy iteration vs value iteration sammenlignet med pseudokode",
      "Actor-critic forklart som 'én del lærer hva som er bra, en annen velger handling'",
    ],
    fag: ["DTE-2501 (RL-delen)", "DTE-2502 (om du vil dypt inn i deep RL etter)"],
    tier: 2,
    motArgument:
      "AIMA dekker RL i ett kapittel. Sutton & Barto er HELE boka, av folkene som fant opp algoritmene. Når DeepMind-folk skriver papers refererer de til denne.",
  },

  {
    id: "ramalho-fluent-python",
    title: "Fluent Python",
    authors: "Luciano Ramalho",
    year: "2nd ed. 2022",
    free: false,
    url: "https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/",
    blurb:
      "Python qua Python — ikke ML, ikke web, men språket selv. Ramalho lærer deg HVORFOR Python ser ut som det gjør, og hvordan skrive idiomatisk Python.",
    metaforer: [
      "Data model — `__dunder__`-metoder forklart fra grunnen (= alt!)",
      "Generators som 'lazy lister' — `yield` blir åpenbart",
      "Decorators-kapittelet er den klareste forklaringen som finnes",
      "asyncio og concurrency — stort sett uendret etter 3.12, prinsippene står",
    ],
    fag: ["DTE-2501/2602/2502/2509", "alle Python-tunge fag"],
    tier: 3,
    motArgument:
      "Géron lærer ML-Python (sklearn-API). Fluent Python lærer deg språket. Ingen overlapp — kun les denne om du skriver Python ofte og vil bli faktisk god.",
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
    semester: "Sommer-prosjekt 1.→2. år (om du vil bygge noe morsomt)",
    bok: "crafting-interpreters",
    why: "Bygg din egen tolker. Beste sommer-prosjekt en datastudent kan gjøre — du lærer rekursjon, parsing, tre-traversering, GC i én bok.",
  },
  {
    semester: "Etter Géron — før eller parallell med bachelor-prosjekt",
    bok: "huyen-mlops",
    why: "Hvis bacheloroppgaven din er ML-relatert: les denne FØR du designer pipeline. Sparer deg fra rookie-feil i produksjon.",
  },
  {
    semester: "Som referanse hele tiden",
    bok: "grokking-algorithms",
    why: "Oppslagsverk når du møter et algoritmeproblem og trenger 'å se' løsningen. Bla gjennom på lørdag formiddag.",
  },
  {
    semester: "Når du har skrevet >2000 linjer kode",
    bok: "fowler-refactoring",
    why: "Refactoring gir mest mening når du allerede har følt smerten av rotete kode. Les den ETTER du har erfaring å henge teknikkene på.",
  },
  {
    semester: "Avansert valg — bachelor-prosjekt om DB",
    bok: "petrov-database-internals",
    why: "Kun hvis bacheloroppgaven din krever dyp DB-kunnskap. Ellers nok å vite at den finnes.",
  },
  {
    semester: "Bygger React/web-prosjekt — vil du faktisk forstå det",
    bok: "grigorik-hpbn",
    why: "Gratis, lesbar i biter. Etter Kurose-grunnlag — Grigorik viser hvordan protokollene møter ekte browser-perf.",
  },
  {
    semester: "Bachelor-prosjekt med devops/produksjon",
    bok: "google-sre",
    why: "Lær terminologien (SLO, error budget) FØR du designer systemet. Ellers ender du opp med å gjenoppfinne ordene.",
  },
  {
    semester: "Etter Nielsen — vår 3. år eller master-forberedelse",
    bok: "goodfellow-deep-learning",
    why: "Når du må forstå BEVIS bak deep learning, ikke bare ringe `.fit()`. Kun hvis du faktisk skal forske eller jobbe DL-tungt.",
  },
  {
    semester: "Når DTE-2501 dekker RL — eller om du vil bygge en RL-agent",
    bok: "sutton-barto-rl",
    why: "AIMA gir overblikk; Sutton & Barto gir hele dybden. Gratis, så kost null å lese parallelt.",
  },
  {
    semester: "Når du har skrevet >5000 linjer Python",
    bok: "ramalho-fluent-python",
    why: "Ramalho gir mest mening når du har erfaring å henge idiomene på. Før dette: bruk Python; etter: bli god på Python.",
  },
  {
    semester: "Når som helst, fortsett å bruke",
    bok: "aima",
    why: "Oppslagsverk for AI-konsepter resten av karrieren. Russell oppdaterer det med 8 års mellomrom.",
  },
] as const;
