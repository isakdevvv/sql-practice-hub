import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2602-etikk",
  slug: "dte2602-etikk-filosofi",
  title: "DTE-2602 — Etikk og filosofiske grunnlagsproblemer",
  group: "eksamen",
  order: 28,
  status: "ready",
  shortDescription:
    "AI-historie (Turing → Dartmouth → vintrene → DL-bølgen), bias-taksonomi, GDPR, XAI, Kinarommet, EU AI Act, diskusjons-caser.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2602-etikk-filosofi/Dte2602EtikkPage").then((m) => ({ default: m.Dte2602EtikkPage }))),
};
