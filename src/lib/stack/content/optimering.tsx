import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-optimering",
  slug: "optimering",
  title: "Optimerere & learning rate",
  group: "eksamen",
  order: 41,
  status: "ready",
  shortDescription:
    "SGD vs momentum vs Adam, learning rate schedules, gradient clipping — slik konvergerer modellen.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/optimering/OptimeringPage").then((m) => ({ default: m.OptimeringPage }))),
};
