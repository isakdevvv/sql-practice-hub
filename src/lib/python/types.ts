import type { DocRef } from "@/lib/docs";

export interface PyExercise {
  id: string;
  topic: string;
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
