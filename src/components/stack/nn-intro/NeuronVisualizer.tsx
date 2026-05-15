import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv nevron + forward-pass visualisering.
// Fire moduser:
//   1. "single"  — ett nevron, 3 inputs, vekter, bias, aktiveringsvalg.
//   2. "act"     — aktiveringer side-by-side (sigmoid, ReLU, tanh, leaky ReLU).
//   3. "twolay"  — 2 inputs → 3 skjulte → 1 output, full forward-pass live.
//   4. "xor"     — manuell XOR-trening: 2 inputs → 2 skjulte → 1 output.
// All matte oppdateres live i takt med sliders — ingen «Steg»-knapp.
// --------------------------------------------------------------------------

type Mode = "single" | "act" | "twolay" | "xor";
type ActName = "sigmoid" | "relu" | "tanh" | "linear" | "leaky";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "single", label: "Ett nevron", sub: "3 input, vekt, bias, aktivering" },
  { id: "act", label: "Aktiveringer", sub: "sammenlign fire kurver" },
  { id: "twolay", label: "2-lags nett", sub: "2 → 3 → 1 forward-pass" },
  { id: "xor", label: "XOR-trening", sub: "juster vekter for hand" },
];

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
const relu = (z: number) => (z > 0 ? z : 0);
const leakyRelu = (z: number) => (z > 0 ? z : 0.1 * z);
const tanh = (z: number) => Math.tanh(z);
const linear = (z: number) => z;

const ACT_FN: Record<ActName, (z: number) => number> = {
  sigmoid,
  relu,
  tanh,
  linear,
  leaky: leakyRelu,
};

const ACT_LABEL: Record<ActName, string> = {
  sigmoid: "σ(z)",
  relu: "ReLU(z)",
  tanh: "tanh(z)",
  linear: "z",
  leaky: "LReLU(z)",
};

const ACT_FORMULA: Record<ActName, string> = {
  sigmoid: "1 / (1 + e⁻ᶻ)",
  relu: "max(0, z)",
  tanh: "(eᶻ - e⁻ᶻ) / (eᶻ + e⁻ᶻ)",
  linear: "z",
  leaky: "max(0.1·z, z)",
};

function fmt(n: number, d = 2): string {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(d);
}

function edgeColor(w: number): string {
  if (w >= 0) return "#16a34a"; // grønn
  return "#dc2626"; // rød
}
function edgeWidth(w: number): number {
  return 0.7 + Math.min(4, Math.abs(w) * 1.6);
}

// ----------------------------------------------------------------
// Slider-komponent (lokal)
// ----------------------------------------------------------------
function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.05,
  fmtVal,
  color,
}: {
  label: React.ReactNode;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  fmtVal?: (n: number) => string;
  color?: string;
}) {
  return (
    <label className="flex items-center gap-3 text-xs">
      <span className="font-mono w-12 shrink-0" style={color ? { color } : undefined}>
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-brand"
      />
      <span className="font-mono tabular-nums w-12 text-right">
        {fmtVal ? fmtVal(value) : fmt(value)}
      </span>
    </label>
  );
}

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

// ============================================================
// Mode 1: ETT NEVRON
// ============================================================
function SingleNeuron() {
  const [x, setX] = useState<[number, number, number]>([0.5, 0.8, -0.3]);
  const [w, setW] = useState<[number, number, number]>([1.2, -0.8, 0.6]);
  const [b, setB] = useState(0.1);
  const [act, setAct] = useState<ActName>("sigmoid");

  const z = w[0] * x[0] + w[1] * x[1] + w[2] * x[2] + b;
  const a = ACT_FN[act](z);

  const reset = () => {
    setX([0.5, 0.8, -0.3]);
    setW([1.2, -0.8, 0.6]);
    setB(0.1);
    setAct("sigmoid");
  };

  // SVG-layout
  const W_PX = 560;
  const H_PX = 280;
  const inputX = 60;
  const inputYs = [70, 140, 210];
  const sumX = 270;
  const sumY = 140;
  const actX = 410;
  const outX = 520;
  const NODE_R = 22;

  // Aktiveringskurve i panel til høyre
  const ACT_W = 140;
  const ACT_H = 110;
  const actMinZ = -4;
  const actMaxZ = 4;
  const actLeft = actX - ACT_W / 2;
  const actTop = sumY - ACT_H / 2;
  const yMin = act === "sigmoid" ? 0 : -1.2;
  const yMax = act === "sigmoid" ? 1 : act === "relu" ? 4 : act === "linear" ? 4 : 1.2;
  const curvePath = useMemo(() => {
    const pts: string[] = [];
    const N = 60;
    for (let i = 0; i <= N; i++) {
      const zVal = actMinZ + ((actMaxZ - actMinZ) * i) / N;
      const yVal = ACT_FN[act](zVal);
      const px = actLeft + ((zVal - actMinZ) / (actMaxZ - actMinZ)) * ACT_W;
      const py =
        actTop + ACT_H - ((yVal - yMin) / (yMax - yMin)) * ACT_H;
      pts.push(`${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [act, actLeft, actTop, yMin, yMax]);

  const zClamped = Math.max(actMinZ, Math.min(actMaxZ, z));
  const aClampedY = Math.max(yMin, Math.min(yMax, a));
  const pointPx = actLeft + ((zClamped - actMinZ) / (actMaxZ - actMinZ)) * ACT_W;
  const pointPy = actTop + ACT_H - ((aClampedY - yMin) / (yMax - yMin)) * ACT_H;

  return (
    <div>
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <svg
          viewBox={`0 0 ${W_PX} ${H_PX}`}
          className="w-full h-auto"
          style={{ maxHeight: 320 }}
        >
          {/* Linjer fra input til sum */}
          {inputYs.map((iy, i) => {
            const col = edgeColor(w[i]);
            const wd = edgeWidth(w[i]);
            const midX = (inputX + sumX) / 2;
            return (
              <g key={"e" + i}>
                <line
                  x1={inputX + NODE_R}
                  y1={iy}
                  x2={sumX - NODE_R}
                  y2={sumY}
                  stroke={col}
                  strokeWidth={wd}
                  opacity={0.85}
                />
                <text
                  x={midX}
                  y={(iy + sumY) / 2 - 6}
                  fontSize={11}
                  textAnchor="middle"
                  fill={col}
                  fontFamily="ui-monospace, monospace"
                >
                  w{i + 1}={fmt(w[i])}
                </text>
              </g>
            );
          })}

          {/* Linje fra sum til aktivering */}
          <line
            x1={sumX + NODE_R}
            y1={sumY}
            x2={actLeft}
            y2={sumY}
            stroke="#64748b"
            strokeWidth={1.5}
          />
          <text
            x={(sumX + actLeft) / 2}
            y={sumY - 6}
            fontSize={11}
            textAnchor="middle"
            fill="#475569"
            fontFamily="ui-monospace, monospace"
          >
            z={fmt(z)}
          </text>

          {/* Input-noder */}
          {inputYs.map((iy, i) => (
            <g key={"n" + i}>
              <circle
                cx={inputX}
                cy={iy}
                r={NODE_R}
                fill="#e0e7ff"
                stroke="#6366f1"
                strokeWidth={1.5}
              />
              <text
                x={inputX}
                y={iy + 4}
                textAnchor="middle"
                fontSize={12}
                fontFamily="ui-monospace, monospace"
                fill="#1e1b4b"
              >
                {fmt(x[i])}
              </text>
              <text
                x={inputX - NODE_R - 6}
                y={iy + 4}
                textAnchor="end"
                fontSize={11}
                fill="#475569"
                fontFamily="ui-monospace, monospace"
              >
                x{i + 1}
              </text>
            </g>
          ))}

          {/* Sum-node */}
          <circle
            cx={sumX}
            cy={sumY}
            r={NODE_R}
            fill="#fef3c7"
            stroke="#d97706"
            strokeWidth={1.5}
          />
          <text
            x={sumX}
            y={sumY + 5}
            textAnchor="middle"
            fontSize={14}
            fontFamily="ui-monospace, monospace"
            fill="#78350f"
          >
            Σ
          </text>
          <text
            x={sumX}
            y={sumY + NODE_R + 14}
            textAnchor="middle"
            fontSize={11}
            fill="#475569"
            fontFamily="ui-monospace, monospace"
          >
            b={fmt(b)}
          </text>

          {/* Aktiveringspanel */}
          <rect
            x={actLeft}
            y={actTop}
            width={ACT_W}
            height={ACT_H}
            fill="white"
            stroke="#cbd5e1"
            strokeWidth={1}
            rx={4}
          />
          {/* akser */}
          <line
            x1={actLeft}
            y1={actTop + ACT_H - ((0 - yMin) / (yMax - yMin)) * ACT_H}
            x2={actLeft + ACT_W}
            y2={actTop + ACT_H - ((0 - yMin) / (yMax - yMin)) * ACT_H}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          <line
            x1={actLeft + ACT_W / 2}
            y1={actTop}
            x2={actLeft + ACT_W / 2}
            y2={actTop + ACT_H}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth={1.8} />
          <circle cx={pointPx} cy={pointPy} r={4} fill="#dc2626" />
          <text
            x={actLeft + ACT_W / 2}
            y={actTop - 4}
            textAnchor="middle"
            fontSize={10}
            fill="#475569"
            fontFamily="ui-monospace, monospace"
          >
            {ACT_LABEL[act]}
          </text>

          {/* Linje fra aktivering til output */}
          <line
            x1={actLeft + ACT_W}
            y1={sumY}
            x2={outX - NODE_R}
            y2={sumY}
            stroke="#64748b"
            strokeWidth={1.5}
          />

          {/* Output-node */}
          <circle
            cx={outX}
            cy={sumY}
            r={NODE_R}
            fill={`rgba(37, 99, 235, ${0.15 + 0.6 * Math.min(1, Math.max(0, (a - yMin) / (yMax - yMin)))})`}
            stroke="#2563eb"
            strokeWidth={1.5}
          />
          <text
            x={outX}
            y={sumY + 5}
            textAnchor="middle"
            fontSize={12}
            fontFamily="ui-monospace, monospace"
            fill="#0f172a"
          >
            {fmt(a)}
          </text>
          <text
            x={outX}
            y={sumY + NODE_R + 14}
            textAnchor="middle"
            fontSize={11}
            fill="#475569"
            fontFamily="ui-monospace, monospace"
          >
            a
          </text>
        </svg>
      </div>

      {/* Live ligning */}
      <div className="mt-3 rounded-lg border border-border bg-muted/30 px-4 py-3 font-mono text-xs leading-relaxed overflow-x-auto whitespace-nowrap">
        <div>
          z = w₁·x₁ + w₂·x₂ + w₃·x₃ + b
        </div>
        <div className="mt-0.5">
          {"   = "}
          ({fmt(w[0])})·({fmt(x[0])}) + ({fmt(w[1])})·({fmt(x[1])}) +{" "}
          ({fmt(w[2])})·({fmt(x[2])}) + ({fmt(b)})
        </div>
        <div className="mt-0.5">
          {"   = "}
          <span className="text-amber-700 dark:text-amber-400 font-semibold">{fmt(z, 3)}</span>
        </div>
        <div className="mt-1">
          a = {ACT_LABEL[act]} = {ACT_FORMULA[act].replace("z", `(${fmt(z, 2)})`)} ={" "}
          <span className="text-brand font-semibold">{fmt(a, 3)}</span>
        </div>
      </div>

      {/* Kontroller */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
            Inputs (x)
          </div>
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Slider
                key={i}
                label={`x${i + 1}`}
                value={x[i]}
                min={-1}
                max={1}
                onChange={(n) => {
                  const nx = [...x] as [number, number, number];
                  nx[i] = n;
                  setX(nx);
                }}
              />
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
            Vekter (w), bias (b)
          </div>
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Slider
                key={i}
                label={`w${i + 1}`}
                value={w[i]}
                min={-2}
                max={2}
                onChange={(n) => {
                  const nw = [...w] as [number, number, number];
                  nw[i] = n;
                  setW(nw);
                }}
                color={edgeColor(w[i])}
              />
            ))}
            <Slider label="b" value={b} min={-2} max={2} onChange={setB} />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Aktivering:</span>
          <select
            className="rounded border border-border bg-background px-2 py-1 text-xs"
            value={act}
            onChange={(e) => setAct(e.target.value as ActName)}
          >
            <option value="sigmoid">sigmoid</option>
            <option value="relu">ReLU</option>
            <option value="tanh">tanh</option>
            <option value="linear">lineær (ingen)</option>
          </select>
        </label>
        <button
          onClick={reset}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted/50"
        >
          <RotateCcw className="h-3 w-3" /> tilbakestill
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Mode 2: AKTIVERINGER SIDE-BY-SIDE
// ============================================================
function ActivationsCompare() {
  const [z, setZ] = useState(0.5);

  const ACTS: ActName[] = ["sigmoid", "relu", "tanh", "leaky"];
  const ACT_COLORS: Record<ActName, string> = {
    sigmoid: "#2563eb",
    relu: "#16a34a",
    tanh: "#a855f7",
    leaky: "#f97316",
    linear: "#64748b",
  };

  const W_PX = 560;
  const H_PX = 220;
  const PAD_L = 36;
  const PAD_R = 16;
  const PAD_T = 24;
  const PAD_B = 26;
  const plotW = W_PX - PAD_L - PAD_R;
  const plotH = H_PX - PAD_T - PAD_B;
  const zMin = -4;
  const zMax = 4;
  const yMin = -1.2;
  const yMax = 2.5;

  const xToPx = (zVal: number) =>
    PAD_L + ((zVal - zMin) / (zMax - zMin)) * plotW;
  const yToPx = (yVal: number) =>
    PAD_T + plotH - ((yVal - yMin) / (yMax - yMin)) * plotH;

  const curves = useMemo(() => {
    const N = 100;
    const out: Record<ActName, string> = {} as Record<ActName, string>;
    ACTS.forEach((name) => {
      const pts: string[] = [];
      for (let i = 0; i <= N; i++) {
        const zv = zMin + ((zMax - zMin) * i) / N;
        const yv = Math.max(yMin, Math.min(yMax, ACT_FN[name](zv)));
        pts.push(`${i === 0 ? "M" : "L"} ${xToPx(zv).toFixed(1)} ${yToPx(yv).toFixed(1)}`);
      }
      out[name] = pts.join(" ");
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const zPx = xToPx(z);

  return (
    <div>
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <svg viewBox={`0 0 ${W_PX} ${H_PX}`} className="w-full h-auto">
          {/* grid + akser */}
          <line x1={PAD_L} y1={yToPx(0)} x2={PAD_L + plotW} y2={yToPx(0)} stroke="#cbd5e1" />
          <line x1={xToPx(0)} y1={PAD_T} x2={xToPx(0)} y2={PAD_T + plotH} stroke="#cbd5e1" />
          {[-1, 1, 2].map((y) => (
            <g key={y}>
              <line
                x1={PAD_L}
                y1={yToPx(y)}
                x2={PAD_L + plotW}
                y2={yToPx(y)}
                stroke="#e2e8f0"
                strokeDasharray="2,3"
              />
              <text
                x={PAD_L - 4}
                y={yToPx(y) + 3}
                fontSize={9}
                textAnchor="end"
                fill="#94a3b8"
                fontFamily="ui-monospace, monospace"
              >
                {y}
              </text>
            </g>
          ))}
          {[-2, 2].map((zt) => (
            <text
              key={zt}
              x={xToPx(zt)}
              y={PAD_T + plotH + 12}
              fontSize={9}
              textAnchor="middle"
              fill="#94a3b8"
              fontFamily="ui-monospace, monospace"
            >
              {zt}
            </text>
          ))}

          {/* kurver */}
          {ACTS.map((name) => (
            <path
              key={name}
              d={curves[name]}
              fill="none"
              stroke={ACT_COLORS[name]}
              strokeWidth={2}
              opacity={0.9}
            />
          ))}

          {/* z-skrubb-linje */}
          <line
            x1={zPx}
            y1={PAD_T}
            x2={zPx}
            y2={PAD_T + plotH}
            stroke="#0f172a"
            strokeWidth={1.5}
            strokeDasharray="4,3"
          />
          {ACTS.map((name) => {
            const y = Math.max(yMin, Math.min(yMax, ACT_FN[name](z)));
            return (
              <circle
                key={name + "p"}
                cx={zPx}
                cy={yToPx(y)}
                r={4.5}
                fill={ACT_COLORS[name]}
                stroke="white"
                strokeWidth={1.5}
              />
            );
          })}

          {/* legenden inni plottet */}
          <g transform={`translate(${PAD_L + 8}, ${PAD_T + 6})`}>
            {ACTS.map((name, i) => (
              <g key={"l" + name} transform={`translate(0, ${i * 14})`}>
                <rect width={10} height={3} y={4} fill={ACT_COLORS[name]} />
                <text
                  x={14}
                  y={9}
                  fontSize={10}
                  fill="#334155"
                  fontFamily="ui-monospace, monospace"
                >
                  {name === "leaky" ? "leaky ReLU" : name}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      <div className="mt-3 rounded-lg border border-border p-3">
        <Slider
          label="z"
          value={z}
          min={-4}
          max={4}
          step={0.05}
          onChange={setZ}
          fmtVal={(n) => fmt(n)}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {ACTS.map((name) => (
          <div
            key={"v" + name}
            className="rounded-md border border-border bg-card/50 px-3 py-2"
            style={{ borderLeftColor: ACT_COLORS[name], borderLeftWidth: 3 }}
          >
            <div className="font-mono text-[11px] text-muted-foreground">
              {name === "leaky" ? "leaky ReLU" : name}
            </div>
            <div className="font-mono text-base font-semibold text-foreground">
              {fmt(ACT_FN[name](z), 3)}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Skrubb <span className="font-mono">z</span> for å se hvordan hver aktivering
        reagerer. Merk at sigmoid og tanh «metter» for store |z| (gradient → 0), mens
        ReLU klipper alt negativt og leaky ReLU lekker litt for å unngå «dying ReLU».
      </p>
    </div>
  );
}

// ============================================================
// Mode 3: TO-LAGS NETT (2 → 3 → 1)
// ============================================================
function TwoLayerNet() {
  const [x, setX] = useState<[number, number]>([0.6, -0.4]);
  const [W1, setW1] = useState<number[][]>([
    [1.2, -0.8],
    [-0.6, 1.1],
    [0.9, 0.7],
  ]);
  const [b1, setB1] = useState<[number, number, number]>([0.1, -0.2, 0.05]);
  const [W2, setW2] = useState<[number, number, number]>([1.0, -0.9, 0.8]);
  const [b2, setB2] = useState(0.0);
  const [act, setAct] = useState<ActName>("sigmoid");

  const reset = () => {
    setX([0.6, -0.4]);
    setW1([
      [1.2, -0.8],
      [-0.6, 1.1],
      [0.9, 0.7],
    ]);
    setB1([0.1, -0.2, 0.05]);
    setW2([1.0, -0.9, 0.8]);
    setB2(0.0);
    setAct("sigmoid");
  };

  const f = ACT_FN[act];
  const z1 = [0, 1, 2].map((i) => W1[i][0] * x[0] + W1[i][1] * x[1] + b1[i]);
  const a1 = z1.map(f);
  const z2 = W2[0] * a1[0] + W2[1] * a1[1] + W2[2] * a1[2] + b2;
  const a2 = f(z2);

  // Layout
  const W_PX = 580;
  const H_PX = 280;
  const inputX = 60;
  const inputYs = [100, 200];
  const hiddenX = 280;
  const hiddenYs = [60, 140, 220];
  const outX = 510;
  const outY = 140;
  const NODE_R = 22;

  const nodeFillFromA = (val: number) => {
    // Lin/relu kan gå utenfor (0,1) — squish for visning
    const v = Math.max(0, Math.min(1, act === "tanh" ? (val + 1) / 2 : act === "linear" || act === "relu" ? val / 4 : val));
    return `rgba(37, 99, 235, ${(0.15 + 0.6 * v).toFixed(3)})`;
  };

  return (
    <div>
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <svg viewBox={`0 0 ${W_PX} ${H_PX}`} className="w-full h-auto" style={{ maxHeight: 340 }}>
          {/* lagetiketter */}
          <text x={inputX} y={28} textAnchor="middle" fontSize={11} fill="#64748b" fontFamily="ui-monospace, monospace">
            Input
          </text>
          <text x={hiddenX} y={28} textAnchor="middle" fontSize={11} fill="#64748b" fontFamily="ui-monospace, monospace">
            Skjult (3)
          </text>
          <text x={outX} y={28} textAnchor="middle" fontSize={11} fill="#64748b" fontFamily="ui-monospace, monospace">
            Output
          </text>

          {/* Edges input → hidden */}
          {hiddenYs.map((hy, j) =>
            inputYs.map((iy, i) => {
              const w = W1[j][i];
              return (
                <line
                  key={`e1-${j}-${i}`}
                  x1={inputX + NODE_R}
                  y1={iy}
                  x2={hiddenX - NODE_R}
                  y2={hy}
                  stroke={edgeColor(w)}
                  strokeWidth={edgeWidth(w)}
                  opacity={0.75}
                />
              );
            })
          )}
          {/* Edges hidden → output */}
          {hiddenYs.map((hy, j) => {
            const w = W2[j];
            return (
              <line
                key={`e2-${j}`}
                x1={hiddenX + NODE_R}
                y1={hy}
                x2={outX - NODE_R}
                y2={outY}
                stroke={edgeColor(w)}
                strokeWidth={edgeWidth(w)}
                opacity={0.75}
              />
            );
          })}

          {/* Input-noder */}
          {inputYs.map((iy, i) => (
            <g key={"in" + i}>
              <circle cx={inputX} cy={iy} r={NODE_R} fill="#e0e7ff" stroke="#6366f1" strokeWidth={1.5} />
              <text x={inputX} y={iy + 4} textAnchor="middle" fontSize={12} fontFamily="ui-monospace, monospace" fill="#1e1b4b">
                {fmt(x[i])}
              </text>
              <text x={inputX - NODE_R - 4} y={iy + 4} textAnchor="end" fontSize={11} fill="#475569" fontFamily="ui-monospace, monospace">
                x{i + 1}
              </text>
            </g>
          ))}

          {/* Hidden-noder */}
          {hiddenYs.map((hy, j) => (
            <g key={"h" + j}>
              <circle cx={hiddenX} cy={hy} r={NODE_R} fill={nodeFillFromA(a1[j])} stroke="#2563eb" strokeWidth={1.5} />
              <text x={hiddenX} y={hy + 4} textAnchor="middle" fontSize={11} fontFamily="ui-monospace, monospace" fill="#0f172a">
                {fmt(a1[j])}
              </text>
              <text x={hiddenX} y={hy + NODE_R + 12} textAnchor="middle" fontSize={9} fill="#475569" fontFamily="ui-monospace, monospace">
                z={fmt(z1[j])}
              </text>
            </g>
          ))}

          {/* Output-node */}
          <circle cx={outX} cy={outY} r={NODE_R + 2} fill={nodeFillFromA(a2)} stroke="#16a34a" strokeWidth={2} />
          <text x={outX} y={outY + 5} textAnchor="middle" fontSize={13} fontFamily="ui-monospace, monospace" fill="#0f172a" fontWeight={600}>
            {fmt(a2)}
          </text>
          <text x={outX} y={outY + NODE_R + 14} textAnchor="middle" fontSize={10} fill="#475569" fontFamily="ui-monospace, monospace">
            z={fmt(z2)}
          </text>
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
            Inputs
          </div>
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <Slider
                key={i}
                label={`x${i + 1}`}
                value={x[i]}
                min={-1}
                max={1}
                onChange={(n) => {
                  const nx = [...x] as [number, number];
                  nx[i] = n;
                  setX(nx);
                }}
              />
            ))}
          </div>
          <div className="mt-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Output-vekter (W²) + bias
          </div>
          <div className="mt-2 space-y-2">
            {[0, 1, 2].map((j) => (
              <Slider
                key={"w2" + j}
                label={`v${j + 1}`}
                value={W2[j]}
                min={-2}
                max={2}
                color={edgeColor(W2[j])}
                onChange={(n) => {
                  const w = [...W2] as [number, number, number];
                  w[j] = n;
                  setW2(w);
                }}
              />
            ))}
            <Slider label="b²" value={b2} min={-2} max={2} onChange={setB2} />
          </div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
            Skjult-lag vekter (W¹) + bias
          </div>
          <div className="space-y-2">
            {[0, 1, 2].map((j) => (
              <div key={"h" + j} className="border-t border-border/60 pt-2 first:border-t-0 first:pt-0">
                <div className="text-[10px] text-muted-foreground mb-1 font-mono">
                  skjult #{j + 1}
                </div>
                {[0, 1].map((i) => (
                  <Slider
                    key={`w1-${j}-${i}`}
                    label={`w${j + 1}${i + 1}`}
                    value={W1[j][i]}
                    min={-2}
                    max={2}
                    color={edgeColor(W1[j][i])}
                    onChange={(n) => {
                      const next = W1.map((r) => [...r]);
                      next[j][i] = n;
                      setW1(next);
                    }}
                  />
                ))}
                <Slider
                  label={`b${j + 1}`}
                  value={b1[j]}
                  min={-2}
                  max={2}
                  onChange={(n) => {
                    const nb = [...b1] as [number, number, number];
                    nb[j] = n;
                    setB1(nb);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Aktivering (alle lag):</span>
          <select
            className="rounded border border-border bg-background px-2 py-1 text-xs"
            value={act}
            onChange={(e) => setAct(e.target.value as ActName)}
          >
            <option value="sigmoid">sigmoid</option>
            <option value="relu">ReLU</option>
            <option value="tanh">tanh</option>
            <option value="linear">lineær</option>
          </select>
        </label>
        <button
          onClick={reset}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted/50"
        >
          <RotateCcw className="h-3 w-3" /> tilbakestill
        </button>
      </div>

      <div className="mt-3 rounded-lg border border-border bg-muted/30 px-4 py-3 font-mono text-[11px] leading-relaxed overflow-x-auto">
        <div className="font-semibold text-foreground mb-1">Forward-pass:</div>
        {[0, 1, 2].map((j) => (
          <div key={"eq-h" + j}>
            h{j + 1}: z = ({fmt(W1[j][0])})·({fmt(x[0])}) + ({fmt(W1[j][1])})·({fmt(x[1])}) + ({fmt(b1[j])})
            {" = "}
            <span className="text-amber-700 dark:text-amber-400">{fmt(z1[j])}</span>
            {"   a = "}
            <span className="text-brand">{fmt(a1[j])}</span>
          </div>
        ))}
        <div className="mt-1">
          out: z = ({fmt(W2[0])})·({fmt(a1[0])}) + ({fmt(W2[1])})·({fmt(a1[1])}) + ({fmt(W2[2])})·({fmt(a1[2])}) + ({fmt(b2)})
          {" = "}
          <span className="text-amber-700 dark:text-amber-400">{fmt(z2)}</span>
          {"   a = "}
          <span className="text-brand font-semibold">{fmt(a2)}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Mode 4: XOR-trening manuelt
// ============================================================
function XorTrainer() {
  // 2 → 2 → 1, sigmoid hele veien
  const [W1, setW1] = useState<number[][]>([
    [4, 4],
    [-4, -4],
  ]);
  const [b1, setB1] = useState<[number, number]>([-2, 6]);
  const [W2, setW2] = useState<[number, number]>([6, 6]);
  const [b2, setB2] = useState(-3);

  const reset = () => {
    setW1([
      [4, 4],
      [-4, -4],
    ]);
    setB1([-2, 6]);
    setW2([6, 6]);
    setB2(-3);
  };

  const forward = (x1: number, x2: number) => {
    const z1 = [
      W1[0][0] * x1 + W1[0][1] * x2 + b1[0],
      W1[1][0] * x1 + W1[1][1] * x2 + b1[1],
    ];
    const a1 = z1.map(sigmoid);
    const z2 = W2[0] * a1[0] + W2[1] * a1[1] + b2;
    const a2 = sigmoid(z2);
    return { a1, a2 };
  };

  const XOR_DATA: { x1: number; x2: number; y: number }[] = [
    { x1: 0, x2: 0, y: 0 },
    { x1: 0, x2: 1, y: 1 },
    { x1: 1, x2: 0, y: 1 },
    { x1: 1, x2: 1, y: 0 },
  ];

  const results = XOR_DATA.map((row) => {
    const { a2 } = forward(row.x1, row.x2);
    const pred = a2 >= 0.5 ? 1 : 0;
    const correct = pred === row.y;
    const err = row.y - a2;
    return { ...row, a2, pred, correct, err2: err * err };
  });

  const correctCount = results.filter((r) => r.correct).length;
  const totalLoss = results.reduce((s, r) => s + r.err2, 0) / results.length;

  return (
    <div>
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 2x2-grid */}
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
              XOR-sannhetstabell
            </div>
            <div className="grid grid-cols-2 gap-2">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={
                    "rounded-md border-2 p-3 text-xs " +
                    (r.correct
                      ? "border-green-500 bg-green-500/10"
                      : "border-red-500 bg-red-500/10")
                  }
                >
                  <div className="font-mono">
                    x = ({r.x1}, {r.x2})
                  </div>
                  <div className="font-mono mt-0.5">
                    mål: y = <span className="font-semibold">{r.y}</span>
                  </div>
                  <div className="font-mono">
                    nett: a = <span className="font-semibold">{fmt(r.a2, 3)}</span> → pred{" "}
                    {r.pred}
                  </div>
                  <div className={"mt-1 font-semibold " + (r.correct ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400")}>
                    {r.correct ? "RIKTIG" : "FEIL"}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs font-mono">
              riktige: <span className="font-semibold">{correctCount} / 4</span>
              {"   "}MSE-loss:{" "}
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                {fmt(totalLoss, 4)}
              </span>
            </div>
          </div>

          {/* Topologi-skisse */}
          <div className="flex-1 min-w-[260px]">
            <svg viewBox="0 0 280 220" className="w-full h-auto" style={{ maxHeight: 220 }}>
              {/* input → hidden */}
              {[60, 160].map((hy, j) =>
                [60, 160].map((iy, i) => {
                  const w = W1[j][i];
                  return (
                    <line
                      key={`xe-${j}-${i}`}
                      x1={50}
                      y1={iy}
                      x2={150}
                      y2={hy}
                      stroke={edgeColor(w)}
                      strokeWidth={edgeWidth(w)}
                      opacity={0.75}
                    />
                  );
                })
              )}
              {/* hidden → out */}
              {[60, 160].map((hy, j) => {
                const w = W2[j];
                return (
                  <line
                    key={`xe2-${j}`}
                    x1={170}
                    y1={hy}
                    x2={240}
                    y2={110}
                    stroke={edgeColor(w)}
                    strokeWidth={edgeWidth(w)}
                    opacity={0.75}
                  />
                );
              })}
              {/* noder */}
              {[60, 160].map((iy, i) => (
                <g key={"xi" + i}>
                  <circle cx={40} cy={iy} r={16} fill="#e0e7ff" stroke="#6366f1" strokeWidth={1.5} />
                  <text x={40} y={iy + 4} textAnchor="middle" fontSize={11} fontFamily="ui-monospace, monospace" fill="#1e1b4b">
                    x{i + 1}
                  </text>
                </g>
              ))}
              {[60, 160].map((hy, j) => (
                <g key={"xh" + j}>
                  <circle cx={160} cy={hy} r={16} fill="#dbeafe" stroke="#2563eb" strokeWidth={1.5} />
                  <text x={160} y={hy + 4} textAnchor="middle" fontSize={11} fontFamily="ui-monospace, monospace" fill="#0f172a">
                    h{j + 1}
                  </text>
                </g>
              ))}
              <g>
                <circle cx={250} cy={110} r={18} fill="#dcfce7" stroke="#16a34a" strokeWidth={2} />
                <text x={250} y={114} textAnchor="middle" fontSize={12} fontFamily="ui-monospace, monospace" fill="#0f172a">
                  ŷ
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
            Skjult-lag (W¹, b¹)
          </div>
          <div className="space-y-2">
            {[0, 1].map((j) => (
              <div key={"hj" + j} className="border-t border-border/60 pt-2 first:border-t-0 first:pt-0">
                <div className="text-[10px] text-muted-foreground mb-1 font-mono">
                  skjult #{j + 1}
                </div>
                {[0, 1].map((i) => (
                  <Slider
                    key={`xw1-${j}-${i}`}
                    label={`w${j + 1}${i + 1}`}
                    value={W1[j][i]}
                    min={-8}
                    max={8}
                    step={0.1}
                    color={edgeColor(W1[j][i])}
                    onChange={(n) => {
                      const next = W1.map((r) => [...r]);
                      next[j][i] = n;
                      setW1(next);
                    }}
                  />
                ))}
                <Slider
                  label={`b${j + 1}`}
                  value={b1[j]}
                  min={-8}
                  max={8}
                  step={0.1}
                  onChange={(n) => {
                    const nb = [...b1] as [number, number];
                    nb[j] = n;
                    setB1(nb);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
            Output-lag (W², b²)
          </div>
          <div className="space-y-2">
            {[0, 1].map((j) => (
              <Slider
                key={"xw2" + j}
                label={`v${j + 1}`}
                value={W2[j]}
                min={-8}
                max={8}
                step={0.1}
                color={edgeColor(W2[j])}
                onChange={(n) => {
                  const w = [...W2] as [number, number];
                  w[j] = n;
                  setW2(w);
                }}
              />
            ))}
            <Slider
              label="b²"
              value={b2}
              min={-8}
              max={8}
              step={0.1}
              onChange={setB2}
            />
          </div>
          <button
            onClick={reset}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted/50"
          >
            <RotateCcw className="h-3 w-3" /> tilbake til startvekter
          </button>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        XOR er det klassiske eksemplet på et problem som <em>ikke</em> kan løses med
        én lineær perceptron. To skjulte nevroner gjør jobben — de lærer to halvplan
        som tilsammen skiller (0,1)/(1,0) fra (0,0)/(1,1). Prøv å få alle fire grønne.
      </p>
    </div>
  );
}

// ============================================================
// Hoved-eksport
// ============================================================
export function NeuronVisualizer() {
  const [mode, setMode] = useState<Mode>("single");

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <ModeSelector mode={mode} setMode={setMode} />
      {mode === "single" && <SingleNeuron />}
      {mode === "act" && <ActivationsCompare />}
      {mode === "twolay" && <TwoLayerNet />}
      {mode === "xor" && <XorTrainer />}
    </div>
  );
}
