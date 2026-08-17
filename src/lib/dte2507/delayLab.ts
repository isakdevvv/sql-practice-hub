// ---------------------------------------------------------------------------
// Måloppgaver, anslag og recall-kort til «De fire forsinkelsene» — modul 1 steg 3.
//
// Siden hadde elleve seksjoner med god prosa og fire simulatorer, og null
// spørsmål. Du kunne lese og leke, men aldri finne ut om du hadde forstått noe,
// og ingenting havnet i repetisjonskøen. Det er akkurat den svakheten
// PLAN-LABOPPGAVER.md §6.4 peker på: uten gjenhenting er det lest, ikke lært.
//
// VIKTIG PRINSIPP, samme som i nettverkslaben: alle fasitene under er verdier
// sidens EGNE simulatorer viser. Oppgavene leser av den samme modellen
// studenten leker med — de er ikke et parallelt regnestykke som kan komme i
// utakt. `modul1LabSelvsjekk.ts` regner dem ut på nytt fra formlene og
// stryker hvis noen av dem spriker.
//
// Toleranse i stedet for eksakt likhet (§4.4): dette er målte tall med
// avrunding i grensesnittet, og å kreve tredje desimal ville målt
// kalkulatorbruk i stedet for forståelse.
// ---------------------------------------------------------------------------

import { lagAnslagLager, type Anslag } from "../lab/anslag";
import { eksakt, innenfor, rens, type Oppgave } from "../lab/typer";
import { createFsrsStore } from "../learn/fsrs";

/* ------------------------------------------- standardverdiene i simulatoren */

/** Verdiene DelaySim starter med. Fasitene under er utledet av disse. */
export const STANDARD = {
  L: 12_000, // bits (1500 byte)
  R: 100_000_000, // bps (100 Mbps)
  d: 1_000_000, // m (1000 km)
  s: 2e8, // m/s
  dProc: 50e-6, // s
} as const;

/* ------------------------------------------------------------------- anslag */

export const delayAnslagLager = lagAnslagLager("dte2507-delay-anslag-v1");

export const ANSLAG: Anslag[] = [
  {
    id: "anslag-hvem-dominerer",
    sporsmal:
      "En pakke på 1500 byte sendes over en 100 Mbps-lenke som er 1000 km lang. Hvilken av de fire forsinkelsene er størst?",
    valg: ["Transmisjon", "Propagering", "Prosessering"],
    riktig: 1,
    knyttetTil: "dominant",
    fasit:
      "Propagering, og ikke med liten margin: 5 ms mot 120 µs. Over lange avstander er det avstanden som koster, ikke bitene. Det er derfor en rask lenke til Australia fortsatt føles treg.",
  },
  {
    id: "anslag-dobbel-fart",
    sporsmal: "Du dobler lenkefarten fra 100 til 200 Mbps. Hva skjer med propagasjonsforsinkelsen?",
    valg: ["Den halveres", "Den er helt uendret", "Den blir litt mindre"],
    riktig: 1,
    knyttetTil: "prop-uendret",
    fasit:
      "Uendret. R står i transmisjonsforsinkelsen (L/R) og ingen andre steder. Propagering er avstand delt på signalfart — hvor fort du dytter bitene ut har ingenting å si for hvor fort de reiser.",
  },
  {
    id: "anslag-lan",
    sporsmal:
      "Samme pakke på et LAN: gigabit-lenke, 100 meter kabel. Hvilken forsinkelse dominerer nå?",
    valg: ["Fortsatt propagering", "Transmisjon", "De er omtrent like"],
    riktig: 1,
    knyttetTil: "lan-dominant",
    fasit:
      "Transmisjon — 12 µs mot 0,5 µs for propagering. Det er samme regnestykke som over, med andre tall, og svaret snur helt. Derfor er «hvilken dominerer» aldri et spørsmål du kan svare på uten å regne.",
  },
  {
    id: "anslag-ko",
    sporsmal: "Trafikkintensiteten er ρ = 0,8. Hvor mange pakker står det i snitt i køen?",
    valg: ["Under én", "Rundt tre", "Rundt tjue"],
    riktig: 1,
    knyttetTil: "ko-08",
    fasit:
      "Rundt tre (3,2). Poenget er ikke tallet, men formen på kurven: ved ρ = 0,5 er køen 0,5, ved 0,8 er den 3,2, og ved 0,95 er den 18. Køen vokser ikke jevnt — den eksploderer mot slutten.",
  },
];

/* ---------------------------------------------------------------- oppgavene */

export const OPPGAVER: Oppgave[] = [
  {
    id: "d-trans",
    tittel: "Tiden det tar å dytte pakken ut",
    oppdrag:
      "Med standardverdiene i simulatoren: hva er transmisjonsforsinkelsen? Svaret er 120 µs — oppgaven er å finne det i simulatoren, så du vet hvor du skal se resten av veien.",
    verktoy: "d_trans = L / R",
    vist: true,
    kode: "L = 12 000 bit  (1500 byte)\nR = 100 Mbps",
    hint: "Sett simulatoren til standardverdiene og les den oransje søylen. Svar i mikrosekunder.",
    forklaring:
      "12 000 bit / 100 000 000 bit per sekund = 0,00012 s = 120 µs. Dette er tiden det tar å presse HELE pakken ut på lenka — ikke tiden det tar før den kommer fram.",
    fasit: "120",
    sjekk: innenfor(120, 2),
  },
  {
    id: "d-prop",
    tittel: "Tiden signalet er underveis",
    oppdrag: "Hva er propagasjonsforsinkelsen med de samme standardverdiene? Svar i millisekunder.",
    verktoy: "d_prop = d / s",
    kode: "d = 1000 km\ns = 2 · 10⁸ m/s",
    hint: "Gjør om 1000 km til meter først. Simulatoren viser svaret i ms.",
    forklaring:
      "1 000 000 m / 2 · 10⁸ m/s = 0,005 s = 5 ms. Legg merke til at hverken pakkestørrelsen eller lenkefarten er med i regnestykket — bare avstand og signalfart.",
    fasit: "5",
    sjekk: innenfor(5, 0.15, [
      {
        verdi: 3.33,
        toleranse: 0.2,
        si: "Du regnet med lysfarten i vakuum (3 · 10⁸). I kobber og fiber går signalet saktere — omtrent 2 · 10⁸ m/s.",
      },
      {
        verdi: 0.005,
        toleranse: 0.001,
        si: "Det er svaret i sekunder. Oppgaven ber om millisekunder.",
      },
      {
        verdi: 5000,
        toleranse: 100,
        si: "Det er svaret i mikrosekunder. Oppgaven ber om millisekunder.",
      },
    ]),
  },
  {
    id: "dominant",
    tittel: "Hvilket ledd som koster mest",
    oppdrag:
      "Med standardverdiene: hvilken av de fire forsinkelsene er størst? Svar med navnet — prosessering, transmisjon eller propagering.",
    verktoy: "sammenlign søylene",
    hint: "Simulatoren markerer den dominerende selv. 5 ms mot 120 µs mot 50 µs.",
    forklaring:
      "Propagering, med god margin. Over 1000 km er avstanden det dyre, og da hjelper det lite å kjøpe raskere lenke. Det er dette som gjør at en videosamtale til Australia har merkbar forsinkelse uansett hvor god forbindelsen er.",
    fasit: "propagering",
    sjekk: eksakt(
      "propagering",
      (s) =>
        rens(s)
          .replace(/^d_?/, "")
          .replace(/prop\w*/, "propagering")
          .replace(/asjon/, ""),
      [
        {
          verdi: "transmisjon",
          si: "Transmisjon er 120 µs. Se på søylen som er over førti ganger så lang.",
        },
        {
          verdi: "prosessering",
          si: "Prosessering er 50 µs — den minste av de tre her.",
        },
      ],
    ),
  },
  {
    id: "d-nodal",
    tittel: "Hele forsinkelsen i én ruter",
    oppdrag: "Hva blir den samlede nodale forsinkelsen med standardverdiene? Svar i millisekunder.",
    verktoy: "d_nodal = d_proc + d_queue + d_trans + d_prop",
    kode: "d_proc  = 50 µs\nd_queue = 0 (ingen kø her)\nd_trans = ?\nd_prop  = ?",
    hint: "Legg sammen de tre du allerede har funnet. Køforsinkelsen er satt til null i denne simulatoren.",
    forklaring:
      "50 µs + 120 µs + 5000 µs = 5170 µs = 5,17 ms. Det er summen for ÉN node. En pakke som skal gjennom seks rutere betaler noe slikt seks ganger — og det er hele grunnen til at antall hopp betyr noe.",
    fasit: "5.17",
    sjekk: innenfor(5.17, 0.1, [
      {
        verdi: 5,
        toleranse: 0.03,
        si: "Du glemte prosesserings- og transmisjonsleddet. De er små, men de er med.",
      },
      {
        verdi: 170,
        toleranse: 5,
        si: "Det ser ut som du la sammen bare µs-leddene. Propagering er 5000 µs, ikke 5.",
      },
    ]),
  },
  {
    id: "prop-uendret",
    tittel: "Leddet raskere lenke ikke rører",
    oppdrag: "Dra R opp til 200 Mbps. Hva er propagasjonsforsinkelsen nå? Svar i millisekunder.",
    verktoy: "modifiser simulatoren",
    hint: "Se på den blå søylen mens du drar i R-slideren. Skjer det noe med den i det hele tatt?",
    forklaring:
      "5 ms — nøyaktig som før. R finnes bare i L/R. Å kjøpe dobbelt så rask lenke halverer tiden det tar å dytte pakken ut, men gjør ingenting med tiden signalet bruker på å komme fram. Dette er den vanligste misforståelsen i hele kapittelet.",
    fasit: "5",
    sjekk: innenfor(5, 0.15, [
      {
        verdi: 2.5,
        toleranse: 0.1,
        si: "Du halverte feil ledd. R står i transmisjonsforsinkelsen — propagering er avstand delt på signalfart.",
      },
    ]),
  },
  {
    id: "d-trans-dobbel",
    tittel: "Leddet den derimot halverer",
    oppdrag: "Med R = 200 Mbps: hva er transmisjonsforsinkelsen? Svar i mikrosekunder.",
    verktoy: "modifiser simulatoren",
    hint: "Den oransje søylen, med R fortsatt på 200 Mbps.",
    forklaring:
      "60 µs — halvparten av 120. Her virker raskere lenke akkurat som du forventer. Sammenlign med forrige oppgave: samme endring, to helt ulike utfall, og det er derfor de fire leddene må holdes fra hverandre.",
    fasit: "60",
    sjekk: innenfor(60, 2, [
      {
        verdi: 120,
        toleranse: 3,
        si: "Det er svaret med 100 Mbps. Dra R helt opp til 200.",
      },
      {
        verdi: 240,
        toleranse: 5,
        si: "Raskere lenke gir kortere transmisjonstid, ikke lengre — R står i nevneren.",
      },
    ]),
  },
  {
    id: "lan-dominant",
    tittel: "Når svaret snur",
    oppdrag:
      "Trykk på LAN-forhåndsvalget (gigabit, 100 meter kabel). Hvilken forsinkelse dominerer nå? Svar med navnet.",
    verktoy: "forhåndsvalg: LAN",
    hint: "d_trans = 12 000 / 10⁹, d_prop = 100 m / 2 · 10⁸. Regn begge før du ser.",
    forklaring:
      "Transmisjon — 12 µs mot 0,5 µs. Nøyaktig samme formler som på 1000 km-lenka, og motsatt svar. På korte avstander er det bitene som koster, på lange er det avstanden. «Hvilken dominerer» kan derfor aldri besvares uten tallene.",
    fasit: "transmisjon",
    sjekk: eksakt(
      "transmisjon",
      (s) =>
        rens(s)
          .replace(/^d_?/, "")
          .replace(/trans\w*/, "transmisjon"),
      [
        {
          verdi: "propagering",
          si: "På 100 meter er propagering nede i 0,5 µs. Nå er det transmisjonen som er den store.",
        },
      ],
    ),
  },
  {
    id: "rho-a",
    tittel: "Hva ρ betyr i pakker per sekund",
    oppdrag:
      "I trafikkintensitet-simulatoren: sett ρ til 0,60. Hvor mange pakker per sekund tilsvarer det?",
    verktoy: "ρ = L·a / R",
    kode: "L = 1500 byte\nR = 100 Mbps\nρ = 0,60",
    hint: "Simulatoren viser a rett under R. Eller løs ρ = La/R for a.",
    forklaring:
      "5000 pakker per sekund. ρ er ikke et abstrakt tall — det er ankomstraten målt i hvor stor andel av lenkas kapasitet den fyller. Ved ρ = 1 kommer det nøyaktig like mye inn som det går ut, og alt over det er umulig i lengden.",
    fasit: "5000",
    sjekk: innenfor(5000, 50, [
      {
        verdi: 8333,
        toleranse: 100,
        si: "8333 pkt/s er ρ = 1, altså lenka helt full. Du skal ha 60 % av det.",
      },
    ]),
  },
  {
    id: "ko-08",
    tittel: "Køen som ikke vokser jevnt",
    oppdrag:
      "Dra ρ til 0,80. Hvor mange pakker står det i snitt i køen? (Hold pekeren over kurven for å lese av tallet.)",
    verktoy: "ρ²/(1−ρ)",
    hint: "Sammenlign med ρ = 0,50 først, så du ser hvor mye brattere det går.",
    forklaring:
      "3,2 pakker. Ved ρ = 0,5 var det 0,5 — altså seks ganger så mye kø for 60 % mer trafikk. Nevneren (1 − ρ) går mot null, og da eksploderer uttrykket. Det er derfor Kurose sin tommelfingerregel er å designe for ρ godt under 1, ikke for ρ = 0,99.",
    fasit: "3.2",
    sjekk: innenfor(3.2, 0.25, [
      {
        verdi: 0.8,
        toleranse: 0.05,
        si: "0,8 er ρ selv, ikke kølengden. Les av verdien på kurven ved ρ = 0,80.",
      },
      {
        verdi: 4,
        toleranse: 0.15,
        si: "Nesten — 4 er ρ/(1−ρ), altså antallet i systemet. Kurven her viser antallet som VENTER: ρ²/(1−ρ) = 3,2.",
      },
    ]),
  },
];

/* ------------------------------------------------------------- recall-kort */

export const delayFsrs = createFsrsStore("dte2507-delay-fsrs-v1");

export interface DelayKort {
  id: string;
  front: string;
  back: string;
  tag: "formler" | "skiller";
}

export const DELAY_KORT: DelayKort[] = [
  {
    id: "dly-fire",
    tag: "formler",
    front: "De fire forsinkelsene i en node — hva heter de, og hva avhenger hver av?",
    back: "Prosessering (ruterens egen behandling), kø (hvor mye trafikk som ligger foran), transmisjon = L/R (pakkestørrelse og lenkefart) og propagering = d/s (avstand og signalfart). Bare kø varierer fra pakke til pakke.",
  },
  {
    id: "dly-trans-prop",
    tag: "skiller",
    front: "Hva er forskjellen på transmisjons- og propagasjonsforsinkelse?",
    back: "Transmisjon er tiden det tar å dytte pakken UT på lenka (L/R). Propagering er tiden det første bitet bruker på å komme FRAM (d/s). Den første avhenger av pakkestørrelse og fart, den andre bare av avstand.",
  },
  {
    id: "dly-raskere-lenke",
    tag: "skiller",
    front: "Du dobler lenkefarten. Hvilke av de fire forsinkelsene endrer seg?",
    back: "Bare transmisjonsforsinkelsen — den halveres. R finnes ikke i noen av de tre andre. En raskere lenke gjør ingenting med avstanden signalet må reise.",
  },
  {
    id: "dly-signalfart",
    tag: "formler",
    front: "Hvilken signalfart regner man med i kobber og fiber?",
    back: "Omtrent 2 · 10⁸ m/s — rundt to tredjedeler av lysfarten i vakuum. Regner du med 3 · 10⁸ får du for kort propagasjonsforsinkelse, og det er den vanligste regnefeilen på denne oppgavetypen.",
  },
  {
    id: "dly-rho",
    tag: "formler",
    front: "Hva er trafikkintensitet, og hva skjer når den nærmer seg 1?",
    back: "ρ = L·a/R: ankomstraten målt som andel av lenkas kapasitet. Køen vokser som ρ²/(1−ρ) — altså sakte i starten og eksplosivt mot slutten. Ved ρ > 1 vokser den uten grense, og pakker må droppes.",
  },
  {
    id: "dly-nodal",
    tag: "formler",
    front: "Hvordan blir en pakkes samlede forsinkelse gjennom flere rutere?",
    back: "Summen av d_nodal i hver node den passerer. Derfor koster hvert ekstra hopp, og derfor er antall hopp i en traceroute mer enn et kuriosum.",
  },
];
