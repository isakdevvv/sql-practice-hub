import { Tek1EstimeringKiPage } from "@/components/stack/tek1-estimering-ki/Tek1EstimeringKiPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek1-estimering-ki",
  slug: "tek1-estimering-ki",
  title: "TEK-1501 Modul 4a — Estimering og konfidensintervall",
  group: "eksamen",
  order: 8,
  status: "ready",
  shortDescription:
    "Punktestimering, standardfeil, og konfidensintervall — med simulering av 100 utvalg som viser hvor mange intervaller dekker μ.",
  prerequisites: [],
  Component: Tek1EstimeringKiPage,
};
