import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-dte2501-mcts",
  slug: "dte2501-mcts",
  title: "Monte Carlo Tree Search (MCTS)",
  group: "stack",
  order: 860,
  status: "ready",
  shortDescription: "AIMA kap. 5.4. MCTS på tic-tac-toe med UCB1-selection. Klikk gjennom iterasjoner og se rot-statistikk per trekk.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2501-mcts/Dte2501MctsPage").then((m) => ({ default: m.Dte2501MctsPage }))),
};
