import { useMemo, useState } from "react";
import { Tex } from "@/components/Tex";

// --------------------------------------------------------------------------
// TwoWayAnovaViz
//
// To-faktors ANOVA med interaksjon. Brukerne ser et 2x2 (dose × kjønn) celle-
// snitt, kan justere hver celle med slider, og se:
//   - Interaksjon-plot (linjer per kjønn på tvers av dose-nivåer)
//   - SS-dekomp: SS_total = SS_A + SS_B + SS_AB + SS_within
//   - F-test for hver effekt
//
// Antar balansert design med n_per_cell observasjoner per celle. Vi simulerer
// støy ut fra felles sigma og bruker grand sum-formler:
//
//   SS_A = b * n * sum_i (m_i. - m..)^2
//   SS_B = a * n * sum_j (m_.j - m..)^2
//   SS_AB = n * sum_{i,j} (m_ij - m_i. - m_.j + m..)^2
//   SS_within = sum residual square = (n-1) * sigma^2 * a*b  (deterministisk for forenkling)
// --------------------------------------------------------------------------

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
function fSurvival(f: number, df1: number, df2: number): number {
  if (f <= 0) return 1;
  const x = df2 / (df2 + df1 * f);
  return regIncBeta(x, df2 / 2, df1 / 2);
}

const A_LABELS = ["lav", "middels", "høy"]; // faktor A: dose
const B_LABELS = ["mann", "kvinne"]; // faktor B: kjønn
const A_COLORS = ["hsl(220 70% 55%)", "hsl(140 60% 45%)", "hsl(30 90% 55%)"];

type Preset = "no-interaction" | "interaction" | "main-only";

const PRESETS: Record<Preset, { label: string; means: number[][] }> = {
  "no-interaction": {
    label: "Ingen interaksjon (paralelle linjer)",
    // rows = dose (3), cols = kjønn (2). Effekt av dose = +4 per nivå, effekt av kjønn = +2.
    means: [
      [50, 52],
      [54, 56],
      [58, 60],
    ],
  },
  "main-only": {
    label: "Kun main effect dose, ingen kjønnseffekt",
    means: [
      [50, 50],
      [55, 55],
      [60, 60],
    ],
  },
  interaction: {
    label: "Sterk interaksjon (linjer krysser)",
    means: [
      [50, 60],
      [55, 55],
      [60, 50],
    ],
  },
};

export function TwoWayAnovaViz() {
  const [preset, setPreset] = useState<Preset>("no-interaction");
  const [means, setMeans] = useState<number[][]>(PRESETS["no-interaction"].means);
  const [nPerCell, setNPerCell] = useState<number>(8);
  const [sigma, setSigma] = useState<number>(4);

  const a = means.length; // dose-nivåer (3)
  const b = means[0].length; // kjønn (2)
  const N = a * b * nPerCell;

  // grand mean, row means, col means
  const stats = useMemo(() => {
    const grand =
      means.flat().reduce((acc, v) => acc + v, 0) / (a * b);
    const rowMeans = means.map(
      (row) => row.reduce((acc, v) => acc + v, 0) / b,
    );
    const colMeans = Array.from({ length: b }, (_, j) =>
      means.reduce((acc, row) => acc + row[j], 0) / a,
    );

    // SSA, SSB, SSAB
    let SSA = 0;
    for (let i = 0; i < a; i++)
      SSA += b * nPerCell * (rowMeans[i] - grand) ** 2;
    let SSB = 0;
    for (let j = 0; j < b; j++)
      SSB += a * nPerCell * (colMeans[j] - grand) ** 2;
    let SSAB = 0;
    for (let i = 0; i < a; i++)
      for (let j = 0; j < b; j++)
        SSAB += nPerCell * (means[i][j] - rowMeans[i] - colMeans[j] + grand) ** 2;
    // SS_within = (n_per_cell - 1) * sigma^2 * a*b (forenklet — sigma er "ekte" innencelle-spredning)
    const SSW = (nPerCell - 1) * sigma * sigma * a * b;

    const dfA = a - 1;
    const dfB = b - 1;
    const dfAB = (a - 1) * (b - 1);
    const dfW = a * b * (nPerCell - 1);

    const MSA = SSA / Math.max(1, dfA);
    const MSB = SSB / Math.max(1, dfB);
    const MSAB = SSAB / Math.max(1, dfAB);
    const MSW = SSW / Math.max(1, dfW);

    const FA = MSW > 0 ? MSA / MSW : 0;
    const FB = MSW > 0 ? MSB / MSW : 0;
    const FAB = MSW > 0 ? MSAB / MSW : 0;

    const pA = fSurvival(FA, dfA, dfW);
    const pB = fSurvival(FB, dfB, dfW);
    const pAB = fSurvival(FAB, dfAB, dfW);

    return {
      grand, rowMeans, colMeans,
      SSA, SSB, SSAB, SSW,
      dfA, dfB, dfAB, dfW,
      MSA, MSB, MSAB, MSW,
      FA, FB, FAB,
      pA, pB, pAB,
    };
  }, [means, nPerCell, sigma, a, b]);

  const SST = stats.SSA + stats.SSB + stats.SSAB + stats.SSW;

  // Plot interaksjon
  const W = 540;
  const H = 240;
  const padL = 50;
  const padR = 16;
  const padT = 16;
  const padB = 36;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const allMeans = means.flat();
  const lo = Math.min(...allMeans) - 4;
  const hi = Math.max(...allMeans) + 4;
  const xOf = (i: number) => padL + ((i + 0.5) / a) * plotW;
  const yOf = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * plotH;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Dybde-simulator
        </div>
        <div className="text-sm font-semibold">
          To-veis ANOVA: dose × kjønn — main effects og interaksjon
        </div>
        <p className="text-xs text-muted-foreground italic mt-1">
          Parallelle linjer ⇒ ingen interaksjon. Krysser linjene ⇒ effekten av
          dose avhenger av kjønn. Test for interaksjonen er F_{`{A×B}`}.
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* Presets */}
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(PRESETS) as Preset[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPreset(p);
                setMeans(PRESETS[p].means.map((row) => [...row]));
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                preset === p
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
            >
              {PRESETS[p].label}
            </button>
          ))}
        </div>

        {/* Slidere per celle */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left px-2 py-1"></th>
                {B_LABELS.slice(0, b).map((bl) => (
                  <th key={bl} className="text-left px-2 py-1">
                    {bl}
                  </th>
                ))}
                <th className="text-left px-2 py-1">snitt rad</th>
              </tr>
            </thead>
            <tbody>
              {means.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-2 py-1 font-semibold">{A_LABELS[i]}</td>
                  {row.map((v, j) => (
                    <td key={j} className="px-2 py-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono">{v.toFixed(1)}</span>
                        <input
                          type="range"
                          min={40}
                          max={70}
                          step={0.5}
                          value={v}
                          onChange={(e) => {
                            const next = means.map((r) => [...r]);
                            next[i][j] = Number(e.target.value);
                            setMeans(next);
                          }}
                          className="w-32"
                        />
                      </div>
                    </td>
                  ))}
                  <td className="px-2 py-1 font-mono text-brand">
                    {stats.rowMeans[i].toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-border bg-muted/30">
                <td className="px-2 py-1 font-semibold">snitt kol.</td>
                {stats.colMeans.map((m, j) => (
                  <td key={j} className="px-2 py-1 font-mono text-brand">
                    {m.toFixed(2)}
                  </td>
                ))}
                <td className="px-2 py-1 font-mono font-bold">
                  {stats.grand.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-xs block">
            <span className="block text-muted-foreground mb-0.5">
              n per celle = {nPerCell} (totalt N = {N})
            </span>
            <input
              type="range"
              min={3}
              max={30}
              step={1}
              value={nPerCell}
              onChange={(e) => setNPerCell(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="text-xs block">
            <span className="block text-muted-foreground mb-0.5">
              innencelle σ = {sigma.toFixed(1)}
            </span>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={sigma}
              onChange={(e) => setSigma(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>

        {/* Interaksjons-plot */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full border border-border rounded bg-background"
        >
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
                <text
                  x={padL - 6}
                  y={yOf(v) + 3}
                  textAnchor="end"
                  fontSize={9}
                  fill="hsl(0 0% 45%)"
                >
                  {v.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* x-akse labels */}
          {A_LABELS.slice(0, a).map((al, i) => (
            <text
              key={i}
              x={xOf(i)}
              y={padT + plotH + 16}
              textAnchor="middle"
              fontSize={10}
              fill="hsl(0 0% 30%)"
            >
              {al}
            </text>
          ))}
          <text
            x={padL + plotW / 2}
            y={H - 4}
            textAnchor="middle"
            fontSize={10}
            fill="hsl(0 0% 30%)"
          >
            Faktor A: dose
          </text>

          {/* en linje per kjønn */}
          {Array.from({ length: b }, (_, j) => {
            const color = j === 0 ? "hsl(220 70% 50%)" : "hsl(330 75% 55%)";
            const pts = means.map((row, i) => ({ x: xOf(i), y: yOf(row[j]) }));
            const path = pts
              .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
              .join(" ");
            return (
              <g key={j}>
                <path d={path} fill="none" stroke={color} strokeWidth={2} />
                {pts.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={4}
                    fill={color}
                    stroke="white"
                    strokeWidth={1.2}
                  />
                ))}
                <text
                  x={pts[pts.length - 1].x + 8}
                  y={pts[pts.length - 1].y + 3}
                  fontSize={10}
                  fill={color}
                  fontWeight={600}
                >
                  {B_LABELS[j]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* ANOVA-tabell */}
        <div className="rounded-lg border border-border bg-background overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-3 py-1.5">Kilde</th>
                <th className="text-right px-3 py-1.5">SS</th>
                <th className="text-right px-3 py-1.5">df</th>
                <th className="text-right px-3 py-1.5">MS</th>
                <th className="text-right px-3 py-1.5">F</th>
                <th className="text-right px-3 py-1.5">p</th>
              </tr>
            </thead>
            <tbody>
              <Row
                name="Dose (A)"
                ss={stats.SSA}
                df={stats.dfA}
                ms={stats.MSA}
                f={stats.FA}
                p={stats.pA}
              />
              <Row
                name="Kjønn (B)"
                ss={stats.SSB}
                df={stats.dfB}
                ms={stats.MSB}
                f={stats.FB}
                p={stats.pB}
              />
              <Row
                name="Interaksjon (A×B)"
                ss={stats.SSAB}
                df={stats.dfAB}
                ms={stats.MSAB}
                f={stats.FAB}
                p={stats.pAB}
                highlight
              />
              <tr className="border-t border-border">
                <td className="px-3 py-1.5">Residual</td>
                <td className="text-right px-3 py-1.5">{stats.SSW.toFixed(2)}</td>
                <td className="text-right px-3 py-1.5">{stats.dfW}</td>
                <td className="text-right px-3 py-1.5">{stats.MSW.toFixed(2)}</td>
                <td className="text-right px-3 py-1.5">—</td>
                <td className="text-right px-3 py-1.5">—</td>
              </tr>
              <tr className="border-t border-border bg-muted/30">
                <td className="px-3 py-1.5 font-semibold">Total</td>
                <td className="text-right px-3 py-1.5 font-semibold">
                  {SST.toFixed(2)}
                </td>
                <td className="text-right px-3 py-1.5">{N - 1}</td>
                <td colSpan={3}></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs space-y-1">
          <div className="font-semibold">Interaksjons-tolkning</div>
          <p>
            Hvis <Tex>{"p_{A \\times B} < 0.05"}</Tex> er effekten av dose
            avhengig av kjønn (eller motsatt). Da kan vi <em>ikke</em> tolke
            main effects rett frem — vi må rapportere "effekten av dose er X
            blant menn og Y blant kvinner". Når interaksjonen er liten, tolker
            vi main effects direkte.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({
  name, ss, df, ms, f, p, highlight,
}: {
  name: string;
  ss: number;
  df: number;
  ms: number;
  f: number;
  p: number;
  highlight?: boolean;
}) {
  return (
    <tr
      className={`border-t border-border ${
        highlight ? "bg-brand/5" : ""
      }`}
    >
      <td className="px-3 py-1.5 font-semibold">{name}</td>
      <td className="text-right px-3 py-1.5">{ss.toFixed(2)}</td>
      <td className="text-right px-3 py-1.5">{df}</td>
      <td className="text-right px-3 py-1.5">{ms.toFixed(2)}</td>
      <td className="text-right px-3 py-1.5">{f.toFixed(2)}</td>
      <td
        className={`text-right px-3 py-1.5 ${
          p < 0.05 ? "text-emerald-600 font-bold" : "text-muted-foreground"
        }`}
      >
        {p < 1e-4 ? "<0.0001" : p.toFixed(4)}
      </td>
    </tr>
  );
}
