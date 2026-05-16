import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte-2501",
  slug: "dte-2501",
  title: "DTE-2501 AI Methods and Applications — hub",
  group: "eksamen",
  order: 26,
  status: "ready",
  shortDescription:
    "Fem mini-kurs som dekker DTE-2501-pensum: søk, CSP, logikk, planlegging og Bayes.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte-2501/Dte2501Hub").then((m) => ({ default: m.Dte2501Hub }))),
};
