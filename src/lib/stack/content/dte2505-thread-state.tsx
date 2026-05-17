import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-thread-state",
  slug: "dte2505-thread-state",
  title: "Thread state-maskin — NEW / RUN / WAIT / TERMINATED",
  group: "eksamen",
  order: 39,
  status: "ready",
  shortDescription:
    "O'Gorman kap. 2.7 + 2.9. Interaktivt tilstandsdiagram med run-queue (prioritert) og wait-queue (event-basert). Lag tråder, trigg I/O, preempt, og kjør auto-modus med 10 tråder over 30 ticks. Avsluttende mini-utfordring.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2505-thread-state/ThreadStatePage").then((m) => ({ default: m.ThreadStatePage }))),
};
