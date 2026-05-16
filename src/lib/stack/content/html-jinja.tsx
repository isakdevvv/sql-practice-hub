import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-html-jinja",
  slug: "html-jinja",
  title: "HTML, CSS og Jinja",
  group: "eksamen",
  order: 6,
  status: "ready",
  shortDescription:
    "HTML-skjelett, semantiske elementer, CSS-kobling, Jinja-arv (extends/block/include/import), kontrollflyt og sikkerhet.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/html-jinja/HtmlJinjaPage").then((m) => ({ default: m.HtmlJinjaPage }))),
};
