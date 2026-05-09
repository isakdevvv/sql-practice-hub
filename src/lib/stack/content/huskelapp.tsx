import { Placeholder } from "@/components/stack/Placeholder";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-huskelapp",
  slug: "huskelapp",
  title: "SQL huskelapp",
  group: "eksamen",
  order: 3,
  status: "stub",
  shortDescription: "Interaktiv hurtigreferanse: SELECT, JOIN, GROUP BY, NULL, DDL — alt på én side.",
  prerequisites: [],
  Component: () => <Placeholder title="SQL huskelapp" group="eksamen" />,
};
