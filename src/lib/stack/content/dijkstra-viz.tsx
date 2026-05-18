import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-dijkstra-viz",
  slug: "dijkstra-viz",
  title: "Dijkstra — korteste vei",
  group: "stack",
  order: 805,
  status: "ready",
  shortDescription:
    "Step gjennom Dijkstra på en vektet graf. Se hver visit, hver relax, og hvordan distance-tabellen oppdateres. Velg startnode fritt.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dijkstra-viz/DijkstraVizPage").then((m) => ({
      default: m.DijkstraVizPage,
    })),
  ),
};
