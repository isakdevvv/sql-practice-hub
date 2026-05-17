import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-io-management",
  slug: "dte2505-io-management",
  title: "I/O management — enheter, drivere, polling/interrupt/DMA, buffer cache & scheduling",
  group: "eksamen",
  order: 46,
  status: "ready",
  shortDescription:
    "O'Gorman kap. 4 / OSTEP kap. 36. Enhetsklasser (block/char/net), driver-stack, polling vs interrupt vs DMA, buffer cache, disk-scheduling (FIFO/SSTF/SCAN/CFQ). Fem visualizers + scenario-drag-quiz.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2505-io-management/IoManagementPage").then((m) => ({
      default: m.IoManagementPage,
    })),
  ),
};
