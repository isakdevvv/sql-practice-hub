import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tls",
  slug: "tls",
  title: "TLS-håndtrykk",
  group: "eksamen",
  order: 19,
  status: "ready",
  shortDescription:
    "ClientHello → ServerHello + sertifikat → ECDHE-nøkkel-utveksling → Finished. TLS 1.2 vs 1.3, sertifikatvalidering.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/tls/TlsPage").then((m) => ({ default: m.TlsPage }))),
};
