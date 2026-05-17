import { useEffect, useMemo, useRef, useState } from "react";
import {
  type DistKind,
  type DistParams,
  distMoments,
  distPdf,
  distSample,
  histogram,
  mean as sampleMean,
  mulberry32,
  normalPdf,
  std as sampleStd,
} from "./distUtils";

/**
 * CltDemonstrator — sentralgrenseteoremet i bevegelse.
 *
 * Velg en NON-normal fordeling, sample n verdier, regn snitt.
 * Repetér 1000 ganger. Plot fordelingen av snittene. Sammenlign mot
 * N(µ, σ/√n).
 */

type PopOption = {
  label: string;
  kind: DistKind;
  par: DistParams;
  description: string;
};

const POPS: PopOption[] = [
  {
    label: "Uniform [0, 10]",
    kind: "uniform",
    par: { a: 0, b: 10 },
    description: "Helt flat, ingen skjevhet. CLT konvergerer raskt.",
  },
  {
    label: "Eksponentiell λ=1",
    kind: "exponential",
    par: { lambda: 1 },
    description: "Sterkt høyreskjev. CLT trenger større n før normalitet inntreffer.",
  },
  {
    label: "Gamma(2, 1)",
    kind: "gamma",
    par: { shape: 2, rate: 1 },
    description: "Moderat skjev. Snitt-fordelingen blir nesten normal allerede ved n=10.",
  },
  {
    label: "Poisson(3)",
    kind: "poisson",
    par: { lambda: 3 },
    description: "Diskret, skjev. CLT virker også her — snittet blir kontinuerlig-normalt.",
  },
  {
    label: "Chi-square(2)",
    kind: "chisq",
    par: { df: 2 },
    description: "Veldig skjev (lik exp(0.5) faktisk). Trenger n≥30 før snitt blir tydelig normalt.",
  },
];

const N_OPTIONS: number[] = [1, 5, 30, 100, 1000];
const NUM_TRIALS = 1000;

function MiniPlot({
  data, domain, label, color, overlayPdf, title, height,
}: {
  data: number[]; domain: [number, number]; label: string; color: string;
  overlayPdf?: (x: number) => number; title?: string; height?: number;
}) {
  const W = 360, H = height ?? 180;
  const padL = 32, padR = 8, padT = 18, padB = 22;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const [a, b] = domain;
  const bins = histogram(data, 30, [a, b]);
  const binW = bins.length > 0 ? bins[0].x1 - bins[0].x0 : 1;
  const total = data.length || 1;
  const density = (c: number) => c / (total * binW);
  let yMax = 0;
  for (const bn of bins) yMax = Math.max(yMax, density(bn.c));
  if (overlayPdf) {
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const x = a + ((b - a) * i) / steps;
      yMax = Math.max(yMax, overlayPdf(x));
    }
  }
  yMax = yMax * 1.15 + 1e-9;
  const xPx = (x: number) => padL + ((x - a) / (b - a)) * plotW;
  const yPx = (y: number) => padT + plotH - (y / yMax) * plotH;
  let path = "";
  if (overlayPdf) {
    const steps = 120;
    for (let i = 0; i <= steps; i++) {
      const x = a + ((b - a) * i) / steps;
      const y = overlayPdf(x);
      path += (i === 0 ? "M " : " L ") + xPx(x).toFixed(2) + " " + yPx(y).toFixed(2);
    }
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-background rounded border border-border">
      {title && <text x={padL} y={12} fontSize={10} className="fill-muted-foreground font-semibold">{title}</text>}
      <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke="hsl(0 0% 55%)" strokeWidth={0.7} />
      {bins.map((bn, i) => {
        const x0 = xPx(bn.x0), x1 = xPx(bn.x1);
        const yt = yPx(density(bn.c)), yb = padT + plotH;
        return (
          <rect key={i} x={x0} y={yt}
            width={Math.max(0.5, x1 - x0 - 0.5)} height={Math.max(0, yb - yt)}
            fill={color} opacity={0.8} />
        );
      })}
      {path && <path d={path} fill="none" stroke="hsl(160 70% 40%)" strokeWidth={1.8} strokeDasharray="4 3" />}
      {Array.from({ length: 5 }).map((_, i) => {
        const x = a + ((b - a) * i) / 4;
        return (
          <text key={i} x={xPx(x)} y={padT + plotH + 14} fontSize={9} textAnchor="middle" className="fill-muted-foreground">
            {x.toFixed(1)}
          </text>
        );
      })}
      <text x={W - padR} y={padT + plotH + 14} fontSize={9} textAnchor="end" className="fill-muted-foreground">{label}</text>
    </svg>
  );
}

export function CltDemonstrator() {
  const [popIdx, setPopIdx] = useState(1); // default: exponential
  const [n, setN] = useState(5);
  const [running, setRunning] = useState(false);
  const [means, setMeans] = useState<number[]>([]);
  const [seed, setSeed] = useState(20260518);
  const rngRef = useRef<() => number>(mulberry32(seed));

  const pop = POPS[popIdx];
  const popMom = useMemo(() => distMoments(pop.kind, pop.par), [pop]);
  const trueMu = popMom.mean;
  const trueSigma = popMom.std;
  const se = isFinite(trueSigma) ? trueSigma / Math.sqrt(n) : NaN;

  // population reference data
  const popData = useMemo(() => {
    const rng = mulberry32(101 + popIdx * 13);
    const arr: number[] = [];
    for (let i = 0; i < 4000; i++) arr.push(distSample(rng, pop.kind, pop.par));
    return arr;
  }, [popIdx, pop]);

  // population domain
  const popDomain = useMemo<[number, number]>(() => {
    const sorted = [...popData].sort((a, b) => a - b);
    const lo = sorted[Math.floor(popData.length * 0.005)] ?? -3;
    const hi = sorted[Math.floor(popData.length * 0.995)] ?? 3;
    const pad = (hi - lo) * 0.05 + 1e-9;
    return [lo - pad, hi + pad];
  }, [popData]);

  // mean domain — center on µ, ±5σ/√n
  const meanDomain = useMemo<[number, number]>(() => {
    if (!isFinite(se)) return popDomain;
    return [trueMu - 5 * se, trueMu + 5 * se];
  }, [trueMu, se, popDomain]);

  // Reset means when n / pop changes
  useEffect(() => {
    setMeans([]);
    rngRef.current = mulberry32(seed);
    setRunning(false);
  }, [popIdx, n, seed]);

  // Animation: 25 means per frame until NUM_TRIALS
  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    function step() {
      if (cancelled) return;
      setMeans((prev) => {
        if (prev.length >= NUM_TRIALS) {
          setRunning(false);
          return prev;
        }
        const rng = rngRef.current;
        const next = prev.slice();
        const batch = 25;
        for (let s = 0; s < batch; s++) {
          let sum = 0;
          for (let i = 0; i < n; i++) sum += distSample(rng, pop.kind, pop.par);
          next.push(sum / n);
        }
        return next;
      });
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    return () => { cancelled = true; };
  }, [running, n, pop]);

  const empMean = means.length > 0 ? sampleMean(means) : NaN;
  const empStd = means.length > 1 ? sampleStd(means) : NaN;

  function reset() {
    setMeans([]);
    setSeed((s) => s + 1);
    setRunning(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        CLT Demonstrator — se snittet bli normalt
      </div>
      <p className="text-xs text-muted-foreground">
        CLT sier: uansett hvor rar populasjonen er, så blir fordelingen til
        gjennomsnittet <em>x̄</em> tilnærmet normal når <strong>n</strong> blir
        stor — med µ = sann µ og σ = σ/√n.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-background p-3 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Populasjon
          </div>
          <div className="flex flex-wrap gap-1.5">
            {POPS.map((p, i) => (
              <button key={p.label} type="button" onClick={() => setPopIdx(i)}
                className={`px-2 py-1 rounded text-[11px] font-medium border ${
                  popIdx === i ? "bg-brand text-white border-brand"
                    : "border-border bg-card hover:bg-muted"
                }`}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-muted-foreground italic">{pop.description}</div>
          <div className="text-[11px] text-muted-foreground">
            sann µ = <strong className="text-foreground tabular-nums">{trueMu.toFixed(3)}</strong>
            {" · "}σ = <strong className="text-foreground tabular-nums">{trueSigma.toFixed(3)}</strong>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-3 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Utvalgsstørrelse n
          </div>
          <div className="flex flex-wrap gap-1.5">
            {N_OPTIONS.map((v) => (
              <button key={v} type="button" onClick={() => setN(v)}
                className={`px-2.5 py-1 rounded text-xs font-medium border ${
                  n === v ? "bg-brand text-white border-brand"
                    : "border-border bg-card hover:bg-muted"
                }`}>
                n = {v}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-muted-foreground">
            SE = σ/√n = <strong className="text-foreground tabular-nums">{se.toFixed(4)}</strong>
          </div>
          <div className="flex gap-1.5 pt-1">
            <button type="button" onClick={() => setRunning((r) => !r)}
              className="px-3 py-1.5 rounded text-xs font-medium bg-brand text-white hover:bg-brand/90">
              {running ? "Pause" : means.length === 0 ? "Kjør 1 000 eksperimenter" : "Fortsett"}
            </button>
            <button type="button" onClick={reset}
              className="px-3 py-1.5 rounded text-xs font-medium border border-border hover:bg-muted">
              Reset
            </button>
            <span className="text-[11px] text-muted-foreground self-center">
              kjørt: {means.length}/{NUM_TRIALS}
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <MiniPlot
            data={popData}
            domain={popDomain}
            label="x"
            color="hsl(220 75% 55%)"
            title={`Populasjon: ${pop.label}`}
          />
        </div>
        <div>
          <MiniPlot
            data={means}
            domain={meanDomain}
            label="x̄"
            color="hsl(30 90% 55%)"
            overlayPdf={isFinite(se) && se > 0 ? (x) => normalPdf(x, trueMu, se) : undefined}
            title={`Fordeling av x̄ (n=${n})`}
          />
        </div>
      </div>

      <div className="rounded-md border border-border bg-background p-3 grid sm:grid-cols-3 gap-3 text-[11px]">
        <div>
          <div className="text-muted-foreground">Teoretisk SE = σ/√n</div>
          <div className="font-semibold tabular-nums text-base">{isFinite(se) ? se.toFixed(4) : "—"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Empirisk std av x̄</div>
          <div className="font-semibold tabular-nums text-base text-amber-700 dark:text-amber-400">
            {isFinite(empStd) ? empStd.toFixed(4) : "—"}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Empirisk snitt av x̄</div>
          <div className="font-semibold tabular-nums text-base text-amber-700 dark:text-amber-400">
            {isFinite(empMean) ? empMean.toFixed(4) : "—"}
          </div>
        </div>
      </div>

      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] text-muted-foreground space-y-1">
        <div><strong>Observer:</strong> ved n=1 er fordelingen av "snittet" identisk med
          populasjonen (du tar bare ett tall). Ved n=5 har den allerede begynt å bli
          klokkeformet. Ved n=30 ligger den stort sett midt under den grønne stiplete
          N(µ, σ/√n)-kurven — selv for ekstremt skjeve populasjoner.</div>
        <div><strong>Verifiser SE-formelen:</strong> empirisk std av x̄ skal ligge svært
          nær σ/√n. Avstanden viser hvor godt CLT/SE-formelen holder for nettopp
          denne kombinasjonen.</div>
      </div>
    </div>
  );
}

// silenser potensielt ubrukt import i fremtidige refactors
void distPdf;
