import { DpPage } from "@/components/stack/dte2501-ml/DpPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2501-dp",
  slug: "dte2501-dp",
  title: "Dynamic Programming og TSP",
  group: "eksamen",
  order: 49,
  status: "ready",
  shortDescription:
    "Optimal substructure + overlapping subproblems. Memoization vs tabulation. Held-Karp DP for TSP.",
  prerequisites: [],
  Component: DpPage,
};
