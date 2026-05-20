# Læreplankart — Forkurs → DTE-2505 → DTE-2507

**Konsolidert læringsløp på tvers av to eksamener.** Forfattet 2026-05-20.

Dette kartet komplementerer (overstyrer ikke) [plan-dte-2505.md](plan-dte-2505.md) og
[plan-dte-2507.md](plan-dte-2507.md), som har dypere per-fag atom-dekomposisjoner med
status-merker. Det dette kartet gir som de andre IKKE gir:

1. **Forkurs-sporet (F-)** — juni–august, før semester. Ikke beskrevet andre steder.
2. **Eksplisitte koblingspunkter på tvers av fagene** — f.eks. SEC-07 (TLS) avhenger
   av DK-14 (TCP-håndtrykk) + SEC-03 (asymmetrisk krypto); SEC-17 (herding) avhenger
   av OS-11/14/29/31.
3. **Konsolidert ID-system** (F-/OS-/DK-/SEC- + nummer) som tillater referanse
   til biter på tvers av fag i kode og agenter.

## Hvordan en agent skal lese kartet

Dette er et *innholdskart*, ikke ferdige oppgaver. Hver "bit" er én liten,
fordøyelig læringsenhet. Agent skal bygge oppgaver, forklaringer og visualiseringer
rundt hver bit, i den rekkefølgen de står.

Hierarki: **SPOR → FASE → MODUL → BIT**. Hver bit har fire felter:

- **Begreper** — termene brukeren skal kunne etter biten. Fasit for hva agent må dekke.
- **Forutsetning** — hvilke bit-IDer som må sitte FØR denne. Ikke start en bit før
  forutsetningene er krysset av.
- **Oppgavetype** — hint om hvilken aktivitet/visuell som passer. Agent kan velge
  fritt, men dette er retningen.

**Bit-ID-system:** F = forkurs, OS = DTE-2505, DK = datakomm-delen av DTE-2507,
SEC = sikkerhetsdelen av DTE-2507. Nummer angir rekkefølge innad i sporet.

De to fagene er separate spor. **Grønne KOBLINGSPUNKT-bokser** viser hvor en bit
i ett spor avhenger av en bit i det andre. Det viktigste: hele SEC-fasen hviler
på OS-sporet + DK-sporet.

## Mester-koblingskart (de kritiske avhengighetene)

Disse må respekteres når en agent velger neste bit å bygge:

| Bit (høyre) | Hviler på (venstre) |
|---|---|
| DK-10 sockets | F-06 Python-filer + OS-15 prosesser |
| SEC-07 TLS | DK-14 TCP-håndtrykk + SEC-03 asymmetrisk krypto |
| SEC-12 spoofing | DK-31 ARP |
| SEC-14 brannmur | DK-21 IP-pakke + OS-31 tjenester |
| SEC-17 herding | OS-11/14 rettigheter + OS-29 pakker + OS-31 tjenester |
| SEC-18 IDS | OS-32 logger + SEC-10 sniffing |
| SEC-20/21 web-sikkerhet | SEC-07 TLS + DK-06 HTTP |

**Hovedregel:** kjør OS-sporet og DK-sporet parallelt fram til begge har
fullført sine fundamentfaser. Start SEC-sporet først når OS-fase 3 (rettigheter)
og DK-fase 4 (nettverkslaget) er på plass.

## Audit av eksisterende dekning (2026-05-20)

Mye er allerede bygd. For detaljert status per bit, se de eksisterende plan-filene
— dette er en grov oversikt:

| Spor / fase | Eksisterende komponenter (utvalg) | Dekningsgrad |
|---|---|---|
| F · Forkurs | ingen — ikke prioritert ennå | ingen |
| OS-1 · Hva er et OS | `os-grunnlag/OsGrunnlagPage.tsx`, `Dte2505Hub.tsx` | dekket |
| OS-2 · Filsystemet | `linux-bruk/`, drag-oppgaver "OS & Linux" | dekket |
| OS-3 · Rettigheter | RWX-kalkulator, `linux-bruk/` | dekket |
| OS-4 · Prosesser | `dte2505-prosesser-signaler/ProcessStateMachine.tsx` | dekket |
| OS-5 · Skallet | `linux-cli-advanced/` (pågående utvidelse) | delvis → pågående |
| OS-6 · Skallprogrammering | `dte2505.shell-drill`, shellScenarios.ts | delvis |
| OS-7 · Drift | systemd/logging i oblig-guide; `dte2505-lagring/` | delvis |
| DK-1 · Internett | `osi-tcpip.tsx`, `dte2507-delay-modell.tsx` | dekket |
| DK-2 · Applikasjon | HTTP/DNS-mini-kurs, `dte2507-socket-programmering/` | delvis |
| DK-3 · Transport | `dte2507-rdt-progresjon.tsx`, `tcp-state-machine` | dekket |
| DK-4 · Nettverkslag | IP-mini-kurs, `dte2507.pcap`-scenarier | delvis |
| DK-5 · Linklag | `dte2507-crc-kalkulator.tsx`, `dte2507-aloha-kasino.tsx`, WiFi-CSMA-CA | delvis |
| SEC-1 · Krypto-prinsipper | TLS/krypto-mini-kurs (lett dekning) | hull |
| SEC-2 · Sikker kommunikasjon | TLS-side i `dte2507/` | delvis |
| SEC-3 · Trusler og angrep | brannmur-drill | hull |
| SEC-4 · Anvendt sikring | brannmur-drill | hull |

**Største hull:** F-sporet (forkurs) er ikke startet; SEC-sporet er kun overflate-dekket;
DK-sporet mangler dedikert NAT/DHCP/DNS-dybde og noen biter i nettverkslaget.

---

# SPOR 0 · Forkurs (juni–august)

Mål: møte fagene med fundament på plass.

## Fase F1 · Verktøykassa

### F-01  Virtualisering: hva og hvorfor
- **Begreper:** virtuell maskin, hypervisor, host vs guest, isolasjon
- **Forutsetn.:** ingen
- **Oppgavetype:** konseptkort + diagram av host/guest

### F-02  Installer VirtualBox + Ubuntu
- **Begreper:** ISO, disk-image, RAM-allokering, virtuell disk
- **Forutsetn.:** F-01
- **Oppgavetype:** guidet steg-for-steg med skjermbilder

### F-03  Snapshots og trygg eksperimentering
- **Begreper:** snapshot, rollback, tilstand
- **Forutsetn.:** F-02
- **Oppgavetype:** praktisk: ta snapshot, ødelegg noe, rull tilbake

### F-04  Åpne terminalen
- **Begreper:** ledetekst (prompt), shell, kommando
- **Forutsetn.:** F-02
- **Oppgavetype:** miniøvelse: kjør første kommandoer

## Fase F2 · Programmeringsoppfriskning

### F-05  Python-grunnstein (rask repetisjon)
- **Begreper:** variabel, datatype, if/else, løkke, funksjon, liste, dict
- **Forutsetn.:** ingen
- **Oppgavetype:** kort diagnostisk quiz + fyll-ut-kode

### F-06  Lese og skrive filer i Python
- **Begreper:** open, read, write, with-blokk, filsti
- **Forutsetn.:** F-05
- **Oppgavetype:** kodeoppgave: les en fil, tell linjer

## Fase F3 · Nettverksintuisjon (ikke pensum)

### F-07  Hva skjer når du åpner en nettside
- **Begreper:** klient, server, forespørsel/svar, det store bildet
- **Forutsetn.:** ingen
- **Oppgavetype:** animert flyt klient→server→svar

### F-08  IP-adresse og port
- **Begreper:** IP-adresse, port, lokal vs offentlig
- **Forutsetn.:** F-07
- **Oppgavetype:** visuell: adresse = bygning, port = leilighet

### F-09  Se trafikk med Wireshark + ping/traceroute
- **Begreper:** pakke, ping, traceroute, latens
- **Forutsetn.:** F-02, F-08
- **Oppgavetype:** praktisk: fang trafikk, les pakkeliste

## Fase F4 · Tall og krypto-intuisjon

### F-10  Binær og heksadesimal
- **Begreper:** base 2, base 16, bit, byte, omregning
- **Forutsetn.:** ingen
- **Oppgavetype:** interaktiv omregner + drilløvelser

### F-11  Hva ER kryptering (overflate)
- **Begreper:** symmetrisk, asymmetrisk, hash, signatur — kun ideen
- **Forutsetn.:** ingen
- **Oppgavetype:** konseptkort, ingen matte

---

# SPOR A · DTE-2505 Operativsystemer (bottom-up)

Fundamentet bygges nedenfra og opp. Hver stein bærer den neste.
Kilde: emnets kompendier + Shotts «The Linux Command Line».

## Fase OS-1 · Hva er et operativsystem

### OS-01  OS-ets rolle og oppgaver
- **Begreper:** operativsystem, ressursforvaltning, abstraksjon, kjerne (kernel)
- **Forutsetn.:** F-01
- **Oppgavetype:** konseptkart over OS-ets oppgaver

### OS-02  Kjerne vs brukerrom
- **Begreper:** kernel space, user space, systemkall, mode-veksling
- **Forutsetn.:** OS-01
- **Oppgavetype:** diagram med pil for systemkall

### OS-03  Linux-familien og distribusjoner
- **Begreper:** Linux, distribusjon, Ubuntu, pakkesystem, GNU
- **Forutsetn.:** OS-01
- **Oppgavetype:** sammenligningstabell over distroer

### OS-04  Maskinvarelaget kort
- **Begreper:** CPU, RAM, I/O, lagring, buss
- **Forutsetn.:** ingen
- **Oppgavetype:** merket maskinvarediagram

## Fase OS-2 · Filsystemet

### OS-05  Filsystemhierarkiet
- **Begreper:** rot /, hjemmemappe, /etc, /bin, /var, sti
- **Forutsetn.:** OS-03
- **Oppgavetype:** klikkbart filtre-diagram

### OS-06  Navigering
- **Begreper:** pwd, ls, cd, absolutt vs relativ sti
- **Forutsetn.:** OS-05
- **Oppgavetype:** terminal-simulator: finn fram

### OS-07  Vise og undersøke filer
- **Begreper:** cat, less, head, tail, file
- **Forutsetn.:** OS-06
- **Oppgavetype:** praktisk: utforsk systemfiler

### OS-08  Manipulere filer og mapper
- **Begreper:** mkdir, cp, mv, rm, touch, ln
- **Forutsetn.:** OS-06
- **Oppgavetype:** sandkasse-øvelse (med snapshot-nett)

### OS-09  Filtyper og lenker
- **Begreper:** vanlig fil, mappe, symbolsk lenke, hard lenke, inode
- **Forutsetn.:** OS-08
- **Oppgavetype:** visuell: inode peker på data

## Fase OS-3 · Rettigheter og brukere

### OS-10  Brukere, grupper, eierskap
- **Begreper:** bruker, gruppe, eier, /etc/passwd
- **Forutsetn.:** OS-07
- **Oppgavetype:** diagram: hvem eier hva

### OS-11  Rettighetsmodellen rwx
- **Begreper:** lese/skrive/kjøre, eier/gruppe/andre, rwx
- **Forutsetn.:** OS-10
- **Oppgavetype:** interaktiv rettighetsmatrise

### OS-12  chmod (symbolsk og numerisk)
- **Begreper:** chmod, 755, 644, oktal notasjon
- **Forutsetn.:** OS-11
- **Oppgavetype:** drill: oversett rwx ↔ tall

### OS-13  chown og chgrp
- **Begreper:** chown, chgrp, endre eierskap
- **Forutsetn.:** OS-12
- **Oppgavetype:** praktisk: bytt eier på testfil

### OS-14  sudo og root
- **Begreper:** root, superbruker, sudo, prinsippet om minste privilegium
- **Forutsetn.:** OS-13
- **Oppgavetype:** scenario: når trenger du sudo

> 🔗 **KOBLINGSPUNKT** OS-11 til OS-14 (rettigheter) er fundamentet for
> SEC-fasens herding av systemer. Brukeren MÅ kunne dette før SEC-09 og utover.

## Fase OS-4 · Prosesser

### OS-15  Hva er en prosess
- **Begreper:** prosess, PID, foreldreprosess, prosesstre
- **Forutsetn.:** OS-02
- **Oppgavetype:** visuell: prosesstre med forgreninger

### OS-16  Se prosesser
- **Begreper:** ps, top, htop, prosessliste
- **Forutsetn.:** OS-15
- **Oppgavetype:** praktisk: les top-utskrift

### OS-17  Styre prosesser
- **Begreper:** kill, signal, SIGTERM, SIGKILL, jobbkontroll, &, fg, bg
- **Forutsetn.:** OS-16
- **Oppgavetype:** øvelse: start, suspender, drep en jobb

### OS-18  Prosesstilstander
- **Begreper:** kjørende, ventende, sovende, zombie
- **Forutsetn.:** OS-15
- **Oppgavetype:** tilstandsdiagram med overganger

## Fase OS-5 · Skallet

### OS-19  Standardstrømmer
- **Begreper:** stdin, stdout, stderr
- **Forutsetn.:** OS-07
- **Oppgavetype:** diagram med tre rør

### OS-20  Omdirigering
- **Begreper:** `>`, `>>`, `<`, `2>`
- **Forutsetn.:** OS-19
- **Oppgavetype:** øvelse: fang utskrift til fil

### OS-21  Rør (pipes)
- **Begreper:** `|`, kjede av kommandoer
- **Forutsetn.:** OS-20
- **Oppgavetype:** byggekloss-oppgave: koble kommandoer

### OS-22  Tekstverktøy
- **Begreper:** grep, find, wc, sort, cut, sed (intro)
- **Forutsetn.:** OS-21
- **Oppgavetype:** praktisk: filtrer en loggfil

### OS-23  Variabler og miljø
- **Begreper:** miljøvariabel, PATH, export, $
- **Forutsetn.:** OS-19
- **Oppgavetype:** utforsk: skriv ut og sett variabler

## Fase OS-6 · Skallprogrammering

### OS-24  Første bash-skript
- **Begreper:** shebang, kjørerettighet, ./skript
- **Forutsetn.:** OS-12, OS-23
- **Oppgavetype:** skriv og kjør et 3-linjers skript

### OS-25  Argumenter og input
- **Begreper:** $1 $2, $@, read
- **Forutsetn.:** OS-24
- **Oppgavetype:** skript som tar argument

### OS-26  Betingelser
- **Begreper:** if/else, test, [ ], exit-kode
- **Forutsetn.:** OS-24
- **Oppgavetype:** skript som sjekker om fil finnes

### OS-27  Løkker
- **Begreper:** for, while, iterasjon over filer
- **Forutsetn.:** OS-26
- **Oppgavetype:** skript som behandler mange filer

### OS-28  Funksjoner og opprydding
- **Begreper:** funksjon, return, kommentarer, feilhåndtering
- **Forutsetn.:** OS-27
- **Oppgavetype:** refaktorer et skript pent

## Fase OS-7 · Drift og administrasjon

### OS-29  Pakkehåndtering
- **Begreper:** apt, installere, oppdatere, avhengighet, repo
- **Forutsetn.:** OS-14
- **Oppgavetype:** praktisk: installer og fjern en pakke

### OS-30  Brukeradministrasjon
- **Begreper:** useradd, userdel, passwd, grupper
- **Forutsetn.:** OS-10
- **Oppgavetype:** scenario: opprett team av brukere

### OS-31  Tjenester og oppstart
- **Begreper:** tjeneste (service), systemd, systemctl, demon
- **Forutsetn.:** OS-16
- **Oppgavetype:** start/stopp en tjeneste

### OS-32  Loggfiler
- **Begreper:** /var/log, journalctl, feilsøking via logg
- **Forutsetn.:** OS-22
- **Oppgavetype:** finn en feil i en logg

### OS-33  Planlagte oppgaver og vedlikehold
- **Begreper:** cron, crontab, backup, oppdateringsrutine
- **Forutsetn.:** OS-27, OS-31
- **Oppgavetype:** sett opp en enkel cron-jobb

### OS-34  Disk og montering
- **Begreper:** partisjon, mount, df, du, filsystemtype
- **Forutsetn.:** OS-05
- **Oppgavetype:** utforsk diskbruk

---

# SPOR B1 · DTE-2507 Datakomm (top-down, Kurose)

Bygges ovenfra og ned: starter ved nettleseren du kjenner, graver mot kabelen.
Kilde: Kurose & Ross.

## Fase DK-1 · Internett og grunnbegreper

### DK-01  Hva nettet er, fugleperspektiv
- **Begreper:** node, lenke, kant vs kjerne, ISP, protokoll
- **Forutsetn.:** F-07
- **Oppgavetype:** lagdelt nett-diagram

### DK-02  Lagmodellene
- **Begreper:** OSI 7 lag, TCP/IP 5 lag, innkapsling
- **Forutsetn.:** DK-01
- **Oppgavetype:** dra-og-slipp: plasser lagene

### DK-03  Innkapsling og pakkereisen
- **Begreper:** innkapsling, header, payload, segment/pakke/ramme
- **Forutsetn.:** DK-02
- **Oppgavetype:** animasjon: pakke pakkes lag for lag

### DK-04  Forsinkelse og gjennomstrømning
- **Begreper:** forsinkelse (delay), throughput, kø, pakketap, båndbredde
- **Forutsetn.:** DK-01
- **Oppgavetype:** regneoppgave + visualisering av kø

## Fase DK-2 · Applikasjonslaget

### DK-05  Prinsipper for nettverksapper
- **Begreper:** klient-server, P2P, prosess, socket, API
- **Forutsetn.:** DK-02
- **Oppgavetype:** sammenlign klient-server vs P2P

### DK-06  HTTP grunnleggende
- **Begreper:** HTTP, forespørsel/svar, metoder (GET/POST), statuskoder
- **Forutsetn.:** DK-05
- **Oppgavetype:** bygg en HTTP-forespørsel manuelt

### DK-07  HTTP videre
- **Begreper:** vedvarende forbindelse, informasjonskapsler (cookies), buffer (cache)
- **Forutsetn.:** DK-06
- **Oppgavetype:** inspiser ekte HTTP-headere

### DK-08  DNS
- **Begreper:** DNS, domenenavn, navneoppslag, hierarki, rekursjon
- **Forutsetn.:** DK-05
- **Oppgavetype:** spor et DNS-oppslag steg for steg

### DK-09  E-post
- **Begreper:** SMTP, IMAP/POP3, e-postarkitektur
- **Forutsetn.:** DK-05
- **Oppgavetype:** diagram av e-postens vei

### DK-10  Socketprogrammering
- **Begreper:** socket, port, bind, lytte, koble til, TCP- vs UDP-socket
- **Forutsetn.:** DK-05, F-06
- **Oppgavetype:** kod en enkel klient og server

> 🔗 **KOBLINGSPUNKT** DK-10 (sockets) hviler på Python fra forkurset (F-05/F-06)
> OG på prosessforståelse fra OS-15. En socket er et endepunkt en prosess eier.

## Fase DK-3 · Transportlaget

### DK-11  Transportlagets oppgave
- **Begreper:** multipleksing, demultipleksing, portnummer, ende-til-ende
- **Forutsetn.:** DK-02
- **Oppgavetype:** visuell: én vert, mange samtaler

### DK-12  UDP
- **Begreper:** UDP, forbindelsesløs, sjekksum, lav overhead
- **Forutsetn.:** DK-11
- **Oppgavetype:** når velge UDP — scenariokort

### DK-13  Pålitelig dataoverføring (prinsipp)
- **Begreper:** ACK, sekvensnummer, timeout, retransmisjon, rdt
- **Forutsetn.:** DK-11
- **Oppgavetype:** animasjon: tapt pakke → retransmisjon

### DK-14  TCP-forbindelsen
- **Begreper:** TCP, treveis håndtrykk (SYN/SYN-ACK/ACK), tilstand
- **Forutsetn.:** DK-13
- **Oppgavetype:** interaktivt håndtrykk-diagram

### DK-15  TCP flytkontroll
- **Begreper:** flytkontroll, mottaksvindu, buffer
- **Forutsetn.:** DK-14
- **Oppgavetype:** skyvevindu-animasjon

### DK-16  TCP mengdekontroll
- **Begreper:** mengdekontroll (congestion), slow start, AIMD, vindu
- **Forutsetn.:** DK-15
- **Oppgavetype:** graf: vindusstørrelse over tid

### DK-17  TCP-avslutning og oppsummering
- **Begreper:** FIN, four-way teardown, TCP vs UDP totalt
- **Forutsetn.:** DK-16
- **Oppgavetype:** sammenligningstabell TCP/UDP

## Fase DK-4 · Nettverkslaget

### DK-18  Nettverkslagets rolle
- **Begreper:** videresending (forwarding) vs ruting, datakanal vs kontrollkanal
- **Forutsetn.:** DK-02
- **Oppgavetype:** diagram: forwarding vs routing

### DK-19  IP-adressering
- **Begreper:** IPv4, IPv6, adresseklasser, prefiks
- **Forutsetn.:** F-08, DK-18
- **Oppgavetype:** les og tolk IP-adresser

### DK-20  Subnett og CIDR
- **Begreper:** subnett, nettmaske, CIDR, /24
- **Forutsetn.:** DK-19, F-10
- **Oppgavetype:** subnett-kalkulator-øvelse

### DK-21  IP-pakken og fragmentering
- **Begreper:** IP-header, TTL, fragmentering
- **Forutsetn.:** DK-19
- **Oppgavetype:** merket pakkeheader

### DK-22  NAT og DHCP
- **Begreper:** NAT, privat adresse, DHCP, adressetildeling
- **Forutsetn.:** DK-20
- **Oppgavetype:** spor en pakke gjennom NAT

### DK-23  ICMP
- **Begreper:** ICMP, ekko (ping), feilmelding
- **Forutsetn.:** DK-21
- **Oppgavetype:** knytt til ping fra F-09

### DK-24  Ruting-prinsipper
- **Begreper:** rutingtabell, korteste vei, ruter
- **Forutsetn.:** DK-18
- **Oppgavetype:** finn vei i en grafvisualisering

### DK-25  Rutingsalgoritmer
- **Begreper:** lenketilstand (link-state), distansevektor, Dijkstra (idé)
- **Forutsetn.:** DK-24
- **Oppgavetype:** steg-for-steg gjennom en algoritme

### DK-26  Ruting på Internett
- **Begreper:** autonomt system, intra/inter-domene, OSPF, BGP (idé)
- **Forutsetn.:** DK-25
- **Oppgavetype:** lagvis kart over rutingsnivåer

## Fase DK-5 · Linklaget

### DK-27  Linklagets oppgave
- **Begreper:** ramme (frame), node-til-node, MAC-adresse
- **Forutsetn.:** DK-03
- **Oppgavetype:** MAC vs IP — to adressetyper

### DK-28  Feildeteksjon
- **Begreper:** paritet, sjekksum, CRC
- **Forutsetn.:** DK-27
- **Oppgavetype:** regn ut en enkel sjekksum

### DK-29  Mediumtilgang
- **Begreper:** delt medium, kollisjon, CSMA/CD, multippel tilgang
- **Forutsetn.:** DK-27
- **Oppgavetype:** simuler kollisjon på delt linje

### DK-30  Ethernet og svitsjer
- **Begreper:** Ethernet, svitsj, svitsjetabell, broadcast-domene
- **Forutsetn.:** DK-29
- **Oppgavetype:** se hvordan svitsj lærer adresser

### DK-31  ARP
- **Begreper:** ARP, IP→MAC-oppslag
- **Forutsetn.:** DK-27, DK-19
- **Oppgavetype:** spor en ARP-forespørsel

### DK-32  Trådløst og WLAN
- **Begreper:** WLAN, 802.11, aksesspunkt, SSID, signal
- **Forutsetn.:** DK-29
- **Oppgavetype:** diagram av trådløst oppsett

---

# SPOR B2 · DTE-2507 Sikkerhet (konvergens)

Her møtes alt. Sikkerhetssporet hviler på BÅDE Linux-fundamentet (Spor A) OG
nettverkslagene (Spor B1). Bør komme etter at begge er godt etablert.

## Fase SEC-1 · Kryptografiske prinsipper

### SEC-01  Hva sikkerhet betyr
- **Begreper:** konfidensialitet, integritet, tilgjengelighet (CIA), autentisering
- **Forutsetn.:** F-11
- **Oppgavetype:** kategoriser trusler mot CIA

### SEC-02  Symmetrisk kryptering
- **Begreper:** symmetrisk nøkkel, blokkchiffer, AES, nøkkeldeling-problemet
- **Forutsetn.:** F-11
- **Oppgavetype:** krypter/dekrypter med felles nøkkel

### SEC-03  Asymmetrisk kryptering
- **Begreper:** offentlig/privat nøkkel, RSA (idé), nøkkelpar
- **Forutsetn.:** SEC-02
- **Oppgavetype:** visuell: lås med to nøkler

### SEC-04  Hashing
- **Begreper:** hash-funksjon, enveis, kollisjon, SHA
- **Forutsetn.:** SEC-01
- **Oppgavetype:** se hvordan liten endring → ny hash

### SEC-05  Digitale signaturer
- **Begreper:** signatur, ikke-benekting, hash + privat nøkkel
- **Forutsetn.:** SEC-03, SEC-04
- **Oppgavetype:** signer og verifiser et dokument

### SEC-06  Nøkkeldistribusjon og PKI
- **Begreper:** sertifikat, sertifikatmyndighet (CA), tillitskjede, PKI
- **Forutsetn.:** SEC-05
- **Oppgavetype:** spor en tillitskjede

## Fase SEC-2 · Sikker kommunikasjon

### SEC-07  TLS/SSL
- **Begreper:** TLS, håndtrykk, øktnøkkel, HTTPS
- **Forutsetn.:** SEC-06, DK-14
- **Oppgavetype:** steg-for-steg TLS-håndtrykk

> 🔗 **KOBLINGSPUNKT** SEC-07 (TLS) krever TCP-håndtrykket fra DK-14 OG
> asymmetrisk krypto fra SEC-03. Det er her transport og krypto smelter sammen.

### SEC-08  Autentisering og passord
- **Begreper:** autentisering, hashing av passord, salt, totrinns
- **Forutsetn.:** SEC-04
- **Oppgavetype:** hvorfor lagre hash, ikke passord

## Fase SEC-3 · Trusler og angrep

### SEC-09  Trusselbildet
- **Begreper:** angriper, angrepsflate, sårbarhet, risiko
- **Forutsetn.:** SEC-01
- **Oppgavetype:** kartlegg angrepsflaten til et system

### SEC-10  Avlytting og sniffing
- **Begreper:** sniffing, pakkeavlytting, mann-i-midten (MITM)
- **Forutsetn.:** DK-30, F-09
- **Oppgavetype:** se hvorfor ukryptert trafikk er åpen

### SEC-11  Tjenestenektangrep
- **Begreper:** DoS, DDoS, oversvømmelse (flooding)
- **Forutsetn.:** DK-16
- **Oppgavetype:** visualiser et SYN-flood-angrep

### SEC-12  Forfalskning
- **Begreper:** spoofing, IP-spoofing, ARP-spoofing
- **Forutsetn.:** DK-31
- **Oppgavetype:** knytt til ARP fra DK-31

### SEC-13  Skadevare og sosial manipulering
- **Begreper:** skadevare (malware), phishing, sosial manipulering
- **Forutsetn.:** SEC-09
- **Oppgavetype:** gjenkjenn et phishing-forsøk

## Fase SEC-4 · Anvendt sikring (full konvergens)

### SEC-14  Brannmurer
- **Begreper:** brannmur, pakkefilter, regelsett, tilstandsbasert
- **Forutsetn.:** DK-21, OS-31
- **Oppgavetype:** skriv et enkelt brannmur-regelsett

> 🔗 **KOBLINGSPUNKT** SEC-14 (brannmur) krever IP-pakkeforståelse (DK-21) OG
> å kunne styre tjenester i Linux (OS-31). Begge spor møtes.

### SEC-15  Brannmurtopologier
- **Begreper:** DMZ, perimetersikring, sone
- **Forutsetn.:** SEC-14
- **Oppgavetype:** design et nettverk med DMZ

### SEC-16  VLAN og nettsegmentering
- **Begreper:** VLAN, segmentering, isolasjon av trafikk
- **Forutsetn.:** DK-30
- **Oppgavetype:** del et nett i VLAN-er

### SEC-17  Herding av OS
- **Begreper:** herding (hardening), minste privilegium, lukke porter, oppdatering
- **Forutsetn.:** OS-14, OS-29, OS-31
- **Oppgavetype:** herde-sjekkliste på en Linux-VM

> 🔗 **KOBLINGSPUNKT** SEC-17 (herding) er nesten ren OS-kunnskap brukt i
> sikkerhetsøyemed: rettigheter (OS-11/14), pakker (OS-29), tjenester (OS-31).

### SEC-18  Nettverksovervåkning og IDS
- **Begreper:** innbruddsdeteksjon (IDS), logging, anomali
- **Forutsetn.:** OS-32, SEC-10
- **Oppgavetype:** les en IDS-varsling

> 🔗 **KOBLINGSPUNKT** SEC-18 (overvåkning) bygger på Linux-logger (OS-32) OG
> sniffing-forståelse (SEC-10).

### SEC-19  Trådløs sikkerhet
- **Begreper:** WPA2/WPA3, trådløs autentisering, svakheter
- **Forutsetn.:** DK-32, SEC-02
- **Oppgavetype:** sammenlign trådløse sikkerhetsnivåer

### SEC-20  Webtjener-sikkerhet
- **Begreper:** TLS-oppsett, tjenerherding, tilgangskontroll
- **Forutsetn.:** SEC-07, SEC-17
- **Oppgavetype:** konfigurer en sikker webtjener

### SEC-21  Sikker webprogrammering
- **Begreper:** injeksjon (SQL/XSS), inputvalidering, OWASP-tankegang
- **Forutsetn.:** DK-06, SEC-20
- **Oppgavetype:** finn sårbarheten i kodeeksempel

---

## Forbehold

- DK- og SEC-begrepene følger Kurose, som er bekreftet pensum — presise.
- OS-sporet er bygget på Shotts + standard OS-pensum fordi UiTs kompendier
  (`os.pdf`/`linux.pdf`) ikke er offentlige. Behandle OS-sporet som en solid
  standardversjon, og juster mot kompendiet når det er tilgjengelig i august.
- Rekkefølgen er den LOGISKE læringsrekkefølgen. Faktiske forelesningsuker kan
  avvike — koblingskartet er viktigere enn eksakt timing.
- Dette er et innholdskart. Oppgavetype-feltet er et hint, ikke en fasit;
  agent står fritt til å velge aktivitet så lenge begrepene dekkes.
