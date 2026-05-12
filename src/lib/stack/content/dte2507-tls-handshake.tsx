import { TlsHandshakePage } from "@/components/stack/dte2507-tls-handshake/TlsHandshakePage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2507-tls-handshake",
  slug: "dte2507-tls-handshake",
  title: "TLS-handshake — fra https:// til kryptert kanal",
  group: "eksamen",
  order: 41,
  status: "ready",
  shortDescription:
    "TLS 1.2 og 1.3 handshake klikkbar — ClientHello, sertifikat, nøkkelutveksling, Finished. Highlighter symmetrisk vs asymmetrisk i hvert steg.",
  prerequisites: [],
  Component: TlsHandshakePage,
};
