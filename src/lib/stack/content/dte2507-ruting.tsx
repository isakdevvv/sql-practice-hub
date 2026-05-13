import { RutingPage } from "@/components/stack/dte2507-ruting/RutingPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-ruting",
  slug: "dte2507-ruting",
  title: "IP-forwarding og ruting",
  group: "eksamen",
  order: 42,
  status: "ready",
  shortDescription:
    "Data plane vs control plane, longest-prefix-match, Dijkstra vs Bellman-Ford, OSPF/RIP/BGP. Interaktiv rute-graf med steg-for-steg algoritme + LPM-trener.",
  prerequisites: [],
  Component: RutingPage,
};
