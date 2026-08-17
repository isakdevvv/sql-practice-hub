// ---------------------------------------------------------------------------
// Anslagene til nettverksterminalen — oppgavetype 1.
//
// Reglene (låsen, og at fasiten venter på måloppgaven) er felles for alle
// labene og bor i `src/lib/lab/anslag.ts`. Her står bare innholdet.
//
// De fire anslagene er ikke tilfeldig valgt. Tre av dem er nøyaktig de tre
// skillene oppsummeringen nederst på siden sier at faget kommer tilbake til
// (MAC mot IP, alias mot canonical name, «svarer ikke» mot «er nede»), og det
// fjerde er lokalnett mot gateway. Det er de samme fire som ligger som
// recall-kort i nettverkKort.ts.
// ---------------------------------------------------------------------------

import { lagAnslagLager, type Anslag } from "../lab/anslag";

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

/**
 * Nøkkelen er uendret fra før løftet til lib/lab/anslag.ts — bytter du den,
 * mister alle som har svart anslagene sine, og da er låsen brutt.
 */
export const nettverkAnslagLager = lagAnslagLager("dte2507-nettverk-anslag-v1");
