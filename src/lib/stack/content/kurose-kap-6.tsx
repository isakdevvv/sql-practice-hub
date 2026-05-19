import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-kurose-kap-6",
  slug: "kurose-kap-6",
  title: "Kurose kap. 6 — Link-laget og LAN",
  group: "stack",
  order: 906,
  status: "ready",
  shortDescription: "Feiloppdaging, ALOHA, CSMA/CD, switcher, VLAN. Disposisjon + lenker.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/kurose-kurs/KuroseKap6Page").then((m) => ({ default: m.KuroseKap6Page }))),
};
