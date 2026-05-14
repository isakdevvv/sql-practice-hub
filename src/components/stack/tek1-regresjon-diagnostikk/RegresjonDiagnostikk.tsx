import { useMemo, useState } from "react";

type Scenario = "pent" | "ikke-linear" | "heteroskedastisk" | "outlier";

const N = 25;

// Deterministic-noise pseudo-RNG so the plot doesn't jitter on re-render.
function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
function randn(r: () => number): number {
  // Box–Muller
  const u1 = Math.max(r(), 1e-9);
  const u2 = r();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function dataFor(scenario: Scenario): { xs: number[]; ys: number[] } {
  const r = lcg(scenario === "pent" ? 7 : scenario === "ikke-linear" ? 13 : scenario === "heteroskedastisk" ? 23 : 31);
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < N; i++) {
    const x = (i / (N - 1)) * 10;
    let y: number;
    if (scenario === "pent") {
      y = 2 + 0.8 * x + 1.0 * randn(r);
    } else if (scenario === "ikke-linear") {
      y = 1 + 0.4 * x + 0.18 * (x - 5) * (x - 5) + 0.6 * randn(r);
    } else if (scenario === "heteroskedastisk") {
      y = 2 + 0.8 * x + (0.4 + x * 0.25) * randn(r);
    } else {
      // outlier scenario: clean linear + ONE extreme outlier
      y = 2 + 0.8 * x + 0.7 * randn(r);
      if (i === N - 2) y += 8; // big spike
    }
    xs.push(x);
    ys.push(y);
  }
  return { xs, ys };
}

function ols(xs: number[], ys: number[]): { a: number; b: number } {
  const n = xs.length;
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let sxx = 0,
    sxy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (xs[i] - mx) ** 2;
    sxy += (xs[i] - mx) * (ys[i] - my);
  }
  const b = sxy / sxx;
  const a = my - b * mx;
  return { a, b };
}

function r2(ys: number[], yhat: number[]): number {
  const my = ys.reduce((s, v) => s + v, 0) / ys.length;
  let sst = 0,
    sse = 0;
  for (let i = 0; i < ys.length; i++) {
    sst += (ys[i] - my) ** 2;
    sse += (ys[i] - yhat[i]) ** 2;
  }
  return 1 - sse / sst;
}

function r2adj(r2v: number, n: number, p: number): number {
  return 1 - (1 - r2v) * ((n - 1) / (n - p - 1));
}

/** Cook's distance for OLS with one predictor:
 *  D_i = (e_i / s)^2 * h_ii / (p (1 - h_ii)^2),  p = 2 (slope+intercept). */
function cooksDistances(xs: number[], ys: number[], a: number, b: number): number[] {
  const n = xs.length;
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  let sxx = 0;
  for (let i = 0; i < n; i++) sxx += (xs[i] - mx) ** 2;
  const resid: number[] = xs.map((x, i) => ys[i] - (a + b * x));
  const sse = resid.reduce((s, e) => s + e * e, 0);
  const sigma2 = sse / (n - 2);
  return xs.map((x, i) => {
    const h = 1 / n + (x - mx) ** 2 / sxx;
    const e = resid[i];
    return (e * e * h) / (2 * sigma2 * (1 - h) * (1 - h));
  });
}

/** Inverse normal CDF — Beasley-Springer-Moro approximation. */
function probit(p: number): number {
  if (p <= 0) return -10;
  if (p >= 1) return 10;
  const a = [
    -3.969683028665376e1,
    2.209460984245205e2,
    -2.759285104469687e2,
    1.38357751867269e2,
    -3.066479806614716e1,
    2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1,
    1.615858368580409e2,
    -1.556989798598866e2,
    6.680131188771972e1,
    -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3,
    -3.223964580411365e-1,
    -2.400758277161838,
    -2.549732539343734,
    4.374664141464968,
    2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3,
    3.224671290700398e-1,
    2.445134137142996,
    3.754408661907416,
  ];
  const plow = 0.02425;
  const phigh = 1 - plow;
  let q: number, r: number;
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

export function RegresjonDiagnostikk() {
  const [scenario, setScenario] = useState<Scenario>("pent");

  const { xs, ys, a, b, yhat, residuals, r2v, r2a, cookMax, cookIdxs, qq } =
    useMemo(() => {
      const { xs, ys } = dataFor(scenario);
      const { a, b } = ols(xs, ys);
      const yhat = xs.map((x) => a + b * x);
      const residuals = ys.map((y, i) => y - yhat[i]);
      const r2v = r2(ys, yhat);
      const r2a = r2adj(r2v, ys.length, 1);
      const cooks = cooksDistances(xs, ys, a, b);
      const cookMax = Math.max(...cooks);
      const cookThresh = 4 / xs.length;
      const cookIdxs = cooks
        .map((c, i) => (c > cookThresh ? i : -1))
        .filter((i) => i >= 0);

      // Q-Q plot: sort standardized residuals, plot against theoretical quantiles
      const sorted = [...residuals].sort((x, y) => x - y);
      const sd = Math.sqrt(
        residuals.reduce((s, v) => s + v * v, 0) / (residuals.length - 2),
      );
      const qq = sorted.map((r, i) => {
        const p = (i + 0.5) / sorted.length;
        return { x: probit(p), y: r / sd };
      });

      return { xs, ys, a, b, yhat, residuals, r2v, r2a, cookMax, cookIdxs, qq };
    }, [scenario]);

  const Pill = ({ s, label }: { s: Scenario; label: string }) => (
    <button
      onClick={() => setScenario(s)}
      className={`px-3 py-1 rounded-md text-xs font-mono border transition-colors ${
        scenario === s
          ? "border-brand bg-brand/10 text-foreground"
          : "border-border bg-background text-muted-foreground hover:border-brand/40"
      }`}
    >
      {label}
    </button>
  );

  // SVG dims
  const W = 280;
  const H = 200;
  const PAD = 30;

  // Bounds
  const xMin = Math.min(...xs) - 0.5;
  const xMax = Math.max(...xs) + 0.5;
  const yMin = Math.min(...ys) - 1;
  const yMax = Math.max(...ys) + 1;
  const sx = (v: number) => PAD + ((v - xMin) / (xMax - xMin)) * (W - 2 * PAD);
  const sy = (v: number) => H - PAD - ((v - yMin) / (yMax - yMin)) * (H - 2 * PAD);

  // Residual plot bounds
  const rMin = Math.min(...residuals) - 0.5;
  const rMax = Math.max(...residuals) + 0.5;
  const rExtent = Math.max(Math.abs(rMin), Math.abs(rMax));
  const yhMin = Math.min(...yhat) - 0.5;
  const yhMax = Math.max(...yhat) + 0.5;
  const sxR = (v: number) => PAD + ((v - yhMin) / (yhMax - yhMin)) * (W - 2 * PAD);
  const syR = (v: number) =>
    H - PAD - ((v + rExtent) / (2 * rExtent)) * (H - 2 * PAD);

  // QQ plot bounds
  const qqExtent = 3;
  const sxQ = (v: number) =>
    PAD + ((v + qqExtent) / (2 * qqExtent)) * (W - 2 * PAD);
  const syQ = (v: number) =>
    H - PAD - ((v + qqExtent) / (2 * qqExtent)) * (H - 2 * PAD);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="text-xs text-muted-foreground mr-2">Scenario:</div>
        <Pill s="pent" label="Pent (OK)" />
        <Pill s="ikke-linear" label="Ikke-lineær" />
        <Pill s="heteroskedastisk" label="Heteroskedastisk" />
        <Pill s="outlier" label="Med outlier" />
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {/* 1) Scatter + line */}
        <div className="rounded-lg border border-border bg-background p-2">
          <div className="text-xs font-semibold mb-1 text-center">
            Scatter + OLS-linje
          </div>
          <svg width={W} height={H} className="block mx-auto">
            <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#888" />
            <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#888" />
            {/* OLS line */}
            <line
              x1={sx(xMin)}
              y1={sy(a + b * xMin)}
              x2={sx(xMax)}
              y2={sy(a + b * xMax)}
              stroke="#3b82f6"
              strokeWidth={2}
            />
            {xs.map((x, i) => {
              const isOutlier = cookIdxs.includes(i);
              return (
                <circle
                  key={i}
                  cx={sx(x)}
                  cy={sy(ys[i])}
                  r={isOutlier ? 5 : 3}
                  fill={isOutlier ? "#f43f5e" : "#10b981"}
                  stroke={isOutlier ? "#fff" : "none"}
                  strokeWidth={isOutlier ? 1 : 0}
                />
              );
            })}
            <text
              x={W / 2}
              y={H - 5}
              textAnchor="middle"
              fontSize={9}
              fill="#888"
            >
              x
            </text>
            <text x={10} y={H / 2} fontSize={9} fill="#888">
              y
            </text>
          </svg>
          <div className="text-[10px] text-muted-foreground text-center font-mono">
            ŷ = {a.toFixed(2)} + {b.toFixed(2)} x
          </div>
        </div>

        {/* 2) Residual plot */}
        <div className="rounded-lg border border-border bg-background p-2">
          <div className="text-xs font-semibold mb-1 text-center">
            Residual vs ŷ
          </div>
          <svg width={W} height={H} className="block mx-auto">
            <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#888" />
            <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#888" />
            {/* zero line */}
            <line
              x1={PAD}
              y1={syR(0)}
              x2={W - PAD}
              y2={syR(0)}
              stroke="#f43f5e"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            {yhat.map((p, i) => {
              const isOutlier = cookIdxs.includes(i);
              return (
                <circle
                  key={i}
                  cx={sxR(p)}
                  cy={syR(residuals[i])}
                  r={isOutlier ? 4 : 2.5}
                  fill={isOutlier ? "#f43f5e" : "#3b82f6"}
                />
              );
            })}
            <text
              x={W / 2}
              y={H - 5}
              textAnchor="middle"
              fontSize={9}
              fill="#888"
            >
              ŷ (predikert)
            </text>
            <text x={10} y={H / 2} fontSize={9} fill="#888">
              e
            </text>
          </svg>
          <div className="text-[10px] text-muted-foreground text-center">
            Bra: random sky rundt 0
          </div>
        </div>

        {/* 3) QQ plot */}
        <div className="rounded-lg border border-border bg-background p-2">
          <div className="text-xs font-semibold mb-1 text-center">
            Q-Q plot (residualer)
          </div>
          <svg width={W} height={H} className="block mx-auto">
            <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#888" />
            <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#888" />
            {/* y = x reference */}
            <line
              x1={sxQ(-qqExtent)}
              y1={syQ(-qqExtent)}
              x2={sxQ(qqExtent)}
              y2={syQ(qqExtent)}
              stroke="#f59e0b"
              strokeDasharray="3 3"
            />
            {qq.map((p, i) => (
              <circle
                key={i}
                cx={sxQ(p.x)}
                cy={syQ(p.y)}
                r={2.5}
                fill="#3b82f6"
              />
            ))}
            <text
              x={W / 2}
              y={H - 5}
              textAnchor="middle"
              fontSize={9}
              fill="#888"
            >
              teoretisk kvantil
            </text>
            <text x={10} y={H / 2} fontSize={9} fill="#888">
              z
            </text>
          </svg>
          <div className="text-[10px] text-muted-foreground text-center">
            Bra: punkter på diagonalen
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
        <div className="rounded-lg border border-border bg-background p-2">
          <div className="text-muted-foreground">R²</div>
          <div className="text-lg font-bold">{r2v.toFixed(3)}</div>
        </div>
        <div className="rounded-lg border border-border bg-background p-2">
          <div className="text-muted-foreground">R²-adjusted</div>
          <div className="text-lg font-bold">{r2a.toFixed(3)}</div>
        </div>
        <div className="rounded-lg border border-border bg-background p-2">
          <div className="text-muted-foreground">Cooks D (max)</div>
          <div className="text-lg font-bold">{cookMax.toFixed(3)}</div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        {scenario === "pent" &&
          "Punktene ligger tilfeldig spredt rundt linja. Residualene danner en sky uten mønster, og Q-Q-plottet følger diagonalen. Antakelsene holder."}
        {scenario === "ikke-linear" &&
          "Scatteret kurver — OLS undertegner først, overskyter i midten, undertegner igjen til slutt. Residualplottet viser en tydelig U/∩-form: dette er signaturen for å trenge ikke-lineær modell (kvadratisk ledd, splines, eller bytte modell)."}
        {scenario === "heteroskedastisk" &&
          "Spredningen vokser med ŷ (trakt-form i residualplottet). Estimatet ̂β er fortsatt forventningsrett, men standardfeil og p-verdier er undervurdert. Fiks: weighted least squares eller transformer y (log)."}
        {scenario === "outlier" &&
          "Det er ett punkt langt over linja (markert rødt). Cook's distance fanger den — den drar β og inflaterer SSE. Undersøk om det er datafeil eller en ekte ekstrem observasjon."}
      </p>
      <p className="text-[10px] text-muted-foreground mt-1">
        Røde sirkler er punkter med Cook's distance over terskelen 4/n —
        diagnostisk skjell for «mistenkelig innflytelse».
      </p>
    </div>
  );
}
