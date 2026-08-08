import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-moduler",
  slug: "dte2505-moduler",
  title: "DTE-2505 — Canvas-modulene",
  group: "eksamen",
  order: 30,
  status: "ready",
  shortDescription:
    "Faget modul for modul slik det undervises: sju moduler, seks obligfrister, hvilket innhold som dekker hva — og hvilke moduler som fortsatt er hull.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2505-moduler/Dte2505ModulerPage").then((m) => ({
      default: m.Dte2505ModulerPage,
    })),
  ),
};
