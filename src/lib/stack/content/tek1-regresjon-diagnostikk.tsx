import { Tek1RegresjonDiagnostikkPage } from "@/components/stack/tek1-regresjon-diagnostikk/Tek1RegresjonDiagnostikkPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek1-regresjon-diagnostikk",
  slug: "tek1-regresjon-diagnostikk",
  title: "TEK-1501 — Regresjon-diagnostikk",
  group: "eksamen",
  order: 14,
  status: "ready",
  shortDescription:
    "Residualplott, Q-Q, Cook's D, R² vs R²-adj, VIF og 4 OLS-antakelser. Scatter + residual + Q-Q side-by-side for 4 scenarier.",
  prerequisites: [],
  Component: Tek1RegresjonDiagnostikkPage,
};
