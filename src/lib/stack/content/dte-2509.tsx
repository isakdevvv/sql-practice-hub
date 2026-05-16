import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte-2509",
  slug: "dte-2509",
  title: "DTE-2509 Databaser og webapplikasjoner 1 — hub",
  group: "eksamen",
  order: 1,
  status: "ready",
  shortDescription:
    "Seks moduler som dekker hele DTE-2509-pensumet: HTML/CSS+Git, Flask Basics, Database, User Management, API/HTTP, og Web-sikkerhet.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte-2509/Dte2509Hub").then((m) => ({ default: m.Dte2509Hub }))),
};
