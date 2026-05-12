import { Dte2602EvalueringPage } from "@/components/stack/dte2602-evaluering-metoder/Dte2602EvalueringPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2602-evaluering",
  slug: "dte2602-evaluering-metoder",
  title: "DTE-2602 — Evaluering og eksperiment-design",
  group: "eksamen",
  order: 27,
  status: "ready",
  shortDescription:
    "Train/val/test, k-fold, stratifisering, metrikker (precision/recall/F1/ROC-AUC, RMSE/R²), confusion matrix, grid/random search, lekkasje.",
  prerequisites: [],
  Component: Dte2602EvalueringPage,
};
