import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-1-transistor",
  slug: "trinn-1-transistor",
  title: "1. Transistoren som bryter",
  group: "stack",
  order: 1,
  status: "ready",
  shortDescription: "MOSFET som bryter styrt av spenning. Selve byggesteinen.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/trinn-1-transistor/Trinn1TransistorPage").then((m) => ({ default: m.Trinn1TransistorPage }))),
};
