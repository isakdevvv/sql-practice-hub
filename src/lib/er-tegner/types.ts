// Types for the lightweight ER-diagram builder (route /er-tegner).
//
// The model is intentionally form-shaped, not canvas-shaped: layout is
// derived from the model in svgLayout.ts, not stored on each entity. The
// crow's-foot symbol vocabulary mirrors `src/components/learn/CrowsFoot.tsx`
// — min ∈ {"|","O"}, max ∈ {"|","<"} — so users see the same symbols here as
// in the kråkefot-øvelser.

export type SqlType = "INTEGER" | "TEXT" | "REAL" | "BLOB";

export type CfMin = "|" | "O";
export type CfMax = "|" | "<";

/** Cardinality marker for one end of a relationship (e.g. "||", "O<"). */
export type CfEnd = `${CfMin}${CfMax}`;

export interface Attribute {
  /** Stable id used as React key — never shown to the user. */
  id: string;
  /** Column name as it'll appear in the generated SQL. */
  name: string;
  type: SqlType;
  notNull: boolean;
}

export interface Entity {
  id: string;
  /** Display + table name. Lower-cased on SQL output to match repo conventions. */
  name: string;
  attributes: Attribute[];
  /** Id of the attribute that's the primary key for this entity. */
  pkAttributeId: string | null;
}

export interface ErRelationship {
  id: string;
  /** Free-form label shown on the diagram line (optional). */
  label?: string;
  fromEntityId: string;
  toEntityId: string;
  /** Cardinality marker on the `from` end (closest to fromEntity). */
  fromEnd: CfEnd;
  /** Cardinality marker on the `to` end (closest to toEntity). */
  toEnd: CfEnd;
}

export interface ErModel {
  entities: Entity[];
  relationships: ErRelationship[];
}
