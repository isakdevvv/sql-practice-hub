import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-dte2505-segmentation",
  slug: "dte2505-segmentation",
  title: "Segmentering & ekstern fragmentering",
  group: "stack",
  order: 851,
  status: "ready",
  shortDescription: "OSTEP kap. 14. Allokerings-simulator som viser hvordan ekstern fragmentering oppstår med first-fit/best-fit segment-allokering.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2505-segmentation/Dte2505SegmentationPage").then((m) => ({ default: m.Dte2505SegmentationPage }))),
};
