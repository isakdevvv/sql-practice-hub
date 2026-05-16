import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-konkurrens",
  slug: "dte2505-konkurrens",
  title: "Concurrency — låser, semaforer, deadlock",
  group: "eksamen",
  order: 40,
  status: "ready",
  shortDescription:
    "OSTEP kap. 28–33. Race conditions, mutex, condition variables, semaforer, Coffmans fire deadlock-betingelser, dining philosophers. Interaktiv ressurs-allokeringsgraf.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2505-konkurrens/KonkurrensPage").then((m) => ({ default: m.KonkurrensPage }))),
};
