import { useEffect, useRef, useState } from "react";

/**
 * TCP Sliding Window — fysisk visualisering av flow control.
 *
 * To rader: SENDER og RECEIVER, hver med segmenter 1..N.
 * Vindu (color-shaded blokk) glir langs sender etter hvert som ACKs kommer.
 * Knapper: Send neste, Mottatt ACK, Pakke tapt.
 * Slider: vindusstørrelse.
 *
 * Animasjon: små pakke-ikoner flyr fra sender til receiver, ACK-er flyr tilbake.
 */

const TOTAL_SEGMENTS = 20;
const SEGMENT_BYTES = 100; // each segment carries 100 bytes (for state display)

type FlightPacket = {
  id: number;
  seg: number;
  kind: "data" | "ack";
  /** birth ms */
  born: number;
  /** lost? */
  lost: boolean;
};

type SegState = "acked" | "in-flight" | "lost" | "outside" | "ready" | "unsent";
// outside = beyond the window (can't be sent yet)
// ready   = inside window, not yet sent
// in-flight = sent, awaiting ack
// acked   = ack received

const FLIGHT_MS = 1100;

export function TcpSlidingWindow() {
  const [windowSize, setWindowSize] = useState(5);
  /** index of first byte/segment that has NOT been acked. */
  const [sendBase, setSendBase] = useState(1);
  /** next segment number to send. */
  const [nextSeg, setNextSeg] = useState(1);
  /** what receiver has cumulatively delivered to upper layer */
  const [rcvNext, setRcvNext] = useState(1);
  /** sent but not yet ackable (lost segments) */
  const [lostSegs, setLostSegs] = useState<Set<number>>(new Set());
  /** segments currently in-flight from sender (id -> packet) */
  const [flying, setFlying] = useState<FlightPacket[]>([]);
  const [tick, setTick] = useState(0);
  const idRef = useRef(0);

  // requestAnimationFrame loop — drive the in-flight animation
  useEffect(() => {
    let raf: number;
    let last = performance.now();
    const loop = (now: number) => {
      if (now - last >= 30) {
        last = now;
        setTick((t) => t + 1);
        // Garbage-collect packets that have completed their flight
        setFlying((prev) => prev.filter((p) => now - p.born < FLIGHT_MS + 200));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const inFlightSegs = new Set(flying.filter((f) => f.kind === "data" && !f.lost).map((f) => f.seg));
  // Also any segment ever sent (and not yet acked or proven lost) counts as in flight
  // We track via the "lostSegs" + sent-tracking via nextSeg/sendBase
  // Actually: a segment is "in flight" if sendBase <= seg < nextSeg AND not in lostSegs AND not ALL flying packets done
  function getSegState(seg: number): SegState {
    if (seg < sendBase) return "acked";
    if (lostSegs.has(seg) && seg < nextSeg) return "lost";
    if (seg < nextSeg) return "in-flight";
    if (seg < sendBase + windowSize) return "ready";
    return "outside";
  }

  const bytesInFlight = (nextSeg - sendBase) * SEGMENT_BYTES;
  const bytesAcked = (sendBase - 1) * SEGMENT_BYTES;
  const bytesAvailable = Math.max(0, windowSize - (nextSeg - sendBase)) * SEGMENT_BYTES;

  function sendNext() {
    if (nextSeg >= sendBase + windowSize) return; // window full
    if (nextSeg > TOTAL_SEGMENTS) return;
    const seg = nextSeg;
    idRef.current += 1;
    const p: FlightPacket = {
      id: idRef.current,
      seg,
      kind: "data",
      born: performance.now(),
      lost: false,
    };
    setFlying((f) => [...f, p]);
    setNextSeg((n) => n + 1);
  }

  function ackOne() {
    // find earliest in-flight seg that's not lost, and ack it (advance sendBase).
    // For simplicity: bumps sendBase by 1, and animates an ACK packet flying back.
    if (sendBase >= nextSeg) return;
    // find first non-lost in-flight seg
    let target = sendBase;
    while (target < nextSeg && lostSegs.has(target)) target++;
    if (target >= nextSeg) return; // all in-flight are lost; user must retransmit
    idRef.current += 1;
    const p: FlightPacket = {
      id: idRef.current,
      seg: target,
      kind: "ack",
      born: performance.now(),
      lost: false,
    };
    setFlying((f) => [...f, p]);
    // Bump sendBase past any acked seg AND past leading lost segs that got retransmitted earlier
    setSendBase((b) => {
      let nb = b;
      // Advance over the target only (cumulative ACK semantic but step-by-step)
      if (target === nb) nb += 1;
      else nb = target + 1; // selective hop
      return nb;
    });
    setRcvNext((r) => Math.max(r, target + 1));
  }

  function loseLast() {
    // mark the latest in-flight seg as lost
    if (nextSeg <= sendBase) return;
    const seg = nextSeg - 1;
    setLostSegs((s) => {
      const n = new Set(s);
      n.add(seg);
      return n;
    });
    // mark the flying packet as lost too (so it doesn't reach receiver visually)
    setFlying((f) => f.map((p) => (p.seg === seg && p.kind === "data" && !p.lost ? { ...p, lost: true } : p)));
  }

  function retransmit() {
    // resend the smallest lost seg
    if (lostSegs.size === 0) return;
    const seg = Math.min(...Array.from(lostSegs));
    setLostSegs((s) => {
      const n = new Set(s);
      n.delete(seg);
      return n;
    });
    idRef.current += 1;
    const p: FlightPacket = {
      id: idRef.current,
      seg,
      kind: "data",
      born: performance.now(),
      lost: false,
    };
    setFlying((f) => [...f, p]);
  }

  function reset() {
    setSendBase(1);
    setNextSeg(1);
    setRcvNext(1);
    setLostSegs(new Set());
    setFlying([]);
  }

  // Layout constants
  const W = 700;
  const H = 200;
  const ROW_Y = { sender: 50, receiver: H - 50 };
  const CELL_W = (W - 40) / TOTAL_SEGMENTS;
  const CELL_H = 26;

  function segX(seg: number): number {
    return 20 + (seg - 1) * CELL_W + CELL_W / 2;
  }

  function segColor(state: SegState): string {
    switch (state) {
      case "acked":
        return "fill-emerald-500/70 stroke-emerald-500";
      case "in-flight":
        return "fill-sky-500/40 stroke-sky-500";
      case "lost":
        return "fill-rose-500/30 stroke-rose-500";
      case "ready":
        return "fill-amber-500/15 stroke-amber-500";
      case "outside":
      default:
        return "fill-muted/30 stroke-muted-foreground/30";
    }
  }

  const now = performance.now();

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Controls */}
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <label className="block text-xs text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>Vindusstørrelse (min(cwnd, rwnd))</span>
            <span className="font-mono text-foreground">{windowSize} segmenter</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={windowSize}
            onChange={(e) => setWindowSize(parseInt(e.target.value))}
            className="w-full"
          />
        </label>
        <div className="flex gap-1.5 flex-wrap items-end">
          <button
            type="button"
            onClick={sendNext}
            disabled={nextSeg >= sendBase + windowSize || nextSeg > TOTAL_SEGMENTS}
            className="text-xs rounded-md border border-sky-500/50 bg-sky-500/10 px-2.5 py-1.5 hover:bg-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send neste
          </button>
          <button
            type="button"
            onClick={ackOne}
            disabled={sendBase >= nextSeg}
            className="text-xs rounded-md border border-emerald-500/50 bg-emerald-500/10 px-2.5 py-1.5 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Mottatt ACK
          </button>
          <button
            type="button"
            onClick={loseLast}
            disabled={nextSeg <= sendBase}
            className="text-xs rounded-md border border-rose-500/50 bg-rose-500/10 px-2.5 py-1.5 hover:bg-rose-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Pakke tapt
          </button>
          <button
            type="button"
            onClick={retransmit}
            disabled={lostSegs.size === 0}
            className="text-xs rounded-md border border-amber-500/50 bg-amber-500/10 px-2.5 py-1.5 hover:bg-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Retransmit
          </button>
          <button
            type="button"
            onClick={reset}
            className="text-xs rounded-md border border-border bg-background px-2.5 py-1.5 hover:bg-muted"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main SVG */}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="block w-full" style={{ maxWidth: "100%" }}>
          {/* Labels */}
          <text x={10} y={ROW_Y.sender - 18} fontSize={11} fill="currentColor" className="text-foreground font-semibold">
            SENDER
          </text>
          <text x={10} y={ROW_Y.receiver + 30} fontSize={11} fill="currentColor" className="text-foreground font-semibold">
            RECEIVER
          </text>

          {/* Window highlight on sender */}
          <rect
            x={20 + (sendBase - 1) * CELL_W - 2}
            y={ROW_Y.sender - CELL_H / 2 - 4}
            width={windowSize * CELL_W + 4}
            height={CELL_H + 8}
            fill="none"
            stroke="currentColor"
            className="text-brand"
            strokeWidth={2}
            strokeDasharray="6 4"
            rx={6}
          />
          <text
            x={20 + (sendBase - 1) * CELL_W + (windowSize * CELL_W) / 2}
            y={ROW_Y.sender - CELL_H / 2 - 8}
            textAnchor="middle"
            fontSize={9}
            fill="currentColor"
            className="text-brand"
          >
            ← vindu ({windowSize}) →
          </text>

          {/* Sender row */}
          {Array.from({ length: TOTAL_SEGMENTS }, (_, i) => {
            const seg = i + 1;
            const state = getSegState(seg);
            return (
              <g key={`s-${seg}`}>
                <rect
                  x={20 + i * CELL_W + 1}
                  y={ROW_Y.sender - CELL_H / 2}
                  width={CELL_W - 2}
                  height={CELL_H}
                  className={segColor(state)}
                  strokeWidth={1}
                  rx={3}
                />
                <text
                  x={segX(seg)}
                  y={ROW_Y.sender + 4}
                  textAnchor="middle"
                  fontSize={10}
                  fill="currentColor"
                  className="text-foreground"
                >
                  {seg}
                </text>
              </g>
            );
          })}

          {/* Receiver row */}
          {Array.from({ length: TOTAL_SEGMENTS }, (_, i) => {
            const seg = i + 1;
            const received = seg < rcvNext;
            return (
              <g key={`r-${seg}`}>
                <rect
                  x={20 + i * CELL_W + 1}
                  y={ROW_Y.receiver - CELL_H / 2}
                  width={CELL_W - 2}
                  height={CELL_H}
                  className={received ? "fill-emerald-500/70 stroke-emerald-500" : "fill-muted/30 stroke-muted-foreground/30"}
                  strokeWidth={1}
                  rx={3}
                />
                <text
                  x={segX(seg)}
                  y={ROW_Y.receiver + 4}
                  textAnchor="middle"
                  fontSize={10}
                  fill="currentColor"
                  className="text-foreground"
                >
                  {seg}
                </text>
              </g>
            );
          })}

          {/* Flying packets */}
          {flying.map((p) => {
            const elapsed = now - p.born;
            const t = Math.min(1, elapsed / FLIGHT_MS);
            const xStart = segX(p.seg);
            const xEnd = segX(p.seg);
            const yStart = p.kind === "data" ? ROW_Y.sender + CELL_H / 2 : ROW_Y.receiver - CELL_H / 2;
            const yEnd = p.kind === "data" ? ROW_Y.receiver - CELL_H / 2 : ROW_Y.sender + CELL_H / 2;
            const x = xStart + (xEnd - xStart) * t;
            const y = yStart + (yEnd - yStart) * t;
            const opacity = p.lost && t > 0.5 ? Math.max(0, 1 - (t - 0.5) * 2) : 1;
            // Bias the lost packet to die mid-flight visually
            const showLostX = p.lost && t > 0.5 ? "⚠" : null;
            return (
              <g key={p.id} opacity={opacity}>
                {p.kind === "data" ? (
                  <rect
                    x={x - 12}
                    y={y - 7}
                    width={24}
                    height={14}
                    className={p.lost ? "fill-rose-500" : "fill-sky-500"}
                    rx={3}
                  />
                ) : (
                  <polygon
                    points={`${x - 10},${y} ${x},${y - 7} ${x + 10},${y} ${x},${y + 7}`}
                    className="fill-emerald-500"
                  />
                )}
                <text x={x} y={y + 3} textAnchor="middle" fontSize={8} fill="#fff" fontWeight="bold">
                  {showLostX ?? (p.kind === "data" ? `s${p.seg}` : `a${p.seg}`)}
                </text>
              </g>
            );
          })}

          {/* Pipe between sender and receiver */}
          <line
            x1={20}
            y1={(ROW_Y.sender + ROW_Y.receiver) / 2}
            x2={W - 20}
            y2={(ROW_Y.sender + ROW_Y.receiver) / 2}
            stroke="currentColor"
            className="text-muted-foreground/20"
            strokeWidth={0.5}
            strokeDasharray="2 4"
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap text-[10px] mt-2 mb-3">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500/70" /> Acked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-sky-500/40 border border-sky-500" /> In-flight
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-rose-500/30 border border-rose-500" /> Tapt
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-amber-500/15 border border-amber-500" /> I vindu, ikke sendt
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-muted/30 border border-muted-foreground/30" /> Utenfor vindu
        </span>
      </div>

      {/* State readouts */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-md border border-border bg-background p-3 text-xs">
          <div className="font-semibold text-foreground mb-1.5">Sender-state</div>
          <div className="space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">sendBase:</span>
              <span>{sendBase}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">nextSeq:</span>
              <span>{nextSeg}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1">
              <span className="text-muted-foreground">bytes acked:</span>
              <span>{bytesAcked}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">bytes in flight:</span>
              <span>{bytesInFlight}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">bytes ledig i vindu:</span>
              <span>{bytesAvailable}</span>
            </div>
            {lostSegs.size > 0 && (
              <div className="flex justify-between text-rose-500">
                <span>tapt:</span>
                <span>{Array.from(lostSegs).join(", ")}</span>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-3 text-xs">
          <div className="font-semibold text-foreground mb-1.5">Receiver-state</div>
          <div className="space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">rcvNext (forventer):</span>
              <span>{rcvNext}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">bytes mottatt:</span>
              <span>{(rcvNext - 1) * SEGMENT_BYTES}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1">
              <span className="text-muted-foreground">advertised window:</span>
              <span>{windowSize * SEGMENT_BYTES} B</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        <strong>Sliding window = flow control.</strong> Vinduet kan ikke flytte forbi
        mottakerens buffer. Strup vinduet helt ned til 1 og du har simpel
        stop-and-wait; sett det høyt og sender kan ha mange bytes &quot;in flight&quot;
        for å fylle båndbredden. Pakketap krymper effektiv throughput og er der
        congestion control (egen mekanisme) trer inn.
      </p>
    </div>
  );
}
