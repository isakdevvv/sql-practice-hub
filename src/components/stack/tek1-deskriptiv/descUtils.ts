// Felles deskriptiv-statistikk-helpers for tek1-deskriptiv visualisatorer.
// Selvstendige; ingen avhengigheter utenfor TS.

export type Num = number;

export function mean(xs: Num[]): number {
  if (xs.length === 0) return 0;
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

export function variance(xs: Num[], sample = true): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  let ss = 0;
  for (const x of xs) ss += (x - m) ** 2;
  return ss / (sample ? xs.length - 1 : xs.length);
}

export function stdDev(xs: Num[], sample = true): number {
  return Math.sqrt(variance(xs, sample));
}

export function sorted(xs: Num[]): Num[] {
  return [...xs].sort((a, b) => a - b);
}

export function quantile(xs: Num[], p: number): number {
  if (xs.length === 0) return 0;
  const s = sorted(xs);
  const h = (s.length - 1) * p;
  const lo = Math.floor(h);
  const hi = Math.ceil(h);
  if (lo === hi) return s[lo];
  return s[lo] + (h - lo) * (s[hi] - s[lo]);
}

export function median(xs: Num[]): number {
  return quantile(xs, 0.5);
}

export function range(xs: Num[]): number {
  if (xs.length === 0) return 0;
  return Math.max(...xs) - Math.min(...xs);
}

export function iqr(xs: Num[]): number {
  return quantile(xs, 0.75) - quantile(xs, 0.25);
}

// Empirisk mode via histogram-binning. Returnerer senter for største bin.
export function mode(xs: Num[], bins = 12): { value: number; count: number } {
  if (xs.length === 0) return { value: 0, count: 0 };
  const lo = Math.min(...xs);
  const hi = Math.max(...xs);
  const span = hi - lo || 1;
  const w = span / bins;
  const counts = new Array(bins).fill(0);
  for (const x of xs) {
    let b = Math.floor((x - lo) / w);
    if (b >= bins) b = bins - 1;
    if (b < 0) b = 0;
    counts[b] += 1;
  }
  let maxI = 0;
  for (let i = 1; i < bins; i++) if (counts[i] > counts[maxI]) maxI = i;
  return { value: lo + (maxI + 0.5) * w, count: counts[maxI] };
}

// Sample skewness (biased, populasjons-formel slik den vanligvis vises pedagogisk).
export function skewness(xs: Num[]): number {
  const n = xs.length;
  if (n < 3) return 0;
  const m = mean(xs);
  const s = stdDev(xs, true);
  if (s === 0) return 0;
  let s3 = 0;
  for (const x of xs) s3 += ((x - m) / s) ** 3;
  return (n / ((n - 1) * (n - 2))) * s3;
}

// Excess kurtosis (normal har 0).
export function kurtosis(xs: Num[]): number {
  const n = xs.length;
  if (n < 4) return 0;
  const m = mean(xs);
  const s = stdDev(xs, true);
  if (s === 0) return 0;
  let s4 = 0;
  for (const x of xs) s4 += ((x - m) / s) ** 4;
  const a = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3));
  const b = (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));
  return a * s4 - b;
}

export function trimmedMean(xs: Num[], frac: number): number {
  if (xs.length === 0) return 0;
  const s = sorted(xs);
  const k = Math.floor(s.length * frac);
  const trimmed = s.slice(k, s.length - k);
  return mean(trimmed.length ? trimmed : s);
}

export type HistBin = { lo: number; hi: number; count: number };

export function histogram(xs: Num[], bins = 12, lo?: number, hi?: number): HistBin[] {
  if (xs.length === 0) return [];
  const min = lo ?? Math.min(...xs);
  const max = hi ?? Math.max(...xs);
  const span = max - min || 1;
  const w = span / bins;
  const out: HistBin[] = [];
  for (let i = 0; i < bins; i++) {
    out.push({ lo: min + i * w, hi: min + (i + 1) * w, count: 0 });
  }
  for (const x of xs) {
    let b = Math.floor((x - min) / w);
    if (b >= bins) b = bins - 1;
    if (b < 0) b = 0;
    out[b].count += 1;
  }
  return out;
}

// Deterministisk PRNG slik at preset-fordelinger ser like ut på tvers av rendere.
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

// Beta-skjev-ish via power-transformasjon på uniform [0,1].
export function rightSkewSample(rng: () => number, scale = 10): number {
  const u = rng();
  return scale * (1 - Math.pow(1 - u, 3));
  // Ikke teoretisk eksakt, men gir tydelig høyre-skjev visuelt.
}

export function leftSkewSample(rng: () => number, scale = 10): number {
  const u = rng();
  return scale * Math.pow(u, 3);
}

export function bimodalSample(rng: () => number): number {
  const a = rng() < 0.5;
  return (a ? -2.2 : 2.2) + 0.7 * randn(rng);
}
