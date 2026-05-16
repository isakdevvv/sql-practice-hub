import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek1-proporsjoner",
  slug: "tek1-proporsjoner",
  title: "TEK-1501 — Inferens for proporsjoner",
  group: "eksamen",
  order: 11,
  status: "ready",
  shortDescription:
    "Én og to proporsjoner: punktestimat, CLT-betingelse, Wald vs Wilson vs Agresti-Coull-CI, z-tester (pooled vs unpooled SE), sample-size-planlegging, og exakt binomial når CLT ikke holder.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/tek1-proporsjoner/Tek1ProporsjonerPage").then((m) => ({ default: m.Tek1ProporsjonerPage }))),
};
