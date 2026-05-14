import { Http2HolPage } from "@/components/stack/dte2507-http2-hol/Http2HolPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-http2-hol",
  slug: "dte2507-http2-hol",
  title: "HTTP/1.1 vs HTTP/2 — HOL-blokkering",
  group: "eksamen",
  order: 54,
  status: "ready",
  shortDescription:
    "Hvorfor HTTP/1.1 trengte 6 parallelle tilkoblinger og HTTP/2 ikke. Pipelining, Head-of-Line-blokkering, frames + interleaving — med interaktiv timeline-sammenligning.",
  prerequisites: [],
  Component: Http2HolPage,
};
