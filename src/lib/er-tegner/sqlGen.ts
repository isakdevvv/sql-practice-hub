// SQL generator for the ER-tegner.
//
// Each entity → one CREATE TABLE. The PK attribute gets `PRIMARY KEY`.
// For each 1—N relationship we add a `FOREIGN KEY` on the N-side referencing
// the 1-side's PK. M—N (mange-til-mange) becomes a junction table with a
// composite PK over the two FK-columns.
//
// "How many is on each end" is read from CfEnd: max="<" means many, max="|"
// means one. Min ("|" vs "O") only affects whether the FK column is
// NOT NULL — see decideForeignKeyNullability below. We do not currently
// generate UNIQUE for 1—1 because the seed model doesn't need it; the comment
// in the function notes where it would go.

import type {
  Attribute,
  CfEnd,
  Entity,
  ErModel,
  ErRelationship,
  SqlType,
} from "./types";

function tableName(e: Entity): string {
  return e.name.trim().toLowerCase().replace(/\s+/g, "_");
}

function colName(a: Attribute): string {
  return a.name.trim().toLowerCase().replace(/\s+/g, "_");
}

function maxIsMany(end: CfEnd): boolean {
  return end.endsWith("<");
}

function minIsMandatory(end: CfEnd): boolean {
  return end.startsWith("|");
}

/** Right-pad a column name so the type column lines up across rows. */
function pad(s: string, n: number): string {
  return s.length >= n ? s : s + " ".repeat(n - s.length);
}

function renderAttribute(a: Attribute, isPk: boolean, nameWidth: number): string {
  const parts: string[] = [pad(colName(a), nameWidth), a.type];
  if (isPk) {
    parts.push("PRIMARY KEY");
  } else if (a.notNull) {
    parts.push("NOT NULL");
  }
  return parts.join(" ");
}

interface ResolvedRel {
  rel: ErRelationship;
  one: Entity;
  many: Entity;
  /** True iff cardinality is 1—N or N—1. */
  isOneToMany: boolean;
  /** True iff cardinality is M—N. */
  isManyToMany: boolean;
  /** Whether the FK on the many side should be NOT NULL. */
  fkNotNull: boolean;
}

/**
 * Classify a relationship into 1—1, 1—N, or M—N. We don't try to model
 * 0..1 vs 1..1 separately at SQL level beyond NOT NULL — see the body of
 * generateSql for where that gets applied.
 */
function classify(
  rel: ErRelationship,
  byId: Map<string, Entity>,
): ResolvedRel | null {
  const a = byId.get(rel.fromEntityId);
  const b = byId.get(rel.toEntityId);
  if (!a || !b) return null;
  const aMany = maxIsMany(rel.fromEnd);
  const bMany = maxIsMany(rel.toEnd);
  const isManyToMany = aMany && bMany;
  const isOneToMany = aMany !== bMany;
  // For a 1—N: the "many"-side gets the FK; min on that side decides NOT NULL.
  // (Min on the *other* side — the "one" side — is what fromEnd/toEnd's
  // min-symbol describes; see CrowsFoot.tsx slot semantics. We use the min
  // closest to the one side as the indicator of mandatory participation
  // from many → one.)
  const oneSideEnd: CfEnd = aMany ? rel.toEnd : rel.fromEnd;
  return {
    rel,
    one: aMany ? b : a,
    many: aMany ? a : b,
    isOneToMany,
    isManyToMany,
    fkNotNull: minIsMandatory(oneSideEnd),
  };
}

function pkAttribute(e: Entity): Attribute | null {
  return e.attributes.find((a) => a.id === e.pkAttributeId) ?? null;
}

/** Generate the FK type so the FK column's type matches the referenced PK. */
function fkType(referenced: Entity): SqlType {
  const pk = pkAttribute(referenced);
  return pk?.type ?? "INTEGER";
}

export function generateSql(model: ErModel): string {
  const byId = new Map(model.entities.map((e) => [e.id, e] as const));
  const resolved = model.relationships
    .map((r) => classify(r, byId))
    .filter((r): r is ResolvedRel => r !== null);

  // FKs to inject on each entity (1—N case).
  const fkColumnsByEntity = new Map<
    string,
    { col: string; type: SqlType; notNull: boolean; refTable: string; refCol: string }[]
  >();
  for (const r of resolved) {
    if (!r.isOneToMany) continue;
    const onePk = pkAttribute(r.one);
    if (!onePk) continue; // can't make an FK without a PK to point at
    const list = fkColumnsByEntity.get(r.many.id) ?? [];
    // Only add if the many-side doesn't already have a column with the PK's
    // name — otherwise users get a duplicate column when they manually added
    // an FK column and *also* declared the relationship.
    const exists = r.many.attributes.some(
      (a) => colName(a) === colName(onePk),
    );
    if (!exists) {
      list.push({
        col: colName(onePk),
        type: fkType(r.one),
        notNull: r.fkNotNull,
        refTable: tableName(r.one),
        refCol: colName(onePk),
      });
    } else {
      // Column already exists explicitly — still emit the FOREIGN KEY clause.
      list.push({
        col: colName(onePk),
        type: fkType(r.one),
        notNull: r.fkNotNull,
        refTable: tableName(r.one),
        refCol: colName(onePk),
      });
    }
    fkColumnsByEntity.set(r.many.id, list);
  }

  const tables: string[] = [];

  // Per-entity tables.
  for (const e of model.entities) {
    const lines: string[] = [];

    const explicitCols = e.attributes.slice();
    const pkId = e.pkAttributeId;
    const fks = fkColumnsByEntity.get(e.id) ?? [];

    // Compute name-column width across BOTH explicit attributes and FK-only
    // columns we'll inject, so everything lines up.
    const namesForWidth = [
      ...explicitCols.map(colName),
      ...fks
        .filter((fk) => !explicitCols.some((a) => colName(a) === fk.col))
        .map((fk) => fk.col),
    ];
    const nameWidth = namesForWidth.reduce((n, s) => Math.max(n, s.length), 0);

    for (const a of explicitCols) {
      lines.push(`    ${renderAttribute(a, a.id === pkId, nameWidth)}`);
    }
    // Injected FK columns (only the ones that aren't already declared
    // explicitly — those are already rendered above).
    for (const fk of fks) {
      const declaredAlready = explicitCols.some((a) => colName(a) === fk.col);
      if (declaredAlready) continue;
      const parts = [pad(fk.col, nameWidth), fk.type];
      if (fk.notNull) parts.push("NOT NULL");
      lines.push(`    ${parts.join(" ")}`);
    }
    // FOREIGN KEY clauses (always — for both injected and explicit FK cols).
    for (const fk of fks) {
      lines.push(
        `    FOREIGN KEY (${fk.col}) REFERENCES ${fk.refTable}(${fk.refCol})`,
      );
    }
    // 1—1 note: a UNIQUE on the FK column would model true 1—1 here, but the
    // seed example doesn't need it and the form has no checkbox for it yet.

    tables.push(`CREATE TABLE ${tableName(e)} (\n${lines.join(",\n")}\n);`);
  }

  // Junction tables for M—N relationships.
  for (const r of resolved) {
    if (!r.isManyToMany) continue;
    const aPk = pkAttribute(r.one); // for M—N, "one" and "many" are arbitrary
    const bPk = pkAttribute(r.many);
    if (!aPk || !bPk) continue;
    const aTbl = tableName(r.one);
    const bTbl = tableName(r.many);
    const aCol = `${aTbl}_${colName(aPk)}`;
    const bCol = `${bTbl}_${colName(bPk)}`;
    const jname = `${aTbl}_${bTbl}`;
    const nameWidth = Math.max(aCol.length, bCol.length);
    const lines = [
      `    ${pad(aCol, nameWidth)} ${aPk.type} NOT NULL`,
      `    ${pad(bCol, nameWidth)} ${bPk.type} NOT NULL`,
      `    PRIMARY KEY (${aCol}, ${bCol})`,
      `    FOREIGN KEY (${aCol}) REFERENCES ${aTbl}(${colName(aPk)})`,
      `    FOREIGN KEY (${bCol}) REFERENCES ${bTbl}(${colName(bPk)})`,
    ];
    tables.push(`CREATE TABLE ${jname} (\n${lines.join(",\n")}\n);`);
  }

  return tables.join("\n\n") + (tables.length ? "\n" : "");
}
