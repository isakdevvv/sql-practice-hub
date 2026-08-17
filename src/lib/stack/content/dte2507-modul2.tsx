import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-modul2",
  slug: "dte2507-modul2",
  title: "Modul 2 — Applikasjonslaget",
  group: "eksamen",
  order: 31,
  status: "ready",
  shortDescription:
    "Modul 2 i fem steg: Wireshark, HTTP/2 og HOL-blokkering, web-caching-matematikken, DNS i dybden og socket-programmering.",
  prerequisites: [],
  Component: () => <ModulSide nr="2" />,
};

const ModulPage = lazy(() =>
  import("@/components/stack/dte2507-modul/ModulPage").then((m) => ({
    default: m.Dte2507ModulPage,
  })),
);

function ModulSide({ nr }: { nr: string }) {
  return <ModulPage nr={nr} />;
}
