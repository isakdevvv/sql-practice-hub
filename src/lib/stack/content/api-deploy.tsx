import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-api-deploy",
  slug: "api-deploy",
  title: "API-deploy — Docker, CI/CD, observability",
  group: "eksamen",
  order: 53,
  status: "ready",
  shortDescription:
    "Docker, env/secrets, healthchecks, GitHub Actions, blue-green/canary, logs/metrics/traces, runbooks.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/api-deploy/ApiDeployPage").then((m) => ({ default: m.ApiDeployPage }))),
};
