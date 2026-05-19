import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, Circle, ArrowRight, ExternalLink } from "lucide-react";
import { loadBookProgress, saveBookProgress } from "@/lib/stack/bookCourse";

type ChapterCard = {
  num: number;
  slug: string;
  title: string;
  oneLiner: string;
  topics: string[];
  relatedSlugs: string[];
};

const BOOK_SLUG = "kurose-kurs";

const CHAPTERS: ChapterCard[] = [
  {
    num: 1,
    slug: "kurose-kap-1",
    title: "Internett og nettverks-grunnleggende",
    oneLiner: "Hva internett er, hvordan pakker beveger seg, og hvorfor vi tenker i lag.",
    topics: [
      "Hva er internett?",
      "Nettverks-edge vs core",
      "Pakke-svitsjing vs krets-svitsjing",
      "Forsinkelse og throughput",
      "Lag-modellen",
    ],
    relatedSlugs: [
      "osi-tcpip",
      "dte2507-delay-modell",
      "dte2507-bottleneck-throughput",
      "dte2507-day-in-the-life",
    ],
  },
  {
    num: 2,
    slug: "kurose-kap-2",
    title: "Applikasjonslaget",
    oneLiner: "Hvordan apper snakker sammen: HTTP, DNS, P2P, video-streaming, sockets.",
    topics: [
      "HTTP/1.1, HTTP/2, HTTP/3",
      "DNS-oppslag og caching",
      "Mail-protokoller (SMTP/IMAP)",
      "P2P-distribusjon",
      "Socket-API-et",
    ],
    relatedSlugs: [
      "http-anatomi",
      "http-statuskoder",
      "dte2507-dns-dyp",
      "dte2507-web-caching-matte",
      "dte2507-http2-hol",
      "dte2507-socket-programmering",
    ],
  },
  {
    num: 3,
    slug: "kurose-kap-3",
    title: "Transportlaget",
    oneLiner:
      "Hvordan vi lager pålitelig leveranse over upålitelig nett: UDP, TCP, congestion-kontroll.",
    topics: [
      "UDP — minimalisme",
      "RDT — pålitelig data-transport bygd opp",
      "TCP — segmentering, ack, retransmit",
      "Flow-control vs congestion-control",
      "TCP Reno/Cubic",
    ],
    relatedSlugs: [
      "transportlag",
      "tcp-sockets",
      "dte2507-rdt-progresjon",
      "dte2507-congestion-control",
    ],
  },
  {
    num: 4,
    slug: "kurose-kap-4",
    title: "Nettverkslaget — data-plane",
    oneLiner: "Hva som skjer inne i en ruter når en pakke ankommer. IPv4/IPv6, fragmentering, NAT.",
    topics: [
      "Ruter-arkitektur",
      "IPv4-headeren",
      "Subnetting og CIDR",
      "ARP",
      "NAT",
      "IPv6",
      "Generalisert forwarding (SDN)",
    ],
    relatedSlugs: [
      "dte2507-inni-ruter",
      "dte2507-subnetting",
      "dte2507-arp-detektiv",
      "dte2507-nat",
      "dte2507-paket-dekoding",
      "dte2507-crc-kalkulator",
      "dte2507-packet-scheduling",
    ],
  },
  {
    num: 5,
    slug: "kurose-kap-5",
    title: "Nettverkslaget — control-plane",
    oneLiner: "Hvordan rutere lærer hvor pakkene skal: OSPF, BGP, ICMP, DHCP.",
    topics: [
      "Distance-vector vs link-state",
      "OSPF (Dijkstra på AS)",
      "BGP — policy-basert path-vector",
      "ICMP",
      "DHCP",
      "SDN-controller",
    ],
    relatedSlugs: [
      "dte2507-ruting",
      "dte2507-ospf-dijkstra",
      "dte2507-count-to-infinity",
      "dte2507-bgp-stige",
      "dte2507-dhcp",
    ],
  },
  {
    num: 6,
    slug: "kurose-kap-6",
    title: "Link-laget og LAN",
    oneLiner: "Hvordan to direkte naboer snakker sammen, og hvordan flere deler samme medium.",
    topics: [
      "Feiloppdaging — paritets-bit og CRC",
      "ALOHA, CSMA/CD",
      "Ethernet-rammer",
      "Switcher — self-learning",
      "VLAN",
    ],
    relatedSlugs: ["dte2507-aloha-kasino", "dte2507-switch-self-learning", "dte2507-brannmur-vlan"],
  },
  {
    num: 7,
    slug: "kurose-kap-7",
    title: "Trådløst og mobilt",
    oneLiner: "WiFi, mobilnett, og utfordringene ved at noden flytter seg.",
    topics: ["802.11 WiFi — CSMA/CA", "Hidden terminal", "Mobil-håndover", "4G/5G arkitektur"],
    relatedSlugs: ["dte2507-wifi-csma-ca"],
  },
  {
    num: 8,
    slug: "kurose-kap-8",
    title: "Sikkerhet i nettverk",
    oneLiner: "Konfidensialitet, integritet, autentisering — og hvordan TLS limer det sammen.",
    topics: [
      "Symmetrisk vs asymmetrisk krypto",
      "MAC og HMAC",
      "Sertifikater og PKI",
      "TLS-handshake",
      "Brannmurer og IDS",
    ],
    relatedSlugs: [
      "kryptografi",
      "tls",
      "nettverkssikkerhet",
      "dte2507-tls-handshake",
      "dte2507-tls-handshake-lab",
      "dte2507-rsa-mini",
      "dte2507-fra-checksum-til-hmac",
      "dte2507-cbc-iv",
      "dte2507-stateful-firewall",
      "dte2507-brannmur-pakkeflyt",
      "dte2507-ids-snort",
      "web-angrep",
    ],
  },
  {
    num: 9,
    slug: "kurose-kap-9",
    title: "Multimedia-nettverk",
    oneLiner: "Lyd og video over nett: forsinkelse, jitter, kvalitet.",
    topics: ["Streaming-arkitekturer", "RTP og RTSP", "Jitter-buffer", "VoIP og MOS", "QoS"],
    relatedSlugs: ["dte2507-voip-rtp"],
  },
];

export function KuroseKursHubPage() {
  const [done, setDone] = useState<Set<number>>(() => loadBookProgress(BOOK_SLUG));

  useEffect(() => {
    function refresh() {
      setDone(loadBookProgress(BOOK_SLUG));
    }
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  function toggleDone(num: number) {
    const next = new Set(done);
    if (next.has(num)) next.delete(num);
    else next.add(num);
    setDone(next);
    saveBookProgress(BOOK_SLUG, next);
  }

  const total = CHAPTERS.length;
  const completed = done.size;
  const pct = Math.round((completed / total) * 100);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-3">
            <BookOpen className="h-3.5 w-3.5" />
            Bok-kurs
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Computer Networking — A Top-Down Approach
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Vår egen versjon av Kurose & Ross sin lærebok, kapittel for kapittel. Alle definisjoner,
            illustrasjoner og oppgaver er skrevet på nytt i våre egne ord (boken er
            opphavsrettsbeskyttet). Hvert kapittel kobler til de relevante interaktive sidene vi har
            bygd.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Forfattere: James F. Kurose &amp; Keith W. Ross · 8./9. utgave · DTE-2507
            Datakommunikasjon og sikkerhet
          </p>
        </header>

        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Fremgang gjennom boka</span>
            <span className="font-mono font-semibold">
              {completed} / {total} kapitler ({pct}%)
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand to-success transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          {completed === 0 && (
            <a
              href="/stack/kurose-kap-1"
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-brand hover:underline"
            >
              Start på kapittel 1 <ArrowRight className="h-3 w-3" />
            </a>
          )}
        </div>

        <ol className="space-y-3">
          {CHAPTERS.map((c) => (
            <ChapterRow
              key={c.num}
              chapter={c}
              done={done.has(c.num)}
              onToggle={() => toggleDone(c.num)}
            />
          ))}
        </ol>

        <section className="mt-8 space-y-3 text-sm">
          <h2 className="text-base font-semibold">Hvordan gå gjennom kurset</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
            <li>
              Hvert kapittel har en egen side (<code>/stack/kurose-kap-N</code>) med våre egne
              definisjoner, illustrasjoner, et regne-eksempel og en oppgave.
            </li>
            <li>
              I bunnen av hver kapittel-side er det en «forrige / neste»-pager så du kan gå lineært
              gjennom hele boka.
            </li>
            <li>
              Trykk på sirkelen til venstre for et kapittel for å markere det som ferdig. Fremgangen
              lagres lokalt i nettleseren.
            </li>
            <li>
              «Relaterte sider»-listen i hvert kapittel er våre dypere interaktive labber for de
              viktigste temaene — bruk dem når du vil leke deg med konseptet selv.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

function ChapterRow({
  chapter,
  done,
  onToggle,
}: {
  chapter: ChapterCard;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <li
      className={`rounded-xl border ${done ? "border-success/40 bg-success/5" : "border-border bg-card"} p-4 transition-colors`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className="mt-1 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label={done ? "Marker kapittel som ikke ferdig" : "Marker kapittel som ferdig"}
        >
          {done ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] font-semibold text-brand uppercase tracking-wider">
              Kap. {chapter.num}
            </span>
            <a href={`/stack/${chapter.slug}`} className="text-base font-semibold hover:text-brand">
              {chapter.title}
            </a>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{chapter.oneLiner}</p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {chapter.topics.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>

          {chapter.relatedSlugs.length > 0 && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                {chapter.relatedSlugs.length} relaterte interaktive sider
              </summary>
              <ul className="mt-1.5 space-y-0.5 pl-3">
                {chapter.relatedSlugs.map((s) => (
                  <li key={s}>
                    <a
                      href={`/stack/${s}`}
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-brand"
                    >
                      <ExternalLink className="h-3 w-3" /> /stack/{s}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>

        <a
          href={`/stack/${chapter.slug}`}
          className="shrink-0 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-brand"
        >
          Åpne <ArrowRight className="h-3 w-3" />
        </a>
      </div>
    </li>
  );
}
