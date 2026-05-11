import { ApiKontraktPage } from "@/components/stack/api-kontrakt/ApiKontraktPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-api-kontrakt",
  slug: "api-kontrakt",
  title: "API-kontrakt — OpenAPI, versjon, feil",
  group: "eksamen",
  order: 51,
  status: "ready",
  shortDescription:
    "OpenAPI/Swagger, statuskoder, versjonering, RFC 7807 problem-detail, idempotens, paginering.",
  prerequisites: [],
  Component: ApiKontraktPage,
};
