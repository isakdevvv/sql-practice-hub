// First-principles curriculum: how the best universities (MIT 6.*, Stanford CS,
// CMU 15.*, ETH) build up a computer engineer from hardware to software.
//
// Each PHASE answers a single question that the next phase depends on. We never
// invoke an abstraction we haven't first opened up at least once.
//
// To re-order trinn on /stack, /lar etc., import CURRICULUM_ORDER (a flat array
// of slugs in canonical sequence) and PHASES (grouped with names + descriptions).

export interface CurriculumPhase {
  /** Display number (1-indexed) for the phase. */
  num: number;
  /** Compact id used for anchors. */
  id: string;
  /** Phase title shown in UI. */
  title: string;
  /** What this phase answers / why it comes here. */
  why: string;
  /** Slugs of the stack trinn that belong to this phase, in study order. */
  slugs: readonly string[];
  /** University analogs — for «hvor lærer de dette ellers?». */
  analog?: string;
  /** Andre faser denne fasen direkte bygger på (id-er). Brukes til
   *  "Bygger på"-callout og avhengighet-grafen. Tomt for fundamenter. */
  dependsOn?: readonly string[];
  /** Hvilket lag denne fasen tilhører i stack-diagrammet. */
  layer?: "matematikk" | "hardware" | "system" | "data" | "ai" | "produkt" | "spesialisering";
  /** Kort 1-linje hva-er-dette for stack-diagrammet (annerledes enn `why`
   *  som er pedagogisk-hvorfor). */
  shortSummary?: string;
}

export const PHASES: readonly CurriculumPhase[] = [
  {
    num: 0,
    id: "math",
    title: "Math foundations",
    why:
      "Prerekvisitt for ML og algoritmer. Diskret matte for CS, sannsynlighet for ML, linær algebra for nevrale nett og PCA.",
    analog: "MIT 6.042 · Stanford CS 109 · Khan Academy LinAlg",
    dependsOn: [],
    layer: "matematikk",
    shortSummary: "Diskret matte, sannsynlighet, linær algebra",
    slugs: [
      "tek-1501",
      "math-foundations",
      "diskret-matte",
      "diskret-mod-aritmetikk",
      "sannsynlighet",
      "linaer-algebra",
      "tek1-distribusjons-plotter",
      "tek1-p-verdi-kalkulator",
    ],
  },
  {
    num: 1,
    id: "hardware",
    title: "Hvordan datamaskinen faktisk fungerer",
    why:
      "Før noe annet: bygg opp en datamaskin fra transistorer. Du kan ikke forstå performance, OS eller minne uten å vite hva som faktisk skjer under abstraksjonene.",
    analog: "MIT 6.004 · CMU 15-213 · ETH Digital Design",
    dependsOn: [],
    layer: "hardware",
    shortSummary: "Transistor → NAND → adder → CPU → assembly → C → bytes",
    slugs: [
      "trinn-1-transistor",
      "trinn-2-nand-porter",
      "trinn-3-adders",
      "trinn-4-cpu",
      "trinn-5-assembly",
      "trinn-6-c-minne",
      "trinn-7-bytes-dyp",
      "bytes-encoding",
      "trinn-8-python-er-c",
    ],
  },
  {
    num: 2,
    id: "algoritmer",
    title: "Algoritmer & datastrukturer",
    why:
      "Når du kan kjøre kode, MÅ du vite hvordan den skalerer. Big-O er språket alt annet bruker. Datastrukturer er byggesteinene for både OS, DB og ML.",
    analog: "MIT 6.006 · Stanford CS 161 · CMU 15-451",
    dependsOn: ["hardware"],
    layer: "system",
    shortSummary: "Big-O, rekursjon, trær, grafer, DP",
    slugs: [
      "algoritmer",
      "big-o",
      "rekursjon",
      "sortering",
      "radix-counting-sort",
      "lenkede-strukturer",
      "traer",
      "tries-btrees",
      "grafer-dypere",
      "dijkstra-viz",
      "hashing-dypere",
      "dynamic-programming",
      "greedy-np-viz",
    ],
  },
  {
    num: 2.5,
    id: "fp-typer",
    title: "Funksjonell programmering & typer",
    why:
      "Før du skalerer kode, lær prinsipper som gjør den robust: pure functions, immutability, sum types, generics. Disse er grunnlaget for moderne språk og bibliotek.",
    analog: "MIT 6.821 · Stanford CS 242 · CMU 15-150",
    dependsOn: ["algoritmer"],
    layer: "system",
    shortSummary: "Pure functions, sum types, generics",
    slugs: ["funksjonell-programmering", "typesystemer"],
  },
  {
    num: 3,
    id: "os",
    title: "Operativsystemer",
    why:
      "OS er det første store steget i abstraksjon over hardware. Du må kunne prosesser, minne, filsystem og syscalls før du kan resonnere om performance eller sikkerhet.",
    analog: "MIT 6.S081 · Stanford CS 110 · CMU 15-410",
    dependsOn: ["hardware", "algoritmer"],
    layer: "system",
    shortSummary: "Prosesser, minne, syscalls, scheduling, virtualisering",
    slugs: [
      "dte-2505",
      "os-historikk",
      "os-grunnlag",
      "linux-bruk",
      "shell-scripting",
      "brukere-rettigheter",
      "trinn-9-syscalls-dyp",
      "virtualisering",
      "dte2505-obliger-guide",
      "dte2505-rwx-kalkulator",
      "dte2505-prosesser-signaler",
      "dte2505-thread-vs-prosess",
      "dte2505-kontekstbytte",
      "deadlock-viz",
      "dte2505-bash-scripts",
      "dte2505-obliger",
      "dte2505-spesialbits",
      "dte2505-filsystem",
      "dte2505-virtualisering",
      "dte2505-ipc",
      "microkernel-arkitektur",
      "dte2505-io-management",
      "dte2505-lagring",
    ],
  },
  {
    num: 4,
    id: "nettverk",
    title: "Datakommunikasjon & sikkerhet",
    why:
      "OS lar én maskin gjøre noe. Nettverk lar flere snakke sammen. Kryptografi sikrer at de snakker uten avlytting. Hele moderne software bygger på dette.",
    analog: "MIT 6.829 · Stanford CS 144 · CMU 15-441",
    dependsOn: ["os"],
    layer: "system",
    shortSummary: "OSI/TCP-IP, sockets, TLS, ruting, sikkerhet",
    slugs: [
      "dte-2507",
      "osi-tcpip",
      "tcp-sockets",
      "transportlag",
      "kryptografi",
      "tls",
      "nettverkssikkerhet",
      "dte2507-wireshark-analyse",
      "dte2507-socket-programmering",
      "dte2507-brannmur-vlan",
      "dte2507-subnetting",
      "dte2507-tls-handshake",
      "dte2507-paket-dekoding",
      "dte2507-rsa-mini",
      "dte2507-praksis",
      "dte2507-delay-modell",
      "dte2507-bottleneck-throughput",
      "dte2507-rdt-progresjon",
      "dte2507-ap-progresjon",
      "dte2507-inni-ruter",
      "dte2507-packet-scheduling",
      "dte2507-crc-kalkulator",
      "dte2507-aloha-kasino",
      "dte2507-arp-detektiv",
      "dte2507-nat",
      "dte2507-switch-self-learning",
      "dte2507-http2-hol",
      "dte2507-web-caching-matte",
      "dte2507-count-to-infinity",
      "dte2507-bgp-stige",
      "dte2507-fra-checksum-til-hmac",
      "dte2507-cbc-iv",
      "dte2507-stateful-firewall",
      "dte2507-brannmur-pakkeflyt",
      "dte2507-ids-snort",
      "dte2507-day-in-the-life",
      "dte2507-dhcp",
      "http-statuskoder",
    ],
  },
  {
    num: 5,
    id: "database",
    title: "Databaser",
    why:
      "Persistent state er der applikasjoner faktisk lever. Relasjonsmodellen + SQL er den varigste abstraksjonen i hele faget — over 50 år og fremdeles dominerende.",
    analog: "MIT 6.830 · Stanford CS 245 · CMU 15-445",
    dependsOn: ["algoritmer", "os"],
    layer: "data",
    shortSummary: "ER, normalisering, indekser, transaksjoner, SQL",
    slugs: [
      "er-mapping",
      "normalisering",
      "nokler",
      "subqueries",
      "transaksjoner",
      "tx-isolation",
      "indekser",
      "query-optimisering",
      "mysql-vs-sqlite",
      "sql-schema-builder",
      "backup-strategier",
      "huskelapp",
    ],
  },
  {
    num: 6,
    id: "web",
    title: "Web & HTTP — full-stack basis",
    why:
      "Web er hvor alt møtes: nettverk + OS + DB + UI. HTTP er den vanligste protokollen for å lage produkter. Lær request-flyten før du legger på frameworks.",
    analog: "Stanford CS 142 · MIT 6.170 · ulike web-emner",
    dependsOn: ["os", "nettverk", "database"],
    layer: "produkt",
    shortSummary: "HTTP, HTML/CSS/JS, Flask, FastAPI, React",
    slugs: [
      "http-anatomi",
      "html-jinja",
      "css-moderne",
      "javascript-grunnlag",
      "typescript",
      "react-grunnlag",
      "sikkerhet",
      "auth-flows",
      "web-angrep",
      "mvc-monster",
      "flask-livssyklus",
      "trinn-10-flask-dyp",
      "flask-app-builder",
      "fastapi-app-builder",
      "fastapi-grunnlag",
      "rest-api-builder",
    ],
  },
  {
    num: 7,
    id: "ai-klassisk",
    title: "Klassisk AI — søk, logikk, planlegging",
    why:
      "Før nevrale nett kom intelligensen fra eksplisitt søk og logikk. R&N-pensum er fortsatt fundamentet. Mange «moderne» AI-løsninger er fremdeles søk eller CSP.",
    analog: "MIT 6.034 · Stanford CS 221 · CMU 15-381",
    dependsOn: ["algoritmer", "math"],
    layer: "ai",
    shortSummary: "Søk, CSP, logikk, planlegging, Bayes",
    slugs: [
      "dte-2501",
      "ai-historie",
      "sok-algoritmer",
      "csp",
      "logisk-resonnering",
      "planlegging",
      "bayes",
      "ai-etikk",
    ],
  },
  {
    num: 8,
    id: "ml",
    title: "Maskinlæring",
    why:
      "ML er funksjonstilnærming fra data. Krever statistikk-grunnlag (forventes prerekvisitt) + algoritmer. Lær rammeverket FØR du henter dype nett.",
    analog: "MIT 6.036 · Stanford CS 229 · CMU 10-301",
    dependsOn: ["math", "algoritmer", "ai-klassisk"],
    layer: "ai",
    shortSummary: "k-NN, k-Means, PCA, ensemble, RL, GA/PSO",
    slugs: [
      "dte-2602",
      "ml-grunnlag",
      "supervised-learning",
      "unsupervised-learning",
      "sigmoid-viz",
      "gradient-descent",
      "nn-intro",
      "dte2602-prosjektflyt",
      "dte2602-eda-pandas",
      "dte2602-preprocessing-pipeline",
      "dte2602-trees-rf",
      "dte2602-bias-varians",
      "dte2602-evaluering-metoder",
      "dte2602-evaluation-roc",
      "dte2602-cv-varianter",
      "dte2602-lda-qda-nb",
      "dte2602-svm",
      "dte2602-etikk-filosofi",
      "dte2602-mappe-mal",
      "dte2501-kmeans-visualizer",
      "dte2501-pca-visualizer",
      "dte2501-pso-visualizer",
      "dte2602-lineaer-regresjon",
      "dte2602-regresjon-diagnostikk",
      "dte2602-roc-curve-plotter",
      "ml-pipeline-builder",
    ],
  },
  {
    num: 9,
    id: "deep-learning",
    title: "Deep learning",
    why:
      "Konvolusjon, backprop dypt, regularisering, optimere. Bygger på ML-grunnlaget men krever vesentlig matematisk modenhet.",
    analog: "Stanford CS 231N · MIT 6.S191 · CMU 11-785",
    dependsOn: ["ml"],
    layer: "ai",
    shortSummary: "Backprop dypt, CNN, regularisering, PyTorch",
    slugs: [
      "dte-2502",
      "backprop-dyp",
      "cnn",
      "regularisering",
      "optimering",
      "pytorch-tf",
    ],
  },
  {
    num: 10,
    id: "systemutvikling",
    title: "Systemutvikling — bygge ekte produkter",
    why:
      "Kode alene er ikke produkt. Smidig metodikk, krav, UML og prosjekt-praksis er det som skiller en jr.dev fra noen som kan levere. Industri-fokusert.",
    analog: "MIT 6.170/6.171 · Stanford CS 194 · CMU 17-313",
    dependsOn: ["web"],
    layer: "produkt",
    shortSummary: "Smidig, brukerhistorier, UML, prosjekt-praksis",
    slugs: [
      "dte-2604",
      "su-metodikker",
      "brukerhistorier",
      "uml",
      "su-prosjekt-praksis",
    ],
  },
  {
    num: 11,
    id: "api-prosjekt",
    title: "API-prosjekt fra A til Å — produksjon",
    why:
      "Spesialisering: hvordan bygge og deploye et komplett API. Arkitektur, kontrakt, testing, observability, CI/CD. Industriens beste praksis i ett kurs.",
    analog: "Industri-fokusert — ingen direkte universitetsanalog",
    dependsOn: ["web", "systemutvikling"],
    layer: "produkt",
    shortSummary: "API-design, kontrakt, testing, CI/CD, observability",
    slugs: [
      "api-prosjekt",
      "api-planlegging",
      "api-arkitektur",
      "api-kontrakt",
      "api-testing",
      "api-deploy",
    ],
  },
  {
    num: 11.5,
    id: "devops",
    title: "DevOps & verktøy",
    why:
      "Git-dyp, Docker, og avansert Linux-CLI er fundamentet for moderne deploy- og samarbeids-flyt. Disse verktøyene brukes i ALLE jobber.",
    analog: "Industri-fokusert — sjelden eget kurs på universitet",
    dependsOn: ["os", "nettverk"],
    layer: "produkt",
    shortSummary: "Git-dyp, Docker, Linux CLI advanced",
    slugs: ["git-dyp", "docker", "dockerfile-builder", "linux-cli-advanced"],
  },
  {
    num: 12,
    id: "spes-mobil",
    title: "Spesialisering · Mobil (Android/Kotlin)",
    why:
      "Spor for de som vil lage mobile apper. Bygger på OS + algoritmer + nettverk + DB. Kotlin er moderne JVM-språk; Android er Linux-OS-en på telefon.",
    analog: "Stanford CS 193A · CMU 05-499",
    dependsOn: ["web", "os", "database"],
    layer: "spesialisering",
    shortSummary: "Kotlin, Android, MVVM, Room, Retrofit",
    slugs: [
      "dte-2603",
      "kotlin-grunnlag",
      "android-grunnlag",
      "mvvm-arkitektur",
      "korutiner",
      "room-recycler",
      "api-retrofit",
    ],
  },
  {
    num: 13,
    id: "spes-enterprise",
    title: "Spesialisering · Enterprise Web (.NET / C#)",
    why:
      "Spor for de som vil bygge bedriftssystemer. Microsoft-stacken er dominerende i finans, helse og offentlig sektor. ASP.NET + EF + Blazor.",
    analog: "Industri-fokusert (Microsoft-stack)",
    dependsOn: ["web", "database"],
    layer: "spesialisering",
    shortSummary: "C#, ASP.NET MVC/API, EF Core, Blazor",
    slugs: [
      "dte-2802",
      "csharp-grunnlag",
      "aspnet-mvc",
      "aspnet-webapi",
      "ef-core",
      "blazor",
    ],
  },
  {
    num: 14,
    id: "drill",
    title: "Eksamens-drill & repetisjon",
    why:
      "Når du har gått gjennom hele løypa: drill det viktigste til det sitter. Spaced repetition og hands-on eksamens-trening.",
    dependsOn: [],
    layer: "produkt",
    shortSummary: "Spaced repetition, eksamens-trening",
    slugs: ["python-drill"],
  },
];

/** Flat array of slugs in canonical curriculum order. */
export const CURRICULUM_ORDER: readonly string[] = PHASES.flatMap((p) => p.slugs);

/** Map for O(1) lookup of canonical position. */
const ORDER_INDEX = new Map<string, number>(
  CURRICULUM_ORDER.map((slug, i) => [slug, i]),
);

/** Returns the canonical position of a slug, or Infinity for anything not in the
 *  curriculum (e.g. ad-hoc internal pages). Stable sort fallback to original order. */
export function curriculumIndexOf(slug: string): number {
  return ORDER_INDEX.get(slug) ?? Infinity;
}

/** Map from slug → phase. */
const SLUG_TO_PHASE = new Map<string, CurriculumPhase>(
  PHASES.flatMap((p) => p.slugs.map((s) => [s, p] as const)),
);

export function phaseOfSlug(slug: string): CurriculumPhase | null {
  return SLUG_TO_PHASE.get(slug) ?? null;
}

/** Map fra fase-id til faser som direkte avhenger av den.
 *  Brukes til "Åpner opp"-callout (omvendt av dependsOn). */
const REVERSE_DEPS = (() => {
  const map = new Map<string, string[]>();
  for (const p of PHASES) {
    for (const dep of p.dependsOn ?? []) {
      const list = map.get(dep) ?? [];
      list.push(p.id);
      map.set(dep, list);
    }
  }
  return map;
})();

/** Faser som direkte bygger på denne fasen. Returnerer faser i num-rekkefølge. */
export function phasesUnlockedBy(phaseId: string): CurriculumPhase[] {
  const ids = REVERSE_DEPS.get(phaseId) ?? [];
  return ids
    .map((id) => PHASES.find((p) => p.id === id))
    .filter((p): p is CurriculumPhase => !!p)
    .sort((a, b) => a.num - b.num);
}

/** Faser som denne fasen direkte bygger på. */
export function phasesDependedOnBy(phaseId: string): CurriculumPhase[] {
  const phase = PHASES.find((p) => p.id === phaseId);
  if (!phase) return [];
  return (phase.dependsOn ?? [])
    .map((id) => PHASES.find((p) => p.id === id))
    .filter((p): p is CurriculumPhase => !!p)
    .sort((a, b) => a.num - b.num);
}
