import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-virtualisering",
  slug: "dte2505-virtualisering",
  title: "Virtualisering vs containere",
  group: "eksamen",
  order: 101,
  status: "ready",
  shortDescription:
    "Type 1 vs Type 2 hypervisor, KVM/VirtualBox/VMware, containere (Docker/containerd/runc) bygd på namespaces og cgroups, sammenligning av isolasjon og overhead, og når man bør velge VM kontra container.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2505-virtualisering/VirtualiseringPage").then(
      (m) => ({ default: m.VirtualiseringPage }),
    ),
  ),
};
