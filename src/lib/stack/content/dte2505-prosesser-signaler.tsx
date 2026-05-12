import { ProsesserSignalerPage } from "@/components/stack/dte2505-prosesser-signaler/ProsesserSignalerPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-prosesser-signaler",
  slug: "dte2505-prosesser-signaler",
  title: "Prosesser og signaler",
  group: "eksamen",
  order: 36,
  status: "ready",
  shortDescription:
    "STAT-tilstander (R/S/D/Z/T), ps aux-tolking, signal-tabell, sandkasse for SIGTERM vs SIGKILL, nice/renice, jobs.",
  prerequisites: [],
  Component: ProsesserSignalerPage,
};
