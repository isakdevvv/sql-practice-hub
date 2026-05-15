/**
 * 10 gratis universitetskurs som matcher DTE-bachelor-pensumet.
 * Hvert kurs valgt fordi det er BEST i sin kategori — ikke fordi det er
 * mest populært eller har flest registreringer.
 */
export interface Mooc {
  id: string;
  navn: string;
  universitet: string;
  forelesere: string;
  url: string;
  /** Realistisk tidsbruk — IKKE marketing-tall. */
  estimertTid: string;
  fag: string[];
  /** Top 3 forelesninger som beviser kvaliteten. */
  bestForelesninger: { tittel: string; url?: string; varighet?: string }[];
  hvorforHer: string;
  /** Coursera/EdX/YouTube/eget-domene. */
  plattform: string;
  free: boolean;
  tier: 1 | 2 | 3;
}

export const MOOCS: readonly Mooc[] = [
  // ============ TIER 1 — fundament ================================
  {
    id: "harvard-cs50",
    navn: "CS50: Introduction to Computer Science",
    universitet: "Harvard",
    forelesere: "David J. Malan",
    url: "https://cs50.harvard.edu/x/",
    plattform: "edX (gratis) eller direkte fra cs50.harvard.edu",
    estimertTid: "10-12 uker, ~10t/uke (men fleksibelt)",
    fag: ["trinn-fagene", "DTE-2511 (vid. programmering)", "Python+C+SQL+JS-orientering"],
    bestForelesninger: [
      { tittel: "Lecture 0: Scratch", varighet: "2t (motivasjon + binær tall-system)" },
      { tittel: "Lecture 4: Memory (pekere i C)", varighet: "2t" },
      { tittel: "Lecture 7: SQL", varighet: "2t" },
    ],
    hvorforHer:
      "Malan er en stjerne-foreleser. CS50 dekker C, Python, SQL, JS, Flask — bredt nok til å treffe halvparten av bachelor-pensumet, og morsomt nok til å fullføre. 4M+ studenter har tatt det.",
    free: true,
    tier: 1,
  },
  {
    id: "mit-6006",
    navn: "6.006 Introduction to Algorithms",
    universitet: "MIT",
    forelesere: "Erik Demaine, Justin Solomon, m.fl.",
    url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/",
    plattform: "MIT OpenCourseWare (alle videoer + problem sets gratis)",
    estimertTid: "13 uker, ~12t/uke (krevende men dypt)",
    fag: ["algoritmer", "DTE-2511", "intervju-prep"],
    bestForelesninger: [
      { tittel: "1. Algorithmic Thinking, Peak Finding", varighet: "53 min" },
      { tittel: "11. Hashing", varighet: "1t 19 min" },
      { tittel: "21. Dynamic Programming", varighet: "1t 23 min" },
    ],
    hvorforHer:
      "Erik Demaine er en av verdens beste pedagoger på algoritmer. CLRS-boka er pensum, men forelesningene gir intuisjon CLRS mangler. Gull for alt fra kompleksitet til DP.",
    free: true,
    tier: 1,
  },
  {
    id: "stanford-cs229",
    navn: "CS229: Machine Learning",
    universitet: "Stanford",
    forelesere: "Andrew Ng (klassisk versjon)",
    url: "https://www.youtube.com/playlist?list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU",
    plattform: "YouTube (Stanford Online) + cs229.stanford.edu for problem sets",
    estimertTid: "20 forelesninger × 1t 15min = ~25t",
    fag: ["DTE-2602 (ML intro)", "DTE-2501 (AI Methods)"],
    bestForelesninger: [
      { tittel: "Lecture 1: Introduction (Andrew Ng)", varighet: "1t 17 min" },
      { tittel: "Lecture 4: Generalized Linear Models", varighet: "1t 16 min" },
      { tittel: "Lecture 8: Bias-Variance, Regularization", varighet: "1t 18 min" },
    ],
    hvorforHer:
      "Andrew Ng er DEN utbredte ML-foreleseren. Hans Coursera-versjon er forenklet; Stanford CS229 er hans MASTER-nivå-kurs på YouTube. Fundament for alt videre i ML.",
    free: true,
    tier: 1,
  },

  // ============ TIER 2 — fag-spesifikke ============================
  {
    id: "mit-6s081",
    navn: "6.S081 (6.1810) Operating System Engineering",
    universitet: "MIT",
    forelesere: "Frans Kaashoek, Robert Morris",
    url: "https://pdos.csail.mit.edu/6.828/2024/schedule.html",
    plattform: "MIT egen-side (videoer + xv6-lab)",
    estimertTid: "13 uker, ~15t/uke (krevende)",
    fag: ["DTE-2505 OS"],
    bestForelesninger: [
      { tittel: "Lecture 1: Operating system organization" },
      { tittel: "Lecture 4: Page tables" },
      { tittel: "Lecture 13: File systems" },
    ],
    hvorforHer:
      "Det BESTE OS-kurset i verden. Du implementerer xv6 (en mini-Unix) selv. OSTEP-boka er parallell-pensum. Hvis du vil bli en faktisk OS-utvikler, går du gjennom denne.",
    free: true,
    tier: 2,
  },
  {
    id: "stanford-cs144",
    navn: "CS144: Computer Networking",
    universitet: "Stanford",
    forelesere: "Nick McKeown, Philip Levis",
    url: "https://cs144.github.io/",
    plattform: "Stanford egen-side + YouTube",
    estimertTid: "10 uker, ~12t/uke",
    fag: ["DTE-2507 Datakommunikasjon"],
    bestForelesninger: [
      { tittel: "1.1: A day in the life of an application" },
      { tittel: "3.1: TCP service model" },
      { tittel: "4.1: Routing — IP service model" },
    ],
    hvorforHer:
      "Implementer din egen TCP-stakk i C++ over kurset. Kurose-boka er pensum. Etter dette kurset SKJØNNER du nettverk på en helt annen måte enn etter forelesninger på UiT.",
    free: true,
    tier: 2,
  },
  {
    id: "stanford-cs231n",
    navn: "CS231n: Deep Learning for Computer Vision",
    universitet: "Stanford",
    forelesere: "Fei-Fei Li, Andrej Karpathy, Justin Johnson",
    url: "https://cs231n.stanford.edu/",
    plattform: "Stanford egen-side + YouTube (Karpathys versjon 2016 er kult-klassisk)",
    estimertTid: "10 uker, ~12t/uke",
    fag: ["DTE-2502 Deep Learning", "DTE-2602 (CV-delen)"],
    bestForelesninger: [
      { tittel: "Lecture 4: Backpropagation and Neural Networks" },
      { tittel: "Lecture 5: Convolutional Neural Networks" },
      { tittel: "Lecture 11: Detection and Segmentation" },
    ],
    hvorforHer:
      "Karpathys 2016-versjon på YouTube er fortsatt der nye ML-folk lærer CNN. Han er nå hos OpenAI/Tesla. Kombineres godt med Karpathys 'Zero to Hero'-serie på YouTube.",
    free: true,
    tier: 2,
  },
  {
    id: "cmu-15445",
    navn: "15-445 Database Systems",
    universitet: "Carnegie Mellon",
    forelesere: "Andy Pavlo (legendarisk DB-foreleser)",
    url: "https://15445.courses.cs.cmu.edu/",
    plattform: "CMU egen-side + YouTube",
    estimertTid: "13 uker, ~15t/uke (du implementerer en mini-DBMS)",
    fag: ["DTE-2509 Databaser", "videregående DB"],
    bestForelesninger: [
      { tittel: "Lecture 1: Course Introduction & Relational Model" },
      { tittel: "Lecture 7: B+Tree Indexes" },
      { tittel: "Lecture 16: Concurrency Control Theory" },
    ],
    hvorforHer:
      "Andy Pavlo er DB-pedagogikkens Andrew Ng. Dropper Hawaii-skjorter og forklarer B-tree-internals slik at du SKJØNNER hvorfor Postgres/MySQL er bygd som de er. Bachelor-prosjekt om database? Se denne.",
    free: true,
    tier: 2,
  },

  // ============ TIER 3 — alternativer / dypere ====================
  {
    id: "berkeley-cs61a",
    navn: "CS61A: Structure and Interpretation of Computer Programs",
    universitet: "Berkeley",
    forelesere: "John DeNero (basert på SICP)",
    url: "https://cs61a.org/",
    plattform: "Berkeley egen-side + YouTube",
    estimertTid: "14 uker, ~12t/uke",
    fag: ["DTE-2511 (alternativ tilnærming)", "funksjonell programmering"],
    bestForelesninger: [
      { tittel: "Lecture 1: Computer Science (intro til Python via abstraksjon)" },
      { tittel: "Lecture 17: Recursive Objects" },
      { tittel: "Lecture 24: Interpreters" },
    ],
    hvorforHer:
      "Berkeleys svar på SICP-tradisjonen, men bruker Python (ikke Scheme). Lærer programmering som ABSTRAKSJON, ikke som syntaks. Annerledes filosofi enn UiT-fagene — verdt det hvis du vil tenke som en lisp-er.",
    free: true,
    tier: 3,
  },
  {
    id: "mit-6s191",
    navn: "6.S191: Introduction to Deep Learning",
    universitet: "MIT",
    forelesere: "Alexander Amini, Ava Soleimany",
    url: "http://introtodeeplearning.com/",
    plattform: "MIT egen-side + YouTube",
    estimertTid: "1 uke (intensiv) eller 6 uker (vanlig)",
    fag: ["DTE-2502 (kortere intro enn CS231n)"],
    bestForelesninger: [
      { tittel: "Lecture 1: Introduction to Deep Learning" },
      { tittel: "Lecture 4: Deep Generative Modeling" },
      { tittel: "Lecture 5: Reinforcement Learning" },
    ],
    hvorforHer:
      "Mer kompakt enn CS231n. MIT kjører dette som en uke-lang intensiv-bootcamp i januar. Perfekt forberedelse til DTE-2502 hvis du vil ha en raskere intro enn Stanford.",
    free: true,
    tier: 3,
  },
  {
    id: "harvard-cs50w",
    navn: "CS50's Web Programming with Python and JavaScript",
    universitet: "Harvard",
    forelesere: "Brian Yu",
    url: "https://cs50.harvard.edu/web/",
    plattform: "edX (gratis) + YouTube",
    estimertTid: "12 uker, ~12t/uke",
    fag: ["DTE-2509 Databaser/web", "DTE-2511"],
    bestForelesninger: [
      { tittel: "Lecture 3: Django (Flask-aktig)" },
      { tittel: "Lecture 6: SQL, Models, and Migrations" },
      { tittel: "Lecture 8: JavaScript" },
    ],
    hvorforHer:
      "Etter CS50: dypere på web. Bruker Django (ikke Flask) men prinsippene overlapper. Treffer DTE-2509 sin web-del godt og lærer deg JS+React-oppsett.",
    free: true,
    tier: 3,
  },
];
