import { useEffect, useMemo, useState } from "react";
import {
  drawFrom,
  mean,
  mulberry32,
  normInv,
  popMean,
  popStd,
  std,
  tCritTwoSided,
  type PopKind,
  type PopParams,
} from "./statUtils";

/**
 * 100 horisontale 95 % CI-er, hver fra et nytt utvalg. Markér de som ikke
 * inneholder den sanne µ rødt. Brukeren ser frekventistisk tolkning av CI
 * direkte: "ca. 5 av 100 bommer", ikke "µ ligger med 95 % sannsynlighet i".
 */

const CONF_OPTIONS = [
  { lvl: 0.8, label: "80 %" },
  { lvl: 0.9, label: "90 %" },
  { lvl: 0.95, label: "95 %" },
  { lvl: 0.99, label: "99 %" },
];

const N_OPTIONS = [10, 30, 100];

export function ConfidenceIntervalVisualizer() {
  const [conf, setConf] = useState(0.95);
  const [n, setN] = useState(30);
  const [seed, setSeed] = useState(20260101);
  const [popKind, setPopKind] = useState<PopKind>("normal");

  const par: PopParams = useMemo(() => ({ mu: 50, sigma: 10, a: 30, b: 70, lambda: 0.02 }), []);
  const trueMu = popMean(popKind, par);
  const trueSigma = popStd(popKind, par);

  const NUM_INTERVALS = 100;

  const intervals = useMemo(() => {
    const rng = mulberry32(seed);
    const out: { lo: number; hi: number; xbar: number; covers: boolean }[] = [];
    const alpha = 1 - conf;
    const tcrit = tCritTwoSided(alpha, n - 1);
    for (let i = 0; i < NUM_INTERVALS; i++) {
      const sample: number[] = [];
      for (let j = 0; j < n; j++) sample.push(drawFrom(rng, popKind, par));
      const xbar = mean(sample);
      const s = std(sample);
      const se = s / Math.sqrt(n);
      const lo = xbar - tcrit * se;
      const hi = xbar + tcrit * se;
      out.push({ lo, hi, xbar, covers: trueMu >= lo && trueMu <= hi });
    }
    return out;
  }, [seed, conf, n, popKind, par, trueMu]);

  const missed = intervals.filter((iv) => !iv.covers).length;
  const expectedMiss = ((1 - conf) * 100).toFixed(0);

  // SVG layout
  const W = 540;
  const padL = 60;
  const padR = 20;
  const padT = 14;
  const padB = 26;
  const rowH = 3.4;
  const H = padT + padB + NUM_INTERVALS * rowH;
  const xMin = trueMu - 4 * (trueSigma / Math.sqrt(n));
  const xMax = trueMu + 4 * (trueSigma / Math.sqrt(n));
  const xPx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR);

  // for normal-CI sammenligning (kun visning av z-kritisk)
  const zCrit = normInv(1 - (1 - conf) / 2);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Konfidensintervall-coverage — 100 intervaller live
      </div>
      <p className="text-xs text-muted-foreground">
        Vi trekker 100 nye utvalg og bygger et CI fra hvert. Den vertikale linja
        er den sanne µ — telle rødt: ca.{" "}
        <strong>{expectedMiss} av 100</strong> CI bommer ved konfidens{" "}
        {(conf * 100).toFixed(0)} %. Det er det "frekventistisk 95 % CI" betyr.
      </p>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-background p-3 space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Konfidensnivå
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CONF_OPTIONS.map((c) => (
              <button
                key={c.lvl}
                type="button"
                onClick={() => setConf(c.lvl)}
                className={`px-2.5 py-1 rounded text-xs font-medium border ${
                  conf === c.lvl
                    ? "bg-brand text-white border-brand"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-muted-foreground">
            t<sub>α/2, n−1</sub> = {tCritTwoSided(1 - conf, n - 1).toFixed(3)} ·
            z<sub>α/2</sub> = {zCrit.toFixed(3)}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-3 space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Utvalgsstørrelse n
          </div>
          <div className="flex flex-wrap gap-1.5">
            {N_OPTIONS.map((v) => (
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
            forventet SE ≈ σ/√n = {(trueSigma / Math.sqrt(n)).toFixed(3)}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-3 space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Populasjon
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["normal", "uniform", "exponential"] as PopKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setPopKind(k)}
                className={`px-2.5 py-1 rounded text-xs font-medium border ${
                  popKind === k
                    ? "bg-brand text-white border-brand"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                {k === "normal" ? "Normal" : k === "uniform" ? "Uniform" : "Eksp."}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="px-2.5 py-1 rounded text-xs font-medium border border-border hover:bg-muted"
          >
            Trekk 100 nye
          </button>
        </div>
      </div>

      <div className="rounded-md border border-border bg-background p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* vertical mu line */}
          <line
            x1={xPx(trueMu)}
            y1={padT}
            x2={xPx(trueMu)}
            y2={H - padB}
            stroke="hsl(0 80% 55%)"
            strokeWidth={1.6}
          />
          <text
            x={xPx(trueMu) + 4}
            y={padT + 9}
            fontSize={10}
            className="fill-foreground"
          >
            sann µ = {trueMu.toFixed(0)}
          </text>
          {/* intervals */}
          {intervals.map((iv, i) => {
            const y = padT + i * rowH + rowH / 2;
            const color = iv.covers ? "hsl(220 75% 55%)" : "hsl(0 80% 55%)";
            return (
              <g key={i}>
                <line
                  x1={xPx(Math.max(iv.lo, xMin))}
                  y1={y}
                  x2={xPx(Math.min(iv.hi, xMax))}
                  y2={y}
                  stroke={color}
                  strokeWidth={1.4}
                />
                <circle
                  cx={xPx(iv.xbar)}
                  cy={y}
                  r={1.4}
                  fill={color}
                />
              </g>
            );
          })}
          {/* x-axis */}
          <line
            x1={padL}
            y1={H - padB}
            x2={W - padR}
            y2={H - padB}
            stroke="hsl(0 0% 55%)"
            strokeWidth={0.7}
          />
          {Array.from({ length: 5 }).map((_, i) => {
            const x = xMin + ((xMax - xMin) * i) / 4;
            return (
              <g key={i}>
                <line
                  x1={xPx(x)}
                  y1={H - padB}
                  x2={xPx(x)}
                  y2={H - padB + 3}
                  stroke="hsl(0 0% 55%)"
                  strokeWidth={0.7}
                />
                <text
                  x={xPx(x)}
                  y={H - padB + 14}
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
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-muted-foreground">Coverage observert</div>
          <div className="font-mono text-base mt-1">
            {100 - missed} av 100 fanget µ
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            forventet: ~{(conf * 100).toFixed(0)} av 100
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-muted-foreground">Bommer (røde)</div>
          <div className="font-mono text-base mt-1 text-rose-500">
            {missed} av 100
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            forventet: ~{expectedMiss} av 100
          </div>
        </div>
      </div>

      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] text-muted-foreground">
        <strong>Vanlig misforståelse:</strong> "95 % CI" betyr IKKE at µ ligger
        i et bestemt intervall med 95 % sannsynlighet. µ er fast — det er CI-et
        som er tilfeldig. 95 % sier hvor ofte prosedyren FANGER µ over uendelig
        mange gjentakelser. Klikk "Trekk 100 nye" og se antall røde svinge rundt{" "}
        {expectedMiss}.
      </div>
    </div>
  );
}
