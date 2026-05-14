import { MdpBellmanPage } from "@/components/stack/dte2501-mdp-bellman/MdpBellmanPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2501-mdp-bellman",
  slug: "dte2501-mdp-bellman",
  title: "MDP — Bellman, Value Iteration og Policy Iteration regnedrill",
  group: "eksamen",
  order: 51,
  status: "ready",
  shortDescription:
    "Regnedrill for Bellman-likningen, Value Iteration og Policy Iteration. Steg-for-steg på 2-state MDP og 3×3 grid. Sutton & Barto kap. 3-4.",
  prerequisites: [],
  Component: MdpBellmanPage,
};
