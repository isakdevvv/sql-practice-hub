import { Placeholder } from "@/components/stack/Placeholder";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-3-adders",
  slug: "trinn-3-adders",
  title: "3. Adders & flip-flops",
  group: "stack",
  order: 3,
  status: "stub",
  shortDescription: "Half-adder, full-adder, og hvordan én bit lagres i en flip-flop.",
  prerequisites: [],
  Component: () => <Placeholder title="3. Adders & flip-flops" group="stack" />,
};
