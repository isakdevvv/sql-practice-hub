import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-rest-api-builder",
  slug: "rest-api-builder",
  title: "REST API Builder",
  group: "stack",
  order: 99,
  status: "ready",
  shortDescription:
    "Velg framework (FastAPI / Flask-RESTful / Express / DRF), kryss av ressurser (User/Product/Order), velg auth, validering, paginering, CORS, middleware og OpenAPI — få en komplett kjørbar REST-API-fil generert live, med curl-eksempler nederst.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/rest-api-builder/RestApiBuilderPage").then((m) => ({ default: m.RestApiBuilderPage }))),
};
