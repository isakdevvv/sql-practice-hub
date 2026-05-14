import { CbcIvPage } from "@/components/stack/dte2507-cbc-iv/CbcIvPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-cbc-iv",
  slug: "dte2507-cbc-iv",
  title: "CBC og hvorfor like blokker er farlige",
  group: "eksamen",
  order: 65,
  status: "ready",
  shortDescription:
    "ECB-lekkasje: deterministic block cipher lekker mønstre (pingvinen). CBC: hver blokk XOR-es med forrige cipher-blokk + tilfeldig IV først. Interaktiv ECB↔CBC-visualisering på samme melding.",
  prerequisites: [],
  Component: CbcIvPage,
};
