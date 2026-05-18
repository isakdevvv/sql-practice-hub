import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-greedy-np-viz",
  slug: "greedy-np-viz",
  title: "Greedy & NP — approksimasjon",
  group: "stack",
  order: 815,
  status: "ready",
  shortDescription:
    "Set cover greedy, TSP nærmeste-nabo vs optimum, knapsack greedy vs DP, og P-vs-NP «verifiser vs løs»-demo. Hvorfor «godt nok» ofte er det beste vi kan.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/greedy-np-viz/GreedyNpVizPage").then((m) => ({
      default: m.GreedyNpVizPage,
    })),
  ),
};
