import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
  useReactFlow,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";

// Levende versjon av seksjon 1.2 — Edge & core, bygget på @xyflow/react.
//
// Pedagogisk idé: Internett er delt i to lag:
//   - EDGE  = kant-noder (hosts: laptops, mobiler, servere)
//   - CORE  = et nett av rutere som flytter pakker mellom edge-noder
//   - ACCESS = aksess-ruteren som kobler en edge-host til nærmeste core-ruter
//
// 11 steg viser fire scenarier som alle deler de samme core-ruterne, men
// ender opp med ulike pakke-stier — inklusiv hva som skjer hvis K3 faller ut.
//
// xyflow gir gratis drag/zoom/minimap. Pakke-overlay holder seg synkronisert
// med node-posisjoner og viewport (zoom/pan).

type NodeKind = "laptop" | "phone" | "server" | "access" | "core";

type NodeData = {
  label: string;
  sublabel?: string;
  kind: NodeKind;
  active?: boolean;
  down?: boolean;
};

type StepColor = "blue" | "amber" | "purple" | "red";

const COLOR_HEX: Record<StepColor, string> = {
  blue: "#3b82f6",
  amber: "#f59e0b",
  purple: "#a855f7",
  red: "#ef4444",
};
const COLOR_LABEL: Record<StepColor, string> = {
  blue: "A→X",
  amber: "B→Y",
  purple: "A→B",
  red: "omvei",
};
const BG_CLASS: Record<StepColor, string> = {
  blue: "bg-brand",
  amber: "bg-amber-500",
  purple: "bg-purple-500",
  red: "bg-destructive",
};

// ---------- Custom node ----------

function NetNode({ data }: NodeProps) {
  const d = data as NodeData;
  const ringColor = d.down
    ? "ring-red-500"
    : d.active
      ? "ring-blue-500"
      : "ring-transparent";
  const bg =
    d.kind === "laptop"
      ? "bg-amber-500/10 border-amber-500"
      : d.kind === "phone"
        ? "bg-purple-500/10 border-purple-500"
        : d.kind === "server"
          ? "bg-emerald-500/10 border-emerald-500"
          : d.kind === "access"
            ? "bg-slate-500/10 border-slate-400"
            : "bg-brand/10 border-brand";
  const icon =
    d.kind === "laptop"
      ? "💻"
      : d.kind === "phone"
        ? "📱"
        : d.kind === "server"
          ? "🖥"
          : d.kind === "access"
            ? "AP"
            : d.label;
  return (
    <div
      className={`rounded-lg border-2 px-2.5 py-1.5 text-center shadow-sm ring-2 ring-offset-1 ${ringColor} ${bg} ${
        d.down ? "opacity-50" : ""
      }`}
      style={{ minWidth: 70 }}
    >
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
      {d.kind === "core" ? (
        <div className="text-sm font-bold leading-none py-1">{d.label}</div>
      ) : (
        <>
          <div className="text-base leading-none">{icon}</div>
          <div className="text-[11px] font-semibold mt-0.5">{d.label}</div>
        </>
      )}
      {d.sublabel && d.kind !== "core" && (
        <div className="text-[9px] text-muted-foreground leading-tight">{d.sublabel}</div>
      )}
      {d.down && (
        <div className="text-[9px] text-red-500 font-bold leading-none mt-0.5">NEDE</div>
      )}
    </div>
  );
}

const nodeTypes = { net: NetNode };

// ---------- Initial nodes + edges ----------

const INIT_NODES: Node<NodeData>[] = [
  // Venstre edge
  { id: "laptopA", type: "net", position: { x: 0, y: 30 }, data: { label: "Laptop A", sublabel: "Trine, Tromsø", kind: "laptop" } },
  { id: "mobilB", type: "net", position: { x: 0, y: 220 }, data: { label: "Mobil B", sublabel: "Jonas, Bergen", kind: "phone" } },
  // Aksess venstre
  { id: "accA", type: "net", position: { x: 140, y: 40 }, data: { label: "Aksess", sublabel: "fiber", kind: "access" } },
  { id: "accB", type: "net", position: { x: 140, y: 230 }, data: { label: "Aksess", sublabel: "4G", kind: "access" } },
  // Core
  { id: "c1", type: "net", position: { x: 280, y: 40 }, data: { label: "K1", kind: "core" } },
  { id: "c2", type: "net", position: { x: 280, y: 230 }, data: { label: "K2", kind: "core" } },
  { id: "c3", type: "net", position: { x: 410, y: 135 }, data: { label: "K3", kind: "core" } },
  { id: "c4", type: "net", position: { x: 540, y: 40 }, data: { label: "K4", kind: "core" } },
  { id: "c5", type: "net", position: { x: 540, y: 230 }, data: { label: "K5", kind: "core" } },
  // Aksess høyre
  { id: "accX", type: "net", position: { x: 680, y: 40 }, data: { label: "Aksess", sublabel: "datasenter", kind: "access" } },
  { id: "accY", type: "net", position: { x: 680, y: 230 }, data: { label: "Aksess", sublabel: "datasenter", kind: "access" } },
  // Høyre edge
  { id: "serverX", type: "net", position: { x: 820, y: 30 }, data: { label: "Server X", sublabel: "video-tjeneste", kind: "server" } },
  { id: "serverY", type: "net", position: { x: 820, y: 220 }, data: { label: "Server Y", sublabel: "spill-tjeneste", kind: "server" } },
];

type EdgePair = [string, string];

const EDGE_PAIRS: EdgePair[] = [
  ["laptopA", "accA"],
  ["mobilB", "accB"],
  ["serverX", "accX"],
  ["serverY", "accY"],
  ["accA", "c1"],
  ["accB", "c2"],
  ["accX", "c4"],
  ["accY", "c5"],
  ["c1", "c2"],
  ["c1", "c3"],
  ["c2", "c3"],
  ["c3", "c4"],
  ["c3", "c5"],
  ["c4", "c5"],
  ["c1", "c4"],
  ["c2", "c5"],
];

const BASE_EDGES: Edge[] = EDGE_PAIRS.map(([a, b], i) => ({
  id: `e${i}`,
  source: a,
  target: b,
  style: { stroke: "rgb(156 163 175 / 0.45)", strokeWidth: 1.5 },
}));

// ---------- Steps ----------

type Step = {
  title: string;
  description: string;
  path: string[];
  downNodes?: string[];
  color: StepColor;
};

const STEPS: Step[] = [
  // ---------- Scenario 1: Laptop A → Server X (5 steg) ----------
  {
    title: "1. Laptop A sender pakken til sin gateway",
    description:
      "Trines laptop har bare ett valg: send pakken til default gateway (aksess-ruteren). Den vet ingenting om internett-topologien — den stoler på at gatewayen tar over resten. Pakken har destinasjon = Server X sin IP-adresse.",
    path: ["laptopA", "accA"],
    color: "blue",
  },
  {
    title: "2. Aksess-ruteren slår opp i forwarding-tabellen",
    description:
      "Aksess-ruteren ser destinasjons-IP i pakken og slår opp i sin forwarding-tabell: «mot 195.x.x.x → send ut på lenke til K1». Tabellen er fylt på forhånd av OSPF/BGP. Pakken videresendes til K1.",
    path: ["accA", "c1"],
    color: "blue",
  },
  {
    title: "3. K1 ruter pakken videre mot K4",
    description:
      "K1 gjør samme oppslag: destinasjons-IP matcher Server X. Tabellen sier: «korteste vei dit går via K4». K1 setter pakken på output-køen til K4 og sender den ut.",
    path: ["c1", "c4"],
    color: "blue",
  },
  {
    title: "4. K4 leverer til aksess-ruteren, som sender til Server X",
    description:
      "K4 ser at neste hop ligger lokalt — sender til accX. AccX gjør link-layer-bytte (Ethernet med MAC-adresser) og leverer endelig til Server X. Hele forwardingen tok 5 hops på kanskje 30 ms.",
    path: ["c4", "accX", "serverX"],
    color: "blue",
  },
  {
    title: "5. Server X svarer — pakken tar samme vei tilbake",
    description:
      "Svaret følger samme rute speilvendt. Internett bruker hop-by-hop forwarding — hver ruter tar sin egen beslutning basert på destinasjons-IP, så returveien er ikke garantert lik. I praksis er den ofte symmetrisk når topologien er enkel.",
    path: ["serverX", "accX", "c4", "c1", "accA", "laptopA"],
    color: "blue",
  },

  // ---------- Scenario 2: Mobil B → Server Y (parallell trafikk) ----------
  {
    title: "6. Mobil B til Server Y — samme core, andre lenker",
    description:
      "Jonas i Bergen åpner et spill. Mobilen treffer en helt annen aksess-ruter (4G) og bruker en annen rute gjennom core (K2 → K5). Likevel deler de fysisk samme core-nett — bare ulike lenker er aktive samtidig. Slik skaleres internett: én core, mange parallelle pakkestrømmer.",
    path: ["mobilB", "accB", "c2", "c5", "accY", "serverY"],
    color: "amber",
  },

  // ---------- Scenario 3: Edge-til-edge på samme side ----------
  {
    title: "7. Laptop A sender melding til Mobil B",
    description:
      "Selv om begge er på «venstre side» av tegningen, finnes det ingen direkte kabel mellom dem. Pakken må inn i core. Forwarding-tabellen i K1 sier nå: «mot mobilB → via K3 → K2». K3 er den kortest stien gjennom mesh-en.",
    path: ["laptopA", "accA", "c1", "c3", "c2", "accB", "mobilB"],
    color: "purple",
  },

  // ---------- Scenario 4: K3 faller ut — OSPF-konvergens ----------
  {
    title: "8. K3 faller ut (strømbrudd)",
    description:
      "Plutselig mister K3 strømmen. Naboene K1, K2, K4, K5 har sendt periodiske «Hello»-pakker (hvert 10. sek i OSPF) — nå slutter K3 å svare. Innen 30–40 sekunder erklærer naboene at K3 er nede.",
    path: ["c1", "c3"],
    downNodes: ["c3"],
    color: "red",
  },
  {
    title: "9. LSA-flooding: K1 forteller resten av core",
    description:
      "Når K1 oppdager at K3 er nede, lager den en Link State Advertisement og flooder den til alle naboer (K2, K4). De flooder videre. På sekunder vet hele core at lenkene K1–K3, K2–K3, K4–K3, K5–K3 er borte.",
    path: ["c1", "c2", "c5"],
    downNodes: ["c3"],
    color: "purple",
  },
  {
    title: "10. Dijkstra: hver ruter regner ut nye korteste stier",
    description:
      "Med oppdatert topologi-kart kjører hver core-ruter Dijkstras algoritme i sitt eget hode og bygger en ny forwarding-tabell. For trafikk fra K1 mot K2 er den nye stien nå K1 → K4 → K5 → K2. Konvergens tar typisk 1–10 sekunder i en moderne OSPF-domene.",
    path: ["c1", "c4", "c5", "c2"],
    downNodes: ["c3"],
    color: "purple",
  },
  {
    title: "11. Ny pakke fra Laptop A til Server Y går rundt K3",
    description:
      "Trine sender en ny pakke — denne gangen mot Server Y (som tilfeldigvis er på samme side som Server X). Med oppdaterte forwarding-tabeller går pakken K1 → K4 → K5. Det er styrken til mesh-core: flere veier, og når én forsvinner finner protokollene en ny innen sekunder.",
    path: ["laptopA", "accA", "c1", "c4", "c5", "accY", "serverY"],
    downNodes: ["c3"],
    color: "red",
  },
];

// ---------- Hovedkomponent ----------

function FlowInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INIT_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(BASE_EDGES);
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const rf = useReactFlow();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const step = STEPS[stepIdx];
  const stepColor = COLOR_HEX[step.color];

  // Auto-fit ved første render
  useEffect(() => {
    const t = setTimeout(() => {
      rf.fitView({ padding: 0.15, duration: 0 });
    }, 60);
    return () => clearTimeout(t);
  }, [rf]);

  // Marker active path-edges og down-noder
  useEffect(() => {
    const downSet = new Set(step.downNodes ?? []);
    setEdges((eds) =>
      eds.map((e) => {
        const inPath = step.path.some(
          (_, i) =>
            i < step.path.length - 1 &&
            ((e.source === step.path[i] && e.target === step.path[i + 1]) ||
              (e.source === step.path[i + 1] && e.target === step.path[i])),
        );
        const touchesDown = downSet.has(e.source) || downSet.has(e.target);
        return {
          ...e,
          animated: inPath && !touchesDown,
          style: {
            stroke: inPath
              ? stepColor
              : touchesDown
                ? "rgb(239 68 68 / 0.35)"
                : "rgb(156 163 175 / 0.45)",
            strokeWidth: inPath ? 2.5 : 1.5,
            strokeDasharray: touchesDown && !inPath ? "4 3" : undefined,
          },
        };
      }),
    );
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          active: step.path.includes(n.id),
          down: downSet.has(n.id),
        },
      })),
    );
  }, [stepIdx, setEdges, setNodes, stepColor, step.downNodes, step.path]);

  // Animasjons-loop
  useEffect(() => {
    if (!playing) return;
    const start = performance.now();
    const DUR = Math.max(1500, step.path.length * 600);
    const loop = (now: number) => {
      const p = Math.min(1, (now - start) / DUR);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        if (stepIdx + 1 < STEPS.length) {
          setTimeout(() => {
            setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
            setProgress(0);
          }, 350);
        } else {
          setPlaying(false);
        }
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, stepIdx, step.path.length]);

  // Pakke-posisjon i flow-koordinater (oppdateres ved drag)
  const packetFlowPos = useMemo(() => {
    if (step.path.length < 2) return null;
    const segments = step.path.length - 1;
    const t = Math.min(progress, 0.999) * segments;
    const segIdx = Math.floor(t);
    const segT = t - segIdx;
    const a = nodes.find((n) => n.id === step.path[segIdx]);
    const b = nodes.find((n) => n.id === step.path[segIdx + 1]);
    if (!a || !b) return null;
    // anker: senter av node (omtrent 78x48)
    const w = 78;
    const h = 48;
    const ax = a.position.x + w / 2;
    const ay = a.position.y + h / 2;
    const bx = b.position.x + w / 2;
    const by = b.position.y + h / 2;
    return {
      x: ax + (bx - ax) * segT,
      y: ay + (by - ay) * segT,
    };
  }, [nodes, step.path, progress]);

  const resetAll = () => {
    setNodes(INIT_NODES);
    setStepIdx(0);
    setProgress(0);
    setPlaying(false);
    setTimeout(() => rf.fitView({ padding: 0.15, duration: 200 }), 60);
  };

  const nextStep = () => {
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
    setProgress(0);
  };
  const prevStep = () => {
    setStepIdx((i) => Math.max(0, i - 1));
    setProgress(0);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">{step.title}</span>
        <span className="ml-auto font-mono">
          Steg {stepIdx + 1} / {STEPS.length}
        </span>
      </div>

      <div ref={containerRef} style={{ height: 420 }} className="relative bg-muted/10">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          proOptions={{ hideAttribution: true }}
          nodesConnectable={false}
          minZoom={0.3}
          maxZoom={2}
        >
          <Background gap={20} size={1} color="rgb(0 0 0 / 0.05)" />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(n) => {
              const d = n.data as NodeData;
              if (d.down) return "#ef4444";
              if (d.kind === "core") return "#94a3b8";
              if (d.kind === "laptop") return "#f59e0b";
              if (d.kind === "phone") return "#a855f7";
              if (d.kind === "server") return "#10b981";
              return "#cbd5e1";
            }}
            pannable
            zoomable
            position="bottom-right"
          />
        </ReactFlow>

        {/* Pakke-overlay (viewport-aware) */}
        {packetFlowPos && progress > 0 && progress < 1 && (
          <PacketOverlay
            x={packetFlowPos.x}
            y={packetFlowPos.y}
            color={stepColor}
            label={COLOR_LABEL[step.color]}
          />
        )}
      </div>

      <div className="px-4 py-3 text-sm text-muted-foreground border-t border-border">
        {step.description}
      </div>

      {/* Kontroller */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-1.5 border-t border-border bg-muted/20">
        <button
          onClick={prevStep}
          disabled={stepIdx === 0}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
        >
          <SkipBack className="h-3 w-3" /> Forrige
        </button>
        <button
          onClick={() => {
            if (playing) {
              setPlaying(false);
            } else {
              if (progress >= 1) setProgress(0);
              setPlaying(true);
            }
          }}
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
          onClick={resetAll}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 ml-auto"
          title="Reset alt — også flyttede noder"
        >
          <RotateCcw className="h-3 w-3" />
        </button>

        {/* Steg-prikker */}
        <div className="ml-2 flex gap-1 flex-wrap">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setStepIdx(i);
                setProgress(0);
              }}
              className={`h-1.5 w-4 rounded-full ${
                i === stepIdx
                  ? "bg-brand"
                  : i < stepIdx
                    ? "bg-brand/40"
                    : "bg-muted-foreground/20"
              }`}
              aria-label={`Gå til steg ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <LegendDot color="blue" /> Laptop A → Server X
        <LegendDot color="amber" /> Mobil B → Server Y
        <LegendDot color="purple" /> Laptop A → Mobil B
        <LegendDot color="red" /> Omvei rundt nedet K3
        <span className="ml-auto">K = core-ruter · dra noder · scroll for zoom</span>
      </div>
    </div>
  );
}

// SVG/HTML-overlay som rendrer pakken i skjerm-koordinater, beregnet fra
// flow-posisjon × viewport (polling holder det smooth under zoom/pan).
function PacketOverlay({
  x,
  y,
  color,
  label,
}: {
  x: number;
  y: number;
  color: string;
  label: string;
}) {
  const rf = useReactFlow();
  const [vp, setVp] = useState(rf.getViewport());

  useEffect(() => {
    const interval = setInterval(() => {
      const v = rf.getViewport();
      setVp((prev) =>
        prev.x !== v.x || prev.y !== v.y || prev.zoom !== v.zoom ? v : prev,
      );
    }, 33);
    return () => clearInterval(interval);
  }, [rf]);

  const screenX = x * vp.zoom + vp.x;
  const screenY = y * vp.zoom + vp.y;
  const size = Math.max(16, 22 * vp.zoom);
  const style: CSSProperties = {
    position: "absolute",
    left: screenX,
    top: screenY,
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
    zIndex: 10,
  };
  return (
    <div style={style}>
      <div
        style={{
          width: size,
          height: size,
          background: color,
          borderRadius: "50%",
          border: `${Math.max(1.5, 2 * vp.zoom)}px solid white`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          color: "white",
          fontSize: `${Math.max(8, 9 * vp.zoom)}px`,
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function LegendDot({ color }: { color: StepColor }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${BG_CLASS[color]}`} />;
}

export function Section12Live() {
  return (
    <ReactFlowProvider>
      <FlowInner />
    </ReactFlowProvider>
  );
}
