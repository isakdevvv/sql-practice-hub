import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-pytorch-tf",
  slug: "pytorch-tf",
  title: "PyTorch & TensorFlow",
  group: "eksamen",
  order: 42,
  status: "ready",
  shortDescription:
    "Tensors, autograd, training loop, eager vs graph mode — slik bruker du rammeverkene.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/pytorch-tf/PytorchTfPage").then((m) => ({ default: m.PytorchTfPage }))),
};
