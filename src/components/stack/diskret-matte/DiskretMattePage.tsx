import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb, AlertTriangle, CheckCircle2 } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { TruthTableBuilder } from "./figures/TruthTableBuilder";
import { VennSandbox } from "./figures/VennSandbox";
import { FunctionTypeVis } from "./figures/FunctionTypeVis";
import { ChooseKExplorer } from "./figures/ChooseKExplorer";
import { PascalTriangle } from "./figures/PascalTriangle";
import { InductionDominoes } from "./figures/InductionDominoes";
import { GraphSandbox } from "./figures/GraphSandbox";
import { ModClock } from "./figures/ModClock";

const STEPS = [
  { title: "Propositional logic — sannhetsverdier og konnektiver", anchor: "logikk" },
  { title: "Bevis-strategier (direkte, kontrapositiv, motsigelse)", anchor: "bevis" },
  { title: "Mengder — union, snitt, differanse, delmengde", anchor: "mengder" },
  { title: "Funksjoner og relasjoner — injektiv, surjektiv, bijektiv", anchor: "funksjoner" },
  { title: "Kombinatorikk — permutasjoner og kombinasjoner", anchor: "kombinatorikk" },
  { title: "Matematisk induksjon", anchor: "induksjon" },
  { title: "Grafer — noder, kanter, stier, trær", anchor: "grafer" },
  { title: "Modulær aritmetikk — mod, kongruens, hashing", anchor: "mod" },
  { title: "Oppsummering og neste steg", anchor: "oppsummering" },
];

export function DiskretMattePage() {
  return (
    <StackPageShell title="Diskret matematikk" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Fase 0 · Math foundations
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Diskret matematikk — språket bak algoritmer
          </h1>
          <p className="mt-3 text-muted-foreground">
            Tellbare strukturer: utsagn, mengder, grafer, heltall. Hver algoritme
            uttrykker noe i ett av disse domenene. Lær vokabularet først, så blir
            algoritme-pensumet plutselig veldig mye lettere.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span> hver seksjon har en
              interaktiv figur du kan klikke på, samt en mini-oppgave med fasit.{" "}
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgavene
              </Link>{" "}
              under «Math foundations» drillere det samme.
            </div>
          </div>
        </div>

        <CourseOutline courseId="diskret-matte" steps={STEPS} />

        {/* ============================================================ */}
        {/* 1. LOGIKK */}
        {/* ============================================================ */}
        <section id="logikk" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">1. Propositional logic</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Et utsagn (proposisjon) er en setning som er enten <strong>sant</strong> (T) eller
            <strong> usant</strong> (F). Variabler skrives <code>p, q, r, ...</code> og
            kombineres med konnektiver. Logikk er det formelle språket for hver{" "}
            <code>if</code>-setning, hver SQL-<code>WHERE</code>, hver type-sjekk.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Konnektiv        Symbol     Leses                Sant når
─────────────────────────────────────────────────────────────────
Negasjon         ¬p         "ikke p"             p er usant
Konjunksjon      p ∧ q      "p og q"             begge sanne
Disjunksjon      p ∨ q      "p eller q"          minst én sann
Implikasjon      p → q      "hvis p, så q"       ikke (p ∧ ¬q)
Bikondisjonal    p ↔ q      "p hvis og bare hvis q"   p og q har samme verdi
Eks-eller        p ⊕ q      "p XOR q"            nøyaktig én sann`}</pre>
          </div>

          <h3 className="text-sm font-semibold mb-2">Sannhetstabell-bygger</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Skriv inn et uttrykk (eller velg en preset) og se sannhetstabellen genereres
            automatisk. Eksperimenter: er <code>p → q</code> det samme som{" "}
            <code>¬p ∨ q</code>?
          </p>
          <TruthTableBuilder />

          <FallBox>
            <strong>Felle:</strong> <code>p → q</code> er IKKE «p forårsaker q». Det er
            kun «ikke begge p sann og q usann». Derfor er «hvis månen er av ost, er 1+1=3»
            et sant utsagn — premisset er usant, og en implikasjon med usant premiss er
            alltid sann (vacuously true).
          </FallBox>

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              De Morgans lover — viktigste identitet
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`¬(p ∧ q)  ≡  ¬p ∨ ¬q
¬(p ∨ q)  ≡  ¬p ∧ ¬q

Eksempel — SQL:
  NOT (age > 18 AND has_license)
  ≡ age <= 18 OR NOT has_license

Eksempel — kode:
  if not (a > 0 and b > 0):     # «hvis IKKE begge positive»
  ekvivalent med:
  if a <= 0 or b <= 0:          # «hvis MINST ÉN ikke-positiv»`}</pre>
          </div>

          <ProblemBox
            title="Mini-oppgave — sannhetstabell"
            problem={
              <>
                Vis at <code>p → q</code> og <code>¬q → ¬p</code> (kontrapositivet) har
                identisk sannhetstabell.
              </>
            }
            answer={
              <>
                Begge gir T,F,T,T for (TT, TF, FT, FF). Sjekk i builder-en over: p→q er F
                kun ved p=T,q=F. ¬q→¬p er F kun ved ¬q=T,¬p=F → q=F,p=T. Samme rad.
                Derfor er kontrapositivet logisk ekvivalent — en av de mest brukte
                bevis-triksene.
              </>
            }
          />
        </section>

        {/* ============================================================ */}
        {/* 2. BEVIS-STRATEGIER */}
        {/* ============================================================ */}
        <section id="bevis" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">2. Bevis-strategier</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tre standard-mønstre du møter overalt: direkte bevis, kontrapositiv, og
            motsigelse. Velg det som gir kortest argument for påstanden din.
          </p>

          <div className="space-y-3">
            <ProofCard
              title="Direkte bevis (p → q)"
              recipe="Anta p. Vis q som logisk konsekvens, steg for steg."
              example={`Påstand: hvis n er partall, så er n² partall.
  Anta n = 2k for et heltall k.
  Da n² = (2k)² = 4k² = 2·(2k²).
  Det er av formen 2·(heltall), så n² er partall. ✓`}
            />
            <ProofCard
              title="Kontrapositiv (¬q → ¬p)"
              recipe="Vis at ¬q medfører ¬p. Ekvivalent med direkte bevis av p → q (samme sannhetstabell)."
              example={`Påstand: hvis n² er partall, så er n partall.
  Kontrapositivet: hvis n er oddetall, så er n² oddetall.
  Anta n = 2k+1. Da n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1, altså oddetall. ✓`}
            />
            <ProofCard
              title="Motsigelse (reductio ad absurdum)"
              recipe="Anta påstanden er usann. Utled en motsigelse. Da må påstanden være sann."
              example={`Påstand: √2 er irrasjonelt.
  Anta tvert imot at √2 = a/b på fullt forkortet form.
  Da 2b² = a², så a² er partall, dermed a partall: a = 2k.
  Da b² = 2k², så b også partall.
  Men da kan brøken forkortes med 2 — motsigelse mot «fullt forkortet». ✓`}
            />
          </div>

          <FallBox>
            <strong>Felle:</strong> kontrapositiv ≠ invers. <code>p → q</code> har
            kontrapositiv <code>¬q → ¬p</code> (ekvivalent), men invers er{" "}
            <code>¬p → ¬q</code> (IKKE ekvivalent). Ikke bytt rekkefølge når du negerer.
          </FallBox>
        </section>

        {/* ============================================================ */}
        {/* 3. MENGDER */}
        {/* ============================================================ */}
        <section id="mengder" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">3. Mengder</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En mengde er en uordnet samling unike elementer. Skrives med klammer:
            <code>{` {1, 2, 3}`}</code>. Rekkefølge og duplikater betyr ingenting:
            <code>{` {1, 2, 3} = {3, 1, 2, 1}`}</code>.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Operasjon         Symbol     Definisjon
──────────────────────────────────────────────────────────
Union             A ∪ B      x ∈ A eller x ∈ B
Snitt             A ∩ B      x ∈ A og x ∈ B
Differanse        A \\ B      x ∈ A og x ∉ B
Symmetrisk diff   A ⊕ B      i A eller B, men ikke begge
Komplement        Aᶜ         x ∉ A (i et univers U)
Delmengde         A ⊆ B      hvert x ∈ A er også i B
Ekte delmengde    A ⊂ B      A ⊆ B og A ≠ B
Tom mengde        ∅          { }
Kardinalitet      |A|        antall elementer i A
Potensmengde      𝒫(A)       mengden av alle delmengder, |𝒫(A)| = 2^|A|`}</pre>
          </div>

          <h3 className="text-sm font-semibold mb-2">Venn-sandkasse</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Klikk en operasjon — det skraverte området er resultatet. Slidere endrer
            kardinalitet. Se inkluderings-eksklusjons-formelen oppdatere seg live.
          </p>
          <VennSandbox />

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Inkludering–eksklusjon (2 og 3 mengder)
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`|A ∪ B|  =  |A| + |B| − |A ∩ B|

|A ∪ B ∪ C|  =  |A| + |B| + |C|
                − |A ∩ B| − |A ∩ C| − |B ∩ C|
                + |A ∩ B ∩ C|

Eksempel — kurs-overlapp:
  30 studenter. 18 tar matte, 15 fysikk, 8 begge.
  Hvor mange tar minst ett?
  |M ∪ F| = 18 + 15 − 8 = 25
  Hvor mange tar ingen? 30 − 25 = 5.`}</pre>
          </div>

          <FallBox>
            <strong>Bro til SQL:</strong> <code>UNION</code> = ∪, <code>INTERSECT</code> =
            ∩, <code>EXCEPT</code> = \. Relasjonsalgebra (SQL sin teoretiske base) ER
            mengdelære på rader. Når du forstår mengder, forstår du joins.
          </FallBox>

          <ProblemBox
            title="Mini-oppgave — inkludering/eksklusjon"
            problem={
              <>
                Av 100 personer drikker 60 kaffe, 50 te, 30 begge. Hvor mange drikker
                ingen av delene?
              </>
            }
            answer={
              <>
                |K ∪ T| = 60 + 50 − 30 = 80. Da drikker 100 − 80 = <strong>20</strong>{" "}
                hverken kaffe eller te.
              </>
            }
          />
        </section>

        {/* ============================================================ */}
        {/* 4. FUNKSJONER */}
        {/* ============================================================ */}
        <section id="funksjoner" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">4. Funksjoner og relasjoner</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En funksjon <code>f: A → B</code> tilordner hver <code>x ∈ A</code> nøyaktig
            én <code>f(x) ∈ B</code>. A er definisjonsmengde, B er kodomene.
            Bilde-mengden <code>f(A)</code> er det som faktisk treffes.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Type           Definisjon                              Tankebilde
──────────────────────────────────────────────────────────────────────
Injektiv       x₁ ≠ x₂ → f(x₁) ≠ f(x₂)                 én-til-én
(1-1)          ingen kollisjoner i resultatet

Surjektiv      ∀y ∈ B, ∃x ∈ A: f(x) = y                dekker hele B
(onto)         hele B blir truffet

Bijektiv       både injektiv og surjektiv              perfekt match
               (har invers f⁻¹)

Sammensetning  (g∘f)(x) = g(f(x))                      kjøre f, så g
Identitet      id(x) = x                                gjør ingenting`}</pre>
          </div>

          <h3 className="text-sm font-semibold mb-2">Funksjonstype-visualisering</h3>
          <FunctionTypeVis />

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempler — varierte domener
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`f(x) = x²  (ℝ → ℝ)   — IKKE injektiv (f(-2) = f(2) = 4)
                       IKKE surjektiv (-1 treffes ikke)

f(x) = 2x  (ℝ → ℝ)   — bijektiv (invers er f⁻¹(y) = y/2)

f(x) = x²  (ℕ → ℕ)   — injektiv, men ikke surjektiv (2 treffes ikke)

f(x) = ⌊x⌋  (ℝ → ℤ)  — surjektiv (hvert heltall treffes), ikke injektiv
                       (alle x ∈ [3, 4) går til 3)`}</pre>
          </div>

          <FallBox>
            <strong>Bro til hashing:</strong> en hash-funksjon ER en funksjon
            (deterministisk), men sjelden injektiv — kollisjoner finnes. En
            kryptografisk hash er praktisk talt injektiv (kollisjoner umulige å
            konstruere). Bijektive funksjoner har invers — kryptering med en
            symmetrisk nøkkel er en bijeksjon.
          </FallBox>

          <ProblemBox
            title="Mini-oppgave — funksjonstype"
            problem={
              <>
                Er <code>f(x) = x³</code> fra ℝ → ℝ injektiv, surjektiv eller bijektiv?
              </>
            }
            answer={
              <>
                <strong>Bijektiv.</strong> Injektiv: x³ er strengt voksende, så ulike x
                gir ulike y. Surjektiv: for hvert y ∈ ℝ finnes x = ∛y. Invers: f⁻¹(y) =
                ∛y. (Merk: x² er IKKE bijektiv på ℝ — den feiler både injeksjon og
                surjeksjon.)
              </>
            }
          />
        </section>

        {/* ============================================================ */}
        {/* 5. KOMBINATORIKK */}
        {/* ============================================================ */}
        <section id="kombinatorikk" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">5. Kombinatorikk</h2>
          <p className="text-sm text-muted-foreground mb-4">
            «Hvor mange måter?» Fire grunnregler bygger nesten alt.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Multiplikasjonsregelen:
  k uavhengige valg, n_i alternativer hver
  ⇒ n_1 · n_2 · ... · n_k totale utfall
  Eks: 4-sifret PIN: 10 · 10 · 10 · 10 = 10 000

Addisjonsregelen:
  Disjunkte tilfeller — adder antall i hvert.
  Eks: 1 av 4 røde eller 1 av 3 blå kort: 4 + 3 = 7.

Permutasjon (rekkefølge teller):
  P(n, k) = n! / (n−k)!
  Eks: topp-3 av 10 løpere: P(10, 3) = 10·9·8 = 720

Kombinasjon (rekkefølge teller IKKE):
  C(n, k) = (n choose k) = n! / (k!·(n−k)!)
  Eks: 5-korts hånd av 52 kort: C(52, 5) = 2 598 960`}</pre>
          </div>

          <h3 className="text-sm font-semibold mb-2">Perm vs. komb — interaktivt</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Toggle mellom permutasjon og kombinasjon, juster n og k, og se alle
            utvalgene listes opp. Legg merke til at P(n,k) = C(n,k) · k! — hver
            kombinasjon gir k! permutasjoner.
          </p>
          <ChooseKExplorer />

          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">Pascals trekant</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Klikk et tall — du ser begge «foreldre» (C(n−1, k−1) og C(n−1, k)) bli
              fremhevet og rekurrensen vises. Rad-sum = 2ⁿ er antall delmengder av en
              n-mengde.
            </p>
            <PascalTriangle />
          </div>

          <FallBox>
            <strong>Felle:</strong> spør deg alltid: <em>betyr rekkefølgen noe?</em> Hvis
            ja, permutasjon. Hvis nei, kombinasjon. Ekstra fallgruve: «med eller uten
            tilbakelegging?» — med tilbakelegging gir <code>nᵏ</code> (uavhengige valg),
            uten gir P(n,k) eller C(n,k).
          </FallBox>

          <ProblemBox
            title="Mini-oppgave — kombinatorikk"
            problem={
              <>
                Hvor mange forskjellige passord på 8 tegn finnes, hvor hvert tegn er en
                bokstav (26 mulige) eller et siffer (10 mulige)?
              </>
            }
            answer={
              <>
                Multiplikasjonsregelen: 36 valg per posisjon, 8 posisjoner.
                <br />
                <strong>36⁸ ≈ 2.82 · 10¹²</strong> (rundt 2,8 billioner). Til
                sammenligning: 8 bokstaver alene = 26⁸ ≈ 209 milliarder. Å legge til
                sifrene gir 13× flere kombinasjoner.
              </>
            }
          />
        </section>

        {/* ============================================================ */}
        {/* 6. INDUKSJON */}
        {/* ============================================================ */}
        <section id="induksjon" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">6. Matematisk induksjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            For å vise at en påstand P(n) holder for ALLE n ≥ n₀: vis basistilfelle og
            steg. Tankebildet er dominoer — vipp den første, vis at hver feller den
            neste, så faller alle.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Strukturen til et induksjonsbevis:

  1. BASIS:    Vis P(n₀) er sann (typisk n₀ = 0 eller 1).
  2. STEG:     Anta P(k) sann (induksjonshypotesen, IH).
               Vis at P(k+1) følger fra IH.
  3. KONKLUSJON: Da gjelder P(n) for alle n ≥ n₀.

Eksempel — bevis: Σᵢ₌₁ⁿ i = n(n+1)/2

  Basis (n=1):  venstre = 1,  høyre = 1·2/2 = 1  ✓

  Steg: anta Σᵢ₌₁ᵏ i = k(k+1)/2 (IH).
        Da:  Σᵢ₌₁ᵏ⁺¹ i  =  Σᵢ₌₁ᵏ i  +  (k+1)
                        =  k(k+1)/2  +  (k+1)        ← bruk IH
                        =  (k+1)(k+2)/2                ← faktoriser

  Som er formelen for n = k+1. QED.`}</pre>
          </div>

          <h3 className="text-sm font-semibold mb-2">Domino-modellen</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Klikk «Velt» — første brikke faller (basis), så feller hver brikke den
            neste (steget). Summen Σ₁..n oppdateres og verifiseres mot formelen.
          </p>
          <InductionDominoes />

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Sterk induksjon (når «P(k) sann» ikke er nok)
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Vanlig induksjon:    P(k) → P(k+1)
Sterk induksjon:     P(n₀) ∧ P(n₀+1) ∧ ... ∧ P(k) → P(k+1)

Brukes når P(k+1) avhenger av FLERE tidligere — typisk i rekursjons-bevis:
hver delproblems-størrelse er ulik. Eks: Fibonacci-egenskaper,
algoritme-korrekthet for splitt-og-hersk.`}</pre>
          </div>

          <FallBox>
            <strong>Bro til rekursjon:</strong> et rekursivt program HAR sin korrekthet
            bevist ved induksjon. Basistilfelle = base case, steget = de rekursive kall.
            Hvis du sliter med å se hvorfor en rekursjon stemmer, skriv den som et
            induksjonsbevis.
          </FallBox>

          <ProblemBox
            title="Mini-oppgave — kvadratsum"
            problem={
              <>
                Vis ved induksjon at <code>Σᵢ₌₁ⁿ i² = n(n+1)(2n+1)/6</code>.
              </>
            }
            answer={
              <>
                <strong>Basis:</strong> n=1 ⇒ venstre = 1, høyre = 1·2·3/6 = 1 ✓<br />
                <strong>Steg:</strong> anta Σ₁..k = k(k+1)(2k+1)/6 (IH). Da:
                <br />
                Σ₁..(k+1) = k(k+1)(2k+1)/6 + (k+1)²
                <br />= (k+1) · [k(2k+1)/6 + (k+1)]
                <br />= (k+1) · [k(2k+1) + 6(k+1)] / 6
                <br />= (k+1)(2k² + 7k + 6)/6 = (k+1)(k+2)(2k+3)/6 ✓<br />
                Som er formelen for n = k+1.
              </>
            }
          />
        </section>

        {/* ============================================================ */}
        {/* 7. GRAFER */}
        {/* ============================================================ */}
        <section id="grafer" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">7. Grafer</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En graf <code>G = (V, E)</code> er noder V og kanter E. Den abstrakte
            modellen for nettverk, kart, avhengigheter, sosiale grafer. Halve
            algoritme-pensumet handler om grafer.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Begrep                Definisjon
────────────────────────────────────────────────────────
Node (vertex)         Et element i V
Kant (edge)           Et par {u, v} med u, v ∈ V
Grad deg(v)           Antall kanter på v
Sti                   Sekvens av noder forbundet med kanter
Syklus                Sti som starter og slutter i samme node
Sammenhengende        Sti finnes mellom alle nodepar
Tre                   Sammenhengende graf UTEN sykler
                      → |E| = |V| − 1 alltid
Skog                  Disjunkt union av trær
Rettet (digraph)      Kanter har retning (u → v ≠ v → u)
Vektet                Hver kant har en vekt w(u,v)
DAG                   Rettet graf uten sykler (topologisk sort mulig)
Bipartitt             Noder deles i to grupper, kanter kun mellom
Komplett (Kₙ)         Alle nodepar har en kant; |E| = C(n,2)`}</pre>
          </div>

          <h3 className="text-sm font-semibold mb-2">Graf-galleri</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Klikk presetene for å se klassiske grafstrukturer. Naboliste, grader og
            komponent-tall regnes ut live.
          </p>
          <GraphSandbox />

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Tre representasjoner — når bruke hva?
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Naboliste:    adj[u] = [v1, v2, ...]      O(|V|+|E|) plass
              Standard for sparse grafer. Hurtig å iterere naboer.

Nabomatrise:  M[u][v] = 1 hvis kant         O(|V|²) plass
              O(1) kant-oppslag, men bruker mye plass. Bra for tette grafer.

Kantliste:    [(u1, v1), (u2, v2), ...]   O(|E|) plass
              Bra for algoritmer som sorterer kanter (Kruskals MST).`}</pre>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Handshake-lemmaet
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Σ_{v ∈ V} deg(v) = 2|E|

«Summen av grader er dobbelt antall kanter».
Hver kant bidrar 1 til grad-summen i hver ende.

Konsekvens: antallet noder med oddetalls-grad er alltid PARTALL.`}</pre>
          </div>

          <FallBox>
            <strong>Bro til AI og OS:</strong> BFS, DFS, Dijkstra, A* — alle opererer på
            grafer. Status-rommet i AI-søk ER en graf. Avhengighets-grafer i build-systemer.
            Ressurs-allokerings-grafer for deadlock. Når du ser «kan jeg komme fra X til
            Y under disse begrensningene?», tenk graf.
          </FallBox>

          <ProblemBox
            title="Mini-oppgave — tre-karakterisering"
            problem={
              <>
                En sammenhengende graf G har 12 noder. Hvor mange kanter har G hvis vi
                vet at G er et tre? Hva er minste og største kant-antall hvis G IKKE er
                spesifisert som tre?
              </>
            }
            answer={
              <>
                Tre: <strong>|E| = |V| − 1 = 11</strong>.<br />
                Generelt sammenhengende: minst 11 kanter (ellers ikke koblet), maks{" "}
                <code>C(12, 2) = 66</code> kanter (komplett graf K₁₂).
              </>
            }
          />
        </section>

        {/* ============================================================ */}
        {/* 8. MOD */}
        {/* ============================================================ */}
        <section id="mod" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">8. Modulær aritmetikk</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>a mod n</code> er resten når a deles med n. Vi skriver{" "}
            <code>a ≡ b (mod n)</code> når a og b gir samme rest — altså n deler
            differansen.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Eksempler:
  17 mod 5  =  2          (17 = 3·5 + 2)
  17 ≡ 2 (mod 5)          (17 og 2 gir samme rest)
  17 ≡ -3 (mod 5)         (negative tilfeller: -3 + 5 = 2)

Egenskaper (mod n):
  (a + b) mod n  =  ((a mod n) + (b mod n)) mod n
  (a · b) mod n  =  ((a mod n) · (b mod n)) mod n
  (a^k) mod n     kan beregnes med fast eksponentiering

Klokke-aritmetikk: hva er kl 23 + 5 timer?
  23 + 5 = 28,  28 mod 24 = 4   ⇒ kl 04`}</pre>
          </div>

          <h3 className="text-sm font-semibold mb-2">Mod-klokke</h3>
          <p className="text-xs text-muted-foreground mb-3">
            En sirkel med n posisjoner. Dra a og b — rød og cyan markerer hvor de
            «lander». Grønn er resultatet av operasjonen mod n.
          </p>
          <ModClock />

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Bruk: hash-tabell-indeksering
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`def hash_index(key, table_size):
    return hash(key) % table_size

# table_size = 7
# hash("alice") = 4823957
# 4823957 mod 7 = 2  → legg i bucket 2

# Kollisjoner uunngåelig: mange ulike nøkler havner i samme bucket.
# Løsning: chaining (liste i bucket), eller open addressing (prøv neste).`}</pre>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Fast eksponentiering — beregne a^k mod n raskt
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`def pow_mod(a, k, n):
    """Beregn a^k mod n i O(log k) tid."""
    result = 1
    a = a % n
    while k > 0:
        if k % 2 == 1:
            result = (result * a) % n
        a = (a * a) % n
        k //= 2
    return result

# pow_mod(3, 1000, 7) = 4  — uten å regne 3^1000 (et tall med 478 sifre).
# Dette er hjørnesteinen i RSA-kryptering.`}</pre>
          </div>

          <FallBox>
            <strong>Bro til kryptografi:</strong> RSA er fullt og helt modulær
            aritmetikk. Diffie-Hellman, Fermats lille teorem (aᵖ⁻¹ ≡ 1 mod p for primtall
            p), Eulers totient-funksjon φ(n) — alle bygger på <code>(mod p)</code> med
            primtall p. Hash, sjekksummer (CRC), pseudoslump — alt mod-aritmetikk.
          </FallBox>

          <ProblemBox
            title="Mini-oppgave — modulær aritmetikk"
            problem={
              <>
                Hva er (7¹⁰⁰) mod 11? <br />
                <span className="text-muted-foreground">
                  Tips: Fermats lille teorem sier at aᵖ⁻¹ ≡ 1 (mod p) for primtall p og a
                  ikke delelig med p.
                </span>
              </>
            }
            answer={
              <>
                11 er primtall, så 7¹⁰ ≡ 1 (mod 11) ved Fermat.
                <br />
                7¹⁰⁰ = (7¹⁰)¹⁰ ≡ 1¹⁰ = <strong>1</strong> (mod 11).
                <br />
                Dette trikset er hvorfor mod-eksponentiering er beregnings-vennlig: store
                eksponenter «kollapser» modulo primtall.
              </>
            }
          />
        </section>

        {/* ============================================================ */}
        {/* OPPSUMMERING */}
        {/* ============================================================ */}
        <section id="oppsummering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Oppsummering — hva nå?</h2>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-3">
              Sjekkliste — kan du forklare?
            </div>
            <ul className="space-y-1.5 text-sm">
              <Check>Hvorfor p → q er sann når p er usann (vacuous truth)</Check>
              <Check>De Morgans lover anvendt på et SQL-WHERE</Check>
              <Check>Inkluderings-eksklusjons-formelen for to og tre mengder</Check>
              <Check>Forskjellen mellom injektiv, surjektiv, bijektiv</Check>
              <Check>Permutasjon vs. kombinasjon — hvilken og hvorfor</Check>
              <Check>Strukturen i et induksjonsbevis (basis → steg → konklusjon)</Check>
              <Check>Når en graf er et tre (|E| = |V| − 1 + sammenhengende)</Check>
              <Check>Handshake-lemmaet og hva det innebærer</Check>
              <Check>Hva «a ≡ b (mod n)» betyr og hvordan finne den</Check>
              <Check>Hvorfor mod-aritmetikk er hjørnesteinen i RSA</Check>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 text-sm">
            <h3 className="font-semibold mb-2">Neste steg</h3>
            <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
              <li>
                <Link to="/drag" className="text-brand hover:underline">
                  Drag-oppgaver
                </Link>{" "}
                — filtrer på «Math foundations» / «Diskret matte» for 40+ kort med
                sannhetstabeller, mengde-operasjoner, n-velg-k, induksjon og mod.
              </li>
              <li>
                <Link
                  to="/stack/$slug"
                  params={{ slug: "sannsynlighet" }}
                  className="text-brand hover:underline"
                >
                  Sannsynlighet
                </Link>{" "}
                — bygger direkte på mengder (Ω er en mengde, hendelser er delmengder).
                <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
              </li>
              <li>
                <Link
                  to="/stack/$slug"
                  params={{ slug: "algoritmer" }}
                  className="text-brand hover:underline"
                >
                  Algoritmer
                </Link>{" "}
                — Big-O-bevis bruker induksjon, alle datastrukturer er grafer eller
                lineære oppslag.
              </li>
              <li>
                <Link
                  to="/stack/$slug"
                  params={{ slug: "kryptografi" }}
                  className="text-brand hover:underline"
                >
                  Kryptografi
                </Link>{" "}
                — modulær aritmetikk i praksis.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </StackPageShell>
  );
}

function FallBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
      <div className="text-xs text-foreground">{children}</div>
    </div>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
      <span className="text-foreground/90">{children}</span>
    </li>
  );
}

function ProofCard({
  title,
  recipe,
  example,
}: {
  title: string;
  recipe: string;
  example: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
        {title}
      </div>
      <div className="text-sm text-muted-foreground mb-2">{recipe}</div>
      <pre className="font-mono text-xs overflow-x-auto whitespace-pre bg-background/60 rounded p-2">
        {example}
      </pre>
    </div>
  );
}

function ProblemBox({
  title,
  problem,
  answer,
}: {
  title: string;
  problem: React.ReactNode;
  answer: React.ReactNode;
}) {
  return (
    <details className="mt-4 rounded-xl border border-brand/30 bg-brand/5 p-4 group">
      <summary className="cursor-pointer text-sm font-semibold text-foreground select-none">
        <span className="text-xs uppercase tracking-wider text-brand font-semibold">
          {title}
        </span>
        <div className="mt-1 font-normal text-foreground/90">{problem}</div>
        <div className="mt-1 text-[11px] text-muted-foreground italic group-open:hidden">
          Klikk for å se fasit ↓
        </div>
      </summary>
      <div className="mt-3 pt-3 border-t border-brand/20 text-sm text-foreground/90 leading-relaxed">
        {answer}
      </div>
    </details>
  );
}
