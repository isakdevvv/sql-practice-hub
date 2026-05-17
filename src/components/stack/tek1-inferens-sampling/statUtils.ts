// Shared statistical utilities for the sampling-distribution lesson.
// Deterministic PRNG, normal/uniform/exponential samplers, erf-baserte
// CDF/inverse-CDF, og en t-fordelings-CDF basert på regularisert
// inkomplett betafunksjon (Lentz). Alt holdes self-contained.

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

// Box–Muller — gir ett standard-normalt tall per kall.
export function randn(rng: () => number): number {
  const u1 = Math.max(1e-12, rng());
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Eksponentielt med rate λ.
export function randexp(rng: () => number, lambda = 1): number {
  return -Math.log(Math.max(1e-12, rng())) / lambda;
}

// Uniform på [a, b].
export function randuni(rng: () => number, a = 0, b = 1): number {
  return a + (b - a) * rng();
}

// Bimodal: blanding av to normaler med vekt p på den ene.
export function randbimodal(
  rng: () => number,
  mu1 = -2,
  sd1 = 0.8,
  mu2 = 2,
  sd2 = 0.8,
  p = 0.5,
): number {
  if (rng() < p) return mu1 + sd1 * randn(rng);
  return mu2 + sd2 * randn(rng);
}

export type PopKind = "normal" | "uniform" | "exponential" | "bimodal";

export interface PopParams {
  mu?: number;
  sigma?: number;
  a?: number;
  b?: number;
  lambda?: number;
  // bimodal: bruker mu1/sd1, mu2/sd2, p
  mu1?: number;
  sd1?: number;
  mu2?: number;
  sd2?: number;
  p?: number;
}

export function drawFrom(
  rng: () => number,
  kind: PopKind,
  par: PopParams,
): number {
  switch (kind) {
    case "normal":
      return (par.mu ?? 0) + (par.sigma ?? 1) * randn(rng);
    case "uniform":
      return randuni(rng, par.a ?? 0, par.b ?? 1);
    case "exponential":
      return randexp(rng, par.lambda ?? 1);
    case "bimodal":
      return randbimodal(
        rng,
        par.mu1 ?? -2,
        par.sd1 ?? 0.8,
        par.mu2 ?? 2,
        par.sd2 ?? 0.8,
        par.p ?? 0.5,
      );
  }
}

// "Sanne" populasjons-mu og -sigma (analytisk) — brukes til CI-coverage-plot.
export function popMean(kind: PopKind, par: PopParams): number {
  switch (kind) {
    case "normal":
      return par.mu ?? 0;
    case "uniform": {
      const a = par.a ?? 0;
      const b = par.b ?? 1;
      return (a + b) / 2;
    }
    case "exponential":
      return 1 / (par.lambda ?? 1);
    case "bimodal": {
      const m1 = par.mu1 ?? -2;
      const m2 = par.mu2 ?? 2;
      const p = par.p ?? 0.5;
      return p * m1 + (1 - p) * m2;
    }
  }
}

export function popStd(kind: PopKind, par: PopParams): number {
  switch (kind) {
    case "normal":
      return par.sigma ?? 1;
    case "uniform": {
      const a = par.a ?? 0;
      const b = par.b ?? 1;
      return (b - a) / Math.sqrt(12);
    }
    case "exponential":
      return 1 / (par.lambda ?? 1);
    case "bimodal": {
      const m1 = par.mu1 ?? -2;
      const s1 = par.sd1 ?? 0.8;
      const m2 = par.mu2 ?? 2;
      const s2 = par.sd2 ?? 0.8;
      const p = par.p ?? 0.5;
      const m = p * m1 + (1 - p) * m2;
      const ex2 = p * (s1 * s1 + m1 * m1) + (1 - p) * (s2 * s2 + m2 * m2);
      return Math.sqrt(Math.max(0, ex2 - m * m));
    }
  }
}

// Standard normal CDF via Abramowitz & Stegun approx av erf.
export function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y =
    1 -
    (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) *
      t *
      Math.exp(-ax * ax);
  return sign * y;
}

export function normalCdf(x: number, mu = 0, sigma = 1): number {
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2)));
}

export function normalPdf(x: number, mu = 0, sigma = 1): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

// Beasley–Springer–Moro inverse standard normal CDF.
export function normInv(p: number): number {
  const a = [
    -39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269,
    -30.6647980661472, 2.50662827745924,
  ];
  const b = [
    -54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197,
    -13.2806815528857,
  ];
  const c = [
    -7.78489400243029e-3, -0.322396458041136, -2.40075827716184,
    -2.54973253934373, 4.37466414146497, 2.93816398269878,
  ];
  const d = [
    7.78469570904146e-3, 0.32246712907004, 2.445134137143, 3.75440866190742,
  ];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number, r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
        q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
}

// Studentens t — CDF og PDF og kritisk verdi via bisection.

// Regularisert inkomplett beta I_x(a,b) via Lentz' continued fraction.
function betacf(x: number, a: number, b: number): number {
  const FPMIN = 1e-30;
  const MAXIT = 200;
  const EPS = 3e-12;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
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

function gammaln(x: number): number {
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

export function betai(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x),
  );
  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(x, a, b)) / a;
  }
  return 1 - (bt * betacf(1 - x, b, a)) / b;
}

// Student-t CDF (df > 0). For tosidig: P(|T| > |t|) = 2*(1 - tCdf(|t|, df)).
export function tCdf(t: number, df: number): number {
  if (!isFinite(t)) return t > 0 ? 1 : 0;
  const x = df / (df + t * t);
  const p = 0.5 * betai(x, df / 2, 0.5);
  return t >= 0 ? 1 - p : p;
}

export function tPdf(t: number, df: number): number {
  const c =
    Math.exp(gammaln((df + 1) / 2) - gammaln(df / 2)) /
    Math.sqrt(df * Math.PI);
  return c * Math.pow(1 + (t * t) / df, -(df + 1) / 2);
}

// Kritisk t_{α/2, df}: finn t > 0 så tCdf(t, df) = 1 - α/2.
export function tCritTwoSided(alpha: number, df: number): number {
  const target = 1 - alpha / 2;
  let lo = 0;
  let hi = 50;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (tCdf(mid, df) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function tCritOneSided(alpha: number, df: number): number {
  const target = 1 - alpha;
  let lo = 0;
  let hi = 50;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (tCdf(mid, df) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// Sample-statistikker.
export function mean(a: number[]): number {
  let s = 0;
  for (const v of a) s += v;
  return s / a.length;
}

export function variance(a: number[]): number {
  const m = mean(a);
  let s = 0;
  for (const v of a) s += (v - m) ** 2;
  return s / (a.length - 1);
}

export function std(a: number[]): number {
  return Math.sqrt(variance(a));
}

// Histogram-binning som returnerer {x0, x1, c}-poster.
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
    mn = values[0];
    mx = values[0];
    for (const v of values) {
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    const pad = (mx - mn) * 0.05 + 1e-9;
    mn -= pad;
    mx += pad;
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
