// Oppgave-arkitekturen for DTE-2602, jf. §3 i PLAN-HOST26-MODULER.md.
//
// Fem typer, én jobb hver. Rekkefølgen er ikke tilfeldig:
//
//   1. ANSLÅ-SÅ-SJEKK   — lager hullet hjernen vil fylle. Kommer FØR forklaringen.
//   2. GUIDET SIMULERING — bygger mental modell. Ingen prestasjonskrav.
//   3. MÅLOPPGAVE        — sjekker at du kan oppnå en TILSTAND, ikke gjenkalle en streng.
//   4. FEILSØKING        — tvinger fram helhetsforståelse. Feilen kan bo hvor som helst.
//   5. RECALL-KORT       — kun det som faktisk må ligge i hodet.
//
// Vurderingen i DTE-2602 er hjemmeeksamen (09.12.2026) + mappe (11.12.2026).
// Du har notatene dine tilgjengelig. Da skiller ikke gjenkalling — det som skiller
// er om du kan sette opp et problem og finne feilen i en pipeline. Derfor er det
// mange av type 3 og 4, og med vilje få av type 5.

/* ------------------------------------------------------------------ *
 * Type 1 — Anslå-så-sjekk
 * ------------------------------------------------------------------ */

export type AnslagAlternativ = {
  id: string;
  tekst: string;
  /** Tilbakemelding skreddersydd til nettopp dette anslaget. */
  respons: string;
};

export type AnslagOppgave = {
  id: string;
  /** Situasjonen. Skal kunne leses på under 20 sekunder. */
  sporsmal: string;
  /** Valgfri tabell/kodesnutt som anslaget hviler på. */
  kontekst?: string;
  alternativer: AnslagAlternativ[];
  /** id-en til alternativet som er riktig. */
  fasit: string;
  /** Selve poenget — vises etter at anslaget er avgitt, uansett hva som ble valgt. */
  hvorfor: string;
};

/* ------------------------------------------------------------------ *
 * Type 3 — Måloppgave med tilstandssjekk
 * ------------------------------------------------------------------ */

/**
 * Nivåene er tre, ikke to. Det er hele poenget med tilstandssjekk framfor
 * fasit-streng: i maskinlæring finnes det ofte flere forsvarlige valg, og
 * tilbakemeldingen skal forklare avveiningen i stedet for å si «feil».
 */
export type MalNiva = "riktig" | "forsvarlig" | "feil";

export type MalValg = {
  id: string;
  sporsmal: string;
  alternativer: { id: string; tekst: string }[];
};

export type MalVurdering = {
  niva: MalNiva;
  tittel: string;
  forklaring: string;
};

export type Maloppgave = {
  id: string;
  tittel: string;
  situasjon: string;
  kontekst?: string;
  /** Måltilstanden, formulert som en tilstand — ikke som en kommando å skrive. */
  maal: string;
  valg: MalValg[];
  /** Sjekker den samlede tilstanden av alle valgene, ikke ett og ett. */
  vurder: (valgt: Record<string, string>) => MalVurdering;
};

/* ------------------------------------------------------------------ *
 * Type 4 — Feilsøkingsoppgave
 * ------------------------------------------------------------------ */

export type FeilsokingLinje = {
  nr: number;
  tekst: string;
};

export type FeilsokingFiks = {
  id: string;
  tekst: string;
  riktig: boolean;
  respons: string;
};

export type Feilsoking = {
  id: string;
  tittel: string;
  /** Hva som ser galt ut utenfra — det studenten faktisk ville lagt merke til. */
  symptom: string;
  /** "kode" rendres med fast bredde og linjenummer; "steg" som en nummerert plan. */
  format: "kode" | "steg";
  linjer: FeilsokingLinje[];
  /** Linjenummeret der feilen faktisk bor. */
  feilLinje: number;
  /** Tilbakemelding per linje — også for de riktige, slik at feil gjetning lærer noe. */
  linjeRespons: Record<number, string>;
  /** Steg 2: når linja er funnet, hva er riktig rettelse? */
  fikser: FeilsokingFiks[];
  /** Den generaliserbare lærdommen. Vises til slutt. */
  laerdom: string;
};

/* ------------------------------------------------------------------ *
 * Type 5 — Recall-kort
 * ------------------------------------------------------------------ */

export type RecallKort = {
  id: string;
  forside: string;
  bakside: string;
  /** Hvorfor akkurat dette må sitte i hodet og ikke kan slås opp. */
  hvorfor: string;
};

/* ------------------------------------------------------------------ *
 * Samlet oppgavesett for én fase
 * ------------------------------------------------------------------ */

export type FaseOppgaver = {
  anslag: AnslagOppgave[];
  maal: Maloppgave[];
  feilsoking: Feilsoking[];
  recall: RecallKort[];
};
