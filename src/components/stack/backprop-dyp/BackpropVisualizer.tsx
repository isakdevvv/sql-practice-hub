import { useEffect, useMemo, useState } from "react";
import { Play, Pause, SkipForward, RotateCcw, StepBack } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv backprop-visualisering. Bygger forward- og backward-pass som en
// liste av "steg", spiller dem av én og én (eller auto-play) over en SVG-DAG.
// Fire moduser:
//   1. "expr"      — e = (a + b) * (b + 1). Stanford-style chain-rule.
//   2. "neuron"    — z = w·x + b, a = σ(z), L = (a − y)².
//   3. "twolay"    — 2 → 2 → 1, sigmoid + MSE. Med vekt-oppdatering.
//   4. "vanishing" — 10 lag sigmoid vs ReLU, viser gradient-størrelse pr lag.
// --------------------------------------------------------------------------

type Mode = "expr" | "neuron" | "twolay" | "vanishing";
type Direction = "forward" | "backward";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "expr", label: "Uttrykk", sub: "e = (a+b)·(b+1)" },
  { id: "neuron", label: "Ett nevron", sub: "z, σ, MSE-tap" },
  { id: "twolay", label: "2-lags nett", sub: "med vekt-oppdatering" },
  { id: "vanishing", label: "Vanishing", sub: "10 lag: σ vs ReLU" },
];

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
const dsigmoid = (z: number) => {
  const s = sigmoid(z);
  return s * (1 - s);
};
const relu = (z: number) => (z > 0 ? z : 0);
const drelu = (z: number) => (z > 0 ? 1 : 0);

function fmt(n: number, d = 3): string {
  if (!Number.isFinite(n)) return "—";
  const a = Math.abs(n);
  if (a !== 0 && (a < 1e-3 || a >= 1e4)) return n.toExponential(2);
  return n.toFixed(d);
}

// ---------------------------------------------------------------
// Felles UI-blokker
// ---------------------------------------------------------------
function ModeSelector({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
      {MODES.map((m) => {
        const active = m.id === mode;
        return (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={
              "rounded-lg border px-3 py-2 text-left transition-colors " +
              (active
                ? "border-brand bg-brand/10"
                : "border-border hover:border-brand/50 hover:bg-muted/30")
            }
          >
            <div className={"text-sm font-semibold " + (active ? "text-brand" : "")}>
              {m.label}
            </div>
            <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
              {m.sub}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function DirectionToggle({
  dir,
  setDir,
}: {
  dir: Direction;
  setDir: (d: Direction) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-border overflow-hidden text-xs">
      <button
        onClick={() => setDir("forward")}
        className={
          "px-3 py-1.5 " +
          (dir === "forward"
            ? "bg-brand text-brand-foreground"
            : "bg-background hover:bg-muted/40")
        }
      >
        forover
      </button>
      <button
        onClick={() => setDir("backward")}
        className={
          "px-3 py-1.5 border-l border-border " +
          (dir === "backward"
            ? "bg-rose-600 text-white"
            : "bg-background hover:bg-muted/40")
        }
      >
        bakover
      </button>
    </div>
  );
}

function PlaybackControls({
  step,
  total,
  playing,
  setPlaying,
  next,
  prev,
  reset,
}: {
  step: number;
  total: number;
  playing: boolean;
  setPlaying: (p: boolean) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={prev}
        disabled={step <= 0}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <StepBack className="h-3 w-3" /> forrige
      </button>
      <button
        onClick={next}
        disabled={step >= total}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <SkipForward className="h-3 w-3" /> neste
      </button>
      <button
        onClick={() => setPlaying(!playing)}
        disabled={step >= total}
        className="inline-flex items-center gap-1.5 rounded-md border border-brand bg-brand/10 px-2.5 py-1 text-xs text-brand hover:bg-brand/20 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {playing ? (
          <>
            <Pause className="h-3 w-3" /> pause
          </>
        ) : (
          <>
            <Play className="h-3 w-3" /> play
          </>
        )}
      </button>
      <button
        onClick={reset}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted/50"
      >
        <RotateCcw className="h-3 w-3" /> nullstill
      </button>
      <div className="ml-auto text-xs font-mono text-muted-foreground tabular-nums">
        steg {Math.min(step, total)} / {total}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Felles step-modell
// ---------------------------------------------------------------
type NodeVisual = {
  id: string;
  x: number;
  y: number;
  label: string; // f.eks. "a", "c=a+b"
  group: "input" | "op" | "param" | "out";
};

type EdgeVisual = {
  id: string;
  from: string;
  to: string;
  /** Operasjons-etikett midt på kanten under forward */
  opLabel?: string;
};

type Step = {
  /** Tekst i panel under */
  caption: string;
  /** Hvilke node-IDer skal lyse opp i forward (verdi-tekst) */
  litNodes?: string[];
  /** Verdier per node (vises i node) — akkumuleres over forward-stegene */
  values?: Record<string, number>;
  /** Hvilke kanter har gradient nå (akkumulert) */
  gradEdges?: Record<string, { localDeriv: number; gradFlow: number }>;
  /** Backward: hvilke noder har ∂L/∂node etablert */
  nodeGrads?: Record<string, number>;
  /** Hvilken kant/node er "aktiv" akkurat nå (utheving) */
  activeEdge?: string;
  activeNode?: string;
  direction: Direction;
};

// ===============================================================
// Mode 1: ENKELT UTTRYKK   e = (a + b) * (b + 1)
// ===============================================================
function ExpressionMode() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);

  // Graph layout
  const NODES: NodeVisual[] = useMemo(() => {
    return [
      { id: "a", x: 60, y: 70, label: "a", group: "input" },
      { id: "b", x: 60, y: 200, label: "b", group: "input" },
      { id: "one", x: 60, y: 280, label: "1", group: "input" },
      { id: "c", x: 240, y: 110, label: "c = a + b", group: "op" },
      { id: "d", x: 240, y: 240, label: "d = b + 1", group: "op" },
      { id: "e", x: 440, y: 175, label: "e = c · d", group: "out" },
    ];
  }, []);
  const EDGES: EdgeVisual[] = useMemo(
    () => [
      { id: "a-c", from: "a", to: "c", opLabel: "+" },
      { id: "b-c", from: "b", to: "c", opLabel: "+" },
      { id: "b-d", from: "b", to: "d", opLabel: "+" },
      { id: "one-d", from: "one", to: "d", opLabel: "+" },
      { id: "c-e", from: "c", to: "e", opLabel: "·" },
      { id: "d-e", from: "d", to: "e", opLabel: "·" },
    ],
    [],
  );

  const steps: Step[] = useMemo(() => {
    const c = a + b;
    const d = b + 1;
    const e = c * d;
    // lokale deriverte:
    // ∂c/∂a = 1, ∂c/∂b = 1
    // ∂d/∂b = 1, ∂d/∂1 = 1 (uinteressant)
    // ∂e/∂c = d, ∂e/∂d = c
    // ∂e/∂a = ∂e/∂c · ∂c/∂a = d
    // ∂e/∂b = ∂e/∂c · 1 + ∂e/∂d · 1 = d + c
    const gradC = d; // ∂e/∂c
    const gradD = c; // ∂e/∂d
    const gradA = gradC * 1;
    const gradBFromC = gradC * 1;
    const gradBFromD = gradD * 1;
    const gradB = gradBFromC + gradBFromD;

    const vForward: Record<string, number> = {};
    const out: Step[] = [];

    // Forward
    out.push({
      direction: "forward",
      caption: `Start: a = ${a}, b = ${b}. Vi vil regne ut e = (a+b)·(b+1) og deretter ∂e/∂a og ∂e/∂b.`,
      values: { a, b, one: 1 },
      litNodes: ["a", "b", "one"],
    });
    vForward.a = a;
    vForward.b = b;
    vForward.one = 1;

    out.push({
      direction: "forward",
      caption: `c = a + b = ${a} + ${b} = ${c}.`,
      values: { ...vForward, c },
      litNodes: [...Object.keys(vForward), "c"],
      activeNode: "c",
    });
    vForward.c = c;

    out.push({
      direction: "forward",
      caption: `d = b + 1 = ${b} + 1 = ${d}.`,
      values: { ...vForward, d },
      litNodes: [...Object.keys(vForward), "d"],
      activeNode: "d",
    });
    vForward.d = d;

    out.push({
      direction: "forward",
      caption: `e = c · d = ${c} · ${d} = ${e}. Forward-passet er ferdig.`,
      values: { ...vForward, e },
      litNodes: [...Object.keys(vForward), "e"],
      activeNode: "e",
    });

    // Backward
    const finalForward = { ...vForward, e };
    const grads: Record<string, { localDeriv: number; gradFlow: number }> = {};
    const nGrads: Record<string, number> = {};

    out.push({
      direction: "backward",
      caption: `Backward starter: ∂e/∂e = 1 per definisjon. Vi sprer denne gradienten bakover gjennom grafen.`,
      values: finalForward,
      nodeGrads: { e: 1 },
      activeNode: "e",
    });
    nGrads.e = 1;

    out.push({
      direction: "backward",
      caption: `Multiplikasjons-noden e = c · d. Lokal deriverte: ∂e/∂c = d = ${d}. Kjede: ∂e/∂c = 1 · ${d} = ${gradC}.`,
      values: finalForward,
      nodeGrads: { ...nGrads, c: gradC },
      gradEdges: { ...grads, "c-e": { localDeriv: d, gradFlow: gradC } },
      activeEdge: "c-e",
    });
    nGrads.c = gradC;
    grads["c-e"] = { localDeriv: d, gradFlow: gradC };

    out.push({
      direction: "backward",
      caption: `Andre input til samme produkt: ∂e/∂d = c = ${c}. Kjede: ∂e/∂d = 1 · ${c} = ${gradD}.`,
      values: finalForward,
      nodeGrads: { ...nGrads, d: gradD },
      gradEdges: { ...grads, "d-e": { localDeriv: c, gradFlow: gradD } },
      activeEdge: "d-e",
    });
    nGrads.d = gradD;
    grads["d-e"] = { localDeriv: c, gradFlow: gradD };

    out.push({
      direction: "backward",
      caption: `Addisjons-noden c = a + b. Lokal ∂c/∂a = 1. Kjede: ∂e/∂a = ${gradC} · 1 = ${gradA}.`,
      values: finalForward,
      nodeGrads: { ...nGrads, a: gradA },
      gradEdges: { ...grads, "a-c": { localDeriv: 1, gradFlow: gradA } },
      activeEdge: "a-c",
    });
    nGrads.a = gradA;
    grads["a-c"] = { localDeriv: 1, gradFlow: gradA };

    out.push({
      direction: "backward",
      caption: `Fra c til b: ∂c/∂b = 1. Bidrag til ∂e/∂b: ${gradC} · 1 = ${gradBFromC}.`,
      values: finalForward,
      nodeGrads: { ...nGrads, b: gradBFromC },
      gradEdges: { ...grads, "b-c": { localDeriv: 1, gradFlow: gradBFromC } },
      activeEdge: "b-c",
    });
    nGrads.b = gradBFromC;
    grads["b-c"] = { localDeriv: 1, gradFlow: gradBFromC };

    out.push({
      direction: "backward",
      caption: `b bidrar OGSÅ via d = b + 1. ∂d/∂b = 1, bidrag: ${gradD} · 1 = ${gradBFromD}. Akkumulér: ∂e/∂b = ${gradBFromC} + ${gradBFromD} = ${gradB}.`,
      values: finalForward,
      nodeGrads: { ...nGrads, b: gradB },
      gradEdges: { ...grads, "b-d": { localDeriv: 1, gradFlow: gradBFromD } },
      activeEdge: "b-d",
    });

    return out;
  }, [a, b]);

  return (
    <StepPlayer
      nodes={NODES}
      edges={EDGES}
      steps={steps}
      svgWidth={520}
      svgHeight={340}
      controlsTop={
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <label className="flex items-center gap-1.5 text-xs">
            <span className="font-mono">a =</span>
            <input
              type="number"
              value={a}
              step={1}
              onChange={(e) => setA(Number(e.target.value))}
              className="w-16 rounded border border-border bg-background px-2 py-1 font-mono text-xs"
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs">
            <span className="font-mono">b =</span>
            <input
              type="number"
              value={b}
              step={1}
              onChange={(e) => setB(Number(e.target.value))}
              className="w-16 rounded border border-border bg-background px-2 py-1 font-mono text-xs"
            />
          </label>
          <span className="text-xs text-muted-foreground">
            Stanford-eksempelet: <span className="font-mono">e = (a + b)·(b + 1)</span>.
            Merk at <span className="font-mono">b</span> bidrar via to veier — de
            må summeres.
          </span>
        </div>
      }
    />
  );
}

// ===============================================================
// Mode 2: ETT NEVRON  z = w·x + b, a = σ(z), L = (a − y)²
// ===============================================================
function NeuronMode() {
  const [x, setX] = useState(1.0);
  const [w, setW] = useState(0.5);
  const [bias, setBias] = useState(0.0);
  const [y, setY] = useState(1.0);

  const NODES: NodeVisual[] = useMemo(
    () => [
      { id: "x", x: 60, y: 60, label: "x", group: "input" },
      { id: "w", x: 60, y: 140, label: "w", group: "param" },
      { id: "b", x: 60, y: 220, label: "b", group: "param" },
      { id: "z", x: 230, y: 140, label: "z = w·x + b", group: "op" },
      { id: "a", x: 380, y: 140, label: "a = σ(z)", group: "op" },
      { id: "y", x: 380, y: 240, label: "y", group: "input" },
      { id: "L", x: 530, y: 190, label: "L = (a − y)²", group: "out" },
    ],
    [],
  );
  const EDGES: EdgeVisual[] = useMemo(
    () => [
      { id: "x-z", from: "x", to: "z", opLabel: "·w" },
      { id: "w-z", from: "w", to: "z", opLabel: "·x" },
      { id: "b-z", from: "b", to: "z", opLabel: "+" },
      { id: "z-a", from: "z", to: "a", opLabel: "σ" },
      { id: "a-L", from: "a", to: "L", opLabel: "(·−y)²" },
      { id: "y-L", from: "y", to: "L", opLabel: "−" },
    ],
    [],
  );

  const steps: Step[] = useMemo(() => {
    const z = w * x + bias;
    const a = sigmoid(z);
    const L = (a - y) * (a - y);

    const dL_da = 2 * (a - y);
    const da_dz = dsigmoid(z);
    const dL_dz = dL_da * da_dz;
    const dL_dw = dL_dz * x;
    const dL_db = dL_dz * 1;
    const dL_dx = dL_dz * w;

    const out: Step[] = [];
    const v: Record<string, number> = { x, w, b: bias, y };

    out.push({
      direction: "forward",
      caption: `Start: x=${fmt(x, 2)}, w=${fmt(w, 2)}, b=${fmt(bias, 2)}, y=${fmt(y, 2)} (target).`,
      values: { ...v },
      litNodes: ["x", "w", "b", "y"],
    });

    out.push({
      direction: "forward",
      caption: `z = w·x + b = ${fmt(w, 2)}·${fmt(x, 2)} + ${fmt(bias, 2)} = ${fmt(z)}.`,
      values: { ...v, z },
      litNodes: ["x", "w", "b", "y", "z"],
      activeNode: "z",
    });

    out.push({
      direction: "forward",
      caption: `a = σ(z) = 1/(1 + e^(−${fmt(z, 2)})) = ${fmt(a)}.`,
      values: { ...v, z, a },
      litNodes: ["x", "w", "b", "y", "z", "a"],
      activeNode: "a",
    });

    out.push({
      direction: "forward",
      caption: `L = (a − y)² = (${fmt(a, 3)} − ${fmt(y, 2)})² = ${fmt(L)}. Forward ferdig.`,
      values: { ...v, z, a, L },
      litNodes: ["x", "w", "b", "y", "z", "a", "L"],
      activeNode: "L",
    });

    // Backward
    const finalV = { ...v, z, a, L };
    const nG: Record<string, number> = {};
    const gE: Record<string, { localDeriv: number; gradFlow: number }> = {};

    out.push({
      direction: "backward",
      caption: `∂L/∂L = 1.`,
      values: finalV,
      nodeGrads: { L: 1 },
      activeNode: "L",
    });
    nG.L = 1;

    out.push({
      direction: "backward",
      caption: `∂L/∂a = 2(a − y) = 2·(${fmt(a, 3)} − ${fmt(y, 2)}) = ${fmt(dL_da)}.`,
      values: finalV,
      nodeGrads: { ...nG, a: dL_da },
      gradEdges: { ...gE, "a-L": { localDeriv: 2 * (a - y), gradFlow: dL_da } },
      activeEdge: "a-L",
    });
    nG.a = dL_da;
    gE["a-L"] = { localDeriv: 2 * (a - y), gradFlow: dL_da };

    out.push({
      direction: "backward",
      caption: `σ'(z) = σ(z)(1−σ(z)) = ${fmt(a, 3)}·${fmt(1 - a, 3)} = ${fmt(da_dz)}. ∂L/∂z = ∂L/∂a · σ'(z) = ${fmt(dL_dz)}.`,
      values: finalV,
      nodeGrads: { ...nG, z: dL_dz },
      gradEdges: { ...gE, "z-a": { localDeriv: da_dz, gradFlow: dL_dz } },
      activeEdge: "z-a",
    });
    nG.z = dL_dz;
    gE["z-a"] = { localDeriv: da_dz, gradFlow: dL_dz };

    out.push({
      direction: "backward",
      caption: `∂z/∂w = x = ${fmt(x, 2)}. ∂L/∂w = ${fmt(dL_dz)} · ${fmt(x, 2)} = ${fmt(dL_dw)}.`,
      values: finalV,
      nodeGrads: { ...nG, w: dL_dw },
      gradEdges: { ...gE, "w-z": { localDeriv: x, gradFlow: dL_dw } },
      activeEdge: "w-z",
    });
    nG.w = dL_dw;
    gE["w-z"] = { localDeriv: x, gradFlow: dL_dw };

    out.push({
      direction: "backward",
      caption: `∂z/∂b = 1. ∂L/∂b = ${fmt(dL_dz)} · 1 = ${fmt(dL_db)}.`,
      values: finalV,
      nodeGrads: { ...nG, b: dL_db },
      gradEdges: { ...gE, "b-z": { localDeriv: 1, gradFlow: dL_db } },
      activeEdge: "b-z",
    });
    nG.b = dL_db;
    gE["b-z"] = { localDeriv: 1, gradFlow: dL_db };

    out.push({
      direction: "backward",
      caption: `∂z/∂x = w = ${fmt(w, 2)}. ∂L/∂x = ${fmt(dL_dz)} · ${fmt(w, 2)} = ${fmt(dL_dx)}. (I praksis bryr vi oss om vekt-gradientene, men ∂L/∂x trengs i dypere lag.)`,
      values: finalV,
      nodeGrads: { ...nG, x: dL_dx },
      gradEdges: { ...gE, "x-z": { localDeriv: w, gradFlow: dL_dx } },
      activeEdge: "x-z",
    });

    return out;
  }, [x, w, bias, y]);

  return (
    <StepPlayer
      nodes={NODES}
      edges={EDGES}
      steps={steps}
      svgWidth={620}
      svgHeight={300}
      controlsTop={
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs">
          {[
            { label: "x", value: x, set: setX, min: -2, max: 2 },
            { label: "w", value: w, set: setW, min: -2, max: 2 },
            { label: "b", value: bias, set: setBias, min: -2, max: 2 },
            { label: "y", value: y, set: setY, min: -2, max: 2 },
          ].map((it) => (
            <label key={it.label} className="flex items-center gap-2">
              <span className="font-mono w-4">{it.label}</span>
              <input
                type="range"
                min={it.min}
                max={it.max}
                step={0.1}
                value={it.value}
                onChange={(e) => it.set(Number(e.target.value))}
                className="flex-1 accent-brand"
              />
              <span className="font-mono tabular-nums w-10 text-right">
                {fmt(it.value, 2)}
              </span>
            </label>
          ))}
        </div>
      }
    />
  );
}

// ===============================================================
// Mode 3: 2-LAGS NETT (2 → 2 → 1, sigmoid)
// ===============================================================
function TwoLayerMode() {
  // Vekter holdes i state slik at "Oppdater"-knappen kan mutere dem.
  const [W1, setW1] = useState<number[][]>([
    [0.5, -0.3],
    [0.2, 0.8],
  ]);
  const [b1, setB1] = useState<[number, number]>([0.1, -0.2]);
  const [W2, setW2] = useState<[number, number]>([0.6, -0.5]);
  const [b2, setB2] = useState(0.05);
  const [lr, setLr] = useState(0.5);
  const [lossHistory, setLossHistory] = useState<number[]>([]);

  const x = [0.5, -0.8] as const;
  const y = 1.0;

  const compute = () => {
    const z1 = [
      W1[0][0] * x[0] + W1[0][1] * x[1] + b1[0],
      W1[1][0] * x[0] + W1[1][1] * x[1] + b1[1],
    ];
    const a1 = [sigmoid(z1[0]), sigmoid(z1[1])];
    const z2 = W2[0] * a1[0] + W2[1] * a1[1] + b2;
    const a2 = sigmoid(z2);
    const L = (a2 - y) * (a2 - y);

    // Backward
    const dL_da2 = 2 * (a2 - y);
    const da2_dz2 = dsigmoid(z2);
    const dL_dz2 = dL_da2 * da2_dz2;

    const dL_dW2 = [dL_dz2 * a1[0], dL_dz2 * a1[1]];
    const dL_db2 = dL_dz2;

    const dL_da1 = [dL_dz2 * W2[0], dL_dz2 * W2[1]];
    const dL_dz1 = [dL_da1[0] * dsigmoid(z1[0]), dL_da1[1] * dsigmoid(z1[1])];

    const dL_dW1 = [
      [dL_dz1[0] * x[0], dL_dz1[0] * x[1]],
      [dL_dz1[1] * x[0], dL_dz1[1] * x[1]],
    ];
    const dL_db1 = [dL_dz1[0], dL_dz1[1]];

    return { z1, a1, z2, a2, L, dL_dW2, dL_db2, dL_dW1, dL_db1, dL_dz2, dL_dz1 };
  };

  const NODES: NodeVisual[] = useMemo(
    () => [
      { id: "x1", x: 50, y: 80, label: "x₁", group: "input" },
      { id: "x2", x: 50, y: 220, label: "x₂", group: "input" },
      { id: "h1", x: 250, y: 80, label: "h₁", group: "op" },
      { id: "h2", x: 250, y: 220, label: "h₂", group: "op" },
      { id: "o", x: 450, y: 150, label: "ŷ", group: "out" },
      { id: "L", x: 580, y: 150, label: "L", group: "out" },
    ],
    [],
  );
  const EDGES: EdgeVisual[] = useMemo(
    () => [
      { id: "x1-h1", from: "x1", to: "h1" },
      { id: "x2-h1", from: "x2", to: "h1" },
      { id: "x1-h2", from: "x1", to: "h2" },
      { id: "x2-h2", from: "x2", to: "h2" },
      { id: "h1-o", from: "h1", to: "o" },
      { id: "h2-o", from: "h2", to: "o" },
      { id: "o-L", from: "o", to: "L" },
    ],
    [],
  );

  const c = compute();

  const steps: Step[] = useMemo(() => {
    const out: Step[] = [];
    const v: Record<string, number> = { x1: x[0], x2: x[1] };

    out.push({
      direction: "forward",
      caption: `Input x = (${fmt(x[0], 2)}, ${fmt(x[1], 2)}), target y = ${y}. Vekter er på venstre slider-panel.`,
      values: { ...v },
      litNodes: ["x1", "x2"],
    });

    out.push({
      direction: "forward",
      caption: `Skjult lag: h₁ = σ(${fmt(W1[0][0], 2)}·x₁ + ${fmt(W1[0][1], 2)}·x₂ + ${fmt(b1[0], 2)}) = σ(${fmt(c.z1[0])}) = ${fmt(c.a1[0])}.`,
      values: { ...v, h1: c.a1[0] },
      litNodes: ["x1", "x2", "h1"],
      activeNode: "h1",
    });

    out.push({
      direction: "forward",
      caption: `h₂ = σ(${fmt(c.z1[1])}) = ${fmt(c.a1[1])}.`,
      values: { ...v, h1: c.a1[0], h2: c.a1[1] },
      litNodes: ["x1", "x2", "h1", "h2"],
      activeNode: "h2",
    });

    out.push({
      direction: "forward",
      caption: `Output: ŷ = σ(${fmt(W2[0], 2)}·h₁ + ${fmt(W2[1], 2)}·h₂ + ${fmt(b2, 2)}) = σ(${fmt(c.z2)}) = ${fmt(c.a2)}.`,
      values: { ...v, h1: c.a1[0], h2: c.a1[1], o: c.a2 },
      litNodes: ["x1", "x2", "h1", "h2", "o"],
      activeNode: "o",
    });

    out.push({
      direction: "forward",
      caption: `L = (ŷ − y)² = (${fmt(c.a2, 3)} − ${y})² = ${fmt(c.L)}.`,
      values: { ...v, h1: c.a1[0], h2: c.a1[1], o: c.a2, L: c.L },
      litNodes: ["x1", "x2", "h1", "h2", "o", "L"],
      activeNode: "L",
    });

    const finalV = { ...v, h1: c.a1[0], h2: c.a1[1], o: c.a2, L: c.L };
    const nG: Record<string, number> = { L: 1 };
    const gE: Record<string, { localDeriv: number; gradFlow: number }> = {};

    out.push({
      direction: "backward",
      caption: `Backward: ∂L/∂L = 1. ∂L/∂ŷ · σ'(z₂) gir ∂L/∂z₂ = ${fmt(c.dL_dz2)}.`,
      values: finalV,
      nodeGrads: { ...nG, o: c.dL_dz2 },
      gradEdges: { ...gE, "o-L": { localDeriv: 2 * (c.a2 - y), gradFlow: c.dL_dz2 } },
      activeEdge: "o-L",
    });
    nG.o = c.dL_dz2;
    gE["o-L"] = { localDeriv: 2 * (c.a2 - y), gradFlow: c.dL_dz2 };

    out.push({
      direction: "backward",
      caption: `∂L/∂w²₁ = ∂L/∂z₂ · h₁ = ${fmt(c.dL_dz2)} · ${fmt(c.a1[0])} = ${fmt(c.dL_dW2[0])}. (Tilsv. for w²₂.) ∂L/∂h₁ = ∂L/∂z₂ · w²₁ = ${fmt(c.dL_dz2 * W2[0])}.`,
      values: finalV,
      nodeGrads: { ...nG, h1: c.dL_dz2 * W2[0] },
      gradEdges: {
        ...gE,
        "h1-o": { localDeriv: W2[0], gradFlow: c.dL_dz2 * W2[0] },
        "h2-o": { localDeriv: W2[1], gradFlow: c.dL_dz2 * W2[1] },
      },
      activeEdge: "h1-o",
    });
    nG.h1 = c.dL_dz2 * W2[0];
    nG.h2 = c.dL_dz2 * W2[1];
    gE["h1-o"] = { localDeriv: W2[0], gradFlow: c.dL_dz2 * W2[0] };
    gE["h2-o"] = { localDeriv: W2[1], gradFlow: c.dL_dz2 * W2[1] };

    out.push({
      direction: "backward",
      caption: `∂L/∂z₁ = ∂L/∂h · σ'(z₁). For h₁: ${fmt(c.dL_dz1[0])}. For h₂: ${fmt(c.dL_dz1[1])}. Disse er typisk MINDRE enn ∂L/∂z₂ — sigmoid demper.`,
      values: finalV,
      nodeGrads: { ...nG, h1: c.dL_dz1[0], h2: c.dL_dz1[1] },
      activeEdge: "x1-h1",
    });
    nG.h1 = c.dL_dz1[0];
    nG.h2 = c.dL_dz1[1];

    out.push({
      direction: "backward",
      caption: `∂L/∂w¹ for hver vekt: lik ∂L/∂zⱼ · xᵢ. Bias-gradient: ∂L/∂z. Klikk "Oppdater" for å bruke disse i w ← w − α·grad.`,
      values: finalV,
      nodeGrads: nG,
      gradEdges: {
        ...gE,
        "x1-h1": { localDeriv: x[0], gradFlow: c.dL_dz1[0] * x[0] },
        "x2-h1": { localDeriv: x[1], gradFlow: c.dL_dz1[0] * x[1] },
        "x1-h2": { localDeriv: x[0], gradFlow: c.dL_dz1[1] * x[0] },
        "x2-h2": { localDeriv: x[1], gradFlow: c.dL_dz1[1] * x[1] },
      },
    });

    return out;
  }, [W1, b1, W2, b2, c.a1, c.a2, c.dL_dW2, c.dL_dz1, c.dL_dz2, c.L, c.z1, c.z2]);

  const applyUpdate = () => {
    setW1([
      [W1[0][0] - lr * c.dL_dW1[0][0], W1[0][1] - lr * c.dL_dW1[0][1]],
      [W1[1][0] - lr * c.dL_dW1[1][0], W1[1][1] - lr * c.dL_dW1[1][1]],
    ]);
    setB1([b1[0] - lr * c.dL_db1[0], b1[1] - lr * c.dL_db1[1]]);
    setW2([W2[0] - lr * c.dL_dW2[0], W2[1] - lr * c.dL_dW2[1]]);
    setB2(b2 - lr * c.dL_db2);
    setLossHistory((h) => [...h.slice(-19), c.L]);
  };

  const resetWeights = () => {
    setW1([
      [0.5, -0.3],
      [0.2, 0.8],
    ]);
    setB1([0.1, -0.2]);
    setW2([0.6, -0.5]);
    setB2(0.05);
    setLossHistory([]);
  };

  return (
    <div>
      <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="rounded-lg border border-border bg-card/50 p-3">
          <div className="font-semibold mb-1 text-muted-foreground uppercase tracking-wide">
            Tilstand
          </div>
          <div className="font-mono space-y-0.5">
            <div>
              x = ({fmt(x[0], 2)}, {fmt(x[1], 2)}), y = {y}
            </div>
            <div>
              ŷ ={" "}
              <span className="text-brand font-semibold">{fmt(c.a2, 4)}</span>
            </div>
            <div>
              L ={" "}
              <span className="text-amber-700 dark:text-amber-400 font-semibold">
                {fmt(c.L, 5)}
              </span>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card/50 p-3">
          <div className="font-semibold mb-1 text-muted-foreground uppercase tracking-wide">
            Læringsrate
          </div>
          <label className="flex items-center gap-2">
            <span className="font-mono w-4">α</span>
            <input
              type="range"
              min={0.01}
              max={5}
              step={0.01}
              value={lr}
              onChange={(e) => setLr(Number(e.target.value))}
              className="flex-1 accent-brand"
            />
            <span className="font-mono w-10 text-right tabular-nums">
              {fmt(lr, 2)}
            </span>
          </label>
          <div className="mt-2 flex gap-2">
            <button
              onClick={applyUpdate}
              className="rounded-md bg-brand text-brand-foreground px-3 py-1 text-xs font-semibold hover:opacity-90"
            >
              Oppdater (w ← w − α·grad)
            </button>
            <button
              onClick={resetWeights}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted/50"
            >
              <RotateCcw className="h-3 w-3" /> nullstill vekter
            </button>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card/50 p-3">
          <div className="font-semibold mb-1 text-muted-foreground uppercase tracking-wide">
            Loss-historikk
          </div>
          {lossHistory.length === 0 ? (
            <div className="text-muted-foreground text-[11px]">
              Trykk Oppdater for å registrere loss etter hver gradient-step.
            </div>
          ) : (
            <div className="font-mono text-[11px] space-y-0.5">
              {lossHistory.slice(-6).map((l, i) => (
                <div key={i}>
                  step {lossHistory.length - lossHistory.slice(-6).length + i + 1}:{" "}
                  <span className="text-amber-700 dark:text-amber-400">
                    {fmt(l, 5)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <StepPlayer
        nodes={NODES}
        edges={EDGES}
        steps={steps}
        svgWidth={660}
        svgHeight={310}
      />
    </div>
  );
}

// ===============================================================
// Mode 4: VANISHING GRADIENT — 10 lag sigmoid vs ReLU
// ===============================================================
function VanishingMode() {
  const DEPTH = 10;
  const [act, setAct] = useState<"sigmoid" | "relu">("sigmoid");

  // Forenklet modell: alle vekter = 1, ingen bias, input = 1.
  // For sigmoid: aₖ = σ(zₖ), zₖ = aₖ₋₁ ⇒ gradient-multiplikator pr lag = σ'(zₖ) ≤ 0.25.
  // For ReLU:    aₖ = ReLU(aₖ₋₁), gradient-multiplikator = 1 (når aktiv).
  const data = useMemo(() => {
    const activations = [1.0];
    const zs: number[] = [];
    for (let k = 1; k <= DEPTH; k++) {
      const z = activations[k - 1] * 1.0; // w=1, b=0
      zs.push(z);
      activations.push(act === "sigmoid" ? sigmoid(z) : relu(z));
    }
    // Gradient bakover: anta ∂L/∂a_DEPTH = 1.
    // Multiplikator pr lag (lokal deriverte mhp. forrige lag-aktivering) = act'(z) · w.
    const localDeriv: number[] = [];
    for (let k = 1; k <= DEPTH; k++) {
      const d = act === "sigmoid" ? dsigmoid(zs[k - 1]) : drelu(zs[k - 1]);
      localDeriv.push(d * 1.0);
    }
    // Akkumulert gradient på vekt i lag k: produktet av lokale deriverte fra DEPTH ned til k+1, gang aₖ₋₁.
    const gradAtLayer: number[] = [];
    let prod = 1; // ∂L/∂a_DEPTH = 1
    for (let k = DEPTH; k >= 1; k--) {
      // gradient på w_k = prod_from_above · act'(z_k) · a_{k-1}
      const localK = localDeriv[k - 1];
      const gradW = prod * localK * activations[k - 1];
      gradAtLayer[k - 1] = gradW;
      prod = prod * localK; // før neste iterasjon multipliseres inn lokal
    }
    return { activations, gradAtLayer, localDeriv };
  }, [act]);

  const maxAbs = Math.max(...data.gradAtLayer.map(Math.abs), 1e-12);

  return (
    <div>
      <div className="mb-3 flex items-center gap-3 flex-wrap text-xs">
        <span className="text-muted-foreground">
          10 lag dypt nett, alle vekter = 1, bias = 0, input = 1. Vi viser
          gradient som ville ankommet vekten i hvert lag (logaritmisk skala).
        </span>
        <div className="ml-auto inline-flex rounded-md border border-border overflow-hidden">
          <button
            onClick={() => setAct("sigmoid")}
            className={
              "px-3 py-1 " +
              (act === "sigmoid"
                ? "bg-brand text-brand-foreground"
                : "bg-background hover:bg-muted/40")
            }
          >
            sigmoid
          </button>
          <button
            onClick={() => setAct("relu")}
            className={
              "px-3 py-1 border-l border-border " +
              (act === "relu"
                ? "bg-brand text-brand-foreground"
                : "bg-background hover:bg-muted/40")
            }
          >
            ReLU
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card/60 p-4">
        <svg viewBox="0 0 720 320" className="w-full h-auto">
          {/* Lag-noder (en rad) */}
          {data.activations.map((a, k) => {
            const x = 40 + k * 65;
            return (
              <g key={"lay" + k}>
                <circle cx={x} cy={70} r={16} fill="#dbeafe" stroke="#2563eb" strokeWidth={1.4} />
                <text
                  x={x}
                  y={74}
                  textAnchor="middle"
                  fontSize={10}
                  fontFamily="ui-monospace, monospace"
                  fill="#0f172a"
                >
                  {fmt(a, 2)}
                </text>
                <text
                  x={x}
                  y={50}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#64748b"
                  fontFamily="ui-monospace, monospace"
                >
                  a{k}
                </text>
                {k > 0 && (
                  <line
                    x1={40 + (k - 1) * 65 + 16}
                    y1={70}
                    x2={x - 16}
                    y2={70}
                    stroke="#64748b"
                    strokeWidth={1.2}
                  />
                )}
              </g>
            );
          })}

          {/* Bakover-piler */}
          {data.gradAtLayer.map((_, k) => {
            const x = 40 + (k + 1) * 65;
            return (
              <g key={"gp" + k}>
                <line
                  x1={x - 16}
                  y1={120}
                  x2={40 + k * 65 + 16}
                  y2={120}
                  stroke="#dc2626"
                  strokeWidth={1.2}
                  markerEnd="url(#bp-arrow)"
                  opacity={0.7}
                />
              </g>
            );
          })}
          <defs>
            <marker
              id="bp-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 Z" fill="#dc2626" />
            </marker>
          </defs>

          {/* Gradient-bar pr lag (logaritmisk visualisering) */}
          {data.gradAtLayer.map((g, k) => {
            const x = 40 + (k + 1) * 65 - 22;
            const w = 44;
            const absG = Math.abs(g);
            // log-skala: -16 (1e-16) til 0 (1)
            const logMin = -16;
            const logMax = 0;
            const logV = absG <= 0 ? logMin : Math.max(logMin, Math.log10(absG));
            const norm = (logV - logMin) / (logMax - logMin);
            const barMax = 130;
            const barH = Math.max(2, norm * barMax);
            const yTop = 290 - barH;
            const color = absG < 1e-3 ? "#dc2626" : absG < 0.1 ? "#f97316" : "#16a34a";
            return (
              <g key={"bar" + k}>
                <rect
                  x={x}
                  y={yTop}
                  width={w}
                  height={barH}
                  fill={color}
                  opacity={0.75}
                  rx={2}
                />
                <text
                  x={x + w / 2}
                  y={yTop - 4}
                  textAnchor="middle"
                  fontSize={8}
                  fontFamily="ui-monospace, monospace"
                  fill="#0f172a"
                >
                  {fmt(g)}
                </text>
                <text
                  x={x + w / 2}
                  y={305}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#64748b"
                  fontFamily="ui-monospace, monospace"
                >
                  w{k + 1}
                </text>
              </g>
            );
          })}

          {/* Akse */}
          <line x1={20} y1={290} x2={700} y2={290} stroke="#cbd5e1" strokeWidth={1} />
          <text x={20} y={155} fontSize={10} fill="#64748b" fontFamily="ui-monospace, monospace">
            |∂L/∂wₖ| (log)
          </text>
          <text x={20} y={138} fontSize={10} fill="#dc2626" fontFamily="ui-monospace, monospace">
            ← gradient-flyt
          </text>
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-border bg-card/50 p-3 font-mono">
          <div className="font-semibold mb-1 font-sans text-muted-foreground uppercase tracking-wide">
            Gradient pr lag
          </div>
          {data.gradAtLayer.map((g, k) => (
            <div key={"row" + k} className="flex justify-between">
              <span>w{k + 1}</span>
              <span
                className={
                  Math.abs(g) < 1e-4
                    ? "text-rose-600"
                    : Math.abs(g) < 0.05
                      ? "text-orange-600"
                      : "text-green-600"
                }
              >
                {fmt(g)}
              </span>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-[12px] leading-relaxed">
          {act === "sigmoid" ? (
            <>
              <strong>Sigmoid:</strong> σ'(z) ≤ 0.25. Etter 10 lag er
              produktet ≤ 0.25¹⁰ ≈ 10⁻⁶ — gradienten på w₁ er nesten 0. Det er
              det klassiske <em>vanishing gradient</em>-problemet. Tidlige lag
              lærer knapt.
            </>
          ) : (
            <>
              <strong>ReLU:</strong> ReLU'(z) = 1 så lenge z &gt; 0. Gradienten
              forplanter seg <em>uten</em> demping bakover. Dette er hovedgrunnen
              til at ReLU erstattet sigmoid i skjulte lag — dype nett ble plutselig
              trenbare.
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ===============================================================
// FELLES SVG STEP PLAYER
// ===============================================================
function StepPlayer({
  nodes,
  edges,
  steps,
  svgWidth,
  svgHeight,
  controlsTop,
}: {
  nodes: NodeVisual[];
  edges: EdgeVisual[];
  steps: Step[];
  svgWidth: number;
  svgHeight: number;
  controlsTop?: React.ReactNode;
}) {
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const firstBackwardIdx = steps.findIndex((s) => s.direction === "backward");
  const jumpToDir = (d: Direction) => {
    if (d === "forward") setStepIdx(0);
    else if (firstBackwardIdx >= 0) setStepIdx(firstBackwardIdx);
  };

  // Reset hvis input-driven steg-liste endrer seg
  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
  }, [steps]);

  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStepIdx((s) => Math.min(steps.length - 1, s + 1)), 1100);
    return () => clearTimeout(t);
  }, [playing, stepIdx, steps.length]);

  const cur = steps[Math.min(stepIdx, steps.length - 1)];
  const nodeById = useMemo(() => {
    const m: Record<string, NodeVisual> = {};
    nodes.forEach((n) => (m[n.id] = n));
    return m;
  }, [nodes]);

  const fillForGroup = (g: NodeVisual["group"], lit: boolean): string => {
    if (g === "input") return lit ? "#c7d2fe" : "#eef2ff";
    if (g === "param") return lit ? "#fde68a" : "#fef3c7";
    if (g === "op") return lit ? "#bae6fd" : "#e0f2fe";
    return lit ? "#bbf7d0" : "#dcfce7";
  };
  const strokeForGroup = (g: NodeVisual["group"]): string => {
    if (g === "input") return "#6366f1";
    if (g === "param") return "#d97706";
    if (g === "op") return "#0284c7";
    return "#16a34a";
  };

  return (
    <div>
      {controlsTop}

      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <div className="text-xs text-muted-foreground">Hopp til:</div>
        <DirectionToggle dir={cur.direction} setDir={jumpToDir} />
        <span className="text-[11px] text-muted-foreground">
          Aktivt steg er{" "}
          <span
            className={
              cur.direction === "forward"
                ? "text-brand font-semibold"
                : "text-rose-600 font-semibold"
            }
          >
            {cur.direction === "forward" ? "forover" : "bakover"}
          </span>
          .
        </span>
      </div>

      <div className="rounded-lg border border-border bg-card/60 p-3">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
          <defs>
            <marker
              id="forward-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 Z" fill="#475569" />
            </marker>
            <marker
              id="backward-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 Z" fill="#dc2626" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((e) => {
            const a = nodeById[e.from];
            const b = nodeById[e.to];
            if (!a || !b) return null;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const ux = dx / len;
            const uy = dy / len;
            const NR = 28;
            const x1 = a.x + ux * NR;
            const y1 = a.y + uy * NR;
            const x2 = b.x - ux * NR;
            const y2 = b.y - uy * NR;
            const active = cur.activeEdge === e.id;
            const gradInfo = cur.gradEdges?.[e.id];
            const hasGrad = !!gradInfo;
            return (
              <g key={e.id}>
                {/* Forward kant (alltid) */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={active && cur.direction === "forward" ? "#0284c7" : "#94a3b8"}
                  strokeWidth={active && cur.direction === "forward" ? 2.4 : 1.3}
                  markerEnd="url(#forward-arrow)"
                  opacity={cur.direction === "forward" ? 1 : 0.45}
                />
                {/* Op-etikett */}
                {e.opLabel && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 4}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#475569"
                    fontFamily="ui-monospace, monospace"
                  >
                    {e.opLabel}
                  </text>
                )}
                {/* Backward overlay */}
                {hasGrad && (
                  <line
                    x1={x2}
                    y1={y2}
                    x2={x1}
                    y2={y1}
                    stroke={active ? "#b91c1c" : "#dc2626"}
                    strokeWidth={active ? 3 : 1.8}
                    markerEnd="url(#backward-arrow)"
                    opacity={0.9}
                  />
                )}
                {hasGrad && (
                  <g>
                    <rect
                      x={(x1 + x2) / 2 - 38}
                      y={(y1 + y2) / 2 + 6}
                      width={76}
                      height={26}
                      rx={4}
                      fill="white"
                      stroke="#fca5a5"
                      strokeWidth={1}
                      opacity={0.95}
                    />
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 + 17}
                      textAnchor="middle"
                      fontSize={9}
                      fontFamily="ui-monospace, monospace"
                      fill="#7f1d1d"
                    >
                      lokal: {fmt(gradInfo.localDeriv, 2)}
                    </text>
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 + 28}
                      textAnchor="middle"
                      fontSize={9}
                      fontFamily="ui-monospace, monospace"
                      fill="#7f1d1d"
                    >
                      grad: {fmt(gradInfo.gradFlow, 2)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const lit = cur.litNodes?.includes(n.id) ?? false;
            const isActive = cur.activeNode === n.id;
            const val = cur.values?.[n.id];
            const grad = cur.nodeGrads?.[n.id];
            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={28}
                  fill={fillForGroup(n.group, lit)}
                  stroke={isActive ? "#0f172a" : strokeForGroup(n.group)}
                  strokeWidth={isActive ? 2.5 : 1.4}
                />
                <text
                  x={n.x}
                  y={n.y - 2}
                  textAnchor="middle"
                  fontSize={11}
                  fontFamily="ui-monospace, monospace"
                  fill="#0f172a"
                >
                  {n.label}
                </text>
                {val !== undefined && (
                  <text
                    x={n.x}
                    y={n.y + 11}
                    textAnchor="middle"
                    fontSize={10}
                    fontFamily="ui-monospace, monospace"
                    fill="#0c4a6e"
                  >
                    {fmt(val, 2)}
                  </text>
                )}
                {grad !== undefined && (
                  <g>
                    <rect
                      x={n.x - 28}
                      y={n.y + 30}
                      width={56}
                      height={16}
                      rx={3}
                      fill="#fee2e2"
                      stroke="#fca5a5"
                      strokeWidth={1}
                    />
                    <text
                      x={n.x}
                      y={n.y + 42}
                      textAnchor="middle"
                      fontSize={9}
                      fontFamily="ui-monospace, monospace"
                      fill="#7f1d1d"
                    >
                      ∂L: {fmt(grad, 2)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed min-h-[3.5rem]">
        {cur.caption}
      </div>

      <div className="mt-3">
        <PlaybackControls
          step={stepIdx}
          total={steps.length - 1}
          playing={playing}
          setPlaying={setPlaying}
          next={() => setStepIdx((s) => Math.min(steps.length - 1, s + 1))}
          prev={() => setStepIdx((s) => Math.max(0, s - 1))}
          reset={() => {
            setStepIdx(0);
            setPlaying(false);
          }}
        />
      </div>
    </div>
  );
}

// ===============================================================
// Hoved-eksport
// ===============================================================
export function BackpropVisualizer() {
  const [mode, setMode] = useState<Mode>("expr");

  return (
    <div className="rounded-xl border border-border bg-card p-4" role="region" aria-label="Interaktiv visualisering: Backpropagation">
      <ModeSelector mode={mode} setMode={setMode} />
      <div className="mb-3 text-xs text-muted-foreground">
        Forward (forover) bygger verdiene gjennom grafen; backward (bakover) sender
        gradienter tilbake langs kantene. Hver retning vises som egne, navigerbare
        steg.
      </div>
      {mode === "expr" && <ExpressionMode />}
      {mode === "neuron" && <NeuronMode />}
      {mode === "twolay" && <TwoLayerMode />}
      {mode === "vanishing" && <VanishingMode />}
    </div>
  );
}
