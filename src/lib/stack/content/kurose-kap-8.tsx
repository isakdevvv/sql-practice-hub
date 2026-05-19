import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-kurose-kap-8",
  slug: "kurose-kap-8",
  title: "Kurose kap. 8 — Sikkerhet i nettverk",
  group: "stack",
  order: 908,
  status: "ready",
  shortDescription: "Krypto, TLS, IPsec, brannmurer, IDS. Disposisjon + lenker.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/kurose-kurs/KuroseKapStubPage").then((m) => ({ default: m.KuroseKap8Page }))),
};
