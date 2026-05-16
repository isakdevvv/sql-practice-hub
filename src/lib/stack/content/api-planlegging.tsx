import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-api-planlegging",
  slug: "api-planlegging",
  title: "API-planlegging — krav, scope, MVP",
  group: "eksamen",
  order: 49,
  status: "ready",
  shortDescription:
    "Interessenter, FR/NFR, MVP, brukerhistorier for APIer, MoSCoW/RICE, scope-kontroll, spikes.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/api-planlegging/ApiPlanleggingPage").then((m) => ({ default: m.ApiPlanleggingPage }))),
};
