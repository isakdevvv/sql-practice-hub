import { useMemo, useState } from "react";

type Mode =
  | "holdout"
  | "kfold"
  | "stratified"
  | "loocv"
  | "lpo"
  | "timeseries"
  | "group";

const N = 30;

/** Deterministic class labels (0/1) for stratified mode. */
const LABELS: number[] = (() => {
  // ~25% class-1
  const out: number[] = [];
  for (let i = 0; i < N; i++) {
    out.push(i % 4 === 1 ? 1 : 0);
  }
  return out;
})();

/** Deterministic groups (e.g. patient_id) for group mode — 6 groups of 5 */
const GROUPS: number[] = Array.from({ length: N }, (_, i) => Math.floor(i / 5));

function makeFolds(
  mode: Mode,
  k: number,
  p: number,
): { folds: number[][]; testFor: number[] } {
  const testFor = new Array(N).fill(-1);
  let folds: number[][] = [];

  if (mode === "holdout") {
    const cutoff = Math.floor(N * 0.8);
    folds = [Array.from({ length: N - cutoff }, (_, i) => cutoff + i)];
    folds[0].forEach((i) => (testFor[i] = 0));
  } else if (mode === "loocv") {
    folds = Array.from({ length: N }, (_, i) => [i]);
    for (let i = 0; i < N; i++) testFor[i] = i;
  } else if (mode === "lpo") {
    // Leave-P-Out: show first 6 of nCp combinations (combinatorially too many)
    folds = [];
    const limit = Math.min(6, Math.floor(N / p));
    for (let f = 0; f < limit; f++) {
      const fold: number[] = [];
      for (let j = 0; j < p; j++) {
        const idx = (f * p + j) % N;
        fold.push(idx);
      }
      folds.push(fold);
      // testFor only stores the first occurrence — for LPO same idx can appear in many folds
    }
    folds.forEach((f, fi) => f.forEach((i) => (testFor[i] = fi)));
  } else if (mode === "kfold") {
    folds = Array.from({ length: k }, () => []);
    for (let i = 0; i < N; i++) {
      folds[i % k].push(i);
      testFor[i] = i % k;
    }
  } else if (mode === "stratified") {
    folds = Array.from({ length: k }, () => []);
    const class1 = LABELS.map((c, i) => (c === 1 ? i : -1)).filter((i) => i >= 0);
    const class0 = LABELS.map((c, i) => (c === 0 ? i : -1)).filter((i) => i >= 0);
    class1.forEach((idx, j) => folds[j % k].push(idx));
    class0.forEach((idx, j) => folds[j % k].push(idx));
    folds.forEach((fold, f) => fold.forEach((i) => (testFor[i] = f)));
  } else if (mode === "group") {
    folds = Array.from({ length: k }, () => []);
    const uniqueGroups = Array.from(new Set(GROUPS));
    uniqueGroups.forEach((g, j) => {
      const fi = j % k;
      for (let i = 0; i < N; i++) {
        if (GROUPS[i] === g) {
          folds[fi].push(i);
          testFor[i] = fi;
        }
      }
    });
  } else {
    // timeseries: expanding window
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

/** Deterministic mock scores. */
function mockScores(mode: Mode, folds: number[][]): number[] {
  const seedFromMode: Record<Mode, number> = {
    holdout: 7,
    loocv: 13,
    kfold: 21,
    stratified: 29,
    timeseries: 41,
    lpo: 53,
    group: 67,
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
  const [k, setK] = useState(5);
  const [p, setP] = useState(2);
  const [activeFold, setActiveFold] = useState(0);

  const { folds, testFor } = useMemo(() => makeFolds(mode, k, p), [mode, k, p]);
  const scores = useMemo(() => mockScores(mode, folds), [mode, folds]);
  const mean = scores.reduce((s, v) => s + v, 0) / Math.max(1, scores.length);

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

  function isInTrain(i: number): boolean {
    if (mode === "timeseries") {
      const testIdxs = folds[af];
      const minTest = Math.min(...testIdxs);
      return i < minTest;
    }
    if (mode === "lpo") {
      return !folds[af].includes(i);
    }
    return testFor[i] !== af;
  }
  function isInTest(i: number): boolean {
    if (mode === "lpo") return folds[af].includes(i);
    return testFor[i] === af;
  }

  const showK = mode === "kfold" || mode === "stratified" || mode === "group" || mode === "timeseries";
  const showP = mode === "lpo";

  return (
    <div
      className="rounded-xl border border-border bg-card p-5"
      role="region"
      aria-label="Interaktiv visualisering: Cross-validation splits"
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="text-xs text-muted-foreground mr-2">Strategi:</div>
        <Pill m="holdout" label="Hold-out 80/20" />
        <Pill m="kfold" label="k-Fold" />
        <Pill m="stratified" label="Stratified k-Fold" />
        <Pill m="loocv" label="Leave-One-Out" />
        <Pill m="lpo" label="Leave-P-Out" />
        <Pill m="timeseries" label="TimeSeriesSplit" />
        <Pill m="group" label="Group k-Fold" />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        {showK && (
          <label className="text-xs text-muted-foreground inline-flex items-center gap-2 whitespace-nowrap">
            k:
            <select
              value={k}
              onChange={(e) => {
                setK(parseInt(e.target.value));
                setActiveFold(0);
              }}
              className="border border-border bg-background rounded-md px-2 py-1 text-xs font-mono"
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={10}>10</option>
            </select>
          </label>
        )}
        {showP && (
          <label className="text-xs text-muted-foreground inline-flex items-center gap-2 whitespace-nowrap">
            p:
            <select
              value={p}
              onChange={(e) => {
                setP(parseInt(e.target.value));
                setActiveFold(0);
              }}
              className="border border-border bg-background rounded-md px-2 py-1 text-xs font-mono"
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={5}>5</option>
            </select>
          </label>
        )}
        <label className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
          Iterasjon: {af + 1} / {folds.length}
        </label>
        <input
          type="range"
          min={0}
          max={Math.max(0, folds.length - 1)}
          value={af}
          onChange={(e) => setActiveFold(parseInt(e.target.value))}
          className="flex-1 min-w-[120px]"
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
            const groupBorder =
              mode === "group" ? `border-b-2 border-b-sky-500/40` : "";
            return (
              <div
                key={i}
                className={`relative h-9 w-9 rounded-md text-[10px] text-white font-mono flex items-center justify-center ${bg} ${classColor} ${groupBorder}`}
                title={`idx ${i} · klasse ${LABELS[i]}${
                  mode === "group" ? ` · gruppe ${GROUPS[i]}` : ""
                } · ${label}`}
              >
                {mode === "group" ? GROUPS[i] : i}
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
        {mode === "group" && (
          <span className="flex items-center gap-1">
            <span className="text-[10px] font-mono">tall = gruppe-id (pasient/bruker)</span>
          </span>
        )}
      </div>

      {/* Fold table */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
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
                  <td className="px-3 py-2 font-mono text-[10px] truncate max-w-[160px]">
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
        {mode === "holdout" &&
          "Én test-fold (siste 20 %). Rask, men score-en avhenger sterkt av hvilke punkter som havnet i test."}
        {mode === "loocv" &&
          "Hver iterasjon tester på ÉN observasjon. n=30 ⇒ 30 train+score-passeringer. Nesten ingen bias, men dyrt og estimater korrelerer."}
        {mode === "lpo" &&
          `Leave-${p}-Out: hold ut ${p} samples om gangen. Antall kombinasjoner er C(n, p) — vi viser kun de første som demo. Brukes praktisk bare for små n.`}
        {mode === "kfold" &&
          `Vanlig k-fold (k=${k}). Hver observasjon havner i test nøyaktig én gang. Trade-off mellom regning (k passeringer) og varians (større k = mer korrelert).`}
        {mode === "stratified" &&
          `Stratified k-fold (k=${k}). Bevarer andel klasse 1 i hver fold — kritisk ved ubalanse. Sammenlign 'andel klasse 1'-kolonnen med vanlig k-fold.`}
        {mode === "timeseries" &&
          "Train = alt FØR test-vinduet. Aldri tilbakeover. Den eneste lovlige CV-en for tidsserier."}
        {mode === "group" &&
          `Group k-fold (k=${k}). Garanterer at alle samples med samme gruppe-id (pasient/bruker) havner i samme fold — ingen lekkasje mellom train og test.`}
      </p>
    </div>
  );
}
