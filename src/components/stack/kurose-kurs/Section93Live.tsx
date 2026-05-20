import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Volume2, AlertTriangle, Activity } from "lucide-react";

// Section93Live — fullskala interaktiv simulator for Kurose-seksjon 9.3 (VoIP/RTP).
//
// Pedagogisk hovedpoeng: VoIP pakker 20 ms lyd i en RTP-pakke. Nettet legger
// til jitter og packet-loss. Mottakeren har et playout-buffer som «venter
// litt» før avspilling — det jevner ut jitteren, men koster latens. For
// pakker som likevel mangler bruker mottakeren Packet Loss Concealment
// (PLC): gjentar siste 20 ms eller interpolerer.
//
// Side-by-side: vi viser samme nettforhold over UDP/RTP (det vi bruker) og
// over TCP (det vi ikke bruker for sann-tids samtale). TCP-versjonen
// retransmitterer hver tapt pakke, så stream-en stopper og hopp-pauser —
// brukeren ser konkret hvorfor TCP er feil verktøy her.

const PACKET_INTERVAL_MS = 20; // hver RTP-pakke bærer 20 ms tale
const TOTAL_PACKETS = 40;
const TIME_SCALE = 0.25; // 1 ms simulert = 0.25 ms vegg-tid → ~4x raskere

type PathId = "rtp" | "tcp";

type RtpPacket = {
  id: number;
  tCapture: number; // når pakka ble samplet på sender (i simulert ms)
  tSend: number; // når pakka faktisk gikk ut (tCapture + 2 ms koding)
  tArrive: number; // ankomst på mottaker — Infinity hvis tapt
  tPlay: number; // når mottakeren ønsker å spille (tCapture + bufferMs)
  dropped: boolean;
};

type TcpPacket = {
  id: number;
  tCapture: number;
  tSendOrig: number;
  tFirstArrive: number; // ankomst-tid for første forsøk (Infinity hvis tapt)
  tArrive: number; // endelig levert (etter evt. retransmits)
  tPlay: number; // strikt ordnet — venter på alle tidligere pakker
  retransmits: number;
};

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function simulateRtp(
  baseLatencyMs: number,
  jitterMs: number,
  lossPct: number,
  bufferMs: number,
  seed: number,
): RtpPacket[] {
  const rng = makeRng(seed);
  const out: RtpPacket[] = [];
  for (let i = 0; i < TOTAL_PACKETS; i++) {
    const tCapture = i * PACKET_INTERVAL_MS;
    const tSend = tCapture + 2;
    const dropped = rng() * 100 < lossPct;
    const jitterOffset = (rng() * 2 - 1) * jitterMs;
    const dNet = Math.max(1, baseLatencyMs + jitterOffset);
    const tArrive = dropped ? Infinity : tSend + dNet;
    const tPlay = tCapture + bufferMs;
    out.push({ id: i, tCapture, tSend, tArrive, tPlay, dropped });
  }
  return out;
}

function simulateTcp(
  baseLatencyMs: number,
  jitterMs: number,
  lossPct: number,
  seed: number,
): TcpPacket[] {
  const rng = makeRng(seed ^ 0x5a5a5a5a);
  const out: TcpPacket[] = [];
  // RTT brukes til retransmit-timeout (RTO). Estimer som 2 * baseLatencyMs + jitter.
  const rtt = 2 * baseLatencyMs + jitterMs;
  const rto = Math.max(60, rtt * 1.5); // klassisk RTO grov: 1.5x RTT
  let lastDeliveredTime = 0;
  for (let i = 0; i < TOTAL_PACKETS; i++) {
    const tCapture = i * PACKET_INTERVAL_MS;
    const tSend = tCapture + 2;
    const lost = rng() * 100 < lossPct;
    const jitterOffset = (rng() * 2 - 1) * jitterMs;
    const dNet = Math.max(1, baseLatencyMs + jitterOffset);
    let retransmits = 0;
    let tArrive: number;
    const tFirstArrive = lost ? Infinity : tSend + dNet;
    if (!lost) {
      tArrive = tSend + dNet;
    } else {
      // Vent på timeout, retransmittér. Anta 1 retransmit nok (forenkling).
      // I virkeligheten kan det ta 1-2 RTO og opp til 2 retransmits.
      let attempt = tSend;
      let arrived = false;
      while (!arrived && retransmits < 4) {
        attempt += rto;
        const lost2 = rng() * 100 < lossPct;
        if (!lost2) {
          tArrive = attempt + Math.max(1, baseLatencyMs + (rng() * 2 - 1) * jitterMs);
          arrived = true;
          break;
        }
        retransmits++;
      }
      if (!arrived) {
        // gi opp
        tArrive = attempt + 1000;
      } else {
        retransmits += 1;
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      tArrive = tArrive!;
    }
    // TCP: strikt rekkefølge. Mottakeren venter til ALLE forrige er levert.
    const tPlay = Math.max(tArrive, lastDeliveredTime + PACKET_INTERVAL_MS);
    lastDeliveredTime = tPlay;
    out.push({
      id: i,
      tCapture,
      tSendOrig: tSend,
      tFirstArrive,
      tArrive,
      tPlay,
      retransmits,
    });
  }
  return out;
}

type RtpState = "preCapture" | "inFlight" | "dropped" | "lateUsedPlc" | "inBuffer" | "played";

function rtpStateAt(p: RtpPacket, t: number): RtpState {
  if (t < p.tCapture) return "preCapture";
  if (p.dropped) {
    // Pakka mistet — PLC tar over når playout-tid kommer
    if (t >= p.tPlay) return "lateUsedPlc";
    return "inFlight"; // simuleringsmessig "venter på pakken som aldri kommer"
  }
  if (t < p.tArrive) return "inFlight";
  if (p.tArrive > p.tPlay) {
    // Pakka ankom for sent → PLC dekker hullet
    if (t >= p.tPlay) return "lateUsedPlc";
    return "inFlight";
  }
  if (t < p.tPlay) return "inBuffer";
  if (t < p.tPlay + PACKET_INTERVAL_MS) return "played";
  return "played";
}

type TcpState = "preCapture" | "inFlight" | "retransmit" | "inOrderBuffer" | "played";

function tcpStateAt(p: TcpPacket, t: number, prevPlayed: number): TcpState {
  if (t < p.tCapture) return "preCapture";
  if (t < Math.min(p.tArrive, p.tFirstArrive === Infinity ? Infinity : p.tFirstArrive)) {
    return "inFlight";
  }
  if (p.tFirstArrive === Infinity && t < p.tArrive) return "retransmit";
  // Pakka er ankommet
  if (t < p.tPlay) return "inOrderBuffer";
  if (p.tPlay > prevPlayed) return "played";
  return "played";
}

export function Section93Live() {
  const [baseLatencyMs, setBaseLatencyMs] = useState(40);
  const [jitterMs, setJitterMs] = useState(30);
  const [lossPct, setLossPct] = useState(2);
  const [bufferMs, setBufferMs] = useState(60);
  const [seed, setSeed] = useState(11);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  const rtpPackets = useMemo(
    () => simulateRtp(baseLatencyMs, jitterMs, lossPct, bufferMs, seed),
    [baseLatencyMs, jitterMs, lossPct, bufferMs, seed],
  );
  const tcpPackets = useMemo(
    () => simulateTcp(baseLatencyMs, jitterMs, lossPct, seed),
    [baseLatencyMs, jitterMs, lossPct, seed],
  );

  const totalMs = TOTAL_PACKETS * PACKET_INTERVAL_MS + bufferMs + 800;

  useEffect(() => {
    if (!playing) {
      lastRef.current = 0;
      return;
    }
    function tick(now: number) {
      if (!lastRef.current) lastRef.current = now;
      const dtWall = now - lastRef.current;
      lastRef.current = now;
      const dtSim = dtWall / TIME_SCALE;
      setT((prev) => {
        const next = prev + dtSim;
        if (next > totalMs) return 0;
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [playing, totalMs]);

  function reset() {
    setT(0);
    setPlaying(true);
  }
  function resample() {
    setSeed((s) => (s + 1) & 0xffffffff);
    setT(0);
  }

  // Stats
  const rtpStats = useMemo(() => {
    let played = 0;
    let plc = 0;
    let inFlight = 0;
    for (const p of rtpPackets) {
      const s = rtpStateAt(p, t);
      if (s === "played") played++;
      else if (s === "lateUsedPlc") plc++;
      else if (s === "inFlight") inFlight++;
    }
    return { played, plc, inFlight };
  }, [rtpPackets, t]);

  const tcpStats = useMemo(() => {
    let played = 0;
    let retransmit = 0;
    let inFlight = 0;
    let prev = 0;
    let maxDelay = 0;
    let stallDuration = 0;
    let lastPlayedTime = 0;
    for (const p of tcpPackets) {
      const s = tcpStateAt(p, t, prev);
      if (s === "played" && t >= p.tPlay) {
        played++;
        prev = p.tPlay;
        // tracker stall: hvor lang pause var det før denne pakka ble levert?
        if (lastPlayedTime > 0) {
          const gap = p.tPlay - lastPlayedTime - PACKET_INTERVAL_MS;
          if (gap > 30) stallDuration += gap;
        }
        lastPlayedTime = p.tPlay;
        const d = p.tPlay - p.tCapture;
        if (d > maxDelay) maxDelay = d;
      } else if (s === "retransmit") retransmit++;
      else if (s === "inFlight") inFlight++;
    }
    return { played, retransmit, inFlight, maxDelay, stallDuration };
  }, [tcpPackets, t]);

  // ---------- Layout ----------
  // SVG: 820 × 480.
  // Top half (40..210): RTP/UDP-bane.
  // Bottom half (240..420): TCP-bane.
  // Bunn (430..480): tids-akse + stats.

  const SENDER_X = 60;
  const NET_X0 = 180;
  const NET_X1 = 580;
  const BUFFER_X = 660;
  const PLAYBACK_X = 760;
  const RTP_Y = 120;
  const TCP_Y = 320;

  // Tids-vindu vi viser: ~siste 200 simulerte ms, men også viser pakker «på vei».
  // Vi bruker en lokal mapping: pakke-id 0..TOTAL_PACKETS → ingen tids-akse,
  // bare progresjon via state. Pakker tegnes som sirkler langs banen.

  // RTP-pakke-pos: i samme rytme som Section91 — basert på state.
  function rtpXY(p: RtpPacket, t: number): { x: number; y: number; color: string; label: string } | null {
    const s = rtpStateAt(p, t);
    if (s === "preCapture") return null;
    if (s === "inFlight") {
      if (p.dropped) {
        // Tegn som "borte" — falle ned midt på linja
        const u = Math.min(1, (t - p.tSend) / Math.max(20, baseLatencyMs));
        const x = SENDER_X + (NET_X1 - SENDER_X) * u * 0.5;
        const yFall = RTP_Y + u * 40;
        return { x, y: yFall, color: "fill-red-500", label: "✗" };
      }
      const u = (t - p.tSend) / Math.max(1, p.tArrive - p.tSend);
      const x = SENDER_X + (NET_X1 - SENDER_X) * Math.min(1, Math.max(0, u));
      return { x, y: RTP_Y, color: "fill-brand", label: `${p.id + 1}` };
    }
    if (s === "inBuffer") {
      return { x: BUFFER_X, y: RTP_Y, color: "fill-purple-500", label: `${p.id + 1}` };
    }
    if (s === "lateUsedPlc") {
      // Vis et lite PLC-symbol på playback-stedet
      return { x: PLAYBACK_X, y: RTP_Y, color: "fill-amber-500", label: "PLC" };
    }
    if (s === "played") {
      return { x: PLAYBACK_X, y: RTP_Y, color: "fill-success", label: `${p.id + 1}` };
    }
    if (s === "dropped") return null;
    return null;
  }

  function tcpXY(p: TcpPacket, t: number): { x: number; y: number; color: string; label: string } | null {
    const s = tcpStateAt(p, t, 0);
    if (s === "preCapture") return null;
    if (s === "inFlight") {
      // På vei
      const u = (t - p.tSendOrig) / Math.max(1, p.tArrive - p.tSendOrig);
      const x = SENDER_X + (NET_X1 - SENDER_X) * Math.min(1, Math.max(0, u));
      const color = p.retransmits > 0 ? "fill-amber-500" : "fill-cyan-500";
      return { x, y: TCP_Y, color, label: p.retransmits > 0 ? "RX" : `${p.id + 1}` };
    }
    if (s === "retransmit") {
      return { x: SENDER_X + 30, y: TCP_Y, color: "fill-red-500", label: "?" };
    }
    if (s === "inOrderBuffer") {
      return { x: BUFFER_X, y: TCP_Y, color: "fill-purple-500", label: `${p.id + 1}` };
    }
    if (s === "played") {
      return { x: PLAYBACK_X, y: TCP_Y, color: "fill-success", label: `${p.id + 1}` };
    }
    return null;
  }

  const glassToGlassRtp = 2 + baseLatencyMs + bufferMs;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">
          VoIP/RTP vs. TCP: hvorfor sann-tids samtale ikke kan vente på retransmits
        </span>
        <span className="ml-auto font-mono">
          RTP glass-til-glass: ~{Math.round(glassToGlassRtp)} ms
        </span>
      </div>

      <svg viewBox="0 0 820 480" className="w-full h-auto bg-muted/10">
        {/* Top bane — RTP/UDP */}
        <BaneLabel y={56} color="text-brand" title="RTP/UDP" subtitle="ingen retransmit · PLC dekker tap" />

        {/* Top: sender → nettverk → jitter-buffer → playback */}
        <Stage x={SENDER_X} y={RTP_Y} label="Sender" sub="Opus encode" />
        <Cloud cx={(NET_X0 + NET_X1) / 2} cy={RTP_Y} rx={210} ry={36} />
        <text x={(NET_X0 + NET_X1) / 2} y={RTP_Y - 44} textAnchor="middle" className="fill-brand text-[10px] font-semibold">
          NETT (UDP)
        </text>
        <Stage x={BUFFER_X} y={RTP_Y} label="Jitter-buf" sub={`${bufferMs} ms`} stroke="stroke-purple-500" />
        <Stage x={PLAYBACK_X} y={RTP_Y} label="Playback" sub="20 ms / pakke" stroke="stroke-success" />

        <line x1={SENDER_X + 30} y1={RTP_Y} x2={NET_X0} y2={RTP_Y} className="stroke-muted-foreground/30" strokeWidth={2} strokeDasharray="3 3" />
        <line x1={NET_X1} y1={RTP_Y} x2={BUFFER_X - 30} y2={RTP_Y} className="stroke-muted-foreground/30" strokeWidth={2} strokeDasharray="3 3" />
        <line x1={BUFFER_X + 30} y1={RTP_Y} x2={PLAYBACK_X - 30} y2={RTP_Y} className="stroke-muted-foreground/30" strokeWidth={2} strokeDasharray="3 3" />

        {/* RTP pakker */}
        {rtpPackets.map((p) => {
          const xy = rtpXY(p, t);
          if (!xy) return null;
          return (
            <g key={`rtp-${p.id}`}>
              <circle cx={xy.x} cy={xy.y} r={9} className={`${xy.color} stroke-background`} strokeWidth={1.5} />
              <text x={xy.x} y={xy.y + 3} textAnchor="middle" className="fill-background text-[8px] font-bold pointer-events-none">
                {xy.label}
              </text>
            </g>
          );
        })}

        {/* RTP playback-bølge (jevn taktstrek) */}
        <PlaybackTick x={PLAYBACK_X} y={RTP_Y} t={t} bufferMs={bufferMs} />

        {/* RTP stats-rad */}
        <text x={20} y={196} className="fill-foreground text-[10px]">
          <tspan className="fill-success font-semibold">Spilt:</tspan> {rtpStats.played}
          {"   "}
          <tspan className="fill-amber-500 font-semibold">PLC-fyll:</tspan> {rtpStats.plc}
          {"   "}
          <tspan className="fill-brand font-semibold">På linja:</tspan> {rtpStats.inFlight}
          {"   "}
          <tspan className="fill-muted-foreground italic">Mund-til-øre:</tspan>{" "}
          <tspan className="font-mono">~{Math.round(glassToGlassRtp)} ms</tspan>
        </text>

        {/* Divider mellom de to banene */}
        <line x1={20} y1={220} x2={800} y2={220} className="stroke-muted-foreground/30" strokeDasharray="4 4" />

        {/* Bottom bane — TCP */}
        <BaneLabel y={250} color="text-cyan-700 dark:text-cyan-300" title="TCP (kontrafaktisk)" subtitle="strikt rekkefølge · retransmits på tap" />

        <Stage x={SENDER_X} y={TCP_Y} label="Sender" sub="TCP send-buf" />
        <Cloud cx={(NET_X0 + NET_X1) / 2} cy={TCP_Y} rx={210} ry={36} />
        <text x={(NET_X0 + NET_X1) / 2} y={TCP_Y - 44} textAnchor="middle" className="fill-cyan-700 dark:fill-cyan-300 text-[10px] font-semibold">
          NETT (TCP)
        </text>
        <Stage x={BUFFER_X} y={TCP_Y} label="Re-order" sub="ordens-kø" stroke="stroke-purple-500" />
        <Stage x={PLAYBACK_X} y={TCP_Y} label="Playback" sub="venter på alle" stroke="stroke-success" />

        <line x1={SENDER_X + 30} y1={TCP_Y} x2={NET_X0} y2={TCP_Y} className="stroke-muted-foreground/30" strokeWidth={2} strokeDasharray="3 3" />
        <line x1={NET_X1} y1={TCP_Y} x2={BUFFER_X - 30} y2={TCP_Y} className="stroke-muted-foreground/30" strokeWidth={2} strokeDasharray="3 3" />
        <line x1={BUFFER_X + 30} y1={TCP_Y} x2={PLAYBACK_X - 30} y2={TCP_Y} className="stroke-muted-foreground/30" strokeWidth={2} strokeDasharray="3 3" />

        {/* TCP-pakker */}
        {tcpPackets.map((p) => {
          const xy = tcpXY(p, t);
          if (!xy) return null;
          return (
            <g key={`tcp-${p.id}`}>
              <circle cx={xy.x} cy={xy.y} r={9} className={`${xy.color} stroke-background`} strokeWidth={1.5} />
              <text x={xy.x} y={xy.y + 3} textAnchor="middle" className="fill-background text-[8px] font-bold pointer-events-none">
                {xy.label}
              </text>
            </g>
          );
        })}

        {/* TCP stats */}
        <text x={20} y={406} className="fill-foreground text-[10px]">
          <tspan className="fill-success font-semibold">Spilt:</tspan> {tcpStats.played}
          {"   "}
          <tspan className="fill-red-500 font-semibold">RX-vent:</tspan> {tcpStats.retransmit}
          {"   "}
          <tspan className="fill-cyan-500 font-semibold">På linja:</tspan> {tcpStats.inFlight}
          {"   "}
          <tspan className="fill-muted-foreground italic">Maks delay:</tspan>{" "}
          <tspan className="font-mono">~{Math.round(tcpStats.maxDelay)} ms</tspan>
          {"   "}
          <tspan className="fill-red-500 italic">Stall-tid:</tspan>{" "}
          <tspan className="font-mono">~{Math.round(tcpStats.stallDuration)} ms</tspan>
        </text>

        {/* Tid-cursor */}
        <text x={20} y={444} className="fill-foreground text-[10px] font-mono">
          t = {Math.round(t)} ms simulert
        </text>
        <line
          x1={20 + Math.min(780, (t / totalMs) * 780)}
          y1={448}
          x2={20 + Math.min(780, (t / totalMs) * 780)}
          y2={470}
          className="stroke-brand"
          strokeWidth={2}
        />
        <rect x={20} y={448} width={780} height={22} className="fill-muted/30 stroke-muted-foreground/30" strokeWidth={1} />
      </svg>

      {/* Kontroller */}
      <div className="px-4 py-3 border-t border-border bg-muted/20 grid gap-3 md:grid-cols-2">
        <SliderField label="Base-forsinkelse i nettet" value={baseLatencyMs} min={5} max={300} step={5} unit="ms"
          onChange={setBaseLatencyMs}
          help="Én-veis propagasjon. > 150 ms gjør samtale ubehagelig." />
        <SliderField label="Jitter (±)" value={jitterMs} min={0} max={150} step={5} unit="ms"
          onChange={setJitterMs}
          help="Variasjon over base. Jitter er det playout-bufferet absorberer." />
        <SliderField label="Jitter-buffer (playout-delay)" value={bufferMs} min={0} max={400} step={10} unit="ms"
          onChange={setBufferMs}
          help="Stor → få sene pakker (alt skjult med PLC), mye delay. Mål: 2–3× jitter." accent="purple" />
        <SliderField label="Pakketap" value={lossPct} min={0} max={15} step={0.5} unit="%"
          onChange={setLossPct}
          help="UDP/RTP: PLC dekker; TCP: retransmits sender stream-en i stall." accent="red" />
      </div>

      <div className="px-4 py-2 flex flex-wrap items-center gap-2 border-t border-border bg-muted/10">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "Pause" : "Spill"}
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          <RotateCcw className="h-3 w-3" /> Restart
        </button>
        <button
          onClick={resample}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          Ny seed
        </button>

        <span className="ml-2 text-[10px] text-muted-foreground">Scenarier:</span>
        <PresetBtn label="Fiber" onClick={() => { setBaseLatencyMs(20); setJitterMs(8); setLossPct(0); setBufferMs(40); setT(0); }} />
        <PresetBtn label="4G" onClick={() => { setBaseLatencyMs(45); setJitterMs(40); setLossPct(1.5); setBufferMs(120); setT(0); }} />
        <PresetBtn label="WiFi-i-kø" onClick={() => { setBaseLatencyMs(60); setJitterMs(80); setLossPct(3); setBufferMs(180); setT(0); }} />
        <PresetBtn label="Satellitt" onClick={() => { setBaseLatencyMs(300); setJitterMs(40); setLossPct(2); setBufferMs(150); setT(0); }} />
        <PresetBtn label="Dårlig WiFi" onClick={() => { setBaseLatencyMs(80); setJitterMs(120); setLossPct(8); setBufferMs(200); setT(0); }} />
      </div>

      {/* Legend */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <span className="inline-block w-2 h-2 rounded-full bg-brand" /> RTP-pakke på linja
        <span className="inline-block w-2 h-2 rounded-full bg-cyan-500" /> TCP-pakke (første forsøk)
        <span className="inline-block w-2 h-2 rounded-full bg-amber-500" /> TCP retransmit / PLC-fyll
        <span className="inline-block w-2 h-2 rounded-full bg-purple-500" /> i mottakerens buffer
        <span className="inline-block w-2 h-2 rounded-full bg-success" /> spilt av i tide
        <span className="inline-block w-2 h-2 rounded-full bg-red-500" /> tapt / venter på retransmit
      </div>

      <Verdict rtpStats={rtpStats} tcpStats={tcpStats} baseLatencyMs={baseLatencyMs} bufferMs={bufferMs} lossPct={lossPct} />
    </div>
  );
}

function Verdict({
  rtpStats,
  tcpStats,
  baseLatencyMs,
  bufferMs,
  lossPct,
}: {
  rtpStats: { played: number; plc: number; inFlight: number };
  tcpStats: { played: number; retransmit: number; inFlight: number; maxDelay: number; stallDuration: number };
  baseLatencyMs: number;
  bufferMs: number;
  lossPct: number;
}) {
  const total = TOTAL_PACKETS;
  const rtpQuality = total > 0 ? (rtpStats.played / total) * 100 : 0;
  const plcRate = total > 0 ? (rtpStats.plc / total) * 100 : 0;
  const m2e = 2 + baseLatencyMs + bufferMs;

  let icon = <Volume2 className="h-4 w-4 text-success" />;
  let title = "Begge baner leverer i dette scenariet";
  let body =
    "Med lite tap og lav jitter klarer både RTP og TCP å spille av i takt. RTP-en er bare litt raskere fordi den ikke trenger handshakes.";
  let color = "text-success";

  if (lossPct >= 3 && tcpStats.stallDuration > 100) {
    icon = <AlertTriangle className="h-4 w-4 text-red-500" />;
    title = `TCP-pause: ~${Math.round(tcpStats.stallDuration)} ms stall, RTP gir ${plcRate.toFixed(0)} % PLC-fyll`;
    body = `TCP retransmitterer hver tapt pakke og stopper avspillingen mens den venter. RTP-en dropper bare hullet og lar PLC fylle inn — for tale er det knapt hørbart, men en ${Math.round(tcpStats.stallDuration)} ms TCP-pause høres som et tydelig stutter.`;
    color = "text-red-500";
  } else if (m2e > 150) {
    icon = <AlertTriangle className="h-4 w-4 text-amber-500" />;
    title = `Mund-til-øre ~${Math.round(m2e)} ms — over 150 ms-grensa`;
    body = `Bufferet på ${bufferMs} ms gjør at få pakker går tapt, men samtalen begynner å føles «fjern» eller med overlapping-pause. Senk bufferet hvis jitteren lar deg.`;
    color = "text-amber-500";
  } else if (rtpQuality > 90 && plcRate < 5) {
    icon = <Activity className="h-4 w-4 text-success" />;
    title = "RTP-banen er smidig og holder lav latens";
    body = `${rtpQuality.toFixed(0)} % av pakkene avspilt i tide, kun ${plcRate.toFixed(0)} % PLC-fyll. Mund-til-øre ~${Math.round(m2e)} ms — i grønn sone for naturlig samtale.`;
    color = "text-success";
  }
  return (
    <div className="px-4 py-2 border-t border-border bg-muted/10 flex items-start gap-2">
      {icon}
      <div>
        <div className={`text-[12px] font-semibold ${color}`}>{title}</div>
        <div className="text-[11px] text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}

function BaneLabel({ y, color, title, subtitle }: { y: number; color: string; title: string; subtitle: string }) {
  return (
    <g transform={`translate(20, ${y})`}>
      <text className={`${color} text-[11px] font-semibold`}>{title}</text>
      <text y={14} className="fill-muted-foreground text-[9px]">{subtitle}</text>
    </g>
  );
}

function Stage({ x, y, label, sub, stroke }: { x: number; y: number; label: string; sub: string; stroke?: string }) {
  return (
    <g>
      <rect
        x={x - 30}
        y={y - 22}
        width={60}
        height={44}
        rx={4}
        className={`fill-card ${stroke ?? "stroke-muted-foreground/60"}`}
        strokeWidth={1.5}
      />
      <text x={x} y={y - 4} textAnchor="middle" className="fill-foreground text-[9px] font-semibold">{label}</text>
      <text x={x} y={y + 8} textAnchor="middle" className="fill-muted-foreground text-[8px]">{sub}</text>
    </g>
  );
}

function Cloud({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} className="fill-brand/5 stroke-brand/30" strokeWidth={1.5} strokeDasharray="3 2" />;
}

function PlaybackTick({ x, y, t, bufferMs }: { x: number; y: number; t: number; bufferMs: number }) {
  const frameNow = Math.floor((t - bufferMs) / PACKET_INTERVAL_MS);
  return (
    <g>
      <line x1={x} y1={y - 32} x2={x} y2={y - 22} className="stroke-success" strokeWidth={2} />
      <text x={x} y={y - 36} textAnchor="middle" className="fill-success text-[9px] font-semibold">
        ramme {Math.max(0, frameNow + 1)}
      </text>
    </g>
  );
}

function SliderField({
  label, value, min, max, step, unit, onChange, help, accent,
}: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (n: number) => void; help?: string; accent?: "purple" | "red";
}) {
  const accentClass =
    accent === "purple" ? "accent-purple-500" :
    accent === "red" ? "accent-red-500" :
    "accent-brand";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-medium text-foreground">{label}</label>
        <span className="text-xs font-mono text-foreground">{value} {unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`mt-1 w-full ${accentClass}`} />
      {help && <p className="mt-0.5 text-[10px] text-muted-foreground">{help}</p>}
    </div>
  );
}

function PresetBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="rounded border border-border bg-background px-2 py-1 text-[10px] hover:border-brand/60">
      {label}
    </button>
  );
}
