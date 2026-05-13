import { VirtueltMinnePage } from "@/components/stack/dte2505-virtuelt-minne/VirtueltMinnePage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-virtuelt-minne",
  slug: "dte2505-virtuelt-minne",
  title: "Virtuelt minne — paging, TLB, page faults",
  group: "eksamen",
  order: 39,
  status: "ready",
  shortDescription:
    "OSTEP kap. 15–22. VPN, PFN, offset, page-tabell, TLB, page faults, demand paging. Replacement: FIFO, LRU, Clock, optimal. Interaktiv adresseoversetter.",
  prerequisites: [],
  Component: VirtueltMinnePage,
};
