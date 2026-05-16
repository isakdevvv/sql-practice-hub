import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2501-pca-visualizer",
  slug: "dte2501-pca-visualizer",
  title: "PCA interaktiv projeksjon",
  group: "eksamen",
  order: 121,
  status: "ready",
  shortDescription:
    "2D scatter (Iris/Wine) med PC1 og PC2 som piler. Slider for rotasjons-vinkel viser hvordan PCA maksimerer varians. Projeksjon på PC1 vs PC1+PC2. Explained variance ratio som bar-chart.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2501-pca-visualizer/PcaVisualizerPage").then(
      (m) => ({ default: m.PcaVisualizerPage }),
    ),
  ),
};
