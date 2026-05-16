import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-rdt-progresjon",
  slug: "dte2507-rdt-progresjon",
  title: "rdt 1.0 → 3.0 — bygge pålitelighet steg for steg",
  group: "eksamen",
  order: 50,
  status: "ready",
  shortDescription:
    "Kurose & Ross sitt flaggskip-eksempel: hver versjon legger til ETT verktøy mot ETT problem. FSM-diagrammer, ACK/NAK, sekvensnummer, timer — og til slutt stop-and-wait sin elendige 0.000266 utnyttelse på 1 Gbps coast-to-coast.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2507-rdt-progresjon/RdtProgresjonPage").then((m) => ({ default: m.RdtProgresjonPage }))),
};
