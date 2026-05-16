import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-bash-scripts",
  slug: "dte2505-bash-scripts",
  title: "Bash-skript — kontroll og omdirigering",
  group: "eksamen",
  order: 37,
  status: "ready",
  shortDescription:
    "Variabler, sitering, if/then/fi, for/while, $@/$#/$?, funksjoner, pipes og omdirigering. Sandkasse med mock-FS.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2505-bash-scripts/BashScriptsPage").then((m) => ({ default: m.BashScriptsPage }))),
};
