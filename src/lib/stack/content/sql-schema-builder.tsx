import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-sql-schema-builder",
  slug: "sql-schema-builder",
  title: "SQL Schema Builder",
  group: "stack",
  order: 96,
  status: "ready",
  shortDescription:
    "Kryss av domene (webshop, skole, utleie, bibliotek), entiteter, normaliseringsnivå (1NF — BCNF), constraints og dialekt (MySQL/PostgreSQL/SQLite). Får ferdig CREATE TABLE-skript med FK-er, CHECK, UNIQUE, DEFAULT og indekser — DROP i omvendt rekkefølge og CREATE i topologisk rekkefølge.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/sql-schema-builder/SqlSchemaBuilderPage").then(
      (m) => ({ default: m.SqlSchemaBuilderPage }),
    ),
  ),
};
