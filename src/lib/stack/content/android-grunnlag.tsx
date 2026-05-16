import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-android-grunnlag",
  slug: "android-grunnlag",
  title: "Android-grunnlag — aktiviteter, fragmenter og livssyklus",
  group: "eksamen",
  order: 56,
  status: "ready",
  shortDescription:
    "Activity-livssyklus, Fragment-livssyklus, AndroidManifest, Gradle, resources/qualifiers og view binding.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/android-grunnlag/AndroidGrunnlagPage").then((m) => ({ default: m.AndroidGrunnlagPage }))),
};
