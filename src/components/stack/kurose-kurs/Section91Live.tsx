import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Camera, Cpu, Wifi, Database, Monitor } from "lucide-react";

// Section91Live — fullskala interaktiv for Kurose-seksjon 9.1.
//
// Pedagogisk hovedpoeng: nettverket gir ingen QoS-garantier, så multimedia-
// applikasjonen må kompensere selv. En jitter-buffer er den klassiske
// løsningen — men den er et kompromiss:
//   - For liten buffer → pakker ankommer for sent, mottakeren går tom og
//     spilleavspillingen henger (underruns).
//   - For stor buffer → all media-traffikk forsinkes; latensen blir så høy
//     at samtalen ikke fungerer (men streaming greier seg).
//
// Brukeren skrur på jitter-bredde, gjennomsnittlig nettverks-forsinkelse,
// pakketap, og buffer-størrelsen. Animasjonen viser pakker som beveger seg
// fra capture på sender-siden, gjennom encode, ut på linja, inn i jitter-
// bufferet på mottakeren, til decode + playback.
//
// Det er ikke ment som en simulator med eksakt nøyaktighet — det er en
// pedagogisk modell som gjør årsak/virkning synlig.

// ---------- Stage-geometri ----------
// SVG-vidu er 800×340. Stadiene er plassert med jevn mellomrom.
type StageId = "capture" | "encode" | "txBuf" | "network" | "rxBuf" | "decode" | "playback";

type Stage = {
  id: StageId;
  label: string;
  sub: string;
  x: number;
  side: "sender" | "network" | "receiver";
};

const STAGES: Stage[] = [
  { id: "capture", label: "Capture", sub: "kamera/mikrofon", x: 60, side: "sender" },
  { id: "encode", label: "Encode", sub: "H.264, AAC, Opus", x: 175, side: "sender" },
  { id: "txBuf", label: "Send-buf", sub: "kø før socket", x: 290, side: "sender" },
  { id: "network", label: "Nettverk", sub: "IP, best-effort", x: 420, side: "network" },
  { id: "rxBuf", label: "Jitter-buf", sub: "playout-utjevning", x: 550, side: "receiver" },
  { id: "decode", label: "Decode", sub: "rå frames", x: 665, side: "receiver" },
  { id: "playback", label: "Playback", sub: "skjerm/høyttaler", x: 770, side: "receiver" },
];

const STAGE_Y = 170; // pakker som beveger seg pipeline-mid

// ---------- Simulator-modell ----------
// Konseptuell tid i ms. En "frame" sendes hvert FRAME_INTERVAL_MS.
// Sender holder konstant rate. Nettet gir hver pakke en uavhengig forsinkelse:
//   d_net = baseLatency + jitter * Uniform(-1, 1)  (kan også droppe pakken).
// Mottakeren har en jitter-buffer som holder igjen `bufferMs` før den begynner
// å spille av. Hvis en pakke ankommer etter sin playback-tid -> "for sent"
// (registreres som underrun og pakkene markeres rødt). Hvis pakken kommer i tide
// går den til decode→playback i takt med playoutClock.

const FRAME_INTERVAL_MS = 80; // 12.5 fps — bevisst lavt for at det skal være lett å se
const TOTAL_FRAMES = 28; // sirkulær: når vi når slutten, starter vi på nytt
const TIME_SCALE = 0.18; // 1 ms simulert = 0.18 ms vegg-tid → ~5x raskere

type PacketState = "inCapture" | "inEncode" | "inTxBuf" | "inNetwork" | "inRxBuf" | "inDecode" | "played" | "dropped" | "late";

type Packet = {
  id: number;
  // Tid-stempler i simulert ms
  tCapture: number; // produsert
  tSend: number; // gått ut på linja (tCapture + lite encode-delay)
  tArrive: number; // ankomst på mottaker (tSend + d_net), eller Infinity hvis tapt
  tPlay: number; // tCapture + bufferTarget — når mottakeren ønsker å spille pakken
  dropped: boolean;
  state: PacketState;
};

type Scenario = {
  id: string;
  name: string;
  blurb: string;
  baseLatencyMs: number;
  jitterMs: number;
  lossPct: number;
  bufferMs: number;
};

const SCENARIOS: Scenario[] = [
  {
    id: "good-fiber",
    name: "Fiber, lokalt",
    blurb: "Stabilt fiber-nett i Tromsø — lite jitter, ingen tap. Buffer på 80 ms holder.",
    baseLatencyMs: 25,
    jitterMs: 10,
    lossPct: 0,
    bufferMs: 80,
  },
  {
    id: "4g-mobile",
    name: "4G under jobb-reise",
    blurb: "Cellular har moderat jitter og enkelte tap. Trenger 200 ms buffer for å overleve.",
    baseLatencyMs: 50,
    jitterMs: 60,
    lossPct: 1,
    bufferMs: 200,
  },
  {
    id: "small-buffer",
    name: "Lite buffer, stor jitter",
    blurb: "Klassisk feilkonfigurering: 50 ms buffer på et nett med 80 ms jitter — mange underruns.",
    baseLatencyMs: 40,
    jitterMs: 80,
    lossPct: 0,
    bufferMs: 50,
  },
  {
    id: "huge-buffer",
    name: "Tung buffer, lav jitter",
    blurb: "Spilleren har valgt 600 ms buffer på et stabilt nett — perfekt for Netflix, ubrukelig for samtale.",
    baseLatencyMs: 30,
    jitterMs: 15,
    lossPct: 0,
    bufferMs: 600,
  },
  {
    id: "satellite",
    name: "Satellitt fra hyttenettet",
    blurb: "Lang propagasjon (300 ms baseline) + stor jitter. Selv 400 ms buffer sliter.",
    baseLatencyMs: 300,
    jitterMs: 120,
    lossPct: 3,
    bufferMs: 400,
  },
];

// Deterministisk PRNG slik at samme parametere gir samme animasjon (lett å resonnere)
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function simulate(
  baseLatencyMs: number,
  jitterMs: number,
  lossPct: number,
  bufferMs: number,
  seed: number,
): Packet[] {
  const rng = makeRng(seed);
  const out: Packet[] = [];
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const tCapture = i * FRAME_INTERVAL_MS;
    const tSend = tCapture + 6; // 6 ms til encode + tx-buffer i denne modellen
    const dropped = rng() * 100 < lossPct;
    // Jitter: trekk fra uniform [-1, 1], multiplisert med jitterMs.
    // Klamp d_net til minimum 1 ms slik at pakker ikke "går tilbake i tid".
    const jitterOffset = (rng() * 2 - 1) * jitterMs;
    const dNet = Math.max(1, baseLatencyMs + jitterOffset);
    const tArrive = dropped ? Infinity : tSend + dNet;
    const tPlay = tCapture + bufferMs;
    out.push({
      id: i,
      tCapture,
      tSend,
      tArrive,
      tPlay,
      dropped,
      state: "inCapture",
    });
  }
  return out;
}

// Klassifiser pakke ut fra simulert tid t.
function classify(p: Packet, t: number): PacketState {
  if (p.dropped && t >= p.tSend) return "dropped";
  if (t < p.tCapture) return "inCapture"; // ikke produsert enda
  if (t < p.tSend - 3) return "inEncode";
  if (t < p.tSend) return "inTxBuf";
  if (t < p.tArrive) return "inNetwork";
  // Pakken er ankommet. Sammenlign mot tPlay:
  if (p.tArrive > p.tPlay) return "late"; // ankom etter sin playback-tid
  if (t < p.tPlay) return "inRxBuf"; // venter i jitter-buffer
  if (t < p.tPlay + 6) return "inDecode";
  return "played";
}

// Pakke-koordinat (x, y) basert på tilstand og hvor langt inni overgangen vi er.
function packetXY(p: Packet, t: number): { x: number; y: number; opacity: number } | null {
  const state = classify(p, t);
  // Defaults for hver stage
  if (state === "dropped") return null;
  if (state === "inCapture") {
    return { x: STAGES[0].x, y: STAGE_Y, opacity: 0.6 };
  }
  if (state === "inEncode") {
    return { x: STAGES[1].x, y: STAGE_Y, opacity: 1 };
  }
  if (state === "inTxBuf") {
    return { x: STAGES[2].x, y: STAGE_Y, opacity: 1 };
  }
  if (state === "inNetwork") {
    const t0 = p.tSend;
    const t1 = p.tArrive;
    const u = (t - t0) / Math.max(1, t1 - t0);
    const x0 = STAGES[2].x;
    const x1 = STAGES[4].x;
    return { x: x0 + (x1 - x0) * u, y: STAGE_Y, opacity: 1 };
  }
  if (state === "inRxBuf") {
    return { x: STAGES[4].x, y: STAGE_Y, opacity: 1 };
  }
  if (state === "inDecode") {
    return { x: STAGES[5].x, y: STAGE_Y, opacity: 1 };
  }
  if (state === "played") {
    return { x: STAGES[6].x, y: STAGE_Y, opacity: 0 };
  }
  if (state === "late") {
    // Tegn de "for sene" pakkene som faller ned under linja for å vise at de mistes
    const t0 = p.tSend;
    const t1 = p.tArrive;
    const u = Math.min(1, (t - t0) / Math.max(1, t1 - t0));
    const x0 = STAGES[2].x;
    const x1 = STAGES[4].x;
    const x = x0 + (x1 - x0) * u;
    // Etter ankomst — fall ned og falm ut
    if (t > p.tArrive) {
      const dropU = Math.min(1, (t - p.tArrive) / 200);
      return { x: STAGES[4].x, y: STAGE_Y + 80 * dropU, opacity: 1 - dropU };
    }
    return { x, y: STAGE_Y, opacity: 1 };
  }
  return null;
}

function colorForPacket(p: Packet, t: number): string {
  const s = classify(p, t);
  if (s === "dropped") return "fill-red-500";
  if (s === "late") return "fill-amber-500";
  if (s === "played") return "fill-success";
  if (s === "inRxBuf") return "fill-purple-500";
  if (s === "inNetwork") return "fill-brand";
  return "fill-cyan-500";
}

// ---------- Komponenten ----------

export function Section91Live() {
  // Innstillinger
  const [baseLatencyMs, setBaseLatencyMs] = useState(50);
  const [jitterMs, setJitterMs] = useState(40);
  const [lossPct, setLossPct] = useState(0);
  const [bufferMs, setBufferMs] = useState(150);
  const [seed, setSeed] = useState(7);

  // Animasjons-tid (simulert ms)
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  // Pakke-simulering (memoiseres med innstillingene)
  const packets = useMemo(
    () => simulate(baseLatencyMs, jitterMs, lossPct, bufferMs, seed),
    [baseLatencyMs, jitterMs, lossPct, bufferMs, seed],
  );

  // Total varighet i simulert tid: siste capture + buffer + litt margin
  const totalMs = TOTAL_FRAMES * FRAME_INTERVAL_MS + bufferMs + 400;

  useEffect(() => {
    if (!playing) {
      lastRef.current = 0;
      return;
    }
    let mounted = true;
    function tick(now: number) {
      if (!mounted) return;
      if (!lastRef.current) lastRef.current = now;
      const dtWall = now - lastRef.current;
      lastRef.current = now;
      const dtSim = dtWall / TIME_SCALE; // 1ms vegg-tid = (1/TIME_SCALE) simulert
      setT((prev) => {
        const next = prev + dtSim;
        if (next > totalMs) {
          // loop
          return 0;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [playing, totalMs]);

  // Når brukeren endrer innstillinger, hold posisjon men ikke pause — bare oppdater pakkene.
  // Telleverk: hvor mange pakker har til nå blitt klassifisert som late/dropped/played?
  const stats = useMemo(() => {
    let played = 0;
    let late = 0;
    let dropped = 0;
    let inFlight = 0;
    let inRxBuf = 0;
    for (const p of packets) {
      const s = classify(p, t);
      if (s === "played") played++;
      else if (s === "late") late++;
      else if (s === "dropped") dropped++;
      else if (s === "inNetwork") inFlight++;
      else if (s === "inRxBuf") inRxBuf++;
    }
    return { played, late, dropped, inFlight, inRxBuf };
  }, [packets, t]);

  // Effektiv glass-to-glass latens (sender-fotografering til mottaker-playback):
  // ~ encode + base + buffer. Bruker disse tre rett inn (modellen vår):
  const glassToGlass = 6 /* encode */ + baseLatencyMs + bufferMs;

  // Forventet andel "for sent" basert på jitter og buffer: andelen tilfeller der
  // jitter-offset > bufferMs - baseLatencyMs. Med uniform [-jitter, +jitter]:
  // Hvis jitterMs <= bufferMs, andelen er 0 (men kun under modellen vår).
  // Vi viser dette som "buffer-margin" — en grov enkelt-måler.
  const bufferMargin = bufferMs - baseLatencyMs;
  const expectedLate = jitterMs <= 0 ? 0 : Math.max(0, Math.min(1, (jitterMs - bufferMargin) / (2 * jitterMs)));

  function presetTo(s: Scenario) {
    setBaseLatencyMs(s.baseLatencyMs);
    setJitterMs(s.jitterMs);
    setLossPct(s.lossPct);
    setBufferMs(s.bufferMs);
    setT(0);
  }

  function reset() {
    setT(0);
    setPlaying(true);
  }

  function resample() {
    setSeed((s) => (s + 1) & 0xffffffff);
    setT(0);
  }

  // ---------- Tegning ----------

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">
          Streaming-pipeline: hvorfor jitter-bufferet er et kompromiss
        </span>
        <span className="ml-auto font-mono">
          Glass-til-glass: ~{Math.round(glassToGlass)} ms
        </span>
      </div>

      {/* Hoved-SVG */}
      <svg viewBox="0 0 820 340" className="w-full h-auto bg-muted/10">
        {/* Bakgrunns-bånd som markerer sender / nettverk / mottaker */}
        <rect x={0} y={20} width={355} height={220} className="fill-cyan-500/5" />
        <rect x={355} y={20} width={130} height={220} className="fill-brand/5" />
        <rect x={485} y={20} width={335} height={220} className="fill-purple-500/5" />
        <text x={177} y={36} textAnchor="middle" className="fill-cyan-700 dark:fill-cyan-300 text-[10px] font-semibold">
          SENDER
        </text>
        <text x={420} y={36} textAnchor="middle" className="fill-brand text-[10px] font-semibold">
          NETTVERK (best-effort)
        </text>
        <text x={652} y={36} textAnchor="middle" className="fill-purple-700 dark:fill-purple-300 text-[10px] font-semibold">
          MOTTAKER
        </text>

        {/* Stage-bokser */}
        {STAGES.map((s) => (
          <StageBox key={s.id} stage={s} active={isStageActive(s.id, packets, t)} />
        ))}

        {/* Pipeline-linje mellom stagene */}
        <line x1={75} y1={STAGE_Y} x2={760} y2={STAGE_Y} className="stroke-muted-foreground/30" strokeWidth={2} strokeDasharray="3 3" />

        {/* Sky-form rundt "Nettverk" */}
        <NetworkCloud cx={420} cy={STAGE_Y} />

        {/* Pakker */}
        {packets.map((p) => {
          const xy = packetXY(p, t);
          if (!xy) return null;
          const id = p.id;
          return (
            <g key={id} opacity={xy.opacity}>
              <circle cx={xy.x} cy={xy.y} r={9} className={`${colorForPacket(p, t)} stroke-background`} strokeWidth={1.5} />
              <text x={xy.x} y={xy.y + 3} textAnchor="middle" className="fill-background text-[8px] font-bold pointer-events-none">
                {id + 1}
              </text>
            </g>
          );
        })}

        {/* Klokke / playout-cursor på mottakeren */}
        <PlayoutClock t={t} bufferMs={bufferMs} />

        {/* Stats-bånd nederst */}
        <g transform={`translate(0, 250)`}>
          <rect x={0} y={0} width={820} height={90} className="fill-muted/40" />
          <text x={20} y={18} className="fill-foreground text-[10px] font-semibold">
            Simulert tid: {Math.round(t)} ms
          </text>
          <text x={20} y={34} className="fill-success text-[10px]">
            Spilt av i tide: {stats.played}
          </text>
          <text x={20} y={48} className="fill-amber-600 dark:fill-amber-400 text-[10px]">
            For sent (underrun): {stats.late}
          </text>
          <text x={20} y={62} className="fill-red-500 text-[10px]">
            Tapt i nett: {stats.dropped}
          </text>
          <text x={195} y={34} className="fill-foreground text-[10px]">
            I jitter-buffer: <tspan className="fill-purple-500 font-semibold">{stats.inRxBuf}</tspan>
          </text>
          <text x={195} y={48} className="fill-foreground text-[10px]">
            På linja: <tspan className="fill-brand font-semibold">{stats.inFlight}</tspan>
          </text>
          <text x={195} y={62} className="fill-muted-foreground text-[10px]">
            Buffer: {bufferMs} ms
          </text>
          <text x={340} y={34} className="fill-foreground text-[10px]">
            Base: <tspan className="font-semibold">{baseLatencyMs} ms</tspan>
          </text>
          <text x={340} y={48} className="fill-foreground text-[10px]">
            Jitter ±: <tspan className="font-semibold">{jitterMs} ms</tspan>
          </text>
          <text x={340} y={62} className="fill-foreground text-[10px]">
            Tap: <tspan className="font-semibold">{lossPct.toFixed(1)} %</tspan>
          </text>
          <text x={460} y={34} className="fill-foreground text-[10px]">
            Forventet underrun-andel:
          </text>
          <text x={460} y={48} className="fill-amber-600 dark:fill-amber-400 text-[11px] font-semibold">
            {(expectedLate * 100).toFixed(0)} %
          </text>
          {/* Pedagogisk diagnose i egen rad */}
          <DiagnosisLabel
            jitterMs={jitterMs}
            bufferMs={bufferMs}
            baseLatencyMs={baseLatencyMs}
            expectedLate={expectedLate}
          />
        </g>
      </svg>

      {/* Kontroller */}
      <div className="px-4 py-3 border-t border-border bg-muted/20 grid gap-3 md:grid-cols-2">
        <SliderField
          label="Base-forsinkelse i nettet"
          value={baseLatencyMs}
          min={5}
          max={400}
          step={5}
          unit="ms"
          onChange={setBaseLatencyMs}
          help="Gjennomsnitlig én-veis propagasjon (fiber til Oslo ≈ 5 ms, satellitt ≈ 300 ms)."
        />
        <SliderField
          label="Jitter (±) — variasjon over base"
          value={jitterMs}
          min={0}
          max={200}
          step={5}
          unit="ms"
          onChange={setJitterMs}
          help="Hvor mye pakker spriker rundt gjennomsnittet. Voksende kø-fyll → økt jitter."
        />
        <SliderField
          label="Jitter-buffer på mottakeren"
          value={bufferMs}
          min={0}
          max={800}
          step={10}
          unit="ms"
          onChange={setBufferMs}
          help="Hvor lenge pakker holdes igjen før playback. For lite → underruns; for mye → latens."
          accent="purple"
        />
        <SliderField
          label="Pakketap i nettet"
          value={lossPct}
          min={0}
          max={10}
          step={0.5}
          unit="%"
          onChange={setLossPct}
          help="Andelen pakker som droppes. Multimedia tolererer 1–3 % via PLC (se 9.3)."
          accent="red"
        />
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
          <RotateCcw className="h-3 w-3" /> Restart fra t=0
        </button>
        <button
          onClick={resample}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          Trekk ny jitter-sekvens
        </button>
        <span className="ml-auto text-[10px] text-muted-foreground">
          Forhåndsdefinerte scenarier:
        </span>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => presetTo(s)}
            title={s.blurb}
            className="rounded border border-border bg-background px-2 py-1 text-[10px] hover:border-brand/60"
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <LegendDot className="bg-cyan-500" /> På sender-siden
        <LegendDot className="bg-brand" /> På linja
        <LegendDot className="bg-purple-500" /> I jitter-buffer
        <LegendDot className="bg-success" /> Spilt av i tide
        <LegendDot className="bg-amber-500" /> For sent (underrun)
        <LegendDot className="bg-red-500" /> Tapt i nettet
      </div>
    </div>
  );
}

// ---------- Hjelpere ----------

function isStageActive(id: StageId, packets: Packet[], t: number): boolean {
  for (const p of packets) {
    const s = classify(p, t);
    if (id === "capture" && s === "inCapture") return true;
    if (id === "encode" && s === "inEncode") return true;
    if (id === "txBuf" && s === "inTxBuf") return true;
    if (id === "network" && s === "inNetwork") return true;
    if (id === "rxBuf" && s === "inRxBuf") return true;
    if (id === "decode" && s === "inDecode") return true;
    if (id === "playback" && s === "played") {
      // "played" akkurat nå hvis t er rett etter playout
      if (Math.abs(t - (p.tPlay + 6)) < 60) return true;
    }
  }
  return false;
}

function StageBox({ stage, active }: { stage: Stage; active: boolean }) {
  const Icon = STAGE_ICON[stage.id];
  return (
    <g>
      <rect
        x={stage.x - 38}
        y={STAGE_Y - 36}
        width={76}
        height={56}
        rx={6}
        className={
          active
            ? "fill-card stroke-foreground"
            : "fill-card stroke-muted-foreground/50"
        }
        strokeWidth={active ? 2 : 1.5}
      />
      <g transform={`translate(${stage.x - 8}, ${STAGE_Y - 28})`} className="text-foreground">
        <Icon size={16} />
      </g>
      <text x={stage.x} y={STAGE_Y - 4} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        {stage.label}
      </text>
      <text x={stage.x} y={STAGE_Y + 10} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        {stage.sub}
      </text>
    </g>
  );
}

const STAGE_ICON: Record<StageId, React.ComponentType<{ size?: number }>> = {
  capture: Camera,
  encode: Cpu,
  txBuf: Database,
  network: Wifi,
  rxBuf: Database,
  decode: Cpu,
  playback: Monitor,
};

function NetworkCloud({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={62} ry={42} className="fill-brand/5 stroke-brand/30" strokeWidth={1.5} strokeDasharray="3 2" />
    </g>
  );
}

function PlayoutClock({ t, bufferMs }: { t: number; bufferMs: number }) {
  // Vis et lite "playout-hode" som beveger seg under playback-stadiet
  // for å antyde at mottakeren ber om frame nr ⌊(t - bufferMs) / FRAME_INTERVAL⌋.
  const frameNow = Math.floor((t - bufferMs) / FRAME_INTERVAL_MS);
  return (
    <g>
      <line x1={STAGES[6].x} y1={STAGE_Y - 50} x2={STAGES[6].x} y2={STAGE_Y - 38} className="stroke-success" strokeWidth={2} />
      <text x={STAGES[6].x} y={STAGE_Y - 56} textAnchor="middle" className="fill-success text-[9px] font-semibold">
        spiller frame {Math.max(0, frameNow + 1)}
      </text>
    </g>
  );
}

function DiagnosisLabel({
  jitterMs,
  bufferMs,
  baseLatencyMs,
  expectedLate,
}: {
  jitterMs: number;
  bufferMs: number;
  baseLatencyMs: number;
  expectedLate: number;
}) {
  // Tre tilfeller:
  // 1. bufferMs < jitterMs  → mange underruns (rødt)
  // 2. bufferMs > 5 * jitterMs og bufferMs + baseLatencyMs > 300 → unødvendig høy latens (oransje)
  // 3. annet → balansert (grønt)
  let title = "Balansert valg";
  let body = "Bufferet absorberer jitter uten å pumpe opp latensen for mye.";
  let fill = "fill-success";
  if (expectedLate > 0.05) {
    title = "Bufferet er for lite";
    body = `Forventet ~${(expectedLate * 100).toFixed(0)} % pakker ankommer for sent. Skru opp bufferet eller ned jitteren.`;
    fill = "fill-amber-600 dark:fill-amber-400";
  } else if (bufferMs > 5 * Math.max(1, jitterMs) && baseLatencyMs + bufferMs > 250) {
    title = "Unødvendig høy latens";
    body = `Glass-til-glass ≈ ${baseLatencyMs + bufferMs} ms. Greit for VOD/Netflix, men bryter VoIP-budsjettet på 150 ms.`;
    fill = "fill-cyan-700 dark:fill-cyan-300";
  }
  return (
    <g>
      <rect x={555} y={18} width={250} height={62} rx={4} className="fill-card stroke-border" strokeWidth={1} />
      <text x={565} y={32} className={`${fill} text-[10px] font-semibold`}>
        {title}
      </text>
      <foreignObject x={565} y={36} width={235} height={42}>
        <div className="text-[10px] text-muted-foreground leading-tight">{body}</div>
      </foreignObject>
    </g>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  help,
  accent,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (n: number) => void;
  help?: string;
  accent?: "purple" | "red";
}) {
  const accentClass =
    accent === "purple"
      ? "accent-purple-500"
      : accent === "red"
        ? "accent-red-500"
        : "accent-brand";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-medium text-foreground">{label}</label>
        <span className="text-xs font-mono text-foreground">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`mt-1 w-full ${accentClass}`}
      />
      {help && <p className="mt-0.5 text-[10px] text-muted-foreground">{help}</p>}
    </div>
  );
}

function LegendDot({ className }: { className: string }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${className}`} />;
}
