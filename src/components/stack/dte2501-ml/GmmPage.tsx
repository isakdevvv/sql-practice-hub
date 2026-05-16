import { Link } from "@tanstack/react-router";
import { Lightbulb, Sparkles, AlertTriangle, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";
import { lazy, Suspense } from "react";
import { VisualizerSkeleton } from "@/components/visualizer-shell";

const GmmVisualizer = lazy(() =>
  import("./GmmVisualizer").then((m) => ({ default: m.GmmVisualizer })),
);

const STEPS = [
  { title: "Generative vs diskriminative modeller", anchor: "intro" },
  { title: "GMM-formel", anchor: "formula" },
  { title: "EM-algoritmen", anchor: "em" },
  { title: "E-step og M-step i detalj", anchor: "em-detail" },
  { title: "Sammenligning med k-Means", anchor: "vs-kmeans" },
  { title: "Anvendelser", anchor: "uses" },
  { title: "Pseudokode + sklearn", anchor: "code" },
];

export function GmmPage() {
  return (
    <StackPageShell title="Gaussian Mixture Models" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · Generative modeller
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            GMM — k-Means' probabilistiske storesøster
          </h1>
          <p className="mt-3 text-muted-foreground">
            En Gaussian Mixture Model antar at dataen er generert av k forskjellige
            normalfordelinger. Den lærer både sentrum, form og «mikse-vekt» for
            hver — og gir SOFT klustering (sannsynlighet for hvert klustre).
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Sentralt:</span> EM-algoritmen
              veksler mellom E-step (regn ut P(klustre | punkt)) og M-step
              (oppdater parametre med vektede snitt).
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2501-gmm" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Generative vs diskriminative modeller</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`DISKRIMINATIV (k-NN, log.reg, NN):
   Lærer P(y | x) direkte.
   "Gitt at jeg ser x, hva er klassen y?"
   Bare ett mål: bestemme klasse.

GENERATIV (GMM, naive Bayes):
   Lærer P(x, y) = P(x | y) · P(y).
   "Hvis en klassen y produserte data, hvordan ville x sett ut?"
   Vi kan SAMPLE nye datapunkter, oppdage outliers (lav P(x)),
   og fortsatt klassifisere via Bayes: P(y | x) ∝ P(x | y)·P(y).

GMM er generativ + unsupervised:
   Antar data x kommer fra en MIKSTUR av k normalfordelinger.
   Lærer parametrene uten å vite hvilken fordeling hver x kom fra.`}</pre>
          </div>
        </section>

        <section id="formula" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. GMM-formel</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>En GMM med <Tex>{"k"}</Tex> komponenter har parametrene:</p>
            <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-0.5">
              <li><Tex>{"\\pi_j"}</Tex> — miksevekt for komponent <Tex>{"j"}</Tex>, med <Tex>{"\\sum_j \\pi_j = 1"}</Tex></li>
              <li><Tex>{"\\mu_j"}</Tex> — sentrum (mean)</li>
              <li><Tex>{"\\Sigma_j"}</Tex> — kovariansmatrise (form/orientering)</li>
            </ul>

            <div className="font-semibold pt-2">Sannsynlighetsmodellen:</div>
            <TexBlock>{"p(x) = \\sum_{j=1}^k \\pi_j \\, \\mathcal{N}(x \\mid \\mu_j, \\Sigma_j)"}</TexBlock>

            <div className="font-semibold pt-2">Multivariat normalfordeling:</div>
            <TexBlock>{"\\mathcal{N}(x \\mid \\mu, \\Sigma) = \\frac{1}{(2\\pi)^{d/2} |\\Sigma|^{1/2}} \\exp\\!\\left(-\\tfrac{1}{2}(x - \\mu)^\\top \\Sigma^{-1} (x - \\mu)\\right)"}</TexBlock>

            <p className="text-xs text-muted-foreground pt-1">
              <Tex>{"\\pi_j"}</Tex>: hvor mange? <Tex>{"\\mu_j"}</Tex>: hvor? <Tex>{"\\Sigma_j"}</Tex>: hvor stort og hvilken form? Hver komponent kan ha sin egen form — klustre kan være ellipser, ikke bare sirkler som i k-Means.
            </p>
          </div>
        </section>

        <section id="em" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. EM-algoritmen</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Expectation-Maximization. Generelt opplegg for MLE når noen variabler
            er skjult — her er det skjulte hvilken komponent som genererte hver xᵢ.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <div className="font-semibold">Mål: maksimer log-likelihood</div>
            <TexBlock>{"\\ln p(X \\mid \\pi, \\mu, \\Sigma) = \\sum_{i=1}^n \\ln\\!\\left(\\sum_{j=1}^k \\pi_j\\, \\mathcal{N}(x_i \\mid \\mu_j, \\Sigma_j)\\right)"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Direkte optimering er hard (loggen rundt summen). EM finner et lokalt maks ved iterasjon:
            </p>
            <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-0.5">
              <li>Init: tilfeldige <Tex>{"(\\pi, \\mu, \\Sigma)"}</Tex></li>
              <li>Gjenta til konvergens: E-step (beregn ansvar <Tex>{"r(i, j)"}</Tex>), M-step (oppdatér parametre).</li>
              <li>Log-likelihood øker (eller står stille) i hver iterasjon. Konvergens er garantert til LOKALT maks.</li>
            </ul>
          </div>
        </section>

        <section id="em-detail" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. E-step og M-step i detalj</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <div className="font-semibold">E-step — "responsibilities" <Tex>{"r(i, j)"}</Tex>:</div>
            <TexBlock>{"r(i, j) = \\frac{\\pi_j\\, \\mathcal{N}(x_i \\mid \\mu_j, \\Sigma_j)}{\\sum_{l=1}^k \\pi_l\\, \\mathcal{N}(x_i \\mid \\mu_l, \\Sigma_l)}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              <Tex>{"r(i, j) \\in [0, 1]"}</Tex> = sannsynlighet for at <Tex>{"x_i"}</Tex> kom fra komponent <Tex>{"j"}</Tex>. <Tex>{"\\sum_j r(i, j) = 1"}</Tex>.
            </p>

            <div className="font-semibold pt-3">M-step — oppdatér parametrene (vektet snitt):</div>
            <TexBlock>{"N_j = \\sum_{i=1}^n r(i, j) \\quad \\text{(effektivt antall punkter)}"}</TexBlock>
            <TexBlock>{"\\pi_j \\leftarrow \\frac{N_j}{n}"}</TexBlock>
            <TexBlock>{"\\mu_j \\leftarrow \\frac{1}{N_j} \\sum_{i=1}^n r(i, j)\\, x_i"}</TexBlock>
            <TexBlock>{"\\Sigma_j \\leftarrow \\frac{1}{N_j} \\sum_{i=1}^n r(i, j)\\, (x_i - \\mu_j)(x_i - \\mu_j)^\\top"}</TexBlock>

            <p className="text-xs text-muted-foreground pt-2">
              Parallell til k-Means: k-Means bruker hard "winner-take-all" <Tex>{"r(i, j) \\in \\{0, 1\\}"}</Tex>, GMM bruker soft <Tex>{"r(i, j) \\in [0, 1]"}</Tex> og r-vektede snitt.
            </p>
          </div>
          <div className="mt-4">
            <Suspense fallback={<VisualizerSkeleton />}>
            <GmmVisualizer />
          </Suspense>
          </div>
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-28">Step</th>
                  <th className="text-left font-semibold px-4 py-2">Hva som beregnes</th>
                  <th className="text-left font-semibold px-4 py-2">Formel</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">E-step</td>
                  <td className="px-4 py-2 text-muted-foreground">Responsibility: P(komponent j produserte xᵢ)</td>
                  <td className="px-4 py-2 font-mono text-xs">r(i,j) = πⱼN(xᵢ|μⱼ,Σⱼ) / Σₗ πₗN(xᵢ|μₗ,Σₗ)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">M-step π</td>
                  <td className="px-4 py-2 text-muted-foreground">Ny miksevekt</td>
                  <td className="px-4 py-2 font-mono text-xs">πⱼ ← Nⱼ / n, Nⱼ = Σᵢ r(i,j)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">M-step μ</td>
                  <td className="px-4 py-2 text-muted-foreground">Nytt sentrum (vektet snitt)</td>
                  <td className="px-4 py-2 font-mono text-xs">μⱼ ← (1/Nⱼ) Σᵢ r(i,j)·xᵢ</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">M-step Σ</td>
                  <td className="px-4 py-2 text-muted-foreground">Ny kovariansmatrise (vektet)</td>
                  <td className="px-4 py-2 font-mono text-xs">Σⱼ ← (1/Nⱼ) Σᵢ r(i,j)·(xᵢ−μⱼ)(xᵢ−μⱼ)ᵀ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="vs-kmeans" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Sammenligning med k-Means</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`                  k-Means                 GMM (med full kovarians)
Assignment:       hard (én klustre)       soft (sannsynlighet per klustre)
Klustre-form:     kuleformet (sirkel)     ellipse (vilkårlig vridd)
Parametre per k:  d (sentrum)             d + d(d+1)/2 (sentrum + kov.)
Antall klustre:   må kjenne k             må kjenne k (BIC kan velge)
Beregning per i:  O(k·d)                  O(k·d²) — kov-invertering
Init:             tilfeldig eller k-Means++  ofte med k-Means resultat
Probabilistisk:   nei                     ja — kan spørre P(klustre | x)
Sensitiv for skala: ja                    nei (modellerer kovariansen!)

GMM med Σ_j = σ²·I (diagonal og lik) blir nesten k-Means.
GMM med full Σ_j fanger korrelerte features og ellipse-former.`}</pre>
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Egenskap</th>
                  <th className="text-left font-semibold px-4 py-2">k-Means</th>
                  <th className="text-left font-semibold px-4 py-2">GMM</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Tilordning</td>
                  <td className="px-4 py-2 text-muted-foreground">Hard (én klustre)</td>
                  <td className="px-4 py-2 text-muted-foreground">Soft (sannsynlighet over alle)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Klustre-form</td>
                  <td className="px-4 py-2 text-muted-foreground">Sirkler (kuleformet)</td>
                  <td className="px-4 py-2 text-muted-foreground">Ellipser (kovariansen styrer)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Parametre per klustre</td>
                  <td className="px-4 py-2 text-muted-foreground">d (kun sentrum)</td>
                  <td className="px-4 py-2 text-muted-foreground">d + d(d+1)/2 + 1</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Beregning per i</td>
                  <td className="px-4 py-2 text-muted-foreground">O(k·d)</td>
                  <td className="px-4 py-2 text-muted-foreground">O(k·d²) (invertere kovarians)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Modell-valg</td>
                  <td className="px-4 py-2 text-muted-foreground">Elbow/silhouette</td>
                  <td className="px-4 py-2 text-muted-foreground">BIC, AIC (probabilistisk kriterium)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Density / outliers</td>
                  <td className="px-4 py-2 text-muted-foreground">Ikke direkte</td>
                  <td className="px-4 py-2 text-muted-foreground">Ja — lav p(x) = outlier</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Kovarians-type</th>
                  <th className="text-left font-semibold px-4 py-2">Form</th>
                  <th className="text-left font-semibold px-4 py-2">Parametre (k klustre, d dim)</th>
                  <th className="text-left font-semibold px-4 py-2">Bruk når</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">spherical</td>
                  <td className="px-4 py-2 text-muted-foreground">Sirkel (σ²·I)</td>
                  <td className="px-4 py-2 text-muted-foreground">k</td>
                  <td className="px-4 py-2 text-muted-foreground">Mange klustre, lite data per klustre</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">diag</td>
                  <td className="px-4 py-2 text-muted-foreground">Akse-justert ellipse</td>
                  <td className="px-4 py-2 text-muted-foreground">k·d</td>
                  <td className="px-4 py-2 text-muted-foreground">Features ukorrelerte men har ulik skala</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">tied</td>
                  <td className="px-4 py-2 text-muted-foreground">Samme ellipse for alle klustre</td>
                  <td className="px-4 py-2 text-muted-foreground">d(d+1)/2</td>
                  <td className="px-4 py-2 text-muted-foreground">Klustre med antatt lik form</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">full</td>
                  <td className="px-4 py-2 text-muted-foreground">Helt fri ellipse per klustre</td>
                  <td className="px-4 py-2 text-muted-foreground">k·d(d+1)/2</td>
                  <td className="px-4 py-2 text-muted-foreground">Mye data, ulik form per klustre</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Konvergens og lokale optima:</span>{" "}
              EM garanterer at log-likelihood øker monotont, men bare til et{" "}
              <em>lokalt</em> maks. Initialisér med k-Means+ og kjør{" "}
              <code className="font-mono">n_init=5–10</code>. Hvis en kovarians
              kollapser mot 0 (én komponent fanger ett enkelt punkt), legg til
              <code className="font-mono"> reg_covar=1e-6</code> for å unngå singularitet.
            </div>
          </div>
        </section>

        <section id="uses" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Anvendelser</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Density estimation:</strong> p(x)
              fra GMM brukes til å oppdage outliers (lav P(x) = uvanlig).
            </li>
            <li>
              <strong className="text-foreground">Soft clustering:</strong> kundene
              er «70% segment A, 30% segment B» i stedet for forced binær.
            </li>
            <li>
              <strong className="text-foreground">Bakgrunnsmodellering i video:</strong>{" "}
              hver pikselverdi er en mikstur — endring oppdages som lav P(x).
            </li>
            <li>
              <strong className="text-foreground">Speaker identification:</strong>{" "}
              hver person modelleres som GMM over MFCC-features fra stemmen.
            </li>
            <li>
              <strong className="text-foreground">Generativ sampling:</strong>{" "}
              trekk fra modellen for å generere syntetisk data.
            </li>
          </ul>
        </section>

        <section id="code" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Pseudokode + sklearn</h2>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function gmm_em(X, k, max_iter=100, tol=1e-4):
    # Init med k-Means
    centers, labels = kmeans(X, k)
    π = array of k uniform values (1/k each)
    μ = centers
    Σ = [covariance of X[labels==j] for j in 0..k-1]

    prev_ll = -∞
    for iter in 1..max_iter:
        # E-step
        for i, j in product(range(n), range(k)):
            r[i, j] = π[j] * normal_pdf(X[i], μ[j], Σ[j])
        r /= r.sum(axis=1, keepdims=True)  # normalisér

        # M-step
        N_j = r.sum(axis=0)                # (k,)
        π = N_j / n
        μ = (r.T @ X) / N_j[:, None]
        for j in 0..k-1:
            diff = X − μ[j]
            Σ[j] = (r[:, j:j+1] * diff).T @ diff / N_j[j]

        ll = log_likelihood(X, π, μ, Σ)
        if abs(ll − prev_ll) < tol: break
        prev_ll = ll

    return π, μ, Σ, r`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.mixture import GaussianMixture
from sklearn.datasets import make_blobs

X, _ = make_blobs(n_samples=300, centers=3, random_state=0)

gmm = GaussianMixture(n_components=3, covariance_type="full", random_state=0)
gmm.fit(X)

hard_labels = gmm.predict(X)
soft_probs = gmm.predict_proba(X)      # (n, k) — sannsynligheter
print(f"Miksevekt: {gmm.weights_}")
print(f"BIC: {gmm.bic(X):.2f}")        # bruk BIC til å velge k`}</pre>
          </div>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand" />
            Neste steg
          </h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2501-kmeans-clustering" }} className="text-brand hover:underline">
                k-Means
              </Link>{" "}
              for den enklere klustringen.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "bayes" }} className="text-brand hover:underline">
                Bayes
              </Link>{" "}
              for sannsynlighetsbakgrunnen.
            </li>
            <li>
              Drag-øvelser med topic «GMM».
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
        <RelatedVisualizers slug="gmm" />
</div>
    </StackPageShell>
  );
}
