import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-modul4",
  slug: "dte2507-modul4",
  title: "Modul 4 — Nettverkslaget",
  group: "eksamen",
  order: 33,
  status: "ready",
  shortDescription:
    "Modul 4 i ni steg: subnetting, videresending, ruterens innside, køer, Dijkstra, distansevektor, BGP, DHCP og NAT. Fagets lengste løype.",
  prerequisites: [],
  Component: () => <ModulSide nr="4" />,
};

const ModulPage = lazy(() =>
  import("@/components/stack/dte2507-modul/ModulPage").then((m) => ({
    default: m.Dte2507ModulPage,
  })),
);

function ModulSide({ nr }: { nr: string }) {
  return <ModulPage nr={nr} />;
}
