import { Link } from "@tanstack/react-router";
import { Lightbulb, Axis3D, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { PcaInteractiveProjection } from "./PcaInteractiveProjection";
import { Tex, TexBlock } from "@/components/Tex";

const STEPS = [
  { title: "Hva visualiseringen viser", anchor: "intro" },
  { title: "Interaktivt plot — finn PC1 selv", anchor: "live" },
  { title: "Standardiseringen — hvorfor først", anchor: "scale" },
  { title: "Egenvektorer som nye akser", anchor: "eig" },
  { title: "Projeksjon: PC1 alene vs PC1+PC2", anchor: "proj" },
  { title: "Explained variance ratio", anchor: "explained" },
  { title: "Eksamen-hurtigreferanse", anchor: "exam" },
];

export function PcaVisualizerPage() {
  return (
    <StackPageShell title="PCA interaktiv projeksjon" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · Interaktiv visualisering
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            PCA interaktiv projeksjon
          </h1>
          <p className="mt-3 text-muted-foreground">
            Roter selv en akse med slideren og se at ingen retning fanger mer
            varians enn PC1 — egenvektoren til kovariansmatrisen med størst
            egenverdi. Veksle mellom Iris (petal length / petal width) og Wine
            (alcohol / flavanoids), og se projeksjonen ned på første PC eller
            visningen i rotert PC-basis.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Tips:</span> dra slideren langsomt
              fra 0° til 180°. Verdien «din varians» går opp og ned — den når
              maksimum nøyaktig når din akse ligger parallelt med PC1.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2501-pca-visualizer" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva visualiseringen viser</h2>
          <p className="text-sm text-muted-foreground">
            Hvert punkt er en blomst (Iris) eller en vin (Wine), farget etter
            klasse. Aksene er to standardiserte features. PC1 (rød) og PC2
            (lilla) er de to egenvektorene til kovariansmatrisen — ortogonale
            og rangert etter hvor mye varians de fanger. Den gule stiplede
            linjen er <em>din</em> akse fra rotasjons-slideren.
          </p>
        </section>

        <section id="live" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Interaktivt plot — finn PC1 selv</h2>
          <PcaInteractiveProjection />
          <p className="mt-3 text-xs text-muted-foreground">
            Variansen til projeksjoner langs din akse vises i kontroll-panelet.
            Sammenlign med PC1 — du finner aldri en akse med høyere varians.
          </p>
        </section>

        <section id="scale" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Standardiseringen — hvorfor først</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Før PCA: standardiser hver feature så den har mean 0 og standardavvik 1.
              Ellers vil features med stor skala (f.eks. inntekt i kroner) dominere
              kovariansmatrisen.
            </p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

X_std = StandardScaler().fit_transform(X)
pca = PCA(n_components=2).fit(X_std)`}</pre>
            <p className="text-xs text-muted-foreground">
              I plottet over er begge datasettene allerede standardiserte. Aksene
              er i enheter av standardavvik.
            </p>
          </div>
        </section>

        <section id="eig" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Egenvektorer som nye akser</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Kovariansmatrisen for sentrerte data <Tex>{"X"}</Tex>:
            </p>
            <TexBlock>{"\\Sigma = \\frac{1}{n - 1} X^T X"}</TexBlock>
            <p>
              Egenvektorene <Tex>{"v_1, v_2, \\ldots"}</Tex> er de nye aksene.
              Egenverdiene <Tex>{"\\lambda_1 \\geq \\lambda_2 \\geq \\ldots"}</Tex>{" "}
              er hvor mye varians hver akse fanger.
            </p>
            <p className="text-xs text-muted-foreground">
              Algebraisk fakta: blant alle enhetsvektorer <Tex>{"u"}</Tex>{" "}
              maksimeres <Tex>{"\\mathrm{Var}(X u) = u^T \\Sigma u"}</Tex> av
              egenvektoren med størst egenverdi. Det er nettopp dét du
              verifiserer med slideren.
            </p>
          </div>
        </section>

        <section id="proj" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Projeksjon: PC1 alene vs PC1+PC2</h2>
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Original (med akser)</div>
              <p className="text-xs text-muted-foreground">
                Standardiserte data i original feature-space. PC1, PC2 og din
                akse vises som linjer gjennom origo.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Projisert på PC1</div>
              <p className="text-xs text-muted-foreground">
                Hvert punkt «flates» mot PC1-linjen. Stiplede linjer viser hvor
                mye informasjon vi mister — den vinkelrette avstanden til PC1.
                Iris-klassene er fortsatt godt separert; Wine-klassene mer
                blandet med bare 1 komponent.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-medium text-sm mb-1">Rotert til PC1/PC2</div>
              <p className="text-xs text-muted-foreground">
                Samme data — men nå i PC-basis. PC1 ligger horisontalt, PC2
                vertikalt. Dette er det «output»-rommet PCA gir deg når du tar{" "}
                <code className="font-mono">pca.transform(X)</code>.
              </p>
            </div>
          </div>
        </section>

        <section id="explained" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Explained variance ratio</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              For hver komponent <Tex>{"i"}</Tex>:
            </p>
            <TexBlock>{"r_i = \\frac{\\lambda_i}{\\sum_j \\lambda_j}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Bar-chart-en nederst i visualiseringen viser <Tex>{"r_1"}</Tex> og{" "}
              <Tex>{"r_2"}</Tex>. I 2D summerer de alltid til 100 % — interessant
              først når du har mange features og vil velge antall komponenter.
              Tommelfingerregel: behold nok komponenter til at kumulativ ratio
              {" "}≥ 0.90 eller 0.95.
            </p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`pca = PCA(n_components=0.95).fit(X_std)
# velger automatisk minste antall komponenter
# med kumulativ explained variance ≥ 0.95`}</pre>
          </div>
        </section>

        <section id="exam" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Eksamen-hurtigreferanse</h2>
          <div className="rounded-xl border border-brand/30 bg-brand/5 p-5 space-y-2 text-sm">
            <div>
              <strong>«Hva er PC1?»</strong> Egenvektoren til kovariansmatrisen
              med størst egenverdi — retningen som maksimerer varians.
            </div>
            <div>
              <strong>«Hvorfor standardisere før PCA?»</strong> Features med
              stor skala får uforholdsmessig stor egenverdi. Standardisering
              gir hver feature samme «vekt» i kovariansmatrisen.
            </div>
            <div>
              <strong>«Hva er explained variance ratio?»</strong>{" "}
              <Tex>{"\\lambda_i / \\sum_j \\lambda_j"}</Tex> — andelen total
              varians komponent i fanger.
            </div>
            <div>
              <strong>«Hvor mange komponenter beholde?»</strong> Velg minste
              antall slik at kumulativ ratio {"≥"} 0.90 (eller 0.95). Eller
              bruk scree plot og finn «albuen».
            </div>
            <div>
              <strong>«PCA — supervised eller unsupervised?»</strong>{" "}
              Unsupervised. Bruker bare X, ikke y. PCA bryr seg ikke om
              klasselabels — hvis du vil ha klasseseparasjon i 2D bruker du LDA.
            </div>
            <div>
              <strong>«Hva er forskjellen på PC-basis og original basis?»</strong>{" "}
              Original: <Tex>{"X"}</Tex> i (feature₁, feature₂, …). PC-basis:
              <Tex>{"\\,Z = X V\\,"}</Tex> der <Tex>{"V"}</Tex> har egenvektorene som kolonner.
              <Tex>{"\\,Z\\,"}</Tex> har ukorrelerte (ortogonale) kolonner med varians
              <Tex>{"\\,\\lambda_i"}</Tex>.
            </div>
          </div>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Axis3D className="h-4 w-4 text-brand" />
            Relatert
          </h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2501-pca" }}
                className="text-brand hover:underline"
              >
                PCA (teori-side)
              </Link>{" "}
              — algoritmen i detalj, scree plot, anvendelser, eigenfaces.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2501-kmeans-visualizer" }}
                className="text-brand hover:underline"
              >
                k-Means live-plot
              </Link>{" "}
              — klustring i 2D etter PCA.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "linaer-algebra" }}
                className="text-brand hover:underline"
              >
                Lineær algebra
              </Link>{" "}
              — egenvektorer og egenverdier som matematisk grunnlag.
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
