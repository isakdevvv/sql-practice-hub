/**
 * DTE-2507 · Lag 0 «Konseptuelt skjelett» — all regne- og protokoll-logikk.
 *
 * Ligger med vilje UTENFOR React, etter mønsteret fra
 * `src/lib/dte2602/spamSimulering.ts`: da kan hvert eneste tall på siden
 * etterprøves uten å rendre en komponent, og oppgavene kan skrives mot en
 * måltilstand i stedet for mot en tekststreng (PLAN-HOST26-MODULER.md §3.1).
 *
 * Sjekkene er tre-verdige — `riktig` / `nesten` / `feil` — der «nesten»
 * forklarer nøyaktig hva som manglet. Mønsteret er hentet fra
 * `src/lib/dte2505/hjelpesystemerEngine.ts` og `src/lib/tek1501/oppgaveSjekk.ts`.
 *
 * Forkortelser skrives ut første gang de brukes, i tråd med designkravet.
 */

// ===========================================================================
// 1. Protokollstakken som data
// ===========================================================================

export type LagId = "applikasjon" | "transport" | "nettverk" | "lenke" | "fysisk";

export interface StakkLag {
  id: LagId;
  /** Lagnummer nedenfra i TCP/IP-modellen: fysisk = 1, applikasjon = 5. */
  nivaa: 1 | 2 | 3 | 4 | 5;
  navn: string;
  /**
   * Navnet på dataenheten laget jobber med. Fagbegrepet er PDU
   * (Protocol Data Unit — protokollens dataenhet).
   */
  enhet: string;
  /** Hva laget lover laget over. Én setning. */
  jobb: string;
  /** Adressetypen laget bruker for å peke ut mottakeren. */
  adresse: string;
  /** Eksempel på en slik adresse. */
  adresseEksempel: string;
  /**
   * Sant hvis adressen byttes ut ved hvert hopp gjennom nettet.
   * Dette er hele poenget med lag 0 — og det studentene oftest bommer på.
   */
  adresseByttesPerHopp: boolean;
  /** Typiske protokoller på laget, med forkortelsene skrevet ut. */
  protokoller: string[];
}

export const STAKK: StakkLag[] = [
  {
    id: "applikasjon",
    nivaa: 5,
    navn: "Applikasjonslaget",
    enhet: "melding",
    jobb: "Gir programmet et språk å snakke med et annet program i.",
    adresse: "navn eller adresse mennesker leser",
    adresseEksempel: "www.uit.no",
    adresseByttesPerHopp: false,
    protokoller: [
      "HTTP (HyperText Transfer Protocol)",
      "DNS (Domain Name System)",
      "SMTP (Simple Mail Transfer Protocol)",
    ],
  },
  {
    id: "transport",
    nivaa: 4,
    navn: "Transportlaget",
    enhet: "segment (TCP) eller datagram (UDP)",
    jobb: "Leverer til riktig program på maskinen — og for TCP også i riktig rekkefølge, uten tap.",
    adresse: "portnummer",
    adresseEksempel: "443",
    adresseByttesPerHopp: false,
    protokoller: [
      "TCP (Transmission Control Protocol)",
      "UDP (User Datagram Protocol)",
    ],
  },
  {
    id: "nettverk",
    nivaa: 3,
    navn: "Nettverkslaget",
    enhet: "pakke (også kalt datagram)",
    jobb: "Finner en vei helt fram til riktig maskin, uansett hvor mange nett som ligger imellom.",
    adresse: "IP-adresse (Internet Protocol)",
    adresseEksempel: "129.242.4.20",
    adresseByttesPerHopp: false,
    protokoller: [
      "IPv4 (Internet Protocol versjon 4)",
      "IPv6 (Internet Protocol versjon 6)",
      "ICMP (Internet Control Message Protocol)",
    ],
  },
  {
    id: "lenke",
    nivaa: 2,
    navn: "Lenkelaget",
    enhet: "ramme",
    jobb: "Flytter enheten over ÉN lenke — til neste maskin eller ruter, ikke lenger.",
    adresse: "MAC-adresse (Media Access Control)",
    adresseEksempel: "3c:22:fb:0a:19:d4",
    adresseByttesPerHopp: true,
    protokoller: ["Ethernet", "WiFi (IEEE 802.11)", "PPP (Point-to-Point Protocol)"],
  },
  {
    id: "fysisk",
    nivaa: 1,
    navn: "Fysisk lag",
    enhet: "bit",
    jobb: "Gjør bit til noe som kan sendes: spenning, lys eller radiobølger.",
    adresse: "ingen — her finnes ingen mottaker å navngi",
    adresseEksempel: "—",
    adresseByttesPerHopp: false,
    protokoller: ["1000BASE-T (kobber)", "1000BASE-LX (fiber)", "IEEE 802.11 radio"],
  },
];

/** Stakken ovenfra og ned — rekkefølgen data faktisk pakkes inn i. */
export const STAKK_NEDOVER = STAKK; // allerede sortert 5 → 1

/** Slå opp ett lag. */
export function lag(id: LagId): StakkLag {
  const treff = STAKK.find((l) => l.id === id);
  if (!treff) throw new Error(`Ukjent lag: ${id}`);
  return treff;
}

// ===========================================================================
// 2. Innkapsling — de faktiske tallene
// ===========================================================================

/**
 * Headerstørrelser i byte, uten valgfrie felter (opsjoner). Dette er tallene
 * en eksamensoppgave forutsetter at du kan.
 */
export const HEADER_BYTES = {
  /** TCP-header uten opsjoner. */
  tcp: 20,
  /** UDP-header: kildeport, målport, lengde, kontrollsum — 2 byte hver. */
  udp: 8,
  /** IPv4-header uten opsjoner. */
  ipv4: 20,
  /** IPv6-header er fast og har ingen kontrollsum. */
  ipv6: 40,
  /** Ethernet II: 6 byte mål-MAC + 6 byte kilde-MAC + 2 byte EtherType. */
  ethernetHeader: 14,
  /** Ethernet-halen: FCS (Frame Check Sequence) — kontrollsummen bakerst. */
  ethernetHale: 4,
} as const;

/** Standard MTU for Ethernet. MTU = Maximum Transmission Unit. */
export const ETHERNET_MTU = 1500;

export type Transport = "tcp" | "udp";
export type Nettverk = "ipv4" | "ipv6";

export interface InnkapslingSteg {
  lagId: LagId;
  /** Hva laget legger på, i byte. Applikasjonslaget legger på null. */
  headerBytes: number;
  /** Hale-byte laget legger på bak dataene (kun Ethernet har dette). */
  haleBytes: number;
  /** Total størrelse på enheten NÅR dette laget er ferdig. */
  totalBytes: number;
  /** Hva enheten heter etter dette laget. */
  enhet: string;
  /** Hvilken protokoll som ble brukt, skrevet ut. */
  protokoll: string;
}

export interface Innkapsling {
  nyttelastBytes: number;
  steg: InnkapslingSteg[];
  /** Størrelsen på ferdig ramme, klar til å sendes ut på kabelen. */
  rammeBytes: number;
  /** Alt som IKKE er dine data. */
  overheadBytes: number;
  /** Andelen av rammen som er dine data, mellom 0 og 1. */
  effektivitet: number;
  /** Sant hvis nyttelasten er for stor til å få plass i én ramme. */
  overMtu: boolean;
}

/**
 * Kapsler inn `nyttelastBytes` byte applikasjonsdata og returnerer hvert steg.
 *
 * Merk at rekkefølgen er ovenfra og ned: applikasjonen lager meldingen, så
 * legger hvert lag under sin header foran. Ethernet er det eneste laget som
 * legger på noe BAK dataene også.
 */
export function innkapsle(
  nyttelastBytes: number,
  valg: { transport?: Transport; nettverk?: Nettverk; mtu?: number } = {},
): Innkapsling {
  const transport = valg.transport ?? "tcp";
  const nettverk = valg.nettverk ?? "ipv4";
  const mtu = valg.mtu ?? ETHERNET_MTU;

  const nyttelast = Math.max(0, Math.round(nyttelastBytes));
  const steg: InnkapslingSteg[] = [];
  let total = nyttelast;

  steg.push({
    lagId: "applikasjon",
    headerBytes: 0,
    haleBytes: 0,
    totalBytes: total,
    enhet: "melding",
    protokoll: "HTTP (HyperText Transfer Protocol)",
  });

  const transportHeader = HEADER_BYTES[transport];
  total += transportHeader;
  steg.push({
    lagId: "transport",
    headerBytes: transportHeader,
    haleBytes: 0,
    totalBytes: total,
    enhet: transport === "tcp" ? "segment" : "datagram",
    protokoll:
      transport === "tcp"
        ? "TCP (Transmission Control Protocol)"
        : "UDP (User Datagram Protocol)",
  });

  const nettHeader = HEADER_BYTES[nettverk];
  total += nettHeader;
  steg.push({
    lagId: "nettverk",
    headerBytes: nettHeader,
    haleBytes: 0,
    totalBytes: total,
    enhet: "pakke",
    protokoll:
      nettverk === "ipv4"
        ? "IPv4 (Internet Protocol versjon 4)"
        : "IPv6 (Internet Protocol versjon 6)",
  });

  // Alt over lenkelaget må få plass i MTU-en. Det er nettopp derfor MTU
  // defineres som «største NYTTELAST», ikke «største ramme».
  const overMtu = total > mtu;

  const lenkeTotal = total + HEADER_BYTES.ethernetHeader + HEADER_BYTES.ethernetHale;
  steg.push({
    lagId: "lenke",
    headerBytes: HEADER_BYTES.ethernetHeader,
    haleBytes: HEADER_BYTES.ethernetHale,
    totalBytes: lenkeTotal,
    enhet: "ramme",
    protokoll: "Ethernet II",
  });

  steg.push({
    lagId: "fysisk",
    headerBytes: 0,
    haleBytes: 0,
    totalBytes: lenkeTotal,
    enhet: `${lenkeTotal * 8} bit`,
    protokoll: "1000BASE-T (kobber)",
  });

  const overhead = lenkeTotal - nyttelast;
  return {
    nyttelastBytes: nyttelast,
    steg,
    rammeBytes: lenkeTotal,
    overheadBytes: overhead,
    effektivitet: lenkeTotal === 0 ? 0 : nyttelast / lenkeTotal,
    overMtu,
  };
}

// ===========================================================================
// 3. Oppdeling: hvor mange rammer trengs?
// ===========================================================================

export interface Oppdeling {
  filBytes: number;
  mtu: number;
  /**
   * MSS = Maximum Segment Size: hvor mange byte applikasjonsdata som får
   * plass i én ramme etter at transport- og nettverksheaderen er trukket fra.
   */
  mss: number;
  antallRammer: number;
  /** Nyttelast i den siste, som regel ikke fulle, rammen. */
  sisteRammeNyttelast: number;
  /** Alle headere og haler til sammen, over alle rammene. */
  totalOverheadBytes: number;
  /** Sum byte som faktisk går ut på kabelen. */
  totalPaaKabelBytes: number;
  effektivitet: number;
}

/**
 * Regner ut hvor mange Ethernet-rammer en fil krever.
 *
 * Dette er drill-oppgaven fra atom 5 i atom-planen, og den vanligste
 * regneoppgaven på hele lag 0.
 */
export function delOppFil(
  filBytes: number,
  valg: { transport?: Transport; nettverk?: Nettverk; mtu?: number } = {},
): Oppdeling {
  const transport = valg.transport ?? "tcp";
  const nettverk = valg.nettverk ?? "ipv4";
  const mtu = valg.mtu ?? ETHERNET_MTU;

  const mss = mtu - HEADER_BYTES[nettverk] - HEADER_BYTES[transport];
  const fil = Math.max(0, Math.round(filBytes));
  const antall = mss <= 0 ? 0 : Math.ceil(fil / mss);
  const siste = antall === 0 ? 0 : fil - (antall - 1) * mss;

  const perRammeOverhead =
    HEADER_BYTES[transport] +
    HEADER_BYTES[nettverk] +
    HEADER_BYTES.ethernetHeader +
    HEADER_BYTES.ethernetHale;
  const totalOverhead = antall * perRammeOverhead;
  const totalPaaKabel = fil + totalOverhead;

  return {
    filBytes: fil,
    mtu,
    mss,
    antallRammer: antall,
    sisteRammeNyttelast: siste,
    totalOverheadBytes: totalOverhead,
    totalPaaKabelBytes: totalPaaKabel,
    effektivitet: totalPaaKabel === 0 ? 0 : fil / totalPaaKabel,
  };
}

// ===========================================================================
// 4. Adressene hopp for hopp
// ===========================================================================

export interface Hopp {
  /** Kort navn på lenken pakken krysser akkurat nå. */
  beskrivelse: string;
  kildeIp: string;
  maalIp: string;
  kildeMac: string;
  maalMac: string;
  kildePort: number;
  maalPort: number;
}

export interface Sti {
  hopp: Hopp[];
  /** Hva som er likt hele veien — svaret på sjekkpunktet. */
  uendret: string[];
  endret: string[];
}

/**
 * En laptop henter en nettside fra en tjener to rutere unna.
 *
 * Poenget denne funksjonen finnes for: IP-adressene og portnumrene er
 * identiske i alle tre hoppene, mens MAC-adressene byttes helt ut hver gang.
 * Det er derfor MAC-adressen kalles en lenke-lokal adresse.
 */
export function hentSideSti(): Sti {
  const klientIp = "10.0.0.42";
  const tjenerIp = "129.242.4.20";
  const klientPort = 51_314;
  const tjenerPort = 443;

  const macLaptop = "3c:22:fb:0a:19:d4";
  const macRuterA_lan = "ac:1f:6b:22:07:01";
  const macRuterA_wan = "ac:1f:6b:22:07:02";
  const macRuterB_inn = "e4:5f:01:9c:3a:11";
  const macRuterB_ut = "e4:5f:01:9c:3a:12";
  const macTjener = "00:1b:21:9e:44:c7";

  const felles = {
    kildeIp: klientIp,
    maalIp: tjenerIp,
    kildePort: klientPort,
    maalPort: tjenerPort,
  };

  return {
    hopp: [
      {
        beskrivelse: "Laptop → hjemmeruteren (over WiFi)",
        ...felles,
        kildeMac: macLaptop,
        maalMac: macRuterA_lan,
      },
      {
        beskrivelse: "Hjemmeruteren → internettleverandørens ruter",
        ...felles,
        kildeMac: macRuterA_wan,
        maalMac: macRuterB_inn,
      },
      {
        beskrivelse: "Leverandørens ruter → webtjeneren",
        ...felles,
        kildeMac: macRuterB_ut,
        maalMac: macTjener,
      },
    ],
    uendret: [
      "Kilde-IP og mål-IP: de peker på endepunktene, ikke på veien mellom dem",
      "Kildeport og målport: de peker på programmene, som heller ikke endrer seg underveis",
    ],
    endret: [
      "Kilde-MAC og mål-MAC: byttes helt ut i hvert eneste hopp, fordi de bare betyr noe på den ene lenken de brukes på",
      "TTL (Time To Live) i IP-headeren: trekkes ned med én for hver ruter — det er dette som stopper evige løkker",
    ],
  };
}

// ===========================================================================
// 5. Pakke-svitsjing mot krets-svitsjing (atom 2 — var et rent hull)
// ===========================================================================

export interface SvitsjingResultat {
  lenkeMbps: number;
  brukere: number;
  /** Andelen av tiden en bruker faktisk sender. */
  aktivAndel: number;
  /** Hvor mye hver bruker trenger når hen først sender. */
  behovMbps: number;
  /** Krets-svitsjing: fast reservasjon, uansett om du sender eller ikke. */
  kretsKapasitetPerBruker: number;
  kretsMaksBrukere: number;
  /** Pakke-svitsjing: hvor mange som i snitt er aktive samtidig. */
  forventetAktive: number;
  /** Hvor mange som kan være aktive før lenken er full. */
  taalerAktive: number;
  /** Sannsynligheten for at flere enn lenken tåler er aktive samtidig. */
  sannsynlighetOverbelastning: number;
}

/**
 * Kurose sitt klassiske regnestykke, gjort til en funksjon.
 *
 * Krets-svitsjing deler lenken i like store, permanent reserverte biter. Med
 * 1 Mb/s per bruker på en 1 Gb/s-lenke er taket 1000 brukere — også når 900 av
 * dem sitter stille.
 *
 * Pakke-svitsjing deler ingenting på forhånd. Er hver bruker aktiv 10 % av
 * tiden, må det være mer enn 1000 aktive SAMTIDIG før noe går galt, og med
 * binomisk fordeling er det ekstremt usannsynlig lenge etter at
 * krets-svitsjing hadde gitt opp.
 */
export function sammenlignSvitsjing(
  lenkeMbps: number,
  brukere: number,
  aktivAndel: number,
  behovMbps: number,
): SvitsjingResultat {
  const kretsMaks = behovMbps <= 0 ? 0 : Math.floor(lenkeMbps / behovMbps);
  const taaler = behovMbps <= 0 ? 0 : Math.floor(lenkeMbps / behovMbps);
  const forventet = brukere * aktivAndel;

  return {
    lenkeMbps,
    brukere,
    aktivAndel,
    behovMbps,
    kretsKapasitetPerBruker: behovMbps,
    kretsMaksBrukere: kretsMaks,
    forventetAktive: forventet,
    taalerAktive: taaler,
    sannsynlighetOverbelastning: binomialOver(brukere, aktivAndel, taaler),
  };
}

/**
 * P(X > k) for X ~ Binomial(n, p). Summerer nedenfra og trekker fra én,
 * som er stabilt nok for de små n-ene denne modulen bruker.
 */
export function binomialOver(n: number, p: number, k: number): number {
  if (k >= n) return 0;
  if (k < 0) return 1;
  let kum = 0;
  for (let i = 0; i <= k; i++) kum += binomialPmf(n, p, i);
  return Math.max(0, Math.min(1, 1 - kum));
}

export function binomialPmf(n: number, p: number, k: number): number {
  if (k < 0 || k > n) return 0;
  // Logaritmisk for å unngå overflyt når n blir stor.
  const logKoeff = logFakultet(n) - logFakultet(k) - logFakultet(n - k);
  const log = logKoeff + k * Math.log(p) + (n - k) * Math.log(1 - p);
  return Math.exp(log);
}

function logFakultet(n: number): number {
  let sum = 0;
  for (let i = 2; i <= n; i++) sum += Math.log(i);
  return sum;
}

// ===========================================================================
// 6. Tre-verdig sjekk
// ===========================================================================

export type Verdict = "riktig" | "nesten" | "feil";

export interface CheckOutcome {
  verdict: Verdict;
  /** Ved «nesten» skal denne si nøyaktig hva som manglet. */
  message: string;
}

export const ok = (message: string): CheckOutcome => ({ verdict: "riktig", message });
export const nesten = (message: string): CheckOutcome => ({ verdict: "nesten", message });
export const feil = (message: string): CheckOutcome => ({ verdict: "feil", message });

// ===========================================================================
// 7. Oppgavetype 1 — anslå-så-sjekk
// ===========================================================================

export interface AnslagValg {
  id: string;
  label: string;
}

export interface AnslagOppgave {
  id: string;
  /** Oppsettet. Skal kunne leses av noen som ikke har lest modulen ennå. */
  setup: string;
  question: string;
  valg: AnslagValg[];
  riktig: string;
  /** Avsløringen forklarer MEKANISMEN, ikke bare hvem som vant. */
  reveal: string;
  /** Én linje som fester poenget. */
  punch: string;
}

export const ANSLAG_OPPGAVER: AnslagOppgave[] = [
  {
    id: "a1",
    setup:
      "Du sender én enkelt bokstav — 1 byte — til en tjener, over TCP og IPv4 på et Ethernet-nett.",
    question: "Hvor mange byte går faktisk ut på kabelen?",
    valg: [
      { id: "a", label: "1 byte — det er jo alt du ba om å sende" },
      { id: "b", label: "Rundt 20 byte" },
      { id: "c", label: "Rundt 60 byte" },
      { id: "d", label: "Rundt 500 byte" },
    ],
    riktig: "c",
    reveal:
      "Hvert lag legger på sin egen header. TCP legger på 20 byte, IPv4 legger på 20 byte, og Ethernet legger på 14 byte foran pluss 4 byte kontrollsum bak. 1 + 20 + 20 + 14 + 4 = 59 byte. (En ekte Ethernet-ramme fylles dessuten opp til minst 64 byte, men de 59 er tallet regnestykket ditt skal gi.)",
    punch:
      "Overhead er en fast kostnad per ramme, ikke en prosent. Det er derfor små pakker er så dyre og store pakker så effektive.",
  },
  {
    id: "a2",
    setup:
      "En pakke går fra laptopen din, gjennom hjemmeruteren og internettleverandørens ruter, og fram til en webtjener. Tre hopp.",
    question: "Hvilke adresser i pakken er de samme i alle tre hoppene?",
    valg: [
      { id: "a", label: "Både IP-adressene og MAC-adressene — pakken er jo den samme" },
      { id: "b", label: "IP-adressene, men MAC-adressene byttes ut hver gang" },
      { id: "c", label: "MAC-adressene, men IP-adressene byttes ut hver gang" },
      { id: "d", label: "Ingen av dem — alt skrives om i hver ruter" },
    ],
    riktig: "b",
    reveal:
      "IP-adressene peker på endepunktene: hvem som sender og hvem som skal ha det. De må stå urørt hele veien, ellers vet ikke tjeneren hvem den skal svare. MAC-adressen peker derimot på neste maskin på DENNE ene lenken. Den har ingen mening ett hopp lenger fram, så hver ruter skreller av den gamle rammen og lager en ny med to friske MAC-adresser.",
    punch:
      "IP er reisemålet. MAC er neste kryss. Derfor står IP stille mens MAC endrer seg for hvert hopp.",
  },
  {
    id: "a3",
    setup:
      "Én lenke på 1 Gb/s skal deles. Hver bruker trenger 1 Mb/s når hen sender, men sender bare 10 % av tiden.",
    question: "Hvor mange brukere kan lenken betjene?",
    valg: [
      { id: "a", label: "1000 uansett metode — mer kapasitet finnes ikke" },
      { id: "b", label: "1000 med reserverte kretser, men mange tusen med pakke-svitsjing" },
      { id: "c", label: "100 med reserverte kretser, 1000 med pakke-svitsjing" },
      { id: "d", label: "Ubegrenset med begge, køen ordner resten" },
    ],
    riktig: "b",
    reveal:
      "Krets-svitsjing reserverer 1 Mb/s til hver bruker permanent. Da er taket 1000, også når 900 av dem sitter helt stille. Pakke-svitsjing reserverer ingenting: den bryr seg bare om hvor mange som sender SAMTIDIG. Med 3000 brukere som hver er aktive 10 % av tiden er snittet 300 aktive, og sannsynligheten for at mer enn 1000 er aktive i samme øyeblikk er forsvinnende liten.",
    punch:
      "Pakke-svitsjing selger den samme kapasiteten flere ganger, og satser på at ikke alle møter opp samtidig. Det er den satsingen internett er bygget på.",
  },
  {
    id: "a4",
    setup:
      "Du åpner en manual over TCP/IP-modellen og teller lagene. Så åpner du en over OSI-modellen og teller der.",
    question: "Hvorfor er tallene forskjellige — 5 mot 7?",
    valg: [
      { id: "a", label: "OSI-modellen er nyere og har fått flere lag etter hvert" },
      { id: "b", label: "TCP/IP mangler to funksjoner OSI har" },
      {
        id: "c",
        label:
          "Samme funksjoner, ulik gruppering: OSI splitter applikasjonslaget i tre, mens TCP/IP holder dem samlet",
      },
      { id: "d", label: "OSI teller det fysiske laget to ganger, én gang per retning" },
    ],
    riktig: "c",
    reveal:
      "OSI (Open Systems Interconnection) deler det TCP/IP kaller «applikasjonslaget» i tre: applikasjon, presentasjon (formatering og koding) og sesjon (styring av samtalen). Ingen av delene er borte i TCP/IP — de ligger bare inne i selve applikasjonsprotokollen. Nettet vi faktisk bruker er bygget på TCP/IP; OSI er sjargongen fagfeltet snakker i, og derfor sier folk «lag 7» når de mener applikasjonen og «lag 3» når de mener IP.",
    punch:
      "OSI er ordboka, TCP/IP er implementasjonen. Du trenger begge: den ene for å snakke med folk, den andre for å forstå pakkene.",
  },
  {
    id: "a5",
    setup:
      "MTU (Maximum Transmission Unit) på et Ethernet-nett er 1500 byte. Du sender en fil på 12 000 byte over TCP og IPv4.",
    question: "Hvor mange rammer blir det?",
    valg: [
      { id: "a", label: "8 — 12 000 delt på 1500" },
      { id: "b", label: "9" },
      { id: "c", label: "12" },
      { id: "d", label: "1 — TCP sender alt i én strøm" },
    ],
    riktig: "b",
    reveal:
      "Fella er å dele på 1500. MTU er største NYTTELAST lenkelaget vil bære, og både TCP-headeren (20 byte) og IPv4-headeren (20 byte) må få plass innenfor den. Det som er igjen til dine data er 1500 − 20 − 20 = 1460 byte. Det tallet heter MSS (Maximum Segment Size). 12 000 / 1460 = 8,2, altså 9 rammer: åtte fulle og én med 320 byte.",
    punch:
      "MTU er hva lenken bærer. MSS er hva du får sende. Forskjellen er nøyaktig headerne til lagene imellom.",
  },
];

// ===========================================================================
// 8. Oppgavetype 3 — måloppgaver med tilstandssjekk
// ===========================================================================

/**
 * Måltilstanden studenten bygger i pakkebyggeren. Sjekken leser DENNE, ikke
 * en tekststreng: da kan flere riktige veier godtas, og tilbakemeldingen kan
 * peke på nøyaktig det ene feltet som var galt.
 */
export interface PakkeBygg {
  transport: Transport | null;
  maalPort: number | null;
  maalIp: string | null;
  /** Hvilken maskins MAC-adresse rammen adresseres til. */
  maalMacValg: "gateway" | "tjener" | "kringkasting" | null;
  nyttelastBytes: number | null;
}

export const TOM_PAKKE: PakkeBygg = {
  transport: null,
  maalPort: null,
  maalIp: null,
  maalMacValg: null,
  nyttelastBytes: null,
};

export interface MaalOppgave {
  id: string;
  tittel: string;
  /** Situasjonen, formulert som noe studenten vil OPPNÅ. */
  prompt: string;
  /** Hva som teller som løst. Vises i lær-modus og etter fasit. */
  maal: string;
  /** Hvilke felter oppgaven bruker — resten skjules i grensesnittet. */
  felter: (keyof PakkeBygg)[];
  hint: string;
  /** Måltilstand-predikatet. */
  sjekk: (b: PakkeBygg) => CheckOutcome;
  /** Hvorfor dette er verdt å kunne. Vises etter riktig svar. */
  laerdom: string;
}

/** Nettoppsettet måloppgavene spiller seg ut i. */
export const NETT = {
  klientIp: "10.0.0.42",
  klientMac: "3c:22:fb:0a:19:d4",
  gatewayIp: "10.0.0.1",
  gatewayMac: "ac:1f:6b:22:07:01",
  tjenerIp: "129.242.4.20",
  tjenerMac: "00:1b:21:9e:44:c7",
  dnsIp: "10.0.0.1",
  nettMaske: "/24",
} as const;

export const MAAL_OPPGAVER: MaalOppgave[] = [
  {
    id: "m1",
    tittel: "Adresser en HTTPS-forespørsel ut av ditt eget nett",
    prompt: `Laptopen din har adressen ${NETT.klientIp}${NETT.nettMaske}. Du skal hente en side over HTTPS (HTTP over TLS) fra webtjeneren ${NETT.tjenerIp}, som ligger i et helt annet nett. Hjemmeruteren din har ${NETT.gatewayIp}. Bygg rammen som går ut fra laptopen.`,
    maal:
      "Transport = TCP, målport = 443, mål-IP = tjenerens adresse, og mål-MAC = ruterens, ikke tjenerens.",
    felter: ["transport", "maalPort", "maalIp", "maalMacValg"],
    hint: "MAC-adressen gjelder bare på din egen lenke. Hvem er den nærmeste maskinen som kan bringe pakken videre?",
    sjekk: (b) => {
      if (!b.transport || !b.maalPort || !b.maalIp || !b.maalMacValg)
        return feil("Fyll ut alle fire feltene før du sjekker.");

      const ipOk = b.maalIp === NETT.tjenerIp;
      const macOk = b.maalMacValg === "gateway";
      const portOk = b.maalPort === 443;
      const transportOk = b.transport === "tcp";

      if (ipOk && macOk && portOk && transportOk)
        return ok(
          "Riktig, og du unngikk den vanligste fella: mål-IP er tjeneren helt der borte, mens mål-MAC er ruteren én meter unna. De to feltene peker på helt forskjellige maskiner i samme ramme.",
        );

      if (ipOk && portOk && transportOk && b.maalMacValg === "tjener")
        return nesten(
          "Alt annet er riktig — men mål-MAC er tjenerens. Laptopen din har ingen måte å nå den MAC-adressen på: den ligger ikke på ditt lokalnett, og en MAC-adresse rutes aldri videre. Rammen ville blitt kastet av første switch. Bruk ruterens MAC.",
        );

      if (ipOk && portOk && transportOk && b.maalMacValg === "kringkasting")
        return nesten(
          "Nesten. Kringkasting (ff:ff:ff:ff:ff:ff) brukes når du IKKE vet MAC-adressen ennå — det er slik ARP-spørringen sendes. Men her har du allerede fått svaret og vet at ruteren skal ha rammen. Adresser den direkte.",
        );

      if (macOk && portOk && transportOk && b.maalIp === NETT.gatewayIp)
        return nesten(
          "Du har byttet om: mål-MAC er riktig (ruteren), men du satte også mål-IP til ruteren. Da ber du ruteren om å svare selv, i stedet for å sende videre. IP-feltet skal peke på det endelige reisemålet hele veien.",
        );

      if (ipOk && macOk && transportOk && b.maalPort !== 443)
        return nesten(
          `Adresseringen er riktig, men porten er feil. Du valgte ${b.maalPort}. HTTPS lytter fast på 443; 80 er vanlig HTTP uten kryptering.`,
        );

      if (ipOk && macOk && portOk && b.transport === "udp")
        return nesten(
          "Adressene er riktige, men UDP gir ingen forbindelse og ingen garanti for at noe kommer fram i rekkefølge. En nettside over HTTPS forutsetter en TCP-forbindelse under seg.",
        );

      return feil(
        "Ikke helt. Gå gjennom feltene ett lag av gangen ovenfra: hvilken transport, hvilken port, hvilken maskin er reisemålet, og hvem er neste hopp.",
      );
    },
    laerdom:
      "I én og samme ramme peker mål-IP på reisemålet og mål-MAC på neste hopp. Det er hele grunnen til at nettet kan bestå av mange ulike lenketeknologier under den samme IP-adressen.",
  },
  {
    id: "m2",
    tittel: "Slå opp et navn før du kan koble til noe",
    prompt:
      "Før laptopen kan koble til www.uit.no må den finne ut hvilken IP-adresse navnet peker på. Navnetjeneren er hjemmeruteren, på 10.0.0.1. Bygg forespørselen.",
    maal: "Transport = UDP, målport = 53, mål-IP = navnetjeneren, mål-MAC = ruteren.",
    felter: ["transport", "maalPort", "maalIp", "maalMacValg"],
    hint: "Oppslaget er ett lite spørsmål og ett lite svar. Hva koster det å sette opp en TCP-forbindelse for det?",
    sjekk: (b) => {
      if (!b.transport || !b.maalPort || !b.maalIp || !b.maalMacValg)
        return feil("Fyll ut alle fire feltene før du sjekker.");

      const riktigAlt =
        b.transport === "udp" &&
        b.maalPort === 53 &&
        b.maalIp === NETT.dnsIp &&
        b.maalMacValg === "gateway";
      if (riktigAlt)
        return ok(
          "Riktig. DNS-oppslaget er én pakke ut og én inn. Et TCP-håndtrykk ville krevd tre pakker FØR spørsmålet i det hele tatt ble stilt — derfor bruker DNS UDP.",
        );

      if (b.transport === "tcp" && b.maalPort === 53 && b.maalIp === NETT.dnsIp)
        return nesten(
          "Port og adresser er riktige, men transporten er feil. DNS bruker UDP fordi hele utvekslingen er ett spørsmål og ett svar: TCP ville lagt til tre pakker med håndtrykk for å levere én. (DNS bytter til TCP når svaret er for stort til én pakke — men standardvalget er UDP.)",
        );

      if (b.transport === "udp" && b.maalIp === NETT.dnsIp && b.maalPort !== 53)
        return nesten(
          `Riktig transport og riktig tjener, men feil port. Du valgte ${b.maalPort}. DNS lytter på 53.`,
        );

      if (b.transport === "udp" && b.maalPort === 53 && b.maalIp === NETT.tjenerIp)
        return nesten(
          "Du sendte oppslaget til webtjeneren. Men det er jo nettopp adressen dens du ikke vet ennå — det er derfor du spør. Spørsmålet skal til navnetjeneren.",
        );

      return feil(
        "Ikke helt. Et navneoppslag er et lite spørsmål til en navnetjener, ikke et besøk på selve nettstedet.",
      );
    },
    laerdom:
      "Valget mellom TCP og UDP handler om hva utvekslingen koster. Ett spørsmål og ett svar tåler ikke tre pakker med oppstart først.",
  },
  {
    id: "m3",
    tittel: "Regn ut rammene",
    prompt:
      "Du laster opp en fil på 12 000 byte over TCP og IPv4 på et Ethernet-nett med MTU 1500. Hvor mange rammer blir det, og hvor mye data er i den siste?",
    maal: "9 rammer, der den siste bærer 320 byte.",
    felter: ["nyttelastBytes"],
    hint: "Trekk fra headerne FØR du deler. MTU er hva lenken bærer, ikke hva du får sende.",
    sjekk: (b) => {
      const fasit = delOppFil(12_000, { transport: "tcp", nettverk: "ipv4", mtu: 1500 });
      if (b.nyttelastBytes === null) return feil("Skriv inn antall rammer.");
      const svar = b.nyttelastBytes; // feltet gjenbrukes som tallsvar

      if (svar === fasit.antallRammer)
        return ok(
          `Riktig: ${fasit.antallRammer} rammer. MSS er 1500 − 20 − 20 = ${fasit.mss} byte, og 12 000 / ${fasit.mss} = 8,2. Åtte fulle rammer og én med ${fasit.sisteRammeNyttelast} byte.`,
        );

      if (svar === 8)
        return nesten(
          "Du delte 12 000 på 1500 og fikk 8. Men MTU er største nyttelast lenkelaget bærer, og TCP-headeren (20 byte) og IPv4-headeren (20 byte) må inn under den grensen. Det gir 1460 byte til dine data, ikke 1500 — og da holder ikke 8 rammer.",
        );

      if (svar === 9 - 1 || svar === 9 + 1)
        return nesten(
          `Du er ett unna. Sjekk avrundingen: ${fasit.filBytes} / ${fasit.mss} = ${(fasit.filBytes / fasit.mss).toFixed(2)}, og en delvis full ramme må likevel sendes. Rund alltid opp.`,
        );

      if (svar === 12)
        return nesten(
          "Det ser ut som du delte på 1000. Ramma bærer 1460 byte nyttelast, ikke 1000.",
        );

      return feil(
        `${svar} stemmer ikke. Regn slik: MSS = MTU − IP-header − TCP-header, så antall rammer = filstørrelse / MSS, rundet opp.`,
      );
    },
    laerdom:
      "Nesten alle regnefeil på dette temaet er den samme feilen: å dele på MTU i stedet for på MSS. Trekk fra headerne først, alltid.",
  },
  {
    id: "m4",
    tittel: "Fra ramme tilbake til data",
    prompt:
      "Wireshark viser en Ethernet-ramme på 1518 byte. Den bærer IPv4 og TCP, begge uten opsjoner. Hvor mange byte applikasjonsdata er det i den?",
    maal: "1518 − 18 − 20 − 20 = 1460 byte.",
    felter: ["nyttelastBytes"],
    hint: "Skrell av ett lag av gangen, nedenfra. Husk at Ethernet legger på noe bak dataene også.",
    sjekk: (b) => {
      if (b.nyttelastBytes === null) return feil("Skriv inn antall byte.");
      const svar = b.nyttelastBytes;
      if (svar === 1460)
        return ok(
          "Riktig. Ethernet tar 14 byte foran og 4 byte kontrollsum bak = 18. IPv4 tar 20 og TCP tar 20. 1518 − 18 − 40 = 1460 byte, som er nøyaktig MSS for MTU 1500.",
        );
      if (svar === 1464)
        return nesten(
          "Du glemte kontrollsummen bak. Ethernet II legger på 14 byte foran OG 4 byte FCS (Frame Check Sequence) bakerst — til sammen 18, ikke 14.",
        );
      if (svar === 1480)
        return nesten(
          "Du skrellet av Ethernet og IPv4, men glemte TCP-headeren på 20 byte. 1480 er nyttelasten i IP-pakken, ikke i applikasjonsmeldingen.",
        );
      if (svar === 1500)
        return nesten(
          "1500 er MTU, altså hvor mye lenkelaget bærer — det inkluderer IP- og TCP-headeren. Applikasjonsdataene er de 40 byte mindre.",
        );
      return feil(
        "Ikke helt. Skrell lagene av nedenfra: Ethernet 18 byte, IPv4 20 byte, TCP 20 byte.",
      );
    },
    laerdom:
      "Innkapsling går begge veier. Å lese et pakkeopptak er den samme regningen som å bygge pakken, bare baklengs.",
  },
];

// ===========================================================================
// 9. Oppgavetype 4 — feilsøking
// ===========================================================================

export interface FeilsokValg {
  id: string;
  label: string;
  /** Forklaring som vises uansett om alternativet ble valgt eller ikke. */
  hvorfor: string;
  riktig?: boolean;
  /** Hvilket lag denne diagnosen ville plassert feilen i. */
  lag: LagId;
}

export interface FeilsokOppgave {
  id: string;
  tittel: string;
  /** Symptomene, slik en bruker ville beskrevet dem. */
  symptom: string;
  /** Observasjoner fra kommandolinja eller pakkeopptaket. */
  observasjoner: { kommando: string; utdata: string[] }[];
  sporsmal: string;
  valg: FeilsokValg[];
  fiks: { hva: string; forklaring: string };
  lesson: string;
}

export const FEILSOK_OPPGAVER: FeilsokOppgave[] = [
  {
    id: "f1",
    tittel: "Tallene virker, navnene virker ikke",
    symptom:
      "«Nettet er nede.» Nettleseren finner ingen sider, men maskinen sier den er tilkoblet.",
    observasjoner: [
      {
        kommando: "ping 129.242.4.20",
        utdata: [
          "64 bytes from 129.242.4.20: icmp_seq=1 ttl=54 time=21.4 ms",
          "64 bytes from 129.242.4.20: icmp_seq=2 ttl=54 time=20.9 ms",
        ],
      },
      {
        kommando: "ping www.uit.no",
        utdata: ["ping: www.uit.no: Name or service not known"],
      },
    ],
    sporsmal: "Hvilket lag bor feilen i?",
    valg: [
      {
        id: "a",
        lag: "fysisk",
        label: "Fysisk lag — kabelen eller radioforbindelsen er brutt",
        hvorfor:
          "Da hadde det første ping-forsøket også feilet. Bits kommer åpenbart fram og tilbake.",
      },
      {
        id: "b",
        lag: "nettverk",
        label: "Nettverkslaget — ruting eller standardrute mangler",
        hvorfor:
          "Rutingen fungerer: pakken nådde en maskin 54 hopp av TTL-en unna og kom tilbake.",
      },
      {
        id: "c",
        lag: "applikasjon",
        label:
          "Applikasjonslaget — navneoppslaget (DNS) svarer ikke, alt under det virker",
        hvorfor:
          "Riktig. Alt fungerer helt til noe skal oversette et navn til en adresse. DNS er en applikasjonsprotokoll som kjører oppå UDP, ikke en del av IP-laget.",
        riktig: true,
      },
      {
        id: "d",
        lag: "transport",
        label: "Transportlaget — TCP-håndtrykket fullfører ikke",
        hvorfor:
          "Feilmeldingen kommer før noe forsøk på å koble til: navnet ble aldri til en adresse, så ingen TCP-forbindelse ble i det hele tatt påbegynt.",
      },
    ],
    fiks: {
      hva: "Sett en navnetjener som svarer, eller start den lokale igjen.",
      forklaring:
        "«Name or service not known» er navneoppslaget som feiler, ikke nettet. Skille-testen er nettopp den du nettopp gjorde: ping en IP-adresse direkte. Virker den, er lag 1 til 4 friske og feilen bor over dem.",
    },
    lesson:
      "Å pinge en ren IP-adresse deler problemet i to på ett sekund: virker det, er alt fra kabel til IP i orden, og du kan lete oppover i stedet for nedover.",
  },
  {
    id: "f2",
    tittel: "Små overføringer går, store stopper",
    symptom:
      "Innlogging og små forespørsler går fint. Så snart en side har et bilde i seg, henger overføringen og går til slutt i stå.",
    observasjoner: [
      { kommando: "ping -s 100 10.20.0.9", utdata: ["108 bytes from 10.20.0.9: time=3.1 ms"] },
      {
        kommando: "ping -s 1472 10.20.0.9",
        utdata: ["(ingen svar)", "--- 100% packet loss ---"],
      },
      {
        kommando: "ping -M do -s 1472 10.20.0.9",
        utdata: ["ping: local error: message too long, mtu=1400"],
      },
    ],
    sporsmal: "Hva er årsaken?",
    valg: [
      {
        id: "a",
        lag: "lenke",
        label:
          "Et ledd i stien har lavere MTU enn 1500, og pakkene som er større enn den blir kastet",
        hvorfor:
          "Riktig. Siste linje sier det rett ut: mtu=1400. Store pakker med «ikke fragmenter»-flagget satt blir da forkastet, mens små slipper gjennom.",
        riktig: true,
      },
      {
        id: "b",
        lag: "transport",
        label: "TCP-metningskontrollen har krympet vinduet til null",
        hvorfor:
          "Da ville også små overføringer bremset opp, og feilmeldingen ville ikke nevnt MTU.",
      },
      {
        id: "c",
        lag: "applikasjon",
        label: "Webtjeneren har for kort tidsavbrudd på store filer",
        hvorfor:
          "Symptomet gjelder også ping, som aldri er i nærheten av en webtjener.",
      },
      {
        id: "d",
        lag: "nettverk",
        label: "Standardruten peker feil vei",
        hvorfor: "Da ville ingenting kommet fram, heller ikke de små pakkene.",
      },
    ],
    fiks: {
      hva: "Senk MTU-en på grensesnittet til 1400, eller la stien selv oppdage MTU-en (Path MTU Discovery) få lov til å virke.",
      forklaring:
        "Path MTU Discovery bruker ICMP-meldingen «fragmentation needed» for å finne den minste MTU-en i stien. Er ICMP blokkert av en brannmur underveis, forsvinner tilbakemeldingen og du får akkurat dette: små pakker virker, store forsvinner i stillhet.",
    },
    lesson:
      "«Litt data virker, mye data virker ikke» er nesten alltid MTU. Det er også et lærebokeksempel på at feilen bor i et helt annet lag enn symptomet.",
  },
  {
    id: "f3",
    tittel: "Rammen kommer aldri ut av nettet",
    symptom:
      "En kollega har skrudd sammen en klient for hånd. Den når andre maskiner på samme kontor, men ingenting utenfor.",
    observasjoner: [
      {
        kommando: "tcpdump -e -n",
        utdata: [
          "3c:22:fb:0a:19:d4 > 00:1b:21:9e:44:c7, ethertype IPv4",
          "    10.0.0.42.51314 > 129.242.4.20.443: Flags [S], seq 1",
        ],
      },
      {
        kommando: "ip route",
        utdata: ["default via 10.0.0.1 dev eth0", "10.0.0.0/24 dev eth0 scope link"],
      },
    ],
    sporsmal: "Hva er galt i rammen?",
    valg: [
      {
        id: "a",
        lag: "nettverk",
        label: "Mål-IP er feil — den skulle vært ruterens adresse",
        hvorfor:
          "Nei. Mål-IP skal alltid være det endelige reisemålet. Å sette ruterens IP der ville bedt ruteren om å svare selv.",
      },
      {
        id: "b",
        lag: "lenke",
        label:
          "Mål-MAC er webtjenerens. Den ligger ikke på dette lokalnettet, så rammen når aldri lenger enn til nærmeste switch",
        hvorfor:
          "Riktig. Rutetabellen sier at alt utenfor 10.0.0.0/24 skal via 10.0.0.1, og da må rammen adresseres til RUTERENS MAC-adresse — ikke tjenerens.",
        riktig: true,
      },
      {
        id: "c",
        lag: "transport",
        label: "Målporten 443 er feil for en ny forbindelse",
        hvorfor: "443 er riktig port for HTTPS, og SYN-flagget viser en helt normal oppstart.",
      },
      {
        id: "d",
        lag: "applikasjon",
        label: "Klienten mangler et sertifikat",
        hvorfor:
          "Sertifikater kommer først i TLS-håndtrykket, og det starter ikke før TCP-forbindelsen står. Vi er ikke i nærheten ennå.",
      },
    ],
    fiks: {
      hva: "Slå opp MAC-adressen til 10.0.0.1 med ARP, og bruk den som mål-MAC.",
      forklaring:
        "Klienten må først sammenligne mål-IP med sitt eget nett og sin nettmaske. Er målet utenfor, er neste hopp standardruteren — og det er ruterens MAC-adresse som skal i rammen. Tjenerens MAC-adresse er det ingen på dette nettet som kjenner, og den ville uansett vært ubrukelig her.",
    },
    lesson:
      "Feilen så ut som et rutingproblem, men bodde i lenkelaget. Når IP-feltene er riktige og det likevel ikke virker: se på MAC-adressene.",
  },
  {
    id: "f4",
    tittel: "Feil program svarer",
    symptom:
      "En tjenermaskin svarer på forespørslene, men klienten får noe som ikke ligner et websvar i det hele tatt.",
    observasjoner: [
      {
        kommando: "curl http://10.20.0.9:8080/",
        utdata: ["curl: (52) Empty reply from server"],
      },
      {
        kommando: "ss -ltnp",
        utdata: [
          "LISTEN 0 128 0.0.0.0:8080  users:((\"minTjener\",pid=812))",
          "LISTEN 0 128 0.0.0.0:80    users:((\"nginx\",pid=640))",
        ],
      },
    ],
    sporsmal: "Hvilket lag bor feilen i, og hva er den?",
    valg: [
      {
        id: "a",
        lag: "transport",
        label:
          "Transportlaget gjorde jobben sin: portnummeret bestemte hvilket program som fikk pakken, og forespørselen havnet i feil program",
        hvorfor:
          "Riktig. Port 8080 er bundet av «minTjener», ikke av webtjeneren. Transportlaget leverte akkurat dit adressen sa — det er webtjeneren som lytter på 80.",
        riktig: true,
      },
      {
        id: "b",
        lag: "nettverk",
        label: "Pakken ble rutet til feil maskin",
        hvorfor:
          "Nei. Den nådde riktig maskin — det var jo den som svarte, om enn med ingenting.",
      },
      {
        id: "c",
        lag: "lenke",
        label: "Rammen ble skadet underveis og forkastet",
        hvorfor:
          "En skadet ramme forkastes stille av kontrollsummen. Da hadde du fått tidsavbrudd, ikke et svar.",
      },
      {
        id: "d",
        lag: "applikasjon",
        label: "Nettleseren sender feil HTTP-versjon",
        hvorfor:
          "curl fikk tomt svar, ikke en protokollfeil. Programmet i andre enden snakket aldri HTTP i det hele tatt.",
      },
    ],
    fiks: {
      hva: "Bruk port 80, eller flytt webtjeneren til 8080.",
      forklaring:
        "Portnummeret ER adressen på transportlaget. En maskin kan ha mange programmer som lytter, og det er utelukkende portnummeret som avgjør hvilket av dem operativsystemet leverer pakken til.",
    },
    lesson:
      "«Feil svar» er ofte ikke en feil i det hele tatt: alle lag gjorde nøyaktig som de fikk beskjed om. Du adresserte bare feil program.",
  },
];

// ===========================================================================
// 10. Oppgavetype 5 — recall-kort
// ===========================================================================

export type KortTag = "lagene" | "adresser" | "tall" | "begreper";

export interface RecallKort {
  id: string;
  tag: KortTag;
  front: string;
  back: string;
}

export const KORT_TAGGER: { id: KortTag; label: string }[] = [
  { id: "lagene", label: "Lagene" },
  { id: "adresser", label: "Adresser" },
  { id: "tall", label: "Tall og størrelser" },
  { id: "begreper", label: "Begreper" },
];

export const RECALL_KORT: RecallKort[] = [
  {
    id: "sk-lag-1",
    tag: "lagene",
    front: "De fem lagene i TCP/IP-modellen, ovenfra og ned?",
    back: "Applikasjon, transport, nettverk, lenke, fysisk.",
  },
  {
    id: "sk-lag-2",
    tag: "lagene",
    front: "Hva heter dataenheten på hvert lag?",
    back:
      "Applikasjon: melding. Transport: segment (TCP) eller datagram (UDP). Nettverk: pakke. Lenke: ramme. Fysisk: bit. Fellesbetegnelsen er PDU (Protocol Data Unit).",
  },
  {
    id: "sk-lag-3",
    tag: "lagene",
    front: "Hvorfor har OSI-modellen sju lag og TCP/IP-modellen fem?",
    back:
      "Samme funksjoner, ulik gruppering. OSI (Open Systems Interconnection) splitter applikasjonslaget i applikasjon, presentasjon og sesjon. I TCP/IP ligger de to siste inne i selve applikasjonsprotokollen.",
  },
  {
    id: "sk-adr-1",
    tag: "adresser",
    front: "Hvilken adresse hører til hvilket lag?",
    back:
      "Applikasjon: navn (www.uit.no). Transport: portnummer. Nettverk: IP-adresse. Lenke: MAC-adresse (Media Access Control). Fysisk: ingen adresse i det hele tatt.",
  },
  {
    id: "sk-adr-2",
    tag: "adresser",
    front: "Hvilke adresser endrer seg når pakken passerer en ruter?",
    back:
      "MAC-adressene — begge to, både kilde og mål. IP-adressene og portnumrene står urørt hele veien. I tillegg trekkes TTL (Time To Live) ned med én.",
  },
  {
    id: "sk-adr-3",
    tag: "adresser",
    front: "Målet ligger utenfor ditt eget nett. Hvilken MAC-adresse skal i rammen?",
    back:
      "Standardruterens. Mål-IP er fortsatt den endelige mottakeren, men mål-MAC er alltid neste hopp på din egen lenke.",
  },
  {
    id: "sk-tall-1",
    tag: "tall",
    front: "Headerstørrelsene uten opsjoner: TCP, UDP, IPv4, IPv6, Ethernet?",
    back:
      "TCP 20 byte. UDP 8 byte. IPv4 20 byte. IPv6 40 byte (fast). Ethernet II 14 byte foran + 4 byte FCS bak = 18 byte.",
  },
  {
    id: "sk-tall-2",
    tag: "tall",
    front: "MTU er 1500. Hva er MSS for TCP over IPv4 — og hvorfor?",
    back:
      "1460 byte. MTU (Maximum Transmission Unit) er største nyttelast lenkelaget bærer; IPv4-headeren (20) og TCP-headeren (20) må inn under den grensen. 1500 − 40 = 1460 = MSS (Maximum Segment Size).",
  },
  {
    id: "sk-tall-3",
    tag: "tall",
    front: "Hvor mye går ut på kabelen når du sender 1 byte over TCP/IPv4/Ethernet?",
    back:
      "59 byte: 1 + 20 (TCP) + 20 (IPv4) + 14 + 4 (Ethernet). Overhead er fast per ramme, ikke en prosent — derfor er små pakker dyre.",
  },
  {
    id: "sk-beg-1",
    tag: "begreper",
    front: "Hva er en protokoll?",
    back:
      "En avtale om formatet på meldingene som utveksles, og om rekkefølgen de skal komme i — pluss hva som skal skje ved hver melding. Uten den delte avtalen er en bitstrøm meningsløs.",
  },
  {
    id: "sk-beg-2",
    tag: "begreper",
    front: "Hva er innkapsling?",
    back:
      "Hvert lag legger sin egen header foran dataene fra laget over, og behandler alt det fikk som ren nyttelast det ikke skal tolke. Mottakerens tilsvarende lag skreller av nøyaktig den headeren igjen.",
  },
  {
    id: "sk-beg-3",
    tag: "begreper",
    front: "Pakke-svitsjing mot krets-svitsjing — kjerneforskjellen?",
    back:
      "Krets reserverer kapasitet på forhånd og garanterer den, men sløser når du er stille. Pakke reserverer ingenting og deler statistisk: den utnytter at brukere sjelden er aktive samtidig, mot risikoen for kø når de likevel er det.",
  },
  {
    id: "sk-beg-4",
    tag: "begreper",
    front: "Hvorfor gjør lagdeling nettet lettere å endre?",
    back:
      "Fordi hvert lag bare lover noe til laget over og bare bruker noe fra laget under. Du kan bytte WiFi mot fiber uten å røre TCP, og bytte HTTP/1.1 mot HTTP/2 uten å røre IP.",
  },
];
