import { useMemo, useState } from "react";
import { Shuffle } from "lucide-react";

// --------------------------------------------------------------------------
// BootstrapResampler — viser sentralgrenseteoremet (CLT) empirisk:
// uansett om populasjonen er uniform, skjev, eller bimodal, vil fordelingen
// av X̄ over mange utvalg samle seg rundt μ med normalform.
// Tre modus for populasjonen.
// --------------------------------------------------------------------------

type ParentKind = "uniform" | "skjev" | "bimodal";

const W = 540;
const H_TOP = 100;
const H_BOT = 200;
const PAD_L = 36;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 22;
const X_MIN = 0;
const X_MAX = 10;
const PARENT_BINS = 40;
const SAMPLE_BINS = 40;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parentPdf(kind: ParentKind, x: number) {
  if (x < X_MIN || x > X_MAX) return 0;
  if (kind === "uniform") return 1 / (X_MAX - X_MIN);
  if (kind === "skjev") {
    // Halv-trekant: høyere ved venstre
    return (2 * (X_MAX - x)) / (X_MAX - X_MIN) ** 2;
  }
  // Bimodal: to gaussians
  const a = Math.exp(-((x - 2.5) ** 2) / (2 * 0.7 ** 2));
  const b = Math.exp(-((x - 7.5) ** 2) / (2 * 0.7 ** 2));
  return (a + b) / (2 * Math.sqrt(2 * Math.PI) * 0.7);
}

function sampleFromParent(kind: ParentKind, rng: () => number): number {
  if (kind === "uniform") return X_MIN + rng() * (X_MAX - X_MIN);
  if (kind === "skjev") {
    // invers CDF for halv-trekant f(x) = 2(L-x)/L²: F(x) = 1 - (1-x/L)²
    const u = rng();
    return X_MAX * (1 - Math.sqrt(1 - u));
  }
  // bimodal
  const u1 = Math.max(1e-12, rng());
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const mu = rng() < 0.5 ? 2.5 : 7.5;
  return Math.max(X_MIN, Math.min(X_MAX, mu + 0.7 * z));
}

function parentTrueMean(kind: ParentKind) {
  if (kind === "uniform") return (X_MIN + X_MAX) / 2;
  if (kind === "skjev") return X_MAX / 3; // for f(x)=2(L-x)/L²
  return 5; // bimodal symmetrisk
}

export function BootstrapResampler() {
  const [kind, setKind] = useState<ParentKind>("skjev");
  const [n, setN] = useState(30);
  const [reps, setReps] = useState(500);
  const [seed, setSeed] = useState(2);

  // Parent-kurve som linjepunkter
  const parentCurve = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= PARENT_BINS; i++) {
      const x = X_MIN + (i / PARENT_BINS) * (X_MAX - X_MIN);
      pts.push({ x, y: parentPdf(kind, x) });
    }
    return pts;
  }, [kind]);

  // Trekk reps utvalg, beregn sample-mean
  const means = useMemo(() => {
    const rng = mulberry32(seed);
    const arr: number[] = new Array(reps);
    for (let r = 0; r < reps; r++) {
      let sum = 0;
      for (let i = 0; i < n; i++) sum += sampleFromParent(kind, rng);
      arr[r] = sum / n;
    }
    return arr;
  }, [kind, n, reps, seed]);

  const stats = useMemo(() => {
    const m = means.reduce((s, v) => s + v, 0) / means.length;
    const v = means.reduce((s, x) => s + (x - m) ** 2, 0) / (means.length - 1);
    return { mean: m, sd: Math.sqrt(Math.max(0, v)) };
  }, [means]);

  const trueMu = parentTrueMean(kind);

  // Histogram av means
  const meansMin = Math.min(...means);
  const meansMax = Math.max(...means);
  const range = Math.max(0.5, meansMax - meansMin);
  const histLo = meansMin - range * 0.1;
  const histHi = meansMax + range * 0.1;
  const histBins = new Array(SAMPLE_BINS).fill(0);
  for (const v of means) {
    const idx = Math.min(SAMPLE_BINS - 1, Math.floor(((v - histLo) / (histHi - histLo)) * SAMPLE_BINS));
    histBins[idx]++;
  }
  const histMax = Math.max(...histBins);

  // Helper plot-skala
  const yMaxParent = Math.max(...parentCurve.map((p) => p.y)) * 1.1;
  const xPx = (v: number, lo: number, hi: number) =>
    PAD_L + ((v - lo) / (hi - lo)) * (W - PAD_L - PAD_R);
  const yPxTop = (v: number) => PAD_T + (1 - v / yMaxParent) * (H_TOP - PAD_T - PAD_B);
  const yPxBot = (v: number) => PAD_T + (1 - v / histMax) * (H_BOT - PAD_T - PAD_B);

  const parentPath = useMemo(() => {
    if (parentCurve.length === 0) return "";
    let d = `M ${xPx(parentCurve[0].x, X_MIN, X_MAX)} ${yPxTop(parentCurve[0].y)}`;
    for (let i = 1; i < parentCurve.length; i++) {
      d += ` L ${xPx(parentCurve[i].x, X_MIN, X_MAX)} ${yPxTop(parentCurve[i].y)}`;
    }
    return d;
  }, [parentCurve, yMaxParent]);

  const totalH = H_TOP + H_BOT + 6;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Populasjon</span>
          <div className="inline-flex rounded-md border border-border overflow-hidden">
            {(
              [
                { k: "uniform" as ParentKind, label: "uniform" },
                { k: "skjev" as ParentKind, label: "skjev" },
                { k: "bimodal" as ParentKind, label: "bimodal" },
              ]
            ).map(({ k, label }) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={
                  "px-2 py-1 text-xs " +
                  (kind === k ? "bg-brand text-white" : "bg-card hover:bg-muted/40")
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">n</span>
          <input
            type="range"
            min={2}
            max={100}
            step={1}
            value={n}
            onChange={(e) => setN(parseInt(e.target.value))}
            className="w-28"
          />
          <span className="font-mono w-8 text-right">{n}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">utvalg</span>
          <input
            type="range"
            min={50}
            max={2000}
            step={50}
            value={reps}
            onChange={(e) => setReps(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="font-mono w-10 text-right">{reps}</span>
        </div>
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1"
        >
          <Shuffle className="h-3.5 w-3.5" /> Nytt sett
        </button>
      </div>

      <div className="rounded-lg border border-border bg-background/40 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${totalH}`} className="w-full h-auto block">
          {/* PARENT (top) */}
          <text
            x={PAD_L}
            y={PAD_T - 2}
            fontSize={9}
            className="fill-muted-foreground"
          >
            populasjonens tetthet f(x)
          </text>
          <path
            d={`${parentPath} L ${xPx(X_MAX, X_MIN, X_MAX)} ${H_TOP - PAD_B} L ${xPx(X_MIN, X_MIN, X_MAX)} ${H_TOP - PAD_B} Z`}
            fill="rgb(148,163,184)"
            fillOpacity={0.2}
          />
          <path d={parentPath} stroke="rgb(148,163,184)" fill="none" strokeWidth={1.5} />
          <line
            x1={xPx(trueMu, X_MIN, X_MAX)}
            x2={xPx(trueMu, X_MIN, X_MAX)}
            y1={PAD_T}
            y2={H_TOP - PAD_B}
            stroke="rgb(34,197,94)"
            strokeWidth={1.3}
            strokeDasharray="3 3"
          />
          <text
            x={xPx(trueMu, X_MIN, X_MAX) + 4}
            y={PAD_T + 9}
            fontSize={9}
            fill="rgb(34,197,94)"
          >
            μ = {trueMu.toFixed(2)}
          </text>
          <line
            x1={PAD_L}
            x2={W - PAD_R}
            y1={H_TOP - PAD_B}
            y2={H_TOP - PAD_B}
            stroke="currentColor"
            strokeOpacity={0.35}
          />
          {[0, 2.5, 5, 7.5, 10].map((v) => (
            <text
              key={v}
              x={xPx(v, X_MIN, X_MAX)}
              y={H_TOP - PAD_B + 12}
              textAnchor="middle"
              fontSize={9}
              className="fill-muted-foreground"
            >
              {v}
            </text>
          ))}

          {/* HIST (bottom) */}
          <g transform={`translate(0, ${H_TOP + 6})`}>
            <text x={PAD_L} y={PAD_T - 2} fontSize={9} className="fill-muted-foreground">
              fordeling av X̄ over {reps} utvalg
            </text>
            {histBins.map((c, i) => {
              const binLo = histLo + (i / SAMPLE_BINS) * (histHi - histLo);
              const binHi = histLo + ((i + 1) / SAMPLE_BINS) * (histHi - histLo);
              const xLeft = xPx(binLo, histLo, histHi);
              const xRight = xPx(binHi, histLo, histHi);
              return (
                <rect
                  key={i}
                  x={xLeft}
                  y={yPxBot(c)}
                  width={Math.max(0.5, xRight - xLeft - 0.5)}
                  height={Math.max(0, H_BOT - PAD_B - yPxBot(c))}
                  fill="rgb(56,189,248)"
                  fillOpacity={0.7}
                />
              );
            })}
            <line
              x1={xPx(trueMu, histLo, histHi)}
              x2={xPx(trueMu, histLo, histHi)}
              y1={PAD_T}
              y2={H_BOT - PAD_B}
              stroke="rgb(34,197,94)"
              strokeWidth={1.3}
              strokeDasharray="3 3"
            />
            <line
              x1={xPx(stats.mean, histLo, histHi)}
              x2={xPx(stats.mean, histLo, histHi)}
              y1={PAD_T}
              y2={H_BOT - PAD_B}
              stroke="rgb(244,114,182)"
              strokeWidth={1.5}
            />
            <text
              x={xPx(stats.mean, histLo, histHi) + 3}
              y={PAD_T + 9}
              fontSize={9}
              fill="rgb(244,114,182)"
            >
              X̄ av X̄ = {stats.mean.toFixed(2)}
            </text>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={H_BOT - PAD_B}
              y2={H_BOT - PAD_B}
              stroke="currentColor"
              strokeOpacity={0.35}
            />
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const v = histLo + t * (histHi - histLo);
              return (
                <text
                  key={t}
                  x={xPx(v, histLo, histHi)}
                  y={H_BOT - PAD_B + 12}
                  textAnchor="middle"
                  fontSize={9}
                  className="fill-muted-foreground"
                >
                  {v.toFixed(1)}
                </text>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="mt-3 grid sm:grid-cols-3 gap-2 text-xs">
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="text-muted-foreground">E[X̄] (empirisk)</div>
          <div className="font-mono">{stats.mean.toFixed(3)}</div>
          <div className="text-[10px] text-muted-foreground">sann μ = {trueMu.toFixed(3)}</div>
        </div>
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="text-muted-foreground">SE = SD(X̄)</div>
          <div className="font-mono">{stats.sd.toFixed(3)}</div>
          <div className="text-[10px] text-muted-foreground">∝ 1/√n</div>
        </div>
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="text-muted-foreground">Form</div>
          <div className="text-sm">
            {n < 10 ? "speiler populasjon" : n < 30 ? "blir mer normal" : "≈ normal (CLT)"}
          </div>
        </div>
      </div>

      <p className="mt-3 text-[12px] text-muted-foreground leading-snug">
        <span className="font-semibold text-foreground">Hva å se etter:</span>{" "}
        Velg "bimodal" populasjon med n = 2 — den nedre fordelingen er fortsatt
        bimodal. Skru n opp mot 30: histogrammet av X̄ samler seg rundt μ og
        får klokke-form, uansett hva forelderen ser ut som. Det er CLT i
        praksis. Standardfeilen faller proporsjonalt med 1/√n — dobler du n,
        krymper SE bare med faktor √2.
      </p>
    </div>
  );
}
