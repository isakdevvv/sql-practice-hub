import { StatefulFirewallPage } from "@/components/stack/dte2507-stateful-firewall/StatefulFirewallPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-stateful-firewall",
  slug: "dte2507-stateful-firewall",
  title: "Stateful vs stateless brannmur",
  group: "eksamen",
  order: 66,
  status: "ready",
  shortDescription:
    "Bokens pakketabell (Table 8.6/8.8): stateless ACK=1-regelen slipper malformed pakker inn. Stateful brannmur bygger connection table fra 3-veis-handshake. Klassifiser hver pakke først stateless, så stateful.",
  prerequisites: [],
  Component: StatefulFirewallPage,
};
