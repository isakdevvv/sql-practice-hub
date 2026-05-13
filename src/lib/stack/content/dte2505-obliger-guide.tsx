import { Dte2505ObligerGuidePage } from "@/components/stack/dte2505-obliger-guide/Dte2505ObligerGuidePage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-obliger-guide",
  slug: "dte2505-obliger-guide",
  title: "DTE-2505 — Oblig-guide (8 obliger)",
  group: "eksamen",
  order: 38,
  status: "ready",
  shortDescription:
    "Steg-for-steg guide gjennom de 8 obligene i DTE-2505: VM, Linux-grunnlag, brukere, rettigheter, prosesser, scripting, pakker og tjenester.",
  prerequisites: [],
  Component: Dte2505ObligerGuidePage,
};
