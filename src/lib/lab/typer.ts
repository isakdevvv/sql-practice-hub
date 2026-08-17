// ---------------------------------------------------------------------------
// Felles typer og normalisering for LABENE — sandkasse + måloppgaver.
//
// Formen er beskrevet i PLAN-LABOPPGAVER.md §2. Kort sagt: en lab har en delt
// tilstandsmodell, et grensesnitt inn i den (terminal, REPL, plott …), og
// måloppgaver som sjekker VERDIEN studenten fant — ikke kommandoen som ble
// skrevet, ikke koden som ble limt inn.
//
// Denne fila ble løftet ut av `src/lib/dte2507/nettverkOppgaver.ts` da lab
// nummer to kom til. Den holdt seg med vilje modul-lokal fram til da: én bruker
// er ikke et mønster, og en abstraksjon bygget på ett eksempel pleier å passe
// dårlig på det andre.
//
// Regelen normaliseringen bygger på: **romslig med skrivemåte, streng med
// verdi.** En MAC-adresse er den samme med kolon eller bindestrek, og et tall
// er det samme med «stk» bak. Men antall iterasjoner er antall iterasjoner.
// ---------------------------------------------------------------------------

export interface Oppgave {
  id: string;
  /** Kort tittel. Skal navngi DELMÅLET, ikke verktøyet — se §6.6 i planen. */
  tittel: string;
  /** Selve oppdraget, formulert som noe du skal finne ut. */
  oppdrag: string;
  /** Verktøyet eller kommandoen oppgaven trener. Vises som merkelapp. */
  verktoy: string;
  /** Hint, vist først når du ber om det. */
  hint: string;
  /**
   * Hvorfor svaret er som det er. Vises etter riktig svar — det er der
   * forståelsen sitter, ikke i selve tallet.
   */
  forklaring: string;
  /** Én fasit, brukt av selvsjekkene for å bevise at oppgaven er løsbar. */
  fasit: string;
  /** Sjekker et svar. */
  sjekk: (svar: string) => Vurdering;
  /**
   * Kode, utdata eller annet oppgaven gjelder. Vises i en <pre> under
   * oppdraget. Uten dette må studenten lime sammen oppgaveteksten selv.
   */
  kode?: string;
  /**
   * Sant for oppgaver som viser fasiten i oppdraget. Brukes på den FØRSTE
   * oppgaven i en lab: et ferdig eksempel før stigen trekkes (§6.7). Kortet
   * merkes «vist» i grensesnittet, slik at det ikke ser ut som en glipp.
   */
  vist?: boolean;
}

export interface Vurdering {
  riktig: boolean;
  /**
   * Hva som var galt, når vi kan si det presist. «Nesten — det er gatewayen,
   * ikke maskinen din» lærer mer enn «feil», fordi den navngir forvekslingen.
   */
  tilbakemelding?: string;
}

/* ------------------------------------------------------------ normalisering */

export const rens = (s: string) => s.trim().toLowerCase();

/** MAC-adresse: kolon og bindestrek er samme adresse. */
export const macRens = (s: string) => rens(s).replace(/[-.]/g, ":").replace(/\s/g, "");

/** Heltall ut av en streng som kan inneholde «hopp», «ganger», «stk» og lignende. */
export function somTall(s: string): number | null {
  const m = rens(s).match(/-?\d+/);
  return m ? Number(m[0]) : null;
}

/**
 * Desimaltall ut av en streng, med komma godtatt som desimalskille.
 *
 * Egen funksjon, ikke en utvidelse av `somTall`: den brukes på svar som
 * «10.0.5.1», og et mønster som slipper gjennom punktum ville lest den som
 * 10.0 uten å klage. Tellinger skal fortsatt være heltall.
 */
export function somDesimaltall(s: string): number | null {
  const m = rens(s)
    .replace(",", ".")
    .match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

/** Enkel likhet etter rens, med en valgfri liste over vanlige feilsvar. */
export function eksakt(
  fasit: string,
  normaliser: (s: string) => string = rens,
  feller: { verdi: string; si: string }[] = [],
): (svar: string) => Vurdering {
  return (svar) => {
    const s = normaliser(svar);
    if (s === normaliser(fasit)) return { riktig: true };
    const felle = feller.find((f) => normaliser(f.verdi) === s);
    if (felle) return { riktig: false, tilbakemelding: felle.si };
    return { riktig: false };
  };
}

/** Heltallssvar, med navngitte feller for de vanlige bommene. */
export function tall(
  fasit: number,
  feller: { verdi: number; si: string }[] = [],
): (s: string) => Vurdering {
  return (svar) => {
    const n = somTall(svar);
    if (n === null) return { riktig: false, tilbakemelding: "Svar med et tall." };
    if (n === fasit) return { riktig: true };
    const felle = feller.find((f) => f.verdi === n);
    return { riktig: false, tilbakemelding: felle?.si };
  };
}

/**
 * Tallsvar innenfor en toleranse. Trengs så snart svaret er et målt tall
 * (nøyaktighet, p-verdi, gjennomsnitt) i stedet for en telling — se §4.3 og
 * §4.4 i planen. Krev aldri eksakt likhet på noe som er regnet ut med flyttall.
 */
export function innenfor(
  fasit: number,
  toleranse: number,
  feller: { verdi: number; toleranse?: number; si: string }[] = [],
): (s: string) => Vurdering {
  return (svar) => {
    const n = somDesimaltall(svar);
    if (n === null) return { riktig: false, tilbakemelding: "Svar med et tall." };
    if (Math.abs(n - fasit) <= toleranse) return { riktig: true };
    const felle = feller.find((f) => Math.abs(n - f.verdi) <= (f.toleranse ?? toleranse));
    return { riktig: false, tilbakemelding: felle?.si };
  };
}
