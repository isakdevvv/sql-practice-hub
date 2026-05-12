import { BrannmurVlanPage } from "@/components/stack/dte2507-brannmur-vlan/BrannmurVlanPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-brannmur-vlan",
  slug: "dte2507-brannmur-vlan",
  title: "Brannmur og VLAN",
  group: "eksamen",
  order: 24,
  status: "ready",
  shortDescription:
    "Stateless vs stateful, iptables med stateful conntrack, DMZ/screened subnet, VLAN-segmentering, 802.1Q tagged vs untagged, defense in depth + least privilege.",
  prerequisites: [],
  Component: BrannmurVlanPage,
};
