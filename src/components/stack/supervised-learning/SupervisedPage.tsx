import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { SupervisedLearningVisualizer } from "@/components/stack/supervised-learning/SupervisedLearningVisualizer";

const STEPS = [
  { title: "Interaktiv visualisering", anchor: "visualisering" },
  { title: "Regresjon vs klassifikasjon", anchor: "regr-vs-klass" },
  { title: "Lineær regresjon", anchor: "linear" },
  { title: "Logistisk regresjon", anchor: "logistic" },
  { title: "kNN — nærmeste naboer", anchor: "knn" },
  { title: "Decision tree", anchor: "tree" },
  { title: "Ensembles — random forest, gradient boosting", anchor: "ensemble" },
  { title: "SVM — kort", anchor: "svm" },
  { title: "Hvilken algoritme velger du?", anchor: "valg" },
];

export function SupervisedPage() {
  return (
    <StackPageShell title="Supervised learning" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Supervised learning
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Supervised learning — algoritmene du møter oftest
          </h1>
          <p className="mt-3 text-muted-foreground">
            Du har <code>(X, y)</code> — features og fasit. Tren en modell som
            generaliserer. Vi går gjennom de seks viktigste algoritmene: når brukes hvilken,
            hva er styrkene og svakhetene.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Supervised learning» — match algoritme→egenskap, quiz om
              hyperparametere, fyll inn sklearn-kode.
            </div>
          </div>
        </div>

        <CourseOutline courseId="supervised-learning" steps={STEPS} />

        <section id="visualisering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            1. Interaktiv visualisering — bias/varians, splits, k-NN, metrikker
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Før vi går algoritme for algoritme: lek med de generelle prinsippene.
            Overfit vs underfit på polynom-fit, hvorfor vi splitter i train/val/test,
            hvordan læringskurver avslører hva som er galt, k-NN sin
            beslutningsgrense som funksjon av k, og forskjellen på accuracy / precision /
            recall / F1.
          </p>
          <SupervisedLearningVisualizer />
        </section>

        <section id="regr-vs-klass" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Regresjon vs klassifikasjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Forskjellen ligger i typen <code>y</code>:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Regresjon
              </div>
              <p className="text-sm text-foreground mb-2">
                y er KONTINUERLIG. Predikér et tall.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5">
                <li>Pris på et hus</li>
                <li>Temperatur i morgen</li>
                <li>Antall kunder på fredag</li>
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                Metrikker: MAE, RMSE, R².
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Klassifikasjon
              </div>
              <p className="text-sm text-foreground mb-2">
                y er KATEGORI. Predikér klasse.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5">
                <li>Spam / ikke spam</li>
                <li>Hvilken sjanger er sangen</li>
                <li>Kreft / ikke kreft</li>
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                Metrikker: accuracy, precision, recall, F1, ROC-AUC.
              </p>
            </div>
          </div>
        </section>

        <section id="linear" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Lineær regresjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Den enkleste regresjonsmodellen — antakelsen er at output er en lineær
            kombinasjon av features.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Modell:    ŷ = w₀ + w₁x₁ + w₂x₂ + ... + wₙxₙ

Trening:   finn vektene w som minimerer
           sum((y_i - ŷ_i)²)  ← squared error

I sklearn:
  from sklearn.linear_model import LinearRegression
  model = LinearRegression()
  model.fit(X_train, y_train)
  predictions = model.predict(X_test)
  print(model.coef_, model.intercept_)`}</pre>
          </div>
          <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-success/30 bg-success/5 p-4">
              <strong className="text-success">Fordeler:</strong> rask, tolkbar (vekter sier hva som driver y), god baseline.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong className="text-amber-600 dark:text-amber-400">Begrensninger:</strong> antar lineær sammenheng. Sensitiv for outliers. Trenger skalerte features.
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Regularisering:</strong> Ridge (L2-straff på vekter) og Lasso (L1)
            hindrer overfitting og kan også gjøre feature selection (Lasso → 0).
          </p>
        </section>

        <section id="logistic" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Logistisk regresjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tross navnet er det en KLASSIFIKATOR. Wraps lineær kombinasjon i en
            sigmoid-funksjon som gir sannsynlighet ∈ [0, 1].
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Modell:   P(y=1 | x) = σ(w·x)
          σ(z) = 1 / (1 + e^-z)        ← sigmoid

Beslutning: ŷ = 1 hvis P > 0.5, ellers 0

Trening:  minimér log-loss (cross-entropy)

I sklearn:
  from sklearn.linear_model import LogisticRegression
  model = LogisticRegression(max_iter=1000)
  model.fit(X_train, y_train)
  probs = model.predict_proba(X_test)
  preds = model.predict(X_test)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Multi-klasse:</strong> sklearn bruker en-vs-resten eller multinomial.
            Output er en sannsynlighet per klasse, sum = 1.
          </p>
        </section>

        <section id="knn" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. kNN — k-Nearest Neighbors</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ingen «trening» — modellen er bare data. Ved prediksjon: finn de k nærmeste
            punktene, ta majority vote (klassifikasjon) eller gjennomsnitt (regresjon).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Algoritmen (klassifikasjon):
  for new_x in X_test:
      avstand = euclidean(new_x, X_train)  # eller annen metric
      k_nearest = de k punktene med kortest avstand
      ŷ = majority_vote(y[k_nearest])

I sklearn:
  from sklearn.neighbors import KNeighborsClassifier
  model = KNeighborsClassifier(n_neighbors=5)
  model.fit(X_train, y_train)
  preds = model.predict(X_test)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Viktig:</strong> kNN er svært sensitiv for skala — alltid skalér features.
            «Curse of dimensionality» rammer hardt på mange features. Treg på store data
            (må gå gjennom alle train-punkter per prediksjon).
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            <strong>Velge k:</strong> for liten k → høy variance (overfit). For stor k →
            høy bias (underfit). Bruk cross-validation til å finne sweet spot. Odde-tall
            unngår uavgjort.
          </p>
        </section>

        <section id="tree" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Decision tree</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Splitt datasettet rekursivt på feature-grenser slik at hver gren blir så
            «ren» som mulig. Resultatet er et tre du kan tolke direkte.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Eksempel (kreft-prediksjon):

  alder ≥ 50?
   ├─ ja → tumor_størrelse ≥ 2 cm?
   │       ├─ ja → KREFT (15/16 i denne grenen)
   │       └─ nei → BENIGN
   └─ nei → BENIGN

I sklearn:
  from sklearn.tree import DecisionTreeClassifier
  model = DecisionTreeClassifier(max_depth=5, random_state=42)
  model.fit(X_train, y_train)`}</pre>
          </div>
          <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-success/30 bg-success/5 p-4">
              <strong className="text-success">Fordeler:</strong> tolkbar, takler kategoriske og numeriske, trenger ikke skalering.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong className="text-amber-600 dark:text-amber-400">Begrensninger:</strong> overfitter lett uten max_depth. Ustabil — små data-endringer kan gi annerledes tre.
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Splitt-kriterier:</strong> Gini impurity (default i sklearn) eller
            entropy. Begge måler hvor «blandet» en node er.
          </p>
        </section>

        <section id="ensemble" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Ensembles — random forest, gradient boosting</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ett tre er ustabilt. Mange trær sammen er kjempemye bedre. To strategier:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Random Forest (bagging)
              </div>
              <p className="text-sm text-foreground mb-2">
                Tren MANGE trær på tilfeldige subsets av data og features. Stem ved
                majoritet.
              </p>
              <pre className="mt-2 font-mono text-xs rounded bg-background border border-border p-2 overflow-x-auto whitespace-pre">{`from sklearn.ensemble import \\
    RandomForestClassifier
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42)`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Gradient Boosting (boosting)
              </div>
              <p className="text-sm text-foreground mb-2">
                Tren trær SEKVENSIELT der hvert nye tre korrigerer feilene til de
                forrige.
              </p>
              <pre className="mt-2 font-mono text-xs rounded bg-background border border-border p-2 overflow-x-auto whitespace-pre">{`from sklearn.ensemble import \\
    GradientBoostingClassifier
model = GradientBoostingClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=3)`}</pre>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>I praksis:</strong> XGBoost, LightGBM og CatBoost vinner Kaggle-konkurranser.
            For tabulær data slår de ofte nevrale nett.
          </p>
        </section>

        <section id="svm" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. SVM — Support Vector Machine</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Finn hyperplanet som SKILLER klassene med størst margin. Med kernel-triks
            kan SVM håndtere ikke-lineære grenser.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.svm import SVC
model = SVC(kernel='rbf', C=1.0, gamma='scale')
model.fit(X_train, y_train)

Hyperparametere:
  C       — straff for misklassifisering (større C = mindre margin, tighter fit)
  gamma   — kernel-skarphet for RBF
  kernel  — 'linear', 'poly', 'rbf', 'sigmoid'`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>SVM passer:</strong> middels store datasett, høyt antall features,
            relativt klare klasseskiller. Treig på store n (sklearn sin SVC er O(n²)–O(n³)).
          </p>
        </section>

        <section id="valg" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Hvilken algoritme velger du?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Praktisk valg-tre. Start på toppen.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`1. Tabulær data, < 1M rader, raskt resultat?
   → Gradient Boosting (XGBoost/LightGBM)

2. Du må TOLKE modellen (forretningskrav)?
   → Lineær/logistisk regresjon, eller Decision Tree

3. Lite data (< 1000 rader)?
   → kNN eller logistisk regresjon — enkle modeller med få vekter

4. Bilder, lyd, tekst?
   → Nevrale nett (utenfor dette kursnivå)

5. Klusterer du UTEN labels?
   → Det er unsupervised — neste kurs

6. Du er usikker?
   → Test 2-3 algoritmer med default-hyperparametere, sammenlign på val-set.
     Begin med Random Forest — den er sjelden den BESTE, men sjelden DÅRLIG.`}</pre>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : algoritme→egenskap-match, sklearn-kode-fill.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "unsupervised-learning" }} className="text-brand hover:underline">
                Unsupervised learning
              </Link>
              : klustering, dim-reduksjon — når du ikke har y.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
