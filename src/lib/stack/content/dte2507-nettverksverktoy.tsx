import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-nettverksverktoy",
  slug: "dte2507-nettverksverktoy",
  title: "Nettverksverktøy i terminalen",
  group: "eksamen",
  order: 32,
  status: "ready",
  shortDescription:
    "ifconfig, ping, traceroute, nslookup og netstat mot et etterlignet nett. Elleve måloppgaver som sjekker verdien du finner, ikke kommandoen du skrev. Dekker DTE-2507 Lab 1.",
  prerequisites: [
    { slug: "dte2507-skjelett", title: "Protokollstakken, innkapsling og adresser" },
  ],
  Component: lazy(() =>
    import("@/components/stack/dte2507-nettverksverktoy/NettverksverktoyPage").then((m) => ({
      default: m.NettverksverktoyPage,
    })),
  ),
};
