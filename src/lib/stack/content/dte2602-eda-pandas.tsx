import { Dte2602EdaPandasPage } from "@/components/stack/dte2602-eda-pandas/Dte2602EdaPandasPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2602-eda-pandas",
  slug: "dte2602-eda-pandas",
  title: "EDA i pandas — utforsk dataen før modell",
  group: "eksamen",
  order: 26,
  status: "ready",
  shortDescription:
    "df.info(), describe(), histogrammer, korrelasjonsmatrise, pairplot, missing data. Hands-on med CSV-drop.",
  prerequisites: [],
  Component: Dte2602EdaPandasPage,
};
