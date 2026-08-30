import { Hono } from "hono";
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
const MAX_SQL_LENGTH = 100_000;

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

function validateSqlField(sql: unknown, allowMutations: boolean): string | null {
  if (sql === undefined) return null;
  if (typeof sql !== "string") return "invalid SQL input";
  if (sql.length > MAX_SQL_LENGTH) return "SQL input is too large";
  return isUnsafe(sql, allowMutations);
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
  // Use raw column names + value arrays — `stmt.all()` materializes rows as
  // objects, which silently drops duplicate columns (e.g. `SELECT a.id, b.id`
  // or `SELECT *` across joins). values() preserves order and duplicates.
  const stmtRaw = stmt as unknown as {
    columnNames?: string[];
    values: () => unknown[][];
  };
  const columns = stmtRaw.columnNames ?? [];
  const rows = stmtRaw.values();
  return { columns, rows };
}

/** Run user's SQL (which may be CREATE/INSERT/UPDATE/DELETE — multi-statement allowed),
 *  then run a verify_sql and return its result. Both run on the same DB. */
function execDdl(db: Database, userSql: string, verifySql: string): QueryResult {
  // db.exec handles multi-statement SQL with no result expected.
  db.exec(userSql);
  return execQuery(db, verifySql);
}

const app = new Hono();

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
    sql: unknown;
    datasetId: DatasetId;
    mode?: "select" | "ddl";
    preSql?: unknown;
    verifySql?: unknown;
  }>();
  const { sql, datasetId } = body;
  const mode = body.mode ?? "select";
  if (typeof sql !== "string" || sql.length > MAX_SQL_LENGTH) {
    return c.json({ success: false, error: "Invalid or oversized SQL input." }, 400);
  }
  const trimmed = sql.trim().replace(/;+\s*$/g, "");
  if (!trimmed) return c.json({ success: false, error: "Empty query" });
  const bad = isUnsafe(trimmed, mode === "ddl");
  if (bad) return c.json({ success: false, error: `Unsafe keyword "${bad}" is blocked.` });
  const badPreSql = validateSqlField(body.preSql, true);
  if (badPreSql) return c.json({ success: false, error: `Unsafe keyword "${badPreSql}" is blocked in preSql.` });
  const badVerifySql = validateSqlField(body.verifySql, false);
  if (badVerifySql)
    return c.json({ success: false, error: `Unsafe keyword "${badVerifySql}" is blocked in verifySql.` });
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
  const { sql, datasetId } = await c.req.json<{ sql: unknown; datasetId: DatasetId }>();
  if (typeof sql !== "string" || sql.length > MAX_SQL_LENGTH) {
    return c.json({ plan: [], hints: [], error: "Invalid or oversized SQL input." }, 400);
  }
  const trimmed = sql.trim().replace(/;+\s*$/g, "");
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

app.post("/api/tutor", async (c) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return c.json({ error: "Tutor API is not configured." }, 503);

  const body = await c.req.json<{
    model?: string;
    system: string;
    messages: { role: "user" | "assistant"; content: string }[];
  }>();
  const allowedModels = new Set(["claude-sonnet-4-5"]);
  if (body.model && !allowedModels.has(body.model)) {
    return c.json({ error: "Unsupported tutor model." }, 400);
  }
  if (
    typeof body.system !== "string" ||
    body.system.length > 20_000 ||
    !Array.isArray(body.messages) ||
    body.messages.length > 40 ||
    body.messages.some(
      (message) =>
        !message ||
        (message.role !== "user" && message.role !== "assistant") ||
        typeof message.content !== "string" ||
        message.content.length > 10_000,
    )
  ) {
    return c.json({ error: "Invalid tutor request." }, 400);
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: body.model ?? "claude-sonnet-4-5",
      max_tokens: 2000,
      temperature: 0.7,
      system: body.system,
      messages: body.messages,
    }),
  });
  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
});

const port = Number(process.env.PORT ?? 3001);
console.log(`SQL practice server listening on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
