import { useMemo, useState } from "react";

type Sample = { p: number; y: 0 | 1 };
type Model = "raw" | "overconfident" | "platt" | "isotonic";

function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function randNorm(rand: () => number, mu: number, sigma: number): number {
  const u1 = Math.max(1e-9, rand());
  const u2 = rand();
  return mu + sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function sigmoid(z: number): number {
  if (z > 40) return 1;
  if (z < -40) return 0;
  return 1 / (1 + Math.exp(-z));
}

// Build N samples where true P(y=1) is well-modelled by sigmoid(score)
function buildSamples(n: number, seed: number, overconf: boolean): Sample[] {
  const rand = rng(seed);
  const out: Sample[] = [];
  for (let i = 0; i < n; i++) {
    // true score uniform in [-3, 3]
    const z = -3 + 6 * rand();
    const trueP = sigmoid(z);
    const y = (rand() < trueP ? 1 : 0) as 0 | 1;
    // model output:
    let phat: number;
    if (overconf) {
      // overconfident: push p toward extremes (raise to power < 1 on logit scale)
      const zhat = z * 2.2 + randNorm(rand, 0, 0.3);
      phat = sigmoid(zhat);
    } else {
      const zhat = z + randNorm(rand, 0, 0.3);
      phat = sigmoid(zhat);
    }
    out.push({ p: phat, y });
  }
  return out;
}

// Platt scaling: refit a 1-D logistic on (model output → label).
// We use logit(phat) as the feature.
function plattCalibrate(samples: Sample[]): (p: number) => number {
  // simple GD on (a, b) for sigmoid(a*logit(p) + b) ≈ y
  const eps = 1e-6;
  const xs = samples.map((s) => Math.log((s.p + eps) / (1 - s.p + eps)));
  let a = 1;
  let b = 0;
  const lr = 0.3;
  for (let it = 0; it < 300; it++) {
    let ga = 0;
    let gb = 0;
    for (let i = 0; i < samples.length; i++) {
      const ph = sigmoid(a * xs[i] + b);
      const err = ph - samples[i].y;
      ga += err * xs[i];
      gb += err;
    }
    const n = samples.length;
    a -= (lr / n) * ga;
    b -= (lr / n) * gb;
  }
  return (p: number) => sigmoid(a * Math.log((p + eps) / (1 - p + eps)) + b);
}

// Isotonic regression via PAV on bin means
function isotonicCalibrate(samples: Sample[]): (p: number) => number {
  const sorted = [...samples].sort((a, b) => a.p - b.p);
  const xs = sorted.map((s) => s.p);
  const ys = sorted.map((s) => s.y as number);
  // PAV
  const w: number[] = ys.map(() => 1);
  const v: number[] = [...ys];
  let i = 0;
  while (i < v.length - 1) {
    if (v[i] > v[i + 1]) {
      const newV = (w[i] * v[i] + w[i + 1] * v[i + 1]) / (w[i] + w[i + 1]);
      v[i] = newV;
      w[i] = w[i] + w[i + 1];
      v.splice(i + 1, 1);
      w.splice(i + 1, 1);
      xs.splice(i + 1, 1);
      if (i > 0) i--;
    } else {
      i++;
    }
  }
  // step function with linear interpolation between knots
  return (p: number) => {
    if (xs.length === 0) return p;
    if (p <= xs[0]) return v[0];
    if (p >= xs[xs.length - 1]) return v[v.length - 1];
    for (let k = 1; k < xs.length; k++) {
      if (p <= xs[k]) {
        const t = (p - xs[k - 1]) / Math.max(1e-9, xs[k] - xs[k - 1]);
        return v[k - 1] + t * (v[k] - v[k - 1]);
      }
    }
    return v[v.length - 1];
  };
}

function calibrationBins(samples: Sample[], nBins = 10): { mid: number; meanP: number; freq: number; count: number }[] {
  const bins: { sumP: number; sumY: number; n: number }[] = Array.from({ length: nBins }, () => ({
    sumP: 0,
    sumY: 0,
    n: 0,
  }));
  for (const s of samples) {
    let b = Math.floor(s.p * nBins);
    if (b >= nBins) b = nBins - 1;
    if (b < 0) b = 0;
    bins[b].sumP += s.p;
    bins[b].sumY += s.y;
    bins[b].n += 1;
  }
  return bins.map((b, i) => ({
    mid: (i + 0.5) / nBins,
    meanP: b.n === 0 ? (i + 0.5) / nBins : b.sumP / b.n,
    freq: b.n === 0 ? 0 : b.sumY / b.n,
    count: b.n,
  }));
}

// Brier score
function brier(samples: Sample[]): number {
  let s = 0;
  for (const x of samples) s += (x.p - x.y) ** 2;
  return s / Math.max(1, samples.length);
}

const W = 320;
const H = 280;
const PAD = 36;

export function CalibrationPlot() {
  const [seed, setSeed] = useState(11);
  const [overconf, setOverconf] = useState(false);
  const [model, setModel] = useState<Model>("raw");

  const samples = useMemo(() => buildSamples(500, seed, overconf), [seed, overconf]);

  const transformed = useMemo(() => {
    if (model === "raw" || model === "overconfident") return samples;
    if (model === "platt") {
      const f = plattCalibrate(samples);
      return samples.map((s) => ({ p: f(s.p), y: s.y }));
    }
    // isotonic
    const f = isotonicCalibrate(samples);
    return samples.map((s) => ({ p: f(s.p), y: s.y }));
  }, [model, samples]);

  const bins = useMemo(() => calibrationBins(transformed), [transformed]);
  const br = useMemo(() => brier(transformed), [transformed]);

  const sx = (v: number) => PAD + v * (W - 2 * PAD);
  const sy = (v: number) => H - PAD - v * (H - 2 * PAD);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="grid md:grid-cols-[1fr_auto] gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <input
                type="checkbox"
                checked={overconf}
                onChange={(e) => setOverconf(e.target.checked)}
              />
              Real model er for sikker
            </label>
            <button
              onClick={() => setSeed((s) => s + 1)}
              className="ml-auto text-xs px-2 py-0.5 rounded border border-border bg-background hover:bg-muted/50"
            >
              Nye 500 prediksjoner
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="text-xs text-muted-foreground mr-1">Visning:</div>
            {(["raw", "platt", "isotonic"] as Model[]).map((m) => (
              <button
                key={m}
                onClick={() => setModel(m)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
                  model === m
                    ? "border-brand bg-brand/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-brand/40"
                }`}
              >
                {m === "raw" ? "Rå modell" : m === "platt" ? "Platt-scaling" : "Isotonisk"}
              </button>
            ))}
          </div>

          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
            <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#888" strokeWidth={0.8} />
            <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#888" strokeWidth={0.8} />
            {/* ideal diagonal */}
            <line
              x1={sx(0)}
              y1={sy(0)}
              x2={sx(1)}
              y2={sy(1)}
              stroke="#10b981"
              strokeDasharray="4 3"
              strokeOpacity={0.7}
              strokeWidth={1.5}
            />
            {/* axes labels */}
            <text x={W / 2} y={H - 8} fontSize={9} textAnchor="middle" fill="#888">
              Predikert sannsynlighet
            </text>
            <text x={10} y={H / 2} fontSize={9} textAnchor="middle" fill="#888" transform={`rotate(-90 10 ${H / 2})`}>
              Observert frekvens
            </text>
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <g key={t}>
                <text x={sx(t)} y={H - PAD + 12} fontSize={8} textAnchor="middle" fill="#888">
                  {t}
                </text>
                <text x={PAD - 4} y={sy(t) + 3} fontSize={8} textAnchor="end" fill="#888">
                  {t}
                </text>
              </g>
            ))}
            {/* bin points */}
            {bins.map((b, i) => {
              if (b.count === 0) return null;
              const r = Math.max(2, Math.min(8, Math.sqrt(b.count) * 0.5));
              return (
                <g key={i}>
                  <circle cx={sx(b.meanP)} cy={sy(b.freq)} r={r} fill="#3b82f6" fillOpacity={0.6} stroke="#fff" strokeWidth={1} />
                </g>
              );
            })}
            {/* path through bins */}
            <path
              d={
                "M " +
                bins
                  .filter((b) => b.count > 0)
                  .map((b) => `${sx(b.meanP).toFixed(1)},${sy(b.freq).toFixed(1)}`)
                  .join(" L ")
              }
              stroke="#3b82f6"
              strokeWidth={1.2}
              strokeOpacity={0.7}
              fill="none"
            />
            <text x={W - PAD - 2} y={PAD + 12} fontSize={9} textAnchor="end" fill="#10b981">
              ideelt = diagonal
            </text>
          </svg>
        </div>

        <aside className="md:w-72 space-y-3">
          <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-1.5">
            <div className="font-semibold">Brier-score</div>
            <div className="font-mono tabular-nums text-lg">{br.toFixed(4)}</div>
            <div className="text-[10px] text-muted-foreground leading-snug">
              Mean squared error mellom p og y. Lavere = bedre. En perfekt
              kalibrert og diskriminerende modell har Brier ≈ 0.
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-2">
            <div className="font-semibold">Hva å se etter</div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] leading-snug">
              <li>
                <strong>Over linja:</strong> modellen er for forsiktig — den
                sier «70%» når faktisk frekvens er 85%.
              </li>
              <li>
                <strong>Under linja:</strong> modellen er for sikker — den sier
                «95%» når faktisk frekvens er 70% (typisk for trær, RF, nevralnet).
              </li>
              <li>
                <strong>Logistisk regresjon</strong> er ofte rimelig kalibrert
                «out of the box» fordi den optimerer log-loss direkte.
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-1.5">
            <div className="font-semibold">Kalibreringsmetoder</div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] leading-snug">
              <li>
                <strong>Platt:</strong> sigmoid på logit(p) — parametrisk, virker
                når miscalibrasjonen er S-formet.
              </li>
              <li>
                <strong>Isotonisk:</strong> monoton step-funksjon (PAV) —
                fleksibelt, men trenger mye data.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
