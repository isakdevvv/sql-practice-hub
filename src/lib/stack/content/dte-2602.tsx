import { Dte2602Hub } from "@/components/stack/dte-2602/Dte2602Hub";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte-2602",
  slug: "dte-2602",
  title: "DTE-2602 Introduksjon maskinlæring og AI — hub",
  group: "eksamen",
  order: 21,
  status: "ready",
  shortDescription:
    "Fire mini-kurs som dekker DTE-2602-pensum: ML-grunnlag, supervised, unsupervised, nevrale nett.",
  prerequisites: [],
  Component: Dte2602Hub,
};
