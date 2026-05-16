import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-dns-dyp",
  slug: "dte2507-dns-dyp",
  title: "DNS-dyp og DNSSEC",
  group: "eksamen",
  order: 43,
  status: "ready",
  shortDescription:
    "Hele DNS-kjeden: root → TLD → autoritativ. Iterative vs recursive, RR-typer, cache, poisoning, DNSSEC chain of trust, DoH/DoT. Interaktiv lookup-sim med cache-hit-grafikk.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2507-dns-dyp/DnsDypPage").then((m) => ({ default: m.DnsDypPage }))),
};
