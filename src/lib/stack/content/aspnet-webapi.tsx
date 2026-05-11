import { AspnetWebapiPage } from "@/components/stack/aspnet-webapi/AspnetWebapiPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-aspnet-webapi",
  slug: "aspnet-webapi",
  title: "ASP.NET Core Web API",
  group: "eksamen",
  order: 64,
  status: "ready",
  shortDescription:
    "ControllerBase, HTTP-verb-attributter, action results, attribute routing, CORS.",
  prerequisites: [{ slug: "csharp-grunnlag", title: "C# språk-grunnlag" }],
  Component: AspnetWebapiPage,
};
