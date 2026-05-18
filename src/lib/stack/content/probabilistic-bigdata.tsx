import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-probabilistic-bigdata",
  slug: "probabilistic-bigdata",
  title: "Probabilistiske & storskala-algoritmer",
  group: "stack",
  order: 820,
  status: "ready",
  shortDescription:
    "Bloom filter, HyperLogLog, MinHash/LSH, SHA-avalanche og MapReduce — fem moduler som dekker Grokking Algorithms kap. 13 «hvor du går videre».",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/probabilistic-bigdata/ProbabilisticBigDataPage").then((m) => ({
      default: m.ProbabilisticBigDataPage,
    })),
  ),
};
