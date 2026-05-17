import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2602-regresjon-diagnostikk",
  slug: "dte2602-regresjon-diagnostikk",
  title: "DTE-2602 — Regresjon-diagnostikk",
  group: "eksamen",
  order: 113,
  status: "ready",
  shortDescription:
    "Drag-og-slipp scatter med live residual/Q-Q/leverage-plot, 5 uhellsbilder (heteroskedastisitet, ikke-linearitet, outlier, influential, multikollinaritet med VIF-slider), Cook's D-heatmap med fjern-og-se-effekt, og 5 OLS-antakelser med diagnose + fiks.",
  prerequisites: [
    { slug: "dte2602-lineaer-regresjon", title: "Lineær regresjon fra null" },
  ],
  Component: lazy(() =>
    import("@/components/stack/dte2602-regresjon-diagnostikk/RegresjonDiagnostikkPage").then(
      (m) => ({ default: m.RegresjonDiagnostikkPage }),
    ),
  ),
};
