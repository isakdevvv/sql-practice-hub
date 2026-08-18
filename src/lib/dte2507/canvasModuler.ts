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
  /**
   * Modulen som en LØYPE — sidene i den rekkefølgen de skal tas, ikke bare den
   * ene som ligner mest.
   *
   * Grunnen til at feltet finnes ved siden av `ovingSlug`: appen har hele tiden
   * dekket mer enn én side per modul, men bare én av dem var registrert. Resten
   * var umulig å finne uten å vite hva man lette etter, og ingen av dem hadde en
   * «neste»-knapp. Med denne lista utledes både modulsiden og foten på hver
   * enkelt side av samme kilde — se `src/lib/core/loype.ts`.
   *
   * Rekkefølgen er studierekkefølgen, ikke bokas.
   */
  steg?: ModulSteg[];
  /** Én til to setninger om hva modulen handler om. Vises øverst på modulsiden. */
  ingress?: string;
  /**
   * Hvorfor stegene står i akkurat denne rekkefølgen, når det ikke er
   * selvforklarende. Satt der frister eller pedagogikk overstyrer bokas
   * kapittelrekkefølge — se modul 1 og 4.
   */
  rekkefolgeMerknad?: string;
  /** Hva appen ikke dekker av modulen. */
  hull?: string;
}

/** Ett steg i en modul-løype. */
export interface ModulSteg {
  /** Slug i `src/lib/stack/content`. */
  slug: string;
  /**
   * Tittelen slik den står på siden. Gjentatt her framfor slått opp i
   * sideregisteret, fordi sidene selv rendrer navigasjonen — et oppslag ville
   * gitt importsykelen side → skall → løype → sideregister → side.
   */
  tittel: string;
  /** Én linje om hvorfor steget kommer akkurat her. Vises på modulsiden. */
  hvorfor: string;
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
    ingress:
      "Hva et nett er satt sammen av, hvordan du leser det av på din egen maskin, og hvorfor en pakke bruker den tiden den gjør.",
    rekkefolgeMerknad:
      "Laben ligger som steg 3 fordi den har fagets tidligste frist, ikke fordi den er lettest. Forsinkelse og gjennomstrømning kan tas i ro etterpå.",
    steg: [
      {
        slug: "kurose-kap-1",
        tittel: "Kurose kap. 1 — Internett og nettverks-grunnleggende",
        hvorfor:
          "Fem av modulens elleve læringsmål bor bare her: kjerne mot kant (1.2), pakke- mot linjesvitsjing (1.3), datagram mot virtuell krets, hva en RFC er, og de fysiske mediene. Resten av løypa går dypere i utvalgte deler, men dette er kapitlet Canvas ber deg lese.",
      },
      {
        slug: "dte2507-skjelett",
        tittel: "Protokollstakken, innkapsling og adresser",
        hvorfor:
          "Grunnlaget resten av modulen står på: hvilke lag som finnes, hva hvert lag legger på, og hvilken adresse som hører til hvilket lag. Uten dette er lab 1 bare kommandoer man skriver av.",
      },
      {
        slug: "dte2507-nettverksverktoy",
        tittel: "Nettverksverktøy i terminalen",
        hvorfor:
          "Selve Lab 1. Her leser du de samme adressene av på en ekte maskin — og skiller MAC fra IP, alias fra canonical name, og «svarer ikke» fra «er nede».",
      },
      {
        slug: "dte2507-delay-modell",
        tittel: "De fire forsinkelsene",
        hvorfor:
          "Kap. 1.4, første halvdel: hvorfor en pakke bruker tid. Prosessering, kø, transmisjon og propagering — fire ledd som ofte forveksles, og som eksamen spør om hver gang.",
      },
      {
        slug: "dte2507-bottleneck-throughput",
        tittel: "Flaskehals & throughput",
        hvorfor:
          "Kap. 1.4, andre halvdel: hvorfor en forbindelse er så rask som sitt tregeste ledd — og hvorfor det ikke er samme spørsmål som forsinkelse.",
      },
    ],
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
    ingress:
      "Protokollene du faktisk bruker hver dag: web, DNS og programmene som snakker med dem. Kapittelet med flest poeng på quizen i hele faget.",
    rekkefolgeMerknad:
      "Wireshark først: modulens tre labber bruker det, og resten blir langt mer konkret når du har sett protokollene i en ekte fangst.",
    steg: [
      {
        slug: "dte2507-wireshark-analyse",
        tittel: "Wireshark / pcap-analyse",
        hvorfor:
          "Verktøyet lab 2, 3 og 4 hviler på. Å lese en fangst — filtrere, følge en strøm, finne forespørselen som hører til svaret — er ferdigheten laboppgavene faktisk måler.",
      },
      {
        slug: "dte2507-http2-hol",
        tittel: "HTTP/1.1 vs HTTP/2 — HOL-blokkering",
        hvorfor:
          "Web er det største enkelttemaet i kapittelet. Her ser du hvorfor HTTP/1.1 måtte stå i kø, og nøyaktig hva HTTP/2 gjorde med problemet.",
      },
      {
        slug: "dte2507-web-caching-matte",
        tittel: "Web-caching matematikk",
        hvorfor:
          "Regnestykket Kurose bruker på cache: trafikkintensitet, forsinkelse og treffrate. En av de få oppgavetypene i kapittelet med et tall som fasit — og den kommer på quizen.",
      },
      {
        slug: "dte2507-dns-dyp",
        tittel: "DNS-dyp og DNSSEC",
        hvorfor:
          "Lab 4 er DNS. Du så oppslaget virke i modul 1; her ser du hvorfor det virker — hierarkiet, hvem som svarer hva, og hvor svaret mellomlagres.",
      },
      {
        slug: "dte2507-socket-programmering",
        tittel: "Socket-programmering (TCP/UDP/TLS)",
        hvorfor:
          "Kap. 2.7: applikasjonslaget sett fra programmet som skriver koden. Bind, listen, accept, connect — og hvorfor TCP og UDP krever ulik struktur.",
      },
    ],
    hull:
      "E-post (SMTP, IMAP) og FTP har ingen egne sider, og modulquizen dekker begge. Les dem i Kurose kap. 2.3 og 2.4 ved siden av.",
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
    ingress:
      "Hvordan to maskiner blir enige om at noe faktisk kom fram, over et nett som ikke lover noe som helst. Fagets tyngste kapittel.",
    rekkefolgeMerknad:
      "Den korteste løypa i faget, og den tetteste. Modulquizen her er også den eneste som ikke krever full pott (24 av 29) — emnet vet at kapittelet er tungt.",
    steg: [
      {
        slug: "transportlag",
        tittel: "Transportlag — TCP og UDP",
        hvorfor:
          "Hva transportlaget i det hele tatt gjør: multipleksing på portnumre, og det ene valget alt annet følger av — vil du ha pålitelighet eller vil du ha fart?",
      },
      {
        slug: "dte2507-rdt-progresjon",
        tittel: "rdt 1.0 → 3.0 — bygge pålitelighet steg for steg",
        hvorfor:
          "Kapittelets kjerne, og grunnen til at det er tungt: hver versjon legger til ÉN mekanisme fordi den forrige hadde ett hull. Ser du kjeden, husker du hvorfor TCP ser ut som den gjør.",
      },
      {
        slug: "dte2507-congestion-control",
        tittel: "TCP Congestion Control",
        hvorfor:
          "Det siste laget oppå pålitelighet: hvor fort tør du sende når du ikke vet hva nettet tåler? Slow start, AIMD og sagtannmønsteret som følger av dem.",
      },
    ],
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
    ingress:
      "Adresser, veivalg og maskinene som tar dem: hvordan en pakke finner fram gjennom et nett den aldri har sett før.",
    rekkefolgeMerknad:
      "Fagets lengste løype — to uker, to kapitler. Rekkefølgen er adressering → videresending → ruteberegning → det som får nett til å virke i praksis. Steg 5 (Dijkstra) har sin egen frist 20.09, en uke før modulquizen: ta det tidlig hvis du er presset.",
    steg: [
      {
        slug: "dte2507-subnetting",
        tittel: "Subnetting — del opp nettverket",
        hvorfor:
          "Adressering før alt annet. Maske, nettadresse, kringkastingsadresse og antall verter — regnestykket hele resten av modulen forutsetter at du kan.",
      },
      {
        slug: "dte2507-ruting",
        tittel: "IP-forwarding og ruting",
        hvorfor:
          "Skillet som gir hele kapittelet mening: videresending er hva én ruter gjør med én pakke akkurat nå, ruting er hvordan tabellen den slår opp i ble til.",
      },
      {
        slug: "dte2507-inni-ruter",
        tittel: "Inni en ruter — switch fabric og HOL-blocking",
        hvorfor:
          "Kap. 4.2: hva som fysisk skjer mellom inn- og utport. Her møter du HOL-blokkering igjen, denne gangen i maskinvaren i stedet for i HTTP.",
      },
      {
        slug: "dte2507-packet-scheduling",
        tittel: "Packet scheduling — FIFO, Priority, Round Robin, WFQ",
        hvorfor:
          "Når køen er full, må noen velge hvem som slipper fram. De fire disiplinene, og hva hver av dem gjør med forsinkelsen du regnet på i modul 1.",
      },
      {
        slug: "dte2507-ospf-dijkstra",
        tittel: "OSPF — link-state ruting",
        hvorfor:
          "Dijkstras algoritme, som har sitt EGET kontrollspørsmål med frist 20.09 — en uke før modulquizen. Ta dette steget tidlig hvis du er presset på tid.",
      },
      {
        slug: "dte2507-count-to-infinity",
        tittel: "Count-to-infinity",
        hvorfor:
          "Den andre familien: distansevektor. Og feilen som gjorde at den trengte lapper — nyheten om et brutt samband sprer seg langsommere enn nyheten om en vei.",
      },
      {
        slug: "dte2507-bgp-stige",
        tittel: "BGP-rutevelger-stige",
        hvorfor:
          "Ruting mellom autonome systemer, der politikk slår korteste vei. Stigen viser i hvilken rekkefølge kriteriene faktisk vurderes.",
      },
      {
        slug: "dte2507-dhcp",
        tittel: "DHCP — DORA-prosessen",
        hvorfor:
          "Hvordan maskinen fikk adressen du leste av i modul 1. Fire meldinger, og hvorfor de to første må gå til kringkastingsadressen.",
      },
      {
        slug: "dte2507-nat",
        tittel: "NAT — én offentlig IP, mange private",
        hvorfor:
          "Sluttstykket: hvorfor 10.0.5.37 kan snakke med verden selv om ingen utenfor nettet ditt kan se den adressen. Oversettelsen som gjorde IPv4 holdbar i tjue ekstra år.",
      },
    ],
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
    ingress:
      "Det nederste laget som faktisk flytter bitene: rammer, MAC-adresser, svitsjer og feildeteksjon — og til slutt alle lagene i én hendelse.",
    rekkefolgeMerknad:
      "Slutter med «A Day in the Life» med vilje. Den er siste delkapittel i Kurose kap. 6, og den eneste siden i faget som knytter alle lagene sammen i én forespørsel.",
    steg: [
      {
        slug: "dte2507-arp-detektiv",
        tittel: "ARP-detektiv — postadresse vs. personnummer",
        hvorfor:
          "Broen mellom lagene: du har IP-adressen, men rammen trenger en MAC. Det er nøyaktig det skillet du målte i lab 1 — nå fra den andre siden.",
      },
      {
        slug: "dte2507-paket-dekoding",
        tittel: "Paket-dekoding — fra hex til mening",
        hvorfor:
          "Modulens labber leser ICMP- og ARP-pakker i Wireshark. Her øver du på å ta bytene rå og finne feltgrensene selv, uten at et verktøy har tygget dem for deg.",
      },
      {
        slug: "dte2507-switch-self-learning",
        tittel: "Switchen husker hvem du så snakke",
        hvorfor:
          "Hvorfor en switch ikke trenger konfigurasjon: den lærer av avsenderadressen på det som passerer. Og hva som skjer i det korte øyeblikket den ennå ikke vet.",
      },
      {
        slug: "dte2507-crc-kalkulator",
        tittel: "CRC modulo-2-divisjon",
        hvorfor:
          "Feildeteksjon som håndregning. CRC er en av oppgavetypene som er lett å få full pott på hvis du har gjort den én gang, og umulig hvis du ikke har.",
      },
      {
        slug: "dte2507-aloha-kasino",
        tittel: "ALOHA-kasinoet",
        hvorfor:
          "Mediumtilgang når flere vil sende samtidig: kollisjoner, tilfeldig venting og effektiviteten som følger av dem. Grunnlaget for CSMA/CA i modul 6.",
      },
      {
        slug: "dte2507-day-in-the-life",
        tittel: "A Day in the Life of a Web Page Request",
        hvorfor:
          "Kap. 6.7, og det naturlige sluttpunktet: én enkelt nettsideforespørsel, fra DHCP og ARP til DNS, TCP og HTTP. Alt du har bygget siden modul 1, i én hendelse.",
      },
    ],
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
    ingress:
      "Hva som endrer seg når kabelen forsvinner: du kan ikke lenger høre din egen kollisjon, og hele mediumtilgangen må bygges om.",
    // Løypa er på ett steg, og det er ikke en forglemmelse — appen har bare én
    // side om trådløst. Modulen får likevel en modulside, fordi alternativet er
    // at modul 6 er det eneste stedet i faget uten en vei inn. Se `hull`.
    steg: [
      {
        slug: "dte2507-wifi-csma-ca",
        tittel: "WiFi — CSMA/CA og RTS/CTS",
        hvorfor:
          "Hvorfor trådløst ikke kan bruke kollisjonsdeteksjon slik Ethernet gjør, og hva det tvinger fram: unnvikelse i stedet for deteksjon, og en håndhilsen for de skjulte nodene.",
      },
    ],
    hull:
      "Mobilitet og handover mellom aksesspunkter — den andre halvdelen av modulquizen — har ingen side i appen. Kurose kap. 7.4–7.6 må leses ved siden av.",
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
