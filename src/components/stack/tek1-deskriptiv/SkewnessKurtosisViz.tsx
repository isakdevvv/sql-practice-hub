import { useMemo, useState } from "react";
import {
  bimodalSample,
  histogram,
  kurtosis,
  leftSkewSample,
  mean,
  median,
  mulberry32,
  randn,
  rightSkewSample,
  skewness,
} from "./descUtils";

/**
 * SkewnessKurtosisViz — fire forhåndsdefinerte fordelinger + en slider
 * for å kontinuerlig morfe en symmetrisk fordeling til høyre-skjev og se
 * mean–median-gapet vokse.
 */

type Preset = "symmetric" | "right" | "left" | "bimodal";

const N = 500;
const SEED = 13371;

function sampleFor(preset: Preset): number[] {
  const rng = mulberry32(SEED + preset.charCodeAt(0));
  const out: number[] = [];
  for (let i = 0; i < N; i++) {
    if (preset === "symmetric") out.push(5 + 1.4 * randn(rng));
    else if (preset === "right") out.push(rightSkewSample(rng, 10));
    else if (preset === "left") out.push(leftSkewSample(rng, 10));
    else out.push(5 + bimodalSample(rng));
  }
  return out;
}

// Morf: tar et standardnormalt z og strekker høyre-halen med parameter k ∈ [0, 3].
function morphedSample(rng: () => number, k: number): number {
  const z = randn(rng);
  // Sinh-arcsinh-ish: skjev mot høyre når k > 0.
  return 5 + Math.sinh(0.6 * z + k) * 1.0;
}

function morphedData(k: number): number[] {
  const rng = mulberry32(99 + Math.round(k * 100));
  const out: number[] = [];
  for (let i = 0; i < N; i++) out.push(morphedSample(rng, k));
  return out;
}

export function SkewnessKurtosisViz() {
  const [preset, setPreset] = useState<Preset>("symmetric");
  const [k, setK] = useState<number>(0);

  const presetData = useMemo(() => sampleFor(preset), [preset]);
  const morphData = useMemo(() => morphedData(k), [k]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="text-sm font-semibold">A · Forhåndsdefinerte fordelinger</div>
        <div className="flex flex-wrap gap-1.5">
          {(["symmetric", "right", "left", "bimodal"] as Preset[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPreset(p)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition ${
                preset === p
                  ? "bg-brand text-white border-brand"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              {p === "symmetric"
                ? "Symmetrisk"
                : p === "right"
                  ? "Høyre-skjev (lønn)"
                  : p === "left"
                    ? "Venstre-skjev (testskår)"
                    : "Bimodal"}
            </button>
          ))}
        </div>
        <DistPlot xs={presetData} caption={presetDescription(preset)} />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="text-sm font-semibold">
          B · Morf en symmetrisk fordeling mot høyre-skjev
        </div>
        <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
          Skewness-parameter k
          <input
            type="range"
            min={0}
            max={2.5}
            step={0.05}
            value={k}
            onChange={(e) => setK(+e.target.value)}
            className="flex-1"
          />
          <span className="tabular-nums w-10 text-right">{k.toFixed(2)}</span>
        </label>
        <DistPlot
          xs={morphData}
          caption={`Når k øker, blir høyre-halen tyngre og mean trekkes til høyre for median.`}
        />
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
          <strong>Tommelfingerregel:</strong> mean &gt; median ⇒ <em>høyre-skjev</em> (positiv
          skew). mean &lt; median ⇒ <em>venstre-skjev</em> (negativ skew). Symmetrisk ⇒ mean ≈
          median.
        </div>
      </div>
    </div>
  );
}

function presetDescription(p: Preset): string {
  if (p === "symmetric") return "N(5, 1.4²). Mean ≈ median, skew ≈ 0, kurtosis (excess) ≈ 0.";
  if (p === "right")
    return "Typisk lønnsfordeling: lang høyre-hale. Mean dras opp av topp-lønninger; median er mer representativ for 'typisk' lønn.";
  if (p === "left")
    return "Typisk lett testskår: de fleste klarer seg bra, en lang venstre-hale av strykkandidater. Mean dras NED av halen.";
  return "Bimodal: to topper (f.eks. to ulike maskintyper i datasettet). Hverken mean eller median beskriver 'typisk' meningsfullt — del datasettet!";
}

function DistPlot({ xs, caption }: { xs: number[]; caption: string }) {
  const W = 540;
  const H = 200;
  const PAD_L = 30;
  const PAD_R = 14;
  const PAD_T = 14;
  const PAD_B = 40;
  const lo = Math.min(...xs);
  const hi = Math.max(...xs);
  const bins = 30;
  const hist = histogram(xs, bins, lo, hi);
  const maxBin = Math.max(1, ...hist.map((b) => b.count));

  const m = mean(xs);
  const med = median(xs);
  const sk = skewness(xs);
  const ku = kurtosis(xs);

  const sx = (v: number) => PAD_L + ((v - lo) / (hi - lo || 1)) * (W - PAD_L - PAD_R);

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block bg-background rounded">
        {/* histogram */}
        {hist.map((b, i) => {
          const x0 = sx(b.lo);
          const x1 = sx(b.hi);
          const h = ((H - PAD_T - PAD_B) * b.count) / maxBin;
          return (
            <rect
              key={i}
              x={x0 + 0.5}
              y={H - PAD_B - h}
              width={Math.max(1, x1 - x0 - 1)}
              height={h}
              fill="#3b82f6"
              opacity={0.6}
            />
          );
        })}
        {/* axis */}
        <line
          x1={PAD_L}
          y1={H - PAD_B}
          x2={W - PAD_R}
          y2={H - PAD_B}
          stroke="currentColor"
          className="text-muted-foreground"
        />
        {[lo, (lo + hi) / 2, hi].map((g, i) => (
          <text
            key={i}
            x={sx(g)}
            y={H - PAD_B + 12}
            fontSize={9}
            className="fill-muted-foreground"
            textAnchor="middle"
          >
            {g.toFixed(1)}
          </text>
        ))}
        {/* mean */}
        <line x1={sx(m)} y1={PAD_T} x2={sx(m)} y2={H - PAD_B} stroke="#22c55e" strokeWidth={2} />
        <text x={sx(m) + 3} y={PAD_T + 10} fontSize={10} className="fill-emerald-500">
          mean {m.toFixed(2)}
        </text>
        {/* median */}
        <line
          x1={sx(med)}
          y1={PAD_T}
          x2={sx(med)}
          y2={H - PAD_B}
          stroke="#f59e0b"
          strokeWidth={2}
          strokeDasharray="5 4"
        />
        <text x={sx(med) + 3} y={PAD_T + 22} fontSize={10} className="fill-amber-500">
          median {med.toFixed(2)}
        </text>
      </svg>
      <div className="mt-2 grid sm:grid-cols-2 gap-2 text-[11px]">
        <div className="rounded border border-border bg-background px-2 py-1.5 font-mono">
          skewness: <span className="text-foreground">{sk.toFixed(2)}</span>
        </div>
        <div className="rounded border border-border bg-background px-2 py-1.5 font-mono">
          excess kurtosis: <span className="text-foreground">{ku.toFixed(2)}</span>
        </div>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{caption}</div>
    </div>
  );
}
