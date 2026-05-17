import { useMemo, useState } from "react";

type Sample = { score: number; y: 0 | 1 };

// Deterministic LCG-like for reproducible pseudo-data
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
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mu + sigma * z;
}

function sigmoid(z: number): number {
  if (z > 40) return 1;
  if (z < -40) return 0;
  return 1 / (1 + Math.exp(-z));
}

// Build 100 samples for a model of given "skill"
function buildSamples(skill: "god" | "middels" | "random", seed: number): Sample[] {
  const rand = rng(seed);
  const out: Sample[] = [];
  // 50/50 class split
  for (let i = 0; i < 50; i++) {
    // positives: scores around +sep, negatives around -sep
    out.push({ y: 1, score: 0 });
    out.push({ y: 0, score: 0 });
  }
  let sep: number;
  let noise: number;
  if (skill === "god") {
    sep = 2.0;
    noise = 0.9;
  } else if (skill === "middels") {
    sep = 0.8;
    noise = 1.2;
  } else {
    sep = 0;
    noise = 1.5;
  }
  for (const s of out) {
    const raw = randNorm(rand, s.y === 1 ? sep : -sep, noise);
    s.score = sigmoid(raw);
  }
  return out;
}

function rocPoints(samples: Sample[]): { fpr: number; tpr: number; thr: number }[] {
  const sorted = [...samples].sort((a, b) => b.score - a.score);
  const P = samples.filter((s) => s.y === 1).length;
  const N = samples.filter((s) => s.y === 0).length;
  const pts: { fpr: number; tpr: number; thr: number }[] = [{ fpr: 0, tpr: 0, thr: 1.001 }];
  let tp = 0;
  let fp = 0;
  for (const s of sorted) {
    if (s.y === 1) tp++;
    else fp++;
    pts.push({ fpr: fp / Math.max(1, N), tpr: tp / Math.max(1, P), thr: s.score });
  }
  return pts;
}

function aucFromPoints(pts: { fpr: number; tpr: number }[]): number {
  let a = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].fpr - pts[i - 1].fpr;
    a += (dx * (pts[i].tpr + pts[i - 1].tpr)) / 2;
  }
  return a;
}

function metricsAt(samples: Sample[], thr: number) {
  let tp = 0;
  let fn = 0;
  let fp = 0;
  let tn = 0;
  for (const s of samples) {
    const pred = s.score >= thr ? 1 : 0;
    if (s.y === 1 && pred === 1) tp++;
    else if (s.y === 1 && pred === 0) fn++;
    else if (s.y === 0 && pred === 1) fp++;
    else tn++;
  }
  const tpr = tp + fn === 0 ? 0 : tp / (tp + fn);
  const fpr = fp + tn === 0 ? 0 : fp / (fp + tn);
  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tpr;
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return { tp, fn, fp, tn, tpr, fpr, precision, recall, f1 };
}

const W = 320;
const H = 280;
const PAD = 36;

function RocPlot({
  pts,
  thr,
  color = "#3b82f6",
  marker = true,
  highlightFpr,
  highlightTpr,
}: {
  pts: { fpr: number; tpr: number; thr: number }[];
  thr: number;
  color?: string;
  marker?: boolean;
  highlightFpr?: number;
  highlightTpr?: number;
}) {
  const sx = (v: number) => PAD + v * (W - 2 * PAD);
  const sy = (v: number) => H - PAD - v * (H - 2 * PAD);
  const path = useMemo(() => {
    if (pts.length === 0) return "";
    return (
      "M " +
      pts.map((p) => `${sx(p.fpr).toFixed(1)},${sy(p.tpr).toFixed(1)}`).join(" L ")
    );
  }, [pts]);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#888" strokeWidth={0.8} />
      <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#888" strokeWidth={0.8} />
      {/* diagonal */}
      <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} stroke="#888" strokeDasharray="3 3" strokeOpacity={0.5} />
      <text x={W / 2} y={H - 8} fontSize={9} textAnchor="middle" fill="#888">FPR</text>
      <text x={10} y={H / 2} fontSize={9} textAnchor="middle" fill="#888" transform={`rotate(-90 10 ${H / 2})`}>TPR</text>
      <path d={path} stroke={color} strokeWidth={2} fill="none" />
      {marker && highlightFpr !== undefined && highlightTpr !== undefined && (
        <circle cx={sx(highlightFpr)} cy={sy(highlightTpr)} r={5} fill="#ef4444" stroke="#fff" strokeWidth={1} />
      )}
      <text x={W - PAD - 2} y={PAD + 12} fontSize={9} textAnchor="end" fill="#888">
        thr = {thr.toFixed(2)}
      </text>
    </svg>
  );
}

export function RocCurveAndAucCalc() {
  const [mode, setMode] = useState<"single" | "compare">("single");
  const [skill, setSkill] = useState<"god" | "middels" | "random">("god");
  const [thr, setThr] = useState(0.5);
  const [seed, setSeed] = useState(7);

  const samples = useMemo(() => buildSamples(skill, seed), [skill, seed]);
  const pts = useMemo(() => rocPoints(samples), [samples]);
  const auc = useMemo(() => aucFromPoints(pts), [pts]);
  const m = useMemo(() => metricsAt(samples, thr), [samples, thr]);

  const compareData = useMemo(() => {
    if (mode !== "compare") return null;
    const skills: ("god" | "middels" | "random")[] = ["god", "middels", "random"];
    return skills.map((s) => {
      const sm = buildSamples(s, seed);
      const ps = rocPoints(sm);
      return { skill: s, pts: ps, auc: aucFromPoints(ps) };
    });
  }, [mode, seed]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-xs text-muted-foreground mr-1">Modus:</div>
        {(["single", "compare"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded-md text-xs font-mono border transition-colors ${
              mode === m
                ? "border-brand bg-brand/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:border-brand/40"
            }`}
          >
            {m === "single" ? "Én modell + terskel" : "Sammenlign 3 modeller"}
          </button>
        ))}
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="ml-auto text-xs px-2 py-0.5 rounded border border-border bg-background hover:bg-muted/50"
        >
          Nye 100 prediksjoner
        </button>
      </div>

      {mode === "single" && (
        <div className="grid md:grid-cols-[1fr_auto] gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="text-xs text-muted-foreground mr-1">Modell:</div>
              {(["god", "middels", "random"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSkill(s)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
                    skill === s
                      ? "border-foreground bg-muted text-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-foreground/40"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <RocPlot pts={pts} thr={thr} highlightFpr={m.fpr} highlightTpr={m.tpr} />
            <div className="text-[11px] text-muted-foreground mt-1 text-center">
              AUC = <span className="font-mono tabular-nums text-foreground">{auc.toFixed(3)}</span>
            </div>
          </div>
          <aside className="md:w-64 space-y-3">
            <label className="block">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Klassifikasjons-terskel</span>
                <span className="font-mono tabular-nums">{thr.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.01}
                max={0.99}
                step={0.01}
                value={thr}
                onChange={(e) => setThr(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </label>
            <div className="rounded-lg border border-border bg-background p-3 text-xs">
              <div className="font-semibold mb-1">Confusion matrix</div>
              <table className="w-full font-mono text-[11px]">
                <tbody>
                  <tr>
                    <td className="text-muted-foreground"></td>
                    <td className="text-center text-muted-foreground">pred 0</td>
                    <td className="text-center text-muted-foreground">pred 1</td>
                  </tr>
                  <tr>
                    <td className="text-muted-foreground">y=0</td>
                    <td className="text-center tabular-nums">{m.tn}</td>
                    <td className="text-center tabular-nums text-amber-500">{m.fp}</td>
                  </tr>
                  <tr>
                    <td className="text-muted-foreground">y=1</td>
                    <td className="text-center tabular-nums text-amber-500">{m.fn}</td>
                    <td className="text-center tabular-nums">{m.tp}</td>
                  </tr>
                </tbody>
              </table>
              <div className="border-t border-border pt-2 mt-2 space-y-0.5 font-mono text-[11px]">
                <div>
                  <span className="text-muted-foreground">precision:</span>{" "}
                  <span className="tabular-nums">{m.precision.toFixed(3)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">recall (TPR):</span>{" "}
                  <span className="tabular-nums">{m.recall.toFixed(3)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">F1:</span>{" "}
                  <span className="tabular-nums">{m.f1.toFixed(3)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">FPR:</span>{" "}
                  <span className="tabular-nums">{m.fpr.toFixed(3)}</span>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground leading-snug">
              Senk terskelen → recall opp, precision ned (du fanger flere, men
              flere alarmer er falske). Den røde prikken på ROC viser hvor du
              er. AUC er hele kurvens areal — terskel-uavhengig.
            </div>
          </aside>
        </div>
      )}

      {mode === "compare" && compareData && (
        <div>
          <svg width={W * 1.2} height={H} viewBox={`0 0 ${W * 1.2} ${H}`} className="w-full">
            {(() => {
              const Wc = W * 1.2;
              const sx = (v: number) => PAD + v * (Wc - 2 * PAD);
              const sy = (v: number) => H - PAD - v * (H - 2 * PAD);
              const colors: Record<string, string> = {
                god: "#10b981",
                middels: "#3b82f6",
                random: "#94a3b8",
              };
              return (
                <>
                  <line x1={PAD} y1={H - PAD} x2={Wc - PAD} y2={H - PAD} stroke="#888" strokeWidth={0.8} />
                  <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#888" strokeWidth={0.8} />
                  <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} stroke="#888" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <text x={Wc / 2} y={H - 8} fontSize={9} textAnchor="middle" fill="#888">FPR</text>
                  <text x={10} y={H / 2} fontSize={9} textAnchor="middle" fill="#888" transform={`rotate(-90 10 ${H / 2})`}>TPR</text>
                  {compareData.map((d) => {
                    const path =
                      "M " +
                      d.pts
                        .map((p) => `${sx(p.fpr).toFixed(1)},${sy(p.tpr).toFixed(1)}`)
                        .join(" L ");
                    return <path key={d.skill} d={path} stroke={colors[d.skill]} strokeWidth={2} fill="none" />;
                  })}
                  {/* legend */}
                  {compareData.map((d, i) => (
                    <g key={d.skill}>
                      <rect x={Wc - 110} y={PAD + i * 18 - 8} width={10} height={10} fill={colors[d.skill]} />
                      <text x={Wc - 96} y={PAD + i * 18} fontSize={10} fill="#888">
                        {d.skill} · AUC {d.auc.toFixed(3)}
                      </text>
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>
          <div className="text-[11px] text-muted-foreground mt-2 leading-snug">
            «god» klatrer raskt nordover (høy TPR ved lav FPR). «random» følger
            diagonalen (AUC ≈ 0.5). En modell med AUC under 0.5 er verre enn å
            slå mynt — du kan flippe prediksjonene og få over 0.5.
          </div>
        </div>
      )}
    </div>
  );
}
