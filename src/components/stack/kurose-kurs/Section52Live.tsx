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
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Network, Globe2 } from "lucide-react";

// Section52Live — OSPF areas + LSA-flooding
//
// Pedagogisk poeng: OSPF deler et AS i hierarkiske områder (areas). LSA-er
// flooder kun innenfor sitt eget area. Backbone (area 0) er hub: alle andre
// areas må kobles til den. Area Border Routers (ABR) sitter på grensen og
// oversetter intra-area Router-LSA (type 1) til summary-LSA (type 3) som
// flommer i nabo-arealene. Brukeren ser tydelig at type 1 stopper ved
// area-grensen, mens type 3 krysser den.

// ============================================================
// Node-typer
// ============================================================

type RouterRole = "internal" | "abr" | "backbone";
type AreaId = 0 | 1 | 2;

type RouterNodeData = {
  label: string;
  area: AreaId | "both";
  role: RouterRole;
  highlight?: "lsa1" | "lsa3" | "source" | "received";
  badge?: string;
};

const AREA_BG: Record<AreaId, string> = {
  0: "bg-emerald-500/10 border-emerald-500/40",
  1: "bg-sky-500/10 border-sky-500/40",
  2: "bg-amber-500/10 border-amber-500/40",
};

const HIGHLIGHT_RING: Record<NonNullable<RouterNodeData["highlight"]>, string> = {
  source: "ring-2 ring-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.15)]",
  lsa1: "ring-2 ring-amber-500",
  lsa3: "ring-2 ring-purple-500",
  received: "ring-2 ring-foreground/60",
};

function RouterNode({ data }: NodeProps) {
  const d = data as RouterNodeData;
  const ring = d.highlight ? HIGHLIGHT_RING[d.highlight] : "";
  const areaTag = d.area === "both" ? "0|" + (d.role === "abr" ? "?" : "") : `area ${d.area}`;
  const bg = d.area === "both" ? "bg-foreground/5 border-foreground/40" : AREA_BG[d.area];
  return (
    <div
      className={`relative rounded-md border-2 px-3 py-2 text-center shadow-sm ${bg} ${ring}`}
      style={{ minWidth: 70 }}
    >
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
      <Handle type="target" position={Position.Top} id="top" className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-transparent !border-0" />
      <div className="text-sm font-bold leading-none">{d.label}</div>
      <div className="mt-0.5 text-[9px] text-muted-foreground leading-none">
        {d.role === "abr" ? "ABR" : d.role === "backbone" ? "backbone" : areaTag}
      </div>
      {d.badge && (
        <div className="mt-1 text-[10px] font-mono leading-none text-amber-700 dark:text-amber-400">
          {d.badge}
        </div>
      )}
    </div>
  );
}

const nodeTypes = { router: RouterNode };

// ============================================================
// Topologi — tre OSPF-areas
//   Area 0 (backbone):  X, Y
//   Area 1:             R1, R2, R3, A1 (ABR mot 0)
//   Area 2:             R4, R5, A2 (ABR mot 0)
// ============================================================

type RTRDef = { id: string; area: AreaId | "both"; role: RouterRole; x: number; y: number };

const INIT_RTRS: RTRDef[] = [
  // Area 1 (venstre)
  { id: "R1", area: 1, role: "internal", x: 40, y: 80 },
  { id: "R2", area: 1, role: "internal", x: 40, y: 220 },
  { id: "R3", area: 1, role: "internal", x: 40, y: 360 },
  { id: "A1", area: "both", role: "abr", x: 200, y: 220 },

  // Area 0 (midten, backbone)
  { id: "X", area: 0, role: "backbone", x: 360, y: 130 },
  { id: "Y", area: 0, role: "backbone", x: 360, y: 310 },

  // Area 2 (høyre)
  { id: "A2", area: "both", role: "abr", x: 520, y: 220 },
  { id: "R4", area: 2, role: "internal", x: 680, y: 130 },
  { id: "R5", area: 2, role: "internal", x: 680, y: 310 },
];

type LinkDef = { a: string; b: string; cost: number; area: AreaId };
// Hver lenke ligger inne i ETT område. ABR-er deltar i flere områder.
const LINKS: LinkDef[] = [
  // Area 1
  { a: "R1", b: "R2", cost: 1, area: 1 },
  { a: "R2", b: "R3", cost: 1, area: 1 },
  { a: "R1", b: "A1", cost: 2, area: 1 },
  { a: "R2", b: "A1", cost: 1, area: 1 },
  { a: "R3", b: "A1", cost: 2, area: 1 },

  // Area 0
  { a: "A1", b: "X", cost: 3, area: 0 },
  { a: "A1", b: "Y", cost: 4, area: 0 },
  { a: "X", b: "Y", cost: 1, area: 0 },
  { a: "X", b: "A2", cost: 3, area: 0 },
  { a: "Y", b: "A2", cost: 2, area: 0 },

  // Area 2
  { a: "A2", b: "R4", cost: 2, area: 2 },
  { a: "A2", b: "R5", cost: 1, area: 2 },
  { a: "R4", b: "R5", cost: 2, area: 2 },
];

const AREA_OF: Record<string, Set<AreaId>> = (() => {
  const map: Record<string, Set<AreaId>> = {};
  for (const r of INIT_RTRS) {
    map[r.id] = new Set<AreaId>();
    if (r.area === "both") {
      map[r.id].add(0);
    } else {
      map[r.id].add(r.area as AreaId);
    }
  }
  // ABR sitter i begge — bestem fra deres lenker
  for (const l of LINKS) {
    if (!map[l.a].has(l.area)) map[l.a].add(l.area);
    if (!map[l.b].has(l.area)) map[l.b].add(l.area);
  }
  return map;
})();

function key(a: string, b: string) {
  return [a, b].sort().join("-");
}

// ============================================================
// Init noder
// ============================================================

const INIT_NODES: Node<RouterNodeData>[] = INIT_RTRS.map((r) => ({
  id: r.id,
  type: "router",
  position: { x: r.x, y: r.y },
  data: { label: r.id, area: r.area, role: r.role },
}));

// ============================================================
// Edges
// ============================================================

function buildEdges(opts: {
  highlight?: { a: string; b: string; kind: "lsa1" | "lsa3" }[];
}): Edge[] {
  const hiMap = new Map<string, "lsa1" | "lsa3">();
  for (const h of opts.highlight ?? []) hiMap.set(key(h.a, h.b), h.kind);
  return LINKS.map((l, i) => {
    const k = key(l.a, l.b);
    const hi = hiMap.get(k);
    const areaColor = l.area === 0 ? "#10b981" : l.area === 1 ? "#0ea5e9" : "#f59e0b";
    return {
      id: `l${i}`,
      source: l.a,
      target: l.b,
      label: `${l.cost}`,
      labelStyle: { fontSize: 10, fontWeight: 600 },
      labelBgStyle: { fill: "white", fillOpacity: 0.9 },
      style: {
        stroke: hi === "lsa1" ? "#f59e0b" : hi === "lsa3" ? "#a855f7" : areaColor + "88",
        strokeWidth: hi ? 3 : 1.8,
        strokeDasharray: hi === "lsa3" ? "4 3" : undefined,
      },
      animated: !!hi,
    };
  });
}

// ============================================================
// BFS-flooding-simulering
//
// LSA type 1 (Router-LSA): flooder kun innenfor området der den ble
//   generert. Stopper ved ABR.
// LSA type 3 (Summary-LSA): genereres av ABR i nabo-areal og flommer der.
//   Bringer informasjon om nett i et annet område (uten detaljerte lenker).
// ============================================================

type FloodEvent = {
  hop: number; // 1, 2, ...
  link: { a: string; b: string };
  kind: "lsa1" | "lsa3";
  toNode: string;
};

function neighboursInArea(node: string, area: AreaId): { neigh: string; cost: number }[] {
  const out: { neigh: string; cost: number }[] = [];
  for (const l of LINKS) {
    if (l.area !== area) continue;
    if (l.a === node) out.push({ neigh: l.b, cost: l.cost });
    else if (l.b === node) out.push({ neigh: l.a, cost: l.cost });
  }
  return out;
}

function floodLSA(source: string, area: AreaId, kind: "lsa1" | "lsa3"): FloodEvent[] {
  const events: FloodEvent[] = [];
  const seen = new Set<string>([source]);
  let frontier: string[] = [source];
  let hop = 1;
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const u of frontier) {
      for (const { neigh: v } of neighboursInArea(u, area)) {
        if (seen.has(v)) continue;
        seen.add(v);
        events.push({ hop, link: { a: u, b: v }, kind, toNode: v });
        next.push(v);
      }
    }
    frontier = next;
    hop++;
  }
  return events;
}

// ============================================================
// Step-skript
// ============================================================

type Step = {
  title: string;
  description: string;
  // Floodbølger som vises kumulativt fram til (og med) dette steget.
  floodPhases?: { source: string; area: AreaId; kind: "lsa1" | "lsa3"; uptoHop?: number }[];
  // Hvilke noder som skal merkes som mottakere (har LSDB-en).
  receivedNodes?: string[];
  sourceNode?: string;
};

const STEPS: Step[] = [
  {
    title: "1. Tre areas — fysisk topologi",
    description:
      "AS-et vårt har tre OSPF-areas. Area 0 (grønt) er backbone. Area 1 (blå) og area 2 (gul) er stub-areas som kobler til backbone via en ABR — Area Border Router (A1 i blå, A2 i gul). Alle inter-area-rutinger må gå gjennom area 0. Ingen direkte lenke mellom area 1 og area 2.",
  },
  {
    title: "2. R2 i area 1 genererer en Router-LSA (type 1)",
    description:
      "R2 sender Hello-pakker og oppdager naboene R1, R3 og A1 med målte kostnader. R2 pakker dette i en Router-LSA: «mine lenker er R2-R1 kost 1, R2-R3 kost 1, R2-A1 kost 1». LSA-en floodes til alle naboer i samme area.",
    floodPhases: [{ source: "R2", area: 1, kind: "lsa1", uptoHop: 1 }],
    sourceNode: "R2",
  },
  {
    title: "3. LSA-en flommer hop-for-hop gjennom area 1",
    description:
      "Hver mottaker forwarder LSA-en videre på alle sine andre porter — pålitelig flooding med sekvensnumre slik at gamle versjoner ikke ekkoes. Etter ett hop har R1, R3 og A1 mottatt LSA-en. ABR-en A1 er medlem av både area 1 og area 0 — men dette er en type-1-LSA, så den krysser ikke grensen.",
    floodPhases: [{ source: "R2", area: 1, kind: "lsa1" }],
    sourceNode: "R2",
    receivedNodes: ["R1", "R3", "A1"],
  },
  {
    title: "4. Type-1-LSA-en stopper ved ABR — krysser ikke area 0",
    description:
      "A1 har mottatt R2 sin Router-LSA i sin area-1-LSDB. Men type-1-LSA-er flommer KUN innenfor sitt eget area. A1 forwarder den ikke til X eller Y i backbone. R4 og R5 i area 2 ser den aldri. Dette er hierarkiets poeng: rutere i ett area trenger ikke vite om interne lenker i andre areas.",
    floodPhases: [{ source: "R2", area: 1, kind: "lsa1" }],
    sourceNode: "R2",
    receivedNodes: ["R1", "R3", "A1"],
  },
  {
    title: "5. ABR A1 oversetter til Summary-LSA (type 3) i area 0",
    description:
      "A1 vet nå hele topologien i area 1 og har kjørt Dijkstra. Den ser «nett i area 1 er nåbar via meg med kost K». A1 lager en type-3 Summary-LSA: «area 1 sine prefiks når du via meg, kost K» — ingen detaljer om interne lenker. Den floodes i area 0.",
    floodPhases: [
      { source: "R2", area: 1, kind: "lsa1" },
      { source: "A1", area: 0, kind: "lsa3", uptoHop: 1 },
    ],
    sourceNode: "A1",
    receivedNodes: ["R1", "R3", "A1"],
  },
  {
    title: "6. Summary-LSA-en flommer i area 0 — X, Y og A2 mottar",
    description:
      "Type-3-LSA-en flommer videre i backbone. X mottar den, så Y, så A2. Backbone-ruterne lærer altså «for å nå area 1, gå mot A1 med kost K». De vet ikke at R1, R2 eller R3 finnes — kun at det finnes nett bak A1.",
    floodPhases: [
      { source: "R2", area: 1, kind: "lsa1" },
      { source: "A1", area: 0, kind: "lsa3" },
    ],
    sourceNode: "A1",
    receivedNodes: ["R1", "R3", "A1", "X", "Y", "A2"],
  },
  {
    title: "7. A2 oversetter videre — type-3-LSA i area 2",
    description:
      "A2 er ABR mellom area 0 og area 2. Den mottok summary-LSA-en fra A1 om area 1. A2 genererer nå en NY summary-LSA (med oppdatert kost A2→A1→nett-i-area-1) og flooder den i area 2. R4 og R5 lærer at «area 1-prefiks når du via A2».",
    floodPhases: [
      { source: "R2", area: 1, kind: "lsa1" },
      { source: "A1", area: 0, kind: "lsa3" },
      { source: "A2", area: 2, kind: "lsa3", uptoHop: 1 },
    ],
    sourceNode: "A2",
    receivedNodes: ["R1", "R3", "A1", "X", "Y", "A2"],
  },
  {
    title: "8. Konvergens — alle vet om alle prefiks, ingen vet om alle lenker",
    description:
      "Etter at flooding er ferdig har R5 i area 2 en LSDB med: (a) alle interne lenker i area 2 (type 1 fra naboer der), (b) summary-LSA-er for hvert prefiks i area 1 (via A2). R5 vet IKKE at R1, R2, R3 finnes. Den vet bare «trafikk til 10.1.0.0/16 sendes mot A2». Dette er hva «skalerbarhet via hierarki» betyr.",
    floodPhases: [
      { source: "R2", area: 1, kind: "lsa1" },
      { source: "A1", area: 0, kind: "lsa3" },
      { source: "A2", area: 2, kind: "lsa3" },
    ],
    receivedNodes: ["R1", "R3", "A1", "X", "Y", "A2", "R4", "R5"],
  },
];

// ============================================================
// Hovedkomponent
// ============================================================

function FlowInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INIT_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(buildEdges({}));
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playTimerRef = useRef<number | null>(null);
  const rf = useReactFlow();

  const step = STEPS[stepIdx];

  useEffect(() => {
    const t = setTimeout(() => rf.fitView({ padding: 0.12, duration: 0 }), 60);
    return () => clearTimeout(t);
  }, [rf]);

  // Beregn aktive flood-events for dette steget
  const activeFlood = useMemo(() => {
    if (!step.floodPhases) return [] as FloodEvent[];
    const acc: FloodEvent[] = [];
    for (const phase of step.floodPhases) {
      const ev = floodLSA(phase.source, phase.area, phase.kind);
      if (phase.uptoHop !== undefined) {
        acc.push(...ev.filter((e) => e.hop <= phase.uptoHop!));
      } else {
        acc.push(...ev);
      }
    }
    return acc;
  }, [step]);

  useEffect(() => {
    setEdges(
      buildEdges({
        highlight: activeFlood.map((e) => ({ a: e.link.a, b: e.link.b, kind: e.kind })),
      }),
    );
    const sourceNode = step.sourceNode;
    const recvSet = new Set(step.receivedNodes ?? []);
    setNodes((nds) =>
      nds.map((n) => {
        let highlight: RouterNodeData["highlight"] = undefined;
        let badge: string | undefined;
        if (sourceNode === n.id) {
          highlight = "source";
          badge = step.floodPhases?.find((p) => p.source === n.id)?.kind === "lsa3" ? "LSA-3→" : "LSA-1→";
        } else if (recvSet.has(n.id)) {
          highlight = "received";
        }
        // Marker noder som er i en aktiv flood
        const inFlood = activeFlood.find((e) => e.toNode === n.id);
        if (inFlood && !highlight) highlight = inFlood.kind;
        return {
          ...n,
          data: { ...(n.data as RouterNodeData), highlight, badge },
        };
      }),
    );
  }, [activeFlood, step, setEdges, setNodes]);

  // Auto-play
  useEffect(() => {
    if (!playing) return;
    playTimerRef.current = window.setTimeout(() => {
      if (stepIdx + 1 < STEPS.length) setStepIdx((i) => i + 1);
      else setPlaying(false);
    }, 3000);
    return () => {
      if (playTimerRef.current) window.clearTimeout(playTimerRef.current);
    };
  }, [playing, stepIdx]);

  const reset = () => {
    setStepIdx(0);
    setPlaying(false);
    setNodes(INIT_NODES);
    setTimeout(() => rf.fitView({ padding: 0.12, duration: 200 }), 60);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 border-b border-border flex flex-wrap items-center gap-2">
        <div className="text-sm font-semibold inline-flex items-center gap-2">
          <Network className="h-4 w-4" /> OSPF — areas og LSA-flooding
        </div>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          Steg {stepIdx + 1} / {STEPS.length}
        </span>
      </div>

      <div className="bg-background px-4 py-2 border-b border-border text-sm font-medium">
        {step.title}
      </div>

      <div style={{ height: 460 }} className="relative bg-muted/10">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          proOptions={{ hideAttribution: true }}
          nodesConnectable={false}
          minZoom={0.4}
          maxZoom={2}
        >
          <Background gap={20} size={1} color="rgb(0 0 0 / 0.05)" />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable position="bottom-right" />
        </ReactFlow>

        {/* Area-overlay labels */}
        <div className="pointer-events-none absolute top-2 left-2 inline-flex gap-2 text-[10px]">
          <span className="rounded px-1.5 py-0.5 bg-sky-500/15 border border-sky-500/40 text-sky-700 dark:text-sky-300">
            Area 1
          </span>
          <span className="rounded px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
            Area 0 (backbone)
          </span>
          <span className="rounded px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300">
            Area 2
          </span>
        </div>
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
          onClick={() => setStepIdx((i) => Math.min(STEPS.length - 1, i + 1))}
          disabled={stepIdx === STEPS.length - 1}
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
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStepIdx(i)}
              className={`h-1.5 w-6 rounded-full ${
                i === stepIdx
                  ? "bg-emerald-500"
                  : i < stepIdx
                    ? "bg-muted-foreground/40"
                    : "bg-muted-foreground/20"
              }`}
              aria-label={`Gå til steg ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* LSDB-panel — vis hva ulike rutere "vet" */}
      <LSDBPanel stepIdx={stepIdx} />

      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-500" /> kilde
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500" /> type-1 LSA (intra-area)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-purple-500" /> type-3 LSA (summary)
        </span>
        <span className="inline-flex items-center gap-1">
          <Globe2 className="h-3 w-3" /> ABR = grensering mot backbone
        </span>
        <span className="ml-auto">Dra noder · scroll for zoom</span>
      </div>
    </div>
  );
}

function LSDBPanel({ stepIdx }: { stepIdx: number }) {
  // Bygg en forenklet LSDB-state per ruter basert på hvor langt vi er
  // i flooding. R5 og R1 er gode kontraster: én i area 1, én i area 2.
  type LsdbEntry = { kind: "type1" | "type3"; from: string; about: string; area: AreaId };
  const r1: LsdbEntry[] = [];
  const r5: LsdbEntry[] = [];
  const a1: LsdbEntry[] = [];

  if (stepIdx >= 3) {
    // Etter at type-1 har flooded i area 1
    r1.push({ kind: "type1", from: "R2", about: "R2 sine lenker (R1/R3/A1)", area: 1 });
    a1.push({ kind: "type1", from: "R2", about: "R2 sine lenker (R1/R3/A1)", area: 1 });
  }
  if (stepIdx >= 6) {
    // Etter at type-3 har flooded i area 0
    a1.push({ kind: "type3", from: "A1", about: "Area 1-prefiks via A1", area: 0 });
  }
  if (stepIdx >= 7) {
    // Etter at A2 flooder type-3 i area 2
    r5.push({ kind: "type3", from: "A2", about: "Area 1-prefiks via A2", area: 2 });
  }

  return (
    <div className="px-4 py-3 border-t border-border bg-background">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        LSDB-utdrag — hva de tre ulike ruterne "vet"
      </div>
      <div className="grid gap-2 md:grid-cols-3 text-xs">
        <LsdbCard label="R1 (area 1)" entries={r1} accent="sky" />
        <LsdbCard label="A1 (ABR — i area 0 + 1)" entries={a1} accent="emerald" />
        <LsdbCard label="R5 (area 2)" entries={r5} accent="amber" />
      </div>
    </div>
  );
}

function LsdbCard({
  label,
  entries,
  accent,
}: {
  label: string;
  entries: { kind: "type1" | "type3"; from: string; about: string }[];
  accent: "sky" | "emerald" | "amber";
}) {
  const accentBorder =
    accent === "sky"
      ? "border-sky-500/40"
      : accent === "emerald"
        ? "border-emerald-500/40"
        : "border-amber-500/40";
  return (
    <div className={`rounded border bg-muted/10 p-2 ${accentBorder}`}>
      <div className="font-semibold mb-1">{label}</div>
      {entries.length === 0 ? (
        <div className="text-muted-foreground italic">(LSDB tom — venter på LSA-er)</div>
      ) : (
        <ul className="space-y-1 font-mono">
          {entries.map((e, i) => (
            <li key={i} className="flex items-center gap-1">
              <span
                className={`inline-block rounded px-1 text-[9px] ${
                  e.kind === "type1"
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                    : "bg-purple-500/15 text-purple-700 dark:text-purple-400"
                }`}
              >
                {e.kind === "type1" ? "T1" : "T3"}
              </span>
              <span className="text-muted-foreground">fra {e.from}:</span>
              <span>{e.about}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Section52Live() {
  return (
    <ReactFlowProvider>
      <FlowInner />
    </ReactFlowProvider>
  );
}
