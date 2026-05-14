import { useEffect, useMemo, useRef, useState } from "react";
import { Tex } from "@/components/Tex";

// Mulberry32 PRNG for reproducibility
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box–Muller using PRNG for fixed sample
function boxMuller(rng: () => number): [number, number] {
  const u1 = Math.max(1e-12, rng());
  const u2 = rng();
  const mag = Math.sqrt(-2 * Math.log(u1));
  return [mag * Math.cos(2 * Math.PI * u2), mag * Math.sin(2 * Math.PI * u2)];
}

// Inverse standard normal — Beasley–Springer–Moro
function normInv(p: number): number {
  const a1 = -39.6968302866538,
    a2 = 220.946098424521,
    a3 = -275.928510446969,
    a4 = 138.357751867269,
    a5 = -30.6647980661472,
    a6 = 2.50662827745924;
  const b1 = -54.4760987982241,
    b2 = 161.585836858041,
    b3 = -155.698979859887,
    b4 = 66.8013118877197,
    b5 = -13.2806815528857;
  const c1 = -7.78489400243029e-3,
    c2 = -0.322396458041136,
    c3 = -2.40075827716184,
    c4 = -2.54973253934373,
    c5 = 4.37466414146497,
    c6 = 2.93816398269878;
  const d1 = 7.78469570904146e-3,
    d2 = 0.32246712907004,
    d3 = 2.445134137143,
    d4 = 3.75440866190742;
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number, r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    );
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q) /
      (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1)
    );
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    );
  }
}

// Default sample: 30 points from a right-skewed distribution (exponential-ish)
function makeOriginalSample(seed: number): number[] {
  const rng = mulberry32(seed);
  const n = 30;
  const arr: number[] = [];
  for (let i = 0; i < n; i++) {
    const [z] = boxMuller(rng);
    // Slight right skew so bootstrap differs from t
    arr.push(10 + 2 * z + 0.5 * Math.max(z, 0) ** 2);
  }
  return arr;
}

function mean(arr: number[]): number {
  let s = 0;
  for (const v of arr) s += v;
  return s / arr.length;
}

function stdev(arr: number[]): number {
  const m = mean(arr);
  let s = 0;
  for (const v of arr) s += (v - m) ** 2;
  return Math.sqrt(s / (arr.length - 1));
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return NaN;
  const pos = q * (sorted.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  const t = pos - lo;
  return sorted[lo] * (1 - t) + sorted[hi] * t;
}

/**
 * Bootstrap resampling animation: shows one resample (with counts), then on
 * "Trekk 1000" builds histogram of bootstrap means and a 95 % percentile CI.
 * Compares to a t-based CI on the original.
 */
export function BootstrapResamplingSim() {
  const original = useMemo(() => makeOriginalSample(20251114), []);
  const origMean = useMemo(() => mean(original), [original]);
  const origSd = useMemo(() => stdev(original), [original]);
  const n = original.length;

  // Single-resample state
  const [counts, setCounts] = useState<number[]>(() =>
    Array(original.length).fill(0),
  );
  const [singleMean, setSingleMean] = useState<number | null>(null);
  const rngRef = useRef<() => number>(mulberry32(7));

  // Bootstrap distribution
  const [bootMeans, setBootMeans] = useState<number[]>([]);

  function drawOne() {
    const rng = rngRef.current;
    const sample: number[] = [];
    const c = Array(original.length).fill(0);
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(rng() * original.length);
      sample.push(original[idx]);
      c[idx] += 1;
    }
    setCounts(c);
    setSingleMean(mean(sample));
  }

  function drawMany(k: number) {
    const rng = rngRef.current;
    const out = bootMeans.slice();
    for (let b = 0; b < k; b++) {
      let s = 0;
      for (let i = 0; i < n; i++) {
        s += original[Math.floor(rng() * original.length)];
      }
      out.push(s / n);
    }
    setBootMeans(out);
  }

  function reset() {
    rngRef.current = mulberry32(7);
    setCounts(Array(original.length).fill(0));
    setSingleMean(null);
    setBootMeans([]);
  }

  // 95 % bootstrap CI from percentile method
  const ciBoot = useMemo(() => {
    if (bootMeans.length < 20) return null;
    const sorted = [...bootMeans].sort((a, b) => a - b);
    return [quantile(sorted, 0.025), quantile(sorted, 0.975)];
  }, [bootMeans]);

  // t-based CI on the original
  const ciT = useMemo(() => {
    const se = origSd / Math.sqrt(n);
    // For df=29, t_0.025 ≈ 2.045. Hard-coded for clarity; this is a demo.
    const tcrit = 2.045;
    return [origMean - tcrit * se, origMean + tcrit * se];
  }, [origMean, origSd, n]);

  // Original sample plot — circles on a number line
  const origMin = Math.min(...original);
  const origMax = Math.max(...original);
  const lo = origMin - 1;
  const hi = origMax + 1;
  const W = 540;
  const sampH = 110;
  const sampPadL = 20;
  const sampPadR = 20;
  const sampPlotW = W - sampPadL - sampPadR;
  const xPxSamp = (x: number) =>
    sampPadL + ((x - lo) / (hi - lo)) * sampPlotW;

  // Histogram of bootstrap means
  const histBins = 28;
  const hist = useMemo(() => {
    if (bootMeans.length === 0) return [];
    const mn = Math.min(...bootMeans);
    const mx = Math.max(...bootMeans);
    const padding = (mx - mn) * 0.05 + 1e-9;
    const a = mn - padding;
    const b = mx + padding;
    const bw = (b - a) / histBins;
    const bins: number[] = Array(histBins).fill(0);
    for (const v of bootMeans) {
      let i = Math.floor((v - a) / bw);
      if (i < 0) i = 0;
      if (i >= histBins) i = histBins - 1;
      bins[i] += 1;
    }
    return bins.map((c, i) => ({
      x0: a + i * bw,
      x1: a + (i + 1) * bw,
      c,
    }));
  }, [bootMeans]);

  const histW = 540;
  const histH = 180;
  const histPadL = 36;
  const histPadR = 12;
  const histPadT = 8;
  const histPadB = 28;
  const histPlotW = histW - histPadL - histPadR;
  const histPlotH = histH - histPadT - histPadB;
  const histMaxC = hist.reduce((m, b) => Math.max(m, b.c), 1);
  const histA = hist.length > 0 ? hist[0].x0 : 0;
  const histB = hist.length > 0 ? hist[hist.length - 1].x1 : 1;
  const xPxHist = (x: number) =>
    histPadL + ((x - histA) / (histB - histA || 1)) * histPlotW;
  const yPxHist = (c: number) =>
    histPadT + histPlotH - (c / histMaxC) * histPlotH;

  // Auto-stop animation: do nothing fancy, just direct buttons
  useEffect(() => {
    // noop — kept for future autoplay extension
  }, []);

  const maxCount = Math.max(...counts, 1);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Bootstrap-resampling — bygg fordeling fra ett utvalg
      </div>
      <p className="text-xs text-muted-foreground">
        Trekk fra det observerte utvalget MED tilbakelegging, regn ut mean,
        gjenta. Histogrammet av bootstrap-means estimerer
        sampling-fordelingen til <Tex>{"\\bar{X}"}</Tex> uten å anta
        normalfordeling. Sammenlign 95 % percentil-CI mot t-CI.
      </p>

      {/* Original sample */}
      <div>
        <div className="text-xs font-semibold mb-1">
          Originalt utvalg (n = {n}, x̄ = {origMean.toFixed(3)}, s ={" "}
          {origSd.toFixed(3)})
        </div>
        <svg
          viewBox={`0 0 ${W} ${sampH}`}
          className="w-full h-auto bg-background rounded border border-border"
        >
          <line
            x1={sampPadL}
            y1={sampH - 24}
            x2={W - sampPadR}
            y2={sampH - 24}
            stroke="hsl(0 0% 60%)"
            strokeWidth={0.8}
          />
          {original.map((v, i) => {
            const c = counts[i];
            const r = 6 + Math.min(c, 4) * 1.4;
            const fill =
              c === 0
                ? "hsl(0 0% 80% / 0.6)"
                : c === 1
                  ? "hsl(220 75% 55%)"
                  : c === 2
                    ? "hsl(30 90% 55%)"
                    : "hsl(0 75% 55%)";
            return (
              <g key={i}>
                <circle
                  cx={xPxSamp(v)}
                  cy={sampH - 24}
                  r={r}
                  fill={fill}
                  stroke="white"
                  strokeWidth={1}
                  opacity={c === 0 ? 0.45 : 0.95}
                />
                {c > 1 && (
                  <text
                    x={xPxSamp(v)}
                    y={sampH - 22 + 3}
                    textAnchor="middle"
                    fontSize={9}
                    fontWeight={600}
                    className="fill-foreground"
                  >
                    ×{c}
                  </text>
                )}
              </g>
            );
          })}
          {/* mean tick */}
          <line
            x1={xPxSamp(origMean)}
            y1={sampH - 24 - 28}
            x2={xPxSamp(origMean)}
            y2={sampH - 24 + 14}
            stroke="hsl(160 70% 40%)"
            strokeDasharray="3 3"
            strokeWidth={1.2}
          />
          <text
            x={xPxSamp(origMean) + 4}
            y={sampH - 24 - 22}
            fontSize={9}
            className="fill-muted-foreground"
          >
            x̄
          </text>
          {/* axis ticks */}
          {[lo, (lo + hi) / 2, hi].map((g) => (
            <text
              key={g}
              x={xPxSamp(g)}
              y={sampH - 6}
              textAnchor="middle"
              fontSize={10}
              className="fill-muted-foreground"
            >
              {g.toFixed(1)}
            </text>
          ))}
        </svg>
        <div className="text-[11px] text-muted-foreground mt-1">
          {singleMean === null
            ? "Trykk «Trekk én sample» for å se hvilke punkter som ble valgt — noen flere ganger, noen ikke."
            : `Bootstrap-sample mean = ${singleMean.toFixed(3)} — fargestørrelse viser hvor mange ganger hver original-obs ble trukket (maks ${maxCount}).`}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={drawOne}
          className="rounded border border-border bg-background px-2.5 py-1 text-xs hover:border-brand/40"
        >
          Trekk én sample
        </button>
        <button
          onClick={() => drawMany(100)}
          className="rounded border border-border bg-background px-2.5 py-1 text-xs hover:border-brand/40"
        >
          + 100 samples
        </button>
        <button
          onClick={() => drawMany(1000)}
          className="rounded border border-brand bg-brand/10 px-2.5 py-1 text-xs text-brand hover:bg-brand/20"
        >
          + 1 000 samples
        </button>
        <button
          onClick={reset}
          className="rounded border border-border bg-background px-2.5 py-1 text-xs hover:border-brand/40 ml-auto"
        >
          Reset
        </button>
      </div>

      {/* Histogram */}
      <div>
        <div className="text-xs font-semibold mb-1">
          Histogram av {bootMeans.length} bootstrap-means
        </div>
        <svg
          viewBox={`0 0 ${histW} ${histH}`}
          className="w-full h-auto bg-background rounded border border-border"
        >
          {/* axis baseline */}
          <line
            x1={histPadL}
            y1={histH - histPadB}
            x2={histW - histPadR}
            y2={histH - histPadB}
            stroke="hsl(0 0% 60%)"
            strokeWidth={0.6}
          />

          {hist.map((b, i) => (
            <rect
              key={i}
              x={xPxHist(b.x0)}
              y={yPxHist(b.c)}
              width={Math.max(1, xPxHist(b.x1) - xPxHist(b.x0) - 1)}
              height={histH - histPadB - yPxHist(b.c)}
              fill="hsl(220 70% 55% / 0.7)"
              stroke="hsl(220 70% 35%)"
              strokeWidth={0.4}
            />
          ))}

          {/* CI markers */}
          {ciBoot && (
            <>
              <line
                x1={xPxHist(ciBoot[0])}
                y1={histPadT}
                x2={xPxHist(ciBoot[0])}
                y2={histH - histPadB}
                stroke="hsl(0 75% 55%)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              <line
                x1={xPxHist(ciBoot[1])}
                y1={histPadT}
                x2={xPxHist(ciBoot[1])}
                y2={histH - histPadB}
                stroke="hsl(0 75% 55%)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              <text
                x={xPxHist(ciBoot[0])}
                y={histPadT + 9}
                fontSize={9}
                className="fill-[hsl(0_75%_50%)]"
                textAnchor="middle"
              >
                2.5%
              </text>
              <text
                x={xPxHist(ciBoot[1])}
                y={histPadT + 9}
                fontSize={9}
                className="fill-[hsl(0_75%_50%)]"
                textAnchor="middle"
              >
                97.5%
              </text>
            </>
          )}

          {/* original mean ref */}
          {hist.length > 0 && origMean >= histA && origMean <= histB && (
            <line
              x1={xPxHist(origMean)}
              y1={histPadT}
              x2={xPxHist(origMean)}
              y2={histH - histPadB}
              stroke="hsl(160 70% 40%)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          )}

          {/* x ticks */}
          {hist.length > 0 &&
            [histA, (histA + histB) / 2, histB].map((g) => (
              <text
                key={g}
                x={xPxHist(g)}
                y={histH - 8}
                textAnchor="middle"
                fontSize={10}
                className="fill-muted-foreground"
              >
                {g.toFixed(3)}
              </text>
            ))}

          {hist.length === 0 && (
            <text
              x={histW / 2}
              y={histH / 2}
              textAnchor="middle"
              fontSize={11}
              className="fill-muted-foreground"
            >
              Trykk «+1000» for å bygge bootstrap-fordelingen.
            </text>
          )}
        </svg>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-border bg-background p-3 space-y-1">
          <div className="font-semibold text-[hsl(0_75%_50%)]">
            Bootstrap-CI (percentil)
          </div>
          {ciBoot ? (
            <div className="font-mono">
              [{ciBoot[0].toFixed(3)}, {ciBoot[1].toFixed(3)}]
            </div>
          ) : (
            <div className="text-muted-foreground">
              Trenger flere bootstrap-samples (≥ 20).
            </div>
          )}
          <div className="text-muted-foreground">
            Bredde:{" "}
            {ciBoot ? (ciBoot[1] - ciBoot[0]).toFixed(3) : "—"}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-3 space-y-1">
          <div className="font-semibold text-[hsl(160_70%_35%)]">
            Klassisk t-CI (df=29)
          </div>
          <div className="font-mono">
            [{ciT[0].toFixed(3)}, {ciT[1].toFixed(3)}]
          </div>
          <div className="text-muted-foreground">
            Bredde: {(ciT[1] - ciT[0]).toFixed(3)}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-1.5">
        <div className="font-semibold">Hvorfor virker bootstrap?</div>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>
            Vi later som om utvalget «er» populasjonen — sampler MED
            tilbakelegging for å imitere variabilitet fra utvalg-til-utvalg.
          </li>
          <li>
            Trenger ikke at populasjonen er normalfordelt. Funker for{" "}
            <Tex>{"\\mathrm{median}"}</Tex>, IQR, kvantiler — alt der ingen
            ferdig formel finnes.
          </li>
          <li>
            Krever stort nok originalt utvalg (n ≥ 20–30) og at observasjonene
            er uavhengige. Skjevhet i original-utvalget kommer tilbake i CI-en.
          </li>
        </ul>
      </div>
    </div>
  );
}
