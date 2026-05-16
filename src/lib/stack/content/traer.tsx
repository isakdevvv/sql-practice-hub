import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-traer",
  slug: "traer",
  title: "Trær",
  group: "eksamen",
  order: 16,
  status: "ready",
  shortDescription:
    "Binærtre, BST (insert/søk/slett), traversering, AVL-balansering, heap som array, BST vs hash.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/traer/TraerPage").then((m) => ({ default: m.TraerPage }))),
};
