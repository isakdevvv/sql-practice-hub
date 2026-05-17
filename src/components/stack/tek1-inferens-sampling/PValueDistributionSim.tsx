import { useMemo, useState } from "react";
import { histogram, mulberry32, randn, tCdf } from "./statUtils";

/**
 * Sim av p-verdi-fordeling under H₀ vs H₁.
 *
 * For en gitt effekt (δ) og n trekker vi 1500 eksperimenter:
 *  - to grupper med µ_B = 0, µ_A = δ, σ = 1
 *  - regn t-statistikk (tosidig) og p-verdi
 *  - tegn histogrammet av p-verdier
 *
 * δ = 0 ⇒ p ~ uniform(0,1)  (klassisk resultat)
 * δ > 0 ⇒ p-verdiene skjeves mot 0, og andelen under α (= power) vokser.
 */

export function PValueDistributionSim() {
  const [delta, setDelta] = useState(0.0);
  const [n, setN] = useState(30);
  const [alpha, setAlpha] = useState(0.05);
  const [seed, setSeed] = useState(20260301);

  const NUM_EXP = 1500;

  const pValues = useMemo(() => {
    const rng = mulberry32(seed);
    const out: number[] = [];
    for (let e = 0; e < NUM_EXP; e++) {
      // sample two groups
      let sumA = 0;
      let sumA2 = 0;
      let sumB = 0;
      let sumB2 = 0;
      for (let i = 0; i < n; i++) {
        const a = delta + randn(rng);
        const b = 0 + randn(rng);
        sumA += a;
        sumA2 += a * a;
        sumB += b;
        sumB2 += b * b;
      }
      const muA = sumA / n;
      const muB = sumB / n;
      const varA = (sumA2 - n * muA * muA) / (n - 1);
      const varB = (sumB2 - n * muB * muB) / (n - 1);
      const seDiff = Math.sqrt(varA / n + varB / n);
      const t = (muA - muB) / seDiff;
      const num = (varA / n + varB / n) ** 2;
      const den = (varA / n) ** 2 / (n - 1) + (varB / n) ** 2 / (n - 1);
      const df = num / den;
      const p = 2 * (1 - tCdf(Math.abs(t), df));
      out.push(p);
    }
    return out;
  }, [delta, n, seed]);

  const underAlpha = pValues.filter((p) => p < alpha).length;
  const power = underAlpha / NUM_EXP;

  // Histogram med faste bins [0, 1] / 20
  const bins = histogram(pValues, 20, [0, 1]);
  const maxC = Math.max(1, ...bins.map((b) => b.c));
  const expectedUniformC = NUM_EXP / 20;

  // SVG
  const W = 560;
  const H = 240;
  const padL = 40;
  const padR = 16;
  const padT = 14;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const xPx = (x: number) => padL + x * plotW;
  const yPx = (c: number) => padT + plotH - (c / maxC) * plotH;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Hva er en p-verdi egentlig? — 1 500 eksperimenter
      </div>
      <p className="text-xs text-muted-foreground">
        Vi kjører {NUM_EXP} to-gruppe-eksperimenter med samme oppsett og plotter
        histogrammet av p-verdier. Når effekten δ er 0 (H₀ er sann) blir
        p-verdiene uniformt fordelt på [0, 1] — det er definisjonen. Når δ &gt; 0
        skjeves de mot 0, og andelen under α (markert rødt) er den statistiske
        styrken (power = 1 − β).
      </p>

      <div className="grid sm:grid-cols-3 gap-3 text-[11px]">
        <label className="rounded-lg border border-border bg-background p-2.5 space-y-1">
          <div className="text-muted-foreground">effektstørrelse δ</div>
          <input
            type="range"
            min={0}
            max={1.5}
            step={0.05}
            value={delta}
            onChange={(e) => setDelta(+e.target.value)}
            className="w-full"
          />
          <div className="tabular-nums font-mono">
            δ = {delta.toFixed(2)}{" "}
            <span className="text-muted-foreground">
              ({delta === 0 ? "H₀ sann" : "H₁ sann"})
            </span>
          </div>
        </label>
        <label className="rounded-lg border border-border bg-background p-2.5 space-y-1">
          <div className="text-muted-foreground">n per gruppe</div>
          <input
            type="range"
            min={5}
            max={150}
            step={1}
            value={n}
            onChange={(e) => setN(+e.target.value)}
            className="w-full"
          />
          <div className="tabular-nums font-mono">n = {n}</div>
        </label>
        <label className="rounded-lg border border-border bg-background p-2.5 space-y-1">
          <div className="text-muted-foreground">α (signifikansnivå)</div>
          <input
            type="range"
            min={0.005}
            max={0.2}
            step={0.005}
            value={alpha}
            onChange={(e) => setAlpha(+e.target.value)}
            className="w-full"
          />
          <div className="tabular-nums font-mono">α = {alpha.toFixed(3)}</div>
        </label>
      </div>

      <div className="rounded-md border border-border bg-background p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* uniform reference line */}
          <line
            x1={padL}
            y1={yPx(expectedUniformC)}
            x2={W - padR}
            y2={yPx(expectedUniformC)}
            stroke="hsl(160 70% 40%)"
            strokeWidth={1.2}
            strokeDasharray="4 3"
          />
          <text
            x={W - padR}
            y={yPx(expectedUniformC) - 4}
            fontSize={9}
            textAnchor="end"
            className="fill-muted-foreground"
          >
            uniform (H₀) ≈ {expectedUniformC.toFixed(0)}
          </text>
          {/* bars */}
          {bins.map((bn, i) => {
            const x0 = xPx(bn.x0);
            const x1 = xPx(bn.x1);
            const yt = yPx(bn.c);
            const yb = padT + plotH;
            const fill = bn.x1 <= alpha ? "hsl(0 80% 55%)" : "hsl(220 75% 55%)";
            return (
              <rect
                key={i}
                x={x0}
                y={yt}
                width={Math.max(0.5, x1 - x0 - 0.5)}
                height={Math.max(0, yb - yt)}
                fill={fill}
                opacity={0.85}
              />
            );
          })}
          {/* alpha line */}
          <line
            x1={xPx(alpha)}
            y1={padT}
            x2={xPx(alpha)}
            y2={padT + plotH}
            stroke="hsl(0 80% 55%)"
            strokeWidth={1.4}
          />
          <text
            x={xPx(alpha) + 4}
            y={padT + 10}
            fontSize={10}
            className="fill-rose-500"
          >
            α = {alpha.toFixed(3)}
          </text>
          {/* axis */}
          <line
            x1={padL}
            y1={padT + plotH}
            x2={W - padR}
            y2={padT + plotH}
            stroke="hsl(0 0% 55%)"
            strokeWidth={0.7}
          />
          {Array.from({ length: 6 }).map((_, i) => {
            const p = i / 5;
            return (
              <g key={i}>
                <line
                  x1={xPx(p)}
                  y1={padT + plotH}
                  x2={xPx(p)}
                  y2={padT + plotH + 3}
                  stroke="hsl(0 0% 55%)"
                  strokeWidth={0.7}
                />
                <text
                  x={xPx(p)}
                  y={padT + plotH + 14}
                  fontSize={9}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                >
                  {p.toFixed(1)}
                </text>
              </g>
            );
          })}
          <text
            x={(padL + W - padR) / 2}
            y={H - 4}
            fontSize={10}
            textAnchor="middle"
            className="fill-muted-foreground"
          >
            p-verdi
          </text>
        </svg>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-muted-foreground">Andel under α</div>
          <div className="font-mono text-base mt-1 text-rose-500">
            {(power * 100).toFixed(1)} %
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {underAlpha} av {NUM_EXP} eksperimenter
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-muted-foreground">
            {delta === 0 ? "Type I-feil (α)" : "Power (1 − β)"}
          </div>
          <div className="font-mono text-base mt-1">
            {delta === 0
              ? `≈ α = ${alpha.toFixed(3)}`
              : `1 − β ≈ ${power.toFixed(3)}`}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {delta === 0
              ? "falsk alarm-rate"
              : `Type II-feil β ≈ ${(1 - power).toFixed(3)}`}
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-3 flex flex-col">
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="px-3 py-1.5 rounded text-xs font-medium bg-brand text-white hover:bg-brand/90"
          >
            Trekk nye eksperimenter
          </button>
          <p className="text-[11px] text-muted-foreground mt-2">
            Bytt seed for ny realisering. Forventet verdi er stabil; bare støy
            varierer.
          </p>
        </div>
      </div>

      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] text-muted-foreground space-y-1">
        <p>
          <strong>To regimer:</strong> sett <em>δ = 0</em> — histogrammet er
          flatt og ca. 5 % av barene er røde (Type I-feil). Sett <em>δ = 0.5</em>{" "}
          — barene hoper seg ved 0 og den røde andelen vokser (power).
        </p>
        <p>
          <strong>Sjekk:</strong> selv ved δ = 0 vil noen eksperimenter rapportere
          p &lt; 0.05. Det er ikke en bug — det er definisjonen på α.
        </p>
      </div>
    </div>
  );
}
