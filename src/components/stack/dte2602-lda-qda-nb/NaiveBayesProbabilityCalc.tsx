import { useMemo, useState } from "react";

// Spam-deteksjon med 3 binære features (ord-tilstedeværelse).
// To klasser: spam / ham.
// Vi viser P(class), P(x_i | class) per feature, og P(class | x) ∝ P(class) · ∏ P(x_i | class).

type FeatureName = "viagra" | "free" | "meeting";
const FEATURES: FeatureName[] = ["viagra", "free", "meeting"];

// Counts per class for each feature (number of training emails where word appears).
const COUNTS: Record<"spam" | "ham", Record<FeatureName, number>> = {
  spam: { viagra: 18, free: 22, meeting: 1 },
  ham: { viagra: 0, free: 12, meeting: 38 },
};
const TOTAL: Record<"spam" | "ham", number> = { spam: 25, ham: 50 };

function pX(
  cls: "spam" | "ham",
  feat: FeatureName,
  present: boolean,
  smoothing: boolean,
): number {
  const c = COUNTS[cls][feat];
  const n = TOTAL[cls];
  if (smoothing) {
    return (present ? c + 1 : n - c + 1) / (n + 2);
  }
  // Without Laplace: pure MLE
  const p = present ? c / n : (n - c) / n;
  return p;
}

export function NaiveBayesProbabilityCalc() {
  const [x, setX] = useState<Record<FeatureName, boolean>>({
    viagra: true,
    free: true,
    meeting: false,
  });
  const [priorSpam, setPriorSpam] = useState(0.3);
  const [smoothing, setSmoothing] = useState(true);

  const calc = useMemo(() => {
    const pSpam = priorSpam;
    const pHam = 1 - priorSpam;
    const likeSpam: Record<FeatureName, number> = {} as any;
    const likeHam: Record<FeatureName, number> = {} as any;
    for (const f of FEATURES) {
      likeSpam[f] = pX("spam", f, x[f], smoothing);
      likeHam[f] = pX("ham", f, x[f], smoothing);
    }
    const prodSpam = FEATURES.reduce((p, f) => p * likeSpam[f], 1);
    const prodHam = FEATURES.reduce((p, f) => p * likeHam[f], 1);
    const numSpam = pSpam * prodSpam;
    const numHam = pHam * prodHam;
    const z = numSpam + numHam || 1;
    return {
      pSpam,
      pHam,
      likeSpam,
      likeHam,
      prodSpam,
      prodHam,
      numSpam,
      numHam,
      postSpam: numSpam / z,
      postHam: numHam / z,
    };
  }, [x, priorSpam, smoothing]);

  const showsZero =
    !smoothing &&
    (calc.prodSpam === 0 || calc.prodHam === 0);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-5">
        <div>
          <div className="text-xs font-semibold mb-2">Trenings-tellinger</div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-3 py-1.5 font-semibold">Feature</th>
                  <th className="text-right px-3 py-1.5 font-semibold">spam (n=25)</th>
                  <th className="text-right px-3 py-1.5 font-semibold">ham (n=50)</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f) => (
                  <tr key={f} className="border-t border-border">
                    <td className="px-3 py-1.5 font-mono">"{f}"</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">
                      {COUNTS.spam[f]} / 25
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">
                      {COUNTS.ham[f]} / 50
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-xs font-semibold mb-2">Velg input-vektor x</div>
          <div className="flex flex-wrap gap-2">
            {FEATURES.map((f) => (
              <button
                key={f}
                onClick={() => setX({ ...x, [f]: !x[f] })}
                className={`px-3 py-1.5 rounded-md text-xs font-mono border transition-colors ${
                  x[f]
                    ? "border-brand bg-brand/10 text-foreground"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                {f} = {x[f] ? "1" : "0"}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">
                Prior P(spam) = {calc.pSpam.toFixed(2)}
              </span>
              <span className="text-muted-foreground">
                P(ham) = {calc.pHam.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.95}
              step={0.01}
              value={priorSpam}
              onChange={(e) => setPriorSpam(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <label className="flex items-center gap-2 text-xs mt-3 text-muted-foreground">
            <input
              type="checkbox"
              checked={smoothing}
              onChange={(e) => setSmoothing(e.target.checked)}
            />
            Laplace-smoothing (+1 i teller, +2 i nevner)
          </label>
          {showsZero && (
            <div className="mt-2 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 p-2 text-[11px]">
              Uten Laplace blir produktet 0 så snart ett ord aldri er sett i en klasse —
              for «viagra»=1 har ham 0/50. Skru på Laplace for å unngå overskriving
              av all annen evidens.
            </div>
          )}
        </div>
        <div>
          <div className="text-xs font-semibold mb-2">
            P(x | class) per feature
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-3 py-1.5 font-semibold">x</th>
                  <th className="text-right px-3 py-1.5 font-semibold">
                    P(·|spam)
                  </th>
                  <th className="text-right px-3 py-1.5 font-semibold">
                    P(·|ham)
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f) => (
                  <tr key={f} className="border-t border-border">
                    <td className="px-3 py-1.5 font-mono">
                      {f} = {x[f] ? "1" : "0"}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">
                      {calc.likeSpam[f].toFixed(4)}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">
                      {calc.likeHam[f].toFixed(4)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-border bg-muted/30">
                  <td className="px-3 py-1.5 font-mono font-semibold">
                    ∏ P(x|class)
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums font-semibold">
                    {calc.prodSpam.toExponential(3)}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums font-semibold">
                    {calc.prodHam.toExponential(3)}
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-1.5 font-mono">× prior</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    × {calc.pSpam.toFixed(2)}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    × {calc.pHam.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-t border-border bg-muted/30">
                  <td className="px-3 py-1.5 font-mono font-semibold">
                    = teller
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums font-semibold">
                    {calc.numSpam.toExponential(3)}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums font-semibold">
                    {calc.numHam.toExponential(3)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold mb-2">
              Normalisering ⇒ posterior P(class | x)
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono">P(spam | x)</span>
                  <span className="font-bold tabular-nums">
                    {(calc.postSpam * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-background border border-border overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all"
                    style={{ width: `${calc.postSpam * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono">P(ham | x)</span>
                  <span className="font-bold tabular-nums">
                    {(calc.postHam * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-background border border-border overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${calc.postHam * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs">
              <span className="text-muted-foreground">Prediksjon: </span>
              <span
                className={`font-bold font-mono ${
                  calc.postSpam > calc.postHam
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {calc.postSpam > calc.postHam ? "SPAM" : "HAM"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Naive Bayes-grunnregelen: <code>P(class | x) ∝ P(class) · ∏ P(x_i | class)</code>.
        Skyv prior-slideren mot 0.5 og se hvordan posterior bytter — i ekte spam-filtre
        er priorene ofte 0.1–0.3 fordi de fleste mailer er ham. Skru av Laplace og
        prøv «viagra»=1: produktet for ham blir 0 og hele evidensen kollapser.
      </p>
    </div>
  );
}
