import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { ProbabilityVisualizer } from "./ProbabilityVisualizer";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";

const STEPS = [
  { title: "Interaktiv visualisering — tre, Venn, Monty Hall, bursdag, Bayes", anchor: "visualisering" },
  { title: "Utfallsrom, hendelser, sannsynlighets-aksiomer", anchor: "aksiomer" },
  { title: "Betinget sannsynlighet og Bayes' teorem", anchor: "bayes" },
  { title: "Stokastiske variabler, forventning, varians", anchor: "variabler" },
  { title: "Vanlige fordelinger — Bernoulli, binomial, normal, Poisson", anchor: "fordelinger" },
  { title: "Sentralgrenseteoremet (CLT)", anchor: "clt" },
  { title: "Konfidensintervaller og p-verdier — intro", anchor: "konfidens" },
  { title: "Hypotesetesting — grunnleggende", anchor: "hypotese" },
];

export function SannsynlighetPage() {
  return (
    <StackPageShell title="Sannsynlighet og statistikk" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Fase 0 · Math foundations
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Sannsynlighet og statistikk — tallfeste usikkerhet
          </h1>
          <p className="mt-3 text-muted-foreground">
            Hele ML-pensumet hviler på sannsynlighetsteori. Bayes-tankegang,
            forventning, fordelinger, og — viktigst — hvordan trekke konklusjoner
            fra utvalg. Stanford CS 109 i komprimert form.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Math foundations» — Bayes-regning, fordelings-matching,
              forventning og hypotesetest.
            </div>
          </div>
        </div>

        <CourseOutline courseId="sannsynlighet" steps={STEPS} />

        <section id="visualisering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            0. Interaktiv visualisering — fem klassikere
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Før vi formaliserer aksiomene: lek med trærne, sett-diagrammene og
            simuleringene. Hver modus har en kort intuisjon-rute som forklarer
            hvorfor svaret pleier overraske.
          </p>
          <ProbabilityVisualizer />
        </section>

        <section id="aksiomer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Utfallsrom og aksiomer</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En sannsynlighet er et tall mellom 0 og 1 som måler hvor sikkert noe er.
            All teorien hviler på tre aksiomer (Kolmogorov, 1933).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Vokabular:
  Ω (omega)      = utfallsrom (alle mulige utfall)
  ω ∈ Ω          = ett enkelt utfall
  A ⊆ Ω          = hendelse (delmengde av utfallsrommet)
  P(A)           = sannsynlighet for A

Aksiomer:
  1. 0 ≤ P(A) ≤ 1                 ← grenser
  2. P(Ω) = 1                     ← noe må skje
  3. P(A ∪ B) = P(A) + P(B)
     hvis A ∩ B = ∅               ← additivitet for disjunkte

Konsekvenser:
  P(∅) = 0
  P(Aᶜ) = 1 - P(A)                ← komplement
  P(A ∪ B) = P(A) + P(B) - P(A ∩ B)`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempel — kort fra kortstokk
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Ω = de 52 kortene
A = "kortet er hjerter"        → |A| = 13,  P(A) = 13/52 = 1/4
B = "kortet er en konge"        → |B| = 4,   P(B) = 4/52 = 1/13
A ∩ B = "hjerter-konge"         → |A∩B| = 1, P(A∩B) = 1/52

P(A ∪ B) = 1/4 + 1/13 - 1/52 = 16/52 = 4/13`}</pre>
          </div>
        </section>

        <section id="bayes" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Betinget sannsynlighet og Bayes</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>P(A | B)</code> = sannsynligheten for A, gitt at B har inntruffet.
            Bayes' teorem snur dette: gitt at A inntraff, hva sier det om B?
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Definisjon:
  P(A | B) = P(A ∩ B) / P(B)        (krever P(B) > 0)

Omarrangert (multiplikasjonsregelen):
  P(A ∩ B) = P(A | B) · P(B)
           = P(B | A) · P(A)

Bayes' teorem:
  P(A | B) = P(B | A) · P(A) / P(B)

  ┌────────────┬───────────────┬─────────────┐
  │ posterior  │  likelihood   │   prior     │
  │  P(A|B)    │   P(B|A)      │   P(A)      │
  └────────────┴───────────────┴─────────────┘
                  delt på P(B) (evidence)`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Klassisk eksempel — medisinsk test
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Sykdom S forekommer hos 1% av befolkningen: P(S) = 0.01
Test T er 99% sensitiv:   P(T+ | S)  = 0.99
Test T er 95% spesifikk:  P(T- | ¬S) = 0.95, så P(T+ | ¬S) = 0.05

Spørsmål: pasient tester POSITIVT. Hva er P(S | T+)?

  P(T+) = P(T+|S)·P(S) + P(T+|¬S)·P(¬S)
        = 0.99 · 0.01 + 0.05 · 0.99
        = 0.0099 + 0.0495 = 0.0594

  P(S | T+) = P(T+|S)·P(S) / P(T+)
            = 0.0099 / 0.0594
            ≈ 0.167  ← bare 16.7 %!`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Intuisjon:</strong> selv en god test kan gi mange falske positive
            hvis grunnsannsynligheten (prior) er lav. Dette er det viktigste resultatet
            i kurset — det former all ML-tankegang.
          </p>
        </section>

        <section id="variabler" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Stokastiske variabler</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En stokastisk variabel <code>X</code> er en funksjon som tilordner et tall
            til hvert utfall i Ω. To viktige tall: forventning og varians.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Forventning (mean, "tyngdepunkt"):
  E[X] = Σ x · P(X = x)        (diskret)
  E[X] = ∫ x · f(x) dx          (kontinuerlig)

Varians ("spredning"):
  Var(X) = E[(X - μ)²]
         = E[X²] - (E[X])²
  σ = √Var(X)                  ← standardavvik

Regneregler:
  E[aX + b] = a·E[X] + b
  E[X + Y]  = E[X] + E[Y]      (alltid)
  Var(aX + b) = a²·Var(X)
  Var(X + Y) = Var(X) + Var(Y) hvis X, Y uavhengige`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempel — en terningkast
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`X = utfallet på en rettferdig terning,  P(X=k) = 1/6 for k = 1..6

E[X]  = (1+2+3+4+5+6)/6 = 21/6 = 3.5

E[X²] = (1+4+9+16+25+36)/6 = 91/6 ≈ 15.17
Var(X) = E[X²] - E[X]² = 15.17 - 12.25 = 2.92
σ     ≈ 1.71`}</pre>
          </div>
        </section>

        <section id="fordelinger" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Vanlige fordelinger</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Disse fire dukker opp i nesten alt: ML, A/B-tester, kø-teori, fysikk.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Bernoulli(p) — én myntkast med suksesssannsynlighet p
  P(X=1) = p,  P(X=0) = 1-p
  E[X] = p,    Var(X) = p(1-p)
  Brukes: ett ja/nei-utfall.

Binomial(n, p) — antall suksesser i n uavhengige Bernoulli-forsøk
  P(X=k) = C(n,k) · p^k · (1-p)^(n-k)
  E[X] = np,   Var(X) = np(1-p)
  Brukes: «hvor mange klikk av 1000 visninger?»

Normal(μ, σ²) — kontinuerlig, klokkekurve
  f(x) = 1/(σ√(2π)) · exp(-(x-μ)²/(2σ²))
  E[X] = μ,    Var(X) = σ²
  68% innen ±σ,  95% innen ±2σ,  99.7% innen ±3σ
  Brukes: målefeil, summen av mange små bidrag (CLT).

Poisson(λ) — antall hendelser i et fast intervall
  P(X=k) = e^(-λ) · λ^k / k!
  E[X] = λ,   Var(X) = λ
  Brukes: kunde-ankomster, e-poster i timen, server-feil.`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Velg riktig fordeling — beslutningstre
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Spørsmål               Diskret / kontinuerlig?    Fordeling
─────────────────────────────────────────────────────────────────
"Et ja/nei-utfall"      diskret                    Bernoulli(p)
"Antall suksesser
 av n forsøk"           diskret, bundet            Binomial(n, p)
"Antall hendelser
 per tidsenhet"         diskret, ubundet           Poisson(λ)
"Måling av høyde,
 vekt, feil"            kontinuerlig               Normal(μ, σ²)`}</pre>
          </div>
        </section>

        <section id="clt" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Sentralgrenseteoremet (CLT)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hvorfor er normalfordelingen ALLE STEDER? Fordi gjennomsnittet av mange
            uavhengige stokastiske variabler nærmer seg normal — UANSETT hvilken
            fordeling de selv har.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Anta X₁, X₂, ..., Xₙ er uavhengige, identisk fordelte
med E[Xᵢ] = μ og Var(Xᵢ) = σ² < ∞.

Da, for stor n:

  X̄ = (X₁ + ... + Xₙ) / n  ≈  Normal(μ, σ²/n)

  Eller standardisert:
  (X̄ - μ) / (σ/√n)  →  Normal(0, 1)`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Hvorfor det betyr noe
            </div>
            <ul className="space-y-1.5 text-sm text-foreground list-disc pl-5">
              <li>
                Gjennomsnitt fra utvalg er omtrent normalfordelt — derfor virker
                konfidensintervaller selv om populasjonen ikke er normal.
              </li>
              <li>
                «Mange små feilkilder summerer seg» → totalfeilen er normalfordelt.
                Derfor er <em>normal</em> standardvalget i lineær regresjon.
              </li>
              <li>
                Spredningen krymper med √n: dobler vi utvalget, halverer vi ikke
                standardfeilen — vi reduserer den med faktor √2 ≈ 1.41.
              </li>
            </ul>
          </div>
        </section>

        <section id="konfidens" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Konfidensintervall og p-verdier</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Statistisk inferens er kunsten å si noe om populasjonen ut fra et utvalg.
            To verktøy dominerer.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`95 % konfidensintervall for et gjennomsnitt:

  X̄ ± 1.96 · σ/√n          (når σ er kjent)
  X̄ ± t · s/√n              (når σ er ukjent, t-fordeling)

Tolkning (frequentist):
  «Hvis vi gjentar eksperimentet mange ganger,
   vil 95 % av intervallene inneholde det ekte μ.»

NB: det er IKKE «95 % sannsynlig at μ ligger i dette intervallet».
    For den tolkningen trenger du Bayesiansk analyse.

P-verdi:
  Sannsynligheten for å observere data minst SÅ ekstrem som vår,
  GITT at nullhypotesen er sann.

  p < 0.05  →  «statistisk signifikant»  (konvensjon)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Felle:</strong> p-verdi er IKKE sannsynligheten for at H₀ er sann. Det er
            sannsynligheten for dataen vår, gitt H₀.
          </p>
        </section>

        <section id="hypotese" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Hypotesetesting</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Standardprosedyren for å avgjøre om en effekt er ekte.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Stegene:
  1. Formuler H₀ (nullhypotesen)  — typisk: «ingen effekt»
                 H₁ (alternativ)  — «det er en effekt»
  2. Velg signifikansnivå α       — typisk 0.05
  3. Beregn teststatistikk        — f.eks. (X̄ - μ₀)/(σ/√n)
  4. Beregn p-verdi
  5. Hvis p < α → forkast H₀.
     Ellers → behold H₀ (ikke «bevis at H₀»).

To feilmoduser:
  Type I — forkast H₀ når H₀ er sann          (sannsynlighet = α)
  Type II — behold H₀ når H₁ er sann          (sannsynlighet = β)
  Power  = 1 - β  («sjansen for å oppdage en ekte effekt»)`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempel — A/B-test
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Variant A: 1000 brukere, 53 kjøper      → konvertering 5.3 %
Variant B: 1000 brukere, 65 kjøper      → konvertering 6.5 %

H₀: ingen forskjell (pₐ = pᵦ)
H₁: forskjell finnes

Z-test for proporsjoner gir p ≈ 0.20.
p > 0.05  →  vi kan IKKE forkaste H₀.
1.2 prosentpoeng kan være ren tilfeldighet på dette utvalget.

Lærdom: kjør lenger eller bruk større utvalg.`}</pre>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : Bayes-utregning, fordelings-matching, forventning, hypotesetest.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "bayes" }} className="text-brand hover:underline">
                Bayes-trinnet i DTE-2501
              </Link>
              : naive Bayes-klassifikator bygger direkte på dette.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "ml-grunnlag" }} className="text-brand hover:underline">
                ML-grunnlag
              </Link>
              : statistikk-tankegangen er rammen rundt all ML-evaluering.
            </li>
          </ul>
        </div>
        <RelatedVisualizers slug="bayes-grid" />
      </div>
    </StackPageShell>
  );
}
