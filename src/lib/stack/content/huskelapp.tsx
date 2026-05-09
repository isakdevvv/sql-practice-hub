import { HuskelappPage } from "@/components/stack/huskelapp/HuskelappPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-huskelapp",
  slug: "huskelapp",
  title: "SQL huskelapp",
  group: "eksamen",
  order: 3,
  status: "ready",
  shortDescription:
    "Interaktiv hurtigreferanse: SELECT, JOIN, GROUP BY, NULL, DDL — alt på én side.",
  prerequisites: [],
  Component: HuskelappPage,
};
