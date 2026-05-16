import type { DatasetId } from "../db/datasets";

export type Level = 0 | 1 | 2 | 3 | 4 | 5;

export interface Problem {
  id: string;
  title: string;
  level: Level;
  difficulty: 1 | 2 | 3 | 4 | 5;
  topics: string[];
  dataset?: DatasetId; // defaults to "ecommerce"
  goal: string;
  problem: string;
  starter_sql: string;
  solution: string;
  alt_solutions?: string[];
  /** Kuraterte alternative løsninger med pedagogisk kommentar.
   *  Vises i et "Sammenlign med andre løsninger"-panel etter at brukeren
   *  har levert riktig svar. Brukes for å vise idiomatiske eller alternative
   *  SQL-mønstre (window vs subquery, CTE vs nested, COALESCE vs CASE, …). */
  altSolutions?: {
    /** Den alternative SQL-koden (kjørbar). */
    kode: string;
    /** Kort navn — vises i overskriften (f.eks. "Window function", "CTE"). */
    navn: string;
    /** Pedagogisk kommentar: hvorfor er denne formen interessant, og når
     *  vil du foretrekke den fremfor hovedløsningen? */
    kommentar: string;
  }[];
  validation: {
    ignore_order?: boolean;
    ignore_column_names?: boolean;
  };
  hints: string[];
  explanation: string;
  estimated_time_min: number;
  /** "select" (default) — pure SELECT problem, validated by comparing query result.
   *  "ddl" — user runs CREATE/INSERT/UPDATE/DELETE; engine then runs verify_sql to compare resulting state. */
  mode?: "select" | "ddl";
  /** SQL run on the fresh DB BEFORE the user's code (DDL mode). Useful for INSERT/UPDATE/DELETE problems
   *  that need a schema or partial seed beyond the dataset default. */
  pre_sql?: string;
  /** SQL run AFTER user's code in DDL mode; its result is what the engine compares against the solution's. */
  verify_sql?: string;
}

export const LEVEL_NAMES: Record<Level, string> = {
  0: "Basics",
  1: "Filtering",
  2: "Joins",
  3: "Aggregation",
  4: "Subqueries",
  5: "Advanced",
};
