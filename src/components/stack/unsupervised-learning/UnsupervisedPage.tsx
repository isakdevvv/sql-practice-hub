import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hva unsupervised faktisk er", anchor: "hva" },
  { title: "k-means klustering", anchor: "kmeans" },
  { title: "Velge antall klustere — elbow + silhouette", anchor: "velge-k" },
  { title: "Hierarchical klustering", anchor: "hierarchical" },
  { title: "PCA — dimensjons-reduksjon", anchor: "pca" },
  { title: "Anomalydeteksjon", anchor: "anomaly" },
  { title: "Når skal du IKKE bruke unsupervised", anchor: "ikke" },
];

export function UnsupervisedPage() {
  return (
    <StackPageShell title="Unsupervised learning" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Unsupervised learning
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Unsupervised learning — finn struktur uten fasit
          </h1>
          <p className="mt-3 text-muted-foreground">
            Du har bare <code>X</code>, ingen <code>y</code>. Mål: oppdage mønstre,
            grupperinger, eller redusere antall dimensjoner.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Unsupervised learning».
            </div>
          </div>
        </div>

        <CourseOutline courseId="unsupervised-learning" steps={STEPS} />

        <section id="hva" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva unsupervised faktisk er</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tre hovedtyper:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="rounded-lg border border-border bg-card p-3">
              <strong>Klustering:</strong> grupper datapunkter slik at like er sammen, ulike er adskilt.
              «Hvem av mine kunder ligner hverandre?»
            </li>
            <li className="rounded-lg border border-border bg-card p-3">
              <strong>Dim-reduksjon:</strong> komprimer fra n features til k (k &lt; n) som
              fanger mest variasjon. Nyttig for visualisering og support til andre modeller.
            </li>
            <li className="rounded-lg border border-border bg-card p-3">
              <strong>Anomalydeteksjon:</strong> finn datapunktene som ikke ligner resten.
              Fraud, hardware-failures, mistenkelig nettverkstrafikk.
            </li>
          </ul>
        </section>

        <section id="kmeans" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. k-means klustering</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Den vanligste algoritmen. Du sier på forhånd <em>antall</em> klustere (k); k-means finner sentre.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Algoritmen:
  1. Plassér k senter-punkter tilfeldig
  2. Tilordne hvert datapunkt til nærmeste senter
  3. Oppdater hvert senter til gjennomsnittet av punktene
  4. Repeter 2-3 til ingenting flytter seg

I sklearn:
  from sklearn.cluster import KMeans
  km = KMeans(n_clusters=3, random_state=42, n_init=10)
  km.fit(X_scaled)
  labels = km.labels_         # cluster-id per punkt
  centers = km.cluster_centers_`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Viktig:</strong> SKALÉR features før k-means. Avstand er måleenheten —
            uskalert vil features med stor variasjon dominere.
          </p>
        </section>

        <section id="velge-k" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Velge antall klustere</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Du må gjette k på forhånd. To metoder for å velge:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Elbow-metoden
              </div>
              <p className="text-sm text-foreground mb-2">
                Plot SSE (sum of squared distances til nearest center) vs k. Finn «albuen»
                der kurven flater ut.
              </p>
              <pre className="mt-2 font-mono text-xs rounded bg-background border border-border p-2 overflow-x-auto whitespace-pre">{`for k in range(1, 11):
    km = KMeans(n_clusters=k)
    km.fit(X)
    sses.append(km.inertia_)
plt.plot(range(1,11), sses)`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Silhouette-score
              </div>
              <p className="text-sm text-foreground mb-2">
                Mål hvor godt hvert punkt passer i sitt cluster. Score ∈ [-1, 1]; høyere
                er bedre.
              </p>
              <pre className="mt-2 font-mono text-xs rounded bg-background border border-border p-2 overflow-x-auto whitespace-pre">{`from sklearn.metrics import \\
    silhouette_score
score = silhouette_score(X, labels)`}</pre>
            </div>
          </div>
        </section>

        <section id="hierarchical" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Hierarchical klustering</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Bygger et tre (dendrogram). To strategier: bottom-up (agglomerative) eller
            top-down (divisive). Trenger IKKE forhåndsdefinert k.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Agglomerative:
  1. Start med hvert punkt som eget cluster
  2. Slå sammen de to nærmeste clustrene
  3. Repeter til alt er ett cluster

Til slutt har du et dendrogram. «Klipp» der du vil for å få N klustere.

  from sklearn.cluster import AgglomerativeClustering
  ac = AgglomerativeClustering(n_clusters=3, linkage='ward')`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Linkage</strong> sier hvordan vi måler avstand mellom klustere:
            ward (minimere intern varians), complete (max avstand), average, single.
          </p>
        </section>

        <section id="pca" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. PCA — Principal Component Analysis</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Roter datasettet slik at den FØRSTE aksen fanger mest variasjon, ANDRE
            mest av resten, osv. Behold de øverste k aksene → dim-reduksjon.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.decomposition import PCA

pca = PCA(n_components=2)
X_reduced = pca.fit_transform(X_scaled)   # n_samples × 2

print(pca.explained_variance_ratio_)
# eks: [0.62, 0.18] → PC1 forklarer 62%, PC2 18%
# sum: 80% av variasjonen fanget med 2 dim`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Brukt for:</strong> visualisering (komprimer til 2D), støy-reduksjon,
            speed-up av andre algoritmer. Husk: PCA gir LINEÆR projeksjon — ikke-lineær
            struktur kan kreve t-SNE eller UMAP.
          </p>
        </section>

        <section id="anomaly" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Anomalydeteksjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Finn punktene som er «utypiske». Tre vanlige teknikker:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="rounded-lg border border-border bg-card p-3">
              <strong>Isolation Forest</strong> — bygg trær som isolerer punkter; anomalier
              isoleres i færre splitter.
            </li>
            <li className="rounded-lg border border-border bg-card p-3">
              <strong>Local Outlier Factor</strong> — mål tetthet rundt punktet vs.
              naboene. Lav tetthet = outlier.
            </li>
            <li className="rounded-lg border border-border bg-card p-3">
              <strong>k-means + avstand til senter</strong> — punkter langt fra alle
              senter er mistenkelige.
            </li>
          </ul>
        </section>

        <section id="ikke" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Når skal du IKKE bruke unsupervised</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Hvis du HAR labels.</strong> Unsupervised gir aldri bedre struktur
              enn det labels allerede gir deg. Bruk supervised.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Hvis dataen er svært høydimensjonal og du ikke skalerer.</strong>{" "}
              Avstandsbaserte algoritmer bryter ned. Bruk PCA først, så klustering.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Hvis du forventer perfekt evaluering.</strong> Det finnes ingen
              «fasit» — kvalitetsmål (silhouette, inertia) er heuristikker.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              .
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "nn-intro" }} className="text-brand hover:underline">
                Innføring i nevrale nett
              </Link>
              .
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
