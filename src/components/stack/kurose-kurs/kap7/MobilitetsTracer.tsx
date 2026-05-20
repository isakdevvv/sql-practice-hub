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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Play, RotateCcw, Server, Home, Globe } from "lucide-react";

// MobilitetsTracer — fullskala interaktiv for 7.4, bygget på @xyflow/react.
//
// En pakke reiser fra en "Korrespondent" (f.eks. Teams-server) til en mobil
// host som befinner seg på et fremmed nett. Bruker kan flytte hosten mellom
// hjem-nett og to fremmed-nett, og toggle indirekt (via HA) vs direkte
// (route-optimization) ruting. Noder kan dras rundt; pakke-stien følger.
//
// Pedagogisk hovedpoeng:
//   - hjem-IP står stille selv om hosten flytter seg
//   - HA pakker inn pakker med ny ytre IP = COA (tunneling)
//   - direkte ruting fjerner triangelet, men krever at korrespondenten kjenner COA

type Network = "home" | "fA" | "fB";

const NET_LABEL: Record<Network, string> = {
  home: "Hjem-nett (10.0.0.0/24)",
  fA: "Foreign A (192.168.5.0/24)",
  fB: "Foreign B (192.168.9.0/24)",
};

const COA: Record<Network, string> = {
  home: "10.0.0.15",
  fA: "192.168.5.42",
  fB: "192.168.9.77",
};

const HOME_IP = "10.0.0.15";

type Mode = "indirect" | "direct";
type NodeKind = "correspondent" | "internet" | "ha" | "fa" | "host";

type MobData = {
  label: string;
  sub?: string;
  kind: NodeKind;
};

// Senterposisjon for hver node i flow-koordinater. Vi plasserer flow-noden
// slik at dens *senter* lander her (offsetter med halve node-størrelsen ved
// initialisering).
const CENTER: Record<string, { x: number; y: number }> = {
  correspondent: { x: 60, y: 60 },
  internet: { x: 280, y: 60 },
  ha: { x: 280, y: 200 },
  fa_a: { x: 480, y: 60 },
  fa_b: { x: 480, y: 340 },
  home_host: { x: 280, y: 340 },
  fA_host: { x: 660, y: 60 },
  fB_host: { x: 660, y: 340 },
};

const NODE_SIZE = 64; // px (samme bredde og høyde for rund/host)

const META: Record<string, { label: string; sub?: string; kind: NodeKind }> = {
  correspondent: { label: "Korrespondent", sub: "vg.no · 195.88.55.16", kind: "correspondent" },
  internet: { label: "Internett", kind: "internet" },
  ha: { label: "Home Agent", sub: "10.0.0.1", kind: "ha" },
  fa_a: { label: "Foreign Agent A", sub: "192.168.5.1", kind: "fa" },
  fa_b: { label: "Foreign Agent B", sub: "192.168.9.1", kind: "fa" },
  home_host: { label: "Mobile host @ hjem", sub: HOME_IP, kind: "host" },
  fA_host: { label: "Mobile host @ A", sub: HOME_IP, kind: "host" },
  fB_host: { label: "Mobile host @ B", sub: HOME_IP, kind: "host" },
};

// ---------- Custom noder ----------

function MobNode({ data }: NodeProps) {
  const d = data as MobData;
  const r = NODE_SIZE / 2;
  const isHost = d.kind === "host";
  return (
    <div style={{ width: NODE_SIZE, height: NODE_SIZE + 28, position: "relative" }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="l" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="r" style={{ opacity: 0 }} />
      <svg width={NODE_SIZE} height={NODE_SIZE + 28}>
        <circle cx={r} cy={r} r={18} fill="white" stroke="#374151" strokeWidth={1.5} />
        {isHost ? (
          <rect x={r - 6} y={r - 9} width={12} height={18} fill="#3b82f6" rx={2} />
        ) : d.kind === "correspondent" ? (
          <g transform={`translate(${r - 7},${r - 7})`}>
            <rect x={0} y={2} width={14} height={10} rx={1.5} fill="none" stroke="#374151" strokeWidth={1.5} />
            <line x1={2} y1={5} x2={2.5} y2={5} stroke="#374151" strokeWidth={1.5} />
            <line x1={2} y1={8} x2={2.5} y2={8} stroke="#374151" strokeWidth={1.5} />
          </g>
        ) : d.kind === "internet" ? (
          <g transform={`translate(${r},${r})`}>
            <circle r={7} fill="none" stroke="#374151" strokeWidth={1.5} />
            <ellipse cx={0} cy={0} rx={3} ry={7} fill="none" stroke="#374151" strokeWidth={1} />
            <line x1={-7} y1={0} x2={7} y2={0} stroke="#374151" strokeWidth={1} />
          </g>
        ) : d.kind === "ha" ? (
          <text x={r} y={r + 4} fontSize={11} textAnchor="middle" fontWeight="bold" fill="#111827">
            HA
          </text>
        ) : (
          <text x={r} y={r + 4} fontSize={10} textAnchor="middle" fontWeight="bold" fill="#111827">
            FA
          </text>
        )}
        <text x={r} y={NODE_SIZE - 6} fontSize={9} textAnchor="middle" fontWeight="bold" fill="currentColor">
          {d.label}
        </text>
        {d.sub && (
          <text x={r} y={NODE_SIZE + 6} fontSize={8} textAnchor="middle" opacity={0.6} fill="currentColor">
            {d.sub}
          </text>
        )}
      </svg>
    </div>
  );
}

const nodeTypes = { mob: MobNode };

// ---------- Hjelpefunksjoner ----------

function makeInitialNodes(location: Network): Node<MobData>[] {
  const out: Node<MobData>[] = [];
  for (const [id, meta] of Object.entries(META)) {
    // Skjul host-noder som ikke er aktuelle og FA-noder som ikke er aktuelle
    if (id === "home_host" && location !== "home") continue;
    if (id === "fA_host" && location !== "fA") continue;
    if (id === "fB_host" && location !== "fB") continue;
    if (id === "fa_a" && location === "fB") continue;
    if (id === "fa_b" && location !== "fB") continue;
    const c = CENTER[id];
    out.push({
      id,
      type: "mob",
      position: { x: c.x - NODE_SIZE / 2, y: c.y - NODE_SIZE / 2 },
      data: { label: meta.label, sub: meta.sub, kind: meta.kind },
      draggable: true,
    });
  }
  return out;
}

function nodeCenter(n: Node<MobData>): { x: number; y: number } {
  // Senter er position + halve flow-node størrelse. MobNode er NODE_SIZE bred
  // og NODE_SIZE+28 høy, men "logisk" senter er midten av sirkelen (y = r).
  const r = NODE_SIZE / 2;
  return { x: n.position.x + r, y: n.position.y + r };
}

// ---------- Hovedkomponent ----------

function FlowInner() {
  const [location, setLocation] = useState<Network>("fA");
  const [mode, setMode] = useState<Mode>("indirect");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 langs valgt path
  const rafRef = useRef<number | null>(null);

  const initial = useMemo(() => makeInitialNodes(location), [location]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial);

  // Når location endres må vi laste inn riktige nodes (vis ny host/FA, skjul gamle)
  useEffect(() => {
    setNodes(makeInitialNodes(location));
  }, [location, setNodes]);

  const rf = useReactFlow();
  const rfWrapperRef = useRef<HTMLDivElement | null>(null);
  const [vpTick, setVpTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setVpTick((t) => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  const hostKey = location === "home" ? "home_host" : location === "fA" ? "fA_host" : "fB_host";

  // Bygg path: list av node-IDer som pakken hopper gjennom
  const path = useMemo<string[]>(() => {
    if (location === "home") return ["correspondent", "internet", "ha", "home_host"];
    if (mode === "indirect") {
      return [
        "correspondent",
        "internet",
        "ha",
        location === "fA" ? "fa_a" : "fa_b",
        hostKey,
      ];
    }
    return ["correspondent", "internet", location === "fA" ? "fa_a" : "fa_b", hostKey];
  }, [location, mode, hostKey]);

  // tunneled segments
  const tunneledSegments = useMemo(() => {
    const s = new Set<number>();
    if (location !== "home" && mode === "indirect") {
      const haIdx = path.indexOf("ha");
      const faIdx = path.indexOf(location === "fA" ? "fa_a" : "fa_b");
      if (haIdx >= 0 && faIdx > haIdx) s.add(haIdx);
    }
    return s;
  }, [location, mode, path]);

  // Edges som xyflow-edges (highlightede er aktive path-segmenter)
  const edges: Edge[] = useMemo(() => {
    const out: Edge[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];
      const tun = tunneledSegments.has(i);
      out.push({
        id: `e-${from}-${to}`,
        source: from,
        target: to,
        animated: playing,
        style: {
          stroke: tun ? "#10b981" : "#3b82f6",
          strokeWidth: 2.5,
          strokeDasharray: tun ? "6 3" : undefined,
        },
      });
    }
    return out;
  }, [path, tunneledSegments, playing]);

  // Animasjon
  useEffect(() => {
    if (!playing) return;
    const start = performance.now();
    const dur = 4000;
    const loop = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        setPlaying(false);
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, path.length]);

  // Slå opp gjeldende posisjoner via nodes (slik at drag flytter pakke-stien)
  const nodeById = useMemo(() => {
    const m = new Map<string, Node<MobData>>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

  // Pakke-posisjon i flow-koordinater
  const segCount = Math.max(1, path.length - 1);
  const segIdx = Math.min(segCount - 1, Math.floor(progress * segCount));
  const segLocal = progress * segCount - segIdx;
  const aNode = nodeById.get(path[segIdx]);
  const bNode = nodeById.get(path[segIdx + 1]);
  const a = aNode ? nodeCenter(aNode) : { x: 0, y: 0 };
  const b = bNode ? nodeCenter(bNode) : { x: 0, y: 0 };
  const pxFlow = a.x + (b.x - a.x) * segLocal;
  const pyFlow = a.y + (b.y - a.y) * segLocal;
  const isTunnel = tunneledSegments.has(segIdx);

  // Skjerm-koordinater for pakke-overlay (følger viewport-transform)
  const vp = rf.getViewport();
  void vpTick;
  const pkScreenX = pxFlow * vp.zoom + vp.x;
  const pkScreenY = pyFlow * vp.zoom + vp.y;

  const play = () => {
    setProgress(0);
    setPlaying(true);
  };
  const reset = () => {
    setPlaying(false);
    setProgress(0);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold">MobilitetsTracer — pakker til en host som flytter seg</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Velg hvor mobilen er, og hvordan pakkene skal rute. Spill av og se IP-headerene endre seg
            underveis. Dra nodene rundt og zoom diagrammet.
          </p>
        </div>
        <div className="inline-flex gap-2">
          <button
            onClick={play}
            disabled={playing}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs rounded border border-border hover:bg-muted disabled:opacity-40"
          >
            <Play className="h-3 w-3" /> Send pakke
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs rounded border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      {/* Kontroller */}
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Mobil host er på
          </span>
          <div className="mt-1 inline-flex rounded-md border border-border text-xs w-full">
            {(["home", "fA", "fB"] as Network[]).map((n) => (
              <button
                key={n}
                onClick={() => {
                  setLocation(n);
                  reset();
                }}
                className={`flex-1 px-2 py-1.5 ${
                  location === n ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                } ${n !== "home" ? "border-l border-border" : ""}`}
              >
                {n === "home" ? (
                  <Home className="h-3 w-3 inline" />
                ) : (
                  <Globe className="h-3 w-3 inline" />
                )}{" "}
                {n === "home" ? "Hjem" : n === "fA" ? "Foreign A" : "Foreign B"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Rute-strategi
          </span>
          <div className="mt-1 inline-flex rounded-md border border-border text-xs w-full">
            <button
              onClick={() => {
                setMode("indirect");
                reset();
              }}
              disabled={location === "home"}
              className={`flex-1 px-2 py-1.5 disabled:opacity-40 ${
                mode === "indirect" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              Indirect (via HA)
            </button>
            <button
              onClick={() => {
                setMode("direct");
                reset();
              }}
              disabled={location === "home"}
              className={`flex-1 px-2 py-1.5 border-l border-border disabled:opacity-40 ${
                mode === "direct" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              Direct (route-optimization)
            </button>
          </div>
        </div>
      </div>

      {/* Hovedplot — ReactFlow + pakke-overlay */}
      <div
        ref={rfWrapperRef}
        style={{ height: 420 }}
        className="relative rounded-md border border-border bg-background overflow-hidden"
      >
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          proOptions={{ hideAttribution: true }}
          nodesConnectable={false}
        >
          <Background gap={20} size={1} color="rgb(0 0 0 / 0.05)" />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(n) => {
              const k = (n.data as MobData).kind;
              if (k === "host") return "#3b82f6";
              if (k === "ha") return "#10b981";
              if (k === "fa") return "#f59e0b";
              if (k === "internet") return "#8b5cf6";
              return "#6b7280";
            }}
            pannable
            zoomable
            position="bottom-right"
          />
        </ReactFlow>

        {/* Pakke-overlay (følger viewport) */}
        {progress > 0 && progress < 1 && aNode && bNode && (
          <div
            style={{
              position: "absolute",
              left: pkScreenX,
              top: pkScreenY,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              zIndex: 6,
            } as CSSProperties}
          >
            <svg width={40 * vp.zoom} height={22 * vp.zoom} viewBox="0 0 40 22">
              <rect
                x={2}
                y={1}
                width={36}
                height={20}
                rx={3}
                fill={isTunnel ? "#10b981" : "#3b82f6"}
                stroke="white"
                strokeWidth={1.5}
              />
              <text x={20} y={14} fontSize={8} fill="white" textAnchor="middle" fontWeight="bold">
                PKT
              </text>
              {isTunnel && (
                <rect
                  x={8}
                  y={5}
                  width={24}
                  height={12}
                  rx={2}
                  fill="#3b82f6"
                  fillOpacity={0.9}
                />
              )}
            </svg>
          </div>
        )}
      </div>

      {/* Pakke-headers */}
      <div className="rounded-md border border-border p-3 space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          IP-headere på dette segmentet
        </div>
        {progress === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            Trykk «Send pakke» for å se headerene endre seg underveis.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 text-xs font-mono">
            {isTunnel ? (
              <>
                <div className="rounded border border-emerald-500/40 bg-emerald-500/5 p-2 space-y-0.5">
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Ytre header (tunnel)
                  </div>
                  <div>
                    src: <span className="font-bold">10.0.0.1</span>{" "}
                    <span className="opacity-60">(HA)</span>
                  </div>
                  <div>
                    dst: <span className="font-bold">{COA[location]}</span>{" "}
                    <span className="opacity-60">(COA via FA)</span>
                  </div>
                </div>
                <div className="rounded border border-border bg-muted/30 p-2 space-y-0.5">
                  <div className="font-semibold">Indre header</div>
                  <div>
                    src: <span className="font-bold">195.88.55.16</span>
                  </div>
                  <div>
                    dst: <span className="font-bold">{HOME_IP}</span>{" "}
                    <span className="opacity-60">(hjem-IP)</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded border border-border bg-muted/30 p-2 space-y-0.5 sm:col-span-2">
                <div className="font-semibold">Vanlig IP-header</div>
                <div>
                  src: <span className="font-bold">195.88.55.16</span>{" "}
                  <span className="opacity-60">(korrespondent)</span>
                </div>
                <div>
                  dst:{" "}
                  <span className="font-bold">
                    {mode === "direct" && location !== "home" ? COA[location] : HOME_IP}
                  </span>{" "}
                  <span className="opacity-60">
                    {mode === "direct" && location !== "home"
                      ? "(direkte til COA)"
                      : "(hjem-IP)"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nett-legend */}
      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded" style={{ background: "#3b82f6" }} />
          {NET_LABEL.home.split(" (")[0]}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded" style={{ background: "#f59e0b" }} />
          {NET_LABEL.fA.split(" (")[0]}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded" style={{ background: "#8b5cf6" }} />
          {NET_LABEL.fB.split(" (")[0]}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded" style={{ background: "#10b981" }} />
          Tunnel-segment (HA→FA)
        </span>
      </div>

      {/* Triangelruting-forklaring */}
      <details className="rounded-md border border-dashed border-border p-3">
        <summary className="text-sm font-medium cursor-pointer">
          Triangelruting og hvorfor det er en kostnad
        </summary>
        <div className="mt-2 text-sm space-y-2 text-muted-foreground">
          <p>
            I <strong>indirect</strong>-modus må alle pakker fra korrespondenten først innom Home
            Agent, selv om mobil-hosten geografisk sett er rett ved siden av korrespondenten.
            Pakkene gjør altså en omvei via hjem-nettet. Det er kostnaden for at korrespondenten
            ikke trenger å vite at hosten flytter seg — hosten ser fortsatt sitt eget hjem-IP, og
            TCP-forbindelsen brytes ikke.
          </p>
          <p>
            Bytt til <strong>direct</strong>: Korrespondenten cacher COA og sender rett dit. Ingen
            triangel, men nå må korrespondent-stacken forstå Mobile IP, og pakkene har ny
            destinasjons-IP — hosten må selv stelle med å gjenkjenne at COA og hjem-IP refererer
            samme TCP-forbindelse.
          </p>
          <p>
            I 4G/5G er triangelet skjult lokalt i mobilkjernen: telefonen har et statisk IP eid av
            gatewayen, og en GTP-tunnel oppdateres for hvert celle-bytte uten at korrespondenten
            merker noe.
          </p>
        </div>
      </details>
    </div>
  );
}

export function MobilitetsTracer() {
  return (
    <ReactFlowProvider>
      <FlowInner />
    </ReactFlowProvider>
  );
}
