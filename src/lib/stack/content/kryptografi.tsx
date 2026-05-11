import { KryptografiPage } from "@/components/stack/kryptografi/KryptografiPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-kryptografi",
  slug: "kryptografi",
  title: "Kryptografi-grunnlag",
  group: "eksamen",
  order: 18,
  status: "ready",
  shortDescription:
    "Symmetrisk vs asymmetrisk, hash vs MAC, digital signatur, PKI og sertifikater. CIA-trekanten.",
  prerequisites: [],
  Component: KryptografiPage,
};
