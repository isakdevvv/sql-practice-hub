import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-sikkerhet",
  slug: "sikkerhet",
  title: "Web-sikkerhet — SQL injection, XSS, CSRF",
  group: "eksamen",
  order: 7,
  status: "ready",
  shortDescription:
    "Fem klassiske web-sårbarheter med sårbar/trygg kode side om side: SQL injection, XSS, CSRF, passord-lagring, mass-assignment.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/sikkerhet/SikkerhetPage").then((m) => ({ default: m.SikkerhetPage }))),
};
