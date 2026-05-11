import { UnsupervisedPage } from "@/components/stack/unsupervised-learning/UnsupervisedPage";
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
  Component: UnsupervisedPage,
};
