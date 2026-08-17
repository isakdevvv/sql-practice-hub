import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-python-lokker-lab",
  slug: "python-lokker-lab",
  title: "Løkker: tell iterasjonene",
  group: "stack",
  order: 52,
  status: "ready",
  shortDescription:
    "Ekte Python i nettleseren, med en teller ved hver linje som viser hvor mange ganger den faktisk kjørte. Ni måloppgaver om av-med-én, break, continue og nøstede løkker — og en evig løkke som sandkassen stopper i stedet for å fryse.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/python-lokker-lab/LokkeLabPage").then((m) => ({
      default: m.LokkeLabPage,
    })),
  ),
};
