import { PythonDrillPage } from "@/components/stack/python-drill/PythonDrillPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-python-drill",
  slug: "python-drill",
  title: "Python eksamens-drill",
  group: "eksamen",
  order: 6,
  status: "ready",
  shortDescription: "Filtrer dict-lister, parse logger, dict comprehensions — eksamenstypen.",
  prerequisites: [],
  Component: PythonDrillPage,
};
