import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-modul1",
  slug: "dte2507-modul1",
  title: "Modul 1 — Introduksjon",
  group: "eksamen",
  order: 30,
  status: "ready",
  shortDescription:
    "DTE-2507 modul 1 som én løype: protokollstakken, Lab 1 i terminalen, og de fire forsinkelsene. Fire steg med frist, framdrift og neste-knapp hele veien.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2507-modul1/Modul1Page").then((m) => ({
      default: m.Dte2507Modul1Page,
    })),
  ),
};
