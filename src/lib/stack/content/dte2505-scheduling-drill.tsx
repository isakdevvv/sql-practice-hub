import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-scheduling-drill",
  slug: "dte2505-scheduling-drill",
  title: "CPU-scheduling — Gantt-drill (FIFO/SJF/STCF/RR/MLFQ)",
  group: "eksamen",
  order: 38,
  status: "ready",
  shortDescription:
    "OSTEP kap. 7–10. Turnaround, respons, throughput. FIFO, SJF, STCF, Round-Robin, MLFQ. Live Gantt-simulator med 5 forhåndsdefinerte øvelser.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2505-scheduling-drill/SchedulingDrillPage").then((m) => ({ default: m.SchedulingDrillPage }))),
};
