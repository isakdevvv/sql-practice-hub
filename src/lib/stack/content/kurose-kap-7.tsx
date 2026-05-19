import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-kurose-kap-7",
  slug: "kurose-kap-7",
  title: "Kurose kap. 7 — Trådløst og mobilt",
  group: "stack",
  order: 907,
  status: "ready",
  shortDescription: "WiFi, mobilnett, håndover, mobilitet. Disposisjon + lenker.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/kurose-kurs/KuroseKapStubPage").then((m) => ({ default: m.KuroseKap7Page }))),
};
