import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-dte2507-ospf-dijkstra",
  slug: "dte2507-ospf-dijkstra",
  title: "OSPF — link-state ruting",
  group: "stack",
  order: 845,
  status: "ready",
  shortDescription: "Kurose kap. 5.3. Stegvis Dijkstra på et 6-ruter-nett, klikkbare link-kostnader, og forwarding-tabellen som bygges opp.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2507-ospf-dijkstra/Dte2507OspfDijkstraPage").then((m) => ({ default: m.Dte2507OspfDijkstraPage })),
  ),
};
