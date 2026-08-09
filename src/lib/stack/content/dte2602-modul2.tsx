import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2602-modul2",
  slug: "dte2602-modul2",
  title: "DTE-2602 Modul 2 — Data og features",
  group: "eksamen",
  order: 2,
  status: "ready",
  shortDescription:
    "Fase 2 i DTE-2602: fra rå tabell til X og y uten å jukse. 6 anslå-så-sjekk, to guidede simuleringer (velg target og luk ut lekkasjekolonner, og se skalering flytte de nærmeste naboene), 4 måloppgaver om forbehandling og rekkefølge, 5 feilsøkingsoppgaver med hver sin reelle datalekkasje, og 5 recall-kort.",
  prerequisites: [{ slug: "dte2602-modul1", title: "DTE-2602 Modul 1 — Hva er maskinlæring?" }],
  Component: lazy(() =>
    import("@/components/stack/dte2602-modul2/Modul2Page").then((m) => ({
      default: m.Modul2Page,
    })),
  ),
};
