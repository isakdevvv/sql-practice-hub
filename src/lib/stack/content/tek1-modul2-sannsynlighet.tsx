import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek1-modul2-sannsynlighet",
  slug: "tek1-modul2-sannsynlighet",
  title: "TEK-1501 Modul 2 — Sannsynlighet: kombinatorikk, betinget, Bayes, uavhengighet",
  group: "eksamen",
  order: 2,
  status: "ready",
  shortDescription:
    "Modul 2 i TEK-1501, bygget etter oppgave-arkitekturen: 6 anslå-så-sjekk før forklaringen, seks gjenbrukte simulatorer (naturlige frekvenser, betinget-rutenett, Bayes-oppdatering, sannsynlighetstre, urnemodell, permutasjon vs. kombinasjon), 5 måloppgaver som sjekker både metodevalg og tallsvar, 4 feilsøkingsoppgaver og 9 recall-kort.",
  prerequisites: [
    { slug: "tek1-modul1-data", title: "TEK-1501 Modul 1 — Data" },
  ],
  Component: lazy(() =>
    import(
      "@/components/stack/tek1-modul2-sannsynlighet/Modul2SannsynlighetPage"
    ).then((m) => ({
      default: m.Modul2SannsynlighetPage,
    })),
  ),
};
