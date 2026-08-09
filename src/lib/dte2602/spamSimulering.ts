// Datagrunnlaget og regnestykkene bak spamfilter-simuleringen i DTE-2602 Modul 1
// (`src/components/stack/dte2602-modul1/RegelVsLaertSim.tsx`).
//
// Ligger utenfor komponenten av to grunner: tallene simuleringen viser skal
// kunne etterprøves uten å rendre React, og komponentfila skal bare eksportere
// komponenter.
//
// Modellen er en enkel ordtellingsmodell: hvert ord får en vekt ut fra hvor mye
// oftere det dukker opp i spam enn i vanlig post, og e-posten summeres opp. Det
// er en forenkling av naiv Bayes, som studenten møter under sitt eget navn i
// Fase 4. Ord modellen aldri har sett teller null — den har ingen mening om dem,
// og det er nettopp derfor den feiler når spammerne bytter skrivemåte.

export type Epost = {
  id: string;
  tekst: string;
  /** Fasiten — satt av et menneske. */
  spam: boolean;
};

/** Uke 1: e-postene systemet ble bygget for. */
export const TRENING_UKE1: Epost[] = [
  { id: "t1", tekst: "GRATIS medlemskap – klikk her nå", spam: true },
  { id: "t2", tekst: "Vinn en ny mobil nå", spam: true },
  { id: "t3", tekst: "Gratis kreditt uten sikkerhet", spam: true },
  { id: "t4", tekst: "Klikk her for å vinne premien", spam: true },
  { id: "t5", tekst: "Du har vunnet en gratis reise", spam: true },
  { id: "t6", tekst: "Møtereferat fra tirsdag ligger vedlagt", spam: false },
  { id: "t7", tekst: "Kan du se på rapporten før fredag", spam: false },
  { id: "t8", tekst: "Timeplan for neste semester er publisert", spam: false },
  { id: "t9", tekst: "Faktura for oktober er betalt", spam: false },
  { id: "t10", tekst: "Vi flytter møtet til torsdag klokka ni", spam: false },
];

/** Uke 2: nye e-poster som et menneske har rukket å merke. */
export const MERKET_UKE2: Epost[] = [
  { id: "m1", tekst: "G R A T I S abonnement, trykk lenken", spam: true },
  { id: "m2", tekst: "V1nn tur til Syden, trykk lenken", spam: true },
  { id: "m3", tekst: "Kjapp kred1tt, trykk lenken", spam: true },
  { id: "m4", tekst: "Sensur på eksamen er publisert i StudentWeb", spam: false },
  { id: "m5", tekst: "Har du tid til en prat om oppgaven", spam: false },
  { id: "m6", tekst: "Vedlagt ligger budsjettet for neste år", spam: false },
];

/**
 * Uke 3: e-postene vi måler på. Ingen av systemene har sett dem, og de blir
 * aldri trent på. Det er hele grunnen til at tallene under betyr noe — det er
 * samme regel som du møter som train/test-oppdeling i Fase 3.
 */
export const TEST_UKE3: Epost[] = [
  { id: "e1", tekst: "G R A T I S oppgradering, trykk lenken", spam: true },
  { id: "e2", tekst: "V1nn tur til Syden, trykk lenken", spam: true },
  { id: "e3", tekst: "Kjapp kred1tt, trykk lenken", spam: true },
  { id: "e4", tekst: "G R A T I S oppgradering av abonnement", spam: true },
  { id: "e5", tekst: "Møtet på torsdag er flyttet til fredag", spam: false },
  { id: "e6", tekst: "Rapporten fra møtet ligger vedlagt", spam: false },
  { id: "e7", tekst: "Kan du sende budsjettet før klokka ni", spam: false },
  { id: "e8", tekst: "Sensuren for eksamen er publisert", spam: false },
];

export const REGLER_OPPRINNELIG = ["gratis", "vinn", "klikk her", "kreditt"];
export const REGLER_UTVIDET = [
  ...REGLER_OPPRINNELIG,
  "g r a t i s",
  "v1nn",
  "kred1tt",
  "trykk lenken",
];

function ord(tekst: string): string[] {
  return tekst
    .toLowerCase()
    .split(/[^a-zæøå0-9]+/)
    .filter(Boolean);
}

/** Regelbasert: slår ut hvis én av tekststrengene finnes i e-posten. */
export function regelDom(tekst: string, regler: string[]): boolean {
  const t = tekst.toLowerCase();
  return regler.some((r) => t.includes(r));
}

/** Trener ordvektene: hvor mye mer sannsynlig er ordet i spam enn i vanlig post? */
export function tren(treningssett: Epost[]): Map<string, number> {
  const spamTelling = new Map<string, number>();
  const hamTelling = new Map<string, number>();
  let spamOrd = 0;
  let hamOrd = 0;

  for (const e of treningssett) {
    for (const o of ord(e.tekst)) {
      if (e.spam) {
        spamTelling.set(o, (spamTelling.get(o) ?? 0) + 1);
        spamOrd += 1;
      } else {
        hamTelling.set(o, (hamTelling.get(o) ?? 0) + 1);
        hamOrd += 1;
      }
    }
  }

  const vekter = new Map<string, number>();
  const alleOrd = new Set([...spamTelling.keys(), ...hamTelling.keys()]);
  for (const o of alleOrd) {
    // Legg til 1 på begge sider, slik at et ord som bare finnes i den ene
    // gruppen ikke gir uendelig utslag.
    const pSpam = ((spamTelling.get(o) ?? 0) + 1) / (spamOrd + alleOrd.size);
    const pHam = ((hamTelling.get(o) ?? 0) + 1) / (hamOrd + alleOrd.size);
    vekter.set(o, Math.log(pSpam / pHam));
  }
  return vekter;
}

/** Ord modellen aldri har sett teller null — den har ingen mening om dem. */
export function modellDom(tekst: string, vekter: Map<string, number>): boolean {
  let sum = 0;
  for (const o of ord(tekst)) sum += vekter.get(o) ?? 0;
  return sum > 0;
}
