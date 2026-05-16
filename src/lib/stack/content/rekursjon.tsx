import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-rekursjon",
  slug: "rekursjon",
  title: "Rekursjon",
  group: "eksamen",
  order: 12,
  status: "ready",
  shortDescription:
    "Base case + rekursivt steg, kallstacken, klassikere (fakultet, fib, flatten, ruler), rekursjon vs iterasjon.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/rekursjon/RekursjonPage").then((m) => ({ default: m.RekursjonPage }))),
};
