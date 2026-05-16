import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-csharp-grunnlag",
  slug: "csharp-grunnlag",
  title: "C# språk-grunnlag",
  group: "eksamen",
  order: 62,
  status: "ready",
  shortDescription:
    "Typer, classes vs records, properties, LINQ, async/await, nullable reference types.",
  prerequisites: [{ slug: "dte-2802", title: "DTE-2802 Web Applikasjoner 2 — hub" }],
  Component: lazy(() => import("@/components/stack/csharp-grunnlag/CsharpGrunnlagPage").then((m) => ({ default: m.CsharpGrunnlagPage }))),
};
