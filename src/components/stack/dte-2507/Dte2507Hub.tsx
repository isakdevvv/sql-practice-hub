import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
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
  Code2,
  GitBranch,
  Lightbulb,
  Activity,
  Route,
  Globe,
  Calendar,
  Sparkles,
  PlayCircle,
  BookOpen,
  Eye,
  Wrench,
  Brain,
  ScrollText,
  Radio,
  Boxes,
  Layers,
  HardDrive,
  Cable,
  AlertTriangle,
  Workflow,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { LearningPath } from "@/components/stack/LearningPath";
import { ModulStatusBadge, ModulProgressBar } from "@/components/stack/HubShared";
import { EXAM_META } from "@/lib/subjects/catalog";
import { useModulProgress } from "@/lib/stack/moduleProgress";

type Lab = {
  slug: string;
  title: string;
  blurb: string;
  Icon: typeof Network;
};

type LabGroup = {
  navn: string;
  intro: string;
  Icon: typeof Network;
  labs: Lab[];
};

// Visualiser-seksjonen for DTE-2507 har 25+ interaktive trinn. Vi grupperer
// dem etter OSI-lag/tema så griden ikke blir uoversiktlig.
const LAB_GROUPS: LabGroup[] = [
  {
    navn: "Lenke & MAC",
    intro: "Hvordan ramme-laget faktisk fungerer — ARP, switching, mediumtilgang og feildeteksjon.",
    Icon: Cable,
    labs: [
      {
        slug: "dte2507-arp-detektiv",
        title: "ARP-detektiv",
        blurb: "Spor IP→MAC-oppslag, gjenkjenn ARP-spoofing fra ARP-tabellen.",
        Icon: ScanSearch,
      },
      {
        slug: "dte2507-switch-self-learning",
        title: "Switch self-learning",
        blurb: "Visualiser hvordan en switch lærer MAC-tabellen ramme for ramme.",
        Icon: Network,
      },
      {
        slug: "dte2507-aloha-kasino",
        title: "ALOHA-kasinoet",
        blurb: "Slotted vs pure ALOHA + CSMA/CD — kollisjons-sannsynligheter live.",
        Icon: Radio,
      },
      {
        slug: "dte2507-crc-kalkulator",
        title: "CRC-kalkulator",
        blurb: "Bit-for-bit CRC-divisjon, feildeteksjon på lenkelaget.",
        Icon: Binary,
      },
      {
        slug: "dte2507-subnetting",
        title: "Subnetting & CIDR",
        blurb: "IPv4, CIDR-kalkulator med binær visning, VLSM-trener med fri-form input.",
        Icon: Calculator,
      },
    ],
  },
  {
    navn: "Nettverk & ruting",
    intro: "Routing-tabeller, longest-prefix-match, IGP vs EGP og BGP-konvergens.",
    Icon: Route,
    labs: [
      {
        slug: "dte2507-inni-ruter",
        title: "Inni en ruter",
        blurb: "Data plane vs control plane, line cards, switching fabric, queueing.",
        Icon: HardDrive,
      },
      {
        slug: "dte2507-packet-scheduling",
        title: "Pakke-scheduling",
        blurb: "FIFO, priority queuing, fair queuing, WFQ — visualisert i kø.",
        Icon: Boxes,
      },
      {
        slug: "dte2507-ruting",
        title: "IP-forwarding & ruting",
        blurb: "Longest-prefix-match, Dijkstra vs Bellman-Ford, OSPF/RIP/BGP, LPM-trener.",
        Icon: Route,
      },
      {
        slug: "dte2507-count-to-infinity",
        title: "Count-to-infinity",
        blurb: "Distance-vector-problemet, split horizon og poison reverse, animert.",
        Icon: AlertTriangle,
      },
      {
        slug: "dte2507-bgp-stige",
        title: "BGP-stige",
        blurb: "BGP-attributter, AS-path, local-pref, MED — sti-utvelgelse trinn for trinn.",
        Icon: Workflow,
      },
      {
        slug: "dte2507-dhcp",
        title: "DHCP — DORA",
        blurb: "Discover/Offer/Request/Ack — visualisert frame-utveksling og lease.",
        Icon: Server,
      },
      {
        slug: "dte2507-nat",
        title: "NAT-tabell",
        blurb: "Source NAT, PAT/PNAT — se hvordan port-mapping endrer pakke-headers.",
        Icon: Workflow,
      },
    ],
  },
  {
    navn: "Transport — TCP/UDP",
    intro: "Reliable data transfer, congestion control og delay-modeller.",
    Icon: Activity,
    labs: [
      {
        slug: "dte2507-rdt-progresjon",
        title: "RDT-progresjon",
        blurb: "Stop-and-wait → Go-Back-N → Selective Repeat. Lær protokollene som bygger på hverandre.",
        Icon: Layers,
      },
      {
        slug: "dte2507-ap-progresjon",
        title: "ACK/NAK-progresjon",
        blurb: "Hvordan ACK-design utvikles parallelt med RDT-protokollene.",
        Icon: Layers,
      },
      {
        slug: "dte2507-congestion-control",
        title: "TCP Congestion Control",
        blurb: "Slow start, AIMD, Tahoe/Reno/Cubic/BBR. Interaktiv cwnd-simulator.",
        Icon: Activity,
      },
      {
        slug: "dte2507-delay-modell",
        title: "Delay-modell",
        blurb: "Prop-, trans-, queuing- og prosess-forsinkelse — regn ut totaltiden.",
        Icon: Activity,
      },
      {
        slug: "dte2507-bottleneck-throughput",
        title: "Bottleneck throughput",
        blurb: "Velg minste-link-rate gjennom en sti, identifiser flaskehalsen.",
        Icon: Activity,
      },
    ],
  },
  {
    navn: "Applikasjon — DNS/HTTP",
    intro: "Hvordan navne-oppslag og webtransport faktisk fungerer.",
    Icon: Globe,
    labs: [
      {
        slug: "dte2507-dns-dyp",
        title: "DNS-dyp & DNSSEC",
        blurb: "Hele DNS-kjeden, caching, cache-poisoning, DNSSEC chain of trust, DoH/DoT.",
        Icon: Globe,
      },
      {
        slug: "dte2507-http2-hol",
        title: "HTTP/2 head-of-line blocking",
        blurb: "Hvorfor HTTP/1.1 holder linja blokkert, og hvordan HTTP/2/3 løser det.",
        Icon: Globe,
      },
      {
        slug: "dte2507-web-caching-matte",
        title: "Web-caching — regnedrill",
        blurb: "Hit-rate, mean access time, breakeven-analyse for caching-investering.",
        Icon: Calculator,
      },
      {
        slug: "dte2507-day-in-the-life",
        title: "En dag i nettets liv",
        blurb: "Klikk «google.com» → følg pakken ned-igjennom alle lag og tilbake opp.",
        Icon: Workflow,
      },
    ],
  },
  {
    navn: "Sikkerhet & krypto",
    intro: "Bygge-blokkene som beskytter integritet, konfidensialitet og autentisitet.",
    Icon: Key,
    labs: [
      {
        slug: "dte2507-rsa-mini",
        title: "RSA — mini-versjon",
        blurb: "Klikk gjennom p, q, n, φ, e, d. Krypter HI tegn for tegn. Signering vs kryptering.",
        Icon: KeyRound,
      },
      {
        slug: "dte2507-tls-handshake",
        title: "TLS-handshake (klikkbar)",
        blurb: "TLS 1.2/1.3 klikkbar handshake: ClientHello → Cert → KeyExchange → Finished.",
        Icon: LockIcon,
      },
      {
        slug: "dte2507-cbc-iv",
        title: "CBC og IV",
        blurb: "Hvorfor IV må være tilfeldig, og hva som skjer ved gjenbruk. Block cipher mode in action.",
        Icon: Key,
      },
      {
        slug: "dte2507-fra-checksum-til-hmac",
        title: "Fra checksum til HMAC",
        blurb: "Hvorfor MD5-checksum ikke autentiserer, og hvordan HMAC løser problemet.",
        Icon: Key,
      },
      {
        slug: "dte2507-stateful-firewall",
        title: "Stateful brannmur",
        blurb: "Conntrack-tabell, hvordan returtrafikk automatisk slipper gjennom.",
        Icon: BrickWall,
      },
      {
        slug: "dte2507-brannmur-vlan",
        title: "Brannmur & VLAN",
        blurb: "Stateless vs stateful, iptables, DMZ-topologi, 802.1Q VLAN, defense in depth.",
        Icon: BrickWall,
      },
      {
        slug: "dte2507-ids-snort",
        title: "IDS — Snort-regler",
        blurb: "Skriv signaturer mot synthetic angreps-trafikk, se IDS-alerts trigge.",
        Icon: AlertTriangle,
      },
    ],
  },
  {
    navn: "Praktisk pakke-analyse",
    intro: "Tren på akkurat det eksamen viser — pcap-flyt og pakke-strukturer.",
    Icon: ScanSearch,
    labs: [
      {
        slug: "dte2507-wireshark-analyse",
        title: "Wireshark / pcap-analyse",
        blurb: "Pcap-tabeller som eksamen viser dem. Filter-syntaks, HTTP/DNS/TLS frame for frame.",
        Icon: ScanSearch,
      },
      {
        slug: "dte2507-paket-dekoding",
        title: "Paket-dekoding (hex)",
        blurb: "Ethernet/IP/TCP/UDP-headere byte for byte. Hover for tolkning.",
        Icon: Binary,
      },
      {
        slug: "dte2507-praksis",
        title: "Paket-tolker (5 scenarier)",
        blurb: "TCP SYN, SYN+ACK, UDP DNS, ARP, ICMP echo — klikk byte-felter.",
        Icon: PackageOpen,
      },
      {
        slug: "dte2507-socket-programmering",
        title: "Socket-programmering",
        blurb: "TCP/UDP server+klient, threading, asyncio, TLS-wrapping — Pyodide-shim.",
        Icon: Plug,
      },
    ],
  },
];

type ConceptCourse = {
  slug: string;
  title: string;
  shortDescription: string;
  Icon: typeof Network;
};

const CONCEPT_COURSES: ConceptCourse[] = [
  {
    slug: "osi-tcpip",
    title: "OSI- og TCP/IP-modellen",
    shortDescription:
      "De fem (eller syv) lagene top-down: applikasjon → transport → nettverk → lenke → fysisk. Hvilken protokoll bor hvor.",
    Icon: Network,
  },
  {
    slug: "transportlag",
    title: "Transportlag — TCP og UDP",
    shortDescription:
      "TCP: pålitelig, tilkoblet, flow control. UDP: enkel, raskt, upålitelig. Når brukes hvilken, og hvorfor.",
    Icon: Server,
  },
  {
    slug: "kryptografi",
    title: "Kryptografi-grunnlag",
    shortDescription:
      "Symmetrisk vs asymmetrisk, hash vs MAC, digital signatur, PKI. Hva som beskytter mot hva.",
    Icon: Key,
  },
  {
    slug: "tls",
    title: "TLS-håndtrykk",
    shortDescription:
      "Hva som faktisk skjer fra «klikk på https://» til kryptert kanal: ClientHello, sertifikat, nøkkel-utveksling, Finished.",
    Icon: Lock,
  },
  {
    slug: "nettverkssikkerhet",
    title: "Nettverkssikkerhet — brannmur, IDS, angrep",
    shortDescription:
      "Stateful vs stateless brannmur, IDS vs IPS, vanlige angrep (sniffing, MITM, DDoS), forsvarsdyp.",
    Icon: Shield,
  },
];

type ExamTopic = {
  topic: string;
  Icon: typeof Network;
  slugs: { slug: string; label: string }[];
};

const EXAM_TOPICS: ExamTopic[] = [
  {
    topic: "Protokollstakken",
    Icon: Network,
    slugs: [
      { slug: "osi-tcpip", label: "OSI/TCP-IP" },
      { slug: "dte2507-day-in-the-life", label: "Full sti" },
    ],
  },
  {
    topic: "Lenkelag & MAC",
    Icon: Cable,
    slugs: [
      { slug: "dte2507-arp-detektiv", label: "ARP" },
      { slug: "dte2507-switch-self-learning", label: "Switch" },
      { slug: "dte2507-aloha-kasino", label: "ALOHA/CSMA" },
      { slug: "dte2507-crc-kalkulator", label: "CRC" },
    ],
  },
  {
    topic: "IP & subnetting",
    Icon: Calculator,
    slugs: [
      { slug: "dte2507-subnetting", label: "CIDR/VLSM" },
      { slug: "dte2507-nat", label: "NAT" },
      { slug: "dte2507-dhcp", label: "DHCP" },
    ],
  },
  {
    topic: "Ruting",
    Icon: Route,
    slugs: [
      { slug: "dte2507-ruting", label: "LPM/OSPF" },
      { slug: "dte2507-count-to-infinity", label: "DV-problem" },
      { slug: "dte2507-bgp-stige", label: "BGP" },
      { slug: "dte2507-inni-ruter", label: "Inni ruter" },
    ],
  },
  {
    topic: "Transport — TCP/UDP",
    Icon: Activity,
    slugs: [
      { slug: "transportlag", label: "TCP/UDP-konsept" },
      { slug: "dte2507-rdt-progresjon", label: "RDT" },
      { slug: "dte2507-congestion-control", label: "Congestion" },
      { slug: "dte2507-delay-modell", label: "Delay" },
    ],
  },
  {
    topic: "Applikasjon — DNS/HTTP",
    Icon: Globe,
    slugs: [
      { slug: "dte2507-dns-dyp", label: "DNS" },
      { slug: "dte2507-http2-hol", label: "HTTP/2" },
      { slug: "dte2507-web-caching-matte", label: "Caching" },
    ],
  },
  {
    topic: "Kryptografi",
    Icon: Key,
    slugs: [
      { slug: "kryptografi", label: "Konsept" },
      { slug: "dte2507-rsa-mini", label: "RSA" },
      { slug: "dte2507-cbc-iv", label: "CBC/IV" },
      { slug: "dte2507-fra-checksum-til-hmac", label: "HMAC" },
    ],
  },
  {
    topic: "TLS",
    Icon: Lock,
    slugs: [
      { slug: "tls", label: "Konsept" },
      { slug: "dte2507-tls-handshake", label: "Klikkbar handshake" },
    ],
  },
  {
    topic: "Sikkerhet — angrep & forsvar",
    Icon: Shield,
    slugs: [
      { slug: "nettverkssikkerhet", label: "Konsept" },
      { slug: "dte2507-stateful-firewall", label: "Stateful FW" },
      { slug: "dte2507-brannmur-vlan", label: "Brannmur/VLAN" },
      { slug: "dte2507-ids-snort", label: "IDS" },
    ],
  },
  {
    topic: "Pakke-analyse (eksamenstrening)",
    Icon: ScanSearch,
    slugs: [
      { slug: "dte2507-wireshark-analyse", label: "Wireshark" },
      { slug: "dte2507-paket-dekoding", label: "Hex-dump" },
      { slug: "dte2507-praksis", label: "5 scenarier" },
    ],
  },
];

const MODE_ANCHORS: { id: string; label: string; Icon: typeof Network }[] = [
  { id: "les", label: "Les", Icon: BookOpen },
  { id: "visualiser", label: "Visualiser", Icon: Eye },
  { id: "ov", label: "Øv", Icon: Wrench },
  { id: "eksamen", label: "Eksamen", Icon: ScrollText },
  { id: "tutor", label: "AI-tutor", Icon: Brain },
];

export function Dte2507Hub() {
  const meta = EXAM_META["dte-2507"];

  const allConceptSlugs = useMemo(() => CONCEPT_COURSES.map((c) => c.slug), []);
  const { seen, total } = useModulProgress(allConceptSlugs);
  const nextSlug = useNextUnseenSlug(allConceptSlugs);
  const nextCourse = useMemo(
    () => CONCEPT_COURSES.find((c) => c.slug === nextSlug) ?? CONCEPT_COURSES[0],
    [nextSlug],
  );
  const allDone = total > 0 && seen === total;

  // Telle totalt antall labs på tvers av grupper for badge.
  const totalLabs = useMemo(
    () => LAB_GROUPS.reduce((sum, g) => sum + g.labs.length, 0),
    [],
  );

  return (
    <StackPageShell title="DTE-2507 Datakommunikasjon og sikkerhet" group="eksamen">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Hero */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 text-brand border border-brand/30 px-2.5 py-1 font-semibold">
              DTE-2507
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground border border-border px-2.5 py-1">
              {meta?.stp ?? 10} stp
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2.5 py-1">
              <Calendar className="h-3 w-3" />
              Eksamen {meta?.eksamen ?? "30.11.2026 (2 × 2t)"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground border border-border px-2.5 py-1">
              Kurose &amp; Ross
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Datakommunikasjon og sikkerhet
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Hele protokoll-stakken top-down (applikasjon → fysisk), kryptografi,
            TLS og praktisk nettverkssikkerhet. Eksamen er pcap-tung — velg modus
            under.
          </p>
        </div>

        {/* Modus-rad */}
        <nav
          aria-label="Velg modus"
          className="mb-6 sticky top-14 z-20 -mx-4 px-4 py-2 bg-background/85 backdrop-blur border-b border-border"
        >
          <div className="flex flex-wrap gap-1.5 text-xs">
            {MODE_ANCHORS.map((m) => {
              const Icon = m.Icon;
              return (
                <a
                  key={m.id}
                  href={`#${m.id}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card hover:border-brand/50 hover:bg-brand/5 px-2.5 py-1.5 text-foreground transition-colors"
                >
                  <Icon className="h-3.5 w-3.5 text-brand" />
                  {m.label}
                </a>
              );
            })}
          </div>
        </nav>

        {/* Anbefalt neste + framdrift */}
        <div className="mb-10 grid sm:grid-cols-[2fr_1fr] gap-3">
          <Link
            to="/stack/$slug"
            params={{ slug: nextCourse.slug }}
            className="group rounded-xl border-2 border-brand/40 bg-gradient-to-br from-brand/10 to-success/5 hover:border-brand transition-colors p-5 block"
          >
            <div className="flex items-center gap-2 mb-1">
              <PlayCircle className="h-5 w-5 text-brand" />
              <div className="text-[10px] uppercase tracking-wider font-semibold text-brand">
                {allDone ? "Repeter" : seen === 0 ? "Start her" : "Anbefalt neste"}
              </div>
            </div>
            <h3 className="font-semibold text-foreground leading-tight text-lg mt-1">
              {nextCourse.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-snug mt-1">
              {nextCourse.shortDescription}
            </p>
            <div className="mt-3 flex items-center text-xs font-medium text-brand">
              {seen === 0 ? "Start" : "Fortsett"}
              <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
              Din framdrift
            </div>
            <div className="text-2xl font-semibold tabular-nums">
              {seen}{" "}
              <span className="text-muted-foreground text-base font-normal">
                / {total}
              </span>
            </div>
            <ModulProgressBar trinnSlugs={allConceptSlugs} />
            <div className="mt-3 text-[11px] text-muted-foreground">
              Konsept-leksjoner sett. {totalLabs} labs telles ikke her.
            </div>
          </div>
        </div>

        {/* Læringssti */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-3">Læringssti — anbefalt rekkefølge</h2>
          <LearningPath
            fag="DTE-2507"
            forbinder={[
              "DTE-2505 (Linux-OS som kjører nettverkstacken)",
              "DTE-2509 (HTTP og web-sikkerhet)",
              "TEK-1501 (sannsynlighet for kryptering)",
            ]}
            layers={[
              {
                navn: "Basis — protokoll-stakken top-down",
                intro:
                  "Start på applikasjonslaget der du allerede kjenner HTTP, og jobb deg ned. Lær lag for lag hva som faktisk skjer.",
                steps: [
                  { slug: "osi-tcpip", title: "OSI og TCP/IP", blurb: "De to lagmodellene, hvorfor man trenger begge mentale rammer." },
                  { slug: "transportlag", title: "Transportlaget", blurb: "TCP 3-way handshake, sequence numbers vs UDP — pålitelighet vs hastighet." },
                  { slug: "dte2507-subnetting", title: "Subnetting (interaktiv)", blurb: "CIDR-kalkulator + binær AND-visning. VLSM-trener." },
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
                  "To 2-timers deleksamener krever at du både gjenkjenner pakker og forklarer angrep/forsvar.",
                steps: [
                  { slug: "dte2507-paket-dekoding", title: "Pakke-dekoding (hex)", blurb: "Klikk byte-felter i hex-dump — se hva hver byte betyr." },
                  { slug: "dte2507-praksis", title: "5 forhåndsdefinerte pakker", blurb: "TCP SYN, SYN+ACK, UDP DNS, ARP, ICMP." },
                  { slug: "nettverkssikkerhet", title: "Nettverkssikkerhet", blurb: "Trusler, brannmurer, IDS, WAF." },
                  { slug: "dte2507-wireshark-analyse", title: "Wireshark-analyse", blurb: "Pcap-tolking + filter-syntaks for raske spørsmål." },
                ],
              },
            ]}
          />
        </section>

        {/* === LES === */}
        <section id="les" className="mb-12 scroll-mt-28">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Les — konsept-leksjoner</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            De fem fundamentene. Sett først hver av dem, så bygg på med labs.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {CONCEPT_COURSES.map((c) => {
              const Icon = c.Icon;
              return (
                <Link
                  key={c.slug}
                  to="/stack/$slug"
                  params={{ slug: c.slug }}
                  className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-foreground leading-tight">
                      {c.title}
                    </h3>
                    <ModulStatusBadge trinnSlugs={[c.slug]} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {c.shortDescription}
                  </p>
                  <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Åpne
                    <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* === VISUALISER === */}
        <section id="visualiser" className="mb-12 scroll-mt-28">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Visualiser & labs</h2>
            <span className="rounded-full bg-success/10 text-success border border-success/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              {totalLabs} interaktive
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Gruppert etter OSI-lag. Klikk-gjennom-simulatorer — det raskeste sporet
            til å bygge intuisjon for nettverk og krypto.
          </p>
          <div className="space-y-8">
            {LAB_GROUPS.map((g) => {
              const GIcon = g.Icon;
              return (
                <div key={g.navn}>
                  <div className="flex items-center gap-2 mb-1">
                    <GIcon className="h-4 w-4 text-success" />
                    <h3 className="text-base font-semibold text-foreground">
                      {g.navn}
                    </h3>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {g.labs.length}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{g.intro}</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {g.labs.map((lab) => {
                      const Icon = lab.Icon;
                      return (
                        <Link
                          key={lab.slug}
                          to="/stack/$slug"
                          params={{ slug: lab.slug }}
                          className="group rounded-xl border border-success/30 bg-success/5 hover:border-success p-4 transition-colors block"
                        >
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <Icon className="h-4 w-4 text-success shrink-0" />
                            <h4 className="font-semibold text-foreground leading-tight text-sm">
                              {lab.title}
                            </h4>
                            <ModulStatusBadge trinnSlugs={[lab.slug]} />
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {lab.blurb}
                          </p>
                          <div className="mt-2 inline-flex items-center text-[11px] text-success font-medium">
                            Åpne
                            <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* === ØV === */}
        <section id="ov" className="mb-12 scroll-mt-28">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Øv — gjør, ikke bare les</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Pcap-quiz speiler eksamen direkte; drag, Python og flashcards bygger
            repetisjons-muskelen.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              to="/dte2507/pcap"
              className="group rounded-xl border border-brand/40 bg-brand/5 hover:border-brand p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <ScanSearch className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Pcap-quiz — 15+ scenarier
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Wireshark-format med multiple-choice. Identifiser handshake-rammer,
                ARP-spoofing, port-skann, status-koder.
              </p>
              <div className="mt-3 flex items-center text-xs text-brand font-medium">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <Link
              to="/python"
              className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Python-øvelser (sockets)
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Socket-shim i Pyodide: TCP/UDP-server, threading, asyncio,
                SSL/TLS-wrapping — kjøres i nettleseren.
              </p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <Link
              to="/drag"
              className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Drag-oppgaver
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Filter på «Nettverk &amp; sikkerhet» — OSI-lag, TCP-handshake,
                kryptografi-typer, TLS-state.
              </p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <Link
              to="/cards"
              className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Flashcards
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Protokoll-stakken, kryptografi, port-numre, headers og
                angreps-mønstre.
              </p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* === EKSAMEN === */}
        <section id="eksamen" className="mb-12 scroll-mt-28">
          <div className="flex items-center gap-2 mb-2">
            <ScrollText className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Eksamen-temaer</h2>
            <span className="text-[11px] text-muted-foreground">
              {meta?.eksamen ?? "30.11.2026 (2 × 2t)"} · {meta?.stp ?? 10} stp
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Pensumet gruppert etter eksamenstema. Hver kategori har direkte
            ankerknapper til relevant konsept-leksjon og lab.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {EXAM_TOPICS.map((t) => {
              const Icon = t.Icon;
              return (
                <div
                  key={t.topic}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-foreground text-sm">
                      {t.topic}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {t.slugs.map((s) => (
                      <Link
                        key={s.slug}
                        to="/stack/$slug"
                        params={{ slug: s.slug }}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background hover:border-brand/50 hover:bg-brand/5 px-2 py-1 text-[11px] text-foreground transition-colors"
                      >
                        {s.label}
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* === AI-TUTOR === */}
        <section id="tutor" className="mb-12 scroll-mt-28">
          <a
            href="/tutor"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-brand/30 bg-gradient-to-br from-brand/10 to-violet-500/5 hover:border-brand p-5 transition-colors flex items-start gap-4"
          >
            <div className="shrink-0 rounded-lg bg-brand/15 p-2.5">
              <Sparkles className="h-5 w-5 text-brand" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold">Spør AI om DTE-2507</h2>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-success/15 text-success border border-success/30">
                  Sjekk forståelse
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-snug">
                Få forklart hvorfor TCP trenger sequence numbers og UDP ikke gjør
                det, eller hvordan en MITM-angriper får BGP-trafikken sin spredt.
                Tutoren ser hva du har gjort på faget.
              </p>
              <div className="mt-2 flex items-center text-xs font-medium text-brand">
                Åpne tutor
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </a>
        </section>

        {/* Stakken på én side — referansetabell */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Stakken på én side</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver request går ned-gjennom hos sender, opp-gjennom hos mottaker. Lær
            «hvilken protokoll bor på hvilket lag» utenat.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
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
      </div>
    </StackPageShell>
  );
}

function useNextUnseenSlug(slugs: string[]): string {
  const { seen, total } = useModulProgress(slugs);
  if (typeof window === "undefined" || seen === 0 || seen >= total) {
    return slugs[0];
  }
  try {
    const raw = window.localStorage.getItem("stack.visited.v1");
    if (!raw) return slugs[0];
    const visited = JSON.parse(raw) as Record<string, true>;
    const next = slugs.find((s) => !visited[s]);
    return next ?? slugs[0];
  } catch {
    return slugs[0];
  }
}
