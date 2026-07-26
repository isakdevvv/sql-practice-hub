// ---------------------------------------------------------------------------
// core/checks/types.ts — formene en konsept-sjekk kan ha.
//
// Dette er stedet innholdet i «forstå før du går videre» bor. Registeret er
// bevisst skilt fra komponenten som viser sjekkene: `core/mastery.ts` bruker
// det til å vite hvor mange sjekker en leksjon *skal* ha, og `core/path.ts`
// til å avgjøre om neste kloss kan låses opp.
//
// En leksjon uten sjekker her låser ingenting. Det gjør populeringen trygg og
// inkrementell: legg til sjekker fag for fag, og porten strammer seg av seg
// selv etter hvert som dekningen vokser.
//
// Pedagogikk (jf. «lær først, prøv selv»): hver sjekk kan ha et `laer`-felt
// som forklarer konseptet i klartekst FØR spørsmålene vises. Spørsmålene
// tester forståelse — hvorfor og når — framfor utregning man kan slå opp.
// ---------------------------------------------------------------------------

export interface SjekkValg {
  tekst: string;
  riktig: boolean;
  /** Hvorfor dette svaret er riktig/galt. Vises etter innsending. */
  begrunnelse?: string;
}

/** Klassisk flervalg. Uten `type` antas dette, så eldre oppføringer virker. */
export interface SjekkFlervalg {
  type?: "flervalg";
  sporsmal: string;
  valg: SjekkValg[];
}

/**
 * Anslå-så-sjekk: brukeren må forplikte seg til et tall FØR fasiten vises.
 *
 * Dette er den mest virkningsfulle oppgavetypen i undervisningsforskningen
 * (peer instruction, Berkeley Data 8): når du har gjettet, er du investert,
 * og et bomskudd avdekker misforståelsen din før forklaringen kommer. Særlig
 * verdifullt i statistikk, der intuisjonen systematisk bommer — base rate,
 * kraften i små utvalg, hvor bredt et konfidensintervall faktisk er.
 */
export interface SjekkTall {
  type: "tall";
  sporsmal: string;
  /** Riktig svar. */
  fasit: number;
  /** Hvor langt unna man kan være og fortsatt regnes som truffet. */
  toleranse: number;
  enhet?: string;
  /** Vises etter at anslaget er låst — hvorfor svaret er som det er. */
  forklaring: string;
  /** Valgfritt hint om hvilket intervall svaret ligger i. */
  min?: number;
  max?: number;
}

export type SjekkSporsmal = SjekkFlervalg | SjekkTall;

export interface KonseptSjekkDef {
  /** Stabil id — matcher seksjonsankeret i leksjonen. */
  id: string;
  /** Kort tittel på konseptet som testes. */
  tittel: string;
  /** Vises før spørsmålene: kjernen i konseptet, i klartekst. */
  laer: string;
  sporsmal: SjekkSporsmal[];
}
