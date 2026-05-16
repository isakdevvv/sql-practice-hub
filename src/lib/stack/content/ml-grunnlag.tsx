import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-ml-grunnlag",
  slug: "ml-grunnlag",
  title: "ML-grunnlag — språket og rammeverket",
  group: "eksamen",
  order: 22,
  status: "ready",
  shortDescription:
    "Hva ML er, tre paradigmer, data/features, train/val/test, overfitting, bias-variance, evaluering.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/ml-grunnlag/MlGrunnlagPage").then((m) => ({ default: m.MlGrunnlagPage }))),
};
