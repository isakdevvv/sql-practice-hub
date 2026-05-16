import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-ipc",
  slug: "dte2505-ipc",
  title: "IPC: pipes, shared memory, semaforer",
  group: "eksamen",
  order: 102,
  status: "ready",
  shortDescription:
    "Inter-process communication: anonyme pipes (pipe()), navngitte (FIFO), shared memory (shmget/mmap), POSIX/System V semaforer, message queues, og en sammenligningstabell over latency, throughput, kompleksitet og sync/async.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2505-ipc/IpcPage").then((m) => ({
      default: m.IpcPage,
    })),
  ),
};
