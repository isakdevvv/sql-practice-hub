import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-er-mapping",
  slug: "er-mapping",
  title: "ER → DDL mapping",
  group: "eksamen",
  order: 4,
  status: "ready",
  shortDescription: "Fra krakefot-diagram til CREATE TABLE: 1:1, 1:N, M:N, svake entiteter.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/er-mapping/ErMappingPage").then((m) => ({ default: m.ErMappingPage }))),
};
