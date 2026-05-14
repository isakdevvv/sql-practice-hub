import { useEffect, useMemo, useRef, useState } from "react";
import { Tex, TexBlock } from "@/components/Tex";

// Tiny feed-forward net: 2 -> 3 -> 2.
// We animate forward pass (left-to-right pulses on edges) and a one-step
// backprop given a target=1 on output #0.
//
// Math (no external libs):
//   z = W * a + b
//   a = sigma(z)             sigma(x) = 1/(1+e^-x)
//   sigma'(x) = sigma(x) * (1 - sigma(x))
//   L = 1/2 * sum (y - a)^2
//   delta_L = (a - y) * sigma'(z)
//   dW = delta_L * a_prev^T,  db = delta_L
//   delta_l = (W_{l+1}^T delta_{l+1}) * sigma'(z_l)

type Vec = number[];
type Mat = number[][];

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const sigmoidPrime = (x: number) => {
  const s = sigmoid(x);
  return s * (1 - s);
};

// Fixed initial weights — deterministic for predictable demo.
const W1_INIT: Mat = [
  [1.4, -0.9], // hidden node 0
  [-1.1, 1.6], // hidden node 1
  [0.8, 0.7], // hidden node 2
];
const B1_INIT: Vec = [0.1, -0.2, 0.05];
const W2_INIT: Mat = [
  [1.2, -0.8, 0.5], // output node 0
  [-0.6, 1.0, -1.1], // output node 1
];
const B2_INIT: Vec = [0.0, 0.1];

function matVec(W: Mat, x: Vec, b: Vec): Vec {
  return W.map((row, i) => row.reduce((acc, w, j) => acc + w * x[j], b[i]));
}

function applyVec(v: Vec, f: (x: number) => number): Vec {
  return v.map(f);
}

type LayerLayout = { cx: number; cys: number[] };

const LAYOUT = {
  width: 520,
  height: 280,
  input: { cx: 60, cys: [90, 190] },
  hidden: { cx: 260, cys: [55, 140, 225] },
  output: { cx: 460, cys: [105, 175] },
  nodeR: 22,
};

function nodeFill(a: number): string {
  // a is in (0,1) for sigmoid layers, in (0,1) for input.
  // Map activation to blue intensity.
  const v = Math.max(0, Math.min(1, a));
  // Tailwind brand mix-ish: use HSL.
  const alpha = 0.15 + 0.7 * v;
  return `rgba(56, 132, 255, ${alpha.toFixed(3)})`;
}

function edgeStroke(w: number): { color: string; width: number; absW: number } {
  const absW = Math.abs(w);
  const width = 0.6 + Math.min(3.5, absW * 1.8);
  const color = w >= 0 ? "#2563eb" : "#dc2626";
  return { color, width, absW };
}

type Pulse = {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  start: number;
  dur: number;
  kind: "forward" | "backward";
};

export function NeuralNetForwardPass() {
  const [x1, setX1] = useState(0.7);
  const [x2, setX2] = useState(0.3);

  // Weights — mutable so backprop can update them.
  const [W1, setW1] = useState<Mat>(W1_INIT.map((r) => [...r]));
  const [b1, setB1] = useState<Vec>([...B1_INIT]);
  const [W2, setW2] = useState<Mat>(W2_INIT.map((r) => [...r]));
  const [b2, setB2] = useState<Vec>([...B2_INIT]);

  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [animTick, setAnimTick] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timeouts = useRef<number[]>([]);

  // Latest forward pass values (always recomputed from state).
  const fp = useMemo(() => {
    const a0: Vec = [x1, x2];
    const z1 = matVec(W1, a0, b1);
    const a1 = applyVec(z1, sigmoid);
    const z2 = matVec(W2, a1, b2);
    const a2 = applyVec(z2, sigmoid);
    return { a0, z1, a1, z2, a2 };
  }, [x1, x2, W1, b1, W2, b2]);

  const target: Vec = useMemo(() => [1, 0], []);
  const loss = useMemo(() => {
    const { a2 } = fp;
    return 0.5 * (Math.pow(target[0] - a2[0], 2) + Math.pow(target[1] - a2[1], 2));
  }, [fp, target]);

  const [lossBefore, setLossBefore] = useState<number | null>(null);
  const [lossAfter, setLossAfter] = useState<number | null>(null);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      for (const t of timeouts.current) clearTimeout(t);
      timeouts.current = [];
    };
  }, []);

  // Drive RAF while pulses are active.
  useEffect(() => {
    if (pulses.length === 0) return;
    const tick = () => {
      setAnimTick((t) => t + 1);
      const now = performance.now();
      const stillActive = pulses.some((p) => now < p.start + p.dur);
      if (stillActive) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Drop expired pulses.
        setPulses((ps) => ps.filter((p) => performance.now() < p.start + p.dur));
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [pulses]);

  function inputPos(i: number) {
    return { x: LAYOUT.input.cx, y: LAYOUT.input.cys[i] };
  }
  function hiddenPos(i: number) {
    return { x: LAYOUT.hidden.cx, y: LAYOUT.hidden.cys[i] };
  }
  function outputPos(i: number) {
    return { x: LAYOUT.output.cx, y: LAYOUT.output.cys[i] };
  }

  function runForward() {
    // Build pulses input->hidden then hidden->output.
    const now = performance.now();
    const dur = 700;
    const firstWave: Pulse[] = [];
    for (let i = 0; i < W1.length; i++) {
      for (let j = 0; j < W1[i].length; j++) {
        firstWave.push({
          id: `fw1-${i}-${j}-${now}`,
          from: inputPos(j),
          to: hiddenPos(i),
          start: now,
          dur,
          kind: "forward",
        });
      }
    }
    const secondWave: Pulse[] = [];
    for (let i = 0; i < W2.length; i++) {
      for (let j = 0; j < W2[i].length; j++) {
        secondWave.push({
          id: `fw2-${i}-${j}-${now}`,
          from: hiddenPos(j),
          to: outputPos(i),
          start: now + dur,
          dur,
          kind: "forward",
        });
      }
    }
    setPulses([...firstWave, ...secondWave]);
  }

  function runBackprop() {
    setLossBefore(loss);
    setLossAfter(null);

    // Animate backward pulses.
    const now = performance.now();
    const dur = 700;
    const firstWave: Pulse[] = [];
    for (let i = 0; i < W2.length; i++) {
      for (let j = 0; j < W2[i].length; j++) {
        firstWave.push({
          id: `bp2-${i}-${j}-${now}`,
          from: outputPos(i),
          to: hiddenPos(j),
          start: now,
          dur,
          kind: "backward",
        });
      }
    }
    const secondWave: Pulse[] = [];
    for (let i = 0; i < W1.length; i++) {
      for (let j = 0; j < W1[i].length; j++) {
        secondWave.push({
          id: `bp1-${i}-${j}-${now}`,
          from: hiddenPos(i),
          to: inputPos(j),
          start: now + dur,
          dur,
          kind: "backward",
        });
      }
    }
    setPulses([...firstWave, ...secondWave]);

    // Compute one gradient step and apply at end of animation.
    const { a0, z1, a1, z2, a2 } = fp;
    // Output delta: (a - y) * sigma'(z)
    const delta2: Vec = a2.map((aOut, i) => (aOut - target[i]) * sigmoidPrime(z2[i]));
    // Hidden delta: (W2^T delta2) * sigma'(z1)
    const delta1: Vec = z1.map((zHid, i) => {
      let s = 0;
      for (let k = 0; k < W2.length; k++) s += W2[k][i] * delta2[k];
      return s * sigmoidPrime(zHid);
    });
    const lr = 0.8;
    const newW2: Mat = W2.map((row, i) => row.map((w, j) => w - lr * delta2[i] * a1[j]));
    const newB2: Vec = b2.map((bv, i) => bv - lr * delta2[i]);
    const newW1: Mat = W1.map((row, i) => row.map((w, j) => w - lr * delta1[i] * a0[j]));
    const newB1: Vec = b1.map((bv, i) => bv - lr * delta1[i]);

    const totalDur = dur * 2;
    const t = window.setTimeout(() => {
      setW2(newW2);
      setB2(newB2);
      setW1(newW1);
      setB1(newB1);
      // Compute new loss with new weights.
      const z1n = matVec(newW1, a0, newB1);
      const a1n = applyVec(z1n, sigmoid);
      const z2n = matVec(newW2, a1n, newB2);
      const a2n = applyVec(z2n, sigmoid);
      const newLoss =
        0.5 * (Math.pow(target[0] - a2n[0], 2) + Math.pow(target[1] - a2n[1], 2));
      setLossAfter(newLoss);
    }, totalDur);
    timeouts.current.push(t);
  }

  function resetWeights() {
    setW1(W1_INIT.map((r) => [...r]));
    setB1([...B1_INIT]);
    setW2(W2_INIT.map((r) => [...r]));
    setB2([...B2_INIT]);
    setLossBefore(null);
    setLossAfter(null);
    setPulses([]);
  }

  // Active pulse positions for rendering.
  const now = performance.now();
  // We read animTick so render refreshes on each frame.
  void animTick;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Forward pass + backprop — 2&times;3&times;2 nett
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={runForward}
            className="text-xs rounded-md border border-brand bg-brand/10 px-3 py-1.5 text-brand hover:bg-brand/20"
          >
            Forward pass
          </button>
          <button
            type="button"
            onClick={runBackprop}
            className="text-xs rounded-md border border-pink-500/40 bg-pink-500/10 px-3 py-1.5 text-pink-600 dark:text-pink-300 hover:bg-pink-500/20"
          >
            Backprop (target=[1,0])
          </button>
          <button
            type="button"
            onClick={resetWeights}
            className="text-xs rounded-md border border-border bg-background px-3 py-1.5 text-muted-foreground hover:border-brand/40"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_240px]">
        <div className="p-3 bg-background">
          <svg
            viewBox={`0 0 ${LAYOUT.width} ${LAYOUT.height}`}
            className="w-full h-auto"
            role="img"
            aria-label="Nevralt nett med 2 input, 3 skjulte og 2 output"
          >
            {/* Layer labels */}
            <g className="text-[10px]" style={{ fill: "currentColor", opacity: 0.6 }}>
              <text x={LAYOUT.input.cx} y={20} textAnchor="middle">input</text>
              <text x={LAYOUT.hidden.cx} y={20} textAnchor="middle">hidden (sigmoid)</text>
              <text x={LAYOUT.output.cx} y={20} textAnchor="middle">output (sigmoid)</text>
            </g>

            {/* Edges: input -> hidden */}
            {W1.map((row, i) =>
              row.map((w, j) => {
                const a = inputPos(j);
                const b = hiddenPos(i);
                const s = edgeStroke(w);
                return (
                  <line
                    key={`w1-${i}-${j}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={s.color}
                    strokeWidth={s.width}
                    opacity={0.65}
                  />
                );
              }),
            )}
            {/* Edges: hidden -> output */}
            {W2.map((row, i) =>
              row.map((w, j) => {
                const a = hiddenPos(j);
                const b = outputPos(i);
                const s = edgeStroke(w);
                return (
                  <line
                    key={`w2-${i}-${j}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={s.color}
                    strokeWidth={s.width}
                    opacity={0.65}
                  />
                );
              }),
            )}

            {/* Pulses */}
            {pulses.map((p) => {
              const t = (now - p.start) / p.dur;
              if (t < 0 || t > 1) return null;
              const x = p.from.x + (p.to.x - p.from.x) * t;
              const y = p.from.y + (p.to.y - p.from.y) * t;
              const fill = p.kind === "forward" ? "#60a5fa" : "#ec4899";
              return (
                <circle key={p.id} cx={x} cy={y} r={4} fill={fill} opacity={0.95}>
                  <animate attributeName="r" values="3;5;3" dur="0.6s" repeatCount="indefinite" />
                </circle>
              );
            })}

            {/* Input nodes */}
            {[x1, x2].map((v, i) => {
              const p = inputPos(i);
              return (
                <g key={`in-${i}`}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={LAYOUT.nodeR}
                    fill={nodeFill(v)}
                    stroke="currentColor"
                    strokeOpacity={0.4}
                    strokeWidth={1.5}
                  />
                  <text
                    x={p.x}
                    y={p.y + 4}
                    textAnchor="middle"
                    className="text-[10px] font-mono"
                    style={{ fill: "currentColor" }}
                  >
                    {v.toFixed(2)}
                  </text>
                  <text
                    x={p.x - LAYOUT.nodeR - 6}
                    y={p.y + 3}
                    textAnchor="end"
                    className="text-[10px] font-mono"
                    style={{ fill: "currentColor", opacity: 0.6 }}
                  >
                    x{i + 1}
                  </text>
                </g>
              );
            })}

            {/* Hidden nodes */}
            {fp.a1.map((v, i) => {
              const p = hiddenPos(i);
              return (
                <g key={`h-${i}`}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={LAYOUT.nodeR}
                    fill={nodeFill(v)}
                    stroke="currentColor"
                    strokeOpacity={0.4}
                    strokeWidth={1.5}
                  />
                  <text
                    x={p.x}
                    y={p.y + 4}
                    textAnchor="middle"
                    className="text-[10px] font-mono"
                    style={{ fill: "currentColor" }}
                  >
                    {v.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Output nodes */}
            {fp.a2.map((v, i) => {
              const p = outputPos(i);
              return (
                <g key={`o-${i}`}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={LAYOUT.nodeR}
                    fill={nodeFill(v)}
                    stroke="currentColor"
                    strokeOpacity={0.4}
                    strokeWidth={1.5}
                  />
                  <text
                    x={p.x}
                    y={p.y + 4}
                    textAnchor="middle"
                    className="text-[10px] font-mono"
                    style={{ fill: "currentColor" }}
                  >
                    {v.toFixed(2)}
                  </text>
                  <text
                    x={p.x + LAYOUT.nodeR + 8}
                    y={p.y + 3}
                    textAnchor="start"
                    className="text-[10px] font-mono"
                    style={{ fill: "currentColor", opacity: 0.6 }}
                  >
                    y{i + 1}={target[i]}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-xs">
              <div className="flex justify-between font-mono mb-1 text-muted-foreground">
                <span>x1</span>
                <span>{x1.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={x1}
                onChange={(e) => setX1(Number(e.target.value))}
                className="w-full accent-brand"
              />
            </label>
            <label className="text-xs">
              <div className="flex justify-between font-mono mb-1 text-muted-foreground">
                <span>x2</span>
                <span>{x2.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={x2}
                onChange={(e) => setX2(Number(e.target.value))}
                className="w-full accent-brand"
              />
            </label>
          </div>
        </div>

        <aside className="border-t md:border-t-0 md:border-l border-border bg-background p-4 text-xs space-y-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Forward
            </div>
            <TexBlock>{"a^{(l)} = \\sigma\\!\\left(W^{(l)} a^{(l-1)} + b^{(l)}\\right)"}</TexBlock>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Backprop (output)
            </div>
            <TexBlock>{"\\delta^{(L)} = (a^{(L)} - y) \\odot \\sigma'(z^{(L)})"}</TexBlock>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Loss (MSE / 2)
            </div>
            <div className="font-mono">
              L = <span className="text-brand">{loss.toFixed(4)}</span>
            </div>
            {lossBefore !== null && lossAfter !== null ? (
              <div className="mt-1 text-[11px]">
                Før step: <span className="font-mono">{lossBefore.toFixed(4)}</span>
                <br />
                Etter step: <span className="font-mono text-emerald-600 dark:text-emerald-400">{lossAfter.toFixed(4)}</span>
                {" "}
                <span className="text-muted-foreground">
                  (Δ = {(lossAfter - lossBefore).toFixed(4)})
                </span>
              </div>
            ) : null}
          </div>
          <div className="rounded-md border border-brand/30 bg-brand/5 p-2 text-[11px] leading-relaxed">
            <span className="font-semibold">Les visualet:</span>
            <ul className="list-disc pl-4 mt-1 space-y-0.5">
              <li>Mørk node = høy aktivering.</li>
              <li>
                Blå kant = positiv vekt, <span className="text-rose-500">rød</span> = negativ.
                Tykkere = større <Tex>{"|w|"}</Tex>.
              </li>
              <li>Blå puls = signal frem; rosa puls = gradient bakover.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
