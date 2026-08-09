import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2602-modul1",
  slug: "dte2602-modul1",
  title: "DTE-2602 Modul 1 — Hva er maskinlæring?",
  group: "eksamen",
  order: 1,
  status: "ready",
  shortDescription:
    "Fase 1 i DTE-2602, bygget etter oppgave-arkitekturen: 6 anslå-så-sjekk før forklaringen, to guidede simuleringer (regelbasert mot maskinlært spamfilter, og beslutningsregelen for læringstype brukt på 8 caser), 4 måloppgaver som sjekker om hele problemoppsettet henger sammen, 4 feilsøkingsoppgaver og 4 recall-kort.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2602-modul1/Modul1Page").then((m) => ({
      default: m.Modul1Page,
    })),
  ),
};
