import type { PyExercise } from "./types";

// DTE-2501-pensum: kjørbare ML-øvelser via Pyodide + scikit-learn.
// Topic-prefix "ML —" så de plukkes opp av topic-filteret. Hver oppgave er
// selvstendig; løsningen er kort og bruker sklearn der mulig.

export const PY_EXERCISES_DTE2501: PyExercise[] = [
  // --------------------------- k-NN ---------------------------
  {
    id: "py-dte2501-knn-iris",
    topic: "ML — k-NN",
    title: "k-NN på Iris — variér k og se accuracy",
    description:
      "Tren k-NN-klassifikator på Iris. Eksperimenter med k ∈ {1, 3, 5, 15} og rapporter test-accuracy. Husk å standardisere features før k-NN.",
    requires: ["scikit-learn", "numpy"],
    starter: `import numpy as np
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

X, y = load_iris(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0)

# TODO:
# 1. Standardiser features med StandardScaler.
# 2. For k i [1, 3, 5, 15]: tren KNeighborsClassifier(n_neighbors=k),
#    print "k=<k>  acc=<...>" til 3 desimaler.
`,
    solution: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

X, y = load_iris(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0)

scaler = StandardScaler().fit(X_tr)
X_tr_s = scaler.transform(X_tr)
X_te_s = scaler.transform(X_te)

for k in [1, 3, 5, 15]:
    clf = KNeighborsClassifier(n_neighbors=k)
    clf.fit(X_tr_s, y_tr)
    acc = clf.score(X_te_s, y_te)
    print(f"k={k:<3}  acc={acc:.3f}")
`,
    hints: [
      "Bruk StandardScaler().fit_transform(X_tr) — men test-data må bare 'transform'.",
      "KNeighborsClassifier(n_neighbors=k).fit(X, y).score(X_test, y_test).",
      "Veldig liten k overfitter; veldig stor k underfitter.",
    ],
  },
  {
    id: "py-dte2501-knn-regression",
    topic: "ML — k-NN",
    title: "k-NN-regresjon — predikere på 1D-data",
    description:
      "Bruk KNeighborsRegressor på et kunstig 1D-datasett (sinus + støy). Sammenlign uvektet og vektet (1/distanse) k-NN med k=5.",
    requires: ["scikit-learn", "numpy"],
    starter: `import numpy as np
from sklearn.neighbors import KNeighborsRegressor

# Generér: y = sin(x) + støy
rng = np.random.default_rng(0)
X = np.linspace(0, 10, 100).reshape(-1, 1)
y = np.sin(X).ravel() + 0.2 * rng.normal(size=100)

# TODO:
# 1. Tren KNeighborsRegressor med uniform vekting (k=5).
# 2. Tren ny med weights="distance" (k=5).
# 3. Predikér på X_test = np.linspace(0, 10, 5).reshape(-1, 1).
# 4. Print de to predikasjonene side-by-side med sin(X_test) som fasit.
`,
    solution: `import numpy as np
from sklearn.neighbors import KNeighborsRegressor

rng = np.random.default_rng(0)
X = np.linspace(0, 10, 100).reshape(-1, 1)
y = np.sin(X).ravel() + 0.2 * rng.normal(size=100)

knn_u = KNeighborsRegressor(n_neighbors=5).fit(X, y)
knn_w = KNeighborsRegressor(n_neighbors=5, weights="distance").fit(X, y)

X_te = np.linspace(0, 10, 5).reshape(-1, 1)
print("x     uniform   distance  sin(x)")
for xi, pu, pw in zip(X_te.ravel(), knn_u.predict(X_te), knn_w.predict(X_te)):
    print(f"{xi:.2f}  {pu:+.3f}    {pw:+.3f}   {np.sin(xi):+.3f}")
`,
  },

  // --------------------------- Beslutningstrær ---------------------------
  {
    id: "py-dte2501-tree-iris",
    topic: "ML — Trær",
    title: "DecisionTree med max_depth=3 — print struktur",
    description:
      "Bygg et lite beslutningstre på Iris med max_depth=3. Print tre-strukturen med sklearn.tree.export_text og feature_importances_.",
    requires: ["scikit-learn", "numpy"],
    starter: `from sklearn.datasets import load_iris
from sklearn.tree import DecisionTreeClassifier, export_text

iris = load_iris()
X, y = iris.data, iris.target

# TODO:
# 1. Tren DecisionTreeClassifier(max_depth=3, random_state=0).
# 2. Print accuracy på training.
# 3. Print tre-strukturen via export_text.
# 4. Print feature_importances_.
`,
    solution: `from sklearn.datasets import load_iris
from sklearn.tree import DecisionTreeClassifier, export_text

iris = load_iris()
X, y = iris.data, iris.target

clf = DecisionTreeClassifier(max_depth=3, random_state=0).fit(X, y)
print(f"training-accuracy: {clf.score(X, y):.3f}")
print()
print(export_text(clf, feature_names=list(iris.feature_names)))
print("feature_importances_:")
for name, imp in zip(iris.feature_names, clf.feature_importances_):
    print(f"  {name:<25} {imp:.3f}")
`,
    hints: [
      "export_text(clf, feature_names=…) gir tekst-tre med Gini-verdier.",
      "clf.feature_importances_ er en array i samme rekkefølge som kolonnene.",
    ],
  },
  {
    id: "py-dte2501-tree-gini",
    topic: "ML — Trær",
    title: "Beregn Gini for hånd",
    description:
      "Lag en funksjon gini(labels) som tar en liste etiketter og returnerer Gini-urenheten 1 − Σ pᵢ². Test på [A, A, A, B] (forventet 0.375).",
    starter: `def gini(labels):
    # TODO: returnér 1 − Σ pᵢ²
    pass

# Tester:
print(gini(["A","A","A","B"]))     # 0.375
print(gini(["A","A","A","A"]))     # 0.0
print(gini(["A","B","A","B"]))     # 0.5
`,
    solution: `from collections import Counter

def gini(labels):
    n = len(labels)
    if n == 0:
        return 0.0
    counts = Counter(labels)
    return 1.0 - sum((c/n)**2 for c in counts.values())

print(gini(["A","A","A","B"]))
print(gini(["A","A","A","A"]))
print(gini(["A","B","A","B"]))
`,
    hints: [
      "from collections import Counter er praktisk for å telle.",
      "Pass på division-by-zero hvis listen er tom.",
    ],
  },

  // --------------------------- Ensemble ---------------------------
  {
    id: "py-dte2501-rf-gbm",
    topic: "ML — Ensemble",
    title: "Random Forest vs Gradient Boosting på samme data",
    description:
      "Sammenlign RandomForestClassifier og GradientBoostingClassifier på make_classification. Rapporter test-accuracy og treningstid.",
    requires: ["scikit-learn", "numpy"],
    starter: `import time
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

X, y = make_classification(n_samples=1000, n_features=20, n_informative=10,
                           random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0)

# TODO:
# 1. Tren RF (n_estimators=100), tidsmål.
# 2. Tren GBM (n_estimators=100), tidsmål.
# 3. Print accuracy og tid for begge.
`,
    solution: `import time
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

X, y = make_classification(n_samples=1000, n_features=20, n_informative=10,
                           random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0)

for name, model in [("RF", RandomForestClassifier(n_estimators=100, random_state=0)),
                    ("GBM", GradientBoostingClassifier(n_estimators=100, random_state=0))]:
    t0 = time.time()
    model.fit(X_tr, y_tr)
    dt = time.time() - t0
    acc = model.score(X_te, y_te)
    print(f"{name}  acc={acc:.3f}  trening={dt:.2f}s")
`,
  },
  {
    id: "py-dte2501-adaboost-weights",
    topic: "ML — Ensemble",
    title: "AdaBoost — beregn α for én iter",
    description:
      "Implementer AdaBoost-formelen for én iterasjon: gitt vektet feilrate ε, beregn modell-vekten α = ½ · ln((1−ε)/ε).",
    starter: `import math

def alpha(epsilon):
    # TODO: returnér 0.5 · ln((1 − ε) / ε)
    pass

for eps in [0.01, 0.1, 0.3, 0.5, 0.7]:
    print(f"ε={eps:.2f}  α={alpha(eps):+.3f}")
# ε=0.5 skal gi α=0 (modellen er like god som flipping coin).
`,
    solution: `import math

def alpha(epsilon):
    if epsilon <= 0:
        return float("inf")
    if epsilon >= 1:
        return float("-inf")
    return 0.5 * math.log((1 - epsilon) / epsilon)

for eps in [0.01, 0.1, 0.3, 0.5, 0.7]:
    print(f"ε={eps:.2f}  α={alpha(eps):+.3f}")
`,
  },

  // --------------------------- k-Means ---------------------------
  {
    id: "py-dte2501-kmeans-blobs",
    topic: "ML — k-Means",
    title: "k-Means med albuemetode",
    description:
      "Generér make_blobs med 4 klustre, kjør k-Means for k ∈ 1..8 og print inertia (J). Bruk det til å finne 'albuen'.",
    requires: ["scikit-learn", "numpy"],
    starter: `from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans

X, _ = make_blobs(n_samples=300, centers=4, cluster_std=1.0, random_state=0)

# TODO:
# For k i 1..8 print inertia. Hvor er 'albuen'?
`,
    solution: `from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans

X, _ = make_blobs(n_samples=300, centers=4, cluster_std=1.0, random_state=0)

print("k  inertia")
for k in range(1, 9):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X)
    print(f"{k}  {km.inertia_:.1f}")
# Forventet: stor nedgang fra k=1 til k=4, så flater ut.
`,
  },
  {
    id: "py-dte2501-kmeans-manual",
    topic: "ML — k-Means",
    title: "Implementer én k-Means iterasjon",
    description:
      "Skriv assign-step og update-step manuelt på liten 1D-data og print sentrene før og etter.",
    requires: ["numpy"],
    starter: `import numpy as np

X = np.array([1.0, 2.0, 10.0, 11.0, 12.0])
centers = np.array([1.0, 12.0])

# TODO:
# 1. assign: for hvert punkt, finn nærmeste senter (returnér labels-array).
# 2. update: nye centers = snittet av punkter i hvert cluster.
# 3. Print de nye sentrene.
`,
    solution: `import numpy as np

X = np.array([1.0, 2.0, 10.0, 11.0, 12.0])
centers = np.array([1.0, 12.0])

# assign
labels = np.array([np.argmin(np.abs(centers - xi)) for xi in X])

# update
new_centers = np.array([X[labels == k].mean() for k in range(len(centers))])

print(f"labels:      {labels}")
print(f"old centers: {centers}")
print(f"new centers: {new_centers}")
# new_centers skal være [1.5, 11.0]
`,
  },

  // --------------------------- GMM ---------------------------
  {
    id: "py-dte2501-gmm-2d",
    topic: "ML — GMM",
    title: "GaussianMixture på 2D-data",
    description:
      "Tren GaussianMixture med n_components=3 på make_blobs. Print mikstur-vekter π, snitt μ og BIC-score.",
    requires: ["scikit-learn", "numpy"],
    starter: `from sklearn.datasets import make_blobs
from sklearn.mixture import GaussianMixture

X, _ = make_blobs(n_samples=400, centers=3, cluster_std=[1.0, 2.0, 0.5],
                  random_state=0)

# TODO:
# 1. Tren GaussianMixture(n_components=3, covariance_type="full").
# 2. Print weights_, means_, og bic(X).
`,
    solution: `from sklearn.datasets import make_blobs
from sklearn.mixture import GaussianMixture

X, _ = make_blobs(n_samples=400, centers=3, cluster_std=[1.0, 2.0, 0.5],
                  random_state=0)

gmm = GaussianMixture(n_components=3, covariance_type="full",
                      random_state=0).fit(X)

print("weights_ (π):")
print(gmm.weights_)
print("\\nmeans_ (μ):")
print(gmm.means_)
print(f"\\nBIC: {gmm.bic(X):.1f}")
`,
  },
  {
    id: "py-dte2501-gmm-bic-search",
    topic: "ML — GMM",
    title: "Velg antall komponenter via BIC",
    description:
      "Kjør GaussianMixture for K ∈ 1..6, print BIC. K med lavest BIC vinner.",
    requires: ["scikit-learn", "numpy"],
    starter: `from sklearn.datasets import make_blobs
from sklearn.mixture import GaussianMixture

X, _ = make_blobs(n_samples=400, centers=3, random_state=0)

# TODO: for K i 1..6, print BIC. Hvilken K vinner?
`,
    solution: `from sklearn.datasets import make_blobs
from sklearn.mixture import GaussianMixture

X, _ = make_blobs(n_samples=400, centers=3, random_state=0)

best_k, best_bic = None, float("inf")
for k in range(1, 7):
    gmm = GaussianMixture(n_components=k, random_state=0).fit(X)
    bic = gmm.bic(X)
    print(f"K={k}  BIC={bic:.1f}")
    if bic < best_bic:
        best_k, best_bic = k, bic

print(f"\\nBest K = {best_k}")
`,
  },

  // --------------------------- PCA ---------------------------
  {
    id: "py-dte2501-pca-iris",
    topic: "ML — PCA",
    title: "PCA på Iris til 2D",
    description:
      "Projisér Iris (4D) til 2D med PCA. Print explained_variance_ratio_ for de to første komponentene og kumulativ andel.",
    requires: ["scikit-learn", "numpy"],
    starter: `from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

X, y = load_iris(return_X_y=True)
X_std = StandardScaler().fit_transform(X)

# TODO:
# 1. Tren PCA(n_components=2) på X_std.
# 2. Print explained_variance_ratio_ og kumulativ sum.
`,
    solution: `from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

X, y = load_iris(return_X_y=True)
X_std = StandardScaler().fit_transform(X)

pca = PCA(n_components=2).fit(X_std)
print("explained_variance_ratio_:")
print(pca.explained_variance_ratio_)
print(f"kumulert(2) = {pca.explained_variance_ratio_.sum():.3f}")
# Forventet: ca [0.73, 0.23] → 0.96 — vi mister bare 4% varians.
`,
  },
  {
    id: "py-dte2501-pca-manual",
    topic: "ML — PCA",
    title: "PCA via numpy.linalg.eigh",
    description:
      "Implementer PCA manuelt: mean-centre, beregn kovariansmatrise, finn egenvektor/-verdi, projisér.",
    requires: ["numpy"],
    starter: `import numpy as np

# 5 punkter i 2D
X = np.array([[2.5, 2.4],
              [0.5, 0.7],
              [2.2, 2.9],
              [1.9, 2.2],
              [3.1, 3.0]])

# TODO:
# 1. Mean-centre X.
# 2. Beregn Σ = (X̃ᵀ X̃) / (N-1).
# 3. eigvals, eigvecs = np.linalg.eigh(Σ)
# 4. Sortér avtagende, print egenverdiene.
# 5. Projisér X̃ på første egenvektor (1D).
`,
    solution: `import numpy as np

X = np.array([[2.5, 2.4],
              [0.5, 0.7],
              [2.2, 2.9],
              [1.9, 2.2],
              [3.1, 3.0]])

X_tilde = X - X.mean(axis=0)
Sigma = (X_tilde.T @ X_tilde) / (len(X) - 1)
vals, vecs = np.linalg.eigh(Sigma)
order = vals.argsort()[::-1]
vals, vecs = vals[order], vecs[:, order]

print("Σ:")
print(Sigma)
print(f"\\negenverdier: {vals}")
print(f"egenvektor v₁: {vecs[:, 0]}")

Z = X_tilde @ vecs[:, [0]]
print(f"\\n1D-projeksjon Z:\\n{Z.ravel()}")
`,
  },

  // --------------------------- NLP / TF-IDF ---------------------------
  {
    id: "py-dte2501-tfidf-cosine",
    topic: "ML — NLP",
    title: "TF-IDF + cosine similarity",
    description:
      "Vektoriser 4 korte dokumenter med TfidfVectorizer, beregn parvis cosine-similarity og print matrisen.",
    requires: ["scikit-learn"],
    starter: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

docs = [
    "I love dogs and cats",
    "Cats are wonderful pets",
    "Dogs are loyal companions",
    "Python is a programming language",
]

# TODO:
# 1. fit_transform docs med TfidfVectorizer.
# 2. cosine_similarity(X) — print 4x4-matrise.
`,
    solution: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

docs = [
    "I love dogs and cats",
    "Cats are wonderful pets",
    "Dogs are loyal companions",
    "Python is a programming language",
]

vec = TfidfVectorizer().fit(docs)
X = vec.transform(docs)

sim = cosine_similarity(X)
print("Vokabular:", vec.get_feature_names_out())
print("\\nCosine-matrise:")
for row in sim:
    print(" ".join(f"{v:.3f}" for v in row))
# Forventet: doc 0 og doc 1/2 ligner litt; doc 3 er nesten ortogonal til de andre.
`,
  },
  {
    id: "py-dte2501-tfidf-search",
    topic: "ML — NLP",
    title: "Mini-søkemotor med TF-IDF",
    description:
      "Gitt en query, rangér 4 dokumenter etter cosine-similarity til queryen og print top-2.",
    requires: ["scikit-learn"],
    starter: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

docs = [
    "Machine learning is fun",
    "Deep learning uses neural networks",
    "Python is great for data science",
    "I like coffee in the morning",
]
query = "neural networks and learning"

# TODO:
# 1. Vektoriser docs + query.
# 2. Beregn cosine_similarity(query, docs).
# 3. Print top-2 dokumenter (med score).
`,
    solution: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

docs = [
    "Machine learning is fun",
    "Deep learning uses neural networks",
    "Python is great for data science",
    "I like coffee in the morning",
]
query = "neural networks and learning"

vec = TfidfVectorizer().fit(docs)
X_docs = vec.transform(docs)
X_q = vec.transform([query])

scores = cosine_similarity(X_q, X_docs).ravel()
order = scores.argsort()[::-1]

print("Top-2 treff:")
for idx in order[:2]:
    print(f"  score={scores[idx]:.3f}   {docs[idx]}")
`,
  },

  // --------------------------- GA ---------------------------
  {
    id: "py-dte2501-ga-onemax",
    topic: "ML — GA",
    title: "Genetic Algorithm for OneMax",
    description:
      "Implementer enkel GA: populasjon av bit-strenger, fitness = antall 1'ere. Studenten fyller inn crossover() og mutate().",
    requires: ["numpy"],
    starter: `import numpy as np
rng = np.random.default_rng(0)

L = 20         # kromosomlengde
N = 30         # populasjonsstørrelse
GENS = 50

def fitness(chrom):
    return int(chrom.sum())

def crossover(a, b):
    # TODO: one-point crossover; returnér to barn
    pass

def mutate(chrom, p=0.05):
    # TODO: flip hver bit med sannsynlighet p, returnér mutert kromosom
    pass

# Init
pop = rng.integers(0, 2, size=(N, L))
fits = np.array([fitness(c) for c in pop])

for gen in range(GENS):
    # tournament selection (k=3)
    parents = []
    for _ in range(N):
        idx = rng.choice(N, size=3, replace=False)
        parents.append(pop[idx[np.argmax(fits[idx])]])
    parents = np.array(parents)

    # crossover + mutasjon
    new_pop = []
    for i in range(0, N, 2):
        c1, c2 = crossover(parents[i], parents[i+1])
        new_pop.append(mutate(c1))
        new_pop.append(mutate(c2))
    pop = np.array(new_pop)
    fits = np.array([fitness(c) for c in pop])
    if gen % 10 == 0:
        print(f"gen={gen:3d}  best_fitness={fits.max():2d} / {L}")

print(f"\\nFinal best: {pop[fits.argmax()]}")
`,
    solution: `import numpy as np
rng = np.random.default_rng(0)

L = 20
N = 30
GENS = 50

def fitness(chrom):
    return int(chrom.sum())

def crossover(a, b):
    cut = rng.integers(1, len(a))
    return (np.concatenate([a[:cut], b[cut:]]),
            np.concatenate([b[:cut], a[cut:]]))

def mutate(chrom, p=0.05):
    mask = rng.random(len(chrom)) < p
    return np.where(mask, 1 - chrom, chrom)

pop = rng.integers(0, 2, size=(N, L))
fits = np.array([fitness(c) for c in pop])

for gen in range(GENS):
    parents = []
    for _ in range(N):
        idx = rng.choice(N, size=3, replace=False)
        parents.append(pop[idx[np.argmax(fits[idx])]])
    parents = np.array(parents)
    new_pop = []
    for i in range(0, N, 2):
        c1, c2 = crossover(parents[i], parents[i+1])
        new_pop.append(mutate(c1))
        new_pop.append(mutate(c2))
    pop = np.array(new_pop)
    fits = np.array([fitness(c) for c in pop])
    if gen % 10 == 0:
        print(f"gen={gen:3d}  best_fitness={fits.max():2d} / {L}")

print(f"\\nFinal best: {pop[fits.argmax()]}")
`,
  },

  // --------------------------- MDP / RL ---------------------------
  {
    id: "py-dte2501-vi-grid",
    topic: "ML — RL",
    title: "Value Iteration på lite grid",
    description:
      "Implementer Value Iteration på et 1D grid med 5 tilstander. Slutt på s4 gir +1, ellers reward = 0. γ=0.9. Print V etter konvergens.",
    requires: ["numpy"],
    starter: `import numpy as np

# 5 tilstander: 0..4. Actions: 'L' (venstre, +/-1), 'R' (høyre, +1)
# Reward: +1 ved overgang TIL state 4 (terminal).
# γ = 0.9
N = 5
gamma = 0.9
V = np.zeros(N)

def step(s, a):
    """Returnér (s', r). Vegger: bouncer tilbake."""
    if s == 4:
        return s, 0      # terminal
    if a == 'L':
        s_new = max(0, s - 1)
    else:
        s_new = min(N - 1, s + 1)
    r = 1.0 if s_new == 4 else 0.0
    return s_new, r

# TODO:
# Value Iteration: Repeter inntil ‖V_new − V‖∞ < 1e-6:
#    for hver s ∈ [0..N-1]:
#        V_new[s] = max over a ∈ {'L', 'R'}: r + γ V[s']
# Print V og argmax-policy.
`,
    solution: `import numpy as np
N = 5
gamma = 0.9
V = np.zeros(N)

def step(s, a):
    if s == 4:
        return s, 0
    if a == 'L':
        s_new = max(0, s - 1)
    else:
        s_new = min(N - 1, s + 1)
    r = 1.0 if s_new == 4 else 0.0
    return s_new, r

for it in range(1000):
    V_new = np.zeros(N)
    for s in range(N):
        if s == 4:
            V_new[s] = 0
            continue
        qs = []
        for a in ('L', 'R'):
            s2, r = step(s, a)
            qs.append(r + gamma * V[s2])
        V_new[s] = max(qs)
    if np.max(np.abs(V_new - V)) < 1e-6:
        print(f"konvergert etter {it+1} iter")
        break
    V = V_new

print(f"V = {V.round(3)}")
policy = []
for s in range(N):
    qs = {a: step(s, a)[1] + gamma * V[step(s, a)[0]] for a in ('L', 'R')}
    policy.append(max(qs, key=qs.get))
print(f"policy = {policy}")
`,
  },
  {
    id: "py-dte2501-qlearn",
    topic: "ML — RL",
    title: "Q-learning på lite grid",
    description:
      "Lær optimal Q-tabell på 1D-grid med 5 stater via ε-greedy Q-learning over 500 episoder.",
    requires: ["numpy"],
    starter: `import numpy as np
rng = np.random.default_rng(0)

N = 5
actions = ['L', 'R']
gamma = 0.9
alpha = 0.5
epsilon = 0.2
episodes = 500

Q = np.zeros((N, len(actions)))

def step(s, a_idx):
    a = actions[a_idx]
    if s == 4:
        return s, 0, True
    s_new = max(0, s - 1) if a == 'L' else min(N - 1, s + 1)
    r = 1.0 if s_new == 4 else 0.0
    return s_new, r, (s_new == 4)

# TODO:
# For hver episode:
#   start s = 0
#   while not done:
#      ε-greedy: hvis rand < ε → tilfeldig a, ellers argmax_a Q(s, a)
#      utfør step → (s', r, done)
#      Q[s, a] += α · (r + γ · max_a' Q[s', a'] − Q[s, a])
#      s = s'
# Print sluttet Q-tabell.
`,
    solution: `import numpy as np
rng = np.random.default_rng(0)

N = 5
actions = ['L', 'R']
gamma, alpha, epsilon, episodes = 0.9, 0.5, 0.2, 500

Q = np.zeros((N, len(actions)))

def step(s, a_idx):
    a = actions[a_idx]
    if s == 4:
        return s, 0, True
    s_new = max(0, s - 1) if a == 'L' else min(N - 1, s + 1)
    r = 1.0 if s_new == 4 else 0.0
    return s_new, r, (s_new == 4)

for ep in range(episodes):
    s = 0
    done = False
    while not done:
        if rng.random() < epsilon:
            a = rng.integers(2)
        else:
            a = int(np.argmax(Q[s]))
        s2, r, done = step(s, a)
        target = r + gamma * (0 if done else Q[s2].max())
        Q[s, a] += alpha * (target - Q[s, a])
        s = s2

print("Q-tabell etter trening:")
print("state    L       R")
for s in range(N):
    print(f"  {s}   {Q[s,0]:+.3f}  {Q[s,1]:+.3f}")
print("\\nDerivert policy:", ['L' if Q[s,0] > Q[s,1] else 'R' for s in range(N)])
`,
  },

  // --------------------------- TSP / DP ---------------------------
  {
    id: "py-dte2501-tsp-bruteforce",
    topic: "ML — DP",
    title: "TSP brute force på 5 byer",
    description:
      "Bruk itertools.permutations til å løse TSP eksakt på 5 byer. Print beste tur og lengde.",
    requires: ["numpy"],
    starter: `import itertools
import numpy as np

# 5 byer, avstandsmatrise (symmetrisk)
dist = np.array([
    [0, 10, 15, 20, 25],
    [10, 0, 35, 25, 30],
    [15, 35, 0, 30, 20],
    [20, 25, 30, 0, 15],
    [25, 30, 20, 15, 0],
])
n = len(dist)

# TODO:
# For hver permutasjon av (1..n-1): beregn tour-lengde (start og slutt i 0).
# Print den korteste.
`,
    solution: `import itertools
import numpy as np

dist = np.array([
    [0, 10, 15, 20, 25],
    [10, 0, 35, 25, 30],
    [15, 35, 0, 30, 20],
    [20, 25, 30, 0, 15],
    [25, 30, 20, 15, 0],
])
n = len(dist)

best, best_len = None, float("inf")
for perm in itertools.permutations(range(1, n)):
    tour = (0,) + perm + (0,)
    length = sum(dist[tour[i]][tour[i+1]] for i in range(n))
    if length < best_len:
        best_len, best = length, tour

print(f"Beste tur: {best}")
print(f"Lengde:    {best_len}")
`,
  },
  {
    id: "py-dte2501-tsp-heldkarp",
    topic: "ML — DP",
    title: "Held-Karp DP for TSP",
    description:
      "Implementer Held-Karp på samme 5x5 avstandsmatrise — sammenlign med brute force.",
    requires: ["numpy"],
    starter: `import math

dist = [
    [0, 10, 15, 20, 25],
    [10, 0, 35, 25, 30],
    [15, 35, 0, 30, 20],
    [20, 25, 30, 0, 15],
    [25, 30, 20, 15, 0],
]
n = len(dist)
INF = math.inf

# TODO:
# Held-Karp:
#   dp[mask][j] = min vei fra by 0, gjennom byer i mask, endende i j
#   dp[1][0] = 0  (bare 0, ender i 0)
#   for mask in 1..2^n:
#     for j in 0..n-1:
#       hvis dp[mask][j] != INF:
#         for k ikke i mask:
#           new_mask = mask | (1 << k)
#           dp[new_mask][k] = min(dp[new_mask][k], dp[mask][j] + dist[j][k])
#   svar = min over j>0: dp[full][j] + dist[j][0]
`,
    solution: `import math

dist = [
    [0, 10, 15, 20, 25],
    [10, 0, 35, 25, 30],
    [15, 35, 0, 30, 20],
    [20, 25, 30, 0, 15],
    [25, 30, 20, 15, 0],
]
n = len(dist)
INF = math.inf

dp = [[INF] * n for _ in range(1 << n)]
dp[1][0] = 0

for mask in range(1 << n):
    if not (mask & 1):
        continue
    for j in range(n):
        if not (mask & (1 << j)):
            continue
        if dp[mask][j] == INF:
            continue
        for k in range(n):
            if mask & (1 << k):
                continue
            new_mask = mask | (1 << k)
            cand = dp[mask][j] + dist[j][k]
            if cand < dp[new_mask][k]:
                dp[new_mask][k] = cand

full = (1 << n) - 1
ans = min(dp[full][j] + dist[j][0] for j in range(1, n))
print(f"Held-Karp svar: {ans}")
# Skal være likt brute force.
`,
  },

  // --------------------------- Knapsack DP ---------------------------
  {
    id: "py-dte2501-knapsack-dp",
    topic: "ML — DP",
    title: "0/1 Knapsack med tabulering",
    description:
      "Klassisk DP: gitt items og kapasitet, returnér maks total verdi. Fyll inn dp[i][w]-tabellen.",
    starter: `def knapsack(items, capacity):
    """items = list of (value, weight). capacity = int."""
    n = len(items)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    # TODO:
    # for i in 1..n:
    #   v_i, w_i = items[i-1]
    #   for w in 0..capacity:
    #     if w_i > w:  dp[i][w] = dp[i-1][w]
    #     else:        dp[i][w] = max(dp[i-1][w], dp[i-1][w-w_i] + v_i)
    return dp[n][capacity]

# Tester:
print(knapsack([(60, 10), (100, 20), (120, 30)], 50))   # forventet 220
print(knapsack([(1, 1), (2, 2), (3, 3), (4, 4)], 5))     # forventet 6
`,
    solution: `def knapsack(items, capacity):
    n = len(items)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        v_i, w_i = items[i-1]
        for w in range(capacity + 1):
            if w_i > w:
                dp[i][w] = dp[i-1][w]
            else:
                dp[i][w] = max(dp[i-1][w], dp[i-1][w-w_i] + v_i)
    return dp[n][capacity]

print(knapsack([(60, 10), (100, 20), (120, 30)], 50))
print(knapsack([(1, 1), (2, 2), (3, 3), (4, 4)], 5))
`,
  },

  // --------------------------- Minimax (AIMA kap. 6) ---------------------------
  {
    id: "py-dte2501-minimax-ttt",
    topic: "ML — Minimax",
    title: "Minimax på tic-tac-toe",
    description:
      "Implementér minimax for tic-tac-toe. Returnér +1 hvis X vinner, -1 hvis O vinner, 0 ved uavgjort. Test at startposisjonen gir 0 (optimal spill = uavgjort).",
    requires: [],
    starter: `# Brett som 9-tuppel: ' ' = tomt, 'X' eller 'O'. X starter (MAX).

def winner(b):
    lines = [(0,1,2),(3,4,5),(6,7,8),(0,3,6),(1,4,7),(2,5,8),(0,4,8),(2,4,6)]
    for a,c,d in lines:
        if b[a] != ' ' and b[a] == b[c] == b[d]:
            return b[a]
    return None

def to_move(b):
    # X starter, så hvis like mange X og O er X på tur.
    return 'X' if b.count('X') == b.count('O') else 'O'

def minimax(b):
    """Returnér optimal utility for X (MAX) fra stilling b."""
    w = winner(b)
    if w == 'X': return 1
    if w == 'O': return -1
    if ' ' not in b: return 0
    # TODO:
    # 1. Bestem hvem som er på tur via to_move(b).
    # 2. For hver lovlig flytt (' ' i b): generer ny stilling og rekursér.
    # 3. Hvis X på tur: returner max. Hvis O: returner min.
    pass

# Tester:
print("startposisjon:", minimax(tuple(' '*9)))  # forventet 0 (uavgjort med optimal spill)
print("X kan vinne:", minimax(('X','X',' ', 'O','O',' ', ' ',' ',' ')))  # forventet 1
`,
    solution: `def winner(b):
    lines = [(0,1,2),(3,4,5),(6,7,8),(0,3,6),(1,4,7),(2,5,8),(0,4,8),(2,4,6)]
    for a,c,d in lines:
        if b[a] != ' ' and b[a] == b[c] == b[d]:
            return b[a]
    return None

def to_move(b):
    return 'X' if b.count('X') == b.count('O') else 'O'

def minimax(b):
    w = winner(b)
    if w == 'X': return 1
    if w == 'O': return -1
    if ' ' not in b: return 0
    player = to_move(b)
    moves = []
    for i, c in enumerate(b):
        if c == ' ':
            new = b[:i] + (player,) + b[i+1:]
            moves.append(minimax(new))
    return max(moves) if player == 'X' else min(moves)

print("startposisjon:", minimax(tuple(' '*9)))
print("X kan vinne:", minimax(('X','X',' ', 'O','O',' ', ' ',' ',' ')))
`,
    hints: [
      "Brett er en tuple med 9 strenger — tuples er hashbare (kan caches).",
      "to_move bytter mellom 'X' og 'O' basert på antall plasserte brikker.",
      "Rekursjons-base: terminal (winner finnes eller fullt brett).",
      "Bonus: legg på `from functools import lru_cache` og dekoré minimax for fart.",
    ],
  },
  {
    id: "py-dte2501-alphabeta",
    topic: "ML — Minimax",
    title: "Alpha-beta pruning — telle besøkte noder",
    description:
      "Implementér alpha-beta pruning og tell antall noder besøkt vs ren minimax. På et lite syntetisk tre skal du se ~30-50% færre besøk.",
    requires: [],
    starter: `# Lite tre: liste-av-lister, hvor blader er int (utility).
# Eksempel: [[3, 5], [6, 9]] er depth-2-tre med 2 grener, hver med 2 blader.
# MAX først (rot), så MIN.

TREE = [
    [[3, 5], [6, 9]],
    [[1, 2], [0, -1]],
]

count = {'minimax': 0, 'alphabeta': 0}

def minimax(node, is_max):
    count['minimax'] += 1
    if isinstance(node, int):
        return node
    # TODO: returnér max eller min av barn-verdier rekursivt.
    pass

def alphabeta(node, alpha, beta, is_max):
    count['alphabeta'] += 1
    if isinstance(node, int):
        return node
    # TODO:
    # MAX: v=-inf; for child: v=max(v, alphabeta(child, alpha, beta, False));
    #      if v >= beta: return v ; alpha=max(alpha, v)
    # MIN: tilsvarende speilvendt.
    pass

print("minimax:", minimax(TREE, True), "besøk:", count['minimax'])
count['minimax'] = 0
print("alphabeta:", alphabeta(TREE, float('-inf'), float('inf'), True), "besøk:", count['alphabeta'])
`,
    solution: `TREE = [
    [[3, 5], [6, 9]],
    [[1, 2], [0, -1]],
]

count = {'minimax': 0, 'alphabeta': 0}

def minimax(node, is_max):
    count['minimax'] += 1
    if isinstance(node, int):
        return node
    if is_max:
        return max(minimax(c, False) for c in node)
    return min(minimax(c, True) for c in node)

def alphabeta(node, alpha, beta, is_max):
    count['alphabeta'] += 1
    if isinstance(node, int):
        return node
    if is_max:
        v = float('-inf')
        for c in node:
            v = max(v, alphabeta(c, alpha, beta, False))
            if v >= beta: return v
            alpha = max(alpha, v)
        return v
    else:
        v = float('inf')
        for c in node:
            v = min(v, alphabeta(c, alpha, beta, True))
            if v <= alpha: return v
            beta = min(beta, v)
        return v

print("minimax:", minimax(TREE, True), "besøk:", count['minimax'])
count['minimax'] = 0
print("alphabeta:", alphabeta(TREE, float('-inf'), float('inf'), True), "besøk:", count['alphabeta'])
`,
    hints: [
      "Bruk isinstance(node, int) for å oppdage løv.",
      "Pruning skjer når v >= beta (MAX) eller v <= alpha (MIN) — returnér umiddelbart.",
      "Sammenlign telleren før og etter — vinninga er typisk 30-50% på dette treet.",
    ],
  },
  {
    id: "py-dte2501-minimax-best-move",
    topic: "ML — Minimax",
    title: "Velg beste trekk med minimax",
    description:
      "Skriv best_move(b) som returnerer indeks 0-8 for det optimale trekket for spilleren som er på tur. Bruk minimax under panseret.",
    requires: [],
    starter: `from functools import lru_cache

def winner(b):
    lines = [(0,1,2),(3,4,5),(6,7,8),(0,3,6),(1,4,7),(2,5,8),(0,4,8),(2,4,6)]
    for a,c,d in lines:
        if b[a] != ' ' and b[a] == b[c] == b[d]: return b[a]
    return None

def to_move(b):
    return 'X' if b.count('X') == b.count('O') else 'O'

@lru_cache(maxsize=None)
def minimax(b):
    w = winner(b)
    if w == 'X': return 1
    if w == 'O': return -1
    if ' ' not in b: return 0
    player = to_move(b)
    vals = []
    for i, c in enumerate(b):
        if c == ' ':
            new = b[:i] + (player,) + b[i+1:]
            vals.append(minimax(new))
    return max(vals) if player == 'X' else min(vals)

def best_move(b):
    # TODO: returnér indeksen i [0..8] som gir best utility for spilleren på tur.
    pass

# Tester:
b = ('X', 'X', ' ', 'O', 'O', ' ', ' ', ' ', ' ')  # X på tur (vant)
print("X bør vinne her ved å spille på indeks 2:", best_move(b))
`,
    solution: `from functools import lru_cache

def winner(b):
    lines = [(0,1,2),(3,4,5),(6,7,8),(0,3,6),(1,4,7),(2,5,8),(0,4,8),(2,4,6)]
    for a,c,d in lines:
        if b[a] != ' ' and b[a] == b[c] == b[d]: return b[a]
    return None

def to_move(b):
    return 'X' if b.count('X') == b.count('O') else 'O'

@lru_cache(maxsize=None)
def minimax(b):
    w = winner(b)
    if w == 'X': return 1
    if w == 'O': return -1
    if ' ' not in b: return 0
    player = to_move(b)
    vals = []
    for i, c in enumerate(b):
        if c == ' ':
            new = b[:i] + (player,) + b[i+1:]
            vals.append(minimax(new))
    return max(vals) if player == 'X' else min(vals)

def best_move(b):
    player = to_move(b)
    best = None
    best_v = float('-inf') if player == 'X' else float('inf')
    for i, c in enumerate(b):
        if c == ' ':
            new = b[:i] + (player,) + b[i+1:]
            v = minimax(new)
            if (player == 'X' and v > best_v) or (player == 'O' and v < best_v):
                best_v = v
                best = i
    return best

b = ('X', 'X', ' ', 'O', 'O', ' ', ' ', ' ', ' ')
print("X bør vinne her ved å spille på indeks 2:", best_move(b))
`,
  },

  // --------------------------- Bandits (Sutton & Barto kap. 2) ---------------------------
  {
    id: "py-dte2501-bandit-egreedy",
    topic: "ML — Bandits",
    title: "ε-greedy på 5 armer",
    description:
      "Implementér ε-greedy for 5 gaussiske armer med sanne μ = [0.2, -0.3, 0.7, 0.1, 0.5]. Kjør 1000 trekk og rapporter gjennomsnittlig belønning, slutt-Q og hvor ofte beste arm ble valgt.",
    requires: ["numpy"],
    starter: `import numpy as np
rng = np.random.default_rng(0)

TRUE_MU = np.array([0.2, -0.3, 0.7, 0.1, 0.5])
K = len(TRUE_MU)
T = 1000
EPS = 0.1

Q = np.zeros(K)
N = np.zeros(K, dtype=int)
cum_reward = 0.0

for t in range(T):
    # TODO:
    # 1. Med p=EPS, velg tilfeldig arm; ellers argmax Q.
    # 2. Sample reward = N(TRUE_MU[a], 1.0).
    # 3. Inkrement N[a], oppdater Q[a] += (reward - Q[a]) / N[a].
    pass

print(f"Beste sann arm: {TRUE_MU.argmax()}  μ={TRUE_MU.max():.2f}")
print(f"Q-estimater:  {np.round(Q, 2)}")
print(f"N (valg-frekvens): {N}")
print(f"Gj.snitt belønning: {cum_reward / T:.3f}")
`,
    solution: `import numpy as np
rng = np.random.default_rng(0)

TRUE_MU = np.array([0.2, -0.3, 0.7, 0.1, 0.5])
K = len(TRUE_MU)
T = 1000
EPS = 0.1

Q = np.zeros(K)
N = np.zeros(K, dtype=int)
cum_reward = 0.0

for t in range(T):
    if rng.random() < EPS:
        a = rng.integers(0, K)
    else:
        a = int(np.argmax(Q))
    reward = TRUE_MU[a] + rng.normal(0, 1.0)
    N[a] += 1
    Q[a] += (reward - Q[a]) / N[a]
    cum_reward += reward

print(f"Beste sann arm: {TRUE_MU.argmax()}  μ={TRUE_MU.max():.2f}")
print(f"Q-estimater:  {np.round(Q, 2)}")
print(f"N (valg-frekvens): {N}")
print(f"Gj.snitt belønning: {cum_reward / T:.3f}")
`,
    hints: [
      "rng.random() < EPS gir True med sannsynlighet EPS.",
      "np.argmax(Q) er grådig — sjekk om EPS=0 låser deg fast.",
      "Inkrementell mean: Q[a] += (reward - Q[a]) / N[a].",
    ],
  },
  {
    id: "py-dte2501-bandit-ucb1",
    topic: "ML — Bandits",
    title: "UCB1 — sammenlign mot ε-greedy",
    description:
      "Kjør UCB1-algoritmen på samme 5-armede setup og sammenlign sluttverdi av regret med ε-greedy (ε=0.1).",
    requires: ["numpy"],
    starter: `import numpy as np
rng = np.random.default_rng(1)

TRUE_MU = np.array([0.2, -0.3, 0.7, 0.1, 0.5])
K = len(TRUE_MU)
T = 1000
BEST = TRUE_MU.max()

def run_ucb(c=2.0):
    Q = np.zeros(K); N = np.zeros(K, dtype=int); cum = 0.0
    for t in range(1, T+1):
        # TODO:
        # Sørg for at hver arm prøves minst én gang (N[i] == 0 → velg den).
        # Ellers: a = argmax( Q + c * sqrt(ln t / N) )
        pass
    return cum

def run_egreedy(eps=0.1):
    Q = np.zeros(K); N = np.zeros(K, dtype=int); cum = 0.0
    for t in range(T):
        a = rng.integers(0, K) if rng.random() < eps else int(np.argmax(Q))
        r = TRUE_MU[a] + rng.normal(0, 1)
        N[a] += 1; Q[a] += (r - Q[a]) / N[a]; cum += r
    return cum

cum_ucb = run_ucb()
cum_eg = run_egreedy()
print(f"UCB1  cum_reward: {cum_ucb:.1f}   regret: {BEST*T - cum_ucb:.1f}")
print(f"ε-grd cum_reward: {cum_eg:.1f}   regret: {BEST*T - cum_eg:.1f}")
`,
    solution: `import numpy as np
rng = np.random.default_rng(1)

TRUE_MU = np.array([0.2, -0.3, 0.7, 0.1, 0.5])
K = len(TRUE_MU)
T = 1000
BEST = TRUE_MU.max()

def run_ucb(c=2.0):
    Q = np.zeros(K); N = np.zeros(K, dtype=int); cum = 0.0
    for t in range(1, T+1):
        untried = np.where(N == 0)[0]
        if len(untried) > 0:
            a = int(untried[0])
        else:
            ucb = Q + c * np.sqrt(np.log(t) / N)
            a = int(np.argmax(ucb))
        r = TRUE_MU[a] + rng.normal(0, 1)
        N[a] += 1; Q[a] += (r - Q[a]) / N[a]; cum += r
    return cum

def run_egreedy(eps=0.1):
    Q = np.zeros(K); N = np.zeros(K, dtype=int); cum = 0.0
    for t in range(T):
        a = rng.integers(0, K) if rng.random() < eps else int(np.argmax(Q))
        r = TRUE_MU[a] + rng.normal(0, 1)
        N[a] += 1; Q[a] += (r - Q[a]) / N[a]; cum += r
    return cum

cum_ucb = run_ucb()
cum_eg = run_egreedy()
print(f"UCB1  cum_reward: {cum_ucb:.1f}   regret: {BEST*T - cum_ucb:.1f}")
print(f"ε-grd cum_reward: {cum_eg:.1f}   regret: {BEST*T - cum_eg:.1f}")
`,
    hints: [
      "Sørg for at N[a] > 0 før du deler — første sweep må prøve alle armer.",
      "Bonus-leddet skaleres av c — typisk c = √2 eller 2.",
      "Regret = BEST*T − Σ R_t.",
    ],
  },
  {
    id: "py-dte2501-bandit-optimistic",
    topic: "ML — Bandits",
    title: "Optimistic initial values — pur grådig",
    description:
      "Initialiser Q₀ = 5 (mye over sann maks-belønning). Bruk PUR grådig (ε=0) og se at algoritmen automatisk utforsker armer mens Q-verdiene krymper.",
    requires: ["numpy"],
    starter: `import numpy as np
rng = np.random.default_rng(2)

TRUE_MU = np.array([0.2, -0.3, 0.7, 0.1, 0.5])
K = len(TRUE_MU)
T = 500

Q = np.full(K, 5.0)
N = np.zeros(K, dtype=int)
chose_best = 0
BEST_IDX = TRUE_MU.argmax()

for t in range(T):
    # TODO: pur grådig — a = argmax(Q). Oppdater som vanlig.
    pass

print(f"Slutt-Q: {np.round(Q, 2)}")
print(f"Antall valg av beste arm ({BEST_IDX}): {chose_best} / {T}")
`,
    solution: `import numpy as np
rng = np.random.default_rng(2)

TRUE_MU = np.array([0.2, -0.3, 0.7, 0.1, 0.5])
K = len(TRUE_MU)
T = 500

Q = np.full(K, 5.0)
N = np.zeros(K, dtype=int)
chose_best = 0
BEST_IDX = int(TRUE_MU.argmax())

for t in range(T):
    a = int(np.argmax(Q))
    r = TRUE_MU[a] + rng.normal(0, 1)
    N[a] += 1
    Q[a] += (r - Q[a]) / N[a]
    if a == BEST_IDX:
        chose_best += 1

print(f"Slutt-Q: {np.round(Q, 2)}")
print(f"Antall valg av beste arm ({BEST_IDX}): {chose_best} / {T}")
`,
    hints: [
      "Q₀=5 betyr at alle armer ser 'for gode ut' — grådig må prøve hver flere ganger før Q krymper.",
      "Effekten er kortlivd: når N(a) blir stor, dominerer faktiske rewards.",
      "Sammenlign med ε=0 og Q₀=0 — der låses du på første arm.",
    ],
  },

  // --------------------------- MDP Bellman regnedrill (Sutton & Barto kap. 3-4) ---------------------------
  {
    id: "py-dte2501-vi-2state",
    topic: "ML — MDP Bellman",
    title: "Value Iteration på 2-state MDP",
    description:
      "Implementér Value Iteration på 2-state-MDPen fra leksjonen (A,B + stay/move). Verifiser V*(A) = 1/(1−γ) ved γ = 0.9.",
    requires: ["numpy"],
    starter: `import numpy as np

# states: 0 = A, 1 = B.   actions: 0 = stay, 1 = move
# T[s][a] = (next_state, reward)
T = {
    (0, 0): (0, +1),  # A·stay -> A, reward +1
    (0, 1): (1,  0),  # A·move -> B, reward 0
    (1, 0): (1,  0),  # B·stay -> B, reward 0
    (1, 1): (0, -1),  # B·move -> A, reward -1
}
GAMMA = 0.9
THETA = 1e-6

V = np.zeros(2)
k = 0

while True:
    delta = 0.0
    V_new = np.zeros(2)
    for s in range(2):
        # TODO:
        # 1. For hver action a: q = R + γ V[next].
        # 2. V_new[s] = max q.
        # 3. delta = max(delta, |V_new[s] - V[s]|).
        pass
    V = V_new
    k += 1
    if delta < THETA:
        break

print(f"Iterasjoner til konvergens: {k}")
print(f"V*: A = {V[0]:.4f}, B = {V[1]:.4f}")
print(f"Lukket form: V*(A) = 1/(1-γ) = {1/(1-GAMMA):.4f}")
`,
    solution: `import numpy as np

T = {
    (0, 0): (0, +1),
    (0, 1): (1,  0),
    (1, 0): (1,  0),
    (1, 1): (0, -1),
}
GAMMA = 0.9
THETA = 1e-6

V = np.zeros(2)
k = 0

while True:
    delta = 0.0
    V_new = np.zeros(2)
    for s in range(2):
        qs = []
        for a in range(2):
            ns, r = T[(s, a)]
            qs.append(r + GAMMA * V[ns])
        V_new[s] = max(qs)
        delta = max(delta, abs(V_new[s] - V[s]))
    V = V_new
    k += 1
    if delta < THETA:
        break

print(f"Iterasjoner til konvergens: {k}")
print(f"V*: A = {V[0]:.4f}, B = {V[1]:.4f}")
print(f"Lukket form: V*(A) = 1/(1-γ) = {1/(1-GAMMA):.4f}")
`,
    hints: [
      "Bruk en np.zeros(2)-vektor for V og en frisk V_new i hver sweep (synchronous backup).",
      "delta = max over states av |V_new − V_old|. Stopp når delta < THETA.",
      "Ved γ=0.9 forventes ~100 iterasjoner — kontraksjons-rate 0.9.",
    ],
  },
  {
    id: "py-dte2501-pi-2state",
    topic: "ML — MDP Bellman",
    title: "Policy Iteration på 2-state MDP",
    description:
      "Implementér Policy Iteration: 1) løs lineært system (I − γ P_π)V = R_π eksakt med np.linalg.solve, 2) gjør policy improvement. Verifiser at policy konvergerer på 1-2 iterasjoner.",
    requires: ["numpy"],
    starter: `import numpy as np

T = {
    (0, 0): (0, +1),
    (0, 1): (1,  0),
    (1, 0): (1,  0),
    (1, 1): (0, -1),
}
S = [0, 1]
A = [0, 1]  # 0 = stay, 1 = move
GAMMA = 0.9

# Start med tilfeldig policy (stay for begge).
policy = {0: 0, 1: 0}

for it in range(20):
    # EVALUATION: bygg (I - γ P_π) V = R_π og løs.
    # TODO:
    # P_pi = 2x2 matrix der P_pi[s, s'] = 1 hvis T[s, policy[s]] -> s', else 0.
    # R_pi = 2-vektor med R for s, policy[s].
    # V = np.linalg.solve(I - γ P_pi, R_pi).
    P_pi = np.zeros((2, 2))
    R_pi = np.zeros(2)
    # ... fyll P_pi og R_pi ...
    V = np.linalg.solve(np.eye(2) - GAMMA * P_pi, R_pi)

    # IMPROVEMENT
    stable = True
    new_policy = {}
    for s in S:
        qs = [T[(s, a)][1] + GAMMA * V[T[(s, a)][0]] for a in A]
        a_star = int(np.argmax(qs))
        new_policy[s] = a_star
        if a_star != policy[s]:
            stable = False
    policy = new_policy
    print(f"it={it}  policy={policy}  V={np.round(V, 3)}  stable={stable}")
    if stable:
        break

print(f"\\nOptimal policy: {policy}")
print(f"Optimal V: {np.round(V, 4)}")
`,
    solution: `import numpy as np

T = {
    (0, 0): (0, +1),
    (0, 1): (1,  0),
    (1, 0): (1,  0),
    (1, 1): (0, -1),
}
S = [0, 1]
A = [0, 1]
GAMMA = 0.9

policy = {0: 0, 1: 0}

for it in range(20):
    P_pi = np.zeros((2, 2))
    R_pi = np.zeros(2)
    for s in S:
        ns, r = T[(s, policy[s])]
        P_pi[s, ns] = 1
        R_pi[s] = r
    V = np.linalg.solve(np.eye(2) - GAMMA * P_pi, R_pi)

    stable = True
    new_policy = {}
    for s in S:
        qs = [T[(s, a)][1] + GAMMA * V[T[(s, a)][0]] for a in A]
        a_star = int(np.argmax(qs))
        new_policy[s] = a_star
        if a_star != policy[s]:
            stable = False
    policy = new_policy
    print(f"it={it}  policy={policy}  V={np.round(V, 3)}  stable={stable}")
    if stable:
        break

print(f"\\nOptimal policy: {policy}")
print(f"Optimal V: {np.round(V, 4)}")
`,
    hints: [
      "P_π[s, s'] = 1 når T[s, policy[s]] gir overgang til s' (deterministic).",
      "R_π[s] = R(s, policy[s], next_state).",
      "np.linalg.solve(A, b) løser Ax = b — bruk på (I − γP_π) V = R_π.",
      "PI konvergerer på maks 1–2 iterasjoner her fordi |S| og |A| er små.",
    ],
  },
  {
    id: "py-dte2501-vi-grid",
    topic: "ML — MDP Bellman",
    title: "VI på 3×3 grid — kortest sti til mål",
    description:
      "Et 3×3 grid med mål i nedre-høyre (reward +1) og veggene som +-1. Implementér VI for å finne V*(s) og optimal policy. Test at startposisjonen (0,0) får verdi ~ γ^4 = 0.9^4 hvis γ=0.9.",
    requires: ["numpy"],
    starter: `import numpy as np

ROWS, COLS = 3, 3
GOAL = (2, 2)
GAMMA = 0.9
THETA = 1e-5
ACTIONS = [(-1,0), (1,0), (0,-1), (0,1)]  # up, down, left, right

def step(state, action):
    """Returnér (next_state, reward, done) — deterministic."""
    if state == GOAL:
        return state, 0, True  # absorberende
    r, c = state
    dr, dc = action
    nr, nc = max(0, min(ROWS-1, r+dr)), max(0, min(COLS-1, c+dc))
    next_s = (nr, nc)
    reward = 1.0 if next_s == GOAL else 0.0
    return next_s, reward, False

V = np.zeros((ROWS, COLS))

for it in range(200):
    delta = 0.0
    V_new = np.zeros_like(V)
    for r in range(ROWS):
        for c in range(COLS):
            if (r, c) == GOAL:
                continue
            # TODO: V_new[r,c] = max over actions av reward + γ V[next]
            pass
            delta = max(delta, abs(V_new[r, c] - V[r, c]))
    V = V_new
    if delta < THETA: break

print("V*:"); print(np.round(V, 3))
print(f"V*((0,0)) = {V[0,0]:.3f}  (forventet ≈ γ^4 = {GAMMA**4:.3f})")
`,
    solution: `import numpy as np

ROWS, COLS = 3, 3
GOAL = (2, 2)
GAMMA = 0.9
THETA = 1e-5
ACTIONS = [(-1,0), (1,0), (0,-1), (0,1)]

def step(state, action):
    if state == GOAL:
        return state, 0, True
    r, c = state
    dr, dc = action
    nr, nc = max(0, min(ROWS-1, r+dr)), max(0, min(COLS-1, c+dc))
    next_s = (nr, nc)
    reward = 1.0 if next_s == GOAL else 0.0
    return next_s, reward, False

V = np.zeros((ROWS, COLS))

for it in range(200):
    delta = 0.0
    V_new = np.zeros_like(V)
    for r in range(ROWS):
        for c in range(COLS):
            if (r, c) == GOAL:
                continue
            qs = []
            for a in ACTIONS:
                (nr, nc), rwd, _ = step((r, c), a)
                qs.append(rwd + GAMMA * V[nr, nc])
            V_new[r, c] = max(qs)
            delta = max(delta, abs(V_new[r, c] - V[r, c]))
    V = V_new
    if delta < THETA: break

print("V*:"); print(np.round(V, 3))
print(f"V*((0,0)) = {V[0,0]:.3f}  (forventet ≈ γ^4 = {GAMMA**4:.3f})")
`,
    hints: [
      "step() klipper koordinater til grid-bounds — å gå inn i en vegg holder deg i samme rute.",
      "Reward +1 gis ved overgang INN i målet. Selve målet er absorberende med 0.",
      "Optimum-sti fra (0,0) til (2,2) er 4 trekk → V*(0,0) ≈ γ^3 · 1 = 0.729 (siste reward kommer ved trekk 4 = γ^3 · 1).",
    ],
  },
];
