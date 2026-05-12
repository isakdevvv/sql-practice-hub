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

  // ============================================================
  // PORTEFØLJE-OPPGAVER — evaluering, lekkasje, rapport-byggesteiner
  // (komplementært til oppgavene over)
  // ============================================================
  {
    id: "dte2602p-py-baseline-vs-modell",
    topic: "Modellevaluering",
    title: "Baseline vs modell — vis differansen",
    description:
      "DummyClassifier setter et nedre tak. Bruk den til å vise at modellen din faktisk lærer noe.",
    requires: ["numpy", "scikit-learn"],
    starter: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

# TODO:
# 1. Tren en DummyClassifier(strategy="most_frequent") — print accuracy
# 2. Tren en LogisticRegression(max_iter=2000) — print accuracy
# 3. Print differansen (modell - dummy) — viser ekte gevinst
`,
    solution: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

dummy = DummyClassifier(strategy="most_frequent").fit(X_train, y_train)
model = LogisticRegression(max_iter=2000).fit(X_train, y_train)

d = dummy.score(X_test, y_test)
m = model.score(X_test, y_test)
print(f"Dummy:   {d:.3f}")
print(f"LogReg:  {m:.3f}")
print(f"Gevinst: {m - d:+.3f}")
`,
    hints: [
      "DummyClassifier predikerer alltid majoritetsklassen — accuracy = klassebalansen",
      "Differansen er det viktigste tallet i rapporten — viser at modellen lærer mer enn 'alltid majoritet'",
      "På breast_cancer er klassebalansen ~63/37 — dummy gir ca 63%, logreg ca 95%",
    ],
  },
  {
    id: "dte2602p-py-leakage-demo",
    topic: "Modellevaluering",
    title: "Lekkasje-demo: fit scaler før eller etter split?",
    description:
      "Vis konkret forskjellen mellom å skalere FØR vs ETTER train/test-split.",
    requires: ["numpy", "scikit-learn"],
    starter: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

X, y = load_breast_cancer(return_X_y=True)

# TODO:
# 1. FEIL måte — fit scaler på HELE X (lekkasje):
#       X_lekk = StandardScaler().fit_transform(X)
#       split X_lekk og y → tren → 'acc_lekk'
# 2. RIKTIG måte — split først, fit scaler kun på train:
#       split X og y → fit scaler på X_train_r → transform begge
#       → tren → 'acc_riktig'
# 3. Print begge to og diskuter forskjellen.
`,
    solution: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

X, y = load_breast_cancer(return_X_y=True)

# 1. LEKKASJE
X_lekk = StandardScaler().fit_transform(X)
X_train_l, X_test_l, y_train_l, y_test_l = train_test_split(
    X_lekk, y, test_size=0.2, random_state=42, stratify=y)
acc_lekk = (
    LogisticRegression(max_iter=2000)
    .fit(X_train_l, y_train_l)
    .score(X_test_l, y_test_l)
)

# 2. RIKTIG
X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)
scaler = StandardScaler().fit(X_train_r)
acc_riktig = (
    LogisticRegression(max_iter=2000)
    .fit(scaler.transform(X_train_r), y_train_r)
    .score(scaler.transform(X_test_r), y_test_r)
)

print(f"Lekkasje:  {acc_lekk:.4f}")
print(f"Riktig:    {acc_riktig:.4f}")
print(f"Forskjell: {acc_lekk - acc_riktig:+.4f}")
print("På små/balanserte datasett er forskjellen ofte LITEN.")
print("Det er det som gjør lekkasje farlig — den oppdages ikke uten leting.")
`,
    hints: [
      "Sett scaler.fit() på X_train_r, og bruk samme scaler.transform() på begge sett",
      "På breast_cancer er forskjellen ofte 0.0-0.5 prosentpoeng — men på andre datasett kan den være stor",
      "Riktigste skole: bruk Pipeline — gjør lekkasjen umulig",
    ],
  },
  {
    id: "dte2602p-py-cm-precision-recall",
    topic: "Modellevaluering",
    title: "Confusion matrix → precision/recall for hånd",
    description:
      "Beregn precision og recall manuelt fra en confusion matrix og verifiser mot sklearn.",
    requires: ["numpy", "scikit-learn"],
    starter: `import numpy as np
from sklearn.metrics import precision_score, recall_score

# Confusion matrix [[TN, FP], [FN, TP]] for et binært klassifikasjonsproblem
cm = np.array([[80, 20],
               [5, 95]])

# TODO:
# 1. Hent ut TN, FP, FN, TP fra cm (bruk cm.ravel()).
# 2. Beregn manuelt:
#       precision = TP / (TP + FP)
#       recall    = TP / (TP + FN)
# 3. Sjekk mot sklearns precision_score/recall_score ved å lage y_true/y_pred
#    som ville gitt akkurat denne matrisen.
# 4. Print begge to.
`,
    solution: `import numpy as np
from sklearn.metrics import precision_score, recall_score

cm = np.array([[80, 20],
               [5, 95]])
tn, fp, fn, tp = cm.ravel()

precision_manuell = tp / (tp + fp)
recall_manuell    = tp / (tp + fn)

# Bygg y_true/y_pred som matcher matrisen
y_true = [0]*tn + [0]*fp + [1]*fn + [1]*tp
y_pred = [0]*tn + [1]*fp + [0]*fn + [1]*tp

print(f"precision  manuelt: {precision_manuell:.4f}")
print(f"precision  sklearn: {precision_score(y_true, y_pred):.4f}")
print(f"recall     manuelt: {recall_manuell:.4f}")
print(f"recall     sklearn: {recall_score(y_true, y_pred):.4f}")
`,
    hints: [
      "cm.ravel() flater (2,2)-matrisen til (4,) — TN, FP, FN, TP i den rekkefølgen",
      "Lag y_true/y_pred som lister av 0/1 som matcher hver celle",
      "Resultatet skal være identisk i 4 desimaler",
    ],
  },
  {
    id: "dte2602p-py-cross-val-folder",
    topic: "Modellevaluering",
    title: "Cross-val: rapporter beste/verste fold",
    description:
      "Cross-validation gir et estimat med variasjon. Rapporter både mean, std og enkeltverdier.",
    requires: ["numpy", "scikit-learn"],
    starter: `from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import numpy as np

X, y = load_iris(return_X_y=True)

# TODO:
# 1. Lag en Pipeline med StandardScaler + LogisticRegression(max_iter=200).
# 2. Lag en StratifiedKFold(n_splits=5, shuffle=True, random_state=42).
# 3. Kjør cross_val_score med scoring='accuracy'.
# 4. Print:
#       mean ± std
#       hver enkelt fold-score
#       hvilken fold var BEST og hvilken VERST?
`,
    solution: `from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import numpy as np

X, y = load_iris(return_X_y=True)

pipe = Pipeline([("sc", StandardScaler()), ("m", LogisticRegression(max_iter=200))])
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(pipe, X, y, cv=cv, scoring="accuracy")

print(f"Mean ± std:  {scores.mean():.3f} ± {scores.std():.3f}")
print(f"Hver fold:   {[round(s, 3) for s in scores]}")
print(f"Beste fold:  #{int(np.argmax(scores))+1} ({scores.max():.3f})")
print(f"Verste fold: #{int(np.argmin(scores))+1} ({scores.min():.3f})")
`,
    hints: [
      "Rapportér ALDRI bare mean — std forteller om modellen er stabil",
      "Hvis verste fold er mye dårligere enn beste, er modellen sensitiv for hvilke eksempler den fikk se",
      "På Iris er begge tett opp mot 1.0 — på vanskeligere datasett er spredningen større",
    ],
  },
  {
    id: "dte2602p-py-threshold-pr",
    topic: "Modellevaluering",
    title: "Tune terskel for precision-recall trade-off",
    description:
      "Default-terskel 0.5 er ikke alltid optimal. Velg terskelen som matcher din business case.",
    requires: ["numpy", "scikit-learn"],
    starter: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import precision_recall_curve
import numpy as np

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

pipe = Pipeline([("sc", StandardScaler()), ("m", LogisticRegression(max_iter=2000))])
pipe.fit(X_train, y_train)
y_proba = pipe.predict_proba(X_test)[:, 1]

# TODO:
# 1. Bruk precision_recall_curve for å få (precisions, recalls, terskler).
# 2. Finn første terskel der recall >= 0.99 (kreft-screening: vil maksimere recall).
# 3. Bruk den terskelen til prediksjon: (y_proba >= terskel).astype(int)
# 4. Sammenlign precision og recall med default-terskel (0.5).
`,
    solution: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    precision_recall_curve, precision_score, recall_score,
)
import numpy as np

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

pipe = Pipeline([("sc", StandardScaler()), ("m", LogisticRegression(max_iter=2000))])
pipe.fit(X_train, y_train)
y_proba = pipe.predict_proba(X_test)[:, 1]

precisions, recalls, terskler = precision_recall_curve(y_test, y_proba)
mask = recalls[:-1] >= 0.99
terskel = terskler[int(np.argmax(mask))] if mask.any() else 0.5

y_pred_tuned   = (y_proba >= terskel).astype(int)
y_pred_default = pipe.predict(X_test)

print(f"Valgt terskel: {terskel:.3f}")
print(f"  Precision: {precision_score(y_test, y_pred_tuned):.3f}")
print(f"  Recall:    {recall_score(y_test, y_pred_tuned):.3f}")
print(f"Default (0.5):")
print(f"  Precision: {precision_score(y_test, y_pred_default):.3f}")
print(f"  Recall:    {recall_score(y_test, y_pred_default):.3f}")
`,
    hints: [
      "precision_recall_curve returnerer 3 arrays — siste har én færre element",
      "Lavere terskel → høyere recall, lavere precision (og motsatt)",
      "For kreft-screening: høy recall viktigst (false negative er dødelig)",
    ],
  },
  {
    id: "dte2602p-py-feature-importance",
    topic: "Modellevaluering",
    title: "Feature importance fra Random Forest",
    description:
      "Hvilke features drev prediksjonen mest? Random Forest gir feature_importance — rapporter top-5.",
    requires: ["numpy", "scikit-learn"],
    starter: `from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
import numpy as np

data = load_breast_cancer()
X, y = data.data, data.target
fnames = data.feature_names

# TODO:
# 1. Tren RandomForestClassifier(n_estimators=100, random_state=42) på (X, y).
# 2. Hent .feature_importances_ (30 verdier, summerer til ca 1.0).
# 3. Sorter og print top-5 features med viktighet.
# 4. Print sum av top-5 (sier hvor "konsentrert" forklaringskraften er).
`,
    solution: `from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
import numpy as np

data = load_breast_cancer()
X, y = data.data, data.target
fnames = data.feature_names

rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X, y)
imp = rf.feature_importances_

idx_sortert = np.argsort(imp)[::-1]
print("Top-5 features:")
top5 = 0.0
for rank, i in enumerate(idx_sortert[:5], start=1):
    print(f"  {rank}. {fnames[i]:<30} {imp[i]:.3f}")
    top5 += imp[i]
print(f"\\nTop-5 forklarer {top5:.1%} av total feature_importance")
`,
    hints: [
      "feature_importances_ er normalisert (summerer til 1.0) — gini-impurity-reduksjon",
      "np.argsort returnerer indekser; [::-1] reverserer (synkende)",
      "f-format: f'{x:.1%}' gir prosent med 1 desimal",
    ],
  },
  {
    id: "dte2602p-py-pca-2d",
    topic: "Klustering & dim-red",
    title: "PCA — reduser Iris til 2D",
    description:
      "Bruk PCA for å redusere 4D Iris-data til 2D. Hvor mye varians forklares?",
    requires: ["numpy", "scikit-learn"],
    starter: `from sklearn.datasets import load_iris
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

X, y = load_iris(return_X_y=True)

# TODO:
# 1. Skaler X med StandardScaler (PCA er sensitivt for skala).
# 2. Tren PCA(n_components=2) og transformer X til X_2d (shape 150x2).
# 3. Print:
#       X_2d.shape
#       explained_variance_ratio_
#       sum av forklart varians
# 4. Print mean per klasse i 2D-rommet.
`,
    solution: `from sklearn.datasets import load_iris
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

X, y = load_iris(return_X_y=True)

X_scaled = StandardScaler().fit_transform(X)
pca = PCA(n_components=2)
X_2d = pca.fit_transform(X_scaled)

print(f"X_2d shape: {X_2d.shape}")
print(f"Explained variance per komponent: {pca.explained_variance_ratio_}")
print(f"Sum: {pca.explained_variance_ratio_.sum():.3f} av total varians")
print()
print("Mean per klasse i 2D-rommet:")
for k in range(3):
    mean = X_2d[y == k].mean(axis=0)
    print(f"  klasse {k}: ({mean[0]:+.2f}, {mean[1]:+.2f})")
`,
    hints: [
      "PCA-komponenter er ortogonale retninger med maksimal varians",
      "explained_variance_ratio_ summerer til ≤ 1.0 — 2 komponenter ≠ 100%",
      "På Iris fanger 2 komponenter ~95% av variansen — derfor er 2D-plot informativ",
    ],
  },
  {
    id: "dte2602p-py-mini-rapport",
    topic: "Modellevaluering",
    title: "Bygg en mini-rapport som tekst",
    description:
      "Tren en modell og generer en formatert tekst-rapport — slik den kunne stått som vedlegg i mappe-oppgaven.",
    requires: ["numpy", "scikit-learn"],
    starter: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

pipe = Pipeline([("sc", StandardScaler()), ("m", LogisticRegression(max_iter=2000))])

# TODO:
# 1. Fit pipe på (X_train, y_train).
# 2. Beregn 5-fold CV-f1_macro på TRAIN-settet.
# 3. Predikér på X_test, lag classification_report + confusion_matrix.
# 4. Bygg en tekst-streng 'rapport' med header, datasett-info, CV-tall, report, matrise og en konklusjon.
# 5. Print rapport.
`,
    solution: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

pipe = Pipeline([("sc", StandardScaler()), ("m", LogisticRegression(max_iter=2000))])
pipe.fit(X_train, y_train)
cv = cross_val_score(pipe, X_train, y_train, cv=5, scoring="f1_macro")
y_pred = pipe.predict(X_test)

linjer = [
    "=== Brystkreft-klassifikasjon — modellrapport ===",
    "",
    f"Datasett:  {len(X)} eksempler, {X.shape[1]} features, 2 klasser",
    f"Split:     {len(X_train)} train / {len(X_test)} test (stratifisert)",
    f"Modell:    StandardScaler → LogisticRegression(max_iter=2000)",
    "",
    f"5-fold CV f1_macro: {cv.mean():.3f} ± {cv.std():.3f}",
    f"Folder:             {[round(s, 3) for s in cv]}",
    "",
    "Test-set classification report:",
    classification_report(y_test, y_pred, target_names=["malignant", "benign"]),
    "Confusion matrix:",
    str(confusion_matrix(y_test, y_pred)),
    "",
    "Konklusjon: Modellen oppnår høy recall på begge klasser — særlig viktig for",
    "             malignant-klassen der false-negative er kostbart. Egnet som",
    "             beslutningsstøtte for kliniker, ikke som autonom diagnose.",
]
rapport = "\\n".join(linjer)
print(rapport)
`,
    hints: [
      'Bruk "\\n".join(linjer) i stedet for print() per linje',
      "classification_report returnerer ferdig flerlinjet streng — bare lim inn",
      "Konklusjonen skal SI noe, ikke gjenta tall — fortolk for sensor",
    ],
  },
  {
    id: "dte2602p-py-imbalance-class-weight",
    topic: "Modellevaluering",
    title: "class_weight='balanced' på ubalansert data",
    description:
      "Lag et 95/5-datasett og sammenlign modell med og uten class_weight='balanced'.",
    requires: ["numpy", "scikit-learn"],
    starter: `from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import recall_score, precision_score

X, y = make_classification(n_samples=2000, weights=[0.95, 0.05], random_state=42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

# TODO:
# 1. Tren LogisticRegression UTEN class_weight — print recall(1) + precision(1)
# 2. Tren LogisticRegression(class_weight='balanced') — print samme metrikker
# 3. Diskuter forskjellen (i print).
`,
    solution: `from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import recall_score, precision_score

X, y = make_classification(n_samples=2000, weights=[0.95, 0.05], random_state=42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

for cw in [None, "balanced"]:
    m = LogisticRegression(max_iter=2000, class_weight=cw).fit(X_train, y_train)
    y_pred = m.predict(X_test)
    r = recall_score(y_test, y_pred, pos_label=1)
    p = precision_score(y_test, y_pred, pos_label=1, zero_division=0)
    print(f"class_weight={cw!r}: recall(1)={r:.3f}, precision(1)={p:.3f}")

print()
print("balanced gir høyere recall på minoritetsklassen på bekostning av precision —")
print("modellen lærer å 'se etter' minoriteten i stedet for å ignorere den.")
`,
    hints: [
      "class_weight='balanced' vektar omvendt proporsjonalt med klassefrekvens",
      "Forvent at recall(1) går OPP og precision(1) går NED",
      "Alternativer: oversampling (imbalanced-learn), eller justere terskel manuelt",
    ],
  },
  {
    id: "dte2602p-py-knn-scale-demo",
    topic: "Modellevaluering",
    title: "kNN — vis at skalering betyr ALT",
    description:
      "kNN er avstandsbasert. Når én feature er på MYE større skala enn andre, dominerer den helt.",
    requires: ["numpy", "scikit-learn"],
    starter: `import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Konstruert data: feature 0 og 1 bestemmer klassen; feature 2 er støy med 1000x skala
np.random.seed(42)
n = 200
X = np.column_stack([
    np.random.randn(n),
    np.random.randn(n),
    np.random.randn(n) * 1000,
])
y = (X[:, 0] + X[:, 1] > 0).astype(int)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42, stratify=y)

# TODO:
# 1. Tren KNeighborsClassifier(n_neighbors=5) UTEN skalering — print accuracy
# 2. Skaler med StandardScaler (fit på train) — transformer begge
# 3. Tren ny kNN på skalerte data — print accuracy
# 4. Skalert versjon skal være BETYDELIG bedre.
`,
    solution: `import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

np.random.seed(42)
n = 200
X = np.column_stack([
    np.random.randn(n),
    np.random.randn(n),
    np.random.randn(n) * 1000,
])
y = (X[:, 0] + X[:, 1] > 0).astype(int)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42, stratify=y)

acc_uten = (
    KNeighborsClassifier(n_neighbors=5).fit(X_train, y_train).score(X_test, y_test)
)

scaler = StandardScaler().fit(X_train)
acc_med = (
    KNeighborsClassifier(n_neighbors=5)
    .fit(scaler.transform(X_train), y_train)
    .score(scaler.transform(X_test), y_test)
)

print(f"Uten skalering: {acc_uten:.3f}")
print(f"Med skalering:  {acc_med:.3f}")
print(f"Forbedring:     {acc_med - acc_uten:+.3f}")
`,
    hints: [
      "kNN bruker euklidisk avstand: sqrt(sum((x_i - x_j)^2))",
      "Hvis én feature er 1000x større, dominerer den helt — andre features ignoreres",
      "Skalering gir alle features lik vekt — derfor kritisk for kNN, SVM, LogReg",
    ],
  },
  {
    id: "dte2602p-py-pandas-eda",
    topic: "Klustering & dim-red",
    title: "Pandas-EDA: dtypes, missing, describe",
    description:
      "Klassisk EDA-rutine med pandas. Bruk en CSV-lignende DataFrame til å øve.",
    requires: ["numpy", "scikit-learn", "pandas"],
    starter: `import pandas as pd
import numpy as np

# I et ekte prosjekt: pd.read_csv("data.csv"). Her bruker vi en simulert DataFrame.
df = pd.DataFrame({
    "alder":   [25, 30, np.nan, 45, 50, 35, np.nan, 60],
    "inntekt": [400_000, 500_000, 350_000, 700_000, 600_000, np.nan, 450_000, 800_000],
    "kjonn":   ["M", "K", "M", "K", "M", "K", "K", "M"],
    "lan":     [0, 1, 0, 1, 1, 0, 0, 1],
})

# TODO:
# 1. Print df.shape
# 2. Print df.dtypes
# 3. Print NaN per kolonne: df.isna().sum()
# 4. Print df.describe() — numeriske kolonner
# 5. Print df['lan'].value_counts() — klassefordeling
`,
    solution: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "alder":   [25, 30, np.nan, 45, 50, 35, np.nan, 60],
    "inntekt": [400_000, 500_000, 350_000, 700_000, 600_000, np.nan, 450_000, 800_000],
    "kjonn":   ["M", "K", "M", "K", "M", "K", "K", "M"],
    "lan":     [0, 1, 0, 1, 1, 0, 0, 1],
})

print(f"Shape: {df.shape}")
print()
print("Dtypes:")
print(df.dtypes)
print()
print("NaN per kolonne:")
print(df.isna().sum())
print()
print("Numerisk describe:")
print(df.describe())
print()
print("Klassefordeling 'lan':")
print(df["lan"].value_counts())
`,
    hints: [
      "df.shape → (rader, kolonner)",
      "df.isna().sum() er en av de første sjekkene — kolonner med mye NaN må håndteres eksplisitt",
      "df.describe() gir count, mean, std, min, 25/50/75%, max for numeriske kolonner",
    ],
  },
];
