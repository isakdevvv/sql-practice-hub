/**
 * DTE-2507 Datakommunikasjon og sikkerhet — den faglige lag-rammen.
 *
 * ADVARSEL, LES DENNE FØR DU ENDRER NOE:
 * Canvas-modulene for DTE-2507 er IKKE lest. Vi kjenner ikke emnets faktiske
 * modulnumre, modultitler, obligatoriske innleveringer eller innleveringsfrister.
 * Derfor finnes ingen av delene i denne filen — og de skal ikke legges inn før
 * noen faktisk har åpnet Canvas og verifisert dem.
 *
 * Bakgrunn: appen hadde tidligere oppdiktet oblig-nummerering og oppdiktede
 * frister i DTE-2505, nettopp fordi noen gjettet på strukturen. Det ble oppdaget
 * og rettet (se `src/lib/dte2505/canvasModuler.ts`, som ER Canvas-verifisert).
 * Vi gjentar ikke den feilen her.
 *
 * Rammen under følger i stedet PENSUMLOGIKKEN: lagene i `plan-dte-2507.md`
 * (Lag 0–8, ~60 atomer), som igjen følger Kurose & Ross bottom-up-rekkefølge
 * bit → ramme → IP → transport → applikasjon → krypto → TLS → angrep → verktøy.
 * Lagene har temanavn, aldri «Modul 3» eller «Oblig 2», fordi vi ikke vet om
 * emnet nummererer noe i det hele tatt.
 *
 * Det ENESTE harde faktumet vi har om dette emnet:
 *   eksamen 30. november 2026, i Bodø.
 */

/** Eksamensdato — det eneste verifiserte faktumet om emnets kalender. */
export const EKSAMEN_ISO = "2026-11-30";
export const EKSAMEN_STED = "Bodø";

/** Hvor godt appen dekker laget. Samme tre-deling som DTE-2505-rammen. */
export type Dekning =
  | "dekket" // Alle atomene i laget har fullverdig interaktivt innhold.
  | "delvis" // Noe finnes, men et navngitt atom mangler.
  | "hull"; // Ingenting bygget — skal vises ærlig, ikke skjules.

/** En lenke til innhold som allerede finnes i appen. */
export interface LagLenke {
  /**
   * `stack` → /stack/<slug>   (leksjoner, mini-kurs og labs)
   * `rute`  → egen rute, full sti oppgitt i `slug`
   */
  type: "stack" | "rute";
  slug: string;
  label: string;
  /** Én linje om hva akkurat denne lenken dekker i laget. */
  dekker: string;
  /** Settes når innholdet ikke er bygget ennå — rendres som «kommer». */
  kommer?: boolean;
}

/** Ett atom fra `plan-dte-2507.md`, med ærlig dekningsstatus. */
export interface Atom {
  /** Atomnummeret i planen — gjør det mulig å spore tilbake. */
  nr: number;
  navn: string;
  status: Dekning;
  /** Kun satt når status ikke er «dekket»: hva som konkret mangler. */
  mangler?: string;
}

export interface Lag {
  /** Ankernavn og React-nøkkel. */
  id: string;
  /** Lagnummeret i atom-planen (0–8). Ikke et modulnummer i emnet. */
  nr: number;
  /** Temanavn. Aldri «Modul N» — vi vet ikke emnets nummerering. */
  tittel: string;
  /** Én setning: hva laget handler om. */
  kortOm: string;
  /**
   * §2 i PLAN-HOST26-MODULER.md: sjekkpunktet laget bygges bakover fra.
   * Formulert som ting du skal klare UTEN hjelp, ikke som temaer du har lest.
   */
  sjekkpunkt: string[];
  dekning: Dekning;
  /** Hva som mangler i laget som helhet. Kun ved «delvis» eller «hull». */
  hull?: string;
  atomer: Atom[];
  lenker: LagLenke[];
}

export const LAG: Lag[] = [
  // ======================================================================= 0
  {
    id: "skjelett",
    nr: 0,
    tittel: "Konseptuelt skjelett",
    kortOm:
      "Grunnbegrepene alt annet henger på: hva en protokoll er, hvorfor nettet er delt i lag, hva innkapsling gjør med dataene dine, og hvilken adresse som gjelder på hvilket lag.",
    sjekkpunkt: [
      "Tegne de fem lagene i TCP/IP-modellen i riktig rekkefølge, og navngi dataenheten hvert lag jobber med",
      "Regne ut hvor mye av en full Ethernet-ramme som faktisk er dine egne data, gitt headerstørrelsene",
      "Si hvilken adresse som endrer seg for hvert hopp gjennom nettet, og hvilken som er den samme hele veien",
      "Forklare hvorfor internett bruker pakke-svitsjing og ikke reserverte kretser — med et regnestykke, ikke bare et slagord",
    ],
    dekning: "dekket",
    atomer: [
      { nr: 1, navn: "Protokoll", status: "dekket" },
      { nr: 2, navn: "Pakke-svitsjing mot krets-svitsjing", status: "dekket" },
      { nr: 3, navn: "Lagdeling og innkapsling", status: "dekket" },
      { nr: 4, navn: "OSI-modellen mot TCP/IP-modellen", status: "dekket" },
    ],
    lenker: [
      {
        type: "stack",
        slug: "dte2507-skjelett",
        label: "Protokollstakken, innkapsling og adresser",
        dekker:
          "Selve laget, bygget med alle fem oppgavetypene: innkapslingssimulator, adresse-sporing hopp for hopp, pakkebygger med måltilstandssjekk og feilsøking.",
      },
      {
        type: "stack",
        slug: "osi-tcpip",
        label: "OSI- og TCP/IP-modellen",
        dekker: "De to lagmodellene side ved side, og hvilke funksjoner som bor hvor.",
      },
      {
        type: "stack",
        slug: "kurose-kap-1",
        label: "Kurose kap. 1 — internett og grunnbegrepene",
        dekker: "Lærebokas eget kapittel: nett-kanten, kjernen, forsinkelser, protokollstakk.",
      },
    ],
  },

  // ======================================================================= 1
  {
    id: "lenkelag",
    nr: 1,
    tittel: "Fysisk lag og lenkelag",
    kortOm:
      "Nederst: bits over en kabel eller luft, gruppert i rammer, med feildeteksjon, MAC-adresser og regler for hvem som får sende når mediet deles.",
    sjekkpunkt: [
      "Regne alle fire forsinkelsesleddene for en gitt lenke, og si hvilket som dominerer",
      "Beregne CRC-resten for gitt datablokk og generatorpolynom, for hånd",
      "Følge en ramme gjennom en switch og forklare hvordan videresendingstabellen ble lært",
      "Forklare hva ARP (Address Resolution Protocol) gjør, og hvorfor svaret kan forfalskes",
    ],
    dekning: "delvis",
    hull:
      "Ethernet-rammen felt for felt (destinasjons-MAC, kilde-MAC, EtherType, FCS) har ingen egen anatomiside, og MTU (Maximum Transmission Unit — største nyttelast en ramme kan bære) er bare berørt i forbifarten. Begge er nå delvis dekket av det konseptuelle skjelettet, men uten en ramme-hex-dump å hovre i.",
    atomer: [
      {
        nr: 5,
        navn: "Bit, ramme og MTU",
        status: "delvis",
        mangler:
          "MTU-skyveknappen fra planen finnes ikke. Skjelett-laget dekker regnestykket, men ikke det fysiske ramme-formatet.",
      },
      { nr: 6, navn: "De fire forsinkelsene", status: "dekket" },
      { nr: 7, navn: "CRC og feilsjekking", status: "dekket" },
      {
        nr: 8,
        navn: "MAC-adresse og Ethernet-rammen",
        status: "delvis",
        mangler:
          "Ingen felt-for-felt-visning av rammen. OUI-delen (Organizationally Unique Identifier — produsentprefikset i en MAC-adresse) er ikke forklart noe sted.",
      },
      { nr: 9, navn: "ALOHA og mediumtilgang (CSMA/CD)", status: "dekket" },
      { nr: 10, navn: "Switch-selvlæring og kollisjonsdomener", status: "dekket" },
      { nr: 11, navn: "ARP — finne MAC-adressen fra IP-adressen", status: "dekket" },
      { nr: 12, navn: "VLAN og 802.1Q-taggen", status: "dekket" },
    ],
    lenker: [
      {
        type: "stack",
        slug: "dte2507-delay-modell",
        label: "De fire forsinkelsene",
        dekker: "Prosessering, kø, transmisjon og propagasjon med skyveknapper for hver term.",
      },
      {
        type: "stack",
        slug: "dte2507-crc-kalkulator",
        label: "CRC — modulo-2-divisjon",
        dekker: "CRC = Cyclic Redundancy Check. Klikk bitene, flipp én hos mottaker, se resten bli ulik null.",
      },
      {
        type: "stack",
        slug: "dte2507-aloha-kasino",
        label: "ALOHA-kasinoet",
        dekker: "Hvorfor throughput kollapser når for mange deler samme medium.",
      },
      {
        type: "stack",
        slug: "dte2507-switch-self-learning",
        label: "Switchen husker hvem du så snakke",
        dekker: "Videresendingstabellen fylles ramme for ramme, foran øynene dine.",
      },
      {
        type: "stack",
        slug: "dte2507-arp-detektiv",
        label: "ARP-detektiv",
        dekker: "IP-til-MAC-oppslaget, ARP-mellomlageret, og hvordan et forfalsket svar ser ut.",
      },
      {
        type: "stack",
        slug: "dte2507-brannmur-vlan",
        label: "Brannmur og VLAN",
        dekker: "VLAN = Virtual Local Area Network. Taggen som lar én switch være flere logiske nett.",
      },
      {
        type: "stack",
        slug: "dte2507-wifi-csma-ca",
        label: "WiFi — CSMA/CA og RTS/CTS",
        dekker: "Mediumtilgang når du ikke kan høre kollisjonen selv, altså trådløst.",
      },
      {
        type: "stack",
        slug: "kurose-kap-6",
        label: "Kurose kap. 6 — lenkelaget og lokalnett",
        dekker: "Lærebokas gjennomgang av feildeteksjon, mediumtilgang, switching og ARP.",
      },
    ],
  },

  // ======================================================================= 2
  {
    id: "nettverkslag",
    nr: 2,
    tittel: "Nettverkslaget — IP og ruting",
    kortOm:
      "Adressene som gjelder hele veien fra avsender til mottaker, og maskineriet som velger hvilken vei pakken tar: subnett, videresendingstabeller, rutingprotokoller og adresseoversetting.",
    sjekkpunkt: [
      "Gjøre om en IP-adresse med prefikslengde til nettverksadresse, kringkastingsadresse og antall brukbare verter",
      "Dele en adresseblokk i ulike-store subnett (VLSM) uten å overlappe eller sløse",
      "Slå opp en destinasjonsadresse i en videresendingstabell med lengste-prefiks-match og velge riktig rad",
      "Forklare forskjellen på lenketilstand og avstandsvektor, og hvorfor den ene kan telle mot uendelig",
    ],
    dekning: "delvis",
    hull:
      "ICMP (Internet Control Message Protocol — kontrollprotokollen bak ping og traceroute) har ingen egen modul; den er bare nevnt inne i ruting-siden og i pcap-scenariene. Det finnes heller ingen bit-for-bit-omgjøring mellom binær og punktdesimal IP-adresse, og IPv6 er ikke dekket interaktivt noe sted.",
    atomer: [
      {
        nr: 13,
        navn: "IPv4-adressen og punktdesimal notasjon",
        status: "delvis",
        mangler: "Ingen bit-veksler som viser 32 bit mot punktdesimal form.",
      },
      { nr: 14, navn: "Subnett, maske og CIDR", status: "dekket" },
      { nr: 15, navn: "VLSM og adresseplan", status: "dekket" },
      { nr: 16, navn: "IPv4-headeren felt for felt", status: "dekket" },
      { nr: 17, navn: "IP-videresending og lengste-prefiks-match", status: "dekket" },
      { nr: 18, navn: "Inni en ruter — innport, utport og kø", status: "dekket" },
      { nr: 19, navn: "Pakkeplanlegging og rettferdighet", status: "dekket" },
      { nr: 20, navn: "Ruting innad i et AS — lenketilstand mot avstandsvektor", status: "dekket" },
      { nr: 21, navn: "Count-to-infinity-problemet", status: "dekket" },
      { nr: 22, navn: "Ruting mellom AS med BGP", status: "dekket" },
      { nr: 23, navn: "NAT — adresseoversetting", status: "dekket" },
      {
        nr: 24,
        navn: "ICMP — diagnoseprotokollen",
        status: "delvis",
        mangler:
          "Ingen traceroute-simulator som viser TTL 1, 2, 3 og de tilhørende «time exceeded»-svarene.",
      },
    ],
    lenker: [
      {
        type: "stack",
        slug: "dte2507-subnetting",
        label: "Subnetting — del opp nettverket",
        dekker: "Prefikslengde, maske, nettverks- og kringkastingsadresse, antall verter.",
      },
      {
        type: "stack",
        slug: "dte2507-paket-dekoding",
        label: "Paket-dekoding — fra hex til mening",
        dekker: "IPv4-headeren felt for felt i en ekte heksadesimal utskrift.",
      },
      {
        type: "stack",
        slug: "dte2507-ruting",
        label: "IP-videresending og ruting",
        dekker: "Lengste-prefiks-match, videresendingstabeller, og rutingprotokollene i oversikt.",
      },
      {
        type: "stack",
        slug: "dte2507-ospf-dijkstra",
        label: "OSPF — lenketilstandsruting",
        dekker: "Dijkstras algoritme steg for steg på en liten topologi.",
      },
      {
        type: "stack",
        slug: "dte2507-count-to-infinity",
        label: "Count-to-infinity",
        dekker: "Hvorfor avstandsvektor konvergerer sakte, og hva split horizon fikser.",
      },
      {
        type: "stack",
        slug: "dte2507-bgp-stige",
        label: "BGP-rutevelgerstigen",
        dekker: "BGP = Border Gateway Protocol. Rekkefølgen preferansene brukes i når en rute velges.",
      },
      {
        type: "stack",
        slug: "dte2507-inni-ruter",
        label: "Inni en ruter",
        dekker: "Svitsjematrise, køer og head-of-line-blokkering.",
      },
      {
        type: "stack",
        slug: "dte2507-packet-scheduling",
        label: "Pakkeplanlegging",
        dekker: "FIFO, prioritetskø, round robin og WFQ (Weighted Fair Queueing) sammenlignet.",
      },
      {
        type: "stack",
        slug: "dte2507-nat",
        label: "NAT — én offentlig adresse, mange private",
        dekker: "NAT = Network Address Translation. Oversettingstabellen inn og ut.",
      },
      {
        type: "stack",
        slug: "kurose-kap-4",
        label: "Kurose kap. 4 — nettverkslaget, dataplanet",
        dekker: "Videresending, ruterarkitektur, IP-adressering og NAT i læreboka.",
      },
      {
        type: "stack",
        slug: "kurose-kap-5",
        label: "Kurose kap. 5 — nettverkslaget, kontrollplanet",
        dekker: "OSPF, BGP, SDN og ICMP i læreboka.",
      },
    ],
  },

  // ======================================================================= 3
  {
    id: "transport",
    nr: 3,
    tittel: "Transportlaget — TCP og UDP",
    kortOm:
      "Fra «pakken kom fram til maskinen» til «byten kom fram til riktig program, i riktig rekkefølge, uten å drukne mottakeren eller nettet».",
    sjekkpunkt: [
      "Forklare hva en socket er, og hvorfor to samtidige forbindelser kan bruke samme serverport",
      "Tegne trestegs-håndtrykket og firestegs-avslutningen, og begrunne hvorfor det er tre og fire",
      "Bygge pålitelig overføring trinnvis: hva kontrollsum, sekvensnummer og tidsur hver for seg løser",
      "Tegne cwnd-sagtanna gjennom slow start og AIMD, og regne ut vindusstørrelsen etter N rundeturer",
    ],
    dekning: "delvis",
    hull:
      "Pipelining med Go-Back-N og Selective Repeat har ingen egen interaktiv modul — det er bare tekst inne i Kurose kapittel 3. Merk også: atom-planen påstår at `dte2507-ap-progresjon` dekker dette. Det stemmer ikke; den siden handler om autentiseringsprotokollene ap 1.0–4.0 og hører hjemme i kryptografi-laget. Flytkontroll (rwnd — mottakerens annonserte ledige buffer) er også bare delvis dekket.",
    atomer: [
      { nr: 25, navn: "Port og socket-abstraksjonen", status: "dekket" },
      { nr: 26, navn: "UDP — transport uten garantier", status: "dekket" },
      { nr: 27, navn: "TCP-håndtrykket i tre steg", status: "dekket" },
      { nr: 28, navn: "TCP-avslutning i fire steg", status: "dekket" },
      { nr: 29, navn: "Pålitelig dataoverføring rdt 1.0 → 3.0", status: "dekket" },
      {
        nr: 30,
        navn: "Pipelining, Go-Back-N og Selective Repeat",
        status: "hull",
        mangler:
          "Ingen simulator med vindu, tapt pakke og sammenligning av de to strategiene. Kun tekstbehandling i Kurose kap. 3.",
      },
      {
        nr: 31,
        navn: "Flytkontroll (rwnd)",
        status: "delvis",
        mangler: "Ingen visning der lesehastigheten senkes og det annonserte vinduet krymper.",
      },
      { nr: 32, navn: "Metningskontroll — slow start og AIMD", status: "dekket" },
      { nr: 33, navn: "Flaskehals og gjennomstrømning", status: "dekket" },
    ],
    lenker: [
      {
        type: "stack",
        slug: "transportlag",
        label: "Transportlag — TCP og UDP",
        dekker: "Porter, håndtrykk, avslutning, og hva de to protokollene lover hver for seg.",
      },
      {
        type: "stack",
        slug: "dte2507-rdt-progresjon",
        label: "rdt 1.0 → 3.0",
        dekker: "rdt = reliable data transfer. Bygg pålitelighet ett problem av gangen.",
      },
      {
        type: "stack",
        slug: "dte2507-congestion-control",
        label: "TCP-metningskontroll",
        dekker: "Slow start, AIMD og sagtannkurven med klikkbart pakketap.",
      },
      {
        type: "stack",
        slug: "dte2507-bottleneck-throughput",
        label: "Flaskehals og gjennomstrømning",
        dekker: "Hvorfor den tregeste lenken i stien bestemmer alt.",
      },
      {
        type: "stack",
        slug: "dte2507-socket-programmering",
        label: "Socket-programmering",
        dekker: "Programmeringssiden av transportlaget: bind, listen, connect, send, recv.",
      },
      {
        type: "stack",
        slug: "kurose-kap-3",
        label: "Kurose kap. 3 — transportlaget",
        dekker: "Lærebokas kapittel, inkludert Go-Back-N og Selective Repeat i tekst.",
      },
    ],
  },

  // ======================================================================= 4
  {
    id: "applikasjon",
    nr: 4,
    tittel: "Applikasjonslaget",
    kortOm:
      "Protokollene du faktisk møter: nettsider, navneoppslag, adressetildeling — og hele kjeden som må klaffe for at ett museklikk skal bli en ferdig side.",
    sjekkpunkt: [
      "Skrive en rå HTTP-forespørsel for hånd og lese svaret, statuslinje og headere",
      "Følge et DNS-oppslag fra rot-tjener til autoritativ tjener, og si hva som mellomlagres hvor",
      "Regne ut gjennomsnittlig aksesstid for en mellomtjener gitt trefferate",
      "Telle rundeturene fra strøm-på til første byte HTML, gjennom DHCP, ARP, DNS, TCP og HTTP",
    ],
    dekning: "delvis",
    hull:
      "HTTP (HyperText Transfer Protocol) har ingen egen forespørsel-og-svar-modul: statuskodene, headerne og forskjellen på vedvarende og ikke-vedvarende forbindelse er spredt i andre sider. HTTP/2-modulen forutsetter at du allerede kan HTTP/1.1.",
    atomer: [
      {
        nr: 34,
        navn: "HTTP-forespørsel og svar, og statuskodene",
        status: "delvis",
        mangler:
          "Ingen side der du skriver en rå forespørsel og ser svaret. Statuskodene (301 mot 302, 401 mot 403) er ikke drillet noe sted.",
      },
      {
        nr: 35,
        navn: "Vedvarende forbindelse og pipelining i HTTP/1.1",
        status: "delvis",
        mangler: "Ingen bryter som viser rundeturbesparelsen ved gjenbruk av forbindelsen.",
      },
      { nr: 36, navn: "HTTP/2-multipleksing og head-of-line-blokkering", status: "dekket" },
      { nr: 37, navn: "Mellomlagring på web — trefferate og aksesstid", status: "dekket" },
      { nr: 38, navn: "DNS-hierarkiet, rekursive og iterative oppslag", status: "dekket" },
      { nr: 39, navn: "DHCP-prosessen (DORA)", status: "dekket" },
      { nr: 40, navn: "En dag i livet til en sideforespørsel", status: "dekket" },
    ],
    lenker: [
      {
        type: "stack",
        slug: "dte2507-dns-dyp",
        label: "DNS i dybden",
        dekker: "DNS = Domain Name System. Rot, toppdomene, autoritativ tjener og mellomlagring.",
      },
      {
        type: "stack",
        slug: "dte2507-dhcp",
        label: "DHCP — DORA-prosessen",
        dekker: "DHCP = Dynamic Host Configuration Protocol. Discover, Offer, Request, Ack.",
      },
      {
        type: "stack",
        slug: "dte2507-http2-hol",
        label: "HTTP/1.1 mot HTTP/2 — head-of-line-blokkering",
        dekker: "Multipleksing av strømmer, og hvilket lags blokkering som blir igjen.",
      },
      {
        type: "stack",
        slug: "dte2507-web-caching-matte",
        label: "Mellomlagring på web — regnestykket",
        dekker: "Gjennomsnittlig aksesstid som funksjon av trefferaten.",
      },
      {
        type: "stack",
        slug: "dte2507-day-in-the-life",
        label: "En dag i livet til en nettside",
        dekker: "Hele kjeden DHCP → ARP → DNS → TCP → TLS → HTTP, steg for steg.",
      },
      {
        type: "stack",
        slug: "kurose-kap-2",
        label: "Kurose kap. 2 — applikasjonslaget",
        dekker: "HTTP, e-post, DNS og fildeling i læreboka.",
      },
    ],
  },

  // ======================================================================= 5
  {
    id: "krypto",
    nr: 5,
    tittel: "Kryptografi-primitivene",
    kortOm:
      "Byggeklossene sikkerhet lages av: symmetriske og asymmetriske nøkler, blokkchiffer, hashfunksjoner, meldingsautentisering, signaturer og sertifikater.",
    sjekkpunkt: [
      "Si hvilken primitiv som løser hvilket problem: hemmelighold, integritet, autentisering, uavviselighet",
      "Kryptere og dekryptere med RSA for hånd på små tall",
      "Forklare hvorfor en ren hash ikke autentiserer noe, og hva en delt nøkkel tilfører",
      "Følge tillitskjeden fra et nettstedssertifikat opp til en rotinstans",
    ],
    dekning: "delvis",
    hull:
      "Digital signatur og sertifikatkjeden (X.509, PKI — Public Key Infrastructure) er forklart i tekst, men uten en klikkbar kjede fra bladsertifikat via mellominstans til rot. Det er nettopp den kjeden TLS-laget forutsetter at du kan.",
    atomer: [
      { nr: 41, navn: "Symmetrisk mot asymmetrisk kryptering", status: "dekket" },
      { nr: 42, navn: "Blokkchiffer og CBC-modus", status: "dekket" },
      { nr: 43, navn: "Hashfunksjon og preimage-motstand", status: "dekket" },
      { nr: 44, navn: "MAC og HMAC — meldingsautentisering", status: "dekket" },
      { nr: 45, navn: "RSA — nøkkelgenerering, kryptering, dekryptering", status: "dekket" },
      {
        nr: 46,
        navn: "Digital signatur",
        status: "delvis",
        mangler: "Ingen side der du signerer, endrer én bokstav og ser verifiseringen feile.",
      },
      {
        nr: 47,
        navn: "Sertifikat og tillitskjeden i PKI",
        status: "delvis",
        mangler: "Ingen klikkbar kjede blad → mellominstans → rot, og ingen selvsignert-mot-CA-signert-sammenligning.",
      },
    ],
    lenker: [
      {
        type: "stack",
        slug: "kryptografi",
        label: "Kryptografi-grunnlag",
        dekker: "Symmetrisk mot asymmetrisk, hash, og hvorfor hybride løsninger alltid vinner.",
      },
      {
        type: "stack",
        slug: "dte2507-cbc-iv",
        label: "CBC og hvorfor like blokker er farlige",
        dekker: "CBC = Cipher Block Chaining. IV = initialiseringsvektor, og hva som skjer når den er forutsigbar.",
      },
      {
        type: "stack",
        slug: "dte2507-fra-checksum-til-hmac",
        label: "Fra kontrollsum til HMAC",
        dekker: "HMAC = Hash-based Message Authentication Code. Hvorfor hash alene ikke holder.",
      },
      {
        type: "stack",
        slug: "dte2507-rsa-mini",
        label: "RSA — bygg en minimal versjon",
        dekker: "Nøkkelgenerering og kryptering på små tall du kan regne selv.",
      },
      {
        type: "stack",
        slug: "dte2507-ap-progresjon",
        label: "ap 1.0 → 4.0 — autentisering steg for steg",
        dekker:
          "Kurose sin klassiske progresjon der hver autentiseringsprotokoll brytes til nonce-varianten står igjen.",
      },
      {
        type: "stack",
        slug: "kurose-kap-8",
        label: "Kurose kap. 8 — sikkerhet i nettverk",
        dekker: "Primitivene, protokollene og angrepene samlet i lærebokas kapittel.",
      },
    ],
  },

  // ======================================================================= 6
  {
    id: "tls",
    nr: 6,
    tittel: "TLS — primitivene satt sammen",
    kortOm:
      "Der kryptografien møter transportlaget: håndtrykket som forhandler nøkler over en usikret kanal, og hva versjon 1.3 forenklet.",
    sjekkpunkt: [
      "Gå gjennom TLS 1.2-håndtrykket melding for melding og si hvilke som er asymmetriske og hvilke symmetriske",
      "Forklare hva forward secrecy betyr, og hvorfor TLS 1.3 fjernet RSA-nøkkelutveksling for å få det",
      "Peke på hvor i håndtrykket et forfalsket sertifikat ville blitt oppdaget",
    ],
    dekning: "dekket",
    atomer: [
      { nr: 48, navn: "TLS 1.2-håndtrykket og hovednøklene", status: "dekket" },
      { nr: 49, navn: "TLS 1.3-forenklingen og forward secrecy", status: "dekket" },
    ],
    lenker: [
      {
        type: "stack",
        slug: "tls",
        label: "TLS-håndtrykket",
        dekker: "TLS = Transport Layer Security. Meldingsrekkefølgen og hva hver melding utretter.",
      },
      {
        type: "stack",
        slug: "dte2507-tls-handshake",
        label: "Fra https:// til kryptert kanal",
        dekker: "Hele veien fra adressefeltet til en ferdig forhandlet symmetrisk nøkkel.",
      },
      {
        type: "stack",
        slug: "dte2507-tls-handshake-lab",
        label: "TLS-håndtrykk — animator med mellommann-modus",
        dekker: "Sett en angriper i midten og se nøyaktig hvilket steg som avslører hen.",
      },
    ],
  },

  // ======================================================================= 7
  {
    id: "angrep",
    nr: 7,
    tittel: "Angrep og forsvar",
    kortOm:
      "Hva som går galt når protokollene i lagene over møter noen som ikke følger reglene — og hvilke forsvar som faktisk hjelper mot hva.",
    sjekkpunkt: [
      "Kjenne igjen avlytting, ARP-forfalskning, DNS-forgiftning, portskanning og SYN-flom fra et pakkeopptak",
      "Si hvilket lag hvert angrep utnytter, og hvilket forsvar som hører til",
      "Skille en tilstandsløs fra en tilstandsfull brannmur på hva regelsettet må inneholde",
      "Lese en IDS-signatur og si hva den ville matchet — og hva den ville bommet på",
    ],
    dekning: "dekket",
    atomer: [
      { nr: 50, navn: "Avlytting og faren ved klartekst", status: "dekket" },
      { nr: 51, navn: "ARP-forfalskning og mellommannsangrep", status: "dekket" },
      { nr: 52, navn: "DNS-forfalskning og forgiftet mellomlager", status: "dekket" },
      { nr: 53, navn: "Portskanning (SYN-stealth)", status: "dekket" },
      { nr: 54, navn: "SYN-flom (tjenestenekt)", status: "dekket" },
      { nr: 55, navn: "Brannmur — tilstandsløs mot tilstandsfull", status: "dekket" },
      { nr: 56, navn: "DMZ og lagdelt forsvar", status: "dekket" },
      { nr: 57, navn: "IDS og IPS — signaturbasert deteksjon", status: "dekket" },
    ],
    lenker: [
      {
        type: "stack",
        slug: "nettverkssikkerhet",
        label: "Nettverkssikkerhet — brannmur, IDS, angrep",
        dekker: "Oversikten over angrepsklassene og forsvarene som svarer på dem.",
      },
      {
        type: "stack",
        slug: "dte2507-stateful-firewall",
        label: "Tilstandsfull mot tilstandsløs brannmur",
        dekker: "Hvorfor tilstandsløse regelsett må åpne høye porter for returtrafikk.",
      },
      {
        type: "stack",
        slug: "dte2507-brannmur-pakkeflyt",
        label: "Brannmur — pakkeflyt og regelmatching",
        dekker: "Pakken gjennom regelkjeden, regel for regel, til den treffer.",
      },
      {
        type: "stack",
        slug: "dte2507-ids-snort",
        label: "IDS: signatur mot anomali, og DMZ",
        dekker: "IDS = Intrusion Detection System. DMZ = demilitarisert sone.",
      },
      {
        type: "rute",
        slug: "/dte2507/pcap",
        label: "Pcap-quiz — 15 scenarier",
        dekker: "Ekte pakkeopptak av angrepene: kjenn igjen mønsteret uten fasit på forhånd.",
      },
    ],
  },

  // ======================================================================= 8
  {
    id: "verktoy",
    nr: 8,
    tittel: "Verktøy og helhetlig praksis",
    kortOm:
      "Å faktisk gjøre det: analysere et opptak i Wireshark, skrive kode som snakker over nettet, og feilsøke når problemet kan bo i hvilket som helst lag.",
    sjekkpunkt: [
      "Skrive et visningsfilter som isolerer én forbindelse i et opptak, og følge strømmen",
      "Skrive en TCP-klient og en TCP-tjener som utveksler data, og forklare hvert kall i rekkefølge",
      "Ta et symptom («siden laster i nettleseren, men curl feiler med sertifikatfeil») og systematisk finne laget feilen bor i",
    ],
    dekning: "delvis",
    hull:
      "Å legge TLS oppå en eksisterende socket er bare delvis dekket. Og det viktigste: integrasjonsoppgavene fra §3.2 i modulplanen — symptomer som ikke kan løses med ett lag alene — finnes ikke ennå for dette faget. Feilsøkingsdelen i det konseptuelle skjelettet er en start, ikke hele jobben.",
    atomer: [
      { nr: 58, navn: "Wireshark — opptak, filter og følg strømmen", status: "dekket" },
      { nr: 59, navn: "Socket-programmering — TCP-klient og -tjener", status: "dekket" },
      {
        nr: 60,
        navn: "Å pakke en socket inn i TLS",
        status: "delvis",
        mangler: "Ingen side som viser opptaket før og etter innpakkingen, side ved side.",
      },
    ],
    lenker: [
      {
        type: "stack",
        slug: "dte2507-wireshark-analyse",
        label: "Wireshark- og pcap-analyse",
        dekker: "Opptaksfilter mot visningsfilter, og hvordan du følger én samtale.",
      },
      {
        type: "rute",
        slug: "/dte2507/pcap",
        label: "Pcap-quiz — 15 scenarier",
        dekker: "Trening på å lese et opptak uten å vite svaret på forhånd.",
      },
      {
        type: "stack",
        slug: "dte2507-socket-programmering",
        label: "Socket-programmering (TCP, UDP, TLS)",
        dekker: "Python-øvelser som kjører i nettleseren: bind, listen, accept, connect, send, recv.",
      },
      {
        type: "stack",
        slug: "dte2507-praksis",
        label: "Paket-tolker — 5 scenarier",
        dekker: "Tolk pakkene og trekk konklusjonen, slik eksamensoppgavene er formulert.",
      },
      {
        type: "stack",
        slug: "kurose-kurs",
        label: "Kurose-kurset — alle ni kapitler",
        dekker: "Lærebokas egen progresjon, hvis du heller vil følge kapitlene enn lagene.",
      },
    ],
  },
];

/* ----------------------------------------------------------------- hjelpere */

/** Alle stack-slugs i et lag — det framdriften telles over. */
export function stackSlugsFor(lag: Lag): string[] {
  return lag.lenker.filter((l) => l.type === "stack" && !l.kommer).map((l) => l.slug);
}

/** Teller atomer per dekningsstatus i ett lag. */
export function atomTelling(lag: Lag): Record<Dekning, number> {
  const ut: Record<Dekning, number> = { dekket: 0, delvis: 0, hull: 0 };
  for (const a of lag.atomer) ut[a.status] += 1;
  return ut;
}

/** Teller atomer per dekningsstatus på tvers av alle lag. */
export function totalAtomTelling(): Record<Dekning, number> {
  const ut: Record<Dekning, number> = { dekket: 0, delvis: 0, hull: 0 };
  for (const lag of LAG) for (const a of lag.atomer) ut[a.status] += 1;
  return ut;
}

/** Norsk datoformat, f.eks. "30.11.2026". */
export function formatDato(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/** Hele dager fra `naa` til datoen. Negativt betyr at datoen har passert. */
export function dagerTil(iso: string, naa: Date = new Date()): number {
  const maal = new Date(`${iso}T23:59:00`);
  const idag = new Date(naa.getFullYear(), naa.getMonth(), naa.getDate());
  return Math.ceil((maal.getTime() - idag.getTime()) / 86_400_000) - 1;
}
