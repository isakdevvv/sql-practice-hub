# Atom-dekomposisjon — DTE-2507 Datakommunikasjon og sikkerhet

**10 stp · Eksamen 30.11.2026 (2 × 2t)**

Plan-agent leste kurset slik: Kurose & Ross-ånd; top-down i undervisning (`Dte2507Hub`), men aktivitetene (paket-dekoding, ARP-detektiv, CRC-kalkulator, RDT-progresjon, TLS, brannmur) gir grunnlag for å bygge atomer bottom-up — fra bit/ramme via IP/TCP til applikasjon, kryptografi og angrep/forsvar. Eksisterende mini-kurs (>30 stack-trinn + 15 pcap-scenarier + 8 Python-øvelser + drag/flashcards) dekker mye, men noen atomer er bare delvis internalisert.

Rekkefølge: bit → ramme → IP → transport → reliability/congestion → applikasjon → krypto-primitiver → TLS/PKI → angrep/forsvar → ytelse.

## Lag 0 — Konseptuelt skjelett

**1. Protokoll**
- Hva: Avtalt format og sekvens av handlinger to parter må følge.
- Forutsetter: —
- Demo: «Bestill kaffe»-rollespill der studenten gjetter neste melding.
- Drill: Gitt fire dialoger, hvilken er en protokoll?
- Status: **delvis** — omtalt i `osi-tcpip.tsx`, ingen frittstående drill.

**2. Pakke-svitsjing vs krets-svitsjing**
- Hva: Pakke = statistisk multipleksing; krets = reservert båndbredde.
- Forutsetter: 1
- Demo: 10 brukere deler 1 Mb/s — bytt mellom TDM-kretser og pakkekø.
- Drill: Når lønner krets seg over pakke?
- Status: **mangler**.

**3. Lagdeling (encapsulation)**
- Hva: Hvert lag wrapper data fra laget over med egen header.
- Forutsetter: 1
- Demo: «Pakk inn brev i konvolutt i pose i container» — drag-and-drop HTTP→TCP→IP→Ethernet.
- Drill: 1500B Ethernet-ramme med HTTP-GET: hvor mange byte er payload?
- Status: **dekket** — `osi-tcpip.tsx`.

**4. OSI vs TCP/IP-modellen**
- Hva: To måter å gruppere de samme funksjonene; TCP/IP er det vi bruker, OSI er sjargongen.
- Forutsetter: 3
- Demo: klikkbar 7-lags vs 5-lags side-ved-side.
- Drill: Hvor i OSI ligger TLS?
- Status: **dekket**.

## Lag 1 — Fysisk og lenkelag

**5. Bit, ramme og MTU**
- Hva: Fysisk laget flytter bits; lenkelaget grupperer i rammer med maks størrelse.
- Forutsetter: 3
- Demo: skyveknapp MTU=576/1500/9000; tell rammer for 12 KB fil.
- Drill: Hvorfor velger man ikke MTU=∞?
- Status: **delvis**.

**6. De fire forsinkelsene**
- Hva: End-to-end-latens = prosessering + kø + transmisjon (L/R) + propagasjon (d/s).
- Forutsetter: 5
- Demo: slider L, R, d, s; vis hvilken term dominerer.
- Drill: R=10 Mbps, L=10 000 bit, d=2000 km, s=2·10⁸ m/s.
- Status: **dekket** — `dte2507-delay-modell.tsx`.

**7. CRC og feilsjekking**
- Hva: Modulo-2-divisjon med en generator gir sjekksum.
- Forutsetter: 5
- Demo: klikk-bit; flipp én bit hos mottaker og se rest ≠ 0.
- Drill: D=1101011011, G=10011. Beregn CRC-rest.
- Status: **dekket** — `dte2507-crc-kalkulator.tsx`.

**8. MAC-adresse og Ethernet-rammen**
- Hva: 48-bits flat identifikator brent i NIC.
- Forutsetter: 5
- Demo: hex-dump med hover over dest-MAC, src-MAC, ethertype, FCS.
- Drill: Hvorfor OUI og NIC-del? Hva betyr ff:ff:ff:ff:ff:ff?
- Status: **delvis**.

**9. ALOHA og medium access (CSMA/CD)**
- Hva: Når flere stasjoner deler medium, regel for hvem som sender.
- Forutsetter: 8
- Demo: «Kasino-styret» — ankomstrate λ og effektiv throughput kollapse rundt 18%.
- Drill: Hvorfor er slottet ALOHA dobbelt så effektivt som pure ALOHA?
- Status: **dekket** — `dte2507-aloha-kasino.tsx`.

**10. Switch self-learning og kollisjonsdomener**
- Hva: L2-switch lærer port for hver MAC ved å se source-MAC.
- Forutsetter: 8
- Demo: klikk 4 hosts; se forwarding-tabellen fylles.
- Drill: Hva skjer hvis to hosts har samme MAC?
- Status: **dekket** — `dte2507-switch-self-learning.tsx`.

**11. ARP — finne MAC fra IP**
- Hva: Broadcast-spørring for å oversette neste-hopp-IP til MAC.
- Forutsetter: 8, 10, 13
- Demo: ARP request/reply, ARP-cache.
- Drill: Hvorfor er gratuitous ARP farlig?
- Status: **dekket** — `dte2507-arp-detektiv.tsx`.

**12. VLAN og 802.1Q-tag**
- Hva: 4-byte tag i Ethernet-rammen lar én switch oppføre seg som flere L2-nett.
- Forutsetter: 10
- Demo: toggle VLAN-tag av/på.
- Drill: Hvorfor må trunk-porter bære tag, men access-porter ikke?
- Status: **dekket** — `dte2507-brannmur-vlan.tsx`.

## Lag 2 — Nettverkslaget (IP)

**13. IPv4-adresse og dotted-decimal**
- Hva: 32 bit som identifiserer et grensesnitt på et nettverk.
- Forutsetter: 3
- Demo: bit-toggler: klikk 32 bit, se desimal-formen.
- Drill: Konverter 11000000.10101000.00000001.00000010.
- Status: **delvis**.

**14. Subnett, maske og CIDR**
- Hva: Prefix-lengde sier hvor mange ledende bit som er nettverket.
- Forutsetter: 13
- Demo: 192.168.1.130/26 → network, broadcast, antall hosts.
- Drill: Hvor mange brukbare hosts i /29?
- Status: **dekket** — `dte2507-subnetting.tsx`.

**15. VLSM og adresseplan**
- Hva: Del en blokk i ulike-store subnett ved å gi størst behov lengst prefix-rom først.
- Forutsetter: 14
- Demo: del 10.0.0.0/22 i fire subnett med 100/50/25/10 hosts.
- Drill: Hvorfor må du sortere kravene fallende?
- Status: **dekket**.

**16. IPv4-headeren felt for felt**
- Hva: 20-byte struktur med versjon, TTL, protokoll, checksum, kilde, dest.
- Forutsetter: 13
- Demo: hex-dump; flipp TTL.
- Drill: Forskjellen TTL vs «hop limit» i IPv6? Hvorfor ingen checksum i IPv6?
- Status: **dekket** — `dte2507-paket-dekoding.tsx`.

**17. IP-forwarding og longest-prefix-match**
- Hva: Ruter slår opp dest-IP i tabell; raden med flest matchende ledende bit vinner.
- Forutsetter: 14
- Demo: LPM-trener: gitt routing-tabell og inn-IP.
- Drill: Hvorfor «longest» og ikke «første treff»?
- Status: **dekket** — `dte2507-ruting.tsx`.

**18. Inni en ruter — input/output-port og kø**
- Hva: Match-action på input-port, switching fabric, output-kø, scheduler.
- Forutsetter: 17, 6
- Demo: justerbar fabric-hastighet; HOL-blokkering.
- Drill: Hvor blir det kø: input eller output?
- Status: **dekket** — `dte2507-inni-ruter.tsx`.

**19. Packet scheduling og fairness**
- Hva: FIFO/PQ/RR/WFQ er ulike regler for hvem som sendes neste.
- Forutsetter: 18
- Demo: tre flows i én kø; toggle scheduler.
- Drill: Hvorfor er FIFO urettferdig?
- Status: **dekket** — `dte2507-packet-scheduling.tsx`.

**20. Intra-AS ruting — link state vs distance vector**
- Hva: OSPF flooder topologi + Dijkstra; RIP utveksler avstander til naboer (Bellman-Ford).
- Forutsetter: 17
- Demo: Dijkstra-steg på 6-noders graf.
- Drill: Hvilken konvergerer raskere ved link-feil?
- Status: **dekket** — `dte2507-ruting.tsx`.

**21. Count-to-infinity-problemet**
- Hva: Distance-vector kan reagere uendelig sakte; split horizon/poison reverse er fiks.
- Forutsetter: 20
- Demo: tre-noders ring der en link dør.
- Drill: Hva er split horizon?
- Status: **dekket** — `dte2507-count-to-infinity.tsx`.

**22. Inter-AS ruting med BGP**
- Hva: Path-vector med policy: preferanse, ikke korteste vei.
- Forutsetter: 20
- Demo: BGP-stige: local-pref → AS-path → MED → eBGP/iBGP.
- Drill: Hvorfor velger ISP lengre AS-sti hvis local-pref er høyere?
- Status: **dekket** — `dte2507-bgp-stige.tsx`.

**23. NAT**
- Hva: Omskriver kilde-IP/port utgående, inverterer på vei inn.
- Forutsetter: 14, 17
- Demo: NAT-tabell-visning: to interne hosts treffer 1.2.3.4:80.
- Drill: Hvorfor bryter NAT med end-to-end-prinsippet?
- Status: **mangler**.

**24. ICMP — diagnose-protokollen**
- Hva: Kontrollprotokoll for echo/TTL-exceeded/destination-unreachable.
- Forutsetter: 16
- Demo: traceroute-simulator: TTL=1,2,3.
- Drill: Hvorfor ser du * * * i traceroute?
- Status: **delvis** — pcap-scenario, ingen mini-kurs.

## Lag 3 — Transport (TCP/UDP)

**25. Port og socket-abstraksjonen**
- Hva: Socket = (IP, port, protokoll); port ruter pakke til prosess.
- Forutsetter: 16
- Demo: to Python-prosesser binder 8080/8081; vis OS-tabell.
- Drill: Hvorfor kan to TCP lytte på samme port hvis 4-tuplen er ulik?
- Status: **dekket**.

**26. UDP — best-effort transport**
- Hva: 8-byte header; ingen tilstand, ingen leveranse-garanti.
- Forutsetter: 25
- Demo: send 100 UDP-pakker, drop 10.
- Drill: Hvorfor velger DNS og QUIC UDP?
- Status: **dekket** — `transportlag.tsx`.

**27. TCP-handshake (3-way)**
- Hva: SYN → SYN+ACK → ACK etablerer ISN og bekrefter begge sider.
- Forutsetter: 25, 26
- Demo: klikkbar handshake med ISN synlig.
- Drill: Hvorfor 3 og ikke 2 pakker?
- Status: **dekket** — `transportlag.tsx` + pcap-quiz.

**28. TCP-teardown (4-way FIN)**
- Hva: Hver retning lukkes uavhengig: FIN/ACK i hver retning.
- Forutsetter: 27
- Demo: state-machine: CLOSE-WAIT, FIN-WAIT-1/2, TIME-WAIT.
- Drill: Hvorfor TIME-WAIT på 2·MSL?
- Status: **dekket** — pcap-scenario.

**29. Reliable data transfer (rdt 1.0 → 3.0)**
- Hva: Bygge pålitelighet ved successive checksum (2.0), seq# (2.1), NAK-fri ACK (2.2), timer (3.0).
- Forutsetter: 7, 27
- Demo: stop-and-wait-simulator der studenten toggler «hva mangler vi nå?».
- Drill: Hvorfor må seq# være med selv med checksum?
- Status: **dekket** — `dte2507-rdt-progresjon.tsx`.

**30. Pipelining, Go-Back-N og Selective Repeat**
- Hva: GBN re-sender alt fra feil; SR kun den feilende.
- Forutsetter: 29
- Demo: vindusstørrelse=4, dropp pakke 3, sammenlign GBN/SR.
- Drill: Hvorfor må SR ha buffer hos mottaker?
- Status: **dekket** — `dte2507-ap-progresjon.tsx`.

**31. Flow control (rwnd)**
- Hva: Mottaker annonserer ledig buffer i hver ACK.
- Forutsetter: 30
- Demo: senker lese-rate; se rwnd krympe.
- Drill: Forskjellen flow control vs congestion control?
- Status: **delvis**.

**32. TCP congestion control — slow start, AIMD**
- Hva: cwnd dobles til ssthresh, så +1 per RTT. Ved tap halveres.
- Forutsetter: 31
- Demo: cwnd-sagtann-graf med klikkbart pakketap.
- Drill: RTT=100ms, MSS=1KB — etter 10 RTT, hva er cwnd?
- Status: **dekket** — `dte2507-congestion-control.tsx`.

**33. Bottleneck-throughput**
- Hva: End-to-end throughput = min(link-rates).
- Forutsetter: 6, 32
- Demo: tre-link-sti med justerbare rater.
- Drill: R1=10, R2=2, R3=8 Mbps — max throughput?
- Status: **dekket** — `dte2507-bottleneck-throughput.tsx`.

## Lag 4 — Applikasjonslaget

**34. HTTP/1.1 request-response og status-koder**
- Hva: Klient sender linje + headere + body; server svarer statuslinje + headere + body. Stateless.
- Forutsetter: 27
- Demo: skriv rå GET i textarea, send via socket-shim.
- Drill: 301 vs 302? 401 vs 403?
- Status: **dekket**.

**35. Persistent connection og pipelining (HTTP/1.1)**
- Hva: Keep-Alive bærer mange par over én TCP.
- Forutsetter: 34
- Demo: toggle persistent on/off; antall handshake-RTT.
- Drill: Hvorfor sparer persistent like mye RTT som båndbredde?
- Status: **delvis**.

**36. HTTP/2 multipleksing og HOL**
- Hva: HTTP/2 multiplekser streams over én TCP → løser applikasjons-HOL. TCP-HOL gjenstår.
- Forutsetter: 35
- Demo: HTTP/1.1 vs 2 vs 3 under pakketap.
- Drill: Hvilket lags HOL fjerner HTTP/3?
- Status: **dekket** — `dte2507-http2-hol.tsx`.

**37. Web caching — proxy, hit-rate, mean access time**
- Hva: mean = hit_rate·t_cache + miss_rate·t_origin.
- Forutsetter: 34
- Demo: slider for hit-rate.
- Drill: Hit-rate 0.6, t_cache=1 ms, t_origin=200 ms?
- Status: **dekket** — `dte2507-web-caching-matte.tsx`.

**38. DNS hierarki og rekursive vs iterative lookups**
- Hva: root → TLD → autoritativ (iterativ) eller delegering (rekursiv).
- Forutsetter: 26
- Demo: oppslag av `www.uit.no`.
- Drill: Forskjell autoritativ vs caching DNS?
- Status: **dekket** — `dte2507-dns-dyp.tsx`.

**39. DHCP-prosessen (DORA)**
- Hva: Discover/Offer/Request/Ack.
- Forutsetter: 8, 13
- Demo: 4-pakke utveksling.
- Drill: Hvorfor må Request være broadcast?
- Status: **delvis** — pcap-scenario.

**40. Day-in-the-life — full sidelasting**
- Hva: Et klikk → DHCP→ARP→DNS→TCP→TLS→HTTP.
- Forutsetter: 11, 27, 34, 38, 39
- Demo: step-through fra «boot» til «render».
- Drill: Hvor mange RTT fra strøm-på til første byte HTML?
- Status: **dekket** — `dte2507-day-in-the-life.tsx`.

## Lag 5 — Kryptografi-primitiver

**41. Symmetrisk vs asymmetrisk**
- Hva: Symmetrisk: én delt nøkkel; asymmetrisk: nøkkelpar.
- Forutsetter: —
- Demo: krypter samme melding med begge, måle tid.
- Drill: Hvorfor brukes alltid hybrid?
- Status: **dekket** — `kryptografi.tsx`.

**42. Block cipher og CBC-modus**
- Hva: Block cipher krypterer 128-bits blokker; CBC XORer hver plaintext med forrige ciphertext.
- Forutsetter: 41
- Demo: krypter samme bilde med ECB vs CBC.
- Drill: Hva skjer hvis IV er forutsigbar?
- Status: **dekket** — `dte2507-cbc-iv.tsx`.

**43. Hash-funksjon (preimage-resistens)**
- Hva: Enveis-funksjon: lett å beregne H(m), umulig å finne m gitt H(m).
- Forutsetter: —
- Demo: endre én bokstav → drastisk forskjellig SHA-256 (avalanche).
- Drill: Forskjell collision-resistens vs preimage-resistens?
- Status: **dekket**.

**44. MAC og HMAC**
- Hva: MAC binder melding til delt hemmelig nøkkel.
- Forutsetter: 43
- Demo: send melding + HMAC; flipp én bit; mottaker forkaster.
- Drill: Hvorfor er ren hash utilstrekkelig?
- Status: **dekket** — `dte2507-fra-checksum-til-hmac.tsx`.

**45. RSA — keygen, kryptering, dekryptering**
- Hva: c=m^e mod n, m=c^d mod n.
- Forutsetter: 41
- Demo: p=61, q=53; krypter «HI» tegn for tegn.
- Drill: Hvorfor er sikkerhet basert på faktorisering?
- Status: **dekket** — `dte2507-rsa-mini.tsx`.

**46. Digital signatur**
- Hva: Hash + krypter med privat nøkkel; alle med public verifiserer.
- Forutsetter: 43, 45
- Demo: signer melding; manipuler én bokstav; verifisering feiler.
- Drill: Hvorfor signere hash og ikke meldingen?
- Status: **delvis**.

**47. Sertifikat og PKI-tillitskjeden**
- Hva: X.509-sertifikat = CA-signert binding mellom navn og public key.
- Forutsetter: 46
- Demo: klikk gjennom kjede: leaf → intermediate → root.
- Drill: Self-signed vs CA-signed?
- Status: **delvis**.

## Lag 6 — TLS

**48. TLS-handshake (1.2) og masternøkler**
- Hva: ClientHello → ServerHello+Cert+KeyExchange → ClientKeyExchange → ChangeCipherSpec → Finished.
- Forutsetter: 41, 47, 27
- Demo: klikkbar handshake med highlight «asymmetrisk» vs «symmetrisk».
- Drill: Hvor i 1.2 brukes RSA siste gang?
- Status: **dekket** — `dte2507-tls-handshake.tsx`.

**49. TLS 1.3-forenkling og forward secrecy**
- Hva: 1.3 droppet RSA-key-exchange, kun (EC)DHE → forward secrecy. 1 RTT.
- Forutsetter: 48
- Demo: side-om-side 1.2 vs 1.3.
- Drill: Hva betyr forward secrecy?
- Status: **dekket**.

## Lag 7 — Angrep og forsvar

**50. Sniffing og klartekst-fare**
- Hva: På samme broadcast-domene kan angriper lese alle pakker.
- Forutsetter: 8, 34
- Demo: pcap-scenario «klartekst-passord i POST».
- Drill: Hvorfor hjelper switch delvis mot sniffing?
- Status: **dekket** — pcap.

**51. ARP-spoofing og MITM**
- Hva: Gratuitous ARP overskriver offerets cache → trafikk gjennom angriper.
- Forutsetter: 11
- Demo: tre ARP-pakker som etablerer MITM.
- Drill: Hvilket motmiddel finnes?
- Status: **dekket** — pcap.

**52. DNS-spoofing og cache-poisoning**
- Hva: Angriper svarer før autoritativ → forfalsket A-record cache-es.
- Forutsetter: 38
- Demo: to DNS-svar med ulik IP.
- Drill: Hvordan stopper DNSSEC dette?
- Status: **dekket** — pcap.

**53. Port-skanning (SYN-stealth)**
- Hva: SYN; åpen → SYN+ACK, lukket → RST. Aldri fullfør.
- Forutsetter: 27
- Demo: pcap viser 100 SYN på ulike porter.
- Drill: Hvordan skiller du SYN-skann fra normal trafikk?
- Status: **dekket** — pcap.

**54. SYN flood (DoS)**
- Hva: Massevis av SYN uten å fullføre handshake → buffer for half-open fylles.
- Forutsetter: 27
- Demo: pcap viser kun innkommende SYN.
- Drill: Hva er SYN cookies?
- Status: **dekket** — pcap.

**55. Brannmur — stateless vs stateful**
- Hva: Stateless = per-pakke (5-tuple); stateful = conntrack-tabell.
- Forutsetter: 27
- Demo: toggle stateful; SSH-respons droppes uten egress-regel.
- Drill: Hvorfor må stateless åpne høye porter for retur?
- Status: **dekket** — `dte2507-stateful-firewall.tsx`.

**56. DMZ og defense in depth**
- Hva: Mellom internett og internt nett: demilitarisert sone.
- Forutsetter: 55
- Demo: drag-and-drop tre soner.
- Drill: Hvilke tjenester bor i DMZ?
- Status: **dekket**.

**57. IDS/IPS — Snort-signatur**
- Hva: IDS varsler ved match; IPS er inline og dropper.
- Forutsetter: 55
- Demo: Snort-regel som matcher «User-Agent: sqlmap».
- Drill: Signature-based vs anomaly-based?
- Status: **dekket** — `dte2507-ids-snort.tsx`.

## Lag 8 — Verktøy og helhetlig praksis

**58. Wireshark — capture, filter, follow stream**
- Hva: BPF-capture-filter ved opptak, display-filter for analyse.
- Forutsetter: 5, 16, 27
- Demo: 15 scenarier i pcap-quiz.
- Drill: Skriv display-filter for TLS-handshake fra én klient-IP.
- Status: **dekket** — `dte2507-wireshark-analyse.tsx` + `/dte2507/pcap`.

**59. Socket-programmering — TCP-klient/server**
- Hva: `socket()`, `bind()`, `listen()/connect()`, `send/recv()`, `close()`.
- Forutsetter: 25, 27
- Demo: 15 Python-øvelser i Pyodide-shim.
- Drill: Hvorfor `listen(backlog)`?
- Status: **dekket** — `dte2507-socket-programmering.tsx`.

**60. TLS-wrapping av socket**
- Hva: `ssl.wrap_socket()` legger TLS over eksisterende TCP-socket.
- Forutsetter: 49, 59
- Demo: bytt `socket` → `SSLContext().wrap_socket`; pcap viser handshake først.
- Drill: Hvilken side trenger sertifikat?
- Status: **delvis**.

## Åpne spørsmål

- **Pensum-versjon:** Repoet refererer Kurose & Ross 8. utgave, men ingen UiT-spesifikk pensumliste funnet. Bekreft NAT (23), ICMP (24), HTTP-persistent (35) mot eksamenssett.
- **Trådløst (WiFi/802.11):** Ikke eget WiFi/CSMA/CA-atom. Kan være pensum (kap. 7 hos K&R).
- **QUIC/HTTP/3:** Berørt i `http2-hol`, ikke eget atom.
- **IPv6:** Nevnt i tabell, ingen interaktive atomer.
- **Multicast og IGMP:** Helt fraværende i repoet.
- **`feat/dte-2507-praksis`** har samme content-filer som main; ingen unike in-progress atomer.
