import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte-2802",
  slug: "dte-2802",
  title: "DTE-2802 Web Applikasjoner 2 — hub",
  group: "eksamen",
  order: 61,
  status: "ready",
  shortDescription:
    "Fem mini-kurs som dekker DTE-2802: C#, ASP.NET MVC, Web API, EF Core og Blazor.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte-2802/Dte2802Hub").then((m) => ({ default: m.Dte2802Hub }))),
};
