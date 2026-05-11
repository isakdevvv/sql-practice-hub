import { BayesPage } from "@/components/stack/bayes/BayesPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-bayes",
  slug: "bayes",
  title: "Bayes — beslutninger under usikkerhet",
  group: "eksamen",
  order: 31,
  status: "ready",
  shortDescription:
    "Bayes' teorem med worked example, naive Bayes-klassifikator og betinget uavhengighet.",
  prerequisites: [],
  Component: BayesPage,
};
