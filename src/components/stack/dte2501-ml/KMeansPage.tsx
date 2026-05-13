import { Link } from "@tanstack/react-router";
import { Lightbulb, Layers, AlertTriangle, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { KMeansAnimator } from "./KMeansAnimator";
import { Tex, TexBlock } from "@/components/Tex";

const STEPS = [
  { title: "Hvorfor klustring?", anchor: "intro" },
  { title: "k-Means-algoritmen", anchor: "algo" },
  { title: "Visualisering — én iterasjon", anchor: "viz" },
  { title: "Velge k — elbow og silhouette", anchor: "k-choice" },
  { title: "Når k-Means feiler", anchor: "fails" },
  { title: "Sammenligning — hierarkisk klustring", anchor: "hierarchical" },
  { title: "Pseudokode + sklearn", anchor: "code" },
  { title: "Eksamen-typiske spørsmål", anchor: "exam" },
];

export function KMeansPage() {
  return (
    <StackPageShell title="k-Means clustering" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · Unsupervised learning
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            k-Means — finn k grupper uten etiketter
          </h1>
          <p className="mt-3 text-muted-foreground">
            k-Means er den vanligste klustring-algoritmen. Du forteller den HVOR
            MANGE grupper (k), og den finner sentrene som best forklarer dataen.
            Brukt overalt: kundesegmentering, fargekvantisering, anomalideteksjon.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Sentralt:</span> alternér mellom 1)
              tilordne hvert punkt til nærmeste sentrum, 2) flytte hvert sentrum
              til snittet av sine punkter. Konvergerer på lokalt optimum.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2501-kmeans" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor klustring?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Du har data — men ingen etiketter. Du vil oppdage struktur. Det er
            unsupervised learning.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Supervised (lin.reg, k-NN):
    Input: (X, y) → modell f: X → y
    Spørsmål: «hva er y?»

Unsupervised (k-Means, GMM, PCA):
    Input: X (uten y)
    Spørsmål: «hva er strukturen i X?»

Klustring = «inndel X i k grupper sånn at punkter i samme
gruppe ligner hverandre, og punkter i ulike grupper er
forskjellige».`}</pre>
          </div>
        </section>

        <section id="algo" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. k-Means-algoritmen</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Også kjent som «Lloyd's algorithm». Fire trinn, alterneres til
            konvergens.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Input: data <Tex>{"X = \\{x_1, \\ldots, x_n\\}"}</Tex>, antall klustre <Tex>{"k"}</Tex>.
              Output: sentre <Tex>{"\\mu_1, \\ldots, \\mu_k"}</Tex> og tilordning <Tex>{"c(i) \\in \\{1, \\ldots, k\\}"}</Tex>.
            </p>

            <div className="font-semibold pt-2">1. Init</div>
            <p className="text-xs text-muted-foreground">Velg <Tex>{"k"}</Tex> start-sentre tilfeldig (eller bedre: k-Means++).</p>

            <div className="font-semibold pt-2">2. Assign (E-steg) — tilordne til nærmeste sentrum:</div>
            <TexBlock>{"c(i) \\leftarrow \\arg\\min_{j} \\, \\|x_i - \\mu_j\\|^2"}</TexBlock>

            <div className="font-semibold pt-2">3. Update (M-steg) — flytt sentrum til snittet av sine punkter:</div>
            <TexBlock>{"\\mu_j \\leftarrow \\frac{1}{|C_j|} \\sum_{i \\in C_j} x_i"}</TexBlock>

            <div className="font-semibold pt-2">4. Stopp</div>
            <p className="text-xs text-muted-foreground">Sentrene flytter seg ikke lenger (konvergens), eller etter <Tex>{"\\mathrm{max\\_iter}"}</Tex> iterasjoner.</p>

            <div className="font-semibold pt-2">Objektivfunksjon (inertia / WCSS):</div>
            <TexBlock>{"J = \\sum_{i=1}^n \\|x_i - \\mu_{c(i)}\\|^2"}</TexBlock>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Konvergens:</strong> J synker (eller står stille) i hver iterasjon. Algoritmen
            garanterer å finne et <em>lokalt</em> optimum, ikke globalt.
            Derfor: kjør flere ganger med ulik init (sklearn{" "}
            <code className="font-mono">n_init=10</code>) og behold beste.
          </p>
          <div className="mt-4">
            <KMeansAnimator />
          </div>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Tips:</span> bruk alltid{" "}
              <code className="font-mono">init=&quot;k-means++&quot;</code> og{" "}
              <code className="font-mono">n_init=10</code>. K-Means++ velger
              start-sentre som ligger spredt fra hverandre, og n_init kjører hele
              algoritmen ti ganger og beholder beste run. Sammen reduserer de
              risiko for dårlig lokalt optimum med en størrelsesorden.
            </div>
          </div>
        </section>

        <section id="viz" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Visualisering — én iterasjon</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Start (k=2, init tilfeldig):

        ●  ●           ●  = data
      ●   ●  ●         ★  = sentrum (tilfeldig start)
        ★            ●
            ●  ●
        ●     ★
        ●  ●

Iter 1 ASSIGN: hver ● går til nærmeste ★

        A  A           A  = klustre 1 (tilhører øvre ★)
      A   ★  A         B  = klustre 2 (tilhører nedre ★)
                     B
            B  B
        B     ★
        B  B

Iter 1 UPDATE: hvert ★ flyttes til snittet av sine bokstaver

        A  A
      A  ★  A         (★ flyttet litt opp)
                  B
            B  B
        B  ★  B       (★ flyttet litt høyre/ned)
        B

Gjentar... til ingen ★ flytter seg.`}</pre>
          </div>
        </section>

        <section id="k-choice" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Velge k — elbow og silhouette</h2>
          <p className="text-sm text-muted-foreground mb-4">
            k-Means tar k som input — men hvor mange klustre BØR du ha? To
            standard-metoder:
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Elbow-metoden:
    Kjør k-Means for k = 1, 2, 3, ..., 10.
    Plott inertia J(k) = sum av kvadrerte avstander.
    J synker monotont — men «albuen» viser optimal k.

       J(k)
        ↑
     ██ │●
        │ ●
        │  ●●
        │    ●●●           ← "albue" rundt k=4
        │       ●●●●●●●●●
        └──────────────────→  k
        1 2 3 4 5 6 7 8 9 10

`}</pre>
            <div className="mt-4 space-y-2 text-sm">
              <div className="font-semibold">Silhouette-koeffisient <Tex>{"s(i) \\in [-1, 1]"}</Tex>:</div>
              <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-0.5">
                <li><Tex>{"a(i)"}</Tex> = snitt-avstand fra <Tex>{"x_i"}</Tex> til andre i SAMME klustre</li>
                <li><Tex>{"b(i)"}</Tex> = snitt-avstand fra <Tex>{"x_i"}</Tex> til punkter i NÆRMESTE andre klustre</li>
              </ul>
              <TexBlock>{"s(i) = \\frac{b(i) - a(i)}{\\max\\{a(i),\\, b(i)\\}}"}</TexBlock>
              <p className="text-xs text-muted-foreground">
                <Tex>{"s \\approx 1"}</Tex>: godt plassert. <Tex>{"s \\approx 0"}</Tex>: på grensa. <Tex>{"s < 0"}</Tex>: feil plassert.
                Velg <Tex>{"k"}</Tex> som maks snitt-silhouette over alle punkter.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Metode</th>
                  <th className="text-left font-semibold px-4 py-2">Hva måles</th>
                  <th className="text-left font-semibold px-4 py-2">Velg k som</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Elbow (WCSS)</td>
                  <td className="px-4 py-2 text-muted-foreground">Sum kvadrert avstand til sentrum</td>
                  <td className="px-4 py-2 text-muted-foreground">Albuen — der kurven knekker</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Silhouette</td>
                  <td className="px-4 py-2 text-muted-foreground">Hvor «riktig» plassert hvert punkt er</td>
                  <td className="px-4 py-2 text-muted-foreground">Maks snitt-silhouette ∈ [−1, 1]</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Gap statistic</td>
                  <td className="px-4 py-2 text-muted-foreground">WCSS sammenlignet med uniform null-data</td>
                  <td className="px-4 py-2 text-muted-foreground">Minste k der gap(k) ≥ gap(k+1) − sₖ₊₁</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Davies-Bouldin</td>
                  <td className="px-4 py-2 text-muted-foreground">Snitt-likhet mellom hvert klustre og sitt nærmeste</td>
                  <td className="px-4 py-2 text-muted-foreground">Lavest DB-indeks</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Calinski-Harabasz</td>
                  <td className="px-4 py-2 text-muted-foreground">Ratio mellom inter- og intra-klustre-spredning</td>
                  <td className="px-4 py-2 text-muted-foreground">Høyest CH-skår</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="fails" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Når k-Means feiler</h2>
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Ikke-konvekse klustre</div>
              <p className="text-xs text-muted-foreground">
                k-Means antar at klustre er kuleformede. To halvmåner som vikler seg
                rundt hverandre vil bli delt på «midten» — feil. Bruk DBSCAN eller
                spectral clustering i stedet.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Veldig ulik klustre-størrelse</div>
              <p className="text-xs text-muted-foreground">
                Hvis ett klustre har 10000 punkter og et annet har 50, vil sentret
                til det lille klustret bli «dratt» mot det store.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Sensitiv for init</div>
              <p className="text-xs text-muted-foreground">
                Dårlig start = dårlig lokalt minimum. Bruk{" "}
                <code className="font-mono">k-Means++</code>: velg første sentrum
                tilfeldig, deretter velg neste med sannsynlighet proporsjonal med
                avstanden til nærmeste eksisterende sentrum.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Krever skalerte features</div>
              <p className="text-xs text-muted-foreground">
                Som k-NN: distansemål er sensitiv for skala. Bruk{" "}
                <code className="font-mono">StandardScaler</code>.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Felle:</span> tre datageometrier knuser
              k-Means — <strong>ikke-konvekse</strong> former (halvmåner, ringer),
              klustre med <strong>veldig ulik størrelse</strong> (overrepresentert
              vinner), og klustre med <strong>ulik tetthet</strong> (de tette blir
              splittet). Hvis du ser en av disse i en EDA-plot, bruk DBSCAN,
              spectral clustering eller GMM i stedet.
            </div>
          </div>
        </section>

        <section id="hierarchical" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Sammenligning — hierarkisk klustring</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`                k-Means                          Hierarkisk (agglomerativ)
Antar k:        Ja — du må bestemme på forhånd    Nei — bygger tre, klipp etterpå
Output:         flat partisjon i k grupper       dendrogram (helt tre)
Kompleksitet:   O(n·k·iter)                       O(n²) til O(n³)
Skalerer til:   millioner av punkter             ~10 000 punkter
Klustre-form:   kuleformet                        vilkårlig (avhengig av linkage)
Reproducerbar:  bare med n_init=mange + seed     deterministisk

Når bruke hva?
  - k-Means: stor data, du vet hvor mange grupper, kuleformede
  - Hierarkisk: liten data, vil utforske ulike k visuelt`}</pre>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Egenskap</th>
                  <th className="text-left font-semibold px-4 py-2">k-Means</th>
                  <th className="text-left font-semibold px-4 py-2">Hierarkisk</th>
                  <th className="text-left font-semibold px-4 py-2">DBSCAN</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Klustre-form</td>
                  <td className="px-4 py-2 text-muted-foreground">Kuleformet</td>
                  <td className="px-4 py-2 text-muted-foreground">Vilkårlig (linkage)</td>
                  <td className="px-4 py-2 text-muted-foreground">Vilkårlig</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">k på forhånd</td>
                  <td className="px-4 py-2 text-muted-foreground">Ja</td>
                  <td className="px-4 py-2 text-muted-foreground">Nei (kuttes etterpå)</td>
                  <td className="px-4 py-2 text-muted-foreground">Nei (ε + minPts styrer)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Ytelse</td>
                  <td className="px-4 py-2 text-muted-foreground">O(n·k·iter) — rask</td>
                  <td className="px-4 py-2 text-muted-foreground">O(n²)–O(n³) — treg</td>
                  <td className="px-4 py-2 text-muted-foreground">O(n log n) med index</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Outliers</td>
                  <td className="px-4 py-2 text-muted-foreground">Dras inn i klustre</td>
                  <td className="px-4 py-2 text-muted-foreground">Dras inn (kort linkage)</td>
                  <td className="px-4 py-2 text-muted-foreground">Markeres som «noise»</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Beste på</td>
                  <td className="px-4 py-2 text-muted-foreground">Stor, kuleformet data</td>
                  <td className="px-4 py-2 text-muted-foreground">Utforske struktur visuelt</td>
                  <td className="px-4 py-2 text-muted-foreground">Tetthetsbasert, ujevn data</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="code" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Pseudokode + sklearn</h2>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function k_means(X, k, max_iter=300):
    centers = pick_k_random_points(X, k)        # eller k-Means++
    for iter in 1..max_iter:
        # ASSIGN
        labels = [argmin_j(dist(x, centers[j])) for x in X]
        # UPDATE
        new_centers = [mean(X[labels==j]) for j in 1..k]
        if all(centers[j] == new_centers[j]):
            break                                # konvergert
        centers = new_centers
    return centers, labels`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import make_blobs
import numpy as np

X, _ = make_blobs(n_samples=300, centers=4, random_state=0)
X_s = StandardScaler().fit_transform(X)

km = KMeans(n_clusters=4, n_init=10, random_state=0)
labels = km.fit_predict(X_s)

print(f"Inertia: {km.inertia_:.2f}")
print(f"Sentre: {km.cluster_centers_}")`}</pre>
          </div>
        </section>

        <section id="exam" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Eksamen-typiske spørsmål</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">«Beskriv k-Means-algoritmen.»</strong>{" "}
              Init → assign → update → stopp ved konvergens. Minimerer WCSS.
            </li>
            <li>
              <strong className="text-foreground">«Hvordan velge k?»</strong>{" "}
              Elbow eller silhouette.
            </li>
            <li>
              <strong className="text-foreground">«Hvorfor garanterer ikke k-Means globalt optimum?»</strong>{" "}
              Fordi den finner et lokalt minimum av en ikke-konveks
              objektivfunksjon. Avhenger av init. Løsning: n_init=10.
            </li>
            <li>
              <strong className="text-foreground">«k-Means vs k-NN — forskjell?»</strong>{" "}
              k-NN er supervised (klassifikasjon/regresjon, krever labels). k-Means
              er unsupervised (klustring, ingen labels). Begge bruker avstand.
            </li>
            <li>
              <strong className="text-foreground">«Hvorfor feiler k-Means på halvmåner?»</strong>{" "}
              Den antar kuleformede klustre — minimerer kvadrert avstand til
              sentrum.
            </li>
          </ul>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Layers className="h-4 w-4 text-brand" />
            Neste steg
          </h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2501-gmm" }} className="text-brand hover:underline">
                Gaussian Mixture Models
              </Link>{" "}
              — k-Means' probabilistiske storesøster.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2501-pca" }} className="text-brand hover:underline">
                PCA
              </Link>{" "}
              for å visualisere klustringen i 2D.
            </li>
            <li>
              Drag-øvelser med topic «k-Means» og Python-øvelser med{" "}
              <code className="font-mono">make_blobs</code>.
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
