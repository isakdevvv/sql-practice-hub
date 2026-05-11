import { OptimeringPage } from "@/components/stack/optimering/OptimeringPage";
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
  Component: OptimeringPage,
};
