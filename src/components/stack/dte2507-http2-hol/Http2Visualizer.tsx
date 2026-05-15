import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, SkipForward, RotateCcw, AlertTriangle } from "lucide-react";

// --------------------------------------------------------------------------
// HTTP/1.0 / 1.1 / 2 — side-ved-side tids-distanse-diagram.
//
// Hver «mode» kjører samme sett ressurs-forespørsler over en annen
// transport-modell og produserer ferdig pre-beregnet event-timeline.
// SVG-rendering sampler eventene mot `now` slik at man kan spille av,
// stege, eller dra slider for å se hvordan bytene faktisk renner ut.
// --------------------------------------------------------------------------

type Mode = "h1.0" | "h1.1-pipe" | "h1.1-x6" | "h2" | "h2-loss";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "h1.0", label: "HTTP/1.0", sub: "ny TCP per req" },
  { id: "h1.1-pipe", label: "HTTP/1.1 pipelining", sub: "serielle responser" },
  { id: "h1.1-x6", label: "HTTP/1.1 ×6", sub: "6 parallelle TCP" },
  { id: "h2", label: "HTTP/2", sub: "multipleksing" },
  { id: "h2-loss", label: "HTTP/2 + pakketap", sub: "TCP-lag HOL" },
];

const MODE_NOTE: Record<Mode, string> = {
  "h1.0":
    "Hver request får sin egen TCP-tilkobling. Du betaler 1 RTT handshake før hver eneste request. Slow start rekker aldri å varme opp.",
  "h1.1-pipe":
    "Én tilkobling, forespørslene sendes på rekke uten å vente. Server svarer i samme rekkefølge — én stor fil først holder de andre på vent. HOL på HTTP-laget.",
  "h1.1-x6":
    "Nettlesernes løsning: opp til 6 parallelle TCP-tilkoblinger mot samme vert. Rar form for «cheating» — 6 separate slow start, ingen fairness, men praktisk skalerer.",
  h2: "Én TCP-tilkobling, mange streams. Frames fra ulike streams interleaves, så ingen stor ressurs blokkerer de små. Multipleksing løser HOL på HTTP-laget.",
  "h2-loss":
    "Én pakke mistes i TCP. Alle streams bak må vente på retransmit — selv ferdige frames må ligge på lager til hullet fylles. Transport-lag HOL → motivasjonen for HTTP/3/QUIC.",
};

// Per-ressurs «vekt» = byte-størrelse. Liten variasjon: én tyngre (image/video),
// noen middels (JS, CSS), resten små (ikoner, fonter).
type Resource = {
  id: number;
  label: string;
  bytes: number; // antall byte (vil bli oversatt til ms via båndbredde)
  color: string;
};

const COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

// Modell-konstanter (ms).
const RTT_MS = 60; // round-trip-tid
const HANDSHAKE_MS = RTT_MS; // TCP-handshake = 1 RTT
const REQUEST_MS = RTT_MS / 2; // GET → server = halv RTT
// Båndbredde 1 KB/ms ≈ 8 Mbps. 1 «byte-enhet» (i resource.bytes) = 1 ms overføring.
// Det gjør tallene lette å lese: en 80-byte ressurs tar 80 ms å sende ferdig.

function buildResources(count: number): Resource[] {
  // Én tung (320 ms), to middels (80 / 80 ms), resten små (20-40 ms) — gjenkjennelig
  // mønster: index.html-ish + main.js + style.css + ikoner.
  const list: Resource[] = [];
  const labels = [
    "index.html",
    "main.js",
    "style.css",
    "logo.png",
    "icon-1.svg",
    "icon-2.svg",
    "icon-3.svg",
    "icon-4.svg",
    "font.woff2",
    "hero.jpg",
    "vendor.js",
    "card-1.jpg",
    "card-2.jpg",
    "card-3.jpg",
    "card-4.jpg",
    "card-5.jpg",
  ];
  const sizes = [320, 80, 80, 60, 20, 20, 20, 20, 40, 200, 100, 50, 50, 50, 50, 50];
  for (let i = 0; i < count; i++) {
    list.push({
      id: i,
      label: labels[i] ?? `res-${i}`,
      bytes: sizes[i] ?? 40,
      color: COLORS[i % COLORS.length],
    });
  }
  return list;
}

// --------------------------------------------------------------------------
// Datamodell for tegningen: hvert lane (connection) har en sekvens av bars
// (handshake / request / response-body). Vi pre-bygger alle bars med start/end
// og lar render-laget filtrere/maske mot `now`.
// --------------------------------------------------------------------------

type Bar = {
  laneId: number; // hvilken kobling
  resId: number | null; // hvilken ressurs (null = control)
  kind: "handshake" | "request" | "body" | "stalled";
  tStart: number;
  tEnd: number;
};

type Marker = {
  t: number;
  laneId: number;
  label: string;
  kind: "loss" | "retransmit" | "deliver";
};

type Scenario = {
  bars: Bar[];
  markers: Marker[];
  laneLabels: string[];
  totalMs: number;
  firstByteMs: number; // time-to-first-byte for første respons
  lastByteMs: number; // tid alle ressurser er ferdig
};

function buildH10(resources: Resource[]): Scenario {
  // Én lane (egentlig én ny per request, men vi visualiserer som sekvens på
  // én rad så det er lett å lese den totale tida). Mark connection nr i label.
  const bars: Bar[] = [];
  let t = 0;
  let firstByte = Infinity;
  for (const r of resources) {
    const hsEnd = t + HANDSHAKE_MS;
    bars.push({ laneId: 0, resId: null, kind: "handshake", tStart: t, tEnd: hsEnd });
    const reqEnd = hsEnd + REQUEST_MS;
    bars.push({ laneId: 0, resId: r.id, kind: "request", tStart: hsEnd, tEnd: reqEnd });
    const bodyEnd = reqEnd + r.bytes;
    bars.push({ laneId: 0, resId: r.id, kind: "body", tStart: reqEnd, tEnd: bodyEnd });
    firstByte = Math.min(firstByte, reqEnd);
    t = bodyEnd;
  }
  return {
    bars,
    markers: [],
    laneLabels: [`TCP #1..#${resources.length} (ny per req)`],
    totalMs: t,
    firstByteMs: firstByte,
    lastByteMs: t,
  };
}

function buildH11Pipe(resources: Resource[]): Scenario {
  // Én TCP, alle requests sendes pipelined umiddelbart, responsene serialt.
  const bars: Bar[] = [];
  // Handshake først
  bars.push({ laneId: 0, resId: null, kind: "handshake", tStart: 0, tEnd: HANDSHAKE_MS });
  // Pipelined request-batch — én kort request-strime (alle GET-ene treffer
  // server samtidig, så vi visualiserer det som én bar)
  const reqStart = HANDSHAKE_MS;
  const reqEnd = reqStart + REQUEST_MS;
  bars.push({ laneId: 0, resId: null, kind: "request", tStart: reqStart, tEnd: reqEnd });
  // Server svarer i request-rekkefølge. Den første ressursen er ofte den
  // største (index.html / video) — HOL blokkerer alle små bak.
  let t = reqEnd;
  let firstByte = Infinity;
  for (const r of resources) {
    firstByte = Math.min(firstByte, t);
    bars.push({ laneId: 0, resId: r.id, kind: "body", tStart: t, tEnd: t + r.bytes });
    t += r.bytes;
  }
  return {
    bars,
    markers: [],
    laneLabels: ["TCP #1 (persistent + pipelining)"],
    totalMs: t,
    firstByteMs: firstByte,
    lastByteMs: t,
  };
}

function buildH11x6(resources: Resource[]): Scenario {
  // 6 lanes. Hver lane: handshake, så hent ressurs round-robin.
  const N_LANES = 6;
  const bars: Bar[] = [];
  // Per lane: når er den ledig? Start på 0 + handshake.
  const laneEnd = Array.from({ length: N_LANES }, () => 0);
  // Handshake-bar for hver lane
  for (let i = 0; i < N_LANES; i++) {
    bars.push({ laneId: i, resId: null, kind: "handshake", tStart: 0, tEnd: HANDSHAKE_MS });
    laneEnd[i] = HANDSHAKE_MS;
  }
  // Tilordne ressurser greedily: ta neste ressurs og legg den på laneEnd-min lane.
  let firstByte = Infinity;
  for (const r of resources) {
    // Velg lane som blir ledig først
    let li = 0;
    for (let i = 1; i < N_LANES; i++) if (laneEnd[i] < laneEnd[li]) li = i;
    const start = laneEnd[li];
    const reqEnd = start + REQUEST_MS;
    bars.push({ laneId: li, resId: r.id, kind: "request", tStart: start, tEnd: reqEnd });
    bars.push({ laneId: li, resId: r.id, kind: "body", tStart: reqEnd, tEnd: reqEnd + r.bytes });
    firstByte = Math.min(firstByte, reqEnd);
    laneEnd[li] = reqEnd + r.bytes;
  }
  const total = Math.max(...laneEnd);
  return {
    bars,
    markers: [],
    laneLabels: Array.from({ length: N_LANES }, (_, i) => `TCP #${i + 1}`),
    totalMs: total,
    firstByteMs: firstByte,
    lastByteMs: total,
  };
}

function buildH2(resources: Resource[]): Scenario {
  // Én TCP-tilkobling, alle streams interleaver. Vi modellerer som vektet
  // round-robin per byte slot. Hver ms ⇒ vi sender 1 byte fra én av de aktive
  // streamene. For visualisering: gi hver stream en egen lane (lett å se
  // hvilken farge dominerer over tid).
  const N = resources.length;
  const bars: Bar[] = [];
  bars.push({ laneId: 0, resId: null, kind: "handshake", tStart: 0, tEnd: HANDSHAKE_MS });
  const reqEnd = HANDSHAKE_MS + REQUEST_MS;
  bars.push({ laneId: 0, resId: null, kind: "request", tStart: HANDSHAKE_MS, tEnd: reqEnd });

  // Round-robin scheduler: hvert ms gir én av streamene en frame-byte.
  // Total tid = (sum bytes) + reqEnd. Streams blir ferdig i størrelse-rekkefølge.
  const remaining = resources.map((r) => r.bytes);
  const t0 = reqEnd;
  // Vi bygger «kontinuerlige» bars per stream — én bar per sammenhengende
  // tidsperiode der streamen sender. Med round-robin er det egentlig én byte
  // av gangen, så vi får tegnet det som mange små rect; men for å holde
  // SVG-en lett, slå sammen sammenhengende byte-slots.
  const streamSegments: { resId: number; t: number }[][] = resources.map(() => []);
  let t = t0;
  let active = resources.map((r) => r.id);
  while (active.length > 0) {
    for (const id of [...active]) {
      if (remaining[id] > 0) {
        streamSegments[id].push({ resId: id, t });
        remaining[id]--;
        t++;
      }
    }
    active = active.filter((id) => remaining[id] > 0);
  }
  // Konverter til bars — én bar per byte (helt OK; N*bytes ≤ ~2000).
  // For lesbarhet: hver ressurs på sin egen rad.
  for (let id = 0; id < N; id++) {
    for (const slot of streamSegments[id]) {
      bars.push({ laneId: id + 1, resId: id, kind: "body", tStart: slot.t, tEnd: slot.t + 1 });
    }
  }
  const total = t;
  return {
    bars,
    markers: [],
    laneLabels: ["TCP-kobling", ...resources.map((r) => `stream ${r.id}: ${r.label}`)],
    totalMs: total,
    firstByteMs: reqEnd,
    lastByteMs: total,
  };
}

function buildH2Loss(resources: Resource[], lossAtMs: number): Scenario {
  // Som H2, men ved t = reqEnd + lossAtMs - reqEnd faller én TCP-pakke. Alle
  // streams bak fryses til retransmit kommer (1 RTT senere) — det er det
  // klassiske TCP-lag HOL-bildet.
  const base = buildH2(resources);
  if (lossAtMs < base.firstByteMs) {
    // Tap før første byte gir et fancy edge case; klemmer det til etterpå.
    lossAtMs = base.firstByteMs + 10;
  }
  // Stall-vindu: vi venter 1 RTT på retransmit.
  const STALL_MS = RTT_MS;
  // Skift alle bars som starter etter lossAtMs ut med STALL_MS, og legg inn
  // en grå «stalled»-bar i mellom som dekker alle streams.
  const bars: Bar[] = [];
  for (const b of base.bars) {
    if (b.tStart >= lossAtMs) {
      bars.push({ ...b, tStart: b.tStart + STALL_MS, tEnd: b.tEnd + STALL_MS });
    } else if (b.tEnd > lossAtMs) {
      // Bar krysser tap-punktet → del den.
      bars.push({ ...b, tEnd: lossAtMs });
      bars.push({
        ...b,
        tStart: lossAtMs + STALL_MS,
        tEnd: b.tEnd + STALL_MS,
      });
    } else {
      bars.push(b);
    }
  }
  // Stalled-bånd på hver eneste lane som var aktiv
  const laneCount = base.laneLabels.length;
  for (let li = 0; li < laneCount; li++) {
    bars.push({
      laneId: li,
      resId: null,
      kind: "stalled",
      tStart: lossAtMs,
      tEnd: lossAtMs + STALL_MS,
    });
  }
  const markers: Marker[] = [
    { t: lossAtMs, laneId: 0, label: "TCP-pakke tapt", kind: "loss" },
    { t: lossAtMs + STALL_MS, laneId: 0, label: "retransmit ankommer", kind: "retransmit" },
  ];
  const total = base.totalMs + STALL_MS;
  return {
    bars,
    markers,
    laneLabels: base.laneLabels,
    totalMs: total,
    firstByteMs: base.firstByteMs,
    lastByteMs: total,
  };
}

function buildScenario(mode: Mode, count: number, lossAtMs: number, lossOn: boolean): Scenario {
  const resources = buildResources(count);
  switch (mode) {
    case "h1.0":
      return buildH10(resources);
    case "h1.1-pipe":
      return buildH11Pipe(resources);
    case "h1.1-x6":
      return buildH11x6(resources);
    case "h2":
      return buildH2(resources);
    case "h2-loss":
      return buildH2Loss(resources, lossOn ? lossAtMs : 1e9);
  }
}

// --------------------------------------------------------------------------
// Komponent
// --------------------------------------------------------------------------

export function Http2Visualizer() {
  const [mode, setMode] = useState<Mode>("h1.1-pipe");
  const [count, setCount] = useState(8);
  const [lossOn, setLossOn] = useState(true);
  const lossAtMs = 120;
  const [playing, setPlaying] = useState(false);
  const [now, setNow] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  const resources = useMemo(() => buildResources(count), [count]);
  const scenario = useMemo(
    () => buildScenario(mode, count, lossAtMs, lossOn),
    [mode, count, lossAtMs, lossOn],
  );

  // Avspilling — 1 sekund i sanntid = 600 ms simulering (ca. 1.6× speed).
  useEffect(() => {
    if (!playing) {
      lastTickRef.current = null;
      return;
    }
    const tick = (ts: number) => {
      if (lastTickRef.current == null) lastTickRef.current = ts;
      const dt = ts - lastTickRef.current;
      lastTickRef.current = ts;
      setNow((cur) => {
        const next = cur + dt * 0.6;
        if (next >= scenario.totalMs) {
          setPlaying(false);
          return scenario.totalMs;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, scenario.totalMs]);

  useEffect(() => {
    setNow(0);
    setPlaying(false);
  }, [mode, count, lossOn]);

  const reset = () => {
    setNow(0);
    setPlaying(false);
  };
  const stepForward = () => {
    setPlaying(false);
    const xs: number[] = [];
    for (const b of scenario.bars) {
      xs.push(b.tStart);
      xs.push(b.tEnd);
    }
    for (const m of scenario.markers) xs.push(m.t);
    xs.sort((a, b) => a - b);
    const next = xs.find((x) => x > now + 0.5);
    if (next != null) setNow(Math.min(next + 0.5, scenario.totalMs));
    else setNow(scenario.totalMs);
  };

  // ---- Layout ----
  // Samme skalering for alle moduser så man kan sammenligne visuelt.
  // Bredde-budsjett: lengste scenarie (h1.0 med 16 ressurser) er ca. 16 * (60+30+200) = 4500 ms.
  // Vi normaliserer mot maks-skala basert på h1.0 worst case for valgt count.
  const maxScale = useMemo(() => {
    // Worst case: HTTP/1.0 med alle ressurser
    return buildH10(buildResources(count)).totalMs;
  }, [count]);
  const SVG_W = 760;
  const LABEL_W = 130;
  const PLOT_W = SVG_W - LABEL_W - 20;
  const ROW_H = 18;
  const LANES = scenario.laneLabels.length;
  const SVG_H = 50 + LANES * ROW_H + 20;
  const xFor = (t: number) => LABEL_W + (t / maxScale) * PLOT_W;

  const totalSec = (scenario.totalMs / 1000).toFixed(2);
  const firstByteSec = (scenario.firstByteMs / 1000).toFixed(2);

  return (
    <figure className="my-6 rounded-xl border border-border bg-card">
      <figcaption className="border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            HTTP-protokoll-sammenligning
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
      </figcaption>

      <div className="grid md:grid-cols-[260px_1fr]">
        {/* Venstre: kontroller */}
        <div className="border-b md:border-b-0 md:border-r border-border p-4 space-y-4 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Avspilling
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (now >= scenario.totalMs) setNow(0);
                  setPlaying((p) => !p);
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-xs hover:border-brand/40"
              >
                {playing ? (
                  <>
                    <Pause className="h-3.5 w-3.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" /> Play
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={stepForward}
                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-xs hover:border-brand/40"
                aria-label="Steg"
                title="Hopp til neste hendelse"
              >
                <SkipForward className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-xs hover:border-brand/40"
                aria-label="Nullstill"
                title="Nullstill"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={scenario.totalMs}
              step={1}
              value={now}
              onChange={(e) => {
                setPlaying(false);
                setNow(parseFloat(e.target.value));
              }}
              className="mt-2 w-full"
              aria-label="Tidsglider"
            />
            <div className="mt-1 text-[10px] text-muted-foreground font-mono">
              t = {now.toFixed(0)} / {scenario.totalMs.toFixed(0)} ms
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Antall ressurser
            </div>
            <input
              type="range"
              min={4}
              max={16}
              step={1}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10))}
              className="w-full"
              aria-label="Antall ressurser"
            />
            <div className="text-[10px] text-muted-foreground font-mono">{count} ressurser</div>
          </div>

          {mode === "h2-loss" && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Pakketap
              </div>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={lossOn}
                  onChange={(e) => setLossOn(e.target.checked)}
                  className="rounded border-border"
                />
                <span>tap pakke ved t = {lossAtMs} ms</span>
              </label>
              <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                Når TCP-pakken mistes må alle streams stå stille til retransmit ankommer
                (~1 RTT senere). Det er HOL på TCP-laget — uavhengig av HTTP/2-multipleksing.
              </p>
            </div>
          )}

          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Mode-notat
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{MODE_NOTE[mode]}</p>
          </div>

          <div className="rounded-md border border-border bg-background p-2 text-xs">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Modell-parametre
            </div>
            <div className="font-mono text-[11px] space-y-0.5">
              <div>RTT = {RTT_MS} ms</div>
              <div>handshake = 1 RTT</div>
              <div>request = ½ RTT</div>
              <div>1 byte ≈ 1 ms (lett å lese)</div>
            </div>
          </div>
        </div>

        {/* Høyre: SVG */}
        <div className="p-4">
          <div className="mb-3 grid grid-cols-3 gap-2 text-xs">
            <StatBox label="Totalt" value={`${totalSec} s`} accent />
            <StatBox label="Først svar" value={`${firstByteSec} s`} />
            <StatBox label="Lanes" value={`${LANES}`} />
          </div>

          <div className="overflow-x-auto rounded-md border border-border bg-background">
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              width="100%"
              style={{ maxWidth: SVG_W }}
              role="img"
              aria-label={`Tids-distanse-diagram for ${mode}`}
            >
              {/* Tids-akse-tikker */}
              {Array.from({ length: Math.floor(maxScale / 200) + 1 }).map((_, i) => {
                const t = i * 200;
                return (
                  <g key={i}>
                    <line
                      x1={xFor(t)}
                      y1={30}
                      x2={xFor(t)}
                      y2={30 + LANES * ROW_H}
                      className="stroke-muted-foreground/20"
                      strokeWidth={1}
                    />
                    <text
                      x={xFor(t)}
                      y={20}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[9px] font-mono"
                    >
                      {t}
                    </text>
                  </g>
                );
              })}
              <text
                x={SVG_W - 16}
                y={20}
                textAnchor="end"
                className="fill-muted-foreground text-[9px] font-mono"
              >
                ms
              </text>

              {/* Lane-rader: bakgrunn + label */}
              {scenario.laneLabels.map((label, li) => {
                const y = 30 + li * ROW_H;
                return (
                  <g key={li}>
                    <rect
                      x={LABEL_W}
                      y={y + 1}
                      width={PLOT_W}
                      height={ROW_H - 2}
                      className="fill-muted/30"
                    />
                    <text
                      x={LABEL_W - 6}
                      y={y + ROW_H / 2 + 3}
                      textAnchor="end"
                      className="fill-foreground text-[10px] font-mono"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}

              {/* Bars (kun de som er synlige ved `now`). Stalled-bars først
                  så de havner under data-bars i z-order. */}
              {[...scenario.bars]
                .sort((a, b) => (a.kind === "stalled" ? -1 : 0) - (b.kind === "stalled" ? -1 : 0))
                .map((b, idx) => {
                if (b.tStart >= now) return null;
                const visEnd = Math.min(b.tEnd, now);
                const x = xFor(b.tStart);
                const w = Math.max(1, xFor(visEnd) - x);
                const y = 30 + b.laneId * ROW_H + 2;
                const h = ROW_H - 4;
                const fill = barFill(b, resources);
                const stroke = b.kind === "body" ? "rgba(0,0,0,0.15)" : "none";
                return (
                  <rect
                    key={idx}
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={0.5}
                  />
                );
              })}

              {/* Now-cursor */}
              <line
                x1={xFor(now)}
                y1={28}
                x2={xFor(now)}
                y2={30 + LANES * ROW_H + 4}
                className="stroke-brand"
                strokeWidth={1.5}
                strokeDasharray="3 2"
                opacity={0.8}
              />

              {/* Markers (tap, retransmit) */}
              {scenario.markers.map((m, idx) => {
                if (m.t > now) return null;
                const x = xFor(m.t);
                const y = 30 + LANES * ROW_H + 14;
                const stroke = m.kind === "loss" ? "#ef4444" : "#22c55e";
                return (
                  <g key={idx}>
                    <line
                      x1={x}
                      y1={30}
                      x2={x}
                      y2={30 + LANES * ROW_H}
                      stroke={stroke}
                      strokeDasharray="2 2"
                      strokeWidth={1}
                      opacity={0.7}
                    />
                    <text x={x + 3} y={y} className="text-[9px] font-mono" fill={stroke}>
                      {m.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Ressurs-legend */}
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
            {resources.map((r) => (
              <div key={r.id} className="flex items-center gap-1">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm"
                  style={{ background: r.color }}
                />
                <span className="font-mono">
                  {r.label} <span className="text-muted-foreground/70">({r.bytes}B)</span>
                </span>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-zinc-400/60" />
              <span>handshake</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-zinc-500/60" />
              <span>request</span>
            </div>
            {mode === "h2-loss" && (
              <div className="flex items-center gap-1">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm"
                  style={{
                    background:
                      "repeating-linear-gradient(45deg, #f43f5e33, #f43f5e33 2px, transparent 2px, transparent 4px)",
                  }}
                />
                <span>stallet (vent på re-tx)</span>
              </div>
            )}
          </div>

          {/* Tolkning */}
          <div className="mt-3 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-foreground leading-relaxed">
            <span className="font-semibold">Les av diagrammet:</span> {interpretation(mode, scenario)}
          </div>

          {mode === "h2-loss" && lossOn && (
            <div className="mt-2 rounded-md border border-rose-500/30 bg-rose-500/5 p-3 text-xs leading-relaxed flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500 mt-0.5 shrink-0" />
              <div>
                <strong className="text-rose-700 dark:text-rose-400">TCP-lag HOL:</strong>{" "}
                Selv om HTTP/2-streams er logisk uavhengige, kan TCP ikke levere
                noe ut av rekkefølge. Én tapt pakke i strømmen → alle streams er
                «blokkert» til retransmit kommer fram. HTTP/3 (QUIC over UDP) løser
                dette ved å la hver stream ha egen reassembly.
              </div>
            </div>
          )}
        </div>
      </div>
    </figure>
  );
}

// --------------------------------------------------------------------------
// Hjelpere
// --------------------------------------------------------------------------

function barFill(b: Bar, resources: Resource[]): string {
  if (b.kind === "handshake") return "rgba(161, 161, 170, 0.5)"; // zinc-400 / 50
  if (b.kind === "request") return "rgba(113, 113, 122, 0.6)"; // zinc-500 / 60
  if (b.kind === "stalled") {
    return "rgba(244, 63, 94, 0.18)"; // rose-500 m/ lav alpha — viser tap-vinduet
  }
  if (b.resId == null) return "#cbd5e1";
  return resources[b.resId]?.color ?? "#999";
}

function interpretation(mode: Mode, sc: Scenario): string {
  switch (mode) {
    case "h1.0":
      return `Hver ressurs starter med en handshake-rute. Total tid er ${sc.totalMs.toFixed(0)} ms — handshake-prisen dominerer for små ressurser. Sammenlign med HTTP/1.1 ×6 på samme antall.`;
    case "h1.1-pipe":
      return `Én handshake, så er alle requests ute samtidig. Men responsene må komme i request-rekkefølge — den første store ressursen sender ferdig før neste begynner. Det er HOL på HTTP-laget.`;
    case "h1.1-x6":
      return `6 lanes deler arbeidet. Du ser at en eller to lanes som tar den tunge ressursen blir flaskehalsen — resten venter ikke, men du betalte 6 separate handshakes opp-front. Bra nok i praksis.`;
    case "h2":
      return `Én tilkobling, alle streams aktive parallelt. De små ressursene blir ferdig først (smaller-finish-first effekt av round-robin), den store siver i bakgrunnen. HOL på HTTP-laget er borte.`;
    case "h2-loss":
      return `Et tap midt i kjøringen pauser samtlige streams — du ser den loddrette røde linja og det stripede området. Multipleksing er bra, men TCP er fortsatt seriell på pakke-laget.`;
  }
}

function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-md border px-3 py-2 ${
        accent ? "border-brand/40 bg-brand/5" : "border-border bg-background"
      }`}
    >
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-sm font-semibold">{value}</div>
    </div>
  );
}
