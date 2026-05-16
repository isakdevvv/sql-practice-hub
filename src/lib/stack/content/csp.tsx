import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-csp",
  slug: "csp",
  title: "Constraint Satisfaction Problems",
  group: "eksamen",
  order: 28,
  status: "ready",
  shortDescription:
    "CSP-formulering, backtracking, AC-3, forward checking, MRV/LCV-heuristikker.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/csp/CspPage").then((m) => ({ default: m.CspPage }))),
};
