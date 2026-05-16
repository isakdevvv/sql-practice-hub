import { useState } from "react";
import { RotateCcw, Network, AlertTriangle } from "lucide-react";

/**
 * TCP state machine — 11 states, parallel client/server view.
 *
 * RFC 793. The client side runs the "active open" path (CLOSED → SYN-SENT →
 * ESTABLISHED → FIN-WAIT-1 → ... → TIME-WAIT → CLOSED). The server side runs
 * the "passive open" path (CLOSED → LISTEN → SYN-RECEIVED → ESTABLISHED →
 * CLOSE-WAIT → LAST-ACK → CLOSED).
 *
 * Both columns step in lock-step when the user fires events.
 */

type State =
  | "CLOSED"
  | "LISTEN"
  | "SYN-SENT"
  | "SYN-RECEIVED"
  | "ESTABLISHED"
  | "FIN-WAIT-1"
  | "FIN-WAIT-2"
  | "CLOSE-WAIT"
  | "CLOSING"
  | "LAST-ACK"
  | "TIME-WAIT";

type Side = "client" | "server";

type Pos = { x: number; y: number };

/** Layout for the central state diagram (combined). */
const STATE_POS: Record<State, Pos> = {
  CLOSED: { x: 220, y: 30 },
  LISTEN: { x: 60, y: 130 },
  "SYN-SENT": { x: 380, y: 130 },
  "SYN-RECEIVED": { x: 220, y: 230 },
  ESTABLISHED: { x: 220, y: 340 },
  "FIN-WAIT-1": { x: 60, y: 440 },
  "CLOSE-WAIT": { x: 380, y: 440 },
  CLOSING: { x: 220, y: 530 },
  "FIN-WAIT-2": { x: 60, y: 540 },
  "LAST-ACK": { x: 380, y: 540 },
  "TIME-WAIT": { x: 60, y: 640 },
};

/** Which side(s) ever sit in this state. */
const STATE_SIDE: Record<State, Side[]> = {
  CLOSED: ["client", "server"],
  LISTEN: ["server"],
  "SYN-SENT": ["client"],
  "SYN-RECEIVED": ["server"],
  ESTABLISHED: ["client", "server"],
  "FIN-WAIT-1": ["client"],
  "FIN-WAIT-2": ["client"],
  "CLOSE-WAIT": ["server"],
  CLOSING: ["client"],
  "LAST-ACK": ["server"],
  "TIME-WAIT": ["client"],
};

/** Edges in the diagram. anomalous=true marks unusual / simultaneous-close paths. */
type Edge = {
  from: State;
  to: State;
  label: string;
  anomalous?: boolean;
};

const EDGES: Edge[] = [
  { from: "CLOSED", to: "LISTEN", label: "passive open" },
  { from: "CLOSED", to: "SYN-SENT", label: "active open / send SYN" },
  { from: "LISTEN", to: "SYN-RECEIVED", label: "recv SYN / send SYN+ACK" },
  { from: "SYN-SENT", to: "SYN-RECEIVED", label: "recv SYN / send ACK", anomalous: true },
  { from: "SYN-SENT", to: "ESTABLISHED", label: "recv SYN+ACK / send ACK" },
  { from: "SYN-RECEIVED", to: "ESTABLISHED", label: "recv ACK" },
  { from: "ESTABLISHED", to: "FIN-WAIT-1", label: "close / send FIN" },
  { from: "ESTABLISHED", to: "CLOSE-WAIT", label: "recv FIN / send ACK" },
  { from: "FIN-WAIT-1", to: "FIN-WAIT-2", label: "recv ACK" },
  { from: "FIN-WAIT-1", to: "CLOSING", label: "recv FIN / send ACK", anomalous: true },
  { from: "FIN-WAIT-2", to: "TIME-WAIT", label: "recv FIN / send ACK" },
  { from: "CLOSING", to: "TIME-WAIT", label: "recv ACK", anomalous: true },
  { from: "CLOSE-WAIT", to: "LAST-ACK", label: "close / send FIN" },
  { from: "LAST-ACK", to: "CLOSED", label: "recv ACK" },
  { from: "TIME-WAIT", to: "CLOSED", label: "timeout (2·MSL)" },
];

type EventBtn = {
  id: string;
  label: string;
  side: Side;
  /** Map from current state → new state (only fires if current matches). */
  transitions: Partial<Record<State, State>>;
  note?: string;
};

const EVENTS: EventBtn[] = [
  // Client side
  {
    id: "c-active-open",
    label: "1. Active open (send SYN)",
    side: "client",
    transitions: { CLOSED: "SYN-SENT" },
  },
  {
    id: "c-recv-synack",
    label: "2. Recv SYN+ACK (send ACK)",
    side: "client",
    transitions: { "SYN-SENT": "ESTABLISHED" },
  },
  {
    id: "c-close",
    label: "3. Close (send FIN)",
    side: "client",
    transitions: {
      ESTABLISHED: "FIN-WAIT-1",
      "CLOSE-WAIT": "LAST-ACK",
    },
  },
  {
    id: "c-recv-ack",
    label: "4. Recv ACK for FIN",
    side: "client",
    transitions: {
      "FIN-WAIT-1": "FIN-WAIT-2",
      "LAST-ACK": "CLOSED",
      CLOSING: "TIME-WAIT",
    },
  },
  {
    id: "c-recv-fin",
    label: "5. Recv FIN (send ACK)",
    side: "client",
    transitions: {
      "FIN-WAIT-2": "TIME-WAIT",
      "FIN-WAIT-1": "CLOSING",
      ESTABLISHED: "CLOSE-WAIT",
    },
  },
  {
    id: "c-timeout",
    label: "6. 2·MSL timeout",
    side: "client",
    transitions: { "TIME-WAIT": "CLOSED" },
  },
  // Server side
  {
    id: "s-passive-open",
    label: "1. Passive open (listen)",
    side: "server",
    transitions: { CLOSED: "LISTEN" },
  },
  {
    id: "s-recv-syn",
    label: "2. Recv SYN (send SYN+ACK)",
    side: "server",
    transitions: { LISTEN: "SYN-RECEIVED" },
  },
  {
    id: "s-recv-ack",
    label: "3. Recv ACK",
    side: "server",
    transitions: {
      "SYN-RECEIVED": "ESTABLISHED",
      "LAST-ACK": "CLOSED",
    },
  },
  {
    id: "s-recv-fin",
    label: "4. Recv FIN (send ACK)",
    side: "server",
    transitions: { ESTABLISHED: "CLOSE-WAIT" },
  },
  {
    id: "s-close",
    label: "5. Close (send FIN)",
    side: "server",
    transitions: { "CLOSE-WAIT": "LAST-ACK" },
  },
];

// Build adjacency for highlighting reachable next-states
function nextStates(state: State): { state: State; anomalous: boolean }[] {
  return EDGES.filter((e) => e.from === state).map((e) => ({
    state: e.to,
    anomalous: !!e.anomalous,
  }));
}

function StateNode({
  state,
  isActive,
  isReachable,
  isAnomalousReachable,
}: {
  state: State;
  isActive: boolean;
  isReachable: boolean;
  isAnomalousReachable: boolean;
}) {
  const { x, y } = STATE_POS[state];
  const sides = STATE_SIDE[state];
  const isClient = sides.includes("client");
  const isServer = sides.includes("server");

  // Color stack: active > anomalous-reachable > reachable > normal
  let stroke = "var(--border)";
  let fill = "var(--card)";
  let textFill = "var(--foreground)";
  let strokeWidth = 1.5;

  if (isActive) {
    stroke = "var(--brand)";
    fill = "color-mix(in oklab, var(--brand) 18%, var(--card))";
    strokeWidth = 2.5;
  } else if (isAnomalousReachable) {
    stroke = "#ef4444";
    fill = "color-mix(in oklab, #ef4444 12%, var(--card))";
    strokeWidth = 2;
  } else if (isReachable) {
    stroke = "#22c55e";
    fill = "color-mix(in oklab, #22c55e 10%, var(--card))";
    strokeWidth = 2;
  }

  // Show small side-pills.
  return (
    <g transform={`translate(${x},${y})`}>
      <rect
        x={-58}
        y={-18}
        width={116}
        height={36}
        rx={8}
        ry={8}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <text
        x={0}
        y={4}
        textAnchor="middle"
        fontFamily="ui-monospace, monospace"
        fontSize={11}
        fontWeight={600}
        fill={textFill}
      >
        {state}
      </text>
      <g transform="translate(-50, -28)">
        {isClient && (
          <g>
            <circle r={4} cx={0} cy={0} fill="#3b82f6" />
            <text
              x={7}
              y={3}
              fontSize={8}
              fill="var(--muted-foreground)"
              fontFamily="ui-monospace, monospace"
            >
              K
            </text>
          </g>
        )}
        {isServer && (
          <g transform="translate(22, 0)">
            <circle r={4} cx={0} cy={0} fill="#a855f7" />
            <text
              x={7}
              y={3}
              fontSize={8}
              fill="var(--muted-foreground)"
              fontFamily="ui-monospace, monospace"
            >
              S
            </text>
          </g>
        )}
      </g>
    </g>
  );
}

/** Compute path for an edge between two state positions. */
function edgePath(from: Pos, to: Pos): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  // shrink endpoints so arrowheads land at the rect edge (≈ 58 wide x 18 tall)
  // approximate: pull back ~38 units from center
  const pullback = 32;
  const sx = from.x + (dx / len) * pullback;
  const sy = from.y + (dy / len) * pullback;
  const ex = to.x - (dx / len) * pullback;
  const ey = to.y - (dy / len) * pullback;
  // Slight curve to avoid overlap on bidirectional pairs.
  const mx = (sx + ex) / 2 + dy * 0.04;
  const my = (sy + ey) / 2 - dx * 0.04;
  return `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`;
}

function ColumnView({
  side,
  state,
  history,
}: {
  side: Side;
  state: State;
  history: State[];
}) {
  const color = side === "client" ? "#3b82f6" : "#a855f7";
  const title = side === "client" ? "Klient (active open)" : "Server (passive open)";
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <h4 className="font-semibold text-sm">{title}</h4>
      </div>
      <div className="rounded-lg border-2 border-brand/40 bg-brand/5 px-3 py-2 font-mono text-sm font-semibold text-center">
        {state}
      </div>
      {history.length > 0 && (
        <div className="mt-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Historikk
          </div>
          <div className="space-y-1">
            {history.map((s, i) => (
              <div
                key={i}
                className="font-mono text-[11px] text-muted-foreground flex items-center gap-1.5"
              >
                <span className="text-muted-foreground/60">{i + 1}.</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TcpStateMachine() {
  const [clientState, setClientState] = useState<State>("CLOSED");
  const [serverState, setServerState] = useState<State>("CLOSED");
  const [clientHist, setClientHist] = useState<State[]>([]);
  const [serverHist, setServerHist] = useState<State[]>([]);
  const [lastEvent, setLastEvent] = useState<string>("");
  const [hoveredState, setHoveredState] = useState<State | null>(null);

  function fire(ev: EventBtn) {
    if (ev.side === "client") {
      const next = ev.transitions[clientState];
      if (next) {
        setClientHist((h) => [...h, clientState]);
        setClientState(next);
        setLastEvent(`Klient: ${ev.label} → ${next}`);
      } else {
        setLastEvent(`Klient er i ${clientState} — ${ev.label} ignoreres her`);
      }
    } else {
      const next = ev.transitions[serverState];
      if (next) {
        setServerHist((h) => [...h, serverState]);
        setServerState(next);
        setLastEvent(`Server: ${ev.label} → ${next}`);
      } else {
        setLastEvent(`Server er i ${serverState} — ${ev.label} ignoreres her`);
      }
    }
  }

  function reset() {
    setClientState("CLOSED");
    setServerState("CLOSED");
    setClientHist([]);
    setServerHist([]);
    setLastEvent("Tilstand nullstilt");
  }

  function scenarioOpen() {
    reset();
    // Run a full open scenario step by step (state updates batched is fine —
    // the diagram shows current snapshot anyway, history records last state).
    setServerHist(["CLOSED"]);
    setServerState("LISTEN");
    setClientHist(["CLOSED", "SYN-SENT", "SYN-SENT", "ESTABLISHED"]);
    setServerHist((h) => [...h, "LISTEN", "SYN-RECEIVED", "SYN-RECEIVED"]);
    setClientState("ESTABLISHED");
    setServerState("ESTABLISHED");
    setLastEvent("Scenario kjørt: full 3-veis handshake");
  }

  function scenarioClose() {
    // Assume already ESTABLISHED on both, run close.
    setClientHist(["CLOSED", "SYN-SENT", "ESTABLISHED", "FIN-WAIT-1", "FIN-WAIT-2"]);
    setServerHist(["CLOSED", "LISTEN", "SYN-RECEIVED", "ESTABLISHED", "CLOSE-WAIT"]);
    setClientState("TIME-WAIT");
    setServerState("LAST-ACK");
    setLastEvent("Scenario kjørt: klient initierer 4-veis close");
  }

  // Determine what states are reachable from current focus (for graph highlight)
  const focusState = hoveredState ?? clientState;
  const reachable = new Set(nextStates(focusState).map((n) => n.state));
  const anomalousReachable = new Set(
    nextStates(focusState)
      .filter((n) => n.anomalous)
      .map((n) => n.state),
  );

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Network className="h-4 w-4 text-brand" />
            TCP-tilstandsmaskinen
          </h3>
          <div className="flex gap-2">
            <button
              onClick={scenarioOpen}
              className="rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:bg-muted"
            >
              Scenario: Open
            </button>
            <button
              onClick={scenarioClose}
              className="rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:bg-muted"
            >
              Scenario: Close
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:bg-muted"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-4">
          {/* SVG state diagram */}
          <div className="rounded-lg border border-border bg-background overflow-hidden">
            <svg
              viewBox="0 0 460 720"
              className="w-full h-auto"
              role="img"
              aria-label="TCP state diagram"
              style={{ maxHeight: 620 }}
            >
              <defs>
                <marker
                  id="tcp-arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted-foreground)" />
                </marker>
                <marker
                  id="tcp-arrow-red"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                </marker>
                <marker
                  id="tcp-arrow-green"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
                </marker>
              </defs>

              {/* Edges */}
              {EDGES.map((e, i) => {
                const from = STATE_POS[e.from];
                const to = STATE_POS[e.to];
                const isReachableEdge =
                  e.from === focusState && reachable.has(e.to);
                const stroke = e.anomalous
                  ? isReachableEdge
                    ? "#ef4444"
                    : "rgba(239,68,68,0.45)"
                  : isReachableEdge
                    ? "#22c55e"
                    : "var(--muted-foreground)";
                const opacity = isReachableEdge ? 1 : e.anomalous ? 0.65 : 0.45;
                const marker = e.anomalous
                  ? isReachableEdge
                    ? "url(#tcp-arrow-red)"
                    : "url(#tcp-arrow-red)"
                  : isReachableEdge
                    ? "url(#tcp-arrow-green)"
                    : "url(#tcp-arrow)";
                return (
                  <g key={i} opacity={opacity}>
                    <path
                      d={edgePath(from, to)}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={isReachableEdge ? 2 : 1.2}
                      strokeDasharray={e.anomalous ? "4 3" : undefined}
                      markerEnd={marker}
                    />
                  </g>
                );
              })}

              {/* Nodes */}
              {(Object.keys(STATE_POS) as State[]).map((s) => (
                <g
                  key={s}
                  onMouseEnter={() => setHoveredState(s)}
                  onMouseLeave={() => setHoveredState(null)}
                  style={{ cursor: "pointer" }}
                >
                  <StateNode
                    state={s}
                    isActive={s === clientState || s === serverState}
                    isReachable={reachable.has(s)}
                    isAnomalousReachable={anomalousReachable.has(s)}
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* Sidebar: parallel client/server */}
          <div className="space-y-3">
            <ColumnView side="client" state={clientState} history={clientHist} />
            <ColumnView side="server" state={serverState} history={serverHist} />
            {lastEvent && (
              <div className="rounded-lg border border-border bg-background p-2 text-xs">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                  Siste event
                </div>
                {lastEvent}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 grid sm:grid-cols-3 gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-brand" />
            <span>Aktiv tilstand</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
            <span>Normal neste tilstand</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
            <span>Unormal overgang (simultanåpning/close)</span>
          </div>
        </div>
      </div>

      {/* Event buttons */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
            Events på klienten
          </div>
          <div className="flex flex-col gap-1.5">
            {EVENTS.filter((e) => e.side === "client").map((e) => {
              const enabled = clientState in e.transitions;
              return (
                <button
                  key={e.id}
                  onClick={() => fire(e)}
                  disabled={!enabled}
                  className={`text-left rounded-md border px-3 py-1.5 text-xs transition-colors ${
                    enabled
                      ? "border-border bg-background hover:bg-muted"
                      : "border-border/40 bg-background/30 text-muted-foreground/50 cursor-not-allowed"
                  }`}
                >
                  {e.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-500" />
            Events på serveren
          </div>
          <div className="flex flex-col gap-1.5">
            {EVENTS.filter((e) => e.side === "server").map((e) => {
              const enabled = serverState in e.transitions;
              return (
                <button
                  key={e.id}
                  onClick={() => fire(e)}
                  disabled={!enabled}
                  className={`text-left rounded-md border px-3 py-1.5 text-xs transition-colors ${
                    enabled
                      ? "border-border bg-background hover:bg-muted"
                      : "border-border/40 bg-background/30 text-muted-foreground/50 cursor-not-allowed"
                  }`}
                >
                  {e.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Half-open table */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Halvåpne tilstander — én side har stengt, andre ikke
        </h4>
        <p className="text-xs text-muted-foreground mb-3">
          TCP er full-duplex, så hver side kan stenge sin egen retning
          uavhengig. Det betyr at det finnes flere mellom-tilstander der den
          ene siden har sendt FIN men den andre fortsatt sender data.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left font-semibold px-3 py-2">Tilstand</th>
                <th className="text-left font-semibold px-3 py-2">Side</th>
                <th className="text-left font-semibold px-3 py-2">Mening</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-mono">FIN-WAIT-1</td>
                <td className="px-3 py-2 text-blue-600 dark:text-blue-400">klient</td>
                <td className="px-3 py-2 text-muted-foreground">
                  Klient har sendt FIN, venter på ACK eller motsatt FIN.
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-mono">FIN-WAIT-2</td>
                <td className="px-3 py-2 text-blue-600 dark:text-blue-400">klient</td>
                <td className="px-3 py-2 text-muted-foreground">
                  Klient har fått ACK på FIN. Venter på server-FIN. Halv-stengt.
                </td>
              </tr>
              <tr className="border-t border-border bg-amber-500/5">
                <td className="px-3 py-2 font-mono font-semibold">CLOSE-WAIT</td>
                <td className="px-3 py-2 text-purple-600 dark:text-purple-400">server</td>
                <td className="px-3 py-2 text-muted-foreground">
                  Server har fått klient-FIN, men har ikke kalt <code>close()</code> ennå.
                  «Lekker» CLOSE-WAIT-sockets indikerer ofte at applikasjonen
                  glemmer å lukke.
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-mono">LAST-ACK</td>
                <td className="px-3 py-2 text-purple-600 dark:text-purple-400">server</td>
                <td className="px-3 py-2 text-muted-foreground">
                  Server har sendt sitt FIN, venter på endelig ACK.
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-mono">TIME-WAIT</td>
                <td className="px-3 py-2 text-blue-600 dark:text-blue-400">klient</td>
                <td className="px-3 py-2 text-muted-foreground">
                  Klient har sendt siste ACK. Venter 2·MSL (~60s) før full
                  CLOSE — hindrer at gamle pakker bland-i med en ny forbindelse.
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-mono">CLOSING</td>
                <td className="px-3 py-2 text-blue-600 dark:text-blue-400">klient</td>
                <td className="px-3 py-2 text-muted-foreground">
                  Sjelden: simultanlukking — begge sider sender FIN samtidig.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
