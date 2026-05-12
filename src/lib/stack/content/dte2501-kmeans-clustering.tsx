import { KMeansPage } from "@/components/stack/dte2501-ml/KMeansPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2501-kmeans",
  slug: "dte2501-kmeans-clustering",
  title: "k-Means clustering",
  group: "eksamen",
  order: 42,
  status: "ready",
  shortDescription:
    "Init/assign/update/konvergens. Elbow og silhouette. Når k-Means feiler og hierarkisk klustring som alternativ.",
  prerequisites: [],
  Component: KMeansPage,
};
