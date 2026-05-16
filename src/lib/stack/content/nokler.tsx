import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-nokler",
  slug: "nokler",
  title: "Primær- og fremmednøkler",
  group: "eksamen",
  order: 9,
  status: "ready",
  shortDescription:
    "Surrogat vs naturlig PK, beslutningstre, og hvordan PK/FK ser ut i 1:1, 1:N, M:N, svak entitet og rekursive relasjoner.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/nokler/NoklerPage").then((m) => ({ default: m.NoklerPage }))),
};
