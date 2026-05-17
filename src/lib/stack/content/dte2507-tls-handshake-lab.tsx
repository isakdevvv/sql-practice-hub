import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-tls-handshake-lab",
  slug: "dte2507-tls-handshake-lab",
  title: "TLS handshake — steg-for-steg animator + MITM-modus",
  group: "eksamen",
  order: 42,
  status: "ready",
  shortDescription:
    "Interaktiv TLS 1.3-lab: 5-fase handshake-animator med klikkbar bytestream og HKDF-visualisering, sertifikatkjede-validator med 6 bryt-moduser + OCSP-stapling, MITM-simulator (passive, active, downgrade) med forsvarsbrytere, og cipher-suite-sammenligning (anbefalt, svak, knust).",
  prerequisites: [
    { slug: "dte2507-tls-handshake", title: "TLS 1.2 vs 1.3-oversikten" },
    { slug: "kryptografi", title: "Kryptografi-progresjonen (DH, RSA, AES, SHA)" },
  ],
  Component: lazy(() =>
    import("@/components/stack/dte2507-tls-handshake-lab/TlsHandshakeLabPage").then((m) => ({
      default: m.TlsHandshakeLabPage,
    })),
  ),
};
