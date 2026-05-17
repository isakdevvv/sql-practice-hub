import { useMemo, useState } from "react";
import {
  DIST_IS_DISCRETE,
  DIST_LABELS,
  type DistKind,
  type DistParams,
  distCdf,
  distDomain,
  distMoments,
  distPdf,
  distSample,
  histogram,
  mean as sampleMean,
  mulberry32,
  std as sampleStd,
} from "./distUtils";

/**
 * DistributionExplorer — interaktiv velger for 8 fordelinger.
 * - Sliders pr. fordeling
 * - PDF/PMF + CDF tegnes live
 * - Moments-panel oppdateres
 * - "Sample 1000": trekk samples og overlay histogram
 */

const KINDS: DistKind[] = [
  "normal", "exponential", "uniform", "binomial",
  "poisson", "gamma", "chisq", "studentt",
];

const DEFAULT_PARAMS: DistParams = {
  mu: 0, sigma: 1,
  lambda: 1,
  a: 0, b: 1,
  n: 20, p: 0.4,
  shape: 2, rate: 1,
  df: 5,
};

function Slider({
  label, min, max, step, value, onChange, suffix,
}: {
  label: string; min: number; max: number; step: number;
  value: number; onChange: (v: number) => void; suffix?: string;
}) {
  return (
    <label className="flex items-center gap-2 text-[11px]">
      <span className="w-16 shrink-0 text-muted-foreground">{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="flex-1"
      />
      <span className="tabular-nums w-12 text-right">{value.toFixed(step < 1 ? 2 : 0)}{suffix ?? ""}</span>
    </label>
  );
}

function ParamControls({
  kind, par, setPar,
}: {
  kind: DistKind; par: DistParams; setPar: (p: DistParams) => void;
}) {
  const upd = (patch: Partial<DistParams>) => setPar({ ...par, ...patch });
  switch (kind) {
    case "normal":
      return (
        <div className="space-y-1.5">
          <Slider label="µ" min={-5} max={5} step={0.1} value={par.mu ?? 0} onChange={(v) => upd({ mu: v })} />
          <Slider label="σ" min={0.3} max={3} step={0.1} value={par.sigma ?? 1} onChange={(v) => upd({ sigma: v })} />
        </div>
      );
    case "exponential":
      return (
        <div className="space-y-1.5">
          <Slider label="λ (rate)" min={0.1} max={3} step={0.1} value={par.lambda ?? 1} onChange={(v) => upd({ lambda: v })} />
        </div>
      );
    case "uniform":
      return (
        <div className="space-y-1.5">
          <Slider label="a" min={-5} max={4} step={0.5} value={par.a ?? 0} onChange={(v) => upd({ a: v })} />
          <Slider label="b" min={-3} max={8} step={0.5} value={par.b ?? 1} onChange={(v) => upd({ b: Math.max(v, (par.a ?? 0) + 0.5) })} />
        </div>
      );
    case "binomial":
      return (
        <div className="space-y-1.5">
          <Slider label="n" min={1} max={100} step={1} value={par.n ?? 20} onChange={(v) => upd({ n: Math.round(v) })} />
          <Slider label="p" min={0.01} max={0.99} step={0.01} value={par.p ?? 0.5} onChange={(v) => upd({ p: v })} />
        </div>
      );
    case "poisson":
      return (
        <div className="space-y-1.5">
          <Slider label="λ" min={0.5} max={30} step={0.5} value={par.lambda ?? 1} onChange={(v) => upd({ lambda: v })} />
        </div>
      );
    case "gamma":
      return (
        <div className="space-y-1.5">
          <Slider label="shape (k)" min={0.5} max={10} step={0.1} value={par.shape ?? 2} onChange={(v) => upd({ shape: v })} />
          <Slider label="rate (β)" min={0.2} max={5} step={0.1} value={par.rate ?? 1} onChange={(v) => upd({ rate: v })} />
        </div>
      );
    case "chisq":
      return (
        <div className="space-y-1.5">
          <Slider label="df (k)" min={1} max={30} step={1} value={par.df ?? 3} onChange={(v) => upd({ df: Math.round(v) })} />
        </div>
      );
    case "studentt":
      return (
        <div className="space-y-1.5">
          <Slider label="df (ν)" min={1} max={50} step={1} value={par.df ?? 5} onChange={(v) => upd({ df: Math.round(v) })} />
        </div>
      );
  }
}

function CurvePlot({
  kind, par, samples, mode,
}: {
  kind: DistKind; par: DistParams; samples: number[]; mode: "pdf" | "cdf";
}) {
  const W = 360, H = 200;
  const padL = 36, padR = 8, padT = 8, padB = 24;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const isDisc = DIST_IS_DISCRETE[kind];
  const [a, b] = distDomain(kind, par);
  const xPx = (x: number) => padL + ((x - a) / (b - a)) * plotW;

  // Sample y-values
  const points: Array<{ x: number; y: number }> = [];
  if (isDisc) {
    const lo = Math.max(0, Math.floor(a));
    const hi = Math.ceil(b);
    if (mode === "pdf") {
      for (let k = lo; k <= hi; k++) points.push({ x: k, y: distPdf(kind, par, k) });
    } else {
      for (let k = lo; k <= hi; k++) points.push({ x: k, y: distCdf(kind, par, k) });
    }
  } else {
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const x = a + ((b - a) * i) / steps;
      const y = mode === "pdf" ? distPdf(kind, par, x) : distCdf(kind, par, x);
      points.push({ x, y });
    }
  }
  let yMax = 0;
  for (const pt of points) if (pt.y > yMax) yMax = pt.y;
  if (mode === "cdf") yMax = 1;
  // Histogram overlay (PDF only, sample density)
  let histBins: ReturnType<typeof histogram> = [];
  if (mode === "pdf" && samples.length > 0) {
    const nBins = isDisc ? Math.min(60, Math.ceil(b - a) + 1) : 30;
    histBins = histogram(samples, nBins, [a, b]);
    const binW = histBins.length > 0 ? histBins[0].x1 - histBins[0].x0 : 1;
    const total = samples.length;
    for (const h of histBins) {
      const dens = h.c / (total * binW);
      if (dens > yMax) yMax = dens;
    }
  }
  yMax = yMax * 1.12 + 1e-9;
  const yPx = (y: number) => padT + plotH - (y / yMax) * plotH;

  // Continuous: build line path
  let path = "";
  if (!isDisc) {
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      path += (i === 0 ? "M " : " L ") + xPx(pt.x).toFixed(2) + " " + yPx(pt.y).toFixed(2);
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-background rounded border border-border">
      <text x={padL} y={padT + 10} fontSize={10} className="fill-muted-foreground">
        {mode === "pdf" ? (isDisc ? "PMF p(x)" : "PDF f(x)") : "CDF F(x)"}
      </text>
      {/* axes */}
      <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke="hsl(0 0% 55%)" strokeWidth={0.7} />
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="hsl(0 0% 55%)" strokeWidth={0.7} />

      {/* histogram (PDF mode, samples) */}
      {mode === "pdf" && histBins.length > 0 && (() => {
        const binW = histBins[0].x1 - histBins[0].x0;
        const total = samples.length;
        return histBins.map((h, i) => {
          const dens = h.c / (total * binW);
          const x0 = xPx(h.x0), x1 = xPx(h.x1);
          const y0 = yPx(dens), yb = padT + plotH;
          return (
            <rect key={i} x={x0} y={y0}
              width={Math.max(0.5, x1 - x0 - 0.5)} height={Math.max(0, yb - y0)}
              fill="hsl(30 90% 55%)" opacity={0.55} />
          );
        });
      })()}

      {/* Discrete bars */}
      {isDisc && points.map((pt, i) => {
        const cx = xPx(pt.x);
        const yt = yPx(pt.y);
        const yb = padT + plotH;
        return (
          <g key={i}>
            <line x1={cx} y1={yt} x2={cx} y2={yb} stroke="hsl(220 75% 55%)" strokeWidth={2.5} />
            <circle cx={cx} cy={yt} r={2.6} fill="hsl(220 75% 55%)" />
          </g>
        );
      })}

      {/* Continuous line */}
      {!isDisc && (
        <path d={path} fill="none" stroke="hsl(220 75% 55%)" strokeWidth={1.8} />
      )}

      {/* x ticks */}
      {Array.from({ length: 5 }).map((_, i) => {
        const x = a + ((b - a) * i) / 4;
        return (
          <g key={i}>
            <line x1={xPx(x)} y1={padT + plotH} x2={xPx(x)} y2={padT + plotH + 3} stroke="hsl(0 0% 55%)" strokeWidth={0.7} />
            <text x={xPx(x)} y={padT + plotH + 14} fontSize={9} textAnchor="middle" className="fill-muted-foreground">
              {Math.abs(x) < 100 ? x.toFixed(1) : x.toFixed(0)}
            </text>
          </g>
        );
      })}
      {/* y ticks */}
      {Array.from({ length: 4 }).map((_, i) => {
        const y = (yMax * i) / 3;
        return (
          <g key={i}>
            <line x1={padL - 3} y1={yPx(y)} x2={padL} y2={yPx(y)} stroke="hsl(0 0% 55%)" strokeWidth={0.7} />
            <text x={padL - 5} y={yPx(y) + 3} fontSize={8} textAnchor="end" className="fill-muted-foreground">
              {y < 1 ? y.toFixed(2) : y.toFixed(1)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function MomentRow({ label, value, sampleValue, formula }: {
  label: string; value: number | null; sampleValue?: number; formula?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/60 py-1">
      <div>
        <div className="text-xs font-medium">{label}</div>
        {formula && <div className="text-[10px] text-muted-foreground font-mono">{formula}</div>}
      </div>
      <div className="text-right">
        <div className="text-xs tabular-nums font-semibold">
          {value === null || Number.isNaN(value as number) ? "—"
            : !isFinite(value as number) ? "∞"
              : (value as number).toFixed(3)}
        </div>
        {sampleValue !== undefined && (
          <div className="text-[10px] tabular-nums text-amber-700 dark:text-amber-400">
            sample: {sampleValue.toFixed(3)}
          </div>
        )}
      </div>
    </div>
  );
}

export function DistributionExplorer() {
  const [kind, setKind] = useState<DistKind>("normal");
  const [par, setPar] = useState<DistParams>({ ...DEFAULT_PARAMS });
  const [samples, setSamples] = useState<number[]>([]);
  const [seed, setSeed] = useState(20260518);

  const moments = useMemo(() => distMoments(kind, par), [kind, par]);
  const sMean = samples.length > 0 ? sampleMean(samples) : undefined;
  const sStd = samples.length > 1 ? sampleStd(samples) : undefined;

  function drawSamples(n: number) {
    const rng = mulberry32(seed);
    const arr: number[] = [];
    for (let i = 0; i < n; i++) arr.push(distSample(rng, kind, par));
    setSamples(arr);
    setSeed((s) => s + 1);
  }
  function clearSamples() { setSamples([]); }

  function changeKind(k: DistKind) {
    setKind(k);
    setSamples([]);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Distribution Explorer — alle 8 fordelinger, live PDF/CDF
      </div>
      <p className="text-xs text-muted-foreground">
        Velg en fordeling, juster parametrene, og se PDF/PMF og CDF endre seg
        live. Trekk 1 000 samples for å se hvordan histogrammet konvergerer mot
        den teoretiske tettheten — og hvordan stikkprøve-snittet / -avviket
        nærmer seg E[X] og √Var(X).
      </p>

      {/* distribution chooser */}
      <div className="flex flex-wrap gap-1.5">
        {KINDS.map((k) => (
          <button key={k} type="button" onClick={() => changeKind(k)}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition ${
              kind === k ? "bg-brand text-white border-brand"
                : "border-border bg-card hover:bg-muted"
            }`}>
            {DIST_LABELS[k]}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* params + samples controls */}
        <div className="lg:col-span-1 space-y-3">
          <div className="rounded-lg border border-border bg-background p-3 space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Parametre
            </div>
            <ParamControls kind={kind} par={par} setPar={setPar} />
          </div>

          <div className="rounded-lg border border-border bg-background p-3 space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sample
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => drawSamples(100)}
                className="px-2.5 py-1 rounded text-xs font-medium border border-border hover:bg-muted">
                100
              </button>
              <button type="button" onClick={() => drawSamples(1000)}
                className="px-2.5 py-1 rounded text-xs font-medium bg-brand text-white hover:bg-brand/90">
                Trekk 1 000
              </button>
              <button type="button" onClick={() => drawSamples(10000)}
                className="px-2.5 py-1 rounded text-xs font-medium border border-border hover:bg-muted">
                10 000
              </button>
              <button type="button" onClick={clearSamples}
                className="px-2.5 py-1 rounded text-xs font-medium border border-border hover:bg-muted">
                Reset
              </button>
            </div>
            <div className="text-[11px] text-muted-foreground">
              {samples.length > 0 ? `${samples.length} samples trukket` : "Ingen samples ennå"}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Moments
            </div>
            <MomentRow label="E[X]" value={moments.mean}
              sampleValue={sMean} formula="forventning" />
            <MomentRow label="Var(X)" value={moments.variance}
              formula="varians" />
            <MomentRow label="σ = √Var" value={moments.std}
              sampleValue={sStd} formula="standardavvik" />
            <MomentRow label="median" value={moments.median} />
            <MomentRow label="mode" value={moments.mode === null || Number.isNaN(moments.mode as number) ? null : moments.mode} />
            <MomentRow label="skewness" value={moments.skewness} formula="3. standardmoment" />
            <MomentRow label="ex. kurtosis" value={moments.kurtosis} formula="kurtose − 3" />
          </div>
        </div>

        {/* plots */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-3">
          <div>
            <div className="text-[11px] font-semibold mb-1 text-muted-foreground">
              {DIST_IS_DISCRETE[kind] ? "PMF" : "PDF"}{samples.length > 0 ? " + sample-histogram" : ""}
            </div>
            <CurvePlot kind={kind} par={par} samples={samples} mode="pdf" />
          </div>
          <div>
            <div className="text-[11px] font-semibold mb-1 text-muted-foreground">CDF</div>
            <CurvePlot kind={kind} par={par} samples={samples} mode="cdf" />
          </div>
        </div>
      </div>

      <div className="rounded-md border border-blue-500/30 bg-blue-500/5 p-3 text-[11px] text-muted-foreground">
        <strong>Tips:</strong> Sammenlign sample-snittet (gult) mot teoretisk
        E[X] (svart) — det er <em>konvergens i sannsynlighet</em> (loven om store
        tall). Sample-σ skal også nærme seg σ. Ved store n bør histogrammet
        ligge inn under PDF-kurven.
      </div>
    </div>
  );
}
