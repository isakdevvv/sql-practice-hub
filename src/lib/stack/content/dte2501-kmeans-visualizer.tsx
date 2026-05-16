import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2501-kmeans-visualizer",
  slug: "dte2501-kmeans-visualizer",
  title: "k-Means live-plot",
  group: "eksamen",
  order: 120,
  status: "ready",
  shortDescription:
    "Interaktiv 2D-visualisering av Lloyd's algoritme. Velg k, dataset (Iris-2-features, blobs, moons, klikk selv), steg gjennom ASSIGN/UPDATE eller animer til konvergens. Inertia-graf per steg.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2501-kmeans-visualizer/KMeansVisualizerPage").then(
      (m) => ({ default: m.KMeansVisualizerPage }),
    ),
  ),
};
