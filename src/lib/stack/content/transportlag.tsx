import { TransportlagPage } from "@/components/stack/transportlag/TransportlagPage";
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
  Component: TransportlagPage,
};
