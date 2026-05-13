import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";

// Z and t critical values (for 90/95/99 %)
const Z_CRIT: Record<number, number> = { 0.9: 1.6449, 0.95: 1.96, 0.99: 2.5758 };

function gaussianSample(mu: number, sigma: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mu + sigma * z;
}

function CiSimulator() {
  const [conf, setConf] = useState<0.9 | 0.95 | 0.99>(0.95);
  const [n, setN] = useState(30);
  const [mu] = useState(100);
  const [sigma] = useState(15);

  const [intervals, setIntervals] = useState<
    { lo: number; hi: number; mean: number; covers: boolean }[]
  >([]);

  function generate() {
    const z = Z_CRIT[conf];
    const out: { lo: number; hi: number; mean: number; covers: boolean }[] = [];
    for (let i = 0; i < 100; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) sum += gaussianSample(mu, sigma);
      const mean = sum / n;
      const se = sigma / Math.sqrt(n);
      const lo = mean - z * se;
      const hi = mean + z * se;
      out.push({ lo, hi, mean, covers: lo <= mu && mu <= hi });
    }
    setIntervals(out);
  }

  const coverRate =
    intervals.length === 0
      ? 0
      : intervals.filter((i) => i.covers).length / intervals.length;

  const xMin = Math.min(mu - 4 * (sigma / Math.sqrt(n)), ...intervals.map((i) => i.lo));
  const xMax = Math.max(mu + 4 * (sigma / Math.sqrt(n)), ...intervals.map((i) => i.hi));

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          KI-simulator — trekker 100 utvalg fra N(100, 15²)
        </div>
        <div className="flex gap-1.5">
          {([0.9, 0.95, 0.99] as const).map((c) => (
            <button
              key={c}
              onClick={() => setConf(c)}
              className={
                "px-2.5 py-1 rounded border text-xs " +
                (conf === c
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-background hover:border-brand/40")
              }
            >
              {(c * 100).toFixed(0)} %
            </button>
          ))}
        </div>
      </div>
      <label className="text-sm block">
        <span className="block text-xs text-muted-foreground mb-1">
          n = {n} (utvalgsstørrelse)
        </span>
        <input
          type="range"
          min={5}
          max={200}
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
          className="w-full"
        />
      </label>

      <button
        onClick={generate}
        className="rounded-lg bg-brand text-brand-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90"
      >
        Trekk 100 utvalg
      </button>

      {intervals.length > 0 && (
        <>
          <div className="text-xs text-muted-foreground font-mono">
            Dekning: <span className="text-brand">{(coverRate * 100).toFixed(0)} av 100</span>{" "}
            intervaller dekker μ = {mu}. (Forventet ≈ {(conf * 100).toFixed(0)}%)
          </div>
          <div
            className="relative w-full"
            style={{ height: `${intervals.length * 4}px` }}
          >
            <svg
              viewBox={`${xMin} 0 ${xMax - xMin} ${intervals.length * 4}`}
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              {/* μ line */}
              <line
                x1={mu}
                y1={0}
                x2={mu}
                y2={intervals.length * 4}
                stroke="hsl(142 76% 36%)"
                strokeWidth={(xMax - xMin) / 400}
              />
              {intervals.map((iv, idx) => {
                const y = idx * 4 + 2;
                const color = iv.covers ? "hsl(220 70% 55%)" : "hsl(0 70% 55%)";
                return (
                  <g key={idx}>
                    <line
                      x1={iv.lo}
                      y1={y}
                      x2={iv.hi}
                      y2={y}
                      stroke={color}
                      strokeWidth={1.5}
                    />
                    <circle cx={iv.mean} cy={y} r={(xMax - xMin) / 500} fill={color} />
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="text-[10px] text-muted-foreground">
            Hvert horisontalt strek er ett KI. Grønn vertikal linje = sann μ.
            Røde intervaller dekker IKKE μ.
          </div>
        </>
      )}
    </div>
  );
}

export function Tek1EstimeringKiPage() {
  return (
    <StackPageShell title="Modul 4a — Estimering og KI" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            TEK-1501 · Modul 4a · Eksamen-tyngdepunkt
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Estimering og konfidensintervall
          </h1>
          <p className="mt-3 text-muted-foreground">
            Vi har et utvalg på n observasjoner og vil estimere en ukjent
            parameter (typisk μ). Et punktestimat (X̄) er én verdi —
            konfidensintervallet uttrykker usikkerheten rundt det. Et 95 % KI
            betyr: hvis vi gjentar prosedyren mange ganger, dekker
            intervallene den sanne parameteren ca. 95 % av gangene.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              KI-tolkningen er subtil! «P(μ ∈ [lo, hi]) = 0.95» er FEIL — μ er
              en fast (ukjent) parameter, det er INTERVALLET som er
              tilfeldig. Riktig tolkning: ca. 95 av 100 slike intervaller
              kommer til å dekke μ.
            </div>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Punktestimat</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Egenskaper en god estimator skal ha:

  Forventningsrett (unbiased):  E[θ̂] = θ
    Eks: X̄ er forventningsrett for μ.
         s² = (1/(n-1))Σ(xᵢ - x̄)² er forventningsrett for σ².
         (Det er derfor vi deler på n-1 og ikke n!)

  Konsistens:  θ̂ → θ når n → ∞
    Sannsynlighet for at θ̂ er nær θ vokser med n.

  Effisiens: minst mulig varians blant forventningsrette estimatorer.

Vanlige estimatorer:
  μ      → X̄  = (1/n) Σ xᵢ
  σ²     → s² = (1/(n-1)) Σ (xᵢ - x̄)²
  σ      → s   (NB: ikke helt forventningsrett, men praktisk)
  p (proporsjon) → p̂ = (antall suksesser) / n`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. KI for μ — kjent σ</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Bruker normalfordelingen direkte (z-tabell).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`(1 - α) · 100 % KI for μ når σ er kjent:

  X̄ ± z_(α/2) · σ/√n

Vanlige z-verdier:
  90 % KI:  z = 1.6449
  95 % KI:  z = 1.96
  99 % KI:  z = 2.5758

Bredde = 2 · z · σ/√n
  → halver bredden krever 4x n.

Eks: n = 25, σ = 10 (kjent), x̄ = 50, 95% KI?
  95% KI: 50 ± 1.96 · (10/√25)
        = 50 ± 1.96 · 2
        = 50 ± 3.92
        = [46.08, 53.92]`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. KI for μ — ukjent σ (t-fordeling)</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Vanligste situasjon i praksis. Erstatt σ med s og z med t.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`(1 - α) · 100 % KI for μ når σ er ukjent:

  X̄ ± t_(α/2, n-1) · s/√n

t-fordelingen har n−1 frihetsgrader. Tyngre haler → større kritisk
verdi → bredere KI enn hvis σ var kjent.

Eks: n = 10, x̄ = 50, s = 12 (utvalgsstandardavvik), 95% KI?
  df = 9
  t-tabell: t_(0.025, 9) = 2.262
  95% KI: 50 ± 2.262 · (12/√10)
        = 50 ± 2.262 · 3.795
        = 50 ± 8.59
        = [41.41, 58.59]

Når n ≥ 30: t ≈ z → kan bruke z-tabell som tilnærming.`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. KI for proporsjon p</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Hvis np̂ ≥ 5 og n(1-p̂) ≥ 5 (normaltilnærming gyldig):

  p̂ ± z_(α/2) · √(p̂(1-p̂)/n)

Eks: meningsmåling, 400 spurt, 220 svarer JA.
  p̂ = 220/400 = 0.55
  95% KI: 0.55 ± 1.96 · √(0.55·0.45/400)
         = 0.55 ± 1.96 · 0.02487
         = 0.55 ± 0.0488
         = [0.501, 0.599]   ← 50.1 % til 59.9 %`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. KI-simulator (100 utvalg)</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Vi trekker 100 utvalg fra en normalfordeling og beregner KI for
            hver. Telle hvor mange dekker μ. Dette gir den ekte
            <em> frekvens-tolkningen</em> av konfidensintervallet.
          </p>
          <CiSimulator />
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Eksamen-feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>z vs t.</strong> Bruk z hvis σ er kjent (sjeldent). Bruk
              t (med df = n−1) hvis σ må estimeres med s (vanligst). Med
              n ≥ 30 kan du bruke z som tilnærming.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>KI-tolkning.</strong> 95 % KI er IKKE «P(μ ∈ KI) = 0.95».
              μ er en fast parameter, KI er den tilfeldige størrelsen. Riktig:
              «metoden produserer KI som dekker μ i 95 % av gjentakelsene».
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Bredde og n.</strong> Bredde = 2·z·s/√n. For å halvere
              bredden trenger du n·4.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Forveksle s og s/√n.</strong> Standardavvik (s) er
              utvalgets spredning, standardfeil (s/√n) er usikkerheten i x̄.
              KI bruker standardfeilen.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "tek1-hypotesetest-regresjon" }}
                className="text-brand hover:underline"
              >
                Modul 4b — Hypotesetest, kji² og regresjon
              </Link>
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
