import { Tek1SannsynlighetPage } from "@/components/stack/tek1-sannsynlighet/Tek1SannsynlighetPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek1-sannsynlighet",
  slug: "tek1-sannsynlighet",
  title: "TEK-1501 Modul 2 — Sannsynlighet og kombinatorikk",
  group: "eksamen",
  order: 3,
  status: "ready",
  shortDescription:
    "Utfallsrom, mengdelære, Kolmogorovs aksiomer, betinget sannsynlighet, Bayes' teorem, og kombinatorikk (permutasjoner og kombinasjoner).",
  prerequisites: [],
  Component: Tek1SannsynlighetPage,
};
