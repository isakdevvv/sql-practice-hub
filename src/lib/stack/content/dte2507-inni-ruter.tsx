import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-inni-ruter",
  slug: "dte2507-inni-ruter",
  title: "Inni en ruter — switch fabric og HOL-blocking",
  group: "eksamen",
  order: 56,
  status: "ready",
  shortDescription:
    "Input port, switch fabric og output port. Via memory / via bus / via crossbar. Head-of-Line blocking med Karol-grensen 58%, og bufferbloat — «buffering is like salt».",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2507-inni-ruter/InniRuterPage").then((m) => ({ default: m.InniRuterPage }))),
};
