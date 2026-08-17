import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-modul3",
  slug: "dte2507-modul3",
  title: "Modul 3 — Transportlaget",
  group: "eksamen",
  order: 32,
  status: "ready",
  shortDescription:
    "Modul 3 i tre steg: TCP mot UDP, rdt 1.0 → 3.0, og metningskontrollen som legger seg oppå. Fagets tyngste kapittel, kortest løype.",
  prerequisites: [],
  Component: () => <ModulSide nr="3" />,
};

const ModulPage = lazy(() =>
  import("@/components/stack/dte2507-modul/ModulPage").then((m) => ({
    default: m.Dte2507ModulPage,
  })),
);

function ModulSide({ nr }: { nr: string }) {
  return <ModulPage nr={nr} />;
}
