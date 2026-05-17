import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-tx-isolation",
  slug: "tx-isolation",
  title: "Transaksjons-isolasjonsnivå — dirty/non-repeatable/phantom/lost-update",
  group: "stack",
  order: 135,
  status: "ready",
  shortDescription:
    "Interaktiv lesjon: to samtidige transaksjoner side ved side. Velg isolasjonsnivå og kjør operasjoner manuelt, eller spill av forhåndsdefinerte anomali-presets. Inkluderer 4×4 anomali-matrise og en lås-tidslinje som viser shared/exclusive/range-låser, samt deadlock-deteksjon.",
  prerequisites: [
    { slug: "transaksjoner", title: "Transaksjoner — ACID og isolation" },
  ],
  Component: lazy(() =>
    import("@/components/stack/database-tx-isolation/TxIsolationPage").then(
      (m) => ({ default: m.TxIsolationPage }),
    ),
  ),
};
