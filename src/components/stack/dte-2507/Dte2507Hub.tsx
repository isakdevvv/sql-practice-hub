import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Network,
  Server,
  Lock,
  Key,
  Shield,
  ScanSearch,
  Plug,
  BrickWall,
  Calculator,
  Lock as LockIcon,
  Binary,
  KeyRound,
  PackageOpen,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { LearningPath } from "@/components/stack/LearningPath";

type Course = {
  slug: string;
  title: string;
  shortDescription: string;
  Icon: typeof Network;
  status: "ready" | "coming-soon";
};

const COURSES: Course[] = [
  {
    slug: "osi-tcpip",
    title: "OSI- og TCP/IP-modellen",
    shortDescription:
      "De fem (eller syv) lagene, top-down: applikasjon → transport → nettverk → lenke → fysisk. Hvilken protokoll bor hvor.",
    Icon: Network,
    status: "ready",
  },
  {
    slug: "transportlag",
    title: "Transportlag — TCP og UDP",
    shortDescription:
      "TCP: pålitelig, tilkoblet, flow control. UDP: enkel, raskt, upålitelig. Når brukes hvilken, og hvorfor.",
    Icon: Server,
    status: "ready",
  },
  {
    slug: "kryptografi",
    title: "Kryptografi-grunnlag",
    shortDescription:
      "Symmetrisk vs asymmetrisk, hash vs MAC, digital signatur, PKI. Hva som beskytter mot hva.",
    Icon: Key,
    status: "ready",
  },
  {
    slug: "tls",
    title: "TLS-håndtrykk",
    shortDescription:
      "Hva som faktisk skjer fra «klikk på https://» til kryptert kanal: ClientHello, sertifikat, nøkkel-utveksling, Finished.",
    Icon: Lock,
    status: "ready",
  },
  {
    slug: "nettverkssikkerhet",
    title: "Nettverkssikkerhet — brannmur, IDS, angrep",
    shortDescription:
      "Stateful vs stateless brannmur, IDS vs IPS, vanlige angrep (sniffing, MITM, DDoS), forsvarsdyp.",
    Icon: Shield,
    status: "ready",
  },
  {
    slug: "dte2507-wireshark-analyse",
    title: "Wireshark / pcap-analyse",
    shortDescription:
      "Les pcap-tabeller som eksamen viser dem. Filter-syntaks, HTTP/DNS/TLS-flyt frame for frame, ARP-spoofing, Wireshark vs tcpdump. Med 15+ pcap-quiz.",
    Icon: ScanSearch,
    status: "ready",
  },
  {
    slug: "dte2507-socket-programmering",
    title: "Socket-programmering (TCP/UDP/TLS)",
    shortDescription:
      "Server- og klient-skjeletter for TCP og UDP. Concurrent server (threading, asyncio). SSL/TLS-wrapping. 15+ kjorbare oppgaver via socket-shim i Pyodide.",
    Icon: Plug,
    status: "ready",
  },
  {
    slug: "dte2507-brannmur-vlan",
    title: "Brannmur og VLAN",
    shortDescription:
      "Stateless vs stateful, iptables med stateful conntrack, DMZ-topologi, VLAN-segmentering, 802.1Q, defense in depth.",
    Icon: BrickWall,
    status: "ready",
  },
  {
    slug: "dte2507-subnetting",
    title: "Subnetting & CIDR",
    shortDescription:
      "IPv4, CIDR-kalkulator med binær visning, network/broadcast/usable, VLSM, og en aktiv VLSM-trener med fri-form input.",
    Icon: Calculator,
    status: "ready",
  },
  {
    slug: "dte2507-tls-handshake",
    title: "TLS-handshake (dyp)",
    shortDescription:
      "TLS 1.2 og 1.3 klikkbar handshake: ClientHello → Cert → KeyExchange → Finished. Highlighter symmetrisk vs asymmetrisk i hvert steg.",
    Icon: LockIcon,
    status: "ready",
  },
  {
    slug: "dte2507-paket-dekoding",
    title: "Paket-dekoding (hex)",
    shortDescription:
      "Ethernet/IP/TCP/UDP-headere byte for byte. Hover over en byte → tolkning. Lær Wireshark-tankegangen uten å fyre opp Wireshark.",
    Icon: Binary,
    status: "ready",
  },
  {
    slug: "dte2507-rsa-mini",
    title: "RSA — mini-versjon",
    shortDescription:
      "Klikk gjennom p, q, n, φ, e, d med små primtall. Krypter HI tegn for tegn. Signering vs kryptering. Hybrid krypto-forklaring.",
    Icon: KeyRound,
    status: "ready",
  },
  {
    slug: "dte2507-praksis",
    title: "Paket-tolker (5 scenarier)",
    shortDescription:
      "Fem realistiske pakker: TCP SYN, SYN+ACK, UDP DNS, ARP broadcast, ICMP echo. Klikk byte-felter for forklaring og observasjoner.",
    Icon: PackageOpen,
    status: "ready",
  },
];

export function Dte2507Hub() {
  return (
    <StackPageShell title="DTE-2507 Datakommunikasjon og sikkerhet" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · 10 stp · Teknisk spesialisering
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Datakommunikasjon og sikkerhet
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Fem mini-kurs som dekker pensum fra Kurose & Ross: hele protokoll-stakken
            top-down, kryptografi-grunnlag, TLS, og praktisk nettverkssikkerhet. Hver
            del har teori + drag-oppgaver.
          </p>
        </div>

        <div className="mb-10">
          <LearningPath
            fag="DTE-2507"
            forbinder={["DTE-2505 (Linux-OS som kjører nettverkstacken)", "DTE-2509 (HTTP og web-sikkerhet)", "TEK-1501 (sannsynlighet for kryptering)"]}
            layers={[
              {
                navn: "Basis — protokoll-stakken top-down",
                intro:
                  "Start på applikasjonslaget der du allerede kjenner HTTP, og jobb deg ned. Lær lag for lag hva som faktisk skjer.",
                steps: [
                  { slug: "osi-tcpip", title: "OSI og TCP/IP", blurb: "De to lagmodellene, hvorfor man trenger begge mentale rammer." },
                  { slug: "transportlag", title: "Transportlaget", blurb: "TCP 3-way handshake, sequence numbers vs UDP — pålitelighet vs hastighet." },
                  { slug: "dte2507-subnetting", title: "Subnetting (interaktiv)", blurb: "CIDR-kalkulator + binær AND-visning. VLSM-trener med 8 oppgaver." },
                ],
              },
              {
                navn: "Dypere — kryptografi og TLS",
                intro:
                  "Når nettverket sitter, må vi sikre trafikken. Krypto er fundamentet, TLS bygger systemet vi faktisk bruker.",
                steps: [
                  { slug: "kryptografi", title: "Kryptografi-grunnlag", blurb: "Symmetrisk vs asymmetrisk, hash, MAC — bygg blokkene." },
                  { slug: "dte2507-rsa-mini", title: "RSA mini (trinnvis)", blurb: "Velg p/q → n → φ → e → d → krypter 'HI' med BigInt." },
                  { slug: "tls", title: "TLS-handshake", blurb: "Hvordan symmetrisk + asymmetrisk kombineres for sesjonsnøkler." },
                  { slug: "dte2507-tls-handshake", title: "TLS-handshake (klikkbar)", blurb: "Klikk gjennom hver melding, se ASYM/SYM/KDF-rollene." },
                ],
              },
              {
                navn: "Eksamen — praktisk analyse",
                intro:
                  "To 2-timers deleksamener krever at du både gjenkjenner pakker og forklarer angrep/forsvar. Disse leksjonene speiler eksamens-spørsmål.",
                steps: [
                  { slug: "dte2507-paket-dekoding", title: "Pakke-dekoding (hex)", blurb: "Klikk byte-felter i hex-dump — se hva hver byte betyr." },
                  { slug: "dte2507-praksis", title: "5 forhåndsdefinerte pakker", blurb: "TCP SYN, SYN+ACK, UDP DNS, ARP, ICMP — analyser ekte capture-strukturer." },
                  { slug: "nettverkssikkerhet", title: "Nettverkssikkerhet", blurb: "Trusler, brannmurer, IDS, WAF — forsvars-rammeverket." },
                  { slug: "dte2507-wireshark-analyse", title: "Wireshark-analyse", blurb: "Pcap-tolking + filter-syntaks for raske spørsmål." },
                ],
              },
            ]}
          />
        </div>

        {/* Cheatsheet — protokoll-stakken */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Stakken på én side</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver request går ned-gjennom hos sender, opp-gjennom hos mottaker. Lær deg
            «hvilken protokoll bor på hvilket lag» utenat.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-24">Lag</th>
                  <th className="text-left font-semibold px-4 py-2 w-40">Ansvar</th>
                  <th className="text-left font-semibold px-4 py-2">Protokoller</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">5. Applikasjon</td>
                  <td className="px-4 py-3">Hva brukeren faktisk gjør</td>
                  <td className="px-4 py-3 text-muted-foreground">HTTP/HTTPS, SMTP, DNS, SSH, FTP</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">4. Transport</td>
                  <td className="px-4 py-3">Ende-til-ende, prosesser</td>
                  <td className="px-4 py-3 text-muted-foreground">TCP, UDP, QUIC</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">3. Nettverk</td>
                  <td className="px-4 py-3">Ruting mellom nett</td>
                  <td className="px-4 py-3 text-muted-foreground">IP (v4/v6), ICMP, OSPF, BGP</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">2. Lenke</td>
                  <td className="px-4 py-3">Én hopp på samme nett</td>
                  <td className="px-4 py-3 text-muted-foreground">Ethernet, WiFi (802.11), ARP, MAC</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">1. Fysisk</td>
                  <td className="px-4 py-3">Bits over kabel/luft</td>
                  <td className="px-4 py-3 text-muted-foreground">Kobber, fiber, radio</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Kurs-grid */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Mini-kurs</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {COURSES.map((c) => {
              const isReady = c.status === "ready";
              const Icon = c.Icon;
              if (!isReady) {
                return (
                  <div
                    key={c.slug}
                    className="rounded-xl border border-border bg-card/30 p-5 opacity-60"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground leading-tight">{c.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.shortDescription}</p>
                  </div>
                );
              }
              return (
                <Link
                  key={c.slug}
                  to="/stack/$slug"
                  params={{ slug: c.slug }}
                  className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-foreground leading-tight">{c.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.shortDescription}</p>
                  <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Åpne
                    <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Praksis-banner: Pcap-quiz */}
        <section className="mb-10 rounded-xl border border-brand/30 bg-brand/5 p-5">
          <div className="flex items-start gap-3">
            <ScanSearch className="h-5 w-5 text-brand mt-0.5 shrink-0" />
            <div className="flex-1">
              <h2 className="font-semibold mb-1">Praksis: pcap-quiz</h2>
              <p className="text-sm text-muted-foreground mb-3">
                15+ pakke-scenarier i Wireshark-format med multiple-choice. Identifiser
                handshake-rammer, status-koder, ARP-spoofing, port-skann. Samme oppgave-format
                som DTE-2507-eksamen.
              </p>
              <Link
                to="/dte2507/pcap"
                className="inline-flex items-center gap-2 rounded-lg bg-brand text-brand-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90"
              >
                Apne pcap-quiz
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Hvor passer dette inn?</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Drag-oppgaver:</strong> hvert kurs har
              fyll-inn, match og quiz under sitt emne — sjekk poeng på{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link>.
            </li>
            <li>
              <strong className="text-foreground">Pre-rekvisitter:</strong>{" "}
              <Link to="/stack/$slug" params={{ slug: "tcp-sockets" }} className="text-brand hover:underline">
                TCP/sockets
              </Link>{" "}og{" "}
              <Link to="/stack/$slug" params={{ slug: "http-anatomi" }} className="text-brand hover:underline">
                HTTP-anatomi
              </Link>{" "}dekker grunnlaget før du dykker dypere.
            </li>
            <li>
              <strong className="text-foreground">Sikkerhet:</strong>{" "}
              <Link to="/stack/$slug" params={{ slug: "sikkerhet" }} className="text-brand hover:underline">
                Web-sikkerhet
              </Link>{" "}dekker applikasjonsnivå-angrep (SQLi, XSS, CSRF) som komplement til nettverkssikkerheten her.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
