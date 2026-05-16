import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte-2604",
  slug: "dte-2604",
  title: "DTE-2604 Systemutvikling — hub",
  group: "eksamen",
  order: 43,
  status: "ready",
  shortDescription:
    "Fire mini-kurs som dekker DTE-2604-pensum: smidige metodikker, brukerhistorier, UML, prosjekt-praksis.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte-2604/Dte2604Hub").then((m) => ({ default: m.Dte2604Hub }))),
};
