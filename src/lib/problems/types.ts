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
  validation: {
    ignore_order?: boolean;
    ignore_column_names?: boolean;
  };
  hints: string[];
  explanation: string;
  estimated_time_min: number;
}

export const LEVEL_NAMES: Record<Level, string> = {
  0: "Basics",
  1: "Filtering",
  2: "Joins",
  3: "Aggregation",
  4: "Subqueries",
  5: "Advanced",
};
