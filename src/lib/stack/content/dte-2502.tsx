import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte-2502",
  slug: "dte-2502",
  title: "DTE-2502 Neural Networks — hub",
  group: "eksamen",
  order: 37,
  status: "ready",
  shortDescription:
    "Dyplæring som bygger på DTE-2602: backpropagation dypt, CNN, regularisering, optimerere, PyTorch/TF.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte-2502/Dte2502Hub").then((m) => ({ default: m.Dte2502Hub }))),
};
