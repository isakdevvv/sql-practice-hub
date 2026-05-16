import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek1-hypotesetest-regresjon",
  slug: "tek1-hypotesetest-regresjon",
  title: "TEK-1501 Modul 4b — Hypotesetest, kji² og regresjon",
  group: "eksamen",
  order: 9,
  status: "ready",
  shortDescription:
    "t-tester (én/to utvalg), p-verdier, type I/II-feil, kji-kvadrat (goodness-of-fit + kontingens), og lineær regresjon med drag-bare punkter og live R².",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/tek1-hypotesetest-regresjon/Tek1HypotesetestRegresjonPage").then((m) => ({ default: m.Tek1HypotesetestRegresjonPage }))),
};
