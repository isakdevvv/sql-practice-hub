import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2505-pakkekilder",
  slug: "dte2505-pakkekilder",
  title: "Modul 1b — Programvare fra andre kilder",
  group: "eksamen",
  order: 47,
  status: "ready",
  shortDescription:
    "DTE-2505 Modul 1b, Canvas-punkt 1.3 (pensum, ingen oblig i år): hva et pakkearkiv er, sources.list og sources.list.d/, PPA (Personal Package Archive) og add-apt-repository, løse .deb-filer med dpkg mot apt, snap og flatpak med sandkasse, GPG-signeringsnøkler og hvorfor et arkiv uten nøkkel avvises, og risikoen ved tredjepartskilder. Live tilstandspanel med kilder/nøkler/indeks/installert, sju anslå-oppgaver, guidet gjennomgang i 14 steg, seks flerstegs måloppgaver med tilstandssjekk, fem feilsøkingsoppgaver og recall-kort.",
  prerequisites: [
    { slug: "linux-bruk", title: "Linux-bruk (apt update, install, remove)" },
  ],
  Component: lazy(() =>
    import("@/components/stack/dte2505-modul1b/Modul1bPage").then((m) => ({
      default: m.Modul1bPage,
    })),
  ),
};
