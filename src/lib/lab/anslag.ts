// ---------------------------------------------------------------------------
// Oppgavetype 1 — ANSLÅ-SÅ-SJEKK, felles for alle labene.
//
// PLAN-LABOPPGAVER.md §6.1: et anslag skrevet ned FØR verktøyet kjøres lager en
// forventning som enten bekreftes eller brytes. Uten anslag går observasjonen
// inn som «jaha», og den gamle modellen står urørt. Med anslag blir bruddet
// synlig, og det er bruddet som retter en misoppfatning.
//
// Derfor to regler, håndhevet her og ikke overlatt til hver lab:
//
//   1. Anslaget LÅSES når du har svart. Du skal ikke kunne stille om historien
//      i ettertid — hele verdien ligger i at det gale anslaget står igjen.
//   2. Fasiten vises IKKE med en gang. Den vises først når måloppgaven anslaget
//      henger på er løst. Ellers blir panelet en quiz som røper svarene under.
//
// Løftet ut av `src/lib/dte2507/nettverkAnslag.ts` da lab nummer to kom.
// ---------------------------------------------------------------------------

export interface Anslag {
  id: string;
  /** Spørsmålet, stilt før sandkassen er åpnet. */
  sporsmal: string;
  /** Svaralternativene, i vist rekkefølge. */
  valg: string[];
  /** Indeks i `valg` som er riktig. */
  riktig: number;
  /**
   * Måloppgaven anslaget henger på. Fasiten vises først når den er løst — da
   * har studenten sett svaret med egne øyne.
   */
  knyttetTil: string;
  /** Vises sammen med fasiten. Skal navngi forvekslingen, ikke gjenta svaret. */
  fasit: string;
}

/** Lagrede anslag: anslag-id → valgt indeks. */
export type LagredeAnslag = Record<string, number>;

export interface AnslagLager {
  les: () => LagredeAnslag;
  /** Lagrer et anslag. Er det allerede satt, skjer ingenting — låsen er poenget. */
  lagre: (id: string, valgt: number) => LagredeAnslag;
}

/** Ett lager per lab, med sitt eget navnerom i localStorage. */
export function lagAnslagLager(nokkel: string): AnslagLager {
  function les(): LagredeAnslag {
    if (typeof window === "undefined") return {};
    try {
      const rå = window.localStorage.getItem(nokkel);
      return rå ? (JSON.parse(rå) as LagredeAnslag) : {};
    } catch {
      return {};
    }
  }

  function lagre(id: string, valgt: number): LagredeAnslag {
    const nå = les();
    if (id in nå) return nå;
    const neste = { ...nå, [id]: valgt };
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(nokkel, JSON.stringify(neste));
      } catch {
        // full kvote o.l. — anslaget lever i minnet ut økta, og det holder
      }
    }
    return neste;
  }

  return { les, lagre };
}
