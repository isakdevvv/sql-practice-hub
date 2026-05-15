import { MoocBibliotekPage } from "@/components/stack/mooc-bibliotek/MoocBibliotekPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-mooc-bibliotek",
  slug: "mooc-bibliotek",
  title: "10 gratis universitetskurs en data-ingeniør faktisk kan ta",
  group: "stack",
  order: 92,
  status: "ready",
  shortDescription:
    "MIT, Stanford, Harvard, CMU, Berkeley — alle gratis. CS50, MIT 6.006/6.S081, Stanford CS144/229/231n, CMU 15-445 (Pavlo), Berkeley CS61A, MIT 6.S191, CS50W. Per fag-tabell + realistisk planleggings-råd.",
  prerequisites: [],
  Component: MoocBibliotekPage,
};
