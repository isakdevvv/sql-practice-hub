import { Tek1KontinuerligeFordelingerPage } from "@/components/stack/tek1-kontinuerlige-fordelinger/Tek1KontinuerligeFordelingerPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek1-kontinuerlige-fordelinger",
  slug: "tek1-kontinuerlige-fordelinger",
  title: "TEK-1501 Modul 3b — Kontinuerlige fordelinger",
  group: "eksamen",
  order: 6,
  status: "ready",
  shortDescription:
    "Normal, eksponential, kji-kvadrat og Student-t — interaktive tetthetskurver med skraverbart areal mellom valgte grenser.",
  prerequisites: [],
  Component: Tek1KontinuerligeFordelingerPage,
};
