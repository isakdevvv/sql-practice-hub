import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-os-historikk",
  slug: "os-historikk",
  title: "OS-historikk — interaktiv tidslinje (1940 → i dag)",
  group: "eksamen",
  order: 31,
  status: "ready",
  shortDescription:
    "O'Gorman kap. 1.5. Dra slideren gjennom 7 epoker — ENIAC, batch, time-sharing, UNIX, PC+GUI, internett/Linux, sky+containere. Hver epoke har animert illustrasjon, utfordring → løsning, og endring fra forrige tiår. Mini-quiz: drag-og-slipp milepæler.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/os-historikk/OsHistorikkPage").then((m) => ({ default: m.OsHistorikkPage }))),
};
