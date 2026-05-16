import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-nettverkssikkerhet",
  slug: "nettverkssikkerhet",
  title: "Nettverkssikkerhet — brannmur, IDS, angrep",
  group: "eksamen",
  order: 20,
  status: "ready",
  shortDescription:
    "Forsvarsdyp, stateful brannmur, NAT, IDS vs IPS, vanlige nettverksangrep, web-server-sjekkliste.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/nettverkssikkerhet/NettverkssikkerhetPage").then((m) => ({ default: m.NettverkssikkerhetPage }))),
};
