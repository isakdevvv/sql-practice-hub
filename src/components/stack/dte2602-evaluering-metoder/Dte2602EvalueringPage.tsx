import { Link } from "@tanstack/react-router";
import {ArrowRight, Lightbulb, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Train / val / test — hvorfor 3 sett?", anchor: "splits" },
  { title: "k-fold cross-validation", anchor: "kfold" },
  { title: "Stratifisert split", anchor: "stratified" },
  { title: "Klassifikasjons-metrikker", anchor: "klass-metrikker" },
  { title: "Regresjons-metrikker", anchor: "regr-metrikker" },
  { title: "Confusion matrix — les tabellen", anchor: "confusion" },
  { title: "Hyperparameter-søk", anchor: "tuning" },
  { title: "Lære- og valideringskurver", anchor: "kurver" },
  { title: "Data-lekkasje — hvordan unngå", anchor: "lekkasje" },
];

export function Dte2602EvalueringPage() {
  return (
    <StackPageShell title="DTE-2602 · Evaluering & eksperiment-design" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Evaluering
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Evaluering og eksperiment-design
          </h1>
          <p className="mt-3 text-muted-foreground">
            «Hvordan vet du at modellen er god?» er det viktigste spørsmålet i ML.
            Feil evaluering gir deg modeller som scorer 99 % i papir og bommer
            totalt i prod. Her er rammeverket for å unngå det.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «ML-evaluering» — match metrikk→problem-type, fyll inn cross_val_score-kode.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2602-evaluering-metoder" steps={STEPS} />

        <section id="splits" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Train / val / test — hvorfor 3 sett?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ett sett (alle data) → overfit. To sett (train + test) → du bruker
            test-settet til hyperparameter-tuning og lekker indirekte. Tre sett er
            standard når du har nok data.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Rolle per sett:

  TRAIN   (60-80 %)  — modellen LÆRER (gradient descent, finn vekter)
  VAL     (10-20 %)  — du velger HYPERPARAMETERE her
                       (k i kNN, max_depth i trær, C i SVM)
  TEST    (10-20 %)  — den FINALE estimaten på hva modellen vil gjøre
                       i prod. RØR ALDRI før helt på slutten.

I sklearn:
  X_tmp, X_test, y_tmp, y_test = train_test_split(
      X, y, test_size=0.2, random_state=42, stratify=y)
  X_train, X_val, y_train, y_val = train_test_split(
      X_tmp, y_tmp, test_size=0.25, random_state=42, stratify=y_tmp)
  # 60/20/20 split totalt`}</pre>
          </div>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-600 dark:text-amber-400">Regel:</strong>{" "}
            Hver gang du «kikker» på test-settet for å velge noe, har du brukt det opp.
            Du har ikke lenger et uavhengig estimat — du har et nytt val-sett.
          </div>
        </section>

        <section id="kfold" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. k-fold cross-validation</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Med lite data har du ikke råd til å «kaste bort» 20 % på val.
            k-fold lar deg bruke ALLE train-dataene til validering.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`5-fold cross-validation:

  TRAIN | TRAIN | TRAIN | TRAIN | VAL    → mål metrikk
  TRAIN | TRAIN | TRAIN | VAL   | TRAIN  → mål metrikk
  TRAIN | TRAIN | VAL   | TRAIN | TRAIN  → mål metrikk
  TRAIN | VAL   | TRAIN | TRAIN | TRAIN  → mål metrikk
  VAL   | TRAIN | TRAIN | TRAIN | TRAIN  → mål metrikk
                                            ↓
              gjennomsnitt + std → robust estimat

I sklearn:
  from sklearn.model_selection import cross_val_score
  scores = cross_val_score(model, X_train, y_train,
                           cv=5, scoring="f1_macro")
  print(f"{scores.mean():.3f} ± {scores.std():.3f}")

  # cv=5 er default; cv=10 er også vanlig på lite data`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Når k-fold:</strong> &lt; 10 000 rader, eller når du må sammenligne
            modeller med stor variance. Husk: test-settet er fortsatt urørt — k-fold
            erstatter VAL, ikke TEST.
          </p>
        </section>

        <section id="stratified" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Stratifisert split</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Med klasse-ubalanse (90 % klasse A, 10 % klasse B) kan en tilfeldig split
            gi deg test-sett med 0 B-eksempler. Stratifisert split bevarer klassefordeling.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Uten stratify — risiko ved ubalansert data
train_test_split(X, y, test_size=0.2, random_state=42)

# MED stratify — bevarer klassefordelingen
train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Cross-val har egen stratifisert versjon:
from sklearn.model_selection import StratifiedKFold
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=cv)

# Tidsserie? Ikke stratify — bruk TimeSeriesSplit slik at val/test alltid
# kommer ETTER train i tid (ellers «predikerer du fortiden»).`}</pre>
          </div>
        </section>

        <section id="klass-metrikker" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Klassifikasjons-metrikker</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Accuracy lyver på ubalanserte datasett. Vis flere metrikker.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Accuracy
              </div>
              <p className="text-sm text-foreground mb-2">
                <code>(TP + TN) / total</code> — andel riktige.
              </p>
              <p className="text-xs text-muted-foreground">
                Brukbar når klassene er balanserte og feilene er like dyre. Bommer
                hardt på ubalanse: 99 % accuracy på et 99 / 1-datasett er trivielt.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Precision
              </div>
              <p className="text-sm text-foreground mb-2">
                <code>TP / (TP + FP)</code> — av de jeg sa «positiv», hvor mange var det?
              </p>
              <p className="text-xs text-muted-foreground">
                Viktig når false positives koster (spam-filter sletter viktig mail,
                tollkontroll stopper uskyldige).
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Recall (Sensitivity)
              </div>
              <p className="text-sm text-foreground mb-2">
                <code>TP / (TP + FN)</code> — av alle de FAKTISKE positive, hvor mange fanget jeg?
              </p>
              <p className="text-xs text-muted-foreground">
                Viktig når false negatives koster (kreftscreening, svindeldeteksjon).
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                F1-score
              </div>
              <p className="text-sm text-foreground mb-2">
                <code>2 · (P · R) / (P + R)</code> — harmonisk gjennomsnitt.
              </p>
              <p className="text-xs text-muted-foreground">
                God default når begge feilene betyr noe. f1_macro = ulikvektet snitt
                over klasser (bra på ubalanse). f1_weighted = vektet med klassestørrelse.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 sm:col-span-2">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                ROC-AUC
              </div>
              <p className="text-sm text-foreground mb-2">
                Areal under ROC-kurven (TPR vs FPR over alle terskler).
              </p>
              <p className="text-xs text-muted-foreground">
                1.0 = perfekt, 0.5 = tilfeldig. Måler hvor godt modellen rangerer
                positive over negative — IKKE påvirket av klassebalanse.
                Krever <code>predict_proba</code>.
              </p>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.metrics import classification_report, roc_auc_score

y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))
# precision, recall, f1, support per klasse + macro/weighted avg

y_proba = model.predict_proba(X_test)[:, 1]   # sannsynlighet for klasse 1
print("ROC-AUC:", roc_auc_score(y_test, y_proba))`}</pre>
          </div>
        </section>

        <section id="regr-metrikker" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Regresjons-metrikker</h2>
          <p className="text-sm text-muted-foreground mb-4">
            For kontinuerlig y bruker vi avstands- eller variansmål.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`MAE  — Mean Absolute Error
     mean(|y - ŷ|)
     Tolkning: «modellen bommer i snitt med X enheter»
     Robust mot outliers (lineær straff).

MSE  — Mean Squared Error
     mean((y - ŷ)²)
     Straff vokser kvadratisk → store feil teller hardt.
     Brukes i loss-funksjoner mer enn rapportering.

RMSE — Root Mean Squared Error
     sqrt(MSE)
     Samme enhet som y. Mest brukt i rapportering.

R²   — Forklart varians
     1 - (SS_res / SS_tot)
     1.0 = perfekt, 0.0 = like god som å gjette gjennomsnittet,
     negativ = verre enn å gjette gjennomsnittet.

I sklearn:
  from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
  import numpy as np
  print("MAE :", mean_absolute_error(y_test, y_pred))
  print("RMSE:", np.sqrt(mean_squared_error(y_test, y_pred)))
  print("R²  :", r2_score(y_test, y_pred))`}</pre>
          </div>
        </section>

        <section id="confusion" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Confusion matrix — les tabellen</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Den enkleste, viktigste figuren i en klassifikasjons-rapport. Sensor
            forventer å se den.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Binær klassifikasjon (positiv = 1):

                  PREDIKERT 0   PREDIKERT 1
   FAKTISK 0       TN            FP           ← falsk positiv
   FAKTISK 1       FN            TP           ← falsk negativ
                   ↑             ↑
                falsk-           riktig-
                negativ          positiv

Beregne for hånd fra matrisen [[TN, FP], [FN, TP]]:
  precision = TP / (TP + FP)
  recall    = TP / (TP + FN)
  accuracy  = (TN + TP) / (TN + FP + FN + TP)

I sklearn (eksempel-figur):
  from sklearn.metrics import ConfusionMatrixDisplay
  ConfusionMatrixDisplay.from_predictions(y_test, y_pred,
                                          display_labels=["A", "B"],
                                          cmap="Blues")

For multi-klasse: NxN-matrise. Sjekk diagonalen — det er der modellen treffer.
Off-diagonal = forveksling: «kalla setosa for versicolor 3 ganger».`}</pre>
          </div>
        </section>

        <section id="tuning" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Hyperparameter-søk</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Algorithmer har hyperparametere som du ikke lærer fra data — du må prøve
            dem. To strategier dekker 99 % av casene.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                GridSearchCV
              </div>
              <p className="text-sm text-foreground mb-2">
                Prøv ALLE kombinasjoner i et rutenett.
              </p>
              <pre className="mt-2 font-mono text-xs rounded bg-background border border-border p-2 overflow-x-auto whitespace-pre">{`from sklearn.model_selection \\
    import GridSearchCV

param_grid = {
    "n_neighbors": [3, 5, 7, 9, 11],
    "weights": ["uniform", "distance"],
}
gs = GridSearchCV(KNeighborsClassifier(),
                  param_grid, cv=5,
                  scoring="f1_macro")
gs.fit(X_train, y_train)
print(gs.best_params_, gs.best_score_)`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                RandomizedSearchCV
              </div>
              <p className="text-sm text-foreground mb-2">
                Sample tilfeldige kombinasjoner. Bedre for store rom.
              </p>
              <pre className="mt-2 font-mono text-xs rounded bg-background border border-border p-2 overflow-x-auto whitespace-pre">{`from sklearn.model_selection \\
    import RandomizedSearchCV
from scipy.stats import uniform

dist = {
    "C": uniform(0.01, 100),
    "kernel": ["linear", "rbf"],
}
rs = RandomizedSearchCV(SVC(), dist,
                        n_iter=30, cv=5,
                        random_state=42)
rs.fit(X_train, y_train)`}</pre>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Praktisk regel:</strong> &lt; 100 kombinasjoner → grid. Større → random.
            For svært store rom: Bayesian optimization (optuna, scikit-optimize).
          </p>
        </section>

        <section id="kurver" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Lære- og valideringskurver</h2>
          <p className="text-sm text-muted-foreground mb-4">
            To diagnose-plots som forteller deg HVA modellen sliter med.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Læringskurve: ytelse vs antall train-eksempler

  train_score (HØY) ─────────────  ←  modellen lærer train godt
                   │
  val_score          ──────────    ←  gap = generaliseringsfeil
                  │
  → STORT GAP = overfitting (modellen er for kompleks for data-mengden)
  → BÅDE LAVE = underfitting (modellen er for enkel — bytte algoritme)

Valideringskurve: ytelse vs en hyperparameter (f.eks. max_depth)

  score                ╭─────╮      ←  val topp =
        train ─────╯  ╯       ╲        optimalt max_depth
                ╯              ╲
        val   ─────╯            ╲
                                  ╲   ← her overfit modellen
        max_depth → 1 2 3 4 5 6 7 8 9 10

I sklearn:
  from sklearn.model_selection import learning_curve, validation_curve`}</pre>
          </div>
        </section>

        <section id="lekkasje" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Data-lekkasje — hvordan unngå</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Lekkasje er det vanligste alvorlige feilen i ML-prosjekter. Resultatet
            ser fantastisk ut, men modellen feiler i prod.
          </p>
          <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Tre typer lekkasje du må passe på:

1. SCALER-LEKKASJE
   scaler.fit(X)                # ← FEIL — X inneholder test
   X_train, X_test = split(X)

   Riktig:
   X_train, X_test = split(X)
   scaler.fit(X_train)          # fit KUN på train
   X_train_s = scaler.transform(X_train)
   X_test_s  = scaler.transform(X_test)

   Bedre: Pipeline — gjør det umulig å bomme.

2. TARGET-LEKKASJE
   En feature inneholder informasjon om y som ikke ville
   vært tilgjengelig ved prediksjonstid.
   F.eks. "antall dager innlagt" når du predikerer "innleggelse".
   Sjekk: er denne featuren MULIG å observere FØR y?

3. TIDSLEKKASJE
   Vanlig train_test_split blander tidsperioder.
   Modellen lærer å bruke fremtiden til å predikere fortiden.
   Riktig: TimeSeriesSplit eller manuell split etter dato.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Røyk-test for lekkasje:</strong> hvis modellen din scorer urealistisk
            bra (99 % på en oppgave som vanligvis ligger på 70 %), MISTANKEN er lekkasje.
            Tilbake til feature-listen og spør «kunne jeg observert dette FØR y skjedde?».
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2602-prosjektflyt" }} className="text-brand hover:underline">
                Prosjekt-arbeidsflyt
              </Link>
              {" "}— hvor passer evaluering inn i flyten.
            </li>
            <li>
              <Link to="/prosjekt-ml/$slug" params={{ slug: "iris-klassifisering" }} className="text-brand hover:underline">
                Iris-klassifisering
              </Link>
              {" "}— prøv GridSearchCV + confusion matrix i nettleser.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
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
