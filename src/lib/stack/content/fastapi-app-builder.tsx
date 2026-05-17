import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-fastapi-app-builder",
  slug: "fastapi-app-builder",
  title: "FastAPI App Builder",
  group: "stack",
  order: 95,
  status: "ready",
  shortDescription:
    "Kryss av byggesteiner (endepunkter, Pydantic-modeller, validering, dependency injection, JWT-auth, SQLAlchemy, OpenAPI-tags) og få en komplett FastAPI-app generert live. 26+ alternativer, Pydantic v2-syntaks.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/fastapi-app-builder/FastapiAppBuilderPage").then((m) => ({ default: m.FastapiAppBuilderPage }))),
};
