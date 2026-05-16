// Sentralt register over alle interaktive visualiseringer i appen.
// Brukes av `/visualiseringer`-galleriruten og `<RelatedVisualizers>`-komponenten.
//
// Hver oppføring har:
//   slug         — unik nokkel, ofte lik kursside-slug + (evt) -<suffix> for flere
//                  visualizere pa samme side. Brukes som referanse i `related`.
//   title        — kort kort-tittel (vises i galleri og i Se-ogsa-blokker).
//   description  — 1 setning om hva man kan utforske/leke med.
//   page         — kursside-slug (rutene under `/stack/<slug>`).
//   anchor       — id pa kursside-section som inneholder visualizeren (uten `#`).
//                  Hvis undefined linkes det bare til siden.
//   domain       — domene-tag for filtrering.
//   icon         — navn pa illustrasjon fra `src/components/illustrations/`.
//   related      — andre `slug`er fra dette registeret som gir et komplementaert
//                  perspektiv pa samme idé fra en annen abstraksjonsnivaa.

export type VisualizerDomain =
  | "DB"
  | "Nettverk"
  | "OS"
  | "Hardware"
  | "Algoritmer"
  | "Krypto"
  | "ML/Stats";

export type VisualizerIcon =
  | "DatabaseCylinder"
  | "BTreeIcon"
  | "TableGrid"
  | "Indexes"
  | "RouterIcon"
  | "SwitchIcon"
  | "Packet"
  | "Cloud"
  | "HostIcon"
  | "CpuChip"
  | "RamStick"
  | "Disk"
  | "Process"
  | "Stack"
  | "TreeNode"
  | "GraphNode"
  | "BarChart"
  | "Heap"
  | "Neuron"
  | "LossCurve"
  | "ScatterPlot"
  | "Lock"
  | "Key"
  | "Shield";

export type VisualizerEntry = {
  slug: string;
  title: string;
  description: string;
  page: string;
  anchor?: string;
  domain: VisualizerDomain;
  icon: VisualizerIcon;
  related: string[];
};

export const VISUALIZERS: VisualizerEntry[] = [
  // ─────────────────────────────────────────────────────────────────
  // DB
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "indekser",
    title: "Indekser — B-tree og hash",
    description:
      "Bygg en B-tree-indeks rad for rad, og se forskjellen mot hash-indeks pa range-sok.",
    page: "indekser",
    anchor: "btree",
    domain: "DB",
    icon: "BTreeIcon",
    related: ["traer", "query-plan", "query-multi-lag"],
  },
  {
    slug: "query-plan",
    title: "Query-plan visualizer",
    description:
      "Tegn EXPLAIN-treet fra SELECT-spørringer og se kostnad pr. operator.",
    page: "query-optimisering",
    anchor: "plan-vis",
    domain: "DB",
    icon: "DatabaseCylinder",
    related: ["query-multi-lag", "indekser", "traer"],
  },
  {
    slug: "query-multi-lag",
    title: "Query-flere-lag",
    description:
      "Se hvordan en spørring fluktuerer gjennom parser → planlegger → eksekverer.",
    page: "query-optimisering",
    anchor: "faser",
    domain: "DB",
    icon: "DatabaseCylinder",
    related: ["query-plan", "indekser", "transaksjoner"],
  },
  {
    slug: "transaksjoner",
    title: "Transaksjoner — isolation og deadlocks",
    description:
      "Simuler to samtidige transaksjoner og se hvordan isolation-nivaa endrer utfallet.",
    page: "transaksjoner",
    anchor: "vis",
    domain: "DB",
    icon: "DatabaseCylinder",
    related: ["query-plan", "indekser"],
  },
  {
    slug: "normalisering",
    title: "Normalisering — 1NF→3NF",
    description:
      "Dra og dekomponer tabeller for a illustrere 1NF, 2NF og 3NF steg for steg.",
    page: "normalisering",
    domain: "DB",
    icon: "TableGrid",
    related: ["indekser", "transaksjoner"],
  },

  // ─────────────────────────────────────────────────────────────────
  // Nettverk
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "osi-lag",
    title: "OSI / TCP-IP lag",
    description:
      "Pakk en HTTP-melding nedover stakken — header for header — og opp igjen pa mottakeren.",
    page: "osi-tcpip",
    anchor: "visualisering",
    domain: "Nettverk",
    icon: "Packet",
    related: ["transportlag", "arp-detektiv", "delay-modell", "nat"],
  },
  {
    slug: "transportlag",
    title: "TCP-handshake og glidende vindu",
    description:
      "Tre-veis handshake, sliding window og congestion control som animert state-machine.",
    page: "transportlag",
    anchor: "tcp-visualizer",
    domain: "Nettverk",
    icon: "Packet",
    related: ["osi-lag", "rdt-progresjon", "delay-modell", "http2"],
  },
  {
    slug: "rdt-progresjon",
    title: "rdt 1.0 → 3.0",
    description:
      "Bygg palitelig dataoverføring trinnvis — fra perfekt kanal til tap og duplisering.",
    page: "dte2507-rdt-progresjon",
    anchor: "visualizer",
    domain: "Nettverk",
    icon: "Packet",
    related: ["transportlag", "osi-lag", "ap-progresjon"],
  },
  {
    slug: "ap-progresjon",
    title: "ap 1.0 → 4.0 autentisering",
    description:
      "Knekke svake autentiseringsprotokoller, sa bygg dem solide med nonce og MAC.",
    page: "dte2507-ap-progresjon",
    anchor: "ap10",
    domain: "Nettverk",
    icon: "Shield",
    related: ["rdt-progresjon", "kryptografi", "transportlag"],
  },
  {
    slug: "csma",
    title: "CSMA/CD — kollisjoner",
    description:
      "Simuler delt medium der noder slass om sending med exponential backoff.",
    page: "dte2507-ap-progresjon",
    anchor: "csma",
    domain: "Nettverk",
    icon: "SwitchIcon",
    related: ["arp-detektiv", "delay-modell", "osi-lag"],
  },
  {
    slug: "arp-detektiv",
    title: "ARP — IP til MAC",
    description:
      "Følg en ARP-request gjennom et lokalnett og se ARP-cachen vokse fram.",
    page: "dte2507-arp-detektiv",
    anchor: "visualisering",
    domain: "Nettverk",
    icon: "SwitchIcon",
    related: ["osi-lag", "nat", "csma"],
  },
  {
    slug: "nat",
    title: "NAT — én offentlig IP",
    description:
      "Lek med NAT-tabellen — se intern : ekstern oversetting per port.",
    page: "dte2507-nat",
    anchor: "visualizer",
    domain: "Nettverk",
    icon: "RouterIcon",
    related: ["osi-lag", "arp-detektiv", "delay-modell"],
  },
  {
    slug: "delay-modell",
    title: "De fire forsinkelsene",
    description:
      "Drei pa knapper for prop / trans / proc / queue og se total end-to-end-tid.",
    page: "dte2507-delay-modell",
    anchor: "sim",
    domain: "Nettverk",
    icon: "RouterIcon",
    related: ["transportlag", "osi-lag", "web-caching", "http2"],
  },
  {
    slug: "http2",
    title: "HTTP/1.1 vs HTTP/2 — HOL",
    description:
      "Sammenlign sekvensiell, parallell og multiplexed lasting — se head-of-line-blokkering visuelt.",
    page: "dte2507-http2-hol",
    anchor: "sim",
    domain: "Nettverk",
    icon: "Cloud",
    related: ["transportlag", "delay-modell", "web-caching"],
  },
  {
    slug: "web-caching",
    title: "Web-caching matematikk",
    description:
      "Plot trafikkintensitet og hit-rate — se hvor mye en cache kutter forsinkelse.",
    page: "dte2507-web-caching-matte",
    anchor: "sim",
    domain: "Nettverk",
    icon: "Cloud",
    related: ["http2", "delay-modell", "transportlag"],
  },

  // ─────────────────────────────────────────────────────────────────
  // OS
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "prosesser-signaler",
    title: "Prosesser, signaler og tilstander",
    description:
      "Send SIGTERM/SIGKILL/SIGSTOP og se prosess-livssyklusen bevege seg mellom tilstander.",
    page: "dte2505-prosesser-signaler",
    anchor: "livssyklus",
    domain: "OS",
    icon: "Process",
    related: ["c-minne", "assembly", "rekursjon"],
  },

  // ─────────────────────────────────────────────────────────────────
  // Hardware
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "transistor",
    title: "Transistoren som bryter",
    description:
      "Sett gate-spenningen og se elektronene strømme gjennom NMOS / PMOS.",
    page: "trinn-1-transistor",
    anchor: "visualisering",
    domain: "Hardware",
    icon: "CpuChip",
    related: ["nand-porter", "adders", "cpu"],
  },
  {
    slug: "nand-porter",
    title: "NAND og logiske porter",
    description:
      "Bygg AND, OR, NOT, XOR fra NAND og se sannhetstabellen utvikle seg live.",
    page: "trinn-2-nand-porter",
    anchor: "visualizer",
    domain: "Hardware",
    icon: "CpuChip",
    related: ["transistor", "adders", "cpu"],
  },
  {
    slug: "adders",
    title: "Adders & flip-flops",
    description:
      "Halv-adder, full-adder og ripple-carry — se bitene boble gjennom kretsen.",
    page: "trinn-3-adders",
    anchor: "viz",
    domain: "Hardware",
    icon: "CpuChip",
    related: ["nand-porter", "cpu", "bits-dyp", "bytes-encoding"],
  },
  {
    slug: "cpu",
    title: "CPU — fetch / decode / execute",
    description:
      "Stepp gjennom CPU-syklusen og se hvordan registre og minne oppdateres.",
    page: "trinn-4-cpu",
    anchor: "visualisering",
    domain: "Hardware",
    icon: "CpuChip",
    related: ["adders", "assembly", "c-minne", "bits-dyp"],
  },
  {
    slug: "assembly",
    title: "Assembly & maskinkode",
    description:
      "Sporing av x86-instruksjoner — se hvordan stack-framen vokser pa kall.",
    page: "trinn-5-assembly",
    anchor: "trace",
    domain: "Hardware",
    icon: "Stack",
    related: ["cpu", "c-minne", "rekursjon", "lenkede-strukturer"],
  },
  {
    slug: "c-minne",
    title: "C — minne og pekere",
    description:
      "Se stack, heap og pekere live mens du allokerer og frigjør minne.",
    page: "trinn-6-c-minne",
    anchor: "visualiser",
    domain: "Hardware",
    icon: "RamStick",
    related: ["assembly", "lenkede-strukturer", "bits-dyp", "bytes-encoding"],
  },
  {
    slug: "bits-dyp",
    title: "Bits — signed / float / endian",
    description:
      "Bla mellom unsigned, two's complement, IEEE-754 og endian-rekkefølge bit for bit.",
    page: "trinn-7-bytes-dyp",
    anchor: "bit-vis",
    domain: "Hardware",
    icon: "CpuChip",
    related: ["bytes-encoding", "adders", "c-minne"],
  },
  {
    slug: "bytes-encoding",
    title: "Bytes & encoding",
    description:
      "Encode samme tekst i ASCII, Latin-1 og UTF-8 og se byte-strømmen sammenlignet.",
    page: "bytes-encoding",
    domain: "Hardware",
    icon: "CpuChip",
    related: ["bits-dyp", "c-minne", "adders"],
  },

  // ─────────────────────────────────────────────────────────────────
  // Algoritmer
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "big-o",
    title: "Big-O kurve-utforsker",
    description:
      "Plot O(1) → O(n²) → O(2ⁿ) side om side og se hvor fort de eksploderer.",
    page: "big-o",
    anchor: "viz",
    domain: "Algoritmer",
    icon: "LossCurve",
    related: ["sortering", "sok-algoritmer-ai", "dynamic-programming"],
  },
  {
    slug: "rekursjon",
    title: "Rekursjon — kallstack",
    description:
      "Se kallstacken vokse pa hvert rekursivt kall, og brette seg ned med returverdier.",
    page: "rekursjon",
    anchor: "visualisering",
    domain: "Algoritmer",
    icon: "Stack",
    related: ["lenkede-strukturer", "assembly", "dynamic-programming", "traer"],
  },
  {
    slug: "sortering",
    title: "Sortering — animasjon",
    description:
      "Sammenlign bubble / insertion / merge / quick / heap pa samme array side om side.",
    page: "sortering",
    anchor: "interaktiv",
    domain: "Algoritmer",
    icon: "BarChart",
    related: ["big-o", "sok-algoritmer-ai", "lenkede-strukturer"],
  },
  {
    slug: "lenkede-strukturer",
    title: "Lenket liste, stack, kø, prioritetskø",
    description:
      "Push, pop og enqueue pa fire datastrukturer — toggle mellom modusene.",
    page: "lenkede-strukturer",
    anchor: "visualisering",
    domain: "Algoritmer",
    icon: "Stack",
    related: ["rekursjon", "assembly", "c-minne", "traer", "hashing"],
  },
  {
    slug: "traer",
    title: "Trær — BST, AVL, traversering",
    description:
      "Bygg et binært søketre node for node og se hvordan balansering re-roterer det.",
    page: "traer",
    anchor: "visualisering",
    domain: "Algoritmer",
    icon: "TreeNode",
    related: ["indekser", "grafer", "query-plan", "hashing"],
  },
  {
    slug: "grafer",
    title: "Grafer — BFS / DFS / Dijkstra / MST / A*",
    description:
      "Tegn en graf og se hvilke noder hver algoritme besøker, og i hvilken rekkefølge.",
    page: "grafer-dypere",
    anchor: "interaktiv",
    domain: "Algoritmer",
    icon: "GraphNode",
    related: ["sok-algoritmer-ai", "traer", "dynamic-programming"],
  },
  {
    slug: "hashing",
    title: "Hash-tabell — open addressing / chaining",
    description:
      "Sett inn nokler og se kollisjoner, probing og rehashing pa nært hold.",
    page: "hashing-dypere",
    anchor: "visualisering",
    domain: "Algoritmer",
    icon: "Indexes",
    related: ["indekser", "traer", "lenkede-strukturer"],
  },
  {
    slug: "dynamic-programming",
    title: "DP — memo vs. tabulering",
    description:
      "Se memo-treet shrinke til en tabell pa fib, coin change og knapsack.",
    page: "dynamic-programming",
    anchor: "interaktiv",
    domain: "Algoritmer",
    icon: "BarChart",
    related: ["rekursjon", "big-o", "tsp-dp", "grafer"],
  },
  {
    slug: "tsp-dp",
    title: "TSP — Held-Karp DP",
    description:
      "Bitmask-DP for handelsreisende — se bittmaske-tabellen fylles inn celle for celle.",
    page: "dte2501-dp",
    anchor: "held-karp-vis",
    domain: "Algoritmer",
    icon: "GraphNode",
    related: ["dynamic-programming", "grafer", "sok-algoritmer-ai"],
  },
  {
    slug: "sok-algoritmer-ai",
    title: "Søk i AI — BFS / DFS / IDS / A*",
    description:
      "Slipp en agent løs i en labyrint og sammenlign uninformerte vs. informerte søk.",
    page: "sok-algoritmer",
    anchor: "astar",
    domain: "Algoritmer",
    icon: "GraphNode",
    related: ["grafer", "dynamic-programming", "rekursjon"],
  },

  // ─────────────────────────────────────────────────────────────────
  // Krypto
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "kryptografi",
    title: "Kryptografi — symmetrisk vs. asymmetrisk",
    description:
      "Krypter, dekrypter, sign og verifiser — alt i én sandkasse med synlige nokler.",
    page: "kryptografi",
    anchor: "krypto-visualizer",
    domain: "Krypto",
    icon: "Lock",
    related: ["ap-progresjon", "transportlag"],
  },

  // ─────────────────────────────────────────────────────────────────
  // ML / Statistikk
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "nn-intro",
    title: "Nevralt nett — neuron",
    description:
      "Tegn én neuron med vekter, bias og aktivering — toggle ReLU / sigmoid / tanh.",
    page: "nn-intro",
    anchor: "visualizer",
    domain: "ML/Stats",
    icon: "Neuron",
    related: ["backprop", "supervised-learning", "logreg", "cnn", "optimering"],
  },
  {
    slug: "backprop",
    title: "Backpropagation — gradient-flyt",
    description:
      "Forward-pass, deretter omvendt — se gradienter strømme bakover gjennom nettet.",
    page: "backprop-dyp",
    anchor: "visualizer",
    domain: "ML/Stats",
    icon: "Neuron",
    related: ["nn-intro", "optimering", "supervised-learning", "cnn"],
  },
  {
    slug: "cnn",
    title: "CNN — konvolusjon og pooling",
    description:
      "Skyv et 3x3-filter over et bilde og se feature-mappet bli bygd opp celle for celle.",
    page: "cnn",
    anchor: "visualisering",
    domain: "ML/Stats",
    icon: "Neuron",
    related: ["nn-intro", "backprop", "supervised-learning"],
  },
  {
    slug: "optimering",
    title: "Gradient descent — optimerere",
    description:
      "SGD, Momentum, Adam pa samme loss-flate — se hvem som finner minimum først.",
    page: "optimering",
    anchor: "visualisering",
    domain: "ML/Stats",
    icon: "LossCurve",
    related: ["backprop", "logreg", "nn-intro"],
  },
  {
    slug: "supervised-learning",
    title: "Supervised learning — konfusjonsmatrise",
    description:
      "Treningssett pa scatterplot, tren en modell og se konfusjonsmatrisen oppdateres.",
    page: "supervised-learning",
    anchor: "visualisering",
    domain: "ML/Stats",
    icon: "ScatterPlot",
    related: ["logreg", "bayes-grid", "anova", "nn-intro", "cv-varianter"],
  },
  {
    slug: "logreg",
    title: "Logistisk regresjon — beslutningsgrense",
    description:
      "Dra punkter rundt og se beslutningslinjen, ROC-kurven og loss-en oppdateres live.",
    page: "dte2602-logistisk-regresjon",
    anchor: "visualisering",
    domain: "ML/Stats",
    icon: "ScatterPlot",
    related: ["supervised-learning", "optimering", "bayes-grid", "nn-intro"],
  },
  {
    slug: "cv-varianter",
    title: "Cross-validation-varianter",
    description:
      "K-fold, stratified, group, time-series — se hvilke rader som havner i hver fold.",
    page: "dte2602-cv-varianter",
    domain: "ML/Stats",
    icon: "TableGrid",
    related: ["supervised-learning", "logreg", "anova"],
  },
  {
    slug: "gmm",
    title: "Gaussian Mixture Models — EM",
    description:
      "Se EM-algoritmen alternere mellom E- og M-steg og tilpasse to gaussiske klynger.",
    page: "dte2501-gmm",
    anchor: "em-detail",
    domain: "ML/Stats",
    icon: "ScatterPlot",
    related: ["bayes-grid", "supervised-learning", "logreg"],
  },
  {
    slug: "bayes-grid",
    title: "Sannsynlighet — Bayes-grid",
    description:
      "Plott prior, likelihood og posterior side om side mens du justerer evidens.",
    page: "sannsynlighet",
    anchor: "visualisering",
    domain: "ML/Stats",
    icon: "BarChart",
    related: ["anova", "supervised-learning", "logreg", "gmm"],
  },
  {
    slug: "anova",
    title: "ANOVA — F-test",
    description:
      "Dra gruppemiddelverdier og varianser — se F-statistikken og p-verdien oppdateres.",
    page: "tek1-anova",
    domain: "ML/Stats",
    icon: "BarChart",
    related: ["bayes-grid", "supervised-learning", "logreg", "cv-varianter"],
  },
];

export const DOMAINS: VisualizerDomain[] = [
  "DB",
  "Nettverk",
  "OS",
  "Hardware",
  "Algoritmer",
  "Krypto",
  "ML/Stats",
];

export function getVisualizerBySlug(slug: string): VisualizerEntry | undefined {
  return VISUALIZERS.find((v) => v.slug === slug);
}

export function getRelatedVisualizers(slug: string): VisualizerEntry[] {
  const entry = getVisualizerBySlug(slug);
  if (!entry) return [];
  return entry.related
    .map((s) => getVisualizerBySlug(s))
    .filter((v): v is VisualizerEntry => Boolean(v));
}

export function buildPageHref(entry: VisualizerEntry): string {
  return entry.anchor
    ? `/stack/${entry.page}#${entry.anchor}`
    : `/stack/${entry.page}`;
}
