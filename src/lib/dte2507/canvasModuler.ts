/**
 * DTE-2507 Datakommunikasjon — Canvas-modulene, lest 2026-08-16.
 *
 * Dette har vært det største åpne punktet i repoet. Lag-inndelingen i
 * `lagPlan.ts` er bygget på Kurose-logikk fordi vi ikke visste emnets egen
 * rekkefølge; nå vet vi den, og de to er ikke like. Lagene beholdes som en
 * *lærings*rekkefølge (nedenfra og opp), mens denne fila er emnets faktiske
 * *undervisnings*rekkefølge (top-down, kapittel for kapittel). Samme skille
 * som i TEK-1501, der appens modul 1 og fagets kapittel 1 heller ikke er
 * samme sak.
 *
 * Tre ting som er lette å misforstå, og som er grunnen til at fila finnes:
 *
 * 1. **Dette Canvas-emnet er bare halve faget.** Det dekker datakomm-delen
 *    (5 stp) og hele ELE-2603. Sikkerhetsdelen av DTE-2507 ligger på en egen
 *    Canvas-side og går uke 41–46, med egne arbeidskrav. Eksamen 30.11 har
 *    datakomm kl. 09 og sikkerhet kl. 13 — to økter, samme dag.
 * 2. **Obligene er ikke innleveringer.** De er en avkrysning på at alle
 *    quizene i to moduler allerede er godkjent. Jobben ligger i quizene; selve
 *    «Oblig1 Ok?» er ett poeng og tar ett klikk.
 * 3. **Prosentkravene er strenge.** De fleste quizene krever full pott. Se
 *    `kravAndel` per quiz — det er den enkeltopplysningen som er lettest å
 *    overse og dyrest å oppdage sent.
 */

/** En quiz med frist og godkjenningskrav. */
export interface Quiz {
  /** Navnet slik det står i Canvas. */
  navn: string;
  /** ISO-dato. */
  frist: string;
  /** Klokkeslett, der Canvas oppgir noe annet enn 23:59. */
  klokkeslett?: string;
  /** Maks poengsum. */
  poeng: number;
  /** Poeng som kreves for å bli godkjent. */
  krav: number;
  /** Hva quizen dekker. */
  hva: string;
}

export interface Dte2507Modul {
  /** "1" … "6". */
  nr: string;
  tittel: string;
  /** Ukene modulen undervises i. */
  uker: number[];
  /** Kapitlene i Kurose & Ross modulen dekker. */
  kapitler: number[];
  /** Labbene som hører til, slik Canvas nummererer dem. */
  labber: string[];
  /** Verktøyene labbene bruker. */
  verktoy: string[];
  quizer: Quiz[];
  /** Slug i appen som er nærmest forberedelse. `null` der vi ikke har noe. */
  ovingSlug: string | null;
  /** Hva appen ikke dekker av modulen. */
  hull?: string;
}

/**
 * Obligene, som altså bare bekrefter at modulenes quizer er godkjent.
 *
 * Merk datokonflikten på oblig 2: emneoversikten skriver 20. september, mens
 * modullista skriver 27. september. Vi bruker 27.09, fordi Modulquiz-Modul 4
 * — som oblig 2 dekker — har frist 27.09, og en oblig kan ikke forfalle før
 * innholdet den bekrefter. Konflikten vises i appen i stedet for å skjules;
 * det er verdt å få bekreftet av emneansvarlig.
 */
export interface Oblig2507 {
  nr: string;
  frist: string;
  /** Modulene obligen dekker. */
  moduler: string[];
  /** Satt når kildene er uenige om datoen. */
  konflikt?: string;
}

export const OBLIGER_2507: Oblig2507[] = [
  { nr: "1", frist: "2026-09-06", moduler: ["1", "2"] },
  {
    nr: "2",
    frist: "2026-09-27",
    moduler: ["3", "4"],
    konflikt:
      "Emneoversikten oppgir 20. september, modullista 27. september. Vi bruker 27.09 fordi Modulquiz-Modul 4 — som denne obligen dekker — har frist 27.09. Sjekk med emneansvarlig hvis du vil være sikker.",
  },
  { nr: "3", frist: "2026-10-11", moduler: ["5", "6"] },
];

export const MODULER_2507: Dte2507Modul[] = [
  {
    nr: "1",
    tittel: "Introduksjon",
    uker: [34],
    kapitler: [1],
    labber: ["Lab 1: IP-nettverk"],
    verktoy: ["ipconfig / ifconfig", "ping", "traceroute / tracert", "nslookup", "netstat"],
    quizer: [
      {
        navn: "Lab1: IP-nettverk",
        frist: "2026-08-23",
        poeng: 11,
        krav: 11,
        hva: "Orientere seg i et IP-nettverk fra terminalen. Ubegrensede forsøk, og hint etter innlevering.",
      },
    ],
    ovingSlug: "dte2507-nettverksverktoy",
  },
  {
    nr: "2",
    tittel: "Applikasjonslaget",
    uker: [35],
    kapitler: [2],
    labber: ["Lab 2, 3 og 4: Wireshark, HTTP, DNS"],
    verktoy: ["Wireshark"],
    quizer: [
      {
        navn: "Kontrollspørsmål (modul 2)",
        frist: "2026-09-06",
        poeng: 7,
        krav: 7,
        hva: "Knyttet til laboppgavene.",
      },
      {
        navn: "Modulquiz-Modul 2",
        frist: "2026-09-06",
        poeng: 26,
        krav: 26,
        hva: "Hele modulen: web, e-post, DNS, FTP.",
      },
    ],
    ovingSlug: "dte2507-wireshark-analyse",
  },
  {
    nr: "3",
    tittel: "Transportlaget",
    uker: [36],
    kapitler: [3],
    labber: ["Lab 5 og 6: Wireshark, UDP, TCP"],
    verktoy: ["Wireshark"],
    quizer: [
      {
        navn: "Kontrollspørsmål (modul 3)",
        frist: "2026-09-13",
        poeng: 12,
        krav: 12,
        hva: "Knyttet til laboppgavene.",
      },
      {
        navn: "Modulquiz-Modul 3",
        frist: "2026-09-13",
        klokkeslett: "16:00",
        poeng: 29,
        krav: 24,
        hva: "Hele modulen: UDP, TCP, pålitelig overføring, metningskontroll.",
      },
    ],
    ovingSlug: "dte2507-rdt-progresjon",
  },
  {
    nr: "4",
    tittel: "Nettverkslaget",
    uker: [37, 38],
    kapitler: [4, 5],
    labber: ["Lab 7, 8 og 9: GNS3", "Praktisk lab (2), campus Narvik"],
    verktoy: ["GNS3", "Cisco IOS"],
    quizer: [
      {
        navn: "Kontrollspørsmål — Dijkstras (modul 4)",
        frist: "2026-09-20",
        poeng: 1,
        krav: 0.9,
        hva: "Korteste vei i en graf.",
      },
      {
        navn: "Modulquiz-Modul 4",
        frist: "2026-09-27",
        poeng: 20,
        krav: 18,
        hva: "Hele modulen: IP, subnetting, ruting, rutere innvendig.",
      },
    ],
    ovingSlug: "dte2507-subnetting",
    hull:
      "GNS3 finnes ikke i appen i det hele tatt, og det er tre av modulens labber. Det samme gjelder Cisco IOS-kommandolinja, som GNS3-labbene og den praktiske laben bygger på — Canvas legger ved både et IOS-image og et cheat sheet. Teorien (subnetting, Dijkstra, ruterens innside) er godt dekket.",
  },
  {
    nr: "5",
    tittel: "Datalinklaget",
    uker: [38, 39],
    kapitler: [6],
    labber: ["Lab 10, 11 og 12: ICMP, ARP m.m.", "Praktisk lab (3), campus Narvik"],
    verktoy: ["Wireshark", "arp", "ping"],
    quizer: [
      {
        navn: "Modulquiz-Modul 5",
        frist: "2026-10-04",
        poeng: 15,
        krav: 15,
        hva: "Hele modulen: Ethernet, svitsjer, ARP, feildeteksjon.",
      },
    ],
    ovingSlug: "dte2507-arp-detektiv",
    hull:
      "ICMP er dekket spredt (pakke-dekoding, ruting), men har ingen egen side — og modulen har tre labber på det.",
  },
  {
    nr: "6",
    tittel: "Trådløse nettverk og WiFi",
    uker: [40],
    kapitler: [7],
    labber: ["Lab 13"],
    verktoy: ["Wireshark"],
    quizer: [
      {
        navn: "Modulquiz-Modul 6",
        frist: "2026-10-11",
        poeng: 14,
        krav: 14,
        hva: "Hele modulen: WiFi, CSMA/CA, mobilitet.",
      },
    ],
    ovingSlug: "dte2507-wifi-csma-ca",
  },
];

/**
 * Sikkerhetsdelen av DTE-2507 ligger i et eget Canvas-emne. Vi har ikke lest
 * det ennå — men det er verdt å vite at det finnes, og når det går, så ikke
 * halve faget ser ut til å mangle fra kalenderen.
 */
export const SIKKERHETSDELEN = {
  uker: [41, 42, 43, 44, 45, 46],
  eksamen: "2026-11-30",
  eksamenKlokkeslett: "13:00",
  merknad:
    "Egen Canvas-side, ikke lest ennå. Har egne obligatoriske arbeidskrav som kommer i tillegg til de tre obligene i datakomm-delen.",
};

/* ----------------------------------------------------------------- hjelpere */

/** Alle quizer på tvers av modulene, sortert på frist. */
export function alleQuizer(): { modul: Dte2507Modul; quiz: Quiz }[] {
  return MODULER_2507.flatMap((modul) => modul.quizer.map((quiz) => ({ modul, quiz }))).sort(
    (a, b) => a.quiz.frist.localeCompare(b.quiz.frist),
  );
}

/**
 * Andelen av poengsummen som kreves. 1 betyr at ett feil svar stryker deg.
 * Skilt ut som funksjon fordi det er tallet man vil sortere og advare på.
 */
export function kravAndel(quiz: Quiz): number {
  return quiz.krav / quiz.poeng;
}

/** Quizer som krever full pott. Det er de fleste av dem. */
export function kreverAlt(): { modul: Dte2507Modul; quiz: Quiz }[] {
  return alleQuizer().filter(({ quiz }) => kravAndel(quiz) >= 1);
}

/** Modulen som undervises i en gitt uke. */
export function modulForUke(uke: number): Dte2507Modul | undefined {
  return MODULER_2507.find((m) => m.uker.includes(uke));
}
