import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-cnn",
  slug: "cnn",
  title: "Konvolusjonsnett (CNN)",
  group: "eksamen",
  order: 39,
  status: "ready",
  shortDescription:
    "Convolution, pooling, stride/padding, parameter-deling. LeNet → AlexNet → ResNet.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/cnn/CnnPage").then((m) => ({ default: m.CnnPage }))),
};
