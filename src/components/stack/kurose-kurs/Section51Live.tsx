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
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Network, Radio } from "lucide-react";

// Section51Live — fullskala interaktiv for 5.1 Routing-algoritmer (intro).
//
// Pedagogisk idé: vise hvorfor LS (link-state, OSPF-stil) og DV (distance-
// vector, RIP-stil) er fundamentalt forskjellige måter å bygge forwarding-
// tabellene på.
//
// Brukeren kan:
//   • Bytte mellom DV-modus og LS-modus
//   • Dra rutere rundt for å eksperimentere med topologien
//   • Stege gjennom algoritmens koreografi:
//       LS: hello → LSA-flood → alle har samme LSDB → kjør Dijkstra lokalt
//       DV: send hele distansevektoren til naboene → de oppdaterer → sender videre
//   • Kjør count-to-infinity-scenarioet (lenke ryker)
//
// Bygget på @xyflow/react. Mønster lånt fra Section12Live og kap7/CellulaViz.

// ============================================================
// Node-typer og data
// ============================================================

type RouterNodeData = {
  label: string;
  highlight?: "active" | "source" | "lsa" | "stale" | "down";
  badge?: string; // f.eks. "D=3" eller "LSDB✓"
};

const HIGHLIGHT_RING: Record<NonNullable<RouterNodeData["highlight"]>, string> = {
  active: "ring-2 ring-brand",
  source: "ring-2 ring-emerald-500",
  lsa: "ring-2 ring-amber-500",
  stale: "ring-2 ring-purple-500",
  down: "ring-2 ring-red-500",
};

function RouterNode({ data }: NodeProps) {
  const d = data as RouterNodeData;
  const ring = d.highlight ? HIGHLIGHT_RING[d.highlight] : "";
  const isDown = d.highlight === "down";
  return (
    <div
      className={`relative rounded-md border-2 border-brand/60 bg-brand/10 px-3 py-2 text-center shadow-sm ${ring} ${
        isDown ? "opacity-40" : ""
      }`}
      style={{ minWidth: 64 }}
    >
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!bg-transparent !border-0"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!bg-transparent !border-0"
      />
      <div className="text-sm font-bold leading-none">{d.label}</div>
      {d.badge && (
        <div className="mt-1 text-[10px] text-muted-foreground font-mono leading-none">
          {d.badge}
        </div>
      )}
      {isDown && (
        <div className="mt-1 text-[9px] text-red-500 font-bold leading-none">NEDE</div>
      )}
    </div>
  );
}

const nodeTypes = { router: RouterNode };

// ============================================================
// Topologi: 5 rutere i pentagonal layout
// ============================================================

const INIT_NODES: Node<RouterNodeData>[] = [
  { id: "A", type: "router", position: { x: 80, y: 200 }, data: { label: "A" } },
  { id: "B", type: "router", position: { x: 260, y: 60 }, data: { label: "B" } },
  { id: "C", type: "router", position: { x: 460, y: 200 }, data: { label: "C" } },
  { id: "D", type: "router", position: { x: 380, y: 360 }, data: { label: "D" } },
  { id: "E", type: "router", position: { x: 160, y: 360 }, data: { label: "E" } },
];

// Lenker med kost. (a, b, cost)
type Link = { a: string; b: string; cost: number };

const LINKS: Link[] = [
  { a: "A", b: "B", cost: 2 },
  { a: "B", b: "C", cost: 3 },
  { a: "C", b: "D", cost: 1 },
  { a: "D", b: "E", cost: 4 },
  { a: "E", b: "A", cost: 2 },
  { a: "A", b: "C", cost: 7 }, // diagonal — gjør grafen interessant
  { a: "B", b: "E", cost: 5 }, // krysslenke
];

function buildEdges(opts: { highlight?: { a: string; b: string }[]; down?: { a: string; b: string }[] }): Edge[] {
  const hi = new Set((opts.highlight ?? []).map((p) => key(p.a, p.b)));
  const down = new Set((opts.down ?? []).map((p) => key(p.a, p.b)));
  return LINKS.map((l, i) => {
    const k = key(l.a, l.b);
    const isHi = hi.has(k);
    const isDown = down.has(k);
    return {
      id: `l${i}`,
      source: l.a,
      target: l.b,
      label: `${l.cost}`,
      labelStyle: { fontSize: 11, fontWeight: 600 },
      labelBgStyle: { fill: "white", fillOpacity: 0.9 },
      style: {
        stroke: isDown
          ? "rgb(239 68 68 / 0.45)"
          : isHi
            ? "#f59e0b"
            : "rgb(120 120 120 / 0.55)",
        strokeWidth: isHi ? 3 : 1.8,
        strokeDasharray: isDown ? "5 4" : undefined,
      },
      animated: isHi && !isDown,
    };
  });
}

function key(a: string, b: string) {
  return [a, b].sort().join("-");
}

// ============================================================
// Dijkstra — for LS-modus
// ============================================================

type DijkstraSnapshot = {
  N: Set<string>;
  D: Record<string, number>;
  P: Record<string, string | null>;
  picked?: string;
  relaxed: { from: string; to: string; newD: number }[];
};

function runDijkstra(source: string, downLinks: Set<string> = new Set()): DijkstraSnapshot[] {
  const allNodes = INIT_NODES.map((n) => n.id);
  const D: Record<string, number> = {};
  const P: Record<string, string | null> = {};
  for (const n of allNodes) {
    D[n] = n === source ? 0 : Infinity;
    P[n] = null;
  }
  const N = new Set<string>();
  const snapshots: DijkstraSnapshot[] = [];
  snapshots.push({ N: new Set(N), D: { ...D }, P: { ...P }, relaxed: [] });

  while (N.size < allNodes.length) {
    // pick min outside N
    let pick: string | null = null;
    let pickD = Infinity;
    for (const n of allNodes) {
      if (!N.has(n) && D[n] < pickD) {
        pickD = D[n];
        pick = n;
      }
    }
    if (!pick) break;
    N.add(pick);
    const relaxed: { from: string; to: string; newD: number }[] = [];
    for (const l of LINKS) {
      if (downLinks.has(key(l.a, l.b))) continue;
      let other: string | null = null;
      if (l.a === pick) other = l.b;
      else if (l.b === pick) other = l.a;
      if (!other || N.has(other)) continue;
      const newD = D[pick] + l.cost;
      if (newD < D[other]) {
        D[other] = newD;
        P[other] = pick;
        relaxed.push({ from: pick, to: other, newD });
      }
    }
    snapshots.push({
      N: new Set(N),
      D: { ...D },
      P: { ...P },
      picked: pick,
      relaxed,
    });
  }
  return snapshots;
}

// ============================================================
// Distance-vector — for DV-modus
// ============================================================

type DVTable = Record<string, Record<string, { dist: number; nextHop: string | null }>>;
// dvtable[node][dest] = {dist, nextHop}

function buildNeighbours(downLinks: Set<string>): Record<string, { neigh: string; cost: number }[]> {
  const out: Record<string, { neigh: string; cost: number }[]> = {};
  for (const n of INIT_NODES) out[n.id] = [];
  for (const l of LINKS) {
    if (downLinks.has(key(l.a, l.b))) continue;
    out[l.a].push({ neigh: l.b, cost: l.cost });
    out[l.b].push({ neigh: l.a, cost: l.cost });
  }
  return out;
}

function initDVTables(downLinks: Set<string>): DVTable {
  const allNodes = INIT_NODES.map((n) => n.id);
  const neigh = buildNeighbours(downLinks);
  const table: DVTable = {};
  for (const n of allNodes) {
    table[n] = {};
    for (const dest of allNodes) {
      if (dest === n) table[n][dest] = { dist: 0, nextHop: null };
      else table[n][dest] = { dist: Infinity, nextHop: null };
    }
    for (const { neigh: nb, cost } of neigh[n]) {
      table[n][nb] = { dist: cost, nextHop: nb };
    }
  }
  return table;
}

type DVRound = {
  before: DVTable;
  updates: { node: string; dest: string; oldDist: number; newDist: number; via: string }[];
  after: DVTable;
};

function runDVRound(prev: DVTable, downLinks: Set<string>): DVRound {
  const allNodes = INIT_NODES.map((n) => n.id);
  const neigh = buildNeighbours(downLinks);
  const next: DVTable = {};
  const updates: DVRound["updates"] = [];
  for (const x of allNodes) {
    next[x] = {};
    for (const y of allNodes) {
      // Bellman-Ford: d_x(y) = min over v naboer av c(x,v) + d_v(y)
      if (x === y) {
        next[x][y] = { dist: 0, nextHop: null };
        continue;
      }
      let best = Infinity;
      let bestV: string | null = null;
      for (const { neigh: v, cost } of neigh[x]) {
        const dv_y = prev[v][y].dist;
        const candidate = cost + dv_y;
        if (candidate < best) {
          best = candidate;
          bestV = v;
        }
      }
      next[x][y] = { dist: best, nextHop: bestV };
      const oldD = prev[x][y].dist;
      if (best !== oldD && bestV) {
        updates.push({ node: x, dest: y, oldDist: oldD, newDist: best, via: bestV });
      }
    }
  }
  return { before: prev, updates, after: next };
}

function dvConverged(a: DVTable, b: DVTable): boolean {
  for (const x of Object.keys(a)) {
    for (const y of Object.keys(a[x])) {
      if (a[x][y].dist !== b[x][y].dist) return false;
    }
  }
  return true;
}

// ============================================================
// LS-steg-skript
// ============================================================

type LsStep = {
  title: string;
  description: string;
  highlightLinks?: { a: string; b: string }[];
  highlightNodes?: { id: string; mode: NonNullable<RouterNodeData["highlight"]> }[];
  badges?: Record<string, string>;
};

const LS_STEPS: LsStep[] = [
  {
    title: "1. Hello-pakker oppdager naboer",
    description:
      "Hver ruter sender en Hello-melding på alle sine lenker (typisk hvert 10 s i OSPF). Når naboen svarer, registreres lenken og målt kost lagres lokalt. Alle 5 rutere finner ut hvem de er direkte koblet til.",
    highlightLinks: LINKS.map((l) => ({ a: l.a, b: l.b })),
    badges: { A: "hello", B: "hello", C: "hello", D: "hello", E: "hello" },
  },
  {
    title: "2. A flooder en LSA — «mine lenker er ...»",
    description:
      "Ruter A pakker sine 3 lenker (A-B kost 2, A-C kost 7, A-E kost 2) i en Link State Advertisement og sender den ut på alle sine porter. Hver mottaker forwarder LSA-en videre på alle sine porter unntatt den den kom fra. Slik flommer LSA-en til hele AS-et — uten at A trenger å vite hvem som er der.",
    highlightLinks: [
      { a: "A", b: "B" },
      { a: "A", b: "C" },
      { a: "A", b: "E" },
    ],
    highlightNodes: [{ id: "A", mode: "source" }],
    badges: { A: "LSA→" },
  },
  {
    title: "3. LSA-en flommer videre — B, C, E forwarder til naboer",
    description:
      "B mottok A sin LSA over A-B-lenken. B forwarder den til C og E. C forwarder til D. Slik når A sin LSA hele AS-et på millisekunder. Sekvensnumre i LSA-en hindrer at gamle versjoner ekko-er tilbake.",
    highlightLinks: [
      { a: "B", b: "C" },
      { a: "B", b: "E" },
      { a: "C", b: "D" },
      { a: "D", b: "E" },
    ],
    highlightNodes: [
      { id: "B", mode: "lsa" },
      { id: "C", mode: "lsa" },
      { id: "D", mode: "lsa" },
      { id: "E", mode: "lsa" },
    ],
  },
  {
    title: "4. Alle ruterne har flooded sine LSA-er — identisk LSDB overalt",
    description:
      "B, C, D, E gjør samme dans som A. Etter at all flooding er ferdig, har hver ruter en lokal LSDB (Link State Database) som er et komplett kart over AS-et: alle noder, alle lenker, alle kostnader. Forutsatt at LSA-ene ikke ble forvansket underveis er LSDB-en identisk i alle rutere.",
    highlightNodes: INIT_NODES.map((n) => ({ id: n.id, mode: "active" as const })),
    badges: { A: "LSDB✓", B: "LSDB✓", C: "LSDB✓", D: "LSDB✓", E: "LSDB✓" },
  },
  {
    title: "5. Hver ruter kjører Dijkstra lokalt — fra seg selv",
    description:
      "Med identisk topologi-kart kjører hver ruter Dijkstras algoritme i CPU og bygger sin egen shortest-path-tree. Sett fra A: A→B=2, A→E=2, A→C=5 (via B), A→D=6 (via C). Resultatet er installert som forwarding-tabell. Fordi alle har samme kart, blir tabellene konsistente — ingen sløyfer.",
    highlightNodes: [{ id: "A", mode: "source" }],
    badges: { A: "Dijkstra", B: "Dijkstra", C: "Dijkstra", D: "Dijkstra", E: "Dijkstra" },
  },
  {
    title: "6. Lenken B-C ryker — A oppdager via flooded LSA",
    description:
      "Plutselig faller B-C-lenken ut. B og C oppdager det via hello-timeout (typisk 40 s default). Begge sender en oppdatert LSA: «min B-C-lenke er borte». LSA-en flommer ut, alle rutere oppdaterer LSDB-en, og kjører Dijkstra på nytt. Konvergens-tid: 100–500 ms etter at deteksjonen er gjort.",
    highlightLinks: [{ a: "B", b: "C" }],
    highlightNodes: [
      { id: "B", mode: "lsa" },
      { id: "C", mode: "lsa" },
    ],
    badges: { B: "LSA: B-C nede", C: "LSA: B-C nede" },
  },
];

// ============================================================
// DV-steg-skript
// ============================================================

type DvStep = {
  title: string;
  description: string;
  highlightLinks?: { a: string; b: string }[];
  highlightNodes?: { id: string; mode: NonNullable<RouterNodeData["highlight"]> }[];
  showTables?: boolean;
};

const DV_STEPS: DvStep[] = [
  {
    title: "1. Init — hver ruter kjenner kun avstanden til direkte naboer",
    description:
      "I starten har hver ruter kun fylt inn raden for «meg selv» (avstand 0) og direkte naboer (kost fra hello-protokollen). Avstand til alle andre noder er ∞. Hver ruter holder altså sin egen distansevektor — én rad per destinasjon.",
    highlightNodes: INIT_NODES.map((n) => ({ id: n.id, mode: "active" as const })),
    showTables: true,
  },
  {
    title: "2. Alle sender sin distansevektor til alle naboer",
    description:
      "I første runde sender hver ruter hele tabellen sin til hver direkte nabo. A sender til B, C, E. B sender til A, C, E. Osv. Hver mottaker kjører Bellman-Ford-likningen: d_x(y) = min over naboer v av c(x,v) + d_v(y). Resultatet er en oppdatert tabell.",
    highlightLinks: LINKS.map((l) => ({ a: l.a, b: l.b })),
    showTables: true,
  },
  {
    title: "3. Andre runde — vektorene utveksles igjen, flere oppdateringer",
    description:
      "Hvis en ruters tabell endret seg i forrige runde, sender den nye vektoren ut. Slik bygges kunnskap om fjerne destinasjoner gradvis. Etter ca. log(diameter) runder konvergerer alle tabellene mot samme stabile tilstand — forutsatt at det ikke skjer noe rart underveis.",
    highlightLinks: LINKS.map((l) => ({ a: l.a, b: l.b })),
    showTables: true,
  },
  {
    title: "4. Konvergens — alle tabeller stabile",
    description:
      "Etter noen runder er ingen oppdateringer lenger nødvendige — alle ruterne har funnet korteste avstand til alle destinasjoner. Forwarding-tabellen er nextHop-kolonnen. Hver ruter «vet» bare hvem den skal sende videre til — ikke hele stien.",
    showTables: true,
  },
  {
    title: "5. Lenken B-C ryker — count-to-infinity-faren",
    description:
      "Når B-C ryker, oppdager B og C det direkte. Men C tror fortsatt at B kan nå A på 2 hopp — informasjon C fikk fra B i forrige runde. C sier nå: «jeg når A på 3 via B!» B mottar dette og tror C kan nå A på 3, så B sier «jeg når A på 4 via C». Avstanden teller oppover — count-to-infinity. RIP setter ∞ = 16 for å begrense skaden.",
    highlightLinks: [{ a: "B", b: "C" }],
    highlightNodes: [
      { id: "B", mode: "stale" },
      { id: "C", mode: "stale" },
    ],
    showTables: true,
  },
];

// ============================================================
// Hovedkomponent
// ============================================================

type Mode = "ls" | "dv";

function FlowInner() {
  const [mode, setMode] = useState<Mode>("ls");
  const [nodes, setNodes, onNodesChange] = useNodesState(INIT_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(buildEdges({}));
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playTimerRef = useRef<number | null>(null);
  const rf = useReactFlow();

  const steps = mode === "ls" ? LS_STEPS : DV_STEPS;
  const step = steps[stepIdx];

  // Auto-fit på første render
  useEffect(() => {
    const t = setTimeout(() => {
      rf.fitView({ padding: 0.15, duration: 0 });
    }, 60);
    return () => clearTimeout(t);
  }, [rf]);

  // Reset stepIdx ved modus-bytte
  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
  }, [mode]);

  // Oppdater edges + nodes basert på step
  useEffect(() => {
    const linkDownNow =
      (mode === "ls" && stepIdx === LS_STEPS.length - 1) ||
      (mode === "dv" && stepIdx === DV_STEPS.length - 1);
    setEdges(
      buildEdges({
        highlight: step.highlightLinks,
        down: linkDownNow ? [{ a: "B", b: "C" }] : [],
      }),
    );
    setNodes((nds) =>
      nds.map((n) => {
        const hi = step.highlightNodes?.find((h) => h.id === n.id);
        const badge = (step as LsStep).badges?.[n.id];
        return {
          ...n,
          data: {
            ...(n.data as RouterNodeData),
            label: n.id,
            highlight: hi?.mode,
            badge,
          },
        };
      }),
    );
  }, [mode, stepIdx, step, setEdges, setNodes]);

  // Auto-play
  useEffect(() => {
    if (!playing) return;
    playTimerRef.current = window.setTimeout(() => {
      if (stepIdx + 1 < steps.length) {
        setStepIdx((i) => i + 1);
      } else {
        setPlaying(false);
      }
    }, 2800);
    return () => {
      if (playTimerRef.current) window.clearTimeout(playTimerRef.current);
    };
  }, [playing, stepIdx, steps.length]);

  // Beregne LS shortest-path-tree fra A (vises i tabell)
  const lsSnaps = useMemo(() => {
    const downLinks =
      mode === "ls" && stepIdx === LS_STEPS.length - 1 ? new Set([key("B", "C")]) : new Set<string>();
    return runDijkstra("A", downLinks);
  }, [mode, stepIdx]);
  const lsFinal = lsSnaps[lsSnaps.length - 1];

  // Beregne DV-tabeller progressivt
  const dvState = useMemo(() => {
    const downLinks = stepIdx >= DV_STEPS.length - 1 ? new Set([key("B", "C")]) : new Set<string>();
    let cur = initDVTables(downLinks);
    const history: DVTable[] = [cur];
    // Antall runder å kjøre = stepIdx (0 = init, 1 = etter 1 runde, ...)
    const roundsToRun = Math.min(stepIdx, 4);
    for (let r = 0; r < roundsToRun; r++) {
      const round = runDVRound(cur, downLinks);
      cur = round.after;
      history.push(cur);
      if (r > 0 && dvConverged(history[history.length - 2], cur)) break;
    }
    return { current: cur, history };
  }, [stepIdx]);

  const reset = () => {
    setStepIdx(0);
    setPlaying(false);
    setNodes(INIT_NODES);
    setTimeout(() => rf.fitView({ padding: 0.15, duration: 200 }), 60);
  };

  const nextStep = () => {
    setStepIdx((i) => Math.min(steps.length - 1, i + 1));
  };
  const prevStep = () => {
    setStepIdx((i) => Math.max(0, i - 1));
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header med modus-bytter */}
      <div className="bg-muted/30 px-4 py-2 border-b border-border flex flex-wrap items-center gap-2">
        <div className="text-sm font-semibold mr-2">Routing-algoritmer — koreografi</div>
        <button
          onClick={() => setMode("ls")}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
            mode === "ls"
              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40"
              : "bg-background border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          <Network className="h-3 w-3" /> LS — Link State (OSPF)
        </button>
        <button
          onClick={() => setMode("dv")}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
            mode === "dv"
              ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40"
              : "bg-background border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          <Radio className="h-3 w-3" /> DV — Distance Vector (RIP)
        </button>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          Steg {stepIdx + 1} / {steps.length}
        </span>
      </div>

      {/* Step-tittel */}
      <div className="bg-background px-4 py-2 border-b border-border text-sm font-medium">
        {step.title}
      </div>

      {/* Flow canvas */}
      <div style={{ height: 380 }} className="relative bg-muted/10">
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
          minZoom={0.4}
          maxZoom={2}
        >
          <Background gap={20} size={1} color="rgb(0 0 0 / 0.05)" />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable position="bottom-right" />
        </ReactFlow>
      </div>

      {/* Step-beskrivelse */}
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
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "Pause" : "Auto"}
        </button>
        <button
          onClick={nextStep}
          disabled={stepIdx === steps.length - 1}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
        >
          Neste <SkipForward className="h-3 w-3" />
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 ml-auto"
          title="Reset alt — også flyttede noder"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>

        {/* Step-prikker */}
        <div className="basis-full flex gap-1 flex-wrap mt-1">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStepIdx(i)}
              className={`h-1.5 w-6 rounded-full ${
                i === stepIdx
                  ? mode === "ls"
                    ? "bg-emerald-500"
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

      {/* Resultat-panel: vis enten LS-tabell (Dijkstra fra A) eller DV-tabell */}
      <div className="px-4 py-3 border-t border-border bg-background">
        {mode === "ls" ? <LsResultPanel snap={lsFinal} /> : <DvResultPanel table={dvState.current} />}
      </div>

      {/* Pedagogisk legend */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" /> source/Dijkstra
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500" /> LSA / aktiv lenke
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-purple-500" /> stale/feil info
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500" /> NEDE
        </span>
        <span className="ml-auto">Dra noder · scroll for zoom</span>
      </div>
    </div>
  );
}

// ============================================================
// Resultat-paneler
// ============================================================

function LsResultPanel({ snap }: { snap: DijkstraSnapshot }) {
  const allNodes = INIT_NODES.map((n) => n.id);
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        LS-resultat — Dijkstras shortest-path-tree fra A
      </div>
      <div className="overflow-x-auto">
        <table className="text-xs font-mono w-full">
          <thead>
            <tr className="text-muted-foreground">
              <th className="text-left py-1 pr-2">Dest</th>
              <th className="text-left py-1 px-2">D(dest)</th>
              <th className="text-left py-1 px-2">p(dest)</th>
              <th className="text-left py-1 px-2">Sti</th>
            </tr>
          </thead>
          <tbody>
            {allNodes.map((n) => {
              const d = snap.D[n];
              const p = snap.P[n];
              const path = reconstructPath(n, snap.P);
              return (
                <tr key={n} className="border-t border-border/50">
                  <td className="py-1 pr-2 font-bold">{n}</td>
                  <td className="py-1 px-2">{d === Infinity ? "∞" : d}</td>
                  <td className="py-1 px-2">{p ?? "—"}</td>
                  <td className="py-1 px-2 text-muted-foreground">{path.join(" → ")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function reconstructPath(target: string, P: Record<string, string | null>): string[] {
  const path: string[] = [];
  let cur: string | null = target;
  while (cur) {
    path.unshift(cur);
    cur = P[cur];
  }
  return path;
}

function DvResultPanel({ table }: { table: DVTable }) {
  const allNodes = INIT_NODES.map((n) => n.id);
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        DV-resultat — hver ruters distansevektor (kost / nextHop)
      </div>
      <div className="overflow-x-auto">
        <table className="text-xs font-mono w-full">
          <thead>
            <tr className="text-muted-foreground">
              <th className="text-left py-1 pr-2">@</th>
              {allNodes.map((d) => (
                <th key={d} className="text-left py-1 px-2">
                  →{d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allNodes.map((x) => (
              <tr key={x} className="border-t border-border/50">
                <td className="py-1 pr-2 font-bold">{x}</td>
                {allNodes.map((y) => {
                  const cell = table[x]?.[y];
                  if (!cell) return <td key={y} className="py-1 px-2">—</td>;
                  if (x === y) {
                    return (
                      <td key={y} className="py-1 px-2 text-muted-foreground">
                        0
                      </td>
                    );
                  }
                  if (cell.dist === Infinity) {
                    return (
                      <td key={y} className="py-1 px-2 text-muted-foreground">
                        ∞
                      </td>
                    );
                  }
                  return (
                    <td key={y} className="py-1 px-2">
                      {cell.dist}
                      <span className="text-muted-foreground">/{cell.nextHop ?? "—"}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// Export wrapper
// ============================================================

export function Section51Live() {
  return (
    <ReactFlowProvider>
      <FlowInner />
    </ReactFlowProvider>
  );
}
