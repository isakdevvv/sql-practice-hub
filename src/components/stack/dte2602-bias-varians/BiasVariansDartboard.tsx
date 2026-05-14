import { useMemo, useState } from "react";
import { Tex } from "@/components/Tex";

/**
 * Bias-Variance Dartboard (Géron-figuren)
 *
 * Viser fire klassiske scenarier som dart-boards der treff-mønsteret
 * direkte illustrerer bias og varians:
 *
 *   - Lav bias  + Lav varians  = riktig kompleksitet (sweet spot)
 *   - Lav bias  + Høy varians  = overfitting
 *   - Høy bias  + Lav varians  = underfitting
 *   - Høy bias  + Høy varians  = verst mulig
 *
 * Brukeren kan justere bias og varians med slidere, eller "trekke nye
 * prøver" for å se hvor stokastisk hvert scenario er.
 */

type Quadrant = {
  key: string;
  label: string;
  biasMul: number;
  varMul: number;
  tint: string;
};

const QUADRANTS: Quadrant[] = [
  { key: "ll", label: "Lav bias, Lav varians", biasMul: 0, varMul: 0, tint: "text-emerald-500" },
  { key: "lh", label: "Lav bias, Høy varians", biasMul: 0, varMul: 1, tint: "text-rose-500" },
  { key: "hl", label: "Høy bias, Lav varians", biasMul: 1, varMul: 0, tint: "text-amber-500" },
  { key: "hh", label: "Høy bias, Høy varians", biasMul: 1, varMul: 1, tint: "text-fuchsia-500" },
];

// Box-Muller via deterministic LCG
function makeRng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function gaussian(rng: () => number): number {
  // Two uniforms → standard normal
  const u1 = Math.max(1e-9, rng());
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Generer N skudd på en dart-skive med gitt bias og varians.
 * Returnerer (x, y)-par i normaliserte koordinater fra -1 til 1.
 */
function generateShots(seed: number, n: number, bias: number, variance: number): Array<[number, number]> {
  const rng = makeRng(seed);
  // Systematisk skjevhet — alltid samme retning per bias-nivå (oppe til høyre)
  const biasDx = bias * 0.55;
  const biasDy = -bias * 0.45;
  const sigma = 0.04 + variance * 0.42;
  return Array.from({ length: n }, () => {
    const dx = gaussian(rng) * sigma + biasDx;
    const dy = gaussian(rng) * sigma + biasDy;
    return [Math.max(-1.05, Math.min(1.05, dx)), Math.max(-1.05, Math.min(1.05, dy))];
  });
}

function Dartboard({
  shots,
  size,
  ringClass,
}: {
  shots: Array<[number, number]>;
  size: number;
  ringClass: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 6;
  // Rings: bulls, inner, mid, outer
  const rings = [R * 0.2, R * 0.45, R * 0.72, R];
  return (
    <svg width={size} height={size} className="block" viewBox={`0 0 ${size} ${size}`}>
      {/* Outer-most ring (low-score) */}
      <circle cx={cx} cy={cy} r={rings[3]} fill="currentColor" className="text-muted/30" />
      <circle cx={cx} cy={cy} r={rings[2]} fill="currentColor" className="text-muted/50" />
      <circle cx={cx} cy={cy} r={rings[1]} fill="currentColor" className="text-amber-500/30" />
      <circle cx={cx} cy={cy} r={rings[0]} fill="currentColor" className="text-rose-500/70" />
      {/* Cross-hairs */}
      <line x1={cx - rings[3]} y1={cy} x2={cx + rings[3]} y2={cy} stroke="currentColor" className={ringClass} strokeWidth={0.8} opacity={0.4} />
      <line x1={cx} y1={cy - rings[3]} x2={cx} y2={cy + rings[3]} stroke="currentColor" className={ringClass} strokeWidth={0.8} opacity={0.4} />
      {/* Bullseye */}
      <circle cx={cx} cy={cy} r={2.2} fill="currentColor" className="text-foreground" />
      {/* Shots */}
      {shots.map(([x, y], i) => (
        <circle
          key={i}
          cx={cx + x * rings[3]}
          cy={cy + y * rings[3]}
          r={3.2}
          fill="currentColor"
          className="text-sky-500"
          stroke="currentColor"
          strokeWidth={0.6}
          opacity={0.9}
        />
      ))}
    </svg>
  );
}

function rmse(shots: Array<[number, number]>): number {
  if (shots.length === 0) return 0;
  let s = 0;
  for (const [x, y] of shots) s += x * x + y * y;
  return Math.sqrt(s / shots.length);
}

function variance2d(shots: Array<[number, number]>): number {
  if (shots.length === 0) return 0;
  let mx = 0;
  let my = 0;
  for (const [x, y] of shots) {
    mx += x;
    my += y;
  }
  mx /= shots.length;
  my /= shots.length;
  let s = 0;
  for (const [x, y] of shots) s += (x - mx) ** 2 + (y - my) ** 2;
  return s / shots.length;
}

function biasMag(shots: Array<[number, number]>): number {
  if (shots.length === 0) return 0;
  let mx = 0;
  let my = 0;
  for (const [x, y] of shots) {
    mx += x;
    my += y;
  }
  return Math.sqrt((mx / shots.length) ** 2 + (my / shots.length) ** 2);
}

export function BiasVariansDartboard() {
  const [bias, setBias] = useState(0.35);
  const [variance, setVariance] = useState(0.25);
  const [seed, setSeed] = useState(7);
  const N_SHOTS = 14;

  // Always show the 4 canonical quadrants; sliders modulate them so the spread grows with the chosen variance.
  const quadrantShots = useMemo(() => {
    return QUADRANTS.map((q) =>
      generateShots(
        seed * 31 + q.key.charCodeAt(0) * 17,
        N_SHOTS,
        // Mix between low (0) and the user-picked bias for the "high" side
        q.biasMul * bias,
        q.varMul * variance + (1 - q.varMul) * 0.04,
      ),
    );
  }, [bias, variance, seed]);

  // Custom single-board (driven directly by the sliders)
  const customShots = useMemo(
    () => generateShots(seed * 101 + 1, N_SHOTS, bias, variance),
    [bias, variance, seed],
  );

  const customStats = {
    rmse: rmse(customShots),
    bias: biasMag(customShots),
    variance: variance2d(customShots),
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Sliders */}
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <label className="block text-xs text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>Bias-styrke</span>
            <span className="font-mono text-foreground">{bias.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={bias}
            onChange={(e) => setBias(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>Varians-styrke</span>
            <span className="font-mono text-foreground">{variance.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={variance}
            onChange={(e) => setVariance(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="text-xs text-muted-foreground">
          Bullseye = sann modell. Hvert blå punkt = én trent modell på et nytt treningssett.
        </div>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted"
        >
          Trekk 20 nye prøver
        </button>
      </div>

      {/* 2x2 grid of canonical quadrants */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {QUADRANTS.map((q, i) => (
          <div key={q.key} className="rounded-lg border border-border bg-background p-3 flex flex-col items-center">
            <div className={`text-[11px] uppercase tracking-wide font-semibold ${q.tint} mb-1.5`}>{q.label}</div>
            <div className="w-full aspect-square max-w-[180px]">
              <Dartboard shots={quadrantShots[i]} size={180} ringClass="text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>

      {/* Single, fully-controlled board */}
      <div className="mt-6 rounded-lg border border-brand/30 bg-brand/5 p-3 flex flex-col sm:flex-row gap-3 items-center">
        <div className="w-full max-w-[180px]">
          <Dartboard shots={customShots} size={180} ringClass="text-muted-foreground" />
        </div>
        <div className="flex-1 text-xs space-y-1.5">
          <div className="text-[11px] uppercase tracking-wide text-brand font-semibold mb-1">Din konfigurasjon</div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Bias (avstand fra blink):</span>
            <span className="font-mono text-foreground">{customStats.bias.toFixed(3)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Varians (spredning):</span>
            <span className="font-mono text-foreground">{customStats.variance.toFixed(3)}</span>
          </div>
          <div className="flex justify-between gap-3 border-t border-border pt-1.5">
            <span className="text-muted-foreground">RMSE (totalfeil):</span>
            <span className="font-mono text-foreground">{customStats.rmse.toFixed(3)}</span>
          </div>
          <div className="text-[11px] text-muted-foreground pt-1.5">
            <Tex>{"E[(\\hat y - y)^2] \\approx \\text{Bias}^2 + \\text{Var} + \\sigma^2"}</Tex>
          </div>
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-3 gap-2 text-xs">
        <div className="rounded-md border border-border p-2.5">
          <div className="font-semibold text-amber-500 mb-0.5">Underfit</div>
          <div className="text-muted-foreground">Høy bias — systematisk skjevt, lite spredning. F.eks. lineær modell på krum data.</div>
        </div>
        <div className="rounded-md border border-border p-2.5">
          <div className="font-semibold text-rose-500 mb-0.5">Overfit</div>
          <div className="text-muted-foreground">Høy varians — punktene spriker, men gjennomsnitt sentrert. F.eks. dypt tre uten pruning.</div>
        </div>
        <div className="rounded-md border border-border p-2.5">
          <div className="font-semibold text-emerald-500 mb-0.5">Sweet spot</div>
          <div className="text-muted-foreground">Lav både bias og varians — vanligvis krever det regularisering eller riktig modell-kompleksitet.</div>
        </div>
      </div>
    </div>
  );
}
