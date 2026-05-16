import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hva ML faktisk er", anchor: "hva" },
  { title: "Tre paradigmer — supervised, unsupervised, RL", anchor: "paradigmer" },
  { title: "Data og features", anchor: "data" },
  { title: "Train / Val / Test split", anchor: "split" },
  { title: "Overfitting og underfitting", anchor: "fitting" },
  { title: "Bias-variance trade-off", anchor: "bias-variance" },
  { title: "Evaluering — riktige metrikker", anchor: "evaluering" },
  { title: "Vanlige feller", anchor: "feller" },
];

export function MlGrunnlagPage() {
  return (
    <StackPageShell title="ML-grunnlag" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2602 · Rammeverk
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            ML-grunnlag — språket og fellestrekkene
          </h1>
          <p className="mt-3 text-muted-foreground">
            Før vi velger algoritme: hva ER maskinlæring, hva er forskjellen på
            train/val/test, og hvordan vet vi om en modell faktisk er god? Dette er
            rammeverket alle algoritmene kommer til å henvise tilbake til.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «ML-grunnlag» — match metrikk til problem, quiz om overfitting,
              sortér ML-pipeline-steg.
            </div>
          </div>
        </div>

        <CourseOutline courseId="ml-grunnlag" steps={STEPS} />

        <section id="hva" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva ML faktisk er</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tradisjonell programmering: <strong>du skriver reglene</strong>, datamaskinen
            anvender dem. Maskinlæring: <strong>du gir data</strong>, datamaskinen finner
            reglene selv (vi kaller dem en «modell»).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Tradisjonell programmering:
  data + REGLER  ──►  program  ──►  output

Maskinlæring:
  data + OUTPUT  ──►  trening  ──►  REGLER (modellen)

Senere:
  ny data + REGLER  ──►  prediksjon`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Mathematisk: ML er funksjonsapproksimasjon. Vi har en ukjent funksjon{" "}
            <code>f(x) = y</code>, og vi prøver å bygge en ̂f som er så lik f som mulig
            ved å vise ̂f mange (x, y)-eksempler.
          </p>
        </section>

        <section id="paradigmer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Tre paradigmer</h2>
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Supervised learning
              </div>
              <p className="text-sm text-foreground mb-2">
                <strong>Du har x og y.</strong> Lær f slik at f(x) ≈ y.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5">
                <li><strong>Regresjon:</strong> y er kontinuerlig (pris, temperatur)</li>
                <li><strong>Klassifikasjon:</strong> y er en kategori (spam/ikke spam)</li>
                <li>Algoritmer: lineær regresjon, kNN, decision tree, SVM, neural net</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Unsupervised learning
              </div>
              <p className="text-sm text-foreground mb-2">
                <strong>Du har bare x.</strong> Finn struktur i dataen.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5">
                <li><strong>Klustering:</strong> grupper like datapunkter (k-means)</li>
                <li><strong>Dim-reduksjon:</strong> komprimere features (PCA)</li>
                <li><strong>Anomalydeteksjon:</strong> finn det som skiller seg ut</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Reinforcement learning
              </div>
              <p className="text-sm text-foreground mb-2">
                <strong>Agent som tar handlinger i en miljø</strong> og lærer av belønning.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5">
                <li>Spillalgoritmer (AlphaGo), robotikk, anbefalingssystemer</li>
                <li>Algoritmer: Q-learning, policy gradient, actor-critic</li>
                <li>I dette kurset: bare intro-nivå</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="data" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Data og features</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Datakvalitet er det viktigste for modellytelse. «Garbage in, garbage out» —
            den mest avanserte algoritmen kan ikke fikse dårlige data.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Vanlig data-struktur
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`X (features)       y (label)
+──+──+───+        +──+
│ 1│ 5│ 12│        │ 0│   ← rad 1 = ett datapunkt (sample)
│ 2│ 3│ 11│        │ 1│
│ 5│ 9│ 14│        │ 1│
│ 3│ 1│  8│        │ 0│
+──+──+───+        +──+
  feature 1, 2, 3      target

X.shape = (n_samples, n_features) = (4, 3)
y.shape = (n_samples,) = (4,)`}</pre>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-lg border border-border bg-card p-4">
              <strong className="text-foreground">Numeriske features</strong> — skalér til samme range. StandardScaler (z-score) eller MinMaxScaler.
              Algoritmer som kNN, SVM og NN er svært følsomme for skala.
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <strong className="text-foreground">Kategoriske features</strong> — encode til tall. One-hot encoding (n kolonner for n kategorier),
              eller label encoding (én kolonne med 0, 1, 2, ...). Sistnevnte BARE hvis det er ordinalt.
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <strong className="text-foreground">Manglende verdier (NaN)</strong> — fyll inn (med snitt/median/mode), eller dropp raden hvis det er få.
              Sklearn sin SimpleImputer gjør jobben.
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <strong className="text-foreground">Outliers</strong> — sjekk om de er målefeil eller ekte. Robust skalering eller fjerning kan hjelpe.
            </div>
          </div>
        </section>

        <section id="split" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Train / Val / Test split</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Du må vurdere modellen på data den ALDRI har sett. Ellers er evaluasjonen
            verdiløs — som å lære for eksamen ved å pugge fasiten.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`+────────────────────+────────+────────+
│   TRAIN (60-70%)   │ VAL    │ TEST   │
│   tren modellen    │ tuning │ final  │
+────────────────────+────────+────────+
                      (15-20%) (15-20%)

Eller med cross-validation (k-fold):
  TRAIN deles i k folder. Loop:
    - tren på k-1 folder, valider på 1
    - bytt val-fold, gjenta
  Resultat: gjennomsnitt over k val-scores`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Stratifisering:</strong> for klassifikasjon, bruk{" "}
            <code>stratify=y</code> i train_test_split. Det sikrer at klassefordelingen
            er lik i train og test — viktig ved ubalanserte datasett.
          </p>
        </section>

        <section id="fitting" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Overfitting og underfitting</h2>
          <p className="text-sm text-muted-foreground mb-4">
            De to feilmodusene som dominerer ML-prosjekter.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5">
              <div className="text-xs uppercase tracking-wider text-destructive font-semibold mb-2">
                Underfitting
              </div>
              <p className="text-sm text-foreground mb-2">
                Modellen er FOR ENKEL. Klarer ikke å fange mønsteret engang i treningsdata.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5">
                <li>Lav train-score OG lav test-score</li>
                <li>Eks: lineær modell på ikke-lineær data</li>
                <li>Fiks: mer kompleks modell, flere features</li>
              </ul>
            </div>
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5">
              <div className="text-xs uppercase tracking-wider text-destructive font-semibold mb-2">
                Overfitting
              </div>
              <p className="text-sm text-foreground mb-2">
                Modellen har MEMORERT treningsdata, inkludert støy. Generaliserer dårlig.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5">
                <li>HØY train-score, LAV test-score (gap)</li>
                <li>Eks: decision tree med ubegrenset dybde</li>
                <li>Fiks: regularisering, mer data, dropout, enklere modell</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Visuelt
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Test-error
   │   underfit    sweet spot     overfit
   │      ▲            ▼           ▲
   │      .            .           .
   │      .       train  .         .
   │       .       ___...........  .
   │        ...../             .   .
   │           ./               .  .....
   │       ___/                  .......
   │                               .  test
   └──────────────────────────────────────►
       lavere kompleksitet   høyere`}</pre>
          </div>
        </section>

        <section id="bias-variance" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Bias-variance trade-off</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Total feil = bias² + variance + irreducible noise. Du kan ikke nullstille
            begge — å redusere én øker som regel den andre.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Komponent</th>
                  <th className="text-left font-semibold px-4 py-2">Betyr</th>
                  <th className="text-left font-semibold px-4 py-2">Symptom</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Høy bias</td><td className="px-4 py-3 text-muted-foreground">Modellen er for enkel — kan ikke fange mønsteret</td><td className="px-4 py-3 text-muted-foreground">Underfitting</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Høy variance</td><td className="px-4 py-3 text-muted-foreground">Modellen er for sensitiv til treningsdata</td><td className="px-4 py-3 text-muted-foreground">Overfitting</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Irreducible noise</td><td className="px-4 py-3 text-muted-foreground">Tilfeldighet i selve dataen</td><td className="px-4 py-3 text-muted-foreground">Kan ikke fjernes</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Praktisk:</strong> begynn med enkel modell (høy bias, lav variance),
            øk kompleksitet til val-error slutter å falle. Det er sweet spot.
          </p>
        </section>

        <section id="evaluering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Evaluering — riktige metrikker</h2>
          <p className="text-sm text-muted-foreground mb-4">
            «Accuracy» er ikke alltid riktig metrikk. Velg ut fra problemet.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Klassifikasjon — confusion matrix
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`               Predikert:
               Positiv    Negativ
Faktisk: ─────────────────────────
Positiv │  TP        FN        │
Negativ │  FP        TN        │
        └─────────────────────────

Accuracy  = (TP + TN) / total          ← naive — feiler ved ubalanse
Precision = TP / (TP + FP)             ← "hvor mye jeg sa positiv var positiv?"
Recall    = TP / (TP + FN)             ← "hvor mye av positivene fant jeg?"
F1        = 2 * P*R / (P+R)            ← harmonisk gjennomsnitt`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Når velger du hva?
            </div>
            <ul className="space-y-1.5 text-sm text-foreground list-disc pl-5">
              <li><strong>Accuracy:</strong> balanserte klasser, like kostnader for FP og FN</li>
              <li><strong>Precision høyt:</strong> spam-detektor — du vil ikke kalle legitim mail spam (lav FP)</li>
              <li><strong>Recall høyt:</strong> kreft-screening — du vil ikke MISSE en syk pasient (lav FN)</li>
              <li><strong>F1:</strong> balanse mellom precision og recall</li>
              <li><strong>ROC-AUC:</strong> rangerings-kvalitet uavhengig av threshold</li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Regresjon
            </div>
            <ul className="space-y-1.5 text-sm text-foreground list-disc pl-5">
              <li><strong>MAE</strong> (Mean Absolute Error) — gjennomsnittlig avstand, robust mot outliers</li>
              <li><strong>RMSE</strong> (Root Mean Squared Error) — straffer store feil mer</li>
              <li><strong>R²</strong> — andel av variansen forklart, 0-1 (eller negativ for dårlig modell)</li>
            </ul>
          </div>
        </section>

        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Vanlige feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Data leakage</strong> — informasjon fra test-settet «lekker» inn i
              treningen. Skalér scaler BARE på train, så transformer test. Bruk pipeline.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Tune på test-settet</strong> — du «pugger» test-fasiten. Bruk val-set
              eller cross-validation til hyperparameter-søk.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Ubalanserte klasser</strong> — 99% accuracy høres flott ut, men hvis
              99% av data er negativ-klasse, predikerer en «alltid-negativ» modell 99% riktig.
              Bruk recall, precision, F1, eller resampling.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>For lite data</strong> — mange algoritmer trenger MYE data. Med 100
              datapunkter er du ute i tynnvær. Mer data slår nesten alltid bedre algoritme.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Glemmer å sette random_state</strong> — resultater kan ikke
              reproduseres. Sett alltid <code>random_state=42</code> (eller andre tall) i
              train_test_split og modellene.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : match metrikk til problem, sortér ML-pipeline-steg, quiz om overfitting.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "supervised-learning" }} className="text-brand hover:underline">
                Supervised learning
              </Link>
              : regresjon og klassifikasjon — algoritmene som bruker rammeverket vårt.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
