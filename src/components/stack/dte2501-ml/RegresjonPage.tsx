import { Link } from "@tanstack/react-router";
import { Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Regresjon vs klassifikasjon", anchor: "intro" },
  { title: "Lineær regresjon", anchor: "linear" },
  { title: "Loss — MSE og MAE", anchor: "loss" },
  { title: "Polynom-regresjon", anchor: "poly" },
  { title: "Overfitting", anchor: "overfit" },
  { title: "Regularisering — Ridge og Lasso", anchor: "regul" },
  { title: "Evaluering — R², RMSE", anchor: "eval" },
  { title: "Pseudokode + sklearn", anchor: "code" },
];

export function RegresjonPage() {
  return (
    <StackPageShell title="Regresjon — lineær og polynom" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · Supervised learning
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Regresjon — å forutsi tall, ikke klasser
          </h1>
          <p className="mt-3 text-muted-foreground">
            Regresjon predikerer en kontinuerlig verdi (pris, temperatur, alder)
            fra features. Lineær regresjon er den enkleste — og fundamentet for
            mye av moderne ML.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Sentralt:</span> regresjon = predikere{" "}
              <em>tall</em>. Klassifikasjon = predikere <em>kategori</em>. Samme
              ML-rammeverk, ulik loss-funksjon.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2501-regresjon" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Regresjon vs klassifikasjon</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`               Klassifikasjon                  Regresjon
y-type:        kategori (A, B, C)               kontinuerlig tall (3.14)
Output:        sannsynlighet / klasse           reell verdi
Loss:          cross-entropy, log-loss          MSE, MAE, Huber
Metrikker:     accuracy, F1, ROC-AUC            R², RMSE, MAPE
Algoritmer:    log.reg, k-NN, SVM, tre, NN      lin.reg, k-NN, tre, NN
Eksempler:     spam/ikke-spam, sentiment        boligpris, temperatur`}</pre>
          </div>
        </section>

        <section id="linear" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Lineær regresjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Den enkleste modellen: en rett linje gjennom skyen av punkter.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Univariat (én feature):
    ŷ = w·x + b

Multivariat (flere features):
    ŷ = w₁·x₁ + w₂·x₂ + ... + w_d·x_d + b
       = w · x + b

Vi finner (w, b) som MINIMERER summen av kvadrerte avvik:
    L(w, b) = Σᵢ ( yᵢ − ŷᵢ )²
            = Σᵢ ( yᵢ − (w·xᵢ + b) )²

Lukket form (normalligning):
    w = (XᵀX)⁻¹ · Xᵀy        (krever XᵀX invertibel)

Iterativ (gradient descent):
    w ← w − η · ∂L/∂w        (η = læringsrate)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Lukket form er rask for d &lt; 1000. For større feature-sett (bilder,
            tekst) bruker man iterativ optimering.
          </p>
        </section>

        <section id="loss" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Loss — MSE og MAE</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`MSE — Mean Squared Error:
    MSE = (1/n) · Σ ( yᵢ − ŷᵢ )²
    Straffar STORE avvik kvadratisk → veldig sensitiv for outliers.
    Glatt → enkel å derivere → favorisert av gradient descent.

MAE — Mean Absolute Error:
    MAE = (1/n) · Σ | yᵢ − ŷᵢ |
    Lineær straff → robust mot outliers.
    Ikke-deriverbar i 0 → litt mer komplisert optimering.

RMSE — Root MSE:
    RMSE = √MSE
    Samme enhet som y (kroner, °C, ...) → mer tolkbar.

Huber loss (mix):
    L_δ(r) = ½r²          hvis |r| ≤ δ
             δ·(|r| − δ/2) ellers
    Glatt nær 0 (som MSE), lineær langt unna (som MAE).`}</pre>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-28">Loss</th>
                  <th className="text-left font-semibold px-4 py-2">Formel</th>
                  <th className="text-left font-semibold px-4 py-2">Bruk når</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">MSE</td>
                  <td className="px-4 py-2 font-mono text-xs">(1/n) Σ(yᵢ − ŷᵢ)²</td>
                  <td className="px-4 py-2 text-muted-foreground">Standard. Glatt, deriverbar, men outlier-sensitiv.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">MAE</td>
                  <td className="px-4 py-2 font-mono text-xs">(1/n) Σ|yᵢ − ŷᵢ|</td>
                  <td className="px-4 py-2 text-muted-foreground">Data har outliers du IKKE vil at modellen skal jage.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Huber</td>
                  <td className="px-4 py-2 font-mono text-xs">½r² eller δ(|r|−δ/2)</td>
                  <td className="px-4 py-2 text-muted-foreground">Du vil ha både MSE-glatthet og MAE-robusthet.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">MAPE</td>
                  <td className="px-4 py-2 font-mono text-xs">(100/n) Σ|yᵢ−ŷᵢ|/|yᵢ|</td>
                  <td className="px-4 py-2 text-muted-foreground">Forretningsrapport krever %-feil. NB: y ≈ 0 sprenger.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Log-cosh</td>
                  <td className="px-4 py-2 font-mono text-xs">Σ log(cosh(yᵢ−ŷᵢ))</td>
                  <td className="px-4 py-2 text-muted-foreground">Du vil ha Huber-egenskaper, men trenger to-deriverbar.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="poly" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Polynom-regresjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Lineær regresjon med utvidede features. Vi LATTER bare som vi har en
            lineær modell, etter at vi har laget polynomiale features.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Original feature x → utvid til [x, x², x³, ...]
Modellen er fortsatt LINEÆR i parametrene:

    ŷ = w₀ + w₁·x + w₂·x² + w₃·x³

Grad-3 polynom kan fange S-formede kurver.
Høyere grad = mer fleksibel = MER overfitting-risiko.

I sklearn:
    from sklearn.preprocessing import PolynomialFeatures
    poly = PolynomialFeatures(degree=3)
    X_poly = poly.fit_transform(X)   # legger til x², x³, krysstermer
    model.fit(X_poly, y)             # vanlig LinearRegression`}</pre>
          </div>
        </section>

        <section id="overfit" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Overfitting</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En modell som perfekt passer treningsdata men suger på ny data har
            overfittet. Klassisk symptom: train-loss går mot 0, val-loss går opp.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Train-loss vs Val-loss over modell-kompleksitet:

  loss
   ↑
   │       sweet spot
   │           ↓
   │  val ────╮      ╭──── val ↑ (overfit)
   │          ╲    ╱
   │           ╲  ╱
   │  train ────╲╱──── train ↓ (alltid)
   │              ╲
   │
   └───────────────────────────→  modell-kompleksitet
      (få features)              (mange features / høy grad)

Tegn på overfitting:
  - train-accuracy 99%, test-accuracy 65%
  - vektkoeffisientene blir HUGE
  - modellen passer perfekt — også støyen`}</pre>
          </div>

          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Tre tegn-signaler du må se etter:</span>{" "}
              (1) train-loss går mot 0 mens val-loss stiger, (2) noen vekt-koeffisienter
              er enormt store (10³–10⁶), (3) små perturbasjoner i treningsdata flytter
              prediksjonene mye. Hvis du ser noen av disse — krymp modellen,
              regulariser, eller hent mer data.
            </div>
          </div>
        </section>

        <section id="regul" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Regularisering — Ridge og Lasso</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hvis store vekter er symptom på overfitting, så kan vi STRAFFE store
            vekter i loss-funksjonen.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Vanlig MSE:
    L = Σ (yᵢ − ŷᵢ)²

Ridge (L2-regularisering):
    L = Σ (yᵢ − ŷᵢ)² + α · Σ wⱼ²
                       └────── straff på STORE vekter
    Resultat: alle vekter krymper, ingen blir akkurat 0.

Lasso (L1-regularisering):
    L = Σ (yᵢ − ŷᵢ)² + α · Σ |wⱼ|
    Resultat: noen vekter blir EKSAKT 0 → automatisk feature-seleksjon.

Elastic Net = blanding av begge:
    L = MSE + α·( ρ·||w||₁ + (1−ρ)/2 · ||w||₂² )

α (alfa) er hyperparameter:
    α = 0   → vanlig lin.reg
    α → ∞   → alle vekter mot 0 (underfit)`}</pre>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-28">Metode</th>
                  <th className="text-left font-semibold px-4 py-2">Straff</th>
                  <th className="text-left font-semibold px-4 py-2">Sparsity?</th>
                  <th className="text-left font-semibold px-4 py-2">Bra på</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Ridge (L2)</td>
                  <td className="px-4 py-2 font-mono text-xs">α · Σwⱼ²</td>
                  <td className="px-4 py-2 text-muted-foreground">Nei — krymper alle</td>
                  <td className="px-4 py-2 text-muted-foreground">Multi-kollinearitet, mange korrelerte features</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Lasso (L1)</td>
                  <td className="px-4 py-2 font-mono text-xs">α · Σ|wⱼ|</td>
                  <td className="px-4 py-2 text-muted-foreground">Ja — vekter blir 0</td>
                  <td className="px-4 py-2 text-muted-foreground">Feature-seleksjon, få viktige features blant mange</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">ElasticNet</td>
                  <td className="px-4 py-2 font-mono text-xs">α(ρ‖w‖₁ + (1−ρ)/2‖w‖₂²)</td>
                  <td className="px-4 py-2 text-muted-foreground">Ja (delvis)</td>
                  <td className="px-4 py-2 text-muted-foreground">Grupper av korrelerte features (genetikk, tekst)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="eval" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Evaluering — R², RMSE</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`R² (forklart varians):
    R² = 1 − SS_res / SS_tot
       = 1 − Σ(yᵢ − ŷᵢ)² / Σ(yᵢ − ȳ)²

    R² = 1.0   perfekt prediksjon
    R² = 0.0   like god som «predikér snittet»
    R² < 0     verre enn å predikere snittet (det går an!)

RMSE (Root Mean Squared Error):
    RMSE = √( (1/n) · Σ(yᵢ − ŷᵢ)² )
    Samme enhet som y. RMSE=10 kr → modellen bommer i snitt med 10 kr.

MAPE (Mean Absolute Percentage Error):
    MAPE = (100/n) · Σ |yᵢ − ŷᵢ| / |yᵢ|
    Tolkbar prosent. Pass på division by zero hvis yᵢ ≈ 0.`}</pre>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Metrikk</th>
                  <th className="text-left font-semibold px-4 py-2">Tolkning</th>
                  <th className="text-left font-semibold px-4 py-2">Når aktuell</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">R²</td>
                  <td className="px-4 py-2 text-muted-foreground">Andel forklart varians (1 = perfekt, 0 = som å gjette snittet)</td>
                  <td className="px-4 py-2 text-muted-foreground">Sammenligne modeller på SAMME data</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Adjusted R²</td>
                  <td className="px-4 py-2 text-muted-foreground">R² straffet for antall features</td>
                  <td className="px-4 py-2 text-muted-foreground">Modeller med ulikt antall features</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">RMSE</td>
                  <td className="px-4 py-2 text-muted-foreground">Typisk feil i samme enhet som y</td>
                  <td className="px-4 py-2 text-muted-foreground">Du må kommunisere absolutt feilstørrelse</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">MAE</td>
                  <td className="px-4 py-2 text-muted-foreground">Snitt absolutt feil i samme enhet som y</td>
                  <td className="px-4 py-2 text-muted-foreground">Outliers ikke skal dominere snittet</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">MAPE</td>
                  <td className="px-4 py-2 text-muted-foreground">Snitt % feil</td>
                  <td className="px-4 py-2 text-muted-foreground">Forretningsrapport, y ≫ 0 (ikke priser nær 0)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="code" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Pseudokode + sklearn</h2>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function gradient_descent(X, y, η, epochs):
    w ← random
    b ← 0
    for epoch in 1..epochs:
        ŷ = X · w + b
        err = ŷ − y
        ∂L/∂w = (2/n) · Xᵀ · err
        ∂L/∂b = (2/n) · sum(err)
        w ← w − η · ∂L/∂w
        b ← b − η · ∂L/∂b
    return w, b`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.metrics import r2_score, mean_squared_error
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
import numpy as np

# Polynom-regresjon med Ridge:
model = make_pipeline(
    PolynomialFeatures(degree=3),
    Ridge(alpha=1.0)
)
model.fit(X_tr, y_tr)
y_pred = model.predict(X_te)
print(f"R² = {r2_score(y_te, y_pred):.3f}")
print(f"RMSE = {np.sqrt(mean_squared_error(y_te, y_pred)):.3f}")`}</pre>
          </div>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand" />
            Neste steg
          </h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2501-ensemble" }} className="text-brand hover:underline">
                Ensemble — bagging og boosting
              </Link>{" "}
              for «mange svake regressorer slått sammen».
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2501-pca" }} className="text-brand hover:underline">
                PCA
              </Link>{" "}
              hvis du har for mange korrelerte features.
            </li>
            <li>
              Drag-øvelser med topic «Regresjon» og Python-øvelser med sklearn.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
