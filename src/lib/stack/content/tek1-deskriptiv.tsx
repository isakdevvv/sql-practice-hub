import { Tek1DeskriptivPage } from "@/components/stack/tek1-deskriptiv/Tek1DeskriptivPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek1-deskriptiv",
  slug: "tek1-deskriptiv",
  title: "TEK-1501 Modul 1 — Deskriptiv statistikk",
  group: "eksamen",
  order: 2,
  status: "ready",
  shortDescription:
    "Sentralmål (mean, median, modus, kvartiler), spredningsmål (varians, std, IQR), og visualisering med histogram og boksplott.",
  prerequisites: [],
  Component: Tek1DeskriptivPage,
};
