import { SannsynlighetPage } from "@/components/stack/sannsynlighet/SannsynlighetPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-sannsynlighet",
  slug: "sannsynlighet",
  title: "Sannsynlighet og statistikk — for ML og A/B",
  group: "eksamen",
  order: 3,
  status: "ready",
  shortDescription:
    "Aksiomer, Bayes, forventning, varians, fordelinger (Bernoulli/binomial/normal/Poisson), CLT, hypotesetest.",
  prerequisites: [],
  Component: SannsynlighetPage,
};
