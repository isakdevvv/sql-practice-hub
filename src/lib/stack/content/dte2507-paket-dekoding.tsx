import { PaketDekodingPage } from "@/components/stack/dte2507-paket-dekoding/PaketDekodingPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-paket-dekoding",
  slug: "dte2507-paket-dekoding",
  title: "Paket-dekoding — fra hex til mening",
  group: "eksamen",
  order: 42,
  status: "ready",
  shortDescription:
    "Ethernet/IP/TCP/UDP-headere byte for byte. Interaktiv hex-dump — hold musen over en byte for tolkning.",
  prerequisites: [],
  Component: PaketDekodingPage,
};
