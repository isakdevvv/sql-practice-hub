import { lazy } from "react";
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
  Component: lazy(() => import("@/components/stack/python-drill/PythonDrillPage").then((m) => ({ default: m.PythonDrillPage }))),
};
