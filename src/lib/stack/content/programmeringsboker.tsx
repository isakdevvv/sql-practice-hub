import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-programmeringsboker",
  slug: "programmeringsboker",
  title: "20 bøker en data-ingeniør faktisk trenger",
  group: "stack",
  order: 90,
  status: "ready",
  shortDescription:
    "20 bøker kuratert for hele DTE-bachelor i 3 bølger. Bølge 1 (10 hovedbøker), bølge 2 (5 spesialister: Crafting Interpreters, Database Internals, ML Systems, Grokking Algorithms, Refactoring), bølge 3 (5 gratis-tunge: HPBN, Google SRE, Goodfellow DL, Sutton & Barto RL, Fluent Python). 9 av 20 er gratis.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/programmeringsboker/ProgrammeringsbokerPage").then((m) => ({ default: m.ProgrammeringsbokerPage }))),
};
