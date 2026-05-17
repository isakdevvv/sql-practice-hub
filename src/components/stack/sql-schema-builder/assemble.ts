import { OPTIONS } from "./options";
import type {
  Column,
  Dialect,
  Domain,
  SchemaOption,
  Table,
} from "./types";

// ---------------------------------------------------------------------------
// Dependency resolution (samme mønster som Flask App Builder).
// ---------------------------------------------------------------------------

export function resolveRequires(selected: Set<string>): Set<string> {
  const byId = new Map(OPTIONS.map((o) => [o.id, o]));
  const result = new Set(selected);
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of Array.from(result)) {
      const opt = byId.get(id);
      if (!opt?.requires) continue;
      for (const req of opt.requires) {
        if (!result.has(req)) {
          result.add(req);
          changed = true;
        }
      }
    }
  }
  return result;
}

export function findConflicts(
  selected: Set<string>,
): { a: string; b: string }[] {
  const conflicts: { a: string; b: string }[] = [];
  const byId = new Map(OPTIONS.map((o) => [o.id, o]));
  const seen = new Set<string>();
  for (const id of selected) {
    const opt = byId.get(id);
    if (!opt?.conflicts) continue;
    for (const c of opt.conflicts) {
      if (selected.has(c)) {
        const key = [id, c].sort().join("|");
        if (!seen.has(key)) {
          seen.add(key);
          conflicts.push({ a: id, b: c });
        }
      }
    }
  }
  return conflicts;
}

// ---------------------------------------------------------------------------
// Hjelpere
// ---------------------------------------------------------------------------

function getDialect(selected: Set<string>): Dialect {
  if (selected.has("dia-mysql")) return "mysql";
  if (selected.has("dia-sqlite")) return "sqlite";
  return "postgresql";
}

function getDomain(selected: Set<string>): Domain {
  if (selected.has("domain-skole")) return "skole";
  if (selected.has("domain-utleie")) return "utleie";
  if (selected.has("domain-bibliotek")) return "bibliotek";
  return "webshop";
}

/** Quote en identifier for valgt dialekt. */
function quoteIdent(name: string, dialect: Dialect): string {
  if (dialect === "mysql") return `\`${name}\``;
  // postgres + sqlite: dobbel anførsel — men identifiers her er alltid lowercase
  // og uten reserverte ord, så vi lar dem være naken for lesbarhet.
  return name;
}

/** Resolve logisk type → dialekt-spesifikt SQL-uttrykk. */
function sqlType(col: Column, dialect: Dialect): string {
  switch (col.type) {
    case "id-pk":
      if (dialect === "mysql") return "INT AUTO_INCREMENT PRIMARY KEY";
      if (dialect === "sqlite") return "INTEGER PRIMARY KEY AUTOINCREMENT";
      return "SERIAL PRIMARY KEY";
    case "int":
      return dialect === "mysql" ? "INT" : "INTEGER";
    case "decimal":
      return "DECIMAL(10,2)";
    case "text":
      return "TEXT";
    case "varchar":
      // MySQL og Postgres krever lengde for VARCHAR; SQLite tolererer alt.
      if (dialect === "sqlite") return "TEXT";
      return "VARCHAR(120)";
    case "email":
      if (dialect === "sqlite") return "TEXT";
      return "VARCHAR(254)";
    case "date":
      return "DATE";
    case "datetime":
      if (dialect === "mysql") return "DATETIME";
      if (dialect === "postgresql") return "TIMESTAMP";
      return "TEXT"; // SQLite har ikke ekte DATETIME-type
    case "bool":
      if (dialect === "mysql") return "TINYINT(1)";
      if (dialect === "postgresql") return "BOOLEAN";
      return "INTEGER";
  }
}

function renderColumn(
  col: Column,
  dialect: Dialect,
  hasCompositePk: boolean,
  selected: Set<string>,
): string[] {
  const lines: string[] = [];
  if (col.comment) lines.push(`  -- ${col.comment}`);
  let line = `  ${quoteIdent(col.name, dialect)} `;
  // Hvis tabellen har composite PK skal id-pk-typen "degraderes" til ren INT.
  if (col.type === "id-pk" && hasCompositePk) {
    line += dialect === "mysql" ? "INT" : "INTEGER";
  } else {
    line += sqlType(col, dialect);
  }
  // id-pk har allerede PK + NOT NULL implisitt; ikke legg til på nytt.
  const isInlinePk = col.type === "id-pk" && !hasCompositePk;
  if (!isInlinePk) {
    if (col.notNull) line += " NOT NULL";
    if (col.unique) line += " UNIQUE";
    if (col.default !== undefined && selected.has("con-default-status")) {
      line += ` DEFAULT ${col.default}`;
    }
    if (col.check && selected.has("con-check-pris")) {
      line += ` CHECK (${col.check})`;
    }
  }
  lines.push(line);
  return lines;
}

/**
 * Topologisk sortering av tabeller — parents (refererte) før children.
 * Bruker FK-grafer.
 */
function topoSort(tables: Table[]): Table[] {
  const byName = new Map(tables.map((t) => [t.name, t]));
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const result: Table[] = [];

  function visit(t: Table) {
    if (visited.has(t.name)) return;
    if (visiting.has(t.name)) return; // cycle — gi opp, kommer som-er
    visiting.add(t.name);
    for (const col of t.columns) {
      if (col.references) {
        const parent = byName.get(col.references.table);
        if (parent && parent.name !== t.name) visit(parent);
      }
    }
    visiting.delete(t.name);
    visited.add(t.name);
    result.push(t);
  }

  for (const t of tables) visit(t);
  return result;
}

// ---------------------------------------------------------------------------
// Hovedfunksjon
// ---------------------------------------------------------------------------

export function assemble(selected: Set<string>): string {
  const byId = new Map(OPTIONS.map((o) => [o.id, o]));
  const dialect = getDialect(selected);
  const domain = getDomain(selected);

  // 1. Samle tabeller fra alle valgte entitets-options som matcher domenet.
  const tablesByName = new Map<string, Table>();
  const rationales: string[] = [];

  for (const opt of OPTIONS) {
    if (!selected.has(opt.id)) continue;
    // Skip entitets-options som ikke tilhører valgt domene.
    if (opt.domain && opt.domain !== domain) continue;
    const c = opt.contributes;
    if (c.rationale) rationales.push(c.rationale);
    if (c.tables) {
      for (const t of c.tables) {
        // Lag en grunn kopi så modifyTables ikke muterer originalene mellom kjøringer.
        tablesByName.set(t.name, {
          ...t,
          columns: t.columns.map((col) => ({ ...col })),
          primaryKey: t.primaryKey ? [...t.primaryKey] : undefined,
          uniques: t.uniques ? t.uniques.map((u) => [...u]) : undefined,
        });
      }
    }
  }

  // 2. Påfør modifyTables — fra constraint-/normaliserings-options.
  for (const opt of OPTIONS) {
    if (!selected.has(opt.id)) continue;
    if (opt.domain && opt.domain !== domain) continue;
    if (opt.contributes.modifyTables) {
      opt.contributes.modifyTables(tablesByName);
    }
  }

  // 3. NOT NULL-globalt (kun hvis con-notnull er av — defaulter på).
  if (!selected.has("con-notnull")) {
    // Hvis brukeren har slått av NOT NULL: ikke fjern fra PK/FK,
    // men fjern fra alle andre felt for å vise effekten.
    for (const t of tablesByName.values()) {
      for (const c of t.columns) {
        if (c.type === "id-pk") continue;
        if (c.references) continue; // FK må fortsatt være NOT NULL i vår modell
        c.notNull = false;
      }
    }
  }

  // 4. Topologisk sortering for CREATE-rekkefølge.
  const allTables = Array.from(tablesByName.values());
  const ordered = topoSort(allTables);

  // 5. Bygg SQL.
  const out: string[] = [];

  out.push("-- =====================================================================");
  out.push(`-- SQL-skjema generert av SQL Schema Builder`);
  out.push(`-- Domene: ${domainLabel(domain)} · Dialekt: ${dialectLabel(dialect)}`);
  out.push("-- =====================================================================");
  out.push("");

  if (rationales.length > 0) {
    out.push("-- Designvalg:");
    for (const r of rationales) out.push(`--   • ${r}`);
    out.push("");
  }

  // 5a. DROP TABLE IF EXISTS i omvendt rekkefølge (children først).
  out.push("-- Drop i omvendt FK-rekkefølge så children forsvinner før parents:");
  const dropOrder = [...ordered].reverse();
  for (const t of dropOrder) {
    if (dialect === "mysql") {
      out.push(`DROP TABLE IF EXISTS ${quoteIdent(t.name, dialect)};`);
    } else {
      out.push(`DROP TABLE IF EXISTS ${quoteIdent(t.name, dialect)} CASCADE;`);
    }
  }
  out.push("");

  // 5b. CREATE TABLE i topologisk rekkefølge.
  for (const t of ordered) {
    if (t.comment) out.push(`-- ${t.comment}`);
    out.push(`CREATE TABLE ${quoteIdent(t.name, dialect)} (`);
    const hasCompositePk = !!t.primaryKey;
    const colLines: string[] = [];
    for (const col of t.columns) {
      colLines.push(...renderColumn(col, dialect, hasCompositePk, selected));
    }
    // Composite PK
    if (t.primaryKey) {
      colLines.push(
        `  PRIMARY KEY (${t.primaryKey.map((c) => quoteIdent(c, dialect)).join(", ")})`,
      );
    }
    // Composite UNIQUE
    if (t.uniques) {
      for (const u of t.uniques) {
        colLines.push(
          `  UNIQUE (${u.map((c) => quoteIdent(c, dialect)).join(", ")})`,
        );
      }
    }
    // FK-constraints (eksplisitt som tabell-constraint så vi får navngitte FK-er).
    for (const col of t.columns) {
      if (!col.references) continue;
      const ref = col.references;
      const refCol = ref.column ?? "id";
      colLines.push(
        `  FOREIGN KEY (${quoteIdent(col.name, dialect)}) REFERENCES ${quoteIdent(ref.table, dialect)} (${quoteIdent(refCol, dialect)})`,
      );
    }
    // Table-level CHECKs
    if (t.tableChecks && selected.has("con-check-pris")) {
      for (const chk of t.tableChecks) colLines.push(`  CHECK (${chk})`);
    }
    out.push(colLines.join(",\n"));
    // MySQL: ENGINE-klausul.
    if (dialect === "mysql") {
      out.push(") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    } else {
      out.push(");");
    }
    out.push("");
  }

  // 5c. Indekser.
  const indexes: string[] = [];
  if (selected.has("idx-fk-auto")) {
    indexes.push(
      "-- FK-indekser (PostgreSQL lager dem ikke automatisk; MySQL/InnoDB gjør):",
    );
    for (const t of ordered) {
      for (const col of t.columns) {
        if (col.references) {
          indexes.push(
            `CREATE INDEX idx_${t.name}_${col.name} ON ${quoteIdent(t.name, dialect)} (${quoteIdent(col.name, dialect)});`,
          );
        }
      }
    }
  }
  if (selected.has("idx-epost")) {
    indexes.push("");
    indexes.push("-- Eksplisitt indeks på epost-kolonner:");
    for (const t of ordered) {
      for (const col of t.columns) {
        if (col.name === "epost") {
          indexes.push(
            `CREATE INDEX idx_${t.name}_epost ON ${quoteIdent(t.name, dialect)} (${quoteIdent(col.name, dialect)});`,
          );
        }
      }
    }
  }
  if (selected.has("idx-dato")) {
    indexes.push("");
    indexes.push("-- Indekser på dato/timestamp-kolonner (for rapporter):");
    const dateNames = new Set([
      "opprettet",
      "bestilt",
      "tidspunkt",
      "starter",
      "slutter",
      "satt_dato",
      "laant_dato",
      "levert_dato",
    ]);
    for (const t of ordered) {
      for (const col of t.columns) {
        if (dateNames.has(col.name)) {
          indexes.push(
            `CREATE INDEX idx_${t.name}_${col.name} ON ${quoteIdent(t.name, dialect)} (${quoteIdent(col.name, dialect)});`,
          );
        }
      }
    }
  }
  if (indexes.length > 0) {
    out.push(...indexes);
    out.push("");
  }

  // 6. Helt til slutt: liten kommentar om hva som mangler.
  out.push("-- =====================================================================");
  out.push("-- Klar til kjøring. Test gjerne ved å INSERT-e en rad i hver tabell");
  out.push("-- og verifiser at FK-er, CHECK-s og UNIQUE-s slår inn som forventet.");
  out.push("-- =====================================================================");

  return out.join("\n");
}

function domainLabel(d: Domain): string {
  switch (d) {
    case "webshop":
      return "Webshop";
    case "skole":
      return "Skole-system";
    case "utleie":
      return "Maskinutleie";
    case "bibliotek":
      return "Bibliotek";
  }
}

function dialectLabel(d: Dialect): string {
  switch (d) {
    case "mysql":
      return "MySQL/InnoDB";
    case "postgresql":
      return "PostgreSQL";
    case "sqlite":
      return "SQLite";
  }
}

// Re-export for testing.
export type { SchemaOption };
