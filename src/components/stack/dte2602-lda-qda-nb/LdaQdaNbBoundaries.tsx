import { useMemo, useState } from "react";

type Method = "lda" | "qda" | "nb";

type Pt = { x: number; y: number; k: number };

const SEED = 42;
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
function boxMuller(r: () => number): [number, number] {
  const u1 = Math.max(r(), 1e-9);
  const u2 = r();
  const mag = Math.sqrt(-2 * Math.log(u1));
  return [mag * Math.cos(2 * Math.PI * u2), mag * Math.sin(2 * Math.PI * u2)];
}

/** Sample n points from N(mu, diag(sigma_x^2, sigma_y^2)) with correlation rho. */
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

const N_PER_CLASS = 60;
const DEFAULTS = {
  m0: [-1.5, -1] as [number, number],
  m1: [1.5, 0.8] as [number, number],
  m2: [0, 2.2] as [number, number],
  s0: { sx: 0.9, sy: 0.9, rho: 0.0 },
  s1: { sx: 1.1, sy: 0.6, rho: 0.5 },
  s2: { sx: 0.6, sy: 1.0, rho: -0.4 },
};

/** Multivariate normal log-pdf with covariance [[a,b],[b,c]]. */
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
  return -0.5 * (Math.log(2 * Math.PI) * 2 + Math.log(det) + m);
}

function covFrom(sx: number, sy: number, rho: number): [number, number, number] {
  return [sx * sx, rho * sx * sy, sy * sy];
}

function meanOf(pts: Pt[]): [number, number] {
  let sx = 0,
    sy = 0;
  for (const p of pts) {
    sx += p.x;
    sy += p.y;
  }
  return [sx / pts.length, sy / pts.length];
}

function sampleCov(pts: Pt[], mu: [number, number]): [number, number, number] {
  let a = 0,
    b = 0,
    c = 0;
  for (const p of pts) {
    const dx = p.x - mu[0];
    const dy = p.y - mu[1];
    a += dx * dx;
    b += dx * dy;
    c += dy * dy;
  }
  const n = Math.max(1, pts.length - 1);
  return [a / n, b / n, c / n];
}

export function LdaQdaNbBoundaries() {
  const [method, setMethod] = useState<Method>("lda");
  const [tightness, setTightness] = useState(1.0); // moves classes closer/farther
  const [showGrid, setShowGrid] = useState(true);

  const { data, accuracy } = useMemo(() => {
    const r = rng(SEED);
    const t = tightness;
    const m0: [number, number] = [DEFAULTS.m0[0] * t, DEFAULTS.m0[1] * t];
    const m1: [number, number] = [DEFAULTS.m1[0] * t, DEFAULTS.m1[1] * t];
    const m2: [number, number] = [DEFAULTS.m2[0] * t, DEFAULTS.m2[1] * t];
    const c0 = sampleClass(N_PER_CLASS, m0, DEFAULTS.s0.sx, DEFAULTS.s0.sy, DEFAULTS.s0.rho, 0, r);
    const c1 = sampleClass(N_PER_CLASS, m1, DEFAULTS.s1.sx, DEFAULTS.s1.sy, DEFAULTS.s1.rho, 1, r);
    const c2 = sampleClass(N_PER_CLASS, m2, DEFAULTS.s2.sx, DEFAULTS.s2.sy, DEFAULTS.s2.rho, 2, r);
    const all = [...c0, ...c1, ...c2];

    // Estimate parameters per method
    const mu0 = meanOf(c0);
    const mu1 = meanOf(c1);
    const mu2 = meanOf(c2);
    const cov0 = sampleCov(c0, mu0);
    const cov1 = sampleCov(c1, mu1);
    const cov2 = sampleCov(c2, mu2);

    // Pooled cov for LDA
    const pooled: [number, number, number] = [
      (cov0[0] + cov1[0] + cov2[0]) / 3,
      (cov0[1] + cov1[1] + cov2[1]) / 3,
      (cov0[2] + cov1[2] + cov2[2]) / 3,
    ];

    // NB: diag-cov per class (no correlation)
    const nb0: [number, number, number] = [cov0[0], 0, cov0[2]];
    const nb1: [number, number, number] = [cov1[0], 0, cov1[2]];
    const nb2: [number, number, number] = [cov2[0], 0, cov2[2]];

    const prior = Math.log(1 / 3);
    function classify(px: number, py: number): number {
      let l0: number, l1: number, l2: number;
      if (method === "lda") {
        l0 = logPdf(px, py, mu0, pooled) + prior;
        l1 = logPdf(px, py, mu1, pooled) + prior;
        l2 = logPdf(px, py, mu2, pooled) + prior;
      } else if (method === "qda") {
        l0 = logPdf(px, py, mu0, cov0) + prior;
        l1 = logPdf(px, py, mu1, cov1) + prior;
        l2 = logPdf(px, py, mu2, cov2) + prior;
      } else {
        l0 = logPdf(px, py, mu0, nb0) + prior;
        l1 = logPdf(px, py, mu1, nb1) + prior;
        l2 = logPdf(px, py, mu2, nb2) + prior;
      }
      if (l0 >= l1 && l0 >= l2) return 0;
      if (l1 >= l0 && l1 >= l2) return 1;
      return 2;
    }

    // Accuracy on training data
    let correct = 0;
    for (const p of all) if (classify(p.x, p.y) === p.k) correct++;
    const acc = correct / all.length;

    // Build grid of class predictions
    const W = 360;
    const H = 280;
    const cell = 6;
    const cols = Math.floor(W / cell);
    const rows = Math.floor(H / cell);
    const xMin = -5,
      xMax = 5;
    const yMin = -4,
      yMax = 5;

    const grid: number[][] = [];
    for (let j = 0; j < rows; j++) {
      const row: number[] = [];
      const py = yMin + (j / (rows - 1)) * (yMax - yMin);
      for (let i = 0; i < cols; i++) {
        const px = xMin + (i / (cols - 1)) * (xMax - xMin);
        row.push(classify(px, py));
      }
      grid.push(row);
    }

    return {
      data: { all, grid, cell, cols, rows, W, H, xMin, xMax, yMin, yMax },
      accuracy: acc,
    };
  }, [method, tightness]);

  const COLORS = ["#3b82f6", "#f59e0b", "#10b981"];
  const FILLS = ["#3b82f622", "#f59e0b22", "#10b98122"];

  const sx = (v: number) =>
    ((v - data.xMin) / (data.xMax - data.xMin)) * data.W;
  const sy = (v: number) =>
    data.H - ((v - data.yMin) / (data.yMax - data.yMin)) * data.H;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="text-xs text-muted-foreground mr-2">Modell:</div>
        {(["lda", "qda", "nb"] as Method[]).map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={`px-3 py-1 rounded-md text-xs font-mono border transition-colors ${
              method === m
                ? "border-brand bg-brand/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:border-brand/40"
            }`}
          >
            {m.toUpperCase()}
          </button>
        ))}
        <label className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
          />
          Vis decision regions
        </label>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <label className="text-xs text-muted-foreground whitespace-nowrap">
          Klasse-separasjon: {tightness.toFixed(2)}
        </label>
        <input
          type="range"
          min={0.3}
          max={1.6}
          step={0.05}
          value={tightness}
          onChange={(e) => setTightness(parseFloat(e.target.value))}
          className="flex-1"
        />
      </div>
      <div className="flex justify-center">
        <svg
          width={data.W}
          height={data.H}
          className="block rounded-lg bg-background border border-border"
        >
          {showGrid &&
            data.grid.flatMap((row, j) =>
              row.map((k, i) => (
                <rect
                  key={`g-${i}-${j}`}
                  x={i * data.cell}
                  y={j * data.cell}
                  width={data.cell}
                  height={data.cell}
                  fill={FILLS[k]}
                />
              )),
            )}
          {data.all.map((p, i) => (
            <circle
              key={`p-${i}`}
              cx={sx(p.x)}
              cy={sy(p.y)}
              r={3}
              fill={COLORS[p.k]}
              opacity={0.85}
            />
          ))}
        </svg>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
        <div className="rounded-lg border border-border bg-background p-2">
          <div className="text-muted-foreground">Trenings-accuracy</div>
          <div className="text-lg font-bold">{(accuracy * 100).toFixed(1)}%</div>
        </div>
        <div className="rounded-lg border border-border bg-background p-2">
          <div className="text-muted-foreground">Antakelse</div>
          <div className="font-mono text-[11px] leading-snug mt-1">
            {method === "lda" && "Gauss, lik Σ"}
            {method === "qda" && "Gauss, ulik Σ"}
            {method === "nb" && "Gauss, diag Σ"}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-2">
          <div className="text-muted-foreground">Grense</div>
          <div className="font-mono text-[11px] leading-snug mt-1">
            {method === "lda" && "Lineær"}
            {method === "qda" && "Kvadratisk"}
            {method === "nb" && "Kvadratisk (akse-justert)"}
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Senk separasjonen mot 0.3 og se hvordan grensa bryter sammen — LDA holder
        seg lineær uansett, QDA bøyer seg, og NB legger akse-justerte regioner
        (siden den antar ingen korrelasjon innen klassen).
      </p>
    </div>
  );
}
