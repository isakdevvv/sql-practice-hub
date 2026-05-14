import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { Tex, TexBlock } from "@/components/Tex";
import { Type1Type2ErrorAreas } from "./Type1Type2ErrorAreas";

// ---- helpers ----
function normPdf(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}
function normCdf(x: number, mu = 0, sigma = 1): number {
  // erf approx Abramowitz & Stegun
  const z = (x - mu) / sigma;
  const sign = z < 0 ? -1 : 1;
  const az = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * az);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t -
      0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-az * az);
  const erf = sign * y;
  return 0.5 * (1 + erf);
}

function HypotheseTestVisual() {
  const [muH1, setMuH1] = useState(2);
  const [crit, setCrit] = useState(1.96);
  const sigma = 1;

  const data = useMemo(() => {
    const lo = -5;
    const hi = 7;
    const n = 200;
    const step = (hi - lo) / n;
    const out: { x: number; h0: number; h1: number }[] = [];
    for (let i = 0; i <= n; i++) {
      const x = lo + i * step;
      out.push({ x, h0: normPdf(x, 0, sigma), h1: normPdf(x, muH1, sigma) });
    }
    return out;
  }, [muH1]);

  const alpha = 1 - normCdf(crit, 0, sigma);
  const beta = normCdf(crit, muH1, sigma);
  const power = 1 - beta;

  // SVG dimensions
  const W = 500;
  const H = 160;
  const xMin = -5;
  const xMax = 7;
  const yMax = 0.45;
  const xPx = (x: number) => ((x - xMin) / (xMax - xMin)) * W;
  const yPx = (y: number) => H - (y / yMax) * H;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        H₀ vs H₁ med kritisk grense
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label>
          <span className="block text-xs text-muted-foreground mb-1">
            μ₁ = {muH1.toFixed(2)} (H₁'s mean)
          </span>
          <input
            type="range"
            min={0.5}
            max={5}
            step={0.1}
            value={muH1}
            onChange={(e) => setMuH1(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label>
          <span className="block text-xs text-muted-foreground mb-1">
            kritisk grense c = {crit.toFixed(2)}
          </span>
          <input
            type="range"
            min={0}
            max={5}
            step={0.05}
            value={crit}
            onChange={(e) => setCrit(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full" preserveAspectRatio="none">
        {/* H1 density (red) */}
        <path
          d={
            "M" +
            data
              .map((p, i) => `${i === 0 ? "M" : "L"}${xPx(p.x)},${yPx(p.h1)}`)
              .join("") +
            ` L${xPx(xMax)},${H} L${xPx(xMin)},${H} Z`
          }
          fill="hsl(0 70% 60% / 0.18)"
          stroke="hsl(0 70% 50%)"
          strokeWidth={1.2}
        />
        {/* H0 density (blue) */}
        <path
          d={
            "M" +
            data
              .map((p, i) => `${i === 0 ? "M" : "L"}${xPx(p.x)},${yPx(p.h0)}`)
              .join("") +
            ` L${xPx(xMax)},${H} L${xPx(xMin)},${H} Z`
          }
          fill="hsl(220 70% 60% / 0.18)"
          stroke="hsl(220 70% 50%)"
          strokeWidth={1.2}
        />
        {/* alpha: H0 right of crit (orange) */}
        <path
          d={
            "M" +
            data
              .filter((p) => p.x >= crit)
              .map((p, i) => `${i === 0 ? "M" : "L"}${xPx(p.x)},${yPx(p.h0)}`)
              .join("") +
            ` L${xPx(xMax)},${H} L${xPx(crit)},${H} Z`
          }
          fill="hsl(30 90% 55% / 0.6)"
        />
        {/* beta: H1 left of crit (purple) */}
        <path
          d={
            "M" +
            data
              .filter((p) => p.x <= crit)
              .map((p, i) => `${i === 0 ? "M" : "L"}${xPx(p.x)},${yPx(p.h1)}`)
              .join("") +
            ` L${xPx(crit)},${H} L${xPx(xMin)},${H} Z`
          }
          fill="hsl(280 70% 55% / 0.5)"
        />
        {/* critical line */}
        <line x1={xPx(crit)} y1={0} x2={xPx(crit)} y2={H} stroke="hsl(0 0% 30%)" strokeWidth={1.5} strokeDasharray="4 4" />
        <text x={xPx(crit) + 4} y={12} fontSize={10} fill="hsl(0 0% 30%)">c = {crit.toFixed(2)}</text>
        {/* axes */}
        <line x1={0} y1={H} x2={W} y2={H} stroke="hsl(0 0% 70%)" strokeWidth={0.5} />
      </svg>

      <div className="text-xs font-mono space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-3 bg-[hsl(220_70%_60%_/_0.4)] border border-[hsl(220_70%_50%)]" />
          <span>H₀: μ = 0 (nullhypotesen)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-3 bg-[hsl(0_70%_60%_/_0.4)] border border-[hsl(0_70%_50%)]" />
          <span>H₁: μ = {muH1.toFixed(2)} (alternativ)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-3 bg-[hsl(30_90%_55%)]" />
          <span>α = P(forkast H₀ | H₀ sann) = {alpha.toFixed(4)} ← Type I-feil</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-3 bg-[hsl(280_70%_55%)]" />
          <span>β = P(behold H₀ | H₁ sann) = {beta.toFixed(4)} ← Type II-feil</span>
        </div>
        <div>Styrke = 1 − β = {power.toFixed(4)}</div>
      </div>
    </div>
  );
}

function ScatterRegression() {
  const [points, setPoints] = useState<{ x: number; y: number }[]>(() => [
    { x: 1, y: 2.5 },
    { x: 2, y: 3.8 },
    { x: 3, y: 5.5 },
    { x: 4, y: 6.2 },
    { x: 5, y: 8.0 },
    { x: 6, y: 9.4 },
    { x: 7, y: 10.5 },
  ]);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // Bounds
  const xMin = 0;
  const xMax = 10;
  const yMin = 0;
  const yMax = 15;
  const W = 480;
  const H = 280;
  const padL = 30;
  const padB = 24;
  const padT = 6;
  const padR = 6;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const toPx = (x: number, y: number) => ({
    px: padL + ((x - xMin) / (xMax - xMin)) * plotW,
    py: padT + (1 - (y - yMin) / (yMax - yMin)) * plotH,
  });
  const fromPx = (px: number, py: number) => ({
    x: xMin + ((px - padL) / plotW) * (xMax - xMin),
    y: yMin + (1 - (py - padT) / plotH) * (yMax - yMin),
  });

  // Regression: y = a + b·x
  const reg = useMemo(() => {
    const n = points.length;
    if (n < 2) return { a: 0, b: 0, r: 0, r2: 0 };
    const meanX = points.reduce((s, p) => s + p.x, 0) / n;
    const meanY = points.reduce((s, p) => s + p.y, 0) / n;
    let sxx = 0,
      syy = 0,
      sxy = 0;
    for (const p of points) {
      const dx = p.x - meanX;
      const dy = p.y - meanY;
      sxx += dx * dx;
      syy += dy * dy;
      sxy += dx * dy;
    }
    const b = sxy / (sxx || 1);
    const a = meanY - b * meanX;
    const r = sxy / (Math.sqrt(sxx * syy) || 1);
    const r2 = r * r;
    return { a, b, r, r2 };
  }, [points]);

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    if (dragIdx == null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const ratioX = W / rect.width;
    const ratioY = H / rect.height;
    const { x, y } = fromPx(sx * ratioX, sy * ratioY);
    setPoints((p) => {
      const next = [...p];
      next[dragIdx] = {
        x: Math.max(xMin, Math.min(xMax, x)),
        y: Math.max(yMin, Math.min(yMax, y)),
      };
      return next;
    });
  }

  function onAdd(e: React.MouseEvent<SVGSVGElement>) {
    if (dragIdx != null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const ratioX = W / rect.width;
    const ratioY = H / rect.height;
    const { x, y } = fromPx(sx * ratioX, sy * ratioY);
    if (
      x >= xMin &&
      x <= xMax &&
      y >= yMin &&
      y <= yMax
    ) {
      setPoints((p) => [...p, { x, y }]);
    }
  }

  useEffect(() => {
    function up() {
      setDragIdx(null);
    }
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  const lineP1 = toPx(xMin, reg.a + reg.b * xMin);
  const lineP2 = toPx(xMax, reg.a + reg.b * xMax);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Drag-bar scatter med live regresjonslinje
      </div>
      <div className="text-xs text-muted-foreground">
        Dra punktene for å se hvordan regresjonslinjen og R² endrer seg. Klikk
        i tom plass for å legge til et nytt punkt.
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full border border-border rounded bg-background cursor-crosshair"
        onMouseMove={onMove}
        onClick={onAdd}
      >
        {/* axes */}
        {[0, 2, 4, 6, 8, 10].map((g) => (
          <g key={`gx${g}`}>
            <line
              x1={toPx(g, yMin).px}
              y1={padT}
              x2={toPx(g, yMin).px}
              y2={padT + plotH}
              stroke="hsl(0 0% 90%)"
              strokeWidth={0.5}
            />
            <text
              x={toPx(g, yMin).px}
              y={H - 6}
              textAnchor="middle"
              fontSize={10}
              fill="hsl(0 0% 50%)"
            >
              {g}
            </text>
          </g>
        ))}
        {[0, 5, 10, 15].map((g) => (
          <g key={`gy${g}`}>
            <line
              x1={padL}
              y1={toPx(xMin, g).py}
              x2={padL + plotW}
              y2={toPx(xMin, g).py}
              stroke="hsl(0 0% 90%)"
              strokeWidth={0.5}
            />
            <text
              x={padL - 4}
              y={toPx(xMin, g).py + 3}
              textAnchor="end"
              fontSize={10}
              fill="hsl(0 0% 50%)"
            >
              {g}
            </text>
          </g>
        ))}

        {/* regression line */}
        <line
          x1={lineP1.px}
          y1={lineP1.py}
          x2={lineP2.px}
          y2={lineP2.py}
          stroke="var(--brand, #4f46e5)"
          strokeWidth={2}
        />

        {/* points */}
        {points.map((p, i) => {
          const { px, py } = toPx(p.x, p.y);
          return (
            <circle
              key={i}
              cx={px}
              cy={py}
              r={6}
              fill="hsl(220 70% 55%)"
              stroke="white"
              strokeWidth={2}
              style={{ cursor: "grab" }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setDragIdx(i);
              }}
            />
          );
        })}
      </svg>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setPoints([
              { x: 1, y: 2.5 },
              { x: 2, y: 3.8 },
              { x: 3, y: 5.5 },
              { x: 4, y: 6.2 },
              { x: 5, y: 8.0 },
              { x: 6, y: 9.4 },
              { x: 7, y: 10.5 },
            ]);
          }}
          className="rounded border border-border bg-background px-2.5 py-1 text-xs hover:border-brand/40"
        >
          Reset
        </button>
        <button
          onClick={() => setPoints([])}
          className="rounded border border-border bg-background px-2.5 py-1 text-xs hover:border-brand/40"
        >
          Tøm
        </button>
      </div>

      <div className="text-xs font-mono space-y-0.5">
        <div>
          n = {points.length} punkter
        </div>
        <div>
          y = {reg.a.toFixed(3)} + {reg.b.toFixed(3)} · x
        </div>
        <div>r (Pearson) = {reg.r.toFixed(4)}</div>
        <div className="text-brand">
          R² = {reg.r2.toFixed(4)} ({(reg.r2 * 100).toFixed(1)} % av variasjonen
          forklart)
        </div>
      </div>
    </div>
  );
}

export function Tek1HypotesetestRegresjonPage() {
  return (
    <StackPageShell title="Modul 4b — Hypotesetest, kji² og regresjon" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            TEK-1501 · Modul 4b · Eksamens-tyngdepunkt
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hypotesetest, kji² og regresjon
          </h1>
          <p className="mt-3 text-muted-foreground">
            En hypotesetest er en formell prosedyre for å avgjøre om data
            støtter en bestemt påstand om en parameter. Vi setter opp en
            nullhypotese (H₀), regner en teststatistikk, sammenligner med en
            kritisk verdi (eller p-verdi), og forkaster eller beholder H₀.
            Også kji²-tester og lineær regresjon dekkes her — alle på samme
            inferens-rammeverk.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              p-verdi {">"} α betyr IKKE at H₀ er sann. Den betyr bare at vi
              ikke har bevis sterkt nok til å forkaste. «Fravær av bevis er
              ikke bevis for fravær.»
            </div>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hypotesetestens 6 steg</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <ol className="text-sm space-y-2 list-decimal pl-5">
              <li>
                <strong>Formuler H₀ og H₁.</strong> H₀ er status quo (μ = 100),
                H₁ er det vi vil vise (μ ≠ 100, μ {">"} 100, eller μ {"<"} 100).
              </li>
              <li>
                <strong>Velg signifikansnivå α</strong> (vanligvis 0.05 eller
                0.01). Dette er sannsynligheten for Type I-feil.
              </li>
              <li>
                <strong>Beregn teststatistikk</strong> fra data (z, t, χ², F).
              </li>
              <li>
                <strong>Finn kritisk verdi</strong> i tabell (eller beregn p-verdi).
              </li>
              <li>
                <strong>Sammenlign.</strong> |teststatistikk| {">"} kritisk verdi → forkast H₀.
                Ellers behold.
              </li>
              <li>
                <strong>Konkluder</strong> i konteksten av oppgaven.
              </li>
            </ol>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Type I- og Type II-feil (interaktiv)</h2>
          <HypotheseTestVisual />
          <div className="rounded-xl border border-border bg-card p-5 mt-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`            H₀ sann       H₁ sann
   ──────┬────────────┬───────────────
  Behold │  KORREKT   │ Type II-feil (β)
   H₀    │   (1-α)    │
   ──────┼────────────┼───────────────
  Forkast│ Type I-feil│   KORREKT
   H₀    │    (α)     │  (styrke 1-β)

α = P(forkast | H₀)        ← signifikansnivå, vi velger den
β = P(behold | H₁)         ← Type II-feilrate
styrke = 1 - β = P(forkast | H₁)  ← evnen til å detektere effekt

Trade-off: kan ikke minimere både α og β samtidig.
Større n → mindre β for samme α (bedre styrke).`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            2b. Arealene visuelt — drag c og se α, β krympe sammen med n
          </h2>
          <Type1Type2ErrorAreas />
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. t-test for én og to utvalg</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <div className="font-semibold">Én-utvalgs t-test:</div>
            <p className="text-xs text-muted-foreground"><Tex>{"H_0: \\mu = \\mu_0"}</Tex></p>
            <TexBlock>{"T = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}} \\;\\sim\\; t(n - 1) \\text{ under } H_0"}</TexBlock>
            <p className="text-xs text-muted-foreground">Forkast <Tex>{"H_0"}</Tex> hvis <Tex>{"|T| > t_{\\alpha/2,\\, n-1}"}</Tex>.</p>

            <div className="font-semibold pt-3">To-utvalgs t-test (lik varians):</div>
            <p className="text-xs text-muted-foreground"><Tex>{"H_0: \\mu_1 = \\mu_2"}</Tex></p>
            <TexBlock>{"T = \\frac{\\bar{x}_1 - \\bar{x}_2}{s_p \\sqrt{\\tfrac{1}{n_1} + \\tfrac{1}{n_2}}} \\;\\sim\\; t(n_1 + n_2 - 2)"}</TexBlock>
            <p className="text-xs text-muted-foreground">Pooled varians:</p>
            <TexBlock>{"s_p^2 = \\frac{(n_1 - 1) s_1^2 + (n_2 - 1) s_2^2}{n_1 + n_2 - 2}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Welch-t (ulik varians): bruk separate <Tex>{"s_1^2, s_2^2"}</Tex>. <Tex>{"\\mathrm{df}"}</Tex> beregnes med Welch–Satterthwaite. Default i scipy.
            </p>

            <div className="font-semibold pt-3">Eksempel: <Tex>{"\\bar{x} = 102, s = 10, n = 25"}</Tex>, test <Tex>{"H_0: \\mu = 100"}</Tex>:</div>
            <TexBlock>{"T = \\frac{102 - 100}{10 / \\sqrt{25}} = 1.00"}</TexBlock>
            <p className="text-xs text-muted-foreground"><Tex>{"t_{0.025,\\, 24} = 2.064"}</Tex>; <Tex>{"|1.00| < 2.064 \\Rightarrow"}</Tex> behold <Tex>{"H_0"}</Tex>. p-verdi <Tex>{"\\approx 0.327"}</Tex>.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Kji²-test</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <div className="font-semibold">Goodness-of-fit:</div>
            <TexBlock>{"\\chi^2 = \\sum_{i=1}^k \\frac{(O_i - E_i)^2}{E_i} \\;\\sim\\; \\chi^2(k - 1 - p)"}</TexBlock>
            <p className="text-xs text-muted-foreground"><Tex>{"k"}</Tex> = antall kategorier, <Tex>{"p"}</Tex> = antall estimerte parametere.</p>

            <div className="font-semibold pt-2">Test for uavhengighet (<Tex>{"r \\times c"}</Tex>):</div>
            <TexBlock>{"E_{ij} = \\frac{(\\text{rad}_i\\,\\text{sum}) \\cdot (\\text{kol}_j\\,\\text{sum})}{n}"}</TexBlock>
            <TexBlock>{"\\chi^2 = \\sum_{i, j} \\frac{(O_{ij} - E_{ij})^2}{E_{ij}} \\;\\sim\\; \\chi^2\\big((r - 1)(c - 1)\\big)"}</TexBlock>
            <p className="text-xs text-muted-foreground">Krav: <Tex>{"E_i \\geq 5"}</Tex>. Forkast hvis <Tex>{"\\chi^2 > \\chi^2_{\\alpha,\\, \\mathrm{df}}"}</Tex>.</p>

            <div className="font-semibold pt-2">Eksempel: terning kastet 60 ganger, observert [8, 12, 9, 11, 10, 10]:</div>
            <TexBlock>{"\\chi^2 = \\frac{(8-10)^2}{10} + \\frac{(12-10)^2}{10} + \\cdots = 1.0"}</TexBlock>
            <p className="text-xs text-muted-foreground"><Tex>{"\\mathrm{df} = 5"}</Tex>, <Tex>{"\\chi^2_{0.05,\\, 5} = 11.07"}</Tex>; <Tex>{"1.0 < 11.07 \\Rightarrow"}</Tex> behold <Tex>{"H_0"}</Tex>.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Lineær regresjon og R²</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Pearson-korrelasjon r måler styrken av lineær sammenheng. Lineær
            regresjon (minste kvadraters metode) finner linjen y = a + b·x som
            minimerer Σ(yᵢ − ŷᵢ)². Dra punktene under og se R² endre seg.
          </p>
          <ScatterRegression />
          <div className="rounded-xl border border-border bg-card p-5 mt-4 space-y-3 text-sm">
            <div className="font-semibold">Hellingstall:</div>
            <TexBlock>{"b = \\frac{\\sum_i (x_i - \\bar{x})(y_i - \\bar{y})}{\\sum_i (x_i - \\bar{x})^2}"}</TexBlock>
            <div className="font-semibold">Skjæringspunkt:</div>
            <TexBlock>{"a = \\bar{y} - b\\, \\bar{x}"}</TexBlock>
            <div className="font-semibold">Pearson <Tex>{"r"}</Tex>:</div>
            <TexBlock>{"r = \\frac{\\sum_i (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum_i (x_i - \\bar{x})^2 \\cdot \\sum_i (y_i - \\bar{y})^2}}"}</TexBlock>
            <div className="font-semibold">Determinasjonskoeffisient:</div>
            <TexBlock>{"R^2 = r^2 \\in [0, 1]"}</TexBlock>
            <p className="text-xs text-muted-foreground">Andel av variasjonen i <Tex>{"y"}</Tex> som forklares av lineær sammenheng med <Tex>{"x"}</Tex>.</p>
            <div className="font-semibold pt-2">Hypotesetest for hellingen (<Tex>{"b \\neq 0"}</Tex>?):</div>
            <TexBlock>{"T = \\frac{b}{\\mathrm{SE}(b)} \\;\\sim\\; t(n - 2)"}</TexBlock>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Eksamen-feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>p-verdi-tolkning.</strong> p {"<"} 0.05 betyr ikke «H₁ er
              sann med 95 % sannsynlighet». Det betyr «hvis H₀ var sann, ville
              vi observert resultat dette ekstreme med sannsynlighet {"<"} 5 %».
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>R² = 0.9 betyr ikke kausalitet.</strong> Korrelasjon kan
              skyldes felles årsak (confounder) eller tilfeldighet. Ingenting
              i regresjonsanalyse beviser at x forårsaker y.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Ekstrapolering.</strong> En regresjonsmodell er bare
              gyldig innenfor x-intervallet du har data for. Aldri ekstrapolér.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Kji²-krav: Eᵢ ≥ 5.</strong> Hvis noen forventede tellinger
              er {"<"} 5, slå sammen kategorier. Ellers gir testen feil
              p-verdi.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>To-sidig vs én-sidig.</strong> Default er to-sidig (μ ≠ μ₀).
              Velg én-sidig BARE hvis du på forhånd vet retningen. Halverer
              p-verdien — kan være misvisende.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "tek1-python-drill" }}
                className="text-brand hover:underline"
              >
                Python-drill (15 kjørbare øvelser)
              </Link>
              {" "}— verifisér hånd­regning med <code className="text-xs">scipy.stats.ttest_1samp</code>,
              <code className="text-xs">chi2_contingency</code>, og
              <code className="text-xs">linregress</code>.
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>{" "}
              under «Sannsynlighet & statistikk» — hypotesetest-stegene,
              p-verdi-tolkning, regresjons-feller.
            </li>
          </ul>
        </div>
              <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "tek-1501" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til TEK-1501-hub
          </Link>
        </div>
</div>
    </StackPageShell>
  );
}
