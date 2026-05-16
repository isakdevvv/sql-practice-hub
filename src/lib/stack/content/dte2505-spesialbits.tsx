import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-spesialbits",
  slug: "dte2505-spesialbits",
  title: "Spesialbits — setuid, setgid, sticky",
  group: "eksamen",
  order: 36,
  status: "ready",
  shortDescription:
    "Atom F5: setuid/setgid/sticky som dedikert trio. Passwd-paradokset, /tmp-sticky og setgid-team-mappe. Interaktiv 12-bits bit-builder + drill.",
  prerequisites: [
    { slug: "dte2505-rwx-kalkulator", title: "rwx-kalkulator" },
  ],
  Component: lazy(() => import("@/components/stack/dte2505-spesialbits/Dte2505SpesialbitsPage").then((m) => ({ default: m.Dte2505SpesialbitsPage }))),
};
