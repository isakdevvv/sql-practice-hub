import { NnIntroPage } from "@/components/stack/nn-intro/NnIntroPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-nn-intro",
  slug: "nn-intro",
  title: "Innføring i nevrale nett",
  group: "eksamen",
  order: 25,
  status: "ready",
  shortDescription:
    "Perceptron, aktiveringsfunksjoner, feed-forward, loss, gradient descent, backpropagation, hyperparametere.",
  prerequisites: [],
  Component: NnIntroPage,
};
