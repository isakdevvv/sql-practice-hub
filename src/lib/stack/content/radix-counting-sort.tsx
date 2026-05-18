import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-radix-counting-sort",
  slug: "radix-counting-sort",
  title: "Counting & Radix sort",
  group: "stack",
  order: 802,
  status: "ready",
  shortDescription:
    "Ikke-sammenligningsbasert sortering i O(n+k). Steg gjennom telling, prefix-sum og bøtte-passes for å se hvordan vi bryter Ω(n log n)-grensa.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/radix-counting-sort/RadixCountingSortPage").then((m) => ({
      default: m.RadixCountingSortPage,
    })),
  ),
};
