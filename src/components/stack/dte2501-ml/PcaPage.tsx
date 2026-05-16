import { Link } from "@tanstack/react-router";
import { Lightbulb, Axis3D, AlertTriangle, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { PcaProjector } from "./PcaProjector";
import { Tex, TexBlock } from "@/components/Tex";

const STEPS = [
  { title: "Hvorfor dimensjonsreduksjon?", anchor: "why" },
  { title: "Intuisjon — finn aksene med mest varians", anchor: "intuition" },
  { title: "Kovariansmatrisen", anchor: "cov" },
  { title: "Egenvektorer og egenverdier", anchor: "eig" },
  { title: "Steg-for-steg PCA-algoritme", anchor: "algo" },
  { title: "Forklart varians + scree plot", anchor: "explained" },
  { title: "Anvendelser", anchor: "uses" },
  { title: "Pseudokode + sklearn", anchor: "code" },
];

export function PcaPage() {
  return (
    <StackPageShell title="Principal Component Analysis" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · Dimensjonsreduksjon
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            PCA — komprimer features, behold varians
          </h1>
          <p className="mt-3 text-muted-foreground">
            Mange features er korrelerte. PCA finner de aksene som forklarer mest
            varians i dataen, og projiserer alt på de få viktigste. Resultat:
            færre dimensjoner, samme info.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Sentralt:</span> egenvektorene til
              kovariansmatrisen er de nye aksene. Egenverdiene er hvor mye varians
              hver akse forklarer.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2501-pca" steps={STEPS} />

        <section id="why" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor dimensjonsreduksjon?</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Bra grunner til å redusere antall features (d):

1. VISUALISERING
   Vi tegner data i 2D eller 3D. Med d=100 features er det umulig.
   PCA → topp 2 PC-er → scatter plot.

2. COMPUTE-TID
   Mange algoritmer er O(d²) eller O(d³). 1000 features → 1M tids-faktor.

3. CURSE OF DIMENSIONALITY
   k-NN, GMM og andre distansebaserte algoritmer dør i høy d.

4. STØY-FJERNING
   De minste PC-ene fanger ofte målestøy. Kasterer dem → renere signal.

5. STORAGE / KOMPRESJON
   Bilde-kompresjon, ansiktsgjenkjenning (eigenfaces).

OBS: PCA er IKKE feature-seleksjon. Hver PC er en lineær kombinasjon
av ALLE originale features. Du har «lost» tolking av enkeltkolonner.`}</pre>
          </div>
        </section>

        <section id="intuition" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Intuisjon — finn aksene med mest varians</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Datasett i 2D (to features x₁ og x₂, korrelerte):

   x₂
    ↑
  5 │              ●
  4 │           ●  ●
  3 │        ●  ●         PC1 = retning med MEST spredning
  2 │     ●  ●            (diagonal her)
  1 │  ●  ●
  0 │●                    PC2 = vinkelrett på PC1, NEST mest spredning
    └────────────→ x₁

PC1 fanger 90% av variansen.
PC2 fanger resterende 10% — kan kanskje droppes.

Vi har "rotert" koordinatsystemet til en mer informativ basis.

Etter PCA (samme datapunkter, nye akser):

   PC2
    ↑
    │
  0 │ ─●─●─●─●─●─●─●─●─●─●─→  PC1
    │`}</pre>
          </div>
        </section>

        <section id="cov" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Kovariansmatrisen</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Kovariansmatrisen oppsummerer hvordan features varierer SAMMEN.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              For data <Tex>{"X"}</Tex> med <Tex>{"n"}</Tex> rader og <Tex>{"d"}</Tex> kolonner, etter sentrering (trekk fra snitt):
            </p>
            <TexBlock>{"\\Sigma = \\frac{1}{n-1} X^\\top X \\quad (d \\times d)"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Element <Tex>{"\\Sigma_{ij}"}</Tex> = kovarians mellom feature <Tex>{"i"}</Tex> og <Tex>{"j"}</Tex>.
            </p>
            <div className="font-semibold pt-1">For <Tex>{"d = 2"}</Tex>:</div>
            <TexBlock>{"\\Sigma = \\begin{pmatrix} \\mathrm{Var}(x_1) & \\mathrm{Cov}(x_1, x_2) \\\\ \\mathrm{Cov}(x_1, x_2) & \\mathrm{Var}(x_2) \\end{pmatrix}"}</TexBlock>
            <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-0.5">
              <li>Symmetrisk: <Tex>{"\\Sigma_{ij} = \\Sigma_{ji}"}</Tex></li>
              <li>Positiv semi-definit</li>
              <li>Diagonal = varians av hver feature; off-diagonal = korrelasjons-info</li>
            </ul>
          </div>
        </section>

        <section id="eig" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Egenvektorer og egenverdier</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Husker du fra lineær algebra: en egenvektor <Tex>{"v"}</Tex> av matrisen <Tex>{"A"}</Tex> oppfyller <Tex>{"Av = \\lambda v"}</Tex> — matrisen «strekker» <Tex>{"v"}</Tex> uten å rotere den. <Tex>{"\\lambda"}</Tex> er egenverdien (skaleringsfaktoren).
          </p>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <div className="font-semibold">For kovariansmatrisen <Tex>{"\\Sigma"}</Tex>:</div>
            <TexBlock>{"\\Sigma\\, v_i = \\lambda_i\\, v_i, \\quad i = 1, 2, \\ldots, d"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              <Tex>{"v_1, v_2, \\ldots, v_d"}</Tex>: egenvektorer (PC-er, ortonormale akser). <Tex>{"\\lambda_1 \\geq \\lambda_2 \\geq \\cdots \\geq \\lambda_d"}</Tex>: egenverdier sortert avtakende.
            </p>
            <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-0.5">
              <li><Tex>{"v_i"}</Tex> = retningen til den <Tex>{"i"}</Tex>-te hovedkomponenten</li>
              <li><Tex>{"\\lambda_i"}</Tex> = HVOR MYE varians langs den retningen</li>
            </ul>
            <TexBlock>{"\\sum_{i=1}^d \\lambda_i = \\text{total varians}"}</TexBlock>
            <p className="text-xs text-muted-foreground">For PCA velger vi de <Tex>{"k"}</Tex> største egenverdiene <Tex>{"\\Rightarrow"}</Tex> bevarer mest varians.</p>
          </div>
        </section>

        <section id="algo" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Steg-for-steg PCA-algoritme</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>Input: <Tex>{"X \\;(n \\times d)"}</Tex>. Output: <Tex>{"X_{\\mathrm{red}} \\;(n \\times k)"}</Tex>, <Tex>{"k < d"}</Tex>.</p>
            <div className="font-semibold pt-2">Steg 1: Sentrér</div>
            <TexBlock>{"x_j \\leftarrow x_j - \\mathrm{mean}(x_j)"}</TexBlock>
            <div className="font-semibold pt-1">Steg 2: Skalér (valgfritt)</div>
            <TexBlock>{"x_j \\leftarrow \\frac{x_j}{\\mathrm{std}(x_j)}"}</TexBlock>
            <div className="font-semibold pt-1">Steg 3: Kovariansmatrise</div>
            <TexBlock>{"\\Sigma = \\frac{1}{n-1} X^\\top X"}</TexBlock>
            <div className="font-semibold pt-1">Steg 4: Egen-dekomposisjon</div>
            <TexBlock>{"\\Sigma v_i = \\lambda_i v_i, \\quad \\lambda_1 \\geq \\lambda_2 \\geq \\cdots \\geq \\lambda_d"}</TexBlock>
            <div className="font-semibold pt-1">Steg 5: Velg top-<Tex>{"k"}</Tex></div>
            <TexBlock>{"V_k = [v_1 \\mid v_2 \\mid \\cdots \\mid v_k] \\;\\; (d \\times k)"}</TexBlock>
            <div className="font-semibold pt-1">Steg 6: Projisér</div>
            <TexBlock>{"X_{\\mathrm{red}} = X V_k"}</TexBlock>
            <p className="text-xs text-muted-foreground pt-2">
              I praksis brukes SVD i stedet for egendekomp. for numerisk stabilitet: <Tex>{"X = U S V^\\top"}</Tex>. PC-ene er kolonnene i <Tex>{"V"}</Tex>, og <Tex>{"\\lambda_i = \\sigma_i^2 / (n-1)"}</Tex>.
            </p>
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Steg</th>
                  <th className="text-left font-semibold px-4 py-2">Operasjon</th>
                  <th className="text-left font-semibold px-4 py-2">Formel / output</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">1. Sentrér</td>
                  <td className="px-4 py-2 text-muted-foreground">Trekk fra kolonne-snitt</td>
                  <td className="px-4 py-2 font-mono text-xs">xⱼ ← xⱼ − μⱼ</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">2. Skalér</td>
                  <td className="px-4 py-2 text-muted-foreground">Del på standardavvik (ofte)</td>
                  <td className="px-4 py-2 font-mono text-xs">xⱼ ← xⱼ / σⱼ</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">3. Kovarians</td>
                  <td className="px-4 py-2 text-muted-foreground">Beregn d × d kovariansmatrise</td>
                  <td className="px-4 py-2 font-mono text-xs">Σ = (1/(n−1)) XᵀX</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">4. Egen</td>
                  <td className="px-4 py-2 text-muted-foreground">Egenvektorer + egenverdier</td>
                  <td className="px-4 py-2 font-mono text-xs">Σvᵢ = λᵢvᵢ</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">5. Sortér</td>
                  <td className="px-4 py-2 text-muted-foreground">Avtakende på λ, velg top-k</td>
                  <td className="px-4 py-2 font-mono text-xs">Vₖ = [v₁ ... vₖ]</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">6. Projisér</td>
                  <td className="px-4 py-2 text-muted-foreground">Multipliser data med Vₖ</td>
                  <td className="px-4 py-2 font-mono text-xs">X_red = X · Vₖ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="explained" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Forklart varians + scree plot</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <div className="font-semibold">Forklart varians per PC:</div>
            <TexBlock>{"\\mathrm{explained\\_var}(i) = \\frac{\\lambda_i}{\\sum_j \\lambda_j}"}</TexBlock>
            <div className="font-semibold">Kumulativ:</div>
            <TexBlock>{"\\mathrm{cumul}(k) = \\frac{\\sum_{i=1}^k \\lambda_i}{\\sum_j \\lambda_j}"}</TexBlock>
            <p className="text-xs text-muted-foreground">"Vi beholder <Tex>{"\\mathrm{cumul}(k)"}</Tex> av variansen."</p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`SCREE PLOT — egenverdiene sortert avtakende:

   │ ●
   │  ●
   │     "knekk" ← her bør vi kutte
   │   ●
   │      ●  ●  ●  ●
   └────────────────────────→  i (PC nummer)
     1  2  3  4  5  6  7  8`}</pre>
            <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-0.5">
              <li>Behold <Tex>{"k"}</Tex> PCs så <Tex>{"\\mathrm{cumul}(k) \\geq 0.90"}</Tex> eller <Tex>{"0.95"}</Tex></li>
              <li>Eller bruk knekken i scree plot</li>
              <li>Kaiser-kriteriet: behold PCs med <Tex>{"\\lambda_i > 1"}</Tex> (etter standardisering)</li>
            </ul>
          </div>
          <div className="mt-4">
            <PcaProjector />
          </div>
        </section>

        <section id="uses" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Anvendelser</h2>
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Visualisering</div>
              <p className="text-xs text-muted-foreground">
                Iris-datasettet har 4 features. PCA → 2 PC-er → klustringen blir
                synlig i et 2D scatter plot.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Eigenfaces</div>
              <p className="text-xs text-muted-foreground">
                Ansiktsgjenkjenning: ansikter er bilder i ℝ^(64·64) = 4096-dim.
                PCA gir ~50 «eigenfaces» — lineære kombinasjoner som rekonstruerer
                de fleste ansiktene rimelig bra.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Preprocessing for k-NN</div>
              <p className="text-xs text-muted-foreground">
                Kjør PCA først for å fjerne korrelerte features og redusere d før
                k-NN — bekjemper curse of dimensionality.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Bilde-kompresjon</div>
              <p className="text-xs text-muted-foreground">
                Behold bare topp PCs, rekonstruér resten — mister litt detalj.
                JPEG bruker beslektet idé (DCT, ikke PCA, men samme filosofi).
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Metode</th>
                  <th className="text-left font-semibold px-4 py-2">Lineær?</th>
                  <th className="text-left font-semibold px-4 py-2">Supervisert?</th>
                  <th className="text-left font-semibold px-4 py-2">Bruksområde</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">PCA</td>
                  <td className="px-4 py-2 text-muted-foreground">Ja</td>
                  <td className="px-4 py-2 text-muted-foreground">Nei</td>
                  <td className="px-4 py-2 text-muted-foreground">Komprimere features, pre-prosessering</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">t-SNE</td>
                  <td className="px-4 py-2 text-muted-foreground">Nei</td>
                  <td className="px-4 py-2 text-muted-foreground">Nei</td>
                  <td className="px-4 py-2 text-muted-foreground">2D-visualisering av klustre, bevarer lokal struktur</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">UMAP</td>
                  <td className="px-4 py-2 text-muted-foreground">Nei</td>
                  <td className="px-4 py-2 text-muted-foreground">Valgfritt</td>
                  <td className="px-4 py-2 text-muted-foreground">Som t-SNE, men raskere og bevarer global form</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">LDA</td>
                  <td className="px-4 py-2 text-muted-foreground">Ja</td>
                  <td className="px-4 py-2 text-muted-foreground">Ja (krever labels)</td>
                  <td className="px-4 py-2 text-muted-foreground">Maks separasjon mellom klasser</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Autoencoder</td>
                  <td className="px-4 py-2 text-muted-foreground">Nei</td>
                  <td className="px-4 py-2 text-muted-foreground">Nei (self-superv.)</td>
                  <td className="px-4 py-2 text-muted-foreground">Ikke-lineær komprimering, bilder, sekvenser</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Når PCA ikke gir mening:</span>{" "}
              (1) binær eller kategorisk data — kovarians er meningsløst, bruk MCA
              eller embedding; (2) ikke-lineær struktur (manifold som halvmåner,
              swiss roll) — PCA forkortes; bruk t-SNE/UMAP/autoencoder; (3) du
              trenger tolkbare features etterpå — PC-ene er lineære miks av
              originaler, navngiingen er borte.
            </div>
          </div>
        </section>

        <section id="code" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Pseudokode + sklearn</h2>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function pca(X, k):
    X_c = X − mean(X, axis=0)             # sentrér
    Σ = (1 / (n−1)) * X_c.T @ X_c          # kovariansmatrise (d × d)
    eigenvalues, eigenvectors = eig(Σ)
    sort_idx = argsort(eigenvalues)[::-1]  # desc
    V_k = eigenvectors[:, sort_idx[:k]]     # topp k egenvektorer
    return X_c @ V_k, V_k, eigenvalues`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import load_iris
import numpy as np

X, y = load_iris(return_X_y=True)
X_s = StandardScaler().fit_transform(X)

pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_s)

print(f"Forklart varians: {pca.explained_variance_ratio_}")
print(f"Sum: {pca.explained_variance_ratio_.sum():.3f}")
# → [0.73, 0.23], sum ≈ 0.96 — to PCer beholder 96% av variansen!`}</pre>
          </div>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Axis3D className="h-4 w-4 text-brand" />
            Neste steg
          </h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2501-gmm" }} className="text-brand hover:underline">
                GMM — generative modeller
              </Link>{" "}
              for en annen unsupervised metode.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "linaer-algebra" }} className="text-brand hover:underline">
                Lineær algebra
              </Link>{" "}
              hvis egenvektorer er rustent.
            </li>
            <li>
              Drag-øvelser med topic «PCA» og Python-øvelser med Iris.
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
