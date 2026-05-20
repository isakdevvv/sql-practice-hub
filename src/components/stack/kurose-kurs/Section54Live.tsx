import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Cpu,
  Server,
  Zap,
  AlertTriangle,
} from "lucide-react";

// Section54Live — SDN control-plane.
//
// Pedagogisk poeng:
//   1. SDN-controller er logisk sentralisert (én oversikt) men fysisk
//      distribuert (replikker for redundans).
//   2. Switchene har bare flow-tabeller — ingen routing-algoritme lokalt.
//      Controlleren computer hele forwarding-planen og pusher OpenFlow-
//      regler ned.
//   3. Når topologien endrer seg: controlleren oppdager via LLDP/Hello og
//      pusher nye flow-regler innen 100-er ms. Sammenlign med BGP-konvergens
//      som tar minutter.
//
// Vi viser to moduser: "SDN" (controller-basert) vs "Distribuert" (klassisk
// per-router routing). Begge gjør samme jobb, men reaksjonen på en lenke-
// feil ser veldig ulik ut.

// ============================================================
// Node-typer
// ============================================================

type SwitchNodeData = {
  label: string;
  highlight?: "active" | "src" | "dst" | "down" | "updated";
  flowCount?: number; // antall flow-regler installert
};

type CtrlNodeData = {
  label: string;
  primary?: boolean; // den ene "logiske" controlleren brukeren ser
  active?: boolean;
  computing?: boolean;
};

type HostNodeData = {
  label: string;
  ip: string;
};

function SwitchNode({ data }: NodeProps) {
  const d = data as SwitchNodeData;
  const ring =
    d.highlight === "src"
      ? "ring-2 ring-rose-500"
      : d.highlight === "dst"
        ? "ring-2 ring-emerald-500"
        : d.highlight === "updated"
          ? "ring-2 ring-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]"
          : d.highlight === "active"
            ? "ring-2 ring-amber-500"
            : d.highlight === "down"
              ? "ring-2 ring-red-500"
              : "";
  const isDown = d.highlight === "down";
  return (
    <div
      className={`relative rounded-md border-2 border-sky-500/50 bg-sky-500/10 px-2.5 py-1.5 text-center shadow-sm ${ring} ${
        isDown ? "opacity-40" : ""
      }`}
      style={{ minWidth: 62 }}
    >
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
      <Handle type="target" position={Position.Top} id="top" className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-transparent !border-0" />
      <div className="text-xs font-bold leading-none">{d.label}</div>
      <div className="text-[9px] text-muted-foreground leading-none mt-0.5">switch</div>
      {d.flowCount !== undefined && (
        <div className="mt-0.5 text-[9px] font-mono leading-none text-blue-700 dark:text-blue-400">
          {d.flowCount} flow-r.
        </div>
      )}
      {isDown && (
        <div className="mt-0.5 text-[9px] text-red-500 font-bold leading-none">NEDE</div>
      )}
    </div>
  );
}

function CtrlNode({ data }: NodeProps) {
  const d = data as CtrlNodeData;
  const ring = d.computing ? "ring-2 ring-purple-500 animate-pulse" : "";
  return (
    <div
      className={`relative rounded-md border-2 border-purple-500/50 bg-purple-500/10 px-2.5 py-1.5 text-center shadow-sm ${ring} ${
        d.primary ? "border-purple-500" : "opacity-70"
      }`}
      style={{ minWidth: 90 }}
    >
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
      <Handle type="target" position={Position.Top} id="top" className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-transparent !border-0" />
      <div className="text-xs font-bold leading-none flex items-center justify-center gap-1">
        <Cpu className="h-3 w-3" /> {d.label}
      </div>
      <div className="text-[9px] text-muted-foreground leading-none mt-0.5">
        {d.primary ? "primær" : "replika"}
      </div>
    </div>
  );
}

function HostNode({ data }: NodeProps) {
  const d = data as HostNodeData;
  return (
    <div
      className="relative rounded-md border-2 border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-center"
      style={{ minWidth: 56 }}
    >
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
      <div className="text-xs font-bold leading-none flex items-center justify-center gap-1">
        <Server className="h-3 w-3" /> {d.label}
      </div>
      <div className="text-[9px] text-muted-foreground font-mono leading-none mt-0.5">{d.ip}</div>
    </div>
  );
}

const nodeTypes = { sw: SwitchNode, ctrl: CtrlNode, host: HostNode };

// ============================================================
// Topologi — datasenter-stil
//
//   H1 -- S1 -- S2 -- S5 -- H2
//          \    |    /
//           S3-S4
//
//   Controlleren C-PRIM ligger over og snakker med alle switcher
//   via en out-of-band control-channel (vist som stiplede linjer).
//
//   Backup-replika C-REPL ved siden av — viser at "logisk én" ikke
//   betyr "fysisk én".
// ============================================================

const INIT_NODES: Node[] = [
  // Hosts
  { id: "H1", type: "host", position: { x: 0, y: 240 }, data: { label: "H1", ip: "10.0.0.1" } },
  { id: "H2", type: "host", position: { x: 740, y: 240 }, data: { label: "H2", ip: "10.0.0.2" } },

  // Switches — datasenter-ish topologi
  { id: "S1", type: "sw", position: { x: 110, y: 240 }, data: { label: "S1" } },
  { id: "S2", type: "sw", position: { x: 270, y: 160 }, data: { label: "S2" } },
  { id: "S3", type: "sw", position: { x: 270, y: 320 }, data: { label: "S3" } },
  { id: "S4", type: "sw", position: { x: 450, y: 320 }, data: { label: "S4" } },
  { id: "S5", type: "sw", position: { x: 600, y: 240 }, data: { label: "S5" } },

  // Controllers
  {
    id: "CP",
    type: "ctrl",
    position: { x: 200, y: 20 },
    data: { label: "Controller-1", primary: true },
  },
  {
    id: "CR",
    type: "ctrl",
    position: { x: 440, y: 20 },
    data: { label: "Controller-2", primary: false },
  },
];

type Link = { a: string; b: string; kind: "data" | "ctrl" };

const LINKS: Link[] = [
  // Data-plane
  { a: "H1", b: "S1", kind: "data" },
  { a: "S1", b: "S2", kind: "data" },
  { a: "S1", b: "S3", kind: "data" },
  { a: "S2", b: "S4", kind: "data" },
  { a: "S3", b: "S4", kind: "data" },
  { a: "S2", b: "S5", kind: "data" },
  { a: "S4", b: "S5", kind: "data" },
  { a: "S5", b: "H2", kind: "data" },

  // Control-plane (OpenFlow over TLS)
  { a: "CP", b: "S1", kind: "ctrl" },
  { a: "CP", b: "S2", kind: "ctrl" },
  { a: "CP", b: "S3", kind: "ctrl" },
  { a: "CP", b: "S4", kind: "ctrl" },
  { a: "CP", b: "S5", kind: "ctrl" },
  { a: "CP", b: "CR", kind: "ctrl" }, // replication
];

function key(a: string, b: string) {
  return [a, b].sort().join("-");
}

// ============================================================
// Edges
// ============================================================

function buildEdges(opts: {
  highlightPath?: string[]; // sekvens av node-ID
  pushFlows?: string[]; // switch-IDer som mottar flow-update fra CP
  down?: { a: string; b: string }[];
  hideControl?: boolean;
}): Edge[] {
  const pathSet = new Set<string>();
  if (opts.highlightPath) {
    for (let i = 0; i < opts.highlightPath.length - 1; i++) {
      pathSet.add(key(opts.highlightPath[i], opts.highlightPath[i + 1]));
    }
  }
  const downSet = new Set((opts.down ?? []).map((d) => key(d.a, d.b)));
  const pushSet = new Set(opts.pushFlows ?? []);

  return LINKS.filter((l) => !(opts.hideControl && l.kind === "ctrl"))
    .map((l, i) => {
      const k = key(l.a, l.b);
      const isHi = pathSet.has(k);
      const isDown = downSet.has(k);
      const isPush = l.kind === "ctrl" && (pushSet.has(l.a) || pushSet.has(l.b));
      return {
        id: `l${i}`,
        source: l.a,
        target: l.b,
        style: {
          stroke: isDown
            ? "#ef4444"
            : isHi
              ? "#10b981"
              : isPush
                ? "#a855f7"
                : l.kind === "ctrl"
                  ? "rgb(168 85 247 / 0.35)"
                  : "rgb(120 120 120 / 0.55)",
          strokeWidth: isHi ? 3 : isPush ? 2.4 : 1.6,
          strokeDasharray:
            l.kind === "ctrl" ? "4 3" : isDown ? "5 4" : undefined,
          opacity: isDown ? 0.6 : 1,
        },
        animated: isHi || isPush,
        type: "default",
      };
    });
}

// ============================================================
// Stier i topologien — beregnet, brukt for å vise flow-pushing
// ============================================================

// Den primære stien fra H1 til H2:
const PATH_PRIMARY = ["H1", "S1", "S2", "S5", "H2"];
// Når S2-S5 ryker, alternativ via S4:
const PATH_BACKUP = ["H1", "S1", "S3", "S4", "S5", "H2"];

// I distribuert modus: ruterne har dyna lik DV/LS. Convergence er treig
// (illustrert via lengre delay).

// ============================================================
// Flow-tabell-modell
// ============================================================

type FlowRule = {
  match: { dst: string };
  action: string; // "fwd port-X"
  // Hvilken switch denne ligger på trackes utenfor.
};

const FLOW_TABLES_PRIMARY: Record<string, FlowRule[]> = {
  S1: [{ match: { dst: "10.0.0.2" }, action: "fwd → S2" }],
  S2: [{ match: { dst: "10.0.0.2" }, action: "fwd → S5" }],
  S3: [],
  S4: [],
  S5: [{ match: { dst: "10.0.0.2" }, action: "fwd → H2" }],
};

const FLOW_TABLES_BACKUP: Record<string, FlowRule[]> = {
  S1: [{ match: { dst: "10.0.0.2" }, action: "fwd → S3" }],
  S2: [],
  S3: [{ match: { dst: "10.0.0.2" }, action: "fwd → S4" }],
  S4: [{ match: { dst: "10.0.0.2" }, action: "fwd → S5" }],
  S5: [{ match: { dst: "10.0.0.2" }, action: "fwd → H2" }],
};

// ============================================================
// Step-skript
// ============================================================

type Mode = "sdn" | "distributed";

type Step = {
  title: string;
  description: string;
  highlightPath?: string[];
  pushFlows?: string[]; // switches receiving flow-updates
  down?: { a: string; b: string }[];
  controllerComputing?: boolean;
  showFlowTables?: "primary" | "backup" | null;
  badge?: string; // f.eks. tidsbruk
};

const STEPS_SDN: Step[] = [
  {
    title: "1. SDN-arkitektur — logisk én controller",
    description:
      "Controller-1 er primær, Controller-2 er backup-replika. De holder DELT state. Brukere og operatører ser én controller — den «logisk sentraliserte». Bare switcher i datasen-data-planen. Hver switch har en OpenFlow-kontroll-kanal (lilla, stiplet) opp til controlleren. Ingen routing-algoritme kjører i switcheme selv.",
  },
  {
    title: "2. Controlleren beregner forwarding fra H1 til H2",
    description:
      "Controlleren har et komplett topologi-kart (bygget via LLDP fra switcheme). Den kjører Dijkstra én gang på dette kartet og finner korteste sti: H1→S1→S2→S5→H2. Dette skjer i RAM på controlleren — millisekunder.",
    controllerComputing: true,
  },
  {
    title: "3. Controlleren pusher flow-regler ned til relevante switcher",
    description:
      "Via OpenFlow FLOW_MOD-meldinger pakker controlleren instruksjoner: «på S1: hvis dst=10.0.0.2 → fwd ut port-mot-S2». «På S2: hvis dst=10.0.0.2 → fwd ut port-mot-S5». «På S5: → port-mot-H2». S3 og S4 trenger ingen regel for denne flyten. Pushing tar 10–50 ms.",
    pushFlows: ["S1", "S2", "S5"],
    controllerComputing: false,
    showFlowTables: "primary",
    badge: "totalt: ~50 ms fra plan til paket-fwd",
  },
  {
    title: "4. Pakker går — switcher gjør bare table-lookup",
    description:
      "H1 sender pakke med dst=10.0.0.2. S1 matcher i sin flow-tabell, sender ut port-mot-S2 i mikrosekunder. Ingen tenkning i S1 — bare match+forward. Samme på S2 og S5. Helt umiddelbart, helt deterministisk.",
    highlightPath: PATH_PRIMARY,
    showFlowTables: "primary",
  },
  {
    title: "5. S2-S5-lenken ryker — switcher rapporterer port-down",
    description:
      "Lenken mellom S2 og S5 dør plutselig. S2 oppdager via LLDP-timeout (eller direkte port-status). S2 sender en PORT_STATUS-melding OPP til controlleren over kontrollkanalen: «port-til-S5 er nede».",
    down: [{ a: "S2", b: "S5" }],
    highlightPath: PATH_PRIMARY,
    pushFlows: ["S2"],
    showFlowTables: "primary",
  },
  {
    title: "6. Controlleren replanlegger — Dijkstra på nytt topologi-kart",
    description:
      "Controlleren oppdaterer sitt topologi-kart (fjerner S2-S5-lenken) og kjører Dijkstra igjen. Ny korteste sti: H1→S1→S3→S4→S5→H2. Tar igjen millisekunder.",
    down: [{ a: "S2", b: "S5" }],
    controllerComputing: true,
    showFlowTables: "primary",
  },
  {
    title: "7. Controlleren pusher NYE flow-regler — S1, S3, S4 oppdateres",
    description:
      "FLOW_MOD-meldinger sendes: S1 endrer fwd til S3, S3 får ny regel (fwd til S4), S4 får ny regel (fwd til S5). Total konvergens: ca 100-300 ms fra lenke-feil til ny path er aktiv. Sammenlign med BGP/OSPF som tar minutter (eller timer for BGP).",
    down: [{ a: "S2", b: "S5" }],
    pushFlows: ["S1", "S3", "S4"],
    showFlowTables: "backup",
    badge: "konvergens: ~150 ms",
  },
  {
    title: "8. Trafikk flyter via ny path",
    description:
      "H1 sender en ny pakke. S1 matcher den nye regelen → fwd til S3. S3 → S4. S4 → S5. S5 → H2. Brukeren merket knapt en hikke. SDN-controllerens globale syn lar den ta optimale ruting-beslutninger umiddelbart — uten den treige melding-utvekslingen distribuerte protokoller krever.",
    down: [{ a: "S2", b: "S5" }],
    highlightPath: PATH_BACKUP,
    showFlowTables: "backup",
  },
];

const STEPS_DIST: Step[] = [
  {
    title: "1. Distribuert (klassisk) modus — hver switch er ruter",
    description:
      "Nå tenker vi oss det samme nettet KLASSISK: hver switch er en ruter med egen routing-protokoll (f.eks. OSPF eller BGP for større nett). Ingen sentral controller. Forwarding-tabeller bygges via flooding og lokal Dijkstra/Bellman-Ford. Vi gjemmer kontroll-kanalen — det finnes ingen.",
  },
  {
    title: "2. Konvergens — hver ruter snakker med sine naboer",
    description:
      "Etter ca 1-10 sekunder har alle ruterne flooded sine LSA-er (OSPF) og kjørt Dijkstra lokalt. Forwarding-tabellene er konsistente. Sti H1→S1→S2→S5→H2 er aktiv.",
    highlightPath: PATH_PRIMARY,
    showFlowTables: "primary",
  },
  {
    title: "3. S2-S5-lenken ryker",
    description:
      "Lenken faller ut. S2 og S5 oppdager dette først — via OSPF hello-timeout. Default i OSPF: 40 sekunder.",
    down: [{ a: "S2", b: "S5" }],
    highlightPath: PATH_PRIMARY,
    showFlowTables: "primary",
  },
  {
    title: "4. LSA flooder — alle må re-beregne",
    description:
      "S2 og S5 sender ut nye LSA-er via flooding. Hver ruter mottar, oppdaterer sin LSDB, og kjører Dijkstra på nytt LOKALT. I mellomtiden kan pakker mistes (eller loope, hvis tabellene er inkonsistente).",
    down: [{ a: "S2", b: "S5" }],
    pushFlows: ["S1", "S2", "S3", "S4", "S5"],
    showFlowTables: "primary",
  },
  {
    title: "5. Konvergert — typisk 30 sek til 5 minutter",
    description:
      "Etter at alle LSA-er er flooded og alle har kjørt Dijkstra, er ny sti H1→S1→S3→S4→S5→H2 aktiv. OSPF: titalls sekunder. BGP: kan ta minutter. I mellomtiden droppes pakker — brukeren merker det.",
    down: [{ a: "S2", b: "S5" }],
    highlightPath: PATH_BACKUP,
    showFlowTables: "backup",
    badge: "konvergens: ~30 sek – 5 min",
  },
];

// ============================================================
// Hovedkomponent
// ============================================================

function FlowInner() {
  const [mode, setMode] = useState<Mode>("sdn");
  const [nodes, setNodes, onNodesChange] = useNodesState(INIT_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(buildEdges({}));
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playTimerRef = useRef<number | null>(null);
  const rf = useReactFlow();

  const steps = mode === "sdn" ? STEPS_SDN : STEPS_DIST;
  const step = steps[stepIdx];

  useEffect(() => {
    const t = setTimeout(() => rf.fitView({ padding: 0.1, duration: 0 }), 60);
    return () => clearTimeout(t);
  }, [rf]);

  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
  }, [mode]);

  useEffect(() => {
    setEdges(
      buildEdges({
        highlightPath: step.highlightPath,
        pushFlows: step.pushFlows,
        down: step.down,
        hideControl: mode === "distributed",
      }),
    );

    const pushSet = new Set(step.pushFlows ?? []);
    const downSwitch = (() => {
      // Mark switches adjacent to a down link as "down-adjacent"? No — we
      // mark the link visually, switches stay up.
      return new Set<string>();
    })();
    const onPath = new Set(step.highlightPath ?? []);

    const flowTables =
      step.showFlowTables === "primary"
        ? FLOW_TABLES_PRIMARY
        : step.showFlowTables === "backup"
          ? FLOW_TABLES_BACKUP
          : null;

    setNodes((nds) =>
      nds.map((n) => {
        if (mode === "distributed" && (n.id === "CP" || n.id === "CR")) {
          return { ...n, hidden: true };
        }
        if (n.type === "ctrl") {
          return {
            ...n,
            hidden: false,
            data: {
              ...(n.data as CtrlNodeData),
              computing: step.controllerComputing && n.id === "CP",
            },
          };
        }
        if (n.type === "sw") {
          let highlight: SwitchNodeData["highlight"];
          if (n.id === "H1" || n.id === "H2") {
            // hosts handled below
          }
          if (pushSet.has(n.id)) highlight = "updated";
          else if (onPath.has(n.id)) highlight = "active";
          else if (downSwitch.has(n.id)) highlight = "down";
          const flowCount = flowTables ? flowTables[n.id]?.length ?? 0 : undefined;
          return {
            ...n,
            data: { ...(n.data as SwitchNodeData), highlight, flowCount },
          };
        }
        return n;
      }),
    );
  }, [step, mode, setEdges, setNodes]);

  useEffect(() => {
    if (!playing) return;
    playTimerRef.current = window.setTimeout(() => {
      if (stepIdx + 1 < steps.length) setStepIdx((i) => i + 1);
      else setPlaying(false);
    }, 3200);
    return () => {
      if (playTimerRef.current) window.clearTimeout(playTimerRef.current);
    };
  }, [playing, stepIdx, steps.length]);

  const reset = () => {
    setStepIdx(0);
    setPlaying(false);
    setNodes(INIT_NODES);
    setTimeout(() => rf.fitView({ padding: 0.1, duration: 200 }), 60);
  };

  const flowTables = useMemo(
    () =>
      step.showFlowTables === "primary"
        ? FLOW_TABLES_PRIMARY
        : step.showFlowTables === "backup"
          ? FLOW_TABLES_BACKUP
          : null,
    [step.showFlowTables],
  );

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 border-b border-border flex flex-wrap items-center gap-2">
        <div className="text-sm font-semibold inline-flex items-center gap-2">
          <Cpu className="h-4 w-4" /> SDN control-plane vs distribuert
        </div>
        <button
          onClick={() => setMode("sdn")}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
            mode === "sdn"
              ? "bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-500/40"
              : "bg-background border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          <Cpu className="h-3 w-3" /> SDN (sentralisert)
        </button>
        <button
          onClick={() => setMode("distributed")}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
            mode === "distributed"
              ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40"
              : "bg-background border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          <Zap className="h-3 w-3" /> Distribuert (klassisk)
        </button>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          Steg {stepIdx + 1} / {steps.length}
        </span>
      </div>

      <div className="bg-background px-4 py-2 border-b border-border text-sm font-medium flex items-center gap-2">
        <span>{step.title}</span>
        {step.badge && (
          <span className="ml-auto inline-flex items-center gap-1 rounded bg-blue-500/15 px-2 py-0.5 text-[10px] text-blue-700 dark:text-blue-400">
            <AlertTriangle className="h-3 w-3" /> {step.badge}
          </span>
        )}
      </div>

      <div style={{ height: 420 }} className="relative bg-muted/10">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          proOptions={{ hideAttribution: true }}
          nodesConnectable={false}
          minZoom={0.4}
          maxZoom={2}
        >
          <Background gap={20} size={1} color="rgb(0 0 0 / 0.05)" />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable position="bottom-right" />
        </ReactFlow>
      </div>

      <div className="px-4 py-3 text-sm text-muted-foreground border-t border-border">
        {step.description}
      </div>

      <div className="px-4 py-2 flex flex-wrap items-center gap-1.5 border-t border-border bg-muted/20">
        <button
          onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
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
          {playing ? "Pause" : "Auto"}
        </button>
        <button
          onClick={() => setStepIdx((i) => Math.min(steps.length - 1, i + 1))}
          disabled={stepIdx === steps.length - 1}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
        >
          Neste <SkipForward className="h-3 w-3" />
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 ml-auto"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
        <div className="basis-full flex gap-1 flex-wrap mt-1">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStepIdx(i)}
              className={`h-1.5 w-6 rounded-full ${
                i === stepIdx
                  ? mode === "sdn"
                    ? "bg-purple-500"
                    : "bg-amber-500"
                  : i < stepIdx
                    ? "bg-muted-foreground/40"
                    : "bg-muted-foreground/20"
              }`}
              aria-label={`Gå til steg ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Flow-tabell-panel */}
      {flowTables && <FlowTablePanel tables={flowTables} />}

      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-emerald-500" /> aktiv data-sti
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-purple-500 border-dashed" /> OpenFlow control
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-red-500" /> nedet lenke
        </span>
        <span className="ml-auto">Dra noder · scroll for zoom</span>
      </div>
    </div>
  );
}

function FlowTablePanel({ tables }: { tables: Record<string, FlowRule[]> }) {
  return (
    <div className="px-4 py-3 border-t border-border bg-background">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        Flow-tabeller per switch (forenklet)
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5 text-xs">
        {(["S1", "S2", "S3", "S4", "S5"] as const).map((swId) => {
          const rules = tables[swId] ?? [];
          return (
            <div key={swId} className="rounded border border-border bg-muted/10 p-2">
              <div className="font-semibold mb-1 flex items-center gap-1">
                <span className="font-mono">{swId}</span>
                <span className="text-[9px] text-muted-foreground">
                  ({rules.length} regel{rules.length === 1 ? "" : "er"})
                </span>
              </div>
              {rules.length === 0 ? (
                <div className="text-muted-foreground italic text-[10px]">(tom)</div>
              ) : (
                <ul className="space-y-0.5 font-mono text-[10px]">
                  {rules.map((r, i) => (
                    <li key={i} className="leading-tight">
                      <span className="text-muted-foreground">match dst=</span>
                      <span>{r.match.dst}</span>
                      <br />
                      <span className="text-emerald-700 dark:text-emerald-400">{r.action}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Section54Live() {
  return (
    <ReactFlowProvider>
      <FlowInner />
    </ReactFlowProvider>
  );
}
