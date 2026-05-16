import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-switch-self-learning",
  slug: "dte2507-switch-self-learning",
  title: "Switchen husker hvem du så snakke",
  group: "eksamen",
  order: 63,
  status: "ready",
  shortDescription:
    "Selvlærende Ethernet-switch (Kurose 6.4.3). Animert simulator: source-MAC fyller tabellen, aging-timer sletter gamle entries, og tre forwarding-tilfeller (broadcast, filter, forward) demonstreres.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2507-switch-self-learning/SwitchSelfLearningPage").then((m) => ({ default: m.SwitchSelfLearningPage }))),
};
