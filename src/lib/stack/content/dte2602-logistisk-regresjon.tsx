import { LogistiskRegresjonPage } from "@/components/stack/dte2602-logistisk-regresjon/LogistiskRegresjonPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2602-logistisk-regresjon",
  slug: "dte2602-logistisk-regresjon",
  title: "DTE-2602 — Logistisk regresjon dypt",
  group: "eksamen",
  order: 10,
  status: "ready",
  shortDescription:
    "Sigmoid, log-odds, MLE og log-loss, gradient descent på cross-entropy, odds-ratio-tolkning, multinomial (softmax), class imbalance. Live 2D-trening med decision boundary, loss-kurve og slidere for lr og L2.",
  prerequisites: [],
  Component: LogistiskRegresjonPage,
};
