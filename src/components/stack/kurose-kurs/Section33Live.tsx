import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

// Interaktiv visualisering av seksjon 3.4 — pålitelig data-transport.
// Tre protokoller side om side:
//   - Stop-and-Wait: send én, vent ACK, send neste.
//   - Go-Back-N (GBN): pipelined; ved tap retransmitter ALT fra første ubekreftet.
//   - Selective Repeat (SR): pipelined; ved tap retransmitter bare den ene tapte.
// Bruker velger tap-rate og window-størrelse. Simulasjonen kjører deterministisk
// (seed-basert) så alle tre ser samme tap-mønster.

const NUM_SEGMENTS = 20;
const TX_TIME = 1; // tid å sende én pakke (én tidsenhet)
const PROP_TIME = 4; // forplantning til mottaker (4 tidsenheter)
const TIMEOUT = 12; // RTO i tidsenheter
const TIME_STEP = 0.25; // simulasjons-step

type Protocol = "saw" | "gbn" | "sr";

const PROTO_LABEL: Record<Protocol, string> = {
  saw: "Stop-and-Wait",
  gbn: "Go-Back-N",
  sr: "Selective Repeat",
};
const PROTO_COLOR: Record<Protocol, string> = {
  saw: "#ef4444", // red
  gbn: "#f59e0b", // amber
  sr: "#10b981", // green
};

// Simulasjons-events: hver pakke- og ACK-bevegelse logges med ttx (sending start),
// trecv (når den nås mottaker), lost (kun for tapt segment).
type Event = {
  kind: "data" | "ack";
  seq: number;
  /** tid sendt fra avsender */
  tStart: number;
  /** tid pakken/ACK ankommer mottakeren/avsenderen (eller forsvinner) */
  tEnd: number;
  lost: boolean;
};

type SimResult = {
  events: Event[];
  totalTime: number;
  retransmits: number;
};

// Deterministisk PRNG basert på (seed, segNo, attempt). Returnerer true ved tap.
function shouldLose(seed: number, seq: number, attempt: number, lossRate: number): boolean {
  let h = seed ^ (seq * 73856093) ^ (attempt * 19349663);
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 0x5bd1e995) >>> 0;
  h = (h ^ (h >>> 15)) >>> 0;
  const r = (h % 10000) / 10000;
  return r < lossRate;
}

// Simuler Stop-and-Wait
function simStopAndWait(seed: number, lossRate: number, segments: number): SimResult {
  const events: Event[] = [];
  let t = 0;
  let retransmits = 0;
  for (let seq = 0; seq < segments; seq++) {
    let attempt = 0;
    let acked = false;
    while (!acked) {
      const dataLost = shouldLose(seed, seq, attempt, lossRate);
      const tDataStart = t;
      const tDataEnd = tDataStart + TX_TIME + PROP_TIME;
      events.push({
        kind: "data",
        seq,
        tStart: tDataStart,
        tEnd: tDataEnd,
        lost: dataLost,
      });

      if (dataLost) {
        // venter timeout
        t = tDataStart + TIMEOUT;
        attempt++;
        retransmits++;
        continue;
      }
      // ACK kan også miste — bruk attempt + 1000 for å ikke koble til data-tap
      const ackLost = shouldLose(seed ^ 0xa5a5a5a5, seq, attempt + 1000, lossRate);
      const tAckStart = tDataEnd;
      const tAckEnd = tAckStart + TX_TIME + PROP_TIME;
      events.push({
        kind: "ack",
        seq,
        tStart: tAckStart,
        tEnd: tAckEnd,
        lost: ackLost,
      });
      if (ackLost) {
        // venter timeout
        t = tDataStart + TIMEOUT;
        attempt++;
        retransmits++;
        continue;
      }
      // suksess
      acked = true;
      t = tAckEnd;
    }
  }
  return { events, totalTime: t, retransmits };
}

// Simuler Go-Back-N
// Forenklet GBN: pakke-driven simulasjon der vi følger "sender-vinduet".
function simGoBackN(
  seed: number,
  lossRate: number,
  segments: number,
  windowSize: number,
): SimResult {
  const events: Event[] = [];
  // Per-segment: nåværende attempt
  const attempts = new Array<number>(segments).fill(0);
  // base = første ubekreftet, nextSeq = neste å sende
  let base = 0;
  let nextSeq = 0;
  let t = 0;
  let retransmits = 0;
  // ack-arrival-times: når ACK for hver seq blir mottatt; -1 = tapt eller ikke sendt
  const dataArrival = new Array<number>(segments).fill(-1); // når data ankom mottaker
  const ackArrival = new Array<number>(segments).fill(-1);
  // Last-sent times per seq (for timeout-test)
  const lastSent = new Array<number>(segments).fill(-1);

  // For å unngå evig løkke
  let safety = 0;

  while (base < segments && safety < 5000) {
    safety++;
    // Send mens vindu tillater
    while (nextSeq < base + windowSize && nextSeq < segments) {
      const attempt = attempts[nextSeq];
      const dataLost = shouldLose(seed, nextSeq, attempt, lossRate);
      const tStart = t;
      const tEnd = tStart + TX_TIME + PROP_TIME;
      events.push({
        kind: "data",
        seq: nextSeq,
        tStart,
        tEnd,
        lost: dataLost,
      });
      lastSent[nextSeq] = tStart;
      if (!dataLost) {
        dataArrival[nextSeq] = tEnd;
        // ACK: kumulativ — ack-er senest mottatte i-rekke. Vi spawn'er likevel ACK per
        // segment slik at vi får et fysisk-spor å vise; logisk er det ACK opp til highest in-order.
        const ackLost = shouldLose(seed ^ 0xa5a5a5a5, nextSeq, attempt + 1000, lossRate);
        const tAckStart = tEnd;
        const tAckEnd = tAckStart + TX_TIME + PROP_TIME;
        events.push({
          kind: "ack",
          seq: nextSeq,
          tStart: tAckStart,
          tEnd: tAckEnd,
          lost: ackLost,
        });
        if (!ackLost) ackArrival[nextSeq] = tAckEnd;
      }
      // Sending tar TX_TIME — neste pakke kan starte rett etter
      t = tStart + TX_TIME;
      nextSeq++;
    }

    // Avansér tid: enten til neste ACK ankommer base, eller timeout
    // Finn neste hendelse
    const baseSentAt = lastSent[base];
    const timeoutTime = baseSentAt + TIMEOUT;
    // Hvilken ACK er neste å motta blant {base..nextSeq-1}?
    let nextAckTime = Infinity;
    for (let i = base; i < nextSeq; i++) {
      if (ackArrival[i] >= 0 && ackArrival[i] > t && ackArrival[i] < nextAckTime) {
        nextAckTime = ackArrival[i];
      }
    }

    if (nextAckTime < timeoutTime) {
      // Mottar ACK — avansér base (GBN: kumulativ, så hopp alle som har ACK frem til neste hull)
      t = nextAckTime;
      // GBN: hvis ACK(i) mottas og base <= i, base = i+1
      // Vi prosesserer alle ACKer som har ankommet i rekkefølge fra base
      // Først: finn høyeste i hvor alle ACK i [base, i] er ankommet og <= t
      // I praksis: høyeste sammenhengende mottatte
      let newBase = base;
      while (newBase < nextSeq && ackArrival[newBase] >= 0 && ackArrival[newBase] <= t) {
        newBase++;
      }
      base = newBase;
    } else {
      // Timeout — retransmitter ALT fra base til nextSeq-1
      t = timeoutTime;
      for (let i = base; i < nextSeq; i++) {
        attempts[i]++;
        retransmits++;
        // Marker som "skal sendes på nytt" ved å nullstille ackArrival og dataArrival
        ackArrival[i] = -1;
        dataArrival[i] = -1;
        lastSent[i] = -1;
      }
      nextSeq = base; // sett til base så while-løkken sender alt på nytt
    }
  }

  return { events, totalTime: t, retransmits };
}

// Simuler Selective Repeat
function simSelectiveRepeat(
  seed: number,
  lossRate: number,
  segments: number,
  windowSize: number,
): SimResult {
  const events: Event[] = [];
  const attempts = new Array<number>(segments).fill(0);
  const acked = new Array<boolean>(segments).fill(false);
  const lastSent = new Array<number>(segments).fill(-1);
  // ack-arrival per seq (-1 = ennå ikke ankommet)
  const ackArrival = new Array<number>(segments).fill(-1);
  // per-segment timer
  let base = 0;
  let nextSeq = 0;
  let t = 0;
  let retransmits = 0;
  let safety = 0;

  while (base < segments && safety < 5000) {
    safety++;
    // Send nye pakker i vinduet
    while (nextSeq < base + windowSize && nextSeq < segments) {
      sendSr(nextSeq);
      nextSeq++;
    }

    // Finn neste hendelse: enten neste ACK eller neste timeout
    let nextAckTime = Infinity;
    let nextAckSeq = -1;
    for (let i = base; i < nextSeq; i++) {
      if (!acked[i] && ackArrival[i] > t && ackArrival[i] < nextAckTime) {
        nextAckTime = ackArrival[i];
        nextAckSeq = i;
      }
    }
    let nextTimeoutTime = Infinity;
    let nextTimeoutSeq = -1;
    for (let i = base; i < nextSeq; i++) {
      if (!acked[i] && lastSent[i] >= 0) {
        const to = lastSent[i] + TIMEOUT;
        if (to > t && to < nextTimeoutTime) {
          nextTimeoutTime = to;
          nextTimeoutSeq = i;
        }
      }
    }

    if (nextAckTime <= nextTimeoutTime && nextAckSeq >= 0) {
      t = nextAckTime;
      acked[nextAckSeq] = true;
      // Avansér base mens den er acked
      while (base < segments && acked[base]) base++;
    } else if (nextTimeoutSeq >= 0) {
      t = nextTimeoutTime;
      attempts[nextTimeoutSeq]++;
      retransmits++;
      // Bare denne ene
      ackArrival[nextTimeoutSeq] = -1;
      lastSent[nextTimeoutSeq] = -1;
      // Re-send
      const localSeq = nextTimeoutSeq;
      // Sett t fremover for selve sendingen
      sendSr(localSeq);
    } else {
      // Ingenting å gjøre — bug? Bryt
      break;
    }
  }

  return { events, totalTime: t, retransmits };

  function sendSr(seq: number) {
    const attempt = attempts[seq];
    const dataLost = shouldLose(seed, seq, attempt, lossRate);
    const tStart = t;
    const tEnd = tStart + TX_TIME + PROP_TIME;
    events.push({ kind: "data", seq, tStart, tEnd, lost: dataLost });
    lastSent[seq] = tStart;
    if (!dataLost) {
      const ackLost = shouldLose(seed ^ 0xa5a5a5a5, seq, attempt + 1000, lossRate);
      const tAckStart = tEnd;
      const tAckEnd = tAckStart + TX_TIME + PROP_TIME;
      events.push({ kind: "ack", seq, tStart: tAckStart, tEnd: tAckEnd, lost: ackLost });
      if (!ackLost) ackArrival[seq] = tAckEnd;
    }
    t = tStart + TX_TIME; // neste kan starte etter sending
  }
}

// ============================================================

export function Section33Live() {
  const [lossRate, setLossRate] = useState(0.1);
  const [windowSize, setWindowSize] = useState(4);
  const [seed, setSeed] = useState(11);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const rafRef = useRef<number | null>(null);

  const sims = useMemo(() => {
    return {
      saw: simStopAndWait(seed, lossRate, NUM_SEGMENTS),
      gbn: simGoBackN(seed, lossRate, NUM_SEGMENTS, windowSize),
      sr: simSelectiveRepeat(seed, lossRate, NUM_SEGMENTS, windowSize),
    };
  }, [seed, lossRate, windowSize]);

  const maxTime = Math.max(sims.saw.totalTime, sims.gbn.totalTime, sims.sr.totalTime);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const SPEED = 18; // tidsenheter per sekund
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
  function restart() {
    setT(0);
    setPlaying(true);
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3 flex-wrap">
        <span className="font-medium text-foreground">
          Tre protokoller, samme tap-mønster: hvor mye «kaster» hver?
        </span>
        <span className="ml-auto font-mono">
          t = {t.toFixed(1)} / {maxTime.toFixed(0)} tidsenheter
        </span>
      </div>

      {/* Kontroller */}
      <div className="grid gap-4 md:grid-cols-3 p-4 border-b border-border">
        <div>
          <div className="flex items-baseline justify-between">
            <label className="text-xs font-medium text-foreground">Tap-rate per pakke</label>
            <span className="text-xs font-mono">{(lossRate * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={0.4}
            step={0.02}
            value={lossRate}
            onChange={(e) => {
              setLossRate(Number(e.target.value));
              resetSim();
            }}
            className="w-full accent-brand"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Skru opp tap-raten: se hvordan GBN må retransmittere mange flere pakker enn SR.
          </p>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label className="text-xs font-medium text-foreground">Window-størrelse (GBN/SR)</label>
            <span className="text-xs font-mono">N = {windowSize}</span>
          </div>
          <input
            type="range"
            min={2}
            max={8}
            step={1}
            value={windowSize}
            onChange={(e) => {
              setWindowSize(Number(e.target.value));
              resetSim();
            }}
            className="w-full accent-brand"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Større vindu = mer pipelining (bedre throughput uten tap), men ved GBN blir også
            «kast-bunken» større.
          </p>
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={() => {
              setSeed((s) => s + 1);
              resetSim();
            }}
            className="text-xs px-2 py-1.5 rounded border border-border hover:bg-muted"
          >
            🎲 Nytt tap-mønster
          </button>
          <button
            onClick={restart}
            className="text-xs px-2 py-1.5 rounded border border-brand/40 bg-brand/10 hover:bg-brand/20 flex-1"
          >
            <Play className="h-3 w-3 inline-block mr-1" /> Spill av
          </button>
        </div>
      </div>

      {/* Tre time-space-diagrammer */}
      <div className="space-y-1 p-4">
        <ProtocolPanel
          proto="saw"
          sim={sims.saw}
          t={t}
          maxTime={maxTime}
        />
        <ProtocolPanel
          proto="gbn"
          sim={sims.gbn}
          t={t}
          maxTime={maxTime}
        />
        <ProtocolPanel
          proto="sr"
          sim={sims.sr}
          t={t}
          maxTime={maxTime}
        />
      </div>

      {/* Kontroller nede */}
      <div className="px-4 py-2 flex items-center gap-2 border-t border-border bg-muted/20">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "Pause" : t >= maxTime ? "Spill av igjen" : "Spill av"}
        </button>
        <button
          onClick={resetSim}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          <RotateCcw className="h-3 w-3" /> Nullstill
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

      {/* Sammenligning */}
      <div className="px-4 py-3 border-t border-border bg-muted/10 grid gap-2 sm:grid-cols-3 text-xs">
        {(["saw", "gbn", "sr"] as Protocol[]).map((p) => {
          const s = sims[p];
          // Effektivitet: hvor mye av tida vi får ferdig 20 segmenter
          const eff = (NUM_SEGMENTS / s.totalTime) * 100;
          // Normaliser mot SR for å vise relativ throughput
          return (
            <div
              key={p}
              className="rounded border p-2 space-y-0.5"
              style={{ borderColor: PROTO_COLOR[p] }}
            >
              <div className="font-semibold" style={{ color: PROTO_COLOR[p] }}>
                {PROTO_LABEL[p]}
              </div>
              <div>
                Tid: <span className="font-mono">{s.totalTime.toFixed(0)}</span> enh.
              </div>
              <div>
                Retransmits: <span className="font-mono">{s.retransmits}</span>
              </div>
              <div>
                Throughput-proxy: <span className="font-mono">{eff.toFixed(2)}</span> seg/enh
              </div>
            </div>
          );
        })}
      </div>

      <details className="px-4 py-3 border-t border-border text-sm">
        <summary className="cursor-pointer font-medium">
          Hvorfor er Selective Repeat bedre når det er tap?
        </summary>
        <div className="mt-2 space-y-2 text-muted-foreground leading-relaxed">
          <p>
            <span className="text-foreground font-medium">Stop-and-Wait</span> sender én pakke om
            gangen. Throughput er bundet av RTT — selv om kanalen er bred, kan du ikke fylle den. Tap
            er billig å håndtere (bare resend én), men idle-tid dominerer.
          </p>
          <p>
            <span className="text-foreground font-medium">Go-Back-N</span> pipelinerer (sender N
            uavhengig av ACK) men har en straff: ved tap kaster mottakeren alle påfølgende pakker som
            er ute av rekkefølge, og avsender må sende ALT på nytt fra base. Ved høy tap-rate blir
            mange pakker sendt to ganger.
          </p>
          <p>
            <span className="text-foreground font-medium">Selective Repeat</span> bufrer ute-av-
            rekkefølge-pakker hos mottaker og ACK-er hver pakke individuelt. Ved tap retransmitterer
            avsender BARE den ene tapte. Det krever mer hukommelse hos mottaker og mer kompleks
            window-bokføring hos avsender, men effektiviteten gjør det verdt det.
          </p>
          <p>
            TCP er nesten Selective Repeat (SACK-opsjonen gjør den eksplisitt), men de originale
            ACK-ene er kumulative som GBN. Det er kompromisset Kurose kaller «GBN/SR-hybrid».
          </p>
        </div>
      </details>
    </div>
  );
}

// ============================================================
// Time-space-diagram for én protokoll
// ============================================================
function ProtocolPanel({
  proto,
  sim,
  t,
  maxTime,
}: {
  proto: Protocol;
  sim: SimResult;
  t: number;
  maxTime: number;
}) {
  const H = 130;
  const W = 720;
  const padL = 90;
  const padR = 18;
  const padT = 18;
  const padB = 18;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const senderY = padT + 6;
  const receiverY = padT + plotH - 6;
  const xForTime = (tt: number) => padL + (tt / maxTime) * plotW;
  const color = PROTO_COLOR[proto];

  // Hvor mange ACKer har vi mottatt opp til tid t? (= antall ferdige segmenter)
  let done = 0;
  for (const ev of sim.events) {
    if (ev.kind === "ack" && !ev.lost && ev.tEnd <= t) done++;
  }

  return (
    <div className="rounded border border-border bg-background p-2">
      <div className="flex items-baseline justify-between mb-1">
        <div className="text-xs font-semibold" style={{ color }}>
          {PROTO_LABEL[proto]}
        </div>
        <div className="text-[10px] text-muted-foreground">
          Ferdige segmenter: {done}/{NUM_SEGMENTS}
          {" · "}retransmits: {sim.retransmits}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* Sender og receiver-bånd */}
        <line
          x1={padL}
          y1={senderY}
          x2={padL + plotW}
          y2={senderY}
          stroke="currentColor"
          opacity={0.4}
          strokeWidth={1}
        />
        <line
          x1={padL}
          y1={receiverY}
          x2={padL + plotW}
          y2={receiverY}
          stroke="currentColor"
          opacity={0.4}
          strokeWidth={1}
        />
        <text x={padL - 6} y={senderY + 4} textAnchor="end" className="fill-foreground text-[10px] font-medium">
          Avsender
        </text>
        <text x={padL - 6} y={receiverY + 4} textAnchor="end" className="fill-foreground text-[10px] font-medium">
          Mottaker
        </text>

        {/* Tids-cursor */}
        <line
          x1={xForTime(t)}
          y1={padT}
          x2={xForTime(t)}
          y2={padT + plotH}
          stroke={color}
          strokeWidth={1.5}
          opacity={0.6}
        />

        {/* Pakker (DATA fra sender ned til mottaker, ACK fra mottaker opp til sender) */}
        {sim.events.map((ev, idx) => {
          if (ev.tStart > t) return null;
          const fromY = ev.kind === "data" ? senderY : receiverY;
          const toY = ev.kind === "data" ? receiverY : senderY;
          const x1 = xForTime(ev.tStart);
          const xEndFull = xForTime(ev.tEnd);
          // Hvor langt har pakken kommet?
          const progress = Math.min(1, (t - ev.tStart) / (ev.tEnd - ev.tStart));
          const x2 = x1 + (xEndFull - x1) * progress;
          const y2 = fromY + (toY - fromY) * progress;
          // Hvis pakken er tapt og progress > 0.6, vis et "tap-kryss"
          const isLost = ev.lost && progress >= 0.6;
          const showFullLine = !ev.lost && progress >= 1;
          const opacity = ev.kind === "ack" ? 0.7 : 1;
          return (
            <g key={idx} opacity={opacity}>
              {/* Full linje for ferdige pakker */}
              {showFullLine && (
                <line
                  x1={x1}
                  y1={fromY}
                  x2={xEndFull}
                  y2={toY}
                  stroke={ev.kind === "data" ? color : color}
                  strokeWidth={1}
                  strokeDasharray={ev.kind === "ack" ? "3 2" : ""}
                  opacity={0.5}
                />
              )}
              {/* Bevegelig linje (under animasjon) */}
              {!showFullLine && (
                <line
                  x1={x1}
                  y1={fromY}
                  x2={x2}
                  y2={y2}
                  stroke={color}
                  strokeWidth={1.2}
                  strokeDasharray={ev.kind === "ack" ? "3 2" : ""}
                  opacity={ev.lost ? 0.4 : 0.7}
                />
              )}
              {/* Pakke-prikk i bevegelse */}
              {!showFullLine && (
                <circle
                  cx={x2}
                  cy={y2}
                  r={ev.kind === "data" ? 3.5 : 2.5}
                  fill={ev.lost ? "#999" : color}
                  opacity={ev.lost && progress >= 0.6 ? 0 : 1}
                />
              )}
              {/* Tap-kryss */}
              {isLost && (
                <g
                  transform={`translate(${x1 + (xEndFull - x1) * 0.6}, ${fromY + (toY - fromY) * 0.6})`}
                >
                  <line x1={-4} y1={-4} x2={4} y2={4} stroke="#ef4444" strokeWidth={1.6} />
                  <line x1={-4} y1={4} x2={4} y2={-4} stroke="#ef4444" strokeWidth={1.6} />
                </g>
              )}
              {/* Sekvensnr-label på data-pakker, vises ved tStart på sender-laget */}
              {ev.kind === "data" && (
                <text
                  x={x1 + 2}
                  y={fromY - 3}
                  fontSize={8}
                  fill="currentColor"
                  opacity={0.65}
                >
                  {ev.seq}
                </text>
              )}
            </g>
          );
        })}

        {/* X-akse skala */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <text
            key={f}
            x={padL + f * plotW}
            y={H - 4}
            fontSize={8}
            fill="currentColor"
            opacity={0.5}
            textAnchor="middle"
          >
            {(f * maxTime).toFixed(0)}
          </text>
        ))}
      </svg>
    </div>
  );
}
