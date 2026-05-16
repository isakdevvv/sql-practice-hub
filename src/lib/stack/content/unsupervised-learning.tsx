import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-unsupervised",
  slug: "unsupervised-learning",
  title: "Unsupervised learning",
  group: "eksamen",
  order: 24,
  status: "ready",
  shortDescription:
    "k-means, elbow + silhouette, hierarchical klustering, PCA, anomalydeteksjon.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/unsupervised-learning/UnsupervisedPage").then((m) => ({ default: m.UnsupervisedPage }))),
};
