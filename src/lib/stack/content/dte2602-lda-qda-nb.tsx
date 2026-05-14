import { LdaQdaNbPage } from "@/components/stack/dte2602-lda-qda-nb/LdaQdaNbPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2602-lda-qda-nb",
  slug: "dte2602-lda-qda-nb",
  title: "DTE-2602 — LDA, QDA og Naive Bayes",
  group: "eksamen",
  order: 11,
  status: "ready",
  shortDescription:
    "Generative klassifikatorer: Bayes-teorem, LDA (lineær grense, felles Σ), QDA (kvadratisk, ulik Σ) og Naive Bayes (uavhengige features). Decision boundaries side-by-side.",
  prerequisites: [],
  Component: LdaQdaNbPage,
};
