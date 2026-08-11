import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-skjelett",
  slug: "dte2507-skjelett",
  title: "Protokollstakken, innkapsling og adresser",
  group: "eksamen",
  order: 32,
  status: "ready",
  shortDescription:
    "Lag 0: de fem lagene med dataenhet og adresse, innkapslingssimulator, samme pakke gjennom tre hopp, pakke- mot krets-svitsjing, pakkebygger med måltilstandssjekk og feilsøking på tvers av lagene.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/dte2507-skjelett/SkjelettPage").then((m) => ({
      default: m.SkjelettPage,
    })),
  ),
};
