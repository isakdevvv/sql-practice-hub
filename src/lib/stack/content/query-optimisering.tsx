import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-query-optimisering",
  slug: "query-optimisering",
  title: "Query-optimisering — EXPLAIN, joins og kost-modell",
  group: "stack",
  order: 132,
  status: "ready",
  shortDescription:
    "Hvordan SQL-motoren parser, optimiserer og kjører spørringer. EXPLAIN-output, join-algoritmer, scan-typer, ANALYZE, vanlige anti-mønstre, partitioning og materialized views.",
  prerequisites: [
    { slug: "indekser", title: "Indekser" },
  ],
  Component: lazy(() => import("@/components/stack/query-optimisering/QueryOptimiseringPage").then((m) => ({ default: m.QueryOptimiseringPage }))),
};
