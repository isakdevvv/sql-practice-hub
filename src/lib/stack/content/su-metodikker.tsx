import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-su-metodikker",
  slug: "su-metodikker",
  title: "Metodikker — fra fossefall til smidig",
  group: "eksamen",
  order: 44,
  status: "ready",
  shortDescription:
    "Fossefall/RUP historisk. Scrum-events og roller, Kanban WIP, XP (TDD, pair programming).",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/su-metodikker/SuMetodikkerPage").then((m) => ({ default: m.SuMetodikkerPage }))),
};
