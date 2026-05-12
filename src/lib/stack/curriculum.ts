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
}

export const PHASES: readonly CurriculumPhase[] = [
  {
    num: 0,
    id: "math",
    title: "Math foundations",
    why:
      "Prerekvisitt for ML og algoritmer. Diskret matte for CS, sannsynlighet for ML, linær algebra for nevrale nett og PCA.",
    analog: "MIT 6.042 · Stanford CS 109 · Khan Academy LinAlg",
    slugs: ["math-foundations", "diskret-matte", "sannsynlighet", "linaer-algebra"],
  },
  {
    num: 1,
    id: "hardware",
    title: "Hvordan datamaskinen faktisk fungerer",
    why:
      "Før noe annet: bygg opp en datamaskin fra transistorer. Du kan ikke forstå performance, OS eller minne uten å vite hva som faktisk skjer under abstraksjonene.",
    analog: "MIT 6.004 · CMU 15-213 · ETH Digital Design",
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
    slugs: [
      "algoritmer",
      "big-o",
      "rekursjon",
      "sortering",
      "lenkede-strukturer",
      "traer",
      "grafer-dypere",
      "hashing-dypere",
      "dynamic-programming",
    ],
  },
  {
    num: 2.5,
    id: "fp-typer",
    title: "Funksjonell programmering & typer",
    why:
      "Før du skalerer kode, lær prinsipper som gjør den robust: pure functions, immutability, sum types, generics. Disse er grunnlaget for moderne språk og bibliotek.",
    analog: "MIT 6.821 · Stanford CS 242 · CMU 15-150",
    slugs: ["funksjonell-programmering", "typesystemer"],
  },
  {
    num: 3,
    id: "os",
    title: "Operativsystemer",
    why:
      "OS er det første store steget i abstraksjon over hardware. Du må kunne prosesser, minne, filsystem og syscalls før du kan resonnere om performance eller sikkerhet.",
    analog: "MIT 6.S081 · Stanford CS 110 · CMU 15-410",
    slugs: [
      "dte-2505",
      "os-grunnlag",
      "linux-bruk",
      "shell-scripting",
      "brukere-rettigheter",
      "trinn-9-syscalls-dyp",
      "virtualisering",
      "dte2505-obliger-guide",
      "dte2505-rwx-kalkulator",
      "dte2505-prosesser-signaler",
      "dte2505-bash-scripts",
      "dte2505-obliger",
    ],
  },
  {
    num: 4,
    id: "nettverk",
    title: "Datakommunikasjon & sikkerhet",
    why:
      "OS lar én maskin gjøre noe. Nettverk lar flere snakke sammen. Kryptografi sikrer at de snakker uten avlytting. Hele moderne software bygger på dette.",
    analog: "MIT 6.829 · Stanford CS 144 · CMU 15-441",
    slugs: [
      "dte-2507",
      "osi-tcpip",
      "tcp-sockets",
      "transportlag",
      "kryptografi",
      "tls",
      "nettverkssikkerhet",
    ],
  },
  {
    num: 5,
    id: "database",
    title: "Databaser",
    why:
      "Persistent state er der applikasjoner faktisk lever. Relasjonsmodellen + SQL er den varigste abstraksjonen i hele faget — over 50 år og fremdeles dominerende.",
    analog: "MIT 6.830 · Stanford CS 245 · CMU 15-445",
    slugs: [
      "er-mapping",
      "normalisering",
      "nokler",
      "subqueries",
      "transaksjoner",
      "indekser",
      "query-optimisering",
      "mysql-vs-sqlite",
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
    slugs: [
      "http-anatomi",
      "html-jinja",
      "css-moderne",
      "javascript-grunnlag",
      "typescript",
      "react-grunnlag",
      "sikkerhet",
      "mvc-monster",
      "flask-livssyklus",
      "trinn-10-flask-dyp",
    ],
  },
  {
    num: 7,
    id: "ai-klassisk",
    title: "Klassisk AI — søk, logikk, planlegging",
    why:
      "Før nevrale nett kom intelligensen fra eksplisitt søk og logikk. R&N-pensum er fortsatt fundamentet. Mange «moderne» AI-løsninger er fremdeles søk eller CSP.",
    analog: "MIT 6.034 · Stanford CS 221 · CMU 15-381",
    slugs: [
      "dte-2501",
      "sok-algoritmer",
      "csp",
      "logisk-resonnering",
      "planlegging",
      "bayes",
    ],
  },
  {
    num: 8,
    id: "ml",
    title: "Maskinlæring",
    why:
      "ML er funksjonstilnærming fra data. Krever statistikk-grunnlag (forventes prerekvisitt) + algoritmer. Lær rammeverket FØR du henter dype nett.",
    analog: "MIT 6.036 · Stanford CS 229 · CMU 10-301",
    slugs: [
      "dte-2602",
      "ml-grunnlag",
      "supervised-learning",
      "unsupervised-learning",
      "nn-intro",
      "dte2602-prosjektflyt",
      "dte2602-eda-pandas",
      "dte2602-preprocessing-pipeline",
      "dte2602-trees-rf",
      "dte2602-bias-varians",
      "dte2602-evaluering-metoder",
      "dte2602-evaluation-roc",
      "dte2602-etikk-filosofi",
      "dte2602-mappe-mal",
    ],
  },
  {
    num: 9,
    id: "deep-learning",
    title: "Deep learning",
    why:
      "Konvolusjon, backprop dypt, regularisering, optimere. Bygger på ML-grunnlaget men krever vesentlig matematisk modenhet.",
    analog: "Stanford CS 231N · MIT 6.S191 · CMU 11-785",
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
    slugs: ["git-dyp", "docker", "linux-cli-advanced"],
  },
  {
    num: 12,
    id: "spes-mobil",
    title: "Spesialisering · Mobil (Android/Kotlin)",
    why:
      "Spor for de som vil lage mobile apper. Bygger på OS + algoritmer + nettverk + DB. Kotlin er moderne JVM-språk; Android er Linux-OS-en på telefon.",
    analog: "Stanford CS 193A · CMU 05-499",
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
