import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-hjelpesystemer",
  slug: "dte2505-hjelpesystemer",
  title: "Modul 2 — Kommandobasert, hjelpesystemer og dokumentasjon",
  group: "eksamen",
  order: 48,
  status: "ready",
  shortDescription:
    "DTE-2505 Modul 2 (Oblig 2, frist 11.09): kommandolinjas anatomi, manualens åtte seksjoner, SYNOPSIS-notasjonen, apropos/whatis, --help, info, which/type/whereis. Interaktiv manualside-utforsker, fri hjelpekonsoll, seks anslå-oppgaver, sju måloppgaver med tilstandssjekk, fem feilsøkingsoppgaver og recall-kort.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2505-hjelpesystemer/HjelpesystemerPage").then((m) => ({
      default: m.HjelpesystemerPage,
    })),
  ),
};
