import { Placeholder } from "@/components/stack/Placeholder";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-python-drill",
  slug: "python-drill",
  title: "Python eksamens-drill",
  group: "eksamen",
  order: 6,
  status: "stub",
  shortDescription: "Filtrer dict-lister, parse logger, dict comprehensions — eksamenstypen.",
  prerequisites: [],
  Component: () => <Placeholder title="Python eksamens-drill" group="eksamen" />,
};
