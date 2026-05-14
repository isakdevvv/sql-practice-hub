import { BgpLadderPage } from "@/components/stack/dte2507-bgp-stige/BgpLadderPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-bgp-stige",
  slug: "dte2507-bgp-stige",
  title: "BGP-rutevelger-stige",
  group: "eksamen",
  order: 59,
  status: "ready",
  shortDescription:
    "BGPs fire-stegs filterstige LOCAL_PREF → AS_PATH → hot potato → BGP-ID, med interaktiv simulator over fire konkurrerende ruter. Slider for LOCAL_PREF vrir policy. Kurose Ch 5.4.3.",
  prerequisites: [],
  Component: BgpLadderPage,
};
