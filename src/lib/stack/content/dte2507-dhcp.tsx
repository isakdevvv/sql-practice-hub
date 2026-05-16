import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-dhcp",
  slug: "dte2507-dhcp",
  title: "DHCP — DORA-prosessen",
  group: "eksamen",
  order: 71,
  status: "ready",
  shortDescription:
    "Hvordan en helt fersk klient (uten IP) får tildelt nettverkskonfigurasjon: Discover → Offer → Request → Ack. Interaktiv 4-pakkers simulator, lease-tabell på server-siden, og drill på hvorfor alle fire pakkene MÅ være broadcast.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2507-dhcp/Dte2507DhcpPage").then((m) => ({ default: m.Dte2507DhcpPage }))),
};
