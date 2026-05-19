import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-trinn-0-signals-codes",
  slug: "trinn-0-signals-codes",
  title: "Trinn 0 — Signaler og koder",
  group: "stack",
  order: 5,
  status: "ready",
  shortDescription: "Petzold Code kap. 1–3. Morse-kode + binær bit-strøm. Pre-transistor-fundamentet for hvordan to-tilstand-systemer bærer informasjon.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/trinn-0-signals-codes/Trinn0SignalsCodesPage").then((m) => ({ default: m.Trinn0SignalsCodesPage })),
  ),
};
