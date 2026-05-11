import { NettverkssikkerhetPage } from "@/components/stack/nettverkssikkerhet/NettverkssikkerhetPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-nettverkssikkerhet",
  slug: "nettverkssikkerhet",
  title: "Nettverkssikkerhet — brannmur, IDS, angrep",
  group: "eksamen",
  order: 20,
  status: "ready",
  shortDescription:
    "Forsvarsdyp, stateful brannmur, NAT, IDS vs IPS, vanlige nettverksangrep, web-server-sjekkliste.",
  prerequisites: [],
  Component: NettverkssikkerhetPage,
};
