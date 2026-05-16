import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2602-mappe-mal",
  slug: "dte2602-mappe-mal",
  title: "DTE-2602 — Mappe-oppgave-mal",
  group: "eksamen",
  order: 29,
  status: "ready",
  shortDescription:
    "Rapport-struktur, header-eksempler, kode-vs-drøfting, sensor-feller (reproduserbarhet, random_state), sjekkliste før innlevering.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2602-mappe-mal/Dte2602MappeMalPage").then((m) => ({ default: m.Dte2602MappeMalPage }))),
};
