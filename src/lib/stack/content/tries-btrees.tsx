import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-tries-btrees",
  slug: "tries-btrees",
  title: "Trier og B-trær",
  group: "stack",
  order: 803,
  status: "ready",
  shortDescription:
    "Sett inn ord i en trie, søk prefix og se autocomplete. Bytt til B-tree (t=2) for å se hvordan brede, balanserte trær bygges med node-splitting.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/tries-btrees/TriesBtreesPage").then((m) => ({
      default: m.TriesBtreesPage,
    })),
  ),
};
