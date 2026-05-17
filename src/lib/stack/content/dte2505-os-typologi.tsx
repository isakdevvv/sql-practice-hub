import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-os-typologi",
  slug: "dte2505-os-typologi",
  title: "OS-typologi — batch / interactive / network / real-time / distributed",
  group: "eksamen",
  order: 39,
  status: "ready",
  shortDescription:
    "O'Gorman kap. 1.6. Interaktiv simulator: velg arbeidslast og OS-type, se hva som skjer (køer som vokser, missed deadlines, suksess). Side-ved-side sammenligning + drag-matching av 6 use-cases.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2505-os-typologi/OsTypologiPage").then((m) => ({
      default: m.OsTypologiPage,
    })),
  ),
};
