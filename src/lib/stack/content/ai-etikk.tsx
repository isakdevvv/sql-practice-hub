import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-ai-etikk",
  slug: "ai-etikk",
  title: "AI-etikk — bias-i-data, fairness-metrikker, scenario-sandbox",
  group: "eksamen",
  order: 70,
  status: "ready",
  shortDescription:
    "Interaktiv sandbox: dra treningsdata for en lønnsprediktor, se hvordan bias lærer seg inn, regn fairness-metrikker per gruppe, sammenlign 6 ekte etiske case-studies, og sjekk en GDPR-form mot dark patterns.",
  prerequisites: [
    { slug: "dte-2501", title: "DTE-2501 AI Methods and Applications" },
    { slug: "dte2602-etikk-filosofi", title: "DTE-2602 — Etikk og filosofiske grunnlagsproblemer" },
  ],
  Component: lazy(() =>
    import("@/components/stack/ai-etikk/AiEtikkPage").then((m) => ({
      default: m.AiEtikkPage,
    })),
  ),
};
