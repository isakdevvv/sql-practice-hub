import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2501-knn",
  slug: "dte2501-knn",
  title: "k-Nearest Neighbors",
  group: "eksamen",
  order: 40,
  status: "ready",
  shortDescription:
    "Lazy learning, distansemål, bias-variance, k-valg. k-NN for klassifikasjon og regresjon.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2501-ml/KnnPage").then((m) => ({ default: m.KnnPage }))),
};
