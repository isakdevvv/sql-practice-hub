// ---------------------------------------------------------------------------
// Måloppgaver, anslag og recall-kort til «Flaskehals & throughput» — modul 1 steg 4.
//
// Samme hull som på delay-siden: ni seksjoner prosa og én simulator, ingen
// spørsmål, ingenting i repetisjonskøen.
//
// Temaet har én idé, og den er lett å nikke til og vanskelig å bruke: en kjede
// er så rask som sitt tregeste ledd, og alt annet er irrelevant. Oppgavene er
// derfor bygget rundt å OPPGRADERE feil ledd og se at ingenting skjer — det er
// den erfaringen som fester forskjellen mellom «raskere» og «mindre treg».
//
// Alle fasitene er verdier flaskehals-simulatoren på siden viser, og
// `modul1LabSelvsjekk.ts` regner dem ut på nytt fra min(R_i) og F/R.
// ---------------------------------------------------------------------------

import { lagAnslagLager, type Anslag } from "../lab/anslag";
import { eksakt, innenfor, rens, type Oppgave } from "../lab/typer";
import { createFsrsStore } from "../learn/fsrs";

/* ------------------------------------------- standardverdiene i simulatoren */

/** Verdiene BottleneckSim starter med. Fasitene under er utledet av disse. */
export const STANDARD = {
  R_server: 10_000_000_000, // 10 Gbps
  R_core: 100_000_000_000, // 100 Gbps
  R_client: 100_000_000, // 100 Mbps
  filMB: 100,
} as const;

/* ------------------------------------------------------------------- anslag */

export const bottleneckAnslagLager = lagAnslagLager("dte2507-bottleneck-anslag-v1");

export const ANSLAG: Anslag[] = [
  {
    id: "anslag-oppgrader-server",
    sporsmal:
      "Serveren har 10 Gbps, kjernenettet 100 Gbps, klienten 100 Mbps. Du oppgraderer serveren til 40 Gbps. Hvor mye raskere går overføringen?",
    valg: ["Fire ganger så fort", "Litt fortere", "Ikke i det hele tatt"],
    riktig: 2,
    knyttetTil: "oppgrader-server",
    fasit:
      "Ikke i det hele tatt. Klientens 100 Mbps var flaskehalsen før og er det etterpå — min() bryr seg ikke om hvor mye du forbedrer et ledd som ikke var tregest. Dette er hele kapittelet i én setning.",
  },
  {
    id: "anslag-latency",
    sporsmal: "Er «rask forbindelse» det samme spørsmålet som «kort forsinkelse»?",
    valg: ["Ja, to ord for det samme", "Nei, det er to ulike størrelser"],
    riktig: 1,
    knyttetTil: "latency-throughput",
    fasit:
      "To ulike størrelser. Throughput er hvor mange bit per sekund som kommer gjennom; forsinkelse er hvor lenge ett bit er underveis. En satellittlenke kan ha høy throughput og elendig forsinkelse samtidig — og en fiber til naboen motsatt.",
  },
  {
    id: "anslag-deling",
    sporsmal: "Fire TCP-strømmer deler samme flaskehals på 100 Mbps. Hva får hver av dem omtrent?",
    valg: ["100 Mbps hver", "25 Mbps hver", "Den første tar alt"],
    riktig: 1,
    knyttetTil: "deling",
    fasit:
      "Omtrent R/K = 25 Mbps hver. TCPs AIMD konvergerer mot rettferdig deling, så ingen strøm får sulte og ingen får ta alt. Det er derfor strømmingen hakker når noen andre laster ned på samme nett — ikke fordi «internett er tregt i dag».",
  },
];

/* ---------------------------------------------------------------- oppgavene */

export const OPPGAVER: Oppgave[] = [
  {
    id: "throughput",
    tittel: "Det tregeste leddet bestemmer",
    oppdrag:
      "Med standardverdiene i simulatoren: hva blir end-to-end throughput? Svaret er 100 Mbps — finn det i simulatoren, så du ser hvilket ledd den markerer som flaskehals.",
    verktoy: "R_e2e = min(R_i)",
    vist: true,
    kode: "R_server = 10 Gbps\nR_core   = 100 Gbps\nR_client = 100 Mbps",
    hint: "Simulatoren farger flaskehals-lenka. Svar i Mbps.",
    forklaring:
      "min(10 000, 100 000, 100) Mbps = 100 Mbps. De to første leddene er hundre og tusen ganger raskere, og det spiller ingen rolle — kjeden er så rask som sitt tregeste ledd.",
    fasit: "100",
    sjekk: innenfor(100, 1),
  },
  {
    id: "overforingstid",
    tittel: "Hvor lenge filen tar",
    oppdrag: "Hvor lang tid tar det å overføre en fil på 100 MB? Svar i sekunder.",
    verktoy: "F / R_e2e",
    kode: "F     = 100 MB\nR_e2e = 100 Mbps",
    hint: "Gjør om megabyte til bit før du deler. 1 byte = 8 bit.",
    forklaring:
      "100 MB = 800 Mbit, delt på 100 Mbps = 8 sekunder. Den vanligste bommen her er å glemme faktoren 8: byte i filstørrelsen, bit i lenkefarten. Det er også grunnen til at en «100 Mbps-linje» laster ned med rundt 12 MB/s.",
    fasit: "8",
    sjekk: innenfor(8, 0.3, [
      {
        verdi: 1,
        toleranse: 0.05,
        si: "Du delte MB på Mbps direkte. Filen er 100 MB = 800 megabit — gang med 8 først.",
      },
      {
        verdi: 64,
        toleranse: 2,
        si: "Du ganget med 8 på feil side. Filen gjøres om til bit, lenkefarten er allerede i bit per sekund.",
      },
    ]),
  },
  {
    id: "oppgrader-server",
    tittel: "Oppgraderingen som ikke merkes",
    oppdrag: "Dra serverlenka opp til 40 Gbps. Hva er end-to-end throughput nå? Svar i Mbps.",
    verktoy: "modifiser simulatoren",
    hint: "Se på hvilket ledd simulatoren fortsatt markerer som flaskehals.",
    forklaring:
      "Fortsatt 100 Mbps. Å firedoble et ledd som ikke var tregest endrer ingenting — min() plukker fremdeles klientens access-lenke. Dette er den dyreste feilen i praksis: man oppgraderer det man kan måle, i stedet for det som faktisk begrenser.",
    fasit: "100",
    sjekk: innenfor(100, 1, [
      {
        verdi: 40_000,
        toleranse: 500,
        si: "40 Gbps er serverens nye fart, ikke kjedens. Klientens 100 Mbps er fortsatt det tregeste leddet.",
      },
      {
        verdi: 400,
        toleranse: 10,
        si: "Throughput blir ikke ganget opp av en oppgradering et annet sted i kjeden. Se hvilket ledd som er markert.",
      },
    ]),
  },
  {
    id: "oppgrader-klient",
    tittel: "Oppgraderingen som merkes",
    oppdrag:
      "Sett serverlenka tilbake, og dra i stedet klientens lenke opp til 1 Gbps. Hva blir throughput nå? Svar i Mbps.",
    verktoy: "modifiser simulatoren",
    hint: "Nå flytter flaskehalsen seg. Hvilket ledd er det tregeste etterpå?",
    forklaring:
      "1000 Mbps. Klienten er fortsatt det tregeste leddet — 1 Gbps er mindre enn både 10 og 100 — men nå ti ganger bedre enn før. Det er slik oppgraderinger virker: flaskehalsen forsvinner aldri, den flytter seg eller blir mindre trang. Neste gang er det serverlenka på 10 Gbps som står for tur.",
    fasit: "1000",
    sjekk: innenfor(1000, 10, [
      {
        verdi: 100,
        toleranse: 2,
        si: "Det er den gamle verdien. Dra klientlenka helt opp til 1 Gbps = 1000 Mbps.",
      },
      {
        verdi: 10_000,
        toleranse: 200,
        si: "10 Gbps er serverlenka. Klienten på 1 Gbps er fortsatt lavere, og min() velger den.",
      },
    ]),
  },
  {
    id: "tid-etter",
    tittel: "Hva oppgraderingen var verdt",
    oppdrag: "Med klienten på 1 Gbps: hvor lang tid tar de samme 100 MB nå? Svar i sekunder.",
    verktoy: "F / R_e2e",
    hint: "Samme regnestykke som før, med ti ganger så høy throughput.",
    forklaring:
      "0,8 sekunder — ti ganger raskere, fordi vi oppgraderte det leddet som faktisk var flaskehalsen. Sammenlign med serveroppgraderingen, som firedoblet et ledd og ga null. Det er forskjellen mellom å måle og å gjette.",
    fasit: "0.8",
    sjekk: innenfor(0.8, 0.05, [
      {
        verdi: 8,
        toleranse: 0.3,
        si: "Det er tiden med den gamle throughputen. Sett klientlenka til 1 Gbps først.",
      },
    ]),
  },
  {
    id: "deling",
    tittel: "Når flere skal dele",
    oppdrag:
      "Klienten er tilbake på 100 Mbps, og fire TCP-strømmer deler den. Hva får hver strøm omtrent? Svar i Mbps.",
    verktoy: "R / K",
    hint: "TCP konvergerer mot rettferdig deling — se seksjon 8 på siden.",
    forklaring:
      "Rundt 25 Mbps hver. AIMD gjør at strømmene finner et likevektspunkt der de deler omtrent likt. Derfor hakker strømming når noen andre laster ned samtidig: din access-lenke var flaskehalsen hele tiden, den må bare deles på flere nå.",
    fasit: "25",
    sjekk: innenfor(25, 1, [
      {
        verdi: 100,
        toleranse: 2,
        si: "100 Mbps er hele flaskehalsen. Den skal deles på fire strømmer.",
      },
      {
        verdi: 400,
        toleranse: 10,
        si: "Flere strømmer gir ikke mer kapasitet — de deler den som finnes.",
      },
    ]),
  },
  {
    id: "latency-throughput",
    tittel: "To spørsmål som ikke er samme spørsmål",
    oppdrag:
      "En satellittlenke har 500 Mbps kapasitet og 600 ms rundtur. Hvilken av de to størrelsene er dårlig — throughput eller forsinkelse? Svar med ordet.",
    verktoy: "begrepene",
    hint: "Den ene måles i bit per sekund, den andre i sekunder. Hvilken av tallene er høy, og hvilken er dårlig?",
    forklaring:
      "Forsinkelsen. 500 Mbps er god throughput — du får mye gjennom per sekund. Men 600 ms rundtur gjør lenka ubrukelig til videosamtaler og spill, og gjør at TCP bruker lang tid på å komme opp i fart. Høy kapasitet og lang forsinkelse er ikke en selvmotsigelse; de måler ulike ting.",
    fasit: "forsinkelse",
    sjekk: eksakt(
      "forsinkelse",
      (s) => rens(s).replace(/latency|forsinkelsen|delay/, "forsinkelse"),
      [
        {
          verdi: "throughput",
          si: "500 Mbps er tvert imot bra. Det er tiden rundt — 600 ms — som er problemet.",
        },
        {
          verdi: "begge",
          si: "Bare den ene. 500 Mbps er god kapasitet; det er rundturen på 600 ms som ødelegger.",
        },
      ],
    ),
  },
];

/* ------------------------------------------------------------- recall-kort */

export const bottleneckFsrs = createFsrsStore("dte2507-bottleneck-fsrs-v1");

export interface BottleneckKort {
  id: string;
  front: string;
  back: string;
  tag: "formler" | "skiller";
}

export const BOTTLENECK_KORT: BottleneckKort[] = [
  {
    id: "btl-min",
    tag: "formler",
    front: "Hva er end-to-end throughput over en kjede av lenker?",
    back: "min(R_i) — det tregeste leddet. Å forbedre et hvilket som helst annet ledd endrer ingenting, uansett hvor mye du forbedrer det.",
  },
  {
    id: "btl-tid",
    tag: "formler",
    front: "Hvor lang tid tar en fil på F byte over en forbindelse med R bit/s?",
    back: "F · 8 / R sekunder. Faktoren 8 er den som glemmes: filstørrelser oppgis i byte, lenkefarter i bit per sekund. 100 MB over 100 Mbps tar 8 sekunder, ikke 1.",
  },
  {
    id: "btl-latency",
    tag: "skiller",
    front: "Throughput eller forsinkelse — hva måler hva?",
    back: "Throughput er hvor mange bit per sekund som kommer gjennom (bredden på røret). Forsinkelse er hvor lenge ett bit er underveis (lengden på røret). En satellitt kan ha høy throughput og elendig forsinkelse samtidig.",
  },
  {
    id: "btl-deling",
    tag: "formler",
    front: "K TCP-strømmer deler en flaskehals på R. Hva får hver?",
    back: "Omtrent R/K. TCPs AIMD konvergerer mot rettferdig deling. Det er derfor strømming hakker når noen andre laster ned på samme access-lenke.",
  },
  {
    id: "btl-flytter",
    tag: "skiller",
    front: "Hva skjer når du fjerner en flaskehals?",
    back: "En ny tar over — det finnes alltid et tregeste ledd. Spørsmålet er aldri «er den borte», men «hvor mye vant jeg, og hvor er den nå».",
  },
];
