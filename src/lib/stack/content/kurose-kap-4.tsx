import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-kurose-kap-4",
  slug: "kurose-kap-4",
  title: "Kurose kap. 4 — Nettverkslaget data-plane",
  group: "stack",
  order: 904,
  status: "ready",
  shortDescription: "Inne i en ruter, IPv4/IPv6, NAT, SDN. Disposisjon + lenker til interaktive sider.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/kurose-kurs/KuroseKapStubPage").then((m) => ({ default: m.KuroseKap4Page }))),
};
