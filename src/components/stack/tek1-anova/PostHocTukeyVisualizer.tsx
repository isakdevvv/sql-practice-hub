import { useMemo, useState } from "react";
import { Tex } from "@/components/Tex";

// --------------------------------------------------------------------------
// PostHocTukeyVisualizer
//
// 3 forhåndsdefinerte runder. For hver runde:
//   - Vis alle k(k-1)/2 par-vise konfidensintervaller
//     under tre justeringsregimer (Tukey HSD, Bonferroni, ukorrigert).
//   - Indiker for hver par hvilke som er "signifikant" (CI utelukker 0).
//   - Vis FWER for ukorrigert sammen med justert.
//
// Tukey HSD CI for par (i, j) (balansert design):
//   (mean_i - mean_j) ± q_{alpha, k, df} * sqrt(MSW / n)
// Bonferroni:
//   (mean_i - mean_j) ± t_{alpha/(2m), df} * sqrt(2*MSW / n)
// Ukorrigert t-CI:
//   (mean_i - mean_j) ± t_{alpha/2, df} * sqrt(2*MSW / n)
// --------------------------------------------------------------------------

// ---- statistikk-helpers ----
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
function betacf(a: number, b: number, x: number): number {
  const MAXIT = 200, EPS = 3e-7, FPMIN = 1e-30;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c; h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}
function regIncBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const lbt = logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x);
  const bt = Math.exp(lbt);
  if (x < (a + 1) / (a + b + 2)) return (bt * betacf(a, b, x)) / a;
  return 1 - (bt * betacf(b, a, 1 - x)) / b;
}
function tCdf(t: number, df: number): number {
  const x = df / (df + t * t);
  const ib = regIncBeta(x, df / 2, 0.5);
  return t >= 0 ? 1 - 0.5 * ib : 0.5 * ib;
}
function tQuantile(p: number, df: number): number {
  let lo = -50, hi = 50;
  for (let i = 0; i < 80; i++) {
    const m = (lo + hi) / 2;
    if (tCdf(m, df) < p) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}
// Approks. for Studentized range q via Gleason (1999) / Lund-Lund:
// for vanlige k og df gir denne en god approksimasjon for 95 % og 99 %.
// Vi bruker en tabell-basert lookup + interpolering for å være pålitelig
// uten ekstern lib.
const TUKEY_TABLE_05: Record<number, Record<number, number>> = {
  // df: { k: q }
  5: { 2: 3.64, 3: 4.6, 4: 5.22, 5: 5.67, 6: 6.03 },
  10: { 2: 3.15, 3: 3.88, 4: 4.33, 5: 4.65, 6: 4.91 },
  15: { 2: 3.01, 3: 3.67, 4: 4.08, 5: 4.37, 6: 4.59 },
  20: { 2: 2.95, 3: 3.58, 4: 3.96, 5: 4.23, 6: 4.45 },
  30: { 2: 2.89, 3: 3.49, 4: 3.85, 5: 4.1, 6: 4.3 },
  40: { 2: 2.86, 3: 3.44, 4: 3.79, 5: 4.04, 6: 4.23 },
  60: { 2: 2.83, 3: 3.4, 4: 3.74, 5: 3.98, 6: 4.16 },
  120: { 2: 2.8, 3: 3.36, 4: 3.69, 5: 3.92, 6: 4.1 },
  1000: { 2: 2.77, 3: 3.31, 4: 3.63, 5: 3.86, 6: 4.03 },
};

function tukeyQ95(k: number, df: number): number {
  const dfs = Object.keys(TUKEY_TABLE_05).map(Number).sort((a, b) => a - b);
  const dfHi = dfs.find((d) => d >= df) ?? dfs[dfs.length - 1];
  const dfLo = [...dfs].reverse().find((d) => d <= df) ?? dfs[0];
  const kClamped = Math.min(6, Math.max(2, k));
  const qLo = TUKEY_TABLE_05[dfLo][kClamped];
  const qHi = TUKEY_TABLE_05[dfHi][kClamped];
  if (dfLo === dfHi) return qLo;
  const t = (df - dfLo) / (dfHi - dfLo);
  return qLo + t * (qHi - qLo);
}

type Scenario = {
  id: string;
  title: string;
  blurb: string;
  groups: Array<{ label: string; mean: number; std: number; n: number; color: string }>;
};

const SCENARIOS: Scenario[] = [
  {
    id: "drugs",
    title: "3 medikamenter — klar vinner",
    blurb:
      "Tre smertestillende testet på samme målgruppe. ANOVA gir p ≪ 0.05. Hvilke par av medikamentene skiller seg?",
    groups: [
      { label: "Placebo", mean: 4.2, std: 1.4, n: 15, color: "hsl(0 0% 50%)" },
      { label: "Ibuprofen", mean: 6.5, std: 1.3, n: 15, color: "hsl(220 70% 55%)" },
      { label: "Ny X", mean: 7.1, std: 1.2, n: 15, color: "hsl(140 60% 45%)" },
    ],
  },
  {
    id: "fertilizer",
    title: "4 gjødseltyper — tett løp",
    blurb:
      "Avling per gjødseltype. ANOVA gir p ≈ 0.04. Hvilke par er signifikant forskjellige med Tukey vs ukorrigert?",
    groups: [
      { label: "A", mean: 22, std: 3.0, n: 10, color: "hsl(220 70% 55%)" },
      { label: "B", mean: 25, std: 3.2, n: 10, color: "hsl(140 60% 45%)" },
      { label: "C", mean: 27, std: 2.9, n: 10, color: "hsl(30 90% 55%)" },
      { label: "D", mean: 24, std: 3.1, n: 10, color: "hsl(280 60% 55%)" },
    ],
  },
  {
    id: "ad",
    title: "5 reklame-varianter — multiple comparisons-felle",
    blurb:
      "5 reklamer × 8 klikkrater per gruppe. m = 10 parvise tester. Se hvordan ukorrigert finner falske 'signifikante' par.",
    groups: [
      { label: "V1", mean: 0.045, std: 0.012, n: 8, color: "hsl(0 70% 55%)" },
      { label: "V2", mean: 0.048, std: 0.011, n: 8, color: "hsl(40 80% 50%)" },
      { label: "V3", mean: 0.046, std: 0.013, n: 8, color: "hsl(140 60% 45%)" },
      { label: "V4", mean: 0.047, std: 0.012, n: 8, color: "hsl(220 70% 55%)" },
      { label: "V5", mean: 0.052, std: 0.011, n: 8, color: "hsl(280 60% 55%)" },
    ],
  },
];

type Method = "tukey" | "bonferroni" | "uncorrected";
const METHOD_LABEL: Record<Method, string> = {
  tukey: "Tukey HSD",
  bonferroni: "Bonferroni",
  uncorrected: "Ukorrigert (naivt)",
};

export function PostHocTukeyVisualizer() {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const [methods, setMethods] = useState<Method[]>(["tukey", "uncorrected"]);

  // ANOVA estimater
  const stats = useMemo(() => {
    const k = scenario.groups.length;
    const N = scenario.groups.reduce((a, g) => a + g.n, 0);
    const dfW = N - k;
    // MSW pooled antar lik n. Bruk sum(s_i^2 * (n_i - 1)) / (N - k)
    let ssw = 0;
    for (const g of scenario.groups) ssw += g.std ** 2 * (g.n - 1);
    const msw = ssw / dfW;
    const n = scenario.groups[0].n; // alle like
    return { k, N, dfW, msw, n };
  }, [scenario]);

  // Pairs
  const pairs = useMemo(() => {
    const k = scenario.groups.length;
    const out: Array<{
      i: number;
      j: number;
      labelA: string;
      labelB: string;
      diff: number;
      se: number; // standard error for diff = sqrt(MSW * (1/n + 1/n)) = sqrt(2*MSW/n)
      seTukey: number; // sqrt(MSW / n) brukt i Tukey
    }> = [];
    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        out.push({
          i,
          j,
          labelA: scenario.groups[i].label,
          labelB: scenario.groups[j].label,
          diff: scenario.groups[i].mean - scenario.groups[j].mean,
          se: Math.sqrt((2 * stats.msw) / stats.n),
          seTukey: Math.sqrt(stats.msw / stats.n),
        });
      }
    }
    return out;
  }, [scenario, stats]);

  const m = pairs.length;
  const alpha = 0.05;
  const tCrit = tQuantile(1 - alpha / 2, stats.dfW);
  const tBonf = tQuantile(1 - alpha / (2 * m), stats.dfW);
  const q = tukeyQ95(stats.k, stats.dfW);

  type CIRow = {
    pair: typeof pairs[number];
    perMethod: Record<
      Method,
      { lo: number; hi: number; sig: boolean }
    >;
  };
  const rows: CIRow[] = pairs.map((p) => {
    const perMethod: CIRow["perMethod"] = {
      tukey: {
        lo: p.diff - q * p.seTukey,
        hi: p.diff + q * p.seTukey,
        sig: Math.abs(p.diff) > q * p.seTukey,
      },
      bonferroni: {
        lo: p.diff - tBonf * p.se,
        hi: p.diff + tBonf * p.se,
        sig: Math.abs(p.diff) > tBonf * p.se,
      },
      uncorrected: {
        lo: p.diff - tCrit * p.se,
        hi: p.diff + tCrit * p.se,
        sig: Math.abs(p.diff) > tCrit * p.se,
      },
    };
    return { pair: p, perMethod };
  });

  // Plot-grenser
  const allCIs = rows.flatMap((r) =>
    methods.flatMap((m) => [r.perMethod[m].lo, r.perMethod[m].hi]),
  );
  const xMax = Math.max(0.5, ...allCIs.map((v) => Math.abs(v))) * 1.15;
  const xMin = -xMax;
  const W = 580;
  const rowH = 26;
  const headerH = 28;
  const H = headerH + rows.length * methods.length * rowH + 26;
  const padL = 110;
  const padR = 80;
  const plotW = W - padL - padR;
  const xOf = (v: number) => padL + ((v - xMin) / (xMax - xMin)) * plotW;

  const fwerUncorr = 1 - Math.pow(1 - alpha, m);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Dybde-simulator
        </div>
        <div className="text-sm font-semibold">
          Post-hoc: hvilke par av grupper skiller seg etter en signifikant ANOVA?
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setScenarioId(s.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                scenarioId === s.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-xs text-muted-foreground">{scenario.blurb}</p>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">Vis metoder:</span>
          {(["tukey", "bonferroni", "uncorrected"] as Method[]).map((m) => (
            <label key={m} className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={methods.includes(m)}
                onChange={(e) => {
                  if (e.target.checked) setMethods([...methods, m]);
                  else setMethods(methods.filter((x) => x !== m));
                }}
              />
              <span
                className={
                  m === "uncorrected"
                    ? "text-red-500"
                    : m === "tukey"
                    ? "text-emerald-600"
                    : "text-amber-600"
                }
              >
                {METHOD_LABEL[m]}
              </span>
            </label>
          ))}
        </div>

        {/* Plot */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full border border-border rounded bg-background"
        >
          {/* header */}
          <text x={padL / 2} y={18} textAnchor="middle" fontSize={10} fill="hsl(0 0% 30%)" fontWeight={600}>
            Par
          </text>
          <text x={padL + plotW / 2} y={18} textAnchor="middle" fontSize={10} fill="hsl(0 0% 30%)" fontWeight={600}>
            CI for differanse i snitt
          </text>
          <text x={W - padR / 2} y={18} textAnchor="middle" fontSize={10} fill="hsl(0 0% 30%)" fontWeight={600}>
            Sig?
          </text>

          {/* x-akse */}
          {[xMin, xMin / 2, 0, xMax / 2, xMax].map((v) => (
            <g key={v}>
              <line
                x1={xOf(v)}
                y1={headerH}
                x2={xOf(v)}
                y2={H - 14}
                stroke={v === 0 ? "hsl(0 0% 30%)" : "hsl(0 0% 90%)"}
                strokeWidth={v === 0 ? 1.2 : 0.7}
                strokeDasharray={v === 0 ? "0" : "2 3"}
              />
              <text
                x={xOf(v)}
                y={H - 4}
                textAnchor="middle"
                fontSize={9}
                fill="hsl(0 0% 45%)"
              >
                {v.toFixed(2)}
              </text>
            </g>
          ))}

          {/* rader */}
          {rows.map((r, ri) => {
            const yRow = headerH + ri * methods.length * rowH;
            return (
              <g key={ri}>
                <text
                  x={padL - 8}
                  y={yRow + (methods.length * rowH) / 2 + 4}
                  textAnchor="end"
                  fontSize={11}
                  fill="hsl(0 0% 20%)"
                  fontWeight={600}
                >
                  {r.pair.labelA} − {r.pair.labelB}
                </text>
                <text
                  x={padL - 8}
                  y={yRow + (methods.length * rowH) / 2 + 18}
                  textAnchor="end"
                  fontSize={9}
                  fill="hsl(0 0% 45%)"
                >
                  Δ̄ = {r.pair.diff.toFixed(3)}
                </text>
                {methods.map((m, mi) => {
                  const ci = r.perMethod[m];
                  const y = yRow + mi * rowH + rowH / 2;
                  const color =
                    m === "tukey"
                      ? "hsl(140 60% 40%)"
                      : m === "bonferroni"
                      ? "hsl(30 80% 45%)"
                      : "hsl(0 70% 50%)";
                  return (
                    <g key={m}>
                      <line
                        x1={xOf(ci.lo)}
                        y1={y}
                        x2={xOf(ci.hi)}
                        y2={y}
                        stroke={color}
                        strokeWidth={2.4}
                      />
                      <line x1={xOf(ci.lo)} y1={y - 4} x2={xOf(ci.lo)} y2={y + 4} stroke={color} strokeWidth={1.5} />
                      <line x1={xOf(ci.hi)} y1={y - 4} x2={xOf(ci.hi)} y2={y + 4} stroke={color} strokeWidth={1.5} />
                      <circle cx={xOf(r.pair.diff)} cy={y} r={3} fill={color} />
                      <text
                        x={padL + plotW + 4}
                        y={y + 3}
                        fontSize={9}
                        fill={ci.sig ? "hsl(140 60% 35%)" : "hsl(0 0% 50%)"}
                        fontWeight={600}
                      >
                        {ci.sig ? "★" : "·"} {METHOD_LABEL[m].split(" ")[0]}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Tall-tabell */}
        <div className="rounded-lg border border-border bg-background overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-3 py-1.5">Par</th>
                <th className="text-right px-3 py-1.5">Δ̄</th>
                {methods.map((m) => (
                  <th key={m} className="text-center px-3 py-1.5">
                    {METHOD_LABEL[m]} CI
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-3 py-1.5 font-semibold">
                    {r.pair.labelA} − {r.pair.labelB}
                  </td>
                  <td className="text-right px-3 py-1.5">{r.pair.diff.toFixed(3)}</td>
                  {methods.map((m) => {
                    const ci = r.perMethod[m];
                    return (
                      <td
                        key={m}
                        className={`text-center px-3 py-1.5 ${
                          ci.sig ? "text-emerald-600 font-semibold" : "text-muted-foreground"
                        }`}
                      >
                        [{ci.lo.toFixed(3)}, {ci.hi.toFixed(3)}]
                        {ci.sig && " ★"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid sm:grid-cols-3 gap-2 text-xs">
          <Box label="Antall sammenligninger m">{m}</Box>
          <Box label="FWER uten korrigering">
            <span className={fwerUncorr > 0.1 ? "text-red-500" : ""}>
              {(fwerUncorr * 100).toFixed(1)} %
            </span>
          </Box>
          <Box label="q (Tukey)">{q.toFixed(2)}</Box>
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs space-y-1">
          <div className="font-semibold">Multiple comparisons-problemet</div>
          <p>
            Med <Tex>{`m = ${m}`}</Tex> uavhengige tester på{" "}
            <Tex>{"\\alpha = 0.05"}</Tex>:{" "}
            <span className="font-mono">FWER = 1 − 0.95^{m}</span> ={" "}
            <span className="font-mono font-semibold">{(fwerUncorr * 100).toFixed(1)} %</span>.
            Det er sannsynligheten for å forkaste minst én ekte H₀ med ukorrigerte
            tester. Tukey HSD og Bonferroni løser dette ved å kreve bredere CIs.
          </p>
          <p>
            <strong>Tukey HSD</strong> er optimal for <em>alle</em> parvise
            sammenligninger ved balanserte design.{" "}
            <strong>Bonferroni</strong> er konservativ men virker for hvilken som
            helst familie av tester (kontraster, ulike test-typer). Foretrekk
            Tukey når du har balansert ANOVA og bare vil sammenligne par.
          </p>
        </div>
      </div>
    </div>
  );
}

function Box({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-border bg-background px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-sm font-semibold">{children}</div>
    </div>
  );
}
