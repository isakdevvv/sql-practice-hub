import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-http-anatomi",
  slug: "http-anatomi",
  title: "HTTP-anatomi",
  group: "eksamen",
  order: 7,
  status: "ready",
  shortDescription: "Hva er en HTTP-melding? Headers, body, statuskoder, cookies.",
  prerequisites: [{ slug: "bytes-encoding", title: "Bytes & encoding" }],
  Component: lazy(() => import("@/components/stack/http-anatomi/HttpAnatomiPage").then((m) => ({ default: m.HttpAnatomiPage }))),
};
