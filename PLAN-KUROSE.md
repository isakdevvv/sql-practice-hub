# Plan: Integrering av Kurose-Ross 8. utg. i SQL Practice Hub

Denne planen er basert på en parallell gjennomgang av alle åtte kapitler i
*Kurose & Ross, Computer Networking: A Top-Down Approach, 8th Edition* (775 sider).
Hver seksjon under sammenligner bokens kjernepedagogikk med eksisterende innhold
i repoet og foreslår konkrete tillegg — mini-kurs, drag-oppgaver,
Python-oppgaver og simulatorer.

Sidetall refererer til **trykte sider** i boken.

---

## Topp-10 prioriterte tillegg (samlet anbefaling)

Disse skiller seg ut som de mest verdifulle å lage først — enten fordi de fyller
ekte hull, eller fordi de er bokens egne pedagogiske toppmomenter ("crescendoer"):

| # | Tittel | Type | Begrunnelse |
|---|--------|------|-------------|
| 1 | **"A Day in the Life of a Web Page Request"** (24 trinn) | Interaktiv side | Bokens crescendo i Ch 6.7. Integrerer DHCP→ARP→DNS→ruting→TCP→HTTP i én historie. Pensum-gull. |
| 2 | **ap1.0 → ap4.0 — autentisering steg for steg** | Mini-kurs | Bokens flaggskip-eksempel i Ch 8.4. Viser hvorfor nonce er nødvendig via en filosofisk progresjon. |
| 3 | **rdt1.0 → rdt3.0 — bygge pålitelighet** | Mini-kurs | Parallellen til ap-progresjonen, i Ch 3.4. Ett problem av gangen. |
| 4 | **De fire forsinkelsene (proc/queue/trans/prop)** | Mini-kurs + Python | Mangler helt — Ch 1.4. Karavananalogi er gull. |
| 5 | **Count-to-infinity-simulator** (4→60, 44 iterasjoner) | Interaktiv | Konkret tallpatologi fra Ch 5.2. Demonstrerer "bad news travels slowly". |
| 6 | **HTTP/1.1 vs HTTP/2: HOL-blokkering** | Mini-kurs | Stort hull. Ch 2.2.6 har konkret regnestykke vi kan reprodusere. |
| 7 | **Switch self-learning (animert)** | Interaktiv | Ch 6.4.3. Boka kaller det "wonderful" — vi bør vise det live. |
| 8 | **AIMD-sagtann + fairness-konvergens** | Simulator | Ch 3.7. Vi har `CongestionWindowSim.tsx` — utvid med to strømmer som konvergerer mot likhetslinjen. |
| 9 | **NAT-tabell-oppslag som Python-oppgave** | Python-oppgave | Ch 4.3.3. Konkret kode mot "WAN↔LAN port-rewriting". |
| 10 | **TCP RTT-estimering (EWMA Karn/Jacobson)** | Python-oppgave | Ch 3.5.3. Klassisk formel + plot vs SampleRTT — perfekt øvelse. |

Resten av planen detaljerer hvert kapittel.

---

## Kapittel 1 — Computer Networks and the Internet (s. 1-80)

### Eksisterende dekning
`osi-tcpip.tsx`, `dte2507-paket-dekoding.tsx`, `http-anatomi.tsx`.

### Hull
Vi har **lag-modellen og headerne**, men ikke bokens **kvantitative ytelsesmodeller**:
- d_nodal = d_proc + d_queue + d_trans + d_prop (formel s. 35-37)
- Karavananalogi (s. 37-38): biler=bits, bomstasjon=router
- Trafikkintensitet La/R "Golden rule: ≤ 1" (s. 39)
- Bottleneck-link: throughput ≈ min{R_i} (s. 44)
- Restaurant-reservasjon-metafor (s. 27): circuit vs packet switching
- Statistisk multipleksing (s. 30-31): 10 brukere circuit vs 35 packet med &lt;0.04% overlast
- Network-of-networks: tier-1, IXP, peering, content-provider-nett

### Konkrete forslag
1. **Mini-kurs `dte2507-delay-modell.tsx` — "De fire forsinkelsene"**
   Bygger d_nodal opp fra null med karavananalogi (10 biler, bom 1 bil/12 s).
   Interaktiv: bruker velger L, R, d, s og ser hvilken komponent dominerer
   (LAN vs geostasjonær satellitt).

2. **Python-oppgave: "Beregn end-to-end delay"**
   Gitt L=1500 byte, N=3 lenker, prop-speed 2.5·10⁸ m/s, d_proc=3 ms.
   Studenten skriver `nodal_delay(L, R, d, s, d_proc)` og summerer.

3. **Drag-oppgave: "Match metafor til konsept"**
   Karavane↔packet, bomstasjon↔router, restaurant-reservasjon↔circuit switching,
   konvolutt-i-konvolutt↔encapsulation.

4. **Mini-kurs `dte2507-bottleneck-throughput.tsx`** — interaktive slidere for
   R_server, R_client, R_core. Forklarer hvorfor speedtest gir det den gir.

5. **Python-oppgave: "Statistisk multipleksing — Monte Carlo"**
   Simuler 35 brukere, hver aktiv 10% av tida, estimer P(&gt;10 samtidige) og
   sammenlign med binomial. Knytter til TEK-1501/DTE-2602.

6. **Mini-kurs `dte2507-network-of-networks.tsx`** — Ch 1.3.3 "Network Structure 1→5".
   Tier-1, IXP, peering, Googles private backbone. Mangler helt nå.

### Beste sitat
&gt; "Design your system so that the traffic intensity is no greater than 1."
&gt; (s. 39)

---

## Kapittel 2 — Application Layer (s. 81-180)

### Eksisterende dekning
`http-anatomi.tsx`, `dte2507-dns-dyp.tsx`, `dte2507-socket-programmering.tsx`.

### Hull
- HTTP/1.1 persistent vs non-persistent — **RTT-utregning**
- HTTP/2 framing + HOL-blokkering (Ch 2.2.6)
- Web caching ytelses-utregning (trafikkintensitet, hit-rate)
- Conditional GET / 304 Not Modified
- BitTorrent: rarest-first, tit-for-tat, optimistic unchoke
- CDN-server-valg (NetCinema→KingCDN-eksempelet, s. 148)
- DASH manifest, bitrate-tilpassing, byte-range
- UDP socket-programmering (vi har sannsynligvis bare TCP)
- P2P vs klient-server distribusjonstid-formel

### Konkrete forslag
1. **Mini-kurs: "HTTP/1.1 vs HTTP/2 — hvorfor ikke bare 6 parallelle?"**
   RTT-utregning per objekt (non-persistent = 2·RTT, persistent+pipelining ≈ 1·RTT),
   HOL-blokkering med video-først-eksempelet, frames + prioritetsvekter 1-256.
   Metafor: kø-blokkering på Rema.

2. **Drag-oppgave: "BitTorrent chunk-handel"**
   5 peers med ulike chunk-sett. Studenten drar (a) rarest-first-rekkefølge,
   (b) hvilke 4 peers Alice unchoker, (c) optimistic-unchoke. (s. 142)

3. **Python-oppgave: "Mini-CDN-resolver"**
   Studenten skriver regex som returnerer enten origin-IP eller CDN-CNAME
   (`a1105.kingcdn.com`) basert på `Host:`-header. (s. 148)

4. **Mini-kurs: "Web-caching matematikk"**
   Reproduser bokens eksempel s. 110-112: 15 req/s × 1 Mbit / 15 Mbps = ρ=1.
   Med cache-hit 0.4 reduseres delay fra ∞ til ~1.2 s.

5. **Python-oppgave: "Conditional GET-klient"**
   Send GET med `If-Modified-Since`, parse `304 Not Modified` vs `200 OK`.

6. **Mini-kurs / drag-oppgave: "DASH bitrate-tilpassing"**
   Gitt buffer-fyllingsgrad og målt båndbredde, dra hvilken bitrate-versjon
   klienten ber om for neste 4-sek-chunk.

### Beste sitat
&gt; "If BitTorrent had been designed without tit-for-tat (or a variant), but
&gt; otherwise exactly the same, BitTorrent would likely not even exist now."
&gt; (s. 143)

---

## Kapittel 3 — Transport Layer (s. 181-302)

### Eksisterende dekning
`transportlag.tsx`, `dte2507-congestion-control.tsx` (med `CongestionWindowSim`),
`tcp-sockets.tsx`.

### Hull
Eksisterende dekning er **konseptuelt riktig men grunn**:
- Ingen FSM-formalisme for rdt
- Ingen GBN vs SR-distinksjon
- Ingen RTT-formler (Jacobson/Karels EWMA)
- Ingen TCP-state-diagram (CLOSED→SYN_SENT→ESTABLISHED→FIN_WAIT→TIME_WAIT)
- Ingen UDP-checksum-beregning
- Ingen SYN flood + SYN cookies (knytter til kryptografi vi alt har!)
- Ingen Karn-detalj eller eksponentiell timer-backoff
- Ingen kobling rdt→TCP som forklarer hvorfor TCP ser ut som den gjør

### Konkrete forslag (det største kapitlet — flest forslag)
1. **Mini-kurs: "rdt1.0 → rdt3.0 — bygge pålitelighet ett problem av gangen"**
   FSM-diagrammer for hver versjon. Hver protokoll innfører ETT nytt verktøy
   (ACK/NAK → seq# → duplikat-ACK → timer) mot ETT nytt problem.
   Avslutter med stop-and-wait sin **0.00027 utnyttelse** på 1 Gbps coast-to-coast.

2. **Drag-oppgave: GBN vs SR — hvilken pakke retransmitteres?**
   Tap-scenario (pkt2 mistes, pkt3-5 ankommer). Elev plukker hvilke som
   retransmitteres under GBN (alle fra base) vs SR (kun pkt2).

3. **Python-oppgave: "Implementer Jacobson/Karels EWMA"**
   Liste `SampleRTT = [...]`. Implementer α=0.125, β=0.25.
   `TimeoutInterval = EstimatedRTT + 4·DevRTT`. Plot mot SampleRTT.
   Bonus: Karn-regel.

4. **Simulator: TCP AIMD-sagtann + fairness-konvergens**
   Utvid `CongestionWindowSim.tsx`. To strømmer plottet i (R₁, R₂)-plan,
   viser hvordan 45°-økning + halvering konvergerer mot likhetslinjen.

5. **Mini-kurs: "TCP connection management — håndtrykk, lukking, angrep"**
   State-diagrammet for klient og server. Hvorfor TIME_WAIT = 2·MSL.
   **SYN flood + SYN cookies** — server koder state inn i ISN som hash.

6. **Drag/Python-oppgave: UDP-checksum**
   Tre 16-bit ord. Sum med wraparound (1-er-komplement), ta 1-er-komplement,
   sammenlign med checksum-felt. End-to-end principle som motivasjon.

7. **Mini-kurs: "Slow start kaster sand i vinden" — Tahoe, Reno, CUBIC**
   FSM med tre tilstander (slow start / CA / fast recovery), eksakte
   cwnd/ssthresh-oppdateringer ved hver hendelse, sammenligningsgraf.
   Forklarer Linux=CUBIC, Google=BBR.

### Beste sitat
&gt; "The TCP sender's behavior is perhaps analogous to the child who requests
&gt; (and gets) more and more goodies until finally he/she is finally told 'No!',
&gt; backs off from that, but then begins making requests again shortly afterward."
&gt; (s. 265)

---

## Kapittel 4 — Network Layer: Data Plane (s. 303-376)

### Eksisterende dekning
`dte2507-subnetting.tsx`, `dte2507-paket-dekoding.tsx`, Python subnet-kalkulator.
Dekker CIDR + IPv4-header godt.

### Hull
- Router-internals (input/output port, switching fabric, queuing)
- Head-of-line (HOL) blocking
- Bufferbloat ("buffering is like salt", s. 323)
- Packet scheduling: FIFO/PQ/RR/WFQ (knytter til net neutrality)
- NAT-tabell-oppslag
- IP datagram fragmentation
- IPv6 transition (dual-stack, tunneling med protokoll-felt 41)
- SDN/OpenFlow match-action (11 felt)
- Middleboxes-konseptet
- Longest prefix matching som interaktiv lookup-oppgave

### Konkrete forslag
1. **Mini-kurs: "Inni en ruter" + HOL-blocking-simulator**
   Input ports → switch fabric → output ports. Visualiser HOL med 3 input-køer
   mot crossbar. Inkluder Karol 1987 (58 % terskel). Metafor: ruter=rundkjøring.

2. **Drag-oppgave: Packet scheduling (FIFO / PQ / RR / WFQ)**
   5 numererte pakker med ankomsttider og prioritetsklasser. Drag til riktig
   departure-tidspunkt under hver disiplin. WFQ med vekter (w1=3, w2=1).

3. **Python-oppgave: NAT-tabell-oppslag**
   Gitt `{(WAN IP, WAN port): (LAN IP, LAN port)}`. Skriv `translate(packet, table)`.
   Andre del: implementer "new entry"-allokering (ledig WAN-port 1024-65535).

4. **Mini-kurs: IPv6-transisjon med tunneling**
   Hvorfor "flag day" er umulig. Dual-stack vs tunneling. Bruk figure 4.27.
   Vis encapsulation steg for steg.

5. **Python-oppgave: Longest prefix match**
   Gitt forwarding table med (prefix, interface)-par, implementer
   `lookup(dest_ip, table)`. Bokens eksempel s. 315.

6. **Drag-oppgave: OpenFlow match-plus-action**
   Boksens nett fra figure 4.30. Dra flow-table-entries til riktig switch for
   (a) forwarding, (b) load balancing, (c) blokker 10.3.*.*.

### Beste sitat
&gt; "Buffering is a bit like salt — just the right amount of salt makes food
&gt; better, but too much makes it inedible!" (s. 323)

---

## Kapittel 5 — Network Layer: Control Plane (s. 377-448)

### Eksisterende dekning
`dte2507-ruting.tsx` med `RoutingGraphSim` og `LpmTrainer`. Dijkstra og
Bellman-Ford pseudokode finnes. Kort om count-to-infinity, BGP, SDN.

### Hull
- **Konkret count-to-infinity-tallspill** (4→60-eksempelet, 44 iterasjoner)
- BGP route-selection som beslutningstre (LOCAL_PREF→AS_PATH→hot potato→ID)
- IP-anycast (DNS-root, hvorfor CDN-er ikke bruker det for TCP)
- ICMP-typetabell og Traceroute-mekanikken (TTL-trikset)
- OpenFlow message-flow (controller↔switch: packet-in, flow-mod, port-status)
- SNMP vs NETCONF/YANG-kontrast

### Konkrete forslag
1. **"Count-to-infinity-simulator"** — gjenskap fig 5.7. Slider for `c(x,y)`,
   animer ryktekjeden over 44 iterasjoner. Toggle poisoned reverse.
   Metafor: "bad news travels slowly".

2. **"BGP-rutevelger-stige"** — 3-4 konkurrerende ruter, vis hvordan filtrene
   anvendes i streng rekkefølge. Hot-potato-metaforen: "pakken brenner, gi den fra deg".

3. **"IP-anycast og DNS-rot"** — 13 IP-adresser, 100+ servere. Mini-kart hvor
   klient i Tromsø og Sydney lander på ulike instanser. Sidekommentar:
   hvorfor ikke brukt for TCP (BGP-konvergens bryter flows).

4. **"ICMP type/code-quiz + Traceroute-trinn"** — interaktiv tabell over
   typene (0, 3/x, 8, 11). Animer Traceroute: TTL=1→11/0 fra første ruter, osv.

5. **"OpenFlow message-spill"** — sekvensdiagram av s1↔s2-lenke som faller.
   `port-status` opp → controller → flow-table-manager → `modify-state` ned.

6. **"SNMP vs NETCONF-sammenligning"** — SNMP `GetRequest`/UDP/MIB-OID side om
   side med NETCONF-`&lt;edit-config&gt;` XML over TLS. Pek på *atomic* og *lock*.

### Beste sitat
&gt; "A routing loop is like a black hole — a packet destined for x arriving at y
&gt; or z as of t1 will bounce back and forth between these two nodes forever."
&gt; (s. 393)

---

## Kapittel 6 — Link Layer and LANs (s. 449-530)

### Eksisterende dekning
`dte2507-brannmur-vlan.tsx`, `dte2507-paket-dekoding.tsx` (Ethernet header),
`dte2507-praksis.tsx` (NetworkTopology).

### Hull
- CRC-utregning (modulo-2-divisjon steg for steg)
- ALOHA/CSMA-effektivitet (Np(1-p)^(N-1), maks 1/e ≈ 37%)
- CSMA/CD vs CSMA/CA + binær eksponentiell backoff
- ARP-protokollen (request/reply, broadcast, cache, "ARP off-subnet"-paradokset)
- Switch self-learning (animert tabell-oppbygging)
- Data center fat-tree / Clos / ECMP
- **"A Day in the Life of a Web Page Request" — bokens crescendo**

### Konkrete forslag
1. **"CRC-kalkulator: modulo-2-divisjon"** — interaktiv øvelse. Bokens eksempel
   D=101110, G=1001, r=3 → R=011 (s. 460). Vis XOR-trinn for trinn.

2. **"ALOHA-kasinoet"** — simulator med N og p-slidere. Vis Np(1-p)^(N-1) →
   maksimum 1/e. Slots som C/E/S (kollisjon/tom/suksess) som fig 6.10.
   Cocktail-party-metafor.

3. **"Switch husker hvem du så snakke"** — animert self-learning. Bygg på
   `NetworkTopology`. Frames flyter, tabellen fylles fra source-MAC, aging-timer.
   Metafor: resepsjonist som lærer hvilken etasje hver person bor i.

4. **"ARP-detektiv"** — drag/Q&amp;A. Bokens scenario fig 6.19: host i Subnet 1
   sender til host i Subnet 2. Hvilken MAC går i frame? Svar: gateway-routerens,
   ikke destinasjonens. Sosialsikkerhetsnummer-vs-postadresse-metaforen.

5. **"CSMA/CD backoff-terning"** — mini-spill. Etter n kollisjoner, trill
   {0...2^n-1}. Vis eksponentiell vekst.

6. **"Datasenter-fat-tree: hvorfor multi-path?"** — kalkulator s. 508. 40 flows,
   100 Gbps tier-link → 2.5 Gbps/flow. ECMP løser flaskehalsen.

### **SPESIAL: "A Day in the Life of a Web Page Request" — STERKT ANBEFALT**

Dette er bokens **crescendo**. Lag en **dedikert interaktiv side**
(f.eks. `dte2507-day-in-the-life.tsx`) med 24-stegs walkthrough:

- **Setting**: Bob plugger laptop i skole-Ethernet, taster `www.google.com`
- **Fase 1 (steg 1-7)**: DHCP — DHCP request i UDP/IP-broadcast/Ethernet-broadcast
- **Fase 2 (steg 8-13)**: DNS + ARP — DNS-query må sendes til gateway, men
  laptop kjenner ikke gateway-MAC → ARP broadcast → DNS-query
- **Fase 3 (steg 14-17)**: Intra/inter-domain routing — DNS-query gjennom
  skole→Comcast (OSPF internt, BGP mellom AS)
- **Fase 4 (steg 18-21)**: TCP 3-veis handshake (SYN, SYNACK, ACK) til Google
- **Fase 5 (steg 22-24)**: HTTP GET → response → side vises

UI-forslag: scroll-drevet animasjon der Bob/Switch/Router/DNS/Google "lyser opp"
når de er involvert. Steg-teller 1/24, 2/24, … Integrerer kap. 1-6 i én historie.

### Beste sitat
&gt; "An ARP query is equivalent to a person shouting out in a crowded room of
&gt; cubicles: 'What is the social security number of the person whose postal
&gt; address is Cubicle 13, Room 112, AnyCorp, Palo Alto, California?'" (s. 482)

---

## Kapittel 7 — Wireless and Mobile Networks (s. 531-606)

### Eksisterende dekning
**Ingen.** Søk i `src/lib/stack/content/` ga 0 treff på wireless, wifi, 802.11,
csma, mobil, cellular, 4g, 5g, bluetooth.

### Prioritetsanbefaling
**Lav-til-medium.** Hvis DTE-2507 primært er tråd-fokusert, er Ch 7 supplerende.
Men kapitlet har pedagogisk lekkert stoff og studenter har konkret hverdagsforhold
til WiFi/4G — derfor lønner det seg å lage **ett samlet mini-kurs**, ikke flere.

### Konkret forslag (én side, ikke flere)
1. **Mini-kurs `dte2507-tradlost-overlook.tsx` — "Trådløse nett: hva er annerledes?"**
   Dekker:
   - **Hidden terminal-problem** (s. 539): A og C ser begge B men ikke hverandre
   - **CSMA/CA vs CSMA/CD**: hvorfor WiFi unngår, ikke detekterer kollisjoner
     (kan ikke sende og lytte samtidig)
   - **802.11-frame** med 4 MAC-felt
   - **4G LTE-arkitektur**: UE, eNode-B, MME, HSS, S/P-GW — som diagram, ikke matematikk
   - **Triangle routing + Mobile IP** kort

   Hopp over: CDMA-matematikk, Bluetooth-detaljer, 5G NR-detaljer.

### Beste sitat
&gt; "The ability to detect collisions requires the ability to send and receive
&gt; at the same time. Because the strength of the received signal is typically
&gt; very small compared to the strength of the transmitted signal at the 802.11
&gt; adapter, it is costly to build hardware that can detect a collision." (s. 548)

---

## Kapittel 8 — Security in Computer Networks (s. 607-690)

### Eksisterende dekning
`kryptografi.tsx`, `dte2507-tls-handshake.tsx`, `dte2507-rsa-mini.tsx`,
`nettverkssikkerhet.tsx`, `dte2507-brannmur-vlan.tsx`, `tls.tsx`.
Python-oppgaver: RSA-mini, Caesar/Vigenère, Hashing, X.509-tolking.

### Hull
- **ap1.0 → ap4.0 — bokens flaggskip-eksempel**
- HMAC-konstruksjon og hvorfor naiv `H(m)` ikke gir integritet
- Diffie-Hellman key exchange med konkret regnestykke + MITM
- CBC + IV (hvorfor deterministic block cipher lekker mønstre)
- Stateful vs stateless firewall (ACK=1-hullet)
- IDS: signature-based (Snort) vs anomaly-based, DMZ-plassering
- Replay/playback attack + nonce som generelt prinsipp
- PGP web of trust vs CA-hierarki

### Konkrete forslag
1. **Mini-kurs: "Autentiseringsprotokollene ap1.0 → ap4.0"** — BOKENS BESTE
   EKSEMPEL ved siden av rdt. Steg for steg:
   - ap1.0 "I am Alice" → triviell
   - ap2.0 IP-adresse → IP-spoofing slår den
   - ap3.0 passord → sniffing
   - ap3.1 kryptert passord → **playback attack**
   - ap4.0 introduserer **nonce R**
   Inkluder P15-stil oppgave: Trudy interleaver to sesjoner og bruker Bobs nonce
   mot ham.

2. **Python-oppgave + visualisering: "Diffie-Hellman + MITM"**
   Regn ut `T_A, T_B, S` med `p=11, g=2, S_A=5, S_B=12`. Vis MITM-angrep med
   tidsdiagram. Forklar hvorfor DH alene ikke autentiserer.

3. **Mini-kurs: "Fra checksum til HMAC"**
   Demo IOU100.99BOB → IOU900.19BOB med samme checksum. Bygg opp: cryptographic
   hash → naiv `H(m)` → MAC = `H(m‖s)` → HMAC.

4. **Drag-oppgave: "Stateful vs stateless brannmur"**
   Pakketabell-eksempel fra Table 8.6/8.8. Vis hvorfor ACK=1-regelen slipper
   malformed packets statelessly, og hvordan connection table fikser det.

5. **Mini-kurs: "IDS: signature vs anomaly + DMZ"**
   Snort-regel-eksempel (`alert icmp ... msg:"ICMP PING NMAP"`), DMZ-arkitektur,
   trade-offs.

6. **Mini-kurs: "CBC og hvorfor like blokker er farlige"**
   Vis ECB-lekkasje (penguin-bilde-stilen), så CBC med IV. Knytt til TLS-modulen.

### Beste sitat
&gt; "A nonce is a number that a protocol will use only once in a lifetime."
&gt; (s. 638)

---

## Filosofiske ledetråder fra boka

To bærende pedagogiske mønstre i Kurose-Ross som vi bør gjenbruke:

### 1. Progresjonene
Boka bygger to ikoniske ladders der hver versjon legger til ETT verktøy mot ETT
nytt problem:

- **rdt 1.0 → 3.0** (Ch 3): perfekt kanal → bit-feil → pakketap
- **ap 1.0 → 4.0** (Ch 8): "jeg er Alice" → IP → passord → kryptert passord (playback!) → nonce

Begge er gull for læring. Vi bør lage dem som **animerte steg-for-steg-sider**
med "Trudys angrep" som rød tråd.

### 2. Metaforene
Boka har en samlet metafor-portefølje vi bør lene oss på:

| Metafor | Konsept | Side |
|---------|---------|------|
| Trucks on highways | Pakker i nettet | 4 |
| Caravan at tollbooths | d_trans vs d_prop | 37-38 |
| Restaurant reservation vs walk-in | Circuit vs packet switching | 27 |
| Letter in envelope in envelope | Encapsulation | 53 |
| Postal address vs SSN | IP vs MAC | 479 |
| Hot potato | BGP routing preference | 404 |
| Cocktail party | Multiple access protocols | 463 |
| Salt in food | Buffer-sizing | 323 |
| Black hole | Routing loops | 393 |
| Receptionist learning floors | Switch self-learning | 493 |

Lag en dedikert **"Metafor-arkiv"-side** der hver metafor er en visuell flashcard
med kobling til riktig stack-modul.

---

## Foreslått implementeringsrekkefølge

### Fase 1 — Quick wins (1-2 dager)
Disse er små, høyt-verdige tillegg som ikke krever store nye komponenter:
- Python-oppgaver: RTT-estimering, UDP-checksum, NAT-lookup, LPM,
  Statistisk multipleksing, Conditional GET, DH key exchange
- Drag-oppgaver: GBN vs SR, Packet scheduling, BitTorrent chunk-handel,
  ARP-detektiv, Metafor-matching

### Fase 2 — Mini-kurs (1-2 uker)
Lengre stack-sider med nytt forklaringsstoff:
- **De fire forsinkelsene** (Ch 1)
- **rdt 1.0 → 3.0** (Ch 3) — flaggskip
- **ap 1.0 → 4.0** (Ch 8) — flaggskip
- HTTP/1.1 vs HTTP/2 (Ch 2)
- Web-caching matematikk (Ch 2)
- TCP connection management + SYN cookies (Ch 3)
- IPv6 transition (Ch 4)
- IDS: signature vs anomaly (Ch 8)
- Stateful vs stateless brannmur (Ch 8)

### Fase 3 — Interaktive simulatorer (2-4 uker)
Krever React-komponenter med tilstand:
- Count-to-infinity-simulator (Ch 5)
- ALOHA-kasinoet (Ch 6)
- Switch self-learning animasjon (Ch 6)
- AIMD-sagtann + fairness-konvergens (Ch 3, utvid eksisterende sim)
- HOL-blocking-simulator (Ch 4)
- ICMP/Traceroute-animasjon (Ch 5)

### Fase 4 — Crescendo (1-2 uker)
- **"A Day in the Life of a Web Page Request"** — 24-stegs interaktiv historie.
  Dette er bokens crescendo og repoets crescendo. Gjør sist når alt underlaget
  er på plass.

### Fase 5 — Valgfritt
- Wireless overview (Ch 7) — én side, lav prioritet
- Network-of-networks / tier-1 / IXP (Ch 1.3.3)
- PGP web of trust (Ch 8)
- SDN/OpenFlow utdypning (Ch 4-5)

---

## Estimat

- **Python-oppgaver fra fase 1**: ~12-15 nye oppgaver, ~1500-2000 linjer
  total kode, kan legges i ny fil `exercises-kurose.ts` eller spres på
  eksisterende `exercises-dte2507.ts`.
- **Mini-kurs fase 2**: 8-10 nye `.tsx`-filer à ~300-500 linjer.
- **Simulatorer fase 3**: 5-6 nye komponenter à ~300-600 linjer.
- **"A Day in the Life"**: én dedikert side, ~600-800 linjer.

Totalt: ~10 000-15 000 nye linjer fordelt over 30+ filer. Kan fordeles på flere
sesjoner med tydelig worktree-isolasjon (se `CLAUDE.md`).
