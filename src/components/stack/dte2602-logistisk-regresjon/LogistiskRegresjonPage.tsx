import { Link } from "@tanstack/react-router";
import { Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { LogisticRegressionSim, SigmoidVisual } from "./LogisticRegressionSim";
import { LogRegVisualizer } from "./LogRegVisualizer";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";

const STEPS = [
  { title: "Visualisering — sigmoid, beslutningsgrense og GD", anchor: "visualisering" },
  { title: "Hvorfor ikke bare lineær regresjon?", anchor: "hvorfor" },
  { title: "Sigmoid og log-odds", anchor: "sigmoid" },
  { title: "Sigmoid-leken", anchor: "sigmoidlek" },
  { title: "Tolkning av koeffisienter (odds-ratio)", anchor: "odds" },
  { title: "MLE og log-loss", anchor: "mle" },
  { title: "Gradient descent på log-loss", anchor: "gd" },
  { title: "Live trening", anchor: "trening" },
  { title: "Multinomial logistisk regresjon (softmax)", anchor: "softmax" },
  { title: "Class imbalance og class-weights", anchor: "imbalance" },
  { title: "Eksamen-feller", anchor: "feller" },
  { title: "Python — sklearn på iris", anchor: "sklearn" },
];

export function LogistiskRegresjonPage() {
  return (
    <StackPageShell title="DTE-2602 — Logistisk regresjon" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Klassifikasjon i dybden
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Logistisk regresjon dypt
          </h1>
          <p className="mt-3 text-muted-foreground">
            Logistisk regresjon er den enkleste «riktige» klassifikatoren — og
            referansebaseline i nesten alle prosjekter. Pensum: ISLP kap. 4.3 +
            Géron HOML kap. 4. Du lærer hvorfor lineær regresjon ikke duger til
            binær respons, hvordan sigmoid og log-loss henger sammen, hva
            koeffisientene betyr (odds-ratio), og hvordan gradient descent
            trener modellen.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hovedidé:</span> Vi modellerer{" "}
              <em>log-odds</em> for klasse 1 som en lineær funksjon av
              prediktorene. Sigmoid mapper det tilbake til en sannsynlighet
              mellom 0 og 1.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2602-logistisk-regresjon" steps={STEPS} />

        <section id="visualisering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            0. Visualisering — sigmoid, beslutningsgrense og GD
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Før formlene: kjenn på selve mekanismen. Skyv på{" "}
            <code className="text-xs">w</code> og <code className="text-xs">b</code> i
            1D-modus og se hvordan sigmoid forskyver/strekker seg. Roter
            beslutningsgrensa manuelt i 2D, eller la gradient descent finne den
            for deg. Til slutt: se hvorfor log-loss straffer «selvsikkert feil»
            mye hardere enn MSE.
          </p>
          <LogRegVisualizer />
        </section>

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            1. Hvorfor ikke bare lineær regresjon?
          </h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Med binær respons <Tex>{"y \\in \\{0, 1\\}"}</Tex> kunne vi vært
              fristet til å predikere <Tex>{"\\hat{y} = \\beta_0 + \\beta_1 x"}</Tex>{" "}
              direkte. Tre problemer:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Prediksjoner utenfor [0, 1].</strong> Den lineære funksjonen
                er ubegrenset; med ekstreme <Tex>{"x"}</Tex>-verdier får du{" "}
                <Tex>{"\\hat{y} < 0"}</Tex> eller <Tex>{"\\hat{y} > 1"}</Tex> — ikke
                tolkbart som sannsynlighet.
              </li>
              <li>
                <strong>Feil tap-funksjon.</strong> Minste kvadraters metode antar
                <Tex>{"\\;\\varepsilon \\sim N(0, \\sigma^2)"}</Tex>. Med binær{" "}
                <Tex>{"y"}</Tex> er restleddet <Tex>{"y - \\hat{y}"}</Tex>{" "}
                heteroskedastisk (variansen avhenger av <Tex>{"\\hat{y}"}</Tex>).
              </li>
              <li>
                <strong>Effekten på sjelden klasse.</strong> Outliers i{" "}
                <Tex>{"x"}</Tex>-rommet kan flytte beslutningsgrensa kraftig.
              </li>
            </ul>
            <p>
              Logistisk regresjon løser dette ved å modellere{" "}
              <em>log-odds</em> lineært, ikke sannsynligheten direkte.
            </p>
          </div>
        </section>

        <section id="sigmoid" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Sigmoid og log-odds</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <div className="font-semibold">Sigmoid (logistisk funksjon):</div>
            <TexBlock>{"\\sigma(z) = \\frac{1}{1 + e^{-z}}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Egenskaper: <Tex>{"\\sigma(0) = 0.5"}</Tex>,{" "}
              <Tex>{"\\sigma(\\infty) = 1"}</Tex>,{" "}
              <Tex>{"\\sigma(-\\infty) = 0"}</Tex>. Symmetrisk:{" "}
              <Tex>{"\\sigma(-z) = 1 - \\sigma(z)"}</Tex>. Den deriverte er
              elegant: <Tex>{"\\sigma'(z) = \\sigma(z)(1 - \\sigma(z))"}</Tex>.
            </p>
            <div className="font-semibold pt-2">Modellen:</div>
            <TexBlock>{"P(y = 1 \\mid \\mathbf{x}) = \\sigma(\\beta_0 + \\beta_1 x_1 + \\cdots + \\beta_p x_p)"}</TexBlock>
            <div className="font-semibold pt-2">Logit (invers av sigmoid):</div>
            <TexBlock>{"\\mathrm{logit}(p) = \\log\\!\\left(\\frac{p}{1 - p}\\right) = \\beta_0 + \\beta_1 x_1 + \\cdots + \\beta_p x_p"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              <Tex>{"p / (1-p)"}</Tex> er <strong>odds</strong> (suksess vs
              fiasko). Logaritmen av oddsen er linæer i prediktorene. Det er
              <em> denne</em> linearisert som gjør «regresjon» i navnet.
            </p>
          </div>
        </section>

        <section id="sigmoidlek" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Sigmoid-leken</h2>
          <SigmoidVisual />
        </section>

        <section id="odds" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Tolkning av koeffisienter (odds-ratio)</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Hvis <Tex>{"x_j"}</Tex> øker med 1 (alt annet likt), endrer
              log-odds seg med <Tex>{"\\beta_j"}</Tex>. Det betyr at oddsen
              multipliseres med <Tex>{"e^{\\beta_j}"}</Tex>:
            </p>
            <TexBlock>{"\\frac{\\mathrm{odds}(x_j + 1)}{\\mathrm{odds}(x_j)} = e^{\\beta_j}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Eksempel: <Tex>{"\\beta_{\\text{alder}} = 0.05"}</Tex> for diabetes-modell
              ⇒ hvert ekstra år ganger oddsen for diabetes med{" "}
              <Tex>{"e^{0.05} \\approx 1.051"}</Tex>, dvs. 5.1 % økning. Etter
              10 år: <Tex>{"e^{0.5} \\approx 1.649"}</Tex>, dvs. 65 % økt odds.
            </p>
            <div className="font-semibold pt-2">Vær obs:</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Odds-ratio ≠ relative risk.</strong> Når{" "}
                <Tex>{"p"}</Tex> er liten er de like, ellers ikke.
              </li>
              <li>
                <strong>Bare ceteris paribus.</strong> Tolkningen krever at de
                andre <Tex>{"x_k"}</Tex>-verdiene er fastholdt.
              </li>
            </ul>
          </div>
        </section>

        <section id="mle" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. MLE og log-loss</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Vi finner <Tex>{"\\boldsymbol\\beta"}</Tex> ved{" "}
              <strong>maximum likelihood</strong>. For Bernoulli-respons er
              likelihooden
            </p>
            <TexBlock>{"L(\\boldsymbol\\beta) = \\prod_{i=1}^n \\hat{p}_i^{y_i} (1 - \\hat{p}_i)^{1 - y_i}"}</TexBlock>
            <p>
              Negativ log-likelihood gir den vanlige{" "}
              <strong>log-loss</strong> / cross-entropy-funksjonen som vi
              minimerer:
            </p>
            <TexBlock>{"\\mathcal{L}(\\boldsymbol\\beta) = -\\frac{1}{n}\\sum_{i=1}^n \\big[\\, y_i \\log \\hat{p}_i + (1 - y_i) \\log(1 - \\hat{p}_i)\\,\\big]"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              <Tex>{"\\hat{p}_i = \\sigma(\\mathbf{x}_i^\\top \\boldsymbol\\beta)"}</Tex>.
              Loss-funksjonen er <strong>konveks</strong> i{" "}
              <Tex>{"\\boldsymbol\\beta"}</Tex> — så lokalt minimum = globalt
              minimum.
            </p>
            <p className="font-semibold pt-2">Det er ingen lukket form.</p>
            <p>
              I motsetning til lineær regresjon har log-loss ingen analytisk
              løsning som «<Tex>{"(X^\\top X)^{-1} X^\\top y"}</Tex>». Vi må
              iterere: typisk Newton-Raphson (kalt IRLS, iteratively reweighted
              least squares) eller gradient descent.
            </p>
          </div>
        </section>

        <section id="gd" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Gradient descent på log-loss</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Gradienten av cross-entropy er overraskende enkel takket være at{" "}
              <Tex>{"\\sigma'(z) = \\sigma(z)(1 - \\sigma(z))"}</Tex>:
            </p>
            <TexBlock>{"\\nabla \\mathcal{L} = \\frac{1}{n}\\sum_{i=1}^n (\\hat{p}_i - y_i)\\, \\mathbf{x}_i"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Restleddet <Tex>{"(\\hat{p}_i - y_i)"}</Tex> — så identisk som i
              lineær regresjon med MSE-tap. Forskjellen er bare hvordan{" "}
              <Tex>{"\\hat{p}"}</Tex> beregnes.
            </p>
            <div className="font-semibold pt-2">Oppdaterings-regel:</div>
            <TexBlock>{"\\boldsymbol\\beta \\leftarrow \\boldsymbol\\beta - \\eta\\, \\nabla \\mathcal{L}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              <Tex>{"\\eta"}</Tex> = lærings-rate. Hyperparameter.
            </p>
          </div>
        </section>

        <section id="trening" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Live trening</h2>
          <LogisticRegressionSim />
          <p className="text-xs text-muted-foreground mt-3">
            Skru opp lærings-rate til ~1.5 — modellen kan oscillere. Skru opp
            L2-reg λ — vektene presses mot 0, og decision boundary skifter helt
            til λ = 0 dominerer. Trekk nye data med stor overlap — accuracy
            faller naturlig fordi klassene ikke er separerbare.
          </p>
        </section>

        <section id="softmax" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Multinomial logistisk regresjon (softmax)</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Med <Tex>{"K"}</Tex> klasser (iris: setosa/versicolor/virginica)
              har vi én vektvektor per klasse, og softmax istedenfor sigmoid:
            </p>
            <TexBlock>{"P(y = k \\mid \\mathbf{x}) = \\frac{e^{\\mathbf{x}^\\top \\boldsymbol\\beta_k}}{\\sum_{j=1}^K e^{\\mathbf{x}^\\top \\boldsymbol\\beta_j}}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              Sigmoid er softmax for <Tex>{"K = 2"}</Tex>. Loss-funksjonen
              generaliserer til kategorisk cross-entropy:
            </p>
            <TexBlock>{"\\mathcal{L} = -\\frac{1}{n}\\sum_{i=1}^n \\sum_{k=1}^K y_{ik} \\log \\hat{p}_{ik}"}</TexBlock>
            <p className="text-xs text-muted-foreground">
              I sklearn: <code>LogisticRegression(multi_class=&apos;multinomial&apos;)</code>.
              Default i nyere sklearn er «auto» som velger multinomial når{" "}
              <Tex>{"K > 2"}</Tex>.
            </p>
          </div>
        </section>

        <section id="imbalance" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Class imbalance og class-weights</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Når en klasse er sjelden (typisk 5 % positive — fraud, sjeldne
              sykdommer) lærer modellen å predikere «negativ alltid» og oppnår
              95 % accuracy uten å være nyttig.
            </p>
            <div className="font-semibold">Tre vanlige fikser:</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>class_weight=&apos;balanced&apos;</strong> i sklearn. Vekter
                hver klasse omvendt proporsjonalt med frekvensen i log-loss.
              </li>
              <li>
                <strong>SMOTE/oversampling</strong> av minoritetsklassen i
                trenings-settet (aldri test-settet).
              </li>
              <li>
                <strong>Senk beslutnings-terskel</strong> fra 0.5 til f.eks. 0.3 —
                modellen predikerer positivt oftere. Velg terskel basert på
                ROC- eller PR-kurve, ikke gjett.
              </li>
            </ul>
            <p className="text-xs text-muted-foreground">
              Måle med accuracy alene er nesten alltid feil ved ubalanse. Bruk
              precision, recall, F1, eller AUC-PR.
            </p>
          </div>
        </section>

        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">10. Eksamen-feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Skaler features.</strong> Gradient descent konvergerer
              tregere på uskalerte features. <code>StandardScaler</code> før{" "}
              <code>LogisticRegression</code> er nesten alltid bedre. (Sklearn
              bruker <code>lbfgs</code> default som er robust, men L2-reg
              virker urettferdig på uskalerte features.)
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Perfekt separasjon.</strong> Hvis klassene er lineært
              separerbare divergerer MLE — vektene går mot uendelig. Sklearn&apos;s
              default L2-reg (<Tex>{"C = 1"}</Tex>) hindrer dette. Slå AV
              regularisering med <code>penalty=&apos;none&apos;</code> kun for
              spesialformål.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Decision boundary er lineær.</strong> Logistisk regresjon
              skiller med en hyperplan i feature-rommet. For ikke-lineære
              grenser: bruk polynom-features eller bytt modell (SVM med kernel,
              trær, nevralnet).
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Ikke MSE som tap.</strong> Bruk log-loss / cross-entropy.
              MSE gir ikke-konveks tap og dårlig gradient når{" "}
              <Tex>{"\\hat{p}"}</Tex> er nær 0 eller 1.
            </div>
          </div>
        </section>

        <section id="sklearn" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">11. Python — sklearn på iris</h2>
          <pre className="rounded-xl border border-border bg-card p-4 font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split

X, y = load_iris(return_X_y=True)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)

pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('lr', LogisticRegression(C=1.0, max_iter=1000))
])
pipe.fit(Xtr, ytr)
print(f"test accuracy: {pipe.score(Xte, yte):.3f}")

# Tolk koeffisientene
import numpy as np
coef = pipe.named_steps['lr'].coef_  # shape (3, 4) — én rad per klasse
print(f"odds-ratio per feature (klasse 0): {np.exp(coef[0])}")`}</pre>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2602-evaluation-roc" }}
                className="text-brand hover:underline"
              >
                Forvirringsmatrise, F1, ROC-AUC
              </Link>{" "}
              — fortsettelsen for klassifikator-evaluering.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2602-bias-varians" }}
                className="text-brand hover:underline"
              >
                Bias-varians og regularisering
              </Link>{" "}
              — hvorfor L2 (ridge) og L1 (lasso) hjelper.
            </li>
            <li>
              <Link to="/python" className="text-brand hover:underline">/python</Link>{" "}
              — tren logistisk regresjon på iris, tolk{" "}
              <code className="text-xs">coef_</code> som odds-ratios.
            </li>
          </ul>
        </div>

        <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2602" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til DTE-2602-hub
          </Link>
        </div>
        <RelatedVisualizers slug="logreg" />
      </div>
    </StackPageShell>
  );
}
