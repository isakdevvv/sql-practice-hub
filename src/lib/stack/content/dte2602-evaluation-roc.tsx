import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2602-evaluation-roc",
  slug: "dte2602-evaluation-roc",
  title: "Forvirringsmatrise, F1 og ROC-AUC",
  group: "eksamen",
  order: 30,
  status: "ready",
  shortDescription:
    "TP/FP/FN/TN, precision/recall/F1, ROC-kurve med flyttbar terskel. Ubalansert data og terskel-valg.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2602-evaluation-roc/Dte2602EvaluationRocPage").then((m) => ({ default: m.Dte2602EvaluationRocPage }))),
};
