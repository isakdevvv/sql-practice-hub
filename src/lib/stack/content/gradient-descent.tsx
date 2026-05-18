import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-gradient-descent",
  slug: "gradient-descent",
  title: "Gradient descent — interaktiv",
  group: "stack",
  order: 800,
  status: "ready",
  shortDescription:
    "Ikke-konveks 1D-tap. Lek med lærerate, momentum og SGD-støy. Se forskjellen mellom å sitte fast i lokalt min vs nå globalt min.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/gradient-descent/GradientDescentPage").then((m) => ({
      default: m.GradientDescentPage,
    })),
  ),
};
