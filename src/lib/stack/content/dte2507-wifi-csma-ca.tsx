import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-dte2507-wifi-csma-ca",
  slug: "dte2507-wifi-csma-ca",
  title: "WiFi — CSMA/CA og RTS/CTS",
  group: "stack",
  order: 855,
  status: "ready",
  shortDescription: "Kurose kap. 7.2. Tre tidslinje-modeller: CSMA/CD (Ethernet), CSMA/CA (WiFi), CSMA/CA + RTS/CTS. Hidden terminal-scenario.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2507-wifi-csma-ca/Dte2507WifiCsmaCaPage").then((m) => ({ default: m.Dte2507WifiCsmaCaPage }))),
};
