import { useMemo, useState } from "react";

type Mode = "val" | "loocv" | "kfold" | "stratified" | "timeseries";

const N = 20;

/** Deterministic class labels (0/1) for stratified mode. */
const LABELS: number[] = (() => {
  // 14 of class 0, 6 of class 1 — imbalanced, to make stratification visible.
  const out: number[] = [];
  for (let i = 0; i < N; i++) {
    out.push(i % 4 === 0 ? 1 : 0);
  }
  return out;
})();

function makeFolds(mode: Mode): { folds: number[][]; testFor: number[] } {
  // testFor[i] = which fold has index i as TEST
  const testFor = new Array(N).fill(-1);
  let folds: number[][];

  if (mode === "val") {
    const cutoff = Math.floor(N * 0.8);
    folds = [Array.from({ length: N - cutoff }, (_, i) => cutoff + i)];
    folds[0].forEach((i) => (testFor[i] = 0));
  } else if (mode === "loocv") {
    folds = Array.from({ length: N }, (_, i) => [i]);
    for (let i = 0; i < N; i++) testFor[i] = i;
  } else if (mode === "kfold") {
    const k = 5;
    const size = N / k;
    folds = [];
    for (let f = 0; f < k; f++) {
      const start = Math.floor(f * size);
      const end = Math.floor((f + 1) * size);
      const fold: number[] = [];
      for (let i = start; i < end; i++) {
        fold.push(i);
        testFor[i] = f;
      }
      folds.push(fold);
    }
  } else if (mode === "stratified") {
    const k = 5;
    // Distribute class-1 indices evenly across folds, then class-0
    const class1 = LABELS.map((c, i) => (c === 1 ? i : -1)).filter((i) => i >= 0);
    const class0 = LABELS.map((c, i) => (c === 0 ? i : -1)).filter((i) => i >= 0);
    folds = Array.from({ length: k }, () => [] as number[]);
    class1.forEach((idx, j) => folds[j % k].push(idx));
    class0.forEach((idx, j) => folds[j % k].push(idx));
    folds.forEach((fold, f) => fold.forEach((i) => (testFor[i] = f)));
  } else {
    // timeseries: progressive splits — fold f tests on chunk f+1
    const k = 5;
    const size = Math.floor(N / (k + 1));
    folds = [];
    for (let f = 0; f < k; f++) {
      const start = (f + 1) * size;
      const end = Math.min(N, (f + 2) * size);
      const fold: number[] = [];
      for (let i = start; i < end; i++) {
        fold.push(i);
        testFor[i] = f;
      }
      folds.push(fold);
    }
  }
  return { folds, testFor };
}

/** Mock per-fold "scores" — deterministic, so layout doesn't bounce. */
function mockScores(mode: Mode, folds: number[][]): number[] {
  // Use a deterministic LCG seeded by mode
  const seedFromMode: Record<Mode, number> = {
    val: 7,
    loocv: 13,
    kfold: 21,
    stratified: 29,
    timeseries: 41,
  };
  let s = seedFromMode[mode];
  return folds.map(() => {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    return 0.78 + r * 0.14;
  });
}

export function CvSplitVisualizer() {
  const [mode, setMode] = useState<Mode>("kfold");
  const [activeFold, setActiveFold] = useState(0);

  const { folds, testFor } = useMemo(() => makeFolds(mode), [mode]);
  const scores = useMemo(() => mockScores(mode, folds), [mode, folds]);
  const mean = scores.reduce((s, v) => s + v, 0) / Math.max(1, scores.length);

  // Cap active fold to available
  const af = Math.min(activeFold, folds.length - 1);

  const Pill = ({ m, label }: { m: Mode; label: string }) => (
    <button
      onClick={() => {
        setMode(m);
        setActiveFold(0);
      }}
      className={`px-3 py-1 rounded-md text-xs font-mono border transition-colors ${
        mode === m
          ? "border-brand bg-brand/10 text-foreground"
          : "border-border bg-background text-muted-foreground hover:border-brand/40"
      }`}
    >
      {label}
    </button>
  );

  // For timeseries: train indices are everything BEFORE this fold's test chunk
  function isInTrain(i: number): boolean {
    if (mode === "timeseries") {
      const testIdxs = folds[af];
      const minTest = Math.min(...testIdxs);
      return i < minTest;
    }
    return testFor[i] !== af;
  }
  function isInTest(i: number): boolean {
    return testFor[i] === af;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="text-xs text-muted-foreground mr-2">Variant:</div>
        <Pill m="val" label="Validation 80/20" />
        <Pill m="loocv" label="LOOCV" />
        <Pill m="kfold" label="5-fold" />
        <Pill m="stratified" label="Stratified 5-fold" />
        <Pill m="timeseries" label="TimeSeriesSplit" />
      </div>

      <div className="flex items-center gap-3 mb-3">
        <label className="text-xs text-muted-foreground whitespace-nowrap">
          Iterasjon (fold): {af + 1} / {folds.length}
        </label>
        <input
          type="range"
          min={0}
          max={Math.max(0, folds.length - 1)}
          value={af}
          onChange={(e) => setActiveFold(parseInt(e.target.value))}
          className="flex-1"
          disabled={folds.length <= 1}
        />
      </div>

      {/* Row of data points */}
      <div className="rounded-lg border border-border bg-background p-3 overflow-x-auto">
        <div className="flex gap-1 min-w-fit">
          {Array.from({ length: N }, (_, i) => {
            let bg = "bg-muted/30";
            let label = "ubrukt";
            if (isInTest(i)) {
              bg = "bg-rose-500";
              label = "test";
            } else if (isInTrain(i)) {
              bg = "bg-emerald-500";
              label = "train";
            }
            const classColor = LABELS[i] === 1 ? "ring-2 ring-amber-400" : "";
            return (
              <div
                key={i}
                className={`relative h-9 w-9 rounded-md text-[10px] text-white font-mono flex items-center justify-center ${bg} ${classColor}`}
                title={`index ${i} · klasse ${LABELS[i]} · ${label}`}
              >
                {i}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-emerald-500" />
          train
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-rose-500" />
          test
        </span>
        {mode === "timeseries" && (
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-muted/40 border border-border" />
            framtid (ubrukt i denne folden)
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm ring-2 ring-amber-400 bg-transparent" />
          klasse 1 (minoritet)
        </span>
      </div>

      {/* Fold table */}
      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left font-semibold px-3 py-2 w-16">Fold</th>
              <th className="text-left font-semibold px-3 py-2">Test-indekser</th>
              <th className="text-left font-semibold px-3 py-2 w-32">Andel klasse 1</th>
              <th className="text-left font-semibold px-3 py-2 w-24">Score</th>
            </tr>
          </thead>
          <tbody>
            {folds.map((f, idx) => {
              const class1count = f.filter((i) => LABELS[i] === 1).length;
              const pct = f.length === 0 ? 0 : (class1count / f.length) * 100;
              return (
                <tr
                  key={idx}
                  className={`border-t border-border ${
                    idx === af ? "bg-brand/5" : ""
                  }`}
                >
                  <td className="px-3 py-2 font-mono">{idx + 1}</td>
                  <td className="px-3 py-2 font-mono text-[10px] truncate max-w-[140px]">
                    {f.length > 6
                      ? `[${f.slice(0, 4).join(", ")}, … +${f.length - 4}]`
                      : `[${f.join(", ")}]`}
                  </td>
                  <td className="px-3 py-2 font-mono">{pct.toFixed(0)}%</td>
                  <td className="px-3 py-2 font-mono">{scores[idx].toFixed(3)}</td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-border bg-muted/30">
              <td className="px-3 py-2 font-semibold">Snitt</td>
              <td className="px-3 py-2" />
              <td className="px-3 py-2" />
              <td className="px-3 py-2 font-mono font-semibold">
                {mean.toFixed(3)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        {mode === "val" &&
          "Én test-fold (siste 20 %). Rask, men score-en avhenger sterkt av hvilke punkter som havnet i test."}
        {mode === "loocv" &&
          "Hver iterasjon tester på ÉN observasjon. n=20 ⇒ 20 train+score-passeringer. Nesten ingen bias, men dyrt og estimater korrelerer."}
        {mode === "kfold" &&
          "Vanlig k-fold (k=5). Hver observasjon havner i test nøyaktig én gang. Trade-off mellom regning (k passeringer) og varians (større k = mer korrelert)."}
        {mode === "stratified" &&
          "Bevarer andel klasse 1 i hver fold — kritisk ved ubalanse. Sammenlign 'andel klasse 1'-kolonnen med vanlig k-fold."}
        {mode === "timeseries" &&
          "Train = alt FØR test-vinduet. Aldri tilbakeover. Den eneste lovlige CV-en for tidsserier."}
      </p>
    </div>
  );
}
