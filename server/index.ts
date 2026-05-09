import { Hono } from "hono";
import { cors } from "hono/cors";
import { Database } from "bun:sqlite";
import { DATASETS, type DatasetId } from "../src/lib/db/datasets";

const FORBIDDEN_SELECT = [
  "DROP",
  "DELETE",
  "ALTER",
  "UPDATE",
  "INSERT",
  "TRUNCATE",
  "ATTACH",
  "DETACH",
  "PRAGMA",
  "REPLACE",
  "VACUUM",
  "CREATE",
];
// In DDL mode users can write CREATE/INSERT/UPDATE/DELETE/ALTER/DROP/REPLACE.
// Only block escape-hatches that touch the host process or other databases.
const FORBIDDEN_DDL = ["ATTACH", "DETACH", "VACUUM", "PRAGMA"];

function isUnsafe(sql: string, allowMutations = false): string | null {
  const list = allowMutations ? FORBIDDEN_DDL : FORBIDDEN_SELECT;
  const stripped = sql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/'[^']*'/g, "''")
    .toUpperCase();
  for (const word of list) {
    if (new RegExp(`\\b${word}\\b`).test(stripped)) return word;
  }
  return null;
}

const dbCache = new Map<DatasetId, Database>();

function getDb(datasetId: DatasetId): Database {
  if (dbCache.has(datasetId)) return dbCache.get(datasetId)!;
  const ds = DATASETS[datasetId];
  if (!ds) throw new Error(`Unknown dataset: ${datasetId}`);
  const db = new Database(":memory:");
  db.exec(ds.schemaSql);
  db.exec(ds.seedSql);
  dbCache.set(datasetId, db);
  return db;
}

function resetDb(datasetId: DatasetId): Database {
  dbCache.get(datasetId)?.close();
  dbCache.delete(datasetId);
  return getDb(datasetId);
}

interface QueryResult {
  columns: string[];
  rows: unknown[][];
}

function execQuery(db: Database, sql: string): QueryResult {
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

/** Run user's SQL (which may be CREATE/INSERT/UPDATE/DELETE — multi-statement allowed),
 *  then run a verify_sql and return its result. Both run on the same DB. */
function execDdl(db: Database, userSql: string, verifySql: string): QueryResult {
  // db.exec handles multi-statement SQL with no result expected.
  db.exec(userSql);
  return execQuery(db, verifySql);
}

const app = new Hono();

app.use("*", cors());

app.get("/api/health", (c) => c.json({ ok: true, datasets: Object.keys(DATASETS) }));

app.get("/api/datasets", (c) => {
  return c.json(
    Object.values(DATASETS).map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      reference: d.reference,
    })),
  );
});

app.post("/api/reset", async (c) => {
  const { datasetId } = await c.req.json<{ datasetId: DatasetId }>();
  if (!DATASETS[datasetId]) return c.json({ error: "Unknown dataset" }, 400);
  resetDb(datasetId);
  return c.json({ ok: true });
});

app.post("/api/query", async (c) => {
  const body = await c.req.json<{
    sql: string;
    datasetId: DatasetId;
    mode?: "select" | "ddl";
    preSql?: string;
    verifySql?: string;
  }>();
  const { sql, datasetId } = body;
  const mode = body.mode ?? "select";
  const trimmed = (sql ?? "").trim().replace(/;+\s*$/g, "");
  if (!trimmed) return c.json({ success: false, error: "Empty query" });
  const bad = isUnsafe(trimmed, mode === "ddl");
  if (bad) return c.json({ success: false, error: `Unsafe keyword "${bad}" is blocked.` });
  if (!DATASETS[datasetId]) return c.json({ success: false, error: "Unknown dataset" }, 400);

  try {
    // Always run on a fresh in-memory DB so users can't observe each other's state
    const ds = DATASETS[datasetId];
    const db = new Database(":memory:");
    try {
      if (ds.schemaSql) db.exec(ds.schemaSql);
      if (ds.seedSql) db.exec(ds.seedSql);
      if (body.preSql) db.exec(body.preSql);
      if (mode === "ddl") {
        if (!body.verifySql) {
          return c.json({ success: false, error: "DDL mode requires verifySql" });
        }
        const result = execDdl(db, trimmed, body.verifySql);
        return c.json({ success: true, result });
      }
      const result = execQuery(db, trimmed);
      return c.json({ success: true, result });
    } finally {
      db.close();
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return c.json({ success: false, error: msg });
  }
});

app.post("/api/explain", async (c) => {
  const { sql, datasetId } = await c.req.json<{ sql: string; datasetId: DatasetId }>();
  const trimmed = (sql ?? "").trim().replace(/;+\s*$/g, "");
  if (!trimmed) return c.json({ plan: [], hints: [] });
  if (isUnsafe(trimmed)) return c.json({ plan: [], hints: [] });
  if (!DATASETS[datasetId]) return c.json({ plan: [], hints: [] });

  const ds = DATASETS[datasetId];
  const db = new Database(":memory:");
  try {
    db.exec(ds.schemaSql);
    db.exec(ds.seedSql);
    const stmt = db.query(`EXPLAIN QUERY PLAN ${trimmed}`);
    const rows = stmt.all() as Record<string, unknown>[];
    const plan = rows.map((r) => String(r.detail ?? Object.values(r).pop() ?? ""));
    return c.json({ plan, raw: rows });
  } catch (e) {
    return c.json({ plan: [], hints: [], error: e instanceof Error ? e.message : String(e) });
  } finally {
    db.close();
  }
});

const port = Number(process.env.PORT ?? 3001);
console.log(`SQL practice server listening on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
