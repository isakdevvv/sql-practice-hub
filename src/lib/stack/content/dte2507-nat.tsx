import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-nat",
  slug: "dte2507-nat",
  title: "NAT — én offentlig IP, mange private",
  group: "eksamen",
  order: 63,
  status: "ready",
  shortDescription:
    "Source-NAT / NAPT forklart fra problemet (to interne hosts som kolliderer på samme server) til regelen. Interaktiv NAT-tabell-demo med 'uten NAT'-sammenligning, RFC 1918, og drill på end-to-end-tap, IPsec AH-bruddet og hvorfor port-omskriving er nødvendig.",
  prerequisites: [
    { slug: "dte2507-subnetting", title: "Subnetting / CIDR" },
    { slug: "dte2507-inni-ruter", title: "Inni ruteren — IP-forwarding" },
  ],
  Component: lazy(() => import("@/components/stack/dte2507-nat/Dte2507NatPage").then((m) => ({ default: m.Dte2507NatPage }))),
};
