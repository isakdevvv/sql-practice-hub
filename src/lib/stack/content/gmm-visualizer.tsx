import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-gmm-visualizer",
  slug: "gmm-visualizer",
  title: "GMM — Gaussian Mixture Models",
  group: "stack",
  order: 865,
  status: "ready",
  shortDescription: "Géron kap. 8, MML kap. 11. EM-iterasjoner på 2D data med 3 klynger med ulike former — k-Means kunne ikke ha funnet.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/gmm-visualizer/GmmVisualizerPage").then((m) => ({ default: m.GmmVisualizerPage }))),
};
