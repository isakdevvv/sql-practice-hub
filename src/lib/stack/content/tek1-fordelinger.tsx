import { Tek1FordelingerPage } from "@/components/stack/tek1-fordelinger/Tek1FordelingerPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek1-fordelinger",
  slug: "tek1-fordelinger",
  title: "TEK-1501 Modul 3 — Sannsynlighetsfordelinger",
  group: "eksamen",
  order: 4,
  status: "ready",
  shortDescription:
    "Diskrete (Bernoulli, binomisk, hypergeometrisk, Poisson) og kontinuerlige (uniform, eksponential, normal, kji-kvadrat, Student-t) fordelinger pluss sentralgrenseteoremet.",
  prerequisites: [],
  Component: Tek1FordelingerPage,
};
