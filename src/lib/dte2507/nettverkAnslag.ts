// ---------------------------------------------------------------------------
// Oppgavetype 1 — ANSLÅ-SÅ-SJEKK, for nettverksterminalen.
//
// PLAN-LABOPPGAVER.md §6.1: et anslag skrevet ned FØR verktøyet kjøres lager en
// forventning som enten bekreftes eller brytes. Uten anslag går observasjonen
// inn som «jaha», og den gamle modellen står urørt. Med anslag blir bruddet
// synlig, og det er bruddet som retter en misoppfatning.
//
// Derfor to regler her:
//
//   1. Anslaget LÅSES når du har svart. Du skal ikke kunne stille om historien
//      i ettertid — hele verdien ligger i at det gale anslaget står igjen.
//   2. Fasiten vises IKKE med en gang. Den vises først når måloppgaven anslaget
//      henger på er løst. Ellers blir panelet en quiz som røper svarene til
//      oppgavene under.
//
// De fire anslagene er ikke tilfeldig valgt. Tre av dem er nøyaktig de tre
// skillene oppsummeringen nederst på siden sier at faget kommer tilbake til
// (MAC mot IP, alias mot canonical name, «svarer ikke» mot «er nede»), og det
// fjerde er lokalnett mot gateway. Det er de samme fire som ligger som
// recall-kort i nettverkKort.ts.
// ---------------------------------------------------------------------------

export interface Anslag {
  id: string;
  /** Spørsmålet, stilt før terminalen er åpnet. */
  sporsmal: string;
  /** Svaralternativene, i vist rekkefølge. */
  valg: string[];
  /** Indeks i `valg` som er riktig. */
  riktig: number;
  /**
   * Måloppgaven anslaget henger på. Fasiten vises først når den er løst — da
   * har studenten sett svaret i terminalen med egne øyne.
   */
  knyttetTil: string;
  /** Vises sammen med fasiten. Skal navngi forvekslingen, ikke gjenta svaret. */
  fasit: string;
}

export const ANSLAG: Anslag[] = [
  {
    id: "anslag-lokalnett",
    sporsmal:
      "Maskinen din og gatewayen — vil de to adressene begynne på de samme tallene, eller på helt ulike?",
    valg: ["De samme tallene", "Helt ulike tall", "Umulig å si på forhånd"],
    riktig: 0,
    knyttetTil: "gateway",
    fasit:
      "10.0.5.37 og 10.0.5.1 deler de tre første tallene, og det er ikke tilfeldig: gatewayen MÅ ligge i ditt eget nett for at du skal kunne sende noe til den uten hjelp. Er den ikke det, kommer du ingen vei — du trenger jo en gateway for å nå noe utenfor nettet, og da også for å nå gatewayen selv.",
  },
  {
    id: "anslag-mac",
    sporsmal:
      "Du sender en pakke til en tjener i USA. Hvor langt kommer MAC-adressen til nettverkskortet ditt?",
    valg: [
      "Hele veien fram til tjeneren",
      "Bare til gatewayen din",
      "Den er ikke med i det hele tatt",
    ],
    riktig: 1,
    knyttetTil: "egen-mac",
    fasit:
      "MAC-adressen brukes bare på ditt eget lokalnett og byttes ut på hvert hopp. IP-adressen er den som følger pakken hele veien. Det er hele grunnen til at begge finnes — og det er skillet mellom lenkelaget og nettverkslaget, uttrykt i to felter du nettopp leste av.",
  },
  {
    id: "anslag-cname",
    sporsmal: "Du slår opp www.uit.no med nslookup. Hva står på «Name:»-linja i svaret?",
    valg: ["www.uit.no — navnet du skrev", "Et annet navn enn det du skrev", "En IP-adresse"],
    riktig: 1,
    knyttetTil: "cname",
    fasit:
      "Navnet du skrev står som «Aliases», og «Name:» er det virkelige navnet (canonical name) bak aliaset. Forvekslingen er lett å gjøre nettopp fordi de to ofte er like — helt til nettstedet ligger bak et CDN, som her.",
  },
  {
    id: "anslag-ping",
    sporsmal: "En maskin svarer ikke på ping. Er den nede?",
    valg: [
      "Ja — svarer den ikke, er den nede",
      "Nei, ikke nødvendigvis",
      "Bare hvis traceroute også stopper",
    ],
    riktig: 1,
    knyttetTil: "stille-vert",
    fasit:
      "En brannmur som dropper ICMP gir nøyaktig samme stillhet som en maskin som er slått av. Traceroute skiller dem delvis ad: får du svar fra hoppene underveis, kom pakkene dine i det minste fram til der. Det tredje alternativet er også galt — traceroute til en levende maskin bak brannmur stopper på samme måte.",
  },
];

/* ------------------------------------------------------------------ lagring */

const NØKKEL = "dte2507-nettverk-anslag-v1";

/** Lagrede anslag: anslag-id → valgt indeks. */
export type LagredeAnslag = Record<string, number>;

export function lesAnslag(): LagredeAnslag {
  if (typeof window === "undefined") return {};
  try {
    const rå = window.localStorage.getItem(NØKKEL);
    return rå ? (JSON.parse(rå) as LagredeAnslag) : {};
  } catch {
    return {};
  }
}

/**
 * Lagrer et anslag. Er anslaget allerede satt, skjer ingenting — låsen er
 * poenget, se toppen av fila.
 */
export function lagreAnslag(id: string, valgt: number): LagredeAnslag {
  const nå = lesAnslag();
  if (id in nå) return nå;
  const neste = { ...nå, [id]: valgt };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(NØKKEL, JSON.stringify(neste));
    } catch {
      // full kvote o.l. — anslaget lever i minnet ut økta, og det holder
    }
  }
  return neste;
}
