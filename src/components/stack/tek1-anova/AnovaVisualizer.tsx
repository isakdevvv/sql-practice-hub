import { useMemo, useRef, useState } from "react";
import { RotateCcw, Play, Pause, ChevronRight } from "lucide-react";
import { Tex } from "@/components/Tex";

// --------------------------------------------------------------------------
// Interaktiv visualisering for ettveis ANOVA.
// Fem moduser:
//   1. Boxplot + means  — gruppe-boxplots med grand mean + gruppesnitt-triangler
//   2. Within vs between — varians-bånd (innenfor) og mellom-snitt-spredning
//   3. F-fordelingen   — F-pdf med vertikal F-obs-linje + p-verdi-skygge
//   4. Bonferroni      — animasjon av familywise error rate vs k grupper
//   5. Worked example  — én tabell, ett steg om gangen
// --------------------------------------------------------------------------

type Mode = "boxplot" | "within-between" | "f-dist" | "bonferroni" | "worked";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "boxplot", label: "Boxplot + means", sub: "se gruppene side ved side" },
  { id: "within-between", label: "Varians-dekomp.", sub: "mellom vs innenfor" },
  { id: "f-dist", label: "F-fordelingen", sub: "p-verdi som hale-areal" },
  { id: "bonferroni", label: "Bonferroni", sub: "korrigert for mange tester" },
  { id: "worked", label: "Worked example", sub: "steg-for-steg-tabell" },
];

const MODE_NOTE: Record<Mode, string> = {
  boxplot:
    "Trekk i sliderne — flytt et gruppesnitt vekk fra resten og se hvordan SS_between vokser.",
  "within-between":
    "Lyse bånd = innenfor-spredning (sigma). Mørke prikker = gruppesnitt rundt grand mean.",
  "f-dist":
    "Vertikal stiplet linje er din F-obs. Skraffert område til høyre = p-verdien.",
  bonferroni:
    "Med k grupper trengs m = k(k-1)/2 parvise tester. Hver test må bruke alpha/m for at familywise feilrate skal forbli alpha.",
  worked:
    "Tre stålsammensetninger, 5 målinger hver. Trykk «Neste steg» for å bygge tabellen.",
};

// ---------- statistikk-helpers (samme stil som AnovaCalculator) ----------
function gaussian(mu: number, sigma: number): number {
  const u1 = Math.max(1e-9, Math.random());
  const u2 = Math.random();
  return mu + sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

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
  const x = df2 / (df2 + df1 * f);
  return regIncBeta(x, df2 / 2, df1 / 2);
}

// F-pdf
function fPdf(f: number, df1: number, df2: number): number {
  if (f <= 0) return 0;
  const log =
    (df1 / 2) * Math.log(df1 / df2) +
    (df1 / 2 - 1) * Math.log(f) -
    ((df1 + df2) / 2) * Math.log(1 + (df1 * f) / df2) +
    logGamma((df1 + df2) / 2) -
    logGamma(df1 / 2) -
    logGamma(df2 / 2);
  return Math.exp(log);
}

// Kvantil-helper: binærsøk på F-fordelingens overlevelsesfunksjon.
function fQuantile(p: number, df1: number, df2: number): number {
  let lo = 0;
  let hi = 100;
  for (let it = 0; it < 60; it++) {
    const mid = (lo + hi) / 2;
    const s = fSurvival(mid, df1, df2);
    if (s > p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const idx = q * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

type GroupSpec = {
  label: string;
  mu: number;
  n: number;
  color: string;
};

type GroupData = GroupSpec & {
  data: number[];
};

const INIT_GROUPS: GroupSpec[] = [
  { label: "A — kontroll", mu: 28, n: 12, color: "hsl(220 70% 55%)" },
  { label: "B — gjødsel 1", mu: 32, n: 12, color: "hsl(140 60% 45%)" },
  { label: "C — gjødsel 2", mu: 36, n: 12, color: "hsl(30 90% 55%)" },
];

function buildGroups(specs: GroupSpec[], sigma: number): GroupData[] {
  return specs.map((s) => {
    const data: number[] = [];
    for (let i = 0; i < s.n; i++) data.push(gaussian(s.mu, sigma));
    return { ...s, data };
  });
}

export function AnovaVisualizer() {
  const [mode, setMode] = useState<Mode>("boxplot");

  // Felles state for modus 1 og 2: grupper og felles sigma
  const [sigma, setSigma] = useState<number>(4);
  const [specs, setSpecs] = useState<GroupSpec[]>(INIT_GROUPS);
  const [reshuffleKey, setReshuffleKey] = useState(0);

  const groups = useMemo(
    () => buildGroups(specs, sigma),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [specs, sigma, reshuffleKey],
  );

  // ANOVA-statistikk fra observerte data (brukes i modus 1, 2 og 3)
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
    const pValue = fSurvival(F, dfBetween, dfWithin);
    return {
      k, N, grandMean, ssBetween, ssWithin,
      dfBetween, dfWithin, msBetween, msWithin,
      F, pValue, groupMeans,
    };
  }, [groups]);

  const reset = () => {
    setSpecs(INIT_GROUPS);
    setSigma(4);
    setReshuffleKey((k) => k + 1);
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" role="region" aria-label="Interaktiv visualisering: ANOVA">
      {/* Topp-bar med modus-velger */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              ANOVA — varians mellom grupper vs innenfor grupper
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                mode === m.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
              title={m.sub}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pedagogisk note */}
      <div className="px-4 py-2 border-b border-border bg-background text-xs text-muted-foreground italic">
        {MODE_NOTE[mode]}
      </div>

      {/* Modus-spesifikt innhold */}
      <div className="p-5">
        {mode === "boxplot" && (
          <BoxplotMode
            groups={groups}
            specs={specs}
            setSpecs={setSpecs}
            sigma={sigma}
            setSigma={setSigma}
            reshuffle={() => setReshuffleKey((k) => k + 1)}
            stats={stats}
          />
        )}
        {mode === "within-between" && (
          <WithinBetweenMode groups={groups} sigma={sigma} stats={stats} />
        )}
        {mode === "f-dist" && (
          <FDistMode
            dfBetweenInit={stats.dfBetween}
            dfWithinInit={stats.dfWithin}
            fObs={stats.F}
            pObs={stats.pValue}
          />
        )}
        {mode === "bonferroni" && <BonferroniMode />}
        {mode === "worked" && <WorkedExampleMode />}
      </div>
    </div>
  );
}

// =================== MODUS 1: BOXPLOT + MEANS ===================

function BoxplotMode({
  groups,
  specs,
  setSpecs,
  sigma,
  setSigma,
  reshuffle,
  stats,
}: {
  groups: GroupData[];
  specs: GroupSpec[];
  setSpecs: (s: GroupSpec[]) => void;
  sigma: number;
  setSigma: (s: number) => void;
  reshuffle: () => void;
  stats: {
    grandMean: number;
    ssBetween: number;
    ssWithin: number;
    dfBetween: number;
    dfWithin: number;
    msBetween: number;
    msWithin: number;
    F: number;
    pValue: number;
    groupMeans: number[];
  };
}) {
  // Plot-grenser
  const allValues = groups.flatMap((g) => g.data);
  const lo = Math.min(...allValues, 10) - 3;
  const hi = Math.max(...allValues, 50) + 3;
  const W = 560;
  const H = 260;
  const padL = 44;
  const padR = 14;
  const padT = 14;
  const padB = 32;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const xOf = (i: number) => padL + ((i + 0.5) / groups.length) * plotW;
  const yOf = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * plotH;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        {specs.map((s, i) => (
          <div
            key={s.label}
            className="rounded-lg border border-border p-3 space-y-2 text-xs"
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: s.color }}
              />
              <span className="font-mono font-semibold">{s.label}</span>
            </div>
            <label className="block">
              <span className="block text-muted-foreground mb-0.5">
                <Tex>{"\\mu"}</Tex> = {s.mu.toFixed(1)}
              </span>
              <input
                type="range"
                min={20}
                max={45}
                step={0.5}
                value={s.mu}
                onChange={(e) => {
                  const next = [...specs];
                  next[i] = { ...next[i], mu: Number(e.target.value) };
                  setSpecs(next);
                }}
                className="w-full"
              />
            </label>
            <label className="block">
              <span className="block text-muted-foreground mb-0.5">
                n = {s.n}
              </span>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={s.n}
                onChange={(e) => {
                  const next = [...specs];
                  next[i] = { ...next[i], n: Number(e.target.value) };
                  setSpecs(next);
                }}
                className="w-full"
              />
            </label>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-xs flex-1 min-w-[180px]">
          <span className="block text-muted-foreground mb-0.5">
            felles <Tex>{"\\sigma"}</Tex> = {sigma.toFixed(1)}
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
        <button
          onClick={reshuffle}
          className="rounded border border-border bg-background px-2.5 py-1 text-xs hover:border-brand/40"
        >
          Trekk nye stikkprøver
        </button>
      </div>

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
                stroke="hsl(0 0% 88%)"
                strokeWidth={0.5}
              />
              <text
                x={padL - 6}
                y={yOf(v) + 3}
                textAnchor="end"
                fontSize={9}
                fill="hsl(0 0% 50%)"
              >
                {v.toFixed(0)}
              </text>
            </g>
          );
        })}
        <text
          x={10}
          y={padT + plotH / 2}
          textAnchor="middle"
          fontSize={10}
          fill="hsl(0 0% 45%)"
          transform={`rotate(-90 10 ${padT + plotH / 2})`}
        >
          høyde (cm)
        </text>

        {/* grand mean */}
        <line
          x1={padL}
          y1={yOf(stats.grandMean)}
          x2={padL + plotW}
          y2={yOf(stats.grandMean)}
          stroke="hsl(0 0% 40%)"
          strokeDasharray="4 3"
          strokeWidth={1}
        />
        <text
          x={padL + plotW - 4}
          y={yOf(stats.grandMean) - 4}
          textAnchor="end"
          fontSize={9}
          fill="hsl(0 0% 35%)"
        >
          grand mean = {stats.grandMean.toFixed(2)}
        </text>

        {/* boxplots */}
        {groups.map((g, i) => {
          const sorted = [...g.data].sort((a, b) => a - b);
          const q1 = quantile(sorted, 0.25);
          const med = quantile(sorted, 0.5);
          const q3 = quantile(sorted, 0.75);
          const iqr = q3 - q1;
          const whiskLo = Math.max(sorted[0], q1 - 1.5 * iqr);
          const whiskHi = Math.min(sorted[sorted.length - 1], q3 + 1.5 * iqr);
          const cx = xOf(i);
          const boxW = Math.min(56, (plotW / groups.length) * 0.55);
          const mean = stats.groupMeans[i];
          return (
            <g key={g.label}>
              {/* whisker line */}
              <line
                x1={cx}
                y1={yOf(whiskLo)}
                x2={cx}
                y2={yOf(whiskHi)}
                stroke={g.color}
                strokeWidth={1.2}
              />
              {/* whisker caps */}
              <line
                x1={cx - boxW / 4}
                y1={yOf(whiskLo)}
                x2={cx + boxW / 4}
                y2={yOf(whiskLo)}
                stroke={g.color}
                strokeWidth={1.2}
              />
              <line
                x1={cx - boxW / 4}
                y1={yOf(whiskHi)}
                x2={cx + boxW / 4}
                y2={yOf(whiskHi)}
                stroke={g.color}
                strokeWidth={1.2}
              />
              {/* box */}
              <rect
                x={cx - boxW / 2}
                y={yOf(q3)}
                width={boxW}
                height={yOf(q1) - yOf(q3)}
                fill={g.color}
                fillOpacity={0.18}
                stroke={g.color}
                strokeWidth={1.4}
              />
              {/* median line */}
              <line
                x1={cx - boxW / 2}
                y1={yOf(med)}
                x2={cx + boxW / 2}
                y2={yOf(med)}
                stroke={g.color}
                strokeWidth={2}
              />
              {/* observations som små prikker, jittered */}
              {g.data.map((v, j) => (
                <circle
                  key={j}
                  cx={cx + ((j % 5) - 2) * 3}
                  cy={yOf(v)}
                  r={1.8}
                  fill={g.color}
                  fillOpacity={0.55}
                />
              ))}
              {/* gruppe-snitt: trekant */}
              <polygon
                points={`${cx - 6},${yOf(mean) + 5} ${cx + 6},${yOf(mean) + 5} ${cx},${yOf(mean) - 6}`}
                fill={g.color}
                stroke="white"
                strokeWidth={1}
              />
              <text
                x={cx + 10}
                y={yOf(mean) + 3}
                fontSize={9}
                fill={g.color}
                fontWeight={600}
              >
                {mean.toFixed(1)}
              </text>
              {/* label */}
              <text
                x={cx}
                y={H - 10}
                textAnchor="middle"
                fontSize={10}
                fill="hsl(0 0% 30%)"
              >
                {g.label.split(" — ")[0]}
              </text>
            </g>
          );
        })}
      </svg>

      <StatsStrip stats={stats} />
    </div>
  );
}

function StatsStrip({
  stats,
}: {
  stats: {
    ssBetween: number;
    ssWithin: number;
    dfBetween: number;
    dfWithin: number;
    msBetween: number;
    msWithin: number;
    F: number;
    pValue: number;
  };
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
      <Stat label={<Tex>{"SS_{between}"}</Tex>} value={stats.ssBetween.toFixed(2)} />
      <Stat label={<Tex>{"SS_{within}"}</Tex>} value={stats.ssWithin.toFixed(2)} />
      <Stat
        label={<span className="text-brand">F</span>}
        value={stats.F.toFixed(3)}
        highlight
      />
      <Stat
        label="p-verdi"
        value={stats.pValue < 1e-4 ? "<0.0001" : stats.pValue.toFixed(4)}
        highlight={stats.pValue < 0.05}
        good={stats.pValue < 0.05}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
  good,
}: {
  label: React.ReactNode;
  value: string;
  highlight?: boolean;
  good?: boolean;
}) {
  return (
    <div
      className={`rounded border px-3 py-2 ${
        highlight
          ? good
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-brand/40 bg-brand/5"
          : "border-border bg-background"
      }`}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

// =================== MODUS 2: WITHIN VS BETWEEN ===================

function WithinBetweenMode({
  groups,
  sigma,
  stats,
}: {
  groups: GroupData[];
  sigma: number;
  stats: {
    grandMean: number;
    ssBetween: number;
    ssWithin: number;
    dfBetween: number;
    dfWithin: number;
    msBetween: number;
    msWithin: number;
    F: number;
    pValue: number;
    groupMeans: number[];
  };
}) {
  const allValues = groups.flatMap((g) => g.data);
  const lo = Math.min(...allValues, 10) - 3;
  const hi = Math.max(...allValues, 50) + 3;
  const W = 560;
  const H = 260;
  const padL = 44;
  const padR = 14;
  const padT = 14;
  const padB = 32;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const xOf = (i: number) => padL + ((i + 0.5) / groups.length) * plotW;
  const yOf = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * plotH;

  // mellom-snitt-spredning: standardavvik for gruppesnittene
  const meanOfMeans = stats.grandMean;
  const meansSigma = Math.sqrt(
    stats.groupMeans.reduce((acc, m) => acc + (m - meanOfMeans) ** 2, 0) /
      Math.max(1, stats.groupMeans.length),
  );

  return (
    <div className="space-y-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full border border-border rounded bg-background"
      >
        {/* lyse bånd: ±sigma rundt hvert gruppesnitt (within) */}
        {groups.map((g, i) => {
          const cx = xOf(i);
          const bandW = Math.min(76, (plotW / groups.length) * 0.7);
          const mean = stats.groupMeans[i];
          return (
            <g key={`within-${g.label}`}>
              <rect
                x={cx - bandW / 2}
                y={yOf(mean + sigma)}
                width={bandW}
                height={yOf(mean - sigma) - yOf(mean + sigma)}
                fill={g.color}
                fillOpacity={0.1}
              />
              <rect
                x={cx - bandW / 2}
                y={yOf(mean + 2 * sigma)}
                width={bandW}
                height={yOf(mean - 2 * sigma) - yOf(mean + 2 * sigma)}
                fill={g.color}
                fillOpacity={0.05}
              />
            </g>
          );
        })}

        {/* mørkt bånd rundt grand mean: ±std av gruppesnittene (between) */}
        <rect
          x={padL}
          y={yOf(meanOfMeans + meansSigma)}
          width={plotW}
          height={yOf(meanOfMeans - meansSigma) - yOf(meanOfMeans + meansSigma)}
          fill="hsl(220 50% 25%)"
          fillOpacity={0.12}
        />
        <text
          x={padL + 6}
          y={yOf(meanOfMeans - meansSigma) - 4}
          fontSize={9}
          fill="hsl(220 60% 35%)"
        >
          mellom-snitt-bånd ±{meansSigma.toFixed(2)}
        </text>

        {/* grand mean */}
        <line
          x1={padL}
          y1={yOf(stats.grandMean)}
          x2={padL + plotW}
          y2={yOf(stats.grandMean)}
          stroke="hsl(0 0% 30%)"
          strokeWidth={1.4}
        />
        <text
          x={padL + plotW - 4}
          y={yOf(stats.grandMean) - 4}
          textAnchor="end"
          fontSize={9}
          fill="hsl(0 0% 30%)"
        >
          grand mean
        </text>

        {/* y-akse-tick */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const v = lo + t * (hi - lo);
          return (
            <text
              key={t}
              x={padL - 6}
              y={yOf(v) + 3}
              textAnchor="end"
              fontSize={9}
              fill="hsl(0 0% 50%)"
            >
              {v.toFixed(0)}
            </text>
          );
        })}

        {/* gruppesnitt-prikker */}
        {groups.map((g, i) => {
          const cx = xOf(i);
          const mean = stats.groupMeans[i];
          return (
            <g key={`mean-${g.label}`}>
              <line
                x1={cx - 16}
                y1={yOf(mean)}
                x2={cx + 16}
                y2={yOf(mean)}
                stroke={g.color}
                strokeWidth={3}
              />
              <circle cx={cx} cy={yOf(mean)} r={5} fill={g.color} />
              <text
                x={cx}
                y={H - 10}
                textAnchor="middle"
                fontSize={10}
                fill="hsl(0 0% 30%)"
              >
                {g.label.split(" — ")[0]}
              </text>
            </g>
          );
        })}

        {/* legend */}
        <g transform={`translate(${padL + 6}, ${padT + 6})`}>
          <rect width={170} height={36} fill="white" fillOpacity={0.85} rx={3} />
          <rect x={4} y={4} width={12} height={10} fill="hsl(140 60% 45%)" fillOpacity={0.15} />
          <text x={20} y={13} fontSize={9} fill="hsl(0 0% 30%)">
            innenfor ±σ (lyse bånd)
          </text>
          <rect x={4} y={20} width={12} height={10} fill="hsl(220 50% 25%)" fillOpacity={0.25} />
          <text x={20} y={29} fontSize={9} fill="hsl(0 0% 30%)">
            mellom-snitt ±sd (mørkt)
          </text>
        </g>
      </svg>

      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-border p-3 bg-background">
          <div className="font-semibold mb-1">
            Innenfor-spredning: <Tex>{"MS_{within}"}</Tex> ={" "}
            <span className="font-mono">{stats.msWithin.toFixed(2)}</span>
          </div>
          <p className="text-muted-foreground">
            Pooled estimat for støynivået σ². Stor MS<sub>within</sub> ⇒ mye støy
            innenfor hver gruppe.
          </p>
        </div>
        <div className="rounded-lg border border-border p-3 bg-background">
          <div className="font-semibold mb-1">
            Mellom-spredning: <Tex>{"MS_{between}"}</Tex> ={" "}
            <span className="font-mono">{stats.msBetween.toFixed(2)}</span>
          </div>
          <p className="text-muted-foreground">
            Hvor langt gruppesnittene ligger fra grand mean, vektet med n. Stor ⇒
            gruppene «trekker» i hver sin retning.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs">
        <div className="font-semibold mb-1">
          F = <span className="font-mono">{stats.F.toFixed(3)}</span>
        </div>
        <p className="text-muted-foreground">
          {stats.F > 4
            ? "F er stort — mellom-spredningen dominerer over innenfor. Gruppe-tilhørighet forklarer noe."
            : stats.F > 1
            ? "F litt over 1 — mellom-spredningen er omtrent som innenfor. Lite bevis for forskjell."
            : "F under 1 — gruppesnittene ligger nærmere hverandre enn man skulle vente fra ren støy."}
        </p>
      </div>
    </div>
  );
}

// =================== MODUS 3: F-FORDELINGEN ===================

function FDistMode({
  dfBetweenInit,
  dfWithinInit,
  fObs,
  pObs,
}: {
  dfBetweenInit: number;
  dfWithinInit: number;
  fObs: number;
  pObs: number;
}) {
  const [df1, setDf1] = useState<number>(Math.max(1, dfBetweenInit));
  const [df2, setDf2] = useState<number>(Math.max(2, dfWithinInit));
  const [alpha, setAlpha] = useState<number>(0.05);
  const [fStat, setFStat] = useState<number>(Number.isFinite(fObs) ? Math.min(fObs, 12) : 3);

  const W = 560;
  const H = 240;
  const padL = 40;
  const padR = 14;
  const padT = 14;
  const padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const fCrit = fQuantile(alpha, df1, df2);
  const xMax = Math.max(6, fCrit * 2, fStat * 1.3);
  const xOf = (f: number) => padL + (f / xMax) * plotW;

  // PDF-punkter
  const pdfPoints = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    const N = 240;
    for (let i = 0; i <= N; i++) {
      const f = (i / N) * xMax;
      points.push({ x: f, y: fPdf(f, df1, df2) });
    }
    return points;
  }, [df1, df2, xMax]);

  const yMax = Math.max(0.0001, ...pdfPoints.map((p) => p.y)) * 1.1;
  const yOf = (y: number) => padT + (1 - y / yMax) * plotH;

  // Path for pdf
  const pdfPath = useMemo(
    () =>
      pdfPoints
        .map((p, i) => `${i === 0 ? "M" : "L"} ${xOf(p.x)} ${yOf(p.y)}`)
        .join(" "),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pdfPoints, xMax, df1, df2],
  );

  // Skyggemskte halen til høyre for fStat
  const tailPath = useMemo(() => {
    const segs = pdfPoints.filter((p) => p.x >= fStat);
    if (segs.length === 0) return "";
    const start = `M ${xOf(segs[0].x)} ${yOf(0)} L ${xOf(segs[0].x)} ${yOf(segs[0].y)}`;
    const mids = segs
      .slice(1)
      .map((p) => `L ${xOf(p.x)} ${yOf(p.y)}`)
      .join(" ");
    const end = `L ${xOf(segs[segs.length - 1].x)} ${yOf(0)} Z`;
    return `${start} ${mids} ${end}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfPoints, fStat, xMax, df1, df2]);

  const pVal = fSurvival(fStat, df1, df2);

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-xs block">
          <span className="block text-muted-foreground mb-0.5">
            df<sub>1</sub> (between) = {df1}
          </span>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={df1}
            onChange={(e) => setDf1(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="text-xs block">
          <span className="block text-muted-foreground mb-0.5">
            df<sub>2</sub> (within) = {df2}
          </span>
          <input
            type="range"
            min={2}
            max={100}
            step={1}
            value={df2}
            onChange={(e) => setDf2(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="text-xs block">
          <span className="block text-muted-foreground mb-0.5">
            F-observert = {fStat.toFixed(2)}
          </span>
          <input
            type="range"
            min={0}
            max={12}
            step={0.05}
            value={fStat}
            onChange={(e) => setFStat(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="text-xs block">
          <span className="block text-muted-foreground mb-0.5">
            α (signifikansnivå) = {alpha.toFixed(3)}
          </span>
          <input
            type="range"
            min={0.001}
            max={0.2}
            step={0.001}
            value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full border border-border rounded bg-background">
        {/* x-akse-tick */}
        {Array.from({ length: 7 }, (_, i) => (i / 6) * xMax).map((v) => (
          <g key={v}>
            <line
              x1={xOf(v)}
              y1={padT + plotH}
              x2={xOf(v)}
              y2={padT + plotH + 4}
              stroke="hsl(0 0% 60%)"
            />
            <text
              x={xOf(v)}
              y={padT + plotH + 14}
              textAnchor="middle"
              fontSize={9}
              fill="hsl(0 0% 45%)"
            >
              {v.toFixed(1)}
            </text>
          </g>
        ))}
        <line
          x1={padL}
          y1={padT + plotH}
          x2={padL + plotW}
          y2={padT + plotH}
          stroke="hsl(0 0% 60%)"
        />

        {/* tail (p-verdi-skygge) */}
        <path d={tailPath} fill="hsl(0 75% 55%)" fillOpacity={0.35} />

        {/* pdf */}
        <path d={pdfPath} fill="none" stroke="hsl(220 70% 45%)" strokeWidth={1.8} />

        {/* kritisk verdi */}
        <line
          x1={xOf(fCrit)}
          y1={padT}
          x2={xOf(fCrit)}
          y2={padT + plotH}
          stroke="hsl(30 80% 50%)"
          strokeDasharray="4 3"
          strokeWidth={1.2}
        />
        <text
          x={xOf(fCrit) + 4}
          y={padT + 14}
          fontSize={9}
          fill="hsl(30 80% 40%)"
        >
          F_crit = {fCrit.toFixed(2)}
        </text>

        {/* F-obs */}
        <line
          x1={xOf(fStat)}
          y1={padT}
          x2={xOf(fStat)}
          y2={padT + plotH}
          stroke="hsl(0 75% 45%)"
          strokeWidth={1.6}
        />
        <text
          x={xOf(fStat) + 4}
          y={padT + 26}
          fontSize={9}
          fill="hsl(0 75% 45%)"
          fontWeight={600}
        >
          F = {fStat.toFixed(2)}
        </text>

        <text
          x={padL + plotW}
          y={H - 4}
          textAnchor="end"
          fontSize={9}
          fill="hsl(0 0% 40%)"
        >
          F-verdi
        </text>
      </svg>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
        <Stat
          label={<span>F-obs (din kalk)</span>}
          value={Number.isFinite(fObs) ? fObs.toFixed(3) : "—"}
        />
        <Stat
          label={<span>p-verdi (slider)</span>}
          value={pVal < 1e-4 ? "<0.0001" : pVal.toFixed(4)}
          highlight={pVal < alpha}
          good={pVal < alpha}
        />
        <Stat
          label={<span>p-verdi (kalk)</span>}
          value={pObs < 1e-4 ? "<0.0001" : pObs.toFixed(4)}
        />
      </div>

      <div className="text-xs text-muted-foreground">
        Konklusjon ved <Tex>{`\\alpha = ${alpha.toFixed(3)}`}</Tex>:{" "}
        {pVal < alpha ? (
          <span className="text-emerald-500 font-semibold">
            forkast H₀ — F-obs ligger i hale-arealet.
          </span>
        ) : (
          <span>behold H₀ — F-obs er ikke ekstrem nok.</span>
        )}
      </div>
    </div>
  );
}

// =================== MODUS 4: BONFERRONI ===================

function BonferroniMode() {
  const [k, setK] = useState<number>(4);
  const [alphaFw, setAlphaFw] = useState<number>(0.05);
  const [playing, setPlaying] = useState<boolean>(false);
  const [animK, setAnimK] = useState<number>(2);
  const tickRef = useRef<number | null>(null);

  // animasjon: tikker animK opp til k
  function play() {
    setAnimK(2);
    setPlaying(true);
    if (tickRef.current !== null) window.clearInterval(tickRef.current);
    tickRef.current = window.setInterval(() => {
      setAnimK((cur) => {
        if (cur >= k) {
          if (tickRef.current !== null) window.clearInterval(tickRef.current);
          setPlaying(false);
          return k;
        }
        return cur + 1;
      });
    }, 700);
  }
  function stop() {
    setPlaying(false);
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  const m = (animK * (animK - 1)) / 2;
  const mFull = (k * (k - 1)) / 2;
  const fwerUncorrected = 1 - Math.pow(1 - alphaFw, m);
  const alphaPerTest = m === 0 ? alphaFw : alphaFw / m;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-xs block">
          <span className="block text-muted-foreground mb-0.5">
            Antall grupper k = {k}
          </span>
          <input
            type="range"
            min={2}
            max={12}
            step={1}
            value={k}
            onChange={(e) => {
              setK(Number(e.target.value));
              setAnimK(Number(e.target.value));
            }}
            className="w-full"
          />
        </label>
        <label className="text-xs block">
          <span className="block text-muted-foreground mb-0.5">
            ønsket familywise α = {alphaFw.toFixed(3)}
          </span>
          <input
            type="range"
            min={0.001}
            max={0.2}
            step={0.001}
            value={alphaFw}
            onChange={(e) => setAlphaFw(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={playing ? stop : play}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-3 py-1.5 text-xs hover:border-brand/40"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "Stopp animasjon" : "Animer: bygg parene"}
        </button>
        <span className="text-xs text-muted-foreground">
          {animK} av {k} grupper inkludert → {m} av {mFull} parvise tester
        </span>
      </div>

      {/* visualisering: grupper og linjer mellom dem */}
      <svg
        viewBox="0 0 560 240"
        className="w-full border border-border rounded bg-background"
      >
        {Array.from({ length: k }, (_, i) => {
          const theta = (2 * Math.PI * i) / k - Math.PI / 2;
          const cx = 280 + 90 * Math.cos(theta);
          const cy = 120 + 70 * Math.sin(theta);
          const active = i < animK;
          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r={18}
                fill={active ? "hsl(220 70% 55%)" : "hsl(0 0% 90%)"}
                stroke={active ? "hsl(220 70% 35%)" : "hsl(0 0% 75%)"}
                strokeWidth={1.5}
              />
              <text
                x={cx}
                y={cy + 4}
                textAnchor="middle"
                fontSize={11}
                fill={active ? "white" : "hsl(0 0% 50%)"}
                fontWeight={600}
              >
                {String.fromCharCode(65 + i)}
              </text>
            </g>
          );
        })}
        {/* tegn par-linjer mellom aktive grupper */}
        {Array.from({ length: animK }, (_, i) =>
          Array.from({ length: i }, (_, j) => {
            const theta1 = (2 * Math.PI * i) / k - Math.PI / 2;
            const theta2 = (2 * Math.PI * j) / k - Math.PI / 2;
            const x1 = 280 + 90 * Math.cos(theta1);
            const y1 = 120 + 70 * Math.sin(theta1);
            const x2 = 280 + 90 * Math.cos(theta2);
            const y2 = 120 + 70 * Math.sin(theta2);
            return (
              <line
                key={`${i}-${j}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="hsl(0 75% 55%)"
                strokeOpacity={0.45}
                strokeWidth={1.2}
              />
            );
          }),
        )}
        <text
          x={280}
          y={222}
          textAnchor="middle"
          fontSize={10}
          fill="hsl(0 0% 40%)"
        >
          {m} parvise sammenligninger
        </text>
      </svg>

      <div className="grid sm:grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-muted-foreground">m = k(k−1)/2</div>
          <div className="font-mono font-semibold text-base">
            {m} tester
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-muted-foreground">
            FWER ukorrigert: 1 − (1 − α)
            <sup>m</sup>
          </div>
          <div
            className={`font-mono font-semibold text-base ${
              fwerUncorrected > 0.1 ? "text-red-500" : "text-foreground"
            }`}
          >
            {(fwerUncorrected * 100).toFixed(1)} %
          </div>
        </div>
        <div className="rounded-lg border border-brand/40 bg-brand/5 p-3">
          <div className="text-muted-foreground">
            Bonferroni per test: α / m
          </div>
          <div className="font-mono font-semibold text-base text-brand">
            {alphaPerTest.toFixed(4)}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
        Med <strong>k = {k}</strong> grupper og familywise α = {alphaFw.toFixed(3)}:
        ukorrigert er sjansen for minst én falsk forkasting <strong>{(fwerUncorrected * 100).toFixed(1)} %</strong>.
        Bonferroni-korreksjonen krever p &lt; <span className="font-mono">{alphaPerTest.toFixed(4)}</span> per test for å holde
        familywise rate på {alphaFw.toFixed(3)}.
      </div>
    </div>
  );
}

// =================== MODUS 5: WORKED EXAMPLE ===================

// Faste data — 3 grupper × 5 observasjoner, slik at studenten kan regne med
type WorkedGroup = { label: string; color: string; data: number[] };

const WORKED_GROUPS: WorkedGroup[] = [
  { label: "A", color: "hsl(220 70% 55%)", data: [82, 79, 85, 81, 83] },
  { label: "B", color: "hsl(140 60% 45%)", data: [88, 91, 87, 90, 89] },
  { label: "C", color: "hsl(30 90% 55%)", data: [84, 82, 86, 85, 83] },
];

const WORKED_STEPS = [
  "Skriv opp dataene",
  "Beregn gruppesnitt",
  "Beregn grand mean",
  "SS_between",
  "SS_within",
  "Frihetsgrader og MS",
  "F-statistikk",
  "p-verdi og konklusjon",
];

function WorkedExampleMode() {
  const [step, setStep] = useState<number>(0);

  const k = WORKED_GROUPS.length;
  const ns = WORKED_GROUPS.map((g) => g.data.length);
  const N = ns.reduce((a, b) => a + b, 0);
  const groupMeans = WORKED_GROUPS.map(
    (g) => g.data.reduce((a, b) => a + b, 0) / g.data.length,
  );
  const grandMean =
    WORKED_GROUPS.flatMap((g) => g.data).reduce((a, b) => a + b, 0) / N;

  let ssBetween = 0;
  for (let i = 0; i < k; i++) {
    ssBetween += ns[i] * (groupMeans[i] - grandMean) ** 2;
  }
  let ssWithin = 0;
  for (let i = 0; i < k; i++) {
    for (const v of WORKED_GROUPS[i].data) {
      ssWithin += (v - groupMeans[i]) ** 2;
    }
  }
  const dfBetween = k - 1;
  const dfWithin = N - k;
  const msBetween = ssBetween / dfBetween;
  const msWithin = ssWithin / dfWithin;
  const F = msBetween / msWithin;
  const p = fSurvival(F, dfBetween, dfWithin);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="rounded border border-border bg-background px-2.5 py-1 text-xs hover:border-brand/40 disabled:opacity-40"
        >
          ← Forrige
        </button>
        <button
          onClick={() => setStep(Math.min(WORKED_STEPS.length - 1, step + 1))}
          disabled={step >= WORKED_STEPS.length - 1}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/5 px-2.5 py-1 text-xs text-brand hover:bg-brand/10 disabled:opacity-40"
        >
          Neste steg <ChevronRight className="h-3 w-3" />
        </button>
        <button
          onClick={() => setStep(0)}
          className="rounded border border-border bg-background px-2.5 py-1 text-xs hover:border-brand/40 ml-auto"
        >
          Start på nytt
        </button>
        <span className="text-xs text-muted-foreground">
          Steg {step + 1}/{WORKED_STEPS.length}: {WORKED_STEPS[step]}
        </span>
      </div>

      {/* steg-tabell */}
      <div className="rounded-lg border border-border bg-background overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-3 py-2">Gruppe</th>
              {Array.from({ length: 5 }, (_, j) => (
                <th key={j} className="text-right px-3 py-2">
                  x<sub>{j + 1}</sub>
                </th>
              ))}
              <th className="text-right px-3 py-2">n</th>
              {step >= 1 && (
                <th className="text-right px-3 py-2">
                  <Tex>{"\\bar{x}_i"}</Tex>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {WORKED_GROUPS.map((g, i) => (
              <tr key={g.label} className="border-t border-border">
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: g.color }}
                    />
                    {g.label}
                  </span>
                </td>
                {g.data.map((v, j) => (
                  <td key={j} className="text-right px-3 py-2">
                    {v}
                  </td>
                ))}
                <td className="text-right px-3 py-2 text-muted-foreground">
                  {g.data.length}
                </td>
                {step >= 1 && (
                  <td className="text-right px-3 py-2 text-brand font-semibold">
                    {groupMeans[i].toFixed(2)}
                  </td>
                )}
              </tr>
            ))}
            {step >= 2 && (
              <tr className="border-t border-border bg-muted/20">
                <td className="px-3 py-2 font-semibold" colSpan={6}>
                  grand mean = ({groupMeans.map((m) => m.toFixed(2)).join(" + ")}) / {k}
                </td>
                <td className="text-right px-3 py-2 text-muted-foreground">N = {N}</td>
                <td className="text-right px-3 py-2 text-brand font-semibold">
                  {grandMean.toFixed(2)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* trinnvise utregninger */}
      <div className="space-y-2 text-xs">
        {step >= 3 && (
          <Calc title={<Tex>{"SS_{between}"}</Tex>}>
            <Tex>{`SS_{between} = ${ns
              .map(
                (n, i) =>
                  `${n}(${groupMeans[i].toFixed(2)} - ${grandMean.toFixed(2)})^2`,
              )
              .join(" + ")} = ${ssBetween.toFixed(2)}`}</Tex>
          </Calc>
        )}
        {step >= 4 && (
          <Calc title={<Tex>{"SS_{within}"}</Tex>}>
            <Tex>{`SS_{within} = \\sum_{i,j}(x_{ij} - \\bar{x}_i)^2 = ${ssWithin.toFixed(2)}`}</Tex>
          </Calc>
        )}
        {step >= 5 && (
          <Calc title="df og MS">
            <div className="space-y-1">
              <Tex>{`df_{between} = k - 1 = ${dfBetween}, \\quad df_{within} = N - k = ${dfWithin}`}</Tex>
              <Tex>{`MS_{between} = ${ssBetween.toFixed(2)} / ${dfBetween} = ${msBetween.toFixed(2)}`}</Tex>
              <Tex>{`MS_{within} = ${ssWithin.toFixed(2)} / ${dfWithin} = ${msWithin.toFixed(2)}`}</Tex>
            </div>
          </Calc>
        )}
        {step >= 6 && (
          <Calc title="F-statistikk" highlight>
            <Tex>{`F = MS_{between} / MS_{within} = ${msBetween.toFixed(2)} / ${msWithin.toFixed(2)} = ${F.toFixed(2)}`}</Tex>
          </Calc>
        )}
        {step >= 7 && (
          <Calc title="Konklusjon" highlight>
            <div className="space-y-1">
              <Tex>{`p\\text{-verdi} = P(F_{${dfBetween}, ${dfWithin}} \\geq ${F.toFixed(2)}) = ${
                p < 1e-4 ? "<0.0001" : p.toFixed(4)
              }`}</Tex>
              <div
                className={
                  p < 0.05
                    ? "text-emerald-500 font-semibold"
                    : "text-muted-foreground"
                }
              >
                {p < 0.05
                  ? "p < 0.05 ⇒ forkast H₀. Minst én gruppe skiller seg."
                  : "p ≥ 0.05 ⇒ behold H₀. Ikke nok bevis for forskjell."}
              </div>
            </div>
          </Calc>
        )}
      </div>
    </div>
  );
}

function Calc({
  title,
  children,
  highlight,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded border p-3 ${
        highlight
          ? "border-brand/40 bg-brand/5"
          : "border-border bg-background"
      }`}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}
