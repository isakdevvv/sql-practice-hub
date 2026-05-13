import type { ProjectStep } from "./types";

/**
 * DTE-2602 Pyodide-baserte multi-step prosjekter — speiler mønsteret fra
 * src/lib/python/project.ts (Flask-nettbutikken). Hvert trinn har starter,
 * solution, hints, og en innebygget test-blokk som printer PASS:/FAIL:
 * for å markere trinnet som fullført.
 *
 * Kjøres via Pyodide med pre-loaded scikit-learn + matplotlib + numpy.
 *
 * To prosjekter:
 *   - iris-klassifisering   (8 trinn — supervised)
 *   - klustering-blobs      (6 trinn — unsupervised)
 */

const COMMON_REQUIRES = ["numpy", "scikit-learn", "matplotlib"];

// ===========================================================================
// PROSJEKT 1: IRIS-KLASSIFISERING (8 trinn)
// ===========================================================================
//
// 1. Last datasett (sklearn.datasets.load_iris)
// 2. EDA — distribusjoner + summary stats
// 3. Train/test split
// 4. Tren kNN, mål accuracy
// 5. Tren logistic regression, sammenlign
// 6. Hyperparameter-tuning med GridSearchCV
// 7. Confusion matrix + classification report
// 8. Skriv et 1-side resultat-sammendrag

const IRIS_S1_STARTER = `# ──── Trinn 1: Last Iris-datasettet ────
from sklearn.datasets import load_iris

# TODO:
# 1. Kall load_iris() og lagre i variabelen 'iris'.
# 2. Hent ut data-matrisen til 'X' (shape: 150 x 4) og target-vektoren til 'y' (shape: 150,).
# 3. Print:
#      X.shape, y.shape, iris.target_names, iris.feature_names
#    Forventet: (150, 4) (150,) ['setosa' 'versicolor' 'virginica']
#               ['sepal length (cm)', ...]
#
# Skriv koden under:


# ──── Test ────
# Testen sjekker at X, y, iris er definert riktig.
try:
    assert X.shape == (150, 4), "X skal ha shape (150, 4)"
    print("PASS: X har riktig shape (150, 4)")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    assert y.shape == (150,), "y skal ha shape (150,)"
    print("PASS: y har riktig shape (150,)")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    klasser = list(iris.target_names)
    assert klasser == ["setosa", "versicolor", "virginica"]
    print(f"PASS: tre klasser: {klasser}")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const IRIS_S1_SOLUTION = `# ──── Trinn 1: Last Iris-datasettet ────
from sklearn.datasets import load_iris

iris = load_iris()
X = iris.data
y = iris.target

print("X.shape:", X.shape)
print("y.shape:", y.shape)
print("klasser:", iris.target_names)
print("features:", iris.feature_names)


# ──── Test ────
try:
    assert X.shape == (150, 4)
    print("PASS: X har riktig shape (150, 4)")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    assert y.shape == (150,)
    print("PASS: y har riktig shape (150,)")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    klasser = list(iris.target_names)
    assert klasser == ["setosa", "versicolor", "virginica"]
    print(f"PASS: tre klasser: {klasser}")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const IRIS_S2_STARTER = `# ──── Trinn 2: EDA — distribusjoner per feature ────
import numpy as np
from sklearn.datasets import load_iris

iris = load_iris()
X = iris.data
y = iris.target

# TODO:
# 1. For hver av de 4 features (kolonner i X), beregn og print:
#       feature-navn, min, max, mean, std (bruk np.min/max/mean/std)
# 2. Tell hvor mange eksempler det er av hver klasse — print som dict.
#    Hint: bruk np.unique(y, return_counts=True).
#
# Skriv koden under:


# ──── Test ────
try:
    means = [float(np.mean(X[:, i])) for i in range(4)]
    # Iris-data har kjente means rundt: 5.84, 3.06, 3.76, 1.20
    diffs = [abs(means[0] - 5.84), abs(means[1] - 3.06),
             abs(means[2] - 3.76), abs(means[3] - 1.20)]
    assert all(d < 0.1 for d in diffs), f"means={means}"
    print(f"PASS: feature-means stemmer ({[round(m, 2) for m in means]})")
except Exception as e:
    print(f"FAIL: {e}")

try:
    unique, counts = np.unique(y, return_counts=True)
    assert list(counts) == [50, 50, 50]
    print(f"PASS: balanserte klasser (50 av hver)")
except Exception as e:
    print(f"FAIL: {e}")
`;

const IRIS_S2_SOLUTION = `# ──── Trinn 2: EDA — distribusjoner per feature ────
import numpy as np
from sklearn.datasets import load_iris

iris = load_iris()
X = iris.data
y = iris.target

# Statistikk per feature
print("Feature-statistikk:")
print(f"{'feature':<25} {'min':>6} {'max':>6} {'mean':>6} {'std':>6}")
for i, fname in enumerate(iris.feature_names):
    col = X[:, i]
    print(f"{fname:<25} {np.min(col):>6.2f} {np.max(col):>6.2f} "
          f"{np.mean(col):>6.2f} {np.std(col):>6.2f}")

# Klassefordeling
unique, counts = np.unique(y, return_counts=True)
fordeling = {iris.target_names[k]: int(c) for k, c in zip(unique, counts)}
print("\\nKlassefordeling:", fordeling)


# ──── Test ────
try:
    means = [float(np.mean(X[:, i])) for i in range(4)]
    diffs = [abs(means[0] - 5.84), abs(means[1] - 3.06),
             abs(means[2] - 3.76), abs(means[3] - 1.20)]
    assert all(d < 0.1 for d in diffs)
    print(f"PASS: feature-means stemmer ({[round(m, 2) for m in means]})")
except Exception as e:
    print(f"FAIL: {e}")

try:
    unique, counts = np.unique(y, return_counts=True)
    assert list(counts) == [50, 50, 50]
    print(f"PASS: balanserte klasser (50 av hver)")
except Exception as e:
    print(f"FAIL: {e}")
`;

const IRIS_S3_STARTER = `# ──── Trinn 3: Train/test split ────
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split

iris = load_iris()
X = iris.data
y = iris.target

# TODO:
# 1. Splitt X og y med train_test_split:
#       test_size=0.2, random_state=42, stratify=y
# 2. Lagre i X_train, X_test, y_train, y_test.
# 3. Print shapes for alle fire.
# 4. Bekreft at klassefordeling i train og test er balansert
#    (alle tre klasser representert).
#
# Skriv koden under:


# ──── Test ────
import numpy as np
try:
    assert X_train.shape == (120, 4), f"X_train shape var {X_train.shape}"
    assert X_test.shape == (30, 4), f"X_test shape var {X_test.shape}"
    print("PASS: split har riktige shapes (120 train, 30 test)")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    assert len(np.unique(y_train)) == 3, "train mangler en klasse"
    assert len(np.unique(y_test)) == 3, "test mangler en klasse"
    print("PASS: alle tre klasser i både train og test")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const IRIS_S3_SOLUTION = `# ──── Trinn 3: Train/test split ────
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
import numpy as np

iris = load_iris()
X = iris.data
y = iris.target

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"X_train: {X_train.shape}, y_train: {y_train.shape}")
print(f"X_test:  {X_test.shape}, y_test:  {y_test.shape}")

# Klassefordeling
for navn, data in [("train", y_train), ("test", y_test)]:
    u, c = np.unique(data, return_counts=True)
    print(f"  {navn}: {dict(zip(u.tolist(), c.tolist()))}")


# ──── Test ────
try:
    assert X_train.shape == (120, 4)
    assert X_test.shape == (30, 4)
    print("PASS: split har riktige shapes (120 train, 30 test)")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    assert len(np.unique(y_train)) == 3
    assert len(np.unique(y_test)) == 3
    print("PASS: alle tre klasser i både train og test")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const IRIS_S4_STARTER = `# ──── Trinn 4: Tren k-NN og mål accuracy ────
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target
)

# TODO:
# 1. Lag en StandardScaler, fit den på X_train, og transformer både X_train og X_test.
#    Lagre som X_train_s, X_test_s.
# 2. Lag en KNeighborsClassifier med n_neighbors=5.
# 3. Fit den på X_train_s, y_train.
# 4. Beregn accuracy på X_test_s, y_test og lagre i 'knn_acc'.
# 5. Print: "kNN (k=5) test accuracy: 0.XX"
#
# Skriv koden under:


# ──── Test ────
try:
    assert 0.85 <= knn_acc <= 1.01, f"knn_acc utenfor forventet område ({knn_acc})"
    print(f"PASS: kNN-accuracy = {knn_acc:.3f} (forventet > 0.85)")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const IRIS_S4_SOLUTION = `# ──── Trinn 4: Tren k-NN og mål accuracy ────
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target
)

# Skaler — kNN er avstandsbasert, sensitivt for skala
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

knn = KNeighborsClassifier(n_neighbors=5)
knn.fit(X_train_s, y_train)
knn_acc = knn.score(X_test_s, y_test)
print(f"kNN (k=5) test accuracy: {knn_acc:.3f}")


# ──── Test ────
try:
    assert 0.85 <= knn_acc <= 1.01
    print(f"PASS: kNN-accuracy = {knn_acc:.3f} (forventet > 0.85)")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const IRIS_S5_STARTER = `# ──── Trinn 5: Tren logistic regression og sammenlign ────
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target
)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

# kNN-baseline:
knn = KNeighborsClassifier(n_neighbors=5).fit(X_train_s, y_train)
knn_acc = knn.score(X_test_s, y_test)

# TODO:
# 1. Lag en LogisticRegression(max_iter=200).
# 2. Fit på X_train_s, y_train.
# 3. Beregn accuracy og lagre i 'logreg_acc'.
# 4. Print en sammenligning, f.eks.:
#       "kNN     : 0.XX"
#       "LogReg  : 0.XX"
#
# Skriv koden under:


# ──── Test ────
try:
    assert 0.85 <= logreg_acc <= 1.01, f"logreg_acc = {logreg_acc}"
    print(f"PASS: LogReg-accuracy = {logreg_acc:.3f} (forventet > 0.85)")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    diff = abs(logreg_acc - knn_acc)
    print(f"PASS: differansen knn-vs-logreg er {diff:.3f}")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const IRIS_S5_SOLUTION = `# ──── Trinn 5: Tren logistic regression og sammenlign ────
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target
)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

knn = KNeighborsClassifier(n_neighbors=5).fit(X_train_s, y_train)
knn_acc = knn.score(X_test_s, y_test)

logreg = LogisticRegression(max_iter=200)
logreg.fit(X_train_s, y_train)
logreg_acc = logreg.score(X_test_s, y_test)

print("Sammenligning på test:")
print(f"  kNN     : {knn_acc:.3f}")
print(f"  LogReg  : {logreg_acc:.3f}")


# ──── Test ────
try:
    assert 0.85 <= logreg_acc <= 1.01
    print(f"PASS: LogReg-accuracy = {logreg_acc:.3f} (forventet > 0.85)")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    diff = abs(logreg_acc - knn_acc)
    print(f"PASS: differansen knn-vs-logreg er {diff:.3f}")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const IRIS_S6_STARTER = `# ──── Trinn 6: Hyperparameter-tuning med GridSearchCV ────
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target
)

# TODO:
# 1. Lag en Pipeline med ('scaler', StandardScaler()) og ('knn', KNeighborsClassifier()).
# 2. Lag et param_grid:
#       'knn__n_neighbors': [1, 3, 5, 7, 9, 11, 13, 15]
#       'knn__weights':     ['uniform', 'distance']
# 3. Kjør GridSearchCV med cv=5 og scoring='accuracy'.
# 4. Fit på X_train, y_train.
# 5. Lagre best_params_ i 'best_params' og best_score_ i 'best_cv_score'.
# 6. Print både best_params og best_cv_score.
#
# Skriv koden under:


# ──── Test ────
try:
    assert "knn__n_neighbors" in best_params
    print(f"PASS: GridSearchCV ferdig — beste params: {best_params}")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    assert 0.9 <= best_cv_score <= 1.01
    print(f"PASS: best CV-score = {best_cv_score:.3f}")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const IRIS_S6_SOLUTION = `# ──── Trinn 6: Hyperparameter-tuning med GridSearchCV ────
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target
)

pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("knn", KNeighborsClassifier()),
])

param_grid = {
    "knn__n_neighbors": [1, 3, 5, 7, 9, 11, 13, 15],
    "knn__weights": ["uniform", "distance"],
}

gs = GridSearchCV(pipe, param_grid, cv=5, scoring="accuracy", n_jobs=1)
gs.fit(X_train, y_train)

best_params = gs.best_params_
best_cv_score = gs.best_score_

print(f"Beste params: {best_params}")
print(f"Beste CV-score: {best_cv_score:.3f}")
print(f"Test-accuracy med beste modell: {gs.score(X_test, y_test):.3f}")


# ──── Test ────
try:
    assert "knn__n_neighbors" in best_params
    print(f"PASS: GridSearchCV ferdig — beste params: {best_params}")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    assert 0.9 <= best_cv_score <= 1.01
    print(f"PASS: best CV-score = {best_cv_score:.3f}")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const IRIS_S7_STARTER = `# ──── Trinn 7: Confusion matrix + classification report ────
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import confusion_matrix, classification_report

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target
)

# Tren en logreg som vår "endelige" modell
pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("logreg", LogisticRegression(max_iter=200)),
])
pipe.fit(X_train, y_train)

# TODO:
# 1. Predikér klasser for X_test og lagre i y_pred.
# 2. Beregn confusion_matrix(y_test, y_pred) og lagre i 'cm'.
# 3. Print cm.
# 4. Print classification_report(y_test, y_pred, target_names=iris.target_names).
# 5. Beregn antall riktige (cm.diagonal().sum()) og lagre i 'antall_riktige'.
#
# Skriv koden under:


# ──── Test ────
import numpy as np
try:
    assert cm.shape == (3, 3)
    print(f"PASS: confusion matrix er 3x3:\\n{cm}")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    assert antall_riktige >= 25, f"forventet >= 25, fikk {antall_riktige}"
    print(f"PASS: {antall_riktige} av 30 riktige")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const IRIS_S7_SOLUTION = `# ──── Trinn 7: Confusion matrix + classification report ────
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import confusion_matrix, classification_report
import numpy as np

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target
)

pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("logreg", LogisticRegression(max_iter=200)),
])
pipe.fit(X_train, y_train)

y_pred = pipe.predict(X_test)
cm = confusion_matrix(y_test, y_pred)

print("Confusion matrix (radene = faktisk, kolonnene = predikert):")
print(cm)
print("\\nClassification report:")
print(classification_report(y_test, y_pred, target_names=iris.target_names))

antall_riktige = int(cm.diagonal().sum())
print(f"Riktige: {antall_riktige} / {len(y_test)}")


# ──── Test ────
try:
    assert cm.shape == (3, 3)
    print(f"PASS: confusion matrix er 3x3:\\n{cm}")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    assert antall_riktige >= 25
    print(f"PASS: {antall_riktige} av 30 riktige")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const IRIS_S8_STARTER = `# ──── Trinn 8: Resultat-sammendrag (én side) ────
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, f1_score
import numpy as np

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target
)

# To modeller
knn_pipe = Pipeline([("sc", StandardScaler()), ("m", KNeighborsClassifier(n_neighbors=5))])
log_pipe = Pipeline([("sc", StandardScaler()), ("m", LogisticRegression(max_iter=200))])

# TODO:
# 1. Fit begge modeller på X_train, y_train.
# 2. For HVER modell, beregn:
#       - test_acc  = accuracy på (X_test, y_test)
#       - test_f1   = f1_score(..., average='macro')
#       - cv_mean   = cross_val_score(model, X_train, y_train, cv=5).mean()
# 3. Lag en variabel 'sammendrag' (string) som inneholder ALT under, ferdig formattert.
#    Du står fritt med formuleringene, men sammendraget skal inneholde:
#      - tittel "Iris-klassifisering: resultatsammendrag"
#      - en tabell med modell, test_acc, test_f1, cv_mean
#      - en kort konklusjon (2-3 setninger) om hvilken modell som virket best
#    Eksempel:
#      "=== Iris-klassifisering: resultatsammendrag ==="
#      "Modell        Test-acc  Test-f1  CV-mean"
#      "kNN(k=5)      0.XX      0.XX     0.XX"
#      "LogReg        0.XX      0.XX     0.XX"
#      "Konklusjon: ..."
# 4. Print(sammendrag)
#
# Skriv koden under:


# ──── Test ────
try:
    assert isinstance(sammendrag, str)
    assert "kNN" in sammendrag or "knn" in sammendrag.lower()
    assert "LogReg" in sammendrag or "logreg" in sammendrag.lower() or "Logistisk" in sammendrag
    assert len(sammendrag) >= 100
    print("PASS: sammendrag inneholder begge modeller og er > 100 tegn")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    assert "Konklusjon" in sammendrag or "konklusjon" in sammendrag.lower()
    print("PASS: sammendrag inneholder konklusjon")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const IRIS_S8_SOLUTION = `# ──── Trinn 8: Resultat-sammendrag (én side) ────
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, f1_score
import numpy as np

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target
)

knn_pipe = Pipeline([("sc", StandardScaler()), ("m", KNeighborsClassifier(n_neighbors=5))])
log_pipe = Pipeline([("sc", StandardScaler()), ("m", LogisticRegression(max_iter=200))])

resultater = {}
for navn, pipe in [("kNN(k=5)", knn_pipe), ("LogReg", log_pipe)]:
    pipe.fit(X_train, y_train)
    y_pred = pipe.predict(X_test)
    resultater[navn] = {
        "test_acc": accuracy_score(y_test, y_pred),
        "test_f1": f1_score(y_test, y_pred, average="macro"),
        "cv_mean": cross_val_score(pipe, X_train, y_train, cv=5).mean(),
    }

best = max(resultater.items(), key=lambda kv: kv[1]["test_f1"])

linjer = ["=== Iris-klassifisering: resultatsammendrag ===", ""]
linjer.append(f"{'Modell':<12} {'Test-acc':>10} {'Test-f1':>10} {'CV-mean':>10}")
for navn, r in resultater.items():
    linjer.append(f"{navn:<12} {r['test_acc']:>10.3f} {r['test_f1']:>10.3f} {r['cv_mean']:>10.3f}")
linjer.append("")
linjer.append(
    f"Konklusjon: {best[0]} ga høyest test-f1 ({best[1]['test_f1']:.3f}). "
    f"Begge modellene klassifiserer Iris godt — datasettet er enkelt og features "
    f"separerer klassene tydelig (særlig petal length/width)."
)

sammendrag = "\\n".join(linjer)
print(sammendrag)


# ──── Test ────
try:
    assert isinstance(sammendrag, str)
    assert "kNN" in sammendrag or "knn" in sammendrag.lower()
    assert "LogReg" in sammendrag or "logreg" in sammendrag.lower()
    assert len(sammendrag) >= 100
    print("PASS: sammendrag inneholder begge modeller og er > 100 tegn")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    assert "Konklusjon" in sammendrag or "konklusjon" in sammendrag.lower()
    print("PASS: sammendrag inneholder konklusjon")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

// ===========================================================================
// PROSJEKT 2: KLUSTERING MED MAKE_BLOBS (6 trinn)
// ===========================================================================

const BLOBS_S1_STARTER = `# ──── Trinn 1: Generer 3 klustre med make_blobs ────
from sklearn.datasets import make_blobs

# TODO:
# 1. Bruk make_blobs til å generere 300 punkter med 3 sentre.
#    Sett random_state=42 og cluster_std=1.0.
# 2. Lagre matrisen i 'X' (shape: 300x2) og fasit-labels i 'y_true' (shape: 300,).
# 3. Print:
#       X.shape, y_true.shape
#       antall punkter per kluster (bruk np.unique(y_true, return_counts=True))
#
# Skriv koden under:


# ──── Test ────
import numpy as np
try:
    assert X.shape == (300, 2)
    assert y_true.shape == (300,)
    print(f"PASS: 300 punkter i 2D generert")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    u, c = np.unique(y_true, return_counts=True)
    assert len(u) == 3
    print(f"PASS: 3 klustre — størrelser: {c.tolist()}")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const BLOBS_S1_SOLUTION = `# ──── Trinn 1: Generer 3 klustre med make_blobs ────
from sklearn.datasets import make_blobs
import numpy as np

X, y_true = make_blobs(
    n_samples=300, centers=3, cluster_std=1.0, random_state=42
)

print(f"X.shape: {X.shape}")
print(f"y_true.shape: {y_true.shape}")
u, c = np.unique(y_true, return_counts=True)
print(f"Antall per kluster: {dict(zip(u.tolist(), c.tolist()))}")


# ──── Test ────
try:
    assert X.shape == (300, 2)
    assert y_true.shape == (300,)
    print(f"PASS: 300 punkter i 2D generert")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    u, c = np.unique(y_true, return_counts=True)
    assert len(u) == 3
    print(f"PASS: 3 klustre — størrelser: {c.tolist()}")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const BLOBS_S2_STARTER = `# ──── Trinn 2: Beskriv klustrene numerisk ────
from sklearn.datasets import make_blobs
import numpy as np

X, y_true = make_blobs(n_samples=300, centers=3, cluster_std=1.0, random_state=42)

# TODO (visualisering med matplotlib krever GUI-backend, så vi beskriver heller
# klustrene tallmessig):
# 1. For HVERT av de 3 klustrene (0, 1, 2):
#       - mask = y_true == k
#       - Beregn senter (mean av X[mask] langs akse 0)
#       - Beregn spread (std av X[mask] langs akse 0)
# 2. Lagre alle 3 sentre i 'sentre' (liste med 3 (x, y)-par) og print.
# 3. Print min/max for begge dimensjoner av X totalt.
#
# Skriv koden under:


# ──── Test ────
try:
    assert len(sentre) == 3
    print(f"PASS: 3 sentre beregnet — første: ({sentre[0][0]:.2f}, {sentre[0][1]:.2f})")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    # Sentrene skal være distinkte
    avstander = []
    for i in range(3):
        for j in range(i+1, 3):
            d = np.sqrt((sentre[i][0]-sentre[j][0])**2 + (sentre[i][1]-sentre[j][1])**2)
            avstander.append(d)
    assert min(avstander) > 1.0, f"sentre for nære: min avstand {min(avstander)}"
    print(f"PASS: sentre er distinkte — min avstand {min(avstander):.2f}")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const BLOBS_S2_SOLUTION = `# ──── Trinn 2: Beskriv klustrene numerisk ────
from sklearn.datasets import make_blobs
import numpy as np

X, y_true = make_blobs(n_samples=300, centers=3, cluster_std=1.0, random_state=42)

sentre = []
for k in range(3):
    mask = y_true == k
    senter = (float(X[mask, 0].mean()), float(X[mask, 1].mean()))
    spread_x = float(X[mask, 0].std())
    spread_y = float(X[mask, 1].std())
    sentre.append(senter)
    print(f"Kluster {k}: senter=({senter[0]:.2f}, {senter[1]:.2f}), "
          f"spread x={spread_x:.2f}, y={spread_y:.2f}")

print(f"\\nX-range: x={X[:,0].min():.2f}..{X[:,0].max():.2f}, "
      f"y={X[:,1].min():.2f}..{X[:,1].max():.2f}")


# ──── Test ────
try:
    assert len(sentre) == 3
    print(f"PASS: 3 sentre beregnet — første: ({sentre[0][0]:.2f}, {sentre[0][1]:.2f})")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    avstander = []
    for i in range(3):
        for j in range(i+1, 3):
            d = np.sqrt((sentre[i][0]-sentre[j][0])**2 + (sentre[i][1]-sentre[j][1])**2)
            avstander.append(d)
    assert min(avstander) > 1.0
    print(f"PASS: sentre er distinkte — min avstand {min(avstander):.2f}")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const BLOBS_S3_STARTER = `# ──── Trinn 3: Anvend k-Means ────
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans
import numpy as np

X, y_true = make_blobs(n_samples=300, centers=3, cluster_std=1.0, random_state=42)

# TODO:
# 1. Lag en KMeans med n_clusters=3, random_state=42, n_init=10.
# 2. Fit + predikér på X — lagre labels i 'y_kmeans'.
# 3. Lagre cluster_centers_ i 'sentre_kmeans'.
# 4. Print:
#       'KMeans inertia: ...' (modellens objektiv-verdi)
#       sentre_kmeans
#
# Note: labels fra k-means matcher ikke nødvendigvis y_true-labels
#       (k-means kjenner ikke til 'ekte' label-navn), men gruppene
#       skal være de samme.
#
# Skriv koden under:


# ──── Test ────
try:
    assert y_kmeans.shape == (300,)
    print(f"PASS: KMeans predikerte 300 labels")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    assert sentre_kmeans.shape == (3, 2)
    print(f"PASS: 3 sentre i 2D returnert av KMeans")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

# Sjekk at klustringen matcher fasiten i en eller annen permutasjon
from sklearn.metrics import adjusted_rand_score
try:
    ari = adjusted_rand_score(y_true, y_kmeans)
    assert ari > 0.9, f"adjusted rand index for lav: {ari}"
    print(f"PASS: adjusted rand index = {ari:.3f} (matchet godt med fasit)")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const BLOBS_S3_SOLUTION = `# ──── Trinn 3: Anvend k-Means ────
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans
from sklearn.metrics import adjusted_rand_score
import numpy as np

X, y_true = make_blobs(n_samples=300, centers=3, cluster_std=1.0, random_state=42)

kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
y_kmeans = kmeans.fit_predict(X)
sentre_kmeans = kmeans.cluster_centers_

print(f"KMeans inertia: {kmeans.inertia_:.2f}")
print(f"Sentre fra KMeans:\\n{sentre_kmeans}")
print(f"\\nAdjusted Rand Index vs fasit: {adjusted_rand_score(y_true, y_kmeans):.3f}")


# ──── Test ────
try:
    assert y_kmeans.shape == (300,)
    print(f"PASS: KMeans predikerte 300 labels")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    assert sentre_kmeans.shape == (3, 2)
    print(f"PASS: 3 sentre i 2D returnert av KMeans")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    ari = adjusted_rand_score(y_true, y_kmeans)
    assert ari > 0.9
    print(f"PASS: adjusted rand index = {ari:.3f} (matchet godt med fasit)")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const BLOBS_S4_STARTER = `# ──── Trinn 4: Elbow-metoden for å velge k ────
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans
import numpy as np

X, _ = make_blobs(n_samples=300, centers=3, cluster_std=1.0, random_state=42)

# TODO:
# 1. For k = 1, 2, 3, 4, 5, 6, 7, 8:
#       - Tren en KMeans(n_clusters=k, random_state=42, n_init=10) på X.
#       - Lagre kmeans.inertia_ i en liste 'inertier'.
# 2. Print inertien for hver k.
# 3. Diskuter (i print): hvor er "albuen"?
#
# Elbow-metoden: inertien (sum av avstander til nærmeste senter) faller
# raskt fra k=1 til ekte k, deretter sakte. Punktet hvor fall-raten avtar
# er "albuen" — vårt beste valg av k.
#
# Skriv koden under:


# ──── Test ────
try:
    assert len(inertier) == 8
    print(f"PASS: 8 inertier beregnet")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

# Sjekk at fallet er størst rundt k=3 (albuen for 3-kluster data)
try:
    fall = [inertier[i] - inertier[i+1] for i in range(len(inertier)-1)]
    # Fall fra k=1 til k=2 og fra k=2 til k=3 skal være de største
    assert fall[0] > fall[3], "forventet stort fall i begynnelsen"
    assert fall[1] > fall[4], "forventet stort fall ved albuen"
    print(f"PASS: tydelig elbow rundt k=3 (fall: {[round(f, 1) for f in fall]})")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const BLOBS_S4_SOLUTION = `# ──── Trinn 4: Elbow-metoden for å velge k ────
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans
import numpy as np

X, _ = make_blobs(n_samples=300, centers=3, cluster_std=1.0, random_state=42)

inertier = []
for k in range(1, 9):
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    km.fit(X)
    inertier.append(km.inertia_)
    print(f"k={k}: inertia = {km.inertia_:>8.2f}")

# Beregn fall mellom hvert steg
print("\\nFall i inertia per økning av k:")
for i in range(len(inertier) - 1):
    fall = inertier[i] - inertier[i+1]
    print(f"  k={i+1} → k={i+2}: -{fall:>7.2f}")

print("\\nAlbuen (der fall-raten flater ut) er rundt k=3 — som matcher fasiten.")


# ──── Test ────
try:
    assert len(inertier) == 8
    print(f"PASS: 8 inertier beregnet")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    fall = [inertier[i] - inertier[i+1] for i in range(len(inertier)-1)]
    assert fall[0] > fall[3]
    assert fall[1] > fall[4]
    print(f"PASS: tydelig elbow rundt k=3 (fall: {[round(f, 1) for f in fall]})")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const BLOBS_S5_STARTER = `# ──── Trinn 5: Sammenlign med DBSCAN ────
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import adjusted_rand_score
import numpy as np

X, y_true = make_blobs(n_samples=300, centers=3, cluster_std=1.0, random_state=42)

# TODO:
# 1. Tren KMeans(n_clusters=3, random_state=42, n_init=10) og lagre labels i 'y_kmeans'.
# 2. Tren DBSCAN(eps=0.8, min_samples=5) — fit_predict på X — lagre i 'y_dbscan'.
# 3. Beregn:
#       ari_kmeans  = adjusted_rand_score(y_true, y_kmeans)
#       ari_dbscan  = adjusted_rand_score(y_true, y_dbscan)
# 4. Tell hvor mange punkter DBSCAN markerte som "støy" (label -1) — lagre i 'antall_stoy'.
# 5. Print en sammenligningstabell:
#       Modell    ARI      Spesielt
#       KMeans    0.XX
#       DBSCAN    0.XX     Støy: N punkter
#
# Skriv koden under:


# ──── Test ────
try:
    assert ari_kmeans > 0.9
    print(f"PASS: KMeans ARI = {ari_kmeans:.3f}")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    assert ari_dbscan > 0.5
    print(f"PASS: DBSCAN ARI = {ari_dbscan:.3f}")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    assert antall_stoy >= 0
    print(f"PASS: DBSCAN identifiserte {antall_stoy} punkter som støy")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const BLOBS_S5_SOLUTION = `# ──── Trinn 5: Sammenlign med DBSCAN ────
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import adjusted_rand_score
import numpy as np

X, y_true = make_blobs(n_samples=300, centers=3, cluster_std=1.0, random_state=42)

y_kmeans = KMeans(n_clusters=3, random_state=42, n_init=10).fit_predict(X)
y_dbscan = DBSCAN(eps=0.8, min_samples=5).fit_predict(X)

ari_kmeans = adjusted_rand_score(y_true, y_kmeans)
ari_dbscan = adjusted_rand_score(y_true, y_dbscan)
antall_stoy = int(np.sum(y_dbscan == -1))

print(f"{'Modell':<8} {'ARI':>6}  Spesielt")
print(f"{'KMeans':<8} {ari_kmeans:>6.3f}")
print(f"{'DBSCAN':<8} {ari_dbscan:>6.3f}  Støy: {antall_stoy} punkter")


# ──── Test ────
try:
    assert ari_kmeans > 0.9
    print(f"PASS: KMeans ARI = {ari_kmeans:.3f}")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    assert ari_dbscan > 0.5
    print(f"PASS: DBSCAN ARI = {ari_dbscan:.3f}")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    assert antall_stoy >= 0
    print(f"PASS: DBSCAN identifiserte {antall_stoy} punkter som støy")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const BLOBS_S6_STARTER = `# ──── Trinn 6: Når feiler hver metode? ────
from sklearn.datasets import make_blobs, make_moons
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import adjusted_rand_score
import numpy as np

# Bytt nå til "moons" — to ikke-konvekse, halv-måne-formede klustre.
# KMeans antar konvekse klustre rundt sentroidene; DBSCAN gjør ikke.
X_moons, y_moons = make_moons(n_samples=300, noise=0.05, random_state=42)

# TODO:
# 1. Tren KMeans(n_clusters=2, random_state=42, n_init=10) på X_moons.
# 2. Tren DBSCAN(eps=0.25, min_samples=5) på X_moons.
# 3. Beregn ari_km_moons og ari_db_moons mot y_moons.
# 4. Print resultatene.
# 5. Lag en variabel 'refleksjon' (string, minst 50 tegn) som forklarer:
#       - Hvorfor KMeans feiler på moons (én setning)
#       - Når DBSCAN er å foretrekke (én setning)
#
# Skriv koden under:


# ──── Test ────
try:
    print(f"KMeans ARI (moons): {ari_km_moons:.3f}")
    print(f"DBSCAN ARI (moons): {ari_db_moons:.3f}")
    assert ari_db_moons > ari_km_moons, \\
        f"DBSCAN skal gjøre det bedre på moons. K={ari_km_moons}, D={ari_db_moons}"
    print(f"PASS: DBSCAN ({ari_db_moons:.3f}) > KMeans ({ari_km_moons:.3f}) på moons")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    assert isinstance(refleksjon, str)
    assert len(refleksjon) >= 50
    print(f"PASS: refleksjon på {len(refleksjon)} tegn skrevet")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

const BLOBS_S6_SOLUTION = `# ──── Trinn 6: Når feiler hver metode? ────
from sklearn.datasets import make_blobs, make_moons
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import adjusted_rand_score
import numpy as np

X_moons, y_moons = make_moons(n_samples=300, noise=0.05, random_state=42)

y_km = KMeans(n_clusters=2, random_state=42, n_init=10).fit_predict(X_moons)
y_db = DBSCAN(eps=0.25, min_samples=5).fit_predict(X_moons)

ari_km_moons = adjusted_rand_score(y_moons, y_km)
ari_db_moons = adjusted_rand_score(y_moons, y_db)

print(f"KMeans ARI (moons): {ari_km_moons:.3f}")
print(f"DBSCAN ARI (moons): {ari_db_moons:.3f}")

refleksjon = (
    "KMeans antar at klustre er sfæriske/konvekse rundt en sentroide, så "
    "to halv-måner blir delt på tvers av ekte gruppene. DBSCAN bruker "
    "tetthet i stedet — punkter som er nære hverandre tilhører samme kluster, "
    "uavhengig av geometrisk form. Bruk DBSCAN når klustre kan ha vilkårlig "
    "form, eller når støy må håndteres eksplisitt."
)
print("\\nRefleksjon:")
print(refleksjon)


# ──── Test ────
try:
    print(f"KMeans ARI (moons): {ari_km_moons:.3f}")
    print(f"DBSCAN ARI (moons): {ari_db_moons:.3f}")
    assert ari_db_moons > ari_km_moons
    print(f"PASS: DBSCAN ({ari_db_moons:.3f}) > KMeans ({ari_km_moons:.3f}) på moons")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")

try:
    assert isinstance(refleksjon, str)
    assert len(refleksjon) >= 50
    print(f"PASS: refleksjon på {len(refleksjon)} tegn skrevet")
except (NameError, AssertionError) as e:
    print(f"FAIL: {e}")
`;

// ===========================================================================
// EXPORTS
// ===========================================================================

export interface MlProject {
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  steps: ProjectStep[];
}

const IRIS_PROJECT: MlProject = {
  slug: "iris-klassifisering",
  title: "Iris-klassifisering",
  shortDescription:
    "8 trinn — last datasett, EDA, train/test, kNN, LogReg, GridSearchCV, confusion matrix, resultatsammendrag.",
  longDescription:
    "Klassisk supervised-learning-prosjekt: tren modeller for å predikere art av iris-blomst basert på 4 morfometriske trekk. Du går gjennom hele ML-flyten i nettleseren: utforskning, splitting, baseline-modeller, hyperparameter-tuning og evaluering. Sluttsteget er et resultat-sammendrag i mappe-oppgave-stil.",
  steps: [
    {
      id: "iris-1-last-data",
      concept: "Datasett",
      title: "1. Last Iris-datasettet",
      task: "Bruk sklearn.datasets.load_iris til å laste datasettet. Hent ut X (150x4) og y (150,) og inspiser klassenavn og feature-navn.",
      context:
        "Iris er det mest brukte ML-datasettet — 150 blomster, 4 features (sepal lengde/bredde, petal lengde/bredde), 3 klasser (setosa, versicolor, virginica). Perfekt fordi alt fungerer godt på det, men det skjuler også at virkelige datasett er mye rotete.",
      starter: IRIS_S1_STARTER,
      solution: IRIS_S1_SOLUTION,
      requires: COMMON_REQUIRES,
      hints: [
        "load_iris() returnerer en Bunch-objekt med attributter .data, .target, .target_names, .feature_names",
        "X.shape gir en tuple — bruk print(X.shape) eller print('X.shape:', X.shape)",
        "iris.target_names er en numpy-array — bruk list(iris.target_names) for ren utskrift",
      ],
    },
    {
      id: "iris-2-eda",
      concept: "EDA",
      title: "2. EDA — distribusjoner og klassebalanse",
      task: "Beregn statistikk (min, max, mean, std) for hver feature, og tell antall eksempler per klasse. Du skal forstå dataene FØR du tar modell-valg.",
      context:
        "EDA (Exploratory Data Analysis) er sensors første sjekk — en god rapport viser at studenten faktisk har KIKKET på dataene. På Iris er klassene perfekt balanserte (50/50/50), men det er sjelden tilfellet i virkeligheten — sjekk alltid.",
      starter: IRIS_S2_STARTER,
      solution: IRIS_S2_SOLUTION,
      requires: COMMON_REQUIRES,
      hints: [
        "np.min, np.max, np.mean, np.std fungerer på en kolonne X[:, i]",
        "np.unique(y, return_counts=True) returnerer to arrays: unike verdier + antall",
        "f-strings med format: f\"{x:.2f}\" gir 2 desimaler, f\"{x:>6}\" høyrejusterer i 6 tegn",
      ],
    },
    {
      id: "iris-3-split",
      concept: "Train/test split",
      title: "3. Train/test split med stratifisering",
      task: "Bruk train_test_split med test_size=0.2, random_state=42 og stratify=y. Bekreft at klassefordelingen er bevart i begge sett.",
      context:
        "Stratifisering (stratify=y) bevarer klassefordelingen i begge sett — kritisk for klassifikasjon. Uten det kan en tilfeldig split gi deg test-sett der én klasse mangler helt. random_state=42 gjør resultatene reproducerbare for sensor.",
      starter: IRIS_S3_STARTER,
      solution: IRIS_S3_SOLUTION,
      requires: COMMON_REQUIRES,
      hints: [
        "train_test_split returnerer 4 arrays i rekkefølge: X_train, X_test, y_train, y_test",
        "Med test_size=0.2 og 150 totalt → 120 train, 30 test",
        "stratify=y betyr at klassefordelingen 50/50/50 bevares i train (40/40/40) og test (10/10/10)",
      ],
    },
    {
      id: "iris-4-knn",
      concept: "kNN-baseline",
      title: "4. Tren k-NN og mål accuracy",
      task: "Skaler features med StandardScaler (fit kun på train!), tren KNeighborsClassifier(n_neighbors=5), og rapporter accuracy på test-settet.",
      context:
        "kNN er en god baseline — ingen «trening», bare lagring. Den er svært sensitiv for skala fordi avstander dominerer, så alltid StandardScaler først. Fit scaler kun på TRAIN — ellers lekker du test-data inn i modellen.",
      starter: IRIS_S4_STARTER,
      solution: IRIS_S4_SOLUTION,
      requires: COMMON_REQUIRES,
      hints: [
        "scaler.fit_transform(X_train) gjør begge i ett. På test: bare scaler.transform(X_test)",
        "knn.score(X, y) er det samme som accuracy_score(y, knn.predict(X))",
        "På Iris bør du få > 0.90 accuracy — alt under bør undersøkes",
      ],
    },
    {
      id: "iris-5-logreg",
      concept: "Sammenligne modeller",
      title: "5. Sammenlign med logistisk regresjon",
      task: "Tren LogisticRegression(max_iter=200) på samme split + scaling. Sammenlign med kNN.",
      context:
        "På små, godt-separerte datasett som Iris klarer mange algoritmer seg svært bra. Det viktige er å vise at du HAR SAMMENLIGNET — sensor liker prosess. max_iter=200 unngår warning om non-convergence (default 100 holder vanligvis ikke på Iris med scaling).",
      starter: IRIS_S5_STARTER,
      solution: IRIS_S5_SOLUTION,
      requires: COMMON_REQUIRES,
      hints: [
        "LogisticRegression er KLASSIFIKATOR (tross navnet) — den passer for kategoriske y",
        "Begge bør score 0.90-0.97 på Iris — differansen er liten",
        "Tenk på TOLKBARHET når du sammenligner: logreg gir koeffisienter, kNN gir bare prediksjoner",
      ],
    },
    {
      id: "iris-6-grid",
      concept: "Hyperparameter-søk",
      title: "6. GridSearchCV for hyperparameter-tuning",
      task: "Bygg en Pipeline med scaler + knn, og bruk GridSearchCV med cv=5 til å finne beste n_neighbors og weights.",
      context:
        "Pipeline + GridSearchCV er sensor-favoritt: én linje, ingen lekkasje. Pipeline holder scaling INNI cross-validation, så hver fold får sin egen scaler — null risk for å fit scaler på fold-test. Husk: param-navn bruker doble understrek, f.eks. 'knn__n_neighbors'.",
      starter: IRIS_S6_STARTER,
      solution: IRIS_S6_SOLUTION,
      requires: COMMON_REQUIRES,
      hints: [
        "Pipeline-steg får navn (f.eks. ('scaler', ...), ('knn', ...)) — bruk det i param_grid",
        "'knn__n_neighbors' (dobbel understrek) refererer til knn-stegets n_neighbors-parameter",
        "gs.best_params_ og gs.best_score_ etter fit gir resultatene",
        "n_jobs=1 i Pyodide (ingen multi-processing i nettleser)",
      ],
    },
    {
      id: "iris-7-confusion",
      concept: "Evaluering",
      title: "7. Confusion matrix + classification report",
      task: "Predikér på test-settet og generer confusion matrix + classification_report. Tell antall riktige fra diagonalen.",
      context:
        "Confusion matrix er sensor-standard: én figur som viser ALT om klassifikasjonsfeil. Diagonalen = riktige, off-diagonal = forveksling. classification_report gir precision/recall/f1 per klasse — viktigere enn samlet accuracy når klasser har ulik viktighet.",
      starter: IRIS_S7_STARTER,
      solution: IRIS_S7_SOLUTION,
      requires: COMMON_REQUIRES,
      hints: [
        "confusion_matrix(y_true, y_pred) returnerer en NxN-matrise hvor N = antall klasser",
        "Rader = faktisk klasse, kolonner = predikert klasse — diagonalen er riktige",
        "classification_report(target_names=...) gir lesbar tekstrapport",
        "cm.diagonal().sum() er antall riktige predikasjoner",
      ],
    },
    {
      id: "iris-8-rapport",
      concept: "Resultat-sammendrag",
      title: "8. Skriv et resultat-sammendrag",
      task: "Tren begge modellene, beregn test-accuracy + f1-macro + 5-fold CV-mean for hver, og lag et ferdig formatert tekst-sammendrag som kunne stått i en mappe-rapport.",
      context:
        "Dette er mappe-rapport-format i kortform. Sensor leter etter: tabell med flere metrikker, sammenligning, en eksplisitt konklusjon. Ikke bare tall — også ETT eksplisitt valg av modell og hvorfor.",
      starter: IRIS_S8_STARTER,
      solution: IRIS_S8_SOLUTION,
      requires: COMMON_REQUIRES,
      hints: [
        "f1_score med average='macro' = ulikvektet snitt over klasser (bra på balanserte data)",
        "cross_val_score returnerer en array — bruk .mean() og .std() for å rapportere",
        '"\\n".join(linjer) bygger flerlinjet tekst — lettere enn print() per linje',
        "Konklusjonen skal være SETNINGER, ikke punkter — sensor leter etter argumentasjon",
      ],
    },
  ],
};

const BLOBS_PROJECT: MlProject = {
  slug: "klustering-blobs",
  title: "Klustering med make_blobs",
  shortDescription:
    "6 trinn — generer 3-kluster data, beskriv numerisk, k-means, elbow-metoden, sammenlign med DBSCAN på halv-måner.",
  longDescription:
    "Unsupervised-learning-prosjekt: gruppér umerkede punkter. Du genererer kontrollerte datasett og prøver KMeans og DBSCAN. Sluttsteget bytter til halv-måne-data der KMeans bryter sammen og DBSCAN vinner — et konkret eksempel på når algoritme-valg betyr noe.",
  steps: [
    {
      id: "blobs-1-gen",
      concept: "Datasett",
      title: "1. Generer 3 klustre med make_blobs",
      task: "Bruk sklearn.datasets.make_blobs til å lage 300 punkter i 2D fordelt på 3 sentre. Sett random_state=42 og cluster_std=1.0.",
      context:
        "make_blobs er sklearn sin testdata-generator — gir deg kontroll over antall klustre, spredning, og fasit-labels (y_true). Perfekt for å lære klustering uten å bekymre seg om datakvalitet. I virkelig klustering har du ikke y_true — det er det som gjør evaluering vanskelig.",
      starter: BLOBS_S1_STARTER,
      solution: BLOBS_S1_SOLUTION,
      requires: COMMON_REQUIRES,
      hints: [
        "make_blobs returnerer (X, y) — selv om vi later som vi ikke vet y, har vi den til evaluering",
        "n_samples=300, centers=3 gir omtrent 100 per kluster",
        "cluster_std=1.0 er moderat overlapp — eksperimenter med 2.0 senere for vanskeligere problem",
      ],
    },
    {
      id: "blobs-2-eda",
      concept: "Numerisk EDA",
      title: "2. Beskriv klustrene numerisk",
      task: "For hvert av de 3 klustrene: beregn senter (mean) og spredning (std). Bekreft at de er distinkte ved å sjekke avstand mellom sentre.",
      context:
        "Visualisering ville vært best her, men i Pyodide uten GUI-backend må vi heller beskrive tallmessig. Pek: distinkte sentre = lette klustre å finne. Overlapp = utfordring.",
      starter: BLOBS_S2_STARTER,
      solution: BLOBS_S2_SOLUTION,
      requires: COMMON_REQUIRES,
      hints: [
        "Bool-mask: y_true == k gir indekser for kluster k",
        "X[mask, 0] henter ut x-koordinat for kluster k",
        "np.sqrt((x1-x2)**2 + (y1-y2)**2) er euklidisk avstand mellom to 2D-punkter",
      ],
    },
    {
      id: "blobs-3-kmeans",
      concept: "k-Means",
      title: "3. Anvend k-Means og evaluér med ARI",
      task: "Tren KMeans(n_clusters=3) på X, predikér klustre, og sjekk hvor godt det matcher fasiten med adjusted_rand_score.",
      context:
        "Adjusted Rand Index (ARI) sammenligner to klustrings-oppdelinger og er invariant for label-permutasjoner — klyster 0 i KMeans kan tilsvare klyster 2 i fasit, ARI bryr seg ikke. 1.0 = perfekt match, 0.0 = tilfeldig. n_init=10 trener 10 ganger med ulike random starts og beholder beste — KMeans er stochastic.",
      starter: BLOBS_S3_STARTER,
      solution: BLOBS_S3_SOLUTION,
      requires: COMMON_REQUIRES,
      hints: [
        "kmeans.fit_predict(X) er fit + predict i ett kall",
        "kmeans.inertia_ er sum av kvadrerte avstander til nærmeste senter — modellen minimerer dette",
        "kmeans.cluster_centers_ er en (n_clusters, n_features)-array",
        "adjusted_rand_score(y_true, y_pred) — 1.0 = perfekt, 0.0 = tilfeldig",
      ],
    },
    {
      id: "blobs-4-elbow",
      concept: "Velge k",
      title: "4. Elbow-metoden for å velge k",
      task: "Tren KMeans for k = 1...8 og plot inertia mot k. Albuen på kurven indikerer beste k.",
      context:
        "Elbow-metoden: i ekte klustering vet du ikke k. Du prøver flere verdier og ser etter et 'kne' i inertia-kurven der fall-raten avtar. På make_blobs(centers=3) skal albuen være tydelig ved k=3. På virkelige data er det ofte uklart — flere metoder finnes (silhouette, gap-statistikk).",
      starter: BLOBS_S4_STARTER,
      solution: BLOBS_S4_SOLUTION,
      requires: COMMON_REQUIRES,
      hints: [
        "for k in range(1, 9): — gir k=1, 2, 3, ..., 8",
        "Inertien faller monotont — det er FALL-RATEN som teller, ikke verdien",
        "Mellom k=1 og k=ekte-k er fallet stort. Etter ekte-k er fallet lite.",
        "Albuen ≈ punktet der differensen mellom påfølgende inertier flater ut",
      ],
    },
    {
      id: "blobs-5-dbscan",
      concept: "DBSCAN",
      title: "5. Sammenlign KMeans med DBSCAN",
      task: "Tren DBSCAN(eps=0.8, min_samples=5) og sammenlign med KMeans. Tell punkter merket som støy (label -1).",
      context:
        "DBSCAN er densitetsbasert — den ser etter områder med høy punkt-tetthet og merker isolerte punkter som STØY (label -1). Den krever ikke at du oppgir k, men er sensitiv for eps (max avstand mellom punkter i samme kluster) og min_samples. På pene blobs gjør den det relativt bra; støy-håndtering er bonusen.",
      starter: BLOBS_S5_STARTER,
      solution: BLOBS_S5_SOLUTION,
      requires: COMMON_REQUIRES,
      hints: [
        "DBSCAN trenger ikke n_clusters — den finner den ut selv",
        "labels == -1 markerer støy i DBSCAN",
        "np.sum(y_dbscan == -1) teller støy-punkter",
        "Eps og min_samples krever tuning — for stor eps slår klustre sammen, for liten lager mange klustre",
      ],
    },
    {
      id: "blobs-6-refleksjon",
      concept: "Algoritme-valg",
      title: "6. Når feiler hver metode?",
      task: "Bytt til make_moons (to halv-måne-formede klustre). KMeans skal feile, DBSCAN skal vinne. Forklar hvorfor i en refleksjon-streng.",
      context:
        "Dette er klassisk «KMeans vs DBSCAN»-illustrasjon. KMeans antar konvekse, sfæriske klustre rundt sentroider. Halv-måner er IKKE sfæriske — to halvmåner deler X-aksen, så KMeans deler datasettet på en horisontal linje i stedet for langs månens form. DBSCAN bryr seg ikke om form, bare om tetthet.",
      starter: BLOBS_S6_STARTER,
      solution: BLOBS_S6_SOLUTION,
      requires: COMMON_REQUIRES,
      hints: [
        "make_moons har innebygd støy-parameter (noise=0.05) — la den være lav for tydelig demo",
        "Eps på moons må være mindre enn på blobs (punktene er tettere) — 0.25 er rimelig",
        "Refleksjonen skal være FAGLIG — bruk uttrykk som «konveks form», «tetthetsbasert», «sfærisk antakelse»",
      ],
    },
  ],
};

export const ML_PROJECTS: MlProject[] = [IRIS_PROJECT, BLOBS_PROJECT];

export function getMlProject(slug: string): MlProject | undefined {
  return ML_PROJECTS.find((p) => p.slug === slug);
}
