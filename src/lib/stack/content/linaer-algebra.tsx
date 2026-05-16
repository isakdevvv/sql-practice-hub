import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-linaer-algebra",
  slug: "linaer-algebra",
  title: "Linær algebra — matten bak ML og grafikk",
  group: "eksamen",
  order: 4,
  status: "ready",
  shortDescription:
    "Vektorer, indreprodukt, matriser, Ax=b, transformasjoner, egenvektorer og PCA-intuisjon. Khan Academy LinAlg på én side.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/linaer-algebra/LinaerAlgebraPage").then((m) => ({ default: m.LinaerAlgebraPage }))),
};
