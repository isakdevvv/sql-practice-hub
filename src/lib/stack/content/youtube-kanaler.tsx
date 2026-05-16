import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-youtube-kanaler",
  slug: "youtube-kanaler",
  title: "12 YouTube-kanaler en data-ingeniør faktisk trenger",
  group: "stack",
  order: 91,
  status: "ready",
  shortDescription:
    "Kuratert: 3Blue1Brown, Computerphile, Two Minute Papers, Sebastian Lague, Ben Eater, NeetCode, Karpathy, Coding Train, Fireship, MIT OCW, Stanford Online, Strange Loop. Hver med beste 'start her'-video.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/youtube-kanaler/YouTubeKanalerPage").then((m) => ({ default: m.YouTubeKanalerPage }))),
};
