import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte-2507",
  slug: "dte-2507",
  title: "DTE-2507 Datakommunikasjon og sikkerhet — hub",
  group: "eksamen",
  order: 15,
  status: "ready",
  shortDescription:
    "Fem mini-kurs som dekker DTE-2507-pensum: OSI/TCP-IP, transport, kryptografi, TLS og nettverkssikkerhet.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte-2507/Dte2507Hub").then((m) => ({ default: m.Dte2507Hub }))),
};
