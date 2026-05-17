import { useEffect, useMemo, useRef, useState } from "react";
import { Shuffle, Play, RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv visualisering for bias-varians-tradeoff.
// Fire moduser:
//   1) "darts"        — 2×2 dart-blink-grid; animerte kast lander én etter én.
//   2) "polynomial"   — Polynom-grad-slider på støyete data + 3 bootstrap-fits.
//   3) "curves"       — Trening- vs test-MSE som funksjon av kompleksitet.
//                       Vertikal sliderr-linje + grønn sweet-spot-puls.
//   4) "sample-size"  — Bootstrap-fits oppå hverandre; sliderr n fra 10 til 1000.
//                       Varians-estimat synker når n vokser.
// --------------------------------------------------------------------------

type Mode = "darts" | "polynomial" | "curves" | "sample-size";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "darts", label: "Dart-blink-metaforen", sub: "2×2 scenarier, animerte kast" },
  { id: "polynomial", label: "Polynom-grad", sub: "Slider for grad 1..15, bootstrap-fits" },
  { id: "curves", label: "Trening vs test", sub: "U-kurve, sweet spot" },
  { id: "sample-size", label: "Sample-størrelse", sub: "Varians synker når n vokser" },
];

const MODE_NOTE: Record<Mode, string> = {
  darts:
    "Hvert dart-kast = én modell trent på et nytt treningssett. Bias = systematisk skjevhet fra blink (gjennomsnittet bommer). Varians = spredning mellom kast. Animasjonen viser at det er FORDELINGEN over treninger som forteller deg om modellen din er biased eller noisy — ikke ett enkelt kast.",
  polynomial:
    "Drag polynom-graden. Lav grad = stiv modell = høy bias, fits stiller seg likt opp uansett trening. Høy grad = fleksibel modell = lav bias, men hver bootstrap-fit gjør noe helt annet (høy varians). De 3 lyse kurvene er bootstrap-replikat — spredningen mellom dem ER variansen visuelt.",
  curves:
    "Klassisk lærebok-figur: trening-MSE faller monotont (mer fleksibel modell pugger mer av trening), mens test-MSE har U-form. Sweet-spot der test-MSE bunner ut. Sliderr X-aksen for å se annotering for under-/overfit.",
  "sample-size":
    "Varians-leddet i bias-varians-dekomposisjonen skaleres med ~1/n. Drag n fra 10 til 1000 og se hvordan 5 bootstrap-replikat krymper sammen til omtrent samme kurve. Mer data hjelper alltid mot varians — den hjelper IKKE mot bias.",
};

// ============================================================================
// MATTE-HJELPERE
// ============================================================================

function makeRng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function gaussian(rng: () => number): number {
  const u1 = Math.max(1e-9, rng());
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Sann funksjon: en glatt kubisk. y = 0.6x^3 - 1.5x^2 + 0.2x + 1 (skalert)
function trueFn(x: number): number {
  return 0.18 * x * x * x - 0.55 * x * x + 0.15 * x + 1.1;
}

function sampleData(seed: number, n: number, noise = 0.45): { xs: number[]; ys: number[] } {
  const rng = makeRng(seed);
  const xs = Array.from(
    { length: n },
    (_, i) => -3 + (i / Math.max(1, n - 1)) * 6 + (rng() - 0.5) * 0.05,
  );
  const ys = xs.map((x) => trueFn(x) + gaussian(rng) * noise);
  return { xs, ys };
}

// Polynom-fit ved normal-likning (med liten ridge for stabilitet).
function fitPolynomial(xs: number[], ys: number[], degree: number): number[] {
  const n = xs.length;
  const m = degree + 1;
  const X: number[][] = xs.map((x) => {
    const row = new Array(m);
    let p = 1;
    for (let j = 0; j < m; j++) {
      row[j] = p;
      p *= x;
    }
    return row;
  });
  const XtX: number[][] = Array.from({ length: m }, () => new Array(m).fill(0));
  const Xty: number[] = new Array(m).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      Xty[j] += X[i][j] * ys[i];
      for (let k = 0; k < m; k++) XtX[j][k] += X[i][j] * X[i][k];
    }
  }
  for (let j = 0; j < m; j++) XtX[j][j] += 1e-6;
  return solveSystem(XtX, Xty);
}

function solveSystem(Ain: number[][], bin: number[]): number[] {
  const n = bin.length;
  const A = Ain.map((row) => row.slice());
  const b = bin.slice();
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    let maxVal = Math.abs(A[i][i]);
    for (let r = i + 1; r < n; r++) {
      const v = Math.abs(A[r][i]);
      if (v > maxVal) {
        maxVal = v;
        maxRow = r;
      }
    }
    if (maxRow !== i) {
      [A[i], A[maxRow]] = [A[maxRow], A[i]];
      [b[i], b[maxRow]] = [b[maxRow], b[i]];
    }
    const piv = A[i][i] || 1e-12;
    for (let r = i + 1; r < n; r++) {
      const factor = A[r][i] / piv;
      for (let c = i; c < n; c++) A[r][c] -= factor * A[i][c];
      b[r] -= factor * b[i];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i];
    for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c];
    x[i] = s / (A[i][i] || 1e-12);
  }
  return x;
}

function evalPoly(coefs: number[], x: number): number {
  let s = 0;
  let p = 1;
  for (const c of coefs) {
    s += c * p;
    p *= x;
  }
  return s;
}

// Bootstrap: trekk n indekser med replacement
function bootstrap(rng: () => number, xs: number[], ys: number[]): { xs: number[]; ys: number[] } {
  const n = xs.length;
  const bx: number[] = [];
  const by: number[] = [];
  for (let i = 0; i < n; i++) {
    const j = Math.floor(rng() * n);
    bx.push(xs[j]);
    by.push(ys[j]);
  }
  return { xs: bx, ys: by };
}

// ============================================================================
// HOVED-KOMPONENT
// ============================================================================

export function BiasVariansVisualizer({ defaultMode = "darts" }: { defaultMode?: Mode } = {}) {
  const [mode, setMode] = useState<Mode>(defaultMode);

  return (
    <div
      className="rounded-2xl border border-border bg-card overflow-hidden"
      role="region"
      aria-label="Interaktiv visualisering: Bias-varians-tradeoff"
    >
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Interaktiv visualisering
          </div>
          <div className="text-sm font-semibold">
            Bias-varians — fra dart-blink til polynom-grad
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

      <div className="p-4 sm:p-6 bg-background">
        {mode === "darts" && <DartsView />}
        {mode === "polynomial" && <PolynomialView />}
        {mode === "curves" && <CurvesView />}
        {mode === "sample-size" && <SampleSizeView />}
      </div>

      <div className="px-4 py-3 border-t border-border bg-muted/20">
        <div className="text-xs text-muted-foreground italic">{MODE_NOTE[mode]}</div>
      </div>
    </div>
  );
}

// ============================================================================
// MODUS 1: DART-METAFOREN — 2×2 grid + animerte kast
// ============================================================================

type DartScenario = {
  key: string;
  label: string;
  bias: number; // 0..1
  variance: number; // 0..1
  tint: string;
};

const DART_SCENARIOS: DartScenario[] = [
  { key: "ll", label: "Lav bias · Lav varians", bias: 0, variance: 0.05, tint: "text-emerald-500" },
  { key: "lh", label: "Lav bias · Høy varians", bias: 0, variance: 0.45, tint: "text-rose-500" },
  {
    key: "hl",
    label: "Høy bias · Lav varians",
    bias: 0.55,
    variance: 0.05,
    tint: "text-amber-500",
  },
  {
    key: "hh",
    label: "Høy bias · Høy varians",
    bias: 0.55,
    variance: 0.45,
    tint: "text-fuchsia-500",
  },
];

const TOTAL_DARTS = 20;
const DART_INTERVAL_MS = 230;

function generateDartShots(
  seed: number,
  n: number,
  bias: number,
  variance: number,
): Array<[number, number]> {
  const rng = makeRng(seed);
  const biasDx = bias * 0.5;
  const biasDy = -bias * 0.4;
  const sigma = 0.04 + variance * 0.85;
  return Array.from({ length: n }, () => {
    const dx = gaussian(rng) * sigma + biasDx;
    const dy = gaussian(rng) * sigma + biasDy;
    return [Math.max(-1.05, Math.min(1.05, dx)), Math.max(-1.05, Math.min(1.05, dy))] as [
      number,
      number,
    ];
  });
}

function DartsView() {
  const [seed, setSeed] = useState(7);
  const [shotsRevealed, setShotsRevealed] = useState(TOTAL_DARTS);
  const [isAnimating, setIsAnimating] = useState(false);
  const animRef = useRef<number | null>(null);

  // Precompute all shots for all scenarios
  const allShots = useMemo(
    () =>
      DART_SCENARIOS.map((sc) =>
        generateDartShots(
          seed * 101 + sc.key.charCodeAt(0) * 17 + sc.key.charCodeAt(1) * 31,
          TOTAL_DARTS,
          sc.bias,
          sc.variance,
        ),
      ),
    [seed],
  );

  function startAnimation() {
    if (animRef.current !== null) {
      window.clearInterval(animRef.current);
      animRef.current = null;
    }
    setShotsRevealed(0);
    setIsAnimating(true);
    let revealed = 0;
    animRef.current = window.setInterval(() => {
      revealed += 1;
      setShotsRevealed(revealed);
      if (revealed >= TOTAL_DARTS) {
        if (animRef.current !== null) {
          window.clearInterval(animRef.current);
          animRef.current = null;
        }
        setIsAnimating(false);
      }
    }, DART_INTERVAL_MS);
  }

  function reshuffleAndAnimate() {
    setSeed((s) => s + 1);
    startAnimation();
  }

  // Kick off one animation on mount
  useEffect(() => {
    startAnimation();
    return () => {
      if (animRef.current !== null) window.clearInterval(animRef.current);
    };
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="text-xs text-muted-foreground max-w-md">
          Hvert dart-kast er én modell trent på et nytt treningssett. Animasjonen viser{" "}
          {TOTAL_DARTS} treninger lande på hver blink.
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startAnimation}
            disabled={isAnimating}
            className="inline-flex items-center gap-1.5 text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted disabled:opacity-50"
          >
            <Play className="h-3 w-3" />
            Spill av
          </button>
          <button
            type="button"
            onClick={reshuffleAndAnimate}
            className="inline-flex items-center gap-1.5 text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted"
          >
            <Shuffle className="h-3 w-3" />
            Nye kast
          </button>
        </div>
      </div>

      {/* Row label */}
      <div className="grid grid-cols-[auto_1fr_1fr] gap-2 sm:gap-3 items-stretch">
        <div />
        <div className="text-[10px] sm:text-xs text-center uppercase tracking-wider text-muted-foreground font-semibold pb-1">
          Lav varians
        </div>
        <div className="text-[10px] sm:text-xs text-center uppercase tracking-wider text-muted-foreground font-semibold pb-1">
          Høy varians
        </div>

        {/* Row 1: low bias */}
        <div className="flex items-center text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-semibold rotate-180 [writing-mode:vertical-rl] sm:[writing-mode:horizontal-tb] sm:rotate-0 sm:pr-2 justify-center sm:justify-end">
          <span className="sm:block">Lav bias</span>
        </div>
        <DartPanel scenario={DART_SCENARIOS[0]} shots={allShots[0].slice(0, shotsRevealed)} />
        <DartPanel scenario={DART_SCENARIOS[1]} shots={allShots[1].slice(0, shotsRevealed)} />

        {/* Row 2: high bias */}
        <div className="flex items-center text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-semibold rotate-180 [writing-mode:vertical-rl] sm:[writing-mode:horizontal-tb] sm:rotate-0 sm:pr-2 justify-center sm:justify-end">
          <span className="sm:block">Høy bias</span>
        </div>
        <DartPanel scenario={DART_SCENARIOS[2]} shots={allShots[2].slice(0, shotsRevealed)} />
        <DartPanel scenario={DART_SCENARIOS[3]} shots={allShots[3].slice(0, shotsRevealed)} />
      </div>

      <div className="mt-4 text-[11px] text-muted-foreground flex justify-between">
        <span>
          Kast:{" "}
          <span className="font-mono text-foreground">
            {shotsRevealed}/{TOTAL_DARTS}
          </span>
        </span>
        <span>Bullseye = sann modell. Blå prikk = én trent modell.</span>
      </div>
    </div>
  );
}

function DartPanel({
  scenario,
  shots,
}: {
  scenario: DartScenario;
  shots: Array<[number, number]>;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-2 sm:p-3 flex flex-col items-center">
      <div
        className={`text-[10px] sm:text-[11px] uppercase tracking-wide font-semibold ${scenario.tint} mb-1.5 text-center leading-tight`}
      >
        {scenario.label}
      </div>
      <div className="w-full aspect-square max-w-[160px]">
        <DartBoardSvg shots={shots} />
      </div>
    </div>
  );
}

function DartBoardSvg({ shots }: { shots: Array<[number, number]> }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 6;
  const rings = [R * 0.18, R * 0.42, R * 0.68, R];
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="block w-full h-full">
      <circle cx={cx} cy={cy} r={rings[3]} fill="currentColor" className="text-muted/30" />
      <circle cx={cx} cy={cy} r={rings[2]} fill="currentColor" className="text-muted/50" />
      <circle cx={cx} cy={cy} r={rings[1]} fill="currentColor" className="text-amber-500/30" />
      <circle cx={cx} cy={cy} r={rings[0]} fill="currentColor" className="text-rose-500/70" />
      <line
        x1={cx - rings[3]}
        y1={cy}
        x2={cx + rings[3]}
        y2={cy}
        stroke="currentColor"
        className="text-muted-foreground"
        strokeWidth={0.6}
        opacity={0.4}
      />
      <line
        x1={cx}
        y1={cy - rings[3]}
        x2={cx}
        y2={cy + rings[3]}
        stroke="currentColor"
        className="text-muted-foreground"
        strokeWidth={0.6}
        opacity={0.4}
      />
      <circle cx={cx} cy={cy} r={2.0} fill="currentColor" className="text-foreground" />
      {shots.map(([x, y], i) => (
        <circle
          key={i}
          cx={cx + x * rings[3]}
          cy={cy + y * rings[3]}
          r={3.4}
          fill="currentColor"
          className="text-sky-500"
          stroke="currentColor"
          strokeWidth={0.6}
          opacity={0.92}
        >
          <animate attributeName="r" from="0" to="3.4" dur="0.25s" fill="freeze" />
          <animate attributeName="opacity" from="0" to="0.92" dur="0.25s" fill="freeze" />
        </circle>
      ))}
    </svg>
  );
}

// ============================================================================
// MODUS 2: POLYNOM-GRAD + BOOTSTRAP-FITS
// ============================================================================

const POLY_BASE_SEED = 42;
const POLY_N_POINTS = 20;
const X_MIN = -3;
const X_MAX = 3;

function PolynomialView() {
  const [degree, setDegree] = useState(3);
  const [bootstrapSeed, setBootstrapSeed] = useState(1);

  const data = useMemo(() => sampleData(POLY_BASE_SEED, POLY_N_POINTS, 0.55), []);

  // Main fit on full data + 3 bootstrap fits
  const fits = useMemo(() => {
    const main = fitPolynomial(data.xs, data.ys, degree);
    const rng = makeRng(bootstrapSeed * 991);
    const boots = [0, 1, 2].map(() => {
      const b = bootstrap(rng, data.xs, data.ys);
      return fitPolynomial(b.xs, b.ys, degree);
    });
    return { main, boots };
  }, [data, degree, bootstrapSeed]);

  // Approximate bias^2 and variance over a grid
  const stats = useMemo(() => {
    const grid = Array.from({ length: 40 }, (_, i) => X_MIN + (i / 39) * (X_MAX - X_MIN));
    const truth = grid.map((x) => trueFn(x));
    // Resample N replicate datasets and fit
    const REPS = 25;
    const rng = makeRng(bootstrapSeed * 7919 + degree);
    const predMatrix: number[][] = []; // REPS x grid.length
    for (let r = 0; r < REPS; r++) {
      const ds = sampleData(rng() * 1e7, POLY_N_POINTS, 0.55);
      const cf = fitPolynomial(ds.xs, ds.ys, degree);
      predMatrix.push(grid.map((x) => evalPoly(cf, x)));
    }
    // Average prediction per grid point
    const avg = grid.map((_, i) => predMatrix.reduce((s, row) => s + row[i], 0) / REPS);
    // bias^2 = mean((avg - truth)^2)
    let bias2 = 0;
    for (let i = 0; i < grid.length; i++) bias2 += (avg[i] - truth[i]) ** 2;
    bias2 /= grid.length;
    // variance = mean over grid of var across reps
    let varSum = 0;
    for (let i = 0; i < grid.length; i++) {
      let s = 0;
      for (let r = 0; r < REPS; r++) s += (predMatrix[r][i] - avg[i]) ** 2;
      varSum += s / REPS;
    }
    const variance = varSum / grid.length;
    return { bias2, variance, total: bias2 + variance };
  }, [degree, bootstrapSeed]);

  // SVG plot
  const W = 460;
  const H = 260;
  const PAD = 30;
  const yMin = -1.5;
  const yMax = 3.2;
  const sx = (v: number) => PAD + ((v - X_MIN) / (X_MAX - X_MIN)) * (W - 2 * PAD);
  const sy = (v: number) => H - PAD - ((v - yMin) / (yMax - yMin)) * (H - 2 * PAD);

  const xs = Array.from({ length: 100 }, (_, i) => X_MIN + (i / 99) * (X_MAX - X_MIN));

  function pathFor(coefs: number[]): string {
    return xs
      .map((x, i) => {
        const y = Math.max(yMin - 5, Math.min(yMax + 5, evalPoly(coefs, x)));
        return `${i === 0 ? "M" : "L"} ${sx(x).toFixed(2)} ${sy(y).toFixed(2)}`;
      })
      .join(" ");
  }

  const truePath = xs
    .map((x, i) => `${i === 0 ? "M" : "L"} ${sx(x).toFixed(2)} ${sy(trueFn(x)).toFixed(2)}`)
    .join(" ");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <label className="flex items-center gap-2 text-xs text-muted-foreground flex-1">
          <span className="whitespace-nowrap">
            Polynom-grad: <span className="font-mono text-foreground font-bold">{degree}</span>
          </span>
          <input
            type="range"
            min={1}
            max={15}
            step={1}
            value={degree}
            onChange={(e) => setDegree(parseInt(e.target.value))}
            className="flex-1"
            aria-label="Polynom-grad"
          />
        </label>
        <button
          type="button"
          onClick={() => setBootstrapSeed((s) => s + 1)}
          className="inline-flex items-center gap-1.5 text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted"
        >
          <Shuffle className="h-3 w-3" />
          Nye replikat
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card p-3 flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} className="block">
          {/* Axes */}
          <line
            x1={PAD}
            y1={H - PAD}
            x2={W - PAD}
            y2={H - PAD}
            stroke="currentColor"
            className="text-muted-foreground"
            opacity={0.5}
          />
          <line
            x1={PAD}
            y1={PAD}
            x2={PAD}
            y2={H - PAD}
            stroke="currentColor"
            className="text-muted-foreground"
            opacity={0.5}
          />
          {/* True curve */}
          <path
            d={truePath}
            fill="none"
            stroke="currentColor"
            className="text-emerald-500"
            strokeWidth={1.6}
            strokeDasharray="4 3"
            opacity={0.85}
          />
          {/* Bootstrap fits */}
          {fits.boots.map((coefs, i) => (
            <path
              key={i}
              d={pathFor(coefs)}
              fill="none"
              stroke="currentColor"
              className="text-rose-400"
              strokeWidth={1.2}
              opacity={0.45}
            />
          ))}
          {/* Main fit */}
          <path
            d={pathFor(fits.main)}
            fill="none"
            stroke="currentColor"
            className="text-sky-500"
            strokeWidth={2.2}
          />
          {/* Training points */}
          {data.xs.map((x, i) => (
            <circle
              key={i}
              cx={sx(x)}
              cy={sy(data.ys[i])}
              r={3}
              fill="currentColor"
              className="text-foreground"
              opacity={0.85}
            />
          ))}
          {/* Legend */}
          <g transform={`translate(${W - PAD - 130}, ${PAD + 4})`}>
            <rect
              x={-6}
              y={-2}
              width={136}
              height={50}
              fill="currentColor"
              className="text-card"
              opacity={0.85}
              rx={4}
            />
            <line
              x1={0}
              y1={8}
              x2={18}
              y2={8}
              stroke="currentColor"
              className="text-emerald-500"
              strokeWidth={1.6}
              strokeDasharray="4 3"
            />
            <text x={22} y={11} fontSize={9} fill="currentColor" className="text-muted-foreground">
              sann funksjon
            </text>
            <line
              x1={0}
              y1={22}
              x2={18}
              y2={22}
              stroke="currentColor"
              className="text-sky-500"
              strokeWidth={2.2}
            />
            <text x={22} y={25} fontSize={9} fill="currentColor" className="text-muted-foreground">
              hovedfit
            </text>
            <line
              x1={0}
              y1={36}
              x2={18}
              y2={36}
              stroke="currentColor"
              className="text-rose-400"
              strokeWidth={1.2}
              opacity={0.5}
            />
            <text x={22} y={39} fontSize={9} fill="currentColor" className="text-muted-foreground">
              bootstrap-replikat
            </text>
          </g>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
        <div className="rounded-md border border-border bg-card p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-amber-500 font-semibold">
            Bias²
          </div>
          <div className="text-base font-mono font-bold mt-0.5">{stats.bias2.toFixed(3)}</div>
        </div>
        <div className="rounded-md border border-border bg-card p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-rose-500 font-semibold">
            Varians
          </div>
          <div className="text-base font-mono font-bold mt-0.5">{stats.variance.toFixed(3)}</div>
        </div>
        <div className="rounded-md border border-border bg-card p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-brand font-semibold">Sum</div>
          <div className="text-base font-mono font-bold mt-0.5">{stats.total.toFixed(3)}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODUS 3: TRENING- VS TEST-FEIL-KURVER
// ============================================================================

function CurvesView() {
  // Cache MSE-data for grader 1..15
  const series = useMemo(() => {
    const data = sampleData(POLY_BASE_SEED, POLY_N_POINTS, 0.55);
    // Stort "ekte" test-sett (mange punkter på samme sanne funksjon)
    const testXs = Array.from({ length: 200 }, (_, i) => X_MIN + (i / 199) * (X_MAX - X_MIN));
    const testYs = testXs.map((x) => trueFn(x));
    const points: Array<{ k: number; train: number; test: number }> = [];
    for (let k = 1; k <= 15; k++) {
      const cf = fitPolynomial(data.xs, data.ys, k);
      const trPred = data.xs.map((x) => evalPoly(cf, x));
      const trainMSE = trPred.reduce((s, p, i) => s + (p - data.ys[i]) ** 2, 0) / data.ys.length;
      const tePred = testXs.map((x) => evalPoly(cf, x));
      const testMSE = tePred.reduce((s, p, i) => s + (p - testYs[i]) ** 2, 0) / testYs.length;
      points.push({ k, train: trainMSE, test: testMSE });
    }
    // Find sweet spot
    let bestK = 1;
    let bestErr = Infinity;
    for (const p of points) {
      if (p.test < bestErr) {
        bestErr = p.test;
        bestK = p.k;
      }
    }
    return { points, bestK };
  }, []);

  const [selectedK, setSelectedK] = useState(series.bestK);

  // Plot setup
  const W = 460;
  const H = 260;
  const PAD_L = 40;
  const PAD_R = 16;
  const PAD_T = 20;
  const PAD_B = 36;
  const kMin = 1;
  const kMax = 15;
  const yVals = series.points.flatMap((p) => [p.train, p.test]);
  const yMaxRaw = Math.max(...yVals);
  const yMax = Math.min(yMaxRaw * 1.05, 4);
  const yMin = 0;
  const sx = (k: number) => PAD_L + ((k - kMin) / (kMax - kMin)) * (W - PAD_L - PAD_R);
  const sy = (v: number) => H - PAD_B - ((v - yMin) / (yMax - yMin)) * (H - PAD_T - PAD_B);

  const trainPath = series.points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${sx(p.k).toFixed(1)} ${sy(Math.min(p.train, yMax)).toFixed(1)}`,
    )
    .join(" ");
  const testPath = series.points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${sx(p.k).toFixed(1)} ${sy(Math.min(p.test, yMax)).toFixed(1)}`,
    )
    .join(" ");

  const sel = series.points.find((p) => p.k === selectedK) ?? series.points[0];
  const sweet = series.points.find((p) => p.k === series.bestK) ?? series.points[0];

  // Annotation label based on selectedK relative to sweet spot
  let regionLabel = "optimal";
  let regionClass = "text-emerald-500";
  if (selectedK < series.bestK - 1) {
    regionLabel = "underfit (høy bias)";
    regionClass = "text-amber-500";
  } else if (selectedK > series.bestK + 1) {
    regionLabel = "overfit (høy varians)";
    regionClass = "text-rose-500";
  }

  // Y-axis ticks
  const yTicks = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <label className="flex items-center gap-2 text-xs text-muted-foreground flex-1">
          <span className="whitespace-nowrap">
            Modell-kompleksitet (grad):{" "}
            <span className="font-mono text-foreground font-bold">{selectedK}</span>
          </span>
          <input
            type="range"
            min={kMin}
            max={kMax}
            step={1}
            value={selectedK}
            onChange={(e) => setSelectedK(parseInt(e.target.value))}
            className="flex-1"
            aria-label="Modell-kompleksitet"
          />
        </label>
        <button
          type="button"
          onClick={() => setSelectedK(series.bestK)}
          className="inline-flex items-center gap-1.5 text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted whitespace-nowrap"
        >
          <RotateCcw className="h-3 w-3" />
          Snap til optimal
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card p-3 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} className="block">
          {/* Y-grid */}
          {yTicks.map((tv, i) => (
            <g key={i}>
              <line
                x1={PAD_L}
                y1={sy(tv)}
                x2={W - PAD_R}
                y2={sy(tv)}
                stroke="currentColor"
                className="text-muted-foreground"
                opacity={0.12}
              />
              <text
                x={PAD_L - 6}
                y={sy(tv) + 3}
                fontSize={9}
                fill="currentColor"
                className="text-muted-foreground"
                textAnchor="end"
              >
                {tv.toFixed(1)}
              </text>
            </g>
          ))}
          {/* X-axis */}
          <line
            x1={PAD_L}
            y1={H - PAD_B}
            x2={W - PAD_R}
            y2={H - PAD_B}
            stroke="currentColor"
            className="text-muted-foreground"
            opacity={0.5}
          />
          <line
            x1={PAD_L}
            y1={PAD_T}
            x2={PAD_L}
            y2={H - PAD_B}
            stroke="currentColor"
            className="text-muted-foreground"
            opacity={0.5}
          />
          {/* X ticks */}
          {series.points
            .filter((_, i) => i % 2 === 0)
            .map((p) => (
              <text
                key={p.k}
                x={sx(p.k)}
                y={H - PAD_B + 14}
                fontSize={9}
                fill="currentColor"
                className="text-muted-foreground"
                textAnchor="middle"
              >
                {p.k}
              </text>
            ))}
          <text
            x={(PAD_L + W - PAD_R) / 2}
            y={H - 4}
            fontSize={10}
            fill="currentColor"
            className="text-muted-foreground"
            textAnchor="middle"
          >
            modell-kompleksitet (polynom-grad)
          </text>
          <text
            x={10}
            y={PAD_T - 6}
            fontSize={10}
            fill="currentColor"
            className="text-muted-foreground"
          >
            MSE
          </text>

          {/* Sweet spot pulsering */}
          <circle
            cx={sx(sweet.k)}
            cy={sy(Math.min(sweet.test, yMax))}
            r={7}
            fill="currentColor"
            className="text-emerald-500"
            opacity={0.18}
          >
            <animate attributeName="r" values="6;12;6" dur="1.8s" repeatCount="indefinite" />
            <animate
              attributeName="opacity"
              values="0.3;0.05;0.3"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx={sx(sweet.k)}
            cy={sy(Math.min(sweet.test, yMax))}
            r={3.5}
            fill="currentColor"
            className="text-emerald-500"
          />

          {/* Curves */}
          <path
            d={trainPath}
            fill="none"
            stroke="currentColor"
            className="text-sky-500"
            strokeWidth={2}
          />
          <path
            d={testPath}
            fill="none"
            stroke="currentColor"
            className="text-rose-500"
            strokeWidth={2}
          />

          {/* Slider position vertical line */}
          <line
            x1={sx(selectedK)}
            y1={PAD_T}
            x2={sx(selectedK)}
            y2={H - PAD_B}
            stroke="currentColor"
            className="text-foreground"
            strokeWidth={1.2}
            strokeDasharray="3 3"
            opacity={0.7}
          />
          <circle
            cx={sx(selectedK)}
            cy={sy(Math.min(sel.train, yMax))}
            r={4}
            fill="currentColor"
            className="text-sky-500"
            stroke="currentColor"
            strokeWidth={1.5}
          />
          <circle
            cx={sx(selectedK)}
            cy={sy(Math.min(sel.test, yMax))}
            r={4}
            fill="currentColor"
            className="text-rose-500"
            stroke="currentColor"
            strokeWidth={1.5}
          />

          {/* Region labels */}
          <text
            x={PAD_L + 18}
            y={PAD_T + 14}
            fontSize={10}
            fill="currentColor"
            className="text-amber-500"
            opacity={0.7}
          >
            underfit
          </text>
          <text
            x={W - PAD_R - 14}
            y={PAD_T + 14}
            fontSize={10}
            fill="currentColor"
            className="text-rose-500"
            opacity={0.7}
            textAnchor="end"
          >
            overfit
          </text>
          <text
            x={sx(sweet.k)}
            y={sy(Math.min(sweet.test, yMax)) - 12}
            fontSize={10}
            fill="currentColor"
            className="text-emerald-500"
            textAnchor="middle"
            fontWeight="bold"
          >
            optimal
          </text>

          {/* Legend */}
          <g transform={`translate(${PAD_L + 60}, ${PAD_T + 4})`}>
            <line
              x1={0}
              y1={6}
              x2={16}
              y2={6}
              stroke="currentColor"
              className="text-sky-500"
              strokeWidth={2}
            />
            <text x={20} y={9} fontSize={9} fill="currentColor" className="text-muted-foreground">
              trening-MSE
            </text>
            <line
              x1={84}
              y1={6}
              x2={100}
              y2={6}
              stroke="currentColor"
              className="text-rose-500"
              strokeWidth={2}
            />
            <text x={104} y={9} fontSize={9} fill="currentColor" className="text-muted-foreground">
              test-MSE
            </text>
          </g>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
        <div className="rounded-md border border-border bg-card p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-sky-500 font-semibold">
            Trening-MSE
          </div>
          <div className="text-base font-mono font-bold mt-0.5">{sel.train.toFixed(3)}</div>
        </div>
        <div className="rounded-md border border-border bg-card p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-rose-500 font-semibold">
            Test-MSE
          </div>
          <div className="text-base font-mono font-bold mt-0.5">{sel.test.toFixed(3)}</div>
        </div>
        <div className="rounded-md border border-border bg-card p-2.5">
          <div className={`text-[10px] uppercase tracking-wider font-semibold ${regionClass}`}>
            Region
          </div>
          <div className="text-sm font-medium mt-0.5 leading-tight">{regionLabel}</div>
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Optimal grad er <span className="font-mono text-emerald-500 font-bold">{series.bestK}</span>{" "}
        (laveste test-MSE = {sweet.test.toFixed(3)}). Den pulsende grønne ringen markerer sweet
        spot.
      </div>
    </div>
  );
}

// ============================================================================
// MODUS 4: SAMPLE-STØRRELSE-EFFEKT
// ============================================================================

function SampleSizeView() {
  // Diskrete n-verdier slik at sliderr-step gir presise tall
  const N_VALUES = [10, 20, 40, 80, 160, 320, 640, 1000];
  const [idx, setIdx] = useState(0);
  const [seed, setSeed] = useState(1);
  const [degree] = useState(8); // fast, høy nok til å vise varians

  const n = N_VALUES[idx];

  const { fits, variance } = useMemo(() => {
    const rng = makeRng(seed * 977 + n);
    const fitCoefs: number[][] = [];
    // 5 helt uavhengige replikat (ikke bootstrap; trekk nye data fra samme sanne funksjon)
    for (let r = 0; r < 5; r++) {
      const ds = sampleData(rng() * 1e7, n, 0.55);
      fitCoefs.push(fitPolynomial(ds.xs, ds.ys, degree));
    }
    // Variance estimate over grid
    const grid = Array.from({ length: 40 }, (_, i) => X_MIN + (i / 39) * (X_MAX - X_MIN));
    const REPS = 30;
    const predMatrix: number[][] = [];
    for (let r = 0; r < REPS; r++) {
      const ds = sampleData(rng() * 1e7, n, 0.55);
      const cf = fitPolynomial(ds.xs, ds.ys, degree);
      predMatrix.push(grid.map((x) => evalPoly(cf, x)));
    }
    const avg = grid.map((_, i) => predMatrix.reduce((s, row) => s + row[i], 0) / REPS);
    let varSum = 0;
    for (let i = 0; i < grid.length; i++) {
      let s = 0;
      for (let r = 0; r < REPS; r++) s += (predMatrix[r][i] - avg[i]) ** 2;
      varSum += s / REPS;
    }
    return { fits: fitCoefs, variance: varSum / grid.length };
  }, [n, seed, degree]);

  // Plot
  const W = 460;
  const H = 260;
  const PAD = 30;
  const yMin = -1.5;
  const yMax = 3.2;
  const sx = (v: number) => PAD + ((v - X_MIN) / (X_MAX - X_MIN)) * (W - 2 * PAD);
  const sy = (v: number) => H - PAD - ((v - yMin) / (yMax - yMin)) * (H - 2 * PAD);

  const plotXs = Array.from({ length: 120 }, (_, i) => X_MIN + (i / 119) * (X_MAX - X_MIN));
  const truePath = plotXs
    .map((x, i) => `${i === 0 ? "M" : "L"} ${sx(x).toFixed(2)} ${sy(trueFn(x)).toFixed(2)}`)
    .join(" ");

  function pathFor(cf: number[]): string {
    return plotXs
      .map((x, i) => {
        const y = Math.max(yMin - 5, Math.min(yMax + 5, evalPoly(cf, x)));
        return `${i === 0 ? "M" : "L"} ${sx(x).toFixed(2)} ${sy(y).toFixed(2)}`;
      })
      .join(" ");
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <label className="flex items-center gap-2 text-xs text-muted-foreground flex-1">
          <span className="whitespace-nowrap">
            Treningssett-størrelse n:{" "}
            <span className="font-mono text-foreground font-bold">{n}</span>
          </span>
          <input
            type="range"
            min={0}
            max={N_VALUES.length - 1}
            step={1}
            value={idx}
            onChange={(e) => setIdx(parseInt(e.target.value))}
            className="flex-1"
            aria-label="Treningssett-størrelse"
          />
        </label>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="inline-flex items-center gap-1.5 text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted whitespace-nowrap"
        >
          <Shuffle className="h-3 w-3" />
          Nye trekninger
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card p-3 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} className="block">
          <line
            x1={PAD}
            y1={H - PAD}
            x2={W - PAD}
            y2={H - PAD}
            stroke="currentColor"
            className="text-muted-foreground"
            opacity={0.5}
          />
          <line
            x1={PAD}
            y1={PAD}
            x2={PAD}
            y2={H - PAD}
            stroke="currentColor"
            className="text-muted-foreground"
            opacity={0.5}
          />
          {/* True curve */}
          <path
            d={truePath}
            fill="none"
            stroke="currentColor"
            className="text-emerald-500"
            strokeWidth={1.8}
            strokeDasharray="5 3"
            opacity={0.85}
          />
          {/* 5 replicate fits */}
          {fits.map((cf, i) => (
            <path
              key={i}
              d={pathFor(cf)}
              fill="none"
              stroke="currentColor"
              className="text-sky-400"
              strokeWidth={1.4}
              opacity={0.55}
              style={{ transition: "opacity 0.3s ease" }}
            />
          ))}
          {/* Legend */}
          <g transform={`translate(${W - PAD - 130}, ${PAD + 4})`}>
            <rect
              x={-6}
              y={-2}
              width={136}
              height={36}
              fill="currentColor"
              className="text-card"
              opacity={0.85}
              rx={4}
            />
            <line
              x1={0}
              y1={8}
              x2={18}
              y2={8}
              stroke="currentColor"
              className="text-emerald-500"
              strokeWidth={1.8}
              strokeDasharray="5 3"
            />
            <text x={22} y={11} fontSize={9} fill="currentColor" className="text-muted-foreground">
              sann funksjon
            </text>
            <line
              x1={0}
              y1={22}
              x2={18}
              y2={22}
              stroke="currentColor"
              className="text-sky-400"
              strokeWidth={1.4}
              opacity={0.7}
            />
            <text x={22} y={25} fontSize={9} fill="currentColor" className="text-muted-foreground">
              5 replikat-fits
            </text>
          </g>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        <div className="rounded-md border border-border bg-card p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-rose-500 font-semibold">
            Varians-estimat
          </div>
          <div className="text-base font-mono font-bold mt-0.5">{variance.toFixed(4)}</div>
        </div>
        <div className="rounded-md border border-border bg-card p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-brand font-semibold">
            Polynom-grad
          </div>
          <div className="text-base font-mono font-bold mt-0.5">{degree} (fast)</div>
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Når n går fra 10 til 1000, krymper variansen omtrent som ~1/n. Bias er uendret — modellen er
        like fleksibel — men spredningen mellom replikat-fits faller dramatisk.
      </div>
    </div>
  );
}
