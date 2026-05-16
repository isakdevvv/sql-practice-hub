import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2501-genetic",
  slug: "dte2501-genetic-algorithms",
  title: "Genetic algorithms, swarm, ACO",
  group: "eksamen",
  order: 43,
  status: "ready",
  shortDescription:
    "GA-operatorer (seleksjon, crossover, mutasjon). Particle Swarm Optimization og Ant Colony Optimization.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2501-ml/GeneticPage").then((m) => ({ default: m.GeneticPage }))),
};
