import { Placeholder } from "@/components/stack/Placeholder";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-tcp-sockets",
  slug: "tcp-sockets",
  title: "TCP & sockets (kort)",
  group: "eksamen",
  order: 2,
  status: "stub",
  shortDescription: "Hvor request-en kommer fra: en socket leverer bytes mellom to maskiner.",
  prerequisites: [],
  Component: () => <Placeholder title="TCP & sockets (kort)" group="eksamen" />,
};
