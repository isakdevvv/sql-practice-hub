import { PcaPage } from "@/components/stack/dte2501-ml/PcaPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2501-pca",
  slug: "dte2501-pca",
  title: "Principal Component Analysis",
  group: "eksamen",
  order: 45,
  status: "ready",
  shortDescription:
    "Dimensjonsreduksjon via kovariansmatrise og egenvektorer. Forklart varians, scree plot, eigenfaces.",
  prerequisites: [],
  Component: PcaPage,
};
