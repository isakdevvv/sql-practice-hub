import { Database } from "bun:sqlite";
import { DATASETS, type DatasetId } from "./src/lib/db/datasets";
import { PROBLEMS } from "./src/lib/problems/data";
import type { Problem } from "./src/lib/problems/types";

interface FailureInfo {
  id: string;
  title: string;
  level: number;
  dataset: DatasetId;
  mode: "select" | "ddl";
  stage: "solution" | "starter" | "compare-alt" | "empty" | "starter-leaks";
  message: string;
  severity: "error" | "warn";
}

interface RunResult {
  columns: string[];
  rows: unknown[][];
}

function execQuery(db: Database, sql: string): RunResult {
  const stmt = db.query(sql);
  const rows = stmt.all() as Record<string, unknown>[];
  if (rows.length === 0) {
    const columnNames = (stmt as unknown as { columnNames?: string[] }).columnNames ?? [];
    return { columns: columnNames, rows: [] };
  }
  const columns = Object.keys(rows[0]);
  const values = rows.map((r) => columns.map((c) => r[c] ?? null));
  return { columns, rows: values };
}

function makeDb(datasetId: DatasetId): Database {
  const ds = DATASETS[datasetId];
  if (!ds) throw new Error(`Unknown dataset ${datasetId}`);
  const db = new Database(":memory:");
  if (ds.schemaSql) db.exec(ds.schemaSql);
  if (ds.seedSql) db.exec(ds.seedSql);
  return db;
}

function normalizeRows(rows: unknown[][], ignoreOrder: boolean): string[] {
  const stringified = rows.map((r) =>
    JSON.stringify(r.map((v) => (v === null ? null : String(v)))),
  );
  return ignoreOrder ? [...stringified].sort() : stringified;
}

function compare(
  expected: RunResult,
  actual: RunResult,
  ignoreOrder: boolean,
  ignoreColumnNames: boolean,
): string | null {
  if (expected.columns.length !== actual.columns.length) {
    return `column count mismatch: expected ${expected.columns.length}, got ${actual.columns.length}`;
  }
  if (!ignoreColumnNames) {
    for (let i = 0; i < expected.columns.length; i++) {
      if (expected.columns[i].toLowerCase() !== actual.columns[i].toLowerCase()) {
        return `column name mismatch at idx ${i}: '${expected.columns[i]}' vs '${actual.columns[i]}'`;
      }
    }
  }
  const e = normalizeRows(expected.rows, ignoreOrder);
  const a = normalizeRows(actual.rows, ignoreOrder);
  if (e.length !== a.length) {
    return `row count mismatch: expected ${e.length}, got ${a.length}`;
  }
  for (let i = 0; i < e.length; i++) {
    if (e[i] !== a[i]) return `row ${i} differs: ${e[i]} vs ${a[i]}`;
  }
  return null;
}

function runOne(p: Problem): FailureInfo[] {
  const failures: FailureInfo[] = [];
  const datasetId: DatasetId = p.dataset ?? "ecommerce";
  const mode = p.mode ?? "select";

  // Run the solution
  let solutionResult: RunResult | undefined;
  try {
    const db = makeDb(datasetId);
    if (p.pre_sql) db.exec(p.pre_sql);
    if (mode === "ddl") {
      if (!p.verify_sql) {
        failures.push({
          id: p.id,
          title: p.title,
          level: p.level,
          dataset: datasetId,
          mode,
          stage: "solution",
          severity: "error",
          message: "DDL mode but no verify_sql provided",
        });
        db.close();
        return failures;
      }
      db.exec(p.solution);
      solutionResult = execQuery(db, p.verify_sql);
    } else {
      solutionResult = execQuery(db, p.solution);
    }
    db.close();
  } catch (e) {
    failures.push({
      id: p.id,
      title: p.title,
      level: p.level,
      dataset: datasetId,
      mode,
      stage: "solution",
      severity: "error",
      message: `solution SQL failed: ${e instanceof Error ? e.message : String(e)}`,
    });
  }

  // Empty solution result is suspicious (may indicate a bad WHERE clause or wrong table).
  // For DDL with COUNT-style verify_sql empty doesn't mean much; only flag for select mode.
  if (mode === "select" && solutionResult && solutionResult.rows.length === 0) {
    failures.push({
      id: p.id,
      title: p.title,
      level: p.level,
      dataset: datasetId,
      mode,
      stage: "empty",
      severity: "warn",
      message: `solution returns 0 rows — verify this is intentional`,
    });
  }

  // Starter SQL that already produces the solution's output means the problem is "solved" before the user types
  if (mode === "select" && solutionResult && p.starter_sql) {
    const starter = p.starter_sql.trim();
    // Skip if starter is empty/comment-only/looks incomplete (has trailing operators or empty WHERE)
    const starterStripped = starter
      .replace(/--.*$/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .trim();
    const looksIncomplete =
      starterStripped === "" ||
      /\bWHERE\s*;?\s*$/i.test(starterStripped) ||
      /\bSELECT\s+FROM\b/i.test(starterStripped) ||
      /,\s*$/i.test(starterStripped) ||
      /\bON\s*$/i.test(starterStripped) ||
      /\bGROUP\s+BY\s*$/i.test(starterStripped) ||
      /\bORDER\s+BY\s*$/i.test(starterStripped) ||
      /\bHAVING\s*$/i.test(starterStripped);
    if (!looksIncomplete) {
      try {
        const db = makeDb(datasetId);
        if (p.pre_sql) db.exec(p.pre_sql);
        const starterResult = execQuery(db, starterStripped);
        db.close();
        const cmp = compare(
          solutionResult,
          starterResult,
          p.validation.ignore_order ?? true,
          p.validation.ignore_column_names ?? true,
        );
        if (cmp === null) {
          failures.push({
            id: p.id,
            title: p.title,
            level: p.level,
            dataset: datasetId,
            mode,
            stage: "starter-leaks",
            severity: "warn",
            message: `starter_sql already produces the solution output: '${starterStripped.replace(/\s+/g, " ").slice(0, 100)}'`,
          });
        }
      } catch {
        // starter SQL failing to parse is fine — it's a fragment for the user
      }
    }
  }

  // Optionally compare alt_solutions
  if (p.alt_solutions && solutionResult) {
    for (const alt of p.alt_solutions) {
      try {
        const db = makeDb(datasetId);
        if (p.pre_sql) db.exec(p.pre_sql);
        let altResult: RunResult;
        if (mode === "ddl") {
          db.exec(alt);
          altResult = execQuery(db, p.verify_sql!);
        } else {
          altResult = execQuery(db, alt);
        }
        db.close();
        const cmp = compare(
          solutionResult,
          altResult,
          p.validation.ignore_order ?? true,
          p.validation.ignore_column_names ?? false,
        );
        if (cmp) {
          failures.push({
            id: p.id,
            title: p.title,
            level: p.level,
            dataset: datasetId,
            mode,
            stage: "compare-alt",
            severity: "error",
            message: `alt_solution diverges from solution: ${cmp}\n  alt: ${alt.replace(/\s+/g, " ").slice(0, 120)}`,
          });
        }
      } catch (e) {
        failures.push({
          id: p.id,
          title: p.title,
          level: p.level,
          dataset: datasetId,
          mode,
          stage: "compare-alt",
          severity: "error",
          message: `alt_solution failed to run: ${e instanceof Error ? e.message : String(e)}`,
        });
      }
    }
  }

  return failures;
}

const allFailures: FailureInfo[] = [];

for (const p of PROBLEMS) {
  allFailures.push(...runOne(p));
}

const errors = allFailures.filter((f) => f.severity === "error");
const warnings = allFailures.filter((f) => f.severity === "warn");
const idsWithErr = new Set(errors.map((f) => f.id));
const idsClean = PROBLEMS.length - new Set(allFailures.map((f) => f.id)).size;

console.log(
  `Tested ${PROBLEMS.length} problems: ${idsClean} clean, ${idsWithErr.size} with errors, ${new Set(warnings.map((f) => f.id)).size} with warnings only.`,
);

if (errors.length > 0) {
  console.log("\n=== ERRORS ===\n");
  for (const f of errors) {
    console.log(`[${f.id} L${f.level} ${f.dataset} ${f.mode} :: ${f.stage}] ${f.title}`);
    console.log(`  ${f.message}\n`);
  }
}

if (warnings.length > 0) {
  console.log("\n=== WARNINGS ===\n");
  for (const f of warnings) {
    console.log(`[${f.id} L${f.level} ${f.dataset} ${f.mode} :: ${f.stage}] ${f.title}`);
    console.log(`  ${f.message}\n`);
  }
}

if (errors.length > 0) process.exit(1);
