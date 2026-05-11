import { RegulariseringPage } from "@/components/stack/regularisering/RegulariseringPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-regularisering",
  slug: "regularisering",
  title: "Regularisering (NN)",
  group: "eksamen",
  order: 40,
  status: "ready",
  shortDescription:
    "Dropout, batch normalization, weight decay, early stopping, data augmentation.",
  prerequisites: [],
  Component: RegulariseringPage,
};
