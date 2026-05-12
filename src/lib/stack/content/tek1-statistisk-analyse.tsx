import { Tek1StatistiskAnalysePage } from "@/components/stack/tek1-statistisk-analyse/Tek1StatistiskAnalysePage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek1-statistisk-analyse",
  slug: "tek1-statistisk-analyse",
  title: "TEK-1501 Modul 4 — Statistisk inferens og regresjon",
  group: "eksamen",
  order: 5,
  status: "ready",
  shortDescription:
    "Estimatorer, konfidensintervaller, hypotesetesting (z-, t-, kji-kvadrat), korrelasjon, og lineær regresjon med minste kvadraters metode.",
  prerequisites: [],
  Component: Tek1StatistiskAnalysePage,
};
