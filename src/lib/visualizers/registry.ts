// ---------------------------------------------------------------------------
// Visualizer-katalog. Hver post peker til en interaktiv komponent på en
// kurs-side. Brukes av /visualiseringer-ruten for å gjøre dem oppdagbare
// utenfor sin egen kurskontekst.
//
// Når du legger til en ny interaktiv visualizer på en side: legg en post her
// med riktig route (inkl. #anchor hvis den ligger i en seksjon).
// ---------------------------------------------------------------------------

export type VizCategory =
  | "hardware-stakk"
  | "os"
  | "nettverk"
  | "database"
  | "algoritmer"
  | "ml"
  | "statistikk"
  | "sikkerhet"
  | "python"
  | "matematikk";

export type VizEntry = {
  id: string; // unik slug
  title: string;
  blurb: string; // én linje
  category: VizCategory;
  route: string; // /stack/<slug>[#anchor]
  tags: string[]; // for søk — inkluderer aliaser, fagkoder, norske og engelske termer
};

export const VIZ_CATEGORIES: { id: VizCategory; label: string; sub: string }[] = [
  { id: "hardware-stakk", label: "Hardware-stakk", sub: "transistor → flask, trinn 1–10" },
  { id: "os", label: "Operativsystem", sub: "scheduling, virtuelt minne, prosesser" },
  { id: "nettverk", label: "Nettverk", sub: "TCP/IP, ruting, sockets, sikkerhet" },
  { id: "database", label: "Database", sub: "indekser, transaksjoner, query-planer" },
  { id: "algoritmer", label: "Algoritmer & datastrukturer", sub: "sortering, trær, hashing, DP" },
  { id: "ml", label: "Maskinlæring", sub: "supervised, unsupervised, gradient descent, NN" },
  { id: "statistikk", label: "Statistikk", sub: "sannsynlighet, ANOVA, bootstrap" },
  { id: "sikkerhet", label: "Sikkerhet & krypto", sub: "Caesar → RSA, CBC, AES-GCM" },
  { id: "python", label: "Python", sub: "step-debugger og iterator-modell" },
  { id: "matematikk", label: "Matematikk", sub: "diskret matte og funksjons-typer" },
];

export const VISUALIZERS: VizEntry[] = [
  // ──── HARDWARE-STAKK (trinn 1–10) ──────────────────────────────────────
  {
    id: "transistor",
    title: "Transistor — NMOS, NAND, CMOS",
    blurb: "NMOS-bryter med vannmetafor, NOT/NAND-porter og CMOS-inverteren.",
    category: "hardware-stakk",
    route: "/stack/trinn-1-transistor",
    tags: ["nmos", "cmos", "nand", "transistor", "logiske porter", "trinn 1"],
  },
  {
    id: "gate",
    title: "Logiske porter — sannhetstabell-spill",
    blurb: "AND/OR/NOT/NAND/NOR/XOR med klikkbare inn-bits og levende output.",
    category: "hardware-stakk",
    route: "/stack/trinn-2-nand-porter",
    tags: ["and", "or", "xor", "porter", "boolsk", "trinn 2"],
  },
  {
    id: "adder",
    title: "Adders — half + full + ripple",
    blurb: "Bygg en 4-bit adder fra half-adder og full-adder, se carry propagere.",
    category: "hardware-stakk",
    route: "/stack/trinn-3-adders",
    tags: ["adder", "carry", "binær aritmetikk", "trinn 3"],
  },
  {
    id: "cpu",
    title: "CPU — fetch-decode-execute",
    blurb: "Datapath gjennom PC, IR, registre, ALU og minne for hver instruksjon.",
    category: "hardware-stakk",
    route: "/stack/trinn-4-cpu",
    tags: ["cpu", "fetch decode execute", "alu", "registre", "trinn 4"],
  },
  {
    id: "assembly",
    title: "Assembly — registre og stack-frame",
    blurb: "Step gjennom x86-64 assembly med visning av registre og stack.",
    category: "hardware-stakk",
    route: "/stack/trinn-5-assembly",
    tags: ["assembly", "x86-64", "registre", "stack frame", "trinn 5"],
  },
  {
    id: "c-minne-bytes",
    title: "C-minne — bytes på adresser",
    blurb: "Stack vs heap vs pekere, byte for byte med padding og alignment.",
    category: "hardware-stakk",
    route: "/stack/trinn-6-c-minne#visualiser",
    tags: ["c", "minne", "peker", "stack", "heap", "padding", "alignment", "trinn 6"],
  },
  {
    id: "c-minne-livssyklus",
    title: "Minne-livssyklus — C vs Python",
    blurb: "Frames og malloc/free på realistiske ASLR-adresser, med Python-refcount-modus.",
    category: "hardware-stakk",
    route: "/stack/trinn-6-c-minne#livssyklus",
    tags: ["c", "python", "malloc", "free", "refcount", "gc", "dangling", "use-after-free", "trinn 6"],
  },
  {
    id: "bits-dyp",
    title: "Bytes & tall — endian, two's complement, IEEE 754",
    blurb: "Samme bytes tolket som unsigned, signed, float, og forskjellige endians.",
    category: "hardware-stakk",
    route: "/stack/trinn-7-bytes-dyp",
    tags: ["endian", "two's complement", "ieee 754", "float", "bits", "trinn 7"],
  },
  {
    id: "syscalls",
    title: "Syscall-livssyklus — ring 3 ↔ ring 0",
    blurb: "Step gjennom write/open/read/close med CPU-registre og fil-deskriptor-tabell.",
    category: "hardware-stakk",
    route: "/stack/trinn-9-syscalls-dyp#livssyklus",
    tags: ["syscall", "ring 0", "ring 3", "kernel", "fd", "write", "open", "read", "trinn 9"],
  },
  {
    id: "flask-request",
    title: "Request-livssyklus — TCP → Flask → bytes",
    blurb: "GET /hei?navn=Ola gjennom 8 lag: TCP, HTTP, WSGI, Flask, view, Response.",
    category: "hardware-stakk",
    route: "/stack/trinn-10-flask-dyp#livssyklus",
    tags: ["flask", "wsgi", "http", "request", "tcp", "response", "trinn 10"],
  },

  // ──── OS & SYSTEM ─────────────────────────────────────────────────────
  {
    id: "scheduling",
    title: "Scheduling — FCFS, SJF, RR, MLFQ",
    blurb: "Step gjennom CPU-scheduling-algoritmer med Gantt-chart og ventetid.",
    category: "os",
    route: "/stack/dte2505-scheduling-drill",
    tags: ["fcfs", "sjf", "round robin", "mlfq", "scheduler", "gantt", "dte2505"],
  },
  {
    id: "page-replacement",
    title: "Page replacement — FIFO, LRU, Clock",
    blurb: "Se hvilke sider som kastes ved sidefeil for ulike algoritmer.",
    category: "os",
    route: "/stack/dte2505-virtuelt-minne",
    tags: ["paging", "lru", "fifo", "clock", "virtuelt minne", "tlb", "dte2505"],
  },
  {
    id: "process-lifecycle",
    title: "Prosess-livssyklus & signaler",
    blurb: "Fork, exec, wait, exit — og hvordan signaler avbryter en prosess.",
    category: "os",
    route: "/stack/dte2505-prosesser-signaler",
    tags: ["fork", "exec", "signal", "sigint", "sigkill", "prosesser", "dte2505"],
  },
  {
    id: "producer-consumer",
    title: "Producer/Consumer — mutex og semaforer",
    blurb: "Race conditions, kritisk seksjon, semaforer i aksjon.",
    category: "os",
    route: "/stack/dte2505-konkurrens",
    tags: ["mutex", "semafor", "concurrency", "race condition", "dte2505"],
  },

  // ──── NETTVERK ────────────────────────────────────────────────────────
  {
    id: "osi-tcpip",
    title: "OSI / TCP-IP — lag-innkapsling",
    blurb: "Se en pakke pakkes inn og ut gjennom hvert lag.",
    category: "nettverk",
    route: "/stack/osi-tcpip",
    tags: ["osi", "tcp/ip", "innkapsling", "lag", "headers"],
  },
  {
    id: "transportlag",
    title: "TCP — handshake, lifecycle, sliding window",
    blurb: "3-way handshake, state machine og flytkontroll.",
    category: "nettverk",
    route: "/stack/transportlag",
    tags: ["tcp", "handshake", "sliding window", "state machine", "transport"],
  },
  {
    id: "tcp-sockets",
    title: "Socket-livssyklus — socket/bind/listen/accept",
    blurb: "BSD-socket-API step-for-step på server- og klient-siden.",
    category: "nettverk",
    route: "/stack/tcp-sockets",
    tags: ["socket", "bind", "listen", "accept", "connect", "bsd"],
  },
  {
    id: "csma",
    title: "CSMA/CD og /CA — Aloha-progresjon",
    blurb: "Kollisjonsdeteksjon og -unngåelse, fra Aloha til moderne MAC.",
    category: "nettverk",
    route: "/stack/dte2507-ap-progresjon",
    tags: ["csma", "cd", "ca", "aloha", "mac", "ethernet", "dte2507"],
  },
  {
    id: "aloha-kasino",
    title: "Aloha — kasino-simulator",
    blurb: "Pure og slotted Aloha med kollisjonssannsynlighet og gjennomstrømming.",
    category: "nettverk",
    route: "/stack/dte2507-aloha-kasino",
    tags: ["aloha", "slotted", "gjennomstrømming", "dte2507"],
  },
  {
    id: "arp",
    title: "ARP-detektiv — fra IP til MAC",
    blurb: "ARP-request, -reply og ARP-cache i live nettverk.",
    category: "nettverk",
    route: "/stack/dte2507-arp-detektiv",
    tags: ["arp", "mac", "ip", "broadcast", "cache", "dte2507"],
  },
  {
    id: "dns",
    title: "DNS — rekursivt og iterativt oppslag",
    blurb: "Følg en dns-spørring fra resolver via root, TLD og autoritativ.",
    category: "nettverk",
    route: "/stack/dte2507-dns-dyp",
    tags: ["dns", "resolver", "tld", "root", "dte2507"],
  },
  {
    id: "rdt",
    title: "RDT 1.0–3.0 + GBN — pakke-tidslinje",
    blurb: "Reliable data transfer fra perfekt kanal til timeouts og go-back-N.",
    category: "nettverk",
    route: "/stack/dte2507-rdt-progresjon",
    tags: ["rdt", "stop and wait", "go back n", "tidslinje", "dte2507"],
  },
  {
    id: "delay",
    title: "Delay-modell — propagering vs transmisjon",
    blurb: "To-ruter pakke med live matematikk på alle fire delay-typer.",
    category: "nettverk",
    route: "/stack/dte2507-delay-modell",
    tags: ["delay", "propagering", "transmisjon", "kø", "rtt", "dte2507"],
  },
  {
    id: "bottleneck",
    title: "Bottleneck-throughput",
    blurb: "Hvilken lenke begrenser, og hvor mye?",
    category: "nettverk",
    route: "/stack/dte2507-bottleneck-throughput",
    tags: ["throughput", "bottleneck", "bandbredde", "dte2507"],
  },
  {
    id: "congestion",
    title: "Congestion control — slow start til AIMD",
    blurb: "TCP-vindu over tid med tap og duplicate ACK.",
    category: "nettverk",
    route: "/stack/dte2507-congestion-control",
    tags: ["congestion", "slow start", "aimd", "tcp", "vindu", "dte2507"],
  },
  {
    id: "count-to-infinity",
    title: "Count-to-infinity — distance vector problem",
    blurb: "Hvordan RIP gambler, og hvorfor det går galt.",
    category: "nettverk",
    route: "/stack/dte2507-count-to-infinity",
    tags: ["distance vector", "rip", "looping", "dte2507"],
  },
  {
    id: "bgp",
    title: "BGP-stige — path-vector mellom AS",
    blurb: "AS-baner, policy og hvorfor internet ruter som det gjør.",
    category: "nettverk",
    route: "/stack/dte2507-bgp-stige",
    tags: ["bgp", "path vector", "autonomous system", "as", "dte2507"],
  },
  {
    id: "ruting",
    title: "Ruting — Dijkstra og Bellman-Ford",
    blurb: "Shortest path i en nettverksgraf, step-for-step.",
    category: "nettverk",
    route: "/stack/dte2507-ruting",
    tags: ["dijkstra", "bellman-ford", "shortest path", "graf", "ruting", "dte2507"],
  },
  {
    id: "switch-self-learning",
    title: "Switch self-learning",
    blurb: "MAC-tabellen bygges opp ved første frame fra hver port.",
    category: "nettverk",
    route: "/stack/dte2507-switch-self-learning",
    tags: ["switch", "mac table", "self learning", "ethernet", "dte2507"],
  },
  {
    id: "nat",
    title: "NAT — adresseoversetting og port-mapping",
    blurb: "Inner IP:port ↔ outer IP:port med NAT-tabell-demo.",
    category: "nettverk",
    route: "/stack/dte2507-nat",
    tags: ["nat", "port mapping", "private ip", "dte2507"],
  },
  {
    id: "http2-hol",
    title: "HTTP/1.0 vs 1.1 vs 2 — HOL-blokkering",
    blurb: "Sammenlign hvor head-of-line-blocking oppstår i hvert.",
    category: "nettverk",
    route: "/stack/dte2507-http2-hol",
    tags: ["http", "http/2", "hol blocking", "multipleksing", "dte2507"],
  },
  {
    id: "web-caching",
    title: "Web caching — LRU, TTL, betinget GET",
    blurb: "Hit-rate-matte og betinget GET med If-Modified-Since.",
    category: "nettverk",
    route: "/stack/dte2507-web-caching-matte",
    tags: ["caching", "lru", "ttl", "if-modified-since", "etag", "dte2507"],
  },
  {
    id: "inni-ruter",
    title: "Inni en ruter — HOL i input-buffer",
    blurb: "Hvorfor input-queued switches lider av head-of-line-blokkering.",
    category: "nettverk",
    route: "/stack/dte2507-inni-ruter",
    tags: ["ruter", "input queue", "hol", "switch", "dte2507"],
  },
  {
    id: "packet-scheduling",
    title: "Pakke-scheduling — WFQ-vekter",
    blurb: "Weighted Fair Queuing fordeler bandbredde etter vekter.",
    category: "nettverk",
    route: "/stack/dte2507-packet-scheduling",
    tags: ["wfq", "fair queuing", "qos", "dte2507"],
  },
  {
    id: "day-in-life",
    title: "En dag i livet til en pakke",
    blurb: "DHCP → ARP → DNS → TCP → HTTP, hele oppstart-sekvensen.",
    category: "nettverk",
    route: "/stack/dte2507-day-in-the-life",
    tags: ["dhcp", "arp", "dns", "tcp", "oppstart", "dte2507"],
  },
  {
    id: "ids-snort",
    title: "IDS — Snort-regler i aksjon",
    blurb: "Match pakker mot regler og se hva som trigger alarmer.",
    category: "nettverk",
    route: "/stack/dte2507-ids-snort",
    tags: ["ids", "snort", "deteksjon", "regel", "dte2507"],
  },

  // ──── DATABASE ────────────────────────────────────────────────────────
  {
    id: "indekser",
    title: "Indekser — B-tre vs hash vs full scan",
    blurb: "Se hvor mange disk-sider en spørring trenger uten/med indeks.",
    category: "database",
    route: "/stack/indekser",
    tags: ["indeks", "b-tree", "hash", "explain", "kostnad"],
  },
  {
    id: "transaksjoner",
    title: "Transaksjoner — ACID og isolasjonsnivå",
    blurb: "Dirty read, phantom read, serializable — alle anomaliene live.",
    category: "database",
    route: "/stack/transaksjoner",
    tags: ["acid", "transaction", "isolasjon", "dirty read", "phantom"],
  },
  {
    id: "query-plan",
    title: "Query-planer — joins, kostnad, selektivitet",
    blurb: "Plan-tre med join-typer, selektivitet og kostnadsanslag.",
    category: "database",
    route: "/stack/query-optimisering",
    tags: ["query plan", "join", "kostnad", "selektivitet", "explain"],
  },

  // ──── ALGORITMER & DATASTRUKTURER ─────────────────────────────────────
  {
    id: "sortering",
    title: "Sortering — bubble, insertion, merge, quick",
    blurb: "Step gjennom sorteringsalgoritmer med sammenligning-/bytte-teller.",
    category: "algoritmer",
    route: "/stack/sortering",
    tags: ["sortering", "bubble", "insertion", "merge sort", "quicksort"],
  },
  {
    id: "sok-algoritmer",
    title: "Søk — linear, binary, BFS, DFS",
    blurb: "Se hvilke noder/elementer som inspiseres for hvert søk.",
    category: "algoritmer",
    route: "/stack/sok-algoritmer",
    tags: ["søk", "binary search", "bfs", "dfs", "graf"],
  },
  {
    id: "lenkede-strukturer",
    title: "Lenkede strukturer — singly, doubly, sirkulær",
    blurb: "Pekere mellom noder, insert/delete på hode og hale.",
    category: "algoritmer",
    route: "/stack/lenkede-strukturer",
    tags: ["lenket liste", "peker", "node", "next", "singly", "doubly"],
  },
  {
    id: "traer",
    title: "Trær — BST, AVL, traversal",
    blurb: "Insert, delete og rotasjoner i søketrær. In-/pre-/post-order.",
    category: "algoritmer",
    route: "/stack/traer",
    tags: ["bst", "avl", "tre", "traversal", "in-order", "rotasjon"],
  },
  {
    id: "hashing",
    title: "Hash-tabell — separat chaining vs open addressing",
    blurb: "Kollisjonshåndtering med last-faktor og rehashing.",
    category: "algoritmer",
    route: "/stack/hashing-dypere",
    tags: ["hash", "kollisjon", "chaining", "open addressing", "load factor"],
  },
  {
    id: "grafer",
    title: "Grafer — DFS, BFS, Dijkstra, MST",
    blurb: "Step gjennom grafalgoritmer med besøks-rekkefølge og avstander.",
    category: "algoritmer",
    route: "/stack/grafer-dypere",
    tags: ["graf", "dfs", "bfs", "dijkstra", "mst", "prim", "kruskal"],
  },
  {
    id: "dp",
    title: "Dynamisk programmering — knapsack, LCS, Fibonacci",
    blurb: "DP-tabell fylles celle for celle, med tilbakesporing til løsning.",
    category: "algoritmer",
    route: "/stack/dynamic-programming",
    tags: ["dynamic programming", "knapsack", "lcs", "fibonacci", "memoisering"],
  },
  {
    id: "rekursjon",
    title: "Rekursjon — call stack visualisert",
    blurb: "Fibonacci, fakultet og Towers of Hanoi med stack-frames synlig.",
    category: "algoritmer",
    route: "/stack/rekursjon",
    tags: ["rekursjon", "call stack", "fibonacci", "hanoi", "fakultet"],
  },
  {
    id: "big-o",
    title: "Big O — vekstrater visualisert",
    blurb: "Sammenlign O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ) i graf.",
    category: "algoritmer",
    route: "/stack/big-o",
    tags: ["big o", "asymptotisk", "kompleksitet", "vekst"],
  },

  // ──── MASKINLÆRING ────────────────────────────────────────────────────
  {
    id: "neuron",
    title: "Nevron — vekter, bias, aktivering",
    blurb: "Justér vekter og se output for sigmoid, ReLU og tanh.",
    category: "ml",
    route: "/stack/nn-intro",
    tags: ["nevron", "vekt", "bias", "sigmoid", "relu", "tanh"],
  },
  {
    id: "backprop",
    title: "Backpropagation — gradient flyter bakover",
    blurb: "Forward pass, loss, og gradient-flyt gjennom et lite nett.",
    category: "ml",
    route: "/stack/backprop-dyp",
    tags: ["backprop", "gradient", "loss", "kjederegel", "nn"],
  },
  {
    id: "gradient-descent",
    title: "Gradient descent — lineær, polynom, SGD",
    blurb: "Step descent på loss-landskap med learning rate-slider.",
    category: "ml",
    route: "/stack/optimering",
    tags: ["gradient descent", "sgd", "learning rate", "loss landscape"],
  },
  {
    id: "cnn",
    title: "CNN — konvolusjon, stride, padding, pooling",
    blurb: "1D og 2D konvolusjon med filter-galleri og stride-eksperimenter.",
    category: "ml",
    route: "/stack/cnn",
    tags: ["cnn", "konvolusjon", "stride", "padding", "pooling", "filter"],
  },
  {
    id: "logreg",
    title: "Logistisk regresjon — sigmoid og decision boundary",
    blurb: "Tren med GD, se log-loss falle og beslutningsgrensen bevege seg.",
    category: "ml",
    route: "/stack/dte2602-logistisk-regresjon",
    tags: ["logistisk regresjon", "sigmoid", "log-loss", "decision boundary", "dte2602"],
  },
  {
    id: "svm",
    title: "SVM — margin og support vectors",
    blurb: "Klikkbar 2D-demo: legg punkter, se marginen og support-vectors.",
    category: "ml",
    route: "/stack/dte2602-svm",
    tags: ["svm", "margin", "support vector", "kernel", "dte2602"],
  },
  {
    id: "cv-splits",
    title: "Kryssvalidering — K-fold, LOO, stratifisert",
    blurb: "Visualiser hvilke rader som er train/val/test i hver fold.",
    category: "ml",
    route: "/stack/dte2602-cv-varianter",
    tags: ["kryssvalidering", "k-fold", "loo", "stratifisert", "dte2602"],
  },
  {
    id: "supervised",
    title: "Supervised learning — algoritme-overblikk",
    blurb: "Decision boundaries for KNN, tre, lineær, SVM på samme data.",
    category: "ml",
    route: "/stack/supervised-learning",
    tags: ["supervised", "klassifisering", "regresjon", "knn", "tre"],
  },
  {
    id: "gmm",
    title: "GMM — Gaussian Mixture Model med EM",
    blurb: "Step EM-iterasjonene: ansvarlighet, m-step, log-likelihood.",
    category: "ml",
    route: "/stack/dte2501-ml",
    tags: ["gmm", "em", "gaussian mixture", "klustering", "dte2501"],
  },
  {
    id: "tsp-dp",
    title: "TSP med dynamisk programmering",
    blurb: "Held-Karp på en liten by-graf med bitmask-state-rom.",
    category: "ml",
    route: "/stack/dte2501-ml",
    tags: ["tsp", "held-karp", "bitmask", "kombinatorisk", "dte2501"],
  },
  {
    id: "bandits",
    title: "Multi-armed bandits — ε-greedy, UCB",
    blurb: "Reward-distribusjoner og hvordan utforsking/utnytting balanseres.",
    category: "ml",
    route: "/stack/dte2501-bandits",
    tags: ["bandits", "epsilon greedy", "ucb", "exploration", "rl", "dte2501"],
  },
  {
    id: "bellman",
    title: "Bellman-iterasjon — verdi i et MDP",
    blurb: "Step verdi-iterasjon på et lite grid-world.",
    category: "ml",
    route: "/stack/dte2501-mdp-bellman",
    tags: ["bellman", "mdp", "verdi-iterasjon", "rl", "dte2501"],
  },
  {
    id: "normalisering",
    title: "Normalisering — z-score, min-max, robust",
    blurb: "Sammenlign hvordan ulike skaleringer endrer fordelinger.",
    category: "ml",
    route: "/stack/normalisering",
    tags: ["normalisering", "z-score", "min-max", "robust", "skaler"],
  },

  // ──── STATISTIKK ──────────────────────────────────────────────────────
  {
    id: "sannsynlighet",
    title: "Sannsynlighet — Venn, betinget, Bayes",
    blurb: "Klikkbart Venn-diagram og interaktiv Bayes-kalkulator.",
    category: "statistikk",
    route: "/stack/sannsynlighet",
    tags: ["sannsynlighet", "venn", "betinget", "bayes", "tek1"],
  },
  {
    id: "anova",
    title: "ANOVA — F-test mellom grupper",
    blurb: "Mellom-/innen-gruppe-varians visualisert, p-verdi live.",
    category: "statistikk",
    route: "/stack/tek1-anova",
    tags: ["anova", "f-test", "varians", "grupper", "tek1"],
  },
  {
    id: "bootstrap",
    title: "Bootstrap-resampling",
    blurb: "Trekk med tilbakelegging, bygg sampling-fordeling, CI.",
    category: "statistikk",
    route: "/stack/tek1-bootstrap",
    tags: ["bootstrap", "resampling", "konfidensintervall", "tek1"],
  },

  // ──── SIKKERHET & KRYPTO ──────────────────────────────────────────────
  {
    id: "krypto-progresjon",
    title: "Kryptografi — Caesar, XOR, SHA, RSA, DH",
    blurb: "Fra Caesar til RSA-mini og Diffie-Hellman, hver med live regning.",
    category: "sikkerhet",
    route: "/stack/kryptografi",
    tags: ["kryptografi", "caesar", "xor", "sha", "rsa", "diffie-hellman", "avalanche"],
  },
  {
    id: "aes-gcm",
    title: "AES-GCM — autentisert kryptering",
    blurb: "Se hvordan IV, nøkkel og AAD påvirker chiffer og auth-tag.",
    category: "sikkerhet",
    route: "/stack/kryptografi#aes-gcm",
    tags: ["aes", "gcm", "auth tag", "iv", "aead"],
  },
  {
    id: "cbc-iv",
    title: "CBC — hvorfor IV må være tilfeldig",
    blurb: "Samme klartekst med gjenbrukt IV avslører mønstre.",
    category: "sikkerhet",
    route: "/stack/dte2507-cbc-iv",
    tags: ["cbc", "iv", "blokkmodus", "padding oracle", "dte2507"],
  },

  // ──── PYTHON ──────────────────────────────────────────────────────────
  {
    id: "python-step",
    title: "Python step-debugger",
    blurb: "Kjør Python live, step instruksjon for instruksjon, se variabler.",
    category: "python",
    route: "/python/visualizer",
    tags: ["python", "debugger", "step", "variabler", "pyodide"],
  },
  {
    id: "encoding",
    title: "ASCII / UTF-8 / Base64 / endian",
    blurb: "Samme tegn/tall vist i fire koder, byte for byte.",
    category: "python",
    route: "/stack/bytes-encoding",
    tags: ["ascii", "utf-8", "base64", "endian", "encoding"],
  },

  // ──── MATEMATIKK ──────────────────────────────────────────────────────
  {
    id: "function-types",
    title: "Funksjons-typer — injektiv, surjektiv, bijektiv",
    blurb: "Klikkbar pil-figur som lar deg utforske de tre kategoriene.",
    category: "matematikk",
    route: "/stack/diskret-matte",
    tags: ["funksjon", "injektiv", "surjektiv", "bijektiv", "diskret"],
  },
];

export function visualizersByCategory(): Record<VizCategory, VizEntry[]> {
  const out = {} as Record<VizCategory, VizEntry[]>;
  for (const cat of VIZ_CATEGORIES) out[cat.id] = [];
  for (const v of VISUALIZERS) out[v.category].push(v);
  return out;
}

export function searchVisualizers(query: string): VizEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return VISUALIZERS;
  const tokens = q.split(/\s+/);
  return VISUALIZERS.filter((v) => {
    const hay = `${v.title} ${v.blurb} ${v.tags.join(" ")} ${v.category}`.toLowerCase();
    return tokens.every((t) => hay.includes(t));
  });
}
