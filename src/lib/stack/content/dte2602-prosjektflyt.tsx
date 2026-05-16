import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2602-prosjektflyt",
  slug: "dte2602-prosjektflyt",
  title: "DTE-2602 — ML-prosjekt fra A til Å",
  group: "eksamen",
  order: 26,
  status: "ready",
  shortDescription:
    "CRISP-DM-aktig 7-stegs flyt: forstå problem → data → EDA → features → tren → evaluér → deploy. Titanic ende-til-ende + mappe-struktur.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2602-prosjektflyt/Dte2602ProsjektflytPage").then((m) => ({ default: m.Dte2602ProsjektflytPage }))),
};
