import { RekursjonPage } from "@/components/stack/rekursjon/RekursjonPage";
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
  Component: RekursjonPage,
};
