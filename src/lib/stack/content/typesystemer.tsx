import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-typesystemer",
  slug: "typesystemer",
  title: "Typesystemer — generics, sum types, variance",
  group: "stack",
  order: 68,
  status: "ready",
  shortDescription:
    "Static vs dynamic, generics, variance (co/contra/invariant), sum types, narrowing, phantom & dependent types.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/typesystemer/TypesystemerPage").then((m) => ({ default: m.TypesystemerPage }))),
};
