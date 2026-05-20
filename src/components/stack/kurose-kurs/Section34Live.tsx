import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from "lucide-react";

// Interaktiv visualisering av seksjon 3.5 — TCP.
// Tre paneler:
//   1) 3-veis handshake: SYN, SYN-ACK, ACK med ISN-utveksling og state-transisjoner.
//   2) Sliding window: pålitelig datatransport med kumulative ACKer og RTO-timeout.
//   3) Fast retransmit: 3 dup ACK = retransmitter umiddelbart, uten å vente på RTO.

type Tab = "handshake" | "window" | "fast-retransmit";

export function Section34Live() {
  const [tab, setTab] = useState<Tab>("handshake");
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-muted/30 flex-wrap">
        <TabBtn active={tab === "handshake"} onClick={() => setTab("handshake")}>
          1. 3-veis handshake
        </TabBtn>
        <TabBtn active={tab === "window"} onClick={() => setTab("window")}>
          2. Sliding window + RTO
        </TabBtn>
        <TabBtn active={tab === "fast-retransmit"} onClick={() => setTab("fast-retransmit")}>
          3. Fast retransmit (3 dup ACK)
        </TabBtn>
      </div>
      {tab === "handshake" && <HandshakePanel />}
      {tab === "window" && <SlidingWindowPanel />}
      {tab === "fast-retransmit" && <FastRetransmitPanel />}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-brand/15 text-brand"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// ============================================================
// PANEL 1: 3-veis handshake
// ============================================================

type HsStep = {
  title: string;
  body: string;
  /** Pakke som nettopp er sendt — null = ingen */
  packet: null | {
    from: "client" | "server";
    flags: string;
    seq: string;
    ack: string;
  };
  /** Posisjon i lufta (0=avsender, 1=mottaker), eller null=ingen */
  pos: number | null;
  clientState: string;
  serverState: string;
};

const HS_STEPS: HsStep[] = [
  {
    title: "Start: klient CLOSED, server LISTEN",
    body: "Server har kalt bind() og listen() på port 443 — den er klar til å akseptere innkommende forbindelser. Klient er CLOSED og har ingen forbindelse. Ingen pakker ennå.",
    packet: null,
    pos: null,
    clientState: "CLOSED",
    serverState: "LISTEN",
  },
  {
    title: "Klient sender SYN",
    body: "Klient kaller connect(). Stacken velger en ISN (Initial Sequence Number) — tilfeldig for å hindre spoofing — la oss si 47281. Det sendes en SYN-pakke uten data: SYN-flagg satt, seq=47281, ack=0. Klient går til SYN_SENT.",
    packet: {
      from: "client",
      flags: "SYN",
      seq: "seq=47281",
      ack: "—",
    },
    pos: 0.5,
    clientState: "SYN_SENT",
    serverState: "LISTEN",
  },
  {
    title: "Server svarer med SYN-ACK",
    body: "Server mottar SYN. Den allokerer minne for ny forbindelse, velger SIN egen ISN (f.eks. 88934), og sender SYN-ACK: SYN- og ACK-flagg satt, seq=88934 (server-ISN), ack=47282 (klient-ISN + 1 = «forventer denne neste»). Server går til SYN_RCVD.",
    packet: {
      from: "server",
      flags: "SYN+ACK",
      seq: "seq=88934",
      ack: "ack=47282",
    },
    pos: 0.5,
    clientState: "SYN_SENT",
    serverState: "SYN_RCVD",
  },
  {
    title: "Klient sender ACK",
    body: "Klient ser server-ISN, sender ACK: bare ACK-flagg, seq=47282 (sin egen neste), ack=88935 (server-ISN + 1). Denne ACKen kan også ha med data — vanligvis ikke for HTTP, men f.eks. TLS-handshake sender første data her. Klient går til ESTABLISHED.",
    packet: {
      from: "client",
      flags: "ACK",
      seq: "seq=47282",
      ack: "ack=88935",
    },
    pos: 0.5,
    clientState: "ESTABLISHED",
    serverState: "SYN_RCVD",
  },
  {
    title: "Begge er ESTABLISHED",
    body: "Server mottar ACK, går til ESTABLISHED. Begge sider har bekreftet hverandres ISN. Den fulle 4-tuppelen (klient-IP, klient-port, server-IP, server-port) er nå reservert i begge sockets-tabeller. Data kan flyte begge veier.",
    packet: null,
    pos: null,
    clientState: "ESTABLISHED",
    serverState: "ESTABLISHED",
  },
  {
    title: "Hvorfor 3 pakker, ikke 2?",
    body: "Hvorfor ikke bare SYN → SYN-ACK og ferdig (2-veis)? Fordi ingen av partene da vet at den ANDRE har sett deres ISN. Klient vet etter SYN-ACK at serveren mottok SYN. Men server vet ikke at klient mottok SYN-ACK — før den får ACKen tilbake. Med 3 pakker har begge sider bevis på at den andre er der. (Tema relevant for half-open angrep og SYN-flood-mitigering.)",
    packet: null,
    pos: null,
    clientState: "ESTABLISHED",
    serverState: "ESTABLISHED",
  },
];

function HandshakePanel() {
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const step = HS_STEPS[stepIdx];
  const nextStep = HS_STEPS[Math.min(stepIdx + 1, HS_STEPS.length - 1)];

  useEffect(() => {
    if (!playing) return;
    let raf: number;
    let last = performance.now();
    const SPEED = 1 / 1800;
    function tick(now: number) {
      const dt = now - last;
      last = now;
      setProgress((p) => {
        const np = p + dt * SPEED;
        if (np >= 1) {
          setStepIdx((i) => {
            if (i + 1 >= HS_STEPS.length) {
              setPlaying(false);
              return i;
            }
            return i + 1;
          });
          return 0;
        }
        return np;
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const packetPos = useMemo(() => {
    if (step.packet === null || step.pos === null) return null;
    const sameSender = nextStep.packet?.from === step.packet.from;
    // animer fra avsender (0) til mottaker (1)
    const start = step.packet.from === "client" ? 0 : 1;
    const end = step.packet.from === "client" ? 1 : 0;
    // bare interpoler hvis vi ikke skifter pakke
    if (sameSender) {
      return start + (end - start) * progress;
    }
    return start + (end - start) * progress;
  }, [step, nextStep, progress]);

  function go(delta: number) {
    setStepIdx((i) => Math.max(0, Math.min(HS_STEPS.length - 1, i + delta)));
    setProgress(0);
  }
  function reset() {
    setStepIdx(0);
    setProgress(0);
    setPlaying(false);
  }

  return (
    <div>
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">{step.title}</span>
        <span className="ml-auto font-mono">
          Steg {stepIdx + 1} / {HS_STEPS.length}
        </span>
      </div>

      <svg viewBox="0 0 800 280" className="w-full h-auto bg-muted/10">
        <EndpointBox x={20} y={60} label="Klient" sub="10.0.0.50:51001" tone="brand" />
        <EndpointBox x={620} y={60} label="Server" sub="195.88.55.16:443" tone="success" />

        {/* State-bånd under hver endepunkt */}
        <g transform="translate(20, 150)">
          <rect width={160} height={26} rx={4} className="fill-brand/5 stroke-brand/40" strokeWidth={1} />
          <text x={80} y={11} textAnchor="middle" className="fill-muted-foreground text-[9px]">
            client state
          </text>
          <text x={80} y={22} textAnchor="middle" className="fill-foreground text-[11px] font-mono font-semibold">
            {step.clientState}
          </text>
        </g>
        <g transform="translate(620, 150)">
          <rect width={160} height={26} rx={4} className="fill-success/5 stroke-success/40" strokeWidth={1} />
          <text x={80} y={11} textAnchor="middle" className="fill-muted-foreground text-[9px]">
            server state
          </text>
          <text x={80} y={22} textAnchor="middle" className="fill-foreground text-[11px] font-mono font-semibold">
            {step.serverState}
          </text>
        </g>

        {/* Lenkelinje */}
        <line
          x1={180}
          y1={100}
          x2={620}
          y2={100}
          className="stroke-muted-foreground/40"
          strokeWidth={2}
          strokeDasharray="5 4"
        />

        {/* Pakke i lufta */}
        {step.packet !== null && packetPos !== null && (
          <HandshakePacket
            x={180 + packetPos * (620 - 180)}
            y={100}
            packet={step.packet}
          />
        )}

        {/* Forklaringsboks under */}
        <g transform="translate(60, 200)">
          <rect width={680} height={60} rx={4} className="fill-card stroke-border" strokeWidth={1} />
          <text x={340} y={20} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
            Hva pakken inneholder
          </text>
          <text x={340} y={36} textAnchor="middle" className="fill-muted-foreground text-[11px] font-mono">
            {step.packet
              ? `flags=[${step.packet.flags}]  ${step.packet.seq}  ${step.packet.ack}`
              : "— ingen pakke i lufta —"}
          </text>
          <text x={340} y={52} textAnchor="middle" className="fill-muted-foreground text-[10px]">
            {step.packet
              ? step.packet.from === "client"
                ? "Klient → Server"
                : "Server → Klient"
              : "begge sider venter / ferdig"}
          </text>
        </g>
      </svg>

      <div className="px-4 py-3 text-sm text-muted-foreground border-t border-border">
        {step.body}
      </div>

      <div className="px-4 py-2 flex flex-wrap items-center gap-1.5 border-t border-border bg-muted/20">
        <button
          onClick={() => go(-1)}
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
          {playing ? "Pause" : "Spill av"}
        </button>
        <button
          onClick={() => go(1)}
          disabled={stepIdx === HS_STEPS.length - 1}
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
        <div className="ml-2 flex gap-1">
          {HS_STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setStepIdx(i);
                setProgress(0);
              }}
              className={`h-1.5 w-3 rounded-full ${
                i === stepIdx
                  ? "bg-brand"
                  : i < stepIdx
                    ? "bg-muted-foreground/40"
                    : "bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function EndpointBox({
  x,
  y,
  label,
  sub,
  tone,
}: {
  x: number;
  y: number;
  label: string;
  sub: string;
  tone: "brand" | "success";
}) {
  const w = 160;
  const h = 80;
  const stroke = tone === "brand" ? "stroke-brand" : "stroke-success";
  const fill = tone === "brand" ? "fill-brand/10" : "fill-success/10";
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} className={`${fill} ${stroke}`} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + 26} textAnchor="middle" className="fill-foreground text-[12px] font-semibold">
        {label}
      </text>
      <text x={x + w / 2} y={y + 44} textAnchor="middle" className="fill-muted-foreground text-[10px] font-mono">
        {sub}
      </text>
      <circle
        cx={tone === "brand" ? x + w : x}
        cy={y + h / 2}
        r={5}
        className={tone === "brand" ? "fill-brand stroke-background" : "fill-success stroke-background"}
        strokeWidth={1.5}
      />
    </g>
  );
}

function HandshakePacket({
  x,
  y,
  packet,
}: {
  x: number;
  y: number;
  packet: { from: "client" | "server"; flags: string; seq: string; ack: string };
}) {
  const w = 120;
  const h = 38;
  const fill = packet.from === "client" ? "fill-brand" : "fill-success";
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx={4}
        className={`${fill} stroke-background`}
        strokeWidth={1.5}
      />
      <text x={x} y={y - 8} textAnchor="middle" className="fill-background text-[10px] font-bold">
        {packet.flags}
      </text>
      <text x={x} y={y + 4} textAnchor="middle" className="fill-background text-[9px] font-mono">
        {packet.seq}
      </text>
      <text x={x} y={y + 14} textAnchor="middle" className="fill-background text-[9px] font-mono">
        {packet.ack}
      </text>
    </g>
  );
}

// ============================================================
// PANEL 2: Sliding window + RTO timeout
// ============================================================

type WinEvent = {
  kind: "data" | "ack" | "retx";
  seq: number;
  /** for data: byte-offset start (kumulativ ACK-rom); for ACK: «forventer denne neste» */
  byteStart?: number;
  tStart: number;
  tEnd: number;
  lost: boolean;
};

function simSlidingWindow(seed: number, lossRate: number, segments: number, windowSize: number) {
  const TXT = 1;
  const PROP = 4;
  const RTO = 14;
  const events: WinEvent[] = [];
  const acked = new Array<boolean>(segments).fill(false);
  const lastSent = new Array<number>(segments).fill(-1);
  const attempts = new Array<number>(segments).fill(0);
  // ACK ankomst (kumulativ ACK = max sammenhengende mottatt + 1)
  // Vi modellerer ACK per data-pakke som ankommer mottaker; ACK refererer "neste forventet".
  let base = 0;
  let nextSeq = 0;
  let t = 0;
  let retransmits = 0;

  // ack-arrival
  const ackArrival = new Array<number>(segments).fill(-1);
  let safety = 0;

  while (base < segments && safety < 3000) {
    safety++;
    while (nextSeq < base + windowSize && nextSeq < segments) {
      sendSw(nextSeq);
      nextSeq++;
    }

    // Neste hendelse: enten neste ACK eller timeout på base
    let nextAckTime = Infinity;
    for (let i = base; i < nextSeq; i++) {
      if (!acked[i] && ackArrival[i] > t && ackArrival[i] < nextAckTime) {
        nextAckTime = ackArrival[i];
      }
    }
    const baseTimeout = lastSent[base] >= 0 ? lastSent[base] + RTO : Infinity;

    if (nextAckTime <= baseTimeout) {
      t = nextAckTime;
      // Marker som acked, men husk: TCP er kumulativ, så hopp frem base maks
      // Vi forenkler: hvis ACK(i) ankommer, marker alle [base..i] som "implisitt acked"
      // (faktisk, vi modellerer ack-arrival som "ACK for denne seq ankommet")
      for (let i = base; i < nextSeq; i++) {
        if (ackArrival[i] > 0 && ackArrival[i] <= t) {
          acked[i] = true;
        }
      }
      while (base < segments && acked[base]) base++;
    } else {
      t = baseTimeout;
      // Retransmit base (TCP klassisk RTO: bare base)
      attempts[base]++;
      retransmits++;
      ackArrival[base] = -1;
      lastSent[base] = -1;
      sendSwRetx(base);
    }
  }
  return { events, totalTime: t, retransmits };

  function sendSw(seq: number) {
    const attempt = attempts[seq];
    const dataLost = shouldLoseLocal(seed, seq, attempt, lossRate);
    const tStart = t;
    const tEnd = tStart + TXT + PROP;
    events.push({
      kind: "data",
      seq,
      byteStart: seq * 100,
      tStart,
      tEnd,
      lost: dataLost,
    });
    lastSent[seq] = tStart;
    if (!dataLost) {
      const ackLost = shouldLoseLocal(seed ^ 0xa5a5, seq, attempt + 1000, lossRate);
      const tAckStart = tEnd;
      const tAckEnd = tAckStart + TXT + PROP;
      events.push({ kind: "ack", seq, tStart: tAckStart, tEnd: tAckEnd, lost: ackLost });
      if (!ackLost) ackArrival[seq] = tAckEnd;
    }
    t = tStart + TXT;
  }
  function sendSwRetx(seq: number) {
    const attempt = attempts[seq];
    const dataLost = shouldLoseLocal(seed, seq, attempt, lossRate);
    const tStart = t;
    const tEnd = tStart + TXT + PROP;
    events.push({
      kind: "retx",
      seq,
      byteStart: seq * 100,
      tStart,
      tEnd,
      lost: dataLost,
    });
    lastSent[seq] = tStart;
    if (!dataLost) {
      const ackLost = shouldLoseLocal(seed ^ 0xa5a5, seq, attempt + 1000, lossRate);
      const tAckStart = tEnd;
      const tAckEnd = tAckStart + TXT + PROP;
      events.push({ kind: "ack", seq, tStart: tAckStart, tEnd: tAckEnd, lost: ackLost });
      if (!ackLost) ackArrival[seq] = tAckEnd;
    }
    t = tStart + TXT;
  }
}

function shouldLoseLocal(seed: number, seq: number, attempt: number, lossRate: number): boolean {
  let h = seed ^ (seq * 73856093) ^ (attempt * 19349663);
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 0x5bd1e995) >>> 0;
  h = (h ^ (h >>> 15)) >>> 0;
  const r = (h % 10000) / 10000;
  return r < lossRate;
}

function SlidingWindowPanel() {
  const [lossRate, setLossRate] = useState(0.1);
  const [windowSize, setWindowSize] = useState(4);
  const [seed, setSeed] = useState(7);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const rafRef = useRef<number | null>(null);

  const SEGMENTS = 12;
  const sim = useMemo(
    () => simSlidingWindow(seed, lossRate, SEGMENTS, windowSize),
    [seed, lossRate, windowSize],
  );
  const maxTime = sim.totalTime;

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const SPEED = 8;
    function tick(now: number) {
      const dt = (now - last) / 1000;
      last = now;
      setT((prev) => {
        const next = prev + dt * SPEED;
        if (next >= maxTime) {
          setPlaying(false);
          return maxTime;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, maxTime]);

  function resetSim() {
    setT(0);
    setPlaying(false);
  }

  // Beregn aktuelt sender-vindu basert på tid
  const { base, nextSeq } = useMemo(() => {
    let b = 0;
    let ns = 0;
    const seenAck = new Set<number>();
    for (const ev of sim.events) {
      if (ev.tStart <= t && (ev.kind === "data" || ev.kind === "retx") && ev.seq + 1 > ns) {
        ns = ev.seq + 1;
      }
      if (ev.kind === "ack" && !ev.lost && ev.tEnd <= t) {
        seenAck.add(ev.seq);
      }
    }
    // base = laveste seq som ikke er acked
    while (seenAck.has(b)) b++;
    return { base: b, nextSeq: ns };
  }, [sim, t]);

  return (
    <div>
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3 flex-wrap">
        <span className="font-medium text-foreground">
          TCP sliding window: kumulativ ACK, RTO-timeout, retransmisjon
        </span>
        <span className="ml-auto font-mono">
          base={base} · nextSeq={nextSeq} · t={t.toFixed(1)}/{maxTime.toFixed(0)}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3 p-4 border-b border-border">
        <div>
          <div className="flex items-baseline justify-between">
            <label className="text-xs font-medium text-foreground">Tap-rate</label>
            <span className="text-xs font-mono">{(lossRate * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={0.3}
            step={0.02}
            value={lossRate}
            onChange={(e) => {
              setLossRate(Number(e.target.value));
              resetSim();
            }}
            className="w-full accent-brand"
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label className="text-xs font-medium text-foreground">Vindu (cwnd)</label>
            <span className="text-xs font-mono">{windowSize}</span>
          </div>
          <input
            type="range"
            min={2}
            max={6}
            step={1}
            value={windowSize}
            onChange={(e) => {
              setWindowSize(Number(e.target.value));
              resetSim();
            }}
            className="w-full accent-brand"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={() => {
              setSeed((s) => s + 1);
              resetSim();
            }}
            className="text-xs px-2 py-1.5 rounded border border-border hover:bg-muted"
          >
            🎲 Nytt tap
          </button>
        </div>
      </div>

      {/* Window-visualisering: 12 segmenter på rad */}
      <div className="px-4 py-3 border-b border-border">
        <div className="text-xs text-muted-foreground mb-1">Avsender-vindu (12 segmenter)</div>
        <div className="flex gap-1">
          {Array.from({ length: SEGMENTS }, (_, i) => {
            const isAcked = i < base;
            const isInWindow = i >= base && i < Math.min(nextSeq, base + windowSize);
            const isPending = i >= base + windowSize;
            return (
              <div
                key={i}
                className={`flex-1 h-7 rounded text-[10px] font-mono flex items-center justify-center border ${
                  isAcked
                    ? "bg-success/20 border-success text-success"
                    : isInWindow
                      ? "bg-brand/20 border-brand text-brand animate-pulse"
                      : isPending
                        ? "bg-muted/30 border-border text-muted-foreground"
                        : "bg-muted/30 border-border text-muted-foreground"
                }`}
              >
                {i}
              </div>
            );
          })}
        </div>
        <div className="mt-1 flex gap-3 text-[10px] text-muted-foreground">
          <span>
            <span className="inline-block w-3 h-3 bg-success/20 border border-success rounded-sm mr-1 align-middle" />
            Acked (≤ base)
          </span>
          <span>
            <span className="inline-block w-3 h-3 bg-brand/20 border border-brand rounded-sm mr-1 align-middle" />
            I vinduet (sent, ikke acked)
          </span>
          <span>
            <span className="inline-block w-3 h-3 bg-muted/30 border border-border rounded-sm mr-1 align-middle" />
            Ikke sendt
          </span>
        </div>
      </div>

      {/* Time-space-diagram */}
      <div className="p-4">
        <TimeSpaceDiagram sim={sim} t={t} maxTime={maxTime} />
      </div>

      <div className="px-4 py-2 flex items-center gap-2 border-t border-border bg-muted/20">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "Pause" : t >= maxTime ? "Spill igjen" : "Spill av"}
        </button>
        <button
          onClick={resetSim}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
        <input
          type="range"
          min={0}
          max={maxTime}
          step={0.1}
          value={t}
          onChange={(e) => {
            setT(Number(e.target.value));
            setPlaying(false);
          }}
          className="flex-1 accent-brand"
        />
      </div>

      <div className="px-4 py-3 border-t border-border text-sm text-muted-foreground">
        Sliding window er TCP-versjonen av GBN/SR-hybriden: pakker pipelinerer i et vindu, kumulativ
        ACK avanserer <span className="font-mono">base</span>, og hvis ACK uteblir lenger enn RTO
        retransmitteres <span className="font-mono">base</span> (RTO-timeout). Dette er
        «klassisk» TCP — neste panel viser fast retransmit, optimaliseringen som ikke trenger vente.
      </div>
    </div>
  );
}

function TimeSpaceDiagram({
  sim,
  t,
  maxTime,
}: {
  sim: ReturnType<typeof simSlidingWindow>;
  t: number;
  maxTime: number;
}) {
  const H = 180;
  const W = 740;
  const padL = 80;
  const padR = 18;
  const padT = 20;
  const padB = 20;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const senderY = padT + 8;
  const receiverY = padT + plotH - 8;
  const xForTime = (tt: number) => padL + (tt / maxTime) * plotW;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <line x1={padL} y1={senderY} x2={padL + plotW} y2={senderY} stroke="currentColor" opacity={0.4} strokeWidth={1} />
      <line x1={padL} y1={receiverY} x2={padL + plotW} y2={receiverY} stroke="currentColor" opacity={0.4} strokeWidth={1} />
      <text x={padL - 6} y={senderY + 4} textAnchor="end" className="fill-foreground text-[10px] font-medium">
        Avsender
      </text>
      <text x={padL - 6} y={receiverY + 4} textAnchor="end" className="fill-foreground text-[10px] font-medium">
        Mottaker
      </text>

      {/* Tidscursor */}
      <line x1={xForTime(t)} y1={padT} x2={xForTime(t)} y2={padT + plotH} stroke="#3b82f6" strokeWidth={1.5} opacity={0.5} />

      {sim.events.map((ev, idx) => {
        if (ev.tStart > t) return null;
        const fromY = ev.kind === "ack" ? receiverY : senderY;
        const toY = ev.kind === "ack" ? senderY : receiverY;
        const x1 = xForTime(ev.tStart);
        const x2Full = xForTime(ev.tEnd);
        const progress = Math.min(1, (t - ev.tStart) / (ev.tEnd - ev.tStart));
        const x2 = x1 + (x2Full - x1) * progress;
        const y2 = fromY + (toY - fromY) * progress;
        const isLost = ev.lost && progress >= 0.6;
        const showFull = !ev.lost && progress >= 1;
        const color =
          ev.kind === "ack" ? "#10b981" : ev.kind === "retx" ? "#f59e0b" : "#3b82f6";

        return (
          <g key={idx}>
            {showFull && (
              <line
                x1={x1}
                y1={fromY}
                x2={x2Full}
                y2={toY}
                stroke={color}
                strokeWidth={1}
                strokeDasharray={ev.kind === "ack" ? "3 2" : ""}
                opacity={0.5}
              />
            )}
            {!showFull && (
              <line
                x1={x1}
                y1={fromY}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={1.4}
                strokeDasharray={ev.kind === "ack" ? "3 2" : ""}
                opacity={ev.lost ? 0.4 : 0.85}
              />
            )}
            {!showFull && (
              <circle
                cx={x2}
                cy={y2}
                r={ev.kind === "ack" ? 2.5 : 3.5}
                fill={ev.lost ? "#999" : color}
                opacity={ev.lost && progress >= 0.6 ? 0 : 1}
              />
            )}
            {isLost && (
              <g transform={`translate(${x1 + (x2Full - x1) * 0.6}, ${fromY + (toY - fromY) * 0.6})`}>
                <line x1={-5} y1={-5} x2={5} y2={5} stroke="#ef4444" strokeWidth={2} />
                <line x1={-5} y1={5} x2={5} y2={-5} stroke="#ef4444" strokeWidth={2} />
              </g>
            )}
            {(ev.kind === "data" || ev.kind === "retx") && (
              <text x={x1 + 2} y={fromY - 4} fontSize={8} fill="currentColor" opacity={0.7}>
                {ev.kind === "retx" ? "↻" : ""}{ev.seq}
              </text>
            )}
          </g>
        );
      })}
      {/* legende */}
      <g transform="translate(80, 4)">
        <circle cx={4} cy={6} r={3} fill="#3b82f6" />
        <text x={12} y={9} className="fill-muted-foreground text-[9px]">DATA</text>
        <circle cx={52} cy={6} r={3} fill="#10b981" />
        <text x={60} y={9} className="fill-muted-foreground text-[9px]">ACK</text>
        <circle cx={96} cy={6} r={3} fill="#f59e0b" />
        <text x={104} y={9} className="fill-muted-foreground text-[9px]">retx (RTO)</text>
        <line x1={170} y1={6} x2={184} y2={6} stroke="#ef4444" strokeWidth={2} />
        <text x={188} y={9} className="fill-muted-foreground text-[9px]">tapt</text>
      </g>
    </svg>
  );
}

// ============================================================
// PANEL 3: Fast retransmit
// ============================================================

type FrEvent = {
  kind: "data" | "ack";
  seq: number;
  /** for ACK: "expected next" — kumulativ */
  ackNum?: number;
  /** for ACK: er det en dup-ACK? */
  isDup?: boolean;
  /** for data: er det fast retransmit? */
  isRetx?: boolean;
  tStart: number;
  tEnd: number;
  lost: boolean;
};

function buildFastRetransmitScenario(): { events: FrEvent[]; totalTime: number; dupAckMoment: number; retxMoment: number } {
  const TXT = 1;
  const PROP = 4;
  const events: FrEvent[] = [];
  let t = 0;
  // Send seg 0..6, men seg 1 mistes.
  const lossSeq = 1;
  // 0
  pushData(0, false);
  // 1 - mistes
  pushData(1, true);
  // 2, 3, 4 — alle ankommer men forventet er 1, så ACK = "forventer 1"
  pushData(2, false);
  pushData(3, false);
  pushData(4, false);
  pushData(5, false);

  // ACK for 0 ankommer normalt
  // ACK for 1 ankommer aldri (tapt)
  // ACK for 2,3,4,5 er ALLE "ack=1" (forventer 1) — dvs. dup-ACKs

  // Compute ACKs based on arrival:
  // For each data that's not lost, generate ACK. ACKnum = lowest expected (1 since seq 1 lost).
  for (const ev of events.slice()) {
    if (ev.kind !== "data" || ev.lost) continue;
    const ackNum = ev.seq < lossSeq ? ev.seq + 1 : lossSeq;
    const isDup = ev.seq > lossSeq;
    const tAckStart = ev.tEnd;
    const tAckEnd = tAckStart + TXT + PROP;
    events.push({
      kind: "ack",
      seq: ev.seq,
      ackNum,
      isDup,
      tStart: tAckStart,
      tEnd: tAckEnd,
      lost: false,
    });
  }

  // Sorter ACKs i tid for å finne 3. dup-ACK
  events.sort((a, b) => a.tStart - b.tStart);

  // Finn tre dup-ACKer på rad — etter den 3. retransmitter avsender seg 1
  let dupCount = 0;
  let third = -1;
  for (const ev of events) {
    if (ev.kind === "ack" && ev.isDup && !ev.lost) {
      dupCount++;
      if (dupCount === 3) {
        third = ev.tEnd;
        break;
      }
    }
  }
  const dupAckMoment = third;
  // Fast retransmit av seg 1 ved third
  const retxStart = third;
  const retxEnd = retxStart + TXT + PROP;
  events.push({
    kind: "data",
    seq: lossSeq,
    isRetx: true,
    tStart: retxStart,
    tEnd: retxEnd,
    lost: false,
  });
  // ACK fast retransmit: kumulativ — nå er alt opp til 5 mottatt, så ack=6
  events.push({
    kind: "ack",
    seq: lossSeq,
    ackNum: 6,
    isDup: false,
    tStart: retxEnd,
    tEnd: retxEnd + TXT + PROP,
    lost: false,
  });
  events.sort((a, b) => a.tStart - b.tStart);

  const totalTime = retxEnd + TXT + PROP + 2;
  return { events, totalTime, dupAckMoment, retxMoment: retxStart };

  function pushData(seq: number, lost: boolean) {
    const tStart = t;
    const tEnd = tStart + TXT + PROP;
    events.push({ kind: "data", seq, tStart, tEnd, lost });
    t = tStart + TXT;
  }
}

function FastRetransmitPanel() {
  const scenario = useMemo(() => buildFastRetransmitScenario(), []);
  const { events, totalTime, dupAckMoment, retxMoment } = scenario;
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const SPEED = 5;
    function tick(now: number) {
      const dt = (now - last) / 1000;
      last = now;
      setT((prev) => {
        const next = prev + dt * SPEED;
        if (next >= totalTime) {
          setPlaying(false);
          return totalTime;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, totalTime]);

  // Beregn dup-ACK-teller
  let dupCount = 0;
  for (const ev of events) {
    if (ev.kind === "ack" && ev.isDup && !ev.lost && ev.tEnd <= t) dupCount++;
  }
  const retxTriggered = t >= retxMoment;

  return (
    <div>
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">
          Fast retransmit: 3 dup-ACK → retransmitter umiddelbart (ikke vent på RTO)
        </span>
        <span className="ml-auto font-mono">t = {t.toFixed(1)} / {totalTime.toFixed(0)}</span>
      </div>

      {/* Status-bånd */}
      <div className="grid gap-2 sm:grid-cols-3 p-4 border-b border-border">
        <StatBox
          label="Pakke 1 (mistet)"
          value={t >= 1 ? (retxTriggered ? "Retransmittert ✓" : "Mistet på lenken ✗") : "Ikke sendt"}
          tone={retxTriggered ? "success" : t >= 1 ? "danger" : "muted"}
        />
        <StatBox
          label="Dup-ACK teller"
          value={`${dupCount} / 3`}
          tone={dupCount >= 3 ? "warn" : "muted"}
          highlight={dupCount === 3 && !retxTriggered}
        />
        <StatBox
          label="Fast retransmit"
          value={retxTriggered ? "TRIGGRET!" : dupCount >= 3 ? "Om litt…" : "Venter"}
          tone={retxTriggered ? "success" : "muted"}
        />
      </div>

      <div className="p-4">
        <FastRetransmitDiagram events={events} t={t} totalTime={totalTime} dupAckMoment={dupAckMoment} retxMoment={retxMoment} />
      </div>

      <div className="px-4 py-2 flex items-center gap-2 border-t border-border bg-muted/20">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "Pause" : t >= totalTime ? "Spill igjen" : "Spill av"}
        </button>
        <button
          onClick={() => {
            setT(0);
            setPlaying(false);
          }}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
        <input
          type="range"
          min={0}
          max={totalTime}
          step={0.1}
          value={t}
          onChange={(e) => {
            setT(Number(e.target.value));
            setPlaying(false);
          }}
          className="flex-1 accent-brand"
        />
      </div>

      <div className="px-4 py-3 border-t border-border text-sm text-muted-foreground space-y-2">
        <p>
          Pakke 1 mistes på lenken. Mottaker fortsetter å motta 2, 3, 4, 5 — men siden TCP ACK er
          kumulativ («forventer denne neste»), kvitterer mottakeren hver gang med
          <span className="font-mono"> ack=1</span>. Det er dup-ACKene.
        </p>
        <p>
          Når avsender har sett 3 dup-ACK på rad, vet den at noe er galt — mottakeren har fått minst
          3 senere segmenter, så pakke 1 er sannsynligvis tapt (ikke bare omstokket). Den
          retransmitterer pakke 1 umiddelbart, lenge før RTO ville utløpt.
        </p>
        <p>
          Etter retransmisjon ankommer pakke 1, og mottakeren kan endelig kvittere kumulativt for
          alt opp til 5 med <span className="font-mono">ack=6</span>. Forskjellen mot RTO-basert:
          fast retransmit reagerer på 1 RTT i stedet for 14 (typisk RTO ≈ 2-3·RTT, klemt opp av min-
          RTO 200 ms).
        </p>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  tone,
  highlight = false,
}: {
  label: string;
  value: string;
  tone: "success" | "danger" | "warn" | "muted";
  highlight?: boolean;
}) {
  const cls =
    tone === "success"
      ? "border-success/50 bg-success/10 text-success"
      : tone === "danger"
        ? "border-destructive/50 bg-destructive/10 text-destructive"
        : tone === "warn"
          ? "border-amber-500/50 bg-amber-500/10 text-amber-600"
          : "border-border bg-muted/30 text-muted-foreground";
  return (
    <div
      className={`rounded border p-2 ${cls} ${highlight ? "animate-pulse" : ""}`}
    >
      <div className="text-[10px] uppercase tracking-wide font-medium opacity-70">{label}</div>
      <div className="text-sm font-semibold mt-0.5 font-mono">{value}</div>
    </div>
  );
}

function FastRetransmitDiagram({
  events,
  t,
  totalTime,
  dupAckMoment,
  retxMoment,
}: {
  events: FrEvent[];
  t: number;
  totalTime: number;
  dupAckMoment: number;
  retxMoment: number;
}) {
  const H = 260;
  const W = 740;
  const padL = 80;
  const padR = 24;
  const padT = 26;
  const padB = 20;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const senderY = padT + 10;
  const receiverY = padT + plotH - 10;
  const xForTime = (tt: number) => padL + (tt / totalTime) * plotW;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <line x1={padL} y1={senderY} x2={padL + plotW} y2={senderY} stroke="currentColor" opacity={0.4} strokeWidth={1} />
      <line x1={padL} y1={receiverY} x2={padL + plotW} y2={receiverY} stroke="currentColor" opacity={0.4} strokeWidth={1} />
      <text x={padL - 6} y={senderY + 4} textAnchor="end" className="fill-foreground text-[10px] font-medium">
        Avsender
      </text>
      <text x={padL - 6} y={receiverY + 4} textAnchor="end" className="fill-foreground text-[10px] font-medium">
        Mottaker
      </text>

      {/* Marker dup-ACK-momentet og retx-momentet */}
      {t >= dupAckMoment && (
        <g>
          <line x1={xForTime(dupAckMoment)} y1={padT} x2={xForTime(dupAckMoment)} y2={padT + plotH} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
          <text x={xForTime(dupAckMoment) + 4} y={padT + 6} className="fill-amber-600 text-[9px] font-semibold">
            3. dup-ACK
          </text>
        </g>
      )}
      {t >= retxMoment && (
        <g>
          <line x1={xForTime(retxMoment)} y1={padT} x2={xForTime(retxMoment)} y2={padT + plotH} stroke="#10b981" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
          <text x={xForTime(retxMoment) + 4} y={padT + 18} className="fill-success text-[9px] font-semibold">
            Fast retransmit av 1
          </text>
        </g>
      )}

      {/* Tidscursor */}
      <line x1={xForTime(t)} y1={padT} x2={xForTime(t)} y2={padT + plotH} stroke="#3b82f6" strokeWidth={1.5} opacity={0.5} />

      {events.map((ev, idx) => {
        if (ev.tStart > t) return null;
        const fromY = ev.kind === "ack" ? receiverY : senderY;
        const toY = ev.kind === "ack" ? senderY : receiverY;
        const x1 = xForTime(ev.tStart);
        const x2Full = xForTime(ev.tEnd);
        const progress = Math.min(1, (t - ev.tStart) / (ev.tEnd - ev.tStart));
        const x2 = x1 + (x2Full - x1) * progress;
        const y2 = fromY + (toY - fromY) * progress;
        const isLost = ev.lost && progress >= 0.6;
        const showFull = !ev.lost && progress >= 1;
        let color = "#3b82f6";
        if (ev.kind === "ack") color = ev.isDup ? "#f59e0b" : "#10b981";
        if (ev.kind === "data" && ev.isRetx) color = "#10b981";

        return (
          <g key={idx}>
            {showFull && (
              <line
                x1={x1}
                y1={fromY}
                x2={x2Full}
                y2={toY}
                stroke={color}
                strokeWidth={1}
                strokeDasharray={ev.kind === "ack" ? "3 2" : ""}
                opacity={0.5}
              />
            )}
            {!showFull && (
              <line
                x1={x1}
                y1={fromY}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={1.5}
                strokeDasharray={ev.kind === "ack" ? "3 2" : ""}
                opacity={ev.lost ? 0.4 : 1}
              />
            )}
            {!showFull && (
              <circle
                cx={x2}
                cy={y2}
                r={ev.kind === "ack" ? 3 : 4}
                fill={ev.lost ? "#999" : color}
                opacity={ev.lost && progress >= 0.6 ? 0 : 1}
              />
            )}
            {isLost && (
              <g transform={`translate(${x1 + (x2Full - x1) * 0.6}, ${fromY + (toY - fromY) * 0.6})`}>
                <line x1={-5} y1={-5} x2={5} y2={5} stroke="#ef4444" strokeWidth={2} />
                <line x1={-5} y1={5} x2={5} y2={-5} stroke="#ef4444" strokeWidth={2} />
              </g>
            )}
            {/* labels */}
            {(ev.kind === "data") && (
              <text
                x={x1 + 2}
                y={fromY - 5}
                fontSize={9}
                fill="currentColor"
                opacity={0.8}
                fontWeight={ev.isRetx ? "bold" : "normal"}
              >
                {ev.isRetx ? "RETX " : ""}seq={ev.seq}
              </text>
            )}
            {ev.kind === "ack" && showFull && (
              <text
                x={x2Full - 2}
                y={toY - 4}
                fontSize={8}
                fill={ev.isDup ? "#f59e0b" : "#10b981"}
                opacity={0.9}
                textAnchor="end"
                fontWeight={ev.isDup ? "bold" : "normal"}
              >
                {ev.isDup ? "DUP " : ""}ack={ev.ackNum}
              </text>
            )}
          </g>
        );
      })}

      {/* Legende */}
      <g transform="translate(80, 4)">
        <circle cx={4} cy={6} r={3} fill="#3b82f6" />
        <text x={12} y={9} className="fill-muted-foreground text-[9px]">DATA</text>
        <circle cx={52} cy={6} r={3} fill="#10b981" />
        <text x={60} y={9} className="fill-muted-foreground text-[9px]">ACK</text>
        <circle cx={92} cy={6} r={3} fill="#f59e0b" />
        <text x={100} y={9} className="fill-muted-foreground text-[9px]">dup-ACK</text>
        <line x1={154} y1={6} x2={168} y2={6} stroke="#ef4444" strokeWidth={2} />
        <text x={172} y={9} className="fill-muted-foreground text-[9px]">tapt</text>
      </g>
    </svg>
  );
}
