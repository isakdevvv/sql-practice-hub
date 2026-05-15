import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Clock,
  Network,
} from "lucide-react";

// --------------------------------------------------------------------------
// TcpVisualizer — alt-i-ett TCP-visualisering.
//
// Fire moduser:
//   1. handshake  — 3-veis SYN/SYN-ACK/ACK, med seq/ack-numre i sanntid.
//   2. lifecycle  — handshake + 2 data-segmenter + ACK + 4-veis FIN/ACK close.
//   3. state      — interaktiv tilstandsmaskin (klient + server, klikkbare events).
//   4. window     — 10-byte stream med glidende sender-vindu, cwnd og rwnd.
//
// Modus 1 og 2 deler tidsdiagram-renderer (samme mønster som RdtVisualizer).
// Modus 3 driver to parallelle tilstandsmaskiner manuelt via knapper.
// Modus 4 er en byte-array som glir frem etter hvert som ACK-er kommer.
// --------------------------------------------------------------------------

type Mode = "handshake" | "lifecycle" | "state" | "window";

type Direction = "c2s" | "s2c"; // klient→server eller motsatt

type Arrow = {
  id: string;
  dir: Direction;
  tStart: number;
  tEnd: number;
  /** Hovedlabel midt på pilen, f.eks. "SYN" eller "DATA seq=101 (50B)". */
  label: string;
  /** Linjetekst under label, vanligvis seq/ack/flagg. */
  sub?: string;
  kind: "syn" | "synack" | "ack" | "data" | "fin" | "finack";
};

type SideEvent = {
  id: string;
  side: "left" | "right";
  t: number;
  label: string;
};

type Scenario = {
  arrows: Arrow[];
  events: SideEvent[];
  total: number;
  note: string;
  /**
   * Tilstandsbånd langs hver side, slik at vi kan tegne aktuell TCP-tilstand
   * (CLOSED, SYN-SENT, ESTABLISHED ...) ved en gitt simuleringstid.
   */
  bands: { side: "left" | "right"; tStart: number; tEnd: number; label: string }[];
};

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "handshake", label: "3-veis handshake", sub: "SYN · SYN+ACK · ACK" },
  { id: "lifecycle", label: "Full livssyklus", sub: "open → data → close" },
  { id: "state", label: "Tilstandsmaskin", sub: "interaktiv, 11 states" },
  { id: "window", label: "Sliding window", sub: "cwnd + rwnd over 10B" },
];

// --------------------------------------------------------------------------
// Scenario-bygging for modus 1 + 2
// --------------------------------------------------------------------------

const TRAVEL = 1.0;
const PROC = 0.25;

function buildHandshake(): Scenario {
  const arrows: Arrow[] = [];
  const events: SideEvent[] = [];
  const bands: Scenario["bands"] = [];
  const x = 1000; // klient initial seq
  const y = 5000; // server initial seq

  // SYN
  arrows.push({
    id: "syn",
    dir: "c2s",
    tStart: 0,
    tEnd: TRAVEL,
    label: "SYN",
    sub: `seq=${x}`,
    kind: "syn",
  });
  events.push({ id: "c-sent-syn", side: "left", t: 0.05, label: "send SYN" });
  events.push({
    id: "s-got-syn",
    side: "right",
    t: TRAVEL + 0.05,
    label: "mottok SYN",
  });

  // SYN-ACK
  const synackStart = TRAVEL + PROC;
  const synackEnd = synackStart + TRAVEL;
  arrows.push({
    id: "synack",
    dir: "s2c",
    tStart: synackStart,
    tEnd: synackEnd,
    label: "SYN+ACK",
    sub: `seq=${y}, ack=${x + 1}`,
    kind: "synack",
  });
  events.push({
    id: "c-got-synack",
    side: "left",
    t: synackEnd + 0.05,
    label: "mottok SYN+ACK",
  });

  // ACK
  const ackStart = synackEnd + PROC;
  const ackEnd = ackStart + TRAVEL;
  arrows.push({
    id: "ack",
    dir: "c2s",
    tStart: ackStart,
    tEnd: ackEnd,
    label: "ACK",
    sub: `ack=${y + 1}`,
    kind: "ack",
  });
  events.push({
    id: "s-est",
    side: "right",
    t: ackEnd + 0.05,
    label: "ESTABLISHED",
  });
  events.push({
    id: "c-est",
    side: "left",
    t: ackStart + 0.05,
    label: "ESTABLISHED",
  });

  // Bånd
  bands.push({ side: "left", tStart: 0, tEnd: 0, label: "CLOSED" });
  bands.push({ side: "left", tStart: 0, tEnd: ackStart, label: "SYN-SENT" });
  bands.push({
    side: "left",
    tStart: ackStart,
    tEnd: ackEnd + 0.6,
    label: "ESTABLISHED",
  });
  bands.push({ side: "right", tStart: 0, tEnd: TRAVEL, label: "LISTEN" });
  bands.push({
    side: "right",
    tStart: TRAVEL,
    tEnd: ackEnd,
    label: "SYN-RECEIVED",
  });
  bands.push({
    side: "right",
    tStart: ackEnd,
    tEnd: ackEnd + 0.6,
    label: "ESTABLISHED",
  });

  return {
    arrows,
    events,
    bands,
    total: ackEnd + 0.6,
    note: "Tre meldinger åpner forbindelsen. Hver side velger sitt eget startsekvensnummer (ISN). Etter siste ACK er begge i ESTABLISHED og kan sende data.",
  };
}

function buildLifecycle(): Scenario {
  const arrows: Arrow[] = [];
  const events: SideEvent[] = [];
  const bands: Scenario["bands"] = [];
  const x = 1000;
  const y = 5000;
  let t = 0;

  // SYN
  arrows.push({
    id: "syn",
    dir: "c2s",
    tStart: t,
    tEnd: t + TRAVEL,
    label: "SYN",
    sub: `seq=${x}`,
    kind: "syn",
  });
  t += TRAVEL + PROC;
  // SYN-ACK
  arrows.push({
    id: "synack",
    dir: "s2c",
    tStart: t,
    tEnd: t + TRAVEL,
    label: "SYN+ACK",
    sub: `seq=${y}, ack=${x + 1}`,
    kind: "synack",
  });
  t += TRAVEL + PROC;
  // ACK
  arrows.push({
    id: "ack",
    dir: "c2s",
    tStart: t,
    tEnd: t + TRAVEL,
    label: "ACK",
    sub: `ack=${y + 1}`,
    kind: "ack",
  });
  const establishedAt = t + TRAVEL;
  t = establishedAt + 0.4;

  // DATA 1
  const d1Seq = x + 1;
  const d1Len = 50;
  arrows.push({
    id: "d1",
    dir: "c2s",
    tStart: t,
    tEnd: t + TRAVEL,
    label: "DATA",
    sub: `seq=${d1Seq}, len=${d1Len}`,
    kind: "data",
  });
  t += TRAVEL + PROC;
  // DATA 2 — sendes raskt etter
  const d2Seq = d1Seq + d1Len;
  const d2Len = 40;
  arrows.push({
    id: "d2",
    dir: "c2s",
    tStart: t,
    tEnd: t + TRAVEL,
    label: "DATA",
    sub: `seq=${d2Seq}, len=${d2Len}`,
    kind: "data",
  });
  t += TRAVEL + PROC;
  // Kumulativ ACK for begge
  const ackNum = d2Seq + d2Len;
  arrows.push({
    id: "data-ack",
    dir: "s2c",
    tStart: t,
    tEnd: t + TRAVEL,
    label: "ACK",
    sub: `ack=${ackNum}`,
    kind: "ack",
  });
  t += TRAVEL + 0.4;

  // FIN fra klient
  const finSeq = ackNum;
  arrows.push({
    id: "fin",
    dir: "c2s",
    tStart: t,
    tEnd: t + TRAVEL,
    label: "FIN",
    sub: `seq=${finSeq}`,
    kind: "fin",
  });
  const finSentAt = t;
  t += TRAVEL + PROC;
  // ACK på FIN
  arrows.push({
    id: "fin-ack",
    dir: "s2c",
    tStart: t,
    tEnd: t + TRAVEL,
    label: "ACK",
    sub: `ack=${finSeq + 1}`,
    kind: "ack",
  });
  const finAckedAt = t + TRAVEL;
  t = finAckedAt + 0.3;

  // Server-FIN
  const sFinSeq = y + 1; // server har ikke sendt data i dette scenariet
  arrows.push({
    id: "s-fin",
    dir: "s2c",
    tStart: t,
    tEnd: t + TRAVEL,
    label: "FIN",
    sub: `seq=${sFinSeq}`,
    kind: "fin",
  });
  t += TRAVEL + PROC;
  // Siste ACK
  arrows.push({
    id: "last-ack",
    dir: "c2s",
    tStart: t,
    tEnd: t + TRAVEL,
    label: "ACK",
    sub: `ack=${sFinSeq + 1}`,
    kind: "ack",
  });
  const closedAt = t + TRAVEL;

  // Events
  events.push({ id: "c-est", side: "left", t: establishedAt + 0.05, label: "ESTABLISHED" });
  events.push({ id: "s-est", side: "right", t: establishedAt + 0.05, label: "ESTABLISHED" });
  events.push({
    id: "s-rcv-d2",
    side: "right",
    t: arrows[4].tEnd + 0.05,
    label: `deliver ${d1Len + d2Len}B`,
  });
  events.push({ id: "c-fin", side: "left", t: finSentAt + 0.05, label: "send FIN" });
  events.push({ id: "c-time-wait", side: "left", t: closedAt + 0.05, label: "TIME-WAIT" });
  events.push({ id: "s-closed", side: "right", t: closedAt + 0.05, label: "CLOSED" });

  // Bånd — klient
  bands.push({ side: "left", tStart: 0, tEnd: arrows[2].tStart, label: "SYN-SENT" });
  bands.push({ side: "left", tStart: arrows[2].tStart, tEnd: finSentAt, label: "ESTABLISHED" });
  bands.push({ side: "left", tStart: finSentAt, tEnd: finAckedAt, label: "FIN-WAIT-1" });
  bands.push({ side: "left", tStart: finAckedAt, tEnd: t, label: "FIN-WAIT-2" });
  bands.push({ side: "left", tStart: t, tEnd: closedAt + 0.6, label: "TIME-WAIT" });
  // Bånd — server
  bands.push({ side: "right", tStart: 0, tEnd: arrows[0].tEnd, label: "LISTEN" });
  bands.push({
    side: "right",
    tStart: arrows[0].tEnd,
    tEnd: arrows[2].tEnd,
    label: "SYN-RECEIVED",
  });
  bands.push({
    side: "right",
    tStart: arrows[2].tEnd,
    tEnd: arrows[5].tEnd,
    label: "ESTABLISHED",
  });
  bands.push({
    side: "right",
    tStart: arrows[5].tEnd,
    tEnd: arrows[7].tStart,
    label: "CLOSE-WAIT",
  });
  bands.push({
    side: "right",
    tStart: arrows[7].tStart,
    tEnd: closedAt,
    label: "LAST-ACK",
  });
  bands.push({ side: "right", tStart: closedAt, tEnd: closedAt + 0.6, label: "CLOSED" });

  return {
    arrows,
    events,
    bands,
    total: closedAt + 0.6,
    note: "Full TCP-livssyklus: 3-veis åpning, så to data-segmenter (50B + 40B) som kvitteres med én kumulativ ACK, så 4-veis avskjed initiert av klienten. Server går via CLOSE-WAIT → LAST-ACK, klienten via FIN-WAIT-1 → FIN-WAIT-2 → TIME-WAIT.",
  };
}

function buildScenario(mode: Mode): Scenario | null {
  if (mode === "handshake") return buildHandshake();
  if (mode === "lifecycle") return buildLifecycle();
  return null;
}

// --------------------------------------------------------------------------
// Timeline-modus (handshake + lifecycle) renderes med felles SVG-komponent.
// --------------------------------------------------------------------------

function TimelineView({ scenario }: { scenario: Scenario }) {
  const [playing, setPlaying] = useState(false);
  const [now, setNow] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) {
      lastTickRef.current = null;
      return;
    }
    const step = (ts: number) => {
      if (lastTickRef.current == null) lastTickRef.current = ts;
      const dt = (ts - lastTickRef.current) / 1000;
      lastTickRef.current = ts;
      setNow((cur) => {
        const next = cur + dt * 1.0;
        if (next >= scenario.total) {
          setPlaying(false);
          return scenario.total;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, scenario.total]);

  useEffect(() => {
    setNow(0);
    setPlaying(false);
  }, [scenario]);

  const stepForward = () => {
    setPlaying(false);
    const all: number[] = [];
    for (const a of scenario.arrows) {
      all.push(a.tStart, a.tEnd);
    }
    for (const e of scenario.events) all.push(e.t);
    all.sort((a, b) => a - b);
    const next = all.find((x) => x > now + 0.001);
    setNow(next != null ? Math.min(next + 0.001, scenario.total) : scenario.total);
  };

  const W = 640;
  const padTop = 30;
  const padBottom = 30;
  const sideX = { left: 130, right: W - 130 };
  const TIME_TO_PX = 60;
  const H = padTop + padBottom + Math.max(scenario.total * TIME_TO_PX, 200);
  const yFor = (t: number) => padTop + t * TIME_TO_PX;

  const clientBand = pickBand(scenario.bands, "left", now);
  const serverBand = pickBand(scenario.bands, "right", now);

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <StateBox
          title="Klient — tilstand"
          body={clientBand ?? "CLOSED"}
          color="#3b82f6"
        />
        <StateBox
          title="Server — tilstand"
          body={serverBand ?? "CLOSED"}
          color="#a855f7"
          align="right"
        />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (now >= scenario.total) setNow(0);
            setPlaying((p) => !p);
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:border-brand/40"
        >
          {playing ? (
            <>
              <Pause className="h-3.5 w-3.5" /> Pause
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" /> Spill
            </>
          )}
        </button>
        <button
          type="button"
          onClick={stepForward}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs hover:border-brand/40"
          title="Hopp til neste hendelse"
        >
          <SkipForward className="h-3.5 w-3.5" /> Neste
        </button>
        <button
          type="button"
          onClick={() => {
            setNow(0);
            setPlaying(false);
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs hover:border-brand/40"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Nullstill
        </button>
        <input
          type="range"
          min={0}
          max={scenario.total}
          step={0.01}
          value={now}
          onChange={(e) => {
            setPlaying(false);
            setNow(parseFloat(e.target.value));
          }}
          className="flex-1 min-w-[120px]"
          aria-label="Tidsglider"
        />
        <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
          t = {now.toFixed(2)} / {scenario.total.toFixed(2)}
        </span>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-background">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ maxWidth: W }}
          role="img"
          aria-label="TCP-tidsdiagram"
        >
          <defs>
            <marker
              id="tcpvis-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
            </marker>
          </defs>
          <text
            x={sideX.left}
            y={16}
            textAnchor="middle"
            className="fill-foreground text-[12px] font-semibold"
          >
            klient
          </text>
          <text
            x={sideX.right}
            y={16}
            textAnchor="middle"
            className="fill-foreground text-[12px] font-semibold"
          >
            server
          </text>
          {/* Tidslinjer */}
          <line
            x1={sideX.left}
            y1={padTop}
            x2={sideX.left}
            y2={H - padBottom}
            className="stroke-border"
            strokeWidth={2}
          />
          <line
            x1={sideX.right}
            y1={padTop}
            x2={sideX.right}
            y2={H - padBottom}
            className="stroke-border"
            strokeWidth={2}
          />
          {/* tikker */}
          {Array.from({ length: Math.floor(scenario.total) + 1 }).map((_, i) => (
            <g key={i}>
              <line
                x1={sideX.left - 4}
                y1={yFor(i)}
                x2={sideX.left + 4}
                y2={yFor(i)}
                className="stroke-muted-foreground"
              />
              <text
                x={sideX.left - 10}
                y={yFor(i) + 3}
                textAnchor="end"
                className="fill-muted-foreground text-[9px] font-mono"
              >
                t={i}
              </text>
            </g>
          ))}
          {/* Tilstandsbånd langs hver tidslinje */}
          {scenario.bands.map((b, i) => {
            if (b.tEnd > now) {
              // klipp til nåtid
              const visibleEnd = Math.min(b.tEnd, now);
              if (visibleEnd <= b.tStart + 0.001) return null;
              const x =
                b.side === "left" ? sideX.left - 100 : sideX.right + 8;
              const yA = yFor(b.tStart);
              const yB = yFor(visibleEnd);
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={yA}
                    width={92}
                    height={Math.max(yB - yA, 1)}
                    rx={4}
                    className="fill-brand/5 stroke-brand/30"
                    strokeWidth={1}
                  />
                  <text
                    x={x + 46}
                    y={yA + 14}
                    textAnchor="middle"
                    className="fill-brand text-[9px] font-mono font-semibold"
                  >
                    {b.label}
                  </text>
                </g>
              );
            }
            const x = b.side === "left" ? sideX.left - 100 : sideX.right + 8;
            const yA = yFor(b.tStart);
            const yB = yFor(b.tEnd);
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={yA}
                  width={92}
                  height={Math.max(yB - yA, 1)}
                  rx={4}
                  className="fill-brand/5 stroke-brand/30"
                  strokeWidth={1}
                />
                <text
                  x={x + 46}
                  y={yA + 14}
                  textAnchor="middle"
                  className="fill-brand text-[9px] font-mono font-semibold"
                >
                  {b.label}
                </text>
              </g>
            );
          })}
          {/* Now-linje */}
          <line
            x1={sideX.left - 8}
            y1={yFor(now)}
            x2={sideX.right + 8}
            y2={yFor(now)}
            className="stroke-brand"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            opacity={0.7}
          />
          <circle cx={sideX.left} cy={yFor(now)} r={4} className="fill-brand" />
          <circle cx={sideX.right} cy={yFor(now)} r={4} className="fill-brand" />
          {/* Side-events */}
          {scenario.events.map((e) => {
            if (e.t > now + 0.001) return null;
            const x = e.side === "left" ? sideX.left - 105 : sideX.right + 105;
            const anchor = e.side === "left" ? "end" : "start";
            return (
              <text
                key={e.id}
                x={x}
                y={yFor(e.t) + 3}
                textAnchor={anchor}
                className="fill-emerald-600 text-[9px] font-mono"
              >
                ● {e.label}
              </text>
            );
          })}
          {/* Piler */}
          {scenario.arrows.map((a) => (
            <TcpArrow
              key={a.id}
              arrow={a}
              now={now}
              fromX={a.dir === "c2s" ? sideX.left : sideX.right}
              toX={a.dir === "c2s" ? sideX.right : sideX.left}
              yFor={yFor}
            />
          ))}
        </svg>
      </div>

      <div className="mt-3 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-foreground leading-relaxed">
        <span className="font-semibold">Scenario:</span> {scenario.note}
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] text-muted-foreground">
        <Legend swatch={<Pill color="#3b82f6" />} label="SYN" />
        <Legend swatch={<Pill color="#a855f7" />} label="SYN+ACK" />
        <Legend swatch={<Pill color="#22c55e" />} label="ACK" />
        <Legend swatch={<Pill color="#0ea5e9" />} label="DATA" />
        <Legend swatch={<Pill color="#f97316" />} label="FIN" />
      </div>
    </div>
  );
}

function Pill({ color }: { color: string }) {
  return (
    <span
      className="inline-block w-3 h-[2px] align-middle"
      style={{ backgroundColor: color }}
    />
  );
}

function Legend({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {swatch}
      <span>{label}</span>
    </div>
  );
}

function StateBox({
  title,
  body,
  color,
  align,
}: {
  title: string;
  body: string;
  color: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={`rounded-md border border-border bg-background p-2 ${
        align === "right" ? "text-right" : ""
      }`}
    >
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        {title}
      </div>
      <div className="text-sm font-mono font-semibold mt-0.5">{body}</div>
    </div>
  );
}

function pickBand(
  bands: Scenario["bands"],
  side: "left" | "right",
  t: number,
): string | null {
  // Velg det båndet som dekker `t`. Hvis flere overlapper, ta sist startet.
  const cands = bands
    .filter((b) => b.side === side && b.tStart <= t && b.tEnd >= t)
    .sort((a, b) => a.tStart - b.tStart);
  if (cands.length === 0) return null;
  return cands[cands.length - 1].label;
}

function TcpArrow({
  arrow,
  now,
  fromX,
  toX,
  yFor,
}: {
  arrow: Arrow;
  now: number;
  fromX: number;
  toX: number;
  yFor: (t: number) => number;
}) {
  if (now < arrow.tStart) return null;
  const tEnd = Math.min(now, arrow.tEnd);
  const progress = (tEnd - arrow.tStart) / (arrow.tEnd - arrow.tStart);
  const y1 = yFor(arrow.tStart);
  const y2 = yFor(tEnd);
  const xEnd = fromX + (toX - fromX) * progress;

  const colorByKind: Record<Arrow["kind"], string> = {
    syn: "#3b82f6",
    synack: "#a855f7",
    ack: "#22c55e",
    data: "#0ea5e9",
    fin: "#f97316",
    finack: "#f97316",
  };
  const color = colorByKind[arrow.kind];
  const showHead = progress >= 1;
  const labelX = (fromX + xEnd) / 2;
  const labelY = (y1 + y2) / 2 - 6;

  return (
    <g style={{ color }}>
      <line
        x1={fromX}
        y1={y1}
        x2={xEnd}
        y2={y2}
        strokeWidth={2}
        stroke="currentColor"
        markerEnd={showHead ? "url(#tcpvis-arrow)" : undefined}
      />
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        className="text-[10px] font-mono font-semibold"
        fill="currentColor"
      >
        {arrow.label}
      </text>
      {arrow.sub && (
        <text
          x={labelX}
          y={labelY + 11}
          textAnchor="middle"
          className="text-[9px] font-mono"
          fill="currentColor"
          opacity={0.8}
        >
          {arrow.sub}
        </text>
      )}
    </g>
  );
}

// --------------------------------------------------------------------------
// MODUS 3 — Tilstandsmaskin (kompakt versjon).
//
// Klient og server kjører parallelle automater. Knapper utløser events; et
// event ignoreres hvis det ikke har en gyldig transisjon fra nåværende state.
// --------------------------------------------------------------------------

type TcpState =
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

type StateEvent = {
  id: string;
  label: string;
  side: "client" | "server";
  trans: Partial<Record<TcpState, TcpState>>;
};

const STATE_EVENTS: StateEvent[] = [
  // klient
  {
    id: "c-open",
    label: "send SYN (active open)",
    side: "client",
    trans: { CLOSED: "SYN-SENT" },
  },
  {
    id: "c-recv-synack",
    label: "recv SYN+ACK / send ACK",
    side: "client",
    trans: { "SYN-SENT": "ESTABLISHED" },
  },
  {
    id: "c-recv-syn",
    label: "recv SYN / send ACK (simultanåpning)",
    side: "client",
    trans: { "SYN-SENT": "SYN-RECEIVED" },
  },
  {
    id: "c-close",
    label: "close / send FIN",
    side: "client",
    trans: { ESTABLISHED: "FIN-WAIT-1" },
  },
  {
    id: "c-recv-ack",
    label: "recv ACK for FIN",
    side: "client",
    trans: {
      "FIN-WAIT-1": "FIN-WAIT-2",
      CLOSING: "TIME-WAIT",
    },
  },
  {
    id: "c-recv-fin",
    label: "recv FIN / send ACK",
    side: "client",
    trans: {
      "FIN-WAIT-2": "TIME-WAIT",
      "FIN-WAIT-1": "CLOSING",
      ESTABLISHED: "CLOSE-WAIT",
    },
  },
  {
    id: "c-timeout",
    label: "2·MSL timeout",
    side: "client",
    trans: { "TIME-WAIT": "CLOSED" },
  },
  // server
  {
    id: "s-listen",
    label: "passive open (listen)",
    side: "server",
    trans: { CLOSED: "LISTEN" },
  },
  {
    id: "s-recv-syn",
    label: "recv SYN / send SYN+ACK",
    side: "server",
    trans: { LISTEN: "SYN-RECEIVED" },
  },
  {
    id: "s-recv-ack",
    label: "recv ACK",
    side: "server",
    trans: {
      "SYN-RECEIVED": "ESTABLISHED",
      "LAST-ACK": "CLOSED",
    },
  },
  {
    id: "s-recv-fin",
    label: "recv FIN / send ACK",
    side: "server",
    trans: { ESTABLISHED: "CLOSE-WAIT" },
  },
  {
    id: "s-close",
    label: "close / send FIN",
    side: "server",
    trans: { "CLOSE-WAIT": "LAST-ACK" },
  },
];

function StateView() {
  const [client, setClient] = useState<TcpState>("CLOSED");
  const [server, setServer] = useState<TcpState>("CLOSED");
  const [trail, setTrail] = useState<string[]>([]);

  function fire(ev: StateEvent) {
    if (ev.side === "client") {
      const next = ev.trans[client];
      if (!next) {
        setTrail((t) => [`✗ klient (${client}) ignorerer ${ev.label}`, ...t].slice(0, 8));
        return;
      }
      setTrail((t) => [`→ klient: ${client} ⇒ ${next} (${ev.label})`, ...t].slice(0, 8));
      setClient(next);
    } else {
      const next = ev.trans[server];
      if (!next) {
        setTrail((t) => [`✗ server (${server}) ignorerer ${ev.label}`, ...t].slice(0, 8));
        return;
      }
      setTrail((t) => [`→ server: ${server} ⇒ ${next} (${ev.label})`, ...t].slice(0, 8));
      setServer(next);
    }
  }

  function reset() {
    setClient("CLOSED");
    setServer("CLOSED");
    setTrail([]);
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          Klikk en event-knapp under for å forsøke en transisjon. Knapper som ikke
          har en gyldig overgang fra nåværende tilstand vises som «×» i loggen.
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:bg-muted"
        >
          <RotateCcw className="h-3 w-3" /> Nullstill
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border-2 p-4" style={{ borderColor: "#3b82f640" }}>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
            Klient (active open)
          </div>
          <div className="font-mono font-semibold text-lg">{client}</div>
        </div>
        <div className="rounded-lg border-2 p-4" style={{ borderColor: "#a855f740" }}>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-500" />
            Server (passive open)
          </div>
          <div className="font-mono font-semibold text-lg">{server}</div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <EventList
          title="Klient-events"
          color="#3b82f6"
          events={STATE_EVENTS.filter((e) => e.side === "client")}
          current={client}
          onFire={fire}
        />
        <EventList
          title="Server-events"
          color="#a855f7"
          events={STATE_EVENTS.filter((e) => e.side === "server")}
          current={server}
          onFire={fire}
        />
      </div>

      <div className="rounded-md border border-border bg-background p-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          Trail
        </div>
        {trail.length === 0 ? (
          <div className="text-xs text-muted-foreground italic">ingen events ennå</div>
        ) : (
          <ul className="text-[11px] font-mono space-y-0.5">
            {trail.map((entry, i) => (
              <li
                key={i}
                className={
                  entry.startsWith("✗")
                    ? "text-rose-500"
                    : i === 0
                      ? "text-foreground"
                      : "text-muted-foreground"
                }
              >
                {entry}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EventList({
  title,
  color,
  events,
  current,
  onFire,
}: {
  title: string;
  color: string;
  events: StateEvent[];
  current: TcpState;
  onFire: (e: StateEvent) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div
        className="text-[10px] uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5"
        style={{ color }}
      >
        <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        {title}
      </div>
      <div className="flex flex-col gap-1.5">
        {events.map((e) => {
          const enabled = current in e.trans;
          return (
            <button
              key={e.id}
              onClick={() => onFire(e)}
              disabled={!enabled}
              title={
                enabled
                  ? `${current} ⇒ ${e.trans[current]}`
                  : `gyldig fra: ${Object.keys(e.trans).join(", ")}`
              }
              className={`text-left rounded-md border px-2.5 py-1.5 text-[11px] font-mono transition-colors ${
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
  );
}

// --------------------------------------------------------------------------
// MODUS 4 — Sliding window over 10-byte stream
//
// Vi har en stream på 10 byte (B0..B9). Sender holder snd_una (første ubekreftet
// byte) og snd_nxt (neste byte å sende). Effektivt vindu = min(cwnd, rwnd).
// «Send segment» sender opptil 3 byte fra snd_nxt — disse blir in-flight.
// «ACK ankommer» bekrefter de eldste in-flight bytene, snd_una glir frem.
// «Pakke tapt» fjerner en in-flight uten å ack-e, slik at vinduet blokkerer.
// --------------------------------------------------------------------------

type WByteState = "acked" | "in-flight" | "in-window-ready" | "outside-window" | "lost";

type InFlight = {
  id: number;
  start: number;
  end: number; // eksklusiv
  /** Hvis denne in-flight blir tapt, vil "ACK ankommer" behandle eldste først; tapte må retransmitteres. */
  lost: boolean;
};

function WindowView() {
  const TOTAL = 10;
  const [cwnd, setCwnd] = useState(4);
  const [rwnd, setRwnd] = useState(6);
  const [sndUna, setSndUna] = useState(0); // første ubekreftet byte
  const [sndNxt, setSndNxt] = useState(0); // neste byte å sende
  const [inFlight, setInFlight] = useState<InFlight[]>([]);
  const [seqId, setSeqId] = useState(1);
  const [log, setLog] = useState<string[]>([]);

  const window = Math.min(cwnd, rwnd);
  // Hvor langt forover kan vi sende?
  const sendableEnd = Math.min(TOTAL, sndUna + window);
  const canSend = sndNxt < sendableEnd;
  const hasInFlight = inFlight.length > 0;
  const oldestInFlight = inFlight[0];
  const allDone = sndUna >= TOTAL;

  function pushLog(line: string) {
    setLog((l) => [line, ...l].slice(0, 6));
  }

  function send() {
    if (!canSend) return;
    const start = sndNxt;
    const end = Math.min(start + 3, sendableEnd); // segmenter à inntil 3 byte
    const id = seqId;
    setSeqId(id + 1);
    setInFlight((f) => [...f, { id, start, end, lost: false }]);
    setSndNxt(end);
    pushLog(`send seg #${id}  B${start}..B${end - 1} (${end - start} byte)`);
  }

  function recvAck() {
    if (!oldestInFlight) return;
    if (oldestInFlight.lost) {
      pushLog(
        `✗ ACK kan ikke komme — seg #${oldestInFlight.id} (B${oldestInFlight.start}..B${oldestInFlight.end - 1}) er tapt. Retransmitter først.`,
      );
      return;
    }
    setInFlight((f) => f.slice(1));
    setSndUna(oldestInFlight.end);
    pushLog(
      `ACK=${oldestInFlight.end}  seg #${oldestInFlight.id} bekreftet, vindu glir`,
    );
  }

  function loseOldest() {
    if (!oldestInFlight) return;
    setInFlight((f) =>
      f.map((p, i) => (i === 0 ? { ...p, lost: true } : p)),
    );
    pushLog(
      `✗ tap: seg #${oldestInFlight.id} (B${oldestInFlight.start}..B${oldestInFlight.end - 1}) forsvant. cwnd halveres.`,
    );
    setCwnd((c) => Math.max(2, Math.floor(c / 2)));
  }

  function retransmit() {
    if (!oldestInFlight || !oldestInFlight.lost) return;
    setInFlight((f) =>
      f.map((p, i) => (i === 0 ? { ...p, lost: false } : p)),
    );
    pushLog(
      `↻ retransmitter seg #${oldestInFlight.id} (B${oldestInFlight.start}..B${oldestInFlight.end - 1})`,
    );
  }

  function reset() {
    setSndUna(0);
    setSndNxt(0);
    setInFlight([]);
    setSeqId(1);
    setLog([]);
    setCwnd(4);
    setRwnd(6);
  }

  const byteStates = useMemo<WByteState[]>(() => {
    const arr: WByteState[] = [];
    for (let i = 0; i < TOTAL; i++) {
      if (i < sndUna) arr.push("acked");
      else if (i < sndNxt) {
        // in-flight — finn segment
        const seg = inFlight.find((s) => i >= s.start && i < s.end);
        arr.push(seg && seg.lost ? "lost" : "in-flight");
      } else if (i < sndUna + window) arr.push("in-window-ready");
      else arr.push("outside-window");
    }
    return arr;
  }, [sndUna, sndNxt, inFlight, window]);

  return (
    <div className="p-4 space-y-4">
      <div className="grid sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-md border border-border bg-background p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            cwnd (congestion)
          </div>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="range"
              min={2}
              max={10}
              value={cwnd}
              onChange={(e) => setCwnd(parseInt(e.target.value, 10))}
              className="flex-1"
            />
            <span className="font-mono text-sm font-semibold">{cwnd}</span>
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            rwnd (receiver advertised)
          </div>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="range"
              min={2}
              max={10}
              value={rwnd}
              onChange={(e) => setRwnd(parseInt(e.target.value, 10))}
              className="flex-1"
            />
            <span className="font-mono text-sm font-semibold">{rwnd}</span>
          </div>
        </div>
        <div className="rounded-md border border-brand/30 bg-brand/5 p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-brand">
            effektivt vindu
          </div>
          <div className="font-mono text-lg font-semibold mt-1">
            min(cwnd, rwnd) = {window}
          </div>
        </div>
      </div>

      {/* byte-strip */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
          Sender-buffer (10 byte)
        </div>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {byteStates.map((s, i) => (
            <ByteCell key={i} index={i} state={s} />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
          <Legend swatch={<Swatch color="#10b981" />} label="acked" />
          <Legend swatch={<Swatch color="#0ea5e9" />} label="in-flight" />
          <Legend swatch={<Swatch color="#ef4444" />} label="tapt" />
          <Legend swatch={<Swatch color="#fbbf24" />} label="klar (i vindu)" />
          <Legend swatch={<Swatch color="#525252" outline />} label="utenfor vindu" />
        </div>
        <div className="mt-2 text-[10px] font-mono text-muted-foreground">
          snd_una = {sndUna} · snd_nxt = {sndNxt} · vinduslutt ={" "}
          {sndUna + window} · bytes in-flight = {sndNxt - sndUna}
        </div>
      </div>

      {/* knapper */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={send}
          disabled={!canSend || allDone}
          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors ${
            canSend && !allDone
              ? "border-brand bg-brand/10 text-brand hover:bg-brand/20"
              : "border-border/40 text-muted-foreground/50 cursor-not-allowed"
          }`}
        >
          Send segment (opptil 3B)
        </button>
        <button
          onClick={recvAck}
          disabled={!hasInFlight || (oldestInFlight?.lost ?? false)}
          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors ${
            hasInFlight && !oldestInFlight?.lost
              ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
              : "border-border/40 text-muted-foreground/50 cursor-not-allowed"
          }`}
        >
          ACK ankommer (eldste)
        </button>
        <button
          onClick={loseOldest}
          disabled={!hasInFlight || (oldestInFlight?.lost ?? false)}
          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors ${
            hasInFlight && !oldestInFlight?.lost
              ? "border-rose-500/60 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
              : "border-border/40 text-muted-foreground/50 cursor-not-allowed"
          }`}
        >
          Pakke tapt
        </button>
        <button
          onClick={retransmit}
          disabled={!oldestInFlight?.lost}
          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors ${
            oldestInFlight?.lost
              ? "border-amber-500/60 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
              : "border-border/40 text-muted-foreground/50 cursor-not-allowed"
          }`}
        >
          Retransmitter
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted"
        >
          <RotateCcw className="h-3 w-3" /> Nullstill
        </button>
      </div>

      {/* log + tips */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Logg
          </div>
          {log.length === 0 ? (
            <div className="text-xs italic text-muted-foreground">
              ingen hendelser ennå — klikk «Send segment» for å starte
            </div>
          ) : (
            <ul className="text-[11px] font-mono space-y-0.5">
              {log.map((line, i) => (
                <li
                  key={i}
                  className={
                    line.startsWith("✗")
                      ? "text-rose-500"
                      : line.startsWith("↻")
                        ? "text-amber-600"
                        : i === 0
                          ? "text-foreground"
                          : "text-muted-foreground"
                  }
                >
                  {line}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-xs leading-relaxed">
          <span className="font-semibold">Tips:</span> Send flere segmenter på rad
          uten ACK-er — du ser at vinduet «fyller seg». Når du så lar ACK-er
          komme én etter én, glir vinduet forover slik at flere bytes kan
          sendes. Drar du <code>rwnd</code> ned, blokkeres sender selv om{" "}
          <code>cwnd</code> tillater mer (flow control). Trykker du på «Pakke
          tapt», halveres cwnd automatisk — det er congestion control i miniatyr.
        </div>
      </div>
    </div>
  );
}

function Swatch({ color, outline }: { color: string; outline?: boolean }) {
  return (
    <span
      className="inline-block w-3 h-3 rounded-sm align-middle"
      style={
        outline
          ? { border: `1px solid ${color}`, background: "transparent" }
          : { background: color }
      }
    />
  );
}

function ByteCell({ index, state }: { index: number; state: WByteState }) {
  const styles: Record<WByteState, { bg: string; fg: string; border: string }> = {
    acked: { bg: "#10b98122", fg: "#059669", border: "#10b98180" },
    "in-flight": { bg: "#0ea5e922", fg: "#0369a1", border: "#0ea5e980" },
    lost: { bg: "#ef444422", fg: "#b91c1c", border: "#ef4444" },
    "in-window-ready": { bg: "#fbbf2422", fg: "#a16207", border: "#fbbf2480" },
    "outside-window": { bg: "transparent", fg: "#737373", border: "#52525233" },
  };
  const s = styles[state];
  return (
    <div
      className="flex-shrink-0 w-10 h-12 rounded-md border flex flex-col items-center justify-center font-mono text-[10px] transition-colors"
      style={{
        background: s.bg,
        color: s.fg,
        borderColor: s.border,
        borderWidth: state === "lost" ? 2 : 1,
      }}
      title={`B${index} — ${state}`}
    >
      <div className="font-semibold">B{index}</div>
      <div className="text-[8px] opacity-70">
        {state === "acked"
          ? "ack"
          : state === "in-flight"
            ? "in-flight"
            : state === "lost"
              ? "✗"
              : state === "in-window-ready"
                ? "klar"
                : "—"}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Container — bytter mellom de fire modusene.
// --------------------------------------------------------------------------

export function TcpVisualizer() {
  const [mode, setMode] = useState<Mode>("handshake");
  const scenario = useMemo(
    () => (mode === "handshake" || mode === "lifecycle" ? buildScenario(mode) : null),
    [mode],
  );

  return (
    <figure className="my-6 rounded-xl border border-border bg-card">
      <figcaption className="border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
            <Network className="h-3.5 w-3.5 text-brand" />
            TCP-visualisator
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`text-xs rounded-md border px-2 py-1 transition-colors ${
                  mode === m.id
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border bg-background hover:border-brand/40 text-muted-foreground"
                }`}
                title={m.sub}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-1 text-[10px] text-muted-foreground">
          {MODES.find((m) => m.id === mode)?.sub}
        </div>
      </figcaption>

      {(mode === "handshake" || mode === "lifecycle") && scenario && (
        <TimelineView scenario={scenario} />
      )}
      {mode === "state" && <StateView />}
      {mode === "window" && <WindowView />}
    </figure>
  );
}

// Eksplisitt ubrukt-import for å fortelle lint at Clock er reservert til evt.
// fremtidig retransmit-timer i timeline-modus.
void Clock;
