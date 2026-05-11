import { CnnPage } from "@/components/stack/cnn/CnnPage";
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
  Component: CnnPage,
};
