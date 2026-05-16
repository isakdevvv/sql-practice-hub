import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-kotlin-grunnlag",
  slug: "kotlin-grunnlag",
  title: "Kotlin-grunnlag — språket Android-koden er skrevet i",
  group: "eksamen",
  order: 55,
  status: "ready",
  shortDescription:
    "val vs var, null safety (?, !!, ?.), data classes, lambdas, scope-funksjoner og collections.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/kotlin-grunnlag/KotlinGrunnlagPage").then((m) => ({ default: m.KotlinGrunnlagPage }))),
};
