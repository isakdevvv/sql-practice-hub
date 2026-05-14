import type { PyExercise } from "./types";

// DTE-2602 — LDA/QDA/Naive Bayes + Cross-validation-varianter.
// Speil av mini-kursene `dte2602-lda-qda-nb` og `dte2602-cv-varianter`.

export const PY_DTE2602_GAPS2_EXERCISES: PyExercise[] = [
  // ============ LDA / QDA / NB (5) ============
  {
    id: "dte2602-py-lda-iris",
    topic: "DTE-2602 Modeller",
    title: "LDA vs QDA vs GaussianNB på iris",
    description:
      "Sammenlign tre generative klassifikatorer på iris. Hvilken vinner — og hvorfor er forskjellen liten på dette datasettet?",
    requires: [],
    starter: `from sklearn.datasets import load_iris
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis, QuadraticDiscriminantAnalysis
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import cross_val_score

X, y = load_iris(return_X_y=True)

# TODO:
# 1) For hver av (LDA, QDA, GaussianNB): kjør 5-fold CV med scoring='accuracy'
# 2) Print snitt og standardavvik per modell
# 3) Hvilken vinner? Hvorfor er forskjellen liten?
`,
    solution: `from sklearn.datasets import load_iris
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis, QuadraticDiscriminantAnalysis
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import cross_val_score

X, y = load_iris(return_X_y=True)

for name, model in [
    ("LDA", LinearDiscriminantAnalysis()),
    ("QDA", QuadraticDiscriminantAnalysis()),
    ("GNB", GaussianNB()),
]:
    s = cross_val_score(model, X, y, cv=5, scoring='accuracy')
    print(f"{name}: {s.mean():.3f} +/- {s.std():.3f}")

# Typisk: alle 0.96-0.98. Iris er klasse-Gauss-aktig og lineært nesten separerbar,
# så alle tre klarer det. LDA er ofte vinneren pga få parametre med n=150.
`,
    hints: [
      "cross_val_score med cv=5 stratifiserer automatisk for klassifikatorer.",
      "Forskjellen mellom modellene er typisk innenfor 1-2 %.",
      "Iris er nesten lineært separerbar — generative og diskriminative klassifikatorer presterer likt.",
    ],
  },
  {
    id: "dte2602-py-lda-decision-region",
    topic: "DTE-2602 Modeller",
    title: "LDA: lineær diskriminantfunksjon manuelt",
    description:
      "Bygg LDA fra scratch på en 2D-leke: estimer μ_k, delt Σ, klassifiser et nytt punkt. Sammenlign med sklearn.",
    requires: [],
    starter: `import numpy as np
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis

# 2D-data, to klasser, lik kovariansstruktur
rng = np.random.default_rng(0)
n = 100
mu0 = np.array([-1, -1]); mu1 = np.array([1.5, 1.0])
Sigma = np.array([[1.2, 0.4], [0.4, 0.8]])

X0 = rng.multivariate_normal(mu0, Sigma, n)
X1 = rng.multivariate_normal(mu1, Sigma, n)
X = np.vstack([X0, X1]); y = np.array([0]*n + [1]*n)
test_point = np.array([0.5, 0.3])

# TODO:
# 1) Estimer mu0_hat, mu1_hat fra X0, X1
# 2) Estimer pooled Sigma_hat = ((X0 - mu0_hat).T @ (X0-mu0_hat) + ...) / (N - K)
# 3) For each k: delta_k = x.T @ inv(Sigma) @ mu_k - 0.5 * mu_k.T @ inv(Sigma) @ mu_k + log(pi_k)
# 4) Predikt klassen for test_point via argmax delta_k
# 5) Sammenlign med sklearn LinearDiscriminantAnalysis().fit(X, y).predict([test_point])
`,
    solution: `import numpy as np
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis

rng = np.random.default_rng(0)
n = 100
mu0 = np.array([-1, -1]); mu1 = np.array([1.5, 1.0])
Sigma = np.array([[1.2, 0.4], [0.4, 0.8]])
X0 = rng.multivariate_normal(mu0, Sigma, n)
X1 = rng.multivariate_normal(mu1, Sigma, n)
X = np.vstack([X0, X1]); y = np.array([0]*n + [1]*n)
test_point = np.array([0.5, 0.3])

mu0_hat = X0.mean(axis=0); mu1_hat = X1.mean(axis=0)
S0 = (X0 - mu0_hat).T @ (X0 - mu0_hat)
S1 = (X1 - mu1_hat).T @ (X1 - mu1_hat)
N = X.shape[0]; K = 2
Sigma_hat = (S0 + S1) / (N - K)
Sinv = np.linalg.inv(Sigma_hat)
pi0 = pi1 = 0.5

def delta(x, mu, pi):
    return x @ Sinv @ mu - 0.5 * mu @ Sinv @ mu + np.log(pi)

d0 = delta(test_point, mu0_hat, pi0)
d1 = delta(test_point, mu1_hat, pi1)
pred_manual = 0 if d0 > d1 else 1

pred_sklearn = LinearDiscriminantAnalysis().fit(X, y).predict([test_point])[0]
print(f"manual: {pred_manual},  sklearn: {pred_sklearn}")
print(f"delta_0 = {d0:.3f}, delta_1 = {d1:.3f}")
`,
    hints: [
      "Pooled Sigma: del SS_within (innen-klasse-spredning) på (N-K) frihetsgrader.",
      "δ_k(x) = x^T Σ^{-1} μ_k − 0.5 μ_k^T Σ^{-1} μ_k + log π_k.",
      "Manual og sklearn skal gi samme klasse — log π_k er like (begge 0.5).",
    ],
  },
  {
    id: "dte2602-py-qda-vs-lda-spread",
    topic: "DTE-2602 Modeller",
    title: "QDA vinner når klassene har ulik spredning",
    description:
      "Generer to klasser med tydelig ulik kovariansstruktur. Vis at QDA bedre enn LDA på dette datasettet.",
    requires: [],
    starter: `import numpy as np
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis, QuadraticDiscriminantAnalysis
from sklearn.model_selection import cross_val_score

rng = np.random.default_rng(7)
n = 200
mu0 = [0, 0]; mu1 = [0, 0]
Sigma0 = np.array([[2.0, 0.0], [0.0, 0.3]])   # bred, kort
Sigma1 = np.array([[0.3, 0.0], [0.0, 2.0]])   # smal, lang
X0 = rng.multivariate_normal(mu0, Sigma0, n)
X1 = rng.multivariate_normal(mu1, Sigma1, n)
X = np.vstack([X0, X1]); y = np.array([0]*n + [1]*n)

# TODO:
# 1) Kjør 5-fold CV med LDA og QDA, scoring='accuracy'
# 2) Print snitt for begge
# 3) Forventet: QDA er klart bedre — LDA's antakelse om delt Σ er brutt
`,
    solution: `import numpy as np
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis, QuadraticDiscriminantAnalysis
from sklearn.model_selection import cross_val_score

rng = np.random.default_rng(7)
n = 200
Sigma0 = np.array([[2.0, 0.0], [0.0, 0.3]])
Sigma1 = np.array([[0.3, 0.0], [0.0, 2.0]])
X0 = rng.multivariate_normal([0, 0], Sigma0, n)
X1 = rng.multivariate_normal([0, 0], Sigma1, n)
X = np.vstack([X0, X1]); y = np.array([0]*n + [1]*n)

for name, model in [("LDA", LinearDiscriminantAnalysis()), ("QDA", QuadraticDiscriminantAnalysis())]:
    s = cross_val_score(model, X, y, cv=5)
    print(f"{name}: {s.mean():.3f}")

# LDA blir nær 50 % (samme snitt, lineær grense kan ikke skille kryss-formet data).
# QDA finner kvadratisk grense og oppnaar ~85-90 %.
`,
  },
  {
    id: "dte2602-py-nb-text",
    topic: "DTE-2602 Modeller",
    title: "MultinomialNB på tekst-features",
    description:
      "Tren MultinomialNB på en mini-spam-korpus med CountVectorizer. Vis hvorfor NB klarer dette selv om vi har mange flere features enn samples.",
    requires: [],
    starter: `from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

texts = [
    "win money now free prize click",
    "claim your prize free entry",
    "meeting tomorrow at 10",
    "lunch with the team",
    "free money offer urgent",
    "see attached report for review",
    "exclusive deal click now win",
    "happy birthday hope you have a great day",
]
labels = [1, 1, 0, 0, 1, 0, 1, 0]  # 1 = spam

# TODO:
# 1) CountVectorizer -> X
# 2) Tren MultinomialNB
# 3) Predikt på en ny tekst: "free deal win"
# 4) Print P(spam | x) — hint: clf.predict_proba
`,
    solution: `from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

texts = [
    "win money now free prize click",
    "claim your prize free entry",
    "meeting tomorrow at 10",
    "lunch with the team",
    "free money offer urgent",
    "see attached report for review",
    "exclusive deal click now win",
    "happy birthday hope you have a great day",
]
labels = [1, 1, 0, 0, 1, 0, 1, 0]

vec = CountVectorizer()
X = vec.fit_transform(texts)
clf = MultinomialNB().fit(X, labels)

new_text = ["free deal win"]
Xn = vec.transform(new_text)
print("predikert klasse:", clf.predict(Xn)[0])
print("P(spam|x) =", clf.predict_proba(Xn)[0, 1])
print(f"vocab-størrelse: {len(vec.vocabulary_)}, samples: {len(texts)}")
`,
    hints: [
      "predict_proba returnerer (n, K) med kolonne k = P(klasse=k|x).",
      "NB klarer seg fordi den bare estimerer marginale: P(ord|klasse) per (ord, klasse).",
      "QDA på samme data ville krasje — singular Σ med p > n.",
    ],
  },
  {
    id: "dte2602-py-nb-vs-logreg",
    topic: "DTE-2602 Modeller",
    title: "Naive Bayes vs Logistisk regresjon: bias-varians",
    description:
      "Generer data med små n: NB undergår mindre overfitting enn logistisk regresjon når n er liten. Vis dette med learning curves.",
    requires: [],
    starter: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.naive_bayes import GaussianNB
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import learning_curve

X, y = make_classification(
    n_samples=400, n_features=10, n_informative=6,
    n_redundant=2, random_state=0
)

# TODO: kjør learning_curve på begge modellene over treningsstørrelser
# np.linspace(0.1, 1.0, 6). Print val-score for hver størrelse.
# Forventet: NB jevnere; LogReg lider mer på små n.
`,
    solution: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.naive_bayes import GaussianNB
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import learning_curve

X, y = make_classification(
    n_samples=400, n_features=10, n_informative=6,
    n_redundant=2, random_state=0
)
sizes = np.linspace(0.1, 1.0, 6)

for name, model in [("GNB", GaussianNB()), ("LogReg", LogisticRegression(max_iter=1000))]:
    n_arr, tr, va = learning_curve(model, X, y, train_sizes=sizes, cv=5)
    print(f"\\n{name}")
    for s, v in zip(n_arr, va.mean(axis=1)):
        print(f"  n={s:3.0f}: val-acc = {v:.3f}")
`,
    hints: [
      "learning_curve returnerer (train_sizes, train_scores, val_scores) hvor scores er (k_folds, n_sizes).",
      "Snitt over folds: val_scores.mean(axis=1).",
      "NB er stabil tidlig; LogReg svinger mer.",
    ],
  },

  // ============ CV-varianter (4) ============
  {
    id: "dte2602-py-cv-stratified",
    topic: "DTE-2602 Evaluering",
    title: "KFold vs StratifiedKFold ved ubalansert klassifikasjon",
    description:
      "Generer ubalansert data (5 % positive). Vis at vanlig KFold gir folder med veldig ulik klassebalanse, mens StratifiedKFold holder den jevn.",
    requires: [],
    starter: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import KFold, StratifiedKFold

X, y = make_classification(n_samples=200, weights=[0.95, 0.05], random_state=0)
print(f"Totalt: {y.sum()}/{len(y)} positive ({100*y.mean():.1f}%)")

# TODO: For både KFold(5) og StratifiedKFold(5):
# Print andel positive i hver test-fold.
`,
    solution: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import KFold, StratifiedKFold

X, y = make_classification(n_samples=200, weights=[0.95, 0.05], random_state=0)
print(f"Totalt: {y.sum()}/{len(y)} positive ({100*y.mean():.1f}%)")

for name, cv in [
    ("KFold",            KFold(n_splits=5, shuffle=True, random_state=42)),
    ("StratifiedKFold",  StratifiedKFold(n_splits=5, shuffle=True, random_state=42)),
]:
    print(f"\\n{name}:")
    for i, (_, te) in enumerate(cv.split(X, y)):
        pos = y[te].sum()
        print(f"  fold {i}: {pos}/{len(te)} positive ({100*y[te].mean():.1f}%)")

# KFold kan ha 0-5 positive per fold; Stratified ligger jevnt rundt 2.
`,
  },
  {
    id: "dte2602-py-cv-leakage",
    topic: "DTE-2602 Evaluering",
    title: "Datalekkasje: scaler før vs inne i CV",
    description:
      "Demonstrer hvordan å skalere før cross_val_score blåser opp scoren urettferdig. Pipeline fikser det.",
    requires: [],
    starter: `from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score

X, y = load_breast_cancer(return_X_y=True)

# TODO:
# 1) Feil måte: scaler.fit_transform på hele X, så cross_val_score
# 2) Rett måte: Pipeline([(scaler), (logreg)]) i cross_val_score
# 3) Print begge accuracy-snittene; differansen skal være liten her men finnes.
`,
    solution: `from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score

X, y = load_breast_cancer(return_X_y=True)

# 1) Lekkasje
X_scaled = StandardScaler().fit_transform(X)
s_leak = cross_val_score(LogisticRegression(max_iter=2000), X_scaled, y, cv=5)
print(f"Lekkasje: {s_leak.mean():.4f}")

# 2) Pipeline
pipe = Pipeline([('sc', StandardScaler()), ('clf', LogisticRegression(max_iter=2000))])
s_pipe = cross_val_score(pipe, X, y, cv=5)
print(f"Pipeline: {s_pipe.mean():.4f}")

# På breast_cancer er forskjellen liten (~0.001). Men på mindre datasett, eller
# med feature selection før split, er forskjellen ofte betydelig.
`,
  },
  {
    id: "dte2602-py-cv-timeseries",
    topic: "DTE-2602 Evaluering",
    title: "TimeSeriesSplit — train kommer alltid før test",
    description:
      "Kjør TimeSeriesSplit og verifiser at train-indekser alltid er FØR test-indekser. Sammenlign med vanlig KFold.",
    requires: [],
    starter: `import numpy as np
from sklearn.model_selection import KFold, TimeSeriesSplit

X = np.arange(20).reshape(-1, 1)
y = np.arange(20)

# TODO:
# 1) For KFold(5, shuffle=False): print (train.max(), test.min()) — er train alltid < test?
# 2) For TimeSeriesSplit(5): samme analyse
# 3) Beskriv hvilken som er trygg for tidsserier
`,
    solution: `import numpy as np
from sklearn.model_selection import KFold, TimeSeriesSplit

X = np.arange(20).reshape(-1, 1)

print("KFold:")
for i, (tr, te) in enumerate(KFold(n_splits=5, shuffle=False).split(X)):
    print(f"  fold {i}: train max={tr.max()}, test min={te.min()}, train_size={len(tr)}")

print("\\nTimeSeriesSplit:")
for i, (tr, te) in enumerate(TimeSeriesSplit(n_splits=5).split(X)):
    print(f"  fold {i}: train max={tr.max()}, test min={te.min()}, train_size={len(tr)}")
    assert tr.max() < te.min(), "Lekkasje!"

# KFold (uten shuffle) lekker fortsatt: test-foldene er midt i tidsrekkefølgen,
# så fold 0 tester på indeks 0-3 mens train inkluderer 4-19 (framtid).
# TimeSeriesSplit garanterer tr.max() < te.min() for ALLE folder.
`,
  },
  {
    id: "dte2602-py-cv-group",
    topic: "DTE-2602 Evaluering",
    title: "GroupKFold — hold pasienter atskilte",
    description:
      "Simuler 5 pasienter med 4 målinger hver. Vis at GroupKFold aldri lar samme pasient være i både train og test.",
    requires: [],
    starter: `import numpy as np
from sklearn.model_selection import GroupKFold, KFold

n_patients = 5
samples_per = 4
groups = np.repeat(np.arange(n_patients), samples_per)
X = np.random.rand(n_patients * samples_per, 3)
y = np.random.randint(0, 2, len(X))

# TODO:
# 1) GroupKFold(n_splits=5).split(X, y, groups): sjekk at test_groups ∩ train_groups = tom
# 2) Sammenlign med KFold uten group-awareness
`,
    solution: `import numpy as np
from sklearn.model_selection import GroupKFold, KFold

n_patients = 5
samples_per = 4
groups = np.repeat(np.arange(n_patients), samples_per)
X = np.random.RandomState(0).rand(n_patients * samples_per, 3)
y = np.random.RandomState(1).randint(0, 2, len(X))

print("GroupKFold:")
for i, (tr, te) in enumerate(GroupKFold(n_splits=5).split(X, y, groups)):
    overlap = set(groups[tr]) & set(groups[te])
    print(f"  fold {i}: test_groups={sorted(set(groups[te]))}, overlap={overlap}")
    assert not overlap, "Lekkasje!"

print("\\nKFold (ignorer grupper):")
for i, (tr, te) in enumerate(KFold(n_splits=5, shuffle=True, random_state=0).split(X)):
    overlap = set(groups[tr]) & set(groups[te])
    print(f"  fold {i}: overlap={overlap}")
# KFold-folder vil typisk dele pasienter mellom train og test.
`,
  },
];
