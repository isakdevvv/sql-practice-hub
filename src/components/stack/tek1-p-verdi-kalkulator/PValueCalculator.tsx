import { useMemo, useState } from "react";

/**
 * PValueCalculator — beregn p-verdi for z/t/χ²/F tester med visualisering.
 */

type TestType = "z" | "t" | "chi2" | "f";

// ============ Shared math ============
function erf(x: number): number {
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
function normCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}
function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function lgamma(z: number): number {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}
function lbeta(a: number, b: number): number {
  return lgamma(a) + lgamma(b) - lgamma(a + b);
}

// Regularized incomplete beta I_x(a,b) via continued fraction
function betaCf(x: number, a: number, b: number): number {
  const MAX = 200;
  const EPS = 1e-12;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAX; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

function betainc(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(-lbeta(a, b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) return (bt * betaCf(x, a, b)) / a;
  return 1 - (bt * betaCf(1 - x, b, a)) / b;
}

// t CDF
function tCdf(t: number, df: number): number {
  const x = df / (df + t * t);
  const ib = 0.5 * betainc(x, df / 2, 0.5);
  return t >= 0 ? 1 - ib : ib;
}
function tPdf(t: number, df: number): number {
  const num = lgamma((df + 1) / 2) - lgamma(df / 2);
  const denom = 0.5 * Math.log(df * Math.PI);
  const body = -((df + 1) / 2) * Math.log(1 + (t * t) / df);
  return Math.exp(num - denom + body);
}

// chi2
function gammaP(a: number, x: number): number {
  if (x <= 0 || a <= 0) return 0;
  const gln = lgamma(a);
  if (x < a + 1) {
    let ap = a;
    let sum = 1 / a;
    let del = sum;
    for (let nn = 1; nn < 200; nn++) {
      ap += 1;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * 1e-12) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - gln);
  }
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
function chi2Cdf(x: number, df: number): number {
  return gammaP(df / 2, x / 2);
}
function chi2Pdf(x: number, df: number): number {
  if (x <= 0) return 0;
  const k = df / 2;
  return Math.exp((k - 1) * Math.log(x) - x / 2 - k * Math.log(2) - lgamma(k));
}

// F-dist CDF: I_{d1*x/(d1*x+d2)}(d1/2, d2/2)
function fCdf(x: number, d1: number, d2: number): number {
  if (x <= 0) return 0;
  return betainc((d1 * x) / (d1 * x + d2), d1 / 2, d2 / 2);
}
function fPdf(x: number, d1: number, d2: number): number {
  if (x <= 0) return 0;
  const a = (d1 / 2) * Math.log(d1) + (d2 / 2) * Math.log(d2);
  const b = (d1 / 2 - 1) * Math.log(x);
  const c = ((d1 + d2) / 2) * Math.log(d1 * x + d2);
  const lb = lbeta(d1 / 2, d2 / 2);
  return Math.exp(a + b - c - lb);
}

const TESTS: { id: TestType; label: string; needsDf: boolean; needsDf2: boolean }[] = [
  { id: "z", label: "z (Standard normal)", needsDf: false, needsDf2: false },
  { id: "t", label: "t (Student)", needsDf: true, needsDf2: false },
  { id: "chi2", label: "χ² (Kji-kvadrat)", needsDf: true, needsDf2: false },
  { id: "f", label: "F (Fisher)", needsDf: true, needsDf2: true },
];

export function PValueCalculator() {
  const [test, setTest] = useState<TestType>("z");
  const [stat, setStat] = useState(1.96);
  const [df1, setDf1] = useState(10);
  const [df2, setDf2] = useState(10);

  const result = useMemo(() => {
    if (test === "z") {
      const oneTailUpper = 1 - normCdf(stat);
      const oneTailLower = normCdf(stat);
      const twoTail = 2 * Math.min(oneTailUpper, oneTailLower);
      return { oneTailUpper, oneTailLower, twoTail, symmetric: true };
    }
    if (test === "t") {
      const cdf = tCdf(stat, df1);
      const oneTailUpper = 1 - cdf;
      const oneTailLower = cdf;
      const twoTail = 2 * Math.min(oneTailUpper, oneTailLower);
      return { oneTailUpper, oneTailLower, twoTail, symmetric: true };
    }
    if (test === "chi2") {
      const cdf = chi2Cdf(stat, df1);
      const oneTailUpper = 1 - cdf;
      return { oneTailUpper, oneTailLower: cdf, twoTail: NaN, symmetric: false };
    }
    // F
    const cdf = fCdf(stat, df1, df2);
    const oneTailUpper = 1 - cdf;
    return { oneTailUpper, oneTailLower: cdf, twoTail: NaN, symmetric: false };
  }, [test, stat, df1, df2]);

  // Plot
  const W = 360;
  const H = 220;
  const PAD = 35;

  const { pts, xMin, xMax, pdfMax } = useMemo(() => {
    let lo: number, hi: number, pdf: (x: number) => number;
    if (test === "z") {
      lo = -4;
      hi = 4;
      pdf = normPdf;
    } else if (test === "t") {
      lo = -4;
      hi = 4;
      pdf = (x) => tPdf(x, df1);
    } else if (test === "chi2") {
      lo = 0;
      hi = Math.max(20, df1 * 3, stat * 1.3);
      pdf = (x) => chi2Pdf(x, df1);
    } else {
      lo = 0;
      hi = Math.max(5, stat * 1.5);
      pdf = (x) => fPdf(x, df1, df2);
    }
    const N = 200;
    const arr: { x: number; pdf: number }[] = [];
    let mx = 0;
    for (let i = 0; i <= N; i++) {
      const x = lo + (i / N) * (hi - lo);
      const v = pdf(x);
      if (v > mx) mx = v;
      arr.push({ x, pdf: v });
    }
    return { pts: arr, xMin: lo, xMax: hi, pdfMax: mx * 1.1 };
  }, [test, df1, df2, stat]);

  const px = (x: number) => PAD + ((x - xMin) / (xMax - xMin)) * (W - 2 * PAD);
  const py = (v: number) => H - PAD - (v / pdfMax) * (H - 2 * PAD);

  // Tail shading depends on test
  const tailPath = useMemo(() => {
    const inRange = (x: number) => x >= xMin && x <= xMax;
    const above = pts.filter((d) => d.x >= stat && inRange(d.x));
    if (above.length < 2) return null;
    return `M ${px(above[0].x)} ${py(0)} ${above
      .map((d) => `L ${px(d.x)} ${py(d.pdf)}`)
      .join(" ")} L ${px(above[above.length - 1].x)} ${py(0)} Z`;
  }, [pts, stat, xMin, xMax]);

  const lowerTailPath = useMemo(() => {
    if (test !== "z" && test !== "t") return null;
    const below = pts.filter((d) => d.x <= -Math.abs(stat));
    if (below.length < 2) return null;
    return `M ${px(below[0].x)} ${py(0)} ${below
      .map((d) => `L ${px(d.x)} ${py(d.pdf)}`)
      .join(" ")} L ${px(below[below.length - 1].x)} ${py(0)} Z`;
  }, [pts, stat, test]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div>
        <div className="text-xs text-muted-foreground mb-1">Test-type</div>
        <div className="flex flex-wrap gap-1">
          {TESTS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTest(t.id)}
              className={`px-2.5 py-1 text-xs rounded border transition ${
                test === t.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 text-xs">
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground">Test-statistikk</span>
          <input
            type="number"
            step="0.01"
            value={stat}
            onChange={(e) => setStat(parseFloat(e.target.value) || 0)}
            className="rounded border border-border bg-background px-2 py-1 font-mono"
          />
        </label>
        {TESTS.find((t) => t.id === test)?.needsDf && (
          <label className="flex flex-col gap-1">
            <span className="text-muted-foreground">{test === "f" ? "df₁ (teller)" : "df"}</span>
            <input
              type="number"
              min={1}
              value={df1}
              onChange={(e) => setDf1(parseInt(e.target.value) || 1)}
              className="rounded border border-border bg-background px-2 py-1 font-mono"
            />
          </label>
        )}
        {TESTS.find((t) => t.id === test)?.needsDf2 && (
          <label className="flex flex-col gap-1">
            <span className="text-muted-foreground">df₂ (nevner)</span>
            <input
              type="number"
              min={1}
              value={df2}
              onChange={(e) => setDf2(parseInt(e.target.value) || 1)}
              className="rounded border border-border bg-background px-2 py-1 font-mono"
            />
          </label>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-semibold mb-1">Visualisering — rød hale er p-verdien</div>
          <svg width={W} height={H} className="block bg-background rounded">
            <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#888" />
            <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#888" />
            {tailPath && <path d={tailPath} fill="rgba(244,63,94,0.5)" />}
            {result.symmetric && lowerTailPath && (
              <path d={lowerTailPath} fill="rgba(244,63,94,0.25)" />
            )}
            <path
              d={pts
                .map((d, i) => `${i === 0 ? "M" : "L"} ${px(d.x)} ${py(d.pdf)}`)
                .join(" ")}
              fill="none"
              stroke="#22c55e"
              strokeWidth={2}
            />
            {/* statistikk-linje */}
            <line
              x1={px(stat)}
              y1={PAD}
              x2={px(stat)}
              y2={H - PAD}
              stroke="#facc15"
              strokeWidth={2}
              strokeDasharray="4 3"
            />
            <text x={px(stat)} y={PAD - 4} fontSize={9} fill="#facc15" textAnchor="middle">
              statistikk = {stat}
            </text>
            <text x={W / 2} y={H - 5} fontSize={10} fill="#888" textAnchor="middle">
              x
            </text>
          </svg>
        </div>

        <div className="text-xs space-y-2">
          <PValueCard
            label="Ensidig p (høyre hale)"
            value={result.oneTailUpper}
            formula={`P(X > ${stat})`}
          />
          {(test === "z" || test === "t") && (
            <>
              <PValueCard
                label="Ensidig p (venstre hale)"
                value={result.oneTailLower}
                formula={`P(X < ${stat})`}
              />
              <PValueCard
                label="Tosidig p"
                value={result.twoTail}
                formula={`2 · P(|X| > ${Math.abs(stat)})`}
                highlight
              />
            </>
          )}
          {(test === "chi2" || test === "f") && (
            <div className="rounded-lg border border-border bg-background p-2 text-[11px] text-muted-foreground">
              <strong>Merk:</strong> χ² og F er asymmetriske og brukes nesten
              alltid som ensidige høyre-haletester. «Tosidig» har ikke standard
              tolkning her.
            </div>
          )}

          <div className="rounded-lg border border-border bg-background p-2 text-[11px]">
            <div className="text-muted-foreground mb-1">Tolkning ved α = 0.05:</div>
            <div className={Math.min(result.oneTailUpper, result.twoTail || result.oneTailUpper) < 0.05 ? "text-rose-400" : "text-emerald-400"}>
              {Math.min(result.oneTailUpper, result.twoTail || result.oneTailUpper) < 0.05
                ? "Forkast H₀ — signifikant ved 5%"
                : "Behold H₀ — ikke signifikant ved 5%"}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        <strong>Eksamenstrigger:</strong> p-verdien er P(observerer noe minst
        så ekstremt som dette | H₀ er sann). Tosidig dobler den minste halen
        for symmetriske fordelinger. Forkast H₀ hvis p &lt; α.
      </p>
    </div>
  );
}

function PValueCard({
  label,
  value,
  formula,
  highlight,
}: {
  label: string;
  value: number;
  formula: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-border p-2 ${
        highlight ? "bg-brand/10" : "bg-background"
      }`}
    >
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="font-mono text-sm">
        {value < 0.0001 ? value.toExponential(3) : value.toFixed(5)}
      </div>
      <div className="text-[10px] text-muted-foreground font-mono">{formula}</div>
    </div>
  );
}
