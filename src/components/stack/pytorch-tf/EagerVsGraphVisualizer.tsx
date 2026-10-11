import { useEffect, useMemo, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// EagerVsGraphVisualizer — to paneler side-ved-side som kjører samme kode:
//   eager: hver linje evaluerer umiddelbart (én operasjon → én resultat).
//   graph: linjene bygger først en DAG → kompiler-pass (fuse + plan) →
//          så raskere kjøring per kall.
//
// Vi simulerer relative kostnader: eager = K ops × 0.5 ms/op uten fusjon;
// graph = 80 ms kompilering EN GANG + 0.2 ms/op (fusjonert) på påfølgende kall.
// Brytepunkt rundt N kall vises som krysning av total-tid.
// --------------------------------------------------------------------------

const CODE_LINES = [
  { op: "a = x.matmul(W1)", kind: "matmul" },
  { op: "b = a + b1", kind: "add" },
  { op: "c = b.relu()", kind: "relu" },
  { op: "d = c.matmul(W2)", kind: "matmul" },
  { op: "e = d + b2", kind: "add" },
  { op: "out = e.softmax(-1)", kind: "softmax" },
];

const EAGER_PER_OP_MS = 0.5;
const GRAPH_COMPILE_MS = 80;
const GRAPH_PER_OP_MS = 0.18; // fused

export function EagerVsGraphVisualizer() {
  const [eagerStep, setEagerStep] = useState(0); // -1 ferdig
  const [graphStep, setGraphStep] = useState(-1); // -1 ikke startet, 0..N kompiler-bygging, N=fuse, N+1+ = exec
  const [graphPhase, setGraphPhase] = useState<"idle" | "build" | "compile" | "exec" | "done">("idle");
  const [calls, setCalls] = useState(1);
  const [running, setRunning] = useState(false);
  const rafRef = useRef<number | null>(null);
  const tEager = useRef(0);
  const tGraph = useRef(0);

  const N = CODE_LINES.length;

  // Brytepunkt: N_calls hvor graph blir billigere enn eager (per total).
  const breakEven = useMemo(() => {
    // eager: calls * N * eager_per_op
    // graph: compile + calls * N * graph_per_op
    // eq: calls * N * (E - G) = compile  →  calls = compile / (N*(E-G))
    return Math.ceil(GRAPH_COMPILE_MS / (N * (EAGER_PER_OP_MS - GRAPH_PER_OP_MS)));
  }, [N]);

  const totalEager = calls * N * EAGER_PER_OP_MS;
  const totalGraph = GRAPH_COMPILE_MS + calls * N * GRAPH_PER_OP_MS;
  const speedup = totalEager / totalGraph;

  // Sim-runner — animerer med rAF
  useEffect(() => {
    if (!running) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      return;
    }
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(60, now - last);
      last = now;
      // Skala: 1 ekte ms = 8 sim-ms (så hele runs visualiseres på ca 1-2s)
      const sim = dt * 0.7;
      tEager.current += sim;
      tGraph.current += sim;

      // Eager: step += sim / eager_per_op
      const newEager = Math.floor(tEager.current / EAGER_PER_OP_MS);
      setEagerStep(Math.min(newEager, N));

      // Graph: faser
      if (graphPhase === "build" && tGraph.current >= N * 6) {
        setGraphPhase("compile");
        tGraph.current = 0;
      } else if (graphPhase === "compile" && tGraph.current >= GRAPH_COMPILE_MS * 0.6) {
        setGraphPhase("exec");
        tGraph.current = 0;
      } else if (graphPhase === "exec") {
        const stepIdx = Math.floor(tGraph.current / GRAPH_PER_OP_MS);
        setGraphStep(Math.min(stepIdx, N));
        if (stepIdx >= N) {
          setGraphPhase("done");
        }
      }

      const eagerDone = newEager >= N;
      const graphDone = graphPhase === "done";
      if (!eagerDone || !graphDone) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setRunning(false);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, graphPhase]);

  const runOnce = () => {
    setEagerStep(0);
    setGraphStep(-1);
    setGraphPhase("build");
    tEager.current = 0;
    tGraph.current = 0;
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setEagerStep(0);
    setGraphStep(-1);
    setGraphPhase("idle");
    tEager.current = 0;
    tGraph.current = 0;
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
        <button
          onClick={runOnce}
          disabled={running}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1 disabled:opacity-40"
        >
          <Play className="h-3.5 w-3.5" /> Kjør én iterasjon
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-muted-foreground">antall kall</span>
          <input
            type="range"
            min={1}
            max={1000}
            step={1}
            value={calls}
            onChange={(e) => setCalls(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="font-mono w-12 text-right">{calls}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Eager */}
        <div className="rounded-lg border border-sky-400/40 bg-sky-400/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-sky-500 font-mono">Eager mode</div>
            <div className="text-[10px] text-muted-foreground font-mono">define-by-run</div>
          </div>
          <div className="space-y-1 font-mono text-xs">
            {CODE_LINES.map((line, i) => {
              const done = i < eagerStep;
              const active = i === eagerStep - 1;
              return (
                <div
                  key={i}
                  className={
                    "rounded px-2 py-1 transition-colors " +
                    (active
                      ? "bg-sky-400/25 text-sky-600"
                      : done
                      ? "bg-sky-400/10 text-foreground/80"
                      : "text-muted-foreground/60")
                  }
                >
                  <span className="text-[10px] mr-2 text-muted-foreground">{(i + 1).toString().padStart(2)}</span>
                  {line.op}
                  {done && <span className="ml-2 text-[10px] text-muted-foreground">→ {EAGER_PER_OP_MS}ms</span>}
                </div>
              );
            })}
          </div>
          <div className="mt-2 rounded border border-border bg-background/50 p-2 text-[11px]">
            <div>
              Hver linje kjører umiddelbart. Du kan{" "}
              <code className="text-foreground">print(a.shape)</code> mellom dem,
              sette breakpoints, bruke <code>pdb</code>. Ingen mystikk.
            </div>
            <div className="mt-1 font-mono text-muted-foreground">
              N·{EAGER_PER_OP_MS}ms/op = <span className="text-sky-500">{(N * EAGER_PER_OP_MS).toFixed(1)}ms</span> per kall
            </div>
          </div>
        </div>

        {/* Graph */}
        <div className="rounded-lg border border-pink-400/40 bg-pink-400/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-pink-500 font-mono">Graph mode</div>
            <div className="text-[10px] text-muted-foreground font-mono">
              torch.compile / tf.function
            </div>
          </div>
          {/* Fase 1: build (tegne DAG) */}
          <div className="mb-2">
            <div className="text-[10px] text-muted-foreground mb-1">
              {graphPhase === "idle"
                ? "Klar — trykk «Kjør»"
                : graphPhase === "build"
                ? "1. Tracing — bygger DAG fra koden..."
                : graphPhase === "compile"
                ? "2. Compile — fuse ops, plan kernel-launches..."
                : graphPhase === "exec"
                ? "3. Execute — fused kernels kjører raskt"
                : "Ferdig"}
            </div>
            <svg viewBox="0 0 320 78" className="w-full h-20">
              {/* Op-boksene */}
              {CODE_LINES.map((line, i) => {
                const builtIn = graphPhase !== "idle" && graphPhase !== "build" ? true : i < Math.floor((tGraph.current / 6));
                const compiled = graphPhase === "compile" || graphPhase === "exec" || graphPhase === "done";
                const execActive = graphPhase === "exec" && i === graphStep - 1;
                const execDone = graphPhase === "done" || (graphPhase === "exec" && i < graphStep);
                const fill = !builtIn
                  ? "rgb(148,163,184)"
                  : execDone
                  ? "rgb(34,197,94)"
                  : execActive
                  ? "rgb(244,114,182)"
                  : compiled
                  ? "rgb(168,85,247)"
                  : "rgb(244,114,182)";
                const cx = 30 + i * 45;
                return (
                  <g key={i}>
                    <rect
                      x={cx - 16}
                      y={30}
                      width={32}
                      height={20}
                      rx={3}
                      fill={fill}
                      fillOpacity={builtIn ? 0.85 : 0.2}
                      stroke="currentColor"
                      strokeOpacity={0.4}
                    />
                    <text x={cx} y={43} textAnchor="middle" fontSize={9} className="font-mono" fill="rgb(15,23,42)">
                      {line.kind}
                    </text>
                    {i < CODE_LINES.length - 1 && (
                      <line
                        x1={cx + 16}
                        x2={cx + 45 - 16}
                        y1={40}
                        y2={40}
                        stroke="currentColor"
                        strokeOpacity={builtIn && i < CODE_LINES.length - 1 ? 0.6 : 0.2}
                        markerEnd="url(#arrowg)"
                      />
                    )}
                  </g>
                );
              })}
              {/* Fusjons-bracket når kompilert */}
              {(graphPhase === "compile" || graphPhase === "exec" || graphPhase === "done") && (
                <g>
                  <path
                    d={`M 14 60 L 14 68 L ${30 + 5 * 45 + 16} 68 L ${30 + 5 * 45 + 16} 60`}
                    fill="none"
                    stroke="rgb(168,85,247)"
                    strokeWidth={1.2}
                  />
                  <text
                    x={(14 + 30 + 5 * 45 + 16) / 2}
                    y={77}
                    textAnchor="middle"
                    fontSize={9}
                    fill="rgb(168,85,247)"
                    className="font-mono"
                  >
                    fused kernel
                  </text>
                </g>
              )}
              <defs>
                <marker id="arrowg" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" fillOpacity={0.5} />
                </marker>
              </defs>
            </svg>
          </div>
          <div className="rounded border border-border bg-background/50 p-2 text-[11px]">
            <div>
              Først tracing av DAG (engang), så compile fuser kompatible ops, så
              kjøres optimalisert versjon på alle påfølgende kall.
            </div>
            <div className="mt-1 font-mono text-muted-foreground">
              compile = <span className="text-pink-500">{GRAPH_COMPILE_MS}ms</span> · per kall ={" "}
              <span className="text-pink-500">{(N * GRAPH_PER_OP_MS).toFixed(1)}ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total-tid + speedup */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="rounded-md border border-sky-400/40 bg-sky-400/5 p-2">
          <div className="text-[10px] text-muted-foreground font-mono">eager-totalt for {calls} kall</div>
          <div className="font-mono text-base text-sky-500">{totalEager.toFixed(0)}ms</div>
        </div>
        <div className="rounded-md border border-pink-400/40 bg-pink-400/5 p-2">
          <div className="text-[10px] text-muted-foreground font-mono">graph-totalt for {calls} kall</div>
          <div className="font-mono text-base text-pink-500">{totalGraph.toFixed(0)}ms</div>
        </div>
        <div
          className={
            "rounded-md border p-2 " +
            (speedup > 1
              ? "border-emerald-400/40 bg-emerald-400/5"
              : "border-amber-400/40 bg-amber-400/5")
          }
        >
          <div className="text-[10px] text-muted-foreground font-mono">
            speedup (graph / eager)
          </div>
          <div
            className={
              "font-mono text-base " +
              (speedup > 1 ? "text-emerald-500" : "text-amber-500")
            }
          >
            {speedup.toFixed(2)}× {speedup < 1 && "(eager raskere)"}
          </div>
        </div>
      </div>

      {/* Forklaring */}
      <div className="mt-3 text-xs text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Hva å se etter:</strong> for{" "}
        <span className="font-mono">{calls}</span> kall er{" "}
        {speedup > 1 ? (
          <span>
            graph-mode <span className="font-mono text-emerald-500">{speedup.toFixed(2)}×</span> raskere — den engangs
            kompileringen er nedbetalt.
          </span>
        ) : (
          <span>
            eager-mode raskere fordi kompilerings-kostnaden ikke er nedbetalt enda.
          </span>
        )}{" "}
        Brytepunktet er ved ca <span className="font-mono">{breakEven}</span> kall. Det
        er derfor du bruker <code>torch.compile()</code> på modellen, ikke på enkelt-ops:
        kostnaden betales én gang, gevinsten kommer over millioner av forward-pass i
        treningen.
      </div>
    </div>
  );
}
