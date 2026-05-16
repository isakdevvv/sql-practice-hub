import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dynamic-programming",
  slug: "dynamic-programming",
  title: "Dynamic programming",
  group: "eksamen",
  order: 19,
  status: "ready",
  shortDescription:
    "Overlapping subproblems + optimal substructure. Memoisering vs tabulering. Fibonacci, knapsack, LCS, coin change, edit distance.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dynamic-programming/DynamicProgrammingPage").then((m) => ({ default: m.DynamicProgrammingPage }))),
};
