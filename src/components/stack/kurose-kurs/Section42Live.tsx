import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Zap } from "lucide-react";

// Section42Live — sammenligner de tre klassiske switching-fabric-typene
// (memory-based, bus-based, crossbar) ved å kjøre den SAMME pakke-sekvensen
// gjennom alle tre parallellt. Brukeren ser hvorfor crossbar vinner ved
// høy last, og hva HOL-blocking faktisk ser ut som.
//
// Pedagogisk poeng (Kurose 4.2):
//   - Memory: CPU kopierer pakker — én om gangen via minnebåndbredde.
//   - Bus:    Delt buss — én pakke kan krysse om gangen.
//   - Crossbar: 2D-matrise — flere pakker parallelt så lenge de skal til
//               ulike output-porter. HOL-blocking kan likevel oppstå hvis
//               input-køen er FIFO og front-pakken venter på en opptatt port.

type FabricKind = "memory" | "bus" | "crossbar";

type PacketJob = {
  id: string;
  src: 0 | 1 | 2 | 3; // input port
  dst: 0 | 1 | 2 | 3; // output port
  color: string;
};

// Standard-scenarioet vi sender gjennom alle tre fabric-typene.
// Designet for å gjøre HOL-blocking i bus-modus tydelig: input 0 har en pakke
// til port 3, deretter en pakke til port 0 (som er ledig), men crossbar+FIFO
// venter likevel. Scenarioet har også et samtidig konflikt-tilfelle
// (to inputs vil til samme output) for å vise switch-arbitrering.
const SCENARIO: PacketJob[][] = [
  // Tick 0: alle inputs har en pakke å sende
  [
    { id: "p1", src: 0, dst: 3, color: "#3b82f6" }, // blå
    { id: "p2", src: 1, dst: 2, color: "#f59e0b" }, // gul
    { id: "p3", src: 2, dst: 3, color: "#10b981" }, // grønn — konflikt med p1 mot port 3
    { id: "p4", src: 3, dst: 1, color: "#a855f7" }, // lilla
  ],
  // Tick 1: ny burst
  [
    { id: "p5", src: 0, dst: 0, color: "#06b6d4" }, // cyan
    { id: "p6", src: 1, dst: 1, color: "#ec4899" }, // rosa
  ],
  // Tick 2: en enslig pakke
  [{ id: "p7", src: 2, dst: 2, color: "#84cc16" }], // lime
];

const FABRICS: { kind: FabricKind; navn: string; beskrivelse: string }[] = [
  {
    kind: "memory",
    navn: "Minne-basert",
    beskrivelse:
      "CPU kopierer hver pakke fra input-minne til output-minne. Bare én kopiering om gangen — begrenset av minnebåndbredde.",
  },
  {
    kind: "bus",
    navn: "Buss-basert",
    beskrivelse:
      "Delt intern buss. En pakke krysser av gangen — uavhengig av destinasjon. HOL-blocking når front-pakken må vente.",
  },
  {
    kind: "crossbar",
    navn: "Crossbar (interconnect)",
    beskrivelse:
      "2D-matrise av brytere. Pakker til forskjellige output-porter krysser parallelt. Konflikt på samme output → arbitrering.",
  },
];

// Hvor mange ticks tar én pakke i hver fabric-type? (parallellisme)
// Memory: 1 pakke per tick (serielt via CPU).
// Bus:    1 pakke per tick (delt buss).
// Crossbar: én per (input, output) — flere parallelt så lenge unike par.
type SimState = {
  inFlight: PacketJob[]; // pakker som krysser fabric (varighet = 1 tick)
  delivered: PacketJob[]; // pakker som er kommet ut
  queues: PacketJob[][]; // 4 input-køer (FIFO)
};

function initState(): SimState {
  return { inFlight: [], delivered: [], queues: [[], [], [], []] };
}

// Velg neste batch å sende gjennom fabric-en. Returnerer (i, _) par for pakker
// som starter krysning denne ticken, og oppdaterer queues in-place.
function stepFabric(kind: FabricKind, queues: PacketJob[][]): PacketJob[] {
  const starting: PacketJob[] = [];
  if (kind === "memory" || kind === "bus") {
    // Én pakke per tick. Velg første ikke-tomme input-kø, FIFO.
    for (let i = 0; i < 4; i++) {
      if (queues[i].length > 0) {
        starting.push(queues[i].shift()!);
        break;
      }
    }
  } else {
    // Crossbar: For hver input-port, ta hode-pakken hvis output-porten ikke
    // allerede er reservert denne ticken. Det er HOL-blocking: en pakke
    // bak hodet får IKKE krysse selv om dens output er ledig.
    const usedOutputs = new Set<number>();
    for (let i = 0; i < 4; i++) {
      const head = queues[i][0];
      if (head && !usedOutputs.has(head.dst)) {
        starting.push(head);
        usedOutputs.add(head.dst);
        queues[i].shift();
      }
      // else: HOL-blocking — head blokkerer kø selv om bak-pakker har ledig output.
    }
  }
  return starting;
}

type LoggLinje = {
  fabric: FabricKind;
  tick: number;
  type: "ankommer" | "krysser" | "blokkert" | "levert";
  pkt: string;
  color: string;
  detalj: string;
};

// ============================================================
// Simulator-tilstand for én fabric
// ============================================================
type FabricSim = {
  state: SimState;
  doneAt: number | null; // tick når siste pakke leverte
};

function simulateAll(maxTicks: number): {
  byFabric: Record<FabricKind, { history: SimState[]; doneAt: number }>;
  logg: LoggLinje[];
} {
  const result: Record<FabricKind, { history: SimState[]; doneAt: number }> = {
    memory: { history: [], doneAt: -1 },
    bus: { history: [], doneAt: -1 },
    crossbar: { history: [], doneAt: -1 },
  };
  const logg: LoggLinje[] = [];

  for (const f of FABRICS.map((x) => x.kind)) {
    const sim: FabricSim = { state: initState(), doneAt: null };
    sim.state.queues = [[], [], [], []];

    // Tick-by-tick
    for (let t = 0; t < maxTicks; t++) {
      // 1) Pakker ankommer fra SCENARIO[t]
      const arrivals = SCENARIO[t] ?? [];
      for (const a of arrivals) {
        sim.state.queues[a.src].push(a);
        logg.push({
          fabric: f,
          tick: t,
          type: "ankommer",
          pkt: a.id,
          color: a.color,
          detalj: `Pakke ${a.id} ankommer input ${a.src} (mot output ${a.dst})`,
        });
      }

      // 2) Pakker som var "in flight" forrige tick er nå levert
      for (const p of sim.state.inFlight) {
        sim.state.delivered.push(p);
        logg.push({
          fabric: f,
          tick: t,
          type: "levert",
          pkt: p.id,
          color: p.color,
          detalj: `${p.id} levert på output ${p.dst}`,
        });
      }
      sim.state.inFlight = [];

      // 3) Start neste batch over fabric
      const startingBefore = stepFabric(f, sim.state.queues);
      sim.state.inFlight = startingBefore;
      for (const p of startingBefore) {
        logg.push({
          fabric: f,
          tick: t,
          type: "krysser",
          pkt: p.id,
          color: p.color,
          detalj: `${p.id} krysser fabric (input ${p.src} → output ${p.dst})`,
        });
      }

      // 4) Logg HOL-blocking — pakker hvis output er ledig men de venter pga FIFO
      if (f === "crossbar") {
        const used = new Set(startingBefore.map((p) => p.dst));
        for (let i = 0; i < 4; i++) {
          const head = sim.state.queues[i][0];
          if (head && used.has(head.dst)) {
            // Head ble ikke valgt fordi output er reservert i denne ticken
            logg.push({
              fabric: f,
              tick: t,
              type: "blokkert",
              pkt: head.id,
              color: head.color,
              detalj: `${head.id} venter — output ${head.dst} reservert denne tick`,
            });
          }
        }
      }

      // Lagre snapshot
      result[f].history.push(structuredClone(sim.state));

      // Sjekk om alt er levert
      const totalInScenario = SCENARIO.flat().length;
      const allArrived = t >= SCENARIO.length - 1;
      const queuesEmpty = sim.state.queues.every((q) => q.length === 0);
      const inFlightEmpty = sim.state.inFlight.length === 0;
      if (allArrived && queuesEmpty && inFlightEmpty && sim.doneAt === null) {
        // alle pakker har vært delivered — siste tick er denne
        if (sim.state.delivered.length === totalInScenario) sim.doneAt = t;
      }
    }
    result[f].doneAt =
      sim.doneAt ??
      result[f].history.findIndex(
        (s) => s.delivered.length === SCENARIO.flat().length,
      );
  }
  return { byFabric: result, logg };
}

// ============================================================
// SVG-tegning av én fabric
// ============================================================
function FabricSvg({
  kind,
  snap,
}: {
  kind: FabricKind;
  snap: SimState;
}) {
  const W = 280;
  const H = 220;
  const INPUT_X = 40;
  const OUTPUT_X = W - 40;
  const portYs = [50, 95, 140, 185];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      {/* Input-porter med køer */}
      {portYs.map((y, i) => (
        <g key={`in-${i}`}>
          <rect
            x={INPUT_X - 18}
            y={y - 12}
            width={26}
            height={24}
            rx={4}
            className="fill-blue-500/15 stroke-blue-400"
            strokeWidth={1}
          />
          <text
            x={INPUT_X - 5}
            y={y + 4}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-mono font-bold"
          >
            I{i}
          </text>
          {/* Køen — opp til 4 pakker, eldste til venstre nær inngangen */}
          {snap.queues[i].slice(0, 4).map((p, idx) => (
            <circle
              key={p.id}
              cx={INPUT_X - 18 - idx * 12 - 6}
              cy={y}
              r={5}
              fill={p.color}
              stroke="white"
              strokeWidth={1}
            />
          ))}
        </g>
      ))}
      {/* Output-porter */}
      {portYs.map((y, i) => (
        <g key={`out-${i}`}>
          <rect
            x={OUTPUT_X - 8}
            y={y - 12}
            width={26}
            height={24}
            rx={4}
            className="fill-emerald-500/15 stroke-emerald-400"
            strokeWidth={1}
          />
          <text
            x={OUTPUT_X + 5}
            y={y + 4}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-mono font-bold"
          >
            O{i}
          </text>
        </g>
      ))}

      {/* Fabric-tegning, ulik per kind */}
      {kind === "memory" && (
        <g>
          <rect
            x={W / 2 - 50}
            y={H / 2 - 30}
            width={100}
            height={60}
            rx={6}
            className="fill-slate-500/15 stroke-slate-400"
            strokeWidth={1.5}
          />
          <text
            x={W / 2}
            y={H / 2 - 8}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-bold"
          >
            CPU
          </text>
          <text
            x={W / 2}
            y={H / 2 + 6}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px]"
          >
            shared memory
          </text>
          <text
            x={W / 2}
            y={H / 2 + 18}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px]"
          >
            1 kopi/tick
          </text>
        </g>
      )}

      {kind === "bus" && (
        <g>
          {/* Tegn en horisontal buss med tappinger til hver port */}
          <rect
            x={INPUT_X + 20}
            y={H / 2 - 4}
            width={W - 80}
            height={8}
            rx={4}
            className="fill-amber-500/30 stroke-amber-500"
            strokeWidth={1.2}
          />
          {portYs.map((y, i) => (
            <g key={`tap-${i}`}>
              <line
                x1={INPUT_X + 20 + (i + 1) * 28}
                y1={H / 2}
                x2={INPUT_X + 20 + (i + 1) * 28}
                y2={y}
                className="stroke-amber-400"
                strokeWidth={0.8}
                strokeDasharray="2 2"
              />
            </g>
          ))}
          <text
            x={W / 2}
            y={H / 2 - 14}
            textAnchor="middle"
            className="fill-amber-700 dark:fill-amber-300 text-[9px] font-bold"
          >
            delt buss
          </text>
        </g>
      )}

      {kind === "crossbar" && (
        <g>
          {/* 4x4 koblings-grid */}
          {portYs.map((iy, ii) =>
            portYs.map((oy, oi) => {
              const cx = INPUT_X + 50 + oi * 35;
              const cy = iy;
              return (
                <g key={`x-${ii}-${oi}`}>
                  {/* Horisontal linje (input) — bare ved første col */}
                  {oi === 0 && (
                    <line
                      x1={INPUT_X + 10}
                      y1={iy}
                      x2={INPUT_X + 50 + 3 * 35 + 10}
                      y2={iy}
                      className="stroke-slate-400/40"
                      strokeWidth={0.8}
                    />
                  )}
                  {/* Vertikal linje (output) — bare ved første row */}
                  {ii === 0 && (
                    <line
                      x1={cx}
                      y1={portYs[0] - 10}
                      x2={cx}
                      y2={portYs[3] + 10}
                      className="stroke-slate-400/40"
                      strokeWidth={0.8}
                    />
                  )}
                  {/* Krysspunkt — fylles om en pakke krysser her */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={2.5}
                    className="fill-slate-400/40"
                  />
                </g>
              );
            }),
          )}
        </g>
      )}

      {/* Pakker som krysser fabric — animert posisjon */}
      {snap.inFlight.map((p) => {
        const sy = portYs[p.src];
        const dy = portYs[p.dst];
        let cx = W / 2;
        let cy = (sy + dy) / 2;
        if (kind === "crossbar") {
          // Plassér ved krysspunktet (src-row, dst-col)
          cx = INPUT_X + 50 + p.dst * 35;
          cy = sy;
          // Tegn linje fra input til kryss, og fra kryss ned/opp til output
          return (
            <g key={p.id}>
              <line
                x1={INPUT_X + 10}
                y1={sy}
                x2={cx}
                y2={sy}
                stroke={p.color}
                strokeWidth={2}
                opacity={0.7}
              />
              <line
                x1={cx}
                y1={sy}
                x2={cx}
                y2={dy}
                stroke={p.color}
                strokeWidth={2}
                opacity={0.7}
              />
              <line
                x1={cx}
                y1={dy}
                x2={OUTPUT_X - 10}
                y2={dy}
                stroke={p.color}
                strokeWidth={2}
                opacity={0.7}
              />
              <circle cx={cx} cy={sy} r={6} fill={p.color} stroke="white" strokeWidth={1.5} />
            </g>
          );
        }
        if (kind === "bus") {
          cx = W / 2;
          cy = H / 2;
          return (
            <g key={p.id}>
              <line
                x1={INPUT_X + 10}
                y1={sy}
                x2={cx}
                y2={cy}
                stroke={p.color}
                strokeWidth={2}
                opacity={0.7}
              />
              <line
                x1={cx}
                y1={cy}
                x2={OUTPUT_X - 10}
                y2={dy}
                stroke={p.color}
                strokeWidth={2}
                opacity={0.7}
              />
              <circle cx={cx} cy={cy} r={7} fill={p.color} stroke="white" strokeWidth={1.5} />
            </g>
          );
        }
        // memory
        return (
          <g key={p.id}>
            <line
              x1={INPUT_X + 10}
              y1={sy}
              x2={W / 2}
              y2={H / 2}
              stroke={p.color}
              strokeWidth={2}
              opacity={0.7}
            />
            <line
              x1={W / 2}
              y1={H / 2}
              x2={OUTPUT_X - 10}
              y2={dy}
              stroke={p.color}
              strokeWidth={2}
              opacity={0.7}
            />
            <circle cx={W / 2} cy={H / 2} r={7} fill={p.color} stroke="white" strokeWidth={1.5} />
          </g>
        );
      })}

      {/* Levert-teller (oppe i hjørnet) */}
      <text
        x={W - 6}
        y={14}
        textAnchor="end"
        className="fill-muted-foreground text-[9px] font-mono"
      >
        levert: {snap.delivered.length}/{SCENARIO.flat().length}
      </text>
    </svg>
  );
}

// ============================================================
// Hovedkomponent
// ============================================================
export function Section42Live() {
  const MAX_TICKS = 14;
  const { byFabric, logg } = useMemo(() => simulateAll(MAX_TICKS), []);
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      setTick((t) => {
        if (t >= MAX_TICKS - 1) {
          setPlaying(false);
          return t;
        }
        return t + 1;
      });
    }, 900);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing]);

  const tickLogg = logg.filter((l) => l.tick === tick);
  const totalPkts = SCENARIO.flat().length;

  // Stats: hvor lang tid tok det å levere alle pakker?
  const fabricStats: Record<FabricKind, number> = {
    memory: byFabric.memory.history.findIndex((s) => s.delivered.length === totalPkts),
    bus: byFabric.bus.history.findIndex((s) => s.delivered.length === totalPkts),
    crossbar: byFabric.crossbar.history.findIndex(
      (s) => s.delivered.length === totalPkts,
    ),
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <Zap className="h-3.5 w-3.5 text-amber-500" />
        <span className="font-medium text-foreground">
          Switching-fabric — samme pakke-sekvens kjørt parallelt
        </span>
        <span className="ml-auto font-mono">Tick {tick} / {MAX_TICKS - 1}</span>
      </div>

      <div className="grid gap-3 p-3 md:grid-cols-3">
        {FABRICS.map((f) => {
          const snap = byFabric[f.kind].history[tick] ?? initState();
          const done = fabricStats[f.kind];
          const isWinner =
            done >= 0 && done === Math.min(...Object.values(fabricStats).filter((v) => v >= 0));
          return (
            <div
              key={f.kind}
              className={`rounded-lg border bg-background ${
                isWinner ? "border-emerald-500/60" : "border-border"
              }`}
            >
              <div className="px-3 py-1.5 border-b border-border flex items-center justify-between">
                <span className="text-xs font-semibold">{f.navn}</span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  ferdig: tick {done >= 0 ? done : "?"}
                </span>
              </div>
              <div className="aspect-[7/5]">
                <FabricSvg kind={f.kind} snap={snap} />
              </div>
              <div className="px-3 py-1.5 text-[10px] text-muted-foreground border-t border-border">
                {f.beskrivelse}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tick-logg */}
      <div className="px-4 py-2 border-t border-border bg-muted/10">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          Hendelser denne tick
        </div>
        <div className="grid gap-1 text-[11px] md:grid-cols-3">
          {(["memory", "bus", "crossbar"] as FabricKind[]).map((f) => {
            const lines = tickLogg.filter((l) => l.fabric === f);
            return (
              <div key={f}>
                {lines.length === 0 ? (
                  <span className="text-muted-foreground italic">(ingen)</span>
                ) : (
                  lines.map((l, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span
                        className="inline-block w-2 h-2 rounded-full shrink-0"
                        style={{ background: l.color }}
                      />
                      <span
                        className={
                          l.type === "blokkert"
                            ? "text-red-600 dark:text-red-400"
                            : l.type === "levert"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : l.type === "krysser"
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-muted-foreground"
                        }
                      >
                        {l.detalj}
                      </span>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Kontroller */}
      <div className="px-4 py-2 flex items-center gap-1.5 border-t border-border bg-muted/20">
        <button
          onClick={() => setTick((t) => Math.max(0, t - 1))}
          disabled={tick === 0}
          className="rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
        >
          ← Tick
        </button>
        <button
          onClick={() => {
            if (playing) setPlaying(false);
            else {
              if (tick >= MAX_TICKS - 1) setTick(0);
              setPlaying(true);
            }
          }}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "Pause" : "Spill av"}
        </button>
        <button
          onClick={() => setTick((t) => Math.min(MAX_TICKS - 1, t + 1))}
          disabled={tick === MAX_TICKS - 1}
          className="rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
        >
          Tick →
        </button>
        <button
          onClick={() => {
            setTick(0);
            setPlaying(false);
          }}
          className="ml-auto inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Resultat-rapport */}
      <div className="px-4 py-3 border-t border-border bg-muted/10 text-xs">
        <div className="font-semibold mb-1 text-foreground">
          Hva ble bevist?
        </div>
        <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
          <li>
            <strong>Minne-basert</strong> brukte <code>{fabricStats.memory}</code> tick på {totalPkts} pakker — kun
            én pakke om gangen siden CPU er flaskehalsen.
          </li>
          <li>
            <strong>Buss-basert</strong> brukte <code>{fabricStats.bus}</code> tick — samme som minne, men uten
            CPU-overhead. Bussen begrenser fortsatt til én pakke per tick.
          </li>
          <li>
            <strong>Crossbar</strong> brukte <code>{fabricStats.crossbar}</code> tick fordi pakker til ulike
            output-porter kunne krysse parallelt. Når to inputs vil til samme
            output, ser du HOL-blocking-effekten i de røde &laquo;blokkert&raquo;-loggene
            til høyre.
          </li>
        </ul>
      </div>
    </div>
  );
}
