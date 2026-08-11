import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-diverse",
  slug: "dte2505-diverse",
  title: "Modul 6 — Diverse: vi/vim, X og SSH",
  group: "eksamen",
  order: 49,
  status: "ready",
  shortDescription:
    "DTE-2505 Modul 6 (ingen oblig): vi/vim med interaktiv modussimulator (normal, insert, visual, kommandolinje — bevegelse, redigering, :w/:q/:wq/:q!), X Window System med klient–tjener-modellen, DISPLAY, X-videresending og Wayland, og SSH (Secure Shell) med nøkkelpar, ssh-keygen, ssh-copy-id, ssh-agent, ~/.ssh/config, scp og sftp. Ni anslå-oppgaver, guidede gjennomganger, ti måloppgaver med tilstandssjekk, fem feilsøkingsoppgaver og recall-kort.",
  prerequisites: [
    { slug: "brukere-rettigheter", title: "Brukere og rettigheter (rwx og oktal notasjon)" },
  ],
  Component: lazy(() =>
    import("@/components/stack/dte2505-modul6/Modul6Page").then((m) => ({
      default: m.Modul6Page,
    })),
  ),
};
