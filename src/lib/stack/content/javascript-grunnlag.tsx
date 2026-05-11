import { JavascriptGrunnlagPage } from "@/components/stack/javascript-grunnlag/JavascriptGrunnlagPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-javascript-grunnlag",
  slug: "javascript-grunnlag",
  title: "JavaScript-grunnlag",
  group: "stack",
  order: 70,
  status: "ready",
  shortDescription:
    "var/let/const, typer, this (4 regler), closures, prototyper/klasser, event loop, Promise/async, === vs ==, vanlige feller.",
  prerequisites: [],
  Component: JavascriptGrunnlagPage,
};
