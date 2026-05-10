import { PythonDrillPage } from "@/components/stack/python-drill/PythonDrillPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-python-drill",
  slug: "python-drill",
  title: "Python eksamens-drill",
  group: "eksamen",
  order: 6,
  status: "ready",
  shortDescription: "Database/web-mønstre i Python: filtrere, gruppere, joine, paginere, validere.",
  prerequisites: [],
  Component: PythonDrillPage,
};
