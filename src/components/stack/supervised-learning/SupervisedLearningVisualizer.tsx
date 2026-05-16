import { useMemo, useState } from "react";
import { Shuffle } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv visualisering for supervised learning — generelle prinsipper.
// Fem moduser:
//   1) "poly"   — Polynom-fit på 1D-scatter. Slider for grad (1–15). Train/test-MSE live.
//                  Klassisk bias/varians-trade-off: degree↑ → train-MSE → 0, test-MSE eksploderer.
//   2) "split"  — 100 punkter delt 60/20/20 i train/val/test. Animer "bøttene".
//   3) "lcurve" — Læringskurver: train- og val-loss som funksjon av train-størrelse.
//                  Tre forhåndsdefinerte modell+data-kombinasjoner.
//   4) "knn"    — 2D-scatter (to klasser), slider for k. Decision regions tegnes som
//                  fargetint i bakgrunnen. Hover → highlight k nærmeste naboer.
//   5) "metrics"— Konfusjonsmatrise + accuracy / precision / recall / F1.
//                  Slider for beslutningsterskel.
// --------------------------------------------------------------------------

type Mode = "poly" | "split" | "lcurve" | "knn" | "metrics";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "poly", label: "Overfit / underfit", sub: "Polynom-grad slider" },
  { id: "split", label: "Train / val / test", sub: "60 / 20 / 20" },
  { id: "lcurve", label: "Læringskurver", sub: "Loss vs treningsstørrelse" },
  { id: "knn", label: "k-NN beslutningsregioner", sub: "k-slider, hover for naboer" },
  { id: "metrics", label: "Konfusjonsmatrise", sub: "Accuracy, precision, recall, F1" },
];

const MODE_NOTE: Record<Mode, string> = {
  poly:
    "Overfit = pugger nøyaktig hvilke spørsmål som var på prøven i fjor. Underfit = har ikke lest pensum, gjetter en regel som passer halvparten. Følg test-MSE: den bunner ut ved riktig kompleksitet og eksploderer når modellen begynner å pugge støy.",
  split:
    "Train / val / test = treningstime / generalprøve / eksamen. Train brukes til å lære vektene. Val brukes til å justere hyperparametere (degree, k, max_depth…). Test rører du KUN én gang — for ærlig sluttvurdering. Bruker du test til tuning, lekker du info.",
  lcurve:
    "Læringskurver avslører hva som er galt: BÅDE høye → underfit (modellen er for enkel, mer data hjelper ikke). STORT gap → overfit (lavt train-loss, høyt val-loss). LAVT + LITE gap → bra balanse.",
  knn:
    "k-NN har ingen 'trening' — modellen er bare data. Liten k (1–3) → grensa blir hakkete (overfit på støy). Stor k → grensa blir glatt men feil (underfit, glatter ut struktur). Hover-punktet viser de k nærmeste — flertallet bestemmer prediksjon.",
  metrics:
    "Terskel-skyveren viser trade-off: senker du terskelen flagger du flere som positiv → recall↑, men precision↓ (flere falske alarmer). Velg terskel ut fra kostnaden ved hver feiltype.",
};

// ============================================================================
// MATTE-HJELPERE
// ============================================================================

// Polynom-regresjon ved normal-likning. Returnerer koeffisientene a_0..a_d.
function fitPolynomial(xs: number[], ys: number[], degree: number): number[] {
  const n = xs.length;
  const m = degree + 1;
  // Vandermonde-matrise X (n x m)
  const X: number[][] = xs.map((x) => {
    const row = new Array(m);
    let p = 1;
    for (let j = 0; j < m; j++) {
      row[j] = p;
      p *= x;
    }
    return row;
  });
  // Beregn (X^T X) og X^T y, deretter løs systemet med Gauss-eliminasjon.
  const XtX: number[][] = Array.from({ length: m }, () => new Array(m).fill(0));
  const Xty: number[] = new Array(m).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      Xty[j] += X[i][j] * ys[i];
      for (let k = 0; k < m; k++) {
        XtX[j][k] += X[i][j] * X[i][k];
      }
    }
  }
  // Lett ridge-regularisering for å unngå singulær matrise ved høy grad.
  for (let j = 0; j < m; j++) XtX[j][j] += 1e-8;
  return solveLinearSystem(XtX, Xty);
}

function solveLinearSystem(Ain: number[][], bin: number[]): number[] {
  const n = bin.length;
  const A = Ain.map((row) => row.slice());
  const b = bin.slice();
  for (let i = 0; i < n; i++) {
    // partial pivoting
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
    for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j];
    x[i] = s / (A[i][i] || 1e-12);
  }
  return x;
}

function evalPoly(coefs: number[], x: number): number {
  let p = 1;
  let y = 0;
  for (let j = 0; j < coefs.length; j++) {
    y += coefs[j] * p;
    p *= x;
  }
  return y;
}

function mse(predicted: number[], actual: number[]): number {
  let s = 0;
  for (let i = 0; i < predicted.length; i++) {
    const d = predicted[i] - actual[i];
    s += d * d;
  }
  return s / predicted.length;
}

// Mulberry32-PRNG for reproduserbare datasett.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randn(rng: () => number): number {
  // Box-Muller
  const u = Math.max(rng(), 1e-9);
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// "Sannheten" for poly-modus: en moderat snill sinus.
function trueFn(x: number): number {
  return Math.sin(x * 1.2) + 0.3 * x;
}

// ============================================================================
// HOVEDKOMPONENT
// ============================================================================

export function SupervisedLearningVisualizer() {
  const [mode, setMode] = useState<Mode>("poly");

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Interaktiv visualisering
          </div>
          <div className="text-sm font-semibold">
            Supervised learning — overfit/underfit, splits, læringskurver, k-NN og metrikker
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
        {mode === "poly" && <PolynomialView />}
        {mode === "split" && <SplitView />}
        {mode === "lcurve" && <LearningCurveView />}
        {mode === "knn" && <KnnView />}
        {mode === "metrics" && <MetricsView />}
      </div>

      <div className="px-4 py-3 border-t border-border bg-muted/20">
        <div className="text-xs text-muted-foreground italic">{MODE_NOTE[mode]}</div>
      </div>
    </div>
  );
}

// ============================================================================
// 1) POLYNOM-FIT — UNDERFIT / GOOD / OVERFIT
// ============================================================================

function PolynomialView() {
  const [degree, setDegree] = useState(3);
  const [seed, setSeed] = useState(7);

  const { xsTrain, ysTrain, xsTest, ysTest } = useMemo(() => {
    const rng = mulberry32(seed);
    const xs: number[] = [];
    for (let i = 0; i < 12; i++) {
      xs.push(-3 + (6 * i) / 11);
    }
    const ys = xs.map((x) => trueFn(x) + randn(rng) * 0.45);
    // Test-sett: 30 punkter fra samme fordeling, uniformt fordelt.
    const xsT: number[] = [];
    const ysT: number[] = [];
    for (let i = 0; i < 30; i++) {
      const x = -3 + 6 * rng();
      xsT.push(x);
      ysT.push(trueFn(x) + randn(rng) * 0.45);
    }
    return { xsTrain: xs, ysTrain: ys, xsTest: xsT, ysTest: ysT };
  }, [seed]);

  const coefs = useMemo(
    () => fitPolynomial(xsTrain, ysTrain, degree),
    [xsTrain, ysTrain, degree],
  );

  const trainMSE = useMemo(
    () => mse(xsTrain.map((x) => evalPoly(coefs, x)), ysTrain),
    [coefs, xsTrain, ysTrain],
  );
  const testMSE = useMemo(
    () => mse(xsTest.map((x) => evalPoly(coefs, x)), ysTest),
    [coefs, xsTest, ysTest],
  );

  // Plot-koordinater
  const W = 560;
  const H = 280;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const xMin = -3.4;
  const xMax = 3.4;
  const yMin = -3.2;
  const yMax = 3.2;
  const xToPx = (x: number) =>
    padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR);
  const yToPx = (y: number) =>
    padT + (1 - (y - yMin) / (yMax - yMin)) * (H - padT - padB);

  // Modell-kurven: 200 punkter
  const path = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const x = xMin + ((xMax - xMin) * i) / 200;
      const y = evalPoly(coefs, x);
      const yClamped = Math.max(yMin - 10, Math.min(yMax + 10, y));
      pts.push(`${i === 0 ? "M" : "L"} ${xToPx(x).toFixed(1)} ${yToPx(yClamped).toFixed(1)}`);
    }
    return pts.join(" ");
  }, [coefs]);

  // "Sannheten" som referanselinje
  const truePath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const x = xMin + ((xMax - xMin) * i) / 200;
      const y = trueFn(x);
      pts.push(`${i === 0 ? "M" : "L"} ${xToPx(x).toFixed(1)} ${yToPx(y).toFixed(1)}`);
    }
    return pts.join(" ");
  }, []);

  const verdict =
    degree <= 1
      ? { label: "Underfit", color: "amber" }
      : testMSE < 0.6
        ? { label: "Bra balanse", color: "green" }
        : { label: "Overfit", color: "red" };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <label className="text-xs text-muted-foreground" htmlFor="poly-deg">
            Polynom-grad
          </label>
          <input
            id="poly-deg"
            type="range"
            min={1}
            max={15}
            step={1}
            value={degree}
            onChange={(e) => setDegree(Number(e.target.value))}
            className="flex-1 accent-brand"
          />
          <span className="font-mono text-sm w-6 text-right">{degree}</span>
        </div>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs border border-border hover:bg-muted"
          title="Nytt støy-seed"
        >
          <Shuffle className="h-3 w-3" /> Nytt datasett
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full lg:flex-1 border border-border rounded-lg bg-background"
        >
          {/* Akser */}
          <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="currentColor" strokeOpacity={0.3} />
          <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="currentColor" strokeOpacity={0.3} />
          {[-3, -2, -1, 0, 1, 2, 3].map((tx) => (
            <g key={`xt${tx}`}>
              <line
                x1={xToPx(tx)}
                y1={H - padB}
                x2={xToPx(tx)}
                y2={H - padB + 4}
                stroke="currentColor"
                strokeOpacity={0.4}
              />
              <text
                x={xToPx(tx)}
                y={H - padB + 16}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {tx}
              </text>
            </g>
          ))}
          {[-3, -1, 1, 3].map((ty) => (
            <g key={`yt${ty}`}>
              <line
                x1={padL - 4}
                y1={yToPx(ty)}
                x2={padL}
                y2={yToPx(ty)}
                stroke="currentColor"
                strokeOpacity={0.4}
              />
              <text
                x={padL - 6}
                y={yToPx(ty) + 3}
                textAnchor="end"
                className="fill-muted-foreground text-[10px]"
              >
                {ty}
              </text>
            </g>
          ))}

          {/* Sannhets-kurve (grå stiplet) */}
          <path d={truePath} fill="none" stroke="currentColor" strokeOpacity={0.35} strokeDasharray="4 4" />

          {/* Modell-kurve */}
          <path
            d={path}
            fill="none"
            stroke={
              verdict.color === "green"
                ? "rgb(34 197 94)"
                : verdict.color === "amber"
                  ? "rgb(245 158 11)"
                  : "rgb(239 68 68)"
            }
            strokeWidth={2.2}
            style={{ transition: "d 0.25s ease" }}
          />

          {/* Train-punkter */}
          {xsTrain.map((x, i) => (
            <circle
              key={`tr${i}`}
              cx={xToPx(x)}
              cy={yToPx(ysTrain[i])}
              r={4.5}
              fill="rgb(59 130 246)"
              stroke="white"
              strokeWidth={1.2}
            />
          ))}

          {/* Test-punkter (mindre, lavere opacity) */}
          {xsTest.map((x, i) => (
            <circle
              key={`te${i}`}
              cx={xToPx(x)}
              cy={yToPx(ysTest[i])}
              r={2.6}
              fill="rgb(168 85 247)"
              fillOpacity={0.55}
            />
          ))}

          {/* Legende */}
          <g transform={`translate(${padL + 8} ${padT + 4})`}>
            <circle cx={6} cy={6} r={4} fill="rgb(59 130 246)" />
            <text x={16} y={9} className="fill-foreground text-[10px]">train (12 pkt)</text>
            <circle cx={6} cy={22} r={3} fill="rgb(168 85 247)" fillOpacity={0.7} />
            <text x={16} y={25} className="fill-foreground text-[10px]">test (30 pkt)</text>
            <line x1={2} y1={38} x2={12} y2={38} stroke="currentColor" strokeOpacity={0.5} strokeDasharray="3 3" />
            <text x={16} y={41} className="fill-foreground text-[10px]">sannhet</text>
          </g>
        </svg>

        <div className="w-full lg:w-56 space-y-2">
          <div
            className={`rounded-lg p-3 border ${
              verdict.color === "green"
                ? "border-success/40 bg-success/5"
                : verdict.color === "amber"
                  ? "border-amber-500/40 bg-amber-500/5"
                  : "border-red-500/40 bg-red-500/5"
            }`}
          >
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Diagnose
            </div>
            <div
              className={`text-sm font-semibold ${
                verdict.color === "green"
                  ? "text-success"
                  : verdict.color === "amber"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-600 dark:text-red-400"
              }`}
            >
              {verdict.label}
            </div>
          </div>
          <div className="rounded-lg p-3 border border-border bg-background">
            <div className="text-xs text-muted-foreground">Train-MSE</div>
            <div className="font-mono text-sm">{trainMSE.toFixed(3)}</div>
          </div>
          <div className="rounded-lg p-3 border border-border bg-background">
            <div className="text-xs text-muted-foreground">Test-MSE</div>
            <div className="font-mono text-sm">{testMSE.toFixed(3)}</div>
          </div>
          <div className="text-[11px] text-muted-foreground leading-relaxed">
            Skru opp grad: kurven snor seg gjennom hvert train-punkt — men test-MSE
            stikker av. Skru ned grad: kurven blir en flat rett linje som ikke
            fanger formen.
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2) TRAIN / VAL / TEST SPLIT
// ============================================================================

function SplitView() {
  const [seed, setSeed] = useState(1);

  const points = useMemo(() => {
    const rng = mulberry32(seed * 1000 + 13);
    const arr: { x: number; y: number; bucket: "train" | "val" | "test" }[] = [];
    for (let i = 0; i < 100; i++) {
      const r = rng();
      const bucket = r < 0.6 ? "train" : r < 0.8 ? "val" : "test";
      arr.push({ x: rng(), y: rng(), bucket });
    }
    return arr;
  }, [seed]);

  const counts = useMemo(() => {
    const c = { train: 0, val: 0, test: 0 };
    for (const p of points) c[p.bucket]++;
    return c;
  }, [points]);

  const W = 640;
  const H = 320;
  // Tre "bøtter": x-senterposisjoner i tre kolonner.
  const bucketX: Record<"train" | "val" | "test", number> = {
    train: W * 0.2,
    val: W * 0.5,
    test: W * 0.8,
  };

  // Plasser punktene i et grovt rutemønster innenfor sin bøtte.
  const placed = useMemo(() => {
    const cols: Record<string, number> = { train: 0, val: 0, test: 0 };
    return points.map((p) => {
      const idx = cols[p.bucket]++;
      const cw = 8; // kolonner i hver bøtte
      const col = idx % cw;
      const row = Math.floor(idx / cw);
      return {
        ...p,
        px: bucketX[p.bucket] - cw * 8 + col * 17,
        py: 90 + row * 17,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  const bucketColor: Record<"train" | "val" | "test", string> = {
    train: "rgb(59 130 246)",
    val: "rgb(245 158 11)",
    test: "rgb(168 85 247)",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs border border-border hover:bg-muted"
        >
          <Shuffle className="h-3 w-3" /> Re-split (nytt tilfeldig trekk)
        </button>
        <div className="text-xs text-muted-foreground">
          Hver gang: 60 / 20 / 20 i forventning, men eksakt tall varierer pga.
          tilfeldig trekning.
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full border border-border rounded-lg bg-background"
      >
        {/* Bakgrunns-bokser per bøtte */}
        {(["train", "val", "test"] as const).map((b) => (
          <g key={b}>
            <rect
              x={bucketX[b] - 80}
              y={70}
              width={160}
              height={H - 110}
              rx={10}
              fill={bucketColor[b]}
              fillOpacity={0.06}
              stroke={bucketColor[b]}
              strokeOpacity={0.4}
            />
            <text
              x={bucketX[b]}
              y={50}
              textAnchor="middle"
              className="fill-foreground text-sm font-semibold"
            >
              {b === "train" ? "Train" : b === "val" ? "Val" : "Test"}
            </text>
            <text
              x={bucketX[b]}
              y={64}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {b === "train"
                ? "treningstime"
                : b === "val"
                  ? "generalprøve"
                  : "eksamen (rør én gang)"}
            </text>
            <text
              x={bucketX[b]}
              y={H - 22}
              textAnchor="middle"
              className="fill-foreground text-xs font-mono"
            >
              {counts[b]} punkter ({((counts[b] / 100) * 100).toFixed(0)}%)
            </text>
          </g>
        ))}

        {/* Punkter med animasjon mot sin bøtte */}
        {placed.map((p, i) => (
          <circle
            key={i}
            cx={p.px}
            cy={p.py}
            r={5}
            fill={bucketColor[p.bucket]}
            stroke="white"
            strokeWidth={1.2}
            style={{
              transition: "cx 0.55s cubic-bezier(0.4,0,0.2,1), cy 0.55s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        ))}
      </svg>

      <div className="grid sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
          <div className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
            Train (60%) — treningstime
          </div>
          Modellen ser disse og justerer vektene. Lov å se så mange ganger som du
          vil.
        </div>
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="font-semibold text-amber-600 dark:text-amber-400 mb-1">
            Val (20%) — generalprøve
          </div>
          Brukes til å velge hyperparametere (degree, k, max_depth). Modellen ser
          dem ikke, men du justerer mot dem.
        </div>
        <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-3">
          <div className="font-semibold text-purple-600 dark:text-purple-400 mb-1">
            Test (20%) — eksamen
          </div>
          Røres KUN én gang, helt på slutten. Hvis du tuner mot test-settet
          lekker du info — tallet blir for snilt.
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3) LÆRINGSKURVER
// ============================================================================

type LcurvePreset = "underfit" | "good" | "overfit";

const LCURVES: Record<
  LcurvePreset,
  { label: string; sub: string; train: number[]; val: number[] }
> = {
  underfit: {
    label: "Underfit",
    sub: "for enkel modell (lineær på krum data)",
    // Begge plateauer høyt — mer data hjelper ikke.
    train: [0.62, 0.66, 0.7, 0.72, 0.73, 0.74, 0.74, 0.74, 0.74, 0.74],
    val: [0.78, 0.8, 0.81, 0.82, 0.82, 0.82, 0.82, 0.82, 0.82, 0.82],
  },
  good: {
    label: "Bra balanse",
    sub: "passe kompleks modell",
    // Begge konvergerer lavt med lite gap.
    train: [0.05, 0.1, 0.13, 0.15, 0.17, 0.18, 0.19, 0.2, 0.2, 0.21],
    val: [0.92, 0.6, 0.42, 0.32, 0.28, 0.26, 0.25, 0.24, 0.23, 0.23],
  },
  overfit: {
    label: "Overfit",
    sub: "for kompleks (høy-grads polynom, lite data)",
    // Train holder seg lav, val mye høyere — stort gap.
    train: [0.0, 0.02, 0.04, 0.06, 0.08, 0.09, 0.1, 0.11, 0.12, 0.12],
    val: [1.2, 0.95, 0.82, 0.75, 0.7, 0.68, 0.66, 0.65, 0.64, 0.64],
  },
};

function LearningCurveView() {
  const [preset, setPreset] = useState<LcurvePreset>("good");
  const data = LCURVES[preset];

  const W = 560;
  const H = 280;
  const padL = 44;
  const padR = 16;
  const padT = 18;
  const padB = 36;
  const xMin = 10;
  const xMax = 100;
  const yMin = 0;
  const yMax = 1.3;
  const sizes = Array.from({ length: 10 }, (_, i) => 10 + i * 10);
  const xToPx = (x: number) =>
    padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR);
  const yToPx = (y: number) =>
    padT + (1 - (y - yMin) / (yMax - yMin)) * (H - padT - padB);

  const pathFor = (vals: number[]) =>
    vals
      .map(
        (v, i) =>
          `${i === 0 ? "M" : "L"} ${xToPx(sizes[i]).toFixed(1)} ${yToPx(v).toFixed(1)}`,
      )
      .join(" ");

  const lastTrain = data.train[data.train.length - 1];
  const lastVal = data.val[data.val.length - 1];
  const gap = lastVal - lastTrain;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(LCURVES) as LcurvePreset[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPreset(p)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              preset === p
                ? "bg-brand text-brand-foreground border-brand"
                : "border-border hover:bg-muted"
            }`}
          >
            {LCURVES[p].label}
          </button>
        ))}
        <div className="ml-auto text-xs text-muted-foreground self-center">
          {data.sub}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full lg:flex-1 border border-border rounded-lg bg-background"
        >
          {/* Akser */}
          <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="currentColor" strokeOpacity={0.3} />
          <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="currentColor" strokeOpacity={0.3} />
          {sizes.map((s) => (
            <g key={`xs${s}`}>
              <line
                x1={xToPx(s)}
                y1={H - padB}
                x2={xToPx(s)}
                y2={H - padB + 3}
                stroke="currentColor"
                strokeOpacity={0.3}
              />
              {s % 20 === 0 && (
                <text
                  x={xToPx(s)}
                  y={H - padB + 14}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {s}
                </text>
              )}
            </g>
          ))}
          {[0, 0.3, 0.6, 0.9, 1.2].map((y) => (
            <g key={`yc${y}`}>
              <line
                x1={padL - 3}
                y1={yToPx(y)}
                x2={padL}
                y2={yToPx(y)}
                stroke="currentColor"
                strokeOpacity={0.3}
              />
              <text
                x={padL - 5}
                y={yToPx(y) + 3}
                textAnchor="end"
                className="fill-muted-foreground text-[10px]"
              >
                {y.toFixed(1)}
              </text>
            </g>
          ))}
          <text
            x={W / 2}
            y={H - 6}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px]"
          >
            Treningsstørrelse
          </text>
          <text
            x={12}
            y={H / 2}
            textAnchor="middle"
            transform={`rotate(-90 12 ${H / 2})`}
            className="fill-muted-foreground text-[11px]"
          >
            Loss
          </text>

          {/* Kurver */}
          <path
            d={pathFor(data.train)}
            fill="none"
            stroke="rgb(59 130 246)"
            strokeWidth={2.2}
            style={{ transition: "d 0.4s ease" }}
          />
          <path
            d={pathFor(data.val)}
            fill="none"
            stroke="rgb(245 158 11)"
            strokeWidth={2.2}
            style={{ transition: "d 0.4s ease" }}
          />

          {/* Punkter */}
          {data.train.map((v, i) => (
            <circle
              key={`pt-tr${i}`}
              cx={xToPx(sizes[i])}
              cy={yToPx(v)}
              r={3}
              fill="rgb(59 130 246)"
            />
          ))}
          {data.val.map((v, i) => (
            <circle
              key={`pt-va${i}`}
              cx={xToPx(sizes[i])}
              cy={yToPx(v)}
              r={3}
              fill="rgb(245 158 11)"
            />
          ))}

          {/* Legende */}
          <g transform={`translate(${W - padR - 110} ${padT + 4})`}>
            <rect width={104} height={42} fill="hsl(var(--card))" fillOpacity={0.85} stroke="currentColor" strokeOpacity={0.15} rx={4} />
            <line x1={6} y1={14} x2={20} y2={14} stroke="rgb(59 130 246)" strokeWidth={2.2} />
            <text x={26} y={17} className="fill-foreground text-[10px]">train-loss</text>
            <line x1={6} y1={30} x2={20} y2={30} stroke="rgb(245 158 11)" strokeWidth={2.2} />
            <text x={26} y={33} className="fill-foreground text-[10px]">val-loss</text>
          </g>
        </svg>

        <div className="w-full lg:w-60 space-y-2 text-xs">
          <div className="rounded-lg p-3 border border-border bg-background">
            <div className="text-muted-foreground">Endelig train-loss</div>
            <div className="font-mono text-sm">{lastTrain.toFixed(2)}</div>
          </div>
          <div className="rounded-lg p-3 border border-border bg-background">
            <div className="text-muted-foreground">Endelig val-loss</div>
            <div className="font-mono text-sm">{lastVal.toFixed(2)}</div>
          </div>
          <div className="rounded-lg p-3 border border-border bg-background">
            <div className="text-muted-foreground">Gap (val − train)</div>
            <div className="font-mono text-sm">{gap.toFixed(2)}</div>
          </div>
          <div className="text-[11px] text-muted-foreground leading-relaxed pt-2">
            <strong>Lesemåten:</strong> Train- og val-kurven konvergerer mot hverandre
            etter hvert som du har mer data. Avstanden helt til høyre forteller
            om modellen overfitter (stort gap) eller underfitter (begge høye).
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4) k-NN MED DECISION REGIONS
// ============================================================================

type KnnPoint = { x: number; y: number; cls: 0 | 1 };

const KNN_DATA: KnnPoint[] = (() => {
  const rng = mulberry32(42);
  const pts: KnnPoint[] = [];
  // Klasse 0 (rundt (-1, -0.5))
  for (let i = 0; i < 18; i++) {
    pts.push({ x: -1 + randn(rng) * 0.7, y: -0.5 + randn(rng) * 0.7, cls: 0 });
  }
  // Klasse 1 (rundt (1, 0.5))
  for (let i = 0; i < 18; i++) {
    pts.push({ x: 1 + randn(rng) * 0.7, y: 0.5 + randn(rng) * 0.7, cls: 1 });
  }
  // Noen outliers for å gjøre k=1 hakkete
  pts.push({ x: 0.6, y: -0.8, cls: 0 });
  pts.push({ x: -0.4, y: 0.7, cls: 1 });
  pts.push({ x: 1.6, y: -1.2, cls: 0 });
  return pts;
})();

function KnnView() {
  const [k, setK] = useState(5);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);

  const W = 560;
  const H = 380;
  const xMin = -3;
  const xMax = 3;
  const yMin = -2.2;
  const yMax = 2.2;
  const xToPx = (x: number) => ((x - xMin) / (xMax - xMin)) * W;
  const yToPx = (y: number) => (1 - (y - yMin) / (yMax - yMin)) * H;
  const pxToX = (px: number) => xMin + (px / W) * (xMax - xMin);
  const pxToY = (py: number) => yMin + (1 - py / H) * (yMax - yMin);

  // Grid for decision regions
  const gridCols = 40;
  const gridRows = 28;
  const cellW = W / gridCols;
  const cellH = H / gridRows;

  const grid = useMemo(() => {
    const out: { col: number; row: number; cls: 0 | 1 }[] = [];
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const cx = pxToX((c + 0.5) * cellW);
        const cy = pxToY((r + 0.5) * cellH);
        out.push({ col: c, row: r, cls: knnPredict(cx, cy, KNN_DATA, k) });
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k]);

  const hoverNeighbors = useMemo(() => {
    if (!hover) return null;
    return knnNeighbors(hover.x, hover.y, KNN_DATA, k);
  }, [hover, k]);

  const hoverPred = hoverNeighbors
    ? hoverNeighbors.reduce((acc, n) => acc + n.cls, 0) > k / 2
      ? 1
      : 0
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <label className="text-xs text-muted-foreground" htmlFor="knn-k">
            k (antall naboer)
          </label>
          <input
            id="knn-k"
            type="range"
            min={1}
            max={25}
            step={2}
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            className="flex-1 accent-brand"
          />
          <span className="font-mono text-sm w-6 text-right">{k}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {k <= 3 ? "Liten k → overfit (hakkete)" : k >= 15 ? "Stor k → underfit (glatt men feil)" : "Moderat k — balansert"}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full border border-border rounded-lg bg-background cursor-crosshair"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * W;
          const py = ((e.clientY - rect.top) / rect.height) * H;
          setHover({ x: pxToX(px), y: pxToY(py) });
        }}
        onMouseLeave={() => setHover(null)}
      >
        {/* Decision-region-celler */}
        {grid.map((g, i) => (
          <rect
            key={i}
            x={g.col * cellW}
            y={g.row * cellH}
            width={cellW + 0.5}
            height={cellH + 0.5}
            fill={g.cls === 0 ? "rgb(59 130 246)" : "rgb(239 68 68)"}
            fillOpacity={0.12}
          />
        ))}

        {/* Akser */}
        <line x1={xToPx(0)} y1={0} x2={xToPx(0)} y2={H} stroke="currentColor" strokeOpacity={0.15} />
        <line x1={0} y1={yToPx(0)} x2={W} y2={yToPx(0)} stroke="currentColor" strokeOpacity={0.15} />

        {/* Naboer fra hover */}
        {hover && hoverNeighbors && hoverNeighbors.map((n, i) => (
          <line
            key={`nl${i}`}
            x1={xToPx(hover.x)}
            y1={yToPx(hover.y)}
            x2={xToPx(n.x)}
            y2={yToPx(n.y)}
            stroke="currentColor"
            strokeOpacity={0.45}
            strokeWidth={1.2}
            strokeDasharray="3 3"
          />
        ))}
        {hover && hoverNeighbors && hoverNeighbors.map((n, i) => (
          <circle
            key={`nh${i}`}
            cx={xToPx(n.x)}
            cy={yToPx(n.y)}
            r={9}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.7}
            strokeWidth={1.5}
          />
        ))}

        {/* Datapunkter */}
        {KNN_DATA.map((p, i) => (
          <circle
            key={i}
            cx={xToPx(p.x)}
            cy={yToPx(p.y)}
            r={5.5}
            fill={p.cls === 0 ? "rgb(37 99 235)" : "rgb(220 38 38)"}
            stroke="white"
            strokeWidth={1.3}
          />
        ))}

        {/* Hover-punkt */}
        {hover && (
          <>
            <circle
              cx={xToPx(hover.x)}
              cy={yToPx(hover.y)}
              r={8}
              fill={hoverPred === 0 ? "rgb(37 99 235)" : "rgb(220 38 38)"}
              fillOpacity={0.55}
              stroke="white"
              strokeWidth={2}
            />
            <rect
              x={xToPx(hover.x) + 12}
              y={yToPx(hover.y) - 28}
              width={104}
              height={22}
              rx={4}
              fill="hsl(var(--card))"
              stroke="currentColor"
              strokeOpacity={0.3}
            />
            <text
              x={xToPx(hover.x) + 18}
              y={yToPx(hover.y) - 13}
              className="fill-foreground text-[11px]"
            >
              {`predikert: klasse ${hoverPred}`}
            </text>
          </>
        )}

        {/* Legende */}
        <g transform={`translate(12 12)`}>
          <rect width={150} height={42} fill="hsl(var(--card))" fillOpacity={0.85} stroke="currentColor" strokeOpacity={0.15} rx={4} />
          <circle cx={12} cy={14} r={5} fill="rgb(37 99 235)" />
          <text x={24} y={17} className="fill-foreground text-[10px]">klasse 0 (blå)</text>
          <circle cx={12} cy={30} r={5} fill="rgb(220 38 38)" />
          <text x={24} y={33} className="fill-foreground text-[10px]">klasse 1 (rød)</text>
        </g>
      </svg>

      <div className="text-xs text-muted-foreground">
        Beveg musepekeren over plottet for å se de {k} nærmeste naboene og hvilken klasse de stemmer for. Bakgrunnsfargen viser modellens prediksjon i hver rute.
      </div>
    </div>
  );
}

function knnNeighbors(qx: number, qy: number, data: KnnPoint[], k: number) {
  const withDist = data.map((p) => ({
    ...p,
    d: (p.x - qx) * (p.x - qx) + (p.y - qy) * (p.y - qy),
  }));
  withDist.sort((a, b) => a.d - b.d);
  return withDist.slice(0, Math.min(k, withDist.length));
}

function knnPredict(qx: number, qy: number, data: KnnPoint[], k: number): 0 | 1 {
  const nbrs = knnNeighbors(qx, qy, data, k);
  let s = 0;
  for (const n of nbrs) s += n.cls;
  return s > k / 2 ? 1 : 0;
}

// ============================================================================
// 5) KONFUSJONSMATRISE + METRIKKER
// ============================================================================

type MetricPoint = { x: number; y: number; trueCls: 0 | 1; score: number };

const METRIC_DATA: MetricPoint[] = (() => {
  const rng = mulberry32(99);
  const arr: MetricPoint[] = [];
  // Klasse 1 (positiv): høyere score-fordeling
  for (let i = 0; i < 25; i++) {
    const s = 0.65 + randn(rng) * 0.18;
    arr.push({
      x: 0.8 + randn(rng) * 0.5,
      y: 0.6 + randn(rng) * 0.4,
      trueCls: 1,
      score: Math.max(0, Math.min(1, s)),
    });
  }
  // Klasse 0 (negativ): lavere score-fordeling
  for (let i = 0; i < 25; i++) {
    const s = 0.35 + randn(rng) * 0.18;
    arr.push({
      x: -0.8 + randn(rng) * 0.5,
      y: -0.6 + randn(rng) * 0.4,
      trueCls: 0,
      score: Math.max(0, Math.min(1, s)),
    });
  }
  return arr;
})();

function MetricsView() {
  const [threshold, setThreshold] = useState(0.5);

  const { tp, fp, tn, fn } = useMemo(() => {
    let tp = 0,
      fp = 0,
      tn = 0,
      fn = 0;
    for (const p of METRIC_DATA) {
      const pred = p.score >= threshold ? 1 : 0;
      if (p.trueCls === 1 && pred === 1) tp++;
      else if (p.trueCls === 0 && pred === 1) fp++;
      else if (p.trueCls === 0 && pred === 0) tn++;
      else fn++;
    }
    return { tp, fp, tn, fn };
  }, [threshold]);

  const accuracy = (tp + tn) / (tp + fp + tn + fn);
  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 =
    precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

  const W = 480;
  const H = 320;
  const xMin = -2.2;
  const xMax = 2.2;
  const yMin = -2;
  const yMax = 2;
  const xToPx = (x: number) => ((x - xMin) / (xMax - xMin)) * W;
  const yToPx = (y: number) => (1 - (y - yMin) / (yMax - yMin)) * H;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <label className="text-xs text-muted-foreground" htmlFor="thr">
            Beslutningsterskel
          </label>
          <input
            id="thr"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="flex-1 accent-brand"
          />
          <span className="font-mono text-sm w-12 text-right">{threshold.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full lg:flex-1 border border-border rounded-lg bg-background"
        >
          <line x1={xToPx(0)} y1={0} x2={xToPx(0)} y2={H} stroke="currentColor" strokeOpacity={0.15} />
          <line x1={0} y1={yToPx(0)} x2={W} y2={yToPx(0)} stroke="currentColor" strokeOpacity={0.15} />

          {METRIC_DATA.map((p, i) => {
            const pred = p.score >= threshold ? 1 : 0;
            const correct = pred === p.trueCls;
            const trueColor = p.trueCls === 1 ? "rgb(220 38 38)" : "rgb(37 99 235)";
            return (
              <g key={i}>
                <circle
                  cx={xToPx(p.x)}
                  cy={yToPx(p.y)}
                  r={6.5}
                  fill={trueColor}
                  fillOpacity={correct ? 0.85 : 0.35}
                  stroke={correct ? "white" : "rgb(245 158 11)"}
                  strokeWidth={correct ? 1.2 : 2}
                />
                {/* Skala-prikk for prediksjons-score over punktet */}
                <circle
                  cx={xToPx(p.x)}
                  cy={yToPx(p.y) - 9}
                  r={2.2}
                  fill={pred === 1 ? "rgb(220 38 38)" : "rgb(37 99 235)"}
                />
              </g>
            );
          })}

          <g transform={`translate(12 12)`}>
            <rect width={180} height={58} fill="hsl(var(--card))" fillOpacity={0.85} stroke="currentColor" strokeOpacity={0.15} rx={4} />
            <text x={8} y={14} className="fill-foreground text-[10px] font-semibold">
              Sirkel = sann klasse
            </text>
            <text x={8} y={28} className="fill-muted-foreground text-[10px]">
              prikk over = prediksjon
            </text>
            <text x={8} y={42} className="fill-muted-foreground text-[10px]">
              gul ring = feil
            </text>
            <text x={8} y={54} className="fill-muted-foreground text-[10px]">
              blå = klasse 0, rød = klasse 1
            </text>
          </g>
        </svg>

        <div className="w-full lg:w-80 space-y-3">
          {/* Konfusjonsmatrise */}
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Konfusjonsmatrise
            </div>
            <div className="grid grid-cols-[auto_1fr_1fr] gap-1 text-xs">
              <div></div>
              <div className="text-center text-muted-foreground pb-1">
                Pred 0
              </div>
              <div className="text-center text-muted-foreground pb-1">
                Pred 1
              </div>
              <div className="self-center text-muted-foreground pr-1 text-right">
                Sann 0
              </div>
              <div className="rounded bg-success/15 border border-success/30 px-2 py-2 text-center font-mono">
                TN: {tn}
              </div>
              <div className="rounded bg-red-500/15 border border-red-500/30 px-2 py-2 text-center font-mono">
                FP: {fp}
              </div>
              <div className="self-center text-muted-foreground pr-1 text-right">
                Sann 1
              </div>
              <div className="rounded bg-red-500/15 border border-red-500/30 px-2 py-2 text-center font-mono">
                FN: {fn}
              </div>
              <div className="rounded bg-success/15 border border-success/30 px-2 py-2 text-center font-mono">
                TP: {tp}
              </div>
            </div>
          </div>

          {/* Metrikker */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <MetricBox label="Accuracy" value={accuracy} formula="(TP+TN) / alt" />
            <MetricBox label="Precision" value={precision} formula="TP / (TP+FP)" />
            <MetricBox label="Recall" value={recall} formula="TP / (TP+FN)" />
            <MetricBox label="F1" value={f1} formula="harmonisk snitt" />
          </div>

          <div className="text-[11px] text-muted-foreground leading-relaxed">
            <strong>Tommelfingerregel:</strong> Ubalansert klasse? Ikke stol på
            accuracy — bruk precision/recall/F1. Liv på spill (kreft-screening)?
            Maks recall. Spam-filter? Maks precision.
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBox({
  label,
  value,
  formula,
}: {
  label: string;
  value: number;
  formula: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-2">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-mono text-base">{value.toFixed(3)}</div>
      <div className="text-[10px] text-muted-foreground">{formula}</div>
    </div>
  );
}
