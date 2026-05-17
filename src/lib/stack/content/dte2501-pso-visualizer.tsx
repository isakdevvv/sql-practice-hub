import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2501-pso-visualizer",
  slug: "dte2501-pso-visualizer",
  title: "PSO live-sverm",
  group: "eksamen",
  order: 121,
  status: "ready",
  shortDescription:
    "Interaktiv 2D-partikkelsverm på Rastrigin / Ackley / fjell-og-daler. Juster w, c1, c2, n og spread, se konvergens-graf, og identifiser tre presets («for høy inertia», «for lav c2», «balansert»).",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2501-pso-visualizer/PsoVisualizerPage").then(
      (m) => ({ default: m.PsoVisualizerPage }),
    ),
  ),
};
