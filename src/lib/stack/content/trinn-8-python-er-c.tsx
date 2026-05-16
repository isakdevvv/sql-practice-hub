import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-8-python-er-c",
  slug: "trinn-8-python-er-c",
  title: "8. Python er C under panseret",
  group: "stack",
  order: 8,
  status: "ready",
  shortDescription: "CPython er et C-program. PyLongObject. b\"...\" vs \"...\" på alvor.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/trinn-8-python-er-c/Trinn8PythonErCPage").then((m) => ({ default: m.Trinn8PythonErCPage }))),
};
