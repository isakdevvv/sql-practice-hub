import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-5-assembly",
  slug: "trinn-5-assembly",
  title: "5. Assembly & maskinkode",
  group: "stack",
  order: 5,
  status: "ready",
  shortDescription: "C ↔ RISC-V asm ↔ hex bytes. Samme uttrykk på tre nivåer.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/trinn-5-assembly/Trinn5AssemblyPage").then((m) => ({ default: m.Trinn5AssemblyPage }))),
};
