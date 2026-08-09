// ---------------------------------------------------------------------------
// Ren fordelings-matematikk for TEK-1501 modul 3.
//
// PLAN-HOST26-MODULER.md §3.1: ny logikk legges i rene .ts-filer utenfor React,
// slik at tallene i oppgavene kan etterprøves uten å rendre noe. Alle fasitene i
// modul 3 er regnet ut med funksjonene her, ikke skrevet inn for hånd.
//
// Merk at repoet allerede har fordelings-matte i
// `src/components/stack/tek1-fordelinger/distUtils.ts`. Den er koblet til
// plotte-komponentene og eies av andre sesjoner; denne fila er bevisst
// frittstående og liten, slik at modulene ikke arver endringer i en fil som
// bygges om parallelt.
// ---------------------------------------------------------------------------

/** ln(n!) via ln Γ(n+1) — stabil for store n der n! selv flyter over. */
export function lnFakultet(n: number): number {
  return lnGamma(n + 1);
}

/**
 * Lanczos-approksimasjon til ln Γ(x). Nøyaktig til ~15 siffer for x > 0, som er
 * langt mer enn oppgavene her trenger.
 */
export function lnGamma(x: number): number {
  const g = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) {
    // Refleksjonsformelen, så vi slipper å håndtere små x direkte.
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  }
  const z = x - 1;
  let a = 0.99999999999980993;
  for (let i = 0; i < g.length; i++) a += g[i] / (z + i + 1);
  const t = z + g.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(a);
}

/** Binomialkoeffisienten «n over k». Regnet i log-rom for å tåle store n. */
export function binomKoeff(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  return Math.round(Math.exp(lnFakultet(n) - lnFakultet(k) - lnFakultet(n - k)));
}

// --- Diskrete fordelinger --------------------------------------------------

/** P(X = k) når X ~ binomisk(n, p): antall suksesser i n uavhengige forsøk. */
export function binomPmf(k: number, n: number, p: number): number {
  if (k < 0 || k > n) return 0;
  if (p <= 0) return k === 0 ? 1 : 0;
  if (p >= 1) return k === n ? 1 : 0;
  const lnP = lnFakultet(n) - lnFakultet(k) - lnFakultet(n - k) + k * Math.log(p) + (n - k) * Math.log1p(-p);
  return Math.exp(lnP);
}

/** P(X ≤ k) for binomisk(n, p). */
export function binomCdf(k: number, n: number, p: number): number {
  let sum = 0;
  const ovre = Math.min(Math.floor(k), n);
  for (let i = 0; i <= ovre; i++) sum += binomPmf(i, n, p);
  return Math.min(1, sum);
}

/** P(X = k) når X ~ Poisson(λ): antall hendelser i et intervall med rate λ. */
export function poissonPmf(k: number, lambda: number): number {
  if (k < 0) return 0;
  return Math.exp(-lambda + k * Math.log(lambda) - lnFakultet(k));
}

/** P(X ≤ k) for Poisson(λ). */
export function poissonCdf(k: number, lambda: number): number {
  let sum = 0;
  for (let i = 0; i <= Math.floor(k); i++) sum += poissonPmf(i, lambda);
  return Math.min(1, sum);
}

/**
 * P(X = k) for hypergeometrisk: n trekk UTEN tilbakelegging fra en populasjon på
 * N der K er «suksesser». Forskjellen fra binomisk er nettopp tilbakeleggingen.
 */
export function hypergeomPmf(k: number, N: number, K: number, n: number): number {
  if (k < 0 || k > n || k > K || n - k > N - K) return 0;
  return (binomKoeff(K, k) * binomKoeff(N - K, n - k)) / binomKoeff(N, n);
}

/** E[X] og Var(X) for en diskret fordeling gitt som verdier + sannsynligheter. */
export function diskreteMomenter(
  verdier: number[],
  sannsynligheter: number[],
): { forventning: number; varians: number; standardavvik: number } {
  let e = 0;
  let e2 = 0;
  for (let i = 0; i < verdier.length; i++) {
    e += verdier[i] * sannsynligheter[i];
    e2 += verdier[i] ** 2 * sannsynligheter[i];
  }
  const v = e2 - e * e;
  return { forventning: e, varians: v, standardavvik: Math.sqrt(Math.max(0, v)) };
}

// --- Normalfordelingen -----------------------------------------------------

/** Abramowitz–Stegun 7.1.26 for feilfunksjonen. Absolutt feil < 1,5·10⁻⁷. */
export function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const a = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * a);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-a * a);
  return sign * y;
}

/** Tettheten f(x) til N(μ, σ²). Merk: dette er IKKE en sannsynlighet. */
export function normalPdf(x: number, my = 0, sigma = 1): number {
  const z = (x - my) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

/** F(x) = P(X ≤ x) for N(μ, σ²). For μ=0, σ=1 er dette z-tabellen. */
export function normalCdf(x: number, my = 0, sigma = 1): number {
  return 0.5 * (1 + erf((x - my) / (sigma * Math.SQRT2)));
}

/** Z = (x − μ)/σ — antall standardavvik x ligger fra forventningen. */
export function standardiser(x: number, my: number, sigma: number): number {
  return (x - my) / sigma;
}

/**
 * Invers standardnormal: finner z slik at P(Z ≤ z) = p. Acklams algoritme,
 * forfinet med ett Newton-steg. Brukes til kritiske verdier (z = 1,96 osv.).
 */
export function normalKvantil(p: number): number {
  if (p <= 0 || p >= 1) return NaN;
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pLav = 0.02425;
  let x: number;
  if (p < pLav) {
    const q = Math.sqrt(-2 * Math.log(p));
    x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= 1 - pLav) {
    const q = p - 0.5;
    const r = q * q;
    x = ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  // Ett Newton-steg mot den nøyaktige CDF-en fjerner restfeilen fra approksimasjonen.
  const e = normalCdf(x) - p;
  const u = e * Math.sqrt(2 * Math.PI) * Math.exp((x * x) / 2);
  return x - u / (1 + (x * u) / 2);
}

// --- Sentralgrenseteoremet -------------------------------------------------

/**
 * Standardavviket til gjennomsnittet X̄ av n uavhengige observasjoner: σ/√n.
 * Dette er hele CLT-regnestykket i praksis — X̄ er omtrent N(μ, σ²/n).
 */
export function standardfeilAvGjennomsnitt(sigma: number, n: number): number {
  return sigma / Math.sqrt(n);
}

/** P(X̄ ≤ grense) under CLT, gitt populasjonens μ og σ og utvalgsstørrelsen n. */
export function cltSannsynlighet(grense: number, my: number, sigma: number, n: number): number {
  return normalCdf(grense, my, standardfeilAvGjennomsnitt(sigma, n));
}
