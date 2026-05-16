import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-grafer-dypere",
  slug: "grafer-dypere",
  title: "Grafer (algo)",
  group: "eksamen",
  order: 17,
  status: "ready",
  shortDescription:
    "Representasjon, BFS/DFS, Dijkstra, MST (Prim/Kruskal), topologisk sortering, A*. Klassiske grafproblemer.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/grafer-dypere/GraferDyperePage").then((m) => ({ default: m.GraferDyperePage }))),
};
