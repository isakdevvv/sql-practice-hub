import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-subnetting",
  slug: "dte2507-subnetting",
  title: "Subnetting — del opp nettverket",
  group: "eksamen",
  order: 40,
  status: "ready",
  shortDescription:
    "CIDR, subnet-maske, network/broadcast/usable, VLSM. Live-kalkulator med binær visning og en VLSM-trener med fri-form input.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2507-subnetting/SubnettingPage").then((m) => ({ default: m.SubnettingPage }))),
};
