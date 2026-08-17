// ---------------------------------------------------------------------------
// core/loype.ts — «hvor er jeg i rekka, og hva kommer etterpå?»
//
// Hullet dette fyller: appen har lenge hatt riktig INNHOLD i modulene, men
// ingen REKKEFØLGE. En student som ble ferdig med en side satt igjen uten noe
// framover — skallet rendret brødsmuler og konsept-sjekker, og så var det
// slutt. Den eneste veien videre var å gå ut til /stack og lete, og da må man
// allerede vite hva man leter etter.
//
// En løype er en navngitt sekvens av sider. Registeret her svarer på to
// spørsmål, og det er de to hele navigasjonen trenger:
//
//   loypeFor(slug)   → hvilken løype siden hører til, og hvilket steg den er
//   stegNav(slug)    → forrige og neste side, ferdig med titler
//
// VIKTIG om avhengigheter: denne fila importerer IKKE `src/lib/stack/content`.
// Sidene rendrer navigasjonen selv gjennom StackPageShell, så et oppslag mot
// sideregisteret ville laget sykelen side → skall → løype → sideregister →
// side. Derfor bærer hvert steg sin egen tittel (se `ModulSteg`).
//
// Løypene er med vilje ikke det samme som fase-lista i `stack/curriculum.ts`.
// Den lista er fagets fulle pensum i faglig rekkefølge; en løype er den korte
// sekvensen som hører til én modul med én frist. Et fag kan ha begge deler, og
// en side kan stå i begge.
// ---------------------------------------------------------------------------

import { MODULER_2507, type ModulSteg } from "@/lib/dte2507/canvasModuler";

export interface Loype {
  /** Stabil id, brukt i lenker og lagring. */
  id: string;
  /** Fagkoden slik den vises, f.eks. «DTE-2507». */
  fagKode: string;
  /** Navnet studenten kjenner igjen, f.eks. «Modul 1 — Introduksjon». */
  tittel: string;
  /** Modulsiden løypa hører til. Foten lenker tilbake hit. */
  href: string;
  steg: ModulSteg[];
}

/**
 * Alle løyper i appen.
 *
 * DTE-2507 utledes av Canvas-modulene, slik at rekkefølgen bor sammen med
 * frister og quiz-krav og ikke kan komme i utakt med dem. Andre fag kobles på
 * ved å legge til sin egen kilde her — mønsteret er det samme som
 * `MODUL_KORT_KILDER` i `learn/modulKort.ts` bruker for repetisjonskøen.
 */
export const LOYPER: Loype[] = MODULER_2507.filter((m) => m.steg && m.steg.length > 0).map((m) => ({
  id: `dte2507-modul${m.nr}`,
  fagKode: "DTE-2507",
  tittel: `Modul ${m.nr} — ${m.tittel}`,
  href: `/stack/dte2507-modul${m.nr}`,
  steg: m.steg!,
}));

export interface LoypePosisjon {
  loype: Loype;
  /** 0-basert plass i løypa. */
  indeks: number;
}

/** Løypa en side hører til, hvis noen. Første treff vinner. */
export function loypeFor(slug: string): LoypePosisjon | null {
  for (const loype of LOYPER) {
    const indeks = loype.steg.findIndex((s) => s.slug === slug);
    if (indeks >= 0) return { loype, indeks };
  }
  return null;
}

export interface StegNav {
  loype: Loype;
  indeks: number;
  /** 1-basert, til «Steg 2 av 4». */
  nr: number;
  antall: number;
  forrige: ModulSteg | null;
  neste: ModulSteg | null;
}

/** Alt foten trenger for å tegne forrige/neste. `null` for sider uten løype. */
export function stegNav(slug: string): StegNav | null {
  const pos = loypeFor(slug);
  if (!pos) return null;
  const { loype, indeks } = pos;
  return {
    loype,
    indeks,
    nr: indeks + 1,
    antall: loype.steg.length,
    forrige: indeks > 0 ? loype.steg[indeks - 1] : null,
    neste: indeks < loype.steg.length - 1 ? loype.steg[indeks + 1] : null,
  };
}

/** Løypa med en gitt id. */
export function loypeMedId(id: string): Loype | undefined {
  return LOYPER.find((l) => l.id === id);
}
