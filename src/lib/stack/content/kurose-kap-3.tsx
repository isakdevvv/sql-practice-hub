import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-kurose-kap-3",
  slug: "kurose-kap-3",
  title: "Kurose kap. 3 — Transportlaget",
  group: "stack",
  order: 903,
  status: "ready",
  shortDescription: "UDP, TCP, pålitelig data-transport, congestion-kontroll. Disposisjon + lenker til våre interaktive sider.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/kurose-kurs/KuroseKap3Page").then((m) => ({ default: m.KuroseKap3Page }))),
};
