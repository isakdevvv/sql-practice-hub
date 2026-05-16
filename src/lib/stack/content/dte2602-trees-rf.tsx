import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2602-trees-rf",
  slug: "dte2602-trees-rf",
  title: "Beslutningstrær & Random Forest",
  group: "eksamen",
  order: 28,
  status: "ready",
  shortDescription:
    "Gini, max_depth, min_samples_split. RF = bootstrap + random features. Feature importance. Interaktiv: bygg tre.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2602-trees-rf/Dte2602TreesRfPage").then((m) => ({ default: m.Dte2602TreesRfPage }))),
};
