import { SocketProgrammeringPage } from "@/components/stack/dte2507-socket-programmering/SocketProgrammeringPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-socket-programmering",
  slug: "dte2507-socket-programmering",
  title: "Socket-programmering (TCP/UDP/TLS)",
  group: "eksamen",
  order: 23,
  status: "ready",
  shortDescription:
    "Server- og klient-skjeletter for TCP og UDP. Concurrent server via threading og asyncio. SSL/TLS-wrapping. Vanlige feil: TIME_WAIT, ConnectionResetError. 15+ kjorbare oppgaver via socket-shim.",
  prerequisites: [],
  Component: SocketProgrammeringPage,
};
