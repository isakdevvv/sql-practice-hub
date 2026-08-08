import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-obliger",
  slug: "dte2505-obliger",
  title: "DTE-2505 — speil-obliger",
  group: "eksamen",
  order: 38,
  status: "ready",
  shortDescription:
    "Seks obligatoriske innleveringer speilet fra Canvas (1.1, 1.2, 2, 3, 4 og 5), med riktige frister og poeng. Steg-svar med automatisk sjekk.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2505-obliger/ObligerHub").then((m) => ({ default: m.ObligerHub }))),
};
