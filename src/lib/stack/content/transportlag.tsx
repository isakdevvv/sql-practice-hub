import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-transportlag",
  slug: "transportlag",
  title: "Transportlag — TCP og UDP",
  group: "eksamen",
  order: 17,
  status: "ready",
  shortDescription:
    "TCP 3-veis håndtrykk, sliding window, flow vs congestion control, 4-veis avskjed. UDP når det passer.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/transportlag/TransportlagPage").then((m) => ({ default: m.TransportlagPage }))),
};
