import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-ap-progresjon",
  slug: "dte2507-ap-progresjon",
  title: "ap 1.0 → 4.0 — autentisering steg for steg",
  group: "eksamen",
  order: 51,
  status: "ready",
  shortDescription:
    "Kurose & Ross sitt sikkerhets-flaggskip: «I am Alice» → IP-adresse → passord → kryptert passord → nonce. Trudy slår hver versjon helt til ap4.0. Sekvensdiagrammer per fase.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2507-ap-progresjon/ApProgresjonPage").then((m) => ({ default: m.ApProgresjonPage }))),
};
