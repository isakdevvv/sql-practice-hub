import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// ConfusionMatrixExplorer — drag the threshold over a synthetic
// score-distribution and watch the 2x2 confusion matrix recompute live.
// Three modes change the underlying class distribution:
//   - balansert: 50/50
//   - ubalansert: 90/10 (sjeldne positiver, f.eks. svindel)
//   - overlap:   modellen har svak signal-separasjon
// Studenten leser av precision / recall / F1 / accuracy / MCC og ser
// hvordan en flyttet terskel bytter mellom FP og FN.
// --------------------------------------------------------------------------

type Mode = "balansert" | "ubalansert" | "overlap";

const W = 520;
const H = 160;
const PAD_L = 28;
const PAD_R = 12;
const PAD_T = 14;
const PAD_B = 26;

// Deterministisk pseudo-random for reproducerbare data ved samme seed.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Standard normal via Box-Muller på en injisert RNG.
function gauss(rng: () => number): number {
  const u = Math.max(1e-9, rng());
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

interface Sample {
  score: number; // 0..1
  label: 0 | 1;
}

function makeData(mode: Mode): Sample[] {
  const rng = mulberry32(42);
  // Klassebalanse + senterposisjon for neg/pos-fordelingene.
  let nPos: number;
  let nNeg: number;
  let muNeg: number;
  let muPos: number;
  let sd: number;
  if (mode === "balansert") {
    nNeg = 200;
    nPos = 200;
    muNeg = 0.35;
    muPos = 0.65;
    sd = 0.12;
  } else if (mode === "ubalansert") {
    nNeg = 360;
    nPos = 40;
    muNeg = 0.3;
    muPos = 0.7;
    sd = 0.13;
  } else {
    nNeg = 200;
    nPos = 200;
    muNeg = 0.42;
    muPos = 0.58;
    sd = 0.17;
  }
  const out: Sample[] = [];
  for (let i = 0; i < nNeg; i++) {
    out.push({ score: Math.max(0, Math.min(1, muNeg + gauss(rng) * sd)), label: 0 });
  }
  for (let i = 0; i < nPos; i++) {
    out.push({ score: Math.max(0, Math.min(1, muPos + gauss(rng) * sd)), label: 1 });
  }
  return out;
}

interface Counts {
  tp: number;
  fp: number;
  tn: number;
  fn: number;
}

function counts(data: Sample[], threshold: number): Counts {
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  for (const s of data) {
    const pred = s.score >= threshold ? 1 : 0;
    if (s.label === 1 && pred === 1) tp++;
    else if (s.label === 0 && pred === 1) fp++;
    else if (s.label === 0 && pred === 0) tn++;
    else fn++;
  }
  return { tp, fp, tn, fn };
}

// Histogram-bins for plot.
function histogram(samples: Sample[], bins: number) {
  const neg = new Array(bins).fill(0);
  const pos = new Array(bins).fill(0);
  for (const s of samples) {
    const b = Math.min(bins - 1, Math.floor(s.score * bins));
    if (s.label === 0) neg[b]++;
    else pos[b]++;
  }
  return { neg, pos };
}

export function ConfusionMatrixExplorer() {
  const [mode, setMode] = useState<Mode>("balansert");
  const [threshold, setThreshold] = useState(0.5);

  const data = useMemo(() => makeData(mode), [mode]);
  const { tp, fp, tn, fn } = useMemo(() => counts(data, threshold), [data, threshold]);

  const total = tp + fp + tn + fn;
  const accuracy = (tp + tn) / total;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  // Matthews correlation coefficient — robust mot klasse-ubalanse.
  const mccDen = Math.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn));
  const mcc = mccDen > 0 ? (tp * tn - fp * fn) / mccDen : 0;

  const bins = 24;
  const hist = useMemo(() => histogram(data, bins), [data]);
  const maxBin = Math.max(1, ...hist.neg, ...hist.pos);

  const x = (s: number) => PAD_L + s * (W - PAD_L - PAD_R);
  const yBase = H - PAD_B;
  const barH = (n: number) => (n / maxBin) * (H - PAD_T - PAD_B);

  const onPlotMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const setFromEvent = (clientX: number) => {
      const rect = svg.getBoundingClientRect();
      const sx = clientX - rect.left;
      const frac = (sx - PAD_L) / (W - PAD_L - PAD_R);
      setThreshold(Math.max(0, Math.min(1, frac)));
    };
    setFromEvent(e.clientX);
    const move = (ev: MouseEvent) => setFromEvent(ev.clientX);
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const cellW = 120;
  const cellH = 56;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
        <span className="text-muted-foreground">Datasett:</span>
        {(["balansert", "ubalansert", "overlap"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-2 py-1 rounded border ${
              mode === m
                ? "border-brand bg-brand/10 text-brand"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "balansert"
              ? "50/50 balansert"
              : m === "ubalansert"
                ? "90/10 ubalansert"
                : "Overlappende"}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setThreshold(0.5)}
          className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground"
          title="Nullstill terskel til 0.5"
        >
          <RotateCcw className="h-3 w-3" /> 0.5
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Venstre: score-fordeling + dra-terskel */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            Score-fordeling — dra på plottet for å flytte terskelen
          </div>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full select-none cursor-ew-resize"
            onMouseDown={onPlotMouseDown}
          >
            {/* akse */}
            <line x1={PAD_L} y1={yBase} x2={W - PAD_R} y2={yBase} stroke="currentColor" strokeOpacity={0.3} />
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <g key={t}>
                <line x1={x(t)} y1={yBase} x2={x(t)} y2={yBase + 4} stroke="currentColor" strokeOpacity={0.4} />
                <text x={x(t)} y={yBase + 16} fontSize="9" textAnchor="middle" fill="currentColor" opacity={0.7}>
                  {t.toFixed(2)}
                </text>
              </g>
            ))}
            {/* histogram-stolper */}
            {hist.neg.map((n, i) => {
              const bw = (W - PAD_L - PAD_R) / bins;
              const xs = PAD_L + i * bw;
              const h = barH(n);
              return (
                <rect
                  key={`n${i}`}
                  x={xs + 0.5}
                  y={yBase - h}
                  width={bw - 1}
                  height={h}
                  fill="rgb(59 130 246)"
                  fillOpacity={0.55}
                />
              );
            })}
            {hist.pos.map((n, i) => {
              const bw = (W - PAD_L - PAD_R) / bins;
              const xs = PAD_L + i * bw;
              const h = barH(n);
              return (
                <rect
                  key={`p${i}`}
                  x={xs + 0.5}
                  y={yBase - h}
                  width={bw - 1}
                  height={h}
                  fill="rgb(244 63 94)"
                  fillOpacity={0.55}
                />
              );
            })}
            {/* terskel-linje */}
            <line
              x1={x(threshold)}
              y1={PAD_T - 4}
              x2={x(threshold)}
              y2={yBase + 4}
              stroke="rgb(234 179 8)"
              strokeWidth={2}
            />
            <text
              x={x(threshold)}
              y={PAD_T - 6}
              fontSize="10"
              textAnchor="middle"
              fill="rgb(234 179 8)"
              fontWeight={600}
            >
              t = {threshold.toFixed(2)}
            </text>
          </svg>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "rgb(59 130 246)", opacity: 0.55 }} />
              negativ (label = 0)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "rgb(244 63 94)", opacity: 0.55 }} />
              positiv (label = 1)
            </span>
          </div>
        </div>

        {/* Høyre: confusion matrix + metrikker */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Confusion matrix</div>
          <svg viewBox={`0 0 ${2 * cellW + 80} ${2 * cellH + 60}`} className="w-full">
            {/* aksenavn */}
            <text x={80} y={14} fontSize="10" fill="currentColor" opacity={0.7} textAnchor="middle">
              Predikert 0
            </text>
            <text x={80 + cellW} y={14} fontSize="10" fill="currentColor" opacity={0.7} textAnchor="middle">
              Predikert 1
            </text>
            <text
              x={14}
              y={20 + cellH / 2}
              fontSize="10"
              fill="currentColor"
              opacity={0.7}
              textAnchor="middle"
            >
              Faktisk 0
            </text>
            <text
              x={14}
              y={20 + cellH + cellH / 2}
              fontSize="10"
              fill="currentColor"
              opacity={0.7}
              textAnchor="middle"
            >
              Faktisk 1
            </text>
            {/* TN */}
            <rect x={28} y={20} width={cellW} height={cellH} fill="rgb(34 197 94)" fillOpacity={0.25} stroke="currentColor" strokeOpacity={0.3} />
            <text x={28 + cellW / 2} y={20 + cellH / 2 - 4} fontSize="11" textAnchor="middle" fill="currentColor" opacity={0.7}>TN</text>
            <text x={28 + cellW / 2} y={20 + cellH / 2 + 12} fontSize="16" textAnchor="middle" fill="currentColor" fontWeight={600}>{tn}</text>
            {/* FP */}
            <rect x={28 + cellW} y={20} width={cellW} height={cellH} fill="rgb(239 68 68)" fillOpacity={0.25} stroke="currentColor" strokeOpacity={0.3} />
            <text x={28 + cellW + cellW / 2} y={20 + cellH / 2 - 4} fontSize="11" textAnchor="middle" fill="currentColor" opacity={0.7}>FP</text>
            <text x={28 + cellW + cellW / 2} y={20 + cellH / 2 + 12} fontSize="16" textAnchor="middle" fill="currentColor" fontWeight={600}>{fp}</text>
            {/* FN */}
            <rect x={28} y={20 + cellH} width={cellW} height={cellH} fill="rgb(239 68 68)" fillOpacity={0.25} stroke="currentColor" strokeOpacity={0.3} />
            <text x={28 + cellW / 2} y={20 + cellH + cellH / 2 - 4} fontSize="11" textAnchor="middle" fill="currentColor" opacity={0.7}>FN</text>
            <text x={28 + cellW / 2} y={20 + cellH + cellH / 2 + 12} fontSize="16" textAnchor="middle" fill="currentColor" fontWeight={600}>{fn}</text>
            {/* TP */}
            <rect x={28 + cellW} y={20 + cellH} width={cellW} height={cellH} fill="rgb(34 197 94)" fillOpacity={0.25} stroke="currentColor" strokeOpacity={0.3} />
            <text x={28 + cellW + cellW / 2} y={20 + cellH + cellH / 2 - 4} fontSize="11" textAnchor="middle" fill="currentColor" opacity={0.7}>TP</text>
            <text x={28 + cellW + cellW / 2} y={20 + cellH + cellH / 2 + 12} fontSize="16" textAnchor="middle" fill="currentColor" fontWeight={600}>{tp}</text>
          </svg>
          <div className="mt-3 grid grid-cols-2 gap-1 text-xs">
            <Metric label="Accuracy" value={accuracy} />
            <Metric label="Precision" value={precision} />
            <Metric label="Recall" value={recall} />
            <Metric label="F1-score" value={f1} />
            <Metric label="MCC" value={mcc} fullRange />
            <div className="px-2 py-1 rounded border border-border text-muted-foreground">
              n = {total} · pos = {tp + fn} · neg = {tn + fp}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs">
        <strong className="text-brand">Hva å se etter:</strong>{" "}
        På <em>ubalansert</em>: trekk terskelen helt mot venstre — accuracy blir høy
        (du sier «positiv» til alt og treffer alle 40 positive), men precision raser
        og MCC viser at modellen ikke faktisk er bra. Når <em>overlap</em> er valgt,
        får du aldri precision OG recall samtidig høye — det er en tradeoff du
        styrer med terskelen. <em>MCC</em> går fra −1 til 1 og er den beste enkelt-
        metrikken på ubalanserte sett.
      </div>
    </div>
  );
}

function Metric({ label, value, fullRange = false }: { label: string; value: number; fullRange?: boolean }) {
  const formatted = isFinite(value) ? value.toFixed(3) : "–";
  // For 0..1-metrikker fargelegger vi etter verdi; MCC går −1..1.
  const norm = fullRange ? (value + 1) / 2 : value;
  const hue = Math.max(0, Math.min(120, norm * 120));
  return (
    <div className="px-2 py-1 rounded border border-border flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono" style={{ color: `hsl(${hue} 70% 45%)`, fontWeight: 600 }}>
        {formatted}
      </span>
    </div>
  );
}
