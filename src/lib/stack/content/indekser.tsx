import { IndekserPage } from "@/components/stack/indekser/IndekserPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-indekser",
  slug: "indekser",
  title: "Indekser — B-tree, covering og trade-offs",
  group: "stack",
  order: 131,
  status: "ready",
  shortDescription:
    "Hva en indeks er, B-tree- og hash-struktur, composite-rekkefølge, covering index, klassiske mønstre der indeksen IKKE brukes, og lese- vs skrive-trade-offen.",
  prerequisites: [
    { slug: "nokler", title: "Primær- og fremmednøkler" },
  ],
  Component: IndekserPage,
};
