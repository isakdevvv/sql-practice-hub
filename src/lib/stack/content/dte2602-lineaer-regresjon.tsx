import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2602-lineaer-regresjon",
  slug: "dte2602-lineaer-regresjon",
  title: "DTE-2602 — Lineær regresjon fra null",
  group: "eksamen",
  order: 112,
  status: "ready",
  shortDescription:
    "Teori for OLS (β₀, β₁), interaktiv plot der du drar datapunkter og ser regresjonslinjen, R², RSS og residualer oppdateres live.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2602-lineaer-regresjon/Dte2602LineaerRegresjonPage").then((m) => ({
      default: m.Dte2602LineaerRegresjonPage,
    })),
  ),
};
