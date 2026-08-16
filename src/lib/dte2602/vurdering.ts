/**
 * DTE-2602 — hva som faktisk kreves for å bestå.
 *
 * Fra emnebeskrivelsen på uit.no (lest 2026-08-16). Dette er reglene rundt
 * faget, ikke pensumet: hvor mange obliger som må være godkjent, hva mappa
 * består av, og hvordan delene vektes. `faser.ts` sier hva du skal *kunne*;
 * denne fila sier hva du må *levere*.
 *
 * Grunnen til at den er skilt ut: `EKSAMEN_DTE2602` i `faser.ts` har bare de
 * to datoene. Arbeidskravet — seks obliger der minst fire må være godkjent —
 * er det harde sjekkpunktet før eksamen i det hele tatt er en mulighet, og det
 * sto ingen steder i appen.
 */

export interface VurderingsDel {
  /** Kort navn, f.eks. «Hjemmeeksamen». */
  navn: string;
  /** ISO-dato. */
  dato: string;
  /** Klokkeslett for utlevering, der det finnes. */
  utlevering?: string;
  /** Klokkeslett for innlevering. */
  innlevering: string;
  karakterskala: string;
  /** Én setning om hva delen består av. */
  hva: string;
}

export const VURDERING_DTE2602 = {
  /**
   * Arbeidskravet. Må være godkjent før du kan framstille deg til eksamen —
   * altså er dette den første reelle fristen i faget, ikke 09.12.
   */
  arbeidskrav: {
    navn: "Programmeringsøvinger",
    antall: 6,
    /** Så mange må være godkjent. De to siste er slakk, ikke frivillige. */
    kravGodkjent: 4,
    skala: "Godkjent / ikke godkjent",
    sprak: "Kan leveres på norsk eller engelsk.",
    /**
     * Den harde regelen fra emnebeskrivelsen. Verdt å lese to ganger: det
     * finnes ingen utsettelse og ingen delvis uttelling for en sen levering.
     */
    forsinkelse:
      "Oppgaver levert etter innleveringsfristen blir ikke vurdert og regnes som ikke godkjent.",
    /**
     * Fristene står ikke i emnebeskrivelsen — de kommer i Canvas underveis.
     * Feltet er med for at det skal være tydelig at de mangler, ikke for at
     * noen skal gjette dem.
     */
    fristerKjent: false,
  },

  deler: [
    {
      navn: "Hjemmeeksamen",
      dato: "2026-12-09",
      utlevering: "09:00",
      innlevering: "12:00",
      karakterskala: "A–E, stryk F",
      hva: "Tre timer fra utlevering til innlevering.",
    },
    {
      navn: "Mappevurdering",
      dato: "2026-12-11",
      innlevering: "14:00",
      karakterskala: "A–E, stryk F",
      hva: "To oppgaver som hver består av en rapport og et programmeringsarbeid. Kan leveres på norsk eller engelsk.",
    },
  ] satisfies VurderingsDel[],

  /** Hvordan de to delene settes sammen til én karakter. */
  vekting:
    "Karakteren fastsettes ved en skjønnsmessig helhetsvurdering der deleksamenene vektes omtrent likt.",

  /**
   * Konsekvensen av at mappa ikke kan tas om igjen: en svak mappe kan du ikke
   * reparere i desember, mens en strøket hjemmeeksamen kan tas på nytt.
   */
  kontinuasjon:
    "Det tilbys kontinuasjonseksamen for hjemmeeksamen dersom mappa er bestått. Det tilbys ikke kontinuasjonseksamen for mappa.",
} as const;

/**
 * Hvor mange obliger du har råd til å stryke på eller la være å levere.
 * Skrevet som en funksjon fordi tallet er lett å regne feil i hodet når man
 * står i det: 6 − 4 = 2, ikke 3.
 */
export function slakkIObliger(): number {
  return VURDERING_DTE2602.arbeidskrav.antall - VURDERING_DTE2602.arbeidskrav.kravGodkjent;
}
