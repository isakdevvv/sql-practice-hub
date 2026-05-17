import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Zap } from "lucide-react";

// ---------------------------------------------------------------------------
// HddPhysicsViz — interaktiv visualisering av en mekanisk HDD.
//
// Bruker en SVG av platter sett ovenfra: 4 konsentriske spor (cylinders), en
// roterende rød markør for hvor "head" leser nå, og en bevegelig arm. Vi
// animerer både rotasjon (rotation latency) og arm-bevegelse (seek time)
// uavhengig — de er to forskjellige fysiske kilder til ventetid.
//
// Brukeren velger:
//   - mål-spor (track number, 0 = ytterst, 3 = innerst)
//   - mål-sektor (0..7 langs sporet)
//   - RPM (5400 / 7200 / 15000)
// og ser hvor mange ms det tar å nå "data ready" — sum av seek + rotational.
//
// Pedagogisk poeng: vis at random-aksess på HDD er fundamentalt straffet av
// fysikken (arm må flyttes + plate må rotere), mens sequential nesten ikke
// betaler noe — vi kan bare lese den neste sektoren på samme spor.
// ---------------------------------------------------------------------------

type Rpm = 5400 | 7200 | 15000;

const RPM_LABEL: Record<Rpm, string> = {
  5400: "5400 RPM (laptop)",
  7200: "7200 RPM (desktop)",
  15000: "15 000 RPM (enterprise)",
};

// Rotasjons-tid for halv runde i ms (gjennomsnittlig rotational latency).
function avgRotationalMs(rpm: Rpm) {
  // 60_000 ms/min / rpm = ms per omdreining. Snitt-vent = halv omdreining.
  return 60_000 / rpm / 2;
}

// Anslag på seek-tid i ms basert på avstand i antall spor.
// Forenklet modell: ~3 ms minimum + ~1 ms per spor (langt unna virkeligheten i
// detalj, men illustrerer "lengre seek = mer tid").
function seekMs(deltaTracks: number) {
  if (deltaTracks === 0) return 0; // ingen seek
  return 3 + Math.abs(deltaTracks) * 1.5;
}

const NUM_TRACKS = 4;
const SECTORS_PER_TRACK = 8;

export function HddPhysicsViz() {
  const [rpm, setRpm] = useState<Rpm>(7200);
  const [targetTrack, setTargetTrack] = useState(2);
  const [targetSector, setTargetSector] = useState(5);
  const [headTrack, setHeadTrack] = useState(0);
  const [headAngle, setHeadAngle] = useState(0); // grader 0..360, øker med tid
  const [running, setRunning] = useState(false);
  const [seekDone, setSeekDone] = useState(true);
  const [animPhase, setAnimPhase] = useState<"idle" | "seek" | "rotate" | "done">("idle");

  // ms/grad rotasjon: 360° per rotasjon = 60000/rpm ms.
  const msPerDeg = useMemo(() => 60_000 / rpm / 360, [rpm]);

  // Animer fri rotasjon når disken "spinner" (running=true).
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  useEffect(() => {
    if (!running) {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
      return;
    }
    const tick = (ts: number) => {
      const last = lastTsRef.current;
      lastTsRef.current = ts;
      if (last != null) {
        const dt = ts - last;
        const degPerMs = 1 / msPerDeg;
        setHeadAngle((a) => (a + dt * degPerMs) % 360);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [running, msPerDeg]);

  const deltaTracks = targetTrack - headTrack;
  const seekTime = seekMs(deltaTracks);
  const rotTime = avgRotationalMs(rpm);
  const totalTime = seekTime + rotTime;

  function doMove() {
    setSeekDone(false);
    setAnimPhase("seek");
    setRunning(true);
    // Steg 1: animer arm-bevegelse over ~600 ms uansett (visualisering, ikke realistisk).
    const seekDurationViz = Math.max(200, Math.min(1500, seekTime * 30));
    const fromTrack = headTrack;
    const toTrack = targetTrack;
    const start = performance.now();
    const seekAnim = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(1, elapsed / seekDurationViz);
      setHeadTrack(fromTrack + (toTrack - fromTrack) * t);
      if (t < 1) {
        requestAnimationFrame(seekAnim);
      } else {
        setHeadTrack(toTrack);
        setAnimPhase("rotate");
        setTimeout(() => {
          setAnimPhase("done");
          setSeekDone(true);
        }, 800);
      }
    };
    requestAnimationFrame(seekAnim);
  }

  function reset() {
    setHeadTrack(0);
    setHeadAngle(0);
    setRunning(false);
    setSeekDone(true);
    setAnimPhase("idle");
  }

  // Geometri for SVG (256x256, sentrum i 128,128).
  const cx = 128;
  const cy = 128;
  const outerR = 110;
  const innerR = 35;
  const trackR = (i: number) =>
    outerR - ((outerR - innerR) * i) / (NUM_TRACKS - 1);

  // Sektor i grader (klokken): sektor 0 starter på 270° (toppen) og går med klokken.
  const sectorAngle = (s: number) => (270 + (360 / SECTORS_PER_TRACK) * s) % 360;
  const targetAngle = sectorAngle(targetSector);

  // Head-posisjon (markør på platen) basert på headAngle:
  const headR = trackR(headTrack);
  const headPos = {
    x: cx + headR * Math.cos((headAngle * Math.PI) / 180),
    y: cy + headR * Math.sin((headAngle * Math.PI) / 180),
  };

  // Mål-posisjon (hvor vi vil ha hodet for å lese targetSector):
  const targetR = trackR(targetTrack);
  const targetPos = {
    x: cx + targetR * Math.cos((targetAngle * Math.PI) / 180),
    y: cy + targetR * Math.sin((targetAngle * Math.PI) / 180),
  };

  // Arm-tegning: fra utenfor platen (høyre side) inn til hodet.
  const armEndX = cx + headR + 15;
  const armEndY = cy + 1;

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div className="space-y-3">
          <svg viewBox="0 0 256 256" className="w-full max-w-sm mx-auto">
            <defs>
              <radialGradient id="platter" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#444" />
                <stop offset="60%" stopColor="#222" />
                <stop offset="100%" stopColor="#111" />
              </radialGradient>
            </defs>
            {/* Platen */}
            <circle cx={cx} cy={cy} r={outerR} fill="url(#platter)" stroke="#666" strokeWidth="1" />
            {/* Spindle */}
            <circle cx={cx} cy={cy} r={innerR} fill="#222" stroke="#555" strokeWidth="1" />
            {/* Spor */}
            {Array.from({ length: NUM_TRACKS }).map((_, i) => (
              <circle
                key={`t${i}`}
                cx={cx}
                cy={cy}
                r={trackR(i)}
                fill="none"
                stroke={i === targetTrack ? "rgb(34 197 94 / 0.7)" : "rgb(255 255 255 / 0.08)"}
                strokeWidth={i === targetTrack ? 1.5 : 0.8}
                strokeDasharray={i === targetTrack ? "" : "2 3"}
              />
            ))}
            {/* Sektor-linjer */}
            {Array.from({ length: SECTORS_PER_TRACK }).map((_, s) => {
              const a = (sectorAngle(s) * Math.PI) / 180;
              return (
                <line
                  key={`s${s}`}
                  x1={cx + innerR * Math.cos(a)}
                  y1={cy + innerR * Math.sin(a)}
                  x2={cx + outerR * Math.cos(a)}
                  y2={cy + outerR * Math.sin(a)}
                  stroke="rgb(255 255 255 / 0.06)"
                  strokeWidth="0.6"
                />
              );
            })}
            {/* Mål-sektor highlighted */}
            <circle
              cx={targetPos.x}
              cy={targetPos.y}
              r={6}
              fill="rgb(34 197 94 / 0.4)"
              stroke="rgb(34 197 94)"
              strokeWidth="1.5"
            />
            {/* Arm */}
            <line
              x1={armEndX}
              y1={armEndY}
              x2={headPos.x}
              y2={headPos.y}
              stroke="#bbb"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <rect x={armEndX - 4} y={armEndY - 8} width="16" height="16" fill="#aaa" />
            {/* Head */}
            <circle
              cx={headPos.x}
              cy={headPos.y}
              r={4}
              fill="rgb(239 68 68)"
              stroke="white"
              strokeWidth="1"
            />
          </svg>
          <div className="flex items-center justify-center gap-2 text-xs">
            <button
              onClick={() => setRunning((r) => !r)}
              className="rounded-md border bg-card px-3 py-1.5 hover:bg-accent inline-flex items-center gap-1.5"
            >
              {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {running ? "Stopp spinn" : "Start spinn"}
            </button>
            <button
              onClick={reset}
              className="rounded-md border bg-card px-3 py-1.5 hover:bg-accent inline-flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Nullstill
            </button>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <label className="block font-medium mb-1">Rotasjonshastighet</label>
            <div className="flex flex-wrap gap-1.5">
              {([5400, 7200, 15000] as Rpm[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRpm(r)}
                  className={`rounded-md border px-2.5 py-1 text-xs ${
                    rpm === r ? "border-brand bg-brand/10 text-brand" : "bg-card hover:bg-accent"
                  }`}
                >
                  {RPM_LABEL[r]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">
              Mål-spor: <span className="text-brand">{targetTrack}</span>{" "}
              <span className="text-muted-foreground text-xs">
                ({targetTrack === 0 ? "ytterst" : targetTrack === NUM_TRACKS - 1 ? "innerst" : "midten"})
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={NUM_TRACKS - 1}
              value={targetTrack}
              onChange={(e) => setTargetTrack(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">
              Mål-sektor: <span className="text-brand">{targetSector}</span>
            </label>
            <input
              type="range"
              min={0}
              max={SECTORS_PER_TRACK - 1}
              value={targetSector}
              onChange={(e) => setTargetSector(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <button
            onClick={doMove}
            disabled={!seekDone}
            className="w-full rounded-md bg-brand text-brand-foreground px-3 py-2 hover:bg-brand/90 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
          >
            <Zap className="h-4 w-4" /> Les denne sektoren
          </button>

          <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Seek-tid (arm)</span>
              <span className="font-mono text-sm">
                {seekTime.toFixed(1)} ms <span className="text-muted-foreground">(Δ{deltaTracks} spor)</span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rotasjons-latency (snitt)</span>
              <span className="font-mono text-sm">{rotTime.toFixed(2)} ms</span>
            </div>
            <div className="flex justify-between border-t pt-1 mt-1">
              <span className="font-medium">Totalt før data leses</span>
              <span className="font-mono text-sm font-semibold text-brand">
                {totalTime.toFixed(2)} ms
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Fase:{" "}
              <span className="font-mono text-foreground">
                {animPhase === "idle" && "venter"}
                {animPhase === "seek" && "armen flytter seg…"}
                {animPhase === "rotate" && "venter på riktig sektor…"}
                {animPhase === "done" && "data ferdig lest ✔"}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
            <strong className="text-amber-600 dark:text-amber-400">Eksperiment:</strong> sett
            mål-spor til samme som hodet (Δ = 0) — da koster seek 0 ms. Dette er hvorfor sekvensiell
            lesing er så mye raskere enn random: armen står stille, og platen er allerede der.
          </div>
        </div>
      </div>
    </div>
  );
}
