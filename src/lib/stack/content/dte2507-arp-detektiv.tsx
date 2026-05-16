import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-arp-detektiv",
  slug: "dte2507-arp-detektiv",
  title: "ARP-detektiv — postadresse vs. personnummer",
  group: "eksamen",
  order: 62,
  status: "ready",
  shortDescription:
    "ARP forklart med Kurose-metaforen (MAC = personnummer, IP = postadresse). Quiz over tre scenarier — same-subnett, cross-subnett (fig. 6.19), og selve ARP-broadcasten — pluss ARP-cache og spoofing.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2507-arp-detektiv/ArpDetektivPage").then((m) => ({ default: m.ArpDetektivPage }))),
};
