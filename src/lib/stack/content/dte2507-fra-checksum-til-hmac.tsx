import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-fra-checksum-til-hmac",
  slug: "dte2507-fra-checksum-til-hmac",
  title: "Fra checksum til HMAC",
  group: "eksamen",
  order: 64,
  status: "ready",
  shortDescription:
    "Hvorfor klassisk checksum ikke gir integritet (bokens IOU100.99BOB → IOU900.19BOB med samme sum). Progresjon: cryptographic hash → naiv H(m) → MAC = H(m‖s) → HMAC. Interaktiv forfalsknings-lab.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/dte2507-fra-checksum-til-hmac/FraChecksumTilHmacPage").then((m) => ({ default: m.FraChecksumTilHmacPage }))),
};
