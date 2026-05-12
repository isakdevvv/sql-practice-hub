import { Tek1501Hub } from "@/components/stack/tek-1501/Tek1501Hub";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek-1501",
  slug: "tek-1501",
  title: "TEK-1501 Sannsynlighet og statistikk for ingeniører — hub",
  group: "eksamen",
  order: 1,
  status: "ready",
  shortDescription:
    "Fire moduler som dekker hele TEK-1501-pensumet: deskriptiv statistikk, sannsynlighet og kombinatorikk, sannsynlighetsfordelinger, og statistisk inferens med regresjon.",
  prerequisites: [],
  Component: Tek1501Hub,
};
