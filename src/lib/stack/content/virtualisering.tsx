import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-virtualisering",
  slug: "virtualisering",
  title: "Virtualisering — VM, container, hypervisor",
  group: "eksamen",
  order: 36,
  status: "ready",
  shortDescription:
    "Hypervisor type 1/2, VM vs container, Docker-basics, snapshots og bruksområder.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/virtualisering/VirtualiseringPage").then((m) => ({ default: m.VirtualiseringPage }))),
};
