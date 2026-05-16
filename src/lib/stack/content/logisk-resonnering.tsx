import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-logisk-resonnering",
  slug: "logisk-resonnering",
  title: "Logisk resonnering",
  group: "eksamen",
  order: 29,
  status: "ready",
  shortDescription:
    "Propositional logic, sannhetstabeller, modus ponens, resolusjon og en kort introduksjon til first-order logic.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/logisk-resonnering/LogiskResonneringPage").then((m) => ({ default: m.LogiskResonneringPage }))),
};
