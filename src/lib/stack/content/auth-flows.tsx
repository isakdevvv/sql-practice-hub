import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-auth-flows",
  slug: "auth-flows",
  title: "Auth flows — Session vs JWT vs OAuth",
  group: "eksamen",
  order: 20,
  status: "ready",
  shortDescription:
    "Side-ved-side animering av session-cookie, JWT og OAuth 2.0. Token-levetid, cookie-attributter, angrep-sandkasse og match-quiz for use-case → strategi.",
  prerequisites: [],
  Component: lazy(() =>
    import("@/components/stack/auth-flows/AuthFlowsPage").then((m) => ({
      default: m.AuthFlowsPage,
    })),
  ),
};
