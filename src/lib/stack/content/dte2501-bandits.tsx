import { BanditsPage } from "@/components/stack/dte2501-bandits/BanditsPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2501-bandits",
  slug: "dte2501-bandits",
  title: "Multi-armed bandits — explore vs exploit",
  group: "eksamen",
  order: 50,
  status: "ready",
  shortDescription:
    "Bandit-problemet, action-value methods, ε-greedy, optimistic initial values, UCB1, Thompson sampling og regret. Sutton & Barto kap. 2.",
  prerequisites: [],
  Component: BanditsPage,
};
