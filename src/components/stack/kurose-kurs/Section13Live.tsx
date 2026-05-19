import { useEffect, useMemo, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react";

// Levende widget for seksjon 1.3 (Pakker vs kretser):
// Et lite delt nettverk med tre kilder (A, B, C) som alle vil sende
// data gjennom de samme rutere. Vi animerer fire stadier som
// kontrasterer krets-svitsjing med pakke-svitsjing:
//   1) Krets reserverer en sti
//   2) Reservert sti står ubrukt mellom stille intervaller
//   3) Pakke-svitsjing — alle tre kildene multiplekses over samme lenker
//   4) Pakke-svitsjing — kø-buildup og pakketap når trafikk topper seg

type NodeId =
  | "kildeA"
  | "kildeB"
  | "kildeC"
  | "r1"
  | "r2"
  | "r3"
  | "r4"
  | "destX"
  | "destY"
  | "destZ";

type Node = {
  id: NodeId;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  kind: "host" | "router";
  /** Hvilken kilde/dest-farge brukes for host-noder. */
  source?: "A" | "B" | "C";
};

const NODES: Node[] = [
  { id: "kildeA", label: "A", sublabel: "kilde", x: 60, y: 70, kind: "host", source: "A" },
  { id: "kildeB", label: "B", sublabel: "kilde", x: 60, y: 140, kind: "host", source: "B" },
  { id: "kildeC", label: "C", sublabel: "kilde", x: 60, y: 210, kind: "host", source: "C" },
  { id: "r1", label: "R1", x: 200, y: 140, kind: "router" },
  { id: "r2", label: "R2", x: 340, y: 100, kind: "router" },
  { id: "r3", label: "R3", x: 340, y: 180, kind: "router" },
  { id: "r4", label: "R4", x: 480, y: 140, kind: "router" },
  { id: "destX", label: "X", sublabel: "mottaker", x: 620, y: 70, kind: "host", source: "A" },
  { id: "destY", label: "Y", sublabel: "mottaker", x: 620, y: 140, kind: "host", source: "B" },
  { id: "destZ", label: "Z", sublabel: "mottaker", x: 620, y: 210, kind: "host", source: "C" },
];

// Topologi: hver kilde har en linje inn til R1; R1 mater til både R2 og R3
// (to parallelle bakgrunns-stier); begge samles igjen i R4; R4 fanner ut
// til tre mottakere.
const EDGES: [NodeId, NodeId][] = [
  ["kildeA", "r1"],
  ["kildeB", "r1"],
  ["kildeC", "r1"],
  ["r1", "r2"],
  ["r1", "r3"],
  ["r2", "r4"],
  ["r3", "r4"],
  ["r4", "destX"],
  ["r4", "destY"],
  ["r4", "destZ"],
];

type Mode = "krets" | "pakke";
type Source = "A" | "B" | "C";

/** En pakke-flytdef innenfor ett steg. */
type Flow = {
  source: Source;
  path: NodeId[];
  /** Offset (0..1) — der pakken starter i path når progress = 0. */
  offset: number;
  /** Hvor lenge én reise tar — relativt til hele steget. >1 = mer enn én tur. */
  laps: number;
  /** Om pakken «dør» (mistes) på et bestemt segment. null = lever hele veien. */
  dropAtSegment?: number;
};

type Step = {
  title: string;
  description: string;
  mode: Mode;
  /** Sti som er reservert i krets-modus (lyser opp tykt). */
  reservedPath?: NodeId[];
  /** Pakke-flyt for pakke-modus (eller stille krets-modus). */
  flows: Flow[];
  /** Kø-counter ved en bestemt ruter (kun siste steg). */
  queueAt?: NodeId;
  /** Kø-max for animasjon. */
  queueMax?: number;
};

const STEPS: Step[] = [
  {
    title: "1. Krets-svitsjing: en sti reserveres",
    description:
      "Før A i det hele tatt får sende et bit til X, må nettet sette opp en dedikert kanal: A→R1→R2→R4→X. Lenkene langs ruten øremerkes for denne samtalen — ingen andre får bruke kapasiteten der, selv om det skulle være ledig. Tenk på det som en jernbaneskinne lagt ned bare for ett tog.",
    mode: "krets",
    reservedPath: ["kildeA", "r1", "r2", "r4", "destX"],
    flows: [{ source: "A", path: ["kildeA", "r1", "r2", "r4", "destX"], offset: 0, laps: 1 }],
  },
  {
    title: "2. Krets-svitsjing: stille — kapasiteten sløses",
    description:
      "A og X snakker ikke kontinuerlig. I pausene står den reserverte stien tom, men ingen andre har lov til å bruke den. B og C har data å sende, men de må vente eller få sin egen kanal et annet sted. Dette er kjerneproblemet med krets-svitsjing: garantert kapasitet betyr garantert sløsing når trafikken er burstig.",
    mode: "krets",
    reservedPath: ["kildeA", "r1", "r2", "r4", "destX"],
    flows: [
      // Én enkelt pakke som beveger seg sakte — resten av tiden er stille.
      { source: "A", path: ["kildeA", "r1", "r2", "r4", "destX"], offset: 0, laps: 0.35 },
    ],
  },
  {
    title: "3. Pakke-svitsjing: statistisk multipleksing",
    description:
      "Nå sender A, B og C samtidig. Hver pakke står på egne ben — den får ruter-adresse-hodet sitt, og ruterne videresender den når den ankommer. Pakker fra alle tre kildene flettes inn på de samme lenkene. Ingen reserverer noe på forhånd; lenkene utnyttes så mye som mulig.",
    mode: "pakke",
    flows: [
      { source: "A", path: ["kildeA", "r1", "r2", "r4", "destX"], offset: 0.0, laps: 1.6 },
      { source: "A", path: ["kildeA", "r1", "r3", "r4", "destX"], offset: 0.5, laps: 1.6 },
      { source: "B", path: ["kildeB", "r1", "r2", "r4", "destY"], offset: 0.2, laps: 1.6 },
      { source: "B", path: ["kildeB", "r1", "r3", "r4", "destY"], offset: 0.7, laps: 1.6 },
      { source: "C", path: ["kildeC", "r1", "r3", "r4", "destZ"], offset: 0.1, laps: 1.6 },
      { source: "C", path: ["kildeC", "r1", "r2", "r4", "destZ"], offset: 0.6, laps: 1.6 },
    ],
  },
  {
    title: "4. Pakke-svitsjing: køen vokser, pakker kan mistes",
    description:
      "Hva skjer hvis alle tre kildene plutselig sender for mye samtidig? R1 må holde pakker i et minne-buffer mens utgående lenke er opptatt. Bufferet er endelig — overstiger trafikken kapasiteten, må ruteren droppe pakker. Du ser kø-telleren vokse, og noen pakker forsvinner underveis (rød ring).",
    mode: "pakke",
    flows: [
      { source: "A", path: ["kildeA", "r1", "r2", "r4", "destX"], offset: 0.0, laps: 1.4 },
      { source: "A", path: ["kildeA", "r1", "r3", "r4", "destX"], offset: 0.35, laps: 1.4 },
      { source: "A", path: ["kildeA", "r1", "r2", "r4", "destX"], offset: 0.7, laps: 1.4 },
      {
        source: "B",
        path: ["kildeB", "r1", "r2", "r4", "destY"],
        offset: 0.15,
        laps: 1.4,
        dropAtSegment: 1,
      },
      { source: "B", path: ["kildeB", "r1", "r3", "r4", "destY"], offset: 0.55, laps: 1.4 },
      { source: "C", path: ["kildeC", "r1", "r3", "r4", "destZ"], offset: 0.25, laps: 1.4 },
      {
        source: "C",
        path: ["kildeC", "r1", "r2", "r4", "destZ"],
        offset: 0.45,
        laps: 1.4,
        dropAtSegment: 1,
      },
      { source: "C", path: ["kildeC", "r1", "r3", "r4", "destZ"], offset: 0.85, laps: 1.4 },
    ],
    queueAt: "r1",
    queueMax: 8,
  },
];

// Farger per kilde
const COLOR_CLASS: Record<Source, string> = {
  A: "fill-brand",
  B: "fill-amber-500",
  C: "fill-success",
};
const STROKE_CLASS: Record<Source, string> = {
  A: "stroke-brand",
  B: "stroke-amber-500",
  C: "stroke-success",
};
const BG_CLASS: Record<Source, string> = {
  A: "bg-brand",
  B: "bg-amber-500",
  C: "bg-success",
};

export function Section13Live() {
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 innenfor nåværende steg

  const step = STEPS[stepIdx];

  // Animasjons-loop
  useEffect(() => {
    if (!playing) return;
    let raf: number;
    let last = performance.now();
    const SPEED = 1 / 4200; // ~4.2 sek per steg — mer tid for å lese pakke-mylderet
    function tick(now: number) {
      const dt = now - last;
      last = now;
      setProgress((p) => {
        const next = p + dt * SPEED;
        if (next >= 1) {
          setStepIdx((i) => {
            if (i + 1 >= STEPS.length) {
              setPlaying(false);
              return i;
            }
            return i + 1;
          });
          return 0;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  function nextStep() {
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
    setProgress(0);
  }
  function prevStep() {
    setStepIdx((i) => Math.max(0, i - 1));
    setProgress(0);
  }
  function reset() {
    setStepIdx(0);
    setProgress(0);
    setPlaying(false);
  }

  const reservedEdges = useMemo(
    () => (step.reservedPath ? pathToEdges(step.reservedPath) : []),
    [step],
  );

  // Beregn alle pakke-posisjoner for nåværende step+progress
  const packets = useMemo(() => {
    return step.flows.map((flow, idx) => {
      const t = (flow.offset + progress * flow.laps) % 1;
      const pos = packetPosition(flow.path, t);
      // Sjekk om pakken er på et drop-segment og har passert midten av det
      let dropped = false;
      if (flow.dropAtSegment !== undefined) {
        const segments = flow.path.length - 1;
        const segIdx = Math.min(Math.floor(t * segments), segments - 1);
        if (segIdx === flow.dropAtSegment) {
          const segT = t * segments - segIdx;
          if (segT > 0.45) dropped = true;
        }
      }
      // Pakker som har «droppet ut» (segT > 0.5 etter drop) skal forsvinne
      if (dropped && flow.dropAtSegment !== undefined) {
        const segments = flow.path.length - 1;
        const segT = t * segments - flow.dropAtSegment;
        if (segT > 0.6) return null;
      }
      return { ...pos, source: flow.source, dropped, key: idx };
    });
  }, [step, progress]);

  // Kø-størrelse vokser over tid i steg 4
  const queueSize = useMemo(() => {
    if (!step.queueAt || step.queueMax === undefined) return 0;
    // Vokser fra 0 til queueMax over progress 0..0.8, så holder seg
    return Math.min(step.queueMax, Math.floor(progress * step.queueMax * 1.3));
  }, [step, progress]);

  const queueNode = step.queueAt ? NODES.find((n) => n.id === step.queueAt) : null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">{step.title}</span>
        <span className="ml-auto font-mono">
          Steg {stepIdx + 1} / {STEPS.length}
        </span>
      </div>

      <svg viewBox="0 0 780 280" className="w-full h-auto bg-muted/10">
        {/* Edges */}
        {EDGES.map(([a, b], i) => {
          const na = NODES.find((n) => n.id === a)!;
          const nb = NODES.find((n) => n.id === b)!;
          const isReserved = reservedEdges.some(
            ([x, y]) => (x === a && y === b) || (x === b && y === a),
          );
          if (step.mode === "krets") {
            if (isReserved) {
              return (
                <line
                  key={i}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  className="stroke-brand"
                  strokeWidth={3.5}
                />
              );
            }
            // I krets-modus: ikke-reserverte lenker blekes ut ekstra
            return (
              <line
                key={i}
                x1={na.x}
                y1={na.y}
                x2={nb.x}
                y2={nb.y}
                className="stroke-muted-foreground/15"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            );
          }
          // pakke-modus: alle lenker er åpne
          return (
            <line
              key={i}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              className="stroke-foreground/40"
              strokeWidth={1.5}
            />
          );
        })}

        {/* «Stengt»-skilt på ikke-reserverte lenker i krets-modus (kun steg 1-2) */}
        {step.mode === "krets" && (
          <g>
            <text
              x={760}
              y={20}
              textAnchor="end"
              className="fill-muted-foreground text-[9px] italic"
            >
              Stiplede lenker = stengt for andre
            </text>
          </g>
        )}

        {/* Nodes */}
        {NODES.map((n) => (
          <NodeShape key={n.id} node={n} />
        ))}

        {/* Køen ved R1 i siste steg */}
        {queueNode && step.queueMax !== undefined && (
          <g>
            {Array.from({ length: step.queueMax }).map((_, i) => {
              const filled = i < queueSize;
              return (
                <rect
                  key={i}
                  x={queueNode.x - 30 + i * 7}
                  y={queueNode.y - 38}
                  width={5}
                  height={8}
                  rx={1}
                  className={
                    filled
                      ? "fill-destructive stroke-destructive"
                      : "fill-muted-foreground/10 stroke-muted-foreground/30"
                  }
                  strokeWidth={0.8}
                />
              );
            })}
            <text
              x={queueNode.x}
              y={queueNode.y - 45}
              textAnchor="middle"
              className="fill-destructive text-[9px] font-semibold"
            >
              kø: {queueSize}/{step.queueMax}
            </text>
          </g>
        )}

        {/* Pakker */}
        {packets.map((p) => {
          if (!p) return null;
          if (p.dropped) {
            return (
              <g key={p.key}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={9}
                  className="fill-destructive/20 stroke-destructive"
                  strokeWidth={2}
                />
                <line
                  x1={p.x - 5}
                  y1={p.y - 5}
                  x2={p.x + 5}
                  y2={p.y + 5}
                  className="stroke-destructive"
                  strokeWidth={2}
                />
                <line
                  x1={p.x - 5}
                  y1={p.y + 5}
                  x2={p.x + 5}
                  y2={p.y - 5}
                  className="stroke-destructive"
                  strokeWidth={2}
                />
              </g>
            );
          }
          return (
            <g key={p.key}>
              <circle
                cx={p.x}
                cy={p.y}
                r={8}
                className={`${COLOR_CLASS[p.source]} stroke-background`}
                strokeWidth={1.5}
              />
              <text
                x={p.x}
                y={p.y + 3}
                textAnchor="middle"
                className="fill-background text-[8px] font-bold pointer-events-none"
              >
                {p.source}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="px-4 py-3 text-sm text-muted-foreground border-t border-border">
        {step.description}
      </div>

      {/* Controls */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-1.5 border-t border-border bg-muted/20">
        <button
          onClick={prevStep}
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
          {playing
            ? "Pause"
            : stepIdx === STEPS.length - 1 && progress >= 0.99
              ? "Spill av igjen"
              : "Spill av"}
        </button>
        <button
          onClick={nextStep}
          disabled={stepIdx === STEPS.length - 1}
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

        {/* Steg-prikker */}
        <div className="ml-2 flex gap-1">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setStepIdx(i);
                setProgress(0);
              }}
              className={`h-1.5 w-4 rounded-full ${
                i === stepIdx ? "bg-brand" : i < stepIdx ? "bg-brand/40" : "bg-muted-foreground/20"
              }`}
              aria-label={`Gå til steg ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <LegendDot source="A" /> Kilde A
        <LegendDot source="B" /> Kilde B
        <LegendDot source="C" /> Kilde C
        <span className="inline-block w-2 h-2 rounded-full bg-destructive ml-2" /> Tapt pakke
        <span className="inline-block h-[3px] w-5 bg-brand rounded-sm ml-2" /> Reservert sti (krets)
      </div>
    </div>
  );
}

function NodeShape({ node }: { node: Node }) {
  if (node.kind === "host") {
    const strokeClass = node.source ? STROKE_CLASS[node.source] : "stroke-foreground/60";
    const fillClass = node.source ? COLOR_CLASS[node.source] : "fill-foreground";
    return (
      <g>
        <rect
          x={node.x - 16}
          y={node.y - 14}
          width={32}
          height={28}
          rx={4}
          className={`fill-card ${strokeClass}`}
          strokeWidth={2}
        />
        <text
          x={node.x}
          y={node.y + 4}
          textAnchor="middle"
          className={`${fillClass.replace("fill-", "fill-")} text-[12px] font-bold`}
        >
          {node.label}
        </text>
        {node.sublabel && (
          <text
            x={node.x}
            y={node.y + 28}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {node.sublabel}
          </text>
        )}
      </g>
    );
  }
  // Router
  return (
    <g>
      <circle
        cx={node.x}
        cy={node.y}
        r={15}
        className="fill-card stroke-foreground/60"
        strokeWidth={2}
      />
      <text
        x={node.x}
        y={node.y + 4}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-bold"
      >
        {node.label}
      </text>
    </g>
  );
}

function LegendDot({ source }: { source: Source }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${BG_CLASS[source]}`} />;
}

function nodeById(id: NodeId): Node {
  return NODES.find((n) => n.id === id)!;
}

function pathToEdges(path: NodeId[]): [NodeId, NodeId][] {
  const out: [NodeId, NodeId][] = [];
  for (let i = 0; i < path.length - 1; i++) out.push([path[i], path[i + 1]]);
  return out;
}

function packetPosition(path: NodeId[], progress: number): { x: number; y: number } {
  if (path.length < 2) {
    const a = nodeById(path[0]);
    return { x: a.x, y: a.y };
  }
  const segments = path.length - 1;
  const t = Math.min(progress, 0.9999) * segments;
  const segIdx = Math.floor(t);
  const segT = t - segIdx;
  const a = nodeById(path[segIdx]);
  const b = nodeById(path[segIdx + 1]);
  return {
    x: a.x + (b.x - a.x) * segT,
    y: a.y + (b.y - a.y) * segT,
  };
}
