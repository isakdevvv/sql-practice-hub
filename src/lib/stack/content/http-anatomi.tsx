import { Placeholder } from "@/components/stack/Placeholder";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-http-anatomi",
  slug: "http-anatomi",
  title: "HTTP-anatomi",
  group: "eksamen",
  order: 7,
  status: "stub",
  shortDescription: "Hva er en HTTP-melding? Headers, body, statuskoder, cookies.",
  prerequisites: [],
  Component: () => <Placeholder title="HTTP-anatomi" group="eksamen" />,
};
