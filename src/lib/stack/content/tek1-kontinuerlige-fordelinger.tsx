import { lazy } from "react";
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
  Component: lazy(() => import("@/components/stack/tek1-kontinuerlige-fordelinger/Tek1KontinuerligeFordelingerPage").then((m) => ({ default: m.Tek1KontinuerligeFordelingerPage }))),
};
