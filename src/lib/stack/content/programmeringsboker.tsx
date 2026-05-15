import { ProgrammeringsbokerPage } from "@/components/stack/programmeringsboker/ProgrammeringsbokerPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-programmeringsboker",
  slug: "programmeringsboker",
  title: "15 bøker en data-ingeniør faktisk trenger",
  group: "stack",
  order: 90,
  status: "ready",
  shortDescription:
    "15 bøker kuratert for hele DTE-bachelor: 10 hovedbøker (Petzold, OSTEP, Kurose, DDIA, AIMA, Géron, Nielsen, ISLR, MML, Pragmatic) + 5 i bølge 2 (Crafting Interpreters, Database Internals, Designing ML Systems, Grokking Algorithms, Refactoring). 5 gratis.",
  prerequisites: [],
  Component: ProgrammeringsbokerPage,
};
