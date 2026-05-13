import { PaketTolker } from "@/components/stack/dte2507-praksis/PaketTolker";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-praksis",
  slug: "dte2507-praksis",
  title: "DTE-2507 — Paket-tolker (5 scenarier)",
  group: "eksamen",
  order: 44,
  status: "ready",
  shortDescription:
    "Fem realistiske pakker (TCP SYN, SYN+ACK, UDP DNS, ARP, ICMP). Klikk byte-felter for forklaring og observasjoner per pakke.",
  prerequisites: [],
  Component: PaketTolker,
};
