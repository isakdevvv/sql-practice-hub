import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-typescript",
  slug: "typescript",
  title: "TypeScript",
  group: "stack",
  order: 71,
  status: "ready",
  shortDescription:
    "Basis-typer, type vs interface, generics, narrowing (typeof/instanceof/guards), utility types, strict mode, .d.ts.",
  prerequisites: [
    { slug: "javascript-grunnlag", title: "JavaScript-grunnlag" },
  ],
  Component: lazy(() => import("@/components/stack/typescript/TypescriptPage").then((m) => ({ default: m.TypescriptPage }))),
};
