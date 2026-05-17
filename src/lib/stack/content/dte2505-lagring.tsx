import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-lagring",
  slug: "dte2505-lagring",
  title: "Lagringsmedier — HDD, SSD, NVMe, NAND-flash, wear leveling & TRIM",
  group: "eksamen",
  order: 47,
  status: "ready",
  shortDescription:
    "Hvordan lagringsmedier faktisk fungerer fysisk: HDD-mekanikk (seek + rotasjon), NAND-celler (SLC/MLC/TLC/QLC), erase-before-write, write amplification, wear leveling, TRIM, random vs sequential I/O. Sju interaktive visualizere + drill med fem oppgaver + recall.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2505-lagring/LagringPage").then((m) => ({
      default: m.LagringPage,
    })),
  ),
};
