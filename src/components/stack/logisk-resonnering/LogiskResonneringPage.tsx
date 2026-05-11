import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hvorfor logikk i AI?", anchor: "intro" },
  { title: "Propositional logic", anchor: "pl" },
  { title: "Sannhetstabeller og entailment", anchor: "entailment" },
  { title: "Inferensregler — modus ponens m.fl.", anchor: "inferens" },
  { title: "Resolusjon og CNF", anchor: "resolusjon" },
  { title: "First-order logic — kort intro", anchor: "fol" },
  { title: "Hvor passer det inn?", anchor: "passer" },
];

export function LogiskResonneringPage() {
  return (
    <StackPageShell title="Logisk resonnering" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · Logikk
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Logisk resonnering — å trekke konklusjoner formelt
          </h1>
          <p className="mt-3 text-muted-foreground">
            Et knowledge-based agent har en kunnskapsbase (KB) av setninger som
            beskriver verden, og en inferens-prosedyre som utleder nye sanninger fra
            de gamle. Vi starter med propositional logic — utsagnslogikk — og piker
            på først-ordens logikk på slutten.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Sentralt begrep:</span> entailment{" "}
              <code>KB ⊨ α</code> — «α følger logisk av KB». Det er det vi vil
              MEKANISERE.
            </div>
          </div>
        </div>

        <CourseOutline courseId="logisk-resonnering" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor logikk i AI?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Maskinlæring lærer av eksempler. Logikk lar oss derimot kode inn{" "}
            <em>regler</em> direkte og trekke konklusjoner som er garantert
            korrekte. Logikk passer godt når:
          </p>
          <ul className="space-y-1.5 text-sm text-foreground list-disc pl-5">
            <li>Domenet har klare, eksplisitte regler (lover, medisinske retningslinjer)</li>
            <li>Beslutningen må kunne FORKLARES — du kan vise inferens-stegene</li>
            <li>Vi har lite data, men eksperter har strukturert kunnskap</li>
          </ul>
        </section>

        <section id="pl" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Propositional logic (PL)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Setningene er atomære proposisjoner (sanne/usanne) kombinert med
            konnektiv.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Symboler:    P, Q, R, ...            (proposisjoner)
Konstanter:  True, False
Konnektiv:
  ¬P          NOT     — negasjon
  P ∧ Q       AND     — konjunksjon
  P ∨ Q       OR      — disjunksjon
  P ⇒ Q       IF      — implikasjon
  P ⇔ Q       IFF     — biimplikasjon

Eksempel-modell over verden:
  Regn ⇒ Vått
  Vått ⇒ ¬Tørt
  Regn

Hva følger? Vått, ¬Tørt.`}</pre>
          </div>
        </section>

        <section id="entailment" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Sannhetstabeller og entailment</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>KB ⊨ α</code> betyr: «I HVER modell der KB er sann, er også α
            sann.» Sannhetstabell-metoden tester dette ved å sjekke alle 2^n
            kombinasjoner av proposisjonene.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function TT-ENTAILS?(KB, α):
  symbols <- alle proposisjoner i KB og α
  return TT-CHECK-ALL(KB, α, symbols, {})

function TT-CHECK-ALL(KB, α, symbols, model):
  if symbols is empty:
    if PL-TRUE(KB, model):
      return PL-TRUE(α, model)
    else: return true                    # KB falsk -> vacuous
  P, rest <- first(symbols), tail(symbols)
  return TT-CHECK-ALL(KB, α, rest, model ∪ {P=true})
     and TT-CHECK-ALL(KB, α, rest, model ∪ {P=false})

Egenskaper:
  Sound:    ja  — sier aldri JA hvis KB ⊭ α
  Complete: ja  — sier alltid JA hvis KB ⊨ α
  Tid:      O(2^n)  — eksponentiell i antall proposisjoner`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Hvorfor «vacuous»?</strong> En implikasjon <code>P ⇒ Q</code> er
            per definisjon sann hvis P er usann. Tilsvarende: hvis KB ikke holder i
            en modell, gir den ingen informasjon — vi hopper over den modellen.
          </p>
        </section>

        <section id="inferens" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Inferensregler — modus ponens m.fl.</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Sannhetstabeller er O(2^n). Inferensregler lar oss utlede nye setninger
            uten å enumere modeller.
          </p>

          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Modus ponens:
       α ⇒ β,   α
       ───────────
            β

And-elimination:
        α ∧ β
       ───────
          α

And-introduction:
        α,  β
       ───────
        α ∧ β

Modus tollens:
       α ⇒ β,   ¬β
       ───────────
           ¬α

Resolusjon (binær form):
     ℓ1 ∨ ... ∨ ℓk ∨ m,   ¬m ∨ n1 ∨ ... ∨ nj
     ──────────────────────────────────────────
            ℓ1 ∨ ... ∨ ℓk ∨ n1 ∨ ... ∨ nj`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Vanlig blanding:</strong> modus ponens går framover: «hvis α er
            sann og α impliserer β, så er β sann». Modus tollens går bakover: «β er
            ikke sann, og α impliserer β — så α må også være usann».
          </p>
        </section>

        <section id="resolusjon" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Resolusjon og CNF</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Resolusjon er den ENE inferensregelen som er <strong>sound og
            refutation-complete</strong> for propositional logic. For å bruke den,
            må alt være i konjunktiv normalform (CNF) — en konjunksjon av
            disjunksjoner.
          </p>

          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Konvertering til CNF:

  P ⇔ Q       =>  (P ⇒ Q) ∧ (Q ⇒ P)
  α ⇒ β       =>  ¬α ∨ β
  ¬(α ∧ β)    =>  ¬α ∨ ¬β        (de Morgan)
  ¬(α ∨ β)    =>  ¬α ∧ ¬β        (de Morgan)
  ¬¬α         =>  α
  α ∨ (β ∧ γ) =>  (α ∨ β) ∧ (α ∨ γ)   (distribusjon)

Resolusjon-bevis (refutation):
  1. Konverter KB ∧ ¬α til CNF
  2. Anvend resolusjon-regelen gjentatte ganger
  3. Får du tom klausul (⊥)? Da var KB ⊨ α.
  4. Ingen nye klausuler? Da var KB ⊭ α.`}</pre>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Intuisjon:</strong> hvis vi kan utlede en motsigelse fra KB pluss
            <em> negasjonen</em> av påstanden vår, så må påstanden være sann gitt KB.
          </p>
        </section>

        <section id="fol" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. First-order logic — kort intro</h2>
          <p className="text-sm text-muted-foreground mb-4">
            PL gir bare proposisjoner. FOL gir oss <strong>objekter, relasjoner og
            kvantorer</strong>.
          </p>

          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Bygg-blokker:
  Konstanter:  Per, Oslo, 42
  Variabler:   x, y, z
  Predikater:  Bor(Per, Oslo)         ← relasjon
  Funksjoner:  Far(Per)               ← returnerer et objekt
  Kvantorer:
    ∀ x  P(x)    — for ALLE x gjelder P
    ∃ x  P(x)    — det FINNES en x slik at P

Eksempler:
  ∀ x  Menneske(x) ⇒ Dødelig(x)        «Alle mennesker er dødelige»
  Menneske(Sokrates)
  ⊨ Dødelig(Sokrates)                  ← klassisk syllogisme

  ∃ x  Bok(x) ∧ Leste(Per, x)         «Det finnes en bok Per har lest»`}</pre>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Hva som skiller FOL fra PL:</strong> i PL må «alle mennesker er
            dødelige» kodes som hundretusen separate proposisjoner. I FOL er det én
            setning som dekker hele domenet — derfor er FOL mye mer uttrykksfull.
            Prisen er at inferens i FOL er <em>semi-avgjørbar</em>: hvis svaret er
            ja, vil en sunn og komplett prosedyre svare ja — men hvis svaret er nei,
            kan prosedyren løpe i evig tid.
          </p>
        </section>

        <section id="passer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Hvor passer logikk inn?</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border bg-card p-4">
              <strong>Ekspertsystemer / regelmotorer:</strong> medisinsk diagnose,
              skatteregler, jus.
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <strong>Forklarbar AI:</strong> regelbaserte systemer kan VISE deg
              hvilke fakta og regler som ga konklusjonen.
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <strong>Verifisering av programmer:</strong> bevisbare egenskaper i
              kode med formell logikk.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Hvorfor ikke alltid bruke logikk?</strong> Den virkelige verden
              er full av usikkerhet, unntak og støy. Logikk er knivskarp — verden er
              det ikke. Derfor finnes Bayes-rammeverket vi tar etter dette.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>{" "}
              under «Logisk resonnering»: modus ponens, PL vs FOL, resolusjon.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "planlegging" }} className="text-brand hover:underline">
                Planlegging
              </Link>{" "}
              — bruker logisk representasjon av handlinger for å bygge planer.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
