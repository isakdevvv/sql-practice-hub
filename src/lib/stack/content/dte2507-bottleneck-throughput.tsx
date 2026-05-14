import { BottleneckThroughputPage } from "@/components/stack/dte2507-bottleneck-throughput/BottleneckThroughputPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-bottleneck-throughput",
  slug: "dte2507-bottleneck-throughput",
  title: "Flaskehals & throughput",
  group: "eksamen",
  order: 53,
  status: "ready",
  shortDescription:
    "End-to-end throughput = min(R_i). Interaktiv flaskehals-simulator med R_server/R_core/R_client. Hvorfor speedtest gir det den gir og hvor flaskehalsen sitter i 2024.",
  prerequisites: [],
  Component: BottleneckThroughputPage,
};
