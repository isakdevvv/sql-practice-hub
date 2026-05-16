import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-2-nand-porter",
  slug: "trinn-2-nand-porter",
  title: "2. NAND og logiske porter",
  group: "stack",
  order: 2,
  status: "ready",
  shortDescription: "Bygg AND/OR/NOT/XOR fra bare NAND-porter.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/trinn-2-nand-porter/Trinn2NandPorterPage").then((m) => ({ default: m.Trinn2NandPorterPage }))),
};
