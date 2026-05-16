import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv visualisering for grafalgoritmer: BFS, DFS, Dijkstra.
// SVG-graf med 8 navngitte noder. Brukeren velger algoritme + startnode,
// trykker Steg eller Spill av. Hver utforsking animerer kø/stack/heap, og
// op-loggen viser hva som skjer i klartekst.
// --------------------------------------------------------------------------

type Algo = "bfs" | "dfs" | "dijkstra";

type NodeId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

interface GraphNode {
  id: NodeId;
  x: number;
  y: number;
}

interface Edge {
  u: NodeId;
  v: NodeId;
  w: number;
}

// 8 noder plassert slik at studenten kan tegne grafen for hånd og
// sammenligne. Posisjoner i et 560×360-koordinatsystem.
const NODES: GraphNode[] = [
  { id: "A", x: 80, y: 60 },
  { id: "B", x: 220, y: 40 },
  { id: "C", x: 360, y: 70 },
  { id: "D", x: 480, y: 150 },
  { id: "E", x: 380, y: 240 },
  { id: "F", x: 230, y: 270 },
  { id: "G", x: 90, y: 200 },
  { id: "H", x: 200, y: 150 },
];

// Sammenhengende, uvektet/vektet kombinasjon. Vekter er små heltall
// slik at Dijkstra-distansene er mulig å regne i hodet.
const EDGES: Edge[] = [
  { u: "A", v: "B", w: 4 },
  { u: "A", v: "G", w: 2 },
  { u: "A", v: "H", w: 5 },
  { u: "B", v: "C", w: 3 },
  { u: "B", v: "H", w: 1 },
  { u: "C", v: "D", w: 2 },
  { u: "C", v: "H", w: 6 },
  { u: "D", v: "E", w: 3 },
  { u: "E", v: "F", w: 2 },
  { u: "E", v: "H", w: 4 },
  { u: "F", v: "G", w: 4 },
  { u: "F", v: "H", w: 3 },
  { u: "G", v: "H", w: 2 },
];

function adjacency(): Record<NodeId, Array<{ to: NodeId; w: number }>> {
  const adj = {} as Record<NodeId, Array<{ to: NodeId; w: number }>>;
  for (const n of NODES) adj[n.id] = [];
  for (const e of EDGES) {
    adj[e.u].push({ to: e.v, w: e.w });
    adj[e.v].push({ to: e.u, w: e.w });
  }
  // Sortér naboer alfabetisk slik at utforskingsordenen er forutsigbar.
  for (const k of Object.keys(adj) as NodeId[]) {
    adj[k].sort((a, b) => a.to.localeCompare(b.to));
  }
  return adj;
}

const ADJ = adjacency();

function edgeKey(u: NodeId, v: NodeId): string {
  return u < v ? `${u}-${v}` : `${v}-${u}`;
}

// --------- Algoritme-tilstand som spilles av steg for steg --------
// Vi forhåndsregner hele "filmen" som en sekvens av Step-objekter.
// Hvert steg har en kort tekst-melding + komplett snapshot av tilstand.

type Step = {
  message: string;
  current: NodeId | null;
  visited: Set<NodeId>;
  /** Aktive container-noder: kø for BFS, stack for DFS, heap for Dijkstra. */
  container: Array<{ id: NodeId; dist?: number }>;
  /** For Dijkstra: nåværende kjente korteste distanser. */
  dist: Partial<Record<NodeId, number>>;
  /** For Dijkstra: ferdigstilte (finaliserte) noder. */
  finalized: Set<NodeId>;
  /** Kanter som har blitt traversert/relaksert — vises i fet. */
  usedEdges: Set<string>;
  /** Forrige steg: noder som var "i container men ikke besøkt" → gul i UI. */
  inContainer: Set<NodeId>;
};

function emptySets(): Pick<Step, "visited" | "finalized" | "usedEdges" | "inContainer"> {
  return {
    visited: new Set<NodeId>(),
    finalized: new Set<NodeId>(),
    usedEdges: new Set<string>(),
    inContainer: new Set<NodeId>(),
  };
}

function planBFS(start: NodeId): Step[] {
  const steps: Step[] = [];
  const visited = new Set<NodeId>([start]);
  const queue: NodeId[] = [start];
  const used = new Set<string>();

  steps.push({
    message: `Start: legg ${start} i køen og marker den som besøkt.`,
    current: null,
    visited: new Set(visited),
    container: queue.map((id) => ({ id })),
    dist: {},
    finalized: new Set(),
    usedEdges: new Set(used),
    inContainer: new Set(queue),
  });

  while (queue.length > 0) {
    const v = queue.shift()!;
    steps.push({
      message: `Ta ut ${v} fra køen (FIFO) — utforsk naboene.`,
      current: v,
      visited: new Set(visited),
      container: queue.map((id) => ({ id })),
      dist: {},
      finalized: new Set(),
      usedEdges: new Set(used),
      inContainer: new Set(queue),
    });
    for (const { to } of ADJ[v]) {
      if (!visited.has(to)) {
        visited.add(to);
        queue.push(to);
        used.add(edgeKey(v, to));
        steps.push({
          message: `Naboen ${to} er ny → marker besøkt og legg bakerst i køen.`,
          current: v,
          visited: new Set(visited),
          container: queue.map((id) => ({ id })),
          dist: {},
          finalized: new Set(),
          usedEdges: new Set(used),
          inContainer: new Set(queue),
        });
      } else {
        steps.push({
          message: `Naboen ${to} er allerede besøkt — hopp over.`,
          current: v,
          visited: new Set(visited),
          container: queue.map((id) => ({ id })),
          dist: {},
          finalized: new Set(),
          usedEdges: new Set(used),
          inContainer: new Set(queue),
        });
      }
    }
  }
  steps.push({
    message: `Ferdig. Køen er tom — alle nåbare noder er besøkt.`,
    current: null,
    visited: new Set(visited),
    container: [],
    dist: {},
    finalized: new Set(),
    usedEdges: new Set(used),
    inContainer: new Set(),
  });
  return steps;
}

function planDFS(start: NodeId): Step[] {
  const steps: Step[] = [];
  const visited = new Set<NodeId>();
  const stack: NodeId[] = [start];
  const used = new Set<string>();
  // Holder rede på «hvilken kant kom vi til denne noden via» for å markere kanten.
  const parentEdge: Partial<Record<NodeId, NodeId>> = {};

  steps.push({
    message: `Start: push ${start} på stacken.`,
    current: null,
    visited: new Set(visited),
    container: stack.map((id) => ({ id })),
    dist: {},
    finalized: new Set(),
    usedEdges: new Set(used),
    inContainer: new Set(stack),
  });

  while (stack.length > 0) {
    const v = stack.pop()!;
    if (visited.has(v)) {
      steps.push({
        message: `Pop ${v} — allerede besøkt, hopp over.`,
        current: null,
        visited: new Set(visited),
        container: stack.map((id) => ({ id })),
        dist: {},
        finalized: new Set(),
        usedEdges: new Set(used),
        inContainer: new Set(stack),
      });
      continue;
    }
    visited.add(v);
    const parent = parentEdge[v];
    if (parent) used.add(edgeKey(parent, v));
    steps.push({
      message: `Pop ${v} fra stacken (LIFO) — marker besøkt, push ubesøkte naboer.`,
      current: v,
      visited: new Set(visited),
      container: stack.map((id) => ({ id })),
      dist: {},
      finalized: new Set(),
      usedEdges: new Set(used),
      inContainer: new Set(stack),
    });
    // Push naboer i omvendt rekkefølge slik at alfabetisk minst utforskes først.
    const neighbors = [...ADJ[v]].reverse();
    for (const { to } of neighbors) {
      if (!visited.has(to)) {
        stack.push(to);
        parentEdge[to] = v;
      }
    }
    steps.push({
      message: `Naboer av ${v} pushet på stacken.`,
      current: v,
      visited: new Set(visited),
      container: stack.map((id) => ({ id })),
      dist: {},
      finalized: new Set(),
      usedEdges: new Set(used),
      inContainer: new Set(stack),
    });
  }
  steps.push({
    message: `Ferdig. Stacken er tom — DFS har utforsket alle nåbare noder.`,
    current: null,
    visited: new Set(visited),
    container: [],
    dist: {},
    finalized: new Set(),
    usedEdges: new Set(used),
    inContainer: new Set(),
  });
  return steps;
}

function planDijkstra(start: NodeId): Step[] {
  const steps: Step[] = [];
  const dist: Partial<Record<NodeId, number>> = {};
  for (const n of NODES) dist[n.id] = Infinity;
  dist[start] = 0;
  const finalized = new Set<NodeId>();
  const used = new Set<string>();
  const parentEdge: Partial<Record<NodeId, NodeId>> = {};
  // Heap som array av (avstand, node). Sorteres på avstand for visning.
  let heap: Array<{ id: NodeId; d: number }> = [{ id: start, d: 0 }];

  const snap = (msg: string, current: NodeId | null) => {
    const sorted = [...heap].sort((a, b) => a.d - b.d || a.id.localeCompare(b.id));
    steps.push({
      message: msg,
      current,
      visited: new Set(finalized),
      container: sorted.map((h) => ({ id: h.id, dist: h.d })),
      dist: { ...dist },
      finalized: new Set(finalized),
      usedEdges: new Set(used),
      inContainer: new Set(sorted.map((h) => h.id)),
    });
  };

  snap(`Start: dist[${start}]=0, alle andre = ∞. Heap: (0, ${start}).`, null);

  while (heap.length > 0) {
    heap.sort((a, b) => a.d - b.d || a.id.localeCompare(b.id));
    const top = heap.shift()!;
    if (finalized.has(top.id)) {
      snap(`Pop (${top.d}, ${top.id}) — allerede ferdigstilt (stale entry), hopp over.`, null);
      continue;
    }
    finalized.add(top.id);
    if (parentEdge[top.id]) used.add(edgeKey(parentEdge[top.id]!, top.id));
    snap(
      `Pop (${top.d}, ${top.id}) — minst avstand i heapen. Marker ${top.id} som ferdigstilt.`,
      top.id,
    );

    for (const { to, w } of ADJ[top.id]) {
      if (finalized.has(to)) continue;
      const ny = top.d + w;
      const cur = dist[to] ?? Infinity;
      if (ny < cur) {
        dist[to] = ny;
        parentEdge[to] = top.id;
        heap.push({ id: to, d: ny });
        snap(
          `Relakser kant ${top.id}–${to} (vekt ${w}): ${cur === Infinity ? "∞" : cur} → ${ny}. Push (${ny}, ${to}) i heapen.`,
          top.id,
        );
      } else {
        snap(
          `Kant ${top.id}–${to} (vekt ${w}): ${top.d}+${w}=${ny} ≥ ${cur} — ingen forbedring.`,
          top.id,
        );
      }
    }
  }
  // Fjern alle stale entries fra heap-visningen til slutt.
  heap = [];
  snap(`Ferdig. Alle korteste avstander er funnet.`, null);
  return steps;
}

function planSteps(algo: Algo, start: NodeId): Step[] {
  if (algo === "bfs") return planBFS(start);
  if (algo === "dfs") return planDFS(start);
  return planDijkstra(start);
}

// ----------------------- KOMPONENT -----------------------

const ALGOS: { id: Algo; label: string; sub: string }[] = [
  { id: "bfs", label: "BFS", sub: "kø · uvektet korteste vei" },
  { id: "dfs", label: "DFS", sub: "stack · dybde-først" },
  { id: "dijkstra", label: "Dijkstra", sub: "min-heap · vektet" },
];

const SPEEDS: { label: string; ms: number }[] = [
  { label: "0.5×", ms: 1600 },
  { label: "1×", ms: 900 },
  { label: "2×", ms: 450 },
];

export function GraphAlgoVisualizer() {
  const [algo, setAlgo] = useState<Algo>("bfs");
  const [start, setStart] = useState<NodeId>("A");
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const timerRef = useRef<number | null>(null);

  const steps = useMemo(() => planSteps(algo, start), [algo, start]);
  const step = steps[Math.min(stepIdx, steps.length - 1)];
  const atEnd = stepIdx >= steps.length - 1;

  // Når algoritme eller startnode endres: nullstill avspilling.
  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
  }, [algo, start]);

  // Auto-play tick.
  useEffect(() => {
    if (!playing) {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    if (atEnd) {
      setPlaying(false);
      return;
    }
    timerRef.current = window.setTimeout(() => {
      setStepIdx((i) => Math.min(i + 1, steps.length - 1));
    }, SPEEDS[speedIdx].ms);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [playing, stepIdx, speedIdx, steps.length, atEnd]);

  const handleStep = () => {
    setPlaying(false);
    setStepIdx((i) => Math.min(i + 1, steps.length - 1));
  };
  const handleReset = () => {
    setPlaying(false);
    setStepIdx(0);
  };

  const containerLabel =
    algo === "bfs" ? "kø (FIFO)" : algo === "dfs" ? "stack (LIFO)" : "min-heap";

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" role="region" aria-label="Interaktiv visualisering: Graf-algoritmer">
      {/* Topp-bar */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Grafalgoritmer — kjør BFS, DFS og Dijkstra steg for steg
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="ga-start" className="text-xs text-muted-foreground">
              Startnode
            </label>
            <select
              id="ga-start"
              value={start}
              onChange={(e) => setStart(e.target.value as NodeId)}
              className="rounded-md border border-border bg-background px-2 py-1 text-sm font-mono"
            >
              {NODES.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.id}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ALGOS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAlgo(a.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                algo === a.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
              title={a.sub}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Graf-SVG */}
      <div className="p-4 bg-background">
        <GraphSVG step={step} showWeights={algo === "dijkstra"} />
      </div>

      {/* Container-strip (kø / stack / heap) */}
      <div className="px-4 py-3 border-t border-border bg-muted/10">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
          {containerLabel}
          {algo === "bfs" && (
            <span className="ml-2 normal-case tracking-normal text-muted-foreground/80">
              ← foran · bak →
            </span>
          )}
          {algo === "dfs" && (
            <span className="ml-2 normal-case tracking-normal text-muted-foreground/80">
              bunn · top →
            </span>
          )}
          {algo === "dijkstra" && (
            <span className="ml-2 normal-case tracking-normal text-muted-foreground/80">
              sortert på (avstand, node)
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 min-h-[34px]">
          {step.container.length === 0 ? (
            <span className="text-xs font-mono text-muted-foreground italic">tom</span>
          ) : (
            step.container.map((c, i) => (
              <span
                key={`${c.id}-${i}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-amber-400/50 bg-amber-400/10 text-amber-700 dark:text-amber-300 font-mono text-xs"
              >
                {algo === "dijkstra" && c.dist !== undefined ? (
                  <>
                    ({c.dist}, <span className="font-semibold">{c.id}</span>)
                  </>
                ) : (
                  <span className="font-semibold">{c.id}</span>
                )}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Distanser (kun Dijkstra) */}
      {algo === "dijkstra" && (
        <div className="px-4 py-3 border-t border-border bg-muted/10">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            dist[] — korteste kjente avstand fra {start}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {NODES.map((n) => {
              const d = step.dist[n.id];
              const fin = step.finalized.has(n.id);
              return (
                <span
                  key={n.id}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border font-mono text-xs ${
                    fin
                      ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300"
                      : "border-border bg-background text-foreground"
                  }`}
                >
                  <span className="font-semibold">{n.id}</span>=
                  {d === undefined || d === Infinity ? "∞" : d}
                  {fin && <span className="text-[9px] uppercase">✓</span>}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Op-logg + kontroller */}
      <div className="px-4 py-3 border-t border-border bg-card">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <button
            type="button"
            onClick={handleStep}
            disabled={atEnd}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-brand/40 text-brand hover:bg-brand/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <SkipForward className="h-3 w-3" />
            Steg
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            disabled={atEnd}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-brand/40 text-brand hover:bg-brand/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {playing ? "Pause" : "Spill av"}
          </button>
          <div className="inline-flex rounded-md border border-border overflow-hidden">
            {SPEEDS.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setSpeedIdx(i)}
                className={`px-2 py-1 text-[11px] font-mono ${
                  speedIdx === i
                    ? "bg-brand text-brand-foreground"
                    : "bg-background hover:bg-muted text-muted-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs text-muted-foreground border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" />
            Tilbakestill
          </button>
          <span className="ml-auto text-[11px] text-muted-foreground font-mono">
            steg {Math.min(stepIdx + 1, steps.length)} / {steps.length}
          </span>
        </div>
        <div className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs font-mono text-foreground/90 min-h-[2.25rem]">
          {step.message}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
          <LegendDot className="bg-card border border-border" label="ubesøkt" />
          <LegendDot className="bg-amber-400/30 border border-amber-400" label="i container" />
          <LegendDot className="bg-emerald-400/30 border border-emerald-400" label={algo === "dijkstra" ? "ferdigstilt" : "besøkt"} />
          <LegendDot className="bg-brand/30 border border-brand" label="aktuell" />
        </div>
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 normal-case tracking-normal">
      <span className={`inline-block w-3 h-3 rounded-full ${className}`} />
      {label}
    </span>
  );
}

// ----------------------- GRAF-SVG -----------------------

function GraphSVG({ step, showWeights }: { step: Step; showWeights: boolean }) {
  const W = 560;
  const H = 320;

  const colorFor = (id: NodeId) => {
    if (step.current === id) return { fill: "var(--brand-tint, rgba(99,102,241,0.25))", stroke: "var(--brand, #6366f1)", text: "var(--brand, #6366f1)" };
    if (step.visited.has(id) || step.finalized.has(id))
      return { fill: "rgba(16,185,129,0.18)", stroke: "rgb(16,185,129)", text: "rgb(5,122,85)" };
    if (step.inContainer.has(id))
      return { fill: "rgba(251,191,36,0.18)", stroke: "rgb(245,158,11)", text: "rgb(180,83,9)" };
    return { fill: "var(--card)", stroke: "var(--border, #d4d4d8)", text: "var(--foreground)" };
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-[640px] h-auto mx-auto"
        role="img"
        aria-label="Graf med 8 noder for algoritme-visualisering"
      >
        {/* Kanter */}
        {EDGES.map((e) => {
          const u = NODES.find((n) => n.id === e.u)!;
          const v = NODES.find((n) => n.id === e.v)!;
          const key = edgeKey(e.u, e.v);
          const used = step.usedEdges.has(key);
          return (
            <g key={key}>
              <line
                x1={u.x}
                y1={u.y}
                x2={v.x}
                y2={v.y}
                stroke={used ? "rgb(16,185,129)" : "currentColor"}
                strokeOpacity={used ? 1 : 0.35}
                strokeWidth={used ? 3 : 1.5}
                className="text-muted-foreground transition-all duration-300"
              />
              {showWeights && (
                <g>
                  <rect
                    x={(u.x + v.x) / 2 - 11}
                    y={(u.y + v.y) / 2 - 9}
                    width={22}
                    height={16}
                    rx={4}
                    className="fill-card stroke-border"
                    strokeWidth={1}
                  />
                  <text
                    x={(u.x + v.x) / 2}
                    y={(u.y + v.y) / 2 + 3}
                    textAnchor="middle"
                    className="fill-foreground text-[10px] font-mono"
                  >
                    {e.w}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Noder */}
        {NODES.map((n) => {
          const c = colorFor(n.id);
          const isCurrent = step.current === n.id;
          return (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r={22}
                fill={c.fill}
                stroke={c.stroke}
                strokeWidth={isCurrent ? 3 : 2}
                style={{ transition: "fill 300ms ease, stroke 300ms ease, stroke-width 300ms ease" }}
              />
              <text
                x={n.x}
                y={n.y + 5}
                textAnchor="middle"
                className="text-[14px] font-mono font-semibold"
                fill={c.text}
                style={{ transition: "fill 300ms ease" }}
              >
                {n.id}
              </text>
              {/* Distanse-label for Dijkstra (over noden). */}
              {showWeights && (
                <text
                  x={n.x}
                  y={n.y - 28}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-muted-foreground"
                >
                  {(() => {
                    const d = step.dist[n.id];
                    if (d === undefined || d === Infinity) return "∞";
                    return String(d);
                  })()}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
