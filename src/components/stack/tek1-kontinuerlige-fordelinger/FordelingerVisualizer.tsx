import { useMemo, useRef, useState } from "react";
import { Lightbulb, RotateCcw, Play } from "lucide-react";

// --------------------------------------------------------------------------
// FordelingerVisualizer — interaktiv visualisering for kontinuerlige fordelinger.
//
// Fire moduser (tabs):
//   1. pdf-cdf  — PDF og CDF side-ved-side, area-skygge P(a ≤ X ≤ b)
//                 og tilhørende F(b) − F(a) på CDF-en. Slidere for parametre.
//   2. params   — Ghost-kurver: 3-4 faste parameterverdier samtidig, så
//                 brukeren ser hvordan σ (eller μ, eller λ) strekker kurven.
//   3. sampling — Sampling-simulator: trekk n samples, vis histogram, overlay
//                 teoretisk PDF, vis sample-mean/var mot teoretisk.
//   4. clt      — Sentralgrensesetningen: histogram av gjennomsnittet av n
//                 eksponensielle prøver, overlay teoretisk Normal(μ, σ/√n).
//
// All matematikk er klient-side: analytiske PDF/CDF + erf-approks (A&S 7.1.26),
// Box-Muller for normale samples, invers CDF for Uniform/Exp.
// SVG-basert (~360-500 px viewBox), polyline med ~200 punkter.
// --------------------------------------------------------------------------

type Mode = "pdf-cdf" | "params" | "sampling" | "clt";
type Dist = "uniform" | "exp" | "normal";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "pdf-cdf", label: "PDF + CDF", sub: "areal under kurven = sannsynlighet" },
  { id: "params", label: "Parameter-effekt", sub: "ghost-kurver" },
  { id: "sampling", label: "Sampling", sub: "histogram → teoretisk PDF" },
  { id: "clt", label: "CLT live", sub: "gjennomsnitt blir Normal" },
];

const MODE_NOTE: Record<Mode, string> = {
  "pdf-cdf":
    "Skyv a og b. Det skraverte arealet på venstre kurve er P(a ≤ X ≤ b). På høyre kurve er det samme tallet differansen F(b) − F(a) — derfor er CDF-en så praktisk: én oppslag gir kumulativ sannsynlighet.",
  params:
    "Tre ghost-kurver med ulike verdier av valgt parameter. For Normal: små σ gir høy, smal topp; stor σ flater og brer. For Eksponential: stor λ → brattere fall.",
  sampling:
    "Trekk n samples via invers-CDF (Uniform/Exp) eller Box-Muller (Normal). Når n vokser konvergerer histogrammet mot den teoretiske PDF-en (store talls lov).",
  clt: "Den klassiske CLT-eksperimentet: ta gjennomsnittet av n eksponensielle samples, gjenta 1000 ganger. Selv om kilden er sterkt skjev (Exp), blir fordelingen av X̄ tilnærmet Normal(1/λ, 1/(λ√n)) — og blir bedre jo større n.",
};

// ============================================================================
// Math
// ============================================================================

function erf(x: number): number {
  // Abramowitz & Stegun 7.1.26
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-ax * ax);
  return sign * y;
}

function normPdf(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}
function normCdf(x: number, mu: number, sigma: number): number {
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2)));
}
function expPdf(x: number, lambda: number): number {
  return x < 0 ? 0 : lambda * Math.exp(-lambda * x);
}
function expCdf(x: number, lambda: number): number {
  return x < 0 ? 0 : 1 - Math.exp(-lambda * x);
}
function uniPdf(x: number, a: number, b: number): number {
  return x < a || x > b ? 0 : 1 / (b - a);
}
function uniCdf(x: number, a: number, b: number): number {
  if (x < a) return 0;
  if (x > b) return 1;
  return (x - a) / (b - a);
}

function pdf(dist: Dist, x: number, p: DistParams): number {
  if (dist === "normal") return normPdf(x, p.mu, p.sigma);
  if (dist === "exp") return expPdf(x, p.lambda);
  return uniPdf(x, p.a, p.b);
}
function cdf(dist: Dist, x: number, p: DistParams): number {
  if (dist === "normal") return normCdf(x, p.mu, p.sigma);
  if (dist === "exp") return expCdf(x, p.lambda);
  return uniCdf(x, p.a, p.b);
}

type DistParams = {
  mu: number; // normal
  sigma: number; // normal
  lambda: number; // exp
  a: number; // uniform low
  b: number; // uniform high
};

// Box-Muller — én standard normal
function randNorm(): number {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function sampleOne(dist: Dist, p: DistParams): number {
  if (dist === "normal") return p.mu + p.sigma * randNorm();
  if (dist === "exp") return -Math.log(1 - Math.random()) / p.lambda;
  return p.a + (p.b - p.a) * Math.random();
}

function theoreticalMean(dist: Dist, p: DistParams): number {
  if (dist === "normal") return p.mu;
  if (dist === "exp") return 1 / p.lambda;
  return (p.a + p.b) / 2;
}
function theoreticalVar(dist: Dist, p: DistParams): number {
  if (dist === "normal") return p.sigma * p.sigma;
  if (dist === "exp") return 1 / (p.lambda * p.lambda);
  return ((p.b - p.a) * (p.b - p.a)) / 12;
}

// Numerisk integral via trapes
function trapezoidArea(xs: number[], ys: number[], lo: number, hi: number): number {
  let s = 0;
  for (let i = 1; i < xs.length; i++) {
    const xL = xs[i - 1],
      xR = xs[i];
    if (xR < lo || xL > hi) continue;
    const cL = Math.max(xL, lo);
    const cR = Math.min(xR, hi);
    if (cR <= cL) continue;
    // lineær interpolasjon av y mellom xL..xR
    const fL = ys[i - 1] + ((ys[i] - ys[i - 1]) * (cL - xL)) / (xR - xL);
    const fR = ys[i - 1] + ((ys[i] - ys[i - 1]) * (cR - xL)) / (xR - xL);
    s += ((fL + fR) / 2) * (cR - cL);
  }
  return s;
}

// Bygg n+1 sample-punkter
function sampleGrid(
  dist: Dist,
  p: DistParams,
  n = 200,
): { xs: number[]; ys: number[]; cy: number[]; lo: number; hi: number } {
  let lo = -1,
    hi = 1;
  if (dist === "normal") {
    lo = p.mu - 4 * p.sigma;
    hi = p.mu + 4 * p.sigma;
  } else if (dist === "exp") {
    lo = 0;
    hi = Math.max(6 / p.lambda, 1);
  } else {
    const pad = (p.b - p.a) * 0.15;
    lo = p.a - pad;
    hi = p.b + pad;
  }
  const step = (hi - lo) / n;
  const xs: number[] = [];
  const ys: number[] = [];
  const cy: number[] = [];
  for (let i = 0; i <= n; i++) {
    const x = lo + i * step;
    xs.push(x);
    ys.push(pdf(dist, x, p));
    cy.push(cdf(dist, x, p));
  }
  return { xs, ys, cy, lo, hi };
}

// ============================================================================
// Root component
// ============================================================================

export function FordelingerVisualizer() {
  const [mode, setMode] = useState<Mode>("pdf-cdf");

  return (
    <div
      className="rounded-2xl border border-border bg-card overflow-hidden"
      role="region"
      aria-label="Interaktiv visualisering: Kontinuerlige fordelinger"
    >
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Kontinuerlige fordelinger — PDF/CDF, parameter-effekt, sampling og CLT
            </div>
          </div>
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

      <div className="px-4 py-3 border-b border-border bg-brand/5 flex items-start gap-2 text-xs">
        <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
        <div className="text-muted-foreground">{MODE_NOTE[mode]}</div>
      </div>

      <div className="p-4 sm:p-5 bg-background">
        {mode === "pdf-cdf" && <PdfCdfMode />}
        {mode === "params" && <ParamsMode />}
        {mode === "sampling" && <SamplingMode />}
        {mode === "clt" && <CltMode />}
      </div>
    </div>
  );
}

// ============================================================================
// Helpers — felles UI-deler
// ============================================================================

function DistPicker({
  value,
  onChange,
  options = ["uniform", "exp", "normal"] as Dist[],
}: {
  value: Dist;
  onChange: (d: Dist) => void;
  options?: Dist[];
}) {
  const labels: Record<Dist, string> = {
    uniform: "Uniform",
    exp: "Eksponential",
    normal: "Normal",
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => onChange(d)}
          className={`px-2.5 py-1 rounded text-xs border ${
            value === d
              ? "border-brand bg-brand/10 text-brand"
              : "border-border bg-background hover:border-brand/40"
          }`}
        >
          {labels[d]}
        </button>
      ))}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 0.1,
  onChange,
  format = (v) => v.toFixed(2),
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
  format?: (n: number) => string;
}) {
  return (
    <label className="block text-sm">
      <span className="block text-xs text-muted-foreground mb-1">
        {label} = <span className="font-mono text-foreground">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand"
      />
    </label>
  );
}

function ParamSliders({
  dist,
  params,
  setParams,
}: {
  dist: Dist;
  params: DistParams;
  setParams: (p: DistParams) => void;
}) {
  if (dist === "normal") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Slider
          label="μ"
          value={params.mu}
          min={-3}
          max={3}
          step={0.1}
          onChange={(v) => setParams({ ...params, mu: v })}
        />
        <Slider
          label="σ"
          value={params.sigma}
          min={0.3}
          max={3}
          step={0.1}
          onChange={(v) => setParams({ ...params, sigma: v })}
        />
      </div>
    );
  }
  if (dist === "exp") {
    return (
      <Slider
        label="λ (rate)"
        value={params.lambda}
        min={0.2}
        max={4}
        step={0.1}
        onChange={(v) => setParams({ ...params, lambda: v })}
      />
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      <Slider
        label="a"
        value={params.a}
        min={-3}
        max={params.b - 0.2}
        step={0.1}
        onChange={(v) => setParams({ ...params, a: v })}
      />
      <Slider
        label="b"
        value={params.b}
        min={params.a + 0.2}
        max={5}
        step={0.1}
        onChange={(v) => setParams({ ...params, b: v })}
      />
    </div>
  );
}

// ============================================================================
// MODUS 1: PDF + CDF side-ved-side
// ============================================================================

function PdfCdfMode() {
  const [dist, setDist] = useState<Dist>("normal");
  const [params, setParams] = useState<DistParams>({
    mu: 0,
    sigma: 1,
    lambda: 1,
    a: 0,
    b: 2,
  });
  const [aRange, setARange] = useState(-1);
  const [bRange, setBRange] = useState(1);

  const grid = useMemo(() => sampleGrid(dist, params, 240), [dist, params]);
  const { xs, ys, cy, lo, hi } = grid;

  // Klipp range slik at sliderne alltid har sense default for valgt dist
  const effA = Math.max(lo, Math.min(aRange, hi));
  const effB = Math.max(effA, Math.min(bRange, hi));

  const pValue = useMemo(() => {
    const Fa = cdf(dist, effA, params);
    const Fb = cdf(dist, effB, params);
    return { Fa, Fb, diff: Fb - Fa };
  }, [dist, effA, effB, params]);

  const trapArea = useMemo(() => trapezoidArea(xs, ys, effA, effB), [xs, ys, effA, effB]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Fordeling:</span>
        <DistPicker value={dist} onChange={setDist} />
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
        <ParamSliders dist={dist} params={params} setParams={setParams} />
        <div className="grid grid-cols-2 gap-3">
          <Slider
            label="a (nedre grense)"
            value={effA}
            min={lo}
            max={hi}
            step={(hi - lo) / 200}
            onChange={(v) => setARange(Math.min(v, bRange))}
          />
          <Slider
            label="b (øvre grense)"
            value={effB}
            min={lo}
            max={hi}
            step={(hi - lo) / 200}
            onChange={(v) => setBRange(Math.max(v, aRange))}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <CurveChart
          title="PDF f(x)"
          xs={xs}
          ys={ys}
          lo={lo}
          hi={hi}
          shadeA={effA}
          shadeB={effB}
          yAxisLabel="tetthet"
        />
        <CurveChart
          title="CDF F(x)"
          xs={xs}
          ys={cy}
          lo={lo}
          hi={hi}
          yMax={1}
          markerXs={[effA, effB]}
          yAxisLabel="kumulativ"
        />
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-3 font-mono text-xs space-y-1">
        <div>
          P({effA.toFixed(2)} ≤ X ≤ {effB.toFixed(2)}) ={" "}
          <span className="text-brand font-semibold">{pValue.diff.toFixed(4)}</span>{" "}
          <span className="text-muted-foreground">
            (= F({effB.toFixed(2)}) − F({effA.toFixed(2)}) = {pValue.Fb.toFixed(4)} −{" "}
            {pValue.Fa.toFixed(4)})
          </span>
        </div>
        <div className="text-muted-foreground">
          Skravert areal (numerisk integral) ≈ {trapArea.toFixed(4)} — bekrefter at det er samme
          tall.
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODUS 2: Parameter-effekt — ghost-kurver
// ============================================================================

type ParamsVarKey = "mu" | "sigma" | "lambda" | "width";

const PARAMS_DEFAULT_VAR: Record<Dist, ParamsVarKey> = {
  normal: "sigma",
  exp: "lambda",
  uniform: "width",
};

const PARAMS_ALLOWED: Record<Dist, { key: ParamsVarKey; label: string }[]> = {
  normal: [
    { key: "mu", label: "μ (lokasjon)" },
    { key: "sigma", label: "σ (spredning)" },
  ],
  exp: [{ key: "lambda", label: "λ (rate)" }],
  uniform: [{ key: "width", label: "bredde b−a" }],
};

const PARAMS_GHOST_VALUES: Record<ParamsVarKey, number[]> = {
  mu: [-1, 0, 1.5],
  sigma: [0.5, 1, 2],
  lambda: [0.5, 1, 2],
  width: [1, 2, 4],
};

const PARAMS_COLORS = ["var(--brand)", "hsl(140 60% 45%)", "hsl(25 85% 55%)"];

function ParamsMode() {
  const [dist, setDist] = useState<Dist>("normal");
  const [varKey, setVarKey] = useState<ParamsVarKey>(PARAMS_DEFAULT_VAR.normal);

  const defaultVar = PARAMS_DEFAULT_VAR;
  const allowed = PARAMS_ALLOWED;
  const fixedColors = PARAMS_COLORS;

  // Bygg én DistParams per ghost-verdi
  const ghosts = useMemo(() => {
    const vals = PARAMS_GHOST_VALUES[varKey];
    return vals.map((v) => {
      const base: DistParams = {
        mu: 0,
        sigma: 1,
        lambda: 1,
        a: 0,
        b: 2,
      };
      if (varKey === "mu") base.mu = v;
      else if (varKey === "sigma") base.sigma = v;
      else if (varKey === "lambda") base.lambda = v;
      else if (varKey === "width") {
        base.a = -v / 2;
        base.b = v / 2;
      }
      return { value: v, params: base };
    });
  }, [varKey]);

  // Felles akser: forene lo/hi over alle ghost-kurver
  const grids = useMemo(() => ghosts.map((g) => sampleGrid(dist, g.params, 200)), [dist, ghosts]);
  const lo = Math.min(...grids.map((g) => g.lo));
  const hi = Math.max(...grids.map((g) => g.hi));
  const yMax = Math.max(...grids.flatMap((g) => g.ys)) * 1.1 || 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Fordeling:</span>
        <DistPicker
          value={dist}
          onChange={(d) => {
            setDist(d);
            setVarKey(defaultVar[d]);
          }}
        />
      </div>

      {allowed[dist].length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Varier:</span>
          {allowed[dist].map((opt) => (
            <label
              key={opt.key}
              className={`px-2.5 py-1 rounded text-xs border cursor-pointer ${
                varKey === opt.key
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-background hover:border-brand/40"
              }`}
            >
              <input
                type="radio"
                name="varkey"
                value={opt.key}
                checked={varKey === opt.key}
                onChange={() => setVarKey(opt.key)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <GhostChart
          curves={grids.map((g, i) => ({
            xs: g.xs,
            ys: g.ys,
            color: fixedColors[i] ?? "currentColor",
            label: ghostLabel(varKey, ghosts[i].value),
          }))}
          lo={lo}
          hi={hi}
          yMax={yMax}
        />
        <div className="mt-2 flex flex-wrap gap-3 text-xs font-mono">
          {ghosts.map((g, i) => (
            <span key={g.value} className="flex items-center gap-1.5">
              <span
                className="inline-block w-3 h-1.5 rounded"
                style={{ background: fixedColors[i] }}
              />
              {ghostLabel(varKey, g.value)}
            </span>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Areal under hver kurve er alltid 1 — så høyere topp betyr smalere kurve. Det er bare
        omfordeling av sannsynlighet.
      </div>
    </div>
  );
}

function ghostLabel(varKey: string, v: number): string {
  if (varKey === "mu") return `μ = ${v}`;
  if (varKey === "sigma") return `σ = ${v}`;
  if (varKey === "lambda") return `λ = ${v}`;
  if (varKey === "width") return `bredde = ${v}`;
  return String(v);
}

// ============================================================================
// MODUS 3: Sampling-simulator
// ============================================================================

function SamplingMode() {
  const [dist, setDist] = useState<Dist>("normal");
  const [params, setParams] = useState<DistParams>({
    mu: 0,
    sigma: 1,
    lambda: 1,
    a: 0,
    b: 2,
  });
  const [n, setN] = useState(100);
  const [samples, setSamples] = useState<number[]>([]);
  const seedRef = useRef(0);

  const drawSamples = () => {
    const out: number[] = [];
    for (let i = 0; i < n; i++) out.push(sampleOne(dist, params));
    setSamples(out);
    seedRef.current++;
  };

  const grid = useMemo(() => sampleGrid(dist, params, 200), [dist, params]);
  const { xs, ys, lo, hi } = grid;

  // Histogram-bins
  const binCount = 24;
  const histo = useMemo(() => {
    if (samples.length === 0) return null;
    const counts = new Array(binCount).fill(0);
    const w = (hi - lo) / binCount;
    let inRange = 0;
    for (const s of samples) {
      if (s < lo || s >= hi) continue;
      const idx = Math.min(binCount - 1, Math.floor((s - lo) / w));
      counts[idx]++;
      inRange++;
    }
    // Normaliser til tetthet
    const densities = counts.map((c) => c / (Math.max(1, inRange) * w));
    return { counts, densities, binWidth: w, total: inRange };
  }, [samples, lo, hi]);

  const sampleStats = useMemo(() => {
    if (samples.length === 0) return null;
    const mean = samples.reduce((s, x) => s + x, 0) / samples.length;
    const v = samples.reduce((s, x) => s + (x - mean) * (x - mean), 0) / samples.length;
    return { mean, variance: v };
  }, [samples]);

  const tMean = theoreticalMean(dist, params);
  const tVar = theoreticalVar(dist, params);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Fordeling:</span>
        <DistPicker value={dist} onChange={setDist} />
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
        <ParamSliders dist={dist} params={params} setParams={setParams} />
        <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
          <Slider
            label="n (antall samples)"
            value={n}
            min={10}
            max={5000}
            step={10}
            onChange={setN}
            format={(v) => String(Math.round(v))}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={drawSamples}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-brand text-brand-foreground text-xs font-medium hover:opacity-90"
            >
              <Play className="h-3 w-3" />
              Trekk {n}
            </button>
            <button
              type="button"
              onClick={() => setSamples([])}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-muted"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <HistogramChart
          densities={histo?.densities ?? null}
          binCount={binCount}
          lo={lo}
          hi={hi}
          pdfXs={xs}
          pdfYs={ys}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-2 text-xs font-mono">
        <div className="rounded border border-border p-2 bg-background">
          <div className="text-muted-foreground mb-0.5">Sample</div>
          <div>n = {samples.length || "—"}</div>
          <div>x̄ = {sampleStats ? sampleStats.mean.toFixed(4) : "—"}</div>
          <div>s² = {sampleStats ? sampleStats.variance.toFixed(4) : "—"}</div>
        </div>
        <div className="rounded border border-border p-2 bg-background">
          <div className="text-muted-foreground mb-0.5">Teoretisk</div>
          <div>—</div>
          <div>E[X] = {tMean.toFixed(4)}</div>
          <div>Var(X) = {tVar.toFixed(4)}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODUS 4: CLT live
// ============================================================================

function CltMode() {
  const [n, setN] = useState(5);
  const [lambda, setLambda] = useState(1);
  const REPS = 1000;

  const result = useMemo(() => {
    // For hver av REPS: gjennomsnitt av n eksp(lambda)-samples
    const means: number[] = [];
    for (let r = 0; r < REPS; r++) {
      let s = 0;
      for (let i = 0; i < n; i++) {
        s += -Math.log(1 - Math.random()) / lambda;
      }
      means.push(s / n);
    }
    return means;
  }, [n, lambda]);

  // Teoretiske aksers grenser: konsentrer rundt 1/lambda
  const mu = 1 / lambda;
  const sd = 1 / (lambda * Math.sqrt(n));
  const lo = Math.max(0, mu - 4 * sd);
  const hi = mu + 4 * sd;

  // Empiriske bins
  const binCount = 30;
  const binW = (hi - lo) / binCount;
  const counts = new Array(binCount).fill(0);
  let inRange = 0;
  for (const m of result) {
    if (m < lo || m >= hi) continue;
    const idx = Math.min(binCount - 1, Math.floor((m - lo) / binW));
    counts[idx]++;
    inRange++;
  }
  const densities = counts.map((c) => c / (Math.max(1, inRange) * binW));

  // Teoretisk Normal-kurve overlay
  const NPOINTS = 200;
  const pdfXs: number[] = [];
  const pdfYs: number[] = [];
  for (let i = 0; i <= NPOINTS; i++) {
    const x = lo + ((hi - lo) * i) / NPOINTS;
    pdfXs.push(x);
    pdfYs.push(normPdf(x, mu, sd));
  }

  // Empirisk mean/var
  const empMean = result.reduce((s, x) => s + x, 0) / result.length;
  const empVar = result.reduce((s, x) => s + (x - empMean) * (x - empMean), 0) / result.length;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <Slider
            label="n (samples per gjennomsnitt)"
            value={n}
            min={1}
            max={50}
            step={1}
            onChange={setN}
            format={(v) => String(Math.round(v))}
          />
          <Slider
            label="λ (Eksp-rate)"
            value={lambda}
            min={0.3}
            max={3}
            step={0.1}
            onChange={setLambda}
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Kilde: <span className="font-mono">Exp(λ={lambda.toFixed(1)})</span> — sterkt skjev. Bygg
          X̄ ved å snitte n samples, gjenta {REPS} ganger.
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <HistogramChart
          densities={densities}
          binCount={binCount}
          lo={lo}
          hi={hi}
          pdfXs={pdfXs}
          pdfYs={pdfYs}
        />
        <div className="mt-2 text-xs font-mono text-muted-foreground">
          Overlay: Normal(μ = 1/λ = {mu.toFixed(3)}, σ = 1/(λ√n) = {sd.toFixed(3)})
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2 text-xs font-mono">
        <div className="rounded border border-border p-2 bg-background">
          <div className="text-muted-foreground mb-0.5">Empirisk (1000 X̄)</div>
          <div>x̄ av X̄ = {empMean.toFixed(4)}</div>
          <div>s² av X̄ = {empVar.toFixed(4)}</div>
        </div>
        <div className="rounded border border-border p-2 bg-background">
          <div className="text-muted-foreground mb-0.5">Teoretisk (CLT)</div>
          <div>E[X̄] = 1/λ = {mu.toFixed(4)}</div>
          <div>Var(X̄) = 1/(λ²n) = {(sd * sd).toFixed(4)}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SVG-charts
// ============================================================================

const VB_W = 480;
const VB_H = 220;
const PAD_L = 36;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 28;

function CurveChart({
  title,
  xs,
  ys,
  lo,
  hi,
  yMax,
  shadeA,
  shadeB,
  markerXs,
  yAxisLabel,
}: {
  title: string;
  xs: number[];
  ys: number[];
  lo: number;
  hi: number;
  yMax?: number;
  shadeA?: number;
  shadeB?: number;
  markerXs?: number[];
  yAxisLabel?: string;
}) {
  const localYMax = yMax ?? (Math.max(...ys) * 1.15 || 1);
  const xScale = (x: number) => PAD_L + ((x - lo) / (hi - lo)) * (VB_W - PAD_L - PAD_R);
  const yScale = (y: number) => VB_H - PAD_B - (y / localYMax) * (VB_H - PAD_T - PAD_B);

  const linePoints = xs.map((x, i) => `${xScale(x)},${yScale(ys[i])}`).join(" ");

  // Shade-region som lukket polygon
  let shadePath: string | null = null;
  if (shadeA !== undefined && shadeB !== undefined && shadeB > shadeA) {
    const inRange = xs
      .map((x, i) => ({ x, y: ys[i] }))
      .filter((p) => p.x >= shadeA && p.x <= shadeB);
    if (inRange.length > 1) {
      const top = inRange.map((p) => `${xScale(p.x)},${yScale(p.y)}`).join(" L ");
      shadePath = `M ${xScale(shadeA)},${yScale(0)} L ${top} L ${xScale(shadeB)},${yScale(0)} Z`;
    }
  }

  // X-ticks: 5 stk
  const xTicks: number[] = [];
  for (let i = 0; i <= 4; i++) xTicks.push(lo + ((hi - lo) * i) / 4);
  // Y-ticks: 3
  const yTicks: number[] = [0, localYMax / 2, localYMax];

  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-1">{title}</div>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full h-auto block"
        role="img"
        aria-label={title}
      >
        {/* Akser */}
        <line
          x1={PAD_L}
          y1={VB_H - PAD_B}
          x2={VB_W - PAD_R}
          y2={VB_H - PAD_B}
          stroke="currentColor"
          strokeOpacity={0.4}
        />
        <line
          x1={PAD_L}
          y1={PAD_T}
          x2={PAD_L}
          y2={VB_H - PAD_B}
          stroke="currentColor"
          strokeOpacity={0.4}
        />

        {/* Y-grid */}
        {yTicks.map((yt, i) => (
          <g key={i}>
            <line
              x1={PAD_L}
              y1={yScale(yt)}
              x2={VB_W - PAD_R}
              y2={yScale(yt)}
              stroke="currentColor"
              strokeOpacity={0.08}
            />
            <text
              x={PAD_L - 4}
              y={yScale(yt) + 3}
              fontSize={9}
              textAnchor="end"
              fill="currentColor"
              opacity={0.6}
            >
              {yt.toFixed(2)}
            </text>
          </g>
        ))}

        {/* X-ticks */}
        {xTicks.map((xt, i) => (
          <g key={i}>
            <line
              x1={xScale(xt)}
              y1={VB_H - PAD_B}
              x2={xScale(xt)}
              y2={VB_H - PAD_B + 3}
              stroke="currentColor"
              strokeOpacity={0.5}
            />
            <text
              x={xScale(xt)}
              y={VB_H - PAD_B + 14}
              fontSize={9}
              textAnchor="middle"
              fill="currentColor"
              opacity={0.7}
            >
              {xt.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Shade */}
        {shadePath && <path d={shadePath} fill="var(--brand)" fillOpacity={0.25} stroke="none" />}

        {/* Kurve */}
        <polyline
          points={linePoints}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={1.8}
          strokeLinejoin="round"
        />

        {/* Markører — vertikale linjer + horisontale ledelinjer (for CDF) */}
        {markerXs &&
          markerXs.map((mx, i) => {
            const mxClamped = Math.max(lo, Math.min(hi, mx));
            const idx = Math.round(((mxClamped - lo) / (hi - lo)) * (xs.length - 1));
            const my = ys[idx] ?? 0;
            return (
              <g key={i}>
                <line
                  x1={xScale(mxClamped)}
                  y1={yScale(0)}
                  x2={xScale(mxClamped)}
                  y2={yScale(my)}
                  stroke="hsl(0 70% 55%)"
                  strokeDasharray="3 3"
                  strokeWidth={1.2}
                />
                <line
                  x1={PAD_L}
                  y1={yScale(my)}
                  x2={xScale(mxClamped)}
                  y2={yScale(my)}
                  stroke="hsl(0 70% 55%)"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  opacity={0.7}
                />
                <circle cx={xScale(mxClamped)} cy={yScale(my)} r={3} fill="hsl(0 70% 55%)" />
                <text
                  x={xScale(mxClamped) + 4}
                  y={yScale(my) - 4}
                  fontSize={9}
                  fill="hsl(0 70% 55%)"
                  fontFamily="ui-monospace, monospace"
                >
                  {my.toFixed(3)}
                </text>
              </g>
            );
          })}

        {/* Shade-grenselinjer for PDF */}
        {shadeA !== undefined && shadeB !== undefined && (
          <>
            <line
              x1={xScale(shadeA)}
              y1={PAD_T}
              x2={xScale(shadeA)}
              y2={VB_H - PAD_B}
              stroke="hsl(0 70% 55%)"
              strokeDasharray="3 3"
              strokeWidth={1}
              opacity={0.6}
            />
            <line
              x1={xScale(shadeB)}
              y1={PAD_T}
              x2={xScale(shadeB)}
              y2={VB_H - PAD_B}
              stroke="hsl(0 70% 55%)"
              strokeDasharray="3 3"
              strokeWidth={1}
              opacity={0.6}
            />
          </>
        )}

        {yAxisLabel && (
          <text x={6} y={PAD_T + 6} fontSize={8} fill="currentColor" opacity={0.5}>
            {yAxisLabel}
          </text>
        )}
      </svg>
    </div>
  );
}

function GhostChart({
  curves,
  lo,
  hi,
  yMax,
}: {
  curves: { xs: number[]; ys: number[]; color: string; label: string }[];
  lo: number;
  hi: number;
  yMax: number;
}) {
  const xScale = (x: number) => PAD_L + ((x - lo) / (hi - lo)) * (VB_W - PAD_L - PAD_R);
  const yScale = (y: number) => VB_H - PAD_B - (y / yMax) * (VB_H - PAD_T - PAD_B);

  const xTicks: number[] = [];
  for (let i = 0; i <= 4; i++) xTicks.push(lo + ((hi - lo) * i) / 4);
  const yTicks: number[] = [0, yMax / 2, yMax];

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="w-full h-auto block"
      role="img"
      aria-label="Parameter-effekt ghost-kurver"
    >
      <line
        x1={PAD_L}
        y1={VB_H - PAD_B}
        x2={VB_W - PAD_R}
        y2={VB_H - PAD_B}
        stroke="currentColor"
        strokeOpacity={0.4}
      />
      <line
        x1={PAD_L}
        y1={PAD_T}
        x2={PAD_L}
        y2={VB_H - PAD_B}
        stroke="currentColor"
        strokeOpacity={0.4}
      />
      {yTicks.map((yt, i) => (
        <g key={i}>
          <line
            x1={PAD_L}
            y1={yScale(yt)}
            x2={VB_W - PAD_R}
            y2={yScale(yt)}
            stroke="currentColor"
            strokeOpacity={0.08}
          />
          <text
            x={PAD_L - 4}
            y={yScale(yt) + 3}
            fontSize={9}
            textAnchor="end"
            fill="currentColor"
            opacity={0.6}
          >
            {yt.toFixed(2)}
          </text>
        </g>
      ))}
      {xTicks.map((xt, i) => (
        <g key={i}>
          <line
            x1={xScale(xt)}
            y1={VB_H - PAD_B}
            x2={xScale(xt)}
            y2={VB_H - PAD_B + 3}
            stroke="currentColor"
            strokeOpacity={0.5}
          />
          <text
            x={xScale(xt)}
            y={VB_H - PAD_B + 14}
            fontSize={9}
            textAnchor="middle"
            fill="currentColor"
            opacity={0.7}
          >
            {xt.toFixed(1)}
          </text>
        </g>
      ))}
      {curves.map((c, i) => (
        <polyline
          key={i}
          points={c.xs.map((x, j) => `${xScale(x)},${yScale(c.ys[j])}`).join(" ")}
          fill="none"
          stroke={c.color}
          strokeWidth={1.8}
          strokeLinejoin="round"
          opacity={0.9}
        />
      ))}
    </svg>
  );
}

function HistogramChart({
  densities,
  binCount,
  lo,
  hi,
  pdfXs,
  pdfYs,
}: {
  densities: number[] | null;
  binCount: number;
  lo: number;
  hi: number;
  pdfXs: number[];
  pdfYs: number[];
}) {
  const yMaxData = Math.max(...(densities ?? [0]), ...pdfYs);
  const yMax = (yMaxData || 1) * 1.1;
  const xScale = (x: number) => PAD_L + ((x - lo) / (hi - lo)) * (VB_W - PAD_L - PAD_R);
  const yScale = (y: number) => VB_H - PAD_B - (y / yMax) * (VB_H - PAD_T - PAD_B);
  const binW = (VB_W - PAD_L - PAD_R) / binCount;

  const xTicks: number[] = [];
  for (let i = 0; i <= 4; i++) xTicks.push(lo + ((hi - lo) * i) / 4);

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="w-full h-auto block"
      role="img"
      aria-label="Histogram med teoretisk PDF overlay"
    >
      <line
        x1={PAD_L}
        y1={VB_H - PAD_B}
        x2={VB_W - PAD_R}
        y2={VB_H - PAD_B}
        stroke="currentColor"
        strokeOpacity={0.4}
      />
      <line
        x1={PAD_L}
        y1={PAD_T}
        x2={PAD_L}
        y2={VB_H - PAD_B}
        stroke="currentColor"
        strokeOpacity={0.4}
      />
      {xTicks.map((xt, i) => (
        <g key={i}>
          <line
            x1={xScale(xt)}
            y1={VB_H - PAD_B}
            x2={xScale(xt)}
            y2={VB_H - PAD_B + 3}
            stroke="currentColor"
            strokeOpacity={0.5}
          />
          <text
            x={xScale(xt)}
            y={VB_H - PAD_B + 14}
            fontSize={9}
            textAnchor="middle"
            fill="currentColor"
            opacity={0.7}
          >
            {xt.toFixed(2)}
          </text>
        </g>
      ))}

      {/* Histogram-barer */}
      {densities &&
        densities.map((d, i) => {
          const x = PAD_L + i * binW;
          const y = yScale(d);
          const h = VB_H - PAD_B - y;
          if (h <= 0) return null;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={binW - 1}
              height={h}
              fill="hsl(220 30% 60%)"
              fillOpacity={0.45}
              stroke="hsl(220 30% 40%)"
              strokeOpacity={0.4}
              strokeWidth={0.5}
            />
          );
        })}

      {/* Teoretisk PDF overlay */}
      <polyline
        points={pdfXs.map((x, i) => `${xScale(x)},${yScale(pdfYs[i])}`).join(" ")}
        fill="none"
        stroke="var(--brand)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  );
}
