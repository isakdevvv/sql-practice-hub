import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-supervised",
  slug: "supervised-learning",
  title: "Supervised learning",
  group: "eksamen",
  order: 23,
  status: "ready",
  shortDescription:
    "Lineær/logistisk regresjon, kNN, decision tree, ensembles (RF, gradient boosting), SVM. Algoritme-valg.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/supervised-learning/SupervisedPage").then((m) => ({ default: m.SupervisedPage }))),
};
