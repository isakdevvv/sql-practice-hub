import { Placeholder } from "@/components/stack/Placeholder";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-9-syscalls-dyp",
  slug: "trinn-9-syscalls-dyp",
  title: "9. Syscalls & sockets (dypere)",
  group: "stack",
  order: 9,
  status: "stub",
  shortDescription: "User space ↔ kernel ↔ NIC. Hver send() er flere lag av bytekopiering.",
  prerequisites: [],
  Component: () => <Placeholder title="9. Syscalls & sockets (dypere)" group="stack" />,
};
