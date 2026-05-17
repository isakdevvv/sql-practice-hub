import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek1-inferens-sampling",
  slug: "tek1-inferens-sampling",
  title: "TEK-1501 — Statistisk inferens-simulator",
  group: "eksamen",
  order: 112,
  status: "ready",
  shortDescription:
    "Interaktiv lesjon med fem simulatorer: sampling-distribution + CLT, 95 % CI-coverage på 100 utvalg, Welch t-test live, p-verdi-fordeling under H₀/H₁, og åtte test-valg-scenarier. Bygger intuisjon for hva en p-verdi faktisk er.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/tek1-inferens-sampling/Tek1InferensSamplingPage").then(
      (m) => ({
        default: m.Tek1InferensSamplingPage,
      }),
    ),
  ),
};
