import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-http-statuskoder",
  slug: "http-statuskoder",
  title: "HTTP statuskoder — beslutningstre og response-builder",
  group: "eksamen",
  order: 60,
  status: "ready",
  shortDescription:
    "Bygg intuisjon for hver kode: klikkbart beslutningstre fra symptom til kode, response-builder med live lint (Location for 201, ETag for 304, Retry-After for 429/503), 6 animerte request-scenarier og dra-quiz med 10 use-cases.",
  prerequisites: [{ slug: "http-anatomi", title: "HTTP-anatomi" }],
  Component: lazy(() =>
    import("@/components/stack/http-statuskoder/HttpStatuskoderPage").then((m) => ({
      default: m.HttpStatuskoderPage,
    }))
  ),
};
