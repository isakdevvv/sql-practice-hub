import { Link } from "@tanstack/react-router";
import {Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Stokastiske variabler — diskret vs. kontinuerlig", anchor: "sv" },
  { title: "Forventning E[X] og varians Var(X)", anchor: "ev" },
  { title: "Diskrete fordelinger", anchor: "diskret" },
  { title: "Kontinuerlige fordelinger", anchor: "kontinuerlig" },
  { title: "Normalfordelingen — standardisering", anchor: "normal" },
  { title: "Sentralgrenseteoremet (CLT)", anchor: "clt" },
  { title: "Fordelings-velgeren", anchor: "velger" },
  { title: "Eksamen-feller", anchor: "feller" },
];

export function Tek1FordelingerPage() {
  return (
    <StackPageShell
      title="Modul 3 — Sannsynlighetsfordelinger"
      group="eksamen"
    >
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            TEK-1501 · Modul 3 av 4 · Eksamen-tyngdepunkt
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Fordelinger — generelle modeller for tilfeldighet
          </h1>
          <p className="mt-3 text-muted-foreground">
            En sannsynlighetsfordeling er en oppskrift som forteller hvor
            sannsynlige ulike verdier er. I stedet for å regne fra grunnen av
            for hver oppgave, lærer vi gjenkjennelige mønstre (binomisk,
            Poisson, normal, …) og setter inn parameterne. Halve eksamen-
            uka går med på å velge RIKTIG fordeling.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              under «Sannsynlighetsfordelinger» — fordelings-match,
              parameter-fill, og CLT-quizzer. Verifisér med{" "}
              <code className="text-xs">scipy.stats</code> i{" "}
              <Link to="/python" className="text-brand hover:underline">Python</Link>.
            </div>
          </div>
        </div>

        <CourseOutline courseId="tek1-fordelinger" steps={STEPS} />

        <section id="sv" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Stokastiske variabler</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En stokastisk variabel (random variable) X er en funksjon som
            tilordner et tall til hvert utfall i Ω. Eks: kast to terninger →
            X = summen. To grunntyper:
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Diskret X:  Tar tellbart antall verdier (heltall, kategorier).
            Beskrives med PMF (Probability Mass Function):
              p(x) = P(X = x)

            Egenskaper:  Σ p(x) = 1,  p(x) ≥ 0

            CDF: F(x) = P(X ≤ x) = Σ_{xᵢ ≤ x} p(xᵢ)

            Eks: antall feil i 10 enheter (0..10), terningkast (1..6).

Kontinuerlig X: Tar verdier i et intervall (reelle tall).
            Beskrives med PDF (Probability Density Function):
              f(x)  (en TETTHETSFUNKSJON, ikke sannsynlighet!)

            Egenskaper:  ∫ f(x) dx = 1,  f(x) ≥ 0
            P(a ≤ X ≤ b) = ∫ₐᵇ f(x) dx        (AREAL under kurven)
            P(X = a) = 0    ← punkt har sannsynlighet 0 i kontinuerlig

            CDF: F(x) = P(X ≤ x) = ∫₋∞ˣ f(t) dt

            Eks: tid mellom kundeankomster, måling av lengde.`}</pre>
          </div>
        </section>

        <section id="ev" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Forventning og varians</h2>
          <p className="text-sm text-muted-foreground mb-4">
            To tall som karakteriserer en fordeling: hvor ligger den i snitt
            (forventning) og hvor mye varierer den (varians).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Forventning E[X] (=μ):

  Diskret:        E[X] = Σ x · p(x)
  Kontinuerlig:   E[X] = ∫ x · f(x) dx

  E er LINEÆR:    E[aX + b] = aE[X] + b
                  E[X + Y]  = E[X] + E[Y]   (alltid)

Varians Var(X) (=σ²):

  Var(X) = E[(X - μ)²]
         = E[X²] - (E[X])²       ← praktisk formel

  Standardavvik:  σ = √Var(X)    (samme enhet som X)

  Skalering:      Var(aX + b) = a² · Var(X)
                  Var(X + Y)  = Var(X) + Var(Y)   HVIS X⊥Y (uavhengige)`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempel — én terning
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`X = utfallet av en rettferdig terning. P(X=k) = 1/6 for k=1..6.

E[X]  = (1+2+3+4+5+6)/6 = 21/6 = 3.5
E[X²] = (1+4+9+16+25+36)/6 = 91/6 ≈ 15.17
Var(X) = E[X²] - (E[X])² = 91/6 - (7/2)² = 91/6 - 49/4 = 35/12 ≈ 2.92
σ = √2.92 ≈ 1.71`}</pre>
          </div>
        </section>

        <section id="diskret" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Diskrete fordelinger</h2>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <h3 className="font-semibold text-sm mb-2">Bernoulli (n=1)</h3>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Ett forsøk med to utfall: suksess (p) eller fiasko (1-p).

  X = 1 hvis suksess, 0 ellers.
  P(X=1) = p,  P(X=0) = 1-p
  E[X] = p
  Var(X) = p(1-p)

  Eks: kaster én mynt (p = 0.5), tester én enhet (p = 0.05 defekt).`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <h3 className="font-semibold text-sm mb-2">Binomisk B(n, p)</h3>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Sum av n uavhengige Bernoulli — antall suksesser i n forsøk.

  P(X = k) = C(n, k) · pᵏ · (1-p)ⁿ⁻ᵏ      for k = 0..n
  E[X] = np
  Var(X) = np(1-p)

  Antagelser:
    - Fast antall forsøk n
    - Hvert forsøk har samme p
    - Forsøkene er uavhengige
    - Bare to mulige utfall pr. forsøk

  Eks: "10 enheter testes, hver med 5% feil — hva er P(2 feil)?"
       n=10, p=0.05, k=2
       P(X=2) = C(10,2) · 0.05² · 0.95⁸ = 45 · 0.0025 · 0.6634 ≈ 0.0746

  Python:  scipy.stats.binom.pmf(2, n=10, p=0.05)`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <h3 className="font-semibold text-sm mb-2">Hypergeometrisk H(N, K, n)</h3>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Antall suksesser når vi trekker n UTEN tilbakelegging fra en
populasjon med N enheter hvorav K er suksesser.

  P(X = k) = C(K, k) · C(N-K, n-k) / C(N, n)
  E[X] = n · K/N
  Var(X) = n · (K/N) · ((N-K)/N) · ((N-n)/(N-1))

  Parametere: N (populasjon), K (suksesser), n (utvalg).

  Eks: "20 enheter, 5 defekte. Trekk 3 — P(2 defekte)?"
       N=20, K=5, n=3, k=2
       P(X=2) = C(5,2) · C(15,1) / C(20,3) = 10 · 15 / 1140 ≈ 0.132

  Python:  scipy.stats.hypergeom.pmf(2, M=20, n=5, N=3)
           (NB: scipy bruker M=N, n=K, N=n — sjekk doc!)`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-sm mb-2">Poisson Poi(λ)</h3>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Antall sjeldne hendelser i et fast intervall (tid, areal, volum).

  P(X = k) = e⁻λ · λᵏ / k!     for k = 0, 1, 2, ...
  E[X] = λ
  Var(X) = λ                   ← OBS: lik forventning!

  Antagelser:
    - Hendelser skjer uavhengig
    - Konstant rate over intervallet
    - To hendelser kan ikke skje samtidig

  Eks: "5 kundeankomster pr. time i snitt — P(3 i en time)?"
       λ=5, k=3
       P(X=3) = e⁻⁵ · 5³/3! = 0.00674 · 125 / 6 ≈ 0.1404

  Python:  scipy.stats.poisson.pmf(3, mu=5)

  Tilnærming: Binom(n, p) ≈ Poi(np) når n stor og p liten (np ≤ 10).`}</pre>
          </div>
        </section>

        <section id="kontinuerlig" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Kontinuerlige fordelinger</h2>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <h3 className="font-semibold text-sm mb-2">Uniform U(a, b)</h3>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Konstant tetthet på intervallet [a, b].

  f(x) = 1/(b-a)  for a ≤ x ≤ b, ellers 0
  E[X] = (a+b)/2
  Var(X) = (b-a)²/12

  Eks: ventetid i et 15-minutters intervall, tilfeldig tall i [0, 1].`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <h3 className="font-semibold text-sm mb-2">Eksponential Exp(λ)</h3>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Tid mellom Poisson-hendelser. Memoryless.

  f(x) = λ · e⁻λx     for x ≥ 0
  CDF: F(x) = 1 - e⁻λx
  E[X] = 1/λ
  Var(X) = 1/λ²

  Memoryless: P(X > s+t | X > s) = P(X > t).
  "Komponenten har ingen aldring — det at den har levd 1000 timer
   sier ingenting om resten av levetiden."

  Eks: levetid på lyspære, tid mellom kundeankomster.

  Python:  scipy.stats.expon (parametere ulike — scale = 1/λ)`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <h3 className="font-semibold text-sm mb-2">Normal N(μ, σ²)</h3>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Den klokkeformede fordelingen. Default-modell for sum av mange
små uavhengige bidrag (jf. CLT).

  f(x) = (1 / (σ√(2π))) · exp(-(x-μ)² / (2σ²))
  E[X] = μ
  Var(X) = σ²

  Symmetrisk om μ. 68/95/99.7-regel:
    P(|X - μ| < 1σ)  ≈ 0.683
    P(|X - μ| < 2σ)  ≈ 0.954
    P(|X - μ| < 3σ)  ≈ 0.997

  Standardisering:  Z = (X - μ) / σ ~ N(0, 1)
    P(X ≤ x) = P(Z ≤ (x-μ)/σ) = Φ((x-μ)/σ)

  Python:  scipy.stats.norm.cdf(x, loc=μ, scale=σ)`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <h3 className="font-semibold text-sm mb-2">Kji-kvadrat χ²(k)</h3>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Sum av k uavhengige standardnormale i andre potens.

  X = Z₁² + Z₂² + ... + Zₖ²
  E[X] = k       (antall frihetsgrader)
  Var(X) = 2k

  Brukes til:
    - Test om en utvalgs-varians (s² · (n-1)/σ² ~ χ²ₙ₋₁)
    - Kji-kvadrattest for uavhengighet/tilpasning

  Python:  scipy.stats.chi2.ppf(0.95, df=k)   ← 95-persentilen`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-sm mb-2">Student-t tᵥ</h3>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Lignende normalfordelingen, men med tyngre haler. Bruk når σ er
ukjent og estimeres med s.

  T = (X̄ - μ) / (s/√n)     ~ t med v = n-1 frihetsgrader

  E[T] = 0
  Var(T) = v/(v-2)   for v > 2  (→ 1 når v → ∞)

  v stor (>30): tᵥ ≈ N(0, 1).

  Brukes til: CI for μ med ukjent σ, t-tester.

  Python:  scipy.stats.t.ppf(0.975, df=n-1)`}</pre>
          </div>
        </section>

        <section id="normal" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Normalfordelingen — standardisering</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Den viktigste ferdigheten i hele kurset.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Steg 1 — standardisér:  Z = (X - μ) / σ

Steg 2 — finn sannsynligheten med standardnormaltabell eller cdf:

  P(X ≤ x)        = Φ((x - μ)/σ)
  P(X ≥ x)        = 1 - Φ((x - μ)/σ)
  P(a ≤ X ≤ b)    = Φ((b - μ)/σ) - Φ((a - μ)/σ)

Eksempel: X ~ N(100, 15²). Finn P(X ≤ 130).

  z = (130 - 100) / 15 = 2.0
  P(X ≤ 130) = Φ(2.0) = 0.9772      (fra tabell)

Eksempel: P(85 ≤ X ≤ 115)
  z₁ = (85 - 100)/15 = -1
  z₂ = (115 - 100)/15 = +1
  P = Φ(1) - Φ(-1) = 0.8413 - 0.1587 = 0.6826   ← 68%-regelen`}</pre>
          </div>
        </section>

        <section id="clt" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Sentralgrenseteoremet (CLT)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Det viktigste resultatet i kurset. Forklarer hvorfor normal-
            fordelingen er overalt.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Sentralgrenseteoremet (CLT):

  La X₁, X₂, ..., Xₙ være uavhengige, identisk fordelte (i.i.d.)
  med forventning μ og varians σ². For STORT n gjelder:

    X̄ = (X₁ + ... + Xₙ)/n  ~  N(μ, σ²/n)    tilnærmet

  Ekvivalent:  Z = (X̄ - μ) / (σ/√n)  ~  N(0, 1)

UTROLIG:  Den underliggende fordelingen kan være HVA SOM HELST
          (uniform, eksponential, skjev, ...) — snittet av n sample
          blir likevel tilnærmet normalt. Tommelfingerregel: n ≥ 30.`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempel — fabrikk-snitt
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Vekt av enheter har μ=500g og σ=20g (ukjent fordeling).
Vi tar n=64 enheter — hva er P(snittvekt ≥ 505g)?

CLT:  X̄ ~ N(500, 20²/64) = N(500, 6.25)
      SD(X̄) = √6.25 = 2.5
      z = (505 - 500) / 2.5 = 2.0
      P(X̄ ≥ 505) = 1 - Φ(2.0) = 1 - 0.9772 = 0.0228   ≈ 2.3 %`}</pre>
          </div>
        </section>

        <section id="velger" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Fordelings-velgeren</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Det viktigste verktøyet på eksamen.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-1/3">
                    Situasjon
                  </th>
                  <th className="text-left font-semibold px-3 py-2">Fordeling</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">
                    Ett forsøk, to utfall (suksess/fiasko)
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">Bernoulli(p)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">
                    Antall suksesser i n uavhengige forsøk, hver med p
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">Binomisk B(n,p)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">
                    Trekk UTEN tilbakelegging fra endelig populasjon
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Hypergeometrisk
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">
                    Antall sjeldne hendelser i fast intervall
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">Poisson(λ)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">Tilfeldig tall i [a, b], helt jevnt</td>
                  <td className="px-3 py-2 text-muted-foreground">Uniform(a, b)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">
                    Tid mellom Poisson-hendelser, levetid uten aldring
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">Exp(λ)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">Måling med tilfeldig støy, klokkeform</td>
                  <td className="px-3 py-2 text-muted-foreground">Normal N(μ, σ²)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">Sum av kvadrerte standardnormale</td>
                  <td className="px-3 py-2 text-muted-foreground">χ²(k)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">
                    Snitt fra liten n, σ ukjent — bruker s
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">Student-t(n-1)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">
                    Snitt fra stor n (n ≥ 30), ukjent fordeling
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    CLT → N(μ, σ²/n)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Eksamen-feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Med eller uten tilbakelegging.</strong> Binomisk antar
              uavhengige forsøk (med tilbakelegging eller stor populasjon).
              Hypergeometrisk når trekkene avhenger av forrige.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>PDF ≠ sannsynlighet.</strong> For kontinuerlige X kan f(x)
              være større enn 1 — det er en tetthet. Bare AREAL under f er
              sannsynlighet. P(X = a) = 0 alltid for kontinuerlig.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Normal-standardisering: hvilket fortegn?</strong> Hvis vi
              vil P(X {">"} x): finn Φ((x-μ)/σ), så ta 1 minus.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>CLT-snittets std er σ/√n, IKKE σ.</strong> Det er hele
              poenget med CLT — varians blir mindre etter hvert som n øker. På
              eksamen: glem ikke å dele med √n.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Poisson-tilnærming gjelder bare når p er liten.</strong>{" "}
              Binom(n,p) ≈ Poi(np) krever p ≤ 0.1 og n ≥ 30. Ellers bruk binomisk
              direkte.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Var(X+Y) = Var(X) + Var(Y)</strong> krever uavhengighet.
              Hvis ikke: Var(X+Y) = Var(X) + Var(Y) + 2·Cov(X,Y).
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>{" "}
              under «Sannsynlighetsfordelinger» — match-fordeling-til-scenario,
              parameter-fyll, og CLT-quizzer.
            </li>
            <li>
              <Link to="/python" className="text-brand hover:underline">
                Python-øvelser
              </Link>{" "}
              — bruk{" "}
              <code className="text-xs">scipy.stats.binom</code>,{" "}
              <code className="text-xs">scipy.stats.norm</code>, og{" "}
              <code className="text-xs">scipy.stats.poisson</code> for verifisering.
            </li>
            <li>
              Neste modul:{" "}
              <Link
                to="/stack/$slug"
                params={{ slug: "tek1-statistisk-analyse" }}
                className="text-brand hover:underline"
              >
                Statistisk inferens og regresjon
              </Link>{" "}
              — fra fordeling til konklusjon.
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
