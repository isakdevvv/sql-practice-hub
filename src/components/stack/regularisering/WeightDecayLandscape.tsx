import { useMemo, useState } from "react";

// --------------------------------------------------------------------------
// WeightDecayLandscape — viser hvordan L1 og L2 endrer optimum av vektene.
// To paneler:
//   1. Loss-kontur i 2D vekt-rom (w1, w2), med data-loss-ellipsen + en
//      regulariserings-"ball" (L2 = sirkel, L1 = romb). Optimum er der
//      ellipsen først tangerer ballen.
//   2. Histogram av sluttvekter for et 20-vekters lineær modell, der
//      L1 driver mange til 0 (sparsity), L2 krymper alle proporsjonalt.
// Studenten kan dra λ-slideren og se begge effektene live.
// --------------------------------------------------------------------------

type Mode = "L2" | "L1" | "ingen";

const SVG = 220;
const PAD = 16;

// Hjelpe: tegn en ellipse-kontur sentrert på (cx, cy) med skalaer (a, b)
function ellipsePath(cx: number, cy: number, a: number, b: number, scale: number) {
  const r = 0;
  return `M ${cx + a * scale} ${cy} ` +
    `a ${a * scale} ${b * scale} ${r} 1 0 ${-2 * a * scale} 0 ` +
    `a ${a * scale} ${b * scale} ${r} 1 0 ${2 * a * scale} 0`;
}

// Optimum: argmin av L_data(w) + λ·R(w)
// L_data er kvadratisk omkring (wx*, wy*), R er L1 eller L2.
// Closed form for L2: w = w*/(1 + λ). For L1: soft-thresholding.
function regOptimum(wxStar: number, wyStar: number, lam: number, mode: Mode) {
  if (mode === "ingen") return [wxStar, wyStar] as const;
  if (mode === "L2") return [wxStar / (1 + lam), wyStar / (1 + lam)] as const;
  // L1: soft-threshold
  const st = (v: number) => Math.sign(v) * Math.max(0, Math.abs(v) - lam / 2);
  return [st(wxStar), st(wyStar)] as const;
}

// 20 "ekte" vekter for nedre histogram — noen store, mange små.
const TRUE_W = [
  1.2, -0.9, 0.7, -0.5, 0.4, -0.3, 0.25, -0.2, 0.18, -0.15,
  0.12, -0.1, 0.08, -0.06, 0.05, -0.04, 0.03, -0.02, 0.015, -0.01,
];

function applyReg(w: number[], lam: number, mode: Mode) {
  if (mode === "ingen") return w.slice();
  if (mode === "L2") return w.map((v) => v / (1 + lam));
  return w.map((v) => Math.sign(v) * Math.max(0, Math.abs(v) - lam / 2));
}

export function WeightDecayLandscape() {
  const [mode, setMode] = useState<Mode>("L2");
  const [lam, setLam] = useState(0.4);

  const wxStar = 0.9;
  const wyStar = 0.6;
  const [optX, optY] = regOptimum(wxStar, wyStar, lam, mode);

  // Plot-ramme (vekt-rom: -1.5..1.5 i begge retninger)
  const cx = SVG / 2;
  const cy = SVG / 2;
  const unit = (SVG / 2 - PAD) / 1.5; // pikslar per enhet vekt

  const finalWeights = useMemo(() => applyReg(TRUE_W, lam, mode), [lam, mode]);
  const nonzero = finalWeights.filter((w) => Math.abs(w) > 1e-6).length;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {/* Modus + slider */}
      <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
        <div className="inline-flex rounded-md border border-border overflow-hidden">
          {(["ingen", "L2", "L1"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={
                "px-3 py-1 transition-colors " +
                (mode === m
                  ? "bg-brand text-brand-foreground"
                  : "bg-card hover:bg-muted/40")
              }
            >
              {m === "ingen" ? "Ingen reg" : m}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">λ</span>
          <input
            type="range"
            min={0}
            max={1.5}
            step={0.05}
            value={lam}
            onChange={(e) => setLam(parseFloat(e.target.value))}
            disabled={mode === "ingen"}
            className="w-32 disabled:opacity-40"
          />
          <span className="font-mono w-10 text-right">{lam.toFixed(2)}</span>
        </div>
        <div className="ml-auto text-muted-foreground">
          ikke-null vekter: <span className="font-mono">{nonzero}/{TRUE_W.length}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {/* Panel 1: vekt-rom */}
        <div className="rounded-lg border border-border bg-background/40 p-2">
          <div className="text-[11px] text-muted-foreground mb-1 font-semibold">
            Vekt-rom (w₁, w₂) — kontur av loss + reg-region
          </div>
          <svg viewBox={`0 0 ${SVG} ${SVG}`} className="w-full h-auto block">
            {/* Akser */}
            <line x1={PAD} x2={SVG - PAD} y1={cy} y2={cy} stroke="currentColor" strokeOpacity={0.2} />
            <line x1={cx} x2={cx} y1={PAD} y2={SVG - PAD} stroke="currentColor" strokeOpacity={0.2} />
            <text x={SVG - PAD - 2} y={cy - 3} textAnchor="end" fontSize={9} className="fill-muted-foreground">w₁</text>
            <text x={cx + 3} y={PAD + 8} fontSize={9} className="fill-muted-foreground">w₂</text>

            {/* Loss-kontur: ellipse rundt (wxStar, wyStar) */}
            {[0.3, 0.55, 0.85, 1.15].map((s, i) => (
              <path
                key={i}
                d={ellipsePath(cx + wxStar * unit, cy - wyStar * unit, 0.55, 0.35, s * unit)}
                fill="none"
                stroke="rgb(56,189,248)"
                strokeOpacity={0.35 - i * 0.05}
                strokeWidth={1}
              />
            ))}
            {/* Optimum uten reg */}
            <circle cx={cx + wxStar * unit} cy={cy - wyStar * unit} r={3.5} fill="rgb(56,189,248)" />
            <text
              x={cx + wxStar * unit + 6}
              y={cy - wyStar * unit - 4}
              fontSize={9}
              className="fill-sky-400"
            >
              w* (ureguliert)
            </text>

            {/* Reguliserings-region */}
            {mode === "L2" && (
              <circle
                cx={cx}
                cy={cy}
                r={Math.max(0.05, 1.0 / (1 + lam * 0.6)) * unit}
                fill="rgb(34,197,94)"
                fillOpacity={0.08}
                stroke="rgb(34,197,94)"
                strokeOpacity={0.6}
                strokeDasharray="3 3"
              />
            )}
            {mode === "L1" && (
              (() => {
                const r = Math.max(0.05, 1.0 / (1 + lam * 0.6)) * unit;
                return (
                  <polygon
                    points={`${cx} ${cy - r} ${cx + r} ${cy} ${cx} ${cy + r} ${cx - r} ${cy}`}
                    fill="rgb(251,191,36)"
                    fillOpacity={0.08}
                    stroke="rgb(251,191,36)"
                    strokeOpacity={0.7}
                    strokeDasharray="3 3"
                  />
                );
              })()
            )}

            {/* Regulert optimum */}
            {mode !== "ingen" && (
              <>
                <line
                  x1={cx + wxStar * unit}
                  y1={cy - wyStar * unit}
                  x2={cx + optX * unit}
                  y2={cy - optY * unit}
                  stroke="currentColor"
                  strokeOpacity={0.4}
                  strokeDasharray="2 2"
                />
                <circle
                  cx={cx + optX * unit}
                  cy={cy - optY * unit}
                  r={4}
                  fill={mode === "L2" ? "rgb(34,197,94)" : "rgb(251,191,36)"}
                  stroke="currentColor"
                  strokeOpacity={0.4}
                />
              </>
            )}
          </svg>
          <p className="text-[10px] text-muted-foreground mt-1 leading-snug">
            Blå punkt = "ekte" optimum. Grønn/gul = etter regularisering.
            <strong className="text-foreground"> Romben i L1</strong> har skarpe hjørner
            på aksene — derfor lander L1-løsningen ofte på en akse (en vekt blir 0).
          </p>
        </div>

        {/* Panel 2: vekt-histogram */}
        <div className="rounded-lg border border-border bg-background/40 p-2">
          <div className="text-[11px] text-muted-foreground mb-1 font-semibold">
            20 vekter etter regularisering
          </div>
          <svg viewBox={`0 0 ${SVG} ${SVG}`} className="w-full h-auto block">
            <line x1={PAD} x2={SVG - PAD} y1={SVG / 2} y2={SVG / 2} stroke="currentColor" strokeOpacity={0.25} />
            {TRUE_W.map((trueW, i) => {
              const bw = (SVG - PAD * 2) / TRUE_W.length;
              const bx = PAD + i * bw;
              const baseH = trueW * (SVG / 2 - PAD) / 1.5;
              const regH = finalWeights[i] * (SVG / 2 - PAD) / 1.5;
              return (
                <g key={i}>
                  {/* "ekte" lyse bar */}
                  <rect
                    x={bx + 1}
                    y={baseH >= 0 ? SVG / 2 - baseH : SVG / 2}
                    width={bw - 2}
                    height={Math.abs(baseH)}
                    fill="currentColor"
                    fillOpacity={0.12}
                  />
                  {/* regulert bar */}
                  <rect
                    x={bx + 1}
                    y={regH >= 0 ? SVG / 2 - regH : SVG / 2}
                    width={bw - 2}
                    height={Math.abs(regH)}
                    fill={
                      mode === "L2"
                        ? "rgb(34,197,94)"
                        : mode === "L1"
                        ? "rgb(251,191,36)"
                        : "rgb(56,189,248)"
                    }
                    fillOpacity={Math.abs(regH) < 0.5 ? 0.4 : 0.75}
                  />
                </g>
              );
            })}
          </svg>
          <p className="text-[10px] text-muted-foreground mt-1 leading-snug">
            Lysere bakgrunns-bar = original vekt. Farget = etter regularisering.
            {mode === "L1" && " L1 setter mange små vekter helt til 0 — sparsity."}
            {mode === "L2" && " L2 krymper alle vekter proporsjonalt — ingen blir helt 0."}
            {mode === "ingen" && " Ingen regularisering: vektene er uendret."}
          </p>
        </div>
      </div>

      {/* Matte under */}
      <div className="mt-3 rounded-md border border-border bg-background/40 p-3 text-[11px]">
        <pre className="font-mono leading-snug whitespace-pre-wrap">
{mode === "L2" &&
`L_total = L_data + λ · Σ wᵢ²
∂L/∂wᵢ  = ∂L_data/∂wᵢ + 2λ wᵢ
Lukket form (per vekt): wᵢ ← wᵢ* / (1 + λ)
  → alle vekter krymper proporsjonalt med samme faktor.`}
{mode === "L1" &&
`L_total = L_data + λ · Σ |wᵢ|
∂L/∂wᵢ  = ∂L_data/∂wᵢ + λ · sign(wᵢ)
Soft-thresholding: wᵢ ← sign(wᵢ*) · max(0, |wᵢ*| − λ/2)
  → vekter mindre enn λ/2 i størrelse blir EKSAKT 0 (sparsity).`}
{mode === "ingen" &&
`L_total = L_data           ← ingen straff på vekter
Modellen kan bruke så store vekter den vil for å redusere
treningstap → mottakelig for overfitting.`}
        </pre>
      </div>
    </div>
  );
}
