import { useEffect, useMemo, useState } from "react";
import { Lock, FileKey } from "lucide-react";
import { OutcomeRow, Controls } from "./Section82Live";

// Levende versjon av 8.7: IPsec og VPN.
// Vi viser tunnel-modus: to gateways (R_A og R_B) etablerer en kryptert
// tunnel. Hosts (Alice og Bob) bak gateways snakker IKKE IPsec selv.
// Toggle ESP (Encapsulating Security Payload — kryptering+integritet)
// vs AH (Authentication Header — kun integritet, ingen kryptering).
//
// Sentralt: vis hvordan en IPsec-pakke har TO IP-headere:
//   * Indre: host-til-host (Alice → Bob)
//   * Ytre: gateway-til-gateway (R_A → R_B)
// Det indre er kryptert (ESP) eller bare autentisert (AH).

// ----------------------------------------------------------------------
// Topologi
// ----------------------------------------------------------------------

type NodeId = "alice" | "ra" | "rb" | "bob" | "eve";

const NODES = [
  { id: "alice" as NodeId, label: "Alice", sublabel: "192.168.1.10", x: 50, y: 220 },
  { id: "ra" as NodeId, label: "R_A", sublabel: "VPN-gateway", x: 200, y: 220 },
  { id: "rb" as NodeId, label: "R_B", sublabel: "VPN-gateway", x: 500, y: 220 },
  { id: "bob" as NodeId, label: "Bob", sublabel: "10.0.0.5", x: 650, y: 220 },
  { id: "eve" as NodeId, label: "Eve", sublabel: "i offentlig Internet", x: 350, y: 120 },
];

// ----------------------------------------------------------------------
// Skript
// ----------------------------------------------------------------------

type Mode = "esp" | "ah";

type Segment = "lan-a" | "tunnel" | "lan-b";

type Step = {
  title: string;
  text: string;
  /** Hvilken del av reisen vi viser pakken på. */
  segment?: Segment;
  /** Hvilken pakke-form har vi nå? */
  packet?: "plain" | "encap-esp" | "encap-ah" | "decap";
  highlight?: { ra?: boolean; rb?: boolean; eve?: boolean };
  outcome?: { kind: "ok" | "bad" | "info"; text: string };
  eveSeesEsp?: string;
  eveSeesAh?: string;
};

const SCRIPT: Step[] = [
  {
    title: "1. Alice sender en helt vanlig IP-pakke",
    text: "Alice vet ingenting om IPsec. Hun lager en pakke med innebygd header: src=192.168.1.10 (intern), dst=10.0.0.5 (Bob, intern). Payload = TCP/UDP-data.",
    segment: "lan-a",
    packet: "plain",
  },
  {
    title: "2. R_A (Alices VPN-gateway) plukker opp pakken",
    text: "R_A har en Security Association (SA) som matcher destinasjons-nettet. Den vet at trafikk til 10.0.0.0/24 skal i tunnelen mot R_B.",
    segment: "lan-a",
    packet: "plain",
    highlight: { ra: true },
    outcome: {
      kind: "info",
      text: "SA-en (etablert via IKE-handshake) inneholder: nøkler, algoritmer (AES-GCM, HMAC-SHA256), SPI, sekvensnumre, og policy.",
    },
  },
  {
    title: "3. R_A bygger om pakken — encapsulation",
    text: "R_A tar hele den originale IP-pakken (header + payload) og pakker den inn i en ESP-payload (eller AH-payload). Foran setter den en NY IP-header med src = R_A:s offentlige IP og dst = R_B:s offentlige IP.",
    segment: "tunnel",
    packet: "encap-esp",
    highlight: { ra: true },
  },
  {
    title: "4. Pakken reiser over åpent Internet — Eve lytter",
    text: "Pakken passerer router-er, ISP-er, mulig Eve på linja. Hva ser hun?",
    segment: "tunnel",
    packet: "encap-esp",
    highlight: { eve: true },
    eveSeesEsp:
      "Eve ser ytre IP-header (R_A → R_B). ESP-payload er KRYPTERT — ingen synlig src/dst for de interne adressene, ingen TCP-headers, ingen data.",
    eveSeesAh:
      "Eve ser ytre IP-header OG den indre IP-pakken (AH krypterer ikke!). Hun kan lese alt — kun integriteten er beskyttet.",
  },
  {
    title: "5. R_B mottar pakken — verifiserer og dekrypterer",
    text: "R_B sjekker SPI-en i ESP/AH-headeren, slår opp riktig SA, verifiserer MAC/ICV, og — for ESP — dekrypterer payload.",
    segment: "tunnel",
    packet: "encap-esp",
    highlight: { rb: true },
  },
  {
    title: "6. R_B leverer den originale pakken til Bob",
    text: "Etter decapsulation har R_B den opprinnelige pakken: src=192.168.1.10, dst=10.0.0.5. Den rutes til Bob over hans interne nett.",
    segment: "lan-b",
    packet: "decap",
    highlight: { rb: true },
    outcome: {
      kind: "ok",
      text: "Alice og Bob har snakket sammen som om de var på samme LAN — men trafikken har faktisk gått over åpent Internet. Det er kjernen i site-to-site VPN.",
    },
  },
];

// ----------------------------------------------------------------------
// Komponent
// ----------------------------------------------------------------------

export function Section87Live() {
  const [mode, setMode] = useState<Mode>("esp");
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const step = SCRIPT[stepIdx];

  useEffect(() => {
    if (!playing) return;
    let raf: number;
    let last = performance.now();
    const SPEED = 1 / 2400;
    function tick(now: number) {
      const dt = now - last;
      last = now;
      setProgress((p) => {
        const next = p + dt * SPEED;
        if (next >= 1) {
          setStepIdx((i) => {
            if (i + 1 >= SCRIPT.length) {
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

  const packetPos = useMemo(() => {
    const t = Math.min(Math.max(progress, 0), 0.999);
    if (step.segment === "lan-a") {
      const a = NODES.find((n) => n.id === "alice")!;
      const b = NODES.find((n) => n.id === "ra")!;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    if (step.segment === "tunnel") {
      const a = NODES.find((n) => n.id === "ra")!;
      const b = NODES.find((n) => n.id === "rb")!;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    if (step.segment === "lan-b") {
      const a = NODES.find((n) => n.id === "rb")!;
      const b = NODES.find((n) => n.id === "bob")!;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    return null;
  }, [step, progress]);

  const eveSees = mode === "esp" ? step.eveSeesEsp : step.eveSeesAh;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs border-b border-border flex items-center flex-wrap gap-3">
        <span className="font-medium text-foreground">{step.title}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setMode("esp")}
            className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition ${
              mode === "esp"
                ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-border bg-background text-muted-foreground hover:border-emerald-500/40"
            }`}
          >
            <Lock className="h-3 w-3" /> ESP (krypt + integ)
          </button>
          <button
            onClick={() => setMode("ah")}
            className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition ${
              mode === "ah"
                ? "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                : "border-border bg-background text-muted-foreground hover:border-amber-500/40"
            }`}
          >
            <FileKey className="h-3 w-3" /> AH (kun integ)
          </button>
        </div>
      </div>

      <svg viewBox="0 0 720 300" className="w-full h-auto bg-muted/10">
        {/* "Internett-sky" mellom R_A og R_B */}
        <rect
          x={210}
          y={170}
          width={300}
          height={100}
          rx={50}
          className="fill-muted/40 stroke-muted-foreground/30"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <text x={360} y={160} textAnchor="middle" className="fill-muted-foreground text-[10px] italic">
          offentlig Internet
        </text>

        {/* Tunnel-overlay når vi er i tunnel-segmentet */}
        {step.segment === "tunnel" && (
          <line
            x1={200}
            y1={220}
            x2={500}
            y2={220}
            className={
              mode === "esp" ? "stroke-emerald-500" : "stroke-amber-500"
            }
            strokeWidth={6}
            opacity={0.25}
          />
        )}

        {/* LAN-linjer */}
        <line x1={50} y1={220} x2={200} y2={220} className="stroke-muted-foreground/70" strokeWidth={1.6} />
        <line x1={500} y1={220} x2={650} y2={220} className="stroke-muted-foreground/70" strokeWidth={1.6} />
        <line x1={200} y1={220} x2={500} y2={220} className="stroke-muted-foreground/30" strokeWidth={1.4} strokeDasharray="6 4" />

        {/* Eve-lytte-linjer */}
        <line x1={200} y1={220} x2={350} y2={120} className="stroke-red-500/30" strokeWidth={1.3} strokeDasharray="3 4" />
        <line x1={350} y1={120} x2={500} y2={220} className="stroke-red-500/30" strokeWidth={1.3} strokeDasharray="3 4" />

        {NODES.map((n) => (
          <NodeShape key={n.id} node={n} highlight={n.id === "ra" ? step.highlight?.ra : n.id === "rb" ? step.highlight?.rb : n.id === "eve" ? step.highlight?.eve : false} />
        ))}

        {/* Pakke-visualisering */}
        {packetPos && step.packet && (
          <PacketGlyph
            x={packetPos.x}
            y={packetPos.y}
            variant={
              step.packet === "encap-esp"
                ? mode === "esp"
                  ? "encap-esp"
                  : "encap-ah"
                : step.packet
            }
          />
        )}

        {/* Eve-bobble når relevant */}
        {step.highlight?.eve && eveSees && (
          <g>
            <rect x={130} y={20} width={440} height={40} rx={5} className={mode === "esp" ? "fill-emerald-500/10 stroke-emerald-500/40" : "fill-red-500/10 stroke-red-500/40"} strokeWidth={1} />
            <text x={350} y={36} textAnchor="middle" className={`${mode === "esp" ? "fill-emerald-700 dark:fill-emerald-300" : "fill-red-700 dark:fill-red-300"} text-[9px] font-medium`}>
              {eveSees.split(" — ")[0]}
            </text>
            <text x={350} y={50} textAnchor="middle" className={`${mode === "esp" ? "fill-emerald-700 dark:fill-emerald-300" : "fill-red-700 dark:fill-red-300"} text-[9px]`}>
              {eveSees.split(" — ").slice(1).join(" — ")}
            </text>
          </g>
        )}
      </svg>

      <div className="px-4 py-3 text-sm border-t border-border">
        <p className="text-muted-foreground">{step.text}</p>
        {step.outcome && <OutcomeRow outcome={step.outcome} />}
      </div>

      <Controls
        stepIdx={stepIdx}
        total={SCRIPT.length}
        playing={playing}
        onPrev={() => {
          setStepIdx((i) => Math.max(0, i - 1));
          setProgress(0);
        }}
        onNext={() => {
          setStepIdx((i) => Math.min(SCRIPT.length - 1, i + 1));
          setProgress(0);
        }}
        onPlay={() => setPlaying((p) => !p)}
        onReset={() => {
          setStepIdx(0);
          setProgress(0);
          setPlaying(false);
        }}
        onJump={(i) => {
          setStepIdx(i);
          setProgress(0);
        }}
        progress={progress}
      />

      {/* Pakke-format-illustrasjon */}
      <div className="px-4 py-3 border-t border-border">
        <div className="text-[11px] font-medium text-foreground mb-2">Pakke-format i {mode === "esp" ? "ESP" : "AH"} tunnel-modus</div>
        <PacketFormat mode={mode} />
      </div>

      {/* ESP vs AH */}
      <div className="px-4 py-3 grid gap-2 sm:grid-cols-2 border-t border-border text-[11px]">
        <div className={`rounded p-2 ${mode === "esp" ? "bg-emerald-500/10 ring-1 ring-emerald-500/40" : "bg-muted/20"}`}>
          <div className="font-semibold text-foreground">ESP — Encapsulating Security Payload</div>
          <ul className="mt-1 space-y-0.5 text-muted-foreground list-disc pl-4">
            <li>Konfidensialitet: JA (AES-CBC, AES-GCM)</li>
            <li>Integritet: JA</li>
            <li>Autentisering: JA</li>
            <li>Anti-replay: JA (sekvensnumre)</li>
            <li>Standardvalg i moderne VPN-er</li>
          </ul>
        </div>
        <div className={`rounded p-2 ${mode === "ah" ? "bg-amber-500/10 ring-1 ring-amber-500/40" : "bg-muted/20"}`}>
          <div className="font-semibold text-foreground">AH — Authentication Header</div>
          <ul className="mt-1 space-y-0.5 text-muted-foreground list-disc pl-4">
            <li>Konfidensialitet: NEI</li>
            <li>Integritet: JA (over hele pakken inkl. IP-header)</li>
            <li>Autentisering: JA</li>
            <li>Anti-replay: JA</li>
            <li>Sjelden brukt — kan ikke krysse NAT</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// PacketGlyph — visualiserer en pakke ulikt avhengig av om den er
// klartekst, ESP-encap, AH-encap eller decap.
// ----------------------------------------------------------------------

function PacketGlyph({ x, y, variant }: { x: number; y: number; variant: "plain" | "encap-esp" | "encap-ah" | "decap" }) {
  if (variant === "plain" || variant === "decap") {
    return (
      <g>
        <rect x={x - 50} y={y - 12} width={100} height={24} rx={4} className="fill-amber-500 stroke-background" strokeWidth={2} />
        <text x={x} y={y + 4} textAnchor="middle" className="fill-background text-[9px] font-bold">
          IP[A→B] + data
        </text>
      </g>
    );
  }
  if (variant === "encap-esp") {
    return (
      <g>
        <rect x={x - 70} y={y - 14} width={140} height={28} rx={4} className="fill-emerald-500 stroke-background" strokeWidth={2} />
        <text x={x - 30} y={y + 4} textAnchor="middle" className="fill-background text-[8px] font-bold">
          IP[RA→RB]
        </text>
        <line x1={x - 5} y1={y - 12} x2={x - 5} y2={y + 12} className="stroke-background/50" strokeWidth={1} />
        <text x={x + 30} y={y + 4} textAnchor="middle" className="fill-background text-[8px] font-bold">
          [ESP: ★]
        </text>
      </g>
    );
  }
  // encap-ah
  return (
    <g>
      <rect x={x - 70} y={y - 14} width={140} height={28} rx={4} className="fill-amber-500 stroke-background" strokeWidth={2} />
      <text x={x - 30} y={y + 4} textAnchor="middle" className="fill-background text-[8px] font-bold">
        IP[RA→RB]
      </text>
      <line x1={x - 5} y1={y - 12} x2={x - 5} y2={y + 12} className="stroke-background/50" strokeWidth={1} />
      <text x={x + 30} y={y + 4} textAnchor="middle" className="fill-background text-[8px] font-bold">
        [AH] IP[A→B]
      </text>
    </g>
  );
}

// ----------------------------------------------------------------------
// PacketFormat — statisk illustrasjon av layout
// ----------------------------------------------------------------------

function PacketFormat({ mode }: { mode: Mode }) {
  if (mode === "esp") {
    return (
      <div className="flex items-stretch gap-0 text-[9px] font-mono">
        <Field label="Ny IP-header" sub="R_A → R_B" tone="emerald" />
        <Field label="ESP-header" sub="SPI, seq" tone="violet" />
        <Field label="KRYPTERT" sub="IP[A→B] + payload + ESP-trailer" tone="cyan" wide />
        <Field label="ESP-auth" sub="ICV (HMAC)" tone="emerald" />
      </div>
    );
  }
  return (
    <div className="flex items-stretch gap-0 text-[9px] font-mono">
      <Field label="Ny IP-header" sub="R_A → R_B" tone="amber" />
      <Field label="AH-header" sub="SPI, seq, ICV" tone="violet" />
      <Field label="Original IP[A→B]" sub="klartekst!" tone="rose" wide />
      <Field label="Payload" sub="klartekst!" tone="rose" wide />
    </div>
  );
}

function Field({
  label,
  sub,
  tone,
  wide = false,
}: {
  label: string;
  sub: string;
  tone: "emerald" | "amber" | "violet" | "cyan" | "rose";
  wide?: boolean;
}) {
  const toneMap = {
    emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/40",
    amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/40",
    violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300 ring-violet-500/40",
    cyan: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 ring-cyan-500/40",
    rose: "bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-rose-500/40",
  };
  return (
    <div className={`flex-1 ${wide ? "flex-grow-[2]" : ""} ring-1 ${toneMap[tone]} px-1.5 py-1 text-center first:rounded-l last:rounded-r`}>
      <div className="font-semibold">{label}</div>
      <div className="opacity-80">{sub}</div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Noder
// ----------------------------------------------------------------------

function NodeShape({ node, highlight = false }: { node: (typeof NODES)[number]; highlight?: boolean }) {
  if (node.id === "alice" || node.id === "bob") {
    const ring = node.id === "alice" ? "stroke-amber-500" : "stroke-sky-500";
    const fill = node.id === "alice" ? "fill-amber-500/15" : "fill-sky-500/15";
    const text =
      node.id === "alice" ? "fill-amber-700 dark:fill-amber-300" : "fill-sky-700 dark:fill-sky-300";
    return (
      <g>
        <circle cx={node.x} cy={node.y} r={22} className={`${fill} ${ring}`} strokeWidth={2.5} />
        <text x={node.x} y={node.y + 5} textAnchor="middle" className={`${text} text-[11px] font-bold`}>
          {node.label[0]}
        </text>
        <text x={node.x} y={node.y + 42} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
          {node.label}
        </text>
        <text x={node.x} y={node.y + 54} textAnchor="middle" className="fill-muted-foreground text-[9px]">
          {node.sublabel}
        </text>
      </g>
    );
  }
  if (node.id === "ra" || node.id === "rb") {
    return (
      <g>
        <rect
          x={node.x - 22}
          y={node.y - 18}
          width={44}
          height={36}
          rx={4}
          className={
            highlight
              ? "fill-brand/20 stroke-brand"
              : "fill-card stroke-foreground/60"
          }
          strokeWidth={highlight ? 3 : 2}
        />
        <text x={node.x} y={node.y + 5} textAnchor="middle" className="fill-foreground text-[11px] font-bold">
          {node.label}
        </text>
        <text x={node.x} y={node.y + 32} textAnchor="middle" className="fill-muted-foreground text-[9px]">
          {node.sublabel}
        </text>
      </g>
    );
  }
  // Eve
  return (
    <g opacity={highlight ? 1 : 0.7}>
      <polygon
        points={`${node.x},${node.y - 22} ${node.x + 22},${node.y + 14} ${node.x - 22},${node.y + 14}`}
        className="fill-red-500/15 stroke-red-500"
        strokeWidth={2.5}
      />
      <text x={node.x} y={node.y + 6} textAnchor="middle" className="fill-red-700 dark:fill-red-300 text-[11px] font-bold">
        E
      </text>
      <text x={node.x} y={node.y - 30} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        {node.label}
      </text>
      <text x={node.x} y={node.y - 42} textAnchor="middle" className="fill-red-600/80 dark:fill-red-400/80 text-[9px] font-medium">
        {node.sublabel}
      </text>
    </g>
  );
}
