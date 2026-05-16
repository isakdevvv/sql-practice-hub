import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-3-adders",
  slug: "trinn-3-adders",
  title: "3. Adders & flip-flops",
  group: "stack",
  order: 3,
  status: "ready",
  shortDescription: "Half-adder, full-adder, og hvordan én bit lagres i en flip-flop.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/trinn-3-adders/Trinn3AddersPage").then((m) => ({ default: m.Trinn3AddersPage }))),
};
