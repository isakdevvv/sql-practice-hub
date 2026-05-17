import { useMemo, useState } from "react";

type Method = "lda" | "qda" | "nb";
type Pt = { x: number; y: number; k: number };

const COLORS = ["#3b82f6", "#f59e0b", "#10b981"];
const FILLS = ["#3b82f622", "#f59e0b22", "#10b98122"];

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
function boxMuller(r: () => number): [number, number] {
  const u1 = Math.max(r(), 1e-9);
  const u2 = r();
  const m = Math.sqrt(-2 * Math.log(u1));
  return [m * Math.cos(2 * Math.PI * u2), m * Math.sin(2 * Math.PI * u2)];
}
function sampleClass(
  n: number,
  mu: [number, number],
  sx: number,
  sy: number,
  rho: number,
  k: number,
  r: () => number,
): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const [z1, z2] = boxMuller(r);
    const x = mu[0] + sx * z1;
    const y = mu[1] + sy * (rho * z1 + Math.sqrt(1 - rho * rho) * z2);
    pts.push({ x, y, k });
  }
  return pts;
}

type Spec = { mu: [number, number]; sx: number; sy: number; rho: number };

type Preset = {
  id: string;
  name: string;
  blurb: string;
  winner: Method | "tie";
  specs: Spec[];
};

const PRESETS: Preset[] = [
  {
    id: "lda-wins",
    name: "Lik covariance + lineær separasjon",
    blurb:
      "Begge klasser har identisk spredning og samme orientering. LDA gjør riktig antakelse og vinner på varians.",
    winner: "lda",
    specs: [
      { mu: [-1.8, -0.5], sx: 1.0, sy: 0.6, rho: 0.4 },
      { mu: [1.8, 0.5], sx: 1.0, sy: 0.6, rho: 0.4 },
    ],
  },
  {
    id: "qda-wins",
    name: "Ulik covariance per klasse",
    blurb:
      "Klasse 0 er en flat ellipse, klasse 1 er en stående ellipse. Boundary må bøye seg — kun QDA klarer det.",
    winner: "qda",
    specs: [
      { mu: [-0.5, 0], sx: 1.8, sy: 0.5, rho: 0 },
      { mu: [0.8, 0], sx: 0.5, sy: 1.8, rho: 0 },
    ],
  },
  {
    id: "nb-survives",
    name: "Korrelerte features (naive antakelse bryter)",
    blurb:
      "Klasse-features er kraftig korrelert. NB ignorerer korrelasjonen — typisk underyter litt, men varianse-fordelen redder den ofte i høy-dim.",
    winner: "lda",
    specs: [
      { mu: [-1.4, -1.4], sx: 1.2, sy: 1.2, rho: 0.85 },
      { mu: [1.4, 1.4], sx: 1.2, sy: 1.2, rho: 0.85 },
    ],
  },
  {
    id: "all-three",
    name: "Uavhengige features, ulik skala",
    blurb:
      "Ingen korrelasjon innen klassene, klar separasjon — alle tre modellene gjør det godt. Velg den med færrest parametre.",
    winner: "tie",
    specs: [
      { mu: [-1.6, 0], sx: 0.8, sy: 1.5, rho: 0 },
      { mu: [1.6, 0], sx: 0.8, sy: 1.5, rho: 0 },
    ],
  },
];

const N_PER_CLASS = 80;

function meanOf(pts: Pt[]): [number, number] {
  let sx = 0;
  let sy = 0;
  for (const p of pts) {
    sx += p.x;
    sy += p.y;
  }
  return [sx / pts.length, sy / pts.length];
}
function sampleCov(
  pts: Pt[],
  mu: [number, number],
): [number, number, number] {
  let a = 0;
  let b = 0;
  let c = 0;
  for (const p of pts) {
    const dx = p.x - mu[0];
    const dy = p.y - mu[1];
    a += dx * dx;
    b += dx * dy;
    c += dy * dy;
  }
  const n = Math.max(1, pts.length - 1);
  return [a / n + 1e-3, b / n, c / n + 1e-3];
}
function logPdf(
  x: number,
  y: number,
  mu: [number, number],
  cov: [number, number, number],
): number {
  const [a, b, c] = cov;
  const det = a * c - b * b;
  if (det <= 1e-9) return -Infinity;
  const dx = x - mu[0];
  const dy = y - mu[1];
  const inv0 = c / det;
  const inv1 = -b / det;
  const inv3 = a / det;
  const m = dx * (inv0 * dx + inv1 * dy) + dy * (inv1 * dx + inv3 * dy);
  return -0.5 * (2 * Math.log(2 * Math.PI) + Math.log(det) + m);
}

function classify(
  px: number,
  py: number,
  method: Method,
  perClass: Pt[][],
): number {
  const k = perClass.length;
  const mus = perClass.map(meanOf);
  const covs = perClass.map((c, i) => sampleCov(c, mus[i]));
  let pooled: [number, number, number] = [0, 0, 0];
  for (const cv of covs) {
    pooled[0] += cv[0];
    pooled[1] += cv[1];
    pooled[2] += cv[2];
  }
  pooled = [pooled[0] / k, pooled[1] / k, pooled[2] / k];
  let best = 0;
  let bestL = -Infinity;
  const totalN = perClass.reduce((s, c) => s + c.length, 0);
  for (let i = 0; i < k; i++) {
    const prior = Math.log(perClass[i].length / Math.max(totalN, 1));
    let cov: [number, number, number];
    if (method === "lda") cov = pooled;
    else if (method === "qda") cov = covs[i];
    else cov = [covs[i][0], 0, covs[i][2]];
    const l = logPdf(px, py, mus[i], cov) + prior;
    if (l > bestL) {
      bestL = l;
      best = i;
    }
  }
  return best;
}

const W = 200;
const H = 180;
const CELL = 5;
const X_MIN = -5;
const X_MAX = 5;
const Y_MIN = -4;
const Y_MAX = 4;
const sx = (v: number) => ((v - X_MIN) / (X_MAX - X_MIN)) * W;
const sy = (v: number) => H - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * H;

function trainTestSplit(pts: Pt[], r: () => number): [Pt[], Pt[]] {
  const train: Pt[] = [];
  const test: Pt[] = [];
  for (const p of pts) {
    (r() < 0.7 ? train : test).push(p);
  }
  return [train, test];
}

function MethodPanel({
  method,
  trainPerClass,
  testPts,
  isWinner,
}: {
  method: Method;
  trainPerClass: Pt[][];
  testPts: Pt[];
  isWinner: boolean;
}) {
  const grid = useMemo(() => {
    const cols = Math.floor(W / CELL);
    const rows = Math.floor(H / CELL);
    const g: number[][] = [];
    for (let j = 0; j < rows; j++) {
      const row: number[] = [];
      const py = Y_MIN + ((rows - 1 - j) / (rows - 1)) * (Y_MAX - Y_MIN);
      for (let i = 0; i < cols; i++) {
        const px = X_MIN + (i / (cols - 1)) * (X_MAX - X_MIN);
        row.push(classify(px, py, method, trainPerClass));
      }
      g.push(row);
    }
    return { g, cols, rows };
  }, [trainPerClass, method]);

  const trainAll = trainPerClass.flat();
  let trOk = 0;
  for (const p of trainAll) {
    if (classify(p.x, p.y, method, trainPerClass) === p.k) trOk++;
  }
  let teOk = 0;
  for (const p of testPts) {
    if (classify(p.x, p.y, method, trainPerClass) === p.k) teOk++;
  }
  const trainAcc = trainAll.length ? trOk / trainAll.length : 0;
  const testAcc = testPts.length ? teOk / testPts.length : 0;

  return (
    <div
      className={`rounded-xl border p-3 bg-card flex flex-col ${
        isWinner ? "border-brand ring-1 ring-brand/40" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-mono font-semibold">
          {method.toUpperCase()}
        </div>
        {isWinner && (
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand/15 text-brand font-semibold">
            Best fit
          </span>
        )}
      </div>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="block rounded-md bg-background border border-border w-full"
      >
        {grid.g.flatMap((row, j) =>
          row.map((k, i) => (
            <rect
              key={`g-${i}-${j}`}
              x={i * CELL}
              y={j * CELL}
              width={CELL}
              height={CELL}
              fill={FILLS[k]}
            />
          )),
        )}
        {trainAll.map((p, i) => (
          <circle
            key={`tr-${i}`}
            cx={sx(p.x)}
            cy={sy(p.y)}
            r={1.8}
            fill={COLORS[p.k]}
            opacity={0.85}
          />
        ))}
      </svg>
      <div className="grid grid-cols-2 gap-1 mt-2 text-[10px]">
        <div className="rounded bg-background border border-border p-1.5">
          <div className="text-muted-foreground">Train acc</div>
          <div className="font-bold tabular-nums">{(trainAcc * 100).toFixed(1)}%</div>
        </div>
        <div className="rounded bg-background border border-border p-1.5">
          <div className="text-muted-foreground">Test acc</div>
          <div className="font-bold tabular-nums">{(testAcc * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
}

export function AssumptionExperiment() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [seed, setSeed] = useState(7);
  const preset = PRESETS[presetIdx];

  const { trainPerClass, testPts } = useMemo(() => {
    const r = rng(seed);
    const trainPerClass: Pt[][] = [];
    const testAll: Pt[] = [];
    for (let k = 0; k < preset.specs.length; k++) {
      const spec = preset.specs[k];
      const all = sampleClass(
        N_PER_CLASS,
        spec.mu,
        spec.sx,
        spec.sy,
        spec.rho,
        k,
        r,
      );
      const [tr, te] = trainTestSplit(all, r);
      trainPerClass.push(tr);
      testAll.push(...te);
    }
    return { trainPerClass, testPts: testAll };
  }, [presetIdx, seed]);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap gap-2 mb-3">
        {PRESETS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setPresetIdx(i)}
            className={`px-3 py-1.5 rounded-md text-xs border transition-colors text-left ${
              presetIdx === i
                ? "border-brand bg-brand/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:border-brand/40"
            }`}
          >
            <div className="font-semibold">{p.name}</div>
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-background p-3 mb-3 text-xs">
        <div className="text-foreground font-medium mb-1">{preset.name}</div>
        <div className="text-muted-foreground">{preset.blurb}</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(["lda", "qda", "nb"] as Method[]).map((m) => (
          <MethodPanel
            key={m}
            method={m}
            trainPerClass={trainPerClass}
            testPts={testPts}
            isWinner={preset.winner === m}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="text-xs px-3 py-1 rounded-md border border-border bg-background hover:bg-muted/50"
        >
          Ny random split (seed {seed})
        </button>
        <div className="text-[11px] text-muted-foreground ml-auto">
          70/30 train/test, {N_PER_CLASS} punkter per klasse
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Test-accuracy er den ærlige målestokken. Vinneren er rammet i brand-farge —
        bytt mellom presets og se hvordan vinneren skifter. På siste preset gjør
        alle tre det godt og du bør velge den enkleste modellen (LDA), siden den
        har færrest parametre og dermed lavest varians på nye data.
      </p>
    </div>
  );
}
