// Porteføljeløp som speiler DTE-2602 sin mappevurdering (16.12.2026).
// To spor, hver med 5 steg-oppgaver. Hver oppgave har starter-kode, fasit,
// hint og en deterministisk "expected_output"-streng som PortfolioRunner
// sammenligner programmets stdout mot for å gi rask feedback.

export interface PortfolioStep {
  /** Stable id used for progress lagring. */
  id: string;
  /** Short label vist i nav. */
  shortTitle: string;
  /** Full title for header. */
  title: string;
  /** What the student should do — markdown-ish plain text. */
  brief: string;
  /** Starter code shown in the editor. */
  starter: string;
  /** Reference solution shown after submit / hint-use. */
  solution: string;
  /** Optional setup code prepended before user code. */
  setup?: string;
  /** Hints surfaced one at a time. */
  hints?: string[];
  /** Substring (or list of substrings) that MUST appear in stdout for the step
   *  to be considered solved. Use deterministic prints like "FASIT: 0.95". */
  expectedOutputs: string[];
}

export interface PortfolioTrack {
  slug: "dataset-analyse" | "ml-pipeline";
  title: string;
  subtitle: string;
  intro: string;
  steps: PortfolioStep[];
}

/* =====================================================================
 * SPOR A — Dataset-analyse + visualisering
 * ===================================================================== */

const SPOR_A: PortfolioTrack = {
  slug: "dataset-analyse",
  title: "Spor A · Dataset-analyse",
  subtitle: "Last data → rens → visualiser → tolk → konkluder",
  intro:
    "Du skal bygge en EDA-rapport på wine-datasettet (sklearn). Hvert steg leverer en " +
    "del av rapporten. Print 'FASIT: ...'-linjer slik vi spør om — det er det " +
    "fasit-sjekkeren ser etter.",
  steps: [
    {
      id: "spor-a-1",
      shortTitle: "1. Last data",
      title: "Steg 1 — Last data og beskriv strukturen",
      brief:
        "Bruk load_wine fra sklearn. Print shape, antall klasser, og klassebalansen. " +
        "Avslutt med en linje på formen 'FASIT: shape=(<r>, <c>), klasser=<k>'.",
      starter: `from sklearn.datasets import load_wine

wine = load_wine(as_frame=True)
df = wine.frame

# TODO:
# 1) print df.shape
# 2) print df["target"].nunique()
# 3) avslutt med:
#    print(f"FASIT: shape=({df.shape[0]}, {df.shape[1]}), klasser={df['target'].nunique()}")
`,
      solution: `from sklearn.datasets import load_wine
wine = load_wine(as_frame=True)
df = wine.frame
print(df.shape)
print(df["target"].nunique())
print(f"FASIT: shape=({df.shape[0]}, {df.shape[1]}), klasser={df['target'].nunique()}")
`,
      hints: [
        "df.shape gir en tuple (rader, kolonner).",
        "df['target'].nunique() returnerer antall unike klasser.",
        "Bruk f-string for å bygge fasit-linjen nøyaktig som spørt.",
      ],
      expectedOutputs: ["FASIT: shape=(178, 14), klasser=3"],
    },
    {
      id: "spor-a-2",
      shortTitle: "2. Rens",
      title: "Steg 2 — Sjekk og rens manglende verdier",
      brief:
        "Sjekk df.isna().sum().sum() — det totale antall NaN på tvers av kolonner. " +
        "Print 'FASIT: nan=<antall>'. (Wine har ingen — så fasit blir 0.)",
      starter: `from sklearn.datasets import load_wine
wine = load_wine(as_frame=True)
df = wine.frame

# TODO: print totalt antall NaN
# print(f"FASIT: nan={...}")
`,
      solution: `from sklearn.datasets import load_wine
wine = load_wine(as_frame=True)
df = wine.frame
total = int(df.isna().sum().sum())
print(f"FASIT: nan={total}")
`,
      hints: [
        "df.isna() returnerer en bool-DataFrame.",
        "Kjededer to .sum() for å få totalsum: kolonnesum først, så sum av kolonnesummene.",
      ],
      expectedOutputs: ["FASIT: nan=0"],
    },
    {
      id: "spor-a-3",
      shortTitle: "3. Visualisér",
      title: "Steg 3 — Beregn korrelasjon og finn topp-par",
      brief:
        "Beregn korrelasjonsmatrisen for alle features (uten target). Finn paret av features " +
        "med høyest absolutt korrelasjon (≠ 1.0). Print 'FASIT: topp=<feature_a>+<feature_b>, r=<verdi>'.",
      starter: `from sklearn.datasets import load_wine
import numpy as np

wine = load_wine(as_frame=True)
df = wine.frame.drop(columns=["target"])
corr = df.corr().abs()

# TODO: maskér diagonalen (ellers blir svaret 1.0), finn maks, print fasit
`,
      solution: `from sklearn.datasets import load_wine
import numpy as np

wine = load_wine(as_frame=True)
df = wine.frame.drop(columns=["target"])
corr = df.corr().abs()
np.fill_diagonal(corr.values, 0)
flat = corr.unstack().sort_values(ascending=False)
a, b = flat.index[0]
r = round(flat.iloc[0], 3)
print(f"FASIT: topp={a}+{b}, r={r}")
`,
      hints: [
        "np.fill_diagonal(corr.values, 0) maskér selvkorrelasjon (1.0).",
        "corr.unstack() flattens DataFrame til Series med multi-index.",
        "sort_values(ascending=False).index[0] gir paret med høyest verdi.",
      ],
      // Match the actual top correlation in load_wine — Flavanoids/Total phenols ≈ 0.86.
      expectedOutputs: ["FASIT: topp="],
    },
    {
      id: "spor-a-4",
      shortTitle: "4. Tolk",
      title: "Steg 4 — Tolk klassevise gjennomsnitt",
      brief:
        "Beregn gjennomsnittet av 'alcohol' per klasse. Print 'FASIT: maks_klasse=<klasse>' " +
        "der maks_klasse er den klassen med høyest alcohol-gjennomsnitt.",
      starter: `from sklearn.datasets import load_wine
wine = load_wine(as_frame=True)
df = wine.frame

# TODO: gruppér per target, ta mean på alcohol, finn idxmax
`,
      solution: `from sklearn.datasets import load_wine
wine = load_wine(as_frame=True)
df = wine.frame
means = df.groupby("target")["alcohol"].mean()
print(means.round(3))
print(f"FASIT: maks_klasse={int(means.idxmax())}")
`,
      hints: [
        "df.groupby('target')['alcohol'].mean() gir snitt per klasse.",
        "Series.idxmax() returnerer index-verdien (klassen) med høyest verdi.",
      ],
      expectedOutputs: ["FASIT: maks_klasse=0"],
    },
    {
      id: "spor-a-5",
      shortTitle: "5. Konkluder",
      title: "Steg 5 — Konkluder med EDA-oppsummering",
      brief:
        "Lag en kort konklusjon i kode: print en streng som inneholder alle tre faktaene " +
        "fra forrige steg. Eksakt format: " +
        "'FASIT: rader=178, klasser=3, beste_par=Flavanoids+Total phenols'. " +
        "(Hvis ditt par er litt annerledes p.g.a. flyttallspresisjon, fungerer det også.)",
      starter: `# TODO: print en oppsummerings-streng som starter med "FASIT: rader=178, klasser=3, beste_par="
`,
      solution: `print("FASIT: rader=178, klasser=3, beste_par=Flavanoids+Total phenols")
`,
      hints: [
        "Det er meningen at du leverer dette manuelt etter å ha sett tallene i steg 1-3.",
      ],
      expectedOutputs: ["FASIT: rader=178, klasser=3, beste_par="],
    },
  ],
};

/* =====================================================================
 * SPOR B — ML-pipeline med evaluering
 * ===================================================================== */

const SPOR_B: PortfolioTrack = {
  slug: "ml-pipeline",
  title: "Spor B · ML-pipeline",
  subtitle: "Bygg pipeline → split → tren → evaluer → tune",
  intro:
    "Du skal bygge en ende-til-ende pipeline for å klassifisere wine. Hvert steg utvider " +
    "forrige. Print 'FASIT: ...'-linjer der det blir spurt.",
  steps: [
    {
      id: "spor-b-1",
      shortTitle: "1. Pipeline",
      title: "Steg 1 — Bygg Pipeline med scaler + LogReg",
      brief:
        "Lag en sklearn Pipeline med StandardScaler og LogisticRegression(max_iter=1000). " +
        "Print 'FASIT: pipeline=OK, steps=2' når den er bygget.",
      starter: `from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

# TODO: bygg pipe = Pipeline([("sc", ...), ("clf", ...)])
# print "FASIT: pipeline=OK, steps=2"
`,
      solution: `from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

pipe = Pipeline([("sc", StandardScaler()), ("clf", LogisticRegression(max_iter=1000))])
print(f"FASIT: pipeline=OK, steps={len(pipe.steps)}")
`,
      hints: [
        "Pipeline tar en liste av (navn, transformer)-tupler.",
        "len(pipe.steps) gir antall steg.",
      ],
      expectedOutputs: ["FASIT: pipeline=OK, steps=2"],
    },
    {
      id: "spor-b-2",
      shortTitle: "2. Split",
      title: "Steg 2 — Stratifisert train/test-split",
      brief:
        "Last wine og split med test_size=0.2, stratify=y, random_state=42. " +
        "Print 'FASIT: n_train=<antall>, n_test=<antall>'.",
      starter: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split

X, y = load_wine(return_X_y=True)

# TODO: split, print fasit
`,
      solution: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split

X, y = load_wine(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
print(f"FASIT: n_train={len(X_tr)}, n_test={len(X_te)}")
`,
      hints: [
        "test_size=0.2 gir 20 % i test-settet.",
        "stratify=y bevarer klassebalansen.",
      ],
      expectedOutputs: ["FASIT: n_train=142, n_test=36"],
    },
    {
      id: "spor-b-3",
      shortTitle: "3. Tren",
      title: "Steg 3 — Tren pipeline og predikt",
      brief:
        "Tren pipeline-en fra steg 1 på train-settet, predikt på test. " +
        "Print 'FASIT: test_acc=<verdi>' avrundet til 3 desimaler.",
      starter: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

X, y = load_wine(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
pipe = Pipeline([("sc", StandardScaler()), ("clf", LogisticRegression(max_iter=1000))])

# TODO: fit + score, print fasit
`,
      solution: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

X, y = load_wine(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
pipe = Pipeline([("sc", StandardScaler()), ("clf", LogisticRegression(max_iter=1000))])
pipe.fit(X_tr, y_tr)
acc = pipe.score(X_te, y_te)
print(f"FASIT: test_acc={round(acc, 3)}")
`,
      hints: [
        "pipe.fit(X_tr, y_tr) trener alle stegene.",
        "pipe.score(X_te, y_te) returnerer accuracy som default.",
      ],
      // Will be very close to 1.0 for wine + LogReg
      expectedOutputs: ["FASIT: test_acc="],
    },
    {
      id: "spor-b-4",
      shortTitle: "4. Evaluér",
      title: "Steg 4 — Evaluér med F1 macro og confusion matrix",
      brief:
        "Bruk samme modell. Beregn f1_score(macro) og print confusion_matrix. " +
        "Print 'FASIT: f1_macro=<verdi>' (3 desimaler).",
      starter: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score, confusion_matrix

X, y = load_wine(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
pipe = Pipeline([("sc", StandardScaler()), ("clf", LogisticRegression(max_iter=1000))])
pipe.fit(X_tr, y_tr)
pred = pipe.predict(X_te)

# TODO: print confusion_matrix(y_te, pred)
# TODO: print f"FASIT: f1_macro={round(f1_score(y_te, pred, average='macro'), 3)}"
`,
      solution: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score, confusion_matrix

X, y = load_wine(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
pipe = Pipeline([("sc", StandardScaler()), ("clf", LogisticRegression(max_iter=1000))])
pipe.fit(X_tr, y_tr)
pred = pipe.predict(X_te)
print(confusion_matrix(y_te, pred))
print(f"FASIT: f1_macro={round(f1_score(y_te, pred, average='macro'), 3)}")
`,
      hints: [
        "f1_score(y_te, pred, average='macro') gir uvektet snitt per klasse.",
        "confusion_matrix returnerer en (k, k)-array med faktisk på rader, predikert på kolonner.",
      ],
      expectedOutputs: ["FASIT: f1_macro="],
    },
    {
      id: "spor-b-5",
      shortTitle: "5. Tune",
      title: "Steg 5 — GridSearchCV over C",
      brief:
        "Tune LogisticRegression sin C-parameter med GridSearchCV (cv=5) over [0.01, 0.1, 1, 10]. " +
        "Print 'FASIT: best_C=<verdi>'.",
      starter: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

X, y = load_wine(return_X_y=True)
X_tr, _, y_tr, _ = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
pipe = Pipeline([("sc", StandardScaler()), ("clf", LogisticRegression(max_iter=1000))])

# TODO: GridSearchCV, fit på (X_tr, y_tr), print best_params_['clf__C']
`,
      solution: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

X, y = load_wine(return_X_y=True)
X_tr, _, y_tr, _ = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
pipe = Pipeline([("sc", StandardScaler()), ("clf", LogisticRegression(max_iter=1000))])
gs = GridSearchCV(pipe, {"clf__C": [0.01, 0.1, 1, 10]}, cv=5)
gs.fit(X_tr, y_tr)
print(f"FASIT: best_C={gs.best_params_['clf__C']}")
`,
      hints: [
        "Grid-nøkkelen er 'clf__C' fordi step-navnet er 'clf' og parameteret er 'C'.",
        "gs.best_params_ er en dict.",
      ],
      expectedOutputs: ["FASIT: best_C="],
    },
  ],
};

export const DTE2602_PORTFOLIO_TRACKS: PortfolioTrack[] = [SPOR_A, SPOR_B];

export function getTrack(slug: string): PortfolioTrack | undefined {
  return DTE2602_PORTFOLIO_TRACKS.find((t) => t.slug === slug);
}
