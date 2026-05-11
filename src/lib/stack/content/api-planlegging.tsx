import { ApiPlanleggingPage } from "@/components/stack/api-planlegging/ApiPlanleggingPage";
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
  Component: ApiPlanleggingPage,
};
