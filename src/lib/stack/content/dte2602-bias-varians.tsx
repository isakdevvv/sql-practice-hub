import { Dte2602BiasVariansPage } from "@/components/stack/dte2602-bias-varians/Dte2602BiasVariansPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2602-bias-varians",
  slug: "dte2602-bias-varians",
  title: "Bias-varians & regularisering",
  group: "eksamen",
  order: 29,
  status: "ready",
  shortDescription:
    "E[(ŷ-y)²]=bias²+var+støy, læringskurver, Ridge (L2) og Lasso (L1). Slider: polynom-grad og Lasso-path.",
  prerequisites: [],
  Component: Dte2602BiasVariansPage,
};
