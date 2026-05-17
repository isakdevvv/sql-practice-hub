import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-web-angrep",
  slug: "web-angrep",
  title: "Web-angrep — XSS, CSRF, SQL Injection sandbox",
  group: "eksamen",
  order: 8,
  status: "ready",
  shortDescription:
    "Interaktive sandbox-eksperimenter for de tre klassiske OWASP-angrepene: skriv inn payload, bytt mellom sårbar/sikker modus, dra forsvar inn på en angreps-tidslinje.",
  prerequisites: [{ slug: "sikkerhet", title: "Web-sikkerhet — OWASP-essensen" }],
  Component: lazy(() =>
    import("@/components/stack/web-angrep/WebAngrepPage").then((m) => ({
      default: m.WebAngrepPage,
    })),
  ),
};
