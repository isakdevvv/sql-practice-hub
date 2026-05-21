import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Eye,
  MapPin,
  Play,
  Server,
  Shield,
  Signal,
  Wifi,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";

type PingLinje = string;

const PING_LINJER: PingLinje[] = [
  "PING vg.no (195.88.55.16): 56 data bytes",
  "64 bytes from 195.88.55.16: icmp_seq=0 ttl=54 time=24.3 ms",
  "64 bytes from 195.88.55.16: icmp_seq=1 ttl=54 time=23.8 ms",
  "64 bytes from 195.88.55.16: icmp_seq=2 ttl=54 time=25.1 ms",
  "64 bytes from 195.88.55.16: icmp_seq=3 ttl=54 time=24.0 ms",
  "",
  "--- vg.no ping statistics ---",
  "4 packets transmitted, 4 packets received, 0.0% packet loss",
  "round-trip min/avg/max/stddev = 23.8/24.3/25.1/0.5 ms",
];

type Hopp = { nr: number; ip: string; navn: string; rtt: string };

const TRACERT_HOPP: Hopp[] = [
  { nr: 1, ip: "192.168.1.1", navn: "hjemme-ruter", rtt: "1.2 ms" },
  { nr: 2, ip: "10.50.4.1", navn: "ISP gateway (Tromsø)", rtt: "5.4 ms" },
  { nr: 3, ip: "84.215.0.17", navn: "telenor-tromsø-core1", rtt: "8.1 ms" },
  { nr: 4, ip: "62.179.10.5", navn: "telenor-narvik-edge", rtt: "11.7 ms" },
  { nr: 5, ip: "195.0.213.42", navn: "nix-oslo (knutepunkt)", rtt: "19.4 ms" },
  { nr: 6, ip: "195.88.16.1", navn: "schibsted-oslo-edge", rtt: "22.0 ms" },
  { nr: 7, ip: "195.88.55.1", navn: "vg-dmz-ruter", rtt: "23.5 ms" },
  { nr: 8, ip: "195.88.55.16", navn: "vg.no (mål)", rtt: "24.3 ms" },
];

type Pakke = {
  nr: number;
  tid: string;
  kilde: string;
  maal: string;
  protokoll: "TCP" | "DNS" | "HTTP" | "TLS";
  info: string;
  detalj: string;
};

const WS_PAKKER: Pakke[] = [
  {
    nr: 1,
    tid: "0.000",
    kilde: "192.168.1.10",
    maal: "8.8.8.8",
    protokoll: "DNS",
    info: "Standard query A vg.no",
    detalj: "Du ber DNS-serveren (Google på 8.8.8.8) om å oversette vg.no til IP. En liten 70-byte pakke.",
  },
  {
    nr: 2,
    tid: "0.018",
    kilde: "8.8.8.8",
    maal: "192.168.1.10",
    protokoll: "DNS",
    info: "Response A 195.88.55.16",
    detalj: "DNS svarer: vg.no er 195.88.55.16. 18ms senere — det er DNS-oppslagstiden din.",
  },
  {
    nr: 3,
    tid: "0.019",
    kilde: "192.168.1.10",
    maal: "195.88.55.16",
    protokoll: "TCP",
    info: "SYN — start tilkobling til port 443",
    detalj: "Nettleseren starter TCP-handshake mot port 443 (HTTPS). 'SYN' = la oss snakke.",
  },
  {
    nr: 4,
    tid: "0.043",
    kilde: "195.88.55.16",
    maal: "192.168.1.10",
    protokoll: "TCP",
    info: "SYN-ACK",
    detalj: "Serveren svarer: 'ok, la oss snakke'. Du ser her at det tok 24ms — samme RTT som ping ga oss.",
  },
  {
    nr: 5,
    tid: "0.044",
    kilde: "192.168.1.10",
    maal: "195.88.55.16",
    protokoll: "TCP",
    info: "ACK",
    detalj: "Du bekrefter. Nå er TCP-tilkoblingen oppe.",
  },
  {
    nr: 6,
    tid: "0.045",
    kilde: "192.168.1.10",
    maal: "195.88.55.16",
    protokoll: "TLS",
    info: "Client Hello",
    detalj: "Krypteringen starter. Du sier hvilke krypteringsmåter du støtter.",
  },
  {
    nr: 7,
    tid: "0.075",
    kilde: "195.88.55.16",
    maal: "192.168.1.10",
    protokoll: "TLS",
    info: "Server Hello + sertifikat",
    detalj: "Serveren velger algoritme og sender sertifikatet sitt. Dette er at du kan stole på at det FAKTISK er vg.no.",
  },
  {
    nr: 8,
    tid: "0.140",
    kilde: "192.168.1.10",
    maal: "195.88.55.16",
    protokoll: "HTTP",
    info: "GET / HTTP/2 (KRYPTERT)",
    detalj: "Nå kommer den faktiske 'gi meg forsiden'-forespørselen. Den er nå inni TLS-kryptering, så Wireshark ser bare et tilfeldig bytemønster.",
  },
  {
    nr: 9,
    tid: "0.270",
    kilde: "195.88.55.16",
    maal: "192.168.1.10",
    protokoll: "HTTP",
    info: "200 OK (KRYPTERT, 95 KB)",
    detalj: "Forsida er på vei. 95KB med HTML, kommer i mange fragmenter.",
  },
];

/**
 * F-09 Wireshark, ping og traceroute.
 * Tre seksjoner med mock-output: ping (linje-for-linje animasjon),
 * traceroute (hopp-for-hopp), Wireshark (klikkbar pakke-liste).
 */
export function F09WiresharkPing() {
  return (
    <StackPageShell title="Forkurs · F-09" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <Crumbs />
        <Header />
        <SubjectWhy />
        <SectionTitle id="ping" nr="1" tittel="ping — er den der?" />
        <PingSim />
        <SectionTitle id="trace" nr="2" tittel="traceroute — hvilken vei tok pakken?" />
        <TraceSim />
        <SectionTitle id="ws" nr="3" tittel="Wireshark — alle pakker, alle detaljer" />
        <WiresharkSim />
        <SectionTitle id="sniffing" nr="4" tittel="Hvorfor du bør gyse av åpen wifi" />
        <SniffingAdvarsel />
        <SectionTitle id="drill" nr="5" tittel="Sjekk forståelsen" />
        <Drill />
        <SectionTitle id="neste" nr="6" tittel="Neste steg" />
        <NesteSteg />
      </article>
    </StackPageShell>
  );
}

function Crumbs() {
  return (
    <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
      <Link to="/forkurs" className="hover:text-foreground">Forkurs</Link>
      <span>/</span>
      <span>F3 · Nettverksintuisjon</span>
      <span>/</span>
      <span className="text-foreground">F-09 Wireshark, ping, traceroute</span>
    </div>
  );
}

function Header() {
  return (
    <header className="mb-8">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        Forkurs · Fase F3 · Nettverksintuisjon
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
        Verktøy for å SE trafikken: ping, traceroute, Wireshark
      </h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        Til nå har vi snakket om at trafikken «går ut» og «kommer tilbake». Det er på tide å se den. Tre verktøy gir tre nivåer av detalj — fra «er det noen hjemme?» til «vis meg hver eneste byte». Her er mock-er du kan klikke på; i den ekte VM-en din (fra F-02) kjører du dem på ekte mål.
      </p>
    </header>
  );
}

function SubjectWhy() {
  return (
    <div className="mb-10 rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
      <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm mb-2">
        <Server className="h-4 w-4" /> Hvorfor for DTE-2507 (Datakomm)
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Wireshark er den primære eksperimentmaskinen for Kurose-pensumet — du dissekerer TCP-handshakes, DNS-svar og HTTP-headere med den. Ping/traceroute lærer deg å feilsøke når noe ikke når frem. Sniffing-bevisstheten her bygger også broa til <code className="text-brand">SEC-10</code> i sikkerhetsmodulen.
      </p>
    </div>
  );
}

function SectionTitle({ id, nr, tittel }: { id: string; nr: string; tittel: string }) {
  return (
    <h2 id={id} className="mt-12 mb-4 text-xl font-semibold scroll-mt-20 flex items-baseline gap-3">
      <span className="text-brand text-base font-mono">{nr}.</span>
      {tittel}
    </h2>
  );
}

function PingSim() {
  const [linjer, setLinjer] = useState<PingLinje[]>([]);
  const [kjorer, setKjorer] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const kjor = () => {
    setLinjer([]);
    setKjorer(true);
    let i = 0;
    const step = () => {
      setLinjer((prev) => [...prev, PING_LINJER[i]]);
      i++;
      if (i < PING_LINJER.length) {
        timeoutRef.current = setTimeout(step, i <= 5 ? 600 : 250);
      } else {
        setKjorer(false);
      }
    };
    step();
  };

  return (
    <div className="my-6">
      <p className="text-sm leading-relaxed mb-4">
        <code className="text-brand">ping</code> sender en bitteliten pakke til en maskin og måler hvor lang tid det tar før svaret kommer tilbake. Hvis det kommer noe svar i det hele tatt, vet du at maskinen er nådd. Tida (i ms) er <strong>latensen</strong>.
      </p>
      <div className="rounded-xl border border-border bg-card/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-mono text-muted-foreground">$ ping vg.no</div>
          <button
            onClick={kjor}
            disabled={kjorer}
            className="rounded-md border border-brand/40 bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/20 disabled:opacity-50 flex items-center gap-1"
          >
            <Play className="h-3 w-3" />
            {kjorer ? "Pinger..." : linjer.length ? "Kjør igjen" : "Kjør ping"}
          </button>
        </div>
        <div className="rounded-md border border-border bg-background p-3 font-mono text-[11px] leading-relaxed text-foreground min-h-[180px]">
          {linjer.length === 0 && (
            <div className="text-muted-foreground italic">Trykk «Kjør ping» for å starte.</div>
          )}
          {linjer.map((l, i) => (
            <div key={i} className={(l ?? "").startsWith("64 bytes") ? "text-green-300" : ""}>
              {l || " "}
            </div>
          ))}
          {kjorer && <span className="animate-pulse text-brand">▋</span>}
        </div>
      </div>
      <div className="mt-3 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground space-y-1.5">
        <div className="flex items-start gap-2">
          <Clock className="h-3 w-3 text-brand mt-0.5 shrink-0" />
          <div><strong className="text-foreground">time=24.3 ms</strong> — det tok 24 millisekunder fra pakka forlot deg til svaret var tilbake. Tur-retur.</div>
        </div>
        <div className="flex items-start gap-2">
          <Signal className="h-3 w-3 text-brand mt-0.5 shrink-0" />
          <div><strong className="text-foreground">0% packet loss</strong> — alle 4 pakker kom frem. Hvis det er &gt; 0%, har du et problem.</div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="h-3 w-3 text-brand mt-0.5 shrink-0" />
          <div><strong className="text-foreground">ttl=54</strong> — «time to live», en teller som indikerer hvor mange hopp pakka har vært gjennom. Vi kommer tilbake til denne i traceroute.</div>
        </div>
      </div>
    </div>
  );
}

function TraceSim() {
  const [vist, setVist] = useState<number>(0);
  const [kjorer, setKjorer] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const kjor = () => {
    setVist(0);
    setKjorer(true);
    let i = 0;
    const step = () => {
      i++;
      setVist(i);
      if (i < TRACERT_HOPP.length) {
        timeoutRef.current = setTimeout(step, 500);
      } else {
        setKjorer(false);
      }
    };
    step();
  };

  return (
    <div className="my-6">
      <p className="text-sm leading-relaxed mb-4">
        Mellom deg og vg.no er det ikke én lang ledning. Det er en kjede av <strong>routere</strong> som videresender pakka. <code className="text-brand">traceroute</code> avslører hver eneste stopp.
      </p>
      <div className="rounded-xl border border-border bg-card/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-mono text-muted-foreground">$ traceroute vg.no</div>
          <button
            onClick={kjor}
            disabled={kjorer}
            className="rounded-md border border-brand/40 bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/20 disabled:opacity-50 flex items-center gap-1"
          >
            <Play className="h-3 w-3" />
            {kjorer ? "Sporer..." : vist ? "Kjør igjen" : "Kjør traceroute"}
          </button>
        </div>
        <div className="rounded-md border border-border bg-background p-3 font-mono text-[11px] leading-relaxed min-h-[260px]">
          {vist === 0 && (
            <div className="text-muted-foreground italic">Trykk «Kjør traceroute» for å starte.</div>
          )}
          {TRACERT_HOPP.slice(0, vist).map((h) => {
            const erMaal = h.nr === TRACERT_HOPP.length;
            return (
              <div key={h.nr} className={erMaal ? "text-green-300" : "text-foreground"}>
                <span className="text-brand inline-block w-6 text-right">{h.nr}</span>{" "}
                <span className="text-muted-foreground">{h.ip.padEnd(16)}</span>{" "}
                <span>{h.navn.padEnd(28)}</span>{" "}
                <span className="text-muted-foreground">{h.rtt}</span>
              </div>
            );
          })}
          {kjorer && <span className="animate-pulse text-brand">▋</span>}
        </div>
      </div>
      <div className="mt-3 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground">
        Pakka di gikk gjennom 8 maskiner for å nå Oslo fra Tromsø. Hver av dem er en <strong>router</strong> som leste «hva er adressen?» og sa «da må du videre den veien». RTT-tida øker for hvert hopp fordi pakka må fysisk lengre — du ser geografien i tallene.
      </div>
    </div>
  );
}

function WiresharkSim() {
  const [valgt, setValgt] = useState<number | null>(null);
  const aktiv = WS_PAKKER.find((p) => p.nr === valgt);
  return (
    <div className="my-6">
      <p className="text-sm leading-relaxed mb-4">
        Wireshark er som et røntgenapparat for nettverket. Det fanger HVER ENESTE pakke som passerer nettverkskortet ditt — og lar deg åpne dem og se hva som sto i dem. Her er en mock av hva du ser når du laster vg.no. Klikk på en pakke for å se detaljene.
      </p>
      <div className="rounded-xl border border-border bg-card/30 p-4 space-y-3">
        {/* Pakke-liste */}
        <div className="rounded-md border border-border bg-background overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-3 py-1.5 bg-muted/30 text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
            <div className="col-span-1">#</div>
            <div className="col-span-1">Tid</div>
            <div className="col-span-3">Kilde</div>
            <div className="col-span-3">Mål</div>
            <div className="col-span-1">Prot</div>
            <div className="col-span-3">Info</div>
          </div>
          {WS_PAKKER.map((p) => {
            const er = valgt === p.nr;
            const protKlass = {
              TCP: "text-blue-300",
              DNS: "text-purple-300",
              HTTP: "text-green-300",
              TLS: "text-orange-300",
            }[p.protokoll];
            return (
              <button
                key={p.nr}
                onClick={() => setValgt(p.nr)}
                className={`grid grid-cols-12 gap-2 px-3 py-1.5 text-[11px] font-mono text-left w-full border-b border-border last:border-b-0 ${
                  er ? "bg-brand/20" : "hover:bg-muted/30"
                }`}
              >
                <div className="col-span-1 text-muted-foreground">{p.nr}</div>
                <div className="col-span-1 text-muted-foreground">{p.tid}</div>
                <div className="col-span-3 text-foreground truncate">{p.kilde}</div>
                <div className="col-span-3 text-foreground truncate">{p.maal}</div>
                <div className={`col-span-1 font-semibold ${protKlass}`}>{p.protokoll}</div>
                <div className="col-span-3 text-muted-foreground truncate">{p.info}</div>
              </button>
            );
          })}
        </div>
        {/* Detalj */}
        {aktiv ? (
          <div className="rounded-md border border-brand/30 bg-brand/5 p-3">
            <div className="text-xs font-semibold mb-1">
              Pakke {aktiv.nr} · {aktiv.protokoll} · {aktiv.info}
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed mb-3">{aktiv.detalj}</div>
            <div className="rounded border border-border bg-background p-2 font-mono text-[10px] leading-tight space-y-0.5">
              <div className="text-muted-foreground">▸ Frame: 78 bytes on wire</div>
              <div className="text-muted-foreground">▸ Ethernet II</div>
              <div className="text-muted-foreground">▾ Internet Protocol</div>
              <div className="pl-3 text-foreground">Source: {aktiv.kilde}</div>
              <div className="pl-3 text-foreground">Destination: {aktiv.maal}</div>
              <div className="text-muted-foreground">▾ {aktiv.protokoll}</div>
              <div className="pl-3 text-foreground">{aktiv.info}</div>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground italic text-center">
            Klikk på en pakke over for å se detaljer.
          </div>
        )}
      </div>
      <div className="mt-3 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground flex items-start gap-2">
        <Eye className="h-3 w-3 text-brand mt-0.5 shrink-0" />
        <div>
          Legg merke til pakkene 3-5: TCP-handshake (SYN, SYN-ACK, ACK). Det er den «hilsen» som F-07 nevnte. Pakkene 6-7 starter TLS-kryptering. Etter det blir resten kryptert — Wireshark ser BYTES, men ikke innholdet.
        </div>
      </div>
    </div>
  );
}

function SniffingAdvarsel() {
  return (
    <div className="my-6 rounded-lg border border-red-500/40 bg-red-500/5 p-5">
      <div className="flex items-center gap-2 text-red-300 font-semibold text-sm mb-3">
        <Shield className="h-4 w-4" /> Praktisk konsekvens
      </div>
      <p className="text-sm leading-relaxed mb-3">
        Wireshark ser HVA SOM HELST som passerer nettverkskortet ditt. På et åpent wifi-nett (kafé, hotell, flyplass) kan en annen person sette nettverkskortet sitt i <em>promiscuous mode</em> — og se ALT som flyr forbi, inkludert dine pakker.
      </p>
      <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-5">
        <li>Hvis du logger inn på en side med <strong>HTTP</strong> (port 80), kan brukernavn og passord leses som klartekst av en sniffer.</li>
        <li>Hvis du bruker <strong>HTTPS</strong> (port 443), er innholdet kryptert — snifferen ser bare at du snakket med en server, ikke hva du sa.</li>
        <li>DNS-spørringer var lenge ukrypterte: en sniffer kunne se HVILKE sider du besøkte (men ikke innholdet). Moderne «DNS over HTTPS» fikser dette.</li>
      </ul>
      <div className="mt-3 text-xs text-muted-foreground">
        Når du i SEC-10 (sikkerhets-modulen) ser «MITM» og «sniffing», er det dette du tenker tilbake til.
      </div>
    </div>
  );
}

function Drill() {
  const sporsmal: { q: string; valg: string[]; riktig: number; forklaring: string }[] = [
    {
      q: "Hva er det ping faktisk MÅLER?",
      valg: [
        "Båndbredden mellom deg og mål-maskinen",
        "Tur-retur-tida (RTT) for en liten pakke",
        "Hvor mange routere som er mellom deg og målet",
      ],
      riktig: 1,
      forklaring: "ping = RTT (round-trip time). Hvor lang tid det tar fra pakka forlot deg til svaret var tilbake. Båndbredde måler du med andre verktøy (iperf). Hopp-antall får du med traceroute.",
    },
    {
      q: "Hvorfor viser traceroute så mange stopp mellom deg og vg.no?",
      valg: [
        "Fordi pakka tar feil vei og må prøve flere ruter",
        "Fordi Internett er en kjede av routere — hver pakke videresendes router-til-router",
        "Fordi vg.no har mange servere som svarer i tur",
      ],
      riktig: 1,
      forklaring: "Internett er bokstavelig talt sammenkoblede routere. Hver pakke leveres hopp for hopp. Ingen ledning går rett fra deg til vg.no — det er ~8 mellomliggende maskiner som videresender.",
    },
    {
      q: "Hvorfor er det farlig å logge inn på en HTTP-side via åpent kafé-wifi?",
      valg: [
        "Datamaskinen din kan bli infisert av virus over wifi",
        "En annen kunde med Wireshark kan se brukernavn/passord i klartekst",
        "Wifi-en lader telefonen din raskere og slipper data",
      ],
      riktig: 1,
      forklaring: "HTTP er ukryptert. Alle pakker som passerer wifi-en kan «høres» av et nettverkskort i promiscuous mode. HTTPS løser dette ved å kryptere innholdet, men HTTP gjør det ikke. Lukket nettverk hjelper ikke — andre på samme nett kan se trafikken.",
    },
  ];
  return (
    <div className="my-6 space-y-4">
      {sporsmal.map((s, i) => (
        <Quiz key={i} {...s} nr={i + 1} />
      ))}
    </div>
  );
}

function Quiz({
  nr,
  q,
  valg,
  riktig,
  forklaring,
}: {
  nr: number;
  q: string;
  valg: string[];
  riktig: number;
  forklaring: string;
}) {
  const [valgt, setValgt] = useState<number | null>(null);
  return (
    <div className="rounded-lg border border-border bg-card/30 p-4">
      <div className="text-sm font-medium mb-3">
        <span className="text-brand mr-2">Sjekk {nr}.</span>
        {q}
      </div>
      <div className="space-y-1.5">
        {valg.map((v, i) => {
          const erValgt = valgt === i;
          const erRiktig = i === riktig;
          const visStatus = valgt !== null && erValgt;
          const klass = visStatus
            ? erRiktig
              ? "border-green-500/40 bg-green-500/10 text-green-200"
              : "border-red-500/40 bg-red-500/10 text-red-200"
            : "border-border bg-background hover:bg-muted/40";
          return (
            <button
              key={i}
              onClick={() => setValgt(i)}
              disabled={valgt !== null}
              className={`block w-full text-left rounded-md border px-3 py-2 text-xs ${klass} disabled:cursor-default`}
            >
              {v}
            </button>
          );
        })}
      </div>
      {valgt !== null && (
        <div className="mt-3 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground">
          {valgt === riktig ? (
            <span className="text-green-300 font-semibold">Riktig. </span>
          ) : (
            <span className="text-red-300 font-semibold">Ikke helt. </span>
          )}
          {forklaring}
        </div>
      )}
    </div>
  );
}

function NesteSteg() {
  return (
    <div className="my-6 rounded-lg border border-border bg-card/30 p-5">
      <p className="text-sm leading-relaxed mb-4">
        Du har nå den fulle stack-en: hva en VM er (F-01), hvordan du leser tekst-output (F-04), hva som skjer når du åpner en nettside (F-07), hvordan adressering fungerer (F-08), og hvordan du SER trafikken (F-09). Forkurs-sporet er ferdig — nå er du klar for Kurose kap. 1.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          to="/forkurs"
          className="group rounded-md border border-brand/30 bg-brand/5 p-4 hover:bg-brand/10 transition"
        >
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            <BookOpen className="h-3 w-3 inline mr-1" /> Oversikt
          </div>
          <div className="font-medium text-sm flex items-center gap-2">
            Tilbake til forkurs-løypen
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
        <Link
          to="/forkurs/$slug"
          params={{ slug: "f08-ip-port" }}
          className="group rounded-md border border-border bg-background p-4 hover:bg-muted/40 transition"
        >
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Forrige · F-08
          </div>
          <div className="font-medium text-sm flex items-center gap-2">
            IP-adresse og port
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
      </div>
      <div className="mt-4 text-xs text-muted-foreground flex items-start gap-2">
        <MapPin className="h-3 w-3 mt-0.5 text-brand" />
        <span>
          Denne biten åpner opp for: <code className="text-brand">DK-23</code> (Kurose-prosjekter
          med Wireshark), <code className="text-brand">SEC-10</code> (sniffing/MITM-angrep) og bro
          til <code className="text-brand">F-02</code> der du gjør disse kommandoene i ekte VM.
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-purple-300/80">
        <Wifi className="h-3 w-3" />
        Husk: i den ekte VM-en din er <code className="text-brand">ping</code> og <code className="text-brand">traceroute</code> innebygget. Wireshark må installeres med <code className="text-brand">sudo apt install wireshark</code>.
      </div>
    </div>
  );
}
