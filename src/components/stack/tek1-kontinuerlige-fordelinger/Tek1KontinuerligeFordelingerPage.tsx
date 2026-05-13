import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {Lightbulb, ArrowLeft } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { StackPageShell } from "@/components/stack/StackPageShell";

// --- distribution math (no scipy, just analytic + erf approx) ---
function erf(x: number): number {
  // Abramowitz & Stegun 7.1.26
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t -
      0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-ax * ax);
  return sign * y;
}
function normPdf(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}
function normCdf(x: number, mu: number, sigma: number): number {
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2)));
}
function expPdf(x: number, lambda: number): number {
  return x < 0 ? 0 : lambda * Math.exp(-lambda * x);
}
function expCdf(x: number, lambda: number): number {
  return x < 0 ? 0 : 1 - Math.exp(-lambda * x);
}
function gammaLn(x: number): number {
  // Lanczos approximation
  const g = 7;
  const c = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - gammaLn(1 - x);
  }
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
function tPdf(x: number, df: number): number {
  const lg =
    gammaLn((df + 1) / 2) -
    gammaLn(df / 2) -
    0.5 * Math.log(df * Math.PI);
  return Math.exp(lg) * Math.pow(1 + (x * x) / df, -(df + 1) / 2);
}
function chi2Pdf(x: number, df: number): number {
  if (x <= 0) return 0;
  const k = df / 2;
  return Math.exp(
    (k - 1) * Math.log(x) - x / 2 - k * Math.log(2) - gammaLn(k),
  );
}

// trapezoidal integration over given samples (assumes equal spacing)
function integralArea(samples: { x: number; y: number }[]): number {
  if (samples.length < 2) return 0;
  let a = 0;
  for (let i = 1; i < samples.length; i++) {
    const dx = samples[i].x - samples[i - 1].x;
    a += ((samples[i].y + samples[i - 1].y) / 2) * dx;
  }
  return a;
}

type Dist = "normal" | "exp" | "t" | "chi2";

function PdfExplorer() {
  const [dist, setDist] = useState<Dist>("normal");
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);
  const [lam, setLam] = useState(1);
  const [df, setDf] = useState(5);
  const [a, setA] = useState(-1);
  const [b, setB] = useState(1);

  const xs = useMemo(() => {
    let lo = -4, hi = 4;
    if (dist === "normal") {
      lo = mu - 4 * sigma;
      hi = mu + 4 * sigma;
    } else if (dist === "exp") {
      lo = 0;
      hi = 6 / lam;
    } else if (dist === "t") {
      lo = -5;
      hi = 5;
    } else if (dist === "chi2") {
      lo = 0;
      hi = Math.max(df * 3, 20);
    }
    const n = 200;
    const step = (hi - lo) / n;
    const out: { x: number; pdf: number; hl: number }[] = [];
    for (let i = 0; i <= n; i++) {
      const x = lo + i * step;
      let y = 0;
      if (dist === "normal") y = normPdf(x, mu, sigma);
      else if (dist === "exp") y = expPdf(x, lam);
      else if (dist === "t") y = tPdf(x, df);
      else if (dist === "chi2") y = chi2Pdf(x, df);
      const hl = x >= a && x <= b ? y : 0;
      out.push({ x, pdf: y, hl });
    }
    return out;
  }, [dist, mu, sigma, lam, df, a, b]);

  const areaShaded = useMemo(
    () =>
      integralArea(
        xs.filter((p) => p.x >= a && p.x <= b).map((p) => ({ x: p.x, y: p.pdf })),
      ),
    [xs, a, b],
  );

  const cdfA = useMemo(() => {
    if (dist === "normal") return normCdf(a, mu, sigma);
    if (dist === "exp") return expCdf(a, lam);
    return NaN;
  }, [dist, a, mu, sigma, lam]);
  const cdfB = useMemo(() => {
    if (dist === "normal") return normCdf(b, mu, sigma);
    if (dist === "exp") return expCdf(b, lam);
    return NaN;
  }, [dist, b, mu, sigma, lam]);

  const xMin = xs[0]?.x ?? -4;
  const xMax = xs[xs.length - 1]?.x ?? 4;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          PDF-utforsker
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["normal", "exp", "t", "chi2"] as Dist[]).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDist(d);
                if (d === "exp" || d === "chi2") {
                  setA(Math.max(a, 0));
                }
              }}
              className={
                "px-2.5 py-1 rounded border text-xs " +
                (dist === d
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-background hover:border-brand/40")
              }
            >
              {d === "normal"
                ? "Normal"
                : d === "exp"
                  ? "Eksponential"
                  : d === "t"
                    ? "Student-t"
                    : "Kji²"}
            </button>
          ))}
        </div>
      </div>

      {dist === "normal" && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label>
            <span className="block text-xs text-muted-foreground mb-1">
              μ = {mu.toFixed(2)}
            </span>
            <input
              type="range"
              min={-3}
              max={3}
              step={0.1}
              value={mu}
              onChange={(e) => setMu(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label>
            <span className="block text-xs text-muted-foreground mb-1">
              σ = {sigma.toFixed(2)}
            </span>
            <input
              type="range"
              min={0.3}
              max={3}
              step={0.1}
              value={sigma}
              onChange={(e) => setSigma(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
      )}
      {dist === "exp" && (
        <div className="text-sm">
          <label>
            <span className="block text-xs text-muted-foreground mb-1">
              λ = {lam.toFixed(2)}
            </span>
            <input
              type="range"
              min={0.1}
              max={5}
              step={0.1}
              value={lam}
              onChange={(e) => setLam(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
      )}
      {(dist === "t" || dist === "chi2") && (
        <div className="text-sm">
          <label>
            <span className="block text-xs text-muted-foreground mb-1">
              df = {df} (frihetsgrader)
            </span>
            <input
              type="range"
              min={1}
              max={30}
              value={df}
              onChange={(e) => setDf(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm">
        <label>
          <span className="block text-xs text-muted-foreground mb-1">
            a = {a.toFixed(2)}
          </span>
          <input
            type="range"
            min={xMin}
            max={xMax}
            step={(xMax - xMin) / 100}
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label>
          <span className="block text-xs text-muted-foreground mb-1">
            b = {b.toFixed(2)}
          </span>
          <input
            type="range"
            min={xMin}
            max={xMax}
            step={(xMax - xMin) / 100}
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer>
          <AreaChart data={xs}>
            <XAxis dataKey="x" tickFormatter={(v: number) => v.toFixed(1)} />
            <YAxis tickFormatter={(v: number) => v.toFixed(2)} />
            <Tooltip formatter={(v: number) => v.toFixed(4)} />
            <Area type="monotone" dataKey="pdf" stroke="hsl(220,30%,50%)" fill="hsl(220,30%,80%)" fillOpacity={0.4} />
            <Area type="monotone" dataKey="hl" stroke="var(--brand, #4f46e5)" fill="var(--brand, #4f46e5)" fillOpacity={0.55} />
            <ReferenceLine x={a} stroke="hsl(0 70% 50%)" strokeDasharray="4 4" />
            <ReferenceLine x={b} stroke="hsl(0 70% 50%)" strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="text-xs text-muted-foreground font-mono space-y-0.5">
        <div>
          P({a.toFixed(2)} ≤ X ≤ {b.toFixed(2)}) ≈{" "}
          <span className="text-brand">{areaShaded.toFixed(4)}</span> (skravert
          areal)
        </div>
        {!Number.isNaN(cdfA) && (
          <>
            <div>
              F({a.toFixed(2)}) = P(X ≤ {a.toFixed(2)}) = {cdfA.toFixed(4)}
            </div>
            <div>
              F({b.toFixed(2)}) = P(X ≤ {b.toFixed(2)}) = {cdfB.toFixed(4)}
            </div>
            <div>
              F(b) − F(a) = {(cdfB - cdfA).toFixed(4)} ← sjekk mot skravering
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function Tek1KontinuerligeFordelingerPage() {
  return (
    <StackPageShell title="Modul 3b — Kontinuerlige fordelinger" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            TEK-1501 · Modul 3b · Eksamen-tyngdepunkt
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Kontinuerlige fordelinger — normal, eksp, t, kji²
          </h1>
          <p className="mt-3 text-muted-foreground">
            En kontinuerlig stokastisk variabel kan ta alle verdier i et
            intervall. Vi beskriver den med PDF (tetthet) f(x). NB:
            sannsynlighet er <em>areal under kurven</em>, ikke høyden. P(X = a)
            = 0 for kontinuerlige fordelinger.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              Skyv a/b for å se det skraverte arealet endre seg. Sjekk at
              F(b) − F(a) matcher det skraverte arealet.
            </div>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. PDF — utforsker</h2>
          <PdfExplorer />
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Normalfordelingen</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Den viktigste fordelingen i statistikk. Symmetrisk, klokkeformet,
            karakterisert av μ (lokasjon) og σ (spredning).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`X ~ N(μ, σ²)

PDF:  f(x) = (1 / (σ√(2π))) · exp(-(x-μ)² / (2σ²))

E[X]   = μ
Var(X) = σ²

Standardnormal Z ~ N(0, 1):
  z = (x - μ) / σ            ← standardisering

68-95-99.7-regelen:
  P(|Z| ≤ 1) ≈ 0.683          ← ±1σ
  P(|Z| ≤ 2) ≈ 0.954          ← ±2σ
  P(|Z| ≤ 3) ≈ 0.997          ← ±3σ

Tabellbruk (kalkulator-modus):
  P(X > x) = 1 - Φ((x-μ)/σ)
  P(X ≤ x) = Φ((x-μ)/σ)

Eks: høyde i en populasjon, X ~ N(178, 7²) cm
  P(X > 190) = P(Z > (190-178)/7) = P(Z > 1.714)
             = 1 - Φ(1.714) ≈ 1 - 0.9568 ≈ 0.043`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Eksponentialfordelingen</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Tid <strong>mellom</strong> Poisson-hendelser, eller levetid uten
            slitasje. Memoryless: P(X{">"} s+t | X {">"} s) = P(X {">"} t).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`X ~ Exp(λ)   (λ er raten — antall pr. tidsenhet)

PDF:   f(x) = λ · e⁻ᴧˣ           for x ≥ 0
CDF:   F(x) = 1 - e⁻ᴧˣ
E[X]   = 1/λ
Var(X) = 1/λ²

Eks: lyspærer
  Gjennomsnittlig levetid = 1000 timer  ⇒  λ = 1/1000

  P(lever ≥ 500 t) = e⁻⁰⁵ ≈ 0.607
  P(lever ≥ 1000 t) = e⁻¹ ≈ 0.368
  P(500 ≤ X ≤ 1500) = e⁻⁰⁵ - e⁻¹⁵ ≈ 0.384`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Student-t-fordelingen</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Brukes når <strong>σ er ukjent</strong> og må estimeres fra
            utvalget. Tyngre haler enn normalen. df = n − 1.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`T ~ t(df)

Hvis X̄ er utvalgsgjennomsnitt og s er utvalgsstandardavvik:

  T = (X̄ - μ) / (s/√n)   ~ t(n - 1)

Egenskaper:
  • Symmetrisk rundt 0
  • Tyngre haler enn N(0,1) — mer sannsynlig med ekstreme verdier
  • Når df → ∞, blir t-fordelingen til N(0,1)
    (i praksis: df ≥ 30 → kan bruke z-tabell)

Eksamen-bruk: KI for μ og t-test med ukjent σ.`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Kji-kvadrat-fordelingen</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Sum av kvadrerte standardnormale. Brukes for variansestimering og
            kji²-test.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Hvis Z₁, Z₂, ..., Zₖ er iid N(0,1):
  X = Z₁² + Z₂² + ... + Zₖ²  ~  χ²(k)

Egenskaper:
  • Bare positive verdier (x ≥ 0)
  • Skjev til høyre (mer skjev jo mindre df)
  • Når df er stor: ≈ N(df, 2df)

E[χ²(k)]   = k
Var(χ²(k)) = 2k

Eksamen-bruk:
  • (n-1)s²/σ² ~ χ²(n-1)         — for variansestimering
  • Goodness-of-fit-test (kapittel 11)
  • Test for uavhengighet (kontingenstabell)`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Eksamen-feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>PDF er ikke sannsynlighet.</strong> f(x) kan være {">"} 1.
              Sannsynlighet er ALLTID areal under kurven mellom to grenser.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Standardisering.</strong> Glem ikke å regne om til z når
              du bruker normaltabellen. Z = (x − μ)/σ.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>P(X = a) = 0.</strong> For kontinuerlige fordelinger gir
              et enkelt punkt ingen sannsynlighet. P(X {"<"} a) = P(X ≤ a).
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Skala for eksponential.</strong> λ er rate, ikke mean. 1/λ
              er mean. Konverter alltid før innsetting.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "tek1-forventning-clt" }}
                className="text-brand hover:underline"
              >
                Modul 3c — Forventning, varians og CLT
              </Link>
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>{" "}
              under «Sannsynlighetsfordelinger».
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
