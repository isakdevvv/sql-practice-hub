import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-diskret-mod-aritmetikk",
  slug: "diskret-mod-aritmetikk",
  title: "Modulær aritmetikk — klokke, gcd, Euklid, invers, CRT",
  group: "eksamen",
  order: 140,
  status: "ready",
  shortDescription:
    "Hele modulær-aritmetikken bygget på klokke-metaforen: a mod n, Euklids algoritme + Bezouts identitet, modulær invers via Extended Euclidean, og Chinese Remainder Theorem. 5 interaktive komponenter, ingen flashcards.",
  prerequisites: [
    { slug: "diskret-matte", title: "Diskret matematikk" },
  ],
  Component: lazy(() =>
    import("@/components/stack/diskret-mod-aritmetikk/ModAritmetikkPage").then((m) => ({
      default: m.ModAritmetikkPage,
    })),
  ),
};
