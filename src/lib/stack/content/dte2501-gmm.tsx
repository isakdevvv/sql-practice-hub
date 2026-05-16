import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2501-gmm",
  slug: "dte2501-gmm",
  title: "Gaussian Mixture Models",
  group: "eksamen",
  order: 46,
  status: "ready",
  shortDescription:
    "Mikstur av normalfordelinger. EM-algoritmen (E-step + M-step). Soft vs hard clustering.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2501-ml/GmmPage").then((m) => ({ default: m.GmmPage }))),
};
