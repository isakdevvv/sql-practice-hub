import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Vektorer — notasjon, addisjon, skalar-multiplikasjon", anchor: "vektorer" },
  { title: "Indreprodukt og kryssprodukt", anchor: "produkt" },
  { title: "Matriser — multiplikasjon, transponering, identitet, invers", anchor: "matriser" },
  { title: "Lineære likningssystemer — Ax = b og Gauss-eliminasjon", anchor: "likninger" },
  { title: "Lineære transformasjoner — geometrisk", anchor: "transformasjoner" },
  { title: "Egenvektorer og egenverdier — intuisjon og PCA", anchor: "egen" },
  { title: "Basis, dimensjon, rang", anchor: "basis" },
];

export function LinaerAlgebraPage() {
  return (
    <StackPageShell title="Linær algebra" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Fase 0 · Math foundations
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Linær algebra — matten bak ML og grafikk
          </h1>
          <p className="mt-3 text-muted-foreground">
            Vektorer, matriser, transformasjoner. Et nevralt nett er en stabel
            matrise-multiplikasjoner. PCA er egenvektorer av kovariansmatrisen.
            3D-grafikk er rotasjonsmatriser. Khan Academy LinAlg på en side.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Math foundations» — vektor-addisjon, indreprodukt, matrise-mult,
              identitet vs invers, egenvektor-intuisjon.
            </div>
          </div>
        </div>

        <CourseOutline courseId="linaer-algebra" steps={STEPS} />

        <section id="vektorer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Vektorer</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En vektor er en ordnet liste tall. Geometrisk: en pil i rommet med både
            retning og lengde. Algebraisk: et punkt i ℝⁿ.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Notasjon:
  v = (v₁, v₂, ..., vₙ)         eller     ⎡ v₁ ⎤
                                          ⎢ v₂ ⎥
                                          ⎢ .  ⎥
                                          ⎣ vₙ ⎦

Eksempel i ℝ²:
  v = (3, 2)        x: 3, y: 2
  w = (1, 4)

Addisjon (komponentvis):
  v + w = (3+1, 2+4) = (4, 6)

Skalar-multiplikasjon:
  2·v = (6, 4)
  -1·v = (-3, -2)   ← motsatt retning, samme lengde

Lengde (norm):
  ||v|| = √(v₁² + v₂² + ... + vₙ²)
  ||(3, 2)|| = √(9 + 4) = √13`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Geometrisk bilde
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`        y
        │       v+w
      6 │        ▲ (4,6)
        │       ╱
      4 │     w▲ (1,4)
        │   ╱ ╱
      2 │ ╱ v▲ (3,2)
        │╱  ╱
        └─────────► x
        O   3  4

Vektor-addisjon = "parallellogram-regelen": legg piler ende mot ende.`}</pre>
          </div>
        </section>

        <section id="produkt" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Indreprodukt og kryssprodukt</h2>
          <p className="text-sm text-muted-foreground mb-4">
            To måter å «multiplisere» vektorer på. Veldig forskjellige hensikter.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Indreprodukt (dot product):
  v · w = v₁w₁ + v₂w₂ + ... + vₙwₙ      ← ett tall ut

Geometrisk identitet:
  v · w = ||v|| · ||w|| · cos(θ)

Konsekvenser:
  v · w > 0      →  spiss vinkel  (samme retning)
  v · w = 0      →  vinkelrett (ortogonale)
  v · w < 0      →  stump vinkel (motsatte)

Eksempel:
  v = (3, 2),  w = (1, 4)
  v · w = 3·1 + 2·4 = 11

Kosinus-likhet (brukes i ML, NLP):
  cos_sim(v, w) = (v · w) / (||v|| · ||w||)`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Kryssprodukt — bare i ℝ³
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`v × w = (v₂w₃ - v₃w₂,  v₃w₁ - v₁w₃,  v₁w₂ - v₂w₁)

  Resultat er en VEKTOR, vinkelrett på både v og w.
  ||v × w|| = ||v|| · ||w|| · sin(θ)    ← arealet av parallellogrammet

Eksempel:
  v = (1, 0, 0),  w = (0, 1, 0)
  v × w = (0·0 - 0·1, 0·0 - 1·0, 1·1 - 0·0) = (0, 0, 1)

  Som ventet: x × y = z (høyrehånds-regelen).`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Bro til grafikk:</strong> kryssprodukt brukes til å finne normaler
            på flater i 3D — alt fra lyssetting i spill til kollisjonsdeteksjon.
          </p>
        </section>

        <section id="matriser" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Matriser</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En matrise er et 2D-array av tall. Algebraisk: en lineær funksjon fra ℝⁿ til ℝᵐ.
            Geometrisk: en transformasjon av rommet.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`A = ⎡ 1  2 ⎤    "2 × 2-matrise" (2 rader, 2 kolonner)
    ⎣ 3  4 ⎦

Transponering — speil over diagonalen:
  Aᵀ = ⎡ 1  3 ⎤
       ⎣ 2  4 ⎦

Multiplikasjon (A er m×k, B er k×n, AB er m×n):
  (AB)ᵢⱼ = Σ_p Aᵢₚ · Bₚⱼ        ← rad i av A · kolonne j av B

  ⎡ 1  2 ⎤ ⎡ 5  6 ⎤   ⎡ 1·5+2·7  1·6+2·8 ⎤   ⎡ 19  22 ⎤
  ⎣ 3  4 ⎦ ⎣ 7  8 ⎦ = ⎣ 3·5+4·7  3·6+4·8 ⎦ = ⎣ 43  50 ⎦

VIKTIG: AB ≠ BA generelt. Matrise-mult er IKKE kommutativ.`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Identitet og invers
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Identitetsmatrise I — "gjør ingenting":
       ⎡ 1  0 ⎤
  I  = ⎣ 0  1 ⎦       A·I = I·A = A

Invers A⁻¹ — "angre A":
  A · A⁻¹ = A⁻¹ · A = I

  For 2×2:  A = ⎡ a  b ⎤    A⁻¹ = 1/(ad-bc) · ⎡  d  -b ⎤
                ⎣ c  d ⎦                       ⎣ -c   a ⎦
  (krever ad - bc ≠ 0, dvs. determinant ikke null)

Ikke alle matriser har invers (singulære matriser har det ikke).`}</pre>
          </div>
        </section>

        <section id="likninger" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Lineære likningssystemer</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Standardform: <code>Ax = b</code>. A er koeffisienter, x ukjente, b høyresiden.
            Mål: finn x.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`System av 2 likninger:
   2x + 3y =  7
   4x -  y =  1

På matriseform Ax = b:
   ⎡ 2   3 ⎤ ⎡ x ⎤   ⎡ 7 ⎤
   ⎣ 4  -1 ⎦ ⎣ y ⎦ = ⎣ 1 ⎦

Tre mulige utfall:
  • Én løsning  (linjene krysser)
  • Ingen løsning (parallelle, ulike skjæringspunkt)
  • Uendelig mange (samme linje)`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Gauss-eliminasjon — algoritmisk løsning
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Skriv [A | b] som utvidet matrise. Bruk rad-operasjoner:
  • bytt to rader
  • multipliser en rad med en skalar ≠ 0
  • legg et multiplum av en rad til en annen

Mål: trekantform (echelon).

   ⎡ 2   3 | 7 ⎤  R2 ← R2 - 2·R1    ⎡ 2   3  |  7 ⎤
   ⎣ 4  -1 | 1 ⎦  ──────────────►   ⎣ 0  -7  | -13⎦

Tilbakesetting (back-substitution):
  -7y = -13  →  y = 13/7
   2x + 3·(13/7) = 7
   x = (7 - 39/7)/2 = (49/7 - 39/7)/2 = (10/7)/2 = 5/7

Sjekk: 2(5/7) + 3(13/7) = 10/7 + 39/7 = 49/7 = 7. ✓`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Hvis A er invertibel:</strong> x = A⁻¹b. I praksis bruker man sjelden
            invers — Gauss-eliminasjon eller LU-dekomposisjon er numerisk mer stabilt.
          </p>
        </section>

        <section id="transformasjoner" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Lineære transformasjoner</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Matrise · vektor = ny vektor. Hver matrise representerer en geometrisk
            transformasjon av rommet: rotasjon, skalering, projeksjon, eller en
            kombinasjon.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Skalering (faktor s):
   S = ⎡ s  0 ⎤
       ⎣ 0  s ⎦     S·(x, y) = (sx, sy)

Skalering bare i x-retning:
   ⎡ 2  0 ⎤
   ⎣ 0  1 ⎦        strekker bredden, beholder høyden

Rotasjon med vinkel θ:
   R(θ) = ⎡ cos θ  -sin θ ⎤
          ⎣ sin θ   cos θ ⎦

Refleksjon over x-aksen:
   ⎡ 1   0 ⎤
   ⎣ 0  -1 ⎦       (x, y) → (x, -y)

Projeksjon på x-aksen:
   ⎡ 1  0 ⎤
   ⎣ 0  0 ⎦        (x, y) → (x, 0)  ← informasjon TAPT`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Sammensetning = matrise-multiplikasjon
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`«Først S, så R»  =  R · S          (les fra HØYRE mot venstre)

Eksempel: skalér 2x, så rotér 90°:
  S = ⎡ 2  0 ⎤    R(90°) = ⎡ 0  -1 ⎤
      ⎣ 0  2 ⎦             ⎣ 1   0 ⎦

  R·S = ⎡ 0  -2 ⎤
        ⎣ 2   0 ⎦

Anvendt på (1, 0):  (R·S)·(1, 0)ᵀ = (0, 2)ᵀ
                    (skalering ga (2,0), rotasjon ga (0,2)).`}</pre>
          </div>
        </section>

        <section id="egen" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Egenvektorer og egenverdier</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En egenvektor til A er en spesiell vektor som A bare strekker (eller
            krymper), uten å rotere. Faktoren kalles egenverdi.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Definisjon:
  A · v = λ · v     (v ≠ 0)

  v er en egenvektor, λ er egenverdien.

Eksempel:
   A = ⎡ 3  1 ⎤,    v = (1, 1)
       ⎣ 1  3 ⎦

  A·v = (3+1, 1+3) = (4, 4) = 4·v       →  λ = 4

Hvordan finne dem? Løs det(A - λI) = 0 (karakteristisk likning).

For 2×2:
  det(A - λI) = (a-λ)(d-λ) - bc = λ² - (a+d)λ + (ad-bc) = 0`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Bruk: PCA (Principal Component Analysis)
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`PCA-oppskriften:
  1. Sentrér dataen (trekk fra gjennomsnittet).
  2. Beregn kovariansmatrisen  C = (1/n) · XᵀX.
  3. Finn egenvektorer av C.
  4. Sortér etter egenverdi (størst først).
  5. Topp k egenvektorer = "principal components" —
     retningene med MEST varians.
  6. Projisér dataen på disse: dimensjons-reduksjon!

Intuisjon:
  Egenvektorene peker langs hovedaksene av data-skyen.
  Egenverdiene sier hvor mye varians langs hver akse.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Bro til ML:</strong> PCA er den klassiske dimensjons-reduksjons-teknikken.
            Brukes for visualisering, kompresjon, og før klustering når man har for mange
            features.
          </p>
        </section>

        <section id="basis" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Basis, dimensjon, rang</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tre nært beslektede begreper. Tilsammen forteller de hvor «stor» et
            vektorrom eller en matrise-bilde er.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Lineær kombinasjon:
  Σ cᵢ · vᵢ    der cᵢ er skalarer

Lineært uavhengige vektorer:
  Σ cᵢ · vᵢ = 0   krever   alle cᵢ = 0

Basis for ℝⁿ:
  Et sett av n lineært uavhengige vektorer som spenner hele rommet.
  Standardbasis i ℝ³:  e₁ = (1,0,0),  e₂ = (0,1,0),  e₃ = (0,0,1)

Dimensjon:
  Antall vektorer i en (hvilken som helst) basis.
  dim(ℝⁿ) = n

Rang av en matrise A:
  Antall lineært uavhengige rader (= antall lineært uavhengige kolonner).

  Full rang m×n-matrise (m ≤ n):  rang = m
  Singulær (kvadratisk uten invers):  rang < n`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Hvorfor det betyr noe
            </div>
            <ul className="space-y-1.5 text-sm text-foreground list-disc pl-5">
              <li>
                Ax = b har løsning hvis og bare hvis b er i kolonne-rommet til A
                (dvs. en lineær kombinasjon av kolonnene).
              </li>
              <li>
                Lav rang i en datamatrise = redundans i features. PCA utnytter dette.
              </li>
              <li>
                I nevrale nett: hvert lag er en matrise. Hvis rangen kollapser
                (mange identiske rader/kolonner) lærer ikke modellen.
              </li>
            </ul>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : vektor-addisjon, indreprodukt, matrise-mult, egenvektor-intuisjon.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "nn-intro" }} className="text-brand hover:underline">
                Nevrale nett — innføring
              </Link>
              : hvert lag er <code>Wx + b</code> + aktivering.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "unsupervised-learning" }} className="text-brand hover:underline">
                Unsupervised learning
              </Link>
              : PCA-seksjonen bruker egenvektorer direkte.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
