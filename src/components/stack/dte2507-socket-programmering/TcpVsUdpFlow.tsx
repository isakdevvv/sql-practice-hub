import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

// TcpVsUdpFlow — samme melding ("DATA1..DATA6") sendes via TCP og UDP
// parallelt. Vi simulerer en lossy/jittery kanal og viser:
//   - TCP: rekkefølge bevart, taps-pakker retransmitteres, ACK-strøm
//   - UDP: fire-and-forget, tap er tap, rekkefølgen kan endres
// Pure SVG.

type PktState = "sent" | "in_flight" | "lost" | "delivered" | "retx" | "acked";

interface Pkt {
  seq: number;
  state: PktState;
  // Posisjon langs kanalen 0..1 (0 = avsender, 1 = mottaker)
  pos: number;
  // For UDP: lokal jitter (forskjellige hastigheter)
  speed: number;
}

const N_PKTS = 6;
const LOSS_SEEDS_TCP = [false, false, true, false, true, false]; // pkt 3 og 5 mistes første gang
const LOSS_SEEDS_UDP = [false, false, true, false, true, false]; // samme tapsmønster
const JITTER_UDP = [1.0, 0.9, 1.1, 0.7, 1.3, 0.95];

const W = 540;
const H = 380;

export function TcpVsUdpFlow() {
  const [running, setRunning] = useState(false);
  const [t, setT] = useState(0); // tick (60 ms per)
  const [tcp, setTcp] = useState<Pkt[]>(() => initTcp());
  const [udp, setUdp] = useState<Pkt[]>(() => initUdp());
  const [tcpAcks, setTcpAcks] = useState<number[]>([]); // received in order
  const [udpReceived, setUdpReceived] = useState<{ seq: number; arrivedAt: number }[]>([]);
  const [tcpRetxCount, setTcpRetxCount] = useState(0);
  const tickRef = useRef<number | null>(null);

  function initTcp(): Pkt[] {
    return Array.from({ length: N_PKTS }, (_, i) => ({
      seq: i + 1,
      state: "in_flight" as PktState,
      pos: 0,
      speed: 1.0,
    }));
  }
  function initUdp(): Pkt[] {
    return Array.from({ length: N_PKTS }, (_, i) => ({
      seq: i + 1,
      state: "in_flight" as PktState,
      pos: 0,
      speed: JITTER_UDP[i],
    }));
  }

  useEffect(() => {
    if (!running) {
      if (tickRef.current !== null) window.clearInterval(tickRef.current);
      tickRef.current = null;
      return;
    }
    tickRef.current = window.setInterval(() => {
      setT((tt) => tt + 1);
    }, 60);
    return () => {
      if (tickRef.current !== null) window.clearInterval(tickRef.current);
    };
  }, [running]);

  // Update simulation each tick
  useEffect(() => {
    if (t === 0) return;
    setTcp((prev) => stepTcp(prev, t, tcpAcks, setTcpAcks, setTcpRetxCount));
    setUdp((prev) => stepUdp(prev, t, udpReceived, setUdpReceived));
    // Stop condition
    if (tcpAcks.length === N_PKTS && udpDoneStable(udp)) {
      // No-op: let the controller decide via UI
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  function reset() {
    setRunning(false);
    setT(0);
    setTcp(initTcp());
    setUdp(initUdp());
    setTcpAcks([]);
    setUdpReceived([]);
    setTcpRetxCount(0);
  }

  const tcpDelivered = tcpAcks.length;
  const udpLost = udp.filter((p) => p.state === "lost").length;
  const udpInOrder = checkInOrder(udpReceived);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
        <button
          onClick={() => setRunning((r) => !r)}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1"
        >
          {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {running ? "Pause" : "Send"}
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
        <div className="ml-auto text-muted-foreground font-mono">tick {t}</div>
      </div>

      <div className="rounded-lg border border-border bg-background/40 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          {/* TCP lane */}
          <Lane y={70} label="TCP — SOCK_STREAM" sublabel="pålitelig, ordnet, retransmittert" color="rgb(34,197,94)" />
          {/* UDP lane */}
          <Lane y={240} label="UDP — SOCK_DGRAM" sublabel="best-effort, rekkefølge kan endres" color="rgb(244,114,182)" />

          {/* TCP packets */}
          {tcp.map((p, i) => (
            <PacketDot key={"tcp-" + i} pkt={p} y={70} retx={p.state === "retx"} />
          ))}
          {/* TCP ACK stream */}
          <text x={W - 70} y={108} fontSize={9} className="fill-muted-foreground">
            ACK: {tcpAcks.join(",") || "—"}
          </text>
          <text x={50} y={108} fontSize={9} className="fill-muted-foreground">
            retx: {tcpRetxCount}
          </text>

          {/* UDP packets */}
          {udp.map((p, i) => (
            <PacketDot key={"udp-" + i} pkt={p} y={240} />
          ))}
          <text x={W - 70} y={278} fontSize={9} className="fill-muted-foreground">
            mottatt: {udpReceived.map((u) => u.seq).join(",") || "—"}
          </text>
          <text x={50} y={278} fontSize={9} className="fill-muted-foreground">
            tapt: {udpLost}
          </text>

          {/* Sender / receiver columns */}
          <text x={30} y={50} fontSize={11} fontWeight={600} textAnchor="middle" className="fill-foreground">
            send
          </text>
          <text x={W - 30} y={50} fontSize={11} fontWeight={600} textAnchor="middle" className="fill-foreground">
            mottak
          </text>

          {/* Summary box */}
          <rect x={20} y={H - 60} width={W - 40} height={50} rx={6} fill="currentColor" fillOpacity={0.04} />
          <text x={30} y={H - 42} fontSize={11} fontWeight={600} className="fill-foreground">
            Sammenligning
          </text>
          <text x={30} y={H - 26} fontSize={10} className="fill-muted-foreground">
            TCP: {tcpDelivered}/{N_PKTS} ACK-et (alle vil leveres til slutt, i rekkefølge)
          </text>
          <text x={30} y={H - 14} fontSize={10} className="fill-muted-foreground">
            UDP: {udpReceived.length}/{N_PKTS} mottatt · in-order? {udpInOrder ? "ja" : "nei"}
          </text>
        </svg>
      </div>

      <div className="mt-3 grid sm:grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-md border border-green-500/30 bg-green-500/5 p-2">
          <div className="font-semibold mb-1 text-green-600 dark:text-green-400">TCP gir deg gratis</div>
          <ul className="text-muted-foreground leading-snug list-disc pl-4 space-y-0.5">
            <li>Tapt pakke → retransmit (ingen kode hos deg)</li>
            <li>Pakker som kommer ut av rekkefølge → buffer + reorder</li>
            <li>Flow control + congestion control</li>
          </ul>
        </div>
        <div className="rounded-md border border-pink-500/30 bg-pink-500/5 p-2">
          <div className="font-semibold mb-1 text-pink-600 dark:text-pink-400">UDP er bare et bytefelt</div>
          <ul className="text-muted-foreground leading-snug list-disc pl-4 space-y-0.5">
            <li>Pakke tapt? Den er borte for godt.</li>
            <li>Rekkefølge? Ikke garantert.</li>
            <li>Men: lav latens, ingen handshake, broadcast/multicast mulig.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function stepTcp(
  pkts: Pkt[],
  tick: number,
  acks: number[],
  setAcks: (fn: (prev: number[]) => number[]) => void,
  setRetxCount: (fn: (prev: number) => number) => void
): Pkt[] {
  const SEND_SPACING = 8;
  const RTT_TIMEOUT = 60;

  return pkts.map((p) => {
    if (p.state === "acked" || p.state === "delivered") return p;
    const releaseTick = (p.seq - 1) * SEND_SPACING;
    if (tick < releaseTick) return p;

    // Move along the line
    const stepSize = 0.018;
    let newPos = p.pos + stepSize;
    let newState: PktState = p.state;

    // Loss check at midpoint, only first attempt
    if (LOSS_SEEDS_TCP[p.seq - 1] && p.state !== "retx" && newPos >= 0.5 && p.pos < 0.5) {
      newState = "lost";
      // Schedule retx
      setTimeout(() => {
        setRetxCount((c) => c + 1);
      }, 0);
      return { ...p, state: newState, pos: 0.5 };
    }

    if (p.state === "lost") {
      // Wait for "timeout" then retransmit
      const lostAt = releaseTick + Math.floor(0.5 / stepSize);
      if (tick - lostAt >= RTT_TIMEOUT) {
        return { ...p, state: "retx", pos: 0 };
      }
      return p;
    }

    if (newPos >= 1) {
      // Delivered, then acked next tick
      setTimeout(() => {
        setAcks((prev) => (prev.includes(p.seq) ? prev : [...prev, p.seq].sort((a, b) => a - b)));
      }, 0);
      newState = "acked";
      newPos = 1;
    } else {
      newState = p.state === "retx" ? "retx" : "in_flight";
    }
    return { ...p, state: newState, pos: newPos };
  });
}

function stepUdp(
  pkts: Pkt[],
  tick: number,
  received: { seq: number; arrivedAt: number }[],
  setReceived: (fn: (prev: { seq: number; arrivedAt: number }[]) => { seq: number; arrivedAt: number }[]) => void
): Pkt[] {
  const SEND_SPACING = 6;
  return pkts.map((p) => {
    if (p.state === "delivered" || p.state === "lost") return p;
    const releaseTick = (p.seq - 1) * SEND_SPACING;
    if (tick < releaseTick) return p;

    const stepSize = 0.022 * p.speed;
    let newPos = p.pos + stepSize;
    let newState: PktState = "in_flight";

    if (LOSS_SEEDS_UDP[p.seq - 1] && newPos >= 0.5 && p.pos < 0.5) {
      return { ...p, state: "lost", pos: 0.5 };
    }

    if (newPos >= 1) {
      setTimeout(() => {
        setReceived((prev) => {
          if (prev.find((r) => r.seq === p.seq)) return prev;
          return [...prev, { seq: p.seq, arrivedAt: tick }];
        });
      }, 0);
      newState = "delivered";
      newPos = 1;
    }
    return { ...p, state: newState, pos: newPos };
  });
}

function udpDoneStable(pkts: Pkt[]): boolean {
  return pkts.every((p) => p.state === "delivered" || p.state === "lost");
}

function checkInOrder(received: { seq: number; arrivedAt: number }[]): boolean {
  for (let i = 1; i < received.length; i++) {
    if (received[i].seq < received[i - 1].seq) return false;
  }
  return true;
}

function Lane({ y, label, sublabel, color }: { y: number; label: string; sublabel: string; color: string }) {
  return (
    <g>
      <text x={30} y={y - 22} fontSize={11} fontWeight={600} fill={color}>
        {label}
      </text>
      <text x={30} y={y - 10} fontSize={9} className="fill-muted-foreground">
        {sublabel}
      </text>
      {/* Sender pad */}
      <rect x={10} y={y - 8} width={36} height={36} rx={6} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.2} />
      {/* Receiver pad */}
      <rect x={W - 46} y={y - 8} width={36} height={36} rx={6} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.2} />
      {/* Channel */}
      <line x1={46} x2={W - 46} y1={y + 10} y2={y + 10} stroke={color} strokeOpacity={0.25} strokeDasharray="4 4" />
    </g>
  );
}

function PacketDot({ pkt, y, retx }: { pkt: Pkt; y: number; retx?: boolean }) {
  const xStart = 46;
  const xEnd = W - 46;
  const x = xStart + pkt.pos * (xEnd - xStart);

  if (pkt.state === "lost") {
    return (
      <g>
        <circle cx={x} cy={y + 10} r={8} fill="rgb(239,68,68)" fillOpacity={0.3} stroke="rgb(239,68,68)" />
        <text x={x} y={y + 14} textAnchor="middle" fontSize={8} fill="rgb(239,68,68)" fontWeight={700}>
          ×{pkt.seq}
        </text>
      </g>
    );
  }
  if (pkt.state === "acked" || pkt.state === "delivered") {
    return (
      <g>
        <circle cx={xEnd - 14 + (pkt.seq % 4) * 3} cy={y + 10 + ((pkt.seq - 1) % 2) * 6 - 3} r={5} fill="rgb(34,197,94)" fillOpacity={0.25} stroke="rgb(34,197,94)" />
        <text x={xEnd - 14 + (pkt.seq % 4) * 3} y={y + 12 + ((pkt.seq - 1) % 2) * 6 - 3} textAnchor="middle" fontSize={7} fill="rgb(34,197,94)" fontWeight={700}>
          {pkt.seq}
        </text>
      </g>
    );
  }
  const color = retx ? "rgb(234,179,8)" : "rgb(56,189,248)";
  return (
    <g>
      <rect x={x - 9} y={y + 2} width={18} height={16} rx={3} fill={color} fillOpacity={0.25} stroke={color} />
      <text x={x} y={y + 13} textAnchor="middle" fontSize={9} fontWeight={700} fill={color}>
        {pkt.seq}
        {retx ? "*" : ""}
      </text>
    </g>
  );
}
