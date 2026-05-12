// Pcap-scenarier for Wireshark-quiz. Hvert scenario har en serie av
// pakke-rader (slik de vises i Wireshark "packet list"-panelet) og 1+
// multiple-choice spørsmål med rasjonale.

export interface PcapRow {
  no: string;
  time: string;
  src: string;
  dst: string;
  proto: string;
  info: string;
}

export interface PcapQuestion {
  /** The actual question text. */
  prompt: string;
  /** Each option — exactly one is correct. */
  options: { text: string; correct: boolean; rationale?: string }[];
  /** Overall explanation shown after answering. */
  explanation: string;
  /** Optional list of frame-numbers to highlight when this Q is active. */
  highlight?: string[];
}

export interface PcapScenario {
  id: string;
  title: string;
  /** Plain-Norwegian context shown above the table. */
  scenario: string;
  /** Optional difficulty 1-3. */
  difficulty: 1 | 2 | 3;
  /** Topic tag — drives sidebar grouping. */
  topic:
    | "HTTP"
    | "HTTPS / TLS"
    | "TCP-handshake"
    | "DNS"
    | "ARP / MITM"
    | "Port-skanning"
    | "Klartekst / sårbarhet"
    | "DHCP"
    | "ICMP";
  rows: PcapRow[];
  questions: PcapQuestion[];
}

export const PCAP_SCENARIOS: PcapScenario[] = [
  // 1. Normal HTTP-flyt
  {
    id: "pcap-http-normal",
    title: "Normal HTTP-GET-flyt",
    scenario:
      "En klient på 10.0.0.5 henter http://example.com (93.184.216.34). Du har capture-et hele forløpet.",
    difficulty: 1,
    topic: "HTTP",
    rows: [
      { no: "1", time: "0.000", src: "10.0.0.5", dst: "93.184.216.34", proto: "TCP", info: "49152 → 80 [SYN] Seq=0" },
      { no: "2", time: "0.024", src: "93.184.216.34", dst: "10.0.0.5", proto: "TCP", info: "80 → 49152 [SYN, ACK] Seq=0 Ack=1" },
      { no: "3", time: "0.024", src: "10.0.0.5", dst: "93.184.216.34", proto: "TCP", info: "49152 → 80 [ACK] Seq=1 Ack=1" },
      { no: "4", time: "0.025", src: "10.0.0.5", dst: "93.184.216.34", proto: "HTTP", info: "GET /index.html HTTP/1.1" },
      { no: "5", time: "0.052", src: "93.184.216.34", dst: "10.0.0.5", proto: "TCP", info: "80 → 49152 [ACK] Seq=1 Ack=78" },
      { no: "6", time: "0.080", src: "93.184.216.34", dst: "10.0.0.5", proto: "HTTP", info: "HTTP/1.1 200 OK (text/html)" },
      { no: "7", time: "0.081", src: "10.0.0.5", dst: "93.184.216.34", proto: "TCP", info: "49152 → 80 [ACK] Seq=78 Ack=1257" },
    ],
    questions: [
      {
        prompt: "Hvilke rammer utgjør TCP 3-way handshake?",
        highlight: ["1", "2", "3"],
        options: [
          { text: "1, 2, 3", correct: true, rationale: "SYN → SYN-ACK → ACK. Klassisk handshake før noen HTTP-data sendes." },
          { text: "4, 5, 6", correct: false, rationale: "Det er allerede HTTP-data. Handshake må komme før." },
          { text: "1, 2, 4", correct: false, rationale: "Ramme 4 er en HTTP GET, ikke en TCP ACK på handshaken." },
          { text: "2, 3, 4", correct: false, rationale: "Ramme 1 (SYN) er en del av handshaken — den må være med." },
        ],
        explanation: "Tre-trinns handshake: SYN (kun klient), SYN-ACK (server), ACK (klient).",
      },
      {
        prompt: "Hva returnerer serveren i ramme 6?",
        options: [
          { text: "HTTP/1.1 200 OK med text/html", correct: true },
          { text: "HTTP/1.1 404 Not Found", correct: false, rationale: "Info-feltet sier '200 OK'." },
          { text: "Et TCP RST-flagg", correct: false, rationale: "Proto er HTTP, ikke et flagg." },
          { text: "En SYN-ACK", correct: false, rationale: "Det er allerede etablert tilkobling." },
        ],
        explanation: "Status-koden står i Info-feltet. Bytt 200 med 404 og du har et nytt eksamens-spørsmål.",
      },
    ],
  },

  // 2. HTTPS / TLS-handshake
  {
    id: "pcap-tls-handshake",
    title: "TLS 1.3-handshake (HTTPS)",
    scenario:
      "Klienten kobler til https://example.com. Du ser TCP og TLS-trafikken — TLS 1.3 komprimerer alt på server-siden til en pakke.",
    difficulty: 2,
    topic: "HTTPS / TLS",
    rows: [
      { no: "1", time: "0.000", src: "10.0.0.5", dst: "93.184.216.34", proto: "TCP", info: "49210 → 443 [SYN]" },
      { no: "2", time: "0.024", src: "93.184.216.34", dst: "10.0.0.5", proto: "TCP", info: "443 → 49210 [SYN, ACK]" },
      { no: "3", time: "0.024", src: "10.0.0.5", dst: "93.184.216.34", proto: "TCP", info: "49210 → 443 [ACK]" },
      { no: "4", time: "0.025", src: "10.0.0.5", dst: "93.184.216.34", proto: "TLSv1.3", info: "Client Hello (SNI=example.com)" },
      { no: "5", time: "0.052", src: "93.184.216.34", dst: "10.0.0.5", proto: "TLSv1.3", info: "Server Hello, Encrypted Extensions, Certificate, Finished" },
      { no: "6", time: "0.054", src: "10.0.0.5", dst: "93.184.216.34", proto: "TLSv1.3", info: "Finished" },
      { no: "7", time: "0.055", src: "10.0.0.5", dst: "93.184.216.34", proto: "TLSv1.3", info: "Application Data" },
      { no: "8", time: "0.085", src: "93.184.216.34", dst: "10.0.0.5", proto: "TLSv1.3", info: "Application Data" },
    ],
    questions: [
      {
        prompt: "Hvilken informasjon kan en passiv sniffer lese KLARTEKST fra denne flyten?",
        options: [
          { text: "Server-navnet i SNI (ramme 4)", correct: true, rationale: "SNI er ukryptert — passer er der serveren bestemmer hvilken sertifikat den skal sende." },
          { text: "Hele HTTP-requesten", correct: false, rationale: "Den ligger i 'Application Data' (ramme 7) som er kryptert." },
          { text: "Bruker-passordet", correct: false, rationale: "Også kryptert i Application Data." },
          { text: "Sertifikatets private nøkkel", correct: false, rationale: "Den private nøkkelen forlater ALDRI serveren — bare den offentlige sendes ut." },
        ],
        explanation: "Selv om TLS skjuler innhold, lekker SNI hvilket domene man besøker. ESNI/ECH prøver å skjule det.",
      },
      {
        prompt: "Hvor mange round-trips brukes TLS 1.3-handshaken her etter at TCP er etablert?",
        options: [
          { text: "1 RTT (Client Hello + Server Hello+Finished → Finished + Application Data)", correct: true, rationale: "TLS 1.3 brukte 1-RTT vs TLS 1.2 sin 2-RTT. Sammen med 0-RTT resumption blir det enda raskere." },
          { text: "2 RTT", correct: false, rationale: "Det var TLS 1.2." },
          { text: "0 RTT", correct: false, rationale: "0-RTT krever forhåndsetablert PSK fra tidligere økt." },
          { text: "3 RTT", correct: false, rationale: "Aldri." },
        ],
        explanation: "Stort framsteg i TLS 1.3: server pakker hello, cert og finished i én pakke — 1 RTT mot 2 i TLS 1.2.",
      },
    ],
  },

  // 3. DNS-query
  {
    id: "pcap-dns-a",
    title: "DNS A-record-spørring",
    scenario:
      "Klienten slår opp example.com hos Google DNS (8.8.8.8). UDP port 53.",
    difficulty: 1,
    topic: "DNS",
    rows: [
      { no: "1", time: "0.000", src: "10.0.0.5", dst: "8.8.8.8", proto: "DNS", info: "Standard query 0x9ab1 A example.com" },
      { no: "2", time: "0.018", src: "8.8.8.8", dst: "10.0.0.5", proto: "DNS", info: "Standard query response 0x9ab1 A 93.184.216.34" },
    ],
    questions: [
      {
        prompt: "Hvilken transport-protokoll bruker DNS her?",
        options: [
          { text: "UDP", correct: true, rationale: "Wireshark viser bare DNS-laget, men DNS over standard port 53 går over UDP. TCP brukes bare for store svar (>512 bytes) eller zone transfer." },
          { text: "TCP", correct: false, rationale: "TCP brukes for zone transfer eller når svaret er > 512 bytes. Vanlige A-spørringer er UDP." },
          { text: "ICMP", correct: false },
          { text: "QUIC", correct: false, rationale: "DNS over QUIC (DoQ) finnes, men er nytt og ikke standard ennå." },
        ],
        explanation: "DNS er den klassiske UDP-protokollen — lite-overhead, retransmit gjøres av klienten selv.",
      },
      {
        prompt: "Hva er 0x9ab1?",
        options: [
          { text: "Transaction ID — matcher svar til spørring", correct: true, rationale: "Klienten genererer en tilfeldig ID og sjekker at svaret bærer samme. Beskytter litt mot off-path DNS-spoofing." },
          { text: "TTL for svaret", correct: false, rationale: "TTL er en separat felt." },
          { text: "Et hash av navnet", correct: false },
          { text: "Et autentiserings-token", correct: false, rationale: "DNS-svar er ikke autentiserte — derfor finnes DNSSEC." },
        ],
        explanation: "ID-en er 16-bit. Med 65k mulige verdier kan en angriper på riktig nett gjette riktig — derfor er DNSSEC og DoH/DoT viktige.",
      },
    ],
  },

  // 4. TCP teardown
  {
    id: "pcap-tcp-teardown",
    title: "TCP-teardown (FIN-flyt)",
    scenario:
      "En etablert TCP-tilkobling avsluttes graceful. Begge sider sender FIN, hver side mottar ACK.",
    difficulty: 2,
    topic: "TCP-handshake",
    rows: [
      { no: "1", time: "0.000", src: "10.0.0.5", dst: "93.184.216.34", proto: "TCP", info: "49152 → 80 [FIN, ACK] Seq=78 Ack=1257" },
      { no: "2", time: "0.024", src: "93.184.216.34", dst: "10.0.0.5", proto: "TCP", info: "80 → 49152 [ACK] Seq=1257 Ack=79" },
      { no: "3", time: "0.025", src: "93.184.216.34", dst: "10.0.0.5", proto: "TCP", info: "80 → 49152 [FIN, ACK] Seq=1257 Ack=79" },
      { no: "4", time: "0.026", src: "10.0.0.5", dst: "93.184.216.34", proto: "TCP", info: "49152 → 80 [ACK] Seq=79 Ack=1258" },
    ],
    questions: [
      {
        prompt: "Hvor mange rammer brukes for en graceful TCP-shutdown?",
        options: [
          { text: "4 — hver side sender FIN og hver FIN ACK-es", correct: true },
          { text: "2 — bare FIN + ACK", correct: false, rationale: "TCP er full-duplex, så hver retning lukkes uavhengig." },
          { text: "3 — som handshake, bare omvendt", correct: false, rationale: "Det er 4. TCP er full-duplex, derfor må hver retning eksplisitt lukkes." },
          { text: "1 — RST", correct: false, rationale: "RST er en hard, ikke-graceful avslutning." },
        ],
        explanation: "TCP er full-duplex. Hver side eier sin egen retning og må sende FIN for å si 'jeg er ferdig med å sende'.",
      },
    ],
  },

  // 5. Port-skanning (SYN scan)
  {
    id: "pcap-port-scan-syn",
    title: "TCP SYN-skann (Nmap stealth scan)",
    scenario:
      "Du ser uvanlig trafikk fra 10.0.0.99: mange SYN til ulike porter på 10.0.0.5, ingen som fullfører handshake.",
    difficulty: 3,
    topic: "Port-skanning",
    rows: [
      { no: "1", time: "0.000", src: "10.0.0.99", dst: "10.0.0.5", proto: "TCP", info: "12345 → 21  [SYN] Seq=0" },
      { no: "2", time: "0.002", src: "10.0.0.99", dst: "10.0.0.5", proto: "TCP", info: "12345 → 22  [SYN] Seq=0" },
      { no: "3", time: "0.004", src: "10.0.0.99", dst: "10.0.0.5", proto: "TCP", info: "12345 → 23  [SYN] Seq=0" },
      { no: "4", time: "0.006", src: "10.0.0.5",  dst: "10.0.0.99", proto: "TCP", info: "22 → 12345  [SYN, ACK] Seq=0 Ack=1" },
      { no: "5", time: "0.007", src: "10.0.0.99", dst: "10.0.0.5", proto: "TCP", info: "12345 → 22  [RST] Seq=1" },
      { no: "6", time: "0.008", src: "10.0.0.99", dst: "10.0.0.5", proto: "TCP", info: "12345 → 25  [SYN] Seq=0" },
      { no: "7", time: "0.010", src: "10.0.0.5",  dst: "10.0.0.99", proto: "TCP", info: "21 → 12345  [RST, ACK]" },
      { no: "8", time: "0.012", src: "10.0.0.5",  dst: "10.0.0.99", proto: "TCP", info: "23 → 12345  [RST, ACK]" },
    ],
    questions: [
      {
        prompt: "Hvilke porter er ÅPNE på 10.0.0.5?",
        options: [
          { text: "Bare 22 (SSH) — den sendte SYN-ACK", correct: true, rationale: "Åpen port svarer med SYN-ACK. Stengt port svarer med RST. Filtrert port svarer ikke." },
          { text: "21, 22, 23 — alle som ble probet", correct: false, rationale: "Port 21 og 23 svarte med RST — det betyr stengt." },
          { text: "Ingen — angriperen sender RST", correct: false, rationale: "Angriperen sender RST etter SYN-ACK for å unngå full tilkobling (stealth). Det betyr port 22 er åpen." },
          { text: "25 — siste port skannet", correct: false, rationale: "Vi ser ikke noe svar på 25 i denne capturen." },
        ],
        explanation: "Stealth SYN-scan: angriperen sender RST før handshaken er fullført, så den slipper å logges på applikasjonsnivå. Klassisk Nmap -sS.",
      },
      {
        prompt: "Hvorfor er denne typen skann 'stealth'?",
        options: [
          { text: "Tilkoblingen blir aldri fullført, så applikasjonen logger ikke noe", correct: true, rationale: "Mange tjenester logger først når accept() returnerer. SYN+RST stopper før det." },
          { text: "Den bruker tilfeldige porter", correct: false },
          { text: "Den er kryptert", correct: false, rationale: "TCP-skann er ikke kryptert. Det handler ikke om kryptering." },
          { text: "Den simulerer normal trafikk", correct: false, rationale: "Mange SYN uten full handshake er nettopp UNORMALT — en god IDS fanger det." },
        ],
        explanation: "Stealth = unngå applikasjons-logging. Men en god IDS ser likevel mønsteret (Snort/Suricata har regler for dette).",
      },
    ],
  },

  // 6. ARP-spoofing
  {
    id: "pcap-arp-spoofing",
    title: "ARP-spoofing (gratuitous ARP)",
    scenario:
      "Du analyserer trafikk på et lokalt nett. Gateway-en har vanligvis MAC AA:BB:CC:DD:EE:01. Plutselig dukker det opp ARP-meldinger med en annen MAC.",
    difficulty: 3,
    topic: "ARP / MITM",
    rows: [
      { no: "1", time: "0.000", src: "10.0.0.5",   dst: "broadcast", proto: "ARP", info: "Who has 10.0.0.1? Tell 10.0.0.5" },
      { no: "2", time: "0.002", src: "10.0.0.1",   dst: "10.0.0.5",  proto: "ARP", info: "10.0.0.1 is at AA:BB:CC:DD:EE:01" },
      { no: "3", time: "5.000", src: "10.0.0.99",  dst: "broadcast", proto: "ARP", info: "10.0.0.1 is at 0E:11:22:33:44:55 (gratuitous)" },
      { no: "4", time: "5.001", src: "10.0.0.99",  dst: "broadcast", proto: "ARP", info: "10.0.0.1 is at 0E:11:22:33:44:55 (gratuitous)" },
      { no: "5", time: "10.0",  src: "10.0.0.5",   dst: "0E:11:22:33:44:55", proto: "HTTP", info: "GET /login HTTP/1.1 (skulle gått til routeren)" },
    ],
    questions: [
      {
        prompt: "Hva er angriperen sin MAC-adresse?",
        options: [
          { text: "0E:11:22:33:44:55", correct: true, rationale: "Den nye ARP-meldingen kringkaster en falsk mapping av gateway-IP til denne MAC-en." },
          { text: "AA:BB:CC:DD:EE:01", correct: false, rationale: "Det er den ekte gateway-MAC-en." },
          { text: "10.0.0.99", correct: false, rationale: "Det er en IP, ikke en MAC. Men det er sannsynligvis angriperens IP." },
          { text: "broadcast", correct: false, rationale: "Det er destinasjons-adressen for ARP-spørringer." },
        ],
        explanation: "Når 10.0.0.5 i ramme 5 sender HTTP-trafikk til den nye MAC-en, går alt gjennom angriperens maskin før det når routeren. MITM oppnådd.",
      },
      {
        prompt: "Hva er beste forsvar mot dette?",
        options: [
          { text: "Dynamic ARP Inspection (DAI) på switchen + TLS for applikasjonsdata", correct: true, rationale: "DAI sjekker ARP-replies mot DHCP-snooping-tabell. TLS sikrer at innholdet er beskyttet uansett." },
          { text: "Lengre passord", correct: false, rationale: "Beskytter ikke mot MITM — angriperen ser alle bytes." },
          { text: "Flere VLAN", correct: false, rationale: "Hjelper hvis angriperen er i et annet VLAN, men på samme VLAN er du fortsatt utsatt." },
          { text: "Bytte switch", correct: false, rationale: "Switch-typen er ikke problemet. Konfigurasjonen (DAI) er." },
        ],
        explanation: "ARP har ingen autentisering. Beste forsvar er statiske ARP-bindings for kritiske hoster + DAI på switchen.",
      },
    ],
  },

  // 7. Cleartext HTTP password
  {
    id: "pcap-cleartext-password",
    title: "Klartekst-passord i HTTP POST",
    scenario:
      "En klient logger inn på en gammel intranett-side over HTTP (ikke HTTPS). En sniffer leser hva som blir sendt.",
    difficulty: 1,
    topic: "Klartekst / sårbarhet",
    rows: [
      { no: "1", time: "0.000", src: "10.0.0.5", dst: "10.0.0.20", proto: "TCP", info: "[SYN]" },
      { no: "2", time: "0.001", src: "10.0.0.20", dst: "10.0.0.5", proto: "TCP", info: "[SYN, ACK]" },
      { no: "3", time: "0.001", src: "10.0.0.5", dst: "10.0.0.20", proto: "TCP", info: "[ACK]" },
      { no: "4", time: "0.005", src: "10.0.0.5", dst: "10.0.0.20", proto: "HTTP", info: "POST /login HTTP/1.1" },
      { no: "5", time: "0.005", src: "10.0.0.5", dst: "10.0.0.20", proto: "HTTP", info: "  (body) username=ola&password=hemmelig123" },
      { no: "6", time: "0.020", src: "10.0.0.20", dst: "10.0.0.5", proto: "HTTP", info: "HTTP/1.1 302 Found (Location: /dashboard)" },
    ],
    questions: [
      {
        prompt: "Hvorfor er denne flyten alvorlig?",
        options: [
          { text: "Passordet er sendt i klartekst over HTTP — alle på path-en kan lese det", correct: true, rationale: "Ingen TLS = ingen kryptering. Wireshark viser body direkte." },
          { text: "Server-en svarte 302", correct: false, rationale: "302 er normal redirect-status, ikke problemet." },
          { text: "Brukernavnet er for langt", correct: false },
          { text: "TCP-handshake ble brukt", correct: false, rationale: "Helt normalt." },
        ],
        explanation: "Lære-momentet: ALDRI skriv inn passord på en side uten HTTPS. Sjekk for låsen i adresselinjen.",
      },
      {
        prompt: "Hva endrer seg om denne ble sendt over HTTPS i stedet?",
        options: [
          { text: "Bytene mellom klient og server blir kryptert; en sniffer ser bare ApplicationData", correct: true, rationale: "TLS innkapsler hele HTTP — body, headers, alt — i kryptert form." },
          { text: "Passordet kan fortsatt leses men hashes", correct: false, rationale: "Det er ikke hashing — det er kryptering. Og det er på transport-laget, ikke applikasjons-laget." },
          { text: "Det går raskere", correct: false, rationale: "TLS legger til litt overhead. Ikke poenget." },
          { text: "Brukernavnet skjules, men ikke passordet", correct: false, rationale: "Begge skjules. Alt mellom klient og server er kryptert." },
        ],
        explanation: "Wireshark ville bare se 'Application Data' for hver pakke — innholdet er kryptert.",
      },
    ],
  },

  // 8. DHCP-flyt
  {
    id: "pcap-dhcp-flow",
    title: "DHCP-flyt (DORA)",
    scenario:
      "En klient akkurat starter opp og trenger en IP-adresse. Hele DHCP-konversasjonen ses på nettet.",
    difficulty: 2,
    topic: "DHCP",
    rows: [
      { no: "1", time: "0.000", src: "0.0.0.0",     dst: "255.255.255.255", proto: "DHCP", info: "DHCP Discover - Transaction ID 0xab12" },
      { no: "2", time: "0.012", src: "10.0.0.1",    dst: "255.255.255.255", proto: "DHCP", info: "DHCP Offer - 10.0.0.42" },
      { no: "3", time: "0.013", src: "0.0.0.0",     dst: "255.255.255.255", proto: "DHCP", info: "DHCP Request - 10.0.0.42" },
      { no: "4", time: "0.020", src: "10.0.0.1",    dst: "255.255.255.255", proto: "DHCP", info: "DHCP ACK - 10.0.0.42 lease=86400s" },
    ],
    questions: [
      {
        prompt: "Hvorfor er DHCP Discover sendt med kilde 0.0.0.0?",
        options: [
          { text: "Klienten har ennå ikke fått tildelt en IP — så den må bruke 0.0.0.0 til den får en", correct: true, rationale: "Hele poenget med DHCP er å få en IP. Til da er klienten 'ingen adresse'." },
          { text: "0.0.0.0 er en spesiell admin-adresse", correct: false },
          { text: "DHCP-serveren krever det av sikkerhetshensyn", correct: false },
          { text: "Det er en feilkonfigurasjon", correct: false },
        ],
        explanation: "DHCP DORA = Discover (broadcast), Offer (server), Request (klient bekrefter), ACK (server svarer). Klienten har ingen IP før ACK-en.",
      },
      {
        prompt: "Hvorfor er DHCP-trafikk her broadcast i stedet for unicast?",
        options: [
          { text: "Klienten kjenner ikke DHCP-serverens adresse ennå, og uten egen IP kan den uansett ikke svare på unicast", correct: true },
          { text: "DHCP bruker alltid broadcast for sikkerhets skyld", correct: false },
          { text: "Broadcast er raskere", correct: false },
          { text: "DHCP-protokollen krever UDP-multicast", correct: false, rationale: "Det er broadcast (255.255.255.255), ikke multicast." },
        ],
        explanation: "Broadcasten lar alle DHCP-servere på samme lag-2-segment få beskjed. DHCP Relay brukes for å rute over routere.",
      },
    ],
  },

  // 9. ICMP / ping
  {
    id: "pcap-icmp-ping",
    title: "ICMP echo (ping)",
    scenario:
      "Du pinger google.com fra din maskin. Wireshark fanger fire ICMP-pakker.",
    difficulty: 1,
    topic: "ICMP",
    rows: [
      { no: "1", time: "0.000", src: "10.0.0.5", dst: "8.8.8.8",  proto: "ICMP", info: "Echo (ping) request id=0x1, seq=1/256" },
      { no: "2", time: "0.018", src: "8.8.8.8",  dst: "10.0.0.5", proto: "ICMP", info: "Echo (ping) reply   id=0x1, seq=1/256" },
      { no: "3", time: "1.000", src: "10.0.0.5", dst: "8.8.8.8",  proto: "ICMP", info: "Echo (ping) request id=0x1, seq=2/512" },
      { no: "4", time: "1.018", src: "8.8.8.8",  dst: "10.0.0.5", proto: "ICMP", info: "Echo (ping) reply   id=0x1, seq=2/512" },
    ],
    questions: [
      {
        prompt: "På hvilket OSI-lag ligger ICMP?",
        options: [
          { text: "Nettverkslag (lag 3) — sammen med IP", correct: true, rationale: "ICMP er en del av IP-suiten, brukes til kontroll-meldinger og diagnostikk." },
          { text: "Transportlag (lag 4)", correct: false, rationale: "Det er TCP/UDP." },
          { text: "Lenkelag (lag 2)", correct: false },
          { text: "Applikasjonslag (lag 7)", correct: false, rationale: "ping er en applikasjon, men ICMP er nettverk-lag." },
        ],
        explanation: "ICMP ligger 'i' IP — pakket inn i en IP-pakke uten egen transport-header. Derfor: lag 3.",
      },
    ],
  },

  // 10. HTTP 404
  {
    id: "pcap-http-404",
    title: "HTTP-flyt med 404",
    scenario:
      "Klienten ber om en side som ikke finnes på serveren.",
    difficulty: 1,
    topic: "HTTP",
    rows: [
      { no: "1", time: "0.000", src: "10.0.0.5", dst: "10.0.0.20", proto: "HTTP", info: "GET /finnes-ikke HTTP/1.1" },
      { no: "2", time: "0.010", src: "10.0.0.20", dst: "10.0.0.5", proto: "HTTP", info: "HTTP/1.1 404 Not Found" },
    ],
    questions: [
      {
        prompt: "Hva returnerer serveren?",
        options: [
          { text: "404 Not Found — ressursen finnes ikke", correct: true },
          { text: "500 — server-feil", correct: false },
          { text: "403 — forbudt", correct: false },
          { text: "200 — OK", correct: false },
        ],
        explanation: "4xx-koder = klient-feil. 404 spesifikt = filen/endpoint-en finnes ikke.",
      },
    ],
  },

  // 11. TLS 1.2 vs 1.3
  {
    id: "pcap-tls12-flow",
    title: "TLS 1.2-handshake (eldre)",
    scenario:
      "En eldre klient/server snakker TLS 1.2. Forskjellen til 1.3: sertifikat sendes i klartekst, og handshake tar 2 RTT.",
    difficulty: 3,
    topic: "HTTPS / TLS",
    rows: [
      { no: "1", time: "0.000", src: "10.0.0.5", dst: "93.184.216.34", proto: "TLSv1.2", info: "Client Hello" },
      { no: "2", time: "0.025", src: "93.184.216.34", dst: "10.0.0.5", proto: "TLSv1.2", info: "Server Hello" },
      { no: "3", time: "0.025", src: "93.184.216.34", dst: "10.0.0.5", proto: "TLSv1.2", info: "Certificate, Server Key Exchange, Server Hello Done" },
      { no: "4", time: "0.050", src: "10.0.0.5", dst: "93.184.216.34", proto: "TLSv1.2", info: "Client Key Exchange, Change Cipher Spec, Finished" },
      { no: "5", time: "0.075", src: "93.184.216.34", dst: "10.0.0.5", proto: "TLSv1.2", info: "Change Cipher Spec, Finished" },
      { no: "6", time: "0.076", src: "10.0.0.5", dst: "93.184.216.34", proto: "TLSv1.2", info: "Application Data" },
    ],
    questions: [
      {
        prompt: "Hva er den synlige forskjellen mellom TLS 1.2 og 1.3 i pcap-utskriften?",
        options: [
          { text: "TLS 1.2 har 2 RTT (handshake går frem og tilbake to ganger); sertifikatet er klart synlig som egen melding", correct: true, rationale: "I 1.3 er sertifikatet kryptert (etter Server Hello). I 1.2 går det i klartekst." },
          { text: "TLS 1.2 bruker andre porter", correct: false, rationale: "Begge bruker 443 for HTTPS." },
          { text: "TLS 1.2 har ingen Client Hello", correct: false },
          { text: "TLS 1.2 er kjappere", correct: false, rationale: "Motsatt — TLS 1.3 er kjappere fordi det er færre round-trips." },
        ],
        explanation: "TLS 1.3 forenklet handshake-en betraktelig: 1 RTT i stedet for 2, og sertifikatet flyttet inn i kryptert seksjon.",
      },
    ],
  },

  // 12. DNS-spoofing (response with wrong IP)
  {
    id: "pcap-dns-spoof",
    title: "DNS-spoofing — to svar med ulik IP",
    scenario:
      "Klienten slår opp nettbank.no. Du ser TO svar med samme transaction ID — men med ulik IP-adresse. Det første svaret når klienten først.",
    difficulty: 3,
    topic: "DNS",
    rows: [
      { no: "1", time: "0.000", src: "10.0.0.5",  dst: "8.8.8.8",  proto: "DNS", info: "Standard query 0xdead A nettbank.no" },
      { no: "2", time: "0.003", src: "10.0.0.99", dst: "10.0.0.5", proto: "DNS", info: "Standard query response 0xdead A 198.51.100.99 (TTL=3600)" },
      { no: "3", time: "0.018", src: "8.8.8.8",   dst: "10.0.0.5", proto: "DNS", info: "Standard query response 0xdead A 203.0.113.5  (TTL=300)" },
    ],
    questions: [
      {
        prompt: "Hva ser ut til å skje her?",
        options: [
          { text: "Et off-path DNS-spoofing-forsøk — angriperen 10.0.0.99 svarer raskere enn ekte DNS", correct: true, rationale: "Klienten tar første svar. Hvis det matcher transaction ID og er fra forventet kilde-port, godtas det." },
          { text: "DNS-serveren har en bug", correct: false },
          { text: "Det er normalt for DNS å sende to svar", correct: false, rationale: "Et svar per spørring er normalt." },
          { text: "Klienten har sendt to spørringer", correct: false, rationale: "Bare én spørring (ramme 1)." },
        ],
        explanation: "DNSSEC ville fanget dette (signaturen ville ikke matche). DoH/DoT skjuler spørring fra angriperen i utgangspunktet.",
      },
      {
        prompt: "Hva forsvarer mest direkte mot denne klassen angrep?",
        options: [
          { text: "DNSSEC (signaturer i DNS-svar) og DoH/DoT (DNS over kryptert kanal)", correct: true },
          { text: "Bytte til IPv6", correct: false, rationale: "DNS spoofing er protokoll-uavhengig av IP-versjon." },
          { text: "Sterkere passord på resolveren", correct: false },
          { text: "Aktivere stateful brannmur", correct: false, rationale: "Hjelper ikke — DNS-svaret går på etablert tilkobling." },
        ],
        explanation: "DNS er gammelt og uautentisert by default. DNSSEC + DoT/DoH er svaret.",
      },
    ],
  },

  // 13. SYN flood
  {
    id: "pcap-syn-flood",
    title: "SYN flood (DDoS)",
    scenario:
      "Du ser tusenvis av SYN-pakker fra ulike falske IP-adresser. Ingen fullføres med ACK.",
    difficulty: 3,
    topic: "Port-skanning",
    rows: [
      { no: "1", time: "0.000", src: "192.0.2.1",   dst: "10.0.0.20", proto: "TCP", info: "5544 → 443 [SYN]" },
      { no: "2", time: "0.000", src: "198.51.100.7",dst: "10.0.0.20", proto: "TCP", info: "9123 → 443 [SYN]" },
      { no: "3", time: "0.000", src: "203.0.113.4", dst: "10.0.0.20", proto: "TCP", info: "1024 → 443 [SYN]" },
      { no: "4", time: "0.001", src: "10.0.0.20",   dst: "192.0.2.1", proto: "TCP", info: "443 → 5544 [SYN, ACK]" },
      { no: "5", time: "0.001", src: "10.0.0.20",   dst: "198.51.100.7", proto: "TCP", info: "443 → 9123 [SYN, ACK]" },
      { no: "...", time: "...", src: "...", dst: "...", proto: "...", info: "... og tusenvis flere ..." },
    ],
    questions: [
      {
        prompt: "Hva er angrepet og hva er målet?",
        options: [
          { text: "SYN flood — fylle serverens connection-tabell med half-open-tilkoblinger så ekte klienter ikke får plass", correct: true, rationale: "Hver SYN reserverer ressurser i kernelen til timeout eller ACK kommer. Tusenvis = ressursutsulting." },
          { text: "Port-skanning", correct: false, rationale: "Port-skann har én angriper, ikke tusen. Og bytter porter, ikke avsender." },
          { text: "ARP-spoofing", correct: false, rationale: "Det er ikke ARP." },
          { text: "Helt vanlig trafikk", correct: false },
        ],
        explanation: "Forsvar: SYN cookies (kernelen reserverer ingen ressurs før ACK), rate limiting på brannmur, anti-DDoS-tjeneste (Cloudflare).",
      },
    ],
  },

  // 14. HTTP redirect
  {
    id: "pcap-http-redirect",
    title: "HTTP til HTTPS-redirect",
    scenario:
      "Klienten besøker http://example.com. Server svarer med en 301 til https://example.com.",
    difficulty: 2,
    topic: "HTTP",
    rows: [
      { no: "1", time: "0.000", src: "10.0.0.5", dst: "93.184.216.34", proto: "HTTP", info: "GET / HTTP/1.1" },
      { no: "2", time: "0.025", src: "93.184.216.34", dst: "10.0.0.5", proto: "HTTP", info: "HTTP/1.1 301 Moved Permanently (Location: https://example.com/)" },
      { no: "3", time: "0.050", src: "10.0.0.5", dst: "93.184.216.34", proto: "TCP", info: "→ 443 [SYN] (ny tilkobling til HTTPS)" },
    ],
    questions: [
      {
        prompt: "Hva betyr 301 her?",
        options: [
          { text: "Permanent redirect — bruk Location-headerens URL fra nå av", correct: true, rationale: "302 er midlertidig, 301 lar nettleseren cache-redirect-en permanent." },
          { text: "Forbidden", correct: false, rationale: "Det er 403." },
          { text: "Server-feil", correct: false, rationale: "Det er 5xx." },
          { text: "Cache hit", correct: false, rationale: "Det er 304." },
        ],
        explanation: "Best practice: kjør HSTS-header også (Strict-Transport-Security) så nettleseren ikke prøver HTTP igjen.",
      },
    ],
  },

  // 15. Multi-question DNS + HTTP combo
  {
    id: "pcap-combined-dns-http",
    title: "Full nettside-lasting (DNS + TCP + HTTP)",
    scenario:
      "Hele forløpet av å laste http://example.com — fra DNS-oppslag til HTTP-svaret.",
    difficulty: 2,
    topic: "HTTP",
    rows: [
      { no: "1", time: "0.000", src: "10.0.0.5", dst: "8.8.8.8",          proto: "DNS",  info: "Standard query A example.com" },
      { no: "2", time: "0.018", src: "8.8.8.8",  dst: "10.0.0.5",         proto: "DNS",  info: "Standard query response A 93.184.216.34" },
      { no: "3", time: "0.020", src: "10.0.0.5", dst: "93.184.216.34",    proto: "TCP",  info: "49152 → 80 [SYN]" },
      { no: "4", time: "0.044", src: "93.184.216.34", dst: "10.0.0.5",    proto: "TCP",  info: "80 → 49152 [SYN, ACK]" },
      { no: "5", time: "0.045", src: "10.0.0.5", dst: "93.184.216.34",    proto: "TCP",  info: "49152 → 80 [ACK]" },
      { no: "6", time: "0.046", src: "10.0.0.5", dst: "93.184.216.34",    proto: "HTTP", info: "GET / HTTP/1.1" },
      { no: "7", time: "0.072", src: "93.184.216.34", dst: "10.0.0.5",    proto: "HTTP", info: "HTTP/1.1 200 OK" },
    ],
    questions: [
      {
        prompt: "Hvilket display-filter viser BARE HTTP-rammene (ikke DNS eller TCP)?",
        options: [
          { text: "http", correct: true, rationale: "Wireshark-display-filter er enkelt: protokoll-navnet matcher alt på den protokollen." },
          { text: "tcp.port == 80", correct: false, rationale: "Det viser HTTP, men ogsa TCP-handshake-rammene (3,4,5)." },
          { text: "dst port 80", correct: false, rationale: "Det er BPF capture filter-syntaks — ikke display filter." },
          { text: "ip.addr == 93.184.216.34", correct: false, rationale: "Inkluderer DNS-svaret hvis IP matcher, men her er det fra annen kilde." },
        ],
        explanation: "Display filter 'http' matcher kun rammer Wireshark har klassifisert som HTTP-laget. Filtrer mer presist med http.request, http.response, etc.",
      },
      {
        prompt: "Hvor mange round-trips fra DNS-spørringen til klienten har HTML i hånda?",
        options: [
          { text: "3: DNS (1), TCP-handshake (1), HTTP request/response (1)", correct: true, rationale: "DNS-lookup, så TCP-handshake, så HTTP request+response. Hver er én round-trip." },
          { text: "1", correct: false },
          { text: "7 (en per ramme)", correct: false, rationale: "Round-trip = en frem og en tilbake. Det er færre RT-er enn rammer." },
          { text: "2", correct: false, rationale: "Vi glemmer ikke DNS-en." },
        ],
        explanation: "Derfor finnes HTTP/3 med 0-RTT og DNS-prefetch — for å fjerne disse rundene.",
      },
    ],
  },
];
