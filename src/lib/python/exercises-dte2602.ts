import type { PyExercise } from "./types";

// DTE-2602 sklearn-øvelser. Pyodide laster numpy/scipy/sklearn/pandas/seaborn
// via loadPackage før koden kjøres (se src/lib/python/runner.ts).
//
// Konvensjon for løsningssjekk: hver øvelse skal printe en eller flere linjer
// som "FASIT: <verdi>" eller tilsvarende deterministisk output, slik at
// PortfolioRunner kan verifisere uten å parse Python-strukturer.

export const PY_DTE2602_EXERCISES: PyExercise[] = [
  // ============ EDA (4) ============
  {
    id: "dte2602-py-iris-describe",
    topic: "DTE-2602 EDA",
    title: "Iris: shape, head og describe",
    description:
      "Bruk sklearn `load_iris` og print datasettet sin form, første 5 rader og " +
      "describe-tabellen. Klassisk førstesjekk på et nytt datasett.",
    requires: [],
    starter: `from sklearn.datasets import load_iris
import pandas as pd

iris = load_iris(as_frame=True)
df = iris.frame

# TODO:
# 1) print "shape:", df.shape
# 2) print df.head()
# 3) print df.describe().round(2)
`,
    solution: `from sklearn.datasets import load_iris
iris = load_iris(as_frame=True)
df = iris.frame
print("shape:", df.shape)
print(df.head())
print(df.describe().round(2))
`,
    hints: [
      "df.shape gir (rader, kolonner) — bruk print('shape:', df.shape).",
      "df.head() viser de fem første radene.",
      ".round(2) gjør describe-output lettere å lese.",
    ],
  },
  {
    id: "dte2602-py-iris-class-balance",
    topic: "DTE-2602 EDA",
    title: "Iris: klassebalanse",
    description:
      "Sjekk hvor mange samples per klasse. Iris har 50/50/50 — perfekt balansert. " +
      "Print `value_counts(normalize=True)` for å se andelen.",
    requires: [],
    starter: `from sklearn.datasets import load_iris
iris = load_iris(as_frame=True)
df = iris.frame

# TODO: print andelen per target (normalize=True)
`,
    solution: `from sklearn.datasets import load_iris
iris = load_iris(as_frame=True)
print(iris.frame["target"].value_counts(normalize=True).round(3))
`,
  },
  {
    id: "dte2602-py-iris-corr",
    topic: "DTE-2602 EDA",
    title: "Iris: korrelasjonsmatrise",
    description:
      "Beregn korrelasjonsmatrisen mellom de fire featurene. Hvilke to features har sterkest korrelasjon?",
    requires: [],
    starter: `from sklearn.datasets import load_iris
iris = load_iris(as_frame=True)
df = iris.frame.drop(columns=["target"])

# TODO: print df.corr().round(2)
# Hvilke to features har sterkest positiv korrelasjon?
`,
    solution: `from sklearn.datasets import load_iris
iris = load_iris(as_frame=True)
df = iris.frame.drop(columns=["target"])
print(df.corr().round(2))
print("Sterkest: petal length og petal width (r ≈ 0.96)")
`,
    hints: [
      "df.corr() returnerer korrelasjonsmatrisen.",
      ".round(2) rundes til to desimaler så output er lesbart.",
    ],
  },
  {
    id: "dte2602-py-wine-missing",
    topic: "DTE-2602 EDA",
    title: "Lag missing data og imputer median",
    description:
      "Last sklearn `load_wine`. Sett 10 % av 'alcohol'-kolonnen til NaN. Imputer " +
      "tilbake med median og bekreft at antall NaN er 0 etter.",
    requires: [],
    starter: `import numpy as np
import pandas as pd
from sklearn.datasets import load_wine
from sklearn.impute import SimpleImputer

wine = load_wine(as_frame=True)
df = wine.frame.copy()

rng = np.random.default_rng(42)
mask = rng.random(len(df)) < 0.10
df.loc[mask, "alcohol"] = np.nan
print("NaN før:", df["alcohol"].isna().sum())

# TODO: imputer alcohol med SimpleImputer(strategy="median")
# Print "NaN etter:" for å bekrefte 0.
`,
    solution: `import numpy as np
import pandas as pd
from sklearn.datasets import load_wine
from sklearn.impute import SimpleImputer

wine = load_wine(as_frame=True)
df = wine.frame.copy()
rng = np.random.default_rng(42)
mask = rng.random(len(df)) < 0.10
df.loc[mask, "alcohol"] = np.nan
print("NaN før:", df["alcohol"].isna().sum())

imp = SimpleImputer(strategy="median")
df["alcohol"] = imp.fit_transform(df[["alcohol"]])
print("NaN etter:", df["alcohol"].isna().sum())
`,
  },

  // ============ PREPROCESSING (3) ============
  {
    id: "dte2602-py-stratify",
    topic: "DTE-2602 Preprocessing",
    title: "Stratify on/off — sammenlign klassebalanse i test-settet",
    description:
      "Bruk wine-datasettet. Kjør train_test_split med og uten stratify=y. Print andelen per klasse " +
      "i test-settet i hvert tilfelle — du vil se at stratify=y holder balansen bedre.",
    requires: [],
    starter: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
import pandas as pd

X, y = load_wine(return_X_y=True)

# Uten stratify
_, _, _, y_test_a = train_test_split(X, y, test_size=0.2, random_state=1)
print("Uten stratify:")
print(pd.Series(y_test_a).value_counts(normalize=True).sort_index().round(3))

# TODO: med stratify=y
`,
    solution: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
import pandas as pd

X, y = load_wine(return_X_y=True)
_, _, _, y_test_a = train_test_split(X, y, test_size=0.2, random_state=1)
print("Uten stratify:")
print(pd.Series(y_test_a).value_counts(normalize=True).sort_index().round(3))

_, _, _, y_test_b = train_test_split(X, y, test_size=0.2, stratify=y, random_state=1)
print("Med stratify:")
print(pd.Series(y_test_b).value_counts(normalize=True).sort_index().round(3))
`,
  },
  {
    id: "dte2602-py-pipeline-cv",
    topic: "DTE-2602 Preprocessing",
    title: "Pipeline: StandardScaler + LogisticRegression med CV",
    description:
      "Bygg en `Pipeline([(\"sc\", StandardScaler()), (\"clf\", LogisticRegression())])` og " +
      "kjør `cross_val_score(cv=5, scoring='accuracy')` på iris. Print snitt og std.",
    requires: [],
    starter: `from sklearn.datasets import load_iris
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

X, y = load_iris(return_X_y=True)

# TODO: bygg Pipeline, cross_val_score med cv=5, print snitt og std
`,
    solution: `from sklearn.datasets import load_iris
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

X, y = load_iris(return_X_y=True)
pipe = Pipeline([("sc", StandardScaler()), ("clf", LogisticRegression(max_iter=1000))])
scores = cross_val_score(pipe, X, y, cv=5)
print(f"snitt: {scores.mean():.3f}, std: {scores.std():.3f}")
`,
  },
  {
    id: "dte2602-py-coltransformer",
    topic: "DTE-2602 Preprocessing",
    title: "ColumnTransformer: numerisk + kategorisk",
    description:
      "Lag et lite syntetisk DataFrame med 2 numeriske og 1 kategorisk kolonne. Bygg " +
      "ColumnTransformer som skalerer numeriske og one-hot-koder kategoriske. " +
      "Print resultatformen (rader, kolonner) etter `.fit_transform(df)`.",
    requires: [],
    starter: `import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

df = pd.DataFrame({
    "alder": [25, 30, 22, 45, 38],
    "vekt":  [70, 80, 60, 90, 75],
    "by":    ["Oslo", "Tromsø", "Oslo", "Bergen", "Tromsø"],
})

# TODO: ColumnTransformer (num: StandardScaler, cat: OneHotEncoder)
# Print resultatformen.
`,
    solution: `import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

df = pd.DataFrame({
    "alder": [25, 30, 22, 45, 38],
    "vekt":  [70, 80, 60, 90, 75],
    "by":    ["Oslo", "Tromsø", "Oslo", "Bergen", "Tromsø"],
})
prep = ColumnTransformer([
    ("num", StandardScaler(), ["alder", "vekt"]),
    ("cat", OneHotEncoder(sparse_output=False), ["by"]),
])
X = prep.fit_transform(df)
print("shape:", X.shape)
print(X.round(2))
`,
  },

  // ============ MODELLER (6) ============
  {
    id: "dte2602-py-logreg-coef",
    topic: "DTE-2602 Modeller",
    title: "LogisticRegression — tolk koeffisientene",
    description:
      "Tren LogisticRegression på binær iris (klasse 0 vs ikke-0). Print koeffisientene " +
      "med feature-navn — hvilken feature har størst påvirkning?",
    requires: [],
    starter: `from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import pandas as pd

iris = load_iris(as_frame=True)
X = iris.data
y = (iris.target == 0).astype(int)   # 1 hvis setosa, ellers 0

# TODO: skalér X, tren LogReg, print pandas.Series av coef_[0] mot X.columns
`,
    solution: `from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import pandas as pd

iris = load_iris(as_frame=True)
X = iris.data
y = (iris.target == 0).astype(int)

Xs = StandardScaler().fit_transform(X)
clf = LogisticRegression().fit(Xs, y)
print(pd.Series(clf.coef_[0], index=X.columns).round(2))
`,
  },
  {
    id: "dte2602-py-tree-vs-rf",
    topic: "DTE-2602 Modeller",
    title: "DecisionTree vs RandomForest — sammenlign CV-score",
    description:
      "Tren `DecisionTreeClassifier(max_depth=3)` og `RandomForestClassifier(n_estimators=100)` " +
      "på wine-datasettet. Bruk 5-fold stratified CV og sammenlign snitt-score.",
    requires: [],
    starter: `from sklearn.datasets import load_wine
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

X, y = load_wine(return_X_y=True)

# TODO: kjør CV på begge, print snitt
`,
    solution: `from sklearn.datasets import load_wine
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

X, y = load_wine(return_X_y=True)
tree = DecisionTreeClassifier(max_depth=3, random_state=42)
rf   = RandomForestClassifier(n_estimators=100, random_state=42)
print(f"tree: {cross_val_score(tree, X, y, cv=5).mean():.3f}")
print(f"rf:   {cross_val_score(rf,   X, y, cv=5).mean():.3f}")
`,
  },
  {
    id: "dte2602-py-knn-grid",
    topic: "DTE-2602 Modeller",
    title: "GridSearchCV for kNN — best k",
    description:
      "Søk over k ∈ {1, 3, 5, 15} for KNeighborsClassifier på iris. Bruk Pipeline med " +
      "StandardScaler så avstander beregnes på skalert data. Print best_params_.",
    requires: [],
    starter: `from sklearn.datasets import load_iris
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV

X, y = load_iris(return_X_y=True)

# TODO: Pipeline + GridSearchCV over knn__n_neighbors ∈ {1,3,5,15}
`,
    solution: `from sklearn.datasets import load_iris
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV

X, y = load_iris(return_X_y=True)
pipe = Pipeline([("sc", StandardScaler()), ("knn", KNeighborsClassifier())])
gs = GridSearchCV(pipe, {"knn__n_neighbors": [1, 3, 5, 15]}, cv=5)
gs.fit(X, y)
print("best:", gs.best_params_, "score:", round(gs.best_score_, 3))
`,
  },
  {
    id: "dte2602-py-ridge-vs-lasso",
    topic: "DTE-2602 Modeller",
    title: "Ridge vs Lasso — på diabetes-datasettet",
    description:
      "Bruk `load_diabetes`. Tren RidgeCV og LassoCV på skalert data. Print hvor mange " +
      "ikke-null-koeffisienter Lasso beholder vs Ridge.",
    requires: [],
    starter: `from sklearn.datasets import load_diabetes
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import RidgeCV, LassoCV

X, y = load_diabetes(return_X_y=True)
Xs = StandardScaler().fit_transform(X)

# TODO: RidgeCV og LassoCV, sammenlign antall ikke-null koeffisienter
`,
    solution: `from sklearn.datasets import load_diabetes
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import RidgeCV, LassoCV
import numpy as np

X, y = load_diabetes(return_X_y=True)
Xs = StandardScaler().fit_transform(X)

ridge = RidgeCV(alphas=[0.01, 0.1, 1, 10]).fit(Xs, y)
lasso = LassoCV(alphas=[0.01, 0.1, 1, 10], cv=5).fit(Xs, y)

print("Ridge non-zero:", np.sum(np.abs(ridge.coef_) > 1e-6))
print("Lasso non-zero:", np.sum(np.abs(lasso.coef_) > 1e-6))
print("Ridge alpha:", ridge.alpha_, "Lasso alpha:", round(lasso.alpha_, 4))
`,
  },
  {
    id: "dte2602-py-mlp-iris",
    topic: "DTE-2602 Modeller",
    title: "MLP mini-nett på iris",
    description:
      "Tren `MLPClassifier(hidden_layer_sizes=(8,), max_iter=2000)` på iris med skalert data. " +
      "Print accuracy på test-settet.",
    requires: [],
    starter: `from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split

X, y = load_iris(return_X_y=True)

# TODO: split + skalér + MLPClassifier((8,)) + print score
`,
    solution: `from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split

X, y = load_iris(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, stratify=y, random_state=42)
sc = StandardScaler().fit(X_tr)
mlp = MLPClassifier(hidden_layer_sizes=(8,), max_iter=2000, random_state=42)
mlp.fit(sc.transform(X_tr), y_tr)
print("test acc:", round(mlp.score(sc.transform(X_te), y_te), 3))
`,
  },
  {
    id: "dte2602-py-logreg-decision-boundary",
    topic: "DTE-2602 Modeller",
    title: "LogisticRegression — beregn beslutningsgrensen på 2 features",
    description:
      "Train LogReg på de to første feature-kolonnene i iris (binær: klasse 0 vs resten). " +
      "Print koeffisientene og en analytisk formel for beslutningsgrensen y = a*x + b.",
    requires: [],
    starter: `from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression

iris = load_iris()
X = iris.data[:, :2]
y = (iris.target == 0).astype(int)

# TODO: tren LogReg, hent w0, w1, b
# Formel for grensen: w0*x + w1*y + b = 0  =>  y = -(w0*x + b)/w1
`,
    solution: `from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression

iris = load_iris()
X = iris.data[:, :2]
y = (iris.target == 0).astype(int)

clf = LogisticRegression().fit(X, y)
w0, w1 = clf.coef_[0]
b = clf.intercept_[0]
print(f"w0={w0:.2f}, w1={w1:.2f}, b={b:.2f}")
print(f"grense: y = {-w0/w1:.2f} * x + {-b/w1:.2f}")
`,
  },

  // ============ EVALUERING (5) ============
  {
    id: "dte2602-py-classification-report",
    topic: "DTE-2602 Evaluering",
    title: "classification_report på wine",
    description:
      "Tren RandomForestClassifier på wine, print classification_report (precision, recall, F1 per klasse).",
    requires: [],
    starter: `from sklearn.datasets import load_wine
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

X, y = load_wine(return_X_y=True)

# TODO
`,
    solution: `from sklearn.datasets import load_wine
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

X, y = load_wine(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, stratify=y, random_state=42)
rf = RandomForestClassifier(n_estimators=100, random_state=42).fit(X_tr, y_tr)
print(classification_report(y_te, rf.predict(X_te)))
`,
  },
  {
    id: "dte2602-py-roc-manual",
    topic: "DTE-2602 Evaluering",
    title: "Tegn ROC manuelt med terskel-loop",
    description:
      "Bruk LogisticRegression på binær iris. Loop over 21 terskler i [0, 1], beregn TPR og FPR " +
      "for hver, print de første 5 punktene på ROC-kurven og roc_auc_score.",
    requires: [],
    starter: `from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
import numpy as np

iris = load_iris()
X, y = iris.data, (iris.target == 0).astype(int)

# TODO: probs = clf.predict_proba(X)[:, 1]
#       loop over thresholds, beregn TPR/FPR
`,
    solution: `from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
import numpy as np

iris = load_iris()
X, y = iris.data, (iris.target == 0).astype(int)

clf = LogisticRegression(max_iter=1000).fit(X, y)
probs = clf.predict_proba(X)[:, 1]
for t in np.linspace(0, 1, 21)[:5]:
    pred = (probs >= t).astype(int)
    tp = ((pred == 1) & (y == 1)).sum()
    fn = ((pred == 0) & (y == 1)).sum()
    fp = ((pred == 1) & (y == 0)).sum()
    tn = ((pred == 0) & (y == 0)).sum()
    tpr = tp / max(tp + fn, 1)
    fpr = fp / max(fp + tn, 1)
    print(f"thr={t:.2f}  TPR={tpr:.2f}  FPR={fpr:.2f}")
print("AUC:", round(roc_auc_score(y, probs), 3))
`,
  },
  {
    id: "dte2602-py-confusion-matrix",
    topic: "DTE-2602 Evaluering",
    title: "Confusion matrix og F1",
    description:
      "Bruk LogisticRegression på binær iris (klasse 0 = positiv). Print confusion_matrix og " +
      "F1-score for klasse 1 (positiv).",
    requires: [],
    starter: `from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, f1_score

iris = load_iris()
X = iris.data
y = (iris.target == 0).astype(int)

# TODO
`,
    solution: `from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, f1_score

iris = load_iris()
X = iris.data
y = (iris.target == 0).astype(int)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, stratify=y, random_state=42)
clf = LogisticRegression(max_iter=1000).fit(X_tr, y_tr)
pred = clf.predict(X_te)
print(confusion_matrix(y_te, pred))
print("F1:", round(f1_score(y_te, pred), 3))
`,
  },
  {
    id: "dte2602-py-learning-curve",
    topic: "DTE-2602 Evaluering",
    title: "learning_curve — train/val-feil vs treningssett-størrelse",
    description:
      "Bruk `learning_curve` på en RandomForest på wine. Print snitt train- og val-score for " +
      "fem treningsstørrelser ∈ [10 %, 100 %].",
    requires: [],
    starter: `from sklearn.datasets import load_wine
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import learning_curve
import numpy as np

X, y = load_wine(return_X_y=True)

# TODO: learning_curve med train_sizes=np.linspace(0.1, 1.0, 5)
`,
    solution: `from sklearn.datasets import load_wine
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import learning_curve
import numpy as np

X, y = load_wine(return_X_y=True)
sizes, tr, va = learning_curve(
    RandomForestClassifier(n_estimators=50, random_state=42),
    X, y, cv=5, train_sizes=np.linspace(0.1, 1.0, 5),
)
for s, t, v in zip(sizes, tr.mean(1), va.mean(1)):
    print(f"n={int(s):3d}  train={t:.3f}  val={v:.3f}")
`,
  },
  {
    id: "dte2602-py-threshold-tuning",
    topic: "DTE-2602 Evaluering",
    title: "Finn optimal terskel for F1",
    description:
      "Loop over terskler [0.10, 0.20, ..., 0.90], beregn F1 på test-settet, og print den med høyest F1.",
    requires: [],
    starter: `from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score
import numpy as np

X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, stratify=y, random_state=42)
sc = StandardScaler().fit(X_tr)
clf = LogisticRegression(max_iter=2000).fit(sc.transform(X_tr), y_tr)
probs = clf.predict_proba(sc.transform(X_te))[:, 1]

# TODO: finn beste terskel mhp F1
`,
    solution: `from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score
import numpy as np

X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, stratify=y, random_state=42)
sc = StandardScaler().fit(X_tr)
clf = LogisticRegression(max_iter=2000).fit(sc.transform(X_tr), y_tr)
probs = clf.predict_proba(sc.transform(X_te))[:, 1]

best = (0, 0)
for t in np.arange(0.1, 1.0, 0.1):
    f1 = f1_score(y_te, (probs >= t).astype(int))
    if f1 > best[1]:
        best = (t, f1)
print(f"beste terskel={best[0]:.2f}, F1={best[1]:.3f}")
`,
  },

  // ============ ALGORITMER FRA BUNN (2) ============
  {
    id: "dte2602-py-gd-linear",
    topic: "DTE-2602 Algoritmer fra bunn",
    title: "Batch gradient descent fra bunn — y = 2x + 3 + støy",
    description:
      "Generér data med y = 2x + 3 + støy. Implementer batch gradient descent for lineær " +
      "regresjon: w og b oppdateres samtidig. Kjør 500 iterasjoner med læringsrate 0.01, " +
      "print loss hver 100 iterasjoner og endelige (w, b).",
    requires: [],
    starter: `import numpy as np

rng = np.random.default_rng(42)
x = np.linspace(-1, 1, 100)
y = 2 * x + 3 + rng.normal(0, 0.2, len(x))

# TODO: implementer batch GD: oppdater w og b for å minimere MSE
# Start w=0, b=0. læringsrate 0.01, 500 iter.
`,
    solution: `import numpy as np

rng = np.random.default_rng(42)
x = np.linspace(-1, 1, 100)
y = 2 * x + 3 + rng.normal(0, 0.2, len(x))

w, b = 0.0, 0.0
lr = 0.01
n = len(x)
for i in range(500):
    pred = w * x + b
    err = pred - y
    dw = (2 / n) * np.dot(err, x)
    db = (2 / n) * err.sum()
    w -= lr * dw
    b -= lr * db
    if i % 100 == 0:
        loss = (err ** 2).mean()
        print(f"iter {i}: loss={loss:.4f}, w={w:.3f}, b={b:.3f}")
print(f"FINAL: w={w:.3f}, b={b:.3f}")
`,
  },
  {
    id: "dte2602-py-kmeans-from-scratch",
    topic: "DTE-2602 Algoritmer fra bunn",
    title: "k-means fra bunn — to klustere",
    description:
      "Generér to overlappende 2D-klustere. Implementer k-means: random init av 2 centroids, " +
      "iterér 10 ganger (tilordne → oppdater). Print endelige centroids og antall punkt per kluster.",
    requires: [],
    starter: `import numpy as np

rng = np.random.default_rng(0)
A = rng.normal((0, 0), 0.5, size=(50, 2))
B = rng.normal((3, 3), 0.5, size=(50, 2))
X = np.vstack([A, B])

# TODO: init 2 centroids, iterer assign + update
`,
    solution: `import numpy as np

rng = np.random.default_rng(0)
A = rng.normal((0, 0), 0.5, size=(50, 2))
B = rng.normal((3, 3), 0.5, size=(50, 2))
X = np.vstack([A, B])

idx = rng.choice(len(X), 2, replace=False)
centroids = X[idx].copy()
for _ in range(10):
    # assign
    d = ((X[:, None, :] - centroids[None, :, :]) ** 2).sum(-1)
    labels = d.argmin(1)
    # update
    for k in range(2):
        pts = X[labels == k]
        if len(pts) > 0:
            centroids[k] = pts.mean(0)
print("centroids:", centroids.round(2))
print("kluster-0 har", (labels == 0).sum(), "punkter")
print("kluster-1 har", (labels == 1).sum(), "punkter")
`,
  },
];
