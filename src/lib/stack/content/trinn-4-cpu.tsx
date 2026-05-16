import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-4-cpu",
  slug: "trinn-4-cpu",
  title: "4. CPU — fetch, decode, execute",
  group: "stack",
  order: 4,
  status: "ready",
  shortDescription: "PC, IR, ALU, registerfil. Én instruksjon, én syklus.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/trinn-4-cpu/Trinn4CpuPage").then((m) => ({ default: m.Trinn4CpuPage }))),
};
