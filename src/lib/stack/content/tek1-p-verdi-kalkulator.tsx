import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek1-p-verdi-kalkulator",
  slug: "tek1-p-verdi-kalkulator",
  title: "TEK-1501 — p-verdi-kalkulator",
  group: "eksamen",
  order: 111,
  status: "ready",
  shortDescription:
    "Skriv inn test-statistikk for z, t, χ² eller F. Få ensidig + tosidig p-verdi pluss visualisering av hva som er halen.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/tek1-p-verdi-kalkulator/Tek1PVerdiKalkulatorPage").then((m) => ({
      default: m.Tek1PVerdiKalkulatorPage,
    })),
  ),
};
