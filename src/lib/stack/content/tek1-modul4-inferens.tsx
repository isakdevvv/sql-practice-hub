import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek1-modul4-inferens",
  slug: "tek1-modul4-inferens",
  title:
    "TEK-1501 Modul 4 — Inferens og regresjon: konfidensintervall, hypotesetest, p-verdi og minste kvadraters metode",
  group: "eksamen",
  order: 4,
  status: "ready",
  shortDescription:
    "Modul 4 i TEK-1501, bygget etter oppgave-arkitekturen: 6 anslå-så-sjekk før forklaringen, elleve simulatorer (100 konfidensintervaller, p-verdifordeling under H₀, t-test, type I/II-arealer, styrkekurve, multippel testing, testvelger-quiz, andelsintervaller, regresjonsdiagnostikk, Q-Q-plott), 6 måloppgaver som sjekker både metodevalg og tallsvar innenfor toleranse, 6 feilsøkingsoppgaver for de klassiske feiltolkningene og 10 recall-kort.",
  prerequisites: [
    { slug: "tek1-modul3-fordelinger", title: "TEK-1501 Modul 3 — Fordelinger" },
  ],
  Component: lazy(() =>
    import("@/components/stack/tek1-modul4-inferens/Modul4InferensPage").then((m) => ({
      default: m.Modul4InferensPage,
    })),
  ),
};
