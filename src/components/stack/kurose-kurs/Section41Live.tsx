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

// Section41Live — fullskala interaktiv visualisering av en ruters indre.
//
// Pedagogisk idé (Kurose 4.1):
//   - Forwarding (data-plane)  = per-pakke beslutning: «hvor sender jeg denne?»
//   - Routing  (control-plane) = beregn forwarding-tabellen: «hvilken sti er best?»
//
// Bruker vandrer gjennom 9 steg og ser:
//   1) En pakke ankommer på input-port 1
//   2) Header-fields ekstraheres (destinasjons-IP)
//   3) Longest-prefix-match i forwarding-tabellen
//   4) Switching-fabric overfører pakken
//   5) Output-port-kø
//   6) Pakken forlater på utgående lenke
//   7) Control-plane: routing-protokoll lytter til naboer
//   8) Dijkstra-kjøring (lokalt RIB → FIB)
//   9) Forwarding-tabellen oppdateres — pilen ned i input-portens lookup

type NodeKind =
  | "incoming"
  | "outgoing"
  | "inputPort"
  | "outputPort"
  | "fabric"
  | "fwdTable"
  | "routingProc"
  | "controlPlane"
  | "neighbor"
  | "lpm"
  | "queue";

type NodeData = {
  label: string;
  sublabel?: string;
  kind: NodeKind;
  active?: boolean;
  highlight?: boolean;
};

type StepColor = "blue" | "amber" | "purple" | "green";

const COLOR_HEX: Record<StepColor, string> = {
  blue: "#3b82f6", // data-plane forwarding
  amber: "#f59e0b", // switching
  purple: "#a855f7", // control-plane / routing
  green: "#10b981", // table-update
};

const COLOR_LABEL: Record<StepColor, string> = {
  blue: "PKT",
  amber: "PKT",
  purple: "LSA",
  green: "FIB",
};

const BG_CLASS: Record<StepColor, string> = {
  blue: "bg-brand",
  amber: "bg-amber-500",
  purple: "bg-purple-500",
  green: "bg-emerald-500",
};

// ---------- Custom node ----------

function RouterNode({ data }: NodeProps) {
  const d = data as NodeData;
  const ring = d.active ? "ring-blue-500" : d.highlight ? "ring-amber-500" : "ring-transparent";

  if (d.kind === "incoming" || d.kind === "outgoing") {
    const arrow = d.kind === "incoming" ? "→" : "→";
    return (
      <div
        className={`rounded-lg border-2 px-2 py-1.5 text-center shadow-sm ring-2 ring-offset-1 ${ring} bg-slate-500/10 border-slate-400`}
        style={{ minWidth: 80 }}
      >
        <Handle type="target" position={Position.Left} className="!bg-transparent !border-0" />
        <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">
          {d.kind === "incoming" ? "Inn-lenke" : "Ut-lenke"} {arrow}
        </div>
        <div className="text-xs font-semibold mt-0.5">{d.label}</div>
        {d.sublabel && (
          <div className="text-[9px] text-muted-foreground leading-tight">{d.sublabel}</div>
        )}
      </div>
    );
  }

  if (d.kind === "inputPort" || d.kind === "outputPort") {
    const c = d.kind === "inputPort" ? "border-blue-400 bg-blue-500/10" : "border-emerald-400 bg-emerald-500/10";
    return (
      <div
        className={`rounded-lg border-2 px-2 py-1.5 text-center shadow-sm ring-2 ring-offset-1 ${ring} ${c}`}
        style={{ minWidth: 90 }}
      >
        <Handle type="target" position={Position.Left} className="!bg-transparent !border-0" />
        <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">
          {d.kind === "inputPort" ? "Input-port" : "Output-port"}
        </div>
        <div className="text-xs font-semibold mt-0.5">{d.label}</div>
        {d.sublabel && (
          <div className="text-[9px] text-muted-foreground leading-tight">{d.sublabel}</div>
        )}
      </div>
    );
  }

  if (d.kind === "fabric") {
    return (
      <div
        className={`rounded-lg border-2 px-3 py-2 text-center shadow-sm ring-2 ring-offset-1 ${ring} bg-amber-500/10 border-amber-500`}
        style={{ minWidth: 130 }}
      >
        <Handle type="target" position={Position.Left} className="!bg-transparent !border-0" />
        <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
        <Handle id="top" type="target" position={Position.Top} className="!bg-transparent !border-0" />
        <Handle id="bottom" type="source" position={Position.Bottom} className="!bg-transparent !border-0" />
        <div className="text-xs font-bold leading-none">⇄ Switching</div>
        <div className="text-xs font-bold leading-none mt-0.5">fabric</div>
        {d.sublabel && (
          <div className="text-[9px] text-muted-foreground leading-tight mt-1">{d.sublabel}</div>
        )}
      </div>
    );
  }

  if (d.kind === "fwdTable") {
    return (
      <div
        className={`rounded-lg border-2 px-2 py-1.5 shadow-sm ring-2 ring-offset-1 ${ring} bg-slate-500/10 border-slate-500`}
        style={{ minWidth: 170 }}
      >
        <Handle type="target" position={Position.Top} className="!bg-transparent !border-0" />
        <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0" />
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none text-center">
          Forwarding-tabell (FIB)
        </div>
        <table className="mt-1 w-full text-[9px] font-mono">
          <tbody>
            <tr className="border-b border-border/60">
              <td className="pr-1 text-muted-foreground">0.0.0.0/0</td>
              <td className="text-right">→ P3</td>
            </tr>
            <tr className="border-b border-border/60">
              <td className="pr-1 text-muted-foreground">10.0.0.0/8</td>
              <td className="text-right">→ P2</td>
            </tr>
            <tr className="border-b border-border/60">
              <td className="pr-1 text-muted-foreground">10.1.0.0/16</td>
              <td className="text-right">→ P3</td>
            </tr>
            <tr className={d.highlight ? "bg-blue-500/20 font-bold" : ""}>
              <td className="pr-1 text-muted-foreground">10.1.2.0/24</td>
              <td className="text-right">→ P4</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (d.kind === "lpm") {
    return (
      <div
        className={`rounded-lg border-2 border-dashed px-2 py-1 text-center shadow-sm ${ring} bg-purple-500/5 border-purple-400`}
        style={{ minWidth: 110 }}
      >
        <Handle type="target" position={Position.Top} className="!bg-transparent !border-0" />
        <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0" />
        <div className="text-[10px] font-bold text-purple-700 dark:text-purple-300 leading-none">
          LPM lookup
        </div>
        <div className="text-[9px] text-muted-foreground leading-tight mt-0.5">
          Longest Prefix Match
        </div>
      </div>
    );
  }

  if (d.kind === "queue") {
    return (
      <div
        className={`rounded-lg border-2 px-2 py-1 text-center shadow-sm ring-2 ring-offset-1 ${ring} bg-emerald-500/5 border-emerald-400`}
        style={{ minWidth: 80 }}
      >
        <Handle type="target" position={Position.Left} className="!bg-transparent !border-0" />
        <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">
          Output-kø
        </div>
        <div className="text-xs font-mono mt-0.5">▢▢▢▢</div>
      </div>
    );
  }

  if (d.kind === "routingProc") {
    return (
      <div
        className={`rounded-lg border-2 px-2 py-1.5 text-center shadow-sm ring-2 ring-offset-1 ${ring} bg-purple-500/10 border-purple-500`}
        style={{ minWidth: 140 }}
      >
        <Handle type="target" position={Position.Top} className="!bg-transparent !border-0" />
        <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0" />
        <Handle id="left" type="target" position={Position.Left} className="!bg-transparent !border-0" />
        <Handle id="right" type="source" position={Position.Right} className="!bg-transparent !border-0" />
        <div className="text-[10px] uppercase tracking-wider text-purple-700 dark:text-purple-300 leading-none">
          Routing-prosessor
        </div>
        <div className="text-xs font-bold mt-0.5">{d.label}</div>
        {d.sublabel && (
          <div className="text-[9px] text-muted-foreground leading-tight">{d.sublabel}</div>
        )}
      </div>
    );
  }

  if (d.kind === "controlPlane") {
    // bare en label-boks for å markere control-plane-regionen
    return (
      <div
        className="rounded px-2 py-1 text-[10px] uppercase tracking-wider font-bold text-purple-700 dark:text-purple-300 border border-dashed border-purple-400 bg-purple-500/5"
        style={{ minWidth: 130 }}
      >
        {d.label}
      </div>
    );
  }

  if (d.kind === "neighbor") {
    return (
      <div
        className={`rounded-lg border-2 px-2 py-1.5 text-center shadow-sm ring-2 ring-offset-1 ${ring} bg-purple-500/5 border-purple-400`}
        style={{ minWidth: 80 }}
      >
        <Handle type="target" position={Position.Right} className="!bg-transparent !border-0" />
        <Handle type="source" position={Position.Left} className="!bg-transparent !border-0" />
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">
          Nabo-ruter
        </div>
        <div className="text-xs font-semibold mt-0.5">{d.label}</div>
      </div>
    );
  }

  return null;
}

const nodeTypes = { router: RouterNode };

// ---------- Layout ----------
//
// Data-plane radene ligger horisontalt øverst. Control-plane (routing-prosessor +
// LSA-piler fra naboer) ligger separat over fabric-en, og pilen NED til
// forwarding-tabellen viser at control-plane *skriver* tabellen som data-plane *leser*.

const INIT_NODES: Node<NodeData>[] = [
  // --- Inn-lenker (utenfor ruteren, til venstre) ---
  { id: "in1", type: "router", position: { x: 0, y: 120 }, data: { label: "Lenke 1", sublabel: "fra ISP-A", kind: "incoming" } },
  { id: "in2", type: "router", position: { x: 0, y: 200 }, data: { label: "Lenke 2", sublabel: "fra LAN", kind: "incoming" } },

  // --- Input-porter ---
  { id: "p1", type: "router", position: { x: 130, y: 115 }, data: { label: "P1", sublabel: "10 Gbit/s", kind: "inputPort" } },
  { id: "p2", type: "router", position: { x: 130, y: 195 }, data: { label: "P2", sublabel: "10 Gbit/s", kind: "inputPort" } },

  // --- Switching fabric ---
  { id: "fabric", type: "router", position: { x: 320, y: 150 }, data: { label: "fabric", sublabel: "crossbar", kind: "fabric" } },

  // --- Output-porter + køer ---
  { id: "q3", type: "router", position: { x: 510, y: 115 }, data: { label: "Kø", kind: "queue" } },
  { id: "q4", type: "router", position: { x: 510, y: 195 }, data: { label: "Kø", kind: "queue" } },
  { id: "p3", type: "router", position: { x: 620, y: 115 }, data: { label: "P3", sublabel: "10 Gbit/s", kind: "outputPort" } },
  { id: "p4", type: "router", position: { x: 620, y: 195 }, data: { label: "P4", sublabel: "10 Gbit/s", kind: "outputPort" } },

  // --- Ut-lenker ---
  { id: "out3", type: "router", position: { x: 760, y: 120 }, data: { label: "Lenke 3", sublabel: "mot ISP-B", kind: "outgoing" } },
  { id: "out4", type: "router", position: { x: 760, y: 200 }, data: { label: "Lenke 4", sublabel: "mot 10.1.2.0/24", kind: "outgoing" } },

  // --- LPM-boks: knytter input-port-lookup til FIB (under p1/p2) ---
  { id: "lpm", type: "router", position: { x: 195, y: 320 }, data: { label: "LPM", kind: "lpm" } },

  // --- FIB: leses av input-portene via LPM ---
  { id: "fib", type: "router", position: { x: 165, y: 410 }, data: { label: "FIB", kind: "fwdTable" } },

  // --- Control-plane (over fabric) ---
  { id: "cpLabel", type: "router", position: { x: 340, y: 0 }, data: { label: "Control-plane", kind: "controlPlane" } },
  { id: "rproc", type: "router", position: { x: 320, y: 35 }, data: { label: "OSPF / BGP", sublabel: "Dijkstra · RIB", kind: "routingProc" } },

  // --- Nabo-rutere som sender LSA / route-advertisements ---
  { id: "nbA", type: "router", position: { x: 130, y: 35 }, data: { label: "R-A", kind: "neighbor" } },
  { id: "nbB", type: "router", position: { x: 530, y: 35 }, data: { label: "R-B", kind: "neighbor" } },
];

type EdgeSpec = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  kind: "data" | "control" | "fibwrite" | "lpm";
};

const EDGES_SPEC: EdgeSpec[] = [
  // Data-plane horizontal flow
  { id: "e-in1-p1", source: "in1", target: "p1", kind: "data" },
  { id: "e-in2-p2", source: "in2", target: "p2", kind: "data" },
  { id: "e-p1-fab", source: "p1", target: "fabric", kind: "data" },
  { id: "e-p2-fab", source: "p2", target: "fabric", kind: "data" },
  { id: "e-fab-q3", source: "fabric", target: "q3", kind: "data" },
  { id: "e-fab-q4", source: "fabric", target: "q4", kind: "data" },
  { id: "e-q3-p3", source: "q3", target: "p3", kind: "data" },
  { id: "e-q4-p4", source: "q4", target: "p4", kind: "data" },
  { id: "e-p3-out3", source: "p3", target: "out3", kind: "data" },
  { id: "e-p4-out4", source: "p4", target: "out4", kind: "data" },

  // LPM: input-portene slår opp i FIB via LPM
  { id: "e-p1-lpm", source: "p1", target: "lpm", kind: "lpm" },
  { id: "e-p2-lpm", source: "p2", target: "lpm", kind: "lpm" },
  { id: "e-lpm-fib", source: "lpm", target: "fib", kind: "lpm" },

  // Control-plane: naboer ↔ routing-prosessor
  { id: "e-nbA-rproc", source: "nbA", target: "rproc", sourceHandle: undefined, targetHandle: "left", kind: "control" },
  { id: "e-nbB-rproc", source: "rproc", target: "nbB", sourceHandle: "right", kind: "control" },

  // Routing-prosessor skriver FIB
  { id: "e-rproc-fib", source: "rproc", target: "fib", kind: "fibwrite" },
];

function edgeStyle(spec: EdgeSpec): Edge {
  const base: Edge = {
    id: spec.id,
    source: spec.source,
    target: spec.target,
    sourceHandle: spec.sourceHandle,
    targetHandle: spec.targetHandle,
    style: {
      stroke:
        spec.kind === "control"
          ? "rgb(168 85 247 / 0.45)"
          : spec.kind === "fibwrite"
            ? "rgb(16 185 129 / 0.45)"
            : spec.kind === "lpm"
              ? "rgb(100 116 139 / 0.35)"
              : "rgb(156 163 175 / 0.45)",
      strokeWidth: 1.5,
      strokeDasharray: spec.kind === "lpm" || spec.kind === "fibwrite" ? "5 4" : undefined,
    },
  };
  return base;
}

const BASE_EDGES: Edge[] = EDGES_SPEC.map(edgeStyle);

// ---------- Steps ----------

type Step = {
  title: string;
  description: string;
  path: string[];
  highlightNodes?: string[];
  highlightEdges?: string[]; // edge ids
  color: StepColor;
};

const STEPS: Step[] = [
  // ---------- Data-plane forwarding (5 steg) ----------
  {
    title: "1. Pakken ankommer på input-port P1",
    description:
      "En IP-pakke ankommer ruteren fra Lenke 1. Inn-lenken er fysisk koblet til input-port P1. Input-porten er der pakken kommer inn — den gjør fysisk-lag-mottak (decoder bits) og lenke-lag-mottak (sjekker Ethernet-ramme, henter ut IP-pakken). Destinasjons-IP i pakken er 10.1.2.55.",
    path: ["in1", "p1"],
    color: "blue",
  },
  {
    title: "2. Input-porten slår opp i forwarding-tabellen (LPM)",
    description:
      "Input-porten har sin egen kopi av forwarding-tabellen (FIB) — fordi lookup må skje i linjehastighet, kan ikke alle pakker reise til CPU først. Den finner Longest Prefix Match: 10.1.2.55 matcher både 0.0.0.0/0, 10.0.0.0/8, 10.1.0.0/16 og 10.1.2.0/24, men /24 er lengst — så pakken skal ut på P4.",
    path: ["p1", "lpm", "fib"],
    highlightNodes: ["fib"],
    color: "blue",
  },
  {
    title: "3. Switching-fabric overfører pakken fra input til output",
    description:
      "Med utgangsporten kjent (P4), legges pakken på switching-fabric-en og krysser ruteren fysisk. Fabric-typen avgjør hvor fort: minne (treigest), buss (delt — ett pakke om gangen), eller crossbar (parallelle stier — moderne høyhastighets-rutere). En crossbar kan i prinsippet flytte alle input-porter til alle output-porter samtidig.",
    path: ["p1", "fabric"],
    color: "amber",
  },
  {
    title: "4. Pakken legges i output-portens kø",
    description:
      "På output-siden venter pakken i en FIFO-kø. Hvis fabric leverer pakker fortere enn output-lenken kan sende dem ut, vokser køen. Hvis køen blir full mister vi pakker — dette er hovedkilden til pakketap i internett. Schedulere (FIFO, prioritert, RR, WFQ) bestemmer hvilken pakke som går ut nest.",
    path: ["fabric", "q4"],
    highlightNodes: ["q4"],
    color: "amber",
  },
  {
    title: "5. Pakken forlater ruteren på Lenke 4",
    description:
      "Output-porten plukker neste pakke fra køen, kjører lenke-lag-utgang (legger på Ethernet-header med neste hops MAC) og fysisk-lag-utgang (kodes til bits, sendes ut på lenken). Hele forwarding-syklusen — fra mottak til utsending — tar typisk under 10 mikrosekunder per pakke.",
    path: ["q4", "p4", "out4"],
    color: "blue",
  },

  // ---------- Control-plane (4 steg) ----------
  {
    title: "6. Control-plane: routing-protokollen lytter til naboene",
    description:
      "Parallelt med data-planet kjører ruteren en routing-protokoll (OSPF, BGP, RIP, …) på sin CPU. Den bytter ruting-meldinger med naboene R-A og R-B: «hvilke nettverk kan dere nå, og hvor mye koster det?». I OSPF heter meldingene LSA (Link State Advertisements).",
    path: ["nbA", "rproc"],
    color: "purple",
  },
  {
    title: "7. Routing-prosessoren kjører Dijkstra på lokalt RIB",
    description:
      "Med oppdatert topologi-info bygger routing-prosessoren et Routing Information Base (RIB) og kjører Dijkstras algoritme — finner korteste sti til hvert kjent nettverk. Dette er logisk arbeid, og det tar millisekunder eller mer — for tregt for hver pakke, derfor er forwarding og routing skilt.",
    path: ["rproc"],
    highlightNodes: ["rproc"],
    color: "purple",
  },
  {
    title: "8. Routing-prosessoren skriver ny forwarding-tabell (FIB)",
    description:
      "Resultatet av Dijkstra projiseres ned i en kompakt forwarding-tabell — RIB blir til FIB. FIB inneholder kun det data-planet trenger: prefix → output-port. Skrive-pilen er stiplet grønt: control-plane skriver, data-plane leser, og de er bevisst frikoblet.",
    path: ["rproc", "fib"],
    highlightNodes: ["fib"],
    color: "green",
  },
  {
    title: "9. Neste pakke bruker den nye tabellen — uten å vite at routing kjørte",
    description:
      "Den neste pakken som ankommer P1 vil slå opp i den oppdaterte FIB-en — kanskje den nå skal ut på P3 i stedet for P4 fordi en bedre rute er funnet. Det er hele poenget med separasjonen: data-planet jobber i linjehastighet, control-planet jobber langsomt men intelligent. Dette skillet er det som gjør SDN mulig (kap. 4.4).",
    path: ["in1", "p1", "lpm", "fib"],
    highlightNodes: ["fib"],
    color: "blue",
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

  useEffect(() => {
    const t = setTimeout(() => {
      rf.fitView({ padding: 0.15, duration: 0 });
    }, 60);
    return () => clearTimeout(t);
  }, [rf]);

  // Marker aktive path-edges og highlight-noder
  useEffect(() => {
    const hlNodes = new Set(step.highlightNodes ?? []);
    const pathSet = new Set(step.path);
    setEdges((eds) =>
      eds.map((e) => {
        const inPath = step.path.some(
          (_, i) =>
            i < step.path.length - 1 &&
            ((e.source === step.path[i] && e.target === step.path[i + 1]) ||
              (e.source === step.path[i + 1] && e.target === step.path[i])),
        );
        const orig = EDGES_SPEC.find((s) => s.id === e.id);
        const baseStroke =
          orig?.kind === "control"
            ? "rgb(168 85 247 / 0.45)"
            : orig?.kind === "fibwrite"
              ? "rgb(16 185 129 / 0.45)"
              : orig?.kind === "lpm"
                ? "rgb(100 116 139 / 0.35)"
                : "rgb(156 163 175 / 0.45)";
        return {
          ...e,
          animated: inPath,
          style: {
            stroke: inPath ? stepColor : baseStroke,
            strokeWidth: inPath ? 2.6 : 1.5,
            strokeDasharray:
              orig?.kind === "lpm" || orig?.kind === "fibwrite" ? "5 4" : undefined,
          },
        };
      }),
    );
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          active: pathSet.has(n.id),
          highlight: hlNodes.has(n.id),
        },
      })),
    );
  }, [stepIdx, setEdges, setNodes, stepColor, step.highlightNodes, step.path]);

  // Animasjons-loop
  useEffect(() => {
    if (!playing) return;
    const start = performance.now();
    const DUR = Math.max(1500, step.path.length * 700);
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
          }, 400);
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

  const packetFlowPos = useMemo(() => {
    if (step.path.length < 2) return null;
    const segments = step.path.length - 1;
    const t = Math.min(progress, 0.999) * segments;
    const segIdx = Math.floor(t);
    const segT = t - segIdx;
    const a = nodes.find((n) => n.id === step.path[segIdx]);
    const b = nodes.find((n) => n.id === step.path[segIdx + 1]);
    if (!a || !b) return null;
    // Anker: senter (omtrent — nodene har ulik størrelse, men dette er nok)
    const w = 90;
    const h = 44;
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

      <div ref={containerRef} style={{ height: 520 }} className="relative bg-muted/10">
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
              if (d.kind === "fabric") return "#f59e0b";
              if (d.kind === "inputPort") return "#3b82f6";
              if (d.kind === "outputPort") return "#10b981";
              if (d.kind === "routingProc" || d.kind === "neighbor") return "#a855f7";
              if (d.kind === "fwdTable") return "#64748b";
              return "#cbd5e1";
            }}
            pannable
            zoomable
            position="bottom-right"
          />
        </ReactFlow>

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

      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <LegendDot color="blue" /> Data-plane forwarding (per pakke)
        <LegendDot color="amber" /> Switching fabric
        <LegendDot color="purple" /> Control-plane (routing-protokoll)
        <LegendDot color="green" /> FIB-skriving (control → data)
        <span className="ml-auto">dra noder · scroll for zoom · minimap nede til høyre</span>
      </div>
    </div>
  );
}

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
  const size = Math.max(18, 24 * vp.zoom);
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

export function Section41Live() {
  return (
    <ReactFlowProvider>
      <FlowInner />
    </ReactFlowProvider>
  );
}
