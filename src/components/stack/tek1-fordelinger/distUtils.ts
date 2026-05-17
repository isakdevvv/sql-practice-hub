// Distribusjons-helpers for TEK-1501 modul 3.
// Self-contained: PRNG, PDF/PMF, CDF, sampling, moments for 8 fordelinger.

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randn(rng: () => number): number {
  const u1 = Math.max(1e-12, rng());
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Marsaglia–Tsang gamma sampler (shape >= 1). For shape < 1 we use boost.
function gammaSampleShape(rng: () => number, shape: number): number {
  if (shape < 1) {
    const u = rng();
    return gammaSampleShape(rng, shape + 1) * Math.pow(Math.max(1e-12, u), 1 / shape);
  }
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let x: number, v: number;
    do {
      x = randn(rng);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = rng();
    if (u < 1 - 0.0331 * x * x * x * x) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

export function gammaSample(rng: () => number, shape: number, rate: number): number {
  return gammaSampleShape(rng, shape) / rate;
}

// erf via Abramowitz & Stegun
export function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y =
    1 -
    (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}

export function normalCdf(x: number, mu = 0, sigma = 1): number {
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2)));
}

export function normalPdf(x: number, mu = 0, sigma = 1): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

// Log-gamma (Lanczos)
export function gammaln(x: number): number {
  const cof = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 1.208650973866179e-3, -5.395239384953e-6,
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    y += 1;
    ser += cof[j] / y;
  }
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

export function logFactorial(n: number): number {
  return gammaln(n + 1);
}

// Lower regularized incomplete gamma P(a, x) via series + continued fraction
function gammaSeries(a: number, x: number): number {
  const ITMAX = 200;
  const EPS = 3e-12;
  const gln = gammaln(a);
  if (x <= 0) return 0;
  let ap = a;
  let sum = 1 / a;
  let del = sum;
  for (let n = 1; n <= ITMAX; n++) {
    ap += 1;
    del *= x / ap;
    sum += del;
    if (Math.abs(del) < Math.abs(sum) * EPS) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - gln);
}

function gammaCf(a: number, x: number): number {
  const ITMAX = 200;
  const EPS = 3e-12;
  const FPMIN = 1e-30;
  const gln = gammaln(a);
  let b = x + 1 - a;
  let c = 1 / FPMIN;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= ITMAX; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return Math.exp(-x + a * Math.log(x) - gln) * h;
}

// Regularized lower incomplete gamma P(a,x) = γ(a,x)/Γ(a)
export function gammaP(a: number, x: number): number {
  if (x < 0 || a <= 0) return 0;
  if (x === 0) return 0;
  if (x < a + 1) return gammaSeries(a, x);
  return 1 - gammaCf(a, x);
}

// regularized incomplete beta via Lentz continued fraction
function betacf(x: number, a: number, b: number): number {
  const FPMIN = 1e-30, MAXIT = 200, EPS = 3e-12;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

export function betai(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x),
  );
  if (x < (a + 1) / (a + b + 2)) return (bt * betacf(x, a, b)) / a;
  return 1 - (bt * betacf(1 - x, b, a)) / b;
}

// ──────────────────────────────────────────────────────────────────────────
// Distribusjons-katalog
// ──────────────────────────────────────────────────────────────────────────

export type DistKind =
  | "normal"
  | "exponential"
  | "uniform"
  | "binomial"
  | "poisson"
  | "gamma"
  | "chisq"
  | "studentt";

export interface DistParams {
  // normal
  mu?: number;
  sigma?: number;
  // exponential / poisson
  lambda?: number;
  // uniform
  a?: number;
  b?: number;
  // binomial
  n?: number;
  p?: number;
  // gamma
  shape?: number;
  rate?: number;
  // chisq, studentt
  df?: number;
}

export const DIST_LABELS: Record<DistKind, string> = {
  normal: "Normal",
  exponential: "Eksponentiell",
  uniform: "Uniform",
  binomial: "Binomial",
  poisson: "Poisson",
  gamma: "Gamma",
  chisq: "Chi-square",
  studentt: "Student-t",
};

export const DIST_IS_DISCRETE: Record<DistKind, boolean> = {
  normal: false,
  exponential: false,
  uniform: false,
  binomial: true,
  poisson: true,
  gamma: false,
  chisq: false,
  studentt: false,
};

// PDF (kontinuerlig) eller PMF (diskret)
export function distPdf(kind: DistKind, par: DistParams, x: number): number {
  switch (kind) {
    case "normal":
      return normalPdf(x, par.mu ?? 0, par.sigma ?? 1);
    case "exponential": {
      const l = par.lambda ?? 1;
      return x < 0 ? 0 : l * Math.exp(-l * x);
    }
    case "uniform": {
      const a = par.a ?? 0, b = par.b ?? 1;
      return x < a || x > b ? 0 : 1 / (b - a);
    }
    case "binomial": {
      const n = par.n ?? 10, p = par.p ?? 0.5;
      const k = Math.round(x);
      if (k < 0 || k > n) return 0;
      const logp = logFactorial(n) - logFactorial(k) - logFactorial(n - k)
        + k * Math.log(Math.max(1e-300, p))
        + (n - k) * Math.log(Math.max(1e-300, 1 - p));
      return Math.exp(logp);
    }
    case "poisson": {
      const l = par.lambda ?? 1;
      const k = Math.round(x);
      if (k < 0) return 0;
      return Math.exp(-l + k * Math.log(Math.max(1e-300, l)) - logFactorial(k));
    }
    case "gamma": {
      const s = par.shape ?? 2, r = par.rate ?? 1;
      if (x <= 0) return 0;
      return Math.exp(s * Math.log(r) + (s - 1) * Math.log(x) - r * x - gammaln(s));
    }
    case "chisq": {
      const k = par.df ?? 3;
      if (x <= 0) return 0;
      return Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.log(2) - gammaln(k / 2));
    }
    case "studentt": {
      const v = par.df ?? 5;
      const c = Math.exp(gammaln((v + 1) / 2) - gammaln(v / 2)) / Math.sqrt(v * Math.PI);
      return c * Math.pow(1 + (x * x) / v, -(v + 1) / 2);
    }
  }
}

export function distCdf(kind: DistKind, par: DistParams, x: number): number {
  switch (kind) {
    case "normal":
      return normalCdf(x, par.mu ?? 0, par.sigma ?? 1);
    case "exponential": {
      const l = par.lambda ?? 1;
      return x < 0 ? 0 : 1 - Math.exp(-l * x);
    }
    case "uniform": {
      const a = par.a ?? 0, b = par.b ?? 1;
      if (x < a) return 0;
      if (x > b) return 1;
      return (x - a) / (b - a);
    }
    case "binomial": {
      const n = par.n ?? 10;
      const k = Math.floor(x);
      if (k < 0) return 0;
      if (k >= n) return 1;
      let s = 0;
      for (let i = 0; i <= k; i++) s += distPdf("binomial", par, i);
      return s;
    }
    case "poisson": {
      const k = Math.floor(x);
      if (k < 0) return 0;
      let s = 0;
      for (let i = 0; i <= k; i++) s += distPdf("poisson", par, i);
      return s;
    }
    case "gamma": {
      const s = par.shape ?? 2, r = par.rate ?? 1;
      if (x <= 0) return 0;
      return gammaP(s, r * x);
    }
    case "chisq": {
      const k = par.df ?? 3;
      if (x <= 0) return 0;
      return gammaP(k / 2, x / 2);
    }
    case "studentt": {
      const v = par.df ?? 5;
      const xb = v / (v + x * x);
      const p = 0.5 * betai(xb, v / 2, 0.5);
      return x >= 0 ? 1 - p : p;
    }
  }
}

export function distSample(rng: () => number, kind: DistKind, par: DistParams): number {
  switch (kind) {
    case "normal":
      return (par.mu ?? 0) + (par.sigma ?? 1) * randn(rng);
    case "exponential":
      return -Math.log(Math.max(1e-12, rng())) / (par.lambda ?? 1);
    case "uniform": {
      const a = par.a ?? 0, b = par.b ?? 1;
      return a + (b - a) * rng();
    }
    case "binomial": {
      const n = par.n ?? 10, p = par.p ?? 0.5;
      let k = 0;
      for (let i = 0; i < n; i++) if (rng() < p) k++;
      return k;
    }
    case "poisson": {
      // Knuth for small lambda, normal approx for very large
      const l = par.lambda ?? 1;
      if (l > 30) {
        const z = randn(rng);
        return Math.max(0, Math.round(l + Math.sqrt(l) * z));
      }
      const L = Math.exp(-l);
      let k = 0, prod = 1;
      do {
        k++;
        prod *= rng();
      } while (prod > L);
      return k - 1;
    }
    case "gamma":
      return gammaSample(rng, par.shape ?? 2, par.rate ?? 1);
    case "chisq": {
      // chi-square(k) = Gamma(k/2, 1/2)
      const k = par.df ?? 3;
      return gammaSample(rng, k / 2, 0.5);
    }
    case "studentt": {
      const v = par.df ?? 5;
      const z = randn(rng);
      const u = gammaSample(rng, v / 2, 0.5); // chi-square(v)
      return z / Math.sqrt(u / v);
    }
  }
}

// Moments — gir {mean, variance, skewness, kurtosis (excess), median, mode}
export interface Moments {
  mean: number;
  variance: number;
  std: number;
  skewness: number | null; // null = ikke-eksisterende eller for komplekst
  kurtosis: number | null; // excess kurtosis
  median: number | null;
  mode: number | null;
}

export function distMoments(kind: DistKind, par: DistParams): Moments {
  switch (kind) {
    case "normal": {
      const m = par.mu ?? 0, s = par.sigma ?? 1;
      return { mean: m, variance: s * s, std: s, skewness: 0, kurtosis: 0, median: m, mode: m };
    }
    case "exponential": {
      const l = par.lambda ?? 1;
      return {
        mean: 1 / l, variance: 1 / (l * l), std: 1 / l,
        skewness: 2, kurtosis: 6,
        median: Math.log(2) / l, mode: 0,
      };
    }
    case "uniform": {
      const a = par.a ?? 0, b = par.b ?? 1;
      const v = (b - a) * (b - a) / 12;
      return {
        mean: (a + b) / 2, variance: v, std: Math.sqrt(v),
        skewness: 0, kurtosis: -6 / 5,
        median: (a + b) / 2, mode: NaN,
      };
    }
    case "binomial": {
      const n = par.n ?? 10, p = par.p ?? 0.5;
      const v = n * p * (1 - p);
      const std = Math.sqrt(v);
      return {
        mean: n * p, variance: v, std,
        skewness: v > 0 ? (1 - 2 * p) / std : null,
        kurtosis: v > 0 ? (1 - 6 * p * (1 - p)) / v : null,
        median: Math.round(n * p),
        mode: Math.floor((n + 1) * p),
      };
    }
    case "poisson": {
      const l = par.lambda ?? 1;
      return {
        mean: l, variance: l, std: Math.sqrt(l),
        skewness: 1 / Math.sqrt(l), kurtosis: 1 / l,
        median: Math.floor(l + 1 / 3 - 0.02 / l),
        mode: Math.floor(l),
      };
    }
    case "gamma": {
      const s = par.shape ?? 2, r = par.rate ?? 1;
      const v = s / (r * r);
      return {
        mean: s / r, variance: v, std: Math.sqrt(v),
        skewness: 2 / Math.sqrt(s), kurtosis: 6 / s,
        median: null,
        mode: s >= 1 ? (s - 1) / r : 0,
      };
    }
    case "chisq": {
      const k = par.df ?? 3;
      return {
        mean: k, variance: 2 * k, std: Math.sqrt(2 * k),
        skewness: Math.sqrt(8 / k), kurtosis: 12 / k,
        median: null, mode: Math.max(0, k - 2),
      };
    }
    case "studentt": {
      const v = par.df ?? 5;
      return {
        mean: v > 1 ? 0 : NaN,
        variance: v > 2 ? v / (v - 2) : Infinity,
        std: v > 2 ? Math.sqrt(v / (v - 2)) : Infinity,
        skewness: v > 3 ? 0 : null,
        kurtosis: v > 4 ? 6 / (v - 4) : null,
        median: 0, mode: 0,
      };
    }
  }
}

// Default-domener for plot (kontinuerlig) basert på par.
export function distDomain(kind: DistKind, par: DistParams): [number, number] {
  switch (kind) {
    case "normal": {
      const m = par.mu ?? 0, s = par.sigma ?? 1;
      return [m - 4 * s, m + 4 * s];
    }
    case "exponential": {
      const l = par.lambda ?? 1;
      return [0, 6 / l];
    }
    case "uniform": {
      const a = par.a ?? 0, b = par.b ?? 1;
      const pad = (b - a) * 0.15;
      return [a - pad, b + pad];
    }
    case "binomial": {
      const n = par.n ?? 10;
      return [-0.5, n + 0.5];
    }
    case "poisson": {
      const l = par.lambda ?? 1;
      const hi = Math.max(10, Math.ceil(l + 4 * Math.sqrt(l)));
      return [-0.5, hi + 0.5];
    }
    case "gamma": {
      const s = par.shape ?? 2, r = par.rate ?? 1;
      return [0, (s + 4 * Math.sqrt(s)) / r];
    }
    case "chisq": {
      const k = par.df ?? 3;
      return [0, k + 4 * Math.sqrt(2 * k)];
    }
    case "studentt":
      return [-5, 5];
  }
}

// Sample-statistikker
export function mean(a: number[]): number {
  if (a.length === 0) return NaN;
  let s = 0;
  for (const v of a) s += v;
  return s / a.length;
}
export function variance(a: number[]): number {
  if (a.length < 2) return NaN;
  const m = mean(a);
  let s = 0;
  for (const v of a) s += (v - m) ** 2;
  return s / (a.length - 1);
}
export function std(a: number[]): number {
  return Math.sqrt(variance(a));
}

export interface HistBin {
  x0: number;
  x1: number;
  c: number;
}
export function histogram(values: number[], bins = 30, range?: [number, number]): HistBin[] {
  if (values.length === 0) return [];
  let mn: number, mx: number;
  if (range) {
    mn = range[0];
    mx = range[1];
  } else {
    mn = values[0]; mx = values[0];
    for (const v of values) {
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    const pad = (mx - mn) * 0.05 + 1e-9;
    mn -= pad; mx += pad;
  }
  const bw = (mx - mn) / bins;
  const counts = new Array(bins).fill(0);
  for (const v of values) {
    let idx = Math.floor((v - mn) / bw);
    if (idx < 0) idx = 0;
    if (idx >= bins) idx = bins - 1;
    counts[idx] += 1;
  }
  const out: HistBin[] = [];
  for (let i = 0; i < bins; i++) {
    out.push({ x0: mn + i * bw, x1: mn + (i + 1) * bw, c: counts[i] });
  }
  return out;
}

// Log-likelihood for et utvalg under en gitt fordeling — for matcher-modulen.
export function logLikelihood(kind: DistKind, par: DistParams, data: number[]): number {
  let ll = 0;
  for (const x of data) {
    const p = distPdf(kind, par, x);
    if (p <= 0) return -Infinity;
    ll += Math.log(p);
  }
  return ll;
}

// MLE-estimater for hver fordeling (kun de vi støtter i matcher).
// Returnerer params + sample-sammendrag.
export function mleEstimate(kind: DistKind, data: number[]): DistParams {
  const n = data.length;
  const xbar = mean(data);
  const s2 = variance(data); // ubiased
  switch (kind) {
    case "normal":
      // MLE: mu=xbar, sigma^2 = sum((x-xbar)^2)/n  (biased) — bruk det
      return { mu: xbar, sigma: Math.sqrt(((n - 1) / n) * s2) };
    case "exponential":
      return { lambda: 1 / Math.max(1e-12, xbar) };
    case "uniform":
      return { a: Math.min(...data), b: Math.max(...data) };
    case "poisson":
      return { lambda: Math.max(1e-9, xbar) };
    case "binomial": {
      // Antar n kjent = max(data) eller round(max). MLE for p = xbar/n
      const nB = Math.max(1, Math.round(Math.max(...data)));
      return { n: nB, p: Math.min(1, Math.max(0, xbar / nB)) };
    }
    case "gamma": {
      // Method-of-moments: shape = xbar^2 / s2, rate = xbar / s2
      const shape = Math.max(0.1, (xbar * xbar) / Math.max(1e-9, s2));
      const rate = Math.max(0.01, xbar / Math.max(1e-9, s2));
      return { shape, rate };
    }
    case "chisq":
      // Match: df = xbar
      return { df: Math.max(0.5, xbar) };
    case "studentt":
      // Method-of-moments for variance v/(v-2) = s2 → v = 2s2/(s2-1) hvis s2>1
      // ellers fallback df=10
      if (s2 > 1.05) return { df: Math.max(2.5, (2 * s2) / (s2 - 1)) };
      return { df: 30 };
  }
}
