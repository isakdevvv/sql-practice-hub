import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-dte2505-event-loop",
  slug: "dte2505-event-loop",
  title: "Event-basert konkurrens — epoll vs threads",
  group: "stack",
  order: 840,
  status: "ready",
  shortDescription: "OSTEP kap. 33. Simulator som viser hvorfor én event-loop slår thread-per-klient for I/O-bound workloads med mange klienter.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2505-event-loop/Dte2505EventLoopPage").then((m) => ({ default: m.Dte2505EventLoopPage })),
  ),
};
