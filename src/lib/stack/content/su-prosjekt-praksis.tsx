import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-su-prosjekt-praksis",
  slug: "su-prosjekt-praksis",
  title: "Prosjekt-praksis i gruppe",
  group: "eksamen",
  order: 47,
  status: "ready",
  shortDescription:
    "Git feature-branch + PR. Konflikter. Code review. Estimering. Retro. Vanlige team-feller.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/su-prosjekt-praksis/SuProsjektPraksisPage").then((m) => ({ default: m.SuProsjektPraksisPage }))),
};
