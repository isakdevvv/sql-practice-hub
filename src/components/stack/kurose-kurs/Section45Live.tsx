import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Globe, Home, Send } from "lucide-react";

// Section45Live — NAT-traversal simulator.
//
// Pedagogisk poeng (Kurose 4.5):
//   - En NAT-boks oversetter (privat-IP, privat-port) ↔ (offentlig-IP, offentlig-port).
//   - Hver utgående tilkobling opprettes en rad i oversettelses-tabellen.
//   - Returnerende pakker matches mot tabellen og oversettes tilbake til privat-IP.
//   - Innkommende pakker UTEN match-rad dropper — det er hvorfor P2P er vanskelig.
//
// Vi viser en privat-LAN, en NAT-ruter, og to eksterne tjenere. Bruker kan trigge
// pakker og se hvordan tabellen vokser, hvordan oversettinger skjer, og hvordan
// uventede innkommende pakker droppes.

type Direction = "out" | "in"; // out = LAN→Internett; in = Internett→LAN

type NatEntry = {
  id: string;
  privIp: string;
  privPort: number;
  pubIp: string; // alltid samme — NAT-boksens eneste offentlige IP
  pubPort: number;
  dstIp: string;
  dstPort: number;
  proto: string;
  createdAt: number; // step-nummer
  lastUsed: number;
};

type LogEntry = {
  step: number;
  kind: "create" | "translate-out" | "translate-in" | "drop" | "match-fail";
  text: string;
  color: string;
};

type Host = {
  id: string;
  ip: string;
  label: string;
  side: "lan" | "internet";
  x: number;
  y: number;
};

const HOSTS: Host[] = [
  { id: "alice", ip: "192.168.1.10", label: "Alice", side: "lan", x: 60, y: 60 },
  { id: "bob", ip: "192.168.1.11", label: "Bob", side: "lan", x: 60, y: 160 },
  { id: "google", ip: "172.217.16.78", label: "Google", side: "internet", x: 520, y: 60 },
  { id: "vg", ip: "151.101.65.69", label: "VG", side: "internet", x: 520, y: 160 },
  { id: "peer", ip: "203.0.113.42", label: "P2P-peer", side: "internet", x: 520, y: 240 },
];

const NAT_PUB_IP = "85.150.5.1"; // NAT-boksens eneste offentlige IP

type ScenarioPacket = {
  id: string;
  from: string; // host id
  to: string; // host id
  srcPort: number;
  dstPort: number;
  proto: string;
  beskrivelse: string;
};

const SCENARIO: ScenarioPacket[] = [
  {
    id: "s1",
    from: "alice",
    to: "google",
    srcPort: 49152,
    dstPort: 443,
    proto: "TCP",
    beskrivelse: "Alice åpner HTTPS-tilkobling til Google",
  },
  {
    id: "s2",
    from: "google",
    to: "alice", // i Internetts øyne: til NAT_PUB_IP, men retur-pakken
    srcPort: 443,
    dstPort: 49152, // dette er Alices privat-port; Internett ser pub-port
    proto: "TCP",
    beskrivelse: "Google svarer på Alice' HTTPS-økt",
  },
  {
    id: "s3",
    from: "bob",
    to: "vg",
    srcPort: 49152,
    dstPort: 443,
    proto: "TCP",
    beskrivelse: "Bob åpner VG (samme privat-port som Alice — NAT må skille)",
  },
  {
    id: "s4",
    from: "vg",
    to: "bob",
    srcPort: 443,
    dstPort: 49152,
    proto: "TCP",
    beskrivelse: "VG svarer Bob",
  },
  {
    id: "s5",
    from: "peer",
    to: "alice",
    srcPort: 60001,
    dstPort: 50000,
    proto: "TCP",
    beskrivelse: "Uventet pakke utenfra prøver å nå Alice — ingen matchende rad",
  },
];

// ============================================================
// Simulator
// ============================================================

type SimState = {
  table: NatEntry[];
  log: LogEntry[];
  // Pub-port-poolen vi allokerer fra
  nextPubPort: number;
  // Pakker som "krysser NAT-en akkurat nå" — for tegning
  inFlight: { pkt: ScenarioPacket; phase: "lan" | "nat" | "internet"; mutated?: { srcIp?: string; srcPort?: number; dstIp?: string; dstPort?: number } } | null;
};

function newSim(): SimState {
  return { table: [], log: [], nextPubPort: 50000, inFlight: null };
}

function findHost(id: string): Host {
  const h = HOSTS.find((h) => h.id === id);
  if (!h) throw new Error("host?");
  return h;
}

function step(state: SimState, pkt: ScenarioPacket, stepNo: number): SimState {
  const from = findHost(pkt.from);
  const to = findHost(pkt.to);
  const isOutbound = from.side === "lan";
  const newState: SimState = {
    ...state,
    table: state.table.map((e) => ({ ...e })),
    log: state.log.slice(),
  };

  if (isOutbound) {
    // Sjekk om det allerede er en rad for (privIp, privPort, dstIp, dstPort, proto)
    let entry = newState.table.find(
      (e) =>
        e.privIp === from.ip &&
        e.privPort === pkt.srcPort &&
        e.dstIp === to.ip &&
        e.dstPort === pkt.dstPort &&
        e.proto === pkt.proto,
    );
    if (!entry) {
      // Allocate pub-port
      const pubPort = newState.nextPubPort++;
      entry = {
        id: `e${newState.table.length + 1}`,
        privIp: from.ip,
        privPort: pkt.srcPort,
        pubIp: NAT_PUB_IP,
        pubPort,
        dstIp: to.ip,
        dstPort: pkt.dstPort,
        proto: pkt.proto,
        createdAt: stepNo,
        lastUsed: stepNo,
      };
      newState.table.push(entry);
      newState.log.push({
        step: stepNo,
        kind: "create",
        text: `Ny NAT-rad: ${from.ip}:${pkt.srcPort} ↔ ${NAT_PUB_IP}:${pubPort} → ${to.ip}:${pkt.dstPort}`,
        color: "#10b981",
      });
    } else {
      entry.lastUsed = stepNo;
    }
    newState.log.push({
      step: stepNo,
      kind: "translate-out",
      text: `Utgående: src ${from.ip}:${pkt.srcPort} → ${NAT_PUB_IP}:${entry.pubPort} (dst ${to.ip}:${pkt.dstPort} uendret)`,
      color: "#3b82f6",
    });
    newState.inFlight = {
      pkt,
      phase: "internet",
      mutated: { srcIp: NAT_PUB_IP, srcPort: entry.pubPort },
    };
  } else {
    // Innkommende pakke fra Internett. Pakken er adressert til NAT_PUB_IP:somePubPort.
    // Vi simulerer Internetts perspektiv: srcPort = ext-port, dstPort = en pub-port på NAT.
    // For SCENARIOet vårt: pkt.from = ekstern, pkt.to = den private hosten vi MENER pakken er ment for.
    // Real-world: innkommende pakke har dst = NAT_PUB_IP, og en pub-port. Vi må finne raden hvor
    // pubPort = pkt.dstPort, eller velge en rad knyttet til mottakeren.
    // Vi forenkler: dst-pub-port på en innkommende returner-pakke = entry.pubPort for raden Alice opprettet.
    const entry = newState.table.find(
      (e) =>
        e.dstIp === from.ip &&
        e.dstPort === pkt.srcPort &&
        e.privIp === to.ip &&
        e.proto === pkt.proto,
    );
    if (entry) {
      entry.lastUsed = stepNo;
      newState.log.push({
        step: stepNo,
        kind: "translate-in",
        text: `Innkommende: dst ${NAT_PUB_IP}:${entry.pubPort} → ${entry.privIp}:${entry.privPort} (src ${from.ip}:${pkt.srcPort} uendret)`,
        color: "#a855f7",
      });
      newState.inFlight = {
        pkt,
        phase: "lan",
        mutated: { dstIp: entry.privIp, dstPort: entry.privPort },
      };
    } else {
      newState.log.push({
        step: stepNo,
        kind: "drop",
        text: `DROP: pakke fra ${from.ip}:${pkt.srcPort} til ${NAT_PUB_IP} har ingen matchende rad — NAT-en blokkerer.`,
        color: "#ef4444",
      });
      newState.inFlight = { pkt, phase: "nat", mutated: { dstIp: NAT_PUB_IP } };
    }
  }
  return newState;
}

// ============================================================
// SVG-visualisering
// ============================================================

const W = 600;
const H = 320;
const NAT_X = 300;
const NAT_W = 110;
const NAT_Y = 100;
const NAT_H = 120;

function HostBox({ host }: { host: Host }) {
  const Icon = host.side === "lan" ? Home : Globe;
  return (
    <g transform={`translate(${host.x},${host.y})`}>
      <rect
        x={-40}
        y={-20}
        width={80}
        height={40}
        rx={6}
        className={
          host.side === "lan"
            ? "fill-blue-500/15 stroke-blue-400"
            : "fill-emerald-500/15 stroke-emerald-400"
        }
        strokeWidth={1.5}
      />
      <foreignObject x={-38} y={-18} width={20} height={20}>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </foreignObject>
      <text x={0} y={-3} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        {host.label}
      </text>
      <text x={0} y={12} textAnchor="middle" className="fill-muted-foreground text-[9px] font-mono">
        {host.ip}
      </text>
    </g>
  );
}

function PacketSVG({
  fromX,
  fromY,
  toX,
  toY,
  progress,
  color,
  label,
}: {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;
  color: string;
  label: string;
}) {
  const x = fromX + (toX - fromX) * progress;
  const y = fromY + (toY - fromY) * progress;
  return (
    <g>
      <line
        x1={fromX}
        y1={fromY}
        x2={toX}
        y2={toY}
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="3 3"
        opacity={0.5}
      />
      <circle cx={x} cy={y} r={9} fill={color} stroke="white" strokeWidth={1.5} />
      <text x={x} y={y + 3} textAnchor="middle" className="fill-white text-[8px] font-bold">
        {label}
      </text>
    </g>
  );
}

// ============================================================
// Hovedkomponent
// ============================================================

export function Section45Live() {
  const [sim, setSim] = useState<SimState>(() => newSim());
  const [stepIdx, setStepIdx] = useState(0); // hvilket scenario-element neste
  const [progress, setProgress] = useState(0); // 0..1 for pakke-anim
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);

  const currentPkt = stepIdx > 0 ? SCENARIO[stepIdx - 1] : null;

  // Anim-loop: når playing er sant, animér gjeldende pakke fra src til dst.
  useEffect(() => {
    if (!playing) return;
    // Hvis vi ikke har en currentPkt enda (stepIdx=0), step én gang først.
    if (stepIdx === 0) {
      stepForward();
      return;
    }
    if (stepIdx > SCENARIO.length) {
      setPlaying(false);
      return;
    }
    const start = performance.now();
    const DUR = 1500;
    const loop = (now: number) => {
      const p = Math.min(1, (now - start) / DUR);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        // Animasjonen for denne pakken er ferdig — vent litt og gå videre
        setTimeout(() => {
          if (stepIdx < SCENARIO.length) {
            stepForward();
            setProgress(0);
          } else {
            setPlaying(false);
          }
        }, 500);
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, stepIdx]);

  const stepForward = () => {
    if (stepIdx >= SCENARIO.length) return;
    const next = SCENARIO[stepIdx];
    setSim((s) => step(s, next, stepIdx + 1));
    setStepIdx((i) => i + 1);
  };

  const reset = () => {
    setSim(newSim());
    setStepIdx(0);
    setProgress(0);
    setPlaying(false);
  };

  // Tegnings-koordinater for pakken
  let packetView: React.ReactNode = null;
  if (currentPkt && progress > 0) {
    const from = findHost(currentPkt.from);
    const to = findHost(currentPkt.to);
    const natCenterX = NAT_X + NAT_W / 2;
    const natCenterY = NAT_Y + NAT_H / 2;

    const isOutbound = from.side === "lan";
    const dropped =
      sim.inFlight?.pkt.id === currentPkt.id && !isOutbound && sim.inFlight.phase === "nat";

    // To-segmenters anim: src → NAT (0..0.5), så NAT → dst (0.5..1)
    if (progress < 0.5) {
      const segP = progress / 0.5;
      const labelMid = isOutbound
        ? `${currentPkt.proto.slice(0, 1)}`
        : `${currentPkt.proto.slice(0, 1)}`;
      packetView = (
        <PacketSVG
          fromX={from.x}
          fromY={from.y}
          toX={natCenterX}
          toY={natCenterY}
          progress={segP}
          color={isOutbound ? "#3b82f6" : "#f59e0b"}
          label={labelMid}
        />
      );
    } else {
      const segP = (progress - 0.5) / 0.5;
      if (dropped) {
        // Pakken stopper inne i NAT med rød X
        packetView = (
          <g>
            <circle cx={natCenterX} cy={natCenterY} r={12} fill="#ef4444" stroke="white" strokeWidth={1.5} />
            <text x={natCenterX} y={natCenterY + 4} textAnchor="middle" className="fill-white text-[10px] font-bold">
              ✗
            </text>
            <text x={natCenterX} y={natCenterY + 28} textAnchor="middle" className="fill-red-600 text-[9px] font-bold">
              DROP
            </text>
          </g>
        );
      } else {
        const labelMid = isOutbound ? "T" : "T"; // T for "translated"
        packetView = (
          <PacketSVG
            fromX={natCenterX}
            fromY={natCenterY}
            toX={to.x}
            toY={to.y}
            progress={segP}
            color={isOutbound ? "#10b981" : "#a855f7"}
            label={labelMid}
          />
        );
      }
    }
  }

  // Hvilken NAT-rad er involvert akkurat nå?
  const activeEntryId =
    currentPkt && progress > 0
      ? (() => {
          const from = findHost(currentPkt.from);
          const to = findHost(currentPkt.to);
          if (from.side === "lan") {
            return sim.table.find(
              (e) =>
                e.privIp === from.ip &&
                e.privPort === currentPkt.srcPort &&
                e.dstIp === to.ip &&
                e.dstPort === currentPkt.dstPort,
            )?.id;
          } else {
            return sim.table.find(
              (e) =>
                e.dstIp === from.ip &&
                e.dstPort === currentPkt.srcPort &&
                e.privIp === to.ip,
            )?.id;
          }
        })()
      : null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <Send className="h-3.5 w-3.5 text-blue-500" />
        <span className="font-medium text-foreground">
          NAT — connection-tracking i praksis
        </span>
        <span className="ml-auto font-mono">
          Pakke {stepIdx} / {SCENARIO.length}
        </span>
      </div>

      <div className="grid gap-3 p-3 md:grid-cols-[3fr_2fr]">
        {/* Venstre: nettverks-SVG */}
        <div className="rounded-lg border border-border bg-muted/10 overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {/* LAN-bakgrunn */}
            <rect
              x={20}
              y={10}
              width={NAT_X - 30}
              height={H - 20}
              rx={8}
              className="fill-blue-500/5 stroke-blue-500/30"
              strokeDasharray="4 3"
              strokeWidth={1}
            />
            <text x={30} y={28} className="fill-blue-700 dark:fill-blue-300 text-[9px] uppercase font-bold tracking-wider">
              Privat LAN · 192.168.1.0/24
            </text>
            {/* Internet-bakgrunn */}
            <rect
              x={NAT_X + NAT_W + 10}
              y={10}
              width={W - (NAT_X + NAT_W + 30)}
              height={H - 20}
              rx={8}
              className="fill-emerald-500/5 stroke-emerald-500/30"
              strokeDasharray="4 3"
              strokeWidth={1}
            />
            <text
              x={NAT_X + NAT_W + 22}
              y={28}
              className="fill-emerald-700 dark:fill-emerald-300 text-[9px] uppercase font-bold tracking-wider"
            >
              Internett
            </text>

            {/* NAT-boks */}
            <rect
              x={NAT_X}
              y={NAT_Y}
              width={NAT_W}
              height={NAT_H}
              rx={8}
              className="fill-amber-500/15 stroke-amber-500"
              strokeWidth={2}
            />
            <text
              x={NAT_X + NAT_W / 2}
              y={NAT_Y + 18}
              textAnchor="middle"
              className="fill-foreground text-[11px] font-bold"
            >
              NAT-ruter
            </text>
            <text
              x={NAT_X + NAT_W / 2}
              y={NAT_Y + 32}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px] font-mono"
            >
              {NAT_PUB_IP}
            </text>
            <text
              x={NAT_X + NAT_W / 2}
              y={NAT_Y + NAT_H - 8}
              textAnchor="middle"
              className="fill-muted-foreground text-[8px]"
            >
              {sim.table.length} rad{sim.table.length === 1 ? "" : "er"} i tabellen
            </text>

            {/* Faste linjer fra LAN-hosts til NAT */}
            {HOSTS.filter((h) => h.side === "lan").map((h) => (
              <line
                key={`l-${h.id}`}
                x1={h.x + 40}
                y1={h.y}
                x2={NAT_X}
                y2={NAT_Y + NAT_H / 2}
                className="stroke-blue-400/30"
                strokeWidth={1}
              />
            ))}
            {HOSTS.filter((h) => h.side === "internet").map((h) => (
              <line
                key={`l-${h.id}`}
                x1={NAT_X + NAT_W}
                y1={NAT_Y + NAT_H / 2}
                x2={h.x - 40}
                y2={h.y}
                className="stroke-emerald-400/30"
                strokeWidth={1}
              />
            ))}

            {/* Hosts */}
            {HOSTS.map((h) => (
              <HostBox key={h.id} host={h} />
            ))}

            {/* Aktiv pakke */}
            {packetView}
          </svg>
        </div>

        {/* Høyre: NAT-tabell og logg */}
        <div className="space-y-2">
          {/* Tabell */}
          <div className="rounded-lg border border-border bg-muted/10">
            <div className="px-2.5 py-1.5 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
              NAT oversettelsestabell
            </div>
            {sim.table.length === 0 ? (
              <div className="p-3 text-[11px] text-muted-foreground italic text-center">
                Tabellen er tom — ingen utgående tilkoblinger enda.
              </div>
            ) : (
              <table className="w-full text-[10px] font-mono">
                <thead>
                  <tr className="text-[9px] uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="text-left px-2 py-1">Privat</th>
                    <th className="text-left px-2 py-1">Pub</th>
                    <th className="text-left px-2 py-1">Mot</th>
                  </tr>
                </thead>
                <tbody>
                  {sim.table.map((e) => (
                    <tr
                      key={e.id}
                      className={`border-b border-border/40 ${
                        e.id === activeEntryId ? "bg-amber-500/20" : ""
                      }`}
                    >
                      <td className="px-2 py-1">
                        {e.privIp}:{e.privPort}
                      </td>
                      <td className="px-2 py-1 text-foreground">
                        {e.pubIp}:{e.pubPort}
                      </td>
                      <td className="px-2 py-1 text-muted-foreground">
                        {e.dstIp}:{e.dstPort}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pakke-beskrivelse */}
          {currentPkt && (
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-2 text-[11px]">
              <div className="text-[9px] uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-0.5">
                Pakke i bevegelse
              </div>
              <div className="text-muted-foreground">{currentPkt.beskrivelse}</div>
              <div className="font-mono text-[10px] mt-1 text-foreground">
                {findHost(currentPkt.from).ip}:{currentPkt.srcPort} → {findHost(currentPkt.to).ip}:
                {currentPkt.dstPort} | {currentPkt.proto}
              </div>
            </div>
          )}

          {/* Logg */}
          <div className="rounded-lg border border-border bg-muted/10 max-h-44 overflow-y-auto">
            <div className="px-2.5 py-1 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground sticky top-0 bg-muted">
              Hendelser
            </div>
            <ul className="divide-y divide-border/40">
              {sim.log.slice().reverse().map((l, i) => (
                <li key={i} className="px-2.5 py-1 text-[10px] flex gap-1.5">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full mt-1 shrink-0"
                    style={{ background: l.color }}
                  />
                  <div>
                    <span className="font-mono text-muted-foreground">[{l.step}] </span>
                    <span className="text-foreground">{l.text}</span>
                  </div>
                </li>
              ))}
              {sim.log.length === 0 && (
                <li className="px-2.5 py-2 text-[10px] text-muted-foreground italic">
                  Ingen hendelser enda.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Kontroller */}
      <div className="px-4 py-2 flex items-center gap-1.5 border-t border-border bg-muted/20">
        <button
          onClick={() => {
            if (playing) setPlaying(false);
            else {
              if (stepIdx >= SCENARIO.length) reset();
              setPlaying(true);
            }
          }}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "Pause" : stepIdx >= SCENARIO.length ? "Spill av igjen" : "Spill av"}
        </button>
        <button
          onClick={() => {
            if (stepIdx >= SCENARIO.length) return;
            stepForward();
            setProgress(1); // hopp til ferdig
          }}
          disabled={stepIdx >= SCENARIO.length}
          className="rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
        >
          Neste pakke →
        </button>
        <button
          onClick={reset}
          className="ml-auto inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Forklaring */}
      <div className="px-4 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
        <div className="font-semibold text-foreground mb-1">Hva ble bevist?</div>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>
            Alle utgående pakker oppretter (eller gjenbruker) en rad. <code>privPort</code> og{" "}
            <code>pubPort</code> trenger ikke være like — NAT-en kan velge fritt.
          </li>
          <li>
            Alice og Bob brukte samme privat-port (49152), men NAT-en ga dem forskjellige
            pub-porter — slik kan returretur-pakker entydig matches.
          </li>
          <li>
            Returnerende pakker matches mot tabellen og oversettes til den private IP-en.
          </li>
          <li>
            Den siste pakken (P2P-peer → Alice) ble droppet fordi det ikke fantes en rad —
            <strong> derfor er innkommende tilkoblinger fra Internett til en NAT-ed host
            vanskelig.</strong> Det er kjernen i NAT-traversal-problemet (STUN, TURN, hole punching).
          </li>
        </ul>
      </div>
    </div>
  );
}
