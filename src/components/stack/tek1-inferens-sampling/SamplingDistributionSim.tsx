import { useEffect, useMemo, useRef, useState } from "react";
import {
  drawFrom,
  histogram,
  mean,
  mulberry32,
  normalPdf,
  popMean,
  popStd,
  type HistBin,
  type PopKind,
  type PopParams,
} from "./statUtils";

/**
 * Sampling-distribution-simulator — kjernen i lesjonen.
 *
 *  - Velg populasjon (Normal / Uniform / Eksponentiell / Bimodal)
 *  - Velg sample-size n
 *  - Trekk M samples av størrelse n, beregn gjennomsnitt per sample
 *  - Vis populasjon (venstre) + sampling-distribution av x̄ (høyre)
 *  - Overlay normal-approks med µ og σ/√n — se CLT slå inn når n vokser.
 */

type N_OPTION = 5 | 30 | 100 | 1000;

const N_CHOICES: N_OPTION[] = [5, 30, 100, 1000];

function PopulationControls({
  kind,
  setKind,
  par,
  setPar,
}: {
  kind: PopKind;
  setKind: (k: PopKind) => void;
  par: PopParams;
  setPar: (p: PopParams) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {(["normal", "uniform", "exponential", "bimodal"] as PopKind[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition ${
              kind === k
                ? "bg-brand text-white border-brand"
                : "border-border bg-card hover:bg-muted"
            }`}
          >
            {k === "normal"
              ? "Normal"
              : k === "uniform"
                ? "Uniform"
                : k === "exponential"
                  ? "Eksponentiell"
                  : "Bimodal"}
          </button>
        ))}
      </div>
      <div className="text-[11px] text-muted-foreground grid grid-cols-2 gap-x-3 gap-y-1.5">
        {kind === "normal" && (
          <>
            <label className="flex items-center gap-1.5">
              µ
              <input
                type="range"
                min={-4}
                max={4}
                step={0.1}
                value={par.mu ?? 0}
                onChange={(e) => setPar({ ...par, mu: +e.target.value })}
                className="flex-1"
              />
              <span className="tabular-nums w-8 text-right">{(par.mu ?? 0).toFixed(1)}</span>
            </label>
            <label className="flex items-center gap-1.5">
              σ
              <input
                type="range"
                min={0.3}
                max={3}
                step={0.1}
                value={par.sigma ?? 1}
                onChange={(e) => setPar({ ...par, sigma: +e.target.value })}
                className="flex-1"
              />
              <span className="tabular-nums w-8 text-right">{(par.sigma ?? 1).toFixed(1)}</span>
            </label>
          </>
        )}
        {kind === "uniform" && (
          <>
            <label className="flex items-center gap-1.5">
              a
              <input
                type="range"
                min={-6}
                max={4}
                step={0.5}
                value={par.a ?? 0}
                onChange={(e) => setPar({ ...par, a: +e.target.value })}
                className="flex-1"
              />
              <span className="tabular-nums w-8 text-right">{(par.a ?? 0).toFixed(1)}</span>
            </label>
            <label className="flex items-center gap-1.5">
              b
              <input
                type="range"
                min={-2}
                max={8}
                step={0.5}
                value={par.b ?? 4}
                onChange={(e) => setPar({ ...par, b: +e.target.value })}
                className="flex-1"
              />
              <span className="tabular-nums w-8 text-right">{(par.b ?? 4).toFixed(1)}</span>
            </label>
          </>
        )}
        {kind === "exponential" && (
          <label className="flex items-center gap-1.5 col-span-2">
            λ (rate)
            <input
              type="range"
              min={0.2}
              max={3}
              step={0.1}
              value={par.lambda ?? 1}
              onChange={(e) => setPar({ ...par, lambda: +e.target.value })}
              className="flex-1"
            />
            <span className="tabular-nums w-8 text-right">{(par.lambda ?? 1).toFixed(1)}</span>
          </label>
        )}
        {kind === "bimodal" && (
          <>
            <label className="flex items-center gap-1.5">
              µ₁
              <input
                type="range"
                min={-5}
                max={0}
                step={0.5}
                value={par.mu1 ?? -2}
                onChange={(e) => setPar({ ...par, mu1: +e.target.value })}
                className="flex-1"
              />
              <span className="tabular-nums w-8 text-right">{(par.mu1 ?? -2).toFixed(1)}</span>
            </label>
            <label className="flex items-center gap-1.5">
              µ₂
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={par.mu2 ?? 2}
                onChange={(e) => setPar({ ...par, mu2: +e.target.value })}
                className="flex-1"
              />
              <span className="tabular-nums w-8 text-right">{(par.mu2 ?? 2).toFixed(1)}</span>
            </label>
            <label className="flex items-center gap-1.5">
              σ
              <input
                type="range"
                min={0.3}
                max={1.5}
                step={0.1}
                value={par.sd1 ?? 0.8}
                onChange={(e) =>
                  setPar({ ...par, sd1: +e.target.value, sd2: +e.target.value })
                }
                className="flex-1"
              />
              <span className="tabular-nums w-8 text-right">{(par.sd1 ?? 0.8).toFixed(1)}</span>
            </label>
            <label className="flex items-center gap-1.5">
              vekt p
              <input
                type="range"
                min={0.1}
                max={0.9}
                step={0.05}
                value={par.p ?? 0.5}
                onChange={(e) => setPar({ ...par, p: +e.target.value })}
                className="flex-1"
              />
              <span className="tabular-nums w-8 text-right">{(par.p ?? 0.5).toFixed(2)}</span>
            </label>
          </>
        )}
      </div>
    </div>
  );
}

function HistPlot({
  bins,
  width,
  height,
  fill,
  overlayPdf,
  domain,
  label,
  meanLine,
}: {
  bins: HistBin[];
  width: number;
  height: number;
  fill: string;
  overlayPdf?: (x: number) => number;
  domain: [number, number];
  label: string;
  meanLine?: number;
}) {
  const padL = 32;
  const padR = 8;
  const padT = 6;
  const padB = 24;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const [a, b] = domain;
  const totalCount = bins.reduce((s, bn) => s + bn.c, 0);
  const binW = bins.length > 0 ? (bins[0].x1 - bins[0].x0) : 1;
  const density = (c: number) => (totalCount > 0 ? c / (totalCount * binW) : 0);
  const maxDensity = bins.reduce((m, bn) => Math.max(m, density(bn.c)), 1e-9);
  // For overlay: sample max also
  let yMax = maxDensity;
  if (overlayPdf) {
    const samples = 60;
    for (let i = 0; i <= samples; i++) {
      const x = a + ((b - a) * i) / samples;
      yMax = Math.max(yMax, overlayPdf(x));
    }
  }
  yMax = yMax * 1.1 + 1e-9;
  const xPx = (x: number) => padL + ((x - a) / (b - a)) * plotW;
  const yPx = (y: number) => padT + plotH - (y / yMax) * plotH;

  // overlay path
  let path = "";
  if (overlayPdf) {
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const x = a + ((b - a) * i) / steps;
      const y = overlayPdf(x);
      path += (i === 0 ? "M " : " L ") + xPx(x).toFixed(2) + " " + yPx(y).toFixed(2);
    }
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto bg-background rounded border border-border"
    >
      <text
        x={padL}
        y={padT + 10}
        fontSize={10}
        className="fill-muted-foreground"
      >
        {label}
      </text>
      {/* y axis baseline */}
      <line
        x1={padL}
        y1={padT + plotH}
        x2={width - padR}
        y2={padT + plotH}
        stroke="hsl(0 0% 55%)"
        strokeWidth={0.7}
      />
      {/* bins */}
      {bins.map((bn, i) => {
        const x0 = xPx(bn.x0);
        const x1 = xPx(bn.x1);
        const yt = yPx(density(bn.c));
        const yb = padT + plotH;
        return (
          <rect
            key={i}
            x={x0}
            y={yt}
            width={Math.max(0.5, x1 - x0 - 0.5)}
            height={Math.max(0, yb - yt)}
            fill={fill}
            opacity={0.85}
          />
        );
      })}
      {path && (
        <path
          d={path}
          fill="none"
          stroke="hsl(160 70% 40%)"
          strokeWidth={1.6}
          strokeDasharray="4 3"
        />
      )}
      {meanLine !== undefined && meanLine >= a && meanLine <= b && (
        <line
          x1={xPx(meanLine)}
          y1={padT}
          x2={xPx(meanLine)}
          y2={padT + plotH}
          stroke="hsl(0 80% 55%)"
          strokeWidth={1.2}
          strokeDasharray="3 2"
        />
      )}
      {/* x-axis ticks */}
      {Array.from({ length: 5 }).map((_, i) => {
        const x = a + ((b - a) * i) / 4;
        return (
          <g key={i}>
            <line
              x1={xPx(x)}
              y1={padT + plotH}
              x2={xPx(x)}
              y2={padT + plotH + 3}
              stroke="hsl(0 0% 55%)"
              strokeWidth={0.7}
            />
            <text
              x={xPx(x)}
              y={padT + plotH + 14}
              fontSize={9}
              textAnchor="middle"
              className="fill-muted-foreground"
            >
              {x.toFixed(1)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function SamplingDistributionSim() {
  const [kind, setKind] = useState<PopKind>("exponential");
  const [par, setPar] = useState<PopParams>({
    mu: 0,
    sigma: 1,
    a: 0,
    b: 4,
    lambda: 1,
    mu1: -2,
    sd1: 0.8,
    mu2: 2,
    sd2: 0.8,
    p: 0.5,
  });
  const [n, setN] = useState<N_OPTION>(30);
  const [running, setRunning] = useState(false);
  const [seed, setSeed] = useState(20260517);
  const [samplesMeans, setSamplesMeans] = useState<number[]>([]);
  const rngRef = useRef<() => number>(mulberry32(seed));

  // when controls change, reset and reseed
  useEffect(() => {
    setSamplesMeans([]);
    rngRef.current = mulberry32(seed);
    setRunning(false);
  }, [kind, par.mu, par.sigma, par.a, par.b, par.lambda, par.mu1, par.mu2, par.sd1, par.p, n, seed]);

  // Draw populasjons-utvalg (en stor batch) for venstre histogram —
  // recompute kun når kind/par endres.
  const popValues = useMemo(() => {
    const rng = mulberry32(13 + (par.mu ?? 0) * 7 + (par.sigma ?? 1) * 11);
    const arr: number[] = [];
    for (let i = 0; i < 4000; i++) arr.push(drawFrom(rng, kind, par));
    return arr;
  }, [kind, par]);

  // Auto-trekk: ved running → trekk ~20 nye samples per frame til ~2000 totalt
  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    function step() {
      if (cancelled) return;
      setSamplesMeans((prev) => {
        if (prev.length >= 2000) {
          setRunning(false);
          return prev;
        }
        const rng = rngRef.current;
        const next = prev.slice();
        const batch = 20;
        for (let s = 0; s < batch; s++) {
          let sum = 0;
          for (let i = 0; i < n; i++) sum += drawFrom(rng, kind, par);
          next.push(sum / n);
        }
        return next;
      });
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    return () => {
      cancelled = true;
    };
  }, [running, n, kind, par]);

  function reset() {
    setSamplesMeans([]);
    setSeed((s) => s + 1);
    rngRef.current = mulberry32(seed + 1);
    setRunning(false);
  }

  // Plot-domener
  const popDomain = useMemo<[number, number]>(() => {
    const sorted = [...popValues].sort((a, b) => a - b);
    const lo = sorted[Math.floor(sorted.length * 0.005)] ?? -3;
    const hi = sorted[Math.floor(sorted.length * 0.995)] ?? 3;
    const pad = (hi - lo) * 0.05 + 1e-9;
    return [lo - pad, hi + pad];
  }, [popValues]);

  const trueMu = popMean(kind, par);
  const trueSigma = popStd(kind, par);
  const se = trueSigma / Math.sqrt(n);
  const meanDomain = useMemo<[number, number]>(() => {
    const lo = trueMu - 5 * se;
    const hi = trueMu + 5 * se;
    return [lo, hi];
  }, [trueMu, se]);

  const popBins = useMemo(
    () => histogram(popValues, 40, popDomain),
    [popValues, popDomain],
  );
  const meanBins = useMemo(
    () => histogram(samplesMeans, 30, meanDomain),
    [samplesMeans, meanDomain],
  );

  const sampleMean = samplesMeans.length > 0 ? mean(samplesMeans) : trueMu;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Sampling-distribution-simulator — Central Limit Theorem live
      </div>
      <p className="text-xs text-muted-foreground">
        Velg en populasjon (selv hvor "rar" den er), velg utvalgsstørrelse{" "}
        <strong>n</strong>, trekk 2 000 utvalg og se på histogrammet av
        gjennomsnittene <em>x̄</em>. CLT lover at fordelingen av <em>x̄</em>{" "}
        blir tilnærmet normal når n vokser — og at standardfeilen{" "}
        <strong>SE = σ/√n</strong> krymper med 1/√n.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-background p-3 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Populasjon
          </div>
          <PopulationControls
            kind={kind}
            setKind={setKind}
            par={par}
            setPar={setPar}
          />
          <div className="text-[11px] text-muted-foreground">
            sann µ = {trueMu.toFixed(3)} &nbsp;·&nbsp; σ = {trueSigma.toFixed(3)}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-3 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Utvalgsstørrelse n
          </div>
          <div className="flex flex-wrap gap-1.5">
            {N_CHOICES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setN(v)}
                className={`px-2.5 py-1 rounded text-xs font-medium border ${
                  n === v
                    ? "bg-brand text-white border-brand"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                n = {v}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-muted-foreground">
            SE = σ/√n ={" "}
            <strong className="text-foreground tabular-nums">
              {se.toFixed(3)}
            </strong>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className="px-3 py-1.5 rounded text-xs font-medium bg-brand text-white hover:bg-brand/90"
            >
              {running ? "Pause" : samplesMeans.length === 0 ? "Trekk 2 000 utvalg" : "Fortsett"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="px-3 py-1.5 rounded text-xs font-medium border border-border hover:bg-muted"
            >
              Reset
            </button>
            <span className="text-[11px] text-muted-foreground self-center">
              trukket: {samplesMeans.length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <div className="text-[11px] font-semibold mb-1 text-muted-foreground">
            Populasjon (4 000 trekk)
          </div>
          <HistPlot
            bins={popBins}
            width={420}
            height={220}
            fill="hsl(220 75% 55%)"
            domain={popDomain}
            label="x"
            meanLine={trueMu}
          />
        </div>
        <div>
          <div className="text-[11px] font-semibold mb-1 text-muted-foreground">
            Sampling-distribution av x̄ (n = {n})
          </div>
          <HistPlot
            bins={meanBins}
            width={420}
            height={220}
            fill="hsl(30 90% 55%)"
            domain={meanDomain}
            overlayPdf={(x) => normalPdf(x, trueMu, se)}
            label="x̄"
            meanLine={sampleMean}
          />
        </div>
      </div>

      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] text-muted-foreground">
        <strong>Observer:</strong> selv om populasjonen er ekstremt skjev
        (eksponentiell) eller bimodal, blir histogrammet av x̄ stadig mer
        normal-formet når du øker n. Det er CLT. Den stiplete grønne kurven er
        normalfordelingen N(µ, σ/√n) — sammenlign formen mot
        sampling-distribution-histogrammet.
      </div>
    </div>
  );
}
