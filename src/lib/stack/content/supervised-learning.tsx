import { SupervisedPage } from "@/components/stack/supervised-learning/SupervisedPage";
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
  Component: SupervisedPage,
};
