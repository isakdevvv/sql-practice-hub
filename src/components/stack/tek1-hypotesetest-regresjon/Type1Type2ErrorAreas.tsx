import { useMemo, useState } from "react";
import { Tex, TexBlock } from "@/components/Tex";

// Normal PDF
function normPdf(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

// Abramowitz & Stegun erf approximation
function normCdf(x: number, mu = 0, sigma = 1): number {
  const z = (x - mu) / sigma;
  const sign = z < 0 ? -1 : 1;
  const az = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * az);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-az * az);
  const erf = sign * y;
  return 0.5 * (1 + erf);
}

/**
 * Interactive visualization of Type I (α) and Type II (β) errors.
 *
 * Two overlapping normal curves (H₀ and H₁), draggable critical boundary c,
 * shaded α (right of c under H₀) and β (left of c under H₁) areas.
 * Slider for effect size d = (μ₁-μ₀)/σ and sample size n — larger n shrinks
 * the sampling distribution of x̄ (σ/√n), demonstrating how power improves.
 */
export function Type1Type2ErrorAreas() {
  const [effect, setEffect] = useState(0.8); // Cohen's d (population)
  const [n, setN] = useState(30);
  const [crit, setCrit] = useState(1.65);

  // Population: σ_pop = 1, so sampling distribution of x̄ has σ_x̄ = 1/√n.
  // We plot the sampling distributions of x̄ (in raw units, not z-scores)
  // so the effect of n on curve width is visible directly.
  const sigmaPop = 1;
  const seMean = sigmaPop / Math.sqrt(n);
  const mu0 = 0;
  const mu1 = effect * sigmaPop;

  const alpha = 1 - normCdf(crit, mu0, seMean);
  const beta = normCdf(crit, mu1, seMean);
  const power = 1 - beta;

  // Plot bounds — fixed in raw units, big enough for small n.
  const xMin = -1.2;
  const xMax = 2.4;

  const data = useMemo(() => {
    const N = 240;
    const step = (xMax - xMin) / N;
    const out: { x: number; h0: number; h1: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const x = xMin + i * step;
      out.push({
        x,
        h0: normPdf(x, mu0, seMean),
        h1: normPdf(x, mu1, seMean),
      });
    }
    return out;
  }, [seMean, mu1]);

  // Auto-scale Y so tall curves at high n still fit.
  const yMax = Math.max(...data.map((p) => Math.max(p.h0, p.h1))) * 1.08;

  const W = 560;
  const H = 220;
  const padL = 24;
  const padR = 12;
  const padT = 16;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const xPx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * plotW;
  const yPx = (y: number) => padT + plotH - (y / yMax) * plotH;

  // Build polygons
  const buildPath = (key: "h0" | "h1") =>
    "M" +
    data
      .map((p, i) => `${i === 0 ? "M" : "L"}${xPx(p.x).toFixed(1)},${yPx(p[key]).toFixed(1)}`)
      .join(" ") +
    ` L${xPx(xMax).toFixed(1)},${yPx(0).toFixed(1)} L${xPx(xMin).toFixed(1)},${yPx(0).toFixed(1)} Z`;

  const alphaPath =
    "M" +
    data
      .filter((p) => p.x >= crit)
      .map((p, i) => `${i === 0 ? "M" : "L"}${xPx(p.x).toFixed(1)},${yPx(p.h0).toFixed(1)}`)
      .join(" ") +
    ` L${xPx(xMax).toFixed(1)},${yPx(0).toFixed(1)} L${xPx(crit).toFixed(1)},${yPx(0).toFixed(1)} Z`;

  const betaPath =
    "M" +
    data
      .filter((p) => p.x <= crit)
      .map((p, i) => `${i === 0 ? "M" : "L"}${xPx(p.x).toFixed(1)},${yPx(p.h1).toFixed(1)}`)
      .join(" ") +
    ` L${xPx(crit).toFixed(1)},${yPx(0).toFixed(1)} L${xPx(xMin).toFixed(1)},${yPx(0).toFixed(1)} Z`;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Type I-feil (α) og Type II-feil (β) — draløse arealer
      </div>
      <p className="text-xs text-muted-foreground">
        To overlappende fordelinger for <Tex>{"\\bar{X}"}</Tex>: under <Tex>{"H_0"}</Tex> (blå) og{" "}
        <Tex>{"H_1"}</Tex> (rød). Skyv den kritiske grensa c og se hvordan α og β bytter — du kan
        ikke krympe begge samtidig uten å øke n.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <label>
          <span className="block text-xs text-muted-foreground mb-1">
            Effektstørrelse d = (μ₁ − μ₀)/σ = {effect.toFixed(2)}
          </span>
          <input
            type="range"
            min={0.1}
            max={2.5}
            step={0.05}
            value={effect}
            onChange={(e) => setEffect(Number(e.target.value))}
            className="w-full accent-brand"
          />
        </label>
        <label>
          <span className="block text-xs text-muted-foreground mb-1">Utvalgsstørrelse n = {n}</span>
          <input
            type="range"
            min={2}
            max={120}
            step={1}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="w-full accent-brand"
          />
        </label>
        <label>
          <span className="block text-xs text-muted-foreground mb-1">
            Kritisk grense c = {crit.toFixed(3)}
          </span>
          <input
            type="range"
            min={xMin + 0.1}
            max={xMax - 0.1}
            step={0.01}
            value={crit}
            onChange={(e) => setCrit(Number(e.target.value))}
            className="w-full accent-brand"
          />
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* gridlines */}
        {[-1, 0, 1, 2].map((g) => (
          <line
            key={`gx${g}`}
            x1={xPx(g)}
            y1={padT}
            x2={xPx(g)}
            y2={padT + plotH}
            stroke="currentColor"
            className="text-border"
            strokeWidth={0.5}
          />
        ))}

        {/* H1 (red) area */}
        <path
          d={buildPath("h1")}
          fill="hsl(0 75% 60% / 0.18)"
          stroke="hsl(0 70% 55%)"
          strokeWidth={1.4}
        />
        {/* H0 (blue) area */}
        <path
          d={buildPath("h0")}
          fill="hsl(220 75% 60% / 0.18)"
          stroke="hsl(220 70% 55%)"
          strokeWidth={1.4}
        />

        {/* alpha shaded (pink) */}
        <path d={alphaPath} fill="hsl(330 80% 60% / 0.55)" />
        {/* beta shaded (yellow) */}
        <path d={betaPath} fill="hsl(48 95% 55% / 0.55)" />

        {/* mean markers */}
        <line
          x1={xPx(mu0)}
          y1={padT}
          x2={xPx(mu0)}
          y2={padT + plotH}
          stroke="hsl(220 70% 45%)"
          strokeWidth={1}
          strokeDasharray="2 3"
          opacity={0.6}
        />
        <line
          x1={xPx(mu1)}
          y1={padT}
          x2={xPx(mu1)}
          y2={padT + plotH}
          stroke="hsl(0 70% 50%)"
          strokeWidth={1}
          strokeDasharray="2 3"
          opacity={0.6}
        />

        {/* critical line */}
        <line
          x1={xPx(crit)}
          y1={padT}
          x2={xPx(crit)}
          y2={padT + plotH}
          stroke="currentColor"
          className="text-foreground"
          strokeWidth={1.8}
          strokeDasharray="5 3"
        />
        <text x={xPx(crit) + 5} y={padT + 10} fontSize={10} className="fill-foreground">
          c = {crit.toFixed(2)}
        </text>

        {/* x-axis ticks */}
        {[-1, 0, 1, 2].map((g) => (
          <text
            key={`tx${g}`}
            x={xPx(g)}
            y={H - 8}
            textAnchor="middle"
            fontSize={10}
            className="fill-muted-foreground"
          >
            {g}
          </text>
        ))}

        {/* axis baseline */}
        <line
          x1={padL}
          y1={padT + plotH}
          x2={padL + plotW}
          y2={padT + plotH}
          stroke="currentColor"
          className="text-border"
          strokeWidth={0.8}
        />
      </svg>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm bg-[hsl(220_75%_60%_/_0.35)] border border-[hsl(220_70%_55%)]" />
            <span>
              H₀: μ = 0 — fordeling av <Tex>{"\\bar{X}"}</Tex> hvis null er sann
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm bg-[hsl(0_75%_60%_/_0.35)] border border-[hsl(0_70%_55%)]" />
            <span>H₁: μ = {mu1.toFixed(2)} — sann effekt</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm bg-[hsl(330_80%_60%_/_0.7)]" />
            <span>α = Type I-feil (rosa areal)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm bg-[hsl(48_95%_55%_/_0.7)]" />
            <span>β = Type II-feil (gul areal)</span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-3 font-mono text-[11px] space-y-0.5">
          <div>
            standardfeil <Tex>{"\\sigma_{\\bar{X}} = \\sigma/\\sqrt{n}"}</Tex> = {seMean.toFixed(3)}
          </div>
          <div className="text-[hsl(330_80%_50%)]">
            α = {alpha.toFixed(4)} ({(alpha * 100).toFixed(2)} %)
          </div>
          <div className="text-[hsl(48_85%_40%)]">
            β = {beta.toFixed(4)} ({(beta * 100).toFixed(2)} %)
          </div>
          <div className="text-brand">
            Styrke = 1 − β = {power.toFixed(4)} ({(power * 100).toFixed(1)} %)
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-1.5">
        <div className="font-semibold">Hva ser du?</div>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>
            <strong>Skyv c til høyre</strong> → α krymper (færre falske forkast), men β vokser
            (mister flere reelle effekter).
          </li>
          <li>
            <strong>Øk n</strong> → begge kurvene krymper rundt sine sentre, så samme c gir både
            mindre α <em>og</em> mindre β. Mer data slår trade-off-en.
          </li>
          <li>
            <strong>Øk effektstørrelse d</strong> → H₁ flytter seg lenger unna H₀, overlapp minker,
            β faller, styrke stiger.
          </li>
        </ul>
        <TexBlock>
          {
            "\\alpha = P(\\bar{X} > c \\mid H_0),\\quad \\beta = P(\\bar{X} \\leq c \\mid H_1),\\quad \\text{Power} = 1 - \\beta"
          }
        </TexBlock>
      </div>
    </div>
  );
}
