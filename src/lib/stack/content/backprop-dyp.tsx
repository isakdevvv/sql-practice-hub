import { BackpropDypPage } from "@/components/stack/backprop-dyp/BackpropDypPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-backprop-dyp",
  slug: "backprop-dyp",
  title: "Backpropagation — dypt",
  group: "eksamen",
  order: 38,
  status: "ready",
  shortDescription:
    "Kjerne-regelen, beregningsgraf, vanishing/exploding gradient, He/Xavier-init, gradient clipping.",
  prerequisites: [],
  Component: BackpropDypPage,
};
