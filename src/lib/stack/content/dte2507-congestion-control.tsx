import { CongestionControlPage } from "@/components/stack/dte2507-congestion-control/CongestionControlPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-congestion-control",
  slug: "dte2507-congestion-control",
  title: "TCP Congestion Control",
  group: "eksamen",
  order: 41,
  status: "ready",
  shortDescription:
    "Slow start, AIMD, Tahoe/Reno/Cubic/BBR. Interaktiv cwnd-simulator med pakketap-trigger og side-ved-side-sammenligning av alle tre algoritmer.",
  prerequisites: [],
  Component: CongestionControlPage,
};
