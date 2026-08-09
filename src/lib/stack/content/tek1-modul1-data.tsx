import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek1-modul1-data",
  slug: "tek1-modul1-data",
  title: "TEK-1501 Modul 1 — Data: sentralmål, kvartiler, spredning og n − 1",
  group: "eksamen",
  order: 1,
  status: "ready",
  shortDescription:
    "Modul 1 i TEK-1501, bygget etter oppgave-arkitekturen: 6 anslå-så-sjekk før forklaringen, fem interaktive simulatorer (kvartil-prikkrekke, uteliggereffekt, skjevhet, n−1-skjevhet, fordelingsplott), 5 måloppgaver som sjekker både metodevalg og tallsvar innenfor toleranse, 4 feilsøkingsoppgaver og 8 recall-kort.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/tek1-modul1-data/Modul1DataPage").then((m) => ({
      default: m.Modul1DataPage,
    })),
  ),
};
