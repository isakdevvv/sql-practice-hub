import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-packet-scheduling",
  slug: "dte2507-packet-scheduling",
  title: "Packet scheduling — FIFO, Priority, Round Robin, WFQ",
  group: "eksamen",
  order: 57,
  status: "ready",
  shortDescription:
    "Fire køprinsipper side-ved-side på samme input-strøm. WFQ med vekter (w1=3, w2=1) viser hvordan båndbredde fordeles. Drag-oppgave for å plotte departures, knyttet til net neutrality.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2507-packet-scheduling/PacketSchedulingPage").then((m) => ({ default: m.PacketSchedulingPage }))),
};
