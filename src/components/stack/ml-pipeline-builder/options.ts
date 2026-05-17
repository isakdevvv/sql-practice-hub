import type { AppOption } from "./types";

/**
 * Alle options brukeren kan krysse av i ML Pipeline Builder. Hver option
 * leverer kode-fragmenter som komponeres av assemble.ts.
 *
 * Kategorien dataset og model er "radio": nøyaktig én option er aktiv.
 * Preprocessor, eval, output osv. tillater flere samtidig.
 */
export const OPTIONS: readonly AppOption[] = [
  // =============== DATASETT (radio) ====================================
  {
    id: "ds-iris",
    category: "dataset",
    label: "Iris (multiclass, 3 klasser)",
    description: "load_iris() — 150 rader, 4 numeriske kolonner. Klassisk start.",
    defaultOn: true,
    contributes: {
      imports: ["from sklearn.datasets import load_iris"],
      dataset: `# === Last inn Iris ===
data = load_iris(as_frame=True)
X = data.data            # pandas.DataFrame
y = data.target          # pandas.Series med 3 klasser
feature_names = list(X.columns)
print("Iris X.shape =", X.shape, "klasser:", list(data.target_names))`,
      datasetInfo: {
        isPandas: true,
        numericCols: [
          "sepal length (cm)",
          "sepal width (cm)",
          "petal length (cm)",
          "petal width (cm)",
        ],
        categoricalCols: [],
        binary: false,
      },
    },
  },
  {
    id: "ds-wine",
    category: "dataset",
    label: "Wine (multiclass, 3 klasser)",
    description: "load_wine() — 178 rader, 13 numeriske kolonner. Trenger skalering.",
    contributes: {
      imports: ["from sklearn.datasets import load_wine"],
      dataset: `# === Last inn Wine ===
data = load_wine(as_frame=True)
X = data.data            # pandas.DataFrame (13 numeriske kolonner)
y = data.target          # pandas.Series med 3 klasser
feature_names = list(X.columns)
print("Wine X.shape =", X.shape, "klasser:", list(data.target_names))`,
      datasetInfo: {
        isPandas: true,
        numericCols: ["__ALL_NUMERIC__"],
        categoricalCols: [],
        binary: false,
      },
    },
  },
  {
    id: "ds-breast",
    category: "dataset",
    label: "Breast cancer (binær)",
    description: "load_breast_cancer() — 569 rader, 30 numeriske kolonner. Binær: ROC-AUC OK.",
    contributes: {
      imports: ["from sklearn.datasets import load_breast_cancer"],
      dataset: `# === Last inn Breast cancer ===
data = load_breast_cancer(as_frame=True)
X = data.data            # pandas.DataFrame (30 numeriske kolonner)
y = data.target          # 0 = malign, 1 = benign
feature_names = list(X.columns)
print("Breast cancer X.shape =", X.shape, "klasser:", list(data.target_names))`,
      datasetInfo: {
        isPandas: true,
        numericCols: ["__ALL_NUMERIC__"],
        categoricalCols: [],
        binary: true,
      },
    },
  },
  {
    id: "ds-titanic",
    category: "dataset",
    label: "Titanic (via pandas, blandet)",
    description:
      "Leser CSV med pandas. Har både numeriske (age, fare) og kategoriske (sex, embarked) — perfekt for ColumnTransformer.",
    contributes: {
      imports: ["import pandas as pd", "import numpy as np"],
      dataset: `# === Last inn Titanic (offentlig CSV) ===
TITANIC_URL = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"
df = pd.read_csv(TITANIC_URL)
df = df.dropna(subset=["Survived"])  # target må finnes

y = df["Survived"].astype(int)
X = df[["Pclass", "Sex", "Age", "SibSp", "Parch", "Fare", "Embarked"]].copy()
NUMERIC_COLS = ["Pclass", "Age", "SibSp", "Parch", "Fare"]
CATEGORICAL_COLS = ["Sex", "Embarked"]
print("Titanic X.shape =", X.shape)
print("Missing per kolonne:\\n", X.isna().sum().to_string())`,
      datasetInfo: {
        isPandas: true,
        numericCols: ["Pclass", "Age", "SibSp", "Parch", "Fare"],
        categoricalCols: ["Sex", "Embarked"],
        binary: true,
      },
    },
  },
  {
    id: "ds-custom-csv",
    category: "dataset",
    label: "Egen CSV (skelett)",
    description:
      "Generisk CSV-loader. Du fyller selv inn sti og target-kolonne. Definerer numeriske/kategoriske kolonner.",
    contributes: {
      imports: ["import pandas as pd"],
      dataset: `# === Last inn egen CSV ===
# TODO: pek på din egen fil og target-kolonne
CSV_PATH = "data/min_fil.csv"
TARGET_COL = "label"

df = pd.read_csv(CSV_PATH)
y = df[TARGET_COL]
X = df.drop(columns=[TARGET_COL])

# TODO: juster disse to listene etter din CSV
NUMERIC_COLS = X.select_dtypes(include="number").columns.tolist()
CATEGORICAL_COLS = X.select_dtypes(exclude="number").columns.tolist()
print("X.shape =", X.shape, "y klasser:", sorted(y.unique()))`,
      datasetInfo: {
        isPandas: true,
        numericCols: ["__DYN_NUMERIC__"],
        categoricalCols: ["__DYN_CATEGORICAL__"],
        binary: false,
      },
    },
  },

  // =============== PREPROCESSORS =======================================
  {
    id: "pre-standard",
    category: "preprocessor",
    label: "StandardScaler",
    description: "Sentrering + skalering til enhetsvarians. Trengs for SVC, KNN, MLP.",
    defaultOn: true,
    contributes: {
      imports: ["from sklearn.preprocessing import StandardScaler"],
      preprocSteps: [{ name: "scaler", expr: "StandardScaler()" }],
    },
  },
  {
    id: "pre-minmax",
    category: "preprocessor",
    label: "MinMaxScaler",
    description: "Skalerer til [0, 1]. Alternativ til StandardScaler.",
    conflicts: ["pre-standard"],
    contributes: {
      imports: ["from sklearn.preprocessing import MinMaxScaler"],
      preprocSteps: [{ name: "scaler", expr: "MinMaxScaler()" }],
    },
  },
  {
    id: "pre-onehot",
    category: "preprocessor",
    label: "OneHotEncoder for kategoriske",
    description: "Konverterer 'Sex', 'Embarked' osv. til dummy-kolonner.",
    contributes: {
      imports: ["from sklearn.preprocessing import OneHotEncoder"],
    },
  },
  {
    id: "pre-impute-mean",
    category: "preprocessor",
    label: "SimpleImputer (mean) for numeriske",
    description: "Fyller NaN i numeriske kolonner med kolonnens snitt.",
    conflicts: ["pre-impute-median"],
    contributes: {
      imports: ["from sklearn.impute import SimpleImputer"],
    },
  },
  {
    id: "pre-impute-median",
    category: "preprocessor",
    label: "SimpleImputer (median) for numeriske",
    description: "Robust mot uteliggere. Fyller NaN med median.",
    contributes: {
      imports: ["from sklearn.impute import SimpleImputer"],
    },
  },
  {
    id: "pre-column-transformer",
    category: "preprocessor",
    label: "ColumnTransformer (numeriske + kategoriske)",
    description:
      "Pakker numerisk pipeline (imputer + scaler) og kategorisk pipeline (imputer + OneHot) i ÉN preprocessor.",
    contributes: {
      imports: [
        "from sklearn.compose import ColumnTransformer",
        "from sklearn.pipeline import Pipeline",
      ],
    },
  },

  // =============== MODELL (radio) ======================================
  {
    id: "model-logreg",
    category: "model",
    label: "LogisticRegression",
    description: "Lineær baseline. Rask, tolkbar. Bra start for binær klassifikasjon.",
    defaultOn: true,
    contributes: {
      imports: ["from sklearn.linear_model import LogisticRegression"],
      modelExpr: "LogisticRegression(max_iter=1000, random_state=42)",
      paramGrid: `{
    "model__C": [0.01, 0.1, 1.0, 10.0],
    "model__penalty": ["l2"],
}`,
    },
  },
  {
    id: "model-rf",
    category: "model",
    label: "RandomForestClassifier",
    description: "Ensemble av beslutningstrær. Solid default for tabulær data.",
    contributes: {
      imports: ["from sklearn.ensemble import RandomForestClassifier"],
      modelExpr: "RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)",
      paramGrid: `{
    "model__n_estimators": [100, 200, 400],
    "model__max_depth": [None, 5, 10, 20],
    "model__min_samples_split": [2, 5, 10],
}`,
    },
  },
  {
    id: "model-knn",
    category: "model",
    label: "KNeighborsClassifier",
    description: "Avstandsbasert. Krever skalerte features.",
    contributes: {
      imports: ["from sklearn.neighbors import KNeighborsClassifier"],
      modelExpr: "KNeighborsClassifier(n_neighbors=5)",
      paramGrid: `{
    "model__n_neighbors": [3, 5, 7, 11, 15],
    "model__weights": ["uniform", "distance"],
}`,
    },
  },
  {
    id: "model-svc",
    category: "model",
    label: "SVC (kernel=rbf)",
    description: "Support Vector Classifier. probability=True for ROC-AUC.",
    contributes: {
      imports: ["from sklearn.svm import SVC"],
      modelExpr: "SVC(kernel='rbf', probability=True, random_state=42)",
      paramGrid: `{
    "model__C": [0.1, 1.0, 10.0],
    "model__gamma": ["scale", 0.01, 0.1, 1.0],
}`,
    },
  },
  {
    id: "model-gnb",
    category: "model",
    label: "GaussianNB",
    description: "Naive Bayes — antar normalfordelte features. Rask baseline.",
    contributes: {
      imports: ["from sklearn.naive_bayes import GaussianNB"],
      modelExpr: "GaussianNB()",
      paramGrid: `{
    "model__var_smoothing": [1e-9, 1e-8, 1e-7],
}`,
    },
  },
  {
    id: "model-mlp",
    category: "model",
    label: "MLPClassifier",
    description: "Lite neuralt nett. Lengre treningstid; trenger skalering.",
    contributes: {
      imports: ["from sklearn.neural_network import MLPClassifier"],
      modelExpr:
        "MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=500, random_state=42)",
      paramGrid: `{
    "model__hidden_layer_sizes": [(32,), (64, 32), (128, 64)],
    "model__alpha": [1e-4, 1e-3, 1e-2],
}`,
    },
  },

  // =============== TRAIN/TEST-SPLIT ====================================
  {
    id: "split-stratify-20",
    category: "split",
    label: "test_size=0.2, stratify=y",
    description: "Default — bevarer klassebalansen i test-settet.",
    defaultOn: true,
    conflicts: ["split-stratify-30", "split-nostratify-20", "split-nostratify-30"],
    contributes: {
      imports: ["from sklearn.model_selection import train_test_split"],
      splitBlock: `X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)`,
    },
  },
  {
    id: "split-stratify-30",
    category: "split",
    label: "test_size=0.3, stratify=y",
    description: "Større test-sett, samme stratifisering.",
    conflicts: ["split-stratify-20", "split-nostratify-20", "split-nostratify-30"],
    contributes: {
      imports: ["from sklearn.model_selection import train_test_split"],
      splitBlock: `X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42, stratify=y
)`,
    },
  },
  {
    id: "split-nostratify-20",
    category: "split",
    label: "test_size=0.2, ingen stratify",
    description: "Tilfeldig split uten klassebalanse.",
    conflicts: ["split-stratify-20", "split-stratify-30", "split-nostratify-30"],
    contributes: {
      imports: ["from sklearn.model_selection import train_test_split"],
      splitBlock: `X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)`,
    },
  },
  {
    id: "split-nostratify-30",
    category: "split",
    label: "test_size=0.3, ingen stratify",
    description: "Tilfeldig split, større test-sett.",
    conflicts: ["split-stratify-20", "split-stratify-30", "split-nostratify-20"],
    contributes: {
      imports: ["from sklearn.model_selection import train_test_split"],
      splitBlock: `X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)`,
    },
  },

  // =============== KRYSSVALIDERING =====================================
  {
    id: "cv-stratified-kfold",
    category: "cv",
    label: "StratifiedKFold (k=5)",
    description: "Bevarer klassebalanse i hver fold. Default for klassifikasjon.",
    conflicts: ["cv-timeseries", "cv-groupkfold"],
    contributes: {
      imports: ["from sklearn.model_selection import StratifiedKFold"],
      cvBlock: "cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)",
    },
  },
  {
    id: "cv-timeseries",
    category: "cv",
    label: "TimeSeriesSplit",
    description: "Tids-respekterende split. Test alltid etter trening i tid.",
    conflicts: ["cv-stratified-kfold", "cv-groupkfold"],
    contributes: {
      imports: ["from sklearn.model_selection import TimeSeriesSplit"],
      cvBlock: "cv = TimeSeriesSplit(n_splits=5)",
    },
  },
  {
    id: "cv-groupkfold",
    category: "cv",
    label: "GroupKFold",
    description: "Holder grupper (f.eks. pasient-ID) sammen i én fold.",
    conflicts: ["cv-stratified-kfold", "cv-timeseries"],
    contributes: {
      imports: ["from sklearn.model_selection import GroupKFold"],
      cvBlock: `cv = GroupKFold(n_splits=5)
# NB: trenger groups-array på samme lengde som X — fyll inn selv
groups = None  # f.eks. df["pasient_id"].values`,
    },
  },

  // =============== HYPERPARAMETER-TUNING ===============================
  {
    id: "tune-grid",
    category: "tuning",
    label: "GridSearchCV",
    description: "Uttømmende søk over param_grid for valgt modell.",
    requires: ["cv-stratified-kfold"],
    conflicts: ["tune-random"],
    contributes: {
      imports: ["from sklearn.model_selection import GridSearchCV"],
      tuningBlock: `# === Hyperparameter-søk (Grid) ===
search = GridSearchCV(pipe, param_grid=PARAM_GRID, cv=cv, scoring="accuracy", n_jobs=-1)
search.fit(X_train, y_train)
print("Beste parametre:", search.best_params_)
print("Beste CV-score:", round(search.best_score_, 4))
pipe = search.best_estimator_`,
    },
  },
  {
    id: "tune-random",
    category: "tuning",
    label: "RandomizedSearchCV",
    description: "Tilfeldig søk — raskere ved stort param-rom.",
    requires: ["cv-stratified-kfold"],
    conflicts: ["tune-grid"],
    contributes: {
      imports: ["from sklearn.model_selection import RandomizedSearchCV"],
      tuningBlock: `# === Hyperparameter-søk (Randomized) ===
search = RandomizedSearchCV(
    pipe, param_distributions=PARAM_GRID, n_iter=20,
    cv=cv, scoring="accuracy", random_state=42, n_jobs=-1,
)
search.fit(X_train, y_train)
print("Beste parametre:", search.best_params_)
print("Beste CV-score:", round(search.best_score_, 4))
pipe = search.best_estimator_`,
    },
  },

  // =============== EVALUERING ==========================================
  {
    id: "eval-accuracy",
    category: "eval",
    label: "Accuracy",
    description: "Andel riktig predikert. Enkel start-metrikk.",
    defaultOn: true,
    contributes: {
      imports: ["from sklearn.metrics import accuracy_score"],
      evalBlocks: [
        `acc = accuracy_score(y_test, y_pred)
print(f"Accuracy: {acc:.4f}")`,
      ],
    },
  },
  {
    id: "eval-classification-report",
    category: "eval",
    label: "classification_report",
    description: "Precision/recall/F1 per klasse + macro/weighted snitt.",
    defaultOn: true,
    contributes: {
      imports: ["from sklearn.metrics import classification_report"],
      evalBlocks: [
        `print("\\n=== classification_report ===")
print(classification_report(y_test, y_pred, digits=3))`,
      ],
    },
  },
  {
    id: "eval-confusion",
    category: "eval",
    label: "confusion_matrix",
    description: "Matrise (sann × predikert) — viser hvor modellen forveksler.",
    contributes: {
      imports: ["from sklearn.metrics import confusion_matrix"],
      evalBlocks: [
        `cm = confusion_matrix(y_test, y_pred)
print("\\n=== confusion_matrix ===")
print(cm)`,
      ],
    },
  },
  {
    id: "eval-roc-auc",
    category: "eval",
    label: "ROC-AUC (kun binær)",
    description: "Areal under ROC. Krever binær target og predict_proba.",
    contributes: {
      imports: ["from sklearn.metrics import roc_auc_score"],
      evalBlocks: [
        `# ROC-AUC krever sannsynligheter for positiv klasse
if hasattr(pipe, "predict_proba") and len(set(y_test)) == 2:
    y_proba = pipe.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, y_proba)
    print(f"ROC-AUC: {auc:.4f}")
else:
    print("ROC-AUC hoppet over (ikke binær eller mangler predict_proba)")`,
      ],
    },
  },
  {
    id: "eval-cross-val-score",
    category: "eval",
    label: "cross_val_score (5-fold)",
    description: "Rapporterer gjennomsnittlig CV-score med std.",
    contributes: {
      imports: ["from sklearn.model_selection import cross_val_score"],
      evalBlocks: [
        `cv_scores = cross_val_score(pipe, X_train, y_train, cv=5, scoring="accuracy", n_jobs=-1)
print(f"\\ncross_val_score: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")`,
      ],
    },
  },

  // =============== OUTPUT-FORMAT =======================================
  {
    id: "out-print",
    category: "output",
    label: "Bare print til stdout",
    description: "Ingen ekstra — alt går rett til konsollen.",
    defaultOn: true,
    contributes: {},
  },
  {
    id: "out-dataframe",
    category: "output",
    label: "pandas-DataFrame med resultater",
    description: "Lager en results_df med modell, accuracy, CV-mean, CV-std.",
    contributes: {
      imports: ["import pandas as pd"],
      outputBlocks: [
        `# === Samle resultatene i en DataFrame ===
results = {
    "model": [type(pipe.named_steps["model"]).__name__],
    "test_accuracy": [round(accuracy_score(y_test, y_pred), 4) if "accuracy_score" in dir() else None],
}
results_df = pd.DataFrame(results)
print("\\n=== Resultater (DataFrame) ===")
print(results_df.to_string(index=False))`,
      ],
    },
  },
  {
    id: "out-plots",
    category: "output",
    label: "matplotlib-plots (confusion + ROC)",
    description: "Tegner confusion matrix og — hvis binær — ROC-kurve.",
    contributes: {
      imports: [
        "import matplotlib.pyplot as plt",
        "from sklearn.metrics import ConfusionMatrixDisplay",
      ],
      outputBlocks: [
        `# === Plot: confusion matrix ===
fig, ax = plt.subplots(figsize=(5, 4))
ConfusionMatrixDisplay.from_predictions(y_test, y_pred, ax=ax)
ax.set_title("Confusion matrix")
plt.tight_layout()
plt.show()

# === Plot: ROC-kurve (kun binær) ===
if hasattr(pipe, "predict_proba") and len(set(y_test)) == 2:
    from sklearn.metrics import RocCurveDisplay
    fig, ax = plt.subplots(figsize=(5, 4))
    RocCurveDisplay.from_estimator(pipe, X_test, y_test, ax=ax)
    ax.set_title("ROC-kurve")
    plt.tight_layout()
    plt.show()`,
      ],
    },
  },
];
