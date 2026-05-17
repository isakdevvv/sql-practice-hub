import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "backup-strategier",
  slug: "backup-strategier",
  title: "Backup-strategier — full vs inkrementell vs differensiell + recovery",
  group: "eksamen",
  order: 100,
  status: "ready",
  shortDescription:
    "Interaktiv lesjon: 30-dagers timeline-simulator (Full / Inc / Diff / GFS) viser disk-volum og backup-vindu. Recovery-animator demonstrerer hvor sårbar inkrementell-kjeden er. 5×4 tradeoff-matrise (lagring, vindu, RTO, RPO) + 5-scenario match-quiz (bank-DB, NAS, blogg, HFT-logger, ML-data).",
  prerequisites: ["transaksjoner", "dte2505-filsystem"],
  Component: lazy(() =>
    import("@/components/stack/dte-2502-backup/BackupPage").then((m) => ({
      default: m.BackupPage,
    })),
  ),
};
