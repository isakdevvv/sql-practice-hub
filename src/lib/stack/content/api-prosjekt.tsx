import { ApiProsjektHub } from "@/components/stack/api-prosjekt/ApiProsjektHub";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-api-prosjekt",
  slug: "api-prosjekt",
  title: "API-prosjekt fra A til Å — hub",
  group: "eksamen",
  order: 48,
  status: "ready",
  shortDescription:
    "Fem mini-kurs: planlegging, arkitektur, kontrakt, testing, deploy — for et komplett API.",
  prerequisites: [],
  Component: ApiProsjektHub,
};
