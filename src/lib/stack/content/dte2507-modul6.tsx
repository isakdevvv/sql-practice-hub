import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-modul6",
  slug: "dte2507-modul6",
  title: "Modul 6 — Trådløse nettverk og WiFi",
  group: "eksamen",
  order: 35,
  status: "ready",
  shortDescription:
    "Modul 6: CSMA/CA og RTS/CTS — hvorfor trådløst ikke kan oppdage sine egne kollisjoner, og hva det tvinger fram.",
  prerequisites: [],
  Component: () => <ModulSide nr="6" />,
};

const ModulPage = lazy(() =>
  import("@/components/stack/dte2507-modul/ModulPage").then((m) => ({
    default: m.Dte2507ModulPage,
  })),
);

function ModulSide({ nr }: { nr: string }) {
  return <ModulPage nr={nr} />;
}
