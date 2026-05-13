import { Tek1AnovaPage } from "@/components/stack/tek1-anova/Tek1AnovaPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek1-anova",
  slug: "tek1-anova",
  title: "TEK-1501 — Ettveis ANOVA og F-test",
  group: "eksamen",
  order: 10,
  status: "ready",
  shortDescription:
    "ANOVA for å sammenligne snitt på tvers av ≥ 3 grupper. SS-dekomponering, F = MS_between / MS_within, frihetsgrader, og post-hoc (Tukey HSD, Bonferroni). Interaktiv kalkulator med 4 grupper.",
  prerequisites: [],
  Component: Tek1AnovaPage,
};
