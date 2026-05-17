import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-brannmur-pakkeflyt",
  slug: "dte2507-brannmur-pakkeflyt",
  title: "Brannmur — pakkeflyt og regelmatching",
  group: "eksamen",
  order: 67,
  status: "ready",
  shortDescription:
    "Fire interaktive verktøy som dekker de 8 Brannmur-flashcardene visuelt: pakke gjennom regelliste, stateful conntrack-tabell, NAT-oversettelse og DMZ-topologi med valideringsmodus.",
  prerequisites: [
    { slug: "dte2507-stateful-firewall", title: "Stateful vs stateless brannmur" },
  ],
  Component: lazy(() =>
    import("@/components/stack/dte2507-brannmur-pakkeflyt/BrannmurPakkeflytPage").then((m) => ({
      default: m.BrannmurPakkeflytPage,
    }))
  ),
};
