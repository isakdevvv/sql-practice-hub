import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek1-modul3-fordelinger",
  slug: "tek1-modul3-fordelinger",
  title:
    "TEK-1501 Modul 3 — Stokastiske variabler og fordelinger: binomisk, Poisson, normal og CLT",
  group: "eksamen",
  order: 3,
  status: "ready",
  shortDescription:
    "Modul 3 i TEK-1501, bygget etter oppgave-arkitekturen: 6 anslå-så-sjekk før forklaringen, syv gjenbrukte simulatorer (tetthet og kumulativ, fordelingsvelger, Galton-brett, CLT-demonstrator, standardfeil-bygger, distribusjonsplotter, gjenkjenningsutfordring), 6 måloppgaver som sjekker både metodevalg og tallsvar innenfor toleranse, 4 feilsøkingsoppgaver og 10 recall-kort.",
  prerequisites: [
    { slug: "tek1-modul2-sannsynlighet", title: "TEK-1501 Modul 2 — Sannsynlighet" },
  ],
  Component: lazy(() =>
    import("@/components/stack/tek1-modul3-fordelinger/Modul3FordelingerPage").then((m) => ({
      default: m.Modul3FordelingerPage,
    })),
  ),
};
