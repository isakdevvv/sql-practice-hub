import { NormaliseringPage } from "@/components/stack/normalisering/NormaliseringPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-normalisering",
  slug: "normalisering",
  title: "Normalisering — 1NF, 2NF, 3NF",
  group: "eksamen",
  order: 5,
  status: "ready",
  shortDescription:
    "Fra rotete tabell til 3NF: anomalier, FD-er, partiell og transitiv avhengighet — med ett gjennomgående eksempel.",
  prerequisites: [],
  Component: NormaliseringPage,
};
