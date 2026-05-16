import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2602-cv-varianter",
  slug: "dte2602-cv-varianter",
  title: "DTE-2602 — Cross-validation-varianter",
  group: "eksamen",
  order: 12,
  status: "ready",
  shortDescription:
    "Validation-set, LOOCV, k-fold, Stratified, GroupKFold, TimeSeriesSplit. Bias-varians-tradeoff i CV-estimatet og interaktiv splitter.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2602-cv-varianter/CvVarianterPage").then((m) => ({ default: m.CvVarianterPage }))),
};
