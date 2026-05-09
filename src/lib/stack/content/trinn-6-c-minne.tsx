import { Placeholder } from "@/components/stack/Placeholder";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-6-c-minne",
  slug: "trinn-6-c-minne",
  title: "6. C — minne og pekere",
  group: "stack",
  order: 6,
  status: "stub",
  shortDescription: "Stack vs heap, hex-dumps, en char-array er bare bytes.",
  prerequisites: [],
  Component: () => <Placeholder title="6. C — minne og pekere" group="stack" />,
};
