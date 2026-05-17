import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-dockerfile-builder",
  slug: "dockerfile-builder",
  title: "Dockerfile Builder",
  group: "stack",
  order: 98,
  status: "ready",
  shortDescription:
    "Kryss av base-image, dependencies, runtime og helsesjekk — få ferdig Dockerfile, .dockerignore og valgfri docker-compose.yml med korrekt lag-rekkefølge for cache.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dockerfile-builder/DockerfileBuilderPage").then((m) => ({
      default: m.DockerfileBuilderPage,
    })),
  ),
};
