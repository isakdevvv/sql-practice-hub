import { Tek1DiskreteFordelingerPage } from "@/components/stack/tek1-diskrete-fordelinger/Tek1DiskreteFordelingerPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek1-diskrete-fordelinger",
  slug: "tek1-diskrete-fordelinger",
  title: "TEK-1501 Modul 3a — Diskrete fordelinger",
  group: "eksamen",
  order: 5,
  status: "ready",
  shortDescription:
    "Bernoulli, binomisk, hypergeometrisk og Poisson — med live-PMF-bar-chart hvor du justerer parametrene.",
  prerequisites: [],
  Component: Tek1DiskreteFordelingerPage,
};
