import { BrukerhistorierPage } from "@/components/stack/brukerhistorier/BrukerhistorierPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-brukerhistorier",
  slug: "brukerhistorier",
  title: "Brukerhistorier, krav og estimering",
  group: "eksamen",
  order: 45,
  status: "ready",
  shortDescription:
    "Som-vil-for-å-formatet. INVEST. Akseptansekriterier. Story points (Fibonacci). Planning poker. Splitting.",
  prerequisites: [],
  Component: BrukerhistorierPage,
};
