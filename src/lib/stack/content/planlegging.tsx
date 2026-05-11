import { PlanleggingPage } from "@/components/stack/planlegging/PlanleggingPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-planlegging",
  slug: "planlegging",
  title: "Planlegging",
  group: "eksamen",
  order: 30,
  status: "ready",
  shortDescription:
    "STRIPS-handlinger med preconditions/effects. Forward (progression) og backward (regression) planning.",
  prerequisites: [],
  Component: PlanleggingPage,
};
