// ---------------------------------------------------------------------------
// Ren inferens- og regresjonsmatematikk for TEK-1501 modul 4.
//
// Samme prinsipp som fordelinger.ts: alle fasitene i modul 4 skal kunne
// etterprøves ved å kalle funksjonene her, uten å rendre en eneste React-node
// (PLAN-HOST26-MODULER.md §3.1).
//
// Merk notasjonen som brukes gjennomgående, og som modulens symboltavle
// introduserer før den brukes:
//   x̄ (xStrek)  gjennomsnittet i utvalget
//   s            standardavviket i utvalget (delt på n − 1)
//   SE           standardfeilen, altså standardavviket til estimatoren
//   df           frihetsgrader
//   α (alfa)     signifikansnivået — vår villighet til å forkaste en sann H₀
// ---------------------------------------------------------------------------

import { lnGamma, normalCdf, normalKvantil } from "./fordelinger";

export { normalCdf, normalKvantil };

// --- t-fordelingen ---------------------------------------------------------

/** Kjedebrøken til den ufullstendige betafunksjonen (Lentz' metode). */
function betaKjedebrok(x: number, a: number, b: number): number {
  const eps = 3e-12;
  const fpmin = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < fpmin) d = fpmin;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin) d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin) d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < eps) break;
  }
  return h;
}

/** Regularisert ufullstendig betafunksjon I_x(a, b). */
export function betaInkomplett(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log1p(-x),
  );
  return x < (a + 1) / (a + b + 2)
    ? (bt * betaKjedebrok(x, a, b)) / a
    : 1 - (bt * betaKjedebrok(1 - x, b, a)) / b;
}

/** F(t) = P(T ≤ t) for Student-t med df frihetsgrader. */
export function tCdf(t: number, df: number): number {
  const x = df / (df + t * t);
  const halv = 0.5 * betaInkomplett(x, df / 2, 0.5);
  return t > 0 ? 1 - halv : halv;
}

/** Invers t-fordeling: finner t slik at P(T ≤ t) = p. Ren halvering, rikelig presis. */
export function tKvantil(p: number, df: number): number {
  if (p <= 0 || p >= 1) return NaN;
  let lav = -200;
  let hoy = 200;
  for (let i = 0; i < 200; i++) {
    const midt = (lav + hoy) / 2;
    if (tCdf(midt, df) < p) lav = midt;
    else hoy = midt;
  }
  return (lav + hoy) / 2;
}

/** Kritisk t-verdi for et tosidig intervall/test på nivå α, f.eks. t₀,₀₂₅ ved α = 0,05. */
export function tKritiskTosidig(alfa: number, df: number): number {
  return tKvantil(1 - alfa / 2, df);
}

/** Kritisk z-verdi for et tosidig intervall på nivå α. α = 0,05 gir 1,95996. */
export function zKritiskTosidig(alfa: number): number {
  return normalKvantil(1 - alfa / 2);
}

// --- Konfidensintervall og t-test for et gjennomsnitt ----------------------

export type Intervall = {
  estimat: number;
  standardfeil: number;
  kritiskVerdi: number;
  /** Halvbredden: kritisk verdi · standardfeil. Det er dette «± …» er. */
  feilmargin: number;
  nedre: number;
  ovre: number;
  /** "t" når σ er ukjent og estimert med s, "z" når σ er kjent. */
  fordeling: "t" | "z";
  df: number | null;
};

/**
 * Konfidensintervall for populasjonsgjennomsnittet μ.
 *
 * Er σ ukjent (det vanlige) estimerer vi den med s og bruker t-fordelingen med
 * n − 1 frihetsgrader. Er σ kjent utenfra, brukes z. Forskjellen er merkbar for
 * små n: t er bredere, nettopp fordi vi har måttet gjette på σ også.
 */
export function konfidensintervallMy(opts: {
  xStrek: number;
  n: number;
  /** Utvalgsstandardavviket s (delt på n − 1). Utelates hvis sigma er kjent. */
  s?: number;
  /** Kjent populasjonsstandardavvik σ. Overstyrer s. */
  sigma?: number;
  /** Konfidensnivå som andel, f.eks. 0,95. */
  niva?: number;
}): Intervall {
  const { xStrek, n, s, sigma, niva = 0.95 } = opts;
  const alfa = 1 - niva;
  const brukZ = sigma != null;
  const spredning = brukZ ? (sigma as number) : (s as number);
  const se = spredning / Math.sqrt(n);
  const df = brukZ ? null : n - 1;
  const kritisk = brukZ ? zKritiskTosidig(alfa) : tKritiskTosidig(alfa, n - 1);
  const margin = kritisk * se;
  return {
    estimat: xStrek,
    standardfeil: se,
    kritiskVerdi: kritisk,
    feilmargin: margin,
    nedre: xStrek - margin,
    ovre: xStrek + margin,
    fordeling: brukZ ? "z" : "t",
    df,
  };
}

export type TestResultat = {
  /** Testobservatoren: hvor mange standardfeil estimatet ligger fra H₀-verdien. */
  observator: number;
  df: number | null;
  pVerdi: number;
  standardfeil: number;
  fordeling: "t" | "z";
};

/**
 * Ett-utvalgs t-test av H₀: μ = μ₀.
 * `side` styrer alternativhypotesen: "tosidig" (μ ≠ μ₀), "hoyre" (μ > μ₀),
 * "venstre" (μ < μ₀).
 */
export function tTestEttUtvalg(opts: {
  xStrek: number;
  s: number;
  n: number;
  my0: number;
  side?: "tosidig" | "hoyre" | "venstre";
}): TestResultat {
  const { xStrek, s, n, my0, side = "tosidig" } = opts;
  const se = s / Math.sqrt(n);
  const t = (xStrek - my0) / se;
  const df = n - 1;
  const p =
    side === "tosidig"
      ? 2 * (1 - tCdf(Math.abs(t), df))
      : side === "hoyre"
        ? 1 - tCdf(t, df)
        : tCdf(t, df);
  return { observator: t, df, pVerdi: p, standardfeil: se, fordeling: "t" };
}

/** z-test av H₀: μ = μ₀ når σ er kjent. */
export function zTestEttUtvalg(opts: {
  xStrek: number;
  sigma: number;
  n: number;
  my0: number;
  side?: "tosidig" | "hoyre" | "venstre";
}): TestResultat {
  const { xStrek, sigma, n, my0, side = "tosidig" } = opts;
  const se = sigma / Math.sqrt(n);
  const z = (xStrek - my0) / se;
  const p =
    side === "tosidig"
      ? 2 * (1 - normalCdf(Math.abs(z)))
      : side === "hoyre"
        ? 1 - normalCdf(z)
        : normalCdf(z);
  return { observator: z, df: null, pVerdi: p, standardfeil: se, fordeling: "z" };
}

// --- Proporsjoner ----------------------------------------------------------

/**
 * Wald-konfidensintervall for en andel p, bygget på p̂ = x/n.
 * Tommelfingerregelen for at normaltilnærmingen holder: n·p̂ ≥ 10 og n(1−p̂) ≥ 10.
 */
export function proporsjonWaldCi(x: number, n: number, niva = 0.95): Intervall {
  const pHatt = x / n;
  const se = Math.sqrt((pHatt * (1 - pHatt)) / n);
  const z = zKritiskTosidig(1 - niva);
  const margin = z * se;
  return {
    estimat: pHatt,
    standardfeil: se,
    kritiskVerdi: z,
    feilmargin: margin,
    nedre: pHatt - margin,
    ovre: pHatt + margin,
    fordeling: "z",
    df: null,
  };
}

/**
 * Ett-utvalgs z-test for en andel, H₀: p = p₀.
 * Merk at standardfeilen her bygges på p₀, ikke på p̂ — under H₀ er p₀ det vi
 * antar er sant, og da er det p₀ som bestemmer spredningen.
 */
export function proporsjonZTest(opts: {
  x: number;
  n: number;
  p0: number;
  side?: "tosidig" | "hoyre" | "venstre";
}): TestResultat {
  const { x, n, p0, side = "tosidig" } = opts;
  const pHatt = x / n;
  const se = Math.sqrt((p0 * (1 - p0)) / n);
  const z = (pHatt - p0) / se;
  const p =
    side === "tosidig"
      ? 2 * (1 - normalCdf(Math.abs(z)))
      : side === "hoyre"
        ? 1 - normalCdf(z)
        : normalCdf(z);
  return { observator: z, df: null, pVerdi: p, standardfeil: se, fordeling: "z" };
}

// --- Enkel lineær regresjon ------------------------------------------------

export type Regresjon = {
  /** Konstantleddet β̂₀ — der linja krysser y-aksen. */
  b0: number;
  /** Stigningstallet β̂₁ — hvor mye ŷ endrer seg når x øker med 1. */
  b1: number;
  /** Pearsons r, korrelasjonen mellom x og y. */
  r: number;
  /** R² = andel av variasjonen i y som modellen forklarer. Her r². */
  r2: number;
  ssTot: number;
  ssRes: number;
  /** Restspredningen s, altså typisk avstand fra punkt til linje. */
  sRest: number;
  /** Standardfeilen til stigningstallet. */
  seB1: number;
  /** Testobservator for H₀: β₁ = 0. */
  tB1: number;
  pB1: number;
  df: number;
  residualer: number[];
};

/** Minste kvadraters metode for én forklaringsvariabel. */
export function lineaerRegresjon(xs: number[], ys: number[]): Regresjon {
  const n = xs.length;
  const xBar = xs.reduce((a, b) => a + b, 0) / n;
  const yBar = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - xBar) * (ys[i] - yBar);
    sxx += (xs[i] - xBar) ** 2;
    syy += (ys[i] - yBar) ** 2;
  }
  const b1 = sxy / sxx;
  const b0 = yBar - b1 * xBar;
  const residualer = ys.map((y, i) => y - (b0 + b1 * xs[i]));
  const ssRes = residualer.reduce((a, e) => a + e * e, 0);
  const df = n - 2;
  const sRest = Math.sqrt(ssRes / df);
  const seB1 = sRest / Math.sqrt(sxx);
  const t = b1 / seB1;
  const r = sxy / Math.sqrt(sxx * syy);
  return {
    b0,
    b1,
    r,
    r2: r * r,
    ssTot: syy,
    ssRes,
    sRest,
    seB1,
    tB1: t,
    pB1: 2 * (1 - tCdf(Math.abs(t), df)),
    df,
    residualer,
  };
}

/** R² regnet direkte fra kvadratsummene, slik eksamensoppgaver ofte oppgir dem. */
export function r2FraKvadratsummer(ssRes: number, ssTot: number): number {
  return 1 - ssRes / ssTot;
}

// --- Feilrater og styrke ---------------------------------------------------

/**
 * Sannsynligheten for MINST ett falskt funn når m uavhengige tester kjøres på
 * nivå α og alle nullhypotesene er sanne: 1 − (1 − α)^m.
 *
 * Dette ene tallet er hele begrunnelsen for at multiple sammenligninger må
 * korrigeres. Med m = 20 og α = 0,05 er det over 64 %.
 */
export function familievisFeilrate(alfa: number, m: number): number {
  return 1 - (1 - alfa) ** m;
}

/** Bonferroni-korrigert nivå per test: α/m. */
export function bonferroni(alfa: number, m: number): number {
  return alfa / m;
}

/**
 * Styrken (1 − β) til en tosidig z-test for et gjennomsnitt, når den sanne
 * forskjellen fra H₀-verdien er `effekt` målt i samme enhet som σ.
 */
export function styrkeZTest(opts: {
  effekt: number;
  sigma: number;
  n: number;
  alfa?: number;
}): number {
  const { effekt, sigma, n, alfa = 0.05 } = opts;
  const se = sigma / Math.sqrt(n);
  const kritisk = zKritiskTosidig(alfa) * se;
  // Sannsynlighet for å havne utenfor forkastningsgrensene når sannheten er `effekt`.
  return normalCdf(-kritisk, effekt, se) + (1 - normalCdf(kritisk, effekt, se));
}
