import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-ids-snort",
  slug: "dte2507-ids-snort",
  title: "IDS: signature vs anomaly + DMZ",
  group: "eksamen",
  order: 67,
  status: "ready",
  shortDescription:
    "Snort-regel-eksempel (alert icmp ... msg: ICMP PING NMAP). Signature-based misser 0-day; anomaly-based kan fange dem men sliter med false positives. DMZ-arkitektur som sone-buffer mellom internett og internt nett.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2507-ids-snort/IdsSnortPage").then((m) => ({ default: m.IdsSnortPage }))),
};
