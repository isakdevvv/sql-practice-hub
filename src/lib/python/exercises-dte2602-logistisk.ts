import type { PyExercise } from "./types";

// DTE-2602 logistisk regresjon — Pyodide-øvelser som speiler
// mini-kurset `dte2602-logistisk-regresjon`.

export const PY_DTE2602_LOGISTISK_EXERCISES: PyExercise[] = [
  {
    id: "dte2602-py-lr-iris-binary",
    topic: "DTE-2602 Modeller",
    title: "Logistisk regresjon: setosa vs ikke-setosa",
    description:
      "Tren en binær logistisk regresjon: er iris setosa eller ikke? Bruk scaler + pipeline. Mål test-accuracy.",
    requires: [],
    starter: `from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split

X, y = load_iris(return_X_y=True)
# Konverter til binær: 1 = setosa (klasse 0), 0 = ellers
y_bin = (y == 0).astype(int)

Xtr, Xte, ytr, yte = train_test_split(
    X, y_bin, test_size=0.3, stratify=y_bin, random_state=0
)

# TODO:
# 1. Lag en Pipeline med StandardScaler + LogisticRegression
# 2. Tren på Xtr, ytr
# 3. Print test-accuracy
# 4. Print koeffisientene
`,
    solution: `from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split

X, y = load_iris(return_X_y=True)
y_bin = (y == 0).astype(int)

Xtr, Xte, ytr, yte = train_test_split(
    X, y_bin, test_size=0.3, stratify=y_bin, random_state=0
)

pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('lr', LogisticRegression(C=1.0, max_iter=1000))
])
pipe.fit(Xtr, ytr)

acc = pipe.score(Xte, yte)
print(f"test accuracy: {acc:.3f}")

coef = pipe.named_steps['lr'].coef_[0]
feature_names = load_iris().feature_names
for name, c in zip(feature_names, coef):
    print(f"  {name:25s}: beta = {c:+.3f}")
`,
    hints: [
      "Setosa er lineært separerbar fra de to andre iris-klassene — du bør få 100 % test-accuracy.",
      "coef_[0] gir koeffisientene for klasse 1 (= setosa).",
      "Skala-skift før logreg er nesten alltid bedre — selv om sklearn's lbfgs er robust.",
    ],
  },
  {
    id: "dte2602-py-lr-odds-ratio",
    topic: "DTE-2602 Modeller",
    title: "Logistisk regresjon: tolk koeffisienter som odds-ratio",
    description:
      "Tren en logistisk regresjon på et lite, syntetisk datasett. Print koeffisientene som odds-ratios (e^β) og tolk dem.",
    requires: [],
    starter: `import numpy as np
from sklearn.linear_model import LogisticRegression

# Syntetisk data: P(diabetes) avhenger av alder og BMI
np.random.seed(42)
n = 500
alder = np.random.uniform(20, 80, n)
bmi = np.random.uniform(18, 40, n)
logit = -8 + 0.05*alder + 0.20*bmi
p = 1 / (1 + np.exp(-logit))
y = np.random.binomial(1, p)

X = np.column_stack([alder, bmi])

# TODO:
# 1. Tren LogisticRegression (uten skaling - vi vil se de raa koeffisientene)
# 2. Print intercept og koeffisienter
# 3. Print odds-ratio = exp(beta) for hver feature
# 4. Tolk: "hvert ekstra ar med alder ganger oddsen med ..."
`,
    solution: `import numpy as np
from sklearn.linear_model import LogisticRegression

np.random.seed(42)
n = 500
alder = np.random.uniform(20, 80, n)
bmi = np.random.uniform(18, 40, n)
logit = -8 + 0.05*alder + 0.20*bmi
p = 1 / (1 + np.exp(-logit))
y = np.random.binomial(1, p)

X = np.column_stack([alder, bmi])

# C=1e6 ⇒ nesten ingen regularisering — vi vil se de "sanne" koeffisientene
model = LogisticRegression(C=1e6, max_iter=5000)
model.fit(X, y)

beta = model.coef_[0]
b0 = model.intercept_[0]
print(f"intercept: {b0:.3f}")
print(f"beta_alder: {beta[0]:+.4f}  ⇒  OR = {np.exp(beta[0]):.4f}")
print(f"beta_bmi  : {beta[1]:+.4f}  ⇒  OR = {np.exp(beta[1]):.4f}")
print()
print(f"Tolkning: hvert ekstra år ganger oddsen med {np.exp(beta[0]):.4f}")
print(f"        : hver ekstra BMI-enhet ganger oddsen med {np.exp(beta[1]):.4f}")
print()
print("Sannheten i datagenereringen:")
print(f"  alder: 0.05 -> OR = {np.exp(0.05):.4f}")
print(f"  bmi  : 0.20 -> OR = {np.exp(0.20):.4f}")
`,
    hints: [
      "OR = exp(beta). For sjeldne y er OR ≈ relative risk.",
      "Med C=1e6 i sklearn slår du nesten av L2-reg — gir mest 'rene' koeffisienter.",
      "MLE kan divergere ved perfekt separasjon — vanligvis trygt å beholde litt L2.",
    ],
  },
  {
    id: "dte2602-py-lr-gd-fra-bunn",
    topic: "DTE-2602 Algoritmer fra bunn",
    title: "Logistisk regresjon fra bunn med gradient descent",
    description:
      "Implementer logistisk regresjon manuelt. Bruk gradient descent på log-loss. Sammenlign med sklearn.",
    requires: [],
    starter: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression

# Lag 2D-data, 2 klasser
X, y = make_classification(
    n_samples=200, n_features=2, n_redundant=0,
    n_informative=2, n_clusters_per_class=1,
    class_sep=1.5, random_state=42
)

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def log_loss(theta, X, y):
    # theta = [b, w1, w2]
    z = theta[0] + X @ theta[1:]
    p = sigmoid(z)
    eps = 1e-15
    return -np.mean(y * np.log(p + eps) + (1 - y) * np.log(1 - p + eps))

def grad(theta, X, y):
    z = theta[0] + X @ theta[1:]
    p = sigmoid(z)
    err = p - y
    g_b = err.mean()
    g_w = (X.T @ err) / len(y)
    return np.concatenate([[g_b], g_w])

# TODO:
# 1. Initialiser theta = zeros(3)
# 2. Loop 1000 ganger: theta -= lr * grad(theta, X, y)
# 3. Print final theta og log-loss
# 4. Sammenlign med sklearn LogisticRegression(C=1e9)
`,
    solution: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression

X, y = make_classification(
    n_samples=200, n_features=2, n_redundant=0,
    n_informative=2, n_clusters_per_class=1,
    class_sep=1.5, random_state=42
)

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def log_loss(theta, X, y):
    z = theta[0] + X @ theta[1:]
    p = sigmoid(z)
    eps = 1e-15
    return -np.mean(y * np.log(p + eps) + (1 - y) * np.log(1 - p + eps))

def grad(theta, X, y):
    z = theta[0] + X @ theta[1:]
    p = sigmoid(z)
    err = p - y
    g_b = err.mean()
    g_w = (X.T @ err) / len(y)
    return np.concatenate([[g_b], g_w])

# Gradient descent fra bunn
theta = np.zeros(3)
lr = 0.5
for epoch in range(2000):
    theta -= lr * grad(theta, X, y)
    if epoch % 200 == 0:
        print(f"epoch {epoch:4d}: loss = {log_loss(theta, X, y):.4f}")

print(f"\\nFra bunn:  b = {theta[0]:+.3f}, w1 = {theta[1]:+.3f}, w2 = {theta[2]:+.3f}")

# Sammenlign med sklearn (C stor → nesten ingen reg)
sk = LogisticRegression(C=1e9, max_iter=5000).fit(X, y)
print(f"sklearn:   b = {sk.intercept_[0]:+.3f}, w1 = {sk.coef_[0][0]:+.3f}, w2 = {sk.coef_[0][1]:+.3f}")

# Accuracy
p_pred = sigmoid(theta[0] + X @ theta[1:])
y_pred = (p_pred >= 0.5).astype(int)
print(f"\\nAccuracy: {(y_pred == y).mean():.3f}")
`,
    hints: [
      "Initialiser theta = 0 — log-loss er konveks, så start-punktet spiller liten rolle.",
      "lr = 0.5 funker for skalerte data. For ikke-skalerte data trenger du gjerne lr < 0.01.",
      "Numerisk stabilitet: legg til eps i log() for å unngå log(0).",
    ],
  },
  {
    id: "dte2602-py-lr-decision-boundary",
    topic: "DTE-2602 Modeller",
    title: "Logistisk regresjon: plot decision boundary",
    description:
      "Tren en logistisk regresjon på 2D data og plot decision boundary med matplotlib.",
    requires: [],
    starter: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression

X, y = make_classification(
    n_samples=200, n_features=2, n_redundant=0,
    n_informative=2, n_clusters_per_class=1,
    class_sep=1.2, random_state=0
)

# TODO:
# 1. Tren LogisticRegression(C=1.0)
# 2. Hent intercept (b) og coef (w1, w2)
# 3. Decision boundary: b + w1*x1 + w2*x2 = 0  ⇒  x2 = -(b + w1*x1)/w2
# 4. Plot punktene fargelagt etter y, og legg på linjen
`,
    solution: `import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression

X, y = make_classification(
    n_samples=200, n_features=2, n_redundant=0,
    n_informative=2, n_clusters_per_class=1,
    class_sep=1.2, random_state=0
)

model = LogisticRegression(C=1.0).fit(X, y)
b = model.intercept_[0]
w1, w2 = model.coef_[0]
print(f"b = {b:.3f}, w1 = {w1:.3f}, w2 = {w2:.3f}")

# x2 = -(b + w1*x1) / w2
xs = np.linspace(X[:, 0].min() - 1, X[:, 0].max() + 1, 100)
ys = -(b + w1 * xs) / w2

fig, ax = plt.subplots(figsize=(6, 4))
ax.scatter(X[y==0, 0], X[y==0, 1], c='C3', label='y=0', alpha=0.6)
ax.scatter(X[y==1, 0], X[y==1, 1], c='C0', label='y=1', alpha=0.6)
ax.plot(xs, ys, 'k--', linewidth=2, label='decision boundary')
ax.set_xlabel('x1')
ax.set_ylabel('x2')
ax.set_title(f'Logistisk regresjon: acc = {model.score(X, y):.3f}')
ax.legend()
ax.grid(alpha=0.3)
plt.show()
`,
    hints: [
      "Decision boundary: der hvor sigmoid = 0.5 ⇔ b + w·x = 0.",
      "Tegn med plt.plot(xs, ys, 'k--', linewidth=2).",
      "I 2D er boundary alltid en rett linje (logistisk regresjon er lineær klassifikator).",
    ],
  },
  {
    id: "dte2602-py-lr-class-weight",
    topic: "DTE-2602 Modeller",
    title: "Logistisk regresjon: ubalansert data og class_weight",
    description:
      "Lag et 5 %-positivt datasett. Sammenlign default vs class_weight='balanced'. Mål med precision, recall og F1.",
    requires: [],
    starter: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

# 5 % positive
X, y = make_classification(
    n_samples=2000, weights=[0.95, 0.05],
    n_features=10, random_state=0
)
print("Klassefordeling:", np.bincount(y))

Xtr, Xte, ytr, yte = train_test_split(
    X, y, test_size=0.3, stratify=y, random_state=0
)

# TODO:
# 1. Tren default LogisticRegression -> print confusion_matrix og classification_report
# 2. Tren med class_weight='balanced' -> samme metrikker
# 3. Sammenlign accuracy, precision, recall, F1 for positiv klasse
`,
    solution: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

X, y = make_classification(
    n_samples=2000, weights=[0.95, 0.05],
    n_features=10, random_state=0
)
print("Klassefordeling:", np.bincount(y))

Xtr, Xte, ytr, yte = train_test_split(
    X, y, test_size=0.3, stratify=y, random_state=0
)

for label, kwargs in [("default", {}), ("balanced", {"class_weight": "balanced"})]:
    print(f"\\n=== {label} ===")
    m = LogisticRegression(max_iter=2000, **kwargs).fit(Xtr, ytr)
    yp = m.predict(Xte)
    print("Confusion matrix [[TN, FP], [FN, TP]]:")
    print(confusion_matrix(yte, yp))
    print(classification_report(yte, yp, digits=3))
`,
    hints: [
      "Default ofte: høy accuracy men recall for positiv klasse er lav.",
      "class_weight='balanced' øker recall (færre FN) på bekostning av precision (flere FP).",
      "I fraud/medisin er recall ofte viktigere — bedre å ha falske alarmer enn å missse positive.",
    ],
  },
];
