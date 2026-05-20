import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Activity, TrendingUp, AlertTriangle } from "lucide-react";

// Section92Live — fullskala interaktiv simulator for Kurose-seksjon 9.2 (DASH).
//
// Pedagogisk hovedpoeng: en DASH-klient bytter ikke video-bitrate per pakke;
// den bytter per *segment*. Mellom hver segment-nedlasting måler den
// throughput, sjekker buffer-fyll, og velger en av N forhåndskodete varianter
// for *neste* segment. Brukeren skrur på nettverks-båndbredde (varierer
// over tid via en slider og evt. en "scenario-kurve"), og ser hvordan
// ABR-algoritmen tilpasser seg, mens en samtidig stillbilde-graf viser
// bitrate-valget og buffer-nivået over tid.
//
// Modellen er bevisst enkel — pedagogisk klar, ikke produksjon-eksakt.

// ---------- Bitrate-ladder ----------
type BitrateLevel = {
  index: number;
  label: string; // "240p", "360p", ...
  kbps: number;
};

const LADDER: BitrateLevel[] = [
  { index: 0, label: "240p", kbps: 400 },
  { index: 1, label: "360p", kbps: 800 },
  { index: 2, label: "480p", kbps: 1500 },
  { index: 3, label: "720p", kbps: 3000 },
  { index: 4, label: "1080p", kbps: 5000 },
  { index: 5, label: "1440p", kbps: 8000 },
];

const SEGMENT_DURATION_S = 2; // 2-sek segmenter
const MAX_BUFFER_S = 30; // typisk maks 30 s playback-buffer
const LOW_WATER_S = 6; // under: vær konservativ, dropp ned
const HIGH_WATER_S = 18; // over: tør å klatre opp
const N_SEGMENTS_TIMELINE = 40; // hvor mange segmenter vi viser i historikk
const TICK_PER_SEGMENT_MS = 600; // vegg-tid per simulerte segment-syklus

// ---------- ABR-algoritmer ----------
type AbrId = "throughput" | "buffer" | "bola";

type AbrPick = {
  level: number;
  rationale: string;
};

function abrThroughputBased(
  ewmaKbps: number,
  _bufferS: number,
  _prevLevel: number,
): AbrPick {
  // Trekk 20 % margin. Velg høyeste ladder under estimatet.
  const target = ewmaKbps * 0.8;
  let level = 0;
  for (let i = LADDER.length - 1; i >= 0; i--) {
    if (LADDER[i].kbps <= target) {
      level = i;
      break;
    }
  }
  return {
    level,
    rationale: `EWMA ${Math.round(ewmaKbps)} kbps × 0.8 = ${Math.round(target)} kbps → høyeste ladder under.`,
  };
}

function abrBufferBased(
  _ewmaKbps: number,
  bufferS: number,
  prevLevel: number,
): AbrPick {
  // Bufferet styrer: lavt buffer → krymp ned, høyt → vokse opp.
  // Stair-step på bufferet: 0..6 → 0, 6..12 → 1, 12..18 → 2/3, 18..24 → høyere, >24 → topp.
  if (bufferS < LOW_WATER_S) {
    return {
      level: Math.max(0, prevLevel - 2),
      rationale: `Buffer ${bufferS.toFixed(1)} s < ${LOW_WATER_S} s → dropp to trinn for å bygge buffer.`,
    };
  }
  if (bufferS < 12) {
    return {
      level: Math.max(0, prevLevel - 1),
      rationale: `Buffer ${bufferS.toFixed(1)} s lavt → ett trinn ned for sikkerhets skyld.`,
    };
  }
  if (bufferS > HIGH_WATER_S) {
    return {
      level: Math.min(LADDER.length - 1, prevLevel + 1),
      rationale: `Buffer ${bufferS.toFixed(1)} s > ${HIGH_WATER_S} s → klatre ett trinn opp.`,
    };
  }
  return {
    level: prevLevel,
    rationale: `Buffer ${bufferS.toFixed(1)} s i komfort-sone — hold trinn.`,
  };
}

function abrBola(
  ewmaKbps: number,
  bufferS: number,
  prevLevel: number,
): AbrPick {
  // Hybrid: maksimer "score = V·log(rate) - (cost) · segment_time / buffer".
  // Forenklet: bruk throughput-estimat med buffer-bonus/-straff.
  const target = ewmaKbps * 0.85 * (0.6 + 0.4 * Math.min(1, bufferS / MAX_BUFFER_S));
  let level = 0;
  for (let i = LADDER.length - 1; i >= 0; i--) {
    if (LADDER[i].kbps <= target) {
      level = i;
      break;
    }
  }
  // Bremse-hysterese: hvis buffer er lavt, ikke klatre opp.
  if (bufferS < LOW_WATER_S && level > prevLevel) level = prevLevel;
  return {
    level,
    rationale: `BOLA: target ${Math.round(target)} kbps (EWMA + buffer-vekt) → trinn ${level}.`,
  };
}

const ABR_IMPL: Record<AbrId, (e: number, b: number, p: number) => AbrPick> = {
  throughput: abrThroughputBased,
  buffer: abrBufferBased,
  bola: abrBola,
};

const ABR_LABEL: Record<AbrId, string> = {
  throughput: "Throughput-basert",
  buffer: "Buffer-basert",
  bola: "BOLA (hybrid)",
};

// ---------- Båndbredde-scenarier ----------
type Scenario = {
  id: string;
  name: string;
  blurb: string;
  // Funksjon t (segment-indeks) → tilgjengelig båndbredde i kbps
  bw: (segmentIdx: number, base: number) => number;
};

const SCENARIOS: Scenario[] = [
  {
    id: "manual",
    name: "Manuell slider",
    blurb: "Skru båndbredden selv med slideren. Frosset på siste verdi.",
    bw: (_i, base) => base,
  },
  {
    id: "tunnel",
    name: "Togtunnel",
    blurb: "Stabil 6 Mbps → faller til 0.6 Mbps i 8 segmenter → opp igjen.",
    bw: (i, _base) => {
      if (i < 6) return 6000;
      if (i < 14) return 600;
      if (i < 20) return 2000;
      return 6000;
    },
  },
  {
    id: "flapping",
    name: "Wifi-flapping",
    blurb: "Oscillerer mellom 1 og 4 Mbps hvert 2. segment — utfordrer ABR-stabilitet.",
    bw: (i, _base) => (Math.floor(i / 2) % 2 === 0 ? 4000 : 1000),
  },
  {
    id: "rampdown",
    name: "Jevn nedgang",
    blurb: "Båndbredden krymper jevnt fra 8 Mbps til 0.5 Mbps — ser ABR klatre nedover.",
    bw: (i, _base) => Math.max(500, 8000 - i * 200),
  },
  {
    id: "burst",
    name: "Cellular-burst",
    blurb: "3 Mbps med sporadiske 3-segment-spikes til 7 Mbps — vil ABR fristes?",
    bw: (i, _base) => {
      const cycle = i % 7;
      return cycle < 3 ? 7000 : 3000;
    },
  },
];

// ---------- Simulator ----------
type SegmentEvent = {
  idx: number;
  bwKbps: number;
  ewmaKbps: number;
  pickedLevel: number;
  bufferBeforeS: number;
  bufferAfterS: number;
  stalled: boolean; // ble bufferet tomt mens nedlasting pågikk?
  rationale: string;
};

function runSegment(
  prev: SegmentEvent | null,
  bwKbps: number,
  abr: AbrId,
  baseBwForManual: number,
  scenario: Scenario,
  idx: number,
  alpha: number,
): SegmentEvent {
  const prevEwma = prev ? prev.ewmaKbps : bwKbps;
  // EWMA av målt throughput (sist måling = bwKbps)
  const ewma = alpha * bwKbps + (1 - alpha) * prevEwma;
  const prevLevel = prev ? prev.pickedLevel : 0;
  const bufferBefore = prev ? prev.bufferAfterS : 0;
  const pick = ABR_IMPL[abr](ewma, bufferBefore, prevLevel);
  // Last ned segmentet. Hvor lenge tar det?
  // bits til segment = LADDER[pick].kbps * SEGMENT_DURATION_S (kbps * s = kbit)
  const segKbit = LADDER[pick.level].kbps * SEGMENT_DURATION_S;
  // download time = kbit / kbps. Bruk gjennomsnitt av forrige og nåværende bw for litt realisme.
  const effectiveBw = idx === 0
    ? bwKbps
    : (bwKbps + scenario.bw(idx - 1, baseBwForManual)) / 2;
  const dlTimeS = segKbit / Math.max(50, effectiveBw);
  // Mens vi laster, tømmes bufferet med 1 s/s.
  let bufferAfter = bufferBefore - dlTimeS;
  let stalled = false;
  if (bufferAfter < 0) {
    stalled = true;
    bufferAfter = 0;
  }
  // Når segmentet er ferdig nedlastet legges SEGMENT_DURATION_S sek video i bufferet,
  // med tak på MAX_BUFFER_S.
  bufferAfter = Math.min(MAX_BUFFER_S, bufferAfter + SEGMENT_DURATION_S);
  return {
    idx,
    bwKbps,
    ewmaKbps: ewma,
    pickedLevel: pick.level,
    bufferBeforeS: bufferBefore,
    bufferAfterS: bufferAfter,
    stalled,
    rationale: pick.rationale,
  };
}

// ---------- Komponenten ----------

export function Section92Live() {
  const [abrId, setAbrId] = useState<AbrId>("bola");
  const [scenarioId, setScenarioId] = useState<string>("manual");
  const [manualBwKbps, setManualBwKbps] = useState(3000);
  const [alpha, setAlpha] = useState(0.4);
  const [playing, setPlaying] = useState(true);
  const [tickIdx, setTickIdx] = useState(0); // segment-indeks (siste ferdige)
  const [history, setHistory] = useState<SegmentEvent[]>([]);
  const lastWallRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0],
    [scenarioId],
  );

  // Reset full historikk når scenario eller ABR endres
  useEffect(() => {
    setHistory([]);
    setTickIdx(0);
  }, [abrId, scenarioId]);

  // Animasjons-loop: hvert TICK_PER_SEGMENT_MS «laster ned» ett segment
  useEffect(() => {
    if (!playing) {
      lastWallRef.current = 0;
      return;
    }
    function tick(now: number) {
      if (!lastWallRef.current) lastWallRef.current = now;
      const dt = now - lastWallRef.current;
      if (dt >= TICK_PER_SEGMENT_MS) {
        lastWallRef.current = now;
        setHistory((prev) => {
          const nextIdx = prev.length;
          const bwKbps = scenario.bw(nextIdx, manualBwKbps);
          const event = runSegment(
            prev[prev.length - 1] ?? null,
            bwKbps,
            abrId,
            manualBwKbps,
            scenario,
            nextIdx,
            alpha,
          );
          const merged = [...prev, event];
          // Behold de siste N_SEGMENTS_TIMELINE
          return merged.slice(-N_SEGMENTS_TIMELINE * 2);
        });
        setTickIdx((i) => i + 1);
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [playing, abrId, scenario, manualBwKbps, alpha]);

  function reset() {
    setHistory([]);
    setTickIdx(0);
    lastWallRef.current = 0;
  }

  // Stats
  const lastEvent = history[history.length - 1] ?? null;
  const visible = history.slice(-N_SEGMENTS_TIMELINE);
  const stallCount = history.filter((e) => e.stalled).length;
  const switchCount = history.reduce(
    (acc, e, i) =>
      i > 0 && history[i - 1].pickedLevel !== e.pickedLevel ? acc + 1 : acc,
    0,
  );
  const avgQuality =
    history.length === 0
      ? 0
      : history.reduce((s, e) => s + LADDER[e.pickedLevel].kbps, 0) /
        history.length;

  // ---------- Graf-koordinater ----------
  // SVG: 820 × 360.
  // Top zone (60..160): bitrate-ladder + valgt nivå per segment.
  // Mid zone (180..240): buffer-bar over tid.
  // Bottom (260..330): tilgjengelig bw / EWMA / bitrate-line.
  const PLOT_X0 = 60;
  const PLOT_X1 = 800;
  const COL_W = (PLOT_X1 - PLOT_X0) / N_SEGMENTS_TIMELINE;

  function xForSeg(i: number) {
    return PLOT_X0 + i * COL_W + COL_W / 2;
  }

  // Bitrate y-skala: 0..maks ladder
  const MAX_KBPS = 9000;
  function yForKbps(kbps: number) {
    const TOP = 60;
    const BOT = 160;
    const u = Math.min(1, kbps / MAX_KBPS);
    return BOT - u * (BOT - TOP);
  }

  // Buffer-bar y
  function yBufferTop() {
    return 180;
  }
  function bufferBarHeight(s: number) {
    return Math.min(1, s / MAX_BUFFER_S) * 60; // 60 px max
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">
          DASH-klient: adaptiv bitrate per 2-sek-segment
        </span>
        <span className="ml-auto font-mono">
          Segm. {tickIdx} · Buffer{" "}
          {lastEvent ? lastEvent.bufferAfterS.toFixed(1) : "0.0"} s
        </span>
      </div>

      <svg viewBox="0 0 820 360" className="w-full h-auto bg-muted/10">
        {/* Bitrate-ladder bakgrunn — horisontale linjer for hvert nivå */}
        {LADDER.map((lv) => (
          <g key={lv.index}>
            <line
              x1={PLOT_X0}
              y1={yForKbps(lv.kbps)}
              x2={PLOT_X1}
              y2={yForKbps(lv.kbps)}
              className="stroke-muted-foreground/20"
              strokeWidth={1}
              strokeDasharray="2 4"
            />
            <text
              x={PLOT_X0 - 6}
              y={yForKbps(lv.kbps) + 3}
              textAnchor="end"
              className="fill-muted-foreground text-[9px]"
            >
              {lv.label}
            </text>
            <text
              x={PLOT_X1 + 6}
              y={yForKbps(lv.kbps) + 3}
              className="fill-muted-foreground text-[8px] font-mono"
            >
              {lv.kbps}k
            </text>
          </g>
        ))}

        {/* Tilgjengelig båndbredde (rød linje) */}
        {visible.length > 1 && (
          <polyline
            fill="none"
            className="stroke-red-500/70"
            strokeWidth={1.5}
            strokeDasharray="3 2"
            points={visible
              .map((e, i) => `${xForSeg(i)},${yForKbps(e.bwKbps)}`)
              .join(" ")}
          />
        )}

        {/* EWMA-estimat (oransje linje) */}
        {visible.length > 1 && (
          <polyline
            fill="none"
            className="stroke-amber-500"
            strokeWidth={2}
            points={visible
              .map((e, i) => `${xForSeg(i)},${yForKbps(e.ewmaKbps)}`)
              .join(" ")}
          />
        )}

        {/* Valgt bitrate per segment (cyan trapper) */}
        {visible.length > 0 && (
          <polyline
            fill="none"
            className="stroke-cyan-500"
            strokeWidth={2.5}
            strokeLinejoin="miter"
            points={visible
              .flatMap((e, i) => {
                const x0 = xForSeg(i) - COL_W / 2;
                const x1 = xForSeg(i) + COL_W / 2;
                const y = yForKbps(LADDER[e.pickedLevel].kbps);
                return [`${x0},${y}`, `${x1},${y}`];
              })
              .join(" ")}
          />
        )}

        {/* Stall-markører som røde lyn */}
        {visible.map(
          (e, i) =>
            e.stalled && (
              <g key={`stall-${i}`}>
                <line
                  x1={xForSeg(i)}
                  y1={50}
                  x2={xForSeg(i)}
                  y2={160}
                  className="stroke-red-500"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                />
                <text
                  x={xForSeg(i)}
                  y={48}
                  textAnchor="middle"
                  className="fill-red-500 text-[9px] font-bold"
                >
                  STALL
                </text>
              </g>
            ),
        )}

        {/* Y-akse-tittel */}
        <text
          x={20}
          y={110}
          className="fill-foreground text-[10px] font-semibold"
          transform="rotate(-90 20 110)"
          textAnchor="middle"
        >
          bitrate
        </text>

        {/* Buffer-bar område */}
        <text
          x={20}
          y={yBufferTop() + 30}
          className="fill-foreground text-[10px] font-semibold"
          transform={`rotate(-90 20 ${yBufferTop() + 30})`}
          textAnchor="middle"
        >
          buffer
        </text>
        {/* Buffer-zoner som farger */}
        <rect
          x={PLOT_X0}
          y={yBufferTop()}
          width={PLOT_X1 - PLOT_X0}
          height={60}
          className="fill-muted/30 stroke-muted-foreground/40"
          strokeWidth={1}
        />
        {/* Vannmerke-linjer */}
        <line
          x1={PLOT_X0}
          y1={yBufferTop() + 60 - (LOW_WATER_S / MAX_BUFFER_S) * 60}
          x2={PLOT_X1}
          y2={yBufferTop() + 60 - (LOW_WATER_S / MAX_BUFFER_S) * 60}
          className="stroke-red-500/50"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <line
          x1={PLOT_X0}
          y1={yBufferTop() + 60 - (HIGH_WATER_S / MAX_BUFFER_S) * 60}
          x2={PLOT_X1}
          y2={yBufferTop() + 60 - (HIGH_WATER_S / MAX_BUFFER_S) * 60}
          className="stroke-success/50"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <text
          x={PLOT_X1 + 6}
          y={yBufferTop() + 60 - (LOW_WATER_S / MAX_BUFFER_S) * 60 + 3}
          className="fill-red-500 text-[8px] font-mono"
        >
          {LOW_WATER_S}s
        </text>
        <text
          x={PLOT_X1 + 6}
          y={yBufferTop() + 60 - (HIGH_WATER_S / MAX_BUFFER_S) * 60 + 3}
          className="fill-success text-[8px] font-mono"
        >
          {HIGH_WATER_S}s
        </text>

        {/* Buffer-bars per segment */}
        {visible.map((e, i) => {
          const h = bufferBarHeight(e.bufferAfterS);
          const y = yBufferTop() + 60 - h;
          let color = "fill-success/60";
          if (e.bufferAfterS < LOW_WATER_S) color = "fill-red-500/70";
          else if (e.bufferAfterS < HIGH_WATER_S) color = "fill-amber-500/60";
          return (
            <rect
              key={`buf-${i}`}
              x={xForSeg(i) - COL_W / 2 + 1}
              y={y}
              width={COL_W - 2}
              height={h}
              className={color}
            />
          );
        })}

        {/* Animasjons-strek: hvor langt vi har kommet på segmentet vi laster nå */}
        <line
          x1={PLOT_X0}
          y1={158}
          x2={PLOT_X0 + visible.length * COL_W}
          y2={158}
          className="stroke-foreground/40"
          strokeWidth={2}
        />
        <circle
          cx={PLOT_X0 + visible.length * COL_W}
          cy={158}
          r={3}
          className="fill-cyan-500"
        />

        {/* Bunn-band: stats */}
        <g transform="translate(0, 260)">
          <rect x={0} y={0} width={820} height={100} className="fill-muted/40" />
          <text x={20} y={20} className="fill-foreground text-[11px] font-semibold">
            ABR-algoritme: {ABR_LABEL[abrId]}
          </text>
          <text
            x={20}
            y={36}
            className="fill-muted-foreground text-[10px]"
          >
            <tspan className="fill-success">Spilte segmenter:</tspan> {history.length}
            {"  ·  "}
            <tspan className="fill-red-500">Stalls:</tspan> {stallCount}
            {"  ·  "}
            <tspan className="fill-amber-500">Kvalitets-bytter:</tspan>{" "}
            {switchCount}
          </text>
          <text
            x={20}
            y={50}
            className="fill-foreground text-[10px]"
          >
            <tspan className="fill-cyan-500">Snitt-bitrate:</tspan>{" "}
            <tspan className="font-mono font-semibold">{Math.round(avgQuality)} kbps</tspan>
          </text>
          {lastEvent && (
            <>
              <text
                x={20}
                y={68}
                className="fill-foreground text-[10px]"
              >
                <tspan className="fill-amber-500 font-semibold">EWMA: </tspan>
                <tspan className="font-mono">{Math.round(lastEvent.ewmaKbps)} kbps</tspan>
                {"   "}
                <tspan className="fill-red-500/80 font-semibold">Tilg.: </tspan>
                <tspan className="font-mono">{Math.round(lastEvent.bwKbps)} kbps</tspan>
                {"   "}
                <tspan className="fill-cyan-500 font-semibold">Valg: </tspan>
                <tspan className="font-mono">{LADDER[lastEvent.pickedLevel].label} ({LADDER[lastEvent.pickedLevel].kbps} kbps)</tspan>
              </text>
              <foreignObject x={20} y={72} width={780} height={22}>
                <div className="text-[10px] text-muted-foreground leading-tight italic truncate">
                  {lastEvent.rationale}
                </div>
              </foreignObject>
            </>
          )}
        </g>

        {/* Legend */}
        <g transform="translate(490, 14)">
          <rect x={0} y={0} width={310} height={40} className="fill-card/70 stroke-border" strokeWidth={1} rx={4} />
          <line x1={10} y1={14} x2={28} y2={14} className="stroke-red-500/70" strokeWidth={1.5} strokeDasharray="3 2" />
          <text x={34} y={17} className="fill-foreground text-[9px]">tilg. bw</text>
          <line x1={90} y1={14} x2={108} y2={14} className="stroke-amber-500" strokeWidth={2} />
          <text x={114} y={17} className="fill-foreground text-[9px]">EWMA</text>
          <line x1={158} y1={14} x2={176} y2={14} className="stroke-cyan-500" strokeWidth={2.5} />
          <text x={182} y={17} className="fill-foreground text-[9px]">valgt bitrate</text>
          <rect x={245} y={9} width={10} height={10} className="fill-success/60" />
          <text x={260} y={17} className="fill-foreground text-[9px]">buf OK</text>
          <rect x={10} y={26} width={10} height={8} className="fill-amber-500/60" />
          <text x={25} y={33} className="fill-foreground text-[9px]">buf lavt</text>
          <rect x={90} y={26} width={10} height={8} className="fill-red-500/70" />
          <text x={105} y={33} className="fill-foreground text-[9px]">buf kritisk</text>
        </g>
      </svg>

      {/* Kontroller */}
      <div className="px-4 py-3 border-t border-border bg-muted/20 grid gap-3 md:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <label className="text-xs font-medium text-foreground">
              Manuell båndbredde (når scenario = «Manuell slider»)
            </label>
            <span className="text-xs font-mono text-foreground">
              {manualBwKbps} kbps
            </span>
          </div>
          <input
            type="range"
            min={300}
            max={9000}
            step={100}
            value={manualBwKbps}
            onChange={(e) => setManualBwKbps(Number(e.target.value))}
            className="mt-1 w-full accent-red-500"
          />
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Skru og se hvordan ABR reagerer i sanntid. Andre scenarier styrer denne automatisk.
          </p>
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <label className="text-xs font-medium text-foreground">
              EWMA-glatting (α — høyere = mer reaktiv)
            </label>
            <span className="text-xs font-mono text-foreground">{alpha.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.05}
            max={0.95}
            step={0.05}
            value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
            className="mt-1 w-full accent-amber-500"
          />
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Lav α (0.1) → estimat «glatt og lat», ignorerer transient dipp. Høy α → følger raskt, men oscillerer.
          </p>
        </div>
      </div>

      {/* Bytt ABR / scenario */}
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
          <RotateCcw className="h-3 w-3" /> Nullstill
        </button>

        <span className="ml-2 text-[10px] text-muted-foreground">ABR-algoritme:</span>
        {(Object.keys(ABR_IMPL) as AbrId[]).map((id) => (
          <button
            key={id}
            onClick={() => setAbrId(id)}
            className={`rounded px-2 py-1 text-[10px] border ${
              abrId === id
                ? "border-brand bg-brand/15 text-brand"
                : "border-border bg-background hover:border-brand/60"
            }`}
          >
            {ABR_LABEL[id]}
          </button>
        ))}

        <span className="ml-2 text-[10px] text-muted-foreground">Scenario:</span>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setScenarioId(s.id)}
            title={s.blurb}
            className={`rounded px-2 py-1 text-[10px] border ${
              scenarioId === s.id
                ? "border-brand bg-brand/15 text-brand"
                : "border-border bg-background hover:border-brand/60"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Diagnose */}
      <Diagnosis history={history} />
    </div>
  );
}

function Diagnosis({ history }: { history: SegmentEvent[] }) {
  if (history.length < 4) {
    return (
      <div className="px-4 py-2 border-t border-border text-[11px] text-muted-foreground italic">
        Samler data… La simulatoren kjøre noen segmenter for å se hvordan algoritmen klarer seg.
      </div>
    );
  }
  const stalls = history.filter((e) => e.stalled).length;
  const switches = history.reduce(
    (acc, e, i) =>
      i > 0 && history[i - 1].pickedLevel !== e.pickedLevel ? acc + 1 : acc,
    0,
  );
  const avg = history.reduce((s, e) => s + LADDER[e.pickedLevel].kbps, 0) / history.length;
  const switchRate = switches / history.length;

  let icon = <Activity className="h-4 w-4 text-success" />;
  let title = "ABR holder stuet og stabil";
  let body =
    "Ingen stalls, få bytter, snitt-kvalitet over 1 Mbps. Algoritmen er godt tunet for dette scenariet.";
  let color = "text-success";
  if (stalls > 0) {
    icon = <AlertTriangle className="h-4 w-4 text-red-500" />;
    title = `${stalls} stall(s) registrert`;
    body =
      "Bufferet ble tomt mens vi lastet ned. ABR var enten for grådig (valgte for høyt) eller scenariet er rett og slett for stramt. Prøv buffer-basert ABR, eller senk start-bitrate.";
    color = "text-red-500";
  } else if (switchRate > 0.4) {
    icon = <TrendingUp className="h-4 w-4 text-amber-500" />;
    title = "Mye kvalitets-svinging";
    body = `${switches} bytter på ${history.length} segmenter (${(switchRate * 100).toFixed(0)} %). Senk α (EWMA-glatting) eller bytt til BOLA — for mange bytter føles dårlig selv om snitt-kvaliteten er høy.`;
    color = "text-amber-500";
  } else if (avg < 800) {
    icon = <AlertTriangle className="h-4 w-4 text-amber-500" />;
    title = "Konservativt valg — kvaliteten lav";
    body = `Snitt-bitrate ${Math.round(avg)} kbps. Algoritmen utnytter ikke båndbredden — prøv en mer aggressiv ABR eller hev α.`;
    color = "text-amber-500";
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
