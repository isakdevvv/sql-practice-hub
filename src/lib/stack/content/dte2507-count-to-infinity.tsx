import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-count-to-infinity",
  slug: "dte2507-count-to-infinity",
  title: "Count-to-infinity",
  group: "eksamen",
  order: 58,
  status: "ready",
  shortDescription:
    "Distance-vector-loopen som teller sakte oppover når en lenke degraderer: 3-node-simulator med slider for c(y,x), 44 iterasjoner i animasjon, og poisoned reverse-toggle. Kurose Ch 5.2.2.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2507-count-to-infinity/CountToInfinityPage").then((m) => ({ default: m.CountToInfinityPage }))),
};
