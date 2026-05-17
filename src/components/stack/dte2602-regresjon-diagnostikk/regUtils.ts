/**
 * Regresjon-diagnostikk — felles statistiske hjelpefunksjoner.
 *
 * Alt holdes "pent" og selvforklarende slik at lesjonen kan bygges
 * uten en numerisk-bibliotek-avhengighet. Formler følger lærebøkene:
 *   - OLS:        β̂₁ = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)²,  β̂₀ = ȳ − β̂₁·x̄
 *   - Leverage:   h_ii = 1/n + (x_i − x̄)² / Σ(x − x̄)²            (1 prediktor)
 *   - Cook's D:   D_i = (e_i² · h_ii) / (p · σ̂² · (1 − h_ii)²),  p = 2
 *   - Probit:     Beasley–Springer–Moro inverse normal CDF
 */

export type Pt = { x: number; y: number };

export type OlsFit = {
  b0: number;
  b1: number;
  yhat: number[];
  residuals: number[];
  rss: number;
  tss: number;
  r2: number;
  xbar: number;
  ybar: number;
  sxx: number;
  sigma2: number; // RSS / (n - 2)
};

export function olsFit(pts: Pt[]): OlsFit {
  const n = pts.length;
  const xbar = pts.reduce((s, p) => s + p.x, 0) / n;
  const ybar = pts.reduce((s, p) => s + p.y, 0) / n;
  let sxx = 0;
  let sxy = 0;
  for (const p of pts) {
    sxx += (p.x - xbar) ** 2;
    sxy += (p.x - xbar) * (p.y - ybar);
  }
  const b1 = sxx > 0 ? sxy / sxx : 0;
  const b0 = ybar - b1 * xbar;
  const yhat = pts.map((p) => b0 + b1 * p.x);
  const residuals = pts.map((p, i) => p.y - yhat[i]);
  let rss = 0;
  let tss = 0;
  for (let i = 0; i < n; i++) {
    rss += residuals[i] ** 2;
    tss += (pts[i].y - ybar) ** 2;
  }
  const r2 = tss > 0 ? 1 - rss / tss : 0;
  const sigma2 = n > 2 ? rss / (n - 2) : rss / Math.max(1, n - 1);
  return { b0, b1, yhat, residuals, rss, tss, r2, xbar, ybar, sxx, sigma2 };
}

export function leverage(pts: Pt[], fit: OlsFit): number[] {
  const n = pts.length;
  return pts.map((p) => 1 / n + (p.x - fit.xbar) ** 2 / Math.max(fit.sxx, 1e-12));
}

export function cooksDistance(pts: Pt[], fit: OlsFit): number[] {
  const h = leverage(pts, fit);
  const p = 2;
  return pts.map((_, i) => {
    const e = fit.residuals[i];
    const hi = h[i];
    return (e * e * hi) / (p * Math.max(fit.sigma2, 1e-12) * (1 - hi) ** 2);
  });
}

/** Standardiserte residualer: e_i / (σ̂ · √(1 − h_ii)). */
export function standardizedResiduals(fit: OlsFit, h: number[]): number[] {
  const sigma = Math.sqrt(Math.max(fit.sigma2, 1e-12));
  return fit.residuals.map((e, i) => e / (sigma * Math.sqrt(Math.max(1 - h[i], 1e-9))));
}

/** Inverse normal CDF (probit) — Beasley–Springer–Moro approximation. */
export function probit(p: number): number {
  if (p <= 0) return -10;
  if (p >= 1) return 10;
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const plow = 0.02425;
  const phigh = 1 - plow;
  let q: number;
  let r: number;
  if (p < plow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  } else if (p <= phigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
        q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return (
    -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
}

/** Standardiserte residualer mot teoretiske kvantiler. */
export function qqPairs(stdResid: number[]): { theoretical: number; sample: number }[] {
  const sorted = [...stdResid].sort((x, y) => x - y);
  return sorted.map((r, i) => ({
    theoretical: probit((i + 0.5) / sorted.length),
    sample: r,
  }));
}

/** Pearson-korrelasjon mellom to like-lange vektorer. */
export function pearson(a: number[], b: number[]): number {
  const n = a.length;
  if (n === 0 || b.length !== n) return 0;
  const ma = a.reduce((s, v) => s + v, 0) / n;
  const mb = b.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  const den = Math.sqrt(da * db);
  return den > 0 ? num / den : 0;
}

/** Variance Inflation Factor for to prediktorer: VIF = 1 / (1 − r²(x1,x2)). */
export function vifTwo(x1: number[], x2: number[]): number {
  const r = pearson(x1, x2);
  const denom = 1 - r * r;
  return denom > 1e-9 ? 1 / denom : 1e9;
}

/** MSE = RSS / n. */
export function mse(fit: OlsFit): number {
  return fit.rss / Math.max(fit.residuals.length, 1);
}
