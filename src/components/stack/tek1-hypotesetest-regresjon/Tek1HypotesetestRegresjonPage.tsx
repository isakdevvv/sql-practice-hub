import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";

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
          <h2 className="text-xl font-semibold mb-3">3. t-test for én og to utvalg</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Én-utvalgs t-test (sammenlign x̄ mot μ₀):
  H₀: μ = μ₀
  T = (x̄ - μ₀) / (s/√n)    ~  t(n-1) under H₀

  Forkast H₀ hvis |T| > t_(α/2, n-1).

To-utvalgs t-test (sammenlign to grupper, antar lik varians):
  H₀: μ₁ = μ₂
  T = (x̄₁ - x̄₂) / (sp · √(1/n₁ + 1/n₂))   ~  t(n₁+n₂-2)

  sp² = ((n₁-1)s₁² + (n₂-1)s₂²) / (n₁+n₂-2)     ← pooled varians

Welch-t (ulik varians): bruk separate s₁², s₂² — df beregnes med
                         Welch-Satterthwaite-formelen. Default i scipy.

p-verdi: areal i halen(e) av t-fordelingen som er like ekstrem som
         observert T. Forkast hvis p < α.

Eks: x̄ = 102, s = 10, n = 25. Test H₀: μ = 100 (to-sidig, α = 0.05).
  T = (102 - 100)/(10/√25) = 2/2 = 1.00
  t_(0.025, 24) = 2.064
  |1.00| < 2.064 → behold H₀. p-verdi ≈ 0.327`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Kji²-test</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Goodness-of-fit (passer observerte til en forventet fordeling?):
  χ² = Σ (Oᵢ - Eᵢ)² / Eᵢ        ~  χ²(k - 1 - p)
  k = antall kategorier
  p = antall estimerte parametere

Test for uavhengighet (kontingenstabell r × c):
  Eᵢⱼ = (radᵢ_sum · kolonneⱼ_sum) / totalt
  χ² = Σᵢⱼ (Oᵢⱼ - Eᵢⱼ)² / Eᵢⱼ    ~  χ²((r-1)(c-1))

Krav: Eᵢ ≥ 5 i hver celle (ellers slå sammen kategorier).
Forkast H₀ hvis χ² > χ²_(α, df).

Eks: terning kastes 60 ganger. Observert: [8,12,9,11,10,10].
  Forventet under "fair": 10 i hver.
  χ² = (8-10)²/10 + (12-10)²/10 + ... = 1.0
  df = 6-1 = 5
  χ²_(0.05, 5) = 11.07
  1.0 < 11.07 → behold H₀ (terningen er konsistent med fair).`}</pre>
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
          <div className="rounded-xl border border-border bg-card p-5 mt-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Hellingstall:  b = Σ(xᵢ - x̄)(yᵢ - ȳ) / Σ(xᵢ - x̄)²
Skjæringspunkt: a = ȳ - b · x̄

Pearson-r:  r = Σ(xᵢ - x̄)(yᵢ - ȳ) / √(Σ(xᵢ - x̄)² · Σ(yᵢ - ȳ)²)

Determinasjonskoeffisient:  R² = r²  ∈ [0, 1]
  Andel av variasjonen i y som forklares av lineær sammenheng med x.

Hypotesetest for hellingen (er b signifikant ulik 0?):
  T = b / SE(b)    ~  t(n - 2)`}</pre>
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
      </div>
    </StackPageShell>
  );
}
