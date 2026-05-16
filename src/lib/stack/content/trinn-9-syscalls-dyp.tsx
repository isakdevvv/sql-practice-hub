import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-9-syscalls-dyp",
  slug: "trinn-9-syscalls-dyp",
  title: "9. Syscalls & sockets (dypere)",
  group: "stack",
  order: 9,
  status: "ready",
  shortDescription: "User space ↔ kernel ↔ NIC. Hver send() er flere lag av bytekopiering.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/trinn-9-syscalls-dyp/Trinn9SyscallsDypPage").then((m) => ({ default: m.Trinn9SyscallsDypPage }))),
};
