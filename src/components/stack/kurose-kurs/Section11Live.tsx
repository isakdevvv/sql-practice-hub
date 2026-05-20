import { useEffect, useMemo, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react";

// Levende versjon av seksjon 1.1: nettverks-diagram + animert «hva skjer
// når du åpner vg.no?»-walkthrough. Erstatter den statiske SVG-en og det
// tekst-baserte eksemplet i den opprinnelige Section11.

type NodeId =
  | "mobil"
  | "homeRouter"
  | "accessIsp"
  | "ispDns"
  | "tier1"
  | "vgIsp"
  | "vgServer"
  | "rootDns"
  | "tldDns"
  | "authDns";

type Node = {
  id: NodeId;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  kind: "host" | "router" | "server" | "dns";
};

const NODES: Node[] = [
  { id: "mobil", label: "Din mobil", sublabel: "host", x: 60, y: 200, kind: "host" },
  { id: "homeRouter", label: "Hjemme-ruter", x: 170, y: 200, kind: "router" },
  { id: "accessIsp", label: "Aksess-ISP", sublabel: "Altibox", x: 290, y: 200, kind: "router" },
  { id: "ispDns", label: "DNS-server", sublabel: "ISP recursive", x: 290, y: 90, kind: "dns" },
  { id: "tier1", label: "Tier-1 backbone", x: 440, y: 200, kind: "router" },
  { id: "rootDns", label: "Root DNS", sublabel: ".", x: 440, y: 60, kind: "dns" },
  { id: "tldDns", label: "TLD DNS", sublabel: ".no", x: 560, y: 60, kind: "dns" },
  { id: "authDns", label: "Authoritative", sublabel: "ns.vg.no", x: 700, y: 60, kind: "dns" },
  { id: "vgIsp", label: "VG sin ISP", x: 580, y: 200, kind: "router" },
  { id: "vgServer", label: "VG-server", sublabel: "vg.no", x: 700, y: 200, kind: "server" },
];

const EDGES: [NodeId, NodeId][] = [
  ["mobil", "homeRouter"],
  ["homeRouter", "accessIsp"],
  ["accessIsp", "ispDns"],
  ["accessIsp", "tier1"],
  ["tier1", "vgIsp"],
  ["vgIsp", "vgServer"],
  ["tier1", "rootDns"],
  ["tier1", "tldDns"],
  ["tier1", "authDns"],
];

type Step = {
  title: string;
  description: string;
  /** Path som pakken animeres langs (node-IDer). */
  path: NodeId[];
  /** Farge på pakken — DNS lilla, TCP/TLS oransje/cyan, HTTP brand, DHCP gul, ARP grå, FIN rød. */
  color: "dns" | "tcp" | "tls" | "http" | "data" | "dhcp" | "arp" | "fin";
  /** Hvilke definisjoner som er relevante — for fremheving senere. */
  relatedTerms: string[];
};

const STEPS: Step[] = [
  // -------- DHCP: få en IP-adresse fra nettet --------
  {
    title: "1. DHCP Discover (broadcast)",
    description:
      "Mobilen har nettopp koblet seg til WiFi-en og har ingen IP. Den sender en broadcast («til alle på nettet») som spør «er det en DHCP-server her som kan gi meg konfigurasjon?»",
    path: ["mobil", "homeRouter"],
    color: "dhcp",
    relatedTerms: ["Host (også: end-system)"],
  },
  {
    title: "2. DHCP Offer",
    description:
      "Hjemme-ruteren (som også er DHCP-server) tilbyr en IP, gateway, og DNS-server. F.eks. «du får 192.168.1.42, gateway er meg, DNS er 192.168.1.1».",
    path: ["homeRouter", "mobil"],
    color: "dhcp",
    relatedTerms: ["Ruter"],
  },
  {
    title: "3. DHCP Request",
    description:
      "Mobilen ber formelt om tilbudet. (Hvis flere DHCP-servere finnes, velger den én og avslår de andre.)",
    path: ["mobil", "homeRouter"],
    color: "dhcp",
    relatedTerms: ["Protokoll"],
  },
  {
    title: "4. DHCP Ack",
    description:
      "Hjemme-ruteren bekrefter tildelingen. Nå har mobilen en gyldig IP og vet hvem default gateway er.",
    path: ["homeRouter", "mobil"],
    color: "dhcp",
    relatedTerms: ["Protokoll"],
  },

  // -------- ARP: finn MAC-adressen til gateway --------
  {
    title: "5. ARP Request (broadcast)",
    description:
      "Mobilen vet IP-en til hjemme-ruteren (gateway), men ikke MAC-adressen. Den må vite MAC-en for å sende én eneste ramme på lokalnettet. Den sender en ARP-broadcast: «hvem har 192.168.1.1?»",
    path: ["mobil", "homeRouter"],
    color: "arp",
    relatedTerms: ["Lenke"],
  },
  {
    title: "6. ARP Reply",
    description:
      "Hjemme-ruteren svarer unicast tilbake til mobilen: «jeg har 192.168.1.1, og MAC-en min er aa:bb:cc:11:22:33». Mobilen cacher dette i ARP-tabellen for noen minutter.",
    path: ["homeRouter", "mobil"],
    color: "arp",
    relatedTerms: ["Lenke"],
  },

  // -------- DNS: oversett vg.no til IP via rekursiv oppslag --------
  {
    title: "7. DNS-spørring til ISP-DNS",
    description:
      "Mobilen sender en rekursiv DNS-spørring til ISP-en sin DNS-server: «hva er IP-en til vg.no?»",
    path: ["mobil", "homeRouter", "accessIsp", "ispDns"],
    color: "dns",
    relatedTerms: ["ISP (Internet Service Provider)", "Protokoll"],
  },
  {
    title: "8. ISP-DNS spør root-serveren",
    description:
      "ISP-en sin DNS har ikke vg.no i cache. Den spør først én av de 13 root-DNS-serverne: «hvem håndterer .no?»",
    path: ["ispDns", "accessIsp", "tier1", "rootDns"],
    color: "dns",
    relatedTerms: ["ISP (Internet Service Provider)"],
  },
  {
    title: "9. Root svarer: «spør TLD-en .no»",
    description:
      "Root-serveren peker videre: «.no TLD-en svarer på det, spør dem». ISP-DNS holder igjen, klar til å spørre TLD.",
    path: ["rootDns", "tier1", "ispDns"],
    color: "dns",
    relatedTerms: ["IETF og RFC"],
  },
  {
    title: "10. ISP-DNS spør TLD (.no)",
    description:
      "ISP-DNS spør .no-TLD-serveren: «hvem håndterer vg.no?»",
    path: ["ispDns", "accessIsp", "tier1", "tldDns"],
    color: "dns",
    relatedTerms: ["IETF og RFC"],
  },
  {
    title: "11. TLD svarer: «spør ns.vg.no»",
    description:
      "TLD peker til vg.no sin authoritative DNS-server (eid av VG selv eller deres leverandør).",
    path: ["tldDns", "tier1", "ispDns"],
    color: "dns",
    relatedTerms: ["IETF og RFC"],
  },
  {
    title: "12. ISP-DNS spør authoritative",
    description:
      "ISP-DNS spør endelig den authoritative serveren: «hva er IP-en til vg.no?»",
    path: ["ispDns", "accessIsp", "tier1", "authDns"],
    color: "dns",
    relatedTerms: ["Protokoll"],
  },
  {
    title: "13. Authoritative svarer med IP",
    description:
      "vg.no sin DNS-server svarer: «vg.no er 195.88.55.16». ISP-DNS cacher svaret en stund (TTL) så neste bruker slipper hele runden.",
    path: ["authDns", "tier1", "ispDns"],
    color: "dns",
    relatedTerms: ["Protokoll"],
  },
  {
    title: "14. DNS-svaret videresendes til mobilen",
    description:
      "ISP-DNS sender det endelige svaret tilbake til mobilen. Hele DNS-leddet kunne ta 50–200 ms hvis ikke cached.",
    path: ["ispDns", "accessIsp", "homeRouter", "mobil"],
    color: "dns",
    relatedTerms: ["Host (også: end-system)"],
  },

  // -------- TCP 3-veis handshake --------
  {
    title: "15. TCP-handshake: SYN",
    description:
      "Mobilen åpner en TCP-forbindelse til vg.no på port 443. Første pakke er en SYN («synchronize») som ber om å starte en samtale.",
    path: ["mobil", "homeRouter", "accessIsp", "tier1", "vgIsp", "vgServer"],
    color: "tcp",
    relatedTerms: ["Ruter", "Protokoll"],
  },
  {
    title: "16. TCP-handshake: SYN-ACK",
    description:
      "Serveren bekrefter SYN-en og sender sin egen SYN tilbake. Én pakke som bærer to flagg samtidig.",
    path: ["vgServer", "vgIsp", "tier1", "accessIsp", "homeRouter", "mobil"],
    color: "tcp",
    relatedTerms: ["Protokoll", "Ruter"],
  },
  {
    title: "17. TCP-handshake: ACK",
    description:
      "Mobilen sender en ren ACK. Nå er TCP-forbindelsen etablert begge veier — begge parter har bekreftet at den andre er der.",
    path: ["mobil", "homeRouter", "accessIsp", "tier1", "vgIsp", "vgServer"],
    color: "tcp",
    relatedTerms: ["Protokoll"],
  },

  // -------- TLS handshake (i tre deler) --------
  {
    title: "18. TLS ClientHello",
    description:
      "Mobilen starter krypteringen ved å sende en ClientHello: liste over støttede chiffer, en tilfeldig nonce, og evt. SNI («vg.no»).",
    path: ["mobil", "homeRouter", "accessIsp", "tier1", "vgIsp", "vgServer"],
    color: "tls",
    relatedTerms: ["Protokoll", "IETF og RFC"],
  },
  {
    title: "19. TLS ServerHello + sertifikat",
    description:
      "Serveren velger ett chiffer, sender sin egen nonce, og inkluderer X.509-sertifikatet (signert av en CA mobilen stoler på).",
    path: ["vgServer", "vgIsp", "tier1", "accessIsp", "homeRouter", "mobil"],
    color: "tls",
    relatedTerms: ["Protokoll"],
  },
  {
    title: "20. TLS Key Exchange + Finished",
    description:
      "Mobilen verifiserer sertifikatet, generer en master-nøkkel, og sender en kryptert «Finished». Nå har begge en delt nøkkel — TLS er klar.",
    path: ["mobil", "homeRouter", "accessIsp", "tier1", "vgIsp", "vgServer"],
    color: "tls",
    relatedTerms: ["Protokoll"],
  },

  // -------- HTTP request / response --------
  {
    title: "21. HTTP GET /",
    description:
      "Endelig sender mobilen en HTTP-request: «GET / HTTP/2». Krypterte over TLS-tunnelen.",
    path: ["mobil", "homeRouter", "accessIsp", "tier1", "vgIsp", "vgServer"],
    color: "http",
    relatedTerms: ["Protokoll", "Ruter"],
  },
  {
    title: "22. Serveren svarer med HTML",
    description:
      "Serveren returnerer forsidens HTML. Mobilen begynner å parse, og oppdager raskt at den trenger flere ressurser.",
    path: ["vgServer", "vgIsp", "tier1", "accessIsp", "homeRouter", "mobil"],
    color: "data",
    relatedTerms: ["Host (også: end-system)", "Lenke"],
  },
  {
    title: "23. Last resten av siden (60+ GET-er parallelt)",
    description:
      "HTML refererer 60+ andre filer — CSS, JavaScript, bilder, font-er. Mobilen åpner flere TCP-forbindelser (eller multiplexer over HTTP/2) og henter alt parallelt.",
    path: ["mobil", "homeRouter", "accessIsp", "tier1", "vgIsp", "vgServer"],
    color: "http",
    relatedTerms: ["Protokoll", "Distribuert applikasjon"],
  },

  // -------- TCP teardown --------
  {
    title: "24. TCP FIN",
    description:
      "Når siden er ferdig lastet, sender mobilen et FIN-flagg som signaliserer «ingen flere data fra meg». TCP-forbindelser lukkes uavhengig i hver retning.",
    path: ["mobil", "homeRouter", "accessIsp", "tier1", "vgIsp", "vgServer"],
    color: "fin",
    relatedTerms: ["Protokoll"],
  },
  {
    title: "25. TCP FIN-ACK + close",
    description:
      "Serveren bekrefter FIN-en og sender sin egen FIN. Mobilen ACK-er. Forbindelsen er nå helt lukket. (I praksis holdes ofte HTTP/2-forbindelser åpne en stund for gjenbruk.)",
    path: ["vgServer", "vgIsp", "tier1", "accessIsp", "homeRouter", "mobil"],
    color: "fin",
    relatedTerms: ["Protokoll"],
  },
];

const COLOR_CLASS: Record<Step["color"], string> = {
  dns: "fill-purple-500",
  tcp: "fill-amber-500",
  tls: "fill-cyan-500",
  http: "fill-brand",
  data: "fill-success",
  dhcp: "fill-yellow-500",
  arp: "fill-slate-500",
  fin: "fill-red-500",
};
const COLOR_LABEL: Record<Step["color"], string> = {
  dns: "DNS",
  tcp: "TCP",
  tls: "TLS",
  http: "HTTP",
  data: "HTML",
  dhcp: "DHCP",
  arp: "ARP",
  fin: "FIN",
};
// bg-* varianter for legend-prikker (<span>). fill-* virker kun i SVG.
const BG_CLASS: Record<Step["color"], string> = {
  dns: "bg-purple-500",
  tcp: "bg-amber-500",
  tls: "bg-cyan-500",
  http: "bg-brand",
  data: "bg-success",
  dhcp: "bg-yellow-500",
  arp: "bg-slate-500",
  fin: "bg-red-500",
};

export function Section11Live() {
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pktProgress, setPktProgress] = useState(0); // 0..1 within current step's path

  const step = STEPS[stepIdx];

  // Animasjons-loop
  useEffect(() => {
    if (!playing) return;
    let raf: number;
    let last = performance.now();
    const SPEED = 1 / 2200; // ~2.2 sek per steg
    function tick(now: number) {
      const dt = now - last;
      last = now;
      setPktProgress((p) => {
        const next = p + dt * SPEED;
        if (next >= 1) {
          // gå til neste steg, eller stopp
          setStepIdx((i) => {
            if (i + 1 >= STEPS.length) {
              setPlaying(false);
              return i;
            }
            return i + 1;
          });
          return 0;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  function nextStep() {
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
    setPktProgress(0);
  }
  function prevStep() {
    setStepIdx((i) => Math.max(0, i - 1));
    setPktProgress(0);
  }
  function reset() {
    setStepIdx(0);
    setPktProgress(0);
    setPlaying(false);
  }

  // Beregn pakke-posisjon ut fra path og progress
  const packetPos = useMemo(() => packetPosition(step.path, pktProgress), [step, pktProgress]);
  const activeEdges = useMemo(() => pathToEdges(step.path), [step]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">{step.title}</span>
        <span className="ml-auto font-mono">
          Steg {stepIdx + 1} / {STEPS.length}
        </span>
      </div>

      <svg viewBox="0 0 780 280" className="w-full h-auto bg-muted/10">
        {/* Edges */}
        {EDGES.map(([a, b], i) => {
          const na = NODES.find((n) => n.id === a)!;
          const nb = NODES.find((n) => n.id === b)!;
          const isActive = activeEdges.some(
            ([x, y]) => (x === a && y === b) || (x === b && y === a),
          );
          return (
            <line
              key={i}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              className={isActive ? "stroke-foreground/70" : "stroke-muted-foreground/30"}
              strokeWidth={isActive ? 2 : 1.5}
            />
          );
        })}

        {/* Cloud-shape som indikerer Tier-1 backbone */}
        <ellipse
          cx={440}
          cy={200}
          rx={50}
          ry={28}
          className="fill-brand/5 stroke-brand/30"
          strokeWidth={1.5}
          strokeDasharray="3 2"
        />

        {/* Nodes */}
        {NODES.map((n) => (
          <NodeShape key={n.id} node={n} />
        ))}

        {/* Animert pakke */}
        {packetPos && (
          <g>
            <circle
              cx={packetPos.x}
              cy={packetPos.y}
              r={10}
              className={`${COLOR_CLASS[step.color]} stroke-background`}
              strokeWidth={2}
            />
            <text
              x={packetPos.x}
              y={packetPos.y + 3}
              textAnchor="middle"
              className="fill-background text-[8px] font-semibold pointer-events-none"
            >
              {COLOR_LABEL[step.color]}
            </text>
          </g>
        )}
      </svg>

      <div className="px-4 py-3 text-sm text-muted-foreground border-t border-border">
        {step.description}
      </div>

      {/* Controls */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-1.5 border-t border-border bg-muted/20">
        <button
          onClick={prevStep}
          disabled={stepIdx === 0}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
        >
          <SkipBack className="h-3 w-3" /> Forrige
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing
            ? "Pause"
            : stepIdx === STEPS.length - 1 && pktProgress >= 0.99
              ? "Spill av igjen"
              : "Spill av"}
        </button>
        <button
          onClick={nextStep}
          disabled={stepIdx === STEPS.length - 1}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
        >
          Neste <SkipForward className="h-3 w-3" />
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 ml-auto"
        >
          <RotateCcw className="h-3 w-3" />
        </button>

        {/* Steg-prikker */}
        <div className="ml-2 flex gap-1">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setStepIdx(i);
                setPktProgress(0);
              }}
              className={`h-1.5 w-4 rounded-full ${
                i === stepIdx ? "bg-brand" : i < stepIdx ? "bg-brand/40" : "bg-muted-foreground/20"
              }`}
              aria-label={`Gå til steg ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <LegendDot color="dhcp" /> DHCP
        <LegendDot color="arp" /> ARP
        <LegendDot color="dns" /> DNS
        <LegendDot color="tcp" /> TCP
        <LegendDot color="tls" /> TLS
        <LegendDot color="http" /> HTTP
        <LegendDot color="data" /> HTML
        <LegendDot color="fin" /> FIN
      </div>
    </div>
  );
}

function NodeShape({ node }: { node: Node }) {
  if (node.kind === "host") {
    return (
      <g>
        <rect
          x={node.x - 14}
          y={node.y - 22}
          width={28}
          height={44}
          rx={4}
          className="fill-card stroke-amber-500"
          strokeWidth={2}
        />
        <rect
          x={node.x - 9}
          y={node.y - 17}
          width={18}
          height={24}
          rx={2}
          className="fill-muted-foreground/20"
        />
        <text
          x={node.x}
          y={node.y + 38}
          textAnchor="middle"
          className="fill-foreground text-[10px] font-semibold"
        >
          {node.label}
        </text>
        {node.sublabel && (
          <text
            x={node.x}
            y={node.y + 50}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {node.sublabel}
          </text>
        )}
      </g>
    );
  }
  if (node.kind === "server") {
    return (
      <g>
        <rect
          x={node.x - 18}
          y={node.y - 22}
          width={36}
          height={44}
          rx={3}
          className="fill-card stroke-success"
          strokeWidth={2}
        />
        <line
          x1={node.x - 13}
          y1={node.y - 14}
          x2={node.x + 13}
          y2={node.y - 14}
          className="stroke-success/50"
        />
        <line
          x1={node.x - 13}
          y1={node.y - 6}
          x2={node.x + 13}
          y2={node.y - 6}
          className="stroke-success/50"
        />
        <line
          x1={node.x - 13}
          y1={node.y + 2}
          x2={node.x + 13}
          y2={node.y + 2}
          className="stroke-success/50"
        />
        <line
          x1={node.x - 13}
          y1={node.y + 10}
          x2={node.x + 13}
          y2={node.y + 10}
          className="stroke-success/50"
        />
        <text
          x={node.x}
          y={node.y + 38}
          textAnchor="middle"
          className="fill-foreground text-[10px] font-semibold"
        >
          {node.label}
        </text>
        {node.sublabel && (
          <text
            x={node.x}
            y={node.y + 50}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {node.sublabel}
          </text>
        )}
      </g>
    );
  }
  if (node.kind === "dns") {
    return (
      <g>
        <circle
          cx={node.x}
          cy={node.y}
          r={18}
          className="fill-purple-500/10 stroke-purple-500"
          strokeWidth={2}
        />
        <text
          x={node.x}
          y={node.y + 4}
          textAnchor="middle"
          className="fill-purple-700 dark:fill-purple-300 text-[10px] font-bold"
        >
          DNS
        </text>
        <text
          x={node.x}
          y={node.y - 28}
          textAnchor="middle"
          className="fill-foreground text-[10px] font-semibold"
        >
          {node.label}
        </text>
        {node.sublabel && (
          <text
            x={node.x}
            y={node.y - 40}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {node.sublabel}
          </text>
        )}
      </g>
    );
  }
  // Router
  return (
    <g>
      <circle
        cx={node.x}
        cy={node.y}
        r={16}
        className="fill-card stroke-foreground/60"
        strokeWidth={2}
      />
      <text
        x={node.x}
        y={node.y + 4}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-bold"
      >
        R
      </text>
      <text
        x={node.x}
        y={node.y + 34}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        {node.label}
      </text>
      {node.sublabel && (
        <text
          x={node.x}
          y={node.y + 46}
          textAnchor="middle"
          className="fill-muted-foreground text-[9px]"
        >
          {node.sublabel}
        </text>
      )}
    </g>
  );
}

function LegendDot({ color }: { color: Step["color"] }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${BG_CLASS[color]}`} />;
}

function nodeById(id: NodeId): Node | undefined {
  return NODES.find((n) => n.id === id);
}

function pathToEdges(path: NodeId[]): [NodeId, NodeId][] {
  const out: [NodeId, NodeId][] = [];
  for (let i = 0; i < path.length - 1; i++) out.push([path[i], path[i + 1]]);
  return out;
}

function packetPosition(path: NodeId[], progress: number): { x: number; y: number } | null {
  if (path.length < 2) return null;
  const segments = path.length - 1;
  const safeProgress = Number.isFinite(progress) ? Math.min(Math.max(progress, 0), 0.999) : 0;
  const t = safeProgress * segments;
  const segIdx = Math.min(segments - 1, Math.floor(t));
  const segT = t - segIdx;
  const a = nodeById(path[segIdx]);
  const b = nodeById(path[segIdx + 1]);
  if (!a || !b) return null;
  return {
    x: a.x + (b.x - a.x) * segT,
    y: a.y + (b.y - a.y) * segT,
  };
}
