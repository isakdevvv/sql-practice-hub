// Felles helpers for modulær aritmetikk-komponentene.

/** True mathematical modulo: alltid i [0, n-1] for n > 0. */
export function mod(a: number, n: number): number {
  return ((a % n) + n) % n;
}

/** Euklids algoritme — returnerer gcd(|a|, |b|) som et positivt tall. */
export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

export interface EuclidStep {
  /** Iterasjons-rad: a = q·b + r. */
  a: number;
  b: number;
  q: number;
  r: number;
}

/** Trinn-for-trinn Euklids algoritme. Siste rad har b=0 og a=gcd. */
export function euclidSteps(a: number, b: number): EuclidStep[] {
  const steps: EuclidStep[] = [];
  let x = Math.abs(a);
  let y = Math.abs(b);
  // Sørg for at den største er a (gir ryddigere visning).
  if (y > x) [x, y] = [y, x];
  // Safety cap — burde aldri trigge for rimelige input.
  let guard = 0;
  while (y !== 0 && guard < 200) {
    const q = Math.trunc(x / y);
    const r = x - q * y;
    steps.push({ a: x, b: y, q, r });
    x = y;
    y = r;
    guard += 1;
  }
  // Avsluttende rad — gjør gcd eksplisitt.
  steps.push({ a: x, b: 0, q: 0, r: 0 });
  return steps;
}

export interface ExtendedEuclidResult {
  gcd: number;
  /** x og y slik at a·x + b·y = gcd(a, b). */
  x: number;
  y: number;
  steps: ExtendedEuclidStep[];
}

export interface ExtendedEuclidStep {
  a: number;
  b: number;
  q: number;
  r: number;
  /** s_i og t_i bak-substituert til (s, t) slik at s·a0 + t·b0 = r_i. */
  s: number;
  t: number;
}

/**
 * Extended Euclidean. Returnerer x, y slik at a*x + b*y = gcd(a, b).
 * Bygd som rekursiv stack-frem-så-bakover: vi lagrer kvotientene og bygger
 * (s, t) fra bunnen opp. Klassisk skolebok-form.
 */
export function extendedEuclid(a: number, b: number): ExtendedEuclidResult {
  // Operer på absoluttverdier, justér tegnet til slutt.
  const sa = Math.sign(a) || 1;
  const sb = Math.sign(b) || 1;
  let r0 = Math.abs(a);
  let r1 = Math.abs(b);

  // Standard EEA-rekurrens: (s, t) starter som (1, 0) og (0, 1).
  let s0 = 1;
  let s1 = 0;
  let t0 = 0;
  let t1 = 1;

  const steps: ExtendedEuclidStep[] = [];
  let guard = 0;
  while (r1 !== 0 && guard < 200) {
    const q = Math.trunc(r0 / r1);
    const r = r0 - q * r1;
    const sNew = s0 - q * s1;
    const tNew = t0 - q * t1;
    steps.push({ a: r0, b: r1, q, r, s: sNew, t: tNew });
    r0 = r1;
    r1 = r;
    s0 = s1;
    s1 = sNew;
    t0 = t1;
    t1 = tNew;
    guard += 1;
  }

  // Etter løkken: r0 = gcd, og (s0, t0) gir s0*|a| + t0*|b| = gcd.
  return {
    gcd: r0,
    x: s0 * sa,
    y: t0 * sb,
    steps,
  };
}

/**
 * Modulær invers a^(-1) mod n via Extended Euclidean.
 * Returnerer null hvis gcd(a, n) ≠ 1 (invers eksisterer ikke).
 */
export function modInverse(a: number, n: number): number | null {
  const aMod = mod(a, n);
  const { gcd: g, x } = extendedEuclid(aMod, n);
  if (g !== 1) return null;
  return mod(x, n);
}

/**
 * Chinese Remainder Theorem — løs systemet
 *   x ≡ a_i (mod n_i)
 * Krever at n_i er parvis koprime (gcd(n_i, n_j) = 1 for i ≠ j).
 * Returnerer x i [0, M-1] der M = Π n_i, eller en feilmelding.
 */
export interface CrtResult {
  ok: true;
  x: number;
  M: number;
  /** M_i = M / n_i for hver i. */
  Ms: number[];
  /** y_i = M_i^(-1) mod n_i. */
  ys: number[];
  /** Bidrag a_i · M_i · y_i. */
  contributions: number[];
}

export interface CrtError {
  ok: false;
  reason: string;
  /** Indekser som er ikke-koprime, eller null hvis annen feil. */
  badPair?: [number, number];
}

export function crtSolve(
  pairs: Array<{ a: number; n: number }>,
): CrtResult | CrtError {
  if (pairs.length === 0) return { ok: false, reason: "Ingen kongruenser." };
  for (let i = 0; i < pairs.length; i += 1) {
    if (pairs[i].n <= 1)
      return { ok: false, reason: `n_${i + 1} må være ≥ 2 (var ${pairs[i].n}).` };
  }
  // Parvis koprim-sjekk.
  for (let i = 0; i < pairs.length; i += 1) {
    for (let j = i + 1; j < pairs.length; j += 1) {
      const g = gcd(pairs[i].n, pairs[j].n);
      if (g !== 1) {
        return {
          ok: false,
          reason: `n_${i + 1} (${pairs[i].n}) og n_${j + 1} (${pairs[j].n}) er IKKE koprime — gcd = ${g}.`,
          badPair: [i, j],
        };
      }
    }
  }
  const M = pairs.reduce((acc, p) => acc * p.n, 1);
  const Ms: number[] = [];
  const ys: number[] = [];
  const contributions: number[] = [];
  let x = 0;
  for (let i = 0; i < pairs.length; i += 1) {
    const Mi = Math.trunc(M / pairs[i].n);
    const yi = modInverse(Mi, pairs[i].n);
    if (yi === null) {
      // Burde ikke skje gitt koprim-sjekken over, men vær defensiv.
      return {
        ok: false,
        reason: `Klarte ikke finne invers for M_${i + 1} = ${Mi} (mod ${pairs[i].n}).`,
      };
    }
    const aMod = mod(pairs[i].a, pairs[i].n);
    const contribution = aMod * Mi * yi;
    Ms.push(Mi);
    ys.push(yi);
    contributions.push(contribution);
    x += contribution;
  }
  return { ok: true, x: mod(x, M), M, Ms, ys, contributions };
}
