import { TcpSocketsPage } from "@/components/stack/tcp-sockets/TcpSocketsPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tcp-sockets",
  slug: "tcp-sockets",
  title: "TCP & sockets (kort)",
  group: "eksamen",
  order: 2,
  status: "ready",
  shortDescription: "Hvor request-en kommer fra: en socket leverer bytes mellom to maskiner.",
  prerequisites: [],
  Component: TcpSocketsPage,
};
