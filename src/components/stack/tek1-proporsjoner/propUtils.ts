// Felles statistiske hjelpefunksjoner for tek1-proporsjoner-lesjonen.

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

// Z-kritisk for tosidig konfidens c (f.eks. c=0.95 → 1.96).
export const Z_CRIT: Record<string, number> = {
  "0.90": 1.6449,
  "0.95": 1.96,
  "0.99": 2.5758,
};

// log-Gamma — Lanczos-approks.
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

// Regularisert inkomplett gamma P(a, x) — for chi-square CDF.
// Returnerer P(a, x) = γ(a, x) / Γ(a).
function gser(a: number, x: number): number {
  const ITMAX = 200;
  const EPS = 3e-12;
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
  return sum * Math.exp(-x + a * Math.log(x) - gammaln(a));
}

function gcf(a: number, x: number): number {
  const ITMAX = 200;
  const EPS = 3e-12;
  const FPMIN = 1e-300;
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
  return Math.exp(-x + a * Math.log(x) - gammaln(a)) * h;
}

export function gammp(a: number, x: number): number {
  if (x < 0 || a <= 0) return 0;
  if (x === 0) return 0;
  if (x < a + 1) return gser(a, x);
  return 1 - gcf(a, x);
}

// Chi-square CDF med df frihetsgrader.
export function chiSquareCdf(x: number, df: number): number {
  if (x <= 0) return 0;
  return gammp(df / 2, x / 2);
}

// Chi-square PDF.
export function chiSquarePdf(x: number, df: number): number {
  if (x <= 0) return 0;
  const k = df / 2;
  return (
    Math.exp(-x / 2 + (k - 1) * Math.log(x) - k * Math.log(2) - gammaln(k))
  );
}

// Kritisk chi-square_{α, df}: finn x > 0 så chiSquareCdf(x, df) = 1 - α.
export function chiSquareCrit(alpha: number, df: number): number {
  const target = 1 - alpha;
  let lo = 0;
  let hi = Math.max(50, df * 6);
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (chiSquareCdf(mid, df) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// Wald-CI for én proporsjon.
export function waldCi(x: number, n: number, z: number) {
  if (n === 0) return { lo: 0, hi: 0, mid: 0 };
  const p = x / n;
  const se = Math.sqrt((p * (1 - p)) / n);
  return { lo: p - z * se, hi: p + z * se, mid: p };
}

// Wilson (score) CI.
export function wilsonCi(x: number, n: number, z: number) {
  if (n === 0) return { lo: 0, hi: 0, mid: 0 };
  const p = x / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denom;
  return { lo: center - half, hi: center + half, mid: center };
}

// Clopper–Pearson (eksakt) CI via beta-kvantilfunksjonen.
// CI = [B(α/2; x, n-x+1), B(1-α/2; x+1, n-x)].
// Vi bruker bisection over chiSquareCdf-veien: beta-kvantil via
// regularisert inkomplett beta er litt mer arbeid. Vi gjør bisection
// direkte med betaCdf (via inverse).
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

export function betai(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    gammaln(a + b) -
      gammaln(a) -
      gammaln(b) +
      a * Math.log(x) +
      b * Math.log(1 - x),
  );
  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(x, a, b)) / a;
  }
  return 1 - (bt * betacf(1 - x, b, a)) / b;
}

// Beta-kvantil via bisection.
function betaQuantile(p: number, a: number, b: number): number {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (betai(mid, a, b) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function clopperPearsonCi(x: number, n: number, alpha: number) {
  if (n === 0) return { lo: 0, hi: 1, mid: 0 };
  const mid = x / n;
  const lo = x === 0 ? 0 : betaQuantile(alpha / 2, x, n - x + 1);
  const hi = x === n ? 1 : betaQuantile(1 - alpha / 2, x + 1, n - x);
  return { lo, hi, mid };
}
