import { useMemo, useState } from "react";
import {
  DIST_LABELS,
  type DistKind,
  type DistParams,
  distPdf,
  distSample,
  histogram,
  logLikelihood,
  mleEstimate,
  mulberry32,
} from "./distUtils";

/**
 * DistributionMatcher — gjenkjenningsutfordring.
 * 5 runder, hver med et generert datasett. Brukeren gjetter fordeling.
 * Etter svar: log-likelihood + MLE-estimat for hver kandidat.
 */

interface Round {
  title: string;
  hint: string;
  trueKind: DistKind;
  truePar: DistParams;
  n: number;
  candidates: DistKind[];
  // for mixture round we override sampler
  customSampler?: (rng: () => number) => number;
  notes: string; // forklaring som vises etter svar
}

const ROUNDS: Round[] = [
  {
    title: "Runde 1 — den åpenbare normalen",
    hint: "Symmetrisk klokke, ingen skjevhet, halene dør raskt.",
    trueKind: "normal",
    truePar: { mu: 50, sigma: 8 },
    n: 400,
    candidates: ["normal", "uniform", "exponential", "gamma"],
    notes: "Klar normalfordeling: symmetrisk, klokkeform. MLE skal gi µ̂ ≈ 50, σ̂ ≈ 8.",
  },
  {
    title: "Runde 2 — den åpenbare Poissonen",
    hint: "Heltallsdata, ikke-negative, lite skjev høyrehale, varians ≈ snitt.",
    trueKind: "poisson",
    truePar: { lambda: 4 },
    n: 400,
    candidates: ["poisson", "binomial", "normal", "exponential"],
    notes: "Poisson(4) — sjekk at sample-snittet ≈ sample-variansen (det er Poissons signatur). MLE: λ̂ = x̄.",
  },
  {
    title: "Runde 3 — eksponentiell vs. gamma",
    hint: "Begge er høyreskjev og ikke-negativ. Forskjellen er at gamma med shape>1 har en topp inne i intervallet — eksponentiell har max ved 0.",
    trueKind: "gamma",
    truePar: { shape: 3, rate: 1 },
    n: 500,
    candidates: ["gamma", "exponential", "normal", "chisq"],
    notes: "Gamma(3, 1): toppen er ved (k−1)/β = 2. Eksponentiell ville hatt monotont fallende histogram. Gamma med shape=k/2, rate=1/2 = Chi-square(k) — chi-square(6) ville passet også.",
  },
  {
    title: "Runde 4 — mixture (utfordring)",
    hint: "To pukler! Ingen av kandidatene passer egentlig. Hvilken har MINST dårlig log-likelihood?",
    trueKind: "normal", // ikke sant — vi forteller etterpå
    truePar: { mu: 0, sigma: 1 },
    n: 500,
    candidates: ["normal", "uniform", "gamma", "studentt"],
    customSampler: (rng) => {
      // 50/50 N(-3, 1) eller N(3, 1)
      const z = Math.sqrt(-2 * Math.log(Math.max(1e-12, rng()))) * Math.cos(2 * Math.PI * rng());
      return (rng() < 0.5 ? -3 : 3) + z;
    },
    notes: "Dette er en MIXTURE av to normaler — ingen enkelt fordeling passer. MLE vil prøve å fitte en bred normal som ignorerer dippen i midten. Lærdom: alltid plot histogrammet før du blindt antar én fordeling.",
  },
  {
    title: "Runde 5 — uniform vs. trunkert normal",
    hint: "Flatt platå med skarpe kanter? Da er det uniform. Mild boue-form? Trunkert normal.",
    trueKind: "uniform",
    truePar: { a: 2, b: 8 },
    n: 400,
    candidates: ["uniform", "normal", "gamma", "exponential"],
    notes: "Uniform(2, 8): histogrammet skal være rimelig flatt med abrupt nullpunkter ved kantene. Normal-MLE vil tvinge en klokke, men log-likelihood blir vesentlig dårligere enn for uniform.",
  },
];

function HistogramPlot({ data, kind, par, showFit, fitParams }: {
  data: number[];
  kind?: DistKind;
  par?: DistParams;
  showFit: boolean;
  fitParams?: { kind: DistKind; par: DistParams; color: string }[];
}) {
  const W = 520, H = 240;
  const padL = 36, padR = 8, padT = 8, padB = 24;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  // domain
  const sorted = [...data].sort((a, b) => a - b);
  const lo = sorted[Math.floor(data.length * 0.005)] ?? -3;
  const hi = sorted[Math.floor(data.length * 0.995)] ?? 3;
  const pad = (hi - lo) * 0.08 + 1e-9;
  const a = lo - pad, b = hi + pad;
  const bins = histogram(data, 40, [a, b]);
  const binW = bins.length > 0 ? bins[0].x1 - bins[0].x0 : 1;
  const total = data.length;
  const density = (c: number) => c / (total * binW);
  let yMax = 0;
  for (const bn of bins) yMax = Math.max(yMax, density(bn.c));
  // fit overlay max
  if (fitParams) {
    for (const f of fitParams) {
      const steps = 80;
      for (let i = 0; i <= steps; i++) {
        const x = a + ((b - a) * i) / steps;
        yMax = Math.max(yMax, distPdf(f.kind, f.par, x));
      }
    }
  }
  yMax = yMax * 1.12 + 1e-9;
  const xPx = (x: number) => padL + ((x - a) / (b - a)) * plotW;
  const yPx = (y: number) => padT + plotH - (y / yMax) * plotH;
  // void unused params
  void kind; void par;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-background rounded border border-border">
      <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke="hsl(0 0% 55%)" strokeWidth={0.7} />
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="hsl(0 0% 55%)" strokeWidth={0.7} />
      {bins.map((bn, i) => {
        const x0 = xPx(bn.x0), x1 = xPx(bn.x1);
        const yt = yPx(density(bn.c)), yb = padT + plotH;
        return (
          <rect key={i} x={x0} y={yt}
            width={Math.max(0.5, x1 - x0 - 0.5)} height={Math.max(0, yb - yt)}
            fill="hsl(220 60% 60%)" opacity={0.7} />
        );
      })}
      {showFit && fitParams && fitParams.map((f, fi) => {
        let path = "";
        const steps = 200;
        for (let i = 0; i <= steps; i++) {
          const x = a + ((b - a) * i) / steps;
          const y = distPdf(f.kind, f.par, x);
          path += (i === 0 ? "M " : " L ") + xPx(x).toFixed(2) + " " + yPx(y).toFixed(2);
        }
        return (
          <path key={fi} d={path} fill="none" stroke={f.color} strokeWidth={1.8} strokeDasharray="4 3" />
        );
      })}
      {Array.from({ length: 5 }).map((_, i) => {
        const x = a + ((b - a) * i) / 4;
        return (
          <g key={i}>
            <text x={xPx(x)} y={padT + plotH + 14} fontSize={9} textAnchor="middle" className="fill-muted-foreground">
              {x.toFixed(1)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const FIT_COLORS = [
  "hsl(0 80% 55%)",
  "hsl(160 70% 40%)",
  "hsl(280 70% 55%)",
  "hsl(40 90% 50%)",
];

export function DistributionMatcher() {
  const [roundIdx, setRoundIdx] = useState(0);
  const [guess, setGuess] = useState<DistKind | null>(null);
  const [showFit, setShowFit] = useState(false);
  const [seed, setSeed] = useState(20260518);

  const round = ROUNDS[roundIdx];

  const data = useMemo(() => {
    const rng = mulberry32(seed + roundIdx * 1009);
    const arr: number[] = [];
    for (let i = 0; i < round.n; i++) {
      arr.push(round.customSampler ? round.customSampler(rng) : distSample(rng, round.trueKind, round.truePar));
    }
    return arr;
  }, [round, seed, roundIdx]);

  const fits = useMemo(() => {
    return round.candidates.map((k) => {
      const par = mleEstimate(k, data);
      const ll = logLikelihood(k, par, data);
      return { kind: k, par, ll };
    });
  }, [round, data]);

  // ranking
  const bestLl = Math.max(...fits.filter((f) => isFinite(f.ll)).map((f) => f.ll));

  function nextRound() {
    setRoundIdx((i) => (i + 1) % ROUNDS.length);
    setGuess(null);
    setShowFit(false);
    setSeed((s) => s + 1);
  }

  function reshuffle() {
    setSeed((s) => s + 1);
    setGuess(null);
    setShowFit(false);
  }

  const fitOverlays = showFit
    ? fits.slice(0, 4).map((f, i) => ({ kind: f.kind, par: f.par, color: FIT_COLORS[i] }))
    : undefined;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Distribution Matcher — gjenkjenn fordelingen fra histogrammet
      </div>
      <p className="text-xs text-muted-foreground">
        Du får et histogram av <strong>{round.n}</strong> ukjente datapunkter.
        Gjett hvilken fordeling som har produsert dem. Etter du har svart får du
        log-likelihood og MLE-estimat for hver kandidat — så du ser hvilken som
        passer best matematisk.
      </p>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-sm font-semibold">{round.title}</div>
        <div className="flex gap-1.5">
          <button type="button" onClick={reshuffle}
            className="px-2.5 py-1 rounded text-xs font-medium border border-border hover:bg-muted">
            Nytt datasett (samme runde)
          </button>
          <button type="button" onClick={nextRound}
            className="px-2.5 py-1 rounded text-xs font-medium bg-brand text-white hover:bg-brand/90">
            Neste runde →
          </button>
        </div>
      </div>

      <div className="text-[11px] text-muted-foreground italic">{round.hint}</div>

      <HistogramPlot data={data} showFit={showFit} fitParams={fitOverlays} />

      {!guess && (
        <div className="space-y-2">
          <div className="text-xs font-medium">Hvilken fordeling?</div>
          <div className="flex flex-wrap gap-1.5">
            {round.candidates.map((k) => (
              <button key={k} type="button" onClick={() => { setGuess(k); setShowFit(true); }}
                className="px-3 py-1.5 rounded text-xs font-medium border border-border hover:bg-brand hover:text-white">
                {DIST_LABELS[k]}
              </button>
            ))}
          </div>
        </div>
      )}

      {guess && (
        <div className="space-y-3">
          <div className={`rounded-lg p-3 text-sm border ${
            guess === round.trueKind && !round.customSampler
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-amber-500/40 bg-amber-500/5"
          }`}>
            <strong>Du gjettet:</strong> {DIST_LABELS[guess]}.{" "}
            {round.customSampler ? (
              <span>(Trickrunde — det er ikke en enkelt fordeling.)</span>
            ) : guess === round.trueKind ? (
              <span>Riktig!</span>
            ) : (
              <span>Sant svar: {DIST_LABELS[round.trueKind]}.</span>
            )}
            <div className="mt-1.5 text-xs text-muted-foreground">{round.notes}</div>
          </div>

          <div className="rounded-lg border border-border bg-background overflow-hidden">
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border">
              MLE-estimater og log-likelihood (større = bedre fit)
            </div>
            <table className="w-full text-xs">
              <thead className="bg-muted/20">
                <tr>
                  <th className="text-left px-3 py-1.5 font-semibold">Fordeling</th>
                  <th className="text-left px-3 py-1.5 font-semibold">MLE-parametre</th>
                  <th className="text-right px-3 py-1.5 font-semibold">log L</th>
                  <th className="text-right px-3 py-1.5 font-semibold">Δ fra beste</th>
                </tr>
              </thead>
              <tbody>
                {fits
                  .slice()
                  .sort((a, b) => b.ll - a.ll)
                  .map((f, i) => {
                    const isBest = f.ll === bestLl;
                    const dlt = bestLl - f.ll;
                    const parStr = Object.entries(f.par)
                      .map(([k, v]) => `${k}=${(v as number).toFixed(2)}`)
                      .join(", ");
                    return (
                      <tr key={f.kind} className={`border-t border-border ${isBest ? "bg-emerald-500/5" : ""}`}>
                        <td className="px-3 py-1.5">
                          <span className="inline-block w-2 h-2 rounded-full mr-2"
                            style={{ background: FIT_COLORS[round.candidates.indexOf(f.kind) % FIT_COLORS.length] }} />
                          {DIST_LABELS[f.kind]} {isBest && <span className="text-[10px] text-emerald-700 dark:text-emerald-400 ml-1">← best</span>}
                          {f.kind === round.trueKind && !round.customSampler && <span className="text-[10px] text-brand ml-1">(sann)</span>}
                        </td>
                        <td className="px-3 py-1.5 font-mono text-[10px]">{parStr}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums">{isFinite(f.ll) ? f.ll.toFixed(1) : "−∞"}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">
                          {isFinite(f.ll) && i > 0 ? dlt.toFixed(1) : ""}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-muted-foreground">
            De stiplete kurvene over histogrammet er hver kandidats <strong>MLE-fit</strong>.
            Δ &gt; ~5 mellom modeller indikerer at den dårligere er praktisk ekskludert
            (likelihood-ratio).
          </div>
        </div>
      )}
    </div>
  );
}
