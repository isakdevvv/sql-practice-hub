import { SokAlgoritmerPage } from "@/components/stack/sok-algoritmer/SokAlgoritmerPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-sok-algoritmer",
  slug: "sok-algoritmer",
  title: "Søkealgoritmer i AI",
  group: "eksamen",
  order: 27,
  status: "ready",
  shortDescription:
    "BFS, DFS, UCS, iterative deepening, greedy og A*. Heuristikker, admissibility, completeness og optimality.",
  prerequisites: [],
  Component: SokAlgoritmerPage,
};
