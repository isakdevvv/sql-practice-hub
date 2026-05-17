import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-kontekstbytte",
  slug: "dte2505-kontekstbytte",
  title: "Kontekstbytte — register save/restore (steg-for-steg)",
  group: "eksamen",
  order: 41,
  status: "ready",
  shortDescription:
    "O'Gorman kap. 2.8. Animator viser PC/SP/R0–R7/PSR/MMU bli lagret til Tråd A og restaurert fra Tråd B, register for register. Feilmodus: 'restore PC først' viser krasj. Step-debugger + drag-quiz på riktig rekkefølge.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2505-kontekstbytte/KontekstbyttePage").then((m) => ({ default: m.KontekstbyttePage }))),
};
