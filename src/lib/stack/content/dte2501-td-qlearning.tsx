import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-dte2501-td-qlearning",
  slug: "dte2501-td-qlearning",
  title: "TD-læring & Q-learning — gridworld",
  group: "stack",
  order: 825,
  status: "ready",
  shortDescription: "Sutton & Barto kap. 6 + AIMA kap. 21. Interaktiv gridworld der Q-tabellen lærer optimal policy uten å kjenne reglene.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2501-td-qlearning/Dte2501TdQlearningPage").then((m) => ({ default: m.Dte2501TdQlearningPage })),
  ),
};
