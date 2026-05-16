import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek1-kombinatorikk",
  slug: "tek1-kombinatorikk",
  title: "TEK-1501 Modul 2b — Kombinatorikk",
  group: "eksamen",
  order: 4,
  status: "ready",
  shortDescription:
    "Permutasjoner og kombinasjoner med og uten tilbakelegging, multinomial, og praktiske telleregler for sannsynlighet.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/tek1-kombinatorikk/Tek1KombinatorikkPage").then((m) => ({ default: m.Tek1KombinatorikkPage }))),
};
