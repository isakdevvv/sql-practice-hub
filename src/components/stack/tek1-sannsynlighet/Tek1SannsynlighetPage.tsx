import { Link } from "@tanstack/react-router";
import {Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { ProbabilityTreeDiagram } from "./ProbabilityTreeDiagram";
import { BayesUpdater } from "./BayesUpdater";
import { MontyHallSimulator } from "./MontyHallSimulator";
import { ConditionalProbabilityGrid } from "./ConditionalProbabilityGrid";
import { ProbabilityQuiz } from "./ProbabilityQuiz";

const STEPS = [
  { title: "Hvorfor sannsynlighet?", anchor: "motivasjon" },
  { title: "Utfallsrom, hendelser, mengdelære", anchor: "utfallsrom" },
  { title: "Kolmogorovs aksiomer", anchor: "aksiomer" },
  { title: "Betinget sannsynlighet og uavhengighet", anchor: "betinget" },
  { title: "Interaktivt: betinget sannsynlighet i 100-grid", anchor: "viz-grid" },
  { title: "Bayes' teorem — full walkthrough", anchor: "bayes" },
  { title: "Interaktivt: Bayes-oppdaterer", anchor: "viz-bayes" },
  { title: "Interaktivt: tre-diagram med presets", anchor: "viz-tre" },
  { title: "Interaktivt: Monty Hall-simulator", anchor: "viz-monty" },
  { title: "Kombinatorikk — telle muligheter", anchor: "kombinatorikk" },
  { title: "Trekninger med/uten tilbakelegging", anchor: "trekning" },
  { title: "Eksamen-feller", anchor: "feller" },
  { title: "Quiz: 10 scenarier (klassiske og kontraintuitive)", anchor: "quiz" },
];

export function Tek1SannsynlighetPage() {
  return (
    <StackPageShell
      title="Modul 2 — Sannsynlighet og kombinatorikk"
      group="eksamen"
    >
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            TEK-1501 · Modul 2 av 4 · Eksamen-tyngdepunkt
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Sannsynlighet — kvantifisér usikkerheten
          </h1>
          <p className="mt-3 text-muted-foreground">
            En sannsynlighet er et tall mellom 0 og 1 som måler hvor sikkert noe
            er. Alt annet i kurset hviler på dette. Vi bygger fra utfallsrom og
            mengdelære → aksiomer → betinget sannsynlighet → Bayes → telleregler
            (kombinatorikk). Hver eksamen har minst én Bayes-oppgave og minst én
            kombinatorikk-oppgave.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              under «Sannsynlighet & kombinatorikk» — Bayes-regning,
              mengdelære, og permutasjons-/kombinasjons-tellinger.
            </div>
          </div>
        </div>

        <CourseOutline courseId="tek1-sannsynlighet" steps={STEPS} />

        <section id="motivasjon" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor sannsynlighet?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Et fly har 2 motorer. Hver motor har 0.1 % sannsynlighet for å feile
            pr. flytur. Hva er sannsynligheten for at flyet faller ned (begge
            motorer feiler)? Hva med 4 motorer? Dette krever sannsynlighet —
            magefølelse holder ikke. Ingeniør-praksis: kvalitetskontroll,
            risiko-vurdering, pålitelighetsanalyse, signal/støy.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5 text-sm">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Sentral idé
            </div>
            Sannsynlighet er ikke alltid intuisjon. Vi trenger formelle regler
            (aksiomer) som garanterer at hverandre selvmotsigende svar er
            umulige. Pluss telleregler som skalerer til problemer der enumerering
            er upraktisk.
          </div>
        </section>

        <section id="utfallsrom" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Utfallsrom, hendelser, mengdelære</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Vokabularet du må eie:
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Ω (omega)       = utfallsrom — mengden av ALLE mulige utfall
ω ∈ Ω           = ett enkelt utfall (elementært utfall)
A, B, C ⊆ Ω     = hendelser (delmengder av Ω)
P(A)            = sannsynligheten for A
∅               = den tomme hendelsen (umulig)

Mengde-operasjoner:
  A ∪ B    = unionen ("A eller B eller begge")
  A ∩ B    = snittet ("A OG B samtidig")
  Aᶜ       = komplementet ("ikke A")
  A \\ B   = differansen ("A men ikke B")
  A ⊆ B    = inkludering ("alle utfall i A er også i B")

Disjunkte (gjensidig utelukkende):
  A ∩ B = ∅  →  A og B kan ikke skje samtidig

Partisjon:
  A₁, A₂, ..., Aₙ er en partisjon av Ω hvis de er parvis
  disjunkte OG deres union er Ω. Hvert utfall havner i
  nøyaktig én del.`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempel — terningkast
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Ω = {1, 2, 3, 4, 5, 6}        (6 like sannsynlige utfall)
A = "partall"     = {2, 4, 6}, |A| = 3, P(A) = 3/6 = 1/2
B = "minst 5"     = {5, 6},    |B| = 2, P(B) = 2/6 = 1/3
A ∩ B = {6},                  P(A∩B) = 1/6
A ∪ B = {2, 4, 5, 6},         P(A∪B) = 4/6 = 2/3
Aᶜ = "oddetall"   = {1, 3, 5}, P(Aᶜ) = 1/2`}</pre>
          </div>
        </section>

        <section id="aksiomer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Kolmogorovs aksiomer</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tre regler. All sannsynlighetsteori bygges fra disse.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`A1.  0 ≤ P(A) ≤ 1               ← sannsynligheter er tall i [0,1]
A2.  P(Ω) = 1                   ← noe må skje
A3.  P(A ∪ B) = P(A) + P(B)
     hvis A ∩ B = ∅              ← additivitet for disjunkte hendelser

Følger:
  P(∅) = 0
  P(Aᶜ) = 1 - P(A)               ← komplementregelen (mye brukt!)
  P(A ∪ B) = P(A) + P(B) - P(A ∩ B)   ← inklusjon-eksklusjon
  Hvis A ⊆ B, så P(A) ≤ P(B)`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Komplementregelen er gull
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Spørsmål: "Sannsynligheten for MINST én feil i 100 forsøk når
hver har P(feil) = 0.01?"

Direkte: P(1 feil) + P(2 feil) + ... + P(100 feil) — håpløst.

Komplement: P(minst én feil) = 1 - P(ingen feil)
                              = 1 - (0.99)¹⁰⁰
                              ≈ 1 - 0.366
                              ≈ 0.634   ← 63.4 %!`}</pre>
          </div>
        </section>

        <section id="betinget" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Betinget sannsynlighet og uavhengighet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            P(A | B) = sannsynligheten for A, gitt at B har skjedd.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Definisjon:
  P(A | B) = P(A ∩ B) / P(B)        (krever P(B) > 0)

Multiplikasjonsregelen (omarrangert):
  P(A ∩ B) = P(A | B) · P(B)
           = P(B | A) · P(A)         (begge utlrykk gjelder)

Uavhengighet:
  A og B er UAVHENGIGE  ⇔  P(A ∩ B) = P(A) · P(B)
  Ekvivalent:           ⇔  P(A | B) = P(A)
                        ⇔  P(B | A) = P(B)

Total sannsynlighet (når B₁..Bₙ er en partisjon av Ω):
  P(A) = Σᵢ P(A | Bᵢ) · P(Bᵢ)`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong>Pass på:</strong> «disjunkte» og «uavhengige» er IKKE det
            samme. Hvis A og B er disjunkte og begge har P {">"} 0, så er de
            <em> nødvendigvis avhengige</em> — hvis B har skjedd, vet vi at A
            ikke kan ha skjedd.
          </div>
        </section>

        <section id="viz-grid" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            4b. Interaktivt — betinget sannsynlighet i 100-grid
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            100 farger-firkanter = 100 individer fra en populasjon. Hver
            har to binære attributter (A og B). Tellingene gir deg P(A),
            P(B), P(A∩B), P(A|B) og P(B|A) direkte. Veksle preset for å se
            sterk korrelasjon (røyking-kreft), svak korrelasjon (vaksine),
            og uavhengighet (kontroll).
          </p>
          <ConditionalProbabilityGrid />
        </section>

        <section id="bayes" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Bayes' teorem</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Snur betingingen. Du har P(B | A) — du vil ha P(A | B). Bayes
            bygger en bro.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Bayes' teorem:

              P(B | A) · P(A)
  P(A | B) = ─────────────────
                  P(B)

Med en partisjon A, Aᶜ:

              P(B | A) · P(A)
  P(A | B) = ──────────────────────────────────────
              P(B | A) · P(A) + P(B | Aᶜ) · P(Aᶜ)

Navn på leddene:
  P(A | B)   = posterior     (hva vi lærer)
  P(B | A)   = likelihood    (data gitt hypotesen)
  P(A)       = prior         (hva vi visste på forhånd)
  P(B)       = evidence      (normaliseringskonstant)`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Klassisk eksamen-oppgave: medisinsk test
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Sykdom S forekommer hos 1 % av befolkningen:  P(S) = 0.01
Test T er 99 % sensitiv:                       P(T+ | S)  = 0.99
Test T er 95 % spesifikk:                      P(T- | ¬S) = 0.95
                                              → P(T+ | ¬S) = 0.05

Pasient tester POSITIVT. Hva er P(S | T+)?

Steg 1 — total P(T+):
  P(T+) = P(T+|S)·P(S) + P(T+|¬S)·P(¬S)
        = 0.99 · 0.01 + 0.05 · 0.99
        = 0.0099 + 0.0495
        = 0.0594

Steg 2 — Bayes:
  P(S | T+) = P(T+|S) · P(S) / P(T+)
            = 0.0099 / 0.0594
            ≈ 0.167   ← 16.7 %

Intuisjon: tross "99 % sensitiv" test, en positiv prøve betyr bare
16.7 % sjanse for sykdom. Fordi grunnsannsynligheten (prior) er lav.`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Oppskrift for Bayes-oppgaver
            </div>
            <ol className="text-sm space-y-1.5 list-decimal pl-5">
              <li>
                Identifisér A (det du vil vite) og B (det du har observert).
              </li>
              <li>Skriv ned P(A), P(Aᶜ), P(B|A), P(B|Aᶜ).</li>
              <li>Beregn P(B) med total sannsynlighet.</li>
              <li>Sett inn i Bayes-formelen.</li>
              <li>Sanity-sjekk: er svaret mellom 0 og 1?</li>
            </ol>
          </div>
        </section>

        <section id="viz-bayes" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            5b. Interaktivt — Bayes-oppdaterer (positiv prediktiv verdi)
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Skyv prevalens, sensitivitet og spesifisitet. P(D|+) — det vi
            virkelig vil vite — oppdateres live. Skru på «1000-personer»
            for å se hvorfor svaret blir så mye lavere enn du tror.
            «To uavhengige tester» viser hvordan konfidensen klatrer når
            samme prøve gjentas.
          </p>
          <BayesUpdater />
        </section>

        <section id="viz-tre" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            5c. Interaktivt — tre-diagram for hierarkiske sannsynligheter
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Sannsynligheter multipliseres langs grener; blader summerer til
            1. Velg en preset (medisinsk test, kortstokk, Monty Hall, fødsel)
            og justér grenene med slidersene. Søsken-summen viser om en
            gruppe er gyldig (Σ = 1) eller har en glemt utfall (rødt).
          </p>
          <ProbabilityTreeDiagram />
        </section>

        <section id="viz-monty" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            5d. Interaktivt — Monty Hall-simulator
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Bytter du dør eller beholder du? Sannsynlighetstreet viser at
            BYTTE vinner i (n−1)/n av tilfellene. Monte Carlo med 10 000
            runder bekrefter resultatet, og 100-dørers-varianten gjør
            intuisjonen brennende klar.
          </p>
          <MontyHallSimulator />
        </section>

        <section id="kombinatorikk" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Kombinatorikk — telleregler</h2>
          <p className="text-sm text-muted-foreground mb-4">
            For å regne ut sannsynlighet med likestilte utfall trenger vi å
            telle: hvor mange muligheter er det? Tre formler dekker det meste.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Multiplikasjonsprinsippet:
  Hvis du har k valg etter hverandre, der valg i kan tas på nᵢ måter,
  så er antall sekvenser:  n₁ · n₂ · ... · nₖ.

  Eks: 3 forretter, 4 hovedretter, 2 desserter → 3·4·2 = 24 menyer.

Permutasjoner (RANGERING — rekkefølge teller):
  P(n, k) = n · (n-1) · (n-2) · ... · (n-k+1)
          = n! / (n-k)!

  "Hvor mange måter kan vi velge k av n der rekkefølgen teller?"

  Spesialtilfelle: alle n med ulik plass → n!

  Eks: 8 løpere, hvor mange ulike topp-3-rekkefølger?
       P(8, 3) = 8 · 7 · 6 = 336

Kombinasjoner (UTVALG — rekkefølge teller IKKE):
  C(n, k) = (n velg k) = n! / (k! · (n-k)!)

  "Hvor mange måter kan vi velge k av n der rekkefølgen IKKE teller?"

  Eks: 8 personer, velg ut 3 til en gruppe.
       C(8, 3) = 56`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Permutasjon eller kombinasjon — hvordan velge?
            </div>
            <ul className="text-sm space-y-1.5 list-disc pl-5 text-muted-foreground">
              <li>
                «Pall (1.,2.,3.)», «kode», «rangering», «rekkefølge teller» →{" "}
                <strong>permutasjon</strong>
              </li>
              <li>
                «Trekke en komité», «lottokupong», «utvalg uten rekkefølge» →{" "}
                <strong>kombinasjon</strong>
              </li>
              <li>
                Hvis du er i tvil: <strong>kombinasjon-først</strong>, så ganger
                med antall rekkefølger om nødvendig.
              </li>
            </ul>
          </div>
        </section>

        <section id="trekning" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Trekninger med og uten tilbakelegging</h2>
          <p className="text-sm text-muted-foreground mb-4">
            To grunnleggende modeller — eksamen-relevant for å velge riktig
            fordeling i Modul 3.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Med tilbakelegging (independent draws):
  Hvert trekk har samme P. Trekkene er uavhengige.
  → Binomisk fordeling (Modul 3).

Uten tilbakelegging:
  P endrer seg fra trekk til trekk. Avhengige trekk.
  → Hypergeometrisk fordeling (Modul 3).

Konkret: 20 enheter, 5 defekte. Trekk 3 enheter, P(alle defekte)?

  Uten tilbakelegging:
    P = (5/20) · (4/19) · (3/18) = 60/6840 ≈ 0.00877

  Med tilbakelegging:
    P = (5/20)³ = (0.25)³ = 0.015625`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Lotto-eksempel: norsk Lotto (7 av 34)
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Du krysser av 7 tall. Trekkes 7 tall uten tilbakelegging.
Hva er sannsynligheten for 7 rette?

  Antall mulige trekninger    = C(34, 7) = 5 379 616
  Antall vinnertrekninger     = 1 (din kupong)
  P(7 rette) = 1 / 5 379 616 ≈ 1.86 · 10⁻⁷

Hva med 6 rette (av 7 mulige rette)?
  Antall måter å treffe 6 av dine 7  = C(7, 6) = 7
  Antall måter å bomme på 1 av 27 andre = C(27, 1) = 27
  Gunstige = 7 · 27 = 189
  P(6 rette) = 189 / 5 379 616 ≈ 3.51 · 10⁻⁵`}</pre>
          </div>
        </section>

        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Eksamen-feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Disjunkt ≠ uavhengig.</strong> «Det regner» og «det er
              tørt» er DISJUNKTE, ikke uavhengige. Klassisk fallgruve.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Forveksle P(A|B) og P(B|A).</strong> «99 % av syke tester
              positivt» (sensitivity) er ikke det samme som «99 % av positive er
              syke» (precision). Bayes er nødvendig for å snu.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Inklusjon-eksklusjon glemt.</strong>{" "}
              <code className="text-xs">P(A∪B) = P(A) + P(B) − P(A∩B)</code>.
              Glemmer du å trekke fra snittet for overlappende hendelser, blir
              svaret for stort.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Tilbakelegging eller ikke.</strong> Les oppgaven nøye. «Tar
              ut 3 kuler ETTER HVERANDRE» er typisk uten tilbakelegging. «Kaster
              en mynt 3 ganger» er alltid uavhengige trekninger.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Permutasjon vs kombinasjon.</strong> Spør deg selv:
              «Spiller rekkefølgen rolle for problemet?» Hvis ja → permutasjon.
              Hvis nei → kombinasjon.
            </div>
          </div>
        </section>

        <section id="quiz" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            9. Quiz — 10 scenarier (klassiske og kontraintuitive)
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Eksamen-relevant blanding: komplement, inklusjon-eksklusjon, Bayes
            med høy og lav prevalens, Boy-Boy-paradokset, taxi-problemet,
            bursdag-paradokset, og forskjellen mellom permutasjon/kombinasjon
            og trekninger med/uten tilbakelegging. Hvert spørsmål gir
            full forklaring etter svar.
          </p>
          <ProbabilityQuiz />
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>{" "}
              under «Sannsynlighet & kombinatorikk» — Bayes-quiz,
              mengdelære-match og kombinatorikk-fill.
            </li>
            <li>
              <Link to="/python" className="text-brand hover:underline">
                Python-øvelser
              </Link>{" "}
              — verifisér Bayes-utregning og kombinatorikk med
              <code className="ml-1 text-xs">scipy.special.comb</code>.
            </li>
            <li>
              Neste modul:{" "}
              <Link
                to="/stack/$slug"
                params={{ slug: "tek1-fordelinger" }}
                className="text-brand hover:underline"
              >
                Sannsynlighetsfordelinger
              </Link>{" "}
              — fra enkelthendelser til generelle modeller.
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
