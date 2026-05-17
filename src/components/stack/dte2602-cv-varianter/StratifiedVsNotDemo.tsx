import { useMemo, useState } from "react";

/**
 * Show why stratified k-fold matters on imbalanced data.
 * - Class A: 90%, Class B: 10%
 * - Plain KFold can give folds with zero class-B → classifier collapses
 * - Stratified guarantees same class ratio in every fold
 */

const N = 40;

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function makeLabels(seed: number): number[] {
  // 36 class A, 4 class B. Shuffle deterministically with seed.
  const arr: number[] = [];
  for (let i = 0; i < 36; i++) arr.push(0);
  for (let i = 0; i < 4; i++) arr.push(1);
  const rnd = lcg(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function plainKFold(n: number, k: number): number[][] {
  // Take indices in order and chunk
  const folds: number[][] = Array.from({ length: k }, () => []);
  for (let i = 0; i < n; i++) {
    folds[i % k].push(i);
  }
  return folds;
}

function stratifiedKFold(labels: number[], k: number): number[][] {
  const folds: number[][] = Array.from({ length: k }, () => []);
  const byClass: Record<number, number[]> = {};
  labels.forEach((c, i) => {
    if (!byClass[c]) byClass[c] = [];
    byClass[c].push(i);
  });
  Object.values(byClass).forEach((idxs) => {
    idxs.forEach((idx, j) => folds[j % k].push(idx));
  });
  return folds;
}

/**
 * Mock recall for class B: if a fold has zero class-B samples in test, recall
 * for that fold is undefined (we mark as 0 to make collapse visible).
 * Otherwise the trained classifier is approximated to recall ~0.65 if it has
 * seen enough class-B in TRAIN, or 0.10 if class-B is starved in train.
 */
function recallPerFold(folds: number[][], labels: number[]): number[] {
  return folds.map((testIdx) => {
    const testB = testIdx.filter((i) => labels[i] === 1).length;
    if (testB === 0) return -1; // undefined → collapse marker
    const trainIdx = Array.from({ length: labels.length }, (_, i) => i).filter(
      (i) => !testIdx.includes(i),
    );
    const trainB = trainIdx.filter((i) => labels[i] === 1).length;
    if (trainB === 0) return 0.0; // never trained on class B
    if (trainB === 1) return 0.15;
    if (trainB === 2) return 0.35;
    return 0.65;
  });
}

export function StratifiedVsNotDemo() {
  const [k, setK] = useState(5);
  const [seed, setSeed] = useState(2);

  const labels = useMemo(() => makeLabels(seed), [seed]);
  const plain = useMemo(() => plainKFold(N, k), [k]);
  const strat = useMemo(() => stratifiedKFold(labels, k), [labels, k]);

  const plainRecalls = useMemo(() => recallPerFold(plain, labels), [plain, labels]);
  const stratRecalls = useMemo(() => recallPerFold(strat, labels), [strat, labels]);

  function mean(arr: number[]): number {
    const valid = arr.filter((v) => v >= 0);
    if (valid.length === 0) return 0;
    return valid.reduce((s, v) => s + v, 0) / valid.length;
  }

  function FoldRow({
    folds,
    title,
    recalls,
  }: {
    folds: number[][];
    title: string;
    recalls: number[];
  }) {
    return (
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="text-xs font-semibold mb-2">{title}</div>
        <div className="space-y-1">
          {folds.map((f, fi) => {
            const bCount = f.filter((i) => labels[i] === 1).length;
            const pct = ((bCount / f.length) * 100).toFixed(0);
            const r = recalls[fi];
            return (
              <div key={fi} className="flex items-center gap-2">
                <div className="text-[10px] font-mono w-14 text-muted-foreground">
                  Fold {fi + 1}
                </div>
                <div className="flex gap-0.5 flex-1 overflow-x-auto">
                  {f.map((idx) => (
                    <div
                      key={idx}
                      className={`h-5 w-5 rounded-sm text-[8px] text-white font-mono flex items-center justify-center ${
                        labels[idx] === 1 ? "bg-amber-500" : "bg-slate-500/70"
                      }`}
                      title={`idx ${idx} · klasse ${labels[idx] === 1 ? "B" : "A"}`}
                    >
                      {labels[idx] === 1 ? "B" : "·"}
                    </div>
                  ))}
                </div>
                <div className="text-[10px] font-mono w-16 text-right text-muted-foreground">
                  B: {pct}%
                </div>
                <div
                  className={`text-[10px] font-mono w-24 text-right ${
                    r < 0
                      ? "text-rose-400 font-semibold"
                      : r < 0.2
                        ? "text-rose-400"
                        : r >= 0.5
                          ? "text-emerald-400"
                          : "text-amber-400"
                  }`}
                >
                  {r < 0 ? "kollaps (0 B i test)" : `recall ${r.toFixed(2)}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-xs text-muted-foreground inline-flex items-center gap-2">
          k:
          <select
            value={k}
            onChange={(e) => setK(parseInt(e.target.value))}
            className="border border-border bg-background rounded-md px-2 py-1 text-xs font-mono"
          >
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={8}>8</option>
            <option value={10}>10</option>
          </select>
        </label>
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="text-xs px-3 py-1 rounded-md border border-border hover:border-brand/40 transition-colors"
        >
          Ny shuffle (seed {seed})
        </button>
        <div className="text-xs text-muted-foreground">
          Datasett: 36 av klasse A, 4 av klasse B (10 % minoritet)
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <FoldRow folds={plain} title="Vanlig k-fold" recalls={plainRecalls} />
        <FoldRow folds={strat} title="Stratified k-fold" recalls={stratRecalls} />
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-xs">
          <div className="font-semibold text-rose-400 mb-1">Vanlig k-fold</div>
          Snitt-recall (B): <span className="font-mono">{mean(plainRecalls).toFixed(2)}</span>
          {plainRecalls.some((r) => r < 0) && (
            <div className="mt-1 text-rose-400">
              {plainRecalls.filter((r) => r < 0).length} fold(er) helt uten klasse B
              i test ⇒ ikke målbar.
            </div>
          )}
        </div>
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs">
          <div className="font-semibold text-emerald-400 mb-1">Stratified</div>
          Snitt-recall (B): <span className="font-mono">{mean(stratRecalls).toFixed(2)}</span>
          <div className="mt-1 text-muted-foreground">
            Hver fold har samme B-ratio som hele datasettet (10 %).
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        <strong>Prøv:</strong> sett k=8 eller k=10 og bytt seed flere ganger.
        Med vanlig k-fold vil du raskt se folder uten klasse B i test — recall
        er da matematisk udefinert. Stratifisering eliminerer denne kollapsen.
      </p>
    </div>
  );
}
