import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2501-ga-encoding-lab",
  slug: "dte2501-ga-encoding-lab",
  title: "GA Encoding Lab — binary, real, order, tree",
  group: "eksamen",
  order: 44,
  status: "ready",
  shortDescription:
    "Bytt mellom 4 encoding-strategier (knapsack, kontinuerlig 2D, TSP, symbolic regression). Se hvordan crossover og mutation oppfører seg helt forskjellig. Grokking AI kap. 5.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2501-ga-encoding/GaEncodingLabPage").then((m) => ({
      default: m.GaEncodingLabPage,
    })),
  ),
};
