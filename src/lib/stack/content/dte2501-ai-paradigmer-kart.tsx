import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2501-ai-paradigmer-kart",
  slug: "dte2501-ai-paradigmer-kart",
  title: "AI-paradigmer kart (intro)",
  group: "eksamen",
  order: 25,
  status: "ready",
  shortDescription:
    "Interaktivt kart over AI-algoritme-familier — søk, adversarial, evolutionary, swarm, ML, nevrale nett, RL. Klikk noder for one-liner og dybde-lenke. Problem-velger og avsluttende drag-quiz. Grokking AI kap. 1 — bygg en mental ramme før de tekniske lesjonene.",
  prerequisites: [],
  Component: lazy(() =>
    import(
      "@/components/stack/dte2501-ai-paradigmer-kart/AiParadigmerKartPage"
    ).then((m) => ({ default: m.AiParadigmerKartPage })),
  ),
};
