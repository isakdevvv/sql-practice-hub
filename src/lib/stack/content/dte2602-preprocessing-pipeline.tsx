import { Dte2602PreprocessingPipelinePage } from "@/components/stack/dte2602-preprocessing-pipeline/Dte2602PreprocessingPipelinePage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2602-preprocessing-pipeline",
  slug: "dte2602-preprocessing-pipeline",
  title: "Preprocessing & Pipeline — gjør dataen modellklar",
  group: "eksamen",
  order: 27,
  status: "ready",
  shortDescription:
    "StandardScaler, OneHotEncoder, ColumnTransformer, Pipeline. Datalekkasje — den klassiske bommen.",
  prerequisites: [],
  Component: Dte2602PreprocessingPipelinePage,
};
