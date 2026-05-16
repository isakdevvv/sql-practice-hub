import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-api-retrofit",
  slug: "api-retrofit",
  title: "API-kall med Retrofit — HTTP, JSON, OkHttp",
  group: "eksamen",
  order: 60,
  status: "ready",
  shortDescription:
    "Retrofit-interface med suspend, JSON-parsing (Moshi/Gson/kotlinx), OkHttp-interceptors og error handling.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/api-retrofit/ApiRetrofitPage").then((m) => ({ default: m.ApiRetrofitPage }))),
};
