import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-funksjonell-programmering",
  slug: "funksjonell-programmering",
  title: "Funksjonell programmering — språk-agnostisk",
  group: "stack",
  order: 67,
  status: "ready",
  shortDescription:
    "Pure functions, immutability, higher-order, map/filter/reduce, currying, lazy evaluation, Maybe/Result.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/funksjonell-programmering/FunksjonellProgrammeringPage").then((m) => ({ default: m.FunksjonellProgrammeringPage }))),
};
