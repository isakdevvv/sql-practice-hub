import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-kurose-kap-2",
  slug: "kurose-kap-2",
  title: "Kurose kap. 2 — Applikasjonslaget",
  group: "stack",
  order: 902,
  status: "ready",
  shortDescription: "HTTP, DNS, e-post, P2P, video-streaming, sockets. Disposisjon + lenker til våre interaktive sider mens den fulle versjonen bygges.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/kurose-kurs/KuroseKap2Page").then((m) => ({ default: m.KuroseKap2Page }))),
};
