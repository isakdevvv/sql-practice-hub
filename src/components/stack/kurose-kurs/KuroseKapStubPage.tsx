import { SiteHeader } from "@/components/SiteHeader";
import { FolderOpen, ArrowLeft, ArrowRight, ExternalLink, Clock } from "lucide-react";

export type StubChapterMeta = {
  num: number;
  slug: string;
  title: string;
  oneLiner: string;
  outline: string[];
  relatedSlugs: string[];
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
};

export function KuroseKapStubPage({ meta }: { meta: StubChapterMeta }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <a
              href="/stack/kurose-kurs"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <FolderOpen className="h-3 w-3" /> Kurose-kurset
            </a>
            <span>·</span>
            <span>Kapittel {meta.num} av 9</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kap. {meta.num} — {meta.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{meta.oneLiner}</p>
        </header>

        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold text-foreground">Under utvikling</span>
          </div>
          <p className="text-muted-foreground">
            Dette kapittelet er på prioriterings-lista. Mens vi venter på den fullt skrevne
            versjonen kan du bruke kapittel-disposisjonen under som rettesnor, og hoppe direkte til
            våre eksisterende interaktive sider for hvert tema.
          </p>
        </div>

        <section className="rounded-xl border border-border bg-card p-4 mb-4">
          <h2 className="text-base font-semibold mb-2">Kapittelets temaer</h2>
          <ol className="list-decimal pl-5 text-muted-foreground space-y-1 text-sm">
            {meta.outline.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
        </section>

        {meta.relatedSlugs.length > 0 && (
          <section className="rounded-xl border border-border bg-card p-4 mb-4">
            <h2 className="text-base font-semibold mb-2">
              Interaktive sider vi har for dette kapittelet
            </h2>
            <ul className="space-y-1.5 text-sm">
              {meta.relatedSlugs.map((s) => (
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
          </section>
        )}

        <nav className="mt-10 grid gap-3 sm:grid-cols-2">
          {meta.prev ? (
            <a
              href={`/stack/${meta.prev.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-brand/60"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-brand" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Forrige kap.
                </div>
                <div className="text-sm font-semibold">{meta.prev.title}</div>
              </div>
            </a>
          ) : (
            <a
              href="/stack/kurose-kurs"
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-brand/60"
            >
              <FolderOpen className="h-4 w-4 text-muted-foreground group-hover:text-brand" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Kurs-oversikt
                </div>
                <div className="text-sm font-semibold">Tilbake til Kurose-kurset</div>
              </div>
            </a>
          )}
          {meta.next ? (
            <a
              href={`/stack/${meta.next.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-brand/40 bg-brand/5 p-4 hover:border-brand sm:flex-row-reverse sm:text-right"
            >
              <ArrowRight className="h-4 w-4 text-brand group-hover:translate-x-0.5 transition-transform" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-brand/80">Neste kap.</div>
                <div className="text-sm font-semibold">{meta.next.title}</div>
              </div>
            </a>
          ) : (
            <a
              href="/stack/kurose-kurs"
              className="group flex items-center gap-3 rounded-xl border border-success/40 bg-success/5 p-4 hover:border-success sm:flex-row-reverse sm:text-right"
            >
              <FolderOpen className="h-4 w-4 text-success group-hover:translate-x-0.5 transition-transform" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-success/80">Slutt</div>
                <div className="text-sm font-semibold">Tilbake til kurs-oversikten</div>
              </div>
            </a>
          )}
        </nav>
      </main>
    </div>
  );
}

// Per-kapittel-wrappere — definerer meta-objektet for hver av stub-kapitlene 2-9.

export function KuroseKap2Page() {
  return (
    <KuroseKapStubPage
      meta={{
        num: 2,
        slug: "kurose-kap-2",
        title: "Applikasjonslaget",
        oneLiner:
          "Hvordan apper snakker sammen: HTTP, DNS, P2P, video-streaming, og socket-API-et.",
        outline: [
          "2.1 Prinsipper for nettverks-applikasjoner — klient-server vs P2P",
          "2.2 Web og HTTP — request/response, persistente vs ikke-persistente forbindelser",
          "2.3 E-post — SMTP, POP3, IMAP",
          "2.4 DNS — internet-katalog-tjenesten",
          "2.5 P2P-fildeling — BitTorrent og DHT",
          "2.6 Video-streaming og CDN",
          "2.7 Socket-programmering — TCP og UDP",
        ],
        relatedSlugs: [
          "http-anatomi",
          "http-statuskoder",
          "dte2507-dns-dyp",
          "dte2507-web-caching-matte",
          "dte2507-http2-hol",
          "dte2507-socket-programmering",
        ],
        prev: { slug: "kurose-kap-1", title: "Internett og nettverks-grunnleggende" },
        next: { slug: "kurose-kap-3", title: "Transportlaget" },
      }}
    />
  );
}

export function KuroseKap3Page() {
  return (
    <KuroseKapStubPage
      meta={{
        num: 3,
        slug: "kurose-kap-3",
        title: "Transportlaget",
        oneLiner: "UDP, TCP, og hvordan vi lager pålitelig leveranse over upålitelig nett.",
        outline: [
          "3.1 Transportlaget — overview og tjenester",
          "3.2 Multipleksing og demultipleksing med portnumre",
          "3.3 UDP — connectionless transport",
          "3.4 Prinsipper for pålitelig data-transport — RDT-progresjon",
          "3.5 TCP — connection-oriented transport",
          "3.6 Prinsipper for congestion-kontroll",
          "3.7 TCP congestion-kontroll — Reno, Cubic, BBR",
        ],
        relatedSlugs: [
          "transportlag",
          "tcp-sockets",
          "dte2507-rdt-progresjon",
          "dte2507-congestion-control",
        ],
        prev: { slug: "kurose-kap-2", title: "Applikasjonslaget" },
        next: { slug: "kurose-kap-4", title: "Nettverkslaget — data-plane" },
      }}
    />
  );
}

export function KuroseKap4Page() {
  return (
    <KuroseKapStubPage
      meta={{
        num: 4,
        slug: "kurose-kap-4",
        title: "Nettverkslaget — data-plane",
        oneLiner: "Hva som faktisk skjer inne i en ruter når en pakke ankommer.",
        outline: [
          "4.1 Overview — data-plane vs control-plane",
          "4.2 Hva er inni en ruter — switching fabric, input/output-porter",
          "4.3 Internet Protocol — IPv4, fragmentering, adressering",
          "4.4 Generalisert forwarding og SDN",
          "4.5 Middleboxes — NAT, brannmurer",
          "4.6 IPv6",
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
        prev: { slug: "kurose-kap-3", title: "Transportlaget" },
        next: { slug: "kurose-kap-5", title: "Nettverkslaget — control-plane" },
      }}
    />
  );
}

export function KuroseKap5Page() {
  return (
    <KuroseKapStubPage
      meta={{
        num: 5,
        slug: "kurose-kap-5",
        title: "Nettverkslaget — control-plane",
        oneLiner: "Hvordan rutere lærer hvor pakker skal: OSPF, BGP, ICMP, DHCP.",
        outline: [
          "5.1 Overview — distribuert vs sentralisert (SDN) control-plane",
          "5.2 Routing-algoritmer — link-state (Dijkstra) og distance-vector (Bellman-Ford)",
          "5.3 Intra-AS routing — OSPF og IS-IS",
          "5.4 Inter-AS routing — BGP",
          "5.5 SDN control-plane",
          "5.6 ICMP",
          "5.7 Network management — SNMP og NETCONF",
        ],
        relatedSlugs: [
          "dte2507-ruting",
          "dte2507-ospf-dijkstra",
          "dte2507-count-to-infinity",
          "dte2507-bgp-stige",
          "dte2507-dhcp",
        ],
        prev: { slug: "kurose-kap-4", title: "Nettverkslaget — data-plane" },
        next: { slug: "kurose-kap-6", title: "Link-laget og LAN" },
      }}
    />
  );
}

export function KuroseKap6Page() {
  return (
    <KuroseKapStubPage
      meta={{
        num: 6,
        slug: "kurose-kap-6",
        title: "Link-laget og LAN",
        oneLiner: "Hvordan to direkte naboer snakker sammen, og hvordan flere deler samme medium.",
        outline: [
          "6.1 Tjenester levert av link-laget",
          "6.2 Feiloppdaging og feilretting — paritets-bits, CRC",
          "6.3 Multiple access protokoller — ALOHA, CSMA/CD",
          "6.4 Switched LAN — adressering, ARP, switcher",
          "6.5 VLAN",
          "6.6 Datasenter-nettverk",
          "6.7 «A day in the life» — pakke-følging gjennom alle lag",
        ],
        relatedSlugs: [
          "dte2507-aloha-kasino",
          "dte2507-switch-self-learning",
          "dte2507-brannmur-vlan",
          "dte2507-day-in-the-life",
        ],
        prev: { slug: "kurose-kap-5", title: "Nettverkslaget — control-plane" },
        next: { slug: "kurose-kap-7", title: "Trådløst og mobilt" },
      }}
    />
  );
}

export function KuroseKap7Page() {
  return (
    <KuroseKapStubPage
      meta={{
        num: 7,
        slug: "kurose-kap-7",
        title: "Trådløst og mobilt",
        oneLiner: "WiFi, mobilnett, og utfordringene ved at noden flytter seg.",
        outline: [
          "7.1 Karakteristikker ved trådløse lenker",
          "7.2 WiFi — 802.11 og CSMA/CA",
          "7.3 Cellular — 3G/4G/5G arkitektur",
          "7.4 Mobilitet — hva skjer når noden flytter seg",
          "7.5 Håndover mellom AP-er og celler",
        ],
        relatedSlugs: ["dte2507-wifi-csma-ca"],
        prev: { slug: "kurose-kap-6", title: "Link-laget og LAN" },
        next: { slug: "kurose-kap-8", title: "Sikkerhet i nettverk" },
      }}
    />
  );
}

export function KuroseKap8Page() {
  return (
    <KuroseKapStubPage
      meta={{
        num: 8,
        slug: "kurose-kap-8",
        title: "Sikkerhet i nettverk",
        oneLiner: "Konfidensialitet, integritet, autentisering — og hvordan TLS limer det sammen.",
        outline: [
          "8.1 Hva er nettverks-sikkerhet?",
          "8.2 Kryptografi — symmetrisk og asymmetrisk",
          "8.3 Meldings-integritet — hash, MAC, digital signering",
          "8.4 End-point-autentisering",
          "8.5 Sikker e-post — PGP og S/MIME",
          "8.6 Sikker TCP-tilkobling — TLS",
          "8.7 Sikkerhet på nettverkslaget — IPsec og VPN",
          "8.8 Brannmurer og IDS",
          "8.9 Operasjonell sikkerhet — angreps-typer og forsvar",
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
        prev: { slug: "kurose-kap-7", title: "Trådløst og mobilt" },
        next: { slug: "kurose-kap-9", title: "Multimedia-nettverk" },
      }}
    />
  );
}

export function KuroseKap9Page() {
  return (
    <KuroseKapStubPage
      meta={{
        num: 9,
        slug: "kurose-kap-9",
        title: "Multimedia-nettverk",
        oneLiner: "Lyd og video over nett: forsinkelse, jitter, kvalitet.",
        outline: [
          "9.1 Multimedia-applikasjoner — krav og typer",
          "9.2 Streaming av lagret video",
          "9.3 VoIP",
          "9.4 RTP og RTSP",
          "9.5 Network support for multimedia — QoS, RSVP, DiffServ",
        ],
        relatedSlugs: ["dte2507-voip-rtp"],
        prev: { slug: "kurose-kap-8", title: "Sikkerhet i nettverk" },
        next: null,
      }}
    />
  );
}
