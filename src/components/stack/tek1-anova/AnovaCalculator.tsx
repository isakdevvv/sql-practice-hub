import { useMemo, useState } from "react";
import { Tex } from "@/components/Tex";

// ---------- statistikk-helpers ----------
function gaussian(mu: number, sigma: number): number {
  const u1 = Math.max(1e-9, Math.random());
  const u2 = Math.random();
  return mu + sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// log-gamma via Stirling-approks (Lanczos)
function logGamma(x: number): number {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

// Regularized incomplete beta I_x(a,b) via continued fraction (Numerical Recipes)
function betacf(a: number, b: number, x: number): number {
  const MAXIT = 200;
  const EPS = 3e-7;
  const FPMIN = 1e-30;
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

function regIncBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbt =
    logGamma(a + b) -
    logGamma(a) -
    logGamma(b) +
    a * Math.log(x) +
    b * Math.log(1 - x);
  const bt = Math.exp(lbt);
  if (x < (a + 1) / (a + b + 2)) return (bt * betacf(a, b, x)) / a;
  return 1 - (bt * betacf(b, a, 1 - x)) / b;
}

// p-verdi for F(df1, df2): P(F >= f)
function fSurvival(f: number, df1: number, df2: number): number {
  if (f <= 0) return 1;
  // I_{df2/(df2+df1*f)}(df2/2, df1/2)
  const x = df2 / (df2 + df1 * f);
  return regIncBeta(x, df2 / 2, df1 / 2);
}

type Group = {
  label: string;
  mu: number;
  sigma: number;
  n: number;
  color: string;
  data: number[];
};

function makeGroup(label: string, mu: number, sigma: number, n: number, color: string): Group {
  const data: number[] = [];
  for (let i = 0; i < n; i++) data.push(gaussian(mu, sigma));
  return { label, mu, sigma, n, color, data };
}

export function AnovaCalculator() {
  const [seed, setSeed] = useState(0);
  const [groups, setGroups] = useState<Group[]>(() => [
    makeGroup("A", 100, 5, 10, "hsl(220 70% 55%)"),
    makeGroup("B", 102, 5, 10, "hsl(140 60% 45%)"),
    makeGroup("C", 105, 5, 10, "hsl(30 90% 55%)"),
    makeGroup("D", 103, 5, 10, "hsl(280 65% 55%)"),
  ]);

  function regen(i: number, patch: Partial<Group>) {
    setGroups((g) => {
      const next = [...g];
      const merged: Group = { ...next[i], ...patch };
      // regenerer data hvis mu/sigma/n endrer seg
      if (
        patch.mu !== undefined ||
        patch.sigma !== undefined ||
        patch.n !== undefined
      ) {
        merged.data = [];
        for (let k = 0; k < merged.n; k++) merged.data.push(gaussian(merged.mu, merged.sigma));
      }
      next[i] = merged;
      return next;
    });
  }

  function reshuffle() {
    setSeed((s) => s + 1);
    setGroups((g) =>
      g.map((gr) => {
        const data: number[] = [];
        for (let k = 0; k < gr.n; k++) data.push(gaussian(gr.mu, gr.sigma));
        return { ...gr, data };
      }),
    );
  }
  void seed;

  // ANOVA-beregninger
  const stats = useMemo(() => {
    const k = groups.length;
    let N = 0;
    let grandSum = 0;
    for (const gr of groups) {
      N += gr.data.length;
      for (const v of gr.data) grandSum += v;
    }
    const grandMean = grandSum / N;
    let ssBetween = 0;
    let ssWithin = 0;
    const groupMeans: number[] = [];
    for (const gr of groups) {
      const n = gr.data.length;
      const mean = gr.data.reduce((a, b) => a + b, 0) / n;
      groupMeans.push(mean);
      ssBetween += n * (mean - grandMean) ** 2;
      for (const v of gr.data) ssWithin += (v - mean) ** 2;
    }
    const dfBetween = k - 1;
    const dfWithin = N - k;
    const msBetween = ssBetween / dfBetween;
    const msWithin = ssWithin / dfWithin;
    const F = msBetween / msWithin;
    const ssTotal = ssBetween + ssWithin;
    const pValue = fSurvival(F, dfBetween, dfWithin);
    return {
      k, N, grandMean, ssBetween, ssWithin, ssTotal, dfBetween, dfWithin,
      msBetween, msWithin, F, pValue, groupMeans,
    };
  }, [groups]);

  // Plot-grenser
  const allValues = groups.flatMap((g) => g.data);
  const lo = Math.min(...allValues) - 2;
  const hi = Math.max(...allValues) + 2;
  const W = 540;
  const H = 220;
  const padL = 40;
  const padR = 10;
  const padT = 10;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const xOf = (i: number) =>
    padL + ((i + 0.5) / groups.length) * plotW;
  const yOf = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * plotH;

  // SS-bars
  const totalSS = stats.ssTotal || 1;
  const betweenPct = (stats.ssBetween / totalSS) * 100;
  const withinPct = (stats.ssWithin / totalSS) * 100;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          ANOVA-kalkulator — 4 grupper
        </div>
        <button
          onClick={reshuffle}
          className="rounded border border-border bg-background px-2.5 py-1 text-xs hover:border-brand/40"
        >
          Trekk nye stikkprøver
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {groups.map((g, i) => (
          <div key={g.label} className="rounded-lg border border-border p-3 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: g.color }}
              />
              <span className="font-mono font-semibold">Gruppe {g.label}</span>
              <span className="text-muted-foreground ml-auto">
                <Tex>{`\\bar{x} = ${stats.groupMeans[i].toFixed(2)}`}</Tex>
              </span>
            </div>
            <label className="block">
              <span className="block text-muted-foreground mb-0.5">
                <Tex>{"\\mu"}</Tex> = {g.mu.toFixed(1)}
              </span>
              <input
                type="range"
                min={90}
                max={115}
                step={0.5}
                value={g.mu}
                onChange={(e) => regen(i, { mu: Number(e.target.value) })}
                className="w-full"
              />
            </label>
            <label className="block">
              <span className="block text-muted-foreground mb-0.5">
                <Tex>{"\\sigma"}</Tex> = {g.sigma.toFixed(1)}
              </span>
              <input
                type="range"
                min={1}
                max={15}
                step={0.5}
                value={g.sigma}
                onChange={(e) => regen(i, { sigma: Number(e.target.value) })}
                className="w-full"
              />
            </label>
            <label className="block">
              <span className="block text-muted-foreground mb-0.5">
                n = {g.n}
              </span>
              <input
                type="range"
                min={4}
                max={30}
                step={1}
                value={g.n}
                onChange={(e) => regen(i, { n: Number(e.target.value) })}
                className="w-full"
              />
            </label>
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full border border-border rounded bg-background">
        {/* y-akse */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const v = lo + t * (hi - lo);
          return (
            <g key={t}>
              <line
                x1={padL}
                y1={yOf(v)}
                x2={padL + plotW}
                y2={yOf(v)}
                stroke="hsl(0 0% 90%)"
                strokeWidth={0.5}
              />
              <text x={padL - 4} y={yOf(v) + 3} textAnchor="end" fontSize={9} fill="hsl(0 0% 50%)">
                {v.toFixed(0)}
              </text>
            </g>
          );
        })}
        {/* grand mean line */}
        <line
          x1={padL}
          y1={yOf(stats.grandMean)}
          x2={padL + plotW}
          y2={yOf(stats.grandMean)}
          stroke="hsl(0 0% 50%)"
          strokeDasharray="4 3"
          strokeWidth={1}
        />
        <text
          x={padL + plotW - 4}
          y={yOf(stats.grandMean) - 3}
          textAnchor="end"
          fontSize={9}
          fill="hsl(0 0% 40%)"
        >
          grand mean = {stats.grandMean.toFixed(2)}
        </text>
        {/* gruppe-stripeplot */}
        {groups.map((g, i) => {
          const cx = xOf(i);
          return (
            <g key={g.label}>
              {g.data.map((v, j) => (
                <circle
                  key={j}
                  cx={cx + (j % 3 - 1) * 4}
                  cy={yOf(v)}
                  r={3}
                  fill={g.color}
                  fillOpacity={0.6}
                  stroke="white"
                  strokeWidth={0.5}
                />
              ))}
              {/* group mean */}
              <line
                x1={cx - 18}
                y1={yOf(stats.groupMeans[i])}
                x2={cx + 18}
                y2={yOf(stats.groupMeans[i])}
                stroke={g.color}
                strokeWidth={2.5}
              />
              <text x={cx} y={H - 8} textAnchor="middle" fontSize={10} fill="hsl(0 0% 35%)">
                {g.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* SS-decomposition-bar */}
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
          SS-dekomponering
        </div>
        <div className="flex h-6 w-full overflow-hidden rounded border border-border">
          <div
            className="flex items-center justify-center text-xs font-mono text-white"
            style={{ width: `${betweenPct}%`, background: "hsl(220 70% 45%)" }}
            title="SS_between"
          >
            {betweenPct >= 12 ? `between ${betweenPct.toFixed(0)}%` : ""}
          </div>
          <div
            className="flex items-center justify-center text-xs font-mono text-white"
            style={{ width: `${withinPct}%`, background: "hsl(30 80% 50%)" }}
            title="SS_within"
          >
            {withinPct >= 12 ? `within ${withinPct.toFixed(0)}%` : ""}
          </div>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Stor between/total ⇒ gruppemiddelene ligger langt fra hverandre ⇒ stort F.
        </div>
      </div>

      {/* ANOVA-tabell */}
      <div className="rounded-lg border border-border bg-background overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-3 py-2">Kilde</th>
              <th className="text-right px-3 py-2">SS</th>
              <th className="text-right px-3 py-2">df</th>
              <th className="text-right px-3 py-2">MS</th>
              <th className="text-right px-3 py-2">F</th>
              <th className="text-right px-3 py-2">p-verdi</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td className="px-3 py-2">Between</td>
              <td className="text-right px-3 py-2">{stats.ssBetween.toFixed(2)}</td>
              <td className="text-right px-3 py-2">{stats.dfBetween}</td>
              <td className="text-right px-3 py-2">{stats.msBetween.toFixed(2)}</td>
              <td className="text-right px-3 py-2 text-brand">{stats.F.toFixed(3)}</td>
              <td
                className={
                  "text-right px-3 py-2 font-semibold " +
                  (stats.pValue < 0.05 ? "text-emerald-400" : "text-muted-foreground")
                }
              >
                {stats.pValue < 1e-4 ? "<0.0001" : stats.pValue.toFixed(4)}
              </td>
            </tr>
            <tr className="border-t border-border">
              <td className="px-3 py-2">Within</td>
              <td className="text-right px-3 py-2">{stats.ssWithin.toFixed(2)}</td>
              <td className="text-right px-3 py-2">{stats.dfWithin}</td>
              <td className="text-right px-3 py-2">{stats.msWithin.toFixed(2)}</td>
              <td className="text-right px-3 py-2" />
              <td className="text-right px-3 py-2" />
            </tr>
            <tr className="border-t border-border bg-muted/20">
              <td className="px-3 py-2 font-semibold">Total</td>
              <td className="text-right px-3 py-2">{stats.ssTotal.toFixed(2)}</td>
              <td className="text-right px-3 py-2">{stats.N - 1}</td>
              <td className="text-right px-3 py-2" />
              <td className="text-right px-3 py-2" />
              <td className="text-right px-3 py-2" />
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted-foreground">
        Konklusjon ved <Tex>{"\\alpha = 0.05"}</Tex>:{" "}
        {stats.pValue < 0.05 ? (
          <span className="text-emerald-400 font-semibold">
            forkast H₀ — minst ett gruppemiddel skiller seg.
          </span>
        ) : (
          <span>behold H₀ — ikke nok bevis for forskjell.</span>
        )}
      </div>
    </div>
  );
}
