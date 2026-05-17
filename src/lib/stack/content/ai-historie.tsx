import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-ai-historie",
  slug: "ai-historie",
  title: "AI-historie — interaktiv tidslinje (Turing → transformers)",
  group: "eksamen",
  order: 27,
  status: "ready",
  shortDescription:
    "75 år med AI — Turing-test (1950), Dartmouth (1956), perceptron, ELIZA, expert systems, AI-vintrene, backprop, Deep Blue, AlexNet, transformer, GPT-3, ChatGPT. Scrubbar tidslinje med 8 epoker, 14 nøkkelmomenter, paradigme-skift-graf (symbolic vs connectionist vs statistisk), AI-vinter-analyse + Gartner-syklus-vurdering, og 8-spørsmåls quiz.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/ai-historie/AiHistoriePage").then((m) => ({
      default: m.AiHistoriePage,
    })),
  ),
};
