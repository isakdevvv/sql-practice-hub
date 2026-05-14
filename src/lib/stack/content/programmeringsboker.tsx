import { ProgrammeringsbokerPage } from "@/components/stack/programmeringsboker/ProgrammeringsbokerPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-programmeringsboker",
  slug: "programmeringsboker",
  title: "10 bøker en data-ingeniør faktisk trenger",
  group: "stack",
  order: 90,
  status: "ready",
  shortDescription:
    "Petzold, OSTEP, Kurose, DDIA, AIMA, Géron, Nielsen, ISLR, MML, Pragmatic — kuratert for hele DTE-bachelor med best-i-klassen metaforer per fag. 5 av 10 er gratis.",
  prerequisites: [],
  Component: ProgrammeringsbokerPage,
};
