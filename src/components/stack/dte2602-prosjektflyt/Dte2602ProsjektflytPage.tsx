import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Forstå problemet", anchor: "forstaa" },
  { title: "Hent data", anchor: "data" },
  { title: "EDA — utforsk dataene", anchor: "eda" },
  { title: "Feature engineering", anchor: "features" },
  { title: "Tren modell", anchor: "tren" },
  { title: "Evaluér modell", anchor: "evaluer" },
  { title: "Deploy & vedlikehold", anchor: "deploy" },
  { title: "Eksempel: Titanic ende-til-ende", anchor: "titanic" },
  { title: "Slik strukturerer du mappe-oppgaven", anchor: "mappe" },
];

export function Dte2602ProsjektflytPage() {
  return (
    <StackPageShell title="DTE-2602 · ML-prosjekt fra A til Å" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Prosjekt-arbeidsflyt
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            ML-prosjekt fra A til Å — CRISP-DM i praksis
          </h1>
          <p className="mt-3 text-muted-foreground">
            Alle ML-prosjekter — fra en innleveringsoppgave til Google sin
            anbefalingsmotor — følger den samme 7-stegs flyten. Lær den utenat
            slik at du kan bruke energi på det som faktisk varierer:
            algoritme-valg og evaluering.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Praktisk:</span>{" "}
              Du kan kjøre Iris-prosjektet ende-til-ende på{" "}
              <Link to="/prosjekt-ml/$slug" params={{ slug: "iris-klassifisering" }} className="text-brand hover:underline">
                /prosjekt-ml/iris-klassifisering
              </Link>
              {" "}— det er denne flyten implementert.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2602-prosjektflyt" steps={STEPS} />

        <section id="forstaa" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Forstå problemet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Før du skriver én linje kode: skriv ned hva du faktisk skal predikere.
            Dette er forskjellen mellom et nyttig prosjekt og et flott men ubrukelig.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Spørsmål du MÅ svare på før alt annet:

1. Hva er y? (Hva skal modellen predikere?)
   → regresjon (kontinuerlig tall) eller klassifikasjon (kategori)?

2. Hva er X? (Hvilke features har vi tilgang til VED PREDIKSJONSTID?)
   → fail mode: bruke en feature som faktisk er en del av y

3. Hvem er brukeren og hvilken handling tas?
   → en prediksjon uten en beslutning er gratis underholdning

4. Hvilken feil koster mest?
   → false positive (spam-filter sletter viktig mail)
   → false negative (svindel slipper gjennom)
   → for klassifikasjon: påvirker valg av terskel og metrikk

5. Suksess-kriterium?
   → "accuracy > 95%" eller "5× bedre enn å gjette median"
   → noter det FØR du har sett resultatene — ellers flytter du målet`}</pre>
          </div>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-600 dark:text-amber-400">Vanlig felle:</strong>{" "}
            «Predikér om et bygg har skader» når du bare har data fra bygg som ALLEREDE
            er besiktiget = seleksjonsskjevhet. Modellen lærer om besiktigelse, ikke om skade.
          </div>
        </section>

        <section id="data" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Hent data</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Datakvalitet trumfer alltid algoritme-valg. 80 % av tiden i et ekte
            prosjekt går her — derfor finner du det også som første bom hos studenter
            som glemmer å sjekke.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Sjekkliste — etter du har lastet inn:

  df.shape           # hvor mange rader/kolonner?
  df.head()          # første 5 rader — ser det riktig ut?
  df.info()          # datatyper + non-null count
  df.describe()      # statistikk for tall-kolonner
  df.isna().sum()    # NaN per kolonne
  df.duplicated().sum()  # duplikater?

Konkrete spørsmål:
  - er fag-id en numerisk kode som ble lest som tall?
  - er datoer parset som strenger?
  - er kategoriske felt riktig kodet (M/K vs 0/1)?
  - er én feature praktisk talt konstant (variance ≈ 0)?

Vanlige kilder for klasse-øvinger:
  sklearn.datasets    — innebygd (Iris, digits, wine, breast_cancer)
  seaborn-datasets    — Titanic, tips
  Kaggle / UCI        — eksterne CSV-er
  pd.read_csv("x.csv")`}</pre>
          </div>
        </section>

        <section id="eda" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. EDA — utforsk dataene</h2>
          <p className="text-sm text-muted-foreground mb-4">
            EDA (Exploratory Data Analysis) er der du faktisk LÆRER hva dataene
            sier — før noen modell. Forventes dokumentert i en mappe-oppgave.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Visualiserings-pakka du bruker mest:

import matplotlib.pyplot as plt
import seaborn as sns

# 1. Distribusjon per feature
df.hist(bins=30, figsize=(12, 8))

# 2. Sammenheng mellom features
sns.pairplot(df, hue="klasse")    # diagonalen = histogrammer, off-diagonal = scatter

# 3. Korrelasjonsmatrise — finn redundante features
sns.heatmap(df.corr(numeric_only=True), annot=True, cmap="coolwarm")

# 4. Klassebalanse — kritisk for klassifikasjon
df["target"].value_counts().plot(kind="bar")

# 5. Outliers
df.boxplot(column=["feature1", "feature2"], figsize=(8, 4))`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Hva ser du etter:</strong> skjeve fordelinger (kanskje log-transformer),
            korrelerte features (kanskje slett én), klasse-ubalanse (kanskje stratified split
            + andre metrikker enn accuracy), åpenbare outliers (kanskje fjern, eller bruk
            robust modell).
          </p>
        </section>

        <section id="features" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Feature engineering</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ofte den enkleste måten å øke modellens ytelse: gi den BEDRE features.
            En enkel modell på gode features slår en kompleks modell på rå features.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Typiske operasjoner:

# Skalering — kritisk for kNN, SVM, logistisk regresjon (ikke trær)
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s  = scaler.transform(X_test)   # IKKE fit_transform på test!

# Kategoriske features → tall
from sklearn.preprocessing import OneHotEncoder
ohe = OneHotEncoder(sparse_output=False, handle_unknown="ignore")

# Missing values
from sklearn.impute import SimpleImputer
imp = SimpleImputer(strategy="median")

# Bruk Pipeline + ColumnTransformer for å unngå data-lekkasje:
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer

preprocess = ColumnTransformer([
    ("num", StandardScaler(), num_cols),
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
])
pipe = Pipeline([("prep", preprocess), ("model", LogisticRegression())])`}</pre>
          </div>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-600 dark:text-amber-400">Den klassiske lekkasjen:</strong>{" "}
            <code>scaler.fit(X)</code> på <em>hele</em> X før split. Da har test-settet
            «sett» statistikken fra train, og dine metrikker blir optimistiske. Fit kun på
            train; transform på begge.
          </div>
        </section>

        <section id="tren" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Tren modell</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Det enkleste steget — men det er ikke der du skal bruke mest tid.
            Start med en baseline, så prøv 2-3 algoritmer.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Steg 1: split
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y    # stratify for klassif.
)

# Steg 2: baseline — alltid
from sklearn.dummy import DummyClassifier
baseline = DummyClassifier(strategy="most_frequent")
baseline.fit(X_train, y_train)
print("Baseline:", baseline.score(X_test, y_test))

# Steg 3: prøv flere algoritmer
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier

models = {
    "logreg": LogisticRegression(max_iter=1000),
    "knn":    KNeighborsClassifier(n_neighbors=5),
    "rf":     RandomForestClassifier(n_estimators=100, random_state=42),
}
for navn, m in models.items():
    m.fit(X_train, y_train)
    print(navn, "test acc =", round(m.score(X_test, y_test), 3))`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>random_state=42:</strong> bruk samme seed gjennom hele prosjektet så
            resultatene er reproduserbare. Sensor skal kunne kjøre koden din og se
            samme tall.
          </p>
        </section>

        <section id="evaluer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Evaluér modell</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Accuracy er sjelden alt — særlig på ubalanserte datasett. Vis flere
            metrikker. Lær mer i{" "}
            <Link to="/stack/$slug" params={{ slug: "dte2602-evaluering-metoder" }} className="text-brand hover:underline">
              evaluering &amp; eksperiment-design
            </Link>.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report,
)

y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))
print(confusion_matrix(y_test, y_pred))

# Robustere — cross-validation
from sklearn.model_selection import cross_val_score
scores = cross_val_score(model, X_train, y_train, cv=5, scoring="f1_macro")
print("CV-f1:", scores.mean(), "±", scores.std())`}</pre>
          </div>
        </section>

        <section id="deploy" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Deploy &amp; vedlikehold</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En modell som ikke kan gjenbrukes er ikke ferdig. På bachelor-nivå er
            «deploy» som regel: lagre modellen, dokumentér hvordan man kjører den,
            og noter hvilke datatyper input/output har.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Lagre — joblib er foretrukket fremfor pickle for sklearn-modeller
import joblib
joblib.dump(model, "modell.joblib")

# Laste igjen og predikere på ny data
modell = joblib.load("modell.joblib")
ny_pred = modell.predict(X_ny)

# Husk: hvis du brukte StandardScaler/OneHotEncoder, må du lagre
# HELE PIPELINEN — ikke bare modellen — ellers virker det ikke.
joblib.dump(pipe, "pipeline.joblib")

# Konsept: model drift
# Verden endres → modellens features representerer en virkelighet som
# kan flytte seg. Etter 6 mnd kan ytelsen være halvert. Mål regelmessig.`}</pre>
          </div>
        </section>

        <section id="titanic" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Eksempel: Titanic ende-til-ende</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hele flyten i ett minimalt eksempel. Hver del kan utvides — dette er
            «hello world» for ML-prosjekt.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`import pandas as pd
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

# 1-2. Last data
df = sns.load_dataset("titanic").dropna(subset=["age", "embarked"])
y = df["survived"]
X = df[["pclass", "sex", "age", "sibsp", "parch", "fare", "embarked"]]

# 3. EDA er gjort i notebook over (skipper her)

# 4. Feature engineering — Pipeline gjør den reproducerbart
num_cols = ["age", "fare", "sibsp", "parch", "pclass"]
cat_cols = ["sex", "embarked"]
prep = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer()), ("sc", StandardScaler())]), num_cols),
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
])

# 5. Tren — log reg som baseline
pipe = Pipeline([("prep", prep), ("model", LogisticRegression(max_iter=1000))])
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)
pipe.fit(X_train, y_train)

# 6. Evaluér
print(classification_report(y_test, pipe.predict(X_test)))
print("5-fold CV:", cross_val_score(pipe, X_train, y_train, cv=5).mean())

# 7. Lagre
import joblib; joblib.dump(pipe, "titanic.joblib")`}</pre>
          </div>
        </section>

        <section id="mappe" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Slik strukturerer du mappe-oppgaven</h2>
          <p className="text-sm text-muted-foreground mb-4">
            DTE-2602 har mappevurdering med 2 oppgaver: rapport + programmering.
            Sensor leter etter en gjenkjennbar struktur.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Anbefalt mappe-format:

prosjekt/
├── rapport.pdf           ← maks 8-12 sider, struktur under
├── kode/
│   ├── 01_eda.ipynb      ← utforskning, ren kode + observasjoner
│   ├── 02_modell.ipynb   ← trening, kryss-validering, tuning
│   ├── 03_evaluering.ipynb ← final test + visualiseringer
│   └── utils.py          ← felles hjelpefunksjoner
├── data/                 ← rådata (eller URL hvis stort)
└── README.md             ← hvordan kjøre koden

Rapport-mal:
  1. Innledning              — problem, motivasjon, suksess-kriterium
  2. Data                    — kilde, størrelse, kjente begrensninger
  3. EDA                     — 3-5 nøkkelfigurer + hva de viser
  4. Metode                  — algoritmer prøvd, hvorfor
  5. Eksperimenter           — train/test-design, hyperparameter-søk
  6. Resultater              — tabell med metrikker + diskusjon
  7. Diskusjon & begrensninger — der modellen feiler, etiske aspekter
  8. Konklusjon              — én avsnitt: virket det?
  9. Referanser`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Se{" "}
            <Link to="/stack/$slug" params={{ slug: "dte2602-mappe-mal" }} className="text-brand hover:underline">
              mappe-mal
            </Link>
            {" "}for utfyllende beskrivelse av hver seksjon — inkl. eksempel-headers og
            sensor-feller.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2602-evaluering-metoder" }} className="text-brand hover:underline">
                Evaluering &amp; eksperiment-design
              </Link>
              {" "}— train/val/test, k-fold, metrikker, lekkasje.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
            <li>
              <Link to="/prosjekt-ml/$slug" params={{ slug: "iris-klassifisering" }} className="text-brand hover:underline">
                Kjør Iris-prosjektet
              </Link>
              {" "}— 8 trinn i nettleseren.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
