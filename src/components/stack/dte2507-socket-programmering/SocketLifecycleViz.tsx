import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, StepForward } from "lucide-react";

// SocketLifecycleViz — klient og server side-ved-side.
// Studenten klikker (eller spiller av) syscall-for-syscall og ser hvordan
// socket-state endrer seg på begge sider: CLOSED → LISTEN → ESTABLISHED →
// CLOSED, samt hvilke "pile-flagg" som krysser kabelen (SYN/SYN-ACK/ACK,
// data, FIN/ACK). Pure SVG.

type Side = "server" | "klient";
type State =
  | "CLOSED"
  | "BOUND"
  | "LISTEN"
  | "SYN_RCVD"
  | "SYN_SENT"
  | "ESTABLISHED"
  | "FIN_WAIT"
  | "TIME_WAIT";

interface Step {
  side: Side;
  call: string;
  detail: string;
  serverState: State;
  klientState: State;
  packet?: { from: Side; label: string; kind: "syn" | "ack" | "data" | "fin" };
}

const STEPS: Step[] = [
  {
    side: "server",
    call: "socket()",
    detail: "Lager en ubrukt socket — bare en file descriptor uten adresse.",
    serverState: "CLOSED",
    klientState: "CLOSED",
  },
  {
    side: "server",
    call: "bind((0.0.0.0, 8080))",
    detail: "Reserverer porten 8080 i kernelens port-tabell.",
    serverState: "BOUND",
    klientState: "CLOSED",
  },
  {
    side: "server",
    call: "listen(5)",
    detail: "Sier til kernel: «aksepter inntil 5 ventende SYN-er på denne porten».",
    serverState: "LISTEN",
    klientState: "CLOSED",
  },
  {
    side: "klient",
    call: "socket()",
    detail: "Klienten lager sin egen socket. Får tildelt en efemær port (f.eks. 54231).",
    serverState: "LISTEN",
    klientState: "CLOSED",
  },
  {
    side: "klient",
    call: "connect((srv, 8080))",
    detail: "Sender SYN. Starter TCP-handshake.",
    serverState: "LISTEN",
    klientState: "SYN_SENT",
    packet: { from: "klient", label: "SYN", kind: "syn" },
  },
  {
    side: "server",
    call: "kernel mottar SYN",
    detail: "Half-open i listen-køen. Sender SYN-ACK tilbake.",
    serverState: "SYN_RCVD",
    klientState: "SYN_SENT",
    packet: { from: "server", label: "SYN-ACK", kind: "syn" },
  },
  {
    side: "klient",
    call: "kernel sender ACK",
    detail: "Tre-veis-håndtrykk fullført. Klient-side anses ESTABLISHED.",
    serverState: "SYN_RCVD",
    klientState: "ESTABLISHED",
    packet: { from: "klient", label: "ACK", kind: "ack" },
  },
  {
    side: "server",
    call: "conn, addr = accept()",
    detail: "Plukker den ferdige tilkoblingen ut av kø — returnerer NY socket. Lytte-socketen er fortsatt LISTEN.",
    serverState: "ESTABLISHED",
    klientState: "ESTABLISHED",
  },
  {
    side: "klient",
    call: 'send(b"hello")',
    detail: "Skriver 5 bytes i TCP-strømmen.",
    serverState: "ESTABLISHED",
    klientState: "ESTABLISHED",
    packet: { from: "klient", label: '"hello"', kind: "data" },
  },
  {
    side: "server",
    call: "data = recv(4096)",
    detail: "Plukker opp inntil 4096 bytes — får 5. Husk: kan returnere mindre.",
    serverState: "ESTABLISHED",
    klientState: "ESTABLISHED",
  },
  {
    side: "server",
    call: 'sendall(b"echo hello")',
    detail: "sendall() looper internt til alle 10 bytes er skrevet.",
    serverState: "ESTABLISHED",
    klientState: "ESTABLISHED",
    packet: { from: "server", label: '"echo hello"', kind: "data" },
  },
  {
    side: "klient",
    call: "close()",
    detail: "Sender FIN — graceful shutdown initiert.",
    serverState: "ESTABLISHED",
    klientState: "FIN_WAIT",
    packet: { from: "klient", label: "FIN", kind: "fin" },
  },
  {
    side: "server",
    call: "recv() returnerer b''",
    detail: "Tomt resultat = «peer closed». Server svarer med FIN.",
    serverState: "CLOSED",
    klientState: "FIN_WAIT",
    packet: { from: "server", label: "FIN-ACK", kind: "fin" },
  },
  {
    side: "klient",
    call: "TIME_WAIT (~2·MSL)",
    detail: "Klient venter ~60-120 s i TIME_WAIT for å fange forsinkede pakker. Derfor: «Address already in use» ved umiddelbar restart uten SO_REUSEADDR.",
    serverState: "CLOSED",
    klientState: "TIME_WAIT",
  },
];

const W = 560;
const H = 320;
const SRV_X = 90;
const CLI_X = 470;
const TRACK_Y_TOP = 70;
const TRACK_Y_BOT = 240;

const STATE_COLORS: Record<State, string> = {
  CLOSED: "rgb(148,163,184)",
  BOUND: "rgb(56,189,248)",
  LISTEN: "rgb(56,189,248)",
  SYN_RCVD: "rgb(234,179,8)",
  SYN_SENT: "rgb(234,179,8)",
  ESTABLISHED: "rgb(34,197,94)",
  FIN_WAIT: "rgb(244,114,182)",
  TIME_WAIT: "rgb(244,114,182)",
};

const PACKET_COLORS: Record<NonNullable<Step["packet"]>["kind"], string> = {
  syn: "rgb(234,179,8)",
  ack: "rgb(34,197,94)",
  data: "rgb(56,189,248)",
  fin: "rgb(244,114,182)",
};

export function SocketLifecycleViz() {
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    timerRef.current = window.setInterval(() => {
      setStepIdx((i) => {
        if (i >= STEPS.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 1100);
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [playing]);

  const step = STEPS[stepIdx];
  const pkt = step.packet;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
        <button
          onClick={() => {
            if (stepIdx >= STEPS.length - 1) setStepIdx(0);
            setPlaying((p) => !p);
          }}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? "Pause" : "Spill"}
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
          }}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1"
        >
          <StepForward className="h-3.5 w-3.5" /> Neste
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setStepIdx(0);
          }}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
        <div className="ml-auto font-mono text-muted-foreground">
          {stepIdx + 1}/{STEPS.length}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background/40 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          {/* Track */}
          <rect x={SRV_X - 50} y={TRACK_Y_TOP - 30} width={100} height={H - TRACK_Y_TOP - 10} rx={8} fill="currentColor" fillOpacity={0.04} />
          <rect x={CLI_X - 50} y={TRACK_Y_TOP - 30} width={100} height={H - TRACK_Y_TOP - 10} rx={8} fill="currentColor" fillOpacity={0.04} />

          {/* Titles */}
          <text x={SRV_X} y={TRACK_Y_TOP - 40} textAnchor="middle" fontSize={12} fontWeight={600} className="fill-foreground">
            SERVER (lytter)
          </text>
          <text x={CLI_X} y={TRACK_Y_TOP - 40} textAnchor="middle" fontSize={12} fontWeight={600} className="fill-foreground">
            KLIENT
          </text>
          <text x={SRV_X} y={TRACK_Y_TOP - 12} textAnchor="middle" fontSize={9} className="fill-muted-foreground">
            0.0.0.0:8080
          </text>
          <text x={CLI_X} y={TRACK_Y_TOP - 12} textAnchor="middle" fontSize={9} className="fill-muted-foreground">
            klient:54231
          </text>

          {/* Wire (kabelen) */}
          <line
            x1={SRV_X + 50}
            x2={CLI_X - 50}
            y1={(TRACK_Y_TOP + TRACK_Y_BOT) / 2}
            y2={(TRACK_Y_TOP + TRACK_Y_BOT) / 2}
            stroke="currentColor"
            strokeOpacity={0.15}
            strokeDasharray="4 4"
          />

          {/* State badges */}
          <StateBadge x={SRV_X} y={TRACK_Y_TOP + 20} state={step.serverState} />
          <StateBadge x={CLI_X} y={TRACK_Y_TOP + 20} state={step.klientState} />

          {/* Current call på riktig side */}
          <CallBox
            x={step.side === "server" ? SRV_X : CLI_X}
            y={TRACK_Y_BOT - 10}
            call={step.call}
            active
          />

          {/* Pakke i transitt */}
          {pkt && (
            <PacketArrow
              fromX={pkt.from === "server" ? SRV_X + 50 : CLI_X - 50}
              toX={pkt.from === "server" ? CLI_X - 50 : SRV_X + 50}
              y={(TRACK_Y_TOP + TRACK_Y_BOT) / 2}
              label={pkt.label}
              color={PACKET_COLORS[pkt.kind]}
              key={stepIdx}
            />
          )}

          {/* Tracker boks under */}
          <rect x={20} y={H - 60} width={W - 40} height={50} rx={6} fill="currentColor" fillOpacity={0.04} />
          <text x={30} y={H - 42} fontSize={11} fontWeight={600} className="fill-foreground">
            {step.side === "server" ? "Server:" : "Klient:"} {step.call}
          </text>
          <foreignObject x={30} y={H - 34} width={W - 60} height={28}>
            <div className="text-[10px] leading-snug text-muted-foreground">{step.detail}</div>
          </foreignObject>
        </svg>
      </div>

      {/* Steg-navigasjon (chips) */}
      <div className="mt-3 flex flex-wrap gap-1">
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => {
              setPlaying(false);
              setStepIdx(i);
            }}
            className={
              "rounded-md border px-1.5 py-0.5 text-[10px] font-mono transition-colors " +
              (i === stepIdx
                ? "border-brand bg-brand/15 text-brand"
                : i < stepIdx
                ? "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                : "border-border bg-background/40 text-muted-foreground hover:bg-muted/30")
            }
          >
            {i + 1}. {s.call.split("(")[0]}
          </button>
        ))}
      </div>

      {/* Legende */}
      <div className="mt-3 grid sm:grid-cols-4 gap-2 text-[10px]">
        <LegendItem color={STATE_COLORS.LISTEN} label="LISTEN / SYN_*" />
        <LegendItem color={STATE_COLORS.ESTABLISHED} label="ESTABLISHED" />
        <LegendItem color={STATE_COLORS.FIN_WAIT} label="FIN_WAIT / TIME_WAIT" />
        <LegendItem color={STATE_COLORS.CLOSED} label="CLOSED" />
      </div>
    </div>
  );
}

function StateBadge({ x, y, state }: { x: number; y: number; state: State }) {
  const color = STATE_COLORS[state];
  return (
    <g>
      <rect x={x - 55} y={y - 14} width={110} height={28} rx={6} fill={color} fillOpacity={0.15} stroke={color} strokeOpacity={0.6} />
      <text x={x} y={y + 5} textAnchor="middle" fontSize={11} fontWeight={600} fill={color} className="font-mono">
        {state}
      </text>
    </g>
  );
}

function CallBox({ x, y, call, active }: { x: number; y: number; call: string; active: boolean }) {
  const w = Math.max(80, call.length * 6 + 16);
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - 12}
        width={w}
        height={24}
        rx={4}
        fill={active ? "rgb(56,189,248)" : "currentColor"}
        fillOpacity={active ? 0.2 : 0.05}
        stroke={active ? "rgb(56,189,248)" : "currentColor"}
        strokeOpacity={active ? 0.8 : 0.2}
      />
      <text x={x} y={y + 4} textAnchor="middle" fontSize={10} className="fill-foreground font-mono">
        {call}
      </text>
    </g>
  );
}

function PacketArrow({
  fromX,
  toX,
  y,
  label,
  color,
}: {
  fromX: number;
  toX: number;
  y: number;
  label: string;
  color: string;
}) {
  const dir = toX > fromX ? 1 : -1;
  const tip = toX - dir * 4;
  return (
    <g>
      <line x1={fromX} x2={toX} y1={y} y2={y} stroke={color} strokeWidth={2}>
        <animate attributeName="stroke-dasharray" from={`0 ${Math.abs(toX - fromX)}`} to={`${Math.abs(toX - fromX)} 0`} dur="0.9s" fill="freeze" />
      </line>
      <polygon points={`${tip},${y - 5} ${toX},${y} ${tip},${y + 5}`} fill={color} />
      <rect x={(fromX + toX) / 2 - 38} y={y - 22} width={76} height={16} rx={4} fill={color} fillOpacity={0.18} />
      <text x={(fromX + toX) / 2} y={y - 10} textAnchor="middle" fontSize={10} fontWeight={600} fill={color} className="font-mono">
        {label}
      </text>
    </g>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: color, opacity: 0.6 }} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
