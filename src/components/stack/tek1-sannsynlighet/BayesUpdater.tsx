import { useMemo, useState } from "react";

/**
 * BayesUpdater — interaktiv positiv-prediktiv-verdi-kalkulator.
 *
 * Tre slidere: prevalens P(D), sensitivitet P(+|D), spesifisitet P(−|¬D).
 * Vi viser P(D|+) live, samt et "1000 personer"-tabell som demonstrerer
 * intuisjonen: selv en 99% sensitiv/spesifikk test gir bare ~50% PPV
 * når prevalensen er 1%.
 *
 * "Multiple tests"-modus: hvis brukeren tar test 2 ganger og begge er positive,
 * hvordan endres P(D|++)? (Antar betinget uavhengighet gitt klassen.)
 */

function clamp(x: number, lo = 0, hi = 1) {
  return Math.min(hi, Math.max(lo, x));
}

export function BayesUpdater() {
  const [prevalence, setPrevalence] = useState(0.01);
  const [sensitivity, setSensitivity] = useState(0.99);
  const [specificity, setSpecificity] = useState(0.95);
  const [showTable, setShowTable] = useState(true);
  const [twoTests, setTwoTests] = useState(false);

  const calc = useMemo(() => {
    const pD = clamp(prevalence);
    const pNotD = 1 - pD;
    const sens = clamp(sensitivity);
    const spec = clamp(specificity);
    const fpr = 1 - spec;

    // Single positive test
    const pPosGivenD = sens;
    const pPosGivenNotD = fpr;
    const pPos = pPosGivenD * pD + pPosGivenNotD * pNotD;
    const pDGivenPos = pPos > 0 ? (pPosGivenD * pD) / pPos : 0;

    // Two positive tests (conditional independence given class)
    const pPPGivenD = sens * sens;
    const pPPGivenNotD = fpr * fpr;
    const pPP = pPPGivenD * pD + pPPGivenNotD * pNotD;
    const pDGivenPP = pPP > 0 ? (pPPGivenD * pD) / pPP : 0;

    // 1000-person breakdown (rounded)
    const N = 1000;
    const sick = pD * N;
    const healthy = pNotD * N;
    const sickPos = sick * sens;
    const sickNeg = sick - sickPos;
    const healthyPos = healthy * fpr;
    const healthyNeg = healthy - healthyPos;

    return {
      pD,
      pNotD,
      sens,
      spec,
      fpr,
      pPos,
      pDGivenPos,
      pPP,
      pDGivenPP,
      sick,
      healthy,
      sickPos,
      sickNeg,
      healthyPos,
      healthyNeg,
    };
  }, [prevalence, sensitivity, specificity]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-mono">P(D) = prevalens</span>
            <span className="font-mono font-semibold tabular-nums">{(calc.pD * 100).toFixed(2)}%</span>
          </div>
          <input
            type="range"
            min={0.001}
            max={0.5}
            step={0.001}
            value={prevalence}
            onChange={(e) => setPrevalence(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-mono">P(+|D) = sensitivitet</span>
            <span className="font-mono font-semibold tabular-nums">{(calc.sens * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={1}
            step={0.001}
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-mono">P(−|¬D) = spesifisitet</span>
            <span className="font-mono font-semibold tabular-nums">{(calc.spec * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={1}
            step={0.001}
            value={specificity}
            onChange={(e) => setSpecificity(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showTable} onChange={(e) => setShowTable(e.target.checked)} />
          Vis 1000-personer-nedbrytning
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={twoTests} onChange={(e) => setTwoTests(e.target.checked)} />
          To uavhengige positive tester
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="text-xs font-semibold mb-2">Posterior — ett positivt utslag</div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-sm">P(D | +)</span>
            <span className="text-2xl font-bold font-mono tabular-nums">
              {(calc.pDGivenPos * 100).toFixed(2)}%
            </span>
          </div>
          <div className="h-3 mt-2 rounded-full bg-muted overflow-hidden border border-border">
            <div className="h-full bg-rose-500 transition-all" style={{ width: `${calc.pDGivenPos * 100}%` }} />
          </div>
          <div className="text-[11px] text-muted-foreground mt-3 font-mono leading-relaxed">
            P(+) = {calc.sens.toFixed(3)}·{calc.pD.toFixed(3)} + {calc.fpr.toFixed(3)}·{calc.pNotD.toFixed(3)}
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = {(calc.sens * calc.pD).toFixed(5)} + {(calc.fpr * calc.pNotD).toFixed(5)}
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = {calc.pPos.toFixed(5)}
            <br />
            P(D|+) = {(calc.sens * calc.pD).toFixed(5)} / {calc.pPos.toFixed(5)} = {calc.pDGivenPos.toFixed(4)}
          </div>
        </div>

        <div className={`rounded-lg border p-4 transition-opacity ${twoTests ? "border-border bg-background" : "border-dashed border-border bg-muted/20 opacity-60"}`}>
          <div className="text-xs font-semibold mb-2">Posterior — to positive (uavhengige)</div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-sm">P(D | ++)</span>
            <span className="text-2xl font-bold font-mono tabular-nums">
              {twoTests ? `${(calc.pDGivenPP * 100).toFixed(2)}%` : "—"}
            </span>
          </div>
          <div className="h-3 mt-2 rounded-full bg-muted overflow-hidden border border-border">
            <div className="h-full bg-rose-500 transition-all" style={{ width: `${(twoTests ? calc.pDGivenPP : 0) * 100}%` }} />
          </div>
          <div className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
            Antar betinget uavhengighet gitt klasse (samme test 2 ganger gir
            korrelert feil, så dette er ofte optimistisk). To uavhengige tester
            er en raskere måte å nå høy konfidens enn å forbedre én enkelt test.
          </div>
        </div>
      </div>

      {showTable && (
        <div>
          <div className="text-xs font-semibold mb-2">1000 personer trekkes tilfeldig fra populasjonen</div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-3 py-1.5"></th>
                  <th className="text-right px-3 py-1.5 font-semibold">Test +</th>
                  <th className="text-right px-3 py-1.5 font-semibold">Test −</th>
                  <th className="text-right px-3 py-1.5 font-semibold">Sum</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-1.5 font-semibold">Syk (D)</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                    {calc.sickPos.toFixed(1)} TP
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-amber-600 dark:text-amber-400">
                    {calc.sickNeg.toFixed(1)} FN
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{calc.sick.toFixed(1)}</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-1.5 font-semibold">Frisk (¬D)</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-amber-600 dark:text-amber-400">
                    {calc.healthyPos.toFixed(1)} FP
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                    {calc.healthyNeg.toFixed(1)} TN
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{calc.healthy.toFixed(1)}</td>
                </tr>
                <tr className="border-t border-border bg-muted/30 font-semibold">
                  <td className="px-3 py-1.5">Sum</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{(calc.sickPos + calc.healthyPos).toFixed(1)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{(calc.sickNeg + calc.healthyNeg).toFixed(1)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">1000</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Av {(calc.sickPos + calc.healthyPos).toFixed(0)} positive tester er bare {calc.sickPos.toFixed(0)} faktisk syke
            ⇒ P(D|+) = {calc.sickPos.toFixed(1)} / {(calc.sickPos + calc.healthyPos).toFixed(1)} ≈ {(calc.pDGivenPos * 100).toFixed(1)} %.
          </p>
        </div>
      )}

      <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-[11px] leading-relaxed">
        <strong>Prøv:</strong> sett prevalens til 1% og sensitivitet/spesifisitet til 99% hver. Posterior
        blir kun ~50%. Skru prevalensen opp til 10% — nå klatrer posterior til ~92%. Bayes' moral:
        prior dominerer når sykdommen er sjelden, uansett hvor god testen er.
      </div>
    </div>
  );
}
