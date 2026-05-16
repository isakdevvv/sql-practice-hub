import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tek1-distribusjons-plotter",
  slug: "tek1-distribusjons-plotter",
  title: "TEK-1501 — Fordelings-plotter (interaktiv)",
  group: "eksamen",
  order: 110,
  status: "ready",
  shortDescription:
    "Skyv på μ, σ, λ, df, n og p. Live PDF/PMF og CDF side om side, kritiske verdier ved α=0.05 skyggelegges automatisk.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/tek1-distribusjons-plotter/Tek1DistribusjonsPlotterPage").then((m) => ({
      default: m.Tek1DistribusjonsPlotterPage,
    })),
  ),
};
