import { Trinn1TransistorPage } from "@/components/stack/trinn-1-transistor/Trinn1TransistorPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-1-transistor",
  slug: "trinn-1-transistor",
  title: "1. Transistoren som bryter",
  group: "stack",
  order: 1,
  status: "ready",
  shortDescription: "MOSFET som bryter styrt av spenning. Selve byggesteinen.",
  prerequisites: [],
  Component: Trinn1TransistorPage,
};
