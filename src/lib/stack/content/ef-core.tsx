import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-ef-core",
  slug: "ef-core",
  title: "Entity Framework Core",
  group: "eksamen",
  order: 65,
  status: "ready",
  shortDescription:
    "DbContext, code-first migrations, LINQ-til-SQL, relasjoner, tracking.",
  prerequisites: [{ slug: "csharp-grunnlag", title: "C# språk-grunnlag" }],
  Component: lazy(() => import("@/components/stack/ef-core/EfCorePage").then((m) => ({ default: m.EfCorePage }))),
};
