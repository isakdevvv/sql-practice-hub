// ---------------------------------------------------------------------------
// ÉN repetisjonskø for modulenes recall-kort — PLAN-HOST26-MODULER.md §3.4.
//
// Problemet: hver nye modul har fått sin egen lille kortsamling med sitt eget
// localStorage-navnerom. Det gir ryddig kode og elendig læring — kortene fra
// august ligger i en kø ingen åpner igjen, og 14. desember er de borte. FSRS
// virker bare hvis alt som skal huskes ligger i den SAMME køen.
//
// Løsningen er et register. Hver modul melder inn kortene sine med fag, modul
// og en FSRS-store. Køen henter forfalte kort fra alle registrerte kilder,
// blander dem og merker hvert kort med hvor det kommer fra.
//
// VIKTIG PRINSIPP: kilden beholder sin EGEN FSRS-store. Kortene kan derfor
// øves både i modulen sin og i den samlede køen uten at framdriften spriker —
// det er samme nøkkel og samme tilstand som leses og skrives begge steder.
//
// Ren TypeScript uten React, så køen kan etterprøves fra kommandolinja:
//     bun run src/lib/learn/modulKortSelvsjekk.ts
// ---------------------------------------------------------------------------

import { createFsrsStore, type CardState, type FsrsStore } from "./fsrs";
import { RECALL_CARDS as HJELPESYSTEMER_KORT, hjelpesystemerFsrs } from "../dte2505/hjelpesystemerKort";
import { FASE1_OPPGAVER } from "../dte2602/oppgaverFase1";
import { FASE2_OPPGAVER } from "../dte2602/oppgaverFase2";

/** Ett kort, uavhengig av hvilken modul det kom fra. Ren tekst, ingen JSX. */
export interface ModulKort {
  id: string;
  forside: string;
  bakside: string;
  /** Én linje om hvorfor akkurat dette må sitte i hodet. Valgfri. */
  hvorfor?: string;
}

export interface ModulKortKilde {
  /** Kort, stabil id. Brukes i modul-id-en i praksisregisteret. */
  id: string;
  /** Fagkoden slik den skrives i grensesnittet, f.eks. «DTE-2505». */
  fagKode: string;
  /** Slug fra src/lib/subjects/catalog.ts, brukt til fag-filteret i køen. */
  fagSlug: string;
  /** Modulnavnet studenten kjenner igjen, f.eks. «Modul 2 — Hjelpesystemer». */
  modul: string;
  /** Ruten til modulens egen side, så kortet kan spores tilbake til stoffet. */
  href: string;
  /**
   * Modulens EGEN FSRS-store. Deles med modulsiden hvis den har en, slik at
   * repetisjon begge steder oppdaterer samme tilstand.
   */
  fsrs: FsrsStore;
  kort: ModulKort[];
}

// ---------------------------------------------------------------------------
// Kildene
// ---------------------------------------------------------------------------

/**
 * DTE-2602 hadde ingen FSRS-planlegging på recall-kortene sine i utgangspunktet
 * — modulsiden viser dem som en enkel vis/skjul-liste. Køen gir dem planlegging
 * her, i sitt eget navnerom. Kobler modulsiden seg på senere, bruker den denne
 * storen og arver framdriften.
 */
export const dte2602KortFsrs = createFsrsStore("dte2602-recall-fsrs-v1");

export const MODUL_KORT_KILDER: ModulKortKilde[] = [
  {
    id: "dte2505-hjelpesystemer",
    fagKode: "DTE-2505",
    fagSlug: "dte-2505",
    modul: "Modul 2 — Hjelpesystemer og dokumentasjon",
    href: "/stack/dte2505-hjelpesystemer",
    // Samme store som modulens egen kortvisning bruker. Ikke bytt den ut:
    // gjør du det, starter framdriften på null ett av de to stedene.
    fsrs: hjelpesystemerFsrs,
    kort: HJELPESYSTEMER_KORT.map((k) => ({ id: k.id, forside: k.front, bakside: k.back })),
  },
  {
    id: "dte2602-fase1",
    fagKode: "DTE-2602",
    fagSlug: "dte-2602",
    modul: "Modul 1 — Hva maskinlæring er",
    href: "/stack/dte2602-modul1",
    fsrs: dte2602KortFsrs,
    kort: FASE1_OPPGAVER.recall.map((k) => ({
      id: k.id,
      forside: k.forside,
      bakside: k.bakside,
      hvorfor: k.hvorfor,
    })),
  },
  {
    id: "dte2602-fase2",
    fagKode: "DTE-2602",
    fagSlug: "dte-2602",
    modul: "Modul 2 — Data og features",
    href: "/stack/dte2602-modul2",
    fsrs: dte2602KortFsrs,
    kort: FASE2_OPPGAVER.recall.map((k) => ({
      id: k.id,
      forside: k.forside,
      bakside: k.bakside,
      hvorfor: k.hvorfor,
    })),
  },
  // IKKE KOBLET PÅ ENNÅ — TEK-1501 modul 1 og 2.
  //
  // Kortene finnes (`const RECALL` i Modul1DataPage.tsx og
  // Modul2SannsynlighetPage.tsx), men de kan ikke leses herfra av to grunner:
  // listene er modul-lokale og ikke eksportert, og svarene er JSX (ReactNode),
  // ikke tekst. Påkoblingen er én oppføring i denne lista den dagen sidene
  // eksporterer listene sine med et tekstsvar ved siden av JSX-svaret. Det må
  // gjøres av den som eier TEK-1501-filene — se .claude/agents/.
];

// ---------------------------------------------------------------------------
// Oppslag
// ---------------------------------------------------------------------------

/** Ett kort pluss opplysningen om hvor det kommer fra. */
export interface KoKort extends ModulKort {
  kilde: ModulKortKilde;
}

export function alleModulKort(): KoKort[] {
  return MODUL_KORT_KILDER.flatMap((kilde) => kilde.kort.map((k) => ({ ...k, kilde })));
}

export function finnModulKort(id: string): KoKort | undefined {
  for (const kilde of MODUL_KORT_KILDER) {
    const k = kilde.kort.find((x) => x.id === id);
    if (k) return { ...k, kilde };
  }
  return undefined;
}

/** Fagene som faktisk har kort registrert, i den rekkefølgen de er meldt inn. */
export function fagMedKort(): { fagKode: string; fagSlug: string; antall: number }[] {
  const ut: { fagKode: string; fagSlug: string; antall: number }[] = [];
  for (const kilde of MODUL_KORT_KILDER) {
    const funnet = ut.find((f) => f.fagSlug === kilde.fagSlug);
    if (funnet) funnet.antall += kilde.kort.length;
    else ut.push({ fagKode: kilde.fagKode, fagSlug: kilde.fagSlug, antall: kilde.kort.length });
  }
  return ut;
}

// ---------------------------------------------------------------------------
// Køen
// ---------------------------------------------------------------------------

export interface KoOppfoering {
  kort: KoKort;
  tilstand: CardState;
  /** Sant for kort som aldri er repetert før. */
  erNytt: boolean;
}

/** Kort som er forfalt nå eller tidligere, eldste først. */
export function forfalteKort(nå: number = Date.now(), fagSlug?: string): KoOppfoering[] {
  const ut: KoOppfoering[] = [];
  for (const kilde of MODUL_KORT_KILDER) {
    if (fagSlug && kilde.fagSlug !== fagSlug) continue;
    const tilstander = kilde.fsrs.getAllStates();
    for (const k of kilde.kort) {
      const tilstand = tilstander[k.id];
      if (!tilstand || tilstand.state === "new" || tilstand.due > nå) continue;
      ut.push({ kort: { ...k, kilde }, tilstand, erNytt: false });
    }
  }
  ut.sort((a, b) => a.tilstand.due - b.tilstand.due);
  return ut;
}

/** Kort som aldri er repetert. Rekkefølgen følger registreringsrekkefølgen. */
export function nyeKort(fagSlug?: string): KoOppfoering[] {
  const ut: KoOppfoering[] = [];
  for (const kilde of MODUL_KORT_KILDER) {
    if (fagSlug && kilde.fagSlug !== fagSlug) continue;
    const tilstander = kilde.fsrs.getAllStates();
    for (const k of kilde.kort) {
      const tilstand = tilstander[k.id];
      if (tilstand && tilstand.state !== "new") continue;
      ut.push({
        kort: { ...k, kilde },
        tilstand: tilstand ?? kilde.fsrs.getCardState(k.id),
        erNytt: true,
      });
    }
  }
  return ut;
}

/**
 * Selve studiekøen: alt som er forfalt, pluss et tak på nye kort, blandet
 * sammen. Blandingen er poenget — står de nye sist, blir de aldri tatt, og
 * står de først blir økten en pugge-økt i stedet for en repetisjonsøkt.
 *
 * `stokk` kan settes til en deterministisk funksjon i tester.
 */
export function byggKortKo(
  valg: {
    nå?: number;
    fagSlug?: string;
    nyePerOkt?: number;
    stokk?: (n: number) => number;
  } = {},
): KoOppfoering[] {
  const { nå = Date.now(), fagSlug, nyePerOkt = 10, stokk } = valg;
  const forfalt = forfalteKort(nå, fagSlug);
  const nye = nyeKort(fagSlug).slice(0, nyePerOkt);
  const ko = [...forfalt, ...nye];
  const tilfeldig = stokk ?? ((n: number) => Math.floor(Math.random() * n));
  for (let i = ko.length - 1; i > 0; i--) {
    const j = tilfeldig(i + 1);
    [ko[i], ko[j]] = [ko[j], ko[i]];
  }
  return ko;
}

export interface KortStatistikk {
  totalt: number;
  forfalt: number;
  nye: number;
  /** Kort som er lært og ikke forfalt ennå. */
  laert: number;
}

export function kortStatistikk(nå: number = Date.now(), fagSlug?: string): KortStatistikk {
  let totalt = 0;
  let forfalt = 0;
  let nye = 0;
  let laert = 0;
  for (const kilde of MODUL_KORT_KILDER) {
    if (fagSlug && kilde.fagSlug !== fagSlug) continue;
    const tilstander = kilde.fsrs.getAllStates();
    for (const k of kilde.kort) {
      totalt++;
      const t = tilstander[k.id];
      if (!t || t.state === "new") nye++;
      else if (t.due <= nå) forfalt++;
      else laert++;
    }
  }
  return { totalt, forfalt, nye, laert };
}

/** Per kilde: hvor mye ligger og venter? Driver oversikten øverst i køen. */
export function statistikkPerKilde(nå: number = Date.now()): {
  kilde: ModulKortKilde;
  statistikk: KortStatistikk;
}[] {
  return MODUL_KORT_KILDER.map((kilde) => {
    const tilstander = kilde.fsrs.getAllStates();
    let forfalt = 0;
    let nye = 0;
    let laert = 0;
    for (const k of kilde.kort) {
      const t = tilstander[k.id];
      if (!t || t.state === "new") nye++;
      else if (t.due <= nå) forfalt++;
      else laert++;
    }
    return { kilde, statistikk: { totalt: kilde.kort.length, forfalt, nye, laert } };
  });
}
