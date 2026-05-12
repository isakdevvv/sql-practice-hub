import { ReinforcementPage } from "@/components/stack/dte2501-ml/ReinforcementPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2501-rl",
  slug: "dte2501-reinforcement",
  title: "Reinforcement Learning og MDP",
  group: "eksamen",
  order: 48,
  status: "ready",
  shortDescription:
    "MDP, Bellman, Value/Policy Iteration. Known vs unknown world. Q-learning og ε-greedy.",
  prerequisites: [],
  Component: ReinforcementPage,
};
