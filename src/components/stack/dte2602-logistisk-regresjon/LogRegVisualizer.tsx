import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Square, StepForward, RotateCcw, Shuffle } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv visualisering for logistisk regresjon.
// Fire moduser:
//   1) "sigmoid"  — 1D: x, w, b slidere. Plot σ(wx+b) med nåværende x markert.
//   2) "boundary" — 2D: w1, w2, b slidere. Scatter + decision-line + live acc.
//   3) "train"    — 2D: Step / Run 100. GD oppdaterer (w1, w2, b). Loss-kurve.
//   4) "loss"     — Sammenlign log-loss og MSE som funksjon av p̂ når y=1.
// --------------------------------------------------------------------------

type Mode = "sigmoid" | "boundary" | "train" | "loss";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "sigmoid", label: "1D sigmoid", sub: "σ(wx + b)" },
  { id: "boundary", label: "2D beslutningsgrense", sub: "w₁x₁ + w₂x₂ + b" },
  { id: "train", label: "Gradient descent", sub: "Tren modellen" },
  { id: "loss", label: "Log-loss vs MSE", sub: "Hvorfor log-loss" },
];

const MODE_NOTE: Record<Mode, string> = {
  sigmoid:
    "Sigmoid mapper z = wx + b til (0, 1). σ(0) = 0.5 er klassifiseringsgrensa. Skru w opp for brattere overgang.",
  boundary:
    "Beslutningsgrensa w₁x₁ + w₂x₂ + b = 0 er en linje i 2D. Punkter på samme side får samme prediksjon.",
  train:
    "Gradient descent oppdaterer (w₁, w₂, b) ved å minimere log-loss. Linja roterer mot optimal posisjon.",
  loss:
    "Når y = 1 og p̂ → 0 går log-loss mot ∞, mens MSE bare når 1. Det er derfor log-loss straffer 'selvsikkert feil' så hardt.",
};

// ---------- matte ----------

function sigmoid(z: number): number {
  if (z >= 0) {
    const e = Math.exp(-z);
    return 1 / (1 + e);
  }
  const e = Math.exp(z);
  return e / (1 + e);
}

// numerisk stabil log-loss for ett punkt med p̂ = σ(z)
function logLossPoint(z: number, y: 0 | 1): number {
  // -[y·log σ(z) + (1-y)·log(1-σ(z))]
  // = log(1 + e^{-z}) hvis y = 1
  // = log(1 + e^{z})  hvis y = 0
  if (y === 1) {
    return z >= 0 ? Math.log1p(Math.exp(-z)) : -z + Math.log1p(Math.exp(z));
  }
  return z >= 0 ? z + Math.log1p(Math.exp(-z)) : Math.log1p(Math.exp(z));
}

// ---------- typer ----------

type Pt2D = { x1: number; x2: number; y: 0 | 1 };
type DatasetKind = "separable" | "overlap";

// ---------- datasett (faste) ----------

const DATA_SEPARABLE: Pt2D[] = [
  // klasse 0 (rundt (-1.5, -1.0))
  { x1: -2.4, x2: -1.4, y: 0 },
  { x1: -1.8, x2: -0.8, y: 0 },
  { x1: -1.2, x2: -1.6, y: 0 },
  { x1: -2.0, x2: -0.4, y: 0 },
  { x1: -0.8, x2: -1.2, y: 0 },
  { x1: -1.6, x2: -1.8, y: 0 },
  { x1: -2.6, x2: -0.6, y: 0 },
  { x1: -1.0, x2: -0.5, y: 0 },
  { x1: -2.2, x2: -1.1, y: 0 },
  { x1: -0.6, x2: -1.6, y: 0 },
  // klasse 1 (rundt (1.5, 1.0))
  { x1: 2.4, x2: 1.4, y: 1 },
  { x1: 1.8, x2: 0.8, y: 1 },
  { x1: 1.2, x2: 1.6, y: 1 },
  { x1: 2.0, x2: 0.4, y: 1 },
  { x1: 0.8, x2: 1.2, y: 1 },
  { x1: 1.6, x2: 1.8, y: 1 },
  { x1: 2.6, x2: 0.6, y: 1 },
  { x1: 1.0, x2: 0.5, y: 1 },
  { x1: 2.2, x2: 1.1, y: 1 },
  { x1: 0.6, x2: 1.6, y: 1 },
];

const DATA_OVERLAP: Pt2D[] = [
  // klasse 0 — vidt spredt
  { x1: -1.8, x2: -0.6, y: 0 },
  { x1: -1.0, x2: 0.4, y: 0 },
  { x1: -2.2, x2: 0.8, y: 0 },
  { x1: 0.3, x2: -0.8, y: 0 },
  { x1: -0.4, x2: -1.4, y: 0 },
  { x1: -1.6, x2: -1.8, y: 0 },
  { x1: 0.8, x2: 0.2, y: 0 },
  { x1: -2.5, x2: -0.2, y: 0 },
  { x1: 0.1, x2: 1.0, y: 0 },
  { x1: -1.2, x2: 1.4, y: 0 },
  // klasse 1 — overlapper med 0
  { x1: 0.6, x2: -0.4, y: 1 },
  { x1: 1.8, x2: 1.4, y: 1 },
  { x1: 1.2, x2: 0.2, y: 1 },
  { x1: 2.2, x2: -0.6, y: 1 },
  { x1: -0.2, x2: 0.8, y: 1 },
  { x1: 1.4, x2: -1.0, y: 1 },
  { x1: 2.4, x2: 0.8, y: 1 },
  { x1: 0.4, x2: 1.8, y: 1 },
  { x1: 1.8, x2: -0.2, y: 1 },
  { x1: 2.0, x2: 1.6, y: 1 },
];

function getData(kind: DatasetKind): Pt2D[] {
  return kind === "separable" ? DATA_SEPARABLE : DATA_OVERLAP;
}

// ---------- gradient descent på log-loss ----------

type Theta = { w1: number; w2: number; b: number };

function predProb(t: Theta, p: Pt2D): number {
  return sigmoid(t.w1 * p.x1 + t.w2 * p.x2 + t.b);
}

function dataLogLoss(t: Theta, data: Pt2D[]): number {
  let s = 0;
  for (const p of data) {
    const z = t.w1 * p.x1 + t.w2 * p.x2 + t.b;
    s += logLossPoint(z, p.y);
  }
  return s / data.length;
}

function accuracy(t: Theta, data: Pt2D[]): number {
  let ok = 0;
  for (const p of data) {
    const ph = predProb(t, p);
    if ((ph >= 0.5 ? 1 : 0) === p.y) ok++;
  }
  return ok / data.length;
}

function gdStep(t: Theta, data: Pt2D[], lr: number): Theta {
  let gw1 = 0,
    gw2 = 0,
    gb = 0;
  for (const p of data) {
    const err = predProb(t, p) - p.y;
    gw1 += err * p.x1;
    gw2 += err * p.x2;
    gb += err;
  }
  const n = data.length;
  return {
    w1: t.w1 - (lr * gw1) / n,
    w2: t.w2 - (lr * gw2) / n,
    b: t.b - (lr * gb) / n,
  };
}

// ============================================================================
// hoved-komponent
// ============================================================================

export function LogRegVisualizer() {
  const [mode, setMode] = useState<Mode>("sigmoid");

  // 1D-state
  const [x1d, setX1d] = useState(0.0);
  const [w1d, setW1d] = useState(1.0);
  const [b1d, setB1d] = useState(0.0);

  // 2D / boundary-state (manuell)
  const [wm1, setWm1] = useState(1.0);
  const [wm2, setWm2] = useState(1.0);
  const [bm, setBm] = useState(0.0);

  // dataset
  const [dataset, setDataset] = useState<DatasetKind>("separable");
  const data = useMemo(() => getData(dataset), [dataset]);

  // trenings-state
  const [theta, setTheta] = useState<Theta>({ w1: 0, w2: 0, b: 0 });
  const [losses, setLosses] = useState<number[]>([]);
  const [lr, setLr] = useState(0.5);
  const [isRunning, setIsRunning] = useState(false);
  const runTimer = useRef<number | null>(null);

  // reset trening når dataset endres
  useEffect(() => {
    stopRun();
    setTheta({ w1: 0, w2: 0, b: 0 });
    setLosses([dataLogLoss({ w1: 0, w2: 0, b: 0 }, getData(dataset))]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset]);

  // initialiser tap-historikk ved mount
  useEffect(() => {
    setLosses([dataLogLoss({ w1: 0, w2: 0, b: 0 }, data)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopRun() {
    if (runTimer.current !== null) {
      window.clearInterval(runTimer.current);
      runTimer.current = null;
    }
    setIsRunning(false);
  }

  function trainStep(n = 1) {
    setTheta((t) => {
      let cur = t;
      const newLosses: number[] = [];
      for (let i = 0; i < n; i++) {
        cur = gdStep(cur, data, lr);
        newLosses.push(dataLogLoss(cur, data));
      }
      setLosses((ls) => [...ls, ...newLosses].slice(-200));
      return cur;
    });
  }

  function runMany() {
    if (isRunning) {
      stopRun();
      return;
    }
    setIsRunning(true);
    runTimer.current = window.setInterval(() => {
      setTheta((t) => {
        const nt = gdStep(t, data, lr);
        setLosses((ls) => [...ls, dataLogLoss(nt, data)].slice(-200));
        return nt;
      });
    }, 80);
  }

  function resetTrain() {
    stopRun();
    setTheta({ w1: 0, w2: 0, b: 0 });
    setLosses([dataLogLoss({ w1: 0, w2: 0, b: 0 }, data)]);
  }

  // stopp auto-run når man bytter modus
  useEffect(() => {
    if (mode !== "train") stopRun();
  }, [mode]);

  // ---------- avledede verdier ----------

  const z1d = w1d * x1d + b1d;
  const p1d = sigmoid(z1d);
  const cls1d = p1d >= 0.5 ? 1 : 0;

  const accManual = useMemo(
    () => accuracy({ w1: wm1, w2: wm2, b: bm }, data),
    [wm1, wm2, bm, data],
  );
  const accTrain = useMemo(() => accuracy(theta, data), [theta, data]);
  const lossTrain = losses[losses.length - 1] ?? 0;

  // ---------- RENDER ----------

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Topp-bar */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Logistisk regresjon — fra sigmoid til full GD-trening
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                mode === m.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
              title={m.sub}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visualisering */}
      <div className="p-4 sm:p-6 min-h-[280px] flex items-center justify-center bg-background">
        {mode === "sigmoid" && (
          <SigmoidPlot x={x1d} w={w1d} b={b1d} />
        )}
        {mode === "boundary" && (
          <BoundaryPlot data={data} theta={{ w1: wm1, w2: wm2, b: bm }} />
        )}
        {mode === "train" && (
          <TrainView data={data} theta={theta} losses={losses} />
        )}
        {mode === "loss" && <LossCompare />}
      </div>

      {/* Kontroller */}
      <div className="px-4 py-3 border-t border-border bg-muted/20 space-y-3">
        <div className="text-xs text-muted-foreground italic">{MODE_NOTE[mode]}</div>

        {/* 1D-kontroller */}
        {mode === "sigmoid" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <SliderRow label="x" value={x1d} setValue={setX1d} min={-5} max={5} step={0.05} />
              <SliderRow label="w" value={w1d} setValue={setW1d} min={-5} max={5} step={0.05} />
              <SliderRow label="b" value={b1d} setValue={setB1d} min={-5} max={5} step={0.05} />
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-mono tabular-nums pt-1">
              <span className="text-muted-foreground">
                z = wx + b = <span className="text-foreground">{z1d.toFixed(3)}</span>
              </span>
              <span className="text-muted-foreground">
                σ(z) = <span className="text-foreground">{p1d.toFixed(3)}</span>
              </span>
              <span className="text-muted-foreground">
                klasse:{" "}
                <span
                  className={cls1d === 1 ? "text-brand font-semibold" : "text-success font-semibold"}
                >
                  {cls1d}
                </span>{" "}
                (terskel 0.5)
              </span>
            </div>
          </>
        )}

        {/* 2D manuell-kontroller */}
        {mode === "boundary" && (
          <>
            <DatasetPicker dataset={dataset} setDataset={setDataset} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <SliderRow label="w₁" value={wm1} setValue={setWm1} min={-5} max={5} step={0.05} />
              <SliderRow label="w₂" value={wm2} setValue={setWm2} min={-5} max={5} step={0.05} />
              <SliderRow label="b" value={bm} setValue={setBm} min={-5} max={5} step={0.05} />
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-mono tabular-nums pt-1">
              <span className="text-muted-foreground">
                accuracy:{" "}
                <span className="text-foreground font-semibold">
                  {(accManual * 100).toFixed(1)}%
                </span>
              </span>
              <span className="text-muted-foreground">
                grense: w₁x₁ + w₂x₂ + b = 0
              </span>
            </div>
          </>
        )}

        {/* Trenings-kontroller */}
        {mode === "train" && (
          <>
            <DatasetPicker dataset={dataset} setDataset={setDataset} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SliderRow
                label="lr η"
                value={lr}
                setValue={setLr}
                min={0.01}
                max={3}
                step={0.01}
              />
              <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
                <span className="text-muted-foreground">
                  w₁ = <span className="text-foreground">{theta.w1.toFixed(3)}</span>
                </span>
                <span className="text-muted-foreground">
                  w₂ = <span className="text-foreground">{theta.w2.toFixed(3)}</span>
                </span>
                <span className="text-muted-foreground">
                  b = <span className="text-foreground">{theta.b.toFixed(3)}</span>
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-mono tabular-nums">
              <span className="text-muted-foreground">
                iter: <span className="text-foreground">{Math.max(0, losses.length - 1)}</span>
              </span>
              <span className="text-muted-foreground">
                log-loss: <span className="text-foreground">{lossTrain.toFixed(4)}</span>
              </span>
              <span className="text-muted-foreground">
                accuracy:{" "}
                <span className="text-foreground font-semibold">
                  {(accTrain * 100).toFixed(1)}%
                </span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => trainStep(1)}
                disabled={isRunning}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-brand/40 text-brand hover:bg-brand/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <StepForward className="h-3.5 w-3.5" />
                Steg
              </button>
              <button
                type="button"
                onClick={() => trainStep(100)}
                disabled={isRunning}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-brand/40 text-brand hover:bg-brand/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <StepForward className="h-3.5 w-3.5" />
                100 steg
              </button>
              <button
                type="button"
                onClick={runMany}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-brand/40 text-brand hover:bg-brand/10"
              >
                {isRunning ? (
                  <>
                    <Square className="h-3.5 w-3.5" />
                    Stopp
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    Kjør
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetTrain}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </>
        )}

        {mode === "loss" && (
          <div className="text-xs text-muted-foreground">
            Begge kurver viser «kost ved å predikere p̂ når sann y = 1». MSE-kurven er
            (1 − p̂)² — endelig og symmetrisk. Log-loss-kurven er −log(p̂) — blåser opp
            mot uendelig når p̂ → 0. Det er nettopp denne uendelige straffen som tvinger
            modellen til å aldri være «selvsikkert feil».
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Slider-rad
// ============================================================================

function SliderRow({
  label,
  value,
  setValue,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-muted-foreground w-14 shrink-0">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="flex-1 accent-brand"
      />
      <span className="font-mono text-xs w-14 text-right tabular-nums">
        {value.toFixed(2)}
      </span>
    </div>
  );
}

// ============================================================================
// Dataset-velger
// ============================================================================

function DatasetPicker({
  dataset,
  setDataset,
}: {
  dataset: DatasetKind;
  setDataset: (d: DatasetKind) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground">datasett:</span>
      <button
        type="button"
        onClick={() => setDataset("separable")}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
          dataset === "separable"
            ? "bg-brand/15 border-brand/40 text-brand"
            : "border-border hover:bg-muted"
        }`}
      >
        <Shuffle className="h-3 w-3" />
        Separerbart
      </button>
      <button
        type="button"
        onClick={() => setDataset("overlap")}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
          dataset === "overlap"
            ? "bg-brand/15 border-brand/40 text-brand"
            : "border-border hover:bg-muted"
        }`}
      >
        <Shuffle className="h-3 w-3" />
        Med overlap
      </button>
    </div>
  );
}

// ============================================================================
// 1D sigmoid-plott
// ============================================================================

function SigmoidPlot({ x, w, b }: { x: number; w: number; b: number }) {
  const W = 640;
  const H = 300;
  const padL = 40;
  const padR = 16;
  const padT = 16;
  const padB = 30;

  const xMin = -5;
  const xMax = 5;
  const yMin = 0;
  const yMax = 1;

  const xToPx = (xv: number) =>
    padL + ((xv - xMin) / (xMax - xMin)) * (W - padL - padR);
  const yToPx = (yv: number) =>
    padT + (1 - (yv - yMin) / (yMax - yMin)) * (H - padT - padB);

  // σ(wx + b) som funksjon av x
  const pathD = useMemo(() => {
    const N = 250;
    const pts: string[] = [];
    for (let i = 0; i <= N; i++) {
      const xv = xMin + ((xMax - xMin) * i) / N;
      const yv = sigmoid(w * xv + b);
      pts.push(`${i === 0 ? "M" : "L"} ${xToPx(xv).toFixed(2)} ${yToPx(yv).toFixed(2)}`);
    }
    return pts.join(" ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, b]);

  // x der σ(wx+b) = 0.5  →  wx + b = 0  →  x = -b/w
  const xBoundary = Math.abs(w) > 1e-6 ? -b / w : null;
  const cx = xToPx(Math.max(xMin, Math.min(xMax, x)));
  const cy = yToPx(sigmoid(w * x + b));

  const xTicks = [-5, -2.5, 0, 2.5, 5];
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-3xl mx-auto block"
        style={{ height: "min(42vh, 320px)" }}
      >
        {/* Gitter */}
        {xTicks.map((t) => (
          <g key={`vx-${t}`}>
            <line
              x1={xToPx(t)}
              y1={padT}
              x2={xToPx(t)}
              y2={H - padB}
              stroke="currentColor"
              strokeOpacity={0.06}
            />
            <text
              x={xToPx(t)}
              y={H - padB + 14}
              fontSize="10"
              textAnchor="middle"
              className="fill-muted-foreground"
              fontFamily="ui-monospace, monospace"
            >
              {t}
            </text>
          </g>
        ))}
        {yTicks.map((t) => (
          <g key={`vy-${t}`}>
            <line
              x1={padL}
              y1={yToPx(t)}
              x2={W - padR}
              y2={yToPx(t)}
              stroke="currentColor"
              strokeOpacity={0.06}
            />
            <text
              x={padL - 6}
              y={yToPx(t) + 3}
              fontSize="10"
              textAnchor="end"
              className="fill-muted-foreground"
              fontFamily="ui-monospace, monospace"
            >
              {t.toFixed(2)}
            </text>
          </g>
        ))}

        {/* 0.5-linje */}
        <line
          x1={padL}
          y1={yToPx(0.5)}
          x2={W - padR}
          y2={yToPx(0.5)}
          stroke="currentColor"
          strokeOpacity={0.25}
          strokeDasharray="3 3"
        />
        <text
          x={W - padR - 2}
          y={yToPx(0.5) - 3}
          fontSize="9"
          textAnchor="end"
          className="fill-muted-foreground"
          fontFamily="ui-monospace, monospace"
          opacity={0.7}
        >
          terskel 0.5
        </text>

        {/* Akser */}
        <line
          x1={padL}
          y1={H - padB}
          x2={W - padR}
          y2={H - padB}
          stroke="currentColor"
          strokeOpacity={0.3}
        />
        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={H - padB}
          stroke="currentColor"
          strokeOpacity={0.3}
        />

        {/* Sigmoid-kurve */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--brand, #6366f1)"
          strokeOpacity={0.85}
          strokeWidth={2}
        />

        {/* Vertikal x-markør */}
        {x >= xMin && x <= xMax && (
          <line
            x1={cx}
            y1={padT}
            x2={cx}
            y2={H - padB}
            stroke="currentColor"
            strokeOpacity={0.25}
            strokeDasharray="2 3"
          />
        )}

        {/* Beslutningsgrense på x-aksen (der σ = 0.5) */}
        {xBoundary !== null && xBoundary >= xMin && xBoundary <= xMax && (
          <line
            x1={xToPx(xBoundary)}
            y1={padT}
            x2={xToPx(xBoundary)}
            y2={H - padB}
            stroke="var(--destructive, #ef4444)"
            strokeOpacity={0.55}
            strokeWidth={1.2}
            strokeDasharray="4 3"
          />
        )}

        {/* Nåværende punkt */}
        {x >= xMin && x <= xMax && (
          <circle
            cx={cx}
            cy={cy}
            r={6}
            fill="var(--brand, #6366f1)"
            stroke="white"
            strokeWidth={2}
            style={{ transition: "cx 150ms ease-out, cy 150ms ease-out" }}
          />
        )}

        {/* Etikett */}
        <text
          x={W - padR}
          y={padT + 4}
          fontSize="11"
          textAnchor="end"
          className="fill-muted-foreground"
          fontFamily="ui-monospace, monospace"
        >
          σ(wx + b)
        </text>
      </svg>
    </div>
  );
}

// ============================================================================
// 2D scatter + beslutningsgrense
// ============================================================================

function BoundaryPlot({ data, theta }: { data: Pt2D[]; theta: Theta }) {
  const W = 560;
  const H = 360;
  const padL = 36;
  const padR = 16;
  const padT = 16;
  const padB = 30;

  const xMin = -3.5;
  const xMax = 3.5;
  const yMin = -2.5;
  const yMax = 2.5;

  const xToPx = (x: number) =>
    padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR);
  const yToPx = (y: number) =>
    padT + (1 - (y - yMin) / (yMax - yMin)) * (H - padT - padB);

  // beslutningsgrense w1*x1 + w2*x2 + b = 0
  // hvis |w2| > eps  →  x2 = -(w1*x1 + b)/w2
  // ellers hvis |w1| > eps → vertikal: x1 = -b/w1
  const line = useMemo(() => {
    const { w1, w2, b } = theta;
    if (Math.abs(w2) > 1e-6) {
      const y1 = -(w1 * xMin + b) / w2;
      const y2 = -(w1 * xMax + b) / w2;
      return { x1: xMin, y1, x2: xMax, y2, kind: "h" as const };
    }
    if (Math.abs(w1) > 1e-6) {
      const xv = -b / w1;
      return { x1: xv, y1: yMin, x2: xv, y2: yMax, kind: "v" as const };
    }
    return null;
  }, [theta]);

  const xTicks = [-3, -2, -1, 0, 1, 2, 3];
  const yTicks = [-2, -1, 0, 1, 2];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-2xl mx-auto block"
        style={{ height: "min(50vh, 380px)" }}
      >
        {/* Gitter */}
        {xTicks.map((t) => (
          <g key={`gx-${t}`}>
            <line
              x1={xToPx(t)}
              y1={padT}
              x2={xToPx(t)}
              y2={H - padB}
              stroke="currentColor"
              strokeOpacity={0.06}
            />
            <text
              x={xToPx(t)}
              y={H - padB + 14}
              fontSize="10"
              textAnchor="middle"
              className="fill-muted-foreground"
              fontFamily="ui-monospace, monospace"
            >
              {t}
            </text>
          </g>
        ))}
        {yTicks.map((t) => (
          <g key={`gy-${t}`}>
            <line
              x1={padL}
              y1={yToPx(t)}
              x2={W - padR}
              y2={yToPx(t)}
              stroke="currentColor"
              strokeOpacity={0.06}
            />
            <text
              x={padL - 6}
              y={yToPx(t) + 3}
              fontSize="10"
              textAnchor="end"
              className="fill-muted-foreground"
              fontFamily="ui-monospace, monospace"
            >
              {t}
            </text>
          </g>
        ))}

        {/* Akser */}
        <line
          x1={padL}
          y1={H - padB}
          x2={W - padR}
          y2={H - padB}
          stroke="currentColor"
          strokeOpacity={0.3}
        />
        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={H - padB}
          stroke="currentColor"
          strokeOpacity={0.3}
        />

        {/* Beslutningsgrense */}
        {line && (
          <line
            x1={xToPx(line.x1)}
            y1={yToPx(line.y1)}
            x2={xToPx(line.x2)}
            y2={yToPx(line.y2)}
            stroke="var(--destructive, #ef4444)"
            strokeOpacity={0.7}
            strokeWidth={2}
            style={{ transition: "x1 200ms ease-out, y1 200ms ease-out, x2 200ms ease-out, y2 200ms ease-out" }}
          />
        )}

        {/* Scatter */}
        {data.map((p, i) => {
          const ph = predProb(theta, p);
          const yhat = ph >= 0.5 ? 1 : 0;
          const correct = yhat === p.y;
          // sann klasse styrer fyllfarge, korrekt/feil styrer kant
          const fill = p.y === 1 ? "var(--brand, #6366f1)" : "#10b981";
          const stroke = correct ? "white" : "var(--destructive, #ef4444)";
          return (
            <circle
              key={`pt-${i}`}
              cx={xToPx(p.x1)}
              cy={yToPx(p.x2)}
              r={5}
              fill={fill}
              fillOpacity={0.85}
              stroke={stroke}
              strokeWidth={correct ? 1.5 : 2}
            />
          );
        })}

        {/* Legende */}
        <g transform={`translate(${W - padR - 110}, ${padT + 4})`}>
          <rect
            x={0}
            y={0}
            width={110}
            height={46}
            rx={4}
            fill="currentColor"
            fillOpacity={0.04}
            stroke="currentColor"
            strokeOpacity={0.12}
          />
          <circle cx={10} cy={14} r={4} fill="#10b981" />
          <text x={20} y={17} fontSize="10" className="fill-muted-foreground" fontFamily="ui-monospace, monospace">
            klasse 0
          </text>
          <circle cx={10} cy={32} r={4} fill="var(--brand, #6366f1)" />
          <text x={20} y={35} fontSize="10" className="fill-muted-foreground" fontFamily="ui-monospace, monospace">
            klasse 1
          </text>
        </g>
      </svg>
    </div>
  );
}

// ============================================================================
// Treningsvisning: scatter + linje + loss-kurve
// ============================================================================

function TrainView({
  data,
  theta,
  losses,
}: {
  data: Pt2D[];
  theta: Theta;
  losses: number[];
}) {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      <BoundaryPlot data={data} theta={theta} />
      <LossHistory losses={losses} />
    </div>
  );
}

function LossHistory({ losses }: { losses: number[] }) {
  const W = 480;
  const H = 280;
  const padL = 40;
  const padR = 12;
  const padT = 16;
  const padB = 30;

  const n = losses.length;
  const xMin = 0;
  const xMax = Math.max(20, n - 1);
  const yMin = 0;
  const yMax = Math.max(0.8, Math.max(...losses, 0.1) * 1.05);

  const xToPx = (x: number) =>
    padL + ((x - xMin) / Math.max(1, xMax - xMin)) * (W - padL - padR);
  const yToPx = (y: number) =>
    padT + (1 - (y - yMin) / (yMax - yMin)) * (H - padT - padB);

  const pathD = useMemo(() => {
    if (losses.length < 2) return "";
    return losses
      .map((l, i) => `${i === 0 ? "M" : "L"} ${xToPx(i).toFixed(2)} ${yToPx(l).toFixed(2)}`)
      .join(" ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [losses, xMax, yMax]);

  const yTicks = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax];
  const xTicks = useMemo(() => {
    const step = Math.max(1, Math.floor(xMax / 5));
    const arr: number[] = [];
    for (let t = 0; t <= xMax; t += step) arr.push(t);
    return arr;
  }, [xMax]);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" style={{ height: "min(40vh, 300px)" }}>
        {xTicks.map((t) => (
          <g key={`lx-${t}`}>
            <line
              x1={xToPx(t)}
              y1={padT}
              x2={xToPx(t)}
              y2={H - padB}
              stroke="currentColor"
              strokeOpacity={0.06}
            />
            <text
              x={xToPx(t)}
              y={H - padB + 14}
              fontSize="10"
              textAnchor="middle"
              className="fill-muted-foreground"
              fontFamily="ui-monospace, monospace"
            >
              {t}
            </text>
          </g>
        ))}
        {yTicks.map((t, i) => (
          <g key={`ly-${i}`}>
            <line
              x1={padL}
              y1={yToPx(t)}
              x2={W - padR}
              y2={yToPx(t)}
              stroke="currentColor"
              strokeOpacity={0.06}
            />
            <text
              x={padL - 6}
              y={yToPx(t) + 3}
              fontSize="10"
              textAnchor="end"
              className="fill-muted-foreground"
              fontFamily="ui-monospace, monospace"
            >
              {t.toFixed(2)}
            </text>
          </g>
        ))}

        <line
          x1={padL}
          y1={H - padB}
          x2={W - padR}
          y2={H - padB}
          stroke="currentColor"
          strokeOpacity={0.3}
        />
        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={H - padB}
          stroke="currentColor"
          strokeOpacity={0.3}
        />

        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="var(--brand, #6366f1)"
            strokeOpacity={0.85}
            strokeWidth={1.8}
          />
        )}

        <text
          x={W - padR}
          y={padT + 4}
          fontSize="11"
          textAnchor="end"
          className="fill-muted-foreground"
          fontFamily="ui-monospace, monospace"
        >
          log-loss per iterasjon
        </text>
      </svg>
    </div>
  );
}

// ============================================================================
// Log-loss vs MSE — sammenligning når y = 1
// ============================================================================

function LossCompare() {
  const W = 640;
  const H = 320;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 30;

  const xMin = 0.001;
  const xMax = 1;
  const yMin = 0;
  const yMax = 5;

  const xToPx = (x: number) =>
    padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR);
  const yToPx = (y: number) =>
    padT + (1 - (y - yMin) / (yMax - yMin)) * (H - padT - padB);

  // Begge kurver: kost ved å predikere p̂ når sann y = 1.
  // log-loss:  -log(p̂)
  // MSE:       (1 - p̂)²   (kvadrat-tap mot y = 1)
  const N = 300;
  const logPath: string[] = [];
  const msePath: string[] = [];
  for (let i = 0; i <= N; i++) {
    const p = xMin + ((xMax - xMin) * i) / N;
    const lv = Math.min(yMax, -Math.log(p));
    const mv = Math.min(yMax, (1 - p) * (1 - p));
    logPath.push(`${i === 0 ? "M" : "L"} ${xToPx(p).toFixed(2)} ${yToPx(lv).toFixed(2)}`);
    msePath.push(`${i === 0 ? "M" : "L"} ${xToPx(p).toFixed(2)} ${yToPx(mv).toFixed(2)}`);
  }

  const xTicks = [0, 0.25, 0.5, 0.75, 1];
  const yTicks = [0, 1, 2, 3, 4, 5];

  // markører ved noen prediksjoner
  const markers = [0.05, 0.2, 0.5, 0.9];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-3xl mx-auto block"
        style={{ height: "min(45vh, 360px)" }}
      >
        {xTicks.map((t) => (
          <g key={`cx-${t}`}>
            <line
              x1={xToPx(t)}
              y1={padT}
              x2={xToPx(t)}
              y2={H - padB}
              stroke="currentColor"
              strokeOpacity={0.06}
            />
            <text
              x={xToPx(t)}
              y={H - padB + 14}
              fontSize="10"
              textAnchor="middle"
              className="fill-muted-foreground"
              fontFamily="ui-monospace, monospace"
            >
              {t.toFixed(2)}
            </text>
          </g>
        ))}
        {yTicks.map((t) => (
          <g key={`cy-${t}`}>
            <line
              x1={padL}
              y1={yToPx(t)}
              x2={W - padR}
              y2={yToPx(t)}
              stroke="currentColor"
              strokeOpacity={0.06}
            />
            <text
              x={padL - 6}
              y={yToPx(t) + 3}
              fontSize="10"
              textAnchor="end"
              className="fill-muted-foreground"
              fontFamily="ui-monospace, monospace"
            >
              {t}
            </text>
          </g>
        ))}

        <line
          x1={padL}
          y1={H - padB}
          x2={W - padR}
          y2={H - padB}
          stroke="currentColor"
          strokeOpacity={0.3}
        />
        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={H - padB}
          stroke="currentColor"
          strokeOpacity={0.3}
        />

        {/* MSE-kurve */}
        <path
          d={msePath.join(" ")}
          fill="none"
          stroke="#10b981"
          strokeOpacity={0.85}
          strokeWidth={2}
        />
        {/* Log-loss-kurve */}
        <path
          d={logPath.join(" ")}
          fill="none"
          stroke="var(--brand, #6366f1)"
          strokeOpacity={0.9}
          strokeWidth={2}
        />

        {/* Sample-markører */}
        {markers.map((p) => {
          const lv = Math.min(yMax, -Math.log(p));
          const mv = Math.min(yMax, (1 - p) * (1 - p));
          return (
            <g key={`m-${p}`}>
              <line
                x1={xToPx(p)}
                y1={H - padB}
                x2={xToPx(p)}
                y2={yToPx(Math.max(lv, mv))}
                stroke="currentColor"
                strokeOpacity={0.18}
                strokeDasharray="2 3"
              />
              <circle cx={xToPx(p)} cy={yToPx(lv)} r={3} fill="var(--brand, #6366f1)" />
              <circle cx={xToPx(p)} cy={yToPx(mv)} r={3} fill="#10b981" />
              <text
                x={xToPx(p)}
                y={H - padB - 4}
                fontSize="9"
                textAnchor="middle"
                className="fill-muted-foreground"
                fontFamily="ui-monospace, monospace"
              >
                p̂={p}
              </text>
            </g>
          );
        })}

        {/* Akse-etiketter */}
        <text
          x={W / 2}
          y={H - 4}
          fontSize="11"
          textAnchor="middle"
          className="fill-muted-foreground"
          fontFamily="ui-monospace, monospace"
        >
          predikert p̂ (sann y = 1)
        </text>
        <text
          x={12}
          y={padT + 8}
          fontSize="11"
          className="fill-muted-foreground"
          fontFamily="ui-monospace, monospace"
        >
          kost
        </text>

        {/* Legende */}
        <g transform={`translate(${W - padR - 150}, ${padT + 4})`}>
          <rect
            x={0}
            y={0}
            width={150}
            height={46}
            rx={4}
            fill="currentColor"
            fillOpacity={0.04}
            stroke="currentColor"
            strokeOpacity={0.12}
          />
          <line x1={8} y1={14} x2={24} y2={14} stroke="var(--brand, #6366f1)" strokeWidth={2} />
          <text x={28} y={17} fontSize="10" className="fill-muted-foreground" fontFamily="ui-monospace, monospace">
            log-loss = −log(p̂)
          </text>
          <line x1={8} y1={32} x2={24} y2={32} stroke="#10b981" strokeWidth={2} />
          <text x={28} y={35} fontSize="10" className="fill-muted-foreground" fontFamily="ui-monospace, monospace">
            MSE = (1−p̂)²
          </text>
        </g>
      </svg>
    </div>
  );
}
