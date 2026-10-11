// Innholdstaksonomi for skjerm-baserte kurs.
//
//   Fag (subject)      DTE-2505 Operativsystemer
//     └ Emne (topic)     "Minnehåndtering"
//         └ Undertema      "Sidetabeller og TLB"   ← én økt, 5-12 skjermer
//             └ Skjerm       én ting om gangen: et konsept, en simulator,
//                            et sjekkspørsmål. Aldri lang scroll.
//
// Poenget med nivåene: Emne er det studenten planlegger etter ("jeg skal ta
// minnehåndtering i dag"), Undertema er det hen faktisk fullfører i én sitting
// (10-20 min), og Skjerm er det hen ser på telefonen akkurat nå. Fremdrift
// måles på skjerm-nivå, mestring på undertema-nivå.
//
// Nye fag legges til ved å registrere et `Fag`-objekt i `src/lib/kurs/registry.ts`.
// Ingen andre filer trenger å endres — ruter, navigasjon, fremdrift og søk
// leser alt herfra.

import type { ComponentType } from "react";

/** Hva slags skjerm dette er. Styrer chrome: framdriftsprikk-farge, om
 *  "Neste" er låst til et svar, og hvordan skjermen telles i fremdrift. */
export type SkjermType =
  /** Setter scenen: hva skal vi finne ut, og hvorfor bryr vi oss. */
  | "intro"
  /** Én idé forklart. Tekst + figur, aldri mer enn én skjermhøyde. */
  | "konsept"
  /** Interaktiv simulering/visualisering studenten fikler med. */
  | "visual"
  /** Studenten gjetter før fasit vises — anslag, predict-and-trace. */
  | "anslag"
  /** Sjekkspørsmål. Låser "Neste" til et forsøk er gjort. */
  | "sjekk"
  /** Kode/kommando studenten kjører eller leser. */
  | "kode"
  /** Oppsummering + hva som går videre i repetisjonskøen. */
  | "oppsummering";

export interface Skjerm {
  /** Unik innen undertemaet. Brukes i URL-en: ?s=<id> og til fremdrift. */
  id: string;
  type: SkjermType;
  /** Kort tittel — vises i skjermens topplinje og i innholdsfortegnelsen. */
  tittel: string;
  /** Selve innholdet. Én skjerm = én komponent, så tunge simulatorer kan
   *  lazy-loades uten å dra med seg resten av undertemaet. */
  Component: ComponentType;
  /** For `sjekk`/`anslag`: "Neste" er låst til studenten har svart.
   *  Komponenten kaller `useSkjerm().besvart()` når svaret er levert. */
  krevesSvar?: boolean;
  /** Estimert tid i sekunder. Summeres til undertema-estimat. */
  sekunder?: number;
}

export interface Undertema {
  slug: string;
  tittel: string;
  /** Én setning: hva sitter du igjen med etterpå. Vises på kortet. */
  utbytte: string;
  skjermer: readonly Skjerm[];
  /** Undertema-slugs som må sitte først. Brukes til "bygger på"-callout
   *  og til å foreslå rekkefølge — ikke til å låse innhold. */
  byggerPa?: readonly string[];
  /** Flashcard-/oppgave-id-er som legges i repetisjonskøen når undertemaet
   *  fullføres. Recall kommer ETTER forståelse, aldri før. */
  repetisjon?: readonly string[];
}

export interface Emne {
  slug: string;
  tittel: string;
  /** Spørsmålet emnet svarer på. Vises som undertittel i emnelisten. */
  sporsmal: string;
  undertemaer: readonly Undertema[];
  /** Pensumreferanse (bok/kapittel/forelesning) for sporbarhet mot faget. */
  pensum?: string;
}

export interface Fag {
  /** URL-slug: /fag/<slug>. Matcher slug i `src/lib/subjects/catalog.ts`
   *  når faget også finnes der, så fag-hub og skjerm-kurs er samme fag. */
  slug: string;
  /** Emnekode, f.eks. "DTE-2505". */
  kode: string;
  navn: string;
  emner: readonly Emne[];
}

/* ---------- utledede hjelpere ---------- */

export function alleSkjermer(u: Undertema): readonly Skjerm[] {
  return u.skjermer;
}

export function undertemaerIFag(fag: Fag): Undertema[] {
  return fag.emner.flatMap((e) => [...e.undertemaer]);
}

export function finnUndertema(fag: Fag, slug: string): { emne: Emne; undertema: Undertema } | null {
  for (const emne of fag.emner) {
    const undertema = emne.undertemaer.find((u) => u.slug === slug);
    if (undertema) return { emne, undertema };
  }
  return null;
}

/** Estimert tid i minutter, avrundet opp. Default 45 s per skjerm når
 *  innholdet ikke har satt `sekunder`. */
export function minutter(u: Undertema): number {
  const sek = u.skjermer.reduce((sum, s) => sum + (s.sekunder ?? 45), 0);
  return Math.max(1, Math.round(sek / 60));
}
