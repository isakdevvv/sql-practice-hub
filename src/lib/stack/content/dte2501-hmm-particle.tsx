import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-dte2501-hmm-particle",
  slug: "dte2501-hmm-particle",
  title: "HMM & particle filter",
  group: "stack",
  order: 861,
  status: "ready",
  shortDescription: "AIMA kap. 14. Robot lokaliserer seg på 1D-korridor med støyete dør-sensor; 100 partikler konvergerer rundt sann posisjon.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2501-hmm-particle/Dte2501HmmParticlePage").then((m) => ({ default: m.Dte2501HmmParticlePage }))),
};
