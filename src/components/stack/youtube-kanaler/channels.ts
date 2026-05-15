/**
 * 12 YouTube-kanaler kuratert for DTE-bachelor.
 * Hver kanal er valgt fordi den er BEST på sitt område — ikke fordi den
 * er størst eller mest populær. Hvert valg har en motivasjon under.
 */
export interface Channel {
  id: string;
  navn: string;
  forfatter: string;
  url: string;
  blurb: string;
  /** Den ene videoen som beviser hvorfor kanalen er bra. */
  bestVideo: { tittel: string; url: string; varighet: string };
  fag: string[];
  tier: 1 | 2 | 3;
  hvorforHer: string;
}

export const CHANNELS: readonly Channel[] = [
  // ============ TIER 1 — må kjenne til ============================
  {
    id: "3blue1brown",
    navn: "3Blue1Brown",
    forfatter: "Grant Sanderson",
    url: "https://www.youtube.com/@3blue1brown",
    blurb:
      "De beste matematiske animasjonene som finnes på nett. Sanderson skrev biblioteket Manim selv for å lage dem.",
    bestVideo: {
      tittel: "But what is a neural network?",
      url: "https://www.youtube.com/watch?v=aircAruvnKk",
      varighet: "19 min",
    },
    fag: ["TEK-1501 (matte)", "DTE-2502 (deep learning)", "DTE-2602 (ML)"],
    tier: 1,
    hvorforHer:
      "Konsepter som lin.alg., kalkulus, sannsynlighet, og nevrale nett — visualisert på en måte som gjør at du HUSKER dem. Halvparten av matematikken i bachelor blir mer intuitiv etter én av Grants videoer.",
  },
  {
    id: "computerphile",
    navn: "Computerphile",
    forfatter: "Brady Haran + akademikere fra Nottingham",
    url: "https://www.youtube.com/@Computerphile",
    blurb:
      "Korte (5-15 min) intervjuer med faktiske akademikere om CS-konsepter. Sister-kanal til Numberphile.",
    bestVideo: {
      tittel: "Public Key Cryptography",
      url: "https://www.youtube.com/watch?v=GSIDS_lvRv4",
      varighet: "26 min",
    },
    fag: ["DTE-2507 (sikkerhet/krypto)", "DTE-2505 (OS-konsepter)", "alle CS-emner"],
    tier: 1,
    hvorforHer:
      "Mike Pound, David Brailsford, Steve Bagley — kjente forelesere som forklarer ETT konsept om gangen. Perfekt når du sitter fast på pensum og trenger en frisk vinkel.",
  },
  {
    id: "two-minute-papers",
    navn: "Two Minute Papers",
    forfatter: "Károly Zsolnai-Fehér",
    url: "https://www.youtube.com/@TwoMinutePapers",
    blurb:
      "Holder deg oppdatert på AI/grafikk-frontier uten doom-scrolling. Hver video oppsummerer ett research-paper på 5-10 minutter.",
    bestVideo: {
      tittel: "DeepMind's New AI Plays Soccer ⚽",
      url: "https://www.youtube.com/watch?v=KHWuTBmT1oI",
      varighet: "5 min",
    },
    fag: ["DTE-2501 (AI)", "DTE-2502 (Deep Learning)"],
    tier: 1,
    hvorforHer:
      "AI-feltet beveger seg så raskt at lærebøker er utdaterte når de trykkes. Karoly viser deg hva som er nytt uten hype eller AI-doomerism.",
  },
  {
    id: "sebastian-lague",
    navn: "Sebastian Lague",
    forfatter: "Sebastian Lague",
    url: "https://www.youtube.com/@SebastianLague",
    blurb:
      "Bygger visuelle prosjekter fra null — solar systems, ray tracing, marching cubes, neural nets — og lærer deg det underveis.",
    bestVideo: {
      tittel: "Coding Adventure: Solar System",
      url: "https://www.youtube.com/watch?v=7axImc1sxa0",
      varighet: "26 min",
    },
    fag: ["programmeringsprosjekter", "DTE-2511", "valgfag spillgrafikk"],
    tier: 1,
    hvorforHer:
      "Beste eksempel på 'bygg det fra null for å lære det'. Kvaliteten på visualiseringer + pedagogikk er overlegen alle akademiske ressurser jeg har sett.",
  },

  // ============ TIER 2 — sterkt anbefalt ===========================
  {
    id: "ben-eater",
    navn: "Ben Eater",
    forfatter: "Ben Eater",
    url: "https://www.youtube.com/@BenEater",
    blurb:
      "Bygger en 8-bit datamaskin på breadboard — fysiske transistorer/integrerte kretser. Petzold sin bok i video-form, men virkelig.",
    bestVideo: {
      tittel: "How a CPU works",
      url: "https://www.youtube.com/watch?v=cNN_tTXABUA",
      varighet: "9 min",
    },
    fag: ["trinn-1 til trinn-9 (CPU)", "DTE-2505 (lavnivå-OS)"],
    tier: 2,
    hvorforHer:
      "Etter Ben Eaters serie SKJØNNER du hva en CPU faktisk gjør, fordi du har sett en bygges. Komplement til Petzolds bok.",
  },
  {
    id: "neetcode",
    navn: "NeetCode",
    forfatter: "Navdeep Singh",
    url: "https://www.youtube.com/@NeetCode",
    blurb:
      "Algoritmeintervjuer (LeetCode) med klare forklaringer. Ikke bare løsning — han forklarer mønsteret du leter etter.",
    bestVideo: {
      tittel: "Two Sum - Leetcode 1",
      url: "https://www.youtube.com/watch?v=KLlXCFG5TnA",
      varighet: "9 min",
    },
    fag: ["algoritmer", "intervju-prep", "DTE-2511"],
    tier: 2,
    hvorforHer:
      "Hvis du noen gang skal ta tekniske intervjuer (FAANG eller norsk konsulent), er NeetCode hub-kanalen. Roadmap-en på neetcode.io er gull.",
  },
  {
    id: "andrej-karpathy",
    navn: "Andrej Karpathy",
    forfatter: "Andrej Karpathy (ex-Tesla AI, OpenAI)",
    url: "https://www.youtube.com/@AndrejKarpathy",
    blurb:
      "Bygger nevrale nett, GPT-er, autoencoders fra null i Jupyter notebook — live. Ingen abstraksjoner, bare kode.",
    bestVideo: {
      tittel: "Let's build GPT: from scratch, in code, spelled out",
      url: "https://www.youtube.com/watch?v=kCc8FmEb1nY",
      varighet: "1 t 56 min",
    },
    fag: ["DTE-2502 (deep learning)", "DTE-2501 (NLP-delen)"],
    tier: 2,
    hvorforHer:
      "Karpathy lærte hele en generasjon ML-folk via Stanford CS231n. 'Neural Networks: Zero to Hero'-serien hans er den mest verdifulle gratis-AI-utdanningen som finnes.",
  },
  {
    id: "the-coding-train",
    navn: "The Coding Train",
    forfatter: "Daniel Shiffman (NYU ITP)",
    url: "https://www.youtube.com/@TheCodingTrain",
    blurb:
      "Kreativ koding — p5.js, ML-intro, generativ kunst. Energisk og leken stil som gjør koding morsom.",
    bestVideo: {
      tittel: "Code! Programming with p5.js",
      url: "https://www.youtube.com/watch?v=8j0UDiN7my4",
      varighet: "9 min",
    },
    fag: ["JavaScript / web-prosjekter", "DTE-2501 (genetiske algoritmer)"],
    tier: 2,
    hvorforHer:
      "Shiffman er den eneste koderen på YouTube som virker som han faktisk LIKER det. Kanal å se når du er sliten av pensum men vil bli inspirert.",
  },
  {
    id: "fireship",
    navn: "Fireship",
    forfatter: "Jeff Delaney",
    url: "https://www.youtube.com/@Fireship",
    blurb:
      "100-sekunders forklaringer av moderne web-tech: framework-X, language-Y, database-Z. Hurtig oppsummering uten fluff.",
    bestVideo: {
      tittel: "100+ Web Development Things you Should Know",
      url: "https://www.youtube.com/watch?v=erEgovG9WBs",
      varighet: "12 min",
    },
    fag: ["DTE-2509 (web)", "moderne stack-orientering"],
    tier: 2,
    hvorforHer:
      "Når du møter et nytt buzzword (htmx, tRPC, Bun, Astro), Fireship har sannsynligvis en 100-sek-video som forklarer hva det er og om du bør bry deg.",
  },

  // ============ TIER 3 — situasjonelt =============================
  {
    id: "mit-ocw",
    navn: "MIT OpenCourseWare",
    forfatter: "MIT (åpne forelesninger)",
    url: "https://www.youtube.com/@mitocw",
    blurb:
      "Fulle MIT-forelesninger gratis. 6.006 (algoritmer), 6.S081 (OS), 6.034 (AI) er gull.",
    bestVideo: {
      tittel: "1. Algorithmic Thinking, Peak Finding (6.006)",
      url: "https://www.youtube.com/watch?v=HtSuA80QTyo",
      varighet: "53 min",
    },
    fag: ["alle CS-emner", "spesielt for dypere fundament"],
    tier: 3,
    hvorforHer:
      "Når lærer-pensumet ikke holder og du vil ha den DYPESTE forklaringen som finnes — MIT-forelesere som Erik Demaine forklarer på et nivå alle norske universitet ser opp til.",
  },
  {
    id: "stanford-online",
    navn: "Stanford Online",
    forfatter: "Stanford (kursvideoer)",
    url: "https://www.youtube.com/@stanfordonline",
    blurb:
      "Andrew Ng, Fei-Fei Li, Christopher Manning — Stanfords ML/AI-stjerner gratis tilgjengelig.",
    bestVideo: {
      tittel: "Lecture 1 - Introduction to ML | Stanford CS229: Machine Learning (Autumn 2018) - Andrew Ng",
      url: "https://www.youtube.com/watch?v=jGwO_UgTS7I",
      varighet: "1 t 17 min",
    },
    fag: ["DTE-2501", "DTE-2602", "DTE-2502"],
    tier: 3,
    hvorforHer:
      "Andrew Ng's CS229 er der nesten alle moderne ML-ingeniører lærte fundamentene. Stanford CS231n (Karpathy/Justin Johnson) er det samme for deep learning.",
  },
  {
    id: "strangeloop-goto",
    navn: "Strange Loop & GOTO Conferences",
    forfatter: "Konferanse-foredrag",
    url: "https://www.youtube.com/@StrangeLoopConf",
    blurb:
      "1-times-foredrag fra forskere/ingeniører som har formet feltet. Evergreen — videoer fra 2014 er fortsatt relevante.",
    bestVideo: {
      tittel: "Simple Made Easy — Rich Hickey",
      url: "https://www.youtube.com/watch?v=SxdOUGdseq4",
      varighet: "1 t 1 min",
    },
    fag: ["software-design generelt", "DTE-2604 Systemutvikling"],
    tier: 3,
    hvorforHer:
      "Når du har nok pensum-energi til å tenke OVER teknikkene — store ideer fra Joe Armstrong, Bret Victor, Hillel Wayne, Rich Hickey. Forandrer hvordan du tenker.",
  },
];
