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
  "MySQL connector": 0,
  "Flask routing": 0,
  "Flask + Jinja": 1,
  "Flask + forms": 1,
  "Flask + MySQL": 1,
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
};

/** Resolve a PyExercise's level — explicit field wins, else look up topic, else 0. */
export function levelOf(ex: { level?: PyLevel; topic: string }): PyLevel {
  return ex.level ?? PY_TOPIC_LEVEL[ex.topic] ?? 0;
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
