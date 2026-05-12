import { ObligerHub } from "@/components/stack/dte2505-obliger/ObligerHub";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-obliger",
  slug: "dte2505-obliger",
  title: "DTE-2505 — speil-obliger",
  group: "eksamen",
  order: 38,
  status: "ready",
  shortDescription:
    "Fem obligatoriske øvinger speilet fra UiT: installasjon, navigasjon, pakker, rettigheter, bash. Steg-svar med automatisk sjekk.",
  prerequisites: [],
  Component: ObligerHub,
};
