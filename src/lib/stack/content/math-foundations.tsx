import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-math-foundations",
  slug: "math-foundations",
  title: "Math foundations — fase 0 hub",
  group: "eksamen",
  order: 1,
  status: "ready",
  shortDescription:
    "Hub for matematisk grunnlag: diskret matte, sannsynlighet, linær algebra. Prerekvisitt for algoritmer og ML.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/math-foundations/MathFoundationsHub").then((m) => ({ default: m.MathFoundationsHub }))),
};
