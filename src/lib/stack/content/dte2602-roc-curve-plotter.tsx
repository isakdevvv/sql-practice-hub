import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2602-roc-curve-plotter",
  slug: "dte2602-roc-curve-plotter",
  title: "DTE-2602 — ROC-kurve interaktiv",
  group: "eksamen",
  order: 113,
  status: "ready",
  shortDescription:
    "Skyv terskelen, se ROC-kurven, confusion matrix og AUC oppdateres live. Velg modell-kvalitet for å se hvordan separasjon påvirker AUC.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2602-roc-curve-plotter/Dte2602RocCurvePlotterPage").then((m) => ({
      default: m.Dte2602RocCurvePlotterPage,
    })),
  ),
};
