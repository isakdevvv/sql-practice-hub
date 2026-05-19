import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-kurose-kap-9",
  slug: "kurose-kap-9",
  title: "Kurose kap. 9 — Multimedia-nettverk",
  group: "stack",
  order: 909,
  status: "ready",
  shortDescription: "Streaming, VoIP, RTP, jitter, QoS. Disposisjon + lenker.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/kurose-kurs/KuroseKapStubPage").then((m) => ({ default: m.KuroseKap9Page }))),
};
