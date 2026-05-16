import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-fastapi-grunnlag",
  slug: "fastapi-grunnlag",
  title: "FastAPI grunnlag",
  group: "stack",
  order: 81,
  status: "ready",
  shortDescription:
    "Moderne Python web framework med type-hints, Pydantic-validering, async og automatisk OpenAPI-doc. Inkluderer Flask vs FastAPI cheat-sheet og 8 hands-on-oppgaver.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/fastapi-grunnlag/FastApiGrunnlagPage").then((m) => ({ default: m.FastApiGrunnlagPage }))),
};
