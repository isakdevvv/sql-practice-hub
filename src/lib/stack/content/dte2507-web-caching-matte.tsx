import { WebCachingMattePage } from "@/components/stack/dte2507-web-caching-matte/WebCachingMattePage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-web-caching-matte",
  slug: "dte2507-web-caching-matte",
  title: "Web-caching matematikk",
  group: "eksamen",
  order: 55,
  status: "ready",
  shortDescription:
    "Kurose-eksemplet 15 req/s × 1 Mbit på 15 Mbps access-link: ρ = 1 gir ∞ delay. Cache med 40 % hit-rate kutter snittforsinkelse til ~1.2 s. Interaktiv kalkulator + Conditional GET.",
  prerequisites: [],
  Component: WebCachingMattePage,
};
