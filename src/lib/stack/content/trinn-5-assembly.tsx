import { Placeholder } from "@/components/stack/Placeholder";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-5-assembly",
  slug: "trinn-5-assembly",
  title: "5. Assembly & maskinkode",
  group: "stack",
  order: 5,
  status: "stub",
  shortDescription: "C ↔ RISC-V asm ↔ hex bytes. Samme uttrykk på tre nivåer.",
  prerequisites: [],
  Component: () => <Placeholder title="5. Assembly & maskinkode" group="stack" />,
};
