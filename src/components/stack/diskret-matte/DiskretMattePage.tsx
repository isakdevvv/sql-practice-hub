import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Propositional logic — sannhetsverdier og konnektiver", anchor: "logikk" },
  { title: "Mengder — union, snitt, differanse, delmengde", anchor: "mengder" },
  { title: "Funksjoner og relasjoner — injektiv, surjektiv, bijektiv", anchor: "funksjoner" },
  { title: "Kombinatorikk — permutasjoner og kombinasjoner", anchor: "kombinatorikk" },
  { title: "Matematisk induksjon", anchor: "induksjon" },
  { title: "Grafer — noder, kanter, stier, trær", anchor: "grafer" },
  { title: "Modulær aritmetikk — mod, kongruens, hashing", anchor: "mod" },
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
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Math foundations» — sannhetstabeller, mengde-operasjoner,
              n-velg-k, induksjon, modulær aritmetikk.
            </div>
          </div>
        </div>

        <CourseOutline courseId="diskret-matte" steps={STEPS} />

        <section id="logikk" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Propositional logic</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Et utsagn er en setning som er enten <strong>sant</strong> (T) eller
            <strong> usant</strong> (F). Variabler skrives <code>p, q, r, ...</code> og
            kombineres med konnektiver.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Konnektiv        Symbol     Leses                Sant når
─────────────────────────────────────────────────────────────────
Negasjon         ¬p         "ikke p"             p er usant
Konjunksjon      p ∧ q      "p og q"             begge sanne
Disjunksjon      p ∨ q      "p eller q"          minst én sann
Implikasjon      p → q      "hvis p, så q"       ikke (p ∧ ¬q)
Bikondisjonal    p ↔ q      "p hvis og bare hvis q"   p og q har samme verdi

Sannhetstabell for p → q:
   p  q  | p → q
   ─────────────
   T  T  |   T
   T  F  |   F    ← den eneste falske
   F  T  |   T    ← hvis premiss er usant, alt holder
   F  F  |   T`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Felle:</strong> <code>p → q</code> er IKKE «p forårsaker q». Det er
            kun «ikke begge p sann og q usann». Derfor er «hvis månen er av ost,
            er 1+1=3» et sant utsagn — premisset er usant.
          </p>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              De Morgans lover — viktigste identitet
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`¬(p ∧ q)  ≡  ¬p ∨ ¬q
¬(p ∨ q)  ≡  ¬p ∧ ¬q

Eksempel — SQL:
  NOT (age > 18 AND has_license)
  ≡ age <= 18 OR NOT has_license`}</pre>
          </div>
        </section>

        <section id="mengder" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Mengder</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En mengde er en uordnet samling unike elementer. Skrives med klammer:
            <code>{` {1, 2, 3}`}</code>. Rekkefølge og duplikater betyr ingenting:
            <code>{` {1, 2, 3} = {3, 1, 2, 1}`}</code>.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Operasjon         Symbol     Definisjon
──────────────────────────────────────────────────────────
Union             A ∪ B      x ∈ A eller x ∈ B
Snitt             A ∩ B      x ∈ A og x ∈ B
Differanse        A \\ B      x ∈ A og x ∉ B
Komplement        Aᶜ         x ∉ A (i et univers U)
Delmengde         A ⊆ B      hvert x ∈ A er også i B
Ekte delmengde    A ⊂ B      A ⊆ B og A ≠ B
Tom mengde        ∅          { }
Kardinalitet      |A|        antall elementer i A

Venn-diagram (to mengder):
       ┌───────────┐
       │     A     │
   ┌───┼─────┐     │
   │   │ A∩B │     │
   │ B │     │     │
   │   └─────┼─────┘
   └─────────┘`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempel — konkret
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`A = {1, 2, 3, 4}
B = {3, 4, 5, 6}

A ∪ B = {1, 2, 3, 4, 5, 6}
A ∩ B = {3, 4}
A \\ B = {1, 2}
B \\ A = {5, 6}
|A ∪ B| = |A| + |B| - |A ∩ B|    ← inkl/eksl-prinsippet
        = 4 + 4 - 2 = 6`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Bro til SQL:</strong> <code>UNION</code> = ∪, <code>INTERSECT</code> = ∩,
            <code> EXCEPT</code> = \. Relasjonsalgebra ER mengdelære på rader.
          </p>
        </section>

        <section id="funksjoner" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Funksjoner og relasjoner</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En funksjon <code>f: A → B</code> tilordner hver <code>x ∈ A</code> nøyaktig
            én <code>f(x) ∈ B</code>. A er definisjonsmengde, B er kodomene.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Type           Definisjon                              Tankebilde
──────────────────────────────────────────────────────────────────────
Injektiv       x₁ ≠ x₂ → f(x₁) ≠ f(x₂)                 én-til-én
(1-1)          ingen kollisjoner i resultatet

Surjektiv      ∀y ∈ B, ∃x ∈ A: f(x) = y                dekker hele B
(onto)         hele B blir truffet

Bijektiv       både injektiv og surjektiv              perfekt match
               (har invers f⁻¹)`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempler
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`f(x) = x²  (ℝ → ℝ)   — IKKE injektiv (f(-2) = f(2) = 4)
                       IKKE surjektiv (-1 treffes ikke)

f(x) = 2x  (ℝ → ℝ)   — bijektiv (invers er f⁻¹(y) = y/2)

f(x) = x²  (ℕ → ℕ)   — injektiv, men ikke surjektiv (2 treffes ikke)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Bro til hashing:</strong> en hash-funksjon ER en funksjon (deterministic),
            men sjelden injektiv (kollisjoner finnes). En kryptografisk hash er praktisk talt
            injektiv (kollisjoner umulige å konstruere).
          </p>
        </section>

        <section id="kombinatorikk" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Kombinatorikk</h2>
          <p className="text-sm text-muted-foreground mb-4">
            «Hvor mange måter?» Tre grunnregler bygger nesten alt.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Multiplikasjonsregelen:
  k uavhengige valg, n_i alternativer hver
  ⇒ n_1 · n_2 · ... · n_k totale utfall

  Eks: 4-sifret PIN: 10 · 10 · 10 · 10 = 10 000

Permutasjon (rekkefølge teller):
  P(n, k) = n! / (n-k)!

  Eks: topp-3 av 10 løpere: P(10, 3) = 10·9·8 = 720

Kombinasjon (rekkefølge teller IKKE):
  C(n, k) = (n choose k) = n! / (k!·(n-k)!)

  Eks: 5-korts hånd av 52 kort:
       C(52, 5) = 52! / (5! · 47!) = 2 598 960`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Pascals trekant — visuell C(n, k)
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Rad 0:           1
Rad 1:          1 1
Rad 2:         1 2 1
Rad 3:        1 3 3 1
Rad 4:       1 4 6 4 1
Rad 5:      1 5 10 10 5 1

C(n, k) = C(n-1, k-1) + C(n-1, k)     ← rekurrens

Σ_{k=0}^n C(n,k) = 2ⁿ                  ← summen i rad n`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Felle:</strong> spør deg alltid: <em>betyr rekkefølgen noe?</em> Hvis ja,
            permutasjon. Hvis nei, kombinasjon.
          </p>
        </section>

        <section id="induksjon" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Matematisk induksjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            For å vise at en påstand P(n) holder for ALLE n ≥ n₀: vis basistilfelle og
            steg. Tankebildet er dominoer.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Strukturen til et induksjonsbevis:

  1. BASIS:    Vis P(n₀) er sann (typisk n₀ = 0 eller 1).
  2. STEG:     Anta P(k) sann (induksjonshypotesen).
               Vis at P(k+1) følger.
  3. KONKLUSJON: Da gjelder P(n) for alle n ≥ n₀.

Eksempel — bevis: Σ_{i=1}^n i = n(n+1)/2

  Basis (n=1):  venstre = 1,  høyre = 1·2/2 = 1  ✓

  Steg: anta Σ_{i=1}^k i = k(k+1)/2.
        Da:  Σ_{i=1}^{k+1} i  =  Σ_{i=1}^k i  +  (k+1)
                              =  k(k+1)/2  +  (k+1)
                              =  (k+1)(k+2)/2     ✓

  Som er formelen for n = k+1. QED.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Bro til rekursjon:</strong> et rekursivt program HAR sin korrekthet bevist
            ved induksjon. Basistilfelle = base case, steget = rekurssive kall.
          </p>
        </section>

        <section id="grafer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Grafer</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En graf <code>G = (V, E)</code> er noder V og kanter E. Den abstrakte modellen for
            nettverk, kart, avhengigheter, sosiale grafer.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Begrep                Definisjon
────────────────────────────────────────────────────────
Node (vertex)         Et element i V
Kant (edge)           Et par {u, v} med u, v ∈ V
Grad deg(v)           Antall kanter på v
Sti                   Sekvens av noder forbundet med kanter
Syklus                Sti som starter og slutter i samme node
Sammenhengende        Sti finnes mellom alle nodepar
Tre                   Sammenhengende graf UTEN sykler
                      → |E| = |V| - 1 alltid
Rettet (digraph)      Kanter har retning (u → v ≠ v → u)
Vektet                Hver kant har en vekt w(u,v)

Eksempel — tre med 5 noder:
   1
   ├── 2
   │   ├── 4
   │   └── 5
   └── 3

|V| = 5, |E| = 4. Ingen syklus.`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Tre måter å representere en graf
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Naboliste:    adj[u] = [v1, v2, ...]      O(|V|+|E|) plass
Nabomatrise:  M[u][v] = 1 hvis kant       O(|V|²) plass
Kantliste:    [(u1, v1), (u2, v2), ...]   O(|E|) plass

I praksis: naboliste for tette grafer over noen tusen noder.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Bro til AI:</strong> BFS, DFS, Dijkstra, A* — alle opererer på grafer.
            Statusrom i AI-søk ER grafer.
          </p>
        </section>

        <section id="mod" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Modulær aritmetikk</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>a mod n</code> er resten når a deles med n. Skriver <code>a ≡ b (mod n)</code>
            når a og b gir samme rest.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
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
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Bruk: hash-tabell-indeksering
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`def hash_index(key, table_size):
    return hash(key) mod table_size

# table_size = 7
# hash("alice") = 4823957
# 4823957 mod 7 = 2  → legg i bucket 2

# Kollisjoner uunngåelig: mange ulike nøkler havner i samme bucket.
# Løsning: chaining (liste i bucket), eller open addressing.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Bro til kryptografi:</strong> RSA er fullt og helt modulær aritmetikk.
            Diffie-Hellman, Fermat's lille teorem, alle bygger på <code>(mod p)</code> med
            primtall p.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : sannhetstabeller, mengde-operasjoner, n-velg-k, induksjon, modulær aritmetikk.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "sannsynlighet" }} className="text-brand hover:underline">
                Sannsynlighet
              </Link>
              : bygger direkte på mengder.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "algoritmer" }} className="text-brand hover:underline">
                Algoritmer
              </Link>
              : Big-O-bevis bruker induksjon, alle datastrukturer bruker grafteori.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
