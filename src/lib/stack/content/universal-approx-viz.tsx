import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-universal-approx-viz",
  slug: "universal-approx-viz",
  title: "Universal approximation — visuelt bevis",
  group: "stack",
  order: 870,
  status: "ready",
  shortDescription: "Nielsen kap. 4. Bygg sin/firkant/polynom-funksjoner ved å stable sigmoid-bumper. Hver bumpe = 2 nevroner i ett skjult lag.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/universal-approx-viz/UniversalApproxVizPage").then((m) => ({ default: m.UniversalApproxVizPage }))),
};
