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
import { RotateCcw } from "lucide-react";

// CellulaViz — fullskala interaktiv for 7.3, bygget på @xyflow/react.
//
// Heksagonalt cellenett med frekvensgjenbruk 1/3. Brukeren kan:
//   • dra mobilen mellom celler (overlay-lag over flow-canvas)
//   • dra basestasjonene rundt for å eksperimentere med layout
//   • zoome/panorere hele diagrammet
//
// Pedagogisk: signal faller med 1/r², beste BS vinner, krysning av celle-
// grenser trigger håndover.

const CELL_R = 70; // omkrets-radius

type CellData = {
  id: string;
  groupId: 1 | 2 | 3;
  isBest?: boolean;
  isSecond?: boolean;
};

const GROUP_COLOR: Record<1 | 2 | 3, string> = {
  1: "#3b82f6",
  2: "#10b981",
  3: "#f59e0b",
};

// ---------- Build hexagonal grid ----------

function buildCells(): Node<CellData>[] {
  const w = Math.sqrt(3) * CELL_R;
  const h = 1.5 * CELL_R;
  const startX = 60;
  const startY = 60;
  const out: Node<CellData>[] = [];
  let i = 0;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const offset = row % 2 === 0 ? 0 : w / 2;
      const cx = startX + col * w + offset;
      const cy = startY + row * h;
      const groupId = (((row * 2 + col) % 3) + 1) as 1 | 2 | 3;
      out.push({
        id: `c${i}`,
        type: "cell",
        position: { x: cx, y: cy },
        data: { id: `c${i}`, groupId },
        draggable: true,
      });
      i++;
    }
  }
  return out;
}

// ---------- Custom node: hexagonal cell ----------

function CellNode({ data }: NodeProps) {
  const d = data as CellData;
  const color = GROUP_COLOR[d.groupId];
  const r = CELL_R;
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    pts.push(`${r + r * Math.cos(a)},${r + r * Math.sin(a)}`);
  }
  return (
    <div style={{ width: r * 2, height: r * 2, position: "relative" }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <svg width={r * 2} height={r * 2} style={{ position: "absolute", inset: 0 }}>
        <polygon
          points={pts.join(" ")}
          fill={color}
          fillOpacity={d.isBest ? 0.28 : 0.1}
          stroke={color}
          strokeWidth={d.isBest ? 2.5 : 1.2}
          strokeOpacity={d.isBest ? 0.95 : 0.55}
        />
        {/* basestasjon i sentrum */}
        <g transform={`translate(${r},${r})`}>
          <circle r={7} fill={color} stroke="white" strokeWidth={1.5} />
          <line x1={0} y1={-12} x2={0} y2={-7} stroke={color} strokeWidth={2} />
          <path d="M -8 -16 Q 0 -22 8 -16" fill="none" stroke={color} strokeWidth={1.5} />
        </g>
        <text
          x={r}
          y={r + 26}
          fontSize={10}
          fill="currentColor"
          opacity={d.isBest ? 0.95 : 0.55}
          textAnchor="middle"
          fontWeight={d.isBest ? "bold" : "normal"}
        >
          BS-{d.id.slice(1)} · f{d.groupId}
          {d.isSecond ? " (2.)" : ""}
        </text>
      </svg>
    </div>
  );
}

const nodeTypes = { cell: CellNode };

// ---------- Signal-modell ----------

function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x1 - x2, y1 - y2);
}
function signal(userX: number, userY: number, cellX: number, cellY: number) {
  const d = dist(userX, userY, cellX, cellY);
  return 1 / (1 + (d / 30) ** 2);
}

// ---------- Hovedkomponent ----------

function FlowInner() {
  const initial = useMemo(() => buildCells(), []);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial);
  const edges: Edge[] = useMemo(() => [], []);
  const [user, setUser] = useState({ x: 220, y: 200 });
  const draggingRef = useRef(false);
  const [moveCount, setMoveCount] = useState(0);
  const [handovers, setHandovers] = useState<{ from: string; to: string; at: number }[]>([]);
  const lastBestRef = useRef<string | null>(null);
  const rfWrapperRef = useRef<HTMLDivElement | null>(null);
  const rf = useReactFlow();
  const [vpTick, setVpTick] = useState(0);

  // Polling-trigger så overlay følger zoom/pan
  useEffect(() => {
    const id = setInterval(() => setVpTick((t) => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  // Signal per celle basert på nåværende node-posisjoner
  const signals = useMemo(() => {
    return nodes
      .map((n) => {
        const cx = n.position.x + CELL_R;
        const cy = n.position.y + CELL_R;
        return { id: n.id, groupId: (n.data as CellData).groupId, s: signal(user.x, user.y, cx, cy) };
      })
      .sort((a, b) => b.s - a.s);
  }, [nodes, user.x, user.y]);

  const best = signals[0];
  const second = signals[1];

  // Oppdater best/2.-flagg på nodene
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        const d = n.data as CellData;
        const isBest = n.id === best?.id;
        const isSecond = n.id === second?.id;
        if (d.isBest === isBest && d.isSecond === isSecond) return n;
        return { ...n, data: { ...d, isBest, isSecond } };
      }),
    );
  }, [best?.id, second?.id, setNodes]);

  // Logg håndover
  useEffect(() => {
    if (!best) return;
    const prev = lastBestRef.current;
    if (prev && prev !== best.id) {
      const from = prev;
      const to = best.id;
      setHandovers((h) => [{ from, to, at: moveCount }, ...h].slice(0, 6));
    }
    lastBestRef.current = best.id;
  }, [best?.id, moveCount]);

  const reset = () => {
    setNodes(initial);
    setUser({ x: 220, y: 200 });
    setHandovers([]);
    setMoveCount(0);
    lastBestRef.current = null;
  };

  // Mobil-drag i flow-koordinater
  const onMobilePointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    e.stopPropagation();
  };
  const onMobilePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || !rfWrapperRef.current) return;
    const rect = rfWrapperRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const vp = rf.getViewport();
    const flowX = (screenX - vp.x) / vp.zoom;
    const flowY = (screenY - vp.y) / vp.zoom;
    setUser({ x: flowX, y: flowY });
    setMoveCount((c) => c + 1);
  };
  const onMobilePointerUp = () => {
    draggingRef.current = false;
  };

  // Skjerm-koordinater for overlays
  const vp = rf.getViewport();
  void vpTick; // få komponenten til å re-rendere
  const mobileScreenX = user.x * vp.zoom + vp.x;
  const mobileScreenY = user.y * vp.zoom + vp.y;
  const bestNode = nodes.find((n) => n.id === best?.id);
  const bestScreen = bestNode
    ? {
        x: (bestNode.position.x + CELL_R) * vp.zoom + vp.x,
        y: (bestNode.position.y + CELL_R) * vp.zoom + vp.y,
      }
    : null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold">CellulaViz — celler, signal og håndover</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dra mobilen rundt. Dra også basestasjonene for å eksperimentere. Zoom og panorer
            diagrammet med musen.
          </p>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 px-2 py-1.5 text-xs rounded border border-border hover:bg-muted"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Flow + overlay */}
      <div
        ref={rfWrapperRef}
        style={{ height: 420 }}
        className="relative rounded-md border border-border bg-background overflow-hidden"
        onPointerMove={onMobilePointerMove}
        onPointerUp={onMobilePointerUp}
        onPointerCancel={onMobilePointerUp}
      >
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          proOptions={{ hideAttribution: true }}
          nodesConnectable={false}
        >
          <Background gap={20} size={1} color="rgb(0 0 0 / 0.05)" />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(n) => GROUP_COLOR[(n.data as CellData).groupId]}
            pannable
            zoomable
            position="bottom-right"
          />
        </ReactFlow>

        {/* Aktiv linje fra mobil til beste BS */}
        {bestScreen && bestNode && (
          <svg
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 5,
            }}
            width="100%"
            height="100%"
          >
            <line
              x1={mobileScreenX}
              y1={mobileScreenY}
              x2={bestScreen.x}
              y2={bestScreen.y}
              stroke={GROUP_COLOR[(bestNode.data as CellData).groupId]}
              strokeWidth={2}
              strokeDasharray="4 3"
              opacity={0.7}
            />
          </svg>
        )}

        {/* Mobile (drag-target) */}
        <div
          onPointerDown={onMobilePointerDown}
          style={{
            position: "absolute",
            left: mobileScreenX,
            top: mobileScreenY,
            transform: "translate(-50%, -50%)",
            cursor: "grab",
            zIndex: 6,
            userSelect: "none",
            touchAction: "none",
          } as CSSProperties}
        >
          <div
            style={{
              width: 22 * vp.zoom,
              height: 32 * vp.zoom,
              background: "#111827",
              borderRadius: 4 * vp.zoom,
              padding: 2 * vp.zoom,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              border: "2px solid white",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "#3b82f6",
                borderRadius: 2 * vp.zoom,
              }}
            />
          </div>
        </div>
      </div>

      {/* Signal-tabell + håndover-logg */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md border border-border p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Signalstyrke (top 4)
          </div>
          <div className="space-y-1.5">
            {signals.slice(0, 4).map(({ id, groupId, s }, i) => (
              <div key={id} className="flex items-center gap-2 text-xs">
                <span
                  className="inline-block h-2.5 w-2.5 rounded"
                  style={{ background: GROUP_COLOR[groupId] }}
                />
                <span className="w-16 font-mono">BS-{id.slice(1)}</span>
                <div className="flex-1 h-2 rounded bg-muted overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${s * 100}%`,
                      background: GROUP_COLOR[groupId],
                      opacity: i === 0 ? 1 : 0.5,
                    }}
                  />
                </div>
                <span className="w-12 text-right font-mono tabular-nums">
                  {(s * 100).toFixed(0)}%
                </span>
                {i === 0 && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    AKTIV
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-border p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Håndover-logg
          </div>
          {handovers.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              Ingen håndover ennå. Dra mobilen over en cellegrense.
            </p>
          ) : (
            <ul className="space-y-1 text-xs font-mono">
              {handovers.map((h, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-muted-foreground">#{h.at}</span>
                  <span>BS-{h.from.slice(1)}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-semibold">BS-{h.to.slice(1)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Frekvensgjenbruk-forklaring */}
      <details className="rounded-md border border-dashed border-border p-3">
        <summary className="text-sm font-medium cursor-pointer">
          Hvorfor har naboceller forskjellig farge (f1/f2/f3)?
        </summary>
        <div className="mt-2 text-sm space-y-2 text-muted-foreground">
          <p>
            Hvis to nabo-basestasjoner brukte samme frekvens, ville signalene deres rote til
            hverandre nær cellegrensen. Løsningen er <strong>frekvensgjenbruk</strong>: hele
            spektrumet deles i N grupper (her N=3), og du sørger for at ingen nabo har samme
            gruppe. Lenger ute kan f1 brukes på nytt — for da er den første f1-stasjonen så langt
            unna at signalet er for svakt til å forstyrre.
          </p>
          <p>
            I praksis: 4G/5G bruker bredbåndige OFDMA-skjemaer der det ikke er rene «kanaler» men
            «ressurs-blokker», men prinsippet er det samme — sektorer og frekvensbånd planlegges så
            naboceller ikke kolliderer.
          </p>
        </div>
      </details>
    </div>
  );
}

export function CellulaViz() {
  return (
    <ReactFlowProvider>
      <FlowInner />
    </ReactFlowProvider>
  );
}
