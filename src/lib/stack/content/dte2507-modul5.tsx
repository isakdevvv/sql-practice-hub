import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-modul5",
  slug: "dte2507-modul5",
  title: "Modul 5 — Datalinklaget",
  group: "eksamen",
  order: 34,
  status: "ready",
  shortDescription:
    "Modul 5 i seks steg: ARP, pakke-dekoding, svitsjer, CRC, ALOHA — og til slutt alle lagene samlet i én nettsideforespørsel.",
  prerequisites: [],
  Component: () => <ModulSide nr="5" />,
};

const ModulPage = lazy(() =>
  import("@/components/stack/dte2507-modul/ModulPage").then((m) => ({
    default: m.Dte2507ModulPage,
  })),
);

function ModulSide({ nr }: { nr: string }) {
  return <ModulPage nr={nr} />;
}
