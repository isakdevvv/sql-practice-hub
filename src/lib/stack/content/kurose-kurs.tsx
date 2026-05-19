import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-kurose-kurs",
  slug: "kurose-kurs",
  title: "Kurose-kurset — Computer Networking",
  group: "stack",
  order: 900,
  status: "ready",
  shortDescription:
    "Bok-som-kurs: Kurose & Ross sin lærebok, kapittel for kapittel, med våre egne definisjoner, illustrasjoner og oppgaver. Direkte koblet til alle våre DTE-2507-sider.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/kurose-kurs/KuroseKursHubPage").then((m) => ({ default: m.KuroseKursHubPage })),
  ),
};
