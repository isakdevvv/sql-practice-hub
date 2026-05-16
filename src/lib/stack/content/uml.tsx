import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-uml",
  slug: "uml",
  title: "UML — diagrammene du faktisk trenger",
  group: "eksamen",
  order: 46,
  status: "ready",
  shortDescription:
    "Use case, klasse, sekvens, aktivitet. Når du tegner hva, og hvor mye er nok.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/uml/UmlPage").then((m) => ({ default: m.UmlPage }))),
};
