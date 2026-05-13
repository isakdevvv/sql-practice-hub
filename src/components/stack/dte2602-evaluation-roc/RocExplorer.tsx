import { useMemo, useState } from "react";

/**
 * RocExplorer — dypere interaktiv ROC-utforsker
 *
 * Pedagogikk:
 *  - Basis: én modell-kvalitet, flyttbar terskel — se hvordan TP/FP/FN/TN endres
 *  - Dypere: bytt mellom dårlig / god / perfekt modell, se histogrammene gli fra
 *    overlappende til separerte → AUC kryper fra ~0.55 til 1.00
 *  - Eksamen: forklar AUC = sannsynligheten for at en tilfeldig positiv
 *    rankes høyere enn en tilfeldig negativ — uavhengig av terskel
 */

type ModelQuality = "darlig" | "god" | "perfekt";

type Sample = { score: number; label: 0 | 1 };

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function gauss(rand: () => number, m: number, sd: number): number {
  // Box-Muller
  const u = Math.max(1e-9, 1 - rand());
  const v = rand();
  return m + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function generateSamples(quality: ModelQuality): Sample[] {
  const seedBase = quality === "darlig" ? 11 : quality === "god" ? 22 : 33;
  const r = lcg(seedBase);
  let neg_mean: number;
  let pos_mean: number;
  let sd: number;
  if (quality === "darlig") {
    neg_mean = 0.42;
    pos_mean = 0.58;
    sd = 0.2;
  } else if (quality === "god") {
    neg_mean = 0.3;
    pos_mean = 0.7;
    sd = 0.14;
  } else {
    neg_mean = 0.2;
    pos_mean = 0.85;
    sd = 0.06;
  }
  const out: Sample[] = [];
  for (let i = 0; i < 50; i++) {
    out.push({
      score: Math.max(0, Math.min(1, gauss(r, neg_mean, sd))),
      label: 0,
    });
    out.push({
      score: Math.max(0, Math.min(1, gauss(r, pos_mean, sd))),
      label: 1,
    });
  }
  return out;
}

function metricsAt(samples: Sample[], thr: number) {
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  for (const s of samples) {
    const pred = s.score >= thr ? 1 : 0;
    if (s.label === 1 && pred === 1) tp++;
    else if (s.label === 0 && pred === 1) fp++;
    else if (s.label === 0 && pred === 0) tn++;
    else fn++;
  }
  const nPos = tp + fn;
  const nNeg = tn + fp;
  const prec = tp + fp > 0 ? tp / (tp + fp) : 0;
  const rec = nPos > 0 ? tp / nPos : 0;
  const f1 = prec + rec > 0 ? (2 * prec * rec) / (prec + rec) : 0;
  const acc = (tp + tn) / (tp + tn + fp + fn);
  const tpr = nPos > 0 ? tp / nPos : 0;
  const fpr = nNeg > 0 ? fp / nNeg : 0;
  return { tp, fp, tn, fn, prec, rec, f1, acc, tpr, fpr };
}

function rocPath(samples: Sample[]): { fpr: number; tpr: number; thr: number }[] {
  const thresholds = Array.from({ length: 101 }, (_, i) => 1 - i * 0.01);
  return thresholds.map((thr) => {
    const m = metricsAt(samples, thr);
    return { fpr: m.fpr, tpr: m.tpr, thr };
  });
}

function aucFromPath(path: { fpr: number; tpr: number }[]): number {
  let area = 0;
  for (let i = 1; i < path.length; i++) {
    const x1 = path[i - 1].fpr;
    const x2 = path[i].fpr;
    const y1 = path[i - 1].tpr;
    const y2 = path[i].tpr;
    area += ((x2 - x1) * (y1 + y2)) / 2;
  }
  return area;
}

const QUALITIES: { id: ModelQuality; label: string; desc: string }[] = [
  {
    id: "darlig",
    label: "Dårlig modell",
    desc: "Klassene overlapper kraftig — AUC nær 0.5",
  },
  {
    id: "god",
    label: "God modell",
    desc: "Tydelig separasjon, men noe overlapp",
  },
  {
    id: "perfekt",
    label: "Perfekt modell",
    desc: "Helt separerte distribusjoner — AUC = 1.0",
  },
];

export function RocExplorer() {
  const [quality, setQuality] = useState<ModelQuality>("god");
  const [thr, setThr] = useState(0.5);
  const samples = useMemo(() => generateSamples(quality), [quality]);
  const path = useMemo(() => rocPath(samples), [samples]);
  const auc = useMemo(() => aucFromPath(path), [path]);
  const m = useMemo(() => metricsAt(samples, thr), [samples, thr]);

  // Histogram
  const BUCKETS = 24;
  const hist = useMemo(() => {
    const h0 = new Array(BUCKETS).fill(0);
    const h1 = new Array(BUCKETS).fill(0);
    for (const s of samples) {
      const i = Math.min(BUCKETS - 1, Math.floor(s.score * BUCKETS));
      if (s.label === 0) h0[i]++;
      else h1[i]++;
    }
    return { h0, h1, max: Math.max(...h0, ...h1, 1) };
  }, [samples]);

  // ROC dims
  const RW = 280;
  const RH = 240;
  const RPAD = 35;
  const rx = (v: number) => RPAD + v * (RW - 2 * RPAD);
  const ry = (v: number) => RH - RPAD - v * (RH - 2 * RPAD);

  // Histogram dims
  const HW = 280;
  const HH = 160;
  const HPAD = 30;
  const barW = (HW - 2 * HPAD) / BUCKETS;

  // Best-F1 threshold for hint
  const bestF1 = useMemo(() => {
    let best = { thr: 0.5, f1: 0 };
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const f1 = metricsAt(samples, t).f1;
      if (f1 > best.f1) best = { thr: t, f1 };
    }
    return best;
  }, [samples]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div>
        <div className="text-xs text-muted-foreground mb-1">Modell-kvalitet</div>
        <div className="flex gap-1 flex-wrap">
          {QUALITIES.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setQuality(q.id)}
              className={`px-2.5 py-1 text-xs rounded border transition ${
                quality === q.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">
          {QUALITIES.find((q) => q.id === quality)?.desc}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs text-muted-foreground whitespace-nowrap">
          Terskel: <span className="font-mono">{thr.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={thr}
          onChange={(e) => setThr(parseFloat(e.target.value))}
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => setThr(bestF1.thr)}
          className="px-2 py-1 text-[10px] rounded border border-border text-muted-foreground hover:text-foreground"
        >
          Maks-F1 ({bestF1.thr.toFixed(2)})
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* ROC */}
        <div>
          <div className="text-xs font-semibold mb-1">
            ROC-kurve — AUC ={" "}
            <span className="font-mono text-emerald-400">{auc.toFixed(3)}</span>
          </div>
          <svg width={RW} height={RH} className="block bg-background rounded">
            {/* gridlines */}
            {[0.25, 0.5, 0.75].map((v) => (
              <g key={v}>
                <line
                  x1={rx(v)}
                  y1={ry(0)}
                  x2={rx(v)}
                  y2={ry(1)}
                  stroke="#444"
                  strokeWidth={0.5}
                  opacity={0.4}
                />
                <line
                  x1={rx(0)}
                  y1={ry(v)}
                  x2={rx(1)}
                  y2={ry(v)}
                  stroke="#444"
                  strokeWidth={0.5}
                  opacity={0.4}
                />
              </g>
            ))}
            {/* axes */}
            <line
              x1={rx(0)}
              y1={ry(0)}
              x2={rx(1)}
              y2={ry(0)}
              stroke="#888"
            />
            <line
              x1={rx(0)}
              y1={ry(0)}
              x2={rx(0)}
              y2={ry(1)}
              stroke="#888"
            />
            {/* diagonal */}
            <line
              x1={rx(0)}
              y1={ry(0)}
              x2={rx(1)}
              y2={ry(1)}
              stroke="#666"
              strokeDasharray="3 3"
            />
            {/* AUC fill */}
            <path
              d={`M ${rx(0)} ${ry(0)} ${path
                .map((p) => `L ${rx(p.fpr)} ${ry(p.tpr)}`)
                .join(" ")} L ${rx(1)} ${ry(0)} Z`}
              fill="#22c55e"
              opacity={0.12}
            />
            {/* curve */}
            <path
              d={path
                .map(
                  (p, i) =>
                    `${i === 0 ? "M" : "L"} ${rx(p.fpr)} ${ry(p.tpr)}`,
                )
                .join(" ")}
              fill="none"
              stroke="#22c55e"
              strokeWidth={2}
            />
            {/* current threshold */}
            <circle
              cx={rx(m.fpr)}
              cy={ry(m.tpr)}
              r={6}
              fill="#facc15"
              stroke="#000"
              strokeWidth={1}
            />
            {/* labels */}
            <text x={rx(0.5)} y={RH - 5} textAnchor="middle" fontSize={10} fill="#888">
              FPR
            </text>
            <text
              x={10}
              y={ry(0.5)}
              textAnchor="middle"
              fontSize={10}
              fill="#888"
              transform={`rotate(-90, 10, ${ry(0.5)})`}
            >
              TPR
            </text>
          </svg>
        </div>

        {/* Confusion matrix + metrics */}
        <div className="text-xs space-y-2">
          <div className="rounded-lg border border-border bg-background overflow-hidden">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-muted/40">
                  <th className="px-2 py-1"></th>
                  <th className="px-2 py-1">Pred 1</th>
                  <th className="px-2 py-1">Pred 0</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-2 py-1 font-semibold">Fakt 1</td>
                  <td className="px-2 py-1 text-emerald-400 font-mono">
                    TP {m.tp}
                  </td>
                  <td className="px-2 py-1 text-rose-400 font-mono">
                    FN {m.fn}
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-2 py-1 font-semibold">Fakt 0</td>
                  <td className="px-2 py-1 text-rose-400 font-mono">
                    FP {m.fp}
                  </td>
                  <td className="px-2 py-1 text-emerald-400 font-mono">
                    TN {m.tn}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Precision" value={m.prec} />
            <Metric label="Recall (TPR)" value={m.rec} />
            <Metric label="F1" value={m.f1} highlight />
            <Metric label="Accuracy" value={m.acc} />
            <Metric label="FPR" value={m.fpr} />
            <Metric label="Spec (1-FPR)" value={1 - m.fpr} />
          </div>
        </div>
      </div>

      {/* Histogram of scores */}
      <div>
        <div className="text-xs font-semibold mb-1">
          Score-fordeling — klasse 0 (rød), klasse 1 (blå)
        </div>
        <svg width={HW} height={HH} className="block bg-background rounded">
          {/* zero baseline */}
          <line
            x1={HPAD}
            y1={HH - HPAD}
            x2={HW - HPAD}
            y2={HH - HPAD}
            stroke="#888"
          />
          {hist.h0.map((c, i) => {
            const h = (c / hist.max) * (HH - HPAD - 15);
            return (
              <rect
                key={`n${i}`}
                x={HPAD + i * barW}
                y={HH - HPAD - h}
                width={barW - 0.5}
                height={h}
                fill="rgba(244,63,94,0.55)"
              />
            );
          })}
          {hist.h1.map((c, i) => {
            const h = (c / hist.max) * (HH - HPAD - 15);
            return (
              <rect
                key={`p${i}`}
                x={HPAD + i * barW + 0.5}
                y={HH - HPAD - h}
                width={barW - 1}
                height={h}
                fill="rgba(59,130,246,0.6)"
              />
            );
          })}
          {/* threshold */}
          <line
            x1={HPAD + thr * (HW - 2 * HPAD)}
            y1={5}
            x2={HPAD + thr * (HW - 2 * HPAD)}
            y2={HH - HPAD}
            stroke="#facc15"
            strokeWidth={2}
            strokeDasharray="4 3"
          />
          {/* axis labels */}
          <text x={HPAD} y={HH - 8} fontSize={9} fill="#888">
            0
          </text>
          <text x={HW - HPAD} y={HH - 8} fontSize={9} fill="#888" textAnchor="end">
            1
          </text>
          <text
            x={HPAD + thr * (HW - 2 * HPAD)}
            y={HH - 8}
            fontSize={9}
            fill="#facc15"
            textAnchor="middle"
          >
            t={thr.toFixed(2)}
          </text>
        </svg>
      </div>

      <p className="text-xs text-muted-foreground">
        <strong>Eksamenstrigger:</strong> «AUC = sannsynligheten for at en
        tilfeldig positiv rankes høyere enn en tilfeldig negativ.» Notér at AUC
        endrer seg ikke når du beveger terskelen — kun{" "}
        <em>posisjonen</em> på kurven (gul prikk) flytter seg.
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-border p-2 ${
        highlight ? "bg-brand/10" : "bg-background"
      }`}
    >
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div className="text-sm font-mono">{value.toFixed(3)}</div>
    </div>
  );
}
