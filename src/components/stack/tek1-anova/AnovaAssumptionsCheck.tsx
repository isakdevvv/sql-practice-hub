import { useMemo, useState } from "react";
import { Tex } from "@/components/Tex";

// --------------------------------------------------------------------------
// AnovaAssumptionsCheck
//
// Tre antagelser, hver med visuell og tallbasert diagnostikk:
//   1. Normalitet innen hver gruppe — Q-Q plot per gruppe
//   2. Homoscedasticity — residual vs fitted + Levene's test (mean-form)
//   3. Uavhengighet — pedagogisk diskusjon (designkrav, ikke en plot-sjekk)
//
// Brukeren velger mellom 4 scenarier som demonstrerer:
//   - alle antagelser oppfylt
//   - ujevn varians
//   - ikke-normalfordeling (høyreskjev / outliers)
//   - tidsavhengig serie (uavhengighetsbrudd)
//
// Hvert scenario inkluderer alternativ-test-anbefaling.
// --------------------------------------------------------------------------

// Box-Muller for normalfordeling
function gaussian(mu: number, sigma: number): number {
  const u1 = Math.max(1e-9, Math.random());
  const u2 = Math.random();
  return mu + sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Eksponensial-utfall til å lage høyreskjev fordeling
function rexp(rate: number): number {
  return -Math.log(1 - Math.random()) / rate;
}

// Normalfordeling inverse CDF (Beasley-Springer)
function normInv(p: number): number {
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
  if (p < plow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p <= phigh) {
    const q = p - 0.5;
    const r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
      q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  const q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

type Scenario = "ok" | "unequal-var" | "skewed" | "dependent";

const SCENARIOS: Array<{ id: Scenario; label: string; problem: string; fix: string }> = [
  {
    id: "ok",
    label: "Alt OK",
    problem: "Normalfordelt innen hver gruppe, lik varians, uavhengige obs.",
    fix: "Bruk standard én-faktor ANOVA.",
  },
  {
    id: "unequal-var",
    label: "Ujevn varians",
    problem:
      "Gruppe A har σ ≈ 2, gruppe C har σ ≈ 6. Levene's test forkaster H₀: σ₁² = σ₂² = σ₃².",
    fix:
      "Welch's ANOVA (scipy: `pingouin.welch_anova`), evt. log-transformasjon hvis spredning skalerer med snitt.",
  },
  {
    id: "skewed",
    label: "Skjev fordeling",
    problem:
      "Gruppene er høyreskjeve (eksponensial-aktige). Q-Q-plot avviker fra diagonalen i halen.",
    fix:
      "Kruskal–Wallis (rank-basert, antar ikke normalitet), eller log-/Box–Cox-transformasjon før ANOVA.",
  },
  {
    id: "dependent",
    label: "Uavhengighet brutt",
    problem:
      "Målingene er tidsserie — observasjon t korrelert med t+1 (autokorrelasjon). Plot viser klyngevis trend.",
    fix:
      "Bruk mixed-effects modell (random effect på subjekt/tidspunkt) eller GLS. Ikke ANOVA direkte.",
  },
];

function buildData(scenario: Scenario): Array<{ label: string; data: number[]; color: string }> {
  const seedRng = () => {
    // forenklet: bruke Math.random; vi gir ikke deterministisk seed.
  };
  seedRng();
  switch (scenario) {
    case "ok": {
      return [
        { label: "A", color: "hsl(220 70% 55%)", data: Array.from({ length: 25 }, () => gaussian(30, 3)) },
        { label: "B", color: "hsl(140 60% 45%)", data: Array.from({ length: 25 }, () => gaussian(34, 3)) },
        { label: "C", color: "hsl(30 90% 55%)", data: Array.from({ length: 25 }, () => gaussian(38, 3)) },
      ];
    }
    case "unequal-var": {
      return [
        { label: "A", color: "hsl(220 70% 55%)", data: Array.from({ length: 25 }, () => gaussian(30, 2)) },
        { label: "B", color: "hsl(140 60% 45%)", data: Array.from({ length: 25 }, () => gaussian(33, 4)) },
        { label: "C", color: "hsl(30 90% 55%)", data: Array.from({ length: 25 }, () => gaussian(36, 6)) },
      ];
    }
    case "skewed": {
      return [
        { label: "A", color: "hsl(220 70% 55%)", data: Array.from({ length: 25 }, () => 20 + rexp(0.25)) },
        { label: "B", color: "hsl(140 60% 45%)", data: Array.from({ length: 25 }, () => 24 + rexp(0.25)) },
        { label: "C", color: "hsl(30 90% 55%)", data: Array.from({ length: 25 }, () => 28 + rexp(0.2)) },
      ];
    }
    case "dependent": {
      // Trend over tid (AR(1)) — for å vise brudd. Vi simulerer 25 obs per gruppe
      // hvor x_t = 0.7 * x_{t-1} + noise + group_mean.
      const groups: Array<{ label: string; data: number[]; color: string }> = [
        { label: "A", color: "hsl(220 70% 55%)", data: [] },
        { label: "B", color: "hsl(140 60% 45%)", data: [] },
        { label: "C", color: "hsl(30 90% 55%)", data: [] },
      ];
      const baseMeans = [30, 34, 38];
      for (let i = 0; i < 3; i++) {
        let prev = baseMeans[i];
        const arr: number[] = [];
        for (let t = 0; t < 25; t++) {
          const v = 0.7 * (prev - baseMeans[i]) + baseMeans[i] + gaussian(0, 2);
          arr.push(v);
          prev = v;
        }
        groups[i].data = arr;
      }
      return groups;
    }
  }
}

export function AnovaAssumptionsCheck() {
  const [scenario, setScenario] = useState<Scenario>("ok");
  const [reshuffleKey, setReshuffleKey] = useState<number>(0);
  const groups = useMemo(
    () => buildData(scenario),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scenario, reshuffleKey],
  );

  // Per-gruppe statistikk
  const stats = useMemo(() => {
    return groups.map((g) => {
      const n = g.data.length;
      const mean = g.data.reduce((a, b) => a + b, 0) / n;
      const variance = g.data.reduce((acc, v) => acc + (v - mean) ** 2, 0) / Math.max(1, n - 1);
      const sd = Math.sqrt(variance);
      const sorted = [...g.data].sort((a, b) => a - b);
      return { ...g, n, mean, sd, sorted };
    });
  }, [groups]);

  // Residuals (fitted = group mean)
  const residuals = useMemo(() => {
    const arr: Array<{ fitted: number; resid: number; color: string }> = [];
    for (const s of stats) {
      for (const v of s.data) {
        arr.push({ fitted: s.mean, resid: v - s.mean, color: s.color });
      }
    }
    return arr;
  }, [stats]);

  // Levene's test (mean-form): F-statistic for ANOVA på |x_ij - mean_i|
  const levene = useMemo(() => {
    const z: number[][] = stats.map((s) => s.data.map((v) => Math.abs(v - s.mean)));
    const N = z.flat().length;
    const k = z.length;
    const grandZ = z.flat().reduce((a, b) => a + b, 0) / N;
    let ssB = 0;
    let ssW = 0;
    for (const grp of z) {
      const m = grp.reduce((a, b) => a + b, 0) / grp.length;
      ssB += grp.length * (m - grandZ) ** 2;
      for (const v of grp) ssW += (v - m) ** 2;
    }
    const dfB = k - 1;
    const dfW = N - k;
    const F = (ssB / dfB) / (ssW / dfW);
    // ikke kompletter p-verdi — vi flagger F > 3 som "brytende" (~p<0.05 for vanlige df)
    return { F, dfB, dfW, broken: F > 3 };
  }, [stats]);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Dybde-simulator
        </div>
        <div className="text-sm font-semibold">
          Antagelser for ANOVA: normalitet, lik varians, uavhengighet
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setScenario(s.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                scenario === s.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={() => setReshuffleKey((k) => k + 1)}
            className="ml-auto px-2.5 py-1 rounded-md text-xs border border-border hover:bg-muted"
          >
            Trekk nytt
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Sammendrag valgt scenario */}
        <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-1">
          <div>
            <span className="font-semibold">Scenario:</span>{" "}
            {SCENARIOS.find((s) => s.id === scenario)!.problem}
          </div>
          <div>
            <span className="font-semibold">Anbefaling:</span>{" "}
            {SCENARIOS.find((s) => s.id === scenario)!.fix}
          </div>
        </div>

        {/* Antagelse 1: Q-Q plot */}
        <Section
          number={1}
          title="Normalitet — Q-Q plot per gruppe"
          desc="Punkter på diagonalen ⇒ data er tilnærmet normal. Avvik i halene betyr skjevhet eller tunge haler."
        >
          <div className="grid sm:grid-cols-3 gap-3">
            {stats.map((s) => (
              <QQPlot key={s.label} group={s} />
            ))}
          </div>
        </Section>

        {/* Antagelse 2: Lik varians */}
        <Section
          number={2}
          title="Homoscedasticity — residual vs fitted + Levene's test"
          desc="Residual = obs − gruppesnitt. Vifteform ⇒ varians vokser med snittet. Levene's test forkaster H₀: lik varians når F er stor."
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <ResidualVsFitted residuals={residuals} />
            <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-2">
              <div>
                <div className="font-semibold mb-1">Per-gruppe spredning</div>
                <ul className="space-y-1 font-mono">
                  {stats.map((s) => (
                    <li key={s.label} className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: s.color }}
                      />
                      Gruppe {s.label}: s = {s.sd.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded border border-border p-2">
                <div className="font-semibold mb-0.5">Levene's test (mean-form)</div>
                <div className="font-mono">
                  F = {levene.F.toFixed(2)} på df = ({levene.dfB}, {levene.dfW})
                </div>
                <div
                  className={
                    levene.broken
                      ? "text-red-500 font-semibold"
                      : "text-emerald-600"
                  }
                >
                  {levene.broken ? "F > 3 ⇒ varianser ulik (anta brutt)" : "OK — varianser tilnærmet like"}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Antagelse 3: Uavhengighet */}
        <Section
          number={3}
          title="Uavhengighet — design-spørsmål, ikke en plot-sjekk"
          desc="Antagelsen sikres ved tilfeldig utvalg og uavhengige observasjoner. Statistisk diagnose krever et 'rekkefølge'-variabel."
        >
          {scenario === "dependent" ? (
            <SequencePlot groups={stats} />
          ) : (
            <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-1">
              <p>
                I dette scenariet er observasjonene trukket uavhengig. Vanlige
                fellesnevnere for brudd:
              </p>
              <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
                <li>Gjentatte målinger på samme person ⇒ bruk repeated-measures ANOVA</li>
                <li>Klyngedesign (klasser, sykehus) ⇒ bruk mixed-effects modell</li>
                <li>Tidsserie ⇒ ARIMA, GLS eller eksplisitt autoregressive struktur</li>
              </ul>
            </div>
          )}
        </Section>

        <div className="rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs">
          <div className="font-semibold mb-1">Beslutningstabell</div>
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="text-left py-1">Brudd på</th>
                <th className="text-left py-1">Hva du gjør</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border/60">
                <td className="py-1.5">Normalitet</td>
                <td className="py-1.5">
                  Kruskal–Wallis, log-/Box–Cox-transformasjon, bootstrapp F
                </td>
              </tr>
              <tr className="border-t border-border/60">
                <td className="py-1.5">Lik varians</td>
                <td className="py-1.5">Welch's ANOVA (justert df), eller robust SE</td>
              </tr>
              <tr className="border-t border-border/60">
                <td className="py-1.5">Uavhengighet</td>
                <td className="py-1.5">
                  Mixed-effects / GLS / repeated-measures — ANOVA ugyldig her
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Section({
  number,
  title,
  desc,
  children,
}: {
  number: number;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <span className="text-xs text-brand font-bold">{number}.</span>
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground">{desc}</p>
      {children}
    </div>
  );
}

function QQPlot({
  group,
}: {
  group: { label: string; color: string; sorted: number[]; n: number; sd: number; mean: number };
}) {
  const W = 200;
  const H = 160;
  const padL = 30;
  const padR = 8;
  const padT = 8;
  const padB = 24;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  // theoretical quantiles (standard normal) at (i - 0.5) / n
  const pts = group.sorted.map((y, i) => {
    const p = (i + 0.5) / group.n;
    const x = normInv(p);
    return { x, y };
  });
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const xLo = Math.min(...xs);
  const xHi = Math.max(...xs);
  const yLo = Math.min(...ys);
  const yHi = Math.max(...ys);
  const xOf = (v: number) => padL + ((v - xLo) / (xHi - xLo)) * plotW;
  const yOf = (v: number) => padT + (1 - (v - yLo) / (yHi - yLo)) * plotH;

  // Reference line via mean ± sd
  const refX1 = xLo;
  const refX2 = xHi;
  const refY1 = group.mean + group.sd * xLo;
  const refY2 = group.mean + group.sd * xHi;

  return (
    <div className="rounded-lg border border-border bg-background p-2">
      <div className="text-xs font-semibold flex items-center gap-1.5 mb-1">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: group.color }}
        />
        Gruppe {group.label}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <line
          x1={xOf(refX1)}
          y1={yOf(refY1)}
          x2={xOf(refX2)}
          y2={yOf(refY2)}
          stroke="hsl(0 0% 60%)"
          strokeDasharray="3 3"
          strokeWidth={1}
        />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={xOf(p.x)}
            cy={yOf(p.y)}
            r={2}
            fill={group.color}
            fillOpacity={0.85}
          />
        ))}
        <text
          x={padL + plotW / 2}
          y={H - 6}
          textAnchor="middle"
          fontSize={9}
          fill="hsl(0 0% 50%)"
        >
          teoretisk kvantil
        </text>
        <text
          x={6}
          y={padT + plotH / 2}
          textAnchor="middle"
          fontSize={9}
          fill="hsl(0 0% 50%)"
          transform={`rotate(-90 6 ${padT + plotH / 2})`}
        >
          observert
        </text>
      </svg>
    </div>
  );
}

function ResidualVsFitted({
  residuals,
}: {
  residuals: Array<{ fitted: number; resid: number; color: string }>;
}) {
  const W = 280;
  const H = 200;
  const padL = 36;
  const padR = 10;
  const padT = 10;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const fittedVals = residuals.map((r) => r.fitted);
  const residVals = residuals.map((r) => r.resid);
  const xLo = Math.min(...fittedVals) - 1;
  const xHi = Math.max(...fittedVals) + 1;
  const yMax = Math.max(...residVals.map(Math.abs), 1) * 1.1;
  const xOf = (v: number) => padL + ((v - xLo) / (xHi - xLo)) * plotW;
  const yOf = (v: number) => padT + (1 - (v + yMax) / (2 * yMax)) * plotH;

  return (
    <div className="rounded-lg border border-border bg-background p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* y = 0 linje */}
        <line
          x1={padL}
          y1={yOf(0)}
          x2={padL + plotW}
          y2={yOf(0)}
          stroke="hsl(0 0% 60%)"
          strokeDasharray="3 3"
        />
        {residuals.map((r, i) => (
          <circle
            key={i}
            cx={xOf(r.fitted) + ((i % 7) - 3) * 0.6}
            cy={yOf(r.resid)}
            r={2.4}
            fill={r.color}
            fillOpacity={0.75}
          />
        ))}
        <text
          x={padL + plotW / 2}
          y={H - 6}
          textAnchor="middle"
          fontSize={9}
          fill="hsl(0 0% 50%)"
        >
          fitted (gruppesnitt)
        </text>
        <text
          x={8}
          y={padT + plotH / 2}
          textAnchor="middle"
          fontSize={9}
          fill="hsl(0 0% 50%)"
          transform={`rotate(-90 8 ${padT + plotH / 2})`}
        >
          residual
        </text>
      </svg>
    </div>
  );
}

function SequencePlot({
  groups,
}: {
  groups: Array<{ label: string; data: number[]; color: string }>;
}) {
  const W = 560;
  const H = 200;
  const padL = 40;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const maxT = Math.max(...groups.map((g) => g.data.length));
  const lo = Math.min(...groups.flatMap((g) => g.data)) - 2;
  const hi = Math.max(...groups.flatMap((g) => g.data)) + 2;
  const xOf = (t: number) => padL + (t / (maxT - 1)) * plotW;
  const yOf = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * plotH;
  return (
    <div className="rounded-lg border border-border bg-background p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {groups.map((g) => {
          const path = g.data
            .map((v, t) => `${t === 0 ? "M" : "L"} ${xOf(t)} ${yOf(v)}`)
            .join(" ");
          return (
            <g key={g.label}>
              <path d={path} fill="none" stroke={g.color} strokeWidth={1.4} />
              {g.data.map((v, t) => (
                <circle
                  key={t}
                  cx={xOf(t)}
                  cy={yOf(v)}
                  r={1.8}
                  fill={g.color}
                  fillOpacity={0.8}
                />
              ))}
            </g>
          );
        })}
        <text
          x={padL + plotW / 2}
          y={H - 6}
          textAnchor="middle"
          fontSize={9}
          fill="hsl(0 0% 50%)"
        >
          observasjonsindeks t (tid)
        </text>
      </svg>
      <p className="text-xs text-muted-foreground mt-1">
        Når kurven svinger «glatt» i klynger over tid er observasjonene avhengige
        (autokorrelasjon). Diagnostikk: Durbin–Watson eller ACF-plot. Modell:
        mixed-effects med AR(1) struktur eller GLS.
      </p>
    </div>
  );
}
