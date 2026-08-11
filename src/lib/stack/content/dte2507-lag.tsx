import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-lag",
  slug: "dte2507-lag",
  title: "DTE-2507 — lag for lag",
  group: "eksamen",
  order: 31,
  status: "ready",
  shortDescription:
    "Faget i ni lag etter pensumlogikken: hva hvert lag handler om, hva du skal klare uten hjelp, hvilket innhold som dekker det — og hvor hullene er. Ikke verifisert mot Canvas.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2507-moduler/Dte2507LagPage").then((m) => ({
      default: m.Dte2507LagPage,
    })),
  ),
};
