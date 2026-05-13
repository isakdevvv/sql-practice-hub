import { Link } from "@tanstack/react-router";
import {Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Estimatorer og punktestimat", anchor: "estimator" },
  { title: "Konfidensintervaller for μ", anchor: "ci-mu" },
  { title: "Konfidensintervall for andel p", anchor: "ci-p" },
  { title: "Hypotesetesting — strukturen", anchor: "hypotese" },
  { title: "z-test, t-test, kji-kvadrat", anchor: "tester" },
  { title: "Korrelasjon (Pearson r)", anchor: "korrelasjon" },
  { title: "Lineær regresjon", anchor: "regresjon" },
  { title: "Eksamen-typiske oppgaver", anchor: "eksamen" },
];

export function Tek1StatistiskAnalysePage() {
  return (
    <StackPageShell
      title="Modul 4 — Statistisk inferens og regresjon"
      group="eksamen"
    >
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            TEK-1501 · Modul 4 av 4 · Eksamen-oppgaven (~40 % av karakter)
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Inferens og regresjon — trekk konklusjoner fra data
          </h1>
          <p className="mt-3 text-muted-foreground">
            Vi har observert et utvalg — hva kan vi si om den underliggende
            populasjonen? To verktøy: konfidensintervall (CI — gi et intervall
            for μ) og hypotesetest (kan vi forkaste et bestemt utsagn om μ?).
            Pluss korrelasjon og lineær regresjon for å modellere
            sammenhengen mellom to variabler.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              under «Statistisk analyse», og{" "}
              <Link to="/python" className="text-brand hover:underline">
                Python-øvelsene
              </Link>{" "}
              — kjør CI-beregning, t-tester, regresjon med{" "}
              <code className="text-xs">scipy.stats.linregress</code>.
            </div>
          </div>
        </div>

        <CourseOutline courseId="tek1-statistisk-analyse" steps={STEPS} />

        <section id="estimator" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Estimatorer og punktestimat</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En estimator er en funksjon av utvalget som bestemmer en verdi
            («gjet») for en ukjent populasjonsparameter.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Vokabular:
  Parameter (populasjon):   μ, σ², p, β     (ukjent SANNHET)
  Estimator (av utvalget):  X̄, S², p̂, β̂      (tilfeldig variabel)
  Estimat (konkret tall):   x̄ = 12.4 mm     (én observert verdi)

Egenskaper:
  Forventningsrett (unbiased):  E[θ̂] = θ
    Vi treffer riktig I SNITT. Eksempel: X̄ er unbiased for μ.

  Konsistent:  θ̂ → θ når n → ∞
    Mer data gir bedre estimat.

  Minimum varians:  Av to unbiased estimatorer, foretrekker vi den
                    med minst Var(θ̂) (mest presis).

Punktestimat:  bare ett tall.
Intervallestimat: et intervall (CI) som med høy sannsynlighet
                  inneholder den sanne parameteren.`}</pre>
          </div>
        </section>

        <section id="ci-mu" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Konfidensintervall for μ</h2>
          <p className="text-sm text-muted-foreground mb-4">
            «Gi et 95 % CI for μ» betyr: et intervall konstruert slik at hvis vi
            gjentok eksperimentet uendelig mange ganger, ville 95 % av
            intervallene inneholde det sanne μ.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <h3 className="font-semibold text-sm mb-2">Tilfelle 1: σ kjent (eller n stor)</h3>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Bruk z (standardnormal). 95 % CI:

  CI = x̄ ± z_{α/2} · σ/√n
     = x̄ ± 1.96 · σ/√n        (α = 0.05, så z_{0.025} = 1.96)

Vanlige z-verdier:
  90 % CI:  z = 1.645
  95 % CI:  z = 1.960
  99 % CI:  z = 2.576

Eksempel: n=64, x̄=500g, σ=20g, 95 % CI.

  SE = σ/√n = 20/8 = 2.5
  CI = 500 ± 1.96 · 2.5 = 500 ± 4.9 = [495.1, 504.9]`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-sm mb-2">Tilfelle 2: σ ukjent (vanligste!)</h3>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Bruk t med v = n-1 frihetsgrader. 95 % CI:

  CI = x̄ ± t_{α/2, n-1} · s/√n

Eksempel: n=12, x̄=98.4, s=2.3, 95 % CI.

  v = 11
  t_{0.025, 11} = 2.201        (fra t-tabell)
  SE = s/√n = 2.3/√12 = 0.664
  CI = 98.4 ± 2.201 · 0.664 = 98.4 ± 1.46 = [96.94, 99.86]

Python:
  import scipy.stats as st
  t_crit = st.t.ppf(0.975, df=n-1)
  ci = (x_bar - t_crit*s/np.sqrt(n), x_bar + t_crit*s/np.sqrt(n))`}</pre>
          </div>
        </section>

        <section id="ci-p" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Konfidensintervall for andel p</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Estimat: p̂ = X/n   (X = antall suksesser i n forsøk)

CLT-basert CI (Wald):

  CI = p̂ ± z_{α/2} · √(p̂(1-p̂)/n)

Gyldighet: krever np̂ ≥ 5 og n(1-p̂) ≥ 5.

Eksempel: 200 spurte, 80 sa "ja". 95 % CI for andel?

  p̂ = 80/200 = 0.40
  SE = √(0.40 · 0.60 / 200) = √(0.0012) ≈ 0.0346
  CI = 0.40 ± 1.96 · 0.0346 = 0.40 ± 0.0679 = [0.332, 0.468]`}</pre>
          </div>
        </section>

        <section id="hypotese" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Hypotesetesting</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Strukturen er den samme uansett test:
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Strukturen — 6 steg:

  1. Formuler hypoteser:
       H₀: nullhypotese (det vi prøver å forkaste, eks. μ = 100)
       H₁: alternativhypotese (eks. μ ≠ 100, μ > 100, eller μ < 100)

  2. Velg signifikansnivå α:
       α = P(forkaste H₀ | H₀ er sann)         (Type I-feil)
       Vanlig: α = 0.05 (5 %).

  3. Bestem teststatistikk og dens fordeling under H₀:
       eks: z = (x̄ - μ₀) / (σ/√n) ~ N(0,1) under H₀.

  4. Regn ut teststatistikkens observerte verdi fra utvalget.

  5. Bestem kritiske verdier ELLER beregn p-verdi.

  6. Konklusjon:
       p < α  →  Forkast H₀
       p ≥ α  →  Behold H₀ (ikke nok bevis mot)

NB: "Behold H₀" betyr IKKE at H₀ er sann — bare at vi ikke kan
forkaste den med tilstrekkelig styrke.`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-sm mb-2">Type I og Type II feil</h3>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Sannhet
              │  H₀ sann       H₀ usann
─────────────┼────────────────────────
Forkast H₀   │  Type I (α)    KORREKT (1-β = "styrke")
Behold H₀    │  KORREKT       Type II (β)

α = P(forkaste H₀ | H₀ sann)    — vi "ser falskt alarm"
β = P(behold H₀ | H₀ usann)     — vi "misser virkelig effekt"

Trade-off: lavere α → høyere β (vanligvis).
Mer data (større n) reduserer BÅDE α og β.`}</pre>
          </div>
        </section>

        <section id="tester" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Konkrete tester</h2>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <h3 className="font-semibold text-sm mb-2">One-sample z-test (σ kjent)</h3>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`H₀: μ = μ₀     H₁: μ ≠ μ₀ (tosidig)  eller  μ > μ₀ (ensidig)

  z = (x̄ - μ₀) / (σ/√n)  ~ N(0,1) under H₀

Tosidig forkast: |z| > z_{α/2}   eller   p = 2·(1-Φ(|z|)) < α
Ensidig (>):     z > z_α          eller   p = 1-Φ(z) < α`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <h3 className="font-semibold text-sm mb-2">One-sample t-test (σ ukjent)</h3>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`H₀: μ = μ₀

  t = (x̄ - μ₀) / (s/√n)  ~ t_{n-1} under H₀

Eksempel: n=12, x̄=98.4, s=2.3, H₀: μ=100, α=0.05, tosidig.

  t_obs = (98.4 - 100) / (2.3/√12) = -1.6 / 0.664 = -2.41
  Kritisk: t_{0.025, 11} = 2.201
  |t_obs| = 2.41 > 2.201  →  FORKAST H₀

Python:
  t_stat, p_val = scipy.stats.ttest_1samp(data, popmean=100)`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <h3 className="font-semibold text-sm mb-2">Two-sample t-test</h3>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Sammenligne to grupper. H₀: μ₁ = μ₂.

  t = (x̄₁ - x̄₂) / √(s_p² · (1/n₁ + 1/n₂))

  s_p² = ((n₁-1)s₁² + (n₂-1)s₂²) / (n₁+n₂-2)    (pooled varians)
  v = n₁ + n₂ - 2 frihetsgrader

Hvis ikke lik varians: Welch's t-test (annen v-formel).

Python:
  t_stat, p_val = scipy.stats.ttest_ind(gruppe1, gruppe2,
                                         equal_var=False)  # Welch`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-sm mb-2">Kji-kvadrattest</h3>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Brukes til:
  (a) Tilpasningstest: passer observert frekvens med forventet?
  (b) Uavhengighetstest: er to kategoriske variabler uavhengige?

  χ² = Σ (Oᵢ - Eᵢ)² / Eᵢ

  Oᵢ = observert frekvens i celle i
  Eᵢ = forventet frekvens under H₀

For en r×c kontingenstabell:
  Eᵢⱼ = (rad_total · kolonne_total) / total_n
  v = (r-1)(c-1)

Forkast H₀ hvis  χ² > χ²_{α, v}

Python:  scipy.stats.chi2_contingency(observert_tabell)`}</pre>
          </div>
        </section>

        <section id="korrelasjon" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Korrelasjon (Pearson r)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Måler LINEÆR sammenheng mellom to variabler X og Y.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Definisjon:

  r = Σ (xᵢ - x̄)(yᵢ - ȳ) / √(Σ (xᵢ - x̄)² · Σ (yᵢ - ȳ)²)

Verdier:
  r = +1   perfekt positiv lineær sammenheng
  r =  0   ingen LINEÆR sammenheng (kan likevel være ikke-lineær!)
  r = -1   perfekt negativ lineær sammenheng

Tommelfingerregel for tolkning:
  |r| ≥ 0.9   svært sterk
  |r| ≥ 0.7   sterk
  |r| ≥ 0.4   moderat
  |r| < 0.4   svak

VIKTIG: Korrelasjon ≠ kausalitet. Sjokoladekonsum og Nobelpriser
korrelerer høyt på landnivå, men det ene forårsaker ikke det andre.

Python:  r, p = scipy.stats.pearsonr(x, y)`}</pre>
          </div>
        </section>

        <section id="regresjon" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Lineær regresjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Modellér Y som en lineær funksjon av X.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Modell:
  Y = β₀ + β₁ · X + ε        ε ~ N(0, σ²)

Minste kvadraters metode — finn β₀, β₁ som minimerer:
  RSS = Σ (yᵢ - (β₀ + β₁ xᵢ))²

Løsninger:
  β̂₁ = Σ (xᵢ - x̄)(yᵢ - ȳ) / Σ (xᵢ - x̄)²
     = r · (s_y / s_x)

  β̂₀ = ȳ - β̂₁ · x̄

Bestemmelseskoeffisient:
  R² = 1 - SS_res / SS_tot
     = r²       (i enkel lineær regresjon)

  R² ∈ [0, 1]: andel av variasjonen i Y som forklares av X.

Residual e_i = y_i - ŷ_i. Sjekk residual-plot:
  - Uten mønster → modellen passer
  - Trakt-form  → heteroskedastisitet (varians varierer med X)
  - Krumning    → ikke-lineær sammenheng — prøv polynomisk

Python:  scipy.stats.linregress(x, y)
         → slope, intercept, rvalue, pvalue, stderr`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempel — bygging
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`X = "antall etasjer", Y = "byggetid i måneder"

n=5: (3, 6), (5, 9), (7, 14), (9, 17), (11, 22)

  x̄ = 7,    ȳ = 13.6
  Σ(x-x̄)(y-ȳ) = (−4)(−7.6) + (−2)(−4.6) + 0·0.4 + 2·3.4 + 4·8.4
              = 30.4 + 9.2 + 0 + 6.8 + 33.6 = 80
  Σ(x-x̄)² = 16+4+0+4+16 = 40

  β̂₁ = 80/40 = 2.0
  β̂₀ = 13.6 - 2.0·7 = -0.4

Modell:  ŷ = -0.4 + 2.0 · x

Tolkning: hver ekstra etasje gir ~2 mnd ekstra byggetid.
Prediksjon for 8 etasjer: ŷ = -0.4 + 16 = 15.6 mnd.`}</pre>
          </div>
        </section>

        <section id="eksamen" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Eksamen-typiske oppgaver</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border bg-card p-4">
              <strong>Oppgave A:</strong> «Konstruér 95 % CI for μ». Steg: identifisér
              om σ er kjent. Hvis ja: bruk z. Hvis nei: bruk t med n-1
              frihetsgrader. Skriv ut formelen, regn ut, oppgi intervallet.
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <strong>Oppgave B:</strong> «Test om μ er lik X med α = 0.05». Sett opp
              H₀ og H₁, regn ut teststatistikk, sammenlign med kritisk verdi, gi
              konklusjon på norsk.
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <strong>Oppgave C:</strong> «Beregn korrelasjon og regresjonslinje». Lag
              tabell med (xᵢ-x̄), (yᵢ-ȳ), produktene og kvadratene. Sett inn i
              formel. Tegn linja over scatter-plottet.
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <strong>Oppgave D:</strong> «Test om to kategoriske variabler er
              uavhengige». Sett opp kontingenstabell, regn forventede verdier,
              bruk kji-kvadrat-formelen, sammenlign med kritisk χ²-verdi.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Felle:</strong> p-verdi {">"} 0.05 betyr IKKE at H₀ er sann.
              Det betyr at vi ikke har nok bevis til å forkaste den. Stor n + lite
              avvik kan likevel gi p {"<"} 0.05 selv om effekten er praktisk
              ubetydelig.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Felle:</strong> R² = 0 betyr at den LINEÆRE modellen ikke
              forklarer noe — men det kan likevel være en sterk ikke-lineær
              sammenheng. Sjekk residual-plot.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Felle:</strong> CI tolket feil. «95 % CI = [10, 14]» betyr
              IKKE at μ ligger i [10, 14] med 95 % sannsynlighet — μ er fast.
              Det betyr at PROSEDYREN gir et intervall som fanger μ i 95 % av
              forsøkene.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Du er ferdig — neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>{" "}
              under «Statistisk analyse» — CI-formel-fyll, hypotesetest-
              rekkefølge, regresjon-quizzer.
            </li>
            <li>
              <Link to="/python" className="text-brand hover:underline">
                Python-øvelser
              </Link>{" "}
              — kjør hele eksamen-pakka:{" "}
              <code className="text-xs">scipy.stats.ttest_1samp</code>,{" "}
              <code className="text-xs">linregress</code>,{" "}
              <code className="text-xs">chi2_contingency</code>.
            </li>
            <li>
              Tilbake til{" "}
              <Link
                to="/stack/$slug"
                params={{ slug: "tek-1501" }}
                className="text-brand hover:underline"
              >
                TEK-1501-huben
              </Link>{" "}
              for full kart-oversikt og eksamen-strategi.
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
