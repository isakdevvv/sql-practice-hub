import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Server,
  MapPin,
  Wifi,
  WifiOff,
} from "lucide-react";

// Levende versjon av seksjon 2.5: Video-streaming med DASH + CDN.
//
// Vi simulerer en bruker som streamer en 60 s video, delt opp i 4 s segmenter.
// For hvert segment måler klienten gjennomsnittlig nedlastings-throughput
// og velger oppløsning for neste segment:
//   240p  = 0.4 Mbps
//   480p  = 1.2 Mbps
//   720p  = 2.5 Mbps
//   1080p = 5.0 Mbps
//   4K    = 15  Mbps
//
// Brukeren kan dra i et bandwidth-slider for å simulere nettverks-svingninger.
// Toggle CDN: med CDN er RTT lav (10 ms) og båndbredden stabil (lite jitter).
// Uten CDN: RTT høyere (200 ms, server i Irland) og mer jitter.

const QUALITIES = [
  { name: "240p", bitrate: 0.4, color: "fill-rose-500", bg: "bg-rose-500" },
  { name: "480p", bitrate: 1.2, color: "fill-amber-500", bg: "bg-amber-500" },
  { name: "720p", bitrate: 2.5, color: "fill-sky-500", bg: "bg-sky-500" },
  { name: "1080p", bitrate: 5.0, color: "fill-emerald-500", bg: "bg-emerald-500" },
  { name: "4K", bitrate: 15.0, color: "fill-purple-500", bg: "bg-purple-500" },
];

type CdnMode = "cdn" | "origin";

type SegmentEvent = {
  index: number;
  quality: string;
  bitrate: number; // Mbps
  measuredBw: number; // Mbps
  bufferSec: number;
  stalled: boolean;
};

const SEG_DURATION = 4; // s av video per segment
const TOTAL_SEGMENTS = 15; // 60 s

export function Section25Live() {
  const [mode, setMode] = useState<CdnMode>("cdn");
  // Brukerens basis-båndbredde — slider 0.5 .. 20 Mbps
  const [userBwBase, setUserBwBase] = useState(8);
  const [playing, setPlaying] = useState(false);
  const [segIdx, setSegIdx] = useState(0); // hvor mange segmenter lastet ned
  const [progress, setProgress] = useState(0); // 0..1 innen segment
  const [events, setEvents] = useState<SegmentEvent[]>([]);
  const [buffer, setBuffer] = useState(0); // hvor mange sekunder video i buffer
  const lastQualityIdx = useRef(0);

  // Effektiv båndbredde tar hensyn til mode (jitter)
  const measuredBwNow = useMemo(() => {
    const jitter = mode === "cdn" ? 0.1 : 0.4;
    // deterministisk pseudo-noise basert på segIdx for stabil opplevelse
    const noise = Math.sin(segIdx * 1.7) * jitter * userBwBase;
    return Math.max(0.1, userBwBase + noise);
  }, [userBwBase, segIdx, mode]);

  // Velg quality basert på siste målte throughput
  const selectedQuality = useMemo(() => {
    // bruk siste segment-events for snitt
    const recent = events.slice(-3);
    const avgBw =
      recent.length > 0 ? recent.reduce((s, e) => s + e.measuredBw, 0) / recent.length : userBwBase;
    // Velg høyeste kvalitet som passer innenfor 80 % av målt båndbredde (safety margin)
    let pick = 0;
    for (let i = QUALITIES.length - 1; i >= 0; i--) {
      if (QUALITIES[i].bitrate <= avgBw * 0.8) {
        pick = i;
        break;
      }
    }
    return pick;
  }, [events, userBwBase]);

  // Animation: hvert "tikk" laster vi ned ett segment
  useEffect(() => {
    if (!playing) return;
    if (segIdx >= TOTAL_SEGMENTS) {
      setPlaying(false);
      return;
    }
    let raf = 0;
    let last = performance.now();
    // Hvor lang tid bruker vi visuelt på ett segment?
    // Vis-tid 1.5 s = 1 segment uavhengig av faktisk nedlastings-tid
    const SPEED = 1 / 1500;
    function tick(now: number) {
      const dt = now - last;
      last = now;
      setProgress((p) => {
        const next = p + dt * SPEED;
        if (next >= 1) {
          // Segment ferdig nedlastet — bestem quality og oppdater event-log
          const q = QUALITIES[selectedQuality];
          const dlTime = (q.bitrate * SEG_DURATION) / measuredBwNow;
          // Buffer brukes opp mens vi laster; stall hvis tom
          const willStall = dlTime > buffer + SEG_DURATION;
          const newBuffer = Math.max(0, buffer - dlTime) + SEG_DURATION;
          lastQualityIdx.current = selectedQuality;
          setEvents((prev) => [
            ...prev,
            {
              index: segIdx,
              quality: q.name,
              bitrate: q.bitrate,
              measuredBw: measuredBwNow,
              bufferSec: newBuffer,
              stalled: willStall,
            },
          ]);
          setBuffer(newBuffer);
          setSegIdx((i) => i + 1);
          return 0;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, segIdx, selectedQuality, measuredBwNow, buffer]);

  function reset() {
    setPlaying(false);
    setSegIdx(0);
    setProgress(0);
    setBuffer(0);
    setEvents([]);
  }

  function switchMode(m: CdnMode) {
    if (m === mode) return;
    setMode(m);
    reset();
  }

  const currentQuality = QUALITIES[selectedQuality];
  const lastEvent = events[events.length - 1];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Toggle */}
      <div className="bg-muted/30 px-4 py-2 text-xs border-b border-border flex items-center gap-2 flex-wrap">
        <span className="font-medium text-foreground">
          Adaptiv streaming — {TOTAL_SEGMENTS} segmenter à {SEG_DURATION} s
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => switchMode("cdn")}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium ${
              mode === "cdn"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Wifi className="h-3 w-3" /> Med CDN
          </button>
          <button
            onClick={() => switchMode("origin")}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium ${
              mode === "origin"
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <WifiOff className="h-3 w-3" /> Origin (ingen CDN)
          </button>
        </div>
      </div>

      {/* Topologi-tegning */}
      <svg viewBox="0 0 700 260" className="w-full h-auto bg-muted/10">
        {/* Origin server (Irland) */}
        <g>
          <rect
            x={20}
            y={20}
            width={70}
            height={50}
            rx={4}
            className="fill-card stroke-muted-foreground/40"
            strokeWidth={2}
          />
          <text x={55} y={42} textAnchor="middle" className="fill-foreground text-[10px] font-bold">
            Origin
          </text>
          <text x={55} y={56} textAnchor="middle" className="fill-muted-foreground text-[8px]">
            Dublin
          </text>
        </g>

        {/* CDN edges */}
        {mode === "cdn" &&
          [
            { x: 250, y: 30, label: "Oslo" },
            { x: 250, y: 130, label: "Tromsø" },
            { x: 250, y: 220, label: "Stavanger" },
          ].map((edge) => (
            <g key={edge.label}>
              <line
                x1={90}
                y1={45}
                x2={edge.x}
                y2={edge.y + 20}
                className="stroke-emerald-500/30"
                strokeDasharray="3 3"
              />
              <rect
                x={edge.x - 30}
                y={edge.y}
                width={60}
                height={40}
                rx={4}
                className={
                  edge.label === "Tromsø"
                    ? "fill-emerald-500/15 stroke-emerald-500"
                    : "fill-emerald-500/5 stroke-emerald-500/50"
                }
                strokeWidth={2}
              />
              <text
                x={edge.x}
                y={edge.y + 18}
                textAnchor="middle"
                className="fill-foreground text-[10px] font-bold"
              >
                CDN
              </text>
              <text
                x={edge.x}
                y={edge.y + 30}
                textAnchor="middle"
                className="fill-muted-foreground text-[8px]"
              >
                {edge.label}
              </text>
            </g>
          ))}

        {/* Linje origin → bruker (direkte hvis ikke CDN) */}
        {mode === "origin" && (
          <line
            x1={90}
            y1={45}
            x2={580}
            y2={130}
            className="stroke-rose-500/40"
            strokeWidth={2}
          />
        )}

        {/* Linje CDN edge → bruker */}
        {mode === "cdn" && (
          <line
            x1={280}
            y1={150}
            x2={580}
            y2={130}
            className="stroke-emerald-500/60"
            strokeWidth={2}
          />
        )}

        {/* Bruker */}
        <g transform="translate(580, 110)">
          <rect
            width={50}
            height={50}
            rx={5}
            className="fill-brand/15 stroke-brand"
            strokeWidth={2}
          />
          <text x={25} y={20} textAnchor="middle" className="fill-foreground text-[10px] font-bold">
            Du
          </text>
          <text x={25} y={32} textAnchor="middle" className="fill-muted-foreground text-[8px]">
            Tromsø
          </text>
          <text x={25} y={44} textAnchor="middle" className="fill-muted-foreground text-[8px]">
            {userBwBase.toFixed(1)} Mbps
          </text>
        </g>

        {/* Animasjon: segment-pakke som beveger seg */}
        {playing && (
          <g>
            {(() => {
              const startX = mode === "cdn" ? 280 : 90;
              const startY = mode === "cdn" ? 150 : 45;
              const endX = 580;
              const endY = 130;
              const x = startX + (endX - startX) * progress;
              const y = startY + (endY - startY) * progress;
              return (
                <>
                  <rect
                    x={x - 14}
                    y={y - 8}
                    width={28}
                    height={16}
                    rx={2}
                    className={`${currentQuality.color} stroke-background`}
                    strokeWidth={1.5}
                  />
                  <text
                    x={x}
                    y={y + 3}
                    textAnchor="middle"
                    className="fill-white text-[8px] font-bold"
                  >
                    {currentQuality.name}
                  </text>
                </>
              );
            })()}
          </g>
        )}

        {/* RTT-merking */}
        <text
          x={350}
          y={250}
          textAnchor="middle"
          className="fill-muted-foreground text-[10px] font-mono"
        >
          {mode === "cdn"
            ? "RTT bruker ↔ CDN: ~10 ms (samme by)"
            : "RTT bruker ↔ origin: ~200 ms (over Atlanteren)"}
        </text>
      </svg>

      {/* Båndbredde-slider */}
      <div className="px-4 py-3 border-t border-border bg-muted/10 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <label htmlFor="bw-slider" className="text-muted-foreground">
            Din båndbredde
          </label>
          <span className="font-mono text-foreground">
            {userBwBase.toFixed(1)} Mbps {mode === "origin" && "(med jitter ±40 %)"}
          </span>
        </div>
        <input
          id="bw-slider"
          type="range"
          min={0.5}
          max={20}
          step={0.1}
          value={userBwBase}
          onChange={(e) => setUserBwBase(parseFloat(e.target.value))}
          className="w-full"
        />
        <p className="text-[10px] text-muted-foreground">
          Klienten måler dette underveis og bytter quality. Dra slider-en mens den spiller for å
          simulere at heisen kommer mellom deg og basestasjonen.
        </p>
      </div>

      {/* Quality + buffer */}
      <div className="grid grid-cols-2 gap-2 px-4 py-2 border-t border-border bg-muted/20 text-[11px]">
        <div>
          <div className="text-muted-foreground mb-1">Nåværende quality (valgt automatisk)</div>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-3 h-3 rounded ${currentQuality.bg}`} />
            <span className="font-mono font-semibold text-foreground">
              {currentQuality.name} ({currentQuality.bitrate} Mbps)
            </span>
          </div>
        </div>
        <div>
          <div className="text-muted-foreground mb-1">
            Buffer {lastEvent?.stalled ? "(stalling!)" : ""}
          </div>
          <div className="h-3 rounded bg-muted overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                buffer < 2 ? "bg-rose-500" : buffer < 8 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, (buffer / 30) * 100)}%` }}
            />
          </div>
          <div className="font-mono text-foreground mt-0.5">{buffer.toFixed(1)} s</div>
        </div>
      </div>

      {/* Event-log */}
      <div className="px-4 py-2 border-t border-border bg-muted/20 max-h-32 overflow-y-auto">
        <div className="text-[10px] text-muted-foreground uppercase mb-1 font-mono">
          Segment-logg ({events.length} / {TOTAL_SEGMENTS})
        </div>
        <div className="space-y-0.5 text-[10px] font-mono">
          {events.length === 0 && (
            <div className="text-muted-foreground italic">Trykk Spill av for å starte streaming</div>
          )}
          {events.slice(-8).map((e) => (
            <div key={e.index} className="flex items-center gap-2">
              <span className="text-muted-foreground w-12">seg {e.index + 1}</span>
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  QUALITIES.find((q) => q.name === e.quality)?.bg
                }`}
              />
              <span className="w-12 text-foreground">{e.quality}</span>
              <span className="text-muted-foreground">
                målt {e.measuredBw.toFixed(1)} Mbps · buffer {e.bufferSec.toFixed(1)} s
              </span>
              {e.stalled && <span className="text-rose-500 font-bold">STALL</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Kontroller */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-1.5 border-t border-border bg-muted/20">
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={segIdx >= TOTAL_SEGMENTS}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20 disabled:opacity-40"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "Pause" : segIdx >= TOTAL_SEGMENTS ? "Ferdig" : "Spill av"}
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
        <span className="ml-auto text-[11px] text-muted-foreground font-mono">
          {mode === "cdn" ? (
            <>
              <Server className="inline h-3 w-3" /> CDN — innholdet kopieres ut til kanten
            </>
          ) : (
            <>
              <MapPin className="inline h-3 w-3" /> Origin — alt over Atlanteren
            </>
          )}
        </span>
      </div>

      {/* Legend / forklaring */}
      <div className="px-4 py-2 text-[10px] text-muted-foreground border-t border-border space-y-1">
        <div className="flex flex-wrap gap-3">
          {QUALITIES.map((q) => (
            <span key={q.name} className="inline-flex items-center gap-1">
              <span className={`inline-block w-2 h-2 rounded-full ${q.bg}`} />
              {q.name} ({q.bitrate} Mbps)
            </span>
          ))}
        </div>
        <p>
          Algoritmen (forenklet): velg høyeste quality med bitrate ≤ 0.8 × målt båndbredde.
          ABR-spillere i praksis (DASH.js, hls.js) bruker mer avansert heuristikk som tar hensyn til
          buffer-nivå og prediksjons-modeller, men prinsippet er det samme.
        </p>
      </div>
    </div>
  );
}
