import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-diskret-matte",
  slug: "diskret-matte",
  title: "Diskret matematikk — språket bak algoritmer",
  group: "eksamen",
  order: 2,
  status: "ready",
  shortDescription:
    "Logikk, mengder, funksjoner, kombinatorikk, induksjon, grafer, modulær aritmetikk. MIT 6.042 i komprimert form.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/diskret-matte/DiskretMattePage").then((m) => ({ default: m.DiskretMattePage }))),
};
