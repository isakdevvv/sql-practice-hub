import { Placeholder } from "@/components/stack/Placeholder";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-2-nand-porter",
  slug: "trinn-2-nand-porter",
  title: "2. NAND og logiske porter",
  group: "stack",
  order: 2,
  status: "stub",
  shortDescription: "Bygg AND/OR/NOT/XOR fra bare NAND-porter.",
  prerequisites: [],
  Component: () => <Placeholder title="2. NAND og logiske porter" group="stack" />,
};
