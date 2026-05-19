import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-svd-eigen-explorer",
  slug: "svd-eigen-explorer",
  title: "SVD & eigendekomposisjon",
  group: "stack",
  order: 866,
  status: "ready",
  shortDescription: "MML kap. 4. Live 2×2 matrise → SVD-akser. Se hvordan enhetssirkelen blir til en ellipse hvis akser er σ_1·u_1 og σ_2·u_2.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/svd-eigen-explorer/SvdEigenExplorerPage").then((m) => ({ default: m.SvdEigenExplorerPage }))),
};
