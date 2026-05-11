import { OsiTcpipPage } from "@/components/stack/osi-tcpip/OsiTcpipPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-osi-tcpip",
  slug: "osi-tcpip",
  title: "OSI- og TCP/IP-modellen",
  group: "eksamen",
  order: 16,
  status: "ready",
  shortDescription:
    "Fem lag fra applikasjon ned til fysisk, encapsulation, og hvilken protokoll bor hvor.",
  prerequisites: [],
  Component: OsiTcpipPage,
};
