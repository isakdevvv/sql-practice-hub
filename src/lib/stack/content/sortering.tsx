import { SorteringPage } from "@/components/stack/sortering/SorteringPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-sortering",
  slug: "sortering",
  title: "Sortering",
  group: "eksamen",
  order: 13,
  status: "ready",
  shortDescription:
    "Bubble, selection, insertion (O(n²)) + mergesort, quicksort, heapsort (O(n log n)). Stabilitet, in-place, beste/verste.",
  prerequisites: [],
  Component: SorteringPage,
};
