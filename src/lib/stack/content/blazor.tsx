import { BlazorPage } from "@/components/stack/blazor/BlazorPage";
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
  Component: BlazorPage,
};
