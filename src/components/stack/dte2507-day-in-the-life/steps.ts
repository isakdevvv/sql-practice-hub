/**
 * De 24 stegene fra Kurose-Ross 6.7 "A Day in the Life of a Web Page Request"
 * (s. 512-517). Bob plugger laptopen i skole-Ethernet og besøker google.com.
 *
 * Aktører i nettet:
 *   - Bobs laptop:        MAC 00:16:D3:23:68:8A · IP 68.85.2.101 (etter DHCP)
 *   - Skole-switch:       (link-layer, ingen IP)
 *   - Skolens gateway:    MAC 00:22:6B:45:1F:1B · IP 68.85.2.1
 *   - Comcast routere:    flere hopp i AS-en
 *   - comcast DNS:        IP 68.87.71.226
 *   - Google AS:          flere hopp
 *   - google.com server:  IP 64.233.169.105
 */

export type Actor =
  | "laptop"
  | "switch"
  | "gateway"
  | "comcast"
  | "dns"
  | "google-net"
  | "google";

export type Phase = "DHCP" | "DNS+ARP" | "Routing" | "TCP+HTTP";

export interface Step {
  /** 1-indeksert stegnummer fra boka. */
  n: number;
  phase: Phase;
  title: string;
  /** Kort beskrivelse av hva som skjer (≤ 250 tegn). */
  what: string;
  /** Lengre forklaring som vises under "Detaljer". */
  detail: string;
  /** Protokoll-lag-detaljer for sidepanel. */
  layers: {
    app?: string;
    transport?: string;
    network?: string;
    link?: string;
  };
  /** Aktive aktører i dette steget — lyser opp i diagrammet. */
  active: Actor[];
  /** Pakkebevegelse fra → til (for animert pil). */
  arrow?: { from: Actor; to: Actor; label: string };
  /** Boksitat eller protokoll-referanse for kontekst. */
  ref?: string;
}

export const STEPS: Step[] = [
  // === FASE 1: DHCP (steg 1-7) ============================================
  {
    n: 1,
    phase: "DHCP",
    title: "Laptopen lager en DHCP-request",
    what: "OS-et bygger en DHCP-melding. Den pakkes i UDP, så IP, så Ethernet — alt med broadcast-adresser fordi laptopen ikke vet noe om nettet ennå.",
    detail:
      "Laptopen har akkurat fått strøm — ingen IP, ingen DNS, ingen gateway. Den må først skaffe seg en IP-konfigurasjon via DHCP. UDP kildeport 68 (DHCP-klient), destinasjon 67 (DHCP-server). IP-destinasjon er 255.255.255.255 (broadcast) og kilde 0.0.0.0 (vet ikke ennå hvem den er).",
    layers: {
      app: "DHCP DISCOVER (xid=0x3d1f)",
      transport: "UDP src=68 dst=67",
      network: "IP src=0.0.0.0 dst=255.255.255.255 (broadcast)",
      link: "Ethernet src=00:16:D3:23:68:8A",
    },
    active: ["laptop"],
    ref: "Kurose-Ross 4.3.3",
  },
  {
    n: 2,
    phase: "DHCP",
    title: "IP-datagrammet pakkes i en Ethernet-frame",
    what: "Frame får destinasjons-MAC FF:FF:FF:FF:FF:FF (link-broadcast) så ALLE enheter på switchen ser den, inkludert eventuell DHCP-server.",
    detail:
      "Laptopen bruker sin egen MAC (00:16:D3:23:68:8A) som kilde. Destinasjon er link-broadcast (alle FF). Dette er hvordan upper-layer broadcast (255.255.255.255) realiseres på link-laget.",
    layers: {
      link: "Ethernet src=00:16:D3:23:68:8A dst=FF:FF:FF:FF:FF:FF",
    },
    active: ["laptop"],
  },
  {
    n: 3,
    phase: "DHCP",
    title: "Switchen broadcaster framen ut alle porter",
    what: "Skole-switchen ser broadcast-MAC og videresender framen ut samtlige aktive porter, inkludert porten mot routeren (som inneholder DHCP-serveren).",
    detail:
      "Switchen er på link-laget — den ser bare MAC-adressene. En broadcast-frame skal per definisjon ut alle porter (utenom den den kom inn på). Den vet ennå ikke at laptopen er på den ene porten — det vil den lære fra source-MAC i denne framen (selvlæring).",
    layers: {},
    active: ["laptop", "switch"],
    arrow: { from: "laptop", to: "switch", label: "DHCP DISCOVER (broadcast)" },
  },
  {
    n: 4,
    phase: "DHCP",
    title: "Routeren mottar framen og demultiplexer opp",
    what: "Gateway-routeren (00:22:6B:45:1F:1B) leser framen, henter ut IP-datagrammet, ser at destinasjonen er broadcast — leverer UDP-segmentet videre opp til DHCP-serveren som kjører i routeren.",
    detail:
      "Demultiplexing er stegvis: Ethernet → IP → UDP → DHCP-server-prosess (port 67). DHCP-serveren ser nå requesten.",
    layers: {
      transport: "UDP demultipleksing til port 67",
    },
    active: ["laptop", "switch", "gateway"],
    arrow: { from: "switch", to: "gateway", label: "frame til alle porter" },
  },
  {
    n: 5,
    phase: "DHCP",
    title: "DHCP-server allokerer 68.85.2.101 og sender ACK",
    what: "Skolen har CIDR-blokk 68.85.2.0/24. Serveren velger 68.85.2.101 til Bob, og pakker svaret med (i) IP-en, (ii) DNS-server (68.87.71.226), (iii) gateway (68.85.2.1), (iv) subnet-maske.",
    detail:
      "DHCP ACK pakkes UDP → IP → Ethernet. Frame har src=routerens-MAC (00:22:6B:45:1F:1B) og dst=laptopens-MAC (00:16:D3:23:68:8A) — unicast tilbake.",
    layers: {
      app: "DHCP ACK { ip:68.85.2.101, dns:68.87.71.226, gw:68.85.2.1, mask:/24 }",
      transport: "UDP src=67 dst=68",
      network: "IP src=68.85.2.1 dst=68.85.2.101",
      link: "Ethernet src=00:22:6B:45:1F:1B dst=00:16:D3:23:68:8A",
    },
    active: ["gateway"],
    ref: "Kurose-Ross 4.3.3 · CIDR-blokken 68.85.2.0/24",
  },
  {
    n: 6,
    phase: "DHCP",
    title: "Switchen sender unicast-svaret kun ut riktig port",
    what: "Switchen lærte i steg 3 hvilken port laptopens MAC sitter på. ACK-en er unicast til 00:16:D3:23:68:8A — switchen videresender kun ut den ene porten.",
    detail:
      "Self-learning: switchen bygger MAC-tabell live ved å lese source-MAC i framer som kommer inn. Etter steg 3 vet switchen at 00:16:D3... er på porten mot Bob.",
    layers: {},
    active: ["gateway", "switch", "laptop"],
    arrow: { from: "gateway", to: "laptop", label: "DHCP ACK (unicast)" },
    ref: "Switch self-learning (Kurose-Ross 6.4.3)",
  },
  {
    n: 7,
    phase: "DHCP",
    title: "Laptopen er konfigurert og klar",
    what: "Bobs laptop installerer IP-en, DNS-serveren, og legger gateway 68.85.2.1 inn i sin IP-forwarding-tabell. Alt utenfor 68.85.2.0/24 sendes til gateway.",
    detail:
      "Laptopen har nå alt den trenger for å snakke med omverdenen: egen IP, gateway-IP, og hvor den skal slå opp navn. Webleseren kan nå begynne å laste www.google.com.",
    layers: {},
    active: ["laptop"],
  },

  // === FASE 2: DNS + ARP (steg 8-13) ======================================
  {
    n: 8,
    phase: "DNS+ARP",
    title: "OS-et lager en DNS-query for www.google.com",
    what: "Webleseren trenger Googles IP. OS-et bygger en DNS-melding (UDP til port 53), pakker den i IP med destinasjon 68.87.71.226 (DNS-serveren fra DHCP-ACK).",
    detail:
      "DNS er hierarkisk, men laptopen sender bare til den lokale DNS-serveren. Den tar seg av rekursiv oppslag mot rot-, TLD- og autoritativ DNS-server.",
    layers: {
      app: 'DNS query "www.google.com" A',
      transport: "UDP src=49152 dst=53",
      network: "IP src=68.85.2.101 dst=68.87.71.226",
    },
    active: ["laptop"],
    ref: "Kurose-Ross 2.4",
  },
  {
    n: 9,
    phase: "DNS+ARP",
    title: "Men hvilken MAC har gateway-routeren?",
    what: "Laptopen vet IP-en til gateway (68.85.2.1) fra DHCP-ACK, men IKKE MAC-en. Uten MAC kan ikke Ethernet-framen adresseres. Den må kjøre ARP først.",
    detail:
      "Ethernet bruker MAC, ikke IP. For å sende et IP-datagram til en nabo må laptopen vite naboens MAC. ARP er protokollen som mapper IP → MAC innenfor samme subnet.",
    layers: {},
    active: ["laptop"],
    ref: "ARP (Kurose-Ross 6.4.1)",
  },
  {
    n: 10,
    phase: "DNS+ARP",
    title: "ARP query — broadcast: 'Hvem har 68.85.2.1?'",
    what: "Laptopen lager en ARP-melding med target-IP 68.85.2.1, pakker den i en Ethernet-frame med destinasjon FF:FF:FF:FF:FF:FF (broadcast). Switchen videresender til alle porter.",
    detail:
      "ARP er en av de få protokollene som lever på grensen mellom link- og nettverkslag. Den bruker Ethernet direkte (ingen IP). Bokens metafor: rope ut i et åpent kontorlandskap «Hvilken stol har personnummeret 12345?»",
    layers: {
      app: "ARP request: who-has 68.85.2.1?",
      link: "Ethernet src=00:16:D3:23:68:8A dst=FF:FF:FF:FF:FF:FF",
    },
    active: ["laptop", "switch"],
    arrow: { from: "laptop", to: "switch", label: "ARP query (broadcast)" },
  },
  {
    n: 11,
    phase: "DNS+ARP",
    title: "Gateway svarer: '68.85.2.1 er meg, MAC 00:22:6B:45:1F:1B'",
    what: "Gateway-routeren ser at target-IP matcher dens egen interface, lager en ARP-reply unicast tilbake til laptopen. Andre på switchen ser ARP-en men ignorerer den.",
    detail:
      "ARP-reply er adressert direkte til Bobs MAC — ingen broadcast. Bobs laptop cacher (IP=68.85.2.1, MAC=00:22:6B:45:1F:1B) i sin ARP-tabell — typisk i 5-20 minutter.",
    layers: {
      app: "ARP reply: 68.85.2.1 is-at 00:22:6B:45:1F:1B",
      link: "Ethernet src=00:22:6B:45:1F:1B dst=00:16:D3:23:68:8A",
    },
    active: ["gateway", "switch", "laptop"],
    arrow: { from: "gateway", to: "laptop", label: "ARP reply (unicast)" },
  },
  {
    n: 12,
    phase: "DNS+ARP",
    title: "Laptopen har nå MAC-en til gateway",
    what: "Med gateway-MAC tilgjengelig kan laptopen endelig adressere DNS-spørringen riktig på link-laget.",
    detail: "ARP-cachen lagrer dette mappingen så vi slipper å ARP-e for hver pakke.",
    layers: {},
    active: ["laptop"],
  },
  {
    n: 13,
    phase: "DNS+ARP",
    title: "DNS-query sendes (endelig!) til gateway",
    what: "Frame: src-MAC=Bobs, dst-MAC=gateways. IP-pakkens destinasjon er DNS-serveren (68.87.71.226), men link-destinasjonen er gateway — som skal route den videre.",
    detail:
      "Boka: «Bobs laptop kan endelig (finally!) adressere Ethernet-framen som inneholder DNS-spørringen.» Merk forskjellen: link-destinasjon = nabohopp, IP-destinasjon = den endelige mottakeren.",
    layers: {
      app: 'DNS query "www.google.com"',
      network: "IP src=68.85.2.101 dst=68.87.71.226",
      link: "Ethernet src=00:16:D3:23:68:8A dst=00:22:6B:45:1F:1B",
    },
    active: ["laptop", "switch", "gateway"],
    arrow: { from: "laptop", to: "gateway", label: "DNS query" },
  },

  // === FASE 3: Intra/Inter-domain Routing (steg 14-17) ====================
  {
    n: 14,
    phase: "Routing",
    title: "Gateway slår opp 68.87.71.226 i sin forwarding-tabell",
    what: "Gateway-routeren ekstraherer IP-datagrammet, ser destinasjon 68.87.71.226 (Comcast), finner riktig utgående interface mot Comcast-routeren via sin forwarding-tabell.",
    detail:
      "Forwarding-tabellen er bygd via intra-domain protokollen i Comcast (RIP/OSPF/IS-IS), og inter-domain protokollen BGP for ruter utenfor egen AS. Gateway pakker IP-datagrammet i en NY link-layer-frame for lenken videre.",
    layers: {
      network: "IP dst=68.87.71.226 → utgående lenke til Comcast",
    },
    active: ["gateway"],
    ref: "Kurose-Ross 5.3 (OSPF/IS-IS) + 5.4 (BGP)",
  },
  {
    n: 15,
    phase: "Routing",
    title: "Comcast-routere videresender mot DNS-serveren",
    what: "Datagrammet hopper gjennom Comcast-nettet. Hver router ser på destinasjons-IP, slår opp lengste matchende prefiks, og forwarder.",
    detail:
      "Hopp-for-hopp ruting. På hvert hopp byttes link-layer-framen ut. IP-headeren er den samme, men TTL dekrementeres og checksum oppdateres.",
    layers: {
      network: "IP dst=68.87.71.226 — TTL dekrementeres på hver hop",
    },
    active: ["gateway", "comcast"],
    arrow: { from: "gateway", to: "comcast", label: "DNS query (forwarded)" },
  },
  {
    n: 16,
    phase: "Routing",
    title: "DNS-serveren slår opp og svarer 64.233.169.105",
    what: "comcast-DNS finner DNS-record for www.google.com (cachet fra Googles autoritative DNS-server) og pakker DNS-reply tilbake til Bob.",
    detail:
      "Hvis ikke cachet ville comcast-DNS ha gjort rekursivt oppslag: . → com. → google.com → www.google.com. Vanligvis er populære navn cachet med lang TTL.",
    layers: {
      app: "DNS reply: www.google.com A 64.233.169.105",
      transport: "UDP src=53 dst=49152",
      network: "IP src=68.87.71.226 dst=68.85.2.101",
    },
    active: ["dns", "comcast", "gateway"],
    arrow: { from: "dns", to: "laptop", label: "DNS reply" },
  },
  {
    n: 17,
    phase: "Routing",
    title: "Laptopen har Googles IP — endelig klar til å snakke",
    what: "Bobs laptop ekstraherer 64.233.169.105 fra DNS-svaret. Etter mye arbeid (DHCP + ARP + DNS) er den ENDELIG klar til å initiere TCP-tilkoblingen til Google.",
    detail:
      "Boka skriver: «Finally, after a lot of work, Bob's laptop is now ready to contact the www.google.com server!» Vi har brukt 17 steg uten ennå å ha sendt en eneste HTTP-byte.",
    layers: {},
    active: ["laptop"],
  },

  // === FASE 4: TCP + HTTP (steg 18-24) ====================================
  {
    n: 18,
    phase: "TCP+HTTP",
    title: "TCP SYN — første del av 3-veis-håndtrykket",
    what: "Webleseren oppretter en TCP-socket. TCP-stacken sender en SYN med destinasjonsport 80, IP-destinasjon 64.233.169.105, og link-destinasjon = gateways MAC.",
    detail:
      "TCP-tilkoblingen krever 3-veis håndtrykk (SYN → SYN+ACK → ACK) før noen data flyter. Datagrammet routes hop-for-hop til Google via Comcast.",
    layers: {
      transport: "TCP src=49153 dst=80 SYN seq=client_isn",
      network: "IP src=68.85.2.101 dst=64.233.169.105",
      link: "Ethernet src=00:16:D3:23:68:8A dst=00:22:6B:45:1F:1B (gateway)",
    },
    active: ["laptop", "switch", "gateway"],
    arrow: { from: "laptop", to: "gateway", label: "TCP SYN" },
    ref: "Kurose-Ross 3.5.6",
  },
  {
    n: 19,
    phase: "TCP+HTTP",
    title: "Routere i skole, Comcast og Google forwarder SYN-en",
    what: "Mellom Comcast og Google brukes BGP for å bestemme inter-domain ruten. Innenfor hver AS brukes intra-domain (OSPF/IS-IS).",
    detail:
      "Hver router gjør samme jobb: lengste prefiks-matching, dekrement TTL, ny link-layer-frame, send videre. SYN-en kommer til Google etter typisk 5-15 hopp.",
    layers: {
      network: "IP dst=64.233.169.105 (Google)",
    },
    active: ["gateway", "comcast", "google-net"],
    arrow: { from: "comcast", to: "google-net", label: "TCP SYN (BGP-rutet)" },
  },
  {
    n: 20,
    phase: "TCP+HTTP",
    title: "Google mottar SYN, sender SYN+ACK",
    what: "Google-serveren har en welcome-socket på port 80. SYN-en demultiplekses dit, en ny connection-socket opprettes, SYN+ACK pakkes inn og sendes tilbake mot Bob.",
    detail:
      "SYN+ACK har ack=client_isn+1 og en egen seq=server_isn. Bobs laptop venter på dette for å fullføre håndtrykket.",
    layers: {
      transport: "TCP src=80 dst=49153 SYN+ACK seq=server_isn ack=client_isn+1",
      network: "IP src=64.233.169.105 dst=68.85.2.101",
    },
    active: ["google", "google-net"],
    arrow: { from: "google", to: "laptop", label: "TCP SYN+ACK" },
  },
  {
    n: 21,
    phase: "TCP+HTTP",
    title: "SYN+ACK rutes tilbake gjennom Google → Comcast → skole",
    what: "Reisen tilbake følger ofte ulik vei (asymmetrisk ruting). Pakken havner til slutt i Bobs Ethernet-controller, demultiplekses opp til TCP-socketen — som går til ESTABLISHED.",
    detail:
      "TCP er nå fullt etablert begge veier. Bobs side er ESTABLISHED idet SYN+ACK kommer; Googles side blir ESTABLISHED når Bobs ACK ankommer.",
    layers: {
      transport: "Bobs TCP-socket: SYN_SENT → ESTABLISHED",
    },
    active: ["google-net", "comcast", "gateway", "switch", "laptop"],
    arrow: { from: "google-net", to: "laptop", label: "SYN+ACK forwarded" },
  },
  {
    n: 22,
    phase: "TCP+HTTP",
    title: "HTTP GET sendes på den etablerte TCP-tilkoblingen",
    what: "Webleseren skriver «GET / HTTP/1.1\\r\\nHost: www.google.com\\r\\n\\r\\n» inn i socketen. TCP segmenterer dette og sender det til Google.",
    detail:
      "Det tredje ACK-et i håndtrykket pigggybacker ofte denne første GET-pakken — TCP er smart slik. Boka: «With the socket on Bob's laptop now (finally!) ready to send bytes…»",
    layers: {
      app: "GET / HTTP/1.1\\nHost: www.google.com",
      transport: "TCP src=49153 dst=80 ACK + payload",
    },
    active: ["laptop", "switch", "gateway", "comcast", "google-net"],
    arrow: { from: "laptop", to: "google", label: "HTTP GET" },
  },
  {
    n: 23,
    phase: "TCP+HTTP",
    title: "Google leser GET, lager HTTP-respons",
    what: "Google-serveren leser HTTP-meldingen, henter index-siden, pakker den i en HTTP-respons med status 200 OK, og skriver den til socketen — som blir til TCP-segmenter på vei tilbake.",
    detail:
      "Stor sider deles på flere TCP-segmenter. Kongesjons-kontroll bestemmer hvor raskt server kan sende.",
    layers: {
      app: "HTTP/1.1 200 OK\\nContent-Type: text/html\\n\\n<html>…</html>",
      transport: "TCP src=80 dst=49153 ACK + payload (potensielt mange segmenter)",
    },
    active: ["google"],
  },
  {
    n: 24,
    phase: "TCP+HTTP",
    title: "Bobs nettleser leser HTML og rendrer siden!",
    what: "Datagrammene går tilbake gjennom Google → Comcast → skole. Webleseren leser HTML, tolker, henter inn ekstra ressurser (CSS, JS, bilder) — og siden vises endelig.",
    detail:
      "Boka: «… and finally (finally!) displays the Web page!» En typisk side trigger 50-200 ekstra HTTP-requests for ressurser. Hver av dem repeterer steg 18-24 (med cachet ARP/DNS slik at det går mye fortere).",
    layers: {
      app: "Browser parser HTML, rendrer DOM, fyrer av subresource-requests",
    },
    active: ["google", "google-net", "comcast", "gateway", "switch", "laptop"],
    arrow: { from: "google", to: "laptop", label: "HTTP 200 OK" },
  },
];

export const PHASE_RANGES: Record<Phase, { from: number; to: number; description: string }> = {
  "DHCP": {
    from: 1,
    to: 7,
    description:
      "Laptopen vet ingenting. Skaffer IP-adresse, gateway, subnet-maske og DNS-server fra DHCP-server.",
  },
  "DNS+ARP": {
    from: 8,
    to: 13,
    description:
      "For å spørre DNS må laptopen først finne MAC-en til gateway via ARP. To protokoller på link- og nettverkslag samspiller.",
  },
  "Routing": {
    from: 14,
    to: 17,
    description:
      "DNS-spørringen rutes via skolens nett gjennom Comcast til DNS-serveren — som svarer med Googles IP.",
  },
  "TCP+HTTP": {
    from: 18,
    to: 24,
    description:
      "Etter ALL forberedelse: TCP 3-veis-handshake, HTTP GET, HTTP-respons med HTML, browser rendrer siden.",
  },
};
