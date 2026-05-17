import type { DocRef } from "@/lib/docs";

/** 0 = grunnleggende, 5 = avansert. Like the SQL course levels.
 *  When not set on an exercise, it's derived from the topic via PY_TOPIC_LEVEL. */
export type PyLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const PY_LEVEL_NAMES: Record<PyLevel, string> = {
  0: "Grunnleggende — MySQL & routing",
  1: "Web-flyt — Jinja, forms, CRUD",
  2: "API & sesjoner",
  3: "Sikkerhet — passord & CSRF",
  4: "API-integrasjon & data",
  5: "Avansert — ORM & arkitektur",
};

/** Map fra topic → level. Lar oss legge til level uten å touche hver oppgave. */
export const PY_TOPIC_LEVEL: Record<string, PyLevel> = {
  // Python kjerne — språkfeatures (uavhengig av web/DB/nettverk)
  "Comprehensions — list": 0,
  "Comprehensions — filter & transform": 1,
  "Comprehensions — dict & set": 1,
  "Comprehensions — tuple": 1,
  "Comprehensions — nested": 2,
  "Comprehensions — avansert": 3,
  "MySQL connector": 0,
  "Flask routing": 0,
  "Flask + Jinja": 1,
  "Flask + forms": 1,
  "Flask + MySQL": 1,
  "Flask + Bootstrap": 1,
  "Flask + CSS": 1,
  // FastAPI — moderne Python web framework med type-hints og async
  "FastAPI": 2,
  // DTE-2505 OS — bit-fiddling, scheduling, paging, konkurrens
  "DTE-2505 — Permissions": 1,
  "DTE-2505 — Scheduling": 2,
  "DTE-2505 — Minne": 2,
  "DTE-2505 — Konkurrens": 3,
  "DTE-2505 — Shell": 1,
  "DTE-2505 — Filsystem": 1,
  // TEK-1501 — utvidelse: z/t/χ²-tester, regresjon fra bunn, bootstrap, power
  "TEK-1501 — z-test": 2,
  "TEK-1501 — t-test": 2,
  "TEK-1501 — χ²-test": 2,
  "TEK-1501 — Regresjon": 2,
  "TEK-1501 — Bootstrap & power": 3,
  "JSON API": 2,
  "HTTP-statuskoder": 2,
  "Sessions": 2,
  "Login & sessions": 2,
  "Passord-sikkerhet": 3,
  "CSRF": 3,
  "API & tokens": 4,
  "REST / API": 4,
  "Python data-prosessering": 4,
  "API-kall i Python": 4,
  "Flask-SQLAlchemy (ORM)": 5,
  "Flask-utvidelser": 5,
  "App-arkitektur": 5,
  // DTE-2507 — socket-programmering / nettverk
  "Sockets (TCP)": 2,
  "Sockets (UDP)": 2,
  "Sockets (concurrent)": 3,
  "TLS / SSL": 3,
  "Kryptografi": 3,
  "HTTP via sockets": 2,
  // Kurose-Ross (DTE-2507) — kvantitative nettverksoppgaver
  "Kurose — Fysisk lag": 2,
  "Kurose — Applikasjonslag": 2,
  "Kurose — Transportlag": 3,
  "Kurose — Nettverkslag": 3,
  "Kurose — Lenkelag": 3,
  "Kurose — Sikkerhet": 3,
  "DTE-2602 EDA": 2,
  "DTE-2602 Preprocessing": 2,
  "DTE-2602 Modeller": 3,
  "DTE-2602 Evaluering": 3,
  "DTE-2602 Algoritmer fra bunn": 4,
  // DTE-2501 ML — kategoriene plasseres tilsvarende «data-prosessering»-nivå.
  "ML — Supervised": 4,
  "ML — Unsupervised": 4,
  "ML — Dim.-reduksjon": 4,
  "ML — Ensemble": 4,
  "ML — NLP": 4,
  "ML — Metaheuristikk": 4,
  "ML — Reinforcement learning": 5,
  "ML — Dynamic programming": 4,
  // Granulære ML-emnenavn (også brukt i kjørbare øvelser):
  "ML — k-NN": 4,
  "ML — Trær": 4,
  "ML — k-Means": 4,
  "ML — GMM": 4,
  "ML — PCA": 4,
  "ML — GA": 4,
  "ML — RL": 5,
  "ML — DP": 4,
  // Gap-utfyllere (Sutton & Barto + AIMA)
  "ML — Minimax": 4,
  "ML — Bandits": 4,
  "ML — MDP Bellman": 5,
};

/** Resolve a PyExercise's level — explicit field wins, else look up topic, else 0. */
export function levelOf(ex: { level?: PyLevel; topic: string }): PyLevel {
  return ex.level ?? PY_TOPIC_LEVEL[ex.topic] ?? 0;
}

/**
 * Tematiske kategorier (over level/topic). Brukes for å gruppere sidebar-listen
 * og som filter-chips. Hver oppgave tilhører nøyaktig én kategori basert på
 * topic-strengen. Rekkefølgen er pedagogisk — fra mest grunnleggende mot mest
 * spesialisert.
 */
export type PyCategoryId =
  | "py-core"
  | "web"
  | "db-data"
  | "api-sec"
  | "dte2507"
  | "kurose"
  | "dte2602"
  | "dte2501-ml"
  | "dte2505-os"
  | "stat-other";

export interface PyCategory {
  id: PyCategoryId;
  label: string;
  /** Kort beskrivelse for tooltip. */
  description: string;
  /** Topics som hører til denne kategorien. */
  topics: readonly string[];
}

export const PY_CATEGORIES: readonly PyCategory[] = [
  {
    id: "py-core",
    label: "Python kjerne",
    description: "Pure-Python språkfeatures — comprehensions (list/dict/set/generator), lazy eval, unpacking.",
    topics: [
      "Comprehensions — list",
      "Comprehensions — filter & transform",
      "Comprehensions — dict & set",
      "Comprehensions — tuple",
      "Comprehensions — nested",
      "Comprehensions — avansert",
    ],
  },
  {
    id: "web",
    label: "Web & Flask",
    description: "Flask-routing, Jinja-templates, skjemaer, sessions, Bootstrap/CSS, ORM.",
    topics: [
      "Flask routing",
      "Flask + Jinja",
      "Flask + forms",
      "Flask + MySQL",
      "Flask + Bootstrap",
      "Flask + CSS",
      "Flask + Session",
      "Flask-SQLAlchemy (ORM)",
      "Flask-utvidelser",
      "App-arkitektur",
      "FastAPI",
    ],
  },
  {
    id: "db-data",
    label: "Database & data",
    description: "MySQL-connector og databehandling i Python.",
    topics: ["MySQL connector", "Python data-prosessering", "Decorators"],
  },
  {
    id: "api-sec",
    label: "API & sikkerhet",
    description: "JSON-API, HTTP-statuskoder, sesjoner, passord, CSRF, tokens.",
    topics: [
      "JSON API",
      "HTTP-statuskoder",
      "Sessions",
      "Login & sessions",
      "Passord-sikkerhet",
      "Passordhashing",
      "CSRF",
      "API & tokens",
      "REST / API",
      "API-kall i Python",
    ],
  },
  {
    id: "dte2507",
    label: "DTE-2507 Nettverk",
    description: "Sockets (TCP/UDP), TLS, kryptografi, HTTP via sockets.",
    topics: [
      "DTE-2507",
      "Sockets (TCP)",
      "Sockets (UDP)",
      "Sockets (concurrent)",
      "TLS / SSL",
      "Kryptografi",
      "HTTP via sockets",
    ],
  },
  {
    id: "kurose",
    label: "Kurose Ch 1–8",
    description: "Kvantitative nettverksoppgaver fra Kurose-Ross (delay, RTT, CRC, NAT, DH).",
    topics: [
      "Kurose — Fysisk lag",
      "Kurose — Applikasjonslag",
      "Kurose — Transportlag",
      "Kurose — Nettverkslag",
      "Kurose — Lenkelag",
      "Kurose — Sikkerhet",
    ],
  },
  {
    id: "dte2602",
    label: "DTE-2602 ML-prosjekt",
    description: "EDA, preprocessing, modeller, evaluering, algoritmer fra bunn.",
    topics: [
      "DTE-2602 EDA",
      "DTE-2602 Preprocessing",
      "DTE-2602 Modeller",
      "DTE-2602 Evaluering",
      "DTE-2602 Algoritmer fra bunn",
      "Modellevaluering",
    ],
  },
  {
    id: "dte2501-ml",
    label: "DTE-2501 ML",
    description: "k-NN, k-Means, GMM, PCA, ensemble, GA, NLP, RL, DP.",
    topics: [
      "ML — Supervised",
      "ML — Unsupervised",
      "ML — Dim.-reduksjon",
      "ML — Ensemble",
      "ML — NLP",
      "ML — Metaheuristikk",
      "ML — Reinforcement learning",
      "ML — Dynamic programming",
      "ML — k-NN",
      "ML — Trær",
      "ML — k-Means",
      "ML — GMM",
      "ML — PCA",
      "ML — GA",
      "ML — RL",
      "ML — DP",
      "ML — Minimax",
      "ML — Bandits",
      "ML — MDP Bellman",
      "Klustering & dim-red",
    ],
  },
  {
    id: "dte2505-os",
    label: "DTE-2505 OS",
    description: "Permissions, scheduling, paging, konkurrens, shell-parsing, filsystem.",
    topics: [
      "DTE-2505",
      "DTE-2505 — Permissions",
      "DTE-2505 — Scheduling",
      "DTE-2505 — Minne",
      "DTE-2505 — Konkurrens",
      "DTE-2505 — Shell",
      "DTE-2505 — Filsystem",
    ],
  },
  {
    id: "stat-other",
    label: "Statistikk & annet",
    description: "TEK-1501 statistikk og øvrige gaps-emner.",
    topics: [
      "Statistikk-grunnlag",
      "TEK-1501 — z-test",
      "TEK-1501 — t-test",
      "TEK-1501 — χ²-test",
      "TEK-1501 — Regresjon",
      "TEK-1501 — Bootstrap & power",
    ],
  },
];

/** Build lookup at module-init for O(1) categoryOf. */
const TOPIC_TO_CATEGORY: Record<string, PyCategoryId> = (() => {
  const map: Record<string, PyCategoryId> = {};
  for (const cat of PY_CATEGORIES) {
    for (const topic of cat.topics) {
      map[topic] = cat.id;
    }
  }
  return map;
})();

/** Returnerer kategori-id for en oppgave. Faller tilbake til "stat-other" hvis topic er ukjent. */
export function categoryOf(ex: { topic: string }): PyCategoryId {
  return TOPIC_TO_CATEGORY[ex.topic] ?? "stat-other";
}

export interface PyExercise {
  id: string;
  topic: string;
  /** Optional override — when unset, level is derived from `topic` via PY_TOPIC_LEVEL. */
  level?: PyLevel;
  title: string;
  description: string;
  /** Starter code shown in the editor. */
  starter: string;
  /** Optional reference solution shown when user gives up. */
  solution?: string;
  /** Optional hints surfaced in the UI. */
  hints?: string[];
  /** Pyodide packages to install via micropip before running (e.g. ["flask"]). */
  requires?: string[];
  /** Setup code run BEFORE user code — gives the exercise a starting world.
   *  Used e.g. to seed an in-memory sqlite DB. Does NOT show in the editor. */
  setup?: string;
  /** Documentation links + snippets shown next to the prompt. */
  docs?: DocRef[];
}

/** A single step in the cumulative "Bygg en nettbutikk"-prosjekt. */
export interface ProjectStep {
  id: string;
  /** Short tag like "Database" or "Sessions" — shown as badge. */
  concept: string;
  title: string;
  /** What the user is supposed to build in this step. */
  task: string;
  /** Optional teaching text shown above the editor. */
  context?: string;
  /** Cumulative starter — includes everything from previous steps. */
  starter: string;
  /** Reference solution — same shape as starter, with this step's task done. */
  solution: string;
  /** Optional hints. */
  hints?: string[];
  /** Pyodide packages required (e.g. ["flask"]). */
  requires?: string[];
  /** Documentation links + snippets shown next to the task. */
  docs?: DocRef[];
}


export type PyVarValue = string | number | boolean | null | unknown;

export interface PyStep {
  /** 1-indexed line number that just ran. */
  line: number;
  /** Local variables snapshot AFTER this line ran (only json-safe values). */
  locals: Record<string, PyVarValue>;
  /** stdout produced during this step (may span multiple prints if same line). */
  stdout?: string;
}

export interface PyRunResult {
  ok: boolean;
  stdout: string;
  /** Final variable snapshot (only when run as a whole). */
  locals?: Record<string, PyVarValue>;
  /** When stepping, ordered list of states after each line. */
  steps?: PyStep[];
  /** Set when ok=false. */
  error?: string;
}

/* ----------------------------- Visualizer model ----------------------------- */
/* Used by runScriptVisual + <StepVisualizer> to render a Python Tutor–style    */
/* memory diagram (frames + heap + reference arrows).                           */

export type ObjId = number;

export type VarRef =
  | { kind: "primitive"; value: string | number | boolean | null }
  | { kind: "ref"; id: ObjId };

export interface HeapList {
  id: ObjId;
  type: "list" | "tuple" | "set";
  items: VarRef[];
  truncated?: number;
  preview: string;
}

export interface HeapDictEntry {
  key: VarRef;
  value: VarRef;
}

export interface HeapDict {
  id: ObjId;
  type: "dict";
  entries: HeapDictEntry[];
  truncated?: number;
  preview: string;
}

export interface HeapInstance {
  id: ObjId;
  type: "instance";
  className: string;
  attrs: Record<string, VarRef>;
  preview: string;
}

export interface HeapFunction {
  id: ObjId;
  type: "function";
  name: string;
  signature?: string;
  preview: string;
}

export interface HeapOpaque {
  id: ObjId;
  type: "opaque" | "module";
  label: string;
  preview: string;
}

export type HeapObject =
  | HeapList
  | HeapDict
  | HeapInstance
  | HeapFunction
  | HeapOpaque;

export interface VisualFrame {
  name: string;
  line: number;
  filename: string;
  isUser: boolean;
  variables: Record<string, VarRef>;
}

export type VisualEvent = "line" | "call" | "return" | "exception";

export interface VisualStep {
  event: VisualEvent;
  frames: VisualFrame[];
  heap: Record<ObjId, HeapObject>;
  stdout: string;
  error?: string;
}

export interface PyVisualResult {
  ok: boolean;
  steps: VisualStep[];
  stdoutFull: string;
  truncated?: boolean;
  error?: string;
}
