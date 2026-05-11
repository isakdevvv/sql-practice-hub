import { CssModernePage } from "@/components/stack/css-moderne/CssModernePage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-css-moderne",
  slug: "css-moderne",
  title: "CSS moderne",
  group: "stack",
  order: 73,
  status: "ready",
  shortDescription:
    "Box model, flexbox (justify/align/gap/grow/shrink), grid (template-areas, auto-fit, fr), mobile-first responsiv, CSS custom properties, dark mode, CSS-in-JS vs Tailwind, tilgjengelighet.",
  prerequisites: [],
  Component: CssModernePage,
};
