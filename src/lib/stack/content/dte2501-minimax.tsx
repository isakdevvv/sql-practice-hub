import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2501-minimax",
  slug: "dte2501-minimax",
  title: "Minimax og alpha-beta pruning",
  group: "eksamen",
  order: 49,
  status: "ready",
  shortDescription:
    "Adversarial search i 2-spillerspill. Minimax-algoritmen, alpha-beta pruning, evalueringsfunksjoner og quiescence search. AIMA kap. 6.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2501-minimax/MinimaxPage").then((m) => ({ default: m.MinimaxPage }))),
};
