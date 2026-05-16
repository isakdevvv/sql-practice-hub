import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-wireshark-analyse",
  slug: "dte2507-wireshark-analyse",
  title: "Wireshark / pcap-analyse",
  group: "eksamen",
  order: 22,
  status: "ready",
  shortDescription:
    "Les pcap-tabeller som eksamen viser dem. Filter-syntaks, HTTP/DNS/TLS-flyt frame for frame, ARP-spoofing, Wireshark vs tcpdump. Med 15+ pcap-quiz.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2507-wireshark-analyse/WiresharkAnalysePage").then((m) => ({ default: m.WiresharkAnalysePage }))),
};
