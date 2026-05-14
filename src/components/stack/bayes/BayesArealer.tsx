import { useState } from "react";
import { Tex, TexBlock } from "@/components/Tex";

/**
 * Bayes-arealer — den visuelle Bayes-presentasjonen.
 *
 * Et stort rektangel = 10 000 mennesker.
 * Slidere:
 *   - prevalens  P(syk)       — rød andel (syk)
 *   - sensitivitet P(pos|syk) — andel av rød som krysser med "positiv test"
 *   - spesifisitet P(neg|frisk) — andel av grønn som krysser med "negativ test"
 *
 * Resultatet vises som fire rektangler:
 *   TP — syk + positiv
 *   FN — syk + negativ
 *   FP — frisk + positiv
 *   TN — frisk + negativ
 *
 * Live beregning av P(syk|pos) = TP / (TP + FP).
 * Knapp: "Realistisk eksempel" (1% prev, 95% sens, 90% spec).
 */

const POP = 10_000;
const W = 460;
const H = 280;
const PAD = 38;
const PLOT_W = W - 2 * PAD;
const PLOT_H = H - 2 * PAD;

export function BayesArealer() {
  const [prevalence, setPrevalence] = useState(0.1); // P(syk)
  const [sensitivity, setSensitivity] = useState(0.9); // P(pos|syk)
  const [specificity, setSpecificity] = useState(0.9); // P(neg|frisk)
  const [hover, setHover] = useState<null | "TP" | "FN" | "FP" | "TN">(null);

  // Vertical split: left = syk (red), right = frisk (green)
  // Horizontal split: top = positiv, bottom = negativ
  // sykX = prevalence * PLOT_W   (left column width)
  // Within syk-column: top = sensitivity * PLOT_H (TP), bottom = (1-sens) * PLOT_H (FN)
  // Within frisk-column: top = (1-spec) * PLOT_H (FP), bottom = spec * PLOT_H (TN)
  const sykW = prevalence * PLOT_W;
  const friskW = (1 - prevalence) * PLOT_W;
  const tpH = sensitivity * PLOT_H;
  const fnH = (1 - sensitivity) * PLOT_H;
  const fpH = (1 - specificity) * PLOT_H;
  const tnH = specificity * PLOT_H;

  // counts
  const sykN = Math.round(prevalence * POP);
  const friskN = POP - sykN;
  const TP = Math.round(sensitivity * sykN);
  const FN = sykN - TP;
  const FP = Math.round((1 - specificity) * friskN);
  const TN = friskN - FP;

  const posTotal = TP + FP;
  const negTotal = FN + TN;
  const ppv = posTotal === 0 ? 0 : TP / posTotal; // P(syk|pos)
  const npv = negTotal === 0 ? 0 : TN / negTotal; // P(frisk|neg)

  function applyPreset() {
    setPrevalence(0.01);
    setSensitivity(0.95);
    setSpecificity(0.9);
  }

  const cells = [
    { key: "TP", label: "TP", x: PAD, y: PAD, w: sykW, h: tpH, fill: "fill-rose-500", count: TP, desc: "Syk OG positiv test (riktig positiv)" },
    { key: "FN", label: "FN", x: PAD, y: PAD + tpH, w: sykW, h: fnH, fill: "fill-rose-500/30", count: FN, desc: "Syk MEN negativ test (savnet)" },
    { key: "FP", label: "FP", x: PAD + sykW, y: PAD, w: friskW, h: fpH, fill: "fill-emerald-500/40", count: FP, desc: "Frisk MEN positiv test (falsk alarm)" },
    { key: "TN", label: "TN", x: PAD + sykW, y: PAD + fpH, w: friskW, h: tnH, fill: "fill-emerald-500", count: TN, desc: "Frisk OG negativ test (riktig negativ)" },
  ] as const;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <label className="block text-xs text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>Prevalens P(syk)</span>
            <span className="font-mono text-foreground">{(prevalence * 100).toFixed(1)}%</span>
          </div>
          <input type="range" min={0.001} max={0.5} step={0.001} value={prevalence} onChange={(e) => setPrevalence(parseFloat(e.target.value))} className="w-full" />
        </label>
        <label className="block text-xs text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>Sensitivitet P(+|syk)</span>
            <span className="font-mono text-foreground">{(sensitivity * 100).toFixed(0)}%</span>
          </div>
          <input type="range" min={0.5} max={0.999} step={0.005} value={sensitivity} onChange={(e) => setSensitivity(parseFloat(e.target.value))} className="w-full" />
        </label>
        <label className="block text-xs text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>Spesifisitet P(−|frisk)</span>
            <span className="font-mono text-foreground">{(specificity * 100).toFixed(0)}%</span>
          </div>
          <input type="range" min={0.5} max={0.999} step={0.005} value={specificity} onChange={(e) => setSpecificity(parseFloat(e.target.value))} className="w-full" />
        </label>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="text-xs text-muted-foreground">
          Hele rektangelet = {POP.toLocaleString("nb-NO")} mennesker. Venstre kolonne = syk, høyre = frisk.
        </div>
        <button
          type="button"
          onClick={applyPreset}
          className="text-xs rounded-md border border-brand bg-brand/10 px-3 py-1.5 hover:bg-brand/20"
        >
          Realistisk eksempel (1%, 95%, 90%)
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="block w-full" style={{ maxWidth: "100%" }}>
            {/* Outer frame */}
            <rect x={PAD} y={PAD} width={PLOT_W} height={PLOT_H} fill="none" stroke="currentColor" className="text-muted-foreground" strokeWidth={1} />
            {/* Cells */}
            {cells.map((c) => {
              const isHover = hover === c.key;
              return (
                <g
                  key={c.key}
                  onMouseEnter={() => setHover(c.key)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x={c.x}
                    y={c.y}
                    width={Math.max(0, c.w)}
                    height={Math.max(0, c.h)}
                    className={`${c.fill} transition-opacity`}
                    opacity={isHover ? 0.9 : 0.78}
                    stroke="currentColor"
                    strokeWidth={isHover ? 2 : 0.6}
                  />
                  {c.w * c.h > 600 && (
                    <text
                      x={c.x + c.w / 2}
                      y={c.y + c.h / 2 - 4}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight="bold"
                      fill="#fff"
                    >
                      {c.label}
                    </text>
                  )}
                  {c.w * c.h > 600 && (
                    <text
                      x={c.x + c.w / 2}
                      y={c.y + c.h / 2 + 10}
                      textAnchor="middle"
                      fontSize={10}
                      fill="#fff"
                    >
                      {c.count.toLocaleString("nb-NO")}
                    </text>
                  )}
                </g>
              );
            })}
            {/* Axis labels */}
            <text x={PAD + sykW / 2} y={PAD - 8} textAnchor="middle" fontSize={10} fill="currentColor" className="text-rose-500 font-semibold">
              Syk ({sykN.toLocaleString("nb-NO")})
            </text>
            <text x={PAD + sykW + friskW / 2} y={PAD - 8} textAnchor="middle" fontSize={10} fill="currentColor" className="text-emerald-500 font-semibold">
              Frisk ({friskN.toLocaleString("nb-NO")})
            </text>
            <g transform={`translate(${PAD - 8}, ${PAD + PLOT_H / 4}) rotate(-90)`}>
              <text textAnchor="middle" fontSize={10} fill="currentColor" className="text-sky-500">
                Positiv test
              </text>
            </g>
            <g transform={`translate(${PAD - 8}, ${PAD + 3 * PLOT_H / 4}) rotate(-90)`}>
              <text textAnchor="middle" fontSize={10} fill="currentColor" className="text-amber-500">
                Negativ test
              </text>
            </g>
          </svg>
          {hover && (
            <div className="mt-2 rounded-md border border-border bg-background p-2.5 text-xs">
              <span className="font-mono font-semibold mr-2">{hover}:</span>
              <span className="text-foreground">{cells.find((c) => c.key === hover)?.desc}</span>
              <span className="ml-2 text-muted-foreground">
                ({cells.find((c) => c.key === hover)?.count.toLocaleString("nb-NO")} av {POP.toLocaleString("nb-NO")})
              </span>
            </div>
          )}
        </div>

        <div className="text-sm space-y-3">
          <div className="rounded-md border-2 border-brand/40 bg-brand/5 p-3">
            <div className="text-[11px] uppercase tracking-wide text-brand font-semibold mb-1">Bayes — sannsynlighet for sykdom GITT positiv test</div>
            <TexBlock>{`P(\\text{syk}\\mid +) = \\frac{TP}{TP + FP} = \\frac{${TP}}{${TP} + ${FP}}`}</TexBlock>
            <div className="text-2xl font-bold text-foreground text-center">
              {(ppv * 100).toFixed(1)}%
            </div>
          </div>

          <div className="rounded-md border border-border bg-background p-3 text-xs space-y-1">
            <div className="font-semibold text-foreground mb-1">Tallene</div>
            <div className="flex justify-between"><span className="text-muted-foreground">P(syk)</span><span className="font-mono">{(prevalence * 100).toFixed(2)}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">P(+|syk) sens</span><span className="font-mono">{(sensitivity * 100).toFixed(1)}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">P(−|frisk) spec</span><span className="font-mono">{(specificity * 100).toFixed(1)}%</span></div>
            <div className="border-t border-border pt-1 mt-1" />
            <div className="flex justify-between"><span className="text-muted-foreground">TP</span><span className="font-mono">{TP.toLocaleString("nb-NO")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">FN</span><span className="font-mono">{FN.toLocaleString("nb-NO")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">FP</span><span className="font-mono">{FP.toLocaleString("nb-NO")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">TN</span><span className="font-mono">{TN.toLocaleString("nb-NO")}</span></div>
            <div className="border-t border-border pt-1 mt-1" />
            <div className="flex justify-between"><span className="text-muted-foreground">P(syk|+) PPV</span><span className="font-mono text-rose-500">{(ppv * 100).toFixed(1)}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">P(frisk|−) NPV</span><span className="font-mono text-emerald-500">{(npv * 100).toFixed(2)}%</span></div>
          </div>

          <div className="text-xs text-muted-foreground">
            <Tex>{"P(A\\mid B) = \\frac{P(B\\mid A)\\,P(A)}{P(B)}"}</Tex>
            {"  "}— jo lavere prior P(syk), jo mer dominerer false positives PPV-en.
            Det er hvorfor en 95%-test for en sjelden sykdom kan gi under 10% PPV.
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
        <strong>Prøv:</strong> sett prevalens til 1% og sens=95%, spec=90%. PPV blir bare ~8.8% —
        selv om testen virker bra! Sett prevalens høyt (f.eks. 30%) og PPV stiger til over 80%.
        Det er base-rate-fellen visualisert.
      </div>
    </div>
  );
}
