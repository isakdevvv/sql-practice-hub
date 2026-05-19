import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-kurose-kap-1",
  slug: "kurose-kap-1",
  title: "Kurose kap. 1 — Internett og nettverks-grunnleggende",
  group: "stack",
  order: 901,
  status: "ready",
  shortDescription:
    "Hva internett er, edge vs core, pakke vs krets-svitsjing, forsinkelse, og lag-modellen. Fullt bygget kapittel med definisjoner, illustrasjoner, eksempler og oppgaver.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/kurose-kurs/KuroseKap1Page").then((m) => ({ default: m.KuroseKap1Page }))),
};
