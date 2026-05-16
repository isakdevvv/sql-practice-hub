import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-laereplan",
  slug: "laereplan",
  title: "Læreplan — første prinsipper",
  group: "eksamen",
  order: 0, // placed first via curriculum.ts override anyway
  status: "ready",
  shortDescription:
    "Hele plattformen som 14 faser i første-prinsipper-rekkefølge. Basert på MIT/Stanford/CMU/ETH bachelor-progresjon.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/laereplan/LaereplanPage").then((m) => ({ default: m.LaereplanPage }))),
};
