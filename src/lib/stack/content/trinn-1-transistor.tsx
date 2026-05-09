import { Placeholder } from "@/components/stack/Placeholder";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-1-transistor",
  slug: "trinn-1-transistor",
  title: "1. Transistoren som bryter",
  group: "stack",
  order: 1,
  status: "stub",
  shortDescription: "MOSFET som bryter styrt av spenning. Selve byggesteinen.",
  prerequisites: [],
  Component: () => <Placeholder title="1. Transistoren som bryter" group="stack" />,
};
