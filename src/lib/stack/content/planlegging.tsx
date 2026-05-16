import { lazy } from "react";
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
  Component: lazy(() => import("@/components/stack/planlegging/PlanleggingPage").then((m) => ({ default: m.PlanleggingPage }))),
};
