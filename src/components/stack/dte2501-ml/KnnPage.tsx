import { Link } from "@tanstack/react-router";
import { Lightbulb, Boxes, AlertTriangle, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Lazy learning — hva betyr det?", anchor: "lazy" },
  { title: "Klassifikasjon med k-NN", anchor: "classify" },
  { title: "Distansemål", anchor: "distance" },
  { title: "Velge k — bias vs variance", anchor: "k-choice" },
  { title: "k-NN for regresjon", anchor: "regress" },
  { title: "Når k-NN feiler", anchor: "fails" },
  { title: "Pseudokode + sklearn", anchor: "code" },
  { title: "Eksamen-typiske spørsmål", anchor: "exam" },
];

export function KnnPage() {
  return (
    <StackPageShell title="k-Nearest Neighbors" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · Supervised learning
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            k-Nearest Neighbors — den dovne klassifikatoren
          </h1>
          <p className="mt-3 text-muted-foreground">
            k-NN er den enkleste ML-algoritmen som faktisk fungerer. Den lærer
            ingenting under «trening» — den lagrer bare datasettet. All jobben skjer
            når du spør om en prediksjon: finn de k nærmeste eksemplene, og ta
            majoritetsstemmen.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Sentralt:</span> «trening» = lagre data.
              «Prediksjon» = sammenlign med ALLE treningseksemplene. Derfor er k-NN
              rask å trene men treg å predikere.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2501-knn" steps={STEPS} />

        <section id="lazy" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Lazy learning — hva betyr det?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            ML-algoritmer deles grovt i to: «eager» (lærer en modell, kaster
            treningsdataen) og «lazy» (lagrer treningsdataen, slår opp ved spørring).
            k-NN er prototypen på lazy learning.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`              Eager (f.eks. lineær regresjon)     Lazy (k-NN)
              ────────────────────────────────    ─────────────────────────
fit(X, y)   →  Beregn parametre (vektor w)         Lagre kopi av X og y
              (O(n) eller O(n^2))                  (O(n) bare lagre)

predict(x') →  ŷ = w · x'                          For hver xi i X:
              (O(d) — én vektor-dot)                  d_i = dist(x', xi)
                                                  Sorter d, ta de k minste
                                                  Majoritets-/snitt-stemme
                                                  (O(n·d) per prediksjon!)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Konsekvens:</strong> ved 1M treningseksempler og 100 features,
            koster ÉN prediksjon 100M flopps. Det er hvorfor produksjonssystemer
            ofte bruker tre-baserte index (KD-tree, Ball-tree) for k-NN — eller
            bare ikke bruker k-NN.
          </p>
        </section>

        <section id="classify" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Klassifikasjon med k-NN</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Gitt en ny x' og k=5: finn de 5 treningseksemplene som er nærmest x',
            tell hvilken klasse som har flest stemmer, returnér den klassen.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`2D-eksempel, klasser A og B, k=3:

   feature 2
     ↑
   8 │ B   B
   7 │     B   B
   6 │  ?           ← ny punkt x' = (4, 6)
   5 │   A
   4 │ A   A
   3 │     A
     └──────────→  feature 1
       3 4 5 6 7 8

   3 nærmeste til x':
     - A ved (5, 5) — avstand √2
     - B ved (3, 7) — avstand √2
     - A ved (4, 4) — avstand 2
   Stemmer: A=2, B=1 → predikér A.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Vektet stemming:</strong> i stedet for «hver nabo én stemme» kan
            man la stemmen være 1/avstand — nære naboer veier mer. Det reduserer
            problemer ved klassebalanse og dempes hjørne-effekter.
          </p>
        </section>

        <section id="distance" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Distansemål</h2>
          <p className="text-sm text-muted-foreground mb-4">
            «Nærmest» trenger en metrikk. Tre du må kunne for eksamen:
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Euklidsk (p=2) — rett-linje:
    d(x, y) = √( Σ (x_i − y_i)² )

Manhattan (p=1) — bymønster:
    d(x, y) = Σ |x_i − y_i|

Minkowski (generell, parameter p):
    d(x, y) = ( Σ |x_i − y_i|ᵖ )^(1/p)
    p=1 → Manhattan,  p=2 → euklidsk,  p→∞ → Chebyshev (maks-akse).

Cosine (vinkel mellom vektorer — ofte i NLP):
    sim(x, y) = (x · y) / (‖x‖ · ‖y‖)
    d = 1 − sim`}</pre>
          </div>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
            <strong>Kritisk:</strong> features må skaleres FØR k-NN. En kolonne i
            «inntekt» (10⁵) vil dominere over «alder» (10¹). Bruk{" "}
            <code className="font-mono">StandardScaler</code> eller{" "}
            <code className="font-mono">MinMaxScaler</code>.
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Distansemål</th>
                  <th className="text-left font-semibold px-4 py-2">Formel</th>
                  <th className="text-left font-semibold px-4 py-2">Bruksområde</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Euklidsk</td>
                  <td className="px-4 py-2 font-mono text-xs">√Σ(xᵢ − yᵢ)²</td>
                  <td className="px-4 py-2 text-muted-foreground">Default. Kontinuerlige, skalerte features.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Manhattan</td>
                  <td className="px-4 py-2 font-mono text-xs">Σ|xᵢ − yᵢ|</td>
                  <td className="px-4 py-2 text-muted-foreground">Rutenett/byblokk-data, robust mot outliers.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Minkowski</td>
                  <td className="px-4 py-2 font-mono text-xs">(Σ|xᵢ − yᵢ|ᵖ)^(1/p)</td>
                  <td className="px-4 py-2 text-muted-foreground">Generell familie. p=1 Manhattan, p=2 euklidsk.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Mahalanobis</td>
                  <td className="px-4 py-2 font-mono text-xs">√((x−y)ᵀ Σ⁻¹ (x−y))</td>
                  <td className="px-4 py-2 text-muted-foreground">Korrelerte features. Tar hensyn til kovarians.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Cosine</td>
                  <td className="px-4 py-2 font-mono text-xs">1 − (x·y)/(‖x‖‖y‖)</td>
                  <td className="px-4 py-2 text-muted-foreground">Tekst/NLP, sparse vektorer, retning &gt; lengde.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="k-choice" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Velge k — bias vs variance</h2>
          <p className="text-sm text-muted-foreground mb-4">
            k er den eneste hyperparameteren. Den styrer den klassiske
            bias-variance-trade-off:
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`k = 1    Lav bias, høy variance.
         Modellen overfitter — den memoriserer hvert treningspunkt.
         Decision boundary blir uvanlig zigzag.

k = N    Maks bias, null variance.
         Predikerer ALLTID majoritetsklassen — underfitter.

Optimal k ligger imellom. Vanlig: prøv k ∈ {1, 3, 5, 7, ..., √N}
og velg den k som maks cross-validation accuracy.

Tommelfingerregel: k = √N (men kryssvalidér uansett).
Bruk oddetall k for binær klassifikasjon for å unngå uavgjort.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Visuell intuisjon:</strong> liten k = krøllete decision boundary,
            stor k = jevn/glatt boundary.
          </p>

          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Bias-variance trade-off:</span> k er en
              direkte knapp på trade-off-en. Tegn deg en U-formet validation-feil
              over k — bunnen av U-en er optimal k. Til venstre overfitter du
              (høy variance), til høyre underfitter du (høy bias). Cross-validation
              er den eneste pålitelige måten å finne bunnen.
            </div>
          </div>
        </section>

        <section id="regress" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. k-NN for regresjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Samme algoritme, men i stedet for majoritetsstemme tar vi{" "}
            <strong>snittet</strong> av y-verdiene til de k nærmeste naboene.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Klassifikasjon:   ŷ = mode( y_(1), y_(2), ..., y_(k) )
Regresjon:        ŷ = (1/k) · Σ y_(i)              uvektet
                  ŷ = Σ w_i · y_(i)  / Σ w_i      vektet (w_i = 1/d_i)

Brukt med suksess: forutsi boligpris fra nabolagspriser, anbefale
filmer basert på lignende brukere, predikere energibruk fra værdata.`}</pre>
          </div>
        </section>

        <section id="fails" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Når k-NN feiler</h2>
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Curse of dimensionality</div>
              <p className="text-xs text-muted-foreground">
                I høydimensjonale rom blir alle punkter omtrent like langt unna
                hverandre. «Nærmeste nabo» mister mening. Som tommelfingerregel:
                k-NN er upålitelig over ~20 features uten dimensjonsreduksjon
                (se{" "}
                <Link
                  to="/stack/$slug"
                  params={{ slug: "dte2501-pca" }}
                  className="text-brand hover:underline"
                >
                  PCA
                </Link>
                ).
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Ubalanserte klasser</div>
              <p className="text-xs text-muted-foreground">
                Hvis 95% av treningsdata er klasse A, vil de fleste «nabolagene»
                være A — selv om x' er nær en B. Bruk avstands-vektet stemme, eller
                under-/over-sampling før trening.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Treg prediksjon på store N</div>
              <p className="text-xs text-muted-foreground">
                Hver prediksjon er O(N·d). På 1M eksempler er det treigt selv på
                GPU. Løsninger: KD-tree (O(log N) i lav dim), Ball-tree, eller
                approksimative metoder (HNSW, FAISS).
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Sensitiv for støy</div>
              <p className="text-xs text-muted-foreground">
                Med k=1 kan ett feilmerket eksempel ødelegge nabolaget rundt seg.
                Større k jevner dette ut.
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Problem</th>
                  <th className="text-left font-semibold px-4 py-2">Symptom</th>
                  <th className="text-left font-semibold px-4 py-2">Tiltak</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Høy dimensjon</td>
                  <td className="px-4 py-2 text-muted-foreground">Alle avstander likner hverandre, naboer mister mening</td>
                  <td className="px-4 py-2 text-muted-foreground">PCA, feature-seleksjon, gå over til tre-basert modell</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Klasse-ubalanse</td>
                  <td className="px-4 py-2 text-muted-foreground">Majoritetsklasse «svelger» minoriteten i naboutvalget</td>
                  <td className="px-4 py-2 text-muted-foreground">Vektet stemming (1/d), SMOTE, klasse-vekter</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Blandet kategorisk/numerisk</td>
                  <td className="px-4 py-2 text-muted-foreground">Euklidsk avstand er udefinert for kategoriske felter</td>
                  <td className="px-4 py-2 text-muted-foreground">One-hot-encoding, Gower-avstand, eller dele modellen</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Mange treningseksempler</td>
                  <td className="px-4 py-2 text-muted-foreground">Predict er O(N·d) — sekunder per spørring ved 1M rader</td>
                  <td className="px-4 py-2 text-muted-foreground">KD-tree/Ball-tree, ANN-indeks (HNSW, FAISS)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Uskalerte features</td>
                  <td className="px-4 py-2 text-muted-foreground">Én kolonne dominerer alle avstander</td>
                  <td className="px-4 py-2 text-muted-foreground">StandardScaler / MinMaxScaler før fit</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Felle:</span> k-NN ser enkel ut, men er
              treigest av alle pensum-algoritmene <em>i produksjon</em>. Hvis du har
              &gt; 100k treningseksempler eller &gt; 50 dimensjoner, vurder
              alternativer (logistisk regresjon, random forest) før du investerer
              i k-NN-indeksering.
            </div>
          </div>
        </section>

        <section id="code" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Pseudokode + sklearn</h2>
          <p className="text-sm text-muted-foreground mb-4">Først pseudokoden:</p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function knn_predict(X_train, y_train, x_query, k):
    distances = []
    for (x_i, y_i) in zip(X_train, y_train):
        d = distance(x_query, x_i)
        distances.append( (d, y_i) )
    distances.sort()                       # ascending by d
    top_k = distances[0:k]
    labels = [y for (_, y) in top_k]
    return mode(labels)                     # eller mean for regresjon`}</pre>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            scikit-learn-versjonen:
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_iris

X, y = load_iris(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, random_state=0)

# Skalér FØR k-NN — viktig!
scaler = StandardScaler().fit(X_tr)
X_tr_s = scaler.transform(X_tr)
X_te_s = scaler.transform(X_te)

clf = KNeighborsClassifier(n_neighbors=5, weights="distance")
clf.fit(X_tr_s, y_tr)
print(clf.score(X_te_s, y_te))             # ~0.97 på Iris`}</pre>
          </div>
        </section>

        <section id="exam" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Eksamen-typiske spørsmål</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">«Forklar hvorfor k-NN er treg på predict».</strong>{" "}
              Fordi vi MÅ sammenligne mot alle N treningseksempler — O(N·d) per
              prediksjon, ingen modell vi kan «evaluere» raskt.
            </li>
            <li>
              <strong className="text-foreground">«Hva skjer hvis k=1?»</strong>{" "}
              Overfitting — modellen memoriserer treningsdata, blir veldig sensitiv
              for støy.
            </li>
            <li>
              <strong className="text-foreground">«Hvorfor må vi skalere features?»</strong>{" "}
              Fordi distansemål gir mer vekt til kolonner med stor variasjon.
            </li>
            <li>
              <strong className="text-foreground">«Curse of dimensionality?»</strong>{" "}
              I høy dimensjon blir alle punkter «langt unna» hverandre →
              naboer-konseptet kollapser.
            </li>
            <li>
              <strong className="text-foreground">«Sammenligning k-NN vs lineær regresjon?»</strong>{" "}
              k-NN er ikke-parametrisk (kan fange enhver kurve), men treg.
              Lineær er parametrisk (rask), men antar lineær sammenheng.
            </li>
          </ul>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Boxes className="h-4 w-4 text-brand" />
            Neste steg
          </h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2501-supervised-regresjon" }} className="text-brand hover:underline">
                Regresjon — lineær og polynom
              </Link>{" "}
              for det andre supervised-paradigmet.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2501-kmeans-clustering" }} className="text-brand hover:underline">
                k-Means clustering
              </Link>{" "}
              — unsupervised analogi til k-NN.
            </li>
            <li>
              Drag-øvelser med topic «k-NN» i{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link>{" "}
              og Python-øvelser i{" "}
              <Link to="/python" className="text-brand hover:underline">/python</Link>.
            </li>
          </ul>
        </div>
              <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2501" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til DTE-2501-hub
          </Link>
        </div>
</div>
    </StackPageShell>
  );
}
