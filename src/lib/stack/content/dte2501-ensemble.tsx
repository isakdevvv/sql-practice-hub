import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2501-ensemble",
  slug: "dte2501-ensemble",
  title: "Ensemble — bagging og boosting",
  group: "eksamen",
  order: 47,
  status: "ready",
  shortDescription:
    "Bias-variance dekomponering. Bagging og Random Forest. AdaBoost og gradient boosting.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2501-ml/EnsemblePage").then((m) => ({ default: m.EnsemblePage }))),
};
