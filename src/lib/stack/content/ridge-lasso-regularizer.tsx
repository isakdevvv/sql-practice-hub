import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-ridge-lasso-regularizer",
  slug: "ridge-lasso-regularizer",
  title: "Ridge & Lasso — regulariserings-lab",
  group: "stack",
  order: 830,
  status: "ready",
  shortDescription: "Géron kap. 4, ISLR kap. 6, MML kap. 7. Live λ-slider som viser hvordan L2 krymper alle koeffisienter og L1 driver noen helt til null.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/ridge-lasso-regularizer/RidgeLassoRegularizerPage").then((m) => ({ default: m.RidgeLassoRegularizerPage })),
  ),
};
