import { useMemo, useState } from "react";

const W = 320;
const H = 220;
const PAD = 32;

function logLoss(p: number, y: 0 | 1): number {
  const eps = 1e-9;
  const pc = Math.min(1 - eps, Math.max(eps, p));
  return -(y * Math.log(pc) + (1 - y) * Math.log(1 - pc));
}

function mse(p: number, y: 0 | 1): number {
  return (p - y) ** 2;
}

function sigmoid(z: number): number {
  if (z > 40) return 1;
  if (z < -40) return 0;
  return 1 / (1 + Math.exp(-z));
}

// Toy GD demo: 5 1-D points, train w on log-loss
const GD_DATA: { x: number; y: 0 | 1 }[] = [
  { x: -2.5, y: 0 },
  { x: -1.0, y: 0 },
  { x: 0.5, y: 1 },
  { x: 1.5, y: 1 },
  { x: 2.5, y: 1 },
];

function gdStep(w: number, b: number, lr: number): { w: number; b: number; loss: number } {
  let gw = 0;
  let gb = 0;
  let loss = 0;
  for (const d of GD_DATA) {
    const ph = sigmoid(w * d.x + b);
    const err = ph - d.y;
    gw += err * d.x;
    gb += err;
    loss += logLoss(ph, d.y);
  }
  const n = GD_DATA.length;
  return {
    w: w - (lr / n) * gw,
    b: b - (lr / n) * gb,
    loss: loss / n,
  };
}

function LossCurve({
  showMse,
  pHat,
  label,
}: {
  showMse: boolean;
  pHat: number;
  label: 0 | 1;
}) {
  const sx = (p: number) => PAD + p * (W - 2 * PAD);
  const yMax = 4;
  const sy = (v: number) => H - PAD - (Math.min(yMax, v) / yMax) * (H - 2 * PAD);

  const llPath = useMemo(() => {
    const N = 120;
    const pts: string[] = [];
    for (let i = 1; i < N; i++) {
      const p = i / N;
      pts.push(`${sx(p).toFixed(1)},${sy(logLoss(p, label)).toFixed(1)}`);
    }
    return `M ${pts.join(" L ")}`;
  }, [label]);
  const msePath = useMemo(() => {
    const N = 120;
    const pts: string[] = [];
    for (let i = 0; i <= N; i++) {
      const p = i / N;
      pts.push(`${sx(p).toFixed(1)},${sy(mse(p, label)).toFixed(1)}`);
    }
    return `M ${pts.join(" L ")}`;
  }, [label]);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#888" strokeWidth={0.8} />
      <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#888" strokeWidth={0.8} />
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <text key={t} x={sx(t)} y={H - PAD + 12} fontSize={9} textAnchor="middle" fill="#888">
          {t.toFixed(2)}
        </text>
      ))}
      {[0, 1, 2, 3, 4].map((t) => (
        <text key={t} x={PAD - 4} y={sy(t) + 3} fontSize={9} textAnchor="end" fill="#888">
          {t}
        </text>
      ))}
      <path d={llPath} stroke="#3b82f6" strokeWidth={2} fill="none" />
      {showMse && <path d={msePath} stroke="#94a3b8" strokeWidth={1.5} fill="none" strokeDasharray="4 3" />}
      {/* marker for current p */}
      <line x1={sx(pHat)} y1={PAD} x2={sx(pHat)} y2={H - PAD} stroke="#f59e0b" strokeOpacity={0.4} />
      <circle
        cx={sx(pHat)}
        cy={sy(logLoss(pHat, label))}
        r={4}
        fill="#f59e0b"
        stroke="#fff"
        strokeWidth={1}
      />
      <text x={W - PAD - 4} y={PAD + 12} fontSize={9} textAnchor="end" fill="#3b82f6">
        log-loss
      </text>
      {showMse && (
        <text x={W - PAD - 4} y={PAD + 24} fontSize={9} textAnchor="end" fill="#94a3b8">
          MSE
        </text>
      )}
      <text x={(W) / 2} y={PAD - 6} fontSize={10} textAnchor="middle" fill="#aaa" fontStyle="italic">
        label y = {label}
      </text>
    </svg>
  );
}

export function LossLandscapeViz() {
  const [pHat, setPHat] = useState(0.5);
  const [showMse, setShowMse] = useState(true);

  // gradient descent state
  const [gd, setGd] = useState({ w: 0, b: 0, loss: NaN as number });
  const [running, setRunning] = useState(false);

  // run one step or N steps at a time
  const stepOne = () => {
    setGd((s) => gdStep(s.w, s.b, 1.0));
  };
  const stepMany = () => {
    setRunning(true);
    let s = { w: gd.w, b: gd.b, loss: gd.loss };
    let i = 0;
    const tick = () => {
      for (let k = 0; k < 4; k++) {
        s = gdStep(s.w, s.b, 1.0);
        i++;
      }
      setGd(s);
      if (i < 60) {
        requestAnimationFrame(tick);
      } else {
        setRunning(false);
      }
    };
    requestAnimationFrame(tick);
  };
  const resetGd = () => setGd({ w: 0, b: 0, loss: NaN });

  // current GD train loss
  const currentLoss = useMemo(() => {
    let l = 0;
    for (const d of GD_DATA) {
      l += logLoss(sigmoid(gd.w * d.x + gd.b), d.y);
    }
    return l / GD_DATA.length;
  }, [gd.w, gd.b]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div>
        <h3 className="text-sm font-semibold mb-2">
          Hvordan log-loss straffer feil sikkerhet
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          <LossCurve showMse={showMse} pHat={pHat} label={1} />
          <LossCurve showMse={showMse} pHat={pHat} label={0} />
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-3 text-sm">
          <div>
            <label className="block">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Predikert p̂</span>
                <span className="font-mono tabular-nums">{pHat.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.01}
                max={0.99}
                step={0.01}
                value={pHat}
                onChange={(e) => setPHat(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <input
                type="checkbox"
                checked={showMse}
                onChange={(e) => setShowMse(e.target.checked)}
              />
              Sammenlign med MSE = (p − y)²
            </label>
          </div>
          <div className="rounded-lg border border-border bg-background p-3 text-xs font-mono space-y-1">
            <div>
              <span className="text-muted-foreground">log-loss (y=1):</span>{" "}
              <span className="tabular-nums">{logLoss(pHat, 1).toFixed(3)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">log-loss (y=0):</span>{" "}
              <span className="tabular-nums">{logLoss(pHat, 0).toFixed(3)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">MSE (y=1):</span>{" "}
              <span className="tabular-nums">{mse(pHat, 1).toFixed(3)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">MSE (y=0):</span>{" "}
              <span className="tabular-nums">{mse(pHat, 0).toFixed(3)}</span>
            </div>
            <div className="pt-2 border-t border-border text-[10px] font-sans text-muted-foreground leading-snug">
              Når y=1 og p̂ → 0, går log-loss → ∞. MSE stopper på 1. Det er
              derfor log-loss straffer «selvsikker, feil» mye hardere — og
              gjør gradient descent retter feilen aggressivt.
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="text-sm font-semibold mb-2">
          Gradient descent — 5 punkter, oppdater β steg-for-steg
        </h3>
        <div className="grid md:grid-cols-[1fr_auto] gap-4">
          <svg width={W * 1.4} height={160} viewBox={`0 0 ${W * 1.4} 160`} className="w-full">
            {/* axis */}
            <line x1={20} y1={80} x2={W * 1.4 - 20} y2={80} stroke="#888" strokeWidth={0.8} />
            {/* sigmoid curve in 1D */}
            {(() => {
              const w = gd.w;
              const b = gd.b;
              const X0 = -4;
              const X1 = 4;
              const sx = (x: number) =>
                20 + ((x - X0) / (X1 - X0)) * (W * 1.4 - 40);
              const sy = (v: number) => 130 - v * 100; // p in [0,1] → y in [30, 130]
              const pts: string[] = [];
              for (let i = 0; i <= 120; i++) {
                const x = X0 + (i / 120) * (X1 - X0);
                pts.push(`${sx(x).toFixed(1)},${sy(sigmoid(w * x + b)).toFixed(1)}`);
              }
              return (
                <>
                  <line x1={20} y1={30} x2={W * 1.4 - 20} y2={30} stroke="#666" strokeOpacity={0.3} strokeDasharray="3 3" />
                  <line x1={20} y1={130} x2={W * 1.4 - 20} y2={130} stroke="#666" strokeOpacity={0.3} strokeDasharray="3 3" />
                  <line x1={20} y1={80} x2={W * 1.4 - 20} y2={80} stroke="#666" strokeOpacity={0.3} strokeDasharray="3 3" />
                  <path d={`M ${pts.join(" L ")}`} stroke="#3b82f6" strokeWidth={2} fill="none" />
                  {GD_DATA.map((d, i) => (
                    <circle
                      key={i}
                      cx={sx(d.x)}
                      cy={d.y === 1 ? 30 : 130}
                      r={4}
                      fill={d.y === 1 ? "#10b981" : "#ef4444"}
                      stroke="#fff"
                      strokeWidth={1}
                    />
                  ))}
                  <text x={W * 1.4 - 24} y={28} fontSize={9} fill="#888" textAnchor="end">y=1</text>
                  <text x={W * 1.4 - 24} y={142} fontSize={9} fill="#888" textAnchor="end">y=0</text>
                </>
              );
            })()}
          </svg>
          <div className="rounded-lg border border-border bg-background p-3 text-xs font-mono space-y-1 md:w-56">
            <div>
              <span className="text-muted-foreground">w:</span>{" "}
              <span className="tabular-nums">{gd.w.toFixed(3)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">b:</span>{" "}
              <span className="tabular-nums">{gd.b.toFixed(3)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">avg log-loss:</span>{" "}
              <span className="tabular-nums">{currentLoss.toFixed(4)}</span>
            </div>
            <div className="pt-2 flex flex-wrap gap-1">
              <button
                onClick={stepOne}
                disabled={running}
                className="text-[11px] px-2 py-0.5 rounded border border-border bg-background hover:bg-muted/50 disabled:opacity-40"
              >
                +1 steg
              </button>
              <button
                onClick={stepMany}
                disabled={running}
                className="text-[11px] px-2 py-0.5 rounded border border-brand/40 bg-brand/10 hover:bg-brand/20 disabled:opacity-40"
              >
                ▶ Tren (60 steg)
              </button>
              <button
                onClick={resetGd}
                disabled={running}
                className="text-[11px] px-2 py-0.5 rounded border border-border bg-background hover:bg-muted/50 disabled:opacity-40"
              >
                Reset
              </button>
            </div>
            <div className="pt-2 border-t border-border text-[10px] font-sans text-muted-foreground leading-snug">
              ∇w = ⟨(p̂ − y)·x⟩, ∇b = ⟨p̂ − y⟩. Hver iterasjon flytter sigmoid
              slik at den passer bedre — du ser den «strekkes» og forskyves.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
