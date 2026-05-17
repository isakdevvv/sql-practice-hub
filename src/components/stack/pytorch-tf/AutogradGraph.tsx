import { useMemo, useState } from "react";
import { ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// AutogradGraph — interaktiv beregningsgraf for L = (w·x − t)².
// Studenten klikker seg gjennom forward-pass (verdier fyller noder) og
// backward-pass (gradienter strømmer baklengs langs kantene via kjerne-
// regelen). Viser at backprop ikke er magi — bare lokal-derivat × innkommende
// gradient i hver node.
// --------------------------------------------------------------------------

type Phase =
  // forward
  | 0 // tom — bare leaves har verdier
  | 1 // y = w·x
  | 2 // r = y − t
  | 3 // L = r²
  // backward
  | 4 // dL/dL = 1
  | 5 // dL/dr = 2r
  | 6 // dL/dy = dL/dr · 1
  | 7; // dL/dw = dL/dy · x   (også dL/dt = −dL/dy, men t krever ikke grad)

const SVG_W = 560;
const SVG_H = 260;

// Node-posisjoner
const POS = {
  w: { x: 60, y: 60, label: "w", kind: "leaf" as const },
  x: { x: 60, y: 130, label: "x", kind: "leaf" as const },
  t: { x: 60, y: 200, label: "t", kind: "leaf" as const },
  mul: { x: 200, y: 95, label: "·", op: "mul", out: "y" },
  sub: { x: 330, y: 145, label: "−", op: "sub", out: "r" },
  sq: { x: 460, y: 145, label: "²", op: "sq", out: "L" },
};

// Edges: source → target
const EDGES: Array<{ from: keyof typeof POS; to: keyof typeof POS; partial: string }> = [
  { from: "w", to: "mul", partial: "∂y/∂w = x" },
  { from: "x", to: "mul", partial: "∂y/∂x = w" },
  { from: "mul", to: "sub", partial: "∂r/∂y = 1" },
  { from: "t", to: "sub", partial: "∂r/∂t = −1" },
  { from: "sub", to: "sq", partial: "∂L/∂r = 2r" },
];

const STEP_LABELS: Record<Phase, string> = {
  0: "Start — bare leaf-nodene har verdier.",
  1: "Forward: y = w · x",
  2: "Forward: r = y − t",
  3: "Forward: L = r²  (loss ferdig beregnet)",
  4: "Backward: ∂L/∂L = 1  (alltid utgangspunktet)",
  5: "Backward: ∂L/∂r = 2r  (lokal: d(r²)/dr = 2r)",
  6: "Backward: ∂L/∂y = ∂L/∂r · 1 = 2r  (kjerne-regelen)",
  7: "Backward: ∂L/∂w = ∂L/∂y · x = 2r·x  ← dette er .grad",
};

export function AutogradGraph() {
  const [w, setW] = useState(2);
  const [x, setX] = useState(3);
  const [t, setT] = useState(5);
  const [phase, setPhase] = useState<Phase>(0);

  const vals = useMemo(() => {
    const y = w * x;
    const r = y - t;
    const L = r * r;
    return { y, r, L };
  }, [w, x, t]);

  const grads = useMemo(() => {
    const dL_dL = 1;
    const dL_dr = 2 * vals.r;
    const dL_dy = dL_dr * 1;
    const dL_dt = -dL_dr;
    const dL_dw = dL_dy * x;
    const dL_dx = dL_dy * w;
    return { dL_dL, dL_dr, dL_dy, dL_dt, dL_dw, dL_dx };
  }, [vals, w, x]);

  // Hvilke noder har verdi på dette tidspunktet?
  const valActive = (k: keyof typeof POS): string | null => {
    if (k === "w") return w.toFixed(1);
    if (k === "x") return x.toFixed(1);
    if (k === "t") return t.toFixed(1);
    if (k === "mul" && phase >= 1) return vals.y.toFixed(1);
    if (k === "sub" && phase >= 2) return vals.r.toFixed(1);
    if (k === "sq" && phase >= 3) return vals.L.toFixed(1);
    return null;
  };

  // Hvilke noder har grad?
  const gradActive = (k: keyof typeof POS): string | null => {
    if (k === "sq" && phase >= 4) return grads.dL_dL.toFixed(1);
    if (k === "sub" && phase >= 5) return grads.dL_dr.toFixed(1);
    if (k === "mul" && phase >= 6) return grads.dL_dy.toFixed(1);
    if (k === "w" && phase >= 7) return grads.dL_dw.toFixed(1);
    return null;
  };

  // Hvilke kanter er "tente" (har forward-flow eller backward-flow)?
  const edgeState = (
    e: { from: keyof typeof POS; to: keyof typeof POS },
  ): "off" | "forward" | "backward" => {
    // Forward
    if (phase >= 1 && (e.from === "w" || e.from === "x") && e.to === "mul") return "forward";
    if (phase >= 2 && (e.from === "mul" || e.from === "t") && e.to === "sub") return "forward";
    if (phase >= 3 && e.from === "sub" && e.to === "sq") return "forward";
    // Backward (override hvis backward har nådd hit)
    if (phase >= 5 && e.from === "sub" && e.to === "sq") return "backward";
    if (phase >= 6 && e.from === "mul" && e.to === "sub") return "backward";
    if (phase >= 7 && (e.from === "w" || e.from === "x") && e.to === "mul") return "backward";
    return "off";
  };

  const isBackwardPhase = phase >= 4;

  const reset = () => setPhase(0);
  const next = () => setPhase((p) => Math.min(7, p + 1) as Phase);
  const prev = () => setPhase((p) => Math.max(0, p - 1) as Phase);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {/* Inputs */}
      <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
        {[
          { id: "w", val: w, set: setW, hint: "requires_grad=True" },
          { id: "x", val: x, set: setX, hint: "input" },
          { id: "t", val: t, set: setT, hint: "target" },
        ].map((field) => (
          <div key={field.id} className="rounded-md border border-border bg-background/40 p-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-semibold">{field.id}</span>
              <span className="text-[10px] text-muted-foreground font-mono">{field.hint}</span>
            </div>
            <input
              type="range"
              min={-5}
              max={8}
              step={1}
              value={field.val}
              onChange={(e) => {
                field.set(parseInt(e.target.value));
                setPhase(0);
              }}
              className="w-full mt-1"
            />
            <div className="font-mono text-center">{field.val.toFixed(1)}</div>
          </div>
        ))}
      </div>

      {/* Phase-kontroll */}
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
        <button
          onClick={prev}
          disabled={phase === 0}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1 disabled:opacity-40"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Tilbake
        </button>
        <button
          onClick={next}
          disabled={phase === 7}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1 disabled:opacity-40"
        >
          Neste <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Start på nytt
        </button>
        <button
          onClick={() => setPhase(3)}
          className="inline-flex items-center gap-1 rounded-md border border-sky-400/60 bg-sky-400/10 hover:bg-sky-400/20 px-2 py-1"
        >
          Hopp til ferdig forward
        </button>
        <button
          onClick={() => setPhase(7)}
          className="inline-flex items-center gap-1 rounded-md border border-pink-400/60 bg-pink-400/10 hover:bg-pink-400/20 px-2 py-1"
        >
          Hopp til ferdig backward
        </button>
        <span className="ml-auto font-mono text-muted-foreground">steg {phase}/7</span>
      </div>

      {/* SVG */}
      <div className="rounded-lg border border-border bg-background/40 overflow-hidden">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto block">
          {/* Edges */}
          {EDGES.map((e, i) => {
            const a = POS[e.from];
            const b = POS[e.to];
            const st = edgeState(e);
            const stroke =
              st === "forward" ? "rgb(56,189,248)" : st === "backward" ? "rgb(244,114,182)" : "currentColor";
            const opacity = st === "off" ? 0.2 : 0.9;
            const width = st === "off" ? 1 : 2.2;
            // beregn midtpunkt for partial-label
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2 - 6;
            return (
              <g key={i}>
                <line
                  x1={a.x + 22}
                  y1={a.y}
                  x2={b.x - 22}
                  y2={b.y}
                  stroke={stroke}
                  strokeOpacity={opacity}
                  strokeWidth={width}
                  markerEnd={st === "backward" ? "url(#arrowback)" : "url(#arrow)"}
                />
                {st !== "off" && (
                  <text
                    x={mx}
                    y={my}
                    textAnchor="middle"
                    fontSize={9}
                    className="fill-muted-foreground font-mono"
                  >
                    {e.partial}
                  </text>
                )}
              </g>
            );
          })}

          {/* Pil-defs */}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgb(56,189,248)" />
            </marker>
            <marker id="arrowback" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgb(244,114,182)" />
            </marker>
          </defs>

          {/* Noder */}
          {(Object.keys(POS) as Array<keyof typeof POS>).map((k) => {
            const p = POS[k];
            const val = valActive(k);
            const grad = gradActive(k);
            const isLeaf = "kind" in p && p.kind === "leaf";
            const fill = isLeaf ? "rgb(148,163,184)" : "rgb(56,189,248)";
            return (
              <g key={k}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={22}
                  fill={fill}
                  fillOpacity={val !== null ? 0.85 : 0.2}
                  stroke="currentColor"
                  strokeOpacity={0.7}
                  strokeWidth={1.2}
                />
                <text
                  x={p.x}
                  y={p.y + 4}
                  textAnchor="middle"
                  fontSize={isLeaf ? 13 : 16}
                  className="font-mono font-semibold"
                  fill="rgb(15,23,42)"
                >
                  {isLeaf ? p.label : p.label}
                </text>
                {/* Output-navn på op-noder */}
                {!isLeaf && "out" in p && (
                  <text x={p.x} y={p.y - 28} textAnchor="middle" fontSize={10} className="fill-muted-foreground font-mono">
                    {p.out}
                  </text>
                )}
                {/* Verdi */}
                {val !== null && (
                  <g>
                    <rect
                      x={p.x - 22}
                      y={p.y + 26}
                      width={44}
                      height={16}
                      rx={3}
                      fill="rgb(56,189,248)"
                      fillOpacity={0.15}
                      stroke="rgb(56,189,248)"
                      strokeOpacity={0.5}
                    />
                    <text x={p.x} y={p.y + 37} textAnchor="middle" fontSize={10} className="font-mono fill-sky-500">
                      ={val}
                    </text>
                  </g>
                )}
                {/* Grad */}
                {grad !== null && (
                  <g>
                    <rect
                      x={p.x - 24}
                      y={p.y + (val !== null ? 44 : 26)}
                      width={48}
                      height={16}
                      rx={3}
                      fill="rgb(244,114,182)"
                      fillOpacity={0.15}
                      stroke="rgb(244,114,182)"
                      strokeOpacity={0.5}
                    />
                    <text
                      x={p.x}
                      y={p.y + (val !== null ? 55 : 37)}
                      textAnchor="middle"
                      fontSize={10}
                      className="font-mono fill-pink-500"
                    >
                      ∇={grad}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Steg-label */}
      <div
        className={
          "mt-3 rounded-md border p-3 text-xs font-mono " +
          (isBackwardPhase
            ? "border-pink-400/40 bg-pink-400/5"
            : "border-sky-400/40 bg-sky-400/5")
        }
      >
        {STEP_LABELS[phase]}
      </div>

      {/* Forklaring */}
      <div className="mt-3 text-xs text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Hva å se etter:</strong> blå piler = forward
        (data strømmer fram, verdier fyller noder). Rosa piler = backward (gradient strømmer
        bak, ∇-tagger fyller noder). Hver kant har en{" "}
        <span className="font-mono">∂node/∂input</span>-etikett — det er den lokale deriverten
        autograd lagrer. Den endelige <span className="font-mono">w.grad</span> er bare
        produktet av alle disse lokale gradienetene langs stien fra L til w. Det er hele
        kjerne-regelen, bare automatisert.
      </div>
    </div>
  );
}
