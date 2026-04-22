import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import { getDataset, type DatasetId } from "../db/datasets";

let SQL: SqlJsStatic | null = null;

export interface QueryResult {
  columns: string[];
  rows: unknown[][];
}

export interface RunOutcome {
  success: boolean;
  result?: QueryResult;
  error?: string;
}

const FORBIDDEN = ["DROP", "DELETE", "ALTER", "UPDATE", "INSERT", "TRUNCATE", "ATTACH", "DETACH", "PRAGMA"];

export interface ExplainHint {
  level: "info" | "warn";
  message: string;
}

export interface ExplainReport {
  plan: string[];
  hints: ExplainHint[];
}

export function isUnsafe(sql: string): string | null {
  // Strip comments and string literals to avoid false positives
  const stripped = sql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/'[^']*'/g, "''")
    .toUpperCase();
  for (const word of FORBIDDEN) {
    const re = new RegExp(`\\b${word}\\b`);
    if (re.test(stripped)) return word;
  }
  return null;
}

async function getSQL(): Promise<SqlJsStatic> {
  if (SQL) return SQL;
  SQL = await initSqlJs({
    locateFile: (file) => `/wasm/${file}`,
  });
  return SQL;
}

let cachedDb: Database | null = null;
let cachedDbDataset: DatasetId | null = null;

async function getFreshDb(datasetId: DatasetId): Promise<Database> {
  if (cachedDb) {
    cachedDb.close();
    cachedDb = null;
    cachedDbDataset = null;
  }
  const sql = await getSQL();
  const db = new sql.Database();
  const ds = getDataset(datasetId);
  db.exec(ds.schemaSql);
  db.exec(ds.seedSql);
  cachedDb = db;
  cachedDbDataset = datasetId;
  return db;
}

export async function runQuery(userSQL: string, datasetId: DatasetId = "ecommerce"): Promise<RunOutcome> {
  const trimmed = userSQL.trim();
  if (!trimmed) return { success: false, error: "Empty query" };

  const bad = isUnsafe(trimmed);
  if (bad) return { success: false, error: `Unsafe keyword "${bad}" is blocked.` };

  try {
    const db = await getFreshDb(datasetId);
    void cachedDbDataset;
    const res = db.exec(trimmed);
    if (res.length === 0) {
      return { success: true, result: { columns: [], rows: [] } };
    }
    const last = res[res.length - 1];
    return {
      success: true,
      result: {
        columns: last.columns,
        rows: last.values as unknown[][],
      },
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function explainQuery(
  userSQL: string,
  datasetId: DatasetId = "ecommerce",
): Promise<ExplainReport | null> {
  const trimmed = userSQL.trim().replace(/;+\s*$/g, "");
  if (!trimmed) return null;
  if (isUnsafe(trimmed)) return null;
  try {
    const db = await getFreshDb(datasetId);
    const res = db.exec(`EXPLAIN QUERY PLAN ${trimmed}`);
    const plan: string[] = [];
    if (res.length) {
      const detailIdx = res[0].columns.findIndex((c) => c.toLowerCase() === "detail");
      for (const row of res[0].values) {
        plan.push(String(row[detailIdx >= 0 ? detailIdx : row.length - 1]));
      }
    }
    const hints: ExplainHint[] = [];
    const upper = trimmed.toUpperCase();
    const joined = plan.join(" | ").toUpperCase();
    const scanCount = (joined.match(/SCAN /g) ?? []).length;
    const searchCount = (joined.match(/SEARCH /g) ?? []).length;

    if (scanCount >= 2 && searchCount === 0) {
      hints.push({
        level: "warn",
        message: `Plan does ${scanCount} full table scans without an index search — consider joining on indexed columns (primary keys / foreign keys).`,
      });
    } else if (scanCount >= 1) {
      hints.push({
        level: "info",
        message: `Full table scan detected. Fine for small tables, but on large data prefer filtering on indexed columns.`,
      });
    }
    if (joined.includes("USE TEMP B-TREE FOR ORDER BY")) {
      hints.push({
        level: "info",
        message: "ORDER BY uses a temporary B-tree (sorting in memory). On big datasets, an index matching the ORDER BY columns avoids this.",
      });
    }
    if (joined.includes("USE TEMP B-TREE FOR GROUP BY")) {
      hints.push({
        level: "info",
        message: "GROUP BY uses a temporary B-tree. An index on the grouped columns can remove the sort step.",
      });
    }
    if (joined.includes("USE TEMP B-TREE FOR DISTINCT")) {
      hints.push({
        level: "info",
        message: "DISTINCT requires a temporary sort. Consider whether GROUP BY or an index would be cheaper.",
      });
    }
    if (/\bSELECT\s+\*/.test(upper)) {
      hints.push({
        level: "info",
        message: "SELECT * fetches every column. Listing only needed columns reduces I/O and makes intent clearer.",
      });
    }
    if (/\bLIKE\s+'%[^']/.test(trimmed)) {
      hints.push({
        level: "warn",
        message: "Leading-wildcard LIKE ('%foo') cannot use a regular index — full scan is forced.",
      });
    }
    if (upper.includes(" JOIN ") && !/\bON\b|\bUSING\b/.test(upper)) {
      hints.push({
        level: "warn",
        message: "JOIN without ON/USING produces a Cartesian product. Add a join condition.",
      });
    }
    if (hints.length === 0) {
      hints.push({ level: "info", message: "Plan looks lean — no obvious red flags." });
    }
    return { plan, hints };
  } catch {
    return null;
  }
}

export interface ValidationOptions {
  ignore_order?: boolean;
  ignore_column_names?: boolean;
}

export interface ValidationResult {
  correct: boolean;
  reason?: string;
  expected?: QueryResult;
  actual?: QueryResult;
  columnMismatch?: boolean;
  rowCountDelta?: number;
}

function normalizeRows(rows: unknown[][], ignoreOrder: boolean): string[] {
  const stringified = rows.map((r) => JSON.stringify(r.map((v) => (v === null ? null : String(v)))));
  return ignoreOrder ? [...stringified].sort() : stringified;
}

export async function validateQuery(
  userSQL: string,
  solutionSQL: string,
  options: ValidationOptions = {},
  datasetId: DatasetId = "ecommerce",
): Promise<ValidationResult> {
  const ignoreOrder = options.ignore_order ?? true;
  const ignoreColumnNames = options.ignore_column_names ?? false;

  const userOut = await runQuery(userSQL, datasetId);
  if (!userOut.success || !userOut.result) {
    return { correct: false, reason: userOut.error ?? "Query failed" };
  }
  const solOut = await runQuery(solutionSQL, datasetId);
  if (!solOut.success || !solOut.result) {
    return { correct: false, reason: "Solution query failed (internal)" };
  }

  const expected = solOut.result;
  const actual = userOut.result;

  if (expected.columns.length !== actual.columns.length) {
    return {
      correct: false,
      reason: `Expected ${expected.columns.length} columns, got ${actual.columns.length}`,
      expected,
      actual,
      columnMismatch: true,
      rowCountDelta: actual.rows.length - expected.rows.length,
    };
  }

  let columnMismatch = false;
  if (!ignoreColumnNames) {
    for (let i = 0; i < expected.columns.length; i++) {
      if (expected.columns[i].toLowerCase() !== actual.columns[i].toLowerCase()) {
        columnMismatch = true;
      }
    }
  }

  const expectedRows = normalizeRows(expected.rows, ignoreOrder);
  const actualRows = normalizeRows(actual.rows, ignoreOrder);

  if (expectedRows.length !== actualRows.length) {
    return {
      correct: false,
      reason: `Expected ${expectedRows.length} rows, got ${actualRows.length}`,
      expected,
      actual,
      columnMismatch,
      rowCountDelta: actual.rows.length - expected.rows.length,
    };
  }

  for (let i = 0; i < expectedRows.length; i++) {
    if (expectedRows[i] !== actualRows[i]) {
      return {
        correct: false,
        reason: "Row data does not match expected output",
        expected,
        actual,
        columnMismatch,
        rowCountDelta: 0,
      };
    }
  }

  return { correct: true, expected, actual, columnMismatch, rowCountDelta: 0 };
}
