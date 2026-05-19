import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-kurose-kap-5",
  slug: "kurose-kap-5",
  title: "Kurose kap. 5 — Nettverkslaget control-plane",
  group: "stack",
  order: 905,
  status: "ready",
  shortDescription: "OSPF, BGP, ICMP, DHCP, SDN. Disposisjon + lenker til interaktive sider.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/kurose-kurs/KuroseKap5Page").then((m) => ({ default: m.KuroseKap5Page }))),
};
