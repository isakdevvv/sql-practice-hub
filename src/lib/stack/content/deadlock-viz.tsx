import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-deadlock-viz",
  slug: "deadlock-viz",
  title: "Deadlock — RAG + Bankers",
  group: "stack",
  order: 804,
  status: "ready",
  shortDescription:
    "De fire Coffman-betingelsene, ressurs-allokeringsgraf med syklus-deteksjon, og Bankers algoritme du kan editere tabellen til.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/deadlock-viz/DeadlockVizPage").then((m) => ({
      default: m.DeadlockVizPage,
    })),
  ),
};
