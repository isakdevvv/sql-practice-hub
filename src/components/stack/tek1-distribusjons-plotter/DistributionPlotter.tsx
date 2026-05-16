import { useMemo, useState } from "react";

/**
 * DistributionPlotter — interaktiv visualisering av PDF/PMF + CDF
 * for de viktigste fordelingene i TEK-1501.
 *
 * Pedagogikk:
 *  - Slider på parameterne → se hvordan formen endres
 *  - Live skyggelegging av α=0.05-halene → koble fordeling til hypotesetest
 *  - Vis kritiske verdier numerisk så studenten kan sjekke mot tabellverket
 */

type DistId = "normal" | "t" | "chi2" | "poisson" | "binom";

// ============================================================
// Spesialfunksjoner (numerisk, godt-nok-presisjon for plot)
// ============================================================

function erf(x: number): number {
  // Abramowitz & Stegun 7.1.26
  const sign = Math.sign(x);
  const ax = Math.abs(x);
  const a1 = 0.254829592,
    a2 = -0.284496736,
    a3 = 1.421413741;
  const a4 = -1.453152027,
    a5 = 1.061405429,
    p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y =
    1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}

function normPdf(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

function normCdf(x: number, mu: number, sigma: number): number {
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2)));
}

// log-gamma via Lanczos
function lgamma(z: number): number {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
  }
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function tPdf(x: number, df: number): number {
  const num = lgamma((df + 1) / 2) - lgamma(df / 2);
  const denom = 0.5 * Math.log(df * Math.PI);
  const body = -((df + 1) / 2) * Math.log(1 + (x * x) / df);
  return Math.exp(num - denom + body);
}

// Lower incomplete regularized gamma P(a, x) — series + cont.frac.
function gammaP(a: number, x: number): number {
  if (x < 0 || a <= 0) return 0;
  if (x === 0) return 0;
  const gln = lgamma(a);
  if (x < a + 1) {
    // Series
    let ap = a;
    let sum = 1 / a;
    let del = sum;
    for (let n = 1; n < 200; n++) {
      ap += 1;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * 1e-12) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - gln);
  }
  // Continued fraction for Q(a,x)
  let b = x + 1 - a;
  let c = 1e30;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 200; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = b + an / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-12) break;
  }
  return 1 - Math.exp(-x + a * Math.log(x) - gln) * h;
}

function chi2Pdf(x: number, df: number): number {
  if (x <= 0) return 0;
  const k = df / 2;
  return Math.exp((k - 1) * Math.log(x) - x / 2 - k * Math.log(2) - lgamma(k));
}

function chi2Cdf(x: number, df: number): number {
  if (x <= 0) return 0;
  return gammaP(df / 2, x / 2);
}

// numeric CDF via trapezoidal — for t
function trapCdf(pdf: (x: number) => number, lo: number, x: number, steps = 400): number {
  if (x <= lo) return 0;
  const h = (x - lo) / steps;
  let s = 0.5 * (pdf(lo) + pdf(x));
  for (let i = 1; i < steps; i++) s += pdf(lo + i * h);
  return s * h;
}

// inverse via bisection
function inverse(cdf: (x: number) => number, p: number, lo: number, hi: number): number {
  for (let i = 0; i < 60; i++) {
    const m = 0.5 * (lo + hi);
    if (cdf(m) < p) lo = m;
    else hi = m;
  }
  return 0.5 * (lo + hi);
}

// Poisson PMF/CDF
function poissonPmf(k: number, lambda: number): number {
  if (k < 0) return 0;
  return Math.exp(k * Math.log(lambda) - lambda - lgamma(k + 1));
}

// Binomial via log
function logChoose(n: number, k: number): number {
  return lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1);
}
function binomPmf(k: number, n: number, p: number): number {
  if (k < 0 || k > n) return 0;
  if (p <= 0) return k === 0 ? 1 : 0;
  if (p >= 1) return k === n ? 1 : 0;
  return Math.exp(logChoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
}

// ============================================================
// Komponent
// ============================================================

const DISTS: { id: DistId; label: string; desc: string }[] = [
  { id: "normal", label: "Normal N(μ, σ²)", desc: "Klokkekurven — kontinuerlig" },
  { id: "t", label: "Student-t (df)", desc: "Tyngre haler enn N" },
  { id: "chi2", label: "Kji-kvadrat χ²(df)", desc: "Asymmetrisk, x ≥ 0" },
  { id: "poisson", label: "Poisson(λ)", desc: "Diskret, antall hendelser" },
  { id: "binom", label: "Binomisk(n, p)", desc: "Diskret, k suksesser av n" },
];

export function DistributionPlotter() {
  const [dist, setDist] = useState<DistId>("normal");
  // parametre
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);
  const [df, setDf] = useState(5);
  const [lambda, setLambda] = useState(4);
  const [n, setN] = useState(20);
  const [p, setP] = useState(0.5);

  // ============== Plot-data ==============
  const data = useMemo(() => {
    if (dist === "normal") {
      const lo = mu - 4 * sigma;
      const hi = mu + 4 * sigma;
      const pts: { x: number; pdf: number; cdf: number }[] = [];
      for (let i = 0; i <= 200; i++) {
        const x = lo + (i / 200) * (hi - lo);
        pts.push({ x, pdf: normPdf(x, mu, sigma), cdf: normCdf(x, mu, sigma) });
      }
      const crit = 1.959963984540054 * sigma; // z_{0.025}
      return {
        kind: "continuous" as const,
        pts,
        lo,
        hi,
        critLow: mu - crit,
        critHigh: mu + crit,
        critOneTail: mu + 1.6448536269514722 * sigma,
        meta: `α=0.05 tosidig: ±${(1.96 * sigma).toFixed(3)} · ensidig høyre: ${(mu + 1.6449 * sigma).toFixed(3)}`,
      };
    }
    if (dist === "t") {
      const pdf = (x: number) => tPdf(x, df);
      const cdf = (x: number) => trapCdf(pdf, -20, x);
      const lo = -5;
      const hi = 5;
      const pts: { x: number; pdf: number; cdf: number }[] = [];
      for (let i = 0; i <= 200; i++) {
        const x = lo + (i / 200) * (hi - lo);
        pts.push({ x, pdf: pdf(x), cdf: cdf(x) });
      }
      const critHigh = inverse(cdf, 0.975, 0, 20);
      const critLow = -critHigh;
      const critOne = inverse(cdf, 0.95, 0, 20);
      return {
        kind: "continuous" as const,
        pts,
        lo,
        hi,
        critLow,
        critHigh,
        critOneTail: critOne,
        meta: `α=0.05 tosidig: ±${critHigh.toFixed(3)} · ensidig: ${critOne.toFixed(3)} · df=${df}`,
      };
    }
    if (dist === "chi2") {
      const lo = 0;
      const hi = Math.max(20, df * 3);
      const pts: { x: number; pdf: number; cdf: number }[] = [];
      for (let i = 0; i <= 200; i++) {
        const x = lo + (i / 200) * (hi - lo);
        pts.push({ x, pdf: chi2Pdf(x, df), cdf: chi2Cdf(x, df) });
      }
      const critHigh = inverse((x) => chi2Cdf(x, df), 0.95, 0, hi);
      return {
        kind: "continuous" as const,
        pts,
        lo,
        hi,
        critLow: 0,
        critHigh,
        critOneTail: critHigh,
        meta: `α=0.05 ensidig høyre: χ² > ${critHigh.toFixed(3)} (df=${df})`,
      };
    }
    if (dist === "poisson") {
      const kMax = Math.max(20, Math.ceil(lambda + 4 * Math.sqrt(lambda)));
      const pts: { x: number; pdf: number; cdf: number }[] = [];
      let acc = 0;
      for (let k = 0; k <= kMax; k++) {
        const pmf = poissonPmf(k, lambda);
        acc += pmf;
        pts.push({ x: k, pdf: pmf, cdf: acc });
      }
      let kCrit = kMax;
      acc = 0;
      for (let k = 0; k <= kMax; k++) {
        acc += poissonPmf(k, lambda);
        if (acc >= 0.95) {
          kCrit = k;
          break;
        }
      }
      return {
        kind: "discrete" as const,
        pts,
        lo: 0,
        hi: kMax,
        critLow: -1,
        critHigh: kCrit,
        critOneTail: kCrit,
        meta: `α=0.05 ensidig: P(X > ${kCrit}) ≤ 0.05 · λ=${lambda}`,
      };
    }
    // binom
    const pts: { x: number; pdf: number; cdf: number }[] = [];
    let acc = 0;
    for (let k = 0; k <= n; k++) {
      const pmf = binomPmf(k, n, p);
      acc += pmf;
      pts.push({ x: k, pdf: pmf, cdf: acc });
    }
    let kCrit = n;
    acc = 0;
    for (let k = 0; k <= n; k++) {
      acc += binomPmf(k, n, p);
      if (acc >= 0.95) {
        kCrit = k;
        break;
      }
    }
    return {
      kind: "discrete" as const,
      pts,
      lo: 0,
      hi: n,
      critLow: -1,
      critHigh: kCrit,
      critOneTail: kCrit,
      meta: `α=0.05 ensidig: P(X > ${kCrit}) ≤ 0.05 · n=${n}, p=${p}`,
    };
  }, [dist, mu, sigma, df, lambda, n, p]);

  // ============== Plot rendering ==============
  const W = 360;
  const H = 220;
  const PAD = 35;
  const xMin = data.lo;
  const xMax = data.hi;
  const pdfMax = Math.max(...data.pts.map((d) => d.pdf), 1e-9) * 1.05;
  const px = (x: number) => PAD + ((x - xMin) / (xMax - xMin)) * (W - 2 * PAD);
  const py = (v: number, max: number) =>
    H - PAD - (v / max) * (H - 2 * PAD);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div>
        <div className="text-xs text-muted-foreground mb-1">Fordeling</div>
        <div className="flex flex-wrap gap-1">
          {DISTS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDist(d.id)}
              className={`px-2.5 py-1 text-xs rounded border transition ${
                dist === d.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">
          {DISTS.find((d) => d.id === dist)?.desc}
        </div>
      </div>

      {/* Parameter-sliders */}
      <div className="grid sm:grid-cols-2 gap-3">
        {dist === "normal" && (
          <>
            <Slider label="μ (mean)" value={mu} min={-5} max={5} step={0.1} onChange={setMu} />
            <Slider label="σ (sd)" value={sigma} min={0.2} max={3} step={0.05} onChange={setSigma} />
          </>
        )}
        {dist === "t" && (
          <Slider label="df (frihetsgrader)" value={df} min={1} max={50} step={1} onChange={setDf} />
        )}
        {dist === "chi2" && (
          <Slider label="df" value={df} min={1} max={30} step={1} onChange={setDf} />
        )}
        {dist === "poisson" && (
          <Slider label="λ (rate)" value={lambda} min={0.2} max={20} step={0.1} onChange={setLambda} />
        )}
        {dist === "binom" && (
          <>
            <Slider label="n" value={n} min={1} max={50} step={1} onChange={setN} />
            <Slider label="p" value={p} min={0.01} max={0.99} step={0.01} onChange={setP} />
          </>
        )}
      </div>

      <div className="text-[11px] text-amber-400 font-mono">{data.meta}</div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* PDF/PMF */}
        <div>
          <div className="text-xs font-semibold mb-1">
            {data.kind === "continuous" ? "PDF f(x)" : "PMF P(X = k)"}
          </div>
          <svg width={W} height={H} className="block bg-background rounded">
            {/* axes */}
            <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#888" />
            <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#888" />
            {/* critical region shading */}
            {data.kind === "continuous" && (
              <>
                <path
                  d={`M ${px(xMin)} ${py(0, pdfMax)} ${data.pts
                    .filter((d) => d.x <= data.critLow)
                    .map((d) => `L ${px(d.x)} ${py(d.pdf, pdfMax)}`)
                    .join(" ")} L ${px(data.critLow)} ${py(0, pdfMax)} Z`}
                  fill="rgba(244,63,94,0.4)"
                />
                <path
                  d={`M ${px(data.critHigh)} ${py(0, pdfMax)} ${data.pts
                    .filter((d) => d.x >= data.critHigh)
                    .map((d) => `L ${px(d.x)} ${py(d.pdf, pdfMax)}`)
                    .join(" ")} L ${px(xMax)} ${py(0, pdfMax)} Z`}
                  fill="rgba(244,63,94,0.4)"
                />
                {/* curve */}
                <path
                  d={data.pts
                    .map((d, i) => `${i === 0 ? "M" : "L"} ${px(d.x)} ${py(d.pdf, pdfMax)}`)
                    .join(" ")}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth={2}
                />
                {/* crit lines */}
                <line
                  x1={px(data.critLow)}
                  y1={PAD}
                  x2={px(data.critLow)}
                  y2={H - PAD}
                  stroke="#facc15"
                  strokeDasharray="3 3"
                />
                <line
                  x1={px(data.critHigh)}
                  y1={PAD}
                  x2={px(data.critHigh)}
                  y2={H - PAD}
                  stroke="#facc15"
                  strokeDasharray="3 3"
                />
              </>
            )}
            {data.kind === "discrete" && (
              <>
                {data.pts.map((d) => {
                  const inTail = d.x > data.critHigh;
                  const barW = Math.max(2, (W - 2 * PAD) / (xMax - xMin + 1) - 2);
                  return (
                    <rect
                      key={`bar-${d.x}`}
                      x={px(d.x) - barW / 2}
                      y={py(d.pdf, pdfMax)}
                      width={barW}
                      height={H - PAD - py(d.pdf, pdfMax)}
                      fill={inTail ? "rgba(244,63,94,0.8)" : "#22c55e"}
                    />
                  );
                })}
              </>
            )}
            <text x={W / 2} y={H - 5} fontSize={10} fill="#888" textAnchor="middle">
              x
            </text>
          </svg>
        </div>

        {/* CDF */}
        <div>
          <div className="text-xs font-semibold mb-1">CDF F(x) = P(X ≤ x)</div>
          <svg width={W} height={H} className="block bg-background rounded">
            <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#888" />
            <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#888" />
            {/* 0.95 and 0.025 reference lines */}
            <line
              x1={PAD}
              y1={py(0.95, 1)}
              x2={W - PAD}
              y2={py(0.95, 1)}
              stroke="#666"
              strokeDasharray="2 3"
            />
            <text x={W - PAD - 2} y={py(0.95, 1) - 2} fontSize={9} fill="#888" textAnchor="end">
              0.95
            </text>
            {data.kind === "continuous" && (
              <path
                d={data.pts
                  .map((d, i) => `${i === 0 ? "M" : "L"} ${px(d.x)} ${py(d.cdf, 1)}`)
                  .join(" ")}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={2}
              />
            )}
            {data.kind === "discrete" &&
              data.pts.map((d, i) => {
                const next = data.pts[i + 1];
                return (
                  <g key={`cdf-${d.x}`}>
                    <line
                      x1={px(d.x)}
                      y1={py(d.cdf, 1)}
                      x2={next ? px(next.x) : W - PAD}
                      y2={py(d.cdf, 1)}
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    {next && (
                      <line
                        x1={px(next.x)}
                        y1={py(d.cdf, 1)}
                        x2={px(next.x)}
                        y2={py(next.cdf, 1)}
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                    )}
                  </g>
                );
              })}
            <line
              x1={px(data.critHigh)}
              y1={PAD}
              x2={px(data.critHigh)}
              y2={H - PAD}
              stroke="#facc15"
              strokeDasharray="3 3"
            />
            <text x={W / 2} y={H - 5} fontSize={10} fill="#888" textAnchor="middle">
              x
            </text>
          </svg>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        <strong>Eksamenstrigger:</strong> Røde haler er forkastningsområdet ved
        α = 0.05. Gule streker markerer de kritiske verdiene. Sammenlign med
        tabellverdiene i formelsamlingen (f.eks. z₀.₀₂₅ = 1.96, t₀.₀₅,₁₀ ≈ 1.812).
      </p>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="text-xs flex flex-col gap-1">
      <span className="text-muted-foreground">
        {label}: <span className="font-mono text-foreground">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </label>
  );
}
