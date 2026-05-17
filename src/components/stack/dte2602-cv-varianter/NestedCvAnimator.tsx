import { useMemo, useState } from "react";

/**
 * Nested CV animator:
 * - Outer loop: 5-fold for unbiased performance estimate
 * - Inner loop: 3-fold for hyperparameter search (run per outer fold)
 * - Show that "single CV for tuning" gives optimistically biased estimate
 */

const N_OUTER = 5;
const N_INNER = 3;
const N_TOTAL = 30;

const HYPERS = [0.01, 0.1, 1.0, 10.0];

type Mode = "single" | "nested";

// Deterministic per-(outer,inner,hyper) "validation score" so the user can step through
function innerScore(outer: number, inner: number, hyperIdx: number): number {
  const s = (outer * 1000 + inner * 100 + hyperIdx * 7) * 9301 + 49297;
  const r = (s % 233280) / 233280;
  // Slight preference for hyperIdx=2 (lambda=1.0) so a "best" emerges
  const center = hyperIdx === 2 ? 0.85 : hyperIdx === 1 ? 0.82 : hyperIdx === 3 ? 0.79 : 0.74;
  return center + (r - 0.5) * 0.06;
}

function outerScore(outer: number, bestHyperIdx: number): number {
  // Once we picked best hyper from inner, retrain on full outer-train and score outer-test
  const s = (outer * 31 + bestHyperIdx * 11) * 9301 + 49297;
  const r = (s % 233280) / 233280;
  const center = bestHyperIdx === 2 ? 0.84 : bestHyperIdx === 1 ? 0.81 : bestHyperIdx === 3 ? 0.78 : 0.73;
  return center + (r - 0.5) * 0.05;
}

export function NestedCvAnimator() {
  const [mode, setMode] = useState<Mode>("nested");
  const [outerFold, setOuterFold] = useState(0);
  const [step, setStep] = useState(0); // 0 = inner not done, 1 = inner done, 2 = outer scored

  // For nested mode, per outer fold compute best hyperparameter and outer score
  const results = useMemo(() => {
    const out: { outer: number; innerScores: number[][]; best: number; outerScore: number }[] = [];
    for (let o = 0; o < N_OUTER; o++) {
      // innerScores[hyperIdx][innerFold]
      const innerScores: number[][] = HYPERS.map((_, hi) =>
        Array.from({ length: N_INNER }, (_, ii) => innerScore(o, ii, hi)),
      );
      const meanPerHyper = innerScores.map((arr) => arr.reduce((s, v) => s + v, 0) / arr.length);
      let best = 0;
      let bestVal = -Infinity;
      meanPerHyper.forEach((v, i) => {
        if (v > bestVal) {
          bestVal = v;
          best = i;
        }
      });
      out.push({
        outer: o,
        innerScores,
        best,
        outerScore: outerScore(o, best),
      });
    }
    return out;
  }, []);

  // Single-CV (biased) estimate: best hyperparameter picked on ALL data, then reported as performance.
  // Approximation: take overall best hyper from average inner-scores across all outer-folds.
  const singleCv = useMemo(() => {
    const avgPerHyper = HYPERS.map((_, hi) => {
      let s = 0;
      let c = 0;
      for (let o = 0; o < N_OUTER; o++) {
        for (let ii = 0; ii < N_INNER; ii++) {
          s += innerScore(o, ii, hi);
          c++;
        }
      }
      return s / c;
    });
    const best = avgPerHyper.indexOf(Math.max(...avgPerHyper));
    // Optimistic: this score is reported "as is" — same data was used for selection AND reporting
    const reported = avgPerHyper[best];
    return { best, reported };
  }, []);

  // Nested-CV: average of outer-fold scores
  const nestedScore =
    results.reduce((s, r) => s + r.outerScore, 0) / results.length;

  const cur = results[outerFold];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="text-xs text-muted-foreground mr-2">Modus:</div>
        <button
          onClick={() => setMode("single")}
          className={`px-3 py-1 rounded-md text-xs font-mono border transition-colors ${
            mode === "single"
              ? "border-brand bg-brand/10 text-foreground"
              : "border-border bg-background text-muted-foreground hover:border-brand/40"
          }`}
        >
          Single CV (biased)
        </button>
        <button
          onClick={() => setMode("nested")}
          className={`px-3 py-1 rounded-md text-xs font-mono border transition-colors ${
            mode === "nested"
              ? "border-brand bg-brand/10 text-foreground"
              : "border-border bg-background text-muted-foreground hover:border-brand/40"
          }`}
        >
          Nested CV
        </button>
      </div>

      {mode === "nested" && (
        <>
          <div className="flex items-center gap-3 mb-3">
            <label className="text-xs text-muted-foreground">
              Outer fold: {outerFold + 1} / {N_OUTER}
            </label>
            <input
              type="range"
              min={0}
              max={N_OUTER - 1}
              value={outerFold}
              onChange={(e) => {
                setOuterFold(parseInt(e.target.value));
                setStep(0);
              }}
              className="flex-1"
            />
            <button
              onClick={() => setStep((s) => Math.min(2, s + 1))}
              disabled={step >= 2}
              className="px-3 py-1 rounded-md text-xs font-mono border border-border bg-background hover:border-brand/40 disabled:opacity-50 transition-colors"
            >
              Neste steg
            </button>
            <button
              onClick={() => setStep(0)}
              className="px-3 py-1 rounded-md text-xs font-mono border border-border bg-background hover:border-brand/40 transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Outer fold visualization */}
          <div className="rounded-lg border border-border bg-background p-3 mb-3">
            <div className="text-xs font-semibold mb-2">
              Outer fold {outerFold + 1}: train-segment (innerCV kjøres her) vs holdout (ubrukt til siste)
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: N_TOTAL }, (_, i) => {
                const outerFoldSize = Math.floor(N_TOTAL / N_OUTER);
                const testStart = outerFold * outerFoldSize;
                const testEnd = testStart + outerFoldSize;
                const isHoldout = i >= testStart && i < testEnd;
                return (
                  <div
                    key={i}
                    className={`h-5 flex-1 rounded-sm ${
                      isHoldout ? "bg-rose-500" : "bg-emerald-500/60"
                    }`}
                    title={isHoldout ? "outer test (holdout)" : "outer train (inner CV kjøres her)"}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500/60" />
                outer train ({Math.floor((N_TOTAL * (N_OUTER - 1)) / N_OUTER)} samples — innerCV jobber her)
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-sm bg-rose-500" />
                outer test (holdout — usett til slutt)
              </span>
            </div>
          </div>

          {/* Step 1: Inner CV — grid over hypers */}
          <div
            className={`rounded-lg border bg-background p-3 mb-3 transition-opacity ${
              step >= 0 ? "opacity-100" : "opacity-40"
            } ${step >= 1 ? "border-brand/40" : "border-border"}`}
          >
            <div className="text-xs font-semibold mb-2">
              Steg 1: Inner {N_INNER}-fold CV over hyperparameter-grid på outer-train
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left font-semibold px-2 py-1 w-24">λ (hyper)</th>
                    {Array.from({ length: N_INNER }, (_, ii) => (
                      <th key={ii} className="text-left font-semibold px-2 py-1">
                        Inner fold {ii + 1}
                      </th>
                    ))}
                    <th className="text-left font-semibold px-2 py-1 w-20">Inner-snitt</th>
                  </tr>
                </thead>
                <tbody>
                  {HYPERS.map((h, hi) => {
                    const row = cur.innerScores[hi];
                    const mean = row.reduce((s, v) => s + v, 0) / row.length;
                    const isBest = hi === cur.best;
                    return (
                      <tr
                        key={hi}
                        className={`border-t border-border ${
                          isBest && step >= 1 ? "bg-emerald-500/10" : ""
                        }`}
                      >
                        <td className="px-2 py-1 font-mono">
                          {h.toFixed(2)} {isBest && step >= 1 ? "✓ valgt" : ""}
                        </td>
                        {row.map((v, ii) => (
                          <td key={ii} className="px-2 py-1 font-mono text-muted-foreground">
                            {v.toFixed(3)}
                          </td>
                        ))}
                        <td
                          className={`px-2 py-1 font-mono ${
                            isBest && step >= 1 ? "font-semibold text-emerald-400" : ""
                          }`}
                        >
                          {mean.toFixed(3)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Step 2: Outer score */}
          <div
            className={`rounded-lg border bg-background p-3 mb-3 transition-opacity ${
              step >= 2 ? "opacity-100 border-brand/40" : "opacity-40 border-border"
            }`}
          >
            <div className="text-xs font-semibold mb-2">
              Steg 2: Tren med λ={HYPERS[cur.best].toFixed(2)} på hele outer-train, score på outer-test
            </div>
            {step >= 2 && (
              <div className="text-sm font-mono">
                Outer fold {outerFold + 1} score:{" "}
                <span className="text-emerald-400 font-semibold">
                  {cur.outerScore.toFixed(3)}
                </span>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs">
            <div className="font-semibold mb-2">Alle outer folds — nestedCV-resultat</div>
            <div className="space-y-1">
              {results.map((r) => (
                <div key={r.outer} className="flex items-center gap-3 font-mono">
                  <span className="w-20 text-muted-foreground">
                    Outer {r.outer + 1}
                  </span>
                  <span className="w-32 text-muted-foreground">
                    valgt λ={HYPERS[r.best].toFixed(2)}
                  </span>
                  <span
                    className={`${
                      r.outer === outerFold ? "text-brand font-semibold" : ""
                    }`}
                  >
                    score {r.outerScore.toFixed(3)}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-3 font-mono border-t border-border pt-1 mt-1">
                <span className="w-20 font-semibold">Nested CV</span>
                <span className="w-32 text-muted-foreground">snitt over outer</span>
                <span className="text-emerald-400 font-semibold">
                  {nestedScore.toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {mode === "single" && (
        <div className="space-y-3">
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-xs">
            <div className="font-semibold mb-2 text-rose-400">
              Single CV for tuning (biased)
            </div>
            <p className="text-muted-foreground mb-2">
              Pseudokode: kjør inner CV med grid, velg λ som har høyest snitt, rapporter
              SELVE den snittet som «modellens ytelse».
            </p>
            <pre className="bg-background/60 p-2 rounded font-mono text-[10px] overflow-x-auto">{`gs = GridSearchCV(model, params, cv=5)
gs.fit(X, y)
print(gs.best_score_)  # ← BIASED!`}</pre>
          </div>
          <div className="rounded-lg border border-border bg-background p-3 text-xs">
            <div className="font-semibold mb-2">Hva som skjer</div>
            <p className="text-muted-foreground">
              Modellvalget {""}
              <em>cherry-pickеr</em> hyperparameteren som maksimerer CV-snittet på
              <em> denne</em> dataen — så snittet vi rapporterer er optimistisk
              biased (samme data brukt til seleksjon og rapportering).
            </p>
            <div className="mt-3 font-mono">
              Best λ:{" "}
              <span className="font-semibold">
                {HYPERS[singleCv.best].toFixed(2)}
              </span>
              <br />
              Rapportert «accuracy»:{" "}
              <span className="text-rose-400 font-semibold">
                {singleCv.reported.toFixed(3)}
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs">
            <div className="font-semibold text-emerald-400 mb-1">
              Sammenlign med nested CV
            </div>
            <div className="font-mono">
              Single (biased): <span className="text-rose-400">{singleCv.reported.toFixed(3)}</span>
              <br />
              Nested (unbiased): <span className="text-emerald-400">{nestedScore.toFixed(3)}</span>
              <br />
              Differanse:{" "}
              <span className="font-semibold">
                {(singleCv.reported - nestedScore).toFixed(3)} (optimisme)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
