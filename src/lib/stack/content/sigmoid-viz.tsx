import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-sigmoid-viz",
  slug: "sigmoid-viz",
  title: "Sigmoid — σ(wx + b)",
  group: "stack",
  order: 801,
  status: "ready",
  shortDescription:
    "Dra w og b. Se beslutningsgrensa flytte seg. Pluss en plot av σ' som viser hvor vanishing gradient kommer fra.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/sigmoid-viz/SigmoidVizPage").then((m) => ({
      default: m.SigmoidVizPage,
    })),
  ),
};
