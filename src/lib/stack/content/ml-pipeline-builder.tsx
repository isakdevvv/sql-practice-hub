import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-ml-pipeline-builder",
  slug: "ml-pipeline-builder",
  title: "ML Pipeline Builder",
  group: "stack",
  order: 97,
  status: "ready",
  shortDescription:
    "Kryss av byggesteiner (datasett, preprocessor, modell, split, kryssvalidering, tuning, evaluering) og få en komplett sklearn-pipeline generert live. Iris/Wine/Breast cancer/Titanic + ColumnTransformer + GridSearchCV.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/ml-pipeline-builder/MLPipelineBuilderPage").then((m) => ({
      default: m.MLPipelineBuilderPage,
    })),
  ),
};
