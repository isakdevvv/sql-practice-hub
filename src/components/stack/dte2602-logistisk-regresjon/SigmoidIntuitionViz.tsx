import { useMemo, useState } from "react";

const W = 280;
const H = 200;
const PAD = 28;

function sigmoid(z: number): number {
  if (z > 40) return 1;
  if (z < -40) return 0;
  return 1 / (1 + Math.exp(-z));
}

type Pt = { x: number; y: 0 | 1 };

// 20 binary points sampled along an x-axis with class skew
const DATA: Pt[] = [
  { x: -3.2, y: 0 },
  { x: -2.7, y: 0 },
  { x: -2.4, y: 0 },
  { x: -2.0, y: 0 },
  { x: -1.6, y: 0 },
  { x: -1.3, y: 0 },
  { x: -0.9, y: 0 },
  { x: -0.5, y: 0 },
  { x: -0.2, y: 1 },
  { x: 0.0, y: 0 },
  { x: 0.3, y: 1 },
  { x: 0.6, y: 0 },
  { x: 0.9, y: 1 },
  { x: 1.3, y: 1 },
  { x: 1.6, y: 1 },
  { x: 2.0, y: 1 },
  { x: 2.4, y: 1 },
  { x: 2.7, y: 1 },
  { x: 3.0, y: 1 },
  { x: 3.4, y: 1 },
];

const X_MIN = -4;
const X_MAX = 4;

function MiniPlot({
  title,
  yLabel,
  yMin,
  yMax,
  fn,
  showData,
  data,
  beta0,
  beta1,
  yRule,
}: {
  title: string;
  yLabel: string;
  yMin: number;
  yMax: number;
  fn: (x: number) => number;
  showData?: boolean;
  data?: Pt[];
  beta0: number;
  beta1: number;
  yRule?: number;
}) {
  const sx = (x: number) =>
    PAD + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - 2 * PAD);
  const sy = (y: number) =>
    H - PAD - ((y - yMin) / (yMax - yMin)) * (H - 2 * PAD);

  const path = useMemo(() => {
    const N = 120;
    const pts: string[] = [];
    for (let i = 0; i <= N; i++) {
      const x = X_MIN + (i / N) * (X_MAX - X_MIN);
      const y = fn(x);
      const cy = Math.min(H - PAD, Math.max(PAD, sy(y)));
      pts.push(`${sx(x).toFixed(1)},${cy.toFixed(1)}`);
    }
    return `M ${pts.join(" L ")}`;
  }, [fn, beta0, beta1]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-lg border border-border bg-background p-2">
      <div className="text-[10px] font-mono text-muted-foreground mb-1 px-1 flex justify-between">
        <span>{title}</span>
        <span className="text-foreground/70">{yLabel}</span>
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* axes */}
        <line
          x1={PAD}
          y1={H - PAD}
          x2={W - PAD}
          y2={H - PAD}
          stroke="#888"
          strokeWidth={0.8}
        />
        <line
          x1={PAD}
          y1={PAD}
          x2={PAD}
          y2={H - PAD}
          stroke="#888"
          strokeWidth={0.8}
        />
        {/* zero lines */}
        {yMin < 0 && yMax > 0 && (
          <line
            x1={PAD}
            y1={sy(0)}
            x2={W - PAD}
            y2={sy(0)}
            stroke="#666"
            strokeOpacity={0.4}
            strokeDasharray="2 3"
          />
        )}
        <line
          x1={sx(0)}
          y1={PAD}
          x2={sx(0)}
          y2={H - PAD}
          stroke="#666"
          strokeOpacity={0.4}
          strokeDasharray="2 3"
        />
        {/* optional rule (e.g. 0.5) */}
        {yRule !== undefined && (
          <line
            x1={PAD}
            y1={sy(yRule)}
            x2={W - PAD}
            y2={sy(yRule)}
            stroke="#f59e0b"
            strokeOpacity={0.6}
            strokeDasharray="3 2"
          />
        )}
        <path d={path} stroke="#3b82f6" strokeWidth={2} fill="none" />
        {/* x-axis tick labels */}
        {[-4, -2, 0, 2, 4].map((t) => (
          <text
            key={t}
            x={sx(t)}
            y={H - PAD + 11}
            fontSize={8}
            textAnchor="middle"
            fill="#888"
          >
            {t}
          </text>
        ))}
        {/* data dots for sigmoid panel */}
        {showData &&
          data &&
          data.map((d, i) => (
            <circle
              key={i}
              cx={sx(d.x)}
              cy={sy(d.y)}
              r={3}
              fill={d.y === 1 ? "#10b981" : "#ef4444"}
              fillOpacity={0.75}
              stroke="#fff"
              strokeWidth={0.5}
            />
          ))}
      </svg>
    </div>
  );
}

export function SigmoidIntuitionViz() {
  const [b0, setB0] = useState(0);
  const [b1, setB1] = useState(1.5);

  const z = (x: number) => b0 + b1 * x;
  const p = (x: number) => sigmoid(z(x));
  const lo = (x: number) => z(x); // log-odds = z by construction

  // odds-ratio for unit increase in x is e^b1
  const oddsRatio = Math.exp(b1);

  // accuracy of threshold-0.5 prediction on DATA
  const acc = useMemo(() => {
    let ok = 0;
    for (const d of DATA) {
      const pred = sigmoid(z(d.x)) >= 0.5 ? 1 : 0;
      if (pred === d.y) ok++;
    }
    return ok / DATA.length;
  }, [b0, b1]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="grid md:grid-cols-3 gap-3 mb-4">
        <MiniPlot
          title="z = β₀ + β₁·x  (linær logit)"
          yLabel="z"
          yMin={-6}
          yMax={6}
          fn={lo}
          beta0={b0}
          beta1={b1}
        />
        <MiniPlot
          title="σ(z) = 1 / (1 + e^-z)"
          yLabel="P(y=1)"
          yMin={0}
          yMax={1}
          fn={p}
          showData
          data={DATA}
          beta0={b0}
          beta1={b1}
          yRule={0.5}
        />
        <MiniPlot
          title="log(p/(1-p))  (log-odds tilbake)"
          yLabel="logit"
          yMin={-6}
          yMax={6}
          fn={(x) => {
            const pv = sigmoid(z(x));
            const eps = 1e-9;
            return Math.log((pv + eps) / (1 - pv + eps));
          }}
          beta0={b0}
          beta1={b1}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-3">
          <label className="block">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>β₀ (intercept)</span>
              <span className="font-mono tabular-nums">{b0.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={-3}
              max={3}
              step={0.05}
              value={b0}
              onChange={(e) => setB0(parseFloat(e.target.value))}
              className="w-full accent-brand"
            />
          </label>
          <label className="block">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>β₁ (slope)</span>
              <span className="font-mono tabular-nums">{b1.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={-3}
              max={3}
              step={0.05}
              value={b1}
              onChange={(e) => setB1(parseFloat(e.target.value))}
              className="w-full accent-brand"
            />
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { label: "Reset (β₀=0, β₁=1.5)", b0: 0, b1: 1.5 },
              { label: "β₁ = 0.5", b0: 0, b1: 0.5 },
              { label: "Negativ helning", b0: 0, b1: -1.5 },
              { label: "Skiftet 50%-grense", b0: 1.5, b1: 1 },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setB0(p.b0);
                  setB1(p.b1);
                }}
                className="text-[11px] px-2 py-0.5 rounded border border-border bg-background hover:bg-muted/50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-2 font-mono">
          <div>
            <span className="text-muted-foreground">P(y=1 | x=0):</span>{" "}
            <span className="tabular-nums">{sigmoid(b0).toFixed(3)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">x ved P=0.5 (β₀ + β₁x = 0):</span>{" "}
            <span className="tabular-nums">
              {b1 === 0 ? "udefinert" : (-b0 / b1).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Odds-ratio per +1 i x:</span>{" "}
            <span className="tabular-nums">e^{b1.toFixed(2)} = {oddsRatio.toFixed(3)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Accuracy ved terskel 0.5:</span>{" "}
            <span className="tabular-nums">{(acc * 100).toFixed(0)}%</span> på 20 punkter
          </div>
          <div className="pt-2 border-t border-border text-[11px] text-muted-foreground leading-snug font-sans">
            Sett β₁ = 0.5. Da multipliseres oddsen med e^0.5 ≈ 1.65 for hver
            enhet x øker — uavhengig av nivået. Det er denne{" "}
            <em>konstante multiplikative effekten</em> som er kjernen i
            «log-odds er lineær i x».
          </div>
        </div>
      </div>
    </div>
  );
}
