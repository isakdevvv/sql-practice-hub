import { useEffect, useMemo, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react";

// Section94Live — fullskala interaktiv for Kurose-seksjon 9.4 (real-time
// conferencing): SIP-signalering for å sette opp en samtale mellom Alice og
// Bob, etterfulgt av peer-to-peer RTP-mediestrømmer (eller via en TURN-relay
// hvis NAT-en blokkerer direkte forbindelse).
//
// Walkthrough-strukturen er som Section11Live: en pakke beveger seg langs en
// path; bruker kan steppe gjennom eller spille av.
//
// To moduser:
//   - "direct": Alice og Bob har offentlige IP-er; SIP går via proxy-er, RTP
//     går direkte mellom dem.
//   - "nat-turn": Bob er bak symmetrisk NAT som blokkerer STUN-hole-punching.
//     RTP må gå via en TURN-server.

type NodeId =
  | "alice"
  | "aliceProxy"
  | "bobProxy"
  | "bob"
  | "turn"
  | "registrar";

type Node = {
  id: NodeId;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  kind: "host" | "proxy" | "turn" | "registrar";
};

const NODES: Node[] = [
  { id: "alice", label: "Alice", sublabel: "alice@uit.no", x: 70, y: 240, kind: "host" },
  { id: "aliceProxy", label: "Proxy", sublabel: "sip.uit.no", x: 250, y: 130, kind: "proxy" },
  { id: "registrar", label: "Registrar", sublabel: "ntnu.no", x: 420, y: 50, kind: "registrar" },
  { id: "bobProxy", label: "Proxy", sublabel: "sip.ntnu.no", x: 590, y: 130, kind: "proxy" },
  { id: "bob", label: "Bob", sublabel: "bob@ntnu.no", x: 770, y: 240, kind: "host" },
  { id: "turn", label: "TURN", sublabel: "relay.coturn.io", x: 420, y: 240, kind: "turn" },
];

type EdgeId = `${NodeId}-${NodeId}`;
const EDGES: [NodeId, NodeId][] = [
  ["alice", "aliceProxy"],
  ["aliceProxy", "registrar"],
  ["registrar", "bobProxy"],
  ["bobProxy", "bob"],
  ["aliceProxy", "bobProxy"], // direkte proxy-til-proxy (SIP trapezoid)
  ["alice", "bob"], // logisk direkte RTP når mulig
  ["alice", "turn"],
  ["turn", "bob"],
];

type StepColor = "register" | "invite" | "ringing" | "ok" | "ack" | "rtp" | "bye";

type Step = {
  title: string;
  description: string;
  path: NodeId[];
  color: StepColor;
  scenario: "both" | "direct" | "nat-turn";
};

const COMMON_STEPS: Step[] = [
  {
    title: "0. REGISTER — Bob registrerer seg",
    description:
      "Før noen kan ringe Bob må han fortelle SIP-registraren hvor han bor akkurat nå (IP + port). Han sender REGISTER til sip.ntnu.no med kontakt-info. Registraren oppdaterer en database som mapper bob@ntnu.no → 158.39.x.y:5060.",
    path: ["bob", "bobProxy", "registrar"],
    color: "register",
    scenario: "both",
  },
  {
    title: "1. INVITE — Alice ringer Bob",
    description:
      "Alice klikker «Ring Bob». SIP-klienten hennes sender INVITE sip:bob@ntnu.no til sin egen proxy (sip.uit.no). INVITE inneholder en SDP-kropp som beskriver hvilke codec-er Alice støtter, hvilken IP og port hun vil ta i mot RTP på, osv.",
    path: ["alice", "aliceProxy"],
    color: "invite",
    scenario: "both",
  },
  {
    title: "2. Proxy slår opp Bobs lokasjon",
    description:
      "Alice sin proxy ser at bob@ntnu.no ligger utenfor sitt eget domene. Den spør NTNU sin registrar (eller bruker DNS SRV) om hvor Bob er, og finner sin trapezoid-partner sip.ntnu.no.",
    path: ["aliceProxy", "registrar"],
    color: "invite",
    scenario: "both",
  },
  {
    title: "3. INVITE videresendes til Bobs proxy",
    description:
      "Alice sin proxy forwarder INVITE-en til sip.ntnu.no. Hver proxy legger til sin egen Via-header, så svaret kan reise samme rute tilbake.",
    path: ["aliceProxy", "bobProxy"],
    color: "invite",
    scenario: "both",
  },
  {
    title: "4. Bob får INVITE",
    description:
      "sip.ntnu.no slår opp Bobs registrering, finner hans nåværende IP, og leverer INVITE-en. Bobs telefon begynner å ringe.",
    path: ["bobProxy", "bob"],
    color: "invite",
    scenario: "both",
  },
  {
    title: "5. 180 RINGING tilbake",
    description:
      "Bobs klient svarer med en 180 Ringing-melding. Den reiser samme vei tilbake (via-header forteller proxy-ene hvor neste hopp er): bob → sip.ntnu.no → sip.uit.no → Alice. Alice hører ringe-tonen i øret.",
    path: ["bob", "bobProxy", "aliceProxy", "alice"],
    color: "ringing",
    scenario: "both",
  },
  {
    title: "6. Bob tar telefonen → 200 OK",
    description:
      "Bob svarer. Klienten hans sender 200 OK med sin egen SDP — det er der han kunngjør sin codec-preferanse og sin RTP-IP/port. Svaret går samme vei tilbake til Alice.",
    path: ["bob", "bobProxy", "aliceProxy", "alice"],
    color: "ok",
    scenario: "both",
  },
  {
    title: "7. ACK — Alice bekrefter",
    description:
      "Alice sender ACK direkte til Bob (etter at hun nå vet hans IP fra OK-en). Three-way SIP-handshake (INVITE/200/ACK) er fullført. Samtalen er etablert.",
    path: ["alice", "bob"],
    color: "ack",
    scenario: "both",
  },
];

const DIRECT_STEPS: Step[] = [
  {
    title: "8. RTP — Alice → Bob direkte",
    description:
      "Begge er på «åpent» nett (offentlige IP-er eller full cone NAT). RTP-pakker går peer-to-peer Alice → Bob. Lavest mulig latens. Proxy-ene er ute av bildet til samtalen slutter.",
    path: ["alice", "bob"],
    color: "rtp",
    scenario: "direct",
  },
  {
    title: "9. RTP — Bob → Alice direkte",
    description:
      "Samme vei andre veien. To-veis lyd. SDP-en utvekslet i 200 OK fortalte hver part hvor å sende.",
    path: ["bob", "alice"],
    color: "rtp",
    scenario: "direct",
  },
  {
    title: "10. BYE — Bob legger på",
    description:
      "Når Bob legger på sender klienten hans BYE til Alice (via proxy-ene som vanlig). Alice svarer 200 OK. SIP-dialogen lukkes, RTP-strømmene stenges.",
    path: ["bob", "bobProxy", "aliceProxy", "alice"],
    color: "bye",
    scenario: "direct",
  },
];

const NAT_STEPS: Step[] = [
  {
    title: "8a. STUN / ICE candidate-gathering feiler",
    description:
      "Alice prøver å sende RTP direkte til Bobs annonserte IP, men Bobs symmetrisk-NAT slipper bare gjennom retur-pakker fra de IP-ene Bob har sendt TIL. Hole-punching fungerer ikke. ICE-kandidatene blir TURN-relay-en.",
    path: ["alice", "bob"],
    color: "rtp",
    scenario: "nat-turn",
  },
  {
    title: "8b. Alice → TURN → Bob",
    description:
      "Alice sender RTP til TURN-server (relay.coturn.io). TURN-server-en har allerede en relay-sesjon åpen for Bob; den videresender pakkene. Latensen øker fordi vi tar en omvei.",
    path: ["alice", "turn", "bob"],
    color: "rtp",
    scenario: "nat-turn",
  },
  {
    title: "9. Bob → TURN → Alice",
    description:
      "Samme vei andre veien. Begge RTP-strømmene flyter gjennom TURN. TURN-server-en blir flaskehals — derfor er ICE designet til å bare bruke TURN som siste utvei.",
    path: ["bob", "turn", "alice"],
    color: "rtp",
    scenario: "nat-turn",
  },
  {
    title: "10. BYE — Bob legger på",
    description:
      "BYE går samme SIP-rute som etableringen. TURN-relay-sesjonen lukkes også (egen kanal). Alice sin klient frigjør lyd-enheten.",
    path: ["bob", "bobProxy", "aliceProxy", "alice"],
    color: "bye",
    scenario: "nat-turn",
  },
];

const COLOR_FILL: Record<StepColor, string> = {
  register: "fill-cyan-500",
  invite: "fill-brand",
  ringing: "fill-yellow-500",
  ok: "fill-success",
  ack: "fill-amber-500",
  rtp: "fill-purple-500",
  bye: "fill-red-500",
};

const COLOR_BG: Record<StepColor, string> = {
  register: "bg-cyan-500",
  invite: "bg-brand",
  ringing: "bg-yellow-500",
  ok: "bg-success",
  ack: "bg-amber-500",
  rtp: "bg-purple-500",
  bye: "bg-red-500",
};

const COLOR_LABEL: Record<StepColor, string> = {
  register: "REG",
  invite: "INV",
  ringing: "180",
  ok: "200",
  ack: "ACK",
  rtp: "RTP",
  bye: "BYE",
};

type Mode = "direct" | "nat-turn";

export function Section94Live() {
  const [mode, setMode] = useState<Mode>("direct");
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const steps = useMemo<Step[]>(() => {
    return [...COMMON_STEPS, ...(mode === "direct" ? DIRECT_STEPS : NAT_STEPS)];
  }, [mode]);

  const step = steps[Math.min(stepIdx, steps.length - 1)];

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
            if (i + 1 >= steps.length) {
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
  }, [playing, steps.length]);

  function nextStep() {
    setStepIdx((i) => Math.min(steps.length - 1, i + 1));
    setProgress(0);
  }
  function prevStep() {
    setStepIdx((i) => Math.max(0, i - 1));
    setProgress(0);
  }
  function reset() {
    setStepIdx(0);
    setProgress(0);
    setPlaying(false);
  }
  function switchMode(m: Mode) {
    setMode(m);
    setStepIdx(0);
    setProgress(0);
    setPlaying(false);
  }

  const pktPos = packetPosition(step.path, progress);
  const activeEdges = pathToEdgeSet(step.path);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">SIP-handshake → RTP-mediestrøm</span>
        <span className="ml-auto font-mono">
          Steg {stepIdx + 1} / {steps.length}
        </span>
      </div>

      <svg viewBox="0 0 840 320" className="w-full h-auto bg-muted/10">
        {/* Edges */}
        {EDGES.map(([a, b], i) => {
          // Skjul TURN-edges hvis vi er i direct mode og turn-noden ikke er relevant
          if ((a === "alice" && b === "turn") || (a === "turn" && b === "bob")) {
            if (mode !== "nat-turn") return null;
          }
          // Skjul direkte alice-bob i nat-turn mode (vi bruker TURN i stedet)
          if (a === "alice" && b === "bob" && mode === "nat-turn") {
            // Vis som blokkert
            const na = NODES.find((n) => n.id === a)!;
            const nb = NODES.find((n) => n.id === b)!;
            const mx = (na.x + nb.x) / 2;
            const my = (na.y + nb.y) / 2;
            return (
              <g key={`blocked-${i}`}>
                <line
                  x1={na.x + 25}
                  y1={na.y}
                  x2={nb.x - 25}
                  y2={nb.y}
                  className="stroke-red-500/30"
                  strokeWidth={1}
                  strokeDasharray="2 4"
                />
                <g transform={`translate(${mx}, ${my - 10})`}>
                  <rect x={-26} y={-8} width={52} height={16} rx={2} className="fill-red-500/10 stroke-red-500/60" strokeWidth={1} />
                  <text x={0} y={4} textAnchor="middle" className="fill-red-500 text-[9px] font-semibold">NAT blokk</text>
                </g>
              </g>
            );
          }
          const na = NODES.find((n) => n.id === a)!;
          const nb = NODES.find((n) => n.id === b)!;
          const key: EdgeId = `${a}-${b}`;
          const keyRev: EdgeId = `${b}-${a}`;
          const isActive = activeEdges.has(key) || activeEdges.has(keyRev);
          return (
            <line
              key={i}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              className={isActive ? "stroke-foreground/70" : "stroke-muted-foreground/25"}
              strokeWidth={isActive ? 2 : 1.5}
            />
          );
        })}

        {/* Nodes */}
        {NODES.map((n) => {
          // Skjul TURN i direct mode
          if (n.id === "turn" && mode !== "nat-turn") return null;
          return <NodeShape key={n.id} node={n} />;
        })}

        {/* Animert pakke */}
        {pktPos && (
          <g>
            <circle
              cx={pktPos.x}
              cy={pktPos.y}
              r={13}
              className={`${COLOR_FILL[step.color]} stroke-background`}
              strokeWidth={2}
            />
            <text
              x={pktPos.x}
              y={pktPos.y + 4}
              textAnchor="middle"
              className="fill-background text-[9px] font-bold pointer-events-none"
            >
              {COLOR_LABEL[step.color]}
            </text>
          </g>
        )}

        {/* Mode-label */}
        <g transform="translate(20, 22)">
          <rect x={0} y={0} width={210} height={20} rx={3} className="fill-card stroke-border" strokeWidth={1} />
          <text x={10} y={14} className="fill-foreground text-[10px] font-semibold">
            Modus: {mode === "direct" ? "Direkte P2P RTP" : "NAT → må bruke TURN-relay"}
          </text>
        </g>
      </svg>

      {/* Step description */}
      <div className="px-4 py-3 border-t border-border">
        <div className="text-[13px] font-semibold text-foreground">{step.title}</div>
        <div className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
          {step.description}
        </div>
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
            : stepIdx === steps.length - 1 && progress >= 0.99
              ? "Spill igjen"
              : "Spill av"}
        </button>
        <button
          onClick={nextStep}
          disabled={stepIdx === steps.length - 1}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
        >
          Neste <SkipForward className="h-3 w-3" />
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          <RotateCcw className="h-3 w-3" />
        </button>

        <span className="ml-3 text-[10px] text-muted-foreground">Modus:</span>
        <button
          onClick={() => switchMode("direct")}
          className={`rounded px-2 py-1 text-[10px] border ${
            mode === "direct"
              ? "border-brand bg-brand/15 text-brand"
              : "border-border bg-background hover:border-brand/60"
          }`}
        >
          Direkte P2P
        </button>
        <button
          onClick={() => switchMode("nat-turn")}
          className={`rounded px-2 py-1 text-[10px] border ${
            mode === "nat-turn"
              ? "border-brand bg-brand/15 text-brand"
              : "border-border bg-background hover:border-brand/60"
          }`}
        >
          NAT → TURN
        </button>

        {/* Step dots */}
        <div className="ml-auto flex gap-1">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setStepIdx(i);
                setProgress(0);
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
        <LegendDot className={COLOR_BG.register} /> REGISTER
        <LegendDot className={COLOR_BG.invite} /> INVITE
        <LegendDot className={COLOR_BG.ringing} /> 180 Ringing
        <LegendDot className={COLOR_BG.ok} /> 200 OK
        <LegendDot className={COLOR_BG.ack} /> ACK
        <LegendDot className={COLOR_BG.rtp} /> RTP-media
        <LegendDot className={COLOR_BG.bye} /> BYE
      </div>
    </div>
  );
}

function NodeShape({ node }: { node: Node }) {
  if (node.kind === "host") {
    return (
      <g>
        <rect x={node.x - 24} y={node.y - 22} width={48} height={44} rx={4}
          className="fill-card stroke-amber-500" strokeWidth={2} />
        <circle cx={node.x} cy={node.y - 6} r={5} className="fill-amber-500/40" />
        <rect x={node.x - 14} y={node.y + 2} width={28} height={6} rx={1} className="fill-amber-500/40" />
        <text x={node.x} y={node.y + 36} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
          {node.label}
        </text>
        {node.sublabel && (
          <text x={node.x} y={node.y + 48} textAnchor="middle" className="fill-muted-foreground text-[9px]">
            {node.sublabel}
          </text>
        )}
      </g>
    );
  }
  if (node.kind === "proxy") {
    return (
      <g>
        <rect x={node.x - 30} y={node.y - 18} width={60} height={36} rx={4}
          className="fill-card stroke-foreground/60" strokeWidth={2} />
        <text x={node.x} y={node.y + 4} textAnchor="middle" className="fill-foreground text-[10px] font-bold">
          SIP px
        </text>
        <text x={node.x} y={node.y - 30} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
          {node.label}
        </text>
        {node.sublabel && (
          <text x={node.x} y={node.y + 30} textAnchor="middle" className="fill-muted-foreground text-[9px]">
            {node.sublabel}
          </text>
        )}
      </g>
    );
  }
  if (node.kind === "registrar") {
    return (
      <g>
        <rect x={node.x - 35} y={node.y - 18} width={70} height={36} rx={4}
          className="fill-card stroke-cyan-500" strokeWidth={2} />
        <text x={node.x} y={node.y + 4} textAnchor="middle" className="fill-cyan-700 dark:fill-cyan-300 text-[10px] font-bold">
          Registrar
        </text>
        <text x={node.x} y={node.y - 30} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
          Location DB
        </text>
        {node.sublabel && (
          <text x={node.x} y={node.y + 30} textAnchor="middle" className="fill-muted-foreground text-[9px]">
            {node.sublabel}
          </text>
        )}
      </g>
    );
  }
  if (node.kind === "turn") {
    return (
      <g>
        <rect x={node.x - 30} y={node.y - 18} width={60} height={36} rx={4}
          className="fill-card stroke-purple-500" strokeWidth={2} strokeDasharray="2 2" />
        <text x={node.x} y={node.y + 4} textAnchor="middle" className="fill-purple-700 dark:fill-purple-300 text-[10px] font-bold">
          TURN
        </text>
        <text x={node.x} y={node.y - 30} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
          {node.label}-relay
        </text>
        {node.sublabel && (
          <text x={node.x} y={node.y + 30} textAnchor="middle" className="fill-muted-foreground text-[9px]">
            {node.sublabel}
          </text>
        )}
      </g>
    );
  }
  return null;
}

function LegendDot({ className }: { className: string }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${className}`} />;
}

function nodeById(id: NodeId): Node | undefined {
  return NODES.find((n) => n.id === id);
}

function pathToEdgeSet(path: NodeId[]): Set<EdgeId> {
  const s = new Set<EdgeId>();
  for (let i = 0; i < path.length - 1; i++) {
    s.add(`${path[i]}-${path[i + 1]}` as EdgeId);
  }
  return s;
}

function packetPosition(path: NodeId[], progress: number): { x: number; y: number } | null {
  if (path.length < 2) return null;
  const segments = path.length - 1;
  const safe = Number.isFinite(progress) ? Math.min(Math.max(progress, 0), 0.999) : 0;
  const t = safe * segments;
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
