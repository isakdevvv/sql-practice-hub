import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-dte2505-lfs",
  slug: "dte2505-lfs",
  title: "Log-structured Filesystem (LFS)",
  group: "stack",
  order: 850,
  status: "ready",
  shortDescription: "OSTEP kap. 43. Append-only-disk med garbage collection. Skriv filer, oppdater dem, se dead blocks samles og GC kopiere live data videre.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2505-lfs/Dte2505LfsPage").then((m) => ({ default: m.Dte2505LfsPage }))),
};
