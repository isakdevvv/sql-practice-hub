import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-aspnet-mvc",
  slug: "aspnet-mvc",
  title: "ASP.NET Core MVC",
  group: "eksamen",
  order: 63,
  status: "ready",
  shortDescription:
    "Model/View/Controller, Razor, routing, model binding, validation, layouts.",
  prerequisites: [{ slug: "csharp-grunnlag", title: "C# språk-grunnlag" }],
  Component: lazy(() => import("@/components/stack/aspnet-mvc/AspnetMvcPage").then((m) => ({ default: m.AspnetMvcPage }))),
};
