import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-api-arkitektur",
  slug: "api-arkitektur",
  title: "API-arkitektur — lag, DTO, DI",
  group: "eksamen",
  order: 50,
  status: "ready",
  shortDescription:
    "Lagdeling (controller/service/repository), DTO vs entity, dependency injection, Clean Architecture.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/api-arkitektur/ApiArkitekturPage").then((m) => ({ default: m.ApiArkitekturPage }))),
};
