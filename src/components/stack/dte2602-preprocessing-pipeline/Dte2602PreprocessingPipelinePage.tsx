import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {Lightbulb, ArrowLeft, Info } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { NotebookCell } from "@/components/stack/NotebookCell";

const STEPS = [
  { title: "Hvorfor preprocessing?", anchor: "hvorfor" },
  { title: "StandardScaler", anchor: "scaler" },
  { title: "OneHotEncoder", anchor: "ohe" },
  { title: "ColumnTransformer", anchor: "ct" },
  { title: "Pipeline — limet", anchor: "pipeline" },
  { title: "Datalekkasje — den klassiske bommen", anchor: "leak" },
  { title: "Interaktiv: før/etter skalering", anchor: "interactive-scale" },
  { title: "Interaktiv: datalekkasje-knapp", anchor: "interactive-leak" },
];

export function Dte2602PreprocessingPipelinePage() {
  return (
    <StackPageShell title="DTE-2602 · Preprocessing & Pipeline" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Preprocessing
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Preprocessing &amp; Pipeline — gjør dataen modellklar
          </h1>
          <p className="mt-3 text-muted-foreground">
            Rå data passer sjelden direkte inn i en modell. Numeriske features må
            ofte skaleres, kategoriske må kodes til tall, og hele prosessen må
            pakkes i en <code>Pipeline</code> så ingenting lekker fra test til train.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Praktisk:</span>{" "}
              <Link to="/python" className="text-brand hover:underline">/python</Link>{" "}
              har kjørbare eksempler med <code>Pipeline</code> +{" "}
              <code>ColumnTransformer</code> + <code>GridSearchCV</code>.
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-start gap-3">
            <Info className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Alle kodeblokker er kjørbare</span> — trykk{" "}
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-card text-[10px]">Kjør</kbd>{" "}
              (eller <kbd className="px-1.5 py-0.5 rounded border border-border bg-card text-[10px]">⌘/Ctrl + Enter</kbd>)
              for å eksekvere i nettleseren. Første kjøring laster Pyodide (~10 MB);
              etter det er det instant. Rediger koden, eksperimenter, kopier til ditt eget program.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2602-preprocessing-pipeline" steps={STEPS} />

        <Section number="1" id="hvorfor" title="Hvorfor preprocessing?">
          <p className="text-sm text-foreground mb-3">
            Tre konkrete grunner:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
            <li>
              <strong>Skala:</strong> en feature i kroner (1 000–500 000) vil
              dominere én i prosent (0–100) i avstandsbaserte modeller (kNN,
              k-means, SVM med RBF-kernel) og gradient-baserte (logistisk
              regresjon, nevrale nett konvergerer raskere).
            </li>
            <li>
              <strong>Type:</strong> sklearn-modeller tar bare tall. Kategoriske
              kolonner (<code>"by" ∈ {"{Tromsø, Oslo, Bodø}"}</code>) må kodes —
              vanligvis med one-hot.
            </li>
            <li>
              <strong>Manglende verdier:</strong> de fleste sklearn-modeller
              feiler hardt på NaN. Du må imputere før modellen ser dataene.
            </li>
          </ul>
        </Section>

        <Section number="2" id="scaler" title="StandardScaler — null-snitt, én std.avvik">
          <NotebookCell
            requires={["scikit-learn", "numpy"]}
            setup={`import numpy as np
# Lite eksempel-datasett: høyde (cm) og vekt (kg)
X_train = np.array([[180, 80], [165, 60], [190, 95], [172, 70], [155, 50]])
X_test  = np.array([[178, 75], [168, 62]])`}
            code={`from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled  = scaler.transform(X_test)   # <-- bare transform!

# Hva StandardScaler gjør per kolonne:
#   x_skalert = (x - mean) / std
# Etter dette: hver kolonne har mean=0, std=1.

print("Snitt per kolonne (train):", scaler.mean_)
print("Std per kolonne (train):  ", scaler.scale_)
print()
print("X_train_scaled =")
print(X_train_scaled.round(2))
print()
print("Verifiser: snitt ≈ 0, std ≈ 1")
print("  mean:", X_train_scaled.mean(axis=0).round(3))
print("  std: ", X_train_scaled.std(axis=0).round(3))`}
          />
          <p className="text-sm text-muted-foreground mt-3">
            Alternativer: <code>MinMaxScaler</code> (skalerer til [0, 1] — bra
            når du vet at dataen ikke har lange haler),{" "}
            <code>RobustScaler</code> (bruker median + IQR — robust mot outliers).
          </p>
        </Section>

        <Section number="3" id="ohe" title="OneHotEncoder — kategorier til tall">
          <NotebookCell
            requires={["scikit-learn", "numpy"]}
            code={`from sklearn.preprocessing import OneHotEncoder
import numpy as np

byer = np.array([["Tromsø"], ["Oslo"], ["Bodø"], ["Tromsø"], ["Oslo"]])

ohe = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
kodet = ohe.fit_transform(byer)

print("Kategorier (alfabetisk):", ohe.categories_[0])
print()
print("One-hot-matrise:")
print(kodet)
print()
print("Forklart per rad:")
for by, rad in zip(byer.ravel(), kodet):
    print(f"  {by:8} → {rad}")

# 'drop="first"' fjerner én kolonne for å unngå
# multikollinearitet (sum av kolonner = 1 alltid).`}
          />
          <p className="text-sm text-muted-foreground mt-3">
            For ordnede kategorier (low/medium/high) bruk{" "}
            <code>OrdinalEncoder</code>. For kategorier med veldig høy kardinalitet
            (10 000 unike) er one-hot upraktisk — bruk target-encoding eller embeddings.
          </p>
        </Section>

        <Section number="4" id="ct" title="ColumnTransformer — én pipeline per kolonnetype">
          <NotebookCell
            requires={["scikit-learn", "pandas", "numpy"]}
            code={`import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline

# Titanic-aktig miniature
df = pd.DataFrame({
    "Age":      [22.0, 38.0, np.nan, 35.0, 28.0, np.nan],
    "Fare":     [7.25, 71.28, 7.92, 53.10, 8.05, 13.00],
    "Sex":      ["male", "female", "female", "female", "male", "male"],
    "Embarked": ["S", "C", "S", "S", None, "Q"],
})
print("Input:"); print(df); print()

num_cols = ["Age", "Fare"]
cat_cols = ["Sex", "Embarked"]

num_pipe = Pipeline([
    ("imp", SimpleImputer(strategy="median")),
    ("sc",  StandardScaler()),
])
cat_pipe = Pipeline([
    ("imp", SimpleImputer(strategy="most_frequent")),
    ("ohe", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
])

prep = ColumnTransformer([
    ("num", num_pipe, num_cols),
    ("cat", cat_pipe, cat_cols),
])

ut = prep.fit_transform(df)
kolonner = prep.get_feature_names_out()

print("Etter ColumnTransformer:")
print(pd.DataFrame(ut, columns=kolonner).round(2))`}
          />
          <p className="text-sm text-muted-foreground mt-3">
            Resultat: én transformer som tar et helt DataFrame og spytter ut en
            matrise med skalerte numeriske kolonner + one-hot-kodede kategoriske,
            klar for modellen.
          </p>
        </Section>

        <Section number="5" id="pipeline" title="Pipeline — limet">
          <NotebookCell
            requires={["scikit-learn", "pandas", "numpy"]}
            code={`import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split

# Minisett der "fare" og "sex" forklarer "survived"
rng = np.random.default_rng(0)
n = 200
df = pd.DataFrame({
    "Age":      rng.normal(30, 12, n).round(1),
    "Fare":     rng.exponential(30, n).round(2),
    "Sex":      rng.choice(["male", "female"], n),
    "Embarked": rng.choice(["S", "C", "Q"], n),
})
y = ((df["Sex"] == "female") & (df["Fare"] > 20)).astype(int)

X_train, X_test, y_train, y_test = train_test_split(
    df, y, test_size=0.3, random_state=42)

# ColumnTransformer (samme som steg 4)
prep = ColumnTransformer([
    ("num", Pipeline([("sc", StandardScaler())]), ["Age", "Fare"]),
    ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), ["Sex", "Embarked"]),
])

clf = Pipeline([
    ("prep", prep),
    ("model", LogisticRegression(max_iter=1000)),
])

clf.fit(X_train, y_train)        # alle stegene fit-es på train
acc = clf.score(X_test, y_test)
print(f"Test-accuracy: {acc:.3f}")
print("First 5 predictions:", clf.predict(X_test.head()).tolist())
print("Modellen kan nå serialiseres med joblib.dump(clf, 'model.pkl')")`}
          />
          <p className="text-sm text-muted-foreground mt-3">
            <strong>Hvorfor pipeline?</strong> Tre konkrete grunner:
          </p>
          <ol className="text-sm text-muted-foreground list-decimal pl-5 mt-2 space-y-1">
            <li>Du kan ikke ved en feil lekke test-statistikk inn i train.</li>
            <li>
              Hyperparameter-søk (<code>GridSearchCV</code>) kan tune ALLE stegene
              samtidig: <code>{"prep__num__imp__strategy"}</code>,{" "}
              <code>{"model__C"}</code>.
            </li>
            <li>
              Når du deployer modellen er det <em>én</em> objekt å lagre —{" "}
              <code>joblib.dump(clf, "model.pkl")</code>.
            </li>
          </ol>
        </Section>

        <Section number="6" id="leak" title="Datalekkasje — den klassiske bommen">
          <p className="text-sm text-muted-foreground mb-3">
            <strong>Definisjonen:</strong> når informasjon fra test-settet sniker
            seg inn i treningen, og test-scoren blir kunstig høy. Den enkleste
            varianten er å skalere hele datasettet før split:
          </p>
          <div className="space-y-4">
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/5 p-4">
              <div className="text-xs uppercase tracking-wider text-rose-400 font-semibold mb-2">
                FEIL — lekker (kjør og se for-høy accuracy)
              </div>
              <NotebookCell
                requires={["scikit-learn", "numpy"]}
                setup={`from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
X, y = make_classification(n_samples=100, n_features=10, n_informative=5, random_state=42)`}
                code={`scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)   # <-- ser ALLE rader, inkl. test
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=0)

lr = LogisticRegression(max_iter=1000)
lr.fit(X_train, y_train)
print(f"Test-accuracy (LEKKER): {lr.score(X_test, y_test):.3f}")
print("Scaler-en har sett mean/std fra hele datasettet → for høy score.")`}
              />
              <p className="text-xs text-rose-400/80 mt-2">
                Scaler-en har sett gjennomsnitt og std fra <em>hele</em> X,
                inkludert testradene. Test-scoren blir for høy.
              </p>
            </div>
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4">
              <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-2">
                RIKTIG — split først, scaler i pipeline
              </div>
              <NotebookCell
                requires={["scikit-learn", "numpy"]}
                setup={`from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
X, y = make_classification(n_samples=100, n_features=10, n_informative=5, random_state=42)`}
                code={`X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=0)

clf = Pipeline([
    ("sc", StandardScaler()),
    ("lr", LogisticRegression(max_iter=1000)),
])
clf.fit(X_train, y_train)
print(f"Test-accuracy (RIKTIG): {clf.score(X_test, y_test):.3f}")
print("Scaler fit-et KUN på X_train → ærlig estimat.")`}
              />
              <p className="text-xs text-emerald-400/80 mt-2">
                Scaler-en lærer parametrene KUN fra X_train.
              </p>
            </div>
          </div>
        </Section>

        <Section number="7" id="interactive-scale" title="Interaktiv: før og etter skalering">
          <p className="text-sm text-muted-foreground mb-3">
            Slå skalering av og på. Legg merke til hvordan punktene
            blir <em>sentrert</em> og at variasjonen blir lik i begge akser etter
            skalering — perfekt for avstandsbaserte modeller.
          </p>
          <ScalingDemo />
        </Section>

        <Section number="8" id="interactive-leak" title="Interaktiv: datalekkasje-knapp">
          <p className="text-sm text-muted-foreground mb-3">
            Samme datasett, to scenarier: skalér <em>før</em> split (lekker) vs
            etter (riktig). Kjør 200 simuleringer og se hvor mye lekkasjen
            inflaterer test-accuracy.
          </p>
          <LeakageDemo />
        </Section>
              <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2602" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til DTE-2602-hub
          </Link>
        </div>
</div>
    </StackPageShell>
  );
}

function Section({
  number,
  id,
  title,
  children,
}: {
  number: string;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-xl font-semibold mb-3">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}

/* ---------- Visual: Scaling før/etter ---------- */

const RAW_POINTS = [
  [180, 32],
  [165, 28],
  [190, 45],
  [172, 35],
  [155, 22],
  [178, 30],
  [185, 40],
  [168, 27],
  [195, 50],
  [160, 25],
  [183, 38],
  [170, 29],
];

function scale(points: number[][]): number[][] {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  const sx = Math.sqrt(xs.reduce((s, v) => s + (v - mx) ** 2, 0) / xs.length);
  const sy = Math.sqrt(ys.reduce((s, v) => s + (v - my) ** 2, 0) / ys.length);
  return points.map(([x, y]) => [(x - mx) / sx, (y - my) / sy]);
}

function Plot({
  points,
  title,
  xLabel,
  yLabel,
  range,
}: {
  points: number[][];
  title: string;
  xLabel: string;
  yLabel: string;
  range: { xMin: number; xMax: number; yMin: number; yMax: number };
}) {
  const W = 260;
  const H = 220;
  const PAD = 30;
  const sx = (x: number) =>
    PAD + ((x - range.xMin) / (range.xMax - range.xMin)) * (W - 2 * PAD);
  const sy = (y: number) =>
    H - PAD - ((y - range.yMin) / (range.yMax - range.yMin)) * (H - 2 * PAD);
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-xs font-semibold mb-1">{title}</div>
      <svg width={W} height={H} className="block">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#888" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#888" />
        {points.map(([x, y], i) => (
          <circle key={i} cx={sx(x)} cy={sy(y)} r={4} fill="#3b82f6" opacity={0.8} />
        ))}
        <text x={W / 2} y={H - 8} textAnchor="middle" fontSize={10} fill="#888">
          {xLabel}
        </text>
        <text
          x={10}
          y={H / 2}
          textAnchor="middle"
          fontSize={10}
          fill="#888"
          transform={`rotate(-90, 10, ${H / 2})`}
        >
          {yLabel}
        </text>
      </svg>
    </div>
  );
}

function ScalingDemo() {
  const [scaled, setScaled] = useState(false);
  const points = scaled ? scale(RAW_POINTS) : RAW_POINTS;
  const range = scaled
    ? { xMin: -2.5, xMax: 2.5, yMin: -2.5, yMax: 2.5 }
    : { xMin: 150, xMax: 200, yMin: 20, yMax: 55 };
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <button
          className={`px-3 py-1.5 text-xs rounded ${
            scaled ? "bg-muted text-muted-foreground" : "bg-brand text-brand-foreground"
          }`}
          onClick={() => setScaled(false)}
        >
          Rå
        </button>
        <button
          className={`px-3 py-1.5 text-xs rounded ${
            scaled ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
          }`}
          onClick={() => setScaled(true)}
        >
          Etter StandardScaler
        </button>
      </div>
      <div className="flex justify-center">
        <Plot
          points={points}
          title={scaled ? "Skalert (mean=0, std=1)" : "Rå data"}
          xLabel={scaled ? "høyde (skalert)" : "høyde (cm)"}
          yLabel={scaled ? "BMI (skalert)" : "BMI"}
          range={range}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Etter skalering ligger alle punkter i ca [-2, 2] i begge akser — ingen
        feature dominerer lenger på grunn av sin opprinnelige enhet.
      </p>
    </div>
  );
}

/* ---------- Visual: Datalekkasje-simulering ---------- */

function syntheticDataset(n = 80, seed = 42) {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const X: number[][] = [];
  const y: number[] = [];
  for (let i = 0; i < n; i++) {
    const f1 = rand() * 1000;
    const f2 = rand();
    const cls = f1 + f2 * 500 > 600 ? 1 : 0;
    X.push([f1, f2]);
    y.push(cls);
  }
  return { X, y };
}

function knnAccuracy(
  Xtr: number[][],
  ytr: number[],
  Xte: number[][],
  yte: number[],
  k = 5,
): number {
  let correct = 0;
  for (let i = 0; i < Xte.length; i++) {
    const dists = Xtr.map((p, j) => {
      let d = 0;
      for (let f = 0; f < p.length; f++) d += (p[f] - Xte[i][f]) ** 2;
      return { d, label: ytr[j] };
    });
    dists.sort((a, b) => a.d - b.d);
    const top = dists.slice(0, k);
    const sum = top.reduce((s, x) => s + x.label, 0);
    const pred = sum > k / 2 ? 1 : 0;
    if (pred === yte[i]) correct++;
  }
  return correct / Xte.length;
}

function scaleWithStats(X: number[][], stats: { m: number[]; s: number[] }): number[][] {
  return X.map((row) => row.map((v, j) => (v - stats.m[j]) / (stats.s[j] || 1)));
}

function fitScaler(X: number[][]): { m: number[]; s: number[] } {
  const d = X[0].length;
  const m = new Array(d).fill(0);
  const s = new Array(d).fill(0);
  for (let j = 0; j < d; j++) {
    for (const r of X) m[j] += r[j];
    m[j] /= X.length;
  }
  for (let j = 0; j < d; j++) {
    for (const r of X) s[j] += (r[j] - m[j]) ** 2;
    s[j] = Math.sqrt(s[j] / X.length);
  }
  return { m, s };
}

function trainTestSplit<T extends unknown[]>(X: T[], y: number[], frac: number, seed: number) {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const idx = X.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const k = Math.floor(idx.length * frac);
  const trainI = idx.slice(0, k);
  const testI = idx.slice(k);
  return {
    Xtr: trainI.map((i) => X[i]) as T[],
    ytr: trainI.map((i) => y[i]),
    Xte: testI.map((i) => X[i]) as T[],
    yte: testI.map((i) => y[i]),
  };
}

function LeakageDemo() {
  const result = useMemo(() => {
    let goodSum = 0;
    let leakSum = 0;
    const N = 80;
    for (let trial = 0; trial < 50; trial++) {
      const { X, y } = syntheticDataset(N, 100 + trial);
      // FEIL: skaler hele datasettet (med test-radene inkludert)
      const fullStats = fitScaler(X);
      const Xfull = scaleWithStats(X, fullStats);
      const leakSplit = trainTestSplit(Xfull, y, 0.7, 200 + trial);
      leakSum += knnAccuracy(
        leakSplit.Xtr as number[][],
        leakSplit.ytr,
        leakSplit.Xte as number[][],
        leakSplit.yte,
      );
      // RIKTIG: split først, scaler fit på TRAIN
      const split = trainTestSplit(X, y, 0.7, 200 + trial);
      const trainStats = fitScaler(split.Xtr as number[][]);
      const XtrS = scaleWithStats(split.Xtr as number[][], trainStats);
      const XteS = scaleWithStats(split.Xte as number[][], trainStats);
      goodSum += knnAccuracy(XtrS, split.ytr, XteS, split.yte);
    }
    return {
      leakAcc: leakSum / 50,
      goodAcc: goodSum / 50,
    };
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/5 p-4">
          <div className="text-xs uppercase tracking-wider text-rose-400 font-semibold mb-2">
            FEIL (skalér FØR split)
          </div>
          <div className="text-3xl font-bold tracking-tight text-rose-300">
            {(result.leakAcc * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Test-accuracy — kunstig høy fordi scaler-en har sett test-radene.
          </div>
        </div>
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-4">
          <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-2">
            RIKTIG (split først)
          </div>
          <div className="text-3xl font-bold tracking-tight text-emerald-300">
            {(result.goodAcc * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Test-accuracy — ærlig estimat på hva modellen vil prestere ute.
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Snitt over 50 simuleringer på et syntetisk binært datasett (n=80). Forskjellen
        her er ofte 1–4 prosentpoeng — nok til å lure deg til å velge feil hyperparametre.
      </p>
    </div>
  );
}
