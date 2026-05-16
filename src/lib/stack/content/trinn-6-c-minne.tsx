import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-6-c-minne",
  slug: "trinn-6-c-minne",
  title: "6. C — minne og pekere",
  group: "stack",
  order: 6,
  status: "ready",
  shortDescription: "Stack vs heap, hex-dumps, en char-array er bare bytes.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/trinn-6-c-minne/Trinn6CMinnePage").then((m) => ({ default: m.Trinn6CMinnePage }))),
};
