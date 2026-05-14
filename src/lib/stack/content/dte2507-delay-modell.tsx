import { DelayModellPage } from "@/components/stack/dte2507-delay-modell/DelayModellPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-delay-modell",
  slug: "dte2507-delay-modell",
  title: "De fire forsinkelsene",
  group: "eksamen",
  order: 52,
  status: "ready",
  shortDescription:
    "Proc + queue + trans + prop = d_nodal. Karavananalogi fra Kurose-Ross, interaktiv delay-bygger, og kø-eksplosjon når ρ→1. LAN vs satellitt side ved side.",
  prerequisites: [],
  Component: DelayModellPage,
};
