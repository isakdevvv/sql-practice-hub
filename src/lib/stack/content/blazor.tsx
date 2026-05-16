import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-blazor",
  slug: "blazor",
  title: "Blazor (Server / WebAssembly)",
  group: "eksamen",
  order: 66,
  status: "ready",
  shortDescription:
    "Komponenter, @code-blokker, parametere, event binding, EditForm + validation.",
  prerequisites: [{ slug: "csharp-grunnlag", title: "C# språk-grunnlag" }],
  Component: lazy(() => import("@/components/stack/blazor/BlazorPage").then((m) => ({ default: m.BlazorPage }))),
};
