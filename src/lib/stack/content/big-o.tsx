import { BigOPage } from "@/components/stack/big-o/BigOPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-big-o",
  slug: "big-o",
  title: "Big-O — kompleksitetsanalyse",
  group: "eksamen",
  order: 11,
  status: "ready",
  shortDescription:
    "De syv klassene, tre analyse-regler, beste/verste/forventet tilfelle, vanlige feller — rammeverket alle de andre algoritme-temaene bygger på.",
  prerequisites: [],
  Component: BigOPage,
};
